// Landing page banner: full-width animated image slider.
// Ken Burns zoom on every photo, cross-fade between slides, staggered text, progress bars,
// autoplay (pauses on hover / when the tab is hidden), arrows, dots, keyboard and swipe.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play, BookOpenCheck, Laptop, Rocket, Trophy, MessageCircle, BadgeIndianRupee, ArrowRight } from 'lucide-react';

import { allTopics, trackOrder } from '../data/index.js';

const BASE = import.meta.env.BASE_URL || '/';
const N_COURSES = trackOrder.length;
const N_LESSONS = allTopics.length.toLocaleString('en-IN');
const N_QA = (Math.floor(allTopics.reduce((t, x) => t + (x.interview?.length || 0), 0) / 1000) * 1000).toLocaleString('en-IN');
const img = (f) => `${BASE}banner/${f}`;

const SLIDES = [
  { img: 'students-1.jpg', pos: '50% 40%', icon: BookOpenCheck, tag: `${N_COURSES}+ day-wise courses`,
    title: ['Learn any tech,', 'one day at a time'], text: 'Excel, Power BI, Web, MERN, Java, Python, .NET and AI. Every day has theory, solved examples, a quiz and a timed Day Task.',
    cta: ['Explore courses', '#courses'], chips: [`${N_LESSONS}+ lessons`, 'Day Tasks', 'Certificates'] },
  { img: 'students-3.jpg', pos: '45% 35%', icon: Laptop, tag: 'Built-in practice labs',
    title: ['Write real code', 'right in your browser'], text: 'Python, Java and C# IDEs, MySQL Workbench, SSMS, MongoDB, API Lab, Excel and DAX labs. Nothing to install.',
    cta: ['See the labs', '#features'], chips: ['Python IDE', 'SQL Labs', 'Web Playground'] },
  { img: 'clip-2.jpg', pos: '50% 50%', icon: Rocket, tag: 'Project-based learning',
    title: ['Build projects', 'recruiters ask about'], text: 'Python, MERN and web projects with automated tests, milestones and a certificate that shows your photo and score.',
    cta: ['Start building', '#career'], chips: ['Auto-graded', 'Portfolio ready', 'Certificate'] },
  { img: 'students-5.jpg', pos: '55% 30%', icon: Trophy, tag: 'Interview preparation',
    title: ['Crack the interview,', 'not just the exam'], text: `Test series, ${N_QA}+ interview Q&A, company-wise HR rounds, situational questions and mock interviews.`,
    cta: ['Prepare now', '#career'], chips: ['TCS / Infosys / Accenture', 'Mock tests', 'HR rounds'] },
  { img: 'students-4.jpg', pos: '50% 45%', icon: MessageCircle, tag: 'Soft skills & English',
    title: ['Speak with', 'confidence'], text: 'Interview phrases from Marathi and Hindi, JAM practice, Versant tests, GD topics and first-job skills.',
    cta: ['Practise speaking', '#features'], chips: ['Versant', 'GD topics', 'JAM'] },
  { img: 'students-2.jpg', pos: '50% 35%', icon: BadgeIndianRupee, tag: 'Career packages',
    title: ['Pick a path.', 'Get job-ready.'], text: 'Data Analytics, Web Development, MERN, Java, Python and .NET full stack packages with everything included.',
    cta: ['View packages', '#packages'], chips: ['Self-paced', 'Labs included', 'Placement prep'] },
];
const DURATION = 6500;
// Ken Burns end positions (each slide zooms towards a different corner)
const KB = ['scale(1.14) translate(-2%, -1.5%)', 'scale(1.14) translate(2%, -1%)', 'scale(1.12) translate(0, 2%)', 'scale(1.14) translate(-1.5%, 1.5%)', 'scale(1.13) translate(1.5%, 1%)', 'scale(1.14) translate(0, -2%)'];

export default function HeroSlider({ user, onJump }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [tick, setTick] = useState(0); // restarts the progress animation
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

  // preload the next photo so the cross-fade never shows a blank frame
  useEffect(() => { const im = new Image(); im.src = img(SLIDES[(i + 1) % n].img); }, [i, n]);

  const onKey = (e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); };
  const jump = (href) => (e) => { if (href.startsWith('#') && onJump) onJump(href.slice(1))(e); };

  return (
    <section
      className={`hs ${running ? '' : 'hs-paused'}`}
      aria-roledescription="carousel"
      aria-label="UpSkillr highlights"
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - (touch.current ?? 0); if (Math.abs(d) > 45) (d < 0 ? next : prev)(); touch.current = null; }}
    >
      {SLIDES.map((s, k) => {
        const I = s.icon;
        const on = k === i;
        return (
          <div key={s.img} className={`hs-slide ${on ? 'on' : ''}`} aria-hidden={!on} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`}>
            <div className="hs-img" style={{ backgroundImage: `url(${img(s.img)})`, backgroundPosition: s.pos, '--kb': KB[k % KB.length] }} />
            <div className="hs-shade" />
            {on && (
              <div className="hs-content" key={`c-${tick}-${k}`}>
                <span className="hs-tag"><I size={15} /> {s.tag}</span>
                <h2 className="hs-title"><span>{s.title[0]}</span><span className="hs-grad">{s.title[1]}</span></h2>
                <p className="hs-text">{s.text}</p>
                <div className="hs-chips">{s.chips.map((c) => <span key={c}>{c}</span>)}</div>
                <div className="hs-cta">
                  <a href={s.cta[1]} className="btn primary ld-big" onClick={jump(s.cta[1])}>{s.cta[0]} <ArrowRight size={17} /></a>
                  {!user && <Link to="/register" className="btn ld-big hs-ghost">Register free</Link>}
                </div>
              </div>
            )}
          </div>
        );
      })}

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
