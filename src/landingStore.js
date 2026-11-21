// Reviews and enquiries from the landing page.
// Supabase mode: tables `reviews` and `enquiries` (see supabase/landing.sql).
// Browser-only mode: localStorage. The keys start with "upskillr-auth-" on purpose: auth.js swaps every other
// "upskillr-*" key in and out per signed-in user (and cloudSync uploads them), but reviews/enquiries are
// site-wide data that the admin must see no matter who submitted them on this browser.
import { useCallback, useEffect, useState } from 'react';
import { supabase, supaMode } from './supabase.js';

const RKEY = 'upskillr-auth-reviews';
const EKEY = 'upskillr-auth-enquiries';
const EVT = 'upskillr-landing-data';

const read = (k) => { try { const v = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full / blocked */ } window.dispatchEvent(new Event(EVT)); };
const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const byNewest = (a, b) => String(b.created_at).localeCompare(String(a.created_at));
const fail = (error) => { throw new Error(error.message || 'Something went wrong. Please try again.'); };
const changed = () => window.dispatchEvent(new Event(EVT));

// ---------------------------------------------------------------- reviews
export async function listReviews({ all = false } = {}) {
  if (supaMode) {
    let q = supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(500);
    if (!all) q = q.eq('approved', true);
    const { data, error } = await q;
    if (error) fail(error);
    return data || [];
  }
  const list = read(RKEY).sort(byNewest);
  return all ? list : list.filter((r) => r.approved);
}

export async function addReview({ name, course, rating, text }) {
  const row = {
    name: String(name || '').trim().slice(0, 80),
    course: String(course || '').trim().slice(0, 80),
    rating: Math.max(1, Math.min(5, Math.round(Number(rating) || 0))),
    text: String(text || '').trim().slice(0, 1000),
    approved: false,
  };
  if (supaMode) {
    const { error } = await supabase.from('reviews').insert(row);
    if (error) fail(error);
    changed();
    return;
  }
  write(RKEY, [{ ...row, id: newId(), created_at: new Date().toISOString() }, ...read(RKEY)]);
}

export async function setReviewApproved(id, approved) {
  if (supaMode) {
    const { error } = await supabase.from('reviews').update({ approved }).eq('id', id);
    if (error) fail(error);
    changed();
    return;
  }
  write(RKEY, read(RKEY).map((r) => (r.id === id ? { ...r, approved } : r)));
}

export async function deleteReview(id) {
  if (supaMode) {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) fail(error);
    changed();
    return;
  }
  write(RKEY, read(RKEY).filter((r) => r.id !== id));
}

// ---------------------------------------------------------------- enquiries
export async function addEnquiry({ name, phone, email, course, message }) {
  const row = {
    name: String(name || '').trim().slice(0, 80),
    phone: normalizeIndianMobile(phone),
    email: String(email || '').trim().slice(0, 120),
    course: String(course || '').trim().slice(0, 80),
    message: String(message || '').trim().slice(0, 1000),
    status: 'new',
  };
  if (supaMode) {
    const { error } = await supabase.from('enquiries').insert(row);
    if (error) fail(error);
    changed();
    return;
  }
  write(EKEY, [{ ...row, id: newId(), created_at: new Date().toISOString() }, ...read(EKEY)]);
}

export async function listEnquiries() {
  if (supaMode) {
    const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(1000);
    if (error) fail(error);
    return data || [];
  }
  return read(EKEY).sort(byNewest);
}

export async function setEnquiryStatus(id, status) {
  if (supaMode) {
    const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
    if (error) fail(error);
    changed();
    return;
  }
  write(EKEY, read(EKEY).map((r) => (r.id === id ? { ...r, status } : r)));
}

export async function deleteEnquiry(id) {
  if (supaMode) {
    const { error } = await supabase.from('enquiries').delete().eq('id', id);
    if (error) fail(error);
    changed();
    return;
  }
  write(EKEY, read(EKEY).filter((r) => r.id !== id));
}

// ---------------------------------------------------------------- hook
// Loads a list and reloads it whenever reviews/enquiries change (in this tab or another one).
export function useLandingData(loader, deps = []) {
  const [state, setState] = useState({ items: [], loading: true, error: '' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(loader, deps);
  useEffect(() => {
    let alive = true;
    const run = () => load()
      .then((items) => { if (alive) setState({ items, loading: false, error: '' }); })
      .catch((e) => { if (alive) setState((s) => ({ ...s, loading: false, error: e.message })); });
    run();
    const onStorage = (e) => { if (!e.key || e.key === RKEY || e.key === EKEY) run(); };
    window.addEventListener(EVT, run);
    window.addEventListener('storage', onStorage);
    return () => { alive = false; window.removeEventListener(EVT, run); window.removeEventListener('storage', onStorage); };
  }, [load]);
  return state;
}

export const isValidIndianMobile = (v) => /^[6-9]\d{9}$/.test(String(v || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, ''));
export const normalizeIndianMobile = (v) => String(v || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
