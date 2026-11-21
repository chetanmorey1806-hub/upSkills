import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { tracks } from '../data/index.js';
import { usePerms, getPackages, packageTracks } from '../permissions.js';

import Ico from './Ico.jsx';
// All packages are shown as FREE to students (owner's decision), even if a price was saved in Admin → Packages.
const isFree = () => true;
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const INCLUDED = [
  'Day-wise lessons: theory in simple English + solved examples',
  'Auto-checked Day Tasks with timer and explained mistakes',
  'Quizzes, interview Q&A and flashcards for every topic',
  'Test series: MCQ papers + spoken/typed mock interviews',
  'Built-in IDEs and labs: practise without installing anything',
  'Final projects with automated tests + certificate',
  'Soft skills, resume and HR interview practice',
  'Progress dashboard and roadmap',
];

function stats(p) {
  const ks = packageTracks(p);
  const lessons = ks.reduce((s, k) => s + (tracks[k]?.topics?.length || 0), 0);
  const qa = ks.reduce((s, k) => s + (tracks[k]?.topics || []).reduce((a, t) => a + (t.interview?.length || 0), 0), 0);
  return { ks, lessons, qa };
}

function Details({ p, onClose }) {
  const { ks, lessons, qa } = stats(p);
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k); document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="pkg-modal" onClick={onClose}>
      <div className="pkg-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={p.name}>
        <button className="pkg-x" onClick={onClose} aria-label="Close">✕</button>
        <div className="pkg-dhead" style={{ '--pc': p.color || '#4f46e5' }}>
          <span className="pkg-ic"><Ico e={p.icon} /></span>
          <div><h2>{p.name}</h2><p>{p.tagline}</p></div>
        </div>
        <div className="pkg-dstats">
          <div><b>{ks.length}</b><span>courses</span></div>
          <div><b>{lessons}</b><span>day-wise lessons</span></div>
          <div><b>{qa.toLocaleString('en-IN')}</b><span>interview Q&amp;A</span></div>
          <div><b>{p.months}</b><span>months (suggested)</span></div>
        </div>
        <div className="pkg-price big">{isFree(p) ? <><b>Free</b> <span className="pkg-save">for every student</span></> : p.offerPrice ? <><s>{inr(p.price)}</s> <b>{inr(p.offerPrice)}</b> <span className="pkg-save">Save {Math.round((1 - p.offerPrice / p.price) * 100)}%</span></> : <b>{inr(p.price)}</b>}<span className="muted small"> · {p.mode}</span></div>

        <h3><Ico e="📚" /> Courses included</h3>
        <div className="table-wrap">
          <table className="data-table pkg-table">
            <thead><tr><th>Course</th><th>Lessons</th><th>Modules / what you learn</th></tr></thead>
            <tbody>{ks.map((k) => {
              const t = tracks[k];
              const mods = [...new Set(t.topics.map((x) => x.module).filter(Boolean))].map((m) => m.replace(/^Module \d+:\s*/, ''));
              return (
                <tr key={k}>
                  <td><b><Ico e={t.icon} /> {t.name}</b></td>
                  <td>{t.topics.length}</td>
                  <td className="pkg-mods">{mods.length ? mods.join(' · ') : t.tagline}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
        <div className="pkg-cols">
          <div><h3><Ico e="🛠" /> Practice tools</h3><ul>{(p.tools || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3><Ico e="🏗" /> Projects</h3><ul>{(p.projects || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3><Ico e="💼" /> Job roles</h3><ul>{(p.roles || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
        <h3><Ico e="✅" /> Everything included</h3>
        <ul className="pkg-inc">{INCLUDED.map((x) => <li key={x}>{x}</li>)}</ul>
        <div className="pkg-cta">
          <Link className="btn primary" to="/register">Enroll: create your account</Link>
          <Link className="btn" to={`/track/${ks[0] || ''}`}>Start Day 1 free</Link>
        </div>
        <p className="muted small">After registering, your institute/admin activates the package on your account.</p>
      </div>
    </div>
  );
}

export default function PackagesSection() {
  const { m } = usePerms();
  const { search } = useLocation();
  const list = useMemo(() => getPackages(m).filter((p) => p.visible !== false), [m]);
  const [open, setOpen] = useState(null);
  useEffect(() => {
    if (new URLSearchParams(search).get('section') === 'packages') setTimeout(() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' }), 400);
  }, [search]);
  if (!list.length) return null;
  return (
    <section id="packages" className="ld-section pkg-section">
      <div className="ld-wrap">
        <div className="pkg-intro">
          <span className="ld-eyebrow">Packages &amp; pricing</span>
          <h2>Choose your career path</h2>
          <p>Every package includes day-wise lessons, auto-checked Day Tasks, test series, mock interviews, built-in labs and final projects.</p>
        </div>
        <div className="pkg-grid">
          {list.map((p) => {
            const { ks, lessons, qa } = stats(p);
            return (
              <article key={p.id} className="pkg-card" style={{ '--pc': p.color || '#4f46e5' }}>
                {p.badge && <span className="pkg-badge">{p.badge}</span>}
                <div className="pkg-top"><span className="pkg-ic"><Ico e={p.icon} /></span><h3>{p.name}</h3></div>
                <p className="pkg-tag">{p.tagline}</p>
                <div className="pkg-price">{isFree(p) ? <b>Free</b> : p.offerPrice ? <><s>{inr(p.price)}</s> <b>{inr(p.offerPrice)}</b></> : <b>{inr(p.price)}</b>}</div>
                <ul className="pkg-facts">
                  <li><Ico e="📚" /> {ks.length} courses · {lessons} lessons</li>
                  <li><Ico e="💬" /> {qa.toLocaleString('en-IN')} interview Q&amp;A</li>
                  <li><Ico e="⏱" /> {p.months} month{p.months > 1 ? 's' : ''} · {p.mode}</li>
                  <li><Ico e="💼" /> {(p.roles || []).slice(0, 2).join(', ')}</li>
                </ul>
                <div className="pkg-chips">{ks.slice(0, 6).map((k) => <span key={k}>{tracks[k].short || tracks[k].name}</span>)}{ks.length > 6 && <span>+{ks.length - 6} more</span>}</div>
                <button className="btn primary pkg-btn" onClick={() => setOpen(p)}>View full details</button>
              </article>
            );
          })}
        </div>
      </div>
      {open && <Details p={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
