// DEV ONLY: /dev/verify-tasks/:track?only=<lessonId>
// Grades every task's model answer with the real grader (must pass) and the starter/empty answer (must fail).
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { tracks } from '../data/index.js';
import { dayTaskIds, loadDayTask } from '../data/dayTasks.js';
import { gradeTask, correctAnswer } from '../engine/dayTaskGrader.js';
import { DATASETS } from '../data/mongoDatasets.js';

const LANGS = ['html', 'css', 'dom', 'jsx', 'js', 'python', 'sql', 'mysql', 'tsql', 'mongo', 'excel', 'dax', 'express'];

function schemaErrors(d, lessonIds, id) {
  const e = [];
  if (!lessonIds.includes(id)) e.push(`file name "${id}" does not match any lesson id in this track`);
  if (d.lesson && d.lesson !== id) e.push(`lesson field "${d.lesson}" should equal the file name "${id}"`);
  if (typeof d.minutes !== 'number' || d.minutes < 5 || d.minutes > 120) e.push('minutes must be a number between 5 and 120');
  if (!Array.isArray(d.tasks) || d.tasks.length < 5 || d.tasks.length > 10) e.push(`tasks must have 5-10 items (has ${d.tasks?.length})`);
  (d.tasks || []).forEach((t, i) => {
    const p = `task ${i + 1}`;
    if (!t.q || typeof t.q !== 'string') e.push(`${p}: missing q`);
    if (!t.explain) e.push(`${p}: missing explain`);
    if (t.type === 'mcq' && (!Array.isArray(t.options) || t.options.length < 2 || !Number.isInteger(t.answer) || t.answer < 0 || t.answer >= t.options.length)) e.push(`${p}: mcq needs options and a valid answer index`);
    if (t.type === 'multi' && (!Array.isArray(t.options) || !Array.isArray(t.answers) || !t.answers.length || t.answers.some((a) => a >= t.options.length))) e.push(`${p}: multi needs options and answers[]`);
    if (t.type === 'fill' && !(t.accept?.length || t.acceptRegex?.length)) e.push(`${p}: fill needs accept[]`);
    if (t.type === 'output' && (typeof t.code !== 'string' || typeof t.expected !== 'string')) e.push(`${p}: output needs code and expected`);
    if (t.type === 'written' && (!t.rules?.length || !t.sample)) e.push(`${p}: written needs rules[] and sample`);
    if (t.type === 'code') {
      if (!LANGS.includes(t.lang)) e.push(`${p}: unknown lang ${t.lang}`);
      if (!t.solution) e.push(`${p}: code needs solution`);
      if (['html', 'css', 'dom', 'jsx'].includes(t.lang) && !t.checks?.length) e.push(`${p}: ${t.lang} needs checks[]`);
      if (['js', 'python', 'express'].includes(t.lang) && !t.tests?.length) e.push(`${p}: ${t.lang} needs tests[]`);
      if (t.lang === 'mongo' && !DATASETS[t.dataset || 'shop']) e.push(`${p}: unknown dataset ${t.dataset}`);
      if (t.lang === 'excel' && !t.grid) e.push(`${p}: excel needs grid`);
    }
    if (!['mcq', 'multi', 'fill', 'output', 'written', 'code'].includes(t.type)) e.push(`${p}: unknown type ${t.type}`);
  });
  return e;
}

export default function DevVerifyTasks() {
  const { track } = useParams();
  const [params] = useSearchParams();
  const only = params.get('only');
  const [out, setOut] = useState({ status: 'running', log: [] });

  useEffect(() => {
    (async () => {
      const lessonIds = (tracks[track]?.topics || []).map((t) => t.id);
      const ids = dayTaskIds(track).filter((id) => !only || only.split(',').includes(id)).sort();
      const report = { track, files: ids.length, tasks: 0, passed: 0, errors: [] };
      for (const id of ids) {
        let d;
        try { d = await loadDayTask(track, id); } catch (err) { report.errors.push({ lesson: id, msg: `cannot load: ${err.message}` }); continue; }
        if (!d) { report.errors.push({ lesson: id, msg: 'no default export' }); continue; }
        schemaErrors(d, lessonIds, id).forEach((m) => report.errors.push({ lesson: id, msg: m }));
        for (let i = 0; i < (d.tasks || []).length; i++) {
          const t = d.tasks[i];
          report.tasks++;
          const good = await gradeTask(t, correctAnswer(t));
          if (!good.ok) report.errors.push({ lesson: id, task: i + 1, msg: `MODEL ANSWER FAILS: ${(good.checks || []).filter((c) => !c.ok).map((c) => c.msg).join(' | ') || JSON.stringify(good).slice(0, 300)}` });
          else report.passed++;
          if (t.type === 'code') {
            const bad = await gradeTask(t, t.starter || '');
            if (bad.ok) report.errors.push({ lesson: id, task: i + 1, msg: 'the STARTER code already passes: make the checks stricter or the starter emptier' });
          }
          if (t.type === 'written') {
            const bad = await gradeTask(t, 'ok');
            if (bad.ok) report.errors.push({ lesson: id, task: i + 1, msg: 'a one-word answer passes: rules are too weak' });
          }
          setOut({ status: 'running', log: [`${id} task ${i + 1}`] });
        }
      }
      report.ok = report.errors.length === 0;
      setOut({ status: 'done', report });
      document.title = 'VERIFY-DONE';
    })();
  }, [track, only]);

  return <pre id="verify-out" style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(out, null, 1)}</pre>;
}
