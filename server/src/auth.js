// JWT helpers and route guards.
const jwt = require('jsonwebtoken');
const config = require('./config');
const { db } = require('./db');

const sign = (u) => jwt.sign({ id: u.id, role: u.role, username: u.username }, config.jwtSecret, { expiresIn: '30d' });

const publicUser = (u) => ({ id: u.id, username: u.username, name: u.name, email: u.email || '', role: u.role, createdAt: u.created_at });

// Reads the token from "Authorization: Bearer …" or ?t=… (needed for <video>/<img> links, which cannot send headers).
function tokenOf(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  return typeof req.query.t === 'string' ? req.query.t : '';
}

async function userFromToken(token) {
  if (!token) return null;
  try {
    const p = jwt.verify(token, config.jwtSecret);
    const [rows] = await db().query('SELECT * FROM users WHERE id = ? AND active = 1', [p.id]);
    return rows[0] || null;
  } catch { return null; }
}

const requireUser = async (req, res, next) => {
  const u = await userFromToken(tokenOf(req));
  if (!u) return res.status(401).json({ error: 'Please sign in again.' });
  req.user = u;
  return next();
};

const requireAdmin = (req, res, next) => requireUser(req, res, () => (req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Only the admin can do this.' })));

module.exports = { sign, publicUser, userFromToken, requireUser, requireAdmin };
