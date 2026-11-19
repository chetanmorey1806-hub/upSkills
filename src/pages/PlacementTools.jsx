import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calculator, Brain, BookOpenText, Timer, Play, Square, Video, Download, RotateCcw, Camera, Mic, Building2, Code2, CheckCircle2 } from 'lucide-react';
import { APTITUDE, APT_SECTIONS, findAptTopic } from '../data/aptitude.js';
import { tracks } from '../data/index.js';
import { codingProblems, hrQuestions, fillerWords } from '../data/javaCareer.js';
import Quiz from '../components/Quiz.jsx';
import RichText, { Inline } from '../components/RichText.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { useStudy, logEvent } from '../study.js';
import { useDictation, analyzeSpeech, fmtTime } from '../components/careerUtils.js';
import { JAVA_LOAD_KEY } from './JavaIDE.jsx';

import Ico from '../components/Ico.jsx';
const pickExport = (mods, name) => { for (const m of Object.values(mods)) if (m[name]) return m[name]; return []; };
const PUZZLES = pickExport(import.meta.glob('../data/codePuzzles.js', { eager: true }), 'PUZZLES');
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const SEC_ICON = { 'Quantitative Aptitude': Calculator, 'Logical Reasoning': Brain, 'Verbal Ability': BookOpenText };
const toQ = (t) => (q) => ({ question: q.q, options: q.options, answer: q.answer, explanation: q.explanation, source: `${t.title}` });

function useCountdown(seconds, running) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => { setLeft(seconds); }, [seconds]);
  useEffect(() => {
    if (!running || left <= 0) return undefined;
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [running, left]);
  return left;
}

function TimedQuiz({ title, questions, minutes, onExit, origin, onDone }) {
  const [done, setDone] = useState(null);
  const left = useCountdown(minutes * 60, !done);
  return (
    <div>
      <div className="row-btns"><button className="btn" onClick={onExit}>← Back</button>
        <span className={`timer ${left < 60 && !done ? 'low' : ''}`}>{done ? `✔ ${done.score}/${done.total}` : left > 0 ? `${fmtTime(left)}` : <><Ico e="⏰" /> Time's up — submit now</>}</span></div>
      <h2>{title}</h2>
      <p className="muted">{questions.length} questions · {minutes} minutes · no negative marking.</p>
      <Quiz questions={questions} origin={origin} onFinish={(score, total) => { setDone({ score, total }); onDone?.(score, total); }} />
    </div>
  );
}

/* ============================== Aptitude home ============================== */
export function AptitudeHome() {
  const [res] = useStudy('upskillr-study-aptitude', {});
  const [test, setTest] = useState(null);
  if (test) return <TimedQuiz {...test} onExit={() => setTest(null)} />;
  const mock = (sec) => {
    const pool = (sec ? APTITUDE.filter((t) => t.section === sec) : APTITUDE).flatMap((t) => t.questions.map(toQ(t)));
    const n = sec ? 20 : 30;
    setTest({ title: sec ? `${sec}: sectional test` : 'Full aptitude mock test', questions: shuffle(pool).slice(0, n), minutes: sec ? 25 : 40, origin: { label: sec || 'Aptitude mock', kind: 'test' }, onDone: () => logEvent('test', { label: 'aptitude' }) });
  };
  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🧮" /> Aptitude &amp; Reasoning</h1>
        <p className="muted">The first round of most campus and off-campus drives. Learn the concepts and short-cuts, practise topic-wise, then take timed sectional and full mock tests. {APTITUDE.reduce((s, t) => s + t.questions.length, 0)} questions in {APTITUDE.length} topics.</p>
        <div className="row-btns">
          <button className="btn primary" disabled={!APTITUDE.length} onClick={() => mock(null)}><Timer size={15} /> Full mock test (30 Q · 40 min)</button>
          <Link className="btn" to="/practice/companies"><Building2 size={15} /> Company-wise kits</Link>
        </div>
      </div>
      {!APTITUDE.length && <p className="muted">Aptitude topics are being added.</p>}
      {APT_SECTIONS.map((sec) => {
        const ts = APTITUDE.filter((t) => t.section === sec);
        if (!ts.length) return null;
        const I = SEC_ICON[sec];
        return (
          <section key={sec}>
            <div className="set-group-head"><h2 className="section-title"><I size={20} /> {sec}</h2><button className="btn small" onClick={() => mock(sec)}><Timer size={14} /> Sectional test</button></div>
            <div className="grid3">
              {ts.map((t) => {
                const r = res[t.id];
                return (
                  <Link key={t.id} to={`/practice/aptitude/${t.id}`} className="card apt-card">
                    <div className="apt-ic"><Ico e={t.icon} /></div>
                    <h3>{t.title}</h3>
                    <p className="muted small">{t.summary}</p>
                    <div className="meta"><span><Ico e="📘" /> {t.concepts.length} concepts</span><span><Ico e="⚡" /> {t.shortcuts.length} short-cuts</span><span><Ico e="📝" /> {t.questions.length} Q</span></div>
                    {r && <><ProgressBar value={r.best / 100} color={r.best >= 70 ? 'var(--ok)' : undefined} /><div className="muted small">Best {r.best}%</div></>}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function AptitudeTopic() {
  const { id } = useParams();
  const t = findAptTopic(id);
  const [tab, setTab] = useState('learn');
  const [run, setRun] = useState(0);
  const [, setRes] = useStudy('upskillr-study-aptitude', {});
  const qs = useMemo(() => (t ? t.questions.map(toQ(t)) : []), [t]);
  if (!t) return <p>Topic not found. <Link to="/practice/aptitude">All topics</Link></p>;
  const save = (score, total) => {
    const pct = Math.round((score / total) * 100);
    setRes((r) => ({ ...r, [t.id]: { best: Math.max(r[t.id]?.best || 0, pct), last: pct, at: Date.now() } }));
  };
  return (
    <div>
      <div className="crumbs"><Link to="/practice/aptitude">Aptitude &amp; Reasoning</Link> › {t.section}</div>
      <div className="page-head"><h1><Ico e={t.icon} /> {t.title}</h1><p className="muted">{t.summary}</p></div>
      <div className="tabs">
        {[['learn', 'Concepts & short-cuts'], ['examples', 'Solved examples'], ['practice', `Practice (${t.questions.length})`], ['timed', 'Timed test']].map(([k, l]) => <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {tab === 'learn' && (
        <div>
          {t.concepts.map((c, i) => <section key={i} className="card theory"><h2>{i + 1}. {c.heading}</h2><RichText text={c.content} /></section>)}
          <div className="card"><h3><Ico e="📐" /> Formulas &amp; rules</h3><ul className="apt-formulas">{t.formulas.map((f, i) => <li key={i}><code>{f}</code></li>)}</ul></div>
          <div className="card"><h3><Ico e="⚡" /> Short-cuts</h3>{t.shortcuts.map((s, i) => <div key={i} className="tip"><b><Inline text={s.trick} /></b><div className="small"><Inline text={s.example} /></div></div>)}</div>
        </div>
      )}
      {tab === 'examples' && t.examples.map((e, i) => (
        <section key={i} className="card"><h3>Example {i + 1}</h3><p><Inline text={e.q} /></p><details><summary className="link-btn">Show solution</summary><div className="steps-box"><RichText text={e.solution} /></div></details></section>
      ))}
      {tab === 'practice' && <Quiz key={`p${run}`} questions={qs} origin={{ label: `Aptitude · ${t.title}`, link: `/practice/aptitude/${t.id}` }} onFinish={save} />}
      {tab === 'timed' && <TimedQuiz key={`t${run}`} title={`${t.title}: timed test`} questions={shuffle(qs).slice(0, 10)} minutes={12} origin={{ label: `Aptitude · ${t.title}`, kind: 'test' }} onDone={save} onExit={() => { setRun(run + 1); setTab('practice'); }} />}
    </div>
  );
}

/* ============================== Company-wise kits ============================== */
// Approximate patterns from recent public information. Companies change patterns often.
export const COMPANIES = [
  { id: 'tcs-nqt', name: 'TCS NQT', color: '#1e40af', about: 'National Qualifier Test used for Ninja / Digital / Prime roles. Foundation section first, then an Advanced section for higher roles.',
    sections: [['Numerical Ability', 'apt:Quantitative Aptitude', 20, 25], ['Verbal Ability', 'apt:Verbal Ability', 25, 25], ['Reasoning Ability', 'apt:Logical Reasoning', 20, 25], ['Advanced Coding', 'code', 2, 90]],
    rounds: ['Online NQT (foundation + advanced)', 'Technical interview (OOP, DBMS, projects, coding)', 'Managerial round', 'HR round'],
    tips: ['Foundation sections are separately timed — you cannot go back to a finished section.', 'Practise reading coding input from STDIN in your language.', 'Revise your final-year project deeply; most technical questions come from it.'] },
  { id: 'infosys', name: 'Infosys', color: '#0369a1', about: 'Online test followed by an interview. Specialist Programmer / Digital Specialist roles have a harder coding round.',
    sections: [['Logical Reasoning', 'apt:Logical Reasoning', 15, 25], ['Mathematical Ability', 'apt:Quantitative Aptitude', 10, 35], ['Verbal Ability', 'apt:Verbal Ability', 20, 20], ['Pseudocode', 'pseudo', 5, 10], ['Coding', 'code', 2, 60]],
    rounds: ['Online test', 'Technical + HR interview'], tips: ['Pseudocode questions test output prediction — practise loops and recursion tracing.', 'Accuracy matters more than attempting every question.', 'Know the Infosys values and recent news for HR.'] },
  { id: 'wipro', name: 'Wipro (Elite NTH)', color: '#7c3aed', about: 'Aptitude, a written communication task and coding, then a combined interview.',
    sections: [['Aptitude (Quant + Logical + Verbal)', 'apt:all', 30, 48], ['Coding', 'code', 2, 60]],
    rounds: ['Online assessment (aptitude, essay writing, coding)', 'Technical + HR interview'], tips: ['Practise a 200-word essay on a general topic in 20 minutes (use the Soft Skills Lab email/GD practice).', 'Two coding questions: aim to solve one fully and the second partially.'] },
  { id: 'accenture', name: 'Accenture', color: '#9333ea', about: 'Cognitive and technical assessment, coding, then a communication assessment and interview.',
    sections: [['Cognitive ability', 'apt:all', 25, 30], ['Technical (pseudocode & concepts)', 'pseudo', 10, 20], ['Coding', 'code', 2, 45]],
    rounds: ['Cognitive & technical assessment', 'Coding round', 'Communication assessment', 'Interview'], tips: ['Revise MS Office, networking and cloud basics for the technical section.', 'The communication test checks pronunciation and listening — practise in the Soft Skills Lab speaking tool.'] },
  { id: 'cognizant', name: 'Cognizant (GenC)', color: '#0e7490', about: 'Aptitude test, then coding and interviews depending on the GenC / GenC Next / GenC Pro role.',
    sections: [['Quantitative', 'apt:Quantitative Aptitude', 15, 20], ['Logical', 'apt:Logical Reasoning', 15, 20], ['Verbal', 'apt:Verbal Ability', 20, 20], ['Coding', 'code', 2, 60]],
    rounds: ['Aptitude assessment', 'Coding / technical assessment', 'Technical + HR interview'], tips: ['Practise SQL queries and OOP basics for the technical interview.', 'Keep answers short and structured in HR (use STAR).'] },
  { id: 'capgemini', name: 'Capgemini', color: '#0284c7', about: 'Pseudocode, English, game-based aptitude and behavioural tests, then coding and interviews.',
    sections: [['Pseudocode', 'pseudo', 15, 20], ['English communication', 'apt:Verbal Ability', 20, 20], ['Reasoning', 'apt:Logical Reasoning', 15, 20], ['Coding', 'code', 2, 45]],
    rounds: ['Online assessments', 'Technical interview', 'HR interview'], tips: ['Pseudocode is predict-the-output style: trace variables carefully on paper.', 'Game-based aptitude rewards calm, quick decisions — sleep well before the test.'] },
];

function buildSection([name, kind, n]) {
  if (kind === 'code') return { name, kind, items: shuffle(codingProblems).slice(0, n) };
  if (kind === 'pseudo') {
    const pool = PUZZLES.filter((p) => p.type === 'output').map((p) => ({ question: 'What is the output of this code?', code: p.code, options: p.options, answer: p.answer, explanation: p.explanation, source: 'Pseudocode / output' }));
    return { name, kind, items: shuffle(pool).slice(0, n) };
  }
  const sec = kind.slice(4);
  const pool = APTITUDE.filter((t) => sec === 'all' || t.section === sec).flatMap((t) => t.questions.map(toQ(t)));
  return { name, kind, items: shuffle(pool).slice(0, n) };
}

function CodeSection({ items, onDone }) {
  const [solved, setSolved] = useState({});
  const open = (p) => { try { sessionStorage.setItem(JAVA_LOAD_KEY, JSON.stringify({ files: { 'Main.java': p.starter }, expected: p.expected, title: p.title })); } catch { /* ignore */ } window.open(`${window.location.pathname}#/tools/java-ide`, '_blank'); };
  return (
    <div>
      {items.map((p, i) => (
        <div key={p.id} className="card">
          <div className="meta"><span className={`lvl lvl-${p.level}`}>{p.level}</span><span>{p.topic}</span></div>
          <h3>Problem {i + 1}: {p.title}</h3>
          <RichText text={p.statement} />
          <div className="grid2" style={{ marginBottom: 0 }}><div><b>Input</b><pre className="jc-io">{p.input || '—'}</pre></div><div><b>Output</b><pre className="jc-io">{p.output || '—'}</pre></div></div>
          <div className="row-btns">
            <button className="btn" onClick={() => open(p)}><Code2 size={15} /> Open in Java IDE (new tab)</button>
            <label className="check"><input type="checkbox" checked={!!solved[p.id]} onChange={() => setSolved({ ...solved, [p.id]: !solved[p.id] })} /> I solved it and my output matched</label>
          </div>
        </div>
      ))}
      <button className="btn primary" onClick={() => onDone(Object.values(solved).filter(Boolean).length, items.length)}>Submit coding section</button>
      <p className="muted small">The IDE opens in a new tab so your timer keeps running here.</p>
    </div>
  );
}

export function CompanyKits() {
  const { id } = useParams();
  const c = COMPANIES.find((x) => x.id === id);
  const [hist, setHist] = useStudy('upskillr-study-company', {});
  const [mock, setMock] = useState(null); // { secs, si, scores }
  if (!c) {
    return (
      <div>
        <div className="page-head">
          <h1><Ico e="🏢" /> Company-wise Prep Kits</h1>
          <p className="muted">Practise in the pattern used by popular IT recruiters: sections, question counts and time limits, plus interview rounds and tips. Patterns are approximate (from public information) and change often — always check the official notification.</p>
        </div>
        <div className="grid3">
          {COMPANIES.map((x) => (
            <Link key={x.id} to={`/practice/companies/${x.id}`} className="card ck-card" style={{ '--c': x.color }}>
              <div className="ck-logo">{x.name.slice(0, 2).toUpperCase()}</div>
              <h3>{x.name}</h3>
              <p className="muted small">{x.about}</p>
              <div className="meta"><span><Ico e="🧩" /> {x.sections.length} sections</span><span><Ico e="⏱" /> {x.sections.reduce((s, q) => s + q[3], 0)} min</span>{hist[x.id] && <span className="badge ok">Best {hist[x.id].best}%</span>}</div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  const start = () => setMock({ secs: c.sections.map(buildSection), meta: c.sections, si: 0, scores: [] });
  if (mock) {
    const finishSec = (score, total) => {
      const scores = [...mock.scores, { name: mock.meta[mock.si][0], score, total }];
      if (mock.si + 1 < mock.secs.length) { setMock({ ...mock, si: mock.si + 1, scores }); window.scrollTo(0, 0); return; }
      const pct = Math.round((scores.reduce((s, x) => s + x.score, 0) / Math.max(1, scores.reduce((s, x) => s + x.total, 0))) * 100);
      setHist((h) => ({ ...h, [c.id]: { best: Math.max(h[c.id]?.best || 0, pct), last: pct, at: Date.now(), scores } }));
      logEvent('test', { label: c.name });
      setMock({ ...mock, scores, done: pct });
    };
    if (mock.done != null) {
      return (
        <div className="card">
          <h2>{c.name} mock — result: {mock.done}%</h2>
          <div className="table-wrap"><table className="data-table"><thead><tr><th>Section</th><th>Score</th></tr></thead><tbody>{mock.scores.map((s) => <tr key={s.name}><td>{s.name}</td><td>{s.score}/{s.total}</td></tr>)}</tbody></table></div>
          <p className="muted">Wrong MCQs were added to your Mistake Notebook. Practise weak sections in the Aptitude module, then retake.</p>
          <div className="row-btns"><button className="btn primary" onClick={start}><RotateCcw size={15} /> Retake</button><button className="btn" onClick={() => setMock(null)}>Back to kit</button><Link className="btn" to="/practice/video-interview">Practise the interview round</Link></div>
        </div>
      );
    }
    const sec = mock.secs[mock.si];
    const [name, , , minutes] = mock.meta[mock.si];
    return (
      <div>
        <div className="ck-progress">{mock.meta.map((m, k) => <span key={k} className={k < mock.si ? 'done' : k === mock.si ? 'cur' : ''}>{k + 1}. {m[0]}</span>)}</div>
        {sec.kind === 'code'
          ? <CodeTimed key={mock.si} name={name} minutes={minutes} items={sec.items} onDone={finishSec} />
          : sec.items.length
            ? <TimedQuiz key={mock.si} title={`${c.name} · Section ${mock.si + 1}: ${name}`} questions={sec.items} minutes={minutes} origin={{ label: `${c.name} mock · ${name}`, kind: 'test' }} onExit={() => setMock(null)} onDone={(s, t) => setTimeout(() => finishSec(s, t), 1500)} />
            : <div className="card"><p className="muted">No questions available for this section yet.</p><button className="btn" onClick={() => finishSec(0, 0)}>Skip section</button></div>}
      </div>
    );
  }
  return (
    <div>
      <div className="crumbs"><Link to="/practice/companies">Company kits</Link> › {c.name}</div>
      <div className="page-head"><h1><Ico e="🏢" /> {c.name}</h1><p className="muted">{c.about}</p>
        <button className="btn primary" onClick={start}><Play size={15} /> Start full mock test</button>
      </div>
      <div className="grid2">
        <div className="card"><h3><Ico e="📋" /> Test pattern (approximate)</h3>
          <div className="table-wrap"><table className="data-table"><thead><tr><th>Section</th><th>Questions</th><th>Time</th></tr></thead><tbody>{c.sections.map(([n, , q, m]) => <tr key={n}><td>{n}</td><td>{q}</td><td>{m} min</td></tr>)}</tbody></table></div>
          <p className="muted small">Each section has its own timer. Check the official notification for the latest pattern.</p>
        </div>
        <div className="card"><h3><Ico e="🗂" /> Selection rounds</h3><ol>{c.rounds.map((r) => <li key={r}>{r}</li>)}</ol><h3><Ico e="💡" /> Tips</h3><ul>{c.tips.map((t) => <li key={t}>{t}</li>)}</ul></div>
      </div>
      <div className="card"><h3><Ico e="🎤" /> HR questions to prepare</h3><ul>{shuffle(hrQuestions).slice(0, 8).map((q) => <li key={q.q}>{q.q}</li>)}</ul><Link className="btn small" to="/practice/video-interview">Practise on video</Link></div>
      {hist[c.id] && <div className="card"><h3>Your last attempt: {hist[c.id].last}% (best {hist[c.id].best}%)</h3></div>}
    </div>
  );
}

function CodeTimed({ name, minutes, items, onDone }) {
  const left = useCountdown(minutes * 60, true);
  return (
    <div>
      <span className={`timer ${left < 300 ? 'low' : ''}`}>{left > 0 ? `${fmtTime(left)}` : <><Ico e="⏰" /> Time's up — submit now</>}</span>
      <h2>{name}</h2>
      <CodeSection items={items} onDone={onDone} />
    </div>
  );
}

/* ============================== Video Mock Interview ============================== */
const REVIEW = ['Looked at the camera (eye contact)', 'Smiled and sounded confident', 'Sat straight, calm hands', 'Clear voice, not too fast', 'Answer had a structure (intro → example → result)', 'Ended the answer confidently'];

export function VideoInterview() {
  const [qSet, setQSet] = useState('hr');
  const [qi, setQi] = useState(0);
  const [stream, setStream] = useState(null);
  const [camErr, setCamErr] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | count | rec | review
  const [count, setCount] = useState(3);
  const [secs, setSecs] = useState(0);
  const [clips, setClips] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [checks, setChecks] = useState({});
  const live = useRef(null);
  const rec = useRef(null);
  const chunks = useRef([]);
  const dict = useDictation((t) => setTranscript((x) => (x ? `${x} ${t}` : t)));
  const questions = useMemo(() => {
    if (qSet === 'hr') return hrQuestions.map((q) => q.q);
    const t = tracks[qSet];
    return t ? t.topics.flatMap((x) => (x.interview || []).map((q) => q.q)) : [];
  }, [qSet]);
  const q = questions[qi % Math.max(1, questions.length)] || 'Tell me about yourself.';

  useEffect(() => () => { stream?.getTracks().forEach((tr) => tr.stop()); clips.forEach((c) => URL.revokeObjectURL(c.url)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (live.current && stream) live.current.srcObject = stream; }, [stream, phase]);
  useEffect(() => {
    if (phase === 'count') { if (count <= 0) { begin(); return undefined; } const t = setTimeout(() => setCount(count - 1), 1000); return () => clearTimeout(t); }
    if (phase === 'rec') { if (secs >= 120) { stop(); return undefined; } const t = setTimeout(() => setSecs(secs + 1), 1000); return () => clearTimeout(t); }
    return undefined;
  }, [phase, count, secs]); // eslint-disable-line react-hooks/exhaustive-deps

  const camera = async () => {
    setCamErr('');
    try { setStream(await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true })); } catch (e) { setCamErr(e?.name === 'NotAllowedError' ? 'Camera / microphone permission was blocked. Allow it from the address bar and try again.' : 'No camera found or it is used by another app.'); }
  };
  const begin = () => {
    chunks.current = [];
    const type = ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'].find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || '';
    const r = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    r.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
    r.onstop = () => {
      const blob = new Blob(chunks.current, { type: r.mimeType || 'video/webm' });
      setClips((c) => [{ url: URL.createObjectURL(blob), q, secs, at: Date.now(), ext: (r.mimeType || '').includes('mp4') ? 'mp4' : 'webm' }, ...c].slice(0, 6));
    };
    r.start(1000);
    rec.current = r;
    setTranscript(''); setSecs(0); setChecks({});
    if (dict.supported) dict.start();
    setPhase('rec');
  };
  const stop = () => { try { rec.current?.stop(); } catch { /* ignore */ } dict.stop(); setPhase('review'); logEvent('interview', { q }); };
  const a = phase === 'review' ? analyzeSpeech(transcript, secs, fillerWords) : null;
  const clip = clips[0];

  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🎥" /> Video Mock Interview</h1>
        <p className="muted">Answer real interview questions on camera, then watch yourself like an interviewer would. The video stays only in this browser tab — nothing is uploaded. Download it if you want to keep it.</p>
      </div>
      <div className="vi-grid">
        <div className="card vi-stage">
          <div className="vi-q"><span className="muted small">Question {qi + 1}</span><h2>{q}</h2></div>
          <div className="vi-video">
            {phase === 'review' && clip ? <video src={clip.url} controls playsInline /> : stream ? <video ref={live} autoPlay muted playsInline className="mirror" /> : (
              <div className="vi-off"><Camera size={40} /><p>Turn on your camera and microphone to start.</p><button className="btn primary" onClick={camera}><Video size={15} /> Turn on camera</button>{camErr && <p className="explain bad">{camErr}</p>}</div>
            )}
            {phase === 'count' && <div className="vi-count">{count || 'Go!'}</div>}
            {phase === 'rec' && <div className="vi-rec"><span className="vi-dot" /> REC {fmtTime(secs)} / 2:00</div>}
          </div>
          <div className="row-btns">
            {stream && phase === 'idle' && <button className="btn primary" onClick={() => { setCount(3); setPhase('count'); }}><Play size={15} /> Start answering</button>}
            {phase === 'rec' && <button className="btn danger-btn" onClick={stop}><Square size={15} /> Stop</button>}
            {phase === 'review' && <><button className="btn primary" onClick={() => setPhase('idle')}><RotateCcw size={15} /> Try again</button><button className="btn" onClick={() => { setQi(qi + 1); setPhase('idle'); }}>Next question →</button>{clip && <a className="btn" href={clip.url} download={`mock-interview-${new Date(clip.at).toISOString().slice(0, 16).replace(/[:T]/g, '-')}.${clip.ext}`}><Download size={15} /> Download video</a>}</>}
            {phase === 'idle' && <button className="btn" onClick={() => setQi(qi + 1)}>Skip question</button>}
          </div>
          {dict.listening && <div className="jc-live"><Mic size={13} /> {dict.interim || 'Listening…'}</div>}
        </div>
        <div className="vi-side">
          <div className="card">
            <h3>Questions</h3>
            <select value={qSet} onChange={(e) => { setQSet(e.target.value); setQi(0); }}>
              <option value="hr">HR round</option>
              {['corejava', 'springboot', 'python', 'js', 'react', 'mysql', 'dotnet'].filter((k) => tracks[k]).map((k) => <option key={k} value={k}>Technical: {tracks[k].short}</option>)}
            </select>
            <ul className="vi-tips"><li>Look at the camera lens, not the screen.</li><li>Pause 2 seconds before answering.</li><li>Aim for 60–90 seconds per answer.</li><li>Good light in front of you, plain background.</li></ul>
          </div>
          {phase === 'review' && (
            <div className="card">
              <h3>Your review</h3>
              {a && (dict.supported ? (
                <div className="stats"><div><b>{fmtTime(secs)}</b><span>Duration</span></div><div><b>{a.wpm ?? '–'}</b><span>Words/min</span></div><div><b className={a.fillerTotal > 3 ? 'jc-warn' : ''}>{a.fillerTotal}</b><span>Filler words</span></div></div>
              ) : <p className="muted small">Speech analysis needs Chrome or Edge. Use the checklist below.</p>)}
              {a?.fillerTotal > 0 && <p className="small">Fillers: {Object.entries(a.fillerCounts).map(([w, n]) => <span key={w} className="jc-kw bad">{w} ×{n}</span>)}</p>}
              <h4>Watch your video and tick honestly</h4>
              {REVIEW.map((r) => <label key={r} className="check" style={{ display: 'flex' }}><input type="checkbox" checked={!!checks[r]} onChange={() => setChecks({ ...checks, [r]: !checks[r] })} /> {r}</label>)}
              <ProgressBar value={Object.values(checks).filter(Boolean).length / REVIEW.length} />
              {transcript && <details><summary className="small">Transcript</summary><p className="small">{transcript}</p></details>}
            </div>
          )}
          {clips.length > 1 && <div className="card"><h3>This session</h3>{clips.slice(1).map((c) => <div key={c.at} className="vi-clip"><span className="small">{c.q.slice(0, 60)}… ({fmtTime(c.secs)})</span><a className="link-btn" href={c.url} download={`mock-interview.${c.ext}`}><Download size={14} /></a></div>)}<p className="muted small">Videos are lost when you close this tab unless you download them.</p></div>}
        </div>
      </div>
      <p className="muted small"><CheckCircle2 size={13} /> Privacy: recording happens on your device only.</p>
    </div>
  );
}
