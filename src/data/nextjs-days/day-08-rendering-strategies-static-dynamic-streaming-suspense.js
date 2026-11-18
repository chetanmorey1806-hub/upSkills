export default {
  id: 'day-08-rendering-strategies-static-dynamic-streaming-suspense',
  title: 'Rendering Strategies: Static, Dynamic, Streaming with Suspense',
  module: 'Module 2: Data & Rendering',
  day: 8,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Next.js decides for each route whether it can be rendered once (static) or must be rendered per request (dynamic). Learn exactly what triggers dynamic rendering, how to force a mode, and how streaming with React Suspense sends the fast parts of a page first while slow data loads.',
  objectives: [
    'Explain static rendering vs dynamic rendering and how Next.js chooses between them',
    'List the Dynamic APIs (cookies, headers, searchParams, connection, no-store) and use them correctly with await in Next.js 15',
    'Force a mode with export const dynamic and understand dynamicParams / generateStaticParams',
    'Stream parts of a page with <Suspense fallback> so slow components do not block the whole response',
    'Read the build output and know where Partial Prerendering (PPR) fits',
  ],
  theory: [
    {
      heading: 'Static rendering (the default goal)',
      content:
        'With **static rendering**, a route is rendered at **build time** (or in the background after revalidation) and the result (HTML + RSC payload) is cached and served to every user, usually from a CDN.\n\nNext.js tries to make every route static. A route stays static as long as it does **not** use anything that is only known at request time.\n\n**Good for**: marketing pages, blog posts, product pages, docs — anything where all users see the same content.\n\nAnalogy: a printed menu card. Printed once, handed to every guest. If prices change, you reprint (revalidate).',
      points: [
        'Build output marks static routes with ○ (or ● for SSG with generateStaticParams)',
        'With revalidate, a static route becomes ISR: regenerated in the background',
        'Static routes are the cheapest and fastest to serve',
      ],
    },
    {
      heading: 'Dynamic rendering and the Dynamic APIs',
      content:
        'With **dynamic rendering** the route is rendered **for each request** on the server. Next.js switches a route to dynamic automatically when it detects a **Dynamic API** during rendering:\n- `cookies()` and `headers()` from `next/headers`\n- the `searchParams` prop of a page\n- `connection()` from `next/server` (explicitly "wait for a real request")\n- `fetch(..., { cache: \'no-store\' })` (or uncached data with `dynamic = \'force-dynamic\'`)\n- `draftMode()`\n\n**Next.js 15**: `cookies()`, `headers()`, `draftMode()`, `params` and `searchParams` are **async**. Write `const cookieStore = await cookies();`.\n\n**Good for**: personalised pages (cart, account), pages depending on the query string (search), real-time data.\n\nAnalogy: a chef cooking each order to the customer\'s request. Personal, but every plate costs effort.',
      syntax:
        "// app/account/page.js  -> dynamic because of cookies()\nimport { cookies } from 'next/headers';\n\nexport default async function Account() {\n  const cookieStore = await cookies();\n  const theme = cookieStore.get('theme')?.value ?? 'light';\n  return <h1>Your theme: {theme}</h1>;\n}",
    },
    {
      heading: 'Forcing a mode with route segment config',
      content:
        'Usually you let Next.js decide. When you need to be explicit, export `dynamic` from a page or layout:\n- `\'auto\'` (default) → static where possible\n- `\'force-dynamic\'` → always render per request\n- `\'force-static\'` → always static; `cookies()`/`headers()` return empty values\n- `\'error\'` → static, and the build **fails** if a Dynamic API is used (useful to guarantee a page stays fast)\n\nRelated:\n- `export const revalidate = 60` → ISR\n- `generateStaticParams` + `export const dynamicParams = false` → only the listed dynamic paths exist\n\n**Partial Prerendering (PPR)**: an experimental Next.js 15 feature (`experimental.ppr`) that makes one route **both**: a static shell served instantly from the CDN, with dynamic "holes" (wrapped in Suspense) streamed in per request. It builds on exactly the Suspense boundaries you learn today.',
      syntax:
        "// app/pricing/page.js\nexport const dynamic = 'error'; // build fails if this page becomes dynamic\n\n// app/feed/page.js\nexport const dynamic = 'force-dynamic';",
    },
    {
      heading: 'Streaming with Suspense',
      content:
        'With dynamic rendering there is a problem: the page is only as fast as its **slowest** data. If reviews take 3 seconds, the whole page (header, product info) waits 3 seconds.\n\n**Streaming** solves this. The server sends HTML in **chunks**: the parts that are ready go first, and the slow parts follow when their data resolves, over the **same HTTP response**.\n\nYou mark the slow part with React\'s `<Suspense>`:\n\n```jsx\n<Suspense fallback={<p>Loading reviews...</p>}>\n  <Reviews productId={id} />   {/* async Server Component */}\n</Suspense>\n```\n\n1. Next.js renders everything outside the boundary and sends it immediately, with the fallback in place of Reviews\n2. When `Reviews` finishes its `await`, the server streams its HTML plus a tiny script that swaps it into place\n3. Each boundary streams independently, in whichever order data arrives\n\n`loading.js` (Day 9) is simply a Suspense boundary around the whole page, created for you.\n\nAnalogy: a thali in a restaurant. The waiter serves rice and dal as soon as they are ready instead of waiting for the slow paneer dish. You start eating earlier.',
      tip: 'Await the slow data INSIDE the component that is wrapped in Suspense, not in the parent page. If the page itself awaits the slow fetch, nothing streams: the whole page waits.',
    },
    {
      heading: 'Choosing boundaries well',
      content:
        '- Put boundaries around **independent, slow** sections: reviews, recommendations, analytics widgets\n- Keep critical content (title, price, Buy button) **outside** boundaries so it arrives first\n- Give fallbacks the **same size** as the final content (skeletons) to avoid layout shift\n- Nested boundaries: an outer one for a section, inner ones for parts of it\n- Streaming also works for Client Components and is SEO-safe: the final HTML is complete for crawlers\n\nComing next (Day 9): `loading.js`, `error.js` and `not-found.js` — the file conventions that create Suspense and Error boundaries for you.',
    },
  ],
  examples: [
    {
      title: 'Product page that streams reviews and recommendations',
      scenario: 'Product info loads in 100 ms, reviews in 2 s and recommendations in 1 s. The user should see the product immediately.',
      steps: [
        'Create the page and keep the fast product fetch in the page',
        'Move reviews and recommendations into their own async Server Components',
        'Wrap each in <Suspense fallback={...}>',
        'Run npm run dev and watch the sections pop in; open the Network tab to see one streamed response',
        'Run the playground (React.lazy + Suspense with fake delays) to see the same behaviour',
      ],
      code: `// app/products/[id]/page.js
import { Suspense } from 'react';
import Reviews from './Reviews';
import Recommendations from './Recommendations';

async function getProduct(id) {
  const res = await fetch(\`https://dummyjson.com/products/\${id}\`, { next: { revalidate: 3600 } });
  return res.json();
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id); // fast - part of the first chunk
  return (
    <main>
      <h1>{product.title}</h1>
      <p>Rs {product.price}</p>

      <Suspense fallback={<p>Loading reviews...</p>}>
        <Reviews id={id} />
      </Suspense>

      <Suspense fallback={<p>Loading recommendations...</p>}>
        <Recommendations category={product.category} />
      </Suspense>
    </main>
  );
}

// app/products/[id]/Reviews.js
export default async function Reviews({ id }) {
  const res = await fetch(\`https://api.example.com/reviews?product=\${id}\`, { cache: 'no-store' }); // slow
  const reviews = await res.json();
  return <ul>{reviews.map((r) => <li key={r.id}>{r.rating}★ {r.text}</li>)}</ul>;
}`,
      playground: {
        jsx: `// SIMULATION of streaming with real React Suspense in the browser.
// React.lazy + a fake delay stands in for an async Server Component awaiting slow data.
const { Suspense, useState, lazy } = React;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function makeSections() {
  return {
    Reviews: lazy(() => wait(2000).then(() => ({
      default: () => <ul><li>5★ Great sound</li><li>4★ Good value</li></ul>,
    }))),
    Recommendations: lazy(() => wait(1000).then(() => ({
      default: () => <p>You may also like: Charger, Earbuds case</p>,
    }))),
  };
}

const box = { border: '1px dashed #999', padding: 8, margin: '8px 0' };

function App() {
  const [sections, setSections] = useState(makeSections);
  const [run, setRun] = useState(0);
  const { Reviews, Recommendations } = sections;
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }} key={run}>
      <button onClick={() => { setSections(makeSections()); setRun(run + 1); }}>Reload page</button>
      <h2>Wireless Earbuds</h2>
      <p>Rs 1,999 - sent in the FIRST chunk</p>
      <div style={box}>
        <b>Reviews (2 s)</b>
        <Suspense fallback={<p style={{ color: '#888' }}>Loading reviews...</p>}><Reviews /></Suspense>
      </div>
      <div style={box}>
        <b>Recommendations (1 s)</b>
        <Suspense fallback={<p style={{ color: '#888' }}>Loading recommendations...</p>}><Recommendations /></Suspense>
      </div>
    </div>
  );
}`,
      },
      result: 'Title and price appear instantly. Recommendations replace their fallback after about 1 s and reviews after about 2 s. "Reload page" repeats the sequence.',
      explanation:
        'Each Suspense boundary shows its fallback until the child is ready, independently of the others. In Next.js the same boundaries cause the server to stream HTML chunks for each section as its await completes.',
    },
    {
      title: 'What makes a route dynamic? (build-output experiment)',
      scenario: 'You add small changes to a static page and watch the build symbol change.',
      steps: [
        'Create app/about/page.js with static content and run npm run build: ○ /about',
        'Add await cookies() and build again: ƒ /about',
        'Replace cookies with a fetch using cache: "no-store": still ƒ',
        'Replace it with next: { revalidate: 60 }: back to ○ with Revalidate 1m',
        'Add export const dynamic = "error" plus cookies(): the build fails',
      ],
      code: `// Version A - static
export default function About() {
  return <h1>About us</h1>;
}
// build: ○ /about

// Version B - dynamic because of a Dynamic API
import { cookies } from 'next/headers';
export default async function About() {
  const lang = (await cookies()).get('lang')?.value ?? 'en';
  return <h1>About us ({lang})</h1>;
}
// build: ƒ /about

// Version C - ISR
export const revalidate = 60;
export default async function About() {
  const team = await fetch('https://api.example.com/team').then((r) => r.json());
  return <h1>About us - {team.length} people</h1>;
}
// build: ○ /about   Revalidate 1m

// Version D - guard
export const dynamic = 'error';
// + cookies() -> Error: Route /about with \`dynamic = "error"\` couldn't be rendered
//   statically because it used \`cookies\`.`,
      result: 'The build symbol flips between ○ Static and ƒ Dynamic depending on Dynamic API usage; dynamic = "error" turns accidental dynamic usage into a build error.',
      explanation:
        'Next.js detects request-time APIs while pre-rendering. If it encounters one, it bails out of static rendering for that route. The guard setting is a cheap way to keep important pages static.',
    },
    {
      title: 'Static vs dynamic decision simulator',
      scenario: 'Practise predicting the rendering mode from a list of features used by a route.',
      steps: [
        'Tick the features used by a route in the playground',
        'Read the predicted mode and reason',
        'Compare with the theory rules',
      ],
      code: `// Rules summary
// cookies() | headers() | searchParams | connection() | fetch no-store | dynamic='force-dynamic'
//      -> ƒ Dynamic (rendered per request)
// export const dynamic = 'force-static'    -> ○ Static (request APIs return empty)
// export const revalidate = N / next.revalidate -> ○ Static with ISR
// nothing request-specific                  -> ○ Static`,
      playground: {
        jsx: `// Decision simulator for Next.js 15 rendering mode (plain React).
const { useState } = React;
const FEATURES = [
  ['cookies', 'await cookies()'],
  ['headers', 'await headers()'],
  ['searchParams', 'reads searchParams'],
  ['noStore', "fetch with cache: 'no-store'"],
  ['revalidate', 'export const revalidate = 60'],
  ['forceStatic', "export const dynamic = 'force-static'"],
  ['forceDynamic', "export const dynamic = 'force-dynamic'"],
];

function decide(f) {
  if (f.forceDynamic) return ['ƒ Dynamic', 'forced by dynamic = force-dynamic'];
  if (f.forceStatic) return ['○ Static', 'forced static; cookies/headers return empty'];
  const used = ['cookies', 'headers', 'searchParams', 'noStore'].filter((k) => f[k]);
  if (used.length) return ['ƒ Dynamic', 'uses request-time API: ' + used.join(', ')];
  if (f.revalidate) return ['○ Static (ISR, 60 s)', 'pre-rendered and regenerated in the background'];
  return ['○ Static', 'nothing request-specific, rendered at build time'];
}

function App() {
  const [f, setF] = useState({});
  const [mode, why] = decide(f);
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      {FEATURES.map(([k, label]) => (
        <label key={k} style={{ display: 'block' }}>
          <input type="checkbox" checked={!!f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} /> <code>{label}</code>
        </label>
      ))}
      <h2 style={{ color: mode.startsWith('ƒ') ? 'crimson' : 'green' }}>{mode}</h2>
      <p>{why}</p>
    </div>
  );
}`,
      },
      result: 'Ticking cookies() shows ƒ Dynamic; only revalidate shows ○ Static (ISR); force-static overrides request APIs.',
      explanation: 'This mirrors the precedence Next.js applies: explicit dynamic config first, then detection of Dynamic APIs, then revalidation settings.',
    },
    {
      title: 'Streaming a dashboard with nested Suspense and skeletons',
      scenario: 'A dashboard has three independent widgets of different speeds. Each should load on its own with a skeleton of the right size.',
      steps: [
        'Create a Skeleton component with a fixed height',
        'Make each widget an async Server Component that fetches its own data',
        'Wrap each widget in its own Suspense boundary',
        'Use a grid so skeletons and widgets occupy the same space',
      ],
      code: `// app/dashboard/page.js
import { Suspense } from 'react';
import Revenue from './Revenue';
import Orders from './Orders';
import Visitors from './Visitors';

function Skeleton({ h = 120 }) {
  return <div className="animate-pulse rounded-lg bg-gray-200" style={{ height: h }} />;
}

export default function Dashboard() {
  return (
    <main className="grid gap-4 md:grid-cols-3">
      <Suspense fallback={<Skeleton />}><Revenue /></Suspense>
      <Suspense fallback={<Skeleton />}><Orders /></Suspense>
      <Suspense fallback={<Skeleton />}><Visitors /></Suspense>
    </main>
  );
}

// app/dashboard/Revenue.js
export default async function Revenue() {
  const data = await fetch('https://api.example.com/revenue', { cache: 'no-store' }).then((r) => r.json());
  return (
    <section className="h-[120px] rounded-lg border p-4">
      <h2>Revenue</h2>
      <p className="text-2xl">Rs {data.total}</p>
    </section>
  );
}`,
      result: 'The dashboard grid appears instantly with three pulsing skeletons; each widget replaces its skeleton as soon as its own data arrives, with no layout jump.',
      explanation: 'Because the page component itself awaits nothing, the shell is sent immediately. Each widget awaits inside its own boundary, so slow widgets never delay fast ones.',
    },
  ],
  interview: [
    { q: 'What is the difference between static and dynamic rendering in Next.js?', a: 'Static rendering produces the route at build time (or during background revalidation) and serves the cached result to every user. Dynamic rendering renders the route on the server for each request, needed when output depends on request data such as cookies, headers or the query string.', level: 'Easy' },
    { q: 'Which APIs make a route dynamic?', a: 'cookies(), headers(), draftMode(), connection(), the searchParams prop, uncached fetches (cache: "no-store"), and export const dynamic = "force-dynamic".', level: 'Medium' },
    { q: 'Why do you write await cookies() in Next.js 15?', a: 'In Next.js 15 request APIs (cookies, headers, draftMode, params, searchParams) became asynchronous so Next.js can prepare as much of the page as possible before request data is needed (groundwork for PPR). Synchronous access is deprecated.', level: 'Medium' },
    { q: 'What does export const dynamic = "error" do?', a: 'It forces static rendering and makes the build fail if the route uses a Dynamic API or uncached data, guaranteeing the page stays static.', level: 'Hard' },
    { q: 'What is streaming in Next.js?', a: 'Sending the HTML of a route in chunks over one response: the shell and ready parts first, then each Suspense-wrapped part when its data resolves. It improves Time To First Byte and First Contentful Paint for dynamic pages.', level: 'Medium' },
    { q: 'How do you stream a slow part of a page?', a: 'Move the slow await into its own async Server Component and wrap it in <Suspense fallback={...}> in the parent. The parent must not await that data itself.', level: 'Medium' },
    { q: 'Is streaming bad for SEO?', a: 'No. Streamed content is part of the same HTML response, so crawlers receive the complete page. Next.js also waits for generateMetadata before streaming the body so metadata is in the head.', level: 'Hard' },
    { q: 'What is Partial Prerendering (PPR)?', a: 'An experimental Next.js feature that combines static and dynamic in one route: a static shell is prerendered and served instantly, and dynamic parts wrapped in Suspense are streamed in at request time.', level: 'Hard' },
    { q: 'How should fallbacks be designed?', a: 'As skeletons matching the size and layout of the final content to avoid cumulative layout shift, placed around independent slow sections, while keeping critical content outside boundaries.', level: 'Medium' },
    { q: 'What do ○, ● and ƒ mean in next build output?', a: '○ Static (prerendered as static content), ● SSG (prerendered with generateStaticParams), ƒ Dynamic (server-rendered on demand).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create /greeting that shows "Good morning/afternoon/evening, <name>" where name comes from a cookie "name" (default "Guest"). Which rendering mode does it get?',
      hint: 'await cookies().',
      solution: `// app/greeting/page.js
import { cookies } from 'next/headers';
import { connection } from 'next/server';

export default async function Greeting() {
  await connection(); // the time of day must be computed per request
  const name = (await cookies()).get('name')?.value ?? 'Guest';
  const h = new Date().getHours();
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return <h1>Good {part}, {name}</h1>;
}
// Mode: ƒ Dynamic, because it reads cookies (and connection()).`,
    },
    {
      task: 'A news page awaits headlines (fast) and then comments (5 s) in the page component. Refactor so headlines appear immediately and comments stream in.',
      hint: 'Separate component + Suspense.',
      solution: `// app/news/page.js
import { Suspense } from 'react';

async function Comments() {
  const comments = await fetch('https://api.example.com/comments', { cache: 'no-store' }).then((r) => r.json());
  return <ul>{comments.map((c) => <li key={c.id}>{c.text}</li>)}</ul>;
}

export default async function News() {
  const headlines = await fetch('https://api.example.com/headlines', { next: { revalidate: 60 } }).then((r) => r.json());
  return (
    <main>
      <ul>{headlines.map((h) => <li key={h.id}>{h.title}</li>)}</ul>
      <Suspense fallback={<p>Loading comments...</p>}>
        <Comments />
      </Suspense>
    </main>
  );
}`,
    },
    {
      task: 'Guarantee that /pricing is always statically rendered; if a teammate later adds headers() the build must fail.',
      hint: 'dynamic = "error".',
      solution: `// app/pricing/page.js
export const dynamic = 'error';

export default function Pricing() {
  return <h1>Pricing: Basic Rs 0, Pro Rs 499</h1>;
}`,
    },
    {
      task: 'In plain React (playground style) build two widgets wrapped in separate Suspense boundaries using React.lazy with 1 s and 3 s delays, plus a third boundary that wraps BOTH in a single fallback. Observe the difference.',
      hint: 'One boundary waits for the slowest child.',
      solution: `const { Suspense, lazy } = React;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const mk = (ms, text) => lazy(() => wait(ms).then(() => ({ default: () => <p>{text}</p> })));
const A1 = mk(1000, 'A (1s)'), B1 = mk(3000, 'B (3s)');
const A2 = mk(1000, 'A (1s)'), B2 = mk(3000, 'B (3s)');

function App() {
  return (
    <div style={{ padding: 12 }}>
      <h3>Separate boundaries</h3>
      <Suspense fallback={<p>loading A...</p>}><A1 /></Suspense>
      <Suspense fallback={<p>loading B...</p>}><B1 /></Suspense>
      <h3>One shared boundary</h3>
      <Suspense fallback={<p>loading A and B...</p>}><A2 /><B2 /></Suspense>
    </div>
  );
}
// Separate: A shows at 1s, B at 3s. Shared: both appear together at 3s.`,
    },
  ],
  quiz: [
    { question: 'Which call makes a route dynamic?', options: ['fetch with next.revalidate: 60', 'await cookies()', 'importing a CSS Module', 'using <Link>'], answer: 1, explanation: 'cookies() is a request-time Dynamic API.' },
    { question: 'What does <Suspense fallback={<Spinner/>}> do around an async Server Component?', options: ['Caches it forever', 'Turns it into a Client Component', 'Shows the fallback and streams the component when its data is ready', 'Prevents it from rendering on the server'], answer: 2, explanation: 'Suspense boundaries enable streaming.' },
    { question: 'A page awaits a 3 s fetch at the top, then renders a Suspense boundary. When does the user see anything?', options: ['After about 3 s', 'Immediately', 'After 0.5 s', 'Never'], answer: 0, explanation: 'Awaiting in the parent blocks the whole page; the await must be inside the suspended child.' },
    { question: "What does export const dynamic = 'force-static' do?", options: ['Fails the build', 'Renders per request', 'Disables JavaScript', 'Forces static rendering; request APIs return empty values'], answer: 3, explanation: 'force-static overrides dynamic detection.' },
    { question: 'In the build output, ƒ means...', options: ['Static', 'Dynamic (rendered on demand)', 'Failed', 'Fast'], answer: 1, explanation: 'ƒ marks server-rendered on demand routes.' },
  ],
};
