export default {
  id: 'day-43-firebase-supabase-backend',
  title: 'Firebase / Supabase as a Backend for React: Auth, Database CRUD, Real-time Listeners and Security Rules',
  module: 'Module 9: Authentication & Security',
  day: 43,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Backend-as-a-Service (BaaS) platforms like Firebase and Supabase give a React app login, a database, real-time updates and access rules without writing your own server. You will connect React to both, build sign-up/login with an auth listener, do CRUD on a "tasks" collection/table, subscribe to live changes, and protect data with Firestore Security Rules and Supabase Row Level Security.',
  objectives: [
    'Explain what a BaaS is and when a company picks Firebase, Supabase or a custom Node API',
    'Set up Firebase (modular v11 SDK) and Supabase (supabase-js v2) clients in a Vite project with .env keys',
    'Implement sign-up, login, logout and auto-login with onAuthStateChanged / onAuthStateChange inside an AuthContext',
    'Perform create, read, update and delete on Firestore collections and Supabase tables',
    'Subscribe to real-time changes with onSnapshot and Supabase channels, clean up listeners, and write basic security rules / RLS policies',
  ],
  theory: [
    {
      heading: 'What is a Backend-as-a-Service (BaaS)?',
      content:
        'Until now our React apps talked to APIs that someone else built (dummyjson, our own Express server). A **BaaS** gives you a ready-made backend in the cloud: you create a project in a web console, copy a config object into React, and immediately get:\n\n- **Authentication**: email/password, Google, phone OTP, magic links\n- **Database**: Firestore (NoSQL documents) in Firebase, PostgreSQL (SQL tables) in Supabase\n- **Real-time**: the UI updates automatically when data changes on the server\n- **Storage**: file and image uploads\n- **Rules / policies**: who can read or write which data\n\nAnalogy: building your own backend is like building your own kitchen before opening a restaurant. A BaaS is a **cloud kitchen** you rent: the stove, fridge and security guard are already there, you only cook (write the UI and the rules).\n\n**When companies choose what**:\n- **Firebase** (Google): fastest to start, great mobile SDKs, push notifications, generous free tier. Used by many Indian startups for MVPs, chat apps and React Native apps.\n- **Supabase**: open source, real **PostgreSQL** (joins, SQL, foreign keys), Row Level Security, can be self-hosted. Popular for SaaS dashboards.\n- **Custom Node/Java API**: when you need complex business logic, payments, strict compliance (banking), or you already have a backend team.',
      points: [
        'Firebase = NoSQL documents in collections; Supabase = SQL rows in tables',
        'Both expose a PUBLIC client key: security comes from rules/policies, not from hiding the key',
        'Both have free tiers good enough for learning and small projects',
      ],
    },
    {
      heading: 'Project setup: client files and environment variables',
      content:
        'Industry structure: create **one file** that initialises the SDK and export the instances. Every feature imports from there; components never call `initializeApp` themselves.\n\n- `src/lib/firebase.js` exports `auth` and `db`\n- `src/lib/supabase.js` exports `supabase`\n- Keys live in `.env.local` as `VITE_FIREBASE_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and are read with `import.meta.env`\n\nThe Firebase `apiKey` and the Supabase `anon` key are **meant to be public** (they ship inside your JS bundle anyway). What must stay secret is the Supabase **service_role** key and Firebase **Admin SDK** service-account JSON: those bypass all rules and belong only on a server.',
      syntax:
        "// npm install firebase @supabase/supabase-js\n\n// src/lib/firebase.js\nimport { initializeApp } from 'firebase/app';\nimport { getAuth } from 'firebase/auth';\nimport { getFirestore } from 'firebase/firestore';\n\nconst app = initializeApp({\n  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,\n  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,\n  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,\n  appId: import.meta.env.VITE_FIREBASE_APP_ID,\n});\nexport const auth = getAuth(app);\nexport const db = getFirestore(app);\n\n// src/lib/supabase.js\nimport { createClient } from '@supabase/supabase-js';\nexport const supabase = createClient(\n  import.meta.env.VITE_SUPABASE_URL,\n  import.meta.env.VITE_SUPABASE_ANON_KEY\n);",
      tip: 'Common mistake: putting the Supabase service_role key in a VITE_ variable. Anything prefixed VITE_ is bundled into the browser and visible to every user.',
    },
    {
      heading: 'Authentication and the auth listener',
      content:
        'Both SDKs store the session for you (IndexedDB / localStorage) and refresh tokens automatically, so you do **not** manage JWTs by hand like on Day 41.\n\nThe key idea is the **auth state listener**: on app start the SDK checks the saved session and calls your callback with the user (or `null`). This gives you auto-login for free.\n\n- Firebase: `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`, `onAuthStateChanged(auth, cb)`\n- Supabase: `supabase.auth.signUp`, `signInWithPassword`, `signOut`, `onAuthStateChange((event, session) => ...)`\n\nPut the listener in an **AuthProvider** with a `loading` flag. Until the first callback arrives, show a splash/spinner, otherwise your ProtectedRoute (Day 42) will redirect a logged-in user to /login for a split second.',
      syntax:
        "// Firebase AuthProvider core\nuseEffect(() => {\n  const unsubscribe = onAuthStateChanged(auth, firebaseUser => {\n    setUser(firebaseUser);   // null when logged out\n    setLoading(false);\n  });\n  return unsubscribe;        // cleanup on unmount\n}, []);\n\n// Supabase equivalent\nuseEffect(() => {\n  supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setLoading(false); });\n  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));\n  return () => subscription.unsubscribe();\n}, []);",
      tip: 'Map SDK error codes to friendly messages: auth/invalid-credential -> "Wrong email or password", auth/email-already-in-use -> "Account already exists". Never show raw Firebase errors to users.',
    },
    {
      heading: 'Database CRUD: Firestore vs Supabase',
      content:
        '**Firestore** stores **documents** (JSON-like objects) inside **collections**: `tasks/abc123 { title, done, uid, createdAt }`. There are no joins; you often duplicate small data.\n\n**Supabase** is PostgreSQL: a `tasks` table with columns `id, title, done, user_id, created_at`. You query with a chainable builder that becomes SQL.\n\nSide by side (Firestore / Supabase):\n- Create: `addDoc(collection(db, \'tasks\'), data)` / `supabase.from(\'tasks\').insert(data)`\n- Read: `getDocs(query(collection(db, \'tasks\'), where(\'uid\', \'==\', uid)))` / `supabase.from(\'tasks\').select(\'*\').eq(\'user_id\', uid)`\n- Update: `updateDoc(doc(db, \'tasks\', id), { done: true })` / `.update({ done: true }).eq(\'id\', id)`\n- Delete: `deleteDoc(doc(db, \'tasks\', id))` / `.delete().eq(\'id\', id)`\n\nSupabase calls return `{ data, error }` instead of throwing, so always check `error`. Firestore functions return Promises that reject on failure, so use try/catch.\n\nIndustry pattern: hide these calls in a **service file** (`src/features/tasks/tasksService.js`) so components do not care which backend is used. Switching from Firebase to Supabase later then touches one file.',
      syntax:
        "// tasksService.js (Firestore)\nimport { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';\nimport { db } from '@/lib/firebase';\n\nconst tasksRef = collection(db, 'tasks');\nexport const createTask = (uid, title) => addDoc(tasksRef, { uid, title, done: false, createdAt: serverTimestamp() });\nexport const toggleTask = (id, done) => updateDoc(doc(db, 'tasks', id), { done });\nexport const removeTask = id => deleteDoc(doc(db, 'tasks', id));",
    },
    {
      heading: 'Real-time listeners',
      content:
        'Real-time means the server **pushes** changes to every connected client. Open the app in two tabs, add a task in one, and it appears in the other without refresh. This is what powers chat apps, live order tracking (Swiggy/Zomato style) and collaborative boards.\n\n- Firestore: `onSnapshot(query, snapshot => ...)` fires once with the current data and again on every change. It returns an **unsubscribe** function.\n- Supabase: create a channel and listen to `postgres_changes` events (`INSERT`, `UPDATE`, `DELETE` or `*`). Realtime must be enabled for the table in the dashboard.\n\nAlways start listeners inside `useEffect` and **return the cleanup**. Forgetting it creates duplicate listeners every time the component re-mounts (and in StrictMode dev you will see everything twice), wasting reads that Firebase bills you for.',
      syntax:
        "useEffect(() => {\n  if (!user) return;\n  const q = query(collection(db, 'tasks'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));\n  const unsubscribe = onSnapshot(q, snap => {\n    setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));\n  }, err => setError(err.message));\n  return unsubscribe;\n}, [user]);\n\n// Supabase\nconst channel = supabase\n  .channel('tasks-changes')\n  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => refetch())\n  .subscribe();\nreturn () => { supabase.removeChannel(channel); };",
      tip: 'A where() + orderBy() on different fields needs a composite index in Firestore. The error message contains a direct link that creates it for you.',
    },
    {
      heading: 'Security rules and Row Level Security (overview)',
      content:
        'Because the client key is public, **anyone** can call your database from the browser console. The only protection is the rules that run on the server:\n\n- **Firestore Security Rules**: a small language deployed with the project. `request.auth` is the logged-in user, `resource.data` is the existing document, `request.resource.data` is the incoming write.\n- **Supabase RLS**: PostgreSQL policies. Turn RLS **on** for every table, then add policies using `auth.uid()`.\n\nGolden rule: **the UI hiding a button is not security**. A user can always call the API directly. Rules must enforce "users can read and write only their own tasks", "only admins can delete products", and validate data shape (title is a string under 100 chars).\n\nA new Firestore database created in **test mode** allows everything for 30 days: never ship that to production.',
      syntax:
        "// firestore.rules\nrules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /tasks/{taskId} {\n      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.uid;\n      allow create: if request.auth != null\n                    && request.resource.data.uid == request.auth.uid\n                    && request.resource.data.title is string\n                    && request.resource.data.title.size() < 100;\n    }\n  }\n}\n\n-- Supabase SQL editor\nalter table tasks enable row level security;\ncreate policy \"own tasks\" on tasks for all\n  using (auth.uid() = user_id)\n  with check (auth.uid() = user_id);",
      tip: 'In the playground we cannot reach real Firebase without your keys, so the examples use a tiny in-memory "fake Firebase" with the same function names. The `code` blocks show the real SDK code to paste into a Vite project.',
    },
  ],
  examples: [
    {
      title: 'AuthProvider with sign-up, login, logout and auto-login (Firebase)',
      scenario:
        'A Pune startup is building "TaskSathi", a to-do app. Users sign up with email and password, stay logged in after refresh, and see a friendly error when the password is wrong.',
      steps: [
        'Create a Firebase project, enable Email/Password in Authentication > Sign-in method',
        'Copy the web config into .env.local and create src/lib/firebase.js',
        'Create src/features/auth/AuthContext.jsx with onAuthStateChanged inside useEffect',
        'Expose user, loading, signup, login, logout through context and a useAuth() hook',
        'Build LoginPage that calls login() and maps error codes to friendly messages',
        'Run the playground: it uses a fake auth object with the same API (try priya@example.com / secret123)',
      ],
      code: `// src/features/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext(null);

const messages = {
  'auth/invalid-credential': 'Wrong email or password',
  'auth/email-already-in-use': 'An account with this email already exists',
  'auth/weak-password': 'Password must be at least 6 characters',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
};
export const friendlyError = err => messages[err.code] || 'Something went wrong';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return unsubscribe;
  }, []);

  const signup = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
  };
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  if (loading) return <p className="splash">Loading TaskSathi...</p>;
  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};`,
      playground: {
        jsx: `const { createContext, useContext, useEffect, useState } = React;

// ---------- fake Firebase Auth (same function names, in memory) ----------
const fakeAuth = (() => {
  const users = { 'priya@example.com': { password: 'secret123', displayName: 'Priya Sharma' } };
  let current = null;
  const listeners = new Set();
  const notify = () => listeners.forEach(cb => cb(current));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const fail = code => { const e = new Error(code); e.code = code; throw e; };
  try { const saved = sessionStorage.getItem('fake-user'); if (saved) current = JSON.parse(saved); } catch (e) {}
  const save = () => { try { current ? sessionStorage.setItem('fake-user', JSON.stringify(current)) : sessionStorage.removeItem('fake-user'); } catch (e) {} };
  return {
    onAuthStateChanged(cb) { listeners.add(cb); setTimeout(() => cb(current), 600); return () => listeners.delete(cb); },
    async createUserWithEmailAndPassword(email, password, name) {
      await wait(500);
      if (users[email]) fail('auth/email-already-in-use');
      if (password.length < 6) fail('auth/weak-password');
      users[email] = { password, displayName: name };
      current = { uid: 'u' + Date.now(), email, displayName: name }; save(); notify();
    },
    async signInWithEmailAndPassword(email, password) {
      await wait(500);
      if (!users[email] || users[email].password !== password) fail('auth/invalid-credential');
      current = { uid: 'u-' + email, email, displayName: users[email].displayName }; save(); notify();
    },
    async signOut() { await wait(200); current = null; save(); notify(); },
  };
})();

const messages = {
  'auth/invalid-credential': 'Wrong email or password',
  'auth/email-already-in-use': 'An account with this email already exists',
  'auth/weak-password': 'Password must be at least 6 characters',
};
const friendlyError = err => messages[err.code] || 'Something went wrong';

// ---------- AuthContext ----------
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = fakeAuth.onAuthStateChanged(u => { setUser(u); setLoading(false); });
    return unsubscribe;
  }, []);
  const value = {
    user,
    signup: (name, email, pw) => fakeAuth.createUserWithEmailAndPassword(email, pw, name),
    login: (email, pw) => fakeAuth.signInWithEmailAndPassword(email, pw),
    logout: () => fakeAuth.signOut(),
  };
  if (loading) return <p className="splash">Checking saved session...</p>;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
const useAuth = () => useContext(AuthContext);

function AuthForm() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'priya@example.com', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await signup(form.name, form.email, form.password);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{mode === 'login' ? 'Login to TaskSathi' : 'Create account'}</h2>
      {mode === 'signup' && (
        <label>Name<input name="name" value={form.name} onChange={update} required /></label>
      )}
      <label>Email<input name="email" type="email" value={form.email} onChange={update} required /></label>
      <label>Password<input name="password" type="password" value={form.password} onChange={update} required /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign up'}</button>
      <p className="switch">
        {mode === 'login' ? 'New here? ' : 'Have an account? '}
        <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
          {mode === 'login' ? 'Create account' : 'Login'}
        </button>
      </p>
      <small>Demo user: priya@example.com / secret123</small>
    </form>
  );
}

function Home() {
  const { user, logout } = useAuth();
  return (
    <div className="card">
      <h2>Namaste, {user.displayName}!</h2>
      <p>uid: <code>{user.uid}</code></p>
      <p>Refresh the preview: you stay logged in (session restored by the listener).</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function Gate() {
  const { user } = useAuth();
  return user ? <Home /> : <AuthForm />;
}

function App() {
  return <AuthProvider><Gate /></AuthProvider>;
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f1f5f9; display: grid; place-items: center; min-height: 100vh; margin: 0; }
.card { background: #fff; padding: 24px; border-radius: 12px; width: 300px; box-shadow: 0 4px 20px rgba(0,0,0,.08); display: grid; gap: 10px; }
h2 { margin: 0 0 6px; font-size: 20px; }
label { display: grid; gap: 4px; font-size: 14px; color: #334155; }
input { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
button { padding: 9px; border: 0; border-radius: 8px; background: #f97316; color: #fff; font-weight: 600; cursor: pointer; }
button:disabled { opacity: .6; }
.link { background: none; color: #ea580c; padding: 0; text-decoration: underline; }
.error { color: #b91c1c; background: #fee2e2; padding: 8px; border-radius: 6px; margin: 0; }
.switch { margin: 0; font-size: 14px; }
.splash { color: #475569; }
small { color: #64748b; }`,
      },
      result:
        'A "Checking saved session..." splash appears for a moment, then the login form. A wrong password shows "Wrong email or password". The correct password shows the welcome card. Refreshing the preview keeps you logged in until you click Logout.',
      explanation:
        'This is a plain-React simulation: `fakeAuth` copies the shape of Firebase Auth (listener + async sign-in functions that throw errors with a `code`). The AuthProvider subscribes once in useEffect and returns the unsubscribe function as cleanup. `loading` starts true so nothing renders until the first auth callback, exactly like real Firebase restoring a session from IndexedDB. Errors are mapped to friendly text with a lookup table, which is how production apps hide SDK internals.',
    },
    {
      title: 'Firestore CRUD with a real-time onSnapshot listener',
      scenario:
        'Each logged-in user manages their own tasks. Adding, ticking or deleting a task should update the list instantly in every open tab, with no manual refetch.',
      steps: [
        'Create the Firestore database (production mode) and the tasks collection',
        'Write tasksService.js with createTask, toggleTask and removeTask',
        'In TaskList.jsx start onSnapshot inside useEffect and return the unsubscribe function',
        'Call the service functions from the form and buttons, never update local state by hand',
        'Run the playground: the "Simulate another device" button writes to the fake database and the list updates through the listener',
      ],
      code: `// src/features/tasks/TaskList.jsx
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/AuthContext';
import { createTask, toggleTask, removeTask } from './tasksService';

export default function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'tasks'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      snap => setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => setError(err.message)
    );
    return unsubscribe;
  }, [user.uid]);

  const add = async e => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask(user.uid, title.trim());   // listener will update the list
    setTitle('');
  };

  if (error) return <p role="alert">{error}</p>;
  return (
    <>
      <form onSubmit={add}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New task" />
        <button>Add</button>
      </form>
      <ul>
        {tasks.map(t => (
          <li key={t.id}>
            <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id, !t.done)} />
            {t.title}
            <button onClick={() => removeTask(t.id)} aria-label={'Delete ' + t.title}>x</button>
          </li>
        ))}
      </ul>
    </>
  );
}`,
      playground: {
        jsx: `const { useEffect, useState } = React;

// ---------- fake Firestore with onSnapshot ----------
const fakeDb = (() => {
  let docs = [
    { id: 'a1', uid: 'priya', title: 'Pay electricity bill (MSEB)', done: false, createdAt: 1 },
    { id: 'a2', uid: 'priya', title: 'Book Pune to Mumbai train', done: true, createdAt: 2 },
    { id: 'b1', uid: 'rahul', title: 'Rahul private task', done: false, createdAt: 3 },
  ];
  const listeners = new Set();
  const emit = () => listeners.forEach(l => l.cb(run(l.q)));
  const run = q => docs.filter(d => d[q.field] === q.value).sort((a, b) => b.createdAt - a.createdAt);
  const later = fn => new Promise(r => setTimeout(() => { fn(); emit(); r(); }, 150));
  return {
    onSnapshot(q, cb) {
      const l = { q, cb }; listeners.add(l);
      setTimeout(() => cb(run(q)), 300);
      console.log('listener added');
      return () => { listeners.delete(l); console.log('listener removed'); };
    },
    addDoc: data => later(() => { docs = [...docs, { id: Math.random().toString(36).slice(2, 8), createdAt: Date.now(), ...data }]; }),
    updateDoc: (id, patch) => later(() => { docs = docs.map(d => d.id === id ? { ...d, ...patch } : d); }),
    deleteDoc: id => later(() => { docs = docs.filter(d => d.id !== id); }),
  };
})();

// service layer (same names as the real tasksService.js)
const createTask = (uid, title) => fakeDb.addDoc({ uid, title, done: false });
const toggleTask = (id, done) => fakeDb.updateDoc(id, { done });
const removeTask = id => fakeDb.deleteDoc(id);

function TaskList({ uid }) {
  const [tasks, setTasks] = useState(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const unsubscribe = fakeDb.onSnapshot({ field: 'uid', value: uid }, setTasks);
    return unsubscribe;
  }, [uid]);

  async function add(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask(uid, title.trim());
    setTitle('');
  }

  if (tasks === null) return <p className="muted">Loading tasks...</p>;
  return (
    <div>
      <form onSubmit={add} className="row">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New task" />
        <button>Add</button>
      </form>
      {tasks.length === 0 && <p className="muted">No tasks yet. Add your first one!</p>}
      <ul>
        {tasks.map(t => (
          <li key={t.id} className={t.done ? 'done' : ''}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id, !t.done)} />
              {t.title}
            </label>
            <button className="del" onClick={() => removeTask(t.id)} aria-label={'Delete ' + t.title}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [uid, setUid] = useState('priya');
  return (
    <div className="app">
      <h2>TaskSathi (real-time)</h2>
      <div className="row">
        <select value={uid} onChange={e => setUid(e.target.value)}>
          <option value="priya">Logged in as priya</option>
          <option value="rahul">Logged in as rahul</option>
        </select>
        <button className="ghost" onClick={() => createTask(uid, 'Added from phone at ' + new Date().toLocaleTimeString('en-IN'))}>
          Simulate another device
        </button>
      </div>
      <TaskList key={uid} uid={uid} />
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #fff7ed; margin: 0; padding: 20px; }
.app { max-width: 420px; margin: auto; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
h2 { margin-top: 0; }
.row { display: flex; gap: 8px; margin-bottom: 12px; }
input[type=text], input:not([type]) { flex: 1; padding: 8px; border: 1px solid #fdba74; border-radius: 8px; }
button { padding: 8px 12px; border: 0; border-radius: 8px; background: #ea580c; color: #fff; cursor: pointer; }
.ghost { background: #fff; color: #ea580c; border: 1px solid #ea580c; }
select { padding: 8px; border-radius: 8px; }
ul { list-style: none; padding: 0; margin: 0; }
li { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #fed7aa; }
li.done label { text-decoration: line-through; color: #94a3b8; }
.del { background: #fee2e2; color: #b91c1c; padding: 4px 9px; }
.muted { color: #64748b; }`,
      },
      result:
        'Priya sees only her 2 tasks. Adding, ticking and deleting updates the list after a short delay through the listener. "Simulate another device" adds a task that appears instantly. Switching to rahul removes the old listener (console: listener removed) and shows only Rahul\'s task.',
      explanation:
        'Plain-React version of Firestore: the component never pushes into `tasks` itself. It only writes to the "database"; the snapshot listener is the single source of truth and re-renders the list, which is exactly how real-time Firestore apps stay in sync across devices. `key={uid}` remounts TaskList when the user changes, and the cleanup function removes the previous listener so we do not leak subscriptions.',
    },
    {
      title: 'Supabase CRUD with { data, error } and a realtime channel',
      scenario:
        'A Bengaluru SaaS team prefers SQL. They store expenses in a Postgres table and want a live total when a teammate adds an expense.',
      steps: [
        'Create a Supabase project and run the SQL to create the expenses table with RLS',
        'Enable Realtime for the expenses table (Database > Replication)',
        'Write src/lib/supabase.js with createClient and the anon key',
        'Load rows with select(), check error, and subscribe to postgres_changes in useEffect',
        'Remove the channel in the cleanup function',
        'Run the playground: a fake supabase client with the same chainable API is used',
      ],
      code: `-- SQL editor
create table expenses (
  id bigint generated always as identity primary key,
  title text not null,
  amount numeric not null check (amount > 0),
  user_id uuid not null default auth.uid() references auth.users,
  created_at timestamptz default now()
);
alter table expenses enable row level security;
create policy "team members read" on expenses for select using (auth.role() = 'authenticated');
create policy "insert own" on expenses for insert with check (auth.uid() = user_id);

// src/features/expenses/useExpenses.js
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useExpenses() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('id, title, amount, created_at')
      .order('created_at', { ascending: false });
    if (error) setError(error.message); else setRows(data);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel('expenses-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const addExpense = async (title, amount) => {
    const { error } = await supabase.from('expenses').insert({ title, amount });
    if (error) throw error;
  };
  const deleteExpense = id => supabase.from('expenses').delete().eq('id', id);

  return { rows, error, addExpense, deleteExpense };
}`,
      playground: {
        jsx: `const { useEffect, useState, useCallback } = React;

// ---------- fake supabase client (chainable like supabase-js v2) ----------
const supabase = (() => {
  let table = [
    { id: 1, title: 'Team lunch at MTR', amount: 2400, created_at: 1 },
    { id: 2, title: 'AWS bill', amount: 8650, created_at: 2 },
  ];
  let nextId = 3;
  const channels = new Set();
  const broadcast = event => channels.forEach(c => c.cb({ eventType: event }));
  const delay = v => new Promise(r => setTimeout(() => r(v), 200));
  return {
    from() {
      return {
        select() { return { order: () => delay({ data: [...table].sort((a, b) => b.created_at - a.created_at), error: null }) }; },
        insert(row) {
          if (!row.title || !(row.amount > 0)) return delay({ data: null, error: { message: 'violates check constraint "amount > 0"' } });
          table.push({ id: nextId++, created_at: Date.now(), ...row });
          setTimeout(() => broadcast('INSERT'), 250);
          return delay({ data: null, error: null });
        },
        delete() { return { eq: (_col, id) => { table = table.filter(r => r.id !== id); setTimeout(() => broadcast('DELETE'), 250); return delay({ error: null }); } }; },
      };
    },
    channel(name) {
      const ch = { name, cb: () => {} };
      ch.on = (_type, _filter, cb) => { ch.cb = cb; return ch; };
      ch.subscribe = () => { channels.add(ch); console.log('subscribed', name); return ch; };
      return ch;
    },
    removeChannel(ch) { channels.delete(ch); console.log('removed', ch.name); },
  };
})();

function useExpenses() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message); else setRows(data);
  }, []);
  useEffect(() => {
    load();
    const channel = supabase.channel('expenses-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, payload => { console.log('change', payload.eventType); load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);
  const addExpense = async (title, amount) => {
    const { error } = await supabase.from('expenses').insert({ title, amount });
    if (error) throw new Error(error.message);
  };
  const deleteExpense = id => supabase.from('expenses').delete().eq('id', id);
  return { rows, error, addExpense, deleteExpense };
}

const inr = n => '\\u20B9' + Number(n).toLocaleString('en-IN');

function App() {
  const { rows, addExpense, deleteExpense } = useExpenses();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');
  const total = rows.reduce((s, r) => s + r.amount, 0);

  async function submit(e) {
    e.preventDefault();
    try { await addExpense(title, Number(amount)); setTitle(''); setAmount(''); setMsg(''); }
    catch (err) { setMsg(err.message); }
  }

  return (
    <div className="box">
      <h2>Team expenses</h2>
      <p className="total">Total: {inr(total)}</p>
      <form onSubmit={submit}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <button>Add</button>
      </form>
      {msg && <p className="err">{msg}</p>}
      <table>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}><td>{r.title}</td><td>{inr(r.amount)}</td><td><button className="x" onClick={() => deleteExpense(r.id)}>Delete</button></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #ecfdf5; margin: 0; padding: 20px; }
.box { max-width: 460px; margin: auto; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,.08); }
h2 { margin: 0; }
.total { font-size: 22px; font-weight: 700; color: #047857; }
form { display: flex; gap: 6px; }
input { flex: 1; padding: 8px; border: 1px solid #a7f3d0; border-radius: 8px; min-width: 0; }
button { padding: 8px 12px; border: 0; border-radius: 8px; background: #10b981; color: #fff; cursor: pointer; }
.x { background: #fee2e2; color: #b91c1c; padding: 4px 8px; }
table { width: 100%; border-collapse: collapse; margin-top: 12px; }
td { padding: 8px 4px; border-bottom: 1px solid #d1fae5; }
.err { color: #b91c1c; }`,
      },
      result:
        'Two expenses and a total of ₹11,050 appear. Adding a valid expense updates the table and total after the realtime event (console shows "change INSERT"). An empty title or amount 0 shows a database-style error message.',
      explanation:
        'A plain-React imitation of supabase-js: every call resolves to `{ data, error }` and never throws, so the hook checks `error` explicitly. The realtime channel calls `load()` on any change, a simple and reliable pattern (refetch on change). The cleanup calls `removeChannel` so a remounted component does not keep a dead subscription. The fake insert rejects bad data the way a Postgres CHECK constraint would.',
    },
    {
      title: 'Reading and testing Security Rules (who can do what?)',
      scenario:
        'Before launch the tech lead asks you to prove that a user cannot read or delete another user\'s tasks and that an admin can delete anything.',
      steps: [
        'Write firestore.rules with a helper isOwner() and an admin check using a custom claim',
        'Deploy with: firebase deploy --only firestore:rules',
        'Test in the Rules Playground in the Firebase console, or with @firebase/rules-unit-testing in CI',
        'Run the playground: it evaluates the same rules as JavaScript functions for different users',
      ],
      code: `// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isOwner(uid) { return signedIn() && request.auth.uid == uid; }
    function isAdmin() { return signedIn() && request.auth.token.admin == true; }

    match /tasks/{taskId} {
      allow read: if isOwner(resource.data.uid) || isAdmin();
      allow create: if isOwner(request.resource.data.uid)
                    && request.resource.data.title is string
                    && request.resource.data.title.size() between 1 and 100;
      allow update: if isOwner(resource.data.uid)
                    && request.resource.data.uid == resource.data.uid;   // cannot steal a task
      allow delete: if isOwner(resource.data.uid) || isAdmin();
    }
  }
}

# deploy
firebase deploy --only firestore:rules`,
      playground: {
        jsx: `const { useState } = React;

// The same rules written as JS so we can "run" them in the browser
const rules = {
  read:   (auth, doc) => !!auth && (auth.uid === doc.uid || auth.admin === true),
  create: (auth, doc, next) => !!auth && auth.uid === next.uid && typeof next.title === 'string' && next.title.length >= 1 && next.title.length <= 100,
  update: (auth, doc, next) => !!auth && auth.uid === doc.uid && next.uid === doc.uid,
  delete: (auth, doc) => !!auth && (auth.uid === doc.uid || auth.admin === true),
};

const users = {
  guest: null,
  priya: { uid: 'priya' },
  rahul: { uid: 'rahul' },
  admin: { uid: 'anita', admin: true },
};
const existing = { uid: 'priya', title: 'Pay rent' };

function App() {
  const [who, setWho] = useState('priya');
  const auth = users[who];
  const checks = [
    ['Read Priya\\'s task', rules.read(auth, existing)],
    ['Create task for self', rules.create(auth, null, { uid: auth ? auth.uid : null, title: 'New' })],
    ['Create task for someone else', rules.create(auth, null, { uid: 'priya-x', title: 'Hack' })],
    ['Update title of Priya\\'s task', rules.update(auth, existing, { ...existing, title: 'Changed' })],
    ['Transfer task to self', rules.update(auth, existing, { ...existing, uid: auth ? auth.uid : null })],
    ['Delete Priya\\'s task', rules.delete(auth, existing)],
  ];
  return (
    <div className="wrap">
      <h2>Rules simulator</h2>
      <p>Document: <code>tasks/t1 {'{'} uid: "priya", title: "Pay rent" {'}'}</code></p>
      <div className="tabs">
        {Object.keys(users).map(u => (
          <button key={u} className={u === who ? 'on' : ''} onClick={() => setWho(u)}>{u}</button>
        ))}
      </div>
      <ul>
        {checks.map(([label, ok]) => (
          <li key={label}><span>{label}</span><b className={ok ? 'ok' : 'no'}>{ok ? 'ALLOW' : 'DENY'}</b></li>
        ))}
      </ul>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #eef2ff; margin: 0; padding: 20px; }
.wrap { max-width: 440px; margin: auto; background: #fff; padding: 20px; border-radius: 12px; }
h2 { margin-top: 0; }
.tabs { display: flex; gap: 6px; margin-bottom: 12px; }
.tabs button { flex: 1; padding: 8px; border: 1px solid #c7d2fe; background: #fff; border-radius: 8px; cursor: pointer; }
.tabs .on { background: #4f46e5; color: #fff; }
ul { list-style: none; padding: 0; margin: 0; }
li { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e7ff; }
.ok { color: #15803d; } .no { color: #b91c1c; }
code { font-size: 12px; }`,
      },
      result:
        'For priya most actions are ALLOW except creating for someone else. For rahul everything on Priya\'s task is DENY. For guest everything is DENY. For admin read and delete are ALLOW but update and create-for-others are DENY.',
      explanation:
        'Rules run on the server for every request, so they are the real security boundary. The simulator shows the thinking: `request.auth` (who), `resource.data` (the document that exists) and `request.resource.data` (what the client wants to write). Note the update rule also compares the new uid with the old one, preventing a user from "taking over" a document even if they own it now.',
    },
  ],
  interview: [
    {
      q: 'What is a Backend-as-a-Service and when would you NOT use one?',
      a: 'A BaaS (Firebase, Supabase, Appwrite) provides hosted auth, database, storage, real-time and access rules through client SDKs, so a frontend team can ship without writing a server. Avoid it (or combine it with your own server/cloud functions) when you have heavy business logic, payment processing, complex reporting, strict data-residency/compliance needs, or need to avoid vendor lock-in.',
      level: 'Easy',
    },
    {
      q: 'Is it safe that the Firebase apiKey / Supabase anon key is visible in the browser bundle?',
      a: 'Yes. Those keys only identify the project; they do not grant privileges. Security is enforced by Firestore Security Rules or Supabase Row Level Security on the server. The keys that must never be exposed are the Firebase Admin service account and the Supabase service_role key, because they bypass all rules.',
      level: 'Medium',
    },
    {
      q: 'Firebase vs Supabase: what are the main differences?',
      a: 'Firebase uses Firestore, a NoSQL document database (collections/documents, no joins, denormalised data), with rules written in its own language; it has strong mobile features (FCM push, Crashlytics). Supabase is built on PostgreSQL (tables, SQL, joins, foreign keys, views), uses RLS policies in SQL, is open source and can be self-hosted. Pricing models also differ: Firestore bills per document read/write, Supabase mostly by database size and compute.',
      level: 'Medium',
    },
    {
      q: 'How do you implement auto-login with Firebase in React?',
      a: 'The SDK persists the session automatically. In an AuthProvider, subscribe with onAuthStateChanged(auth, user => { setUser(user); setLoading(false); }) inside useEffect and return the unsubscribe function. Keep a loading flag true until the first callback so protected routes do not redirect before the session is restored.',
      level: 'Easy',
    },
    {
      q: 'What is onSnapshot and why must you unsubscribe?',
      a: 'onSnapshot attaches a real-time listener to a document or query; it fires with the current data and again on every change. It returns an unsubscribe function. If you do not call it in the useEffect cleanup, listeners pile up on every remount, causing duplicate state updates, memory leaks, warnings about updating unmounted components, and extra billed reads.',
      level: 'Medium',
    },
    {
      q: 'Why does the Supabase client return { data, error } instead of throwing?',
      a: 'supabase-js follows a result-object pattern so you handle errors explicitly. A failed query (RLS violation, constraint error) resolves normally with error set. Therefore code must check if (error) every time; a try/catch alone will not catch these errors. You can wrap it in a helper that throws if you prefer exceptions (for example inside a TanStack Query queryFn).',
      level: 'Medium',
    },
    {
      q: 'What is Row Level Security (RLS) in Supabase?',
      a: 'RLS is a PostgreSQL feature that filters rows per request using policies. After "alter table t enable row level security", nothing is accessible until you add policies like "using (auth.uid() = user_id)" for reads and "with check (auth.uid() = user_id)" for writes. Supabase passes the user JWT to Postgres, so auth.uid() is the logged-in user.',
      level: 'Hard',
    },
    {
      q: 'Hiding the Delete button for non-admins: is that enough?',
      a: 'No. UI checks only improve UX. Anyone can open DevTools and call deleteDoc or the REST endpoint directly with their token. The rule must be enforced on the server: a Firestore rule with request.auth.token.admin == true (custom claim set with the Admin SDK) or an RLS policy checking a role column.',
      level: 'Easy',
    },
    {
      q: 'How would you structure Firebase code in a large React project?',
      a: 'One src/lib/firebase.js that initialises the app and exports auth, db and storage; feature folders with service files (tasksService.js) that wrap Firestore calls; custom hooks (useTasks) that manage listeners and state, often combined with TanStack Query for non-realtime data; an AuthProvider for the user; environment-specific config in .env files; and rules/indexes kept in the repo and deployed via CI.',
      level: 'Medium',
    },
    {
      q: 'Firestore says "The query requires an index". What happened?',
      a: 'Firestore auto-indexes single fields, but a query that combines filters/orderBy on multiple fields (for example where uid == x and orderBy createdAt) needs a composite index. The error includes a console link to create it; in teams you add it to firestore.indexes.json and deploy it.',
      level: 'Medium',
    },
    {
      q: 'How do you give a user an "admin" role in Firebase?',
      a: 'Using custom claims from a trusted server or Cloud Function with the Admin SDK: admin.auth().setCustomUserClaims(uid, { admin: true }). The claim appears in the ID token (request.auth.token.admin in rules). The client must refresh the token (getIdToken(true)) to see it. Never let the client write its own role into Firestore and trust it.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a ProtectedRoute component that uses useAuth() from the Firebase AuthProvider and redirects to /login, remembering the page the user wanted.',
      hint: 'Use Navigate and useLocation from react-router; pass state={{ from: location }}.',
      solution: `import { Navigate, useLocation, Outlet } from 'react-router';
import { useAuth } from '@/features/auth/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();          // AuthProvider already waited for loading
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

// after login:
// const from = location.state?.from?.pathname || '/';
// navigate(from, { replace: true });`,
    },
    {
      task: 'Write a reusable hook useCollection(path, uid) that subscribes to a Firestore collection filtered by uid and returns { data, loading, error }.',
      hint: 'onSnapshot takes a success and an error callback. Reset loading when uid changes.',
      solution: `import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useCollection(path, uid) {
  const [state, setState] = useState({ data: [], loading: true, error: null });

  useEffect(() => {
    if (!uid) return;
    setState(s => ({ ...s, loading: true }));
    const q = query(collection(db, path), where('uid', '==', uid));
    const unsubscribe = onSnapshot(
      q,
      snap => setState({ data: snap.docs.map(d => ({ id: d.id, ...d.data() })), loading: false, error: null }),
      err => setState({ data: [], loading: false, error: err.message })
    );
    return unsubscribe;
  }, [path, uid]);

  return state;
}`,
    },
    {
      task: 'Add Google sign-in to the Firebase AuthProvider and show the user photo in the header.',
      hint: 'GoogleAuthProvider and signInWithPopup from firebase/auth. user.photoURL holds the image.',
      solution: `import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const googleProvider = new GoogleAuthProvider();
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

// Header.jsx
function Header() {
  const { user, logout } = useAuth();
  return (
    <header>
      {user ? (
        <>
          <img src={user.photoURL} alt="" width={32} height={32} style={{ borderRadius: '50%' }} />
          <span>{user.displayName}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={loginWithGoogle}>Continue with Google</button>
      )}
    </header>
  );
}
// Remember: enable Google in Authentication > Sign-in method and add your domain to Authorized domains.`,
    },
    {
      task: 'Write Supabase SQL for a "notes" table where users can read all public notes plus their own private notes, but can only edit/delete their own.',
      hint: 'Use two policies: one for select with an OR condition, one "for all" restricted to the owner.',
      solution: `create table notes (
  id bigint generated always as identity primary key,
  body text not null,
  is_public boolean default false,
  user_id uuid not null default auth.uid() references auth.users,
  created_at timestamptz default now()
);
alter table notes enable row level security;

create policy "read public or own" on notes for select
  using (is_public = true or auth.uid() = user_id);

create policy "insert own" on notes for insert
  with check (auth.uid() = user_id);

create policy "update own" on notes for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own" on notes for delete
  using (auth.uid() = user_id);`,
    },
    {
      task: 'Build a plain-React "online users" counter: a fake real-time store with subscribe/unsubscribe, and two components that both show the live count. Make sure listeners are cleaned up.',
      hint: 'Write createStore() returning { get, set, subscribe }. Use useEffect + useState or useSyncExternalStore.',
      solution: `const { useSyncExternalStore } = React;

function createStore(initial) {
  let value = initial;
  const listeners = new Set();
  return {
    get: () => value,
    set: v => { value = v; listeners.forEach(l => l()); },
    subscribe: l => { listeners.add(l); return () => listeners.delete(l); },
  };
}
const online = createStore(3);
setInterval(() => online.set(Math.max(1, online.get() + (Math.random() > 0.5 ? 1 : -1))), 1500);

function useOnline() { return useSyncExternalStore(online.subscribe, online.get); }

function Badge() { const n = useOnline(); return <span>{n} online</span>; }
function Footer() { const n = useOnline(); return <p>Team members active right now: {n}</p>; }

function App() { return <div><Badge /><Footer /></div>; }`,
    },
  ],
  quiz: [
    {
      question: 'Which Firebase function keeps the UI updated whenever a Firestore query result changes?',
      options: ['getDocs', 'onSnapshot', 'addDoc', 'onAuthStateChanged'],
      answer: 1,
      explanation: 'onSnapshot attaches a real-time listener; getDocs reads once.',
    },
    {
      question: 'Which key must NEVER be placed in a VITE_ environment variable?',
      options: ['Firebase apiKey', 'Supabase anon key', 'Supabase service_role key', 'Firebase projectId'],
      answer: 2,
      explanation: 'The service_role key bypasses Row Level Security; VITE_ variables are bundled into the browser.',
    },
    {
      question: 'A Supabase insert violates an RLS policy. What happens in the client?',
      options: ['The promise resolves with error set', 'The browser shows an alert', 'The row is inserted anyway', 'React throws during render'],
      answer: 0,
      explanation: 'supabase-js resolves with { data: null, error }, so you must check error.',
    },
    {
      question: 'Why does the AuthProvider keep a loading flag until the first auth callback?',
      options: [
        'To make the app look slower',
        'Because Firebase requires it',
        'To avoid fetching the user twice',
        'So protected routes do not redirect before the saved session is restored',
      ],
      answer: 3,
      explanation: 'Without it, user is null for a moment and a logged-in user is wrongly sent to /login.',
    },
    {
      question: 'Where is the real protection that stops user A from deleting user B\'s data?',
      options: ['Hiding the Delete button', 'Security Rules / RLS on the server', 'Minifying the bundle', 'Using HTTPS'],
      answer: 1,
      explanation: 'Client checks can be bypassed; only server-side rules/policies enforce access.',
    },
  ],
};
