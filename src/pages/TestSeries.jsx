import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { tracks, trackOrder, trackGroups } from '../data/index.js';
import Quiz from '../components/Quiz.jsx';
import RichText from '../components/RichText.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { analyzeAnswer } from '../engine/answerCheck.js';
import { useSpeech, speak, stopSpeaking } from '../components/useSpeech.js';
import { TrackIcon } from '../components/Icons.jsx';

const STORE = 'upskillr-tests-v1';
const PER_TEST = 5; // lessons per numbered test
const PASS = 60;

function readStore() { try { return JSON.parse(localStorage.getItem(STORE)) || { results: {}, history: [] }; } catch { return { results: {}, history: [] }; } }
function writeStore(s) { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch { /* ignore */ } }
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function record(testId, label, mode, pct, detail) {
  const s = readStore();
  const r = s.results[testId] || {};
  const prev = r[mode] || { best: 0, attempts: 0 };
  r[mode] = { best: Math.max(prev.best, pct), last: pct, attempts: prev.attempts + 1 };
  s.results[testId] = r;
  s.history = [{ testId, label, mode, pct, detail, at: Date.now() }, ...(s.history || [])].slice(0, 60);
  writeStore(s);
}

// Builds the numbered tests for a course (or a group of courses).
function buildTests(sel) {
  const keys = sel.startsWith('grp:') ? (trackGroups.find((g) => `grp:${g.key}` === sel)?.tracks || []) : [sel];
  const topics = keys.flatMap((k) => (tracks[k]?.topics || []).map((t) => ({ ...t, track: k })));
  const tests = [];
  for (let i = 0; i < topics.length; i += PER_TEST) {
    const chunk = topics.slice(i, i + PER_TEST);
    const n = tests.length + 1;
    const mods = [...new Set(chunk.map((t) => t.module).filter(Boolean))];
    tests.push({
      id: `${sel}#${n}`,
      n,
      title: `Test ${n}`,
      sub: mods.length ? mods.join(' · ').replace(/Module \d+: /g, '') : chunk.map((t) => t.title).join(', '),
      topics: chunk,
      level: chunk[Math.floor(chunk.length / 2)]?.level || 'Beginner',
    });
  }
  return { topics, tests };
}

const SETS = 5;
const LEVEL = { Beginner: 'Easy', Intermediate: 'Medium', Advanced: 'Hard' };
const normLevel = (l) => LEVEL[l] || l || 'Medium';

// Splits one course's whole question bank into SETS full-length practice sets.
// Every lesson contributes to every set (round-robin), so each set covers the full syllabus,
// and the sets together use every MCQ and interview question exactly once.
function buildSets(course) {
  const topics = (tracks[course]?.topics || []).map((t) => ({ ...t, track: course }));
  const sets = Array.from({ length: SETS }, (_, i) => ({
    id: `${course}#set${i + 1}`, n: i + 1, title: `Practice Set ${i + 1}`, course, topics, mcq: [], iv: [],
    label: `${tracks[course]?.short || tracks[course]?.name} · Set ${i + 1}`,
  }));
  const order = { Easy: 0, Medium: 1, Hard: 2 };
  topics.forEach((t, ti) => {
    (t.quiz || []).forEach((q, j) => sets[(ti + j) % SETS].mcq.push({ ...q, source: t.title }));
    [...(t.interview || [])]
      .map((q) => ({ ...q, level: normLevel(q.level), topic: t }))
      .sort((a, b) => (order[a.level] ?? 1) - (order[b.level] ?? 1))
      .forEach((q, j) => sets[(ti * 2 + j) % SETS].iv.push(q));
  });
  return sets;
}

// One test per module of a course: MCQ paper from that module's lessons + a mock interview on them.
function buildModuleTests(course) {
  const topics = (tracks[course]?.topics || []).map((t) => ({ ...t, track: course }));
  const mods = [...new Set(topics.map((t) => t.module).filter(Boolean))];
  if (mods.length < 2) return [];
  return mods.map((m, i) => {
    const list = topics.filter((t) => t.module === m);
    return {
      id: `${course}#mod${i + 1}`, n: i + 1, title: m.replace(/^Module \d+:\s*/, ''), module: m, course, topics: list,
      mcq: shuffle(list.flatMap((t) => (t.quiz || []).map((q) => ({ ...q, source: t.title })))).slice(0, 40),
      iv: list.flatMap((t) => (t.interview || []).map((q) => ({ ...q, level: normLevel(q.level), topic: t }))),
      label: `${tracks[course]?.short} · ${m.replace(/^Module \d+:\s*/, 'Module ' + (i + 1) + ': ')}`,
    };
  });
}

// Totals for one course (used on the all-courses grid).
function courseSummary(course, res) {
  const topics = tracks[course]?.topics || [];
  const lessonTests = Math.ceil(topics.length / PER_TEST);
  const modTests = buildModuleTests(course).length;
  const total = SETS + lessonTests + modTests + (topics.length ? 1 : 0);
  const mine = Object.entries(res).filter(([id]) => id.startsWith(`${course}#`));
  const best = mine.reduce((b, [, r]) => Math.max(b, r.mcq?.best || 0, r.mock?.best || 0), 0);
  const passed = mine.filter(([, r]) => Math.max(r.mcq?.best || 0, r.mock?.best || 0) >= PASS).length;
  return {
    total, attempted: mine.length, passed, best,
    mcq: topics.reduce((a, t) => a + (t.quiz?.length || 0), 0), iv: topics.reduce((a, t) => a + (t.interview?.length || 0), 0),
  };
}

const mcqOf = (topics) => topics.flatMap((t) => (t.quiz || []).map((q) => ({ ...q, source: `${tracks[t.track]?.short} · ${t.title}` })));
const qaOf = (topics) => topics.flatMap((t) => (t.interview || []).map((q) => ({ ...q, level: normLevel(q.level), topic: t })));

function pickMock(pool, n) {
  const all = shuffle(pool);
  const by = (l) => all.filter((q) => q.level === l);
  const want = { Easy: Math.ceil(n * 0.3), Medium: Math.ceil(n * 0.45), Hard: n };
  const out = [];
  ['Easy', 'Medium', 'Hard'].forEach((l) => by(l).slice(0, want[l]).forEach((q) => out.length < n && out.push(q)));
  all.forEach((q) => out.length < n && !out.includes(q) && out.push(q));
  const order = { Easy: 0, Medium: 1, Hard: 2 };
  return out.sort((a, b) => (order[a.level] ?? 1) - (order[b.level] ?? 1));
}

/* ------------------------------ MCQ run ------------------------------ */
function McqRun({ test, onExit }) {
  const [qs] = useState(() => test.mcq || (test.grand ? shuffle(mcqOf(test.topics)).slice(0, 40) : mcqOf(test.topics)));
  const minutes = Math.max(5, Math.round(qs.length * 1));
  const [left, setLeft] = useState(minutes * 60);
  const [done, setDone] = useState(null);
  useEffect(() => {
    if (done) return undefined;
    if (left <= 0) return undefined;
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left, done]);
  const finish = (score, total) => {
    const pct = Math.round((score / total) * 100);
    setDone({ score, total, pct });
    record(test.id, test.label, 'mcq', pct, `${score}/${total}`);
  };
  return (
    <div>
      <div className="run-head card">
        <div><b>📝 {test.label}: MCQ test</b><div className="muted small">{qs.length} questions · {minutes} minutes · pass mark {PASS}%</div></div>
        <button className="btn small" onClick={onExit}>← Back to tests</button>
      </div>
      {!done && <div className={`timer ${left < 60 ? 'low' : ''}`}>{left > 0 ? `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : "⏰ Time's up! Submit now to see your score."}</div>}
      {done && (
        <div className={`card result-card ${done.pct >= PASS ? 'pass' : 'fail'}`}>
          <h2>{done.pct >= PASS ? '🎉 Passed!' : '📚 Keep practising'}</h2>
          <p>You scored <b>{done.score}/{done.total} ({done.pct}%)</b>. Review the explanations below, then retake the test or try the mock interview.</p>
        </div>
      )}
      <Quiz questions={qs} onFinish={finish} origin={{ label: test.label, kind: 'test' }} />
    </div>
  );
}

/* --------------------------- Mock interview --------------------------- */
const RATE = [[2, '💪 Nailed it'], [1, '🙂 Partly'], [0, '😕 Missed']];

function MockRun({ test, onExit }) {
  const [qs] = useState(() => (test.iv ? pickMock(test.iv, Math.min(12, test.iv.length)) : pickMock(qaOf(test.topics), test.grand ? 10 : 8)));
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [log, setLog] = useState([]);
  const [secs, setSecs] = useState(0);
  const [autoRead, setAutoRead] = useState(true);
  const speech = useSpeech({ onText: (t) => setAnswer((a) => (a ? `${a} ${t}` : t)) });
  const q = qs[i];
  const finished = i >= qs.length;

  useEffect(() => { setSecs(0); if (q && autoRead) speak(q.q); return () => stopSpeaking(); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (finished || revealed) return undefined;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [finished, revealed, i]);

  const analysis = useMemo(() => (revealed && q ? analyzeAnswer(answer, q.a) : null), [revealed, q, answer]);

  const reveal = () => { speech.stop(); stopSpeaking(); setRevealed(true); };
  const rate = (pts) => {
    setLog((l) => [...l, { q, answer, pts, coverage: analysis?.coverage || 0, secs }]);
    setAnswer(''); setRevealed(false); setI((n) => n + 1);
  };

  useEffect(() => {
    if (!finished || !log.length) return;
    const pct = Math.round((log.reduce((s, x) => s + x.pts, 0) / (log.length * 2)) * 100);
    record(test.id, test.label, 'mock', pct, `${log.filter((x) => x.pts === 2).length} strong / ${log.length}`);
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  if (finished) {
    const pct = Math.round((log.reduce((s, x) => s + x.pts, 0) / (log.length * 2)) * 100);
    const avgCov = Math.round(log.reduce((s, x) => s + x.coverage, 0) / log.length);
    const weak = [...new Map(log.filter((x) => x.pts < 2).map((x) => [x.q.topic.id, x.q.topic])).values()];
    return (
      <div>
        <div className={`card result-card ${pct >= PASS ? 'pass' : 'fail'}`}>
          <h2>{pct >= PASS ? '🎉 Interview ready for this part!' : '📚 More practice needed'}</h2>
          <div className="mock-stats">
            <div><b>{pct}%</b><span>Self-rated score</span></div>
            <div><b>{avgCov}%</b><span>Key points covered</span></div>
            <div><b>{Math.round(log.reduce((s, x) => s + x.secs, 0) / log.length)}s</b><span>Avg. time / answer</span></div>
          </div>
          <div className="row-btns"><button className="btn primary" onClick={onExit}>← Back to tests</button></div>
        </div>
        {weak.length > 0 && (
          <div className="card"><h3>📌 Revise these lessons</h3><ul>{weak.map((t) => <li key={t.id}><Link to={`/track/${t.track}/${t.id}?tab=interview`}>{tracks[t.track]?.short}: {t.title}</Link></li>)}</ul></div>
        )}
        {log.map((x, n) => (
          <details key={n} className="card qa">
            <summary><span className="qa-q">Q{n + 1}. {x.q.q}</span><span className={`lvl lvl-${x.q.level}`}>{x.q.level}</span> <span>{RATE.find((r) => r[0] === x.pts)[1]}</span></summary>
            <div className="qa-a"><b>Your answer:</b><p>{x.answer || <i className="muted">(no answer)</i>}</p><b>Model answer:</b><RichText text={x.q.a} /></div>
          </details>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="run-head card">
        <div><b>🎤 {test.label}: Mock interview</b><div className="muted small">Question {i + 1} of {qs.length} · answer aloud or type, then compare with the model answer</div></div>
        <button className="btn small" onClick={onExit}>← Exit</button>
      </div>
      <ProgressBar value={i / qs.length} />
      <div className="card interviewer">
        <div className="iv-top">
          <span className="iv-avatar">🧑‍💼</span>
          <div className="muted small">{tracks[q.topic.track]?.short} · {q.topic.title} <span className={`lvl lvl-${q.level}`}>{q.level}</span></div>
          <span className={`iv-timer ${secs > 120 ? 'over' : ''}`}>⏱ {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>
        </div>
        <h2 className="iv-q">{q.q}</h2>
        <div className="row-btns">
          <button className="btn small" onClick={() => speak(q.q)}>🔊 Read question</button>
          <label className="check small"><input type="checkbox" checked={autoRead} onChange={(e) => setAutoRead(e.target.checked)} /> Read questions aloud</label>
        </div>
      </div>

      {!revealed ? (
        <div className="card">
          <textarea className="input answer-box" rows={6} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here, or press 🎙 and speak it like in a real interview…" />
          {speech.interim && <div className="muted small">🎙 {speech.interim}</div>}
          {speech.error && <div className="test-msg">{speech.error}</div>}
          <div className="row-btns">
            <button className={`btn ${speech.listening ? 'rec' : ''}`} onClick={speech.toggle}>{speech.listening ? '⏹ Stop speaking' : '🎙 Speak answer'}</button>
            <button className="btn primary" onClick={reveal}>Check my answer →</button>
            <button className="btn" onClick={() => { setAnswer(''); reveal(); }}>I don't know</button>
          </div>
          <p className="muted small">Tip: think for 5 seconds, give a one-line definition, then an example, then a use case or comparison.</p>
        </div>
      ) : (
        <div>
          {analysis && answer.trim() && (
            <div className="card analysis">
              <div className="an-score"><div className="score-ring small" style={{ '--p': analysis.coverage }}><span>{analysis.coverage}</span><small>%</small></div><div><b>{analysis.verdict}</b><div className="muted small">{analysis.words} words · {secs}s{Object.keys(analysis.fillers).length ? ` · fillers: ${Object.entries(analysis.fillers).map(([f, n]) => `${f}×${n}`).join(', ')}` : ''}</div></div></div>
              {analysis.matched.length > 0 && <div className="kw-row"><span className="muted small">Covered:</span>{analysis.matched.map((k) => <span key={k} className="tag ok">{k}</span>)}</div>}
              {analysis.missed.length > 0 && <div className="kw-row"><span className="muted small">Missing:</span>{analysis.missed.map((k) => <span key={k} className="tag miss">{k}</span>)}</div>}
            </div>
          )}
          <div className="card model-answer"><h4>✅ Model answer</h4><RichText text={q.a} /></div>
          <div className="card rate-box">
            <b>How did you do? Be honest:</b>
            <div className="row-btns">{RATE.map(([p, l]) => <button key={p} className="btn" onClick={() => rate(p)}>{l}</button>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- Interview Q&A sheet --------------------------- */
function QaSheet({ test, onExit, onMock }) {
  const [lvl, setLvl] = useState('All');
  const [open, setOpen] = useState(false);
  const list = test.iv.filter((q) => lvl === 'All' || q.level === lvl);
  return (
    <div>
      <div className="run-head card">
        <div><b>📖 {test.label}: Interview Q&amp;A sheet</b><div className="muted small">{test.iv.length} questions from all {test.topics.length} lessons · try to answer each one aloud before you open the model answer</div></div>
        <button className="btn small" onClick={onExit}>← Back to sets</button>
      </div>
      <div className="row-btns">
        {['All', 'Easy', 'Medium', 'Hard'].map((l) => <button key={l} className={`btn small ${lvl === l ? 'primary' : ''}`} onClick={() => setLvl(l)}>{l} ({l === 'All' ? test.iv.length : test.iv.filter((q) => q.level === l).length})</button>)}
        <button className="btn small" onClick={() => setOpen((o) => !o)}>{open ? 'Collapse all' : 'Expand all'}</button>
        <button className="btn small primary" onClick={onMock}>🎤 Start mock interview</button>
      </div>
      {list.map((q, n) => (
        <details key={`${lvl}-${open}-${n}`} className="card qa" open={open}>
          <summary><span className="qa-q">Q{n + 1}. {q.q}</span><span className={`lvl lvl-${q.level}`}>{q.level}</span></summary>
          <div className="qa-a"><div className="muted small">{q.topic.title}</div><RichText text={q.a} /></div>
        </details>
      ))}
    </div>
  );
}

function SetCards({ course, res, start }) {
  const sets = buildSets(course);
  const done = sets.filter((t) => (res[t.id]?.mcq?.best || 0) >= PASS && (res[t.id]?.mock?.best || 0) >= PASS).length;
  return (
    <div className="set-group">
      <div className="set-group-head">
        <h2>{tracks[course].name}</h2>
        <span className={`badge ${done === SETS ? 'ok' : ''}`}>{done}/{SETS} sets cleared</span>
      </div>
      <div className="grid3">
        {sets.map((t) => {
          const r = res[t.id] || {};
          const cleared = (r.mcq?.best || 0) >= PASS && (r.mock?.best || 0) >= PASS;
          const lv = (l) => t.iv.filter((q) => q.level === l).length;
          return (
            <div key={t.id} className={`card test-card ${cleared ? 'passed' : ''}`}>
              <div className="test-card-top">
                <span className="test-no">{t.n}</span>
                <div>
                  <h3>{t.title}</h3>
                  <div className="muted small">Full syllabus · all {t.topics.length} lessons</div>
                </div>
              </div>
              <div className="muted small test-topics">{t.mcq.length} MCQs ({t.mcq.length} min) · {t.iv.length} interview Qs: {lv('Easy')} easy, {lv('Medium')} medium, {lv('Hard')} hard</div>
              <div className="test-modes">
                <button className="btn small primary" onClick={() => start(t, 'mcq')} disabled={!t.mcq.length}>📝 MCQ paper</button>
                <button className="btn small" onClick={() => start(t, 'mock')} disabled={!t.iv.length}>🎤 Mock interview</button>
                <button className="btn small" onClick={() => start(t, 'sheet')} disabled={!t.iv.length}>📖 Q&amp;A sheet</button>
              </div>
              <div className="test-scores small">
                <span>MCQ: {r.mcq ? <b className={r.mcq.best >= PASS ? 'ok-t' : 'bad-t'}>{r.mcq.best}%</b> : '–'}</span>
                <span>Interview: {r.mock ? <b className={r.mock.best >= PASS ? 'ok-t' : 'bad-t'}>{r.mock.best}%</b> : '–'}</span>
                {cleared && <span className="badge ok">✓ Cleared</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------- All-courses grid -------------------------- */
function CourseGrid({ res, history }) {
  const [q, setQ] = useState('');
  const has = (k) => tracks[k]?.topics?.some((t) => t.quiz?.length || t.interview?.length);
  const all = trackOrder.filter(has);
  const sums = Object.fromEntries(all.map((k) => [k, courseSummary(k, res)]));
  const totalTests = all.reduce((a, k) => a + sums[k].total, 0);
  const attempted = all.reduce((a, k) => a + sums[k].attempted, 0);
  const passed = all.reduce((a, k) => a + sums[k].passed, 0);
  const match = (k) => !q || `${tracks[k].name} ${tracks[k].short}`.toLowerCase().includes(q.toLowerCase());
  const seen = new Set();
  const groups = trackGroups.map((g) => ({ ...g, list: g.tracks.filter((k) => has(k) && match(k) && !seen.has(k) && seen.add(k)) })).filter((g) => g.list.length);
  return (
    <div>
      <div className="page-head">
        <h1>🎯 Test Series – all courses</h1>
        <p className="muted">Every course has its own separate test series: <b>5 full-syllabus practice sets</b>, <b>module-wise tests</b>, <b>lesson-wise tests</b> and a <b>grand test</b>. Each test has a timed MCQ paper and a mock interview (speak or type). Pick a course to start.</p>
      </div>
      <div className="ts-stats">
        <div className="card"><b>{all.length}</b><span>Courses with a test series</span></div>
        <div className="card"><b>{totalTests}</b><span>Tests available</span></div>
        <div className="card"><b>{attempted}</b><span>Tests attempted</span></div>
        <div className="card"><b>{passed}</b><span>Tests passed (≥{PASS}%)</span></div>
      </div>
      <input className="input ts-search" placeholder="Search a course… (e.g. Java, React, Power BI)" value={q} onChange={(e) => setQ(e.target.value)} />
      {groups.map((g) => (
        <section key={g.key}>
          <div className="set-group-head">
            <h2 className="section-title">{g.name}</h2>
            {g.list.length > 1 && !q && <Link className="btn small" to={`/tools/test-series/grp:${g.key}`}>🏆 Full-path tests ({g.name})</Link>}
          </div>
          <div className="grid3">
            {g.list.map((k) => {
              const t = tracks[k];
              const s = sums[k];
              return (
                <Link key={k} to={`/tools/test-series/${k}`} className="card ts-course" style={{ '--c': t.color }}>
                  <div className="ts-course-top">
                    <span className="ts-cicon"><TrackIcon track={k} size={22} /></span>
                    <div><h3>{t.name}</h3><div className="muted small">{s.total} tests · {s.mcq} MCQs · {s.iv} interview Qs</div></div>
                  </div>
                  <ProgressBar value={s.total ? s.passed / s.total : 0} color={t.color} />
                  <div className="ts-course-foot small">
                    <span>{s.attempted ? `${s.passed}/${s.total} passed` : 'Not started'}</span>
                    {s.attempted > 0 && <span>Best <b className={s.best >= PASS ? 'ok-t' : 'bad-t'}>{s.best}%</b></span>}
                    <span className="ts-go">Open →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      {groups.length === 0 && <p className="muted">No course matches “{q}”.</p>}
      <History history={history} />
    </div>
  );
}

function History({ history, title = '🕘 Recent attempts' }) {
  if (!history.length) return null;
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Test</th><th>Type</th><th>Score</th><th>Date</th></tr></thead>
          <tbody>{history.map((h, i) => (
            <tr key={i}><td>{h.label}</td><td>{h.mode === 'mcq' ? '📝 MCQ' : '🎤 Interview'}</td><td className={h.pct >= PASS ? 'ok-t' : 'bad-t'}>{h.pct}% <span className="muted">({h.detail})</span></td><td>{new Date(h.at).toLocaleString()}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function ModuleCards({ course, res, start }) {
  const tests = useMemo(() => buildModuleTests(course), [course]);
  if (!tests.length) return <p className="muted">{tracks[course]?.name} has no separate modules; use the practice sets or lesson-wise tests.</p>;
  return (
    <div className="set-group">
      <div className="set-group-head"><h2>{tracks[course].name}</h2><span className="badge">{tests.length} module tests</span></div>
      <div className="grid3">
        {tests.map((t) => {
          const r = res[t.id] || {};
          const best = Math.max(r.mcq?.best || 0, r.mock?.best || 0);
          return (
            <div key={t.id} className={`card test-card ${best >= PASS ? 'passed' : ''}`}>
              <div className="test-card-top">
                <span className="test-no">M{t.n}</span>
                <div><h3>{t.title}</h3><div className="muted small">{t.topics.length} lessons · {t.mcq.length} MCQs · {t.iv.length} interview Qs</div></div>
              </div>
              <div className="muted small test-topics">{t.topics.map((x) => x.title).join(' • ')}</div>
              <div className="test-modes">
                <button className="btn small primary" onClick={() => start(t, 'mcq')} disabled={!t.mcq.length}>📝 MCQ · {t.mcq.length} Q</button>
                <button className="btn small" onClick={() => start(t, 'mock')} disabled={!t.iv.length}>🎤 Mock interview</button>
                <button className="btn small" onClick={() => start(t, 'sheet')} disabled={!t.iv.length}>📖 Q&amp;A sheet</button>
              </div>
              <div className="test-scores small">
                <span>MCQ: {r.mcq ? <b className={r.mcq.best >= PASS ? 'ok-t' : 'bad-t'}>{r.mcq.best}%</b> : '–'}</span>
                <span>Interview: {r.mock ? <b className={r.mock.best >= PASS ? 'ok-t' : 'bad-t'}>{r.mock.best}%</b> : '–'}</span>
                {best >= PASS && <span className="badge ok">✓ Passed</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Course page ------------------------------ */
export default function TestSeries() {
  const { course } = useParams();
  const [params, setParams] = useSearchParams();
  const legacy = params.get('course');
  const sel = course || '';
  const v = params.get('view');
  const view = ['lessons', 'modules'].includes(v) ? v : 'sets';
  const setView = (x) => setParams(x === 'sets' ? {} : { view: x });
  const [run, setRun] = useState(null);
  const [store, setStore] = useState(readStore);
  const { topics, tests } = useMemo(() => buildTests(sel), [sel]);
  const { key: locKey } = useLocation();
  useEffect(() => { setRun(null); setStore(readStore()); }, [locKey]); // any navigation (course change or menu click) closes the running test

  if (legacy) return <Navigate replace to={`/tools/test-series/${legacy}${params.get('view') ? `?view=${params.get('view')}` : ''}`} />;
  const res = store.results || {};
  if (!sel) return <CourseGrid res={res} history={(store.history || []).slice(0, 8)} />;

  const isGroup = sel.startsWith('grp:');
  const grp = isGroup ? trackGroups.find((g) => `grp:${g.key}` === sel) : null;
  const courses = (isGroup ? grp?.tracks || [] : [sel]).filter((k) => tracks[k]?.topics?.length);
  const exit = () => { setRun(null); setStore(readStore()); window.scrollTo(0, 0); };
  const start = (test, mode) => { setRun({ test, mode }); window.scrollTo(0, 0); };
  const label = isGroup ? grp?.name : tracks[sel]?.name;

  if (!label) return <div><p>Course not found.</p><Link to="/tools/test-series" className="btn">← All courses</Link></div>;
  if (run?.mode === 'mcq') return <McqRun test={run.test} onExit={exit} />;
  if (run?.mode === 'sheet') return <QaSheet test={run.test} onExit={exit} onMock={() => start(run.test, 'mock')} />;
  if (run) return <MockRun key={run.test.id} test={run.test} onExit={exit} />;

  const taken = tests.filter((t) => res[t.id]);
  const passed = tests.filter((t) => Math.max(res[t.id]?.mcq?.best || 0, res[t.id]?.mock?.best || 0) >= PASS);
  const grand = { id: `${sel}#grand`, n: 'G', title: 'Grand Test', grand: true, topics, label: `${label} · Grand Test` };
  const history = (store.history || []).filter((h) => h.testId?.startsWith(`${sel}#`) || courses.some((k) => h.testId?.startsWith(`${k}#`))).slice(0, 10);
  const color = isGroup ? 'var(--primary)' : tracks[sel].color;
  const sum = !isGroup ? courseSummary(sel, res) : null;

  return (
    <div>
      <Link to="/tools/test-series" className="btn small">← All courses</Link>
      <div className="page-head ts-head" style={{ marginTop: '.8rem' }}>
        <h1 className="with-icon">{!isGroup && <span className="track-icon" style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}><TrackIcon track={sel} size={24} /></span>} {label}: Test Series</h1>
        <p className="muted">{isGroup ? `Tests for every course in the ${label} path, plus full-path grand tests.` : `${sum.total} separate tests for this course: ${SETS} full-syllabus practice sets, module-wise tests, lesson-wise tests and a grand test. Pass mark ${PASS}%.`}</p>
        {!isGroup && <><ProgressBar value={sum.total ? sum.passed / sum.total : 0} color={color} /><div className="muted small">{sum.passed}/{sum.total} tests passed · {sum.attempted} attempted{sum.attempted ? ` · best ${sum.best}%` : ''} · <Link to={`/track/${sel}`}>Open the course</Link></div></>}
      </div>

      <div className="tabs">
        <button className={`tab ${view === 'sets' ? 'active' : ''}`} onClick={() => setView('sets')}>📚 {SETS} Practice Sets</button>
        <button className={`tab ${view === 'modules' ? 'active' : ''}`} onClick={() => setView('modules')}>🧱 Module-wise tests</button>
        <button className={`tab ${view === 'lessons' ? 'active' : ''}`} onClick={() => setView('lessons')}>🧩 Lesson-wise tests + Grand</button>
      </div>

      {view === 'sets' && (
        <>
          <p className="muted">Each course has <b>{SETS} full-length practice sets</b>. Every set covers the <b>whole syllabus</b>, and the {SETS} sets together use <b>every MCQ and interview question</b> in the course exactly once. Clear a set by scoring ≥{PASS}% in both its MCQ paper and its mock interview. Use the Q&amp;A sheet to revise before the mock.</p>
          {courses.map((k) => <SetCards key={k} course={k} res={res} start={start} />)}
        </>
      )}
      {view === 'modules' && (
        <>
          <p className="muted">One test per module: take it right after you finish that module. The MCQ paper has up to 40 questions from that module's lessons.</p>
          {courses.map((k) => <ModuleCards key={k} course={k} res={res} start={start} />)}
        </>
      )}
      {view === 'lessons' && (<>
      <div className="ts-stats">
        <div className="card"><b>{tests.length}</b><span>Lesson tests in {label}</span></div>
        <div className="card"><b>{taken.length}</b><span>Attempted</span></div>
        <div className="card"><b>{passed.length}</b><span>Passed (≥{PASS}%)</span></div>
        <div className="card"><b>{qaOf(topics).length}</b><span>Interview questions</span></div>
      </div>
      <ProgressBar value={tests.length ? passed.length / tests.length : 0} />
      <p className="muted small">Each lesson test covers {PER_TEST} consecutive lessons. The 🏆 Grand Test (last card) mixes 40 questions from the whole course.</p>

      {tests.length === 0 && <p className="muted">No questions in this course yet.</p>}
      <div className="grid3">
        {[...tests.map((t) => ({ ...t, label: `${tracks[t.topics[0].track]?.short || label} · ${t.title}` })), ...(tests.length ? [grand] : [])].map((t) => {
          const r = res[t.id] || {};
          const best = Math.max(r.mcq?.best || 0, r.mock?.best || 0);
          const nM = t.grand ? Math.min(40, mcqOf(t.topics).length) : mcqOf(t.topics).length;
          return (
            <div key={t.id} className={`card test-card ${t.grand ? 'grand' : ''} ${best >= PASS ? 'passed' : ''}`}>
              <div className="test-card-top">
                <span className="test-no">{t.grand ? '🏆' : t.n}</span>
                <div>
                  <h3>{t.title}</h3>
                  <div className="muted small">{t.grand ? `Whole course · ${t.topics.length} lessons` : t.sub}</div>
                </div>
              </div>
              {!t.grand && <div className="muted small test-topics">{t.topics.map((x) => x.title).join(' • ')}</div>}
              <div className="test-modes">
                <button className="btn small primary" onClick={() => start(t, 'mcq')} disabled={!nM}>📝 MCQ · {nM} Q</button>
                <button className="btn small" onClick={() => start(t, 'mock')} disabled={!qaOf(t.topics).length}>🎤 Mock interview</button>
              </div>
              <div className="test-scores small">
                <span>MCQ: {r.mcq ? <b className={r.mcq.best >= PASS ? 'ok-t' : 'bad-t'}>{r.mcq.best}%</b> : '–'}</span>
                <span>Interview: {r.mock ? <b className={r.mock.best >= PASS ? 'ok-t' : 'bad-t'}>{r.mock.best}%</b> : '–'}</span>
                {best >= PASS && <span className="badge ok">✓ Passed</span>}
              </div>
            </div>
          );
        })}
      </div>
      </>)}

      <History history={history} title={`🕘 Recent attempts · ${label}`} />
    </div>
  );
}
