export default {
  id: 'day-55-ci-cd-deployment-pwa',
  title: 'CI/CD and Deployment: GitHub Actions, Vercel/Netlify, Environments per Stage, PWA with vite-plugin-pwa',
  module: 'Module 11: Testing, Quality & Deployment',
  day: 55,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Professional teams never deploy by dragging a dist folder. Every push runs an automated pipeline (lint → test → build → deploy), every pull request gets its own preview URL, and the same code moves through development, staging and production with different environment variables. Today you build that pipeline with GitHub Actions, deploy to Vercel or Netlify, and turn the React app into an installable, offline-capable PWA with vite-plugin-pwa.',
  objectives: [
    'Explain CI, continuous delivery and continuous deployment and the stages of a frontend pipeline',
    'Write a GitHub Actions workflow with caching, parallel jobs, artifacts and required status checks',
    'Deploy a Vite React SPA to Vercel or Netlify with SPA rewrites, preview deployments and rollbacks',
    'Manage environment variables per stage (development, staging, production) safely with Vite modes and secrets',
    'Make the app a PWA with vite-plugin-pwa: manifest, service worker caching, offline support and update prompts',
  ],
  theory: [
    {
      heading: 'CI/CD in plain words',
      content:
        '- **Continuous Integration (CI)**: every push / pull request is automatically linted, tested and built. Broken code is caught in minutes, not on release day\n- **Continuous Delivery**: every change that passes CI is **ready** to release; a human clicks "promote to production"\n- **Continuous Deployment**: every change merged to `main` goes to production **automatically**\n\nA typical frontend pipeline:\n1. Install dependencies (with cache)\n2. **Lint + type-check** (ESLint, TypeScript)\n3. **Unit/integration tests** with coverage (Vitest)\n4. **Build** (`vite build`) and check bundle size\n5. **E2E tests** against the build (Playwright)\n6. **Deploy preview** for PRs; **deploy staging/production** for main or tags\n7. Smoke test + monitoring (Sentry, web-vitals) and easy **rollback**\n\nAnalogy: CI is the quality-check line in a factory; every product passes the same machines before it is packed. CD is the truck that delivers only checked boxes.',
      points: [
        'Popular CI tools: GitHub Actions (most common for frontend), GitLab CI, Bitbucket Pipelines, Jenkins, CircleCI, Azure DevOps',
        'Popular hosting for React SPAs: Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront / Amplify, Firebase Hosting, GitHub Pages',
      ],
    },
    {
      heading: 'GitHub Actions basics',
      content:
        'Workflows are YAML files in `.github/workflows/`. Key words:\n- **on**: triggers (`push`, `pull_request`, `workflow_dispatch` manual button, `schedule` cron, `release`)\n- **jobs**: run in parallel by default on fresh virtual machines (`runs-on: ubuntu-latest`); `needs:` creates an order\n- **steps**: shell commands (`run:`) or reusable actions (`uses: actions/checkout@v4`)\n- **actions/setup-node@v4** with `cache: npm` caches dependencies; use `npm ci` (clean, exact install from the lockfile)\n- **Secrets** (`secrets.VERCEL_TOKEN`) are encrypted repo/org settings, masked in logs; **vars** for non-secret config\n- **Environments** (staging, production) can hold their own secrets and require manual approval\n- **Artifacts** (`actions/upload-artifact@v4`) pass the build or Playwright report between jobs or for download\n- **Matrix** runs the same job for several Node versions or test shards\n- **concurrency** cancels outdated runs of the same branch\n\nThen enable **branch protection**: PRs into main require these checks to pass.',
      syntax: `name: CI
on:
  pull_request:
  push:
    branches: [main]
concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run test:run -- --coverage
      - run: npm run build`,
      tip: 'Never print secrets, never commit .env files, and remember: anything in a VITE_ variable ends up in the public JavaScript bundle. Real secrets (payment keys, DB passwords) belong only on the server.',
    },
    {
      heading: 'Deploying to Vercel and Netlify',
      content:
        'Both platforms connect to your GitHub repo and **build on their servers**: push to main → production deploy; open a PR → a unique **preview URL** posted as a comment on the PR, perfect for QA, designers and product managers.\n\n**Vercel**: Import the repo at vercel.com, framework "Vite" is detected (build `npm run build`, output `dist`). Env vars per environment (Production, Preview, Development) in project settings. CLI: `npm i -g vercel`, `vercel` (preview) and `vercel --prod`.\n\n**Netlify**: "Add new site → Import from Git", build `npm run build`, publish `dist`. Config can live in `netlify.toml`. CLI: `netlify deploy` and `netlify deploy --prod`.\n\n**SPA routing gotcha**: React Router handles `/products/42` in the browser, but on refresh the server looks for a file at that path and returns 404. Add a **rewrite** of all paths to `/index.html` (`vercel.json` rewrites, or `/* /index.html 200` in Netlify `_redirects`).\n\n**Rollback**: every deploy is immutable, so you can instantly "promote" a previous deployment if production breaks. Also set cache headers: hashed `/assets/*` files cached for a year, `index.html` never cached.',
      syntax: `// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}

# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`,
    },
    {
      heading: 'Environments per stage with Vite modes',
      content:
        'The same code runs in several **stages**, each with its own API URL, keys and feature flags:\n- **development** (your laptop, `npm run dev`, mock or local API)\n- **staging / UAT** (`https://staging.shopkart.in`, test data, QA and client sign-off)\n- **production** (`https://shopkart.in`, real users and real payments)\n\nVite loads env files by **mode**: `.env` (all), `.env.local` (all, git-ignored), `.env.[mode]` and `.env.[mode].local`. `vite` uses mode `development`, `vite build` uses `production`, and `vite build --mode staging` loads `.env.staging`.\n\nOnly variables prefixed with **`VITE_`** are exposed to client code as `import.meta.env.VITE_API_URL`. Built-ins: `import.meta.env.MODE`, `DEV`, `PROD`, `BASE_URL`.\n\nBest practices:\n- Keep a committed `.env.example` listing all variables (no values for secrets)\n- Read env in **one config module** (`src/config.js`) and validate it at startup (e.g. with Zod), fail fast if missing\n- On Vercel/Netlify set variables per environment in the dashboard instead of committing `.env.production`\n- Show a small "STAGING" ribbon in non-production builds so testers never confuse environments\n- Use **feature flags** to ship code dark and enable it per environment or per user',
      syntax: `# .env.staging
VITE_API_URL=https://staging-api.shopkart.in
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
VITE_ENABLE_NEW_CHECKOUT=true

// package.json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build:staging": "vite build --mode staging",
  "preview": "vite preview"
}

// src/config.js
export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  env: import.meta.env.MODE,
  newCheckout: import.meta.env.VITE_ENABLE_NEW_CHECKOUT === "true",
};
if (!config.apiUrl) throw new Error("VITE_API_URL is missing");`,
    },
    {
      heading: 'Progressive Web Apps with vite-plugin-pwa',
      content:
        'A **Progressive Web App (PWA)** is a website that can be **installed** on the home screen, opens full screen like an app, works **offline or on poor networks**, and can receive push notifications. Flipkart Lite, Twitter/X Lite and Starbucks are famous PWAs; in India PWAs matter because many users have low-storage phones and unstable 4G.\n\nThree requirements:\n1. Served over **HTTPS**\n2. A **web app manifest** (name, icons 192/512 px, theme colour, `display: "standalone"`, start URL)\n3. A **service worker**: a script that runs in the background, intercepts network requests and serves cached files\n\n**vite-plugin-pwa** (uses Google Workbox) generates both for you: `npm i -D vite-plugin-pwa`.\n- `registerType: "autoUpdate"` silently updates; `"prompt"` lets you show "New version available, Reload" with the `useRegisterSW` hook from `virtual:pwa-register/react`\n- `workbox.globPatterns` precaches the built JS/CSS/HTML (the **app shell**) so the app opens offline\n- `runtimeCaching` caches API calls and images with strategies: **CacheFirst** (images, fonts), **NetworkFirst** (API data that should be fresh), **StaleWhileRevalidate** (show cached, update in background)\n\nTest in Chrome DevTools → Application tab (Manifest, Service Workers, Cache Storage, "Offline" checkbox) and with Lighthouse\'s PWA checks. Service workers only work on `https` or `localhost`, so test with `npm run build && npm run preview`.',
      syntax: `// vite.config.js
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "ShopKart – Online Shopping",
        short_name: "ShopKart",
        theme_color: "#4f46e5",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          { urlPattern: ({ url }) => url.pathname.startsWith("/api/products"), handler: "NetworkFirst",
            options: { cacheName: "api-products", expiration: { maxEntries: 50, maxAgeSeconds: 86400 } } },
          { urlPattern: ({ request }) => request.destination === "image", handler: "CacheFirst",
            options: { cacheName: "images", expiration: { maxEntries: 200, maxAgeSeconds: 30 * 86400 } } },
        ],
      },
    }),
  ],
});`,
      tip: 'Never cache authenticated or payment API responses blindly, and always give users a way to get the new version: a stale service worker serving an old bundle is a classic production bug.',
    },
    {
      heading: 'Release safety: monitoring, rollbacks and the playground note',
      content:
        'Deploying is only half the job. Production-ready teams also have:\n- **Error monitoring** with source maps uploaded privately (Sentry, Datadog, LogRocket)\n- **Performance monitoring** (web-vitals to analytics, Day 52)\n- **Rollback plan**: instant rollback on Vercel/Netlify, or redeploy the previous Git tag\n- **Feature flags** (LaunchDarkly, Unleash, GrowthBook, or a simple config) for gradual rollouts: 5% → 50% → 100% of users\n- **Release notes / changelog** generated from Conventional Commits (Day 54)\n- **Smoke tests** after deploy: open the home page, log in, add to cart\n\nPlayground note: CI runners, Vercel and service workers cannot run inside the sandboxed playground. The demos simulate a pipeline, environment configs and the PWA status/update UI in plain React; the `code` blocks contain the real files to commit.\n\nComing next: Module 12 (Day 56) starts React Native with Expo.',
    },
  ],
  examples: [
    {
      title: 'A complete GitHub Actions pipeline (and a pipeline simulator)',
      scenario: 'Set up CI/CD for a Vite React shop: on every PR run lint, unit tests and build in parallel, then Playwright E2E on the build; on main also deploy to production on Vercel. The playground visualises how the jobs run and how a failing job blocks deployment.',
      steps: [
        'Create .github/workflows/ci.yml with the jobs below',
        'Add repository secrets VERCEL_TOKEN, VERCEL_ORG_ID and VERCEL_PROJECT_ID (Settings → Secrets and variables → Actions)',
        'Push a branch and open a PR: watch the Checks tab',
        'In Settings → Branches protect main: require the lint, test, build and e2e checks',
        'In the playground run the pipeline, then make the test job fail and see deploy get skipped',
      ],
      code: `# .github/workflows/ci.yml
name: CI/CD
on:
  pull_request:
  push:
    branches: [main]
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run test:run -- --coverage

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_URL: \${{ vars.VITE_API_URL }}
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }

  e2e:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --project=chromium
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report }

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [lint, test, e2e]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: npm i -g vercel
      - run: vercel pull --yes --environment=production --token=\${{ secrets.VERCEL_TOKEN }}
      - run: vercel build --prod --token=\${{ secrets.VERCEL_TOKEN }}
      - run: vercel deploy --prebuilt --prod --token=\${{ secrets.VERCEL_TOKEN }}
    env:
      VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID }}`,
      playground: {
        jsx: `const { useState, useRef } = React;

const JOBS = [
  { id: "lint", label: "lint", needs: [], secs: 2 },
  { id: "test", label: "test (vitest)", needs: [], secs: 3 },
  { id: "build", label: "build (vite)", needs: [], secs: 2.5 },
  { id: "e2e", label: "e2e (playwright)", needs: ["build"], secs: 3 },
  { id: "deploy", label: "deploy (vercel --prod)", needs: ["lint", "test", "e2e"], secs: 2, mainOnly: true },
];
const ICON = { queued: "⏳", running: "🔄", success: "✅", failure: "❌", skipped: "⏭️" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

function App() {
  const [status, setStatus] = useState({});
  const [failJob, setFailJob] = useState("none");
  const [branch, setBranch] = useState("main");
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const runId = useRef(0);

  async function run() {
    const id = ++runId.current;
    setRunning(true);
    setLog([]);
    const st = {};
    const update = (job, s) => { st[job] = s; if (id === runId.current) setStatus({ ...st }); };
    const say = msg => id === runId.current && setLog(l => [...l, msg]);
    JOBS.forEach(j => update(j.id, "queued"));
    say("Triggered by push to " + branch);

    async function runJob(job) {
      if (job.mainOnly && branch !== "main") { update(job.id, "skipped"); say(job.id + ": skipped (not main)"); return; }
      update(job.id, "running");
      await sleep(job.secs * 600);
      const ok = failJob !== job.id;
      update(job.id, ok ? "success" : "failure");
      say(job.id + (ok ? ": passed in " + job.secs + "s" : ": FAILED (see logs)"));
    }
    const done = {};
    const promiseFor = job => {
      if (done[job.id]) return done[job.id];
      done[job.id] = (async () => {
        await Promise.all(job.needs.map(n => promiseFor(JOBS.find(j => j.id === n))));
        if (job.needs.some(n => st[n] !== "success")) { update(job.id, "skipped"); say(job.id + ": skipped because a needed job failed"); return; }
        await runJob(job);
      })();
      return done[job.id];
    };
    await Promise.all(JOBS.map(promiseFor));
    const deployed = st.deploy === "success";
    say(deployed ? "🚀 Live at https://shopkart.vercel.app" : branch === "main" ? "🛑 Production NOT updated" : "🔍 Preview checks finished (PR cannot merge unless all green)");
    setRunning(false);
  }

  return (
    <div className="wrap">
      <div className="controls">
        <label>Branch <select value={branch} onChange={e => setBranch(e.target.value)}><option>main</option><option>feature/coupon-field</option></select></label>
        <label>Make a job fail <select value={failJob} onChange={e => setFailJob(e.target.value)}>
          <option value="none">none</option>{JOBS.map(j => <option key={j.id} value={j.id}>{j.id}</option>)}
        </select></label>
        <button onClick={run} disabled={running}>{running ? "Running…" : "▶ Run workflow"}</button>
      </div>
      <div className="graph">
        <div className="col">{JOBS.filter(j => j.needs.length === 0).map(j => <Job key={j.id} job={j} s={status[j.id]} />)}</div>
        <div className="col">{JOBS.filter(j => j.id === "e2e").map(j => <Job key={j.id} job={j} s={status[j.id]} />)}</div>
        <div className="col">{JOBS.filter(j => j.id === "deploy").map(j => <Job key={j.id} job={j} s={status[j.id]} />)}</div>
      </div>
      <pre className="log">{log.join("\\n") || "Click Run workflow"}</pre>
    </div>
  );
}

function Job({ job, s = "idle" }) {
  return (
    <div className={"job " + s}>
      <span>{ICON[s] || "▫️"}</span> {job.label}
      {job.needs.length > 0 && <small>needs: {job.needs.join(", ")}</small>}
    </div>
  );
}`,
        css: `.wrap { max-width: 620px; }
.controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 10px; }
.graph { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; align-items: center; }
.col { display: grid; gap: 8px; }
.job { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px; font-size: 13px; background: white; }
.job small { display: block; color: #6b7280; }
.job.running { border-color: #f59e0b; background: #fffbeb; }
.job.success { border-color: #16a34a; background: #f0fdf4; }
.job.failure { border-color: #dc2626; background: #fef2f2; }
.job.skipped { opacity: .55; }
.log { background: #0f172a; color: #e2e8f0; padding: 10px; border-radius: 8px; font-size: 12px; min-height: 80px; white-space: pre-wrap; }`,
      },
      result: 'With no failures on main, lint/test/build run in parallel, e2e starts after build, and deploy runs last ("🚀 Live at …"). If test fails, deploy is skipped and production is not updated. On a feature branch deploy is skipped and only checks run.',
      explanation:
        'Jobs without needs run in parallel to save time; needs creates the dependency graph, and a failed dependency skips downstream jobs, which is exactly how GitHub Actions protects production. The real workflow also caches npm, cancels outdated runs with concurrency, uploads the Playwright report only on failure, and uses an environment with secrets for the deploy job. The simulator is plain React; the YAML in the code block is the real file.',
    },
    {
      title: 'Environment config per stage with a staging ribbon and feature flags',
      scenario: 'The same build pipeline produces development, staging and production builds. QA must always see which environment they are testing, and the new checkout must be enabled only on staging.',
      steps: [
        'Create .env.development, .env.staging and .env.production (and .env.example) with VITE_ variables',
        'Create src/config.js that reads import.meta.env, validates it and exports a frozen config',
        'Add "build:staging": "vite build --mode staging" and configure Vercel/Netlify env vars per environment',
        'Render an EnvRibbon when config.env !== "production" and use config.flags for feature flags',
        'In the playground switch the simulated mode and watch the API URL, ribbon and checkout change',
      ],
      code: `// .env.example (committed)
VITE_API_URL=
VITE_RAZORPAY_KEY_ID=
VITE_SENTRY_DSN=
VITE_ENABLE_NEW_CHECKOUT=false

// src/config.js
import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_RAZORPAY_KEY_ID: z.string().startsWith("rzp_"),
  VITE_ENABLE_NEW_CHECKOUT: z.enum(["true", "false"]).default("false"),
});

const env = schema.parse(import.meta.env);   // throws a clear error at startup if misconfigured

export const config = Object.freeze({
  env: import.meta.env.MODE,                   // "development" | "staging" | "production"
  apiUrl: env.VITE_API_URL,
  razorpayKey: env.VITE_RAZORPAY_KEY_ID,
  flags: { newCheckout: env.VITE_ENABLE_NEW_CHECKOUT === "true" },
});

// src/components/EnvRibbon.jsx
import { config } from "@/config";
export function EnvRibbon() {
  if (config.env === "production") return null;
  return <div className="env-ribbon">{config.env.toUpperCase()}</div>;
}`,
      playground: {
        jsx: `const { useState } = React;

// Simulates what Vite injects as import.meta.env for each mode
const ENV_FILES = {
  development: { MODE: "development", VITE_API_URL: "http://localhost:3000/api", VITE_RAZORPAY_KEY_ID: "rzp_test_dev123", VITE_ENABLE_NEW_CHECKOUT: "true" },
  staging: { MODE: "staging", VITE_API_URL: "https://staging-api.shopkart.in", VITE_RAZORPAY_KEY_ID: "rzp_test_stg456", VITE_ENABLE_NEW_CHECKOUT: "true" },
  production: { MODE: "production", VITE_API_URL: "https://api.shopkart.in", VITE_RAZORPAY_KEY_ID: "rzp_live_prd789", VITE_ENABLE_NEW_CHECKOUT: "false" },
  "broken (missing URL)": { MODE: "staging", VITE_API_URL: "", VITE_RAZORPAY_KEY_ID: "rzp_test_x", VITE_ENABLE_NEW_CHECKOUT: "maybe" },
};

function createConfig(env) {
  const errors = [];
  try { new URL(env.VITE_API_URL); } catch { errors.push("VITE_API_URL must be a valid URL"); }
  if (!String(env.VITE_RAZORPAY_KEY_ID).startsWith("rzp_")) errors.push("VITE_RAZORPAY_KEY_ID must start with rzp_");
  if (!["true", "false"].includes(env.VITE_ENABLE_NEW_CHECKOUT)) errors.push('VITE_ENABLE_NEW_CHECKOUT must be "true" or "false"');
  if (errors.length) throw new Error("Invalid environment:\\n- " + errors.join("\\n- "));
  return Object.freeze({
    env: env.MODE, apiUrl: env.VITE_API_URL, razorpayKey: env.VITE_RAZORPAY_KEY_ID,
    flags: { newCheckout: env.VITE_ENABLE_NEW_CHECKOUT === "true" },
  });
}

function EnvRibbon({ config }) {
  if (config.env === "production") return null;
  return <div className={"ribbon " + config.env}>{config.env.toUpperCase()}</div>;
}

function Checkout({ config }) {
  return config.flags.newCheckout ? (
    <div className="box new"><b>✨ New one-page checkout</b><p>UPI · Cards · Net banking · EMI</p><button>Pay ₹2,349</button></div>
  ) : (
    <div className="box"><b>Classic checkout</b><p>Step 1 of 3: Address</p><button>Continue</button></div>
  );
}

function App() {
  const [mode, setMode] = useState("staging");
  let config, error;
  try { config = createConfig(ENV_FILES[mode]); } catch (e) { error = e.message; }

  return (
    <div className="app">
      <label>Simulated build: <code>vite build --mode</code>{" "}
        <select value={mode} onChange={e => setMode(e.target.value)}>
          {Object.keys(ENV_FILES).map(m => <option key={m}>{m}</option>)}
        </select>
      </label>
      {error ? (
        <pre className="crash" role="alert">💥 App refused to start{"\\n"}{error}</pre>
      ) : (
        <div className="shell">
          <EnvRibbon config={config} />
          <h3>ShopKart</h3>
          <table><tbody>
            <tr><td>MODE</td><td>{config.env}</td></tr>
            <tr><td>API</td><td>{config.apiUrl}</td></tr>
            <tr><td>Razorpay key</td><td>{config.razorpayKey}{config.razorpayKey.includes("live") ? " (real payments!)" : " (test mode)"}</td></tr>
            <tr><td>newCheckout flag</td><td>{String(config.flags.newCheckout)}</td></tr>
          </tbody></table>
          <Checkout config={config} />
        </div>
      )}
    </div>
  );
}`,
        css: `.app { max-width: 460px; }
.shell { position: relative; overflow: hidden; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px 14px; margin-top: 10px; }
.ribbon { position: absolute; top: 14px; right: -34px; transform: rotate(45deg); color: white; font-size: 11px; font-weight: 800; padding: 3px 40px; }
.ribbon.staging { background: #ea580c; } .ribbon.development { background: #2563eb; }
td { padding: 2px 10px 2px 0; font-size: 13px; } td:first-child { color: #6b7280; }
.box { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; margin-top: 10px; }
.box.new { border-color: #a855f7; background: #faf5ff; }
.crash { background: #fef2f2; color: #991b1b; padding: 10px; border-radius: 8px; white-space: pre-wrap; }`,
      },
      result: 'Staging shows an orange STAGING ribbon, the staging API, a test Razorpay key and the new checkout. Production has no ribbon, the live key and the classic checkout. "broken (missing URL)" refuses to start and lists every configuration error.',
      explanation:
        'All environment access goes through one validated config object, so a missing variable fails loudly at startup instead of causing strange bugs later. The ribbon prevents testers from mixing environments, and the feature flag lets the team ship the new checkout code to production while it is enabled only on staging. In a real Vite app the values come from import.meta.env, injected at build time per mode.',
    },
    {
      title: 'Deploying to Netlify and Vercel (with previews and SPA rewrites)',
      scenario: 'Put the shop online, get a preview URL for every PR, and make sure deep links like /products/42 work after a refresh.',
      steps: [
        'Run npm run build && npm run preview locally to check the production build',
        'Add public/_redirects (Netlify) or vercel.json (Vercel) with the SPA rewrite',
        'Import the GitHub repo in the Netlify/Vercel dashboard; build command npm run build, output dist',
        'Add environment variables for Production and Preview separately',
        'Open a PR: the bot comments a preview URL; merge to main: production deploys; use "Rollback"/"Publish deploy" on an older deploy if needed',
        'Add a custom domain (shopkart.in) and let the platform issue the HTTPS certificate',
      ],
      code: `# public/_redirects  (Netlify: copied into dist by Vite)
/*    /index.html   200

// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}

# Netlify CLI
npm i -g netlify-cli
netlify login
netlify init                 # link the repo
netlify deploy               # draft/preview URL
netlify deploy --prod        # production

# Vercel CLI
npm i -g vercel
vercel                       # preview deployment
vercel --prod                # production deployment
vercel env add VITE_API_URL production

# GitHub Pages alternative (project site): set base in vite.config.js
# export default defineConfig({ base: "/shopkart/" })
# and use HashRouter or a 404.html copy of index.html for deep links`,
      result: 'The site is live on HTTPS, every pull request gets its own preview link for review, refreshing /products/42 loads the app instead of a 404, and any bad release can be rolled back in one click.',
      explanation:
        'Static hosts serve files; client-side routes are not files, so the rewrite sends every unknown path to index.html where React Router takes over. Building on the platform from Git gives immutable deployments (instant rollback) and preview URLs per branch. Environment variables configured per environment keep test keys out of production and vice versa. This example is configuration only, so it has no playground.',
    },
    {
      title: 'PWA: install button, offline banner and "new version available" prompt',
      scenario: 'Make ShopKart installable and resilient: show an Install button when the browser allows it, an offline banner when the network drops, and a prompt when a new service worker version is ready.',
      steps: [
        'npm i -D vite-plugin-pwa and add VitePWA({ registerType: "prompt", manifest, workbox }) to vite.config.js',
        'Add icons (192 and 512 px, plus maskable) to public/',
        'Create ReloadPrompt.jsx using useRegisterSW from virtual:pwa-register/react',
        'Create useOnlineStatus and useInstallPrompt hooks (beforeinstallprompt event)',
        'Build and preview, then check DevTools → Application (Manifest, Service Workers, Offline). The playground simulates offline and the update event',
      ],
      code: `// src/components/ReloadPrompt.jsx
import { useRegisterSW } from "virtual:pwa-register/react";

export function ReloadPrompt() {
  const { needRefresh: [needRefresh, setNeedRefresh], offlineReady: [offlineReady, setOfflineReady], updateServiceWorker } =
    useRegisterSW({ onRegisterError: (e) => console.error("SW registration error", e) });

  if (!needRefresh && !offlineReady) return null;
  return (
    <div role="status" className="toast">
      {offlineReady ? "App ready to work offline" : "A new version is available"}
      {needRefresh && <button onClick={() => updateServiceWorker(true)}>Reload</button>}
      <button onClick={() => { setNeedRefresh(false); setOfflineReady(false); }}>Close</button>
    </div>
  );
}

// src/hooks/useInstallPrompt.js
export function useInstallPrompt() {
  const [event, setEvent] = useState(null);
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setEvent(e); };   // keep it for later
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  async function install() {
    if (!event) return;
    event.prompt();
    await event.userChoice;     // { outcome: "accepted" | "dismissed" }
    setEvent(null);
  }
  return { canInstall: !!event, install };
}`,
      playground: {
        jsx: `const { useState, useEffect, useSyncExternalStore } = React;

// Real hook: works in any browser (try DevTools → Network → Offline)
function subscribe(cb) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); };
}
function useOnlineStatus() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}

// Real hook: the event fires only on an installable HTTPS site, so the playground also offers a simulation
function useInstallPrompt() {
  const [event, setEvent] = useState(null);
  useEffect(() => {
    const handler = e => { e.preventDefault(); setEvent(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  return [event, setEvent];
}

function App() {
  const realOnline = useOnlineStatus();
  const [simOffline, setSimOffline] = useState(false);
  const online = realOnline && !simOffline;
  const [installEvent, setInstallEvent] = useInstallPrompt();
  const [installed, setInstalled] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [version, setVersion] = useState("1.4.0");
  const [cart, setCart] = useState(2);

  async function install() {
    if (installEvent && installEvent.prompt) { installEvent.prompt(); await installEvent.userChoice; }
    setInstallEvent(null);
    setInstalled(true);
  }

  return (
    <div className="phone">
      {!online && <div className="offline" role="status">📴 You are offline. Showing saved products; your cart will sync when you are back online.</div>}
      <header>
        <b>ShopKart</b> <small>v{version}</small>
        {installEvent && !installed && <button className="install" onClick={install}>⬇ Install app</button>}
        {installed && <small className="ok">✔ Installed</small>}
      </header>
      <ul className="products">
        {["Cotton Kurta · ₹899", "Kolhapuri Chappal · ₹1,199", "Brass Diya Set · ₹799"].map(p => (
          <li key={p}>{p} <button onClick={() => setCart(c => c + 1)}>Add</button></li>
        ))}
      </ul>
      <p>🛒 Cart: {cart} items {online ? "" : "(saved locally)"}</p>

      {needRefresh && (
        <div className="toast" role="status">
          A new version is available
          <button onClick={() => { setVersion("1.5.0"); setNeedRefresh(false); }}>Reload</button>
          <button onClick={() => setNeedRefresh(false)}>Later</button>
        </div>
      )}

      <fieldset>
        <legend>Simulate (playground only)</legend>
        <label><input type="checkbox" checked={simOffline} onChange={e => setSimOffline(e.target.checked)} /> Go offline</label>
        <button onClick={() => setInstallEvent({ simulated: true })} disabled={!!installEvent || installed}>Fire beforeinstallprompt</button>
        <button onClick={() => setNeedRefresh(true)} disabled={version === "1.5.0"}>New service worker waiting</button>
      </fieldset>
    </div>
  );
}`,
        css: `.phone { max-width: 360px; border: 8px solid #111827; border-radius: 26px; padding: 12px; position: relative; min-height: 380px; }
header { display: flex; align-items: center; gap: 8px; }
header small { color: #6b7280; }
.install { margin-left: auto; background: #4f46e5; color: white; border: none; border-radius: 99px; padding: 5px 10px; }
.ok { margin-left: auto; color: #15803d !important; }
.offline { background: #fef3c7; color: #78350f; font-size: 13px; padding: 6px 8px; border-radius: 8px; margin-bottom: 8px; }
.products { list-style: none; padding: 0; }
.products li { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
.toast { background: #111827; color: white; padding: 8px 10px; border-radius: 10px; font-size: 13px; display: flex; gap: 6px; align-items: center; margin: 8px 0; }
.toast button { font-size: 12px; }
fieldset { margin-top: 10px; font-size: 12px; display: grid; gap: 6px; }`,
      },
      result: 'Ticking "Go offline" (or really going offline in DevTools) shows the offline banner. "Fire beforeinstallprompt" makes the Install button appear; clicking it marks the app as installed. "New service worker waiting" shows the update toast; Reload bumps the version to 1.5.0.',
      explanation:
        'useOnlineStatus uses useSyncExternalStore to subscribe to the browser online/offline events, the recommended way to read external state. The install hook stores the beforeinstallprompt event so you can show your own Install button at a good moment. The update toast mirrors useRegisterSW: when a new service worker is waiting, the user decides when to reload, so they never lose a half-filled form. Service workers cannot register inside the sandboxed playground, which is why the update and install events are simulated with buttons.',
    },
  ],
  interview: [
    { q: 'What is the difference between CI, continuous delivery and continuous deployment?', a: 'CI automatically builds and tests every change merged/pushed. Continuous delivery keeps every passing change releasable, with a manual approval to deploy. Continuous deployment releases every passing change to production automatically.', level: 'Easy' },
    { q: 'What stages would you put in a React CI pipeline?', a: 'npm ci with caching, lint and type-check, unit/integration tests with coverage, production build with bundle-size check, E2E tests (Playwright) against the build, preview deploy for PRs, production deploy from main/tags, then smoke tests and monitoring.', level: 'Medium' },
    { q: 'Why npm ci instead of npm install in CI?', a: 'npm ci installs exactly what package-lock.json specifies, deletes node_modules first, fails if package.json and the lockfile disagree, and is faster, giving reproducible builds.', level: 'Easy' },
    { q: 'How do you keep secrets safe in a frontend deployment?', a: 'Store them in CI/hosting secret managers, never commit .env files, and remember that every VITE_ (or REACT_APP_) variable is embedded in the public bundle. Real secrets stay on a backend or serverless function; the frontend gets only public keys (e.g. Razorpay key_id, not key_secret).', level: 'Medium' },
    { q: 'Why does refreshing /products/42 give a 404 after deployment, and how do you fix it?', a: 'The static host looks for a file at that path, but routes exist only in the client-side router. Configure a rewrite/fallback of all routes to index.html (vercel.json rewrites, Netlify _redirects "/* /index.html 200", nginx try_files).', level: 'Medium' },
    { q: 'How do you manage different environments in a Vite app?', a: 'Use modes with .env.[mode] files (vite build --mode staging), expose only VITE_-prefixed variables via import.meta.env, centralise and validate them in a config module, set per-environment values in the hosting dashboard, and show an environment banner on non-production builds.', level: 'Medium' },
    { q: 'What are preview deployments and why are they useful?', a: 'Automatic, unique URLs that deploy each branch/PR. Reviewers, QA, designers and PMs can test the actual change before it merges, and E2E tests can run against them.', level: 'Easy' },
    { q: 'What makes a web app a PWA?', a: 'HTTPS, a web app manifest (name, icons, start_url, display, theme colour) and a service worker providing offline/caching behaviour. Then it can be installed, launched full screen and work offline; it can also use push notifications and background sync.', level: 'Easy' },
    { q: 'Explain service worker caching strategies.', a: 'Cache First: serve from cache, fallback to network (static assets, images, fonts). Network First: try network, fall back to cache when offline (API data that should be fresh). Stale While Revalidate: serve cache immediately and update it in the background (avatars, non-critical data). Precaching stores the app shell at install time.', level: 'Hard' },
    { q: 'How do you handle updates in a PWA so users do not get stuck on old code?', a: 'Use vite-plugin-pwa with registerType "prompt" and show a "New version available, Reload" toast via useRegisterSW (or autoUpdate for simple apps), never cache index.html forever, version caches and clean old ones, and test the update flow before releasing.', level: 'Hard' },
    { q: 'How would you roll back a bad production release?', a: 'On Vercel/Netlify promote/publish the previous immutable deployment instantly; with a custom pipeline redeploy the previous Git tag/artifact. Then fix forward with a hotfix PR, add a test for the bug, and consider feature flags and gradual rollout to reduce future risk.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a GitHub Actions workflow that runs Vitest on Node 20 and 22 using a matrix, and uploads the coverage folder as an artifact only for Node 22.',
      hint: 'strategy.matrix.node; if: matrix.node == 22.',
      solution: `name: Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npx vitest run --coverage
      - if: matrix.node == 22
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage`,
    },
    {
      task: 'Create a staging deployment workflow that deploys to Netlify whenever code is pushed to the "staging" branch, using the staging environment secrets and vite build --mode staging.',
      hint: 'Use environment: staging and the netlify-cli deploy --prod with --site and --auth from secrets.',
      solution: `name: Deploy staging
on:
  push:
    branches: [staging]
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run test:run
      - run: npx vite build --mode staging
        env:
          VITE_API_URL: \${{ vars.VITE_API_URL }}
      - run: npx netlify-cli deploy --dir=dist --prod --site=\${{ secrets.NETLIFY_SITE_ID }} --auth=\${{ secrets.NETLIFY_AUTH_TOKEN }}`,
    },
    {
      task: 'Build a useNetworkQueue hook: while offline, "Add to cart" actions are stored in a queue (and shown as pending); when the browser goes online they are "sent" one by one.',
      hint: 'Listen to online/offline; keep the queue in state; flush it in an effect when online becomes true.',
      solution: `const { useState, useEffect } = React;
function useNetworkQueue(send) {
  const [online, setOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState([]);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  useEffect(() => {
    if (!online || queue.length === 0) return;
    const [first, ...rest] = queue;
    send(first).then(() => setQueue(rest));
  }, [online, queue]);
  const enqueue = item => (online ? send(item) : setQueue(q => [...q, item]));
  return { online, queue, enqueue, setOnline };
}
function App() {
  const [sent, setSent] = useState([]);
  const send = item => new Promise(r => setTimeout(() => { setSent(s => [...s, item]); r(); }, 300));
  const { online, queue, enqueue, setOnline } = useNetworkQueue(send);
  return (
    <div>
      <p>Status: {online ? "online" : "offline"} <button onClick={() => setOnline(o => !o)}>Toggle (simulate)</button></p>
      <button onClick={() => enqueue("Kurta #" + (sent.length + queue.length + 1))}>Add to cart</button>
      <p>Pending: {queue.join(", ") || "none"}</p>
      <p>Synced: {sent.join(", ") || "none"}</p>
    </div>
  );
}`,
    },
    {
      task: 'Write a minimal manifest.webmanifest and the HTML tags needed for an installable app with a theme colour and an iOS icon, for an app called "Nagpur Bazaar".',
      hint: 'Link rel="manifest", meta name="theme-color", link rel="apple-touch-icon".',
      solution: `// public/manifest.webmanifest
{
  "name": "Nagpur Bazaar",
  "short_name": "Bazaar",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ea580c",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}

<!-- index.html <head> -->
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#ea580c" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<!-- With vite-plugin-pwa the manifest and these links are generated for you. -->`,
    },
  ],
  quiz: [
    { question: 'In GitHub Actions, how do you make the deploy job wait for the test job?', options: ['needs: [test]', 'after: test', 'depends: test', 'order: 2'], answer: 0, explanation: 'needs creates job dependencies; without it jobs run in parallel.' },
    { question: 'Which Vite variable will be available in client code?', options: ['API_SECRET', 'NODE_SECRET_KEY', 'VITE_API_URL', 'DB_PASSWORD'], answer: 2, explanation: 'Only VITE_-prefixed variables are exposed via import.meta.env (and they are public).' },
    { question: 'Refreshing /orders/7 on Netlify shows "Page not found". What fixes it?', options: ['Use HashRouter only', 'A rewrite "/* /index.html 200"', 'Delete the dist folder', 'Add a service worker'], answer: 1, explanation: 'The rewrite sends all routes to index.html so React Router can handle them.' },
    { question: 'Which is NOT required for a PWA to be installable?', options: ['HTTPS', 'A web app manifest', 'A service worker', 'A native Android build'], answer: 3, explanation: 'PWAs are installed from the browser; no native build is needed.' },
    { question: 'Which caching strategy suits a product list API that should be fresh but still work offline?', options: ['Cache First', 'Network First', 'Cache Only', 'No caching'], answer: 1, explanation: 'Network First uses fresh data when online and falls back to the cache when offline.' },
  ],
};
