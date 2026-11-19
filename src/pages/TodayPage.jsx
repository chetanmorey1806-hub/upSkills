import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Flame, Trophy, CalendarClock, Settings2 } from 'lucide-react';
import { tracks, trackGroups, topicKey } from '../data/index.js';
import { codingProblems } from '../data/javaCareer.js';
import { APTITUDE } from '../data/aptitude.js';
import { useAuth, firstName } from '../auth.js';
import { useStudy, useStudyTick, studyRead, dayKey, addDays, eventsOn, dueItems, goalsProgress, DEFAULT_GOALS, challengeIndex, computeStats, levelOf } from '../study.js';
import ProgressBar from '../components/ProgressBar.jsx';
import { openOnboarding } from '../components/Onboarding.jsx';

import Ico from '../components/Ico.jsx';
export const DEFAULT_WEEKLY = { lessons: 5, tests: 2 };
export const weekStart = (d = dayKey()) => { const [y, m, dd] = d.split('-').map(Number); const x = new Date(y, m - 1, dd); const back = (x.getDay() + 6) % 7; return addDays(d, -back); };

export function weeklyProgress(start = weekStart(), target) {
  const t = { ...DEFAULT_WEEKLY, ...(target || studyRead('upskillr-study-planner', {}).weekly || {}) };
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const log = studyRead('upskillr-study-log', []).filter((e) => days.includes(e.day));
  const lessons = log.filter((e) => e.type === 'lesson').length;
  const tests = log.filter((e) => e.type === 'test' || e.type === 'quiz').length;
  return { start, days, target: t, lessons, tests, met: lessons >= t.lessons && tests >= t.tests };
}

function currentCourse(profile) {
  const prog = studyRead('xlpbi-progress-v1', {});
  const last = studyRead('xlpbi-last-topic', null);
  if (last?.track && tracks[last.track]) return last.track;
  const g = trackGroups.find((x) => x.key === profile?.group);
  const list = (g?.tracks || []).filter((k) => tracks[k]?.topics?.length);
  return list.find((k) => tracks[k].topics.some((t) => !(prog.done || {})[topicKey(k, t.id)])) || list[0] || 'corejava';
}

export default function TodayPage() {
  useStudyTick();
  const user = useAuth();
  const [profile] = useStudy('upskillr-study-profile', null);
  const [plan, setPlan] = useStudy('planner', {});
  const [weekly, setWeekly] = useStudy('upskillr-study-weekly', {});
  const today = dayKey();
  const goals = { ...DEFAULT_GOALS, ...(plan.goals || {}) };
  const prog = studyRead('xlpbi-progress-v1', {});
  const course = currentCourse(profile);
  const tr = tracks[course];
  const next = tr?.topics.find((t) => !(prog.done || {})[topicKey(course, t.id)]);
  const lessonsToday = eventsOn(today, 'lesson').length;
  const due = dueItems().length;
  const reviewsToday = eventsOn(today, 'review').length;
  const mistakes = Object.keys(studyRead('upskillr-study-mistakes', {})).length;
  const solved = !!studyRead('upskillr-study-daily', {})[today];
  const ch = codingProblems.length ? codingProblems[challengeIndex(today, codingProblems.length)] : null;
  const testsToday = eventsOn(today).filter((e) => e.type === 'test' || e.type === 'quiz').length;
  const focusToday = eventsOn(today, 'focus').reduce((s, e) => s + (e.minutes || 0), 0);
  const placement = profile?.goal === 'placement' || /Final|Graduate/.test(profile?.year || '');
  const aptRes = studyRead('upskillr-study-aptitude', {});
  const apt = APTITUDE.length ? [...APTITUDE].sort((a, b) => (aptRes[a.id]?.best ?? -1) - (aptRes[b.id]?.best ?? -1))[0] : null;
  const apps = studyRead('upskillr-career-apps', []);
  const upcoming = apps.filter((a) => a.nextDate && a.nextDate >= today && a.nextDate <= addDays(today, 7)).sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  const items = [
    next && { key: 'lesson', icon: '📘', title: `${goals.lessons > 1 ? `${goals.lessons} lessons` : 'Next lesson'}: ${next.title}`, sub: `${tr.short}${next.day ? ` · Day ${next.day}` : ''} · ${next.duration || ''}`, to: `/track/${course}/${next.id}`, done: lessonsToday >= Math.max(1, goals.lessons), extra: `${Math.min(lessonsToday, goals.lessons)}/${goals.lessons}` },
    { key: 'revise', icon: '🔁', title: due ? `Revise ${Math.min(due, goals.reviews || 10)} cards` : 'Revision is up to date', sub: due ? `${due} card${due === 1 ? '' : 's'} due today (spaced repetition)` : 'New cards come from your quiz mistakes', to: '/study/revision', done: due === 0 || reviewsToday >= Math.min(due, goals.reviews || 10) },
    mistakes > 0 && { key: 'mistakes', icon: '⚠️', title: `Fix ${Math.min(5, mistakes)} old mistakes`, sub: `${mistakes} questions in your Mistake Notebook`, to: '/study/mistakes', done: reviewsToday >= 5 },
    ch && { key: 'challenge', icon: '💻', title: `Daily challenge: ${ch.title}`, sub: `${ch.topic} · ${ch.level} · 20 XP`, to: '/study/challenge', done: solved },
    placement && apt
      ? { key: 'apt', icon: '🧮', title: `Aptitude: ${apt.title}`, sub: `${apt.section} · practise 15 questions`, to: `/practice/aptitude/${apt.id}`, done: testsToday >= 1 }
      : { key: 'test', icon: '🏆', title: `Take one ${tr?.short || ''} test`, sub: 'A lesson quiz or a test series paper', to: `/tools/test-series/${course}`, done: testsToday >= 1 },
    goals.focus > 0 && { key: 'focus', icon: '⏱️', title: `${goals.focus} minutes of focused study`, sub: `${focusToday} min done · use the Pomodoro timer`, to: '/study/planner', done: focusToday >= goals.focus },
  ].filter(Boolean);
  const done = items.filter((x) => x.done).length;
  const s = computeStats();
  const lv = levelOf(s.xp);
  const wk = weeklyProgress(weekStart(), plan.weekly);
  useEffect(() => { if (wk.met && !weekly[wk.start]) setWeekly((w) => ({ ...w, [wk.start]: { at: Date.now(), ...wk.target } })); }, [wk.met, wk.start]); // eslint-disable-line react-hooks/exhaustive-deps
  const setWeeklyTarget = (k, v) => setPlan((p) => ({ ...p, weekly: { ...DEFAULT_WEEKLY, ...(p.weekly || {}), [k]: Math.max(1, Number(v) || 1) } }));
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const pct = items.length ? done / items.length : 0;
  const weeksWon = Object.keys(weekly).length;

  return (
    <div>
      <div className="td-hero">
        <div>
          <div className="td-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <h1>{hello}, {firstName(user) || 'there'}! <Ico e="☀" /></h1>
          <p>{done === items.length ? <>All done for today — amazing work! <Ico e="🎉" /> Rest, or get ahead with one more lesson.</> : `${items.length - done} thing${items.length - done === 1 ? '' : 's'} left on today's plan. Start from the top.`}</p>
          <div className="db-hero-chips"><span><Flame size={15} /> {s.streak}-day streak</span><span><Trophy size={15} /> Level {lv.level} · {s.xp} XP</span>{!profile && <button className="td-setup" onClick={openOnboarding}><Settings2 size={14} /> Set my goal</button>}</div>
        </div>
        <div className="td-ring" style={{ '--p': Math.round(pct * 100) }}><b>{done}/{items.length}</b><span>done today</span></div>
      </div>

      {upcoming.length > 0 && (
        <div className="card td-upcoming"><CalendarClock size={18} /><div>{upcoming.map((a) => <div key={a.id}><b>{a.nextDate === today ? 'Today' : new Date(`${a.nextDate}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}{a.nextTime ? ` ${a.nextTime}` : ''}</b> — {a.company}: {a.nextRound || a.stage}</div>)}</div><Link className="btn small" to="/career/applications">Prepare</Link></div>
      )}

      <div className="td-list">
        {items.map((it) => (
          <Link key={it.key} to={it.to} className={`card td-item ${it.done ? 'done' : ''}`}>
            <span className="td-check">{it.done ? <CheckCircle2 size={24} /> : <Circle size={24} />}</span>
            <span className="td-ic"><Ico e={it.icon} /></span>
            <span className="td-txt"><b>{it.title}</b><span>{it.sub}</span></span>
            {it.extra && <span className="badge">{it.extra}</span>}
            <span className="td-go">{it.done ? 'Done' : 'Start →'}</span>
          </Link>
        ))}
      </div>

      <div className="card td-week">
        <div className="db-card-head"><h3><Ico e="🏅" /> Weekly challenge</h3><span className="muted small">Week of {new Date(`${wk.start}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {weeksWon} week{weeksWon === 1 ? '' : 's'} won</span></div>
        <div className="td-wk">
          <div><div className="db-part-top"><span><Ico e="📘" /> Lessons</span><span className="muted small">{Math.min(wk.lessons, wk.target.lessons)}/{wk.target.lessons}</span></div><ProgressBar value={wk.lessons / wk.target.lessons} color={wk.lessons >= wk.target.lessons ? 'var(--ok)' : undefined} /></div>
          <div><div className="db-part-top"><span><Ico e="🏆" /> Tests & quizzes</span><span className="muted small">{Math.min(wk.tests, wk.target.tests)}/{wk.target.tests}</span></div><ProgressBar value={wk.tests / wk.target.tests} color={wk.tests >= wk.target.tests ? 'var(--ok)' : undefined} /></div>
        </div>
        {wk.met ? <div className="explain ok"><Ico e="🎉" /> Challenge complete! +50 XP and progress towards the "Weekly Winner" badges.</div> : <p className="muted small">Complete it before Sunday night to win the week (+50 XP).</p>}
        <details className="sp-goal-edit"><summary className="small">Change weekly target</summary>
          <label className="db-part-top">Lessons per week<input className="input" type="number" min={1} value={wk.target.lessons} onChange={(e) => setWeeklyTarget('lessons', e.target.value)} style={{ width: 90 }} /></label>
          <label className="db-part-top">Tests per week<input className="input" type="number" min={1} value={wk.target.tests} onChange={(e) => setWeeklyTarget('tests', e.target.value)} style={{ width: 90 }} /></label>
        </details>
      </div>
      <div className="grid2">
        <Link to="/study/planner" className="card sh-tile"><span className="sh-ic"><Ico e="📅" /></span><div><b>Planner, reminders &amp; calendar</b><div className="muted small">Set daily reminders and add your plan to Google Calendar</div></div></Link>
        <Link to="/study/report" className="card sh-tile"><span className="sh-ic"><Ico e="📊" /></span><div><b>Weekly report</b><div className="muted small">Share your progress with parents or teachers</div></div></Link>
      </div>
    </div>
  );
}
