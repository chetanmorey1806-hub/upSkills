import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Code2, Download, CheckSquare, LayoutList, Boxes, Send, MessageCircleQuestion, Lightbulb } from 'lucide-react';
import { javaProjects } from '../data/javaCareer.js';
import RichText, { Inline } from '../components/RichText.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { useLocalState, downloadFile, esc } from '../components/careerUtils.js';
import { JAVA_LOAD_KEY } from './JavaIDE.jsx';

import Ico from '../components/Ico.jsx';
const STORE = 'xlpbi-java-projects-v1';
const taskCount = (p) => p.milestones.reduce((s, m) => s + m.tasks.length, 0);
const doneCount = (p, st) => Object.keys(st?.tasks || {}).filter((k) => st.tasks[k]).length;

function report(p, st) {
  const sub = st.sub || {};
  const rub = st.rubric || {};
  const total = p.rubric.reduce((s, r, i) => s + (Number(rub[i]) || 0), 0);
  const ms = p.milestones.map((m, mi) => `<h3>${esc(m.title)}</h3><ul>${m.tasks.map((t, ti) => `<li>${st.tasks?.[`${mi}-${ti}`] ? '✅' : '⬜'} ${esc(t)}</li>`).join('')}</ul>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(p.title)} – Project Report</title>
<style>body{font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:850px;margin:2rem auto;padding:0 16px;line-height:1.55;color:#1d2433}h1{margin-bottom:.2rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccd;padding:.4rem .6rem;text-align:left}th{background:#f0f2f7}pre{background:#0f172a;color:#e2e8f0;padding:1rem;border-radius:8px;overflow:auto;font-size:.85rem}.muted{color:#5d6679}</style></head><body>
<h1>${esc(p.title)}</h1>
<p class="muted">Final project report · ${esc(sub.name || 'Student')}${sub.batch ? ` · ${esc(sub.batch)}` : ''} · ${new Date().toLocaleDateString()}</p>
<h2>1. Abstract</h2><p>${esc(sub.abstract || p.summary)}</p>
<h2>2. Technology stack</h2><p>${p.stack.map(esc).join(', ')}</p>
<h2>3. Features</h2><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
<h2>4. Architecture</h2><pre>${esc(p.architecture)}</pre>
${p.folderStructure ? `<h3>Folder structure</h3><pre>${esc(p.folderStructure)}</pre>` : ''}
${p.database ? `<h2>5. Database design</h2><pre>${esc(p.database)}</pre>` : ''}
${p.apis?.length ? `<h2>6. API endpoints</h2><table><tr><th>Method</th><th>Path</th><th>Description</th></tr>${p.apis.map((a) => `<tr><td>${esc(a.method)}</td><td>${esc(a.path)}</td><td>${esc(a.desc)}</td></tr>`).join('')}</table>` : ''}
<h2>7. Implementation progress (${doneCount(p, st)}/${taskCount(p)} tasks)</h2>${ms}
<h2>8. Self-evaluation</h2><table><tr><th>Criterion</th><th>Max</th><th>Self score</th></tr>${p.rubric.map((r, i) => `<tr><td>${esc(r.criterion)}</td><td>${r.points}</td><td>${esc(rub[i] ?? '')}</td></tr>`).join('')}<tr><th>Total</th><th>100</th><th>${total}</th></tr></table>
<h2>9. Links</h2><ul><li>GitHub: ${sub.github ? `<a href="${esc(sub.github)}">${esc(sub.github)}</a>` : '—'}</li><li>Live demo / video: ${sub.demo ? `<a href="${esc(sub.demo)}">${esc(sub.demo)}</a>` : '—'}</li></ul>
${sub.challenges ? `<h2>10. Challenges & learnings</h2><p>${esc(sub.challenges).replace(/\n/g, '<br>')}</p>` : ''}
${sub.future ? `<h2>11. Future scope</h2><p>${esc(sub.future).replace(/\n/g, '<br>')}</p>` : ''}
</body></html>`;
}

function ProjectDetail({ p, st, setSt }) {
  const nav = useNavigate();
  const [tab, setTab] = useState('overview');
  const tasks = st.tasks || {};
  const sub = st.sub || {};
  const rub = st.rubric || {};
  const total = taskCount(p);
  const done = doneCount(p, st);
  const toggle = (k) => setSt({ ...st, tasks: { ...tasks, [k]: !tasks[k] } });
  const setSub = (k, v) => setSt({ ...st, sub: { ...sub, [k]: v } });
  const openIDE = (files, expected, title) => {
    try { sessionStorage.setItem(JAVA_LOAD_KEY, JSON.stringify({ files, expected, title, stdin: p.starter?.stdin || '' })); } catch { /* ignore */ }
    nav('/tools/java-ide');
  };
  const rubTotal = p.rubric.reduce((s, r, i) => s + (Number(rub[i]) || 0), 0);
  const TABS = [['overview', LayoutList, 'Overview'], ['milestones', CheckSquare, `Milestones (${done}/${total})`], ['design', Boxes, 'Design'], ['code', Code2, 'Code'], ['viva', MessageCircleQuestion, 'Viva Q&A'], ['submit', Send, 'Submit & Report']];

  return (
    <div>
      <Link to="/tools/java-projects" className="btn">← All projects</Link>
      <div className="page-head" style={{ marginTop: '1rem' }}>
        <h1>{p.title}</h1>
        <div className="meta"><span className={`lvl lvl-${p.level}`}>{p.level}</span><span><Ico e="⏱" /> {p.duration}</span><span><Ico e="🎓" /> Caps: {p.track}</span></div>
        <p className="muted">{p.summary}</p>
        <ProgressBar value={total ? done / total : 0} />
        <div className="muted small">{done} of {total} tasks done</div>
      </div>
      <div className="tabs">{TABS.map(([k, I, l]) => <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}><I size={15} /> {l}</button>)}</div>

      {tab === 'overview' && (
        <div className="grid2">
          <div className="card"><h3>Features to build</h3><ul>{p.features.map((f, i) => <li key={i}><Inline text={f} /></li>)}</ul></div>
          <div className="card"><h3>Tech stack</h3><div className="chips">{p.stack.map((s) => <span key={s} className="jc-kw">{s}</span>)}</div>
            {p.roles?.length > 0 && <><h3>User roles</h3><ul>{p.roles.map((r, i) => <li key={i}><Inline text={r} /></li>)}</ul></>}
            {p.extensions?.length > 0 && <><h3><Lightbulb size={16} /> Bonus features</h3><ul>{p.extensions.map((r, i) => <li key={i}><Inline text={r} /></li>)}</ul></>}
          </div>
          <div className="card"><h3>How to work on it</h3><ol>
            <li>Read the features and the design tab.</li>
            <li>Start from the starter code in the Java IDE, then build the full project in IntelliJ / Eclipse.</li>
            <li>Tick each milestone task as you finish it; push code to GitHub daily.</li>
            <li>Prepare the viva questions; practise explaining your project in 2 minutes.</li>
            <li>Fill the Submit tab and download your project report.</li>
          </ol></div>
        </div>
      )}

      {tab === 'milestones' && p.milestones.map((m, mi) => {
        const md = m.tasks.filter((_, ti) => tasks[`${mi}-${ti}`]).length;
        return (
          <div key={mi} className="card">
            <div className="module-head"><h3>{m.title}</h3><span className="muted small">{md}/{m.tasks.length}</span></div>
            {m.tasks.map((t, ti) => (
              <label key={ti} className="check jc-task"><input type="checkbox" checked={!!tasks[`${mi}-${ti}`]} onChange={() => toggle(`${mi}-${ti}`)} /> <span className={tasks[`${mi}-${ti}`] ? 'jc-done' : ''}><Inline text={t} /></span></label>
            ))}
          </div>
        );
      })}

      {tab === 'design' && (
        <>
          <div className="card"><h3>Architecture</h3><RichText text={p.architecture} /></div>
          {p.folderStructure && <CodeBlock code={p.folderStructure} label="Folder structure" />}
          {p.database && <CodeBlock code={p.database} label="Database schema (MySQL)" />}
          {p.apis?.length > 0 && (
            <div className="card"><h3>REST API endpoints</h3><div className="table-wrap"><table className="data-table"><thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
              <tbody>{p.apis.map((a, i) => <tr key={i}><td><b>{a.method}</b></td><td className="mono">{a.path}</td><td>{a.desc}</td></tr>)}</tbody></table></div></div>
          )}
        </>
      )}

      {tab === 'code' && (
        <>
          {p.starter && (
            <div className="card">
              <h3>Starter code (runs in the browser Java IDE)</h3>
              {p.starter.note && <div className="tip"><Inline text={p.starter.note} /></div>}
              <div className="row-btns"><button className="btn primary" onClick={() => openIDE(p.starter.files, p.starter.expected, p.title)}><Code2 size={15} /> Open starter in Java IDE</button></div>
              {Object.entries(p.starter.files).map(([n, c]) => <CodeBlock key={n} code={c} label={n} />)}
              {p.starter.expected && <CodeBlock code={p.starter.expected} label="Expected output" />}
            </div>
          )}
          {(p.keyCode || []).map((k, i) => <CodeBlock key={i} code={k.code} label={`${k.title}${k.lang ? ` · ${k.lang}` : ''}`} />)}
        </>
      )}

      {tab === 'viva' && (
        <div>
          <p className="muted">Questions examiners and interviewers ask about this project. Try answering out loud before opening each one, or practise in the <Link to="/tools/java-interview">Mock Interview</Link>.</p>
          {p.viva.map((v, i) => (
            <details key={i} className="card qa"><summary><span className="qa-q"><Inline text={v.q} /></span></summary><div className="qa-a"><RichText text={v.a} /></div></details>
          ))}
        </div>
      )}

      {tab === 'submit' && (
        <div className="grid2">
          <div className="card jc-form">
            <h3>Submission details</h3>
            <label>Your name<input className="input" value={sub.name || ''} onChange={(e) => setSub('name', e.target.value)} /></label>
            <label>Batch / college<input className="input" value={sub.batch || ''} onChange={(e) => setSub('batch', e.target.value)} /></label>
            <label>GitHub repository URL<input className="input" placeholder="https://github.com/you/project" value={sub.github || ''} onChange={(e) => setSub('github', e.target.value)} /></label>
            <label>Live demo / video URL<input className="input" value={sub.demo || ''} onChange={(e) => setSub('demo', e.target.value)} /></label>
            <label>Abstract (in your own words)<textarea className="input" rows={4} value={sub.abstract || ''} onChange={(e) => setSub('abstract', e.target.value)} /></label>
            <label>Challenges faced & what you learned<textarea className="input" rows={4} value={sub.challenges || ''} onChange={(e) => setSub('challenges', e.target.value)} /></label>
            <label>Future scope<textarea className="input" rows={3} value={sub.future || ''} onChange={(e) => setSub('future', e.target.value)} /></label>
          </div>
          <div className="card">
            <h3>Self-evaluation rubric ({rubTotal}/100)</h3>
            {p.rubric.map((r, i) => (
              <div key={i} className="jc-rub">
                <div><b>{r.criterion}</b> <span className="muted small">(max {r.points})</span><div className="muted small">{r.desc}</div></div>
                <input className="input" type="number" min={0} max={r.points} value={rub[i] ?? ''} onChange={(e) => setSt({ ...st, rubric: { ...rub, [i]: Math.max(0, Math.min(r.points, Number(e.target.value) || 0)) } })} />
              </div>
            ))}
            <div className="row-btns">
              <button className="btn primary" onClick={() => downloadFile(`${p.id}-project-report.html`, report(p, st))}><Download size={15} /> Download project report</button>
            </div>
            <p className="muted small">The report (HTML) includes your abstract, stack, features, design, milestone progress, self-evaluation and links. Open it in a browser and use Print → Save as PDF to submit.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JavaProjects() {
  const { id } = useParams();
  const [store, setStore] = useLocalState(STORE, {});
  const p = javaProjects.find((x) => x.id === id);
  if (p) return <ProjectDetail p={p} st={store[p.id] || {}} setSt={(v) => setStore((s) => ({ ...s, [p.id]: v }))} />;
  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🏗" /> Java Final Project Studio</h1>
        <p className="muted">Choose a final project, build it milestone by milestone, start from runnable starter code, prepare the viva and download your project report. Projects go from a Core Java console app to Spring Boot microservices.</p>
      </div>
      {!javaProjects.length && <p className="muted">Projects are being added.</p>}
      <div className="grid3">
        {javaProjects.map((x) => {
          const t = taskCount(x);
          const d = doneCount(x, store[x.id]);
          return (
            <Link key={x.id} to={`/tools/java-projects/${x.id}`} className="card tool-card">
              <div className="meta"><span className={`lvl lvl-${x.level}`}>{x.level}</span><span><Ico e="⏱" /> {x.duration}</span></div>
              <h3>{x.title}</h3>
              <p className="muted small">{x.summary}</p>
              <div className="chips">{x.stack.slice(0, 5).map((s) => <span key={s} className="jc-kw">{s}</span>)}</div>
              <ProgressBar value={t ? d / t : 0} />
              <div className="muted small">{d ? `${d}/${t} tasks done` : `${x.milestones.length} milestones · ${t} tasks`}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
