export default {
  id: 'day-11-performance-caching-redis-optimisation',
  title: 'Performance and Caching: Redis, Compression, MongoDB Query Optimisation, React Performance and CDN',
  module: 'Module 4: Production',
  day: 11,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Make a MERN app fast at every layer: cache hot API responses in Redis with the cache-aside pattern, compress responses, fix slow MongoDB queries with indexes, lean() and projections, keep React renders cheap, and serve static assets from a CDN.',
  objectives: [
    'Measure first: find the slow layer using browser DevTools, server timing logs and MongoDB explain()',
    'Implement cache-aside with Redis (node-redis v4/v5) including TTL and invalidation on writes',
    'Add gzip/brotli compression and correct Cache-Control headers for API and static files',
    'Optimise MongoDB queries with compound indexes, projections, lean() and avoiding N+1 queries',
    'Apply React performance techniques: code splitting, memoisation, list virtualisation and TanStack Query caching',
  ],
  theory: [
    {
      heading: 'Measure before you optimise: where does the time go?',
      content:
        'A request in a MERN app passes through many layers: **browser → CDN → load balancer → Express → MongoDB/Redis → Express → browser → React render**. Any one of them can be the slow part. Guessing wastes time, so always **measure first**.\n\nAnalogy: a doctor does not give medicine before checking your temperature and blood report. Performance work is the same: diagnose, then treat.\n\nTools to measure each layer:\n\n- **Browser**: Chrome DevTools Network tab (TTFB = time to first byte, download size), Lighthouse score, Core Web Vitals (LCP, INP, CLS).\n- **React**: React DevTools Profiler shows which components re-render and how long they take.\n- **Express**: a tiny timing middleware or `morgan(\':method :url :status :response-time ms\')`; the `Server-Timing` header shows server time inside DevTools.\n- **MongoDB**: `.explain(\'executionStats\')` shows whether a query used an index (`IXSCAN`) or scanned the whole collection (`COLLSCAN`); Atlas has a Performance Advisor and Query Profiler.\n\nRule of thumb for Indian users on mobile networks: **bytes and round trips** often matter more than CPU. Smaller bundles, fewer requests and caching usually give the biggest wins.',
      syntax:
        "// Simple timing middleware (Express 5)\napp.use((req, res, next) => {\n  const start = process.hrtime.bigint();\n  res.on('finish', () => {\n    const ms = Number(process.hrtime.bigint() - start) / 1e6;\n    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);\n  });\n  next();\n});",
      tip: 'Optimise the slowest layer first. Making a 5 ms React render 2 ms faster is useless when the API call takes 900 ms because of a missing index.',
    },
    {
      heading: 'Caching with Redis: the cache-aside pattern',
      content:
        '**Redis** is an in-memory key-value store. Reading from RAM takes well under a millisecond, while a heavy MongoDB aggregation can take hundreds of milliseconds. So we keep **copies of frequently read, rarely changed data** (product lists, categories, home-page feed) in Redis.\n\nThe most common pattern is **cache-aside (lazy loading)**:\n\n1. Request comes in → build a cache key, e.g. `products:category=phones:page=1`.\n2. `GET key` from Redis. If found (**cache hit**) → return it immediately.\n3. If not found (**cache miss**) → query MongoDB, store the result with `SET key value EX 60` (expire in 60 seconds), then return it.\n4. When data changes (create/update/delete) → **invalidate** (delete) the related keys so users do not see stale data.\n\nAnalogy: a shopkeeper keeps the 20 most sold items on the counter (cache) and the rest in the godown (database). Fast items are served instantly; if something is not on the counter, he fetches it from the godown and maybe keeps a few on the counter for the next customer.\n\nOther Redis uses in MERN apps: session/refresh-token store, rate-limit counters, Socket.IO adapter for multiple servers, job queues (BullMQ), leaderboards (sorted sets).',
      points: [
        'Always set a TTL (expiry) so a bug in invalidation cannot serve stale data forever',
        'Cache only data that is read often and is the same for many users; never cache per-user secrets under a shared key',
        'Key naming convention: resource:filters:page, e.g. products:cat=phones:p=1',
        'Cache stampede: when a hot key expires, many requests hit MongoDB together; fix with short locks, request coalescing or slightly random TTLs',
        'Redis is a cache, not the source of truth: the app must still work (slower) if Redis is down',
      ],
    },
    {
      heading: 'HTTP-level performance: compression, Cache-Control, ETag and CDN',
      content:
        '**Compression**: JSON and JS/CSS are text, so they compress 70-90%. In Express add the `compression` middleware (gzip/deflate; brotli in newer versions) or, better in production, let **Nginx / the CDN / the hosting platform** compress. Vercel, Netlify and Cloudflare compress static assets automatically with brotli.\n\n**Cache-Control headers** tell browsers and CDNs how long they may reuse a response:\n\n- Vite build files have content hashes in their names (`assets/index-4f9a2c.js`), so they can be cached forever: `Cache-Control: public, max-age=31536000, immutable`.\n- `index.html` must NOT be cached for long (`no-cache`), otherwise users never get the new bundle names after a deploy.\n- Public API responses (e.g. categories) can use `public, max-age=60`. Private user data uses `private, no-store`.\n\n**ETag**: Express automatically adds a weak ETag to `res.json()`/`res.send()` responses. The browser sends `If-None-Match` next time; if nothing changed Express replies **304 Not Modified** with no body, saving bandwidth.\n\n**CDN (Content Delivery Network)**: copies of your static files (and images via Cloudinary) are stored on edge servers in Mumbai, Chennai, Delhi, etc. A user in Pune downloads from the nearest edge, not from your server in Oregon.',
      syntax:
        "import compression from 'compression';\napp.use(compression({ threshold: 1024 })); // only compress bodies > 1 KB\n\n// serve the built React app with smart caching\napp.use('/assets', express.static('client/dist/assets', { immutable: true, maxAge: '1y' }));\napp.get('/{*splat}', (req, res) => {\n  res.set('Cache-Control', 'no-cache');\n  res.sendFile(path.resolve('client/dist/index.html'));\n});",
      tip: 'Do not compress already-compressed files (JPEG, PNG, MP4, ZIP). It wastes CPU and saves nothing.',
    },
    {
      heading: 'MongoDB query optimisation',
      content:
        'Most slow MERN APIs are slow because of the database. The main tools:\n\n1. **Indexes**: create an index that matches your filter + sort. For `find({ category, inStock: true }).sort({ price: 1 })` use a **compound index** `{ category: 1, inStock: 1, price: 1 }`. Follow the **ESR rule**: **E**quality fields first, then **S**ort fields, then **R**ange fields.\n2. **Projection**: return only fields you need: `.select(\'name price image\')`. Smaller documents = less network and memory.\n3. **lean()**: Mongoose normally builds full documents with getters, setters and change tracking. For read-only API responses use `.lean()` to get plain objects; it is noticeably faster and uses less memory.\n4. **Avoid N+1 queries**: do not loop over 50 orders and query the user for each one (51 queries). Use `populate()` (Mongoose batches it into one `$in` query) or a `$lookup` aggregation.\n5. **Paginate** with limits (never return 10,000 documents) and use cursor-based pagination for big collections.\n6. **Aggregation**: put `$match` (and `$sort` + `$limit`) as early as possible so later stages work on fewer documents.\n7. **Connection pool**: create ONE Mongoose connection at server start and reuse it (`maxPoolSize` default is 100 in the Node driver); never connect inside a route.\n\nAnalogy: an index is like the index at the back of a textbook. Without it you read every page (COLLSCAN); with it you jump to the exact page (IXSCAN).',
      syntax:
        "// schema index (ESR: equality, sort, range)\nproductSchema.index({ category: 1, inStock: 1, price: 1 });\n\n// optimised query\nconst items = await Product.find({ category: 'phones', inStock: true })\n  .sort({ price: 1 })\n  .select('name price image')\n  .limit(20)\n  .lean();\n\n// check it\nconst plan = await Product.find({ category: 'phones', inStock: true })\n  .sort({ price: 1 }).explain('executionStats');\nconsole.log(plan.queryPlanner.winningPlan, plan.executionStats.totalDocsExamined);",
      tip: 'Every index speeds up reads but slows down writes and uses RAM. Add indexes for real query patterns, not for every field. Remove unused ones (Atlas shows index usage).',
    },
    {
      heading: 'React performance in a MERN frontend',
      content:
        'On the client, performance means **small bundles** and **cheap re-renders**.\n\n- **Code splitting**: load each page only when needed with `React.lazy(() => import(\'./pages/Admin\'))` + `<Suspense>`. React Router 7 also supports `lazy` routes. Admin pages, charts and editors are perfect candidates.\n- **TanStack Query cache**: set a sensible `staleTime` (e.g. 60 seconds) so moving between pages does not refetch the same list again and again. Use `queryClient.prefetchQuery` on hover for instant navigation.\n- **Avoid unnecessary re-renders**: keep state close to where it is used; split big contexts; use `React.memo`, `useMemo` and `useCallback` for expensive children or calculations (React 19 with the React Compiler can do much of this automatically, but you should still understand it).\n- **Debounce** search inputs so you send one request after the user stops typing, not one per key press.\n- **Virtualise long lists** (`@tanstack/react-virtual` or `react-window`) so only the ~20 visible rows are in the DOM instead of 5,000.\n- **Images**: use Cloudinary transformations (`f_auto,q_auto,w_400`), `loading="lazy"`, and set `width`/`height` to avoid layout shift (CLS).\n- **Analyse the bundle**: `npx vite-bundle-visualizer` shows which library is huge (e.g. moment.js → replace with date-fns or dayjs).',
      points: [
        'Measure with React DevTools Profiler before adding memo everywhere',
        'useMemo/useCallback have a cost too; use them for expensive work or to keep props stable for memoised children',
        'Lighthouse target: LCP < 2.5 s, INP < 200 ms, CLS < 0.1',
      ],
    },
    {
      heading: 'Scaling the Node server: cluster, PM2 and statelessness',
      content:
        'One Node process uses one CPU core for JavaScript. On a 4-core machine you can run 4 processes using **PM2 cluster mode** (`pm2 start server.js -i max`) or run several containers behind a load balancer (Render/Railway/Kubernetes do this when you scale instances).\n\nTo scale horizontally, the server must be **stateless**:\n\n- Do not keep sessions or caches in a JS variable (each process has its own memory). Use **Redis**.\n- Do not store uploads on local disk; use **Cloudinary/S3**.\n- Socket.IO across many servers needs the **Redis adapter** (`@socket.io/redis-adapter`).\n\nAlso move slow work out of the request: sending emails, generating PDFs, resizing images → put a job in a queue (BullMQ on Redis) and let a worker process handle it. The API responds in 50 ms instead of 3 seconds.',
      tip: 'Never block the event loop with heavy synchronous work (big JSON.parse, bcrypt with hashSync, image processing). Use async APIs, worker threads or a background worker.',
    },
  ],
  examples: [
    {
      title: 'Cache-aside pattern simulated with an in-memory cache',
      scenario:
        'The /api/products endpoint is slow because it runs a heavy query. We add cache-aside: first request goes to the "database" (miss), next requests are served from cache (hit). An X-Cache header shows HIT or MISS.',
      steps: [
        'Create a Map called cache (stands in for Redis) and a fake db object that counts how many times it is queried',
        'Build a cache key from the query string (category + page)',
        'On a miss, read from db, store in cache, set X-Cache: MISS',
        'On a hit, return cached data with X-Cache: HIT',
        'Click Run server and send the requests in order; watch dbQueries stay at 1 for repeated requests',
      ],
      code: `const express = require('express');
const app = express();

const products = [
  { id: 1, name: 'Redmi Note 13', category: 'phones', price: 15999 },
  { id: 2, name: 'iPhone 15', category: 'phones', price: 69999 },
  { id: 3, name: 'boAt Airdopes', category: 'audio', price: 1299 },
];

let dbQueries = 0;                 // how many times we hit the "database"
const cache = new Map();           // stands in for Redis

function slowDbFind(category) {    // pretend this is a heavy MongoDB query
  dbQueries++;
  return products.filter(p => !category || p.category === category);
}

app.get('/api/products', (req, res) => {
  const category = req.query.category || 'all';
  const key = 'products:cat=' + category;

  if (cache.has(key)) {
    res.set('X-Cache', 'HIT');
    return res.json({ source: 'cache', dbQueries, data: cache.get(key) });
  }
  const data = slowDbFind(category === 'all' ? null : category);
  cache.set(key, data);            // Redis: SET key value EX 60
  res.set('X-Cache', 'MISS');
  res.json({ source: 'db', dbQueries, data });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      api: {
        code: `const express = require('express');
const app = express();

const products = [
  { id: 1, name: 'Redmi Note 13', category: 'phones', price: 15999 },
  { id: 2, name: 'iPhone 15', category: 'phones', price: 69999 },
  { id: 3, name: 'boAt Airdopes', category: 'audio', price: 1299 },
];

let dbQueries = 0;                 // how many times we hit the "database"
const cache = new Map();           // stands in for Redis

function slowDbFind(category) {    // pretend this is a heavy MongoDB query
  dbQueries++;
  return products.filter(p => !category || p.category === category);
}

app.get('/api/products', (req, res) => {
  const category = req.query.category || 'all';
  const key = 'products:cat=' + category;

  if (cache.has(key)) {
    res.set('X-Cache', 'HIT');
    return res.json({ source: 'cache', dbQueries, data: cache.get(key) });
  }
  const data = slowDbFind(category === 'all' ? null : category);
  cache.set(key, data);            // Redis: SET key value EX 60
  res.set('X-Cache', 'MISS');
  res.json({ source: 'db', dbQueries, data });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/products?category=phones' },
          { method: 'GET', url: '/api/products?category=phones' },
          { method: 'GET', url: '/api/products?category=audio' },
          { method: 'GET', url: '/api/products?category=phones' },
        ],
      },
      result: "GET /api/products?category=phones → 200 {\"source\":\"db\",\"dbQueries\":1,\"data\":[{\"id\":1,\"name\":\"Redmi Note 13\",\"category\":\"phones\",\"price\":15999},{\"id\":2,\"name\":\"iPhone 15\",\"category\":\"phones\",\"price\":69999}]}\nGET /api/products?category=phones → 200 {\"source\":\"cache\",\"dbQueries\":1,\"data\":[{\"id\":1,\"name\":\"Redmi Note 13\",\"category\":\"phones\",\"price\":15999},{\"id\":2,\"name\":\"iPhone 15\",\"category\":\"phones\",\"price\":69999}]}\nGET /api/products?category=audio → 200 {\"source\":\"db\",\"dbQueries\":2,\"data\":[{\"id\":3,\"name\":\"boAt Airdopes\",\"category\":\"audio\",\"price\":1299}]}\nGET /api/products?category=phones → 200 {\"source\":\"cache\",\"dbQueries\":2,\"data\":[{\"id\":1,\"name\":\"Redmi Note 13\",\"category\":\"phones\",\"price\":15999},{\"id\":2,\"name\":\"iPhone 15\",\"category\":\"phones\",\"price\":69999}]}",
      explanation:
        'The first phones request is a MISS, so dbQueries becomes 1. The second phones request is a HIT and dbQueries stays 1: the database was not touched. audio is a different key, so it is a new MISS (dbQueries 2). Phones is still cached. With real Redis the Map becomes redis.get/redis.set with an EX expiry, and the data survives server restarts and is shared by all server instances.',
    },
    {
      title: 'Cache invalidation on writes',
      scenario:
        'An admin adds a new product. If we do not clear the cache, users keep seeing the old list. We delete every products:* key after a successful write.',
      steps: [
        'Reuse the cache-aside GET handler',
        'Add POST /api/products that validates and pushes the new product',
        'After the write, delete all keys starting with "products:" (Redis: SCAN + DEL, or keep a set of keys / version number)',
        'Send GET (miss), GET (hit), POST, GET again; the last GET is a MISS and includes the new product',
      ],
      code: `// Real Redis version of invalidation (node-redis v4+)
async function invalidateProducts(redis) {
  // SCAN is non-blocking; never use KEYS * in production
  for await (const keys of redis.scanIterator({ MATCH: 'products:*', COUNT: 100 })) {
    // node-redis v5 yields arrays of keys; v4 yields single keys
    const list = Array.isArray(keys) ? keys : [keys];
    if (list.length) await redis.del(list);
  }
}

router.post('/', protect, adminOnly, async (req, res) => {
  const product = await Product.create(req.body);
  await invalidateProducts(redis);
  res.status(201).json(product);
});`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const products = [{ id: 1, name: 'Redmi Note 13', price: 15999 }];
let dbQueries = 0;
const cache = new Map();

app.get('/api/products', (req, res) => {
  const key = 'products:all';
  if (cache.has(key)) return res.json({ source: 'cache', dbQueries, count: cache.get(key).length });
  dbQueries++;
  const data = [...products];
  cache.set(key, data);
  res.json({ source: 'db', dbQueries, count: data.length });
});

app.post('/api/products', (req, res) => {
  const { name, price } = req.body || {};
  if (!name || typeof price !== 'number') {
    return res.status(400).json({ error: 'name and numeric price are required' });
  }
  const product = { id: products.length + 1, name, price };
  products.push(product);
  // invalidate every products:* key
  for (const key of cache.keys()) if (key.startsWith('products:')) cache.delete(key);
  res.status(201).json(product);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/products' },
          { method: 'GET', url: '/api/products' },
          { method: 'POST', url: '/api/products', body: { name: 'Samsung M35', price: 17999 } },
          { method: 'GET', url: '/api/products' },
        ],
      },
      result: "GET /api/products → 200 {\"source\":\"db\",\"dbQueries\":1,\"count\":1}\nGET /api/products → 200 {\"source\":\"cache\",\"dbQueries\":1,\"count\":1}\nPOST /api/products → 201 {\"id\":2,\"name\":\"Samsung M35\",\"price\":17999}\nGET /api/products → 200 {\"source\":\"db\",\"dbQueries\":2,\"count\":2}",
      explanation:
        'After the POST the cached list is deleted, so the next GET is a database read again (dbQueries 2) and count is 2. Without invalidation the last GET would still say count 1 until the TTL expired. The real Redis code uses scanIterator (SCAN) instead of KEYS because KEYS blocks Redis while it scans every key.',
    },
    {
      title: 'Production Redis cache middleware (real code)',
      scenario: 'Turn cache-aside into reusable Express middleware backed by Redis, with TTL, graceful fallback when Redis is down, and an X-Cache header.',
      steps: [
        'Install: npm i redis compression',
        'Run Redis locally with Docker: docker run -d -p 6379:6379 redis:7-alpine (or use Upstash/Redis Cloud in production)',
        'Create server/src/lib/redis.js that connects once at startup',
        'Create server/src/middleware/cache.js that wraps res.json to store the response',
        'Use cache(60) on public GET routes and invalidate in write controllers',
      ],
      code: `// server/src/lib/redis.js
import { createClient } from 'redis';

export const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redis.on('error', (err) => console.error('Redis error:', err.message));
export async function connectRedis() {
  try { await redis.connect(); console.log('Redis connected'); }
  catch (e) { console.warn('Redis unavailable, running without cache'); }
}

// server/src/middleware/cache.js
import { redis } from '../lib/redis.js';

export const cache = (ttlSeconds = 60) => async (req, res, next) => {
  if (req.method !== 'GET' || !redis.isReady) return next();
  const key = 'cache:' + req.originalUrl;          // e.g. cache:/api/products?category=phones&page=1
  try {
    const hit = await redis.get(key);
    if (hit) {
      res.set('X-Cache', 'HIT');
      return res.type('json').send(hit);
    }
  } catch { return next(); }                        // Redis problem: just skip cache

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) {
      redis.set(key, JSON.stringify(body), { EX: ttlSeconds }).catch(() => {});
    }
    res.set('X-Cache', 'MISS');
    return originalJson(body);
  };
  next();
};

// server/src/app.js
import express from 'express';
import compression from 'compression';
import { cache } from './middleware/cache.js';
import { listProducts } from './controllers/product.controller.js';

const app = express();
app.use(compression());
app.get('/api/products', cache(60), listProducts);
export default app;

// server/src/server.js
import app from './app.js';
import { connectDB } from './lib/db.js';
import { connectRedis } from './lib/redis.js';
await connectDB();
await connectRedis();
app.listen(process.env.PORT || 5000);`,
      result:
        'First curl -i http://localhost:5000/api/products shows X-Cache: MISS and takes, say, 120 ms. The next identical request shows X-Cache: HIT and takes about 3 ms. redis-cli KEYS "cache:*" shows the stored key; TTL cache:/api/products shows the seconds left.',
      explanation:
        'The middleware overrides res.json for this one request so it can store whatever the controller returns. Only 200 responses are cached, so errors are never stored. If Redis is down (redis.isReady false) the API still works, just slower. Never put per-user routes (like /api/me) behind a URL-only key; include the user id in the key or do not cache them.',
    },
    {
      title: 'React: debounced search + memoised list + TanStack-style cache',
      scenario:
        'A product search box was sending a request on every key press and re-rendering 1,000 rows. We debounce the input, memoise the filtered list and cache previous results by query so going back to an earlier search is instant.',
      steps: [
        'Generate 1,000 fake products in memory',
        'Store the raw input and a debounced value (updated 400 ms after typing stops)',
        'Keep a cache object in a ref keyed by search term (TanStack Query does this for you with queryKey)',
        'Wrap the row component in React.memo and show only the first 50 results',
        'Type quickly and watch the "fetches" counter increase only once per pause',
      ],
      code: `// In the real app with TanStack Query 5
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebouncedValue } from './useDebouncedValue';
import { api } from '../lib/api';

export function useProductSearch(term) {
  const q = useDebouncedValue(term, 400);
  return useQuery({
    queryKey: ['products', { q }],
    queryFn: ({ signal }) => api.get('/products', { params: { q }, signal }).then(r => r.data),
    staleTime: 60_000,               // reuse cached result for 1 minute
    placeholderData: keepPreviousData // keep old list visible while new one loads
  });
}`,
      playground: {
        jsx: `const { useState, useEffect, useMemo, useRef, memo } = React;

const ALL = Array.from({ length: 1000 }, (_, i) => ({ id: i + 1, name: ['Phone', 'Laptop', 'Earbuds', 'Watch', 'Charger'][i % 5] + ' ' + (i + 1), price: 500 + (i * 37) % 50000 }));

function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

const Row = memo(function Row({ p }) {
  return <li style={{ padding: 4, borderBottom: '1px solid #eee' }}>{p.name} <b style={{ float: 'right' }}>Rs {p.price}</b></li>;
});

function App() {
  const [input, setInput] = useState('');
  const q = useDebounced(input.trim().toLowerCase(), 400);
  const cache = useRef({});
  const [fetches, setFetches] = useState(0);
  const [hits, setHits] = useState(0);

  const results = useMemo(() => {
    if (cache.current[q]) { setTimeout(() => setHits(h => h + 1)); return cache.current[q]; }
    setTimeout(() => setFetches(f => f + 1));        // pretend this is a network request
    const r = ALL.filter(p => p.name.toLowerCase().includes(q));
    cache.current[q] = r;
    return r;
  }, [q]);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 420 }}>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Search e.g. phone 1"
        style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} />
      <p>Requests sent: <b>{fetches}</b> | Cache hits: <b>{hits}</b> | Matches: <b>{results.length}</b></p>
      <ul style={{ listStyle: 'none', padding: 0, maxHeight: 260, overflow: 'auto' }}>
        {results.slice(0, 50).map(p => <Row key={p.id} p={p} />)}
      </ul>
    </div>
  );
}`,
      },
      result:
        'Typing "laptop" quickly increases "Requests sent" by only 1 (after you stop typing), not 6. Clearing the box and typing "laptop" again increases "Cache hits" instead of requests. Only 50 rows are rendered even when 1,000 match.',
      explanation:
        'useDebounced delays the search term until typing pauses for 400 ms. useMemo recomputes the result only when the debounced term changes. The cache ref plays the role of TanStack Query: same key → cached data. React.memo on Row skips re-rendering rows whose props did not change. In production, add list virtualisation for thousands of visible rows.',
    },
    {
      title: 'Fixing a slow MongoDB query with an index, projection and lean()',
      scenario: 'GET /api/products?category=phones&sort=price takes 800 ms on 2 lakh products. explain() shows COLLSCAN.',
      steps: [
        'Run the query with .explain("executionStats") in a script or mongosh',
        'Note totalDocsExamined (200000) vs nReturned (20) and the COLLSCAN stage',
        'Add a compound index following ESR and sync indexes',
        'Add select() + lean() + limit()',
        'Run explain again: IXSCAN, totalDocsExamined ≈ 20, time drops to a few ms',
      ],
      code: `// server/src/models/Product.js
import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  inStock: { type: Boolean, default: true },
  description: String,        // long text: do not send in list APIs
  reviews: [{ user: mongoose.Types.ObjectId, rating: Number, text: String }],
}, { timestamps: true });

// Equality (category, inStock) -> Sort (price)
productSchema.index({ category: 1, inStock: 1, price: 1 });
export const Product = mongoose.model('Product', productSchema);

// scripts/explain.js  (run: node scripts/explain.js)
import mongoose from 'mongoose';
import { Product } from '../src/models/Product.js';
await mongoose.connect(process.env.MONGO_URI);
await Product.syncIndexes();               // build indexes defined in the schema

const stats = await Product.find({ category: 'phones', inStock: true })
  .sort({ price: 1 }).limit(20)
  .explain('executionStats');
console.log(JSON.stringify(stats.queryPlanner.winningPlan, null, 1).slice(0, 400));
console.log('examined:', stats.executionStats.totalDocsExamined,
            'returned:', stats.executionStats.nReturned,
            'ms:', stats.executionStats.executionTimeMillis);

// server/src/controllers/product.controller.js (optimised)
export async function listProducts(req, res) {
  const items = await Product.find({ category: req.query.category, inStock: true })
    .sort({ price: 1 })
    .select('name price category')   // projection: no description / reviews
    .limit(20)
    .lean();                         // plain JS objects, faster
  res.json(items);
}`,
      result:
        'Before: winningPlan stage COLLSCAN (or SORT over COLLSCAN), examined: 200000 returned: 20 ms: 780. After the index: stage IXSCAN → FETCH → LIMIT, examined: 20 returned: 20 ms: 2.',
      explanation:
        'The compound index lets MongoDB jump straight to phones that are in stock, already ordered by price, and stop after 20 documents; no in-memory sort is needed. select() avoids sending large description/review arrays over the network, and lean() skips building Mongoose documents. In production set autoIndex: false and create indexes in a migration or via syncIndexes at deploy time.',
    },
  ],
  interview: [
    {
      q: 'Explain the cache-aside pattern. What are its pros and cons?',
      a: 'The application checks the cache first; on a miss it reads the database, writes the result into the cache with a TTL, and returns it. On writes it updates the database and deletes (invalidates) the cache key. Pros: only requested data is cached, the cache can fail without breaking the app, simple to add. Cons: the first request after expiry is slow (miss), possible stale data between write and invalidation, and cache stampede on hot keys.',
      level: 'Medium',
    },
    {
      q: 'What is a cache stampede (thundering herd) and how do you prevent it?',
      a: 'When a popular key expires, hundreds of concurrent requests all miss and all query the database at once, possibly overloading it. Fixes: a short lock (SET lock:key 1 NX EX 5) so only one request rebuilds the cache while others wait or serve stale data; adding random jitter to TTLs so keys do not expire together; refreshing hot keys in the background before they expire (stale-while-revalidate).',
      level: 'Hard',
    },
    {
      q: 'Why should you not use KEYS * in production Redis?',
      a: 'Redis executes commands on a single thread. KEYS scans the whole keyspace in one go and blocks every other client until it finishes, which can freeze the app for seconds with millions of keys. Use SCAN (scanIterator in node-redis), which walks the keyspace in small batches, or track related keys in a Set, or use a version number in key names (products:v7:...) and bump the version to invalidate.',
      level: 'Medium',
    },
    {
      q: 'What does .lean() do in Mongoose and when should you not use it?',
      a: 'lean() makes the query return plain JavaScript objects instead of full Mongoose documents, skipping hydration, getters/setters, virtuals and change tracking. It is faster and uses less memory, ideal for read-only API responses. Do not use it when you need document methods like .save(), virtuals (unless using a plugin), getters or default transforms, because they are not applied.',
      level: 'Medium',
    },
    {
      q: 'What is the ESR rule for compound indexes?',
      a: 'Order fields in a compound index as Equality first, then Sort, then Range. Example: query { status: "active", price: { $gte: 1000 } } sorted by createdAt → index { status: 1, createdAt: -1, price: 1 }. Equality fields narrow the index to one section, the sort field lets MongoDB read in order without an in-memory sort, and the range field filters within that.',
      level: 'Hard',
    },
    {
      q: 'How do you know if a MongoDB query uses an index?',
      a: 'Run it with .explain("executionStats"). Look at winningPlan: IXSCAN means an index was used, COLLSCAN means a full collection scan. Compare totalDocsExamined/totalKeysExamined with nReturned; ideally they are close. A SORT stage means an in-memory sort (no index supports the sort). Atlas also provides the Performance Advisor and Query Profiler with suggested indexes.',
      level: 'Easy',
    },
    {
      q: 'What is the N+1 query problem and how do you solve it in a MERN app?',
      a: 'Fetching a list (1 query) and then running one extra query per item (N queries), e.g. getting 50 posts and then querying each author separately. It causes many round trips. Solve it with populate() (Mongoose collects all ids and runs one $in query), an aggregation $lookup, or by denormalising small fields (store authorName inside the post). On the client, avoid one API call per row by designing list endpoints that return what the list needs.',
      level: 'Medium',
    },
    {
      q: 'How should you set Cache-Control for a Vite-built React app?',
      a: 'Files in /assets have content hashes in their names, so they can be cached for a year with "public, max-age=31536000, immutable". index.html must use "no-cache" (revalidate every time) so that after a deploy the browser picks up new hashed file names. API responses with user data should use "private, no-store"; public lists can use a short max-age or rely on ETag revalidation.',
      level: 'Medium',
    },
    {
      q: 'What is an ETag and how does Express use it?',
      a: 'An ETag is an identifier (usually a hash) of the response body. Express adds a weak ETag to res.send/res.json automatically. The browser stores it and sends If-None-Match on the next request. If the body hash is the same, Express responds 304 Not Modified without a body, saving bandwidth (the server still does the work to build the response, so it saves bytes, not CPU).',
      level: 'Medium',
    },
    {
      q: 'Name five ways to improve the performance of a React frontend in a MERN app.',
      a: '1) Route-based code splitting with React.lazy/Suspense or lazy routes; 2) TanStack Query caching with staleTime and prefetching; 3) debouncing search inputs and cancelling stale requests with AbortController; 4) virtualising long lists; 5) optimising images (Cloudinary f_auto,q_auto, width, lazy loading); plus avoiding unnecessary re-renders with memo/useMemo/useCallback or the React Compiler, and analysing the bundle to remove heavy libraries.',
      level: 'Easy',
    },
    {
      q: 'Why must a Node server be stateless to scale horizontally?',
      a: 'With several instances behind a load balancer, consecutive requests from the same user can reach different instances. If sessions, caches, uploaded files or socket membership are stored in one process memory or local disk, other instances cannot see them. Moving shared state to Redis, MongoDB and object storage (Cloudinary/S3) lets any instance serve any request, so you can add or remove instances freely.',
      level: 'Hard',
    },
    {
      q: 'Where should compression happen in production: Express or a proxy/CDN?',
      a: 'Preferably at the edge (Nginx, Cloudflare, Vercel/Netlify CDN, Render), which is optimised for it, can cache compressed output and supports brotli. Using the compression middleware in Express is fine for small deployments, but it uses Node CPU on every response. Never double-compress, and skip already compressed formats like images and video.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Write an Express timing middleware that adds a Server-Timing header and logs slow requests (> 500 ms) as warnings.',
      hint: 'Use process.hrtime.bigint(). Headers must be set before the response is sent, so wrap res.writeHead or set the header from the end of the handler using onHeaders-like logic; logging can happen in res.on("finish").',
      solution: `// server/src/middleware/timing.js
export function timing(req, res, next) {
  const start = process.hrtime.bigint();
  const originalWriteHead = res.writeHead;
  res.writeHead = function (...args) {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    res.setHeader('Server-Timing', \`app;dur=\${ms.toFixed(1)}\`);
    return originalWriteHead.apply(this, args);
  };
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const line = \`\${req.method} \${req.originalUrl} \${res.statusCode} \${ms.toFixed(1)}ms\`;
    if (ms > 500) console.warn('SLOW', line); else console.log(line);
  });
  next();
}

// app.js
import { timing } from './middleware/timing.js';
app.use(timing);`,
    },
    {
      task: 'Implement getOrSet(key, ttl, loader) using node-redis that returns cached JSON if present, otherwise calls loader(), stores the result and returns it. It must still work if Redis is down.',
      hint: 'Wrap Redis calls in try/catch; never let a cache error fail the request.',
      solution: `import { redis } from './redis.js';

export async function getOrSet(key, ttlSeconds, loader) {
  try {
    if (redis.isReady) {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('cache read failed', e.message);
  }
  const fresh = await loader();
  try {
    if (redis.isReady) await redis.set(key, JSON.stringify(fresh), { EX: ttlSeconds });
  } catch (e) {
    console.warn('cache write failed', e.message);
  }
  return fresh;
}

// usage in a controller
export async function getCategories(req, res) {
  const data = await getOrSet('categories:all', 300, () =>
    Category.find().select('name slug').sort({ name: 1 }).lean());
  res.json(data);
}`,
    },
    {
      task: 'An orders page runs Order.find({ user: id, status: "delivered" }).sort({ createdAt: -1 }).limit(10). Design the best index and rewrite the query for a read-only list that shows only orderNo, total and createdAt.',
      hint: 'ESR: equality fields, then sort field.',
      solution: `// Order model
orderSchema.index({ user: 1, status: 1, createdAt: -1 });

// controller
const orders = await Order.find({ user: req.user.id, status: 'delivered' })
  .sort({ createdAt: -1 })
  .limit(10)
  .select('orderNo total createdAt')
  .lean();

// verify
const plan = await Order.find({ user: id, status: 'delivered' })
  .sort({ createdAt: -1 }).limit(10).explain('executionStats');
// expect IXSCAN with no SORT stage, totalDocsExamined === 10`,
    },
    {
      task: 'Split the admin dashboard and the charts page out of the main bundle using React.lazy and React Router 7, with a loading fallback.',
      hint: 'React.lazy needs a default export; wrap lazy elements in Suspense.',
      solution: `// client/src/router.jsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const SalesCharts = lazy(() => import('./pages/admin/SalesCharts'));

const withSuspense = (el) => <Suspense fallback={<p>Loading...</p>}>{el}</Suspense>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'admin', element: withSuspense(<AdminDashboard />) },
      { path: 'admin/charts', element: withSuspense(<SalesCharts />) },
    ],
  },
]);

// main.jsx
import { RouterProvider } from 'react-router';
createRoot(document.getElementById('root')).render(<RouterProvider router={router} />);
// npm run build now shows separate AdminDashboard-xxxx.js and SalesCharts-xxxx.js chunks`,
    },
    {
      task: 'Serve the built React app from Express with correct caching: hashed assets cached for 1 year, index.html never cached, and SPA fallback for client routes (Express 5 syntax).',
      hint: 'Express 5 wildcard is /{*splat}; register API routes before the fallback.',
      solution: `import express from 'express';
import path from 'node:path';
import compression from 'compression';

const app = express();
app.use(compression());
app.use('/api', apiRouter);

const dist = path.resolve('client/dist');
app.use('/assets', express.static(path.join(dist, 'assets'), { maxAge: '1y', immutable: true }));
app.use(express.static(dist, { index: false, maxAge: '1h' }));  // favicon, robots.txt

app.get('/{*splat}', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(process.env.PORT || 5000);`,
    },
  ],
  quiz: [
    {
      question: 'In the cache-aside pattern, what should happen when an admin updates a product?',
      options: [
        'Nothing, the TTL will handle it',
        'Update MongoDB, then delete (invalidate) the related cache keys',
        'Update only Redis; MongoDB is synced later',
        'Restart the Redis server',
      ],
      answer: 1,
      explanation: 'Write to the source of truth (MongoDB) and invalidate cached copies so the next read loads fresh data. TTL is only a safety net.',
    },
    {
      question: 'explain("executionStats") shows stage COLLSCAN with totalDocsExamined 500000 and nReturned 10. What is the most likely fix?',
      options: [
        'Add .lean() to the query',
        'Increase the connection pool size',
        'Create an index matching the filter and sort',
        'Switch to findOne()',
      ],
      answer: 2,
      explanation: 'COLLSCAN means no index was used, so MongoDB read every document. An index matching the query (ESR) turns it into an IXSCAN.',
    },
    {
      question: 'Which Cache-Control header is correct for index.html of a Vite React app?',
      options: [
        'public, max-age=31536000, immutable',
        'private, max-age=86400',
        'public, max-age=604800',
        'no-cache',
      ],
      answer: 3,
      explanation: 'index.html points to the latest hashed bundles, so the browser must revalidate it every time. Hashed assets can be immutable.',
    },
    {
      question: 'Why is SCAN preferred over KEYS in production Redis?',
      options: [
        'SCAN iterates in small batches and does not block Redis for long',
        'KEYS does not support patterns',
        'SCAN deletes keys automatically',
        'KEYS only works in Redis Cluster',
      ],
      answer: 0,
      explanation: 'Redis is single-threaded; KEYS walks the entire keyspace in one blocking call. SCAN is cursor-based and incremental.',
    },
    {
      question: 'What does debouncing a search input achieve?',
      options: [
        'It caches every response forever',
        'It sends one request after the user stops typing instead of one per key press',
        'It compresses the request body',
        'It makes the input uncontrolled',
      ],
      answer: 1,
      explanation: 'Debouncing waits for a pause (e.g. 400 ms) before using the value, reducing API calls and re-renders.',
    },
  ],
};
