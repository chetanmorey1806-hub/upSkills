export default {
  id: 'day-08-authentication-ui-mern',
  title: 'Authentication UI in MERN Apps: Login/Register Flows, Token Storage, Protected and Role-Based Routes with React Router 7, Auto-Refresh on 401',
  module: 'Module 3: Patterns & Performance',
  day: 8,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Authentication is asked about in almost every MERN interview and is where many projects have security holes. Build the complete frontend side: login/register/logout flows, where to keep tokens (httpOnly cookie vs localStorage vs memory) and why, an AuthProvider that restores the session on refresh, protected and role-based routes with React Router 7, and an axios interceptor that silently refreshes the access token on 401 and retries queued requests.',
  objectives: [
    'Compare token storage options with respect to XSS and CSRF and choose a safe default',
    'Implement the access token (memory) + refresh token (httpOnly cookie) pattern end to end',
    'Restore the session on page load and avoid "flash of login page"',
    'Protect routes and roles with layout routes in React Router 7 and redirect back after login',
    'Write a 401 refresh interceptor that handles concurrent requests and logout on failure',
  ],
  theory: [
    {
      heading: 'The big picture: session flow in a MERN app',
      content:
        'A typical secure JWT flow between React and Express:\n\n1. **Login**: React POSTs credentials to `/api/auth/login`. Express verifies the bcrypt hash and returns a **short-lived access token** (5-15 min) in the JSON body and sets a **long-lived refresh token** (7-30 days) in an **httpOnly, Secure, SameSite** cookie.\n2. **API calls**: React sends `Authorization: Bearer <accessToken>`. Express middleware verifies it.\n3. **Expiry**: when the access token expires, the API returns **401**. The axios interceptor calls `/api/auth/refresh`; the browser automatically sends the refresh cookie; Express verifies it (and ideally **rotates** it, storing a hash in MongoDB) and returns a new access token. The original request is retried.\n4. **Page reload**: memory is wiped, so on startup React calls `/api/auth/refresh` (or `/api/auth/me`) to restore the session.\n5. **Logout**: POST `/api/auth/logout` clears the cookie and deletes the refresh token on the server; React clears its state and the query cache.\n\nAlternative used by many projects: **one session cookie only** (httpOnly JWT or express-session). Simpler for same-site apps; React just calls `/api/auth/me` to know who is logged in.',
    },
    {
      heading: 'Where to store tokens: httpOnly cookie vs localStorage vs memory',
      content:
        '- **localStorage / sessionStorage**: easy and survives refresh, but **any JavaScript on the page can read it**. One XSS bug (a vulnerable npm package, unsafe `dangerouslySetInnerHTML`, a third-party script) lets an attacker steal the token and use it from their own machine for its whole lifetime. Not recommended for long-lived tokens.\n- **httpOnly cookie**: JavaScript **cannot read it**, so XSS cannot steal it (though XSS can still make requests while the user is on the page). The browser sends it automatically, which brings **CSRF** risk; mitigate with `SameSite=Lax/Strict`, CSRF tokens for cookie-authenticated state-changing requests, and strict CORS. Needs `withCredentials: true` in axios and `credentials: true` + exact `origin` in Express CORS.\n- **In-memory (React state / module variable / Zustand without persist)**: not readable after XSS as easily as localStorage, lost on refresh, so pair it with a refresh cookie.\n\n**Recommended default**: access token in memory + refresh token in an httpOnly Secure SameSite cookie, with refresh token rotation. Interview answer: "No storage is perfectly safe against XSS, so we also prevent XSS (React escaping, CSP, sanitising HTML with DOMPurify), keep tokens short-lived and rotate refresh tokens."',
      syntax:
        "// Express: set the refresh cookie\nres.cookie('refreshToken', refreshToken, {\n  httpOnly: true,\n  secure: process.env.NODE_ENV === 'production',\n  sameSite: 'strict',            // 'none' + secure if frontend and API are on different sites\n  path: '/api/auth',             // only sent to auth endpoints\n  maxAge: 7 * 24 * 60 * 60 * 1000,\n});\nres.json({ accessToken, user: { _id, name, email, role } });\n\n// Express CORS for cookies\napp.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));",
    },
    {
      heading: 'AuthProvider: user state, bootstrapping and logout',
      content:
        'Keep auth state in one place: a context (or a Zustand store) exposing `user`, `status` (`\'checking\' | \'authenticated\' | \'guest\'`), `login`, `register`, `logout`.\n\nKey details:\n- On mount, call `/auth/refresh` once to restore the session. While it runs, `status === \'checking\'`; render a splash/skeleton, **not** the login page, to avoid the "flash of login" and wrong redirects.\n- Store the access token in a **module variable** (`tokenStore.set(token)`) that the axios interceptor can read without React.\n- On logout: call the API, clear the token, set user to null, and `queryClient.clear()` so the next user does not see cached private data.\n- Sync logout across tabs with a `BroadcastChannel(\'auth\')` or the `storage` event.\n- Never trust the client for authorization. Hiding an admin button is UX; the Express API must still check roles.',
    },
    {
      heading: 'Protected and role-based routes in React Router 7',
      content:
        'React Router 7 (the successor of v6 and Remix; import from `react-router`) supports two styles: declarative `<Routes>` or a **data router** with `createBrowserRouter`. In both, protection is done with **layout routes** that render `<Outlet />` when allowed and `<Navigate>` otherwise:\n\n- `<RequireAuth>`: if checking, show a loader; if guest, `<Navigate to="/login" replace state={{ from: location }} />`.\n- `<RequireRole roles={[\'admin\']}>`: if the role does not match, show a 403 page or navigate to `/unauthorized`.\n- `<GuestOnly>`: logged-in users visiting `/login` go to the dashboard.\n\nAfter login, redirect back: `navigate(location.state?.from?.pathname ?? \'/dashboard\', { replace: true })`.\n\nWith data routers you can also protect in **loaders** (`throw redirect(\'/login\')`) so data for a protected page is never requested by a guest; note loaders run outside React, so read auth from a store, not a hook.',
      syntax:
        "import { Navigate, Outlet, useLocation } from 'react-router';\n\nexport function RequireAuth({ roles }) {\n  const { user, status } = useAuth();\n  const location = useLocation();\n  if (status === 'checking') return <FullPageSpinner />;\n  if (!user) return <Navigate to=\"/login\" replace state={{ from: location }} />;\n  if (roles && !roles.includes(user.role)) return <Navigate to=\"/unauthorized\" replace />;\n  return <Outlet />;\n}\n\n// routes\n<Route element={<RequireAuth />}>\n  <Route path=\"/dashboard\" element={<Dashboard />} />\n  <Route path=\"/orders\" element={<Orders />} />\n</Route>\n<Route element={<RequireAuth roles={['admin']} />}>\n  <Route path=\"/admin/*\" element={<AdminLayout />} />\n</Route>",
    },
    {
      heading: 'Auto-refresh on 401 with a request queue',
      content:
        'When the access token expires, several requests may fail with 401 **at the same time** (dashboard loads 4 widgets). If each one calls `/refresh`, you get 4 refresh calls and, with rotation, all but the first fail and log the user out. Correct approach:\n\n1. In the response interceptor, if `status === 401`, the request has not been retried yet (`config._retry`), and it is not the refresh call itself:\n2. If a refresh is **already in progress**, wait for the same promise.\n3. Otherwise start one refresh and store the promise (`refreshPromise`).\n4. When it resolves, set the new token and **retry** the original request with the new header.\n5. If refresh fails (refresh token expired/revoked), clear auth and redirect to `/login`.\n\nAlso consider: proactive refresh shortly before expiry (decode `exp`), and handling 403 (forbidden) differently from 401 (unauthenticated).',
    },
    {
      heading: 'Login / register UX and security checklist',
      content:
        '- Use React Hook Form + Zod (Day 5); show server errors like "Invalid email or password" as a **root** error (do not reveal which one is wrong).\n- Disable the submit button while pending; prevent double submit.\n- Use correct `autoComplete` values (`email`, `current-password`, `new-password`) so password managers work.\n- Show/hide password toggle with an accessible label.\n- Rate limiting and account lockout are server-side (express-rate-limit), but show friendly 429 messages.\n- Email verification and password reset links contain one-time tokens; the React page reads them with `useParams`/`useSearchParams` and posts them to the API.\n- OAuth ("Login with Google"): redirect to the backend OAuth route (Passport.js) or use Google Identity Services; the backend sets the same cookies at the end.\n- Never log tokens, never put them in URLs, and clear sensitive state on logout.',
    },
  ],
  examples: [
    {
      title: 'AuthProvider with session restore (real code)',
      scenario: 'A Vite + Express app that keeps the access token in memory and restores the session using the refresh cookie.',
      steps: [
        'Create tokenStore (module variable) used by axios',
        'AuthProvider calls /auth/refresh on mount and tracks status',
        'Expose login, register and logout; clear the query cache on logout',
        'Use status === "checking" to show a splash screen',
      ],
      code: `// lib/tokenStore.js
let accessToken = null;
export const tokenStore = { get: () => accessToken, set: (t) => { accessToken = t; } };

// auth/AuthProvider.jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('checking');
  const queryClient = useQueryClient();

  useEffect(() => {
    let ignore = false;
    api.post('/auth/refresh')
      .then(({ data }) => { if (ignore) return; tokenStore.set(data.accessToken); setUser(data.user); setStatus('authenticated'); })
      .catch(() => { if (!ignore) setStatus('guest'); });
    return () => { ignore = true; };
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    tokenStore.set(data.accessToken);
    setUser(data.user);
    setStatus('authenticated');
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } finally {
      tokenStore.set(null);
      setUser(null);
      setStatus('guest');
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout]);
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}`,
      result: 'Refreshing the page keeps the user logged in (via the cookie) without storing any token in localStorage.',
      explanation:
        'The access token lives only in memory, so a page reload loses it; the httpOnly refresh cookie survives and /auth/refresh returns a new access token plus the user. The ignore flag makes the effect safe under StrictMode.',
    },
    {
      title: 'Protected and role-based routes (playground simulation)',
      scenario: 'A mini app with Home, Dashboard (logged-in users) and Admin (admin role). Visiting a protected page as a guest redirects to Login and then back.',
      steps: [
        'Build a tiny in-memory router (path state + navigate) to simulate React Router',
        'Create RequireAuth that redirects guests to /login and remembers "from"',
        'Login as user or admin; see role-based access',
        'Compare with the real React Router 7 code in the code tab',
      ],
      code: `// React Router 7
import { createBrowserRouter, RouterProvider } from 'react-router';

const router = createBrowserRouter([
  { path: '/', element: <RootLayout />, children: [
    { index: true, element: <Home /> },
    { element: <GuestOnly />, children: [{ path: 'login', element: <Login /> }] },
    { element: <RequireAuth />, children: [{ path: 'dashboard', element: <Dashboard /> }] },
    { element: <RequireAuth roles={['admin']} />, children: [{ path: 'admin', element: <Admin /> }] },
    { path: 'unauthorized', element: <Unauthorized /> },
  ]},
]);

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const onSubmit = async (values) => { await login(values); navigate(from, { replace: true }); };
  ...
}`,
      playground: {
        jsx: `const { useState, createContext, useContext } = React;

const RouterCtx = createContext(null);
const AuthCtx = createContext(null);
const useRouter = () => useContext(RouterCtx);
const useAuth = () => useContext(AuthCtx);

function Navigate({ to, state }) {
  const { navigate } = useRouter();
  React.useEffect(() => { navigate(to, state); }, []);
  return null;
}

function RequireAuth({ roles, children }) {
  const { user } = useAuth();
  const { path } = useRouter();
  if (!user) return <Navigate to="/login" state={{ from: path }} />;
  if (roles && !roles.includes(user.role)) return <p style={{ color: 'crimson' }}>403: {user.name} ({user.role}) cannot open {path}</p>;
  return children;
}

function Login() {
  const { login } = useAuth();
  const { navigate, state } = useRouter();
  const from = (state && state.from) || '/dashboard';
  const go = (role) => { login({ name: role === 'admin' ? 'Asha' : 'Ravi', role }); navigate(from); };
  return (
    <div>
      <h3>Login</h3>
      {state && state.from && <p>You must log in to see <b>{state.from}</b></p>}
      <button onClick={() => go('user')}>Login as user</button>{' '}
      <button onClick={() => go('admin')}>Login as admin</button>
    </div>
  );
}

function Page({ path }) {
  if (path === '/') return <h3>Home (public)</h3>;
  if (path === '/login') return <Login />;
  if (path === '/dashboard') return <RequireAuth><h3>Dashboard: your orders</h3></RequireAuth>;
  if (path === '/admin') return <RequireAuth roles={['admin']}><h3>Admin panel: all users</h3></RequireAuth>;
  return <h3>404</h3>;
}

function App() {
  const [route, setRoute] = useState({ path: '/', state: null });
  const [user, setUser] = useState(null);
  const navigate = (path, state = null) => setRoute({ path, state });
  const link = (p) => <a href="#" onClick={e => { e.preventDefault(); navigate(p); }} style={{ marginRight: 12, fontWeight: route.path === p ? 'bold' : 'normal' }}>{p}</a>;
  return (
    <AuthCtx.Provider value={{ user, login: setUser, logout: () => setUser(null) }}>
      <RouterCtx.Provider value={{ ...route, navigate }}>
        <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
          <nav>{link('/')}{link('/dashboard')}{link('/admin')}
            {user ? <span>Hi {user.name} ({user.role}) <button onClick={() => { setUser(null); navigate('/'); }}>Logout</button></span> : link('/login')}
          </nav>
          <p style={{ color: '#888' }}>URL: {route.path}</p>
          <Page path={route.path} />
        </div>
      </RouterCtx.Provider>
    </AuthCtx.Provider>
  );
}`,
      },
      result: 'Clicking /admin as a guest redirects to Login with a message; logging in as user sends you back to /admin with a 403; logging in as admin shows the admin panel.',
      explanation:
        'The guard checks authentication first (redirect to login, remembering where the user wanted to go) and authorization second (role). React Router\'s <Navigate replace state={{ from }}> and useLocation do exactly what the tiny router does here.',
    },
    {
      title: 'Axios interceptor: refresh once, retry all queued requests',
      scenario: 'The dashboard fires 4 requests just after the access token expired. Only one /refresh call must be made.',
      steps: [
        'Attach the access token in a request interceptor',
        'On 401, share a single refreshPromise between all failing requests',
        'Retry each original request with the new token',
        'If refresh fails, clear auth and go to /login',
        'Run the playground simulation and watch the log',
      ],
      code: `import axios from 'axios';
import { tokenStore } from './tokenStore';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isRefreshCall = original?.url?.includes('/auth/refresh');
    if (error.response?.status !== 401 || original._retry || isRefreshCall) {
      return Promise.reject(error);
    }
    original._retry = true;
    try {
      refreshPromise ??= api.post('/auth/refresh').then(({ data }) => {
        tokenStore.set(data.accessToken);
        return data.accessToken;
      }).finally(() => { refreshPromise = null; });

      const newToken = await refreshPromise;
      original.headers.Authorization = \`Bearer \${newToken}\`;
      return api(original);                       // retry
    } catch (refreshError) {
      tokenStore.set(null);
      window.dispatchEvent(new Event('auth:logout')); // AuthProvider listens and navigates to /login
      return Promise.reject(refreshError);
    }
  }
);`,
      playground: {
        jsx: `const { useState } = React;
const wait = (ms) => new Promise(r => setTimeout(r, ms));

function App() {
  const [log, setLog] = useState([]);
  const add = (m) => setLog(l => [...l, m]);

  async function runDemo(refreshShouldFail) {
    setLog([]);
    let token = 'expired-token';
    let refreshCalls = 0;
    let refreshPromise = null;

    async function server(url, t) {          // fake Express API
      await wait(200);
      if (t !== 'fresh-token') { const e = new Error('401'); e.status = 401; throw e; }
      return url + ' OK';
    }
    async function refresh() {
      refreshCalls++; add('POST /auth/refresh (call #' + refreshCalls + ')');
      await wait(500);
      if (refreshShouldFail) throw new Error('refresh token expired');
      token = 'fresh-token'; return token;
    }
    async function request(url) {            // what the interceptor does
      try { return await server(url, token); }
      catch (e) {
        if (e.status !== 401) throw e;
        add(url + ' -> 401, waiting for refresh');
        if (!refreshPromise) refreshPromise = refresh().finally(() => { refreshPromise = null; });
        const t = await refreshPromise;
        return server(url, t);               // retry once
      }
    }

    const urls = ['/api/me', '/api/orders', '/api/cart', '/api/notifications'];
    const results = await Promise.allSettled(urls.map(request));
    results.forEach((r, i) => add(r.status === 'fulfilled' ? 'retried: ' + r.value : urls[i] + ' FAILED: ' + r.reason.message));
    add(refreshShouldFail ? '=> clear token, redirect to /login' : '=> total refresh calls: ' + refreshCalls);
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <button onClick={() => runDemo(false)}>4 requests with expired token</button>{' '}
      <button onClick={() => runDemo(true)}>...and refresh also fails</button>
      <pre style={{ background: '#111', color: '#0f0', padding: 10, minHeight: 160 }}>{log.join('\\n')}</pre>
    </div>
  );
}`,
      },
      result: 'Four 401s trigger exactly one refresh call, then all four requests succeed. When refresh fails, all four fail and the app logs out.',
      explanation:
        'Sharing one promise turns concurrent refresh attempts into a single network call (important when the server rotates refresh tokens). The _retry flag prevents infinite loops, and excluding the refresh URL prevents the interceptor from refreshing its own refresh call.',
    },
    {
      title: 'Login form with redirect-back, root errors and password toggle',
      scenario: 'The login page users see after being redirected from a protected route.',
      steps: [
        'Read from = location.state?.from?.pathname',
        'Submit with RHF; on 401 set a generic root error',
        'Add autoComplete attributes and a show/hide password button',
      ],
      code: `export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/dashboard';
  const [show, setShow] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.status === 429 ? 'Too many attempts. Try again in a minute.' : 'Invalid email or password';
      setError('root.serverError', { message: msg });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>Email <input type="email" autoComplete="email" {...register('email')} /></label>
      <label>Password
        <input type={show ? 'text' : 'password'} autoComplete="current-password" {...register('password')} />
        <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? 'Hide' : 'Show'}
        </button>
      </label>
      {errors.root?.serverError && <p role="alert">{errors.root.serverError.message}</p>}
      <button disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in'}</button>
    </form>
  );
}`,
      result: 'After a successful login the user lands on the page they originally requested; wrong credentials show one generic message.',
      explanation:
        'replace: true removes /login from history so Back does not return to the form. A generic error avoids leaking which emails are registered. autoComplete helps password managers and accessibility.',
    },
  ],
  interview: [
    { q: 'Where should you store a JWT in a React app?', a: 'Preferably keep the short-lived access token in memory and the refresh token in an httpOnly, Secure, SameSite cookie. localStorage is readable by any script, so an XSS bug can steal tokens. Cookies need CSRF protection (SameSite, CSRF tokens) and CORS with credentials.', level: 'Medium' },
    { q: 'What is the difference between XSS and CSRF in the context of auth?', a: 'XSS: attacker runs JavaScript in your page; can read localStorage tokens and act as the user. CSRF: attacker site makes the browser send a request to your API with cookies attached automatically. httpOnly cookies defend against token theft via XSS but need CSRF defences; bearer tokens in headers are not sent automatically so CSRF is not an issue but XSS theft is.', level: 'Hard' },
    { q: 'Why use both access and refresh tokens?', a: 'Access tokens are short-lived to limit damage if leaked and are verified statelessly. Refresh tokens are long-lived, stored more securely (httpOnly cookie), can be revoked/rotated in the database, and are used only to obtain new access tokens.', level: 'Medium' },
    { q: 'What is refresh token rotation?', a: 'Every refresh issues a new refresh token and invalidates the old one. If an old token is reused (possible theft), the server detects it and revokes the whole token family, logging out all sessions for that chain.', level: 'Hard' },
    { q: 'How do you implement a protected route in React Router 7?', a: 'Create a layout route component that reads auth state; if checking, render a loader; if not logged in, return <Navigate to="/login" replace state={{ from: location }} />; otherwise render <Outlet />. Nest protected routes under it. With data routers you can also throw redirect() in loaders.', level: 'Easy' },
    { q: 'How do you prevent the login page flashing on refresh for logged-in users?', a: 'Track an auth status with a "checking" state while the session is being restored (/auth/refresh or /auth/me) and render a splash instead of redirecting until the check is done.', level: 'Medium' },
    { q: 'How does the 401 auto-refresh interceptor avoid infinite loops and duplicate refreshes?', a: 'It marks requests with _retry so each is retried once, skips the refresh endpoint itself, and stores a single in-flight refresh promise that all concurrent 401 requests await. On refresh failure it logs out.', level: 'Hard' },
    { q: 'Is hiding admin buttons in React enough for role-based access?', a: 'No. Frontend checks are only UX; anyone can call the API directly. Express must verify the token and the role on every protected endpoint (e.g. authorize("admin") middleware).', level: 'Easy' },
    { q: 'What CORS settings are needed for cookie-based auth between React (5173) and Express (5000)?', a: 'Express: cors({ origin: "http://localhost:5173", credentials: true }) (no wildcard origin). Frontend: axios withCredentials: true or fetch credentials: "include". In production cross-site cookies also need SameSite=None; Secure (or put both behind the same domain/proxy).', level: 'Medium' },
    { q: 'What should happen on logout in the frontend?', a: 'Call the logout API (clears cookie and revokes refresh token), clear the in-memory token and user state, clear cached server data (queryClient.clear() or RTK Query resetApiState), notify other tabs, and navigate to the login or home page.', level: 'Medium' },
    { q: 'How do you redirect the user back to the page they wanted after login?', a: 'When redirecting to /login, pass state={{ from: location }}. After successful login read location.state?.from?.pathname and navigate there with replace: true, defaulting to the dashboard.', level: 'Easy' },
    { q: 'Should JWTs be decoded on the client?', a: 'You may decode (not verify) the payload to read exp for proactive refresh or display info, using jwt-decode. Never rely on it for security; the signature can only be verified on the server with the secret.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a <GuestOnly> layout route that redirects logged-in users away from /login and /register to /dashboard.',
      hint: 'Mirror RequireAuth.',
      solution: `import { Navigate, Outlet } from 'react-router';

export function GuestOnly() {
  const { user, status } = useAuth();
  if (status === 'checking') return <FullPageSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// <Route element={<GuestOnly />}>
//   <Route path="/login" element={<Login />} />
//   <Route path="/register" element={<Register />} />
// </Route>`,
    },
    {
      task: 'Make logout sync across browser tabs using BroadcastChannel: when one tab logs out, others clear state and navigate to /login.',
      hint: 'Post a message in logout and listen in AuthProvider.',
      solution: `const channel = new BroadcastChannel('auth');

// inside AuthProvider
useEffect(() => {
  const onMessage = (e) => {
    if (e.data === 'logout') {
      tokenStore.set(null);
      setUser(null);
      setStatus('guest');
      queryClient.clear();
      window.location.assign('/login');
    }
  };
  channel.addEventListener('message', onMessage);
  return () => channel.removeEventListener('message', onMessage);
}, [queryClient]);

const logout = useCallback(async () => {
  try { await api.post('/auth/logout'); } finally {
    tokenStore.set(null); setUser(null); setStatus('guest'); queryClient.clear();
    channel.postMessage('logout');
  }
}, [queryClient]);`,
    },
    {
      task: 'Write the Express side for the refresh flow: POST /api/auth/refresh reads the cookie, verifies it, rotates it and returns a new access token and user.',
      hint: 'Use jsonwebtoken and cookie-parser; store a hash of the refresh token on the user document.',
      solution: `router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No session' });
  try {
    const payload = jwt.verify(token, process.env.REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    if (!user || user.refreshTokenHash !== hash) {
      if (user) { user.refreshTokenHash = null; await user.save(); }   // reuse detected
      return res.status(401).json({ message: 'Session expired' });
    }
    const accessToken = jwt.sign({ sub: user._id, role: user.role }, process.env.ACCESS_SECRET, { expiresIn: '15m' });
    const newRefresh = jwt.sign({ sub: user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
    user.refreshTokenHash = crypto.createHash('sha256').update(newRefresh).digest('hex');
    await user.save();
    res.cookie('refreshToken', newRefresh, { httpOnly: true, secure: true, sameSite: 'strict', path: '/api/auth', maxAge: 7 * 864e5 });
    res.json({ accessToken, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(401).json({ message: 'Session expired' });
  }
});`,
    },
    {
      task: 'Build a <Can permission="orders:delete"> component that renders children only if the current user\'s role has that permission, using a role-permission map.',
      hint: 'const permissions = { admin: [...], seller: [...] }.',
      solution: `const permissions = {
  admin: ['orders:read', 'orders:delete', 'users:manage'],
  seller: ['orders:read', 'products:manage'],
  customer: ['orders:read'],
};

export function useCan(permission) {
  const { user } = useAuth();
  return !!user && (permissions[user.role] ?? []).includes(permission);
}

export function Can({ permission, children, fallback = null }) {
  return useCan(permission) ? children : fallback;
}

// usage
<Can permission="orders:delete"><button onClick={remove}>Delete order</button></Can>
// Reminder: the API must enforce the same rule.`,
    },
  ],
  quiz: [
    { question: 'Which storage can JavaScript NOT read?', options: ['localStorage', 'sessionStorage', 'An httpOnly cookie', 'A React state variable'], answer: 2, explanation: 'httpOnly cookies are sent by the browser but are invisible to document.cookie.' },
    { question: 'What does the _retry flag in the interceptor prevent?', options: ['CORS errors', 'Retrying the same request forever', 'XSS', 'Slow requests'], answer: 1, explanation: 'Each request is retried at most once after refreshing.' },
    { question: 'Four requests get 401 at the same time. How many refresh calls should be made?', options: ['One', 'Four', 'Zero', 'Two'], answer: 0, explanation: 'All requests should await one shared refresh promise.' },
    { question: 'Which axios option is required to send cookies to a different-origin API?', options: ['credentials: "omit"', 'mode: "cors"', 'xsrfCookieName', 'withCredentials: true'], answer: 3, explanation: 'withCredentials makes the browser include cookies cross-origin.' },
    { question: 'Why pass state={{ from: location }} when redirecting to /login?', options: ['To encrypt the URL', 'React Router requires it', 'To keep the token', 'To return the user to the requested page after login'], answer: 3, explanation: 'The login page reads it and navigates back after success.' },
  ],
};
