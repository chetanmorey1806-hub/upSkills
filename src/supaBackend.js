// Supabase implementation of the NGU API used by the app (same paths and data shapes as the
// Node server in server/), so login, study material and chat work on Vercel + Supabase without a server.
import { supabase, SUPA_URL, publicFileUrl } from './supabase.js';

const err = (message, status = 400, field) => Object.assign(new Error(message), { status, field });
const me = () => { try { return JSON.parse(sessionStorage.getItem('upskillr-auth-session') || localStorage.getItem('upskillr-auth-session') || 'null')?.user || null; } catch { return null; } };
const kindOf = (mime = '', name = '') => (mime.startsWith('video/') ? 'video' : mime.startsWith('image/') ? 'photo' : mime === 'application/pdf' || /\.pdf$/i.test(name) ? 'pdf' : 'file');
const safeName = (n) => String(n || 'file').normalize('NFKD').replace(/[^\w.\- ]+/g, '').replace(/\s+/g, '_').slice(-120) || 'file';
const rid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
const formFiles = (fd, key = 'files') => (fd ? fd.getAll(key).filter((f) => f instanceof Blob) : []);
const formVal = (fd, key) => String(fd?.get(key) ?? '').trim();

// ---------- uploads with progress (Storage REST + XMLHttpRequest) ----------
async function upload(bucket, path, file, onPart) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw err('Please sign in again.', 401);
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('POST', `${SUPA_URL}/storage/v1/object/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`);
    x.setRequestHeader('Authorization', `Bearer ${token}`);
    x.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY);
    x.setRequestHeader('x-upsert', 'false');
    x.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    x.upload.onprogress = (e) => e.lengthComputable && onPart?.(e.loaded);
    x.onload = () => {
      if (x.status >= 200 && x.status < 300) { onPart?.(file.size); resolve(`${bucket}/${path}`); return; }
      let msg = `Upload failed (${x.status})`;
      try { const j = JSON.parse(x.responseText); msg = j.message || j.error || msg; } catch { /* not json */ }
      if (x.status === 413 || /exceeded|too large|size/i.test(msg)) msg = `"${file.name}" is too large. The free plan allows files up to 50 MB — for long videos upload to YouTube (unlisted) and paste the link instead.`;
      reject(err(msg, x.status));
    };
    x.onerror = () => reject(err('Upload failed. Check your internet connection.', 0));
    x.send(file);
  });
}
async function uploadAll(bucket, files, pathFor, onProgress) {
  const total = files.reduce((s, f) => s + f.size, 0) || 1;
  const done = new Array(files.length).fill(0);
  const out = [];
  for (let i = 0; i < files.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    out.push(await upload(bucket, pathFor(files[i], i), files[i], (n) => { done[i] = n; onProgress?.(done.reduce((a, b) => a + b, 0) / total); }));
  }
  return out;
}
const removeFiles = async (ids) => {
  const by = {};
  ids.filter(Boolean).forEach((id) => { const [b, ...p] = String(id).split('/'); (by[b] ||= []).push(p.join('/')); });
  await Promise.all(Object.entries(by).map(([b, paths]) => supabase.storage.from(b).remove(paths)));
};

// ---------- accounts ----------
async function profileOf(id) {
  const { data, error } = await supabase.from('profiles').select('id, username, name, role, active, created_at').eq('id', id).single();
  if (error) throw err('Your profile was not found. Ask the admin to check the database setup.', 500);
  return data;
}
const userShape = (p, email) => ({ id: p.id, username: p.username, name: p.name, email: email || '', role: p.role, createdAt: p.created_at });

async function register({ name, username, email, password }) {
  const n = String(name || '').trim(); const u = String(username || '').trim(); const e = String(email || '').trim();
  if (n.length < 2) throw err('Please enter your full name.', 400, 'name');
  if (!/^[A-Za-z0-9_.]{3,20}$/.test(u)) throw err('Username must be 3–20 letters, numbers, _ or . (no spaces).', 400, 'username');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw err('Please enter a valid email address (needed to sign in and reset your password).', 400, 'email');
  if (String(password || '').length < 6) throw err('Password must be at least 6 characters.', 400, 'password');
  const { data: taken } = await supabase.rpc('username_taken', { u });
  if (taken) throw err('This username is already taken. Choose another one.', 409, 'username');
  const { data, error } = await supabase.auth.signUp({ email: e, password, options: { data: { username: u, name: n }, emailRedirectTo: `${window.location.origin}${window.location.pathname}` } });
  if (error) {
    if (/registered|exists/i.test(error.message)) throw err('An account with this email already exists. Sign in instead.', 409, 'email');
    if (/rate limit/i.test(error.message)) throw err('Too many sign-ups right now. Please try again in a few minutes.', 429, 'form');
    throw err(error.message, 400, /password/i.test(error.message) ? 'password' : 'form');
  }
  if (data.session) await supabase.auth.signOut(); // the app asks the student to sign in after registering
  return { username: u, confirm: !data.session };
}

async function login({ username, password }) {
  const id = String(username || '').trim();
  let email = id;
  if (!id.includes('@')) {
    const { data, error } = await supabase.rpc('login_email', { identifier: id, pw: String(password || '') });
    if (error) throw err('Sign-in is not set up yet: run supabase/schema.sql in the Supabase SQL Editor.', 500);
    if (!data) throw err('Wrong username or password.', 401);
    email = data;
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (/confirm/i.test(error.message)) throw err('Please confirm your email first: open the link we sent to your inbox, then sign in.', 401);
    throw err('Wrong username/email or password.', 401);
  }
  const p = await profileOf(data.user.id);
  if (!p.active) { await supabase.auth.signOut(); throw err('This account is disabled. Contact your trainer.', 403); }
  return { token: data.session.access_token, user: userShape(p, data.user.email) };
}

// ---------- study material ----------
const matShape = (m) => ({
  id: m.id, kind: m.kind, title: m.title, note: m.note || '', course: m.course || '', lesson: m.lesson || '', url: m.url || '', createdAt: m.created_at,
  file: m.file_path ? { id: m.file_path, name: m.file_name, mime: m.file_mime, size: Number(m.file_size || 0) } : null,
});
async function listMaterials(qs) {
  let q = supabase.from('materials').select('*').order('created_at', { ascending: false }).limit(500);
  if (qs.has('course')) q = q.or(`course.eq.${qs.get('course')},course.is.null`);
  if (qs.get('kind')) q = q.eq('kind', qs.get('kind'));
  const { data, error } = await q;
  if (error) throw err(error.message, 500);
  return { materials: data.map(matShape) };
}
async function addMaterials(fd, onProgress) {
  const title = formVal(fd, 'title'); const note = formVal(fd, 'note');
  const course = formVal(fd, 'course') || null; const lesson = formVal(fd, 'lesson') || null; const url = formVal(fd, 'url');
  const files = formFiles(fd);
  if (!files.length && !url) throw err('Choose a file or paste a video link.');
  const rows = [];
  if (url) rows.push({ kind: 'link', title: title || 'Video', note, course, lesson, url: url.slice(0, 700) });
  if (files.length) {
    const ids = await uploadAll('materials', files, (f) => `${rid()}/${safeName(f.name)}`, onProgress);
    files.forEach((f, i) => rows.push({ kind: kindOf(f.type, f.name), title: files.length === 1 && title ? title : (title ? `${title} – ${f.name}` : f.name), note, course, lesson, file_path: ids[i], file_name: f.name, file_mime: f.type || 'application/octet-stream', file_size: f.size }));
  }
  const { data, error } = await supabase.from('materials').insert(rows).select('*');
  if (error) { await removeFiles(rows.map((r) => r.file_path)); throw err(/row-level|permission/i.test(error.message) ? 'Only the admin or a teacher can upload study material.' : error.message, 403); }
  return { materials: data.map(matShape) };
}
async function deleteMaterial(id) {
  const { data } = await supabase.from('materials').select('file_path').eq('id', id).single();
  const { error } = await supabase.from('materials').delete().eq('id', id);
  if (error) throw err(error.message, 403);
  if (data?.file_path) await removeFiles([data.file_path]);
  return { ok: true };
}

// ---------- chat ----------
const CHAT_COLS = 'id, user_id, text, files, deleted, created_at, author:profiles!chat_messages_user_id_fkey(id, name, username, role)';
const msgShape = (m) => ({
  id: m.id, text: m.deleted ? '' : m.text || '', deleted: !!m.deleted, createdAt: m.created_at,
  user: { id: m.user_id, name: m.author?.name || 'Student', username: m.author?.username || '', role: m.author?.role || 'student' },
  files: m.deleted ? [] : (m.files || []),
});
async function listChat(qs) {
  const limit = Math.min(100, Math.max(1, Number(qs.get('limit')) || 50));
  let q = supabase.from('chat_messages').select(CHAT_COLS).order('id', { ascending: false }).limit(limit);
  if (Number(qs.get('before'))) q = q.lt('id', Number(qs.get('before')));
  const { data, error } = await q;
  if (error) throw err(error.message, 500);
  return { messages: data.reverse().map(msgShape) };
}
export async function loadChatMessage(id) {
  const { data } = await supabase.from('chat_messages').select(CHAT_COLS).eq('id', id).single();
  return data ? msgShape(data) : null;
}
async function sendChat(fd, onProgress) {
  const text = formVal(fd, 'text').slice(0, 5000);
  const files = formFiles(fd);
  const paths = fd ? fd.getAll('paths').map(String) : [];
  if (!text && !files.length) throw err('Type a message or attach a file.');
  const u = me();
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user?.id || u?.id;
  const folder = `${uid}/${rid()}`;
  const ids = files.length ? await uploadAll('chat', files, (f, i) => `${folder}/${i}-${safeName(f.name)}`, onProgress) : [];
  const meta = files.map((f, i) => ({ id: ids[i], name: f.name, relPath: paths[i] || '', mime: f.type || 'application/octet-stream', size: f.size }));
  const { data, error } = await supabase.from('chat_messages').insert({ text, files: meta }).select('id').single();
  if (error) { await removeFiles(ids); throw err(error.message, 403); }
  return { message: await loadChatMessage(data.id) };
}
async function deleteChat(id) {
  const { data } = await supabase.from('chat_messages').select('files').eq('id', id).single();
  const { error, count } = await supabase.from('chat_messages').update({ deleted: true, text: '', files: [] }, { count: 'exact' }).eq('id', id);
  if (error || count === 0) throw err('You can delete only your own messages.', 403);
  await removeFiles((data?.files || []).map((f) => f.id));
  return { ok: true };
}

/** Same signature as serverApi.api(): routes /api/... calls to Supabase. */
export async function supaApi(path, { method = 'GET', json, form, onProgress } = {}) {
  const [p, query = ''] = path.split('?');
  const qs = new URLSearchParams(query);
  const m = method.toUpperCase();
  if (p === '/api/auth/register' && m === 'POST') return register(json || {});
  if (p === '/api/auth/login' && m === 'POST') return login(json || {});
  if (p === '/api/materials' && m === 'GET') return listMaterials(qs);
  if (p === '/api/materials' && m === 'POST') return addMaterials(form, onProgress);
  let r = p.match(/^\/api\/materials\/(\d+)$/);
  if (r && m === 'DELETE') return deleteMaterial(Number(r[1]));
  if (p === '/api/chat/messages' && m === 'GET') return listChat(qs);
  if (p === '/api/chat/messages' && m === 'POST') return sendChat(form, onProgress);
  r = p.match(/^\/api\/chat\/messages\/(\d+)$/);
  if (r && m === 'DELETE') return deleteChat(Number(r[1]));
  throw err('This feature is not available yet.', 404);
}

export const supaFileUrl = (id, { download = false, name = '' } = {}) => publicFileUrl(id, { download, name });

/** Socket.IO-like object on top of Supabase Realtime (messages, deletions, who is online, typing). */
export function supaSocket() {
  const handlers = {};
  const fire = (ev, d) => (handlers[ev] || []).forEach((f) => f(d));
  const u = me() || {};
  let lastTyping = 0;
  const channel = supabase.channel('class-chat', { config: { presence: { key: u.id || rid() }, broadcast: { self: false } } })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, async (p) => { const msg = await loadChatMessage(p.new.id); if (msg) fire('chat:message', msg); })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' }, (p) => { if (p.new.deleted) fire('chat:deleted', { id: p.new.id }); })
    .on('presence', { event: 'sync' }, () => {
      const seen = new Map();
      Object.values(channel.presenceState()).forEach((arr) => arr.forEach((x) => { if (x.id) seen.set(x.id, { id: x.id, name: x.name, username: x.username, role: x.role }); }));
      fire('chat:online', [...seen.values()]);
    })
    .on('broadcast', { event: 'typing' }, ({ payload }) => fire('chat:typing', payload))
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') { fire('connect'); await channel.track({ id: u.id, name: u.name, username: u.username, role: u.role }); }
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') fire('disconnect');
    });
  const sock = {
    on(ev, fn) { (handlers[ev] ||= []).push(fn); return sock; },
    emit(ev) {
      if (ev !== 'chat:typing' || Date.now() - lastTyping < 2000) return;
      lastTyping = Date.now();
      channel.send({ type: 'broadcast', event: 'typing', payload: { id: u.id, name: u.name } });
    },
    disconnect() { supabase.removeChannel(channel); },
  };
  return sock;
}
