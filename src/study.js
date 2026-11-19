// Student study tools: notes & highlights, mistake notebook, spaced-repetition revision,
// planner & focus timer, XP / levels / badges, daily coding challenge.
// Everything is stored in this browser. Keys start with "upskillr-study-" so the sign-in
// system keeps a separate copy for every student (see auth.js).
import { useCallback, useEffect, useState } from 'react';

const K = {
  notes: 'upskillr-study-notes',
  mistakes: 'upskillr-study-mistakes',
  srs: 'upskillr-study-srs',
  planner: 'upskillr-study-planner',
  focus: 'upskillr-study-focus',
  log: 'upskillr-study-log',
  daily: 'upskillr-study-daily',
  resume: 'upskillr-study-resume',
};
const EVT = 'upskillr-study';

const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } window.dispatchEvent(new CustomEvent(EVT, { detail: k })); };
export const studyRead = read;

// Re-renders when any study data (or general progress) changes.
export function useStudy(key, init) {
  const [v, setV] = useState(() => read(K[key] || key, init));
  useEffect(() => {
    const h = () => setV(read(K[key] || key, init));
    window.addEventListener(EVT, h);
    window.addEventListener('storage', h);
    window.addEventListener('xlpbi-progress', h);
    return () => { window.removeEventListener(EVT, h); window.removeEventListener('storage', h); window.removeEventListener('xlpbi-progress', h); };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = useCallback((fn) => write(K[key] || key, typeof fn === 'function' ? fn(read(K[key] || key, init)) : fn), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return [v, set];
}
export function useStudyTick() {
  const [, setN] = useState(0);
  useEffect(() => {
    const h = () => setN((n) => n + 1);
    window.addEventListener(EVT, h);
    window.addEventListener('xlpbi-progress', h);
    window.addEventListener('storage', h);
    return () => { window.removeEventListener(EVT, h); window.removeEventListener('xlpbi-progress', h); window.removeEventListener('storage', h); };
  }, []);
}

// ---------- dates ----------
export const dayKey = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
export const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n)); };
export const hashText = (s) => { let h = 2166136261; const t = String(s); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };

// ---------- activity log (powers planner goals, streaks and XP) ----------
// types: lesson, quiz, test, focus, review, challenge, note
export function logEvent(type, meta = {}) {
  const log = read(K.log, []);
  log.push({ type, at: Date.now(), day: dayKey(), ...meta });
  write(K.log, log.slice(-3000));
}
export const eventsOn = (day, type) => read(K.log, []).filter((e) => e.day === day && (!type || e.type === type));

// ---------- notes & highlights ----------
export function getNote(lessonKey) { return read(K.notes, {})[lessonKey] || { text: '', highlights: [] }; }
export function saveNote(lessonKey, patch, meta) {
  const all = read(K.notes, {});
  const cur = all[lessonKey] || { text: '', highlights: [] };
  const next = { ...cur, ...patch, ...(meta || {}), updatedAt: Date.now() };
  if (!next.text?.trim() && !next.highlights?.length) delete all[lessonKey]; else all[lessonKey] = next;
  write(K.notes, all);
}
export function addHighlight(lessonKey, text, meta) {
  const clean = String(text).replace(/\s+/g, ' ').trim().slice(0, 600);
  if (clean.length < 2) return;
  const cur = getNote(lessonKey);
  if (cur.highlights.some((h) => h.text === clean)) return;
  saveNote(lessonKey, { highlights: [...cur.highlights, { id: Date.now().toString(36), text: clean, at: Date.now() }] }, meta);
  logEvent('note', { lessonKey });
}

// ---------- mistakes + spaced repetition ----------
const BOXES = [1, 3, 7, 30]; // days until the next review after each correct answer
export const qidOf = (q) => hashText(`${q.question}|${[...(q.options || [])].sort().join('|')}`);

// Called by every quiz / test when it is submitted.
export function recordAnswers(questions, answers, origin = {}) {
  const mistakes = read(K.mistakes, {});
  const srs = read(K.srs, {});
  const today = dayKey();
  let wrong = 0;
  questions.forEach((q, i) => {
    if (answers[i] == null) return;
    const id = qidOf(q);
    const ok = answers[i] === q.answer;
    const item = { question: q.question, options: q.options, answer: q.answer, explanation: q.explanation || '' };
    if (!ok) {
      wrong++;
      const prev = mistakes[id];
      mistakes[id] = { q: item, source: q.source || origin.label || 'Quiz', link: origin.link || prev?.link || '', times: (prev?.times || 0) + 1, at: Date.now() };
      srs[id] = { q: item, source: mistakes[id].source, link: mistakes[id].link, box: 0, due: addDays(today, 1), reviews: srs[id]?.reviews || 0, added: srs[id]?.added || Date.now() };
    }
  });
  write(K.mistakes, mistakes);
  write(K.srs, srs);
  logEvent(origin.kind === 'test' ? 'test' : 'quiz', { total: questions.length, wrong, label: origin.label || '' });
}

// Answering a question again from the Mistake Notebook / Revision.
export function reviewAnswer(id, correct) {
  const srs = read(K.srs, {});
  const mistakes = read(K.mistakes, {});
  const today = dayKey();
  const it = srs[id] || (mistakes[id] ? { q: mistakes[id].q, source: mistakes[id].source, link: mistakes[id].link, box: 0, reviews: 0, added: Date.now() } : null);
  if (!it) return;
  if (correct) {
    delete mistakes[id];
    it.box = Math.min((it.box ?? 0) + 1, BOXES.length);
    it.due = it.box >= BOXES.length ? null : addDays(today, BOXES[it.box]);
  } else {
    it.box = 0;
    it.due = addDays(today, BOXES[0]);
    mistakes[id] = { q: it.q, source: it.source, link: it.link, times: (mistakes[id]?.times || 0) + 1, at: Date.now() };
  }
  it.reviews = (it.reviews || 0) + 1;
  it.last = today;
  if (it.due === null) it.mastered = today;
  srs[id] = it;
  write(K.srs, srs);
  write(K.mistakes, mistakes);
  logEvent('review', { correct });
}

// Interview questions / flashcards can be added to revision by hand (self-graded).
export function addCardToRevision({ question, answer, source, link }) {
  const srs = read(K.srs, {});
  const id = `c-${hashText(question)}`;
  if (srs[id]) return false;
  srs[id] = { card: { question, answer }, source: source || 'Interview Q&A', link: link || '', box: 0, due: addDays(dayKey(), 1), reviews: 0, added: Date.now() };
  write(K.srs, srs);
  return true;
}
export const dueItems = () => { const today = dayKey(); return Object.entries(read(K.srs, {})).filter(([, v]) => v.due && v.due <= today).map(([id, v]) => ({ id, ...v })); };
export const BOX_DAYS = BOXES;

// ---------- planner & focus timer ----------
export const DEFAULT_GOALS = { lessons: 2, quizzes: 1, focus: 50, reviews: 10 };
export function goalsProgress(day = dayKey(), goals) {
  const g = goals || read(K.planner, {}).goals || DEFAULT_GOALS;
  const ev = read(K.log, []).filter((e) => e.day === day);
  const focusMin = ev.filter((e) => e.type === 'focus').reduce((s, e) => s + (e.minutes || 0), 0);
  return [
    { key: 'lessons', label: 'Lessons completed', got: ev.filter((e) => e.type === 'lesson').length, want: g.lessons },
    { key: 'quizzes', label: 'Quizzes / tests taken', got: ev.filter((e) => e.type === 'quiz' || e.type === 'test').length, want: g.quizzes },
    { key: 'focus', label: 'Focus minutes', got: focusMin, want: g.focus },
    { key: 'reviews', label: 'Revision cards reviewed', got: ev.filter((e) => e.type === 'review').length, want: g.reviews },
  ].filter((x) => x.want > 0);
}

// Focus session lives in storage (with an end time) so it keeps running across pages.
export function startFocus(minutes, mode = 'focus', label = '') {
  write(K.focus, { mode, minutes, label, start: Date.now(), end: Date.now() + minutes * 60000, paused: null });
}
export function pauseFocus() { const f = read(K.focus, null); if (f && !f.paused) write(K.focus, { ...f, paused: Date.now() }); }
export function resumeFocus() { const f = read(K.focus, null); if (f?.paused) { const d = Date.now() - f.paused; write(K.focus, { ...f, end: f.end + d, start: f.start + d, paused: null }); } }
export function stopFocus(record = true) {
  const f = read(K.focus, null);
  if (f && record && f.mode === 'focus') {
    const mins = Math.floor(((f.paused || Math.min(Date.now(), f.end)) - f.start) / 60000);
    if (mins >= 1) logEvent('focus', { minutes: mins, label: f.label });
  }
  write(K.focus, null);
}
export const readFocus = () => read(K.focus, null);

// ---------- daily challenge ----------
export const challengeIndex = (day, n) => { const [y, m, d] = day.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000) % n; };
export function solveChallenge(day, id) {
  const all = read(K.daily, {});
  if (all[day]) return;
  all[day] = { id, at: Date.now() };
  write(K.daily, all);
  logEvent('challenge', { id });
}

// ---------- XP, levels, badges ----------
const safe = (k, d) => read(k, d);
export function computeStats() {
  const prog = safe('xlpbi-progress-v1', {});
  const done = Object.values(prog.done || {}).filter(Boolean).length;
  const quizzes = Object.keys(prog.quiz || {}).length;
  const practice = Object.values(prog.practice || {}).reduce((s, v) => s + (v?.length || 0), 0);
  const tests = safe('upskillr-tests-v1', {}).history || [];
  const testsPassed = Object.values(safe('upskillr-tests-v1', {}).results || {}).filter((r) => Math.max(r.mcq?.best || 0, r.mock?.best || 0) >= 60).length;
  const javaRes = safe('xlpbi-java-results-v1', {});
  const coding = Object.values(javaRes.coding || {}).filter(Boolean).length;
  let projects = 0;
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith('upskillr-project-v1:') && safe(k, {}).submission) projects++; } } catch { /* ignore */ }
  const log = safe(K.log, []);
  const focusMin = log.filter((e) => e.type === 'focus').reduce((s, e) => s + (e.minutes || 0), 0);
  const reviews = log.filter((e) => e.type === 'review').length;
  const challenges = Object.keys(safe(K.daily, {})).length;
  const notes = Object.keys(safe(K.notes, {})).length;
  const srs = Object.values(safe(K.srs, {}));
  const mastered = srs.filter((x) => x.mastered).length;
  const perfect = Object.entries(prog.quiz || {}).filter(([, v]) => v >= 5).length;
  const puzzles = Object.values(safe('upskillr-study-puzzles', {})).filter((x) => x?.solved).length;
  const battlesWon = safe('upskillr-study-battles', {}).won || 0;
  const feynman = log.filter((e) => e.type === 'feynman').length;
  const interviews = log.filter((e) => e.type === 'interview').length;
  // streak: any logged activity or progress activity per day
  const days = new Set([...log.map((e) => e.day), ...Object.keys(prog.activity || {})]);
  let streak = 0;
  let d = dayKey();
  if (!days.has(d)) d = addDays(d, -1);
  while (days.has(d)) { streak++; d = addDays(d, -1); }
  const xp = done * 10 + quizzes * 5 + perfect * 10 + practice * 5 + tests.length * 5 + testsPassed * 50 + coding * 15
    + projects * 100 + Math.floor(focusMin / 25) * 5 + reviews * 2 + challenges * 20 + notes * 2 + mastered * 5
    + puzzles * 5 + battlesWon * 10 + feynman * 3 + interviews * 5;
  return { puzzles, battlesWon, feynman, interviews, done, quizzes, perfect, practice, tests: tests.length, testsPassed, coding, projects, focusMin, reviews, challenges, notes, mastered, streak, xp, activeDays: days.size };
}
// Level n needs 100 * n * (n + 1) / 2 XP in total (100, 300, 600, 1000 …).
export function levelOf(xp) {
  let n = 0;
  while (100 * (n + 1) * (n + 2) / 2 <= xp) n++;
  const cur = 100 * n * (n + 1) / 2;
  const next = 100 * (n + 1) * (n + 2) / 2;
  const names = ['Beginner', 'Learner', 'Explorer', 'Achiever', 'Pro', 'Expert', 'Master', 'Champion', 'Legend'];
  return { level: n + 1, name: names[Math.min(n, names.length - 1)], cur, next, pct: (xp - cur) / (next - cur) };
}
export const BADGES = [
  ['first-step', '🌱', 'First Step', 'Complete your first lesson', (s) => s.done >= 1],
  ['ten-lessons', '📚', 'Bookworm', 'Complete 10 lessons', (s) => s.done >= 10],
  ['fifty-lessons', '🎓', 'Scholar', 'Complete 50 lessons', (s) => s.done >= 50],
  ['hundred-lessons', '🏛️', 'Centurion', 'Complete 100 lessons', (s) => s.done >= 100],
  ['quiz-5', '🧠', 'Quiz Starter', 'Take 5 lesson quizzes', (s) => s.quizzes >= 5],
  ['perfect-5', '💯', 'Perfectionist', 'Score 5/5 in 5 quizzes', (s) => s.perfect >= 5],
  ['test-pass', '🏆', 'Test Passer', 'Pass a test series test (60%+)', (s) => s.testsPassed >= 1],
  ['test-10', '🥇', 'Test Champion', 'Pass 10 test series tests', (s) => s.testsPassed >= 10],
  ['streak-3', '🔥', 'On Fire', '3-day study streak', (s) => s.streak >= 3],
  ['streak-7', '⚡', 'Week Warrior', '7-day study streak', (s) => s.streak >= 7],
  ['streak-30', '👑', 'Unstoppable', '30-day study streak', (s) => s.streak >= 30],
  ['focus-5h', '⏱️', 'Deep Focus', '5 hours of focus sessions', (s) => s.focusMin >= 300],
  ['revise-50', '🔁', 'Reviser', 'Review 50 revision cards', (s) => s.reviews >= 50],
  ['master-20', '🧩', 'Memory Master', 'Master 20 revision cards', (s) => s.mastered >= 20],
  ['coder-10', '💻', 'Problem Solver', 'Solve 10 coding problems', (s) => s.coding >= 10],
  ['daily-7', '📅', 'Daily Coder', 'Solve 7 daily challenges', (s) => s.challenges >= 7],
  ['project-1', '🚀', 'Builder', 'Submit a final project', (s) => s.projects >= 1],
  ['project-3', '🏗️', 'Portfolio Pro', 'Submit 3 final projects', (s) => s.projects >= 3],
  ['notes-10', '📝', 'Note Taker', 'Write notes on 10 lessons', (s) => s.notes >= 10],
  ['puzzle-25', '🧩', 'Puzzle Master', 'Solve 25 code puzzles', (s) => s.puzzles >= 25],
  ['battle-5', '⚔️', 'Battle Winner', 'Win 5 quiz battles', (s) => s.battlesWon >= 5],
  ['feynman-5', '🧠', 'Teacher Mode', 'Explain 5 concepts back (Feynman)', (s) => s.feynman >= 5],
  ['video-3', '🎥', 'Camera Ready', 'Record 3 video mock interviews', (s) => s.interviews >= 3],
];

// ---------- course completion ----------
export function courseCompletion(trackKey, topics) {
  const prog = safe('xlpbi-progress-v1', {});
  const done = topics.filter((t) => (prog.done || {})[`${trackKey}/${t.id}`]).length;
  const grand = safe('upskillr-tests-v1', {}).results?.[`${trackKey}#grand`]?.mcq?.best ?? null;
  return { done, total: topics.length, grand, eligible: topics.length > 0 && done === topics.length && (grand ?? 0) >= 60 };
}
