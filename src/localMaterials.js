// Study material stored only on THIS computer (no server): files live in the browser's IndexedDB,
// the list lives in localStorage. Every account that signs in on this computer can see them;
// other computers and phones cannot. Used when neither Supabase nor the Node server is connected.
import { putFile, deleteFile } from './media.js';

const KEY = 'upskillr-auth-materials'; // "upskillr-auth" prefix: shared by all accounts on this computer
export const LOCAL_MAT_EVENT = 'upskillr-materials';

const kindOf = (mime = '', name = '') => (mime.startsWith('video/') ? 'video' : mime.startsWith('image/') ? 'photo' : mime === 'application/pdf' || /\.pdf$/i.test(name) ? 'pdf' : 'file');
const rid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export function listLocalMaterials() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { throw new Error('This browser has no space left for the list of materials.'); }
  window.dispatchEvent(new Event(LOCAL_MAT_EVENT));
}

/** Add files (and/or a video link). onProgress(0..1) is called as each file is saved. */
export async function addLocalMaterials({ title = '', note = '', course = '', lesson = '', url = '', files = [] }, onProgress) {
  title = title.trim(); note = note.trim(); url = url.trim();
  if (!files.length && !url) throw new Error('Choose a file (video, photo, PDF…) or paste a video link.');
  const now = new Date().toISOString();
  const added = [];
  if (url) added.push({ id: rid(), kind: 'link', title: title || 'Video', note, course, lesson, url, createdAt: now, file: null, local: true });
  const total = files.reduce((s, f) => s + f.size, 0) || 1;
  let done = 0;
  for (const f of files) {
    const fid = `mat-${rid()}`;
    try {
      // eslint-disable-next-line no-await-in-loop
      await putFile(fid, f);
    } catch (e) {
      // roll back what was saved in this batch
      // eslint-disable-next-line no-await-in-loop
      for (const m of added) if (m.file) await deleteFile(m.file.id.slice(4));
      throw new Error(/quota|space/i.test(String(e?.name || e?.message)) ? `Not enough space in this browser to save "${f.name}". Delete old material or use a smaller file.` : `Could not save "${f.name}" in this browser.`);
    }
    done += f.size;
    onProgress?.(done / total);
    added.push({
      id: rid(), kind: kindOf(f.type, f.name), title: files.length === 1 && title ? title : (title ? `${title} – ${f.name}` : f.name),
      note, course, lesson, url: '', createdAt: now, local: true,
      file: { id: `idb:${fid}`, name: f.name, mime: f.type || 'application/octet-stream', size: f.size },
    });
  }
  save([...added, ...listLocalMaterials()]);
  return added;
}

export async function removeLocalMaterial(id) {
  const list = listLocalMaterials();
  const m = list.find((x) => x.id === id);
  if (m?.file?.id?.startsWith('idb:')) await deleteFile(m.file.id.slice(4));
  save(list.filter((x) => x.id !== id));
}

// How much browser storage is used / available (if the browser tells us).
export async function storageInfo() {
  try {
    const e = await navigator.storage?.estimate?.();
    return e ? { used: e.usage || 0, quota: e.quota || 0 } : null;
  } catch { return null; }
}
