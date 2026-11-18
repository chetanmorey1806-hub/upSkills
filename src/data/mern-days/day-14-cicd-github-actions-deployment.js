export default {
  id: 'day-14-cicd-github-actions-deployment',
  title: 'CI/CD with GitHub Actions and Deployment: Vercel/Netlify, Render/Railway, MongoDB Atlas, Custom Domain, Env Variables, Logging and Monitoring',
  module: 'Module 4: Production',
  day: 14,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Ship a MERN app like a professional team: GitHub Actions runs lint, tests and builds on every pull request, the React client deploys to Vercel/Netlify, the Express API to Render/Railway, the data lives in MongoDB Atlas, and structured logs, health checks and error tracking tell you when something breaks.',
  objectives: [
    'Explain CI vs CD and design a pipeline for a MERN monorepo',
    'Write a GitHub Actions workflow with a Node 22 matrix, caching, MongoDB service/in-memory tests and Playwright',
    'Deploy the client to Vercel/Netlify and the API to Render/Railway with correct environment variables, CORS and cookies',
    'Set up MongoDB Atlas securely (users, network access, connection string) and connect a custom domain with HTTPS',
    'Add production logging (pino), request ids, health checks, uptime monitoring and error tracking (Sentry)',
  ],
  theory: [
    {
      heading: 'CI and CD in simple words',
      content:
        '**Continuous Integration (CI)**: every push or pull request automatically runs checks: install, lint, type-check, tests, build. If anything fails, the PR shows a red cross and cannot be merged (branch protection). Bugs are caught minutes after they are written, not weeks later.\n\n**Continuous Delivery/Deployment (CD)**: after CI passes on the main branch, the app is automatically deployed to staging or production. No one copies files to a server by hand at midnight.\n\nAnalogy: a factory quality-check line. Every product (commit) passes through the same machines (lint, test, build). Only products that pass every check are packed and shipped (deployed).\n\nA typical MERN flow:\n\n1. Developer creates a feature branch, pushes, opens a PR.\n2. **GitHub Actions CI** runs on the PR. Vercel creates a **preview deployment** of the client with its own URL.\n3. Reviewer approves; PR is merged into `main`.\n4. CI runs again on `main`; then **CD** deploys: Vercel builds the client, Render deploys the API (auto-deploy or deploy hook).\n5. Health checks confirm the new version; monitoring alerts if errors spike; you can **roll back** to the previous deploy in one click.',
      points: [
        'Workflow files live in .github/workflows/*.yml',
        'Events (on): push, pull_request, workflow_dispatch (manual), schedule (cron)',
        'Jobs run on runners (ubuntu-latest); steps run commands or reusable actions (uses:)',
        'Secrets (Settings → Secrets and variables → Actions) are injected as ${{ secrets.NAME }} and masked in logs',
      ],
    },
    {
      heading: 'Anatomy of a GitHub Actions workflow for MERN',
      content:
        'Key building blocks:\n\n- `on`: when to run (e.g. `pull_request` and `push` to `main`).\n- `jobs`: run in parallel by default; `needs:` makes one wait for another (deploy needs test).\n- `actions/checkout@v4` gets the code; `actions/setup-node@v4` installs Node 22 and with `cache: npm` caches `~/.npm` keyed by `package-lock.json`.\n- `npm ci` (not `npm install`) installs exactly what the lock file says, which is reproducible and fails if package.json and the lock file disagree.\n- **Services**: a job can start containers like `mongo:8` and `redis:7` next to the runner, or you use mongodb-memory-server in tests.\n- **Matrix**: test on several Node versions (`[20, 22]`) or shards.\n- **Artifacts**: upload the Playwright HTML report or coverage so you can download it from the run page.\n- **Concurrency**: cancel older runs of the same branch to save minutes.\n\nIn a monorepo with npm workspaces you run scripts per workspace: `npm run test -w server`, `npm run build -w client`. You can also use `paths:` filters so client-only changes do not run the server pipeline.',
      tip: 'Never print secrets with echo in workflows. GitHub masks known secrets, but a transformed value (base64, substring) is not masked. Pull requests from forks do not receive secrets for this reason.',
    },
    {
      heading: 'Deploying the React client: Vercel or Netlify',
      content:
        'Vercel and Netlify are built for static/SPA frontends: connect the GitHub repo, choose the `client` folder as **Root Directory**, build command `npm run build`, output directory `dist`. Every PR gets a **preview URL**; merging to main updates production. Both provide a global CDN, HTTPS and brotli automatically.\n\nThings MERN students often miss:\n\n1. **SPA rewrites**: refreshing `/orders/42` returns 404 unless all routes rewrite to `index.html` (`vercel.json` rewrites or Netlify `_redirects`: `/* /index.html 200`).\n2. **VITE_ env vars** are set in the dashboard for each environment (Production/Preview) and are baked in at build time; redeploy after changing them.\n3. **Calling the API**: either point `VITE_API_URL` to `https://api.myshop.in`, or (better for cookies) add a **rewrite/proxy** so `/api/*` on the frontend domain forwards to the Render API. Then the browser sees one origin: no CORS and first-party cookies.\n\nNetlify vs Vercel: both are excellent; Vercel is the home of Next.js, Netlify has built-in forms and simple redirects. For a Vite SPA either works on the free tier.',
      syntax:
        '// client/vercel.json\n{\n  "rewrites": [\n    { "source": "/api/:path*", "destination": "https://shop-api.onrender.com/api/:path*" },\n    { "source": "/((?!api/).*)", "destination": "/index.html" }\n  ]\n}\n\n# client/public/_redirects (Netlify)\n/api/*  https://shop-api.onrender.com/api/:splat  200\n/*      /index.html                               200',
    },
    {
      heading: 'Deploying the Express API: Render or Railway, and the database on MongoDB Atlas',
      content:
        '**Render** (Web Service) and **Railway** run Node apps (or your Dockerfile) with HTTPS, logs, env variables and auto-deploy from GitHub.\n\nRender setup: New → Web Service → repo → Root Directory `server` → Build `npm ci` → Start `node src/server.js` → add env vars → **Health Check Path** `/api/ready`. Note: free instances sleep after ~15 minutes of inactivity and take time to wake up; paid instances stay on. Render provides `PORT`; your app must listen on `process.env.PORT`.\n\n**MongoDB Atlas** checklist:\n\n1. Create a cluster (free M0 is fine for learning; choose the Mumbai region `ap-south-1` for Indian users if available).\n2. **Database Access**: create a user with a strong password and least privileges (readWrite on your db only).\n3. **Network Access**: add your host\'s outbound IPs; `0.0.0.0/0` works for hosts without static IPs but rely then on strong credentials (paid hosts often offer static outbound IPs or private networking).\n4. Copy the `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/shop?retryWrites=true&w=majority` string into the host\'s `MONGO_URI` env var. URL-encode special characters in the password.\n5. Enable backups (paid tiers) and alerts.\n\n**Production env vars for the server**: `NODE_ENV=production`, `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` (for CORS), `REDIS_URL`, `CLOUDINARY_URL`, `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `SENTRY_DSN`. Validate them at startup (e.g. with Zod) and crash early with a clear message if one is missing.',
      tip: 'Behind Render/Railway/Vercel your app sits behind a proxy. Set app.set("trust proxy", 1) so req.ip, req.secure and secure cookies work correctly, and so express-rate-limit sees the real client IP.',
    },
    {
      heading: 'Custom domain, HTTPS, CORS and cookies across domains',
      content:
        'Buy a domain (e.g. `myshop.in` from GoDaddy/Hostinger/Namecheap/Cloudflare) and add DNS records:\n\n- `myshop.in` / `www` → Vercel (A record or CNAME `cname.vercel-dns.com` as the dashboard says).\n- `api.myshop.in` → Render (CNAME to `shop-api.onrender.com`).\n\nBoth platforms issue free **Let\'s Encrypt HTTPS certificates** automatically after DNS propagates.\n\nWhy this matters for auth cookies: `myshop.in` and `api.myshop.in` are the **same site** (same registrable domain), so cookies with `SameSite=Lax` work. But `myshop.vercel.app` and `shop-api.onrender.com` are **different sites**; the refresh-token cookie then needs `SameSite=None; Secure`, and some browsers increasingly block such third-party cookies. Solutions: custom domains on the same parent domain, or a rewrite/proxy so the browser only talks to one origin.\n\n**CORS** in production: allow only your real origins (`https://myshop.in`, `https://www.myshop.in` and maybe preview URLs matching a pattern), with `credentials: true`. Never use `origin: \'*\'` with credentials (browsers reject it anyway).',
    },
    {
      heading: 'Logging, monitoring and alerts',
      content:
        'After deployment you are blind unless you add **observability**:\n\n- **Structured logs**: use **pino** (fast JSON logger) with `pino-http`. Each line is JSON with level, time, request id, method, url, status, response time. Platforms (Render, Railway) show these logs and can forward them to Better Stack, Datadog, Grafana Loki or Axiom.\n- **Request id**: generate or accept an `X-Request-Id` header, add it to every log line and return it in error responses so a user complaint ("error id 7f3a…") can be found in logs within seconds.\n- **Do not log secrets**: redact `authorization`, `cookie`, `password` fields (pino `redact` option).\n- **Error tracking**: **Sentry** for both React (`@sentry/react`) and Node (`@sentry/node`) groups exceptions, shows stack traces with source maps, user, browser and release version, and alerts you.\n- **Uptime monitoring**: UptimeRobot / Better Stack ping `/api/health` every minute and send alerts on email/Slack/WhatsApp.\n- **Metrics**: response time percentiles (p95), error rate, MongoDB Atlas metrics (connections, slow queries), Redis memory.\n\nAnalogy: logs are the CCTV recordings, monitoring is the security guard watching screens, and alerts are the alarm bell.',
      syntax:
        "import pino from 'pino';\nimport pinoHttp from 'pino-http';\nimport { randomUUID } from 'node:crypto';\n\nexport const logger = pino({\n  level: process.env.LOG_LEVEL || 'info',\n  redact: ['req.headers.authorization', 'req.headers.cookie', 'body.password'],\n});\napp.use(pinoHttp({\n  logger,\n  genReqId: (req, res) => {\n    const id = req.headers['x-request-id'] || randomUUID();\n    res.setHeader('X-Request-Id', id);\n    return id;\n  },\n}));",
    },
  ],
  examples: [
    {
      title: 'Production CORS allow-list for custom domain + Vercel previews',
      scenario:
        'The API must accept requests (with cookies) from https://myshop.in, https://www.myshop.in and preview deployments like https://myshop-git-feature-x-team.vercel.app, but reject every other origin.',
      steps: [
        'Write an allowed list: exact origins plus one regular expression for preview URLs',
        'Write a small CORS middleware (the cors package does the same with an origin function)',
        'For allowed origins set Access-Control-Allow-Origin to that exact origin and Allow-Credentials to true',
        'Answer OPTIONS preflight requests with 204',
        'Send requests with different Origin headers and compare the results',
      ],
      code: `// Real code with the cors package
import cors from 'cors';
const allowed = (process.env.CLIENT_URLS || '').split(',');      // "https://myshop.in,https://www.myshop.in"
const preview = /^https:\\/\\/myshop-[a-z0-9-]+-team\\.vercel\\.app$/;

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);                          // curl, server-to-server, health checks
    if (allowed.includes(origin) || preview.test(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));`,
      api: {
        code: `const express = require('express');
const app = express();

const allowed = ['https://myshop.in', 'https://www.myshop.in'];
const preview = /^https:\\/\\/myshop-[a-z0-9-]+-team\\.vercel\\.app$/;

function corsAllowList(req, res, next) {
  const origin = req.headers.origin;
  if (!origin) return next();                                  // not a browser cross-origin call
  if (!allowed.includes(origin) && !preview.test(origin)) {
    return res.status(403).json({ error: 'Origin not allowed', origin });
  }
  res.set('Access-Control-Allow-Origin', origin);              // exact origin, never * with cookies
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Vary', 'Origin');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.sendStatus(204);
  }
  next();
}

app.use(corsAllowList);
app.get('/api/products', (req, res) => res.json([{ id: 1, name: 'Kurta' }]));

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/products', headers: { Origin: 'https://myshop.in' } },
          { method: 'GET', url: '/api/products', headers: { Origin: 'https://myshop-git-cart-fix-team.vercel.app' } },
          { method: 'GET', url: '/api/products', headers: { Origin: 'https://evil-site.com' } },
          { method: 'OPTIONS', url: '/api/products', headers: { Origin: 'https://www.myshop.in' } },
          { method: 'GET', url: '/api/products' },
        ],
      },
      result: "GET /api/products → 200 [{\"id\":1,\"name\":\"Kurta\"}]\nGET /api/products → 200 [{\"id\":1,\"name\":\"Kurta\"}]\nGET /api/products → 403 {\"error\":\"Origin not allowed\",\"origin\":\"https://evil-site.com\"}\nOPTIONS /api/products → 204\nGET /api/products → 200 [{\"id\":1,\"name\":\"Kurta\"}]",
      explanation:
        'The production origin and the preview URL pass (200). evil-site.com gets 403 (with the cors package the browser would simply block the response). The OPTIONS preflight returns 204 with the allowed methods/headers. A request without Origin (curl, Render health check, server-to-server) is allowed because CORS is a browser protection, not authentication. Vary: Origin tells CDNs not to reuse a response for a different origin. Remember: CORS never replaces auth checks on the server.',
    },
    {
      title: 'Request ids and safe error responses for production debugging',
      scenario:
        'A user reports "checkout failed". With request ids, the error response shows an id the user can share, and the same id is in the server log with the full stack trace, while the client never sees internal details.',
      steps: [
        'Middleware: take X-Request-Id from the incoming request (set by Render/Nginx) or create one',
        'Return it as a response header and attach it to req',
        'Log one JSON line per request (pino does this in real code)',
        'Error handler: log the real error with the id; send a generic message + id to the client',
        'Send a normal request and a failing one, each with an X-Request-Id header',
      ],
      code: `// Real code: pino-http gives req.id and req.log
app.use(pinoHttp({ logger, genReqId }));

app.use((err, req, res, next) => {
  req.log.error({ err }, 'unhandled error');
  if (process.env.SENTRY_DSN) Sentry.captureException(err);
  const status = err.status || 500;
  res.status(status).json({
    error: status < 500 ? err.message : 'Something went wrong',
    requestId: req.id,
  });
});`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

let counter = 0;
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || 'req-' + (++counter);
  res.set('X-Request-Id', req.id);
  console.log(JSON.stringify({ level: 'info', reqId: req.id, method: req.method, url: req.originalUrl }));
  next();
});

app.post('/api/checkout', (req, res) => {
  const { cartId } = req.body || {};
  if (!cartId) {
    const err = new Error('cartId is required');
    err.status = 400;
    throw err;                                      // Express 5 forwards it to the error handler
  }
  if (cartId === 'c-broken') {
    throw new Error('MongoServerError: E11000 duplicate key on orders.orderNo');   // internal detail
  }
  res.status(201).json({ orderId: 'ord_' + cartId, requestId: req.id });
});

app.use((err, req, res, next) => {
  console.error(JSON.stringify({ level: 'error', reqId: req.id, msg: err.message }));
  const status = err.status || 500;
  res.status(status).json({
    error: status < 500 ? err.message : 'Something went wrong. Please share this id with support.',
    requestId: req.id,
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/checkout', headers: { 'X-Request-Id': 'rnd-101' }, body: { cartId: 'c-42' } },
          { method: 'POST', url: '/api/checkout', headers: { 'X-Request-Id': 'rnd-102' }, body: {} },
          { method: 'POST', url: '/api/checkout', headers: { 'X-Request-Id': 'rnd-103' }, body: { cartId: 'c-broken' } },
        ],
      },
      result: "POST /api/checkout → 201 {\"orderId\":\"ord_c-42\",\"requestId\":\"rnd-101\"}\nPOST /api/checkout → 400 {\"error\":\"cartId is required\",\"requestId\":\"rnd-102\"}\nPOST /api/checkout → 500 {\"error\":\"Something went wrong. Please share this id with support.\",\"requestId\":\"rnd-103\"}",
      explanation:
        'Validation errors (4xx) are safe to show, so the message is returned. The 500 error hides the MongoDB message (which would leak schema details) and returns only the request id; the console shows {"level":"error","reqId":"rnd-103","msg":"MongoServerError: E11000 ..."} so support can search logs for rnd-103. Express 5 catches errors thrown in handlers (and rejected promises in async handlers) and forwards them to the 4-argument error middleware.',
    },
    {
      title: 'GitHub Actions CI for a MERN monorepo',
      scenario: 'Every pull request must pass lint, server tests, client tests, build and Playwright E2E before it can be merged.',
      steps: [
        'Create .github/workflows/ci.yml in the repo root',
        'Use actions/setup-node@v4 with node 22 and npm cache',
        'Run server and client jobs in parallel; E2E needs both',
        'Upload the Playwright report as an artifact on failure',
        'In GitHub Settings → Branches, add a rule for main: require the CI checks to pass',
      ],
      code: `# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint -w server
      - run: npm test -w server          # Jest + Supertest + mongodb-memory-server
        env:
          JWT_ACCESS_SECRET: test-secret
          JWT_REFRESH_SECRET: test-secret-2

  client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint -w client
      - run: npx vitest run -w client    # or: npm run test -w client -- --run
      - run: npm run build -w client

  e2e:
    needs: [server, client]
    runs-on: ubuntu-latest
    services:
      mongo:
        image: mongo:8
        ports: ["27017:27017"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
        env:
          CI: true
          MONGO_URI: mongodb://localhost:27017/shop_e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7`,
      result:
        'On a PR the Checks tab shows "CI / server ✓ (1m 12s)", "CI / client ✓ (48s)", "CI / e2e ✓ (2m 30s)". If a test fails, the PR shows a red ✗, merging is blocked by branch protection, and the playwright-report artifact can be downloaded from the run page.',
      explanation:
        'server and client jobs run in parallel to save time; e2e waits for both with needs. cache: npm restores ~/.npm keyed by package-lock.json, so npm ci is fast. The mongo service container runs next to the job and is reachable on localhost:27017 because the port is mapped. concurrency cancels old runs when you push again to the same branch. Inside this lesson file ${{ }} is escaped; in your real YAML it is written normally.',
    },
    {
      title: 'Continuous deployment: Render deploy hook + Vercel after CI passes',
      scenario: 'Deploy only after CI is green on main: trigger the Render API deploy with a secret deploy hook and let Vercel deploy the client, then smoke-test production.',
      steps: [
        'In Render, disable Auto-Deploy and copy the service Deploy Hook URL',
        'Add it as GitHub secret RENDER_DEPLOY_HOOK; add VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID',
        'Create .github/workflows/deploy.yml triggered by a successful CI run on main',
        'Deploy API, wait, then smoke-test /api/ready',
        'Deploy the client with the Vercel CLI (or keep Vercel Git integration)',
      ],
      code: `# .github/workflows/deploy.yml
name: Deploy
on:
  workflow_run:
    workflows: [CI]
    types: [completed]
    branches: [main]

jobs:
  deploy:
    if: \${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    environment: production          # can require manual approval in GitHub settings
    steps:
      - uses: actions/checkout@v4
        with: { ref: \${{ github.event.workflow_run.head_sha }} }

      - name: Deploy API to Render
        run: curl -fsS -X POST "\${{ secrets.RENDER_DEPLOY_HOOK }}"

      - name: Wait for API to be ready
        run: |
          for i in $(seq 1 30); do
            if curl -fsS https://api.myshop.in/api/ready; then exit 0; fi
            sleep 10
          done
          echo "API did not become ready" && exit 1

      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - name: Deploy client to Vercel
        working-directory: client
        run: |
          npx vercel pull --yes --environment=production --token=\${{ secrets.VERCEL_TOKEN }}
          npx vercel build --prod --token=\${{ secrets.VERCEL_TOKEN }}
          npx vercel deploy --prebuilt --prod --token=\${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID }}

      - name: Smoke test
        run: curl -fsS https://myshop.in | grep -q '<div id="root">'`,
      result:
        'After merging to main: CI runs (green) → Deploy workflow starts → Render log shows "Deploy triggered via hook" → the wait step prints {"ready":true,"db":"connected"} → Vercel prints "Production: https://myshop.in" → smoke test passes. If CI fails, Deploy never starts.',
      explanation:
        'workflow_run chains deployment after CI, so a broken commit is never deployed. The deploy hook URL is a secret because anyone with it can trigger deploys. The environment: production setting lets you add required reviewers (manual approval) and environment-specific secrets. The API is deployed and verified before the client, because a new client may call new API endpoints. Rollback: use Render "Rollback" and Vercel "Promote previous deployment" (instant).',
    },
    {
      title: 'Validate environment variables at startup + Sentry on both sides',
      scenario: 'A missing JWT secret in production should stop the deploy immediately with a clear message, and runtime errors in React and Express should reach Sentry with the release version.',
      steps: [
        'npm i zod @sentry/node (server) and npm i @sentry/react (client)',
        'Create server/src/config/env.js that parses process.env with Zod',
        'Import env everywhere instead of reading process.env directly',
        'Initialise Sentry in server/src/instrument.js (imported first) and in client/src/main.jsx',
        'Upload source maps in CI so stack traces show real file names',
      ],
      code: `// server/src/config/env.js
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().startsWith('mongodb'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32),
  CLIENT_URLS: z.string().transform((s) => s.split(',').map((x) => x.trim())),
  REDIS_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);                 // deploy fails fast; health check never passes
}
export const env = parsed.data;

// server/src/instrument.js  (node --import ./src/instrument.js src/server.js)
import * as Sentry from '@sentry/node';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.RENDER_GIT_COMMIT,   // Render provides the commit sha
  tracesSampleRate: 0.1,
});

// server/src/app.js  (after all routes)
import * as Sentry from '@sentry/node';
Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

// client/src/main.jsx
import * as Sentry from '@sentry/react';
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,       // DSN is public by design
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
createRoot(document.getElementById('root'), {
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
}).render(<App />);`,
      result:
        'Deploying without JWT_ACCESS_SECRET prints: Invalid environment variables: { JWT_ACCESS_SECRET: [ "Required" ] } and the Render deploy fails instead of running a broken API. When a component throws in production, Sentry shows the error with browser, URL, user and the exact source line (with uploaded source maps), and emails the team.',
      explanation:
        'Failing fast turns a confusing runtime 500 ("secretOrPrivateKey must have a value") into an obvious deploy error. z.coerce.number() converts the PORT string to a number. Sentry must be initialised before other imports on the server (hence a separate instrument.js loaded with --import) so it can instrument http, Express and Mongoose. React 19 createRoot error hooks forward caught and uncaught render errors to Sentry.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between Continuous Integration, Continuous Delivery and Continuous Deployment?',
      a: 'Continuous Integration: every change is merged frequently and automatically built and tested. Continuous Delivery: every change that passes CI is automatically prepared and can be released to production with one manual approval. Continuous Deployment: every change that passes the pipeline is released to production automatically without manual approval.',
      level: 'Easy',
    },
    {
      q: 'Why use npm ci instead of npm install in CI and Docker?',
      a: 'npm ci installs exactly the versions in package-lock.json, deletes any existing node_modules first, never modifies the lock file, and fails if package.json and the lock file are out of sync. That makes builds reproducible and usually faster. npm install may resolve newer versions and update the lock file.',
      level: 'Easy',
    },
    {
      q: 'How do you store secrets for GitHub Actions and the hosting platforms?',
      a: 'In GitHub: repository or environment secrets (Settings → Secrets and variables → Actions), accessed as ${{ secrets.NAME }} and masked in logs. On Render/Railway/Vercel: environment variables in the dashboard per environment. Never commit .env files; provide a .env.example with names only. Rotate secrets when someone leaves or a leak is suspected, and use different secrets per environment.',
      level: 'Easy',
    },
    {
      q: 'Your React app on Vercel shows 404 when you refresh /orders/42. Why and how do you fix it?',
      a: 'The CDN looks for a file at /orders/42, which does not exist; only index.html exists, and React Router handles the path in the browser. Fix with a rewrite of all non-file routes to /index.html: vercel.json rewrites, Netlify _redirects "/* /index.html 200", or try_files $uri /index.html in Nginx.',
      level: 'Easy',
    },
    {
      q: 'Login works locally but in production the refresh cookie is not sent. Frontend on myshop.vercel.app, API on shop-api.onrender.com. What could be wrong?',
      a: 'These are different sites, so the cookie is third-party: it needs SameSite=None and Secure, axios needs withCredentials: true, CORS must return the exact origin with Access-Control-Allow-Credentials: true, and Express needs app.set("trust proxy", 1) so secure cookies are set behind the proxy. Even then some browsers block third-party cookies. The robust fix is same-site domains (myshop.in + api.myshop.in) or proxying /api through the frontend domain.',
      level: 'Hard',
    },
    {
      q: 'Why do you need app.set("trust proxy", 1) on Render, Railway or behind Nginx?',
      a: 'The app receives requests from the platform proxy, not directly from users. Without trust proxy, req.ip is the proxy IP (rate limiting would block everyone together), req.protocol is http, and express-session or cookie options with secure: true may refuse to set cookies. trust proxy tells Express to read X-Forwarded-For and X-Forwarded-Proto from the first proxy hop.',
      level: 'Medium',
    },
    {
      q: 'How would you achieve zero-downtime deployments for the API?',
      a: 'Run the new version alongside the old one and switch traffic only when it passes a readiness health check (Render and most platforms do this with a health check path), implement graceful shutdown on SIGTERM so in-flight requests finish, keep database migrations backward compatible (expand-then-contract: add new fields first, remove old ones in a later release), and run more than one instance so a crash does not take the service down.',
      level: 'Hard',
    },
    {
      q: 'What MongoDB Atlas settings matter for a secure production deployment?',
      a: 'A dedicated database user with least privilege and a strong password, network access limited to the app hosts IPs or private endpoints (avoid 0.0.0.0/0 when you can), TLS (on by default with mongodb+srv), a region close to users and the API host, backups and point-in-time recovery on paid tiers, alerts for connections/CPU/disk, and separate projects or clusters for staging and production.',
      level: 'Medium',
    },
    {
      q: 'What is structured logging and why is it better than console.log strings?',
      a: 'Structured logging writes each log entry as JSON with fields like level, time, reqId, userId, route, status and duration. Log tools can then filter and aggregate (e.g. all 500 errors for /api/orders in the last hour, p95 latency) instead of grepping text. Libraries like pino are also much faster than console.log and support redaction of sensitive fields.',
      level: 'Medium',
    },
    {
      q: 'How do you roll back a bad deployment?',
      a: 'Use the platform rollback: Render "Rollback to this deploy", Railway redeploy of a previous deployment, Vercel "Promote to Production" on the previous deployment (instant, since builds are immutable). Alternatively revert the commit on main so CI/CD redeploys. Database changes need care: write reversible migrations or backward-compatible schema changes so old code still works with the new data.',
      level: 'Medium',
    },
    {
      q: 'What would your production monitoring setup be for a small MERN startup?',
      a: 'Uptime monitor (UptimeRobot/Better Stack) on /api/health and the homepage with alerts; Sentry for frontend and backend errors with releases and source maps; pino JSON logs with request ids shipped from Render to a log service; MongoDB Atlas alerts and Performance Advisor; basic metrics like request rate, error rate and p95 latency; and an on-call channel (Slack/WhatsApp/email) for alerts.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Add a paths filter so the server CI job only runs when files in server/ or the root lock file change, and the client job only for client/ changes.',
      hint: 'Use dorny/paths-filter in a "changes" job and if: conditions on the other jobs.',
      solution: `name: CI
on: [pull_request]
jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      server: \${{ steps.filter.outputs.server }}
      client: \${{ steps.filter.outputs.client }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            server:
              - 'server/**'
              - 'package-lock.json'
            client:
              - 'client/**'
              - 'package-lock.json'

  server:
    needs: changes
    if: \${{ needs.changes.outputs.server == 'true' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test -w server

  client:
    needs: changes
    if: \${{ needs.changes.outputs.client == 'true' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build -w client`,
    },
    {
      task: 'Write the production cookie options for the refresh token that work for myshop.in (client) and api.myshop.in (API), plus the Express settings needed on Render.',
      hint: 'Same site → Lax is enough; set domain so both subdomains share it only if needed.',
      solution: `// server/src/app.js
app.set('trust proxy', 1);                       // behind Render's proxy

// server/src/controllers/auth.controller.js
const isProd = process.env.NODE_ENV === 'production';
export const refreshCookieOptions = {
  httpOnly: true,                                 // not readable by JS (XSS)
  secure: isProd,                                 // HTTPS only in production
  sameSite: 'lax',                                // myshop.in and api.myshop.in are same-site
  path: '/api/auth',                              // sent only to auth endpoints
  maxAge: 7 * 24 * 60 * 60 * 1000,                // 7 days
};
res.cookie('refreshToken', token, refreshCookieOptions);

// CORS
app.use(cors({ origin: ['https://myshop.in', 'https://www.myshop.in'], credentials: true }));

// client axios
export const api = axios.create({ baseURL: 'https://api.myshop.in/api', withCredentials: true });`,
    },
    {
      task: 'Write a scheduled GitHub Actions workflow that pings the production health endpoint every 15 minutes and fails (sending GitHub email notifications) if it is down. Also explain why a real uptime service is still better.',
      hint: 'on.schedule with cron; curl -f fails on HTTP errors.',
      solution: `# .github/workflows/uptime.yml
name: Uptime check
on:
  schedule:
    - cron: '*/15 * * * *'     # every 15 minutes (UTC); GitHub may delay scheduled runs
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Check API
        run: curl -fsS --max-time 20 https://api.myshop.in/api/health
      - name: Check frontend
        run: curl -fsS --max-time 20 https://myshop.in > /dev/null

# Why a real uptime service is better:
# - scheduled workflows can be delayed or skipped under load and run at most every 5 minutes
# - uptime services check from several regions every minute, track response time,
#   provide status pages and alert via SMS/Slack/WhatsApp immediately`,
    },
    {
      task: 'Configure pino for production with redaction and pretty logs only in development.',
      hint: 'pino-pretty as a transport only when NODE_ENV !== "production".',
      solution: `// server/src/lib/logger.js
import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
  base: { service: 'shop-api', release: process.env.RENDER_GIT_COMMIT },
  transport: isProd ? undefined : { target: 'pino-pretty', options: { colorize: true } },
});

// server/src/app.js
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger } from './lib/logger.js';

app.use(pinoHttp({
  logger,
  genReqId: (req, res) => {
    const id = req.headers['x-request-id'] || randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  customLogLevel: (req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
}));`,
    },
  ],
  quiz: [
    {
      question: 'Which workflow trigger lets a deploy workflow start only after the CI workflow finishes?',
      options: ['on: push', 'on: workflow_run', 'on: release', 'on: issue_comment'],
      answer: 1,
      explanation: 'workflow_run fires when another workflow completes; check conclusion == "success" before deploying.',
    },
    {
      question: 'A Vite app on Netlify returns 404 on refresh of /cart. What fixes it?',
      options: [
        'Enable CORS on the API',
        'Set NODE_ENV=production',
        'Add a rewrite of /* to /index.html with status 200',
        'Use HashRouter is the only option',
      ],
      answer: 2,
      explanation: 'The SPA fallback rewrite lets React Router handle the path in the browser.',
    },
    {
      question: 'What is the purpose of the Health Check Path setting on Render?',
      options: [
        'Render sends traffic to a new deploy only after this path returns a success status',
        'It sets the API base URL for React',
        'It enables HTTPS',
        'It configures MongoDB Atlas IP access',
      ],
      answer: 0,
      explanation: 'Health checks enable zero-downtime deploys and automatic restarts of unhealthy instances.',
    },
    {
      question: 'Why should the 500 error response NOT include err.message from MongoDB?',
      options: [
        'It makes the response too slow',
        'Browsers cannot display it',
        'Express 5 forbids it',
        'It can leak internal details like collection names and indexes; log it server-side and return a request id instead',
      ],
      answer: 3,
      explanation: 'Internal error details help attackers; users get a generic message and an id that support can look up.',
    },
    {
      question: 'Which statement about VITE_ environment variables on Vercel is TRUE?',
      options: [
        'They are read at request time by the browser from the server',
        'They are embedded into the bundle at build time and are public',
        'They are encrypted in the bundle',
        'They can safely hold the Razorpay key secret',
      ],
      answer: 1,
      explanation: 'Vite replaces them during the build, so anyone can read them; never put secrets there, and redeploy after changing them.',
    },
  ],
};
