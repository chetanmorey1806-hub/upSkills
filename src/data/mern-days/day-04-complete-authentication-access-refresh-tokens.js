export default {
  id: 'day-04-complete-authentication-access-refresh-tokens',
  title: 'Complete Authentication: Register/Login, bcrypt, Access + Refresh Tokens, httpOnly Cookies, Rotation, Logout and Protected Routes',
  module: 'Module 2: Auth & Security',
  day: 4,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Build production-style authentication for a MERN app: hashed passwords with bcrypt, a short-lived access token kept in memory, a long-lived refresh token in an httpOnly Secure SameSite cookie, refresh-token rotation with reuse detection, logout (one device and all devices), and protected routes on both Express and React.',
  objectives: [
    'Explain why the access + refresh token pattern exists and where each token should be stored',
    'Implement register, login, refresh, logout and /me endpoints with bcrypt and jsonwebtoken',
    'Set refresh tokens in httpOnly, Secure, SameSite cookies and rotate them on every refresh with reuse detection',
    'Write a requireAuth middleware and protect routes on the server',
    'Build an AuthProvider, a silent-refresh axios interceptor (single flight) and a ProtectedRoute in React Router 7',
  ],
  theory: [
    {
      heading: 'Authentication building blocks (recap in one page)',
      content:
        'The Node course taught bcrypt and basic JWT. Here we combine them into a **complete, secure flow**.\n\n- **Authentication** = who are you? (login). **Authorization** = what may you do? (Day 5).\n- **bcrypt** hashes passwords with a random **salt** and a **cost factor** (e.g. 12). It is deliberately slow so stolen hashes are hard to crack. Never store plain or reversible (encrypted) passwords. Compare with `bcrypt.compare(plain, hash)`.\n- **JWT** (JSON Web Token) = `header.payload.signature`. The server signs `{ sub: userId, role }` with a secret; later it **verifies** the signature without a database lookup. The payload is only **Base64URL encoded, not encrypted**: never put secrets or passwords inside.\n\nThe problem with "one JWT valid for 7 days in localStorage": if it is stolen (XSS, shared laptop), the attacker is you for 7 days and you **cannot revoke** it, because JWTs are stateless.',
      points: [
        'Hash cost 10-12 is typical in 2026; measure ~100-250 ms per hash on your server',
        'Login error message must be generic: "Invalid email or password" (do not reveal which one is wrong)',
        'Normalise emails (trim + lowercase) before saving and before searching',
      ],
    },
    {
      heading: 'Access token + refresh token: two keys with two jobs',
      content:
        'The industry-standard pattern uses **two tokens**:\n\n1. **Access token**: a JWT valid for a **short time (10-15 minutes)**. Sent on every API request in `Authorization: Bearer <token>`. Kept **in memory** (a JS variable / React state), not in localStorage. If stolen, it dies quickly.\n2. **Refresh token**: a long-lived token (**7-30 days**) whose only job is to get a new access token from `POST /api/auth/refresh`. Stored in an **httpOnly cookie**, so JavaScript (and therefore XSS) cannot read it. The server also stores it (hashed) in MongoDB, so it **can be revoked**.\n\nAnalogy: a hotel. The **refresh token is your ID proof at the reception desk** (kept safe, used rarely). The **access token is the room key card** that expires every 15 minutes; when it stops working you go to reception, show your ID and get a new card. If someone steals your key card, it is useless soon. If you check out (logout), reception cancels your record.\n\nOn page reload the in-memory access token is lost, so the React app calls `/api/auth/refresh` once at startup: the browser automatically sends the cookie and the user stays logged in.',
      syntax:
        'Login       → 200 { accessToken, user }  +  Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth\nAPI call    → Authorization: Bearer <accessToken>\n401 expired → POST /api/auth/refresh (cookie sent automatically) → new accessToken + NEW refresh cookie\nLogout      → POST /api/auth/logout → server deletes the refresh token, clears the cookie',
    },
    {
      heading: 'httpOnly, Secure, SameSite: cookie flags that matter',
      content:
        'Set the refresh cookie with `res.cookie(\'refreshToken\', token, options)`:\n\n- **httpOnly: true**: `document.cookie` cannot read it → XSS cannot steal it.\n- **secure: true**: only sent over HTTPS (in development on http://localhost you set it to false).\n- **sameSite**: controls cross-site sending. `\'strict\'` = never sent from other sites (best when frontend and API share the same site, e.g. app.shop.in and api.shop.in). `\'lax\'` = sent on top-level navigation. `\'none\'` = always sent, **requires secure: true**, needed when the frontend and API are on **different sites** (e.g. myapp.vercel.app and myapi.onrender.com) and then you MUST add CSRF protection (Day 6).\n- **path: \'/api/auth\'**: the cookie is sent only to auth endpoints, not with every image or API request.\n- **maxAge**: in milliseconds, e.g. `7 * 24 * 60 * 60 * 1000`.\n\nTo read cookies in Express install `cookie-parser` and use `req.cookies.refreshToken`. To clear, call `res.clearCookie(\'refreshToken\', { path: \'/api/auth\' })` with the **same path/domain options**, otherwise the browser keeps it.',
      tip: 'Free-tier tip: putting frontend and backend under one domain (Vercel rewrite /api → Render, or custom domains app.x.in + api.x.in) lets you use SameSite=Strict/Lax and avoids third-party-cookie blocking in Safari and Chrome.',
    },
    {
      heading: 'Refresh token rotation and reuse detection',
      content:
        '**Rotation** means: every time a refresh token is used, the server **invalidates it and issues a brand-new one**. A refresh token is therefore **single-use**.\n\n**Reuse detection**: if an **already-used** refresh token is presented again, something is wrong: either the attacker or the real user is using a stolen copy. The safe reaction is to **revoke the whole token family** (all sessions of that user, or that login chain) and force a new login.\n\nImplementation in MongoDB:\n\n1. Store each refresh token as a document `{ user, tokenHash, family, expiresAt, revokedAt, replacedBy }`. Store a **SHA-256 hash**, not the raw token (if the DB leaks, tokens are useless).\n2. On refresh: find by hash. Not found → 401. Found but revoked → **reuse!** revoke every token of that family → 401. Valid → mark revoked, create a new one in the same family, return a new access token.\n3. A **TTL index** on `expiresAt` makes MongoDB delete expired tokens automatically.\n\nThis also gives you "**log out from all devices**": delete all refresh tokens of the user.',
      syntax:
        "const refreshTokenSchema = new mongoose.Schema({\n  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },\n  tokenHash: { type: String, unique: true },\n  family: String,\n  revokedAt: Date,\n  expiresAt: Date,\n  userAgent: String,\n});\nrefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL",
    },
    {
      heading: 'Protecting routes on the server',
      content:
        'A `requireAuth` middleware runs before protected controllers:\n\n1. Read `Authorization: Bearer <token>`. Missing → **401**.\n2. `jwt.verify(token, ACCESS_SECRET, { algorithms: [\'HS256\'] })`. Invalid signature → **401**. Expired → **401** with a machine-readable code like `{ code: \'TOKEN_EXPIRED\' }` so the client knows to refresh.\n3. Set `req.user = { id: payload.sub, role: payload.role }` and call `next()`.\n\nApply it per router (`router.use(requireAuth)`) or per route. Public routes (login, register, product listing) stay outside.\n\nAlways specify `algorithms` when verifying to block the "alg: none" and algorithm-confusion attacks, and keep **different secrets** for access and refresh tokens (or use an opaque random string for the refresh token, as in our example).',
    },
    {
      heading: 'Protecting routes on the client (React)',
      content:
        'In React, auth state lives in an **AuthProvider** (Context) with `user`, `status` (\'loading\' | \'authenticated\' | \'guest\'), `login()`, `logout()`.\n\n- On app start, call `/auth/refresh` once. While this runs, `status` is `\'loading\'`: show a splash screen, NOT the login page (otherwise users see a flash of the login page on every reload).\n- A **ProtectedRoute** component (or a layout route) checks status: loading → spinner, guest → `<Navigate to="/login" state={{ from: location }} replace />`, authenticated → `<Outlet />`.\n- After login, navigate back to `location.state.from` (the page they wanted).\n- The **axios response interceptor** catches 401 TOKEN_EXPIRED, calls refresh **once** even if 5 requests fail at the same moment (single-flight promise), then retries them. If refresh fails, log out.\n\nRemember: client-side protection is only **UX**. The real protection is the server middleware; a hacker can always change React code in the browser.',
      tip: 'Coming next (Day 5): roles and permissions (RBAC), ownership checks and an admin panel built on top of req.user.',
    },
  ],
  examples: [
    {
      title: 'The full auth flow: register, login, /me, refresh rotation, reuse detection, logout (API Lab)',
      scenario:
        'Simulate the complete token lifecycle with in-memory data. Tokens are deterministic strings and the "hash" is fake because the API Lab cannot load bcrypt or jsonwebtoken; the next example has the real code. Cookies are read from the Cookie header like cookie-parser does.',
      steps: [
        'Create in-memory users and a refreshTokens map { token: { userId, family, revoked } }',
        'Write register (201), login (sets refresh cookie, returns accessToken), requireAuth and GET /me',
        'Write POST /api/auth/refresh with rotation and reuse detection',
        'Run the requests: register, login, /me without and with token, refresh twice with the SAME old cookie, logout',
      ],
      code: `// What the real response headers look like after login:
// HTTP/1.1 200 OK
// Set-Cookie: refreshToken=9f2c...; Max-Age=604800; Path=/api/auth; HttpOnly; Secure; SameSite=Strict
// Content-Type: application/json
// { "accessToken": "eyJhbGciOiJIUzI1NiIs...", "user": { "id": "...", "name": "Asha", "role": "user" } }`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// ---------- DEMO ONLY: in real code use bcrypt + jsonwebtoken + crypto.randomBytes ----------
const fakeHash = (pw) => 'bcrypt$' + pw.split('').reverse().join('');
let accessSeq = 0, refreshSeq = 0, familySeq = 0;
const accessTokens = {};   // token -> userId   (real: signed JWT, verified without DB)
const refreshTokens = {};  // token -> { userId, family, revoked }  (real: hashed in MongoDB)
const users = [];

const parseCookies = (req) => Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean)
  .map(c => c.trim().split('=')).map(([k, ...v]) => [k, v.join('=')]));

function issueTokens(res, userId, family) {
  const accessToken = 'access-' + (++accessSeq);
  accessTokens[accessToken] = userId;
  const refreshToken = 'refresh-' + (++refreshSeq);
  refreshTokens[refreshToken] = { userId, family, revoked: false };
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/api/auth' });
  return { accessToken, refreshToken };
}

function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Authentication required' });
  const userId = accessTokens[token];
  if (!userId) return res.status(401).json({ message: 'Token expired or invalid', code: 'TOKEN_EXPIRED' });
  req.user = users.find(u => u.id === userId);
  next();
}

const auth = express.Router();

auth.post('/register', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { name, password } = req.body;
  if (!name || !email.includes('@') || !password || password.length < 8)
    return res.status(400).json({ message: 'Name, valid email and 8+ char password are required' });
  if (users.some(u => u.email === email)) return res.status(409).json({ message: 'Email already registered' });
  const user = { id: 'u' + (users.length + 1), name, email, role: 'user', passwordHash: fakeHash(password) };
  users.push(user);
  res.status(201).json({ user: { id: user.id, name, email, role: user.role } });
});

auth.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = users.find(u => u.email === email);
  if (!user || user.passwordHash !== fakeHash(req.body.password || ''))
    return res.status(401).json({ message: 'Invalid email or password' });
  const { accessToken, refreshToken } = issueTokens(res, user.id, 'fam-' + (++familySeq));
  res.json({ accessToken, user: { id: user.id, name: user.name, role: user.role }, debugCookie: refreshToken });
});

auth.post('/refresh', (req, res) => {
  const token = parseCookies(req).refreshToken;
  const record = token && refreshTokens[token];
  if (!record) return res.status(401).json({ message: 'No valid session' });
  if (record.revoked) {
    // REUSE DETECTED: kill the whole family
    Object.values(refreshTokens).filter(t => t.family === record.family).forEach(t => { t.revoked = true; });
    return res.status(401).json({ message: 'Refresh token reuse detected. All sessions in this family revoked.' });
  }
  record.revoked = true;                                  // rotation: old token is now used
  const { accessToken, refreshToken } = issueTokens(res, record.userId, record.family);
  res.json({ accessToken, debugCookie: refreshToken });
});

auth.post('/logout', (req, res) => {
  const token = parseCookies(req).refreshToken;
  if (token && refreshTokens[token]) refreshTokens[token].revoked = true;
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.sendStatus(204);
});

app.use('/api/auth', auth);
app.get('/api/me', requireAuth, (req, res) => res.json({ id: req.user.id, name: req.user.name, role: req.user.role }));

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/auth/register', body: { name: 'Asha', email: ' Asha@Example.com ', password: 'secret123' } },
          { method: 'POST', url: '/api/auth/register', body: { name: 'Asha 2', email: 'asha@example.com', password: 'secret123' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'asha@example.com', password: 'wrongpass' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'asha@example.com', password: 'secret123' } },
          { method: 'GET', url: '/api/me' },
          { method: 'GET', url: '/api/me', headers: { Authorization: 'Bearer access-1' } },
          { method: 'POST', url: '/api/auth/refresh', headers: { Cookie: 'refreshToken=refresh-1' } },
          { method: 'POST', url: '/api/auth/refresh', headers: { Cookie: 'refreshToken=refresh-1' } },
          { method: 'POST', url: '/api/auth/refresh', headers: { Cookie: 'refreshToken=refresh-2' } },
          { method: 'POST', url: '/api/auth/logout', headers: { Cookie: 'refreshToken=refresh-2' } },
        ],
      },
      result: "POST /api/auth/register → 201 {\"user\":{\"id\":\"u1\",\"name\":\"Asha\",\"email\":\"asha@example.com\",\"role\":\"user\"}}\nPOST /api/auth/register → 409 {\"message\":\"Email already registered\"}\nPOST /api/auth/login → 401 {\"message\":\"Invalid email or password\"}\nPOST /api/auth/login → 200 {\"accessToken\":\"access-1\",\"user\":{\"id\":\"u1\",\"name\":\"Asha\",\"role\":\"user\"},\"debugCookie\":\"refresh-1\"}\nGET /api/me → 401 {\"message\":\"Authentication required\"}\nGET /api/me → 200 {\"id\":\"u1\",\"name\":\"Asha\",\"role\":\"user\"}\nPOST /api/auth/refresh → 200 {\"accessToken\":\"access-2\",\"debugCookie\":\"refresh-2\"}\nPOST /api/auth/refresh → 401 {\"message\":\"Refresh token reuse detected. All sessions in this family revoked.\"}\nPOST /api/auth/refresh → 401 {\"message\":\"Refresh token reuse detected. All sessions in this family revoked.\"}\nPOST /api/auth/logout → 204",
      explanation:
        'Registration normalises " Asha@Example.com " to lowercase, so the second registration hits 409. The wrong password returns a generic 401. Login returns access-1 and sets refresh-1 in a cookie (debugCookie is printed only so you can see it; never return the refresh token in JSON in real code). /me without a header is 401; with Bearer access-1 it works. The first refresh with refresh-1 rotates it into refresh-2. Using refresh-1 AGAIN is reuse: the server revokes the whole family, so even the legitimate refresh-2 is now rejected and the user must log in again. That is exactly the protection rotation gives you when a token is stolen.',
    },
    {
      title: 'Real backend: User model, token service, auth controller, requireAuth',
      scenario: 'Implement the same flow with MongoDB, bcrypt, jsonwebtoken and cookie-parser on Express 5.',
      steps: [
        'npm i bcrypt jsonwebtoken cookie-parser -w server',
        'Add JWT_ACCESS_SECRET (64 random hex chars) to server/.env; add app.use(cookieParser())',
        'Create the User and RefreshToken models',
        'Create services/token.service.js with createSession, rotate and revoke helpers',
        'Create the auth controller and routes; protect other routers with requireAuth',
      ],
      code: `// ===== models/User.js =====
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false }, // never returned by default
  role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};
userSchema.methods.toPublic = function () {
  return { id: this._id, name: this.name, email: this.email, role: this.role };
};
export const User = mongoose.model('User', userSchema);

// ===== models/RefreshToken.js =====
const rtSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  family: { type: String, required: true, index: true },
  revokedAt: Date,
  expiresAt: { type: Date, required: true },
  userAgent: String,
});
rtSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });   // MongoDB TTL auto-cleanup
export const RefreshToken = mongoose.model('RefreshToken', rtSchema);

// ===== services/token.service.js =====
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { RefreshToken } from '../models/RefreshToken.js';

const REFRESH_DAYS = 7;
const sha256 = (t) => crypto.createHash('sha256').update(t).digest('hex');

export const signAccessToken = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m', algorithm: 'HS256' });

export async function createRefreshToken(user, family = crypto.randomUUID(), userAgent = '') {
  const token = crypto.randomBytes(48).toString('base64url');           // opaque, unguessable
  await RefreshToken.create({
    user: user._id, tokenHash: sha256(token), family, userAgent,
    expiresAt: new Date(Date.now() + REFRESH_DAYS * 864e5),
  });
  return token;
}

export async function rotateRefreshToken(oldToken) {
  const record = await RefreshToken.findOne({ tokenHash: sha256(oldToken) }).populate('user');
  if (!record || record.expiresAt < new Date()) return { error: 'invalid' };
  if (record.revokedAt) {
    await RefreshToken.updateMany({ family: record.family }, { revokedAt: new Date() }); // reuse!
    return { error: 'reuse' };
  }
  record.revokedAt = new Date();
  await record.save();
  const token = await createRefreshToken(record.user, record.family, record.userAgent);
  return { user: record.user, token };
}

export const revokeRefreshToken = (token) =>
  RefreshToken.updateOne({ tokenHash: sha256(token) }, { revokedAt: new Date() });
export const revokeAllForUser = (userId) =>
  RefreshToken.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });

// ===== controllers/auth.controller.js =====
import { User } from '../models/User.js';
import * as tokens from '../services/token.service.js';

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',     // use 'none' + CSRF token if API is on another site
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

async function sendSession(res, user, req, family) {
  const refreshToken = await tokens.createRefreshToken(user, family, req.get('user-agent'));
  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.json({ accessToken: tokens.signAccessToken(user), user: user.toPublic() });
}

export async function register(req, res) {
  const { name, email, password } = req.body;                     // validated by Zod
  if (await User.exists({ email })) return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password });       // role defaults to 'user'
  res.status(201);
  await sendSession(res, user, req);
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.checkPassword(req.body.password)))
    return res.status(401).json({ message: 'Invalid email or password' });
  await sendSession(res, user, req);
}

export async function refresh(req, res) {
  const old = req.cookies.refreshToken;
  if (!old) return res.status(401).json({ message: 'No session' });
  const result = await tokens.rotateRefreshToken(old);
  if (result.error) {
    res.clearCookie('refreshToken', { ...cookieOptions, maxAge: undefined });
    return res.status(401).json({ message: result.error === 'reuse' ? 'Session revoked' : 'Session expired' });
  }
  res.cookie('refreshToken', result.token, cookieOptions);
  res.json({ accessToken: tokens.signAccessToken(result.user), user: result.user.toPublic() });
}

export async function logout(req, res) {
  if (req.cookies.refreshToken) await tokens.revokeRefreshToken(req.cookies.refreshToken);
  res.clearCookie('refreshToken', { ...cookieOptions, maxAge: undefined });
  res.sendStatus(204);
}

export async function logoutAll(req, res) {
  await tokens.revokeAllForUser(req.user.id);
  res.clearCookie('refreshToken', { ...cookieOptions, maxAge: undefined });
  res.sendStatus(204);
}

// ===== middleware/auth.js =====
import jwt from 'jsonwebtoken';
export function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    res.status(401).json({ message: expired ? 'Access token expired' : 'Invalid token', code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID' });
  }
}

// ===== routes/auth.routes.js =====
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerSchema, loginSchema } from '@mernshop/shared';
import { validate } from '../middleware/validate.js';
import * as c from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });
const router = Router();
router.post('/register', validate(registerSchema), c.register);
router.post('/login', loginLimiter, validate(loginSchema), c.login);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);
router.post('/logout-all', requireAuth, c.logoutAll);
router.get('/me', requireAuth, async (req, res) => res.json((await User.findById(req.user.id)).toPublic()));
export default router;`,
      result:
        'Login returns { accessToken, user } and DevTools → Application → Cookies shows refreshToken with HttpOnly ✓ and Path /api/auth. document.cookie in the console does NOT show it. Every refresh changes the cookie value; replaying an old cookie value returns 401 "Session revoked" and logs out all devices in that family.',
      explanation:
        'select: false keeps password hashes out of every query unless you ask with select("+password"). The pre("save") hook hashes only when the password changed (Mongoose 8 supports async hooks without next). The refresh token is an opaque random string (not a JWT): it is only meaningful to our database, can be revoked, and is stored as a SHA-256 hash. maxAge must be removed when clearing because clearCookie sets an expired date itself, and the path must match, or the browser keeps the old cookie.',
    },
    {
      title: 'Real frontend: AuthProvider, silent refresh interceptor (single flight) and ProtectedRoute',
      scenario:
        'Make the React app stay logged in across reloads, refresh expired tokens transparently, avoid 5 parallel refresh calls, and guard private pages with React Router 7.',
      steps: [
        'Extend src/api/client.js from Day 2 with a 401 interceptor that refreshes once and retries',
        'Create AuthProvider with bootstrap (refresh on load), login, logout',
        'Create ProtectedRoute using <Outlet /> and <Navigate />',
        'Wrap private routes and test: reload page, wait 15 min (or set expiresIn: "20s"), logout',
      ],
      code: `// ===== client/src/api/client.js (additions) =====
import axios from 'axios';
export const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL ?? '') + '/api', withCredentials: true });

let accessToken = null;
export const setAccessToken = (t) => { accessToken = t; };
let onSessionExpired = () => {};
export const setOnSessionExpired = (fn) => { onSessionExpired = fn; };

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = 'Bearer ' + accessToken;
  return config;
});

let refreshPromise = null;                       // single flight: shared by all 401s
export function refreshSession() {
  refreshPromise ??= axios
    .post((import.meta.env.VITE_API_URL ?? '') + '/api/auth/refresh', null, { withCredentials: true })
    .then((r) => { setAccessToken(r.data.accessToken); return r.data; })
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const expired = error.response?.status === 401 && error.response.data?.code === 'TOKEN_EXPIRED';
    if (expired && !original._retry) {
      original._retry = true;                    // avoid infinite loops
      try {
        await refreshSession();
        return api(original);                    // retry with the new token
      } catch {
        setAccessToken(null);
        onSessionExpired();                      // AuthProvider → guest
      }
    }
    return Promise.reject(error);
  }
);

// ===== client/src/auth/AuthProvider.jsx =====
import { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, refreshSession, setAccessToken, setOnSessionExpired } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null });
  const qc = useQueryClient();

  useEffect(() => {
    setOnSessionExpired(() => setState({ status: 'guest', user: null }));
    refreshSession()                                      // bootstrap from the httpOnly cookie
      .then((d) => setState({ status: 'authenticated', user: d.user }))
      .catch(() => setState({ status: 'guest', user: null }));
  }, []);

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    setAccessToken(data.accessToken);
    setState({ status: 'authenticated', user: data.user });
  }

  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    setAccessToken(null);
    qc.clear();                                          // drop the previous user's cached data!
    setState({ status: 'guest', user: null });
  }

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

// ===== client/src/auth/ProtectedRoute.jsx =====
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthProvider';

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <div className="splash">Loading...</div>;
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

// ===== client/src/pages/LoginPage.jsx =====
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthProvider';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from?.pathname || '/dashboard';
  const [error, setError] = useState('');
  async function onSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await login({ email: form.get('email'), password: form.get('password') });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }
  return (
    <form onSubmit={onSubmit}>
      <input name="email" type="email" autoComplete="username" required />
      <input name="password" type="password" autoComplete="current-password" required />
      {error && <p role="alert">{error}</p>}
      <button>Log in</button>
    </form>
  );
}

// ===== client/src/App.jsx =====
// <AuthProvider>
//   <Routes>
//     <Route path="/login" element={<LoginPage />} />
//     <Route element={<ProtectedRoute />}>
//       <Route path="/dashboard" element={<Dashboard />} />
//       <Route path="/orders" element={<Orders />} />
//     </Route>
//   </Routes>
// </AuthProvider>`,
      result:
        'Reloading /dashboard briefly shows "Loading..." and then the dashboard (session restored from the cookie), never the login page. Opening /orders while logged out redirects to /login and, after login, back to /orders. When the access token expires, three parallel queries get 401 but the Network tab shows only ONE POST /api/auth/refresh followed by the three retried requests.',
      explanation:
        'refreshPromise ??= ... stores the in-flight refresh so concurrent 401s await the same promise (single flight). The _retry flag prevents an endless loop if the retried request fails again. The refresh call uses plain axios (not the api instance) so its own 401 does not trigger the interceptor recursively. qc.clear() on logout is essential: otherwise the next user on a shared computer briefly sees the previous user\'s cached orders.',
    },
    {
      title: 'Silent refresh with single flight, visualised (playground)',
      scenario:
        'See why single-flight matters. A fake server expires access tokens every 5 seconds. Fire 4 parallel API calls after expiry, with and without single-flight, and count refresh calls.',
      steps: [
        'Click Run, then "Log in"',
        'Wait until the token timer says expired (5 s), then click "4 parallel requests (single flight)"',
        'Repeat with the naive button and compare the refresh count and the log',
      ],
      code: `let refreshPromise = null;
function refreshOnce() {
  refreshPromise ??= server.refresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
}`,
      playground: {
        jsx: `const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const server = {
  issuedAt: 0, refreshCount: 0, rotation: 0,
  async login() { await wait(200); this.issuedAt = Date.now(); this.rotation = 1; return 'access-' + this.rotation; },
  async refresh() {
    await wait(400);
    this.refreshCount += 1; this.rotation += 1; this.issuedAt = Date.now();
    return 'access-' + this.rotation;
  },
  async get(path, token) {
    await wait(150);
    if (!token || token !== 'access-' + this.rotation || Date.now() - this.issuedAt > 5000) {
      const e = new Error('401 TOKEN_EXPIRED'); e.status = 401; throw e;
    }
    return path + ' OK with ' + token;
  },
};

function App() {
  const tokenRef = React.useRef(null);
  const [log, setLog] = React.useState([]);
  const [now, setNow] = React.useState(Date.now());
  const add = (m) => setLog((l) => [...l.slice(-11), m]);
  React.useEffect(() => { const t = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(t); }, []);

  const refreshRef = React.useRef(null);
  const refreshSingle = () => {
    refreshRef.current ??= server.refresh().then((t) => { tokenRef.current = t; return t; }).finally(() => { refreshRef.current = null; });
    return refreshRef.current;
  };
  const refreshNaive = () => server.refresh().then((t) => { tokenRef.current = t; return t; });

  async function call(path, refreshFn) {
    try { return await server.get(path, tokenRef.current); }
    catch (e) {
      if (e.status !== 401) throw e;
      add(path + ': 401 → refreshing');
      await refreshFn();
      return server.get(path, tokenRef.current);
    }
  }

  async function burst(single) {
    setLog([]);
    const before = server.refreshCount;
    const fn = single ? refreshSingle : refreshNaive;
    const results = await Promise.allSettled(['/orders', '/cart', '/me', '/wishlist'].map((p) => call(p, fn)));
    results.forEach((r) => add(r.status === 'fulfilled' ? r.value : 'FAILED: ' + r.reason.message));
    add('refresh calls in this burst: ' + (server.refreshCount - before));
  }

  const age = server.issuedAt ? Math.floor((now - server.issuedAt) / 1000) : null;
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <button onClick={async () => { tokenRef.current = await server.login(); setLog(['logged in, token ' + tokenRef.current]); }}>Log in</button>{' '}
      <button onClick={() => burst(true)}>4 parallel requests (single flight)</button>{' '}
      <button onClick={() => burst(false)}>4 parallel requests (naive)</button>
      <p>Token: <b>{tokenRef.current || 'none'}</b> {age !== null && (age >= 5 ? <span style={{ color: 'crimson' }}>expired</span> : <span>valid, {5 - age}s left</span>)}</p>
      <pre style={{ background: '#111827', color: '#d1fae5', padding: 12, borderRadius: 8, minHeight: 120 }}>{log.join('\\n')}</pre>
    </div>
  );
}`,
      },
      result:
        'Single flight after expiry: four "401 → refreshing" lines, then four "OK" lines and "refresh calls in this burst: 1". Naive: "refresh calls in this burst: 4", and because each refresh rotates the token, requests that refreshed earlier now hold a superseded token, so some show FAILED: 401 TOKEN_EXPIRED.',
      explanation:
        'With rotation, every refresh invalidates the previous tokens. Four parallel refreshes race each other: only the last token is valid, so earlier retries fail, and with real refresh-token rotation the reused cookie would even trigger reuse detection and log the user out. Sharing one promise solves it: all waiting requests resume with the same new token.',
    },
  ],
  interview: [
    {
      q: 'Why use both an access token and a refresh token instead of one long-lived JWT?',
      a: 'A long-lived JWT cannot be revoked and is dangerous if stolen. With two tokens, the access token is short-lived (10-15 min) and used on every request, so a leak has a small window. The refresh token is long-lived but stored in an httpOnly cookie (not readable by JS), sent only to the refresh endpoint, stored server-side (hashed) so it can be revoked, and rotated on every use.',
      level: 'Medium',
    },
    {
      q: 'Where should you store tokens in the browser? Compare localStorage, memory and httpOnly cookies.',
      a: 'localStorage: easy, survives reloads, but any XSS script can read and exfiltrate the token. Memory (JS variable/React state): not readable after reload and harder for XSS to steal persistently, but lost on refresh. httpOnly cookie: JavaScript cannot read it at all, sent automatically by the browser, but because it is automatic you must defend against CSRF (SameSite, CSRF token). Common best practice: access token in memory, refresh token in an httpOnly Secure SameSite cookie.',
      level: 'Medium',
    },
    {
      q: 'What is refresh token rotation and reuse detection?',
      a: 'Rotation: each refresh token is single-use; on every refresh the server revokes it and issues a new one. Reuse detection: if a revoked (already used) refresh token is presented again, it means a copy was stolen, so the server revokes the entire token family/all sessions and forces re-login. It limits the damage of a stolen refresh token.',
      level: 'Hard',
    },
    {
      q: 'Explain the httpOnly, Secure and SameSite cookie attributes.',
      a: 'httpOnly: the cookie is not accessible via document.cookie, protecting it from XSS theft. Secure: sent only over HTTPS. SameSite=Strict: never sent on cross-site requests; Lax: sent on top-level GET navigations from other sites; None: always sent (requires Secure) and needed for cross-site setups like app.vercel.app + api.onrender.com, which then need CSRF protection.',
      level: 'Medium',
    },
    {
      q: 'Why is bcrypt preferred over SHA-256 for passwords?',
      a: 'SHA-256 is designed to be fast, so attackers can test billions of guesses per second on GPUs. bcrypt is deliberately slow with a configurable cost factor and includes a random per-password salt, defeating rainbow tables and slowing brute force. Argon2id is an even more modern alternative. SHA-256 is fine for hashing random high-entropy tokens (like refresh tokens) because those cannot be guessed.',
      level: 'Medium',
    },
    {
      q: 'Is the JWT payload encrypted? What should you put in it?',
      a: 'No. A JWT (JWS) is only Base64URL-encoded and signed; anyone can decode and read the payload at jwt.io. The signature only guarantees it was not modified. Put minimal non-sensitive claims: sub (user id), role, exp, iat, maybe a token version. Never passwords, emails if avoidable, or personal data.',
      level: 'Easy',
    },
    {
      q: 'How do you log a user out when using JWT access tokens that are stateless?',
      a: 'Revoke the refresh token in the database and clear its cookie; the client discards the in-memory access token. The access token technically remains valid until it expires (max 15 min), which is acceptable. For instant revocation (e.g. account banned) use a short expiry plus a tokenVersion claim checked against the user record, or a denylist of jti values in Redis.',
      level: 'Hard',
    },
    {
      q: 'How does the React app stay logged in after a page reload if the access token is only in memory?',
      a: 'On startup the AuthProvider calls POST /api/auth/refresh. The browser automatically sends the httpOnly refresh cookie; the server validates and rotates it and returns a new access token and the user. During this call the app shows a loading state so the user does not see a flash of the login page.',
      level: 'Medium',
    },
    {
      q: 'Several API requests fail with 401 at the same time because the token expired. How do you avoid multiple refresh calls?',
      a: 'Use a single-flight refresh: store the in-flight refresh promise in a module variable; every 401 handler awaits that same promise, then retries its request with the new token. Mark retried requests (_retry) to avoid loops, and log out if the refresh itself fails. Libraries like axios-auth-refresh implement the same idea.',
      level: 'Hard',
    },
    {
      q: 'Why should the login error be "Invalid email or password" instead of "Email not found"?',
      a: 'Specific messages enable user enumeration: attackers learn which emails are registered and then target them with password spraying or phishing. A generic message (and similar response time) reveals nothing. Combine with rate limiting and account lockout/CAPTCHA after repeated failures.',
      level: 'Easy',
    },
    {
      q: 'Is a ProtectedRoute in React enough to secure private data?',
      a: 'No. Client-side guards are only for user experience; anyone can modify JavaScript in the browser or call the API directly. Every private API endpoint must check authentication (and authorization) on the server with middleware like requireAuth. The React guard just prevents showing pages that would fail anyway.',
      level: 'Easy',
    },
    {
      q: 'Why do you specify algorithms: ["HS256"] in jwt.verify?',
      a: 'To prevent algorithm-confusion attacks: if the server accepts whatever alg the token header says, an attacker could send alg "none" (unsigned) or, with RS256 setups, trick the server into using the public key as an HMAC secret. Pinning the expected algorithm makes the library reject any other algorithm.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Write Zod schemas for register (name 2-50, email, password min 8 with at least one letter and one number, confirmPassword must match) and login, in the shared package.',
      hint: 'Use .refine on the object for confirmPassword and set path: ["confirmPassword"].',
      solution: `import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Enter a valid email');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(50),
  email,
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Za-z]/, 'Include at least one letter')
    .regex(/\\d/, 'Include at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

// Server: strip confirmPassword before saving
// const { confirmPassword, ...data } = req.body;`,
    },
    {
      task: 'Add a "change password" endpoint: requires the current password, saves the new hashed password, and revokes ALL refresh tokens of the user except it issues a fresh session for the current device.',
      hint: 'select("+password"), checkPassword, revokeAllForUser, then createRefreshToken.',
      solution: `// routes: router.post('/change-password', requireAuth, validate(changePasswordSchema), changePassword);
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!user || !(await user.checkPassword(currentPassword))) {
    return res.status(400).json({ message: 'Current password is incorrect', errors: { currentPassword: 'Incorrect password' } });
  }
  user.password = newPassword;              // pre('save') hashes it
  await user.save();

  await tokens.revokeAllForUser(user._id);  // log out every other device
  const refreshToken = await tokens.createRefreshToken(user, undefined, req.get('user-agent'));
  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.json({ accessToken: tokens.signAccessToken(user), message: 'Password changed' });
}`,
    },
    {
      task: 'Build a "Active sessions" feature: GET /api/auth/sessions lists the user\'s non-revoked refresh tokens (id, userAgent, expiresAt), and DELETE /api/auth/sessions/:id revokes one. Show them in a React page with a "Log out" button per device.',
      hint: 'Never return tokenHash. Filter by user to prevent revoking others\' sessions.',
      solution: `// ===== server =====
router.get('/sessions', requireAuth, async (req, res) => {
  const sessions = await RefreshToken.find({ user: req.user.id, revokedAt: null, expiresAt: { $gt: new Date() } })
    .select('userAgent expiresAt')
    .sort('-expiresAt')
    .lean();
  res.json({ data: sessions });
});

router.delete('/sessions/:id', requireAuth, async (req, res) => {
  const r = await RefreshToken.updateOne({ _id: req.params.id, user: req.user.id, revokedAt: null }, { revokedAt: new Date() });
  if (!r.matchedCount) return res.status(404).json({ message: 'Session not found' });
  res.sendStatus(204);
});

// ===== client =====
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export default function SessionsPage() {
  const qc = useQueryClient();
  const { data, isPending } = useQuery({ queryKey: ['sessions'], queryFn: () => api.get('/auth/sessions').then((r) => r.data.data) });
  const revoke = useMutation({
    mutationFn: (id) => api.delete('/auth/sessions/' + id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
  if (isPending) return <p>Loading...</p>;
  return (
    <ul>
      {data.map((s) => (
        <li key={s._id}>
          {s.userAgent || 'Unknown device'} - expires {new Date(s.expiresAt).toLocaleDateString('en-IN')}
          <button disabled={revoke.isPending} onClick={() => revoke.mutate(s._id)}>Log out</button>
        </li>
      ))}
    </ul>
  );
}`,
    },
    {
      task: 'Write a GuestOnlyRoute for /login and /register that redirects already logged-in users to /dashboard, and a useRequireRole-free "AccountMenu" that shows Login/Register or the user name + Logout based on auth status.',
      hint: 'Mirror ProtectedRoute logic.',
      solution: `import { Navigate, Outlet, Link } from 'react-router';
import { useAuth } from './AuthProvider';

export function GuestOnlyRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <div className="splash">Loading...</div>;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function AccountMenu() {
  const { status, user, logout } = useAuth();
  if (status === 'loading') return null;
  if (status === 'guest') {
    return (
      <nav>
        <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
      </nav>
    );
  }
  return (
    <nav>
      Hi, {user.name} <button onClick={logout}>Logout</button>
    </nav>
  );
}

// Routes:
// <Route element={<GuestOnlyRoute />}>
//   <Route path="/login" element={<LoginPage />} />
//   <Route path="/register" element={<RegisterPage />} />
// </Route>`,
    },
  ],
  quiz: [
    {
      question: 'Where is the refresh token stored in the recommended MERN pattern?',
      options: ['localStorage', 'In a React state variable', 'Inside the access token payload', 'In an httpOnly, Secure, SameSite cookie'],
      answer: 3,
      explanation: 'httpOnly prevents JavaScript (and XSS) from reading it; the browser sends it automatically to the refresh endpoint.',
    },
    {
      question: 'A refresh token that was already used is presented again. What should a server with rotation and reuse detection do?',
      options: [
        'Revoke the whole token family and return 401',
        'Accept it and issue new tokens',
        'Return 200 with the same access token',
        'Ignore it and keep the session alive',
      ],
      answer: 0,
      explanation: 'Reuse means a copy exists somewhere else (possibly stolen). Revoking the family forces a fresh login.',
    },
    {
      question: 'Why does the access token have a short lifetime like 15 minutes?',
      options: [
        'JWTs cannot be longer than 15 minutes',
        'To make the token smaller',
        'Because a stolen access token cannot be revoked easily, so a short life limits the damage',
        'Because bcrypt requires it',
      ],
      answer: 2,
      explanation: 'Stateless tokens are valid until exp. Short lifetimes plus revocable refresh tokens balance security and convenience.',
    },
    {
      question: 'What does res.clearCookie("refreshToken") fail to do if the cookie was set with path "/api/auth"?',
      options: [
        'It throws an error',
        'It does not delete the cookie, because the clear must use the same path (and domain) options',
        'It deletes all cookies',
        'It deletes the cookie only in Firefox',
      ],
      answer: 1,
      explanation: 'Browsers identify a cookie by name + domain + path. Pass { path: "/api/auth" } (same options) when clearing.',
    },
    {
      question: 'In the React app, what is the purpose of the status "loading" in AuthProvider?',
      options: [
        'To wait for the startup refresh call so users are not briefly redirected to /login on reload',
        'To show a spinner on every API request',
        'To store the password while logging in',
        'It is required by React Router 7',
      ],
      answer: 0,
      explanation: 'Until the refresh call finishes we do not know whether the user is logged in. Redirecting during that time causes a login-page flash.',
    },
  ],
};
