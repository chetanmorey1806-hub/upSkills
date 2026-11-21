import { useMemo, useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, RotateCcw } from 'lucide-react';
import siteInfo, { waLink, telLink, socialLinks } from '../data/siteInfo.js';
import { trackGroups, tracks } from '../data/index.js';
import { addEnquiry, isValidIndianMobile } from '../landingStore.js';
import SocialIcon, { SOCIAL_LABELS } from './SocialIcon.jsx';
import '../styles/landing-extra.css';

const EMPTY = { name: '', phone: '', email: '', course: '', message: '' };

function enquiryText(f) {
  const lines = ['Hello NGU, I have an enquiry.'];
  if (f.name.trim()) lines.push(`Name: ${f.name.trim()}`);
  if (f.course) lines.push(`Course: ${f.course}`);
  if (f.phone.trim()) lines.push(`Phone: ${f.phone.trim()}`);
  if (f.message.trim()) lines.push(`Message: ${f.message.trim()}`);
  return lines.join('\n');
}

export default function ContactSection() {
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState({});
  const [state, setState] = useState('idle'); // idle | saving | done
  const [serverErr, setServerErr] = useState('');
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); if (err[k]) setErr({ ...err, [k]: '' }); };

  const groups = useMemo(() => trackGroups
    .map((g) => ({ ...g, ts: g.tracks.map((k) => tracks[k]).filter((t) => t?.topics?.length) }))
    .filter((g) => g.ts.length), []);

  const wa = waLink(enquiryText(f));
  const tel = telLink();
  const socials = socialLinks();
  const hasInfo = !!(siteInfo.phone || wa || siteInfo.email || siteInfo.address || socials.length);
  const mapSrc = siteInfo.mapQuery ? `https://www.google.com/maps?q=${encodeURIComponent(siteInfo.mapQuery)}&output=embed` : '';

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = 'Please enter your name.';
    if (!isValidIndianMobile(f.phone)) er.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8 or 9).';
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) er.email = 'Enter a valid email address or leave it empty.';
    if (!f.course) er.course = 'Choose the course you are interested in.';
    setErr(er);
    if (Object.keys(er).length) {
      document.getElementById(`lx-enq-${Object.keys(er)[0]}`)?.focus();
      return;
    }
    setState('saving'); setServerErr('');
    try { await addEnquiry(f); setState('done'); } catch (x) { setServerErr(x.message); setState('idle'); }
  };

  return (
    <section id="contact" className="ld-section lx-contact">
      <div className="ld-wrap">
        <div className="ld-head ld-rv">
          <span className="ld-eyebrow">Contact us</span>
          <h2>Have a question? Send an enquiry</h2>
          <p>Tell us which course you are interested in and we will get back to you.</p>
        </div>
        <div className={`lx-contact-grid ld-rv ${hasInfo || mapSrc ? '' : 'solo'}`}>
          {state === 'done' ? (
            <div className="lx-card lx-success lx-enq-done" role="status">
              <CheckCircle2 size={36} />
              <div>
                <b>Thank you, {f.name.trim().split(/\s+/)[0]}. Your enquiry has been sent.</b>
                <p>We will contact you on {f.phone.replace(/\D/g, '').slice(-10)}{f.email.trim() ? ` or ${f.email.trim()}` : ''}.</p>
                <div className="lx-btns">
                  {wa && <a className="btn lx-wa" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Chat on WhatsApp</a>}
                  <button className="btn" onClick={() => { setF(EMPTY); setState('idle'); }}><RotateCcw size={16} /> Send another</button>
                </div>
              </div>
            </div>
          ) : (
            <form className="lx-card lx-form" onSubmit={submit} noValidate>
              <div className="lx-row2">
                <label className="lx-field">
                  <span>Name *</span>
                  <input id="lx-enq-name" className="input" autoComplete="name" value={f.name} onChange={set('name')} maxLength={80} aria-invalid={!!err.name} />
                  {err.name && <em className="lx-err">{err.name}</em>}
                </label>
                <label className="lx-field">
                  <span>Mobile number *</span>
                  <div className="lx-phone">
                    <span aria-hidden="true">+91</span>
                    <input id="lx-enq-phone" className="input" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile" value={f.phone} onChange={set('phone')} maxLength={16} aria-invalid={!!err.phone} />
                  </div>
                  {err.phone && <em className="lx-err">{err.phone}</em>}
                </label>
              </div>
              <div className="lx-row2">
                <label className="lx-field">
                  <span>Email (optional)</span>
                  <input id="lx-enq-email" className="input" type="email" autoComplete="email" value={f.email} onChange={set('email')} maxLength={120} aria-invalid={!!err.email} />
                  {err.email && <em className="lx-err">{err.email}</em>}
                </label>
                <label className="lx-field">
                  <span>Course *</span>
                  <select id="lx-enq-course" className="input" value={f.course} onChange={set('course')} aria-invalid={!!err.course}>
                    <option value="">Select a course</option>
                    {groups.map((g) => (
                      <optgroup key={g.key} label={g.name}>
                        <option value={g.name}>{g.name} (full track)</option>
                        {g.ts.map((t) => <option key={t.key || t.name} value={t.name}>{t.name}</option>)}
                      </optgroup>
                    ))}
                    <option value="Not sure yet">Not sure yet, please guide me</option>
                  </select>
                  {err.course && <em className="lx-err">{err.course}</em>}
                </label>
              </div>
              <label className="lx-field">
                <span>Message</span>
                <textarea className="input" rows={4} value={f.message} onChange={set('message')} maxLength={1000} placeholder="Your question, preferred batch time, current education..." />
              </label>
              {serverErr && <p className="lx-err" role="alert">{serverErr}</p>}
              <div className="lx-btns">
                <button className="btn primary" disabled={state === 'saving'}><Send size={16} /> {state === 'saving' ? 'Sending...' : 'Send enquiry'}</button>
                {wa && <a className="btn lx-wa" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Chat on WhatsApp</a>}
              </div>
            </form>
          )}

          {(hasInfo || mapSrc) && (
            <aside className="lx-contact-side">
              {hasInfo && (
                <div className="lx-card lx-info">
                  {siteInfo.phone && <a href={tel}><Phone size={18} /><span><small>Call us</small>{siteInfo.phone}</span></a>}
                  {wa && <a href={waLink('Hello NGU, I have an enquiry.')} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /><span><small>WhatsApp</small>Chat with us</span></a>}
                  {siteInfo.email && <a href={`mailto:${siteInfo.email}`}><Mail size={18} /><span><small>Email</small>{siteInfo.email}</span></a>}
                  {siteInfo.address && <div><MapPin size={18} /><span><small>Address</small>{siteInfo.address}</span></div>}
                  {socials.length > 0 && (
                    <div className="lx-socials">
                      {socials.map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[k] || k} title={SOCIAL_LABELS[k] || k}><SocialIcon name={k} /></a>)}
                    </div>
                  )}
                </div>
              )}
              {mapSrc && (
                <div className="lx-card lx-map">
                  <iframe title="Our location on Google Maps" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
