export default {
  id: 'day-29-deployment-render-railway-atlas-ci',
  title: 'Deployment: Render / Railway, Environment Config, MongoDB Atlas, CI Basics',
  module: 'Module 5: Advanced Node',
  day: 29,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Take the API from localhost to a public HTTPS URL. You prepare the code for production (PORT, env vars, trust proxy, health checks, graceful shutdown), create a MongoDB Atlas cluster, deploy on Render or Railway (with or without Docker), connect a React front end, and add a GitHub Actions pipeline that tests every push before it deploys.',
  objectives: [
    'Make an Express 5 app production-ready: process.env.PORT, NODE_ENV, trust proxy, CORS for the real front-end URL, health checks',
    'Create a MongoDB Atlas cluster, database user and network access, and use the connection string safely',
    'Deploy to Render or Railway from GitHub and configure environment variables and build/start commands',
    'Write a Dockerfile and implement graceful shutdown on SIGTERM',
    'Set up CI with GitHub Actions (install, test, deploy hook) and know basic CD and rollback ideas',
  ],
  theory: [
    {
      heading: 'From localhost to production: what changes?',
      content:
        'On your laptop you run `node server.js`, the DB is local, secrets are in .env and you are the only user. In production:\n- The **platform chooses the port** and passes it as `process.env.PORT` - hard-coding 3000 makes the deploy fail health checks.\n- Traffic arrives through a **reverse proxy / load balancer** that terminates HTTPS. Set `app.set("trust proxy", 1)` so `req.ip`, `req.protocol` and rate limiting work correctly.\n- **Secrets** come from the platform\'s environment variables, not from a committed file.\n- `NODE_ENV=production` makes Express and many libraries faster and less verbose (no stack traces in error pages).\n- The DB is a managed cloud service (MongoDB Atlas, PlanetScale, Neon, RDS).\n- The process can be **stopped any time** (deploys, scaling, restarts) with SIGTERM - handle it gracefully.\n- Logs go to stdout and are collected by the platform; the file system may be **ephemeral** (uploads → S3/Cloudinary, Day 25).\n\nThe [Twelve-Factor App](https://12factor.net) principles summarise this: config in the environment, stateless processes, logs as event streams, dev/prod parity.',
      points: [
        'package.json: "start": "node server.js" and "engines": { "node": ">=22" }',
        'Never use nodemon / node --watch in production',
        'Lock dependency versions with package-lock.json and install with npm ci',
      ],
    },
    {
      heading: 'MongoDB Atlas setup',
      content:
        'Atlas is MongoDB\'s managed cloud database with a free M0 tier.\n1. Sign up at mongodb.com/atlas → **Create a cluster** (M0 free, choose a region close to your API server).\n2. **Database Access** → add a database user with a strong password (role: readWrite on your DB). This is not your Atlas login.\n3. **Network Access** → allow the IPs of your host. Free PaaS plans have changing IPs, so beginners often add `0.0.0.0/0` (anywhere) - acceptable only with a strong password; paid plans offer static outbound IPs or private networking.\n4. **Connect → Drivers** → copy the connection string: `mongodb+srv://shopuser:<password>@cluster0.abcde.mongodb.net/shop?retryWrites=true&w=majority`. Put your database name (`/shop`) before the `?`, URL-encode special characters in the password.\n5. Store it as `MONGODB_URI` in the platform\'s environment variables.\n\nConnect once at startup and only then start listening, so the health check does not report "ok" while the DB is unreachable.',
      syntax: `const mongoose = require('mongoose');
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
console.log('MongoDB connected:', mongoose.connection.host);`,
      tip: 'Create separate Atlas databases (or projects) for development, staging and production. Never point local development at the production database.',
    },
    {
      heading: 'Deploying on Render and Railway',
      content:
        '**Render** (render.com):\n1. Push your code to GitHub.\n2. New → **Web Service** → connect the repo.\n3. Runtime Node, Build command `npm ci`, Start command `npm start` (or `node server.js`).\n4. Add environment variables: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`.\n5. Set the **Health Check Path** to `/healthz`.\n6. Deploy → you get `https://shop-api.onrender.com` with HTTPS. Every push to the main branch redeploys automatically (can be switched to a deploy hook triggered by CI). Free instances sleep after inactivity, so the first request can take ~30-60 s.\n\n**Railway** (railway.app): New Project → Deploy from GitHub repo; it detects Node and runs `npm start`; add variables in the Variables tab; Settings → Networking → Generate Domain. Railway can also provision MongoDB/Postgres/Redis in the same project.\n\nBoth platforms can also build from a **Dockerfile** if one exists in the repo. Alternatives: Fly.io, AWS (Elastic Beanstalk, ECS, App Runner), a VPS with PM2 + Nginx, or serverless (Vercel/Netlify functions - not ideal for Socket.io).',
      syntax: `# render.yaml (Infrastructure as Code, optional "Blueprint")
services:
  - type: web
    name: shop-api
    runtime: node
    plan: free
    buildCommand: npm ci
    startCommand: npm start
    healthCheckPath: /healthz
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false        # set the secret value in the dashboard
      - key: JWT_SECRET
        generateValue: true`,
    },
    {
      heading: 'Health checks, graceful shutdown and Docker',
      content:
        '**Health checks**: a cheap endpoint such as `GET /healthz` returning 200 lets the platform know the instance is alive; a **readiness** check (`/readyz`) can also verify the DB connection. During a deploy the new version receives traffic only after it is healthy - this is how zero-downtime deploys work.\n\n**Graceful shutdown**: before stopping a container the platform sends **SIGTERM** and waits a few seconds. Handle it: stop accepting new connections (`server.close()`), let in-flight requests finish, close DB connections, then `process.exit(0)`. Without it, users get dropped connections during every deploy.\n\n**Docker** packages your app with its exact Node version and OS libraries so it runs the same everywhere. Key practices: small base image (`node:22-alpine`), copy package files first for layer caching, `npm ci --omit=dev`, run as the non-root `node` user, a `.dockerignore` (node_modules, .env, .git), and `CMD ["node", "server.js"]` (not `npm start`, so the SIGTERM reaches Node directly).',
      syntax: `# Dockerfile
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]`,
    },
    {
      heading: 'CI/CD with GitHub Actions',
      content:
        '**Continuous Integration (CI)**: every push and pull request automatically installs dependencies, runs lint and tests (Day 26). A red ❌ on the PR blocks merging broken code.\n\n**Continuous Delivery/Deployment (CD)**: when main is green, deploy automatically - e.g. call Render\'s **deploy hook URL** (stored as a GitHub secret) or let the platform auto-deploy on push.\n\nA workflow is a YAML file in `.github/workflows/`. It defines **triggers** (`on: push`), **jobs** that run on a fresh virtual machine (`runs-on: ubuntu-latest`) and **steps** (checkout, setup-node with npm cache, `npm ci`, `npm test`). Secrets go in Settings → Secrets and variables → Actions and are accessed as `${{ secrets.NAME }}`.\n\n**Rollback**: Render/Railway keep previous deploys - one click redeploys the last good version. Use `git revert` to undo the code change itself.',
      tip: 'Add a "services: mongo" container in the workflow (or mongodb-memory-server in tests) so integration tests run against a real database in CI.',
    },
  ],
  examples: [
    {
      title: 'Production-ready server.js with graceful shutdown (verified with SIGTERM)',
      scenario: 'Prepare the API for any platform: PORT from env, trust proxy, health check, and no dropped requests during deploys.',
      steps: [
        'Create server.js with the code below',
        'Run PORT=4000 NODE_ENV=production node server.js',
        'curl http://localhost:4000/healthz',
        'Start a slow request (curl /api/slow) and, while it runs, send SIGTERM: kill -TERM <pid>',
        'Observe that the slow request still completes before the process exits',
      ],
      code: `const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3000;          // platforms inject PORT
const NODE_ENV = process.env.NODE_ENV || 'development';
let shuttingDown = false;

app.set('trust proxy', 1);                               // behind Render/Railway proxy
app.use(express.json());

app.get('/healthz', (req, res) => {
  if (shuttingDown) return res.status(503).json({ status: 'shutting down' });
  res.json({ status: 'ok', env: NODE_ENV, uptime: Math.round(process.uptime()) });
});

app.get('/api/slow', async (req, res) => {
  await new Promise(r => setTimeout(r, 2000));           // simulates a long request
  res.json({ finished: true });
});

const server = app.listen(PORT, () => console.log(\`Server running on port \${PORT} (\${NODE_ENV})\`));

// Graceful shutdown: platforms send SIGTERM before stopping a container
function shutdown(signal) {
  console.log(\`\${signal} received: closing HTTP server\`);
  shuttingDown = true;
  server.close(async () => {                             // stop accepting, finish in-flight requests
    console.log('HTTP server closed');
    // await mongoose.connection.close();                // close DB connections here
    console.log('Clean exit');
    process.exit(0);
  });
  setTimeout(() => { console.error('Forced exit after 10 s'); process.exit(1); }, 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));`,
      result: `$ PORT=4000 NODE_ENV=production node server.js
Server running on port 4000 (production)
$ curl http://localhost:4000/healthz
{"status":"ok","env":"production","uptime":1}
$ curl http://localhost:4000/api/slow &   then   kill -TERM <pid>
SIGTERM received: closing HTTP server
HTTP server closed
Clean exit
slow request result: {"finished":true} [200]   ← completed although the server was stopping`,
      explanation:
        'server.close() stops accepting new connections but waits for in-flight ones, so the 2-second request still returned 200. The 10-second fallback timer (unref so it does not keep the process alive) prevents hanging forever on a stuck connection. Most platforms wait about 10-30 s after SIGTERM before force-killing.',
    },
    {
      title: 'API Lab: health, readiness, version and production error handling',
      scenario: 'Simulate how a platform probes your service: /healthz (process alive), /readyz (dependencies OK), and how production error responses hide internals.',
      steps: [
        'Paste the code into the API Lab (config is an object here because the simulator has no process.env)',
        'Call /healthz, /readyz and /api/version',
        'Simulate a lost DB connection and call /readyz again (503)',
        'Call a broken route and an unknown route to see the production error and 404 handlers',
      ],
      code: `// real code reads the config from the environment:
const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  VERSION: process.env.RENDER_GIT_COMMIT?.slice(0, 7) || 'local',
};`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// In real code: values come from process.env set in the Render/Railway dashboard
const config = { NODE_ENV: 'production', VERSION: '1.4.2', COMMIT: 'a1b2c3d' };
const db = { connected: true };          // stand-in for mongoose.connection.readyState === 1

app.get('/healthz', (req, res) => res.json({ status: 'ok' }));                 // liveness

app.get('/readyz', (req, res) => {                                           // readiness
  if (!db.connected) return res.status(503).json({ status: 'not ready', db: 'disconnected' });
  res.json({ status: 'ready', db: 'connected' });
});

app.get('/api/version', (req, res) => res.json({ version: config.VERSION, commit: config.COMMIT, env: config.NODE_ENV }));

app.post('/api/dev/simulate-db-down', (req, res) => { db.connected = false; res.json({ db: 'disconnected' }); });

app.get('/api/reports', () => {
  throw new Error('Cannot read properties of undefined (reading "total") at reports.js:42');
});

app.use((req, res) => res.status(404).json({ error: 'Route not found: ' + req.method + ' ' + req.path }));

app.use((err, req, res, next) => {
  const isProd = config.NODE_ENV === 'production';
  res.status(err.status || 500).json(isProd ? { error: 'Internal Server Error' } : { error: err.message });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/healthz' },
          { method: 'GET', url: '/readyz' },
          { method: 'GET', url: '/api/version' },
          { method: 'GET', url: '/api/reports' },
          { method: 'GET', url: '/api/unknown' },
          { method: 'POST', url: '/api/dev/simulate-db-down' },
          { method: 'GET', url: '/readyz' },
          { method: 'GET', url: '/healthz' },
        ],
      },
      result: "GET /healthz → 200 {\"status\":\"ok\"}\nGET /readyz → 200 {\"status\":\"ready\",\"db\":\"connected\"}\nGET /api/version → 200 {\"version\":\"1.4.2\",\"commit\":\"a1b2c3d\",\"env\":\"production\"}\nGET /api/reports → 500 {\"error\":\"Internal Server Error\"}\nGET /api/unknown → 404 {\"error\":\"Route not found: GET /api/unknown\"}\nPOST /api/dev/simulate-db-down → 200 {\"db\":\"disconnected\"}\nGET /readyz → 503 {\"status\":\"not ready\",\"db\":\"disconnected\"}\nGET /healthz → 200 {\"status\":\"ok\"}",
      explanation:
        'Liveness (/healthz) stays 200 while the process runs; readiness (/readyz) turns 503 when the DB is down, so a load balancer stops sending traffic to this instance without killing it. The thrown error is caught by Express 5 and the production handler hides the internal message (file name, line). /api/version helps confirm which commit is actually deployed.',
    },
    {
      title: 'Connect to MongoDB Atlas before listening',
      scenario: 'Start the server only after the database connection works, and expose DB state in the readiness check.',
      steps: [
        'Create the Atlas cluster, DB user and network rule; copy the mongodb+srv connection string',
        'Locally put it in .env as MONGODB_URI; on Render/Railway add it as an environment variable',
        'Create src/db.js and an async start() in server.js',
        'Deploy and check the logs for "MongoDB connected"',
      ],
      code: `// src/db.js
const mongoose = require('mongoose');

async function connectDB(uri) {
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB connected:', mongoose.connection.host);
}
module.exports = { connectDB, mongoose };

// server.js
const app = require('./src/app');
const { connectDB, mongoose } = require('./src/db');

app.get('/readyz', (req, res) => {
  const ok = mongoose.connection.readyState === 1;     // 1 = connected
  res.status(ok ? 200 : 503).json({ db: ok ? 'connected' : 'disconnected' });
});

async function start() {
  try {
    await connectDB(process.env.MONGODB_URI);
    const server = app.listen(process.env.PORT || 3000, () =>
      console.log('Server running on port ' + (process.env.PORT || 3000)));
    process.on('SIGTERM', () => server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    }));
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);            // platform shows the failed deploy and keeps the old version
  }
}
start();

// .env (local only, git-ignored)
// MONGODB_URI=mongodb+srv://shopuser:S3cure%40Pass@cluster0.abcde.mongodb.net/shop?retryWrites=true&w=majority`,
      result: `Render logs after deploy:
==> Running 'npm start'
MongoDB connected: ac-xyz12-shard-00-01.abcde.mongodb.net
Server running on port 10000
==> Your service is live 🎉

Typical failure: "Startup failed: Could not connect to any servers in your MongoDB Atlas cluster... make sure your current IP address is on your Atlas cluster's IP whitelist" → add the host's IPs (or 0.0.0.0/0) in Atlas Network Access.`,
      explanation:
        'Connecting before listen means the instance never reports healthy without a database, so the platform keeps the previous version running if the new one cannot connect. The "@" in the password is URL-encoded as %40. Render assigns its own PORT (10000 by default), which is why process.env.PORT is required.',
    },
    {
      title: 'GitHub Actions CI + deploy hook',
      scenario: 'Run tests on every push/PR; when main is green, trigger the Render deploy.',
      steps: [
        'Create .github/workflows/ci.yml in the repo',
        'In Render: Settings → Deploy Hook → copy the URL; turn off auto-deploy',
        'In GitHub: Settings → Secrets and variables → Actions → New secret RENDER_DEPLOY_HOOK',
        'Push a commit and watch the Actions tab',
      ],
      code: `# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      NODE_ENV: test
      JWT_SECRET: ci-test-secret-at-least-32-characters-long
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm test -- --coverage

  deploy:
    needs: test                          # only if tests passed
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render deploy
        run: curl -fsS -X POST "\${{ secrets.RENDER_DEPLOY_HOOK }}"`,
      result:
        'Actions tab: "CI" workflow → job test ✓ (checkout, setup-node, npm ci, npm test: Tests: 17 passed) → job deploy ✓ (Render starts a new deploy). On a pull request only the test job runs, and a failing test shows a red ❌ on the PR so it cannot be merged by mistake.',
      explanation:
        'needs: test makes deploy wait for the test job and skip if it fails. The if condition restricts deploys to pushes on main (not PRs). The secret keeps the deploy hook URL private - anyone with it could trigger deploys. \${{ }} is GitHub expression syntax, evaluated by Actions, not by the shell.',
    },
    {
      title: 'Dockerfile and docker-compose for local parity',
      scenario: 'Run the API and MongoDB locally with the same container image you deploy.',
      steps: [
        'Create Dockerfile and .dockerignore',
        'Create docker-compose.yml with api and mongo services',
        'docker compose up --build',
        'Open http://localhost:3000/healthz; deploy the same Dockerfile on Render/Railway',
      ],
      code: `# Dockerfile
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]

# .dockerignore
node_modules
.env
.git
coverage
uploads

# docker-compose.yml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      MONGODB_URI: mongodb://mongo:27017/shop
      JWT_SECRET: local-docker-secret-at-least-32-chars
      CLIENT_URL: http://localhost:5173
    depends_on:
      - mongo
  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data:`,
      result:
        '$ docker compose up --build → "MongoDB connected: mongo" and "Server running on port 3000". curl http://localhost:3000/healthz → {"status":"ok",...}. Ctrl+C sends SIGTERM to the containers and the graceful-shutdown logs appear.',
      explanation:
        'Copying package*.json before the source lets Docker cache the npm ci layer, so rebuilding after a code change is fast. Inside compose the DB host is the service name "mongo". CMD with the exec form runs node as PID 1 so it receives SIGTERM directly. The named volume keeps data between restarts.',
    },
  ],
  interview: [
    { q: 'Why must a deployed Node app use process.env.PORT?', a: 'PaaS platforms (Render, Railway, Heroku) assign the port the internal router forwards to and pass it via the PORT environment variable. Hard-coding a port means the platform cannot reach the app and health checks fail.', level: 'Easy' },
    { q: 'What does app.set("trust proxy", 1) do and why is it needed in production?', a: 'It tells Express it sits behind one reverse proxy, so req.ip, req.protocol and req.secure are derived from X-Forwarded-For / X-Forwarded-Proto. Without it, all clients appear to have the proxy\'s IP (rate limiting breaks) and secure cookies or HTTPS redirects misbehave.', level: 'Medium' },
    { q: 'What is graceful shutdown and how do you implement it in Node?', a: 'Handling SIGTERM/SIGINT by stopping new connections (server.close), letting in-flight requests finish, closing DB/Redis connections and exiting with 0, with a timeout fallback. It prevents dropped requests and corrupted operations during deploys and scaling.', level: 'Medium' },
    { q: 'Liveness vs readiness checks?', a: 'Liveness answers "is the process alive?" - failing it makes the platform restart the instance. Readiness answers "can it serve traffic now?" (DB connected, warmed up) - failing it removes the instance from the load balancer without restarting. Kubernetes has both probes; PaaS usually one health check path.', level: 'Medium' },
    { q: 'How do you manage environment-specific configuration?', a: 'Read config from environment variables (12-factor), validate at startup, use .env only locally (git-ignored), set values per environment in the platform dashboard or secrets manager, and keep separate databases/keys for development, staging and production.', level: 'Easy' },
    { q: 'What do you need to configure in MongoDB Atlas to connect from a deployed app?', a: 'A cluster, a database user with password and appropriate role, Network Access entries for the app\'s outbound IPs (or 0.0.0.0/0 with strong credentials on free plans), and the mongodb+srv connection string with database name and URL-encoded password stored in an env var.', level: 'Easy' },
    { q: 'What is CI/CD?', a: 'Continuous Integration automatically builds and tests every change (push/PR) to catch problems early. Continuous Delivery keeps main always deployable and deploys with one click; Continuous Deployment deploys automatically after green CI. Tools: GitHub Actions, GitLab CI, Jenkins, CircleCI.', level: 'Easy' },
    { q: 'npm install vs npm ci in a pipeline?', a: 'npm ci installs exactly what package-lock.json specifies, fails if package.json and the lock file disagree, deletes node_modules first, and is faster and reproducible - ideal for CI and Docker. npm install may update the lock file.', level: 'Medium' },
    { q: 'Why should a Dockerfile copy package.json before the rest of the source?', a: 'Docker caches each layer. Copying only package files and running npm ci first means that layer is reused when only source code changes, making rebuilds much faster.', level: 'Medium' },
    { q: 'Your deploy succeeded but the API returns 502/503. What do you check?', a: 'Platform logs (crash on startup?), whether the app listens on process.env.PORT and 0.0.0.0, health check path correctness, missing env vars (JWT_SECRET, MONGODB_URI), Atlas network access, build vs start commands, Node version (engines), and memory limits.', level: 'Hard' },
    { q: 'How do you roll back a bad deployment?', a: 'Redeploy the previous successful release from the platform (Render/Railway keep deploy history), or revert the commit (git revert) and let CI/CD deploy it. Database migrations should be backward compatible so rolling back code is safe.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a startup config check that exits with a clear message if any of PORT, MONGODB_URI, JWT_SECRET or CLIENT_URL is missing in production.',
      hint: 'Filter the list of required names where process.env[name] is falsy.',
      solution: `const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
if (process.env.NODE_ENV === 'production') required.push('PORT');

const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error('Missing environment variables: ' + missing.join(', '));
  process.exit(1);
}`,
    },
    {
      task: 'Configure CORS so the deployed React app (https://shop-web.onrender.com) and local Vite (http://localhost:5173) can call the API, reading the list from CLIENT_URL (comma separated).',
      hint: 'cors({ origin: list, credentials: true }).',
      solution: `const cors = require('cors');
const origins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: origins, credentials: true }));
// Render env var: CLIENT_URL=https://shop-web.onrender.com,http://localhost:5173
// React (Vite) env: VITE_API_URL=https://shop-api.onrender.com`,
    },
    {
      task: 'Extend the GitHub Actions workflow with a MongoDB service container so integration tests can use mongodb://localhost:27017/test.',
      hint: 'jobs.test.services.mongo with image and ports.',
      solution: `jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongo:
        image: mongo:7
        ports:
          - 27017:27017
    env:
      NODE_ENV: test
      MONGODB_URI: mongodb://localhost:27017/test
      JWT_SECRET: ci-test-secret-at-least-32-characters-long
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test`,
    },
    {
      task: 'Write the deployment checklist you will follow for the final project (at least 10 items).',
      hint: 'Think code, config, database, security, monitoring.',
      solution: `1. npm test passes locally and in CI
2. "start" script and "engines.node" set in package.json
3. App listens on process.env.PORT; trust proxy enabled
4. All secrets in platform env vars; .env git-ignored; config validated at startup
5. MongoDB Atlas: separate prod DB, strong user password, network access configured, backups on
6. CORS allows only the real front-end origins
7. helmet, rate limiting, body size limits, validation enabled (Day 24)
8. NODE_ENV=production; error handler hides stack traces
9. Health check path configured (/healthz) and graceful shutdown implemented
10. Uploads go to S3/Cloudinary, not local disk
11. Logs structured (pino) and monitored; uptime check (e.g. UptimeRobot) on /healthz
12. Rollback plan: previous deploy known, migrations backward compatible`,
    },
  ],
  quiz: [
    { question: 'Which signal do platforms like Render, Docker and Kubernetes send to stop your app gracefully?', options: ['SIGKILL', 'SIGTERM', 'SIGHUP', 'SIGSTOP'], answer: 1, explanation: 'SIGTERM can be handled for graceful shutdown; SIGKILL cannot be caught.' },
    { question: 'Your Render deploy fails health checks; logs show "Server running on port 3000". Most likely fix?', options: ['Use process.env.PORT', 'Install nodemon', 'Remove helmet', 'Use port 80'], answer: 0, explanation: 'Render routes traffic to the PORT it provides (10000 by default).' },
    { question: 'Which command should CI and Dockerfiles use to install dependencies reproducibly?', options: ['npm install', 'npm update', 'npm ci', 'npx install'], answer: 2, explanation: 'npm ci installs exactly what package-lock.json lists.' },
    { question: 'Where should MONGODB_URI for production be stored?', options: ['In server.js', 'In a committed .env file', 'In the React app', 'In the hosting platform\'s environment variables / secrets'], answer: 3, explanation: 'Secrets live in the platform configuration, never in the repository.' },
    { question: 'In a GitHub Actions workflow, what does "needs: test" on the deploy job do?', options: ['Runs deploy before test', 'Runs deploy only after the test job succeeds', 'Installs the test package', 'Skips tests'], answer: 1, explanation: 'Jobs with needs wait for (and require success of) the listed jobs.' },
  ],
};
