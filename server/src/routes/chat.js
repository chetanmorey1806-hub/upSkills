// The common chat room: every signed-in student and the admin. Messages can carry files, photos, PDFs and whole folders.
const express = require('express');
const config = require('../config');
const { db } = require('../db');
const { requireUser } = require('../auth');
const { uploader, saveFiles, removeUploaded, deleteFileRow } = require('../files');
const { io } = require('../socket');

const r = express.Router();
const upload = uploader(config.chatMaxBytes, 200); // a folder can hold many files

async function loadMessages(where, vals, limit) {
  const [msgs] = await db().query(
    `SELECT c.id, c.user_id, c.text, c.deleted, c.created_at, u.name, u.username, u.role
     FROM chat_messages c JOIN users u ON u.id = c.user_id ${where} ORDER BY c.id DESC LIMIT ?`, [...vals, limit],
  );
  if (!msgs.length) return [];
  const [atts] = await db().query(
    `SELECT a.message_id, f.id, f.original_name, f.rel_path, f.mime, f.size FROM chat_attachments a JOIN files f ON f.id = a.file_id
     WHERE a.message_id IN (?) ORDER BY f.id`, [msgs.map((m) => m.id)],
  );
  return msgs.reverse().map((m) => ({
    id: m.id, text: m.deleted ? '' : m.text || '', deleted: !!m.deleted, createdAt: m.created_at,
    user: { id: m.user_id, name: m.name, username: m.username, role: m.role },
    files: m.deleted ? [] : atts.filter((a) => a.message_id === m.id).map((a) => ({ id: a.id, name: a.original_name, relPath: a.rel_path, mime: a.mime, size: Number(a.size) })),
  }));
}

// GET /api/chat/messages?before=<id>&limit=50
r.get('/messages', requireUser, async (req, res) => {
  const before = Number(req.query.before) || 0;
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  res.json({ messages: await loadMessages(before ? 'WHERE c.id < ?' : '', before ? [before] : [], limit) });
});

// POST /api/chat/messages  multipart: text, files[], paths[] (folder-relative path of each file, same order)
r.post('/messages', requireUser, upload.array('files', 200), async (req, res) => {
  const files = req.files || [];
  try {
    const text = String(req.body.text || '').trim().slice(0, 5000);
    if (!text && !files.length) return res.status(400).json({ error: 'Type a message or attach a file.' });
    const paths = [].concat(req.body.paths || []);
    const [x] = await db().query('INSERT INTO chat_messages (user_id, text) VALUES (?, ?)', [req.user.id, text || null]);
    const saved = await saveFiles(files, req.user.id, paths);
    if (saved.length) await db().query('INSERT INTO chat_attachments (message_id, file_id) VALUES ?', [saved.map((f) => [x.insertId, f.id])]);
    const [msg] = await loadMessages('WHERE c.id = ?', [x.insertId], 1);
    io()?.emit('chat:message', msg);
    return res.status(201).json({ message: msg });
  } catch (e) {
    removeUploaded(files);
    throw e;
  }
});

// DELETE /api/chat/messages/:id — the sender or the admin
r.delete('/messages/:id', requireUser, async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await db().query('SELECT user_id FROM chat_messages WHERE id = ?', [id]);
  if (!rows[0]) return res.status(404).json({ error: 'Message not found.' });
  if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'You can delete only your own messages.' });
  const [atts] = await db().query('SELECT file_id FROM chat_attachments WHERE message_id = ?', [id]);
  await db().query('UPDATE chat_messages SET deleted = 1, text = NULL WHERE id = ?', [id]);
  await db().query('DELETE FROM chat_attachments WHERE message_id = ?', [id]);
  for (const a of atts) await deleteFileRow(a.file_id); // eslint-disable-line no-await-in-loop
  io()?.emit('chat:deleted', { id });
  return res.json({ ok: true });
});

module.exports = r;
