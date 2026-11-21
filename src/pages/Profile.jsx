import { useRef, useState } from 'react';
import { useAuth } from '../auth.js';
import { useProfile, imageToDataUrl, profileCompleteness } from '../profile.js';
import ProgressBar from '../components/ProgressBar.jsx';
import { Avatar } from '../components/MediaBits.jsx';

import Ico from '../components/Ico.jsx';
const FIELDS = [
  ['fullName', 'Full name (as on certificates)', 'Asha Ramesh Patil'],
  ['phone', 'Mobile number', '+91 98765 43210'],
  ['college', 'College / University', 'XYZ College of Engineering, Pune'],
  ['degree', 'Degree & branch', 'B.E. Computer Engineering'],
  ['year', 'Passing year', '2026'],
  ['city', 'City', 'Pune'],
  ['linkedin', 'LinkedIn profile URL', 'https://linkedin.com/in/your-name'],
  ['github', 'GitHub profile URL', 'https://github.com/your-name'],
  ['portfolio', 'Portfolio / website', 'https://your-site.dev'],
];

export default function Profile() {
  const user = useAuth();
  const [p, update] = useProfile();
  const [err, setErr] = useState('');
  const [skill, setSkill] = useState('');
  const fileRef = useRef(null);
  const pct = profileCompleteness(p);
  const skills = p.skills || [];

  const onPhoto = async (f) => {
    setErr('');
    try { update({ photo: await imageToDataUrl(f, { size: 320, square: true }) }); } catch (e) { setErr(e.message); }
  };
  const addSkill = () => { const s = skill.trim(); if (s && !skills.includes(s)) update({ skills: [...skills, s] }); setSkill(''); };

  return (
    <div className="profile-page">
      <div className="page-head">
        <h1><Ico e="👤" /> My profile</h1>
        <p className="muted">Your photo and full name appear on your certificates. A complete profile also makes your project certificates look professional for recruiters.</p>
      </div>

      <div className="grid2 prof-grid">
        <div className="card prof-photo-card">
          <div className="prof-photo">
            <Avatar size={140} />
            <button className="prof-cam" onClick={() => fileRef.current?.click()} title="Change photo"><Ico e="📷" /></button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files[0]) onPhoto(e.target.files[0]); e.target.value = ''; }} />
          <h2>{p.fullName || user?.name}</h2>
          <p className="muted small">@{user?.username} · {user?.role === 'admin' ? 'Admin' : 'Student'}{user?.email ? ` · ${user.email}` : ''}</p>
          <div className="row-btns center">
            <button className="btn primary" onClick={() => fileRef.current?.click()}>{p.photo ? 'Change photo' : 'Upload photo'}</button>
            {p.photo && <button className="btn" onClick={() => update({ photo: '' })}>Remove</button>}
          </div>
          {err && <p className="bad-t small">{err}</p>}
          <p className="muted small">Use a clear, front-facing photo (passport style). It is cropped to a square automatically.</p>
          <div className="prof-complete">
            <span className="small">Profile {pct}% complete</span>
            <ProgressBar value={pct / 100} color={pct === 100 ? 'var(--ok)' : undefined} />
          </div>
        </div>

        <div className="card">
          <h3>Personal & education details</h3>
          <div className="prof-fields">
            {FIELDS.map(([k, l, ph]) => (
              <label key={k} className="field">{l}<input className="input" value={p[k] || ''} placeholder={ph} onChange={(e) => update({ [k]: e.target.value })} /></label>
            ))}
          </div>
          <label className="field">About me<textarea className="input" rows={3} value={p.bio || ''} placeholder="Final-year engineering student learning Python full stack. I enjoy building web apps…" onChange={(e) => update({ bio: e.target.value })} /></label>
          <label className="field">Skills
            <span className="prof-skill-add"><input className="input" value={skill} placeholder="e.g. Python, React, SQL" onChange={(e) => setSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} /><button className="btn small" onClick={addSkill}>Add</button></span>
          </label>
          <div className="chips">{skills.map((s) => <button key={s} className="chip active" onClick={() => update({ skills: skills.filter((x) => x !== s) })} title="Remove">{s} ✕</button>)}</div>
          <p className="muted small">Saved automatically on this device for your account.</p>
        </div>
      </div>

      <h2 className="section-title">Certificate preview</h2>
      <div className="certificate">
        <div className="cert-inner">
          <div className="cert-brand">NGU</div>
          {p.photo && <img className="cert-photo" src={p.photo} alt="Student" />}
          <div className="cert-title">Certificate of Project Completion</div>
          <p>This certifies that</p>
          <div className="cert-name">{p.fullName || user?.name || 'Student'}</div>
          <p>successfully built the project</p>
          <div className="cert-project">Your final project</div>
          <div className="cert-foot"><span>{new Date().toLocaleDateString()}</span><span>Developed by Er. Chetan D Morey</span></div>
        </div>
      </div>
    </div>
  );
}
