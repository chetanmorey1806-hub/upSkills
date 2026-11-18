import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenCheck, Trophy, ClipboardCheck, MessagesSquare, Hammer, Flame, Star, Code2, ArrowRight, PlayCircle,
  Download, Upload, Pencil, Target, MessageCircle, Map as MapIcon, Layers,
} from 'lucide-react';
import { tracks, trackGroups, trackOrder, topicKey, findTopic } from '../data/index.js';
import { useProgress } from '../progress.js';
import { useAuth, firstName } from '../auth.js';
import { codingProblems, javaProjects, softSkillModules, JAVA_TRACKS } from '../data/javaCareer.js';
import { useLocalState, downloadFile } from '../components/careerUtils.js';
import ProgressBar from '../components/ProgressBar.jsx';
import { TrackIcon } from '../components/Icons.jsx';

const readJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const dayKey = (d) => d.toISOString().slice(0, 10);
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

function Ring({ value, size = 132, stroke = 12, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="db-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${value}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#fff" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} className="db-ring-arc" />
      </svg>
      <div className="db-ring-txt"><b>{value}%</b><span>{label}</span></div>
    </div>
  );
}

// Single-series column chart with hover tooltip (one color, no legend needed).
function Columns({ data, max, unit = '', refLine, empty }) {
  const [hover, setHover] = useState(null);
  const top = Math.max(1, max ?? Math.max(...data.map((d) => d.v), 1));
  if (!data.length || data.every((d) => !d.v)) return <p className="muted small db-empty">{empty}</p>;
  return (
    <div className="db-cols" onMouseLeave={() => setHover(null)}>
      {refLine != null && <div className="db-ref" style={{ bottom: `${(refLine / top) * 100}%` }}><span>{refLine}{unit}</span></div>}
      {data.map((d, i) => (
        <div key={i} className={`db-col ${hover === i ? 'on' : ''}`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} aria-label={`${d.label}: ${d.v}${unit}`}>
          <div className="db-bar" style={{ height: `${(d.v / top) * 100}%` }} />
          {hover === i && <div className="db-tip"><b>{d.v}{unit}</b><span>{d.tip || d.label}</span></div>}
          <span className="db-xl">{d.short ?? d.label}</span>
        </div>
      ))}
    </div>
  );
}

function Tile({ icon: I, label, value, sub, to, tone }) {
  const body = (
    <>
      <div className={`db-ticon ${tone || ''}`}><I size={20} /></div>
      <div className="db-tval">{value}</div>
      <div className="db-tlabel">{label}</div>
      {sub && <div className="muted small">{sub}</div>}
    </>
  );
  return to ? <Link to={to} className="card db-tile">{body}</Link> : <div className="card db-tile">{body}</div>;
}

export default function Dashboard() {
  const p = useProgress();
  const [name, setName] = useLocalState('xlpbi-student-name', '');
  const authUser = useAuth();
  const shownName = name || (authUser ? firstName(authUser) : '');
  const [editing, setEditing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const fileRef = useRef(null);

  const results = { tests: [], interviews: [], coding: {}, ...readJSON('xlpbi-java-results-v1', {}) };
  const projects = readJSON('xlpbi-java-projects-v1', {});
  const soft = { log: [], done: {}, ...readJSON('xlpbi-softskills-v1', {}) };
  const last = readJSON('xlpbi-last-topic', null);
  const series = { results: {}, history: [], ...readJSON('upskillr-tests-v1', {}) };
  // all course test-series MCQ attempts + Java interview-prep tests, oldest first
  const allTests = [
    ...results.tests.map((r) => ({ title: r.title, pct: pct(r.score, r.total), at: new Date(r.date).getTime() })),
    ...(series.history || []).filter((h) => h.mode === 'mcq').map((h) => ({ title: h.label, pct: h.pct, at: h.at })),
  ].sort((a, b) => a.at - b.at);

  const s = useMemo(() => {
    const per = trackOrder.map((k) => {
      const t = tracks[k];
      const total = t.topics.length;
      const done = t.topics.filter((x) => p.done[topicKey(k, x.id)]).length;
      const qs = t.topics.map((x) => p.quiz[topicKey(k, x.id)]).filter((v) => v != null);
      const qmax = t.topics.filter((x) => p.quiz[topicKey(k, x.id)] != null).reduce((a, x) => a + (x.quiz?.length || 5), 0);
      const started = done > 0 || qs.length > 0;
      const nextTopic = t.topics.find((x) => !p.done[topicKey(k, x.id)]);
      return { k, t, total, done, quizzes: qs.length, quizPct: qmax ? pct(qs.reduce((a, b) => a + b, 0), qmax) : null, started, nextTopic };
    });
    const totalLessons = per.reduce((a, x) => a + x.total, 0);
    const doneLessons = per.reduce((a, x) => a + x.done, 0);
    const quizTaken = per.reduce((a, x) => a + x.quizzes, 0);
    const allQ = Object.entries(p.quiz);
    const quizAvg = (() => {
      let got = 0; let mx = 0;
      allQ.forEach(([key, v]) => { const [tr, id] = key.split('/'); const f = findTopic(tr, id); if (f) { got += v; mx += f.topic.quiz?.length || 5; } });
      return mx ? pct(got, mx) : null;
    })();
    const practiceDone = Object.values(p.practice).reduce((a, v) => a + (v?.length || 0), 0);
    const starred = Object.values(p.bookmarks).filter(Boolean).length;

    // activity per day (lessons/quizzes/practice + tests + interviews + soft-skill practice)
    const act = { ...p.activity };
    const bump = (iso) => { if (!iso) return; const d = iso.slice(0, 10); act[d] = (act[d] || 0) + 1; };
    results.tests.forEach((r) => bump(r.date));
    results.interviews.forEach((r) => bump(r.date));
    (series.history || []).forEach((h) => bump(new Date(h.at).toISOString()));
    soft.log.forEach((r) => bump(r.date));
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = dayKey(d);
      days.push({ label: k, short: d.toLocaleDateString('en-IN', { weekday: 'narrow' }), tip: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), v: act[k] || 0 });
    }
    const set = new Set(Object.keys(act).filter((k) => act[k] > 0));
    const d = new Date();
    if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
    let streak = 0;
    while (set.has(dayKey(d))) { streak++; d.setDate(d.getDate() - 1); }

    const tests = allTests.slice(-10).map((r, i) => ({ label: r.title, short: `T${allTests.length - Math.min(10, allTests.length) + i + 1}`, v: r.pct, tip: `${r.title} · ${new Date(r.at).toLocaleDateString('en-IN')}` }));
    const testAvg = allTests.length ? Math.round(allTests.reduce((a, r) => a + r.pct, 0) / allTests.length) : null;
    const mockCount = results.interviews.length + (series.history || []).filter((h) => h.mode === 'mock').length;
    const codingSolved = codingProblems.filter((x) => results.coding?.[x.id]).length;

    const proj = javaProjects.map((x) => {
      const total = x.milestones.reduce((a, m) => a + m.tasks.length, 0);
      const done = Object.values(projects[x.id]?.tasks || {}).filter(Boolean).length;
      return { x, total, done };
    });
    const projBest = proj.reduce((b, y) => (y.total && y.done / y.total > (b ? b.done / b.total : 0) ? y : b), null);
    const softDone = Object.values(soft.done || {}).filter(Boolean).length;
    const softDays = new Set(soft.log.map((l) => l.date.slice(0, 10))).size;

    // Java placement readiness (indicative, from activity in this app)
    const jl = per.filter((x) => JAVA_TRACKS.includes(x.k));
    const javaLessons = pct(jl.reduce((a, x) => a + x.done, 0), jl.reduce((a, x) => a + x.total, 0));
    const parts = [
      ['Java lessons completed', javaLessons, 30, '/track/corejava'],
      ['Test series average', testAvg ?? 0, 25, '/tools/java-interview'],
      ['Coding problems solved', pct(codingSolved, codingProblems.length), 15, '/tools/java-interview'],
      ['Final project progress', projBest ? pct(projBest.done, projBest.total) : 0, 15, '/tools/java-projects'],
      ['Soft-skill modules done', pct(softDone, softSkillModules.length), 15, '/tools/soft-skills'],
    ];
    const readiness = Math.round(parts.reduce((a, [, v, w]) => a + (v * w) / 100, 0));

    return { mockCount, per, totalLessons, doneLessons, quizTaken, quizAvg, practiceDone, starred, days, streak, tests, testAvg, codingSolved, proj, softDone, softDays, parts, readiness };
  }, [p.done, p.quiz, p.practice, p.bookmarks, p.activity]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastInfo = last && findTopic(last.track, last.id);
  const started = s.per.filter((x) => x.started);
  const courseList = showAll ? s.per : started;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const overall = pct(s.doneLessons, s.totalLessons);

  const exportData = () => {
    const keys = ['xlpbi-progress-v1', 'xlpbi-java-results-v1', 'xlpbi-java-projects-v1', 'xlpbi-softskills-v1', 'xlpbi-student-name', 'xlpbi-last-topic'];
    const out = {};
    keys.forEach((k) => { try { const v = localStorage.getItem(k); if (v != null) out[k] = v; } catch { /* ignore */ } });
    downloadFile(`upskillr-progress-${dayKey(new Date())}.json`, JSON.stringify({ app: 'upskillr', exported: new Date().toISOString(), data: out }, null, 2), 'application/json');
  };
  const importData = (file) => {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const j = JSON.parse(rd.result);
        if (j.app !== 'upskillr' || !j.data) throw new Error('bad');
        if (!window.confirm('Replace the progress in this browser with the backup file?')) return;
        Object.entries(j.data).forEach(([k, v]) => { if (k.startsWith('xlpbi-')) localStorage.setItem(k, v); });
        window.location.reload();
      } catch { window.alert('This is not a valid UpSkillr backup file.'); }
    };
    rd.readAsText(file);
  };

  return (
    <div className="db">
      {/* banner */}
      <section className="db-hero">
        <div className="db-hero-text">
          <div className="db-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          {editing ? (
            <form onSubmit={(e) => { e.preventDefault(); setEditing(false); }} className="db-name-form">
              <input className="input" autoFocus placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setEditing(false)} />
            </form>
          ) : (
            <h1>{greet}{shownName ? `, ${shownName}` : ''} 👋 <button className="db-edit" onClick={() => setEditing(true)} aria-label="Edit name"><Pencil size={15} /></button></h1>
          )}
          <p>{s.doneLessons ? `You have completed ${s.doneLessons} lessons. Keep going — one lesson a day adds up fast.` : 'Welcome! Start your first lesson today and your progress will appear here.'}</p>
          <div className="db-hero-chips">
            <span><Flame size={15} /> {s.streak}-day streak</span>
            <span><BookOpenCheck size={15} /> {s.doneLessons}/{s.totalLessons} lessons</span>
            <span><Target size={15} /> Readiness {s.readiness}%</span>
          </div>
        </div>
        <Ring value={overall} label="All courses" />
      </section>

      {/* continue */}
      <div className="db-continue card">
        <PlayCircle size={34} className="db-play" />
        <div className="db-cont-text">
          {lastInfo ? (
            <>
              <div className="muted small">Continue where you left off · {tracks[last.track].short}</div>
              <h3>{lastInfo.topic.title}</h3>
            </>
          ) : (
            <>
              <div className="muted small">Not started yet</div>
              <h3>Pick a course and start Day 1</h3>
            </>
          )}
        </div>
        {lastInfo ? <Link className="btn primary" to={`/track/${last.track}/${last.id}`}>Resume <ArrowRight size={15} /></Link> : <Link className="btn primary" to="/home">Browse courses <ArrowRight size={15} /></Link>}
      </div>

      {/* KPI tiles */}
      <div className="db-tiles">
        <Tile icon={BookOpenCheck} label="Lessons completed" value={s.doneLessons} sub={`${overall}% of ${s.totalLessons}`} to="/courses" />
        <Tile icon={Trophy} label="Quiz average" value={s.quizAvg != null ? `${s.quizAvg}%` : '–'} sub={`${s.quizTaken} quizzes taken`} to="/tools/quiz" tone="t2" />
        <Tile icon={Code2} label="Practice tasks done" value={s.practiceDone} to="/roadmap" tone="t3" />
        <Tile icon={ClipboardCheck} label="Test series" value={s.testAvg != null ? `${s.testAvg}%` : '–'} sub={`${allTests.length} tests taken`} to="/tools/test-series" tone="t4" />
        <Tile icon={MessagesSquare} label="Mock interviews" value={s.mockCount} sub={`${s.codingSolved}/${codingProblems.length} coding solved`} to="/tools/java-interview" tone="t5" />
        <Tile icon={MessageCircle} label="Soft-skill practice days" value={s.softDays} sub={`${s.softDone}/${softSkillModules.length} modules`} to="/tools/soft-skills" tone="t6" />
        <Tile icon={Star} label="Starred questions" value={s.starred} to="/tools/flashcards" tone="t2" />
        <Tile icon={Flame} label="Current streak" value={`${s.streak} ${s.streak === 1 ? 'day' : 'days'}`} sub="Active days in a row" tone="t4" />
      </div>

      {/* charts */}
      <div className="db-grid2">
        <div className="card">
          <div className="db-card-head"><h3>Activity – last 14 days</h3><span className="muted small">lessons, quizzes, tests, practice</span></div>
          <Columns data={s.days} empty="No activity yet. Complete a lesson or take a quiz to start your chart." />
        </div>
        <div className="card">
          <div className="db-card-head"><h3>Test series scores</h3><span className="muted small">last {Math.min(10, allTests.length)} tests · all courses · 70% target</span></div>
          <Columns data={s.tests} max={100} unit="%" refLine={70} empty="No tests yet. Pick any course in the Test Series and take a timed test." />
          {allTests.length === 0 && <Link to="/tools/test-series" className="btn small">Open Test Series</Link>}
        </div>
      </div>

      <div className="db-grid2">
        {/* readiness */}
        <div className="card">
          <div className="db-card-head"><h3><Target size={18} /> Java placement readiness</h3><b className="db-big">{s.readiness}%</b></div>
          {s.parts.map(([l, v, w, to]) => (
            <Link key={l} to={to} className="db-part">
              <div className="db-part-top"><span>{l}</span><span className="muted small">{v}% · weight {w}</span></div>
              <ProgressBar value={v / 100} />
            </Link>
          ))}
          <p className="muted small">An indicative score from your activity in this app: lessons, tests, coding, project and soft skills.</p>
        </div>
        {/* projects */}
        <div className="card">
          <div className="db-card-head"><h3><Hammer size={18} /> Final projects</h3><Link to="/tools/java-projects" className="small">All projects →</Link></div>
          {s.proj.filter((y) => y.done).length === 0 && <p className="muted small">No project started yet. Choose one in the Final Project Studio and tick milestones as you build.</p>}
          {(s.proj.filter((y) => y.done).length ? s.proj.filter((y) => y.done) : s.proj.slice(0, 3)).map(({ x, done, total }) => (
            <Link key={x.id} to={`/tools/java-projects/${x.id}`} className="db-part">
              <div className="db-part-top"><span>{x.title}</span><span className="muted small">{done}/{total} tasks</span></div>
              <ProgressBar value={total ? done / total : 0} />
            </Link>
          ))}
        </div>
      </div>

      {/* courses */}
      <div className="card">
        <div className="db-card-head">
          <h3><Layers size={18} /> My courses</h3>
          <button className="link-btn" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show started only' : `Show all ${s.per.length} courses`}</button>
        </div>
        {courseList.length === 0 && <p className="muted small">You haven't started a course yet. Here are the course groups — pick one:</p>}
        {courseList.length === 0 && (
          <div className="db-groups">{trackGroups.map((g) => <Link key={g.key} to={`/track/${g.tracks[0]}`} className="chip">{g.name}</Link>)}</div>
        )}
        <div className="db-courses">
          {courseList.map(({ k, t, total, done, quizPct, nextTopic }) => (
            <div key={k} className="db-course">
              <span className="db-cicon" style={{ color: t.color, background: `color-mix(in srgb, ${t.color} 13%, transparent)` }}><TrackIcon track={k} size={20} /></span>
              <div className="db-cmain">
                <div className="db-part-top"><Link to={`/track/${k}`}><b>{t.name}</b></Link><span className="muted small">{done}/{total}{quizPct != null ? ` · quiz ${quizPct}%` : ''}</span></div>
                <ProgressBar value={total ? done / total : 0} color={t.color} />
              </div>
              {nextTopic ? <Link className="btn small" to={`/track/${k}/${nextTopic.id}`}>{done ? 'Next' : 'Start'}</Link> : total ? <span className="jc-solved">✓ Done</span> : null}
            </div>
          ))}
        </div>
      </div>

      {/* quick actions */}
      <h2 className="section-title">Quick actions</h2>
      <div className="db-actions">
        {[
          ['/roadmap', MapIcon, 'Roadmap'], ['/tools/quiz', Trophy, 'Quiz Arena'], ['/tools/flashcards', Layers, 'Flashcards'],
          ['/tools/test-series', ClipboardCheck, 'Test series'], ['/tools/java-projects', Hammer, 'Projects'], ['/tools/soft-skills', MessageCircle, 'Soft skills'],
          ['/tools/java-ide', Code2, 'Java IDE'], ['/tools', Target, 'All tools'],
        ].map(([to, I, l]) => <Link key={to} to={to} className="card db-action"><I size={22} /><span>{l}</span></Link>)}
      </div>

      {/* backup */}
      <div className="card db-backup">
        <div><b>Backup your progress</b><div className="muted small">Progress is saved only in this browser. Download a backup to move it to another computer or phone.</div></div>
        <div className="row-btns">
          <button className="btn small" onClick={exportData}><Download size={15} /> Download backup</button>
          <button className="btn small" onClick={() => fileRef.current?.click()}><Upload size={15} /> Restore backup</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files[0] && importData(e.target.files[0])} />
        </div>
      </div>
    </div>
  );
}
