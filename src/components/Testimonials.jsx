import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth.js';
import { trackGroups } from '../data/index.js';
import { listReviews, addReview, useLandingData } from '../landingStore.js';
import '../styles/landing-extra.css';

const initials = (name) => String(name || '?').trim().split(/\s+/).filter((w) => !/^(er|dr|mr|mrs|ms|miss|prof)\.?$/i.test(w)).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || '?';
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }); } catch { return ''; } };

function Stars({ value, size = 16 }) {
  return (
    <span className="lx-stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={size} className={n <= value ? 'on' : ''} aria-hidden="true" />)}
    </span>
  );
}

function ReviewForm({ user }) {
  const [f, setF] = useState({ name: user?.name || user?.username || '', course: '', rating: 0, text: '' });
  const [err, setErr] = useState({});
  const [state, setState] = useState('idle'); // idle | saving | done
  const [serverErr, setServerErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = 'Please enter your name.';
    if (!f.course) er.course = 'Choose the course you studied.';
    if (!f.rating) er.rating = 'Choose a rating.';
    if (f.text.trim().length < 20) er.text = 'Please write at least 20 characters.';
    setErr(er);
    if (Object.keys(er).length) return;
    setState('saving'); setServerErr('');
    try { await addReview(f); setState('done'); } catch (x) { setServerErr(x.message); setState('idle'); }
  };

  if (state === 'done') {
    return (
      <div className="lx-card lx-success" role="status">
        <CheckCircle2 size={28} />
        <div><b>Thank you for your review.</b><p>It will appear here after the admin approves it.</p></div>
      </div>
    );
  }
  return (
    <form className="lx-card lx-form lx-review-form" onSubmit={submit} noValidate>
      <h3>Share your experience</h3>
      <p className="lx-note">Your review is shown on this page after the admin approves it.</p>
      <div className="lx-row2">
        <label className="lx-field">
          <span>Your name</span>
          <input className="input" value={f.name} onChange={set('name')} maxLength={80} aria-invalid={!!err.name} />
          {err.name && <em className="lx-err">{err.name}</em>}
        </label>
        <label className="lx-field">
          <span>Course</span>
          <select className="input" value={f.course} onChange={set('course')} aria-invalid={!!err.course}>
            <option value="">Select a course</option>
            {trackGroups.map((g) => <option key={g.key} value={g.name}>{g.name}</option>)}
          </select>
          {err.course && <em className="lx-err">{err.course}</em>}
        </label>
      </div>
      <fieldset className="lx-field lx-rate">
        <legend>Rating</legend>
        <div className="lx-rate-in">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className={n <= f.rating ? 'on' : ''}>
              <input type="radio" name="lx-rating" value={n} checked={f.rating === n} onChange={() => setF({ ...f, rating: n })} />
              <Star size={24} aria-hidden="true" /><span className="lx-sr">{n} star{n > 1 ? 's' : ''}</span>
            </label>
          ))}
        </div>
        {err.rating && <em className="lx-err">{err.rating}</em>}
      </fieldset>
      <label className="lx-field">
        <span>Your review</span>
        <textarea className="input" rows={4} value={f.text} onChange={set('text')} maxLength={1000} aria-invalid={!!err.text} placeholder="What did you learn? What helped you most?" />
        {err.text && <em className="lx-err">{err.text}</em>}
      </label>
      {serverErr && <p className="lx-err" role="alert">{serverErr}</p>}
      <button className="btn primary" disabled={state === 'saving'}><Send size={16} /> {state === 'saving' ? 'Sending...' : 'Submit review'}</button>
    </form>
  );
}

export default function Testimonials() {
  const user = useAuth();
  const { items } = useLandingData(() => listReviews(), []);
  const [writing, setWriting] = useState(false);
  if (!items.length && !user) return null; // no fake reviews: nothing to show yet

  return (
    <section id="reviews" className="ld-section lx-reviews">
      <div className="ld-wrap">
        <div className="ld-head">
          <span className="ld-eyebrow">Student reviews</span>
          <h2>{items.length ? 'What our students say' : 'Be the first to review'}</h2>
          <p>{items.length ? 'Real reviews from students who learned on UpSkillr.' : 'Studied with UpSkillr? Tell other students how it went.'}</p>
        </div>
        {items.length > 0 && (
          <div className="lx-rev-track" tabIndex={0} aria-label="Student reviews">
            {items.map((r, i) => (
              <article key={r.id} className="lx-card lx-review" style={{ '--d': `${Math.min(i, 6) * 70}ms` }}>
                <Quote size={26} className="lx-quote" aria-hidden="true" />
                <Stars value={r.rating} />
                <p className="lx-rev-text">{r.text}</p>
                <div className="lx-rev-who">
                  <span className="lx-ava" aria-hidden="true">{initials(r.name)}</span>
                  <div><b>{r.name}</b><span>{r.course}{r.created_at ? ` · ${fmtDate(r.created_at)}` : ''}</span></div>
                </div>
              </article>
            ))}
          </div>
        )}
        {user && (
          <div className="lx-rev-actions">
            {writing || !items.length ? <ReviewForm user={user} /> : <button className="btn" onClick={() => setWriting(true)}><Star size={16} /> Write a review</button>}
            {user.role === 'admin' && <Link className="btn small" to="/admin/inbox"><ShieldCheck size={15} /> Approve reviews</Link>}
          </div>
        )}
      </div>
    </section>
  );
}
