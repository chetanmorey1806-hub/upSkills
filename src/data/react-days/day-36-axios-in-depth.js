// A small Axios-like client built on fetch, so the playgrounds can show instances, interceptors,
// timeouts, cancellation and AxiosError handling without importing the real axios package.
const MINI_AXIOS = `// ---------- mini axios (plain JS learning version built on fetch) ----------
class AxiosError extends Error {
  constructor(message, code, config, response) {
    super(message);
    this.name = 'AxiosError';
    this.isAxiosError = true;
    this.code = code;
    this.config = config;
    this.response = response;
  }
}
function interceptorManager() {
  const handlers = [];
  return { handlers, use(fulfilled, rejected) { handlers.push({ fulfilled, rejected }); return handlers.length - 1; }, eject(id) { handlers[id] = null; } };
}
function buildURL(baseURL, url, params) {
  let full = /^https?:/.test(url) ? url : (baseURL || '').replace(/\\/$/, '') + '/' + url.replace(/^\\//, '');
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.append(k, v); });
  const s = qs.toString();
  return s ? full + (full.includes('?') ? '&' : '?') + s : full;
}
function create(defaults = {}) {
  const interceptors = { request: interceptorManager(), response: interceptorManager() };
  async function dispatch(config) {
    const ctrl = new AbortController();
    let timedOut = false;
    const timer = config.timeout ? setTimeout(() => { timedOut = true; ctrl.abort(); }, config.timeout) : null;
    if (config.signal) {
      if (config.signal.aborted) ctrl.abort();
      else config.signal.addEventListener('abort', () => ctrl.abort());
    }
    const headers = { ...config.headers };
    let body;
    if (config.data !== undefined) { body = JSON.stringify(config.data); headers['Content-Type'] = 'application/json'; }
    let res;
    try {
      res = await fetch(buildURL(config.baseURL, config.url, config.params), { method: config.method.toUpperCase(), headers, body, signal: ctrl.signal });
    } catch (e) {
      clearTimeout(timer);
      if (timedOut) throw new AxiosError('timeout of ' + config.timeout + 'ms exceeded', 'ECONNABORTED', config);
      if (config.signal && config.signal.aborted) throw new AxiosError('canceled', 'ERR_CANCELED', config);
      throw new AxiosError('Network Error', 'ERR_NETWORK', config);
    }
    clearTimeout(timer);
    const text = await res.text();
    let data = text;
    try { data = JSON.parse(text); } catch (e) { /* not JSON */ }
    const response = { data, status: res.status, statusText: res.statusText, config };
    if (res.status < 200 || res.status >= 300) {
      throw new AxiosError('Request failed with status code ' + res.status, res.status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST', config, response);
    }
    return response;
  }
  function request(config) {
    const merged = { ...defaults, ...config, headers: { ...defaults.headers, ...config.headers }, method: config.method || 'get' };
    let p = Promise.resolve(merged);
    // note: real axios runs REQUEST interceptors in reverse order of registration
    [...interceptors.request.handlers].reverse().forEach(h => { if (h) p = p.then(h.fulfilled, h.rejected); });
    p = p.then(dispatch);
    interceptors.response.handlers.forEach(h => { if (h) p = p.then(h.fulfilled, h.rejected); });
    return p;
  }
  return {
    defaults, interceptors, request,
    get: (url, c = {}) => request({ ...c, url, method: 'get' }),
    delete: (url, c = {}) => request({ ...c, url, method: 'delete' }),
    post: (url, data, c = {}) => request({ ...c, url, data, method: 'post' }),
    put: (url, data, c = {}) => request({ ...c, url, data, method: 'put' }),
    patch: (url, data, c = {}) => request({ ...c, url, data, method: 'patch' }),
  };
}
const axios = { create, isAxiosError: e => !!(e && e.isAxiosError), isCancel: e => !!(e && e.code === 'ERR_CANCELED') };
// ---------- end of mini axios ----------
`;

export default {
  id: 'day-36-axios-in-depth',
  title: 'Axios in Depth: Instances, baseURL, Interceptors, Auth Headers, Error Handling, Request Cancel and an API Service Layer',
  module: 'Module 8: Working with APIs like a Pro',
  day: 36,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Axios is the HTTP client used in most company React codebases. Learn to create a configured instance with baseURL and timeout, attach auth tokens and handle 401s with interceptors, turn every failure into one clean error shape, cancel outdated requests with AbortController, and hide all of it behind a feature-wise API service layer.',
  objectives: [
    'Explain what Axios adds over fetch and read its response and error objects correctly',
    'Create one configured axios instance (baseURL, timeout, default headers) using env variables',
    'Use request and response interceptors for auth headers, logging, unwrapping data and handling 401',
    'Classify errors (response, no response, timeout, canceled) and normalise them into a user-friendly ApiError',
    'Cancel requests with AbortController and organise API calls into a service layer per feature',
  ],
  theory: [
    {
      heading: 'Why Axios? fetch vs Axios',
      content:
        'You used `fetch` on Day 14. It works, but in a real app you write the same wrapper again and again. **Axios 1.x** (`npm install axios`) gives you that wrapper ready-made:\n\n- **Automatic JSON**: `res.data` is already parsed, and objects you send are converted to JSON with the right `Content-Type`\n- **Rejects on HTTP errors**: `fetch` only rejects on network failure; a 404 or 500 still "succeeds". Axios **throws for any status outside 2xx**, so `try/catch` really catches API errors\n- **Instances** with `baseURL`, `timeout` and default headers\n- **Interceptors**: run code before every request and after every response (auth tokens, logging, error toasts)\n- **params** object turned into a query string: `{ params: { q: \'phone\', limit: 10 } }`\n- **timeout**, upload/download **progress** (Day 40), request **cancellation** with `AbortController`\n- Same API in the browser and Node.js\n\nThe **response object** has `data`, `status`, `statusText`, `headers` and `config`. The most common beginner mistake is forgetting `.data`: `const products = res.data.products`.',
      syntax:
        "// fetch: manual checks\nconst res = await fetch('https://dummyjson.com/products?limit=5');\nif (!res.ok) throw new Error('HTTP ' + res.status);\nconst data = await res.json();\n\n// axios: parsed JSON, throws on non-2xx\nimport axios from 'axios';\nconst { data } = await axios.get('https://dummyjson.com/products', { params: { limit: 5 } });\nconsole.log(data.products.length); // 5",
      tip: 'fetch is still fine for tiny apps, and some teams build a small fetch wrapper (like the playgrounds today) instead. What matters in interviews is knowing WHY a central HTTP client exists: one place for base URL, auth, errors and timeouts.',
    },
    {
      heading: 'Instances and baseURL',
      content:
        'Never call `axios.get(\'https://api.shopkart.in/api/products\')` with full URLs all over the code. Create **one instance** in `src/lib/axios.js` (Day 31 folder structure) and import it everywhere:\n\n- `baseURL` from `import.meta.env.VITE_API_URL`, so dev / staging / production just work\n- `timeout` (e.g. 10-15 s) so a hanging server does not keep a spinner forever\n- default `headers` (`Accept`, app version, language)\n- `withCredentials: true` if your backend uses httpOnly cookies (Day 41)\n\nYou can have **several instances**: `api` for your backend, `paymentsApi` for a payment service, `publicApi` without auth. Each has its own interceptors.',
      syntax:
        "// src/lib/axios.js\nimport axios from 'axios';\nimport { env } from '@/config/env';\n\nexport const api = axios.create({\n  baseURL: env.apiUrl,                 // e.g. https://api.shopkart.in/api\n  timeout: 10000,\n  headers: { Accept: 'application/json' },\n});\n\n// usage\nconst { data } = await api.get('/products', { params: { category: 'mobiles', page: 2 } });\n// -> GET https://api.shopkart.in/api/products?category=mobiles&page=2",
    },
    {
      heading: 'Interceptors: code that runs on every request and response',
      content:
        'Interceptors are like a **security desk** at an office entrance: every visitor (request) gets an ID badge (auth header) on the way in, and every reply on the way out is checked (errors, logging).\n\n**Request interceptors** receive the `config` and must **return it**:\n- attach `Authorization: Bearer <token>`\n- add a request id / language header\n- log the request in development\n\n**Response interceptors** take two functions: success and error:\n- success: optionally unwrap or log, and return the response\n- error: on **401** clear the token and redirect to login (or try a refresh token: Day 42); show a toast for 5xx; convert the error into your own `ApiError`; then `return Promise.reject(error)` so the caller still knows it failed\n\n`api.interceptors.request.use(fn)` returns an id; `eject(id)` removes it (useful in tests or when an interceptor is registered inside a React effect).',
      syntax:
        "api.interceptors.request.use(config => {\n  const token = tokenStore.get();\n  if (token) config.headers.Authorization = 'Bearer ' + token;\n  return config;                                 // never forget to return!\n});\n\napi.interceptors.response.use(\n  response => response,\n  error => {\n    if (error.response?.status === 401) {\n      tokenStore.clear();\n      window.location.assign('/login?expired=1');\n    }\n    return Promise.reject(error);                 // keep the promise rejected\n  }\n);",
      tip: 'Forgetting `return config` in a request interceptor sends `undefined` as config and every request fails with a confusing error. Forgetting `return Promise.reject(error)` in the error handler turns failures into "successes" with undefined data.',
    },
    {
      heading: 'Error handling: four kinds of failure',
      content:
        'In a `catch`, an Axios error tells you **what** went wrong:\n\n1. **`error.response` exists**: the server answered with a non-2xx status. Read `error.response.status` (400, 401, 403, 404, 422, 500) and `error.response.data` (the backend message, e.g. `{ message: \'Invalid credentials\' }`)\n2. **`error.code === \'ECONNABORTED\'`**: timeout\n3. **`error.code === \'ERR_CANCELED\'`** (`axios.isCancel(error)`): you cancelled it on purpose; **do not show an error**\n4. **No response** (`error.code === \'ERR_NETWORK\'`): offline, DNS failure, server down, or a **CORS** block\n\nBest practice: **normalise** every error into one shape in the response interceptor, e.g. `{ status, code, message, fieldErrors }`, so components only show `error.message` and never parse Axios internals. Map status codes to friendly messages, prefer the backend\'s message for 400/422 validation errors, and log technical details.',
      syntax:
        "export function toApiError(error) {\n  if (axios.isCancel(error)) return { type: 'canceled', message: 'Request canceled' };\n  if (error.code === 'ECONNABORTED') return { type: 'timeout', message: 'The server is taking too long. Please try again.' };\n  if (error.response) {\n    const { status, data } = error.response;\n    const message = data?.message ?? ({ 401: 'Please log in again.', 403: 'You do not have permission.', 404: 'Not found.' })[status]\n      ?? (status >= 500 ? 'Server error. Please try again later.' : 'Request failed.');\n    return { type: 'http', status, message };\n  }\n  return { type: 'network', message: 'Network error. Check your internet connection.' };\n}",
    },
    {
      heading: 'Cancelling requests with AbortController',
      content:
        'Cancel a request when its result is no longer needed:\n- The component **unmounts** (user left the page)\n- A **newer request** replaces it (search box: typing "pho" then "phone"; without cancelling, the slower "pho" response can arrive last and overwrite the correct results: a **race condition**)\n- The user presses a **Cancel** button (large upload)\n\nAxios supports the standard `AbortController`: pass `signal` in the config and call `controller.abort()`. The promise rejects with a `CanceledError` (`axios.isCancel(err) === true`). The old `CancelToken` API is **deprecated**.\n\nIn React the natural place is the **useEffect cleanup**. Libraries like TanStack Query (Day 37) pass a `signal` to your query function automatically.',
      syntax:
        "useEffect(() => {\n  const controller = new AbortController();\n  productsApi.search(query, { signal: controller.signal })\n    .then(setResults)\n    .catch(err => { if (!axios.isCancel(err)) setError(toApiError(err)); });\n  return () => controller.abort();   // runs when query changes or on unmount\n}, [query]);",
    },
    {
      heading: 'The API service layer',
      content:
        'Components should not know URLs, HTTP verbs or response shapes. Put every endpoint of a feature in one **service file** and export simple functions:\n\n- `src/lib/axios.js`: the configured instance + interceptors\n- `src/features/products/api/productsApi.js`: `list(params)`, `getById(id)`, `create(body)`, `update(id, body)`, `remove(id)`\n- `src/features/auth/api/authApi.js`: `login`, `me`, `logout`\n\nEach function **returns `res.data`** (or a mapped object), accepts an optional `{ signal }`, and is named after the business action.\n\n**Benefits**: a URL change is a one-line fix, components and hooks stay small, functions are easy to mock in tests (MSW, Day 53), and they plug straight into TanStack Query (`queryFn: () => productsApi.list(params)`), which is exactly what Day 37 does.',
      syntax:
        "// src/features/products/api/productsApi.js\nimport { api } from '@/lib/axios';\n\nexport const productsApi = {\n  list: (params, config) => api.get('/products', { params, ...config }).then(r => r.data),\n  getById: (id, config) => api.get('/products/' + id, config).then(r => r.data),\n  search: (q, config) => api.get('/products/search', { params: { q }, ...config }).then(r => r.data.products),\n  create: body => api.post('/products/add', body).then(r => r.data),\n  update: (id, body) => api.put('/products/' + id, body).then(r => r.data),\n  remove: id => api.delete('/products/' + id).then(r => r.data),\n};",
      tip: 'Coming next (Day 37): TanStack Query takes these service functions and adds caching, background refetching, mutations and invalidation, so you rarely write useEffect for data again.',
    },
  ],
  examples: [
    {
      title: 'A configured instance + products service with params and pagination',
      scenario: 'Build the products list of an admin panel using one api instance (baseURL https://dummyjson.com, timeout 8 s) and a productsApi service. Paginate with limit/skip params and add a product with POST.',
      steps: [
        'npm install axios',
        'Create src/lib/axios.js with axios.create({ baseURL, timeout })',
        'Create src/features/products/api/productsApi.js with list and create',
        'Call productsApi.list({ limit, skip, select }) in the page and render res.data.products',
        'Run the playground: a small fetch-based axios clone stands in for the package; the request log shows the final URLs',
      ],
      code: `// src/lib/axios.js
import axios from 'axios';
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,   // https://dummyjson.com in this demo
  timeout: 8000,
});

// src/features/products/api/productsApi.js
import { api } from '@/lib/axios';
export const productsApi = {
  list: ({ page = 1, pageSize = 5 } = {}, config) =>
    api.get('/products', { params: { limit: pageSize, skip: (page - 1) * pageSize, select: 'title,price,category' }, ...config })
       .then(r => r.data),                    // { products, total, skip, limit }
  create: body => api.post('/products/add', body).then(r => r.data),
};

// ProductsPage.jsx
const [page, setPage] = useState(1);
const [data, setData] = useState(null);
useEffect(() => {
  const controller = new AbortController();
  productsApi.list({ page }, { signal: controller.signal }).then(setData).catch(console.error);
  return () => controller.abort();
}, [page]);`,
      playground: {
        jsx: MINI_AXIOS + `
const api = axios.create({ baseURL: 'https://dummyjson.com', timeout: 8000 });
api.interceptors.request.use(config => {
  console.log(config.method.toUpperCase(), config.url, config.params || '');
  return config;
});

const productsApi = {
  list: ({ page = 1, pageSize = 5 } = {}, config) =>
    api.get('/products', { params: { limit: pageSize, skip: (page - 1) * pageSize, select: 'title,price,category' }, ...config }).then(r => r.data),
  create: body => api.post('/products/add', body).then(r => r.data),
};

function App() {
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState('');
  const [title, setTitle] = React.useState('Masala Chai 500g');
  const [created, setCreated] = React.useState(null);

  React.useEffect(() => {
    const controller = new AbortController();
    setError('');
    productsApi.list({ page }, { signal: controller.signal })
      .then(setData)
      .catch(err => { if (!axios.isCancel(err)) setError(err.message); });
    return () => controller.abort();
  }, [page]);

  async function add(e) {
    e.preventDefault();
    const product = await productsApi.create({ title, price: 199 });
    setCreated(product);   // dummyjson simulates the insert and returns the new object with an id
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12, maxWidth: 560 }}>
      <h3>Products {data && <small>({data.total} total)</small>}</h3>
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
      {!data ? <p>Loading...</p> : (
        <ol start={data.skip + 1}>
          {data.products.map(p => <li key={p.id}>{p.title} <small>({p.category}, {'$' + p.price})</small></li>)}
        </ol>
      )}
      <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
      <span> Page {page} of {totalPages} </span>
      <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      <form onSubmit={add} style={{ marginTop: 16 }}>
        <input value={title} onChange={e => setTitle(e.target.value)} aria-label="New product title" />{' '}
        <button>POST /products/add</button>
      </form>
      {created && <pre style={{ background: '#f1f5f9', padding: 8 }}>{JSON.stringify(created, null, 2)}</pre>}
    </div>
  );
}`,
      },
      result: 'Page 1 lists products 1-5 (Essence Mascara Lash Princess, Eyeshadow Palette with Mirror, ...) with "(194 total)". Next/Prev load other pages; the console logs each request, e.g. GET /products { limit: 5, skip: 5, select: ... }. Submitting the form shows the created object, e.g. { "id": 195, "title": "Masala Chai 500g", "price": 199 }.',
      explanation:
        'The component never builds URLs: productsApi.list turns page numbers into limit/skip params and returns res.data. The instance supplies the baseURL and timeout. The AbortController in the effect cancels the previous page request if the user clicks quickly. The playground uses a fetch-based clone (top of the code) because packages cannot be imported here; with real axios the service and page code are identical.',
    },
    {
      title: 'Auth header and 401 handling with interceptors (real login API)',
      scenario: 'Log in with the dummyjson demo user (emilys / emilyspass). A request interceptor attaches the Bearer token to every call; a response interceptor logs the user out when the API answers 401.',
      steps: [
        'Create a tokenStore (memory + localStorage) in src/lib/tokenStore.js',
        'Request interceptor: if a token exists, set config.headers.Authorization',
        'Response interceptor: on 401, clear the token and notify the app (logout + message)',
        'authApi.login posts to /auth/login and saves accessToken; authApi.me calls /auth/me',
        'Run the playground: log in, call /auth/me, then "Simulate expired session" and call /auth/me again',
      ],
      code: `// src/lib/tokenStore.js
let accessToken = localStorage.getItem('accessToken');
export const tokenStore = {
  get: () => accessToken,
  set: t => { accessToken = t; localStorage.setItem('accessToken', t); },
  clear: () => { accessToken = null; localStorage.removeItem('accessToken'); },
};

// src/lib/axios.js
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 10000 });

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
    if (error.response?.status === 401) {
      tokenStore.clear();
      onUnauthorized();                     // AuthContext sets user = null and navigates to /login
    }
    return Promise.reject(error);
  }
);

// src/features/auth/api/authApi.js
export const authApi = {
  login: async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password, expiresInMins: 30 });
    tokenStore.set(data.accessToken);
    return data;
  },
  me: () => api.get('/auth/me').then(r => r.data),
};`,
      playground: {
        jsx: MINI_AXIOS + `
let accessToken = null;
const tokenStore = { get: () => accessToken, set: t => { accessToken = t; }, clear: () => { accessToken = null; } };

const api = axios.create({ baseURL: 'https://dummyjson.com', timeout: 10000 });
let onUnauthorized = () => {};
let onLog = () => {};

api.interceptors.request.use(config => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  onLog('-> ' + config.method.toUpperCase() + ' ' + config.url + (token ? '  [Authorization: Bearer ' + token.slice(0, 12) + '...]' : '  [no token]'));
  return config;
});
api.interceptors.response.use(
  res => { onLog('<- ' + res.status + ' ' + res.config.url); return res; },
  error => {
    const status = error.response ? error.response.status : error.code;
    onLog('<- ' + status + ' ' + error.config.url + ' ' + ((error.response && error.response.data && error.response.data.message) || ''));
    if (error.response && error.response.status === 401) { tokenStore.clear(); onUnauthorized(); }
    return Promise.reject(error);
  }
);

const authApi = {
  login: async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password, expiresInMins: 30 });
    tokenStore.set(data.accessToken);
    return data;
  },
  me: () => api.get('/auth/me').then(r => r.data),
};

function App() {
  const [user, setUser] = React.useState(null);
  const [form, setForm] = React.useState({ username: 'emilys', password: 'emilyspass' });
  const [msg, setMsg] = React.useState('');
  const [lines, setLines] = React.useState([]);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    onLog = line => setLines(l => [...l.slice(-7), line]);
    onUnauthorized = () => { setUser(null); setMsg('Session expired. Please log in again.'); };
  }, []);

  async function login(e) {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      const data = await authApi.login(form.username, form.password);
      setUser({ name: data.firstName + ' ' + data.lastName, image: data.image });
    } catch (err) {
      setMsg((err.response && err.response.data && err.response.data.message) || err.message);
    } finally { setBusy(false); }
  }
  async function loadMe() {
    try { const me = await authApi.me(); setMsg('/auth/me says: ' + me.firstName + ' (' + me.email + ')'); }
    catch (err) { /* 401 already handled by the interceptor */ }
  }
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12, maxWidth: 560 }}>
      {!user ? (
        <form onSubmit={login} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} aria-label="Username" />
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} aria-label="Password" />
          <button disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
        </form>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <img src={user.image} alt="" width="36" height="36" style={{ borderRadius: '50%' }} />
          <b>{user.name}</b>
          <button onClick={loadMe}>Call /auth/me</button>
          <button onClick={() => { tokenStore.clear(); setMsg('Token removed from storage (like an expired session). Now call /auth/me.'); }}>Simulate expired session</button>
        </div>
      )}
      <p role="status">{msg}</p>
      <pre style={{ background: '#0f172a', color: '#a7f3d0', padding: 10, borderRadius: 6, fontSize: 12, whiteSpace: 'pre-wrap', minHeight: 80 }}>{lines.join('\\n')}</pre>
    </div>
  );
}`,
      },
      result: 'Login logs "-> POST /auth/login [no token]" and "<- 200", then shows Emily Johnson with her avatar. "Call /auth/me" sends the Bearer header and shows "/auth/me says: Emily (emily.johnson@x.dummyjson.com)". After "Simulate expired session", calling /auth/me gets "<- 401 /auth/me Access Token is required" and the interceptor logs the user out with "Session expired. Please log in again." A wrong password shows "Invalid credentials".',
      explanation:
        'Components never touch headers: the request interceptor adds the token to every call and the response interceptor handles 401 in one place, then still rejects so callers can react. The interceptors talk to React through small callbacks (onUnauthorized, onLog) that the app registers; in a real app AuthContext registers the logout handler (Day 41).',
    },
    {
      title: 'Normalising every kind of error into one ApiError',
      scenario: 'Trigger each failure type against real endpoints: 404 product, 400 bad login, 500 server error, a timeout and a network failure. A single toApiError() turns them all into a friendly message.',
      steps: [
        'Write toApiError(error) that checks isCancel, ECONNABORTED, error.response and no-response',
        'Prefer error.response.data.message from the backend; fall back to status-based messages',
        'Use it in the response interceptor or in a catch block',
        'Run the playground and click each button; compare the raw error with the normalised one',
      ],
      code: `// src/lib/apiError.js
import axios from 'axios';

const STATUS_MESSAGES = {
  400: 'Please check the details and try again.',
  401: 'Please log in again.',
  403: 'You do not have permission to do this.',
  404: 'We could not find what you were looking for.',
  429: 'Too many requests. Please wait a moment.',
};

export function toApiError(error) {
  if (axios.isCancel(error)) return { type: 'canceled', message: 'Request canceled' };
  if (error.code === 'ECONNABORTED') return { type: 'timeout', message: 'The server is taking too long. Please try again.' };
  if (error.response) {
    const { status, data } = error.response;
    const message = (status < 500 && data?.message) || STATUS_MESSAGES[status]
      || (status >= 500 ? 'Something went wrong on our side. Please try again later.' : 'Request failed.');
    return { type: 'http', status, message, fieldErrors: data?.errors };
  }
  return { type: 'network', message: navigator.onLine ? 'Cannot reach the server.' : 'You are offline.' };
}

// in the instance
api.interceptors.response.use(r => r, error => Promise.reject(toApiError(error)));`,
      playground: {
        jsx: MINI_AXIOS + `
const STATUS_MESSAGES = { 400: 'Please check the details and try again.', 401: 'Please log in again.', 403: 'You do not have permission to do this.', 404: 'We could not find what you were looking for.' };
function toApiError(error) {
  if (axios.isCancel(error)) return { type: 'canceled', message: 'Request canceled' };
  if (error.code === 'ECONNABORTED') return { type: 'timeout', message: 'The server is taking too long. Please try again.' };
  if (error.response) {
    const { status, data } = error.response;
    const message = (status < 500 && data && data.message) || STATUS_MESSAGES[status] || (status >= 500 ? 'Something went wrong on our side. Please try again later.' : 'Request failed.');
    return { type: 'http', status, message };
  }
  return { type: 'network', message: navigator.onLine ? 'Cannot reach the server.' : 'You are offline.' };
}

const api = axios.create({ baseURL: 'https://dummyjson.com', timeout: 5000 });

const CASES = [
  { label: '200 OK', run: () => api.get('/products/1', { params: { select: 'title,price' } }) },
  { label: '404 Not found', run: () => api.get('/products/999999') },
  { label: '400 Bad login', run: () => api.post('/auth/login', { username: 'ravi', password: 'wrong' }) },
  { label: '500 Server', run: () => api.get('/http/500') },
  { label: 'Timeout', run: () => api.get('/products/1', { params: { delay: 3000 }, timeout: 1000 }) },
  { label: 'Network', run: () => api.get('https://shopkart-api.invalid/products') },
];

function App() {
  const [out, setOut] = React.useState(null);
  const [busy, setBusy] = React.useState('');
  async function run(c) {
    setBusy(c.label); setOut(null);
    try {
      const res = await c.run();
      setOut({ ok: true, raw: { status: res.status, data: res.data } });
    } catch (error) {
      const raw = { name: error.name, code: error.code, message: error.message, status: error.response ? error.response.status : undefined, data: error.response ? error.response.data : undefined };
      setOut({ ok: false, raw, apiError: toApiError(error) });
    } finally { setBusy(''); }
  }
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {CASES.map(c => <button key={c.label} onClick={() => run(c)} disabled={!!busy}>{busy === c.label ? 'Waiting...' : c.label}</button>)}
      </div>
      {out && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginTop: 12 }}>
          <div>
            <b>{out.ok ? 'Response' : 'Raw AxiosError'}</b>
            <pre style={{ background: '#f1f5f9', padding: 8, fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(out.raw, null, 2)}</pre>
          </div>
          {!out.ok && (
            <div>
              <b>toApiError(error): what the user sees</b>
              <pre style={{ background: '#fef2f2', padding: 8, fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(out.apiError, null, 2)}</pre>
              <p role="alert" style={{ color: '#b91c1c' }}>{out.apiError.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}`,
      },
      result: '200 OK shows { status: 200, data: { id: 1, title: "Essence Mascara Lash Princess", price: 9.99 } }. 404 gives type "http", status 404 and "Product with id \'999999\' not found". 400 shows "Invalid credentials". 500 shows the friendly server message (not the raw text). Timeout shows code ECONNABORTED and "The server is taking too long". Network shows code ERR_NETWORK and "Cannot reach the server."',
      explanation:
        'The raw error has many fields that differ by failure type. toApiError looks at them in a fixed order (canceled, timeout, server answered, no answer) and returns one small object. For 4xx the backend message is usually meaningful (validation, wrong password), while 5xx messages are replaced with a friendly text and logged instead.',
    },
    {
      title: 'Cancelling outdated search requests (race conditions)',
      scenario: 'A product search where the API is slow (0.8 s). Without cancellation, results for "ph" could arrive after "phone" and overwrite them. Abort the previous request whenever the query changes, and offer a Cancel button.',
      steps: [
        'Create an AbortController in the useEffect that depends on query',
        'Pass signal to the service: productsApi.search(q, { signal })',
        'Return () => controller.abort() as cleanup',
        'Ignore canceled errors with axios.isCancel(err)',
        'Run the playground, type quickly and watch the canceled requests in the log',
      ],
      code: `// productsApi.js
search: (q, config) => api.get('/products/search', { params: { q, limit: 5 }, ...config }).then(r => r.data.products),

// useProductSearch.js
export function useProductSearch(query) {
  const [state, setState] = useState({ status: 'idle', results: [], error: null });
  useEffect(() => {
    if (!query) { setState({ status: 'idle', results: [], error: null }); return; }
    const controller = new AbortController();
    setState(s => ({ ...s, status: 'loading' }));
    productsApi.search(query, { signal: controller.signal })
      .then(results => setState({ status: 'success', results, error: null }))
      .catch(err => {
        if (axios.isCancel(err)) return;           // expected, not an error
        setState({ status: 'error', results: [], error: toApiError(err) });
      });
    return () => controller.abort();               // previous request is cancelled
  }, [query]);
  return state;
}`,
      playground: {
        jsx: MINI_AXIOS + `
const api = axios.create({ baseURL: 'https://dummyjson.com', timeout: 8000 });
const productsApi = {
  search: (q, config) => api.get('/products/search', { params: { q, limit: 5, delay: 800, select: 'title,price' }, ...config }).then(r => r.data.products),
};

function App() {
  const [query, setQuery] = React.useState('');
  const [state, setState] = React.useState({ status: 'idle', results: [] });
  const [log, setLog] = React.useState([]);
  const controllerRef = React.useRef(null);
  const addLog = line => setLog(l => [...l.slice(-9), line]);

  React.useEffect(() => {
    if (!query) { setState({ status: 'idle', results: [] }); return; }
    const controller = new AbortController();
    controllerRef.current = controller;
    setState(s => ({ ...s, status: 'loading' }));
    addLog('start  "' + query + '"');
    productsApi.search(query, { signal: controller.signal })
      .then(results => { addLog('done   "' + query + '" (' + results.length + ' results)'); setState({ status: 'success', results }); })
      .catch(err => {
        if (axios.isCancel(err)) { addLog('cancel "' + query + '"'); return; }
        addLog('error  "' + query + '": ' + err.message);
        setState({ status: 'error', results: [] });
      });
    return () => controller.abort();
  }, [query]);

  function cancelNow() {
    if (controllerRef.current) controllerRef.current.abort();
    setState(s => ({ ...s, status: 'idle' }));
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 12, maxWidth: 520 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder='Type "phone" quickly' aria-label="Search products" style={{ flex: 1, padding: 6 }} />
        <button onClick={cancelNow} disabled={state.status !== 'loading'}>Cancel</button>
      </div>
      <p aria-live="polite">{state.status === 'loading' ? 'Searching...' : state.status === 'error' ? 'Search failed.' : ''}</p>
      <ul>{state.results.map(p => <li key={p.id}>{p.title} <small>{'$' + p.price}</small></li>)}</ul>
      <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 8, fontSize: 12, minHeight: 60 }}>{log.join('\\n')}</pre>
    </div>
  );
}`,
      },
      result: 'Typing "phone" quickly logs start "p", cancel "p", start "ph", cancel "ph" ... and only "done "phone" (5 results)" completes, listing phone products such as Apple AirPods Max Silver and Apple iPhone Charger. The Cancel button aborts a running search and the log shows cancel.',
      explanation:
        'Each keystroke changes query, so React runs the cleanup of the previous effect, which aborts its request, before starting a new one. Only the latest request can update state, so stale results never overwrite fresh ones. Canceled errors are expected and ignored. Day 38 adds debouncing so fewer requests are even started.',
    },
  ],
  interview: [
    { q: 'What are the main differences between fetch and Axios?', a: 'Axios parses JSON automatically (res.data), rejects for non-2xx statuses (fetch only rejects on network errors), supports instances with baseURL/timeout/default headers, interceptors, params serialisation, upload/download progress and works in Node. fetch is built-in and needs manual res.ok checks, JSON parsing and AbortController-based timeouts.', level: 'Easy' },
    { q: 'What is an Axios instance and why create one?', a: 'An object created with axios.create(config) that carries shared defaults (baseURL, timeout, headers) and its own interceptors. One instance per backend keeps configuration in one place, so URLs, auth and error handling are not repeated across components.', level: 'Easy' },
    { q: 'What are interceptors? Give real uses.', a: 'Functions that run before a request is sent (request interceptors receive config and must return it) or after a response/error arrives (response interceptors). Uses: attach Authorization headers, add request ids/language, logging, unwrapping data, global error toasts, handling 401 by logout or token refresh, normalising errors.', level: 'Medium' },
    { q: 'What happens if a request interceptor does not return config?', a: 'The request receives undefined as its config and fails. Request interceptors must return the (possibly modified) config or a promise resolving to it; response error handlers should return Promise.reject(error) unless they recover.', level: 'Medium' },
    { q: 'How do you distinguish error types in Axios?', a: 'axios.isCancel(err) for cancellations; err.code === "ECONNABORTED" for timeouts; err.response present means the server replied with a non-2xx status (read status and data); no response (ERR_NETWORK) means offline, DNS/server down or CORS blocked.', level: 'Medium' },
    { q: 'How do you cancel an Axios request?', a: 'Create an AbortController, pass signal: controller.signal in the request config and call controller.abort(). The promise rejects with a CanceledError (axios.isCancel returns true). CancelToken is deprecated. In React, abort in the useEffect cleanup.', level: 'Medium' },
    { q: 'What race condition can happen in search-as-you-type and how do you fix it?', a: 'Responses can arrive out of order, so an older slower request overwrites newer results. Fix by aborting the previous request in the effect cleanup, ignoring stale responses with a flag, debouncing input, or using TanStack Query which keys data by query.', level: 'Hard' },
    { q: 'How do you add an auth token to every request?', a: 'In a request interceptor, read the token from a token store (memory, or storage) and set config.headers.Authorization = "Bearer " + token. Avoid setting it once on defaults at login only, because the token can change (refresh) and the interceptor always reads the latest value.', level: 'Medium' },
    { q: 'How would you handle 401 responses globally?', a: 'In a response error interceptor: if status is 401, either try a refresh-token request once and retry the original request, or clear the token, reset auth state and redirect to /login with a "session expired" message. Always reject the original promise if not recovered. Avoid infinite loops by not retrying the refresh call itself.', level: 'Hard' },
    { q: 'What is an API service layer and why use it?', a: 'A set of modules (e.g. productsApi, authApi) that wrap all HTTP calls of a feature in named functions returning data. Components and hooks call productsApi.list() instead of knowing URLs and verbs. It centralises endpoints, simplifies testing/mocking, eases backend changes and fits TanStack Query.', level: 'Easy' },
    { q: 'Why might a request work in Postman but fail in the browser with a network error?', a: 'CORS: the browser blocks cross-origin responses unless the server sends Access-Control-Allow-Origin (and allows custom headers like Authorization in preflight). Postman does not enforce CORS. Fix on the server or use a dev proxy (Vite server.proxy).', level: 'Hard' },
    { q: 'How do you send query parameters with Axios?', a: 'Use the params option: api.get("/products", { params: { q: "phone", limit: 10 } }). Axios serialises and URL-encodes them, skipping undefined values, which is safer than building strings by hand.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create src/lib/axios.js with an api instance (baseURL from VITE_API_URL, timeout 10 s), a request interceptor adding Authorization and an "X-Request-Id" header, and a response interceptor that converts errors with toApiError.',
      hint: 'crypto.randomUUID() gives a request id.',
      solution: `import axios from 'axios';
import { tokenStore } from './tokenStore';
import { toApiError } from './apiError';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use(config => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  config.headers['X-Request-Id'] = crypto.randomUUID();
  if (import.meta.env.DEV) console.debug('[api]', config.method?.toUpperCase(), config.url, config.params ?? '');
  return config;
});

api.interceptors.response.use(
  response => response,
  error => Promise.reject(toApiError(error))
);`,
    },
    {
      task: 'Write a cartApi service for dummyjson carts: getUserCarts(userId), addCart(userId, products), updateCart(cartId, products) and deleteCart(cartId). Each returns res.data.',
      hint: 'Endpoints: GET /carts/user/:id, POST /carts/add, PUT /carts/:id, DELETE /carts/:id.',
      solution: `// src/features/cart/api/cartApi.js
import { api } from '@/lib/axios';

export const cartApi = {
  getUserCarts: (userId, config) => api.get('/carts/user/' + userId, config).then(r => r.data.carts),
  addCart: (userId, products) =>
    api.post('/carts/add', { userId, products }).then(r => r.data),       // products: [{ id, quantity }]
  updateCart: (cartId, products) =>
    api.put('/carts/' + cartId, { merge: true, products }).then(r => r.data),
  deleteCart: cartId => api.delete('/carts/' + cartId).then(r => r.data),
};

// usage
const carts = await cartApi.getUserCarts(1);
await cartApi.addCart(1, [{ id: 144, quantity: 2 }]);`,
    },
    {
      task: 'Add a response interceptor that shows a react-hot-toast error for 5xx and network errors only (not for 4xx or canceled requests), without swallowing the error.',
      hint: 'Check the normalised error type/status, call toast.error with an id to avoid duplicates, then reject.',
      solution: `import toast from 'react-hot-toast';
import axios from 'axios';

api.interceptors.response.use(
  res => res,
  error => {
    if (axios.isCancel(error)) return Promise.reject(error);
    const status = error.response?.status;
    if (!error.response) {
      toast.error('Network problem. Check your connection.', { id: 'network-error' });
    } else if (status >= 500) {
      toast.error('Server error. Please try again shortly.', { id: 'server-error' });
    }
    // 4xx errors are shown by the screen itself (form errors, not found ...)
    return Promise.reject(error);
  }
);`,
    },
    {
      task: 'Implement a retry interceptor: on network errors or 503, retry the same request up to 2 times with a 1 s, then 2 s delay (only for GET requests).',
      hint: 'Store a retry counter on error.config and call api(config) again.',
      solution: `const wait = ms => new Promise(r => setTimeout(r, ms));

api.interceptors.response.use(
  res => res,
  async error => {
    const config = error.config;
    const retriable = !error.response || error.response.status === 503;
    if (!config || config.method !== 'get' || !retriable || axios.isCancel(error)) {
      return Promise.reject(error);
    }
    config.__retryCount = (config.__retryCount || 0) + 1;
    if (config.__retryCount > 2) return Promise.reject(error);
    await wait(1000 * config.__retryCount);        // 1 s, then 2 s
    return api(config);                             // re-run the same request
  }
);
// Only retry idempotent requests (GET). Retrying a POST /orders could create duplicate orders.`,
    },
    {
      task: 'Write a useApi(fn, deps) custom hook that runs a service function with an AbortController, returns { data, error, status, reload }, and ignores canceled errors.',
      hint: 'Pass { signal } to fn; keep a reload counter in the dependency list.',
      solution: `import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export function useApi(fn, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState(s => ({ ...s, status: 'loading', error: null }));
    fn({ signal: controller.signal })
      .then(data => setState({ status: 'success', data, error: null }))
      .catch(err => {
        if (axios.isCancel(err)) return;
        setState({ status: 'error', data: null, error: err });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick(t => t + 1), []);
  return { ...state, reload };
}

// usage
const { data, status, error, reload } = useApi(cfg => productsApi.getById(id, cfg), [id]);
// Day 37: TanStack Query does all of this (plus caching) for you.`,
    },
  ],
  quiz: [
    {
      question: 'An Axios GET returns HTTP 404. What happens?',
      options: ['The promise resolves with res.ok = false', 'The promise rejects and error.response.status is 404', 'Axios retries automatically', 'Nothing; res.data is undefined'],
      answer: 1,
      explanation: 'Axios rejects for every status outside 2xx; details are in error.response.',
    },
    {
      question: 'Where do you read the parsed JSON body of an Axios response?',
      options: ['res.json()', 'res.body', 'res.data', 'res.payload'],
      answer: 2,
      explanation: 'Axios parses JSON automatically into res.data.',
    },
    {
      question: 'What must a request interceptor return?',
      options: ['The config object (or a promise of it)', 'Nothing', 'The response', 'true to continue'],
      answer: 0,
      explanation: 'Without returning config, the request has no configuration and fails.',
    },
    {
      question: 'Which is the modern way to cancel an Axios request?',
      options: ['CancelToken.source()', 'request.cancel()', 'axios.stop(id)', 'Pass an AbortController signal and call abort()'],
      answer: 3,
      explanation: 'CancelToken is deprecated; Axios supports the standard AbortController signal.',
    },
    {
      question: 'error.response is undefined and error.code is "ERR_NETWORK". What is a likely cause?',
      options: ['The server returned 500', 'Wrong JSON in the body', 'Offline, server unreachable or blocked by CORS', 'The user cancelled the request'],
      answer: 2,
      explanation: 'No response means the request never got a readable answer: network problems or CORS.',
    },
  ],
};
