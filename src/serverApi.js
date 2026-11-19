// Connection to the UpSkillr backend (server/ folder): accounts, study material uploads and the chat.
// Set VITE_API_URL (e.g. https://api.yoursite.com) when building the website. Without it the app runs
// browser-only as before, and Chat / Study material show how to connect the server.
import { supaMode } from './supabase.js';
import { supaApi, supaFileUrl, supaSocket } from './supaBackend.js';

// When Supabase is configured (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) it is used instead of the Node server.
const RAW = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
export const API_URL = RAW;
export { supaMode };
export const serverMode = supaMode || !!RAW;

const SESSION = 'upskillr-auth-session';
export function token() {
  try {
    const raw = sessionStorage.getItem(SESSION) || localStorage.getItem(SESSION);
    return raw ? JSON.parse(raw).token || '' : '';
  } catch { return ''; }
}

/**
 * api('/api/chat/messages', { method, json, form }) -> parsed JSON; throws Error(message) with .status/.field.
 * `onProgress(0..1)` works for uploads (form) through XMLHttpRequest.
 */
export function api(path, { method = 'GET', json, form, onProgress, signal } = {}) {
  if (supaMode) return supaApi(path, { method, json, form, onProgress, signal });
  if (!serverMode) return Promise.reject(Object.assign(new Error('The UpSkillr server is not connected.'), { status: 0 }));
  const url = `${API_URL}${path}`;
  const headers = {};
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  const fail = (status, data) => {
    if (status === 401) window.dispatchEvent(new Event('upskillr-auth-expired'));
    return Object.assign(new Error(data?.error || (status ? `Server error (${status})` : 'Cannot reach the server. Check your internet.')), { status, field: data?.field });
  };
  if (form) {
    return new Promise((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open(method === 'GET' ? 'POST' : method, url);
      Object.entries(headers).forEach(([k, v]) => x.setRequestHeader(k, v));
      if (onProgress) x.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
      x.onload = () => {
        let data = null; try { data = JSON.parse(x.responseText); } catch { /* not json */ }
        if (x.status >= 200 && x.status < 300) resolve(data); else reject(fail(x.status, data));
      };
      x.onerror = () => reject(fail(0));
      signal?.addEventListener('abort', () => x.abort());
      x.send(form);
    });
  }
  if (json !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(url, { method, headers, body: json !== undefined ? JSON.stringify(json) : undefined, signal })
    .catch(() => { throw fail(0); })
    .then(async (r) => {
      let data = null; try { data = await r.json(); } catch { /* empty */ }
      if (!r.ok) throw fail(r.status, data);
      return data;
    });
}

// Link for <img>/<video>/<a>: the token travels in the URL because those tags cannot send headers.
export const fileUrl = (id, { download = false } = {}) => supaMode ? supaFileUrl(id, { download }) : `${API_URL}/api/files/${id}?t=${encodeURIComponent(token())}${download ? '&dl=1' : ''}`;

// Socket.IO client, loaded from the server itself (no extra npm package in the website).
let ioLoading = null;
function loadIo() {
  if (window.io) return Promise.resolve(window.io);
  if (!ioLoading) {
    ioLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `${API_URL}/socket.io/socket.io.min.js`;
      s.async = true;
      s.onload = () => (window.io ? resolve(window.io) : reject(new Error('socket.io missing')));
      s.onerror = () => { ioLoading = null; reject(new Error('Cannot reach the chat server.')); };
      document.head.appendChild(s);
    });
  }
  return ioLoading;
}
export async function connectSocket() {
  if (supaMode) return supaSocket();
  const io = await loadIo();
  return io(API_URL, { auth: { token: token() }, transports: ['websocket', 'polling'] });
}

export const fmtSize = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : b >= 1024 ? `${Math.round(b / 1024)} KB` : `${b} B`);
