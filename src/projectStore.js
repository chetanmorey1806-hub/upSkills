// Per-project saved state (files, milestones, test results, submission) in localStorage.
import { useCallback, useEffect, useState } from 'react';

const PREFIX = 'upskillr-project-v1:';
const EVT = 'upskillr-project';

export function readProject(id) {
  try { return JSON.parse(localStorage.getItem(PREFIX + id)) || {}; } catch { return {}; }
}

export function writeProject(id, data) {
  try { localStorage.setItem(PREFIX + id, JSON.stringify(data)); } catch { /* storage full or blocked */ }
  window.dispatchEvent(new CustomEvent(EVT, { detail: id }));
}

export function useProjectState(id) {
  const [state, setState] = useState(() => readProject(id));
  useEffect(() => {
    setState(readProject(id));
    const h = (e) => { if (!e.detail || e.detail === id) setState(readProject(id)); };
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, [id]);
  const update = useCallback((fn) => {
    const next = typeof fn === 'function' ? fn(readProject(id)) : fn;
    writeProject(id, next);
  }, [id]);
  return [state, update];
}

// Progress numbers used on cards and in the score.
export function projectProgress(project, st) {
  const tasks = (st.custom?.tasks && project.id === 'custom')
    ? st.custom.tasks.map((_, i) => `c-${i}`)
    : (project.milestones || []).flatMap((m, mi) => m.tasks.map((_, ti) => `${mi}-${ti}`));
  const tasksDone = tasks.filter((k) => st.done?.[k]).length;
  const results = st.tests?.results || [];
  const passed = results.filter((r) => r.status === 'PASS').length;
  return { tasks: tasks.length, tasksDone, testsTotal: results.length, passed, submitted: !!st.submission };
}

// Final score out of 100: tests 50, milestones 20, self-review 30 (custom projects: milestones 60, self-review 40).
export function projectScore(project, st) {
  const p = projectProgress(project, st);
  const rub = project.rubric.slice(2);
  const selfMax = rub.reduce((s, [, pts]) => s + pts, 0);
  const selfGot = rub.reduce((s, [, pts], i) => s + Math.min(pts, Number(st.rubric?.[i] || 0)), 0);
  const hasTests = !!project.tests;
  const testPart = hasTests && p.testsTotal ? (p.passed / p.testsTotal) * 50 : 0;
  const msWeight = hasTests ? 20 : 60;
  const selfWeight = hasTests ? 30 : 40;
  const msPart = p.tasks ? (p.tasksDone / p.tasks) * msWeight : 0;
  const selfPart = selfMax ? (selfGot / selfMax) * selfWeight : 0;
  return Math.round(testPart + msPart + selfPart);
}
