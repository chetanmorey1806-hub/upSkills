import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Editor, { loader } from '@monaco-editor/react';
import { WEB_PROJECTS, WEB_CUSTOM_PROJECT, findWebProject } from '../data/webProjects.js';
import { runAllTests, previewDoc, standaloneDoc } from '../components/webProjectRunner.js';
import { useProjectState, readProject, projectProgress, projectScore } from '../projectStore.js';
import ProgressBar from '../components/ProgressBar.jsx';
import { Inline } from '../components/RichText.jsx';

const FILES = {
  web: [['html', 'index.html', 'html', '🟧'], ['css', 'style.css', 'css', '🟦'], ['js', 'script.js', 'javascript', '🟨']],
  react: [['jsx', 'App.jsx', 'javascript', '⚛️'], ['css', 'style.css', 'css', '🟦']],
};
const TABS = [['brief', '📋 Brief'], ['code', '💻 Code & Preview'], ['tests', '✅ Checks'], ['submit', '🏁 Submit']];
const ICON = { PASS: '✅', FAIL: '❌', RUN: '⏳' };

// projectStore treats id "custom" as the own-idea project (milestones written by the student).
const scoreView = (p) => (p.id === WEB_CUSTOM_PROJECT.id ? { ...p, id: 'custom' } : p);

function download(name, text, type = 'text/html') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------ list page ------------------------------ */
const STEPS = [
  ['📋', 'Read the brief', 'The story, the exact requirements and the milestones.'],
  ['💻', 'Build it here', 'HTML, CSS, JavaScript or React editor with live preview and console.'],
  ['✅', 'Run the checks', 'Automated checks click your buttons, fill your forms and tell you what to fix.'],
  ['🏁', 'Submit & certificate', 'Score = checks + milestones + self-review. Download your site and certificate.'],
];

export function WebProjectList() {
  const all = [...WEB_PROJECTS, WEB_CUSTOM_PROJECT];
  return (
    <div>
      <div className="page-head">
        <h1>🌐 Web Development Final Projects</h1>
        <p className="muted">Build real websites and apps inside UpSkillr: a code editor with live preview, automated checks that test your page like a real user, milestones, a score and a certificate for your portfolio.</p>
      </div>
      <div className="steps proj-steps">
        {STEPS.map(([ic, h, p]) => (
          <div key={h} className="card step"><div className="track-icon">{ic}</div><h4>{h}</h4><p className="muted small">{p}</p></div>
        ))}
      </div>
      <h2 className="section-title">Choose your project</h2>
      <div className="grid3">
        {all.map((p) => {
          const st = readProject(p.id);
          const pr = projectProgress(scoreView(p), st);
          const started = pr.tasksDone > 0 || pr.testsTotal > 0 || !!st.files;
          const pct = p.tests ? (pr.testsTotal ? pr.passed / pr.testsTotal : 0) : (pr.tasks ? pr.tasksDone / pr.tasks : 0);
          return (
            <Link key={p.id} to={`/tools/web-projects/${p.id}`} className="card track-card proj-card">
              <div className="proj-card-top">
                <span className="track-icon">{p.icon}</span>
                {pr.submitted ? <span className="badge ok">✓ Submitted · {projectScore(scoreView(p), st)}/100</span> : started ? <span className="badge">In progress</span> : null}
              </div>
              <h3>{p.title}</h3>
              <p className="muted small">{p.summary}</p>
              <div className="meta">
                <span className={`lvl lvl-${p.level}`}>{p.level}</span>
                <span>⏱ {p.hours}</span>
                <span>🧩 {p.track}</span>
                {p.tests && <span>✅ {p.tests.length} checks</span>}
              </div>
              <div className="chips">{p.skills.slice(0, 4).map((s) => <span key={s} className="tag">{s}</span>)}</div>
              <ProgressBar value={pct} />
              <div className="muted small">{p.tests ? (pr.testsTotal ? `${pr.passed}/${pr.testsTotal} checks passing` : 'Not started') : `${pr.tasksDone}/${pr.tasks} milestones done`}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ workspace ------------------------------ */
export function WebProjectWorkspace() {
  const { id } = useParams();
  const project = findWebProject(id);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'brief';
  const setTab = (k) => setParams({ tab: k }, { replace: true });
  const [st, update] = useProjectState(id);
  const [active, setActive] = useState(null);
  const [fallback, setFallback] = useState(false);
  const [doc, setDoc] = useState('');
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(null); // index of test running
  const [live, setLive] = useState([]);
  const [showSolution, setShowSolution] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => { loader.init().catch(() => setFallback(true)); }, []);
  const files = useMemo(() => st.files || project?.starter || {}, [st.files, project]);

  // live preview (debounced)
  useEffect(() => {
    if (!project) return undefined;
    const t = setTimeout(() => { setLogs([]); setDoc(previewDoc(project, files)); }, 500);
    return () => clearTimeout(t);
  }, [files, project]);
  useEffect(() => {
    const h = (e) => {
      if (!e.data || !e.data.__pg) return;
      if (frameRef.current && e.source !== frameRef.current.contentWindow) return;
      setLogs((l) => [...l.slice(-199), { level: e.data.level, text: e.data.text }]);
    };
    window.addEventListener('message', h);
    return () => window.removeEventListener('message', h);
  }, []);

  if (!project) return <p>Project not found. <Link to="/tools/web-projects">All web projects</Link></p>;
  const custom = project.id === WEB_CUSTOM_PROJECT.id;
  const sv = scoreView(project);
  const pr = projectProgress(sv, st);
  const score = projectScore(sv, st);
  const fileDefs = FILES[project.mode] || FILES.web;
  const cur = fileDefs.find((f) => f[0] === active) || fileDefs[0];
  const tasks = custom ? (st.custom?.tasks || []).map((t, i) => ({ key: `c-${i}`, text: t })) : null;
  const results = running != null ? live : st.tests?.results || [];
  const title = custom ? (st.custom?.title || 'My website') : project.title;

  const setFile = (k, v) => update((s) => ({ ...s, files: { ...(s.files || project.starter), [k]: v } }));
  const toggleTask = (k) => update((s) => ({ ...s, done: { ...(s.done || {}), [k]: !(s.done || {})[k] } }));
  const resetCode = () => { if (window.confirm('Reset all files to the starter code? Your code will be lost.')) update((s) => ({ ...s, files: project.starter })); };
  const refresh = () => { setLogs([]); setDoc(`${previewDoc(project, files)}<!-- ${Date.now()} -->`); };
  const downloadSite = () => download(`${project.id.replace(/^web-/, '')}.html`, standaloneDoc(project, files));

  const runChecks = async () => {
    if (!project.tests || running != null) return;
    setTab('tests');
    const blank = project.tests.map((t) => ({ name: t.name, status: 'RUN', msg: '' }));
    setLive(blank);
    setRunning(0);
    const out = await runAllTests(project, files, (i, row) => { setRunning(i + 1); setLive((l) => l.map((x, j) => (j === i ? row : x))); });
    update((s) => ({ ...s, tests: { results: out, at: Date.now() }, runs: (s.runs || 0) + 1 }));
    setRunning(null);
  };

  return (
    <div className="project">
      <div className="crumbs"><Link to="/tools/web-projects">Web Projects</Link> › {title}</div>
      <div className="page-head">
        <h1>{project.icon} {title}</h1>
        <p className="muted">{project.summary}</p>
        <div className="meta">
          <span className={`lvl lvl-${project.level}`}>{project.level}</span>
          <span>⏱ {project.hours}</span>
          <span>🧩 {project.track}</span>
          {project.tests && <span>✅ {pr.passed}/{pr.testsTotal || project.tests.length} checks passing</span>}
          <span>🗂 {pr.tasksDone}/{pr.tasks} milestone tasks</span>
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
              <h3>Describe your website</h3>
              <label className="field">Project title<input className="input" value={st.custom?.title || ''} placeholder="e.g. Restaurant Website" onChange={(e) => { const v = e.target.value; update((s) => ({ ...s, custom: { ...(s.custom || {}), title: v } })); }} /></label>
              <label className="field">What does it do? Who will use it?<textarea className="input" rows={4} value={st.custom?.desc || ''} placeholder="Pages, users, main features…" onChange={(e) => { const v = e.target.value; update((s) => ({ ...s, custom: { ...(s.custom || {}), desc: v } })); }} /></label>
              <h4>Your milestones</h4>
              <p className="muted small">One task per line. Tick them off as you build.</p>
              <textarea className="input" rows={6} value={(st.custom?.tasks || []).join('\n')} placeholder={'Home page layout\nMenu section with cards\nContact form with validation\nResponsive design\nPublish on GitHub Pages'}
                onChange={(e) => { const v = e.target.value; update((s) => ({ ...s, custom: { ...(s.custom || {}), tasks: v.split('\n') } })); }} />
            </div>
          ) : (
            <>
              <div className="card story"><h3>📖 The story</h3><p>{project.story}</p></div>
              <div className="grid2">
                <div className="card"><h3>🎯 Requirements (what the checks look for)</h3><ul>{project.requirements.map((r, i) => <li key={i}><Inline text={r} /></li>)}</ul></div>
                <div className="card">
                  <h3>🧠 Skills you will use</h3>
                  <div className="chips">{project.skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
                  <h4>How the checks work</h4>
                  <p className="muted small">Each check opens a fresh copy of your page, clicks buttons, types into inputs and reads the result, exactly like a user would. Keep the ids and class names from the requirements so the checks can find your elements.</p>
                </div>
              </div>
            </>
          )}

          <div className="card">
            <h3>🗂 Milestones</h3>
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
          {project.hints?.length > 0 && <details className="card"><summary><b>💡 Hints</b></summary><ul>{project.hints.map((h, i) => <li key={i}><Inline text={h} /></li>)}</ul></details>}
          <div className="center"><button className="btn primary" onClick={() => setTab('code')}>Start building →</button></div>
        </div>
      )}

      {tab === 'code' && (
        <div className="pg wp-ide">
          <div className="pg-top">
            <div className="pg-title"><span className="pg-logo">{project.icon}</span><b>{title}</b><span className="pg-sub">{project.mode === 'react' ? 'React 18 · saved automatically' : 'HTML · CSS · JS · saved automatically'}</span></div>
            <div className="pg-actions">
              {project.tests && <button className="btn small primary" onClick={runChecks} disabled={running != null}>✅ Run checks</button>}
              <button className="btn small" onClick={refresh}>⟳ Refresh preview</button>
              <button className="btn small" onClick={downloadSite}>⬇ Download site</button>
              <button className="btn small" onClick={resetCode}>↺ Reset</button>
            </div>
          </div>
          <div className="wp-body">
            <div className="wp-editor">
              <div className="pg-tabs">
                {fileDefs.map(([k, name, , ic]) => <button key={k} className={`pg-tab ${k === cur[0] ? 'on' : ''}`} onClick={() => setActive(k)}>{ic} {name}</button>)}
              </div>
              <div className="wp-monaco">
                {fallback ? (
                  <textarea className="pg-fallback" spellCheck={false} value={files[cur[0]] || ''} onChange={(e) => setFile(cur[0], e.target.value)} />
                ) : (
                  <Editor key={cur[0]} language={cur[2]} path={`${id}/${cur[1]}`} theme="vs-dark" value={files[cur[0]] || ''}
                    onChange={(v) => setFile(cur[0], v ?? '')}
                    loading={<div className="pg-loading">Loading editor…</div>}
                    options={{ fontSize: 14, minimap: { enabled: false }, tabSize: 2, automaticLayout: true, scrollBeyondLastLine: false, wordWrap: 'on' }} />
                )}
              </div>
            </div>
            <div className="wp-right">
              <div className="pg-preview-head">🌐 Live preview</div>
              <iframe ref={frameRef} title="Preview" className="wp-frame" sandbox="allow-scripts allow-forms allow-modals" srcDoc={doc} />
              <div className="pg-preview-head">🖥 Console {logs.length > 0 && <button className="link-btn" onClick={() => setLogs([])}>clear</button>}</div>
              <div className="wp-console">
                {logs.length ? logs.map((l, i) => <div key={i} className={`pg-log ${l.level}`}>{l.text}</div>) : <div className="pg-muted">console.log output and errors appear here.</div>}
              </div>
            </div>
          </div>
          <p className="muted small wp-note">The preview runs in a safe sandbox: localStorage works but resets when the preview refreshes. Use ⬇ Download site to get one HTML file you can open or publish.</p>
        </div>
      )}

      {tab === 'tests' && project.tests && (
        <div>
          <div className="toolbar">
            <h3>Automated checks</h3>
            <button className="btn primary" onClick={runChecks} disabled={running != null}>{running != null ? `⏳ Running ${Math.min(running + 1, project.tests.length)}/${project.tests.length}…` : '▶ Run all checks'}</button>
          </div>
          {running == null && results.length > 0 && (
            <div className="card test-summary">
              <b>{pr.passed}/{pr.testsTotal} checks passing</b>
              <ProgressBar value={pr.testsTotal ? pr.passed / pr.testsTotal : 0} color={pr.passed === pr.testsTotal ? 'var(--ok)' : undefined} />
              <span className="muted small">Last run {new Date(st.tests.at).toLocaleString()} · {st.runs || 0} runs so far</span>
              {pr.passed === pr.testsTotal && <p className="result">🎉 All checks pass! Tick your milestones and go to <b>Submit</b>.</p>}
            </div>
          )}
          {results.length === 0 && <p className="muted">Click <b>Run all checks</b>. Each check opens your page in a hidden browser frame and uses it like a real user. Fix the first failing check, then run again.</p>}
          <div className="test-list">
            {(results.length ? results : project.tests.map((t) => ({ name: t.name, status: '', msg: '' }))).map((r, i) => (
              <div key={r.name} className={`card test-row t-${r.status || 'TODO'}`}>
                <span className="test-ic">{ICON[r.status] || '◻️'}</span>
                <div>
                  <b>{i + 1}. {r.name}</b>
                  {r.msg && <div className="test-msg">{r.msg}</div>}
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
              <h3>📊 Your score</h3>
              <div className="score-ring" style={{ '--p': score }}><span>{score}</span><small>/100</small></div>
              <ul className="score-parts">
                {project.tests && <li>✅ Checks: {pr.passed}/{pr.testsTotal || 0} passing (50 pts)</li>}
                <li>🗂 Milestones: {pr.tasksDone}/{pr.tasks} ({project.tests ? 20 : 60} pts)</li>
                <li>📝 Self-review below ({project.tests ? 30 : 40} pts)</li>
              </ul>
              {project.tests && !pr.testsTotal && <p className="muted small">Run the checks first so they count towards your score.</p>}
            </div>
            <div className="card">
              <h3>📝 Self-review</h3>
              <p className="muted small">Be honest: this is how an interviewer will judge your work.</p>
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
            <h3>🔗 Links &amp; reflection</h3>
            <label className="field">GitHub repository URL<input className="input" placeholder="https://github.com/you/project" value={st.links?.github || ''} onChange={(e) => { const v = e.target.value; update((s) => ({ ...s, links: { ...(s.links || {}), github: v } })); }} /></label>
            <label className="field">Live site URL (GitHub Pages / Netlify / Vercel)<input className="input" placeholder="https://you.github.io/project" value={st.links?.live || ''} onChange={(e) => { const v = e.target.value; update((s) => ({ ...s, links: { ...(s.links || {}), live: v } })); }} /></label>
            {[['learned', 'What did you learn while building this?'], ['challenge', 'What was the hardest problem and how did you solve it?']].map(([k, q]) => (
              <label key={k} className="field">{q}
                <textarea className="input" rows={3} value={st.reflection?.[k] || ''} onChange={(e) => { const v = e.target.value; update((s) => ({ ...s, reflection: { ...(s.reflection || {}), [k]: v } })); }} />
              </label>
            ))}
            <label className="field">Your name (for the certificate)<input className="input" value={st.name || ''} onChange={(e) => { const v = e.target.value; update((s) => ({ ...s, name: v })); }} /></label>
            <div className="row-btns">
              <button className="btn primary" onClick={() => update((s) => ({ ...s, submission: { score, at: Date.now(), passed: pr.passed, total: pr.testsTotal } }))}>
                {st.submission ? '↻ Re-submit with new score' : '🏁 Submit project'}
              </button>
              <button className="btn" onClick={downloadSite}>⬇ Download site</button>
            </div>
          </div>

          {st.submission && (
            <div className="certificate" id="certificate">
              <div className="cert-inner">
                <div className="cert-brand">UpSkillr</div>
                <div className="cert-title">Certificate of Project Completion</div>
                <p>This certifies that</p>
                <div className="cert-name">{st.name || 'Student'}</div>
                <p>successfully built the web project</p>
                <div className="cert-project">{title}</div>
                <p>with a final score of <b>{st.submission.score}/100</b>{project.tests ? ` (${st.submission.passed}/${st.submission.total} automated checks passing)` : ''}</p>
                <div className="cert-foot"><span>{new Date(st.submission.at).toLocaleDateString()}</span><span>Developed by ER. Chetan D Morey</span></div>
              </div>
              <button className="btn small no-print" onClick={() => window.print()}>🖨 Print / Save as PDF</button>
            </div>
          )}

          {project.solution && (
            <div className="card">
              <h3>🔑 Reference solution</h3>
              {!st.submission ? <p className="muted">Unlocks after you submit. Build it yourself first: that is what makes you interview-ready.</p>
                : !showSolution ? <button className="btn" onClick={() => setShowSolution(true)}>Show reference solution</button>
                  : (FILES[project.mode] || FILES.web).map(([k, name]) => project.solution[k] ? (
                    <div key={k} className="code"><div className="code-head"><span>{name}</span></div><pre>{project.solution[k]}</pre></div>
                  ) : null)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
