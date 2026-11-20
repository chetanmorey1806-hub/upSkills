const AUTH_CORE = `// ---------- auth helpers (plain React, real dummyjson auth API) ----------
// Test users: emilys / emilyspass (admin) · averyp / averyppass (user)
const API = 'https://dummyjson.com';
const TOKEN_KEY = 'shopkart.accessToken';

// Safe storage: sandboxed iframes and private mode can block localStorage, so fall back to memory
const memoryStore = {};
const storage = {
  get: k => { try { return localStorage.getItem(k); } catch (e) { return memoryStore[k] ?? null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { memoryStore[k] = v; } },
  remove: k => { try { localStorage.removeItem(k); } catch (e) { delete memoryStore[k]; } },
};

function decodeJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  return JSON.parse(json);
}
function isExpired(token) {
  try { return decodeJwt(token).exp * 1000 < Date.now(); } catch (e) { return true; }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'HTTP ' + res.status);
    err.status = res.status;
    throw err;
  }
  return data;
}
// ---------- end auth helpers ----------
`;

const AUTH_CONTEXT = `
// ---------- AuthContext ----------
const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [state, setState] = React.useState({ status: 'checking', user: null, token: null });

  // auto-login: restore the session when the app starts
  React.useEffect(() => {
    const token = storage.get(TOKEN_KEY);
    if (!token || isExpired(token)) {
      storage.remove(TOKEN_KEY);
      setState({ status: 'guest', user: null, token: null });
      return;
    }
    request('/auth/me', { token })
      .then(user => setState({ status: 'authenticated', user, token }))
      .catch(() => { storage.remove(TOKEN_KEY); setState({ status: 'guest', user: null, token: null }); });
  }, []);

  const login = React.useCallback(async (username, password, expiresInMins = 30) => {
    const data = await request('/auth/login', { method: 'POST', body: { username, password, expiresInMins } });
    const { accessToken, refreshToken, ...basic } = data;
    storage.set(TOKEN_KEY, accessToken);
    const user = await request('/auth/me', { token: accessToken });       // full profile incl. role
    setState({ status: 'authenticated', user, token: accessToken });
    return user;
  }, []);

  const logout = React.useCallback(() => {
    storage.remove(TOKEN_KEY);
    setState({ status: 'guest', user: null, token: null });
  }, []);

  const value = React.useMemo(() => ({ ...state, login, logout }), [state, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
// ---------- end AuthContext ----------
`;

const LOGIN_FORM = `
function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = React.useState({ username: 'emilys', password: 'emilyspass' });
  const [showPwd, setShowPwd] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) return setError('Username and password are required');
    setLoading(true); setError('');
    try {
      await login(form.username.trim(), form.password);
    } catch (err) {
      setError(err.status === 400 ? 'Invalid username or password' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card" noValidate>
      <h3>Log in to ShopKart</h3>
      <label htmlFor="u">Username</label>
      <input id="u" name="username" autoComplete="username" value={form.username} onChange={change} />
      <label htmlFor="p">Password</label>
      <div className="pwd">
        <input id="p" name="password" type={showPwd ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={change} />
        <button type="button" onClick={() => setShowPwd(s => !s)} aria-label={showPwd ? 'Hide password' : 'Show password'}>{showPwd ? '🙈' : '👁'}</button>
      </div>
      {error && <p role="alert" className="err">{error}</p>}
      <button className="primary" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
      <p className="muted">Try emilys / emilyspass, or a wrong password.</p>
    </form>
  );
}
`;

const CSS = `.card{max-width:340px;border:1px solid #e2e8f0;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.card h3{margin:0 0 6px}.card input{padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;box-sizing:border-box}
.pwd{display:flex;gap:4px}.pwd button{border:1px solid #cbd5e1;background:#fff;border-radius:6px;cursor:pointer}
.primary{background:#4f46e5;color:#fff;border:0;border-radius:6px;padding:9px;margin-top:6px;cursor:pointer}.primary:disabled{opacity:.6}
.err{color:#b91c1c;font-size:14px;margin:4px 0}.ok{color:#15803d}.muted{color:#64748b;font-size:13px}
.user{display:flex;gap:12px;align-items:center}.user img{width:56px;height:56px;border-radius:50%;background:#e0e7ff}
.badge{display:inline-block;background:#eef2ff;color:#4338ca;border-radius:999px;padding:2px 8px;font-size:12px}
button{cursor:pointer}pre{background:#0f172a;color:#e2e8f0;padding:10px;border-radius:8px;font-size:12px;white-space:pre-wrap;word-break:break-all}
.row{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.row button{padding:6px 12px}
.log{font-family:monospace;font-size:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px;max-height:160px;overflow:auto}`;

export default {
  id: 'day-41-jwt-authentication',
  title: 'JWT Authentication in React: Login/Register Forms, AuthContext, Storing Tokens, Axios Interceptor, Logout and Auto-login',
  module: 'Module 9: Authentication & Security',
  day: 41,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Almost every company app starts with a login screen. Learn how JWT-based authentication works end to end in React: login and register forms, an AuthContext that the whole app can use, where to store tokens safely, an Axios interceptor that attaches the token to every request, logout, and auto-login when the user refreshes the page. All demos use the real dummyjson auth API.',
  objectives: [
    'Explain the JWT login flow and the three parts of a JSON Web Token',
    'Build login and register forms with validation, loading and server error states',
    'Create an AuthContext + useAuth hook that exposes user, status, login and logout',
    'Compare token storage options (memory, localStorage, httpOnly cookie) and their security trade-offs',
    'Attach tokens with an Axios request interceptor, handle 401 responses, and auto-login on page refresh',
  ],
  theory: [
    {
      heading: 'How token-based (JWT) authentication works',
      content:
        'HTTP is **stateless**: the server forgets you after each request. So after you prove who you are (username + password), the server gives you a **token**, like a **cinema ticket**: at every door (API request) you show the ticket instead of your ID card.\n\nThe flow:\n\n1. User submits the login form → `POST /auth/login { username, password }`\n2. Server checks the password and returns an **access token** (and often a **refresh token**, Day 42) plus user info\n3. React stores the token and the user, and switches the UI to "logged in"\n4. Every API call sends the header `Authorization: Bearer <token>`\n5. The server verifies the token\'s signature and expiry and answers, or returns **401 Unauthorized**\n6. Logout = delete the token on the client (and tell the server to revoke the refresh token)\n\nA **JWT** (JSON Web Token, pronounced "jot") has three base64url parts separated by dots: `header.payload.signature`.\n\n- **header**: algorithm, e.g. `{"alg":"HS256","typ":"JWT"}`\n- **payload**: **claims** such as `id`, `username`, `role`, `iat` (issued at) and `exp` (expiry, in **seconds** since 1970)\n- **signature**: created by the server with a secret key. If anyone changes the payload, the signature no longer matches.',
      tip: 'A JWT is encoded, NOT encrypted. Anyone can read the payload (try jwt.io). Never put passwords, Aadhaar numbers or other secrets in a JWT. The frontend can read claims for UI purposes but must never trust them for security; only the server verifies the signature.',
    },
    {
      heading: 'Where to store the token (the most-asked interview question)',
      content:
        '- **localStorage**: survives refresh and new tabs; simplest; used by many apps and tutorials. Risk: any **XSS** bug (malicious script on your page) can read it and steal the session.\n- **sessionStorage**: like localStorage but cleared when the tab closes. Same XSS risk.\n- **In memory** (React state / a module variable): JavaScript from other origins cannot read it, and it disappears on refresh, so you need a refresh token to get a new one silently.\n- **httpOnly cookie** set by the server: JavaScript **cannot** read it at all, so XSS cannot steal it; the browser sends it automatically. Needs `SameSite`, `Secure` and CSRF protection, and the API must be on the same site or configured for CORS with credentials.\n\n**Industry best practice**: short-lived **access token in memory** (5–15 minutes) + **refresh token in an httpOnly, Secure, SameSite cookie**. On page load the app calls `/auth/refresh` to get a new access token. Many startups still use localStorage; if you do, keep tokens short-lived and invest heavily in XSS prevention (Day 44).',
      points: [
        'Never store the password anywhere on the client',
        'Never commit tokens or secrets to Git or put them in .env files that ship to the browser',
        'Clear tokens AND cached user data (TanStack Query cache, Redux store) on logout',
      ],
    },
    {
      heading: 'AuthContext and the useAuth hook',
      content:
        'Authentication state is needed everywhere: the header shows the user\'s name, routes check if the user is logged in, the API layer needs the token. That is a perfect case for **Context** (Day 16).\n\nThe AuthProvider holds:\n\n- `status`: `\'checking\'` (restoring session on start), `\'authenticated\'` or `\'guest\'`\n- `user`: id, name, email, role, avatar\n- `login(credentials)`, `register(data)`, `logout()`\n\nA custom `useAuth()` hook reads the context and **throws a helpful error** if used outside the provider. Components never touch localStorage or the token directly; they call `useAuth()`.\n\nWhy the `checking` status matters: on refresh, the app does not yet know if the stored token is valid. If you render "guest" immediately, logged-in users see the login page flash for a second or get redirected away. Show a splash/spinner while `status === \'checking\'`.',
      syntax: `// src/features/auth/AuthContext.jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'checking', user: null });

  useEffect(() => { restoreSession().then(user =>
    setState(user ? { status: 'authenticated', user } : { status: 'guest', user: null })); }, []);

  const login = useCallback(async credentials => {
    const { data } = await api.post('/auth/login', credentials);
    tokenStore.set(data.accessToken);
    const me = await api.get('/auth/me');
    setState({ status: 'authenticated', user: me.data });
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    queryClient.clear();                         // drop cached private data
    setState({ status: 'guest', user: null });
  }, []);

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}`,
    },
    {
      heading: 'Axios interceptors: attach the token, handle 401',
      content:
        'You built an Axios instance with interceptors on Day 36. For auth:\n\n- **Request interceptor**: read the current token and set `config.headers.Authorization = \'Bearer \' + token`. Now no component has to remember the header.\n- **Response interceptor**: if the server answers **401** (token missing, invalid or expired), clear the session and send the user to `/login?expired=1`. On Day 42 you will first try a **refresh token** before logging out.\n\nThe interceptor lives outside React, so it cannot call `useAuth()`. Common solutions: a small `tokenStore` module that both the AuthProvider and the interceptor use, and an `onUnauthorized` callback (or an event) that the AuthProvider registers.',
      syntax: `// src/lib/api.js
import axios from 'axios';
import { tokenStore } from '@/features/auth/tokenStore';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use(config => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

let onUnauthorized = () => {};
export const setUnauthorizedHandler = fn => { onUnauthorized = fn; };

api.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) onUnauthorized();
    return Promise.reject(error);
  }
);`,
      tip: 'Do not add the token to requests going to other domains (S3 pre-signed URLs, analytics). Use a dedicated instance for your API only, or check config.baseURL in the interceptor.',
    },
    {
      heading: 'Login and register forms like a product team builds them',
      content:
        'Checklist used in real code reviews:\n\n- Correct **autocomplete** attributes (`username`, `current-password`, `new-password`, `email`) so password managers work\n- **Labels** for every input, errors with `role="alert"`, focus the first invalid field\n- **Show/hide password** toggle with an `aria-label`\n- Disable the submit button and show "Logging in…" while the request runs (prevents double submit)\n- **Generic error** for wrong credentials ("Invalid username or password"), never "user does not exist" (it helps attackers enumerate accounts)\n- Register: validate email format, password strength (8+ chars, number, symbol), confirm password; with React Hook Form + Zod (Day 24) in real projects\n- After login, **redirect** to the page the user originally wanted (`location.state.from`), not always to "/"',
      syntax: `// LoginPage.jsx (React Router 7)
const { login } = useAuth();
const navigate = useNavigate();
const location = useLocation();
const from = location.state?.from?.pathname ?? '/dashboard';

async function onSubmit(values) {
  try {
    await login(values);
    navigate(from, { replace: true });          // replace: Back should not return to /login
  } catch (err) {
    setError(err.response?.status === 400 ? 'Invalid username or password' : 'Something went wrong');
  }
}`,
    },
    {
      heading: 'Auto-login, logout and multi-tab sync',
      content:
        '**Auto-login** (session restore) on app start:\n\n1. Read the stored token. None → `guest`\n2. Decode it and check `exp`. Expired → remove it → `guest` (or try refresh, Day 42)\n3. Call `/auth/me` to confirm it is still valid **and** get fresh user data (role may have changed)\n4. Success → `authenticated`; 401 → remove token → `guest`\n\n**Logout** should: remove tokens, clear the query cache and any stores holding private data, call the server\'s logout endpoint if it exists (to revoke the refresh token), and navigate to `/login` with `replace`.\n\n**Multi-tab**: if the user logs out in one tab, the other tabs should log out too. Listen to the `storage` event (fires in *other* tabs when localStorage changes) or use a `BroadcastChannel(\'auth\')`.',
      syntax: `useEffect(() => {
  const onStorage = e => {
    if (e.key === TOKEN_KEY && e.newValue === null) logout();   // logged out in another tab
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}, [logout]);`,
      tip: 'Coming next (Day 42): protecting routes, role-based access (admin vs user), refresh tokens and session-expiry handling.',
    },
  ],
  examples: [
    {
      title: 'Get a real JWT and decode it',
      scenario: 'Before writing auth code, look inside a token. Log in to dummyjson, split the JWT into its three parts, decode the payload and show when it expires.',
      steps: [
        'POST /auth/login with username, password and expiresInMins',
        'Split the token on "." to get header, payload and signature',
        'Base64url-decode the header and payload and JSON.parse them',
        'Convert exp (seconds) to a date and show a live countdown',
        'Run the playground and click "Get a real token"',
      ],
      code: `export function decodeJwt(token) {
  const [, payload] = token.split('.');
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));        // use jwt-decode in real projects: jwtDecode(token)
}

const { exp, username } = decodeJwt(accessToken);
const expiresAt = new Date(exp * 1000);   // exp is in SECONDS
const isExpired = Date.now() >= exp * 1000;`,
      playground: {
        jsx: AUTH_CORE + `
function decodePart(part) {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

function App() {
  const [token, setToken] = React.useState('');
  const [now, setNow] = React.useState(Date.now());
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const getToken = async () => {
    setError('');
    try {
      const data = await request('/auth/login', { method: 'POST', body: { username: 'emilys', password: 'emilyspass', expiresInMins: 2 } });
      setToken(data.accessToken);
    } catch (err) { setError(err.message); }
  };

  let parts = null;
  try {
    if (token) {
      const [h, p, s] = token.split('.');
      parts = { header: decodePart(h), payload: decodeJwt(token), signature: s };
    }
  } catch (e) { parts = null; }
  const secondsLeft = parts ? Math.round(parts.payload.exp - now / 1000) : 0;

  return (
    <div>
      <div className="row">
        <button onClick={getToken}>Get a real token (expires in 2 min)</button>
      </div>
      {error && <p className="err">{error}</p>}
      <textarea aria-label="JWT" rows={3} style={{ width: '100%' }} placeholder="…or paste any JWT here" value={token} onChange={e => setToken(e.target.value.trim())} />
      {token && !parts && <p className="err">This is not a valid JWT</p>}
      {parts && (
        <div>
          <p><b>Header</b></p><pre>{JSON.stringify(parts.header, null, 2)}</pre>
          <p><b>Payload (claims)</b></p><pre>{JSON.stringify(parts.payload, null, 2)}</pre>
          <p><b>Signature</b> <span className="muted">(only the server can verify it)</span></p><pre>{parts.signature}</pre>
          <p>Issued: {new Date(parts.payload.iat * 1000).toLocaleTimeString('en-IN')} · Expires: {new Date(parts.payload.exp * 1000).toLocaleTimeString('en-IN')}</p>
          <p className={secondsLeft > 0 ? 'ok' : 'err'}>{secondsLeft > 0 ? 'Valid for ' + secondsLeft + ' more seconds' : 'EXPIRED: the API will now answer 401'}</p>
        </div>
      )}
    </div>
  );
}`,
        css: CSS,
      },
      result: 'Clicking the button fills the textarea with a long token. Below it you see the header {"alg":"HS256","typ":"JWT"}, the payload with id 1, username "emilys", email, firstName, iat and exp, the raw signature, and a countdown "Valid for 119 more seconds" that turns into "EXPIRED" after 2 minutes.',
      explanation:
        'The token is three base64url strings. Replacing - with + and _ with / turns base64url into normal base64 for atob. The payload is readable by anyone, which proves why secrets must never be in a JWT. exp is in seconds, so multiply by 1000 for JavaScript dates. The client uses exp only for UX decisions (e.g. skip a request with an obviously expired token); the server is the one that enforces it.',
    },
    {
      title: 'AuthContext with login, register and logout',
      scenario: 'The core of every app: a login form, a register form, and a dashboard that greets the logged-in user with data from GET /auth/me. Any component can call useAuth().',
      steps: [
        'Create AuthContext, AuthProvider (status, user, token, login, logout) and useAuth()',
        'login(): POST /auth/login, store the access token, GET /auth/me for the full profile',
        'Build LoginForm with labels, autocomplete, show/hide password, loading and error states',
        'Build RegisterForm with client validation; POST /users/add (dummyjson simulates it)',
        'Render LoginForm/RegisterForm for guests and Dashboard for authenticated users',
        'Run the playground: log in as emilys / emilyspass, then log out; try a wrong password',
      ],
      code: `// App.jsx
export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

function Shell() {
  const { status, user, logout } = useAuth();
  if (status === 'checking') return <FullPageSpinner />;
  if (status === 'guest') return <AuthPages />;
  return (
    <>
      <header>Hi, {user.firstName} <button onClick={logout}>Log out</button></header>
      <Dashboard />
    </>
  );
}

// RegisterForm submit
const { data } = await api.post('/auth/register', { firstName, email, username, password });
await login({ username, password });          // many apps log the user in right after sign-up`,
      playground: {
        jsx: AUTH_CORE + AUTH_CONTEXT + LOGIN_FORM + `
function RegisterForm({ onDone }) {
  const [v, setV] = React.useState({ firstName: '', email: '', username: '', password: '', confirm: '' });
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState('');
  const change = e => setV({ ...v, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!v.firstName.trim()) e.firstName = 'Name is required';
    if (!/^\\S+@\\S+\\.\\S+$/.test(v.email)) e.email = 'Enter a valid email';
    if (v.username.length < 4) e.username = 'At least 4 characters';
    if (!/^(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(v.password)) e.password = '8+ characters with a number and a symbol';
    if (v.confirm !== v.password) e.confirm = 'Passwords do not match';
    return e;
  };

  const submit = async e => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus('saving');
    try {
      const user = await request('/users/add', { method: 'POST', body: { firstName: v.firstName, email: v.email, username: v.username, password: v.password } });
      setStatus('Account #' + user.id + ' created. (Demo API does not save users, so log in with emilys / emilyspass.)');
    } catch (err) { setStatus('Error: ' + err.message); }
  };

  const field = (name, label, type, auto) => (
    <>
      <label htmlFor={'r-' + name}>{label}</label>
      <input id={'r-' + name} name={name} type={type} autoComplete={auto} value={v[name]} onChange={change} aria-invalid={!!errors[name]} />
      {errors[name] && <span className="err">{errors[name]}</span>}
    </>
  );

  return (
    <form onSubmit={submit} className="card" noValidate>
      <h3>Create account</h3>
      {field('firstName', 'First name', 'text', 'given-name')}
      {field('email', 'Email', 'email', 'email')}
      {field('username', 'Username', 'text', 'username')}
      {field('password', 'Password', 'password', 'new-password')}
      {field('confirm', 'Confirm password', 'password', 'new-password')}
      <button className="primary" disabled={status === 'saving'}>{status === 'saving' ? 'Creating…' : 'Sign up'}</button>
      {status && status !== 'saving' && <p className="muted" aria-live="polite">{status} <button type="button" onClick={onDone}>Go to login</button></p>}
    </form>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="card">
      <div className="user">
        <img src={user.image} alt="" />
        <div>
          <b>{user.firstName} {user.lastName}</b> <span className="badge">{user.role}</span>
          <div className="muted">{user.email}</div>
          <div className="muted">{user.address && user.address.city}</div>
        </div>
      </div>
      <button className="primary" onClick={logout}>Log out</button>
    </div>
  );
}

function Shell() {
  const { status } = useAuth();
  const [page, setPage] = React.useState('login');
  if (status === 'checking') return <p className="muted">Checking your session…</p>;
  if (status === 'authenticated') return <Dashboard />;
  return (
    <div>
      <div className="row">
        <button onClick={() => setPage('login')} aria-pressed={page === 'login'}>Log in</button>
        <button onClick={() => setPage('register')} aria-pressed={page === 'register'}>Sign up</button>
      </div>
      {page === 'login' ? <LoginForm /> : <RegisterForm onDone={() => setPage('login')} />}
    </div>
  );
}

function App() {
  return <AuthProvider><Shell /></AuthProvider>;
}`,
        css: CSS,
      },
      result: 'The login form is pre-filled with emilys / emilyspass. Log in shows "Logging in…", then a card with Emily Johnson\'s photo, an "admin" badge, email and city. Log out returns to the form. A wrong password shows "Invalid username or password". The Sign up tab validates every field and then shows "Account #209 created…" (dummyjson returns a fake id).',
      explanation:
        'All auth logic lives in AuthProvider; LoginForm and Dashboard only call useAuth(). login() stores the access token and then calls /auth/me, because the login response does not contain the role. The 400 status from dummyjson for bad credentials is mapped to a generic message. The register form validates on the client first (format, strength, confirm) and shows errors next to each field with aria-invalid. The value object is memoised so consumers re-render only when auth state changes.',
    },
    {
      title: 'An Axios-style API client: request and response interceptors',
      scenario: 'Components should just call api.get(\'/auth/me\') and never think about headers. The client must add the Bearer token automatically and log the user out on a 401. The playground builds a tiny fetch-based client with the same interceptor API as Axios.',
      steps: [
        'Create createApiClient(baseURL) with interceptors.request.use(fn) and interceptors.response.use(onOk, onError)',
        'Register a request interceptor that reads the token from storage and sets Authorization',
        'Register a response interceptor: on status 401 call the logout handler',
        'In AuthProvider, register the handler with setUnauthorizedHandler(logout)',
        'Run the playground: log in, load the profile, then click "Corrupt token" and load again',
      ],
      code: `// real code with Axios
api.interceptors.request.use(config => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      tokenStore.clear();
      onUnauthorized({ reason: 'expired' });   // AuthProvider sets state to guest + toast
    }
    return Promise.reject(err);
  }
);

// AuthProvider
useEffect(() => {
  setUnauthorizedHandler(() => {
    setState({ status: 'guest', user: null });
    toast.error('Your session has expired. Please log in again.');
  });
}, []);`,
      playground: {
        jsx: AUTH_CORE + `
// ---------- tiny Axios-like client built on fetch ----------
function createApiClient(baseURL) {
  const req = [];
  const res = [];
  async function send(method, url, data) {
    let config = { method, url, headers: {}, data };
    for (const fn of req) config = await fn(config);                     // request interceptors
    const r = await fetch(baseURL + config.url, {
      method: config.method,
      headers: data ? { ...config.headers, 'Content-Type': 'application/json' } : config.headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    const body = await r.json().catch(() => null);
    const response = { status: r.status, data: body, config };
    if (r.ok) return res.reduce((acc, h) => acc.then(h.ok), Promise.resolve(response));
    const error = Object.assign(new Error(body && body.message || 'HTTP ' + r.status), { response });
    return res.reduce((acc, h) => acc.catch(h.err), Promise.reject(error));
  }
  return {
    get: url => send('GET', url),
    post: (url, data) => send('POST', url, data),
    interceptors: {
      request: { use: fn => req.push(fn) },
      response: { use: (ok, err) => res.push({ ok: ok || (x => x), err: err || (e => Promise.reject(e)) }) },
    },
  };
}

const api = createApiClient(API);
let onUnauthorized = () => {};
const setUnauthorizedHandler = fn => { onUnauthorized = fn; };
const logLines = [];
let notifyLog = () => {};
const log = line => { logLines.unshift(new Date().toLocaleTimeString('en-IN') + '  ' + line); notifyLog(); };

api.interceptors.request.use(config => {
  const token = storage.get(TOKEN_KEY);
  if (token) config.headers.Authorization = 'Bearer ' + token;
  log('→ ' + config.method + ' ' + config.url + (token ? '  [Authorization: Bearer ' + token.slice(0, 12) + '…]' : '  [no token]'));
  return config;
});
api.interceptors.response.use(
  response => { log('← ' + response.status + ' OK'); return response; },
  error => {
    const status = error.response ? error.response.status : 'network';
    log('← ' + status + ' ' + error.message);
    if (status === 401) { storage.remove(TOKEN_KEY); onUnauthorized(); }
    return Promise.reject(error);
  }
);
// ---------- end client ----------

function App() {
  const [user, setUser] = React.useState(null);
  const [profile, setProfile] = React.useState(null);
  const [notice, setNotice] = React.useState('');
  const [, force] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    notifyLog = force;
    setUnauthorizedHandler(() => { setUser(null); setProfile(null); setNotice('Your session has expired. Please log in again.'); });
  }, []);

  const login = async () => {
    const { data } = await api.post('/auth/login', { username: 'averyp', password: 'averyppass', expiresInMins: 30 });
    storage.set(TOKEN_KEY, data.accessToken);
    setUser(data); setNotice('');
  };
  const loadProfile = async () => {
    try { const { data } = await api.get('/auth/me'); setProfile(data); } catch (e) { setProfile(null); }
  };

  return (
    <div>
      <div className="row">
        {!user ? <button onClick={login}>Log in as averyp</button> : <span>Logged in as <b>{user.username}</b></span>}
        <button onClick={loadProfile}>GET /auth/me</button>
        {user && <button onClick={() => { storage.set(TOKEN_KEY, 'invalid-token'); log('token corrupted by user'); }}>Corrupt token</button>}
      </div>
      {notice && <p role="alert" className="err">{notice}</p>}
      {profile && <p className="ok">Profile: {profile.firstName} {profile.lastName} · role {profile.role} · {profile.address.city}</p>}
      <div className="log" aria-label="Request log">{logLines.map((l, i) => <div key={logLines.length - i}>{l}</div>)}</div>
    </div>
  );
}`,
        css: CSS,
      },
      result: 'Before login, "GET /auth/me" logs "→ GET /auth/me [no token]" and "← 401 …". After "Log in as averyp" the same button logs "[Authorization: Bearer eyJhbGciOiJI…]", "← 200 OK" and shows Avery\'s profile. After "Corrupt token", the next request gets 401 and the app automatically logs out with "Your session has expired. Please log in again."',
      explanation:
        'Request interceptors run in order before every request and can modify the config, so the token is added in exactly one place. Response interceptors are chained like promise .then/.catch handlers, just like Axios. Because the client lives outside React, it cannot call hooks; instead the React side registers a callback (setUnauthorizedHandler) that the interceptor calls on 401. Logging the token prefix only (never the whole token) is a good habit for real logs too.',
    },
    {
      title: 'Auto-login on refresh with expiry check and a splash screen',
      scenario: 'When the user reloads the page they should stay logged in, without the login page flashing. If the stored token has expired, they must land on the login page. The "Reload app" button remounts the whole provider to simulate a browser refresh.',
      steps: [
        'In AuthProvider start with status: \'checking\'',
        'On mount: read the token, check exp with decodeJwt, then confirm with GET /auth/me',
        'Render a splash while checking; then the dashboard or the login form',
        'Log in with a 1-minute token, click "Reload app" (still logged in), wait 60 seconds, reload again (logged out)',
        'Add a storage-event listener so logging out in one tab logs out the others (see code)',
      ],
      code: `// features/auth/restoreSession.js
export async function restoreSession() {
  const token = tokenStore.get();
  if (!token) return null;
  if (isExpired(token)) { tokenStore.clear(); return null; }     // Day 42: try refresh instead
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch {
    tokenStore.clear();
    return null;
  }
}

// App.jsx
function Root() {
  const { status } = useAuth();
  if (status === 'checking') return <SplashScreen />;   // avoids the login-page flash
  return <RouterProvider router={router} />;
}`,
      playground: {
        jsx: AUTH_CORE + AUTH_CONTEXT + LOGIN_FORM + `
function Home() {
  const { user, token, logout } = useAuth();
  const [, tick] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => { const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);
  const left = Math.round(decodeJwt(token).exp - Date.now() / 1000);
  return (
    <div className="card">
      <div className="user"><img src={user.image} alt="" /><div><b>Welcome back, {user.firstName}!</b><div className="muted">Token valid for {left > 0 ? left + 's' : 'EXPIRED'}</div></div></div>
      <button className="primary" onClick={logout}>Log out</button>
    </div>
  );
}

function QuickLogin() {
  const { login } = useAuth();
  const [busy, setBusy] = React.useState(false);
  return (
    <div>
      <LoginForm />
      <div className="row">
        <button disabled={busy} onClick={async () => { setBusy(true); try { await login('emilys', 'emilyspass', 1); } finally { setBusy(false); } }}>
          Quick login with a 1-minute token
        </button>
      </div>
    </div>
  );
}

function Root() {
  const { status } = useAuth();
  if (status === 'checking') return <div className="card" aria-busy="true"><b>ShopKart</b><p className="muted">Checking your session…</p></div>;
  return status === 'authenticated' ? <Home /> : <QuickLogin />;
}

function App() {
  const [bootId, setBootId] = React.useState(1);
  return (
    <div>
      <div className="row">
        <button onClick={() => setBootId(n => n + 1)}>⟳ Reload app (simulate F5)</button>
        <span className="muted">boot #{bootId} · stored token: {storage.get(TOKEN_KEY) ? 'yes' : 'none'}</span>
      </div>
      <AuthProvider key={bootId}><Root /></AuthProvider>
    </div>
  );
}`,
        css: CSS,
      },
      result: 'After "Quick login with a 1-minute token" you see "Welcome back, Emily!" with a countdown. "Reload app" briefly shows "Checking your session…" and then the same welcome card (session restored from storage). After the countdown reaches EXPIRED, "Reload app" goes straight to the login form and "stored token" becomes "none".',
      explanation:
        'Changing the key on AuthProvider destroys and recreates it, exactly like a page refresh resets React state, while the token survives in storage. On mount the provider decodes exp locally to skip a pointless request for an expired token, and otherwise asks /auth/me so a revoked or tampered token is also rejected. The checking status renders a splash instead of the login page, so there is no flash or wrong redirect. Day 42 replaces "expired → log out" with a silent refresh.',
    },
  ],
  interview: [
    { q: 'What is a JWT and what are its parts?', a: 'A JSON Web Token is a compact, signed token: base64url(header).base64url(payload).signature. The header names the algorithm, the payload holds claims (sub/id, role, iat, exp) and the signature, made with the server\'s secret or private key, lets the server detect tampering.', level: 'Easy' },
    { q: 'Is the JWT payload encrypted? Can the frontend trust it?', a: 'No, it is only base64url-encoded, so anyone can read it. The frontend may read it for UI (name, expiry) but must not make security decisions from it; only the server verifies the signature and enforces permissions.', level: 'Easy' },
    { q: 'Where should you store tokens in a React app?', a: 'Best practice: short-lived access token in memory and refresh token in an httpOnly, Secure, SameSite cookie, so XSS cannot read the long-lived credential. localStorage is simple and common but readable by any injected script; if used, keep tokens short-lived and prevent XSS. Never store passwords.', level: 'Medium' },
    { q: 'localStorage vs httpOnly cookie: XSS and CSRF?', a: 'localStorage is vulnerable to XSS (scripts can read it) but not to CSRF (it is not sent automatically). httpOnly cookies are safe from XSS reading but are sent automatically, so they need CSRF protection (SameSite=Lax/Strict, CSRF tokens).', level: 'Hard' },
    { q: 'How do you add the token to every API request?', a: 'With an Axios request interceptor (or a fetch wrapper) that reads the token from a token store and sets config.headers.Authorization = "Bearer " + token. Components never set the header themselves.', level: 'Easy' },
    { q: 'How do you design an AuthContext?', a: 'An AuthProvider holding status (checking | authenticated | guest), user and functions login, logout, register; a memoised value; a useAuth hook that throws if used outside the provider. Token persistence and API calls are hidden inside the provider/token store.', level: 'Medium' },
    { q: 'How does auto-login after refresh work?', a: 'On mount the provider is in "checking" state; it reads the stored token (or calls a refresh endpoint), checks exp, calls /me to validate and fetch the user, then sets authenticated or guest. A splash screen is shown while checking to avoid flashing the login page.', level: 'Medium' },
    { q: 'What should logout do?', a: 'Remove tokens, call the server to revoke the refresh token/session, clear cached private data (TanStack Query cache, Redux), reset auth state, redirect to /login with replace, and optionally broadcast the logout to other tabs.', level: 'Medium' },
    { q: 'How do you sync logout across browser tabs?', a: 'Listen for the window "storage" event (fires in other tabs when localStorage changes) and log out when the token key is removed, or use BroadcastChannel to post a logout message.', level: 'Hard' },
    { q: 'Why show "Invalid username or password" instead of "User not found"?', a: 'Specific messages let attackers enumerate which usernames/emails exist. A generic message for both cases is a standard security practice, together with rate limiting on the server.', level: 'Medium' },
    { q: 'What HTTP status codes matter for auth?', a: '401 Unauthorized: not authenticated (missing, invalid or expired token): log in or refresh. 403 Forbidden: authenticated but not allowed (wrong role): show an access-denied page. 400/422 for invalid login input.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write a tokenStore module with get, set and clear that keeps the token in memory and mirrors it to localStorage only when "Remember me" is ticked (otherwise sessionStorage).',
      hint: 'Keep a module-level variable; on load, read from localStorage first, then sessionStorage.',
      solution: `// features/auth/tokenStore.js
const KEY = 'app.accessToken';
let memoryToken = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);

export const tokenStore = {
  get: () => memoryToken,
  set: (token, { remember = false } = {}) => {
    memoryToken = token;
    (remember ? localStorage : sessionStorage).setItem(KEY, token);
    (remember ? sessionStorage : localStorage).removeItem(KEY);
  },
  clear: () => {
    memoryToken = null;
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  },
};

// in login()
tokenStore.set(data.accessToken, { remember: values.rememberMe });`,
    },
    {
      task: 'Add a "Log out of all tabs" feature: when the user logs out in one tab, every other open tab shows the login page.',
      hint: 'Use BroadcastChannel; fall back to the storage event.',
      solution: `// inside AuthProvider
const channelRef = useRef(null);

useEffect(() => {
  const channel = new BroadcastChannel('auth');
  channelRef.current = channel;
  channel.onmessage = e => {
    if (e.data === 'logout') {
      tokenStore.clear();
      setState({ status: 'guest', user: null });
    }
  };
  return () => channel.close();
}, []);

const logout = useCallback(() => {
  tokenStore.clear();
  queryClient.clear();
  setState({ status: 'guest', user: null });
  channelRef.current?.postMessage('logout');   // tell the other tabs
}, []);`,
    },
    {
      task: 'Build the register page with React Hook Form + Zod: name, email, password (8+ chars, 1 number, 1 symbol), confirm password. On success, log the user in and navigate to /onboarding.',
      hint: 'Use z.object(...).refine for confirm password and zodResolver.',
      solution: `import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters')
    .regex(/\\d/, 'Add a number').regex(/[^A-Za-z0-9]/, 'Add a symbol'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export default function RegisterPage() {
  const { register: signUp, login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async values => {
    try {
      await signUp(values);
      await login({ username: values.email, password: values.password });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError('root', { message: err.response?.data?.message ?? 'Could not create account' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input {...register('name')} autoComplete="name" aria-invalid={!!errors.name} />
      {errors.name && <p role="alert">{errors.name.message}</p>}
      <input {...register('email')} type="email" autoComplete="email" />
      {errors.email && <p role="alert">{errors.email.message}</p>}
      <input {...register('password')} type="password" autoComplete="new-password" />
      {errors.password && <p role="alert">{errors.password.message}</p>}
      <input {...register('confirm')} type="password" autoComplete="new-password" />
      {errors.confirm && <p role="alert">{errors.confirm.message}</p>}
      {errors.root && <p role="alert">{errors.root.message}</p>}
      <button disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Create account'}</button>
    </form>
  );
}`,
    },
    {
      task: 'Write a useAuthFetch() hook that returns a fetch function which automatically adds the Bearer token and calls logout() on 401.',
      hint: 'Wrap window.fetch; read the token from useAuth().',
      solution: `export function useAuthFetch() {
  const { token, logout } = useAuth();
  return useCallback(async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: { ...options.headers, ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    });
    if (res.status === 401) {
      logout();
      throw new Error('Session expired');
    }
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }, [token, logout]);
}

// usage
const authFetch = useAuthFetch();
const orders = await authFetch('/api/orders');`,
    },
    {
      task: 'Show a "Your session will expire in 2 minutes" banner with a "Stay logged in" button, based on the token\'s exp claim.',
      hint: 'Compute msLeft = exp * 1000 - Date.now() and set a timeout for msLeft - 120000.',
      solution: `function SessionExpiryWarning() {
  const { token, logout, refresh } = useAuth();   // refresh() arrives on Day 42
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!token) return;
    const msLeft = decodeJwt(token).exp * 1000 - Date.now();
    const warnId = setTimeout(() => setShow(true), Math.max(0, msLeft - 120000));
    const outId = setTimeout(() => logout(), Math.max(0, msLeft));
    return () => { clearTimeout(warnId); clearTimeout(outId); setShow(false); };
  }, [token, logout]);

  if (!show) return null;
  return (
    <div role="alertdialog" aria-live="assertive" className="banner">
      Your session will expire in 2 minutes.
      <button onClick={refresh}>Stay logged in</button>
      <button onClick={logout}>Log out</button>
    </div>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'What are the three parts of a JWT?',
      options: ['user.password.salt', 'header.payload.signature', 'key.value.expiry', 'id.token.refresh'],
      answer: 1,
      explanation: 'A JWT is base64url(header).base64url(payload).signature.',
    },
    {
      question: 'Which header usually carries the access token?',
      options: ['Cookie: token=…', 'X-Token: …', 'Content-Type: jwt', 'Authorization: Bearer <token>'],
      answer: 3,
      explanation: 'The Bearer scheme in the Authorization header is the standard.',
    },
    {
      question: 'Which storage option prevents JavaScript (and therefore XSS) from reading the token?',
      options: ['httpOnly cookie', 'localStorage', 'sessionStorage', 'IndexedDB'],
      answer: 0,
      explanation: 'httpOnly cookies are invisible to document.cookie and scripts.',
    },
    {
      question: 'Why does AuthProvider start with status "checking"?',
      options: ['To slow down the login form', 'Because Context needs an initial value', 'To avoid flashing the login page while the stored session is being validated', 'Because JWTs need decoding first'],
      answer: 2,
      explanation: 'Until the token is validated the app does not know if the user is logged in.',
    },
    {
      question: 'The exp claim in a JWT payload is 1795157333. How do you get a JavaScript Date?',
      options: ['new Date(exp)', 'new Date(exp * 1000)', 'Date.parse(exp)', 'new Date(exp / 1000)'],
      answer: 1,
      explanation: 'JWT times are in seconds; JavaScript dates use milliseconds.',
    },
  ],
};
