import { useState } from 'react';
import { Users } from 'lucide-react';
import { STUDENTS } from '../data/students.js';

// Initials avatar shown if a photo cannot load (offline, blocked, wrong path)
function Photo({ s }) {
  const [broken, setBroken] = useState(false);
  if (broken || !s.photo) {
    return <span className="st-photo st-initials" aria-hidden="true">{s.name.slice(0, 1)}</span>;
  }
  return <img className="st-photo" src={s.photo} alt={`${s.name}, ${s.course} student`} loading="lazy" onError={() => setBroken(true)} />;
}

function Row({ list, reverse }) {
  // duplicated once so the marquee loops seamlessly
  return (
    <div className={`st-row ${reverse ? 'rev' : ''}`}>
      <div className="st-track">
        {[...list, ...list].map((s, i) => (
          <figure key={`${s.name}-${i}`} className="st-card" aria-hidden={i >= list.length}>
            <Photo s={s} />
            <figcaption>
              <b>{s.name}</b>
              <span>{s.course}</span>
              {s.city && <small>{s.city}</small>}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export default function StudentsSection() {
  const half = Math.ceil(STUDENTS.length / 2);
  return (
    <section id="students" className="ld-section ld-alt">
      <div className="ld-wrap">
        <div className="ld-head ld-rv">
          <span className="ld-eyebrow"><Users size={14} /> Our learners</span>
          <h2>Students learning with UpSkillr</h2>
          <p>One lesson a day, practice in the browser, and steady progress towards their first job.</p>
        </div>
        <div className="st-stack" aria-hidden="true">
          {STUDENTS.slice(0, 6).map((s) => <Photo key={s.name} s={s} />)}
          <span className="st-more">+ more</span>
        </div>
      </div>
      <Row list={STUDENTS.slice(0, half)} />
      <Row list={STUDENTS.slice(half)} reverse />
    </section>
  );
}
