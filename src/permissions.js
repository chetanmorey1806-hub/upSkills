// Role-based access for NGU (admin decides what students can see), modelled on the bk-steels permission matrix:
// a MODULES registry (key, label, group, actions) + per-role defaults + optional per-student overrides + packages.
//
// Storage: admin settings live in localStorage under 'upskillr-auth-perms' (global, not swapped per user by auth.js).
// To apply the same settings on every device without a server, the admin downloads the settings file and publishes it
// as public/upskillr-config.json; it is loaded at startup and used as the base.
import { useEffect, useMemo, useState } from 'react';
import { tracks, trackGroups, trackOrder } from './data/index.js';
import { useAuth } from './auth.js';
import { DEFAULT_PACKAGES } from './data/packages.js';
import { supabase, supaMode } from './supabase.js';

const KEY = 'upskillr-auth-perms';
const EVT = 'upskillr-perms';

/* ------------------------------- registry ------------------------------- */
export const PAGES = [
  { key: 'page:roadmap', label: 'Roadmap', path: '/roadmap' },
  { key: 'page:courses', label: 'All Courses page', path: '/courses' },
  { key: 'page:videos', label: 'Video Lessons', path: '/videos' },
  { key: 'page:search', label: 'Search', path: '/search' },
];
export const TOOLS = [
  // [slug, label, group]
  ['playground', 'Web Playground', 'Practice Labs'], ['python-ide', 'Python IDE', 'Practice Labs'], ['java-ide', 'Java IDE', 'Practice Labs'],
  ['csharp-ide', 'C# IDE', 'Practice Labs'], ['api-lab', 'API Lab (Express)', 'Practice Labs'], ['mongo-lab', 'MongoDB Lab', 'Practice Labs'],
  ['mysql-workbench', 'MySQL Workbench', 'Practice Labs'], ['ssms-lab', 'SSMS Lab', 'Practice Labs'], ['sql-lab', 'SQL Lab', 'Practice Labs'],
  ['formula-lab', 'Excel Formula Lab', 'Practice Labs'], ['dax-lab', 'DAX Lab', 'Practice Labs'], ['power-query-lab', 'Power Query Lab', 'Practice Labs'],
  ['ai-lab', 'AI Prompt Lab', 'AI Tools'], ['ai-concepts', 'AI Concepts Lab', 'AI Tools'], ['ml-playground', 'ML Playground', 'AI Tools'],
  ['ai-app-builder', 'AI App Builder', 'AI Tools'], ['ai-tools', 'AI Tools Directory', 'AI Tools'],
  ['test-series', 'Test Series', 'Interview Prep'], ['java-interview', 'Interview Prep', 'Interview Prep'], ['soft-skills', 'Soft Skills Lab', 'Interview Prep'],
  ['interview-phrases', 'Interview Phrases', 'Interview Prep'], ['project-pitch', 'Explain Your Project', 'Interview Prep'], ['jam', 'JAM / Extempore', 'Interview Prep'],
  ['situational', 'Situational Round', 'Interview Prep'], ['company-hr', 'Company HR Rounds', 'Interview Prep'],
  ['versant', 'Versant / Communication Test', 'Interview Prep'], ['gd-topics', 'GD Topics', 'Interview Prep'], ['english-mistakes', 'Common English Mistakes', 'Interview Prep'],
  ['interview-day', 'Interview Day Kit', 'Interview Prep'], ['first-job', 'First Job Skills', 'Interview Prep'],
  ['dsa', 'DSA Practice Sheet', 'Interview Prep'], ['cheat-sheets', 'Cheat Sheets', 'Interview Prep'],
  ['placement-drives', 'Placement Drives', 'Career'], ['internship', 'Virtual Internship', 'Career'], ['ats-checker', 'Resume ATS Checker', 'Career'], ['profile-builder', 'LinkedIn & GitHub Builder', 'Career'],
  ['quiz', 'Quiz Arena', 'Interview Prep'], ['flashcards', 'Flashcards', 'Interview Prep'], ['shortcuts', 'Shortcuts & Cheat Sheets', 'Interview Prep'],
  ['web-projects', 'Web Dev Projects', 'Projects'], ['python-projects', 'Python Projects', 'Projects'], ['mern-projects', 'MERN Projects', 'Projects'],
  ['java-projects', 'Java Projects', 'Projects'],
];
export const COURSE_ACTIONS = [['view', 'Lessons'], ['tasks', 'Day Task'], ['tests', 'Test Series']];

// Groups for the permission matrix: { name, modules: [{ key, label, actions: [[action, label]] }] }
export function permissionGroups() {
  const used = new Set();
  const courseGroups = trackGroups.map((g) => ({
    name: `Courses · ${g.name}`,
    // a course can belong to several paths (e.g. HTML in Web + MERN): show it in each; the rows share one permission
    modules: g.tracks.filter((k) => tracks[k] && (used.add(k), true)).map((k) => ({ key: `course:${k}`, label: tracks[k].name, actions: COURSE_ACTIONS })),
  })).filter((g) => g.modules.length);
  const rest = trackOrder.filter((k) => !used.has(k) && tracks[k]);
  if (rest.length) courseGroups.push({ name: 'Courses · Other', modules: rest.map((k) => ({ key: `course:${k}`, label: tracks[k].name, actions: COURSE_ACTIONS })) });
  const toolGroups = [...new Set(TOOLS.map((t) => t[2]))].map((name) => ({ name, modules: TOOLS.filter((t) => t[2] === name).map(([slug, label]) => ({ key: `tool:${slug}`, label, actions: [['view', 'Open']] })) }));
  return [{ name: 'Pages', modules: PAGES.map((p) => ({ key: p.key, label: p.label, actions: [['view', 'Open']] })) }, ...courseGroups, ...toolGroups];
}
export const allModuleKeys = () => [...new Set(permissionGroups().flatMap((g) => g.modules.map((m) => m.key)))];

/* -------------------------------- storage -------------------------------- */
const empty = () => ({ roles: { student: {} }, users: {}, packages: null, settings: { packagesControlAccess: false } });
let published = null; // from public/upskillr-config.json
function readLocal() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } }
export function readPerms() {
  const base = published || empty();
  const local = readLocal();
  const m = { ...empty(), ...base, ...(local || {}) };
  m.roles = { ...empty().roles, ...(base.roles || {}), ...((local && local.roles) || {}) };
  m.users = { ...(base.users || {}), ...((local && local.users) || {}) };
  m.settings = { ...empty().settings, ...(base.settings || {}), ...((local && local.settings) || {}) };
  m.packages = (local && local.packages) || base.packages || null;
  const bm = base.media || {}, lm = (local && local.media) || {};
  m.media = { videos: { ...(bm.videos || {}), ...(lm.videos || {}) }, covers: { ...(bm.covers || {}), ...(lm.covers || {}) } };
  return m;
}
let saveTimer = null;
export function writePerms(next) {
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVT));
  // Supabase: the admin's settings are saved online and reach every student at once
  if (supaMode) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const value = readPerms();
      const { error } = await supabase.from('app_config').upsert({ id: 'perms', value, updated_at: new Date().toISOString() });
      if (!error) { published = value; window.dispatchEvent(new Event('upskillr-perms-saved')); }
    }, 800);
  }
}
export async function loadPublishedConfig() {
  if (supaMode) {
    try {
      const { data } = await supabase.from('app_config').select('value').eq('id', 'perms').maybeSingle();
      if (data?.value) { published = data.value; window.dispatchEvent(new Event(EVT)); return; }
    } catch { /* fall back to the file */ }
  }
  try {
    const r = await fetch(`${import.meta.env.BASE_URL || './'}upskillr-config.json`, { cache: 'no-store' });
    if (r.ok) { published = await r.json(); window.dispatchEvent(new Event(EVT)); }
  } catch { /* no published config: fine */ }
}
export const getPackages = (m = readPerms()) => m.packages || DEFAULT_PACKAGES;
export const packageTracks = (p) => (p.tracks === '*' ? trackOrder.filter((k) => tracks[k]) : (p.tracks || []).filter((k) => tracks[k]));

/* ------------------------------- resolution ------------------------------- */
// rules: { [moduleKey]: { [action]: false } } — anything not set to false is allowed (students see everything by default).
const allowedBy = (rules, key, action) => !(rules && rules[key] && rules[key][action] === false);

export function canFor(user, key, action = 'view', m = readPerms()) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const u = m.users[user.username] || {};
  if (u.disabled) return false;
  const rules = u.custom ? u.rules : m.roles.student;
  if (!allowedBy(rules, key, action)) return false;
  // Packages: when enabled, students only get the courses inside their assigned packages.
  if (m.settings.packagesControlAccess && key.startsWith('course:') && key !== 'course:coach') { // 'coach' = Interview Coach tests, not a package course
    const pk = getPackages(m).filter((p) => (u.packages || []).includes(p.id));
    if (!pk.some((p) => packageTracks(p).includes(key.slice(7)))) return false;
  }
  return true;
}

// Which permission a URL path needs.
export function pathRule(pathname, search = '') {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/admin' || p.startsWith('/admin/')) return { admin: true };
  let m = p.match(/^\/track\/([^/]+)/);
  if (m) return { key: `course:${m[1]}`, action: 'view' };
  m = p.match(/^\/tools\/test-series\/([^/]+)/);
  if (m) return decodeURIComponent(m[1]).startsWith('grp:') ? { key: 'tool:test-series', action: 'view' } : { key: `course:${decodeURIComponent(m[1])}`, action: 'tests', also: { key: 'tool:test-series', action: 'view' } };
  m = p.match(/^\/tools\/([^/]+)/);
  if (m) return { key: `tool:${m[1]}`, action: 'view' };
  const page = PAGES.find((x) => x.path === p);
  if (page) {
    if (page.key === 'page:videos') { const c = new URLSearchParams(search).get('course'); if (c) return { key: 'page:videos', action: 'view', also: { key: `course:${c}`, action: 'view' } }; }
    return { key: page.key, action: 'view' };
  }
  return null; // /home, /dashboard, /tools (index) etc. are always open
}
export function canPathFor(user, pathname, search, m = readPerms()) {
  const r = pathRule(pathname, search);
  if (!r) return true;
  if (r.admin) return user?.role === 'admin';
  return canFor(user, r.key, r.action, m) && (!r.also || canFor(user, r.also.key, r.also.action, m));
}

/* --------------------------------- hooks --------------------------------- */
export function usePerms() {
  const user = useAuth();
  const [m, setM] = useState(readPerms);
  useEffect(() => {
    const h = () => setM(readPerms());
    window.addEventListener(EVT, h); window.addEventListener('storage', h);
    return () => { window.removeEventListener(EVT, h); window.removeEventListener('storage', h); };
  }, []);
  return useMemo(() => ({
    user, m,
    isAdmin: user?.role === 'admin',
    disabled: !!(user && user.role !== 'admin' && m.users[user.username]?.disabled),
    can: (key, action = 'view') => canFor(user, key, action, m),
    canPath: (path, search = '') => canPathFor(user, path, search, m),
    canCourse: (k, action = 'view') => canFor(user, `course:${k}`, action, m),
  }), [user, m]);
}

// Remove menu entries the user may not open (works on any nested menu shape with `to`, `items`, `children`).
export function filterMenu(items, canPath) {
  return items.map((it) => {
    if (it.items || it.children) {
      const field = it.items ? 'items' : 'children';
      const kids = filterMenu(it[field], canPath);
      // index links ("All courses" etc.) don't count; course links like /videos?course=x do
      const realKids = kids.filter((k) => !(k.to && /^\/(courses|tools|videos)$/.test(k.to)));
      if (!realKids.length && !it.to) return null;
      return { ...it, [field]: kids };
    }
    if (!it.to) return it;
    const [path, q] = it.to.split('?');
    return canPath(path, q ? `?${q}` : '') ? it : null;
  }).filter(Boolean);
}
