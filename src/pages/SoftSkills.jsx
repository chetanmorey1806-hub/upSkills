import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, UserRound, Mic, MicOff, MessagesSquare, Star, Users, Mail, CalendarCheck, Shuffle, Copy, Play, Square } from 'lucide-react';
import { softSkillModules, hrQuestions, gdTopics, emailTasks, starQuestions, fillerWords } from '../data/javaCareer.js';
import RichText, { Inline } from '../components/RichText.jsx';
import { useLocalState, useDictation, useStopwatch, useCountdown, analyzeSpeech, fmtTime, keywordsOf, coverage } from '../components/careerUtils.js';

import Ico from '../components/Ico.jsx';
const STORE = 'xlpbi-softskills-v1';

function useSoftStore() {
  const [st, setSt] = useLocalState(STORE, { log: [], intro: {}, done: {} });
  const log = (type, detail, score) => setSt((s) => ({ ...s, log: [...(s.log || []), { date: new Date().toISOString(), type, detail, score }].slice(-300) }));
  return [{ log: [], intro: {}, done: {}, ...st }, setSt, log];
}

const copyText = async (t) => { try { await navigator.clipboard.writeText(t); } catch { /* ignore */ } };

// ---------- shared speaking recorder ----------
function SpeakBox({ onDone, keywords, minHint = '60–90 seconds' }) {
  const [text, setText] = useState('');
  const [run, setRun] = useState(false);
  const [rk, setRk] = useState(0);
  const [result, setResult] = useState(null);
  const secs = useStopwatch(run, rk);
  const dict = useDictation((t) => setText((x) => (x ? `${x} ${t}` : t)));
  const start = () => { setText(''); setResult(null); setRk((k) => k + 1); setRun(true); dict.start(); };
  const stop = () => {
    dict.stop(); setRun(false);
    const a = analyzeSpeech(text, secs, fillerWords);
    const cov = keywords?.length ? coverage(text, keywords) : null;
    setResult({ ...a, secs, cov });
    onDone?.(a, secs, cov);
  };
  return (
    <div className="card">
      <div className="row-btns">
        {!run ? <button className="btn primary" onClick={start}><Mic size={15} /> Start speaking</button> : <button className="btn danger-btn" onClick={stop}><Square size={15} /> Stop & analyse</button>}
        <span className={`timer ${run ? '' : 'jc-idle'}`}><Ico e="⏱" /> {fmtTime(secs)}</span>
        <span className="muted small">Target: {minHint}</span>
      </div>
      {!dict.supported && <p className="muted small">Live speech-to-text works in Chrome or Edge. In other browsers, speak while the timer runs and type what you said (or paste it) below, then press Stop.</p>}
      {dict.listening && <div className="jc-live"><MicOff size={13} /> Listening… {dict.interim}</div>}
      <textarea className="input" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Your words appear here as you speak (you can also type)…" />
      {result && (
        <div className="jc-analysis">
          <div className="stats">
            <div><b>{result.words}</b><span>Words</span></div>
            <div><b>{fmtTime(result.secs)}</b><span>Duration</span></div>
            <div><b className={result.wpm && (result.wpm < 100 || result.wpm > 170) ? 'jc-warn' : ''}>{result.wpm ?? '–'}</b><span>Words / min (aim 120–160)</span></div>
            <div><b className={result.fillerTotal > 3 ? 'jc-warn' : ''}>{result.fillerTotal}</b><span>Filler words</span></div>
            {result.cov && <div><b>{result.cov.pct}%</b><span>Key points</span></div>}
          </div>
          {result.fillerTotal > 0 && <p>Fillers: {Object.entries(result.fillerCounts).map(([w, n]) => <span key={w} className="jc-kw bad">{w} ×{n}</span>)}</p>}
          {result.repeated.length > 0 && <p>Repeated words: {result.repeated.map(([w, n]) => <span key={w} className="jc-kw">{w} ×{n}</span>)}</p>}
          {result.cov && <p>{result.cov.hit.map((k) => <span key={k} className="jc-kw ok">✓ {k}</span>)}{result.cov.miss.map((k) => <span key={k} className="jc-kw bad">✗ {k}</span>)}</p>}
          <ul className="small">
            {result.wpm && result.wpm > 170 && <li>You are speaking fast. Pause after each sentence and breathe.</li>}
            {result.wpm && result.wpm < 100 && <li>You are speaking slowly or pausing a lot. Prepare 3 key points before you start.</li>}
            {result.fillerTotal > 3 && <li>Replace fillers with a short silent pause; silence sounds more confident than "um".</li>}
            {result.secs < 30 && <li>Your answer is short. Add an example or a result to make it complete.</li>}
            {result.secs > 150 && <li>Your answer is long. Interview answers should usually be under 2 minutes.</li>}
            <li>Record again and try to beat this score. Practice daily for 10 minutes.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------- tabs ----------
function Learn({ st, setSt }) {
  const [open, setOpen] = useState(softSkillModules[0]?.id);
  const m = softSkillModules.find((x) => x.id === open);
  if (!softSkillModules.length) return <p className="muted">Lessons are being added.</p>;
  return (
    <div className="ss-learn">
      <div className="ss-mods">
        {softSkillModules.map((x) => (
          <button key={x.id} className={`ss-mod ${open === x.id ? 'active' : ''}`} onClick={() => setOpen(x.id)}>
            <span><Ico e={x.icon} /></span> <span>{x.title}</span> {st.done[x.id] && <span className="jc-solved">✓</span>}
          </button>
        ))}
      </div>
      {m && (
        <div>
          <h2><Ico e={m.icon} /> {m.title}</h2>
          <p className="muted">{m.summary}</p>
          {m.lessons.map((l, i) => (
            <div key={i} className="card">
              <h3>{l.heading}</h3>
              <RichText text={l.content} />
              {l.points?.length > 0 && <ul>{l.points.map((x, j) => <li key={j}><Inline text={x} /></li>)}</ul>}
              {(l.dos?.length > 0 || l.donts?.length > 0) && (
                <div className="grid2" style={{ marginBottom: 0 }}>
                  {l.dos?.length > 0 && <div className="explain ok"><b>Do</b><ul>{l.dos.map((x, j) => <li key={j}>{x}</li>)}</ul></div>}
                  {l.donts?.length > 0 && <div className="explain bad"><b>Don't</b><ul>{l.donts.map((x, j) => <li key={j}>{x}</li>)}</ul></div>}
                </div>
              )}
            </div>
          ))}
          {m.exercises?.length > 0 && <h3 className="section-title">Practice exercises</h3>}
          {(m.exercises || []).map((e, i) => (
            <details key={i} className="card qa"><summary><span className="qa-q"><Inline text={e.task} /></span></summary>
              <div className="qa-a">{e.hint && <div className="tip"><Ico e="💡" /> {e.hint}</div>}<b>Sample answer</b><RichText text={e.sample} /></div>
            </details>
          ))}
          <button className={`btn ${st.done[m.id] ? 'success' : 'primary'}`} onClick={() => setSt((s) => ({ ...s, done: { ...s.done, [m.id]: !s.done?.[m.id] } }))}>{st.done[m.id] ? '✓ Completed' : 'Mark module as completed'}</button>
        </div>
      )}
    </div>
  );
}

const INTRO_FIELDS = [
  ['name', 'Full name', 'Riya Patil'], ['city', 'Hometown', 'Pune'], ['degree', 'Degree & branch', 'B.E. in Computer Engineering'],
  ['college', 'College', 'ABC College of Engineering'], ['year', 'Passing year & score', '2025 with 8.1 CGPA'],
  ['skills', 'Technical skills', 'Core Java, Spring Boot, MySQL, React and Git'], ['project', 'Best project (one line)', 'an E-Commerce REST API using Spring Boot, JPA and JWT security'],
  ['extra', 'Internship / certification', 'a 3-month Java Full Stack internship'], ['strengths', 'Two strengths', 'quick learner and good team player'],
  ['hobbies', 'Hobbies', 'playing chess and reading tech blogs'], ['goal', 'Career goal', 'grow as a backend developer and build scalable applications'],
];

function IntroBuilder({ st, setSt, log }) {
  const f = st.intro || {};
  const v = (k) => f[k] || INTRO_FIELDS.find((x) => x[0] === k)[2];
  const set = (k, val) => setSt((s) => ({ ...s, intro: { ...s.intro, [k]: val } }));
  const versions = {
    'Short (30 sec)': `Good morning. My name is ${v('name')} and I am from ${v('city')}. I have completed my ${v('degree')} from ${v('college')} in ${v('year')}. I am skilled in ${v('skills')}. Recently I built ${v('project')}. I am a ${v('strengths')}, and I am excited to start my career as a Java developer.`,
    'Standard (60–90 sec)': `Good morning, and thank you for this opportunity. My name is ${v('name')}, and I am from ${v('city')}.\n\nI completed my ${v('degree')} from ${v('college')}, graduating in ${v('year')}. During my studies I became interested in software development, so I trained in Java Full Stack development.\n\nMy technical skills include ${v('skills')}. My best project is ${v('project')}. In this project I designed the database, wrote the REST APIs and tested them with Postman. I have also completed ${v('extra')}, where I learned how real teams work with Git and code reviews.\n\nMy strengths are that I am a ${v('strengths')}. In my free time I enjoy ${v('hobbies')}.\n\nMy goal is to ${v('goal')}, and I believe this role is a great place to start. Thank you.`,
    'HR round (formal)': `Thank you for giving me this opportunity. I am ${v('name')} from ${v('city')}. I hold a ${v('degree')} from ${v('college')} (${v('year')}). I have hands-on experience with ${v('skills')}, which I applied while building ${v('project')} and during ${v('extra')}. People who work with me describe me as a ${v('strengths')}. Outside work I like ${v('hobbies')}. In the long term I want to ${v('goal')}, and I would be glad to contribute and learn as part of your team.`,
  };
  const [ver, setVer] = useState('Standard (60–90 sec)');
  const [practice, setPractice] = useState(false);
  return (
    <div className="grid2">
      <div className="card jc-form">
        <h3>Fill in your details</h3>
        {INTRO_FIELDS.map(([k, l, ph]) => <label key={k}>{l}<input className="input" placeholder={ph} value={f[k] || ''} onChange={(e) => set(k, e.target.value)} /></label>)}
      </div>
      <div>
        <div className="chips">{Object.keys(versions).map((k) => <button key={k} className={`chip ${ver === k ? 'active' : ''}`} onClick={() => setVer(k)}>{k}</button>)}</div>
        <div className="card"><RichText text={versions[ver]} />
          <div className="row-btns"><button className="btn small" onClick={() => copyText(versions[ver])}><Copy size={14} /> Copy</button><button className="btn small primary" onClick={() => setPractice(!practice)}><Mic size={14} /> {practice ? 'Hide practice' : 'Practise speaking it'}</button></div>
          <div className="tip">Don't memorise word-for-word. Remember the order: <b>greeting → name & place → education → skills → project → strengths → goal → thank you</b>. Speak in your own words.</div>
        </div>
        {practice && <SpeakBox minHint={ver.startsWith('Short') ? '30 seconds' : '60–90 seconds'} keywords={keywordsOf(versions[ver], 10)} onDone={(a, s) => log('Self-introduction', ver, a.wpm)} />}
      </div>
    </div>
  );
}

function SpeakingPractice({ log }) {
  const prompts = useMemo(() => [
    ...hrQuestions.map((q) => ({ text: q.q, kind: `HR · ${q.category}`, keys: q.keywords, tip: q.tip })),
    { text: 'Explain your final year / main project in 2 minutes.', kind: 'Project' },
    { text: 'Explain OOP concepts to a non-technical person.', kind: 'Technical explanation' },
    { text: 'Explain how a request flows through a Spring Boot REST API.', kind: 'Technical explanation' },
    { text: 'Describe your daily routine and how you manage time.', kind: 'Fluency' },
    { text: 'Talk about a technology you learned recently and why you like it.', kind: 'Fluency' },
  ], []);
  const [i, setI] = useState(0);
  const [custom, setCustom] = useState('');
  const p = prompts[i] || { text: 'Tell me about yourself.' };
  return (
    <div>
      <div className="quiz-settings">
        <label>Topic <select value={i} onChange={(e) => setI(Number(e.target.value))}>{prompts.map((x, j) => <option key={j} value={j}>{x.kind}: {x.text.slice(0, 70)}</option>)}</select></label>
        <button className="btn small" onClick={() => setI(Math.floor(Math.random() * prompts.length))}><Shuffle size={14} /> Random</button>
      </div>
      <input className="input" placeholder="…or type your own topic" value={custom} onChange={(e) => setCustom(e.target.value)} />
      <div className="card jc-question"><div className="fc-label">{custom ? 'Your topic' : p.kind}</div><h2>{custom || p.text}</h2>{!custom && p.tip && <div className="muted small">Interviewer checks: {p.tip}</div>}</div>
      <SpeakBox key={custom || i} keywords={custom ? null : p.keys} minHint="60–120 seconds" onDone={(a) => log('Speaking', custom || p.text, a.wpm)} />
    </div>
  );
}

function HRQuestions({ log }) {
  const cats = ['All', ...new Set(hrQuestions.map((q) => q.category))];
  const [cat, setCat] = useState('All');
  const [ans, setAns] = useState({});
  const list = hrQuestions.filter((q) => cat === 'All' || q.category === cat);
  return (
    <div>
      <div className="chips">{cats.map((c) => <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>)}</div>
      <p className="muted">Write your own answer first, then open the sample answer to compare. For a full timed HR round, use the <Link to="/tools/java-interview">Mock Interview</Link> (Round: HR).</p>
      {list.map((q) => {
        const idx = hrQuestions.indexOf(q);
        const a = ans[idx] || '';
        const cov = a ? coverage(a, (q.keywords || []).map((k) => k.toLowerCase())) : null;
        return (
          <details key={idx} className="card qa"><summary><span className="qa-q">{q.q}</span><span className="muted small">{q.category}</span></summary>
            <div className="qa-a">
              {q.tip && <div className="tip"><b>What they check:</b> {q.tip}</div>}
              <textarea className="input" rows={4} placeholder="Your answer…" value={a} onChange={(e) => setAns({ ...ans, [idx]: e.target.value })} onBlur={() => a && log('HR answer', q.q, cov?.pct)} />
              {cov && <p className="small">Key points: {cov.hit.map((k) => <span key={k} className="jc-kw ok">✓ {k}</span>)}{cov.miss.map((k) => <span key={k} className="jc-kw bad">✗ {k}</span>)}</p>}
              <b>Sample answer</b><RichText text={q.sample} />
            </div>
          </details>
        );
      })}
    </div>
  );
}

function StarBuilder({ log }) {
  const [i, setI] = useState(0);
  const [f, setF] = useState({ situation: '', task: '', action: '', result: '' });
  const [show, setShow] = useState(false);
  const q = starQuestions[i];
  if (!q) return <p className="muted">STAR questions are being added.</p>;
  const all = `${f.situation} ${f.task} ${f.action} ${f.result}`.trim();
  const checks = [
    ['Situation gives context (when/where)', f.situation.split(/\s+/).filter(Boolean).length >= 8],
    ['Task says what YOU had to do', /\b(i|my)\b/i.test(f.task)],
    ['Action uses "I" (your own steps)', (f.action.match(/\bI\b/g) || []).length >= 2],
    ['Result is measurable (a number, %, time)', /\d/.test(f.result)],
    ['Total length 80–200 words', (() => { const n = all.split(/\s+/).filter(Boolean).length; return n >= 80 && n <= 200; })()],
  ];
  const L = { situation: 'S – Situation', task: 'T – Task', action: 'A – Action', result: 'R – Result' };
  return (
    <div>
      <div className="quiz-settings">
        <label>Question <select value={i} onChange={(e) => { setI(Number(e.target.value)); setShow(false); }}>{starQuestions.map((x, j) => <option key={j} value={j}>{x.q.slice(0, 90)}</option>)}</select></label>
      </div>
      <div className="card jc-question"><div className="fc-label">Behavioral question</div><h2>{q.q}</h2></div>
      <div className="grid2">
        <div className="card jc-form">
          {Object.keys(L).map((k) => <label key={k}>{L[k]}<textarea className="input" rows={3} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}
        </div>
        <div>
          <div className="card"><h4>Checklist</h4>{checks.map(([t, ok]) => <div key={t} className={ok ? 'jc-ok' : 'muted'}>{ok ? <><Ico e="✅" /></> : <><Ico e="⬜" /></>} {t}</div>)}
            <div className="row-btns"><button className="btn small" disabled={!all} onClick={() => { copyText(all); log('STAR answer', q.q, checks.filter((c) => c[1]).length); }}><Copy size={14} /> Copy full answer</button><button className="btn small" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'} sample</button></div>
          </div>
          {show && <div className="card">{Object.keys(L).map((k) => <p key={k}><b>{L[k]}:</b> {q.sample[k]}</p>)}</div>}
        </div>
      </div>
    </div>
  );
}

function GroupDiscussion({ log }) {
  const [i, setI] = useState(() => Math.floor(Math.random() * Math.max(1, gdTopics.length)));
  const [phase, setPhase] = useState('idle'); // idle | prep | speak | review
  const [rk, setRk] = useState(0);
  const [notes, setNotes] = useState('');
  const t = gdTopics[i];
  const left = useCountdown(phase === 'prep' ? 60 : 120, phase === 'prep' || phase === 'speak', `${phase}-${rk}`);
  useEffect(() => { if (phase === 'prep' && left <= 0) setPhase('speak'); }, [phase, left]);
  if (!t) return <p className="muted">GD topics are being added.</p>;
  return (
    <div>
      <div className="row-btns">
        <button className="btn" onClick={() => { setI(Math.floor(Math.random() * gdTopics.length)); setPhase('idle'); setNotes(''); }}><Shuffle size={15} /> New topic</button>
        <select value={i} onChange={(e) => { setI(Number(e.target.value)); setPhase('idle'); }}>{gdTopics.map((x, j) => <option key={j} value={j}>{x.topic}</option>)}</select>
      </div>
      <div className="card jc-question"><div className="fc-label">GD topic · {t.type}</div><h2>{t.topic}</h2></div>
      {phase === 'idle' && <div className="card"><p>Real GDs give you about 1 minute to think, then you speak for 1–2 minutes at a time. Start the prep timer, write 3–4 points, then speak.</p><button className="btn primary" onClick={() => { setPhase('prep'); setRk((k) => k + 1); }}><Play size={15} /> Start 1-minute preparation</button></div>}
      {phase === 'prep' && <div className="card"><span className="timer"><Ico e="🧠" /> Prep: {fmtTime(left)}</span><textarea className="input" rows={5} placeholder="Your points: opening line, 2–3 arguments with examples, conclusion…" value={notes} onChange={(e) => setNotes(e.target.value)} /><button className="btn" onClick={() => setPhase('speak')}>I'm ready → speak</button></div>}
      {phase === 'speak' && (
        <>
          {notes && <div className="card small"><b>Your notes:</b> <span className="jc-pre">{notes}</span></div>}
          <SpeakBox minHint="1–2 minutes" onDone={(a) => { log('Group discussion', t.topic, a.wpm); setPhase('review'); }} />
        </>
      )}
      {phase === 'review' && (
        <div className="grid2">
          <div className="card"><h4>Points FOR</h4><ul>{t.for.map((x, j) => <li key={j}>{x}</li>)}</ul></div>
          <div className="card"><h4>Points AGAINST</h4><ul>{t.against.map((x, j) => <li key={j}>{x}</li>)}</ul></div>
          <div className="card"><h4>Balanced conclusion</h4><p>{t.conclusion}</p><button className="btn" onClick={() => { setPhase('speak'); }}>Speak again</button></div>
          <div className="card"><h4>GD scoring tips</h4><ul><li>Start or conclude the discussion if you can (initiator / summariser).</li><li>Support points with examples or facts you are sure about.</li><li>Let others speak; say "I agree with Rahul, and I'd add…".</li><li>Never shout or interrupt; keep eye contact with the group, not the panel.</li></ul></div>
        </div>
      )}
    </div>
  );
}

function EmailWriting({ log }) {
  const [i, setI] = useState(0);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [ticks, setTicks] = useState({});
  const [show, setShow] = useState(false);
  const t = emailTasks[i];
  if (!t) return <p className="muted">Email tasks are being added.</p>;
  const words = (body.match(/\S+/g) || []).length;
  const auto = [
    ['Clear subject line (4–10 words)', (() => { const n = subject.trim().split(/\s+/).filter(Boolean).length; return n >= 4 && n <= 10; })()],
    ['Polite greeting (Dear / Hello / Hi)', /^\s*(dear|hello|hi|good (morning|afternoon|evening))\b/i.test(body)],
    ['Professional closing (Regards / Sincerely / Thanks)', /\b(regards|sincerely|thank you|thanks|best wishes)\b/i.test(body)],
    ['Length 60–200 words', words >= 60 && words <= 200],
    ['No SMS language (u, pls, plz, thx)', !/\b(u|pls|plz|thx|ur)\b/i.test(body) && body.length > 0],
    ['Short paragraphs (has line breaks)', /\n\s*\n/.test(body)],
  ];
  const score = auto.filter((x) => x[1]).length + (t.mustInclude || []).filter((_, j) => ticks[j]).length;
  const max = auto.length + (t.mustInclude || []).length;
  return (
    <div>
      <div className="quiz-settings"><label>Task <select value={i} onChange={(e) => { setI(Number(e.target.value)); setSubject(''); setBody(''); setTicks({}); setShow(false); }}>{emailTasks.map((x, j) => <option key={j} value={j}>{x.title}</option>)}</select></label></div>
      <div className="card jc-question"><div className="fc-label">Scenario</div><h3>{t.title}</h3><p>{t.scenario}</p></div>
      <div className="grid2">
        <div className="card jc-form">
          <label>Subject<input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
          <label>Email body<textarea className="input" rows={12} value={body} onChange={(e) => setBody(e.target.value)} placeholder={'Dear Sir/Madam,\n\n…\n\nRegards,\nYour Name'} /></label>
          <div className="muted small">{words} words</div>
        </div>
        <div>
          <div className="card"><h4>Checklist ({score}/{max})</h4>
            {auto.map(([l, ok]) => <div key={l} className={ok ? 'jc-ok' : 'muted'}>{ok ? <><Ico e="✅" /></> : <><Ico e="⬜" /></>} {l}</div>)}
            {(t.mustInclude || []).map((m, j) => <label key={j} className="check" style={{ display: 'flex' }}><input type="checkbox" checked={!!ticks[j]} onChange={() => setTicks({ ...ticks, [j]: !ticks[j] })} /> Includes: {m}</label>)}
            <div className="row-btns"><button className="btn small primary" disabled={!body} onClick={() => log('Email', t.title, Math.round((score / max) * 100))}>Save attempt</button><button className="btn small" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'} sample email</button></div>
          </div>
          {show && <div className="card"><pre className="jc-pre">{t.sample}</pre></div>}
        </div>
      </div>
    </div>
  );
}

function DailyLog({ st, setSt }) {
  const days = [...new Set((st.log || []).map((l) => l.date.slice(0, 10)))].sort();
  const set = new Set(days);
  const d = new Date();
  const key = () => d.toISOString().slice(0, 10);
  if (!set.has(key())) d.setDate(d.getDate() - 1); // today not practised yet: streak can still continue from yesterday
  let streak = 0;
  while (set.has(key())) { streak++; d.setDate(d.getDate() - 1); }
  const recent = [...(st.log || [])].reverse().slice(0, 50);
  const modsDone = Object.values(st.done || {}).filter(Boolean).length;
  return (
    <div>
      <div className="stats">
        <div><b>{streak}<Ico e="🔥" /></b><span>Day streak</span></div>
        <div><b>{days.length}</b><span>Practice days</span></div>
        <div><b>{(st.log || []).length}</b><span>Activities</span></div>
        <div><b>{modsDone}/{softSkillModules.length}</b><span>Modules completed</span></div>
      </div>
      <div className="card info"><b>Daily 20-minute plan:</b> 5 min self-introduction · 5 min one HR question out loud · 5 min a GD topic or STAR story · 5 min write one email. Consistency matters more than length.</div>
      {recent.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>When</th><th>Activity</th><th>Topic</th><th>Score</th></tr></thead>
        <tbody>{recent.map((l, i) => <tr key={i}><td>{new Date(l.date).toLocaleString()}</td><td>{l.type}</td><td>{l.detail}</td><td>{l.score ?? '–'}</td></tr>)}</tbody></table></div> : <p className="muted">No practice yet. Start with the Self-Intro tab.</p>}
      {recent.length > 0 && <button className="link-btn danger" onClick={() => window.confirm('Clear practice log?') && setSt((s) => ({ ...s, log: [] }))}>Clear log</button>}
    </div>
  );
}

const TABS = [
  ['learn', BookOpen, 'Lessons'], ['intro', UserRound, 'Self-Intro Builder'], ['speak', Mic, 'Speaking Practice'], ['hr', MessagesSquare, 'HR Questions'],
  ['star', Star, 'STAR Answers'], ['gd', Users, 'Group Discussion'], ['email', Mail, 'Email Writing'], ['log', CalendarCheck, 'My Practice'],
];

export default function SoftSkills() {
  const [tab, setTab] = useLocalState('xlpbi-softskills-tab', 'learn');
  const [st, setSt, log] = useSoftStore();
  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🗣" /> Soft Skills Lab</h1>
        <p className="muted">Communication, self-introduction, HR answers, STAR stories, group discussion and email writing, with speaking practice that measures your speed and filler words. Practise a little every day.</p>
      </div>
      <div className="tabs">{TABS.map(([k, I, l]) => <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}><I size={15} /> {l}</button>)}</div>
      {tab === 'learn' && <Learn st={st} setSt={setSt} />}
      {tab === 'intro' && <IntroBuilder st={st} setSt={setSt} log={log} />}
      {tab === 'speak' && <SpeakingPractice log={log} />}
      {tab === 'hr' && <HRQuestions log={log} />}
      {tab === 'star' && <StarBuilder log={log} />}
      {tab === 'gd' && <GroupDiscussion log={log} />}
      {tab === 'email' && <EmailWriting log={log} />}
      {tab === 'log' && <DailyLog st={st} setSt={setSt} />}
    </div>
  );
}
