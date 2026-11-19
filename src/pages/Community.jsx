import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Trophy, Flame, Medal, Users, MessagesSquare, Plus, CheckCircle2, Trash2, Search, Send, ArrowLeft, Briefcase, CloudOff, Crown, BadgeCheck } from 'lucide-react';
import { supabase, supaMode } from '../supabase.js';
import { useAuth } from '../auth.js';
import { tracks, trackOrder } from '../data/index.js';
import RichText from '../components/RichText.jsx';

const ago = (iso) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60); if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24); if (d < 30) return `${d} d ago`;
  return new Date(iso).toLocaleDateString();
};
const initials = (n) => String(n || '?').replace(/^(er|dr|mr|mrs|ms|prof)\.?\s+/i, '').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const RoleTag = ({ role }) => (role === 'admin' ? <span className="cm-role admin"><Crown size={11} /> Admin</span> : role === 'teacher' ? <span className="cm-role teacher"><BadgeCheck size={11} /> Teacher</span> : null);
const Ava = ({ name, size = 34 }) => <span className="cm-ava" style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials(name)}</span>;

// Shown when the app is not connected to Supabase or the user signed in with a local account.
export function OnlineOnly({ what }) {
  const me = useAuth();
  if (supaMode && me?.server) return null;
  return (
    <div className="card empty-state">
      <CloudOff size={34} />
      <h3>{what} needs the online account</h3>
      <p className="muted">{supaMode ? 'Sign out and sign in again with your online account.' : 'This feature works when the app is connected to Supabase (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).'}</p>
    </div>
  );
}
const online = (me) => supaMode && me?.server;

// live refresh helper: re-run `load` when any of the tables change
function useLive(tables, load, deps) {
  useEffect(() => {
    if (!supaMode) return undefined;
    load();
    let t = null;
    const ch = supabase.channel(`live-${tables.join('-')}-${Math.random().toString(36).slice(2)}`);
    tables.forEach((table) => ch.on('postgres_changes', { event: '*', schema: 'public', table }, () => { clearTimeout(t); t = setTimeout(load, 400); }));
    ch.subscribe();
    return () => { clearTimeout(t); supabase.removeChannel(ch); };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/* ============================== Leaderboard ============================== */
export function Leaderboard() {
  const me = useAuth();
  const [scope, setScope] = useState('all');
  const [batches, setBatches] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!online(me)) return;
    supabase.from('batches').select('id, name').order('created_at').then(({ data }) => setBatches(data || []));
  }, [me?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    if (!online(me)) return;
    setError('');
    let q = supabase.from('profiles').select('id, username, name, role, xp, level, streak, lessons_done, tests_passed').eq('active', true).eq('role', 'student').order('xp', { ascending: false }).limit(100);
    if (scope !== 'all') {
      const { data: mem } = await supabase.from('batch_members').select('user_id').eq('batch_id', scope);
      q = q.in('id', (mem || []).map((m) => m.user_id).concat(me.id));
    }
    const { data, error: e } = await q;
    if (e) setError(e.message); else setRows(data || []);
    setLoading(false);
  }, [scope, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useLive(['profiles'], load, [scope, me?.id]);
  if (!online(me)) return <div><div className="page-head"><h1><Trophy size={26} /> Leaderboard</h1></div><OnlineOnly what="The leaderboard" /></div>;
  const myRank = rows.findIndex((r) => r.id === me.id);
  const top = rows.slice(0, 3);
  return (
    <div>
      <div className="page-head">
        <h1><Trophy size={26} /> Leaderboard</h1>
        <p className="muted">Live ranking by XP. Earn XP by finishing lessons, quizzes, tests, projects, revision and daily challenges. Updates every few seconds.</p>
        <div className="chips">
          <button className={`chip ${scope === 'all' ? 'active' : ''}`} onClick={() => setScope('all')}><Users size={14} /> All students</button>
          {batches.map((b) => <button key={b.id} className={`chip ${scope === b.id ? 'active' : ''}`} onClick={() => setScope(b.id)}>{b.name}</button>)}
        </div>
      </div>
      {error && <div className="explain bad">{error}</div>}
      {loading ? <p className="muted">Loading…</p> : (
        <>
          {top.length > 0 && (
            <div className="lb-podium">
              {[1, 0, 2].filter((i) => top[i]).map((i) => (
                <div key={top[i].id} className={`lb-pod p${i + 1} ${top[i].id === me.id ? 'me' : ''}`}>
                  <Medal size={26} className="lb-medal" />
                  <Ava name={top[i].name} size={52} />
                  <b>{top[i].name}</b>
                  <span>{top[i].xp} XP · Lv {top[i].level}</span>
                  <div className="lb-step">{i + 1}</div>
                </div>
              ))}
            </div>
          )}
          {myRank >= 3 && <div className="card lb-mine">Your rank: <b>#{myRank + 1}</b> of {rows.length} · {rows[myRank].xp} XP</div>}
          <div className="card">
            <div className="table-wrap"><table className="data-table lb-table">
              <thead><tr><th>#</th><th>Student</th><th>XP</th><th>Level</th><th><Flame size={14} /> Streak</th><th>Lessons</th><th>Tests passed</th></tr></thead>
              <tbody>{rows.map((r, i) => (
                <tr key={r.id} className={r.id === me.id ? 'lb-me' : ''}>
                  <td>{i + 1}</td>
                  <td><span className="lb-name"><Ava name={r.name} size={28} /> <span><b>{r.name}</b><small className="muted">@{r.username}</small></span></span></td>
                  <td><b>{r.xp}</b></td><td>{r.level}</td><td>{r.streak}</td><td>{r.lessons_done}</td><td>{r.tests_passed}</td>
                </tr>
              ))}</tbody>
            </table></div>
            {!rows.length && <p className="muted">No students yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================== Doubt Forum ============================== */
const THREAD_COLS = 'id, title, body, course, lesson_key, solved, reply_count, last_activity, created_at, author_id, author:profiles!forum_threads_author_id_fkey(name, username, role)';

export function Forum() {
  const me = useAuth();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [course, setCourse] = useState(params.get('course') || '');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState(params.get('new') ? { title: params.get('title') || '', body: params.get('body') || '', course: params.get('course') || '', lesson_key: params.get('lesson') || '' } : null);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    if (!online(me)) return;
    let qq = supabase.from('forum_threads').select(THREAD_COLS).order('last_activity', { ascending: false }).limit(100);
    if (course) qq = qq.eq('course', course);
    if (filter === 'open') qq = qq.eq('solved', false);
    if (filter === 'mine') qq = qq.eq('author_id', me.id);
    if (q.trim()) qq = qq.ilike('title', `%${q.trim().replace(/[%_]/g, '')}%`);
    const { data } = await qq;
    setList(data || []);
  }, [course, filter, q, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useLive(['forum_threads'], load, [course, filter, q, me?.id]);
  if (!online(me)) return <div><div className="page-head"><h1><MessagesSquare size={26} /> Doubt Forum</h1></div><OnlineOnly what="The doubt forum" /></div>;
  const post = async () => {
    setErr('');
    if (form.title.trim().length < 5) { setErr('Write a clear question title (at least 5 characters).'); return; }
    const { data, error } = await supabase.from('forum_threads').insert({ title: form.title.trim(), body: form.body.trim(), course: form.course, lesson_key: form.lesson_key }).select('id').single();
    if (error) { setErr(error.message); return; }
    setForm(null); setParams({}); nav(`/community/forum/${data.id}`);
  };
  return (
    <div>
      <div className="page-head">
        <h1><MessagesSquare size={26} /> Doubt Forum</h1>
        <p className="muted">Ask any doubt — classmates and teachers answer. Mark the best answer so others can learn from it too.</p>
        <button className="btn primary" onClick={() => setForm({ title: '', body: '', course, lesson_key: '' })}><Plus size={15} /> Ask a question</button>
      </div>
      {form && (
        <div className="card jc-form">
          <h3>Ask a question</h3>
          <label>Question (title)<input className="input" maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Why does my Java loop print one extra line?" /></label>
          <label>Details (code, error message, what you tried)<textarea className="input" rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
          <label>Course<select className="input" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}><option value="">General</option>{trackOrder.filter((k) => tracks[k]).map((k) => <option key={k} value={k}>{tracks[k].name}</option>)}</select></label>
          {err && <div className="explain bad">{err}</div>}
          <div className="row-btns"><button className="btn primary" onClick={post}><Send size={15} /> Post question</button><button className="btn" onClick={() => { setForm(null); setParams({}); }}>Cancel</button></div>
        </div>
      )}
      <div className="quiz-settings">
        <div className="sp-search"><Search size={16} /><input className="input" placeholder="Search questions…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <label>Course <select value={course} onChange={(e) => setCourse(e.target.value)}><option value="">All</option>{trackOrder.filter((k) => tracks[k]).map((k) => <option key={k} value={k}>{tracks[k].short}</option>)}</select></label>
        <div className="chips">{[['all', 'All'], ['open', 'Unanswered'], ['mine', 'My questions']].map(([k, l]) => <button key={k} className={`chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>{l}</button>)}</div>
      </div>
      <div className="fm-list">
        {list.map((t) => (
          <Link key={t.id} to={`/community/forum/${t.id}`} className={`card fm-item ${t.solved ? 'solved' : ''}`}>
            <div className="fm-count"><b>{t.reply_count}</b><span>{t.reply_count === 1 ? 'reply' : 'replies'}</span></div>
            <div className="fm-main">
              <b>{t.solved && <CheckCircle2 size={15} className="fm-ok" />} {t.title}</b>
              <div className="muted small">{t.author?.name} {t.course && `· ${tracks[t.course]?.short || t.course}`} · active {ago(t.last_activity)}</div>
            </div>
          </Link>
        ))}
        {!list.length && <p className="muted">No questions yet. Be the first to ask!</p>}
      </div>
    </div>
  );
}

export function ForumThread() {
  const { id } = useParams();
  const me = useAuth();
  const nav = useNavigate();
  const [t, setT] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reply, setReply] = useState('');
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    if (!online(me)) return;
    const [{ data: th }, { data: ps }] = await Promise.all([
      supabase.from('forum_threads').select(THREAD_COLS).eq('id', id).single(),
      supabase.from('forum_posts').select('id, body, is_answer, created_at, author_id, author:profiles!forum_posts_author_id_fkey(name, username, role)').eq('thread_id', id).order('id'),
    ]);
    setT(th || false); setPosts(ps || []);
  }, [id, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useLive(['forum_posts', 'forum_threads'], load, [id, me?.id]);
  if (!online(me)) return <OnlineOnly what="The doubt forum" />;
  if (t === false) return <div className="card"><p>This question was deleted.</p><Link className="btn" to="/community/forum">Back to forum</Link></div>;
  if (!t) return <p className="muted">Loading…</p>;
  const staff = me.role === 'admin' || me.role === 'teacher';
  const canManage = staff || t.author_id === me.id;
  const send = async () => {
    setErr('');
    if (!reply.trim()) return;
    const { error } = await supabase.from('forum_posts').insert({ thread_id: Number(id), body: reply.trim() });
    if (error) setErr(error.message); else { setReply(''); load(); }
  };
  const markAnswer = async (p) => {
    await supabase.from('forum_posts').update({ is_answer: !p.is_answer }).eq('id', p.id);
    if (!p.is_answer) await supabase.from('forum_threads').update({ solved: true }).eq('id', t.id);
    load();
  };
  const delPost = async (p) => { if (window.confirm('Delete this reply?')) { await supabase.from('forum_posts').delete().eq('id', p.id); load(); } };
  const delThread = async () => { if (window.confirm('Delete this question and all replies?')) { await supabase.from('forum_threads').delete().eq('id', t.id); nav('/community/forum'); } };
  return (
    <div>
      <Link to="/community/forum" className="btn small"><ArrowLeft size={14} /> All questions</Link>
      <div className="card fm-thread">
        <div className="fm-head"><Ava name={t.author?.name} /><div><b>{t.author?.name}</b> <RoleTag role={t.author?.role} /><div className="muted small">asked {ago(t.created_at)}{t.course && ` · ${tracks[t.course]?.name || t.course}`}</div></div>{t.solved && <span className="badge ok"><CheckCircle2 size={13} /> Solved</span>}</div>
        <h2>{t.title}</h2>
        {t.body && <div className="fm-body"><RichText text={t.body} /></div>}
        {canManage && (
          <div className="row-btns">
            <button className="btn small" onClick={async () => { await supabase.from('forum_threads').update({ solved: !t.solved }).eq('id', t.id); load(); }}><CheckCircle2 size={14} /> {t.solved ? 'Mark as unsolved' : 'Mark as solved'}</button>
            <button className="link-btn danger" onClick={delThread}><Trash2 size={14} /> Delete</button>
          </div>
        )}
      </div>
      <h3 className="section-title">{posts.length} {posts.length === 1 ? 'answer' : 'answers'}</h3>
      {[...posts].sort((a, b) => b.is_answer - a.is_answer).map((p) => (
        <div key={p.id} className={`card fm-post ${p.is_answer ? 'best' : ''}`}>
          <div className="fm-head"><Ava name={p.author?.name} size={30} /><div><b>{p.author?.name}</b> <RoleTag role={p.author?.role} /><div className="muted small">{ago(p.created_at)}</div></div>{p.is_answer && <span className="badge ok"><CheckCircle2 size={13} /> Best answer</span>}</div>
          <div className="fm-body"><RichText text={p.body} /></div>
          <div className="row-btns">
            {canManage && <button className="btn small" onClick={() => markAnswer(p)}>{p.is_answer ? 'Unmark best answer' : 'Mark as best answer'}</button>}
            {(staff || p.author_id === me.id) && <button className="link-btn danger" onClick={() => delPost(p)}><Trash2 size={14} /></button>}
          </div>
        </div>
      ))}
      <div className="card jc-form">
        <label>Your answer<textarea className="input" rows={5} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Explain step by step. Paste code if it helps." /></label>
        {err && <div className="explain bad">{err}</div>}
        <button className="btn primary" disabled={!reply.trim()} onClick={send}><Send size={15} /> Post answer</button>
      </div>
    </div>
  );
}

/* ============================== Interview Experience Bank ============================== */
export function ExperienceBank() {
  const me = useAuth();
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const load = useCallback(async () => {
    if (!online(me)) return;
    let qq = supabase.from('experiences').select('id, company, role, interview_date, mode, result, rounds, tips, created_at, author_id, author:profiles!experiences_author_id_fkey(name, username, role)').order('created_at', { ascending: false }).limit(200);
    if (q.trim()) qq = qq.ilike('company', `%${q.trim().replace(/[%_]/g, '')}%`);
    const { data } = await qq;
    setList(data || []);
  }, [q, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);
  const companies = useMemo(() => Object.entries(list.reduce((m, e) => { m[e.company] = (m[e.company] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 12), [list]);
  if (!online(me)) return <div><div className="page-head"><h1><Briefcase size={26} /> Interview Experience Bank</h1></div><OnlineOnly what="The experience bank" /></div>;
  const del = async (e) => { if (window.confirm('Delete this experience from the bank?')) { await supabase.from('experiences').delete().eq('id', e.id); load(); } };
  return (
    <div>
      <div className="page-head">
        <h1><Briefcase size={26} /> Interview Experience Bank</h1>
        <p className="muted">Real interview experiences shared by your seniors and classmates: rounds, questions and tips. Share yours from your <Link to="/career/experiences">Interview Journal</Link> with “Publish to bank”.</p>
      </div>
      <div className="sp-search"><Search size={16} /><input className="input" placeholder="Search a company…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {companies.length > 0 && <div className="chips">{companies.map(([c, n]) => <button key={c} className={`chip ${q === c ? 'active' : ''}`} onClick={() => setQ(q === c ? '' : c)}>{c} ({n})</button>)}</div>}
      {list.map((e) => (
        <details key={e.id} className="card qa">
          <summary><span className="qa-q">{e.company} — {e.role || 'Interview'}</span><span className={`badge ${e.result === 'Selected' ? 'ok' : ''}`}>{e.result || '—'}</span></summary>
          <div className="qa-a">
            <div className="muted small">By {e.author?.name} · {e.mode}{e.interview_date ? ` · ${e.interview_date}` : ''}</div>
            {(e.rounds || []).map((r, i) => <div key={i} className="ij-round"><b>Round {i + 1}: {r.name}</b> {r.difficulty && <span className={`lvl lvl-${r.difficulty}`}>{r.difficulty}</span>}<ul>{String(r.questions || '').split('\n').filter((x) => x.trim()).map((x, k) => <li key={k}>{x}</li>)}</ul>{r.notes && <div className="muted small">{r.notes}</div>}</div>)}
            {e.tips && <div className="tip">{e.tips}</div>}
            {(e.author_id === me.id || me.role === 'admin' || me.role === 'teacher') && <button className="link-btn danger" onClick={() => del(e)}><Trash2 size={14} /> Delete</button>}
          </div>
        </details>
      ))}
      {!list.length && <p className="muted">No experiences yet. After your next interview, publish it from your journal to help your juniors.</p>}
    </div>
  );
}

// Used by the Interview Journal: publish one entry to the shared bank.
export async function publishExperience(e) {
  if (!supaMode) throw new Error('Not connected.');
  const { error } = await supabase.from('experiences').insert({ company: e.company, role: e.role || '', interview_date: e.date || null, mode: e.mode || '', result: e.result || '', rounds: e.rounds || [], tips: e.tips || '' });
  if (error) throw error;
}
