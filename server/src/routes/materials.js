// Study material from the admin: recorded videos, photos, PDFs, other files and video links.
const express = require('express');
const config = require('../config');
const { db } = require('../db');
const { requireUser, requireAdmin } = require('../auth');
const { uploader, saveFiles, removeUploaded, deleteFileRow } = require('../files');
const { io } = require('../socket');

const r = express.Router();
const upload = uploader(config.adminMaxBytes, 20);

const kindOf = (mime, name) => {
  if (/^video\//.test(mime)) return 'video';
  if (/^image\//.test(mime)) return 'photo';
  if (mime === 'application/pdf' || /\.pdf$/i.test(name)) return 'pdf';
  return 'file';
};

const SELECT = `SELECT m.*, f.original_name, f.mime, f.size, u.name AS by_name
  FROM materials m LEFT JOIN files f ON f.id = m.file_id LEFT JOIN users u ON u.id = m.created_by`;
const shape = (m) => ({
  id: m.id, kind: m.kind, title: m.title, note: m.note || '', course: m.course || '', lesson: m.lesson || '',
  url: m.url || null, file: m.file_id ? { id: m.file_id, name: m.original_name, mime: m.mime, size: Number(m.size) } : null,
  by: m.by_name, createdAt: m.created_at,
});

// GET /api/materials?course=&lesson=&kind=   (course="" = general material for everyone)
r.get('/', requireUser, async (req, res) => {
  const where = []; const vals = [];
  if (req.query.course !== undefined) { where.push('(m.course = ? OR m.course IS NULL)'); vals.push(String(req.query.course)); }
  if (req.query.lesson) { where.push('(m.lesson = ? OR m.lesson IS NULL)'); vals.push(String(req.query.lesson)); }
  if (req.query.kind) { where.push('m.kind = ?'); vals.push(String(req.query.kind)); }
  const [rows] = await db().query(`${SELECT}${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY m.created_at DESC LIMIT 500`, vals);
  res.json({ materials: rows.map(shape) });
});

// POST /api/materials  multipart: files[] + title, note, course, lesson   or JSON-ish fields + url (video link)
r.post('/', requireAdmin, upload.array('files', 20), async (req, res) => {
  const files = req.files || [];
  try {
    const title = String(req.body.title || '').trim().slice(0, 200);
    const note = String(req.body.note || '').trim().slice(0, 4000) || null;
    const course = String(req.body.course || '').trim().slice(0, 40) || null;
    const lesson = String(req.body.lesson || '').trim().slice(0, 200) || null;
    const url = String(req.body.url || '').trim();
    const created = [];
    if (url) {
      if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'The link must start with http:// or https://' });
      const [x] = await db().query('INSERT INTO materials (kind, title, note, course, lesson, url, created_by) VALUES (?,?,?,?,?,?,?)', ['link', title || 'Video', note, course, lesson, url.slice(0, 700), req.user.id]);
      created.push(x.insertId);
    }
    const saved = await saveFiles(files, req.user.id);
    for (const f of saved) {
      const t = files.length === 1 && title ? title : f.name.replace(/\.[^.]+$/, '');
      // eslint-disable-next-line no-await-in-loop
      const [x] = await db().query('INSERT INTO materials (kind, title, note, course, lesson, file_id, created_by) VALUES (?,?,?,?,?,?,?)', [kindOf(f.mime, f.name), t, note, course, lesson, f.id, req.user.id]);
      created.push(x.insertId);
    }
    if (!created.length) return res.status(400).json({ error: 'Choose a file or paste a video link.' });
    const [rows] = await db().query(`${SELECT} WHERE m.id IN (?) ORDER BY m.id`, [created]);
    const list = rows.map(shape);
    io()?.emit('material:new', { count: list.length, course, title: list[0]?.title });
    return res.status(201).json({ materials: list });
  } catch (e) {
    removeUploaded(files);
    throw e;
  }
});

r.patch('/:id', requireAdmin, async (req, res) => {
  const f = {}; ['title', 'note', 'course', 'lesson'].forEach((k) => { if (req.body[k] !== undefined) f[k] = String(req.body[k]).trim() || (k === 'title' ? 'Untitled' : null); });
  if (!Object.keys(f).length) return res.status(400).json({ error: 'Nothing to change.' });
  await db().query(`UPDATE materials SET ${Object.keys(f).map((k) => `${k} = ?`).join(', ')} WHERE id = ?`, [...Object.values(f), Number(req.params.id)]);
  return res.json({ ok: true });
});

r.delete('/:id', requireAdmin, async (req, res) => {
  const [rows] = await db().query('SELECT file_id FROM materials WHERE id = ?', [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found.' });
  await db().query('DELETE FROM materials WHERE id = ?', [Number(req.params.id)]);
  if (rows[0].file_id) await deleteFileRow(rows[0].file_id);
  return res.json({ ok: true });
});

module.exports = r;
