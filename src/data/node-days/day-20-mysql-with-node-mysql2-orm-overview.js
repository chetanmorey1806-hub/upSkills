export default {
  id: 'day-20-mysql-with-node-mysql2-orm-overview',
  title: 'MySQL with Node.js (mysql2) and an ORM Overview (Sequelize / Prisma)',
  module: 'Module 3: Databases',
  day: 20,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Many companies run their Node.js APIs on relational databases. Today you connect Express to MySQL with the mysql2 driver – connection pools, prepared statements, JOINs, transactions and error codes – and then see how ORMs like Sequelize and Prisma raise the level of abstraction.',
  objectives: [
    'Compare relational (MySQL) and document (MongoDB) databases and know when to choose each',
    'Connect with mysql2/promise using a connection pool and environment variables',
    'Run safe parameterised queries (execute with ? placeholders) and read insertId / affectedRows',
    'Build an Express 5 CRUD API with JOINs, transactions and MySQL error-code mapping',
    'Understand what an ORM is and read basic Sequelize and Prisma code',
  ],
  theory: [
    {
      heading: 'Relational databases recap: tables, keys and relations',
      content: `A relational database stores data in **tables** with a fixed set of typed **columns**; every **row** is one record. Tables are linked with keys:

- **Primary key** (\`id INT AUTO_INCREMENT PRIMARY KEY\`) – unique identity of a row
- **Foreign key** (\`FOREIGN KEY (student_id) REFERENCES students(id)\`) – the database itself guarantees the referenced row exists (**referential integrity**) and can cascade deletes (\`ON DELETE CASCADE\`)
- **Constraints** – \`NOT NULL\`, \`UNIQUE\`, \`DEFAULT\`, \`CHECK\`
- **Many-to-many** – a junction table (\`enrollments(student_id, course_id)\`)
- **JOIN** – combine rows from several tables in one query

**MySQL vs MongoDB:** MySQL enforces structure and relationships in the database (schema, FKs, ACID transactions everywhere, powerful SQL joins and reporting). MongoDB is flexible and stores nested JSON naturally. Choose MySQL/PostgreSQL for strongly relational data (orders, payments, inventory, HR); MongoDB for flexible, document-shaped data (catalogues, content, logs). Many systems use both.

Analogy: MongoDB is a folder of **forms filled in by hand**; MySQL is a **spreadsheet with locked columns and data validation**, where cross-sheet references cannot point to a missing row.`,
    },
    {
      heading: 'mysql2: connections, pools and the promise API',
      content: `\`mysql2\` is the fastest, most popular MySQL driver for Node (also used under the hood by Sequelize). Install: \`npm install mysql2\`.

- Import the **promise** API: \`require('mysql2/promise')\` so you can \`await\` queries.
- \`mysql.createConnection(config)\` – one connection; fine for scripts.
- \`mysql.createPool(config)\` – a **pool** of reusable connections; use this in servers. Opening a TCP connection + authentication for every request is slow; a pool keeps (e.g.) 10 connections ready and lends one per query.

Every query returns a **[result, fields]** array – destructure the first item:
- SELECT → \`const [rows] = await pool.execute('SELECT ...')\` → array of objects
- INSERT → \`result.insertId\`, \`result.affectedRows\`
- UPDATE/DELETE → \`result.affectedRows\` (0 = nothing matched → 404) and \`changedRows\`

Analogy: a pool is a **taxi stand** – instead of buying a car for every trip, you take a waiting taxi and it returns to the stand afterwards.`,
      syntax: `const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST, port: 3306,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, connectionLimit: 10,
});
const [rows] = await pool.execute('SELECT * FROM students WHERE id = ?', [id]);`,
      tip: 'DECIMAL columns come back as strings ("4999.00") to avoid floating-point loss. Convert with Number() when needed, or set decimalNumbers: true in the pool config.',
    },
    {
      heading: 'SQL injection and prepared statements',
      content: `**Never** build SQL with string concatenation:

\`\`\`js
// ❌ DANGEROUS
pool.query("SELECT * FROM users WHERE email = '" + req.body.email + "'");
// email = "' OR '1'='1"  → returns every user!
\`\`\`

Use **placeholders** – the values are sent separately and can never change the query structure:

\`\`\`js
// ✅ SAFE
pool.execute('SELECT * FROM users WHERE email = ?', [req.body.email]);
\`\`\`

- \`execute()\` uses real server-side **prepared statements** (parsed once, cached, values bound safely).
- \`query()\` does client-side escaping of \`?\` values – also safe – and supports things \`execute\` does not (multi-row \`VALUES ?\` with nested arrays, identifiers with \`??\`).
- Placeholders work for **values** only, not for table/column names or \`ORDER BY\` directions. Whitelist those: \`const sort = ['name', 'city'].includes(q) ? q : 'id'\`.`,
    },
    {
      heading: 'Transactions and error codes',
      content: `A **transaction** groups statements so they ALL succeed (\`COMMIT\`) or NONE do (\`ROLLBACK\`) – ACID. Example: create a student and their enrollments; if one course id is invalid, the student must not be saved either.

With a pool you must use a **single connection** for the whole transaction:

\`\`\`js
const conn = await pool.getConnection();
try {
  await conn.beginTransaction();
  // ... several conn.execute(...)
  await conn.commit();
} catch (err) {
  await conn.rollback();
  throw err;
} finally {
  conn.release();   // forgetting this leaks connections until the pool is exhausted
}
\`\`\`

Common MySQL error codes (\`err.code\`) to map to HTTP:
- \`ER_DUP_ENTRY\` (1062) – UNIQUE violated → **409**
- \`ER_NO_REFERENCED_ROW_2\` (1452) – foreign key target missing → **400**
- \`ER_ROW_IS_REFERENCED_2\` (1451) – cannot delete, rows depend on it → **409**
- \`ER_BAD_FIELD_ERROR\` (1054) – unknown column (a bug) → 500
- \`ECONNREFUSED\` / \`ER_ACCESS_DENIED_ERROR\` – connection/config problems

Note: AUTO_INCREMENT values used by a rolled-back insert are **not** reused – gaps in ids are normal.`,
    },
    {
      heading: 'ORMs: Sequelize and Prisma overview',
      content: `An **ORM (Object-Relational Mapper)** maps tables to classes/objects so you write JavaScript instead of SQL: \`Student.findAll({ where: { city: 'Pune' } })\`. It also handles associations, validation, migrations and portability across databases (MySQL, PostgreSQL, SQLite, SQL Server).

**Sequelize** (mature, JS-first): define models with \`sequelize.define()\` or classes, associations (\`hasMany\`, \`belongsTo\`, \`belongsToMany\`), eager loading with \`include\` (like populate), operators (\`Op.gt\`), hooks, migrations via \`sequelize-cli\`.

**Prisma** (modern, type-safe): you write a \`schema.prisma\` file; \`npx prisma migrate dev\` creates SQL migrations; \`npx prisma generate\` builds a fully typed client: \`prisma.student.findMany({ where: { city: 'Pune' }, include: { courses: true } })\`. Excellent autocomplete with TypeScript; very popular with Next.js.

Others: **TypeORM**, **MikroORM**, **Drizzle** (SQL-like, lightweight) and **Knex** (query builder, not a full ORM).

**Raw driver vs ORM:**
- mysql2: full control, maximum performance, you must know SQL, more boilerplate.
- ORM: faster development, relations and migrations built in, DB-agnostic; but hides SQL (watch for N+1 queries and inefficient generated SQL) and adds a learning curve.
Many teams use an ORM for CRUD and drop to raw SQL for complex reports.`,
      tip: 'Coming next (Day 21): pagination, filtering, sorting and search – for both MongoDB and SQL.',
    },
  ],
  examples: [
    {
      title: 'Create the schema and run CRUD with mysql2 (verified run)',
      scenario: 'Create a college database with students, courses and an enrollments junction table, then insert, select, update, JOIN and delete from Node.js.',
      steps: [
        'Install MySQL 8 (or use XAMPP/Docker: docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=secret mysql:8)',
        'Run schema.sql in MySQL Workbench or with: mysql -u root -p < schema.sql',
        'mkdir mysql-demo && cd mysql-demo && npm init -y && npm i mysql2',
        'Create config/db.js and crud-demo.js; set DB_USER / DB_PASSWORD env variables',
        'Run node crud-demo.js',
      ],
      code: `-- schema.sql
-- schema.sql : run once in MySQL Workbench or: mysql -u root -p < schema.sql
CREATE DATABASE IF NOT EXISTS college;
USE college;

DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;

CREATE TABLE courses (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  fee   DECIMAL(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE students (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  city       VARCHAR(50)  DEFAULT 'Pune',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
  student_id INT NOT NULL,
  course_id  INT NOT NULL,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);

INSERT INTO courses (title, fee) VALUES ('Node.js', 4999), ('MySQL', 2999);

// config/db.js
// config/db.js – one connection POOL for the whole app
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'college',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;

// crud-demo.js
// crud-demo.js – mysql2/promise basics with prepared statements
const pool = require('./config/db');

async function main() {
  // CREATE: ? placeholders are filled safely (no SQL injection)
  const [r1] = await pool.execute(
    'INSERT INTO students (name, email, city) VALUES (?, ?, ?)',
    ['Asha', 'asha@mail.com', 'Pune']
  );
  console.log('insertId:', r1.insertId, '| affectedRows:', r1.affectedRows);

  await pool.execute('INSERT INTO students (name, email, city) VALUES (?, ?, ?)', ['Ravi', 'ravi@mail.com', 'Mumbai']);
  await pool.execute('INSERT INTO students (name, email) VALUES (?, ?)', ['Meera', 'meera@mail.com']);

  // READ: rows is an array of plain objects
  const [rows] = await pool.execute('SELECT id, name, city FROM students WHERE city = ? ORDER BY name', ['Pune']);
  console.log('Pune students:', rows);

  const [[one]] = await pool.execute('SELECT name, email FROM students WHERE id = ?', [2]);
  console.log('student 2:', one);

  // UPDATE
  const [r2] = await pool.execute('UPDATE students SET city = ? WHERE id = ?', ['Nagpur', 2]);
  console.log('updated rows:', r2.affectedRows);

  // JOIN: many-to-many through enrollments
  await pool.query('INSERT INTO enrollments (student_id, course_id) VALUES (1, 1), (1, 2), (2, 1)');
  const [joined] = await pool.execute(
    \`SELECT s.name, COUNT(e.course_id) AS courses, COALESCE(SUM(c.fee), 0) AS total_fee
       FROM students s
       LEFT JOIN enrollments e ON e.student_id = s.id
       LEFT JOIN courses c ON c.id = e.course_id
      GROUP BY s.id, s.name
      ORDER BY s.id\`
  );
  console.log('fees:', joined);

  // duplicate UNIQUE email -> error code ER_DUP_ENTRY
  try {
    await pool.execute('INSERT INTO students (name, email) VALUES (?, ?)', ['Asha 2', 'asha@mail.com']);
  } catch (err) {
    console.log('error:', err.code, err.errno);
  }

  // DELETE (ON DELETE CASCADE also removes the enrollments)
  const [r3] = await pool.execute('DELETE FROM students WHERE id = ?', [1]);
  const [[{ left }]] = await pool.query('SELECT COUNT(*) AS \`left\` FROM enrollments');
  console.log('deleted:', r3.affectedRows, '| enrollments left:', left);

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });`,
      result: `insertId: 1 | affectedRows: 1
Pune students: [
  { id: 1, name: 'Asha', city: 'Pune' },
  { id: 3, name: 'Meera', city: 'Pune' }
]
student 2: { name: 'Ravi', email: 'ravi@mail.com' }
updated rows: 1
fees: [
  { name: 'Asha', courses: 2, total_fee: '7998.00' },
  { name: 'Ravi', courses: 1, total_fee: '4999.00' },
  { name: 'Meera', courses: 0, total_fee: '0.00' }
]
error: ER_DUP_ENTRY 1062
deleted: 1 | enrollments left: 1
(verified with mysql2 3.x on MySQL 8.0)`,
      explanation: 'Every call returns [result]; SELECT gives rows, INSERT gives insertId. Meera got the DEFAULT city "Pune". The LEFT JOIN keeps students without courses (COALESCE turns NULL into 0) and DECIMAL sums come back as strings. Deleting Asha cascaded to her two enrollments, leaving only Ravi\'s.',
    },
    {
      title: 'Express 5 + mysql2 REST API with a transaction',
      scenario: 'Full CRUD for students. POST creates the student and their enrollments in one transaction, so an invalid course id saves nothing.',
      steps: [
        'Reuse schema.sql and config/db.js from the first example (re-run schema.sql for a clean start)',
        'Create app.js below – async routes, no try/catch except around the transaction',
        'node app.js and send the requests in order',
        'Check in Workbench: Ravi\'s first attempt left no row behind (rollback), but id 2 was consumed',
      ],
      code: `// app.js – Express 5 + mysql2 (promise pool) REST API
const express = require('express');
const pool = require('./config/db');

const app = express();
app.use(express.json());

// READ all (optional ?city=)
app.get('/api/students', async (req, res) => {
  const { city } = req.query;
  const [rows] = city
    ? await pool.execute('SELECT id, name, email, city FROM students WHERE city = ? ORDER BY id', [city])
    : await pool.execute('SELECT id, name, email, city FROM students ORDER BY id');
  res.json(rows);
});

// READ one + the courses (JOIN)
app.get('/api/students/:id', async (req, res) => {
  const [rows] = await pool.execute('SELECT id, name, email, city FROM students WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
  const [courses] = await pool.execute(
    'SELECT c.id, c.title FROM courses c JOIN enrollments e ON e.course_id = c.id WHERE e.student_id = ? ORDER BY c.id',
    [req.params.id]
  );
  res.json({ ...rows[0], courses });
});

// CREATE student + enrollments in ONE transaction
app.post('/api/students', async (req, res) => {
  const { name, email, city = 'Pune', courseIds = [] } = req.body ?? {};
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute('INSERT INTO students (name, email, city) VALUES (?, ?, ?)', [name, email, city]);
    for (const courseId of courseIds) {
      await conn.execute('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [result.insertId, courseId]);
    }
    await conn.commit();
    res.status(201).json({ id: result.insertId, name, email, city, courseIds });
  } catch (err) {
    await conn.rollback();          // nothing is saved if any statement failed
    throw err;                      // Express 5 sends it to the error handler
  } finally {
    conn.release();                 // ALWAYS give the connection back to the pool
  }
});

// UPDATE (partial)
app.patch('/api/students/:id', async (req, res) => {
  const { name, city } = req.body ?? {};
  const [result] = await pool.execute(
    'UPDATE students SET name = COALESCE(?, name), city = COALESCE(?, city) WHERE id = ?',
    [name ?? null, city ?? null, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
  const [[student]] = await pool.execute('SELECT id, name, email, city FROM students WHERE id = ?', [req.params.id]);
  res.json(student);
});

// DELETE
app.delete('/api/students/:id', async (req, res) => {
  const [result] = await pool.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
  res.sendStatus(204);
});

// map MySQL error codes to HTTP
app.use((err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Unknown course id' });
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));`,
      api: {
        code: `// API Lab simulation of the mysql2 API: in-memory "tables" that behave like MySQL
// (AUTO_INCREMENT, UNIQUE email, FOREIGN KEY check, transaction rollback, ON DELETE CASCADE)
const express = require('express');
const app = express();
app.use(express.json());

const db = {
  courses: [{ id: 1, title: 'Node.js' }, { id: 2, title: 'MySQL' }],
  students: [],
  enrollments: [],          // { student_id, course_id }
  autoIncrement: 1,         // like students.AUTO_INCREMENT (never goes back, even after ROLLBACK)
};

function sqlError(code) { const e = new Error(code); e.code = code; return e; }

// "INSERT student + enrollments" inside a fake transaction
function insertStudentTx({ name, email, city, courseIds }) {
  const snapshot = { students: [...db.students], enrollments: [...db.enrollments] }; // BEGIN
  try {
    const id = db.autoIncrement++;                                // id is reserved first
    if (db.students.some(s => s.email === email)) throw sqlError('ER_DUP_ENTRY');
    db.students.push({ id, name, email, city });
    for (const courseId of courseIds) {
      if (!db.courses.some(c => c.id === courseId)) throw sqlError('ER_NO_REFERENCED_ROW_2');
      db.enrollments.push({ student_id: id, course_id: courseId });
    }
    return id;                                                    // COMMIT
  } catch (err) {
    db.students = snapshot.students;                              // ROLLBACK
    db.enrollments = snapshot.enrollments;
    throw err;
  }
}

app.get('/api/students', (req, res) => {
  const { city } = req.query;
  res.json(city ? db.students.filter(s => s.city === city) : db.students);
});

app.get('/api/students/:id', (req, res) => {
  const student = db.students.find(s => s.id === Number(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const courses = db.enrollments
    .filter(e => e.student_id === student.id)
    .map(e => db.courses.find(c => c.id === e.course_id));          // JOIN
  res.json({ ...student, courses });
});

app.post('/api/students', (req, res) => {
  const { name, email, city = 'Pune', courseIds = [] } = req.body ?? {};
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const id = insertStudentTx({ name, email, city, courseIds });
  res.status(201).json({ id, name, email, city, courseIds });
});

app.patch('/api/students/:id', (req, res) => {
  const student = db.students.find(s => s.id === Number(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const { name, city } = req.body ?? {};
  student.name = name ?? student.name;                              // COALESCE(?, name)
  student.city = city ?? student.city;
  res.json(student);
});

app.delete('/api/students/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!db.students.some(s => s.id === id)) return res.status(404).json({ error: 'Student not found' });
  db.students = db.students.filter(s => s.id !== id);
  db.enrollments = db.enrollments.filter(e => e.student_id !== id); // ON DELETE CASCADE
  res.sendStatus(204);
});

app.use((err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Unknown course id' });
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/students', body: { name: 'Asha', email: 'asha@mail.com', courseIds: [1, 2] } },
          { method: 'POST', url: '/api/students', body: { name: 'Ravi', email: 'ravi@mail.com', city: 'Mumbai', courseIds: [1, 99] } },
          { method: 'POST', url: '/api/students', body: { name: 'Ravi', email: 'ravi@mail.com', city: 'Mumbai' } },
          { method: 'POST', url: '/api/students', body: { name: 'Asha K', email: 'asha@mail.com' } },
          { method: 'POST', url: '/api/students', body: { email: 'x@mail.com' } },
          { method: 'GET', url: '/api/students' },
          { method: 'GET', url: '/api/students/1' },
          { method: 'PATCH', url: '/api/students/3', body: { city: 'Nagpur' } },
          { method: 'GET', url: '/api/students?city=Nagpur' },
          { method: 'DELETE', url: '/api/students/3' },
          { method: 'DELETE', url: '/api/students/3' },
          { method: 'GET', url: '/api/students/3' },
        ],
      },
      result: `POST /api/students → 201 {"id":1,"name":"Asha","email":"asha@mail.com","city":"Pune","courseIds":[1,2]}
POST /api/students → 400 {"error":"Unknown course id"}
POST /api/students → 201 {"id":3,"name":"Ravi","email":"ravi@mail.com","city":"Mumbai","courseIds":[]}
POST /api/students → 409 {"error":"Email already exists"}
POST /api/students → 400 {"error":"name and email are required"}
GET /api/students → 200 [{"id":1,"name":"Asha","email":"asha@mail.com","city":"Pune"},{"id":3,"name":"Ravi","email":"ravi@mail.com","city":"Mumbai"}]
GET /api/students/1 → 200 {"id":1,"name":"Asha","email":"asha@mail.com","city":"Pune","courses":[{"id":1,"title":"Node.js"},{"id":2,"title":"MySQL"}]}
PATCH /api/students/3 → 200 {"id":3,"name":"Ravi","email":"ravi@mail.com","city":"Nagpur"}
GET /api/students?city=Nagpur → 200 [{"id":3,"name":"Ravi","email":"ravi@mail.com","city":"Nagpur"}]
DELETE /api/students/3 → 204
DELETE /api/students/3 → 404 {"error":"Student not found"}
GET /api/students/3 → 404 {"error":"Student not found"}`,
      explanation: 'These are the real responses of app.js against MySQL 8, and the API Lab simulation (arrays that mimic AUTO_INCREMENT, UNIQUE, FOREIGN KEY, ROLLBACK and CASCADE) returns exactly the same. Course 99 does not exist, so the FK check failed, the transaction rolled back and Ravi was not saved – but AUTO_INCREMENT had already used id 2, so the next Ravi got id 3. ER_DUP_ENTRY became 409; affectedRows 0 became 404.',
    },
    {
      title: 'Sequelize ORM: models, associations and validation (verified run)',
      scenario: 'Do the same kind of work with an ORM: define Teacher and Batch models, link them, query with include and see validation errors.',
      steps: [
        'npm i sequelize mysql2',
        'Create sequelize-demo.js below (it creates its own Teachers and Batches tables)',
        'Run node sequelize-demo.js',
        'Open Workbench: Sequelize created tables with id, createdAt, updatedAt and a teacherId foreign key',
      ],
      code: `// sequelize-demo.js – the same idea with an ORM (npm i sequelize mysql2)
const { Sequelize, DataTypes, Op } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'college',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  { host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT) || 3306, dialect: 'mysql', logging: false }
);

// models = JS classes mapped to tables
const Teacher = sequelize.define('Teacher', {
  name: { type: DataTypes.STRING(50), allowNull: false, validate: { len: [2, 50] } },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true, validate: { isEmail: true } },
});
const Batch = sequelize.define('Batch', {
  title: { type: DataTypes.STRING(100), allowNull: false },
  seats: { type: DataTypes.INTEGER, defaultValue: 30 },
});

// associations: one teacher has many batches
Teacher.hasMany(Batch, { foreignKey: 'teacherId', as: 'batches' });
Batch.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

async function main() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });  // DEV ONLY: drops & recreates tables (use migrations in production)

  const t = await Teacher.create({ name: 'Priya', email: 'priya@mail.com' });
  await Batch.bulkCreate([
    { title: 'Node Morning', teacherId: t.id },
    { title: 'Node Evening', seats: 20, teacherId: t.id },
  ]);

  const teacher = await Teacher.findOne({
    where: { email: 'priya@mail.com' },
    include: { model: Batch, as: 'batches', attributes: ['title', 'seats'] }, // like populate / JOIN
    order: [[{ model: Batch, as: 'batches' }, 'id', 'ASC']],
  });
  console.log(teacher.name, teacher.batches.map(b => b.title + ' (' + b.seats + ')'));

  const small = await Batch.findAll({ where: { seats: { [Op.lt]: 25 } }, attributes: ['title'], raw: true });
  console.log('small batches:', small);

  const [updated] = await Batch.update({ seats: 25 }, { where: { title: 'Node Evening' } });
  console.log('updated rows:', updated);

  try {
    await Teacher.create({ name: 'X', email: 'not-an-email' });
  } catch (err) {
    console.log(err.name + ':', err.errors.map(e => e.path + ' -> ' + e.validatorKey).join(', '));
  }

  await sequelize.close();
}
main().catch(err => { console.error(err); process.exit(1); });`,
      result: `Priya [ 'Node Morning (30)', 'Node Evening (20)' ]
small batches: [ { title: 'Node Evening' } ]
updated rows: 1
SequelizeValidationError: name -> len, email -> isEmail
(verified with Sequelize 6 + mysql2 on MySQL 8.0)`,
      explanation: 'include performs a JOIN and nests batches inside the teacher (like Mongoose populate). Op.lt builds "seats < 25". Model validators ran in JavaScript before any SQL was sent. sync({ force: true }) is for demos only – real projects use migrations.',
    },
    {
      title: 'Prisma overview: schema, migration and typed queries',
      scenario: 'See how the same Student/Course model looks with Prisma (very common with TypeScript and Next.js).',
      steps: [
        'npm i -D prisma && npm i @prisma/client',
        'npx prisma init --datasource-provider mysql (creates prisma/schema.prisma and .env)',
        'Set DATABASE_URL="mysql://root:secret@localhost:3306/college_prisma" in .env',
        'Write the models below, then npx prisma migrate dev --name init',
        'Use the generated client in your Express routes',
      ],
      code: `// prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Student {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(50)
  email     String   @unique
  city      String   @default("Pune")
  courses   Course[] // implicit many-to-many (Prisma creates the junction table)
  createdAt DateTime @default(now())
}

model Course {
  id       Int       @id @default(autoincrement())
  title    String
  fee      Decimal   @db.Decimal(10, 2)
  students Student[]
}

// routes using the generated client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.get('/api/students', async (req, res) => {
  const students = await prisma.student.findMany({
    where: req.query.city ? { city: req.query.city } : {},
    include: { courses: { select: { title: true } } },
    orderBy: { id: 'asc' },
  });
  res.json(students);
});

app.post('/api/students', async (req, res) => {
  const { name, email, courseIds = [] } = req.body ?? {};
  const student = await prisma.student.create({
    data: { name, email, courses: { connect: courseIds.map(id => ({ id })) } },
  });
  res.status(201).json(student);
});
// unique violation -> err.code === 'P2002' (map to 409); record not found -> 'P2025' (map to 404)`,
      result: `npx prisma migrate dev → creates prisma/migrations/<timestamp>_init/migration.sql and applies it
GET /api/students → [{ "id": 1, "name": "Asha", "email": "asha@mail.com", "city": "Pune", "createdAt": "...", "courses": [{ "title": "Node.js" }] }]`,
      explanation: 'Prisma generates SQL migrations from the schema file and a typed client, so editors autocomplete prisma.student.findMany options. connect links existing courses through the auto-created junction table. Prisma errors have their own codes (P2002, P2025).',
    },
  ],
  interview: [
    { q: 'What is mysql2 and why use mysql2/promise?', a: 'mysql2 is a fast MySQL client for Node.js supporting prepared statements and pools. The /promise entry point returns promises so you can use async/await instead of callbacks.', level: 'Easy' },
    { q: 'Why use a connection pool?', a: 'Creating a connection (TCP + auth) per request is slow and can exhaust the server. A pool keeps a set of open connections and lends them to queries, limiting concurrency (connectionLimit) and reusing them.', level: 'Medium' },
    { q: 'What is SQL injection and how do you prevent it in Node?', a: 'An attack where user input changes the SQL statement, e.g. "\' OR \'1\'=\'1". Prevent it with parameterised queries (pool.execute("... WHERE id = ?", [id])), never string concatenation, and whitelist identifiers like column names.', level: 'Easy' },
    { q: 'Difference between query() and execute() in mysql2?', a: 'execute() uses server-side prepared statements (parsed once, cached, values bound). query() sends a text query with client-side escaping of placeholders and supports extra formats like bulk VALUES ? and ?? identifiers.', level: 'Medium' },
    { q: 'How do you run a transaction with a pool?', a: 'Get a dedicated connection with pool.getConnection(), call beginTransaction(), run the queries on that connection, commit() on success, rollback() in catch, and release() in finally.', level: 'Medium' },
    { q: 'What do insertId and affectedRows tell you?', a: 'insertId is the AUTO_INCREMENT id of the inserted row; affectedRows is how many rows an INSERT/UPDATE/DELETE matched – 0 for UPDATE/DELETE usually means "not found" (HTTP 404).', level: 'Easy' },
    { q: 'How do you handle a duplicate email in MySQL from Express?', a: 'Put a UNIQUE constraint on the column and catch err.code === "ER_DUP_ENTRY" (errno 1062) in the error middleware, returning 409 Conflict.', level: 'Medium' },
    { q: 'What is an ORM? Pros and cons?', a: 'Object-Relational Mapper: maps tables to classes and generates SQL. Pros: productivity, associations, validation, migrations, DB portability. Cons: hidden/inefficient SQL, N+1 risks, learning curve, less control for complex queries.', level: 'Medium' },
    { q: 'Sequelize vs Prisma?', a: 'Sequelize is a mature JS ORM with models defined in code, associations and hooks. Prisma uses a declarative schema file, generates a type-safe client and SQL migrations; it offers better TypeScript support and DX but a different (non-class) model.', level: 'Medium' },
    { q: 'When would you choose MySQL over MongoDB?', a: 'When data is highly relational and integrity matters: orders, payments, inventory, accounting – needing foreign keys, joins, strict schemas and multi-table ACID transactions. MongoDB suits flexible, nested, document-shaped data.', level: 'Medium' },
    { q: 'Why are there gaps in AUTO_INCREMENT ids?', a: 'Ids are reserved when an insert starts; if the transaction rolls back or the insert fails, the id is not reused. Gaps are normal – never rely on ids being consecutive.', level: 'Hard' },
    { q: 'Why does a DECIMAL column come back as a string in mysql2?', a: 'To avoid losing precision when converting to JavaScript floating-point numbers. Use Number() for display math or set decimalNumbers: true if precision loss is acceptable; use integer paise/cents for money calculations.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a products table (id, name UNIQUE, price DECIMAL(10,2), stock INT DEFAULT 0) and GET /api/products?maxPrice=500 with mysql2.',
      hint: 'Use a placeholder for maxPrice; default to a large number.',
      solution: `CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0
);

app.get('/api/products', async (req, res) => {
  const maxPrice = Number(req.query.maxPrice) || 1e9;
  const [rows] = await pool.execute('SELECT * FROM products WHERE price <= ? ORDER BY price', [maxPrice]);
  res.json(rows);
});`,
    },
    {
      task: 'Add safe sorting: GET /api/students?sort=name|city|id&order=asc|desc.',
      hint: 'Placeholders cannot be used for column names – whitelist them.',
      solution: `app.get('/api/students', async (req, res) => {
  const sortable = ['id', 'name', 'city'];
  const sort = sortable.includes(req.query.sort) ? req.query.sort : 'id';
  const order = req.query.order === 'desc' ? 'DESC' : 'ASC';
  const [rows] = await pool.query('SELECT id, name, city FROM students ORDER BY ' + sort + ' ' + order);
  res.json(rows);
});`,
    },
    {
      task: 'Write POST /api/transfer that moves seats between two courses inside a transaction (decrease one, increase the other) and fails if seats would go below 0.',
      hint: 'UPDATE ... WHERE seats >= ? and check affectedRows.',
      solution: `app.post('/api/transfer', async (req, res) => {
  const { fromId, toId, seats } = req.body ?? {};
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [dec] = await conn.execute('UPDATE courses SET seats = seats - ? WHERE id = ? AND seats >= ?', [seats, fromId, seats]);
    if (dec.affectedRows === 0) throw Object.assign(new Error('Not enough seats'), { status: 400 });
    await conn.execute('UPDATE courses SET seats = seats + ? WHERE id = ?', [seats, toId]);
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});`,
    },
    {
      task: 'Insert many rows at once with mysql2: an array of [name, email] pairs.',
      hint: 'query() with VALUES ? and a nested array.',
      solution: `const rows = [['Kiran', 'kiran@mail.com'], ['Neha', 'neha@mail.com']];
const [result] = await pool.query('INSERT INTO students (name, email) VALUES ?', [rows]);
console.log(result.affectedRows); // 2`,
    },
    {
      task: 'Convert the Student table into a Sequelize model with validation and write findAll for city = "Pune" ordered by name.',
      hint: 'sequelize.define, validate: { isEmail: true }, order: [["name", "ASC"]].',
      solution: `const Student = sequelize.define('Student', {
  name: { type: DataTypes.STRING(50), allowNull: false, validate: { len: [2, 50] } },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true, validate: { isEmail: true } },
  city: { type: DataTypes.STRING(50), defaultValue: 'Pune' },
}, { tableName: 'students', timestamps: false });

const pune = await Student.findAll({ where: { city: 'Pune' }, order: [['name', 'ASC']] });`,
    },
  ],
  quiz: [
    { question: 'Which mysql2 call is SAFE against SQL injection?', options: ['pool.query("SELECT * FROM u WHERE id = " + id)', 'pool.execute("SELECT * FROM u WHERE id = ?", [id])', 'pool.query(`SELECT * FROM u WHERE id = ${id}`)', 'All of them'], answer: 1, explanation: 'Placeholders keep values separate from the SQL text.' },
    { question: 'What does const [rows] = await pool.execute("SELECT ...") give you?', options: ['The column metadata', 'A single row', 'An array of row objects', 'The number of rows'], answer: 2, explanation: 'The first element of the returned array holds the rows.' },
    { question: 'Inside a transaction, which call must ALWAYS run in finally?', options: ['conn.release()', 'conn.commit()', 'pool.end()', 'conn.rollback()'], answer: 0, explanation: 'Release the connection back to the pool on every path.' },
    { question: 'err.code === "ER_DUP_ENTRY" should map to which HTTP status?', options: ['404', '500', '401', '409'], answer: 3, explanation: 'A unique-constraint conflict = 409 Conflict.' },
    { question: 'Which tool generates a type-safe client from a schema file?', options: ['mysql2', 'Prisma', 'Knex', 'Express'], answer: 1, explanation: 'Prisma generates its client from schema.prisma.' },
  ],
};
