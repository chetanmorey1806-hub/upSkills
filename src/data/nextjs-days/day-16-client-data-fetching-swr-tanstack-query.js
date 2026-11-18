export default {
  id: 'day-16-client-data-fetching-swr-tanstack-query',
  title: 'Client-side Data Fetching (SWR / TanStack Query) and State Management',
  module: 'Module 3: Full-stack Next.js',
  day: 16,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Server Components fetch most data, but some data must be fetched in the browser: live dashboards, infinite scroll, search-as-you-type, user-specific widgets. Learn when to fetch on the client, the stale-while-revalidate idea, SWR (useSWR, mutate), TanStack Query (useQuery, useMutation, invalidateQueries, prefetch + HydrationBoundary), and how to choose state tools (URL, useState, Context, Zustand) in an App Router app.',
  objectives: [
    'Decide between server fetching, client fetching and Server Actions for a feature',
    'Explain stale-while-revalidate caching, deduplication and revalidation on focus',
    'Use SWR with a fetcher, conditional keys, mutate and optimistic updates',
    'Set up TanStack Query in the App Router with QueryClientProvider, useQuery and useMutation',
    'Choose the right place for state: server cache, URL search params, local state, Context or Zustand',
  ],
  theory: [
    {
      heading: 'When to fetch on the client in a Next.js app',
      content:
        'Default rule in the App Router: **fetch on the server** (Server Components) - faster first paint, SEO, no loading spinners, secrets stay on the server.\n\nFetch on the **client** when data:\n- Changes **after** the page loads based on user interaction (search-as-you-type, filters without navigation, infinite scroll)\n- Must stay **live** (polling stock prices, notifications count, chat)\n- Is **user-specific and non-SEO** in an otherwise static/cached page (cart badge on a static product page)\n- Comes from browser-only APIs (geolocation-based results)\n\nRaw `useEffect` + `fetch` works but you must handle loading, errors, race conditions, caching, retries, refetch on focus and deduplication yourself. Libraries like **SWR** (by Vercel) and **TanStack Query** (formerly React Query) do all that.\n\nAnalogy: Server Components are the newspaper printed before delivery. Client fetching is the live ticker on TV that keeps updating while you watch.',
      points: [
        'Read on first load -> Server Component',
        'Write (mutations) -> Server Action (or useMutation calling an API)',
        'Live / interactive reads after load -> SWR or TanStack Query',
      ],
    },
    {
      heading: 'Stale-while-revalidate: the core idea',
      content:
        '**SWR = stale-while-revalidate** (an HTTP caching strategy): return the cached (possibly stale) data **immediately**, then fetch fresh data in the background and update the UI when it arrives.\n\nBenefits:\n1. **Instant UI** when you return to a page - cached data shows at once.\n2. **Deduplication** - 5 components asking for `/api/user` at the same time cause only 1 request (the cache key is shared).\n3. **Revalidation triggers** - on mount, on window focus, on network reconnect, on interval.\n4. **Shared cache** - update the data in one place and every component using that key re-renders.\n\nThe **key** (a URL string or array) identifies the data. Same key = same cache entry.',
    },
    {
      heading: 'SWR in practice',
      content:
        '`npm install swr`. SWR hooks run only in **Client Components** ("use client").\n\n`const { data, error, isLoading, isValidating, mutate } = useSWR(key, fetcher, options)`\n- `fetcher` is any async function: `(url) => fetch(url).then(r => r.json())`. Throw on non-OK responses so `error` is set.\n- **Conditional fetching**: pass `null` as key to skip: `useSWR(userId ? \'/api/users/\' + userId : null, fetcher)`.\n- Options: `refreshInterval: 5000` (polling), `revalidateOnFocus`, `dedupingInterval`, `fallbackData` (initial data from the server - avoids a loading state).\n- **mutate**: `mutate()` re-fetches; `mutate(newData, { revalidate: false })` updates the cache locally. Global `mutate(key)` from `useSWRConfig()` updates any key.\n- `SWRConfig` sets defaults (like the fetcher) for the whole app; `useSWRInfinite` handles pagination; `useSWRMutation` for remote mutations.\n\nCombining with Server Components: fetch on the server, pass as `fallbackData`, and let SWR keep it fresh on the client.',
      syntax:
        "'use client';\nimport useSWR from 'swr';\n\nconst fetcher = async (url) => {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error('Request failed: ' + res.status);\n  return res.json();\n};\n\nexport default function Notifications({ initial }) {\n  const { data, error, isLoading } = useSWR('/api/notifications', fetcher, {\n    refreshInterval: 10000,      // poll every 10 s\n    fallbackData: initial,       // from the Server Component\n  });\n  if (error) return <p>Could not load notifications</p>;\n  if (isLoading) return <p>Loading...</p>;\n  return <span className=\"badge\">{data.unread}</span>;\n}",
    },
    {
      heading: 'TanStack Query in the App Router',
      content:
        '`npm install @tanstack/react-query` (+ `@tanstack/react-query-devtools`). More features than SWR: mutations with lifecycle callbacks, query invalidation, retries with backoff, pagination helpers, devtools.\n\nSetup: create a `QueryClient` **once per browser session** (inside `useState` in a Client Component provider, so it is not shared between users on the server) and wrap the app in `<QueryClientProvider>`.\n\n- `useQuery({ queryKey: [\'todos\', filter], queryFn })` - the **queryKey array** is the cache key; include every variable the query depends on.\n- `staleTime` - how long data counts as fresh (default 0 = refetch on mount/focus). Set e.g. `60 * 1000` with SSR to avoid an immediate refetch.\n- `useMutation({ mutationFn, onSuccess })` + `queryClient.invalidateQueries({ queryKey: [\'todos\'] })` to refetch after a write.\n- `isPending`, `isError`, `isFetching`, `data`, `error`, `refetch`.\n\n**Server prefetching**: in a Server Component, `await queryClient.prefetchQuery(...)`, then wrap the client part in `<HydrationBoundary state={dehydrate(queryClient)}>` - the client starts with data already in the cache.',
      syntax:
        "// app/providers.js\n'use client';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\nimport { useState } from 'react';\n\nexport default function Providers({ children }) {\n  const [queryClient] = useState(() => new QueryClient({\n    defaultOptions: { queries: { staleTime: 60 * 1000 } },\n  }));\n  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;\n}\n\n// app/layout.js -> <body><Providers>{children}</Providers></body>",
      tip: 'Common mistake: creating new QueryClient() at module level in a file used on the server. On the server that single instance would be shared between all users\' requests. Create it inside useState (client) or per request (server prefetch).',
    },
    {
      heading: 'State management in the App Router: what goes where?',
      content:
        'Think of state in **four types**:\n1. **Server state** (data from DB/API): owned by Server Components + Server Actions, or SWR/TanStack Query on the client. Do not copy it into Redux/Context.\n2. **URL state** (filters, search, page, selected tab): store it in **search params** with `useSearchParams` + `router.replace` or `<Link>`. Shareable, bookmarkable, survives refresh, and Server Components can read it.\n3. **Local UI state** (modal open, input text): `useState` / `useReducer` in the component.\n4. **Global client state** (theme, cart drawer, multi-step wizard data): **Context** for rarely changing values; **Zustand** (tiny, no provider needed) or Redux Toolkit for frequently changing shared state.\n\nApp Router caveats: Context and Zustand only work in Client Components; a provider component must be "use client" but can wrap Server Component children. Do not create a global store at module level that holds per-user data on the server - it would be shared across requests.',
      syntax:
        "// store/cart.js - Zustand\n'use client';\nimport { create } from 'zustand';\n\nexport const useCart = create((set) => ({\n  items: [],\n  add: (product) => set((s) => ({ items: [...s.items, product] })),\n  clear: () => set({ items: [] }),\n}));\n\n// any client component\nconst count = useCart((s) => s.items.length);   // re-renders only when length changes",
      tip: 'Coming next (Day 17): performance optimization, bundle analysis and the four caching layers of Next.js.',
    },
  ],
  examples: [
    {
      title: 'A mini SWR hook: stale-while-revalidate, deduplication and focus revalidation',
      scenario: 'Understand what SWR does under the hood by building a tiny version and using it in two components that share the same key.',
      steps: [
        'In real Next.js: npm install swr and create a "use client" component using useSWR(key, fetcher)',
        'In the playground SIMULATION, a 40-line useMiniSWR keeps a cache Map, an in-flight Map and subscribers',
        'Render two components with the same key and see that only one request is made',
        'Click Remount: cached (stale) data shows instantly while a background revalidation runs',
        'Switch to another tab and back: the window focus triggers a revalidation',
      ],
      code:
        "// app/dashboard/UserCard.js\n'use client';\nimport useSWR from 'swr';\n\nconst fetcher = (url) => fetch(url).then((r) => {\n  if (!r.ok) throw new Error('Failed');\n  return r.json();\n});\n\nexport function UserName() {\n  const { data, isLoading } = useSWR('/api/me', fetcher);\n  return <span>{isLoading ? '...' : data.name}</span>;\n}\n\nexport function UserEmail() {\n  const { data, isValidating } = useSWR('/api/me', fetcher); // same key -> deduplicated, shared cache\n  return <span>{data?.email} {isValidating && '(refreshing)'}</span>;\n}",
      playground: {
        jsx: "// SIMULATION: a tiny useSWR-like hook in plain React (real apps use the 'swr' package).\nconst cache = new Map();        // key -> data\nconst inflight = new Map();     // key -> promise (deduplication)\nconst listeners = new Map();    // key -> Set of setState fns\nlet requestCount = 0;\n\nfunction revalidate(key, fetcher) {\n  if (!inflight.has(key)) {\n    requestCount++;\n    const p = fetcher(key).then((data) => {\n      cache.set(key, data);\n      inflight.delete(key);\n      (listeners.get(key) || []).forEach((fn) => fn({ data, validating: false }));\n    });\n    inflight.set(key, p);\n  }\n  (listeners.get(key) || []).forEach((fn) => fn((s) => ({ ...s, validating: true })));\n}\n\nfunction useMiniSWR(key, fetcher) {\n  const [state, setState] = React.useState({ data: cache.get(key), validating: true }); // stale first\n  React.useEffect(() => {\n    if (!listeners.has(key)) listeners.set(key, new Set());\n    listeners.get(key).add(setState);\n    revalidate(key, fetcher);\n    const onFocus = () => revalidate(key, fetcher);\n    window.addEventListener('focus', onFocus);\n    return () => { listeners.get(key).delete(setState); window.removeEventListener('focus', onFocus); };\n  }, [key]);\n  return { data: state.data, isLoading: !state.data, isValidating: state.validating };\n}\n\nconst fetcher = (url) => fetch(url).then((r) => r.json());\nconst KEY = 'https://jsonplaceholder.typicode.com/users/1';\n\nfunction UserName() { const { data, isLoading } = useMiniSWR(KEY, fetcher); return <p>Name: {isLoading ? 'loading...' : data.name}</p>; }\nfunction UserEmail() { const { data, isValidating } = useMiniSWR(KEY, fetcher); return <p>Email: {data ? data.email : '...'} {isValidating ? '(revalidating)' : ''}</p>; }\n\nfunction App() {\n  const [show, setShow] = React.useState(true);\n  const [, force] = React.useState(0);\n  React.useEffect(() => { const t = setInterval(() => force((n) => n + 1), 300); return () => clearInterval(t); }, []);\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <button onClick={() => setShow((s) => !s)}>{show ? 'Unmount' : 'Remount'}</button>\n      {show && <><UserName /><UserEmail /></>}\n      <p style={{ fontSize: 13 }}>Network requests made: <b>{requestCount}</b> (two components, one key)</p>\n    </div>\n  );\n}",
      },
      result: 'On first load "loading..." then "Leanne Graham" and "Sincere@april.biz" appear, with Network requests made: 1. Unmount + Remount shows the name instantly (stale cache) with "(revalidating)" briefly, and the count increases by 1, not 2.',
      explanation:
        'Both components use the same key, so the in-flight promise is shared (deduplication) and both subscribe to the same cache entry. Cached data is returned first (stale) and replaced when the background request finishes (revalidate). The real SWR adds focus throttling, error retry, intervals and more.',
    },
    {
      title: 'Search-as-you-type with SWR, conditional keys and debouncing',
      scenario: 'A product search box calls /api/search?q=... while the user types, but only after 300 ms of no typing and only when 2+ characters are entered.',
      steps: [
        'Create a Route Handler app/api/search/route.js that filters products by q',
        'In a Client Component keep the input text in state and a debounced copy with useDebounce',
        'Call useSWR(q.length >= 2 ? "/api/search?q=" + q : null, fetcher, { keepPreviousData: true })',
        'Show "Searching..." with isLoading and keep previous results visible while typing',
        'Try the SIMULATION (it searches jsonplaceholder posts)',
      ],
      code:
        "// app/search/SearchBox.js\n'use client';\nimport { useEffect, useState } from 'react';\nimport useSWR from 'swr';\n\nfunction useDebounce(value, ms) {\n  const [v, setV] = useState(value);\n  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);\n  return v;\n}\n\nconst fetcher = (url) => fetch(url).then((r) => r.json());\n\nexport default function SearchBox() {\n  const [text, setText] = useState('');\n  const q = useDebounce(text.trim(), 300);\n  const { data, isLoading } = useSWR(\n    q.length >= 2 ? '/api/search?q=' + encodeURIComponent(q) : null,   // null = do not fetch\n    fetcher,\n    { keepPreviousData: true }\n  );\n  return (\n    <div>\n      <input value={text} onChange={(e) => setText(e.target.value)} placeholder=\"Search products\" />\n      {isLoading && <p>Searching...</p>}\n      <ul>{data?.results.map((p) => <li key={p.id}>{p.name}</li>)}</ul>\n    </div>\n  );\n}\n\n// app/api/search/route.js\nimport { prisma } from '@/lib/prisma';\nexport async function GET(request) {\n  const q = request.nextUrl.searchParams.get('q') ?? '';\n  const results = await prisma.product.findMany({ where: { name: { contains: q, mode: 'insensitive' } }, take: 10 });\n  return Response.json({ results });\n}",
      playground: {
        jsx: "// SIMULATION of debounce + conditional key + a per-key cache (what useSWR gives you).\nconst cache = {};\nlet calls = 0;\nfunction useDebounce(value, ms) {\n  const [v, setV] = React.useState(value);\n  React.useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);\n  return v;\n}\nfunction useQueryKey(key) {\n  const [data, setData] = React.useState(null);\n  const [loading, setLoading] = React.useState(false);\n  React.useEffect(() => {\n    if (key === null) { setLoading(false); return; }   // conditional fetching\n    if (cache[key]) { setData(cache[key]); setLoading(false); return; } // cached key -> instant\n    let cancelled = false;\n    setLoading(true);\n    calls++;\n    fetch('https://jsonplaceholder.typicode.com/posts').then((r) => r.json()).then((posts) => {\n      const q = key.split('q=')[1];\n      const results = posts.filter((p) => p.title.includes(decodeURIComponent(q))).slice(0, 6);\n      cache[key] = results;\n      if (!cancelled) { setData(results); setLoading(false); }  // ignore stale responses\n    });\n    return () => { cancelled = true; };\n  }, [key]);\n  return { data, isLoading: loading };   // previous data is kept while loading (keepPreviousData)\n}\n\nfunction App() {\n  const [text, setText] = React.useState('');\n  const q = useDebounce(text.trim(), 300);\n  const { data, isLoading } = useQueryKey(q.length >= 2 ? '/api/search?q=' + encodeURIComponent(q) : null);\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <input value={text} onChange={(e) => setText(e.target.value)} placeholder=\"Try: qui, dolor, est\" />\n      <span style={{ marginLeft: 8, fontSize: 12 }}>requests: {calls}</span>\n      {isLoading && <p>Searching...</p>}\n      <ul>{(data || []).map((p) => <li key={p.id}>{p.title}</li>)}</ul>\n    </div>\n  );\n}",
      },
      result: 'Typing "dolor" quickly makes only 1 request (after the pause), showing up to 6 matching titles. Deleting to "do" and retyping "dolor" shows cached results instantly without a new request.',
      explanation:
        'Debouncing reduces requests; a null key disables fetching for short input; the cache keyed by URL makes repeated searches instant; the cancelled flag prevents an older slow response from overwriting a newer one (race condition). SWR handles caching and races for you.',
    },
    {
      title: 'TanStack Query: useQuery + useMutation + invalidateQueries',
      scenario: 'A todo widget loads todos with useQuery and adds new ones with useMutation; after a successful add, the list query is invalidated and refetched.',
      steps: [
        'npm install @tanstack/react-query and add the Providers component to app/layout.js',
        'Write fetchTodos and addTodo functions that call /api/todos',
        'useQuery({ queryKey: ["todos"], queryFn: fetchTodos })',
        'useMutation({ mutationFn: addTodo, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }) })',
        'Show isPending on the button and error messages',
        'In the SIMULATION, a tiny queryClient implements the same invalidate-then-refetch flow',
      ],
      code:
        "// app/todos/TodoWidget.js\n'use client';\nimport { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\n\nconst fetchTodos = async () => {\n  const res = await fetch('/api/todos');\n  if (!res.ok) throw new Error('Failed to load');\n  return res.json();\n};\nconst addTodo = async (title) => {\n  const res = await fetch('/api/todos', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ title }),\n  });\n  if (!res.ok) throw new Error('Failed to save');\n  return res.json();\n};\n\nexport default function TodoWidget() {\n  const queryClient = useQueryClient();\n  const { data: todos, isPending, isError, isFetching } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos });\n  const mutation = useMutation({\n    mutationFn: addTodo,\n    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),\n  });\n\n  if (isPending) return <p>Loading...</p>;\n  if (isError) return <p>Error loading todos</p>;\n  return (\n    <div>\n      <form onSubmit={(e) => {\n        e.preventDefault();\n        const input = e.currentTarget.elements.title;\n        mutation.mutate(input.value, { onSuccess: () => { input.value = ''; } });\n      }}>\n        <input name=\"title\" required />\n        <button disabled={mutation.isPending}>{mutation.isPending ? 'Adding...' : 'Add'}</button>\n      </form>\n      {mutation.isError && <p>{mutation.error.message}</p>}\n      {isFetching && <small>Refreshing...</small>}\n      <ul>{todos.map((t) => <li key={t.id}>{t.title}</li>)}</ul>\n    </div>\n  );\n}",
      playground: {
        jsx: "// SIMULATION of TanStack Query's core flow with a tiny hand-written queryClient.\nconst server = { todos: [{ id: 1, title: 'Learn useQuery' }], nextId: 2 };\nconst delay = (ms) => new Promise((r) => setTimeout(r, ms));\nconst api = {\n  async fetchTodos() { await delay(500); return server.todos.map((t) => ({ ...t })); },\n  async addTodo(title) { await delay(500); if (title.toLowerCase() === 'fail') throw new Error('Failed to save'); const t = { id: server.nextId++, title }; server.todos.push(t); return t; },\n};\n\nconst queryClient = {\n  subscribers: new Set(),\n  invalidateQueries() { this.subscribers.forEach((refetch) => refetch()); },\n};\n\nfunction useQuerySim(queryFn) {\n  const [s, setS] = React.useState({ data: undefined, isPending: true, isFetching: true });\n  const refetch = React.useCallback(async () => {\n    setS((p) => ({ ...p, isFetching: true }));\n    const data = await queryFn();\n    setS({ data, isPending: false, isFetching: false });\n  }, []);\n  React.useEffect(() => { refetch(); queryClient.subscribers.add(refetch); return () => queryClient.subscribers.delete(refetch); }, [refetch]);\n  return s;\n}\n\nfunction useMutationSim({ mutationFn, onSuccess }) {\n  const [s, setS] = React.useState({ isPending: false, error: null });\n  async function mutate(vars) {\n    setS({ isPending: true, error: null });\n    try { await mutationFn(vars); setS({ isPending: false, error: null }); onSuccess && onSuccess(); }\n    catch (e) { setS({ isPending: false, error: e }); }\n  }\n  return { ...s, mutate };\n}\n\nfunction App() {\n  const { data: todos, isPending, isFetching } = useQuerySim(api.fetchTodos);\n  const mutation = useMutationSim({ mutationFn: api.addTodo, onSuccess: () => queryClient.invalidateQueries() });\n  if (isPending) return <p style={{ fontFamily: 'sans-serif' }}>Loading...</p>;\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <form onSubmit={(e) => { e.preventDefault(); const i = e.currentTarget.elements.title; mutation.mutate(i.value); i.value = ''; }}>\n        <input name=\"title\" required placeholder=\"Type 'fail' to see an error\" />\n        <button disabled={mutation.isPending}>{mutation.isPending ? 'Adding...' : 'Add'}</button>\n      </form>\n      {mutation.error && <p style={{ color: 'crimson' }}>{mutation.error.message}</p>}\n      {isFetching && <small>Refreshing (invalidated)...</small>}\n      <ul>{todos.map((t) => <li key={t.id}>{t.title}</li>)}</ul>\n    </div>\n  );\n}",
      },
      result: 'Adding "Write tests" shows "Adding..." then "Refreshing (invalidated)..." and the new item appears. Typing "fail" shows "Failed to save" and the list is not refetched.',
      explanation:
        'useMutation runs the write and, on success, invalidateQueries marks ["todos"] stale and refetches it in every component that uses that key. The server stays the single source of truth, and the client cache is synchronized after each change.',
    },
    {
      title: 'URL as state: filters with useSearchParams',
      scenario: 'A product list filter (category + sort) must survive refresh and be shareable, so it lives in the URL instead of useState.',
      steps: [
        'Make a "use client" Filters component using useSearchParams, usePathname and useRouter',
        'On change, build new URLSearchParams and call router.replace(pathname + "?" + params)',
        'The Server Component page reads searchParams and queries the database',
        'Wrap Filters in <Suspense> because useSearchParams opts the component into client rendering',
        'In the SIMULATION the "URL" box updates as you change filters',
      ],
      code:
        "// app/products/Filters.js\n'use client';\nimport { useSearchParams, usePathname, useRouter } from 'next/navigation';\n\nexport default function Filters() {\n  const searchParams = useSearchParams();\n  const pathname = usePathname();\n  const router = useRouter();\n\n  function update(name, value) {\n    const params = new URLSearchParams(searchParams.toString());\n    value ? params.set(name, value) : params.delete(name);\n    router.replace(pathname + '?' + params.toString(), { scroll: false });\n  }\n\n  return (\n    <div>\n      <select value={searchParams.get('category') ?? ''} onChange={(e) => update('category', e.target.value)}>\n        <option value=\"\">All</option><option value=\"shoes\">Shoes</option><option value=\"bags\">Bags</option>\n      </select>\n      <select value={searchParams.get('sort') ?? 'new'} onChange={(e) => update('sort', e.target.value)}>\n        <option value=\"new\">Newest</option><option value=\"price\">Price</option>\n      </select>\n    </div>\n  );\n}\n\n// app/products/page.js (Server Component)\nimport { Suspense } from 'react';\nimport Filters from './Filters';\nimport { getProducts } from '@/lib/data/products';\n\nexport default async function Products({ searchParams }) {\n  const { category, sort = 'new' } = await searchParams;\n  const products = await getProducts({ category, sort });\n  return (\n    <>\n      <Suspense><Filters /></Suspense>\n      <ul>{products.map((p) => <li key={p.id}>{p.name} - Rs {p.price}</li>)}</ul>\n    </>\n  );\n}",
      playground: {
        jsx: "// SIMULATION: the URL query string is the single source of truth for filters.\nconst products = [\n  { id: 1, name: 'Runner', category: 'shoes', price: 2499, added: 3 },\n  { id: 2, name: 'Backpack', category: 'bags', price: 1499, added: 5 },\n  { id: 3, name: 'Loafer', category: 'shoes', price: 1999, added: 1 },\n  { id: 4, name: 'Tote', category: 'bags', price: 999, added: 4 },\n];\n\nfunction App() {\n  const [search, setSearch] = React.useState('?sort=new');      // stands in for the address bar\n  const params = new URLSearchParams(search);\n  function update(name, value) {\n    const p = new URLSearchParams(search);\n    value ? p.set(name, value) : p.delete(name);\n    setSearch('?' + p.toString());                                 // router.replace(...)\n  }\n  const category = params.get('category');\n  const sort = params.get('sort') || 'new';\n  const list = products\n    .filter((p) => !category || p.category === category)\n    .sort((a, b) => (sort === 'price' ? a.price - b.price : b.added - a.added));\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <p>URL: <code>/products{search}</code></p>\n      <select value={category || ''} onChange={(e) => update('category', e.target.value)}>\n        <option value=\"\">All</option><option value=\"shoes\">Shoes</option><option value=\"bags\">Bags</option>\n      </select>{' '}\n      <select value={sort} onChange={(e) => update('sort', e.target.value)}>\n        <option value=\"new\">Newest</option><option value=\"price\">Price</option>\n      </select>\n      <ul>{list.map((p) => <li key={p.id}>{p.name} - Rs {p.price}</li>)}</ul>\n    </div>\n  );\n}",
      },
      result: 'Choosing Bags + Price shows URL "/products?sort=price&category=bags" and lists Tote (999) then Backpack (1499).',
      explanation:
        'Because the filters are in the URL, refreshing or sharing the link restores the same view, the back button works, and the Server Component can query the database with the same values. No global store is needed.',
    },
  ],
  interview: [
    { q: 'When should you fetch data on the client in a Next.js App Router app?', a: 'When data changes after load due to interaction (search-as-you-type, infinite scroll), must be live (polling, real-time), is user-specific inside a cached/static page, or depends on browser-only APIs. Initial page data should normally be fetched in Server Components.', level: 'Medium' },
    { q: 'What does stale-while-revalidate mean?', a: 'Serve cached (possibly stale) data immediately, then revalidate by fetching fresh data in the background and update the UI when it arrives. It gives instant UI and eventually fresh data.', level: 'Easy' },
    { q: 'How does SWR deduplicate requests?', a: 'Requests are keyed. If several components call useSWR with the same key within the dedupingInterval (2s default), only one request is sent and all components share the cached result.', level: 'Medium' },
    { q: 'How do you conditionally fetch with SWR?', a: 'Pass null (or a function that returns null/throws) as the key: useSWR(user ? "/api/orders?user=" + user.id : null, fetcher). SWR skips fetching until the key becomes a string.', level: 'Medium' },
    { q: 'SWR vs TanStack Query - how do you choose?', a: 'SWR is smaller with a simple API, great for read-heavy UIs and made by Vercel. TanStack Query offers richer features: mutations with lifecycle callbacks, query invalidation, devtools, pagination/infinite helpers, retries and fine-grained cache control. Choose TanStack Query for complex client data needs.', level: 'Medium' },
    { q: 'What is the difference between staleTime and gcTime in TanStack Query?', a: 'staleTime is how long data is considered fresh (no automatic refetch). gcTime (formerly cacheTime) is how long unused/inactive data stays in memory before being garbage-collected (default 5 minutes).', level: 'Hard' },
    { q: 'Why create the QueryClient inside useState in Next.js?', a: 'So each browser session gets one stable client that survives re-renders. Creating it at module level in shared code could share one cache across users on the server; creating it in render without useState would recreate it every render and lose the cache.', level: 'Hard' },
    { q: 'What does invalidateQueries do?', a: 'Marks matching queries as stale and refetches the active ones. It is typically called in a mutation onSuccess so lists refresh after create/update/delete.', level: 'Easy' },
    { q: 'Where should filter/sort/pagination state live in a Next.js app?', a: 'In the URL search params. That makes views shareable, bookmarkable and refresh-safe, works with the back button, and lets Server Components read the same values to query data.', level: 'Medium' },
    { q: 'When would you use Zustand or Redux Toolkit in an App Router app?', a: 'For complex, frequently changing global client state shared across many Client Components (cart drawer, editor state, multi-step wizards). Not for server data (use Server Components / query libraries) and not for URL-able state.', level: 'Medium' },
    { q: 'How can you avoid a loading spinner when combining server data and SWR?', a: 'Fetch the data in a Server Component and pass it to the client component as fallbackData (SWR) or prefetch + HydrationBoundary (TanStack Query). The first render shows data; the library revalidates later.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a <LiveViewers productId> client component that polls /api/products/[id]/viewers every 5 seconds with SWR and shows "12 people are viewing".',
      hint: 'refreshInterval option; pause when the tab is hidden with refreshWhenHidden: false (default).',
      solution:
        "'use client';\nimport useSWR from 'swr';\nconst fetcher = (u) => fetch(u).then((r) => r.json());\n\nexport default function LiveViewers({ productId }) {\n  const { data, error } = useSWR('/api/products/' + productId + '/viewers', fetcher, { refreshInterval: 5000 });\n  if (error || !data) return null;\n  return <p>{data.count} people are viewing this</p>;\n}",
    },
    {
      task: 'Implement optimistic "toggle favorite" with SWR mutate: flip immediately, call the API, and roll back on error.',
      hint: 'mutate(updateFn, { optimisticData, rollbackOnError: true }).',
      solution:
        "'use client';\nimport useSWR from 'swr';\nconst fetcher = (u) => fetch(u).then((r) => r.json());\n\nexport default function FavoriteButton({ id }) {\n  const key = '/api/favorites/' + id;\n  const { data, mutate } = useSWR(key, fetcher);\n  const fav = data?.favorite ?? false;\n\n  async function toggle() {\n    await mutate(\n      async () => {\n        const res = await fetch(key, { method: 'PUT', body: JSON.stringify({ favorite: !fav }) });\n        if (!res.ok) throw new Error('Failed');\n        return res.json();\n      },\n      { optimisticData: { favorite: !fav }, rollbackOnError: true, revalidate: false }\n    );\n  }\n  return <button onClick={toggle}>{fav ? 'Unfavorite' : 'Favorite'}</button>;\n}",
    },
    {
      task: 'Prefetch a product list on the server with TanStack Query and hydrate it on the client so there is no loading state.',
      hint: 'new QueryClient() per request in the Server Component, prefetchQuery, HydrationBoundary + dehydrate.',
      solution:
        "// app/products/page.js (Server Component)\nimport { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';\nimport ProductList from './ProductList';\nimport { getProducts } from '@/lib/data/products';\n\nexport default async function Page() {\n  const queryClient = new QueryClient();\n  await queryClient.prefetchQuery({ queryKey: ['products'], queryFn: getProducts });\n  return (\n    <HydrationBoundary state={dehydrate(queryClient)}>\n      <ProductList />\n    </HydrationBoundary>\n  );\n}\n\n// app/products/ProductList.js\n'use client';\nimport { useQuery } from '@tanstack/react-query';\nexport default function ProductList() {\n  const { data } = useQuery({ queryKey: ['products'], queryFn: () => fetch('/api/products').then((r) => r.json()) });\n  return <ul>{data.map((p) => <li key={p.id}>{p.name}</li>)}</ul>; // data is already in cache\n}",
    },
    {
      task: 'Build an infinite "Load more" list with useInfiniteQuery reading /api/posts?cursor=<id> that returns { items, nextCursor }.',
      hint: 'initialPageParam, getNextPageParam, fetchNextPage, hasNextPage.',
      solution:
        "'use client';\nimport { useInfiniteQuery } from '@tanstack/react-query';\n\nexport default function Feed() {\n  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({\n    queryKey: ['posts'],\n    queryFn: ({ pageParam }) => fetch('/api/posts?cursor=' + pageParam).then((r) => r.json()),\n    initialPageParam: 0,\n    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,\n  });\n  return (\n    <div>\n      {data?.pages.flatMap((p) => p.items).map((post) => <p key={post.id}>{post.title}</p>)}\n      {hasNextPage && (\n        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>\n          {isFetchingNextPage ? 'Loading...' : 'Load more'}\n        </button>\n      )}\n    </div>\n  );\n}",
    },
    {
      task: 'Create a Zustand cart store with add, remove and total, and a CartBadge component that shows the item count.',
      hint: 'create((set, get) => ...); selectors to avoid extra re-renders.',
      solution:
        "// store/cart.js\n'use client';\nimport { create } from 'zustand';\n\nexport const useCart = create((set, get) => ({\n  items: [],\n  add: (p) => set((s) => ({ items: [...s.items, p] })),\n  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),\n  total: () => get().items.reduce((sum, i) => sum + i.price, 0),\n}));\n\n// components/CartBadge.js\n'use client';\nimport { useCart } from '@/store/cart';\nexport default function CartBadge() {\n  const count = useCart((s) => s.items.length);\n  return <span aria-label=\"Cart items\">Cart ({count})</span>;\n}",
    },
  ],
  quiz: [
    { question: 'What does passing null as the SWR key do?', options: ['Fetches the root URL', 'Throws an error', 'Skips fetching (conditional fetching)', 'Clears the whole cache'], answer: 2, explanation: 'A null key means "do not fetch yet".' },
    { question: 'In TanStack Query, which function refetches a list after a successful mutation?', options: ['queryClient.invalidateQueries', 'useQuery.reload', 'router.refresh', 'mutate.reset'], answer: 0, explanation: 'invalidateQueries marks queries stale and refetches active ones.' },
    { question: 'Where is the best place to store "category=shoes&sort=price"?', options: ['localStorage', 'A Redux store', 'A cookie', 'URL search params'], answer: 3, explanation: 'URL state is shareable, refresh-safe and readable by Server Components.' },
    { question: 'SWR and TanStack Query hooks can be used in…', options: ['Server Components only', 'Client Components ("use client")', 'middleware.js', 'Route Handlers'], answer: 1, explanation: 'They use React state/effects, so they need Client Components.' },
    { question: 'What is the main benefit of request deduplication?', options: ['Smaller CSS', 'Many components using the same key cause only one network request', 'Better SEO', 'It encrypts responses'], answer: 1, explanation: 'Same key, one request, shared cache.' },
  ],
};
