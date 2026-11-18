export default {
  id: 'extra-10-mern-system-design',
  title: 'MERN System Design for Freshers & Juniors: URL Shortener, Chat App, E-commerce, Scaling, Caching, Load Balancing, CAP',
  module: 'Interview: Full Stack',
  extraNo: 10,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Junior-level system design rounds check whether you can turn a vague product idea into a clear MERN architecture: requirements, APIs, MongoDB schema, and a few scaling ideas (caching, load balancing, replication, sharding, queues). This topic gives you a repeatable framework plus solved designs for a URL shortener, chat app and e-commerce site.',
  objectives: [
    'Follow a 6-step framework to answer any "design X" question in 30-45 minutes',
    'Design APIs and MongoDB schemas for a URL shortener, chat app and e-commerce site',
    'Explain vertical vs horizontal scaling, load balancers, caching (Redis), CDNs and message queues',
    'Explain CAP theorem, replication, sharding and consistency trade-offs in simple words',
    'Do quick back-of-the-envelope estimates (QPS, storage) without panic',
  ],
  theory: [
    {
      heading: 'The 6-step framework for any system design question',
      content: `Freshers are not expected to design Google. Interviewers want to see **structured thinking**, sensible trade-offs and honest communication. Use the same steps every time and say them out loud:

1. **Clarify requirements** (3-5 min): functional ("users can shorten a URL, open it, see click count") and non-functional ("low latency redirects, 99.9% availability, 10 million URLs"). Ask: how many users? read-heavy or write-heavy? mobile or web? real-time?
2. **Estimate scale** (2 min): requests per second (QPS), storage per year, read:write ratio. Rough numbers are fine.
3. **Define APIs**: \`POST /api/urls\`, \`GET /:code\`. Mention request/response body and status codes.
4. **Data model**: MongoDB collections, fields, indexes, embed vs reference.
5. **High-level design**: draw boxes: Client (React) -> CDN -> Load balancer -> Node/Express servers (stateless) -> Redis cache -> MongoDB replica set. Add a queue/worker if there is slow background work.
6. **Deep dive + bottlenecks**: what breaks first at 10x traffic? Add caching, indexes, read replicas, sharding, rate limiting, monitoring.

**How to answer:** Think aloud, write the requirements on the board, and state assumptions ("I'll assume 100 million redirects per day"). If you do not know something, say how you would find out. Always end with trade-offs: "I chose X because..., the downside is...".`,
      points: [
        'Clarify before you draw: never jump straight into boxes',
        'Keep app servers stateless so you can add more behind a load balancer',
        'Pick MongoDB indexes based on the queries you listed',
        'Finish with bottlenecks, monitoring and what you would improve next',
      ],
      tip: 'A common fresher mistake is listing buzzwords (Kafka, Kubernetes, microservices) without a reason. Every component you add must solve a problem you just named.',
    },
    {
      heading: 'Scaling basics: vertical vs horizontal, load balancing, stateless servers',
      content: `**Vertical scaling (scale up)** = buy a bigger machine (more CPU/RAM). Easy, no code change, but has a hardware limit and one machine is a single point of failure.

**Horizontal scaling (scale out)** = add more machines and split traffic. Needs a **load balancer** (Nginx, AWS ALB, HAProxy) and **stateless** app servers.

**Stateless server** means the server does not keep user data in its own memory between requests. Sessions go into Redis or a JWT; uploaded files go to S3/Cloudinary, not the local disk. Then any request can go to any server.

**Load balancing algorithms:**
- Round robin: request 1 to server A, 2 to B, 3 to C, repeat
- Least connections: send to the server with the fewest active connections
- IP hash: same client IP always goes to the same server (sticky sessions; avoid if possible)

The load balancer also does **health checks** (\`GET /health\`) and removes dead servers. In Node, one process uses one CPU core for JavaScript, so on one machine you use the **cluster module** or **PM2** (\`pm2 start server.js -i max\`) to run one process per core.`,
      syntax: `# Nginx as a load balancer in front of 3 Node servers
upstream api_servers {
  least_conn;
  server 10.0.0.11:5000;
  server 10.0.0.12:5000;
  server 10.0.0.13:5000;
}
server {
  listen 80;
  location /api/ { proxy_pass http://api_servers; }
}`,
      tip: 'If the interviewer asks "your app is slow with 10x users, what do you do?", answer in order: measure first (logs, APM), add indexes, add caching, then scale horizontally. Do not jump to sharding.',
    },
    {
      heading: 'Caching, CDN and message queues',
      content: `**Cache** = a fast copy of data that is read often. In MERN, the usual cache is **Redis** (in-memory key-value store).

- **Cache-aside (lazy loading)**: app checks Redis -> on miss, reads MongoDB -> writes result to Redis with a **TTL** (time to live). Most common pattern.
- **Write-through**: every write goes to cache and DB together. Cache always fresh, writes slower.
- **Invalidation**: when a product price changes, delete \`product:42\` from Redis so the next read refills it. "There are only two hard things in computer science: cache invalidation and naming things."
- **Eviction**: when memory is full, Redis removes keys by policy, e.g. **LRU** (least recently used).

Cache at many layers: browser cache (Cache-Control headers), **CDN** (Cloudflare, CloudFront) for static files and images close to the user, React Query/SWR in the client, Redis on the server, and MongoDB's own memory (WiredTiger cache).

**Message queue** (RabbitMQ, Kafka, AWS SQS, BullMQ on Redis): the API puts a job in a queue and returns quickly; a separate **worker** process does slow work (send email, generate invoice PDF, resize image). This gives faster responses, retries, and smooths traffic spikes.`,
      points: [
        'Cache read-heavy, rarely changing data: product details, user profile, home page feed',
        'Do not cache highly personal or fast-changing data without short TTLs',
        'Queues decouple services: the API does not wait for the email server',
      ],
    },
    {
      heading: 'Databases at scale: indexes, replication, sharding, CAP',
      content: `**Indexes** are the first fix for slow queries. Without an index MongoDB does a **COLLSCAN** (reads every document). Use \`explain('executionStats')\` to check.

**Replication**: a MongoDB **replica set** has one **primary** (takes writes) and usually two **secondaries** (copies). If the primary dies, an election picks a new primary in seconds -> **high availability**. You can send some reads to secondaries (\`readPreference: 'secondaryPreferred'\`) but they may be slightly behind (**eventual consistency**).

**Sharding**: split one big collection across many servers by a **shard key** (e.g. \`userId\`). Gives horizontal scale for data and writes. A bad shard key (like a timestamp that always increases) sends all writes to one shard (**hot shard**). Pick a key with high cardinality and even distribution, used in most queries.

**CAP theorem**: in a distributed system, during a **network Partition** you must choose between **Consistency** (every read gets the latest write or an error) and **Availability** (every request gets a response, maybe stale). Partitions are unavoidable, so the real choice is **CP vs AP**.
- MongoDB with majority writes/reads behaves **CP**: if the primary is cut off, writes stop until a new primary is elected.
- Cassandra/DynamoDB (default settings) lean **AP**: always answer, fix conflicts later.
- Banking balance -> consistency. Like counts, view counts, feeds -> availability is fine.`,
      tip: 'Say "CAP is about what happens during a network partition". Many candidates wrongly say "pick any two of three".',
    },
    {
      heading: 'Real-time features, file storage, security and observability',
      content: `**Real-time** (chat, notifications, live order tracking):
- **Polling**: client asks every few seconds. Simple, wasteful.
- **Long polling**: server holds the request until there is data.
- **Server-Sent Events (SSE)**: one-way server -> client stream over HTTP. Good for notifications, live scores.
- **WebSockets** (Socket.IO): full duplex, best for chat and multiplayer. With many Node servers, use the **Redis adapter** (pub/sub) so a message from a user on server A reaches a user connected to server B.

**Files**: store images/videos in object storage (S3, Cloudinary), save only the URL in MongoDB, upload directly from the browser using a **pre-signed URL** so files do not pass through your Node server.

**Security basics to mention**: HTTPS everywhere, hashed passwords (bcrypt/argon2), JWT with short expiry + refresh token in httpOnly cookie, input validation (zod/Joi), rate limiting, CORS whitelist, Helmet headers, least-privilege DB user.

**Observability**: structured logs (pino/winston), metrics (response time, error rate), alerts, tracing. "You can't fix what you can't see."`,
      points: [
        'Chat = WebSockets + Redis pub/sub + MongoDB for history',
        'Uploads = pre-signed URL to S3, only store the URL',
        'Always mention rate limiting and monitoring at the end of a design',
      ],
    },
    {
      heading: 'Back-of-the-envelope estimation (cheat sheet)',
      content: `You only need rough numbers to choose a design.

- 1 day ~= 86,400 seconds ~= **100,000 s** (round it)
- 1 million requests/day ~= **12 requests/second** average; peak ~= 2-3x average
- 100 million/day ~= 1,200 QPS average
- 1 KB x 1 million = 1 GB; 1 KB x 1 billion = 1 TB
- One well-tuned Node/Express server handles roughly a few thousand simple requests/second; MongoDB with indexes handles thousands of reads/second per node; Redis can do 100,000+ ops/second

**Example (URL shortener):** 10 million new URLs/month, read:write = 100:1.
- Writes: 10M / (30 x 100,000 s) ~= 3-4 per second
- Reads: ~350-400 per second average, plan for ~1,000 peak
- Storage: 10M x 12 months x 5 years x ~500 bytes ~= 300 GB -> one replica set is fine, sharding later.

**How to answer:** Say the numbers slowly, round aggressively, and explain what the number changes ("400 reads/sec is easy for one server with Redis, so I will not shard on day one").`,
      tip: 'Interviewers care more that you know reads dominate and need caching than about exact math.',
    },
  ],
  examples: [
    {
      title: 'URL shortener core: base62 encoding of a counter',
      scenario: 'Classic question: "Design bit.ly". The heart of it is turning a unique number into a short code and storing code -> long URL.',
      steps: [
        'Get a unique, increasing number (MongoDB counter document with $inc, Redis INCR, or a range of IDs per server)',
        'Encode it in base62 (0-9, a-z, A-Z) to get a short code',
        'Save { code, longUrl, createdAt, clicks } with a unique index on code',
        'On GET /:code, look up Redis then MongoDB and reply 301/302 redirect',
        'Click Run to see codes generated from counter 100000',
      ],
      code: `const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function encode(num) {
  if (num === 0) return ALPHABET[0];
  let s = '';
  while (num > 0) { s = ALPHABET[num % 62] + s; num = Math.floor(num / 62); }
  return s;
}
function decode(str) {
  let n = 0;
  for (const ch of str) n = n * 62 + ALPHABET.indexOf(ch);
  return n;
}
const db = new Map();
let counter = 100000;
function shorten(longUrl) {
  const code = encode(counter++);
  db.set(code, longUrl);
  return 'https://sho.rt/' + code;
}
console.log(shorten('https://example.com/products/shoes?color=red'));
console.log(shorten('https://example.com/blog/mern-interview'));
console.log('encode(125) =', encode(125), '| decode("21") =', decode('21'));
console.log('Redirect q0U ->', db.get('q0U'));
console.log('7 chars can hold', (62 ** 7).toLocaleString('en-US'), 'URLs');`,
      playground: {
        html: '<h3>URL shortener (base62) - open the console</h3>',
        js: `const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function encode(num) {
  if (num === 0) return ALPHABET[0];
  let s = '';
  while (num > 0) { s = ALPHABET[num % 62] + s; num = Math.floor(num / 62); }
  return s;
}
function decode(str) {
  let n = 0;
  for (const ch of str) n = n * 62 + ALPHABET.indexOf(ch);
  return n;
}
const db = new Map();
let counter = 100000;
function shorten(longUrl) {
  const code = encode(counter++);
  db.set(code, longUrl);
  return 'https://sho.rt/' + code;
}
console.log(shorten('https://example.com/products/shoes?color=red'));
console.log(shorten('https://example.com/blog/mern-interview'));
console.log('encode(125) =', encode(125), '| decode("21") =', decode('21'));
console.log('Redirect q0U ->', db.get('q0U'));
console.log('7 chars can hold', (62 ** 7).toLocaleString('en-US'), 'URLs');`,
      },
      result: `https://sho.rt/q0U
https://sho.rt/q0V
encode(125) = 21 | decode("21") = 125
Redirect q0U -> https://example.com/products/shoes?color=red
7 chars can hold 3,521,614,606,208 URLs`,
      explanation: `Base62 is like writing numbers with 62 digits instead of 10. 125 = 2 x 62 + 1, so it becomes "21". A counter guarantees no collisions (unlike hashing the URL and taking 7 characters, which can collide and needs a retry). 7 characters give 3.5 trillion codes, enough for years.

Full design to explain in the interview:
- API: \`POST /api/urls { longUrl, customAlias?, expiresAt? }\` -> 201 \`{ shortUrl }\`; \`GET /:code\` -> 301/302 redirect, 404 if missing, 410 if expired.
- Schema: \`{ code: String (unique index), longUrl, userId, clicks: Number, expiresAt (TTL index) }\`.
- Read-heavy (100:1), so cache code -> longUrl in Redis. Count clicks asynchronously (Redis INCR or a queue) so the redirect stays fast.
- 301 (permanent) lets browsers cache it -> fewer hits but you lose analytics; 302 (temporary) sends every click to you -> analytics work. Most shorteners use 302.
- Counter as a bottleneck: give each server a range (server A uses 1-1,000,000, B the next million) or use Redis INCR.
- Security: validate URLs, block malicious domains, rate limit creation per user/IP.`,
    },
    {
      title: 'LRU cache: what Redis does when memory is full',
      scenario: 'Interviewers often ask "implement an LRU cache" (also a DSA question) right after you mention caching. A JavaScript Map remembers insertion order, which makes it easy.',
      steps: [
        'Use a Map; the first key is the least recently used, the last key is the most recent',
        'On get: delete the key and set it again to move it to the end',
        'On put: insert, and if size > capacity delete the first key',
        'Click Run and follow which key gets evicted',
      ],
      code: `class LRUCache {
  constructor(capacity) { this.capacity = capacity; this.map = new Map(); }
  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);      // move to "most recent" end
    this.map.set(key, value);
    return value;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value; // first key = least recently used
      this.map.delete(oldest);
      console.log('evicted', oldest);
    }
  }
}
const cache = new LRUCache(2);
cache.put('user:1', 'Asha');
cache.put('user:2', 'Ravi');
console.log(cache.get('user:1'));
cache.put('user:3', 'Neha');
console.log(cache.get('user:2'));
console.log([...cache.map.keys()]);`,
      playground: {
        html: '<h3>LRU cache - open the console</h3>',
        js: `class LRUCache {
  constructor(capacity) { this.capacity = capacity; this.map = new Map(); }
  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
      console.log('evicted', oldest);
    }
  }
}
const cache = new LRUCache(2);
cache.put('user:1', 'Asha');
cache.put('user:2', 'Ravi');
console.log(cache.get('user:1'));
cache.put('user:3', 'Neha');
console.log(cache.get('user:2'));
console.log([...cache.map.keys()]);`,
      },
      result: `Asha
evicted user:2
-1
[ 'user:1', 'user:3' ]`,
      explanation: `Reading user:1 made it "recent", so when user:3 arrived and capacity (2) was exceeded, user:2 (least recently used) was evicted. Both get and put are O(1). In a classic DSA answer you would build the same with a hash map + doubly linked list; in JS the Map already keeps order. In production you do not write this yourself: Redis with \`maxmemory-policy allkeys-lru\` does it.`,
    },
    {
      title: 'Rate limiter: token bucket per IP',
      scenario: '"How would you protect your login API from brute force?" or "Design a rate limiter". The token bucket allows short bursts but limits the average rate.',
      steps: [
        'Each client (IP or userId) gets a bucket with capacity tokens',
        'Tokens refill at a fixed rate per second',
        'Each request takes one token; with no tokens left reply 429 Too Many Requests',
        'Click Run: capacity 3, refill 1 token/second',
      ],
      code: `class TokenBucket {
  constructor(capacity, refillPerSec) {
    this.capacity = capacity; this.tokens = capacity;
    this.refillPerSec = refillPerSec; this.last = 0;
  }
  allow(nowSec) {
    const elapsed = nowSec - this.last;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerSec);
    this.last = nowSec;
    if (this.tokens >= 1) { this.tokens -= 1; return true; }
    return false;
  }
}
const buckets = new Map(); // one bucket per IP / user
function handle(ip, t) {
  if (!buckets.has(ip)) buckets.set(ip, new TokenBucket(3, 1));
  const ok = buckets.get(ip).allow(t);
  console.log('t=' + t + 's ' + ip + ' -> ' + (ok ? '200 OK' : '429 Too Many Requests'));
}
[0, 0, 0, 0, 0.5, 1.2, 1.3].forEach((t) => handle('10.0.0.1', t));
handle('10.0.0.2', 1.3);`,
      playground: {
        html: '<h3>Token bucket rate limiter - open the console</h3>',
        js: `class TokenBucket {
  constructor(capacity, refillPerSec) {
    this.capacity = capacity; this.tokens = capacity;
    this.refillPerSec = refillPerSec; this.last = 0;
  }
  allow(nowSec) {
    const elapsed = nowSec - this.last;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerSec);
    this.last = nowSec;
    if (this.tokens >= 1) { this.tokens -= 1; return true; }
    return false;
  }
}
const buckets = new Map();
function handle(ip, t) {
  if (!buckets.has(ip)) buckets.set(ip, new TokenBucket(3, 1));
  const ok = buckets.get(ip).allow(t);
  console.log('t=' + t + 's ' + ip + ' -> ' + (ok ? '200 OK' : '429 Too Many Requests'));
}
[0, 0, 0, 0, 0.5, 1.2, 1.3].forEach((t) => handle('10.0.0.1', t));
handle('10.0.0.2', 1.3);`,
      },
      result: `t=0s 10.0.0.1 -> 200 OK
t=0s 10.0.0.1 -> 200 OK
t=0s 10.0.0.1 -> 200 OK
t=0s 10.0.0.1 -> 429 Too Many Requests
t=0.5s 10.0.0.1 -> 429 Too Many Requests
t=1.2s 10.0.0.1 -> 200 OK
t=1.3s 10.0.0.1 -> 429 Too Many Requests
t=1.3s 10.0.0.2 -> 200 OK`,
      explanation: `The first 3 requests use the burst. At 0.5s only 0.5 token has refilled, so 429. At 1.2s there are 1.2 tokens, one request passes. Another IP has its own bucket. Other algorithms: fixed window (simple, but allows 2x bursts at window edges), sliding window log/counter (more accurate). With several Node servers, keep counters in **Redis** (INCR + EXPIRE or a Lua script) so all servers share the limit; in Express use \`express-rate-limit\` with a Redis store. Return the \`Retry-After\` header with 429.`,
    },
    {
      title: 'Consistent hashing vs hash % N when adding a cache server',
      scenario: '"You have 3 Redis cache servers and add a 4th. What happens to the cache?" With hash % N almost every key moves (cache stampede on the DB). Consistent hashing moves only about 1/N of keys.',
      steps: [
        'Hash every server (with many virtual nodes) onto a ring of numbers',
        'A key goes to the first server clockwise from the key hash',
        'Compare how many of 1000 keys change server when D is added',
        'Click Run',
      ],
      code: `function hash(str) { // simple FNV-1a 32-bit hash
  let h = 2166136261;
  for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
class HashRing {
  constructor(nodes, vnodes = 50) {
    this.ring = [];
    for (const n of nodes) for (let i = 0; i < vnodes; i++) this.ring.push({ h: hash(n + '#' + i), node: n });
    this.ring.sort((a, b) => a.h - b.h);
  }
  getNode(key) {
    const h = hash(key);
    const item = this.ring.find((x) => x.h >= h) || this.ring[0]; // wrap around
    return item.node;
  }
}
const keys = Array.from({ length: 1000 }, (_, i) => 'user:' + i);
const ring3 = new HashRing(['A', 'B', 'C']);
const ring4 = new HashRing(['A', 'B', 'C', 'D']);
let moved = 0;
for (const k of keys) if (ring3.getNode(k) !== ring4.getNode(k)) moved++;
const modMoved = keys.filter((k) => hash(k) % 3 !== hash(k) % 4).length;
console.log('Consistent hashing: keys moved after adding D =', moved, 'of 1000');
console.log('hash % N: keys moved after adding 4th server =', modMoved, 'of 1000');`,
      playground: {
        html: '<h3>Consistent hashing - open the console</h3>',
        js: `function hash(str) {
  let h = 2166136261;
  for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
class HashRing {
  constructor(nodes, vnodes = 50) {
    this.ring = [];
    for (const n of nodes) for (let i = 0; i < vnodes; i++) this.ring.push({ h: hash(n + '#' + i), node: n });
    this.ring.sort((a, b) => a.h - b.h);
  }
  getNode(key) {
    const h = hash(key);
    const item = this.ring.find((x) => x.h >= h) || this.ring[0];
    return item.node;
  }
}
const keys = Array.from({ length: 1000 }, (_, i) => 'user:' + i);
const ring3 = new HashRing(['A', 'B', 'C']);
const ring4 = new HashRing(['A', 'B', 'C', 'D']);
let moved = 0;
for (const k of keys) if (ring3.getNode(k) !== ring4.getNode(k)) moved++;
const modMoved = keys.filter((k) => hash(k) % 3 !== hash(k) % 4).length;
console.log('Consistent hashing: keys moved after adding D =', moved, 'of 1000');
console.log('hash % N: keys moved after adding 4th server =', modMoved, 'of 1000');`,
      },
      result: `Consistent hashing: keys moved after adding D = 299 of 1000
hash % N: keys moved after adding 4th server = 748 of 1000`,
      explanation: `With modulo, ~75% of keys map to a different server, so most of the cache becomes useless at once and MongoDB is flooded. With consistent hashing only the keys that now belong to D move (ideal is 1/4 = 250; we got 299 because of hashing randomness). Virtual nodes spread each server around the ring for an even load. This idea is used in distributed caches, DynamoDB/Cassandra partitioning and load balancers.`,
    },
    {
      title: 'Cache-aside with TTL in front of MongoDB',
      scenario: '"Your product page is slow. How will caching help, and how do you keep data fresh?"',
      steps: [
        'Build a key like product:<id>',
        'Check the cache; if present and not expired, return it (cache hit)',
        'On a miss, read the database and store the result with a TTL',
        'Click Run and count database calls',
      ],
      code: `// Cache-aside pattern with TTL (Redis-like Map) in front of a slow "database"
const cache = new Map();
let dbCalls = 0;
async function dbFindProduct(id) {
  dbCalls++;
  await new Promise((r) => setTimeout(r, 50)); // pretend MongoDB query
  return { id, name: 'Product ' + id, price: 499 };
}
async function getProduct(id, now) {
  const key = 'product:' + id;
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return { source: 'cache', data: hit.value };
  const value = await dbFindProduct(id);
  cache.set(key, { value, expiresAt: now + 60 }); // TTL 60s
  return { source: 'db', data: value };
}
(async () => {
  for (const [id, t] of [[1, 0], [1, 10], [2, 20], [1, 30], [1, 75]]) {
    const r = await getProduct(id, t);
    console.log('t=' + t + 's product ' + id + ' from ' + r.source);
  }
  console.log('Total DB calls:', dbCalls);
})();`,
      playground: {
        html: '<h3>Cache-aside with TTL - open the console</h3>',
        js: `const cache = new Map();
let dbCalls = 0;
async function dbFindProduct(id) {
  dbCalls++;
  await new Promise((r) => setTimeout(r, 50));
  return { id, name: 'Product ' + id, price: 499 };
}
async function getProduct(id, now) {
  const key = 'product:' + id;
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return { source: 'cache', data: hit.value };
  const value = await dbFindProduct(id);
  cache.set(key, { value, expiresAt: now + 60 });
  return { source: 'db', data: value };
}
(async () => {
  for (const [id, t] of [[1, 0], [1, 10], [2, 20], [1, 30], [1, 75]]) {
    const r = await getProduct(id, t);
    console.log('t=' + t + 's product ' + id + ' from ' + r.source);
  }
  console.log('Total DB calls:', dbCalls);
})();`,
      },
      result: `t=0s product 1 from db
t=10s product 1 from cache
t=20s product 2 from db
t=30s product 1 from cache
t=75s product 1 from db
Total DB calls: 3`,
      explanation: `Five reads but only three database calls. At t=75 the entry written at t=0 expired (TTL 60), so it was reloaded: TTL limits how stale data can be. Real code with Redis: \`const cached = await redis.get(key); if (cached) return JSON.parse(cached); const p = await Product.findById(id).lean(); await redis.set(key, JSON.stringify(p), { EX: 60 });\`. On update: \`await Product.updateOne(...); await redis.del(key);\`. Mention the **cache stampede** problem (many misses at once after expiry) and fixes: locking, random TTL jitter, or refreshing early.`,
    },
  ],
  interview: [
    { q: 'How do you approach a system design question as a fresher?', level: 'Easy', a: `I follow fixed steps: (1) clarify functional and non-functional requirements, (2) rough scale estimates (users, QPS, storage, read:write ratio), (3) define the REST APIs, (4) design the MongoDB collections and indexes, (5) draw the high-level architecture (React client, CDN, load balancer, stateless Node servers, Redis, MongoDB replica set, queue + workers), (6) discuss bottlenecks, scaling and trade-offs. I think aloud and state assumptions, e.g. "I assume 1 million daily users and a 100:1 read:write ratio".` },
    { q: 'What is the difference between vertical and horizontal scaling?', level: 'Easy', a: `Vertical scaling = make one machine bigger (more CPU/RAM). Simple, no code change, but limited by hardware, costly at the top end and still a single point of failure.\nHorizontal scaling = add more machines and spread load with a load balancer. Almost unlimited and fault tolerant, but the app must be stateless and you deal with distributed problems (shared sessions, cache consistency).\nIn practice: start vertical, then go horizontal for the stateless API tier; databases scale with replicas and sharding.` },
    { q: 'What is a load balancer and which algorithms do you know?', level: 'Easy', a: `A load balancer sits in front of several servers and distributes incoming requests among them, removing unhealthy servers using health checks. It also gives one public endpoint, can terminate SSL, and enables zero-downtime deploys.\nAlgorithms: round robin, weighted round robin, least connections, IP hash (sticky sessions), least response time.\nExamples: Nginx, HAProxy, AWS Application Load Balancer. For a MERN app: ALB -> 3 Express containers, each exposing GET /health.` },
    { q: 'What does "stateless server" mean and why is it important for scaling?', level: 'Medium', a: `A stateless server keeps no client-specific data in its own memory or disk between requests. Every request carries what is needed (e.g. a JWT) or the state lives in a shared store (Redis sessions, MongoDB, S3 for files).\nWhy: any server can handle any request, so you can add/remove servers freely, restart them, and the load balancer needs no sticky sessions.\nExample mistake: express-session with the default MemoryStore. User logs in on server A, next request goes to server B -> logged out. Fix: connect-redis store or JWT.` },
    { q: 'Explain caching. Where can you cache in a MERN application?', level: 'Medium', a: `Caching stores a copy of frequently read data in a faster place to cut latency and database load.\nLayers: (1) browser HTTP cache with Cache-Control/ETag, (2) CDN for static assets and images, (3) client data cache like TanStack Query/SWR, (4) server cache in Redis for API responses or DB results, (5) MongoDB's in-memory WiredTiger cache, (6) in-process memory cache for tiny config data.\nUse it for read-heavy, rarely changing data (product catalog, home feed). Always define TTL and invalidation.` },
    { q: 'Explain cache-aside, write-through and write-back caching.', level: 'Medium', a: `Cache-aside (lazy): app reads cache; on miss reads DB and fills cache with TTL. On write, update DB then delete the cache key. Most common with Redis.\nWrite-through: every write goes to the cache and the DB synchronously. Cache always fresh, writes slower.\nWrite-back (write-behind): write to cache only, flush to DB later in batches. Very fast writes, but risk of data loss if the cache crashes.\nFor a MERN e-commerce site I would use cache-aside for products with a 5-10 minute TTL and delete the key when an admin edits the product.` },
    { q: 'What is cache invalidation and what is a cache stampede?', level: 'Hard', a: `Cache invalidation = removing or updating cached data when the source changes so users do not see stale data. Approaches: TTL expiry, delete key on write, versioned keys (product:42:v7), pub/sub events to clear caches.\nCache stampede (thundering herd): a popular key expires and thousands of requests miss at the same moment, all hitting MongoDB together.\nFixes: a lock so only one request rebuilds the key (Redis SET NX), add random jitter to TTLs, refresh hot keys before they expire, or serve stale while revalidating.` },
    { q: 'What is a CDN and when would you use one?', level: 'Easy', a: `A Content Delivery Network is a set of servers worldwide that cache your static content (JS bundles, CSS, images, videos) close to users. A user in Chennai gets files from an Indian edge server instead of a US origin, so it is faster and the origin gets less load.\nUse it for the React build (Vercel/Netlify/CloudFront do it automatically), product images (Cloudinary/S3 + CloudFront), and even cacheable API responses. Use hashed filenames (main.4f3a.js) so you can cache forever and still deploy new versions.` },
    { q: 'Explain the CAP theorem with an example.', level: 'Hard', a: `CAP says a distributed data system cannot guarantee all three during a network partition: Consistency (every read sees the latest write), Availability (every request gets a non-error response) and Partition tolerance (keeps working despite lost messages between nodes). Since partitions will happen, the real choice is: during a partition, stay consistent (refuse some requests) or stay available (maybe return stale data).\nExample: a bank balance must be CP; a like counter can be AP.\nMongoDB with majority write concern is CP: if the primary is isolated it steps down, writes fail until a new primary is elected. Cassandra/DynamoDB default to AP with eventual consistency.` },
    { q: 'What is the difference between strong and eventual consistency?', level: 'Medium', a: `Strong consistency: after a write succeeds, every subsequent read returns that value. Eventual consistency: replicas may return old data for a short time but will converge if no new writes happen.\nIn MongoDB, reading from the primary gives strong consistency for that document; reading from secondaries (readPreference secondary) is eventually consistent because replication lag may be some milliseconds or seconds.\nUse eventual consistency where small delays are OK (feeds, view counts, search index), strong for payments, inventory, auth.` },
    { q: 'What is database replication? How does MongoDB do it?', level: 'Medium', a: `Replication keeps copies of the same data on multiple servers for high availability and read scaling.\nMongoDB uses replica sets: one primary receives all writes and records them in the oplog; secondaries copy the oplog and apply it. If the primary fails, members hold an election and a secondary becomes primary in seconds; drivers reconnect automatically. Typical size: 3 members (odd number for majority votes). Atlas gives you a 3-node replica set by default. Replication is also required for MongoDB transactions and change streams.` },
    { q: 'What is sharding? How do you choose a shard key?', level: 'Hard', a: `Sharding is horizontal partitioning: splitting one collection across multiple servers (shards) so data size and write load are spread out. In MongoDB, mongos routers send queries to the right shard using the shard key; config servers store the metadata.\nGood shard key: high cardinality, even distribution of writes, and present in most queries (so mongos targets one shard instead of broadcasting). Example: userId (hashed) for an orders collection.\nBad: a monotonically increasing key like createdAt or ObjectId with range sharding -> all inserts go to the last chunk (hot shard). Low-cardinality keys like country cause jumbo chunks.\nShard only when one replica set cannot handle the data or writes; it adds complexity.` },
    { q: 'Replication vs sharding: what is the difference?', level: 'Medium', a: `Replication = same data copied to many servers -> availability and read scaling, but each server still holds everything, so it does not help when data or writes outgrow one machine.\nSharding = different parts of the data on different servers -> scales storage and writes.\nIn production MongoDB they are combined: each shard is itself a replica set.` },
    { q: 'Design a URL shortener like bit.ly (high level).', level: 'Hard', a: `Requirements: shorten a long URL, redirect quickly, optional custom alias and expiry, click analytics. Read-heavy (~100:1).\nAPI: POST /api/urls { longUrl, alias? } -> 201 { shortUrl }; GET /:code -> 302 redirect; GET /api/urls/:code/stats.\nCode generation: unique counter (Redis INCR or per-server ID ranges) encoded in base62; 7 chars = 3.5 trillion codes. Alternative: random/hash code with a unique index and retry on collision.\nSchema: urls { code (unique index), longUrl, userId, createdAt, expiresAt (TTL index), clicks }.\nArchitecture: React -> LB -> stateless Express -> Redis (code -> longUrl) -> MongoDB replica set. Clicks are counted asynchronously (Redis INCR flushed periodically, or queue) so redirects stay fast.\nTrade-off: 301 is cached by browsers (less load, no analytics); 302 keeps analytics. Add rate limiting and malicious-URL checks.` },
    { q: 'Design a real-time chat application using MERN.', level: 'Hard', a: `Requirements: 1-to-1 and group chat, online status, message history, delivered/read receipts, offline notifications.\nTransport: WebSockets via Socket.IO. Client connects with a JWT in the handshake; server joins the socket to rooms (one per conversation).\nFlow: client emits "message" -> server validates -> saves to MongoDB -> emits to room -> receivers ack -> update status.\nScaling: many Node servers each hold some connections, so use the Socket.IO Redis adapter (pub/sub) to broadcast across servers. Sticky sessions at the LB are needed for the Socket.IO polling fallback.\nSchema: conversations { members: [userId], type, lastMessage }; messages { conversationId, senderId, text, createdAt, readBy } with index { conversationId: 1, createdAt: -1 } for paginated history (cursor-based, "load older").\nPresence: Redis set of online users with heartbeat expiry. Offline users get push notifications through a queue worker. Media goes to S3 via pre-signed URL.` },
    { q: 'Design the backend of a simple e-commerce site (like a small Flipkart).', level: 'Hard', a: `Core features: catalog with search/filter, cart, checkout, payments (Razorpay/Stripe), orders, admin.\nCollections: users; products { name, price, category, stock, images, ratingsAvg } with indexes on category+price and a text/Atlas Search index; carts { userId, items:[{productId, qty}] }; orders { userId, items (snapshot of name+price at purchase time), total, status, paymentId, address }.\nKey points: (1) store price snapshot in the order, not a reference, because prices change; (2) prevent overselling with an atomic update: updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } }) or a transaction across products+orders; (3) payment webhook must be verified by signature and idempotent; (4) cache product pages in Redis + CDN for images; (5) queue for emails/invoices; (6) rate limit login and checkout.\nScale: stateless API behind LB, read replicas for catalog, Atlas Search/Elasticsearch for search.` },
    { q: 'How do you prevent overselling when two users buy the last item at the same time?', level: 'Hard', a: `Make the stock check and decrement one atomic operation instead of read-then-write:\n\nconst r = await Product.updateOne(\n  { _id: productId, stock: { $gte: qty } },\n  { $inc: { stock: -qty } }\n);\nif (r.modifiedCount === 0) throw new Error('Out of stock');\n\nMongoDB applies single-document updates atomically, so only one buyer succeeds. For multi-item orders use a transaction (session.withTransaction) so all stock updates and the order insert succeed or fail together. Another approach: reserve stock for 10 minutes during checkout and release it if payment fails.` },
    { q: 'What is a message queue? Give a MERN use case.', level: 'Medium', a: `A message queue stores tasks/messages from producers until consumers process them. It decouples services, absorbs traffic spikes, and supports retries.\nExamples: RabbitMQ, Apache Kafka (event log/streaming), AWS SQS, BullMQ (Redis-based, popular with Node).\nUse case: after an order is placed, the API saves the order and adds jobs "send-confirmation-email" and "generate-invoice" to BullMQ, then responds 201 immediately. A worker process handles the jobs and retries with backoff if the email provider fails.` },
    { q: 'Polling vs long polling vs SSE vs WebSockets: which would you pick?', level: 'Medium', a: `Polling: client requests every N seconds. Easy but wasteful and delayed.\nLong polling: server holds the request open until data arrives, then client reconnects. Better latency, still HTTP overhead.\nServer-Sent Events: one long HTTP connection, server pushes text events to client only; auto-reconnect built in. Great for notifications, live scores, order status, streaming AI responses.\nWebSockets: full-duplex persistent connection, both sides send anytime. Best for chat, multiplayer, collaborative editing.\nRule: one-way updates -> SSE; two-way and frequent -> WebSockets; rare updates -> polling is fine.` },
    { q: 'How would you store and serve user-uploaded images in a MERN app?', level: 'Medium', a: `Do not store files in MongoDB documents or on the Node server's local disk (lost on redeploy, not shared across servers). Use object storage: AWS S3, Cloudinary, Firebase Storage.\nFlow: client asks API for a pre-signed upload URL -> uploads directly to S3 -> sends the final URL/key to the API -> API saves it in MongoDB. Serve via CDN (CloudFront/Cloudinary) with resized versions (thumbnails). Validate file type and size, and scan if needed. GridFS exists for storing large files inside MongoDB, but object storage is usually cheaper and simpler.` },
    { q: 'Monolith vs microservices: what would you choose for a startup MERN app?', level: 'Medium', a: `Monolith: one codebase and deployable (one Express app with modules: auth, products, orders). Simple to build, test, deploy and debug. Best for small teams and early products.\nMicroservices: separate services per business capability, each with its own DB, communicating via HTTP/gRPC or queues. Independent scaling and deployments, but needs DevOps maturity: service discovery, distributed tracing, network failures, data consistency.\nAnswer: start with a modular monolith with clean folder boundaries; split a service out only when there is a clear reason (different scaling needs, separate team).` },
    { q: 'What is an API gateway?', level: 'Medium', a: `An API gateway is a single entry point in front of many backend services. It handles routing (/api/orders -> order service), authentication, rate limiting, SSL termination, request logging, response caching and sometimes request aggregation.\nExamples: Kong, AWS API Gateway, Nginx, Apigee. In a microservices MERN setup the React app talks only to the gateway, not to each service directly.` },
    { q: 'How would you design pagination for a feed with millions of posts?', level: 'Medium', a: `Offset pagination (skip/limit) gets slower for deep pages because MongoDB still walks the skipped documents, and results shift when new posts are inserted.\nUse cursor (keyset) pagination: sort by { createdAt: -1, _id: -1 } with an index, return the last item's values as nextCursor, and query the next page with createdAt < cursor (tie-break on _id).\n\nPost.find({ createdAt: { $lt: cursor } }).sort({ createdAt: -1 }).limit(20)\n\nThis is O(limit) per page and stable for infinite scroll. Use offset only for small admin tables where users jump to page numbers.` },
    { q: 'Estimate QPS and storage for an app with 1 million daily active users.', level: 'Medium', a: `Assume each user makes ~50 API requests a day -> 50M requests/day. 1 day ~ 100,000 seconds -> ~500 requests/second average, peak ~2-3x = ~1,500 QPS. A few Node instances behind a load balancer with Redis handle this.\nStorage: if each user creates 5 records of 1 KB per day -> 5 GB/day -> ~1.8 TB/year. That suggests TTL/archiving of old data and, later, sharding.\nKey point: show the method, round numbers, and say what decision the number drives.` },
    { q: 'How do you make a system highly available?', level: 'Medium', a: `Remove single points of failure: multiple app instances behind a load balancer across availability zones, MongoDB replica set (3 nodes), Redis with replicas/Sentinel or managed Redis, health checks and auto-restart (PM2, Docker restart policies, Kubernetes), auto-scaling, backups with tested restore, graceful shutdown during deploys, and monitoring with alerts. Availability is measured as uptime percentage: 99.9% ~ 8.8 hours of downtime per year, 99.99% ~ 53 minutes.` },
    { q: 'What is idempotency and why does it matter in payments?', level: 'Hard', a: `An operation is idempotent if doing it many times has the same effect as doing it once. GET, PUT and DELETE are idempotent by definition; POST is not.\nIn payments, network retries or a double-click can create two charges or two orders. Fix: the client sends an Idempotency-Key header (a UUID per checkout); the server stores the key with the result (Redis/MongoDB unique index) and returns the stored result for repeats. Payment webhooks (Razorpay/Stripe) may be delivered more than once, so the handler checks if that payment ID was already processed before updating the order.` },
    { q: 'How would you implement search in a MERN product catalog?', level: 'Medium', a: `Small scale: MongoDB text index ($text) or regex on an indexed prefix; add filters on category/price with compound indexes.\nBetter: MongoDB Atlas Search (Lucene-based) for fuzzy matching, autocomplete and relevance ranking.\nLarge scale: a dedicated search engine like Elasticsearch/OpenSearch synced from MongoDB via change streams or a queue.\nFrontend: debounce input by ~300ms, cancel stale requests with AbortController, cache recent queries.` },
    { q: 'Where do you keep user sessions when you have multiple servers?', level: 'Medium', a: `Two common options:\n1. Stateless JWT: a short-lived access token (~15 min) sent with each request, plus a refresh token in an httpOnly, secure, SameSite cookie. Any server can verify the signature. Logout/revocation needs a token blacklist or a refresh-token store.\n2. Server-side sessions in Redis (express-session + connect-redis): the cookie holds only a session ID; any server reads the session from Redis. Easy to revoke.\nNever store sessions in a single server's memory when scaling horizontally.` },
    { q: 'Your API latency suddenly increased in production. How do you debug it?', level: 'Hard', a: `1. Check dashboards: which endpoints, since when, error rate, CPU/memory, event-loop lag.\n2. Correlate with the latest deploy or traffic spike; roll back if a deploy caused it.\n3. Look at MongoDB: Atlas Performance Advisor / profiler for slow queries; run explain() to find COLLSCANs; add the missing index.\n4. Check external calls (payment, email) and add timeouts/circuit breakers.\n5. Check for event-loop blocking (big JSON parsing, sync crypto, large loops) using clinic.js or --prof.\n6. Mitigate: cache hot endpoints, scale out, rate limit abusive clients.\nThen write a short post-mortem.` },
  ],
  practice: [
    {
      task: 'Write the Mongoose schema and Express routes for a URL shortener: POST /api/urls creates a short code (base62 of a counter stored in a "counters" collection), GET /:code redirects (302) and increments clicks, returns 404 if missing.',
      hint: 'Use findOneAndUpdate with $inc and { new: true, upsert: true } on a counter document to get the next number atomically.',
      solution: `import express from 'express';
import mongoose from 'mongoose';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const encode = (n) => { let s = ''; do { s = ALPHABET[n % 62] + s; n = Math.floor(n / 62); } while (n > 0); return s; };

const Counter = mongoose.model('Counter', new mongoose.Schema({ _id: String, seq: Number }));
const Url = mongoose.model('Url', new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  longUrl: { type: String, required: true },
  clicks: { type: Number, default: 0 },
}, { timestamps: true }));

async function nextId() {
  const c = await Counter.findOneAndUpdate(
    { _id: 'url' }, { $inc: { seq: 1 } }, { new: true, upsert: true }
  );
  return 100000 + c.seq;
}

const app = express();
app.use(express.json());

app.post('/api/urls', async (req, res, next) => {
  try {
    const { longUrl } = req.body;
    try { new URL(longUrl); } catch { return res.status(400).json({ error: 'Invalid URL' }); }
    const code = encode(await nextId());
    await Url.create({ code, longUrl });
    res.status(201).json({ shortUrl: process.env.BASE_URL + '/' + code, code });
  } catch (err) { next(err); }
});

app.get('/:code', async (req, res, next) => {
  try {
    const doc = await Url.findOneAndUpdate({ code: req.params.code }, { $inc: { clicks: 1 } });
    if (!doc) return res.status(404).send('Short URL not found');
    res.redirect(302, doc.longUrl);
  } catch (err) { next(err); }
});

await mongoose.connect(process.env.MONGO_URI);
app.listen(5000);`,
    },
    {
      task: 'Write an Express middleware that caches GET responses in Redis for N seconds (cache-aside), keyed by the URL. Add a helper to invalidate a key.',
      hint: 'Wrap res.json so that, after the controller produces the body, you also store it in Redis with the EX option.',
      solution: `import { createClient } from 'redis';
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

export function cache(seconds) {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();
    const key = 'cache:' + req.originalUrl;
    try {
      const hit = await redis.get(key);
      if (hit) { res.set('X-Cache', 'HIT'); return res.json(JSON.parse(hit)); }
    } catch { /* if Redis is down, just skip the cache */ }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) redis.set(key, JSON.stringify(body), { EX: seconds }).catch(() => {});
      res.set('X-Cache', 'MISS');
      return originalJson(body);
    };
    next();
  };
}

export const invalidate = (url) => redis.del('cache:' + url);

// usage
// router.get('/products/:id', cache(300), getProduct);
// router.put('/products/:id', protect, admin, async (req, res) => {
//   const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   await invalidate('/api/products/' + req.params.id);
//   res.json(p);
// });`,
    },
    {
      task: 'Implement a fixed-window rate limiter middleware (max N requests per IP per minute) in plain Express using a Map, returning 429 with a Retry-After header. Then explain in comments what changes for multiple servers.',
      hint: 'Key = ip + current minute number (Math.floor(Date.now() / 60000)).',
      solution: `export function rateLimit({ max = 100, windowMs = 60_000 } = {}) {
  const hits = new Map(); // key -> count
  setInterval(() => hits.clear(), windowMs).unref(); // simple cleanup each window

  return (req, res, next) => {
    const windowNo = Math.floor(Date.now() / windowMs);
    const key = req.ip + ':' + windowNo;
    const count = (hits.get(key) || 0) + 1;
    hits.set(key, count);
    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(Math.max(0, max - count)));
    if (count > max) {
      const retryAfter = Math.ceil(((windowNo + 1) * windowMs - Date.now()) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests, try again later' });
    }
    next();
  };
}

// app.use('/api/auth/login', rateLimit({ max: 5, windowMs: 60_000 }));

// Multiple servers: each server has its own Map, so a client could get N x servers.
// Move the counter to Redis so all servers share it:
//   const c = await redis.incr(key); if (c === 1) await redis.expire(key, 60);
// Or use express-rate-limit with rate-limit-redis. Behind a proxy set app.set('trust proxy', 1)
// so req.ip is the real client IP.`,
    },
    {
      task: 'Design the MongoDB schema for a chat app (users, conversations, messages) and write the query for paginated message history (20 at a time, newest first, cursor based).',
      hint: 'Index messages on { conversationId: 1, createdAt: -1 }. The cursor is the createdAt of the oldest message the client already has.',
      solution: `import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const conversationSchema = new Schema({
  type: { type: String, enum: ['direct', 'group'], default: 'direct' },
  name: String,
  members: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
  lastMessage: { text: String, senderId: Schema.Types.ObjectId, at: Date }, // embedded for chat list
}, { timestamps: true });

const messageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, maxlength: 4000 },
  attachments: [{ url: String, kind: String }],
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Conversation = model('Conversation', conversationSchema);
export const Message = model('Message', messageSchema);

// GET /api/conversations/:id/messages?before=2026-11-18T10:00:00.000Z
export async function getMessages(req, res) {
  const filter = { conversationId: new Types.ObjectId(req.params.id) };
  if (req.query.before) filter.createdAt = { $lt: new Date(req.query.before) };
  const messages = await Message.find(filter).sort({ createdAt: -1 }).limit(20).lean();
  const nextCursor = messages.length === 20 ? messages.at(-1).createdAt : null;
  res.json({ messages: messages.reverse(), nextCursor });
}
// Messages are a separate collection (not embedded in conversation) because
// they grow without limit and the 16 MB document limit would be hit.`,
    },
    {
      task: 'Write a 10-line "design doc" outline (as a JS object or bullet list) for a food-delivery order-tracking feature: requirements, API, data model, real-time choice, scaling notes.',
      hint: 'Order status updates are one-way (server -> customer), so SSE is enough; the delivery partner app sends location updates.',
      solution: `const designDoc = {
  requirements: ['Customer sees order status (PLACED, PREPARING, PICKED_UP, DELIVERED)',
                 'Live rider location every 5s', 'Works for 50k concurrent orders at dinner peak'],
  api: ['POST /api/orders', 'PATCH /api/orders/:id/status (restaurant/rider)',
        'POST /api/riders/me/location { lat, lng }', 'GET /api/orders/:id/stream (SSE)'],
  dataModel: {
    orders: '{ userId, restaurantId, riderId, items[], total, status, statusHistory[{status, at}] }',
    riderLocations: 'Redis GEO / key rider:<id> -> { lat, lng, at } with 30s TTL (not MongoDB: too many writes)',
  },
  realtime: 'SSE from server to customer (one-way). Rider app uses HTTP POST or WebSocket.',
  scaling: ['Stateless Node servers behind a LB', 'Redis pub/sub channel order:<id> so any server can push to the client',
            'Indexes: orders { userId: 1, createdAt: -1 }, { riderId: 1, status: 1 }',
            'Queue for notifications (SMS/push)', 'Rate limit location updates'],
  tradeoffs: 'Location in Redis is not durable, acceptable since only the latest point matters.',
};
console.log(JSON.stringify(designDoc, null, 2));`,
    },
  ],
  quiz: [
    {
      question: 'Your Express app runs on 3 servers behind a load balancer. Users get logged out randomly. What is the most likely cause?',
      options: ['MongoDB indexes are missing', 'Sessions are stored in each server\'s memory instead of a shared store', 'The CDN is caching HTML', 'The load balancer uses HTTPS'],
      answer: 1,
      explanation: 'In-memory sessions exist only on the server that created them. Use Redis-backed sessions or JWTs so the servers are stateless.',
    },
    {
      question: 'According to the CAP theorem, what must a distributed database choose between during a network partition?',
      options: ['Speed and storage', 'Indexes and replication', 'Security and availability', 'Consistency and availability'],
      answer: 3,
      explanation: 'Partitions cannot be avoided, so during one the system either rejects some requests to stay consistent (CP) or answers with possibly stale data (AP).',
    },
    {
      question: 'Which is the WORST shard key for a high-write orders collection with range-based sharding?',
      options: ['createdAt (always increasing)', 'hashed userId', 'hashed orderId', 'compound { userId, createdAt }'],
      answer: 0,
      explanation: 'A monotonically increasing key sends every new insert to the last chunk, creating a hot shard.',
    },
    {
      question: 'For a live cricket score widget that only needs server-to-client updates, the simplest good choice is:',
      options: ['WebSockets with a custom binary protocol', 'Polling every 100ms', 'Server-Sent Events (SSE)', 'Sending emails'],
      answer: 2,
      explanation: 'SSE is a one-way stream over HTTP with automatic reconnect: ideal for push-only updates.',
    },
    {
      question: 'In cache-aside, what should happen when an admin updates a product price?',
      options: ['Nothing, the TTL will fix it eventually only', 'Update MongoDB and delete (or update) the product key in Redis', 'Restart the Redis server', 'Write only to Redis and never to MongoDB'],
      answer: 1,
      explanation: 'Writing to the database and invalidating the cache key ensures the next read loads the fresh price. Waiting for TTL alone shows stale prices.',
    },
  ],
};
