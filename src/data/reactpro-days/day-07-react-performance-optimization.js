export default {
  id: 'day-07-react-performance-optimization',
  title: 'React Performance: Profiler, Memoization Pitfalls, List Virtualization, Code Splitting, Image/Bundle Optimisation and Core Web Vitals',
  module: 'Module 3: Patterns & Performance',
  day: 7,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Performance work starts with measuring, not guessing. Learn to find slow renders with the React DevTools Profiler, fix them with the right tool (state colocation, memo, useMemo/useCallback, transitions, React Compiler), render 10,000 rows with virtualization, split bundles by route, optimise images and dependencies, and connect it all to Core Web Vitals (LCP, INP, CLS) that Google and interviewers care about.',
  objectives: [
    'Profile a React app and read flame graphs, commit lists and "why did this render"',
    'Apply memo/useMemo/useCallback correctly and recognise when they do nothing',
    'Use structural fixes first: state colocation, children-as-props, splitting context',
    'Virtualize long lists and keep the UI responsive with useTransition/useDeferredValue',
    'Reduce bundle size and improve LCP, INP and CLS in a Vite MERN frontend',
  ],
  theory: [
    {
      heading: 'Measure first: React Profiler and browser tools',
      content:
        'Rule #1 of optimisation: **measure before and after**. Tools:\n- **React DevTools > Profiler**: record an interaction, then see each **commit**, a **flame graph** (component widths = render time) and a **ranked** chart. Enable "Record why each component rendered" in settings to see *Props changed: (onClick)*, *Hook 2 changed*, *Parent rendered*.\n- **"Highlight updates when components render"** (DevTools settings) flashes re-rendering components.\n- **`<Profiler id onRender>`** component: log `actualDuration` vs `baseDuration` programmatically.\n- **Chrome DevTools Performance panel** (with CPU 4x throttling to simulate budget Android phones common in India) and **Lighthouse** for page-level metrics.\n- **React Scan** (open source) overlays re-renders in real time.\n\nAlways profile a **production build** (`npm run build && npm run preview`); development mode is much slower because of StrictMode and extra checks.',
      syntax:
        "import { Profiler } from 'react';\n\nfunction onRender(id, phase, actualDuration, baseDuration) {\n  // actualDuration: time spent rendering this commit (with memoization)\n  // baseDuration: estimated time to render the whole subtree without memoization\n  if (actualDuration > 16) console.warn(id, phase, actualDuration.toFixed(1) + 'ms');\n}\n\n<Profiler id=\"ProductGrid\" onRender={onRender}>\n  <ProductGrid />\n</Profiler>",
    },
    {
      heading: 'Structural fixes before memoization',
      content:
        'Most slow React apps render too much because state is in the wrong place. Fix the structure first; it costs nothing at runtime:\n\n1. **Colocate state**: if only the search box needs `query`, keep the state inside `<SearchBox>` instead of the page. Updates then re-render only that small component.\n2. **Lift content up / children as props**: a component that changes often (e.g. tracking scroll or mouse) can receive expensive content as `children`. Elements passed as children were created by the parent and keep the same reference, so React skips them.\n3. **Split contexts** by update frequency (Day 4).\n4. **Avoid creating components inside components** (Day 1).\n5. **Keep keys stable** so React does not remount.\n6. **Derive, don\'t sync**: compute values during render instead of `useEffect` + extra `setState` (which causes a second render).',
      syntax:
        "// Slow: every mouse move re-renders <ExpensiveTree />\nfunction Page() {\n  const [pos, setPos] = useState({ x: 0, y: 0 });\n  return <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}><Cursor pos={pos} /><ExpensiveTree /></div>;\n}\n\n// Fast: state moved down, expensive tree passed as children\nfunction MouseArea({ children }) {\n  const [pos, setPos] = useState({ x: 0, y: 0 });\n  return <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}><Cursor pos={pos} />{children}</div>;\n}\nfunction Page() { return <MouseArea><ExpensiveTree /></MouseArea>; }",
    },
    {
      heading: 'memo, useMemo, useCallback: pitfalls',
      content:
        '`React.memo(Component)` skips re-rendering when **all props are shallow-equal** (`Object.is`). It only works if props are stable:\n- Inline objects/arrays/functions (`style={{...}}`, `options={[...]}`, `onClick={() => ...}`) are **new every render**, so memo always fails. Stabilise them with `useMemo` / `useCallback` or move constants outside the component.\n- `children` is a prop too. `<Memoized><span/></Memoized>` gets new children every time, so memo is useless.\n- A memoized component still re-renders when its **own state or context** changes.\n- `useCallback` without a `memo` child (or a dependency array that uses it) is pure overhead.\n- Wrong dependency arrays give **stale values** (a classic bug). Use the ESLint `react-hooks` plugin.\n- `useMemo` is for **expensive calculations** (sorting/filtering thousands of items) or **referential stability**, not for `a + b`.\n\n**React Compiler** (v1.0, Oct 2025) analyses components at build time and inserts memoization automatically (`babel-plugin-react-compiler`, works with React 17+ and is enabled in new Vite/Next templates). With it you rarely write memo/useMemo/useCallback manually, but you must follow the Rules of React (pure render, no mutation of props/state).',
    },
    {
      heading: 'Long lists: virtualization, pagination, transitions',
      content:
        'Rendering 10,000 table rows creates 10,000+ DOM nodes: slow initial render, heavy memory, laggy scrolling. Options:\n- **Pagination / infinite loading** (Day 3) so the browser only holds what the user needs.\n- **Virtualization (windowing)**: render only the rows visible in the viewport plus a small overscan, inside a container with the full scroll height. Libraries: **TanStack Virtual** (`useVirtualizer`, headless), **react-window**, **react-virtuoso** (variable heights, chat UIs). Requires a scroll container with a fixed height and known or measured row sizes.\n- **CSS `content-visibility: auto`** lets the browser skip layout/paint for off-screen sections (cheap win for long pages).\n\nKeeping input responsive while a big list re-renders:\n- **`useDeferredValue(query)`**: render the list with a deferred copy of the query; React renders the urgent input update first and the list update in the background (interruptible).\n- **`useTransition`**: wrap the non-urgent `setState` in `startTransition` and show `isPending`.\nThese improve **INP** (Interaction to Next Paint).',
      syntax:
        "import { useVirtualizer } from '@tanstack/react-virtual';\n\nfunction OrdersTable({ orders }) {\n  const parentRef = useRef(null);\n  const virtualizer = useVirtualizer({\n    count: orders.length,\n    getScrollElement: () => parentRef.current,\n    estimateSize: () => 48,\n    overscan: 8,\n  });\n  return (\n    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>\n      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>\n        {virtualizer.getVirtualItems().map((row) => (\n          <div key={row.key} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: row.size, transform: `translateY(${row.start}px)` }}>\n            {orders[row.index].customer}\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}",
    },
    {
      heading: 'Code splitting and bundle optimisation',
      content:
        'Vite bundles everything reachable from `main.jsx` into JS chunks. A big first chunk delays **LCP** and interactivity on slow 4G.\n\n- **Route-level splitting**: `const Admin = lazy(() => import(\'./pages/Admin\'))` + `<Suspense>`; or React Router 7 `lazy` route property. Admin dashboards, charts and editors should never be in the landing-page bundle.\n- **Component-level splitting**: heavy widgets shown on demand (rich-text editor, map, PDF viewer, emoji picker).\n- **Preload on intent**: start `import()` on hover/focus of a link so the chunk is ready on click.\n- **Analyse the bundle**: `rollup-plugin-visualizer` (or `vite-bundle-visualizer`) shows which packages are large.\n- **Choose lighter dependencies**: `date-fns` or `dayjs` instead of `moment`, `lodash-es` per-function imports, native `Intl.NumberFormat` for currency (Rs formatting with `en-IN`).\n- **Tree-shaking** works with ES modules and named imports: `import { debounce } from \'lodash-es\'`.\n- **Manual chunks** (`build.rollupOptions.output.manualChunks`) to cache vendor code separately.\n- Serve with **gzip/brotli** compression and long-term caching (hashed filenames) from Nginx/Vercel/Netlify/CloudFront.',
    },
    {
      heading: 'Images, fonts and Core Web Vitals',
      content:
        '**Core Web Vitals** (Google ranking signals, measured on real users):\n- **LCP** (Largest Contentful Paint) - when the main content (often hero image/heading) appears. Good: **<= 2.5 s**.\n- **INP** (Interaction to Next Paint, replaced FID in March 2024) - responsiveness to clicks/typing. Good: **<= 200 ms**.\n- **CLS** (Cumulative Layout Shift) - visual stability. Good: **<= 0.1**.\n\nReact-specific fixes:\n- **Images**: modern formats (WebP/AVIF), correct size (`srcset`/`sizes` or a CDN like Cloudinary with `f_auto,q_auto,w_400`), `loading="lazy"` for below-the-fold, `fetchpriority="high"` and **no lazy loading** for the LCP hero image, and always set `width`/`height` (or `aspect-ratio`) to prevent CLS.\n- **Fonts**: `font-display: swap`, preload the main font, limit weights.\n- **Skeletons with fixed size** instead of spinners that change layout.\n- **INP**: keep event handlers short, move heavy work to transitions, Web Workers, or the server; debounce search input.\n- **SPA LCP**: consider SSR/SSG (Next.js, React Router framework mode) for public SEO pages.\n\nMeasure real users with the `web-vitals` library: `onLCP(send); onINP(send); onCLS(send);`.',
    },
  ],
  examples: [
    {
      title: 'memo that does nothing vs memo that works',
      scenario: 'A product grid re-renders on every keystroke in an unrelated search box. Fix it step by step and watch render counts.',
      steps: [
        'Render a slow ProductCard list wrapped in memo but with an inline onAdd function',
        'Type in the input: cards still re-render (memo broken)',
        'Toggle "stable callback" to use useCallback',
        'Type again: cards no longer re-render',
      ],
      code: `const ProductCard = memo(function ProductCard({ product, onAdd }) { ... });

// broken: new function every render
<ProductCard product={p} onAdd={() => addToCart(p.id)} />

// works: stable reference + pass id to the child
const handleAdd = useCallback((id) => setCart(c => [...c, id]), []);
<ProductCard product={p} onAdd={handleAdd} />`,
      playground: {
        jsx: `const { useState, useCallback, memo, useRef } = React;
const products = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: 'Product ' + (i + 1), price: 199 + i * 50 }));
const renderCounts = {};

function slow() { const end = performance.now() + 2; while (performance.now() < end) {} } // 2ms each

const ProductCard = memo(function ProductCard({ product, onAdd }) {
  slow();
  renderCounts[product.id] = (renderCounts[product.id] || 0) + 1;
  return (
    <div style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6 }}>
      <b>{product.name}</b><br />Rs {product.price}<br />
      <button onClick={() => onAdd(product.id)}>Add</button>
      <div style={{ fontSize: 11, color: '#888' }}>renders: {renderCounts[product.id]}</div>
    </div>
  );
});

function App() {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [stable, setStable] = useState(false);
  const stableAdd = useCallback((id) => setCart(c => [...c, id]), []);
  const inlineAdd = (id) => setCart(c => [...c, id]);
  const onAdd = stable ? stableAdd : inlineAdd;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="type in a newsletter box..." />{' '}
      <label><input type="checkbox" checked={stable} onChange={e => setStable(e.target.checked)} /> stable callback (useCallback)</label>
      <p>Cart: {cart.length} items</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {products.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
      </div>
    </div>
  );
}`,
      },
      result: 'Without the checkbox, every keystroke increases every card render count and typing feels sluggish. With it checked, counts stop increasing while typing.',
      explanation:
        'memo compares props by reference. An inline arrow is a new function each render, so the comparison fails. useCallback with an empty dependency array (using the functional setState) keeps the same reference. The better structural fix would be to move the input state into its own component (colocation).',
    },
    {
      title: 'Virtualized list of 10,000 rows from scratch',
      scenario: 'An admin "all orders" view. Render only the visible rows to keep scrolling smooth.',
      steps: [
        'Create a scroll container with fixed height and track scrollTop',
        'Compute startIndex and endIndex from rowHeight plus overscan',
        'Render a spacer with the full height and absolutely positioned visible rows',
        'Scroll and check that only ~20 DOM rows exist',
      ],
      code: `const start = Math.max(0, Math.floor(scrollTop / ROW) - OVERSCAN);
const end = Math.min(items.length, Math.ceil((scrollTop + HEIGHT) / ROW) + OVERSCAN);
// render items.slice(start, end) at top = index * ROW inside a div of height items.length * ROW`,
      playground: {
        jsx: `const { useState, useMemo } = React;
const ROW = 36, HEIGHT = 300, OVERSCAN = 5;
const orders = Array.from({ length: 10000 }, (_, i) => ({
  id: 100000 + i, customer: ['Asha', 'Ravi', 'Neha', 'Arjun', 'Priya'][i % 5] + ' ' + (i + 1),
  amount: ((i * 7919) % 50000) + 99,
}));

function VirtualList({ items }) {
  const [scrollTop, setScrollTop] = useState(0);
  const start = Math.max(0, Math.floor(scrollTop / ROW) - OVERSCAN);
  const end = Math.min(items.length, Math.ceil((scrollTop + HEIGHT) / ROW) + OVERSCAN);
  const visible = items.slice(start, end);
  return (
    <>
      <p>Rendering rows {start} to {end - 1} ({visible.length} DOM rows of {items.length})</p>
      <div onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
        style={{ height: HEIGHT, overflow: 'auto', border: '1px solid #ccc', position: 'relative' }}>
        <div style={{ height: items.length * ROW, position: 'relative' }}>
          {visible.map((o, i) => (
            <div key={o.id} style={{ position: 'absolute', top: (start + i) * ROW, height: ROW, left: 0, right: 0,
              display: 'flex', justifyContent: 'space-between', padding: '0 12px', alignItems: 'center',
              borderBottom: '1px solid #f0f0f0', background: (start + i) % 2 ? '#fafafa' : '#fff' }}>
              <span>#{o.id}</span><span>{o.customer}</span><span>Rs {o.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function App() {
  return <div style={{ fontFamily: 'sans-serif', padding: 16 }}><VirtualList items={orders} /></div>;
}`,
      },
      result: 'Scrolling is smooth through 10,000 orders while only about 18-20 row elements exist in the DOM.',
      explanation:
        'The inner div has the full height so the scrollbar looks correct. Only the slice of rows in the viewport (plus overscan to avoid blank flashes) is rendered and positioned absolutely. TanStack Virtual does this plus dynamic measuring, horizontal lists and grids.',
    },
    {
      title: 'Responsive search over a big list with useDeferredValue',
      scenario: 'Filtering 20,000 products blocks typing. Defer the list update so the input stays responsive (better INP).',
      steps: [
        'Keep query state for the input',
        'Create deferredQuery = useDeferredValue(query)',
        'Render a memoized SlowList with deferredQuery',
        'Dim the list while query !== deferredQuery',
      ],
      code: `const deferredQuery = useDeferredValue(query);
const isStale = query !== deferredQuery;
<input value={query} onChange={e => setQuery(e.target.value)} />
<div style={{ opacity: isStale ? 0.5 : 1 }}><SlowList query={deferredQuery} /></div>  // SlowList is memo()`,
      playground: {
        jsx: `const { useState, useDeferredValue, memo } = React;
const items = Array.from({ length: 20000 }, (_, i) => 'Item ' + i + ' ' + ['phone', 'laptop', 'shoe', 'shirt', 'watch'][i % 5]);

const SlowList = memo(function SlowList({ query }) {
  const start = performance.now();
  while (performance.now() - start < 40) {}           // simulate 40ms of expensive rendering
  const results = items.filter(t => t.includes(query)).slice(0, 50);
  return <ul>{results.map(r => <li key={r}>{r}</li>)}</ul>;
});

function App() {
  const [query, setQuery] = useState('');
  const [useDeferred, setUseDeferred] = useState(true);
  const deferredQuery = useDeferredValue(query);
  const listQuery = useDeferred ? deferredQuery : query;
  const isStale = query !== listQuery;
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <label><input type="checkbox" checked={useDeferred} onChange={e => setUseDeferred(e.target.checked)} /> use useDeferredValue</label><br />
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="type fast: watch" style={{ marginTop: 8 }} />
      <div style={{ opacity: isStale ? 0.5 : 1 }}><SlowList query={listQuery} /></div>
    </div>
  );
}`,
      },
      result: 'With the checkbox on, typing stays smooth and the list catches up; with it off, each keystroke freezes the input.',
      explanation:
        'useDeferredValue lets React render the urgent input update first, then render the list with the new value in an interruptible background render. If you type again, the outdated background render is abandoned. SlowList must be memoized so it does not render with every keystroke anyway.',
    },
    {
      title: 'Route-based code splitting with preload on hover (React Router 7)',
      scenario: 'The admin dashboard (charts library 300 KB) should not be downloaded by normal shoppers.',
      steps: [
        'Use the route lazy property or React.lazy for heavy pages',
        'Wrap in Suspense with a skeleton fallback',
        'Preload the chunk on mouse enter of the navigation link',
        'Check the network tab: admin chunk loads only when needed',
      ],
      code: `// router.jsx (React Router 7 data router)
import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  { path: '/', Component: Home },
  {
    path: '/admin',
    lazy: async () => {
      const { AdminDashboard, adminLoader } = await import('./pages/admin/AdminDashboard');
      return { Component: AdminDashboard, loader: adminLoader };
    },
    HydrateFallback: DashboardSkeleton,
  },
]);

// Or with React.lazy
const Reports = lazy(() => import('./pages/Reports'));
const preloadReports = () => import('./pages/Reports');   // same promise is cached by the bundler

<Link to="/reports" onMouseEnter={preloadReports} onFocus={preloadReports}>Reports</Link>
<Suspense fallback={<PageSkeleton />}><Reports /></Suspense>

// vite.config.js: inspect bundles
import { visualizer } from 'rollup-plugin-visualizer';
export default { plugins: [react(), visualizer({ open: true, gzipSize: true })] };`,
      result: 'The initial JS shrinks; the admin chunk appears in the Network tab only when the admin route is visited (or hovered).',
      explanation:
        'Dynamic import() tells the bundler to create a separate chunk. Calling the same import() early on hover starts the download so navigation feels instant. The visualizer report shows which libraries dominate the bundle.',
    },
    {
      title: 'Optimised hero and product images for LCP and CLS',
      scenario: 'A home page with a hero banner and a grid of product thumbnails from Cloudinary.',
      steps: [
        'Hero: no lazy loading, fetchpriority="high", width/height set',
        'Thumbnails: loading="lazy", decoding="async", responsive srcset',
        'Use the CDN to serve WebP/AVIF at the right width',
      ],
      code: `const cld = (id, w) => 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_' + w + '/' + id;

function Hero() {
  return (
    <img
      src={cld('hero-sale.jpg', 1200)}
      srcSet={[640, 960, 1200, 1600].map(w => cld('hero-sale.jpg', w) + ' ' + w + 'w').join(', ')}
      sizes="100vw"
      width="1200" height="500"
      fetchPriority="high"           // React 19 supports fetchPriority prop
      alt="Diwali sale: up to 60% off"
    />
  );
}

function Thumb({ product }) {
  return (
    <img
      src={cld(product.imageId, 300)}
      srcSet={cld(product.imageId, 300) + ' 1x, ' + cld(product.imageId, 600) + ' 2x'}
      width="300" height="300"
      loading="lazy" decoding="async"
      style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
      alt={product.name}
    />
  );
}

// main.jsx: measure real users
import { onLCP, onINP, onCLS } from 'web-vitals';
const send = (metric) => navigator.sendBeacon('/api/vitals', JSON.stringify(metric));
onLCP(send); onINP(send); onCLS(send);`,
      result: 'Lighthouse LCP improves because the hero loads first in a modern format; CLS stays near 0 because every image reserves its space.',
      explanation:
        'Lazy-loading the LCP image is a common mistake that delays it. Width/height (or aspect-ratio) reserve space so content does not jump. f_auto,q_auto lets the CDN pick AVIF/WebP and quality per browser.',
    },
  ],
  interview: [
    { q: 'How do you find out why a React component is slow?', a: 'Profile a production build with React DevTools Profiler (enable "why did this render"), look at the flame/ranked charts for long renders and frequent commits, and use Chrome Performance with CPU throttling. Then fix the specific cause instead of adding memo everywhere.', level: 'Easy' },
    { q: 'When does React.memo NOT prevent a re-render?', a: 'When any prop changes reference (inline objects, arrays, functions, JSX children), when the component\'s own state changes, or when a context it consumes changes. Also when the parent changes its key.', level: 'Medium' },
    { q: 'Is it good practice to wrap every function in useCallback?', a: 'No. useCallback has a cost (allocation plus dependency comparison) and only helps when the function is passed to a memoized child or used as a dependency of another hook. Otherwise it adds complexity for no benefit. React Compiler can automate this.', level: 'Medium' },
    { q: 'What is React Compiler?', a: 'A build-time Babel/SWC plugin (v1.0 in 2025) that analyses components and hooks and automatically memoizes values, callbacks and JSX, removing most manual memo/useMemo/useCallback. It requires code that follows the Rules of React, and can be adopted incrementally.', level: 'Medium' },
    { q: 'What is list virtualization and when do you need it?', a: 'Rendering only visible items of a long list inside a scroll container sized for the full list. Use it for hundreds to thousands of rows (tables, chat, logs) where pagination is not suitable. Libraries: TanStack Virtual, react-window, react-virtuoso.', level: 'Medium' },
    { q: 'useTransition vs useDeferredValue?', a: 'useTransition wraps the state update you control (startTransition(() => setTab(t))) and gives isPending. useDeferredValue defers a value you receive (e.g. a prop or a state used by an expensive child). Both mark work as non-urgent and interruptible; use useDeferredValue when you do not own the setter.', level: 'Hard' },
    { q: 'What are Core Web Vitals?', a: 'LCP (loading, good <= 2.5s), INP (responsiveness, good <= 200ms, replaced FID in 2024) and CLS (visual stability, good <= 0.1), measured at the 75th percentile of real users.', level: 'Easy' },
    { q: 'How can a React SPA improve LCP?', a: 'Smaller initial bundle via code splitting, preload critical assets, prioritise and optimise the hero image (no lazy loading, fetchpriority high, modern formats), avoid rendering the main content only after client-side fetches (prefetch or SSR/SSG), use a CDN with compression and caching.', level: 'Hard' },
    { q: 'How do you avoid layout shift (CLS) in React apps?', a: 'Set width/height or aspect-ratio for images and embeds, use fixed-size skeletons, reserve space for ads/banners, avoid inserting content above existing content, use font-display swap with matching fallback metrics.', level: 'Medium' },
    { q: 'What is state colocation and why is it a performance technique?', a: 'Keeping state as close as possible to where it is used. A state update re-renders the component owning it and its subtree; owning state lower in the tree reduces how much re-renders. It is free compared with memoization.', level: 'Medium' },
    { q: 'How do you analyse and reduce bundle size in Vite?', a: 'Run a visualizer (rollup-plugin-visualizer), identify heavy dependencies, replace them (moment -> date-fns/dayjs), use named ESM imports for tree-shaking, lazy-load routes and heavy widgets, split vendor chunks, and enable brotli/gzip on the server.', level: 'Medium' },
    { q: 'Why might passing children improve performance?', a: 'Elements passed as children are created by the parent of the component that changes state. When that component re-renders, the children prop is the same reference, so React bails out of rendering that subtree. It is a way to isolate frequently updating state without memo.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Refactor: a Dashboard holds `const [search, setSearch] = useState("")` for a header search box and also renders a heavy <SalesChart />. Typing lags. Fix it without using memo.',
      hint: 'Move the state into a SearchBox component.',
      solution: `function SearchBox({ onSearch }) {
  const [search, setSearch] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onSearch(search); }}>
      <input value={search} onChange={e => setSearch(e.target.value)} />
    </form>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  return (
    <>
      <SearchBox onSearch={(q) => navigate('/search?q=' + encodeURIComponent(q))} />
      <SalesChart />   {/* no longer re-renders on each keystroke */}
    </>
  );
}`,
    },
    {
      task: 'Write a reusable <VirtualList items rowHeight height renderRow /> component (render prop) based on the example, and use it to show 5,000 users.',
      hint: 'Keep scrollTop in state; compute start/end; call renderRow(item, index).',
      solution: `const { useState } = React;
function VirtualList({ items, rowHeight, height, renderRow, overscan = 4 }) {
  const [scrollTop, setScrollTop] = useState(0);
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(items.length, Math.ceil((scrollTop + height) / rowHeight) + overscan);
  return (
    <div style={{ height, overflow: 'auto' }} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
      <div style={{ height: items.length * rowHeight, position: 'relative' }}>
        {items.slice(start, end).map((item, i) => (
          <div key={start + i} style={{ position: 'absolute', top: (start + i) * rowHeight, height: rowHeight, left: 0, right: 0 }}>
            {renderRow(item, start + i)}
          </div>
        ))}
      </div>
    </div>
  );
}
const users = Array.from({ length: 5000 }, (_, i) => ({ id: i, name: 'User ' + i }));
function App() {
  return <VirtualList items={users} rowHeight={32} height={320} renderRow={(u) => <span>{u.id}. {u.name}</span>} />;
}`,
    },
    {
      task: 'Add a <Profiler> around a ProductList and log a warning when a commit takes more than 16 ms, including the phase (mount/update).',
      hint: 'onRender(id, phase, actualDuration).',
      solution: `import { Profiler } from 'react';

function logSlowRender(id, phase, actualDuration, baseDuration) {
  if (actualDuration > 16) {
    console.warn('[Profiler] ' + id + ' ' + phase + ' took ' + actualDuration.toFixed(1) + 'ms (base ' + baseDuration.toFixed(1) + 'ms)');
  }
}

export default function ProductsPage() {
  return (
    <Profiler id="ProductList" onRender={logSlowRender}>
      <ProductList />
    </Profiler>
  );
}
// Note: production builds disable profiling unless you alias react-dom to react-dom/profiling.`,
    },
    {
      task: 'List 6 concrete changes to improve Lighthouse performance for a Vite MERN e-commerce home page with a large hero image, Google Fonts, moment.js and a chart on the admin route.',
      hint: 'Think LCP, CLS, bundle.',
      solution: `1. Serve the hero image via a CDN in AVIF/WebP at the right width, with width/height, fetchPriority="high" and no loading="lazy".
2. Add loading="lazy" + explicit dimensions to below-the-fold product images.
3. Replace moment.js with dayjs or date-fns (or Intl.DateTimeFormat).
4. Lazy-load the admin route (and its chart library) with React Router lazy / React.lazy.
5. Self-host or preconnect Google Fonts, limit weights, use font-display: swap.
6. Enable brotli/gzip and long-term caching for hashed assets; check with rollup-plugin-visualizer that the initial chunk is small.
(Bonus: reserve space with skeletons to keep CLS < 0.1, and track real users with web-vitals.)`,
    },
  ],
  quiz: [
    { question: 'Which Core Web Vital replaced FID in 2024?', options: ['TTFB', 'CLS', 'INP', 'FCP'], answer: 2, explanation: 'Interaction to Next Paint measures overall responsiveness.' },
    { question: 'Why does memo(Child) still re-render with onClick={() => save()}?', options: ['memo only works with classes', 'A new function is created each render, so props are not equal', 'onClick is ignored by memo', 'Because of StrictMode'], answer: 1, explanation: 'Shallow comparison sees a new function reference every time.' },
    { question: 'What does list virtualization do?', options: ['Renders only items visible in the viewport', 'Moves the list to a Web Worker', 'Caches API responses', 'Compresses the DOM'], answer: 0, explanation: 'Only visible rows plus overscan are mounted.' },
    { question: 'Which image should NOT use loading="lazy"?', options: ['Footer logos', 'Product thumbnails below the fold', 'Images in a closed modal', 'The hero (LCP) image'], answer: 3, explanation: 'Lazy loading the LCP image delays the most important paint.' },
    { question: 'Where should you profile React performance?', options: ['Only in development mode', 'In a production build', 'Only on the server', 'Only in Storybook'], answer: 1, explanation: 'Development mode includes extra checks that distort timings.' },
  ],
};
