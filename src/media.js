// Admin media: recorded videos (per course or per lesson) and course cover images.
// Metadata lives in the admin settings (permissions.js → m.media) so it is published with upskillr-config.json.
// Uploaded video FILES are stored in this browser's IndexedDB ("idb:<id>"); links (YouTube/Drive/Vimeo/mp4) work everywhere.
import { useEffect, useState } from 'react';
import { readPerms, writePerms, usePerms } from './permissions.js';

/* ------------------------------ IndexedDB ------------------------------ */
const DB = 'upskillr-media';
function db() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('files');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
export async function putFile(id, blob) {
  const d = await db();
  await new Promise((res, rej) => { const tx = d.transaction('files', 'readwrite'); tx.objectStore('files').put(blob, id); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
}
export async function getFile(id) {
  const d = await db();
  return new Promise((res, rej) => { const r = d.transaction('files').objectStore('files').get(id); r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error); });
}
export async function deleteFile(id) {
  const d = await db();
  await new Promise((res) => { const tx = d.transaction('files', 'readwrite'); tx.objectStore('files').delete(id); tx.oncomplete = res; tx.onerror = res; });
}

/* ------------------------------ metadata ------------------------------ */
// m.media = { videos: { [scope]: [{ id, title, src, kind, note, addedAt }] }, covers: { [trackKey]: dataUrl | url } }
// scope = "course:<track>" or "lesson:<track>/<lessonId>"
export const courseScope = (track) => `course:${track}`;
export const lessonScope = (track, id) => `lesson:${track}/${id}`;

export function saveMedia(fn) {
  const m = readPerms();
  const media = { videos: {}, covers: {}, ...(m.media || {}) };
  writePerms({ ...m, media: fn(JSON.parse(JSON.stringify(media))) });
}
export function useMedia() {
  const { m } = usePerms();
  return { videos: {}, covers: {}, ...(m.media || {}) };
}

/* ------------------------------ link parsing ------------------------------ */
export function parseVideoLink(raw) {
  const u = String(raw || '').trim();
  if (!u) return null;
  let m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0` };
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return { kind: 'vimeo', src: `https://player.vimeo.com/video/${m[1]}` };
  m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/);
  if (m) return { kind: 'drive', src: `https://drive.google.com/file/d/${m[1]}/preview` };
  if (/^(https?:)?\/\/|^\//.test(u) && /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(u)) return { kind: 'file', src: u };
  if (/^https?:\/\//.test(u)) return { kind: 'page', src: u };
  return null;
}

// Resolve "idb:<id>" to an object URL for <video>.
export function useResolvedSrc(src) {
  const [url, setUrl] = useState(src && !src.startsWith('idb:') ? src : null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    if (!src || !src.startsWith('idb:')) { setUrl(src || null); setMissing(false); return undefined; }
    let obj = null; let alive = true;
    getFile(src.slice(4)).then((b) => { if (!alive) return; if (b) { obj = URL.createObjectURL(b); setUrl(obj); setMissing(false); } else { setUrl(null); setMissing(true); } }).catch(() => alive && setMissing(true));
    return () => { alive = false; if (obj) URL.revokeObjectURL(obj); };
  }, [src]);
  return { url, missing };
}
