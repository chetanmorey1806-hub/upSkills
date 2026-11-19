import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allUsers, setSupabaseRole } from '../auth.js';
import { supaMode } from '../supabase.js';
import { tracks, trackOrder } from '../data/index.js';
import { DEFAULT_PACKAGES } from '../data/packages.js';
import AdminMedia from './AdminMedia.jsx';
import AdminUploads from './AdminUploads.jsx';
import { usePerms, writePerms, readPerms, permissionGroups, getPackages, packageTracks } from '../permissions.js';

import Ico from '../components/Ico.jsx';
import { Users as UsersIc, ShieldCheck, UserCog, Package as PackageIc, Upload as UploadIc, Images, Send } from 'lucide-react';
const TAB_ICONS = { users: UsersIc, roles: ShieldCheck, student: UserCog, packages: PackageIc, uploads: UploadIc, media: Images, settings: Send };
const TABS = [['users', 'Users'], ['roles', 'Student permissions'], ['student', 'Per-student access'], ['packages', 'Packages'], ['uploads', 'Upload videos, photos & PDFs'], ['media', 'Videos & images'], ['settings', 'Publish & settings']];
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Matrix like bk-steels: groups → modules (rows) × actions (columns). rules: { key: { action: false } }
function PermMatrix({ rules = {}, onChange }) {
  const groups = useMemo(permissionGroups, []);
  const [open, setOpen] = useState(() => new Set([groups[0]?.name]));
  const on = (k, a) => !(rules[k] && rules[k][a] === false);
  const set = (list, value) => {
    const next = JSON.parse(JSON.stringify(rules || {}));
    list.forEach(([k, a]) => { next[k] = { ...(next[k] || {}) }; if (value) delete next[k][a]; else next[k][a] = false; if (!Object.keys(next[k]).length) delete next[k]; });
    onChange(next);
  };
  const cells = (g) => g.modules.flatMap((m) => m.actions.map(([a]) => [m.key, a]));
  const allCells = [...new Map(groups.flatMap(cells).map((c) => [c.join('|'), c])).values()];
  const count = (list) => list.filter(([k, a]) => on(k, a)).length;
  return (
    <div className="pm">
      <div className="row-btns">
        <button className="btn small" onClick={() => set(allCells, true)}><Ico e="✅" /> Allow everything</button>
        <button className="btn small" onClick={() => set(allCells, false)}><Ico e="⛔" /> Block everything</button>
        <span className="muted small">{count(allCells)}/{allCells.length} permissions allowed</span>
      </div>
      {groups.map((g) => {
        const gc = cells(g); const n = count(gc); const isOpen = open.has(g.name);
        const actions = [...new Map(g.modules.flatMap((m) => m.actions).map((x) => [x[0], x])).values()];
        return (
          <div key={g.name} className="pm-group card">
            <div className="pm-head" onClick={() => setOpen((s) => { const x = new Set(s); x.has(g.name) ? x.delete(g.name) : x.add(g.name); return x; })}>
              <b>{isOpen ? '▾' : '▸'} {g.name}</b>
              <span className={`badge ${n === gc.length ? 'ok' : ''}`}>{n}/{gc.length}</span>
              <span className="pm-head-btns" onClick={(e) => e.stopPropagation()}>
                <button className="link-btn" onClick={() => set(gc, true)}>allow all</button>
                <button className="link-btn danger" onClick={() => set(gc, false)}>block all</button>
              </span>
            </div>
            {isOpen && (
              <div className="table-wrap">
                <table className="data-table pm-table">
                  <thead><tr><th>Module</th>{actions.map(([a, l]) => (
                    <th key={a} className="pm-col">{l}<br /><input type="checkbox" title={`All: ${l}`} checked={g.modules.every((m) => !m.actions.some((x) => x[0] === a) || on(m.key, a))} onChange={(e) => set(g.modules.filter((m) => m.actions.some((x) => x[0] === a)).map((m) => [m.key, a]), e.target.checked)} /></th>
                  ))}</tr></thead>
                  <tbody>{g.modules.map((m) => (
                    <tr key={m.key}>
                      <td>{m.label}</td>
                      {actions.map(([a]) => <td key={a} className="pm-col">{m.actions.some((x) => x[0] === a) ? <input type="checkbox" checked={on(m.key, a)} onChange={(e) => set([[m.key, a]], e.target.checked)} /> : '—'}</td>)}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function setAuthRole(username, role) {
  if (supaMode) { setSupabaseRole(username, role); return true; }
  try {
    const list = JSON.parse(localStorage.getItem('upskillr-auth-users')) || [];
    const u = list.find((x) => x.username === username);
    if (u) { u.role = role; localStorage.setItem('upskillr-auth-users', JSON.stringify(list)); window.dispatchEvent(new Event('upskillr-auth')); return true; }
  } catch { /* ignore */ }
  return false;
}

export default function Admin() {
  const { m, user } = usePerms();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'users';
  const [sel, setSel] = useState('');
  const [, force] = useState(0);
  const fileRef = useRef(null);
  const users = allUsers();
  const students = users.filter((u) => (u.role || 'student') !== 'admin');
  const packages = getPackages(m);
  const save = (fn) => { const next = fn(JSON.parse(JSON.stringify(readPerms()))); writePerms(next); };
  const setUser = (username, patch) => save((x) => { x.users[username] = { ...(x.users[username] || {}), ...patch }; return x; });
  const setPackages = (list) => save((x) => { x.packages = list; return x; });
  const statusOf = (u) => m.users[u.username] || {};

  const exportConfig = () => {
    const data = JSON.stringify({ ...readPerms(), exportedAt: new Date().toISOString(), exportedBy: user?.username }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'upskillr-config.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importConfig = async (f) => {
    try { const d = JSON.parse(await f.text()); if (!d.roles) throw new Error('Not an UpSkillr settings file'); writePerms({ roles: d.roles, users: d.users || {}, packages: d.packages || null, settings: d.settings || {} }); window.alert('Settings imported.'); } catch (e) { window.alert(`Import failed: ${e.message}`); }
  };

  const selUser = students.find((u) => u.username === sel);
  const su = selUser ? statusOf(selUser) : {};

  return (
    <div className="admin">
      <div className="page-head">
        <h1><Ico e="🛡" /> Admin Panel</h1>
        <p className="muted">Decide what students can see: courses, Day Tasks, test series, labs, projects and pages. Assign packages, manage accounts and publish the settings.</p>
      </div>
      <div className="tabs">{TABS.map(([k, l]) => <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setParams({ tab: k }, { replace: true })}><Ico e={TAB_ICONS[k]} /> {l}</button>)}</div>

      {tab === 'users' && (
        <div>
          <div className="ts-stats">
            <div className="card"><b>{users.length}</b><span>Accounts</span></div>
            <div className="card"><b>{students.length}</b><span>Students</span></div>
            <div className="card"><b>{users.length - students.length}</b><span>Admins</span></div>
            <div className="card"><b>{students.filter((u) => statusOf(u).disabled).length}</b><span>Disabled</span></div>
          </div>
          <div className="card table-wrap">
            <table className="data-table admin-users">
              <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Access</th><th>Packages</th><th>Status</th><th></th></tr></thead>
              <tbody>{users.map((u) => {
                const s = statusOf(u); const isAdm = (u.role || 'student') === 'admin';
                return (
                  <tr key={u.username}>
                    <td>{u.name}</td><td>@{u.username}</td><td>{u.email || '–'}</td>
                    <td>
                      <select value={u.role || 'student'} disabled={u.username === user?.username} onChange={(e) => { if (!setAuthRole(u.username, e.target.value)) window.alert('This built-in account cannot be changed.'); force((n) => n + 1); }}>
                        <option value="student">Student</option><option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{isAdm ? 'Everything' : s.custom ? 'Custom' : 'Student defaults'}</td>
                    <td>{isAdm ? '–' : (s.packages || []).map((id) => packages.find((p) => p.id === id)?.name).filter(Boolean).join(', ') || '–'}</td>
                    <td>{isAdm ? <span className="badge ok">Active</span> : <label className="check small"><input type="checkbox" checked={!s.disabled} onChange={(e) => setUser(u.username, { disabled: !e.target.checked })} /> {s.disabled ? 'Disabled' : 'Active'}</label>}</td>
                    <td>{!isAdm && <button className="link-btn" onClick={() => { setSel(u.username); setParams({ tab: 'student' }, { replace: true }); }}>Edit access →</button>}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
          <p className="muted small">New students register themselves from the Register page. Accounts are stored in this browser (see Publish & settings).</p>
        </div>
      )}

      {tab === 'roles' && (
        <div>
          <p className="muted">These permissions apply to <b>every student</b> (unless a student has custom access). Untick anything students should not see: it disappears from their menu and the page shows "locked".</p>
          <PermMatrix rules={m.roles.student} onChange={(r) => save((x) => { x.roles.student = r; return x; })} />
        </div>
      )}

      {tab === 'student' && (
        <div>
          <div className="card">
            <label className="field">Choose a student
              <select className="input" value={sel} onChange={(e) => setSel(e.target.value)}>
                <option value="">— select —</option>
                {students.map((u) => <option key={u.username} value={u.username}>{u.name} (@{u.username})</option>)}
              </select>
            </label>
            {!students.length && <p className="muted">No student accounts yet. Students appear here after they register.</p>}
          </div>
          {selUser && (
            <>
              <div className="card">
                <h3>{selUser.name} <span className="muted small">@{selUser.username}</span></h3>
                <label className="check"><input type="checkbox" checked={!su.disabled} onChange={(e) => setUser(selUser.username, { disabled: !e.target.checked })} /> Account active</label>
                <h4><Ico e="📦" /> Packages</h4>
                <div className="chips">{packages.map((p) => {
                  const has = (su.packages || []).includes(p.id);
                  return <button key={p.id} className={`chip ${has ? 'active' : ''}`} onClick={() => setUser(selUser.username, { packages: has ? (su.packages || []).filter((x) => x !== p.id) : [...(su.packages || []), p.id] })}><Ico e={p.icon} /> {p.name}</button>;
                })}</div>
                <p className="muted small">{m.settings.packagesControlAccess ? 'Packages control course access: this student only sees courses from the packages ticked above.' : 'Package access control is OFF (Packages tab): packages are informational for now.'}</p>
                <h4><Ico e="🔐" /> Permissions</h4>
                <label className="check"><input type="checkbox" checked={!!su.custom} onChange={(e) => setUser(selUser.username, e.target.checked ? { custom: true, rules: JSON.parse(JSON.stringify(m.roles.student || {})) } : { custom: false })} /> Use custom permissions for this student (otherwise the student defaults apply)</label>
              </div>
              {su.custom && <PermMatrix rules={su.rules} onChange={(r) => setUser(selUser.username, { rules: r })} />}
            </>
          )}
        </div>
      )}

      {tab === 'packages' && (
        <div>
          <div className="card">
            <label className="check"><input type="checkbox" checked={!!m.settings.packagesControlAccess} onChange={(e) => save((x) => { x.settings.packagesControlAccess = e.target.checked; return x; })} /> <b>Packages control course access</b>: students only see courses from the packages assigned to them (Per-student access).</label>
            <div className="row-btns">
              <button className="btn small" onClick={() => setPackages([...packages, { id: `pkg-${Date.now()}`, name: 'New package', icon: '📦', color: '#4f46e5', tagline: '', tracks: [], price: 0, offerPrice: 0, months: 3, mode: 'Self-paced', roles: [], tools: [], projects: [], visible: false }])}>＋ Add package</button>
              <button className="btn small" onClick={() => window.confirm('Reset all packages to the default list?') && setPackages(null)}>↺ Reset to defaults</button>
            </div>
          </div>
          {packages.map((p, i) => {
            const upd = (patch) => setPackages(packages.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            const tr = packageTracks(p);
            return (
              <details key={p.id} className="card pkg-edit">
                <summary><b><Ico e={p.icon} /> {p.name}</b> <span className="muted small">· {tr.length} courses · {inr(p.offerPrice || p.price)}</span> {!p.visible && <span className="badge">hidden</span>}</summary>
                <div className="grid2">
                  <label className="field">Name<input className="input" value={p.name} onChange={(e) => upd({ name: e.target.value })} /></label>
                  <label className="field">Icon (emoji, shown as a line icon)<input className="input" value={p.icon} onChange={(e) => upd({ icon: e.target.value })} /></label>
                  <label className="field">Price (₹)<input className="input" type="number" value={p.price} onChange={(e) => upd({ price: Number(e.target.value) })} /></label>
                  <label className="field">Offer price (₹, 0 = none)<input className="input" type="number" value={p.offerPrice || 0} onChange={(e) => upd({ offerPrice: Number(e.target.value) })} /></label>
                  <label className="field">Duration (months)<input className="input" type="number" value={p.months} onChange={(e) => upd({ months: Number(e.target.value) })} /></label>
                  <label className="field">Badge (optional)<input className="input" value={p.badge || ''} onChange={(e) => upd({ badge: e.target.value })} /></label>
                </div>
                <label className="field">Tagline<input className="input" value={p.tagline} onChange={(e) => upd({ tagline: e.target.value })} /></label>
                <label className="field">Job roles (comma separated)<input className="input" value={(p.roles || []).join(', ')} onChange={(e) => upd({ roles: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></label>
                <label className="check"><input type="checkbox" checked={p.visible !== false} onChange={(e) => upd({ visible: e.target.checked })} /> Show on the home page</label>
                <h4>Courses in this package</h4>
                <label className="check"><input type="checkbox" checked={p.tracks === '*'} onChange={(e) => upd({ tracks: e.target.checked ? '*' : [] })} /> All courses</label>
                {p.tracks !== '*' && <div className="pkg-tracks">{trackOrder.filter((k) => tracks[k]).map((k) => (
                  <label key={k} className="check small"><input type="checkbox" checked={tr.includes(k)} onChange={(e) => upd({ tracks: e.target.checked ? [...tr, k] : tr.filter((x) => x !== k) })} /> {tracks[k].name}</label>
                ))}</div>}
                <div className="row-btns"><button className="btn small" onClick={() => window.confirm(`Delete package ${p.name}?`) && setPackages(packages.filter((_, j) => j !== i))}><Ico e="🗑" /> Delete package</button></div>
              </details>
            );
          })}
          <p className="muted small">Default prices are examples. Set your real prices here before publishing.</p>
        </div>
      )}

      {tab === 'uploads' && <AdminUploads />}
      {tab === 'media' && <AdminMedia />}

      {tab === 'settings' && (
        <div className="grid2">
          <div className="card">
            <h3><Ico e="📤" /> Publish settings to every device</h3>
            <p>UpSkillr has no server yet, so admin settings are saved in this browser. To apply them for <b>all students on all devices</b>:</p>
            <ol>
              <li>Click <b>Download settings file</b> (upskillr-config.json).</li>
              <li>Put the file in the website's <code>public/</code> folder (next to index.html) and deploy the site again.</li>
              <li>Every browser loads it at start-up. Changes you make later on this computer stay local until you publish again.</li>
            </ol>
            <div className="row-btns">
              <button className="btn primary" onClick={exportConfig}><Ico e="⬇" /> Download settings file</button>
              <button className="btn" onClick={() => fileRef.current?.click()}><Ico e="⬆" /> Import settings file</button>
              <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files[0] && importConfig(e.target.files[0])} />
            </div>
          </div>
          <div className="card">
            <h3>Summary</h3>
            <ul>
              <li>Student permissions blocked: {Object.values(m.roles.student || {}).reduce((s, a) => s + Object.keys(a).length, 0)}</li>
              <li>Students with custom access: {Object.values(m.users).filter((u) => u.custom).length}</li>
              <li>Disabled accounts: {Object.values(m.users).filter((u) => u.disabled).length}</li>
              <li>Packages: {packages.length} ({packages.filter((p) => p.visible !== false).length} visible)</li>
              <li>Packages control access: {m.settings.packagesControlAccess ? 'ON' : 'OFF'}</li>
            </ul>
            <button className="btn small" onClick={() => window.confirm('Reset ALL admin settings on this computer (permissions, packages)?') && writePerms(null) }>↺ Reset all admin settings</button>
            <p className="muted small">For real multi-device accounts and central control, UpSkillr needs a backend server (like the bk-steels API). This screen is ready to move to one.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_PACKAGES };
