export default {
  id: 'day-59-final-project-ecommerce-website-part-2',
  title: 'Final Project 2 (Part 2): E-commerce Website: Login, Checkout, Orders, Admin Dashboard, Payments and Deployment',
  module: 'Module 12: React Native & Final Projects',
  day: 59,
  level: 'Advanced',
  duration: '5 hours',
  summary:
    "Finish ShopKart: JWT login with dummyjson.com auth and an AuthContext, protected and admin-only routes, a validated checkout form for Indian addresses, an orders history, an admin dashboard with product CRUD and a sales chart, a payment step using Razorpay/Stripe test mode, and deployment to Vercel/Netlify with environment variables.",
  objectives: [
    'Implement login/logout/auto-login with dummyjson /auth/login and /auth/me, and role-based routes',
    'Build a checkout form with validation (React Hook Form + Zod in production) and an order summary',
    'Save and show the orders history for the logged-in user',
    'Build an admin dashboard: KPI cards, a sales chart and product create/edit/delete',
    'Explain the payment gateway flow (Razorpay/Stripe test mode) and deploy the app with environment variables',
  ],
  theory: [
    {
      heading: 'Part 2 user stories and routes',
      content:
        "**Customer stories:**\n1. As a shopper, I want to **log in** and stay logged in after a refresh.\n2. As a shopper, I must be logged in to **check out**; if I am not, I am sent to /login and brought back to checkout afterwards.\n3. As a shopper, I want to enter my **delivery address** (name, 10-digit mobile, 6-digit PIN code, city, state) with clear error messages.\n4. As a shopper, I want to **pay** online (UPI/card via Razorpay) or choose Cash on Delivery.\n5. As a shopper, I want to see **My Orders** with date, items, total and status.\n\n**Admin stories:**\n6. As an admin, I want a **dashboard** with revenue, orders, average order value and a sales chart.\n7. As an admin, I want to **add, edit and delete products**.\n8. As a normal user, I must **not** see or open admin pages.\n\n**New routes:** `/login`, `/checkout` (protected), `/orders` (protected), `/orders/:id`, `/admin` and `/admin/products` (admin only).\n\n**Test accounts on dummyjson:** `emilys / emilyspass` (role admin) and `averyp / averyppass` (role user).",
      points: [
        'Authentication = who are you (login). Authorisation = what are you allowed to do (roles, permissions)',
        'Frontend route guards are UX only; the backend must check the token and role on every request',
        'Payment success is decided by the server verifying the gateway signature, never by the browser',
      ],
    },
    {
      heading: 'Authentication with dummyjson and an AuthContext',
      content:
        "**Flow:**\n1. `POST https://dummyjson.com/auth/login` with `{ username, password, expiresInMins: 60 }` returns `{ accessToken, refreshToken, id, username, email, firstName, lastName, image }` or `400 { message: 'Invalid credentials' }`.\n2. `GET /auth/me` with `Authorization: Bearer <accessToken>` returns the full user including `role` ('admin' | 'moderator' | 'user').\n3. Save the token, load the user, and expose `{ user, status, login, logout }` through `AuthContext`.\n4. **Auto-login:** on app start, if a token exists, call `/auth/me`; while it runs, `status` is 'checking' so protected pages show a spinner instead of redirecting too early.\n5. **Logout:** clear token, user and user-specific data (cart can stay).\n6. **Refresh:** `POST /auth/refresh` with the refresh token returns new tokens; an Axios response interceptor retries the failed request after a 401 (Day 41-42).\n\n**Where to store the token?** localStorage is simple but readable by any injected script (XSS). Many companies prefer an **httpOnly secure cookie** set by the backend (JS cannot read it) plus CSRF protection, or keep the access token in memory and the refresh token in an httpOnly cookie. For this project localStorage is acceptable; say this trade-off in interviews.",
      syntax:
        "// src/api/auth.js\nconst API = 'https://dummyjson.com';\nexport async function loginRequest(username, password) {\n  const res = await fetch(API + '/auth/login', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ username, password, expiresInMins: 60 }),\n  });\n  const data = await res.json();\n  if (!res.ok) throw new Error(data.message || 'Login failed');\n  return data;                                        // { accessToken, refreshToken, ... }\n}\nexport async function meRequest(token) {\n  const res = await fetch(API + '/auth/me', { headers: { Authorization: 'Bearer ' + token } });\n  if (!res.ok) throw new Error('Session expired');\n  return res.json();                                  // includes role\n}",
    },
    {
      heading: 'Protected and role-based routes',
      content:
        "A guard component decides what to render:\n- `status === 'checking'`: show a loader (do not redirect yet)\n- no user: `<Navigate to=\"/login\" replace state={{ from: location }} />`\n- wrong role: `<Navigate to=\"/\" replace />` or a 403 page\n- otherwise: `<Outlet />` (layout route) so many routes share one guard\n\nAfter login, read `location.state?.from?.pathname ?? '/'` and navigate there with `replace: true`, so the user lands on checkout again and the back button does not return to the login page.\n\nAlso hide UI the user cannot use (no \"Admin\" link for normal users), but remember: hiding is not security.",
      syntax:
        "import { Navigate, Outlet, useLocation } from 'react-router';\nimport { useAuth } from './AuthContext';\n\nexport function RequireAuth({ role }) {\n  const { user, status } = useAuth();\n  const location = useLocation();\n  if (status === 'checking') return <FullPageSpinner />;\n  if (!user) return <Navigate to=\"/login\" replace state={{ from: location }} />;\n  if (role && user.role !== role) return <Navigate to=\"/\" replace />;\n  return <Outlet />;\n}\n\n// routes\n<Route element={<RequireAuth />}>\n  <Route path=\"checkout\" element={<Checkout />} />\n  <Route path=\"orders\" element={<Orders />} />\n</Route>\n<Route element={<RequireAuth role=\"admin\" />}>\n  <Route path=\"admin\" element={<AdminDashboard />} />\n</Route>",
    },
    {
      heading: 'Checkout: validation, order creation and payments',
      content:
        "**Form:** React Hook Form + Zod (Day 24/47) is the industry standard. Indian validation rules:\n- Mobile: `/^[6-9]\\d{9}$/` (10 digits, starts with 6-9)\n- PIN code: `/^[1-9]\\d{5}$/` (6 digits, cannot start with 0)\n- Name: at least 3 characters; Address line: at least 10 characters\n- State: one of the states/UTs (select)\n- Payment method: 'upi' | 'card' | 'cod'\n\n**Order creation (real backend):** the browser sends **only product ids, quantities and the address**. The server loads real prices from the database, checks stock, calculates delivery/tax, creates the order with status `PENDING_PAYMENT` and returns the order id and amount. dummyjson offers `POST /carts/add` which returns calculated totals, so we use it as a stand-in.\n\n**Razorpay flow (test mode):**\n1. Server: create a Razorpay order with the secret key: `razorpay.orders.create({ amount: 129900, currency: 'INR', receipt: orderId })` (amount in **paise**)\n2. Client: load `https://checkout.razorpay.com/v1/checkout.js` and open `new window.Razorpay({ key: import.meta.env.VITE_RAZORPAY_KEY_ID, order_id, amount, handler })`\n3. User pays (test UPI `success@razorpay`, test cards from the Razorpay docs)\n4. `handler` receives `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`; send them to the server\n5. Server verifies the HMAC SHA256 signature with the **secret** and marks the order PAID; a **webhook** (`payment.captured`) is the reliable backup if the user closes the tab\n\n**Stripe** works similarly with Checkout Sessions or Payment Intents (test card 4242 4242 4242 4242). The **key id** is public; the **secret key** must never be in frontend code.",
      tip: 'Never mark an order as paid because the browser said so. Only the server, after verifying the signature or receiving a webhook, can change the order status.',
    },
    {
      heading: 'Admin dashboard: KPIs, charts and product CRUD',
      content:
        "**Dashboard:** KPI cards (revenue, orders, average order value, low-stock products), a sales chart (Recharts `BarChart`/`LineChart` in production, Day 45) and a recent orders table.\n\n**Product CRUD with dummyjson:**\n- Create: `POST /products/add` with JSON body returns the new product with id 195\n- Update: `PUT /products/:id` (or PATCH) returns the updated product\n- Delete: `DELETE /products/:id` returns the product with `isDeleted: true`\n\ndummyjson **does not really save** changes, so the UI applies the server response to local state (with TanStack Query: `useMutation` + `queryClient.setQueryData` or invalidation). Use **optimistic updates** for delete (remove instantly, roll back on error) and a **confirm dialog** before deleting.\n\n**Forms:** one ProductForm component for both create and edit (initial values decide the mode), number inputs converted with `Number()`, validation (title required, price > 0, stock ≥ 0).",
    },
    {
      heading: 'Deployment, environment variables and the final checklist',
      content:
        "**Environment variables (Vite):** `.env.development` and `.env.production` with `VITE_API_URL=https://dummyjson.com` and `VITE_RAZORPAY_KEY_ID=rzp_test_xxx`. Read with `import.meta.env.VITE_API_URL`. Only variables starting with `VITE_` reach the browser, and they are **public**. Add `.env*.local` to .gitignore and set real values in the Vercel/Netlify dashboard per environment (Preview vs Production).\n\n**SPA routing on the host:** refreshing `/orders` must still serve index.html.\n- Netlify: `public/_redirects` with `/*  /index.html  200`\n- Vercel: `vercel.json` with `{ \"rewrites\": [{ \"source\": \"/(.*)\", \"destination\": \"/index.html\" }] }`\n\n**CI:** a GitHub Action runs `npm ci`, `npm run lint`, `npm test`, `npm run build` on every PR (Day 55).\n\n**Final checklist:** login/logout/auto-login, redirect back after login, admin routes blocked for users, checkout validation with helpful messages, button disabled while submitting (no double orders), order saved and shown in My Orders, cart cleared after a successful order, admin CRUD with confirm and error handling, chart and KPIs, no secret keys in the bundle, 404 page, Lighthouse > 90, README with demo accounts, screenshots and live link.\n\nComing next: Day 60 builds the ShopKart mobile app with React Native and finishes with the React interview masterclass.",
      syntax:
        "# .env.production\nVITE_API_URL=https://dummyjson.com\nVITE_RAZORPAY_KEY_ID=rzp_test_1234567890\n\n# vercel.json\n{ \"rewrites\": [{ \"source\": \"/(.*)\", \"destination\": \"/index.html\" }] }\n\n# public/_redirects (Netlify)\n/*  /index.html  200",
    },
  ],
  examples: [
    {
      title: 'Feature 1: Login with dummyjson, AuthContext, auto-login and role-based guard',
      scenario: 'Log in as emilys (admin) or averyp (user), keep the session after refresh with the token + /auth/me, show the user\'s name and role, and block the Admin page for normal users.',
      steps: [
        'Create src/api/auth.js with loginRequest and meRequest',
        'Create AuthContext with user, status (checking | guest | authenticated), login and logout',
        'On mount, if a token is saved, call /auth/me (auto-login); otherwise status = guest',
        'Build LoginPage with error message and disabled button while submitting',
        'Create RequireAuth({ role }) and use it for Orders and Admin',
        'In the playground log in with averyp/averyppass and try the Admin tab, then with emilys/emilyspass',
      ],
      code: `// src/features/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { loginRequest, meRequest } from '../../api/auth';

const AuthContext = createContext(null);
const TOKEN_KEY = 'shopkart:token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('checking');

  useEffect(() => {                                   // auto-login
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setStatus('guest'); return; }
    meRequest(token)
      .then((u) => { setUser(u); setStatus('authenticated'); })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setStatus('guest'); });
  }, []);

  const login = useCallback(async (username, password) => {
    const { accessToken } = await loginRequest(username, password);
    localStorage.setItem(TOKEN_KEY, accessToken);
    const me = await meRequest(accessToken);
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStatus('guest');
  }, []);

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

// src/features/auth/LoginPage.jsx
import { useLocation, useNavigate } from 'react-router';
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true); setError('');
    try {
      await login(form.get('username'), form.get('password'));
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }
  // ...form markup (see playground)
}`,
      playground: {
        jsx: `const { createContext, useContext, useEffect, useMemo, useState, useCallback } = React;

const API = 'https://dummyjson.com';
async function loginRequest(username, password) {
  const res = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, expiresInMins: 60 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}
async function meRequest(token) {
  const res = await fetch(API + '/auth/me', { headers: { Authorization: 'Bearer ' + token } });
  if (!res.ok) throw new Error('Session expired, please log in again');
  return res.json();
}

const storage = {
  get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
  remove: (k) => { try { localStorage.removeItem(k); } catch (e) {} },
};

const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('checking');
  useEffect(() => {
    const token = storage.get('shopkart:token');
    if (!token) { setStatus('guest'); return; }
    meRequest(token)
      .then((u) => { setUser(u); setStatus('authenticated'); })
      .catch(() => { storage.remove('shopkart:token'); setStatus('guest'); });
  }, []);
  const login = useCallback(async (username, password) => {
    const { accessToken } = await loginRequest(username, password);
    storage.set('shopkart:token', accessToken);
    const me = await meRequest(accessToken);
    setUser(me); setStatus('authenticated');
    return me;
  }, []);
  const logout = useCallback(() => { storage.remove('shopkart:token'); setUser(null); setStatus('guest'); }, []);
  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
const useAuth = () => useContext(AuthContext);

// Guard: same logic as RequireAuth with <Navigate>, but returns a page to render
function RequireAuth({ role, children, goLogin }) {
  const { user, status } = useAuth();
  if (status === 'checking') return <p>Checking session…</p>;
  if (!user) return <div className="box">🔒 Please log in to continue. <button onClick={goLogin}>Go to login</button></div>;
  if (role && user.role !== role) return <div className="box warn">⛔ 403: Only {role}s can open this page. You are "{user.role}".</div>;
  return children;
}

function LoginPage({ onDone }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('averyp');
  const [password, setPassword] = useState('averyppass');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true); setError('');
    try { await login(username.trim(), password); onDone(); }
    catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }
  return (
    <form className="login" onSubmit={onSubmit} noValidate>
      <h2>Login to ShopKart</h2>
      <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
      {error && <p className="err" role="alert">{error}</p>}
      <button disabled={submitting || !username || !password}>{submitting ? 'Logging in…' : 'Login'}</button>
      <small>Demo: averyp / averyppass (user) · emilys / emilyspass (admin)</small>
      <div className="quick">
        <button type="button" onClick={() => { setUsername('averyp'); setPassword('averyppass'); }}>Fill user</button>
        <button type="button" onClick={() => { setUsername('emilys'); setPassword('emilyspass'); }}>Fill admin</button>
        <button type="button" onClick={() => { setUsername('emilys'); setPassword('wrong'); }}>Fill wrong password</button>
      </div>
    </form>
  );
}

function Shell() {
  const { user, status, logout } = useAuth();
  const [page, setPage] = useState('home');
  const tabs = ['home', 'orders', 'admin'];
  return (
    <div>
      <header>
        <b>🛍 ShopKart</b>
        <nav>
          {tabs.filter((t) => t !== 'admin' || (user && user.role === 'admin')).map((t) => (
            <button key={t} className={page === t ? 'on' : ''} onClick={() => setPage(t)}>{t}</button>
          ))}
          <button className="ghost" onClick={() => setPage('admin')} title="Try the URL directly">/admin</button>
        </nav>
        {user ? (
          <span className="me"><img src={user.image} alt="" width="28" height="28" /> {user.firstName} ({user.role}) <button onClick={() => { logout(); setPage('home'); }}>Logout</button></span>
        ) : status === 'guest' ? <button onClick={() => setPage('login')}>Login</button> : <span>…</span>}
      </header>
      <main>
        {page === 'home' && <p>Welcome{user ? ', ' + user.firstName : ''}! Browse products from Part 1 here.</p>}
        {page === 'login' && <LoginPage onDone={() => setPage('home')} />}
        {page === 'orders' && <RequireAuth goLogin={() => setPage('login')}><p className="box ok">📦 My Orders for {user && user.email}</p></RequireAuth>}
        {page === 'admin' && <RequireAuth role="admin" goLogin={() => setPage('login')}><p className="box ok">📊 Admin dashboard (only admins see this)</p></RequireAuth>}
      </main>
    </div>
  );
}

function App() {
  return <AuthProvider><Shell /></AuthProvider>;
}`,
        css: `body { font-family: system-ui, sans-serif; margin: 0; }
header { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between; padding: 10px 14px; background: #2563eb; color: #fff; }
nav { display: flex; gap: 6px; }
button { cursor: pointer; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; padding: 6px 10px; text-transform: capitalize; }
button:disabled { opacity: .5; }
nav .on { background: #f59e0b; color: #fff; border-color: #f59e0b; }
.ghost { background: transparent; color: #fff; border-style: dashed; text-transform: none; }
.me { display: flex; align-items: center; gap: 6px; }
.me img { border-radius: 50%; background: #fff; }
main { max-width: 480px; margin: 16px auto; padding: 0 12px; }
.login { display: grid; gap: 10px; }
.login label { display: grid; gap: 4px; font-weight: 600; }
.login input { padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 400; }
.login > button { background: #2563eb; color: #fff; border: 0; padding: 10px; text-transform: none; }
.quick { display: flex; gap: 6px; flex-wrap: wrap; }
.quick button { text-transform: none; font-size: 12px; }
small { color: #64748b; }
.err { color: #b91c1c; margin: 0; }
.box { padding: 12px; border-radius: 10px; background: #f1f5f9; }
.warn { background: #fee2e2; color: #991b1b; }
.ok { background: #dcfce7; color: #166534; }`,
      },
      result: 'Clicking "orders" while logged out shows "Please log in". Logging in as averyp shows the avatar, "Avery (user)" and opening /admin shows a 403 message; logging in as emilys adds an "admin" tab and the dashboard opens. A wrong password shows "Invalid credentials". After clicking Run again, the session is restored through /auth/me (if storage is allowed).',
      explanation:
        "AuthProvider starts in 'checking' so guards wait for auto-login instead of redirecting a logged-in user to /login on refresh. login stores the token and then loads the profile from /auth/me, which includes the role used for authorisation. The guard has three outcomes (wait, ask to log in, forbid) exactly like RequireAuth with Navigate in the real router. The Admin tab is hidden for users, but the dashed /admin button proves that hiding a link is not security: the guard still blocks it, and in production the API must block it too.",
    },
    {
      title: 'Feature 2: Checkout form with validation and order summary',
      scenario: 'A checkout page with delivery address (name, mobile, PIN code, address, city, state), payment method (UPI, card, cash on delivery), field-level errors, an order summary and a submit button that cannot be double-clicked.',
      steps: [
        'npm install react-hook-form zod @hookform/resolvers',
        'Define checkoutSchema with Zod (Indian mobile and PIN code regex, state enum, payment method)',
        'useForm({ resolver: zodResolver(checkoutSchema), mode: "onTouched" }) and register each field',
        'Show errors under fields with aria-invalid and aria-describedby',
        'On submit: disable the button (isSubmitting), create the order, go to payment or confirmation',
        'Playground: plain-React version of the same validation; try 12345 as PIN and 5123456789 as mobile',
      ],
      code: `// src/features/checkout/checkoutSchema.js
import { z } from 'zod';

export const STATES = ['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, 'Enter your full name'),
  mobile: z.string().regex(/^[6-9]\\d{9}$/, 'Enter a valid 10-digit mobile number'),
  pincode: z.string().regex(/^[1-9]\\d{5}$/, 'Enter a valid 6-digit PIN code'),
  address: z.string().trim().min(10, 'Address is too short'),
  city: z.string().trim().min(2, 'Enter your city'),
  state: z.enum(STATES, { errorMap: () => ({ message: 'Select your state' }) }),
  payment: z.enum(['upi', 'card', 'cod']),
});

// src/features/checkout/CheckoutPage.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function CheckoutPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: { payment: 'upi' },
  });
  const { items, clear } = useCart();
  const navigate = useNavigate();

  async function onSubmit(values) {
    const order = await createOrder({ items: items.map(({ id, qty }) => ({ id, qty })), address: values });
    if (values.payment === 'cod') { clear(); navigate('/orders/' + order.id); }
    else await payWithRazorpay(order);               // Feature 4
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="mobile">Mobile</label>
      <input id="mobile" inputMode="numeric" {...register('mobile')}
        aria-invalid={!!errors.mobile} aria-describedby="mobile-error" />
      {errors.mobile && <p id="mobile-error" role="alert">{errors.mobile.message}</p>}
      {/* ...other fields */}
      <button disabled={isSubmitting}>{isSubmitting ? 'Placing order…' : 'Place order'}</button>
    </form>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

const STATES = ['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];

// Plain-React stand-in for the Zod schema: field -> validator returning an error message or ''
const rules = {
  fullName: (v) => (v.trim().length >= 3 ? '' : 'Enter your full name'),
  mobile: (v) => (/^[6-9]\\d{9}$/.test(v) ? '' : 'Enter a valid 10-digit mobile number'),
  pincode: (v) => (/^[1-9]\\d{5}$/.test(v) ? '' : 'Enter a valid 6-digit PIN code'),
  address: (v) => (v.trim().length >= 10 ? '' : 'Address is too short'),
  city: (v) => (v.trim().length >= 2 ? '' : 'Enter your city'),
  state: (v) => (STATES.includes(v) ? '' : 'Select your state'),
};
const validate = (values) => Object.fromEntries(Object.entries(rules).map(([k, fn]) => [k, fn(values[k])]).filter(([, msg]) => msg));

const CART = [
  { id: 1, title: 'boAt Airdopes', qty: 1, price: 1299 },
  { id: 2, title: 'Cotton Kurta', qty: 2, price: 799 },
];
const inr = (n) => '₹' + n.toLocaleString('en-IN');

function Field({ name, label, error, touched, children }) {
  const show = touched && error;
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children({ id: name, 'aria-invalid': !!show, 'aria-describedby': show ? name + '-error' : undefined })}
      {show && <p id={name + '-error'} className="err" role="alert">{error}</p>}
    </div>
  );
}

function App() {
  const [values, setValues] = useState({ fullName: '', mobile: '', pincode: '', address: '', city: '', state: '', payment: 'upi' });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const errors = validate(values);
  const subtotal = CART.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 499 ? 0 : 40;
  const codFee = values.payment === 'cod' ? 20 : 0;

  const bind = (name) => ({
    name, value: values[name],
    onChange: (e) => setValues((v) => ({ ...v, [name]: name === 'mobile' || name === 'pincode' ? e.target.value.replace(/\\D/g, '') : e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
  });

  async function onSubmit(e) {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(rules).map((k) => [k, true])));
    if (Object.keys(errors).length) {
      const first = document.getElementById(Object.keys(errors)[0]);
      if (first) first.focus();                       // move focus to the first error
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));    // createOrder() API call
    setOrder({ id: 'SK' + Date.now().toString().slice(-6), total: subtotal + delivery + codFee, ...values });
    setSubmitting(false);
  }

  if (order) {
    return (
      <div className="done">
        <h2>🎉 Order {order.id} placed!</h2>
        <p>{inr(order.total)} · {order.payment === 'cod' ? 'Cash on delivery' : 'Paid via ' + order.payment.toUpperCase()}</p>
        <p>Delivering to {order.fullName}, {order.city}, {order.state} - {order.pincode}</p>
        <button onClick={() => setOrder(null)}>Back</button>
      </div>
    );
  }

  return (
    <form className="checkout" onSubmit={onSubmit} noValidate>
      <section>
        <h2>Delivery address</h2>
        <Field name="fullName" label="Full name" error={errors.fullName} touched={touched.fullName}>{(a) => <input {...a} {...bind('fullName')} autoComplete="name" />}</Field>
        <Field name="mobile" label="Mobile number" error={errors.mobile} touched={touched.mobile}>{(a) => <input {...a} {...bind('mobile')} inputMode="numeric" maxLength={10} autoComplete="tel-national" placeholder="98XXXXXXXX" />}</Field>
        <div className="two">
          <Field name="pincode" label="PIN code" error={errors.pincode} touched={touched.pincode}>{(a) => <input {...a} {...bind('pincode')} inputMode="numeric" maxLength={6} autoComplete="postal-code" />}</Field>
          <Field name="city" label="City" error={errors.city} touched={touched.city}>{(a) => <input {...a} {...bind('city')} autoComplete="address-level2" />}</Field>
        </div>
        <Field name="address" label="Flat, street, area" error={errors.address} touched={touched.address}>{(a) => <textarea {...a} {...bind('address')} rows={2} autoComplete="street-address" />}</Field>
        <Field name="state" label="State" error={errors.state} touched={touched.state}>{(a) => (
          <select {...a} {...bind('state')}><option value="">Select state</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
        )}</Field>
        <fieldset>
          <legend>Payment method</legend>
          {[['upi', 'UPI (GPay, PhonePe, Paytm)'], ['card', 'Credit / Debit card'], ['cod', 'Cash on delivery (+₹20)']].map(([v, l]) => (
            <label key={v} className="radio"><input type="radio" name="payment" value={v} checked={values.payment === v} onChange={() => setValues((x) => ({ ...x, payment: v }))} /> {l}</label>
          ))}
        </fieldset>
      </section>
      <aside>
        <h3>Order summary</h3>
        {CART.map((i) => <p key={i.id} className="row"><span>{i.title} × {i.qty}</span><span>{inr(i.price * i.qty)}</span></p>)}
        <p className="row"><span>Delivery</span><span>{delivery ? inr(delivery) : 'FREE'}</span></p>
        {codFee > 0 && <p className="row"><span>COD fee</span><span>{inr(codFee)}</span></p>}
        <p className="row total"><span>Total</span><span>{inr(subtotal + delivery + codFee)}</span></p>
        <button className="place" disabled={submitting}>{submitting ? 'Placing order…' : values.payment === 'cod' ? 'Place order' : 'Continue to payment'}</button>
      </aside>
    </form>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f1f5f9; }
.checkout { display: grid; gap: 16px; max-width: 860px; margin: auto; }
@media (min-width: 700px) { .checkout { grid-template-columns: 1.6fr 1fr; } }
section, aside, .done { background: #fff; padding: 16px; border-radius: 12px; align-self: start; }
h2 { margin-top: 0; font-size: 18px; }
.field { display: grid; gap: 4px; margin-bottom: 10px; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
label { font-weight: 600; font-size: 14px; }
input, select, textarea { padding: 9px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font: inherit; }
[aria-invalid=true] { border-color: #dc2626; background: #fef2f2; }
.err { color: #b91c1c; font-size: 13px; margin: 0; }
fieldset { border: 1px solid #e2e8f0; border-radius: 8px; }
.radio { display: block; font-weight: 400; padding: 4px 0; }
.row { display: flex; justify-content: space-between; margin: 6px 0; }
.total { border-top: 1px dashed #cbd5e1; padding-top: 8px; font-weight: 800; }
.place { width: 100%; padding: 12px; border: 0; border-radius: 10px; background: #f59e0b; color: #fff; font-weight: 700; cursor: pointer; }
.place:disabled { opacity: .6; }`,
      },
      result: 'Clicking "Continue to payment" with an empty form marks every field red with a message and focuses Full name. Typing letters into Mobile or PIN is ignored; 5123456789 is rejected (must start with 6-9) and 012345 is rejected as a PIN. With valid data the button shows "Placing order…" for a second and then a confirmation with the order id, total and address. Choosing Cash on delivery adds a ₹20 fee.',
      explanation:
        "The rules object plays the role of the Zod schema: one function per field that returns an error message. Errors are computed from values on each render (derived state), but shown only for touched fields so the user is not shouted at before typing. On submit all fields become touched and focus moves to the first invalid field, which is important for keyboard and screen-reader users, together with aria-invalid and aria-describedby. Disabling the button while submitting prevents duplicate orders. In the real app React Hook Form + zodResolver gives the same behaviour with fewer re-renders.",
    },
    {
      title: 'Feature 3: Create an order and show "My Orders"',
      scenario: 'Turn the cart into an order with dummyjson POST /carts/add (server-calculated totals), save it to the logged-in user\'s order history and show My Orders with status badges and expandable details.',
      steps: [
        'Create src/api/orders.js: createOrder sends only product ids and quantities',
        'Use the server response (total, discountedTotal, products) as the source of truth for amounts',
        'Save { id, userId, createdAt, items, total, status, address } (a real backend stores this; here localStorage per user)',
        'Build OrdersPage: newest first, status badge, date in en-IN format, details toggle',
        'Clear the cart only after the order succeeds',
        'Run the playground: place two orders and expand one',
      ],
      code: `// src/api/orders.js
export async function createOrder({ userId, items, address, payment }) {
  // Real backend: POST /api/orders -> validates stock, recalculates prices, returns the order
  const res = await fetch('https://dummyjson.com/carts/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, products: items.map(({ id, qty }) => ({ id, quantity: qty })) }),
  });
  if (!res.ok) throw new Error('Could not place the order');
  const cart = await res.json();       // { id, products, total, discountedTotal, totalQuantity }
  return {
    id: 'SK' + cart.id + '-' + Date.now().toString(36).toUpperCase(),
    userId,
    createdAt: new Date().toISOString(),
    items: cart.products.map((p) => ({ id: p.id, title: p.title, qty: p.quantity, thumbnail: p.thumbnail, lineTotal: p.discountedTotal })),
    total: cart.discountedTotal,
    status: payment === 'cod' ? 'CONFIRMED' : 'PAID',
    address,
  };
}

// src/features/orders/useOrders.js
export function useOrders(userId) {
  const key = 'shopkart:orders:' + userId;
  const [orders, setOrders] = useLocalStorage(key, []);
  const addOrder = (order) => setOrders((list) => [order, ...list]);
  return { orders, addOrder };
}

// With a real API + TanStack Query:
// const { data: orders } = useQuery({ queryKey: ['orders', userId], queryFn: fetchMyOrders });
// const mutation = useMutation({ mutationFn: createOrder,
//   onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders'] }); clearCart(); } });`,
      playground: {
        jsx: `const { useState, useEffect } = React;

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const toINR = (usd) => inr.format(usd * 85);

async function createOrder({ userId, items, payment }) {
  const res = await fetch('https://dummyjson.com/carts/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, products: items.map(({ id, qty }) => ({ id, quantity: qty })) }),
  });
  if (!res.ok) throw new Error('Could not place the order');
  const cart = await res.json();
  return {
    id: 'SK' + cart.id + '-' + Date.now().toString(36).toUpperCase(),
    createdAt: new Date().toISOString(),
    items: cart.products.map((p) => ({ id: p.id, title: p.title, qty: p.quantity, thumbnail: p.thumbnail, lineTotal: p.discountedTotal })),
    total: cart.discountedTotal,
    status: payment === 'cod' ? 'CONFIRMED' : 'PAID',
  };
}

function useLocalStorage(key, initial) {
  const [v, setV] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) || initial; } catch (e) { return initial; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }, [key, v]);
  return [v, setV];
}

const SAMPLE_CARTS = [
  [{ id: 121, qty: 1 }, { id: 100, qty: 2 }],
  [{ id: 78, qty: 1 }],
  [{ id: 6, qty: 3 }, { id: 16, qty: 1 }],
];
const STATUS_STYLE = { PAID: 'paid', CONFIRMED: 'conf', SHIPPED: 'ship', DELIVERED: 'del' };

function App() {
  const [orders, setOrders] = useLocalStorage('shopkart:orders:demo', []);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);

  async function place(payment) {
    setPlacing(true); setError('');
    try {
      const items = SAMPLE_CARTS[orders.length % SAMPLE_CARTS.length];
      const order = await createOrder({ userId: 16, items, payment });
      setOrders((list) => [order, ...list]);
      setOpen(order.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <main>
      <h2>📦 My Orders</h2>
      <div className="actions">
        <button disabled={placing} onClick={() => place('upi')}>{placing ? 'Placing…' : 'Place demo order (UPI)'}</button>
        <button disabled={placing} onClick={() => place('cod')}>Place demo order (COD)</button>
        {orders.length > 0 && <button className="link" onClick={() => setOrders([])}>Clear history</button>}
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      {orders.length === 0 && <p className="empty">You have not placed any orders yet.</p>}
      <ul className="orders">
        {orders.map((o) => (
          <li key={o.id}>
            <button className="head" aria-expanded={open === o.id} onClick={() => setOpen(open === o.id ? null : o.id)}>
              <span><b>{o.id}</b><small>{new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small></span>
              <span className={'badge ' + STATUS_STYLE[o.status]}>{o.status}</span>
              <b>{toINR(o.total)}</b>
            </button>
            {open === o.id && (
              <div className="items">
                {o.items.map((i) => (
                  <p key={i.id}><img src={i.thumbnail} alt="" width="40" height="40" /> {i.title} × {i.qty} <span>{toINR(i.lineTotal)}</span></p>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}`,
        css: `main { max-width: 560px; margin: auto; font-family: system-ui, sans-serif; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
button { cursor: pointer; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; padding: 7px 12px; font: inherit; }
button:disabled { opacity: .5; }
.link { border: 0; color: #2563eb; }
.orders { list-style: none; padding: 0; }
.orders li { border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; overflow: hidden; }
.head { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 8px; border: 0; border-radius: 0; text-align: left; }
.head span:first-child { display: flex; flex-direction: column; }
small { color: #64748b; }
.badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
.paid { background: #dcfce7; color: #166534; } .conf { background: #dbeafe; color: #1e40af; } .ship { background: #fef9c3; color: #854d0e; } .del { background: #e2e8f0; }
.items { background: #f8fafc; padding: 6px 12px; }
.items p { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
.items span { margin-left: auto; font-weight: 600; }
.empty { color: #64748b; }
.err { color: #b91c1c; }`,
      },
      result: 'Clicking "Place demo order" sends the cart to dummyjson, then a new order appears at the top with an id like SK209-M3X..., the date and time, a PAID or CONFIRMED badge and the total in ₹. Clicking an order expands its items with thumbnails and line totals. Orders remain after Run (localStorage).',
      explanation:
        "The client sends only ids and quantities; prices and totals come back from the server (dummyjson calculates discountedTotal), which is the secure pattern every real store follows. The order is saved only after the request succeeds, and the button is disabled while placing to avoid duplicates. aria-expanded on the header button tells screen readers whether details are open. In production the orders list is fetched from GET /api/orders for the logged-in user and the status (PAID → SHIPPED → DELIVERED) is updated by the backend.",
    },
    {
      title: 'Feature 4: Admin dashboard with KPI cards, sales chart and product CRUD',
      scenario: 'An admin page showing revenue, orders, average order value and low-stock count, a 7-day sales bar chart (SVG instead of Recharts), and a products table with Add, Edit and Delete using dummyjson add/put/delete.',
      steps: [
        'Load products with /products?limit=10&select=title,price,stock,category',
        'Compute KPIs from orders (here: sample sales data) with useMemo',
        'Draw the bar chart with SVG rects scaled to the max value (Recharts BarChart in production)',
        'One ProductForm for create and edit; validate title, price > 0 and stock >= 0',
        'Create: POST /products/add, Edit: PUT /products/:id, Delete: DELETE /products/:id with confirm and optimistic removal',
        'Apply server responses to local state because dummyjson does not persist changes',
      ],
      code: `// src/features/admin/SalesChart.jsx (production: Recharts)
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
export function SalesChart({ data }) {          // [{ day: 'Mon', revenue: 42000 }, ...]
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis tickFormatter={(v) => '₹' + v / 1000 + 'k'} />
        <Tooltip formatter={(v) => '₹' + v.toLocaleString('en-IN')} />
        <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// src/api/adminProducts.js
const API = import.meta.env.VITE_API_URL;          // https://dummyjson.com
const json = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const addProduct = (p) => fetch(API + '/products/add', json('POST', p)).then((r) => r.json());
export const updateProduct = (id, p) => fetch(API + '/products/' + id, json('PUT', p)).then((r) => r.json());
export const deleteProduct = (id) => fetch(API + '/products/' + id, { method: 'DELETE' }).then((r) => r.json());

// Optimistic delete with TanStack Query
const del = useMutation({
  mutationFn: deleteProduct,
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['admin-products'] });
    const previous = queryClient.getQueryData(['admin-products']);
    queryClient.setQueryData(['admin-products'], (old) => old.filter((p) => p.id !== id));
    return { previous };
  },
  onError: (_err, _id, ctx) => queryClient.setQueryData(['admin-products'], ctx.previous),
});`,
      playground: {
        jsx: `const { useState, useEffect, useMemo } = React;

const API = 'https://dummyjson.com';
const json = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const addProduct = (p) => fetch(API + '/products/add', json('POST', p)).then((r) => r.json());
const updateProduct = (id, p) => fetch(API + '/products/' + id, json('PUT', p)).then((r) => r.json());
const deleteProduct = (id) => fetch(API + '/products/' + id, { method: 'DELETE' }).then((r) => { if (!r.ok) throw new Error('Delete failed'); return r.json(); });
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

const SALES = [
  { day: 'Mon', revenue: 42000, orders: 31 }, { day: 'Tue', revenue: 38500, orders: 27 }, { day: 'Wed', revenue: 51200, orders: 40 },
  { day: 'Thu', revenue: 46800, orders: 35 }, { day: 'Fri', revenue: 63900, orders: 52 }, { day: 'Sat', revenue: 88400, orders: 71 }, { day: 'Sun', revenue: 79100, orders: 64 },
];

function SalesChart({ data }) {
  const W = 420, H = 180, pad = 24;
  const max = Math.max(...data.map((d) => d.revenue));
  const bw = (W - pad * 2) / data.length;
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" role="img" aria-label="Revenue for the last 7 days">
      {data.map((d, i) => {
        const h = (d.revenue / max) * (H - pad * 2);
        const x = pad + i * bw + 6;
        return (
          <g key={d.day}>
            <rect x={x} y={H - pad - h} width={bw - 12} height={h} rx="5" fill={d.revenue === max ? '#f59e0b' : '#2563eb'}>
              <title>{d.day + ': ' + inr(d.revenue)}</title>
            </rect>
            <text x={x + (bw - 12) / 2} y={H - pad - h - 4} textAnchor="middle" fontSize="10">{Math.round(d.revenue / 1000)}k</text>
            <text x={x + (bw - 12) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#64748b">{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}

const EMPTY = { title: '', price: '', stock: '', category: 'smartphones' };
function ProductForm({ initial, onSave, onCancel }) {
  const [v, setV] = useState(initial || EMPTY);
  const [saving, setSaving] = useState(false);
  const errors = {};
  if (!v.title.trim()) errors.title = 'Title is required';
  if (!(Number(v.price) > 0)) errors.price = 'Price must be more than 0';
  if (!(Number(v.stock) >= 0) || v.stock === '') errors.stock = 'Stock must be 0 or more';
  const invalid = Object.keys(errors).length > 0;
  async function submit(e) {
    e.preventDefault();
    if (invalid) return;
    setSaving(true);
    await onSave({ title: v.title.trim(), price: Number(v.price), stock: Number(v.stock), category: v.category });
    setSaving(false);
  }
  return (
    <form className="pform" onSubmit={submit}>
      <h3>{initial ? 'Edit product #' + initial.id : 'Add product'}</h3>
      <input aria-label="Title" placeholder="Title" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
      <input aria-label="Price in USD" placeholder="Price (USD)" inputMode="decimal" value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} />
      <input aria-label="Stock" placeholder="Stock" inputMode="numeric" value={v.stock} onChange={(e) => setV({ ...v, stock: e.target.value })} />
      <select aria-label="Category" value={v.category} onChange={(e) => setV({ ...v, category: e.target.value })}>
        {['smartphones', 'laptops', 'groceries', 'beauty', 'furniture'].map((c) => <option key={c}>{c}</option>)}
      </select>
      {invalid && <small className="err">{Object.values(errors)[0]}</small>}
      <div><button disabled={invalid || saving}>{saving ? 'Saving…' : 'Save'}</button> <button type="button" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);       // null | 'new' | product
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(API + '/products?limit=8&select=title,price,stock,category')
      .then((r) => r.json()).then((d) => setProducts(d.products)).finally(() => setLoading(false));
  }, []);

  const kpi = useMemo(() => {
    const revenue = SALES.reduce((s, d) => s + d.revenue, 0);
    const orders = SALES.reduce((s, d) => s + d.orders, 0);
    return { revenue, orders, aov: revenue / orders, lowStock: products.filter((p) => p.stock < 10).length };
  }, [products]);

  async function save(data) {
    try {
      if (editing === 'new') {
        const created = await addProduct(data);                         // { id: 195, ...data }
        setProducts((list) => [{ ...created, id: Date.now() }, ...list]); // dummyjson always returns 195, so make the key unique
        setMsg('Product added');
      } else {
        const updated = await updateProduct(editing.id, data);
        setProducts((list) => list.map((p) => (p.id === editing.id ? { ...p, ...data, title: updated.title } : p)));
        setMsg('Product updated');
      }
      setEditing(null);
    } catch (e) { setMsg('Error: ' + e.message); }
  }

  async function remove(p) {
    if (!window.confirm('Delete "' + p.title + '"?')) return;
    const previous = products;
    setProducts((list) => list.filter((x) => x.id !== p.id));   // optimistic
    try {
      await deleteProduct(p.id > 194 ? 1 : p.id);                 // new local items do not exist on dummyjson
      setMsg('Deleted "' + p.title + '"');
    } catch (e) {
      setProducts(previous);                                      // roll back
      setMsg('Could not delete, restored');
    }
  }

  return (
    <main>
      <h2>📊 Admin dashboard</h2>
      <div className="kpis">
        <div><small>Revenue (7d)</small><b>{inr(kpi.revenue)}</b></div>
        <div><small>Orders</small><b>{kpi.orders}</b></div>
        <div><small>Avg order value</small><b>{inr(kpi.aov)}</b></div>
        <div className={kpi.lowStock ? 'warn' : ''}><small>Low stock</small><b>{kpi.lowStock}</b></div>
      </div>
      <section className="panel"><h3>Sales this week</h3><SalesChart data={SALES} /></section>
      <section className="panel">
        <div className="row"><h3>Products</h3><button onClick={() => setEditing('new')}>+ Add product</button></div>
        {msg && <p className="msg" role="status">{msg}</p>}
        {editing && <ProductForm key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? null : { ...editing, price: String(editing.price), stock: String(editing.stock) }} onSave={save} onCancel={() => setEditing(null)} />}
        {loading ? <p>Loading…</p> : (
          <table>
            <thead><tr><th>Title</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td><td>{p.category}</td><td>{inr(p.price * 85)}</td>
                  <td className={p.stock < 10 ? 'low' : ''}>{p.stock}</td>
                  <td className="act"><button onClick={() => setEditing(p)}>Edit</button><button className="del" onClick={() => remove(p)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f1f5f9; }
main { max-width: 760px; margin: auto; }
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.kpis div { background: #fff; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; border-left: 4px solid #2563eb; }
.kpis .warn { border-left-color: #dc2626; }
.kpis b { font-size: 20px; }
small { color: #64748b; }
.panel { background: #fff; border-radius: 12px; padding: 12px; margin-top: 12px; }
.panel h3 { margin: 0 0 8px; }
.row { display: flex; justify-content: space-between; align-items: center; }
button { cursor: pointer; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; padding: 5px 10px; font: inherit; }
button:disabled { opacity: .5; }
.del { color: #b91c1c; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #f1f5f9; }
.low { color: #dc2626; font-weight: 700; }
.act { display: flex; gap: 4px; }
.pform { display: grid; gap: 6px; background: #f8fafc; padding: 10px; border-radius: 10px; margin-bottom: 10px; }
.pform input, .pform select { padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
.err { color: #b91c1c; }
.msg { background: #dcfce7; color: #166534; padding: 6px 10px; border-radius: 8px; }`,
      },
      result: 'Four KPI cards (revenue ₹4,09,900, 320 orders, average order value, low-stock count), a 7-day SVG bar chart with Saturday highlighted, and a products table. "+ Add product" opens a validated form; Save adds the row at the top. Edit pre-fills the form and updates the row. Delete asks for confirmation (if dialogs are allowed), removes the row instantly and restores it if the API call fails.',
      explanation:
        "KPIs are derived with useMemo from data, not stored separately. The SVG chart scales each bar to the maximum value, the same maths Recharts does for you. One ProductForm handles create and edit; the key prop remounts it when you switch products so its internal state resets. Because dummyjson only simulates writes (and always returns id 195 for new products), the UI merges responses into local state and generates a unique key. Delete is optimistic: the row disappears immediately and the previous array is restored if the request fails, the same idea as TanStack Query's onMutate/onError.",
    },
    {
      title: 'Feature 5: Payment step with Razorpay test mode (simulated in the playground)',
      scenario: 'After the address step, open the payment gateway for the order amount, handle success, failure and the user closing the popup, and only mark the order paid after server verification.',
      steps: [
        'Backend: create a Razorpay order (amount in paise) with the secret key and return { orderId, amount, keyId }',
        'Frontend: load checkout.js once with a loadScript helper',
        'Open new window.Razorpay(options) with handler and modal.ondismiss',
        'Send razorpay_payment_id, razorpay_order_id and razorpay_signature to /api/payments/verify',
        'Show success (clear cart, go to order page) or failure (keep cart, allow retry)',
        'Playground: a fake gateway modal shows the same three outcomes',
      ],
      code: `// src/features/checkout/payWithRazorpay.js
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="' + src + '"]')) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Could not load payment SDK'));
    document.body.appendChild(s);
  });
}

export async function payWithRazorpay({ order, user }) {
  await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  // 1. our backend creates the Razorpay order (secret key stays on the server)
  const { razorpayOrderId, amount } = await api.post('/payments/razorpay-order', { orderId: order.id });

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,      // public key id, e.g. rzp_test_xxx
      amount,                                          // in paise: 129900 = ₹1,299
      currency: 'INR',
      name: 'ShopKart',
      order_id: razorpayOrderId,
      prefill: { name: user.firstName, email: user.email, contact: order.address.mobile },
      theme: { color: '#2563eb' },
      handler: async (response) => {
        // 2. verify the signature on the server before showing success
        try {
          await api.post('/payments/verify', response);   // razorpay_payment_id, _order_id, _signature
          resolve('paid');
        } catch (e) { reject(e); }
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    });
    rzp.on('payment.failed', (r) => reject(new Error(r.error.description)));
    rzp.open();
  });
}

// Backend (Node/Express) verification
// const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//   .update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
// if (expected !== razorpay_signature) return res.status(400).json({ message: 'Invalid signature' });
// await Order.updateOne({ id }, { status: 'PAID', paymentId: razorpay_payment_id });`,
      playground: {
        jsx: `const { useState } = React;

// Fake gateway that behaves like Razorpay's popup: success, failure or dismiss
function FakeGateway({ amount, onSuccess, onFailure, onDismiss }) {
  const [method, setMethod] = useState('upi');
  const [busy, setBusy] = useState(false);
  const pay = (ok) => {
    setBusy(true);
    setTimeout(() => {
      if (ok) onSuccess({ razorpay_payment_id: 'pay_' + Math.random().toString(36).slice(2, 12), razorpay_order_id: 'order_TEST123', razorpay_signature: 'sig_demo' });
      else onFailure({ error: { description: 'Payment declined by bank (test)' } });
    }, 900);
  };
  return (
    <div className="backdrop" role="dialog" aria-modal="true" aria-label="Payment">
      <div className="gateway">
        <div className="gHead"><b>ShopKart</b><span>₹{amount.toLocaleString('en-IN')}</span><button aria-label="Close" onClick={onDismiss}>✕</button></div>
        <p className="test">TEST MODE · no real money</p>
        <div className="methods">
          {['upi', 'card', 'netbanking'].map((m) => <button key={m} className={method === m ? 'on' : ''} onClick={() => setMethod(m)}>{m.toUpperCase()}</button>)}
        </div>
        {method === 'upi' && <p>UPI ID: <code>success@razorpay</code></p>}
        {method === 'card' && <p>Card: <code>4111 1111 1111 1111</code>, any future date, any CVV</p>}
        {method === 'netbanking' && <p>Choose any bank, then Success/Failure on the bank page</p>}
        <button className="ok" disabled={busy} onClick={() => pay(true)}>{busy ? 'Processing…' : 'Simulate success'}</button>
        <button className="fail" disabled={busy} onClick={() => pay(false)}>Simulate failure</button>
      </div>
    </div>
  );
}

// stand-in for POST /api/payments/verify (the server checks the HMAC signature)
const verifyOnServer = (response) => new Promise((resolve) => setTimeout(() => resolve({ status: 'PAID', paymentId: response.razorpay_payment_id }), 600));

function App() {
  const amount = 2897;
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function handleSuccess(response) {
    setOpen(false);
    setState({ status: 'verifying', message: 'Verifying payment with the server…' });
    const result = await verifyOnServer(response);
    setState({ status: 'paid', message: 'Payment ' + result.paymentId + ' verified. Order confirmed!' });
  }

  return (
    <main>
      <h2>Payment</h2>
      <div className="summary">
        <p>Order <b>SK-1042</b> · 3 items</p>
        <p className="amt">Amount payable: ₹{amount.toLocaleString('en-IN')}</p>
        {state.status !== 'paid' && (
          <button className="payBtn" disabled={state.status === 'verifying'} onClick={() => { setState({ status: 'idle', message: '' }); setOpen(true); }}>
            {state.status === 'failed' || state.status === 'cancelled' ? 'Retry payment' : 'Pay ₹' + amount.toLocaleString('en-IN')}
          </button>
        )}
      </div>
      {state.message && <p className={'status ' + state.status} role="status">{state.message}</p>}
      {open && (
        <FakeGateway
          amount={amount}
          onSuccess={handleSuccess}
          onFailure={(r) => { setOpen(false); setState({ status: 'failed', message: '❌ ' + r.error.description + '. Your cart is safe, please retry.' }); }}
          onDismiss={() => { setOpen(false); setState({ status: 'cancelled', message: 'Payment cancelled. You can retry anytime.' }); }}
        />
      )}
    </main>
  );
}`,
        css: `main { max-width: 420px; margin: auto; font-family: system-ui, sans-serif; }
button { cursor: pointer; font: inherit; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; padding: 8px 12px; }
button:disabled { opacity: .6; }
.summary { background: #f8fafc; padding: 14px; border-radius: 12px; }
.amt { font-size: 20px; font-weight: 800; }
.payBtn { width: 100%; background: #2563eb; color: #fff; border: 0; padding: 12px; font-weight: 700; }
.status { padding: 10px; border-radius: 10px; }
.paid { background: #dcfce7; color: #166534; } .failed { background: #fee2e2; color: #991b1b; } .cancelled, .verifying { background: #fef9c3; color: #854d0e; }
.backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.6); display: flex; align-items: center; justify-content: center; }
.gateway { background: #fff; width: 320px; border-radius: 14px; padding: 14px; display: grid; gap: 8px; }
.gHead { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.gHead button { border: 0; }
.test { margin: 0; font-size: 11px; color: #b45309; font-weight: 700; }
.methods { display: flex; gap: 6px; }
.methods .on { background: #2563eb; color: #fff; border-color: #2563eb; }
.ok { background: #16a34a; color: #fff; border: 0; }
.fail { background: #fee2e2; color: #991b1b; border: 0; }`,
      },
      result: 'Clicking "Pay ₹2,897" opens a gateway-style popup in TEST MODE with UPI, card and netbanking tabs showing Razorpay test credentials. "Simulate success" shows "Verifying payment with the server…" and then a green confirmation with the payment id; "Simulate failure" shows a red message and a Retry button; closing with ✕ shows "Payment cancelled".',
      explanation:
        "The real Razorpay widget cannot run inside the sandboxed playground, so FakeGateway reproduces its contract: a success handler with payment id, order id and signature, a failure event and a dismiss callback. The important part is identical to production: success from the popup only moves the UI to 'verifying'; the order is confirmed after the server verifies the HMAC signature with the secret key (and a webhook covers closed tabs). Failure and cancel keep the cart, and the Pay button is disabled during verification to avoid double payments.",
    },
    {
      title: 'Complete Part 2 flow: login → cart → checkout → pay → orders → admin',
      scenario: 'One runnable app that connects all Part 2 features with the dummyjson API: a real login (role from /auth/me), a protected checkout with validation, a simulated payment, My Orders, and an admin-only dashboard tab.',
      steps: [
        'Wrap the app in AuthProvider and CartProvider (Part 1) and define the routes with guards',
        'Checkout is protected: guests are sent to login and returned to checkout afterwards',
        'Place order: validate → createOrder (POST /carts/add) → payment (non-COD) → save order → clear cart',
        'My Orders lists the current user\'s orders; Admin tab only for role admin',
        'Run the full flow as averyp, then as emilys to see the admin tab',
        'npm run build, add vercel.json rewrites, set VITE_ env variables and deploy',
      ],
      code: `// src/App.jsx (final routes)
import { Routes, Route } from 'react-router';
import { RequireAuth } from './features/auth/RequireAuth';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<ProductsPage />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetails />} />
        </Route>

        <Route path="admin" element={<RequireAuth role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

// main.jsx
// <BrowserRouter><AuthProvider><CartProvider><App /></CartProvider></AuthProvider></BrowserRouter>`,
      playground: {
        jsx: `const { createContext, useContext, useState, useEffect, useMemo, useCallback } = React;

const API = 'https://dummyjson.com';
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const store = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};

/* ---------- auth ---------- */
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('checking');
  const me = (token) => fetch(API + '/auth/me', { headers: { Authorization: 'Bearer ' + token } }).then((r) => { if (!r.ok) throw new Error('expired'); return r.json(); });
  useEffect(() => {
    const token = store.get('sk2:token', null);
    if (!token) { setStatus('guest'); return; }
    me(token).then((u) => { setUser(u); setStatus('auth'); }).catch(() => setStatus('guest'));
  }, []);
  const login = useCallback(async (username, password) => {
    const res = await fetch(API + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    store.set('sk2:token', data.accessToken);
    const u = await me(data.accessToken);
    setUser(u); setStatus('auth');
  }, []);
  const logout = useCallback(() => { store.set('sk2:token', null); setUser(null); setStatus('guest'); }, []);
  return <AuthContext.Provider value={useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])}>{children}</AuthContext.Provider>;
}
const useAuth = () => useContext(AuthContext);

/* ---------- tiny router ---------- */
const NavContext = createContext(null);
const useNav = () => useContext(NavContext);

/* ---------- pages ---------- */
function Login() {
  const { login } = useAuth();
  const { go, from } = useNav();
  const [u, setU] = useState('averyp');
  const [p, setP] = useState('averyppass');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try { await login(u, p); go(from || 'shop'); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }
  return (
    <form className="card form" onSubmit={submit}>
      <h2>Login</h2>
      <input aria-label="Username" value={u} onChange={(e) => setU(e.target.value)} />
      <input aria-label="Password" type="password" value={p} onChange={(e) => setP(e.target.value)} />
      {err && <p className="err" role="alert">{err}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
      <small>User: averyp / averyppass · Admin: emilys / emilyspass <button type="button" className="link" onClick={() => { setU('emilys'); setP('emilyspass'); }}>use admin</button></small>
    </form>
  );
}

function Shop({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  useEffect(() => { fetch(API + '/products?limit=6&skip=120&select=title,price,thumbnail,stock').then((r) => r.json()).then((d) => setProducts(d.products)); }, []);
  const add = (p) => setCart((c) => { const l = c.find((x) => x.id === p.id); return l ? c.map((x) => (x.id === p.id ? { ...x, qty: Math.min(x.qty + 1, x.stock) } : x)) : [...c, { ...p, qty: 1 }]; });
  return (
    <div className="grid">
      {products.map((p) => (
        <div key={p.id} className="card prod">
          <img src={p.thumbnail} alt={p.title} />
          <b>{p.title}</b><span>{inr(p.price * 85)}</span>
          <button className="primary" onClick={() => add(p)}>Add to cart</button>
        </div>
      ))}
    </div>
  );
}

const RULES = {
  name: [(v) => v.trim().length >= 3, 'Enter your full name'],
  mobile: [(v) => /^[6-9]\\d{9}$/.test(v), 'Enter a valid 10-digit mobile'],
  pincode: [(v) => /^[1-9]\\d{5}$/.test(v), 'Enter a valid 6-digit PIN code'],
  address: [(v) => v.trim().length >= 10, 'Address is too short'],
};

function Checkout({ cart, setCart, addOrder }) {
  const { user } = useAuth();
  const { go } = useNav();
  const [v, setV] = useState({ name: user.firstName + ' ' + user.lastName, mobile: '', pincode: '', address: '', payment: 'upi' });
  const [tried, setTried] = useState(false);
  const [step, setStep] = useState('form');             // form | paying | placing
  const [err, setErr] = useState('');
  const errors = Object.fromEntries(Object.entries(RULES).filter(([k, [ok]]) => !ok(v[k])).map(([k, [, m]]) => [k, m]));
  const total = cart.reduce((s, l) => s + l.price * 85 * l.qty, 0);
  if (!cart.length) return <div className="card">Your cart is empty. <button className="link" onClick={() => go('shop')}>Shop now</button></div>;

  async function placeOrder(paymentStatus) {
    setStep('placing'); setErr('');
    try {
      const res = await fetch(API + '/carts/add', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, products: cart.map((l) => ({ id: l.id, quantity: l.qty })) }) });
      if (!res.ok) throw new Error('Order failed');
      const server = await res.json();
      addOrder({ id: 'SK' + server.id + '-' + Date.now().toString(36).toUpperCase(), date: new Date().toISOString(), total: server.discountedTotal * 85, items: server.totalQuantity, status: paymentStatus, city: v.pincode });
      setCart([]);
      go('orders');
    } catch (e) { setErr(e.message); setStep('form'); }
  }
  function submit(e) {
    e.preventDefault(); setTried(true);
    if (Object.keys(errors).length) return;
    if (v.payment === 'cod') placeOrder('CONFIRMED'); else setStep('paying');
  }
  const field = (k, label, extra) => (
    <label>{label}<input value={v[k]} aria-invalid={tried && !!errors[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} {...extra} />
      {tried && errors[k] && <small className="err">{errors[k]}</small>}</label>
  );
  return (
    <form className="card form" onSubmit={submit} noValidate>
      <h2>Checkout</h2>
      {field('name', 'Full name')}
      {field('mobile', 'Mobile', { inputMode: 'numeric', maxLength: 10 })}
      {field('pincode', 'PIN code', { inputMode: 'numeric', maxLength: 6 })}
      {field('address', 'Address')}
      <div className="pay">{[['upi', 'UPI'], ['card', 'Card'], ['cod', 'Cash on delivery']].map(([k, l]) => (
        <label key={k}><input type="radio" name="pm" checked={v.payment === k} onChange={() => setV({ ...v, payment: k })} /> {l}</label>
      ))}</div>
      <p className="total">Total: {inr(total)}</p>
      {err && <p className="err">{err}</p>}
      <button className="primary" disabled={step !== 'form'}>{step === 'placing' ? 'Placing order…' : v.payment === 'cod' ? 'Place order' : 'Pay ' + inr(total)}</button>
      {step === 'paying' && (
        <div className="backdrop"><div className="card gate">
          <b>ShopKart · TEST MODE</b><p>{inr(total)} via {v.payment.toUpperCase()}</p>
          <button className="primary" type="button" onClick={() => placeOrder('PAID')}>Simulate success</button>
          <button type="button" onClick={() => { setStep('form'); setErr('Payment failed (test). Please retry.'); }}>Simulate failure</button>
        </div></div>
      )}
    </form>
  );
}

function Orders({ orders }) {
  if (!orders.length) return <div className="card">No orders yet.</div>;
  return (
    <div className="card">
      <h2>My Orders</h2>
      {orders.map((o) => (
        <p key={o.id} className="order"><b>{o.id}</b><small>{new Date(o.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · {o.items} items</small><span className={'badge ' + o.status}>{o.status}</span><b>{inr(o.total)}</b></p>
      ))}
    </div>
  );
}

function Admin({ allOrders }) {
  const revenue = allOrders.reduce((s, o) => s + o.total, 0);
  return (
    <div className="card">
      <h2>📊 Admin</h2>
      <div className="kpis"><p>Revenue<b>{inr(revenue)}</b></p><p>Orders<b>{allOrders.length}</b></p><p>AOV<b>{inr(allOrders.length ? revenue / allOrders.length : 0)}</b></p></div>
      <p className="muted">Full product CRUD and sales chart: see Feature 4.</p>
    </div>
  );
}

function Guard({ role, children }) {
  const { user, status } = useAuth();
  const { go, page } = useNav();
  useEffect(() => { if (status === 'guest') go('login', page); }, [status]);
  if (status !== 'auth') return <p>Checking session…</p>;
  if (role && user.role !== role) return <div className="card err">403: admins only</div>;
  return children;
}

function Shell() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('shop');
  const [from, setFrom] = useState(null);
  const [cart, setCart] = useState(() => store.get('sk2:cart', []));
  const [orders, setOrders] = useState(() => store.get('sk2:orders', []));
  useEffect(() => store.set('sk2:cart', cart), [cart]);
  useEffect(() => store.set('sk2:orders', orders), [orders]);
  const go = (p, returnTo) => { setFrom(returnTo || null); setPage(p); };
  const mine = user ? orders.filter((o) => o.userId === user.id) : [];
  const addOrder = (o) => setOrders((l) => [{ ...o, userId: user.id }, ...l]);
  const count = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <NavContext.Provider value={{ go, page, from }}>
      <header>
        <b>🛍 ShopKart</b>
        <nav>
          <button onClick={() => go('shop')}>Shop</button>
          <button onClick={() => go('checkout')}>🛒 {count}</button>
          <button onClick={() => go('orders')}>Orders</button>
          {user && user.role === 'admin' && <button onClick={() => go('admin')}>Admin</button>}
          {user ? <button onClick={() => { logout(); go('shop'); }}>Logout {user.firstName}</button> : <button onClick={() => go('login')}>Login</button>}
        </nav>
      </header>
      <main>
        {page === 'shop' && <Shop cart={cart} setCart={setCart} />}
        {page === 'login' && <Login />}
        {page === 'checkout' && <Guard><Checkout cart={cart} setCart={setCart} addOrder={addOrder} /></Guard>}
        {page === 'orders' && <Guard><Orders orders={mine} /></Guard>}
        {page === 'admin' && <Guard role="admin"><Admin allOrders={orders} /></Guard>}
      </main>
    </NavContext.Provider>
  );
}

function App() {
  return <AuthProvider><Shell /></AuthProvider>;
}`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; background: #f1f5f9; }
header { display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; align-items: center; padding: 10px 14px; background: #2563eb; color: #fff; }
nav { display: flex; flex-wrap: wrap; gap: 6px; }
button { cursor: pointer; font: inherit; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; padding: 6px 10px; }
button:disabled { opacity: .6; }
.primary { background: #f59e0b; color: #fff; border: 0; font-weight: 700; }
.link { border: 0; background: none; color: #2563eb; padding: 0; }
main { max-width: 760px; margin: 14px auto; padding: 0 12px; }
.card { background: #fff; border-radius: 12px; padding: 14px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.prod { display: flex; flex-direction: column; gap: 4px; }
.prod img { width: 100%; aspect-ratio: 1; object-fit: contain; }
.form { display: grid; gap: 8px; max-width: 420px; margin: auto; position: relative; }
.form label { display: grid; gap: 3px; font-weight: 600; font-size: 14px; }
.form input:not([type=radio]) { padding: 9px; border: 1px solid #cbd5e1; border-radius: 8px; }
[aria-invalid=true] { border-color: #dc2626 !important; }
.pay { display: flex; gap: 12px; flex-wrap: wrap; }
.pay label { display: flex; font-weight: 400; }
.total { font-size: 18px; font-weight: 800; }
.err { color: #b91c1c; }
small { color: #64748b; }
.backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.55); display: flex; align-items: center; justify-content: center; }
.gate { display: grid; gap: 8px; width: 280px; }
.order { display: grid; grid-template-columns: 1fr auto auto; gap: 4px 10px; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
.order small { grid-column: 1; }
.badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #dbeafe; color: #1e40af; }
.badge.PAID { background: #dcfce7; color: #166534; }
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.kpis p { background: #f8fafc; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; margin: 0; }
.muted { color: #64748b; }`,
      },
      result: 'A complete flow: add products, click 🛒 (redirects to Login if you are a guest, then returns to checkout after login), fill a valid mobile and PIN, pay with the simulated gateway or choose COD, and land on My Orders with the new order. Logging in as emilys shows an Admin tab with revenue, orders and AOV; users never see it.',
      explanation:
        "This ties Part 2 together with the same patterns as the real app: AuthProvider for identity, a Guard that waits for the session check and remembers where you came from, a checkout that validates, creates the order on the server, pays (simulated) and only then clears the cart, and role-based UI plus a role-based guard. Orders are stored with userId so each user sees only their own orders, and admins see totals across all orders. Replace the tiny router with React Router and the fake gateway with Razorpay and you have the production structure.",
    },
  ],
  interview: [
    { q: 'How does authentication work in your e-commerce app?', a: "Login posts credentials to /auth/login and receives an access token (JWT) and refresh token. I store the token, call /auth/me to load the profile (including role) and keep { user, status, login, logout } in AuthContext. On refresh, the provider starts in 'checking', calls /auth/me with the saved token and either restores the session or clears it. An Axios interceptor attaches the Bearer header and refreshes on 401.", level: 'Medium' },
    { q: 'Where do you store the JWT and what are the trade-offs?', a: "localStorage is simple and survives refresh but is readable by injected scripts (XSS). An httpOnly, Secure, SameSite cookie set by the server cannot be read by JS but needs CSRF protection and same-site/backend setup. A common production pattern is a short-lived access token in memory and a refresh token in an httpOnly cookie.", level: 'Hard' },
    { q: 'How did you implement protected and admin routes?', a: "A RequireAuth layout route: while the session check runs it shows a loader; without a user it returns <Navigate to=\"/login\" replace state={{ from: location }} />; with the wrong role it redirects or shows 403; otherwise it renders <Outlet />. After login I navigate back to state.from. The backend also checks the token and role, because frontend guards are only UX.", level: 'Medium' },
    { q: 'Why does the auth provider need a "checking" status?', a: "Without it the first render has user = null, so the guard would redirect a logged-in user to /login before /auth/me finishes. The checking state lets guards wait and avoids a flash of the login page.", level: 'Medium' },
    { q: 'How did you validate the checkout form?', a: "React Hook Form with a Zod schema via zodResolver: name min 3 chars, mobile /^[6-9]\\d{9}$/, PIN code /^[1-9]\\d{5}$/, address min 10, state from an enum and payment method enum. Errors show on blur (mode onTouched) with aria-invalid and aria-describedby, focus moves to the first error on submit and the submit button is disabled while submitting.", level: 'Medium' },
    { q: 'Why should the client never send prices to the order API?', a: "Anything in the browser (cart in localStorage, request body) can be modified. The client sends product ids, quantities, address and coupon code; the server reads prices and stock from the database, applies discounts, delivery and tax, and calculates the amount to charge.", level: 'Easy' },
    { q: 'Explain the Razorpay payment flow.', a: "1. Server creates a Razorpay order with the secret key (amount in paise) linked to our order id. 2. Client loads checkout.js and opens Razorpay with the public key id and order_id. 3. On success the handler receives payment id, order id and signature. 4. Client sends them to the server, which verifies HMAC-SHA256(order_id|payment_id, secret) and marks the order PAID. 5. A payment.captured webhook confirms the payment even if the user closes the browser.", level: 'Hard' },
    { q: 'How do you prevent duplicate orders or double payments?', a: "Disable the button while submitting, use an idempotency key (order id) on the server so repeated requests return the same order, create the payment order once per order, and check order status before charging again. Webhooks are processed idempotently too.", level: 'Hard' },
    { q: 'How did you implement product CRUD in the admin dashboard?', a: "An API module with addProduct (POST /products/add), updateProduct (PUT /products/:id) and deleteProduct (DELETE). One ProductForm handles create and edit with validation. Delete asks for confirmation and is optimistic: remove from state immediately and restore on error. With TanStack Query I use useMutation with onMutate/onError/onSettled and invalidate the products query.", level: 'Medium' },
    { q: 'How did you build the sales chart and KPIs?', a: "KPIs (revenue, orders, average order value, low-stock count) are derived from orders/products with useMemo. The chart uses Recharts (ResponsiveContainer + BarChart with a ₹ tick formatter and tooltip) in the project; the playground draws the same bars with SVG by scaling values to the max.", level: 'Easy' },
    { q: 'What environment variables does the project use and are they secret?', a: "VITE_API_URL and VITE_RAZORPAY_KEY_ID, read via import.meta.env. Every VITE_ variable is embedded in the JS bundle and therefore public. Secrets (Razorpay key secret, database URL, JWT secret) live only on the server or in serverless functions, configured in the hosting dashboard.", level: 'Medium' },
    { q: 'Why does refreshing /orders give a 404 on some hosts and how do you fix it?', a: "The host looks for a real file at /orders, but an SPA has only index.html. Add a rewrite so all routes serve index.html: Netlify public/_redirects with /* /index.html 200, or vercel.json rewrites. React Router then renders the right page on the client.", level: 'Easy' },
    { q: 'How would you test the checkout flow?', a: "Unit test the Zod schema with valid/invalid inputs; component tests with React Testing Library + user-event for error messages and the disabled submit, with MSW mocking /carts/add and /auth/me; a Playwright end-to-end test: login → add to cart → checkout → simulated payment → order visible in My Orders.", level: 'Hard' },
    { q: 'What would you add to make ShopKart production-ready?', a: "A real backend with orders and inventory, server-side price calculation, Razorpay webhooks, TanStack Query caching, error monitoring (Sentry), analytics, SEO with SSR for product pages, rate limiting on login, accessibility audit, E2E tests in CI, and feature flags for safe releases.", level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add coupon codes to checkout: SAVE10 (10% off, max ₹500), FLAT200 (₹200 off on orders above ₹999) and FREESHIP (free delivery). Show a success or error message and the discount line in the summary.',
      hint: 'Write a pure applyCoupon(code, subtotal) that returns { discount, freeShipping, error }. In production the server validates coupons.',
      solution: `const { useState } = React;

function applyCoupon(code, subtotal) {
  const c = code.trim().toUpperCase();
  if (c === 'SAVE10') return { discount: Math.min(subtotal * 0.1, 500), freeShipping: false };
  if (c === 'FLAT200') return subtotal > 999 ? { discount: 200, freeShipping: false } : { error: 'FLAT200 needs an order above ₹999' };
  if (c === 'FREESHIP') return { discount: 0, freeShipping: true };
  return { error: 'Invalid coupon code' };
}

function App() {
  const subtotal = 1450;
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);
  const [error, setError] = useState('');
  const result = applied ? applyCoupon(applied, subtotal) : { discount: 0, freeShipping: false };
  const delivery = result.freeShipping || subtotal >= 499 ? 0 : 40;
  function apply() {
    const r = applyCoupon(code, subtotal);
    if (r.error) { setError(r.error); setApplied(null); } else { setError(''); setApplied(code.trim().toUpperCase()); }
  }
  return (
    <div style={{ maxWidth: 320 }}>
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" />
      <button onClick={apply}>Apply</button>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {applied && <p style={{ color: 'green' }}>✅ {applied} applied <button onClick={() => { setApplied(null); setCode(''); }}>Remove</button></p>}
      <p>Subtotal: ₹{subtotal}</p>
      {result.discount > 0 && <p>Coupon discount: − ₹{Math.round(result.discount)}</p>}
      <p>Delivery: {delivery ? '₹' + delivery : 'FREE'}</p>
      <p><b>Total: ₹{Math.round(subtotal - result.discount + delivery)}</b></p>
    </div>
  );
}`,
    },
    {
      task: 'Auto-fill City and State from the PIN code using the public API https://api.postalpincode.in/pincode/411001 when the user types 6 valid digits. Show "Checking PIN code…" and handle "No records found".',
      hint: 'The response is an array: [{ Status: "Success", PostOffice: [{ District, State, Name }] }]. Fetch in an effect that depends on the pincode and abort the previous request.',
      solution: `const { useState, useEffect } = React;

function usePincode(pin) {
  const [state, setState] = useState({ loading: false, data: null, error: '' });
  useEffect(() => {
    if (!/^[1-9]\\d{5}$/.test(pin)) { setState({ loading: false, data: null, error: '' }); return; }
    const c = new AbortController();
    setState({ loading: true, data: null, error: '' });
    fetch('https://api.postalpincode.in/pincode/' + pin, { signal: c.signal })
      .then((r) => r.json())
      .then(([res]) => {
        if (res.Status !== 'Success' || !res.PostOffice) throw new Error('No records found for this PIN code');
        const po = res.PostOffice[0];
        setState({ loading: false, data: { city: po.District, state: po.State }, error: '' });
      })
      .catch((e) => { if (e.name !== 'AbortError') setState({ loading: false, data: null, error: e.message }); });
    return () => c.abort();
  }, [pin]);
  return state;
}

function App() {
  const [pin, setPin] = useState('');
  const [city, setCity] = useState('');
  const [st, setSt] = useState('');
  const { loading, data, error } = usePincode(pin);
  useEffect(() => { if (data) { setCity(data.city); setSt(data.state); } }, [data]);
  return (
    <div style={{ display: 'grid', gap: 8, maxWidth: 300 }}>
      <input value={pin} maxLength={6} inputMode="numeric" onChange={(e) => setPin(e.target.value.replace(/\\D/g, ''))} placeholder="PIN code e.g. 411001" />
      {loading && <small>Checking PIN code…</small>}
      {error && <small style={{ color: 'crimson' }}>{error}</small>}
      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
      <input value={st} onChange={(e) => setSt(e.target.value)} placeholder="State" />
    </div>
  );
}`,
    },
    {
      task: 'Add an "Order details" page with a status timeline (Placed → Packed → Shipped → Out for delivery → Delivered) and a "Cancel order" button that is shown only before shipping.',
      hint: 'Keep STEPS as an array and find the index of the current status. Cancel = update the order status to CANCELLED (PATCH /api/orders/:id in production).',
      solution: `const { useState } = React;

const STEPS = ['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const LABEL = { PLACED: 'Placed', PACKED: 'Packed', SHIPPED: 'Shipped', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered' };

function Timeline({ status }) {
  const current = STEPS.indexOf(status);
  return (
    <ol style={{ listStyle: 'none', padding: 0 }}>
      {STEPS.map((s, i) => (
        <li key={s} style={{ display: 'flex', gap: 8, alignItems: 'center', color: i <= current ? '#166534' : '#94a3b8' }}>
          <span aria-hidden="true">{i < current ? '✅' : i === current ? '🟢' : '⚪'}</span>
          <span>{LABEL[s]}</span>
          {i === current && <b> (current)</b>}
        </li>
      ))}
    </ol>
  );
}

function App() {
  const [order, setOrder] = useState({ id: 'SK209-ABC', status: 'PACKED', total: 2897 });
  const canCancel = STEPS.indexOf(order.status) < STEPS.indexOf('SHIPPED');
  return (
    <div>
      <h3>Order {order.id} · ₹{order.total}</h3>
      {order.status === 'CANCELLED' ? <p style={{ color: 'crimson' }}>❌ This order was cancelled. Refund in 5-7 days.</p> : <Timeline status={order.status} />}
      {canCancel && <button onClick={() => window.confirm('Cancel this order?') && setOrder({ ...order, status: 'CANCELLED' })}>Cancel order</button>}
      <p>Demo: <button onClick={() => setOrder({ ...order, status: STEPS[Math.min(STEPS.indexOf(order.status) + 1, 4)] })}>Advance status</button></p>
    </div>
  );
}`,
    },
    {
      task: 'Add search and a low-stock filter to the admin products table, and a CSV export button that downloads the visible rows (id, title, category, price, stock).',
      hint: 'Build the CSV with rows.map(r => [..].map(v => JSON.stringify(String(v))).join(",")).join("\\n"), then a Blob and a temporary <a download>.',
      solution: `const { useState, useEffect, useMemo } = React;

function toCSV(rows) {
  const header = ['id', 'title', 'category', 'price', 'stock'];
  const lines = rows.map((r) => header.map((h) => JSON.stringify(String(r[h]))).join(','));
  return [header.join(','), ...lines].join('\\n');
}
function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=30&select=title,category,price,stock').then((r) => r.json()).then((d) => setProducts(d.products));
  }, []);
  const rows = useMemo(() => products
    .filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))
    .filter((p) => !lowOnly || p.stock < 10), [products, q, lowOnly]);
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" />
      <label><input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> Low stock only</label>
      <button disabled={!rows.length} onClick={() => download('products.csv', toCSV(rows))}>Export CSV ({rows.length})</button>
      <table><tbody>{rows.map((p) => <tr key={p.id}><td>{p.title}</td><td>{p.category}</td><td>{p.stock}</td></tr>)}</tbody></table>
    </div>
  );
}`,
    },
    {
      task: 'Deploy ShopKart: write the GitHub Actions workflow that lints, tests and builds on every pull request, plus the vercel.json and .env.example files, and list the Vercel settings.',
      hint: 'Use actions/checkout@v4 and actions/setup-node@v4 with cache: npm. Vercel connects to the repo directly, so the workflow only needs to verify quality.',
      solution: `# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --run
      - run: npm run build
        env:
          VITE_API_URL: https://dummyjson.com

# vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}

# .env.example  (commit this, never the real .env.local)
VITE_API_URL=https://dummyjson.com
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Vercel project settings
# Framework preset: Vite · Build command: npm run build · Output directory: dist
# Environment variables: VITE_API_URL, VITE_RAZORPAY_KEY_ID (Preview = test key, Production = live key)
# Secrets such as RAZORPAY_KEY_SECRET go only into serverless functions (/api/*.js), never VITE_ variables.`,
    },
  ],
  quiz: [
    {
      question: 'Which dummyjson call returns the logged-in user\'s role?',
      options: ['POST /auth/login only', 'GET /auth/me with an Authorization: Bearer <token> header', 'GET /users/role', 'It is stored in the JWT header'],
      answer: 1,
      explanation: 'The login response contains basic profile fields; /auth/me with the token returns the full user including role.',
    },
    {
      question: 'Why does RequireAuth return a loader while status is "checking"?',
      options: ['To make the page look busy', 'Because Navigate cannot be used at first render', 'Because hooks cannot run in guards', 'To avoid redirecting a logged-in user to /login before auto-login finishes'],
      answer: 3,
      explanation: 'On refresh the user is unknown until /auth/me returns; redirecting earlier would kick out valid sessions.',
    },
    {
      question: 'After Razorpay calls the success handler, what must happen before marking the order PAID?',
      options: ['The server verifies the payment signature with the secret key', 'Nothing, the handler proves the payment', 'The client stores the payment id in localStorage', 'The client checks that the amount matches'],
      answer: 0,
      explanation: 'Only server-side HMAC signature verification (or a webhook) can be trusted.',
    },
    {
      question: 'Which value is safe to put in a VITE_ environment variable?',
      options: ['RAZORPAY_KEY_SECRET', 'The database password', 'The public Razorpay key id (rzp_test_...)', 'The JWT signing secret'],
      answer: 2,
      explanation: 'VITE_ variables are bundled into public JavaScript; only public identifiers belong there.',
    },
    {
      question: 'Which regex validates an Indian mobile number in the checkout form?',
      options: ['/^\\d{6}$/', '/^[0-9]{12}$/', '/^[a-z0-9]+$/', '/^[6-9]\\d{9}$/'],
      answer: 3,
      explanation: '10 digits starting with 6, 7, 8 or 9. /^\\d{6}$/ is closer to a PIN code check.',
    },
  ],
};
