// Browser-only sign-in for NGU.
// There is no server: accounts live in this browser's localStorage and passwords are stored only
// as salted SHA-256 hashes. This keeps each student's progress separate on a shared computer, but it
// is NOT real security (anyone with dev tools can bypass it). A real deployment needs a backend.
import { useEffect, useState, createElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { serverMode, api } from './serverApi.js';
import { supabase, supaMode } from './supabase.js';
import { stopSync } from './cloudSync.js';

const USERS = 'upskillr-auth-users';
const SESSION = 'upskillr-auth-session';
const OWNER = 'upskillr-auth-owner'; // whose progress is currently "live" in localStorage
const BUCKET = 'upskillr-auth-data:'; // saved progress of each user while someone else is signed in
const EVT = 'upskillr-auth';

// ---------- SHA-256 (pure JS, works on http, https and file://) ----------
const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
export function sha256(str) {
  const bytes = new TextEncoder().encode(str);
  const len = bytes.length;
  const total = ((len + 9 + 63) >> 6) << 6;
  const m = new Uint8Array(total);
  m.set(bytes);
  m[len] = 0x80;
  const bits = len * 8;
  const dv = new DataView(m.buffer);
  dv.setUint32(total - 8, Math.floor(bits / 2 ** 32));
  dv.setUint32(total - 4, bits >>> 0);
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return H.map((x) => x.toString(16).padStart(8, '0')).join('');
}
const hashPw = (salt, pw) => sha256(`${salt}:${pw}`);

// Built-in default account (only its hash is stored in the code).
const DEFAULT_USER = {
  username: 'chetan', name: 'Er. Chetan D Morey', email: '', role: 'admin', builtIn: true,
  salt: 'upskillr-default-1806', hash: '3240ea4671c3880aa0aa53536fee969f0421f9dcea3144856cb500b8055369e3', createdAt: '2026-01-01T00:00:00.000Z',
};

// ---------- storage helpers ----------
const ls = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};
const readJSON = (raw, d) => { try { return raw ? JSON.parse(raw) : d; } catch { return d; } };
const norm = (u) => String(u || '').trim().toLowerCase();

function storedUsers() { return readJSON(ls.get(USERS), []); }
// Supabase: everyone who registered (loaded on demand for the admin pages)
let supaUsers = null;
let supaUsersLoading = false;
export async function loadSupabaseUsers() {
  if (!supaMode) return [];
  supaUsersLoading = true;
  const { data } = await supabase.from('profiles').select('id, username, name, role, active, created_at').order('created_at', { ascending: false }).limit(2000);
  supaUsers = (data || []).map((p) => ({ id: p.id, username: p.username, name: p.name, email: '', role: p.role, active: p.active, createdAt: p.created_at, server: true }));
  supaUsersLoading = false;
  window.dispatchEvent(new Event(EVT));
  return supaUsers;
}
export async function setSupabaseRole(username, role) {
  const u = (supaUsers || []).find((x) => x.username === username);
  if (!u) return false;
  const { error } = await supabase.from('profiles').update({ role }).eq('id', u.id);
  if (error) { window.alert(error.message); return false; }
  await loadSupabaseUsers();
  return true;
}
export function allUsers() {
  if (supaMode && getSession()?.server) {
    if (!supaUsers && !supaUsersLoading) loadSupabaseUsers();
    return supaUsers || [];
  }
  const list = storedUsers().filter((u) => norm(u.username) !== DEFAULT_USER.username);
  return [DEFAULT_USER, ...list];
}
const findUser = (username) => allUsers().find((u) => norm(u.username) === norm(username));

// App progress keys that belong to the signed-in user.
const isAppKey = (k) => (k.startsWith('xlpbi-') || k.startsWith('upskillr-')) && !k.startsWith('upskillr-auth');
function liveKeys() {
  const out = [];
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && isAppKey(k)) out.push(k); } } catch { /* ignore */ }
  return out;
}
function stash(username) {
  const data = {};
  liveKeys().forEach((k) => { data[k] = ls.get(k); });
  ls.set(BUCKET + norm(username), JSON.stringify(data));
  liveKeys().forEach((k) => ls.del(k));
}
function restore(username) {
  const data = readJSON(ls.get(BUCKET + norm(username)), null);
  if (data) Object.entries(data).forEach(([k, v]) => { if (isAppKey(k) && v != null) ls.set(k, v); });
  ls.del(BUCKET + norm(username));
}

// ---------- session ----------
export function getSession() {
  let raw = null;
  try { raw = sessionStorage.getItem(SESSION); } catch { /* ignore */ }
  const s = readJSON(raw || ls.get(SESSION), null);
  if (!s?.username) return null;
  // with the server, the signed-in account (and its token) is kept in the session itself
  if (serverMode) return s.token && s.user ? { ...s.user, since: s.at, server: true } : null;
  const u = findUser(s.username);
  return u ? { username: u.username, name: u.name, email: u.email, role: u.role || 'student', since: s.at } : null;
}
const notify = () => window.dispatchEvent(new Event(EVT));

export function useAuth() {
  const [user, setUser] = useState(getSession);
  useEffect(() => {
    const h = () => setUser(getSession());
    window.addEventListener(EVT, h);
    window.addEventListener('storage', h);
    return () => { window.removeEventListener(EVT, h); window.removeEventListener('storage', h); };
  }, []);
  return user;
}

// ---------- actions ----------
// With the server (VITE_API_URL set) these return Promises; AuthPage awaits both kinds.
export function register(f) {
  if (serverMode) {
    return api('/api/auth/register', { method: 'POST', json: { name: f.name, username: f.username, email: f.email, password: f.password } })
      .then((d) => ({ ok: true, username: d.username, confirm: !!d.confirm }))
      .catch((e) => ({ ok: false, field: e.field || 'form', error: e.message }));
  }
  return registerLocal(f);
}
function registerLocal({ name, username, email, password }) {
  const n = String(name || '').trim();
  const u = String(username || '').trim();
  if (n.length < 2) return { ok: false, field: 'name', error: 'Please enter your full name.' };
  if (!/^[A-Za-z0-9_.]{3,20}$/.test(u)) return { ok: false, field: 'username', error: 'Username must be 3–20 letters, numbers, _ or . (no spaces).' };
  if (findUser(u)) return { ok: false, field: 'username', error: 'This username is already taken. Choose another one.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, field: 'email', error: 'Please enter a valid email address.' };
  if (String(password || '').length < 6) return { ok: false, field: 'password', error: 'Password must be at least 6 characters.' };
  const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const list = storedUsers();
  list.push({ username: u, name: n, email: String(email || '').trim(), role: 'student', salt, hash: hashPw(salt, password), createdAt: new Date().toISOString() });
  ls.set(USERS, JSON.stringify(list));
  return { ok: true, username: u };
}

function startSession(username, extra, remember) {
  // swap progress so each user keeps their own
  const owner = ls.get(OWNER);
  if (owner && norm(owner) !== norm(username)) { stash(owner); restore(username); } else if (!owner) restore(username);
  ls.set(OWNER, username);
  const s = JSON.stringify({ username, at: new Date().toISOString(), ...extra });
  try { sessionStorage.setItem(SESSION, s); } catch { /* ignore */ }
  if (remember) ls.set(SESSION, s); else ls.del(SESSION);
  notify();
  window.dispatchEvent(new Event('xlpbi-progress'));
}

export function login(username, password, remember = true) {
  if (serverMode) {
    return api('/api/auth/login', { method: 'POST', json: { username, password } })
      .then((d) => { startSession(d.user.username, { token: d.token, user: d.user }, remember); return { ok: true, user: d.user }; })
      .catch((e) => ({ ok: false, error: e.message }));
  }
  const u = findUser(username);
  if (!u || hashPw(u.salt, String(password || '')) !== u.hash) return { ok: false, error: 'Wrong username or password.' };
  startSession(u.username, {}, remember);
  return { ok: true, user: u };
}

// "Forgot password?": Supabase e-mails a link that brings the student back here to set a new password.
export async function sendPasswordReset(email) {
  if (!supaMode) return { ok: false, error: 'Password reset needs the online account.' };
  const e = String(email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { ok: false, error: 'Enter the email you registered with.' };
  const { error } = await supabase.auth.resetPasswordForEmail(e, { redirectTo: `${window.location.origin}${window.location.pathname}` });
  return error ? { ok: false, error: /rate/i.test(error.message) ? 'Too many emails right now. Try again in a few minutes.' : error.message } : { ok: true };
}

export function logout() {
  if (supaMode) { stopSync(); supabase.auth.signOut().catch(() => {}); }
  const s = getSession();
  if (s) { stash(s.username); ls.del(OWNER); }
  try { sessionStorage.removeItem(SESSION); } catch { /* ignore */ }
  ls.del(SESSION);
  notify();
  window.dispatchEvent(new Event('xlpbi-progress'));
}

// Supabase: keep the stored session in step with Supabase (sign-out elsewhere, role changed by the admin, disabled account)
function updateStoredUser(patch) {
  const write = (store) => {
    try {
      const raw = store.getItem(SESSION); if (!raw) return;
      const s = JSON.parse(raw); s.user = { ...s.user, ...patch }; s.username = s.user.username; store.setItem(SESSION, JSON.stringify(s));
    } catch { /* ignore */ }
  };
  write(sessionStorage); write(localStorage);
  notify();
}
export async function refreshSupabaseUser() {
  if (!supaMode || !getSession()?.server) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) { logout(); return; }
  const { data: p } = await supabase.from('profiles').select('id, username, name, role, active').eq('id', data.session.user.id).single();
  if (!p || !p.active) { logout(); return; }
  updateStoredUser({ id: p.id, username: p.username, name: p.name, role: p.role, email: data.session.user.email || '' });
}
if (supaMode && typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      setTimeout(async () => {
        const pw = window.prompt('Choose a new password (at least 6 characters):');
        if (!pw || pw.length < 6) { window.alert('Password not changed. Open the reset link again to try once more.'); return; }
        const { error } = await supabase.auth.updateUser({ password: pw });
        await supabase.auth.signOut();
        window.alert(error ? `Could not change the password: ${error.message}` : 'Password changed. Sign in with your new password.');
        window.location.hash = '#/login';
      }, 300);
      return;
    }
    if (event === 'SIGNED_OUT' && getSession()?.server) logout();
    if (event === 'TOKEN_REFRESHED' && session) updateStoredUser({});
  });
  setTimeout(() => { refreshSupabaseUser().catch(() => {}); }, 0);
}

// the server rejected the token (expired / account disabled) -> sign out
if (typeof window !== 'undefined') window.addEventListener('upskillr-auth-expired', () => { if (getSession()?.server) logout(); });

// Route guard: shows the page only when signed in, otherwise goes to the login page.
export function RequireAuth({ children }) {
  const user = useAuth();
  const loc = useLocation();
  if (!user) return createElement(Navigate, { to: '/login', replace: true, state: { from: loc.pathname + loc.search } });
  return children;
}

// "Er. Chetan D Morey" -> "Chetan" (skips titles like Er., Dr., Mr., Ms., Prof.)
export function firstName(user) {
  const parts = String(user?.name || user?.username || '').trim().split(/\s+/);
  const p = parts.find((w) => !/^(er|dr|mr|mrs|ms|miss|prof|shri|smt)\.?$/i.test(w));
  return p || user?.username || '';
}
