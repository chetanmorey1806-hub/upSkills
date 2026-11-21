import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Editor, { loader } from '@monaco-editor/react';
import { findProject, TEST_RUNNER } from '../data/projects.js';
import { findTopic, tracks } from '../data/index.js';
import { ensurePython, runPython, restartPython } from '../components/pyodideRunner.js';
import { useProjectState, projectProgress, projectScore } from '../projectStore.js';
import { CUSTOM_PROJECT } from './Projects.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { Inline } from '../components/RichText.jsx';
import { CertPhoto, CertName } from '../components/MediaBits.jsx';

import Ico from '../components/Ico.jsx';
const TABS = [['brief', 'Brief'], ['code', 'Code'], ['tests', 'Tests'], ['submit', 'Submit']];
const ICON = { PASS: '✅', FAIL: '❌', ERROR: '💥', TODO: '⏳' };

function downloadFile(name, text, type = 'text/x-python') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ProjectWorkspace() {
  const { id } = useParams();
  const project = id === 'custom' ? CUSTOM_PROJECT : findProject(id);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'brief';
  const setTab = (k) => setParams({ tab: k }, { replace: true });
  const [st, update] = useProjectState(id);

  const files = st.files || project?.files || {};
  const names = Object.keys(files);
  const [active, setActive] = useState('main.py');
  const cur = files[active] != null ? active : names[0];
  const [out, setOut] = useState([]);
  const [status, setStatus] = useState('loading');
  const [testing, setTesting] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const token = useRef(0);

  useEffect(() => { loader.init().catch(() => setFallback(true)); }, []);
  useEffect(() => { ensurePython().then((m) => setStatus(m.type === 'ready' ? 'ready' : 'error')); }, []);

  if (!project) return <p>Project not found. <Link to="/tools/python-projects">All projects</Link></p>;

  const setFiles = (fn) => update((s) => ({ ...s, files: typeof fn === 'function' ? fn(s.files || project.files) : fn }));
  const stdin = st.stdin ?? project.stdin ?? '';
  const pr = projectProgress(project, st);
  const score = projectScore(project, st);
  const custom = project.id === 'custom';
  const tasks = custom ? (st.custom?.tasks || []).map((t, i) => ({ key: `c-${i}`, text: t })) : null;

  const run = async () => {
    if (status !== 'ready') return;
    const t = ++token.current;
    setOut([{ k: 'sys', t: '$ python main.py\n' }]);
    setStatus('running');
    await runPython({ files, stdin }, (m) => {
      if (t !== token.current) return;
      if (m.type === 'out' || m.type === 'in') setOut((o) => [...o, { k: m.type, t: m.text }]);
      if (m.type === 'err') setOut((o) => [...o, { k: 'err', t: m.text }]);
      if (m.type === 'done') setOut((o) => [...o, m.error ? { k: 'err', t: `\n${m.error}` } : { k: 'sys', t: `\nProcess finished in ${m.ms} ms` }]);
    });
    if (t === token.current) setStatus('ready');
  };

  const stop = async () => {
    token.current++;
    setStatus('loading'); setTesting(false);
    const m = await restartPython();
    setStatus(m.type === 'ready' ? 'ready' : 'error');
  };

  const runTests = async () => {
    if (!project.tests || status !== 'ready') return;
    setTab('tests');
    setTesting(true);
    setStatus('running');
    let text = '';
    let err = '';
    await runPython({ files: { ...files, 'main.py': TEST_RUNNER, '_tests.py': project.tests } }, (m) => {
      if (m.type === 'out') text += m.text;
      if (m.type === 'err') err += m.text;
      if (m.type === 'done' && m.error) err += m.error;
    }, 30000);
    const results = text.split('\n').filter((l) => l.startsWith('##TEST ')).map((l) => { try { return JSON.parse(l.slice(7)); } catch { return null; } }).filter(Boolean);
    update((s) => ({ ...s, tests: { results, err: results.length ? '' : err.trim().slice(-1500), at: Date.now() }, runs: (s.runs || 0) + 1 }));
    setTesting(false);
    setStatus('ready');
  };

  const addFile = () => {
    const n = window.prompt('New Python file name (e.g. utils.py):');
    if (!n) return;
    const f = n.endsWith('.py') ? n : `${n}.py`;
    if (!/^[A-Za-z]\w*\.py$/.test(f)) { window.alert('Use a valid module name, e.g. helpers.py'); return; }
    if (!files[f]) setFiles((fs) => ({ ...fs, [f]: '' }));
    setActive(f);
  };
  const resetCode = () => {
    if (!window.confirm('Reset all files to the starter code? Your code will be lost.')) return;
    update((s) => ({ ...s, files: project.files }));
    setActive('main.py');
  };
  const downloadAll = () => names.forEach((n, i) => setTimeout(() => downloadFile(n, files[n]), i * 300));
  const toggleTask = (k) => update((s) => ({ ...s, done: { ...(s.done || {}), [k]: !(s.done || {})[k] } }));

  const results = st.tests?.results || [];
  const related = (project.related || []).map((r) => { const [tk, tid] = r.split('/'); const f = tid && findTopic(tk, tid); return f ? { tk, tid, title: f.topic.title } : null; }).filter(Boolean);

  return (
    <div className="project">
      <div className="crumbs"><Link to="/tools/python-projects">Final Projects</Link> › {project.title}</div>
      <div className="page-head">
        <h1><Ico e={project.icon} /> {project.title}</h1>
        <p className="muted">{project.summary}</p>
        <div className="meta">
          <span className={`lvl lvl-${project.level}`}>{project.level}</span>
          <span><Ico e="⏱" /> {project.hours}</span>
          {project.tests && <span><Ico e="✅" /> {pr.passed}/{pr.testsTotal || '?'} tests passing</span>}
          <span><Ico e="🗂" /> {pr.tasksDone}/{pr.tasks} milestone tasks</span>
          {st.submission && <span className="badge ok">✓ Submitted · {st.submission.score}/100</span>}
        </div>
      </div>

      <div className="tabs">
        {TABS.filter(([k]) => k !== 'tests' || project.tests).map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'brief' && (
        <div className="proj-brief">
          {custom ? (
            <div className="card">
              <h3>Describe your project</h3>
              <label className="field">Project title<input className="input" value={st.custom?.title || ''} placeholder="e.g. Hospital Appointment System" onChange={(e) => update((s) => ({ ...s, custom: { ...(s.custom || {}), title: e.target.value } }))} /></label>
              <label className="field">What does it do? Who uses it?<textarea className="input" rows={4} value={st.custom?.desc || ''} placeholder="Problem, users, main features…" onChange={(e) => update((s) => ({ ...s, custom: { ...(s.custom || {}), desc: e.target.value } }))} /></label>
              <h4>Your milestones</h4>
              <p className="muted small">Break the project into small tasks (one per line). Tick them off as you build.</p>
              <textarea className="input" rows={6} value={(st.custom?.tasks || []).join('\n')} placeholder={'Design the data model\nAdd / view / delete records\nSave to a file\nInput validation\nFinal testing'}
                onChange={(e) => update((s) => ({ ...s, custom: { ...(s.custom || {}), tasks: e.target.value.split('\n') } }))} />
            </div>
          ) : (
            <>
              <div className="card story"><h3><Ico e="📖" /> The story</h3><p>{project.story}</p></div>
              <div className="grid2">
                <div className="card"><h3><Ico e="🎯" /> Requirements</h3><ul>{project.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
                <div className="card">
                  <h3><Ico e="🧠" /> Skills you will use</h3>
                  <div className="chips">{project.skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
                  {related.length > 0 && (<><h4>Revise first</h4><ul>{related.map((r) => <li key={r.tid}><Link to={`/track/${r.tk}/${r.tid}`}>{tracks[r.tk]?.short}: {r.title}</Link></li>)}</ul></>)}
                </div>
              </div>
            </>
          )}

          <div className="card">
            <h3><Ico e="🗂" /> Milestones</h3>
            <ProgressBar value={pr.tasks ? pr.tasksDone / pr.tasks : 0} />
            {custom ? (
              tasks.filter((t) => t.text.trim()).length ? (
                <ul className="task-list">{tasks.map((t) => t.text.trim() && (
                  <li key={t.key}><label className="check"><input type="checkbox" checked={!!st.done?.[t.key]} onChange={() => toggleTask(t.key)} /> {t.text}</label></li>
                ))}</ul>
              ) : <p className="muted">Add your milestones above.</p>
            ) : project.milestones.map((m, mi) => (
              <div key={mi} className="milestone">
                <h4>Step {mi + 1}: {m.title}</h4>
                <ul className="task-list">
                  {m.tasks.map((t, ti) => (
                    <li key={ti}><label className="check"><input type="checkbox" checked={!!st.done?.[`${mi}-${ti}`]} onChange={() => toggleTask(`${mi}-${ti}`)} /> {t}</label></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {!custom && (
            <div className="grid2">
              <details className="card"><summary><b><Ico e="💡" /> Hints</b></summary><ul>{project.hints.map((h, i) => <li key={i}><Inline text={h} /></li>)}</ul></details>
              <div className="card"><h3><Ico e="🚀" /> Go further (bonus)</h3><ul>{project.extensions.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            </div>
          )}
          <div className="center"><button className="btn primary" onClick={() => setTab('code')}>Start coding →</button></div>
        </div>
      )}

      {tab === 'code' && (
        <div className="jide pyide proj-ide">
          <div className="jide-top">
            <div className="jide-title">
              <span className="jide-logo py"><Ico e="🐍" /></span>
              <b>{custom ? (st.custom?.title || 'My project') : project.title}</b>
              <span className="jide-sub">{status === 'loading' ? 'loading Python…' : status === 'error' ? 'Python failed to load (needs internet once)' : 'saved automatically'}</span>
            </div>
            <div className="jide-actions">
              <button className="btn small primary" onClick={run} disabled={status !== 'ready'}>▶ Run main.py</button>
              {project.tests && <button className="btn small primary" onClick={runTests} disabled={status !== 'ready'}><Ico e="✅" /> Run tests</button>}
              <button className="btn small" onClick={stop} disabled={status !== 'running'}>■ Stop</button>
              <button className="btn small" onClick={addFile}>＋ File</button>
              <button className="btn small" onClick={downloadAll}><Ico e="⬇" /> Download</button>
              <button className="btn small" onClick={resetCode}>↺ Reset</button>
            </div>
          </div>
          <div className="pg-tabs">
            {names.map((n) => <button key={n} className={`pg-tab ${n === cur ? 'on' : ''}`} onClick={() => setActive(n)}><Ico e="🐍" /> {n}</button>)}
          </div>
          <div className="proj-editor">
            {fallback ? (
              <textarea className="pg-fallback" spellCheck={false} value={files[cur]} onChange={(e) => { const v = e.target.value; setFiles((fs) => ({ ...fs, [cur]: v })); }} />
            ) : (
              <Editor key={cur} language="python" path={`${id}/${cur}`} theme="vs-dark" value={files[cur]}
                onChange={(v) => setFiles((fs) => ({ ...fs, [cur]: v ?? '' }))}
                loading={<div className="pg-loading">Loading editor…</div>}
                options={{ fontSize: 14, minimap: { enabled: false }, tabSize: 4, insertSpaces: true, automaticLayout: true, scrollBeyondLastLine: false, wordWrap: 'on' }} />
            )}
          </div>
          <div className="proj-io">
            <div className="proj-stdin">
              <div className="jide-ptabs"><button className="on">⌨ Input (one line per input())</button></div>
              <textarea className="jide-stdin" value={stdin} onChange={(e) => { const v = e.target.value; update((s) => ({ ...s, stdin: v })); }} />
            </div>
            <div className="proj-out">
              <div className="jide-ptabs"><button className="on">▶ Output</button></div>
              <div className="jide-pbody">
                {out.length ? <pre className="jide-out">{out.map((o, i) => <span key={i} className={`py-${o.k}`}>{o.t}</span>)}</pre>
                  : <div className="pg-muted">{status === 'loading' ? 'Loading Python (first time takes a few seconds)…' : 'Click ▶ Run to start the app with the input on the left.'}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'tests' && project.tests && (
        <div>
          <div className="toolbar">
            <h3>Automated tests</h3>
            <button className="btn primary" onClick={runTests} disabled={status !== 'ready'}>{testing ? <><Ico e="⏳" /> Running…</> : '▶ Run all tests'}</button>
          </div>
          {results.length > 0 && (
            <div className="card test-summary">
              <b>{pr.passed}/{pr.testsTotal} tests passing</b>
              <ProgressBar value={pr.passed / pr.testsTotal} color={pr.passed === pr.testsTotal ? 'var(--ok)' : undefined} />
              <span className="muted small">Last run {new Date(st.tests.at).toLocaleString()} · {st.runs || 0} runs so far</span>
              {pr.passed === pr.testsTotal && <p className="result"><Ico e="🎉" /> All tests pass! Tick your milestones and go to <b>Submit</b>.</p>}
            </div>
          )}
          {st.tests?.err && <div className="card"><b>Your code could not be loaded:</b><pre className="err-pre">{st.tests.err}</pre></div>}
          {results.length === 0 && !st.tests?.err && <p className="muted">Click <b>Run all tests</b>. Tests check each function in your files. Start with the first failing test.</p>}
          <div className="test-list">
            {results.map((r) => (
              <div key={r.name} className={`card test-row t-${r.status}`}>
                <span className="test-ic">{ICON[r.status]}</span>
                <div>
                  <b>{r.doc}</b>
                  <div className="muted small mono">{r.name}</div>
                  {r.msg && <div className={`test-msg ${r.status === 'TODO' ? 'todo' : ''}`}>{r.msg}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'submit' && (
        <div className="proj-submit">
          <div className="grid2">
            <div className="card">
              <h3><Ico e="📊" /> Your score</h3>
              <div className="score-ring" style={{ '--p': score }}><span>{score}</span><small>/100</small></div>
              <ul className="score-parts">
                {project.tests && <li><Ico e="✅" /> Tests: {pr.passed}/{pr.testsTotal || 0} passing (50 pts)</li>}
                <li><Ico e="🗂" /> Milestones: {pr.tasksDone}/{pr.tasks} ({project.tests ? 20 : 60} pts)</li>
                <li><Ico e="📝" /> Self-review below ({project.tests ? 30 : 40} pts)</li>
              </ul>
            </div>
            <div className="card">
              <h3><Ico e="📝" /> Self-review</h3>
              <p className="muted small">Be honest: this is how an interviewer will judge your code.</p>
              {project.rubric.slice(2).map(([c, pts], i) => (
                <label key={c} className="rubric-row">
                  <span>{c}</span>
                  <select value={st.rubric?.[i] ?? 0} onChange={(e) => { const v = Number(e.target.value); update((s) => ({ ...s, rubric: { ...(s.rubric || {}), [i]: v } })); }}>
                    {Array.from({ length: pts + 1 }, (_, n) => <option key={n} value={n}>{n}/{pts}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </div>
          <div className="card">
            <h3><Ico e="💬" /> Reflection (great for interviews)</h3>
            {[['learned', 'What did you learn while building this?'], ['challenge', 'What was the hardest problem and how did you solve it?'], ['next', 'What would you improve with more time?']].map(([k, q]) => (
              <label key={k} className="field">{q}
                <textarea className="input" rows={3} value={st.reflection?.[k] || ''} onChange={(e) => { const v = e.target.value; update((s) => ({ ...s, reflection: { ...(s.reflection || {}), [k]: v } })); }} />
              </label>
            ))}
            <label className="field">Your name (for the certificate)<input className="input" value={st.name || ''} onChange={(e) => { const v = e.target.value; update((s) => ({ ...s, name: v })); }} /></label>
            <div className="row-btns">
              <button className="btn primary" onClick={() => update((s) => ({ ...s, submission: { score, at: Date.now(), passed: pr.passed, total: pr.testsTotal } }))}>
                {st.submission ? '↻ Re-submit with new score' : <><Ico e="🏁" /> Submit project</>}
              </button>
              <button className="btn" onClick={downloadAll}><Ico e="⬇" /> Download code</button>
            </div>
          </div>

          {st.submission && (
            <div className="certificate" id="certificate">
              <div className="cert-inner">
                <div className="cert-brand">NGU</div><CertPhoto />
                <div className="cert-title">Certificate of Project Completion</div>
                <p>This certifies that</p>
                <div className="cert-name"><CertName fallback={st.name} /></div>
                <p>successfully built the project</p>
                <div className="cert-project">{custom ? (st.custom?.title || 'Own Project') : project.title}</div>
                <p>with a final score of <b>{st.submission.score}/100</b>{project.tests ? ` (${st.submission.passed}/${st.submission.total} automated tests passing)` : ''}</p>
                <div className="cert-foot"><span>{new Date(st.submission.at).toLocaleDateString()}</span><span>Developed by ER. Chetan D Morey</span></div>
              </div>
              <button className="btn small no-print" onClick={() => window.print()}><Ico e="🖨" /> Print / Save as PDF</button>
            </div>
          )}

          {project.solution && (
            <div className="card">
              <h3><Ico e="🔑" /> Reference solution</h3>
              {!st.submission ? <p className="muted">Unlocks after you submit. Try to solve it yourself first: that is what makes you interview-ready.</p>
                : !showSolution ? <button className="btn" onClick={() => setShowSolution(true)}>Show reference solution</button>
                  : Object.entries(project.solution).map(([n, code]) => (
                    <div key={n} className="code"><div className="code-head"><span>{n}</span></div><pre>{code}</pre></div>
                  ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
