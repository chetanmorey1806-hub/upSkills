import { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Award, Printer, Download, Code2, Eye, CheckCircle2, Sparkles, Copy, Plus, Trash2, RefreshCw } from 'lucide-react';
import { tracks, trackOrder, trackGroups } from '../data/index.js';
import { codingProblems, javaProjects } from '../data/javaCareer.js';
import { projects as pyProjects } from '../data/projects.js';
import { MERN_PROJECTS } from '../data/mernProjects.js';
import { WEB_PROJECTS } from '../data/webProjects.js';
import { courseCompletion, useStudy, useStudyTick, dayKey, addDays, challengeIndex, solveChallenge, hashText } from '../study.js';
import { useAuth } from '../auth.js';
import RichText, { Inline } from '../components/RichText.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import AiText from '../components/AiText.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { TrackIcon } from '../components/Icons.jsx';
import { downloadFile, esc } from '../components/careerUtils.js';
import { JAVA_LOAD_KEY } from './JavaIDE.jsx';
import ApiKeyBox, { useApiKey } from '../ai/ApiKeyBox.jsx';
import { streamClaude, describeError, stopNote } from '../ai/claudeClient.js';
import { CertPhoto, CertName } from '../components/MediaBits.jsx';

import Ico from '../components/Ico.jsx';
const readLS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

/* ============================== Certificates ============================== */
export function CertificatesPage() {
  useStudyTick();
  const list = trackOrder.filter((k) => tracks[k]?.topics?.length).map((k) => ({ k, t: tracks[k], c: courseCompletion(k, tracks[k].topics) }));
  const earned = list.filter((x) => x.c.eligible);
  const groups = trackGroups.map((g) => ({ ...g, items: list.filter((x) => g.tracks.includes(x.k)) })).filter((g) => g.items.length);
  const seen = new Set();
  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🎓" /> Course Certificates</h1>
        <p className="muted">Complete every lesson of a course and pass its <b>Grand Test</b> (60% or more) in the Test Series to unlock a certificate you can print or save as PDF.</p>
      </div>
      <div className="ts-stats">
        <div className="card"><b>{earned.length}</b><span>Certificates earned</span></div>
        <div className="card"><b>{list.filter((x) => x.c.done === x.c.total).length}</b><span>Courses fully completed</span></div>
        <div className="card"><b>{list.length}</b><span>Courses available</span></div>
      </div>
      {groups.map((g) => {
        const items = g.items.filter((x) => !seen.has(x.k) && seen.add(x.k));
        if (!items.length) return null;
        return (
          <section key={g.key}>
            <h2 className="section-title">{g.name}</h2>
            <div className="grid3">
              {items.map(({ k, t, c }) => (
                <div key={k} className={`card cert-card ${c.eligible ? 'on' : ''}`} style={{ '--c': t.color }}>
                  <div className="ts-course-top"><span className="ts-cicon"><TrackIcon track={k} size={22} /></span><div><h3>{t.name}</h3><div className="muted small">{c.done}/{c.total} lessons · Grand test {c.grand != null ? `${c.grand}%` : 'not taken'}</div></div></div>
                  <ProgressBar value={(c.done / c.total) * 0.8 + ((c.grand ?? 0) >= 60 ? 0.2 : 0)} color={t.color} />
                  {c.eligible ? <Link className="btn primary small" to={`/study/certificate/${k}`}><Award size={15} /> View certificate</Link> : (
                    <div className="row-btns">
                      {c.done < c.total && <Link className="btn small" to={`/track/${k}`}>Continue lessons</Link>}
                      <Link className="btn small" to={`/tools/test-series/${k}?view=lessons`}>{c.grand != null ? 'Retake grand test' : 'Take grand test'}</Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function CertificateView() {
  const { track } = useParams();
  const user = useAuth();
  const t = tracks[track];
  if (!t) return <p>Course not found. <Link to="/study/certificates">All certificates</Link></p>;
  const c = courseCompletion(track, t.topics);
  if (!c.eligible) return <div className="card"><h3>Not unlocked yet</h3><p>Finish all {c.total} lessons ({c.done} done) and pass the grand test (60%+) to unlock this certificate.</p><Link className="btn primary" to="/study/certificates">Back</Link></div>;
  const name = user?.name || 'Student';
  const certId = `UPS-${track.toUpperCase().slice(0, 4)}-${hashText(`${user?.username}|${track}`).toUpperCase().slice(0, 6)}`;
  return (
    <div>
      <div className="row-btns no-print"><Link className="btn" to="/study/certificates">← All certificates</Link><button className="btn primary" onClick={() => window.print()}><Printer size={15} /> Print / Save as PDF</button></div>
      <div className="certificate course-cert" id="certificate">
        <div className="cert-inner">
          <div className="cert-brand">UpSkillr</div><CertPhoto />
          <div className="cert-title">Certificate of Course Completion</div>
          <p>This certifies that</p>
          <div className="cert-name">{name}</div>
          <p>has successfully completed all <b>{c.total} lessons</b> of</p>
          <div className="cert-project">{t.name}</div>
          <p>and passed the course Grand Test with <b>{c.grand}%</b>.</p>
          <div className="cert-foot"><span>Issued {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · ID {certId}</span><span>Developed by ER. Chetan D Morey</span></div>
        </div>
      </div>
    </div>
  );
}

/* ============================== Resume Builder ============================== */
const COURSE_SKILLS = {
  corejava: 'Core Java, OOP', collections: 'Java Collections', advjava: 'JDBC, Servlets, JSP', hibernate: 'Hibernate / JPA', spring: 'Spring Framework', springboot: 'Spring Boot, REST APIs',
  javatech: 'Maven, Git, JUnit, Docker', html: 'HTML5', css: 'CSS3, Flexbox, Grid', js: 'JavaScript (ES6+)', react: 'React', bootstrap: 'Bootstrap', node: 'Node.js, Express',
  python: 'Python', sql: 'SQL', mysql: 'MySQL', django: 'Django', flask: 'Flask', drf: 'Django REST Framework', excel: 'Advanced Excel', powerbi: 'Power BI, DAX', ai: 'Generative AI, Prompt Engineering',
  dotnet: 'C#, ASP.NET Core', mongodb: 'MongoDB', mern: 'MERN Stack',
};
export function autoData(user) {
  const prog = readLS('xlpbi-progress-v1', {});
  const started = trackOrder.filter((k) => (tracks[k]?.topics || []).some((x) => (prog.done || {})[`${k}/${x.id}`]));
  const skills = [...new Set(started.map((k) => COURSE_SKILLS[k] || tracks[k].short).join(', ').split(/,\s*/))];
  const projects = [];
  const push = (title, tech, desc, link) => projects.push({ id: hashText(title), title, tech, desc, link: link || '', include: true });
  WEB_PROJECTS.forEach((p) => { const s = readLS(`upskillr-project-v1:${p.id}`, {}); if (s.submission || s.tests?.results?.length) push(p.title, p.skills.join(', '), p.summary, s.links?.live || s.links?.github); });
  pyProjects.forEach((p) => { const s = readLS(`upskillr-project-v1:${p.id}`, {}); if (s.submission) push(p.title, (p.skills || []).join(', '), p.summary); });
  MERN_PROJECTS.forEach((p) => { const s = readLS(`upskillr-project-v1:mern-${p.id}`, {}); if (s.submission) push(p.title, (p.skills || []).join(', '), p.summary); });
  const jp = readLS('xlpbi-java-projects-v1', {});
  javaProjects.forEach((p) => { const s = jp[p.id]; if (s && Object.values(s.tasks || {}).some(Boolean)) push(p.title, p.stack.join(', '), p.summary, s.sub?.github); });
  const certs = trackOrder.filter((k) => tracks[k]?.topics?.length && courseCompletion(k, tracks[k].topics).eligible).map((k) => `${tracks[k].name} – UpSkillr (${new Date().getFullYear()})`);
  return {
    name: user?.name || '', email: user?.email || '', phone: '', city: '', linkedin: '', github: '', portfolio: '',
    title: started.some((k) => ['corejava', 'springboot'].includes(k)) ? 'Java Full Stack Developer' : started.some((k) => ['react', 'js'].includes(k)) ? 'Frontend / Web Developer' : started.some((k) => k === 'python') ? 'Python Developer' : 'Software Developer (Fresher)',
    summary: '', skills: skills.join(', '), projects, certs: certs.join('\n'),
    education: [{ degree: '', college: '', year: '', score: '' }], experience: '', achievements: '', languages: 'English, Hindi, Marathi',
  };
}
function resumeHtml(r) {
  const line = (a) => a.filter(Boolean).map(esc).join(' | ');
  const list = (txt) => txt.split('\n').map((x) => x.trim()).filter(Boolean);
  const sec = (h, body) => (body ? `<h2>${h}</h2>${body}` : '');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(r.name || 'Resume')} – Resume</title>
<style>body{font-family:Calibri,Arial,Helvetica,sans-serif;color:#111;max-width:780px;margin:24px auto;padding:0 24px;line-height:1.4;font-size:11pt}h1{font-size:22pt;margin:0}h2{font-size:12pt;text-transform:uppercase;letter-spacing:.05em;border-bottom:1.5px solid #333;margin:16px 0 6px;padding-bottom:2px}.c{font-size:10pt}.t{font-size:12pt;margin:2px 0 4px}ul{margin:4px 0 4px 18px;padding:0}li{margin:2px 0}b{font-weight:700}.p{margin:6px 0}@page{margin:14mm}</style></head><body>
<h1>${esc(r.name || 'Your Name')}</h1><div class="t">${esc(r.title)}</div>
<div class="c">${line([r.email, r.phone, r.city])}</div><div class="c">${line([r.linkedin, r.github, r.portfolio])}</div>
${sec('Professional Summary', r.summary ? `<p>${esc(r.summary)}</p>` : '')}
${sec('Technical Skills', r.skills ? `<p>${esc(r.skills)}</p>` : '')}
${sec('Projects', r.projects.filter((p) => p.include && p.title).map((p) => `<div class="p"><b>${esc(p.title)}</b>${p.tech ? ` — <i>${esc(p.tech)}</i>` : ''}${p.link ? ` | ${esc(p.link)}` : ''}<ul>${list(p.desc).map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>`).join(''))}
${sec('Experience / Internship', list(r.experience).length ? `<ul>${list(r.experience).map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '')}
${sec('Education', r.education.filter((e) => e.degree || e.college).map((e) => `<div class="p"><b>${esc(e.degree)}</b>${e.college ? `, ${esc(e.college)}` : ''}${e.year ? ` — ${esc(e.year)}` : ''}${e.score ? ` | ${esc(e.score)}` : ''}</div>`).join(''))}
${sec('Certifications', list(r.certs).length ? `<ul>${list(r.certs).map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '')}
${sec('Achievements', list(r.achievements).length ? `<ul>${list(r.achievements).map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '')}
${sec('Languages', r.languages ? `<p>${esc(r.languages)}</p>` : '')}
</body></html>`;
}
function atsChecks(r) {
  const inc = r.projects.filter((p) => p.include && p.title);
  return [
    ['Name, email and phone', !!(r.name && r.email && r.phone)],
    ['LinkedIn or GitHub link', !!(r.linkedin || r.github)],
    ['Summary of 2–4 lines', r.summary.trim().split(/\s+/).length >= 20],
    ['At least 6 skills', r.skills.split(',').filter((x) => x.trim()).length >= 6],
    ['At least 2 projects', inc.length >= 2],
    ['Every project has 2+ bullet points', inc.length > 0 && inc.every((p) => p.desc.split('\n').filter((x) => x.trim()).length >= 2)],
    ['Education filled in', r.education.some((e) => e.degree && e.college)],
    ['Numbers in bullets (e.g. "8 automated tests", "30% faster")', inc.some((p) => /\d/.test(p.desc))],
  ];
}

export function ResumeBuilder() {
  const user = useAuth();
  const [saved, setSaved] = useStudy('resume', null);
  const r = saved || autoData(user);
  const set = (patch) => setSaved({ ...r, ...patch });
  const setProj = (i, patch) => set({ projects: r.projects.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  const setEdu = (i, patch) => set({ education: r.education.map((e, j) => (j === i ? { ...e, ...patch } : e)) });
  const html = useMemo(() => resumeHtml(r), [r]);
  const checks = atsChecks(r);
  const refill = () => {
    const a = autoData(user);
    const known = new Set(r.projects.map((p) => p.id));
    set({ skills: [...new Set([...r.skills.split(/,\s*/), ...a.skills.split(/,\s*/)].filter(Boolean))].join(', '), projects: [...r.projects, ...a.projects.filter((p) => !known.has(p.id))], certs: [...new Set([...r.certs.split('\n'), ...a.certs.split('\n')].filter(Boolean))].join('\n') });
  };
  const print = () => { const w = window.open('', '_blank'); if (!w) { downloadFile('resume.html', html); return; } w.document.write(html); w.document.close(); setTimeout(() => w.print(), 300); };
  const F = ([k, l, ph]) => <label key={k}>{l}<input className="input" placeholder={ph} value={r[k] || ''} onChange={(e) => set({ [k]: e.target.value })} /></label>;

  return (
    <div>
      <div className="page-head">
        <h1><Ico e="📄" /> Resume Builder</h1>
        <p className="muted">An ATS-friendly one-column resume. Your completed courses, submitted projects and certificates are filled in automatically — edit anything, then print or save as PDF.</p>
        <div className="row-btns">
          <button className="btn primary" onClick={print}><Printer size={15} /> Print / Save as PDF</button>
          <button className="btn" onClick={() => downloadFile(`${(r.name || 'resume').replace(/\s+/g, '-')}-resume.html`, html)}><Download size={15} /> Download HTML</button>
          <button className="btn" onClick={refill}><RefreshCw size={15} /> Add new courses &amp; projects</button>
          {saved && <button className="link-btn danger" onClick={() => window.confirm('Start again from the auto-filled resume? Your edits will be lost.') && setSaved(null)}>Reset</button>}
        </div>
      </div>
      <div className="rb-layout">
        <div className="rb-form">
          <div className="card jc-form"><h3>Personal details</h3><div className="rb-2">{[['name', 'Full name'], ['title', 'Job title', 'Java Full Stack Developer'], ['email', 'Email'], ['phone', 'Phone'], ['city', 'City', 'Pune, Maharashtra'], ['linkedin', 'LinkedIn URL'], ['github', 'GitHub URL'], ['portfolio', 'Portfolio / live site']].map(F)}</div></div>
          <div className="card jc-form"><h3>Professional summary</h3>
            <textarea className="input" rows={4} value={r.summary} onChange={(e) => set({ summary: e.target.value })} placeholder="2–4 lines: who you are, your main skills, the projects you built and the role you want." />
            {!r.summary && <button className="btn small" onClick={() => set({ summary: `Motivated ${r.title.toLowerCase()} with hands-on experience in ${r.skills.split(',').slice(0, 5).join(',').trim() || 'modern technologies'}. Built ${r.projects.filter((p) => p.include).length || 'several'} projects with clean, tested code. Quick learner and team player, looking for an entry-level role to build reliable software.` })}>Suggest a summary</button>}
          </div>
          <div className="card jc-form"><h3>Technical skills</h3><textarea className="input" rows={3} value={r.skills} onChange={(e) => set({ skills: e.target.value })} placeholder="Comma separated" /></div>
          <div className="card jc-form">
            <div className="db-card-head"><h3>Projects</h3><button className="btn small" onClick={() => set({ projects: [...r.projects, { id: Date.now().toString(36), title: '', tech: '', desc: '', link: '', include: true }] })}><Plus size={14} /> Add</button></div>
            {r.projects.length === 0 && <p className="muted small">Submit a final project (Web, Python, MERN or Java) and it appears here, or add one by hand.</p>}
            {r.projects.map((p, i) => (
              <div key={p.id} className="rb-proj">
                <div className="rb-2"><label>Title<input className="input" value={p.title} onChange={(e) => setProj(i, { title: e.target.value })} /></label><label>Tech used<input className="input" value={p.tech} onChange={(e) => setProj(i, { tech: e.target.value })} /></label></div>
                <label>Bullet points (one per line)<textarea className="input" rows={3} value={p.desc} onChange={(e) => setProj(i, { desc: e.target.value })} placeholder={'Built … using …\nImplemented … which …\nAdded … (8 automated tests passing)'} /></label>
                <div className="rb-2"><label>Link<input className="input" value={p.link} onChange={(e) => setProj(i, { link: e.target.value })} /></label>
                  <div className="row-btns"><label className="check"><input type="checkbox" checked={p.include} onChange={(e) => setProj(i, { include: e.target.checked })} /> Show on resume</label><button className="link-btn danger" onClick={() => set({ projects: r.projects.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></div></div>
              </div>
            ))}
          </div>
          <div className="card jc-form">
            <div className="db-card-head"><h3>Education</h3><button className="btn small" onClick={() => set({ education: [...r.education, { degree: '', college: '', year: '', score: '' }] })}><Plus size={14} /> Add</button></div>
            {r.education.map((e, i) => <div key={i} className="rb-2 rb-edu">{[['degree', 'Degree', 'B.E. Computer Engineering'], ['college', 'College / University'], ['year', 'Year', '2025'], ['score', 'CGPA / %', '8.1 CGPA']].map(([k, l, ph]) => <label key={k}>{l}<input className="input" placeholder={ph} value={e[k]} onChange={(ev) => setEdu(i, { [k]: ev.target.value })} /></label>)}</div>)}
          </div>
          <div className="card jc-form"><h3>More</h3>
            <label>Experience / internship (one bullet per line)<textarea className="input" rows={3} value={r.experience} onChange={(e) => set({ experience: e.target.value })} /></label>
            <label>Certifications (one per line)<textarea className="input" rows={3} value={r.certs} onChange={(e) => set({ certs: e.target.value })} /></label>
            <label>Achievements (one per line)<textarea className="input" rows={2} value={r.achievements} onChange={(e) => set({ achievements: e.target.value })} /></label>
            {F(['languages', 'Languages known'])}
          </div>
        </div>
        <div className="rb-side">
          <div className="card"><h3>ATS checklist ({checks.filter((c) => c[1]).length}/{checks.length})</h3>{checks.map(([l, ok]) => <div key={l} className={ok ? 'jc-ok' : 'muted'}>{ok ? <><Ico e="✅" /></> : <><Ico e="⬜" /></>} {l}</div>)}
            <p className="muted small">ATS (Applicant Tracking System) software reads your resume before a recruiter does. Keep one column, standard headings and plain text, as this template does.</p></div>
          <div className="card rb-preview"><div className="db-card-head"><h3>Preview</h3></div><iframe title="Resume preview" srcDoc={html} sandbox="" /></div>
        </div>
      </div>
    </div>
  );
}

/* ============================== Daily Coding Challenge ============================== */
export function DailyChallenge() {
  const nav = useNavigate();
  const [daily] = useStudy('daily', {});
  const [showSol, setShowSol] = useState(false);
  const [hints, setHints] = useState(0);
  const today = dayKey();
  if (!codingProblems.length) return <p className="muted">Coding problems are being added.</p>;
  const p = codingProblems[challengeIndex(today, codingProblems.length)];
  const solvedToday = !!daily[today];
  const coding = readLS('xlpbi-java-results-v1', {}).coding || {};
  const last14 = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  let streak = 0; let d = solvedToday ? today : addDays(today, -1);
  while (daily[d]) { streak++; d = addDays(d, -1); }
  const topics = [...new Set(codingProblems.map((x) => x.topic))].map((t) => ({ t, total: codingProblems.filter((x) => x.topic === t).length, done: codingProblems.filter((x) => x.topic === t && coding[x.id]).length }));
  const open = (code, title) => { try { sessionStorage.setItem(JAVA_LOAD_KEY, JSON.stringify({ files: { 'Main.java': code }, expected: p.expected, title, stdin: p.stdin || '' })); } catch { /* ignore */ } nav('/tools/java-ide'); };
  const markSolved = () => {
    solveChallenge(today, p.id);
    const res = readLS('xlpbi-java-results-v1', { tests: [], interviews: [], coding: {} });
    try { localStorage.setItem('xlpbi-java-results-v1', JSON.stringify({ ...res, coding: { ...(res.coding || {}), [p.id]: true } })); } catch { /* ignore */ }
  };
  return (
    <div>
      <div className="page-head">
        <h1><Ico e="💻" /> Daily Coding Challenge</h1>
        <p className="muted">One interview coding problem every day. Solve it in the Java IDE, compare the output, then mark it solved to keep your streak and earn 20 XP.</p>
      </div>
      <div className="dc-top">
        <div className="card dc-streak"><b><Ico e="🔥" /> {streak}</b><span>day challenge streak</span><div className="dc-days">{last14.map((x) => <i key={x} className={daily[x] ? 'on' : x === today ? 'today' : ''} title={x} />)}</div></div>
        <div className="card dc-streak"><b>{Object.keys(daily).length}</b><span>challenges solved</span></div>
        <div className="card dc-streak"><b>{Object.values(coding).filter(Boolean).length}/{codingProblems.length}</b><span>coding problems solved</span></div>
      </div>
      <div className={`card dc-problem ${solvedToday ? 'done' : ''}`}>
        <div className="meta"><span className="badge"><Ico e="📅" /> {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</span><span className={`lvl lvl-${p.level}`}>{p.level}</span><span>{p.topic}</span>{solvedToday && <span className="badge ok">✓ Solved today</span>}</div>
        <h2>{p.title}</h2>
        <RichText text={p.statement} />
        <div className="grid2" style={{ marginBottom: 0 }}><div><b>Sample input</b><pre className="jc-io">{p.input || '—'}</pre></div><div><b>Sample output</b><pre className="jc-io">{p.output || '—'}</pre></div></div>
        {(p.hints || []).slice(0, hints).map((h, i) => <div key={i} className="tip"><Ico e="💡" /> Hint {i + 1}: <Inline text={h} /></div>)}
        <div className="row-btns">
          <button className="btn primary" onClick={() => open(p.starter, `Daily: ${p.title}`)}><Code2 size={15} /> Solve in Java IDE</button>
          {hints < (p.hints || []).length && <button className="btn" onClick={() => setHints(hints + 1)}>Show hint {hints + 1}</button>}
          <button className="btn" onClick={() => setShowSol(!showSol)}><Eye size={15} /> {showSol ? 'Hide' : 'Show'} solution</button>
          {!solvedToday && <button className="btn success" onClick={markSolved}><CheckCircle2 size={15} /> I solved it</button>}
        </div>
        {showSol && <><CodeBlock code={p.solution} label="Main.java (solution)" /><CodeBlock code={p.expected} label="Expected output" /><div className="card"><b>Approach</b><RichText text={p.explanation} /></div></>}
      </div>
      <h2 className="section-title">DSA topic tracker</h2>
      <div className="dc-topics">{topics.map((x) => <div key={x.t} className="card"><div className="db-part-top"><b>{x.t}</b><span className="muted small">{x.done}/{x.total}</span></div><ProgressBar value={x.done / x.total} /></div>)}</div>
      <p className="muted small">Practise every problem anytime in <Link to="/tools/java-interview">Interview Prep → Coding Round</Link>.</p>
    </div>
  );
}

/* ============================== AI Code Review ============================== */
function codeSources() {
  const out = [];
  const java = readLS('xlpbi-java-ide-v1', null);
  if (java?.files) out.push(['Java IDE', 'Java', Object.entries(java.files).map(([n, c]) => `// ===== ${n} =====\n${c}`).join('\n\n')]);
  const py = readLS('xlpbi-python-ide-v1', null);
  if (py?.files) out.push(['Python IDE', 'Python', Object.entries(py.files).map(([n, c]) => `# ===== ${n} =====\n${c}`).join('\n\n')]);
  const pg = readLS('xlpbi-playground-v1', null);
  if (pg?.web) out.push(['Web Playground', 'HTML/CSS/JavaScript', `<!-- index.html -->\n${pg.web.html || ''}\n\n/* style.css */\n${pg.web.css || ''}\n\n// script.js\n${pg.web.js || ''}`]);
  if (pg?.react?.jsx) out.push(['React Playground', 'React (JSX)', pg.react.jsx]);
  WEB_PROJECTS.forEach((p) => { const s = readLS(`upskillr-project-v1:${p.id}`, {}); if (s.files) out.push([`Web project: ${p.title}`, p.mode === 'react' ? 'React (JSX)' : 'HTML/CSS/JavaScript', p.mode === 'react' ? `${s.files.jsx || ''}\n\n/* style.css */\n${s.files.css || ''}` : `<!-- index.html -->\n${s.files.html || ''}\n\n/* style.css */\n${s.files.css || ''}\n\n// script.js\n${s.files.js || ''}`]); });
  pyProjects.forEach((p) => { const s = readLS(`upskillr-project-v1:${p.id}`, {}); if (s.files) out.push([`Python project: ${p.title}`, 'Python', Object.entries(s.files).map(([n, c]) => `# ===== ${n} =====\n${c}`).join('\n\n')]); });
  return out;
}
const FOCUS = ['Bugs & edge cases', 'Readability & naming', 'Performance', 'Security', 'Best practices', 'Interview readiness'];

export function AiCodeReview() {
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('Java');
  const [focus, setFocus] = useState(['Bugs & edge cases', 'Readability & naming', 'Best practices']);
  const [apiKey, setKey] = useApiKey();
  const [model, setModel] = useState('claude-sonnet-5-5');
  const [effort, setEffort] = useState('medium');
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const ctrl = useRef(null);
  const sources = useMemo(codeSources, []);
  useEffect(() => () => ctrl.current?.abort(), []);

  const system = 'You are a senior software engineer doing a friendly code review for a student or fresher. Be specific and kind. Structure: **Overall** (2 lines + score out of 10), **Bugs / problems** (numbered, with the line or snippet and the fix), **Improvements** (readability, naming, structure, performance, security as relevant), **Improved code** (only the parts that change, in a fenced code block), **What an interviewer would ask about this code** (3 questions). Do not invent problems; if the code is good, say so.';
  const user = `Language: ${lang}\nPlease focus on: ${focus.join(', ')}\n\nCode:\n\`\`\`\n${code.slice(0, 60000)}\n\`\`\``;
  const run = async () => {
    ctrl.current?.abort(); ctrl.current = new AbortController();
    setBusy(true); setOut('');
    try {
      const { message } = await streamClaude({ apiKey, model, effort, system, messages: [{ role: 'user', content: user }], onText: (d) => setOut((x) => x + d), signal: ctrl.current.signal });
      const note = stopNote(message); if (note) setOut((x) => `${x}\n\n_${note}_`);
    } catch (e) { setOut(`${describeError(e)}`); } finally { setBusy(false); }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(`${system}\n\n${user}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } };

  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🤖" /> AI Code Review</h1>
        <p className="muted">Paste your code (or load it from your IDEs and projects) and get a review like a senior developer would give: bugs, improvements, a better version and interview questions about your code.</p>
      </div>
      <div className="card jc-form">
        <div className="quiz-settings">
          {sources.length > 0 && <label>Load my code <select defaultValue="" onChange={(e) => { const s = sources[Number(e.target.value)]; if (s) { setCode(s[2]); setLang(s[1]); } }}><option value="" disabled>Choose…</option>{sources.map((s, i) => <option key={i} value={i}>{s[0]}</option>)}</select></label>}
          <label>Language <select value={lang} onChange={(e) => setLang(e.target.value)}>{['Java', 'Python', 'JavaScript', 'HTML/CSS/JavaScript', 'React (JSX)', 'C#', 'SQL', 'Other'].map((l) => <option key={l}>{l}</option>)}</select></label>
        </div>
        <textarea className="input mono acr-code" rows={14} spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste your code here…" />
        <div className="chips">{FOCUS.map((f) => <button key={f} className={`chip ${focus.includes(f) ? 'active' : ''}`} onClick={() => setFocus((x) => (x.includes(f) ? x.filter((y) => y !== f) : [...x, f]))}>{f}</button>)}</div>
        <ApiKeyBox apiKey={apiKey} setKey={setKey} model={model} setModel={setModel} effort={effort} setEffort={setEffort} compact />
        <div className="row-btns">
          <button className="btn primary" disabled={!apiKey || busy || !code.trim()} onClick={run}><Sparkles size={15} /> {busy ? 'Reviewing…' : 'Review my code'}</button>
          {busy && <button className="btn" onClick={() => ctrl.current?.abort()}>Stop</button>}
          <button className="btn" disabled={!code.trim()} onClick={copy}><Copy size={15} /> {copied ? 'Copied ✓' : 'Copy prompt'}</button>
          <a className="btn" href="https://claude.ai/new" target="_blank" rel="noreferrer">Open Claude.ai</a>
        </div>
        {!apiKey && <p className="muted small">No API key? Use <b>Copy prompt</b> and paste it into Claude.ai, ChatGPT or Gemini.</p>}
      </div>
      {out && <div className="card ai-answer"><AiText text={out} /></div>}
    </div>
  );
}
