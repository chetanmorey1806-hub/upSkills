import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { School, Plus, Copy, Users, Megaphone, ClipboardList, Download, Trash2, Send, KeyRound, CheckCircle2, Clock, ShieldCheck, ArrowLeft, Search } from 'lucide-react';
import { supabase, supaMode } from '../supabase.js';
import { useAuth } from '../auth.js';
import { OnlineOnly } from './Community.jsx';
import { downloadFile } from '../components/careerUtils.js';
import RichText from '../components/RichText.jsx';

const online = (me) => supaMode && me?.server;
const isStaff = (me) => me?.role === 'teacher' || me?.role === 'admin';
const fmtDate = (d) => (d ? new Date(`${String(d).slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const today = () => new Date().toISOString().slice(0, 10);

function useRows(fetcher, deps, tables = []) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => { const { data, error: e } = await fetcher(); if (e) setError(e.message); else { setError(''); setRows(data || []); } }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
    if (!tables.length) return undefined;
    const ch = supabase.channel(`cls-${tables.join('-')}-${Math.random().toString(36).slice(2)}`);
    tables.forEach((table) => ch.on('postgres_changes', { event: '*', schema: 'public', table }, () => load()));
    ch.subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]); // eslint-disable-line react-hooks/exhaustive-deps
  return [rows, load, error];
}

/* ============================== entry: teacher or student view ============================== */
export default function Classroom() {
  const me = useAuth();
  if (!online(me)) return <div><div className="page-head"><h1><School size={26} /> My Class</h1></div><OnlineOnly what="The classroom" /></div>;
  return isStaff(me) ? <TeacherPanel me={me} /> : <StudentClass me={me} />;
}

/* ============================== student ============================== */
function StudentClass({ me }) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [batches, reload] = useRows(() => supabase.from('batch_members').select('batch_id, batches(id, name, code, teacher:profiles!batches_teacher_id_fkey(name))').eq('user_id', me.id), [me.id]);
  const join = async () => {
    setMsg('');
    const { error } = await supabase.rpc('join_batch', { c: code.trim() });
    if (error) setMsg(error.message.replace(/^.*?: /, '')); else { setCode(''); setMsg('Joined! Your teacher can now see your progress.'); reload(); }
  };
  const list = (batches || []).map((b) => b.batches).filter(Boolean);
  return (
    <div>
      <div className="page-head">
        <h1><School size={26} /> My Class</h1>
        <p className="muted">Join your batch with the code from your teacher to see announcements and assignments. Your teacher sees your progress (lessons, XP, streak, tests).</p>
        <div className="row-btns cls-join">
          <KeyRound size={18} /><input className="input" placeholder="Batch code (e.g. A1B2C3)" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={12} onKeyDown={(e) => e.key === 'Enter' && code.trim() && join()} />
          <button className="btn primary" disabled={!code.trim()} onClick={join}>Join batch</button>
        </div>
        {msg && <p className="small">{msg}</p>}
      </div>
      {batches === null ? <p className="muted">Loading…</p> : !list.length ? <div className="card empty-state"><Users size={34} /><p>You have not joined a batch yet. Ask your teacher for the batch code.</p></div>
        : list.map((b) => <StudentBatch key={b.id} b={b} me={me} onLeave={reload} />)}
    </div>
  );
}

function StudentBatch({ b, me, onLeave }) {
  const [anns] = useRows(() => supabase.from('announcements').select('id, title, body, created_at').eq('batch_id', b.id).order('created_at', { ascending: false }).limit(20), [b.id], ['announcements']);
  const [asgs] = useRows(() => supabase.from('assignments').select('id, title, description, link, due_at, created_at').eq('batch_id', b.id).order('created_at', { ascending: false }), [b.id], ['assignments']);
  const [subs, reloadSubs] = useRows(() => supabase.from('submissions').select('*').eq('user_id', me.id), [me.id], ['submissions']);
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState({ note: '', link: '' });
  const leave = async () => { if (window.confirm(`Leave ${b.name}?`)) { await supabase.from('batch_members').delete().eq('batch_id', b.id).eq('user_id', me.id); onLeave(); } };
  const mySub = (a) => (subs || []).find((s) => s.assignment_id === a.id);
  const submit = async (a) => {
    const ex = mySub(a);
    const row = { assignment_id: a.id, note: form.note.trim(), link: form.link.trim(), submitted_at: new Date().toISOString() };
    const { error } = ex ? await supabase.from('submissions').update(row).eq('id', ex.id) : await supabase.from('submissions').insert(row);
    if (error) window.alert(error.message); else { setOpen(null); reloadSubs(); }
  };
  return (
    <section className="cls-batch">
      <div className="set-group-head"><h2 className="section-title">{b.name}</h2><span className="muted small">Teacher: {b.teacher?.name} · <button className="link-btn danger" onClick={leave}>Leave</button></span></div>
      <div className="grid2">
        <div className="card">
          <h3><Megaphone size={17} /> Announcements</h3>
          {(anns || []).map((a) => <div key={a.id} className="cls-ann"><b>{a.title}</b><span className="muted small">{fmtDate(a.created_at)}</span>{a.body && <RichText text={a.body} />}</div>)}
          {anns && !anns.length && <p className="muted small">No announcements yet.</p>}
        </div>
        <div className="card">
          <h3><ClipboardList size={17} /> Assignments</h3>
          {(asgs || []).map((a) => {
            const s = mySub(a);
            const late = a.due_at && !s && a.due_at < today();
            return (
              <div key={a.id} className={`cls-asg ${s ? 'done' : late ? 'late' : ''}`}>
                <div className="db-part-top"><b>{a.title}</b>{s ? <span className="badge ok"><CheckCircle2 size={12} /> Submitted</span> : a.due_at ? <span className={`badge ${late ? 'bad' : ''}`}><Clock size={12} /> Due {fmtDate(a.due_at)}</span> : null}</div>
                {a.description && <RichText text={a.description} />}
                {a.link && <Link to={a.link.replace(/^.*#/, '')} className="small">Open the lesson / test →</Link>}
                {s?.grade && <div className="explain ok">Grade: <b>{s.grade}</b>{s.feedback && ` — ${s.feedback}`}</div>}
                {open === a.id ? (
                  <div className="jc-form">
                    <label>Note to teacher<textarea className="input" rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
                    <label>Link (GitHub, live site, drive…)<input className="input" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></label>
                    <div className="row-btns"><button className="btn primary small" onClick={() => submit(a)}><Send size={14} /> {s ? 'Update submission' : 'Submit'}</button><button className="btn small" onClick={() => setOpen(null)}>Cancel</button></div>
                  </div>
                ) : <button className="btn small" onClick={() => { setOpen(a.id); setForm({ note: s?.note || '', link: s?.link || '' }); }}>{s ? 'Edit submission' : 'Mark as done / submit'}</button>}
              </div>
            );
          })}
          {asgs && !asgs.length && <p className="muted small">No assignments yet.</p>}
        </div>
      </div>
    </section>
  );
}

/* ============================== teacher ============================== */
function TeacherPanel({ me }) {
  const [batches, reload] = useRows(() => {
    let q = supabase.from('batches').select('id, name, code, teacher_id, created_at, teacher:profiles!batches_teacher_id_fkey(name)').order('created_at', { ascending: false });
    if (me.role !== 'admin') q = q.eq('teacher_id', me.id);
    return q;
  }, [me.id, me.role]);
  const [sel, setSel] = useState(null);
  const [name, setName] = useState('');
  const create = async () => {
    if (name.trim().length < 2) return;
    const { data, error } = await supabase.from('batches').insert({ name: name.trim() }).select('id').single();
    if (error) window.alert(error.message); else { setName(''); await reload(); setSel(data.id); }
  };
  const b = (batches || []).find((x) => x.id === sel);
  if (b) return <BatchDetail b={b} me={me} onBack={() => { setSel(null); reload(); }} />;
  return (
    <div>
      <div className="page-head">
        <h1><School size={26} /> Teacher Panel</h1>
        <p className="muted">Create a batch, share its code with students, then post announcements, give assignments, grade submissions and follow every student's progress live.</p>
        <div className="row-btns cls-join"><input className="input" placeholder="New batch name (e.g. Java FS – Jan 2027)" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()} /><button className="btn primary" onClick={create} disabled={name.trim().length < 2}><Plus size={15} /> Create batch</button></div>
      </div>
      {batches === null ? <p className="muted">Loading…</p> : (
        <div className="grid3">
          {batches.map((x) => (
            <button key={x.id} className="card cls-card" onClick={() => setSel(x.id)}>
              <h3>{x.name}</h3>
              <div className="cls-code"><KeyRound size={14} /> {x.code}</div>
              <div className="muted small">{me.role === 'admin' && x.teacher_id !== me.id ? `Teacher: ${x.teacher?.name} · ` : ''}Created {fmtDate(x.created_at)}</div>
            </button>
          ))}
          {!batches.length && <p className="muted">No batches yet. Create your first batch above.</p>}
        </div>
      )}
      {me.role === 'admin' && <p><Link to="/admin/users" className="btn"><ShieldCheck size={15} /> Manage users &amp; roles</Link></p>}
    </div>
  );
}

function BatchDetail({ b, me, onBack }) {
  const [tab, setTab] = useState('students');
  const [copied, setCopied] = useState(false);
  const [members] = useRows(async () => {
    const { data: m, error } = await supabase.from('batch_members').select('user_id, joined_at').eq('batch_id', b.id);
    if (error) return { error };
    if (!m.length) return { data: [] };
    const { data: p, error: e2 } = await supabase.from('profiles').select('id, username, name, xp, level, streak, lessons_done, tests_passed, stats_at').in('id', m.map((x) => x.user_id));
    return { data: (p || []).map((x) => ({ ...x, joined_at: m.find((y) => y.user_id === x.id)?.joined_at })).sort((a, c) => c.xp - a.xp), error: e2 };
  }, [b.id], ['profiles', 'batch_members']);
  const [anns, reloadAnns] = useRows(() => supabase.from('announcements').select('id, title, body, created_at').eq('batch_id', b.id).order('created_at', { ascending: false }), [b.id]);
  const [asgs, reloadAsgs] = useRows(() => supabase.from('assignments').select('id, title, description, link, due_at, created_at').eq('batch_id', b.id).order('created_at', { ascending: false }), [b.id]);
  const [annForm, setAnnForm] = useState({ title: '', body: '' });
  const [asgForm, setAsgForm] = useState({ title: '', description: '', link: '', due_at: '' });
  const [openAsg, setOpenAsg] = useState(null);
  const [q, setQ] = useState('');
  const copy = async () => { try { await navigator.clipboard.writeText(b.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } };
  const postAnn = async () => { if (!annForm.title.trim()) return; const { error } = await supabase.from('announcements').insert({ batch_id: b.id, ...annForm }); if (error) window.alert(error.message); else { setAnnForm({ title: '', body: '' }); reloadAnns(); } };
  const postAsg = async () => { if (!asgForm.title.trim()) return; const { error } = await supabase.from('assignments').insert({ batch_id: b.id, ...asgForm, due_at: asgForm.due_at || null }); if (error) window.alert(error.message); else { setAsgForm({ title: '', description: '', link: '', due_at: '' }); reloadAsgs(); } };
  const delBatch = async () => { if (window.confirm(`Delete batch "${b.name}" with all its announcements and assignments?`)) { await supabase.from('batches').delete().eq('id', b.id); onBack(); } };
  const removeMember = async (m) => { if (window.confirm(`Remove ${m.name} from this batch?`)) await supabase.from('batch_members').delete().eq('batch_id', b.id).eq('user_id', m.id); };
  const csv = () => {
    const cols = ['name', 'username', 'xp', 'level', 'streak', 'lessons_done', 'tests_passed', 'stats_at', 'joined_at'];
    downloadFile(`${b.name.replace(/\W+/g, '-')}-report.csv`, [cols.join(','), ...(members || []).map((m) => cols.map((c) => `"${String(m[c] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n'), 'text/csv');
  };
  const shown = (members || []).filter((m) => !q || `${m.name} ${m.username}`.toLowerCase().includes(q.toLowerCase()));
  const activeWeek = (members || []).filter((m) => m.stats_at && Date.now() - new Date(m.stats_at).getTime() < 7 * 86400000).length;
  return (
    <div>
      <button className="btn small" onClick={onBack}><ArrowLeft size={14} /> All batches</button>
      <div className="page-head" style={{ marginTop: '.8rem' }}>
        <h1>{b.name}</h1>
        <div className="row-btns"><span className="cls-code big"><KeyRound size={16} /> Join code: <b>{b.code}</b></span><button className="btn small" onClick={copy}><Copy size={14} /> {copied ? 'Copied' : 'Copy code'}</button><button className="link-btn danger" onClick={delBatch}><Trash2 size={14} /> Delete batch</button></div>
        <p className="muted small">Students open <b>My Class</b>, enter this code and join.</p>
      </div>
      <div className="ts-stats">
        <div className="card"><b>{members?.length ?? '–'}</b><span>Students</span></div>
        <div className="card"><b>{activeWeek}</b><span>Active this week</span></div>
        <div className="card"><b>{members?.length ? Math.round(members.reduce((s, m) => s + m.lessons_done, 0) / members.length) : 0}</b><span>Avg lessons done</span></div>
        <div className="card"><b>{asgs?.length ?? 0}</b><span>Assignments</span></div>
      </div>
      <div className="tabs">
        {[['students', Users, 'Students'], ['announcements', Megaphone, 'Announcements'], ['assignments', ClipboardList, 'Assignments']].map(([k, I, l]) => <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}><I size={15} /> {l}</button>)}
      </div>
      {tab === 'students' && (
        <div className="card">
          <div className="db-card-head"><div className="sp-search"><Search size={16} /><input className="input" placeholder="Search students…" value={q} onChange={(e) => setQ(e.target.value)} /></div><button className="btn small" onClick={csv} disabled={!members?.length}><Download size={14} /> Download report (CSV)</button></div>
          <div className="table-wrap"><table className="data-table">
            <thead><tr><th>Student</th><th>XP</th><th>Level</th><th>Streak</th><th>Lessons</th><th>Tests passed</th><th>Last active</th><th /></tr></thead>
            <tbody>{shown.map((m) => (
              <tr key={m.id}><td><b>{m.name}</b><div className="muted small">@{m.username}</div></td><td>{m.xp}</td><td>{m.level}</td><td>{m.streak}</td><td>{m.lessons_done}</td><td>{m.tests_passed}</td>
                <td className={m.stats_at && Date.now() - new Date(m.stats_at).getTime() < 3 * 86400000 ? 'jc-ok' : 'muted'}>{m.stats_at ? fmtDate(m.stats_at) : 'never'}</td>
                <td><button className="link-btn danger" onClick={() => removeMember(m)} title="Remove from batch"><Trash2 size={13} /></button></td></tr>
            ))}</tbody>
          </table></div>
          {members && !members.length && <p className="muted">No students yet. Share the join code <b>{b.code}</b>.</p>}
        </div>
      )}
      {tab === 'announcements' && (
        <>
          <div className="card jc-form">
            <label>Title<input className="input" value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} placeholder="e.g. Test on Friday: Core Java Module 3" /></label>
            <label>Message<textarea className="input" rows={3} value={annForm.body} onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })} /></label>
            <button className="btn primary" disabled={!annForm.title.trim()} onClick={postAnn}><Megaphone size={15} /> Post announcement</button>
          </div>
          {(anns || []).map((a) => <div key={a.id} className="card cls-ann"><div className="db-part-top"><b>{a.title}</b><span className="muted small">{fmtDate(a.created_at)} <button className="link-btn danger" onClick={async () => { await supabase.from('announcements').delete().eq('id', a.id); reloadAnns(); }}><Trash2 size={13} /></button></span></div>{a.body && <RichText text={a.body} />}</div>)}
        </>
      )}
      {tab === 'assignments' && (
        <>
          <div className="card jc-form">
            <div className="rb-2">
              <label>Title<input className="input" value={asgForm.title} onChange={(e) => setAsgForm({ ...asgForm, title: e.target.value })} placeholder="e.g. Finish Core Java Day 10 + quiz" /></label>
              <label>Due date<input className="input" type="date" value={asgForm.due_at} onChange={(e) => setAsgForm({ ...asgForm, due_at: e.target.value })} /></label>
            </div>
            <label>Instructions<textarea className="input" rows={3} value={asgForm.description} onChange={(e) => setAsgForm({ ...asgForm, description: e.target.value })} /></label>
            <label>Link in the app (optional) — e.g. #/track/corejava/day-10-break-continue-patterns or #/tools/test-series/corejava<input className="input" value={asgForm.link} onChange={(e) => setAsgForm({ ...asgForm, link: e.target.value })} /></label>
            <button className="btn primary" disabled={!asgForm.title.trim()} onClick={postAsg}><Plus size={15} /> Give assignment</button>
          </div>
          {(asgs || []).map((a) => (
            <div key={a.id} className="card">
              <div className="db-part-top"><b>{a.title}</b><span className="muted small">{a.due_at ? `Due ${fmtDate(a.due_at)}` : ''} <button className="link-btn danger" onClick={async () => { if (window.confirm('Delete this assignment?')) { await supabase.from('assignments').delete().eq('id', a.id); reloadAsgs(); } }}><Trash2 size={13} /></button></span></div>
              {a.description && <RichText text={a.description} />}
              <button className="btn small" onClick={() => setOpenAsg(openAsg === a.id ? null : a.id)}>{openAsg === a.id ? 'Hide submissions' : 'View submissions & grade'}</button>
              {openAsg === a.id && <Submissions a={a} members={members || []} />}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function Submissions({ a, members }) {
  const [subs, reload] = useRows(() => supabase.from('submissions').select('*').eq('assignment_id', a.id), [a.id], ['submissions']);
  const [edit, setEdit] = useState({});
  const save = async (s) => { const e = edit[s.id] || {}; const { error } = await supabase.from('submissions').update({ grade: e.grade ?? s.grade, feedback: e.feedback ?? s.feedback, graded_at: new Date().toISOString() }).eq('id', s.id); if (error) window.alert(error.message); else reload(); };
  if (!subs) return <p className="muted small">Loading…</p>;
  const pending = members.filter((m) => !subs.some((s) => s.user_id === m.id));
  return (
    <div className="cls-subs">
      <p className="small"><b>{subs.length}</b> submitted · <b>{pending.length}</b> pending{pending.length ? `: ${pending.map((m) => m.name).join(', ')}` : ''}</p>
      {subs.map((s) => {
        const m = members.find((x) => x.id === s.user_id);
        const e = edit[s.id] || {};
        return (
          <div key={s.id} className="cls-sub">
            <div className="db-part-top"><b>{m?.name || 'Student'}</b><span className="muted small">{fmtDate(s.submitted_at)}{a.due_at && s.submitted_at.slice(0, 10) > a.due_at ? ' · late' : ''}</span></div>
            {s.note && <p className="small">{s.note}</p>}
            {s.link && <a className="small" href={s.link} target="_blank" rel="noreferrer">{s.link}</a>}
            <div className="cls-grade"><input className="input" placeholder="Grade (e.g. A, 8/10)" value={e.grade ?? s.grade} onChange={(ev) => setEdit({ ...edit, [s.id]: { ...e, grade: ev.target.value } })} /><input className="input" placeholder="Feedback" value={e.feedback ?? s.feedback} onChange={(ev) => setEdit({ ...edit, [s.id]: { ...e, feedback: ev.target.value } })} /><button className="btn small primary" onClick={() => save(s)}>Save</button></div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================== admin: users & roles ============================== */
export function AdminUsers() {
  const me = useAuth();
  const [q, setQ] = useState('');
  const [users, reload] = useRows(() => supabase.from('profiles').select('id, username, name, role, active, xp, lessons_done, stats_at, created_at').order('created_at', { ascending: false }).limit(1000), []);
  if (!online(me)) return <OnlineOnly what="User management" />;
  if (me.role !== 'admin') return <div className="card"><h3>Admins only</h3><p className="muted">Only the admin can manage users.</p></div>;
  const setRole = async (u, role) => { const { error } = await supabase.from('profiles').update({ role }).eq('id', u.id); if (error) window.alert(error.message); reload(); };
  const setActive = async (u, active) => { const { error } = await supabase.from('profiles').update({ active }).eq('id', u.id); if (error) window.alert(error.message); reload(); };
  const shown = (users || []).filter((u) => !q || `${u.name} ${u.username}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="page-head">
        <h1><ShieldCheck size={26} /> Users &amp; Roles</h1>
        <p className="muted">Everyone who registered. Make trainers <b>Teacher</b> (they can create batches, give assignments, grade and upload study material). Disable an account to block sign-in.</p>
      </div>
      <div className="ts-stats">
        {['student', 'teacher', 'admin'].map((r) => <div key={r} className="card"><b>{(users || []).filter((u) => u.role === r).length}</b><span>{r[0].toUpperCase() + r.slice(1)}s</span></div>)}
        <div className="card"><b>{(users || []).filter((u) => u.stats_at && Date.now() - new Date(u.stats_at).getTime() < 7 * 86400000).length}</b><span>Active this week</span></div>
      </div>
      <div className="card">
        <div className="sp-search"><Search size={16} /><input className="input" placeholder="Search by name or username…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Name</th><th>Role</th><th>XP</th><th>Lessons</th><th>Joined</th><th>Status</th></tr></thead>
          <tbody>{shown.map((u) => (
            <tr key={u.id} className={u.active ? '' : 'muted'}>
              <td><b>{u.name}</b><div className="muted small">@{u.username}</div></td>
              <td><select value={u.role} disabled={u.id === me.id} onChange={(e) => setRole(u, e.target.value)}><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select></td>
              <td>{u.xp}</td><td>{u.lessons_done}</td><td>{fmtDate(u.created_at)}</td>
              <td>{u.id === me.id ? 'You' : <button className={`btn small ${u.active ? '' : 'primary'}`} onClick={() => setActive(u, !u.active)}>{u.active ? 'Disable' : 'Enable'}</button>}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
    </div>
  );
}
