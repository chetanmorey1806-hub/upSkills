// Landing hero: photos of students with laptops (public/banner/students-N.jpg, free Unsplash photos),
// cross-fading with a slow zoom. To use your own photos, replace those files and keep the same names.
import { useEffect, useState } from 'react';
import '../styles/hero-photos.css';

const base = import.meta.env.BASE_URL || '/';
const PHOTOS = [
  { n: 1, focus: '30% 40%', cap: 'Learn step by step, one topic a day' },
  { n: 2, focus: '45% 30%', cap: 'Practise in built-in IDEs' },
  { n: 3, focus: '70% 45%', cap: 'Learn together with your batch' },
  { n: 4, focus: '50% 35%', cap: 'Get ready for interviews' },
  { n: 5, focus: '60% 40%', cap: 'Build real projects' },
];
const DELAY = 5000;

export default function HeroPhotos() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setI((k) => (k + 1) % PHOTOS.length), DELAY);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="hp">
      {PHOTOS.map((p, k) => (
        <img
          key={p.n}
          src={`${base}banner/students-${p.n}.jpg`}
          alt=""
          className={`hp-img ${k === i ? 'on' : ''} ${k % 2 ? 'zo' : 'zi'}`}
          style={{ objectPosition: p.focus }}
          loading={k ? 'lazy' : 'eager'}
          draggable="false"
        />
      ))}
      <div className="hp-shade" />
      <div className="hp-cap" key={i}>{PHOTOS[i].cap}</div>
      <div className="hp-dots">{PHOTOS.map((p, k) => <span key={p.n} className={k === i ? 'on' : ''} />)}</div>
    </div>
  );
}
