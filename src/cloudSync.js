// Keeps a student's progress the same on every device (Supabase table user_data).
// Pull when signing in / when the tab gets focus, push changed keys every few seconds and when the
// tab is hidden. Also publishes XP, streak and counts to the student's profile for the leaderboard.
import { supabase, supaMode } from './supabase.js';
import { computeStats, levelOf } from './study.js';

const META = 'upskillr-auth-sync:'; // per-user: { hashes: {key: hash}, pulledAt }
const EVT = 'upskillr-sync';
// never uploaded: secrets, per-device caches and settings
const SKIP = [/^upskillr-auth/, /^xlpbi-anthropic-key$/, /^upskillr-video-prefs$/, /^upskillr-vtr-/, /^upskillr-tr:/, /^upskillr-study-reminded$/, /^upskillr-doubt-lang$/, /^upskillr-lesson-lang$/, /^upskillr-tts-rate$/, /^upskillr-checkpoints$/, /-load$/];
const isSynced = (k) => (k.startsWith('xlpbi-') || k.startsWith('upskillr-')) && !SKIP.some((r) => r.test(k));

const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return `${(h >>> 0).toString(36)}.${s.length}`; };
const readMeta = (uid) => { try { return JSON.parse(localStorage.getItem(META + uid)) || { hashes: {} }; } catch { return { hashes: {} }; } };
const writeMeta = (uid, m) => { try { localStorage.setItem(META + uid, JSON.stringify(m)); } catch { /* ignore */ } };
function localSynced() {
  const out = {};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && isSynced(k)) out[k] = localStorage.getItem(k); } } catch { /* ignore */ }
  return out;
}

let state = { status: 'idle', at: null, error: '' };
const setState = (patch) => { state = { ...state, ...patch }; window.dispatchEvent(new Event(EVT)); };
export const syncState = () => state;

let uid = null;
let busy = false;
let timer = null;
let lastStats = '';

async function pull() {
  const { data, error } = await supabase.from('user_data').select('key, value, updated_at');
  if (error) throw error;
  const meta = readMeta(uid);
  const local = localSynced();
  let changed = 0;
  data.forEach(({ key, value }) => {
    if (!isSynced(key)) return;
    const lv = local[key];
    const localDirty = lv != null && hash(lv) !== meta.hashes[key]; // edited here since the last sync
    if (lv === value) { meta.hashes[key] = hash(value); return; }
    if (localDirty && meta.hashes[key] != null) return; // keep this device's newer edit; it is pushed next
    try { localStorage.setItem(key, value); changed++; } catch { /* storage full */ }
    meta.hashes[key] = hash(value);
  });
  meta.pulledAt = Date.now();
  writeMeta(uid, meta);
  if (changed) {
    ['xlpbi-progress', 'upskillr-study', 'upskillr-project', 'storage'].forEach((e) => window.dispatchEvent(e === 'upskillr-study' || e === 'upskillr-project' ? new CustomEvent(e, {}) : new Event(e)));
  }
  return changed;
}

async function push() {
  const meta = readMeta(uid);
  const local = localSynced();
  const rows = [];
  Object.entries(local).forEach(([key, value]) => { const h = hash(value); if (meta.hashes[key] !== h) rows.push({ user_id: uid, key, value, h }); });
  const gone = Object.keys(meta.hashes).filter((k) => local[k] == null);
  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);
    // eslint-disable-next-line no-await-in-loop
    const { error } = await supabase.from('user_data').upsert(chunk.map(({ h, ...r }) => ({ ...r, updated_at: new Date().toISOString() })));
    if (error) throw error;
    chunk.forEach((r) => { meta.hashes[r.key] = r.h; });
  }
  if (gone.length) {
    const { error } = await supabase.from('user_data').delete().eq('user_id', uid).in('key', gone);
    if (!error) gone.forEach((k) => delete meta.hashes[k]);
  }
  writeMeta(uid, meta);
  // leaderboard numbers
  const s = computeStats();
  const stats = { xp: s.xp, level: levelOf(s.xp).level, streak: s.streak, lessons_done: s.done, tests_passed: s.testsPassed };
  const key = JSON.stringify(stats);
  if (key !== lastStats) {
    const { error } = await supabase.from('profiles').update({ ...stats, stats_at: new Date().toISOString() }).eq('id', uid);
    if (!error) lastStats = key;
  }
  return rows.length + gone.length;
}

export async function syncNow({ pullFirst = false } = {}) {
  if (!supaMode || !uid || busy) return;
  busy = true;
  setState({ status: 'syncing', error: '' });
  try {
    if (pullFirst) await pull();
    await push();
    setState({ status: 'synced', at: Date.now() });
  } catch (e) {
    setState({ status: navigator.onLine === false ? 'offline' : 'error', error: e?.message || String(e) });
  } finally { busy = false; }
}

const onVisibility = () => { if (document.visibilityState === 'hidden') syncNow(); else if (Date.now() - (readMeta(uid).pulledAt || 0) > 60000) syncNow({ pullFirst: true }); };
const onOnline = () => syncNow({ pullFirst: true });

/** Start syncing for the signed-in user (call again with null to stop). */
export function startSync(userId) {
  if (!supaMode) return;
  if (userId === uid) return;
  stopSync();
  if (!userId) return;
  uid = userId;
  lastStats = '';
  syncNow({ pullFirst: true });
  timer = setInterval(() => syncNow(), 20000);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('online', onOnline);
}
export function stopSync() {
  if (timer) clearInterval(timer);
  timer = null;
  document.removeEventListener('visibilitychange', onVisibility);
  window.removeEventListener('online', onOnline);
  uid = null;
  setState({ status: 'idle', at: null, error: '' });
}
export const SYNC_EVENT = EVT;
