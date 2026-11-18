export default {
  id: 'day-13-mongodb-atlas-in-production',
  title: 'MongoDB Atlas in Production: Users & Roles, Network Access, Connection Strings, Env Variables, Atlas Search, Monitoring & Performance Advisor',
  module: 'Module 5: Production & Interview',
  day: 13,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Running MongoDB on your laptop is easy; running it safely for real users is a different job. Today you configure Atlas like a professional: least-privilege database users and roles, IP access lists, correct connection strings and environment variables, connection pooling in Node.js, Atlas Search for full-text search, and the monitoring tools (metrics, alerts, Query Profiler, Performance Advisor) that tell you what to fix.',
  objectives: [
    'Create database users with least-privilege built-in and custom roles',
    'Configure network access (IP access list, VPC peering / private endpoints) safely',
    'Build connection strings with the right options and keep secrets in environment variables',
    'Configure a production-ready Mongoose/driver connection (single client, pool size, timeouts, graceful shutdown)',
    'Explain Atlas Search ($search) and when to use it instead of $regex',
    'Use Atlas metrics, alerts, Query Profiler and Performance Advisor to find and fix slow queries',
  ],
  theory: [
    {
      heading: 'Atlas building blocks: organisation, project, cluster, tiers',
      content: `Atlas is organised in levels:
- **Organization** – your company; billing and org-level users live here.
- **Project** – one per application/environment (e.g. \`shop-dev\`, \`shop-prod\`). Network rules, database users and alerts are set **per project**.
- **Cluster** – the actual database deployment (a replica set or a sharded cluster).

Cluster tiers:
- **M0 (Free)** – 512 MB, shared, for learning and demos. Limited metrics, no backups.
- **Flex** – low-cost, pay-as-you-go for small apps and prototypes.
- **Dedicated (M10 and above)** – dedicated servers, full metrics, Performance Advisor, Cloud Backup with point-in-time restore, auto-scaling, private networking. Use this for real production.

Best practice: **separate projects (or at least clusters) for dev, staging and production**, each with its own users and passwords. A developer's laptop should never have the production password.`,
      tip: 'Pick the cluster region close to your app server (e.g. both in Mumbai, ap-south-1). A database in the US with an API server in India adds ~200 ms to every query.',
    },
    {
      heading: 'Database users and roles (least privilege)',
      content: `Atlas has two kinds of users – do not mix them up:
- **Atlas (UI) users** – people who log in to cloud.mongodb.com to manage clusters.
- **Database users** – credentials your **application** or mongosh uses to read/write data (Security → **Database Access**).

Built-in database roles:
- \`read\` – read any collection of a database
- \`readWrite\` – read + insert/update/delete
- \`dbAdmin\` – indexes, stats, validation (no data reads by default)
- \`atlasAdmin\` / \`readWriteAnyDatabase\` – very powerful; avoid for apps

**Least privilege** means each user gets only what it needs:
- API server → \`readWrite\` on \`shop\` only
- Analytics/BI dashboard → \`read\` on \`shop\` (ideally on an analytics node)
- Backup/migration script → specific roles, temporary user
- Humans → read-only by default, write access only when needed

You can also create **custom roles** (e.g. "can insert into orders but never delete"), **temporary users** that expire automatically, and use **X.509 certificates, AWS IAM or OIDC/workforce identity** instead of passwords.`,
      syntax: `# Atlas CLI – create an app user with readWrite on one database
atlas dbusers create readWrite@shop --username shopApi --password '<generated-strong-password>' --projectId <PROJECT_ID>

# read-only user for reports, auto-deleted after 7 days
atlas dbusers create read@shop --username reportBot --password '<pwd>' --deleteAfter 2025-07-01T00:00:00Z

// self-managed MongoDB: the same idea in mongosh
use admin
db.createUser({ user: 'shopApi', pwd: passwordPrompt(), roles: [ { role: 'readWrite', db: 'shop' } ] })`,
      tip: 'Generate long random passwords (Atlas has an "Autogenerate Secure Password" button). Avoid special characters like @ : / in passwords, or URL-encode them, because they break connection strings.',
    },
    {
      heading: 'Network access: who is allowed to connect',
      content: `Even with the right password, Atlas refuses connections from unknown networks. Security → **Network Access**:

- **IP Access List** – add the public IP of your server (e.g. a Render/Railway/EC2 static outbound IP) or your office. You can add **temporary entries** that expire after 6 hours for your laptop.
- \`0.0.0.0/0\` (allow from anywhere) – convenient for platforms without a static IP, but then the **password is your only protection**. If you must use it, use strong credentials, least-privilege users and rotate passwords.
- **VPC/VNet peering** and **Private Endpoints** (AWS PrivateLink, Azure Private Link, GCP Private Service Connect) – on dedicated tiers your app talks to Atlas over a private network, never the public internet. This is the gold standard for production.

All Atlas traffic is encrypted with **TLS**, and data is **encrypted at rest**. Enterprise features add customer-managed keys (KMS) and Queryable Encryption.`,
      points: [
        'Typical "MongoServerSelectionError / connection timed out" on deploy = server IP not in the access list',
        'Use temporary access-list entries for developer laptops',
        'Production: private endpoint or peering + least-privilege users + strong passwords',
      ],
    },
    {
      heading: 'Connection strings and environment variables',
      content: `An Atlas connection string looks like this:

\`mongodb+srv://shopApi:<password>@cluster0.abcde.mongodb.net/shop?retryWrites=true&w=majority&appName=shop-api\`

Parts:
- \`mongodb+srv://\` – DNS seed list; TLS on by default
- \`shopApi:<password>\` – database user (URL-encode special characters with \`encodeURIComponent\`)
- \`cluster0.abcde.mongodb.net\` – cluster host
- \`/shop\` – default database for the connection
- Options: \`retryWrites=true\`, \`w=majority\`, \`appName\` (shows up in logs and profiler – very helpful), \`maxPoolSize\`, \`readPreference\`

**Never hard-code it.** Store it in an environment variable:
- Local: \`.env\` file (listed in \`.gitignore\`) loaded with \`dotenv\` or Node 22's built-in \`node --env-file=.env server.js\`
- Production: the hosting platform's secret settings (Render/Railway/Vercel environment variables, AWS Secrets Manager, GitHub Actions secrets)
- Commit a \`.env.example\` with placeholder values so teammates know which variables exist.

Validate env variables at start-up and **fail fast** with a clear message if one is missing.`,
      syntax: `# .env  (NOT committed)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://shopApi:Xy7pQ2wZ9@cluster0.abcde.mongodb.net/shop?retryWrites=true&w=majority&appName=shop-api

# .env.example  (committed)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-host>/<db>?retryWrites=true&w=majority

# run with Node 22 built-in env loading
node --env-file=.env server.js`,
      tip: 'If a password ever reaches GitHub (even for one minute), consider it leaked: rotate it in Atlas immediately. Bots scan public repos for mongodb+srv:// strings within minutes.',
    },
    {
      heading: 'Production-ready connection in Node.js / Mongoose',
      content: `Common mistakes that crash production apps:
- Connecting **inside every request** → thousands of connections, Atlas connection limit reached.
- Starting the HTTP server **before** the database is connected.
- No timeouts → requests hang for 30 s when the DB is unreachable.
- Not closing the connection on shutdown → in-flight writes lost during deploys.

Rules:
1. Create **one** connection (Mongoose) or **one MongoClient** per process at start-up and reuse it. The driver keeps a **connection pool** (default \`maxPoolSize\` 100).
2. Connect first, then \`app.listen()\`.
3. Set \`serverSelectionTimeoutMS\` (e.g. 5000) so failures are fast and visible.
4. Listen to connection events (\`connected\`, \`disconnected\`, \`error\`) and log them.
5. On \`SIGTERM\`/\`SIGINT\`, stop accepting requests, then \`mongoose.connection.close()\`.
6. In serverless (Vercel functions) **cache the connection in a global variable** between invocations.
7. Disable \`autoIndex\` in production Mongoose and create indexes deliberately (migration script / Atlas UI).`,
    },
    {
      heading: 'Atlas Search: real full-text search',
      content: `\`$regex: /phone/i\` works for tiny collections, but it cannot use normal indexes well (except anchored, case-sensitive prefixes), has no relevance ranking, no typo tolerance and no language awareness.

**Atlas Search** is a full-text search engine (based on Apache Lucene) built into Atlas clusters. You create a **search index** on a collection and query it with the **\`$search\`** aggregation stage:
- Relevance scoring (best matches first)
- **Fuzzy** matching for typos ("iphnoe" → "iPhone")
- **Autocomplete** for search boxes
- Language analyzers, synonyms, highlighting, facets (counts by category/brand)
- Data is synced automatically from the collection – no separate Elasticsearch cluster to maintain

**Atlas Vector Search** (\`$vectorSearch\`) stores embeddings for semantic search and AI/RAG apps.

The self-managed \`$text\` operator with a text index (Day 7) is the basic alternative, but Atlas Search is far more powerful and is what MERN e-commerce apps on Atlas use.`,
      syntax: `// search index definition (Atlas UI → Search → Create Index, JSON editor)
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": [ { "type": "string" }, { "type": "autocomplete" } ],
      "brand": { "type": "string" },
      "category": { "type": "stringFacet" }
    }
  }
}

// query
db.products.aggregate([
  { $search: { index: 'products_search', text: { query: 'iphnoe', path: ['name', 'brand'], fuzzy: { maxEdits: 1 } } } },
  { $limit: 5 },
  { $project: { name: 1, price: 1, score: { $meta: 'searchScore' } } }
])`,
    },
    {
      heading: 'Monitoring: metrics, alerts, Query Profiler and Performance Advisor',
      content: `Atlas gives you a dashboard for each cluster:

- **Metrics** – operations per second (opcounters), query targeting (documents examined ÷ returned – a high ratio means missing indexes), connections, CPU, memory, disk IOPS, replication lag.
- **Real-Time Performance Panel** – live view of current operations and hottest collections.
- **Alerts** – email/Slack/PagerDuty notifications, e.g. "connections > 80% of limit", "replication lag > 60 s", "disk > 90%", "query targeting > 1000", "host down". Set them up **before** launch.
- **Query Profiler** – lists slow operations (default > 100 ms) with their shape, duration, keys and docs examined.
- **Performance Advisor** – analyses slow queries and **suggests indexes** to create (and unused/redundant indexes to drop), with the estimated impact. It also flags **schema anti-patterns** (unbounded arrays, too many indexes, large documents).
- **Cloud Backup** – scheduled snapshots and point-in-time restore on dedicated tiers.

A healthy workflow: Performance Advisor suggests an index → verify with \`explain()\` (COLLSCAN → IXSCAN) on staging → create it with a rolling index build in Atlas → watch query targeting drop.`,
      points: [
        'Query targeting close to 1 = efficient; 1000+ = scanning far more docs than returned',
        'Use appName in the connection string so the profiler shows which service ran a query',
        'Too many connections usually means a connection is created per request',
      ],
    },
  ],
  examples: [
    {
      title: 'Act on a Performance Advisor suggestion (COLLSCAN → IXSCAN)',
      scenario: 'Performance Advisor reports a slow query shape on orders: { customerId: <n> } sorted by orderDate desc (the "My Orders" page) and suggests the index { customerId: 1, orderDate: -1 }. Verify the problem and the fix with explain().',
      steps: [
        'Open the shop dataset',
        'Run the query with .explain() and note COLLSCAN and totalDocsExamined 12',
        'Create the suggested compound index',
        'Run explain() again on the sorted query and confirm IXSCAN with only 2 documents examined',
      ],
      code: `db.orders.find({ customerId: 101 }).explain()
db.orders.createIndex({ customerId: 1, orderDate: -1 })
db.orders.find({ customerId: 101 }).sort({ orderDate: -1 }).explain()`,
      mongo: {
        dataset: 'shop',
        query: `db.orders.find({ customerId: 101 }).explain()
db.orders.createIndex({ customerId: 1, orderDate: -1 })
db.orders.find({ customerId: 101 }).sort({ orderDate: -1 }).explain()`,
      },
      result: `{
  queryPlanner: {
    namespace: 'shop.orders',
    winningPlan: { stage: 'COLLSCAN', filter: { customerId: 101 } }
  },
  executionStats: { nReturned: 2, totalKeysExamined: 0, totalDocsExamined: 12 }
}
'customerId_1_orderDate_-1'
{
  queryPlanner: {
    namespace: 'shop.orders',
    winningPlan: {
      stage: 'FETCH',
      inputStage: {
        stage: 'IXSCAN',
        indexName: 'customerId_1_orderDate_-1',
        keyPattern: { customerId: 1, orderDate: -1 }
      }
    }
  },
  executionStats: { nReturned: 2, totalKeysExamined: 2, totalDocsExamined: 2 }
}`,
      explanation: 'Before the index MongoDB examined all 12 orders to return 2 (query targeting ratio 6; on a real collection of 5 million orders it would be millions). After the index it examined exactly the 2 matching keys and documents. This is exactly the before/after check you should do on staging before creating an index suggested by Performance Advisor on production.',
    },
    {
      title: 'Why $regex is not enough: the problem Atlas Search solves',
      scenario: 'Customers type "air" in the shop search box. A case-insensitive regex finds products, but there is no ranking, no typo tolerance and it scans every document. See the result, then compare with the Atlas Search version.',
      steps: [
        'Open the shop dataset',
        'Run a find with { name: { $regex: "air", $options: "i" } }',
        'Notice it matches "MacBook Air" and "Airdopes" with no relevance order',
        'Read the explanation for the equivalent $search query used on Atlas',
      ],
      code: 'db.products.find({ name: { $regex: \'air\', $options: \'i\' } }, { name: 1, price: 1 })',
      mongo: {
        dataset: 'shop',
        query: 'db.products.find({ name: { $regex: \'air\', $options: \'i\' } }, { name: 1, price: 1 })',
      },
      result: `{ _id: 4, name: 'MacBook Air M3', price: 114900 }
{ _id: 7, name: 'boAt Airdopes 141', price: 1299 }`,
      explanation: 'A case-insensitive, unanchored regex must check every name (it cannot use a normal index efficiently) and a typo like "iar" returns nothing. On Atlas you would instead run `db.products.aggregate([{ $search: { index: "products_search", text: { query: "air", path: "name", fuzzy: { maxEdits: 1 } } } }, { $limit: 10 }])` – it uses a Lucene index, ranks results by score and tolerates typos. `$search` only runs on Atlas, so it is not available in the Shell Lab.',
    },
    {
      title: 'Production Mongoose connection module (env, pool, timeouts, shutdown)',
      scenario: 'Your Express + Mongoose API is going live on Render with an Atlas M10 cluster. Write the db module and server start-up the way production teams do.',
      steps: [
        'npm install express mongoose',
        'Create src/config/env.js that validates required environment variables',
        'Create src/config/db.js with a single Mongoose connection, timeouts and event logging',
        'In server.js connect first, then listen, and close everything on SIGTERM',
        'Set MONGODB_URI in the Render dashboard (Environment) – not in the code',
      ],
      code: `// src/config/env.js
const required = ['MONGODB_URI', 'PORT'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Missing environment variables:', missing.join(', '));
  process.exit(1);                         // fail fast
}
module.exports = {
  mongoUri: process.env.MONGODB_URI,
  port: Number(process.env.PORT),
  isProd: process.env.NODE_ENV === 'production',
};

// src/config/db.js
const mongoose = require('mongoose');
const { mongoUri, isProd } = require('./env');

mongoose.set('strictQuery', true);

mongoose.connection.on('connected', () => console.log('MongoDB connected'));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));

async function connectDB() {
  await mongoose.connect(mongoUri, {
    maxPoolSize: 20,                 // connections per app instance
    serverSelectionTimeoutMS: 5000,  // fail fast if Atlas is unreachable / IP not allowed
    socketTimeoutMS: 45000,
    autoIndex: !isProd,              // build indexes deliberately in production
    appName: 'shop-api',
  });
}
module.exports = { connectDB, mongoose };

// server.js
const app = require('./src/app');
const { port } = require('./src/config/env');
const { connectDB, mongoose } = require('./src/config/db');

(async () => {
  try {
    await connectDB();                                  // 1. DB first
    const server = app.listen(port, () => console.log('API on port ' + port)); // 2. then HTTP

    const shutdown = async (signal) => {
      console.log(signal + ' received, shutting down');
      server.close(async () => {                        // stop new requests
        await mongoose.connection.close();              // finish & close pool
        process.exit(0);
      });
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
})();`,
      result: `MongoDB connected
API on port 5000

# if the server IP is not in the Atlas access list (after 5 s):
Startup failed: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted.

# on deploy / Ctrl+C:
SIGTERM received, shutting down
MongoDB disconnected`,
      explanation: 'One connection per process with a bounded pool protects Atlas connection limits (an M0 allows 500). `serverSelectionTimeoutMS` turns a silent hang into a clear error in 5 s – the message above is what Mongoose prints when the IP access list blocks you. Graceful shutdown lets in-flight requests finish during rolling deploys. `appName` makes your service visible in the Query Profiler and logs.',
    },
    {
      title: 'Health check and safe config endpoint (API Lab simulation)',
      scenario: 'Load balancers and uptime monitors call /health. Ops also wants a debug endpoint that shows which cluster the app uses WITHOUT leaking the password. This API Lab version simulates process.env and the connection state with in-memory objects.',
      steps: [
        'Open the API Lab and paste the code',
        'Send GET /health while the simulated DB state is "connected"',
        'Send GET /api/debug/config and check that the password is masked',
        'Send POST /api/debug/simulate-disconnect and call /health again – it returns 503',
      ],
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// --- simulated environment (in a real app: process.env + mongoose.connection.readyState) ---
const env = {
  NODE_ENV: 'production',
  MONGODB_URI: 'mongodb+srv://shopApi:Xy7pQ2wZ9@cluster0.abcde.mongodb.net/shop?retryWrites=true&w=majority&appName=shop-api',
};
const STATES = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
const db = { readyState: 1 };

// hide the password before showing a connection string anywhere
function maskUri(uri) {
  return uri.replace(/\\/\\/([^:]+):([^@]+)@/, '//$1:****@');
}

app.get('/health', (req, res) => {
  const state = STATES[db.readyState];
  const ok = db.readyState === 1;
  res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'degraded', db: state });
});

app.get('/api/debug/config', (req, res) => {
  const url = new URL(env.MONGODB_URI);
  res.json({
    env: env.NODE_ENV,
    uri: maskUri(env.MONGODB_URI),
    host: url.hostname,
    database: url.pathname.slice(1),
    appName: url.searchParams.get('appName'),
  });
});

app.post('/api/debug/simulate-disconnect', (req, res) => {
  db.readyState = 0;
  res.json({ message: 'DB state set to disconnected' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/health' },
          { method: 'GET', url: '/api/debug/config' },
          { method: 'POST', url: '/api/debug/simulate-disconnect' },
          { method: 'GET', url: '/health' },
        ],
      },
      result: `GET /health → 200 {"status":"ok","db":"connected"}
GET /api/debug/config → 200 {"env":"production","uri":"mongodb+srv://shopApi:****@cluster0.abcde.mongodb.net/shop?retryWrites=true&w=majority&appName=shop-api","host":"cluster0.abcde.mongodb.net","database":"shop","appName":"shop-api"}
POST /api/debug/simulate-disconnect → 200 {"message":"DB state set to disconnected"}
GET /health → 503 {"status":"degraded","db":"disconnected"}`,
      explanation: 'A health endpoint that checks the database state (`mongoose.connection.readyState` is 1 when connected) lets Render/Kubernetes/uptime monitors restart or stop routing to a broken instance – returning 503 instead of 200 is the key. `maskUri` uses a regex to replace the password between ":" and "@" so logs and debug output never leak credentials. In production protect debug routes with admin authentication or remove them.',
    },
    {
      title: 'Atlas Search index + autocomplete API with Mongoose',
      scenario: 'Build a search-as-you-type endpoint for the shop: typo-tolerant search plus autocomplete suggestions, using an Atlas Search index on products.',
      steps: [
        'In Atlas → your cluster → Atlas Search → Create Search Index → JSON editor, name it products_search, paste the definition below',
        'Wait until the index status is Active',
        'Add the two Express routes below to your Mongoose project',
        'Call GET /api/search?q=galxy and GET /api/suggest?q=mac',
      ],
      code: `// Atlas Search index "products_search" on shop.products
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name":  [ { "type": "string" }, { "type": "autocomplete", "tokenization": "edgeGram", "minGrams": 2, "maxGrams": 15 } ],
      "brand": { "type": "string" },
      "category": { "type": "string" }
    }
  }
}

// routes/search.routes.js
const router = require('express').Router();
const Product = require('../models/product.model');

// full-text, typo tolerant, ranked
router.get('/search', async (req, res) => {
  const q = String(req.query.q || '').slice(0, 50);
  if (!q) return res.json([]);
  const results = await Product.aggregate([
    { $search: {
        index: 'products_search',
        compound: {
          should: [
            { text: { query: q, path: 'name', fuzzy: { maxEdits: 1 }, score: { boost: { value: 3 } } } },
            { text: { query: q, path: ['brand', 'category'], fuzzy: { maxEdits: 1 } } },
          ],
        },
    } },
    { $limit: 10 },
    { $project: { name: 1, price: 1, score: { $meta: 'searchScore' } } },
  ]);
  res.json(results);
});

// autocomplete for the search box
router.get('/suggest', async (req, res) => {
  const q = String(req.query.q || '').slice(0, 30);
  if (q.length < 2) return res.json([]);
  const results = await Product.aggregate([
    { $search: { index: 'products_search', autocomplete: { query: q, path: 'name' } } },
    { $limit: 5 },
    { $project: { _id: 0, name: 1 } },
  ]);
  res.json(results.map((r) => r.name));
});

module.exports = router;`,
      result: `GET /api/search?q=galxy  → 200 [{"_id":2,"name":"Galaxy S24","price":74999,"score":2.71}]
GET /api/suggest?q=mac   → 200 ["MacBook Air M3"]
(scores are illustrative; they depend on the index and data)`,
      explanation: '`$search` must be the **first** stage of the pipeline. Fuzzy `maxEdits: 1` matches "galxy" to "Galaxy". The `compound.should` clause boosts matches in the name over matches in brand/category. Limiting `q` length is a small safety measure against abusive input. Because the index is maintained by Atlas, new products become searchable automatically within seconds.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between Atlas users and database users?',
      a: 'Atlas (organization/project) users log in to the Atlas UI and manage clusters, billing and settings. Database users are credentials used by applications and shells to authenticate to the cluster and read/write data, with database roles such as read or readWrite. They are managed separately.',
      level: 'Easy',
    },
    {
      q: 'What does least privilege mean for MongoDB users? Give an example.',
      a: 'Each user gets only the permissions it needs. The API user gets readWrite on the shop database only; a BI tool gets read only; admins use separate accounts; no app uses atlasAdmin. This limits damage if credentials leak or code has an injection bug.',
      level: 'Easy',
    },
    {
      q: 'Your app works locally but on Render you get MongoServerSelectionError. What do you check?',
      a: 'First the Atlas IP Access List – the hosting platform\'s outbound IP must be allowed (or 0.0.0.0/0 temporarily). Then: MONGODB_URI is set in the platform environment variables, the password is correct and URL-encoded, the database user exists in that project, and DNS SRV resolution works. serverSelectionTimeoutMS makes this fail fast with a clear message.',
      level: 'Medium',
    },
    {
      q: 'Why should you not allow 0.0.0.0/0 in Atlas Network Access?',
      a: 'It allows connection attempts from any IP on the internet, so the password becomes the only line of defence against brute force or leaked credentials. Prefer specific static IPs, temporary entries, VPC peering or private endpoints. If unavoidable, use strong passwords, least-privilege users and rotation.',
      level: 'Medium',
    },
    {
      q: 'How do you manage MongoDB credentials across environments?',
      a: 'Keep them in environment variables: a git-ignored .env locally (loaded with dotenv or node --env-file), and the hosting platform\'s secret/environment settings or a secrets manager in production. Use different users/passwords and ideally different clusters for dev, staging and production; commit only a .env.example; rotate on leaks.',
      level: 'Easy',
    },
    {
      q: 'Explain the parts of a mongodb+srv connection string and important options.',
      a: 'Scheme mongodb+srv (SRV DNS lookup, TLS on), username:password (URL-encoded), cluster host, optional /defaultDb, and options such as retryWrites=true, w=majority, appName, maxPoolSize, readPreference, authSource. appName helps identify the app in logs and the profiler.',
      level: 'Medium',
    },
    {
      q: 'What is connection pooling and why should you create only one MongoClient / Mongoose connection?',
      a: 'The driver keeps a pool of open TCP connections (default maxPoolSize 100) and reuses them for operations, avoiding expensive TLS handshakes per request. Creating a new client per request opens new pools, exhausts the cluster\'s connection limit and slows everything. Create one at start-up and share it; in serverless functions cache it in a global.',
      level: 'Medium',
    },
    {
      q: 'What is Atlas Search and how is it different from $regex and $text?',
      a: 'Atlas Search is a Lucene-based full-text search engine integrated in Atlas, queried with the $search stage. It provides relevance scoring, fuzzy matching, autocomplete, analyzers, synonyms, highlighting and facets, and runs on a separate search index synced automatically. $regex scans and cannot rank; $text uses a basic text index with limited features (no fuzzy, no autocomplete).',
      level: 'Medium',
    },
    {
      q: 'What does the Performance Advisor do?',
      a: 'It analyses slow queries recorded in the logs and recommends indexes to create, with the impact estimate, and flags redundant/unused indexes and schema anti-patterns (e.g. unbounded arrays, excessive indexes). You validate suggestions with explain() and build them with rolling index builds.',
      level: 'Easy',
    },
    {
      q: 'What is the "query targeting" metric and what does a high value mean?',
      a: 'It is the ratio of documents (or keys) scanned to documents returned. Near 1 is ideal. A value like 1000 means queries scan 1000 documents for each one returned – usually a missing or wrong index. Atlas can alert when it exceeds a threshold.',
      level: 'Hard',
    },
    {
      q: 'Which Atlas alerts would you configure before launch?',
      a: 'Host down / no primary, replication lag high, connections above ~80% of the limit, CPU and disk usage high (e.g. > 90% disk), query targeting high, oplog window low, backup failures, and billing thresholds. Route them to email plus Slack/PagerDuty.',
      level: 'Hard',
    },
    {
      q: 'How do you make a Node.js API shut down safely with MongoDB?',
      a: 'Handle SIGTERM/SIGINT: stop accepting new HTTP connections with server.close(), let in-flight requests finish, then close the MongoDB connection (mongoose.connection.close() or client.close()) and exit. This prevents dropped writes during deploys or autoscaling.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write the Atlas CLI (or mongosh) commands to create: (1) an API user with readWrite on shop, (2) a reporting user with read on shop that expires in 7 days, (3) a temporary access-list entry for your laptop IP 49.36.10.20.',
      hint: 'atlas dbusers create, --deleteAfter, atlas accessLists create with --deleteAfter.',
      solution: `# 1. API user
atlas dbusers create readWrite@shop --username shopApi --password '<strong-random-password>'

# 2. read-only reporting user that expires
atlas dbusers create read@shop --username reportBot --password '<pwd>' --deleteAfter 2025-06-08T00:00:00Z

# 3. temporary IP entry
atlas accessLists create 49.36.10.20 --type ipAddress --comment "Asha laptop" --deleteAfter 2025-06-01T18:00:00Z

// mongosh equivalent for 1 on a self-managed server
use admin
db.createUser({ user: 'shopApi', pwd: passwordPrompt(), roles: [ { role: 'readWrite', db: 'shop' } ] })`,
    },
    {
      task: 'Write a function buildMongoUri({ user, password, host, db, appName }) that URL-encodes the password and returns a correct mongodb+srv connection string with retryWrites and majority write concern. Test it with the password "P@ss:word/1".',
      hint: 'encodeURIComponent; template string.',
      solution: `function buildMongoUri({ user, password, host, db, appName }) {
  const u = encodeURIComponent(user);
  const p = encodeURIComponent(password);
  return 'mongodb+srv://' + u + ':' + p + '@' + host + '/' + db +
    '?retryWrites=true&w=majority&appName=' + encodeURIComponent(appName);
}

console.log(buildMongoUri({ user: 'shopApi', password: 'P@ss:word/1', host: 'cluster0.abcde.mongodb.net', db: 'shop', appName: 'shop-api' }));
// mongodb+srv://shopApi:P%40ss%3Aword%2F1@cluster0.abcde.mongodb.net/shop?retryWrites=true&w=majority&appName=shop-api`,
    },
    {
      task: 'Performance Advisor shows slow queries on shop.products: find({ category: "Laptops" }).sort({ price: 1 }). In the Shell Lab, prove the query does a COLLSCAN, create the right index and prove it now uses IXSCAN.',
      hint: 'Index the equality field first, then the sort field.',
      solution: `db.products.find({ category: 'Laptops' }).sort({ price: 1 }).explain()   // COLLSCAN, 12 docs examined
db.products.createIndex({ category: 1, price: 1 })
db.products.find({ category: 'Laptops' }).sort({ price: 1 }).explain()   // IXSCAN category_1_price_1, 3 docs examined`,
    },
    {
      task: 'Create a cached Mongoose connection helper for a serverless function (e.g. Vercel / Next.js route handler) so that warm invocations reuse the existing connection.',
      hint: 'Store { conn, promise } on globalThis.',
      solution: `// lib/db.js
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is not set');

let cached = globalThis._mongoose || (globalThis._mongoose = { conn: null, promise: null });

async function dbConnect() {
  if (cached.conn) return cached.conn;                       // warm start: reuse
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      maxPoolSize: 5,                                        // small pool per function instance
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
module.exports = dbConnect;`,
    },
    {
      task: 'Write a production launch checklist for a MERN app on Atlas with at least 10 items covering security, connection, monitoring and backup.',
      hint: 'Think users, network, secrets, TLS, pool, indexes, alerts, backups, region, environments.',
      solution: `1. Dedicated cluster (M10+) in the same region as the API server
2. Separate dev / staging / prod projects with different credentials
3. App user with readWrite on the app database only; no atlasAdmin in apps
4. IP access list limited to server IPs (or private endpoint / peering); no permanent 0.0.0.0/0
5. MONGODB_URI only in platform environment variables; .env git-ignored; .env.example committed
6. Single connection per process, maxPoolSize set, serverSelectionTimeoutMS 5000, appName set
7. Graceful shutdown on SIGTERM; /health endpoint checks DB state
8. Indexes created for all frequent queries (verified with explain); autoIndex off in prod
9. Alerts: host down, replication lag, connections %, disk %, CPU, query targeting
10. Cloud Backup enabled with point-in-time restore; restore tested on staging
11. Performance Advisor and Query Profiler reviewed weekly
12. Password rotation process documented; leaked secrets rotated immediately`,
    },
  ],
  quiz: [
    {
      question: 'Which role should a typical Express API user get on the shop database?',
      options: ['atlasAdmin', 'readWriteAnyDatabase', 'readWrite on shop', 'dbAdmin on admin'],
      answer: 2,
      explanation: 'Least privilege: the API needs to read and write its own database only.',
    },
    {
      question: 'Your API deployed on a cloud platform cannot connect to Atlas, but works on your laptop. The most likely cause is…',
      options: [
        'MongoDB does not support cloud platforms',
        'The server\'s IP is not in the Atlas IP Access List',
        'Mongoose needs version 3',
        'You must use mongodb:// instead of mongodb+srv://',
      ],
      answer: 1,
      explanation: 'Atlas blocks unknown IPs. Your laptop IP was allowed; the server\'s outbound IP is not.',
    },
    {
      question: 'Where should the production MONGODB_URI be stored?',
      options: [
        'In the hosting platform\'s environment variables / secrets manager',
        'Hard-coded in server.js',
        'In package.json',
        'In a public GitHub README',
      ],
      answer: 0,
      explanation: 'Secrets belong in environment variables or a secrets manager, never in the source code repository.',
    },
    {
      question: 'Which feature gives typo-tolerant, relevance-ranked full-text search on Atlas?',
      options: [
        '$regex with the i option',
        'A unique index',
        '$lookup',
        'Atlas Search with the $search stage',
      ],
      answer: 3,
      explanation: 'Atlas Search (Lucene-based) supports fuzzy matching, scoring, autocomplete and facets.',
    },
    {
      question: 'Performance Advisor mainly helps you by…',
      options: [
        'Creating database users',
        'Suggesting indexes for slow queries and flagging unused indexes / anti-patterns',
        'Restoring backups',
        'Encrypting data at rest',
      ],
      answer: 1,
      explanation: 'It analyses slow query logs and recommends indexes (and schema improvements) with an estimated impact.',
    },
  ],
};
