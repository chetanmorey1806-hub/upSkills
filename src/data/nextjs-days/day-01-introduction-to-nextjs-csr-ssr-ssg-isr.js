export default {
  id: 'day-01-introduction-to-nextjs-csr-ssr-ssg-isr',
  title: 'Introduction to Next.js: CSR vs SSR vs SSG vs ISR, Why Next.js',
  module: 'Module 1: Next.js Basics',
  day: 1,
  level: 'Beginner',
  duration: '1.5 hours',
  summary:
    'Next.js is a React framework that adds routing, server rendering, data fetching and build optimisation on top of React. Today you learn the four ways a web page can be rendered (CSR, SSR, SSG, ISR) and why Next.js lets you mix them per page.',
  objectives: [
    'Explain what Next.js is and how it differs from plain React (a library) built with Vite',
    'Describe Client-Side Rendering (CSR), Server-Side Rendering (SSR), Static Site Generation (SSG) and Incremental Static Regeneration (ISR)',
    'Choose the right rendering strategy for a page based on how often its data changes and who sees it',
    'Recognise how Next.js 15 (App Router) expresses each strategy in code',
    'List the main reasons companies pick Next.js: SEO, performance, full-stack in one project, file-based routing',
  ],
  theory: [
    {
      heading: 'What is Next.js?',
      content:
        'React is a **library** for building user interfaces. It renders components, but it does not decide how URLs map to pages, how data is loaded on the server, or how the app is bundled and deployed.\n\n**Next.js** is a **framework** built on React by Vercel. It gives you the missing pieces out of the box:\n- **File-based routing**: a folder `app/about/page.js` automatically becomes the URL `/about`\n- **Server rendering**: pages can be turned into HTML on the server before they reach the browser\n- **Data fetching** on the server with built-in caching\n- **Route Handlers**: write backend API endpoints in the same project\n- **Optimisations**: image, font and script optimisation, code splitting per route\n- **One command build and deploy** (`next build`, `next start`, or Vercel)\n\nAnalogy: React is a powerful car engine. Next.js is the complete car: engine plus steering, brakes, dashboard and GPS. You can build your own car around the engine (React + Vite + React Router + an Express backend) but Next.js hands you a tested one.\n\nThis course uses **Next.js 15 with the App Router** (the `app/` folder), which runs on **React 19** and uses **React Server Components** by default.',
      tip: 'Next.js still uses React. Every component, hook and JSX rule you learned in React works the same. Next.js adds rules about WHERE the component runs (server or browser) and WHICH file it lives in.',
    },
    {
      heading: 'CSR: Client-Side Rendering',
      content:
        'In **CSR** the server sends an almost empty HTML file plus a JavaScript bundle. The browser downloads the JS, runs React, fetches data from an API and only then paints the content. A normal Vite + React app works this way.\n\n1. Browser requests `/products`\n2. Server returns `<div id="root"></div>` + `main.js`\n3. Browser downloads and runs `main.js`\n4. React calls `fetch(\'/api/products\')`\n5. Data arrives, React renders the list\n\n**Pros**: simple hosting (any static host), very interactive after load.\n**Cons**: a blank screen or spinner first, slower on weak phones, and search engines / link previews see an empty page (**bad SEO**).\n\nAnalogy: IKEA furniture. You receive a flat box (empty HTML + JS) and you must assemble it yourself at home (in the browser) before you can sit on it.',
    },
    {
      heading: 'SSR: Server-Side Rendering',
      content:
        'In **SSR** the server runs React **on every request**, fetches the data, and sends back complete HTML. The user sees content immediately; then React **hydrates** the page (attaches event handlers) so it becomes interactive.\n\n**Pros**: fresh data on every request, good SEO, fast first paint.\n**Cons**: the server works on every request (cost, latency); the page is only as fast as the slowest data source.\n\n**Use for**: dashboards with per-user data, search results, a cart page, anything personalised or always changing.\n\nAnalogy: a restaurant that cooks your meal fresh when you order. Always fresh, but you wait for the cooking every time.\n\n**Hydration** is the step where the browser runs the same React components over the server HTML to make buttons and inputs work. The HTML is already there; hydration just "wires it up".',
    },
    {
      heading: 'SSG and ISR: Static Generation and Incremental Regeneration',
      content:
        '**SSG (Static Site Generation)** renders the page to HTML **once at build time** (`next build`). Every visitor receives the same pre-built file from a CDN. It is the fastest and cheapest option.\n\n**Use for**: marketing pages, documentation, blog posts, About / Contact pages.\n**Problem**: if the data changes you must rebuild and redeploy.\n\n**ISR (Incremental Static Regeneration)** fixes that problem. The page is static, but it has an expiry time, for example 60 seconds. After it expires, the **next** visitor still gets the old (stale) page instantly, while Next.js regenerates a fresh copy in the background. Visitors after that get the new version. This pattern is called **stale-while-revalidate**.\n\n**Use for**: product catalogues, news lists, blog index pages: data that changes, but not every second.\n\nAnalogy: SSG is a printed book. ISR is a newspaper reprinted every hour: you might read an hour-old copy, but you never wait at the counter.',
      points: [
        'CSR: render in the browser, after JS loads',
        'SSR: render on the server, on every request',
        'SSG: render on the server, once at build time',
        'ISR: SSG + re-render in the background after N seconds',
      ],
    },
    {
      heading: 'How Next.js 15 expresses each strategy',
      content:
        'In the App Router you do not pick a strategy with special function names (the old Pages Router used `getServerSideProps` and `getStaticProps`). Instead the strategy follows from **how your page fetches data**:\n- A page with no dynamic data → **static (SSG)** automatically\n- `fetch(url, { next: { revalidate: 60 } })` or `export const revalidate = 60` → **ISR**\n- `fetch(url, { cache: \'no-store\' })`, reading `cookies()`, `headers()` or `searchParams` → **dynamic (SSR)**\n- A component that starts with `"use client"` and fetches in `useEffect` → **CSR** for that part\n\nThe big idea: **one Next.js app can use all four**, chosen per page or even per component. The home page can be static, the product page ISR, the account page SSR, and the chat widget CSR.\n\nNote: in Next.js 15, `fetch` is **not cached by default** (it was cached by default in Next.js 14). You opt in with `cache: \'force-cache\'` or `next.revalidate`. We go deep into this on Day 7.',
      syntax:
        "// app/blog/page.js  (Server Component, ISR every 60 s)\nexport const revalidate = 60;\n\nexport default async function BlogPage() {\n  const res = await fetch('https://api.example.com/posts');\n  const posts = await res.json();\n  return (\n    <ul>\n      {posts.map((p) => <li key={p.id}>{p.title}</li>)}\n    </ul>\n  );\n}",
      tip: 'Do not memorise "SSR good, CSR bad". Ask two questions per page: (1) Does Google need to read it? (2) How often does the data change and is it the same for every user? The answers pick the strategy.',
    },
    {
      heading: 'Why companies choose Next.js',
      content:
        '- **SEO and link previews**: HTML arrives already filled, so Google, LinkedIn and WhatsApp previews see real content\n- **Performance**: less JavaScript sent to the browser thanks to Server Components; static pages served from a CDN\n- **Full-stack in one repo**: UI, API endpoints (Route Handlers) and form mutations (Server Actions) live together\n- **Conventions**: file-based routing, layouts, loading and error files mean teams write less boilerplate\n- **Ecosystem**: used by Netflix, TikTok, Twitch, Nike, Notion, OpenAI and many Indian startups; huge job demand\n\nWhen NOT to use Next.js: a small internal tool behind a login where SEO does not matter and you already have a separate backend. A Vite SPA is simpler there.\n\nComing next (Day 2): installing Next.js with `create-next-app` and exploring the project structure.',
    },
  ],
  examples: [
    {
      title: 'Comparing what the browser receives: CSR vs SSR',
      scenario:
        'Your manager asks why the React product page shows nothing when shared on WhatsApp. You compare the raw HTML that a CSR app and an SSR Next.js page send.',
      steps: [
        'Open a Vite React app in the browser and press Ctrl+U (View Source)',
        'Notice the body contains only <div id="root"></div>',
        'Open a Next.js page with View Source',
        'Notice the product names are already inside the HTML',
        'Run the playground simulation and click "Request page" in both modes to see the timeline',
      ],
      code: `<!-- CSR (Vite + React) : view-source of /products -->
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index-a1b2.js"></script>
</body>

<!-- SSR / SSG (Next.js) : view-source of /products -->
<body>
  <main>
    <h1>Products</h1>
    <ul>
      <li>Laptop - Rs 55,000</li>
      <li>Headphones - Rs 2,999</li>
    </ul>
  </main>
  <script src="/_next/static/chunks/app/products/page-x9y8.js" async></script>
</body>`,
      playground: {
        jsx: `// SIMULATION: plain React acting out what CSR and SSR send to the browser.
// No real server here: timers stand in for network and server work.
const { useState } = React;

const PRODUCTS = ['Laptop - Rs 55,000', 'Headphones - Rs 2,999', 'Keyboard - Rs 1,499'];

function App() {
  const [mode, setMode] = useState('CSR');
  const [log, setLog] = useState([]);
  const [html, setHtml] = useState('');
  const [items, setItems] = useState([]);

  function add(line) { setLog((l) => [...l, line]); }

  function request() {
    setLog([]); setItems([]); setHtml('');
    if (mode === 'CSR') {
      add('0 ms   Server sends: <div id="root"></div> + main.js');
      setHtml('<div id="root"></div>');
      setTimeout(() => add('300 ms Browser downloaded and ran main.js'), 300);
      setTimeout(() => add('400 ms React calls fetch("/api/products")'), 400);
      setTimeout(() => { add('900 ms Data arrived, React renders list'); setItems(PRODUCTS); }, 900);
    } else {
      add('0 ms   Server fetches products and renders HTML');
      setTimeout(() => {
        add('250 ms Server sends full HTML with the list inside');
        setHtml('<ul><li>Laptop...</li>...</ul>');
        setItems(PRODUCTS);
      }, 250);
      setTimeout(() => add('550 ms Hydration done: buttons are now interactive'), 550);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h2>CSR vs SSR timeline (simulation)</h2>
      {['CSR', 'SSR'].map((m) => (
        <label key={m} style={{ marginRight: 12 }}>
          <input type="radio" checked={mode === m} onChange={() => setMode(m)} /> {m}
        </label>
      ))}
      <button onClick={request} style={{ marginLeft: 8 }}>Request page</button>
      <p><b>HTML the crawler sees:</b> <code>{html || '(nothing yet)'}</code></p>
      <div style={{ border: '1px solid #ccc', padding: 8, minHeight: 70 }}>
        {items.length ? <ul>{items.map((p) => <li key={p}>{p}</li>)}</ul> : <i>blank screen / spinner...</i>}
      </div>
      <pre style={{ background: '#111', color: '#0f0', padding: 8 }}>{log.join('\\n')}</pre>
    </div>
  );
}`,
      },
      result:
        'In CSR mode the "HTML the crawler sees" is just an empty root div and the list appears after about 900 ms. In SSR mode the HTML already contains the list after about 250 ms and hydration completes later.',
      explanation:
        'CSR delays content until the JS bundle runs and the API call finishes, and the initial HTML is empty, which is why link previews and some crawlers see nothing. SSR does the data work on the server, so the first response already contains the content. Hydration then makes it interactive.',
    },
    {
      title: 'Same page written four ways in Next.js 15',
      scenario:
        'A product list page must be built. You write it as SSG, ISR, SSR and CSR to see that only the fetch options or the "use client" directive change.',
      steps: [
        'Create app/products/page.js',
        'Write the static version (no options, data fetched at build)',
        'Change it to ISR by adding export const revalidate = 60',
        'Change it to SSR with cache: "no-store"',
        'Write a CSR version as a Client Component with useEffect',
        'Run npm run build and read the route table: ○ Static, ƒ Dynamic',
      ],
      code: `// 1) SSG  - app/products/page.js
export default async function Products() {
  const res = await fetch('https://dummyjson.com/products', { cache: 'force-cache' });
  const { products } = await res.json();
  return <ul>{products.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}

// 2) ISR - regenerate at most once every 60 seconds
export const revalidate = 60;
// (same component as above)

// 3) SSR - fresh on every request
export default async function Products() {
  const res = await fetch('https://dummyjson.com/products', { cache: 'no-store' });
  const { products } = await res.json();
  return <ul>{products.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}

// 4) CSR - app/products/ProductsClient.js
'use client';
import { useEffect, useState } from 'react';

export default function ProductsClient() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('https://dummyjson.com/products')
      .then((r) => r.json())
      .then((d) => setProducts(d.products));
  }, []);
  return <ul>{products.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}

// npm run build output (shortened)
// Route (app)           Size
// ○ /products           ...   (Static)        <- SSG / ISR
// ƒ /products           ...   (Dynamic)       <- SSR`,
      result:
        'The build report marks SSG/ISR pages with ○ (Static, ISR shows the revalidate time) and SSR pages with ƒ (Dynamic, server-rendered on demand).',
      explanation:
        'In the App Router the rendering mode is inferred: cached fetches keep the page static, revalidate makes it ISR, no-store or request data (cookies, headers, searchParams) makes it dynamic. A "use client" component that fetches in useEffect is classic CSR.',
    },
    {
      title: 'ISR stale-while-revalidate, step by step',
      scenario:
        'A news list is generated with revalidate = 10 seconds. You want to understand exactly which visitor sees which version.',
      steps: [
        'Set export const revalidate = 10 on app/news/page.js',
        'Deploy (npm run build && npm start)',
        'Visit at t = 0: page v1 is served from cache',
        'Visit at t = 12: v1 still served instantly, regeneration starts in background',
        'Visit at t = 13: fresh v2 is served',
        'Use the playground to click through the timeline',
      ],
      code: `// app/news/page.js
export const revalidate = 10; // seconds

export default async function News() {
  const res = await fetch('https://api.example.com/news');
  const news = await res.json();
  return (
    <main>
      <p>Generated at: {new Date().toLocaleTimeString()}</p>
      <ul>{news.map((n) => <li key={n.id}>{n.title}</li>)}</ul>
    </main>
  );
}`,
      playground: {
        jsx: `// SIMULATION of ISR's stale-while-revalidate cache with a fake clock.
const { useState } = React;
const REVALIDATE = 10;

function App() {
  const [clock, setClock] = useState(0);
  const [cache, setCache] = useState({ version: 1, builtAt: 0 });
  const [log, setLog] = useState(['t=0 build: page v1 generated']);

  function visit() {
    const age = clock - cache.builtAt;
    if (age < REVALIDATE) {
      setLog((l) => [...l, 't=' + clock + ' visitor gets v' + cache.version + ' (fresh, age ' + age + 's)']);
    } else {
      const next = { version: cache.version + 1, builtAt: clock };
      setLog((l) => [...l,
        't=' + clock + ' visitor gets v' + cache.version + ' (STALE, age ' + age + 's) instantly',
        't=' + clock + ' background: regenerated v' + next.version]);
      setCache(next);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h2>ISR simulation (revalidate = {REVALIDATE}s)</h2>
      <p>Fake clock: <b>{clock}s</b> | cached page: <b>v{cache.version}</b> built at {cache.builtAt}s</p>
      <button onClick={() => setClock((c) => c + 3)}>+3 seconds</button>{' '}
      <button onClick={visit}>Visitor opens page</button>
      <ol>{log.map((line, i) => <li key={i}>{line}</li>)}</ol>
    </div>
  );
}`,
      },
      result:
        'Visits within 10 s of the build get the fresh version. The first visit after expiry still gets the old version instantly but triggers regeneration; the following visit gets the new version.',
      explanation:
        'ISR never makes a visitor wait for regeneration. The cost is that exactly one visitor (the first after expiry) sees stale data. That trade-off is ideal for catalogues and news feeds.',
    },
    {
      title: 'Choosing a rendering strategy per page',
      scenario:
        'You are planning an e-commerce site: Home, About, Product list, Product detail, Cart, Admin analytics, Live chat widget. Decide a strategy for each.',
      steps: [
        'List each page and ask: does Google need it?',
        'Ask: is the data the same for every user?',
        'Ask: how often does it change?',
        'Map the answers to SSG, ISR, SSR or CSR',
        'Try the playground decision helper with different answers',
      ],
      code: `Page               SEO?  Same for all?  Changes        Strategy
---------------------------------------------------------------------
Home / About       yes   yes            rarely         SSG
Product list       yes   yes            hourly         ISR (revalidate 3600)
Product detail     yes   yes            on price edit  ISR + on-demand revalidatePath
Cart / Checkout    no    no (per user)  every click    SSR (dynamic)
Admin analytics    no    no             every request  SSR, or CSR for live charts
Live chat widget   no    no             real time      CSR ("use client")`,
      playground: {
        jsx: `// Decision helper (plain React) - mirrors the questions from the theory.
const { useState } = React;

function pick({ seo, samePerUser, change }) {
  if (!seo && change === 'realtime') return 'CSR - client component, fetch/WebSocket in the browser';
  if (!samePerUser) return 'SSR - dynamic rendering on every request';
  if (change === 'rarely') return 'SSG - build once, serve from CDN';
  if (change === 'realtime') return 'SSR - fresh every request';
  return 'ISR - static + revalidate every N seconds';
}

function App() {
  const [a, setA] = useState({ seo: true, samePerUser: true, change: 'hourly' });
  const set = (k, v) => setA({ ...a, [k]: v });
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h2>Which rendering strategy?</h2>
      <label><input type="checkbox" checked={a.seo} onChange={(e) => set('seo', e.target.checked)} /> Needs SEO</label><br />
      <label><input type="checkbox" checked={a.samePerUser} onChange={(e) => set('samePerUser', e.target.checked)} /> Same content for every user</label><br />
      <label>Data changes:{' '}
        <select value={a.change} onChange={(e) => set('change', e.target.value)}>
          <option value="rarely">rarely</option>
          <option value="hourly">every few minutes / hours</option>
          <option value="realtime">every second / real time</option>
        </select>
      </label>
      <h3 style={{ color: 'teal' }}>{pick(a)}</h3>
    </div>
  );
}`,
      },
      result: 'Changing the answers updates the recommended strategy, e.g. SEO + same for all + hourly → ISR.',
      explanation:
        'The decision depends on audience (SEO), personalisation and freshness. Personalised pages cannot be shared from a CDN cache, so they are dynamic. Public, slowly changing pages benefit most from static or ISR.',
    },
  ],
  interview: [
    { q: 'What is Next.js and how is it different from React?', a: 'React is a UI library that renders components. Next.js is a full React framework that adds file-based routing, server rendering (SSR/SSG/ISR), React Server Components, data fetching with caching, API endpoints (Route Handlers), Server Actions, and build optimisations such as image/font optimisation and per-route code splitting.', level: 'Easy' },
    { q: 'Explain CSR, SSR, SSG and ISR in one line each.', a: 'CSR: the browser builds the page with JS after loading an empty HTML shell. SSR: the server builds HTML for every request. SSG: HTML is built once at build time and served from a CDN. ISR: static HTML that is regenerated in the background after a revalidate interval.', level: 'Easy' },
    { q: 'What is hydration?', a: 'Hydration is the process where React runs in the browser over HTML that was rendered on the server, attaching event handlers and state so the static markup becomes interactive. If server HTML and client render differ, you get a hydration mismatch warning.', level: 'Medium' },
    { q: 'Why is CSR considered bad for SEO?', a: 'The initial HTML is an empty root div. Content appears only after JS downloads, runs and fetches data. Some crawlers and almost all link-preview bots do not run JS, so they see no content. Google can render JS but it is slower and less reliable.', level: 'Easy' },
    { q: 'When would you choose SSR over SSG?', a: 'When the content is personalised (depends on cookies/session) or must be up to date on every request, for example a cart, account page or search results. SSG would serve the same stale HTML to everyone.', level: 'Medium' },
    { q: 'What does "stale-while-revalidate" mean in ISR?', a: 'After the revalidate time has passed, the next request still receives the cached (stale) page immediately, while Next.js regenerates the page in the background. Later requests get the regenerated version. No visitor waits for regeneration.', level: 'Medium' },
    { q: 'How do you choose SSR or ISR in the Next.js 15 App Router?', a: 'There is no getServerSideProps/getStaticProps. ISR: export const revalidate = N or fetch(url, { next: { revalidate: N } }). SSR: fetch(url, { cache: "no-store" }), export const dynamic = "force-dynamic", or using request APIs such as cookies(), headers() or searchParams.', level: 'Medium' },
    { q: 'What changed about fetch caching in Next.js 15?', a: 'In Next.js 14 fetch requests in Server Components were cached by default (force-cache). In Next.js 15 they are not cached by default; you opt in with cache: "force-cache" or next.revalidate. GET Route Handlers are also no longer cached by default.', level: 'Hard' },
    { q: 'Can one Next.js app use several rendering strategies?', a: 'Yes. The strategy is chosen per route (and per fetch/component). A marketing page can be static, the catalogue ISR, the dashboard dynamic and a chat widget a client component.', level: 'Easy' },
    { q: 'What is the difference between the App Router and the Pages Router?', a: 'The Pages Router (pages/ folder) is the older system using getServerSideProps/getStaticProps and only client components. The App Router (app/ folder, Next.js 13+) uses React Server Components by default, nested layouts, loading/error files, streaming and Server Actions. New projects should use the App Router.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a short table that assigns a rendering strategy (SSG/ISR/SSR/CSR) to these pages of a college website: Home, Course list, Exam results (per student), Notice board, Live class chat.',
      hint: 'Ask: SEO? same for everyone? how often does it change?',
      solution: `Home            -> SSG  (public, rarely changes)
Course list     -> ISR  (public, changes each semester; revalidate = 86400)
Exam results    -> SSR  (depends on logged-in student; dynamic)
Notice board    -> ISR  (public, changes a few times a day; revalidate = 300)
Live class chat -> CSR  (real time, no SEO, "use client" + WebSocket)`,
    },
    {
      task: 'Convert this Next.js page into ISR that refreshes at most every 5 minutes: an async Server Component that fetches https://dummyjson.com/quotes.',
      hint: 'Either a route segment config export or a fetch option.',
      solution: `// app/quotes/page.js
export const revalidate = 300; // 5 minutes

export default async function Quotes() {
  const res = await fetch('https://dummyjson.com/quotes');
  const { quotes } = await res.json();
  return (
    <ul>
      {quotes.map((q) => (
        <li key={q.id}>"{q.quote}" - {q.author}</li>
      ))}
    </ul>
  );
}

// Alternative: per-fetch
// await fetch('https://dummyjson.com/quotes', { next: { revalidate: 300 } });`,
    },
    {
      task: 'Build a plain React simulation (playground style) of SSG: a "Build" button generates a page snapshot from a data array; editing the data does NOT change what visitors see until you press Build again.',
      hint: 'Keep two states: liveData and builtSnapshot.',
      solution: `const { useState } = React;
function App() {
  const [data, setData] = useState(['Post A', 'Post B']);
  const [built, setBuilt] = useState(['Post A', 'Post B']);
  const [text, setText] = useState('');
  return (
    <div style={{ padding: 16 }}>
      <h3>CMS (live data)</h3>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => { setData([...data, text]); setText(''); }}>Add post</button>
      <p>{data.join(', ')}</p>
      <button onClick={() => setBuilt(data)}>Run next build</button>
      <h3>What visitors see (static HTML)</h3>
      <ul>{built.map((p) => <li key={p}>{p}</li>)}</ul>
    </div>
  );
}`,
    },
    {
      task: 'Explain in 4-5 sentences to a non-technical client why their marketing site should move from a Vite SPA to Next.js.',
      hint: 'Mention link previews, Google, speed, and one codebase.',
      solution:
        'Today our site sends an empty page that the visitor\'s phone must build with JavaScript, so Google and WhatsApp/LinkedIn previews often see nothing. Next.js builds the pages ahead of time on the server, so content appears instantly and search engines read everything. Static pages are served from a global CDN, which makes the site faster and cheaper to host. Product pages can refresh themselves automatically every few minutes without a redeploy. We can also keep the contact-form API in the same project, so there is one codebase to maintain.',
    },
  ],
  quiz: [
    { question: 'Which strategy renders HTML once during `next build` and serves the same file to everyone?', options: ['CSR', 'SSR', 'SSG', 'Hydration'], answer: 2, explanation: 'Static Site Generation renders at build time.' },
    { question: 'In CSR, what does the initial HTML usually contain?', options: ['The full page content', 'An empty root element plus script tags', 'Only CSS', 'A JSON file'], answer: 1, explanation: 'CSR sends an empty shell; JS renders the content later.' },
    { question: 'With ISR and revalidate = 60, what does the first visitor after 60 seconds receive?', options: ['The old cached page instantly, while a new one is generated', 'An error until regeneration finishes', 'A blank page', 'A redirect'], answer: 0, explanation: 'Stale-while-revalidate: serve stale, regenerate in background.' },
    { question: 'Which option makes a Next.js 15 fetch run fresh on every request?', options: ["{ next: { revalidate: 60 } }", "{ cache: 'force-cache' }", "{ static: true }", "{ cache: 'no-store' }"], answer: 3, explanation: "cache: 'no-store' opts out of caching, making the route dynamic." },
    { question: 'Which is the best fit for SSR?', options: ['Company About page', 'A logged-in user\'s order history page', 'Documentation site', 'A static landing page'], answer: 1, explanation: 'Personalised, per-request data needs dynamic server rendering.' },
  ],
};
