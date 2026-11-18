export default {
  id: "day-12-architecture-system-design",
  title: "Architecture: Choosing a Framework, Monolith vs Microservices, REST vs GraphQL, Redis Caching and System Design Basics",
  module: "Module 4: Architecture",
  day: 12,
  level: "Advanced",
  duration: "4 hours",
  summary: "Learn to make and defend architecture decisions as a Python developer: when to pick Flask, Django, FastAPI or Streamlit, monolith vs microservices, REST vs GraphQL, how caching with Redis works, and a step-by-step approach to system design interview questions.",
  objectives: [
    "Choose between Flask, Django, FastAPI and Streamlit for a given requirement and justify it",
    "Compare monolith, modular monolith and microservices architectures",
    "Explain REST and GraphQL with their trade-offs",
    "Apply caching patterns (cache-aside, TTL, invalidation) with Redis",
    "Use a repeatable framework to answer system design interview questions",
    "Discuss scalability terms: horizontal scaling, load balancer, replication, queues, rate limiting",
  ],
  theory: [
    {
      heading: "Choosing a Python Framework",
      content: "There is no single best framework; there is the best fit for the problem, the team and the deadline.\n\n**Django** is \"batteries included\": ORM, migrations, admin panel, authentication, forms, templates and security defaults out of the box. Great for content-heavy sites, admin dashboards, e-commerce and CRUD business apps; with Django REST Framework it builds solid APIs.\n\n**Flask** is a micro-framework: routing and templates, and you choose extensions (SQLAlchemy, Flask-Login). Great for small services, learning, and when you want full control.\n\n**FastAPI** is a modern ASGI framework built on type hints and Pydantic: automatic validation, auto-generated OpenAPI/Swagger docs, async support and very high performance. Ideal for REST APIs, microservices and ML model serving.\n\n**Streamlit** turns Python scripts into data apps and dashboards without HTML/JS. Perfect for internal data tools, ML demos and prototypes, not for public multi-page products with complex auth.",
      points: [
        "Admin panel + auth + ORM needed quickly -> Django",
        "High-performance JSON API, async I/O, ML inference -> FastAPI",
        "Small/simple service or custom stack -> Flask",
        "Data dashboard for analysts in a day -> Streamlit",
      ],
      tip: "In interviews, always justify a choice with requirements (team skill, features needed, performance, ecosystem), not personal preference.",
    },
    {
      heading: "Monolith vs Microservices",
      content: "A **monolith** is one deployable application containing all features (users, orders, payments) sharing one codebase and usually one database. It is simple to develop, test, deploy and debug - the right default for startups and small teams.\n\n**Microservices** split the system into small independent services (user-service, order-service, payment-service), each with its own codebase, database and deployment, communicating over HTTP/gRPC or message queues. Benefits: independent scaling and deployments, team autonomy, fault isolation, freedom of tech choice. Costs: network latency and failures, distributed transactions, complex monitoring/tracing, DevOps overhead.\n\nA **modular monolith** is the popular middle path: one deployment, but code organised into clearly separated modules (like Django apps) that can be extracted into services later.",
      points: [
        "Start with a (modular) monolith; extract services when a real need appears",
        "Signals for microservices: large teams blocking each other, parts with very different scaling needs",
        "Microservices need: API gateway, service discovery, centralized logging, tracing, CI/CD per service",
      ],
    },
    {
      heading: "REST vs GraphQL",
      content: "**REST** models data as resources with URLs and uses HTTP methods: GET /products/101, POST /orders, PATCH /users/7, DELETE /cart/3. Responses are easily cached by HTTP caches, status codes carry meaning, and tooling is everywhere (DRF, FastAPI).\n\n**GraphQL** exposes a single endpoint (usually POST /graphql) and a typed schema. The client sends a query describing exactly which fields it wants, possibly across related objects, in one request. This avoids **over-fetching** (getting too many fields) and **under-fetching** (needing many calls). Python libraries: Strawberry, Graphene (graphene-django), Ariadne.",
      syntax: `# REST: 2 requests, fixed shapes
GET /users/7            -> {id, name, email, address, phone, ...}
GET /users/7/orders     -> [{id, total, status, items, ...}, ...]

# GraphQL: 1 request, exact fields
query {
  user(id: 7) {
    name
    orders(last: 3) { id total }
  }
}
`,
      points: [
        "REST pros: simple, HTTP caching, standard status codes, easy to secure per endpoint",
        "GraphQL pros: flexible queries, strong schema, great for mobile/varied frontends",
        "GraphQL cons: harder caching, N+1 query risk (use DataLoader), query complexity limits needed",
      ],
    },
    {
      heading: "Caching with Redis",
      content: "**Redis** is an in-memory key-value store, extremely fast (sub-millisecond), supporting strings, hashes, lists, sets, sorted sets and expiry. Python uses it via the redis-py package (`pip install redis`). Common uses: caching, sessions, rate limiting, leaderboards (sorted sets), Celery broker, pub/sub.\n\nThe most common pattern is **cache-aside (lazy loading)**: the app first checks the cache; on a miss it reads the database, stores the result in Redis with a **TTL** (time-to-live), and returns it. When data changes, the app **invalidates** (deletes) the key so the next read fetches fresh data.",
      syntax: `import json, redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

def get_product(pid):
    key = f"product:{pid}"
    cached = r.get(key)
    if cached:
        return json.loads(cached)          # cache HIT
    product = db.fetch_product(pid)        # cache MISS -> DB
    r.set(key, json.dumps(product), ex=300)  # expire in 5 minutes
    return product
`,
      points: [
        "Write-through: write to cache and DB together; reads always hit fresh cache",
        "Eviction policies when memory is full: allkeys-lru, volatile-ttl, etc.",
        "Problems to know: stale data, cache stampede (many misses at once), cache penetration (missing keys)",
        "Python in-process caching: functools.lru_cache / cache for pure functions",
      ],
      tip: "\"There are only two hard things in Computer Science: cache invalidation and naming things.\" Always mention TTL + invalidation when you propose a cache.",
    },
    {
      heading: "Scalability Building Blocks",
      content: "System design interviews test whether you know the standard building blocks and when to use them.",
      points: [
        "Vertical scaling: bigger machine (more CPU/RAM). Horizontal scaling: more machines behind a load balancer",
        "Load balancer (Nginx, AWS ALB): spreads traffic; app servers should be stateless (sessions in Redis/DB)",
        "Database read replicas for read-heavy workloads; indexing; sharding/partitioning for huge data",
        "CDN (CloudFront, Cloudflare) for static files and images close to users",
        "Message queues (Redis/RabbitMQ with Celery, Kafka) for slow or async work: emails, reports, video processing",
        "Rate limiting (e.g. 100 requests/min per user) to protect APIs",
        "Observability: logs, metrics (Prometheus/Grafana), tracing, alerts",
        "CAP theorem: in a network partition, choose consistency or availability",
      ],
    },
    {
      heading: "A Framework for System Design Interviews",
      content: "For junior and mid-level Python roles, interviewers expect a clear, structured conversation, not a perfect architecture. Use these steps and think aloud:\n\n**1. Clarify requirements**: functional (what users do) and non-functional (users, requests per second, latency, availability). **2. Estimate** roughly: daily users, reads vs writes, storage. **3. High-level design**: client -> load balancer -> app servers -> cache -> database, plus queue/workers if needed. **4. API and data model**: main endpoints and tables. **5. Deep dive** into one or two parts (caching, database choice, scaling hotspots). **6. Trade-offs and bottlenecks**: single points of failure, monitoring, what you would do with more time.",
      points: [
        "Ask questions before drawing - jumping straight to Kafka is a red flag",
        "Use numbers: 1 million requests/day is only about 12 requests/second on average",
        "Name Python tools concretely: FastAPI, PostgreSQL, Redis, Celery, Nginx, Docker",
      ],
    },
  ],
  examples: [
    {
      title: "Cache-Aside Pattern with TTL and Invalidation (Simulation)",
      scenario: "A product page API is slow because every request hits the database. You simulate a Redis-style cache in pure Python to understand HIT, MISS, TTL expiry and invalidation before using real Redis.",
      steps: [
        "Create main.py and paste the code (no Redis needed - a dict and a fake clock imitate it)",
        "Run: python main.py",
        "Observe which calls are HIT and which are MISS",
        "In a real project replace TTLCache with redis.Redis and r.set(key, value, ex=60)",
      ],
      code: `class FakeClock:
    def __init__(self):
        self.now = 0
    def time(self):
        return self.now

class TTLCache:
    """Tiny Redis-like cache: set with expiry, get returns None when expired."""
    def __init__(self, clock):
        self.clock = clock
        self.store = {}
    def set(self, key, value, ex):
        self.store[key] = (value, self.clock.time() + ex)
    def get(self, key):
        item = self.store.get(key)
        if item is None:
            return None
        value, expires_at = item
        if self.clock.time() >= expires_at:
            del self.store[key]
            return None
        return value
    def delete(self, key):
        self.store.pop(key, None)

DB = {101: {"id": 101, "name": "Laptop", "price": 55000}}
db_calls = 0

def db_get_product(pid):
    global db_calls
    db_calls += 1
    return dict(DB[pid])

clock = FakeClock()
cache = TTLCache(clock)

def get_product(pid):
    key = f"product:{pid}"
    data = cache.get(key)
    if data is not None:
        return data, "HIT"
    data = db_get_product(pid)
    cache.set(key, data, ex=60)
    return data, "MISS"

def update_price(pid, price):
    DB[pid]["price"] = price
    cache.delete(f"product:{pid}")   # invalidate

print(get_product(101))
print(get_product(101))
clock.now = 61
print(get_product(101)[1], "after TTL expired")
update_price(101, 52000)
print(get_product(101))
print("DB calls:", db_calls)
`,
      python: {
        files: {
          "main.py": `class FakeClock:
    def __init__(self):
        self.now = 0
    def time(self):
        return self.now

class TTLCache:
    """Tiny Redis-like cache: set with expiry, get returns None when expired."""
    def __init__(self, clock):
        self.clock = clock
        self.store = {}
    def set(self, key, value, ex):
        self.store[key] = (value, self.clock.time() + ex)
    def get(self, key):
        item = self.store.get(key)
        if item is None:
            return None
        value, expires_at = item
        if self.clock.time() >= expires_at:
            del self.store[key]
            return None
        return value
    def delete(self, key):
        self.store.pop(key, None)

DB = {101: {"id": 101, "name": "Laptop", "price": 55000}}
db_calls = 0

def db_get_product(pid):
    global db_calls
    db_calls += 1
    return dict(DB[pid])

clock = FakeClock()
cache = TTLCache(clock)

def get_product(pid):
    key = f"product:{pid}"
    data = cache.get(key)
    if data is not None:
        return data, "HIT"
    data = db_get_product(pid)
    cache.set(key, data, ex=60)
    return data, "MISS"

def update_price(pid, price):
    DB[pid]["price"] = price
    cache.delete(f"product:{pid}")   # invalidate

print(get_product(101))
print(get_product(101))
clock.now = 61
print(get_product(101)[1], "after TTL expired")
update_price(101, 52000)
print(get_product(101))
print("DB calls:", db_calls)
`,
        },
      },
      result: `({'id': 101, 'name': 'Laptop', 'price': 55000}, 'MISS')
({'id': 101, 'name': 'Laptop', 'price': 55000}, 'HIT')
MISS after TTL expired
({'id': 101, 'name': 'Laptop', 'price': 52000}, 'MISS')
DB calls: 3`,
      explanation: "The first call misses and loads from the DB; the second is served from cache. After 61 fake seconds the 60-second TTL has passed, so the key is treated as expired and the DB is hit again. update_price changes the DB and deletes the cache key, so the next read returns the new price instead of stale data. Five reads cost only three DB calls - on a busy site the saving is huge.",
    },
    {
      title: "In-Process Caching with functools.lru_cache",
      scenario: "A checkout service computes shipping cost per pincode by calling a slow courier API. The same pincodes repeat often, so you memoize the function inside the Python process.",
      steps: [
        "Create main.py with the code below",
        "Run: python main.py",
        "Compare 'real calls' with the number of lookups",
        "Read cache_info() to see hits and misses",
      ],
      code: `from functools import lru_cache

calls = 0

@lru_cache(maxsize=128)
def shipping_cost(pincode: str) -> int:
    global calls
    calls += 1
    # pretend this calls a slow courier API
    return 40 if pincode.startswith("4") else 70

for pin in ["411001", "560001", "411001", "411001", "560001"]:
    print(pin, shipping_cost(pin))

print("real calls:", calls)
print(shipping_cost.cache_info())
`,
      python: {
        files: {
          "main.py": `from functools import lru_cache

calls = 0

@lru_cache(maxsize=128)
def shipping_cost(pincode: str) -> int:
    global calls
    calls += 1
    # pretend this calls a slow courier API
    return 40 if pincode.startswith("4") else 70

for pin in ["411001", "560001", "411001", "411001", "560001"]:
    print(pin, shipping_cost(pin))

print("real calls:", calls)
print(shipping_cost.cache_info())
`,
        },
      },
      result: `411001 40
560001 70
411001 40
411001 40
560001 70
real calls: 2
CacheInfo(hits=3, misses=2, maxsize=128, currsize=2)`,
      explanation: "lru_cache stores results keyed by the arguments, so repeat pincodes skip the function body. maxsize=128 keeps only the 128 most recently used entries (Least Recently Used eviction). Limitation: this cache lives inside one process - with 4 Gunicorn workers on 3 servers you get 12 separate caches and no shared invalidation. That is exactly why teams use Redis as a shared cache.",
    },
    {
      title: "Pick the Framework: Three Real Requirements",
      scenario: "Your tech lead gives you three projects and asks which Python framework you would choose for each, with reasons.",
      steps: [
        "Read each requirement and list must-have features",
        "Map features to what each framework offers out of the box",
        "Write a short decision record (ADR) with choice, reasons and trade-offs",
      ],
      code: `Project A: College admission portal - student login, forms, document upload,
           staff need an admin panel to review applications. Team of 3, 6 weeks.
  Choice: Django (+ Django admin, auth, forms, ORM, migrations)
  Why:    admin panel and auth for free; secure defaults (CSRF, XSS protection)

Project B: ML price-prediction API called by a mobile app, 500 req/s at peak,
           needs request validation and API docs for the mobile team.
  Choice: FastAPI + Uvicorn/Gunicorn
  Why:    Pydantic validation, auto Swagger docs at /docs, async, fast

Project C: Sales team wants an internal dashboard of monthly revenue from a CSV/DB,
           with filters, built by a data analyst in two days.
  Choice: Streamlit
  Why:    pure Python widgets + charts, st.cache_data, one-click Community Cloud deploy

(Flask fits when: tiny service, webhook receiver, or the team wants to hand-pick libraries.)
`,
      result: `Decision record:
A -> Django | B -> FastAPI | C -> Streamlit
Each choice is justified by requirements, team size and deadline.`,
      explanation: "Interviewers care about the reasoning. Django wins when you need many built-in features fast; FastAPI when you need a typed, documented, high-throughput API; Streamlit when the users are internal and speed of building matters more than UI control. Mentioning trade-offs (e.g. Streamlit reruns the whole script on each interaction; Django is heavier for a tiny API) shows maturity.",
    },
    {
      title: "System Design Walkthrough: URL Shortener",
      scenario: "A classic interview question: \"Design a URL shortener like bit.ly\" for a Python developer role.",
      steps: [
        "Clarify: create short link, redirect, optional expiry and click count; 10M new links/month, 100:1 read:write",
        "Estimate: ~4 writes/s and ~400 reads/s average; ~1 KB per row -> ~120 GB in 10 years",
        "Draw high-level design: client -> LB -> FastAPI servers -> Redis -> PostgreSQL",
        "Define APIs and table; choose the short code strategy",
        "Discuss scaling, caching and failure points",
      ],
      code: `APIs
  POST /api/links   {"url": "https://..."}   -> 201 {"code": "aZ3k9Q", "short": "https://sho.rt/aZ3k9Q"}
  GET  /{code}                               -> 301/302 redirect to original URL

Table links
  id BIGSERIAL PK | code VARCHAR(10) UNIQUE | long_url TEXT | created_at | expires_at | clicks

Short code
  base62(id) -> 62^7 = ~3.5 trillion codes with 7 characters

Read path (hot)
  GET /aZ3k9Q -> Redis GET link:aZ3k9Q -> HIT: redirect
                                        -> MISS: SELECT from Postgres, SET with TTL, redirect
Click counting
  push event to a queue (Celery/Redis) -> worker batches UPDATE clicks
Scaling
  stateless FastAPI behind load balancer, Postgres read replicas, Redis for hot links,
  rate limiting on POST to stop spam
`,
      result: `A clear design covering requirements, estimates, API, data model,
caching (cache-aside), async analytics and horizontal scaling.`,
      explanation: "The read-heavy ratio is why Redis caching is central: popular links are served from memory. base62 of an auto-increment ID guarantees unique codes without collision checks. Counting clicks asynchronously keeps redirects fast. Stateless app servers can scale horizontally. Ending with bottlenecks (single DB primary, cache stampede on viral links) shows senior thinking.",
    },
  ],
  interview: [
    {
      q: "When would you choose Django over FastAPI?",
      a: "When the project needs many built-in features quickly: admin panel, authentication, ORM with migrations, forms, templates and mature security defaults - e.g. CMS, e-commerce, internal business apps. FastAPI is better for pure, high-performance, async JSON APIs and ML serving with automatic validation and OpenAPI docs. Django + DRF can also build APIs well, so team experience matters.",
      level: "Easy",
    },
    {
      q: "What is Streamlit good for, and what are its limits?",
      a: "Quick data apps, dashboards and ML demos written entirely in Python with widgets and charts. Limits: the script reruns top to bottom on every interaction, limited layout/UI control, not ideal for complex multi-user products, fine-grained auth or heavy custom frontends. Use caching (st.cache_data/st.cache_resource) to keep it fast.",
      level: "Easy",
    },
    {
      q: "Monolith vs microservices - which would you start with and why?",
      a: "Usually a modular monolith: one codebase and deployment is faster to build, test and debug, with no network calls between modules. Move to microservices when there is a clear need - independent scaling of a hotspot, large teams blocking each other, different release cycles - and when the team can handle the operational cost (CI/CD per service, monitoring, tracing, distributed data).",
      level: "Medium",
    },
    {
      q: "How do microservices communicate?",
      a: "Synchronously via HTTP/REST or gRPC (request-response), or asynchronously via message brokers/queues (RabbitMQ, Kafka, Redis streams, Celery) using events. Async messaging decouples services and absorbs load spikes; sync calls are simpler but create runtime coupling, so use timeouts, retries and circuit breakers.",
      level: "Medium",
    },
    {
      q: "Explain REST vs GraphQL with an example of over-fetching.",
      a: "REST exposes fixed resource endpoints; GET /users/7 may return 20 fields when the mobile screen needs only name and photo (over-fetching), and fetching their orders needs another call (under-fetching). GraphQL lets the client request exactly user { name orders { id total } } in one call against a typed schema. REST is simpler and HTTP-cache friendly; GraphQL is flexible but needs care with caching, N+1 queries and query cost limits.",
      level: "Medium",
    },
    {
      q: "What is the cache-aside pattern?",
      a: "Application-managed caching: on read, check the cache; on a miss, read from the database, store in cache with a TTL and return. On write, update the database and delete (invalidate) the cache key. Only requested data is cached. Downsides: first request is slow and there can be brief stale data.",
      level: "Medium",
    },
    {
      q: "What is a cache stampede and how do you prevent it?",
      a: "When a popular key expires, many concurrent requests miss at once and all hit the database. Prevent with: a lock so only one request rebuilds the value (e.g. Redis SET key NX EX), serving slightly stale data while refreshing in background, adding random jitter to TTLs so keys do not expire together, or pre-warming hot keys.",
      level: "Hard",
    },
    {
      q: "Why should application servers be stateless, and where do you store sessions?",
      a: "Stateless servers let a load balancer send any request to any instance, so you can add/remove servers freely and survive crashes. Store session/state in a shared store: Redis, the database, or signed JWT tokens on the client. Uploaded files go to object storage like S3, not local disk.",
      level: "Medium",
    },
    {
      q: "What is the difference between horizontal and vertical scaling?",
      a: "Vertical scaling adds more resources (CPU/RAM) to one machine - simple but limited and a single point of failure. Horizontal scaling adds more machines behind a load balancer - near-unlimited and fault tolerant but requires stateless apps and distributed data handling.",
      level: "Easy",
    },
    {
      q: "How would you implement rate limiting for an API using Redis?",
      a: "Fixed window: key rate:{user}:{minute}, INCR it on each request, set EXPIRE 60 on first increment, reject with 429 Too Many Requests if the count exceeds the limit. Sliding window with sorted sets (ZADD timestamps, ZREMRANGEBYSCORE old ones, ZCARD) or token bucket gives smoother limits. Because Redis is shared, limits work across all app servers.",
      level: "Hard",
    },
    {
      q: "Explain the CAP theorem in simple words.",
      a: "In a distributed system, when a network partition happens (nodes cannot talk), you must choose between Consistency (every read gets the latest write, or an error) and Availability (every request gets a response, possibly stale). Partition tolerance is required in practice. Banking-like systems lean to consistency; social feeds lean to availability with eventual consistency.",
      level: "Hard",
    },
    {
      q: "Design a notification system that sends emails and SMS when an order is placed. What Python components would you use?",
      a: "The order API (Django/FastAPI) saves the order and publishes a task/event instead of sending inline. Celery workers with Redis or RabbitMQ as broker consume tasks and call email (SES/SendGrid) and SMS (Twilio/MSG91) providers with retries and exponential backoff. Use idempotency keys to avoid duplicate sends, a notifications table for status, templates per channel, rate limits for providers, and monitoring (Flower, logs, dead-letter handling). The user gets a fast API response while delivery happens in the background.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Write a cache-aside function get_user(uid) using redis-py: check key user:{uid}, on miss call fetch_user_from_db(uid), store JSON with a 10-minute TTL, and write update_user_email(uid, email) that updates the DB and invalidates the key.",
      hint: "Use r.get, r.set(key, json.dumps(data), ex=600) and r.delete(key).",
      solution: `import json
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

def get_user(uid):
    key = f"user:{uid}"
    cached = r.get(key)
    if cached is not None:
        return json.loads(cached)
    user = fetch_user_from_db(uid)
    r.set(key, json.dumps(user), ex=600)
    return user

def update_user_email(uid, email):
    update_email_in_db(uid, email)
    r.delete(f"user:{uid}")
`,
    },
    {
      task: "Implement a fixed-window rate limiter in pure Python: allow(user, now) returns True for up to 3 requests per user per 60-second window. Test it with a list of timestamps.",
      hint: "Window number = now // 60; keep counts in a dict keyed by (user, window).",
      solution: `from collections import defaultdict

LIMIT = 3
counts = defaultdict(int)

def allow(user, now):
    window = now // 60
    key = (user, window)
    if counts[key] >= LIMIT:
        return False
    counts[key] += 1
    return True

for t in [0, 10, 20, 30, 61, 62]:
    print(t, allow("ravi", t))
# 0 True, 10 True, 20 True, 30 False, 61 True, 62 True
`,
    },
    {
      task: "Write a short Architecture Decision Record (ADR) choosing between REST and GraphQL for a food delivery app that has a web app, an Android app and a restaurant partner portal, each needing different fields.",
      hint: "Use sections: Context, Decision, Consequences.",
      solution: `ADR-007: API style for client apps

Context:
Three clients (web, Android, partner portal) need different shapes of the
same data (restaurants, menus, orders). Mobile networks are slow; REST
endpoints were causing over-fetching and multiple round trips.

Decision:
Use GraphQL (Strawberry on FastAPI) for client-facing reads/writes.
Keep simple REST endpoints for webhooks (payment gateway) and health checks.

Consequences:
+ Each client fetches exactly the fields it needs in one request
+ Typed schema doubles as documentation
- Need DataLoader to avoid N+1 queries, query depth/cost limits
- HTTP caching is harder; use Redis caching in resolvers
`,
    },
    {
      task: "Outline (in text) a system design for a 'College Results Portal' where 2 lakh students check results at exactly 10 AM on result day.",
      hint: "This is a read-heavy traffic spike on mostly static data. Think pre-computation, caching and CDN.",
      solution: `Requirements: login by roll number + DOB, view marks; massive spike at 10:00,
data is read-only after publishing.

Estimate: 200,000 users in ~10 minutes -> ~330 req/s average, peaks 2-3k req/s.

Design:
- Pre-compute results into Redis (key result:{roll}) before 10 AM (cache warming)
- FastAPI app servers (stateless, Gunicorn+Uvicorn workers) behind a load balancer;
  auto-scale or pre-scale instances for the window
- PostgreSQL read replica as fallback on cache miss
- CDN for static assets (CSS/JS/logo); a lightweight page
- Rate limiting per IP to stop bots; queue PDF marksheet generation via Celery
- Monitoring dashboards + alerts; a static "high traffic" fallback page

Trade-off: data is immutable after publishing, so long TTLs are safe.
`,
    },
  ],
  quiz: [
    {
      question: "Which framework gives you a built-in admin panel, ORM and authentication out of the box?",
      options: ["Flask", "FastAPI", "Django", "Streamlit"],
      answer: 2,
      explanation: "Django is batteries-included with admin, ORM, migrations and auth.",
    },
    {
      question: "What is a main advantage of a monolith for a small team?",
      options: [
        "Each feature scales independently",
        "Simpler development, testing and deployment",
        "Each service can use a different language",
        "No database is needed",
      ],
      answer: 1,
      explanation: "One codebase and one deployment means less operational complexity - ideal early on.",
    },
    {
      question: "GraphQL mainly solves which REST problem?",
      options: ["Lack of HTTPS", "Over-fetching and under-fetching of data", "Slow databases", "Missing status codes"],
      answer: 1,
      explanation: "Clients ask for exactly the fields they need, often in a single request.",
    },
    {
      question: "In the cache-aside pattern, what should happen when data is updated?",
      options: [
        "Nothing, the cache updates itself",
        "Restart Redis",
        "Update the database and delete/invalidate the cache key",
        "Increase the TTL",
      ],
      answer: 2,
      explanation: "Invalidating the key ensures the next read loads fresh data from the database.",
    },
    {
      question: "What does TTL mean for a cached key?",
      options: ["Total transfer limit", "Time-to-live: the key expires after this time", "Type of the stored value", "Number of reads allowed"],
      answer: 1,
      explanation: "TTL sets an expiry so stale data does not live forever, e.g. r.set(key, value, ex=300).",
    },
    {
      question: "Why is functools.lru_cache not enough as a cache for an app running on several servers?",
      options: [
        "It only works with strings",
        "It is slower than a database",
        "Each process has its own cache, so it is not shared and cannot be invalidated globally",
        "It deletes data every second",
      ],
      answer: 2,
      explanation: "lru_cache lives in one Python process; a shared cache like Redis is needed across workers and servers.",
    },
  ],
};
