// UpSkillr API: accounts, study material uploads and the student chat.
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { init } = require('./db');
const socket = require('./socket');
const { requireUser } = require('./auth');
const { sendFile } = require('./files');

async function main() {
  await init();
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true, name: 'upskillr-api' }));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/materials', require('./routes/materials'));
  app.use('/api/chat', require('./routes/chat'));
  app.get('/api/files/:id', requireUser, sendFile);

  app.use((req, res) => res.status(404).json({ error: 'Not found.' }));
  // errors (incl. upload limits) -> JSON
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    const size = err.code === 'LIMIT_FILE_SIZE';
    const status = err.status || (err.code && String(err.code).startsWith('LIMIT_') ? 413 : 500);
    if (status >= 500) console.error(err);
    res.status(status).json({ error: size ? 'This file is too large.' : status >= 500 ? 'Server error. Please try again.' : err.message });
  });

  const server = http.createServer(app);
  socket.attach(server);
  server.listen(config.port, () => console.log(`UpSkillr API on http://localhost:${config.port}`));
}

main().catch((e) => { console.error('Could not start:', e.message); process.exit(1); });
