import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Play, Printer, Download, Globe, CheckCircle2, Rocket } from 'lucide-react';
import { tracks, trackOrder, topicKey } from '../data/index.js';
import Quiz from '../components/Quiz.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { useAuth } from '../auth.js';
import { useProgress } from '../progress.js';
import { useStudy, studyRead, dayKey, addDays, computeStats, levelOf, courseCompletion, logEvent } from '../study.js';
import { autoData } from './CareerTools.jsx';
import { downloadFile, esc, fmtTime } from '../components/careerUtils.js';

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* ============================== Diagnostic test + adaptive path ============================== */
function modulesOf(k) {
  const mods = [];
  tracks[k].topics.forEach((t) => {
    const name = t.module || 'Lessons';
    let m = mods.find((x) => x.name === name);
    if (!m) mods.push((m = { name, topics: [] }));
    m.topics.push(t);
  });
  return mods;
}

export function DiagnosticTest() {
  const p = useProgress();
  const [results, setResults] = useStudy('upskillr-study-diagnostic', {});
  const courses = trackOrder.filter((k) => tracks[k]?.topics?.some((t) => t.quiz?.length) && modulesOf(k).length >= 2);
  const [course, setCourse] = useState(courses.includes('corejava') ? 'corejava' : courses[0]);
  const [test, setTest] = useState(null);
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!test || test.done || left <= 0) return undefined;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [test, left]);

  const start = () => {
    const mods = modulesOf(course);
    const per = Math.max(1, Math.min(3, Math.floor(24 / mods.length)));
    const qs = mods.flatMap((m) => shuffle(m.topics.flatMap((t) => (t.quiz || []).map((q) => ({ ...q, module: m.name, source: m.name })))).slice(0, per));
    setTest({ course, qs: shuffle(qs), mods: mods.map((m) => m.name) });
    setLeft(20 * 60);
  };
  const finish = (score, total, correct) => {
    const by = {};
    test.qs.forEach((q, i) => { by[q.module] = by[q.module] || { got: 0, n: 0 }; by[q.module].n++; if (correct?.[i]) by[q.module].got++; });
    const modules = test.mods.map((name) => ({ name, pct: by[name] ? Math.round((by[name].got / by[name].n) * 100) : 0 }));
    setResults((r) => ({ ...r, [test.course]: { at: Date.now(), score: Math.round((score / total) * 100), modules } }));
    logEvent('test', { label: 'diagnostic' });
    setTest((t) => ({ ...t, done: true }));
  };
  const r = results[course];
  const mods = course ? modulesOf(course) : [];
  const status = (pct) => (pct >= 80 ? ['skip', 'Already strong — quick revision only'] : pct >= 50 ? ['revise', 'Revise & practise'] : ['learn', 'Learn carefully']);
  const startMod = r ? r.modules.find((m) => m.pct < 80) : null;
  const firstLesson = startMod ? mods.find((m) => m.name === startMod.name)?.topics[0] : null;
  const markStrong = () => {
    if (!window.confirm('Mark every lesson in your strong modules (80%+) as completed?')) return;
    r.modules.filter((m) => m.pct >= 80).forEach((m) => mods.find((x) => x.name === m.name)?.topics.forEach((t) => { const key = topicKey(course, t.id); if (!p.done[key]) p.toggleDone(key); }));
  };

  if (test && !test.done) {
    return (
      <div>
        <div className="row-btns"><button className="btn" onClick={() => setTest(null)}>← Cancel</button><span className={`timer ${left < 120 ? 'low' : ''}`}>{left > 0 ? `⏱ ${fmtTime(left)}` : "⏰ Time's up — submit now"}</span></div>
        <h2>{tracks[test.course].name}: diagnostic test</h2>
        <p className="muted">{test.qs.length} questions from every module. Answer honestly — skip guessing; it only decides where you should start.</p>
        <Quiz questions={test.qs} onFinish={finish} origin={{ label: `Diagnostic · ${tracks[test.course].short}`, kind: 'test' }} />
      </div>
    );
  }
  return (
    <div>
      <div className="page-head">
        <h1>🧭 Diagnostic Test &amp; Learning Path</h1>
        <p className="muted">A 20-minute test with questions from every module of a course. It finds what you already know and builds your personal path: skip strong modules, revise average ones and focus on weak ones.</p>
        <div className="quiz-settings">
          <label>Course <select value={course} onChange={(e) => { setCourse(e.target.value); setTest(null); }}>{courses.map((k) => <option key={k} value={k}>{tracks[k].name}</option>)}</select></label>
          <button className="btn primary" onClick={start}><Play size={15} /> {r ? 'Retake diagnostic' : 'Start diagnostic test'}</button>
        </div>
      </div>
      {r ? (
        <>
          <div className="card dg-head">
            <div><b>Overall: {r.score}%</b><div className="muted small">Taken {new Date(r.at).toLocaleDateString()}</div></div>
            {firstLesson ? <Link className="btn primary" to={`/track/${course}/${firstLesson.id}`}><Target size={15} /> Start here: {startMod.name.replace(/^Module \d+:\s*/, '')}</Link> : <span className="badge ok">All modules strong — take the Grand Test!</span>}
            {r.modules.some((m) => m.pct >= 80) && <button className="btn small" onClick={markStrong}>Mark strong modules as completed</button>}
          </div>
          <h2 className="section-title">Your learning path</h2>
          <div className="dg-path">
            {r.modules.map((m, i) => {
              const [k, label] = status(m.pct);
              const mod = mods.find((x) => x.name === m.name);
              const done = mod ? mod.topics.filter((t) => p.done[topicKey(course, t.id)]).length : 0;
              return (
                <div key={m.name} className={`card dg-step ${k}`}>
                  <span className="dg-n">{i + 1}</span>
                  <div className="dg-body">
                    <div className="db-part-top"><b>{m.name}</b><span className={`badge ${k === 'skip' ? 'ok' : ''}`}>{label}</span></div>
                    <ProgressBar value={m.pct / 100} color={k === 'skip' ? 'var(--ok)' : k === 'revise' ? '#d97706' : 'var(--bad)'} />
                    <div className="muted small">Diagnostic {m.pct}% · {done}/{mod?.topics.length || 0} lessons completed</div>
                  </div>
                  {mod && <Link className="btn small" to={`/track/${course}/${(mod.topics.find((t) => !p.done[topicKey(course, t.id)]) || mod.topics[0]).id}`}>{k === 'skip' ? 'Revise' : 'Open'}</Link>}
                </div>
              );
            })}
          </div>
        </>
      ) : <div className="card empty-state"><Target size={34} /><p>Take the diagnostic test to get your personal learning path for {tracks[course]?.name}.</p></div>}
    </div>
  );
}

/* ============================== Portfolio website generator ============================== */
const THEMES = {
  gradient: { name: 'Modern Gradient', bg: '#0b1020', card: 'rgba(255,255,255,.06)', text: '#e8ecf6', muted: '#a3acc2', border: 'rgba(255,255,255,.12)' },
  light: { name: 'Clean Light', bg: '#f7f8fc', card: '#ffffff', text: '#1d2433', muted: '#5d6679', border: '#e3e7ef' },
  dark: { name: 'Developer Dark', bg: '#0d1117', card: '#161b22', text: '#e6edf3', muted: '#8b949e', border: '#30363d' },
};
function portfolioHtml(d) {
  const th = THEMES[d.theme] || THEMES.gradient;
  const a = d.accent || '#6366f1';
  const skills = d.skills.split(',').map((s) => s.trim()).filter(Boolean);
  const projects = d.projects.filter((p) => p.include && p.title);
  const certs = d.certs.split('\n').map((s) => s.trim()).filter(Boolean);
  const initials = (d.name || 'Me').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.name || 'My Portfolio')} – ${esc(d.title)}</title><meta name="description" content="${esc(d.tagline)}">
<style>
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;background:${th.bg};color:${th.text};line-height:1.6}
a{color:${a};text-decoration:none}.wrap{max-width:1040px;margin:0 auto;padding:0 20px}
nav{position:sticky;top:0;z-index:10;backdrop-filter:blur(12px);background:color-mix(in srgb,${th.bg} 80%,transparent);border-bottom:1px solid ${th.border}}
nav .wrap{display:flex;justify-content:space-between;align-items:center;height:64px}nav b{font-size:1.1rem}nav .links a{margin-left:20px;color:${th.muted};font-weight:500}nav .links a:hover{color:${a}}
.hero{padding:96px 0 72px;position:relative;overflow:hidden}.hero:before{content:"";position:absolute;width:420px;height:420px;border-radius:50%;background:${a};filter:blur(120px);opacity:.25;top:-140px;right:-80px;animation:float 12s ease-in-out infinite}
.ava{width:92px;height:92px;border-radius:28px;display:grid;place-items:center;font-size:2rem;font-weight:800;color:#fff;background:linear-gradient(135deg,${a},#06b6d4);box-shadow:0 20px 40px -18px ${a}}
h1{font-size:clamp(2.2rem,6vw,3.6rem);margin:20px 0 6px;letter-spacing:-.03em;line-height:1.1}.role{font-size:1.25rem;color:${a};font-weight:700}.tag{max-width:640px;color:${th.muted};font-size:1.1rem}
.btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.btn{padding:12px 20px;border-radius:12px;font-weight:700;border:1px solid ${th.border};color:${th.text}}.btn.p{background:${a};color:#fff;border-color:${a}}.btn:hover{transform:translateY(-2px)}
section{padding:56px 0}h2{font-size:1.7rem;margin:0 0 20px}h2:after{content:"";display:block;width:48px;height:4px;border-radius:4px;background:${a};margin-top:8px}
.chips{display:flex;flex-wrap:wrap;gap:10px}.chip{padding:8px 14px;border-radius:99px;background:${th.card};border:1px solid ${th.border};font-weight:600;font-size:.92rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}.card{padding:22px;border-radius:18px;background:${th.card};border:1px solid ${th.border};transition:transform .3s,border-color .3s}.card:hover{transform:translateY(-6px);border-color:${a}}
.card h3{margin:0 0 6px}.tech{color:${a};font-size:.85rem;font-weight:600}.card ul{padding-left:18px;color:${th.muted};margin:10px 0}.muted{color:${th.muted}}
.rv{opacity:0;transform:translateY(24px);transition:opacity .7s,transform .7s}.rv.in{opacity:1;transform:none}
footer{padding:32px 0;text-align:center;color:${th.muted};border-top:1px solid ${th.border}}@keyframes float{50%{transform:translate(-30px,30px)}}
@media(max-width:640px){nav .links{display:none}.hero{padding:64px 0 48px}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.rv{opacity:1;transform:none}}
</style></head><body>
<nav><div class="wrap"><b>${esc(d.name || 'Portfolio')}</b><div class="links"><a href="#about">About</a><a href="#skills">Skills</a><a href="#projects">Projects</a>${certs.length ? '<a href="#certs">Certifications</a>' : ''}<a href="#contact">Contact</a></div></div></nav>
<header class="hero"><div class="wrap"><div class="ava">${esc(initials)}</div><h1>Hi, I'm ${esc(d.name || 'your name')}</h1><div class="role">${esc(d.title)}</div><p class="tag">${esc(d.tagline)}</p>
<div class="btns"><a class="btn p" href="#projects">View my projects</a>${d.email ? `<a class="btn" href="mailto:${esc(d.email)}">Email me</a>` : ''}${d.resumeUrl ? `<a class="btn" href="${esc(d.resumeUrl)}">Resume</a>` : ''}</div></div></header>
<section id="about"><div class="wrap rv"><h2>About me</h2><p class="tag">${esc(d.about)}</p></div></section>
${skills.length ? `<section id="skills"><div class="wrap rv"><h2>Skills</h2><div class="chips">${skills.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div></div></section>` : ''}
<section id="projects"><div class="wrap"><h2 class="rv">Projects</h2><div class="grid">${projects.map((p) => `<article class="card rv"><h3>${esc(p.title)}</h3>${p.tech ? `<div class="tech">${esc(p.tech)}</div>` : ''}<ul>${p.desc.split('\n').filter((x) => x.trim()).map((x) => `<li>${esc(x.trim())}</li>`).join('')}</ul>${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">View project →</a>` : ''}</article>`).join('') || '<p class="muted">Projects coming soon.</p>'}</div></div></section>
${certs.length ? `<section id="certs"><div class="wrap rv"><h2>Certifications</h2><ul>${certs.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div></section>` : ''}
<section id="contact"><div class="wrap rv"><h2>Contact</h2><p class="tag">Open to entry-level roles and internships. Let's talk!</p><div class="btns">${d.email ? `<a class="btn p" href="mailto:${esc(d.email)}">${esc(d.email)}</a>` : ''}${d.linkedin ? `<a class="btn" href="${esc(d.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ''}${d.github ? `<a class="btn" href="${esc(d.github)}" target="_blank" rel="noopener">GitHub</a>` : ''}</div></div></section>
<footer>© ${new Date().getFullYear()} ${esc(d.name)} · Built with UpSkillr</footer>
<script>var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1});document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});</script>
</body></html>`;
}

export function PortfolioBuilder() {
  const user = useAuth();
  const [saved, setSaved] = useStudy('upskillr-study-portfolio', null);
  const base = useMemo(() => {
    const r = studyRead('upskillr-study-resume', null) || autoData(user);
    return {
      name: r.name || user?.name || '', title: r.title, email: r.email, github: r.github, linkedin: r.linkedin, resumeUrl: '',
      tagline: r.summary ? r.summary.split('.')[0] + '.' : `I build clean, responsive and reliable software with ${r.skills.split(',').slice(0, 3).join(',').trim() || 'modern tools'}.`,
      about: r.summary || 'I am a fresher who loves turning ideas into working software. I learn by building projects and I enjoy solving problems step by step.',
      skills: r.skills, projects: r.projects, certs: r.certs, theme: 'gradient', accent: '#6366f1',
    };
  }, [user]);
  const d = saved || base;
  const set = (patch) => setSaved({ ...d, ...patch });
  const html = useMemo(() => portfolioHtml(d), [d]);
  const F = (k, l, ph) => <label key={k}>{l}<input className="input" placeholder={ph} value={d[k] || ''} onChange={(e) => set({ [k]: e.target.value })} /></label>;
  return (
    <div>
      <div className="page-head">
        <h1>🌐 Portfolio Website Generator</h1>
        <p className="muted">One click turns your resume, projects and certificates into an animated, responsive portfolio website. Download one <code className="ic">index.html</code> and publish it free on GitHub Pages or Netlify.</p>
        <div className="row-btns">
          <button className="btn primary" onClick={() => downloadFile('index.html', html)}><Download size={15} /> Download index.html</button>
          <button className="btn" onClick={() => { const w = window.open('', '_blank'); if (w) { w.document.write(html); w.document.close(); } }}><Globe size={15} /> Open full preview</button>
          {saved && <button className="link-btn danger" onClick={() => window.confirm('Reset to your resume data?') && setSaved(null)}>Reset from resume</button>}
        </div>
      </div>
      <div className="rb-layout">
        <div className="rb-form">
          <div className="card jc-form"><h3>Design</h3>
            <div className="chips">{Object.entries(THEMES).map(([k, t]) => <button key={k} className={`chip ${d.theme === k ? 'active' : ''}`} onClick={() => set({ theme: k })}>{t.name}</button>)}</div>
            <label>Accent colour <input type="color" value={d.accent} onChange={(e) => set({ accent: e.target.value })} /></label>
          </div>
          <div className="card jc-form"><h3>About you</h3><div className="rb-2">{F('name', 'Name')}{F('title', 'Role / title')}{F('email', 'Email')}{F('github', 'GitHub URL')}{F('linkedin', 'LinkedIn URL')}{F('resumeUrl', 'Resume link (optional)')}</div>
            <label>Tagline (one line)<input className="input" value={d.tagline} onChange={(e) => set({ tagline: e.target.value })} /></label>
            <label>About me<textarea className="input" rows={4} value={d.about} onChange={(e) => set({ about: e.target.value })} /></label>
            <label>Skills (comma separated)<textarea className="input" rows={2} value={d.skills} onChange={(e) => set({ skills: e.target.value })} /></label>
            <label>Certifications (one per line)<textarea className="input" rows={3} value={d.certs} onChange={(e) => set({ certs: e.target.value })} /></label>
            <p className="muted small">Projects come from your <Link to="/study/resume">Resume Builder</Link> ({d.projects.filter((p) => p.include).length} included). Edit them there, then click Reset from resume.</p>
          </div>
          <div className="card"><h3><Rocket size={17} /> Publish free on GitHub Pages</h3><ol className="small">
            <li>Create a GitHub repository named <code className="ic">yourusername.github.io</code>.</li>
            <li>Upload the downloaded <code className="ic">index.html</code> (Add file → Upload files → Commit).</li>
            <li>Open Settings → Pages → Branch: <b>main</b> → Save.</li>
            <li>After a minute your site is live at <code className="ic">https://yourusername.github.io</code>. Add this link to your resume and LinkedIn.</li>
          </ol><p className="muted small">Netlify alternative: drag the file onto app.netlify.com/drop.</p></div>
        </div>
        <div className="rb-side"><div className="card rb-preview"><h3>Live preview</h3><iframe title="Portfolio preview" srcDoc={html} sandbox="allow-scripts" /></div></div>
      </div>
    </div>
  );
}

/* ============================== Weekly progress report ============================== */
export function WeeklyReport() {
  const user = useAuth();
  const [weekOff, setWeekOff] = useState(0);
  const end = addDays(dayKey(), -7 * weekOff);
  const start = addDays(end, -6);
  const inRange = (d) => d >= start && d <= end;
  const log = studyRead('upskillr-study-log', []).filter((e) => inRange(e.day));
  const count = (t) => log.filter((e) => e.type === t).length;
  const focus = log.filter((e) => e.type === 'focus').reduce((s, e) => s + (e.minutes || 0), 0);
  const tests = (studyRead('upskillr-tests-v1', {}).history || []).filter((h) => inRange(dayKey(new Date(h.at))));
  const testAvg = tests.length ? Math.round(tests.reduce((s, h) => s + h.pct, 0) / tests.length) : null;
  const quizEv = log.filter((e) => (e.type === 'quiz' || e.type === 'test') && e.total);
  const accuracy = quizEv.length ? Math.round((quizEv.reduce((s, e) => s + (e.total - e.wrong), 0) / quizEv.reduce((s, e) => s + e.total, 0)) * 100) : null;
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const perDay = days.map((d) => ({ d, n: log.filter((e) => e.day === d).length }));
  const activeDays = perDay.filter((x) => x.n > 0).length;
  const mistakes = Object.values(studyRead('upskillr-study-mistakes', {}));
  const weak = Object.entries(mistakes.reduce((m, x) => { m[x.source] = (m[x.source] || 0) + x.times; return m; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const s = computeStats();
  const lv = levelOf(s.xp);
  const prog = studyRead('xlpbi-progress-v1', {});
  const courses = trackOrder.filter((k) => tracks[k]?.topics?.some((t) => (prog.done || {})[`${k}/${t.id}`])).map((k) => ({ k, ...courseCompletion(k, tracks[k].topics) }));
  const max = Math.max(1, ...perDay.map((x) => x.n));
  const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const tiles = [['📘', count('lesson'), 'Lessons completed'], ['🏆', count('quiz') + count('test'), 'Quizzes & tests'], ['🎯', accuracy != null ? `${accuracy}%` : '–', 'Answer accuracy'], ['⏱', `${focus} min`, 'Focus time'], ['🔁', count('review'), 'Revision cards'], ['💻', count('challenge') + count('puzzle'), 'Coding challenges & puzzles'], ['📅', `${activeDays}/7`, 'Active days'], ['🔥', s.streak, 'Current streak']];
  return (
    <div className="wr">
      <div className="page-head no-print">
        <h1>📊 Weekly Progress Report</h1>
        <p className="muted">A one-page summary of the week for you, your parents or your teacher. Print it or save it as PDF.</p>
        <div className="row-btns">
          <button className="btn" onClick={() => setWeekOff(weekOff + 1)}>← Previous week</button>
          <button className="btn" disabled={weekOff === 0} onClick={() => setWeekOff(Math.max(0, weekOff - 1))}>Next week →</button>
          <button className="btn primary" onClick={() => window.print()}><Printer size={15} /> Print / Save as PDF</button>
        </div>
      </div>
      <div className="card wr-sheet">
        <div className="wr-top">
          <div><div className="cert-brand">UpSkillr</div><h2>Weekly Progress Report</h2><div className="muted">{user?.name || 'Student'} · {fmt(start)} – {fmt(end)}</div></div>
          <div className="wr-lv"><b>Level {lv.level}</b><span>{lv.name} · {s.xp} XP</span></div>
        </div>
        <div className="wr-tiles">{tiles.map(([i, v, l]) => <div key={l}><span>{i}</span><b>{v}</b><small>{l}</small></div>)}</div>
        <h3>Daily activity</h3>
        <div className="wr-bars">{perDay.map((x) => <div key={x.d}><i style={{ height: `${(x.n / max) * 100}%` }} title={`${x.n} activities`} /><span>{new Date(`${x.d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' })}</span><small>{x.n}</small></div>)}</div>
        <div className="grid2">
          <div>
            <h3>Test series this week</h3>
            {tests.length ? <><p>{tests.length} attempts · average <b>{testAvg}%</b></p><ul className="small">{tests.slice(0, 6).map((h, i) => <li key={i}>{h.label}: {h.pct}%</li>)}</ul></> : <p className="muted">No test series attempts this week.</p>}
          </div>
          <div>
            <h3>Topics to focus on</h3>
            {weak.length ? <ul className="small">{weak.map(([src, n]) => <li key={src}>{src} <span className="muted">({n} mistakes)</span></li>)}</ul> : <p className="muted">No open mistakes. 🎉</p>}
          </div>
        </div>
        <h3>Course progress</h3>
        {courses.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Course</th><th>Lessons</th><th>Progress</th><th>Grand test</th></tr></thead><tbody>
          {courses.map((c) => <tr key={c.k}><td>{tracks[c.k].name}</td><td>{c.done}/{c.total}</td><td>{Math.round((c.done / c.total) * 100)}%</td><td>{c.grand != null ? `${c.grand}%` : '–'}</td></tr>)}
        </tbody></table></div> : <p className="muted">No course started yet.</p>}
        <div className="wr-note">
          <b>Teacher / parent remark:</b>
          <div className="wr-line" /><div className="wr-line" />
        </div>
        <div className="cert-foot"><span>Generated {new Date().toLocaleDateString()}</span><span>Developed by ER. Chetan D Morey</span></div>
      </div>
      <p className="muted small no-print"><CheckCircle2 size={13} /> Counts come from activity in this browser (lessons marked complete, quizzes, tests, focus sessions, revision and challenges).</p>
    </div>
  );
}
