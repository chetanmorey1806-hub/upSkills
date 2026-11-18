export default {
  id: 'day-17-performance-bundle-analysis-caching',
  title: 'Performance Optimization, Bundle Analysis and Caching Layers',
  module: 'Module 3: Full-stack Next.js',
  day: 17,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Make a Next.js app fast and keep it fast. Measure with Lighthouse and Core Web Vitals (useReportWebVitals), shrink client JavaScript (Server Components, dynamic imports, analyzing bundles with @next/bundle-analyzer), optimize scripts with next/script, and master the four caching layers of the App Router: Request Memoization, Data Cache, Full Route Cache and Router Cache - including what changed in Next.js 15.',
  objectives: [
    'Measure performance with Lighthouse, build output and useReportWebVitals',
    'Reduce client bundle size with Server Components, next/dynamic and the bundle analyzer',
    'Load third-party scripts with next/script strategies and avoid render-blocking work',
    'Explain the four caching layers and how to opt in or out of each',
    'Use Next.js 15 caching defaults, unstable_cache / "use cache", revalidate and tags correctly',
  ],
  theory: [
    {
      heading: 'Measure first: Lighthouse, build output and Web Vitals',
      content:
        'Rule #1 of performance: **measure, do not guess**. Always test a **production build** (`next build && next start`) - dev mode is deliberately slow (no minification, extra checks).\n\nTools:\n- **next build output**: shows each route, whether it is Static (○), SSG (●) or Dynamic (ƒ), and its **First Load JS** size. Large First Load JS = slow hydration on phones.\n- **Lighthouse** (Chrome DevTools) / **PageSpeed Insights**: lab scores and real-user field data.\n- **useReportWebVitals** (`next/web-vitals`): sends LCP, CLS, INP, FCP, TTFB from real users to your analytics. Vercel Speed Insights does this automatically.\n- **React DevTools Profiler**: finds components that re-render too often.\n\nAnalogy: a doctor does tests before prescribing medicine. Optimizing without measuring is like taking random pills.',
      syntax:
        "// app/_components/WebVitals.js\n'use client';\nimport { useReportWebVitals } from 'next/web-vitals';\n\nexport function WebVitals() {\n  useReportWebVitals((metric) => {\n    // metric: { name: 'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB', value, rating, id }\n    navigator.sendBeacon('/api/vitals', JSON.stringify(metric));\n  });\n  return null;\n}\n// render <WebVitals /> once in app/layout.js",
    },
    {
      heading: 'Ship less JavaScript',
      content:
        'Every KB of client JS must be downloaded, parsed and executed - expensive on mid-range phones. Techniques:\n1. **Keep components on the server**. Only add "use client" to the small interactive leaves (a button, not the whole page). Server Components add **zero** JS to the bundle.\n2. **Pass Server Components as children** into Client Components instead of importing them inside client files (imports in a client file become client code).\n3. **Lazy load heavy client components** with `next/dynamic` (wraps React.lazy + Suspense): charts, rich text editors, maps, modals. `ssr: false` skips server rendering for browser-only libraries (allowed only inside Client Components).\n4. **Import only what you need**: `import debounce from \'lodash/debounce\'` not the whole lodash; prefer native APIs (`Intl.DateTimeFormat` instead of moment.js). Next.js `optimizePackageImports` helps with icon/utility libraries.\n5. **Analyze the bundle**: `@next/bundle-analyzer` produces a treemap showing which packages are biggest.\n6. **Move heavy work to the server**: markdown parsing, syntax highlighting, date formatting of large lists.',
      syntax:
        "// next.config.js\nconst withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });\n\nmodule.exports = withBundleAnalyzer({\n  experimental: { optimizePackageImports: ['lucide-react', 'date-fns'] },\n});\n\n// run: ANALYZE=true npm run build   -> opens client.html / nodejs.html / edge.html treemaps",
      tip: 'Common mistake: putting "use client" at the top of app/layout.js or a big page "just to use useState". That turns the whole subtree into client code. Extract a small client component instead.',
    },
    {
      heading: 'next/dynamic and next/script',
      content:
        '**next/dynamic** creates a lazily-loaded component: its code is split into a separate chunk downloaded only when the component renders, e.g. `const Chart = dynamic(() => import(\'./Chart\'), { loading: () => <p>Loading chart...</p> })`.\n\nUse it for components below the fold, behind a tab/modal, or for admin-only features.\n\n**next/script** loads third-party scripts (analytics, chat widgets, ads) without blocking rendering:\n- `strategy="beforeInteractive"` - critical scripts (rare; cookie consent, bot detection) - root layout only\n- `strategy="afterInteractive"` (default) - after hydration (analytics, tag managers)\n- `strategy="lazyOnload"` - when the browser is idle (chat widgets, social embeds)\n- `strategy="worker"` (experimental, Partytown) - run in a web worker\n\nAlso: `onLoad` / `onReady` callbacks; a script with the same `id` loads only once even across navigations. `@next/third-parties` provides optimized Google Analytics / Tag Manager / YouTube embed components.',
    },
    {
      heading: 'The four caching layers of the App Router',
      content:
        'Next.js caches at four levels (from inside a request to the browser):\n\n1. **Request Memoization** (server, one request): identical `fetch(url, options)` GET calls during a single render are executed once. Lets `generateMetadata`, layout and page each call `getUser()` freely. For non-fetch code (Prisma) use React `cache()`.\n2. **Data Cache** (server, persistent across requests and deployments): stores `fetch` results. Opt in with `fetch(url, { cache: \'force-cache\' })` or `{ next: { revalidate: 3600, tags: [\'products\'] } }`. Purge with `revalidateTag` / `revalidatePath`.\n3. **Full Route Cache** (server, build time/ISR): the rendered HTML + RSC payload of **static** routes. Dynamic APIs (`cookies()`, `headers()`, `searchParams`, uncached fetch) make a route dynamic and skip this cache. `export const revalidate = 60` makes it ISR.\n4. **Router Cache** (browser memory): RSC payloads of visited/prefetched routes for instant back/forward and Link navigation. `router.refresh()` or a Server Action with revalidatePath clears it.\n\n**Next.js 15 changed defaults to "uncached unless you opt in"**: `fetch` is **not** cached by default (`no-store`), GET Route Handlers are not cached by default, and the client Router Cache uses `staleTime: 0` for page segments (dynamic pages are refetched on navigation). Static pages are still prerendered at build time when they use no dynamic APIs.\n\nAnalogy: a library. Memoization = you remember the answer during one conversation; Data Cache = the reference shelf; Full Route Cache = photocopies of popular pages ready at the desk; Router Cache = the copies already in your bag.',
      points: [
        'cache: "force-cache" / next.revalidate -> Data Cache on',
        'export const dynamic = "force-static" | "force-dynamic" controls route rendering',
        'unstable_cache(fn, keys, { revalidate, tags }) caches non-fetch functions (e.g. DB queries)',
        'Next.js 15 canary / 16: "use cache" directive + cacheLife + cacheTag replace unstable_cache',
      ],
    },
    {
      heading: 'Other high-impact optimizations',
      content:
        '- **Streaming with Suspense** (Day 8): send the shell fast and stream slow parts, improving TTFB/LCP perception.\n- **Parallel data fetching**: `Promise.all([getUser(), getOrders()])` instead of sequential awaits (waterfalls).\n- **Images & fonts**: next/image with `priority` on the LCP image and `sizes`; next/font (Day 12).\n- **Prefetching**: `<Link>` prefetches routes in the viewport in production. Disable with `prefetch={false}` for huge lists of rarely clicked links.\n- **Memoization on the client**: `React.memo`, `useMemo`, `useCallback` only where the Profiler shows a problem; the **React Compiler** (opt-in in Next.js 15) can do this automatically.\n- **Virtualize long lists** (react-window/TanStack Virtual) - render only visible rows.\n- **Partial Prerendering (PPR)** (experimental): a static shell with dynamic holes streamed in the same request.\n- **Edge/CDN caching** for static assets with long `Cache-Control` (Next.js sets `immutable` for hashed `_next/static` files).',
      tip: 'Coming next (Day 18): testing Next.js apps with Jest, React Testing Library and Playwright.',
    },
  ],
  examples: [
    {
      title: 'Lazy loading a heavy chart with next/dynamic',
      scenario: 'A dashboard has a 200 KB charting component that is only visible after the user opens the "Analytics" tab. It should not be part of the initial bundle.',
      steps: [
        'Move the chart into components/SalesChart.js ("use client")',
        'In the client tabs component, import it with dynamic(() => import("./SalesChart"), { loading })',
        'Run ANALYZE=true npm run build and confirm the chart library is in a separate chunk',
        'Open the dashboard with DevTools > Network: the chunk downloads only when the tab is clicked',
        'In the SIMULATION, React.lazy + Suspense (what next/dynamic wraps) loads a fake chunk with a delay',
      ],
      code:
        "// app/dashboard/Tabs.js\n'use client';\nimport { useState } from 'react';\nimport dynamic from 'next/dynamic';\n\nconst SalesChart = dynamic(() => import('@/components/SalesChart'), {\n  loading: () => <p>Loading chart...</p>,\n  ssr: false,               // chart library uses window; skip server render\n});\n\nexport default function Tabs({ overview }) {\n  const [tab, setTab] = useState('overview');\n  return (\n    <div>\n      <button onClick={() => setTab('overview')}>Overview</button>\n      <button onClick={() => setTab('analytics')}>Analytics</button>\n      {tab === 'overview' ? overview : <SalesChart />}\n    </div>\n  );\n}\n\n// app/dashboard/page.js (Server Component)\nimport Tabs from './Tabs';\nimport Overview from './Overview'; // Server Component passed as a prop: stays server-only\n\nexport default function Dashboard() {\n  return <Tabs overview={<Overview />} />;\n}",
      playground: {
        jsx: "// SIMULATION: next/dynamic = React.lazy + Suspense. The 'chunk' arrives after a delay,\n// and is downloaded only the first time the Analytics tab is opened.\nlet chunkDownloads = 0;\nconst SalesChart = React.lazy(() => {\n  chunkDownloads++;\n  return new Promise((resolve) => setTimeout(() => resolve({\n    default: function SalesChart() {\n      const data = [12, 19, 7, 15, 22, 9];\n      return (\n        <svg width=\"240\" height=\"110\" role=\"img\" aria-label=\"Sales chart\">\n          {data.map((v, i) => <rect key={i} x={i * 40 + 5} y={105 - v * 4} width=\"30\" height={v * 4} fill=\"#2563eb\" />)}\n        </svg>\n      );\n    },\n  }), 1000));\n});\n\nfunction App() {\n  const [tab, setTab] = React.useState('overview');\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <button onClick={() => setTab('overview')}>Overview</button>{' '}\n      <button onClick={() => setTab('analytics')}>Analytics</button>\n      <div style={{ marginTop: 10, minHeight: 120 }}>\n        {tab === 'overview' ? <p>Revenue this month: Rs 4,20,000</p> : (\n          <React.Suspense fallback={<p>Loading chart...</p>}>\n            <SalesChart />\n          </React.Suspense>\n        )}\n      </div>\n      <small>Chart chunk downloads: {chunkDownloads}</small>\n    </div>\n  );\n}",
      },
      result: 'Initially "Chart chunk downloads: 0". Clicking Analytics shows "Loading chart..." for 1 second, then the bar chart; switching tabs again shows the chart instantly and the count stays 1.',
      explanation:
        'The dynamic import creates a separate JavaScript chunk; the browser requests it only when the component first renders. After that the module is cached. Passing <Overview /> as a prop keeps it a Server Component even though Tabs is a Client Component.',
    },
    {
      title: 'Request memoization and React cache() - no duplicate queries',
      scenario: 'The layout, generateMetadata and page of /profile all need the current user. Without memoization the database would be queried three times per request.',
      steps: [
        'Write getUser wrapped in cache() from react in lib/data/user.js',
        'Call getUser() in layout.js, generateMetadata and page.js',
        'Enable Prisma query logging and load /profile: only one SELECT appears',
        'Note: fetch() GET requests with identical URL/options are memoized automatically',
        'In the SIMULATION compare a plain function vs a memoized one for one "request"',
      ],
      code:
        "// lib/data/user.js\nimport 'server-only';\nimport { cache } from 'react';\nimport { auth } from '@/auth';\nimport { prisma } from '@/lib/prisma';\n\nexport const getUser = cache(async () => {\n  const session = await auth();\n  if (!session?.user?.email) return null;\n  return prisma.user.findUnique({ where: { email: session.user.email } }); // runs once per request\n});\n\n// app/profile/layout.js\nexport default async function Layout({ children }) {\n  const user = await getUser();\n  return <><header>Hi {user?.name}</header>{children}</>;\n}\n\n// app/profile/page.js\nexport async function generateMetadata() {\n  const user = await getUser();          // memoized - no new query\n  return { title: user ? user.name + ' - Profile' : 'Profile' };\n}\nexport default async function Profile() {\n  const user = await getUser();          // memoized - no new query\n  return <p>Email: {user?.email}</p>;\n}",
      playground: {
        jsx: "// SIMULATION of React cache(): memoize an async function for the duration of ONE request.\nfunction createRequestScope() {\n  const store = new Map();\n  return function cache(fn) {\n    return (...args) => {\n      const key = fn.name + JSON.stringify(args);\n      if (!store.has(key)) store.set(key, fn(...args));\n      return store.get(key);\n    };\n  };\n}\n\nfunction App() {\n  const [log, setLog] = React.useState([]);\n  async function handleRequest(useCache) {\n    let queries = 0;\n    async function getUser() { queries++; await new Promise((r) => setTimeout(r, 100)); return { name: 'Asha' }; }\n    const cache = createRequestScope();             // new scope per request\n    const fetchUser = useCache ? cache(getUser) : getUser;\n    // layout, generateMetadata and page all ask for the user (in parallel, like Next.js)\n    await Promise.all([fetchUser(), fetchUser(), fetchUser()]);\n    setLog((l) => [...l, (useCache ? 'with cache(): ' : 'without cache: ') + queries + ' DB queries for 1 request']);\n  }\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <button onClick={() => handleRequest(false)}>Request without cache()</button>{' '}\n      <button onClick={() => handleRequest(true)}>Request with cache()</button>\n      <ul>{log.map((l, i) => <li key={i}>{l}</li>)}</ul>\n    </div>\n  );\n}",
      },
      result: 'Without cache: "3 DB queries for 1 request". With cache(): "1 DB queries for 1 request". Each new click is a new request scope, so it queries again (memoization does not persist between requests).',
      explanation:
        'React cache() stores the promise per argument for the lifetime of one server request, so concurrent callers share it. It is NOT a persistent cache - use the Data Cache (fetch revalidate), unstable_cache or "use cache" for cross-request caching.',
    },
    {
      title: 'Data Cache with revalidate and tags (Next.js 15 opt-in caching)',
      scenario: 'The product catalogue comes from a slow external API. Cache it for one hour, but refresh immediately when an admin updates a product.',
      steps: [
        'Fetch with { next: { revalidate: 3600, tags: ["products"] } } - in Next.js 15 caching is opt-in',
        'For a Prisma query, wrap it with unstable_cache(fn, ["products"], { revalidate: 3600, tags: ["products"] })',
        'In the admin Server Action call revalidateTag("products") after saving',
        'Run next build && next start; reload the page: the API is not called again until the hour passes or the tag is revalidated',
        'Use the SIMULATION to see HIT / MISS / STALE behaviour with a fast clock',
      ],
      code:
        "// lib/data/products.js\nimport { unstable_cache } from 'next/cache';\nimport { prisma } from '@/lib/prisma';\n\n// external API via fetch -> Data Cache\nexport async function getRates() {\n  const res = await fetch('https://api.example.com/rates', {\n    next: { revalidate: 3600, tags: ['rates'] },   // opt in (Next.js 15 default is no-store)\n  });\n  return res.json();\n}\n\n// database query -> unstable_cache\nexport const getProducts = unstable_cache(\n  async () => prisma.product.findMany({ orderBy: { name: 'asc' } }),\n  ['products-list'],\n  { revalidate: 3600, tags: ['products'] }\n);\n\n// app/admin/products/actions.js\n'use server';\nimport { revalidateTag } from 'next/cache';\n\nexport async function updatePrice(id, formData) {\n  await prisma.product.update({ where: { id }, data: { price: Number(formData.get('price')) } });\n  revalidateTag('products');   // every cached entry tagged 'products' is purged\n}",
      playground: {
        jsx: "// SIMULATION of the Data Cache: time-based revalidation (stale-while-revalidate) + tag purge.\n// 1 'second' here = 1 'minute' in the scenario; revalidate = 10.\nconst REVALIDATE = 10;\nconst dataCache = new Map();           // key -> { value, storedAt, tags }\nlet originCalls = 0;\nlet price = 2499;\n\nfunction cachedFetch(key, tags, now) {\n  const entry = dataCache.get(key);\n  if (!entry) {\n    originCalls++;\n    dataCache.set(key, { value: price, storedAt: now, tags });\n    return { value: price, status: 'MISS (fetched from origin)' };\n  }\n  if (now - entry.storedAt > REVALIDATE) {\n    originCalls++;                            // background revalidation\n    dataCache.set(key, { value: price, storedAt: now, tags });\n    return { value: entry.value, status: 'STALE (served old value, refreshed in background)' };\n  }\n  return { value: entry.value, status: 'HIT' };\n}\nfunction revalidateTag(tag) {\n  for (const [k, e] of dataCache) if (e.tags.includes(tag)) dataCache.delete(k);\n}\n\nfunction App() {\n  const [now, setNow] = React.useState(0);\n  const [last, setLast] = React.useState(null);\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <p>Clock: {now} min | origin API calls: {originCalls} | real price in DB: {price}</p>\n      <button onClick={() => setLast(cachedFetch('products', ['products'], now))}>Load page</button>{' '}\n      <button onClick={() => setNow((n) => n + 4)}>+4 minutes</button>{' '}\n      <button onClick={() => { price += 100; setLast(null); }}>Admin changes price</button>{' '}\n      <button onClick={() => { revalidateTag('products'); setLast({ value: '-', status: 'tag purged' }); }}>revalidateTag('products')</button>\n      {last && <p>Shown price: <b>{last.value}</b> - {last.status}</p>}\n    </div>\n  );\n}",
      },
      result: 'First "Load page" = MISS. Loading again = HIT. After changing the price the page still shows the old price (HIT) until either revalidateTag is clicked (next load is a MISS with the new price) or more than 10 minutes pass (STALE once, then the new value).',
      explanation:
        'Time-based revalidation serves stale data once and refreshes in the background (stale-while-revalidate), so users never wait. On-demand revalidation with tags purges the entry immediately after a mutation. In Next.js 15 you must opt in to caching explicitly.',
    },
    {
      title: 'Loading third-party scripts with next/script',
      scenario: 'Add Google Analytics after the page is interactive and a support chat widget only when the browser is idle, without hurting LCP or INP.',
      steps: [
        'Add <Script strategy="afterInteractive"> for analytics in app/layout.js (or use @next/third-parties/google)',
        'Add <Script strategy="lazyOnload"> for the chat widget',
        'Use onLoad to initialize the widget once the script is ready',
        'Compare Lighthouse "Reduce the impact of third-party code" before and after',
        'In the SIMULATION observe the loading order of the three strategies',
      ],
      code:
        "// app/layout.js\nimport Script from 'next/script';\nimport { GoogleAnalytics } from '@next/third-parties/google';\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=\"en\">\n      <body>\n        {children}\n        <GoogleAnalytics gaId=\"G-XXXXXXX\" />  {/* optimized afterInteractive loading */}\n        <Script\n          id=\"chat-widget\"\n          src=\"https://chat.example.com/widget.js\"\n          strategy=\"lazyOnload\"\n          onLoad={() => window.ChatWidget?.init({ color: '#2563eb' })}\n        />\n      </body>\n    </html>\n  );\n}\n// Note: onLoad requires a Client Component; move the <Script> into a small 'use client' file if needed.",
      playground: {
        jsx: "// SIMULATION of next/script strategies: when each script would start loading relative to the page lifecycle.\nfunction App() {\n  const [events, setEvents] = React.useState([]);\n  const add = (e) => setEvents((list) => [...list, (performance.now() / 1000).toFixed(2) + 's  ' + e]);\n  function simulatePageLoad() {\n    setEvents([]);\n    add('beforeInteractive: consent.js injected into initial HTML');\n    setTimeout(() => add('HTML + CSS parsed, first paint (LCP image shown)'), 300);\n    setTimeout(() => add('React hydrated -> page interactive'), 700);\n    setTimeout(() => add('afterInteractive: analytics.js loads'), 750);\n    setTimeout(() => {\n      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));\n      idle(() => add('lazyOnload: chat-widget.js loads (browser idle)'));\n    }, 1500);\n  }\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <button onClick={simulatePageLoad}>Simulate page load</button>\n      <pre style={{ background: '#111', color: '#9f9', padding: 8, fontSize: 12, minHeight: 100 }}>{events.join('\\n')}</pre>\n      <small>Only critical scripts should block rendering; the rest load after the page is usable.</small>\n    </div>\n  );\n}",
      },
      result: 'The log shows the order: beforeInteractive script, first paint, hydration, analytics (afterInteractive), and finally the chat widget (lazyOnload) once the browser is idle.',
      explanation:
        'Third-party scripts are a top cause of poor INP and LCP. next/script lets you choose when each loads; analytics after hydration and widgets on idle keep the main thread free for the user.',
    },
  ],
  interview: [
    { q: 'What are the four caching layers in the Next.js App Router?', a: '1) Request Memoization - dedupes identical fetches in one render pass (server, per request). 2) Data Cache - persists fetch results across requests/deploys (server). 3) Full Route Cache - stores HTML + RSC payload of static routes (server). 4) Router Cache - stores RSC payloads of visited/prefetched segments in browser memory.', level: 'Hard' },
    { q: 'What changed about caching in Next.js 15?', a: 'Caching became opt-in: fetch requests default to no-store, GET Route Handlers are uncached by default, and the client Router Cache no longer reuses page segments (staleTime 0 for dynamic pages). You opt in with cache: "force-cache", next.revalidate, route segment config or "use cache".', level: 'Hard' },
    { q: 'How do you reduce First Load JS?', a: 'Keep most components as Server Components, push "use client" to leaf components, pass server content as children, lazy load heavy components with next/dynamic, avoid large libraries or import them partially, use optimizePackageImports, and inspect the bundle with @next/bundle-analyzer.', level: 'Medium' },
    { q: 'What is next/dynamic and when should you use ssr: false?', a: 'next/dynamic lazy-loads a component in a separate chunk with an optional loading component. ssr: false skips server rendering - use it for components that rely on browser-only APIs (window, canvas libraries, maps). It can only be used inside Client Components.', level: 'Medium' },
    { q: 'Explain the next/script loading strategies.', a: 'beforeInteractive: loaded before hydration, in the initial HTML (critical scripts, root layout only). afterInteractive (default): after some hydration (analytics). lazyOnload: during browser idle time (chat, social). worker: experimental offload to a web worker via Partytown.', level: 'Medium' },
    { q: 'What is the difference between React cache() and unstable_cache?', a: 'cache() memoizes a function per server request only (deduplication within one render). unstable_cache stores results in the persistent Data Cache across requests with revalidate and tags. In newer versions the "use cache" directive replaces unstable_cache.', level: 'Hard' },
    { q: 'What makes a route dynamic instead of static?', a: 'Using dynamic APIs (cookies(), headers(), searchParams, connection()), uncached data fetches, or export const dynamic = "force-dynamic". Static routes are prerendered at build (or ISR with revalidate) and served from the Full Route Cache.', level: 'Medium' },
    { q: 'How do you avoid request waterfalls in Server Components?', a: 'Start independent fetches in parallel with Promise.all (or start promises before awaiting), move slow parts behind Suspense so the rest streams, and preload data in layouts. Sequential awaits on independent data add up latencies.', level: 'Medium' },
    { q: 'How would you send Core Web Vitals from real users to your backend?', a: 'Use useReportWebVitals from next/web-vitals in a small Client Component rendered in the root layout and send each metric with navigator.sendBeacon to an API route or analytics service (or use Vercel Speed Insights).', level: 'Medium' },
    { q: 'Why should performance always be measured on a production build?', a: 'next dev skips minification and tree shaking, compiles on demand, includes extra dev warnings and React development mode - it is much slower and not representative. Use next build && next start, Lighthouse and real-user data.', level: 'Easy' },
    { q: 'How do you clear the client Router Cache after a mutation?', a: 'Call revalidatePath/revalidateTag inside a Server Action (also refreshes the current route), or call router.refresh() from a Client Component, which refetches the current route from the server.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Set up @next/bundle-analyzer and write down the three largest client packages of your project.',
      hint: 'npm i -D @next/bundle-analyzer; ANALYZE=true npm run build.',
      solution:
        "// 1. npm install -D @next/bundle-analyzer\n// 2. next.config.js\nconst withBundleAnalyzer = require('@next/bundle-analyzer')({\n  enabled: process.env.ANALYZE === 'true',\n});\nmodule.exports = withBundleAnalyzer({ /* existing config */ });\n\n// 3. package.json scripts\n// \"analyze\": \"ANALYZE=true next build\"   (Windows: npx cross-env ANALYZE=true next build)\n\n// 4. npm run analyze -> open .next/analyze/client.html\n// Look for large rectangles (e.g. moment, chart.js, lodash) and replace / lazy-load them.",
    },
    {
      task: 'Refactor a page that has "use client" at the top only because of a Like button, so that the page becomes a Server Component.',
      hint: 'Extract LikeButton into its own client file.',
      solution:
        "// BEFORE: app/posts/[id]/page.js had 'use client' and fetched in useEffect.\n\n// AFTER: app/posts/[id]/LikeButton.js\n'use client';\nimport { useState } from 'react';\nexport default function LikeButton({ initial }) {\n  const [likes, setLikes] = useState(initial);\n  return <button onClick={() => setLikes(likes + 1)}>Like ({likes})</button>;\n}\n\n// app/posts/[id]/page.js (Server Component, no 'use client')\nimport LikeButton from './LikeButton';\nimport { getPost } from '@/lib/data/posts';\n\nexport default async function PostPage({ params }) {\n  const { id } = await params;\n  const post = await getPost(id);\n  return (\n    <article>\n      <h1>{post.title}</h1>\n      <div>{post.body}</div>\n      <LikeButton initial={post.likes} />\n    </article>\n  );\n}",
    },
    {
      task: 'Fix this waterfall: const user = await getUser(id); const orders = await getOrders(id); const recs = await getRecommendations(id);',
      hint: 'The three calls are independent.',
      solution:
        "export default async function Account({ params }) {\n  const { id } = await params;\n  const [user, orders, recs] = await Promise.all([\n    getUser(id),\n    getOrders(id),\n    getRecommendations(id),\n  ]);\n  return <AccountView user={user} orders={orders} recs={recs} />;\n}\n\n// Even better for a slow call: stream it\n// <Suspense fallback={<RecsSkeleton />}><Recommendations id={id} /></Suspense>",
    },
    {
      task: 'Make a blog index page statically generated and refreshed every 10 minutes, and make the comments section always fresh.',
      hint: 'export const revalidate = 600; fetch comments with cache: "no-store" inside a Suspense boundary.',
      solution:
        "// app/blog/page.js\nexport const revalidate = 600;   // ISR: regenerate at most every 10 minutes\n\nexport default async function Blog() {\n  const posts = await fetch('https://cms.example.com/posts', { next: { revalidate: 600 } }).then((r) => r.json());\n  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;\n}\n\n// app/blog/[slug]/Comments.js (Server Component inside <Suspense> on the post page)\nexport default async function Comments({ slug }) {\n  const comments = await fetch('https://cms.example.com/comments?post=' + slug, { cache: 'no-store' }).then((r) => r.json());\n  return <ul>{comments.map((c) => <li key={c.id}>{c.text}</li>)}</ul>;\n}",
    },
    {
      task: 'Create an /api/vitals Route Handler that logs incoming Web Vitals and a WebVitals client component that sends them.',
      hint: 'useReportWebVitals + sendBeacon; request.json() in the handler.',
      solution:
        "// app/_components/WebVitals.js\n'use client';\nimport { useReportWebVitals } from 'next/web-vitals';\nexport function WebVitals() {\n  useReportWebVitals((metric) => {\n    const body = JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating, page: location.pathname });\n    navigator.sendBeacon('/api/vitals', body);\n  });\n  return null;\n}\n\n// app/api/vitals/route.js\nexport async function POST(request) {\n  const metric = JSON.parse(await request.text());\n  console.log('[vitals]', metric.page, metric.name, Math.round(metric.value), metric.rating);\n  return new Response(null, { status: 204 });\n}\n\n// app/layout.js -> render <WebVitals /> inside <body>",
    },
  ],
  quiz: [
    { question: 'In Next.js 15, what is the default caching behaviour of fetch() in a Server Component?', options: ['Cached forever', 'Not cached (no-store) unless you opt in', 'Cached for 60 seconds', 'Cached only in development'], answer: 1, explanation: 'Next.js 15 made fetch uncached by default.' },
    { question: 'Which cache deduplicates identical fetch calls during a single render?', options: ['Router Cache', 'Full Route Cache', 'Request Memoization', 'Data Cache'], answer: 2, explanation: 'Request memoization lasts for one server request.' },
    { question: 'Which next/script strategy is best for a chat widget?', options: ['lazyOnload', 'beforeInteractive', 'afterInteractive', 'blocking'], answer: 0, explanation: 'Non-critical widgets should load when the browser is idle.' },
    { question: 'What does next/dynamic primarily do?', options: ['Makes a route dynamic', 'Adds a server cache', 'Disables prefetching', 'Splits a component into a separate lazily-loaded chunk'], answer: 3, explanation: 'It is code splitting for components (React.lazy + Suspense).' },
    { question: 'Which call purges all cached data tagged "products"?', options: ['router.refresh("products")', 'revalidateTag("products")', 'cache.delete("products")', 'export const revalidate = "products"'], answer: 1, explanation: 'revalidateTag invalidates Data Cache entries with that tag.' },
  ],
};
