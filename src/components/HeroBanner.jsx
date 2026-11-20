import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, UserPlus, Code2, Layers, ClipboardCheck, Rocket, GraduationCap } from 'lucide-react';

// Banner photos: free Unsplash photos stored in /public/banner (Unsplash License).
// To use your own photos, replace the files in public/banner/ keeping the same names.
const img = (n) => `${import.meta.env.BASE_URL || '/'}banner/students-${n}.jpg`;

const SLIDES = [
  {
    photo: img(1), icon: GraduationCap, eyebrow: 'Day-wise learning',
    title: 'Learn coding the practical way',
    text: 'Every day: clear theory, step-by-step solved examples, interview questions, practice tasks and a quiz.',
    jump: ['courses', 'Explore courses'],
  },
  {
    photo: img(2), icon: Code2, eyebrow: 'Practise in the browser',
    title: 'No setup. Just open and code.',
    text: 'Write and run Java, Python, C#, SQL, React and React Native right inside UpSkillr with VS Code style editors.',
    jump: ['features', 'See the tools'],
  },
  {
    photo: img(3), icon: Layers, eyebrow: 'Full stack courses',
    title: 'Java, Python, .NET and MERN Full Stack',
    text: 'From the first line of code to frameworks, databases and deployment: one lesson a day.',
    jump: ['courses', 'View all courses'],
  },
  {
    photo: img(4), icon: ClipboardCheck, eyebrow: 'Interview preparation',
    title: 'Get ready for your first job',
    text: 'Interview Q&A for every topic, timed test series, mock interviews and soft skills practice.',
    jump: ['career', 'Career prep'],
  },
  {
    photo: img(5), icon: Rocket, eyebrow: 'Final projects',
    title: 'Build real projects for your portfolio',
    text: 'Weather app, e-commerce website, e-commerce mobile app and more guided final projects.',
    jump: ['journey', 'How it works'],
  },
];

const DELAY = 5500;

export default function HeroBanner({ user, onJump }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef(null);
  const n = SLIDES.length;
  const go = useCallback((k) => setI(((k % n) + n) % n), [n]);

  useEffect(() => {
    if (paused) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setTimeout(() => go(i + 1), DELAY);
    return () => clearTimeout(t);
  }, [i, paused, go]);

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') go(i - 1);
    if (e.key === 'ArrowRight') go(i + 1);
  };
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
    touch.current = null;
  };

  return (
    <section className="hb" aria-roledescription="carousel" aria-label="UpSkillr highlights">
      <div
        className="ld-wrap"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="hb-frame" tabIndex={0} onKeyDown={onKey} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {SLIDES.map((s, k) => {
            const I = s.icon;
            const on = k === i;
            return (
              <div key={s.photo} className={`hb-slide ${on ? 'on' : ''}`} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`} aria-hidden={!on}>
                <img src={s.photo} alt="" className="hb-img" loading={k === 0 ? 'eager' : 'lazy'} />
                <div className="hb-shade" />
                <div className="hb-text">
                  <span className="hb-eyebrow"><I size={15} /> {s.eyebrow}</span>
                  <h2>{s.title}</h2>
                  <p>{s.text}</p>
                  <div className="hb-cta">
                    {user
                      ? <Link to="/home" className="btn primary ld-big" tabIndex={on ? 0 : -1}>Continue learning <ArrowRight size={18} /></Link>
                      : <Link to="/register" className="btn primary ld-big" tabIndex={on ? 0 : -1}><UserPlus size={18} /> Register free</Link>}
                    <a href={`#${s.jump[0]}`} className="btn ld-big hb-ghost" tabIndex={on ? 0 : -1} onClick={onJump(s.jump[0])}>{s.jump[1]}</a>
                  </div>
                </div>
              </div>
            );
          })}

          <button className="hb-arrow prev" onClick={() => go(i - 1)} aria-label="Previous slide"><ChevronLeft size={22} /></button>
          <button className="hb-arrow next" onClick={() => go(i + 1)} aria-label="Next slide"><ChevronRight size={22} /></button>
          <div className="hb-dots">
            {SLIDES.map((s, k) => (
              <button key={s.photo} className={k === i ? 'on' : ''} onClick={() => go(k)} aria-label={`Go to slide ${k + 1}`} aria-current={k === i}>
                {k === i && !paused && <span style={{ animationDuration: `${DELAY}ms` }} />}
              </button>
            ))}
          </div>
          <span className="hb-credit">Photos: Unsplash</span>
        </div>
      </div>
    </section>
  );
}
