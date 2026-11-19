const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { db } = require('../db');
const { sign, publicUser, requireUser, requireAdmin } = require('../auth');

const r = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Try again in 15 minutes.' } });

r.post('/register', limiter, async (req, res) => {
  const name = String(req.body.name || '').trim();
  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim();
  const password = String(req.body.password || '');
  if (name.length < 2) return res.status(400).json({ field: 'name', error: 'Please enter your full name.' });
  if (!/^[A-Za-z0-9_.]{3,20}$/.test(username)) return res.status(400).json({ field: 'username', error: 'Username must be 3–20 letters, numbers, _ or . (no spaces).' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ field: 'email', error: 'Please enter a valid email address.' });
  if (password.length < 6) return res.status(400).json({ field: 'password', error: 'Password must be at least 6 characters.' });
  const [dup] = await db().query('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [username]);
  if (dup.length) return res.status(409).json({ field: 'username', error: 'This username is already taken. Choose another one.' });
  await db().query('INSERT INTO users (username, name, email, password_hash) VALUES (?, ?, ?, ?)', [username, name.slice(0, 100), email.slice(0, 160), await bcrypt.hash(password, 10)]);
  // no token: the student signs in with the same username and password next
  return res.status(201).json({ ok: true, username });
});

r.post('/login', limiter, async (req, res) => {
  const [rows] = await db().query('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [String(req.body.username || '').trim()]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(String(req.body.password || ''), u.password_hash))) return res.status(401).json({ error: 'Wrong username or password.' });
  if (!u.active) return res.status(403).json({ error: 'Your account is disabled. Please contact the admin.' });
  return res.json({ token: sign(u), user: publicUser(u) });
});

r.get('/me', requireUser, (req, res) => res.json({ user: publicUser(req.user) }));

r.post('/password', requireUser, async (req, res) => {
  const { current, next } = req.body || {};
  if (!(await bcrypt.compare(String(current || ''), req.user.password_hash))) return res.status(400).json({ error: 'Current password is wrong.' });
  if (String(next || '').length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  await db().query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(String(next), 10), req.user.id]);
  return res.json({ ok: true });
});

// admin: list accounts, change role / enable-disable
r.get('/users', requireAdmin, async (req, res) => {
  const [rows] = await db().query('SELECT id, username, name, email, role, active, created_at FROM users ORDER BY created_at DESC');
  res.json({ users: rows.map((u) => ({ ...publicUser(u), active: !!u.active })) });
});
r.patch('/users/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'You cannot change your own account here.' });
  const sets = []; const vals = [];
  if (['admin', 'student'].includes(req.body.role)) { sets.push('role = ?'); vals.push(req.body.role); }
  if (typeof req.body.active === 'boolean') { sets.push('active = ?'); vals.push(req.body.active ? 1 : 0); }
  if (!sets.length) return res.status(400).json({ error: 'Nothing to change.' });
  await db().query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, [...vals, id]);
  return res.json({ ok: true });
});

module.exports = r;
