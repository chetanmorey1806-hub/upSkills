// Landing page banner: animated slider where every slide shows a live "scene" from NGU itself
// (course progress, Python IDE, Power BI dashboard, project certificate, mock test, speaking coach)
// over a tinted photo with Ken Burns zoom and floating code glyphs.
// Autoplay every 3 s (pauses on hover / hidden tab), arrows, dots with progress, keyboard and swipe.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Pause, Play, BookOpenCheck, Laptop, BarChart3, Rocket, Trophy, MessageCircle, ArrowRight,
  CheckCircle2, Mic, Timer, Award, TrendingUp, IndianRupee, ShoppingCart, Users,
} from 'lucide-react';
import { allTopics, trackOrder, tracks } from '../data/index.js';
import { TrackIcon } from './Icons.jsx';
import Logo from './Logo.jsx';

const BASE = import.meta.env.BASE_URL || '/';
const img = (f) => `${BASE}banner/${f}`;
const N_COURSES = trackOrder.length;
const N_LESSONS = allTopics.length.toLocaleString('en-IN');
const N_QA = (Math.floor(allTopics.reduce((t, x) => t + (x.interview?.length || 0), 0) / 1000) * 1000).toLocaleString('en-IN');
const DURATION = 3000;
const GLYPHS = ['</>', '{ }', '=SUM()', 'def', 'SELECT', '=>', 'npm', 'DAX', 'class', '#', '[ ]', 'git'];

/* ------------------------------ animated scenes ------------------------------ */
const COURSE_TILES = [['excel', 82], ['powerbi', 64], ['python', 91], ['corejava', 55], ['react', 73], ['dotnet', 47]];
function SceneCourses() {
  return (
    <div className="sc-courses">
      {COURSE_TILES.map(([k, p], n) => (
        <div key={k} className="sc-tile" style={{ '--d': `${n * 90}ms`, '--p': `${p}%`, '--c': tracks[k]?.color || '#6366f1' }}>
          <span className="sc-tile-ic"><TrackIcon track={k} size={22} /></span>
          <b>{tracks[k]?.short || k}</b>
          <span className="sc-prog"><i /></span>
          <em>Day {Math.round((p / 100) * (tracks[k]?.topics?.length || 45))}</em>
        </div>
      ))}
    </div>
  );
}

const CODE = [
  ['k', 'def ', 'f', 'grade', 'p', '(marks):'],
  ['p', '    ', 'k', 'if ', 'p', 'marks >= ', 'n', '75', 'p', ': ', 'k', 'return ', 's', '"Distinction"'],
  ['p', '    ', 'k', 'return ', 's', '"Pass"', 'k', ' if ', 'p', 'marks >= ', 'n', '35', 'k', ' else ', 's', '"Fail"'],
  [],
  ['f', 'print', 'p', '(grade(', 'n', '88', 'p', '))'],
];
function SceneCode() {
  return (
    <div className="sc-window">
      <div className="sc-bar"><i /><i /><i /><span>main.py · NGU Python IDE</span><span className="sc-run"><Play size={11} /> Run</span></div>
      <pre className="sc-code">
        {CODE.map((ln, n) => (
          <div key={n} className="sc-line" style={{ '--d': `${150 + n * 230}ms` }}>
            <span className="sc-ln">{n + 1}</span>
            {ln.reduce((a, x, j) => (j % 2 ? a : [...a, <span key={j} className={`sc-${x}`}>{ln[j + 1]}</span>]), [])}
          </div>
        ))}
      </pre>
      <div className="sc-out">
        <div style={{ '--d': '1400ms' }}><span className="muted">&gt;&gt;&gt;</span> Distinction</div>
        <div style={{ '--d': '1700ms' }} className="ok"><CheckCircle2 size={13} /> 5 / 5 tests passed</div>
      </div>
    </div>
  );
}

const BARS = [42, 58, 51, 70, 64, 82, 95];
function SceneDashboard() {
  return (
    <div className="sc-dash">
      <div className="sc-dash-head"><BarChart3 size={15} /> Sales Dashboard · Power BI</div>
      <div className="sc-kpis">
        <div style={{ '--d': '100ms' }}><IndianRupee size={14} /><b>12.4L</b><span>Revenue</span></div>
        <div style={{ '--d': '220ms' }}><ShoppingCart size={14} /><b>3,240</b><span>Orders</span></div>
        <div style={{ '--d': '340ms' }}><TrendingUp size={14} /><b>+18%</b><span>Growth</span></div>
      </div>
      <div className="sc-charts">
        <div className="sc-barchart">
          {BARS.map((h, n) => <i key={n} style={{ '--h': `${h}%`, '--d': `${300 + n * 90}ms` }} />)}
        </div>
        <svg className="sc-donut" viewBox="0 0 42 42" aria-hidden="true">
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="6" />
          <circle className="sc-donut-a" cx="21" cy="21" r="15.9" fill="none" stroke="#22d3ee" strokeWidth="6" />
          <circle className="sc-donut-b" cx="21" cy="21" r="15.9" fill="none" stroke="#a78bfa" strokeWidth="6" />
          <text x="21" y="23.5" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700">64%</text>
        </svg>
      </div>
      <svg className="sc-line-chart" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 50 L40 42 L80 46 L120 30 L160 34 L200 18 L240 22 L300 6" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function SceneCertificate() {
  return (
    <div className="sc-cert-wrap">
      <div className="sc-cert">
        <div className="sc-cert-top"><Logo size={22} /><b>NGU</b></div>
        <div className="sc-cert-photo"><Users size={26} /></div>
        <span className="sc-cert-small">Certificate of Completion</span>
        <b className="sc-cert-name">Asha Patil</b>
        <span className="sc-cert-small">Student Management System · Python</span>
        <div className="sc-stamp"><Award size={16} /> 92/100</div>
      </div>
      <div className="sc-checks">
        {['Add student', 'Search by roll no', 'Update marks', 'Report card', 'Save to file'].map((t, n) => (
          <div key={t} style={{ '--d': `${250 + n * 220}ms` }}><CheckCircle2 size={14} /> {t}</div>
        ))}
      </div>
    </div>
  );
}

function SceneTest() {
  return (
    <div className="sc-test">
      <div className="sc-test-head"><span><Trophy size={14} /> TCS NQT Mock · Q 7 / 10</span><span className="sc-timer"><Timer size={13} /> 00:42</span></div>
      <p className="sc-q">What is the output of <code>print(len(set([1, 2, 2, 3])))</code>?</p>
      {['4', '3', '2', 'Error'].map((o, n) => <div key={o} className={`sc-opt ${n === 1 ? 'right' : ''}`} style={{ '--d': `${200 + n * 120}ms` }}><span>{String.fromCharCode(65 + n)}</span>{o}{n === 1 && <CheckCircle2 size={15} className="sc-tick" />}</div>)}
      <div className="sc-score"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" /><circle className="sc-score-arc" cx="18" cy="18" r="15.9" /></svg><b>9/10</b></div>
    </div>
  );
}

function SceneSpeak() {
  return (
    <div className="sc-speak">
      <div className="sc-mic"><Mic size={30} /><span /><span /></div>
      <div className="sc-wave">{Array.from({ length: 28 }, (_, n) => <i key={n} style={{ '--d': `${(n * 73) % 900}ms`, '--h': `${30 + ((n * 37) % 60)}%` }} />)}</div>
      <p className="sc-said">"Good morning. I recently completed my B.E. in Computer Engineering from Pune University…"</p>
      <div className="sc-stats">
        <div style={{ '--d': '600ms' }}><b>132</b><span>words / min</span></div>
        <div style={{ '--d': '750ms' }}><b>1</b><span>filler word</span></div>
        <div style={{ '--d': '900ms' }} className="ok"><b><CheckCircle2 size={16} /></b><span>Great pace</span></div>
      </div>
    </div>
  );
}

const SLIDES = [
  { img: 'students-1.jpg', tint: '#4f46e5', icon: BookOpenCheck, tag: `${N_COURSES}+ day-wise courses`, Scene: SceneCourses,
    title: ['Learn any tech,', 'one day at a time'], text: 'Excel, Power BI, Web, MERN, Java, Python, .NET and AI. Every day: theory, solved examples, quiz and a timed Day Task.',
    cta: ['Explore courses', '#courses'], chips: [`${N_LESSONS}+ lessons`, 'Day Tasks', 'Certificates'] },
  { img: 'clip-2.jpg', tint: '#0e7490', icon: Laptop, tag: 'Built-in coding labs', Scene: SceneCode,
    title: ['Write and run code', 'right in your browser'], text: 'Python, Java and C# IDEs, MySQL Workbench, SSMS, MongoDB and API labs. Nothing to install.',
    cta: ['See the labs', '#features'], chips: ['Python IDE', 'SQL Labs', 'Auto-checked'] },
  { img: 'students-3.jpg', tint: '#b45309', icon: BarChart3, tag: 'Excel & Power BI', Scene: SceneDashboard,
    title: ['Turn data into', 'dashboards'], text: 'Formulas, Power Query, DAX and Power BI reports with a real formula lab and DAX lab for practice.',
    cta: ['Start data analytics', '#courses'], chips: ['Excel Lab', 'DAX Lab', 'Power Query'] },
  { img: 'students-4.jpg', tint: '#047857', icon: Rocket, tag: 'Real projects', Scene: SceneCertificate,
    title: ['Build projects,', 'earn certificates'], text: 'Python, MERN and web projects with automated tests and a certificate that shows your photo and score.',
    cta: ['Start building', '#career'], chips: ['Auto-graded', 'Portfolio', 'Certificate'] },
  { img: 'students-5.jpg', tint: '#7c3aed', icon: Trophy, tag: 'Placement preparation', Scene: SceneTest,
    title: ['Crack the interview,', 'not just the exam'], text: `Mock tests, ${N_QA}+ interview Q&A, company-wise HR rounds and situational questions.`,
    cta: ['Prepare now', '#career'], chips: ['TCS / Infosys', 'Mock tests', 'HR rounds'] },
  { img: 'students-2.jpg', tint: '#be185d', icon: MessageCircle, tag: 'Soft skills & English', Scene: SceneSpeak,
    title: ['Speak English', 'with confidence'], text: 'Speaking coach with speed and filler-word analysis, interview phrases from Marathi and Hindi, Versant and GD practice.',
    cta: ['Practise speaking', '#features'], chips: ['Versant', 'GD topics', 'JAM'] },
];

export default function HeroSlider({ user, onJump }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [tick, setTick] = useState(0); // restarts animations of the active slide
  const touch = useRef(null);
  const n = SLIDES.length;
  const goTo = useCallback((k) => { setI(((k % n) + n) % n); setTick((t) => t + 1); }, [n]);
  const next = useCallback(() => goTo(i + 1), [goTo, i]);
  const prev = useCallback(() => goTo(i - 1), [goTo, i]);
  const running = !paused && !hover;

  useEffect(() => {
    if (!running) return undefined;
    const id = setTimeout(next, DURATION);
    return () => clearTimeout(id);
  }, [running, next, tick]);

  useEffect(() => {
    const vis = () => setHover(document.hidden);
    document.addEventListener('visibilitychange', vis);
    return () => document.removeEventListener('visibilitychange', vis);
  }, []);

  useEffect(() => { const im = new Image(); im.src = img(SLIDES[(i + 1) % n].img); }, [i, n]);

  const onKey = (e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); };
  const jump = (href) => (e) => { if (href.startsWith('#') && onJump) onJump(href.slice(1))(e); };

  return (
    <section
      className={`hs ${running ? '' : 'hs-paused'}`}
      style={{ '--tint': SLIDES[i].tint }}
      aria-roledescription="carousel"
      aria-label="NGU highlights"
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - (touch.current ?? 0); if (Math.abs(d) > 45) (d < 0 ? next : prev)(); touch.current = null; }}
    >
      {SLIDES.map((s, k) => {
        const I = s.icon; const on = k === i; const Scene = s.Scene;
        return (
          <div key={s.img} className={`hs-slide ${on ? 'on' : ''}`} style={{ '--tint': s.tint }} aria-hidden={!on} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}: ${s.tag}`}>
            <div className="hs-img" style={{ backgroundImage: `url(${img(s.img)})` }} />
            <div className="hs-shade" />
            {on && (
              <div className="hs-inner" key={`c-${tick}-${k}`}>
                <div className="hs-content">
                  <span className="hs-tag"><I size={15} /> {s.tag}</span>
                  <h2 className="hs-title"><span>{s.title[0]}</span><span className="hs-grad">{s.title[1]}</span></h2>
                  <p className="hs-text">{s.text}</p>
                  <div className="hs-chips">{s.chips.map((c) => <span key={c}>{c}</span>)}</div>
                  <div className="hs-cta">
                    <a href={s.cta[1]} className="btn primary ld-big" onClick={jump(s.cta[1])}>{s.cta[0]} <ArrowRight size={17} /></a>
                    {!user && <Link to="/register" className="btn ld-big hs-ghost">Register free</Link>}
                  </div>
                </div>
                <div className="hs-scene" aria-hidden="true"><Scene /></div>
              </div>
            )}
          </div>
        );
      })}

      <div className="hs-glyphs" aria-hidden="true">{GLYPHS.map((g, k) => <span key={g} style={{ '--x': `${(k * 83) % 100}%`, '--d': `${(k * 1.7) % 9}s`, '--s': `${0.8 + ((k * 7) % 5) / 10}` }}>{g}</span>)}</div>

      <button className="hs-arrow hs-prev" onClick={prev} aria-label="Previous slide"><ChevronLeft size={24} /></button>
      <button className="hs-arrow hs-next" onClick={next} aria-label="Next slide"><ChevronRight size={24} /></button>

      <div className="hs-bar">
        <div className="hs-dots">
          {SLIDES.map((s, k) => (
            <button key={s.img} className={`hs-dot ${k === i ? 'on' : ''} ${k < i ? 'done' : ''}`} onClick={() => goTo(k)} aria-label={`Go to slide ${k + 1}: ${s.tag}`}>
              <span className="hs-dot-fill" key={k === i ? `f-${tick}` : 'x'} style={{ animationDuration: `${DURATION}ms` }} />
              <em>{s.tag}</em>
            </button>
          ))}
        </div>
        <button className="hs-pause" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>
      </div>
      <div className="hs-count" aria-hidden="true"><b>{String(i + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}</div>
    </section>
  );
}
