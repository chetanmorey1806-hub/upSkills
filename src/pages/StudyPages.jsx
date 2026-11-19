import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  NotebookPen, AlertTriangle, Repeat, CalendarDays, Trophy, Award, FileUser, Code2, Bot, Flame, Search, Printer, Trash2, Plus,
  ChevronLeft, ChevronRight, Check, X, Target, Download, Smartphone,
} from 'lucide-react';
import {
  useStudy, useStudyTick, dayKey, addDays, reviewAnswer, dueItems, BOX_DAYS, goalsProgress, DEFAULT_GOALS, computeStats, levelOf, BADGES,
  studyRead, challengeIndex, eventsOn,
} from '../study.js';
import { codingProblems } from '../data/javaCareer.js';
import RichText, { Inline } from '../components/RichText.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { FocusControls } from '../components/FocusTimer.jsx';
import ReminderCard from '../components/ReminderCard.jsx';
import { downloadFile, esc } from '../components/careerUtils.js';

import Ico from '../components/Ico.jsx';
const shuffleIdx = (n) => { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ============================== Install as app ============================== */
function InstallApp() {
  const [can, setCan] = useState(!!window.__installPrompt);
  const [ios, setIos] = useState(false);
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone;
  useEffect(() => {
    const h = () => setCan(!!window.__installPrompt);
    window.addEventListener('upskillr-installable', h);
    return () => window.removeEventListener('upskillr-installable', h);
  }, []);
  if (standalone) return <span className="badge ok">✓ Installed as an app</span>;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return (
    <>
      <button className="btn" onClick={async () => {
        if (window.__installPrompt) { window.__installPrompt.prompt(); try { await window.__installPrompt.userChoice; } catch { /* ignore */ } window.__installPrompt = null; setCan(false); } else setIos(true);
      }}><Smartphone size={15} /> Install app</button>
      {(ios || (!can && isIos)) && <span className="muted small">{isIos ? <>On iPhone: tap Share <Ico e="⬆" /> then "Add to Home Screen".</> : 'Use your browser menu → "Install app" / "Add to Home screen". (Works on the published https site.)'}</span>}
    </>
  );
}

/* ============================== Study Hub ============================== */
export function StudyHub() {
  useStudyTick();
  const s = computeStats();
  const lv = levelOf(s.xp);
  const goals = goalsProgress();
  const due = dueItems().length;
  const mistakes = Object.keys(studyRead('upskillr-study-mistakes', {})).length;
  const today = dayKey();
  const solvedToday = !!studyRead('upskillr-study-daily', {})[today];
  const ch = codingProblems.length ? codingProblems[challengeIndex(today, codingProblems.length)] : null;
  const tiles = [
    ['/study/revision', Repeat, 'Smart Revision', due ? `${due} card${due === 1 ? '' : 's'} due today` : 'Nothing due today ', due ? 'hot' : ''],
    ['/study/mistakes', AlertTriangle, 'Mistake Notebook', mistakes ? `${mistakes} question${mistakes === 1 ? '' : 's'} to fix` : 'No mistakes saved', mistakes ? 'warn' : ''],
    ['/study/planner', CalendarDays, 'Planner & Focus Timer', `${goals.filter((g) => g.got >= g.want).length}/${goals.length} goals done today`, ''],
    ['/study/challenge', Code2, 'Daily Coding Challenge', solvedToday ? 'Solved today ✓' : ch ? `Today: ${ch.title}` : '—', solvedToday ? 'ok' : 'hot'],
    ['/study/notes', NotebookPen, 'My Notes', `${s.notes} lesson${s.notes === 1 ? '' : 's'} with notes`, ''],
    ['/study/achievements', Trophy, 'XP & Badges', `${BADGES.filter((b) => b[4](s)).length}/${BADGES.length} badges`, ''],
    ['/study/certificates', Award, 'Course Certificates', 'Finish a course + grand test', ''],
    ['/study/resume', FileUser, 'Resume Builder', 'ATS-friendly, auto-filled', ''],
    ['/tools/ai-code-review', Bot, 'AI Code Review', 'Get feedback on your code', ''],
  ];
  return (
    <div>
      <div className="page-head">
        <h1><Ico e="📚" /> Study Hub</h1>
        <p className="muted">Everything for daily online study in one place: what to revise today, your mistakes, goals, focus timer, notes, XP, certificates and resume.</p>
        <div className="row-btns"><InstallApp /></div>
      </div>
      <div className="sh-top">
        <div className="card sh-level">
          <div className="sh-lv"><span>Lv {lv.level}</span></div>
          <div className="sh-lv-text">
            <b>{lv.name}</b>
            <div className="muted small">{s.xp} XP · {lv.next - s.xp} XP to level {lv.level + 1}</div>
            <ProgressBar value={lv.pct} />
          </div>
          <div className="sh-streak"><Flame size={22} /><b>{s.streak}</b><span>day streak</span></div>
        </div>
        <div className="card sh-goals">
          <div className="db-card-head"><h3><Target size={18} /> Today's goals</h3><Link className="small" to="/study/planner">Edit →</Link></div>
          {goals.map((g) => (
            <div key={g.key} className="sh-goal">
              <div className="db-part-top"><span>{g.got >= g.want ? <><Ico e="✅" /></> : <><Ico e="⬜" /></>} {g.label}</span><span className="muted small">{Math.min(g.got, g.want)}/{g.want}</span></div>
              <ProgressBar value={g.want ? g.got / g.want : 0} color={g.got >= g.want ? 'var(--ok)' : undefined} />
            </div>
          ))}
        </div>
      </div>
      <div className="sh-tiles">
        {tiles.map(([to, I, h, p, tone]) => (
          <Link key={to} to={to} className={`card sh-tile ${tone}`}>
            <span className="sh-ic"><I size={22} /></span>
            <div><b>{h}</b><div className="muted small">{p}</div></div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ============================== Notes ============================== */
export function NotesPage() {
  const [notes, setNotes] = useStudy('notes', {});
  const [q, setQ] = useState('');
  const list = Object.entries(notes)
    .map(([k, v]) => ({ key: k, ...v }))
    .filter((n) => !q || `${n.title} ${n.course} ${n.text} ${(n.highlights || []).map((h) => h.text).join(' ')}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.course || '').localeCompare(b.course || '') || (b.updatedAt || 0) - (a.updatedAt || 0));
  const courses = [...new Set(list.map((n) => n.course || 'Other'))];

  const exportHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>My Notes</title>
<style>body{font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:820px;margin:2rem auto;padding:0 16px;color:#1d2433;line-height:1.55}h1{margin:0}h2{border-bottom:2px solid #4f46e5;padding-bottom:4px;margin-top:2rem}h3{margin:1.2rem 0 .3rem}mark{background:#fde68a;padding:0 2px}pre{white-space:pre-wrap;font-family:inherit;background:#f6f7fb;padding:.6rem .8rem;border-radius:8px}.m{color:#5d6679;font-size:.85rem}@media print{h2{break-after:avoid}}</style></head><body>
<h1>My Study Notes</h1><p class="m">Exported ${new Date().toLocaleString()} · UpSkillr</p>
${courses.map((c) => `<h2>${esc(c)}</h2>${list.filter((n) => (n.course || 'Other') === c).map((n) => `<h3>${esc(n.title || n.key)}</h3>${n.text ? `<pre>${esc(n.text)}</pre>` : ''}${(n.highlights || []).length ? `<ul>${n.highlights.map((h) => `<li><mark>${esc(h.text)}</mark></li>`).join('')}</ul>` : ''}`).join('')}`).join('')}
</body></html>`;
  const printPdf = () => {
    const w = window.open('', '_blank');
    if (!w) { downloadFile('my-notes.html', exportHtml()); return; }
    w.document.write(exportHtml()); w.document.close(); setTimeout(() => w.print(), 300);
  };

  return (
    <div>
      <div className="page-head">
        <h1><Ico e="📝" /> My Notes</h1>
        <p className="muted">All your lesson notes and highlights in one place. Write notes at the bottom of any lesson; select text in a lesson to highlight it.</p>
        <div className="row-btns">
          <button className="btn primary" disabled={!list.length} onClick={printPdf}><Printer size={15} /> Download as PDF</button>
          <button className="btn" disabled={!list.length} onClick={() => downloadFile('my-notes.html', exportHtml())}><Download size={15} /> Download HTML</button>
        </div>
      </div>
      <div className="sp-search"><Search size={16} /><input className="input" placeholder="Search your notes…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {!list.length && <div className="card empty-state"><NotebookPen size={34} /><p>{q ? 'No notes match your search.' : 'No notes yet. Open any lesson and use the notes box at the bottom, or select text and click Highlight.'}</p><Link className="btn primary" to="/courses">Browse courses</Link></div>}
      {courses.map((c) => (
        <section key={c}>
          <h2 className="section-title">{c}</h2>
          {list.filter((n) => (n.course || 'Other') === c).map((n) => (
            <div key={n.key} className="card sp-note">
              <div className="db-card-head">
                <h3>{n.link ? <Link to={n.link}>{n.title}</Link> : n.title || n.key}</h3>
                <span className="muted small">{n.updatedAt ? new Date(n.updatedAt).toLocaleDateString() : ''} <button className="link-btn danger" onClick={() => window.confirm('Delete the notes and highlights for this lesson?') && setNotes((all) => { const x = { ...all }; delete x[n.key]; return x; })}><Trash2 size={14} /></button></span>
              </div>
              {n.text && <pre className="sp-text">{n.text}</pre>}
              {(n.highlights || []).length > 0 && <ul className="lst-hls">{n.highlights.map((h) => <li key={h.id}><mark>{h.text}</mark></li>)}</ul>}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

/* ============================== MCQ practice card ============================== */
function McqCard({ item, onDone, label }) {
  const q = item.q;
  const order = useMemo(() => shuffleIdx(q.options.length), [item.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [pick, setPick] = useState(null);
  const answered = pick != null;
  const ok = pick === q.answer;
  return (
    <div className="card sp-q">
      <div className="muted small">{label} · {item.link ? <Link to={item.link}>{item.source}</Link> : item.source}</div>
      <h3><Inline text={q.question} /></h3>
      <div className="quiz-opts">
        {order.map((j, n) => {
          let cls = 'opt';
          if (answered && j === q.answer) cls += ' correct';
          if (answered && pick === j && !ok) cls += ' wrong';
          return <button key={j} className={cls} disabled={answered} onClick={() => setPick(j)}><span className="opt-letter">{String.fromCharCode(65 + n)}</span><Inline text={q.options[j]} /></button>;
        })}
      </div>
      {answered && (
        <>
          <div className={`explain ${ok ? 'ok' : 'bad'}`}>{ok ? '✓ Correct! ' : '✗ Not yet. '}{q.explanation && <Inline text={q.explanation} />}</div>
          <button className="btn primary" onClick={() => { reviewAnswer(item.id, ok); onDone(ok); }}>Next →</button>
        </>
      )}
    </div>
  );
}

function CardReview({ item, onDone }) {
  const [show, setShow] = useState(false);
  return (
    <div className="card sp-q">
      <div className="muted small">Flashcard · {item.link ? <Link to={item.link}>{item.source}</Link> : item.source}</div>
      <h3><Inline text={item.card.question} /></h3>
      {!show ? <button className="btn primary" onClick={() => setShow(true)}>Show answer</button> : (
        <>
          <div className="qa-a"><RichText text={item.card.answer} /></div>
          <div className="row-btns">
            <button className="btn danger-btn" onClick={() => { reviewAnswer(item.id, false); onDone(false); }}><X size={15} /> I forgot</button>
            <button className="btn success" onClick={() => { reviewAnswer(item.id, true); onDone(true); }}><Check size={15} /> I knew it</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================== Mistake Notebook ============================== */
export function MistakesPage() {
  const [mistakes, setMistakes] = useStudy('mistakes', {});
  const [practice, setPractice] = useState(null); // queue of ids
  const [stats, setStats] = useState({ ok: 0, bad: 0 });
  const list = Object.entries(mistakes).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.times - a.times || b.at - a.at);
  const sources = [...new Set(list.map((m) => m.source))];
  const [src, setSrc] = useState('All');
  const shown = list.filter((m) => src === 'All' || m.source === src);

  if (practice) {
    const id = practice[0];
    const item = id && (mistakes[id] ? { id, ...mistakes[id] } : null);
    if (!item) {
      return (
        <div className="card center sp-done">
          <h2><Ico e="🎯" /> Practice finished</h2>
          <p>Correct this round: <b>{stats.ok}</b> · Still wrong: <b>{stats.bad}</b></p>
          <p className="muted">Correct answers are removed from the notebook. Every question also goes into Smart Revision so you see it again after a few days.</p>
          <div className="row-btns center"><button className="btn primary" onClick={() => { setPractice(null); setStats({ ok: 0, bad: 0 }); }}>Back to notebook</button><Link className="btn" to="/study/revision">Smart Revision</Link></div>
        </div>
      );
    }
    return (
      <div>
        <div className="row-btns"><button className="btn" onClick={() => setPractice(null)}>← Stop</button><span className="muted">{practice.length} left · ✓ {stats.ok} · ✗ {stats.bad}</span></div>
        <McqCard key={id} item={item} label={`Wrong ${item.times}×`} onDone={(ok) => { setStats((s) => ({ ok: s.ok + (ok ? 1 : 0), bad: s.bad + (ok ? 0 : 1) })); setPractice((p) => p.slice(1)); }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <h1><Ico e="⚠" /> Mistake Notebook</h1>
        <p className="muted">Every question you get wrong in a lesson quiz, Quiz Arena or test series is saved here automatically. Practise them again: when you answer correctly, the question leaves the notebook.</p>
        <div className="row-btns">
          <button className="btn primary" disabled={!shown.length} onClick={() => { setStats({ ok: 0, bad: 0 }); setPractice(shuffleIdx(shown.length).map((i) => shown[i].id)); }}>▶ Practise {shown.length} question{shown.length === 1 ? '' : 's'}</button>
          {list.length > 0 && <button className="link-btn danger" onClick={() => window.confirm('Clear the whole mistake notebook?') && setMistakes({})}>Clear all</button>}
        </div>
      </div>
      {sources.length > 1 && <div className="quiz-settings"><label>From <select value={src} onChange={(e) => setSrc(e.target.value)}><option>All</option>{sources.map((x) => <option key={x}>{x}</option>)}</select></label></div>}
      {!list.length && <div className="card empty-state"><AlertTriangle size={34} /><p>No mistakes saved. Take a lesson quiz or a test — any wrong answer will appear here.</p><Link className="btn primary" to="/tools/test-series">Take a test</Link></div>}
      {shown.map((m) => (
        <details key={m.id} className="card qa">
          <summary><span className="qa-q"><Inline text={m.q.question} /></span><span className="badge">✗ {m.times}×</span></summary>
          <div className="qa-a">
            <div className="muted small">{m.link ? <Link to={m.link}>{m.source}</Link> : m.source}</div>
            <p><b>Correct answer:</b> <Inline text={m.q.options[m.q.answer]} /></p>
            {m.q.explanation && <div className="explain ok"><Inline text={m.q.explanation} /></div>}
          </div>
        </details>
      ))}
    </div>
  );
}

/* ============================== Smart Revision ============================== */
export function RevisionPage() {
  const [srs] = useStudy('srs', {});
  const [queue, setQueue] = useState(null);
  const [round, setRound] = useState({ ok: 0, bad: 0 });
  const today = dayKey();
  const all = Object.entries(srs).map(([id, v]) => ({ id, ...v }));
  const due = all.filter((x) => x.due && x.due <= today);
  const tomorrow = all.filter((x) => x.due === addDays(today, 1)).length;
  const week = all.filter((x) => x.due && x.due > today && x.due <= addDays(today, 7)).length;
  const mastered = all.filter((x) => !x.due).length;
  const boxes = [0, 1, 2, 3].map((b) => all.filter((x) => x.due && (x.box ?? 0) === b).length);

  if (queue) {
    const id = queue[0];
    const item = id && srs[id] ? { id, ...srs[id] } : null;
    if (!item) {
      return (
        <div className="card center sp-done">
          <h2><Ico e="✅" /> Revision done for now</h2>
          <p>Remembered: <b>{round.ok}</b> · Forgot: <b>{round.bad}</b></p>
          <p className="muted">Remembered cards come back after {BOX_DAYS.join(', ')} days; forgotten ones come back tomorrow.</p>
          <button className="btn primary" onClick={() => setQueue(null)}>Back</button>
        </div>
      );
    }
    const next = (ok) => { setRound((r) => ({ ok: r.ok + (ok ? 1 : 0), bad: r.bad + (ok ? 0 : 1) })); setQueue((q) => q.slice(1)); };
    return (
      <div>
        <div className="row-btns"><button className="btn" onClick={() => setQueue(null)}>← Stop</button><span className="muted">{queue.length} left · ✓ {round.ok} · ✗ {round.bad}</span></div>
        {item.card ? <CardReview key={id} item={item} onDone={next} /> : <McqCard key={id} item={item} label={`Box ${(item.box ?? 0) + 1}`} onDone={next} />}
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🔁" /> Smart Revision</h1>
        <p className="muted">Spaced repetition: each question comes back just before you forget it — after <b>1, 3, 7 and 30 days</b>. Wrong quiz answers are added automatically; add interview questions with the <Ico e="🔁" /> button in any lesson.</p>
        <button className="btn primary" disabled={!due.length} onClick={() => { setRound({ ok: 0, bad: 0 }); setQueue(shuffleIdx(due.length).map((i) => due[i].id)); }}>{due.length ? `▶ Revise ${due.length} card${due.length === 1 ? '' : 's'} due today` : <>Nothing due today <Ico e="🎉" /></>}</button>
      </div>
      <div className="ts-stats">
        <div className="card"><b>{due.length}</b><span>Due today</span></div>
        <div className="card"><b>{tomorrow}</b><span>Due tomorrow</span></div>
        <div className="card"><b>{week}</b><span>Coming this week</span></div>
        <div className="card"><b>{mastered}</b><span>Mastered (30-day pass)</span></div>
      </div>
      <div className="card">
        <h3>How your memory is growing</h3>
        <div className="sp-boxes">
          {boxes.map((n, i) => <div key={i}><b>{n}</b><span>{i === 0 ? 'New / forgotten' : `Next in ${BOX_DAYS[i]} days`}</span></div>)}
          <div className="ok"><b>{mastered}</b><span>Mastered</span></div>
        </div>
      </div>
      {!all.length && <div className="card empty-state"><Repeat size={34} /><p>Your revision deck is empty. Take quizzes (wrong answers are added) or click <Ico e="🔁" /> next to interview questions in a lesson.</p></div>}
    </div>
  );
}

/* ============================== Planner ============================== */
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export function PlannerPage() {
  useStudyTick();
  const [plan, setPlan] = useStudy('planner', {});
  const goals = { ...DEFAULT_GOALS, ...(plan.goals || {}) };
  const today = dayKey();
  const [offset, setOffset] = useState(0);
  const [sel, setSel] = useState(today);
  const [txt, setTxt] = useState('');
  const base = new Date(); base.setDate(base.getDate() + offset * 7 - ((base.getDay() + 6) % 7));
  const days = WEEK.map((_, i) => dayKey(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)));
  const tasks = plan.tasks || {};
  const setGoal = (k, v) => setPlan((p) => ({ ...p, goals: { ...DEFAULT_GOALS, ...(p.goals || {}), [k]: Math.max(0, Number(v) || 0) } }));
  const addTask = () => { const t = txt.trim(); if (!t) return; setPlan((p) => ({ ...p, tasks: { ...(p.tasks || {}), [sel]: [...((p.tasks || {})[sel] || []), { id: Date.now().toString(36), text: t, done: false }] } })); setTxt(''); };
  const toggle = (d, id) => setPlan((p) => ({ ...p, tasks: { ...p.tasks, [d]: p.tasks[d].map((x) => (x.id === id ? { ...x, done: !x.done } : x)) } }));
  const del = (d, id) => setPlan((p) => ({ ...p, tasks: { ...p.tasks, [d]: p.tasks[d].filter((x) => x.id !== id) } }));
  const prog = goalsProgress(today, goals);

  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🗓" /> Study Planner &amp; Focus Timer</h1>
        <p className="muted">Set daily goals, plan your week and study in focused Pomodoro sessions. Goals update automatically when you complete lessons, take quizzes, revise and focus.</p>
      </div>
      <div className="sp-plan-top">
        <div className="card"><h3><Ico e="⏱" /> Focus timer</h3><FocusControls /></div>
        <div className="card">
          <h3><Ico e="🎯" /> Today's goals</h3>
          {prog.map((g) => (
            <div key={g.key} className="sh-goal">
              <div className="db-part-top"><span>{g.got >= g.want ? <><Ico e="✅" /></> : <><Ico e="⬜" /></>} {g.label}</span><span className="muted small">{Math.min(g.got, g.want)}/{g.want}</span></div>
              <ProgressBar value={g.want ? g.got / g.want : 0} color={g.got >= g.want ? 'var(--ok)' : undefined} />
            </div>
          ))}
          <details className="sp-goal-edit"><summary className="small">Change my daily goals</summary>
            {[['lessons', 'Lessons per day'], ['quizzes', 'Quizzes / tests per day'], ['focus', 'Focus minutes per day'], ['reviews', 'Revision cards per day']].map(([k, l]) => (
              <label key={k} className="db-part-top">{l}<input className="input" type="number" min={0} value={goals[k]} onChange={(e) => setGoal(k, e.target.value)} style={{ width: 90 }} /></label>
            ))}
          </details>
        </div>
      </div>

      <div className="card">
        <div className="db-card-head">
          <h3><Ico e="📅" /> Week of {new Date(days[0]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</h3>
          <div className="row-btns"><button className="btn small" onClick={() => setOffset(offset - 1)}><ChevronLeft size={15} /></button><button className="btn small" onClick={() => { setOffset(0); setSel(today); }}>This week</button><button className="btn small" onClick={() => setOffset(offset + 1)}><ChevronRight size={15} /></button></div>
        </div>
        <div className="sp-week">
          {days.map((d, i) => {
            const ev = eventsOn(d);
            const lessons = ev.filter((e) => e.type === 'lesson').length;
            const qz = ev.filter((e) => e.type === 'quiz' || e.type === 'test').length;
            const fm = ev.filter((e) => e.type === 'focus').reduce((s, e) => s + (e.minutes || 0), 0);
            const t = tasks[d] || [];
            return (
              <button key={d} className={`sp-day ${d === today ? 'today' : ''} ${d === sel ? 'sel' : ''}`} onClick={() => setSel(d)}>
                <span className="sp-dname">{WEEK[i]} <b>{Number(d.slice(8))}</b></span>
                {lessons > 0 && <span><Ico e="📘" /> {lessons}</span>}
                {qz > 0 && <span><Ico e="🏆" /> {qz}</span>}
                {fm > 0 && <span><Ico e="⏱" /> {fm}m</span>}
                {t.length > 0 && <span><Ico e="☑" /> {t.filter((x) => x.done).length}/{t.length}</span>}
              </button>
            );
          })}
        </div>
        <h4>Plan for {new Date(sel).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</h4>
        <div className="sp-add"><input className="input" placeholder="e.g. Finish Java Day 12 + quiz" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} /><button className="btn primary" onClick={addTask}><Plus size={15} /> Add</button></div>
        {(tasks[sel] || []).length === 0 ? <p className="muted small">No tasks planned for this day.</p> : (
          <ul className="task-list">{tasks[sel].map((x) => (
            <li key={x.id} className="sp-task"><label className="check"><input type="checkbox" checked={x.done} onChange={() => toggle(sel, x.id)} /> <span className={x.done ? 'jc-done' : ''}>{x.text}</span></label><button className="link-btn danger" onClick={() => del(sel, x.id)}><Trash2 size={14} /></button></li>
          ))}</ul>
        )}
      </div>
      <ReminderCard tasks={tasks} days={days} />
    </div>
  );
}

/* ============================== Achievements ============================== */
export function AchievementsPage() {
  useStudyTick();
  const s = computeStats();
  const lv = levelOf(s.xp);
  const rows = [
    ['Lessons completed', s.done, 10], ['Lesson quizzes taken', s.quizzes, 5], ['Perfect 5/5 quizzes', s.perfect, 10], ['Practice exercises solved', s.practice, 5],
    ['Test series attempts', s.tests, 5], ['Tests passed (60%+)', s.testsPassed, 50], ['Coding problems solved', s.coding, 15], ['Final projects submitted', s.projects, 100],
    ['Focus sessions (per 25 min)', Math.floor(s.focusMin / 25), 5], ['Revision cards reviewed', s.reviews, 2], ['Cards mastered', s.mastered, 5], ['Daily challenges solved', s.challenges, 20], ['Lessons with notes', s.notes, 2], ['Code puzzles solved', s.puzzles, 5], ['Quiz battles won', s.battlesWon, 10], ['Feynman explanations', s.feynman, 3], ['Video mock interviews', s.interviews, 5], ['Weekly challenges won', s.weeksWon, 50],
  ];
  const got = BADGES.filter((b) => b[4](s)).length;
  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🏅" /> XP, Levels &amp; Badges</h1>
        <p className="muted">Earn XP for everything you learn and practise. Level up and unlock badges.</p>
      </div>
      <div className="card sh-level big">
        <div className="sh-lv"><span>Lv {lv.level}</span></div>
        <div className="sh-lv-text">
          <b>{lv.name} · {s.xp} XP</b>
          <div className="muted small">{lv.next - s.xp} XP to level {lv.level + 1}</div>
          <ProgressBar value={lv.pct} />
        </div>
        <div className="sh-streak"><Flame size={22} /><b>{s.streak}</b><span>day streak</span></div>
      </div>
      <h2 className="section-title">Badges ({got}/{BADGES.length})</h2>
      <div className="sp-badges">
        {BADGES.map(([id, ic, name, desc, test]) => {
          const on = test(s);
          return <div key={id} className={`card sp-badge ${on ? 'on' : ''}`}><span className="sp-bic"><Ico e={ic} /></span><b>{name}</b><span className="muted small">{desc}</span>{on ? <span className="badge ok">Unlocked</span> : <span className="badge">Locked</span>}</div>;
        })}
      </div>
      <h2 className="section-title">How you earned your XP</h2>
      <div className="card"><div className="table-wrap"><table className="data-table">
        <thead><tr><th>Activity</th><th>Count</th><th>XP each</th><th>XP</th></tr></thead>
        <tbody>{rows.map(([l, n, x]) => <tr key={l}><td>{l}</td><td>{n}</td><td>{x}</td><td><b>{n * x}</b></td></tr>)}</tbody>
      </table></div></div>
    </div>
  );
}

/* ============================== Dashboard card ============================== */
export function StudyTodayCard() {
  useStudyTick();
  const s = computeStats();
  const lv = levelOf(s.xp);
  const goals = goalsProgress();
  const due = dueItems().length;
  const mistakes = Object.keys(studyRead('upskillr-study-mistakes', {})).length;
  const solved = !!studyRead('upskillr-study-daily', {})[dayKey()];
  const met = goals.filter((g) => g.got >= g.want).length;
  return (
    <div className="card st-card">
      <div className="st-lv"><span>Lv {lv.level}</span><div><b>{lv.name}</b><div className="muted small">{s.xp} XP</div><ProgressBar value={lv.pct} /></div></div>
      <Link to="/study/planner" className="st-item"><Target size={18} /><b>{met}/{goals.length}</b><span>goals today</span></Link>
      <Link to="/study/revision" className={`st-item ${due ? 'hot' : ''}`}><Repeat size={18} /><b>{due}</b><span>to revise</span></Link>
      <Link to="/study/mistakes" className="st-item"><AlertTriangle size={18} /><b>{mistakes}</b><span>mistakes</span></Link>
      <Link to="/study/challenge" className={`st-item ${solved ? 'ok' : 'hot'}`}><Code2 size={18} /><b>{solved ? '✓' : '1'}</b><span>{solved ? 'challenge done' : 'daily challenge'}</span></Link>
      <Link to="/study" className="btn small primary">Study Hub →</Link>
    </div>
  );
}
