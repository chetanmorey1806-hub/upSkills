// MySQL connection pool + schema (tables are created on start if missing).
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('./config');

let pool = null;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(160) NOT NULL DEFAULT '',
    role ENUM('admin','student') NOT NULL DEFAULT 'student',
    password_hash VARCHAR(100) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  // every uploaded file (admin material and chat attachments)
  `CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stored_name VARCHAR(80) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    rel_path VARCHAR(700) NULL,
    mime VARCHAR(150) NOT NULL DEFAULT 'application/octet-stream',
    size BIGINT NOT NULL DEFAULT 0,
    uploaded_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (uploaded_by)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  // study material published by the admin: recorded video, photo, PDF, other file or a video link
  `CREATE TABLE IF NOT EXISTS materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kind ENUM('video','photo','pdf','file','link') NOT NULL,
    title VARCHAR(200) NOT NULL,
    note TEXT NULL,
    course VARCHAR(40) NULL,
    lesson VARCHAR(200) NULL,
    file_id INT NULL,
    url VARCHAR(700) NULL,
    created_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (course), INDEX (course, lesson)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    text TEXT NULL,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS chat_attachments (
    message_id INT NOT NULL,
    file_id INT NOT NULL,
    PRIMARY KEY (message_id, file_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

async function init() {
  const { database, ...conn } = config.db;
  // create the database when allowed (ignored if the user lacks the right but the database exists)
  try {
    const c = await mysql.createConnection(conn);
    await c.query(`CREATE DATABASE IF NOT EXISTS \`${database.replace(/`/g, '')}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await c.end();
  } catch (e) { console.warn('Could not create the database (it may already exist):', e.message); }
  pool = mysql.createPool({ ...config.db, waitForConnections: true, connectionLimit: 10, charset: 'utf8mb4', dateStrings: false, timezone: 'Z' });
  // store and read every time in UTC (the browser shows it in the student's local time)
  pool.pool.on('connection', (c) => c.query("SET time_zone = '+00:00'"));
  for (const sql of SCHEMA) await pool.query(sql); // eslint-disable-line no-await-in-loop
  await seedAdmin();
  return pool;
}

async function seedAdmin() {
  const [rows] = await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
  if (rows.length) return;
  const { username, password, name } = config.admin;
  if (!password || password.length < 6) {
    console.warn('No admin account yet. Set ADMIN_USERNAME / ADMIN_PASSWORD (min 6 chars) in server/.env and restart.');
    return;
  }
  await pool.query('INSERT INTO users (username, name, role, password_hash) VALUES (?, ?, ?, ?)', [username, name, 'admin', await bcrypt.hash(password, 10)]);
  console.log(`Admin account "${username}" created.`);
}

const db = () => pool;
module.exports = { init, db };
