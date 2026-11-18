import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Editor, { loader } from '@monaco-editor/react';
import { MERN_PROJECTS, findMernProject } from '../data/mernProjects.js';
import { runApiTests, createBrowserExec } from '../engine/apiTests.js';
import { useProjectState, readProject, projectProgress, projectScore } from '../projectStore.js';
import { API_LOAD_KEY } from './ApiLab.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { Inline } from '../components/RichText.jsx';

const sid = (id) => `mern-${id}`;
const ICON = { PASS: '✅', FAIL: '❌', ERROR: '💥', TODO: '⏳' };
const TABS = [['brief', '📋 Brief'], ['code', '💻 Backend code'], ['tests', '✅ API tests'], ['fullstack', '🧱 Full stack'], ['submit', '🏁 Submit']];

function ProjectList() {
  return (
    <div>
      <div className="page-head">
        <h1>🚀 MERN Final Projects</h1>
        <p className="muted">Build real MERN projects: write the Express API here and run automated API tests in your browser, then complete the React frontend, MongoDB and deployment milestones in VS Code. Get a score, viva questions and a certificate for your portfolio.</p>
      </div>
      <div className="steps proj-steps">
        {[['🧩', 'Backend in the browser', 'Starter Express code with TODOs. Run 8 automated API tests that send real requests.'], ['⚛️', 'React frontend', 'Build the UI with Vite + React, connect it with axios / TanStack Query.'], ['🍃', 'MongoDB', 'Replace the in-memory arrays with Mongoose models. Guides included.'], ['🌍', 'Deploy & present', 'Deploy, add GitHub + live links, answer viva questions and get your score.']].map(([ic, h, p]) => (
          <div key={h} className="card step"><div className="track-icon">{ic}</div><h4>{h}</h4><p className="muted small">{p}</p></div>
        ))}
      </div>
      <h2 className="section-title">Choose your project</h2>
      <div className="grid3">
        {MERN_PROJECTS.map((p) => {
          const st = readProject(sid(p.id));
          const pr = projectProgress(p, st);
          return (
            <Link key={p.id} to={`/tools/mern-projects/${p.id}`} className="card track-card proj-card">
              <div className="proj-card-top"><span className="track-icon">{p.icon}</span>{st.submission ? <span className="badge ok">✓ Submitted · {projectScore(p, st)}/100</span> : pr.testsTotal ? <span className="badge">In progress</span> : null}</div>
              <h3>{p.title}</h3>
              <p className="muted small">{p.summary}</p>
              <div className="meta"><span className={`lvl lvl-${p.level}`}>{p.level}</span><span>⏱ {p.hours}</span><span>✅ {p.tests.length} API tests</span></div>
              <div className="chips">{p.skills.slice(0, 4).map((s) => <span key={s} className="tag">{s}</span>)}</div>
              <ProgressBar value={pr.testsTotal ? pr.passed / pr.testsTotal : 0} />
              <div className="muted small">{pr.testsTotal ? `${pr.passed}/${pr.testsTotal} tests passing · ${pr.tasksDone}/${pr.tasks} milestones` : 'Not started'}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Workspace({ project }) {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'brief';
  const setTab = (k) => setParams({ tab: k }, { replace: true });
  const [st, update] = useProjectState(sid(project.id));
  const [running, setRunning] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [showSol, setShowSol] = useState(false);
  const execRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => { loader.init().catch(() => setFallback(true)); return () => execRef.current?.close(); }, []);

  const code = st.code ?? project.starter;
  const setCode = (v) => update((s) => ({ ...s, code: v }));
  const pr = projectProgress(project, st);
  const score = projectScore(project, st);
  const results = st.tests?.results || [];

  const runTests = async () => {
    setTab('tests'); setRunning(true);
    if (!execRef.current) execRef.current = createBrowserExec();
    const res = await runApiTests(code, project.tests, execRef.current);
    update((s) => ({ ...s, tests: { results: res.map((r) => ({ ...r, doc: r.name })), at: Date.now() }, runs: (s.runs || 0) + 1 }));
    setRunning(false);
  };
  const openLab = () => {
    const requests = project.tests.flatMap((t) => t.steps).filter((s, i, a) => a.findIndex((x) => x.method === s.method && x.url === s.url) === i).slice(0, 12)
      .map(({ method, url, body, headers }) => ({ method, url, ...(body !== undefined ? { body } : {}), ...(headers ? { headers } : {}) }));
    try { sessionStorage.setItem(API_LOAD_KEY, JSON.stringify({ code, requests, title: project.title, expected: '' })); } catch { /* ignore */ }
    navigate('/tools/api-lab');
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    const a = document.createElement('a'); a.href = url; a.download = 'server.js'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const toggle = (k) => update((s) => ({ ...s, done: { ...(s.done || {}), [k]: !(s.done || {})[k] } }));

  return (
    <div className="project">
      <div className="crumbs"><Link to="/tools/mern-projects">MERN Projects</Link> › {project.title}</div>
      <div className="page-head">
        <h1>{project.icon} {project.title}</h1>
        <p className="muted">{project.summary}</p>
        <div className="meta">
          <span className={`lvl lvl-${project.level}`}>{project.level}</span><span>⏱ {project.hours}</span>
          <span>✅ {pr.passed}/{pr.testsTotal || project.tests.length} API tests</span><span>🗂 {pr.tasksDone}/{pr.tasks} milestone tasks</span>
          {st.submission && <span className="badge ok">✓ Submitted · {st.submission.score}/100</span>}
        </div>
      </div>
      <div className="tabs">{TABS.map(([k, l]) => <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>)}</div>

      {tab === 'brief' && (
        <div>
          <div className="card story"><h3>📖 The story</h3><p>{project.story}</p></div>
          <div className="card">
            <h3>🔌 API you will build</h3>
            <div className="table-wrap"><table className="data-table api-spec"><thead><tr><th>Method</th><th>Endpoint</th><th>Behaviour</th></tr></thead>
              <tbody>{project.api.map(([m, u, d]) => <tr key={m + u}><td><span className={`http-m m-${m}`}>{m}</span></td><td className="mono">{u}</td><td style={{ whiteSpace: 'normal' }}>{d}</td></tr>)}</tbody></table></div>
          </div>
          <div className="card"><h3>🧠 Skills</h3><div className="chips">{project.skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
            <h4>Revise first</h4><p className="small"><Link to="/track/node">Node.js + Express</Link> · <Link to="/track/mongodb">MongoDB & Mongoose</Link> · <Link to="/track/mern">MERN Full Stack</Link> · <Link to="/track/react">React</Link></p></div>
          <details className="card"><summary><b>💡 Hints</b></summary><ul>{project.hints.map((h, i) => <li key={i}><Inline text={h} /></li>)}</ul></details>
          <div className="center"><button className="btn primary" onClick={() => setTab('code')}>Start coding →</button></div>
        </div>
      )}

      {tab === 'code' && (
        <div className="jide proj-ide">
          <div className="jide-top">
            <div className="jide-title"><span className="jide-logo node">🟩</span><b>server.js</b><span className="jide-sub">Express 5 · saved automatically</span></div>
            <div className="jide-actions">
              <button className="btn small primary" onClick={runTests} disabled={running}>{running ? '⏳ Testing…' : '✅ Run API tests'}</button>
              <button className="btn small" onClick={openLab}>🔌 Try requests in API Lab</button>
              <button className="btn small" onClick={download}>⬇ server.js</button>
              <button className="btn small" onClick={() => window.confirm('Reset to the starter code? Your code will be lost.') && setCode(project.starter)}>↺ Reset</button>
            </div>
          </div>
          <div className="proj-editor tall">
            {fallback ? <textarea className="pg-fallback" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} />
              : <Editor language="javascript" path={`mern/${project.id}/server.js`} theme="vs-dark" value={code} onChange={(v) => setCode(v ?? '')}
                loading={<div className="pg-loading">Loading editor…</div>} options={{ fontSize: 14, minimap: { enabled: false }, tabSize: 2, automaticLayout: true, scrollBeyondLastLine: false, wordWrap: 'on' }} />}
          </div>
        </div>
      )}

      {tab === 'tests' && (
        <div>
          <div className="toolbar"><h3>Automated API tests</h3><button className="btn primary" onClick={runTests} disabled={running}>{running ? '⏳ Running…' : '▶ Run all tests'}</button></div>
          {results.length > 0 ? (
            <div className="card test-summary">
              <b>{pr.passed}/{pr.testsTotal} tests passing</b>
              <ProgressBar value={pr.passed / pr.testsTotal} color={pr.passed === pr.testsTotal ? 'var(--ok)' : undefined} />
              <span className="muted small">Last run {new Date(st.tests.at).toLocaleString()} · {st.runs || 0} runs</span>
              {pr.passed === pr.testsTotal && <p className="result">🎉 Your API passes every test! Now build the frontend and database in the <b>Full stack</b> tab.</p>}
            </div>
          ) : <p className="muted">Each test starts a fresh server from your code and sends real HTTP requests (status codes, JSON bodies, headers are checked).</p>}
          <div className="test-list">{results.map((r) => (
            <div key={r.name} className={`card test-row t-${r.status}`}><span className="test-ic">{ICON[r.status]}</span><div><b>{r.name}</b>{r.msg && <div className={`test-msg ${r.status === 'TODO' ? 'todo' : ''}`}>{r.msg}</div>}</div></div>
          ))}</div>
          {results.length === 0 && (
            <div className="card"><h4>What is tested</h4><ol>{project.tests.map((t) => <li key={t.name}>{t.name}</li>)}</ol></div>
          )}
        </div>
      )}

      {tab === 'fullstack' && (
        <div>
          <div className="card"><h3>🗂 Milestones</h3><ProgressBar value={pr.tasks ? pr.tasksDone / pr.tasks : 0} />
            {project.milestones.map((m, mi) => (
              <div key={mi} className="milestone"><h4>Step {mi + 1}: {m.title}</h4>
                <ul className="task-list">{m.tasks.map((t, ti) => <li key={ti}><label className="check"><input type="checkbox" checked={!!st.done?.[`${mi}-${ti}`]} onChange={() => toggle(`${mi}-${ti}`)} /> {t}</label></li>)}</ul></div>
            ))}
          </div>
          <div className="card"><h3>🍃 MongoDB / Mongoose guide</h3><div className="code"><div className="code-head"><span>javascript</span></div><pre>{project.mongoose}</pre></div></div>
          <div className="card"><h3>📁 Recommended folder structure</h3><pre className="tree-pre">{`my-${project.id}/
├── client/                 # React (Vite)
│   ├── src/api/client.js   # axios instance + interceptors
│   ├── src/pages/ …        # one page per screen
│   └── .env                # VITE_API_URL=http://localhost:5000
└── server/                 # Express + Mongoose
    ├── src/models/ …       # Mongoose schemas
    ├── src/routes/ …       # express.Router per resource
    ├── src/controllers/ …  # request handlers
    ├── src/middleware/ …   # auth, errors, validation
    ├── src/app.js
    └── .env                # MONGO_URI, JWT_SECRET, PORT`}</pre></div>
        </div>
      )}

      {tab === 'submit' && (
        <div className="proj-submit">
          <div className="grid2">
            <div className="card"><h3>📊 Your score</h3><div className="score-ring" style={{ '--p': score }}><span>{score}</span><small>/100</small></div>
              <ul className="score-parts"><li>✅ API tests: {pr.passed}/{pr.testsTotal || project.tests.length} (50 pts)</li><li>🗂 Milestones: {pr.tasksDone}/{pr.tasks} (20 pts)</li><li>📝 Self-review (30 pts)</li></ul></div>
            <div className="card"><h3>📝 Self-review</h3>
              {project.rubric.slice(2).map(([c, pts], i) => (
                <label key={c} className="rubric-row"><span>{c}</span>
                  <select value={st.rubric?.[i] ?? 0} onChange={(e) => { const v = Number(e.target.value); update((s) => ({ ...s, rubric: { ...(s.rubric || {}), [i]: v } })); }}>{Array.from({ length: pts + 1 }, (_, n) => <option key={n} value={n}>{n}/{pts}</option>)}</select>
                </label>
              ))}</div>
          </div>
          <div className="card"><h3>🎤 Viva questions (practise answering aloud)</h3><ol>{project.viva.map((q) => <li key={q}>{q}</li>)}</ol>
            <p className="muted small">Practise more in the <Link to="/tools/test-series?course=grp:mern">MERN Test Series</Link> mock interviews.</p></div>
          <div className="card">
            <h3>🔗 Links</h3>
            {[['github', 'GitHub repository URL'], ['live', 'Live demo URL'], ['name', 'Your name (for the certificate)']].map(([k, l]) => (
              <label key={k} className="field">{l}<input className="input" value={st[k] || ''} onChange={(e) => { const v = e.target.value; update((s) => ({ ...s, [k]: v })); }} /></label>
            ))}
            <div className="row-btns">
              <button className="btn primary" onClick={() => update((s) => ({ ...s, submission: { score, at: Date.now(), passed: pr.passed, total: pr.testsTotal } }))}>{st.submission ? '↻ Re-submit with new score' : '🏁 Submit project'}</button>
              <button className="btn" onClick={download}>⬇ Download server.js</button>
            </div>
          </div>
          {st.submission && (
            <div className="certificate" id="certificate"><div className="cert-inner">
              <div className="cert-brand">UpSkillr</div><div className="cert-title">Certificate of Project Completion</div>
              <p>This certifies that</p><div className="cert-name">{st.name || 'Student'}</div><p>built the MERN project</p>
              <div className="cert-project">{project.title}</div>
              <p>with a final score of <b>{st.submission.score}/100</b> ({st.submission.passed}/{st.submission.total} automated API tests passing)</p>
              {(st.github || st.live) && <p className="small">{st.github}{st.github && st.live ? ' · ' : ''}{st.live}</p>}
              <div className="cert-foot"><span>{new Date(st.submission.at).toLocaleDateString()}</span><span>Developed by ER. Chetan D Morey</span></div>
            </div><button className="btn small no-print" onClick={() => window.print()}>🖨 Print / Save as PDF</button></div>
          )}
          <div className="card"><h3>🔑 Reference solution (backend)</h3>
            {!st.submission ? <p className="muted">Unlocks after you submit.</p> : !showSol ? <button className="btn" onClick={() => setShowSol(true)}>Show reference solution</button>
              : <div className="code"><div className="code-head"><span>server.js</span></div><pre>{project.solution}</pre></div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MernProjects() {
  const { id } = useParams();
  if (!id) return <ProjectList />;
  const p = findMernProject(id);
  if (!p) return <p>Project not found. <Link to="/tools/mern-projects">All MERN projects</Link></p>;
  return <Workspace key={p.id} project={p} />;
}
