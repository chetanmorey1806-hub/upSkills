export default {
  id: 'day-19-deployment-vercel-env-edge-runtime',
  title: 'Deployment on Vercel, Environment Variables, Edge vs Node.js Runtime',
  module: 'Module 4: Production',
  day: 19,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Take a Next.js app to production. Understand what next build produces, deploy to Vercel from GitHub with preview deployments, manage environment variables safely (server-only vs NEXT_PUBLIC_, per environment), run database migrations on deploy, choose between the Edge and Node.js runtimes, and know the alternatives: self-hosting with next start, standalone Docker output and static export.',
  objectives: [
    'Explain what next build outputs and how routes are served (static, ISR, dynamic, edge)',
    'Deploy to Vercel with Git integration, preview deployments, custom domains and the Vercel CLI',
    'Use environment variables correctly: .env files, NEXT_PUBLIC_ prefix, per-environment values and validation',
    'Choose the Edge or Node.js runtime per route and know each runtime\'s limits',
    'Self-host with next start, output: "standalone" Docker images or output: "export"',
  ],
  theory: [
    {
      heading: 'From next build to production',
      content:
        '`next build` creates an optimized production build in `.next/`:\n- **Static routes** (○) prerendered to HTML at build time\n- **SSG with params** (●) from `generateStaticParams`\n- **Dynamic routes** (ƒ) rendered on demand per request (serverless functions on Vercel)\n- **ISR routes** (static with `revalidate`) regenerated in the background\n- Client JS chunks with content hashes (`/_next/static/...`) cached forever\n\n`next start` runs the production Node.js server locally - always test this before deploying (`npm run build && npm run start`).\n\nA build fails on type errors (TypeScript) and ESLint errors by default - good, it stops broken code from shipping.\n\nAnalogy: `next dev` is cooking in your home kitchen and tasting as you go; `next build` is packing meals into labelled boxes for the restaurant chain - some ready-made (static), some cooked to order (dynamic).',
    },
    {
      heading: 'Deploying to Vercel',
      content:
        '**Vercel** (the company behind Next.js) supports every Next.js feature with zero configuration.\n\n**Git workflow** (recommended):\n1. Push the project to GitHub/GitLab/Bitbucket.\n2. On vercel.com: **Add New Project** → import the repo → framework is auto-detected → add environment variables → **Deploy**.\n3. Every push to `main` creates a **Production deployment**; every other branch / pull request gets a **Preview deployment** with its own URL (great for code review and QA).\n4. **Instant rollback**: promote any previous deployment back to production in one click.\n\n**Vercel CLI**: `npm i -g vercel`, `vercel` (preview), `vercel --prod` (production), `vercel env pull .env.local` (download env vars for local dev), `vercel logs`.\n\n**Custom domains**: Project → Settings → Domains → add `shop.example.com` and set the DNS record (A or CNAME) shown by Vercel. HTTPS certificates are automatic.\n\nUnder the hood: static files go to Vercel\'s CDN, dynamic routes/Server Actions/Route Handlers become **Vercel Functions** (serverless), middleware runs at the edge, images use the Image Optimization service.',
      tip: 'Region matters: set the Functions region (Project Settings → Functions) close to your database. A function in the USA talking to a database in Mumbai adds ~250 ms to every query.',
    },
    {
      heading: 'Environment variables done right',
      content:
        'Next.js loads env files in this order (first wins): `process.env` from the host → `.env.$(NODE_ENV).local` → `.env.local` (not loaded in test) → `.env.$(NODE_ENV)` → `.env`.\n\n**Two kinds of variables:**\n- **Server-only** (default): `DATABASE_URL`, `AUTH_SECRET`, `STRIPE_SECRET_KEY`. Available in Server Components, Server Actions, Route Handlers, middleware. **Never sent to the browser.**\n- **Public**: names starting with `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`). Their values are **inlined into the client JavaScript at build time** - anyone can read them. Changing them requires a **rebuild**.\n\nOn Vercel, set variables per environment: **Production**, **Preview**, **Development**. Use a separate database for previews so test data never touches production.\n\nGood practices:\n- `.env*.local` in `.gitignore`; commit `.env.example` with names only\n- **Validate at startup** with zod so a missing variable fails the build, not a user request\n- Access variables statically: `process.env.NEXT_PUBLIC_API_URL` works, but `process.env[name]` is not inlined on the client\n- Rotate secrets that leak, and never prefix secrets with NEXT_PUBLIC_',
      syntax:
        "// lib/env.js\nimport { z } from 'zod';\n\nconst schema = z.object({\n  DATABASE_URL: z.string().url(),\n  AUTH_SECRET: z.string().min(32),\n  NEXT_PUBLIC_SITE_URL: z.string().url(),\n});\n\nexport const env = schema.parse({\n  DATABASE_URL: process.env.DATABASE_URL,\n  AUTH_SECRET: process.env.AUTH_SECRET,\n  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,\n});\n// import { env } from '@/lib/env' in server code -> crash early with a clear message if misconfigured",
    },
    {
      heading: 'Edge runtime vs Node.js runtime',
      content:
        'Each route (page, layout, Route Handler) can choose where it runs with `export const runtime = \'edge\'` or `\'nodejs\'` (default).\n\n**Node.js runtime** (default, recommended for most routes):\n- Full Node.js APIs (`fs`, `crypto`, `Buffer`, streams) and all npm packages\n- Works with Prisma/Mongoose and TCP database connections\n- Runs in one region (serverless functions or your server); slightly slower cold starts\n\n**Edge runtime**:\n- Lightweight V8 isolates running in many locations close to users; near-zero cold starts\n- Only Web-standard APIs (`fetch`, `Request`, `Response`, `URL`, Web Crypto, `TextEncoder`); no `fs`, no native modules, limited bundle size\n- Database access only via HTTP-based drivers (Neon serverless, Upstash Redis, PlanetScale, Prisma Accelerate)\n- Good for: middleware, geolocation/personalization, simple APIs, OG image generation, A/B logic\n\nWarning: an edge function far from your database can be **slower** overall, because every query travels across the world. Vercel now recommends the Node.js runtime (with Fluid compute) for most workloads and edge mainly for middleware.',
      points: [
        'export const runtime = "edge" | "nodejs" (route segment config)',
        'Edge: no fs, no Prisma (classic), small bundles, global low latency',
        'Node: full ecosystem, best next to your database',
      ],
    },
    {
      heading: 'Databases, migrations and self-hosting options',
      content:
        '**Migrations on deploy**: add `"postinstall": "prisma generate"` and run `prisma migrate deploy` either in the build command (`"build": "prisma migrate deploy && next build"`) or in a CI step before promoting to production. Use connection pooling (PgBouncer / Prisma Accelerate / Neon pooled URL) because serverless functions open many short-lived connections.\n\n**Self-hosting** (VPS, AWS, Render, Railway, your company server):\n- `next build && next start` behind a reverse proxy (Nginx) with PM2 or systemd; supports all features (ISR, Server Actions, middleware, image optimization with `sharp`).\n- `output: \'standalone\'` in next.config.js copies only the files needed to run into `.next/standalone` → tiny **Docker** images (`node server.js`). Copy `public/` and `.next/static` next to it.\n- `output: \'export\'` creates a **fully static site** in `out/` (HTML/CSS/JS) for any static host (S3, GitHub Pages, Netlify). No server features: no Server Actions, no dynamic routes without `generateStaticParams`, no middleware, no ISR, no default image optimization.\n\nWhen running multiple instances yourself, configure a shared cache handler (e.g. Redis) and the same `AUTH_SECRET`/build ID everywhere.\n\nProduction checklist: env vars set per environment, migrations applied, `metadataBase` correct, error tracking (Sentry), analytics/Speed Insights, security headers, custom 404/500 pages, logs monitored.',
      syntax:
        "# Dockerfile (multi-stage, output: 'standalone')\nFROM node:22-alpine AS deps\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\n\nFROM node:22-alpine AS builder\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nRUN npm run build\n\nFROM node:22-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nCOPY --from=builder /app/.next/standalone ./\nCOPY --from=builder /app/.next/static ./.next/static\nCOPY --from=builder /app/public ./public\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]",
      tip: 'Coming next (Day 20): the final full-stack project, a practical test and 25+ interview questions.',
    },
  ],
  examples: [
    {
      title: 'Server-only vs NEXT_PUBLIC_ variables: what reaches the browser',
      scenario: 'A shop uses DATABASE_URL, STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_GA_ID. Find out which values end up in the client bundle.',
      steps: [
        'Create .env.local with the four variables and add .env*.local to .gitignore',
        'Read DATABASE_URL in a Server Component and NEXT_PUBLIC_GA_ID in a Client Component',
        'Run next build and search .next/static for the values: only NEXT_PUBLIC_ values appear',
        'Try reading process.env.STRIPE_SECRET_KEY in a Client Component: it is undefined',
        'In the playground SIMULATION, a fake "build" step inlines only NEXT_PUBLIC_ variables into client code',
      ],
      code:
        "# .env.local  (never commit)\nDATABASE_URL=postgresql://shop:pw@db.example.com:5432/shop\nSTRIPE_SECRET_KEY=sk_live_123\nNEXT_PUBLIC_SITE_URL=https://shop.example.com\nNEXT_PUBLIC_GA_ID=G-ABC123\n\n# .env.example (commit this)\nDATABASE_URL=\nSTRIPE_SECRET_KEY=\nNEXT_PUBLIC_SITE_URL=\nNEXT_PUBLIC_GA_ID=\n\n// app/page.js - Server Component: can read secrets\nexport default async function Home() {\n  const hasDb = Boolean(process.env.DATABASE_URL);   // stays on the server\n  return <Analytics />;\n}\n\n// app/Analytics.js - Client Component\n'use client';\nexport default function Analytics() {\n  // inlined at build time -> the bundle literally contains \"G-ABC123\"\n  const gaId = process.env.NEXT_PUBLIC_GA_ID;\n  // process.env.STRIPE_SECRET_KEY would be undefined here (good!)\n  return <span data-ga={gaId} />;\n}",
      playground: {
        jsx: "// SIMULATION of how next build treats env vars in client code.\n// Real Next.js replaces process.env.NEXT_PUBLIC_* with literal strings in the browser bundle.\nconst env = {\n  DATABASE_URL: 'postgresql://shop:pw@db.example.com:5432/shop',\n  STRIPE_SECRET_KEY: 'sk_live_123',\n  NEXT_PUBLIC_SITE_URL: 'https://shop.example.com',\n  NEXT_PUBLIC_GA_ID: 'G-ABC123',\n};\nconst clientSource = [\n  'const gaId = process.env.NEXT_PUBLIC_GA_ID;',\n  'const site = process.env.NEXT_PUBLIC_SITE_URL;',\n  'const stripe = process.env.STRIPE_SECRET_KEY;',\n  'const db = process.env.DATABASE_URL;',\n].join('\\n');\n\nfunction buildClientBundle(src) {\n  return src.replace(/process\\.env\\.([A-Z_]+)/g, (_, name) =>\n    name.startsWith('NEXT_PUBLIC_') ? JSON.stringify(env[name]) : 'undefined'\n  );\n}\n\nfunction App() {\n  const [built, setBuilt] = React.useState(false);\n  const box = { background: '#111', color: '#9f9', padding: 8, fontSize: 12, whiteSpace: 'pre-wrap' };\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <p>Client component source:</p>\n      <pre style={box}>{clientSource}</pre>\n      <button onClick={() => setBuilt(true)}>Run next build</button>\n      {built && (<>\n        <p>Shipped to the browser (.next/static/chunks/...):</p>\n        <pre style={box}>{buildClientBundle(clientSource)}</pre>\n        <p style={{ color: 'green' }}>Secrets stayed on the server. Public values are visible to everyone.</p>\n      </>)}\n    </div>\n  );\n}",
      },
      result: 'After "Run next build" the browser code shows const gaId = "G-ABC123"; const site = "https://shop.example.com"; but stripe and db become undefined.',
      explanation:
        'Only variables prefixed with NEXT_PUBLIC_ are inlined into client bundles at build time. Everything else is available only to server code. This is also why changing a NEXT_PUBLIC_ value needs a rebuild/redeploy.',
    },
    {
      title: 'Deploying from GitHub with preview and production environments',
      scenario: 'Deploy the blog: main branch = production at blog.example.com, every pull request = preview URL with a separate preview database.',
      steps: [
        'git push the project to GitHub',
        'On vercel.com: Add New Project → Import the repository (framework: Next.js detected)',
        'Add env vars: DATABASE_URL (Production = prod DB, Preview = staging DB), AUTH_SECRET, AUTH_GITHUB_ID/SECRET',
        'Set build command to "prisma migrate deploy && next build" (or run migrations in CI) and deploy',
        'Open a pull request: Vercel comments with a preview URL; merge it to deploy to production',
        'Add the custom domain blog.example.com and configure the DNS CNAME',
        'In the SIMULATION push commits to different branches and watch the deployments list',
      ],
      code:
        "# Terminal\ngit init && git add . && git commit -m \"Initial blog\"\ngit remote add origin https://github.com/asha/devblog.git\ngit push -u origin main\n\n# Optional: Vercel CLI\nnpm i -g vercel\nvercel link                 # connect the folder to a Vercel project\nvercel env add DATABASE_URL production\nvercel env pull .env.local  # download Development env vars\nvercel                      # preview deployment\nvercel --prod               # production deployment\n\n// package.json\n{\n  \"scripts\": {\n    \"dev\": \"next dev\",\n    \"build\": \"prisma migrate deploy && next build\",\n    \"start\": \"next start\",\n    \"postinstall\": \"prisma generate\"\n  }\n}",
      playground: {
        jsx: "// SIMULATION of Vercel's Git integration: branch -> environment -> URL + env vars.\nconst envVars = {\n  Production: { DATABASE_URL: 'postgres://prod-db/blog' },\n  Preview: { DATABASE_URL: 'postgres://staging-db/blog' },\n};\n\nfunction App() {\n  const [deployments, setDeployments] = React.useState([]);\n  const [branch, setBranch] = React.useState('feature/comments');\n  let n = deployments.length + 1;\n  function push() {\n    const isProd = branch === 'main';\n    const env = isProd ? 'Production' : 'Preview';\n    const slug = branch.replace(/[^a-z0-9]/gi, '-').toLowerCase();\n    const url = isProd ? 'https://blog.example.com' : 'https://devblog-git-' + slug + '-asha.vercel.app';\n    const d = { id: n, branch, env, url, db: envVars[env].DATABASE_URL, status: 'Building' };\n    setDeployments((list) => [d, ...list.map((x) => (isProd && x.env === 'Production' && x.status === 'Ready (current)' ? { ...x, status: 'Ready' } : x))]);\n    setTimeout(() => setDeployments((list) => list.map((x) => (x.id === d.id ? { ...x, status: isProd ? 'Ready (current)' : 'Ready' } : x))), 1200);\n  }\n  return (\n    <div style={{ fontFamily: 'sans-serif', fontSize: 14 }}>\n      <select value={branch} onChange={(e) => setBranch(e.target.value)}>\n        <option>feature/comments</option><option>fix/typo</option><option>main</option>\n      </select>{' '}\n      <button onClick={push}>git push</button>\n      <table cellPadding=\"4\" style={{ marginTop: 8 }}><tbody>\n        {deployments.map((d) => (\n          <tr key={d.id}>\n            <td>#{d.id}</td><td>{d.branch}</td><td><b>{d.env}</b></td><td>{d.status}</td>\n            <td><code>{d.url}</code></td><td><small>{d.db}</small></td>\n          </tr>\n        ))}\n      </tbody></table>\n    </div>\n  );\n}",
      },
      result: 'Pushing feature/comments creates a Preview deployment with a vercel.app URL using the staging database. Pushing main creates a Production deployment at blog.example.com that becomes "Ready (current)".',
      explanation:
        'Vercel maps branches to environments automatically. Separate env var values per environment keep preview deployments away from production data. Every deployment is immutable, so rollback is just promoting an earlier one.',
    },
    {
      title: 'Choosing the runtime per route: Edge geolocation vs Node.js database API',
      scenario: 'GET /api/hello greets the user by country at the edge (fast, global), while GET /api/orders reads PostgreSQL with Prisma on the Node.js runtime.',
      steps: [
        'Create app/api/hello/route.js with export const runtime = "edge"',
        'Read the country from the x-vercel-ip-country header (set by Vercel at the edge)',
        'Create app/api/orders/route.js on the default Node.js runtime using Prisma',
        'Deploy and compare response times from different locations',
        'In the SIMULATION pick a user location and see the latency for each runtime and database location',
      ],
      code:
        "// app/api/hello/route.js - Edge runtime\nexport const runtime = 'edge';\n\nexport function GET(request) {\n  const country = request.headers.get('x-vercel-ip-country') ?? 'IN';\n  const greetings = { IN: 'Namaste', FR: 'Bonjour', US: 'Hello' };\n  return Response.json({ message: (greetings[country] ?? 'Hello') + '!', country });\n}\n\n// app/api/orders/route.js - Node.js runtime (default) next to the database\nimport { prisma } from '@/lib/prisma';\nimport { auth } from '@/auth';\n\nexport const runtime = 'nodejs';   // explicit; Prisma needs Node APIs\n\nexport async function GET() {\n  const session = await auth();\n  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });\n  const orders = await prisma.order.findMany({ where: { userId: session.user.id }, take: 20 });\n  return Response.json(orders);\n}",
      playground: {
        jsx: "// SIMULATION: rough latency model (ms) to show why runtime placement matters.\nconst rtt = { // round trip between regions\n  'Mumbai-Mumbai': 5, 'Mumbai-Virginia': 190, 'Virginia-Virginia': 5, 'Paris-Virginia': 80, 'Paris-Paris': 5, 'Paris-Mumbai': 110, 'Virginia-Mumbai': 190, 'Mumbai-Paris': 110, 'Virginia-Paris': 80,\n};\nconst t = (a, b) => rtt[a + '-' + b];\n\nfunction App() {\n  const [user, setUser] = React.useState('Mumbai');\n  const [dbRegion, setDbRegion] = React.useState('Mumbai');\n  const [queries, setQueries] = React.useState(3);\n  // Edge function runs near the user; Node function runs in the region you configure (= DB region here)\n  const edgeNoDb = t(user, user);\n  const edgeWithDb = t(user, user) + queries * t(user, dbRegion);\n  const nodeWithDb = t(user, dbRegion) + queries * t(dbRegion, dbRegion);\n  const row = (label, ms) => <tr><td>{label}</td><td style={{ textAlign: 'right' }}><b>{ms} ms</b></td></tr>;\n  return (\n    <div style={{ fontFamily: 'sans-serif', fontSize: 14 }}>\n      User in <select value={user} onChange={(e) => setUser(e.target.value)}>{['Mumbai', 'Paris', 'Virginia'].map((r) => <option key={r}>{r}</option>)}</select>{' '}\n      DB in <select value={dbRegion} onChange={(e) => setDbRegion(e.target.value)}>{['Mumbai', 'Paris', 'Virginia'].map((r) => <option key={r}>{r}</option>)}</select>{' '}\n      DB queries per request <input type=\"number\" min=\"0\" max=\"10\" value={queries} onChange={(e) => setQueries(Number(e.target.value))} style={{ width: 50 }} />\n      <table cellPadding=\"4\" style={{ marginTop: 8 }}><tbody>\n        {row('Edge route, no database (/api/hello)', edgeNoDb)}\n        {row('Edge route + database queries', edgeWithDb)}\n        {row('Node.js route in DB region + database queries', nodeWithDb)}\n      </tbody></table>\n      <small>Model only: network round trips, ignoring compute and cold starts.</small>\n    </div>\n  );\n}",
      },
      result: 'User in Paris, DB in Mumbai, 3 queries: Edge + DB = 5 + 3x110 = 335 ms, Node.js in the DB region = 110 + 3x5 = 125 ms, Edge without DB = 5 ms.',
      explanation:
        'Edge wins when there is no far-away data (greetings, redirects, personalization from headers). As soon as a route makes several database calls, running it next to the database (Node.js in the same region) is faster, which is why Node.js is the default.',
    },
    {
      title: 'Static export for a documentation site',
      scenario: 'A small documentation site with no server features must be hosted on GitHub Pages / any static host.',
      steps: [
        'Set output: "export" (and images.unoptimized: true) in next.config.mjs',
        'Make sure dynamic routes have generateStaticParams',
        'Run npm run build: the out/ folder contains .html files',
        'Upload out/ to any static host (or deploy it with GitHub Pages)',
        'In the SIMULATION check which features are allowed with static export',
      ],
      code:
        "// next.config.mjs\nconst nextConfig = {\n  output: 'export',\n  trailingSlash: true,                 // /docs/intro/ -> out/docs/intro/index.html\n  images: { unoptimized: true },       // no image optimization server\n  // basePath: '/my-repo',             // for GitHub Pages project sites\n};\nexport default nextConfig;\n\n// app/docs/[slug]/page.js\nimport { getAllDocs, getDoc } from '@/lib/docs';\n\nexport async function generateStaticParams() {\n  const docs = await getAllDocs();\n  return docs.map((d) => ({ slug: d.slug }));   // every page is generated at build time\n}\n\nexport default async function DocPage({ params }) {\n  const { slug } = await params;\n  const doc = await getDoc(slug);\n  return <article dangerouslySetInnerHTML={{ __html: doc.html }} />;\n}",
      playground: {
        jsx: "// SIMULATION: a checklist of what works with output: 'export' (fully static) vs a Node server/Vercel.\nconst features = [\n  ['Server Components rendered at build time', true],\n  ['Client Components, useState, client fetching', true],\n  ['Dynamic routes WITH generateStaticParams', true],\n  ['Route Handlers with GET only (rendered at build)', true],\n  ['Server Actions', false],\n  ['Middleware', false],\n  ['ISR / revalidate', false],\n  ['cookies() / headers() per request', false],\n  ['Default next/image optimization', false],\n  ['Dynamic routes WITHOUT generateStaticParams', false],\n];\n\nfunction App() {\n  const [picked, setPicked] = React.useState([]);\n  const toggle = (i) => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));\n  const blocking = picked.filter((i) => !features[i][1]);\n  return (\n    <div style={{ fontFamily: 'sans-serif', fontSize: 14 }}>\n      <p>Tick the features your app uses:</p>\n      {features.map(([name], i) => (\n        <label key={name} style={{ display: 'block' }}><input type=\"checkbox\" checked={picked.includes(i)} onChange={() => toggle(i)} /> {name}</label>\n      ))}\n      <p style={{ fontWeight: 'bold', color: blocking.length ? 'crimson' : 'green' }}>\n        {blocking.length ? 'Cannot use output: \"export\" - deploy to Vercel or next start instead (' + blocking.length + ' blocking feature(s))' : 'OK for output: \"export\" - upload the out/ folder to any static host'}\n      </p>\n    </div>\n  );\n}",
      },
      result: 'Ticking only build-time features shows the green "OK for output: export" message. Ticking Server Actions or Middleware shows the red message explaining a server deployment is needed.',
      explanation:
        'Static export removes the server, so everything must be computable at build time. It is ideal for docs, portfolios and marketing sites; full-stack apps need Vercel, next start or a standalone Docker image.',
    },
  ],
  interview: [
    { q: 'What is the difference between server-only and NEXT_PUBLIC_ environment variables?', a: 'Variables without the prefix are available only in server code and are never sent to the browser. NEXT_PUBLIC_ variables are inlined into the client JavaScript at build time, so they are public and changing them requires a rebuild.', level: 'Easy' },
    { q: 'In which order does Next.js load .env files?', a: 'Real environment (process.env) first, then .env.$(NODE_ENV).local, .env.local (skipped in test), .env.$(NODE_ENV), then .env. The first place a variable is found wins.', level: 'Medium' },
    { q: 'What are Vercel preview deployments?', a: 'Every push to a non-production branch or pull request creates an immutable deployment with its own URL, using Preview environment variables. Teams review features on real infrastructure before merging; merging to main triggers the production deployment.', level: 'Easy' },
    { q: 'Edge runtime vs Node.js runtime?', a: 'Edge: V8 isolates in many locations, fast cold start, Web APIs only (no fs/native modules), small bundle limits, best for middleware and light personalization. Node.js: full Node APIs and npm ecosystem, works with ORMs and TCP databases, runs in one region; the default and best when close to the database.', level: 'Medium' },
    { q: 'How do you choose the runtime for a route?', a: 'With route segment config in the page/layout/route file: export const runtime = "edge" or "nodejs". The default is nodejs.', level: 'Easy' },
    { q: 'How do you run Prisma migrations when deploying?', a: 'Run prisma migrate deploy in the build command or in a CI step before deploying, and add a postinstall script prisma generate so the client is generated. Use a pooled connection string for serverless environments.', level: 'Medium' },
    { q: 'What does output: "standalone" do?', a: 'It makes next build trace and copy only the files and node_modules required at runtime into .next/standalone with a minimal server.js. This produces small Docker images; you also copy public and .next/static.', level: 'Medium' },
    { q: 'What are the limitations of output: "export"?', a: 'No server: no Server Actions, middleware, ISR, cookies/headers per request, dynamic routes without generateStaticParams, or default image optimization. Output is static HTML/CSS/JS in out/ for any static host.', level: 'Medium' },
    { q: 'Why validate environment variables at startup?', a: 'So a missing or malformed variable fails immediately with a clear message at build/boot time, instead of causing a confusing runtime error for users. zod or @t3-oss/env-nextjs are common choices.', level: 'Medium' },
    { q: 'Why can an Edge function be slower than a Node.js function?', a: 'The edge function runs near the user, but if it queries a database in a distant region, each query crosses the world. Several sequential queries multiply that latency; a Node.js function in the database region avoids it.', level: 'Hard' },
    { q: 'How do you roll back a bad production deployment on Vercel?', a: 'Use Instant Rollback / "Promote to Production" on a previous deployment in the dashboard (or vercel rollback / vercel promote with the CLI). Because deployments are immutable, this is instant without rebuilding.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create lib/env.js that validates DATABASE_URL, AUTH_SECRET and NEXT_PUBLIC_SITE_URL with zod and import it in next.config.mjs so the build fails if any is missing.',
      hint: 'Import the module in next.config.mjs to run validation at build time.',
      solution:
        "// lib/env.mjs\nimport { z } from 'zod';\nconst schema = z.object({\n  DATABASE_URL: z.string().url(),\n  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),\n  NEXT_PUBLIC_SITE_URL: z.string().url(),\n});\nconst parsed = schema.safeParse(process.env);\nif (!parsed.success) {\n  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);\n  throw new Error('Invalid environment variables');\n}\nexport const env = parsed.data;\n\n// next.config.mjs\nimport './lib/env.mjs';   // validates during next build / next dev\nconst nextConfig = {};\nexport default nextConfig;",
    },
    {
      task: 'Write the package.json scripts and a vercel.json-free setup so that Prisma client is generated and migrations run on every Vercel production build only.',
      hint: 'VERCEL_ENV is "production" | "preview" | "development" on Vercel.',
      solution:
        "// package.json\n{\n  \"scripts\": {\n    \"postinstall\": \"prisma generate\",\n    \"build\": \"node scripts/migrate.mjs && next build\",\n    \"start\": \"next start\"\n  }\n}\n\n// scripts/migrate.mjs\nimport { execSync } from 'node:child_process';\nif (process.env.VERCEL_ENV === 'production') {\n  console.log('Running prisma migrate deploy...');\n  execSync('npx prisma migrate deploy', { stdio: 'inherit' });\n} else {\n  console.log('Skipping migrations for', process.env.VERCEL_ENV ?? 'local');\n}",
    },
    {
      task: 'Create an Edge Route Handler /api/time that returns the current server time and the user\'s city from Vercel geo headers, with a Cache-Control of no-store.',
      hint: 'x-vercel-ip-city header (URL-encoded); export const runtime = "edge".',
      solution:
        "// app/api/time/route.js\nexport const runtime = 'edge';\n\nexport function GET(request) {\n  const city = decodeURIComponent(request.headers.get('x-vercel-ip-city') ?? 'Unknown');\n  return Response.json(\n    { now: new Date().toISOString(), city },\n    { headers: { 'Cache-Control': 'no-store' } }\n  );\n}",
    },
    {
      task: 'Write a Dockerfile and next.config.mjs change to self-host the app as a standalone container, and the commands to build and run it.',
      hint: 'output: "standalone"; copy .next/standalone, .next/static, public.',
      solution:
        "// next.config.mjs\nexport default { output: 'standalone' };\n\n# Dockerfile\nFROM node:22-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:22-alpine\nWORKDIR /app\nENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0\nCOPY --from=builder /app/.next/standalone ./\nCOPY --from=builder /app/.next/static ./.next/static\nCOPY --from=builder /app/public ./public\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]\n\n# Commands\n# docker build -t devblog .\n# docker run -p 3000:3000 --env-file .env.production devblog",
    },
    {
      task: 'List the pre-launch checklist items you would verify for a Next.js production deployment and implement one: a custom app/not-found.js and app/global-error.js.',
      hint: 'global-error must render its own <html> and <body> and be a Client Component.',
      solution:
        "// Checklist: env vars per environment; migrations applied; metadataBase + sitemap; security headers;\n// custom 404/500; error tracking; analytics/Speed Insights; region near DB; domain + HTTPS; backups.\n\n// app/not-found.js\nimport Link from 'next/link';\nexport default function NotFound() {\n  return (\n    <main>\n      <h1>404 - Page not found</h1>\n      <Link href=\"/\">Go home</Link>\n    </main>\n  );\n}\n\n// app/global-error.js\n'use client';\nexport default function GlobalError({ error, reset }) {\n  return (\n    <html lang=\"en\">\n      <body>\n        <h1>Something went wrong</h1>\n        <p>Error reference: {error.digest}</p>\n        <button onClick={() => reset()}>Try again</button>\n      </body>\n    </html>\n  );\n}",
    },
  ],
  quiz: [
    { question: 'Which variable can be read in a Client Component?', options: ['DATABASE_URL', 'AUTH_SECRET', 'NEXT_PUBLIC_SITE_URL', 'STRIPE_SECRET_KEY'], answer: 2, explanation: 'Only NEXT_PUBLIC_ variables are inlined into client bundles.' },
    { question: 'What does a push to a feature branch create on Vercel?', options: ['A preview deployment with its own URL', 'A production deployment', 'Nothing until merged', 'A static export'], answer: 0, explanation: 'Every non-production branch/PR gets a preview deployment.' },
    { question: 'Which API is NOT available in the Edge runtime?', options: ['fetch', 'Response', 'URL', 'fs (Node file system)'], answer: 3, explanation: 'Edge supports Web APIs only; fs is Node-specific.' },
    { question: 'Which next.config option produces a minimal folder for Docker?', options: ['output: "export"', 'output: "standalone"', 'runtime: "edge"', 'compress: true'], answer: 1, explanation: 'standalone traces only the needed files into .next/standalone.' },
    { question: 'After changing NEXT_PUBLIC_API_URL on Vercel, what is required?', options: ['Nothing, it updates live', 'Clearing browser cookies', 'Restarting the database', 'A new build / redeploy'], answer: 3, explanation: 'Public variables are inlined at build time.' },
  ],
};
