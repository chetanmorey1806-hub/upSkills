import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, ChevronLeft, ChevronRight, CalendarPlus, Download, Upload, Copy, LayoutGrid, List, Pencil, Trophy } from 'lucide-react';
import { useStudy, dayKey, addDays } from '../study.js';
import { useAuth } from '../auth.js';
import { COMPANIES } from './PlacementTools.jsx';
import { downloadFile } from '../components/careerUtils.js';
import { icsEvent, googleCalUrl } from '../reminders.js';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const lpa = (n) => `${(+n || 0).toFixed(2).replace(/\.00$/, '')} LPA`;

/* ============================== Application Tracker ============================== */
export const STAGES = ['Wishlist', 'Applied', 'Online test', 'Technical interview', 'HR interview', 'Offer', 'Rejected'];
const STAGE_COLOR = { Wishlist: '#64748b', Applied: '#2563eb', 'Online test': '#7c3aed', 'Technical interview': '#d97706', 'HR interview': '#db2777', Offer: '#16a34a', Rejected: '#dc2626' };
const EMPTY_APP = { company: '', role: '', type: 'Job', location: '', ctc: '', source: 'Campus', link: '', appliedOn: '', stage: 'Applied', nextRound: '', nextDate: '', nextTime: '', contact: '', notes: '' };
const kitFor = (company) => COMPANIES.find((c) => company && c.name.toLowerCase().split(/[\s(]/)[0] === company.toLowerCase().split(/\s/)[0]);

function AppForm({ value, onSave, onCancel }) {
  const [f, setF] = useState(value);
  const I = (k, l, props = {}) => <label key={k}>{l}<input className="input" value={f[k] || ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} {...props} /></label>;
  const S = (k, l, opts) => <label key={k}>{l}<select className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })}>{opts.map((o) => <option key={o}>{o}</option>)}</select></label>;
  return (
    <div className="card jc-form ca-form">
      <h3>{value.id ? 'Edit application' : 'Add an application'}</h3>
      <div className="rb-2">
        {I('company', 'Company *', { placeholder: 'e.g. Infosys' })}{I('role', 'Role', { placeholder: 'e.g. Systems Engineer' })}
        {S('type', 'Type', ['Job', 'Internship'])}{S('stage', 'Stage', STAGES)}
        {I('location', 'Location')}{I('ctc', 'Package (LPA) / stipend')}
        {S('source', 'Applied via', ['Campus', 'Off-campus portal', 'LinkedIn', 'Naukri', 'Referral', 'Company website', 'Other'])}{I('appliedOn', 'Applied on', { type: 'date' })}
        {I('nextRound', 'Next round', { placeholder: 'e.g. Technical interview' })}{I('nextDate', 'Next round date', { type: 'date' })}
        {I('nextTime', 'Time', { type: 'time' })}{I('link', 'Job link')}
        {I('contact', 'Contact / HR / referrer')}
      </div>
      <label>Notes (questions asked, what to prepare…)<textarea className="input" rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
      <div className="row-btns"><button className="btn primary" disabled={!f.company.trim()} onClick={() => onSave(f)}>Save</button><button className="btn" onClick={onCancel}>Cancel</button></div>
    </div>
  );
}

export function ApplicationTracker() {
  const [apps, setApps] = useStudy('upskillr-career-apps', []);
  const [edit, setEdit] = useState(null);
  const [view, setView] = useState('board');
  const [q, setQ] = useState('');
  const today = dayKey();
  const list = apps.filter((a) => !q || `${a.company} ${a.role} ${a.location}`.toLowerCase().includes(q.toLowerCase()));
  const save = (f) => {
    setApps((all) => {
      if (f.id) return all.map((a) => (a.id === f.id ? { ...f, history: a.stage !== f.stage ? [...(a.history || []), { stage: f.stage, at: Date.now() }] : a.history } : a));
      return [{ ...f, id: uid(), created: Date.now(), history: [{ stage: f.stage, at: Date.now() }] }, ...all];
    });
    setEdit(null);
  };
  const move = (a, dir) => { const i = STAGES.indexOf(a.stage) + dir; if (i < 0 || i >= STAGES.length) return; save({ ...a, stage: STAGES[i] }); };
  const del = (a) => window.confirm(`Delete ${a.company}?`) && setApps((all) => all.filter((x) => x.id !== a.id));
  const upcoming = apps.filter((a) => a.nextDate && a.nextDate >= today).sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  const count = (st) => apps.filter((a) => a.stage === st).length;
  const interviews = apps.filter((a) => (a.history || []).some((h) => /interview/i.test(h.stage)) || /interview/i.test(a.stage)).length;
  const exportCsv = () => {
    const cols = ['company', 'role', 'type', 'stage', 'location', 'ctc', 'source', 'appliedOn', 'nextRound', 'nextDate', 'nextTime', 'contact', 'link', 'notes'];
    const csv = [cols.join(','), ...apps.map((a) => cols.map((c) => `"${String(a[c] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    downloadFile('applications.csv', csv, 'text/csv');
  };
  const card = (a) => {
    const kit = kitFor(a.company);
    return (
      <div key={a.id} className="ca-card" style={{ '--c': STAGE_COLOR[a.stage] }}>
        <div className="ca-top"><b>{a.company}</b><span className="ca-acts"><button onClick={() => setEdit(a)} aria-label="Edit"><Pencil size={13} /></button><button onClick={() => del(a)} aria-label="Delete"><Trash2 size={13} /></button></span></div>
        <div className="muted small">{a.role || '—'}{a.type === 'Internship' ? ' · Internship' : ''}{a.ctc ? ` · ${a.ctc}` : ''}</div>
        {a.nextDate && <div className={`ca-next ${a.nextDate < today ? 'past' : a.nextDate <= addDays(today, 2) ? 'soon' : ''}`}>📅 {a.nextRound || 'Next round'}: {new Date(`${a.nextDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{a.nextTime ? ` ${a.nextTime}` : ''}</div>}
        <div className="ca-move">
          <button disabled={a.stage === STAGES[0]} onClick={() => move(a, -1)} aria-label="Previous stage"><ChevronLeft size={14} /></button>
          {kit ? <Link to={`/practice/companies/${kit.id}`} className="small">Prepare</Link> : <Link to="/practice/video-interview" className="small">Practise</Link>}
          <button disabled={a.stage === STAGES[STAGES.length - 1]} onClick={() => move(a, 1)} aria-label="Next stage"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };
  return (
    <div>
      <div className="page-head">
        <h1>💼 Application Tracker</h1>
        <p className="muted">Keep every job and internship application in one place: stage, next round date, notes and preparation links. Saved in this browser.</p>
        <div className="row-btns">
          <button className="btn primary" onClick={() => setEdit({ ...EMPTY_APP, appliedOn: today })}><Plus size={15} /> Add application</button>
          <button className={`btn ${view === 'board' ? 'success' : ''}`} onClick={() => setView('board')}><LayoutGrid size={15} /> Board</button>
          <button className={`btn ${view === 'list' ? 'success' : ''}`} onClick={() => setView('list')}><List size={15} /> List</button>
          <button className="btn" disabled={!apps.length} onClick={exportCsv}><Download size={15} /> Export CSV</button>
        </div>
      </div>
      <div className="ts-stats">
        <div className="card"><b>{apps.length}</b><span>Applications</span></div>
        <div className="card"><b>{interviews}</b><span>Reached interviews</span></div>
        <div className="card"><b>{count('Offer')}</b><span>Offers</span></div>
        <div className="card"><b>{apps.length ? Math.round((count('Offer') / apps.length) * 100) : 0}%</b><span>Offer rate</span></div>
      </div>
      {edit && <AppForm value={edit} onSave={save} onCancel={() => setEdit(null)} />}
      {upcoming.length > 0 && (
        <div className="card">
          <h3>📅 Upcoming rounds</h3>
          {upcoming.slice(0, 6).map((a) => (
            <div key={a.id} className="ca-up">
              <span><b>{new Date(`${a.nextDate}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}{a.nextTime ? ` ${a.nextTime}` : ''}</b> — {a.company}: {a.nextRound || a.stage}</span>
              <span className="row-btns">
                <a className="btn small" target="_blank" rel="noreferrer" href={googleCalUrl({ title: `${a.company}: ${a.nextRound || 'Interview'}`, day: a.nextDate, time: a.nextTime || '10:00', details: `${a.role || ''}\n${a.notes || ''}` })}><CalendarPlus size={14} /> Google</a>
                <button className="btn small" onClick={() => downloadFile(`${a.company}-round.ics`, icsEvent({ title: `${a.company}: ${a.nextRound || 'Interview'}`, day: a.nextDate, time: a.nextTime, details: a.notes }), 'text/calendar')}><Download size={14} /> .ics</button>
              </span>
            </div>
          ))}
        </div>
      )}
      {apps.length > 3 && <input className="input ts-search" placeholder="Filter by company, role or city…" value={q} onChange={(e) => setQ(e.target.value)} />}
      {!apps.length && !edit && <div className="card empty-state"><p>No applications yet. Add the first company you applied to — even “Wishlist” companies you plan to apply to.</p></div>}
      {apps.length > 0 && (view === 'board' ? (
        <div className="ca-board">
          {STAGES.map((st) => (
            <div key={st} className="ca-col">
              <div className="ca-colh" style={{ '--c': STAGE_COLOR[st] }}><b>{st}</b><span>{list.filter((a) => a.stage === st).length}</span></div>
              {list.filter((a) => a.stage === st).map(card)}
            </div>
          ))}
        </div>
      ) : (
        <div className="card"><div className="table-wrap"><table className="data-table">
          <thead><tr><th>Company</th><th>Role</th><th>Stage</th><th>Next round</th><th>Package</th><th>Applied</th><th /></tr></thead>
          <tbody>{list.map((a) => <tr key={a.id}><td><b>{a.company}</b></td><td>{a.role}</td><td><span className="badge" style={{ color: STAGE_COLOR[a.stage] }}>{a.stage}</span></td><td>{a.nextDate ? `${a.nextRound || ''} ${a.nextDate}` : '—'}</td><td>{a.ctc}</td><td>{a.appliedOn}</td><td><button className="link-btn" onClick={() => setEdit(a)}><Pencil size={13} /></button></td></tr>)}</tbody>
        </table></div></div>
      ))}
    </div>
  );
}

/* ============================== Offer Comparison ============================== */
// Income tax estimate – India, new regime, FY 2025-26 slabs (salaried, below ₹50 lakh, no surcharge).
export function taxNewRegime(gross) {
  const taxable = Math.max(0, gross - 75000);
  const slabs = [[400000, 0], [800000, 0.05], [1200000, 0.1], [1600000, 0.15], [2000000, 0.2], [2400000, 0.25], [Infinity, 0.3]];
  let tax = 0; let prev = 0;
  for (const [upto, rate] of slabs) { if (taxable > prev) tax += (Math.min(taxable, upto) - prev) * rate; prev = upto; }
  if (taxable <= 1200000) tax = 0;
  else tax = Math.min(tax, taxable - 1200000); // marginal relief near ₹12 lakh
  return Math.round(tax * 1.04); // + 4% health & education cess
}
export function offerMath(o) {
  const fixed = (+o.fixed || +o.ctc || 0) * 100000;
  const variable = (+o.variable || 0) * 100000;
  const basic = fixed * ((+o.basicPct || 40) / 100);
  const pfOn = o.pf !== false;
  const employerPf = pfOn ? Math.round(basic * 0.12) : 0;
  const employeePf = employerPf;
  const gross = fixed - employerPf; // CTC usually includes the employer's PF share
  const pt = 2500; // professional tax (varies by state; ~₹2,500/year in Maharashtra)
  const tax = taxNewRegime(gross);
  const monthly = (gross - employeePf - pt - tax) / 12;
  const expenses = +o.expenses || 0;
  return { fixed, variable, employerPf, employeePf, gross, pt, tax, monthly, savings: monthly - expenses, yearTake: monthly * 12 + variable * 0.85 + (+o.joining || 0) };
}
const EMPTY_OFFER = { company: '', role: '', ctc: '', fixed: '', variable: '', joining: '', basicPct: 40, pf: true, city: '', expenses: '', bondYears: 0, bondAmount: '', notice: 30, wfh: 0, growth: 3 };

export function OfferComparison() {
  const [offers, setOffers] = useStudy('upskillr-career-offers', []);
  const [weights, setWeights] = useState({ money: 40, growth: 30, bond: 15, flex: 15 });
  const add = () => setOffers((o) => [...o, { ...EMPTY_OFFER, id: uid(), company: `Offer ${o.length + 1}` }]);
  const set = (id, k, v) => setOffers((o) => o.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const math = offers.map(offerMath);
  const maxSave = Math.max(1, ...math.map((m) => m.savings));
  const scores = offers.map((o, i) => {
    const money = Math.max(0, math[i].savings) / maxSave;
    const growth = (+o.growth || 0) / 5;
    const bond = +o.bondYears > 0 ? Math.max(0, 1 - (+o.bondYears) * 0.35) : 1;
    const flex = Math.min(1, (+o.wfh || 0) / 5) * 0.6 + ((+o.notice || 90) <= 30 ? 0.4 : (+o.notice || 90) <= 60 ? 0.25 : 0.1);
    const tw = weights.money + weights.growth + weights.bond + weights.flex || 1;
    return Math.round(((money * weights.money + growth * weights.growth + bond * weights.bond + flex * weights.flex) / tw) * 100);
  });
  const best = scores.length ? scores.indexOf(Math.max(...scores)) : -1;
  const rowBest = (vals, high = true) => { const v = vals.filter((x) => Number.isFinite(x)); const t = high ? Math.max(...v) : Math.min(...v); return (x) => offers.length > 1 && x === t; };
  const fld = (o, k, l, props = {}) => <label className="oc-f">{l}<input className="input" value={o[k]} onChange={(e) => set(o.id, k, e.target.value)} {...props} /></label>;
  const rows = [
    ['CTC', (o) => lpa(o.ctc || o.fixed), null],
    ['Monthly in-hand (estimate)', (o, m) => inr(m.monthly), math.map((m) => m.monthly)],
    ['Income tax / year (estimate)', (o, m) => inr(m.tax), math.map((m) => m.tax), false],
    ['Your PF savings / year', (o, m) => inr(m.employeePf + m.employerPf), math.map((m) => m.employeePf + m.employerPf)],
    ['Monthly savings after expenses', (o, m) => inr(m.savings), math.map((m) => m.savings)],
    ['First-year take-home (incl. variable & bonus)', (o, m) => inr(m.yearTake), math.map((m) => m.yearTake)],
    ['Bond', (o) => (+o.bondYears ? `${o.bondYears} yr${o.bondAmount ? ` · ₹${o.bondAmount}` : ''}` : 'None'), null],
    ['Notice period', (o) => `${o.notice || '—'} days`, null],
    ['WFH days / week', (o) => o.wfh || 0, null],
    ['Learning & growth (your rating)', (o) => '★'.repeat(+o.growth || 0) || '—', null],
  ];
  return (
    <div>
      <div className="page-head">
        <h1>⚖️ Offer Comparison</h1>
        <p className="muted">Compare job offers side by side: estimated monthly in-hand salary, tax, PF, savings after expenses, bond and growth. Numbers are estimates (new tax regime, FY 2025-26 slabs, PF at 12% of basic, ~₹2,500 professional tax) — check your offer letter and current tax rules.</p>
        <button className="btn primary" onClick={add}><Plus size={15} /> Add an offer</button>
      </div>
      {!offers.length && <div className="card empty-state"><p>Add two or more offers to compare them. Tip: “CTC” is not your salary — the in-hand amount is what matters month to month.</p></div>}
      {offers.length > 0 && (
        <>
          <div className="oc-grid" style={{ '--n': offers.length }}>
            {offers.map((o, i) => (
              <div key={o.id} className={`card jc-form oc-card ${i === best && offers.length > 1 ? 'best' : ''}`}>
                <div className="db-card-head"><input className="input oc-name" value={o.company} onChange={(e) => set(o.id, 'company', e.target.value)} /><button className="link-btn danger" onClick={() => setOffers((x) => x.filter((y) => y.id !== o.id))}><Trash2 size={14} /></button></div>
                {fld(o, 'role', 'Role')}
                <div className="rb-2">{fld(o, 'ctc', 'CTC (LPA)', { type: 'number', step: '0.1' })}{fld(o, 'fixed', 'Fixed pay (LPA)', { type: 'number', step: '0.1', placeholder: 'same as CTC' })}{fld(o, 'variable', 'Variable / bonus (LPA)', { type: 'number', step: '0.1' })}{fld(o, 'joining', 'Joining bonus (₹)', { type: 'number' })}{fld(o, 'basicPct', 'Basic % of fixed', { type: 'number' })}{fld(o, 'city', 'City')}{fld(o, 'expenses', 'Monthly expenses (₹)', { type: 'number', placeholder: 'rent + food + travel' })}{fld(o, 'notice', 'Notice (days)', { type: 'number' })}{fld(o, 'bondYears', 'Bond (years)', { type: 'number', step: '0.5' })}{fld(o, 'bondAmount', 'Bond amount (₹)', { type: 'number' })}{fld(o, 'wfh', 'WFH days/week', { type: 'number', min: 0, max: 5 })}</div>
                <label className="oc-f">Learning & growth <select className="input" value={o.growth} onChange={(e) => set(o.id, 'growth', e.target.value)}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}</select></label>
                <label className="check small"><input type="checkbox" checked={o.pf !== false} onChange={(e) => set(o.id, 'pf', e.target.checked)} /> PF is deducted (12% of basic)</label>
              </div>
            ))}
          </div>
          <div className="card">
            <h3>Side by side</h3>
            <div className="table-wrap"><table className="data-table oc-table">
              <thead><tr><th /> {offers.map((o) => <th key={o.id}>{o.company}</th>)}</tr></thead>
              <tbody>
                {rows.map(([label, fn, vals, high = true]) => { const isBest = vals ? rowBest(vals, high) : () => false; return (
                  <tr key={label}><td>{label}</td>{offers.map((o, i) => <td key={o.id} className={vals && isBest(vals[i]) ? 'oc-win' : ''}>{fn(o, math[i])}</td>)}</tr>
                ); })}
                <tr className="oc-score"><td><b>Overall score</b></td>{offers.map((o, i) => <td key={o.id} className={i === best && offers.length > 1 ? 'oc-win' : ''}><b>{scores[i]}</b>/100 {i === best && offers.length > 1 && <Trophy size={14} />}</td>)}</tr>
              </tbody>
            </table></div>
            <details className="sp-goal-edit"><summary className="small">What matters most to you? (weights)</summary>
              {[['money', 'Money (savings)'], ['growth', 'Learning & growth'], ['bond', 'No bond / freedom'], ['flex', 'WFH & short notice']].map(([k, l]) => (
                <label key={k} className="db-part-top">{l}<input type="range" min={0} max={60} value={weights[k]} onChange={(e) => setWeights({ ...weights, [k]: Number(e.target.value) })} /></label>
              ))}
            </details>
            <p className="muted small">For freshers, the first job's learning and project quality often matter more than a small salary difference. Read the bond clause carefully before signing.</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================== Interview Journal ============================== */
const EMPTY_EXP = { company: '', role: '', date: '', mode: 'Campus', result: 'Waiting', rounds: [{ name: 'Online test', questions: '', difficulty: 'Medium', notes: '' }], tips: '' };

export function InterviewJournal() {
  const user = useAuth();
  const [list, setList] = useStudy('upskillr-career-journal', []);
  const [edit, setEdit] = useState(null);
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState('');
  const file = useRef(null);
  const shown = list.filter((e) => !q || `${e.company} ${e.role} ${e.rounds.map((r) => r.questions).join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  const allQs = useMemo(() => list.flatMap((e) => e.rounds.flatMap((r) => r.questions.split('\n').map((x) => x.trim()).filter(Boolean).map((x) => ({ q: x, company: e.company, round: r.name })))), [list]);
  const save = () => { setList((l) => (edit.id ? l.map((x) => (x.id === edit.id ? edit : x)) : [{ ...edit, id: uid(), author: user?.name || 'Me', at: Date.now() }, ...l])); setEdit(null); };
  const asText = (e) => `📝 ${e.company} – ${e.role} (${e.mode}, ${e.date || ''}) – ${e.result}\n\n${e.rounds.map((r, i) => `Round ${i + 1}: ${r.name} [${r.difficulty}]\n${r.questions.split('\n').filter((x) => x.trim()).map((x) => `• ${x.trim()}`).join('\n')}${r.notes ? `\nNote: ${r.notes}` : ''}`).join('\n\n')}${e.tips ? `\n\n💡 Tips: ${e.tips}` : ''}\n\n— shared via UpSkillr`;
  const copy = async (e) => { try { await navigator.clipboard.writeText(asText(e)); setCopied(e.id); setTimeout(() => setCopied(''), 1500); } catch { /* ignore */ } };
  const importFile = (f) => {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const j = JSON.parse(rd.result);
        const arr = (Array.isArray(j) ? j : j.experiences || []).filter((x) => x && x.company && Array.isArray(x.rounds));
        if (!arr.length) throw new Error('empty');
        setList((l) => { const ids = new Set(l.map((x) => x.id)); return [...arr.filter((x) => !ids.has(x.id)).map((x) => ({ ...x, shared: true })), ...l]; });
        window.alert(`Imported ${arr.length} experience${arr.length === 1 ? '' : 's'}.`);
      } catch { window.alert('This is not a valid UpSkillr interview journal file.'); }
    };
    rd.readAsText(f);
  };
  const setRound = (i, patch) => setEdit((e) => ({ ...e, rounds: e.rounds.map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
  return (
    <div>
      <div className="page-head">
        <h1>📓 Interview Journal</h1>
        <p className="muted">Write down every interview right after it happens: rounds, questions and tips. Share your experiences with juniors as a file or as text (WhatsApp / LinkedIn), and import files shared by seniors.</p>
        <div className="row-btns">
          <button className="btn primary" onClick={() => setEdit({ ...EMPTY_EXP, date: dayKey(), rounds: EMPTY_EXP.rounds.map((r) => ({ ...r })) })}><Plus size={15} /> Add experience</button>
          <button className="btn" disabled={!list.length} onClick={() => downloadFile('interview-experiences.json', JSON.stringify({ app: 'upskillr', experiences: list.filter((x) => !x.shared) }, null, 2), 'application/json')}><Download size={15} /> Share my experiences (file)</button>
          <button className="btn" onClick={() => file.current?.click()}><Upload size={15} /> Import from a senior</button>
          <input ref={file} type="file" accept=".json,application/json" hidden onChange={(e) => e.target.files[0] && importFile(e.target.files[0])} />
        </div>
        <p className="muted small">A shared experience bank for all students needs the online server. Until then, share journal files in your class group.</p>
      </div>
      {edit && (
        <div className="card jc-form">
          <h3>{edit.id ? 'Edit experience' : 'New interview experience'}</h3>
          <div className="rb-2">
            <label>Company *<input className="input" value={edit.company} onChange={(e) => setEdit({ ...edit, company: e.target.value })} /></label>
            <label>Role<input className="input" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} /></label>
            <label>Date<input className="input" type="date" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} /></label>
            <label>Drive<select className="input" value={edit.mode} onChange={(e) => setEdit({ ...edit, mode: e.target.value })}>{['Campus', 'Off-campus', 'Referral', 'Pool campus', 'Walk-in'].map((x) => <option key={x}>{x}</option>)}</select></label>
            <label>Result<select className="input" value={edit.result} onChange={(e) => setEdit({ ...edit, result: e.target.value })}>{['Waiting', 'Selected', 'Rejected'].map((x) => <option key={x}>{x}</option>)}</select></label>
          </div>
          {edit.rounds.map((r, i) => (
            <div key={i} className="rb-proj">
              <div className="rb-2"><label>Round {i + 1}<input className="input" value={r.name} onChange={(e) => setRound(i, { name: e.target.value })} /></label><label>Difficulty<select className="input" value={r.difficulty} onChange={(e) => setRound(i, { difficulty: e.target.value })}>{['Easy', 'Medium', 'Hard'].map((x) => <option key={x}>{x}</option>)}</select></label></div>
              <label>Questions asked (one per line)<textarea className="input" rows={4} value={r.questions} onChange={(e) => setRound(i, { questions: e.target.value })} /></label>
              <label>Notes<input className="input" value={r.notes} onChange={(e) => setRound(i, { notes: e.target.value })} /></label>
              {edit.rounds.length > 1 && <button className="link-btn danger" onClick={() => setEdit({ ...edit, rounds: edit.rounds.filter((_, j) => j !== i) })}>Remove round</button>}
            </div>
          ))}
          <button className="btn small" onClick={() => setEdit({ ...edit, rounds: [...edit.rounds, { name: ['Technical interview', 'HR interview', 'Managerial round'][Math.min(2, edit.rounds.length - 1)], questions: '', difficulty: 'Medium', notes: '' }] })}><Plus size={14} /> Add round</button>
          <label>Tips for juniors<textarea className="input" rows={2} value={edit.tips} onChange={(e) => setEdit({ ...edit, tips: e.target.value })} /></label>
          <div className="row-btns"><button className="btn primary" disabled={!edit.company.trim()} onClick={save}>Save</button><button className="btn" onClick={() => setEdit(null)}>Cancel</button></div>
        </div>
      )}
      {list.length > 2 && <input className="input ts-search" placeholder="Search company or question…" value={q} onChange={(e) => setQ(e.target.value)} />}
      {!list.length && !edit && <div className="card empty-state"><p>No experiences yet. After your next test or interview, write down every question you remember — it helps you and your juniors.</p></div>}
      {shown.map((e) => (
        <details key={e.id} className="card qa">
          <summary><span className="qa-q">{e.company} — {e.role || 'Interview'}</span><span className={`badge ${e.result === 'Selected' ? 'ok' : ''}`}>{e.result}</span>{e.shared && <span className="badge">shared by {e.author || 'senior'}</span>}</summary>
          <div className="qa-a">
            <div className="muted small">{e.mode} · {e.date}</div>
            {e.rounds.map((r, i) => <div key={i} className="ij-round"><b>Round {i + 1}: {r.name}</b> <span className={`lvl lvl-${r.difficulty}`}>{r.difficulty}</span><ul>{r.questions.split('\n').filter((x) => x.trim()).map((x, k) => <li key={k}>{x}</li>)}</ul>{r.notes && <div className="muted small">{r.notes}</div>}</div>)}
            {e.tips && <div className="tip">💡 {e.tips}</div>}
            <div className="row-btns">
              <button className="btn small" onClick={() => copy(e)}><Copy size={14} /> {copied === e.id ? 'Copied ✓' : 'Copy as text'}</button>
              {!e.shared && <button className="btn small" onClick={() => setEdit(e)}><Pencil size={14} /> Edit</button>}
              <button className="link-btn danger" onClick={() => window.confirm('Delete this experience?') && setList((l) => l.filter((x) => x.id !== e.id))}><Trash2 size={14} /></button>
            </div>
          </div>
        </details>
      ))}
      {allQs.length > 0 && (
        <div className="card">
          <h3>🎯 All questions from your journal ({allQs.length})</h3>
          <p className="muted small">Practise answering these out loud in the <Link to="/practice/video-interview">Video Mock Interview</Link>.</p>
          <ul className="small">{allQs.slice(0, 60).map((x, i) => <li key={i}>{x.q} <span className="muted">— {x.company}, {x.round}</span></li>)}</ul>
        </div>
      )}
    </div>
  );
}
