// Career Boost tools (all run in the browser, no server):
//  1. DSA practice sheet with an in-browser judge (Python + JavaScript)
//  2. Resume ATS checker
//  3. Virtual Internship (sprints of auto-graded tickets, certificate)
//  4. Placement drive board (admin posts drives, students see eligibility and track status)
//  5. Cheat sheets (revision sheets, optional PDF when the admin allows it)
//  6. LinkedIn & GitHub profile builder
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Code2, FileSearch, Briefcase, Megaphone, ScrollText, UserRoundPen, Search, CheckCircle2, XCircle, Lightbulb, Play, RotateCcw, Eye, ArrowLeft,
  ArrowRight, Download, Upload, Lock, Award, CalendarClock, ExternalLink, Plus, Trash2, Building2, Printer, Pencil, Save,
} from 'lucide-react';
import { useStudy } from '../study.js';
import { gradeTask } from '../engine/dayTaskGrader.js';
import DayTask, { dayTaskResult } from '../components/DayTask.jsx';
import RichText from '../components/RichText.jsx';
import { CertPhoto, useCertName } from '../components/MediaBits.jsx';
import { useProfile } from '../profile.js';
import { usePerms, readPerms, writePerms } from '../permissions.js';
import { downloadFile } from '../components/careerUtils.js';
import { MicBox } from './InterviewCoach.jsx';
import { allowPrintOnce } from '../protect.js';

const first = (g) => Object.values(g)[0] || {};
const CK = first(import.meta.glob('../data/careerKit.js', { eager: true }));
const INT = first(import.meta.glob('../data/internship.js', { eager: true }));
const DSA_FILES = import.meta.glob('../data/dsa/*.js');
const SHEET_FILES = import.meta.glob('../data/cheatsheets/*.js');

function Head({ icon: I, title, children }) {
  return <div className="page-head"><h1><I size={28} className="ico" /> {title}</h1><p className="muted">{children}</p></div>;
}
const Empty = ({ what }) => <div className="card muted">The {what} content is being prepared. Please check again soon.</div>;
const DIFF_CLS = { Easy: 'ok', Medium: 'warn', Hard: 'bad' };

/* ================================ 1. DSA practice ================================ */
function useDsa() {
  const [list, setList] = useState(null);
  useEffect(() => {
    let alive = true;
    Promise.all(Object.values(DSA_FILES).map((f) => f())).then((mods) => { if (alive) setList(mods.flatMap((m) => m.default || [])); });
    return () => { alive = false; };
  }, []);
  return list;
}
const pyLit = (v) => (v === null ? 'None' : v === true ? 'True' : v === false ? 'False' : typeof v === 'number' ? String(v) : typeof v === 'string' ? JSON.stringify(v)
  : Array.isArray(v) ? `[${v.map(pyLit).join(', ')}]` : `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${pyLit(x)}`).join(', ')}}`);
const callFor = (p, lang, t) => (lang === 'py' ? `${p.fn.py}(${t.args.map(pyLit).join(', ')})` : `${p.fn.js}(${t.args.map((a) => JSON.stringify(a)).join(', ')})`);
function judge(p, lang, code) {
  const task = { type: 'code', lang: lang === 'py' ? 'python' : 'js', tests: p.tests.map((t, k) => ({ call: callFor(p, lang, t), expect: t.expect, msg: `Test ${k + 1}: ${callFor(p, lang, t).slice(0, 90)}` })) };
  return gradeTask(task, code); // the grader serialises Python runs itself (wrapping in pyLock again would deadlock)
}

export function DsaPractice() {
  const { id } = useParams();
  const list = useDsa();
  if (!list) return <div className="ic-page"><Head icon={Code2} title="DSA Practice">Loading problems…</Head></div>;
  const p = id && list.find((x) => x.id === id);
  return p ? <DsaSolve p={p} list={list} /> : <DsaList list={list} />;
}

function DsaList({ list }) {
  const [st] = useStudy('upskillr-dsa', {});
  const [f, setF] = useState({ q: '', pattern: 'all', diff: 'all', company: 'all', status: 'all' });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const patterns = [...new Set(list.map((p) => p.pattern))];
  const companies = [...new Set(list.flatMap((p) => p.companies || []))].sort();
  const rows = list.filter((p) => (f.pattern === 'all' || p.pattern === f.pattern) && (f.diff === 'all' || p.diff === f.diff) && (f.company === 'all' || (p.companies || []).includes(f.company))
    && (f.status === 'all' || (f.status === 'solved') === !!st[p.id]?.solved) && (!f.q.trim() || p.title.toLowerCase().includes(f.q.trim().toLowerCase())));
  const solved = (d) => list.filter((p) => (!d || p.diff === d) && st[p.id]?.solved).length;
  const total = (d) => list.filter((p) => !d || p.diff === d).length;
  return (
    <div className="ic-page">
      <Head icon={Code2} title="DSA Practice Sheet">{list.length} coding problems in Python and JavaScript, grouped by pattern and tagged with the companies that ask them. Write your code, run the tests in the browser and track your progress.</Head>
      {!list.length ? <Empty what="DSA" /> : (
        <>
          <div className="ic-stats">
            <div className="card"><b>{solved()}/{total()}</b><span>Solved</span></div>
            {['Easy', 'Medium', 'Hard'].map((d) => <div key={d} className="card"><b className={`dsa-${DIFF_CLS[d]}`}>{solved(d)}/{total(d)}</b><span>{d}</span></div>)}
          </div>
          <div className="dsa-patterns">
            {patterns.map((pt) => { const all = list.filter((p) => p.pattern === pt); const s = all.filter((p) => st[p.id]?.solved).length; return (
              <button key={pt} className={`card dsa-pt ${f.pattern === pt ? 'active' : ''}`} onClick={() => setF((x) => ({ ...x, pattern: x.pattern === pt ? 'all' : pt }))}>
                <b>{pt}</b><span className="muted small">{s}/{all.length} solved</span><span className="sc-prog"><i style={{ width: `${(s / all.length) * 100}%` }} /></span>
              </button>
            ); })}
          </div>
          <div className="ic-toolbar">
            <label className="ic-search"><Search size={15} /><input className="input" placeholder="Search problems" value={f.q} onChange={set('q')} /></label>
            <select className="input ic-sel" value={f.diff} onChange={set('diff')}><option value="all">All levels</option><option>Easy</option><option>Medium</option><option>Hard</option></select>
            <select className="input ic-sel" value={f.company} onChange={set('company')}><option value="all">All companies</option>{companies.map((c) => <option key={c}>{c}</option>)}</select>
            <select className="input ic-sel" value={f.status} onChange={set('status')}><option value="all">All</option><option value="solved">Solved</option><option value="todo">Not solved</option></select>
          </div>
          <div className="card dsa-table-wrap">
            <table className="data-table dsa-table">
              <thead><tr><th /><th>Problem</th><th>Level</th><th>Pattern</th><th>Companies</th></tr></thead>
              <tbody>{rows.map((p) => (
                <tr key={p.id}>
                  <td>{st[p.id]?.solved ? <CheckCircle2 size={16} className="ico t-ok" /> : <span className="dsa-dot" />}</td>
                  <td><Link to={`/tools/dsa/${p.id}`}>{p.title}</Link></td>
                  <td><span className={`dsa-diff dsa-${DIFF_CLS[p.diff]}`}>{p.diff}</span></td>
                  <td className="muted small">{p.pattern}</td>
                  <td className="small">{(p.companies || []).join(', ')}</td>
                </tr>
              ))}</tbody>
            </table>
            {!rows.length && <p className="muted">No problem matches these filters.</p>}
          </div>
        </>
      )}
    </div>
  );
}

function DsaSolve({ p, list }) {
  const nav = useNavigate();
  const [st, setSt] = useStudy('upskillr-dsa', {});
  const mine = st[p.id] || {};
  const [lang, setLang] = useState(mine.lang || 'py');
  const [code, setCode] = useState(() => mine[lang] ?? p[lang].starter);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [hints, setHints] = useState(0);
  const [showSol, setShowSol] = useState(false);
  useEffect(() => { setCode((st[p.id] || {})[lang] ?? p[lang].starter); setRes(null); }, [p.id, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = (patch) => setSt((x) => ({ ...x, [p.id]: { ...(x[p.id] || {}), ...patch } }));
  const onCode = (v) => { setCode(v ?? ''); save({ [lang]: v ?? '', lang }); };
  const run = async () => {
    setBusy(true); setRes(null);
    try {
      const r = await judge(p, lang, code);
      setRes(r);
      if (r.ok) save({ solved: true, solvedAt: mine.solvedAt || Date.now() });
    } catch (e) { setRes({ ok: false, checks: [{ ok: false, msg: String(e?.message || e) }] }); }
    setBusy(false);
  };
  const idx = list.findIndex((x) => x.id === p.id);
  const nextP = list[idx + 1];
  const passed = res?.checks?.filter((c) => c.ok).length || 0;
  return (
    <div className="dsa-solve">
      <div className="dsa-left card">
        <div className="row-btns"><Link to="/tools/dsa" className="btn small"><ArrowLeft size={14} /> All problems</Link>{mine.solved && <span className="badge ok"><CheckCircle2 size={13} /> Solved</span>}</div>
        <h1 className="dsa-title">{p.title}</h1>
        <div className="row-btns"><span className={`dsa-diff dsa-${DIFF_CLS[p.diff]}`}>{p.diff}</span><span className="badge">{p.pattern}</span>{(p.companies || []).map((c) => <span key={c} className="chip small">{c}</span>)}</div>
        <div className="dsa-statement"><RichText text={p.statement} /></div>
        {p.examples?.map((e, k) => (
          <div key={k} className="dsa-example"><b>Example {k + 1}</b><pre>{`Input:  ${e.input}\nOutput: ${e.output}${e.explain ? `\nWhy:    ${e.explain}` : ''}`}</pre></div>
        ))}
        {p.constraints?.length > 0 && <><b>Constraints</b><ul className="small">{p.constraints.map((c) => <li key={c}><code>{c}</code></li>)}</ul></>}
        <div className="row-btns">
          {p.hints?.length > 0 && hints < p.hints.length && <button className="btn small" onClick={() => setHints((h) => h + 1)}><Lightbulb size={14} /> Hint {hints + 1}</button>}
          <button className="btn small" onClick={() => setShowSol((s) => !s)}><Eye size={14} /> {showSol ? 'Hide' : 'Show'} approach & solution</button>
        </div>
        {p.hints?.slice(0, hints).map((h, k) => <div key={k} className="ic-tip"><Lightbulb size={14} /> {h}</div>)}
        {showSol && (
          <div className="ic-model">
            <p>{p.approach}</p>
            <p className="small"><b>Complexity:</b> {p.complexity}</p>
            <pre className="dsa-sol">{p[lang].solution}</pre>
          </div>
        )}
      </div>
      <div className="dsa-right">
        <div className="card dsa-editor-card">
          <div className="dsa-editor-top">
            <div className="ic-seg">
              <button className={`chip ${lang === 'py' ? 'active' : ''}`} onClick={() => { setLang('py'); save({ lang: 'py' }); }}>Python</button>
              <button className={`chip ${lang === 'js' ? 'active' : ''}`} onClick={() => { setLang('js'); save({ lang: 'js' }); }}>JavaScript</button>
            </div>
            <button className="btn small" onClick={() => window.confirm('Reset your code to the starter?') && onCode(p[lang].starter)}><RotateCcw size={14} /> Reset</button>
          </div>
          <div className="dsa-editor">
            <Editor height="100%" language={lang === 'py' ? 'python' : 'javascript'} theme="vs-dark" value={code} onChange={onCode}
              options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, tabSize: lang === 'py' ? 4 : 2, automaticLayout: true }} />
          </div>
          <div className="row-btns dsa-run">
            <button className="btn primary" onClick={run} disabled={busy}><Play size={15} /> {busy ? (lang === 'py' ? 'Running (Python loads once)…' : 'Running…') : `Run ${p.tests.length} tests`}</button>
            {res && <span className={`badge ${res.ok ? 'ok' : ''}`}>{passed}/{p.tests.length} passed</span>}
            {res?.ok && nextP && <button className="btn" onClick={() => nav(`/tools/dsa/${nextP.id}`)}>Next problem <ArrowRight size={14} /></button>}
          </div>
        </div>
        {res && (
          <div className={`card ic-result ${res.ok ? 'good' : 'again'}`}>
            <b>{res.ok ? <><CheckCircle2 size={16} /> Accepted. All tests passed.</> : <><XCircle size={16} /> Some tests failed.</>}</b>
            <ul className="ic-kp small">{(res.checks || []).map((c, k) => <li key={k} className={c.ok ? 'ok' : 'miss'}>{c.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />} {c.msg}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================ 2. ATS checker ================================ */
const flatText = (o) => (o == null ? '' : typeof o === 'string' ? o : typeof o === 'number' ? String(o) : Array.isArray(o) ? o.map(flatText).join('\n') : typeof o === 'object' ? Object.entries(o).filter(([k]) => !/^(id|photo)$/.test(k)).map(([, v]) => flatText(v)).join('\n') : '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasTerm = (text, term) => new RegExp(`(^|[^a-z0-9+#.])${esc(term)}([^a-z0-9+#]|$)`, 'i').test(text);
function termFound(text, kw) {
  return hasTerm(text, kw) || (CK.SYNONYMS?.[kw] || []).some((s) => hasTerm(text, s));
}
function jdKeywords(jd) {
  const all = new Set();
  Object.values(CK.ROLES || {}).forEach((r) => [...r.must, ...r.good].forEach((k) => all.add(k)));
  Object.keys(CK.SYNONYMS || {}).forEach((k) => all.add(k));
  return [...all].filter((k) => termFound(jd, k));
}
function analyse(resume, roleKey, jd) {
  const role = CK.ROLES?.[roleKey];
  const must = jd.trim() ? jdKeywords(jd) : role ? role.must : [];
  const good = jd.trim() ? [] : role ? role.good : [];
  const mHit = must.filter((k) => termFound(resume, k));
  const gHit = good.filter((k) => termFound(resume, k));
  const sections = (CK.SECTIONS || []).map((s) => ({ ...s, ok: new RegExp(s.test, 'i').test(resume) }));
  const verbs = Object.values(CK.ACTION_VERBS || {}).flat().filter((v) => hasTerm(resume, v.toLowerCase()));
  const weak = (CK.WEAK_PHRASES || []).filter((w) => resume.toLowerCase().includes(w.weak.toLowerCase()));
  const numbers = (resume.match(/\b\d+(\.\d+)?\s*(%|\+|x|k|lakh|users|students|ms|seconds|hours|days)?/gi) || []).length;
  const words = (resume.match(/\S+/g) || []).length;
  const email = /[\w.+-]+@[\w-]+\.[\w.]+/.test(resume), phone = /(\+91[\s-]?)?[6-9]\d{9}\b|\d{5}\s\d{5}/.test(resume);
  const links = /linkedin\.com/i.test(resume) + /github\.com/i.test(resume);
  const kwScore = must.length ? (mHit.length / must.length) * 45 + (good.length ? (gHit.length / good.length) * 10 : 10 * (mHit.length / must.length)) : 0;
  const secScore = (sections.filter((s) => s.ok).length / Math.max(1, sections.length)) * 15;
  const score = Math.max(0, Math.min(100, Math.round(kwScore + secScore + Math.min(10, verbs.length * 1.5) + Math.min(8, numbers * 1.6) + (email ? 4 : 0) + (phone ? 3 : 0) + links * 2.5 + (words >= 250 && words <= 800 ? 5 : words >= 150 ? 2 : 0) - weak.length * 2)));
  const tips = [];
  if (must.length && mHit.length < must.length) tips.push(`Add the missing keywords you genuinely know (${must.filter((k) => !mHit.includes(k)).slice(0, 6).join(', ')}) in Skills and inside project bullets.`);
  if (numbers < 3) tips.push('Quantify results: "reduced load time by 40%", "8 REST APIs", "used by 120 students".');
  if (verbs.length < 5) tips.push('Start bullet points with strong action verbs: Built, Designed, Automated, Improved, Analysed.');
  sections.filter((s) => !s.ok).forEach((s) => tips.push(`Add a "${s.label}" section. ${s.tip || ''}`));
  if (!email || !phone) tips.push('Put your email and mobile number at the top.');
  if (links < 2) tips.push('Add your LinkedIn and GitHub links. Recruiters open them.');
  weak.forEach((w) => tips.push(`Replace "${w.weak}": ${w.better}`));
  if (words < 250) tips.push(`Your resume is short (${words} words). Describe 2-3 projects with 2-3 bullets each.`);
  if (words > 800) tips.push(`Your resume is long (${words} words). Freshers should fit on one page.`);
  return { score, must, mHit, good, gHit, sections, verbs, weak, numbers, words, email, phone, links, tips };
}

export function AtsChecker() {
  const [saved] = useStudy('resume', null);
  const [resume, setResume] = useStudy('upskillr-ats-resume', '');
  const [jd, setJd] = useStudy('upskillr-ats-jd', '');
  const [role, setRole] = useState(Object.keys(CK.ROLES || {})[0] || '');
  const [out, setOut] = useState(null);
  const readFile = (set) => (e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => set(String(r.result || '')); r.readAsText(f); e.target.value = ''; };
  if (!CK.ROLES) return <div className="ic-page"><Head icon={FileSearch} title="Resume ATS Checker">Checks your resume like an Applicant Tracking System.</Head><Empty what="ATS" /></div>;
  return (
    <div className="ic-page">
      <Head icon={FileSearch} title="Resume ATS Checker">Most companies filter resumes with an ATS before a human reads them. Check your resume against a job description or a target role: see your score, missing keywords and what to fix.</Head>
      <div className="ic-two">
        <div className="card ic-form">
          <b>1. Your resume</b>
          <div className="row-btns">
            {saved && <button className="btn small" onClick={() => setResume(flatText(saved))}><FileSearch size={14} /> Use my Resume Builder resume</button>}
            <label className="btn small"><Upload size={14} /> Upload .txt<input type="file" accept=".txt,text/plain" hidden onChange={readFile(setResume)} /></label>
            {!saved && <Link className="btn small" to="/study/resume">Build a resume first</Link>}
          </div>
          <textarea className="input" rows={12} value={resume} onChange={(e) => setResume(e.target.value)} placeholder="Your resume text appears here (load it from the Resume Builder, upload a .txt file or type it)" />
          <span className="muted small">{(resume.match(/\S+/g) || []).length} words</span>
        </div>
        <div className="card ic-form">
          <b>2. Target</b>
          <label className="field">Target role<select className="input" value={role} onChange={(e) => setRole(e.target.value)}>{Object.entries(CK.ROLES).map(([k, r]) => <option key={k} value={k}>{r.name}</option>)}</select></label>
          <label className="field">Job description (optional, gives a more exact match)
            <textarea className="input" rows={8} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Type the key requirements from the job post, or upload it as .txt" />
          </label>
          <label className="btn small"><Upload size={14} /> Upload JD .txt<input type="file" accept=".txt,text/plain" hidden onChange={readFile(setJd)} /></label>
          <button className="btn primary" disabled={(resume.match(/\S+/g) || []).length < 20} onClick={() => setOut(analyse(resume, role, jd))}><FileSearch size={15} /> Check my resume</button>
        </div>
      </div>
      {out && <AtsResult r={out} jdMode={!!jd.trim()} />}
      {CK.ATS_TIPS && <div className="card ic-tipbox"><h3>ATS-friendly resume rules</h3><ul className="small">{CK.ATS_TIPS.map((t) => <li key={t}>{t}</li>)}</ul></div>}
    </div>
  );
}

function AtsResult({ r, jdMode }) {
  const cls = r.score >= 75 ? 'ok' : r.score >= 50 ? 'warn' : 'bad';
  return (
    <div className="ats-result">
      <div className="card ats-score-card">
        <div className={`ats-ring ats-${cls}`} style={{ '--p': r.score }}><b>{r.score}</b><span>/ 100</span></div>
        <div>
          <h3>{r.score >= 75 ? 'Strong resume for this role' : r.score >= 50 ? 'Good start, needs improvement' : 'Likely to be filtered out'}</h3>
          <p className="muted small">{r.mHit.length}/{r.must.length} {jdMode ? 'job description' : 'must-have'} keywords · {r.verbs.length} action verbs · {r.numbers} numbers · {r.words} words</p>
        </div>
      </div>
      <div className="ic-two">
        <div className="card"><h3>Keywords found</h3><div className="ats-chips">{[...r.mHit, ...r.gHit].map((k) => <span key={k} className="ats-chip ok">{k}</span>)}{!r.mHit.length && !r.gHit.length && <span className="muted small">None yet</span>}</div></div>
        <div className="card"><h3>Missing keywords</h3><div className="ats-chips">{r.must.filter((k) => !r.mHit.includes(k)).map((k) => <span key={k} className="ats-chip miss">{k}</span>)}{r.good.filter((k) => !r.gHit.includes(k)).map((k) => <span key={k} className="ats-chip soft">{k}</span>)}</div><p className="muted small">Add only what you really know; you will be asked about it.</p></div>
      </div>
      <div className="ic-two">
        <div className="card"><h3>Sections</h3><ul className="ic-kp small">{r.sections.map((s) => <li key={s.key} className={s.ok ? 'ok' : 'miss'}>{s.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />} {s.label}</li>)}
          <li className={r.email ? 'ok' : 'miss'}>{r.email ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Email</li><li className={r.phone ? 'ok' : 'miss'}>{r.phone ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Mobile number</li>
          <li className={r.links >= 2 ? 'ok' : 'miss'}>{r.links >= 2 ? <CheckCircle2 size={13} /> : <XCircle size={13} />} LinkedIn and GitHub links</li></ul></div>
        <div className="card"><h3>How to improve</h3><ol className="small">{r.tips.slice(0, 10).map((t) => <li key={t}>{t}</li>)}</ol>{!r.tips.length && <p className="small">Looks great. Tailor the keywords for each job you apply to.</p>}</div>
      </div>
    </div>
  );
}

/* ================================ 3. Virtual internship ================================ */
function useTaskTick() {
  const [, setN] = useState(0);
  useEffect(() => { const h = () => setN((n) => n + 1); window.addEventListener('upskillr-daytasks', h); return () => window.removeEventListener('upskillr-daytasks', h); }, []);
}
const sprintDone = (id) => { const r = dayTaskResult('internship', id); return r?.result && (r.best ?? r.result.score) / r.result.total >= 0.6; };
const sprintPct = (id) => { const r = dayTaskResult('internship', id); return r?.result ? Math.round(((r.best ?? r.result.score) / r.result.total) * 100) : null; };

export function VirtualInternship() {
  const { id } = useParams();
  useTaskTick();
  const list = INT.INTERNSHIPS || [];
  const it = id && list.find((x) => x.id === id);
  if (it) return <InternshipDetail it={it} />;
  return (
    <div className="ic-page">
      <Head icon={Briefcase} title="Virtual Internship">Join a (fictional) company for 4 weeks. Every sprint you get real-looking Jira tickets from your mentor, solve them in the browser and get code-review feedback. Finish all sprints to earn an internship completion certificate you can add to your resume.</Head>
      {!list.length ? <Empty what="internship" /> : (
        <div className="grid3">
          {list.map((x) => {
            const done = x.sprints.filter((s) => sprintDone(s.id)).length;
            return (
              <Link key={x.id} to={`/tools/internship/${x.id}`} className="card vi-card" style={{ '--c': x.color }}>
                <div className="vi-logo"><Building2 size={22} /></div>
                <h3>{x.name}</h3>
                <p className="muted small">{x.company}</p>
                <p className="small">{x.about}</p>
                <div className="ats-chips">{x.stack.map((s) => <span key={s} className="ats-chip">{s}</span>)}</div>
                <div className="sc-prog"><i style={{ width: `${(done / x.sprints.length) * 100}%` }} /></div>
                <span className="small muted">{done === x.sprints.length ? 'Completed' : `${done}/${x.sprints.length} sprints done`}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InternshipDetail({ it }) {
  const [open, setOpen] = useState(null);
  const [standup, setStandup] = useStudy(`upskillr-intern-standup-${it.id}`, {});
  const name = useCertName();
  const doneAll = it.sprints.every((s) => sprintDone(s.id));
  const avg = Math.round(it.sprints.reduce((t, s) => t + (sprintPct(s.id) || 0), 0) / it.sprints.length);
  return (
    <div className="ic-page">
      <Head icon={Briefcase} title={it.name}>{it.company} · {it.weeks} weeks · Mentor: {it.mentor.name}, {it.mentor.role}</Head>
      <div className="row-btns"><Link to="/tools/internship" className="btn small"><ArrowLeft size={14} /> All internships</Link></div>
      <div className="card"><h3>Welcome aboard</h3><p>{it.about}</p><b className="small">Onboarding</b><ul className="small">{it.onboarding.map((o) => <li key={o}>{o}</li>)}</ul></div>
      <div className="vi-sprints">
        {it.sprints.map((s, k) => {
          const locked = k > 0 && !sprintDone(it.sprints[k - 1].id);
          const pct = sprintPct(s.id); const done = sprintDone(s.id);
          return (
            <div key={s.id} className={`card vi-sprint ${done ? 'done' : ''} ${locked ? 'locked' : ''}`}>
              <div className="ic-card-head">
                <div><span className="badge">Week {s.week}</span> <b>{s.title}</b><p className="muted small">{s.goal}</p></div>
                <div className="row-btns">
                  {pct != null && <span className={`badge ${done ? 'ok' : ''}`}>{pct}%</span>}
                  {locked ? <span className="muted small"><Lock size={14} /> Finish the previous sprint (60%+)</span> : <button className="btn small primary" onClick={() => setOpen(open === s.id ? null : s.id)}>{open === s.id ? 'Close' : done ? 'Review sprint' : 'Open sprint'}</button>}
                </div>
              </div>
              {open === s.id && !locked && (
                <div className="vi-body">
                  <div className="vi-msg"><div className="vi-ava">{it.mentor.name.split(' ').map((x) => x[0]).join('')}</div><div><b>{it.mentor.name}</b> <span className="muted small">{it.mentor.role}</span><p className="ic-pre">{s.brief}</p></div></div>
                  <div className="card vi-standup"><b>Stand-up</b><p className="small">{s.standup}</p><MicBox value={standup[s.id] || ''} onChange={(fn) => setStandup((x) => ({ ...x, [s.id]: typeof fn === 'function' ? fn(x[s.id] || '') : fn }))} rows={2} /></div>
                  <DayTask key={s.id} track="internship" lesson={{ id: s.id, title: s.title }} />
                  {done && s.review?.length > 0 && <div className="card"><h3>Code review from your mentor</h3><ul className="small">{s.review.map((r) => <li key={r}>{r}</li>)}</ul></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {doneAll && (
        <div className="cert vi-cert">
          <div className="cert-brand">NGU</div>
          <CertPhoto />
          <div className="cert-title">Certificate of Internship Completion</div>
          <p>This is to certify that</p>
          <div className="cert-name">{name}</div>
          <p>has completed the {it.weeks}-week virtual internship as <b>{it.name}</b> at {it.company}, finishing all {it.sprints.length} sprints with an average score of <b>{avg}%</b>.</p>
          <div className="ats-chips vi-skills">{(it.certificateSkills || it.stack).map((s) => <span key={s} className="ats-chip">{s}</span>)}</div>
          <div className="cert-foot"><span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span><span>Developed by ER. Chetan D Morey</span></div>
        </div>
      )}
    </div>
  );
}

/* ================================ 4. Placement drive board ================================ */
const EMPTY_DRIVE = { company: '', role: '', ctc: '', location: '', lastDate: '', driveDate: '', link: '', minCgpa: '', branches: '', years: '', maxBacklogs: '', about: '' };
const splitList = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
function eligibility(d, me) {
  const why = [];
  if (d.minCgpa && (!me.cgpa || Number(me.cgpa) < Number(d.minCgpa))) why.push(me.cgpa ? `CGPA ${me.cgpa} is below ${d.minCgpa}` : `Needs CGPA ${d.minCgpa}+ (add your CGPA)`);
  const br = splitList(d.branches);
  if (br.length && !br.some((b) => b.toLowerCase() === 'any') && !br.some((b) => (me.branch || '').toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes((me.branch || '#').toLowerCase()))) why.push(me.branch ? `Branch ${me.branch} not in ${br.join(', ')}` : 'Add your branch');
  const yrs = splitList(d.years);
  if (yrs.length && !yrs.includes(String(me.passingYear || ''))) why.push(me.passingYear ? `For ${yrs.join(', ')} batch` : 'Add your passing year');
  if (d.maxBacklogs !== '' && d.maxBacklogs != null && Number(me.backlogs || 0) > Number(d.maxBacklogs)) why.push(`Max ${d.maxBacklogs} active backlogs`);
  return why;
}
const daysLeft = (date) => (date ? Math.ceil((new Date(`${date}T23:59:59`) - Date.now()) / 86400000) : null);
const STATUSES = ['Not applied', 'Applied', 'Online test', 'Interview', 'Selected', 'Rejected'];

export function PlacementDrives() {
  const { m, isAdmin } = usePerms();
  const drives = Array.isArray(m.drives) ? m.drives : [];
  const [p, update] = useProfile();
  const [status, setStatus] = useStudy('upskillr-drive-status', {});
  const [onlyElig, setOnlyElig] = useState(false);
  const [edit, setEdit] = useState(null);
  const me = { cgpa: p.cgpa || '', branch: p.branch || '', passingYear: p.passingYear || '', backlogs: p.backlogs ?? '' };
  const saveDrives = (fn) => { const cur = readPerms(); writePerms({ ...cur, drives: fn(Array.isArray(cur.drives) ? cur.drives : []) }); };
  const sorted = [...drives].sort((a, b) => String(a.lastDate || '9999').localeCompare(String(b.lastDate || '9999')));
  const shown = sorted.filter((d) => !onlyElig || !eligibility(d, me).length);
  return (
    <div className="ic-page">
      <Head icon={Megaphone} title="Placement Drives">Current job openings and campus drives posted by your institute. See instantly whether you are eligible, apply before the last date and track every application.</Head>
      <div className="card ic-form pd-me">
        <b>My eligibility details</b>
        <div className="pd-me-grid">
          <label className="field">CGPA / %<input className="input" value={me.cgpa} placeholder="7.8" onChange={(e) => update({ cgpa: e.target.value })} /></label>
          <label className="field">Branch<input className="input" value={me.branch} placeholder="Computer" onChange={(e) => update({ branch: e.target.value })} /></label>
          <label className="field">Passing year<input className="input" value={me.passingYear} placeholder="2026" onChange={(e) => update({ passingYear: e.target.value })} /></label>
          <label className="field">Active backlogs<input className="input" value={me.backlogs} placeholder="0" onChange={(e) => update({ backlogs: e.target.value })} /></label>
        </div>
      </div>
      <div className="ic-toolbar">
        <label className="check"><input type="checkbox" checked={onlyElig} onChange={(e) => setOnlyElig(e.target.checked)} /> Show only drives I am eligible for</label>
        {isAdmin && <button className="btn primary" onClick={() => setEdit({ ...EMPTY_DRIVE, id: `d${Date.now()}` })}><Plus size={15} /> Post a drive</button>}
      </div>
      {edit && <DriveForm d={edit} onCancel={() => setEdit(null)} onSave={(d) => { saveDrives((all) => (all.some((x) => x.id === d.id) ? all.map((x) => (x.id === d.id ? d : x)) : [...all, d])); setEdit(null); }} />}
      {!drives.length && <div className="card muted">No drives posted yet. {isAdmin ? 'Click "Post a drive" to add the first one. To show it on every device, publish the settings file from Admin → Publish & settings.' : 'Your admin will post openings here.'}</div>}
      <div className="pd-list">
        {shown.map((d) => {
          const why = eligibility(d, me); const left = daysLeft(d.lastDate); const closed = left != null && left < 0;
          return (
            <div key={d.id} className={`card pd-card ${closed ? 'closed' : ''}`}>
              <div className="ic-card-head">
                <div><h3>{d.company} <span className="muted">· {d.role}</span></h3><p className="small muted">{[d.ctc && `CTC ${d.ctc}`, d.location, d.driveDate && `Drive on ${d.driveDate}`].filter(Boolean).join(' · ')}</p></div>
                <div className="row-btns">
                  {closed ? <span className="badge">Closed</span> : left != null && <span className={`badge ${left <= 3 ? 'warn' : ''}`}><CalendarClock size={13} /> {left === 0 ? 'Last day today' : `${left} days left`}</span>}
                  {why.length ? <span className="badge bad">Not eligible</span> : <span className="badge ok">Eligible</span>}
                </div>
              </div>
              {d.about && <p className="small">{d.about}</p>}
              <p className="small muted">Criteria: {[d.minCgpa && `CGPA ${d.minCgpa}+`, d.branches && `Branches: ${d.branches}`, d.years && `Batch: ${d.years}`, d.maxBacklogs !== '' && d.maxBacklogs != null && `Max backlogs: ${d.maxBacklogs}`].filter(Boolean).join(' · ') || 'Open to all'}</p>
              {why.length > 0 && <ul className="ic-kp small">{why.map((w) => <li key={w} className="miss"><XCircle size={13} /> {w}</li>)}</ul>}
              <div className="row-btns">
                {d.link && !closed && <a className="btn small primary" href={d.link} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Apply</a>}
                <select className="input pd-status" value={status[d.id] || 'Not applied'} onChange={(e) => setStatus((x) => ({ ...x, [d.id]: e.target.value }))}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                {isAdmin && <><button className="btn small" onClick={() => setEdit(d)}><Pencil size={14} /> Edit</button><button className="btn small danger" onClick={() => window.confirm(`Delete the ${d.company} drive?`) && saveDrives((all) => all.filter((x) => x.id !== d.id))}><Trash2 size={14} /> Delete</button></>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DriveForm({ d, onSave, onCancel }) {
  const [v, setV] = useState(d);
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  const F = (k, label, ph, type = 'text') => <label className="field" key={k}>{label}<input className="input" type={type} value={v[k] || ''} placeholder={ph} onChange={set(k)} /></label>;
  return (
    <div className="card ic-form pd-form">
      <b>{d.company ? `Edit ${d.company}` : 'Post a new drive'}</b>
      <div className="pd-me-grid">
        {F('company', 'Company *', 'Infosys')}{F('role', 'Role *', 'Systems Engineer')}{F('ctc', 'CTC', '3.6 LPA')}{F('location', 'Location', 'Pune / Remote')}
        {F('lastDate', 'Last date to apply', '', 'date')}{F('driveDate', 'Drive / test date', '', 'date')}{F('minCgpa', 'Min CGPA', '6.5')}{F('maxBacklogs', 'Max active backlogs', '0')}
        {F('branches', 'Branches (comma separated or Any)', 'Computer, IT, ENTC')}{F('years', 'Passing years', '2025, 2026')}
      </div>
      {F('link', 'Apply link', 'https://…')}
      <label className="field">About the role<textarea className="input" rows={3} value={v.about || ''} onChange={set('about')} /></label>
      <div className="row-btns"><button className="btn primary" disabled={!v.company.trim() || !v.role.trim()} onClick={() => onSave(v)}><Save size={14} /> Save drive</button><button className="btn" onClick={onCancel}>Cancel</button></div>
    </div>
  );
}

/* ================================ 5. Cheat sheets ================================ */
function useSheets() {
  const [list, setList] = useState(null);
  useEffect(() => { let alive = true; Promise.all(Object.values(SHEET_FILES).map((f) => f())).then((ms) => alive && setList(ms.map((x) => x.default).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)))); return () => { alive = false; }; }, []);
  return list;
}

export function CheatSheets() {
  const { id } = useParams();
  const list = useSheets();
  const { m, isAdmin } = usePerms();
  const pdfOn = !!m.settings?.cheatsheetPdf;
  const togglePdf = () => { const cur = readPerms(); writePerms({ ...cur, settings: { ...(cur.settings || {}), cheatsheetPdf: !pdfOn } }); };
  if (!list) return <div className="ic-page"><Head icon={ScrollText} title="Cheat Sheets">Loading…</Head></div>;
  const s = id && list.find((x) => x.id === id);
  if (s) {
    return (
      <div className="ic-page">
        <div className="row-btns no-print"><Link to="/tools/cheat-sheets" className="btn small"><ArrowLeft size={14} /> All cheat sheets</Link>
          {pdfOn && <button className="btn small primary" onClick={allowPrintOnce}><Printer size={14} /> Save as PDF</button>}
        </div>
        <div className="cs-sheet print-allowed" style={{ '--c': s.color }}>
          <div className="cs-head"><div><h1>{s.name} Cheat Sheet</h1><p>{s.summary}</p></div><span className="cs-brand">NGU</span></div>
          <div className="cs-grid">
            {s.sections.map((sec) => (
              <div key={sec.h} className="cs-sec"><h3>{sec.h}</h3>
                <table><tbody>{sec.rows.map(([c, n], k) => <tr key={k}><td><code>{c}</code></td><td>{n}</td></tr>)}</tbody></table>
              </div>
            ))}
          </div>
          <div className="cs-grid cs-bottom">
            {s.interview?.length > 0 && <div className="cs-sec"><h3>Must remember for interviews</h3><ul>{s.interview.map((x) => <li key={x}>{x}</li>)}</ul></div>}
            {s.mistakes?.length > 0 && <div className="cs-sec"><h3>Common mistakes</h3><ul>{s.mistakes.map((x) => <li key={x}>{x}</li>)}</ul></div>}
          </div>
          <div className="cs-foot">NGU · Developed by ER. Chetan D Morey</div>
        </div>
      </div>
    );
  }
  return (
    <div className="ic-page">
      <Head icon={ScrollText} title="Cheat Sheets">Two-page revision sheets for {list.length || 26} technologies: syntax, must-remember interview facts and common mistakes. Read one the night before your exam or interview.</Head>
      {isAdmin && <div className="card row-btns"><label className="check"><input type="checkbox" checked={pdfOn} onChange={togglePdf} /> Allow students to save cheat sheets as PDF</label><span className="muted small">Off by default because copying and printing are blocked on NGU.</span></div>}
      {!list.length ? <Empty what="cheat sheet" /> : (
        <div className="cs-cards">
          {list.map((x) => <Link key={x.id} to={`/tools/cheat-sheets/${x.id}`} className="card cs-card" style={{ '--c': x.color }}><b>{x.name}</b><span className="muted small">{x.summary}</span><span className="small">{x.sections.length} sections</span></Link>)}
        </div>
      )}
    </div>
  );
}

/* ================================ 6. LinkedIn & GitHub profile builder ================================ */
const fillT = (t, v) => String(t || '').replace(/\{(\w+)\}/g, (_, k) => v[k] || '').replace(/\s+\|\s+\|/g, ' |').replace(/\s{2,}/g, ' ').replace(/(\|\s*)+$/, '').trim();

export function ProfileBuilder() {
  const [p] = useProfile();
  const roles = CK.ROLES || {};
  const [v, setV] = useStudy('upskillr-profile-builder', {});
  const val = {
    name: v.name ?? p.fullName ?? '', role: v.role ?? Object.keys(roles)[0] ?? '', skills: v.skills ?? (Array.isArray(p.skills) ? p.skills.join(', ') : ''), college: v.college ?? p.college ?? '',
    degree: v.degree ?? p.degree ?? '', year: v.year ?? p.passingYear ?? '', city: v.city ?? p.city ?? '', projectName: v.projectName ?? '', projectImpact: v.projectImpact ?? '', projectType: v.projectType ?? 'real-world web apps',
    interest: v.interest ?? '', portfolio: v.portfolio ?? p.portfolio ?? '', github: v.github ?? (p.github || '').replace(/.*github\.com\//, '').replace(/\/$/, ''), linkedin: v.linkedin ?? p.linkedin ?? '', email: v.email ?? '',
  };
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  const roleName = roles[val.role]?.name || 'Software Developer';
  const skillList = splitList(val.skills);
  const vars = { ...val, role: roleName, skills3: skillList.slice(0, 3).join(', ') };
  const headlines = (CK.HEADLINE_TEMPLATES || []).map((t) => fillT(t, vars)).filter((h) => h.length > 10).slice(0, 6);
  const A = CK.ABOUT_TEMPLATE || {};
  const about = ['intro', 'skills', 'projects', 'goal', 'close'].map((k, i) => fillT((A[k] || [])[i % Math.max(1, (A[k] || []).length)], vars)).filter(Boolean).join('\n\n');
  const suggest = (roles[val.role]?.must || []).filter((k) => !skillList.some((s) => s.toLowerCase() === k)).slice(0, 8);
  const readme = useMemo(() => buildReadme(val, roleName, skillList), [JSON.stringify(val)]); // eslint-disable-line react-hooks/exhaustive-deps
  const F = (k, label, ph) => <label className="field" key={k}>{label}<input className="input" value={val[k]} placeholder={ph} onChange={set(k)} /></label>;
  return (
    <div className="ic-page">
      <Head icon={UserRoundPen} title="LinkedIn & GitHub Profile Builder">Recruiters check LinkedIn and GitHub before calling you. Fill in a few details and get a professional headline, an About section, the right skills and a GitHub profile README.</Head>
      <div className="ic-two pb-wrap">
        <div className="card ic-form">
          {F('name', 'Full name', 'Asha Patil')}
          <label className="field">Target role<select className="input" value={val.role} onChange={set('role')}>{Object.entries(roles).map(([k, r]) => <option key={k} value={k}>{r.name}</option>)}</select></label>
          {F('skills', 'Top skills (comma separated)', 'Java, Spring Boot, MySQL, React')}
          <div className="pd-me-grid">{F('college', 'College', 'PCCOE Pune')}{F('degree', 'Degree', 'B.E. Computer')}{F('year', 'Passing year', '2026')}{F('city', 'City', 'Pune')}</div>
          {F('projectName', 'Best project', 'Smart Attendance System')}
          {F('projectImpact', 'Project impact', 'marks attendance in 30 seconds for 60 students')}
          {F('projectType', 'What you like building', 'real-world web apps')}
          {F('interest', 'Area of interest', 'backend development and cloud')}
          <div className="pd-me-grid">{F('github', 'GitHub username', 'ashapatil')}{F('linkedin', 'LinkedIn URL', 'linkedin.com/in/ashapatil')}{F('email', 'Email', 'asha@example.com')}</div>
        </div>
        <div className="pb-out">
          <div className="card"><h3>Headline options</h3><p className="muted small">Pick one (LinkedIn allows 220 characters).</p>{headlines.map((h) => <div key={h} className="pb-head"><span>{h}</span><span className="muted small">{h.length}</span></div>)}</div>
          <div className="card"><div className="ic-card-head"><h3>About section</h3><button className="btn small" onClick={() => downloadFile('linkedin-about.txt', about, 'text/plain')}><Download size={14} /> Download</button></div><p className="ic-pre small">{about}</p></div>
          <div className="card"><h3>Skills to list</h3><div className="ats-chips">{skillList.map((s) => <span key={s} className="ats-chip ok">{s}</span>)}</div>{suggest.length > 0 && <><p className="small muted">Recruiters for {roleName} also search for (add only if you know them):</p><div className="ats-chips">{suggest.map((s) => <span key={s} className="ats-chip soft">{s}</span>)}</div></>}</div>
          <div className="card"><div className="ic-card-head"><h3>GitHub profile README.md</h3><button className="btn small" onClick={() => downloadFile('README.md', readme, 'text/markdown')}><Download size={14} /> Download README.md</button></div>
            <p className="muted small">Create a repository named exactly like your username ({val.github || 'your-username'}) and add this file. It appears on your GitHub profile.</p>
            <pre className="pb-readme">{readme}</pre></div>
          {CK.LINKEDIN_TIPS && <div className="card ic-tipbox"><h3>LinkedIn tips</h3><ul className="small">{CK.LINKEDIN_TIPS.map((t) => <li key={t}>{t}</li>)}</ul></div>}
        </div>
      </div>
    </div>
  );
}

function buildReadme(v, roleName, skills) {
  const G = CK.GITHUB_README || {};
  const vars = {
    ...v, role: roleName, skills3: skills.slice(0, 3).join(', '), projectTech: skills.slice(0, 4).join(', '),
    githubUser: v.github, linkedinUser: String(v.linkedin || '').replace(/^https?:\/\//, '').replace(/^(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, ''),
    projectLink: v.github ? `https://github.com/${v.github}` : '#', portfolio: v.portfolio || '',
  };
  const f = (t) => String(t || '').replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  const full = (t) => [...String(t || '').matchAll(/\{(\w+)\}/g)].every(([, k]) => String(vars[k] ?? '').trim()); // skip lines with empty details
  const out = [f(G.title || '# Hi, I am {name}')];
  if (G.subtitle) out.push(f(G.subtitle).replace(/(\s*\|\s*)+$/g, '').replace(/\|\s+\|/g, '|'));
  out.push('');
  (G.intro || []).forEach((l) => { if (full(l)) out.push(f(l)); });
  [G.learning, G.lookingFor, G.askMe].filter((l) => l && full(l)).forEach((l) => out.push(f(l)));
  if (skills.length) {
    out.push('', f(G.techStackHeading || '## Tech Stack'));
    out.push(skills.map((sk) => (G.badge ? String(G.badge).replace(/\{skill\}/g, sk).replace(/\{skillEncoded\}/g, encodeURIComponent(sk.replace(/-/g, '--'))) : `\`${sk}\``)).join(' '));
  }
  if (v.projectName) out.push('', f(G.projectsHeading || '## Projects'), f(G.projectsTableHeader || '| Project | Description |\n| --- | --- |'), f(G.projectRow || '| {projectName} | {projectImpact} |'));
  if (v.github && G.stats) out.push('', f(G.statsHeading || '## GitHub Stats'), f(G.stats));
  const connect = (G.connect || []).filter((l) => (!/linkedinUser/.test(l) || vars.linkedinUser) && (!/\{email\}/.test(l) || v.email) && (!/\{portfolio\}/.test(l) || vars.portfolio));
  if (connect.length) out.push('', f(G.connectHeading || '## Connect With Me'), ...connect.map(f));
  if (G.footer) out.push('', f(G.footer));
  return out.join('\n');
}
