// Class chat: every student and the admin in one room. Text, photos, PDFs, videos, any file and whole folders.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Paperclip, FolderUp, Image as ImageIcon, Send, Trash2, Download, FileText, File as FileIcon, Folder, Users, X, Film } from 'lucide-react';
import { api, connectSocket, fileUrl, fmtSize, serverMode } from '../serverApi.js';
import { useAuth } from '../auth.js';
import { useResolvedSrc } from '../media.js';
import { listLocalChat, sendLocalChat, deleteLocalChat, subscribeLocalChat } from '../localChat.js';

import Ico from '../components/Ico.jsx';
const URL_RE = /(https?:\/\/[^\s<>"']+)/g;
// plain text with clickable links (React escapes the text, so no HTML can be injected)
function Text({ text }) {
  return text.split(URL_RE).map((p, i) => (i % 2 ? <a key={i} href={p} target="_blank" rel="noreferrer noopener">{p}</a> : <span key={i}>{p}</span>));
}

const when = (d) => {
  const t = new Date(d);
  const today = new Date().toDateString() === t.toDateString();
  return today ? t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};
const dayOf = (d) => new Date(d).toDateString();
const initials = (n) => String(n || '?').trim().split(/\s+/).filter((w) => !/^(er|dr|mr|mrs|ms)\.?$/i.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const hue = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

// A file is either on the server or (no server) in this browser's IndexedDB ("idb:..." id).
function useFileUrl(f, download = false) {
  const local = String(f.id ?? '').startsWith('idb:');
  const { url } = useResolvedSrc(local ? f.id : null);
  return local ? url : fileUrl(f.id, { download });
}
function Photo({ f }) {
  const src = useFileUrl(f);
  return <a href={src || undefined} target="_blank" rel="noreferrer"><img src={src || undefined} alt={f.name} loading="lazy" /></a>;
}
function Vid({ f }) {
  const src = useFileUrl(f);
  return <video className="ch-video" src={src || undefined} controls preload="metadata" />;
}

function FileChip({ f }) {
  const local = String(f.id ?? '').startsWith('idb:');
  const I = /^video\//.test(f.mime) ? Film : f.mime === 'application/pdf' ? FileText : FileIcon;
  const viewable = /^(application\/pdf|video\/|image\/|text\/plain)/.test(f.mime);
  const open = useFileUrl(f, !viewable);
  const dl = useFileUrl(f, true);
  return (
    <div className="ch-file">
      <I size={18} />
      <a className="ch-file-name" href={open || undefined} target="_blank" rel="noreferrer" title={f.relPath || f.name}>{f.name}</a>
      <span className="muted small">{fmtSize(f.size)}</span>
      <a className="ch-icon-btn" href={dl || undefined} download={local ? f.name : undefined} title="Download"><Download size={15} /></a>
    </div>
  );
}

function Attachments({ files }) {
  const photos = files.filter((f) => /^image\//.test(f.mime) && !f.relPath);
  const videos = files.filter((f) => /^video\/(mp4|webm|ogg)/.test(f.mime) && !f.relPath);
  const loose = files.filter((f) => !f.relPath && !photos.includes(f) && !videos.includes(f));
  // files from a shared folder, grouped by the top folder name
  const folders = useMemo(() => {
    const g = {};
    files.filter((f) => f.relPath).forEach((f) => { const top = f.relPath.split('/')[0]; (g[top] ||= []).push(f); });
    return Object.entries(g);
  }, [files]);
  return (
    <div className="ch-atts">
      {photos.length > 0 && (
        <div className={`ch-photos n${Math.min(photos.length, 4)}`}>
          {photos.slice(0, 8).map((f) => <Photo key={f.id} f={f} />)}
          {photos.length > 8 && <span className="muted small">+{photos.length - 8} more photos</span>}
        </div>
      )}
      {videos.map((f) => <Vid key={f.id} f={f} />)}
      {loose.map((f) => <FileChip key={f.id} f={f} />)}
      {folders.map(([name, list]) => (
        <details key={name} className="ch-folder">
          <summary><Folder size={18} /> <b>{name}</b> <span className="muted small">{list.length} file{list.length > 1 ? 's' : ''} · {fmtSize(list.reduce((s, f) => s + f.size, 0))}</span></summary>
          {list.map((f) => <div key={f.id} className="ch-folder-row"><span className="muted small">{f.relPath.split('/').slice(1, -1).join(' / ')}</span><FileChip f={f} /></div>)}
        </details>
      ))}
    </div>
  );
}

export default function Chat() {
  const me = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [online, setOnline] = useState([]);
  const [typing, setTyping] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]); // [{ file, path }]
  const [progress, setProgress] = useState(null);
  const [showPeople, setShowPeople] = useState(false);
  const listRef = useRef(null);
  const sockRef = useRef(null);
  const stick = useRef(true);
  const fileIn = useRef(null);
  const photoIn = useRef(null);
  const folderIn = useRef(null);

  const scrollDown = () => requestAnimationFrame(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; });
  const add = useCallback((m) => setMsgs((l) => (l.some((x) => x.id === m.id) ? l : [...l, m])), []);

  const myId = me?.id || me?.username;

  // No server: the chat room lives in this browser (shared by every account on this computer).
  useEffect(() => {
    if (serverMode || !me) return undefined;
    setMsgs(listLocalChat()); setStatus('online'); scrollDown();
    const sub = subscribeLocalChat(me, {
      onMessage: (m) => { add(m); if (stick.current) scrollDown(); },
      onDeleted: (id) => setMsgs((l) => l.map((x) => (x.id === id ? { ...x, deleted: true, text: '', files: [] } : x))),
      onTyping: (u) => { setTyping(u); clearTimeout(sub.timer); sub.timer = setTimeout(() => setTyping(null), 3000); },
      onOnline: setOnline,
    });
    sockRef.current = { emit: () => sub.typing() };
    const onStore = (e) => { if (e.key === 'upskillr-auth-chat') setMsgs(listLocalChat()); };
    window.addEventListener('storage', onStore);
    return () => { sub.close(); sockRef.current = null; window.removeEventListener('storage', onStore); };
  }, [me?.username, add]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!serverMode || !me?.server) return undefined;
    let alive = true;
    api('/api/chat/messages?limit=50').then((d) => { if (!alive) return; setMsgs(d.messages); setHasMore(d.messages.length === 50); scrollDown(); }).catch((e) => alive && setError(e.message));
    let sock = null;
    connectSocket().then((s) => {
      if (!alive) { s.disconnect(); return; }
      sock = s; sockRef.current = s;
      s.on('connect', () => setStatus('online'));
      s.on('disconnect', () => setStatus('offline'));
      s.on('connect_error', () => setStatus('offline'));
      s.on('chat:message', (m) => { add(m); if (stick.current) scrollDown(); });
      s.on('chat:deleted', ({ id }) => setMsgs((l) => l.map((x) => (x.id === id ? { ...x, deleted: true, text: '', files: [] } : x))));
      s.on('chat:online', setOnline);
      s.on('chat:typing', (t) => { setTyping(t); clearTimeout(s.typingTimer); s.typingTimer = setTimeout(() => setTyping(null), 3000); });
    }).catch((e) => { setStatus('offline'); setError(e.message); });
    return () => { alive = false; sock?.disconnect(); sockRef.current = null; };
  }, [me?.server, add]);

  const older = async () => {
    const first = msgs[0];
    if (!first) return;
    const el = listRef.current;
    const h = el?.scrollHeight || 0;
    const d = await api(`/api/chat/messages?before=${first.id}&limit=50`);
    setMsgs((l) => [...d.messages, ...l]);
    setHasMore(d.messages.length === 50);
    requestAnimationFrame(() => { if (el) el.scrollTop = el.scrollHeight - h; });
  };

  const pick = (list, fromFolder = false) => {
    const arr = Array.from(list || []).map((f) => ({ file: f, path: fromFolder ? f.webkitRelativePath || f.name : '' }));
    setFiles((cur) => [...cur, ...arr]);
  };

  const send = async () => {
    if (progress !== null) return;
    const t = text.trim();
    if (!t && !files.length) return;
    const fd = new FormData();
    fd.append('text', t);
    files.forEach(({ file, path }) => { fd.append('files', file, file.name); fd.append('paths', path); });
    setProgress(files.length ? 0 : null);
    setError('');
    try {
      const msg = serverMode
        ? (await api('/api/chat/messages', { method: 'POST', form: fd, onProgress: files.length ? setProgress : undefined })).message
        : await sendLocalChat(me, t, files, files.length ? setProgress : undefined);
      add(msg);
      setText(''); setFiles([]);
      stick.current = true; scrollDown();
    } catch (e) { setError(e.message); }
    setProgress(null);
  };

  const remove = async (m) => {
    if (!window.confirm('Delete this message for everyone?')) return;
    try { if (serverMode) await api(`/api/chat/messages/${m.id}`, { method: 'DELETE' }); else await deleteLocalChat(m.id); setMsgs((l) => l.map((x) => (x.id === m.id ? { ...x, deleted: true, text: '', files: [] } : x))); } catch (e) { setError(e.message); }
  };

  if (!me) return null;
  if (serverMode && !me?.server) return <div className="card">Please sign out and sign in again to use the chat.</div>;

  const folderCount = new Set(files.filter((f) => f.path).map((f) => f.path.split('/')[0])).size;
  const looseCount = files.filter((f) => !f.path).length;

  return (
    <div className="chat-page">
      <div className="ch-head card">
        <div>
          <h2><Ico e="💬" /> Class Chat</h2>
          {!serverMode && <span className="muted small ch-local-note">Saved on this computer only: everyone who signs in here sees these messages.</span>}
          <span className={`ch-status ${status}`}>{status === 'online' ? `● ${online.length} online` : status === 'connecting' ? 'Connecting…' : '○ Offline, reconnecting…'}</span>
        </div>
        <button className="btn small" onClick={() => setShowPeople(!showPeople)}><Users size={15} /> People</button>
      </div>

      <div className="ch-body">
        <div
          className="ch-list"
          ref={listRef}
          onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files); }}
        >
          {hasMore && <div className="center"><button className="btn small" onClick={older}>Load older messages</button></div>}
          {!msgs.length && !error && <p className="muted center">No messages yet. Say hello to your classmates <Ico e="👋" /></p>}
          {msgs.map((m, i) => {
            const mine = m.user.id === myId;
            const newDay = !i || dayOf(msgs[i - 1].createdAt) !== dayOf(m.createdAt);
            const grouped = !newDay && i > 0 && msgs[i - 1].user.id === m.user.id && new Date(m.createdAt) - new Date(msgs[i - 1].createdAt) < 5 * 60000;
            return (
              <div key={m.id}>
                {newDay && <div className="ch-day"><span>{new Date(m.createdAt).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>}
                <div className={`ch-msg ${mine ? 'mine' : ''} ${grouped ? 'grouped' : ''}`}>
                  {!mine && <span className="ch-avatar" style={{ '--h': hue(m.user.username) }}>{grouped ? '' : initials(m.user.name)}</span>}
                  <div className={`ch-bubble ${m.user.role === 'admin' ? 'admin' : ''}`}>
                    {!grouped && !mine && <div className="ch-name">{m.user.name}{m.user.role === 'admin' && <span className="ch-badge">Admin</span>}</div>}
                    {m.deleted ? <i className="muted small">This message was deleted</i> : (
                      <>
                        {m.text && <div className="ch-text"><Text text={m.text} /></div>}
                        {m.files?.length > 0 && <Attachments files={m.files} />}
                      </>
                    )}
                    <div className="ch-time">
                      {when(m.createdAt)}
                      {!m.deleted && (mine || me.role === 'admin') && <button className="ch-icon-btn" onClick={() => remove(m)} title="Delete"><Trash2 size={13} /></button>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showPeople && (
          <aside className="ch-people card">
            <div className="rv-head"><b>Online now</b><button className="ch-icon-btn" onClick={() => setShowPeople(false)}><X size={15} /></button></div>
            {online.map((u) => (
              <div key={u.id} className="ch-person"><span className="ch-avatar" style={{ '--h': hue(u.username) }}>{initials(u.name)}</span>{u.name}{u.role === 'admin' && <span className="ch-badge">Admin</span>}</div>
            ))}
          </aside>
        )}
      </div>

      <div className="ch-typing small muted">{typing && typing.id !== myId ? `${typing.name} is typing…` : ''}</div>
      {error && <div className="ch-error small"><Ico e="⚠" /> {error}</div>}

      <div className="ch-compose card">
        {files.length > 0 && (
          <div className="chips ch-pending">
            {folderCount > 0 && <span className="chip"><Folder size={14} /> {folderCount} folder{folderCount > 1 ? 's' : ''}</span>}
            {files.filter((f) => !f.path).map((f, i) => (
              <span key={i} className="chip">{f.file.name} · {fmtSize(f.file.size)} <button className="link-btn" onClick={() => setFiles(files.filter((x) => x !== f))} aria-label="Remove">✕</button></span>
            ))}
            <span className="muted small">{looseCount + files.filter((f) => f.path).length} file(s) · {fmtSize(files.reduce((s, f) => s + f.file.size, 0))}</span>
            <button className="link-btn small" onClick={() => setFiles([])}>Clear</button>
          </div>
        )}
        {progress !== null && <div className="up-progress"><i style={{ width: `${Math.round(progress * 100)}%` }} /><span>{progress < 1 ? `Uploading… ${Math.round(progress * 100)}%` : 'Sending…'}</span></div>}
        <div className="ch-row">
          <button className="ch-tool" onClick={() => photoIn.current?.click()} title="Photos"><ImageIcon size={19} /></button>
          <button className="ch-tool" onClick={() => fileIn.current?.click()} title="Files (PDF, documents, videos)"><Paperclip size={19} /></button>
          <button className="ch-tool" onClick={() => folderIn.current?.click()} title="Share a folder"><FolderUp size={19} /></button>
          <input ref={photoIn} type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />
          <input ref={fileIn} type="file" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />
          <input ref={folderIn} type="file" multiple hidden webkitdirectory="" directory="" onChange={(e) => { pick(e.target.files, true); e.target.value = ''; }} />
          <textarea
            className="input ch-input"
            rows={1}
            value={text}
            placeholder="Type a message…  (Enter to send, Shift+Enter for a new line)"
            onChange={(e) => { setText(e.target.value); sockRef.current?.emit('chat:typing'); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            onPaste={(e) => { if (e.clipboardData.files.length) { e.preventDefault(); pick(e.clipboardData.files); } }}
          />
          <button className="btn primary ch-send" onClick={send} disabled={progress !== null || (!text.trim() && !files.length)} aria-label="Send"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}
