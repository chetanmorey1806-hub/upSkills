// Upload storage (multer) and safe download of stored files.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const config = require('./config');
const { db } = require('./db');

fs.mkdirSync(config.uploadDir, { recursive: true });

// Program/script files students should not pass around.
const BLOCKED = /\.(exe|msi|bat|cmd|com|scr|pif|ps1|vbs|vbe|wsf|jse?|hta|cpl|reg|lnk|jar|apk|dll|sys|sh)$/i;

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex')), // never the user's file name
});

// Browsers send names as latin1; restore UTF-8 (Marathi / Hindi file names).
const fixName = (n) => { try { return Buffer.from(n, 'latin1').toString('utf8'); } catch { return n; } };

function uploader(maxBytes, maxFiles) {
  return multer({
    storage,
    limits: { fileSize: maxBytes, files: maxFiles, fieldSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      file.originalname = fixName(file.originalname);
      if (BLOCKED.test(file.originalname)) return cb(Object.assign(new Error(`${file.originalname}: program files cannot be shared.`), { status: 400 }));
      return cb(null, true);
    },
  });
}

// Saves multer files to the `files` table. relPaths[i] keeps a folder's structure ("Notes/Week 1/a.pdf").
async function saveFiles(files, userId, relPaths = []) {
  const out = [];
  for (let i = 0; i < files.length; i += 1) {
    const f = files[i];
    const rel = String(relPaths[i] || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.\.\//g, '').slice(0, 700) || null;
    // eslint-disable-next-line no-await-in-loop
    const [r] = await db().query('INSERT INTO files (stored_name, original_name, rel_path, mime, size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [f.filename, f.originalname.slice(0, 255), rel, (f.mimetype || 'application/octet-stream').slice(0, 150), f.size, userId]);
    out.push({ id: r.insertId, name: f.originalname, relPath: rel, mime: f.mimetype, size: f.size });
  }
  return out;
}

function removeUploaded(files = []) {
  files.forEach((f) => fs.promises.unlink(path.join(config.uploadDir, f.filename)).catch(() => {}));
}

async function deleteFileRow(id) {
  const [rows] = await db().query('SELECT stored_name FROM files WHERE id = ?', [id]);
  if (!rows[0]) return;
  await db().query('DELETE FROM files WHERE id = ?', [id]);
  await fs.promises.unlink(path.join(config.uploadDir, rows[0].stored_name)).catch(() => {});
}

// Types that may be shown inside the page; everything else is downloaded.
const INLINE = /^(image\/(png|jpe?g|gif|webp|avif|bmp)|video\/(mp4|webm|ogg|quicktime)|audio\/[\w.+-]+|application\/pdf|text\/plain)$/i;

// GET /api/files/:id[?dl=1] — streams the file (supports Range, so videos can seek).
async function sendFile(req, res) {
  const [rows] = await db().query('SELECT * FROM files WHERE id = ?', [Number(req.params.id)]);
  const f = rows[0];
  if (!f) return res.status(404).json({ error: 'File not found.' });
  const inline = INLINE.test(f.mime) && req.query.dl !== '1';
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'; sandbox");
  res.setHeader('Cache-Control', 'private, max-age=86400');
  const name = encodeURIComponent(f.original_name);
  res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${name}`);
  return res.sendFile(path.join(config.uploadDir, f.stored_name), {
    headers: { 'Content-Type': inline ? f.mime : 'application/octet-stream' },
    acceptRanges: true,
  }, (err) => { if (err && !res.headersSent) res.status(404).json({ error: 'File missing on the server.' }); });
}

module.exports = { uploader, saveFiles, removeUploaded, deleteFileRow, sendFile };
