export default {
  id: 'day-31-professional-react-project-setup',
  title: 'Professional React Project Setup: Feature Folders, Path Aliases, ESLint + Prettier, .env Variables and Git Workflow',
  module: 'Module 7: Industry Project Setup & UI',
  day: 31,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Day 1 of the industry track. You will set up a React 19 + Vite 6 project the way real product teams do: a feature-based folder structure, `@/` path aliases, ESLint (flat config) + Prettier, environment variables per stage with `import.meta.env`, and a Git branching and pull-request workflow.',
  objectives: [
    'Organise a React codebase by feature instead of by file type, and know what goes into each folder',
    'Configure `@/` path aliases in Vite and the editor (jsconfig.json) to remove ../../../ imports',
    'Set up ESLint 9 flat config with React Hooks rules and Prettier, and run them on every commit',
    'Use .env, .env.development and .env.production files safely with the VITE_ prefix',
    'Follow a feature-branch Git workflow with pull requests and conventional commit messages',
  ],
  theory: [
    {
      heading: 'Why project setup matters in a company',
      content:
        'In college projects one person writes everything, so any structure "works". In a company, **10 to 50 developers** touch the same codebase for years. A good setup means:\n\n- A new joiner can find the code for "Orders" in seconds\n- Imports do not break when a file moves\n- Everyone formats code the same way, so pull requests show only real changes\n- Secrets and API URLs are not hard-coded, and the same build can talk to dev, staging or production servers\n- Nobody pushes directly to `main`; every change is reviewed\n\nAnalogy: a new office building. Before employees move in, you decide which floor is HR, which is Finance (folders), you put name boards on doors (aliases), you write office rules (ESLint), and you install a security desk at the entrance (Git branch protection).\n\nStart a project with: `npm create vite@latest flipkart-admin -- --template react` (Vite 6 creates a React 19 app). The template already includes ESLint 9 with a flat config.',
      tip: 'Decide the structure and tooling on Day 1 of the project. Changing folder structure after 300 files is painful and causes merge conflicts for the whole team.',
    },
    {
      heading: 'Feature-based folder structure',
      content:
        'Small apps often group files **by type**: `components/`, `pages/`, `hooks/`, `services/`. With 200+ components, the "Orders" feature ends up spread over five folders.\n\nIndustry apps group **by feature (domain)**. Everything about one feature lives together, and only truly shared code goes to `shared` folders:\n\n- `src/app/`: app-wide setup: `App.jsx`, `router.jsx`, `providers.jsx` (Router, QueryClient, Theme)\n- `src/features/auth/`, `src/features/products/`, `src/features/orders/`: each has its own `components/`, `hooks/`, `api/`, `utils/` and an `index.js` (the public API of the feature)\n- `src/components/ui/`: shared dumb UI: Button, Card, Modal, Input\n- `src/hooks/`, `src/lib/` (axios instance, helpers like `formatINR`), `src/config/` (env, constants)\n- `src/pages/` or `src/routes/`: thin route components that compose features\n- `src/assets/`, `src/styles/`\n\n**Rules teams follow**\n1. A feature may import from `components/ui`, `lib`, `hooks` but **not from inside another feature**; use the other feature\'s `index.js` instead\n2. Component files use **PascalCase** (`ProductCard.jsx`), hooks start with `use` (`useProducts.js`), others use camelCase\n3. Keep tests next to the file: `ProductCard.test.jsx`',
      syntax:
        'src/\n  app/            App.jsx, router.jsx, providers.jsx\n  features/\n    auth/         components/LoginForm.jsx, hooks/useAuth.js, api/authApi.js, index.js\n    products/     components/ProductCard.jsx, hooks/useProducts.js, api/productsApi.js, index.js\n    orders/       ...\n  components/ui/  Button.jsx, Card.jsx, Modal.jsx, Spinner.jsx\n  hooks/          useDebounce.js, useLocalStorage.js\n  lib/            axios.js, formatINR.js\n  config/         env.js, constants.js\n  pages/          HomePage.jsx, ProductsPage.jsx, NotFoundPage.jsx\n  styles/         index.css\n  main.jsx',
      tip: 'A "barrel" file (features/products/index.js that re-exports public pieces) gives each feature a clean public API. Do not create barrels for every folder though: huge barrels can slow down Vite dev and break tree shaking.',
    },
    {
      heading: 'Path aliases: @/ instead of ../../../',
      content:
        'Deep relative imports like `import Button from \'../../../components/ui/Button\'` are hard to read and break whenever a file moves. A **path alias** maps `@` to `src`, so every import is absolute: `import Button from \'@/components/ui/Button\'`.\n\nYou configure it in **two places**:\n1. **Vite** (`vite.config.js` → `resolve.alias`) so the build understands it\n2. **The editor** (`jsconfig.json`, or `tsconfig.json` in TypeScript projects → `compilerOptions.paths`) so VS Code autocompletes and "Go to definition" works\n\nIf you also use Vitest, it reads `vite.config.js`, so tests understand the alias automatically.',
      syntax:
        "// vite.config.js\nimport { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport path from 'node:path';\n\nexport default defineConfig({\n  plugins: [react()],\n  resolve: {\n    alias: { '@': path.resolve(__dirname, './src') },\n  },\n});\n\n// jsconfig.json (for VS Code)\n{\n  \"compilerOptions\": {\n    \"baseUrl\": \".\",\n    \"paths\": { \"@/*\": [\"./src/*\"] }\n  }\n}",
      tip: 'Common mistake: adding the alias only in jsconfig.json. The editor is happy but `npm run dev` fails with "Failed to resolve import @/...". Vite needs its own alias.',
    },
    {
      heading: 'ESLint + Prettier: code rules and formatting',
      content:
        '- **ESLint** finds **bugs and bad patterns**: unused variables, missing `useEffect` dependencies (`react-hooks/exhaustive-deps`), hooks called inside `if` (`react-hooks/rules-of-hooks`), components that break Fast Refresh.\n- **Prettier** only **formats**: quotes, semicolons, line width, indentation. No arguments in code review about spaces.\n\nESLint 9 uses the **flat config** file `eslint.config.js` (the old `.eslintrc` is deprecated). Vite\'s React template already includes `@eslint/js`, `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`. Add Prettier and `eslint-config-prettier`, which turns off ESLint rules that fight with Prettier.\n\nAutomate it:\n- VS Code: "Format on Save" with the Prettier extension, ESLint extension for red squiggles\n- **husky + lint-staged**: run `eslint --fix` and `prettier --write` on staged files **before every commit**\n- CI (GitHub Actions, Day 55) runs `npm run lint` on every pull request',
      syntax:
        "// eslint.config.js (Vite 6 template + Prettier)\nimport js from '@eslint/js';\nimport globals from 'globals';\nimport reactHooks from 'eslint-plugin-react-hooks';\nimport reactRefresh from 'eslint-plugin-react-refresh';\nimport prettier from 'eslint-config-prettier';\n\nexport default [\n  { ignores: ['dist'] },\n  {\n    files: ['**/*.{js,jsx}'],\n    languageOptions: { ecmaVersion: 'latest', globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } },\n    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },\n    rules: {\n      ...js.configs.recommended.rules,\n      ...reactHooks.configs.recommended.rules,\n      'react-refresh/only-export-components': 'warn',\n      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],\n    },\n  },\n  prettier, // must be last: switches off formatting rules\n];\n\n// .prettierrc\n{ \"semi\": true, \"singleQuote\": true, \"printWidth\": 100, \"trailingComma\": \"all\" }",
      tip: 'Never disable react-hooks/exhaustive-deps for the whole project to "remove warnings". Each warning usually points at a real stale-data bug.',
    },
    {
      heading: 'Environment variables with Vite (.env files)',
      content:
        'The API URL differs per stage: `http://localhost:5000` on your laptop, `https://staging-api.myshop.in` for QA, `https://api.myshop.in` in production. Hard-coding it means editing code before each deploy. Instead use **.env files**:\n\n- `.env`: loaded in all modes\n- `.env.development`: loaded by `npm run dev`\n- `.env.production`: loaded by `npm run build`\n- `.env.staging`: loaded with `vite build --mode staging`\n- `.env.local` / `.env.*.local`: your personal overrides, **git-ignored**\n\nOnly variables starting with **`VITE_`** are exposed to your code, through `import.meta.env.VITE_API_URL`. Vite also gives `import.meta.env.MODE`, `DEV`, `PROD` and `BASE_URL`.\n\n**Very important**: everything in a frontend bundle is **public**. Anyone can open DevTools and read it. Put only public values (API base URL, public Razorpay key id, Firebase web config) in `VITE_` variables. Real secrets (database passwords, Razorpay key secret, OpenAI key) stay on the backend.',
      syntax:
        "# .env.development\nVITE_API_URL=http://localhost:5000/api\nVITE_APP_NAME=MyShop (dev)\n\n# .env.production\nVITE_API_URL=https://api.myshop.in/api\nVITE_APP_NAME=MyShop\n\n// src/config/env.js : read and validate in ONE place\nconst required = ['VITE_API_URL'];\nrequired.forEach(key => {\n  if (!import.meta.env[key]) throw new Error('Missing env variable: ' + key);\n});\nexport const env = {\n  apiUrl: import.meta.env.VITE_API_URL,\n  appName: import.meta.env.VITE_APP_NAME ?? 'MyShop',\n  isDev: import.meta.env.DEV,\n};",
      tip: 'Commit a `.env.example` file with all keys and dummy values so new developers know what to set. Restart `npm run dev` after editing .env: Vite reads it only at start-up.',
    },
    {
      heading: 'Git branching workflow and pull requests',
      content:
        'Most Indian product companies and service companies use a variant of **GitHub Flow** or **Git Flow**:\n\n1. `main` is always deployable and **protected**: no direct pushes, merges only through reviewed pull requests (PRs) with passing CI\n2. (Git Flow) `develop` collects finished features for the next release; `release/1.4.0` and `hotfix/payment-crash` branches exist for releases and urgent fixes\n3. For each task (usually a Jira ticket) create a short-lived branch: `feature/SHOP-142-product-filters`, `fix/SHOP-150-cart-total`, `chore/upgrade-vite-6`\n4. Commit small, meaningful steps using **Conventional Commits**: `feat(cart): add coupon field`, `fix(auth): logout on 401`, `chore: bump eslint`\n5. Push, open a PR, fill the template (what, why, screenshots), request reviewers\n6. Fix review comments, keep the branch updated (`git pull --rebase origin main`), then **squash merge**; delete the branch\n\nAlways keep `.gitignore` correct: `node_modules`, `dist`, `.env.local`, `.env.*.local`, `.DS_Store`, `coverage`.',
      syntax:
        'git checkout main && git pull\ngit checkout -b feature/SHOP-142-product-filters\n# ...code...\ngit add .\ngit commit -m "feat(products): add price range filter"\ngit push -u origin feature/SHOP-142-product-filters\n# open Pull Request on GitHub -> review -> squash merge -> delete branch',
      tip: 'Coming next (Day 32): with the project ready, you will style it with Tailwind CSS 4 and build reusable UI components.',
    },
  ],
  examples: [
    {
      title: 'Explore a feature-based folder structure',
      scenario:
        'Your team lead shares the folder structure of "ShopKart Admin". Explore it and see what each folder is responsible for and who is allowed to import it.',
      steps: [
        'Create the project: npm create vite@latest shopkart-admin -- --template react',
        'Create src/app, src/features/products, src/features/orders, src/components/ui, src/lib, src/config',
        'Move App.jsx into src/app and update main.jsx',
        'Add an index.js to each feature that re-exports its public components and hooks',
        'Run the playground and click folders and files to read their purpose',
      ],
      code: `// src/features/products/index.js : public API of the feature
export { ProductList } from './components/ProductList';
export { ProductCard } from './components/ProductCard';
export { useProducts } from './hooks/useProducts';

// src/pages/ProductsPage.jsx : pages compose features
import { ProductList } from '@/features/products';
import { PageHeader } from '@/components/ui/PageHeader';

export default function ProductsPage() {
  return (
    <>
      <PageHeader title="Products" />
      <ProductList />
    </>
  );
}`,
      playground: {
        jsx: `const TREE = {
  name: 'src', type: 'folder', info: 'All application code.',
  children: [
    { name: 'app', type: 'folder', info: 'App-wide setup: App.jsx, router.jsx, providers.jsx (Router, QueryClient, Theme).', children: [
      { name: 'App.jsx', info: 'Root component: renders providers and the router.' },
      { name: 'router.jsx', info: 'All routes in one place.' },
    ] },
    { name: 'features', type: 'folder', info: 'One folder per business feature. Everything about a feature lives together.', children: [
      { name: 'products', type: 'folder', info: 'Product catalogue feature.', children: [
        { name: 'components/ProductCard.jsx', info: 'UI for one product. PascalCase file name.' },
        { name: 'hooks/useProducts.js', info: 'Custom hook that loads products. Starts with use.' },
        { name: 'api/productsApi.js', info: 'API calls for products (uses the shared axios instance).' },
        { name: 'index.js', info: 'Public API: other code imports ONLY from here.' },
      ] },
      { name: 'orders', type: 'folder', info: 'Orders feature: same inner structure as products.', children: [
        { name: 'components/OrdersTable.jsx', info: 'Table of orders.' },
        { name: 'index.js', info: 'Public API of orders.' },
      ] },
    ] },
    { name: 'components/ui', type: 'folder', info: 'Shared, reusable, dumb UI: Button, Card, Modal. No business logic.', children: [
      { name: 'Button.jsx', info: 'Used by every feature.' },
      { name: 'Modal.jsx', info: 'Generic modal.' },
    ] },
    { name: 'lib', type: 'folder', info: 'Framework-free helpers and clients.', children: [
      { name: 'axios.js', info: 'One configured axios instance (Day 36).' },
      { name: 'formatINR.js', info: 'Formats numbers as Rs 1,23,456.' },
    ] },
    { name: 'config', type: 'folder', info: 'Validated env variables and constants.', children: [
      { name: 'env.js', info: 'Reads import.meta.env once and validates it.' },
    ] },
    { name: 'pages', type: 'folder', info: 'Thin route components that compose features.', children: [
      { name: 'ProductsPage.jsx', info: 'Imports ProductList from @/features/products.' },
    ] },
  ],
};

function Node({ node, depth, selected, onSelect }) {
  const [open, setOpen] = React.useState(depth < 2);
  const isFolder = node.type === 'folder';
  return (
    <li>
      <button
        className={'row' + (selected === node ? ' active' : '')}
        style={{ paddingLeft: 8 + depth * 16 }}
        onClick={() => { onSelect(node); if (isFolder) setOpen(o => !o); }}
        aria-expanded={isFolder ? open : undefined}
      >
        {isFolder ? (open ? '[-] ' : '[+] ') : '    '}{node.name}
      </button>
      {isFolder && open && (
        <ul>
          {node.children.map(child => (
            <Node key={child.name} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

function App() {
  const [selected, setSelected] = React.useState(TREE);
  return (
    <div className="wrap">
      <ul className="tree"><Node node={TREE} depth={0} selected={selected} onSelect={setSelected} /></ul>
      <aside className="info">
        <h3>{selected.name}</h3>
        <p>{selected.info}</p>
        <small>Rule: features import shared code (components/ui, lib, hooks), never the internals of another feature.</small>
      </aside>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; margin: 0; padding: 12px; }
.wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 520px) { .wrap { grid-template-columns: 1fr; } }
.tree, .tree ul { list-style: none; margin: 0; padding: 0; }
.row { display: block; width: 100%; text-align: left; border: 0; background: none; padding: 5px 8px; font-family: monospace; font-size: 13px; cursor: pointer; white-space: pre; border-radius: 4px; }
.row:hover { background: #eef2ff; }
.row.active { background: #4f46e5; color: #fff; }
.info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
.info h3 { margin-top: 0; font-family: monospace; }
.info small { color: #64748b; }`,
      },
      result:
        'A clickable folder tree. Clicking a folder expands or collapses it; the right panel explains the selected folder or file and repeats the import rule.',
      explanation:
        'The playground is a plain-React recursive tree component (Node renders itself for children). The real project structure is in `code`: pages import a feature only through its index.js, which keeps features independent and easy to move or delete.',
    },
    {
      title: 'Path aliases: turning @/ imports into real paths',
      scenario:
        'A ProductCard in src/features/products/components imports Button with ../../../components/ui/Button. Replace it with @/components/ui/Button and understand how Vite resolves it.',
      steps: [
        'Add resolve.alias { "@": path.resolve(__dirname, "./src") } to vite.config.js',
        'Create jsconfig.json with "paths": { "@/*": ["./src/*"] } and restart VS Code',
        'Replace relative imports with @/ imports',
        'Run npm run dev and confirm no "Failed to resolve import" error',
        'In the playground, type an importing file and an import path to see how both styles resolve',
      ],
      code: `// BEFORE: src/features/products/components/ProductCard.jsx
import Button from '../../../components/ui/Button';
import { formatINR } from '../../../lib/formatINR';

// AFTER (with the alias)
import Button from '@/components/ui/Button';
import { formatINR } from '@/lib/formatINR';

// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});`,
      playground: {
        jsx: `const ALIASES = { '@/': 'src/' };

// Resolve an import the way a bundler would (simplified)
function resolveImport(fromFile, spec) {
  for (const key in ALIASES) {
    if (spec.startsWith(key)) return { path: ALIASES[key] + spec.slice(key.length), how: 'alias ' + key + ' -> ' + ALIASES[key] };
  }
  if (!spec.startsWith('.')) return { path: 'node_modules/' + spec, how: 'bare import -> node_modules' };
  const parts = fromFile.split('/').slice(0, -1);   // folder of the importing file
  spec.split('/').forEach(seg => {
    if (seg === '..') parts.pop();
    else if (seg !== '.') parts.push(seg);
  });
  return { path: parts.join('/'), how: 'relative to ' + fromFile };
}

const SAMPLES = ['../../../components/ui/Button', '@/components/ui/Button', '../../lib/formatINR', '@/lib/formatINR', 'react'];

function App() {
  const [from, setFrom] = React.useState('src/features/products/components/ProductCard.jsx');
  const [spec, setSpec] = React.useState(SAMPLES[0]);
  const r = resolveImport(from, spec);
  const ups = (spec.match(/\\.\\.\\//g) || []).length;
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 560 }}>
      <label>Importing file<br />
        <input value={from} onChange={e => setFrom(e.target.value)} style={{ width: '100%' }} />
      </label>
      <label style={{ display: 'block', marginTop: 8 }}>Import path<br />
        <input value={spec} onChange={e => setSpec(e.target.value)} style={{ width: '100%' }} />
      </label>
      <div style={{ margin: '8px 0' }}>
        {SAMPLES.map(s => <button key={s} onClick={() => setSpec(s)} style={{ margin: 2, fontSize: 12 }}>{s}</button>)}
      </div>
      <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 10, borderRadius: 6, whiteSpace: 'pre-wrap' }}>
        {'Resolved to: ' + r.path + '\\nHow: ' + r.how}
      </pre>
      {ups >= 2 && <p style={{ color: '#b45309' }}>{ups} levels of ../ : this breaks when the file moves. Prefer an @/ alias.</p>}
    </div>
  );
}`,
      },
      result:
        'With the default values the relative import resolves to src/components/ui/Button and shows a warning about 3 levels of ../. Clicking "@/components/ui/Button" resolves to the same file via the alias, with no warning.',
      explanation:
        'Both imports point to the same file, but the alias version does not depend on where the importing file lives. Move ProductCard to another folder and the @/ import still works, while the relative one breaks. Vite does this mapping using resolve.alias; the playground shows a simplified plain-JS resolver.',
    },
    {
      title: 'Validated environment config per stage',
      scenario:
        'Your app must call http://localhost:5000/api in development, https://staging-api.shopkart.in/api on staging and https://api.shopkart.in/api in production. Create one config module that reads and validates import.meta.env.',
      steps: [
        'Create .env.development, .env.staging and .env.production with VITE_API_URL and VITE_APP_NAME',
        'Create src/config/env.js that validates required keys and exports a clean env object',
        'Use env.apiUrl in the axios instance instead of hard-coded URLs',
        'Add "build:staging": "vite build --mode staging" to package.json scripts',
        'In the playground, switch the mode and remove a variable to see the validation error',
      ],
      code: `# .env.development
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ShopKart (dev)

# .env.staging
VITE_API_URL=https://staging-api.shopkart.in/api
VITE_APP_NAME=ShopKart (staging)

# .env.production
VITE_API_URL=https://api.shopkart.in/api
VITE_APP_NAME=ShopKart

// src/config/env.js
const REQUIRED = ['VITE_API_URL', 'VITE_APP_NAME'];
const missing = REQUIRED.filter(key => !import.meta.env[key]);
if (missing.length) {
  throw new Error('Missing env variables: ' + missing.join(', ') + '. Copy .env.example to .env.local');
}
export const env = Object.freeze({
  apiUrl: import.meta.env.VITE_API_URL,
  appName: import.meta.env.VITE_APP_NAME,
  mode: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
});

// package.json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build:staging": "vite build --mode staging",
  "lint": "eslint .",
  "format": "prettier --write ."
}`,
      playground: {
        jsx: `// Simulates what Vite puts into import.meta.env for each mode
const FILES = {
  development: { VITE_API_URL: 'http://localhost:5000/api', VITE_APP_NAME: 'ShopKart (dev)', DB_PASSWORD: 'secret123' },
  staging: { VITE_API_URL: 'https://staging-api.shopkart.in/api', VITE_APP_NAME: 'ShopKart (staging)' },
  production: { VITE_API_URL: 'https://api.shopkart.in/api', VITE_APP_NAME: 'ShopKart' },
};
const REQUIRED = ['VITE_API_URL', 'VITE_APP_NAME'];

function loadEnv(mode, fileVars) {
  const exposed = { MODE: mode, DEV: mode === 'development', PROD: mode === 'production' };
  Object.keys(fileVars).forEach(k => { if (k.startsWith('VITE_')) exposed[k] = fileVars[k]; }); // only VITE_ keys
  return exposed;
}
function createConfig(metaEnv) {
  const missing = REQUIRED.filter(k => !metaEnv[k]);
  if (missing.length) throw new Error('Missing env variables: ' + missing.join(', '));
  return { apiUrl: metaEnv.VITE_API_URL, appName: metaEnv.VITE_APP_NAME, mode: metaEnv.MODE, isProd: metaEnv.PROD };
}

function App() {
  const [mode, setMode] = React.useState('development');
  const [removed, setRemoved] = React.useState(false);
  const fileVars = { ...FILES[mode] };
  if (removed) delete fileVars.VITE_API_URL;
  const metaEnv = loadEnv(mode, fileVars);
  let config = null, error = null;
  try { config = createConfig(metaEnv); } catch (e) { error = e.message; }

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Object.keys(FILES).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ fontWeight: m === mode ? 700 : 400 }}>{m}</button>
        ))}
        <label><input type="checkbox" checked={removed} onChange={e => setRemoved(e.target.checked)} /> remove VITE_API_URL</label>
      </div>
      <h4>.env.{mode}</h4>
      <pre style={{ background: '#f1f5f9', padding: 8 }}>{Object.entries(fileVars).map(([k, v]) => k + '=' + v).join('\\n')}</pre>
      <h4>import.meta.env (what your code can see)</h4>
      <pre style={{ background: '#f1f5f9', padding: 8 }}>{JSON.stringify(metaEnv, null, 2)}</pre>
      {error
        ? <p role="alert" style={{ color: 'crimson' }}>App start blocked: {error}</p>
        : <p style={{ color: 'green' }}>{config.appName} will call <b>{config.apiUrl}</b></p>}
      {'DB_PASSWORD' in fileVars && <p style={{ color: '#b45309' }}>DB_PASSWORD is NOT exposed (no VITE_ prefix). Still, never keep real secrets in a frontend repo.</p>}
    </div>
  );
}`,
      },
      result:
        'Switching modes changes the API URL and app name. In development the DB_PASSWORD line appears in the file but not in import.meta.env. Ticking "remove VITE_API_URL" shows "App start blocked: Missing env variables: VITE_API_URL".',
      explanation:
        'Vite exposes only VITE_-prefixed variables to client code. Reading env in one config module means the rest of the app uses env.apiUrl and never touches import.meta.env directly, and a missing variable fails loudly at start-up instead of producing calls to "undefined/products".',
    },
    {
      title: 'Simulate a feature-branch workflow with pull requests',
      scenario:
        'You are assigned ticket SHOP-142 "Add price filter". Practise the full flow: branch from main, make conventional commits, open a PR, pass checks and squash-merge.',
      steps: [
        'git checkout main && git pull',
        'git checkout -b feature/SHOP-142-price-filter',
        'Commit with messages like feat(products): add price filter',
        'git push -u origin feature/SHOP-142-price-filter and open a PR',
        'Wait for lint/test checks and approval, then squash merge and delete the branch',
        'In the playground, click through the same steps; invalid commit messages are rejected like a commitlint hook would',
      ],
      code: `# Daily commands
git checkout main
git pull origin main
git checkout -b feature/SHOP-142-price-filter

git add src/features/products
git commit -m "feat(products): add price range filter"
git commit -m "test(products): cover price filter edge cases"

git pull --rebase origin main     # stay up to date, resolve conflicts locally
git push -u origin feature/SHOP-142-price-filter
# GitHub: Compare & pull request -> fill template -> request review

# commitlint.config.js (runs in a husky commit-msg hook)
export default { extends: ['@commitlint/config-conventional'] };

# package.json (husky + lint-staged)
"lint-staged": {
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{css,md,json}": ["prettier --write"]
}`,
      playground: {
        jsx: `const COMMIT_RE = /^(feat|fix|chore|docs|style|refactor|test|perf|build|ci)(\\([a-z0-9-]+\\))?: .{5,}$/;

function App() {
  const [branch, setBranch] = React.useState('main');
  const [log, setLog] = React.useState(['main: initial commit']);
  const [msg, setMsg] = React.useState('feat(products): add price range filter');
  const [commits, setCommits] = React.useState([]);
  const [pr, setPr] = React.useState(null); // null | 'open' | 'approved' | 'merged'
  const [error, setError] = React.useState('');

  const add = line => setLog(l => [...l, line]);

  function createBranch() {
    setBranch('feature/SHOP-142-price-filter');
    add('git checkout -b feature/SHOP-142-price-filter');
  }
  function commit() {
    if (branch === 'main') { setError('Blocked: main is protected. Create a feature branch first.'); return; }
    if (!COMMIT_RE.test(msg)) { setError('commitlint: message must look like "type(scope): description"'); return; }
    setError('');
    setCommits(c => [...c, msg]);
    add('git commit -m "' + msg + '"');
  }
  function openPr() {
    if (!commits.length) { setError('Nothing to review: make a commit first.'); return; }
    setError(''); setPr('open'); add('git push -u origin ' + branch + '  ->  PR #57 opened');
  }
  function approve() { setPr('approved'); add('CI: lint ok, tests ok. Reviewer approved PR #57'); }
  function merge() {
    setPr('merged'); add('Squash merged into main: ' + commits[0] + ' (#57)'); add('Branch deleted');
    setBranch('main'); setCommits([]);
  }

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 600 }}>
      <p>Current branch: <b>{branch}</b> {pr && <span>| PR status: <b>{pr}</b></span>}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={createBranch} disabled={branch !== 'main'}>1. Create branch</button>
        <input value={msg} onChange={e => setMsg(e.target.value)} style={{ flex: 1, minWidth: 220 }} aria-label="Commit message" />
        <button onClick={commit}>2. Commit</button>
        <button onClick={openPr} disabled={pr === 'open' || pr === 'approved'}>3. Push + open PR</button>
        <button onClick={approve} disabled={pr !== 'open'}>4. CI + review</button>
        <button onClick={merge} disabled={pr !== 'approved'}>5. Squash merge</button>
      </div>
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
      <pre style={{ background: '#0f172a', color: '#a7f3d0', padding: 10, borderRadius: 6, minHeight: 120 }}>{log.join('\\n')}</pre>
    </div>
  );
}`,
      },
      result:
        'Committing on main is blocked. After creating the branch, a valid message like "feat(products): add price range filter" is accepted while "fixed stuff" is rejected. The log shows push, PR, CI + approval and the squash merge back into main.',
      explanation:
        'The playground models branch protection, a commitlint check (a regular expression for Conventional Commits) and the PR states. In a real repo these rules live in GitHub branch protection settings, a husky commit-msg hook and CI.',
    },
  ],
  interview: [
    { q: 'How do you structure a large React project?', a: 'By feature (domain): src/features/<feature> holds its components, hooks, api calls and utils with an index.js public API. Shared UI goes to components/ui, helpers to lib, app setup (providers, router) to app, and env/constants to config. Pages are thin and compose features. This keeps related code together and lets teams own features.', level: 'Medium' },
    { q: 'Feature-based vs type-based folder structure?', a: 'Type-based (components/, hooks/, services/) is fine for small apps but spreads one feature across many folders. Feature-based groups everything for one business area together, scales better with team size, makes deleting or moving a feature easy, and reduces merge conflicts.', level: 'Easy' },
    { q: 'What is a path alias and how do you configure it in Vite?', a: 'A short prefix like @ that maps to src, so imports are absolute (@/components/ui/Button). Configure resolve.alias in vite.config.js for the build, and compilerOptions.paths in jsconfig.json/tsconfig.json for the editor and TypeScript.', level: 'Easy' },
    { q: 'What is the difference between ESLint and Prettier?', a: 'ESLint is a linter: it finds code-quality problems and likely bugs (unused vars, hook rules, missing deps). Prettier is a formatter: it rewrites code style (quotes, spacing, line breaks). Use both, with eslint-config-prettier to turn off conflicting ESLint style rules.', level: 'Easy' },
    { q: 'What do the rules-of-hooks and exhaustive-deps rules check?', a: 'rules-of-hooks ensures hooks are called only at the top level of components/custom hooks, not in conditions or loops. exhaustive-deps warns when a value used inside useEffect/useMemo/useCallback is missing from the dependency array, which would cause stale values.', level: 'Medium' },
    { q: 'How do environment variables work in Vite?', a: 'Vite loads .env, .env.[mode] and .local files at start-up and exposes only VITE_-prefixed keys on import.meta.env (plus MODE, DEV, PROD, BASE_URL). Values are replaced at build time, so changing them requires a rebuild or dev-server restart.', level: 'Medium' },
    { q: 'Can you store an API secret key in a VITE_ variable?', a: 'No. Anything in the client bundle is public and readable in DevTools. VITE_ variables are for public config (API base URL, public keys). Secrets must stay on a backend or serverless function which calls the third-party API on behalf of the frontend.', level: 'Medium' },
    { q: 'What is the difference between process.env and import.meta.env?', a: 'process.env is Node.js (and Create React App used REACT_APP_ with process.env through Webpack). Vite uses the ES module standard import.meta.env with the VITE_ prefix. Using process.env in a Vite app gives undefined/"process is not defined".', level: 'Medium' },
    { q: 'Describe your Git workflow in a team.', a: 'main is protected. For each ticket I branch from main (feature/SHOP-142-price-filter), make small Conventional Commits, rebase on main regularly, push and open a PR with description and screenshots. CI runs lint/tests, a teammate reviews, then we squash-merge and delete the branch. Hotfixes use fix/ branches the same way.', level: 'Medium' },
    { q: 'What are Conventional Commits and why use them?', a: 'A commit message format: type(scope): description, e.g. feat(cart): add coupon. Types include feat, fix, chore, docs, refactor, test. They make history readable, enable automatic changelogs and semantic version bumps, and are enforced with commitlint.', level: 'Easy' },
    { q: 'What do husky and lint-staged do?', a: 'husky installs Git hooks (pre-commit, commit-msg) from package scripts. lint-staged runs commands like eslint --fix and prettier --write only on staged files in the pre-commit hook, so bad code is fixed or blocked before it is committed, and it stays fast.', level: 'Hard' },
    { q: 'Why should barrel files (index.js re-exports) be used carefully?', a: 'They give a clean public API per feature, but huge barrels that re-export everything can create circular imports, make Vite dev load many modules for one import, and hurt tree shaking. Use them at feature boundaries, not in every folder.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create the folder structure for a "College Fees Portal" with features students, payments and reports. Write the index.js public API for the payments feature and a page that uses it with an @/ import.',
      hint: 'features/payments/components/PaymentForm.jsx, hooks/usePayments.js, api/paymentsApi.js, index.js.',
      solution: `src/
  app/App.jsx, router.jsx, providers.jsx
  features/
    students/  components/StudentTable.jsx, hooks/useStudents.js, api/studentsApi.js, index.js
    payments/  components/PaymentForm.jsx, components/PaymentHistory.jsx, hooks/usePayments.js, api/paymentsApi.js, index.js
    reports/   components/FeesReport.jsx, index.js
  components/ui/Button.jsx, Card.jsx, Modal.jsx
  lib/axios.js, formatINR.js
  config/env.js
  pages/PaymentsPage.jsx

// src/features/payments/index.js
export { PaymentForm } from './components/PaymentForm';
export { PaymentHistory } from './components/PaymentHistory';
export { usePayments } from './hooks/usePayments';

// src/pages/PaymentsPage.jsx
import { PaymentForm, PaymentHistory } from '@/features/payments';
import { Card } from '@/components/ui/Card';

export default function PaymentsPage() {
  return (
    <Card title="Fee payments">
      <PaymentForm />
      <PaymentHistory />
    </Card>
  );
}`,
    },
    {
      task: 'Configure @ for src AND @ui for src/components/ui in both vite.config.js and jsconfig.json.',
      hint: 'Put the more specific alias first in Vite so "@ui" is not matched by "@".',
      solution: `// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@ui', replacement: path.resolve(__dirname, './src/components/ui') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
});

// jsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@ui/*": ["./src/components/ui/*"],
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}

// usage
import Button from '@ui/Button';
import { env } from '@/config/env';`,
    },
    {
      task: 'Set up Prettier with ESLint in a Vite React project and add husky + lint-staged so that every commit is linted and formatted.',
      hint: 'npm i -D prettier eslint-config-prettier husky lint-staged; npx husky init.',
      solution: `npm i -D prettier eslint-config-prettier husky lint-staged
npx husky init            # creates .husky/pre-commit and adds "prepare": "husky" script

# .husky/pre-commit
npx lint-staged

// package.json (add)
"lint-staged": {
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{css,json,md}": ["prettier --write"]
},
"scripts": {
  "lint": "eslint .",
  "format": "prettier --write ."
}

// .prettierrc
{ "singleQuote": true, "semi": true, "printWidth": 100, "trailingComma": "all" }

// .prettierignore
dist
coverage

// eslint.config.js: add as the LAST item
import prettier from 'eslint-config-prettier';
export default [
  // ...existing Vite config objects
  prettier,
];`,
    },
    {
      task: 'Write src/config/env.js that validates VITE_API_URL (must start with http) and VITE_RAZORPAY_KEY_ID (must start with rzp_), and a .env.example for the team.',
      hint: 'Collect all errors in an array and throw one helpful message.',
      solution: `# .env.example (committed)
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

// src/config/env.js
const e = import.meta.env;
const errors = [];
if (!e.VITE_API_URL || !/^https?:\\/\\//.test(e.VITE_API_URL)) errors.push('VITE_API_URL must be a http(s) URL');
if (!e.VITE_RAZORPAY_KEY_ID || !e.VITE_RAZORPAY_KEY_ID.startsWith('rzp_')) errors.push('VITE_RAZORPAY_KEY_ID must start with rzp_');
if (errors.length) {
  throw new Error('Invalid environment:\\n- ' + errors.join('\\n- ') + '\\nSee .env.example');
}
export const env = Object.freeze({
  apiUrl: e.VITE_API_URL,
  razorpayKeyId: e.VITE_RAZORPAY_KEY_ID, // public key id only. The key SECRET lives on the server.
  isProd: e.PROD,
});`,
    },
    {
      task: 'Write the exact Git commands to: start a fix for ticket SHOP-150 (cart total wrong), commit the fix and a test, update with the latest main, and push for a PR. Also write a good PR description.',
      hint: 'Use a fix/ branch and Conventional Commit types fix and test.',
      solution: `git checkout main
git pull origin main
git checkout -b fix/SHOP-150-cart-total

git add src/features/cart/utils/calcTotal.js
git commit -m "fix(cart): include quantity in line total"
git add src/features/cart/utils/calcTotal.test.js
git commit -m "test(cart): add cases for multiple quantities"

git pull --rebase origin main
git push -u origin fix/SHOP-150-cart-total

PR title: fix(cart): include quantity in line total (SHOP-150)
PR description:
## What
Cart total ignored quantity for items added twice.
## Why
Customers were charged for one unit only (bug SHOP-150).
## How to test
1. Add "Boat Rockerz 450" twice  2. Cart shows Rs 2,998 instead of Rs 1,499
## Checklist
- [x] Tests added  - [x] Lint passes  - [x] No console.log left`,
    },
  ],
  quiz: [
    {
      question: 'In a feature-based structure, where should a ProductCard component that is only used by the products feature live?',
      options: ['src/components/ProductCard.jsx', 'src/features/products/components/ProductCard.jsx', 'src/pages/ProductCard.jsx', 'src/lib/ProductCard.jsx'],
      answer: 1,
      explanation: 'Feature-specific code stays inside its feature folder; only truly shared UI goes to components/ui.',
    },
    {
      question: 'You added "@/*" to jsconfig.json but npm run dev says "Failed to resolve import @/lib/api". What is missing?',
      options: ['A Babel plugin', 'Restarting VS Code', 'resolve.alias in vite.config.js', 'A .env variable'],
      answer: 2,
      explanation: 'jsconfig.json only helps the editor. Vite needs its own resolve.alias configuration.',
    },
    {
      question: 'Which variable can your React code read with Vite?',
      options: ['API_URL', 'REACT_APP_API_URL', 'process.env.API_URL', 'VITE_API_URL'],
      answer: 3,
      explanation: 'Vite exposes only VITE_-prefixed variables on import.meta.env.',
    },
    {
      question: 'What is the main job of Prettier?',
      options: ['Formatting code consistently', 'Finding missing useEffect dependencies', 'Running unit tests', 'Bundling the app'],
      answer: 0,
      explanation: 'Prettier only formats. Bugs and hook rules are ESLint\'s job.',
    },
    {
      question: 'Which commit message follows Conventional Commits?',
      options: ['Fixed cart bug', 'fix(cart): include quantity in total', 'cart - fix', 'FIX: Cart!!'],
      answer: 1,
      explanation: 'The format is type(scope): description in lower case.',
    },
  ],
};
