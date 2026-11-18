export default {
  id: 'day-07-data-fetching-server-components-caching-revalidation',
  title: 'Data Fetching in Server Components, fetch Caching and Revalidation',
  module: 'Module 2: Data & Rendering',
  day: 7,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Server Components can be async and fetch data directly, with no useEffect and no API layer in between. Learn the Next.js 15 fetch cache options (force-cache, no-store, revalidate, tags), on-demand revalidation, request memoisation, and how to avoid slow sequential waterfalls.',
  objectives: [
    'Fetch data with async/await inside Server Components and query a database directly',
    'Control caching per request with cache: "force-cache" | "no-store" and next: { revalidate, tags }',
    'Use route segment config (revalidate, dynamic) and on-demand revalidation with revalidatePath / revalidateTag',
    'Explain request memoisation and why calling the same fetch in many components is fine',
    'Fetch in parallel with Promise.all instead of creating waterfalls',
  ],
  theory: [
    {
      heading: 'Fetching data in a Server Component',
      content:
        'In plain React you fetch in `useEffect`, store the result in state, and handle loading. In a Next.js Server Component you just **make the component async and await the data**:\n\n- Runs on the server, close to your database/API (low latency)\n- Secrets (API keys) stay on the server\n- No client JavaScript for data fetching, no loading flicker for the first render\n- The HTML arrives with the data already in it\n\nYou can use `fetch`, an ORM (Prisma, Mongoose), the file system, or any Node library. Always check `res.ok` and throw on failure so the nearest `error.js` boundary can show a message (Day 9).\n\nAnalogy: instead of the waiter (browser) going back to the kitchen for every ingredient after you sit down, the chef (server) brings the finished plate.',
      syntax:
        "// app/users/page.js\nexport default async function UsersPage() {\n  const res = await fetch('https://jsonplaceholder.typicode.com/users');\n  if (!res.ok) throw new Error('Failed to load users');\n  const users = await res.json();\n  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;\n}",
    },
    {
      heading: 'fetch caching options in Next.js 15',
      content:
        'Next.js extends `fetch` on the server with a persistent **Data Cache** (shared across requests and deployments until revalidated).\n\n- **Default in Next.js 15**: not cached (equivalent to `no-store`) — but if the route has no other dynamic APIs, Next.js may still pre-render it statically at build time and the result stays in that static HTML\n- `fetch(url, { cache: \'force-cache\' })` → look in the Data Cache first; fetch and store only on a miss. Static until revalidated\n- `fetch(url, { cache: \'no-store\' })` → always fetch fresh; the route becomes **dynamic** (rendered per request)\n- `fetch(url, { next: { revalidate: 3600 } })` → cache, but treat as stale after 3600 s (time-based ISR)\n- `fetch(url, { next: { tags: [\'products\'] } })` → label the cache entry so you can purge it later with `revalidateTag(\'products\')`\n\n(Next.js 14 cached fetches by default. Many tutorials online still assume that, so check the version.)\n\nAnalogy: the Data Cache is a fridge. force-cache = cook once and keep in the fridge. revalidate = throw it out after N hours. no-store = always cook fresh. Tags = labels on containers so you can throw out all "products" boxes at once.',
      syntax:
        "await fetch(url, { cache: 'force-cache' });                 // static\nawait fetch(url, { cache: 'no-store' });                    // dynamic\nawait fetch(url, { next: { revalidate: 60 } });             // ISR, 60 s\nawait fetch(url, { next: { tags: ['products'] } });         // tag for on-demand purge\nawait fetch(url, { next: { revalidate: 3600, tags: ['products'] } });",
      tip: 'If two fetches in one route have different revalidate values, the lowest one decides how often the whole route is regenerated.',
    },
    {
      heading: 'Route segment config and non-fetch data',
      content:
        'You can set caching for a whole page or layout by exporting constants:\n- `export const revalidate = 60` → default revalidation time for the route (ISR)\n- `export const dynamic = \'force-dynamic\'` → always render per request\n- `export const dynamic = \'force-static\'` → force static, request APIs return empty values\n\n**Database or SDK calls do not go through `fetch`**, so the fetch cache options do not apply. The route\'s `revalidate` still applies to pre-rendered pages. To cache a specific function result across requests use `unstable_cache(fn, keyParts, { revalidate, tags })` from `next/cache` (or the newer experimental `"use cache"` directive). To deduplicate within one request use React\'s `cache()`.',
      syntax:
        "import { unstable_cache } from 'next/cache';\nimport { db } from '@/lib/db';\n\nexport const getProducts = unstable_cache(\n  async () => db.product.findMany(),\n  ['products'],\n  { revalidate: 3600, tags: ['products'] }\n);",
    },
    {
      heading: 'On-demand revalidation: revalidatePath and revalidateTag',
      content:
        'Time-based revalidation means data may be up to N seconds old. When you **know** the data changed (an admin edited a product, a CMS webhook fired), purge the cache immediately:\n\n- `revalidatePath(\'/products\')` → mark the cached page (and its data) for that path as stale\n- `revalidateTag(\'products\')` → purge every fetch tagged `products`, on every page that used it\n\nBoth are imported from `next/cache` and called on the server: in a **Server Action** (Day 11) or a **Route Handler** (Day 10). The next visit re-renders with fresh data.',
      syntax:
        "// app/api/revalidate/route.js\nimport { revalidateTag } from 'next/cache';\n\nexport async function POST(request) {\n  const secret = request.headers.get('x-secret');\n  if (secret !== process.env.REVALIDATE_SECRET) {\n    return Response.json({ ok: false }, { status: 401 });\n  }\n  revalidateTag('products');\n  return Response.json({ revalidated: true });\n}",
    },
    {
      heading: 'Request memoisation and parallel fetching',
      content:
        '**Request memoisation**: during a single render, if several components call `fetch` with the **same URL and options** (GET), React performs it only **once** and shares the result. So you can fetch the current user in the layout, the page and a sidebar without prop-drilling or extra network calls. It lasts only for that one request.\n\n**Waterfalls**: awaiting one request before starting the next adds their times together.\n\n```js\nconst user = await getUser();      // 300 ms\nconst posts = await getPosts();    // 400 ms  → total 700 ms\n```\n\nIf the second request does not depend on the first, start both and await together:\n\n```js\nconst [user, posts] = await Promise.all([getUser(), getPosts()]); // ≈ 400 ms\n```\n\nSequential is correct only when request B needs data from A (e.g. fetch the user, then fetch that user\'s orders by `user.id`).\n\nComing next (Day 8): rendering strategies and streaming slow parts with Suspense so the fast parts show first.',
    },
  ],
  examples: [
    {
      title: 'A posts page with ISR and a tagged cache',
      scenario: 'A blog list should be fast (cached) but refresh at least every 10 minutes, and immediately when an editor publishes.',
      steps: [
        'Create app/posts/page.js as an async Server Component',
        'Fetch with next: { revalidate: 600, tags: ["posts"] }',
        'Create a revalidation Route Handler that calls revalidateTag("posts")',
        'Run npm run build: the route shows as ○ with Revalidate 10m',
        'Use the playground to watch the simulated Data Cache',
      ],
      code: `// app/posts/page.js
import Link from 'next/link';

async function getPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5', {
    next: { revalidate: 600, tags: ['posts'] },
  });
  if (!res.ok) throw new Error('Could not load posts');
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  return (
    <main>
      <h1>Latest posts</h1>
      <ul>
        {posts.map((p) => (
          <li key={p.id}><Link href={'/posts/' + p.id}>{p.title}</Link></li>
        ))}
      </ul>
    </main>
  );
}

// app/api/revalidate-posts/route.js
import { revalidateTag } from 'next/cache';
export async function POST() {
  revalidateTag('posts');
  return Response.json({ revalidated: true });
}`,
      playground: {
        jsx: `// SIMULATION of the Next.js Data Cache with a fake clock (plain React, no real server).
const { useState } = React;

function App() {
  const [clock, setClock] = useState(0);
  const [origin, setOrigin] = useState(1);            // version of data at the "API"
  const [cache, setCache] = useState(null);           // { version, storedAt, tags }
  const [option, setOption] = useState('revalidate');
  const [log, setLog] = useState([]);
  const say = (m) => setLog((l) => [...l.slice(-7), 't=' + clock + 's ' + m]);

  function render() {
    if (option === 'no-store') { say('no-store: fetched origin v' + origin + ' (route is dynamic)'); return; }
    if (!cache) { setCache({ version: origin, storedAt: clock }); say('MISS: fetched v' + origin + ' and stored in Data Cache'); return; }
    const age = clock - cache.storedAt;
    if (option === 'revalidate' && age >= 600) {
      say('STALE (age ' + age + 's): served v' + cache.version + ', refetching in background -> v' + origin);
      setCache({ version: origin, storedAt: clock });
      return;
    }
    say('HIT: served cached v' + cache.version + ' (age ' + age + 's)');
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <h3>fetch(url, {option === 'no-store' ? "{ cache: 'no-store' }" : option === 'force' ? "{ cache: 'force-cache' }" : '{ next: { revalidate: 600, tags: ["posts"] } }'})</h3>
      <select value={option} onChange={(e) => { setOption(e.target.value); setCache(null); setLog([]); }}>
        <option value="revalidate">revalidate: 600 + tags</option>
        <option value="force">force-cache</option>
        <option value="no-store">no-store</option>
      </select>
      <p>Clock {clock}s | API data v{origin} | cached: {cache ? 'v' + cache.version : 'empty'}</p>
      <button onClick={render}>Visit /posts</button>{' '}
      <button onClick={() => setClock(clock + 300)}>+5 min</button>{' '}
      <button onClick={() => setOrigin(origin + 1)}>Editor publishes (API v+1)</button>{' '}
      <button onClick={() => { setCache(null); say("revalidateTag('posts'): cache entry purged"); }}>revalidateTag('posts')</button>
      <ol>{log.map((l, i) => <li key={i}>{l}</li>)}</ol>
    </div>
  );
}`,
      },
      result:
        'With revalidate, visits are HITs until 600 s; the next visit is served stale and refreshes. Publishing does not show up until revalidation or until you click revalidateTag, after which the next visit is a MISS with the new version. With force-cache only revalidateTag refreshes; with no-store every visit fetches.',
      explanation:
        'The simulation mirrors the Data Cache rules: cached entries are reused, time-based revalidation uses stale-while-revalidate, tags allow precise on-demand purging, and no-store bypasses the cache and makes the route dynamic.',
    },
    {
      title: 'Parallel vs sequential fetching',
      scenario: 'A profile page needs the user (300 ms) and their recommended products (400 ms). They are independent.',
      steps: [
        'Write a sequential version and measure the time',
        'Rewrite with Promise.all',
        'Run the playground: it times both approaches with simulated delays',
      ],
      code: `// app/profile/page.js
async function getUser() {
  const res = await fetch('https://dummyjson.com/users/1', { cache: 'no-store' });
  return res.json();
}
async function getRecommended() {
  const res = await fetch('https://dummyjson.com/products?limit=4', { next: { revalidate: 3600 } });
  return res.json();
}

export default async function Profile() {
  // ❌ waterfall: ~700 ms
  // const user = await getUser();
  // const rec = await getRecommended();

  // ✅ parallel: ~400 ms
  const [user, rec] = await Promise.all([getUser(), getRecommended()]);

  return (
    <main>
      <h1>Hi {user.firstName}</h1>
      <h2>Recommended for you</h2>
      <ul>{rec.products.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
    </main>
  );
}`,
      playground: {
        jsx: `// SIMULATION: timing sequential vs parallel awaits with fake delays.
const { useState } = React;
const wait = (ms, value) => new Promise((r) => setTimeout(() => r(value), ms));
const getUser = () => wait(300, { name: 'Asha' });
const getRecommended = () => wait(400, ['Mouse', 'Keyboard']);

function App() {
  const [out, setOut] = useState({});

  async function run(kind) {
    setOut((o) => ({ ...o, [kind]: 'running...' }));
    const t0 = performance.now();
    if (kind === 'sequential') {
      await getUser();
      await getRecommended();
    } else {
      await Promise.all([getUser(), getRecommended()]);
    }
    const ms = Math.round(performance.now() - t0);
    setOut((o) => ({ ...o, [kind]: ms + ' ms' }));
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <p>getUser = 300 ms, getRecommended = 400 ms</p>
      <button onClick={() => run('sequential')}>Run sequential</button> {out.sequential}<br /><br />
      <button onClick={() => run('parallel')}>Run Promise.all</button> {out.parallel}
    </div>
  );
}`,
      },
      result: 'Sequential takes about 700 ms; Promise.all takes about 400 ms.',
      explanation: 'Each await pauses until its promise resolves. Starting both promises before awaiting lets the delays overlap, so the total equals the slowest request.',
    },
    {
      title: 'Request memoisation: fetch the same data in layout and page',
      scenario: 'Both the dashboard layout (for the avatar) and the page (for the greeting) need the current user.',
      steps: [
        'Create lib/user.js with getCurrentUser() calling fetch',
        'Call it in app/dashboard/layout.js and app/dashboard/page.js',
        'Check the server logs: only one network request per page render',
      ],
      code: `// lib/user.js
export async function getCurrentUser() {
  console.log('fetching user...');
  const res = await fetch('https://dummyjson.com/users/1');
  return res.json();
}

// app/dashboard/layout.js
import { getCurrentUser } from '@/lib/user';
export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();
  return (
    <div>
      <header>Avatar: {user.firstName[0]}</header>
      {children}
    </div>
  );
}

// app/dashboard/page.js
import { getCurrentUser } from '@/lib/user';
export default async function Dashboard() {
  const user = await getCurrentUser(); // same URL + options -> memoised
  return <h1>Welcome back, {user.firstName}</h1>;
}

// For non-fetch functions (DB queries) wrap with React cache():
// import { cache } from 'react';
// export const getUserById = cache(async (id) => db.user.findUnique({ where: { id } }));`,
      result: 'The server log prints "fetching user..." twice (both functions run) but only ONE HTTP request is made per render; both components get the same object.',
      explanation:
        'React memoises fetch GET requests with identical URL and options for the lifetime of one server render. For ORM calls use React\'s cache() for the same effect. Memoisation is per request; the Data Cache is across requests.',
    },
    {
      title: 'Querying a database directly in a Server Component',
      scenario: 'There is no separate API: the page reads products straight from the database with Prisma.',
      steps: [
        'Create lib/db.js that exports a Prisma client (import "server-only")',
        'Import it in an async page and await the query',
        'Set export const revalidate = 300 to cache the rendered page for 5 minutes',
      ],
      code: `// lib/db.js
import 'server-only';
import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis;
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// app/products/page.js
import { db } from '@/lib/db';

export const revalidate = 300; // ISR for the whole route

export default async function Products() {
  const products = await db.product.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  return (
    <ul>
      {products.map((p) => <li key={p.id}>{p.name} - Rs {p.price}</li>)}
    </ul>
  );
}`,
      result: 'The page lists the 20 newest products; the database is queried at most once every 5 minutes for this route.',
      explanation:
        'Server Components can talk to the database directly, so no REST endpoint is needed for reading. Because Prisma is not fetch, the segment-level revalidate controls caching. Prisma setup in detail comes on Day 13.',
    },
  ],
  interview: [
    { q: 'How do you fetch data in a Next.js Server Component?', a: 'Make the component async and await the data directly with fetch, an ORM or any server library. No useEffect or useState is needed, and the HTML is rendered with the data included.', level: 'Easy' },
    { q: 'What is the default fetch caching behaviour in Next.js 15?', a: 'fetch is not cached by default (no-store semantics). You opt in with cache: "force-cache" or next.revalidate. In Next.js 14 the default was force-cache. Note a route with no dynamic APIs can still be statically pre-rendered at build time.', level: 'Medium' },
    { q: 'Explain cache: "no-store" vs next: { revalidate: 60 }.', a: 'no-store always fetches fresh data and makes the route dynamic. revalidate: 60 stores the response in the Data Cache and reuses it, refreshing it in the background after 60 seconds (stale-while-revalidate).', level: 'Medium' },
    { q: 'What is the difference between revalidatePath and revalidateTag?', a: 'revalidatePath purges the cache for a specific route path. revalidateTag purges all cached fetches labelled with a tag (via next: { tags }), wherever they are used. Both are server-only functions from next/cache, typically called in Server Actions or Route Handlers.', level: 'Medium' },
    { q: 'What is request memoisation?', a: 'During a single server render, identical fetch GET requests (same URL and options) are executed only once and the result is shared across components. It lasts for one request only. For non-fetch functions use React cache().', level: 'Hard' },
    { q: 'What is the difference between request memoisation and the Data Cache?', a: 'Memoisation deduplicates calls within one render and is discarded afterwards. The Data Cache persists fetch results across requests and deployments until they are revalidated.', level: 'Hard' },
    { q: 'How do you avoid request waterfalls?', a: 'Start independent requests at the same time and await them together with Promise.all (or Promise.allSettled), or move them into separate components wrapped in Suspense so they stream independently.', level: 'Medium' },
    { q: 'How do you cache a database query that does not use fetch?', a: 'Use the route segment config (export const revalidate), unstable_cache from next/cache with keyParts, revalidate and tags, or the experimental "use cache" directive. React cache() only deduplicates within one request.', level: 'Hard' },
    { q: 'What does export const dynamic = "force-dynamic" do?', a: 'It forces the route to render on every request, as if all fetches were no-store, opting out of static pre-rendering.', level: 'Medium' },
    { q: 'Why should you throw when res.ok is false?', a: 'fetch does not reject on HTTP errors like 404 or 500. Throwing lets the nearest error.js boundary show an error UI instead of rendering broken data, and avoids caching a bad response by mistake.', level: 'Easy' },
    { q: 'If one fetch has revalidate 60 and another 3600 in the same page, how often is the page regenerated?', a: 'The lowest value wins for the route, so about every 60 seconds; each fetch still keeps its own Data Cache lifetime.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create /todos that fetches https://jsonplaceholder.typicode.com/todos?_limit=10 with a 1-minute revalidation and shows done todos with a line-through.',
      hint: 'next: { revalidate: 60 }',
      solution: `// app/todos/page.js
export default async function Todos() {
  const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10', {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to load todos');
  const todos = await res.json();
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id} style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title}</li>
      ))}
    </ul>
  );
}`,
    },
    {
      task: 'Make a "live price" page that must never be cached, using two different ways (fetch option and segment config).',
      hint: 'no-store and force-dynamic.',
      solution: `// Way 1: per fetch
const res = await fetch('https://api.example.com/price/BTC', { cache: 'no-store' });

// Way 2: whole route
// app/price/page.js
export const dynamic = 'force-dynamic';
export default async function Price() {
  const res = await fetch('https://api.example.com/price/BTC');
  const { price } = await res.json();
  return <h1>BTC: {price}</h1>;
}`,
    },
    {
      task: 'Rewrite this waterfall into parallel fetching:\nconst user = await fetch(u1).then(r=>r.json());\nconst cart = await fetch(u2).then(r=>r.json());\nconst offers = await fetch(u3).then(r=>r.json());',
      hint: 'Promise.all with destructuring.',
      solution: `const [user, cart, offers] = await Promise.all([
  fetch(u1).then((r) => r.json()),
  fetch(u2).then((r) => r.json()),
  fetch(u3).then((r) => r.json()),
]);`,
    },
    {
      task: 'Write a secured Route Handler POST /api/revalidate?tag=products that revalidates the given tag only when the header x-secret equals process.env.REVALIDATE_SECRET.',
      hint: 'request.nextUrl.searchParams, revalidateTag.',
      solution: `// app/api/revalidate/route.js
import { revalidateTag } from 'next/cache';

export async function POST(request) {
  if (request.headers.get('x-secret') !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 });
  }
  const tag = request.nextUrl.searchParams.get('tag');
  if (!tag) return Response.json({ message: 'tag is required' }, { status: 400 });
  revalidateTag(tag);
  return Response.json({ revalidated: true, tag });
}`,
    },
  ],
  quiz: [
    { question: 'Which fetch option makes a route dynamic in Next.js 15?', options: ["{ cache: 'no-store' }", "{ cache: 'force-cache' }", '{ next: { revalidate: 60 } }', '{ next: { tags: ["a"] } }'], answer: 0, explanation: 'no-store opts out of the Data Cache, forcing per-request rendering.' },
    { question: 'Where are revalidatePath and revalidateTag imported from?', options: ['next/navigation', 'react', 'next/cache', 'next/server'], answer: 2, explanation: 'Both live in next/cache.' },
    { question: 'Three independent requests take 200, 300 and 500 ms. With Promise.all the total is about...', options: ['1000 ms', '200 ms', '300 ms', '500 ms'], answer: 3, explanation: 'Parallel requests take as long as the slowest one.' },
    { question: 'Request memoisation applies to...', options: ['All requests for 1 hour', 'Identical fetch GET calls within one server render', 'Only Client Components', 'POST requests only'], answer: 1, explanation: 'It deduplicates within a single render pass.' },
    { question: 'What does next: { tags: ["products"] } allow you to do?', options: ['Purge that cached data later with revalidateTag("products")', 'Make the request a POST', 'Add an HTTP header', 'Rename the route'], answer: 0, explanation: 'Tags enable on-demand revalidation.' },
  ],
};
