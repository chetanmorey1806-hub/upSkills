export default {
  id: 'day-28-performance-caching-compression-cluster-pm2-logging',
  title: 'Performance: Caching, Compression, Cluster, PM2 and Logging',
  module: 'Module 5: Advanced Node',
  day: 28,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Make a Node API fast and observable: measure first, never block the event loop, cache expensive reads (in-memory, Redis, HTTP caching with ETag/Cache-Control), compress responses, use every CPU core with cluster or PM2, and replace console.log with structured logging.',
  objectives: [
    'Find bottlenecks by measuring (autocannon, --cpu-prof, clinic) and understand what blocks the event loop',
    'Implement in-memory and Redis caching (cache-aside) with TTL and invalidation',
    'Use HTTP caching (Cache-Control, ETag / 304) and gzip/brotli compression',
    'Scale across CPU cores with the cluster module and PM2 (cluster mode, zero-downtime reload)',
    'Add structured logging with pino / morgan and know what to log and what never to log',
  ],
  theory: [
    {
      heading: 'Measure first: where does the time go?',
      content:
        '"Premature optimisation is the root of all evil." Before changing code, **measure**:\n- **Load testing**: `npx autocannon -c 100 -d 10 http://localhost:3000/api/products` - 100 concurrent connections for 10 seconds, reports requests/sec and latency percentiles (p50, p99).\n- **Profiling**: `node --cpu-prof server.js` creates a .cpuprofile you open in Chrome DevTools; `node --inspect` for live profiling; `clinic doctor` finds event-loop blocking.\n- **APM** in production: OpenTelemetry, Datadog, New Relic, Sentry performance.\n\nTypical bottlenecks in Node APIs, in order of how often they happen:\n1. **Slow database queries** (missing indexes, N+1 queries, fetching too many fields/rows) - fix with indexes, `select`/`lean`, pagination, `populate` carefully.\n2. **Blocking the event loop** - Node runs your JavaScript on one thread. A 200 ms synchronous loop, `JSON.parse` of a 50 MB string, `bcrypt.hashSync`, `fs.readFileSync` in a route or a catastrophic regex blocks **every** user.\n3. Repeated expensive work that could be **cached**.\n4. Large responses without **compression** or pagination.',
      tip: 'Move CPU-heavy work (image resizing, PDF generation, big reports) to worker_threads or a background job queue (BullMQ) so the event loop stays free for requests.',
    },
    {
      heading: 'Caching: remember answers to expensive questions',
      content:
        'Caching is like keeping the most-used books on your desk instead of walking to the library every time.\n\n**Cache-aside pattern** (most common):\n1. Look in the cache by key (`product:42`).\n2. **Hit** → return it immediately.\n3. **Miss** → read from the DB, store in the cache with a **TTL** (time to live), return it.\n4. On update/delete → **invalidate** (delete) the key so the next read refreshes it.\n\nWhere to cache:\n- **In-process memory** (a Map, `lru-cache`): fastest, but each server instance has its own copy, it is lost on restart, and it can grow without limits (use an LRU with max size).\n- **Redis**: shared by all instances, survives app restarts, supports TTL natively (`SET key value EX 60`). The standard choice in production.\n- **HTTP/CDN caching**: let browsers and CDNs (Cloudflare) cache responses with headers.\n\n"There are only two hard things in computer science: cache invalidation and naming things." Choose TTLs based on how stale data may be: product catalogue - minutes; stock price - seconds; user balance - never cache without care.',
      syntax: `// Redis cache-aside (npm install redis)
const { createClient } = require('redis');
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

async function getProduct(id) {
  const key = 'product:' + id;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const product = await Product.findById(id).lean();
  await redis.set(key, JSON.stringify(product), { EX: 60 });   // TTL 60 s
  return product;
}`,
    },
    {
      heading: 'HTTP caching and compression',
      content:
        '**HTTP caching headers** let clients avoid downloading the same data again:\n- `Cache-Control: public, max-age=300` - anyone (browser, CDN) may reuse the response for 300 s without asking.\n- `Cache-Control: private, no-cache` - may store, but must revalidate each time; `no-store` - never store (sensitive data).\n- **ETag**: a fingerprint of the response. Express adds a weak ETag (`W/"..."`) to `res.json/res.send` automatically. When the browser sends `If-None-Match: <etag>` and the content is unchanged, Express answers **304 Not Modified** with no body.\n- Static assets with hashed names (Vite builds `index-a1b2c3.js`) can use `max-age=31536000, immutable`.\n\n**Compression**: JSON is very repetitive text, so gzip/brotli usually shrink it by 70-90%. `npm install compression` and `app.use(compression())` compresses responses when the client sends `Accept-Encoding: gzip`. Skip tiny responses (`threshold`), and in production it is often better to let the reverse proxy/CDN (Nginx, Cloudflare) compress so Node spends no CPU on it.',
      syntax: `const compression = require('compression');
app.use(compression({ threshold: 1024 }));   // compress bodies > 1 KB

app.get('/api/categories', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(categories);                        // Express adds ETag automatically
});`,
    },
    {
      heading: 'Using all CPU cores: cluster and PM2',
      content:
        'One Node process uses one CPU core for JavaScript. A server with 8 cores running one process wastes 7. The built-in **cluster** module forks several worker processes that **share the same port**; the primary process distributes incoming connections between them (round-robin on Linux). If a worker crashes, the primary can fork a new one.\n\nWorkers do **not share memory**: an in-memory cache, sessions or Socket.io rooms in one worker are invisible to the others - use Redis for shared state.\n\n**PM2** is a production process manager that does this for you without code changes:\n- `pm2 start server.js -i max` - cluster mode, one process per core\n- `pm2 reload all` - **zero-downtime** reload (workers restarted one by one)\n- auto-restart on crash, `max_memory_restart`, log files, `pm2 monit`, `pm2 startup` (start on boot)\n- configuration in `ecosystem.config.js`\n\nIn Docker/Kubernetes you usually run **one process per container** and scale by adding containers (replicas) instead of using cluster/PM2 inside them.',
      syntax: `# PM2
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 list        # status of all processes
pm2 logs        # tail logs
pm2 reload shop-api   # zero-downtime restart after deploy`,
    },
    {
      heading: 'Logging: console.log is not enough',
      content:
        'In production you need to answer "what happened at 02:14 for user 42 and why did order 1001 fail?". That requires **structured logs** (JSON lines with fields) that tools like Grafana Loki, ELK, Datadog or CloudWatch can search and filter.\n\n- **pino** - very fast JSON logger; `pino-http` logs every request with method, url, status and response time; `req.log` gives a child logger tied to the request. Use `pino-pretty` only in development.\n- **winston** - flexible, many transports (files, HTTP, etc.).\n- **morgan** - simple HTTP access-log lines (`morgan("dev")`, `morgan("combined")`), good for development.\n\nLevels: `fatal > error > warn > info > debug > trace`; production usually logs `info` and above (configurable via `LOG_LEVEL`).\n\n**Never log** passwords, tokens, full card numbers, or Authorization headers - use pino `redact: ["req.headers.authorization", "*.password"]`. Add a **request id** to every log line so all logs of one request can be correlated.',
      tip: 'console.log to a terminal is synchronous in some environments and slow under load; pino writes asynchronously and is several times faster.',
    },
  ],
  examples: [
    {
      title: 'In-memory cache with TTL and invalidation (cache-aside)',
      scenario: 'Product details come from a slow database query (300 ms). Cache them for 60 seconds and invalidate when a product is updated.',
      steps: [
        'npm install express',
        'Create cache.js with a Map-based cache (value + expiry time)',
        'In the GET route: check the cache, otherwise query and store; set an X-Cache header',
        'In the PUT route: delete the key',
        'Run it and time the requests with curl -w "%{time_total}"',
      ],
      code: `const express = require('express');
const app = express();

// Simulates a slow database query (300 ms)
const slowDbQuery = (id) =>
  new Promise((resolve) => setTimeout(() => resolve({ id, name: 'Product ' + id, price: 499 }), 300));

// Tiny in-memory cache with TTL
const cache = new Map();
function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expires) { cache.delete(key); return undefined; }
  return entry.value;
}
function cacheSet(key, value, ttlMs) {
  cache.set(key, { value, expires: Date.now() + ttlMs });
}

app.get('/api/products/:id', async (req, res) => {
  const key = 'product:' + req.params.id;
  const cached = cacheGet(key);
  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.json(cached);
  }
  const product = await slowDbQuery(Number(req.params.id));
  cacheSet(key, product, 60_000);             // keep for 60 seconds
  res.set('X-Cache', 'MISS');
  res.json(product);
});

// invalidate on update
app.put('/api/products/:id', (req, res) => {
  cache.delete('product:' + req.params.id);
  res.json({ updated: true });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      result: `GET /api/products/7 → X-Cache: MISS 316 ms {"id":7,"name":"Product 7","price":499}
GET /api/products/7 → X-Cache: HIT 9 ms {"id":7,"name":"Product 7","price":499}
GET /api/products/7 → X-Cache: HIT 2 ms {"id":7,"name":"Product 7","price":499}
PUT /api/products/7 → {"updated":true}
GET /api/products/7 → X-Cache: MISS 302 ms   (cache was invalidated)`,
      explanation:
        'The first request pays the 300 ms query and fills the cache; the next ones are served from memory in a few milliseconds. Deleting the key on update guarantees users never see the old data for up to 60 s. For several server instances replace the Map with Redis (theory section) so all instances share one cache.',
    },
    {
      title: 'API Lab: cache hits/misses, statistics and 304 Not Modified',
      scenario: 'Watch cache-aside behaviour and HTTP revalidation with ETag in the API Lab.',
      steps: [
        'Paste the code into the API Lab',
        'Request the same category twice and see source change from "db" to "cache"',
        'Update it and request it again (invalidated → db)',
        'Check /api/cache/stats',
        'Request /api/settings with the ETag in If-None-Match and get 304 with no body',
      ],
      code: `// Express sets ETag automatically for res.json / res.send.
// Browser sends:  If-None-Match: W/"1d-..."   → server answers 304 if unchanged`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const db = { electronics: { name: 'Electronics', products: 120 }, books: { name: 'Books', products: 300 } };
const cache = new Map();
const stats = { hits: 0, misses: 0 };

app.get('/api/categories/:slug', (req, res) => {
  const key = 'category:' + req.params.slug;
  if (cache.has(key)) {
    stats.hits++;
    return res.json({ source: 'cache', data: cache.get(key) });
  }
  stats.misses++;
  const data = db[req.params.slug];
  if (!data) return res.status(404).json({ error: 'Category not found' });
  cache.set(key, data);
  res.json({ source: 'db', data });
});

app.put('/api/categories/:slug', (req, res) => {
  db[req.params.slug] = { ...db[req.params.slug], ...req.body };
  cache.delete('category:' + req.params.slug);    // invalidate
  res.json({ updated: db[req.params.slug] });
});

app.get('/api/cache/stats', (req, res) => {
  const total = stats.hits + stats.misses;
  res.json({ ...stats, hitRate: total ? Math.round((stats.hits / total) * 100) + '%' : '0%', keys: [...cache.keys()] });
});

app.get('/api/settings', (req, res) => {
  res.set('Cache-Control', 'private, no-cache');
  res.json({ currency: 'INR', language: 'en' });  // Express adds ETag and handles If-None-Match
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/categories/electronics' },
          { method: 'GET', url: '/api/categories/electronics' },
          { method: 'PUT', url: '/api/categories/electronics', body: { products: 121 } },
          { method: 'GET', url: '/api/categories/electronics' },
          { method: 'GET', url: '/api/categories/electronics' },
          { method: 'GET', url: '/api/cache/stats' },
          { method: 'GET', url: '/api/settings' },
          { method: 'GET', url: '/api/settings', headers: { 'If-None-Match': 'W/"22-i/Pwh2tnDUhILre+JzZdXuzUGC4"' } },
        ],
      },
      result: "GET /api/categories/electronics → 200 {\"source\":\"db\",\"data\":{\"name\":\"Electronics\",\"products\":120}}\nGET /api/categories/electronics → 200 {\"source\":\"cache\",\"data\":{\"name\":\"Electronics\",\"products\":120}}\nPUT /api/categories/electronics → 200 {\"updated\":{\"name\":\"Electronics\",\"products\":121}}\nGET /api/categories/electronics → 200 {\"source\":\"db\",\"data\":{\"name\":\"Electronics\",\"products\":121}}\nGET /api/categories/electronics → 200 {\"source\":\"cache\",\"data\":{\"name\":\"Electronics\",\"products\":121}}\nGET /api/cache/stats → 200 {\"hits\":2,\"misses\":2,\"hitRate\":\"50%\",\"keys\":[\"category:electronics\"]}\nGET /api/settings → 200 {\"currency\":\"INR\",\"language\":\"en\"}\nGET /api/settings → 304",
      explanation:
        'Two reads → one miss + one hit. The PUT invalidates the key, so the next read goes to the "db" again and returns the new count (121), then the cache serves it. Stats show a 50% hit rate. For /api/settings, Express computed the ETag W/"22-i/Pwh2..." from the body; when the client sends it back in If-None-Match, Express answers 304 with an empty body - the client reuses its stored copy, saving bandwidth.',
    },
    {
      title: 'gzip compression with the compression middleware',
      scenario: 'The product list is 41 KB of JSON. Measure the effect of compression.',
      steps: [
        'npm install express compression',
        'Create compress.js and run it',
        'curl without and with Accept-Encoding: gzip and compare sizes',
        'Check the Content-Encoding and Vary headers',
      ],
      code: `const express = require('express');
const compression = require('compression');

const app = express();
app.use(compression({ threshold: 1024 }));      // only compress responses > 1 KB

const products = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1, name: 'Product ' + (i + 1), category: 'Electronics', price: 100 + i, inStock: true,
}));

app.get('/api/products', (req, res) => res.json(products));
app.get('/api/ping', (req, res) => res.json({ ok: true }));

app.listen(3000, () => console.log('Server running on port 3000'));

// test:
// curl -s -o /dev/null -w '%{size_download}\\n' http://localhost:3000/api/products
// curl -s -o /dev/null -H 'Accept-Encoding: gzip' -w '%{size_download}\\n' http://localhost:3000/api/products`,
      result: `no gzip  : 41785 bytes
with gzip: 4170 bytes
headers (gzip request to /api/products): Vary: Accept-Encoding, Content-Encoding: gzip
/api/ping with Accept-Encoding: gzip → Content-Length: 11 (below threshold, not compressed)`,
      explanation:
        'Repetitive JSON compressed 10x (41.8 KB → 4.2 KB), which matters a lot on mobile networks. Vary: Accept-Encoding tells caches to store separate versions for clients with and without gzip support. Tiny responses are not compressed because the gzip overhead would outweigh the gain.',
    },
    {
      title: 'Cluster module: one worker per CPU core with self-healing',
      scenario: 'Use 4 cores on the server and automatically replace a crashed worker.',
      steps: [
        'Create cluster.js with the code below',
        'Run node cluster.js',
        'Call /api/whoami several times and see different worker PIDs',
        'Call /api/crash once and watch the primary fork a replacement',
      ],
      code: `const cluster = require('node:cluster');
const os = require('node:os');
const express = require('express');

const WORKERS = Math.min(os.availableParallelism(), 4);

if (cluster.isPrimary) {
  console.log(\`Primary \${process.pid} starting \${WORKERS} workers\`);
  for (let i = 0; i < WORKERS; i++) cluster.fork();

  cluster.on('exit', (worker, code) => {
    console.log(\`Worker \${worker.process.pid} died (code \${code}), starting a new one\`);
    cluster.fork();                                   // self-healing
  });
} else {
  const app = express();
  app.get('/api/whoami', (req, res) => res.json({ pid: process.pid }));
  app.get('/api/crash', () => process.exit(1));        // demo only!
  app.listen(3000, () => console.log(\`Worker \${process.pid} listening on 3000\`));
}`,
      result: `Primary 63581 starting 4 workers
Worker 63590 listening on 3000
Worker 63592 listening on 3000
Worker 63591 listening on 3000
Worker 63589 listening on 3000
6 x GET /api/whoami → {"pid":63589} x1, {"pid":63590} x2, {"pid":63591} x1, {"pid":63592} x2
GET /api/crash →
Worker 63591 died (code 1), starting a new one
Worker 63656 listening on 3000
(PIDs differ on every run)`,
      explanation:
        'All four workers listen on the same port; the primary hands connections to them round-robin, so consecutive requests hit different PIDs. When one worker exits, the exit event forks a new one and the service keeps running. Each worker has its own memory - an in-memory cache would be duplicated 4 times, another reason for Redis.',
    },
    {
      title: 'PM2 ecosystem file and structured logging with pino',
      scenario: 'Prepare the API for a VPS deployment: PM2 cluster mode with env vars and memory limits, plus JSON request logs with redaction.',
      steps: [
        'npm install pino pino-http && npm install -g pm2',
        'Add pino-http middleware and use req.log inside routes',
        'Create ecosystem.config.js and start with pm2 start ecosystem.config.js --env production',
        'Use pm2 logs / pm2 monit and pm2 reload shop-api after each deploy',
      ],
      code: `// server.js
const express = require('express');
const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password'],   // never log secrets
});
const app = express();
app.use(pinoHttp({ logger }));

app.get('/api/orders/:id', (req, res) => {
  req.log.info({ orderId: req.params.id }, 'fetching order');
  res.json({ id: req.params.id, status: 'shipped' });
});

app.listen(process.env.PORT || 3000, () => logger.info('Server running on port ' + (process.env.PORT || 3000)));

// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'shop-api',
    script: './server.js',
    instances: 'max',              // one per CPU core
    exec_mode: 'cluster',
    max_memory_restart: '400M',    // restart a leaking worker
    env: { NODE_ENV: 'development', PORT: 3000 },
    env_production: { NODE_ENV: 'production', PORT: 8080, LOG_LEVEL: 'info' },
  }],
};

// development: pretty logs
// node server.js | npx pino-pretty`,
      result: `{"level":30,"time":1794988813223,"pid":64885,"hostname":"my-pc","msg":"Server running on port 3000"}
{"level":30,"time":1794988813246,"pid":64885,"hostname":"my-pc","req":{"id":1,"method":"GET","url":"/api/orders/1001","query":{},"params":{},"headers":{"host":"localhost:3000","user-agent":"curl/8.5.0","accept":"*/*"},"remoteAddress":"::1","remotePort":41378},"orderId":"1001","msg":"fetching order"}
{"level":30,"time":1794988813254,"pid":64885,"hostname":"my-pc","req":{"id":1,"method":"GET","url":"/api/orders/1001",...},"res":{"statusCode":200,"headers":{"x-powered-by":"Express","content-type":"application/json; charset=utf-8","content-length":"32","etag":"W/\\"20-t1X8SdrkZgZmUMe5tJGW51b7jvk\\""}},"responseTime":9,"msg":"request completed"}
(time, pid and hostname differ on your machine; level 30 = info)`,
      explanation:
        'Every line is JSON with a level, timestamp, request id and our custom orderId field - log platforms can filter "all logs of req.id 1" or "all 5xx with responseTime > 1000". The automatic "request completed" line includes status code and response time. redact replaces the Authorization header and passwords with [Redacted]. PM2 runs one copy per core and reloads them one by one for zero downtime.',
    },
  ],
  interview: [
    { q: 'What does "blocking the event loop" mean and how do you avoid it?', a: 'Node executes JavaScript on a single main thread; any long synchronous work (big loops, sync crypto/fs, huge JSON.parse, catastrophic regex) prevents all other requests and timers from running. Avoid by using async APIs, chunking work, moving CPU-heavy tasks to worker_threads or a job queue, and streaming large data.', level: 'Medium' },
    { q: 'Explain the cache-aside pattern.', a: 'The application checks the cache first; on a miss it loads from the database, writes the result to the cache with a TTL and returns it; on writes it updates the DB and invalidates (deletes) the cache key. Simple and the most common strategy (others: write-through, write-behind).', level: 'Medium' },
    { q: 'In-memory cache vs Redis?', a: 'In-memory (Map/lru-cache) is fastest with no network hop but is per-process, lost on restart, and duplicated across cluster workers/instances. Redis is shared, persistent-ish, supports TTL, atomic ops and pub/sub, at the cost of a network round trip and infrastructure.', level: 'Medium' },
    { q: 'What is an ETag and how does 304 Not Modified work?', a: 'An ETag is a fingerprint of a response body. The client stores it and sends If-None-Match on the next request; if the current ETag matches, the server returns 304 with no body and the client uses its cached copy. Express generates weak ETags for res.send/res.json automatically.', level: 'Medium' },
    { q: 'What does the compression middleware do and when would you not use it?', a: 'It gzip/deflate/brotli-compresses response bodies when the client sends Accept-Encoding, reducing size by 70-90% for JSON/HTML. Skip it for tiny responses, already-compressed files (images, video, zip), streaming/SSE without flush, or when a reverse proxy/CDN already compresses (better CPU usage).', level: 'Easy' },
    { q: 'How does the Node.js cluster module work?', a: 'The primary process forks N worker processes (usually one per core) that share the same server port; the primary distributes connections (round-robin by default except on Windows). Workers are separate processes with separate memory; the primary can restart crashed workers.', level: 'Medium' },
    { q: 'Cluster vs worker_threads?', a: 'cluster creates separate processes to handle more concurrent requests across cores (scale I/O-bound servers). worker_threads run JavaScript in parallel threads inside one process, with message passing and optional SharedArrayBuffer, to offload CPU-heavy tasks without blocking the event loop.', level: 'Hard' },
    { q: 'What is PM2 and what problems does it solve?', a: 'A production process manager for Node: keeps apps alive (auto-restart), cluster mode across cores, zero-downtime reloads, memory-limit restarts, log management, monitoring, startup scripts and ecosystem config files for env-specific settings.', level: 'Easy' },
    { q: 'Why use structured logging (pino) instead of console.log?', a: 'Structured JSON logs with levels, timestamps, request ids and context fields can be searched, filtered and aggregated by log platforms; pino is asynchronous and very fast; levels allow controlling verbosity per environment; redaction prevents leaking secrets.', level: 'Easy' },
    { q: 'How would you find and fix a slow endpoint?', a: 'Reproduce and measure (autocannon, APM traces), check DB query plans (explain(), indexes, N+1, over-fetching), profile CPU (--cpu-prof, clinic flame), look for event-loop blocking, then apply fixes: indexes, projections/lean, pagination, caching, batching, compression, moving heavy work to background jobs; measure again.', level: 'Hard' },
    { q: 'What is the N+1 query problem?', a: 'Loading a list (1 query) and then running one extra query per item (N queries), e.g. fetching each order\'s user separately. Fix with joins/populate (one batched $in query), aggregation $lookup, or DataLoader-style batching.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a reusable cacheMiddleware(ttlSeconds) that caches the JSON response of any GET route by req.originalUrl in a Map and sets X-Cache HIT/MISS.',
      hint: 'Wrap res.json to capture the body before sending.',
      solution: `function cacheMiddleware(ttlSeconds) {
  const store = new Map();
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    const hit = store.get(req.originalUrl);
    if (hit && hit.expires > Date.now()) {
      res.set('X-Cache', 'HIT');
      return res.json(hit.body);
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) store.set(req.originalUrl, { body, expires: Date.now() + ttlSeconds * 1000 });
      res.set('X-Cache', 'MISS');
      return originalJson(body);
    };
    next();
  };
}
app.get('/api/categories', cacheMiddleware(300), listCategories);`,
    },
    {
      task: 'Replace the Map cache with Redis: write getOrSet(key, ttl, loader) and use it in GET /api/products/:id; delete the key in PUT.',
      hint: 'redis.get / redis.set(key, value, { EX: ttl }) / redis.del.',
      solution: `const { createClient } = require('redis');
const redis = createClient({ url: process.env.REDIS_URL });
redis.on('error', (err) => console.error('Redis error', err.message));
await redis.connect();

async function getOrSet(key, ttl, loader) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const fresh = await loader();
  if (fresh) await redis.set(key, JSON.stringify(fresh), { EX: ttl });
  return fresh;
}

app.get('/api/products/:id', async (req, res) => {
  const product = await getOrSet('product:' + req.params.id, 60, () => Product.findById(req.params.id).lean());
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

app.put('/api/products/:id', async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  await redis.del('product:' + req.params.id);
  res.json(updated);
});`,
    },
    {
      task: 'Demonstrate event-loop blocking: create /api/block that runs a 3-second synchronous loop and /api/fast that returns immediately. Then fix /api/block with worker_threads.',
      hint: 'new Worker(__filename-like code, { eval: true }) or a separate worker file; resolve on message.',
      solution: `const { Worker } = require('node:worker_threads');

app.get('/api/block', (req, res) => {
  const end = Date.now() + 3000;
  while (Date.now() < end) {}          // blocks EVERYTHING for 3 s - /api/fast also waits
  res.json({ done: true });
});

app.get('/api/fast', (req, res) => res.json({ fast: true }));

app.get('/api/heavy', (req, res) => {
  const worker = new Worker(\`
    const { parentPort } = require('node:worker_threads');
    const end = Date.now() + 3000; while (Date.now() < end) {}
    parentPort.postMessage({ done: true });
  \`, { eval: true });
  worker.once('message', (msg) => res.json(msg));      // main thread stays free
  worker.once('error', (err) => res.status(500).json({ error: err.message }));
});`,
    },
    {
      task: 'Add a request-id + timing logger without libraries: every response gets an X-Request-Id header and one JSON log line with method, url, status and duration in ms.',
      hint: 'Use res.on("finish") and process.hrtime.bigint().',
      solution: `const { randomUUID } = require('node:crypto');
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  req.id = req.headers['x-request-id'] || randomUUID();
  res.set('X-Request-Id', req.id);
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(JSON.stringify({
      level: res.statusCode >= 500 ? 'error' : 'info',
      reqId: req.id, method: req.method, url: req.originalUrl,
      status: res.statusCode, durationMs: Math.round(ms * 10) / 10,
    }));
  });
  next();
});`,
    },
    {
      task: 'Load test your API with autocannon before and after adding the cache, and record requests/sec and p99 latency.',
      hint: 'npx autocannon -c 50 -d 10 URL',
      solution: `# terminal 1
node cache.js

# terminal 2 - first warm the cache once, then:
npx autocannon -c 50 -d 10 http://localhost:3000/api/products/7

# Compare the "Req/Sec" (Avg) and "Latency" (99%) rows:
# without cache every request waits ~300 ms  -> low req/sec, p99 ~ 300+ ms
# with cache responses come from memory      -> thousands of req/sec, p99 of a few ms
# Write both results in a table in your README.`,
    },
  ],
  quiz: [
    { question: 'Which status code means "your cached copy is still valid, no body sent"?', options: ['200', '204', '304', '412'], answer: 2, explanation: '304 Not Modified is returned when If-None-Match matches the current ETag.' },
    { question: 'What happens to an in-memory Map cache when you run the app with 4 cluster workers?', options: ['It is shared automatically', 'Each worker has its own separate copy', 'It is stored in Redis', 'Cluster mode disables it'], answer: 1, explanation: 'Workers are separate processes with separate memory - use Redis for a shared cache.' },
    { question: 'Which command starts an app in PM2 cluster mode on all cores?', options: ['pm2 start server.js -i max', 'pm2 cluster server.js', 'node --cluster server.js', 'pm2 fork all'], answer: 0, explanation: '-i max (or instances: "max" in ecosystem.config.js) runs one instance per core.' },
    { question: 'Which of these blocks the Node.js event loop?', options: ['await fetch(url)', 'fs.promises.readFile()', 'setTimeout(fn, 1000)', 'A 2-second synchronous while loop in a route handler'], answer: 3, explanation: 'Synchronous CPU work blocks the single JS thread; the others are asynchronous.' },
    { question: 'In the cache-aside pattern, what should happen when a product is updated?', options: ['Nothing, TTL handles it', 'Invalidate (delete) or update the cache key', 'Restart the server', 'Clear the whole database'], answer: 1, explanation: 'Invalidate the key so the next read loads fresh data.' },
  ],
};
