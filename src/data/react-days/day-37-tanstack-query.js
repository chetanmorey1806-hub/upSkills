// Mini TanStack Query used by the playgrounds (plain React learning version; the real library cannot be imported in the playground)
const MINI_QUERY = `// ---------- mini TanStack Query (learning version, plain React) ----------
const queryClient = (() => {
  const cache = new Map();
  const entry = key => {
    const hash = JSON.stringify(key);
    if (!cache.has(hash)) cache.set(hash, { key, hash, data: undefined, error: null, status: 'pending', fetching: false, updatedAt: 0, promise: null, fn: null, listeners: new Set() });
    return cache.get(hash);
  };
  const notify = e => e.listeners.forEach(l => l());
  function fetchQuery(key, fn) {
    const e = entry(key);
    if (fn) e.fn = fn;
    if (e.promise) return e.promise;                       // de-duplicate: same key = one request
    e.fetching = true; notify(e);
    console.log('fetching ' + e.hash);
    e.promise = e.fn()
      .then(data => { e.data = data; e.error = null; e.status = 'success'; e.updatedAt = Date.now(); })
      .catch(err => { e.error = err; if (e.data === undefined) e.status = 'error'; })
      .finally(() => { e.promise = null; e.fetching = false; notify(e); });
    return e.promise;
  }
  function invalidateQueries({ queryKey }) {
    const prefix = JSON.stringify(queryKey).slice(0, -1);
    cache.forEach(e => {
      if (!e.hash.startsWith(prefix)) return;
      e.updatedAt = 0;                                      // mark stale
      if (e.listeners.size && e.fn) fetchQuery(e.key);      // refetch only active queries
    });
  }
  function getQueryData(key) { return entry(key).data; }
  function setQueryData(key, updater) {
    const e = entry(key);
    e.data = typeof updater === 'function' ? updater(e.data) : updater;
    e.status = 'success'; notify(e);
  }
  return { entry, fetchQuery, invalidateQueries, getQueryData, setQueryData };
})();

function useQuery({ queryKey, queryFn, staleTime = 0, enabled = true }) {
  const [, rerender] = React.useReducer(x => x + 1, 0);
  const e = queryClient.entry(queryKey);
  React.useEffect(() => {
    e.listeners.add(rerender);
    e.fn = queryFn;
    const isStale = Date.now() - e.updatedAt > staleTime;
    if (enabled && isStale) queryClient.fetchQuery(queryKey, queryFn);
    return () => e.listeners.delete(rerender);
  }, [e.hash, enabled]);
  return {
    data: e.data, error: e.error,
    isPending: e.status === 'pending', isError: e.status === 'error', isSuccess: e.status === 'success',
    isFetching: e.fetching,
    refetch: () => queryClient.fetchQuery(queryKey, queryFn),
  };
}

function useMutation({ mutationFn, onMutate, onSuccess, onError, onSettled }) {
  const [state, setState] = React.useState({ status: 'idle', error: null });
  const mutate = async variables => {
    setState({ status: 'pending', error: null });
    let context;
    try {
      context = onMutate ? await onMutate(variables) : undefined;
      const data = await mutationFn(variables);
      setState({ status: 'success', error: null });
      if (onSuccess) onSuccess(data, variables, context);
    } catch (err) {
      setState({ status: 'error', error: err });
      if (onError) onError(err, variables, context);
    } finally {
      if (onSettled) onSettled();
    }
  };
  return { mutate, isPending: state.status === 'pending', isError: state.status === 'error', error: state.error };
}
// ---------- end of mini TanStack Query ----------
`;

const FAKE_TODO_API = `
// ---------- fake server (in memory, so invalidation really shows new data) ----------
const db = { nextId: 4, todos: [
  { id: 1, title: 'Pay electricity bill (₹1,240)', done: false },
  { id: 2, title: 'Book Pune to Mumbai train', done: true },
  { id: 3, title: 'Review PR #42', done: false },
] };
const wait = ms => new Promise(r => setTimeout(r, ms));
const api = {
  getTodos: async () => { await wait(700); return db.todos.map(t => ({ ...t })); },
  addTodo: async title => {
    await wait(700);
    if (!title.trim()) throw new Error('Title is required');
    const todo = { id: db.nextId++, title: title.trim(), done: false };
    db.todos.push(todo);
    return { ...todo };
  },
  toggleTodo: async ({ id, shouldFail }) => {
    await wait(900);
    if (shouldFail) throw new Error('500: Server error, change rolled back');
    const t = db.todos.find(t => t.id === id);
    t.done = !t.done;
    return { ...t };
  },
};
`;

export default {
  id: 'day-37-tanstack-query',
  title: 'TanStack Query (React Query): useQuery, useMutation, Caching, staleTime, Invalidation, Optimistic Updates and Devtools',
  module: 'Module 8: Working with APIs like a Pro',
  day: 37,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'TanStack Query v5 is the industry-standard library for server state in React. Instead of writing useEffect + useState + loading + error for every API call, you describe the data with a query key and a fetch function, and the library gives you caching, de-duplication, background refetching, retries, mutations, cache invalidation and optimistic updates.',
  objectives: [
    'Explain the difference between server state and client state, and why useEffect fetching does not scale',
    'Set up QueryClient and QueryClientProvider and fetch data with useQuery (queryKey, queryFn, isPending, isError, isFetching)',
    'Control caching with staleTime and gcTime and understand background refetching',
    'Change server data with useMutation and refresh lists with invalidateQueries',
    'Implement optimistic updates with rollback and inspect the cache with React Query Devtools',
  ],
  theory: [
    {
      heading: 'Server state vs client state: why TanStack Query exists',
      content:
        '**Client state** belongs to the browser: is the sidebar open, which tab is active, what the user typed. **Server state** lives on a server and you only hold a **copy** of it: products, orders, the logged-in user profile. Server state has special problems:\n\n- It can become **out of date** while the user is looking at it (someone else changed the price)\n- Many components need the **same** data (header cart count and cart page)\n- You need **loading, error, retry** and **caching** for every request\n\nOn Day 14 you fetched with `useEffect` + `useState`. That works for one screen, but in a real app you end up re-writing the same 30 lines in every component, fetching the same list five times, and showing stale data after an update.\n\nAnalogy: TanStack Query is like a **smart librarian**. You ask for a book by its catalogue number (the **query key**). If the book is on the desk (cache) you get it instantly; if it is old, the librarian quietly fetches a fresh copy in the background; if ten students ask for the same book at once, the librarian makes **one** trip to the shelf.\n\nInstall (v5, works with React 18 and 19):\n\n`npm i @tanstack/react-query @tanstack/react-query-devtools`',
      syntax: `// main.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: 1, refetchOnWindowFocus: true },
  },
});

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);`,
      tip: 'Do not put server data into Redux/Zustand/Context "just in case". Server state goes to TanStack Query; only UI/client state goes to your store. This one rule removes most global-state code in modern apps.',
    },
    {
      heading: 'useQuery: query keys, query functions and status flags',
      content:
        '`useQuery` takes ONE object (v5 removed the old positional signature):\n\n- **queryKey**: an array that uniquely names the data, e.g. `[\'products\']`, `[\'products\', { category: \'laptops\', page: 2 }]`, `[\'product\', id]`. When the key changes, TanStack Query fetches the new data automatically. Every variable used in the queryFn must be in the key.\n- **queryFn**: an async function that returns data or **throws** an error. With `fetch` you must throw yourself when `!res.ok`; Axios throws automatically.\n\nWhat you get back:\n\n- `data`, `error`\n- `isPending`: no data yet (first load). In v4 this was called `isLoading`.\n- `isError`, `isSuccess`\n- `isFetching`: a request is in flight, **including background refetches** while old data is still shown\n- `refetch()`\n\nUseful options: `enabled: !!id` (dependent queries, wait until you have an id), `select: data => data.products` (transform), `placeholderData: keepPreviousData` (keep the old page visible while the next page loads).',
      syntax: `import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';            // the Axios instance from Day 36

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get('/products/' + id).then(res => res.data),
    enabled: !!id,
  });
}

// in a component
const { data: product, isPending, isError, error, isFetching } = useProduct(id);
if (isPending) return <Skeleton />;
if (isError) return <ErrorState message={error.message} />;`,
      tip: 'Common mistake: using a variable inside queryFn but forgetting it in queryKey, e.g. key [\'products\'] but the function uses page. The cache then mixes pages. The ESLint plugin @tanstack/eslint-plugin-query catches this ("exhaustive-deps" for keys).',
    },
    {
      heading: 'Caching: staleTime, gcTime and background refetching',
      content:
        'Every query result is stored in the **QueryCache** under its key. Two timers control it:\n\n- **staleTime** (default `0`): how long the data is considered **fresh**. Fresh data is served from cache with **no** request. After staleTime the data is **stale**: it is still shown instantly, but a background refetch happens on the next trigger (component mount, window focus, network reconnect).\n- **gcTime** (default 5 minutes, called `cacheTime` in v4): how long **unused** data stays in memory after the last component using it unmounts. Then it is garbage-collected.\n\nThis gives the famous **stale-while-revalidate** behaviour: the user sees data instantly and it silently updates.\n\nOther defaults to know: failed queries are **retried 3 times** with exponential backoff; data refetches on **window focus** (`refetchOnWindowFocus`).\n\nHow companies choose staleTime:\n\n- Product categories, country list, settings: `staleTime: Infinity` or several minutes\n- Product list, profile: 30 seconds to 5 minutes\n- Stock prices, live order status: `0` plus `refetchInterval: 5000`',
      points: [
        '**fresh** = served from cache, no request',
        '**stale** = served from cache AND refetched in the background',
        '**inactive** = no component uses it; deleted after gcTime',
        '**isPending** shows a skeleton only on the very first load; later refetches only flip **isFetching**',
      ],
      tip: 'Interview favourite: "staleTime vs gcTime". staleTime decides WHEN to refetch; gcTime decides WHEN to delete unused data from memory.',
    },
    {
      heading: 'useMutation and cache invalidation',
      content:
        'Queries **read** data (GET). **Mutations** change data (POST, PUT, PATCH, DELETE). `useMutation` gives you `mutate(variables)`, `mutateAsync` (returns a promise), and `isPending`, `isError`, `error`, `isSuccess`.\n\nAfter a mutation, cached lists are now **wrong**. The standard fix is **invalidation**: tell the client "everything starting with this key is stale", and active queries refetch immediately.\n\n`queryClient.invalidateQueries({ queryKey: [\'todos\'] })` invalidates `[\'todos\']`, `[\'todos\', { page: 2 }]`, `[\'todos\', 5]`… because keys match by **prefix**.\n\nAlternative: if the server returns the updated object, write it into the cache directly with `queryClient.setQueryData([\'todo\', id], updated)` and skip one request.',
      syntax: `import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAddTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: newTodo => api.post('/todos/add', newTodo).then(r => r.data),
    onSuccess: () => {
      toast.success('Todo added');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: err => toast.error(err.message),
  });
}

const addTodo = useAddTodo();
<button disabled={addTodo.isPending} onClick={() => addTodo.mutate({ todo: text, userId: 1 })}>
  {addTodo.isPending ? 'Saving…' : 'Add'}
</button>`,
    },
    {
      heading: 'Optimistic updates with rollback',
      content:
        'An **optimistic update** changes the UI **before** the server answers, assuming success. Instagram likes, WhatsApp ticks and Gmail "archive" all feel instant because of this. If the server fails you **roll back** and show an error.\n\nThe official recipe uses the mutation lifecycle:\n\n1. **onMutate**: `cancelQueries` (so an old refetch does not overwrite you), take a **snapshot** with `getQueryData`, write the optimistic value with `setQueryData`, and return `{ previous }` as **context**\n2. **onError**: restore the snapshot from context\n3. **onSettled**: `invalidateQueries` to sync with the real server state either way\n\nv5 also has a simpler UI-only approach: render `mutation.variables` as a pending item while `mutation.isPending`, without touching the cache.',
      syntax: `useMutation({
  mutationFn: todo => api.put('/todos/' + todo.id, { completed: !todo.completed }),
  onMutate: async todo => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    const previous = queryClient.getQueryData(['todos']);
    queryClient.setQueryData(['todos'], old =>
      old.map(t => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
    );
    return { previous };
  },
  onError: (err, todo, context) => {
    queryClient.setQueryData(['todos'], context.previous);   // rollback
    toast.error('Could not update');
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
});`,
      tip: 'Use optimistic updates only for actions that almost always succeed and are cheap to undo (like, toggle, reorder). For payments or order placement, wait for the server.',
    },
    {
      heading: 'Devtools and how companies organise queries',
      content:
        '**React Query Devtools** (`<ReactQueryDevtools />`) adds a floating panel in development that lists every query key, its status (fresh, fetching, stale, inactive), its data, and buttons to refetch, invalidate or reset. It is removed from production builds automatically.\n\nIndustry folder structure (feature based, Day 31):\n\n- `src/lib/queryClient.js`: the QueryClient with defaults\n- `src/features/products/api/productsApi.js`: plain functions that call Axios (`getProducts`, `getProduct`)\n- `src/features/products/api/queries.js`: custom hooks `useProducts`, `useProduct`, `useCreateProduct`\n- `src/features/products/api/keys.js`: a **query key factory** so keys are never typed by hand\n\nComponents never call Axios directly; they call the hooks. This makes them easy to test and easy to change.',
      syntax: `// keys.js: query key factory
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: filters => [...productKeys.lists(), filters],
  detail: id => [...productKeys.all, 'detail', id],
};
// invalidate every product list after a create:
queryClient.invalidateQueries({ queryKey: productKeys.lists() });`,
      tip: 'Coming next (Day 38): driving the query key from URL search params for search, filters, sorting and pagination.',
    },
  ],
  examples: [
    {
      title: 'useQuery: one request shared by two components',
      scenario: 'An e-commerce header shows the product count and the page shows the product list. Both need the same data. With useEffect you would fetch twice; with TanStack Query both components use the key [\'products\'] and only one request is made.',
      steps: [
        'npm i @tanstack/react-query and wrap App in QueryClientProvider (theory section 1)',
        'Create features/products/api/queries.js with a useProducts() hook',
        'Use useProducts() in Header and in ProductList',
        'Handle isPending and isError in the list',
        'Run the playground (it uses a small plain-React version of useQuery) and open the console: "fetching" is logged once',
      ],
      code: `// features/products/api/queries.js
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products', { params: { limit: 6, select: 'title,price' } }).then(r => r.data),
    staleTime: 60_000,
  });
}

// Header.jsx
export function Header() {
  const { data } = useProducts();
  return <header>ShopKart · {data ? data.total + ' products' : '…'}</header>;
}

// ProductList.jsx
export function ProductList() {
  const { data, isPending, isError, error, isFetching, refetch } = useProducts();
  if (isPending) return <p>Loading products…</p>;
  if (isError) return <p role="alert">Error: {error.message} <button onClick={() => refetch()}>Retry</button></p>;
  return (
    <>
      {isFetching && <small>Refreshing…</small>}
      <ul>{data.products.map(p => <li key={p.id}>{p.title}: \${p.price}</li>)}</ul>
    </>
  );
}`,
      playground: {
        jsx: MINI_QUERY + `
async function getProducts() {
  const res = await fetch('https://dummyjson.com/products?limit=6&select=title,price');
  if (!res.ok) throw new Error('HTTP ' + res.status);   // fetch does not throw on 4xx/5xx
  return res.json();
}
const useProducts = () => useQuery({ queryKey: ['products'], queryFn: getProducts, staleTime: 60000 });

function Header() {
  const { data, isFetching } = useProducts();
  return (
    <header className="bar">
      <b>ShopKart</b>
      <span>{data ? data.total + ' products' : '…'} {isFetching && '⟳'}</span>
    </header>
  );
}

function ProductList() {
  const { data, isPending, isError, error, refetch } = useProducts();
  if (isPending) return <p className="muted">Loading products…</p>;
  if (isError) return <p role="alert">Error: {error.message} <button onClick={refetch}>Retry</button></p>;
  return (
    <ul className="list">
      {data.products.map(p => <li key={p.id}><span>{p.title}</span><b>₹{Math.round(p.price * 85)}</b></li>)}
    </ul>
  );
}

function App() {
  return (
    <div>
      <Header />
      <ProductList />
      <button onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}>Invalidate (refetch in background)</button>
    </div>
  );
}`,
        css: `.bar{display:flex;justify-content:space-between;background:#0f766e;color:#fff;padding:10px 14px;border-radius:8px}
.list{list-style:none;padding:0}.list li{display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #e5e7eb}
.muted{color:#6b7280}button{padding:6px 12px;cursor:pointer}`,
      },
      result: 'The header and the list fill in together. The console shows "fetching [\"products\"]" only once. Clicking Invalidate shows ⟳ in the header while the old list stays visible, then logs one more fetch.',
      explanation:
        'Both components call useProducts with the same key, so they read the same cache entry. The mini client stores the in-flight promise per key and returns it to the second caller (de-duplication). Invalidate marks the entry stale and refetches it because components are using it; isPending stays false (data exists), only isFetching flips. Real TanStack Query does exactly this, plus retries, window-focus refetch and garbage collection. Prices are converted to ₹ for display only.',
    },
    {
      title: 'Query keys with parameters and staleTime caching',
      scenario: 'A category switcher for a shopping app. Switching to a category you already opened should be instant (no spinner, no request) while the data is fresh.',
      steps: [
        'Put the category in the query key: [\'products\', \'category\', slug]',
        'Set staleTime: 30_000 so data stays fresh for 30 seconds',
        'Use placeholderData: keepPreviousData in the real code so the old list stays while the new one loads',
        'Run the playground, click Smartphones → Laptops → Smartphones and watch the console',
      ],
      code: `import { useQuery, keepPreviousData } from '@tanstack/react-query';

export function useCategoryProducts(slug) {
  return useQuery({
    queryKey: ['products', 'category', slug],
    queryFn: ({ signal }) =>
      api.get('/products/category/' + slug, { params: { limit: 5, select: 'title,price' }, signal })
         .then(r => r.data.products),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}`,
      playground: {
        jsx: MINI_QUERY + `
const CATEGORIES = ['smartphones', 'laptops', 'groceries', 'fragrances'];

function useCategoryProducts(slug) {
  return useQuery({
    queryKey: ['products', 'category', slug],
    queryFn: () => fetch('https://dummyjson.com/products/category/' + slug + '?limit=5&select=title,price')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(d => d.products),
    staleTime: 30000,
  });
}

function App() {
  const [slug, setSlug] = React.useState('smartphones');
  const { data, isPending, isError, error, isFetching } = useCategoryProducts(slug);
  return (
    <div>
      <div className="tabs" role="tablist">
        {CATEGORIES.map(c => (
          <button key={c} role="tab" aria-selected={c === slug} className={c === slug ? 'on' : ''} onClick={() => setSlug(c)}>{c}</button>
        ))}
      </div>
      <p className="muted">key: {JSON.stringify(['products', 'category', slug])} {isFetching ? '· fetching…' : '· from cache'}</p>
      {isPending ? <p>Loading…</p> : isError ? <p role="alert">{error.message}</p> : (
        <ol>{data.map(p => <li key={p.id}>{p.title} · ₹{Math.round(p.price * 85)}</li>)}</ol>
      )}
    </div>
  );
}`,
        css: `.tabs{display:flex;gap:6px;flex-wrap:wrap}.tabs button{padding:6px 12px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;cursor:pointer}
.tabs .on{background:#1d4ed8;color:#fff;border-color:#1d4ed8}.muted{color:#64748b;font-size:13px}`,
      },
      result: 'The first visit to each category logs "fetching" and shows Loading…. Going back to a category within 30 seconds shows the list instantly with "from cache" and no new console log.',
      explanation:
        'Each slug creates a different cache entry because the key contains the slug. On mount, the hook compares Date.now() - updatedAt with staleTime; fresh data is not refetched. After 30 seconds the data is stale and would be shown immediately AND refreshed in the background. In the real library, keepPreviousData keeps the previous category visible while a new one loads instead of showing a spinner.',
    },
    {
      title: 'useMutation + invalidateQueries: add a todo',
      scenario: 'A task app: the list is a query, the "Add" form is a mutation. After saving, the list must refresh. The playground uses an in-memory fake server (dummyjson does not persist new items, so a refetch would not show them).',
      steps: [
        'Create useTodos() with key [\'todos\']',
        'Create useAddTodo() with useMutation and onSuccess → invalidateQueries({ queryKey: [\'todos\'] })',
        'Disable the button and show "Saving…" while isPending',
        'Show mutation errors under the form (try adding an empty title)',
        'Run the playground and add a task',
      ],
      code: `// features/todos/api/queries.js
export const useTodos = () =>
  useQuery({ queryKey: ['todos'], queryFn: () => api.get('/todos').then(r => r.data) });

export function useAddTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: title => api.post('/todos', { title }).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });
}

// AddTodoForm.jsx
function AddTodoForm() {
  const [title, setTitle] = useState('');
  const addTodo = useAddTodo();
  const submit = e => {
    e.preventDefault();
    addTodo.mutate(title, { onSuccess: () => setTitle('') });   // per-call callback
  };
  return (
    <form onSubmit={submit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <button disabled={addTodo.isPending}>{addTodo.isPending ? 'Saving…' : 'Add'}</button>
      {addTodo.isError && <p role="alert">{addTodo.error.message}</p>}
    </form>
  );
}`,
      playground: {
        jsx: MINI_QUERY + FAKE_TODO_API + `
const useTodos = () => useQuery({ queryKey: ['todos'], queryFn: api.getTodos });

function useAddTodo() {
  return useMutation({
    mutationFn: api.addTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });
}

function TodoList() {
  const { data, isPending, isFetching } = useTodos();
  if (isPending) return <p>Loading todos…</p>;
  return (
    <div>
      <small className="muted">{isFetching ? 'Refreshing list…' : 'Up to date'}</small>
      <ul>{data.map(t => <li key={t.id} className={t.done ? 'done' : ''}>{t.title}</li>)}</ul>
    </div>
  );
}

function AddTodoForm() {
  const [title, setTitle] = React.useState('');
  const addTodo = useAddTodo();
  const submit = e => {
    e.preventDefault();
    addTodo.mutate(title);
    setTitle('');
  };
  return (
    <form onSubmit={submit} className="row">
      <label htmlFor="t" className="sr">New task</label>
      <input id="t" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Call CA about GST" />
      <button disabled={addTodo.isPending}>{addTodo.isPending ? 'Saving…' : 'Add'}</button>
      {addTodo.isError && <p role="alert" className="err">{addTodo.error.message}</p>}
    </form>
  );
}

function App() {
  return <div><h3>My tasks</h3><AddTodoForm /><TodoList /></div>;
}`,
        css: `.row{display:flex;gap:8px;flex-wrap:wrap}.row input{flex:1;padding:8px}.row button{padding:8px 14px}
.done{text-decoration:line-through;color:#94a3b8}.muted{color:#64748b}.err{color:#b91c1c;width:100%}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`,
      },
      result: 'Type a task and click Add: the button shows "Saving…", then the list says "Refreshing list…" and the new task appears. Submitting an empty title shows "Title is required".',
      explanation:
        'mutate() calls the fake POST. On success, invalidateQueries([\'todos\']) marks the todos cache stale and, because TodoList is mounted, refetches it. The list already had data, so isPending stays false and only isFetching is true during the refresh: no flashing skeleton. Errors thrown by mutationFn end up in mutation.error.',
    },
    {
      title: 'Optimistic toggle with rollback',
      scenario: 'Ticking a task should feel instant like a WhatsApp tick. If the server fails, the tick must go back and the user sees an error.',
      steps: [
        'In onMutate: snapshot the current list with getQueryData and write the toggled list with setQueryData',
        'Return { previous } as the context',
        'In onError: restore context.previous',
        'In onSettled: invalidate [\'todos\'] to resync with the server',
        'Run the playground, tick "Simulate server failure" and toggle a task',
      ],
      code: `export function useToggleTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todo => api.patch('/todos/' + todo.id, { done: !todo.done }),
    onMutate: async todo => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], old =>
        old.map(t => (t.id === todo.id ? { ...t, done: !t.done } : t)));
      return { previous };
    },
    onError: (err, todo, context) => {
      queryClient.setQueryData(['todos'], context.previous);
      toast.error(err.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });
}`,
      playground: {
        jsx: MINI_QUERY + FAKE_TODO_API + `
function useToggleTodo() {
  const [error, setError] = React.useState('');
  const mutation = useMutation({
    mutationFn: api.toggleTodo,
    onMutate: async ({ id }) => {
      setError('');
      const previous = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], old => old.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
      console.log('optimistic update applied');
      return { previous };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(['todos'], context.previous);
      console.log('rolled back');
      setError(err.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });
  return { ...mutation, lastError: error };
}

function App() {
  const { data, isPending } = useQuery({ queryKey: ['todos'], queryFn: api.getTodos });
  const toggle = useToggleTodo();
  const [shouldFail, setShouldFail] = React.useState(false);
  if (isPending) return <p>Loading…</p>;
  return (
    <div>
      <label className="fail"><input type="checkbox" checked={shouldFail} onChange={e => setShouldFail(e.target.checked)} /> Simulate server failure</label>
      <ul className="todos">
        {data.map(t => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggle.mutate({ id: t.id, shouldFail })} />
              <span className={t.done ? 'done' : ''}>{t.title}</span>
            </label>
          </li>
        ))}
      </ul>
      {toggle.isPending && <small className="muted">Saving to server…</small>}
      {toggle.lastError && <p role="alert" className="err">{toggle.lastError}</p>}
    </div>
  );
}`,
        css: `.todos{list-style:none;padding:0}.todos li{padding:8px;border-bottom:1px solid #e5e7eb}
.done{text-decoration:line-through;color:#94a3b8}.fail{display:block;margin-bottom:8px;color:#b45309}
.muted{color:#64748b}.err{color:#b91c1c}`,
      },
      result: 'Ticking a task updates the checkbox immediately and "Saving to server…" appears. With "Simulate server failure" on, the tick appears, then after about a second it jumps back and a red error is shown.',
      explanation:
        'onMutate runs before the request, so the cache (and the UI) change instantly. The snapshot returned from onMutate is passed to onError as context, which restores it. onSettled always invalidates the list so the UI ends up matching the server. In the real library you also call cancelQueries first so a slow background refetch cannot overwrite your optimistic value.',
    },
  ],
  interview: [
    { q: 'What problem does TanStack Query solve?', a: 'It manages server state: fetching, caching, de-duplicating requests, background refetching, retries, pagination, mutations and cache invalidation. It replaces hand-written useEffect + useState fetching code and keeps server data out of global client stores.', level: 'Easy' },
    { q: 'What is the difference between server state and client state?', a: 'Client state is owned by the browser (modal open, selected tab, form input). Server state is owned by a remote server; the app only has a cached copy that can become outdated, is shared by many components and needs loading/error handling. TanStack Query is for server state; useState/Context/Zustand are for client state.', level: 'Easy' },
    { q: 'What is a query key and why must it contain all variables?', a: 'The query key is an array that uniquely identifies cached data, e.g. [\'products\', { page: 2 }]. It is hashed to find the cache entry. If the queryFn depends on a variable not included in the key, different requests share one cache entry and show wrong data, and changing the variable will not trigger a refetch.', level: 'Medium' },
    { q: 'Explain staleTime vs gcTime.', a: 'staleTime (default 0) is how long data counts as fresh; fresh data is served without a request. After that it is stale: shown from cache but refetched on triggers like mount or window focus. gcTime (default 5 minutes, cacheTime in v4) is how long inactive data (no observers) is kept in memory before being garbage-collected.', level: 'Medium' },
    { q: 'isPending vs isLoading vs isFetching in v5?', a: 'isPending: there is no data yet (status pending). isFetching: a request is in flight, including background refetches. isLoading in v5 = isPending && isFetching (first load currently in progress). Use isPending for skeletons and isFetching for small "refreshing" indicators.', level: 'Medium' },
    { q: 'How do you refresh a list after creating an item?', a: 'In the mutation\'s onSuccess (or onSettled) call queryClient.invalidateQueries({ queryKey: [\'items\'] }). It marks matching queries stale by prefix and refetches the active ones. Alternatively update the cache directly with setQueryData using the server response.', level: 'Easy' },
    { q: 'Walk through an optimistic update.', a: 'onMutate: cancelQueries for the key, snapshot previous data with getQueryData, apply the optimistic change with setQueryData, return { previous }. onError: setQueryData(key, context.previous) to roll back and show an error. onSettled: invalidateQueries to sync with the server.', level: 'Hard' },
    { q: 'Why call cancelQueries in onMutate?', a: 'If a background refetch started before the mutation finishes, its (older) response could overwrite the optimistic cache value. cancelQueries aborts or ignores outgoing fetches for that key so the optimistic value stays until onSettled refetches.', level: 'Hard' },
    { q: 'How do you write a dependent query?', a: 'Use the enabled option: useQuery({ queryKey: [\'orders\', userId], queryFn: ..., enabled: !!userId }). The query stays pending and idle until userId exists.', level: 'Medium' },
    { q: 'mutate vs mutateAsync?', a: 'mutate is fire-and-forget; errors are handled by onError and you never get an unhandled rejection. mutateAsync returns a promise you can await (e.g. to navigate after success) but you must try/catch it yourself.', level: 'Medium' },
    { q: 'How does TanStack Query compare with RTK Query or SWR?', a: 'All three are server-state caches. SWR is minimal (stale-while-revalidate, small API). RTK Query is built into Redux Toolkit and generates hooks from an API definition; good if you already use Redux. TanStack Query has the richest feature set (mutations lifecycle, infinite queries, devtools, framework-agnostic) and is the most widely used standalone choice.', level: 'Hard' },
    { q: 'What are the main breaking changes from v4 to v5?', a: 'Single object signature only (useQuery({ queryKey, queryFn })), cacheTime renamed to gcTime, isLoading renamed to isPending (new isLoading = isPending && isFetching), keepPreviousData option replaced by placeholderData: keepPreviousData, onSuccess/onError/onSettled callbacks removed from useQuery (still on useMutation), and React 18+ required.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a useProduct(id) hook for a product details page using dummyjson. It must not run when id is undefined and must keep data fresh for 5 minutes.',
      hint: 'Use enabled: !!id and staleTime: 5 * 60 * 1000. Include id in the key.',
      solution: `import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProduct(id) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: ({ signal }) => api.get('/products/' + id, { signal }).then(r => r.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ProductPage.jsx
export default function ProductPage() {
  const { id } = useParams();
  const { data: product, isPending, isError, error } = useProduct(id);
  if (isPending) return <p>Loading…</p>;
  if (isError) return <p role="alert">{error.message}</p>;
  return (
    <article>
      <h1>{product.title}</h1>
      <img src={product.thumbnail} alt={product.title} />
      <p>{product.description}</p>
    </article>
  );
}`,
    },
    {
      task: 'Create a query key factory for orders (all, lists, list(filters), detail(id)) and use it in useOrders(filters) and an invalidation after cancelling an order.',
      hint: 'Build each key from the previous one with spread so prefix invalidation works.',
      solution: `// features/orders/api/keys.js
export const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: filters => [...orderKeys.lists(), filters],
  detail: id => [...orderKeys.all, 'detail', id],
};

// features/orders/api/queries.js
export const useOrders = filters =>
  useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => api.get('/orders', { params: filters }).then(r => r.data),
  });

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: id => api.post('/orders/' + id + '/cancel'),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });   // every filtered list
      qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
    },
  });
}`,
    },
    {
      task: 'Build a "Delete product" button with useMutation that removes the product from the cached list optimistically and rolls back on error.',
      hint: 'Same recipe as the toggle: cancelQueries, getQueryData, setQueryData(filter), return context.',
      solution: `export function useDeleteProduct() {
  const qc = useQueryClient();
  const key = ['products'];
  return useMutation({
    mutationFn: id => api.delete('/products/' + id),
    onMutate: async id => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      qc.setQueryData(key, old => ({ ...old, products: old.products.filter(p => p.id !== id) }));
      return { previous };
    },
    onError: (err, id, ctx) => {
      qc.setQueryData(key, ctx.previous);
      toast.error('Delete failed: ' + err.message);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

function DeleteButton({ id }) {
  const del = useDeleteProduct();
  return (
    <button onClick={() => { if (confirm('Delete this product?')) del.mutate(id); }} disabled={del.isPending}>
      Delete
    </button>
  );
}`,
    },
    {
      task: 'Show a live "Order status" badge that refetches every 5 seconds only while the order is not delivered.',
      hint: 'refetchInterval can be a function that receives the query and returns a number or false.',
      solution: `export function useOrderStatus(orderId) {
  return useQuery({
    queryKey: ['orders', 'status', orderId],
    queryFn: () => api.get('/orders/' + orderId + '/status').then(r => r.data),
    refetchInterval: query => (query.state.data?.status === 'DELIVERED' ? false : 5000),
  });
}

function OrderStatusBadge({ orderId }) {
  const { data, isPending } = useOrderStatus(orderId);
  if (isPending) return <span className="badge">…</span>;
  return <span className={'badge badge-' + data.status.toLowerCase()}>{data.status}</span>;
}`,
    },
    {
      task: 'Refactor this useEffect fetching code into TanStack Query:\n\nconst [users, setUsers] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(null);\nuseEffect(() => { fetch("/api/users").then(r => r.json()).then(setUsers).catch(setError).finally(() => setLoading(false)); }, []);',
      hint: 'Remember fetch does not throw for HTTP errors. Map loading to isPending.',
      solution: `async function getUsers({ signal }) {
  const res = await fetch('/api/users', { signal });
  if (!res.ok) throw new Error('Failed to load users (' + res.status + ')');
  return res.json();
}

export function UsersPage() {
  const { data: users = [], isPending, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
  if (isPending) return <p>Loading…</p>;
  if (isError) return <p role="alert">{error.message}</p>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
// Bonus: caching, retries, de-duplication and abort on unmount for free.`,
    },
  ],
  quiz: [
    {
      question: 'Which option decides how long data is considered fresh (no refetch)?',
      options: ['gcTime', 'staleTime', 'retryDelay', 'refetchInterval'],
      answer: 1,
      explanation: 'staleTime controls freshness; gcTime controls how long unused data stays in memory.',
    },
    {
      question: 'After a successful POST that creates a todo, what is the usual way to update the todo list?',
      options: ['Reload the page', 'Call useQuery again inside onSuccess', 'queryClient.invalidateQueries({ queryKey: [\'todos\'] })', 'Set staleTime to 0'],
      answer: 2,
      explanation: 'Invalidation marks matching queries stale and refetches the active ones.',
    },
    {
      question: 'In TanStack Query v5, which flag is true during a background refetch when data is already shown?',
      options: ['isFetching', 'isPending', 'isError', 'isIdle'],
      answer: 0,
      explanation: 'isPending means there is no data yet; isFetching is true for every in-flight request.',
    },
    {
      question: 'In an optimistic update, where do you roll back the cache?',
      options: ['onMutate', 'onSuccess', 'queryFn', 'onError, using the context returned from onMutate'],
      answer: 3,
      explanation: 'onMutate returns the snapshot as context; onError restores it.',
    },
    {
      question: 'Two components call useQuery with the same key at the same time. How many requests are made?',
      options: ['Two', 'One, the request is de-duplicated', 'None until refetch() is called', 'It depends on gcTime'],
      answer: 1,
      explanation: 'Queries with the same key share one cache entry and one in-flight request.',
    },
  ],
};
