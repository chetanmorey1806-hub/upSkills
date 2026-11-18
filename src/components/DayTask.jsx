import { useEffect, useMemo, useRef, useState } from 'react';
import { loadDayTask, hasDayTask } from '../data/dayTasks.js';
import { gradeTask, correctAnswer, NEEDS_PYTHON, pyLock } from '../engine/dayTaskGrader.js';
import { buildWebDoc, buildReactDoc } from './playgroundRuntime.js';
import { ensurePython, runPython } from './pyodideRunner.js';
import RichText, { Inline } from './RichText.jsx';
import ProgressBar from './ProgressBar.jsx';
import { usePerms } from '../permissions.js';

const STORE = 'upskillr-daytasks-v1';
const readAll = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } };
const save = (key, patch) => { const all = readAll(); all[key] = { ...(all[key] || {}), ...patch }; try { localStorage.setItem(STORE, JSON.stringify(all)); } catch { /* ignore */ } window.dispatchEvent(new Event('upskillr-daytasks')); };
export const dayTaskResult = (track, id) => readAll()[`${track}/${id}`];

const TYPE_LABEL = { mcq: 'Choose one', multi: 'Choose all that apply', fill: 'Fill in the blank', output: 'Predict the output', written: 'Write your answer', code: 'Write code' };
const LANG_LABEL = { html: 'HTML', css: 'CSS', dom: 'JavaScript (DOM)', jsx: 'React (JSX)', js: 'JavaScript', python: 'Python', sql: 'SQL (SQLite)', mysql: 'MySQL', tsql: 'T-SQL (SQL Server)', mongo: 'MongoDB shell', excel: 'Excel formula', dax: 'DAX measure', express: 'Express (Node.js)' };
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function CodeArea({ value, onChange, rows = 10, placeholder }) {
  const onKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target; const a = el.selectionStart, b = el.selectionEnd;
      const v = el.value.slice(0, a) + '  ' + el.value.slice(b);
      onChange(v);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = a + 2; });
    }
  };
  return <textarea className="dt-code" spellCheck={false} rows={rows} value={value} placeholder={placeholder} onKeyDown={onKey} onChange={(e) => onChange(e.target.value)} />;
}

function Preview({ task, code }) {
  const [doc, setDoc] = useState('');
  useEffect(() => {
    const id = setTimeout(() => {
      if (task.lang === 'html') setDoc(/<html|<!doctype/i.test(code) ? code : buildWebDoc({ html: code, css: task.css || '', libs: task.libs }));
      else if (task.lang === 'css') setDoc(buildWebDoc({ html: task.html || '', css: code, libs: task.libs }));
      else if (task.lang === 'dom') setDoc(buildWebDoc({ html: task.html || '', css: task.css || '', js: code, libs: task.libs }));
      else if (task.lang === 'jsx') setDoc(buildReactDoc({ jsx: code, css: task.css || '' }));
    }, 500);
    return () => clearTimeout(id);
  }, [code, task]);
  return <iframe className="dt-preview" title="preview" sandbox="allow-scripts allow-modals" srcDoc={doc} />;
}

function RunBox({ task, code }) {
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true); setOut('Running…');
    if (task.lang === 'js') {
      const logs = [];
      try {
        const con = { log: (...a) => logs.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')), error: (...a) => logs.push(a.join(' ')) };
        // eslint-disable-next-line no-new-func
        new Function('console', code)(con);
        setOut(logs.join('\n') || '(no console output: call your function and console.log the result to see it)');
      } catch (e) { setOut(`${logs.join('\n')}\n${e.name}: ${e.message}`.trim()); }
    } else {
      let text = '';
      await ensurePython();
      await pyLock(() => runPython({ files: { 'main.py': code }, stdin: task.stdin || '' }, (m) => { if (m.type === 'out' || m.type === 'err') text += m.text; if (m.type === 'done' && m.error) text += `\n${m.error}`; }));
      setOut(text.trim() || '(no output)');
    }
    setBusy(false);
  };
  return (
    <div className="dt-run">
      <button className="btn small" onClick={run} disabled={busy}>▶ Run my code</button>
      {task.lang === 'python' && <span className="muted small"> (first run loads Python, ~10-30 s)</span>}
      {out != null && <pre className="dt-out">{out}</pre>}
    </div>
  );
}

function TaskInput({ task, value, onChange, disabled }) {
  if (task.type === 'mcq') return (
    <div className="quiz-opts">{task.options.map((o, i) => (
      <button key={i} className={`opt ${value === i ? 'picked' : ''}`} disabled={disabled} onClick={() => onChange(i)}><span className="opt-letter">{'ABCD'[i] || i + 1}</span><Inline text={o} /></button>
    ))}</div>
  );
  if (task.type === 'multi') {
    const set = new Set(value || []);
    return (
      <div className="quiz-opts">{task.options.map((o, i) => (
        <label key={i} className={`opt ${set.has(i) ? 'picked' : ''}`}><input type="checkbox" disabled={disabled} checked={set.has(i)} onChange={() => { const n = new Set(set); n.has(i) ? n.delete(i) : n.add(i); onChange([...n].sort()); }} /> <Inline text={o} /></label>
      ))}</div>
    );
  }
  if (task.type === 'fill') return <input className="input mono" disabled={disabled} value={value || ''} placeholder="Type your answer" onChange={(e) => onChange(e.target.value)} />;
  if (task.type === 'output') return <CodeArea value={value || ''} onChange={onChange} rows={4} placeholder="Type the exact output, line by line" />;
  if (task.type === 'written') return <textarea className="input" rows={6} disabled={disabled} value={value || ''} placeholder="Write your answer here" onChange={(e) => onChange(e.target.value)} />;
  const code = value ?? task.starter ?? '';
  return (
    <div>
      {task.lang === 'css' && task.html && <details className="dt-given"><summary>Given HTML (do not change)</summary><pre>{task.html}</pre></details>}
      {task.lang === 'dom' && task.html && <details className="dt-given"><summary>Given HTML</summary><pre>{task.html}</pre></details>}
      {['sql', 'mysql', 'tsql'].includes(task.lang) && task.setup && <details className="dt-given"><summary>Tables you can use (setup)</summary><pre>{task.setup}</pre></details>}
      {task.lang === 'excel' && task.grid && <ExcelGrid grid={task.grid} />}
      {task.lang === 'mongo' && <p className="muted small">Database: <b>{task.dataset || 'shop'}</b> (same sample data as the MongoDB Lab).</p>}
      <CodeArea value={code} onChange={onChange} rows={task.lang === 'excel' || task.lang === 'dax' ? 2 : 10} placeholder={task.lang === 'excel' ? '=SUM(B2:B6)' : ''} />
      {['html', 'css', 'dom', 'jsx'].includes(task.lang) && <Preview task={task} code={code} />}
      {['js', 'python'].includes(task.lang) && <RunBox task={task} code={code} />}
    </div>
  );
}

function ExcelGrid({ grid }) {
  const cells = Object.keys(grid);
  const cols = [...new Set(cells.map((c) => c.match(/^[A-Z]+/)[0]))].sort();
  const rows = [...new Set(cells.map((c) => Number(c.match(/\d+$/)[0])))].sort((a, b) => a - b);
  return (
    <div className="table-wrap"><table className="data-table"><thead><tr><th className="rownum"></th>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>{rows.map((r) => <tr key={r}><td className="rownum">{r}</td>{cols.map((c) => <td key={c}>{grid[`${c}${r}`] ?? ''}</td>)}</tr>)}</tbody></table></div>
  );
}

function AnswerView({ task, value }) {
  if (task.type === 'mcq') return <span>{value == null ? '(no answer)' : task.options[value]}</span>;
  if (task.type === 'multi') return <span>{(value || []).length ? value.map((i) => task.options[i]).join(' · ') : '(no answer)'}</span>;
  return <pre className="dt-ans">{value == null || value === '' ? '(no answer)' : String(value)}</pre>;
}

export default function DayTask({ track, lesson }) {
  const key = `${track}/${lesson.id}`;
  const [data, setData] = useState(undefined);
  const [st, setSt] = useState(() => readAll()[key] || {});
  const [phase, setPhase] = useState('intro');
  const [grading, setGrading] = useState(null);
  const [left, setLeft] = useState(0);
  const topRef = useRef(null);
  const { canCourse } = usePerms();
  const allowed = canCourse(track, 'tasks');

  useEffect(() => {
    let alive = true;
    setData(undefined); setSt(readAll()[key] || {});
    if (!hasDayTask(track, lesson.id)) { setData(null); return undefined; }
    loadDayTask(track, lesson.id).then((d) => { if (alive) setData(d); });
    return () => { alive = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const s = readAll()[key] || {};
    if (s.result && !s.startedAt) setPhase('result');
    else if (s.startedAt) setPhase('work');
    else setPhase('intro');
  }, [key, data]);

  const total = data?.tasks?.length || 0;
  const limit = (data?.minutes || 20) * 60;

  useEffect(() => {
    if (phase !== 'work' || !st.startedAt) return undefined;
    const tick = () => {
      const l = Math.max(0, limit - Math.floor((Date.now() - st.startedAt) / 1000));
      setLeft(l);
      if (l === 0) submit(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, st.startedAt, limit]); // eslint-disable-line react-hooks/exhaustive-deps

  const answers = st.answers || {};
  const setAnswer = (i, v) => { const n = { ...answers, [i]: v }; setSt((s) => ({ ...s, answers: n })); save(key, { answers: n }); };
  const start = () => { const s = { answers: {}, startedAt: Date.now() }; setSt((x) => ({ ...x, ...s })); save(key, s); setPhase('work'); topRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  async function submit(timeUp = false) {
    if (grading) return;
    const items = [];
    setGrading({ done: 0, total });
    if (data.tasks.some(NEEDS_PYTHON)) await ensurePython();
    for (let i = 0; i < data.tasks.length; i++) {
      const t = data.tasks[i];
      const r = await gradeTask(t, answers[i] ?? (t.type === 'code' ? '' : undefined));
      items.push({ ok: r.ok, checks: r.checks, got: r.got, expected: r.expected });
      setGrading({ done: i + 1, total });
    }
    const score = items.filter((x) => x.ok).length;
    const secs = Math.min(limit, Math.round((Date.now() - (st.startedAt || Date.now())) / 1000));
    const result = { score, total, items, at: Date.now(), secs, timeUp };
    const best = Math.max(score, st.best || 0);
    const history = [...(st.history || []), { score, total, at: result.at, secs }].slice(-10);
    const patch = { result, best, history, startedAt: null };
    setSt((s) => ({ ...s, ...patch })); save(key, patch);
    setGrading(null); setPhase('result');
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  if (!allowed) return <div className="card locked"><div className="locked-ic">🔒</div><h3>Day Task is locked</h3><p className="muted">Your admin has not enabled Day Tasks for this course yet.</p></div>;
  if (data === undefined) return <div className="card"><p className="muted">Loading today's tasks…</p></div>;
  if (data === null) return (
    <div className="card dt-empty"><h3>📝 Day Task</h3><p className="muted">Timed practice tasks for this day are being added. Meanwhile, do the exercises in the <b>Practice</b> tab and the <b>Quiz</b>.</p></div>
  );

  const view = phase === 'result' && !st.result ? 'intro' : phase;
  const counts = data.tasks.reduce((m, t) => { const k = t.type === 'code' ? `code:${t.lang}` : t.type; m[k] = (m[k] || 0) + 1; return m; }, {});

  if (view === 'intro') return (
    <div ref={topRef} className="dt">
      <div className="card dt-intro">
        <div className="dt-intro-top">
          <div>
            <h2>📝 Day Task: {lesson.title}</h2>
            <p className="muted">{data.intro || 'Solve these tasks to check what you learned today. Your answers are checked automatically and every mistake is explained.'}</p>
          </div>
          <div className="dt-time"><b>{data.minutes || 20}</b><span>minutes</span></div>
        </div>
        <div className="chips">
          <span className="tag">🧩 {total} tasks</span>
          {Object.entries(counts).map(([k, n]) => <span key={k} className="tag">{n} × {k.startsWith('code:') ? LANG_LABEL[k.slice(5)] || k.slice(5) : TYPE_LABEL[k]}</span>)}
        </div>
        <ol className="dt-rules">
          <li>Click <b>Start</b>: the timer begins ({data.minutes || 20} minutes). Answers are saved automatically.</li>
          <li>Solve each task here. HTML/CSS/React tasks show a live preview; JavaScript and Python tasks have a Run button.</li>
          <li>Click <b>Submit all</b> (or wait for the timer). You will see how many are correct and why each wrong answer is wrong.</li>
        </ol>
        {st.result && <p className="small">Last attempt: <b>{st.result.score}/{st.result.total}</b> · best {st.best}/{st.result.total}</p>}
        <div className="row-btns">
          <button className="btn primary" onClick={start}>▶ Start the task ({data.minutes || 20} min)</button>
          {st.result && <button className="btn" onClick={() => setPhase('result')}>See my last result</button>}
        </div>
      </div>
    </div>
  );

  if (view === 'work') {
    const answered = data.tasks.filter((t, i) => answers[i] != null && answers[i] !== '' && !(Array.isArray(answers[i]) && !answers[i].length)).length;
    return (
      <div ref={topRef} className="dt">
        <div className={`dt-bar ${left < 60 ? 'low' : ''}`}>
          <span>⏱ {fmt(left)}</span>
          <span className="muted small">{answered}/{total} answered</span>
          <button className="btn small primary" onClick={() => submit(false)} disabled={!!grading}>{grading ? `Checking ${grading.done}/${grading.total}…` : '✔ Submit all'}</button>
        </div>
        {data.tasks.map((t, i) => (
          <div key={i} className="card dt-task">
            <div className="dt-task-head">
              <span className="dt-num">{i + 1}</span>
              <span className="tag">{t.type === 'code' ? `💻 ${LANG_LABEL[t.lang] || t.lang}` : TYPE_LABEL[t.type]}</span>
              {t.mins && <span className="muted small">~{t.mins} min</span>}
            </div>
            <div className="dt-q"><RichText text={t.q} /></div>
            {t.example && (
              <div className="dt-example">
                <b>💡 Example{t.example.title ? `: ${t.example.title}` : ''}</b>
                {t.example.text && <RichText text={t.example.text} />}
                {t.example.code && <pre>{t.example.code}</pre>}
              </div>
            )}
            {t.type === 'output' && <pre className="dt-codeblock">{t.code}</pre>}
            <TaskInput task={t} value={answers[i]} onChange={(v) => setAnswer(i, v)} />
          </div>
        ))}
        <div className="center"><button className="btn primary" onClick={() => submit(false)} disabled={!!grading}>{grading ? `Checking ${grading.done}/${grading.total}…` : `✔ Submit all ${total} tasks`}</button></div>
      </div>
    );
  }

  const r = st.result;
  const pct = Math.round((r.score / r.total) * 100);
  return (
    <div ref={topRef} className="dt">
      <div className={`card result-card ${pct >= 60 ? 'pass' : 'fail'} dt-summary`}>
        <div className="score-ring" style={{ '--p': pct }}><span>{r.score}</span><small>/{r.total}</small></div>
        <div>
          <h2>{pct === 100 ? '🏆 Perfect!' : pct >= 60 ? '🎉 Well done!' : '📚 Keep practising'}</h2>
          <p><b className="ok-t">✅ {r.score} correct</b> · <b className="bad-t">❌ {r.total - r.score} wrong</b> · ⏱ {fmt(r.secs || 0)}{r.timeUp ? ' (time up)' : ''}</p>
          <ProgressBar value={r.score / r.total} color={pct >= 60 ? 'var(--ok)' : undefined} />
          <p className="muted small">Best score: {st.best}/{r.total} · attempts: {(st.history || []).length}</p>
          <div className="row-btns"><button className="btn primary" onClick={start}>↻ Try again</button></div>
        </div>
      </div>
      {data.tasks.map((t, i) => {
        const it = r.items[i] || {};
        const ans = (st.answers || {})[i];
        return (
          <div key={i} className={`card dt-task dt-r ${it.ok ? 'ok' : 'bad'}`}>
            <div className="dt-task-head"><span className="dt-num">{i + 1}</span><b>{it.ok ? '✅ Correct' : '❌ Wrong'}</b><span className="tag">{t.type === 'code' ? LANG_LABEL[t.lang] || t.lang : TYPE_LABEL[t.type]}</span></div>
            <div className="dt-q"><RichText text={t.q} /></div>
            {t.type === 'output' && <pre className="dt-codeblock">{t.code}</pre>}
            <div className="dt-yours"><span className="muted small">Your answer</span><AnswerView task={t} value={t.type === 'code' ? ans ?? '' : ans} /></div>
            {!it.ok && (
              <div className="dt-why">
                <b>Why it is wrong</b>
                {(it.checks || []).filter((c) => !c.ok).length ? <ul>{it.checks.filter((c) => !c.ok).map((c, k) => <li key={k}>{c.msg}</li>)}</ul> : null}
                {it.got != null && it.expected != null && t.type !== 'mcq' && t.type !== 'multi' && t.type !== 'fill' && t.type !== 'output' && (
                  <div className="mongo-cmp"><div><span className="muted small">Your result</span><pre>{String(it.got)}</pre></div><div><span className="muted small">Expected</span><pre>{String(it.expected)}</pre></div></div>
                )}
                {(t.type === 'mcq' || t.type === 'multi' || t.type === 'fill' || t.type === 'output') && <div className="dt-correct"><span className="muted small">Correct answer</span><AnswerView task={t} value={correctAnswer(t)} /></div>}
              </div>
            )}
            {it.ok && (it.checks || []).length > 1 && <ul className="dt-passed">{it.checks.map((c, k) => <li key={k}>✓ {c.msg.replace(/ ✓$/, '')}</li>)}</ul>}
            {t.explain && <div className="tip"><b>Explanation:</b> <RichText text={t.explain} /></div>}
            {['code', 'written'].includes(t.type) && (t.solution || t.sample) && (
              <details className="dt-sol"><summary>{t.type === 'written' ? 'Model answer' : 'Model solution'}</summary><pre>{t.solution || t.sample}</pre></details>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function useDayTaskBadge(track, id) {
  const [r, setR] = useState(() => dayTaskResult(track, id));
  useEffect(() => { const h = () => setR(dayTaskResult(track, id)); window.addEventListener('upskillr-daytasks', h); return () => window.removeEventListener('upskillr-daytasks', h); }, [track, id]);
  return useMemo(() => (r?.result ? `${r.best}/${r.result.total}` : null), [r]);
}
