import { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardCheck, MessagesSquare, Code2, BarChart3, Mic, MicOff, Timer, Star, Sparkles, Play, Eye, CheckCircle2 } from 'lucide-react';
import { tracks } from '../data/index.js';
import { JAVA_TRACKS, codingProblems, hrQuestions } from '../data/javaCareer.js';
import Quiz from '../components/Quiz.jsx';
import RichText, { Inline } from '../components/RichText.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import { useProgress } from '../progress.js';
import { useLocalState, seeded, shuffle, hashStr, fmtTime, useCountdown, useDictation, keywordsOf, coverage } from '../components/careerUtils.js';
import { JAVA_LOAD_KEY } from './JavaIDE.jsx';
import ApiKeyBox, { useApiKey } from '../ai/ApiKeyBox.jsx';
import { streamClaude, describeError, stopNote } from '../ai/claudeClient.js';

import Ico from '../components/Ico.jsx';
const RESULTS_KEY = 'xlpbi-java-results-v1';
const emptyResults = { tests: [], interviews: [], coding: {} };

const javaTopics = () => JAVA_TRACKS.flatMap((k) => (tracks[k]?.topics || []).map((t) => ({ ...t, track: k })));

// ---------- test series ----------
function buildTests() {
  const topics = javaTopics();
  const toQs = (list) => list.flatMap((t) => (t.quiz || []).map((q) => ({ ...q, source: `${tracks[t.track].short} · Day ${t.day}` })));
  const tests = [];
  const all = toQs(topics);
  const mixed = shuffle(all, seeded(20261118));
  const grand = Math.min(12, Math.floor(mixed.length / 30));
  for (let n = 0; n < grand; n++) {
    tests.push({ id: `grand-${n + 1}`, group: 'Grand Mock Tests (all Java courses)', title: `Java Full Stack Mock Test ${n + 1}`, minutes: 30, questions: mixed.slice(n * 30, n * 30 + 30) });
  }
  JAVA_TRACKS.forEach((k) => {
    const list = topics.filter((t) => t.track === k);
    const pool = toQs(list);
    if (!pool.length) return;
    const n = Math.min(30, pool.length);
    tests.push({ id: `track-${k}`, group: 'Course-wise Tests', title: `${tracks[k].name}: Full Test`, minutes: n, questions: shuffle(pool, seeded(hashStr(k))).slice(0, n) });
    const mods = [...new Set(list.map((t) => t.module).filter(Boolean))];
    mods.forEach((m) => {
      const mq = toQs(list.filter((t) => t.module === m));
      if (mq.length < 5) return;
      const c = Math.min(25, mq.length);
      tests.push({ id: `mod-${k}-${hashStr(m)}`, group: `Module-wise Tests · ${tracks[k].short}`, title: m, minutes: Math.max(5, c), questions: shuffle(mq, seeded(hashStr(m))).slice(0, c) });
    });
  });
  return tests;
}

function TestSeries({ results, setResults }) {
  const tests = useMemo(buildTests, []);
  const [active, setActive] = useState(null);
  const [runId, setRunId] = useState(0);
  const [done, setDone] = useState(false);
  const left = useCountdown(active ? active.minutes * 60 : 0, !!active && !done, runId);
  const groups = [...new Set(tests.map((t) => t.group))];
  const best = (id) => results.tests.filter((r) => r.id === id).reduce((b, r) => Math.max(b, Math.round((r.score / r.total) * 100)), -1);
  const attempts = (id) => results.tests.filter((r) => r.id === id).length;

  if (active) {
    return (
      <div>
        <div className="row-btns">
          <button className="btn" onClick={() => setActive(null)}>← All tests</button>
          <span className={`timer ${left < 60 && !done ? 'low' : ''}`}>{done ? '✔ Submitted' : left <= 0 ? <><Ico e="⏰" /> Time's up! Submit now.</> : `${fmtTime(left)}`}</span>
        </div>
        <h2>{active.title}</h2>
        <p className="muted">{active.questions.length} questions · {active.minutes} minutes · 1 mark each · no negative marking. Answer all questions, then submit to see explanations.</p>
        <Quiz
          key={runId}
          questions={active.questions}
          origin={{ label: active.title, kind: 'test' }}
          onFinish={(score, total) => {
            setDone(true);
            setResults((r) => ({ ...r, tests: [...r.tests, { id: active.id, title: active.title, score, total, secs: active.minutes * 60 - left, date: new Date().toISOString() }] }));
          }}
        />
      </div>
    );
  }

  if (!tests.length) return <p className="muted">No test questions available yet.</p>;
  return (
    <div>
      <p className="muted">{tests.length} timed tests built from {tests.reduce((s, t) => s + t.questions.length, 0)} questions across the Java courses. Each test always has the same questions, so you can retake it and track your improvement.</p>
      {groups.map((g) => (
        <section key={g}>
          <h3 className="section-title">{g}</h3>
          <div className="grid3">
            {tests.filter((t) => t.group === g).map((t) => {
              const b = best(t.id);
              return (
                <div key={t.id} className="card jc-test">
                  <h4>{t.title}</h4>
                  <div className="meta"><span><Ico e="📝" /> {t.questions.length} Q</span><span><Ico e="⏱" /> {t.minutes} min</span>{attempts(t.id) > 0 && <span><Ico e="🔁" /> {attempts(t.id)} attempt(s)</span>}</div>
                  {b >= 0 && <div className={`jc-best ${b >= 70 ? 'ok' : 'bad'}`}>Best: {b}%</div>}
                  <button className="btn primary small" onClick={() => { setActive(t); setDone(false); setRunId((x) => x + 1); window.scrollTo(0, 0); }}><Play size={14} /> {b >= 0 ? 'Retake' : 'Start test'}</button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------- mock interview ----------
function buildPool(round, track, level) {
  const tech = javaTopics()
    .filter((t) => track === 'all' || t.track === track)
    .flatMap((t) => (t.interview || []).map((x, j) => ({ q: x.q, a: x.a, level: x.level, src: `${tracks[t.track].short} · ${t.title}`, qid: `${t.track}/${t.id}#${j}`, kind: 'Technical' })))
    .filter((x) => level === 'All' || x.level === level);
  const hr = hrQuestions.map((x, j) => ({ q: x.q, a: x.sample, tip: x.tip, keys: x.keywords, src: `HR · ${x.category}`, qid: `hr#${j}`, kind: 'HR' }));
  if (round === 'tech') return tech;
  if (round === 'hr') return hr;
  return [...tech, ...hr];
}

const AI_SYSTEM = 'You are a friendly but honest interviewer at an IT company, interviewing a fresher for a Java developer role. Evaluate the candidate\'s spoken/typed answer. Reply in simple English with these sections: **Score: X/10**, **What was good**, **What was missing or wrong**, **A better answer** (4-6 sentences the candidate could say), **Tip for delivery**. Be concise.';

function MockInterview({ setResults }) {
  const p = useProgress();
  const [round, setRound] = useState('tech');
  const [track, setTrack] = useState('all');
  const [level, setLevel] = useState('All');
  const [count, setCount] = useState(5);
  const [secs, setSecs] = useState(120);
  const [sess, setSess] = useState(null); // {items, idx, phase, answers}
  const [text, setText] = useState('');
  const [aiText, setAiText] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [apiKey, setKey] = useApiKey();
  const [model, setModel] = useState('claude-sonnet-5-5');
  const [effort, setEffort] = useState('low');
  const dict = useDictation((t) => setText((x) => (x ? `${x} ${t}` : t)));

  const pool = useMemo(() => buildPool(round, track, level), [round, track, level]);
  const item = sess?.items[sess.idx];
  const answering = sess?.phase === 'answer';
  const left = useCountdown(secs, answering && secs > 0, sess ? `${sess.idx}-${sess.started}` : 0);

  const start = () => {
    setSess({ items: shuffle(pool).slice(0, count), idx: 0, phase: 'answer', answers: [], started: Date.now() });
    setText(''); setAiText('');
  };
  const submit = () => {
    dict.stop();
    const keys = item.keys?.length ? item.keys.map((k) => k.toLowerCase()) : keywordsOf(item.a);
    const cov = coverage(text, keys);
    setSess((s) => ({ ...s, phase: 'review', answers: [...s.answers, { q: item.q, text, cov, rating: 0, kind: item.kind, timeUsed: secs ? secs - left : null }] }));
  };
  useEffect(() => { if (answering && secs > 0 && left <= 0) submit(); }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const rate = (n) => setSess((s) => { const a = [...s.answers]; a[a.length - 1] = { ...a[a.length - 1], rating: n }; return { ...s, answers: a }; });
  const next = () => {
    setText(''); setAiText('');
    if (sess.idx + 1 >= sess.items.length) {
      const a = sess.answers;
      const rated = a.filter((x) => x.rating);
      setResults((r) => ({
        ...r,
        interviews: [...r.interviews, {
          date: new Date().toISOString(), round: round === 'tech' ? `Technical (${track === 'all' ? 'all Java' : tracks[track].short})` : round === 'hr' ? 'HR' : 'Mixed',
          count: a.length, coverage: Math.round(a.reduce((s, x) => s + x.cov.pct, 0) / (a.length || 1)),
          rating: rated.length ? +(rated.reduce((s, x) => s + x.rating, 0) / rated.length).toFixed(1) : null,
        }],
      }));
      setSess((s) => ({ ...s, phase: 'done' }));
    } else setSess((s) => ({ ...s, idx: s.idx + 1, phase: 'answer', started: Date.now() }));
  };

  const askAI = async () => {
    const last = sess.answers[sess.answers.length - 1];
    setAiBusy(true); setAiText('');
    try {
      const { message } = await streamClaude({
        apiKey, model, effort, system: AI_SYSTEM,
        messages: [{ role: 'user', content: `Interview question (${item.kind}): ${item.q}\n\nReference answer (for you, the interviewer):\n${item.a}\n\nCandidate's answer:\n${last.text || '(no answer given)'}` }],
        onText: (d) => setAiText((x) => x + d),
      });
      const note = stopNote(message);
      if (note) setAiText((x) => `${x}\n\n_${note}_`);
    } catch (e) {
      setAiText(`${describeError(e)}`);
    } finally { setAiBusy(false); }
  };

  if (!sess) {
    return (
      <div>
        <div className="card info">
          <b>How it works:</b> a question appears with a timer. Answer it as you would in a real interview: type, or press <b><Ico e="🎤" /> Speak</b> to answer out loud (Chrome/Edge convert your speech to text). Then compare with the model answer, see which key points you covered, rate yourself, and optionally get feedback from Claude using your own API key.
        </div>
        <div className="quiz-settings">
          <label>Round <select value={round} onChange={(e) => setRound(e.target.value)}><option value="tech">Technical</option><option value="hr">HR</option><option value="mixed">Mixed (Technical + HR)</option></select></label>
          {round !== 'hr' && <label>Course <select value={track} onChange={(e) => setTrack(e.target.value)}><option value="all">All Java courses</option>{JAVA_TRACKS.filter((k) => tracks[k]?.topics.length).map((k) => <option key={k} value={k}>{tracks[k].name}</option>)}</select></label>}
          {round !== 'hr' && <label>Level <select value={level} onChange={(e) => setLevel(e.target.value)}>{['All', 'Easy', 'Medium', 'Hard'].map((l) => <option key={l}>{l}</option>)}</select></label>}
          <label>Questions <select value={count} onChange={(e) => setCount(Number(e.target.value))}>{[3, 5, 10, 15, 20].map((n) => <option key={n}>{n}</option>)}</select></label>
          <label>Time per question <select value={secs} onChange={(e) => setSecs(Number(e.target.value))}><option value={0}>No limit</option>{[60, 90, 120, 180, 300].map((n) => <option key={n} value={n}>{n / 60} min</option>)}</select></label>
          <button className="btn primary" disabled={!pool.length} onClick={start}><Play size={15} /> Start interview</button>
        </div>
        <p className="muted small">{pool.length} questions available with these settings.</p>
      </div>
    );
  }

  if (sess.phase === 'done') {
    const a = sess.answers;
    return (
      <div>
        <h2>Interview report</h2>
        <div className="stats">
          <div><b>{a.length}</b><span>Questions</span></div>
          <div><b>{Math.round(a.reduce((s, x) => s + x.cov.pct, 0) / (a.length || 1))}%</b><span>Key points covered</span></div>
          <div><b>{a.filter((x) => x.rating).length ? (a.filter((x) => x.rating).reduce((s, x) => s + x.rating, 0) / a.filter((x) => x.rating).length).toFixed(1) : '–'}/5</b><span>Self rating</span></div>
        </div>
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>#</th><th>Question</th><th>Covered</th><th>Rating</th></tr></thead>
          <tbody>{a.map((x, i) => <tr key={i}><td>{i + 1}</td><td><Inline text={x.q} /></td><td>{x.cov.pct}%</td><td>{x.rating ? `${x.rating}/5` : '–'}</td></tr>)}</tbody>
        </table></div>
        <p className="muted">Questions with low coverage or rating: revise them in the course and star them for the Flashcards tool.</p>
        <div className="row-btns"><button className="btn primary" onClick={start}>Another interview (same settings)</button><button className="btn" onClick={() => setSess(null)}>Change settings</button></div>
      </div>
    );
  }

  const last = sess.answers[sess.answers.length - 1];
  return (
    <div>
      <div className="row-btns">
        <span className="muted">Question {sess.idx + 1} of {sess.items.length} · {item.src}</span>
        {answering && secs > 0 && <span className={`timer ${left < 20 ? 'low' : ''}`}><Timer size={14} /> {fmtTime(left)}</span>}
        <button className="link-btn danger" onClick={() => { dict.stop(); setSess(null); }}>End interview</button>
      </div>
      <div className="card jc-question">
        <div className="fc-label">{item.kind} question {item.level && <span className={`lvl lvl-${item.level}`}>{item.level}</span>}</div>
        <h2><Inline text={item.q} /></h2>
        {item.tip && !answering && <div className="tip"><b>What the interviewer checks:</b> {item.tip}</div>}
      </div>
      {answering ? (
        <div className="card">
          <textarea className="input jc-answer" rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your answer here, or press Speak and answer out loud…" />
          {dict.interim && <div className="muted small"><Ico e="🎙" /> {dict.interim}</div>}
          <div className="row-btns">
            {dict.supported ? (
              <button className={`btn ${dict.listening ? 'danger-btn' : ''}`} onClick={dict.listening ? dict.stop : dict.start}>{dict.listening ? <><MicOff size={15} /> Stop speaking</> : <><Mic size={15} /> Speak</>}</button>
            ) : <span className="muted small">Speech input needs Chrome or Edge; you can type instead.</span>}
            <button className="btn primary" onClick={submit}>Submit answer</button>
            <span className="muted small">{(text.match(/\S+/g) || []).length} words</span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid2">
            <div className="card"><h4>Your answer</h4>{last.text ? <p className="jc-pre">{last.text}</p> : <p className="muted">(no answer)</p>}</div>
            <div className="card"><h4>Model answer</h4><RichText text={item.a} /></div>
          </div>
          <div className="card">
            <h4>Key points covered: {last.cov.pct}%</h4>
            <div className="chips">
              {last.cov.hit.map((k) => <span key={k} className="jc-kw ok">✓ {k}</span>)}
              {last.cov.miss.map((k) => <span key={k} className="jc-kw bad">✗ {k}</span>)}
            </div>
            <div className="row-btns">
              <b>Rate your answer:</b>
              {[1, 2, 3, 4, 5].map((n) => <button key={n} className={`chip ${last.rating === n ? 'active' : ''}`} onClick={() => rate(n)}>{n}</button>)}
              {item.qid && <button className={`btn small ${p.bookmarks[item.qid] ? 'star-on' : ''}`} onClick={() => p.toggleBookmark(item.qid)}><Star size={14} /> {p.bookmarks[item.qid] ? 'Starred' : 'Star for revision'}</button>}
            </div>
          </div>
          <div className="card">
            <h4><Sparkles size={16} /> AI interviewer feedback (optional)</h4>
            <ApiKeyBox apiKey={apiKey} setKey={setKey} model={model} setModel={setModel} effort={effort} setEffort={setEffort} compact />
            <button className="btn" disabled={!apiKey || aiBusy} onClick={askAI}>{aiBusy ? 'Evaluating…' : 'Get feedback from Claude'}</button>
            {aiText && <div className="ai-answer"><RichText text={aiText} /></div>}
          </div>
          <div className="row-btns"><button className="btn primary" onClick={next}>{sess.idx + 1 >= sess.items.length ? 'Finish & see report' : 'Next question →'}</button></div>
        </>
      )}
    </div>
  );
}

// ---------- coding round ----------
function CodingRound({ results, setResults }) {
  const nav = useNavigate();
  const [level, setLevel] = useState('All');
  const [topic, setTopic] = useState('All');
  const [sel, setSel] = useState(null);
  const [hints, setHints] = useState(0);
  const [showSol, setShowSol] = useState(false);
  const topics = ['All', ...new Set(codingProblems.map((x) => x.topic))];
  const list = codingProblems.filter((x) => (level === 'All' || x.level === level) && (topic === 'All' || x.topic === topic));
  const solved = results.coding || {};
  const open = (files, expected, title, stdin = '') => {
    try { sessionStorage.setItem(JAVA_LOAD_KEY, JSON.stringify({ files, expected, title, stdin })); } catch { /* ignore */ }
    nav('/tools/java-ide');
  };
  const pick = (x) => { setSel(x); setHints(0); setShowSol(false); };

  if (!codingProblems.length) return <p className="muted">Coding problems are being added.</p>;
  if (sel) {
    const x = sel;
    return (
      <div>
        <button className="btn" onClick={() => setSel(null)}>← All problems</button>
        <h2 style={{ marginTop: '.8rem' }}>{x.title} <span className={`lvl lvl-${x.level}`}>{x.level}</span></h2>
        <div className="meta"><span>{x.topic}</span>{solved[x.id] && <span className="jc-solved">✓ Solved</span>}</div>
        <div className="card"><RichText text={x.statement} />
          <div className="grid2" style={{ marginBottom: 0 }}>
            <div><b>Sample input</b><pre className="jc-io">{x.input || '—'}</pre></div>
            <div><b>Sample output</b><pre className="jc-io">{x.output || '—'}</pre></div>
          </div>
        </div>
        {(x.hints || []).slice(0, hints).map((h, i) => <div key={i} className="tip"><Ico e="💡" /> Hint {i + 1}: <Inline text={h} /></div>)}
        <div className="row-btns">
          <button className="btn primary" onClick={() => open({ 'Main.java': x.starter }, x.expected, x.title, x.stdin)}><Code2 size={15} /> Solve in Java IDE</button>
          {hints < (x.hints || []).length && <button className="btn" onClick={() => setHints(hints + 1)}>Show hint {hints + 1}</button>}
          <button className="btn" onClick={() => setShowSol(!showSol)}><Eye size={15} /> {showSol ? 'Hide' : 'Show'} solution</button>
          <button className={`btn ${solved[x.id] ? 'success' : ''}`} onClick={() => setResults((r) => ({ ...r, coding: { ...r.coding, [x.id]: !r.coding?.[x.id] } }))}><CheckCircle2 size={15} /> {solved[x.id] ? 'Solved' : 'Mark as solved'}</button>
        </div>
        {showSol && (
          <>
            <CodeBlock code={x.solution} label="Main.java (solution)" />
            <CodeBlock code={x.expected} label="Expected output" />
            <button className="btn small" onClick={() => open({ 'Main.java': x.solution }, x.expected, `${x.title} (solution)`, x.stdin)}>Open solution in Java IDE</button>
            <div className="card" style={{ marginTop: '.8rem' }}><h4>Approach & complexity</h4><RichText text={x.explanation} />
              {x.followUps?.length > 0 && <><h4>Interviewer follow-up questions</h4><ul>{x.followUps.map((f, i) => <li key={i}><Inline text={f} /></li>)}</ul></>}
            </div>
          </>
        )}
      </div>
    );
  }
  return (
    <div>
      <p className="muted">{codingProblems.length} coding-round problems asked to Java freshers. Solved: {codingProblems.filter((x) => solved[x.id]).length}/{codingProblems.length}. Write the code yourself first, then compare with the solution.</p>
      <div className="quiz-settings">
        <label>Level <select value={level} onChange={(e) => setLevel(e.target.value)}>{['All', 'Easy', 'Medium', 'Hard'].map((l) => <option key={l}>{l}</option>)}</select></label>
        <label>Topic <select value={topic} onChange={(e) => setTopic(e.target.value)}>{topics.map((l) => <option key={l}>{l}</option>)}</select></label>
      </div>
      <div className="grid3" style={{ marginTop: '1rem' }}>
        {list.map((x) => (
          <button key={x.id} className={`card jc-prob ${solved[x.id] ? 'is-done' : ''}`} onClick={() => pick(x)}>
            <div className="meta"><span className={`lvl lvl-${x.level}`}>{x.level}</span><span>{x.topic}</span>{solved[x.id] && <span className="jc-solved">✓</span>}</div>
            <h4>{x.title}</h4>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- results ----------
function Results({ results, setResults }) {
  const t = [...results.tests].reverse();
  const iv = [...results.interviews].reverse();
  const avg = results.tests.length ? Math.round(results.tests.reduce((s, r) => s + (r.score / r.total) * 100, 0) / results.tests.length) : null;
  const solved = Object.values(results.coding || {}).filter(Boolean).length;
  const d = (s) => new Date(s).toLocaleString();
  return (
    <div>
      <div className="stats">
        <div><b>{results.tests.length}</b><span>Tests taken</span></div>
        <div><b>{avg ?? '–'}{avg != null && '%'}</b><span>Average score</span></div>
        <div><b>{results.interviews.length}</b><span>Mock interviews</span></div>
        <div><b>{solved}/{codingProblems.length}</b><span>Coding problems solved</span></div>
      </div>
      <h3 className="section-title">Test history</h3>
      {t.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Test</th><th>Score</th><th>%</th><th>Time</th></tr></thead>
        <tbody>{t.map((r, i) => <tr key={i}><td>{d(r.date)}</td><td>{r.title}</td><td>{r.score}/{r.total}</td><td>{Math.round((r.score / r.total) * 100)}%</td><td>{r.secs != null ? fmtTime(r.secs) : '–'}</td></tr>)}</tbody></table></div> : <p className="muted">No tests yet.</p>}
      <h3 className="section-title">Mock interview history</h3>
      {iv.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Round</th><th>Questions</th><th>Key points covered</th><th>Self rating</th></tr></thead>
        <tbody>{iv.map((r, i) => <tr key={i}><td>{d(r.date)}</td><td>{r.round}</td><td>{r.count}</td><td>{r.coverage}%</td><td>{r.rating ?? '–'}</td></tr>)}</tbody></table></div> : <p className="muted">No interviews yet.</p>}
      {(t.length > 0 || iv.length > 0) && <button className="link-btn danger" onClick={() => window.confirm('Clear all test and interview history?') && setResults(emptyResults)}>Clear history</button>}
    </div>
  );
}

const TABS = [
  ['tests', ClipboardCheck, 'Test Series'],
  ['interview', MessagesSquare, 'Mock Interview'],
  ['coding', Code2, 'Coding Round'],
  ['results', BarChart3, 'My Results'],
];

export default function JavaInterview() {
  const [tab, setTab] = useLocalState('xlpbi-java-interview-tab', 'tests');
  const [results, setResults] = useLocalState(RESULTS_KEY, emptyResults);
  const r = { ...emptyResults, ...results };
  return (
    <div>
      <div className="page-head">
        <h1><Ico e="☕" /> Java Interview Preparation</h1>
        <p className="muted">Timed test series, mock technical & HR interviews, a coding round and your score history, all from the Java Full Stack courses. Also see the <Link to="/tools/java-projects">Final Project Studio</Link> and the <Link to="/tools/soft-skills">Soft Skills Lab</Link>.</p>
      </div>
      <div className="tabs">
        {TABS.map(([k, I, label]) => <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}><I size={15} /> {label}</button>)}
      </div>
      {tab === 'tests' && <TestSeries results={r} setResults={setResults} />}
      {tab === 'interview' && <MockInterview setResults={setResults} />}
      {tab === 'coding' && <CodingRound results={r} setResults={setResults} />}
      {tab === 'results' && <Results results={r} setResults={setResults} />}
    </div>
  );
}
