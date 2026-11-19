const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const env = (k, d) => (process.env[k] === undefined || process.env[k] === '' ? d : process.env[k]);

const config = {
  port: Number(env('PORT', 5050)),
  db: {
    host: env('DB_HOST', 'localhost'),
    port: Number(env('DB_PORT', 3306)),
    user: env('DB_USER', 'root'),
    password: env('DB_PASS', ''),
    database: env('DB_NAME', 'upskillr'),
    socketPath: env('DB_SOCKET', undefined),
  },
  jwtSecret: env('JWT_SECRET', ''),
  admin: { username: env('ADMIN_USERNAME', 'admin'), password: env('ADMIN_PASSWORD', ''), name: env('ADMIN_NAME', 'Admin') },
  corsOrigins: env('CORS_ORIGIN', 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  uploadDir: path.resolve(path.join(__dirname, '..'), env('UPLOAD_DIR', './uploads')),
  adminMaxBytes: Number(env('ADMIN_MAX_MB', 2048)) * 1024 * 1024,
  chatMaxBytes: Number(env('CHAT_MAX_MB', 50)) * 1024 * 1024,
};

if (!config.jwtSecret || config.jwtSecret.length < 16) {
  console.error('JWT_SECRET is missing or too short (min 16 characters). Set it in server/.env');
  process.exit(1);
}

module.exports = config;
