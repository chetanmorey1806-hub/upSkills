export default {
  id: 'day-03-server-state-tanstack-query',
  title: 'Server State with TanStack Query v5: Queries, Mutations, Invalidation, Pagination, Infinite Scroll, Optimistic Updates and Axios Interceptors',
  module: 'Module 2: Data & State',
  day: 3,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    'Stop writing useEffect + useState for API calls. TanStack Query (React Query) caches server data, deduplicates requests, refetches in the background and handles loading, error, pagination and optimistic updates. Combined with a configured axios instance it becomes the data layer of a professional MERN frontend.',
  objectives: [
    'Explain the difference between server state and client state',
    'Set up QueryClient, write useQuery hooks with good query keys, and tune staleTime / gcTime',
    'Write mutations and keep the cache fresh with invalidateQueries or setQueryData',
    'Implement paginated and infinite lists with placeholderData and useInfiniteQuery',
    'Create an axios instance with base URL, auth header and response interceptors',
  ],
  theory: [
    {
      heading: 'Server state is different from client state',
      content:
        '**Client state** is owned by the browser: is the modal open, the selected tab, form input. **Server state** is owned by the backend (MongoDB via Express): products, orders, users. Server state has special problems:\n- It can become **stale** (someone else changed it).\n- Many components need the **same data**: you do not want 5 identical requests.\n- You need **caching**, background refresh, retry, pagination and invalidation after writes.\n\nHand-written `useEffect` fetching gives you none of that, plus race conditions and the StrictMode double request. TanStack Query is an **async state manager** that solves these problems. Putting API data in Redux is the old way; today the common stack is **TanStack Query (or RTK Query) for server state + a small store (Zustand/Context) for client state**.',
    },
    {
      heading: 'Setup and useQuery',
      content:
        'Install `npm i @tanstack/react-query @tanstack/react-query-devtools axios`. Create one `QueryClient` and wrap the app with `QueryClientProvider`.\n\n`useQuery({ queryKey, queryFn, ...options })` returns `{ data, error, isPending, isError, isSuccess, isFetching, refetch, status }`.\n- **queryKey** is an array that uniquely identifies the data, like a cache address: `[\'products\']`, `[\'products\', { page, category }]`, `[\'product\', id]`. When a key changes, the query re-runs automatically. Put **every variable used by the queryFn** in the key.\n- **queryFn** returns a promise. It receives `{ queryKey, signal }`; pass `signal` to axios/fetch so cancelled queries abort the request.\n- `isPending` = no data yet (first load). `isFetching` = any request in flight, including background refetch.\n\nIn v5 there is only the **object syntax**, `cacheTime` was renamed **`gcTime`**, `isLoading` became **`isPending`** (isLoading now means isPending && isFetching), and `keepPreviousData` was replaced by `placeholderData: keepPreviousData`.',
      syntax:
        "// main.jsx\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\nimport { ReactQueryDevtools } from '@tanstack/react-query-devtools';\n\nconst queryClient = new QueryClient({\n  defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },\n});\n\ncreateRoot(document.getElementById('root')).render(\n  <QueryClientProvider client={queryClient}>\n    <App />\n    <ReactQueryDevtools initialIsOpen={false} />\n  </QueryClientProvider>\n);\n\n// features/products/useProducts.js\nexport function useProducts(filters) {\n  return useQuery({\n    queryKey: ['products', filters],\n    queryFn: ({ signal }) => api.get('/products', { params: filters, signal }).then(r => r.data),\n  });\n}",
    },
    {
      heading: 'staleTime, gcTime and refetch triggers',
      content:
        'Two timers control caching:\n- **staleTime** (default **0**): how long data is considered fresh. Fresh data is served from cache with **no request**. Stale data is still shown instantly, but a background refetch happens on triggers.\n- **gcTime** (default **5 minutes**): how long **unused** (no component observing) data stays in memory before garbage collection.\n\nRefetch triggers for stale queries: component mount, window refocus (`refetchOnWindowFocus`), network reconnect, and `refetchInterval` if set.\n\nThis is the **stale-while-revalidate** pattern: users see cached data immediately and fresh data a moment later. For a product catalogue, `staleTime: 5 * 60 * 1000` is reasonable; for stock prices, keep 0 and add `refetchInterval`.\n\nOther useful options: `enabled: !!userId` (dependent query), `select: data => data.items` (transform/subscribe to part), `retry`, `initialData`, `placeholderData`.',
      tip: 'Use a query key factory (`productKeys.all`, `productKeys.list(filters)`, `productKeys.detail(id)`) to avoid typos when invalidating.',
    },
    {
      heading: 'Mutations and cache invalidation',
      content:
        '`useMutation({ mutationFn, onMutate, onSuccess, onError, onSettled })` is for create/update/delete. It returns `{ mutate, mutateAsync, isPending, isError, error, data, reset }`.\n\nAfter a successful write, the cache is out of date. Two strategies:\n1. **Invalidate**: `queryClient.invalidateQueries({ queryKey: [\'products\'] })` marks all matching queries stale (prefix match) and refetches the active ones. Simple and always correct.\n2. **Update directly**: `queryClient.setQueryData([\'product\', id], updated)` when the server returns the new object. Saves a request.\n\nReturn the invalidate promise from `onSuccess`/`onSettled` if you want the mutation to stay pending until the refetch finishes.',
      syntax:
        "export function useCreateProduct() {\n  const queryClient = useQueryClient();\n  return useMutation({\n    mutationFn: (newProduct) => api.post('/products', newProduct).then(r => r.data),\n    onSuccess: (created) => {\n      queryClient.setQueryData(['product', created._id], created);\n      return queryClient.invalidateQueries({ queryKey: ['products'] });\n    },\n  });\n}\n\n// in a component\nconst createProduct = useCreateProduct();\ncreateProduct.mutate(form, { onSuccess: () => navigate('/products') });",
    },
    {
      heading: 'Pagination and infinite scroll',
      content:
        '**Page-number pagination**: put the page in the key: `[\'orders\', page]`. Add `placeholderData: keepPreviousData` so the old page stays visible while the next one loads (no flicker); `isPlaceholderData` tells you it is old data. Prefetch the next page with `queryClient.prefetchQuery`.\n\n**Infinite scroll / "Load more"**: `useInfiniteQuery` stores an array of pages. In v5 `initialPageParam` is **required**. `getNextPageParam(lastPage, allPages)` returns the next cursor or `undefined` when finished. Use `data.pages.flatMap(p => p.items)` to render, `fetchNextPage()` to load more, and `hasNextPage` / `isFetchingNextPage` for UI. Trigger `fetchNextPage` with an IntersectionObserver on a sentinel element at the bottom.\n\nOn the Express side, return `{ items, nextCursor }` or `{ items, page, totalPages }`. Cursor pagination (by `_id` or `createdAt`) is faster than skip/limit for big MongoDB collections.',
      syntax:
        "const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({\n  queryKey: ['feed'],\n  queryFn: ({ pageParam, signal }) => api.get('/posts', { params: { cursor: pageParam, limit: 10 }, signal }).then(r => r.data),\n  initialPageParam: null,\n  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,\n});\nconst posts = data?.pages.flatMap(p => p.items) ?? [];",
    },
    {
      heading: 'Optimistic updates with TanStack Query',
      content:
        'Two ways in v5:\n\n**A. Via the UI (simple)**: render `mutation.variables` as a pending item while `mutation.isPending`. No cache manipulation, automatic "rollback" because the variables disappear on error.\n\n**B. Via the cache (full control)**:\n1. `onMutate`: `await queryClient.cancelQueries({ queryKey })` (so an in-flight refetch does not overwrite you), snapshot `previous = getQueryData(key)`, then `setQueryData(key, optimisticValue)`; return `{ previous }` as context.\n2. `onError(err, vars, context)`: `setQueryData(key, context.previous)` to roll back.\n3. `onSettled`: `invalidateQueries({ queryKey })` to sync with the server.',
      syntax:
        "useMutation({\n  mutationFn: (todo) => api.patch('/todos/' + todo._id, { done: !todo.done }),\n  onMutate: async (todo) => {\n    await queryClient.cancelQueries({ queryKey: ['todos'] });\n    const previous = queryClient.getQueryData(['todos']);\n    queryClient.setQueryData(['todos'], old => old.map(t => t._id === todo._id ? { ...t, done: !t.done } : t));\n    return { previous };\n  },\n  onError: (err, todo, context) => queryClient.setQueryData(['todos'], context.previous),\n  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),\n});",
    },
    {
      heading: 'An axios instance with interceptors',
      content:
        'Never scatter `axios.get(\'http://localhost:5000/api/...\')` across components. Create **one configured instance**:\n- `baseURL` from an env variable (`import.meta.env.VITE_API_URL` in Vite).\n- `withCredentials: true` if the Express API uses httpOnly cookies (CORS must allow credentials).\n- A **request interceptor** to attach `Authorization: Bearer <token>` if you keep an access token in memory.\n- A **response interceptor** to normalise errors (turn `err.response.data.message` into `err.message`) and handle 401 (Day 8 adds automatic token refresh).\n\nTanStack Query does not care how you fetch, so axios, fetch or ky all work. The query just needs a function that returns a promise and **throws on error** (fetch does not throw on 404/500, so check `res.ok`).',
      syntax:
        "// src/lib/api.js\nimport axios from 'axios';\nimport { getAccessToken } from './authToken';\n\nexport const api = axios.create({\n  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',\n  withCredentials: true,\n  timeout: 10_000,\n});\n\napi.interceptors.request.use((config) => {\n  const token = getAccessToken();\n  if (token) config.headers.Authorization = `Bearer ${token}`;\n  return config;\n});\n\napi.interceptors.response.use(\n  (res) => res,\n  (error) => {\n    const message = error.response?.data?.message ?? error.message;\n    return Promise.reject(Object.assign(new Error(message), { status: error.response?.status }));\n  }\n);",
    },
  ],
  examples: [
    {
      title: 'Products list with filters and a query key factory',
      scenario: 'An e-commerce page lists products from GET /api/products?category=&page= and caches each filter combination separately.',
      steps: [
        'Create productKeys with all, lists, list(filters) and detail(id)',
        'Write useProducts(filters) with useQuery and pass signal to axios',
        'Render loading, error and data states; show a small spinner when isFetching',
        'Run the playground: it implements a tiny cache keyed by JSON(queryKey) to show the same behaviour',
      ],
      code: `export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), filters],
  detail: (id) => [...productKeys.all, 'detail', id],
};

export function useProducts(filters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ signal }) => api.get('/products', { params: filters, signal }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

function ProductsPage() {
  const [category, setCategory] = useState('all');
  const { data, isPending, isError, error, isFetching } = useProducts({ category });
  if (isPending) return <Spinner />;
  if (isError) return <p>Error: {error.message}</p>;
  return (<>{isFetching && <small>Refreshing...</small>}<ProductGrid products={data.items} /></>);
}`,
      playground: {
        jsx: `const { useState, useEffect, useReducer } = React;

// --- mini query cache (concept demo, NOT the real library) ---
const cache = new Map();
function useMiniQuery(queryKey, queryFn, staleTime = 10000) {
  const key = JSON.stringify(queryKey);
  const [, rerender] = useReducer(x => x + 1, 0);
  const entry = cache.get(key);
  useEffect(() => {
    const e = cache.get(key);
    if (e && Date.now() - e.updatedAt < staleTime) return;   // fresh: no request
    let cancelled = false;
    cache.set(key, { ...(e || {}), fetching: true }); rerender();
    queryFn().then(data => {
      cache.set(key, { data, updatedAt: Date.now(), fetching: false });
      if (!cancelled) rerender();
    });
    return () => { cancelled = true; };
  }, [key]);
  return { data: entry?.data, isPending: !entry?.data, isFetching: !!entry?.fetching };
}

let requests = 0;
const fakeApi = (category) => new Promise(r => setTimeout(() => {
  requests++;
  const all = [
    { id: 1, name: 'iPhone 16', cat: 'mobile' }, { id: 2, name: 'Pixel 9', cat: 'mobile' },
    { id: 3, name: 'MacBook Air', cat: 'laptop' }, { id: 4, name: 'ThinkPad X1', cat: 'laptop' },
  ];
  r(all.filter(p => category === 'all' || p.cat === category));
}, 800));

function App() {
  const [category, setCategory] = useState('all');
  const { data, isPending, isFetching } = useMiniQuery(['products', { category }], () => fakeApi(category));
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      {['all', 'mobile', 'laptop'].map(c => (
        <button key={c} onClick={() => setCategory(c)} style={{ fontWeight: c === category ? 'bold' : 'normal', marginRight: 6 }}>{c}</button>
      ))}
      <p>Network requests made: {requests} {isFetching && '(fetching...)'}</p>
      {isPending ? <p>Loading...</p> : <ul>{data.map(p => <li key={p.id}>{p.name}</li>)}</ul>}
      <small>Switch back to a category you already opened: it appears instantly from cache (staleTime 10s).</small>
    </div>
  );
}`,
      },
      result: 'The first visit to each category shows Loading and increases the request count. Going back within 10 seconds shows data instantly without a new request.',
      explanation:
        'Each queryKey is a separate cache entry. Fresh entries are returned without fetching; this is exactly what staleTime controls in TanStack Query. The real library adds deduplication, background refetch, retries, garbage collection and devtools.',
    },
    {
      title: 'Create mutation with invalidation and toast',
      scenario: 'Admin adds a product; the list must refresh and the form must show server validation errors.',
      steps: [
        'Write useCreateProduct with useMutation',
        'Invalidate ["products"] in onSuccess (prefix match refreshes every list)',
        'Show mutation.isPending on the button and mutation.error.message under the form',
      ],
      code: `export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/products', body).then(r => r.data),
    onSuccess: (created) => {
      toast.success(created.name + ' added');
      return queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

function AddProductForm() {
  const createProduct = useCreateProduct();
  function handleSubmit(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    createProduct.mutate({ ...body, price: Number(body.price) }, {
      onSuccess: () => e.target.reset(),
    });
  }
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" /> <input name="price" type="number" />
      <button disabled={createProduct.isPending}>{createProduct.isPending ? 'Saving...' : 'Add'}</button>
      {createProduct.isError && <p className="error">{createProduct.error.message}</p>}
    </form>
  );
}`,
      result: 'After adding, all product lists refetch in the background and the new product appears.',
      explanation:
        'Callbacks on useMutation (hook level) always run, even if the component unmounts; callbacks passed to mutate() run only if the component is still mounted, so they are perfect for UI-only actions like resetting a form or navigating.',
    },
    {
      title: 'Paginated orders table with keepPreviousData and prefetch',
      scenario: 'Orders page with Prev/Next buttons that never flashes an empty table.',
      steps: [
        'Put page in the query key',
        'Use placeholderData: keepPreviousData',
        'Disable Next when isPlaceholderData or there are no more pages',
        'Prefetch page + 1 in an effect',
        'Run the playground to see the same UX with plain React',
      ],
      code: `import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';

function Orders() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const fetchOrders = (p) => api.get('/orders', { params: { page: p, limit: 10 } }).then(r => r.data);
  const { data, isPending, isPlaceholderData, isFetching } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => fetchOrders(page),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (data && page < data.totalPages) {
      queryClient.prefetchQuery({ queryKey: ['orders', page + 1], queryFn: () => fetchOrders(page + 1) });
    }
  }, [data, page, queryClient]);

  if (isPending) return <p>Loading...</p>;
  return (
    <>
      <table style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>...</table>
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</button>
      <span>Page {page} of {data.totalPages}</span>
      <button onClick={() => setPage(p => p + 1)} disabled={isPlaceholderData || page === data.totalPages}>Next</button>
    </>
  );
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;
const fetchOrders = (page) => new Promise(r => setTimeout(() => r({
  totalPages: 5,
  items: Array.from({ length: 5 }, (_, i) => ({ id: (page - 1) * 5 + i + 1, amount: ((page * 37 + i * 91) % 900) + 100 })),
}), 700));

function App() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);       // last successful data (kept while loading = keepPreviousData)
  const [loadingPage, setLoadingPage] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoadingPage(page);
    fetchOrders(page).then(d => { if (!ignore) { setData({ ...d, page }); setLoadingPage(null); } });
    return () => { ignore = true; };
  }, [page]);

  if (!data) return <p style={{ padding: 16 }}>Loading...</p>;
  const isPlaceholder = data.page !== page;
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <table border="1" cellPadding="6" style={{ opacity: isPlaceholder ? 0.4 : 1, transition: 'opacity .2s' }}>
        <thead><tr><th>Order #</th><th>Amount (Rs)</th></tr></thead>
        <tbody>{data.items.map(o => <tr key={o.id}><td>{o.id}</td><td>{o.amount}</td></tr>)}</tbody>
      </table>
      <p>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</button>{' '}
        Page {page} of {data.totalPages} {loadingPage && '(loading...)'}{' '}
        <button onClick={() => setPage(p => p + 1)} disabled={isPlaceholder || page === data.totalPages}>Next</button>
      </p>
    </div>
  );
}`,
      },
      result: 'Clicking Next fades the old table instead of showing a blank Loading screen; the new rows replace it when ready.',
      explanation:
        'keepPreviousData returns the last successful data as placeholder while the new key loads. isPlaceholderData lets you dim the table and prevent double clicks. Prefetching makes the next click instant.',
    },
    {
      title: 'Infinite scroll feed with useInfiniteQuery and IntersectionObserver',
      scenario: 'A social feed that loads 10 more posts when the user reaches the bottom.',
      steps: [
        'Express returns { items, nextCursor }',
        'useInfiniteQuery with initialPageParam and getNextPageParam',
        'Place a sentinel <div ref> after the list and observe it',
        'Call fetchNextPage when visible and hasNextPage && !isFetchingNextPage',
        'Run the playground (plain React version) and scroll the box',
      ],
      code: `function Feed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam, signal }) =>
      api.get('/posts', { params: { cursor: pageParam, limit: 10 }, signal }).then(r => r.data),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
  const sentinel = useRef(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') return <p>Loading...</p>;
  return (
    <>
      {data.pages.flatMap(p => p.items).map(post => <PostCard key={post._id} post={post} />)}
      <div ref={sentinel} />
      {isFetchingNextPage ? <p>Loading more...</p> : !hasNextPage && <p>You are all caught up</p>}
    </>
  );
}`,
      playground: {
        jsx: `const { useState, useEffect, useRef, useCallback } = React;
const TOTAL = 45;
const fetchPosts = (cursor) => new Promise(r => setTimeout(() => {
  const start = cursor ?? 0;
  const items = Array.from({ length: Math.min(10, TOTAL - start) }, (_, i) => ({ id: start + i + 1, text: 'Post #' + (start + i + 1) }));
  r({ items, nextCursor: start + 10 < TOTAL ? start + 10 : null });
}, 600));

function App() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);
  const sentinel = useRef(null);
  const nextCursor = pages.length ? pages[pages.length - 1].nextCursor : 0;
  const hasNextPage = pages.length === 0 || nextCursor !== null;

  const fetchNextPage = useCallback(() => {
    setLoading(true);
    fetchPosts(nextCursor).then(p => { setPages(prev => [...prev, p]); setLoading(false); });
  }, [nextCursor]);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !loading) fetchNextPage();
    }, { root: rootRef.current, rootMargin: '50px' });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [hasNextPage, loading, fetchNextPage]);

  const posts = pages.flatMap(p => p.items);
  return (
    <div ref={rootRef} style={{ height: 260, overflow: 'auto', border: '1px solid #ccc', fontFamily: 'sans-serif' }}>
      {posts.map(p => <div key={p.id} style={{ padding: 16, borderBottom: '1px solid #eee' }}>{p.text}</div>)}
      <div ref={sentinel} style={{ height: 1 }} />
      <p style={{ textAlign: 'center' }}>{loading ? 'Loading more...' : !hasNextPage ? 'You are all caught up' : ''}</p>
    </div>
  );
}`,
      },
      result: 'Scrolling to the bottom loads 10 more posts until 45 are shown, then "You are all caught up".',
      explanation:
        'The sentinel becomes visible near the bottom, the observer calls fetchNextPage, and the new page is appended to pages. useInfiniteQuery manages pages, cursors and loading flags for you and caches the whole feed.',
    },
    {
      title: 'Optimistic toggle with rollback via the cache',
      scenario: 'Mark a todo complete instantly; restore it if PATCH /api/todos/:id fails.',
      steps: [
        'cancelQueries, snapshot previous data and setQueryData in onMutate',
        'Return { previous } as context',
        'Restore it in onError and invalidate in onSettled',
      ],
      code: `export function useToggleTodo() {
  const queryClient = useQueryClient();
  const key = ['todos'];
  return useMutation({
    mutationFn: (todo) => api.patch('/todos/' + todo._id, { done: !todo.done }).then(r => r.data),
    onMutate: async (todo) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old = []) => old.map(t => t._id === todo._id ? { ...t, done: !t.done } : t));
      return { previous };
    },
    onError: (err, todo, context) => {
      queryClient.setQueryData(key, context.previous);
      toast.error('Could not update: ' + err.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}`,
      result: 'The checkbox flips instantly. If the server returns 500, it flips back and an error toast appears.',
      explanation:
        'cancelQueries prevents an older in-flight refetch from overwriting the optimistic value. The snapshot returned from onMutate is passed to onError as context so you can roll back exactly. onSettled re-syncs with the server either way.',
    },
  ],
  interview: [
    { q: 'What is the difference between server state and client state?', a: 'Client state is owned by the UI (modal open, theme, form inputs) and is always up to date. Server state lives in a remote database, is shared, can become stale, and needs caching, refetching and synchronisation. Different tools fit each: TanStack Query/RTK Query for server state, useState/Zustand/Redux for client state.', level: 'Easy' },
    { q: 'Explain staleTime vs gcTime.', a: 'staleTime (default 0) is how long data is fresh; fresh data is returned from cache without refetching. gcTime (default 5 min, formerly cacheTime) is how long inactive data (no observers) is kept in memory before being garbage collected.', level: 'Medium' },
    { q: 'Why should every variable used in queryFn be in the queryKey?', a: 'The key is the cache identity. If page or filter is missing from the key, different requests share one cache entry and the query will not refetch when the variable changes, causing wrong or stale data. The ESLint plugin @tanstack/eslint-plugin-query enforces this.', level: 'Medium' },
    { q: 'What is the difference between isPending, isLoading and isFetching in v5?', a: 'isPending: no cached data yet (status pending). isFetching: a request is in flight (including background refetch). isLoading: isPending && isFetching, i.e. the first load is happening. Use isPending for skeletons and isFetching for small refresh indicators.', level: 'Medium' },
    { q: 'invalidateQueries vs setQueryData: when to use which?', a: 'invalidateQueries marks queries stale and refetches active ones; simplest and always consistent. setQueryData writes the cache directly, useful when the mutation response contains the updated entity or for optimistic updates. Many apps do both: setQueryData for the detail, invalidate the lists.', level: 'Medium' },
    { q: 'How do you implement optimistic updates in TanStack Query?', a: 'In onMutate: cancelQueries, snapshot previous data, setQueryData with the optimistic value and return the snapshot. In onError: restore the snapshot from context. In onSettled: invalidateQueries. Alternative simpler approach: render mutation.variables while isPending.', level: 'Hard' },
    { q: 'How does useInfiniteQuery work?', a: 'It caches data as { pages, pageParams }. queryFn receives pageParam; initialPageParam (required in v5) is the first one, getNextPageParam(lastPage) returns the next or undefined to stop. fetchNextPage loads the next page and hasNextPage / isFetchingNextPage drive the UI.', level: 'Medium' },
    { q: 'Why not just use useEffect + useState for fetching?', a: 'You have to handle loading/error, race conditions, cancellation, caching, deduplication, retries, background refresh, pagination and invalidation yourself, and StrictMode double-fetches. A data library solves all of these and reduces code and bugs.', level: 'Easy' },
    { q: 'What does an axios interceptor do? Give MERN use cases.', a: 'Interceptors run before every request or after every response. Uses: attach Authorization header, add a request id, normalise error messages, log out or refresh the token on 401, show a global error toast for 500, convert dates.', level: 'Easy' },
    { q: 'How do you make a dependent query (fetch orders only after the user is loaded)?', a: 'Use the enabled option: useQuery({ queryKey: ["orders", user?._id], queryFn: ..., enabled: !!user?._id }). The query stays pending (not fetching) until enabled becomes true.', level: 'Medium' },
    { q: 'How do you avoid UI flicker when changing pages?', a: 'Use placeholderData: keepPreviousData so the previous page remains visible while the next page loads, and check isPlaceholderData to dim the UI or disable Next. Optionally prefetchQuery the next page.', level: 'Medium' },
    { q: 'TanStack Query vs RTK Query?', a: 'Both handle server state caching. RTK Query is part of Redux Toolkit, defines endpoints in a central API slice with tag-based invalidation, and fits apps already on Redux. TanStack Query is store-agnostic, has a hook-first API and very rich features (infinite queries, fine control). Choose based on whether Redux is already in the stack.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create src/lib/api.js: an axios instance with VITE_API_URL base URL, withCredentials, a request interceptor that adds a Bearer token from localStorage key "token" (for practice), and a response interceptor that converts errors to Error(message) with a status property.',
      hint: 'axios.create, interceptors.request.use, interceptors.response.use(res => res, err => ...).',
      solution: `import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    const err = new Error(message);
    err.status = error.response?.status;
    return Promise.reject(err);
  }
);`,
    },
    {
      task: 'Write useProduct(id) and useUpdateProduct() hooks. The update should write the returned product into ["products","detail",id] with setQueryData and invalidate product lists.',
      hint: 'Use the productKeys factory from the examples.',
      solution: `export function useProduct(id) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => api.get('/products/' + id, { signal }).then(r => r.data),
    enabled: Boolean(id),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...changes }) => api.put('/products/' + id, changes).then(r => r.data),
    onSuccess: (updated) => {
      queryClient.setQueryData(productKeys.detail(updated._id), updated);
      return queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}`,
    },
    {
      task: 'Build a "Load more" button version of infinite comments for a post: GET /api/posts/:id/comments?page=N returns { items, page, totalPages }.',
      hint: 'getNextPageParam: last => last.page < last.totalPages ? last.page + 1 : undefined.',
      solution: `function Comments({ postId }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, error } = useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) => api.get('/posts/' + postId + '/comments', { params: { page: pageParam } }).then(r => r.data),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
  if (isPending) return <p>Loading comments...</p>;
  if (isError) return <p>{error.message}</p>;
  return (
    <section>
      {data.pages.flatMap(p => p.items).map(c => <p key={c._id}><b>{c.author}</b>: {c.text}</p>)}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      )}
    </section>
  );
}`,
    },
    {
      task: 'Implement an optimistic "delete cart item" mutation that removes the item from ["cart"] immediately and restores it on error.',
      hint: 'Same onMutate/onError/onSettled pattern.',
      solution: `export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => api.delete('/cart/' + itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previous = queryClient.getQueryData(['cart']);
      queryClient.setQueryData(['cart'], (old) => ({ ...old, items: old.items.filter(i => i._id !== itemId) }));
      return { previous };
    },
    onError: (_err, _id, context) => queryClient.setQueryData(['cart'], context.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}`,
    },
  ],
  quiz: [
    { question: 'What is the default staleTime in TanStack Query?', options: ['5 minutes', '0', 'Infinity', '30 seconds'], answer: 1, explanation: 'Data is stale immediately by default, so it is refetched on mount/focus triggers.' },
    { question: 'Which option replaced keepPreviousData: true in v5?', options: ['placeholderData: keepPreviousData', 'initialData: previous', 'gcTime: Infinity', 'staleTime: keep'], answer: 0, explanation: 'Import keepPreviousData and pass it to placeholderData.' },
    { question: 'invalidateQueries({ queryKey: ["products"] }) affects:', options: ['Only the exact key ["products"]', 'Nothing until page reload', 'All mutations', 'Every query whose key starts with "products"'], answer: 3, explanation: 'Query keys are matched by prefix by default.' },
    { question: 'Which is REQUIRED for useInfiniteQuery in v5?', options: ['getPreviousPageParam', 'initialPageParam', 'select', 'refetchInterval'], answer: 1, explanation: 'v5 requires initialPageParam to be set explicitly.' },
    { question: 'In an optimistic update, why call cancelQueries in onMutate?', options: ['To stop the mutation', 'To clear the cache', 'So an in-flight refetch does not overwrite the optimistic data', 'To log the user out'], answer: 2, explanation: 'An outgoing refetch could resolve after your optimistic write and replace it with old data.' },
  ],
};
