export default {
  id: 'day-02-connecting-react-to-api-axios-tanstack-query',
  title: 'Connecting React to the API: Axios Instance, Interceptors, Loading/Error States and TanStack Query Hooks',
  module: 'Module 1: Architecture & Setup',
  day: 2,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Build a clean API layer in React: one configured axios instance, request/response interceptors for auth and errors, resource modules (productsApi, ordersApi) and TanStack Query 5 hooks that handle caching, loading, errors, refetching and cache invalidation for you.',
  objectives: [
    'Create a single axios instance with baseURL, timeout, credentials and interceptors',
    'Normalise server errors into one shape that every component can display',
    'Design an API layer: api client → resource modules → query hooks → components',
    'Use TanStack Query 5 (useQuery, useMutation, queryClient.invalidateQueries) with query-key factories',
    'Handle loading, error, empty and success states (and optimistic updates) correctly',
  ],
  theory: [
    {
      heading: 'Why not just call fetch() inside every component?',
      content:
        'Beginners write `useEffect(() => { fetch(...).then(setData) }, [])` in every component. It works for a demo but breaks in a real app:\n\n- The base URL, headers and token logic are **copy-pasted** in 40 places.\n- No **caching**: going back to a page refetches everything and shows a spinner again.\n- **Race conditions**: typing fast in a search box can show results of an older request.\n- Every component re-implements `loading`, `error`, retries and refetch-on-focus.\n- When you create a product, the list does not know it should update.\n\nThe professional solution has **layers**, just like the backend:\n\n1. **HTTP client** (`src/api/client.js`): one axios instance with interceptors.\n2. **Resource modules** (`src/api/products.js`): plain functions like `getProducts(params)`, `createProduct(data)`; they know URLs, not React.\n3. **Query hooks** (`src/api/products.queries.js`): `useProducts()`, `useCreateProduct()` built with TanStack Query.\n4. **Components** only call hooks and render states.\n\nAnalogy: components are customers in a mall. They should not each drive to the warehouse (server). They ask the **shop counter** (hooks), which checks the **shelf** (cache) first and only orders from the warehouse when needed.',
    },
    {
      heading: 'The axios instance: one place for base URL, credentials and timeouts',
      content:
        '**axios** is an HTTP client with conveniences over fetch: automatic JSON parsing, it **throws for non-2xx status codes**, request/response **interceptors**, timeouts, and `AbortController` support.\n\nCreate ONE instance with `axios.create()` and import it everywhere:\n\n- `baseURL`: `import.meta.env.VITE_API_URL + \'/api\'` (empty prefix in dev when using the Vite proxy).\n- `withCredentials: true`: send cookies (needed for httpOnly refresh-token cookies on Day 4).\n- `timeout: 15000`: do not wait forever on a sleeping free-tier server.\n- default headers like `Accept: application/json`.\n\nfetch vs axios: fetch is built in and fine for small apps, but you must check `res.ok` manually and write interceptor-like wrappers yourself. Most MERN codebases in Indian product companies use axios (or a thin fetch wrapper like `ky`).',
      syntax:
        "// src/api/client.js\nimport axios from 'axios';\n\nexport const api = axios.create({\n  baseURL: (import.meta.env.VITE_API_URL ?? '') + '/api',\n  withCredentials: true,\n  timeout: 15000,\n  headers: { Accept: 'application/json' },\n});",
      tip: 'Do NOT create a new axios instance inside a component. Interceptors would be registered again on every render and requests would multiply.',
    },
    {
      heading: 'Interceptors: middleware for the frontend',
      content:
        'Interceptors are functions that run **before every request** or **after every response**, exactly like Express middleware but on the client.\n\n**Request interceptor** uses:\n- attach `Authorization: Bearer <accessToken>` when you keep the access token in memory\n- add a request id or language header (`Accept-Language: hi-IN`)\n\n**Response interceptor** uses:\n- **normalise errors**: convert every failure (network error, timeout, 400 with field errors, 500) into one `ApiError { status, message, fieldErrors }` so the UI has one thing to display\n- on **401**, try to refresh the token once and retry the original request (full implementation on Day 4)\n- log or report 5xx errors to monitoring (Sentry)\n\nAn interceptor returns the config/response to continue, or returns `Promise.reject(error)` to fail.',
      syntax:
        "api.interceptors.request.use((config) => {\n  const token = getAccessToken();          // from memory / auth store\n  if (token) config.headers.Authorization = 'Bearer ' + token;\n  return config;\n});\n\napi.interceptors.response.use(\n  (res) => res,\n  (err) => Promise.reject(toApiError(err))  // one error shape everywhere\n);",
    },
    {
      heading: 'TanStack Query 5: server state is not UI state',
      content:
        '**Server state** (products, orders, the logged-in user) lives on the server; your app only has a **cached copy** that can become stale. **Client/UI state** (is the modal open, which tab is selected) lives only in the browser. Mixing them in Redux or useState is the root of most bugs.\n\n**TanStack Query** (formerly React Query) manages server state:\n\n- `useQuery({ queryKey, queryFn })` fetches, caches by key, and returns `{ data, isPending, isError, error, isFetching, refetch }`.\n- **queryKey** is an array that identifies the data: `[\'products\', { page: 2, q: \'phone\' }]`. Different key = different cache entry. When the key changes, it fetches automatically.\n- **staleTime**: how long data is "fresh" (no refetch). Default 0. **gcTime** (was cacheTime in v4): how long unused data stays in memory (default 5 min).\n- Auto **refetch on window focus / reconnect**, **retries** (3 by default), **deduplication** (10 components asking for the same key = 1 request).\n- `useMutation({ mutationFn, onSuccess })` for POST/PUT/DELETE, then `queryClient.invalidateQueries({ queryKey: [\'products\'] })` marks lists stale so they refetch.\n\nv5 changes to remember: single **object** argument only, `isLoading` renamed to **`isPending`** (no data yet), `cacheTime` → `gcTime`, `keepPreviousData` → `placeholderData: keepPreviousData`, and `onSuccess/onError` callbacks were **removed from useQuery** (still on useMutation).',
      points: [
        'isPending = no data yet (first load); isFetching = any request in flight (including background refetch)',
        'Use enabled: !!id to wait for a dependency before fetching',
        'Wrap the app in <QueryClientProvider client={queryClient}> once in main.jsx',
        'React Query Devtools show every cache entry, its key and status',
      ],
    },
    {
      heading: 'Query key factories and hooks per resource',
      content:
        'Hard-coding keys like `[\'products\']` in many files leads to typos and forgotten invalidations. Use a **key factory** per resource:\n\n```\nexport const productKeys = {\n  all: [\'products\'],\n  lists: () => [...productKeys.all, \'list\'],\n  list: (params) => [...productKeys.lists(), params],\n  detail: (id) => [...productKeys.all, \'detail\', id],\n};\n```\n\nInvalidating `productKeys.all` refreshes every list and detail; invalidating `productKeys.lists()` refreshes only lists. Then export **one hook per operation**: `useProducts(params)`, `useProduct(id)`, `useCreateProduct()`, `useUpdateProduct()`, `useDeleteProduct()`. Components never see URLs or keys.\n\nThis is the "API layer design" interviewers ask about: **client → resource functions → hooks → components**, each layer replaceable and testable (you can mock the resource module in tests).',
    },
    {
      heading: 'Rendering every state: loading, error, empty, success (and optimistic UI)',
      content:
        'A professional screen handles **four states**, not one:\n\n1. **Loading** (`isPending`): skeleton cards, not a blank page.\n2. **Error** (`isError`): friendly message + **Retry** button calling `refetch()`.\n3. **Empty** (`data.length === 0`): "No products yet. Add your first one."\n4. **Success**: the list, plus a small "Updating..." indicator when `isFetching` in the background.\n\nFor mutations, disable the submit button while `isPending` to prevent double submits, and show field errors from the normalised ApiError.\n\n**Optimistic updates** make the UI feel instant: update the cache **before** the server replies (`onMutate`), keep a snapshot, and **roll back** in `onError`. Finally `onSettled` invalidates to sync with the truth. Use it for likes, toggles, reordering; avoid it for payments or anything the server may reject often.',
      tip: 'Do not put server data into useState after fetching ("copying" the cache). Read it from the query each render; otherwise your copy goes stale when the cache refreshes.',
    },
  ],
  examples: [
    {
      title: 'Complete API client: axios instance + error-normalising interceptors',
      scenario:
        'Create src/api/client.js for a MERN shop. Every error in the app (network down, timeout, 400 with field errors, 401, 500) must reach components as the same ApiError object.',
      steps: [
        'npm i axios -w client',
        'Create src/api/client.js with axios.create()',
        'Add a request interceptor that attaches the access token from an in-memory store',
        'Add a response interceptor that converts any failure to ApiError',
        'Use api.get/post in resource modules (next example)',
      ],
      code: `// client/src/api/client.js
import axios from 'axios';

// --- tiny in-memory token store (filled after login on Day 4) ---
let accessToken = null;
export const tokenStore = {
  get: () => accessToken,
  set: (t) => { accessToken = t; },
  clear: () => { accessToken = null; },
};

// --- one error shape for the whole UI ---
export class ApiError extends Error {
  constructor({ status, message, fieldErrors }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;              // 0 = network/timeout
    this.fieldErrors = fieldErrors || {};
  }
}

export function toApiError(err) {
  if (axios.isCancel(err)) return err;                          // ignore aborted requests
  if (err.code === 'ECONNABORTED') {
    return new ApiError({ status: 0, message: 'The server is taking too long. Please try again.' });
  }
  if (!err.response) {
    return new ApiError({ status: 0, message: 'Network error. Check your internet connection.' });
  }
  const { status, data } = err.response;
  return new ApiError({
    status,
    message: data?.message || 'Request failed with status ' + status,
    fieldErrors: data?.errors,
  });
}

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? '') + '/api',
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error))
);

// usage anywhere:
// try { await api.post('/products', body) }
// catch (e) { toast.error(e.message); setErrors(e.fieldErrors) }`,
      result:
        'A 400 response { "message": "Validation failed", "errors": { "price": "Price must be positive" } } reaches the component as ApiError with status 400, message "Validation failed" and fieldErrors.price. Stopping the backend gives ApiError status 0 "Network error. Check your internet connection."',
      explanation:
        'axios rejects for every non-2xx status, so the response interceptor is the single choke point for errors. err.response exists only when the server replied; when it is missing it was a network/CORS/timeout failure. Keeping the token in a module variable (not localStorage) reduces XSS risk; Day 4 adds the refresh-token cookie and a 401 retry interceptor on top of this file.',
    },
    {
      title: 'Resource module + TanStack Query hooks with a key factory',
      scenario:
        'Expose products to the whole app through hooks: useProducts(params), useProduct(id), useCreateProduct(), useDeleteProduct(). The ProductsPage component should not know any URL.',
      steps: [
        'npm i @tanstack/react-query @tanstack/react-query-devtools -w client',
        'Create the QueryClient in main.jsx with sensible defaults',
        'Write src/api/products.js (plain functions returning data)',
        'Write src/api/products.queries.js with productKeys and hooks',
        'Use the hooks in ProductsPage with all four UI states',
      ],
      code: `// ===== client/src/main.jsx =====
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,                       // 30 s fresh: no refetch on every mount
      retry: (count, err) => err.status >= 500 && count < 2, // do not retry 4xx
      refetchOnWindowFocus: true,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);

// ===== client/src/api/products.js (no React here) =====
import { api } from './client';
export const productsApi = {
  list: (params, signal) => api.get('/products', { params, signal }).then((r) => r.data),
  get: (id, signal) => api.get('/products/' + id, { signal }).then((r) => r.data),
  create: (body) => api.post('/products', body).then((r) => r.data),
  update: ({ id, ...body }) => api.patch('/products/' + id, body).then((r) => r.data),
  remove: (id) => api.delete('/products/' + id),
};

// ===== client/src/api/products.queries.js =====
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { productsApi } from './products';

export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (params) => [...productKeys.lists(), params],
  detail: (id) => [...productKeys.all, 'detail', id],
};

export function useProducts(params) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: ({ signal }) => productsApi.list(params, signal), // signal cancels stale requests
    placeholderData: keepPreviousData,                         // keep old page while next loads
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => productsApi.get(id, signal),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists() }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.remove,
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: productKeys.detail(id) });
      return qc.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// ===== client/src/pages/ProductsPage.jsx =====
import { useState } from 'react';
import { useProducts, useDeleteProduct } from '../api/products.queries';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } =
    useProducts({ page, limit: 10 });
  const del = useDeleteProduct();

  if (isPending) return <p>Loading products...</p>;
  if (isError) return <p role="alert">{error.message} <button onClick={() => refetch()}>Retry</button></p>;
  if (data.data.length === 0) return <p>No products yet.</p>;

  return (
    <>
      {isFetching && <small>Updating...</small>}
      <ul>
        {data.data.map((p) => (
          <li key={p._id}>
            {p.name} - ₹{p.price}
            <button disabled={del.isPending} onClick={() => del.mutate(p._id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
      <button disabled={isPlaceholderData || page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
    </>
  );
}`,
      result:
        'The first visit shows "Loading products..." then the list. Going to page 2 keeps page 1 visible with "Updating..." until page 2 arrives (no flashing spinner). Returning to page 1 is instant from cache. Deleting a product refetches the list automatically. Devtools show keys like ["products","list",{"page":1,"limit":10}].',
      explanation:
        'The params object is part of the queryKey, so changing page creates a new cache entry and triggers a fetch. TanStack Query passes an AbortSignal to queryFn; giving it to axios cancels requests that are no longer needed. keepPreviousData (v5 helper) avoids blank flashes during pagination. Invalidating productKeys.lists() refreshes every list variant (all pages, all filters) but not the detail caches.',
    },
    {
      title: 'The backend contract the client relies on (API Lab)',
      scenario:
        'The React layer expects: list envelope { data, page, totalPages }, 401 { message } when the token is missing, 400 { message, errors } for validation, 404 for unknown ids. Build exactly that contract so you can test the client against it.',
      steps: [
        'Create an in-memory products array and a fake auth check on the Authorization header',
        'GET /api/products returns the paginated envelope',
        'POST /api/products requires a token and validates name and price',
        'Run the requests, including one without a token and one with bad data',
      ],
      code: `// Real server: the same contract with Mongoose
router.get('/', async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const [data, total] = await Promise.all([
    Product.find().sort('-createdAt').skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(),
  ]);
  res.json({ data, page, totalPages: Math.ceil(total / limit), total });
});
router.post('/', requireAuth, validate(productSchema), async (req, res) => {
  res.status(201).json(await Product.create(req.body));
});`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const products = [
  { _id: 'p1', name: 'Wireless Mouse', price: 699 },
  { _id: 'p2', name: 'USB-C Hub', price: 1299 },
  { _id: 'p3', name: 'Laptop Stand', price: 999 },
];
let nextId = 4;

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (header !== 'Bearer demo-token') return res.status(401).json({ message: 'Please log in' });
  next();
}

app.get('/api/products', (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 2, 50);
  const data = products.slice((page - 1) * limit, page * limit);
  res.json({ data, page, totalPages: Math.ceil(products.length / limit), total: products.length });
});

app.get('/api/products/:id', (req, res) => {
  const p = products.find(x => x._id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
});

app.post('/api/products', requireAuth, (req, res) => {
  const { name, price } = req.body || {};
  const errors = {};
  if (!name || String(name).trim().length < 3) errors.name = 'Name must be at least 3 characters';
  if (typeof price !== 'number' || price <= 0) errors.price = 'Price must be a positive number';
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Validation failed', errors });
  const product = { _id: 'p' + nextId++, name: name.trim(), price };
  products.push(product);
  res.status(201).json(product);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/products?page=2&limit=2' },
          { method: 'POST', url: '/api/products', body: { name: 'Webcam', price: 2499 } },
          { method: 'POST', url: '/api/products', headers: { Authorization: 'Bearer demo-token' }, body: { name: 'TV', price: -5 } },
          { method: 'POST', url: '/api/products', headers: { Authorization: 'Bearer demo-token' }, body: { name: 'Webcam', price: 2499 } },
          { method: 'GET', url: '/api/products/p99' },
        ],
      },
      result: "GET /api/products?page=2&limit=2 → 200 {\"data\":[{\"_id\":\"p3\",\"name\":\"Laptop Stand\",\"price\":999}],\"page\":2,\"totalPages\":2,\"total\":3}\nPOST /api/products → 401 {\"message\":\"Please log in\"}\nPOST /api/products → 400 {\"message\":\"Validation failed\",\"errors\":{\"name\":\"Name must be at least 3 characters\",\"price\":\"Price must be a positive number\"}}\nPOST /api/products → 201 {\"_id\":\"p4\",\"name\":\"Webcam\",\"price\":2499}\nGET /api/products/p99 → 404 {\"message\":\"Product not found\"}",
      explanation:
        'Each response maps to one client behaviour: the envelope feeds useProducts (data.data, data.totalPages); 401 is what the Day 4 interceptor will catch to refresh the token; 400 with errors becomes ApiError.fieldErrors shown under the inputs; 201 triggers invalidateQueries; 404 becomes isError on the detail page. Agreeing this contract first lets frontend and backend developers work in parallel.',
    },
    {
      title: 'How a query cache works: a mini useQuery (playground)',
      scenario:
        'To really understand TanStack Query, build a tiny version: a shared cache keyed by a string, loading/error/success states, stale time and a refetch button. The fake API takes 600 ms and fails every third call.',
      steps: [
        'Click Run, then switch between "phones" and "laptops" tabs',
        'Notice the second visit to a tab is instant (cache hit) while it refetches in the background when stale',
        'Press Refetch until you hit the simulated server error and see the error state + Retry',
      ],
      code: `// Concept only: in the real app use @tanstack/react-query
const cache = new Map();   // key -> { data, updatedAt }
function useMiniQuery(key, fn, staleTime) {
  // returns { data, status, isFetching, error, refetch }
}`,
      playground: {
        jsx: `const cache = new Map();
let calls = 0;
const fakeApi = (category) => new Promise((resolve, reject) => {
  calls += 1;
  const n = calls;
  setTimeout(() => {
    if (n % 3 === 0) reject(new Error('500: Server error on call #' + n));
    else resolve({ category, items: category === 'phones' ? ['Pixel 9', 'iPhone 16', 'Galaxy S25'] : ['MacBook Air', 'ThinkPad X1'], call: n });
  }, 600);
});

function useMiniQuery(key, fn, staleTime) {
  const cached = cache.get(key);
  const [state, setState] = React.useState({ data: cached ? cached.data : undefined, error: null, isFetching: false });

  const run = React.useCallback(() => {
    setState((s) => ({ ...s, isFetching: true, error: null }));
    fn().then(
      (data) => { cache.set(key, { data, updatedAt: Date.now() }); setState({ data, error: null, isFetching: false }); },
      (error) => setState((s) => ({ ...s, error, isFetching: false }))
    );
  }, [key]);

  React.useEffect(() => {
    const c = cache.get(key);
    setState({ data: c ? c.data : undefined, error: null, isFetching: false });
    if (!c || Date.now() - c.updatedAt > staleTime) run();
  }, [key]);

  const status = state.data ? 'success' : state.error ? 'error' : 'pending';
  return { ...state, status, refetch: run };
}

function App() {
  const [cat, setCat] = React.useState('phones');
  const q = useMiniQuery('products:' + cat, () => fakeApi(cat), 5000);
  const tab = (c) => ({ padding: '6px 12px', marginRight: 6, borderRadius: 6, border: '1px solid #888', background: c === cat ? '#2563eb' : 'transparent', color: c === cat ? '#fff' : 'inherit', cursor: 'pointer' });

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <button style={tab('phones')} onClick={() => setCat('phones')}>phones</button>
      <button style={tab('laptops')} onClick={() => setCat('laptops')}>laptops</button>
      <button style={{ ...tab(''), marginLeft: 12 }} onClick={q.refetch}>Refetch</button>
      <p>status: <b>{q.status}</b> {q.isFetching && <span>(fetching in background...)</span>}</p>
      {q.status === 'pending' && <p>Loading skeleton...</p>}
      {q.error && <p style={{ color: 'crimson' }}>{q.error.message} <button onClick={q.refetch}>Retry</button></p>}
      {q.data && (
        <ul>
          {q.data.items.map((i) => <li key={i}>{i}</li>)}
          <small>served by API call #{q.data.call}</small>
        </ul>
      )}
    </div>
  );
}`,
      },
      result:
        'First click on a tab shows "pending" then the items. Switching back within 5 seconds shows the cached list instantly with no new call number. After 5 seconds the cached list stays visible while "(fetching in background...)" appears. Every third call shows the red error with a Retry button, while old data (if any) stays on screen.',
      explanation:
        'This is the core of stale-while-revalidate: show cached data immediately, refetch in the background when stale. The real TanStack Query adds request deduplication, retries with backoff, garbage collection (gcTime), refetch on focus/reconnect, cancellation and devtools. Notice that an error does not wipe existing data: TanStack Query also keeps data and sets isError, letting you show both.',
    },
    {
      title: 'Optimistic "wishlist" toggle with rollback (playground)',
      scenario:
        'Clicking the heart should feel instant even on slow 3G. Update the UI first, call the server, and roll back with a message if the server rejects it. The fake server rejects product #3.',
      steps: [
        'Click Run and click the hearts',
        'Product #3 turns red, then flips back after the server error with a message',
        'Read the real TanStack Query version in the code block',
      ],
      code: `// Real TanStack Query 5 version
export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post('/wishlist/' + id + '/toggle'),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['wishlist'] });      // stop in-flight refetch
      const previous = qc.getQueryData(['wishlist']);           // snapshot
      qc.setQueryData(['wishlist'], (old = []) =>
        old.includes(id) ? old.filter((x) => x !== id) : [...old, id]);
      return { previous };                                       // becomes context
    },
    onError: (_err, _id, context) => qc.setQueryData(['wishlist'], context.previous), // rollback
    onSettled: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),               // sync with server
  });
}`,
      playground: {
        jsx: `const serverToggle = (id) => new Promise((resolve, reject) =>
  setTimeout(() => (id === 3 ? reject(new Error('Product #3 is no longer available')) : resolve()), 800));

function App() {
  const [liked, setLiked] = React.useState([1]);
  const [msg, setMsg] = React.useState('');
  const [pending, setPending] = React.useState([]);

  async function toggle(id) {
    const previous = liked;                                  // snapshot
    setLiked((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id])); // optimistic
    setPending((p) => [...p, id]);
    setMsg('');
    try {
      await serverToggle(id);
    } catch (e) {
      setLiked(previous);                                    // rollback
      setMsg(e.message);
    } finally {
      setPending((p) => p.filter((x) => x !== id));
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      {[1, 2, 3, 4].map((id) => (
        <div key={id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 6 }}>
          <span style={{ width: 90 }}>Product #{id}</span>
          <button onClick={() => toggle(id)} aria-pressed={liked.includes(id)}
            style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: liked.includes(id) ? 'crimson' : '#999' }}>
            {liked.includes(id) ? '♥' : '♡'}
          </button>
          {pending.includes(id) && <small>saving...</small>}
        </div>
      ))}
      {msg && <p role="alert" style={{ color: 'crimson' }}>{msg}</p>}
    </div>
  );
}`,
      },
      result:
        'Hearts for #1, #2, #4 change colour instantly and show "saving..." for 0.8 s. Clicking #3 turns it red immediately, then it reverts to grey and the message "Product #3 is no longer available" appears.',
      explanation:
        'The pattern is snapshot → optimistic update → server call → rollback on error → resync. In the real version, cancelQueries prevents an older background refetch from overwriting the optimistic value, and onSettled invalidation guarantees the UI ends up matching the database. Note the playground rollback uses a snapshot captured at click time; with rapid clicks on different items TanStack Query\'s per-mutation context plus final invalidation handles it more robustly.',
    },
  ],
  interview: [
    {
      q: 'Why use an axios instance instead of calling axios.get with full URLs everywhere?',
      a: 'An instance (axios.create) centralises configuration: baseURL from env, withCredentials, timeout, default headers and interceptors. Changing the API domain or auth logic then means editing one file. It also lets you have separate instances, e.g. one for your API and one for a third-party API without your auth header.',
      level: 'Easy',
    },
    {
      q: 'What are axios interceptors? Give three real uses.',
      a: 'Interceptors are functions that run on every request before it is sent, or on every response before your code receives it. Uses: 1) attach the Authorization bearer token; 2) normalise errors into one ApiError shape; 3) on 401, refresh the access token and retry the original request; also logging, adding request ids or showing a global progress bar.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between server state and client state? Why does it matter?',
      a: 'Server state is owned by the backend (products, user profile) and the frontend only holds a possibly stale cached copy that needs fetching, caching, invalidation and syncing. Client state is owned by the UI (modal open, form inputs, theme). Tools differ: TanStack Query/SWR/RTK Query for server state, useState/Context/Zustand for client state. Mixing them (e.g. storing fetched lists in Redux by hand) leads to stale data and lots of boilerplate.',
      level: 'Medium',
    },
    {
      q: 'Explain staleTime vs gcTime in TanStack Query.',
      a: 'staleTime is how long fetched data is considered fresh; while fresh, mounting a component or focusing the window will not refetch. Default is 0 (immediately stale). gcTime (cacheTime in v4) is how long INACTIVE cache entries (no component using them) stay in memory before garbage collection; default 5 minutes. Data can be stale but still cached, which gives instant display plus background refetch.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between isPending and isFetching in TanStack Query v5?',
      a: 'isPending is true when the query has no data yet (status "pending", the first load). isFetching is true whenever a request is running, including background refetches when data already exists. Show a full skeleton for isPending and a small "Updating" indicator for isFetching. (In v4, isLoading meant what isPending means now; in v5 isLoading = isPending && isFetching.)',
      level: 'Medium',
    },
    {
      q: 'How do you update a list after creating an item with useMutation?',
      a: 'In onSuccess call queryClient.invalidateQueries({ queryKey: ["products", "list"] }), which marks matching queries stale and refetches active ones. Alternatives: setQueryData to insert the returned item directly (saves a request), or an optimistic update in onMutate with rollback in onError and invalidate in onSettled.',
      level: 'Medium',
    },
    {
      q: 'What is a query key factory and why use it?',
      a: 'An object of functions that build query keys for a resource, e.g. productKeys.all = ["products"], productKeys.list(params) = ["products","list",params], productKeys.detail(id) = ["products","detail",id]. It prevents typos, keeps the hierarchy consistent, and makes targeted invalidation easy (invalidate all, only lists, or one detail) because invalidation matches by key prefix.',
      level: 'Medium',
    },
    {
      q: 'How do you prevent race conditions when the user types quickly in a search box?',
      a: 'Include the search term in the queryKey so each term has its own cache entry, and pass the AbortSignal from queryFn to axios so obsolete requests are cancelled. TanStack Query only shows the result for the current key, so an older slow response cannot overwrite a newer one. Add debouncing (300 ms) to avoid a request per keystroke. With plain useEffect, use an AbortController and an "ignore" flag in cleanup.',
      level: 'Hard',
    },
    {
      q: 'fetch vs axios: what are the practical differences?',
      a: 'fetch is built into browsers and Node 18+, returns a Response you must parse with res.json(), and does NOT reject on HTTP errors (check res.ok); credentials need credentials: "include"; timeouts need AbortSignal.timeout(). axios parses JSON automatically, rejects for non-2xx, has interceptors, a baseURL, timeouts, upload progress events and withCredentials. axios adds about 13 KB gzipped; for small apps a thin fetch wrapper is enough.',
      level: 'Easy',
    },
    {
      q: 'Describe an API layer architecture for a large React app.',
      a: 'Four layers: 1) HTTP client (configured axios instance, interceptors, error normalisation, token handling); 2) resource modules per backend resource exporting plain async functions (no React); 3) query/mutation hooks per resource using TanStack Query with key factories and invalidation rules; 4) components that only call hooks and render loading/error/empty/success. Benefits: single place to change URLs, easy mocking in tests (mock the resource module or use MSW), consistent caching and errors.',
      level: 'Hard',
    },
    {
      q: 'When would you NOT use optimistic updates?',
      a: 'When the operation is likely to fail or must be confirmed before the user moves on: payments, placing orders, booking seats with limited stock, anything with complex server-side calculation (taxes, discounts) where the client cannot predict the result. Use a pending state and show the server result instead. Optimistic updates suit likes, toggles, reordering, simple edits.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write src/api/client.js with an axios instance (baseURL from VITE_API_URL, withCredentials, 10 s timeout) and a response interceptor that converts errors into { status, message, fieldErrors }. Also export a helper getErrorMessage(err).',
      hint: 'Check err.response first; no response means a network/timeout problem.',
      solution: `import axios from 'axios';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? '') + '/api',
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isCancel(err)) return Promise.reject(err);
    const normalized = err.response
      ? {
          status: err.response.status,
          message: err.response.data?.message || 'Request failed (' + err.response.status + ')',
          fieldErrors: err.response.data?.errors || {},
        }
      : {
          status: 0,
          message: err.code === 'ECONNABORTED' ? 'Request timed out' : 'Network error',
          fieldErrors: {},
        };
    return Promise.reject(normalized);
  }
);

export function getErrorMessage(err) {
  return err?.message || 'Something went wrong';
}`,
    },
    {
      task: 'Create a full set of TanStack Query hooks for an "orders" resource: key factory, useOrders(params), useOrder(id), useCreateOrder() that invalidates the orders lists, and useCancelOrder() that updates the detail cache with setQueryData.',
      hint: 'mutationFn returns the updated order; use it in onSuccess.',
      solution: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

const ordersApi = {
  list: (params, signal) => api.get('/orders', { params, signal }).then((r) => r.data),
  get: (id, signal) => api.get('/orders/' + id, { signal }).then((r) => r.data),
  create: (body) => api.post('/orders', body).then((r) => r.data),
  cancel: (id) => api.patch('/orders/' + id + '/cancel').then((r) => r.data),
};

export const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: (params) => [...orderKeys.lists(), params],
  detail: (id) => [...orderKeys.all, 'detail', id],
};

export const useOrders = (params) =>
  useQuery({ queryKey: orderKeys.list(params), queryFn: ({ signal }) => ordersApi.list(params, signal) });

export const useOrder = (id) =>
  useQuery({ queryKey: orderKeys.detail(id), queryFn: ({ signal }) => ordersApi.get(id, signal), enabled: !!id });

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: (order) => {
      qc.setQueryData(orderKeys.detail(order._id), order);
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.cancel,
    onSuccess: (order) => {
      qc.setQueryData(orderKeys.detail(order._id), order);
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}`,
    },
    {
      task: 'Build a reusable <QueryState> component that receives a query result and renders a skeleton for pending, an error box with Retry for error, an empty message when a selector returns an empty array, and children(data) for success.',
      hint: 'Use a render-prop: children is a function.',
      solution: `export function QueryState({ query, isEmpty = (d) => Array.isArray(d) && d.length === 0, empty = 'Nothing here yet.', children }) {
  const { data, isPending, isError, error, refetch, isFetching } = query;
  if (isPending) {
    return (
      <div aria-busy="true">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 48, margin: 8, background: '#e5e7eb', borderRadius: 8 }} />)}
      </div>
    );
  }
  if (isError && !data) {
    return (
      <div role="alert">
        <p>{error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }
  if (isEmpty(data)) return <p>{empty}</p>;
  return (
    <>
      {isFetching && <small>Updating...</small>}
      {children(data)}
    </>
  );
}

// usage
// const q = useProducts({ page });
// <QueryState query={q} isEmpty={(d) => d.data.length === 0} empty="No products">
//   {(d) => d.data.map((p) => <ProductCard key={p._id} product={p} />)}
// </QueryState>`,
    },
    {
      task: 'Write a debounced product search using TanStack Query: an input, a useDebounce hook (400 ms), and useQuery that only runs when the term has at least 2 characters.',
      hint: 'Put the debounced term in the queryKey and use enabled.',
      solution: `import { useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../api/client';

function useDebounce(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ProductSearch() {
  const [term, setTerm] = useState('');
  const q = useDebounce(term.trim());
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ['products', 'search', q],
    queryFn: ({ signal }) => api.get('/products', { params: { q }, signal }).then((r) => r.data.data),
    enabled: q.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  return (
    <div>
      <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search products" />
      {isFetching && <small> searching...</small>}
      {isError && <p role="alert">{error.message}</p>}
      <ul>{(data ?? []).map((p) => <li key={p._id}>{p.name}</li>)}</ul>
    </div>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'In TanStack Query v5, which flag is true ONLY while a query has no data yet?',
      options: ['isFetching', 'isPending', 'isStale', 'isRefetching'],
      answer: 1,
      explanation: 'isPending means status "pending" (no data). isFetching is true for any request, including background refetches.',
    },
    {
      question: 'Your product list does not update after a successful POST /api/products. What is the cleanest fix?',
      options: [
        'Reload the page with window.location.reload()',
        'Set staleTime to 0 everywhere',
        'Call queryClient.invalidateQueries({ queryKey: ["products", "list"] }) in the mutation onSuccess',
        'Store the list in useState and push the new item',
      ],
      answer: 2,
      explanation: 'Invalidation marks the cached lists as stale and refetches the active ones, keeping the cache as the single source of truth.',
    },
    {
      question: 'Which statement about axios is TRUE?',
      options: [
        'axios rejects the promise for non-2xx responses such as 404 and 500',
        'axios never sends cookies, even with withCredentials',
        'axios interceptors run only on the server',
        'axios requires you to call res.json() to parse responses',
      ],
      answer: 0,
      explanation: 'Unlike fetch, axios treats non-2xx status codes as errors and parses JSON automatically.',
    },
    {
      question: 'Where should you store the Authorization header logic in a React API layer?',
      options: [
        'Inside every component that makes a request',
        'In localStorage directly',
        'In a useEffect in App.jsx that patches window.fetch',
        'In a request interceptor on the shared axios instance',
      ],
      answer: 3,
      explanation: 'A request interceptor runs for every request made with the instance, so the logic lives in exactly one place.',
    },
    {
      question: 'What happens when the queryKey of a useQuery changes from ["products", {page:1}] to ["products", {page:2}]?',
      options: [
        'Nothing until you call refetch()',
        'TanStack Query treats it as a different cache entry and fetches page 2 automatically',
        'Page 1 data is deleted immediately',
        'An error is thrown because keys must be strings',
      ],
      answer: 1,
      explanation: 'Keys are hashed; a new key is a new query, so it is fetched (and page 1 stays cached until gcTime).',
    },
  ],
};
