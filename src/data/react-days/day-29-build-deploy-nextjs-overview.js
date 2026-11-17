export default {
  id: 'day-29-build-deploy-nextjs-overview',
  title: 'Build and Deployment: Vite Build, Environment Variables, Netlify/Vercel and a Next.js Overview',
  module: 'Module 6: Professional React',
  day: 29,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Turn your React project into optimised static files, configure environment variables safely, deploy to Netlify or Vercel with SPA routing, and understand when a framework like Next.js (SSR, SSG, file-based routing, Server Components) is the better choice.',
  objectives: [
    'Create and preview a production build with Vite and understand the dist folder',
    'Use .env files and import.meta.env with the VITE_ prefix, and know what must never go in frontend env vars',
    'Deploy to Netlify and Vercel (Git-based and CLI) and fix refresh 404s for client-side routes',
    'Follow a pre-deployment checklist (performance, SEO basics, errors)',
    'Explain CSR vs SSR vs SSG and what Next.js adds (App Router, Server Components)',
  ],
  theory: [
    {
      heading: 'Development vs production build',
      content:
        '`npm run dev` starts a **development server**: fast refresh, readable code, helpful warnings, no optimisation. It is never used for real users.\n\n`npm run build` (runs `vite build`) creates a **production build** in the `dist/` folder:\n- JSX and modern syntax compiled for browsers\n- Code **minified** (shorter names, no whitespace) and **tree-shaken** (unused exports removed)\n- Files get **content hashes** in their names (`index-a1b2c3.js`) so browsers can cache them forever; a new deploy produces new names\n- Lazy chunks (Day 25) become separate files\n\n`npm run preview` serves `dist/` locally so you can test the real build before deploying.\n\nThe output is just **static files** (HTML, JS, CSS, images): they can be hosted on any static host or CDN.',
      syntax:
        "npm run build      # creates dist/\nnpm run preview    # serves dist/ at http://localhost:4173\n\n# dist/\n#   index.html\n#   assets/index-4f8c2a.js\n#   assets/index-9d1e77.css\n#   assets/Dashboard-21ab9c.js   <- lazy chunk",
    },
    {
      heading: 'Environment variables in Vite',
      content:
        'Different environments need different settings: a local API in development, the real API in production, an analytics key only in production.\n\nVite reads `.env` files from the project root:\n- `.env` (always), `.env.development`, `.env.production`, and `.env.local` (git-ignored, personal overrides)\n- Only variables starting with **`VITE_`** are exposed to your code, via `import.meta.env.VITE_API_URL`\n- Built-ins: `import.meta.env.MODE`, `import.meta.env.DEV`, `import.meta.env.PROD`, `import.meta.env.BASE_URL`\n\nValues are **inserted into the JavaScript bundle at build time**. Changing a variable requires a rebuild.\n\n**Security rule**: everything in a frontend bundle is public. Anyone can open DevTools and read it. **Never** put secrets (database passwords, private API keys, payment secret keys) in `VITE_` variables. Secrets belong on a server or in serverless functions.',
      syntax:
        "# .env.development\nVITE_API_URL=http://localhost:5000/api\n\n# .env.production\nVITE_API_URL=https://api.myshop.com\n\n// src/api.js\nconst API = import.meta.env.VITE_API_URL;\nexport const getProducts = () => fetch(API + '/products').then(r => r.json());",
      tip: 'Add .env.local and any file with real keys to .gitignore. On Netlify/Vercel, set the variables in the dashboard (Site settings > Environment variables) instead of committing them.',
    },
    {
      heading: 'Deploying to Netlify and Vercel',
      content:
        '**Git-based deploy (recommended)**:\n1. Push the project to GitHub\n2. In Netlify or Vercel, "Add new project" and import the repository\n3. Build command: `npm run build`; Output/publish directory: `dist`\n4. Add environment variables in the dashboard\n5. Every push to `main` deploys automatically; pull requests get **preview URLs**\n\n**CLI deploy**: `npx netlify deploy --prod --dir=dist` or `npx vercel --prod`.\n\n**SPA routing fix**: with BrowserRouter, refreshing `/products/5` asks the server for that path, which does not exist, so you get a 404. Tell the host to serve `index.html` for all paths:\n- Netlify: file `public/_redirects` with `/*  /index.html  200`\n- Vercel: `vercel.json` with a rewrite to `/index.html`\n\nOther options: GitHub Pages (set `base` in vite.config and use HashRouter or a 404.html trick), Cloudflare Pages, Firebase Hosting, AWS S3 + CloudFront.',
      syntax:
        "# public/_redirects  (Netlify)\n/*    /index.html   200\n\n// vercel.json  (Vercel)\n{\n  \"rewrites\": [{ \"source\": \"/(.*)\", \"destination\": \"/index.html\" }]\n}",
    },
    {
      heading: 'Pre-deployment checklist',
      content:
        '- `npm run build` has no errors; `npm run preview` works; tests and lint pass\n- No `console.log` noise or secrets in the bundle\n- Environment variables set on the host for production\n- Page `<title>`, meta description and favicon set (react-helmet-async or React 19 `<title>` in components for per-page titles)\n- Images compressed, routes lazy-loaded, Lighthouse score checked\n- Error Boundary at the top level and error tracking (e.g. Sentry) configured\n- SPA rewrite rule added; custom domain + HTTPS (automatic on Netlify/Vercel)\n- `base` set in vite.config if hosted in a sub-folder (e.g. GitHub Pages `/repo-name/`)',
    },
    {
      heading: 'CSR vs SSR vs SSG',
      content:
        'A Vite React app is **CSR (Client-Side Rendering)**: the server sends an almost empty HTML file; the browser downloads JS, then React builds the page. Simple and great for dashboards behind a login, but the first paint waits for JS and search engines/social previews see little HTML.\n\n- **SSR (Server-Side Rendering)**: the server runs React for each request and sends ready HTML; the browser then **hydrates** it (attaches event handlers). Faster first content, better SEO, needs a Node server.\n- **SSG (Static Site Generation)**: pages are rendered to HTML **at build time**. Fastest, cacheable on a CDN; good for blogs, docs, marketing pages.\n- **ISR (Incremental Static Regeneration)**: static pages re-generated in the background every N seconds.\n\nAnalogy: CSR is a flat-pack furniture delivery (you assemble at home). SSR is a ready-assembled table delivered on order. SSG is a showroom table already built and waiting.',
    },
    {
      heading: 'Next.js overview',
      content:
        '**Next.js** is a React **framework** (by Vercel) that adds what plain React leaves to you:\n- **File-based routing** (App Router): `app/page.jsx` is `/`, `app/blog/[slug]/page.jsx` is `/blog/:slug`; `layout.jsx` files create nested layouts\n- **Rendering choice per page**: SSR, SSG, ISR or client rendering\n- **React Server Components** (default in the App Router): components that run only on the server, can read databases directly and send zero JS to the browser; add `\'use client\'` at the top of a file for interactive components that use state/effects\n- **Server Actions**, API route handlers, image/font optimisation, metadata API for SEO\n\nWhen to choose what:\n- Vite + React: SPAs, dashboards, internal tools, apps behind login, learning React\n- Next.js (or Remix/React Router framework mode): public sites needing SEO, content-heavy sites, e-commerce, full-stack apps\n\nThe playground cannot run a server, so the examples below demonstrate env config and the CSR vs SSR idea in plain React, while the code blocks show real config files and Next.js code.\n\nComing next: Day 30, the final project, practical test and interview revision.',
      syntax:
        "// app/page.jsx  (Next.js App Router, Server Component by default)\nexport default async function Home() {\n  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3', { next: { revalidate: 60 } });\n  const posts = await res.json();\n  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n}\n\n// app/components/LikeButton.jsx\n'use client';\nimport { useState } from 'react';\nexport default function LikeButton() {\n  const [likes, setLikes] = useState(0);\n  return <button onClick={() => setLikes(l => l + 1)}>Like {likes}</button>;\n}",
    },
  ],
  examples: [
    {
      title: 'Environment-based configuration',
      scenario: 'The app uses a different API URL and shows a debug banner only in development. The playground simulates import.meta.env with a mode switch.',
      steps: [
        'Create .env.development and .env.production with VITE_API_URL',
        'Read import.meta.env.VITE_API_URL in a config.js module',
        'Show a debug banner only when import.meta.env.DEV is true',
        'Run npm run dev and npm run build && npm run preview to see both modes',
        'In the playground, switch the simulated mode',
      ],
      code: `# .env.development
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ShopKart (dev)

# .env.production
VITE_API_URL=https://api.shopkart.com
VITE_APP_NAME=ShopKart

// src/config.js
export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  appName: import.meta.env.VITE_APP_NAME,
  isDev: import.meta.env.DEV,
};

// src/App.jsx
import { config } from './config';
export default function App() {
  return (
    <>
      {config.isDev && <div className="debug">DEV MODE - API: {config.apiUrl}</div>}
      <h1>{config.appName}</h1>
    </>
  );
}`,
      playground: {
        jsx: `// Simulated import.meta.env values for each mode (Vite injects these at build time)
const ENV = {
  development: { MODE: 'development', DEV: true, PROD: false, VITE_API_URL: 'http://localhost:5000/api', VITE_APP_NAME: 'ShopKart (dev)' },
  production: { MODE: 'production', DEV: false, PROD: true, VITE_API_URL: 'https://api.shopkart.com', VITE_APP_NAME: 'ShopKart' },
};

function App() {
  const [mode, setMode] = React.useState('development');
  const env = ENV[mode];
  const config = { apiUrl: env.VITE_API_URL, appName: env.VITE_APP_NAME, isDev: env.DEV };
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <label>
        Simulated build mode:{' '}
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="development">development (npm run dev)</option>
          <option value="production">production (npm run build)</option>
        </select>
      </label>
      {config.isDev && (
        <div style={{ background: '#fde68a', padding: 6, marginTop: 8 }}>DEV MODE - API: {config.apiUrl}</div>
      )}
      <h2>{config.appName}</h2>
      <p>Products will be fetched from: <code>{config.apiUrl}/products</code></p>
      <p style={{ color: '#b91c1c' }}><small>Remember: every VITE_ variable is visible in the browser. Never store secrets here.</small></p>
    </div>
  );
}`,
      },
      result: 'In development mode a yellow DEV banner and the localhost API URL appear. Switching to production hides the banner and shows the production API URL and app name.',
      explanation:
        'Vite replaces import.meta.env.X with literal values during the build, so the production bundle contains only production values. Only VITE_-prefixed variables are exposed, and they are public.',
    },
    {
      title: 'Deploying a React Router app to Netlify and Vercel',
      scenario: 'Deploy a Vite + React Router app and make sure refreshing a deep link like /products/3 works. The playground shows an interactive deployment checklist.',
      steps: [
        'Add public/_redirects (Netlify) or vercel.json (Vercel)',
        'Run npm run build and npm run preview locally',
        'Push to GitHub and import the repo in Netlify or Vercel',
        'Set build command npm run build and output directory dist',
        'Add environment variables in the dashboard and deploy',
        'Open a deep link and refresh it to confirm there is no 404',
      ],
      code: `# Project structure
my-shop/
  public/
    _redirects            # Netlify: /*  /index.html  200
  src/
  index.html
  package.json            # "build": "vite build", "preview": "vite preview"
  vercel.json             # Vercel rewrites
  vite.config.js

// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}

# netlify.toml (alternative to _redirects)
[build]
  command = "npm run build"
  publish = "dist"
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# CLI deploys
npx netlify deploy --prod --dir=dist
npx vercel --prod`,
      playground: {
        jsx: `const STEPS = [
  { id: 'build', text: 'npm run build completes without errors' },
  { id: 'preview', text: 'npm run preview: app works from dist/' },
  { id: 'env', text: 'Production env vars set in the host dashboard (no secrets in VITE_)' },
  { id: 'rewrite', text: 'SPA rewrite added (_redirects or vercel.json)' },
  { id: 'meta', text: 'Title, meta description and favicon set' },
  { id: 'perf', text: 'Lighthouse checked; routes lazy-loaded; images compressed' },
  { id: 'errors', text: 'Top-level Error Boundary and error tracking configured' },
  { id: 'deeplink', text: 'Refreshing a deep link (e.g. /products/3) works on the live URL' },
];

function App() {
  const [done, setDone] = React.useState({});
  const count = STEPS.filter(s => done[s.id]).length;
  const pct = Math.round((count / STEPS.length) * 100);
  const toggle = id => setDone(d => ({ ...d, [id]: !d[id] }));
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 480 }}>
      <h3>Deployment checklist</h3>
      <div style={{ background: '#e5e7eb', borderRadius: 6, height: 12 }}>
        <div style={{ width: pct + '%', background: pct === 100 ? '#16a34a' : '#2563eb', height: 12, borderRadius: 6, transition: 'width .3s' }} />
      </div>
      <p>{count} / {STEPS.length} done ({pct}%)</p>
      {STEPS.map(s => (
        <label key={s.id} style={{ display: 'block', margin: '6px 0' }}>
          <input type="checkbox" checked={!!done[s.id]} onChange={() => toggle(s.id)} /> {s.text}
        </label>
      ))}
      {pct === 100 && <p style={{ color: '#16a34a', fontWeight: 'bold' }}>Ready to ship!</p>}
    </div>
  );
}`,
      },
      result: 'A checklist with a progress bar. Ticking items fills the bar; when all eight are ticked it turns green and shows "Ready to ship!".',
      explanation:
        'The rewrite rule is the most commonly forgotten step: without it, client-side routes work when navigating inside the app but give a 404 on refresh or when shared, because the host looks for a real file at that path.',
    },
    {
      title: 'CSR vs SSR: what the user sees first',
      scenario: 'Simulate the difference: CSR shows a blank page until JS loads and data is fetched; SSR sends HTML that is visible immediately, then hydrates to become interactive.',
      steps: [
        'Read the Next.js code to see a Server Component fetching data',
        'In the playground, click "Simulate CSR" and "Simulate SSR"',
        'Compare when content becomes visible and when the button becomes interactive',
      ],
      code: `// Next.js App Router: app/products/page.jsx (runs on the server)
import AddToCart from './AddToCart';

export const metadata = { title: 'Products | ShopKart' };

export default async function ProductsPage() {
  const res = await fetch('https://fakestoreapi.com/products?limit=3', { next: { revalidate: 3600 } });
  const products = await res.json();       // HTML is generated with this data
  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>{p.title} <AddToCart id={p.id} /></li>
      ))}
    </ul>
  );
}

// app/products/AddToCart.jsx
'use client';                               // interactive part only
import { useState } from 'react';
export default function AddToCart({ id }) {
  const [added, setAdded] = useState(false);
  return <button onClick={() => setAdded(true)}>{added ? 'Added' : 'Add to cart'}</button>;
}`,
      playground: {
        jsx: `const PRODUCTS = ['Running Shoes', 'Smart Watch', 'Backpack'];
const wait = ms => new Promise(r => setTimeout(r, ms));

function Timeline({ events }) {
  return <ol style={{ fontSize: 13, color: '#555' }}>{events.map((e, i) => <li key={i}>{e}</li>)}</ol>;
}

function App() {
  const [mode, setMode] = React.useState(null);
  const [html, setHtml] = React.useState(null);      // what is visible
  const [interactive, setInteractive] = React.useState(false);
  const [events, setEvents] = React.useState([]);
  const [added, setAdded] = React.useState({});
  const log = (t0, msg) => setEvents(ev => [...ev, (Date.now() - t0) + ' ms: ' + msg]);

  async function simulate(kind) {
    const t0 = Date.now();
    setMode(kind); setHtml(null); setInteractive(false); setEvents([]); setAdded({});
    if (kind === 'CSR') {
      log(t0, 'Browser receives empty index.html (blank screen)');
      await wait(800); log(t0, 'JS bundle downloaded and executed');
      await wait(700); log(t0, 'Data fetched from API, React renders content');
      setHtml(PRODUCTS); setInteractive(true);
    } else {
      await wait(400); log(t0, 'Server fetched data and sent full HTML: content visible');
      setHtml(PRODUCTS);
      await wait(800); log(t0, 'JS loaded and hydrated: buttons now interactive');
      setInteractive(true);
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <button onClick={() => simulate('CSR')}>Simulate CSR (Vite SPA)</button>{' '}
      <button onClick={() => simulate('SSR')}>Simulate SSR (Next.js)</button>
      {mode && (
        <div style={{ border: '1px solid #ccc', minHeight: 110, padding: 10, marginTop: 10 }}>
          <b>{mode}</b>
          {!html && <p style={{ color: '#aaa' }}>(blank page...)</p>}
          {html && (
            <ul>
              {html.map(p => (
                <li key={p}>
                  {p}{' '}
                  <button disabled={!interactive} onClick={() => setAdded(a => ({ ...a, [p]: true }))}>
                    {added[p] ? 'Added' : interactive ? 'Add to cart' : 'Add to cart (not hydrated yet)'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <Timeline events={events} />
    </div>
  );
}`,
      },
      result: 'CSR: a blank box for about 1.5 s, then products and working buttons appear together. SSR: products appear after about 0.4 s with disabled buttons ("not hydrated yet"), which become clickable after hydration. A timeline lists each step with timings.',
      explanation:
        'SSR improves the time to first visible content and gives search engines real HTML; hydration then attaches React event handlers. CSR is simpler to host (static files) but users and crawlers wait for JavaScript before seeing content.',
    },
  ],
  interview: [
    { q: 'What does npm run build do in a Vite React project?', a: 'Runs vite build: bundles, transpiles, minifies and tree-shakes the code, splits chunks and outputs hashed static files into dist/ ready for deployment.', level: 'Easy' },
    { q: 'Why do built files have hashes in their names?', a: 'Content hashing changes the filename whenever content changes, enabling long-term browser/CDN caching while guaranteeing users get new files after a deploy (cache busting).', level: 'Medium' },
    { q: 'How do environment variables work in Vite?', a: 'Vite loads .env files by mode and exposes only VITE_-prefixed variables via import.meta.env. They are statically replaced in the bundle at build time.', level: 'Medium' },
    { q: 'Can you store an API secret key in a VITE_ env variable?', a: 'No. Everything in the frontend bundle is publicly visible. Secrets must stay on a backend or serverless function that the frontend calls.', level: 'Easy' },
    { q: 'Why does refreshing /about on a deployed React Router app return 404, and how do you fix it?', a: 'The static host looks for a file at /about which does not exist. Configure a rewrite/fallback so all paths serve index.html (Netlify _redirects "/* /index.html 200", Vercel rewrites), or use HashRouter.', level: 'Medium' },
    { q: 'What is the difference between npm run dev and npm run preview?', a: 'dev runs the unbundled development server with HMR; preview serves the already built dist/ folder to test the production build locally.', level: 'Easy' },
    { q: 'Explain CSR, SSR and SSG.', a: 'CSR renders in the browser after JS loads. SSR renders HTML on the server per request and hydrates on the client. SSG pre-renders HTML at build time and serves static files.', level: 'Medium' },
    { q: 'What is hydration?', a: 'The process where React, on the client, attaches event handlers and state to HTML that was rendered on the server, making it interactive without re-creating the DOM.', level: 'Medium' },
    { q: 'What is Next.js and when would you use it over Vite + React?', a: 'A full-stack React framework with file-based routing, SSR/SSG/ISR, Server Components, API routes and optimisations. Use it for SEO-sensitive public sites, content and e-commerce, or full-stack apps; Vite SPAs suit dashboards and apps behind login.', level: 'Medium' },
    { q: 'What are React Server Components?', a: 'Components that render only on the server, can access server resources directly (DB, files), and send no JavaScript to the client. Interactive components are marked with "use client".', level: 'Hard' },
    { q: 'What does "use client" mean in Next.js?', a: 'It marks a module (and its imports) as a Client Component boundary: it is bundled for the browser and may use state, effects and event handlers.', level: 'Hard' },
    { q: 'How do preview deployments help a team?', a: 'Each pull request gets its own live URL built from that branch, so reviewers, designers and QA can test changes before merging to production.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Configure a Vite app with .env.development and .env.production for VITE_API_URL, create an api.js that uses it, and log the mode at startup.',
      hint: 'import.meta.env.MODE and import.meta.env.VITE_API_URL.',
      solution: `# .env.development
VITE_API_URL=http://localhost:4000

# .env.production
VITE_API_URL=https://api.example.com

// src/api.js
const BASE = import.meta.env.VITE_API_URL;
export async function getJSON(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

// src/main.jsx
console.log('Running in', import.meta.env.MODE, 'mode, API =', import.meta.env.VITE_API_URL);`,
    },
    {
      task: 'Prepare a React Router Vite app for Netlify: netlify.toml with build settings and SPA redirect, then list the CLI commands to deploy.',
      hint: 'publish = "dist" and a redirect from /* to /index.html with status 200.',
      solution: `# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Terminal
npm run build
npm run preview          # check locally
npm install -g netlify-cli
netlify login
netlify deploy --dir=dist          # draft URL
netlify deploy --prod --dir=dist   # production`,
    },
    {
      task: 'Deploy to GitHub Pages at https://USERNAME.github.io/my-app/. Configure Vite base, switch to HashRouter (or explain the 404.html alternative) and add a deploy script with gh-pages.',
      hint: 'base: "/my-app/" in vite.config.js; npm install -D gh-pages.',
      solution: `// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: '/my-app/',
});

// main.jsx: HashRouter avoids server 404s on GitHub Pages
import { HashRouter } from 'react-router-dom';
ReactDOM.createRoot(document.getElementById('root')).render(<HashRouter><App /></HashRouter>);

// package.json
{
  "scripts": {
    "build": "vite build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}

// Terminal
npm install -D gh-pages
npm run deploy
// Alternative to HashRouter: copy dist/index.html to dist/404.html after build.`,
    },
    {
      task: 'Sketch a Next.js App Router structure for a blog: home page, blog list, blog post by slug (SSG with generateStaticParams) and a client-side LikeButton.',
      hint: 'app/blog/[slug]/page.jsx and "use client" for the button.',
      solution: `// app/layout.jsx
export const metadata = { title: 'My Blog' };
export default function RootLayout({ children }) {
  return <html lang="en"><body><nav>My Blog</nav>{children}</body></html>;
}

// app/page.jsx
export default function Home() { return <h1>Welcome</h1>; }

// app/blog/page.jsx
import Link from 'next/link';
import { getPosts } from '@/lib/posts';
export default async function Blog() {
  const posts = await getPosts();
  return <ul>{posts.map(p => <li key={p.slug}><Link href={'/blog/' + p.slug}>{p.title}</Link></li>)}</ul>;
}

// app/blog/[slug]/page.jsx
import { getPosts, getPost } from '@/lib/posts';
import LikeButton from './LikeButton';
export async function generateStaticParams() {
  return (await getPosts()).map(p => ({ slug: p.slug }));   // pre-render at build time (SSG)
}
export default async function Post({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article><h1>{post.title}</h1><p>{post.body}</p><LikeButton /></article>;
}

// app/blog/[slug]/LikeButton.jsx
'use client';
import { useState } from 'react';
export default function LikeButton() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>Like ({n})</button>;
}`,
    },
  ],
  quiz: [
    {
      question: 'Which folder does vite build output by default?',
      options: ['build/', 'public/', 'dist/', 'out/'],
      answer: 2,
      explanation: 'Vite writes the production build to dist/.',
    },
    {
      question: 'Which variable is exposed to client code by Vite?',
      options: ['VITE_API_URL', 'API_URL', 'REACT_APP_API_URL', 'SECRET_KEY'],
      answer: 0,
      explanation: 'Only variables prefixed with VITE_ are exposed via import.meta.env.',
    },
    {
      question: 'What fixes 404 errors when refreshing client-side routes on Netlify?',
      options: ['Adding more Routes', 'Using <a> tags', 'Setting NODE_ENV', 'A /* -> /index.html 200 rewrite'],
      answer: 3,
      explanation: 'The rewrite makes the server return index.html for every path.',
    },
    {
      question: 'Which rendering strategy generates HTML at build time?',
      options: ['CSR', 'SSG', 'SSR', 'Hydration'],
      answer: 1,
      explanation: 'Static Site Generation pre-renders pages during the build.',
    },
    {
      question: 'In the Next.js App Router, how do you mark a component that uses useState?',
      options: ["Add 'use client' at the top of the file", 'Name the file client.jsx', 'Wrap it in <Client>', 'Nothing; all components are client components'],
      answer: 0,
      explanation: 'Components are Server Components by default; "use client" opts into client rendering.',
    },
  ],
};
