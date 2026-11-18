export default {
  id: 'day-09-loading-ui-error-boundaries-not-found',
  title: 'Loading UI, Error Boundaries (error.js), not-found',
  module: 'Module 2: Data & Rendering',
  day: 9,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Next.js turns three special files into React boundaries for each route segment: loading.js (a Suspense fallback), error.js (an Error Boundary with a retry button) and not-found.js (the 404 UI shown by notFound()). Learn where to put them, how they nest, and their limits.',
  objectives: [
    'Create instant loading states with loading.js and explain how it wraps page.js in Suspense',
    'Handle runtime errors per segment with error.js ("use client", error and reset props)',
    'Know which errors a segment\'s error.js can catch (and why the layout of the same segment is not covered), and use global-error.js',
    'Show 404 pages with not-found.js and the notFound() function',
    'Design a resilient route hierarchy with the right boundary at the right level',
  ],
  theory: [
    {
      heading: 'loading.js: instant loading UI',
      content:
        'Put a `loading.js` file in a route folder and Next.js automatically wraps that segment\'s `page.js` (and child segments) in a **`<Suspense>` boundary** whose fallback is your loading component.\n\nThe component hierarchy of a segment is:\n\n```\n<Layout>\n  <Template>\n    <ErrorBoundary fallback={<Error />}>\n      <Suspense fallback={<Loading />}>\n        <ErrorBoundary fallback={<NotFound />}>\n          <Page />\n```\n\nWhat you get:\n- On navigation the loading UI shows **immediately** (it is prefetched), while the page\'s data loads on the server\n- Shared layouts stay interactive during loading\n- The page streams in when ready\n\n`loading.js` is a Server Component by default, so use simple markup or skeletons. For finer control (several independent sections) use your own `<Suspense>` boundaries inside the page (Day 8).\n\nAnalogy: a "Your food is being prepared" sign at the counter. You know something is happening and can still look around the shop (layout).',
      syntax:
        "// app/dashboard/loading.js\nexport default function Loading() {\n  return <div className=\"animate-pulse h-40 rounded bg-gray-200\" />;\n}",
    },
    {
      heading: 'error.js: error boundaries per segment',
      content:
        '`error.js` creates a **React Error Boundary** around the segment\'s page and children. If rendering or data fetching throws, the rest of the app (layouts, navigation) keeps working and only that segment shows your error UI.\n\nRules:\n- `error.js` **must be a Client Component** (`"use client"`), because error boundaries are a client-side React feature\n- It receives `error` (an Error object) and `reset` (a function that re-renders the segment to try again)\n- In production, errors thrown in Server Components are sanitised: `error.message` is a generic message and `error.digest` is a hash you can match with server logs (secrets never leak)\n- Errors bubble up to the **nearest parent** error boundary\n\nAnalogy: a circuit breaker for one room. A short circuit in the kitchen trips only the kitchen breaker; the lights in the rest of the house stay on, and you can flip it back (reset).',
      syntax:
        "// app/dashboard/error.js\n'use client';\nimport { useEffect } from 'react';\n\nexport default function Error({ error, reset }) {\n  useEffect(() => {\n    console.error(error); // send to a logging service\n  }, [error]);\n  return (\n    <div>\n      <h2>Something went wrong</h2>\n      <button onClick={() => reset()}>Try again</button>\n    </div>\n  );\n}",
    },
    {
      heading: 'What error.js does not catch, and global-error.js',
      content:
        'Because `error.js` sits **inside** the segment\'s layout in the hierarchy, it **cannot catch errors thrown by the `layout.js` (or `template.js`) of the same segment**. Those bubble to the parent segment\'s `error.js`.\n\nSo `app/error.js` does **not** catch errors from the **root** layout. For that, add **`app/global-error.js`**: it replaces the root layout when active, so it must render its own `<html>` and `<body>`. It is only used in production builds (in dev you see the error overlay).\n\nError boundaries also do **not** catch errors in event handlers or async code inside `useEffect` — handle those with `try/catch` and state, as in plain React. Errors thrown in Server Actions are surfaced to the nearest boundary.',
      syntax:
        "// app/global-error.js\n'use client';\nexport default function GlobalError({ error, reset }) {\n  return (\n    <html>\n      <body>\n        <h2>The application crashed</h2>\n        <button onClick={() => reset()}>Reload</button>\n      </body>\n    </html>\n  );\n}",
    },
    {
      heading: 'not-found.js and notFound()',
      content:
        'Two ways a 404 happens:\n1. **No route matches** the URL → Next.js renders `app/not-found.js` (or the built-in 404) with status 404\n2. **The route exists, but the data does not** (e.g. `/products/999999`) → call **`notFound()`** from `next/navigation` inside a Server Component. It throws a special error that renders the **nearest** `not-found.js` and sets the HTTP status to 404 (and adds `noindex`)\n\n`not-found.js` does not receive props. If you need the missing slug, read it with `usePathname()` in a client component, or show a generic message.\n\nUse `notFound()` instead of rendering "Product not found" with status 200: search engines would index broken pages otherwise.\n\nAnalogy: a library. If the shelf (route) does not exist, the librarian says "no such section". If the shelf exists but the book (record) is missing, the librarian checks and says "this book is not in our catalogue" — still a "not found", just discovered later.',
      syntax:
        "// app/products/[id]/page.js\nimport { notFound } from 'next/navigation';\n\nexport default async function Product({ params }) {\n  const { id } = await params;\n  const res = await fetch(`https://dummyjson.com/products/${id}`);\n  if (res.status === 404) notFound();\n  if (!res.ok) throw new Error('Failed to load product');\n  const product = await res.json();\n  return <h1>{product.title}</h1>;\n}",
      tip: 'notFound() and redirect() work by throwing special errors. Do not wrap them in a try/catch that swallows errors, or they will stop working. Call them outside try blocks (or rethrow).',
    },
    {
      heading: 'Designing boundaries for a route tree',
      content:
        '- `app/not-found.js` → a branded 404 for the whole site\n- `app/error.js` → a generic fallback for any page error\n- `app/global-error.js` → last line of defence for root layout crashes\n- `app/dashboard/loading.js` + `app/dashboard/error.js` → dashboard-specific skeleton and error messages, so the site header still works\n- Deep, data-heavy segments (`app/dashboard/reports/[id]/`) get their own `loading.js`, `error.js` and `not-found.js`\n\nThe nearest file wins, so specific segments override generic ones.\n\nComing next (Day 10): Route Handlers — building REST API endpoints with `route.js`.',
    },
  ],
  examples: [
    {
      title: 'A route segment with loading, error and not-found',
      scenario: 'The /users/[id] page loads a user. It must show a skeleton while loading, a retry button on failure and a 404 for unknown ids.',
      steps: [
        'Create app/users/[id]/page.js that fetches the user, calls notFound() for 404, throws on other errors',
        'Create app/users/[id]/loading.js with a skeleton',
        'Create app/users/[id]/error.js with "use client" and a reset button',
        'Create app/users/[id]/not-found.js',
        'Run the playground: a simulation with a real React Suspense + Error Boundary, choose success, slow, error or 404',
      ],
      code: `app/users/[id]/
├── page.js
├── loading.js
├── error.js
└── not-found.js

// page.js
import { notFound } from 'next/navigation';

export default async function UserPage({ params }) {
  const { id } = await params;
  const res = await fetch(\`https://jsonplaceholder.typicode.com/users/\${id}\`, { cache: 'no-store' });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error('User service is down');
  const user = await res.json();
  return (
    <section>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </section>
  );
}

// loading.js
export default function Loading() {
  return <p className="animate-pulse">Loading user...</p>;
}

// error.js
'use client';
export default function Error({ error, reset }) {
  return (
    <div role="alert">
      <p>Could not load the user: {error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

// not-found.js
import Link from 'next/link';
export default function NotFound() {
  return (
    <div>
      <h2>User not found</h2>
      <Link href="/users">Back to all users</Link>
    </div>
  );
}`,
      playground: {
        jsx: `// SIMULATION: how Next.js wraps a segment. Real React Suspense + a real class
// Error Boundary, with a fake "server fetch" that can succeed, be slow, fail or 404.
const { Suspense, useState } = React;

class NotFoundError extends Error {}
function notFound() { throw new NotFoundError('NEXT_NOT_FOUND'); }

class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { error: null }; this.reset = this.reset.bind(this); }
  static getDerivedStateFromError(error) { return { error }; }
  reset() { this.setState({ error: null }); if (this.props.onReset) this.props.onReset(); }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.only404 && !(error instanceof NotFoundError)) throw error; // pass up
    if (!this.props.only404 && error instanceof NotFoundError) throw error;
    return this.props.fallback({ error, reset: this.reset });
  }
}

// a tiny cache so the "fetch" suspends once per request id
const cache = {};
function fetchUser(id, mode) {
  const key = id + mode;
  if (!cache[key]) {
    const entry = { status: 'pending' };
    entry.promise = new Promise((r) => setTimeout(r, mode === 'slow' ? 2000 : 600)).then(() => {
      if (mode === 'error') { entry.status = 'error'; entry.value = new Error('User service is down'); }
      else if (mode === '404') { entry.status = '404'; }
      else { entry.status = 'done'; entry.value = { name: 'Leanne Graham', email: 'leanne@example.com' }; }
    });
    cache[key] = entry;
  }
  const e = cache[key];
  if (e.status === 'pending') throw e.promise;      // Suspense shows loading.js
  if (e.status === 'error') throw e.value;           // error.js
  if (e.status === '404') notFound();                // not-found.js
  return e.value;
}

function Page({ id, mode }) {
  const user = fetchUser(id, mode);
  return <section><h3>{user.name}</h3><p>{user.email}</p></section>;
}

let counter = 0;
function App() {
  const [mode, setMode] = useState('ok');
  const [req, setReq] = useState(0);
  const go = (m) => { setMode(m); setReq(++counter); };
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <div style={{ background: '#0070f3', color: '#fff', padding: 6 }}>Layout (stays interactive)</div>
      {['ok', 'slow', 'error', '404'].map((m) => <button key={m} onClick={() => go(m)} style={{ margin: 4 }}>{m}</button>)}
      <div style={{ border: '1px dashed #999', padding: 8 }} key={req}>
        <ErrorBoundary onReset={() => setReq(++counter)} fallback={({ error, reset }) => (
          <div role="alert" style={{ color: 'crimson' }}>error.js: {error.message} <button onClick={() => { setMode('ok'); reset(); }}>Try again</button></div>
        )}>
          <Suspense fallback={<p style={{ color: '#888' }}>loading.js: Loading user...</p>}>
            <ErrorBoundary only404 fallback={() => <p>not-found.js: User not found (HTTP 404)</p>}>
              <Page id={req} mode={mode} />
            </ErrorBoundary>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}`,
      },
      result:
        'ok shows the loading text briefly then the user; slow shows loading for 2 s; error shows the error.js message with a Try again button that recovers; 404 shows the not-found UI. The blue layout bar never disappears.',
      explanation:
        'The nesting in the simulation (ErrorBoundary > Suspense > NotFound boundary > Page) matches the hierarchy Next.js builds from error.js, loading.js and not-found.js. A thrown promise triggers Suspense, a thrown Error triggers the error boundary, and the special not-found error is caught by the inner boundary.',
    },
    {
      title: 'Why error.js does not catch its own layout\'s errors',
      scenario: 'The dashboard layout crashes, but app/dashboard/error.js does not show. You trace where the error goes.',
      steps: [
        'Throw an error in app/dashboard/layout.js',
        'Notice app/dashboard/error.js is NOT used',
        'Add app/error.js: now it catches the dashboard layout error',
        'Throw in app/layout.js (root): only app/global-error.js can handle it',
      ],
      code: `// Hierarchy produced by Next.js for /dashboard
<RootLayout>                       // app/layout.js        -> errors go to global-error.js
  <ErrorBoundary fallback={AppError}>      // app/error.js
    <DashboardLayout>              // app/dashboard/layout.js -> caught by app/error.js
      <ErrorBoundary fallback={DashboardError}>   // app/dashboard/error.js
        <Suspense fallback={DashboardLoading}>    // app/dashboard/loading.js
          <DashboardPage />        // app/dashboard/page.js -> caught by app/dashboard/error.js
        </Suspense>
      </ErrorBoundary>
    </DashboardLayout>
  </ErrorBoundary>
</RootLayout>`,
      result: 'Page errors are caught by the same segment\'s error.js; layout errors are caught one level up; root layout errors need global-error.js.',
      explanation:
        'An error boundary only catches errors in its children. error.js wraps the page inside the layout, so the layout is outside it. Putting error.js in the parent segment covers the child\'s layout.',
    },
    {
      title: 'Global 404 page and notFound() for missing records',
      scenario: 'Unknown URLs and unknown blog slugs should both show a friendly 404 with search suggestions.',
      steps: [
        'Create app/not-found.js',
        'In app/blog/[slug]/page.js call notFound() when the post is missing',
        'Visit /no-such-page and /blog/missing-post',
        'Check DevTools Network: status 404 for both',
      ],
      code: `// app/not-found.js
import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main className="p-10 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p>We could not find that page.</p>
      <Link href="/" className="text-blue-600 underline">Go home</Link>
    </main>
  );
}

// app/blog/[slug]/page.js
import { notFound } from 'next/navigation';
import { getPost } from '@/lib/posts';

export default async function Post({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound(); // renders the nearest not-found.js with HTTP 404
  return <article><h1>{post.title}</h1></article>;
}`,
      result: 'Both /no-such-page and /blog/missing-post render the 404 page with HTTP status 404.',
      explanation: 'Unmatched URLs use the root not-found.js. notFound() throws a special error during rendering; Next.js catches it, renders the nearest not-found.js and sets the 404 status and a noindex robots tag.',
    },
    {
      title: 'Handling errors from event handlers (not caught by error.js)',
      scenario: 'A "Download report" button calls an API in onClick. If it fails, error.js does nothing. Handle it locally.',
      steps: [
        'Create a client component with a button',
        'Wrap the async call in try/catch',
        'Store the error message in state and show it',
        'Try the playground: click "Download (fails)"',
      ],
      code: `'use client';
import { useState } from 'react';

export default function DownloadButton() {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/report');
      if (!res.ok) throw new Error('Server returned ' + res.status);
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={download} disabled={busy}>{busy ? 'Downloading...' : 'Download report'}</button>
      {error && <p role="alert">Download failed: {error}</p>}
    </div>
  );
}`,
      playground: {
        jsx: `// SIMULATION: event-handler errors must be handled with try/catch + state.
const { useState } = React;
const fakeFetch = () => new Promise((_, reject) => setTimeout(() => reject(new Error('Server returned 500')), 700));

function App() {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true); setError(null);
    try { await fakeFetch(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <button onClick={download} disabled={busy}>{busy ? 'Downloading...' : 'Download (fails)'}</button>
      {error && <p role="alert" style={{ color: 'crimson' }}>Download failed: {error}</p>}
    </div>
  );
}`,
      },
      result: 'After about 0.7 s the message "Download failed: Server returned 500" appears below the button and the button is enabled again.',
      explanation: 'React error boundaries catch errors thrown during rendering, not in async event handlers. Those must be caught and turned into state that the UI renders.',
    },
  ],
  interview: [
    { q: 'What does loading.js do?', a: 'It defines a fallback that Next.js uses to wrap the segment\'s page (and children) in a React Suspense boundary. The fallback shows instantly on navigation (it is prefetched) while the page renders and streams in, and shared layouts stay interactive.', level: 'Easy' },
    { q: 'Why must error.js be a Client Component?', a: 'Error boundaries are a client-side React feature (they rely on component state/lifecycle to catch errors and re-render), and error.js needs interactivity for the reset button.', level: 'Medium' },
    { q: 'What props does error.js receive?', a: 'error: the Error instance (with an optional digest in production for server errors) and reset: a function that attempts to re-render the segment.', level: 'Easy' },
    { q: 'Why does app/dashboard/error.js not catch errors from app/dashboard/layout.js?', a: 'Next.js places the error boundary inside the layout of the same segment, so the layout is outside the boundary. Layout errors bubble to the parent segment\'s error.js.', level: 'Hard' },
    { q: 'What is global-error.js?', a: 'An error boundary at the very top that catches errors in the root layout/template. It replaces the root layout when triggered, so it must define its own <html> and <body>. It is active only in production.', level: 'Medium' },
    { q: 'Why is error.message different in production?', a: 'For errors thrown in Server Components, Next.js sends a generic message and a digest hash to the client to avoid leaking sensitive details. The full error is in server logs, matched by the digest.', level: 'Hard' },
    { q: 'How do you show a 404 when a record does not exist?', a: 'Call notFound() from next/navigation in the Server Component (or generateMetadata / route). It renders the nearest not-found.js and returns HTTP 404 with noindex.', level: 'Easy' },
    { q: 'Why should you avoid wrapping notFound() or redirect() in try/catch?', a: 'They work by throwing special framework errors. A catch block that swallows them prevents Next.js from handling them. Call them outside try or rethrow (unstable_rethrow can help).', level: 'Hard' },
    { q: 'Do error boundaries catch errors in event handlers?', a: 'No. They catch errors during rendering, in lifecycle methods and in child constructors. Event handler and async errors must be caught with try/catch and stored in state.', level: 'Medium' },
    { q: 'What is the order of boundaries within one segment?', a: 'Layout > Template > Error boundary (error.js) > Suspense (loading.js) > Not-found boundary (not-found.js) > Page.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a skeleton loading.js for /products that shows six grey card placeholders in a 3-column grid (Tailwind).',
      hint: 'Array.from({ length: 6 }).',
      solution: `// app/products/loading.js
export default function Loading() {
  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-200" />
      ))}
    </div>
  );
}`,
    },
    {
      task: 'Write app/products/error.js that logs the error once, shows a friendly message, and has a "Try again" button.',
      hint: '"use client", useEffect, reset.',
      solution: `'use client';
import { useEffect } from 'react';

export default function ProductsError({ error, reset }) {
  useEffect(() => {
    console.error('Products page error:', error.digest ?? error.message);
  }, [error]);
  return (
    <div role="alert" className="p-6">
      <h2 className="text-xl font-semibold">We could not load products.</h2>
      <p>Please check your connection and try again.</p>
      <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}`,
    },
    {
      task: 'Create /orders/[id] that returns a 404 when the order id is not numeric or not in a local array, with a custom not-found.js for orders.',
      hint: 'Validate, then notFound().',
      solution: `// app/orders/[id]/page.js
import { notFound } from 'next/navigation';
const orders = [{ id: 1, total: 499 }, { id: 2, total: 1299 }];

export default async function Order({ params }) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n)) notFound();
  const order = orders.find((o) => o.id === n);
  if (!order) notFound();
  return <h1>Order #{order.id}: Rs {order.total}</h1>;
}

// app/orders/[id]/not-found.js
export default function OrderNotFound() {
  return <h2>This order does not exist.</h2>;
}`,
    },
    {
      task: 'Write app/global-error.js that shows "Critical error" and a Reload button, and explain when it is used.',
      hint: 'Must include html and body.',
      solution: `'use client';
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body>
        <h1>Critical error</h1>
        <p>{error.digest ? 'Reference: ' + error.digest : ''}</p>
        <button onClick={() => reset()}>Reload</button>
      </body>
    </html>
  );
}
// Used (in production) when the root layout or root template throws,
// because app/error.js sits inside the root layout and cannot catch it.`,
    },
  ],
  quiz: [
    { question: 'Which directive is required at the top of error.js?', options: ['"use server"', '"use strict"', 'None', '"use client"'], answer: 3, explanation: 'Error boundaries must be Client Components.' },
    { question: 'loading.js is implemented as...', options: ['A Suspense boundary fallback around the page', 'A useEffect spinner', 'A middleware', 'An API route'], answer: 0, explanation: 'Next.js wraps the page in <Suspense fallback={<Loading/>}>.' },
    { question: 'Which function shows the nearest not-found.js with HTTP 404?', options: ['redirect("/404")', 'notFound()', 'throw new Error(404)', 'Response.json(null, {status:404})'], answer: 1, explanation: 'notFound() from next/navigation.' },
    { question: 'An error is thrown in app/shop/layout.js. Which file handles it?', options: ['app/shop/error.js', 'app/shop/not-found.js', 'app/error.js', 'app/shop/loading.js'], answer: 2, explanation: 'The parent segment\'s error boundary catches the layout error.' },
    { question: 'What does the reset prop in error.js do?', options: ['Reloads the browser tab', 'Clears cookies', 'Navigates to /', 'Re-renders the segment to try again'], answer: 3, explanation: 'reset attempts to recover by re-rendering the boundary\'s contents.' },
  ],
};
