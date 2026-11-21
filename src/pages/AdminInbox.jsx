import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Star, Phone, Mail, MessageCircle, Check, Trash2, Undo2, ArrowLeft, EyeOff } from 'lucide-react';
import { supaMode } from '../supabase.js';
import {
  listEnquiries, setEnquiryStatus, deleteEnquiry, listReviews, setReviewApproved, deleteReview, useLandingData,
} from '../landingStore.js';
import '../styles/landing-extra.css';

const when = (d) => { try { return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
const act = (fn) => async (...a) => { try { await fn(...a); } catch (e) { window.alert(e.message); } };

function Enquiries() {
  const { items, loading, error } = useLandingData(() => listEnquiries(), []);
  const [filter, setFilter] = useState('new');
  const shown = items.filter((e) => filter === 'all' || (filter === 'new' ? e.status !== 'contacted' : e.status === 'contacted'));
  const count = (s) => items.filter((e) => (s === 'new' ? e.status !== 'contacted' : e.status === 'contacted')).length;
  return (
    <div>
      <div className="chips">
        {[['new', `New (${count('new')})`], ['contacted', `Contacted (${count('contacted')})`], ['all', `All (${items.length})`]].map(([k, l]) => (
          <button key={k} className={`chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      {error && <div className="card lx-err">Could not load enquiries: {error}</div>}
      {loading ? <p className="muted">Loading...</p> : !shown.length ? <div className="card muted">No enquiries here yet.</div> : (
        <div className="lx-inbox-list">
          {shown.map((e) => (
            <div key={e.id} className={`card lx-inbox-item ${e.status === 'contacted' ? 'done' : ''}`}>
              <div className="lx-inbox-top">
                <b>{e.name}</b>
                <span className={`badge ${e.status === 'contacted' ? 'ok' : ''}`}>{e.status === 'contacted' ? 'Contacted' : 'New'}</span>
                <span className="muted small">{when(e.created_at)}</span>
              </div>
              <div className="meta">
                <span>{e.course}</span>
                {e.phone && <a href={`tel:+91${e.phone}`}><Phone size={14} /> {e.phone}</a>}
                {e.phone && <a href={`https://wa.me/91${e.phone}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> WhatsApp</a>}
                {e.email && <a href={`mailto:${e.email}`}><Mail size={14} /> {e.email}</a>}
              </div>
              {e.message && <p className="lx-inbox-msg">{e.message}</p>}
              <div className="row-btns">
                {e.status === 'contacted'
                  ? <button className="btn small" onClick={() => act(setEnquiryStatus)(e.id, 'new')}><Undo2 size={14} /> Mark as new</button>
                  : <button className="btn small primary" onClick={() => act(setEnquiryStatus)(e.id, 'contacted')}><Check size={14} /> Mark as contacted</button>}
                <button className="btn small lx-danger" onClick={() => { if (window.confirm(`Delete the enquiry from ${e.name}?`)) act(deleteEnquiry)(e.id); }}><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Reviews() {
  const { items, loading, error } = useLandingData(() => listReviews({ all: true }), []);
  const pending = items.filter((r) => !r.approved);
  const approved = items.filter((r) => r.approved);
  const row = (r) => (
    <div key={r.id} className={`card lx-inbox-item ${r.approved ? 'done' : ''}`}>
      <div className="lx-inbox-top">
        <b>{r.name}</b>
        <span className="lx-stars" role="img" aria-label={`${r.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} className={n <= r.rating ? 'on' : ''} aria-hidden="true" />)}</span>
        <span className="muted small">{r.course} · {when(r.created_at)}</span>
      </div>
      <p className="lx-inbox-msg">{r.text}</p>
      <div className="row-btns">
        {r.approved
          ? <button className="btn small" onClick={() => act(setReviewApproved)(r.id, false)}><EyeOff size={14} /> Hide from site</button>
          : <button className="btn small primary" onClick={() => act(setReviewApproved)(r.id, true)}><Check size={14} /> Approve</button>}
        <button className="btn small lx-danger" onClick={() => { if (window.confirm(`Delete the review from ${r.name}?`)) act(deleteReview)(r.id); }}><Trash2 size={14} /> Delete</button>
      </div>
    </div>
  );
  return (
    <div>
      {error && <div className="card lx-err">Could not load reviews: {error}</div>}
      {loading ? <p className="muted">Loading...</p> : (
        <>
          <h3>Waiting for approval ({pending.length})</h3>
          {pending.length ? <div className="lx-inbox-list">{pending.map(row)}</div> : <div className="card muted">No reviews waiting.</div>}
          <h3>Shown on the home page ({approved.length})</h3>
          {approved.length ? <div className="lx-inbox-list">{approved.map(row)}</div> : <div className="card muted">No approved reviews yet. The reviews section stays hidden on the home page until you approve one.</div>}
        </>
      )}
    </div>
  );
}

export default function AdminInbox() {
  const [tab, setTab] = useState('enquiries');
  return (
    <div className="admin lx-inbox">
      <div className="page-head">
        <h1><Inbox size={26} /> Enquiries &amp; reviews</h1>
        <p className="muted">Enquiries sent from the Contact form on the home page, and student reviews waiting for your approval.</p>
        {!supaMode && <p className="muted small">Browser-only mode: you only see enquiries and reviews that were submitted in this browser. Turn on Supabase (run supabase/landing.sql) to collect them from every visitor.</p>}
        <Link className="btn small" to="/admin"><ArrowLeft size={14} /> Admin panel</Link>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'enquiries' ? 'active' : ''}`} onClick={() => setTab('enquiries')}><Inbox size={15} /> Enquiries</button>
        <button className={`tab ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}><Star size={15} /> Reviews</button>
      </div>
      {tab === 'enquiries' ? <Enquiries /> : <Reviews />}
    </div>
  );
}
