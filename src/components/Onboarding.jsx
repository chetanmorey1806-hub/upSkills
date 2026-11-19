import { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, X, Sparkles, Compass } from 'lucide-react';
import { tracks, trackGroups } from '../data/index.js';
import { useAuth, firstName } from '../auth.js';
import { useStudy, DEFAULT_GOALS } from '../study.js';

export const startTour = () => window.dispatchEvent(new Event('start-tour'));
export const openOnboarding = () => window.dispatchEvent(new Event('open-onboarding'));

const GOALS = [['placement', '🎯', 'Get placed / get a job', 'Courses + aptitude + interview practice'], ['skill', '🚀', 'Learn a new skill', 'Day-wise lessons with projects'], ['exams', '📝', 'College exams & practicals', 'Theory, examples and quizzes'], ['switch', '🔁', 'Switch my career to IT', 'A complete path from zero']];
const YEARS = ['1st / 2nd year', '3rd year', 'Final year', 'Graduate – looking for a job', 'Working professional'];
const TIMES = [[30, '30 min'], [60, '1 hour'], [90, '1.5 hours'], [120, '2+ hours']];

const TOUR = [
  ['Today', '☀️ Today', 'Your plan for the day: the next lesson, revision, a coding challenge and a test. Start here every day.'],
  ['Courses', '📚 Courses', 'All day-wise courses. Each lesson has theory, examples, interview Q&A, practice and a quiz.'],
  ['Study', '🧠 Study', 'Smart revision, mistake notebook, notes, planner with focus timer, diagnostic test, XP and certificates.'],
  ['Test Series', '🏆 Test Series', 'Practice sets, module-wise and lesson-wise tests plus mock interviews for every course.'],
  ['Practice Labs', '🧪 Practice Labs', 'Code in the browser: Python, Java, web, SQL… plus the code visualizer, DSA animations, puzzles and error explainer.'],
  ['Interview Prep', '🎤 Interview Prep', 'Aptitude & reasoning, company-wise mock tests, video mock interviews and soft skills.'],
  ['Projects', '🏗️ Projects', 'Guided final projects with automated checks and certificates for your portfolio.'],
  ['Career', '💼 Career', 'Track job applications, compare offers and keep your interview journal.'],
  ['__search', '🔎 Search everything', 'Press Ctrl K (or tap here) to jump to any lesson, tool, aptitude topic or error.'],
];

function findTarget(key) {
  if (key === '__search') return document.querySelector('.top-search') || document.querySelector('.menu-btn');
  const links = [...document.querySelectorAll('.topnav .nav-link')];
  const el = links.find((a) => a.textContent.trim() === key);
  if (el && el.offsetParent) return el;
  return document.querySelector('.menu-btn');
}

function Tour({ onEnd }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);
  const step = TOUR[i];
  useLayoutEffect(() => {
    const upd = () => { const el = findTarget(step[0]); setRect(el ? el.getBoundingClientRect() : null); };
    upd();
    window.addEventListener('resize', upd);
    window.addEventListener('scroll', upd, { passive: true });
    return () => { window.removeEventListener('resize', upd); window.removeEventListener('scroll', upd); };
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { window.scrollTo({ top: 0 }); const k = (e) => { if (e.key === 'Escape') onEnd(); if (e.key === 'ArrowRight') setI((x) => Math.min(TOUR.length - 1, x + 1)); if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1)); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onEnd]);
  const pad = 6;
  const tipW = Math.min(340, window.innerWidth - 24);
  const left = rect ? Math.max(12, Math.min(window.innerWidth - tipW - 12, rect.left + rect.width / 2 - tipW / 2)) : (window.innerWidth - tipW) / 2;
  const top = rect ? rect.bottom + 14 : window.innerHeight / 3;
  return (
    <div className="tour" role="dialog" aria-label="App tour">
      {rect ? <div className="tour-hole" style={{ left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }} /> : <div className="tour-dim" />}
      <div className="tour-tip" style={{ left, top, width: tipW }}>
        <div className="tour-step">Step {i + 1} of {TOUR.length}</div>
        <h3>{step[1]}</h3>
        <p>{step[2]}</p>
        <div className="tour-dots">{TOUR.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
        <div className="row-btns">
          <button className="link-btn" onClick={onEnd}>Skip tour</button>
          <span style={{ flex: 1 }} />
          {i > 0 && <button className="btn small" onClick={() => setI(i - 1)}><ArrowLeft size={14} /></button>}
          {i < TOUR.length - 1 ? <button className="btn small primary" onClick={() => setI(i + 1)}>Next <ArrowRight size={14} /></button> : <button className="btn small primary" onClick={onEnd}>Finish 🎉</button>}
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const user = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [profile, setProfile] = useStudy('upskillr-study-profile', null);
  const [, setPlan] = useStudy('planner', {});
  const [open, setOpen] = useState(false);
  const [tour, setTour] = useState(false);
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ goal: 'placement', group: 'java', year: YEARS[2], minutes: 60 });
  useEffect(() => { if (user && !profile && !pathname.startsWith('/admin')) { setOpen(true); setStep(0); } }, [user, profile]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = () => { setOpen(false); setTour(true); };
    const o = () => { if (profile) setF((x) => ({ ...x, ...profile })); setStep(0); setOpen(true); };
    window.addEventListener('start-tour', t); window.addEventListener('open-onboarding', o);
    return () => { window.removeEventListener('start-tour', t); window.removeEventListener('open-onboarding', o); };
  }, [profile]);
  if (tour) return <Tour onEnd={() => setTour(false)} />;
  if (!open || !user) return null;
  const groups = trackGroups.filter((g) => g.tracks.some((k) => tracks[k]?.topics?.length));
  const grp = groups.find((g) => g.key === f.group) || groups[0];
  const courses = (grp?.tracks || []).filter((k) => tracks[k]?.topics?.length);
  const lessonsPerDay = f.minutes >= 120 ? 3 : f.minutes >= 90 ? 2 : f.minutes >= 60 ? 2 : 1;
  const totalLessons = courses.reduce((s, k) => s + tracks[k].topics.length, 0);
  const weeks = Math.ceil(totalLessons / (lessonsPerDay * 6));
  const finish = (then) => {
    setProfile({ ...f, at: Date.now() });
    setPlan((p) => ({ ...p, goals: { ...DEFAULT_GOALS, ...(p.goals || {}), lessons: lessonsPerDay, focus: Math.round(f.minutes * 0.6 / 5) * 5, quizzes: 1, reviews: 10 } }));
    setOpen(false);
    if (then === 'tour') { nav('/today'); setTimeout(() => setTour(true), 400); }
    else if (then) nav(then);
  };
  const skip = () => { setProfile({ ...f, skipped: true, at: Date.now() }); setOpen(false); };
  const first = firstName(user);
  const steps = [
    <div key="goal"><h2>Hi {first}! 👋 What is your main goal?</h2><p className="muted">We will build your personal plan in 30 seconds.</p>
      <div className="ob-opts">{GOALS.map(([k, ic, t, d]) => <button key={k} className={`ob-opt ${f.goal === k ? 'on' : ''}`} onClick={() => setF({ ...f, goal: k })}><span>{ic}</span><b>{t}</b><small>{d}</small></button>)}</div></div>,
    <div key="path"><h2>Which path do you want to learn?</h2><p className="muted">You can open every course anytime — this decides your main plan.</p>
      <div className="ob-opts">{groups.map((g) => <button key={g.key} className={`ob-opt ${f.group === g.key ? 'on' : ''}`} onClick={() => setF({ ...f, group: g.key })}><b>{g.name}</b><small>{g.tracks.filter((k) => tracks[k]?.topics?.length).map((k) => tracks[k].short).join(' · ')}</small></button>)}</div></div>,
    <div key="year"><h2>Where are you right now?</h2>
      <div className="ob-opts one">{YEARS.map((y) => <button key={y} className={`ob-opt ${f.year === y ? 'on' : ''}`} onClick={() => setF({ ...f, year: y })}><b>{y}</b></button>)}</div></div>,
    <div key="time"><h2>How much time can you study daily?</h2><p className="muted">Be realistic — consistency beats long hours.</p>
      <div className="ob-opts">{TIMES.map(([m, l]) => <button key={m} className={`ob-opt ${f.minutes === m ? 'on' : ''}`} onClick={() => setF({ ...f, minutes: m })}><b>{l}</b><small>≈ {m >= 120 ? 3 : m >= 60 ? 2 : 1} lesson{m >= 60 ? 's' : ''} a day</small></button>)}</div></div>,
    <div key="plan"><h2><Sparkles size={20} /> Your personal plan</h2>
      <div className="ob-plan">
        <div><b>{grp?.name}</b><span>{courses.length} courses · {totalLessons} lessons</span></div>
        <div><b>{lessonsPerDay} lesson{lessonsPerDay > 1 ? 's' : ''} / day</b><span>about {weeks} weeks at 6 days a week</span></div>
        <div><b>{Math.round(f.minutes * 0.6 / 5) * 5} min focus</b><span>+ 10 revision cards daily</span></div>
      </div>
      <ol className="ob-order">{courses.map((k) => <li key={k}>{tracks[k].name}</li>)}</ol>
      {(f.goal === 'placement' || f.year.startsWith('Final') || f.year.startsWith('Graduate')) && <div className="tip">🎯 Placement focus: add 20 minutes of Aptitude daily and one company mock test every week. Your Today page will remind you.</div>}
      <p className="muted small">Daily goals are set in your planner — change them anytime.</p>
    </div>,
  ];
  return (
    <div className="ob-overlay">
      <div className="ob" role="dialog" aria-label="Set up your plan">
        <button className="ob-x" onClick={skip} aria-label="Skip"><X size={18} /></button>
        <div className="ob-bar"><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <div className="ob-body" key={step}>{steps[step]}</div>
        <div className="ob-foot">
          {step > 0 ? <button className="btn" onClick={() => setStep(step - 1)}><ArrowLeft size={15} /> Back</button> : <button className="link-btn" onClick={skip}>Skip for now</button>}
          {step < steps.length - 1 ? <button className="btn primary" onClick={() => setStep(step + 1)}>Next <ArrowRight size={15} /></button> : (
            <div className="row-btns">
              <button className="btn" onClick={() => finish(`/study/diagnostic`)}><Compass size={15} /> Diagnostic test</button>
              <button className="btn primary" onClick={() => finish('tour')}>Start with a quick tour <ArrowRight size={15} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
