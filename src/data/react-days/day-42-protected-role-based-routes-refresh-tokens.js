// Mini router + auth used by the playgrounds (plain React learning version: React Router cannot be imported in the playground)
const MINI_ROUTER = `// ---------- mini router (learning version of React Router, plain React) ----------
const routerStore = (() => {
  let loc = { pathname: '/', state: null };
  const listeners = new Set();
  return {
    get: () => loc,
    subscribe: l => { listeners.add(l); return () => listeners.delete(l); },
    navigate: (pathname, opts = {}) => {
      loc = { pathname, state: opts.state || null };
      console.log((opts.replace ? 'replace → ' : 'push → ') + pathname);
      listeners.forEach(l => l());
    },
  };
})();
const useLocation = () => React.useSyncExternalStore(routerStore.subscribe, routerStore.get, routerStore.get);
const useNavigate = () => routerStore.navigate;

function Navigate({ to, replace, state }) {
  React.useEffect(() => { routerStore.navigate(to, { replace, state }); }, [to]);
  return null;
}
function Link({ to, children }) {
  const loc = useLocation();
  return (
    <a href={'#' + to} aria-current={loc.pathname === to ? 'page' : undefined}
      onClick={e => { e.preventDefault(); routerStore.navigate(to); }}>{children}</a>
  );
}
function Routes({ routes }) {
  const { pathname } = useLocation();
  const route = routes.find(r => r.path === pathname) || routes.find(r => r.path === '*');
  return route ? route.element : null;
}
function AddressBar() {
  const { pathname } = useLocation();
  return <div className="addr"><code>shopkart.in{pathname}</code></div>;
}
// ---------- end mini router ----------
`;

const AUTH = `// ---------- auth (real dummyjson API; tokens kept in memory) ----------
// emilys/emilyspass = admin · oliviaw/oliviawpass = moderator · averyp/averyppass = user
const API = 'https://dummyjson.com';
async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || 'HTTP ' + res.status), { status: res.status });
  return data;
}

const AuthContext = React.createContext(null);
function AuthProvider({ children }) {
  const [state, setState] = React.useState({ status: 'guest', user: null, token: null });
  const login = React.useCallback(async (username, password) => {
    const data = await request('/auth/login', { method: 'POST', body: { username, password, expiresInMins: 30 } });
    const user = await request('/auth/me', { token: data.accessToken });
    setState({ status: 'authenticated', user, token: data.accessToken });
    return user;
  }, []);
  const logout = React.useCallback(() => setState({ status: 'guest', user: null, token: null }), []);
  const value = React.useMemo(() => ({ ...state, login, logout }), [state, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [busy, setBusy] = React.useState('');
  const [error, setError] = React.useState('');
  const from = (location.state && location.state.from) || '/dashboard';
  const quick = async (u, p) => {
    setBusy(u); setError('');
    try { await login(u, p); navigate(from, { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(''); }
  };
  return (
    <div className="card">
      <h3>Log in</h3>
      {location.state && location.state.from && <p className="muted">Please log in to open <b>{location.state.from}</b></p>}
      <div className="row">
        <button disabled={!!busy} onClick={() => quick('emilys', 'emilyspass')}>{busy === 'emilys' ? '…' : 'Emily (admin)'}</button>
        <button disabled={!!busy} onClick={() => quick('oliviaw', 'oliviawpass')}>{busy === 'oliviaw' ? '…' : 'Olivia (moderator)'}</button>
        <button disabled={!!busy} onClick={() => quick('averyp', 'averyppass')}>{busy === 'averyp' ? '…' : 'Avery (user)'}</button>
      </div>
      {error && <p role="alert" className="err">{error}</p>}
    </div>
  );
}
// ---------- end auth ----------
`;

const CSS = `.addr{background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:6px 10px;font-size:13px;margin-bottom:10px}
nav.top{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid #e2e8f0;margin-bottom:10px}
nav.top a{color:#334155;text-decoration:none}nav.top a[aria-current="page"]{color:#4f46e5;font-weight:700}
.card{border:1px solid #e2e8f0;border-radius:12px;padding:14px;max-width:460px}.card h3{margin-top:0}
.row{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}button{padding:6px 12px;cursor:pointer}
.err{color:#b91c1c}.ok{color:#15803d}.muted{color:#64748b;font-size:13px}
.badge{background:#eef2ff;color:#4338ca;border-radius:999px;padding:2px 8px;font-size:12px}
.forbidden{border:1px solid #fecaca;background:#fef2f2;border-radius:12px;padding:14px;max-width:460px}
.log{font-family:monospace;font-size:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px;max-height:180px;overflow:auto}
.modal{position:fixed;inset:0;background:rgba(15,23,42,.5);display:grid;place-items:center}
.modal>div{background:#fff;border-radius:12px;padding:18px;max-width:320px}`;

export default {
  id: 'day-42-protected-role-based-routes-refresh-tokens',
  title: 'Protected and Role-based Routes, Refresh Tokens, Session Expiry Handling and Permission-based UI',
  module: 'Module 9: Authentication & Security',
  day: 42,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Logging in is only half of authentication. Real apps must keep guests out of private pages, show admin screens only to admins, hide buttons users are not allowed to press, silently renew short-lived access tokens with a refresh token, and handle expired or idle sessions gracefully. This lesson builds all of these patterns with React Router 7 style code and working plain-React demos on the real dummyjson auth API.',
  objectives: [
    'Protect routes with a RequireAuth layout route that redirects to /login and returns the user afterwards',
    'Restrict routes by role (admin, moderator, user) and show a 403 page',
    'Build permission-based UI with a usePermission hook and a <Can> component',
    'Explain access vs refresh tokens and implement silent refresh with a single shared refresh request',
    'Handle session expiry: failed refresh, idle timeout with a warning dialog, and clean logout',
  ],
  theory: [
    {
      heading: 'Protected routes with a layout route',
      content:
        'A **protected route** renders its page only for logged-in users; guests are redirected to `/login`. In React Router 6/7 the cleanest way is a **layout route** (Day 21) whose element checks auth and renders `<Outlet />` for its children, so you protect many pages at once.\n\nThe guard has three outcomes:\n\n1. `status === \'checking\'` → show a spinner (never redirect while you do not know yet)\n2. guest → `<Navigate to="/login" replace state={{ from: location }} />`\n3. authenticated → `<Outlet />`\n\nSaving `from` lets the login page send the user back to the page they originally wanted (deep links from emails, WhatsApp, bookmarks). `replace` keeps `/login` out of the history, so the Back button does not bounce the user between pages.\n\nAnalogy: the security guard at an office gate. No ID card → he sends you to reception (login) and writes down which floor you wanted, so reception can send you straight there afterwards.',
      syntax: `// routes.jsx (React Router 7, library mode: import from 'react-router')
import { Navigate, Outlet, useLocation } from 'react-router';

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <FullPageSpinner />;
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<RequireAuth />}>
    <Route element={<AppLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/orders" element={<Orders />} />
    </Route>
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>`,
      tip: 'Frontend route guards are UX, not security. Anyone can open devtools and render the admin component. The API must check the token and the role on every request.',
    },
    {
      heading: 'Role-based routes (RBAC)',
      content:
        '**Role-Based Access Control** gives every user a role (`admin`, `moderator`, `user`, `seller`…) and each area of the app a list of allowed roles. The role comes from the server (`/auth/me` or a JWT claim), never from something the user can edit.\n\nPattern: extend the guard with an `allowedRoles` prop.\n\n- not logged in → redirect to `/login` (**401** situation)\n- logged in but wrong role → show a **403 Forbidden** page ("You do not have access"), not the login page. Redirecting a logged-in user to login is confusing.\n\nAlso hide links the user cannot open: build the navigation from the same config, filtered by role, so menus and routes never disagree.',
      syntax: `export function RequireRole({ allowedRoles }) {
  const { user } = useAuth();
  return allowedRoles.includes(user.role) ? <Outlet /> : <Forbidden />;
}

<Route element={<RequireAuth />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route element={<RequireRole allowedRoles={['admin', 'moderator']} />}>
    <Route path="/reviews" element={<ReviewModeration />} />
  </Route>
  <Route element={<RequireRole allowedRoles={['admin']} />}>
    <Route path="/admin/users" element={<UserManagement />} />
  </Route>
</Route>`,
    },
    {
      heading: 'Permission-based UI: roles map to permissions',
      content:
        'Checking roles everywhere (`user.role === \'admin\' || user.role === \'manager\'`) becomes messy when a new role arrives. Mature apps check **permissions** (actions) instead: `product:create`, `product:delete`, `order:refund`, `user:manage`. A single map says which role has which permission; often the server sends the permissions list directly.\n\nTools:\n\n- `usePermission(\'order:refund\')` → boolean\n- `<Can perform="product:delete">…</Can>` → renders children only when allowed (optionally a `fallback`)\n\n**Hide or disable?** Hide actions the user can never perform (a normal user never sees "Delete user"). Disable with a tooltip when the action is temporarily unavailable or when users should know it exists ("Upgrade to Pro to export").',
      syntax: `const ROLE_PERMISSIONS = {
  admin: ['product:create', 'product:edit', 'product:delete', 'order:refund', 'user:manage'],
  moderator: ['product:edit', 'review:moderate'],
  user: ['order:create'],
};

export function usePermission(permission) {
  const { user } = useAuth();
  return !!user && (ROLE_PERMISSIONS[user.role] ?? []).includes(permission);
}

export function Can({ perform, children, fallback = null }) {
  return usePermission(perform) ? children : fallback;
}

<Can perform="product:delete"><button onClick={remove}>Delete</button></Can>`,
    },
    {
      heading: 'Access tokens, refresh tokens and silent refresh',
      content:
        'Short-lived tokens limit damage if one is stolen, but nobody wants to log in every 15 minutes. So the server issues **two** tokens:\n\n- **Access token**: short-lived (5–15 min), sent with every API call, kept in memory\n- **Refresh token**: long-lived (7–30 days), used **only** to call `/auth/refresh`, ideally stored in an httpOnly Secure cookie; servers often **rotate** it (each refresh returns a new one and invalidates the old)\n\n**Silent refresh** in an Axios response interceptor:\n\n1. A request fails with **401**\n2. If it was not already retried, call `/auth/refresh`\n3. Save the new access token and **retry the original request**\n4. If refresh fails (refresh token expired/revoked) → log out with "Session expired"\n\n**The concurrency trap**: a dashboard fires 5 requests at once, all get 401. Without care you send 5 refresh calls; with rotation, 4 of them fail and log the user out. Fix: keep **one shared refresh promise**; every failed request awaits the same promise and then retries.\n\nYou can also refresh **proactively**: decode `exp` and refresh a minute before expiry.',
      syntax: `let refreshPromise = null;
function refreshAccessToken() {
  refreshPromise ??= axios.post('/auth/refresh', {}, { withCredentials: true })
    .then(res => { tokenStore.set(res.data.accessToken); return res.data.accessToken; })
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

api.interceptors.response.use(res => res, async error => {
  const original = error.config;
  if (error.response?.status === 401 && !original._retry && !original.url.includes('/auth/')) {
    original._retry = true;
    try {
      const token = await refreshAccessToken();
      original.headers.Authorization = 'Bearer ' + token;
      return api(original);                       // retry once
    } catch (refreshError) {
      sessionExpired();                           // clear state, redirect to /login?expired=1
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
});`,
      tip: 'Never try to refresh when the failing request IS the refresh or login call; that creates an infinite loop. The _retry flag and the /auth/ check prevent it.',
    },
    {
      heading: 'Session expiry handling and idle timeout',
      content:
        'Ways a session ends, and what good apps do:\n\n- **Refresh token expired or revoked** (password changed, admin blocked the account): log out, clear caches, redirect to `/login?reason=expired` and show "Your session has expired. Please log in again." Keep `from` so the user returns to the same page.\n- **Idle timeout** (banking, admin panels, government portals): after N minutes without mouse/keyboard activity show a warning dialog with a countdown ("You will be logged out in 60 seconds" + "Stay signed in"); if ignored, log out. Reset the timer on `mousemove`, `keydown`, `click`, `scroll` (throttled).\n- **Logged out in another tab**: storage event / BroadcastChannel (Day 41).\n- **Unsaved work**: warn before logging out, or save a draft.\n\nAccessibility: the warning must be a real dialog (`role="alertdialog"`, focus moved to the "Stay signed in" button) because screen-reader users may not see a visual banner.',
      tip: 'Coming next (Day 43): using Firebase/Supabase, where authentication, tokens and refresh are handled for you by the SDK.',
    },
  ],
  examples: [
    {
      title: 'Protected routes with redirect back after login',
      scenario: 'A guest clicks a shared link to /orders. They must be sent to /login and, after logging in, land on /orders (not on the home page).',
      steps: [
        'Create RequireAuth that redirects guests to /login with state.from = current path',
        'Wrap /dashboard and /orders with it; leave / and /login public',
        'In LoginPage read location.state.from and navigate there with replace after login',
        'Run the playground: click "My orders" as a guest, log in, notice you land on /orders',
      ],
      code: `// LoginPage.jsx
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/dashboard';

  const onSubmit = async values => {
    await login(values);
    navigate(from, { replace: true });
  };
  // ...form
}`,
      playground: {
        jsx: MINI_ROUTER + AUTH + `
function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <p className="muted">Checking session…</p>;
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function Header() {
  const { user, logout } = useAuth();
  return (
    <nav className="top">
      <Link to="/">Home</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/orders">My orders</Link>
      <span style={{ marginLeft: 'auto' }}>
        {user ? <>Hi {user.firstName} <button onClick={() => { logout(); routerStore.navigate('/', { replace: true }); }}>Log out</button></> : <Link to="/login">Log in</Link>}
      </span>
    </nav>
  );
}

function Orders() {
  const { user } = useAuth();
  return <div className="card"><h3>My orders</h3><p>3 orders for {user.firstName}: ₹1,299 · ₹549 · ₹2,100</p></div>;
}

function App() {
  return (
    <AuthProvider>
      <AddressBar />
      <Header />
      <Routes routes={[
        { path: '/', element: <p>Public home page. Try opening "My orders" without logging in.</p> },
        { path: '/login', element: <LoginPage /> },
        { path: '/dashboard', element: <RequireAuth><div className="card"><h3>Dashboard</h3><p className="ok">Only logged-in users see this.</p></div></RequireAuth> },
        { path: '/orders', element: <RequireAuth><Orders /></RequireAuth> },
        { path: '*', element: <p>404</p> },
      ]} />
    </AuthProvider>
  );
}`,
        css: CSS,
      },
      result: 'As a guest, clicking "My orders" changes the address bar to /login with the note "Please log in to open /orders". Clicking "Avery (user)" logs in and lands on /orders showing "3 orders for Avery". The console shows push → /orders, replace → /login, replace → /orders.',
      explanation:
        'RequireAuth renders <Navigate> for guests, passing the attempted path in state. LoginPage reads it and navigates there with replace after a successful login, so the Back button does not return to the login page. With real React Router the code is identical except that RequireAuth renders <Outlet /> as a layout route.',
    },
    {
      title: 'Role-based routes with a 403 page and role-aware navigation',
      scenario: 'An e-commerce back office: every logged-in user sees the dashboard, moderators and admins can moderate reviews, only admins can manage users. Navigation links are generated from the same route config.',
      steps: [
        'Write a route config array with path, label and allowedRoles',
        'Create RequireRole that shows a Forbidden page for wrong roles',
        'Generate the nav from the config, filtered by user.role',
        'Run the playground and log in as each of the three users; type /admin/users via the "Try /admin/users" button as Avery',
      ],
      code: `// routes.config.js
export const APP_ROUTES = [
  { path: '/dashboard', label: 'Dashboard', element: <Dashboard />, roles: ['admin', 'moderator', 'user'] },
  { path: '/reviews', label: 'Reviews', element: <Reviews />, roles: ['admin', 'moderator'] },
  { path: '/admin/users', label: 'Users', element: <Users />, roles: ['admin'] },
];

// router
<Route element={<RequireAuth />}>
  {APP_ROUTES.map(r => (
    <Route key={r.path} element={<RequireRole allowedRoles={r.roles} />}>
      <Route path={r.path} element={r.element} />
    </Route>
  ))}
</Route>

// Sidebar
const links = APP_ROUTES.filter(r => r.roles.includes(user.role));`,
      playground: {
        jsx: MINI_ROUTER + AUTH + `
const APP_ROUTES = [
  { path: '/dashboard', label: 'Dashboard', roles: ['admin', 'moderator', 'user'], element: <p className="ok">Sales today: ₹48,250 · 37 orders</p> },
  { path: '/reviews', label: 'Reviews', roles: ['admin', 'moderator'], element: <p>12 reviews waiting for moderation</p> },
  { path: '/admin/users', label: 'Users', roles: ['admin'], element: <p>208 users · block, change role, reset password</p> },
];

function Forbidden() {
  return (
    <div className="forbidden" role="alert">
      <h3>403: Access denied</h3>
      <p>Your role cannot open this page. Contact an administrator if you need access.</p>
      <button onClick={() => routerStore.navigate('/dashboard')}>Back to dashboard</button>
    </div>
  );
}

function Guard({ roles, children }) {
  const { status, user } = useAuth();
  const location = useLocation();
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!roles.includes(user.role)) return <Forbidden />;
  return children;
}

function Nav() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <nav className="top">
      {APP_ROUTES.filter(r => r.roles.includes(user.role)).map(r => <Link key={r.path} to={r.path}>{r.label}</Link>)}
      <span style={{ marginLeft: 'auto' }}>{user.firstName} <span className="badge">{user.role}</span> <button onClick={logout}>Log out</button></span>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <AddressBar />
      <Nav />
      <div className="row"><button onClick={() => routerStore.navigate('/admin/users')}>Try /admin/users</button></div>
      <Routes routes={[
        { path: '/', element: <Navigate to="/dashboard" replace /> },
        { path: '/login', element: <LoginPage /> },
        ...APP_ROUTES.map(r => ({ path: r.path, element: <Guard roles={r.roles}>{r.element}</Guard> })),
        { path: '*', element: <p>404</p> },
      ]} />
    </AuthProvider>
  );
}`,
        css: CSS,
      },
      result: 'Emily (admin) sees Dashboard, Reviews and Users. Olivia (moderator) sees Dashboard and Reviews. Avery (user) sees only Dashboard, and "Try /admin/users" shows the red "403: Access denied" box instead of the page. Guests trying any page are sent to /login.',
      explanation:
        'One config drives both routes and navigation, so a link can never point to a page the user cannot open. The guard distinguishes "not logged in" (redirect to login) from "logged in but not allowed" (403). The role comes from GET /auth/me on the server, not from user input. The API must still enforce the same rules.',
    },
    {
      title: 'Permission-based UI with usePermission and <Can>',
      scenario: 'A product admin table where admins can add, edit, delete and refund; moderators can only edit; users can only view. Instead of checking roles in every button, the UI asks for permissions.',
      steps: [
        'Define ROLE_PERMISSIONS mapping roles to permission strings',
        'Write usePermission(permission) and a <Can perform fallback> component',
        'Wrap each action button in <Can>; show a disabled button with a reason where useful',
        'Run the playground and switch the role with the selector',
      ],
      code: `export function Can({ perform, children, fallback = null }) {
  return usePermission(perform) ? children : fallback;
}

<Can perform="product:create"><button onClick={openCreate}>+ Add product</button></Can>
<Can perform="order:refund"
     fallback={<button disabled title="Only admins can refund">Refund</button>}>
  <button onClick={() => refund(order.id)}>Refund</button>
</Can>`,
      playground: {
        jsx: `const ROLE_PERMISSIONS = {
  admin: ['product:create', 'product:edit', 'product:delete', 'order:refund'],
  moderator: ['product:edit'],
  user: [],
};
const RoleContext = React.createContext('user');

function usePermission(permission) {
  const role = React.useContext(RoleContext);
  return (ROLE_PERMISSIONS[role] || []).includes(permission);
}
function Can({ perform, children, fallback = null }) {
  return usePermission(perform) ? children : fallback;
}

const INITIAL = [
  { id: 1, name: 'Cotton Kurta', price: 899 },
  { id: 2, name: 'Masala Chai 500g', price: 240 },
  { id: 3, name: 'Kolhapuri Chappal', price: 1299 },
];

function ProductTable() {
  const [products, setProducts] = React.useState(INITIAL);
  const [msg, setMsg] = React.useState('');
  return (
    <div>
      <div className="row">
        <Can perform="product:create">
          <button onClick={() => setProducts(p => [...p, { id: Date.now(), name: 'New product', price: 499 }])}>+ Add product</button>
        </Can>
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr><th align="left">Product</th><th align="left">Price</th><th align="left">Actions</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderTop: '1px solid #e2e8f0' }}>
              <td>{p.name}</td><td>₹{p.price}</td>
              <td className="row">
                <Can perform="product:edit"><button onClick={() => setMsg('Editing ' + p.name)}>Edit</button></Can>
                <Can perform="product:delete"><button onClick={() => setProducts(list => list.filter(x => x.id !== p.id))}>Delete</button></Can>
                <Can perform="order:refund" fallback={<button disabled title="Only admins can issue refunds">Refund</button>}>
                  <button onClick={() => setMsg('Refund started for ' + p.name)}>Refund</button>
                </Can>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted" aria-live="polite">{msg}</p>
    </div>
  );
}

function App() {
  const [role, setRole] = React.useState('admin');
  return (
    <RoleContext.Provider value={role}>
      <label>Logged in as{' '}
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="admin">admin</option><option value="moderator">moderator</option><option value="user">user</option>
        </select>
      </label>
      <p className="muted">Permissions: {ROLE_PERMISSIONS[role].join(', ') || 'view only'}</p>
      <ProductTable />
    </RoleContext.Provider>
  );
}`,
        css: CSS + `
th,td{padding:6px}`,
      },
      result: 'As admin you see "+ Add product" and Edit, Delete and Refund on each row. As moderator only Edit plus a greyed-out Refund (tooltip "Only admins can issue refunds"). As user, only the greyed-out Refund remains.',
      explanation:
        'Components ask "may I do X?" instead of "am I role Y?", so adding a new role means editing one map, not every button. <Can> hides actions completely, and its fallback shows a disabled version where users should know the feature exists. In a real app the role (or the permission list) comes from the AuthContext / server; here a select replaces the login so you can switch quickly.',
    },
    {
      title: 'Silent token refresh with one shared refresh request',
      scenario: 'Access tokens live 1 minute. When an API call returns 401 (or the token is about to expire), the client must refresh it once and retry, even when three requests fail at the same time.',
      steps: [
        'Log in and keep accessToken and refreshToken in memory',
        'Write refreshAccessToken() that reuses one pending promise',
        'Write apiGet(path): proactively refresh if exp is near, send the request, on 401 refresh once and retry',
        'If the refresh fails, call onSessionExpired()',
        'Run the playground: log in, click "Break access token", then "3 requests in parallel" and read the log',
      ],
      code: `// See theory section 4 for the Axios interceptor. Key points:
// 1. original._retry prevents infinite loops
// 2. one shared refreshPromise for concurrent 401s
// 3. never refresh for /auth/login or /auth/refresh themselves
// 4. failed refresh -> sessionExpired(): clear tokens, queryClient.clear(), navigate('/login?reason=expired')`,
      playground: {
        jsx: `const API = 'https://dummyjson.com';
let accessToken = null;
let refreshToken = null;
let refreshPromise = null;
const lines = [];
let redraw = () => {};
const log = s => { lines.unshift(new Date().toLocaleTimeString('en-IN') + '  ' + s); redraw(); };
let onSessionExpired = () => {};

function expiresInSec(token) {
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp - Date.now() / 1000; }
  catch (e) { return Infinity; }                 // not a JWT: let the server decide
}

function refreshAccessToken() {
  if (!refreshPromise) {
    log('↻ POST /auth/refresh (only one, shared)');
    refreshPromise = fetch(API + '/auth/refresh', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, expiresInMins: 1 }),
    })
      .then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || 'Refresh failed');
        accessToken = d.accessToken; refreshToken = d.refreshToken;
        log('✔ new access token ' + accessToken.slice(-8));
        return accessToken;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

async function apiGet(path, retried) {
  if (accessToken && expiresInSec(accessToken) < 10) { log('token about to expire, refreshing first');
    try { await refreshAccessToken(); } catch (err) { onSessionExpired(); throw err; }
  }
  const res = await fetch(API + path, { headers: { Authorization: 'Bearer ' + accessToken } });
  if (res.status === 401 && !retried) {
    log('✖ 401 ' + path);
    try { await refreshAccessToken(); }
    catch (err) { log('refresh failed: ' + err.message); onSessionExpired(); throw err; }
    log('↺ retry ' + path);
    return apiGet(path, true);
  }
  if (!res.ok) throw new Error('HTTP ' + res.status);
  log('✔ 200 ' + path);
  return res.json();
}

function App() {
  const [user, setUser] = React.useState(null);
  const [notice, setNotice] = React.useState('');
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    redraw = force;
    onSessionExpired = () => { accessToken = null; refreshToken = null; setUser(null); setNotice('Your session has expired. Please log in again.'); };
  }, []);

  const login = async () => {
    const r = await fetch(API + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'emilys', password: 'emilyspass', expiresInMins: 1 }) });
    const d = await r.json();
    accessToken = d.accessToken; refreshToken = d.refreshToken;
    setUser(d.firstName); setNotice(''); log('logged in, token ' + accessToken.slice(-8));
  };
  const parallel = () => Promise.allSettled([
    apiGet('/auth/me?select=firstName'), apiGet('/auth/products?limit=1&select=title'), apiGet('/auth/carts/user/1?select=total'),
  ]);

  return (
    <div>
      <div className="row">
        {!user ? <button onClick={login}>Log in (1-minute token)</button> : <span>Hi <b>{user}</b></span>}
        <button disabled={!user} onClick={() => { accessToken = 'invalid-token'; log('access token broken by user'); }}>Break access token</button>
        <button disabled={!user} onClick={() => { refreshToken = 'invalid-refresh'; accessToken = 'invalid-token'; log('both tokens broken'); }}>Break both tokens</button>
        <button disabled={!user} onClick={parallel}>3 requests in parallel</button>
      </div>
      {notice && <p role="alert" className="err">{notice}</p>}
      <div className="log" aria-label="Network log">{lines.map((l, i) => <div key={lines.length - i}>{l}</div>)}</div>
    </div>
  );
}`,
        css: CSS,
      },
      result: 'After "Break access token" + "3 requests in parallel" the log shows three "✖ 401" lines, exactly ONE "↻ POST /auth/refresh", "✔ new access token", then three "↺ retry" and three "✔ 200". With "Break both tokens" the refresh fails and the red message "Your session has expired. Please log in again." appears. Waiting over a minute and sending requests triggers "token about to expire, refreshing first".',
      explanation:
        'All three failing requests call refreshAccessToken(), but only the first creates the fetch; the others receive the same pending promise, so the server sees one refresh (critical when refresh tokens rotate). Each request retries once (the retried flag stops loops). A proactive check of exp avoids a wasted 401 round trip. When the refresh itself fails, the session is over: tokens are cleared and the user is told why, instead of silently breaking.',
    },
    {
      title: 'Idle timeout with a warning dialog',
      scenario: 'A banking-style admin panel logs users out after inactivity. Here: warning after 10 seconds idle, logout 10 seconds later unless the user clicks "Stay signed in" (real apps use about 15 and 2 minutes).',
      steps: [
        'Write useIdleTimer({ warnAfter, logoutAfter }) that resets on mousemove, keydown, click and scroll',
        'Return { warning, secondsLeft, stay }',
        'Render a role="alertdialog" with a countdown and focus the "Stay signed in" button',
        'Log out when the countdown reaches zero',
        'Run the playground, log in, and stop moving the mouse',
      ],
      code: `export function useIdleTimer({ warnAfter = 15 * 60_000, logoutAfter = 2 * 60_000, onTimeout }) {
  const [warning, setWarning] = useState(false);
  const timers = useRef({});
  const reset = useCallback(() => {
    clearTimeout(timers.current.warn); clearTimeout(timers.current.out);
    setWarning(false);
    timers.current.warn = setTimeout(() => setWarning(true), warnAfter);
    timers.current.out = setTimeout(onTimeout, warnAfter + logoutAfter);
  }, [warnAfter, logoutAfter, onTimeout]);
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const onActivity = () => { if (!timers.current.warned) reset(); };
    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));
    reset();
    return () => { events.forEach(e => window.removeEventListener(e, onActivity)); clearTimeout(timers.current.warn); clearTimeout(timers.current.out); };
  }, [reset]);
  return { warning, stay: reset };
}`,
      playground: {
        jsx: `function useIdleTimer({ warnAfter, logoutAfter, onTimeout, enabled }) {
  const [deadline, setDeadline] = React.useState(null);     // logout time while warning is shown
  const [now, setNow] = React.useState(Date.now());
  const warnTimer = React.useRef(null);
  const warningRef = React.useRef(false);

  const reset = React.useCallback(() => {
    clearTimeout(warnTimer.current);
    warningRef.current = false;
    setDeadline(null);
    warnTimer.current = setTimeout(() => {
      warningRef.current = true;
      setDeadline(Date.now() + logoutAfter);
    }, warnAfter);
  }, [warnAfter, logoutAfter]);

  React.useEffect(() => {
    if (!enabled) return;
    const onActivity = () => { if (!warningRef.current) reset(); };   // while warning, only the button counts
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));
    reset();
    return () => { events.forEach(e => window.removeEventListener(e, onActivity)); clearTimeout(warnTimer.current); setDeadline(null); };
  }, [enabled, reset]);

  React.useEffect(() => {
    if (!deadline) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= deadline) { clearInterval(id); warningRef.current = false; setDeadline(null); onTimeout(); }
    }, 250);
    return () => clearInterval(id);
  }, [deadline]);

  return { warning: !!deadline, secondsLeft: deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0, stay: reset };
}

function WarningDialog({ secondsLeft, onStay, onLogout }) {
  const btn = React.useRef(null);
  React.useEffect(() => { btn.current && btn.current.focus(); }, []);
  return (
    <div className="modal">
      <div role="alertdialog" aria-modal="true" aria-labelledby="idle-title" aria-describedby="idle-desc">
        <h3 id="idle-title">Are you still there?</h3>
        <p id="idle-desc">For your security you will be logged out in <b>{secondsLeft}</b> seconds.</p>
        <div className="row">
          <button ref={btn} onClick={onStay}>Stay signed in</button>
          <button onClick={onLogout}>Log out now</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = React.useState(null);
  const [notice, setNotice] = React.useState('');
  const logout = React.useCallback(reason => { setUser(null); setNotice(reason || ''); }, []);
  const { warning, secondsLeft, stay } = useIdleTimer({
    enabled: !!user, warnAfter: 10000, logoutAfter: 10000,
    onTimeout: () => logout('You were logged out after 20 seconds of inactivity.'),
  });

  if (!user) {
    return (
      <div className="card">
        {notice && <p role="alert" className="err">{notice}</p>}
        <button onClick={() => { setUser('Rahul'); setNotice(''); }}>Log in as Rahul</button>
      </div>
    );
  }
  return (
    <div className="card">
      <h3>NetBanking · Welcome {user}</h3>
      <p className="muted">Stop moving the mouse and typing for 10 seconds to see the warning.</p>
      <button onClick={() => logout('')}>Log out</button>
      {warning && <WarningDialog secondsLeft={secondsLeft} onStay={stay} onLogout={() => logout('You logged out.')} />}
    </div>
  );
}`,
        css: CSS,
      },
      result: 'After logging in and staying idle for 10 seconds, a dialog "Are you still there?" appears with a countdown from 10 and focus on "Stay signed in". Clicking it closes the dialog and restarts the timer. Ignoring it logs you out with "You were logged out after 20 seconds of inactivity."',
      explanation:
        'Any activity restarts the warning timer, but once the warning is visible only the explicit button counts, so an accidental mouse move cannot silently extend a session. The countdown is derived from a deadline timestamp (not by decrementing a counter), which stays accurate even if the tab is throttled. The dialog uses role="alertdialog", aria-modal and moves focus to the primary action for keyboard and screen-reader users. In a real app logout would also clear tokens and caches and call the server.',
    },
  ],
  interview: [
    { q: 'How do you implement a protected route in React Router v6/v7?', a: 'Create a layout route component that reads auth state: show a loader while checking, return <Navigate to="/login" replace state={{ from: location }} /> for guests, otherwise render <Outlet />. Nest all private routes under it.', level: 'Easy' },
    { q: 'Why pass state.from and use replace when redirecting to login?', a: 'state.from lets the login page send the user back to the page they originally requested (deep links). replace removes the protected URL / login page from history so the Back button does not loop between them.', level: 'Medium' },
    { q: 'Are frontend route guards enough for security?', a: 'No. They only improve UX. All JavaScript is visible and modifiable in the browser; the API must authenticate the token and authorise the role/permission on every request.', level: 'Easy' },
    { q: '401 vs 403 and how should the UI react?', a: '401: not authenticated (no/invalid/expired token) → try refresh, otherwise redirect to login. 403: authenticated but not allowed → show an access-denied page or message; do not send the user to login.', level: 'Easy' },
    { q: 'Role-based vs permission-based access control in the UI?', a: 'Role checks (role === "admin") are simple but scatter business rules and break when roles change. Permission checks (can("order:refund")) map roles to actions in one place (often sent by the server), making components independent of role names.', level: 'Medium' },
    { q: 'Why use both access and refresh tokens?', a: 'Short-lived access tokens limit the damage if stolen and are sent on every request. A long-lived refresh token, sent only to the refresh endpoint and ideally kept in an httpOnly cookie, obtains new access tokens so users stay logged in without re-entering passwords. The server can revoke refresh tokens.', level: 'Medium' },
    { q: 'How do you implement silent refresh with Axios?', a: 'A response interceptor catches 401, marks the original request _retry, calls the refresh endpoint, stores the new access token, sets the header and retries via api(original). If refresh fails, log out. Skip refresh for the login/refresh endpoints themselves.', level: 'Hard' },
    { q: 'What goes wrong when several requests get 401 at once, and how do you fix it?', a: 'Each triggers its own refresh; with refresh-token rotation all but the first fail and the user is logged out, and you waste requests. Store one in-flight refresh promise and let every failed request await it, then retry.', level: 'Hard' },
    { q: 'What is refresh token rotation?', a: 'Each refresh returns a new refresh token and invalidates the old one. If an old (stolen) refresh token is reused, the server detects it and can revoke the whole session family.', level: 'Hard' },
    { q: 'How would you implement an idle timeout?', a: 'Track user activity events (mousemove, keydown, click, scroll), reset a timer on activity, show an accessible warning dialog with a countdown before logout, and log out (clearing tokens and caches) if the user does not respond. Sync across tabs if needed.', level: 'Medium' },
    { q: 'How do you avoid a flash of the login page for logged-in users on refresh?', a: 'Keep an explicit "checking" auth status while the session is restored (refresh call or /me), and render a splash instead of redirecting until the status is known.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write RequireAuth and RequireRole as React Router 7 layout routes and use them to protect /account (any user) and /admin/* (admin only).',
      hint: 'RequireRole assumes it is nested inside RequireAuth.',
      solution: `import { Navigate, Outlet, useLocation } from 'react-router';

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <FullPageSpinner />;
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function RequireRole({ allowedRoles }) {
  const { user } = useAuth();
  return allowedRoles.includes(user.role) ? <Outlet /> : <Forbidden />;
}

<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<RequireAuth />}>
    <Route path="/account" element={<Account />} />
    <Route element={<RequireRole allowedRoles={['admin']} />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Route>
  </Route>
</Routes>`,
    },
    {
      task: 'Write a usePermissions() hook that returns { can, canAny, canAll } and use it to show a "Bulk actions" menu only if the user can delete OR export products.',
      hint: 'Read the permissions array once and build helpers with Set.',
      solution: `export function usePermissions() {
  const { user } = useAuth();
  const perms = useMemo(() => new Set(user?.permissions ?? ROLE_PERMISSIONS[user?.role] ?? []), [user]);
  return useMemo(() => ({
    can: p => perms.has(p),
    canAny: list => list.some(p => perms.has(p)),
    canAll: list => list.every(p => perms.has(p)),
  }), [perms]);
}

function ProductsToolbar() {
  const { can, canAny } = usePermissions();
  return (
    <div>
      {canAny(['product:delete', 'product:export']) && (
        <BulkMenu>
          {can('product:delete') && <MenuItem>Delete selected</MenuItem>}
          {can('product:export') && <MenuItem>Export CSV</MenuItem>}
        </BulkMenu>
      )}
    </div>
  );
}`,
    },
    {
      task: 'Implement the complete Axios refresh interceptor with a shared refresh promise, a _retry flag, no refresh for /auth/* URLs, and a sessionExpired() callback that redirects to /login?reason=expired.',
      hint: 'Use a separate plain axios call for refresh so it does not pass through the same interceptor.',
      solution: `import axios from 'axios';
import { tokenStore } from '@/features/auth/tokenStore';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
let refreshPromise = null;
let sessionExpired = () => { window.location.href = '/login?reason=expired'; };
export const setSessionExpiredHandler = fn => { sessionExpired = fn; };

function refreshAccessToken() {
  refreshPromise ??= axios
    .post(import.meta.env.VITE_API_URL + '/auth/refresh', {}, { withCredentials: true })
    .then(res => { tokenStore.set(res.data.accessToken); return res.data.accessToken; })
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

api.interceptors.request.use(config => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    const isAuthCall = original?.url?.includes('/auth/');
    if (error.response?.status === 401 && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = 'Bearer ' + token;
        return api(original);
      } catch (e) {
        tokenStore.clear();
        sessionExpired();
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);`,
    },
    {
      task: 'Show a friendly message on the login page when the user was logged out because the session expired (/login?reason=expired), and remove the parameter after showing it.',
      hint: 'useSearchParams + replace.',
      solution: `function SessionExpiredNotice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [show] = useState(searchParams.get('reason') === 'expired');

  useEffect(() => {
    if (searchParams.has('reason')) {
      setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('reason'); return n; }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  if (!show) return null;
  return <p role="status" className="notice">Your session has expired. Please log in again.</p>;
}`,
    },
    {
      task: 'Proactive refresh: schedule a token refresh 60 seconds before the access token expires, and reschedule whenever the token changes.',
      hint: 'Decode exp in an effect that depends on the token.',
      solution: `export function useProactiveRefresh() {
  const { token, refresh, logout } = useAuth();
  useEffect(() => {
    if (!token) return;
    const { exp } = jwtDecode(token);
    const delay = Math.max(0, exp * 1000 - Date.now() - 60_000);
    const id = setTimeout(() => {
      refresh().catch(() => logout({ reason: 'expired' }));
    }, delay);
    return () => clearTimeout(id);
  }, [token, refresh, logout]);
}

// call once inside AuthProvider or the app layout
useProactiveRefresh();`,
    },
  ],
  quiz: [
    {
      question: 'A logged-in "user" opens /admin. What should the app show?',
      options: ['The login page', 'A 403 / access denied page', 'The admin page with buttons disabled', 'A 404 page'],
      answer: 1,
      explanation: 'The user is authenticated but not authorised: that is a 403 situation.',
    },
    {
      question: 'Why does the redirect to /login use replace?',
      options: ['So the Back button does not bounce between the protected page and login', 'It is faster', 'Navigate requires it', 'To clear localStorage'],
      answer: 0,
      explanation: 'replace avoids an extra history entry for the blocked URL.',
    },
    {
      question: 'Three requests fail with 401 at the same time. The correct refresh behaviour is:',
      options: ['Send three refresh requests', 'Log out immediately', 'Ignore the errors', 'Send one refresh request, share its promise, then retry all three'],
      answer: 3,
      explanation: 'A single shared refresh avoids races, especially with refresh-token rotation.',
    },
    {
      question: 'Which token is usually short-lived and sent with every API request?',
      options: ['Refresh token', 'CSRF token', 'Access token', 'ID cookie'],
      answer: 2,
      explanation: 'Access tokens are short-lived; refresh tokens are long-lived and only sent to the refresh endpoint.',
    },
    {
      question: 'What prevents an infinite loop in a 401 refresh interceptor?',
      options: ['A _retry flag on the request and skipping refresh for /auth/ endpoints', 'Setting staleTime', 'Using fetch instead of Axios', 'Storing the token in a cookie'],
      answer: 0,
      explanation: 'Each request is retried at most once, and the refresh call itself never triggers another refresh.',
    },
  ],
};
