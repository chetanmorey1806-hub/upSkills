import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Eye, EyeOff, LogIn, UserPlus, CheckCircle2, AlertCircle, ArrowLeft, BookOpenCheck, ClipboardCheck, Hammer, MessageCircle } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { login, register, useAuth, sendPasswordReset } from '../auth.js';
import { supaMode } from '../supabase.js';

function Field({ icon: I, label, error, right, ...props }) {
  return (
    <label className={`au-field ${error ? 'bad' : ''}`}>
      <span className="au-label">{label}</span>
      <span className="au-input">
        <I size={17} />
        <input {...props} />
        {right}
      </span>
      {error && <span className="au-err"><AlertCircle size={13} /> {error}</span>}
    </label>
  );
}

function Strength({ pw }) {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const lvl = s <= 1 ? ['Weak', 'w1'] : s <= 3 ? ['Medium', 'w2'] : ['Strong', 'w3'];
  return <div className={`au-strength ${lvl[1]}`}><i /><i /><i /><span>{lvl[0]} password</span></div>;
}

export default function AuthPage({ mode }) {
  const user = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const isLogin = mode === 'login';
  const from = loc.state?.from && !['/login', '/register'].includes(loc.state.from) ? loc.state.from : '/today';
  const [f, setF] = useState({ name: '', username: loc.state?.username || '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(loc.state?.registered ? `Registration successful! Welcome ${loc.state.name || ''}. ${loc.state?.confirm ? 'We sent a confirmation link to your email — open it first, then sign in here.' : 'Please sign in with your new username and password.'}` : '');
  useEffect(() => { document.title = `${isLogin ? 'Sign in' : 'Create account'} · UpSkillr`; setErr({}); }, [isLogin]);
  // /register and /login share this component: reset when switching, and show the "registered" note on arrival
  useEffect(() => {
    setBusy(false);
    setOk(isLogin && loc.state?.registered ? `Registration successful! Welcome ${loc.state.name || ''}. ${loc.state?.confirm ? 'We sent a confirmation link to your email — open it first, then sign in here.' : 'Please sign in with your new username and password.'}` : '');
    if (isLogin && loc.state?.username) setF((x) => ({ ...x, username: loc.state.username, password: '', confirm: '' }));
  }, [isLogin, loc.state]); // eslint-disable-line react-hooks/exhaustive-deps

  if (user) return <Navigate to={from} replace />;
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr({ ...err, [k]: '', form: '' }); };
  const eye = <button type="button" className="au-eye" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>;

  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(async () => {
      if (isLogin) {
        if (!f.username.trim() || !f.password) { setErr({ form: 'Enter your username and password.' }); setBusy(false); return; }
        const r = await login(f.username, f.password, remember);
        if (!r.ok) { setErr({ form: r.error }); setBusy(false); return; }
        nav(from, { replace: true });
      } else {
        if (f.password !== f.confirm) { setErr({ confirm: 'Passwords do not match.' }); setBusy(false); return; }
        const r = await register(f);
        if (!r.ok) { setErr({ [r.field]: r.error }); setBusy(false); return; }
        nav('/login', { replace: true, state: { registered: true, confirm: !!r.confirm, username: r.username, name: f.name.trim().split(' ')[0], from: loc.state?.from } });
      }
    }, 350);
  };

  return (
    <div className="au">
      <aside className="au-side">
        <span className="au-blob a" /><span className="au-blob b" /><span className="au-blob c" />
        <Link to="/" className="au-brand"><Logo size={38} /><span>Up<b>Skillr</b></span></Link>
        <div className="au-side-body">
          <h2>{isLogin ? 'Welcome back!' : 'Start your journey'}</h2>
          <p>{isLogin ? 'Sign in to continue your lessons, tests and projects right where you left off.' : 'Create a free student account to save your own progress, scores and projects.'}</p>
          <ul>
            <li style={{ '--d': '.1s' }}><BookOpenCheck size={18} /> Day-wise courses with theory, examples &amp; quizzes</li>
            <li style={{ '--d': '.2s' }}><ClipboardCheck size={18} /> Test series &amp; mock interviews for every course</li>
            <li style={{ '--d': '.3s' }}><Hammer size={18} /> Guided final projects with reports</li>
            <li style={{ '--d': '.4s' }}><MessageCircle size={18} /> Soft skills practice for placements</li>
          </ul>
        </div>
        <div className="au-credit">Developed by <b>ER. Chetan D Morey</b></div>
      </aside>

      <main className="au-main">
        <Link to="/" className="au-back"><ArrowLeft size={16} /> Back to home</Link>
        <div className="au-card" key={mode}>
          <div className="au-logo"><Logo size={52} /></div>
          <h1>{isLogin ? 'Sign in to UpSkillr' : 'Create your account'}</h1>
          <p className="muted">{isLogin ? 'New here? ' : 'Already registered? '}<Link to={isLogin ? '/register' : '/login'} state={loc.state?.from ? { from: loc.state.from } : undefined}>{isLogin ? 'Register as a new student' : 'Sign in'}</Link></p>

          {ok && isLogin && <div className="au-ok"><CheckCircle2 size={17} /> {ok}</div>}
          {err.form && <div className="au-alert"><AlertCircle size={17} /> {err.form}</div>}

          <form onSubmit={submit} noValidate>
            {!isLogin && <Field icon={User} label="Full name" placeholder="e.g. Riya Patil" value={f.name} onChange={set('name')} error={err.name} autoComplete="name" autoFocus />}
            <Field icon={User} label={isLogin && supaMode ? 'Username or email' : 'Username'} placeholder={isLogin ? (supaMode ? 'Your username or email' : 'Your username') : 'Choose a username (e.g. riya_p)'} value={f.username} onChange={set('username')} error={err.username} autoComplete="username" autoFocus={isLogin} autoCapitalize="none" />
            {!isLogin && <Field icon={Mail} label={supaMode ? 'Email' : 'Email (optional)'} type="email" placeholder="you@example.com" value={f.email} onChange={set('email')} error={err.email} autoComplete="email" />}
            <Field icon={Lock} label="Password" type={show ? 'text' : 'password'} placeholder={isLogin ? 'Your password' : 'At least 6 characters'} value={f.password} onChange={set('password')} error={err.password} autoComplete={isLogin ? 'current-password' : 'new-password'} right={eye} />
            {!isLogin && <Strength pw={f.password} />}
            {!isLogin && <Field icon={Lock} label="Confirm password" type={show ? 'text' : 'password'} placeholder="Type the password again" value={f.confirm} onChange={set('confirm')} error={err.confirm} autoComplete="new-password" />}
            {isLogin && <label className="check au-remember"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Keep me signed in on this device</label>}
            {isLogin && supaMode && <button type="button" className="link-btn au-forgot" onClick={async () => {
              const email = window.prompt('Enter the email you registered with. We will send you a link to set a new password.', f.username.includes('@') ? f.username : '');
              if (!email) return;
              const r = await sendPasswordReset(email);
              window.alert(r.ok ? 'Check your inbox (and spam folder) for the reset link.' : r.error);
            }}>Forgot password?</button>}
            <button className="btn primary au-submit" disabled={busy}>
              {busy ? <span className="au-spin" /> : isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {busy ? (isLogin ? 'Signing in…' : 'Creating account…') : isLogin ? 'Sign in' : 'Register'}
            </button>
          </form>
          <p className="muted small au-note">Your account and progress are saved in this browser on this device.</p>
        </div>
      </main>
    </div>
  );
}
