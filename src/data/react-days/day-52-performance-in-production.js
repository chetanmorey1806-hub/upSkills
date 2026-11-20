export default {
  id: 'day-52-performance-in-production',
  title: 'Performance in Production: React Profiler, Lighthouse, Core Web Vitals, Bundle Analysis, Image Optimisation, Memoisation Pitfalls',
  module: 'Module 10: Advanced Industry Topics',
  day: 52,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Users on a ₹8,000 Android phone with patchy 4G are your real audience. Today you learn the industry workflow for performance: measure first (React Profiler, Lighthouse, Core Web Vitals LCP / INP / CLS in the field), then fix the biggest problem: re-renders, slow interactions, heavy bundles or unoptimised images, and avoid the common memoisation mistakes.',
  objectives: [
    'Measure performance correctly with the React DevTools Profiler, the <Profiler> API and Lighthouse',
    'Explain Core Web Vitals (LCP, INP, CLS), their thresholds, and how React apps affect each one',
    'Analyse and shrink a Vite bundle with a visualizer, code splitting and lighter dependencies',
    'Optimise images: modern formats, responsive srcset, lazy loading, fetchpriority and fixed dimensions',
    'Fix unnecessary re-renders with state colocation and correct memoisation, and recognise memoisation pitfalls',
  ],
  theory: [
    {
      heading: 'Rule 1: measure first, in production mode',
      content:
        'Performance work without measurement is guessing. The industry loop is **measure → find the biggest bottleneck → fix → measure again**.\n\n- **Development builds are slow** (extra checks, StrictMode double renders). Always measure with `npm run build && npm run preview`, or a profiling build.\n- **Throttle**: in Chrome DevTools set CPU 4x slowdown and "Fast 4G" to simulate a mid-range Android phone.\n- **React DevTools → Profiler tab**: record an interaction, see a **flame graph** of which components rendered, how long each took, and "Why did this render?" (enable it in settings). Turn on "Highlight updates when components render" to see re-renders flash on screen.\n- **`<Profiler id onRender>`** API: measure a subtree in code and send timings to your analytics.\n- **Chrome Performance panel**: long tasks (> 50 ms block the main thread), layout shifts, network waterfall.\n\nAnalogy: a doctor runs tests before prescribing medicine. useMemo everywhere without measuring is like taking antibiotics for every cough.',
      syntax: `import { Profiler } from "react";

function onRender(id, phase, actualDuration, baseDuration, startTime, commitTime) {
  // phase: "mount" | "update" | "nested-update"
  if (actualDuration > 16) console.warn(id + " took " + actualDuration.toFixed(1) + " ms (" + phase + ")");
}

<Profiler id="ProductGrid" onRender={onRender}>
  <ProductGrid products={products} />
</Profiler>`,
      tip: 'The <Profiler> component is disabled in production builds by default. Use the react-dom/profiling build (alias in Vite) if you need production profiling.',
    },
    {
      heading: 'Core Web Vitals and Lighthouse',
      content:
        'Google\'s **Core Web Vitals** measure real user experience and influence search ranking. Targets are for the **75th percentile** of real visits:\n\n- **LCP (Largest Contentful Paint)**: when the main content (hero image, product image, big heading) appears. Good ≤ **2.5 s**\n- **INP (Interaction to Next Paint)**: how quickly the page responds to clicks, taps and typing, across the whole visit. Good ≤ **200 ms**. INP replaced FID in March 2024\n- **CLS (Cumulative Layout Shift)**: how much content jumps around. Good ≤ **0.1**\n\nOther useful metrics: **TTFB** (server response) and **FCP** (first paint).\n\n**Lab vs field data**: Lighthouse (Chrome DevTools → Lighthouse, or PageSpeed Insights) is a **lab** test on one simulated device: great for debugging, scores 0–100. **Field data** (CrUX report, or the `web-vitals` library sending metrics to your analytics) shows what real users experience. Companies watch field data on dashboards and use Lighthouse CI to block regressions in pull requests.\n\nHow React apps hurt each metric:\n- LCP: big JS bundle must download and run before anything shows (client-side rendering), hero image lazy-loaded by mistake, slow API before first render\n- INP: expensive re-renders on every keystroke, huge lists, heavy synchronous work in click handlers\n- CLS: images without width/height, content inserted above existing content, late-loading fonts and ads',
      syntax: `// npm install web-vitals
import { onLCP, onINP, onCLS } from "web-vitals";

function send(metric) {
  navigator.sendBeacon("/analytics", JSON.stringify({
    name: metric.name, value: metric.value, rating: metric.rating, page: location.pathname,
  }));
}
onLCP(send); onINP(send); onCLS(send);`,
    },
    {
      heading: 'Bundle analysis and shrinking JavaScript',
      content:
        'Every KB of JavaScript must be downloaded, parsed and executed, which hurts LCP and INP on slow phones. Aim for an initial JS bundle under ~170 KB gzipped for a typical app.\n\n1. **Visualise**: `npm i -D rollup-plugin-visualizer` creates `stats.html` showing a treemap of what is inside your bundle. `npx vite-bundle-visualizer` works without config. `source-map-explorer` is an alternative.\n2. **Code split routes and heavy widgets** with `React.lazy` + `Suspense` (Day 25): admin dashboard, charts, rich-text editor, maps.\n3. **Replace heavy libraries**: moment (~70 KB) → date-fns / dayjs; full lodash → individual imports or native JS; big icon packs → per-icon imports (`lucide-react` is tree-shakeable).\n4. **Tree shaking** works only with ES modules and named imports: `import { debounce } from "lodash-es"` not `import _ from "lodash"`.\n5. **Split vendor chunks** that rarely change for better caching (`build.rollupOptions.output.manualChunks`).\n6. **Check before installing**: bundlephobia.com shows the size cost of any npm package.\n7. Ship **compressed** files (Brotli/gzip, automatic on Vercel/Netlify) with long-lived cache headers for hashed assets.',
      syntax: `// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react(), visualizer({ filename: "stats.html", gzipSize: true, open: true })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: { react: ["react", "react-dom", "react-router"], charts: ["recharts"] },
      },
    },
  },
});`,
    },
    {
      heading: 'Image optimisation',
      content:
        'Images are usually the **largest bytes** on a page and the **LCP element** on e-commerce sites.\n\n- **Modern formats**: WebP (~30% smaller than JPEG) and AVIF (smaller still). Use `<picture>` with fallbacks or an image CDN that picks the format automatically (Cloudinary, ImageKit, Vercel/Next Image)\n- **Right size**: do not send a 2000 px image to a 360 px phone. Use `srcset` + `sizes` so the browser picks the best file\n- **Always set `width` and `height`** (or CSS `aspect-ratio`) so the browser reserves space: prevents CLS\n- **Lazy-load below-the-fold images**: `loading="lazy"` and `decoding="async"`\n- **Never lazy-load the LCP image**: give the hero image `fetchpriority="high"` (in React 19 JSX it is written `fetchPriority`), and consider `<link rel="preload" as="image">`\n- Compress at build time (vite-plugin-image-optimizer, squoosh) and serve from a CDN close to users (Mumbai/Chennai edge locations)\n- Use SVG for icons and logos; placeholder blur/skeleton while loading',
      syntax: `<img
  src="https://cdn.example.com/p/123-800.webp"
  srcSet="https://cdn.example.com/p/123-400.webp 400w, https://cdn.example.com/p/123-800.webp 800w, https://cdn.example.com/p/123-1200.webp 1200w"
  sizes="(max-width: 600px) 100vw, 400px"
  width="400" height="400"
  loading="lazy" decoding="async"
  alt="Blue cotton kurta, front view"
/>`,
    },
    {
      heading: 'Re-renders and memoisation pitfalls',
      content:
        'A component re-renders when its **state changes**, its **parent re-renders**, or a **context it uses changes**. Re-rendering is usually cheap; it becomes a problem only for big trees or expensive components on frequent updates (typing, scrolling, timers).\n\nFix in this order:\n1. **Colocate state**: move fast-changing state (input text, hover) down into the small component that needs it, so the big sibling list does not re-render\n2. **Lift content up / pass children**: a component that receives `children` does not re-render them when its own state changes\n3. **Split contexts** and memoise the context value; or use a store with selectors (Zustand/Redux)\n4. **Virtualise long lists** (react-window, TanStack Virtual, Day 39)\n5. **Keep interactions responsive** with `useDeferredValue` / `useTransition` so typing stays fast while a heavy list updates\n6. **Then memoise**: `React.memo` for expensive pure children, with `useMemo` / `useCallback` to keep props stable\n\n**Pitfalls interviewers love:**\n- `React.memo(Child)` + `<Child style={{ color: "red" }} onClick={() => ...} />` → new object and function every render, so memo **never skips**\n- `useMemo` for cheap work (`a + b`, filtering 20 items) costs more than it saves\n- Wrong dependencies in `useMemo`/`useCallback` → stale values bugs\n- Memoising a component whose `children` prop is JSX: children is a new object every render\n- `key={Math.random()}` or index keys on reorderable lists → remounts and lost state\n- Context provider `value={{ user, setUser }}` → every consumer re-renders on every provider render\n\nWith the **React Compiler** (Day 51) much of manual memoisation is automatic, but state colocation, virtualisation and bundle size are still your job.',
      tip: 'Interview line: "I first measure with the Profiler, then colocate state or restructure components; I add memo/useMemo/useCallback only where the profiler shows an expensive re-render, and I check the props are actually stable."',
    },
    {
      heading: 'Production performance checklist',
      content: 'A checklist many teams keep in their PR template or release process:',
      points: [
        'Lighthouse performance ≥ 90 on mobile for key pages; Core Web Vitals "good" in field data',
        'Routes and heavy widgets lazy-loaded; initial JS budget checked in CI (size-limit or bundlesize)',
        'Images: WebP/AVIF, srcset, width/height, lazy below the fold, fetchpriority="high" on the LCP image',
        'Fonts: `font-display: swap`, preload the main font, subset (e.g. only Latin + Devanagari)',
        'API data cached (TanStack Query staleTime), requests deduplicated, no waterfalls (fetch in parallel)',
        'Long lists virtualised; inputs debounced; heavy computation moved to useMemo, a Web Worker or the server',
        'No console.log spam or source maps publicly exposed in production; compression and CDN caching on',
        'Monitoring: web-vitals to analytics, Sentry performance tracing, alerts on regressions',
      ],
    },
  ],
  examples: [
    {
      title: 'Finding a re-render problem with <Profiler> and fixing it with state colocation',
      scenario: 'A product page has a search box and a heavy "Recommended products" grid (deliberately slow). Typing in the box feels laggy because every keystroke re-renders the grid.',
      steps: [
        'Wrap the grid in <Profiler id="Grid" onRender={...}> and log actualDuration',
        'Type in the "Bad" version: the grid renders on every keystroke (~30 ms each)',
        'Move the input state into its own <SearchBox /> component (colocation)',
        'Type in the "Good" version: the grid renders 0 times while typing',
        'Confirm the same in React DevTools Profiler → "Why did this render?"',
      ],
      code: `// ❌ Bad: query state lives in the parent, so typing re-renders HeavyGrid
function ProductPage() {
  const [query, setQuery] = useState("");
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <HeavyGrid />
    </>
  );
}

// ✅ Good: state colocated in the component that uses it
function SearchBox() {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
function ProductPage() {
  return (
    <>
      <SearchBox />
      <HeavyGrid />
    </>
  );
}`,
      playground: {
        jsx: `const { useState, Profiler, useRef } = React;

function slow(ms) { const end = performance.now() + ms; while (performance.now() < end) {} } // simulate expensive render

function HeavyGrid() {
  slow(30);
  return (
    <div className="grid">
      {["Kurta", "Saree", "Sneakers", "Smartwatch", "Backpack", "Headphones"].map(p => <div key={p} className="tile">{p}</div>)}
    </div>
  );
}

function useRenderStats() {
  const [stats, setStats] = useState({ count: 0, total: 0, last: 0 });
  const pending = useRef({ count: 0, total: 0, last: 0 });
  const onRender = (id, phase, actual) => {
    if (phase === "mount") return;
    const p = pending.current;
    p.count += 1; p.total += actual; p.last = actual;
  };
  const refresh = () => setStats({ ...pending.current });
  const reset = () => { pending.current = { count: 0, total: 0, last: 0 }; setStats(pending.current); };
  return { stats, onRender, refresh, reset };
}

function BadPage({ onRender }) {
  const [query, setQuery] = useState("");
  return (
    <section>
      <h4>❌ Bad: state in parent</h4>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Type fast here…" />
      <Profiler id="Grid-bad" onRender={onRender}><HeavyGrid /></Profiler>
    </section>
  );
}

function SearchBox() {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Type fast here…" />;
}
function GoodPage({ onRender }) {
  return (
    <section>
      <h4>✅ Good: state colocated</h4>
      <SearchBox />
      <Profiler id="Grid-good" onRender={onRender}><HeavyGrid /></Profiler>
    </section>
  );
}

function Stats({ s, refresh, reset }) {
  return (
    <p className="stats">
      Grid re-renders: <b>{s.count}</b> · total time: <b>{s.total.toFixed(0)} ms</b> · last: {s.last.toFixed(1)} ms{" "}
      <button onClick={refresh}>Refresh stats</button> <button onClick={reset}>Reset</button>
    </p>
  );
}

function App() {
  const bad = useRenderStats();
  const good = useRenderStats();
  return (
    <div>
      <BadPage onRender={bad.onRender} />
      <Stats s={bad.stats} refresh={bad.refresh} reset={bad.reset} />
      <GoodPage onRender={good.onRender} />
      <Stats s={good.stats} refresh={good.refresh} reset={good.reset} />
    </div>
  );
}`,
        css: `section { border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; max-width: 460px; }
h4 { margin: 4px 0; }
input { padding: 7px; width: 220px; margin-bottom: 6px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.tile { background: #eef2ff; padding: 10px; border-radius: 6px; text-align: center; font-size: 13px; }
.stats { font-size: 13px; color: #374151; margin: 4px 0 14px; }
.stats button { font-size: 12px; }`,
      },
      result: 'Typing 10 characters in the Bad box and clicking "Refresh stats" shows about 10 grid re-renders and ~300 ms of wasted work (the input also feels sticky). The Good version shows 0 grid re-renders.',
      explanation:
        'Profiler onRender receives actualDuration for every commit of the subtree. In the bad version setQuery re-renders the parent, and therefore HeavyGrid. Moving the state into SearchBox means only SearchBox re-renders. No memo was needed: restructuring is the first and cheapest fix. (Stats are collected in a ref and shown on demand so that the measuring itself does not cause extra renders.)',
    },
    {
      title: 'Memoisation pitfall: React.memo broken by inline objects and functions',
      scenario: 'A teammate wrapped ProductCard in React.memo but the profiler still shows every card re-rendering when the cart count changes. Find out why and fix it.',
      steps: [
        'Render 4 memoised ProductCards and a cart counter in the parent',
        'Pass style={{...}} and onAdd={() => ...} inline: memo never skips (render counts go up)',
        'Fix: move the constant style outside the component and wrap onAdd in useCallback with a functional update',
        'Click "Add" in both versions and compare the render counters',
      ],
      code: `const ProductCard = React.memo(function ProductCard({ product, style, onAdd }) { /* ... */ });

// ❌ new object + new function every render → memo compares by reference → always different
<ProductCard product={p} style={{ border: "1px solid #ddd" }} onAdd={() => setCart(cart + 1)} />

// ✅ stable references
const cardStyle = { border: "1px solid #ddd" };                 // outside the component
const onAdd = useCallback(() => setCart(c => c + 1), []);       // functional update → no deps
<ProductCard product={p} style={cardStyle} onAdd={onAdd} />`,
      playground: {
        jsx: `const { useState, useCallback, memo, useRef } = React;

const PRODUCTS = [
  { id: 1, name: "Cotton Kurta", price: 899 },
  { id: 2, name: "Running Shoes", price: 2499 },
  { id: 3, name: "Steel Bottle", price: 349 },
  { id: 4, name: "Wireless Earbuds", price: 1799 },
];

const ProductCard = memo(function ProductCard({ product, style, onAdd }) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <div className="card" style={style}>
      <b>{product.name}</b> ₹{product.price}
      <button onClick={onAdd}>Add</button>
      <span className="count">renders: {renders.current}</span>
    </div>
  );
});

function BadList() {
  const [cart, setCart] = useState(0);
  return (
    <section>
      <h4>❌ memo + inline props · cart: {cart}</h4>
      {PRODUCTS.map(p => (
        <ProductCard key={p.id} product={p} style={{ borderColor: "#fca5a5" }} onAdd={() => setCart(cart + 1)} />
      ))}
    </section>
  );
}

const goodStyle = { borderColor: "#86efac" };
function GoodList() {
  const [cart, setCart] = useState(0);
  const onAdd = useCallback(() => setCart(c => c + 1), []);
  return (
    <section>
      <h4>✅ memo + stable props · cart: {cart}</h4>
      {PRODUCTS.map(p => <ProductCard key={p.id} product={p} style={goodStyle} onAdd={onAdd} />)}
    </section>
  );
}

function App() {
  return (
    <div className="cols">
      <BadList />
      <GoodList />
    </div>
  );
}`,
        css: `.cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; }
section { border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px; }
h4 { margin: 4px 0 8px; font-size: 14px; }
.card { border: 2px solid; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px; display: flex; gap: 6px; align-items: center; font-size: 13px; flex-wrap: wrap; }
.card button { margin-left: auto; }
.count { font-size: 11px; color: #6b7280; width: 100%; }`,
      },
      result: 'In the left list every "Add" click increases the render count of ALL four cards. In the right list the counts stay at 1 no matter how many times you click.',
      explanation:
        'React.memo does a shallow comparison of props with Object.is. An inline object or arrow function is a new reference on every render, so the comparison always fails and memo only adds overhead. A module-level constant and a useCallback with a functional state update give the same reference every time, so memo can skip. The render counter uses a ref, which does not cause re-renders.',
    },
    {
      title: 'Improving INP with useDeferredValue for a slow filtered list',
      scenario: 'A pincode / city search over 2,000 delivery locations renders slowly. Typing must stay instant (good INP) even though the list updates a little later.',
      steps: [
        'Build a SlowList that takes ~1 ms per 10 items to render',
        'Version A: pass the input value directly: each keystroke blocks typing',
        'Version B: const deferred = useDeferredValue(query) and pass deferred to a memoised SlowList',
        'Show a "Updating…" hint when query !== deferred',
        'Type quickly in both inputs and compare',
      ],
      code: `import { useState, useDeferredValue, memo } from "react";

const SlowList = memo(function SlowList({ query }) { /* expensive render */ });

function Search() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);   // lags behind during typing
  const isStale = query !== deferredQuery;
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <SlowList query={deferredQuery} />
      </div>
    </>
  );
}`,
      playground: {
        jsx: `const { useState, useDeferredValue, memo } = React;

const CITIES = ["Pune", "Mumbai", "Nagpur", "Nashik", "Delhi", "Noida", "Gurugram", "Jaipur", "Indore", "Bhopal", "Chennai", "Kochi", "Bengaluru", "Mysuru", "Hyderabad", "Kolkata", "Patna", "Lucknow", "Surat", "Ahmedabad"];
const LOCATIONS = Array.from({ length: 2000 }, (_, i) => ({
  id: i, city: CITIES[i % CITIES.length], pin: String(110001 + i * 37).slice(0, 6), area: "Sector " + ((i % 60) + 1),
}));

const SlowList = memo(function SlowList({ query }) {
  const start = performance.now();
  while (performance.now() - start < 120) {} // pretend each render is expensive (120 ms)
  const q = query.toLowerCase();
  const items = LOCATIONS.filter(l => l.city.toLowerCase().includes(q) || l.pin.startsWith(q)).slice(0, 50);
  return <ul className="list">{items.map(l => <li key={l.id}>{l.city} · {l.area} · {l.pin}</li>)}</ul>;
});

function Blocking() {
  const [query, setQuery] = useState("");
  return (
    <section>
      <h4>A. Blocking (bad INP)</h4>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Type 'nagpur' quickly" />
      <SlowList query={query} />
    </section>
  );
}

function Deferred() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const stale = query !== deferred;
  return (
    <section>
      <h4>B. useDeferredValue (good INP) {stale && <small>Updating…</small>}</h4>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Type 'nagpur' quickly" />
      <div style={{ opacity: stale ? 0.5 : 1, transition: "opacity .2s" }}>
        <SlowList query={deferred} />
      </div>
    </section>
  );
}

function App() {
  const [tab, setTab] = useState("A");
  return (
    <div>
      <button onClick={() => setTab("A")} aria-pressed={tab === "A"}>Version A</button>
      <button onClick={() => setTab("B")} aria-pressed={tab === "B"}>Version B</button>
      {tab === "A" ? <Blocking /> : <Deferred />}
    </div>
  );
}`,
        css: `button[aria-pressed="true"] { background: #4f46e5; color: white; }
button { margin-right: 6px; padding: 6px 10px; }
section { max-width: 380px; }
input { padding: 8px; width: 240px; }
h4 small { color: #b45309; font-weight: normal; }
.list { max-height: 200px; overflow: auto; font-size: 13px; padding-left: 18px; }`,
      },
      result: 'In Version A each typed letter appears only after the 120 ms render, so fast typing stutters. In Version B the letters appear instantly; the list fades and catches up when you pause.',
      explanation:
        'useDeferredValue gives React two versions of the value: the urgent one for the input and a deferred one for the expensive list. React renders the input update first, then renders the list in the background and abandons that work if another keystroke arrives. SlowList must be memoised, otherwise it re-renders with the urgent update anyway. This directly improves INP. useTransition does the same when you own the state setter.',
    },
    {
      title: 'Images and CLS: measuring layout shift live',
      scenario: 'A product listing loads images without dimensions, so text jumps down when images arrive. Measure CLS with a PerformanceObserver and fix it with width/height, lazy loading and a priority hero.',
      steps: [
        'Register a PerformanceObserver for "layout-shift" entries and sum their values (ignoring shifts right after user input)',
        'Click "Load bad version": images have no width/height, so content jumps',
        'Click "Load good version": width/height (aspect-ratio) reserve space, below-fold images use loading="lazy"',
        'Compare the CLS numbers (good is ≤ 0.1)',
      ],
      code: `// ❌ causes layout shift
<img src={product.image} alt={product.title} />

// ✅ reserves space, lazy-loads, async decode
<img src={product.image} alt={product.title} width="300" height="200"
     loading="lazy" decoding="async" style={{ width: "100%", height: "auto" }} />

// ✅ LCP hero image: never lazy, high priority
<img src={hero} alt="Diwali sale" width="1200" height="400" fetchPriority="high" />`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function useCLS() {
  const [cls, setCls] = useState(0);
  useEffect(() => {
    if (!("PerformanceObserver" in window)) return;
    let total = 0;
    const po = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) { total += entry.value; setCls(total); }
      }
    });
    try { po.observe({ type: "layout-shift", buffered: false }); } catch (e) { return; }
    return () => po.disconnect();
  }, []);
  return [cls, () => setCls(0)];
}

const IDS = [1015, 1018, 1025, 1036, 1043, 1050];

function Gallery({ good, seed }) {
  return (
    <div>
      {IDS.map((id, i) => (
        <figure key={id + "-" + seed}>
          {good ? (
            <img src={"https://picsum.photos/id/" + id + "/600/400?v=" + seed} alt={"Sample photo " + (i + 1)}
              width="600" height="400" loading={i < 2 ? "eager" : "lazy"} decoding="async" fetchpriority={i === 0 ? "high" : undefined} />
          ) : (
            <img src={"https://picsum.photos/id/" + id + "/600/400?v=" + seed} alt={"Sample photo " + (i + 1)} />
          )}
          <figcaption>Product {i + 1}: this text jumps if space is not reserved</figcaption>
        </figure>
      ))}
    </div>
  );
}

function App() {
  const [cls, resetCls] = useCLS();
  const [mode, setMode] = useState(null);
  const [seed, setSeed] = useState(0);
  const run = m => { setMode(null); resetCls(); setTimeout(() => { setSeed(s => s + 1); setMode(m); resetCls(); }, 50); };
  const rating = cls <= 0.1 ? "good" : cls <= 0.25 ? "needs improvement" : "poor";
  return (
    <div>
      <div className="bar">
        <button onClick={() => run("bad")}>Load bad version</button>
        <button onClick={() => run("good")}>Load good version</button>
        <span className={"cls " + rating.split(" ")[0]}>CLS: {cls.toFixed(3)} ({rating})</span>
      </div>
      {mode && <Gallery good={mode === "good"} seed={seed} />}
    </div>
  );
}`,
        css: `.bar { position: sticky; top: 0; background: white; padding: 6px 0; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; z-index: 1; }
.cls { font-weight: 700; padding: 4px 8px; border-radius: 6px; }
.cls.good { background: #dcfce7; } .cls.needs { background: #fef9c3; } .cls.poor { background: #fee2e2; }
figure { margin: 0 0 10px; max-width: 320px; }
img { width: 100%; height: auto; display: block; background: #e5e7eb; border-radius: 8px; }
figcaption { font-size: 13px; color: #374151; }`,
      },
      result: 'The bad version shows captions jumping down as each image arrives and a CLS value well above 0.1 (poor). The good version keeps grey placeholders of the right size, captions never move, and CLS stays near 0.',
      explanation:
        'With width and height attributes plus CSS width:100%/height:auto, the browser computes the aspect ratio before the image downloads and reserves the space. layout-shift entries come from the Layout Instability API, the same source the web-vitals library uses (it also groups shifts into session windows). The first images are eager and the first has high fetch priority because it would be the LCP element; the rest are lazy. (The playground runs React 18, so it uses the plain HTML attribute name fetchpriority; in React 19 JSX write fetchPriority.)',
    },
    {
      title: 'Bundle analysis: finding and removing heavy dependencies',
      scenario: 'The production bundle of an admin app is 1.1 MB. Use a visualizer to find the biggest modules and cut the initial load by more than half.',
      steps: [
        'npm i -D rollup-plugin-visualizer and add it to vite.config.js',
        'Run npm run build: stats.html opens with a treemap of the bundle',
        'Spot heavy items: moment with all locales, full lodash, a chart library used only on /reports',
        'Replace moment with dayjs, use per-function lodash-es imports, lazy-load the reports route',
        'Rebuild and compare sizes; add size-limit to CI so the bundle cannot grow silently',
      ],
      code: `// BEFORE
import moment from "moment";                  // ~70 KB gz incl. locales
import _ from "lodash";                       // ~25 KB gz, not tree-shaken
import Reports from "./pages/Reports";         // recharts inside: ~100 KB gz

// AFTER
import dayjs from "dayjs";                     // ~3 KB gz
import debounce from "lodash-es/debounce";     // only what you use
const Reports = lazy(() => import("./pages/Reports"));   // separate chunk, loaded on demand

// package.json: fail CI if the main chunk grows too much
"size-limit": [{ "path": "dist/assets/index-*.js", "limit": "170 KB" }],
"scripts": { "size": "size-limit" }

// vite.config.js: warn about big chunks
build: { chunkSizeWarningLimit: 500 }`,
      result: 'The treemap shows exactly which packages are large; after the changes the initial chunk shrinks (e.g. 1.1 MB → ~420 KB raw), Lighthouse LCP and TBT improve, and size-limit guards it in every pull request.',
      explanation:
        'You cannot optimise what you cannot see: the visualizer turns the bundle into a picture. Most bundle bloat comes from a few dependencies and from loading rarely used pages eagerly. Code splitting moves code out of the critical path; lighter libraries reduce total bytes; a CI budget prevents regressions. This example has no playground because it needs a real Vite build.',
    },
  ],
  interview: [
    { q: 'How do you approach a "the app is slow" complaint?', a: 'Reproduce and measure in a production build with throttling: Lighthouse/Web Vitals for load metrics, React DevTools Profiler and Chrome Performance panel for interactions. Identify the biggest bottleneck (bundle, network waterfall, re-renders, long tasks, images), fix it, and measure again; then add monitoring and budgets.', level: 'Medium' },
    { q: 'What are the Core Web Vitals and their good thresholds?', a: 'LCP (Largest Contentful Paint) ≤ 2.5 s, INP (Interaction to Next Paint) ≤ 200 ms, CLS (Cumulative Layout Shift) ≤ 0.1, measured at the 75th percentile of real page loads. INP replaced FID in March 2024.', level: 'Easy' },
    { q: 'Lighthouse score vs field data: which matters more?', a: 'Field data (CrUX, web-vitals RUM) reflects real users and is what Google uses for ranking. Lighthouse is a lab test on a simulated device: useful for debugging and for CI regression checks, but it can differ from reality.', level: 'Medium' },
    { q: 'What does the React Profiler tell you?', a: 'Which components rendered in each commit, how long each took (actual vs base duration), how often, and why they rendered (props/state/hooks/parent changed). It helps find unnecessary or expensive renders.', level: 'Easy' },
    { q: 'Why might React.memo not prevent a re-render?', a: 'Because a prop changes reference on every render: inline objects/arrays/functions, JSX children, or a context the component consumes changed. memo compares props shallowly with Object.is.', level: 'Medium' },
    { q: 'When should you NOT use useMemo or useCallback?', a: 'For cheap computations, for values not passed to memoised children or effect dependencies, and before measuring. They cost memory and comparison time, make code harder to read, and can hide stale-dependency bugs. The React Compiler can also do it automatically.', level: 'Medium' },
    { q: 'What is state colocation and why does it help performance?', a: 'Keeping state in the lowest component that needs it. Updates then re-render only that small subtree instead of a large parent and all its children; it is often a better fix than memoisation.', level: 'Medium' },
    { q: 'How would you reduce LCP in a React SPA?', a: 'Smaller initial bundle (code splitting, lighter deps), preload and prioritise the hero image (fetchpriority="high", correct size, WebP/AVIF, CDN), avoid lazy-loading the LCP image, reduce TTFB with caching/CDN, avoid API waterfalls before first paint, or use SSR/SSG (Next.js) for content pages.', level: 'Hard' },
    { q: 'How do you prevent CLS from images and dynamic content?', a: 'Set width and height (or aspect-ratio) on images and embeds, reserve space for ads/banners/skeletons, avoid inserting content above existing content, use font-display: swap with fallback metrics, and animate with transform instead of layout properties.', level: 'Medium' },
    { q: 'How do you analyse the bundle in a Vite project?', a: 'Use rollup-plugin-visualizer (or vite-bundle-visualizer / source-map-explorer) to get a treemap after npm run build, find large modules, then code split, replace heavy libraries, fix non-tree-shakeable imports, and enforce a budget with size-limit in CI.', level: 'Easy' },
    { q: 'useDeferredValue vs debounce?', a: 'Debounce waits a fixed time before doing work at all. useDeferredValue lets React render the urgent update immediately and render the expensive part in the background with interruptible rendering, adapting to the device speed with no fixed delay. Debounce is still right for limiting network requests.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a useWhyDidYouUpdate(name, props) hook that logs which props changed reference since the last render. Use it inside a memoised component that receives an inline object.',
      hint: 'Store previous props in a ref; compare keys with Object.is in an effect.',
      solution: `const { useEffect, useRef, useState, memo } = React;
function useWhyDidYouUpdate(name, props) {
  const prev = useRef();
  useEffect(() => {
    if (prev.current) {
      const changed = {};
      Object.keys({ ...prev.current, ...props }).forEach(k => {
        if (!Object.is(prev.current[k], props[k])) changed[k] = { from: prev.current[k], to: props[k] };
      });
      if (Object.keys(changed).length) console.log("[why-did-you-update]", name, changed);
    }
    prev.current = props;
  });
}
const Card = memo(function Card(props) {
  useWhyDidYouUpdate("Card", props);
  return <div style={props.style}>{props.title}</div>;
});
function App() {
  const [n, setN] = useState(0);
  return (
    <div>
      <button onClick={() => setN(n + 1)}>Re-render parent ({n})</button>
      <Card title="Kurta" style={{ color: "teal" }} />
    </div>
  );
}`,
    },
    {
      task: 'Report web vitals without a library: log LCP using PerformanceObserver("largest-contentful-paint") and show the value with a good/poor rating for a page with a large hero image.',
      hint: 'Use buffered: true and take the last entry startTime.',
      solution: `const { useEffect, useState } = React;
function App() {
  const [lcp, setLcp] = useState(null);
  useEffect(() => {
    const po = new PerformanceObserver(list => {
      const entries = list.getEntries();
      setLcp(entries[entries.length - 1].startTime);
    });
    try { po.observe({ type: "largest-contentful-paint", buffered: true }); } catch {}
    return () => po.disconnect();
  }, []);
  const rating = lcp == null ? "" : lcp <= 2500 ? "good" : lcp <= 4000 ? "needs improvement" : "poor";
  return (
    <div>
      <p>LCP: {lcp == null ? "measuring…" : Math.round(lcp) + " ms (" + rating + ")"}</p>
      <img src="https://picsum.photos/id/1040/1200/500" alt="Hero" width="1200" height="500" fetchpriority="high" style={{ width: "100%", height: "auto" }} />
    </div>
  );
}`,
    },
    {
      task: 'Fix this context so that components reading only "theme" do not re-render when "cart" changes: <AppContext.Provider value={{ theme, setTheme, cart, setCart }}>',
      hint: 'Split into two contexts and memoise each value.',
      solution: `const { createContext, useContext, useMemo, useState, useRef } = React;
const ThemeContext = createContext(null);
const CartContext = createContext(null);
function Providers({ children }) {
  const [theme, setTheme] = useState("light");
  const [cart, setCart] = useState([]);
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  const cartValue = useMemo(() => ({ cart, setCart }), [cart]);
  return (
    <ThemeContext.Provider value={themeValue}>
      <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>
    </ThemeContext.Provider>
  );
}
const ThemeBadge = React.memo(function ThemeBadge() {
  const { theme } = useContext(ThemeContext);
  const r = useRef(0); r.current++;
  return <p>Theme: {theme} (renders: {r.current})</p>;
});
function CartButton() {
  const { cart, setCart } = useContext(CartContext);
  return <button onClick={() => setCart(c => [...c, "item"])}>Cart ({cart.length})</button>;
}
function App() {
  return <Providers><ThemeBadge /><CartButton /></Providers>;
}`,
    },
    {
      task: 'Build a responsive product image component that uses srcSet and sizes from picsum.photos (400, 800, 1200 widths), reserves space, lazy-loads unless priority is true, and shows a skeleton until loaded.',
      hint: 'onLoad sets a loaded flag; use aspect-ratio for the wrapper.',
      solution: `const { useState } = React;
function ProductImage({ id, alt, priority = false }) {
  const [loaded, setLoaded] = useState(false);
  const url = w => "https://picsum.photos/id/" + id + "/" + w + "/" + Math.round(w * 0.75);
  return (
    <div style={{ aspectRatio: "4 / 3", background: loaded ? "none" : "#e5e7eb", borderRadius: 8, overflow: "hidden", maxWidth: 400 }}>
      <img
        src={url(800)}
        srcSet={url(400) + " 400w, " + url(800) + " 800w, " + url(1200) + " 1200w"}
        sizes="(max-width: 600px) 100vw, 400px"
        width="800" height="600" alt={alt}
        loading={priority ? "eager" : "lazy"} decoding="async"
        onLoad={() => setLoaded(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: loaded ? 1 : 0, transition: "opacity .3s" }}
      />
    </div>
  );
}
function App() {
  return <div><ProductImage id={1080} alt="Strawberries" priority /><ProductImage id={292} alt="Vegetables" /></div>;
}`,
    },
  ],
  quiz: [
    { question: 'Which metric replaced FID as a Core Web Vital in 2024?', options: ['TTFB', 'FCP', 'INP', 'TBT'], answer: 2, explanation: 'INP (Interaction to Next Paint) measures responsiveness across the whole visit and replaced FID in March 2024.' },
    { question: 'A memoised child still re-renders on every parent render. The most likely reason is...', options: ['React.memo is broken', 'An inline object or arrow function prop creates a new reference each render', 'The child has no state', 'The parent uses useEffect'], answer: 1, explanation: 'memo compares props by reference; new objects/functions are always "different".' },
    { question: 'What should you do to the LCP hero image?', options: ['Load it eagerly with high fetch priority and correct dimensions', 'Add loading="lazy"', 'Load it with JavaScript after the page renders', 'Convert it to a CSS background with no size'], answer: 0, explanation: 'The LCP image should start downloading as early as possible and never be lazy-loaded.' },
    { question: 'Which change prevents layout shift from images?', options: ['Using PNG instead of JPEG', 'Adding alt text', 'Wrapping images in React.memo', 'Setting width and height (or aspect-ratio)'], answer: 3, explanation: 'Known dimensions let the browser reserve space before the image loads.' },
    { question: 'What is the FIRST step when optimising React performance?', options: ['Wrap every component in React.memo', 'Measure with the Profiler / Lighthouse in a production build', 'Rewrite the app in another framework', 'Add useCallback to every function'], answer: 1, explanation: 'Measure first so you fix the real bottleneck.' },
  ],
};
