export default {
  id: 'day-25-code-splitting-lazy-suspense',
  title: 'Code Splitting: React.lazy, Suspense and Performance Optimization',
  module: 'Module 5: Advanced React',
  day: 25,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'Large apps ship large JavaScript bundles that slow down the first load. Code splitting breaks the bundle into smaller chunks that load on demand. Learn dynamic import(), React.lazy, Suspense fallbacks, route-based splitting and a practical performance checklist.',
  objectives: [
    'Explain bundles, chunks and why bundle size affects load time',
    'Load components on demand with dynamic import() and React.lazy',
    'Show loading UI with Suspense and nested Suspense boundaries',
    'Apply route-based and interaction-based code splitting',
    'Use a performance checklist: useTransition, list virtualization, image optimisation, bundle analysis',
  ],
  theory: [
    {
      heading: 'Bundles and why size matters',
      content:
        'When you run `npm run build`, Vite (or webpack) **bundles** all your modules into a few JavaScript files. By default, everything the app might ever need goes into one main bundle: the admin panel, the charts library, the PDF exporter...\n\nThe browser must **download, parse and execute** all that code before the user sees anything interactive. On a slow mobile network, a 2 MB bundle can mean several seconds of blank screen.\n\n**Code splitting** splits the bundle into **chunks**. The initial chunk contains only what the first screen needs. Other chunks are downloaded **later, when needed**.\n\nAnalogy: a restaurant does not cook every dish on the menu when you sit down. It serves the starter first and cooks the main course when you order it.',
    },
    {
      heading: 'Dynamic import()',
      content:
        'A normal `import Chart from \'./Chart\'` is **static**: it is always included in the bundle.\n\n`import(\'./Chart\')` is a **dynamic import**: a function call that returns a **Promise** resolving to the module. Bundlers see it and automatically create a separate chunk for `Chart` and everything only it uses.\n\nYou can use it for anything, not just components: `const { jsPDF } = await import(\'jspdf\')` inside a click handler loads a heavy library only when the user clicks "Export PDF".',
      syntax:
        "button.onclick = async () => {\n  const { formatReport } = await import('./reportUtils.js'); // separate chunk\n  formatReport(data);\n};",
    },
    {
      heading: 'React.lazy and Suspense',
      content:
        '`React.lazy(() => import(\'./Settings\'))` creates a component that loads its code the first time it is rendered. The module must have a **default export** that is a component.\n\nWhile the chunk is downloading, the lazy component **suspends**. You must wrap it (at any level above) in `<Suspense fallback={...}>`. React shows the fallback (spinner, skeleton) until the code arrives, then renders the real component.\n\nRules:\n- Declare lazy components at the **top level of a module**, never inside another component (or they would be recreated every render and lose state)\n- One Suspense can wrap many lazy components\n- Nested Suspense boundaries let different parts show their own loading states',
      syntax:
        "import { lazy, Suspense } from 'react';\n\nconst Settings = lazy(() => import('./Settings'));\n\nfunction App() {\n  return (\n    <Suspense fallback={<p>Loading settings...</p>}>\n      <Settings />\n    </Suspense>\n  );\n}",
      tip: 'For named exports use: lazy(() => import("./Charts").then(m => ({ default: m.BarChart }))).',
    },
    {
      heading: 'Route-based splitting',
      content:
        'The best place to start splitting is **routes**: users visit one page at a time, so each page can be its own chunk.\n\nWrap `<Routes>` in a Suspense with a page-level fallback, and make every page lazy. The home page code loads immediately; `/admin` code loads only when someone opens `/admin`.\n\nOther good candidates:\n- Modals and drawers that open on click\n- Heavy widgets: charts, maps, rich text editors, code editors\n- Admin-only or rarely used features',
      syntax:
        "const Home = lazy(() => import('./pages/Home'));\nconst Dashboard = lazy(() => import('./pages/Dashboard'));\nconst Admin = lazy(() => import('./pages/Admin'));\n\n<Suspense fallback={<PageSpinner />}>\n  <Routes>\n    <Route path=\"/\" element={<Home />} />\n    <Route path=\"/dashboard\" element={<Dashboard />} />\n    <Route path=\"/admin\" element={<Admin />} />\n  </Routes>\n</Suspense>",
    },
    {
      heading: 'Handling load errors and preloading',
      content:
        'A chunk download can fail (offline, new deployment removed old files). Without handling, the app crashes. Wrap lazy areas in an **Error Boundary** (Day 26) that shows "Failed to load, retry".\n\n**Preloading** hides the delay: start the import before the user needs it, for example on mouse hover over a link:\n\n`const loadAdmin = () => import(\'./pages/Admin\');`\n`const Admin = lazy(loadAdmin);`\n`<Link to="/admin" onMouseEnter={loadAdmin}>Admin</Link>`\n\nThe browser caches the module, so when lazy calls the same import it resolves instantly.',
    },
    {
      heading: 'Performance optimization checklist',
      content:
        '1. **Measure**: Lighthouse, Chrome Performance tab, React DevTools Profiler; analyse bundles with `rollup-plugin-visualizer` / `vite-bundle-visualizer`\n2. **Split code**: routes, modals, heavy libraries\n3. **Avoid unnecessary renders**: state colocation, React.memo/useMemo/useCallback (Day 18)\n4. **Keep typing responsive**: `useTransition` / `useDeferredValue` mark expensive updates as non-urgent\n5. **Virtualize long lists**: render only visible rows (react-window, TanStack Virtual)\n6. **Optimise assets**: compressed images (WebP/AVIF), `loading="lazy"` on images, proper sizes\n7. **Use production builds**: development mode is much slower and larger\n8. **Trim dependencies**: import only what you use (`lodash-es` per function), prefer smaller libraries\n\nThe playground can load React.lazy with a simulated delay (a Promise + setTimeout) because it does not have separate files, so you can see Suspense in action.\n\nComing next: Day 26 covers Error Boundaries and Portals.',
    },
  ],
  examples: [
    {
      title: 'React.lazy + Suspense with a simulated slow chunk',
      scenario: 'A "Reports" panel is heavy. It loads only when the user clicks "Show reports". A fallback is shown while loading.',
      steps: [
        'In a real project, move Reports into Reports.jsx with export default',
        'Create const Reports = React.lazy(() => import("./Reports"))',
        'Render <Reports /> inside <Suspense fallback={...}> only after a click',
        'In the playground, the import is simulated with a Promise that resolves after 1.5 s',
        'Run and click "Show reports"',
      ],
      code: `// Reports.jsx
export default function Reports() {
  return <table>...</table>;
}

// App.jsx
import { lazy, Suspense, useState } from 'react';
const Reports = lazy(() => import('./Reports'));   // separate chunk

export default function App() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(true)}>Show reports</button>
      {show && (
        <Suspense fallback={<p>Loading reports...</p>}>
          <Reports />
        </Suspense>
      )}
    </>
  );
}`,
      playground: {
        jsx: `const { lazy, Suspense, useState } = React;

// Simulates import('./Reports') taking 1.5 seconds on a slow network
function fakeImport(component, ms) {
  return () => new Promise(resolve => setTimeout(() => resolve({ default: component }), ms));
}

function ReportsTable() {
  const rows = [['January', 42000], ['February', 51000], ['March', 47500]];
  return (
    <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', marginTop: 8 }}>
      <thead><tr><th>Month</th><th>Revenue (Rs)</th></tr></thead>
      <tbody>{rows.map(([m, r]) => <tr key={m}><td>{m}</td><td>{r}</td></tr>)}</tbody>
    </table>
  );
}

// Declared at module top level (never inside a component)
const Reports = lazy(fakeImport(ReportsTable, 1500));

function App() {
  const [show, setShow] = useState(false);
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h3>Dashboard</h3>
      <button onClick={() => setShow(true)} disabled={show}>Show reports</button>
      {show && (
        <Suspense fallback={<p>Loading reports chunk...</p>}>
          <Reports />
        </Suspense>
      )}
    </div>
  );
}`,
      },
      result: 'After clicking "Show reports", "Loading reports chunk..." appears for 1.5 seconds, then the revenue table. Clicking again later would be instant because the module is cached.',
      explanation:
        'React.lazy calls the loader function on first render and suspends until the Promise resolves with { default: Component }. Suspense shows the fallback meanwhile. The real import() works the same, with the bundler creating a separate file.',
    },
    {
      title: 'Route-based splitting with nested Suspense boundaries',
      scenario: 'Three "pages" are lazy. The header stays visible while a page loads, and a slow widget inside the Stats page has its own smaller fallback.',
      steps: [
        'Make Home, Stats and Settings lazy components',
        'Wrap the page area (not the header) in one Suspense with a page fallback',
        'Inside Stats, wrap a slow Chart in its own Suspense',
        'Run and switch pages: first visit shows the fallback, later visits are instant',
      ],
      code: `const Home = lazy(() => import('./pages/Home'));
const Stats = lazy(() => import('./pages/Stats'));
const Settings = lazy(() => import('./pages/Settings'));

export default function App() {
  return (
    <>
      <Header />                                  {/* always visible */}
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </>
  );
}

// pages/Stats.jsx
const Chart = lazy(() => import('../widgets/Chart'));
export default function Stats() {
  return (
    <>
      <h2>Stats</h2>
      <Suspense fallback={<p>Loading chart...</p>}><Chart /></Suspense>
    </>
  );
}`,
      playground: {
        jsx: `const { lazy, Suspense, useState } = React;
const delay = (C, ms) => () => new Promise(r => setTimeout(() => r({ default: C }), ms));

const Chart = lazy(delay(function Chart() {
  const data = [30, 80, 45, 60, 95];
  return (
    <svg width="220" height="100" style={{ background: '#f4f4f4' }}>
      {data.map((v, i) => <rect key={i} x={10 + i * 42} y={100 - v} width="30" height={v} fill="teal" />)}
    </svg>
  );
}, 1500));

const Home = lazy(delay(() => <h2>Home page</h2>, 800));
const Settings = lazy(delay(() => <h2>Settings page</h2>, 800));
const Stats = lazy(delay(function Stats() {
  return (
    <div>
      <h2>Stats page</h2>
      <Suspense fallback={<p>Loading chart...</p>}><Chart /></Suspense>
    </div>
  );
}, 800));

const pages = { home: Home, stats: Stats, settings: Settings };

function App() {
  const [page, setPage] = useState('home');
  const Page = pages[page];
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', gap: 8, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
        {Object.keys(pages).map(p => (
          <button key={p} onClick={() => setPage(p)} style={{ fontWeight: p === page ? 'bold' : 'normal' }}>{p}</button>
        ))}
      </header>
      <Suspense fallback={<p style={{ color: '#888' }}>Loading page...</p>}>
        <Page />
      </Suspense>
    </div>
  );
}`,
      },
      result: 'The header always stays. The first time you open each page you see "Loading page..."; on the Stats page the heading appears first and the chart shows "Loading chart..." a bit longer. Revisiting pages is instant.',
      explanation:
        'Suspense boundaries define which part of the UI is replaced by a fallback. Putting the boundary below the header keeps navigation visible. The nested boundary lets the Stats page show its content before the slow chart finishes.',
    },
    {
      title: 'Keep typing smooth with useTransition',
      scenario: 'Filtering 10,000 items on every keystroke makes the input lag. Marking the list update as a transition keeps the input responsive.',
      steps: [
        'Keep two states: the input text (urgent) and the filter query (non-urgent)',
        'Update the input immediately with setText',
        'Wrap setQuery in startTransition',
        'Show a hint while isPending is true',
        'Run and type quickly',
      ],
      code: `const [text, setText] = useState('');
const [query, setQuery] = useState('');
const [isPending, startTransition] = useTransition();

function onChange(e) {
  setText(e.target.value);                 // urgent: update the input now
  startTransition(() => setQuery(e.target.value)); // can wait
}`,
      playground: {
        jsx: `const { useState, useTransition, useMemo } = React;
const ITEMS = Array.from({ length: 10000 }, (_, i) => 'Product #' + (i + 1));

function SlowList({ query }) {
  const filtered = useMemo(() => ITEMS.filter(x => x.includes(query)), [query]);
  return (
    <ul style={{ height: 180, overflow: 'auto' }}>
      {filtered.slice(0, 300).map(item => {
        const start = performance.now();
        while (performance.now() - start < 0.02) {} // simulate a slow row
        return <li key={item}>{item}</li>;
      })}
    </ul>
  );
}

function App() {
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  function onChange(e) {
    setText(e.target.value);
    startTransition(() => setQuery(e.target.value));
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <input value={text} onChange={onChange} placeholder="Type e.g. 99" />
      {isPending && <span style={{ marginLeft: 8, color: '#888' }}>updating list...</span>}
      <SlowList query={query} />
    </div>
  );
}`,
      },
      result: 'The input updates instantly while typing; the list catches up shortly after, with "updating list..." visible during the update.',
      explanation:
        'Updates inside startTransition are low priority and can be interrupted by urgent updates such as typing. React renders the new list in the background and keeps showing the old list until it is ready.',
    },
  ],
  interview: [
    { q: 'What is code splitting?', a: 'Splitting the JavaScript bundle into smaller chunks that are loaded on demand, so the initial download contains only what the first screen needs.', level: 'Easy' },
    { q: 'What does React.lazy do?', a: 'It takes a function returning a dynamic import() Promise and returns a component that loads its code on first render. The module must default-export a component.', level: 'Easy' },
    { q: 'Why is Suspense required with React.lazy?', a: 'While the chunk is loading the lazy component suspends; React needs the nearest Suspense boundary to know what fallback UI to show in the meantime. Without it React throws an error.', level: 'Medium' },
    { q: 'What is a dynamic import?', a: 'import("./module") called as a function. It returns a Promise for the module and tells the bundler to create a separate chunk.', level: 'Easy' },
    { q: 'Where should you apply code splitting first?', a: 'At route level, then large rarely used components (modals, editors, charts, admin features) and heavy third-party libraries used only in some interactions.', level: 'Medium' },
    { q: 'Why must lazy components be declared outside other components?', a: 'If declared inside, a new lazy component is created on every render, causing remounting, lost state and repeated loading.', level: 'Medium' },
    { q: 'How do you lazy-load a named export?', a: 'lazy(() => import("./Charts").then(module => ({ default: module.BarChart }))).', level: 'Hard' },
    { q: 'How do you handle a chunk that fails to load?', a: 'Wrap the lazy component in an Error Boundary that renders a retry message; optionally retry the import or reload the page after deployments.', level: 'Hard' },
    { q: 'What is preloading in the context of lazy components?', a: 'Calling the import function early (e.g. on hover or after idle) so the chunk is already cached when the component renders, removing the visible loading delay.', level: 'Medium' },
    { q: 'What do useTransition and useDeferredValue do?', a: 'They mark state updates (or derived values) as non-urgent so React can keep urgent updates like typing responsive and render expensive updates in the background.', level: 'Hard' },
    { q: 'What is list virtualization?', a: 'Rendering only the rows visible in the viewport (plus a small buffer) for very long lists, using libraries like react-window or TanStack Virtual, to keep DOM size small.', level: 'Medium' },
    { q: 'How can you see what makes your bundle large?', a: 'Use a bundle analyzer (rollup-plugin-visualizer / vite-bundle-visualizer, source-map-explorer) after a production build to see each module\'s size.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Convert a Vite + React Router app with Home, About, Blog and Admin pages to route-based code splitting with a single page-level spinner.',
      hint: 'Every page becomes lazy(() => import("./pages/X")); wrap Routes in Suspense.',
      solution: `import { lazy, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const Admin = lazy(() => import('./pages/Admin'));

function Spinner() { return <div className="spinner">Loading...</div>; }

export default function App() {
  return (
    <>
      <nav><Link to="/">Home</Link> <Link to="/about">About</Link> <Link to="/blog">Blog</Link> <Link to="/admin">Admin</Link></nav>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </>
  );
}`,
    },
    {
      task: 'Lazy-load a modal component only when the user clicks "Open", and preload it when the mouse hovers over the button.',
      hint: 'Keep the loader function in a variable and call it on onMouseEnter.',
      solution: `import { lazy, Suspense, useState } from 'react';

const loadModal = () => import('./BigModal');
const BigModal = lazy(loadModal);

export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onMouseEnter={loadModal} onFocus={loadModal} onClick={() => setOpen(true)}>Open</button>
      {open && (
        <Suspense fallback={<p>Opening...</p>}>
          <BigModal onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}`,
    },
    {
      task: 'In the playground, create two lazy components with fake delays (1s and 3s) inside ONE Suspense, then change it to TWO separate Suspense boundaries. Describe the difference.',
      hint: 'One boundary waits for all children; separate boundaries reveal independently.',
      solution: `const { lazy, Suspense } = React;
const delay = (C, ms) => () => new Promise(r => setTimeout(() => r({ default: C }), ms));
const Fast = lazy(delay(() => <p>Fast widget (1s)</p>, 1000));
const Slow = lazy(delay(() => <p>Slow widget (3s)</p>, 3000));

function App() {
  return (
    <div>
      <h4>One boundary: both appear together after 3s</h4>
      <Suspense fallback={<p>Loading both...</p>}><Fast /><Slow /></Suspense>
      <h4>Two boundaries: fast appears after 1s, slow after 3s</h4>
      <Suspense fallback={<p>Loading fast...</p>}><Fast /></Suspense>
      <Suspense fallback={<p>Loading slow...</p>}><Slow /></Suspense>
    </div>
  );
}`,
    },
    {
      task: 'Load a heavy utility only when needed: when the user clicks "Export CSV", dynamically import a module that converts an array of objects to CSV and download it.',
      hint: 'const { toCSV } = await import("./csv.js") inside an async click handler.',
      solution: `// csv.js
export function toCSV(rows) {
  const headers = Object.keys(rows[0]);
  const lines = rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','));
  return [headers.join(','), ...lines].join('\\n');
}

// ExportButton.jsx
export default function ExportButton({ rows }) {
  async function handleExport() {
    const { toCSV } = await import('./csv.js');       // separate chunk, loaded on click
    const blob = new Blob([toCSV(rows)], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'report.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return <button onClick={handleExport}>Export CSV</button>;
}`,
    },
  ],
  quiz: [
    {
      question: 'What does import("./Settings") return?',
      options: ['The Settings component directly', 'A Promise that resolves to the module', 'A string path', 'undefined until the page reloads'],
      answer: 1,
      explanation: 'Dynamic import returns a Promise for the module object.',
    },
    {
      question: 'What must the module loaded by React.lazy export?',
      options: ['A named export called Component', 'A JSON object', 'A default export that is a React component', 'Nothing'],
      answer: 2,
      explanation: 'React.lazy expects { default: Component }.',
    },
    {
      question: 'What does Suspense\'s fallback prop define?',
      options: ['The UI shown while children are loading', 'The error message on crash', 'The route to redirect to', 'The CSS class for loading'],
      answer: 0,
      explanation: 'fallback renders until lazy children are ready.',
    },
    {
      question: 'Which is usually the best first place to split code?',
      options: ['Every button', 'The root App component', 'CSS files', 'Routes/pages'],
      answer: 3,
      explanation: 'Users view one page at a time, so routes are natural split points.',
    },
    {
      question: 'Which hook marks a state update as non-urgent to keep typing responsive?',
      options: ['useMemo', 'useTransition', 'useLayoutEffect', 'useRef'],
      answer: 1,
      explanation: 'startTransition from useTransition lowers the priority of updates.',
    },
  ],
};
