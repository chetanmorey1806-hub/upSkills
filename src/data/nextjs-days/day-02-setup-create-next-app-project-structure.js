export default {
  id: 'day-02-setup-create-next-app-project-structure',
  title: 'Setup with create-next-app, Project Structure, App Router',
  module: 'Module 1: Next.js Basics',
  day: 2,
  level: 'Beginner',
  duration: '1.5 hours',
  summary:
    'Create your first Next.js 15 project with create-next-app, understand every file and folder it generates, and learn how the App Router turns the app/ folder into URLs.',
  objectives: [
    'Install Node.js 18.18+ (22 LTS recommended) and create a project with npx create-next-app@latest',
    'Understand the prompts: TypeScript, ESLint, Tailwind, src/ directory, App Router, Turbopack, import alias',
    'Explain the purpose of app/, public/, next.config.mjs, package.json and the special files layout.js and page.js',
    'Run the dev server, production build and production server with npm scripts',
    'Know the App Router reserved file names (page, layout, loading, error, not-found, route)',
  ],
  theory: [
    {
      heading: 'Prerequisites and creating the project',
      content:
        'Next.js 15 needs **Node.js 18.18 or later**; use **Node 22 LTS**. Check with `node -v`.\n\nThe official starter is **create-next-app**. It downloads the latest template, installs `next`, `react` and `react-dom`, and asks a few questions:\n\n1. Project name → becomes the folder name\n2. TypeScript? → this course uses JavaScript (No) to stay beginner-friendly; the concepts are identical\n3. ESLint? → Yes (catches mistakes)\n4. Tailwind CSS? → Yes (we use it on Day 6)\n5. `src/` directory? → No (keeps `app/` at the root; both work)\n6. App Router? → **Yes** (recommended; the Pages Router is the legacy system)\n7. Turbopack for `next dev`? → Yes (faster Rust-based dev bundler)\n8. Customise import alias? → No (default `@/*`)\n\nAnalogy: create-next-app is like buying a flat with the kitchen already fitted. You can still rearrange furniture, but the plumbing (build tools, config) already works.',
      syntax:
        'npx create-next-app@latest my-shop\ncd my-shop\nnpm run dev\n# open http://localhost:3000',
      tip: 'Skip the questions with flags: npx create-next-app@latest my-shop --js --eslint --tailwind --app --no-src-dir --turbopack --import-alias "@/*"',
    },
    {
      heading: 'The generated project structure',
      content:
        'A fresh JavaScript project looks like this:\n\n- `app/` → **the App Router**. Every route lives here\n- `app/layout.js` → the **root layout**: the `<html>` and `<body>` shell shared by every page (required)\n- `app/page.js` → the home page for URL `/`\n- `app/globals.css` → global styles, imported once in the root layout\n- `app/favicon.ico` → the tab icon (a special metadata file)\n- `public/` → static files served as-is from the site root: `public/logo.png` → `/logo.png`\n- `next.config.mjs` → Next.js configuration (images, redirects, etc.)\n- `package.json` → dependencies and scripts\n- `jsconfig.json` → the `@/` import alias\n- `eslint.config.mjs`, `postcss.config.mjs` → linting and Tailwind tooling\n- `.next/` → build output (generated; never edit or commit)\n- `node_modules/` → installed packages (never commit)',
      points: [
        'Only page.js (or route.js) makes a folder publicly reachable as a URL',
        'Other files in app/ (components, utils) are safe to colocate: they are not routes',
        'public/ is for files whose URL must stay stable, like robots.txt or logos',
      ],
    },
    {
      heading: 'npm scripts: dev, build, start, lint',
      content:
        '`package.json` gets four scripts:\n- `npm run dev` → `next dev --turbopack`: development server with Fast Refresh on http://localhost:3000. Pages are compiled on demand, errors appear in an overlay\n- `npm run build` → `next build`: production build. Pre-renders static pages, bundles and minifies, prints a route table (○ Static, ƒ Dynamic)\n- `npm start` → `next start`: serves the production build (run `build` first)\n- `npm run lint` → runs ESLint with the Next.js rules\n\nNever judge performance in `dev` mode: it is deliberately slower and does extra checks. Always test speed with `build` + `start`.',
      syntax:
        '{\n  "scripts": {\n    "dev": "next dev --turbopack",\n    "build": "next build",\n    "start": "next start",\n    "lint": "next lint"\n  },\n  "dependencies": {\n    "next": "15.x",\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0"\n  }\n}',
    },
    {
      heading: 'The App Router and its special file names',
      content:
        'In the App Router, **folders define URL segments** and **special files define the UI** for that segment:\n- `page.js` → the unique UI of a route; makes the route public\n- `layout.js` → shared UI that wraps the page and child routes; keeps state across navigation\n- `loading.js` → instant loading UI (Day 9)\n- `error.js` → error boundary UI (Day 9)\n- `not-found.js` → 404 UI (Day 9)\n- `route.js` → an API endpoint instead of a page (Day 10)\n- `template.js`, `default.js` → advanced cases\n\nSo `app/about/page.js` → `/about`, and `app/blog/first-post/page.js` → `/blog/first-post`.\n\nEvery component in `app/` is a **React Server Component** by default: it runs on the server and sends HTML, not JavaScript. You opt into browser code with `"use client"` (Day 5).',
      tip: 'A common beginner mistake is creating app/about.js and expecting /about to work. It will not. The route must be a FOLDER containing page.js: app/about/page.js.',
    },
    {
      heading: 'The root layout and the first page',
      content:
        'The root layout is **mandatory** and must render `<html>` and `<body>`. Next.js injects the `<head>` tags for you based on the `metadata` export.\n\nThe page component is just a React component exported as **default**. Because it is a Server Component it can even be `async` and fetch data directly (Day 7).\n\nThe `@/` alias (from `jsconfig.json`) lets you write `import Header from \'@/components/Header\'` instead of long `../../` paths.',
      syntax:
        "// app/layout.js\nimport './globals.css';\n\nexport const metadata = {\n  title: 'My Shop',\n  description: 'Learning Next.js 15',\n};\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=\"en\">\n      <body>{children}</body>\n    </html>\n  );\n}\n\n// app/page.js\nexport default function Home() {\n  return <h1>Welcome to My Shop</h1>;\n}",
    },
  ],
  examples: [
    {
      title: 'Create and run your first Next.js 15 app',
      scenario: 'You start a new project for a small shop and want to see it running locally.',
      steps: [
        'Run npx create-next-app@latest my-shop and answer the prompts (App Router: Yes)',
        'cd my-shop',
        'npm run dev',
        'Open http://localhost:3000',
        'Replace the contents of app/page.js with your own heading and save: the browser updates instantly (Fast Refresh)',
      ],
      code: `$ npx create-next-app@latest my-shop
✔ Would you like to use TypeScript? … No
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like your code inside a \`src/\` directory? … No
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to use Turbopack for \`next dev\`? … Yes
✔ Would you like to customize the import alias (\`@/*\` by default)? … No

$ cd my-shop && npm run dev
  ▲ Next.js 15.x (Turbopack)
  - Local:   http://localhost:3000
 ✓ Ready in 1.2s

// app/page.js
export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>My Shop</h1>
      <p>Built with Next.js 15 and the App Router.</p>
    </main>
  );
}`,
      result: 'http://localhost:3000 shows "My Shop" and editing page.js updates the browser without a full reload.',
      explanation:
        'create-next-app scaffolds the app/ directory with a root layout and home page. next dev compiles routes on demand and Fast Refresh preserves component state while you edit.',
    },
    {
      title: 'Explore the project structure (interactive)',
      scenario: 'A new teammate asks what each generated file does. You click through a file explorer.',
      steps: [
        'Open the playground (a simulation of the project explorer)',
        'Click each file to read its purpose and sample content',
        'Notice which files create URLs and which do not',
      ],
      code: `my-shop/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js        <- root layout (html, body)
│   └── page.js          <- route "/"
├── public/
│   ├── next.svg         <- served at /next.svg
│   └── vercel.svg
├── eslint.config.mjs
├── jsconfig.json        <- "@/*" alias
├── next.config.mjs
├── package.json
└── postcss.config.mjs`,
      playground: {
        jsx: `// SIMULATION: a clickable explorer of a fresh create-next-app project (plain React).
const { useState } = React;

const FILES = {
  'app/layout.js': { url: '(wraps every page)', info: 'Root layout. Must render <html> and <body>. Imports globals.css and exports metadata.' },
  'app/page.js': { url: '/', info: 'Home page. Default export is a React Server Component.' },
  'app/globals.css': { url: '-', info: 'Global CSS. Imported once in the root layout.' },
  'app/favicon.ico': { url: '/favicon.ico', info: 'Special metadata file: becomes the tab icon automatically.' },
  'public/next.svg': { url: '/next.svg', info: 'Static asset. Everything in public/ is served from the site root.' },
  'next.config.mjs': { url: '-', info: 'Next.js configuration: images, redirects, headers, experimental flags.' },
  'package.json': { url: '-', info: 'Scripts: dev, build, start, lint. Dependencies: next, react, react-dom.' },
  'jsconfig.json': { url: '-', info: 'Defines the @/* import alias, e.g. import Btn from "@/components/Btn".' },
  '.next/': { url: '-', info: 'Generated build output. Never edit or commit (it is in .gitignore).' },
};

function App() {
  const [sel, setSel] = useState('app/page.js');
  return (
    <div style={{ display: 'flex', gap: 16, fontFamily: 'system-ui', padding: 16 }}>
      <ul style={{ listStyle: 'none', padding: 0, minWidth: 170 }}>
        {Object.keys(FILES).map((f) => (
          <li key={f}>
            <button onClick={() => setSel(f)}
              style={{ width: '100%', textAlign: 'left', marginBottom: 4, background: f === sel ? '#0070f3' : '#eee', color: f === sel ? '#fff' : '#000', border: 0, padding: 6 }}>
              {f}
            </button>
          </li>
        ))}
      </ul>
      <div>
        <h3>{sel}</h3>
        <p>{FILES[sel].info}</p>
        <p>Public URL: <code>{FILES[sel].url}</code></p>
      </div>
    </div>
  );
}`,
      },
      result: 'Clicking a file shows its purpose and whether it creates a public URL (e.g. app/page.js → /, public/next.svg → /next.svg).',
      explanation:
        'Only page.js files and files in public/ (and special metadata files like favicon.ico) become reachable URLs. Config and build folders are tooling, not routes.',
    },
    {
      title: 'Folders become URLs: building three routes',
      scenario: 'The shop needs /, /about and /contact pages.',
      steps: [
        'Create the folder app/about and the file app/about/page.js',
        'Create app/contact/page.js',
        'Visit /about and /contact',
        'Try the playground: type a path and see which file Next.js would render',
      ],
      code: `// app/about/page.js
export default function About() {
  return <h1>About our shop</h1>;
}

// app/contact/page.js
export default function Contact() {
  return (
    <section>
      <h1>Contact</h1>
      <p>Email: support@myshop.in</p>
    </section>
  );
}

// Result
// app/page.js          -> /
// app/about/page.js    -> /about
// app/contact/page.js  -> /contact`,
      playground: {
        jsx: `// SIMULATION of the App Router's file -> URL matching (plain React).
const { useState } = React;
const ROUTES = ['app/page.js', 'app/about/page.js', 'app/contact/page.js', 'app/blog/first-post/page.js'];

function fileToUrl(file) {
  const path = file.replace(/^app/, '').replace(/\\/page\\.js$/, '');
  return path === '' ? '/' : path;
}

function App() {
  const [url, setUrl] = useState('/about');
  const match = ROUTES.find((f) => fileToUrl(f) === url);
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h2>Which file renders this URL?</h2>
      <input value={url} onChange={(e) => setUrl(e.target.value)} style={{ padding: 6, width: 220 }} />
      <p>{match ? <span>Renders <code>{match}</code></span> : <b style={{ color: 'crimson' }}>404 - no page.js for this path</b>}</p>
      <h4>Route table</h4>
      <table border="1" cellPadding="4">
        <tbody>
          {ROUTES.map((f) => <tr key={f}><td>{f}</td><td>{fileToUrl(f)}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}`,
      },
      result: 'Typing /about shows app/about/page.js; typing /pricing shows a 404 message.',
      explanation:
        'The App Router strips app/ and /page.js from the file path to get the URL. If no folder with a page.js matches, Next.js renders the 404 page.',
    },
    {
      title: 'Production build and route table',
      scenario: 'Before deploying, you build the app and read the output.',
      steps: [
        'Stop the dev server (Ctrl+C)',
        'Run npm run build',
        'Read the route table and First Load JS sizes',
        'Run npm start and open http://localhost:3000',
      ],
      code: `$ npm run build
   ▲ Next.js 15.x
   Creating an optimized production build ...
 ✓ Compiled successfully
 ✓ Generating static pages (6/6)

Route (app)                    Size     First Load JS
┌ ○ /                          5.4 kB        105 kB
├ ○ /_not-found                977 B         101 kB
├ ○ /about                     142 B         100 kB
└ ○ /contact                   142 B         100 kB
+ First Load JS shared by all  100 kB

○  (Static)  prerendered as static content

$ npm start
   ▲ Next.js 15.x
   - Local: http://localhost:3000`,
      result: 'All three pages are marked ○ Static because they have no dynamic data; npm start serves the optimised build.',
      explanation:
        'next build pre-renders pages that do not need request-time data, producing HTML files. First Load JS is the JavaScript a visitor downloads for that route; Server Components keep it small.',
    },
  ],
  interview: [
    { q: 'How do you create a new Next.js project?', a: 'Run npx create-next-app@latest <name>, answer the prompts (TypeScript, ESLint, Tailwind, src dir, App Router, Turbopack, alias), then cd into the folder and run npm run dev.', level: 'Easy' },
    { q: 'What is the minimum Node.js version for Next.js 15?', a: 'Node.js 18.18 or later. In practice use the current LTS (Node 22).', level: 'Easy' },
    { q: 'What is the purpose of app/layout.js?', a: 'It is the required root layout. It renders the <html> and <body> tags, wraps every page through the children prop, is a good place for global CSS imports and shared UI, and can export metadata.', level: 'Easy' },
    { q: 'What is the public folder used for?', a: 'Static assets served as-is from the root URL. public/images/logo.png is available at /images/logo.png. Do not put secrets there; everything in it is public.', level: 'Easy' },
    { q: 'What is the difference between npm run dev and npm run build + npm start?', a: 'dev runs a development server with on-demand compilation, Fast Refresh and extra checks. build creates an optimised production build (pre-rendering static pages, minifying, code splitting) and start serves that build. Measure performance only in production mode.', level: 'Medium' },
    { q: 'Why does app/about.js not create the /about route?', a: 'In the App Router, routes are folders and a route only becomes public when the folder contains a page.js (or route.js). It must be app/about/page.js.', level: 'Medium' },
    { q: 'Can you put components inside the app folder?', a: 'Yes. Files that are not special file names (page, layout, route, etc.) are not routable, so app/about/Team.js is safe to colocate. Many teams still keep shared components in a top-level components/ folder.', level: 'Medium' },
    { q: 'What is Turbopack?', a: 'A Rust-based incremental bundler made by Vercel, the successor to webpack for Next.js. In Next.js 15, next dev --turbopack is stable and much faster to start and refresh.', level: 'Medium' },
    { q: 'What does the .next folder contain and should you commit it?', a: 'It is the build and dev cache output: compiled server and client bundles, pre-rendered HTML, the data cache. It is generated, so it must not be committed (it is in .gitignore).', level: 'Easy' },
    { q: 'What do the symbols ○ and ƒ mean in the build output?', a: '○ means Static: the route was pre-rendered at build time. ƒ means Dynamic: the route is server-rendered on demand per request.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a Next.js 15 project named portfolio without answering prompts interactively (JavaScript, ESLint, Tailwind, App Router, no src dir, Turbopack).',
      hint: 'create-next-app accepts flags.',
      solution: `npx create-next-app@latest portfolio --js --eslint --tailwind --app --no-src-dir --turbopack --import-alias "@/*"
cd portfolio
npm run dev`,
    },
    {
      task: 'Add three routes: /about, /projects and /contact, each with an h1 and one paragraph. Then update the home page with plain <a> links to them.',
      hint: 'One folder + page.js per route. (Next.js <Link> comes on Day 4.)',
      solution: `// app/about/page.js
export default function About() {
  return (<main><h1>About</h1><p>I am a full-stack developer.</p></main>);
}

// app/projects/page.js
export default function Projects() {
  return (<main><h1>Projects</h1><p>Shop app, Blog, Chat app.</p></main>);
}

// app/contact/page.js
export default function Contact() {
  return (<main><h1>Contact</h1><p>Email: me@example.com</p></main>);
}

// app/page.js
export default function Home() {
  return (
    <main>
      <h1>Portfolio</h1>
      <nav>
        <a href="/about">About</a> | <a href="/projects">Projects</a> | <a href="/contact">Contact</a>
      </nav>
    </main>
  );
}`,
    },
    {
      task: 'Change the root layout so every page shows a header "My Portfolio" and a footer with the year, and set the page title to "Portfolio".',
      hint: 'Layout wraps children; use the metadata export for the title.',
      solution: `// app/layout.js
import './globals.css';

export const metadata = { title: 'Portfolio', description: 'My work' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header><strong>My Portfolio</strong></header>
        {children}
        <footer>© {new Date().getFullYear()}</footer>
      </body>
    </html>
  );
}`,
    },
    {
      task: 'Put a logo file at public/images/logo.png and show it on the home page with a plain img tag. What URL do you use?',
      hint: 'Do not include "public" in the URL.',
      solution: `// app/page.js
export default function Home() {
  return <img src="/images/logo.png" alt="Logo" width={120} height={40} />;
}
// The URL is /images/logo.png (public/ maps to the site root).
// On Day 12 you will replace <img> with the optimised next/image component.`,
    },
  ],
  quiz: [
    { question: 'Which command creates a new Next.js app?', options: ['npm install next-app', 'npx create-next-app@latest', 'next new app', 'npm create react-app'], answer: 1, explanation: 'create-next-app is the official scaffolding tool.' },
    { question: 'Which file is REQUIRED in the App Router and must render <html> and <body>?', options: ['app/page.js', 'app/index.js', 'app/layout.js', 'pages/_app.js'], answer: 2, explanation: 'The root layout is mandatory.' },
    { question: 'A file at public/docs/guide.pdf is available at which URL?', options: ['/docs/guide.pdf', '/public/docs/guide.pdf', '/static/guide.pdf', 'It is not public'], answer: 0, explanation: 'public/ maps to the site root.' },
    { question: 'Which file makes /pricing a page?', options: ['app/pricing.js', 'app/pricing/index.js', 'pages/pricing/page.js', 'app/pricing/page.js'], answer: 3, explanation: 'The folder must contain page.js.' },
    { question: 'Which script serves the optimised production build?', options: ['npm run dev', 'npm run lint', 'npm start (after npm run build)', 'npm test'], answer: 2, explanation: 'next start serves the output of next build.' },
  ],
};
