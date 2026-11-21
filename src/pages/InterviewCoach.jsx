// Interview Coach: five practice tools for freshers.
//  1. Interview Phrases (Marathi / Hindi -> professional English)
//  2. Explain-your-project builder (1-min & 3-min pitch + follow-up questions)
//  3. JAM / extempore speaking with speech analysis
//  4. Situational & managerial round practice
//  5. Company-wise HR round guides
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import {
  Languages, Presentation, Mic, Scale, Building2, Volume2, Shuffle, CheckCircle2, XCircle, Star, Search, Timer, Download, RotateCcw, ArrowRight, Lightbulb, MicOff, ListChecks,
  Headphones, Users, SpellCheck, CalendarCheck, BriefcaseBusiness,
} from 'lucide-react';
import { useStudy } from '../study.js';
import { useSpeech, speak, stopSpeaking } from '../components/useSpeech.js';
import { analyzeSpeech, downloadFile } from '../components/careerUtils.js';
import { fillerWords } from '../data/javaCareer.js';

const pick = (glob, name, fb) => { const m = Object.values(glob)[0]; return (m && m[name]) || fb; };
const phrasesMod = import.meta.glob('../data/coach/phrases.js', { eager: true });
const sitMod = import.meta.glob('../data/coach/situational.js', { eager: true });
const jamMod = import.meta.glob('../data/coach/jamTopics.js', { eager: true });
const hrMod = import.meta.glob('../data/coach/companyHR.js', { eager: true });
const pitchMod = import.meta.glob('../data/coach/projectPitch.js', { eager: true });
const PHRASE_CATEGORIES = pick(phrasesMod, 'PHRASE_CATEGORIES', []);
const PHRASES = pick(phrasesMod, 'PHRASES', []);
const SITUATION_CATEGORIES = pick(sitMod, 'SITUATION_CATEGORIES', []);
const SITUATIONS = pick(sitMod, 'SITUATIONS', []);
const JAM_CATEGORIES = pick(jamMod, 'JAM_CATEGORIES', []);
const JAM_TOPICS = pick(jamMod, 'JAM_TOPICS', []);
const COMPANY_HR = pick(hrMod, 'COMPANY_HR', {});
const PITCH_TECH = pick(pitchMod, 'PITCH_TECH', []);
const GENERIC_PROJECT_QUESTIONS = pick(pitchMod, 'GENERIC_PROJECT_QUESTIONS', []);
const ROLE_QUESTIONS = pick(pitchMod, 'ROLE_QUESTIONS', []);

const TOOLS = [
  { to: '/tools/interview-phrases', label: 'Interview Phrases', icon: Languages },
  { to: '/tools/project-pitch', label: 'Explain Your Project', icon: Presentation },
  { to: '/tools/jam', label: 'JAM / Extempore', icon: Mic },
  { to: '/tools/situational', label: 'Situational Round', icon: Scale },
  { to: '/tools/company-hr', label: 'Company HR Rounds', icon: Building2 },
  { to: '/tools/versant', label: 'Versant / Communication Test', icon: Headphones },
  { to: '/tools/gd-topics', label: 'GD Topics 2026', icon: Users },
  { to: '/tools/english-mistakes', label: 'Common English Mistakes', icon: SpellCheck },
  { to: '/tools/interview-day', label: 'Interview Day Kit', icon: CalendarCheck },
  { to: '/tools/first-job', label: 'First Job Skills', icon: BriefcaseBusiness },
];

export function CoachNav() {
  return (
    <div className="ic-nav">
      {TOOLS.map(({ to, label, icon: I }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `chip ${isActive ? 'active' : ''}`}><I size={15} /> {label}</NavLink>
      ))}
    </div>
  );
}

export const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const STOP = new Set('a an the is am are was were be to of in on at for and or but i my me it this that with as by from you your we our will would can could do does did have has had so very please'.split(' '));
const words = (s) => (String(s || '').toLowerCase().match(/[a-z']+/g) || []).filter((w) => !STOP.has(w));
// How much of the target's meaning words appear in the answer (0..1); best over all accepted versions.
export function similarity(answer, targets) {
  const a = new Set(words(answer));
  return Math.max(0, ...targets.filter(Boolean).map((t) => { const tw = [...new Set(words(t.replace(/\.\.\./g, '')))]; return tw.length ? tw.filter((w) => a.has(w)).length / tw.length : 0; }));
}

export function SpeakBtn({ text, label = 'Listen' }) {
  return <button type="button" className="btn small" onClick={() => speak(text, 0.95)}><Volume2 size={14} /> {label}</button>;
}

export function MicBox({ value, onChange, placeholder = 'Type your answer, or press the mic and speak…', rows = 3 }) {
  const sp = useSpeech({ onText: (t) => onChange((v) => `${v ? `${v} ` : ''}${t}`) });
  return (
    <div className="ic-mic">
      <textarea className="input" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(() => e.target.value)} />
      <div className="row-btns">
        {sp.supported && <button type="button" className={`btn small ${sp.listening ? 'danger' : ''}`} onClick={sp.toggle}>{sp.listening ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Speak</>}</button>}
        {sp.listening && <span className="muted small ic-live">Listening… {sp.interim}</span>}
        {sp.error && <span className="muted small">{sp.error}</span>}
      </div>
    </div>
  );
}

export function Empty({ what }) {
  return <div className="card muted">The {what} content is being prepared. Please check again soon.</div>;
}

/* ================================ 1. Interview Phrases ================================ */
export function InterviewPhrases() {
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [lang, setLang] = useState('mr');
  const [mode, setMode] = useState('browse');
  const [learned, setLearned] = useStudy('upskillr-coach-phrases', {});
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return PHRASES.filter((p) => (cat === 'all' || p.cat === cat) && (!s || [p.en, p.mr, p.hi, ...(p.alt || [])].join(' ').toLowerCase().includes(s)));
  }, [cat, q]);
  const nLearned = Object.keys(learned).filter((k) => learned[k]).length;
  const toggle = (id) => setLearned((m) => ({ ...m, [id]: !m[id] }));

  return (
    <div className="ic-page">
      <div className="page-head">
        <h1><Languages size={28} className="ico" /> Interview Phrases</h1>
        <p className="muted">You know what to say in Marathi or Hindi, but not how to say it in professional English? Find the sentence here, listen to it, practise saying it, and avoid the common mistakes.</p>
      </div>
      <CoachNav />
      {!PHRASES.length ? <Empty what="phrase" /> : (
        <>
          <div className="ic-stats">
            <div className="card"><b>{PHRASES.length}</b><span>Phrases</span></div>
            <div className="card"><b>{PHRASE_CATEGORIES.length}</b><span>Situations</span></div>
            <div className="card"><b>{nLearned}</b><span>Marked as learned</span></div>
          </div>
          <div className="ic-toolbar">
            <div className="ic-seg">
              <button className={`chip ${mode === 'browse' ? 'active' : ''}`} onClick={() => setMode('browse')}><ListChecks size={14} /> Learn</button>
              <button className={`chip ${mode === 'practice' ? 'active' : ''}`} onClick={() => setMode('practice')}><Mic size={14} /> Practise</button>
            </div>
            <div className="ic-seg">
              <button className={`chip ${lang === 'mr' ? 'active' : ''}`} onClick={() => setLang('mr')}>मराठी</button>
              <button className={`chip ${lang === 'hi' ? 'active' : ''}`} onClick={() => setLang('hi')}>हिंदी</button>
            </div>
            <select className="input ic-sel" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="all">All situations</option>
              {PHRASE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {mode === 'browse' && <label className="ic-search"><Search size={15} /><input className="input" placeholder="Search in English, मराठी or हिंदी" value={q} onChange={(e) => setQ(e.target.value)} /></label>}
          </div>
          {mode === 'browse' ? (
            <div className="ic-phrases">
              {cat !== 'all' && <p className="muted small">{PHRASE_CATEGORIES.find((c) => c.id === cat)?.about}</p>}
              {list.map((p) => (
                <div key={p.id} className={`card ic-phrase ${learned[p.id] ? 'done' : ''}`}>
                  <div className="ic-src">{lang === 'mr' ? p.mr : p.hi}</div>
                  <div className="ic-en"><ArrowRight size={16} /> <b>{p.en}</b></div>
                  {p.alt?.length > 0 && <div className="muted small">Also: {p.alt.join('  /  ')}</div>}
                  {p.wrong && <div className="ic-wrong"><XCircle size={14} /> Avoid: <s>{p.wrong}</s></div>}
                  {p.tip && <div className="ic-tip"><Lightbulb size={14} /> {p.tip}</div>}
                  <div className="row-btns">
                    <SpeakBtn text={p.en} />
                    <button className={`btn small ${learned[p.id] ? 'ok' : ''}`} onClick={() => toggle(p.id)}><Star size={14} /> {learned[p.id] ? 'Learned' : 'Mark learned'}</button>
                  </div>
                </div>
              ))}
              {!list.length && <div className="card muted">No phrase matches your search.</div>}
            </div>
          ) : <PhrasePractice cat={cat} lang={lang} onLearn={(id) => setLearned((m) => ({ ...m, [id]: true }))} />}
        </>
      )}
    </div>
  );
}

function PhrasePractice({ cat, lang, onLearn }) {
  const pool = useMemo(() => shuffle(PHRASES.filter((p) => cat === 'all' || p.cat === cat)), [cat]);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState('');
  const [res, setRes] = useState(null);
  const [score, setScore] = useState({ good: 0, total: 0 });
  useEffect(() => { setI(0); setAns(''); setRes(null); setScore({ good: 0, total: 0 }); }, [cat]);
  const p = pool[i % Math.max(1, pool.length)];
  if (!p) return null;
  const check = () => {
    const s = similarity(ans, [p.en, ...(p.alt || [])]);
    const v = s >= 0.7 ? 'good' : s >= 0.45 ? 'close' : 'again';
    setRes({ s, v });
    setScore((x) => ({ good: x.good + (v === 'good' ? 1 : 0), total: x.total + 1 }));
    if (v === 'good') onLearn(p.id);
  };
  const next = () => { setI((x) => x + 1); setAns(''); setRes(null); stopSpeaking(); };
  return (
    <div className="card ic-practice">
      <div className="ic-practice-top"><span className="badge">{PHRASE_CATEGORIES.find((c) => c.id === p.cat)?.name}</span><span className="muted small">Score {score.good}/{score.total}</span></div>
      <p className="muted small">Say this in professional English:</p>
      <div className="ic-src big">{lang === 'mr' ? p.mr : p.hi}</div>
      <MicBox value={ans} onChange={setAns} placeholder="Type or speak the English sentence…" rows={2} />
      <div className="row-btns">
        <button className="btn primary" disabled={!ans.trim() || !!res} onClick={check}>Check</button>
        <button className="btn" onClick={next}><Shuffle size={14} /> Next</button>
      </div>
      {res && (
        <div className={`ic-result ${res.v}`}>
          <b>{res.v === 'good' ? <><CheckCircle2 size={16} /> Great, that works.</> : res.v === 'close' ? <><Lightbulb size={16} /> Close. Compare with the best version.</> : <><XCircle size={16} /> Not yet. Learn the best version and try again.</>}</b>
          <div className="ic-en"><ArrowRight size={16} /> <b>{p.en}</b> <SpeakBtn text={p.en} /></div>
          {p.alt?.length > 0 && <div className="muted small">Also correct: {p.alt.join('  /  ')}</div>}
          {p.wrong && <div className="ic-wrong"><XCircle size={14} /> Avoid: <s>{p.wrong}</s></div>}
          {p.tip && <div className="ic-tip"><Lightbulb size={14} /> {p.tip}</div>}
        </div>
      )}
    </div>
  );
}

/* ================================ 2. Explain Your Project ================================ */
const EMPTY_PROJECT = { title: '', problem: '', users: '', tech: '', features: '', role: '', team: '1', challenge: '', solution: '', result: '', future: '' };
const lines = (s) => String(s || '').split(/\n|;/).map((x) => x.trim()).filter(Boolean);
const joinList = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
const lc1 = (s) => String(s || '').trim().replace(/\.$/, '').replace(/^[A-Z](?![A-Z])/, (c) => c.toLowerCase());

function buildPitch(p) {
  const tech = p.tech.split(/,|\//).map((x) => x.trim()).filter(Boolean);
  const feats = lines(p.features);
  const team = Number(p.team) > 1;
  const short = [
    `My project is ${p.title || 'my project'}.`,
    p.problem && `It solves a real problem: ${lc1(p.problem)}.`,
    p.users && `It is meant for ${lc1(p.users)}.`,
    tech.length && `I built it using ${joinList(tech)}.`,
    feats.length && `The main features are ${joinList(feats.slice(0, 3).map(lc1))}.`,
    team ? (p.role && `We were a team of ${p.team}, and my role was ${lc1(p.role)}.`) : 'I built it individually, from design to deployment.',
    p.challenge && `The biggest challenge was ${lc1(p.challenge)}${p.solution ? `, and I solved it by ${lc1(p.solution)}` : ''}.`,
    p.result && `As a result, ${lc1(p.result)}.`,
  ].filter(Boolean).join(' ');
  const long = [
    ['Introduction', `Thank you for asking. My project is called ${p.title || 'my project'}.${p.problem ? ` The idea came from a real problem: ${lc1(p.problem)}.` : ''}${p.users ? ` The target users are ${lc1(p.users)}.` : ''}`],
    tech.length && ['Technology', `I used ${joinList(tech)}. I chose these because they are widely used in industry, they have good documentation, and they fit the requirements of the project.`],
    feats.length && ['Features', `The application has ${feats.length} main feature${feats.length > 1 ? 's' : ''}. ${feats.map((f, k) => `${['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'][k] || 'Also'}, ${lc1(f)}.`).join(' ')}`],
    ['My role', team ? `We were a team of ${p.team} members.${p.role ? ` My responsibility was ${lc1(p.role)}.` : ''} We divided the work into modules, used Git for version control and met regularly to review progress.` : 'This was an individual project, so I handled the complete cycle: requirement analysis, design, development, testing and deployment.'],
    p.challenge && ['Challenge', `The most difficult part was ${lc1(p.challenge)}.${p.solution ? ` I solved it by ${lc1(p.solution)}.` : ''} This taught me how to debug step by step and read documentation carefully.`],
    p.result && ['Result', `${p.result.trim().replace(/\.$/, '')}.`],
    ['Learning and future scope', `This project improved my practical knowledge of ${tech.length ? joinList(tech.slice(0, 3)) : 'the technologies I used'} and taught me how a real application is planned and built.${p.future ? ` In the future, I would like to ${lc1(p.future)}.` : ''}`],
  ].filter(Boolean);
  return { short, long };
}

function projectQuestions(p) {
  const text = ` ${`${p.tech} ${p.title} ${p.features}`.toLowerCase()} `;
  const techs = PITCH_TECH.filter((t) => (t.match || []).some((m) => new RegExp(`(^|[^a-z0-9])${m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(text)));
  const groups = techs.map((t) => ({ name: t.name, questions: t.questions }));
  groups.push({ name: 'About the project', questions: GENERIC_PROJECT_QUESTIONS });
  if (Number(p.team) > 1) groups.push({ name: 'Team and your role', questions: ROLE_QUESTIONS });
  return groups.filter((g) => g.questions?.length);
}

export function ProjectPitch() {
  const [p, setP] = useStudy('upskillr-coach-project', EMPTY_PROJECT);
  const [view, setView] = useState('form');
  const pr = { ...EMPTY_PROJECT, ...p };
  const set = (k) => (e) => setP((x) => ({ ...EMPTY_PROJECT, ...x, [k]: e.target.value }));
  const ready = pr.title.trim() && pr.tech.trim() && lines(pr.features).length;
  const pitch = useMemo(() => buildPitch(pr), [JSON.stringify(pr)]); // eslint-disable-line react-hooks/exhaustive-deps
  const groups = useMemo(() => projectQuestions(pr), [pr.tech, pr.title, pr.features, pr.team]); // eslint-disable-line react-hooks/exhaustive-deps
  const longText = pitch.long.map(([h, t]) => `${h}\n${t}`).join('\n\n');
  const F = ({ k, label, ph, area }) => (
    <label className="field">{label}{area ? <textarea className="input" rows={3} value={pr[k]} placeholder={ph} onChange={set(k)} /> : <input className="input" value={pr[k]} placeholder={ph} onChange={set(k)} />}</label>
  );
  return (
    <div className="ic-page">
      <div className="page-head">
        <h1><Presentation size={28} className="ico" /> Explain Your Project</h1>
        <p className="muted">"Tell me about your project" comes in almost every fresher interview. Fill in your project details once, and get a 1-minute answer, a 3-minute answer and the follow-up questions interviewers ask about your technologies.</p>
      </div>
      <CoachNav />
      <div className="tabs">
        <button className={`tab ${view === 'form' ? 'active' : ''}`} onClick={() => setView('form')}>1. Project details</button>
        <button className={`tab ${view === 'pitch' ? 'active' : ''}`} disabled={!ready} onClick={() => setView('pitch')}>2. My answers</button>
        <button className={`tab ${view === 'qs' ? 'active' : ''}`} disabled={!ready} onClick={() => setView('qs')}>3. Follow-up questions</button>
      </div>
      {view === 'form' && (
        <div className="card ic-form">
          {F({ k: 'title', label: 'Project title *', ph: 'e.g. Smart Attendance System using Face Recognition' })}
          {F({ k: 'problem', label: 'What problem does it solve?', ph: 'e.g. Manual attendance wastes 10 minutes of every lecture and proxies are common', area: true })}
          {F({ k: 'users', label: 'Who uses it?', ph: 'e.g. teachers and students of our college' })}
          {F({ k: 'tech', label: 'Technologies (comma separated) *', ph: 'e.g. Python, OpenCV, Flask, MySQL, HTML, CSS' })}
          {F({ k: 'features', label: 'Main features (one per line) *', ph: 'marks attendance from a classroom photo\nsends a monthly report to parents\nadmin dashboard with charts', area: true })}
          <div className="ic-two">
            <label className="field">Team size<select className="input" value={pr.team} onChange={set('team')}>{['1', '2', '3', '4', '5', '6'].map((n) => <option key={n} value={n}>{n === '1' ? 'Individual' : `${n} members`}</option>)}</select></label>
            {Number(pr.team) > 1 && F({ k: 'role', label: 'Your role in the team', ph: 'e.g. building the backend APIs and the database' })}
          </div>
          {F({ k: 'challenge', label: 'Biggest challenge', ph: 'e.g. recognising faces in low light' })}
          {F({ k: 'solution', label: 'How you solved it', ph: 'e.g. adding histogram equalisation before detection' })}
          {F({ k: 'result', label: 'Result / impact', ph: 'e.g. Attendance now takes 30 seconds with 92% accuracy in our tests' })}
          {F({ k: 'future', label: 'Future scope', ph: 'e.g. build a mobile app and add mask detection' })}
          <div className="row-btns">
            <button className="btn primary" disabled={!ready} onClick={() => setView('pitch')}>Generate my answers <ArrowRight size={15} /></button>
            <button className="btn" onClick={() => window.confirm('Clear all project details?') && setP(EMPTY_PROJECT)}><RotateCcw size={14} /> Clear</button>
            {!ready && <span className="muted small">Fill the fields marked * first.</span>}
          </div>
        </div>
      )}
      {view === 'pitch' && (
        <div className="ic-pitch">
          <div className="card">
            <div className="ic-card-head"><h3>1-minute answer</h3><SpeakBtn text={pitch.short} label="Listen" /></div>
            <p className="ic-pitch-text">{pitch.short}</p>
            <SpeakingDrill target={60} label="Practise the 1-minute answer" />
          </div>
          <div className="card">
            <div className="ic-card-head"><h3>3-minute answer</h3><SpeakBtn text={pitch.long.map((x) => x[1]).join(' ')} label="Listen" /></div>
            {pitch.long.map(([h, t]) => <div key={h} className="ic-sec"><b>{h}</b><p>{t}</p></div>)}
            <SpeakingDrill target={180} label="Practise the 3-minute answer" />
          </div>
          <div className="row-btns">
            <button className="btn" onClick={() => downloadFile(`${(pr.title || 'project').replace(/\W+/g, '-')}-interview-answers.txt`, `${pr.title}\n\n1-MINUTE ANSWER\n${pitch.short}\n\n3-MINUTE ANSWER\n${longText}\n`, 'text/plain')}><Download size={14} /> Download answers</button>
            <button className="btn primary" onClick={() => setView('qs')}>Next: follow-up questions <ArrowRight size={15} /></button>
          </div>
          <p className="muted small">Tip: do not memorise word by word. Remember the order (problem, users, tech, features, role, challenge, result) and say it in your own words.</p>
        </div>
      )}
      {view === 'qs' && <ProjectQuestions groups={groups} />}
    </div>
  );
}

function ProjectQuestions({ groups }) {
  const [done, setDone] = useStudy('upskillr-coach-project-qs', {});
  const [open, setOpen] = useState(null);
  const total = groups.reduce((s, g) => s + g.questions.length, 0);
  const n = groups.reduce((s, g) => s + g.questions.filter((q) => done[q.q]).length, 0);
  return (
    <div>
      <p className="muted">These {total} questions are picked from the technologies in your project. Practise each one aloud, then mark it as ready. ({n}/{total} ready)</p>
      {groups.length === 1 && <p className="muted small">No specific technology was recognised. Write technology names like React, Java, Python, MySQL in the Technologies field.</p>}
      {groups.map((g) => (
        <div key={g.name} className="ic-qgroup">
          <h3>{g.name}</h3>
          {g.questions.map((q, k) => {
            const id = `${g.name}-${k}`;
            return (
              <div key={id} className={`card ic-q ${done[q.q] ? 'done' : ''}`}>
                <button className="ic-q-head" onClick={() => setOpen(open === id ? null : id)}><span>{q.q}</span>{done[q.q] && <CheckCircle2 size={16} className="ico t-ok" />}</button>
                {open === id && (
                  <div className="ic-q-body">
                    <div className="ic-tip"><Lightbulb size={14} /> A good answer mentions: {q.hint}</div>
                    <AnswerPractice question={q.q} />
                    <div className="row-btns"><button className={`btn small ${done[q.q] ? 'ok' : ''}`} onClick={() => setDone((m) => ({ ...m, [q.q]: !m[q.q] }))}><CheckCircle2 size={14} /> {done[q.q] ? 'Ready' : 'Mark as ready'}</button></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function AnswerPractice({ question }) {
  const [ans, setAns] = useState('');
  return (
    <div>
      <div className="row-btns"><SpeakBtn text={question} label="Hear the question" /></div>
      <MicBox value={ans} onChange={setAns} rows={3} />
      {ans.trim() && <SpeechReport text={ans} />}
    </div>
  );
}

/* ---------------- shared: timed speaking drill + speech report ---------------- */
export function useTicker(running) {
  const [secs, setSecs] = useState(0);
  useEffect(() => { if (!running) return undefined; const id = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(id); }, [running]);
  return [secs, setSecs];
}

export function SpeakingDrill({ target, label }) {
  const [text, setText] = useState('');
  const [run, setRun] = useState(false);
  const [secs, setSecs] = useTicker(run);
  const sp = useSpeech({ onText: (t) => setText((v) => `${v} ${t}`.trim()) });
  const start = () => { setText(''); setSecs(0); setRun(true); sp.start(); };
  const stop = () => { setRun(false); sp.stop(); };
  if (!sp.supported) return <p className="muted small">Speaking practice needs Chrome or Edge with a microphone. You can still read the answer aloud with a timer on your phone.</p>;
  return (
    <div className="ic-drill">
      <div className="row-btns">
        {!run ? <button className="btn small primary" onClick={start}><Mic size={14} /> {label}</button> : <button className="btn small danger" onClick={stop}><MicOff size={14} /> Stop</button>}
        {(run || secs > 0) && <span className={`ic-clock ${secs > target ? 'over' : ''}`}><Timer size={14} /> {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')} / {Math.floor(target / 60)}:00</span>}
        {run && <span className="muted small ic-live">{sp.interim}</span>}
      </div>
      {!run && text && <SpeechReport text={text} secs={secs} target={target} />}
    </div>
  );
}

export function SpeechReport({ text, secs, target }) {
  const a = analyzeSpeech(text, secs || 0, fillerWords);
  const tips = [];
  if (a.wpm && a.wpm > 170) tips.push('You are speaking too fast. Slow down and pause after each point.');
  if (a.wpm && a.wpm < 100) tips.push('You are speaking slowly. Practise until the sentences come naturally.');
  if (a.fillerTotal > 2) tips.push('Replace fillers (um, basically, actually) with a short silent pause.');
  if (a.repeated.length) tips.push(`You repeated "${a.repeated[0][0]}" many times. Use synonyms.`);
  if (target && secs && secs < target * 0.6) tips.push('Your answer was too short. Add an example or a result.');
  if (target && secs > target * 1.2) tips.push('Your answer was too long. Keep only the strongest points.');
  if (!tips.length) tips.push('Good pace and clean delivery. Keep practising.');
  return (
    <div className="ic-report">
      <div className="ic-report-stats">
        <div><b>{a.words}</b><span>Words</span></div>
        {a.wpm != null && <div><b className={a.wpm > 170 || a.wpm < 100 ? 'warn' : ''}>{a.wpm}</b><span>Words / min</span></div>}
        <div><b className={a.fillerTotal > 2 ? 'warn' : ''}>{a.fillerTotal}</b><span>Filler words</span></div>
        <div><b>{a.sentences}</b><span>Sentences</span></div>
      </div>
      {a.fillerTotal > 0 && <p className="small">Fillers: {Object.entries(a.fillerCounts).map(([w, n]) => <span key={w} className="ic-kw bad">{w} ×{n}</span>)}</p>}
      <ul className="small">{tips.map((t) => <li key={t}>{t}</li>)}</ul>
      <details><summary className="small muted">What you said</summary><p className="small">{text}</p></details>
    </div>
  );
}

/* ================================ 3. JAM / Extempore ================================ */
export function JamPractice() {
  const [cat, setCat] = useState('all');
  const [topic, setTopic] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | prep | speak | done
  const [showHints, setShowHints] = useState(false);
  const [text, setText] = useState('');
  const [prepLeft, setPrepLeft] = useState(30);
  const [hist, setHist] = useStudy('upskillr-coach-jam', []);
  const [secs, setSecs] = useTicker(phase === 'speak');
  const sp = useSpeech({ onText: (t) => setText((v) => `${v} ${t}`.trim()) });
  const pool = JAM_TOPICS.filter((t) => cat === 'all' || t.cat === cat);
  const textRef = useRef(''); textRef.current = text;

  useEffect(() => {
    if (phase !== 'prep') return undefined;
    const id = setInterval(() => setPrepLeft((s) => { if (s <= 1) { clearInterval(id); beginSpeak(); return 0; } return s - 1; }), 1000);
    return () => clearInterval(id);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (phase === 'speak' && secs >= 60) finish(); }, [secs]); // eslint-disable-line react-hooks/exhaustive-deps

  const newTopic = () => { stopSpeaking(); sp.stop(); setTopic(pool[Math.floor(Math.random() * pool.length)]); setPhase('prep'); setPrepLeft(30); setText(''); setSecs(0); setShowHints(false); };
  function beginSpeak() { setPhase('speak'); setSecs(0); if (sp.supported) sp.start(); }
  function finish() {
    sp.stop(); setPhase('done');
    setTimeout(() => {
      const a = analyzeSpeech(textRef.current, Math.max(secs, 1), fillerWords);
      setHist((h) => [{ t: topic?.t, at: Date.now(), secs, words: a.words, wpm: a.wpm, fillers: a.fillerTotal }, ...(Array.isArray(h) ? h : [])].slice(0, 30));
    }, 600);
  }
  const past = Array.isArray(hist) ? hist : [];

  return (
    <div className="ic-page">
      <div className="page-head">
        <h1><Mic size={28} className="ico" /> JAM / Extempore</h1>
        <p className="muted">Just A Minute: get a random topic, think for 30 seconds, then speak for 1 minute. The app measures your speed, filler words and repetition. Used in campus communication rounds, GDs and HR interviews.</p>
      </div>
      <CoachNav />
      {!JAM_TOPICS.length ? <Empty what="JAM topic" /> : (
        <>
          <div className="ic-toolbar">
            <select className="input ic-sel" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="all">All categories ({JAM_TOPICS.length} topics)</option>
              {JAM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn primary" onClick={newTopic}><Shuffle size={15} /> {topic ? 'New topic' : 'Give me a topic'}</button>
          </div>
          {topic && (
            <div className="card ic-jam">
              <span className="badge">{topic.cat}</span>
              <h2 className="ic-jam-topic">{topic.t}</h2>
              {phase === 'prep' && (
                <>
                  <div className="ic-big-clock">{prepLeft}s</div>
                  <p className="muted">Think: start, two or three points, and an ending.</p>
                  <div className="row-btns">
                    <button className="btn primary" onClick={beginSpeak}><Mic size={15} /> Start speaking now</button>
                    <button className="btn" onClick={() => setShowHints((v) => !v)}><Lightbulb size={14} /> {showHints ? 'Hide' : 'Show'} hints</button>
                  </div>
                </>
              )}
              {phase === 'speak' && (
                <>
                  <div className={`ic-big-clock ${secs >= 50 ? 'over' : ''}`}>{60 - secs}s</div>
                  <p className="ic-live">{sp.supported ? (text || sp.interim || 'Listening… start speaking.') : 'Your browser cannot hear you. Speak aloud anyway, or type below.'} {sp.interim}</p>
                  {!sp.supported && <textarea className="input" rows={3} value={text} onChange={(e) => setText(e.target.value)} />}
                  <button className="btn danger" onClick={finish}><MicOff size={15} /> Finish</button>
                </>
              )}
              {(showHints || phase === 'done') && topic.hints?.length > 0 && (
                <div className="ic-hints">
                  {topic.opener && <p><b>Strong opening:</b> {topic.opener}</p>}
                  <b>Talking points:</b><ul>{topic.hints.map((h) => <li key={h}>{h}</li>)}</ul>
                </div>
              )}
              {phase === 'done' && (text ? <SpeechReport text={text} secs={secs} target={60} /> : <p className="muted">Nothing was captured. Check the microphone permission, or type what you said to get the analysis.</p>)}
              {phase === 'done' && <button className="btn primary" onClick={newTopic}><Shuffle size={15} /> Next topic</button>}
            </div>
          )}
          {past.length > 0 && (
            <div className="card">
              <h3>Your last attempts</h3>
              <table className="data-table"><thead><tr><th>Topic</th><th>Time</th><th>Words</th><th>WPM</th><th>Fillers</th></tr></thead>
                <tbody>{past.slice(0, 10).map((h) => <tr key={h.at}><td>{h.t}</td><td>{h.secs}s</td><td>{h.words}</td><td>{h.wpm ?? '–'}</td><td>{h.fillers}</td></tr>)}</tbody></table>
            </div>
          )}
          <div className="card ic-tipbox">
            <h3>How to do well in JAM</h3>
            <ul>
              <li>Begin with a strong first line (a fact, a question or a short story). Never start with "So…" or "Basically…".</li>
              <li>Use a simple structure: opening, 2-3 points with one example, a one-line conclusion.</li>
              <li>Aim for 120-150 words per minute. Pause instead of saying "um".</li>
              <li>If you get stuck, connect to your own experience: "In my college…", "When I was learning Java…".</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

/* ================================ 4. Situational Round ================================ */
export function SituationalRound() {
  const [cat, setCat] = useState('all');
  const [hist, setHist] = useStudy('upskillr-coach-situational', {});
  const pool = useMemo(() => shuffle(SITUATIONS.filter((s) => cat === 'all' || s.cat === cat)), [cat]);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [run, setRun] = useState({ pts: 0, max: 0 });
  useEffect(() => { setI(0); setChosen(null); setRun({ pts: 0, max: 0 }); }, [cat]);
  const s = pool[i % Math.max(1, pool.length)];
  const opts = useMemo(() => (s ? shuffle(s.options) : []), [s]);
  const answered = Object.keys(hist).length;
  const best = Object.values(hist).filter((v) => v === 2).length;
  const choose = (o) => {
    if (chosen) return;
    setChosen(o);
    setRun((r) => ({ pts: r.pts + o.score, max: r.max + 2 }));
    setHist((h) => ({ ...h, [s.id]: o.score }));
  };
  const next = () => { setI((x) => x + 1); setChosen(null); stopSpeaking(); };
  return (
    <div className="ic-page">
      <div className="page-head">
        <h1><Scale size={28} className="ico" /> Situational and Managerial Round</h1>
        <p className="muted">"What will you do if…?" questions test your attitude, ownership and communication. Choose what you would really do, then see why each option helps or hurts you, and learn a model answer.</p>
      </div>
      <CoachNav />
      {!SITUATIONS.length ? <Empty what="situational" /> : (
        <>
          <div className="ic-stats">
            <div className="card"><b>{SITUATIONS.length}</b><span>Situations</span></div>
            <div className="card"><b>{answered}</b><span>Answered</span></div>
            <div className="card"><b>{best}</b><span>Best choice picked</span></div>
            <div className="card"><b>{run.max ? Math.round((run.pts / run.max) * 100) : 0}%</b><span>This session</span></div>
          </div>
          <div className="ic-toolbar">
            <select className="input ic-sel" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="all">All categories</option>
              {SITUATION_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {s && (
            <div className="card ic-sit">
              <div className="ic-practice-top"><span className="badge">{SITUATION_CATEGORIES.find((c) => c.id === s.cat)?.name}</span><span className="badge">{s.round} round</span><span className="muted small">{(i % pool.length) + 1} / {pool.length}</span></div>
              <h2 className="ic-sit-q">{s.q}</h2>
              <SpeakBtn text={s.q} label="Hear the question" />
              <div className="ic-opts">
                {opts.map((o) => (
                  <button key={o.text} className={`ic-opt ${chosen ? `s${o.score}` : ''} ${chosen === o ? 'picked' : ''}`} onClick={() => choose(o)} disabled={!!chosen}>
                    <span>{o.text}</span>
                    {chosen && <em>{o.score === 2 ? 'Best' : o.score === 1 ? 'Acceptable' : 'Poor'}: {o.why}</em>}
                  </button>
                ))}
              </div>
              {chosen && (
                <div className="ic-result">
                  <b>{chosen.score === 2 ? <><CheckCircle2 size={16} className="ico t-ok" /> Best choice.</> : chosen.score === 1 ? <><Lightbulb size={16} className="ico t-warn" /> Acceptable, but there is a better way.</> : <><XCircle size={16} className="ico t-bad" /> This answer can cost you the job.</>}</b>
                  {s.tip && <div className="ic-tip"><Lightbulb size={14} /> What the interviewer checks: {s.tip}</div>}
                  <div className="ic-model"><div className="ic-card-head"><b>Model answer (say it in your words)</b><SpeakBtn text={s.model} /></div><p>{s.model}</p></div>
                  <button className="btn primary" onClick={next}>Next situation <ArrowRight size={15} /></button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ================================ 5. Company HR Rounds ================================ */
export function CompanyHR() {
  const { id } = useParams();
  const ids = Object.keys(COMPANY_HR);
  const c = id && COMPANY_HR[id];
  if (!c) {
    return (
      <div className="ic-page">
        <div className="page-head">
          <h1><Building2 size={28} className="ico" /> Company-wise HR Rounds</h1>
          <p className="muted">The complete hiring process, communication test, HR questions with model answers and policies for popular fresher recruiters. Practise the questions aloud before your interview.</p>
        </div>
        <CoachNav />
        {!ids.length ? <Empty what="company HR" /> : (
          <div className="grid3">
            {ids.map((k) => {
              const x = COMPANY_HR[k];
              return (
                <Link key={k} to={`/tools/company-hr/${k}`} className="card ic-co">
                  <div className="ic-co-logo">{x.name.slice(0, 2).toUpperCase()}</div>
                  <h3>{x.name}</h3>
                  <p className="muted small">{x.overview}</p>
                  <div className="meta"><span>{x.process?.length || 0} rounds</span><span>{x.hrQuestions?.length || 0} HR questions</span>{x.commTest && <span>Communication test</span>}</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  return <CompanyHRDetail id={id} c={c} />;
}

function CompanyHRDetail({ id, c }) {
  const [open, setOpen] = useState(null);
  const [ready, setReady] = useStudy('upskillr-coach-hr', {});
  const r = ready[id] || {};
  const n = (c.hrQuestions || []).filter((q) => r[q.q]).length;
  const mark = (q) => setReady((m) => ({ ...m, [id]: { ...(m[id] || {}), [q]: !(m[id] || {})[q] } }));
  return (
    <div className="ic-page">
      <div className="page-head">
        <h1><Building2 size={28} className="ico" /> {c.name}: HR and Interview Guide</h1>
        <p className="muted">{c.overview}</p>
      </div>
      <CoachNav />
      <div className="row-btns"><Link className="btn small" to="/tools/company-hr">All companies</Link><Link className="btn small primary" to={`/practice/companies/${id}`}>Take the {c.name} aptitude mock test <ArrowRight size={14} /></Link></div>
      <div className="card">
        <h3>Hiring process</h3>
        <ol className="ic-steps">
          {(c.process || []).map((s) => <li key={s.round}><b>{s.round}</b><p>{s.what}</p>{s.tips?.length > 0 && <ul className="small">{s.tips.map((t) => <li key={t}>{t}</li>)}</ul>}</li>)}
        </ol>
      </div>
      {c.commTest && (
        <div className="card">
          <h3>{c.commTest.name}</h3>
          <div className="ic-comm">{(c.commTest.parts || []).map((p) => <div key={p.part} className="ic-comm-part"><b>{p.part}</b><p className="small">{p.how}</p>{p.tip && <div className="ic-tip small"><Lightbulb size={13} /> {p.tip}</div>}</div>)}</div>
          <p className="small muted">Practise this with the <Link to="/tools/jam">JAM tool</Link> and <Link to="/tools/interview-phrases">Interview Phrases</Link>.</p>
        </div>
      )}
      <div className="card">
        <div className="ic-card-head"><h3>HR questions ({n}/{c.hrQuestions?.length || 0} ready)</h3></div>
        {(c.hrQuestions || []).map((q, k) => (
          <div key={q.q} className={`ic-q ${r[q.q] ? 'done' : ''}`}>
            <button className="ic-q-head" onClick={() => setOpen(open === k ? null : k)}><span>{k + 1}. {q.q}</span>{r[q.q] && <CheckCircle2 size={16} className="ico t-ok" />}</button>
            {open === k && (
              <div className="ic-q-body">
                <div className="ic-model"><div className="ic-card-head"><b>Model answer</b><SpeakBtn text={q.a} /></div><p>{q.a}</p></div>
                {q.avoid && <div className="ic-wrong"><XCircle size={14} /> Avoid: {q.avoid}</div>}
                <AnswerPractice question={q.q} />
                <button className={`btn small ${r[q.q] ? 'ok' : ''}`} onClick={() => mark(q.q)}><CheckCircle2 size={14} /> {r[q.q] ? 'Ready' : 'Mark as ready'}</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="ic-two">
        {c.values?.length > 0 && <div className="card"><h3>Values to mention</h3><ul className="small">{c.values.map((v) => <li key={v}>{v}</li>)}</ul></div>}
        {c.documents?.length > 0 && <div className="card"><h3>Documents to keep ready</h3><ul className="small">{c.documents.map((v) => <li key={v}>{v}</li>)}</ul></div>}
      </div>
      {c.policies?.length > 0 && <div className="card"><h3>Policies freshers ask about</h3><ul className="small">{c.policies.map((v) => <li key={v}>{v}</li>)}</ul></div>}
      {c.lastNote && <p className="muted small">{c.lastNote}</p>}
    </div>
  );
}
