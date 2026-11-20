// Class chat stored only on THIS computer (no server): messages in localStorage, attached files in
// IndexedDB. Every account that signs in on this computer shares the same room; other tabs/windows
// update live through BroadcastChannel. Other computers and phones cannot see these messages.
import { putFile, deleteFile } from './media.js';

const KEY = 'upskillr-auth-chat'; // "upskillr-auth" prefix: shared by all accounts on this computer
const MAX = 500; // keep the newest messages only
const chan = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('upskillr-chat') : null;
const rid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export function listLocalChat() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX))); } catch { throw new Error('This browser has no space left for more chat messages.'); }
}

/** Send a message. files = [{ file, path }]. onProgress(0..1) while files are saved. */
export async function sendLocalChat(user, text, files = [], onProgress) {
  const saved = [];
  const total = files.reduce((s, f) => s + f.file.size, 0) || 1;
  let done = 0;
  for (const { file, path } of files) {
    const fid = `chat-${rid()}`;
    try {
      // eslint-disable-next-line no-await-in-loop
      await putFile(fid, file);
    } catch (e) {
      // eslint-disable-next-line no-await-in-loop
      for (const f of saved) await deleteFile(f.id.slice(4));
      throw new Error(/quota|space/i.test(String(e?.name || e?.message)) ? `Not enough space in this browser to save "${file.name}".` : `Could not save "${file.name}" in this browser.`);
    }
    done += file.size; onProgress?.(done / total);
    saved.push({ id: `idb:${fid}`, name: file.name, mime: file.type || 'application/octet-stream', size: file.size, relPath: path || '' });
  }
  const m = { id: rid(), text, files: saved, createdAt: new Date().toISOString(), deleted: false, user: { id: user.username, username: user.username, name: user.name || user.username, role: user.role || 'student' } };
  save([...listLocalChat(), m]);
  chan?.postMessage({ type: 'message', m });
  return m;
}

export async function deleteLocalChat(id) {
  const list = listLocalChat();
  const m = list.find((x) => x.id === id);
  if (!m) return;
  for (const f of m.files || []) if (f.id?.startsWith('idb:')) await deleteFile(f.id.slice(4));
  save(list.map((x) => (x.id === id ? { ...x, deleted: true, text: '', files: [] } : x)));
  chan?.postMessage({ type: 'deleted', id });
}

/** Live events from other tabs: message, deleted, typing, and who has the chat open. Returns an unsubscribe fn. */
export function subscribeLocalChat(user, { onMessage, onDeleted, onTyping, onOnline }) {
  const me = { id: user.username, username: user.username, name: user.name || user.username, role: user.role || 'student' };
  const seen = new Map(); // id -> { user, at }
  const pushOnline = () => {
    const now = Date.now();
    for (const [k, v] of seen) if (now - v.at > 12000) seen.delete(k);
    const all = new Map([[me.id, me], ...[...seen.values()].map((v) => [v.user.id, v.user])]);
    onOnline?.([...all.values()]);
  };
  const h = (e) => {
    const d = e.data || {};
    if (d.type === 'message') onMessage?.(d.m);
    else if (d.type === 'deleted') onDeleted?.(d.id);
    else if (d.type === 'typing') onTyping?.(d.user);
    else if (d.type === 'here' || d.type === 'hello') {
      seen.set(d.tab, { user: d.user, at: Date.now() }); pushOnline();
      if (d.type === 'hello') chan?.postMessage({ type: 'here', tab, user: me });
    } else if (d.type === 'bye') { seen.delete(d.tab); pushOnline(); }
  };
  const tab = rid();
  chan?.addEventListener('message', h);
  chan?.postMessage({ type: 'hello', tab, user: me });
  pushOnline();
  const beat = setInterval(() => { chan?.postMessage({ type: 'here', tab, user: me }); pushOnline(); }, 5000);
  const bye = () => chan?.postMessage({ type: 'bye', tab });
  window.addEventListener('beforeunload', bye);
  return {
    typing: () => chan?.postMessage({ type: 'typing', user: me }),
    close: () => { bye(); clearInterval(beat); chan?.removeEventListener('message', h); window.removeEventListener('beforeunload', bye); },
  };
}
