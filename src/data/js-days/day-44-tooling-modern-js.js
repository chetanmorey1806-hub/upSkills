const ex1code = `# 1. Check Node.js and npm are installed
node -v        # e.g. v20.11.0
npm -v         # e.g. 10.2.4

# 2. Create a project folder and package.json
mkdir my-app && cd my-app
npm init -y

# 3. Install packages
npm install dayjs            # dependency (needed at runtime)
npm install -D eslint prettier   # devDependencies (only for development)

# 4. Run a package binary without installing globally
npx prettier --version

# 5. Other useful commands
npm run <script>    # run a script from package.json
npm uninstall dayjs # remove a package
npm outdated        # see which packages have newer versions
npm ci              # clean install exactly from package-lock.json (CI servers)`;

const ex1 = `// What "npm install" writes into package.json - simulated in plain JS
const pkg = {
  name: 'my-app',
  version: '1.0.0',
  type: 'module',
  scripts: {},
  dependencies: {},
  devDependencies: {},
};

function npmInstall(name, version, { dev = false } = {}) {
  const field = dev ? 'devDependencies' : 'dependencies';
  pkg[field][name] = '^' + version;          // caret range is the default
  console.log('added', name + '@' + version, 'to', field);
}

npmInstall('dayjs', '1.11.10');
npmInstall('vite', '5.2.0', { dev: true });
npmInstall('eslint', '9.0.0', { dev: true });
pkg.scripts = { dev: 'vite', build: 'vite build', lint: 'eslint .' };

console.log(JSON.stringify(pkg, null, 2));`;

const ex2 = `// Semantic Versioning: MAJOR.MINOR.PATCH and what ^ and ~ allow
function parse(v) {
  const [major, minor, patch] = v.split('.').map(Number);
  return { major, minor, patch };
}

function satisfies(version, range) {
  const v = parse(version);
  const op = range[0];
  const r = parse(range.replace(/^[\\^~]/, ''));
  const atLeast =
    v.major > r.major ||
    (v.major === r.major && (v.minor > r.minor || (v.minor === r.minor && v.patch >= r.patch)));
  if (!atLeast) return false;
  if (op === '^') return v.major === r.major;                       // same MAJOR
  if (op === '~') return v.major === r.major && v.minor === r.minor; // same MAJOR.MINOR
  return version === range;                                          // exact
}

const candidates = ['4.17.21', '4.18.0', '4.17.25', '5.0.0', '4.16.9'];
for (const range of ['^4.17.21', '~4.17.21', '4.17.21']) {
  const ok = candidates.filter((v) => satisfies(v, range));
  console.log(range.padEnd(9), 'allows:', ok.join(', '));
}`;

const ex3code = `# Create a Vite project (choose "Vanilla" + "JavaScript")
npm create vite@latest my-vite-app
cd my-vite-app
npm install
npm run dev      # dev server with instant hot reload at http://localhost:5173
npm run build    # optimised production files in dist/
npm run preview  # preview the production build locally

# Project structure
my-vite-app/
  index.html          <- entry: <script type="module" src="/src/main.js">
  package.json
  public/             <- static files copied as-is (favicon, robots.txt)
  src/
    main.js
    counter.js
    style.css         <- import './style.css' works in JS thanks to Vite

// src/main.js - bare imports work because Vite resolves node_modules
import dayjs from 'dayjs';
import './style.css';
import { setupCounter } from './counter.js';

document.querySelector('#app').innerHTML = '<h1>Today is ' + dayjs().format('DD MMM YYYY') + '</h1>';
console.log(import.meta.env.MODE);   // "development" or "production"`;

const ex3 = `// What a bundler does (tiny simulation): resolve imports, keep used code, minify
const files = {
  'main.js': "import { add } from './math.js';\\nconsole.log(add(2, 3));",
  'math.js': 'export function add(a, b) {\\n  return a + b;\\n}\\nexport function unused(x) {\\n  return x * 1000;\\n}',
};

// 1. Find imports in the entry file (dependency graph)
const imports = [...files['main.js'].matchAll(/import \\{ (\\w+) \\} from '\\.\\/(.+?)'/g)]
  .map((m) => ({ name: m[1], file: m[2] }));
console.log('dependency graph: main.js ->', imports.map((i) => i.file).join(', '));

// 2. Tree shaking: keep only the exported functions that are imported
const used = imports.map((i) => i.name);
const mathFns = files['math.js'].split(/(?=export function)/);
const kept = mathFns.filter((fn) => used.some((name) => fn.includes('function ' + name + '(')));
console.log('tree shaking removed:', mathFns.length - kept.length, 'unused export(s)');

// 3. Bundle + minify (remove export keyword, imports, whitespace)
const bundle = (kept.join('') + files['main.js'].replace(/^import.*\\n/m, ''))
  .replace(/export /g, '')
  .replace(/\\s*\\n\\s*/g, '')
  .replace(/\\s*([{}();,+])\\s*/g, '$1');
console.log('bundle:', bundle);
console.log('size before:', files['main.js'].length + files['math.js'].length, 'chars, after:', bundle.length, 'chars');
eval(bundle);  // run the "built" code`;

const ex4code = `// eslint.config.js  (ESLint 9 "flat config")
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.browser },
    rules: {
      eqeqeq: 'error',          // require === and !==
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'prefer-const': 'error',
    },
  },
];

// .prettierrc
{ "semi": true, "singleQuote": true, "tabWidth": 2, "printWidth": 100, "trailingComma": "all" }

// package.json scripts
"scripts": {
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write ."
}

// ESLint = finds BUGS and bad patterns.  Prettier = only fixes FORMATTING.`;

const ex4 = `// Bugs that ESLint rules would have caught - run to see why they matter

// eqeqeq: == does type coercion
const qty = '0';
if (qty == false) console.log('[eqeqeq] "0" == false is true -> surprising branch ran');
console.log('[eqeqeq] with ===:', qty === false);

// no-unused-vars + no-undef: a typo creates a NEW variable instead of updating one
let total = 0;
function addToTotal(n) {
  // totl = total + n;   <- in sloppy mode this would silently create a global "totl"
  total = total + n;
}
addToTotal(5);
console.log('[no-undef] total:', total);

// no-dupe-keys: the second key silently overwrites the first
const config = { port: 3000, host: 'localhost', port: 8080 };
console.log('[no-dupe-keys] port is', config.port);

// no-constant-condition / no-cond-assign: = instead of === inside if
let role = 'user';
if ((role = 'admin')) console.log('[no-cond-assign] role is now', role, '- oops, we ASSIGNED');

// prefer-const: values that never change should be const
const API_URL = '/api';
console.log('[prefer-const] API_URL', API_URL);

// use-isnan: NaN is never equal to anything, even itself
const result = Number('abc');
console.log('[use-isnan] result === NaN:', result === NaN, '| Number.isNaN:', Number.isNaN(result));`;

const ex5 = `// Modern JavaScript (ES2015 -> ES2023) feature recap in one script
const user = { name: 'Asha', address: { city: 'Pune' }, tags: ['admin', 'dev'], score: 0 };

// ES2015: let/const, arrow functions, template literals, destructuring, default params, spread/rest, classes
const greet = ({ name }, greeting = 'Hello') => \`\${greeting}, \${name}!\`;
const { address: { city }, ...rest } = user;
console.log(greet(user), city, Object.keys(rest).join(','));

// ES2016: ** and includes
console.log(2 ** 10, user.tags.includes('dev'));

// ES2017: Object.entries / values, padStart, async/await
console.log(Object.entries({ a: 1, b: 2 }).map(([k, v]) => k + '=' + v).join('&'), '7'.padStart(3, '0'));

// ES2018: object spread, rest in objects, Promise.finally
const updated = { ...user, score: 10 };
console.log(updated.score, user.score);

// ES2019: flat, flatMap, Object.fromEntries, optional catch binding
console.log([1, [2, [3]]].flat(Infinity), Object.fromEntries([['x', 1]]));
try { JSON.parse('{bad'); } catch { console.log('optional catch binding works'); }

// ES2020: ?. optional chaining, ?? nullish coalescing, BigInt, Promise.allSettled, globalThis
console.log(user.address?.zip?.code, user.score ?? 50, user.score || 50, 2n ** 64n);

// ES2021: replaceAll, ||= &&= ??=, numeric separators, Promise.any
let theme;
theme ??= 'dark';
console.log('a-b-c'.replaceAll('-', '+'), theme, 1_000_000);

// ES2022: .at(), Object.hasOwn, class #private fields, top-level await (modules)
console.log(user.tags.at(-1), Object.hasOwn(user, 'name'));

// ES2023: toSorted, toReversed, with, findLast
const nums = [3, 1, 2];
console.log(nums.toSorted(), nums.toReversed(), nums.with(0, 99), nums.findLast((n) => n > 1), nums);`;

export default {
  id: 'day-44-tooling-modern-js',
  title: 'Tooling: npm, package.json, Bundlers (Vite), ESLint/Prettier, Modern ES2015+ Feature Recap',
  module: 'Module 7: Professional JavaScript',
  day: 44,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Professional JavaScript projects use a toolchain: npm to install packages, package.json to describe the project, a bundler/dev server like Vite to build it, and ESLint/Prettier to keep code correct and consistent. We finish with a recap of the modern ES2015+ features you have learned.',
  objectives: [
    'Use npm and npx to create projects, install, update and remove packages',
    'Read and edit package.json: scripts, dependencies vs devDependencies, semver ranges, lock file',
    'Explain what a bundler does and create/run/build a Vite project',
    'Set up ESLint and Prettier and know the difference between them',
    'Recall the key modern JavaScript features from ES2015 to ES2023',
  ],
  theory: [
    {
      heading: 'Node.js, npm and npx',
      content:
        '**Node.js** runs JavaScript outside the browser. It is needed for modern front-end tooling even if your final code runs in the browser.\n\n**npm** (Node Package Manager) comes with Node.js. It downloads **packages** (reusable code written by others) from the npm registry into a `node_modules` folder.\n\nAnalogy: npm is like an **app store** for code; `package.json` is your **shopping list**, and `node_modules` is the **shopping bag**.\n\nKey commands:\n- `npm init -y` – create package.json\n- `npm install pkg` (or `npm i pkg`) – add a runtime dependency\n- `npm install -D pkg` – add a development-only dependency\n- `npm install` – install everything listed in package.json\n- `npm uninstall pkg`, `npm update`, `npm outdated`\n- `npm run <name>` – run a script; `npm start` / `npm test` are shortcuts\n- **npx** `<tool>` – run a package\'s command without installing it globally (`npx create-vite`)\n\nAlternatives with the same idea: **yarn**, **pnpm**.',
      tip: 'Never commit node_modules to Git (add it to .gitignore). Anyone can recreate it with npm install from package.json + package-lock.json.',
    },
    {
      heading: 'package.json and package-lock.json',
      content:
        '`package.json` describes your project:\n- `name`, `version`, `description`\n- `type: "module"` – treat .js files as ES modules in Node\n- `scripts` – named commands: `"dev": "vite"`, `"build": "vite build"`, `"lint": "eslint ."`\n- `dependencies` – needed to **run** the app (react, axios, dayjs)\n- `devDependencies` – needed only to **develop/build** (vite, eslint, prettier, testing tools)\n\n**Semantic versioning (semver)** `MAJOR.MINOR.PATCH`:\n- PATCH (4.17.**21**) – bug fixes\n- MINOR (4.**18**.0) – new features, backwards compatible\n- MAJOR (**5**.0.0) – breaking changes\n- `^4.17.21` – allow any 4.x.x ≥ 4.17.21 (default)\n- `~4.17.21` – allow 4.17.x ≥ 4.17.21 (patches only)\n- `4.17.21` – exactly this version\n\n`package-lock.json` records the **exact** installed versions of every package (including nested ones), so every developer and server installs the same tree. Commit it. `npm ci` installs exactly from it.',
    },
    {
      heading: 'Bundlers and Vite',
      content:
        'Browsers understand ES modules, but real projects have hundreds of files, npm packages with bare imports (`import dayjs from "dayjs"`), CSS imports, images, TypeScript/JSX, and need to be fast in production.\n\nA **bundler** (Vite, webpack, Rollup, esbuild, Parcel):\n1. Starts at an entry file and follows imports to build a **dependency graph**\n2. Resolves npm packages from node_modules\n3. Transforms code (JSX, TypeScript, modern syntax for older browsers)\n4. **Tree-shakes** unused exports, **minifies**, splits code into chunks (dynamic import), adds content hashes to file names for caching\n5. Outputs optimised files in `dist/`\n\n**Vite** (French for "fast") is the modern default:\n- **Dev**: serves native ES modules with an instant start and **Hot Module Replacement** (HMR – changes appear without a full reload)\n- **Build**: uses Rollup to produce an optimised production bundle\n- Supports env variables via `import.meta.env` (`VITE_` prefix)',
      syntax: `npm create vite@latest my-app   # pick a framework: vanilla, react, vue...
cd my-app && npm install
npm run dev       # development server
npm run build     # production build -> dist/`,
    },
    {
      heading: 'ESLint and Prettier',
      content:
        '**ESLint** is a **linter**: it analyses your code **without running it** and reports **bugs and bad patterns** – unused variables, `==` instead of `===`, undefined variables, unreachable code, missing `await`, React hook rules. Many issues can be auto-fixed with `--fix`.\n\n**Prettier** is a **formatter**: it rewrites code to a consistent **style** (indentation, quotes, semicolons, line length). It does not care about logic.\n\nAnalogy: ESLint is the **teacher checking your answers**; Prettier is the **teacher fixing your handwriting**.\n\nTypical setup: ESLint for code quality + Prettier for formatting, both run on save in VS Code (extensions) and in CI, often before every commit with **husky + lint-staged**.',
      tip: 'Turn off ESLint formatting rules that conflict with Prettier (eslint-config-prettier) so the two tools never fight.',
    },
    {
      heading: 'Modern JavaScript (ES2015+) Recap',
      content:
        'JavaScript gets a new edition every year. Features you have learned in this course:\n- **ES2015 (ES6)**: let/const, arrow functions, template literals, destructuring, default/rest/spread, classes, modules, promises, Map/Set, Symbol, iterators/generators, for...of\n- **ES2016**: `**`, `Array.prototype.includes`\n- **ES2017**: async/await, Object.entries/values, padStart/padEnd\n- **ES2018**: object rest/spread, Promise.finally, async iteration, regex named groups\n- **ES2019**: flat/flatMap, Object.fromEntries, optional catch binding\n- **ES2020**: `?.`, `??`, BigInt, Promise.allSettled, dynamic import(), globalThis\n- **ES2021**: replaceAll, `||=` `&&=` `??=`, numeric separators `1_000_000`, Promise.any\n- **ES2022**: `.at()`, Object.hasOwn, class fields and #private, top-level await, Error cause\n- **ES2023**: toSorted, toReversed, toSpliced, with, findLast/findLastIndex',
      tip: 'Coming next (Day 45): the final project, practical test and interview revision for the whole JavaScript course.',
    },
  ],
  examples: [
    {
      title: 'Starting a project with npm',
      scenario: 'Create package.json and install a runtime package and development tools.',
      steps: [
        'Install Node.js LTS from nodejs.org, then run node -v and npm -v in a terminal',
        'Run npm init -y in a new folder',
        'Install dayjs normally and eslint/prettier with -D',
        'Open package.json – or click Run to see a simulation of what npm writes',
      ],
      code: ex1code,
      playground: { js: ex1 },
      result:
        'added dayjs@1.11.10 to dependencies\nadded vite@5.2.0 to devDependencies\nadded eslint@9.0.0 to devDependencies\n{\n  "name": "my-app",\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "lint": "eslint ."\n  },\n  "dependencies": {\n    "dayjs": "^1.11.10"\n  },\n  "devDependencies": {\n    "vite": "^5.2.0",\n    "eslint": "^9.0.0"\n  }\n}',
      explanation:
        'npm cannot run inside the browser playground, so the playground simulates the file it produces. Runtime libraries go to dependencies; build/lint tools go to devDependencies. The ^ prefix is added by default.',
    },
    {
      title: 'Understanding semver ranges (^ and ~)',
      scenario: 'Which versions can npm install for "^4.17.21", "~4.17.21" and "4.17.21"?',
      steps: [
        'Write parse() to split MAJOR.MINOR.PATCH',
        'Write satisfies(version, range) for ^, ~ and exact',
        'Test a list of candidate versions, click Run',
      ],
      code: ex2,
      playground: { js: ex2 },
      result:
        '^4.17.21  allows: 4.17.21, 4.18.0, 4.17.25\n~4.17.21  allows: 4.17.21, 4.17.25\n4.17.21   allows: 4.17.21',
      explanation:
        'Caret allows new minor and patch versions but not a new major (5.0.0 may break your code). Tilde allows only patches. Lower versions (4.16.9) are never allowed. The real rules (npm "semver" package) also handle pre-releases and 0.x versions.',
    },
    {
      title: 'Creating and building a Vite project',
      scenario: 'Scaffold a Vite app, run the dev server and build for production – and see what a bundler does internally.',
      steps: [
        'Run npm create vite@latest and choose Vanilla → JavaScript',
        'npm install, then npm run dev and open http://localhost:5173',
        'Edit src/main.js and see the page update instantly (HMR)',
        'Run npm run build and look inside dist/. Click Run for a tiny bundler simulation',
      ],
      code: ex3code,
      playground: { js: ex3 },
      result:
        'dependency graph: main.js -> math.js\ntree shaking removed: 1 unused export(s)\nbundle: function add(a,b){return a+b;}console.log(add(2,3));\nsize before: 150 chars, after: 52 chars\n5',
      explanation:
        'A real bundler parses code into an AST instead of using regex, but the steps are the same: follow imports, drop unused exports (unused() never appears in the bundle), strip module syntax and whitespace, and output one small file that still works.',
    },
    {
      title: 'ESLint and Prettier: the bugs a linter catches',
      scenario: 'Configure ESLint/Prettier and run code containing classic mistakes that lint rules would flag.',
      steps: [
        'npm install -D eslint @eslint/js globals prettier',
        'Create eslint.config.js and .prettierrc as shown',
        'Add lint and format scripts and run npm run lint',
        'Click Run to see what each rule protects you from',
      ],
      code: ex4code,
      playground: { js: ex4 },
      result:
        '[eqeqeq] "0" == false is true -> surprising branch ran\n[eqeqeq] with ===: false\n[no-undef] total: 5\n[no-dupe-keys] port is 8080\n[no-cond-assign] role is now admin - oops, we ASSIGNED\n[prefer-const] API_URL /api\n[use-isnan] result === NaN: false | Number.isNaN: true',
      explanation:
        'Each line shows a mistake that runs without any error but gives the wrong result. ESLint reports them in the editor before you even run the code. Prettier would only reformat these lines, not fix them.',
    },
    {
      title: 'Modern JavaScript features recap',
      scenario: 'One script that touches at least one feature from every edition ES2015–ES2023.',
      steps: [
        'Read each block and recall the day you learned it',
        'Predict the output of each console.log',
        'Click Run and compare',
      ],
      code: ex5,
      playground: { js: ex5 },
      result:
        "Hello, Asha! Pune name,tags,score\n1024 true\na=1&b=2 007\n10 0\n[ 1, 2, 3 ] { x: 1 }\noptional catch binding works\nundefined 0 50 18446744073709551616n\na+b+c dark 1000000\ndev true\n[ 1, 2, 3 ] [ 2, 1, 3 ] [ 99, 1, 2 ] 2 [ 3, 1, 2 ]",
      explanation:
        'Notice ?? keeps the 0 score but || replaces it with 50, because 0 is falsy but not nullish. The ES2023 methods return new arrays and leave nums unchanged ([3, 1, 2]).',
    },
  ],
  interview: [
    {
      q: 'What is npm?',
      a: 'Node Package Manager: the default package manager for Node.js, a CLI and an online registry used to install, share and manage JavaScript packages and run project scripts.',
      level: 'Easy',
    },
    {
      q: 'dependencies vs devDependencies?',
      a: 'dependencies are needed at runtime by the app (react, axios). devDependencies are needed only during development/build (vite, eslint, jest) and are not part of the production bundle.',
      level: 'Easy',
    },
    {
      q: 'What is package-lock.json and should it be committed?',
      a: 'It locks the exact versions of every installed package (including nested dependencies) for reproducible installs. Yes, commit it; use npm ci in CI to install exactly from it.',
      level: 'Medium',
    },
    {
      q: 'Explain ^1.2.3 vs ~1.2.3.',
      a: '^1.2.3 allows >=1.2.3 <2.0.0 (minor and patch updates). ~1.2.3 allows >=1.2.3 <1.3.0 (patch updates only).',
      level: 'Medium',
    },
    {
      q: 'npm vs npx?',
      a: 'npm installs and manages packages. npx executes a package binary (from local node_modules or downloaded temporarily) without a global install, e.g. npx create-vite.',
      level: 'Easy',
    },
    {
      q: 'What is a bundler and why do we need one?',
      a: 'A tool that builds a dependency graph from an entry file and outputs optimised assets: resolves npm imports, transpiles (JSX/TS), tree-shakes, minifies, code-splits and hashes file names for caching.',
      level: 'Medium',
    },
    {
      q: 'Why is Vite fast in development?',
      a: 'It serves source files as native ES modules on demand (no full bundle on startup), pre-bundles dependencies with esbuild, and uses Hot Module Replacement to update only the changed module.',
      level: 'Medium',
    },
    {
      q: 'What is tree shaking?',
      a: 'Removing unused exports from the final bundle. It relies on the static structure of ES module import/export.',
      level: 'Medium',
    },
    {
      q: 'ESLint vs Prettier?',
      a: 'ESLint is a linter that finds code-quality problems and potential bugs (unused vars, ==, missing deps). Prettier is an opinionated formatter that only handles code style. They are used together.',
      level: 'Easy',
    },
    {
      q: 'What are the most important ES2015 (ES6) features?',
      a: 'let/const, arrow functions, classes, template literals, destructuring, default/rest/spread, modules, promises, Map/Set, Symbol, iterators/generators and for...of.',
      level: 'Easy',
    },
    {
      q: 'Output?\nconst n = 0;\nconsole.log(n || 10, n ?? 10);',
      a: '10 0. || falls back for any falsy value (0 is falsy); ?? falls back only for null/undefined.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a new folder, run npm init -y, install dayjs, and write index.js (with "type": "module") that prints today\'s date in DD/MM/YYYY format. Add a "start" script.',
      hint: 'import dayjs from "dayjs"; dayjs().format("DD/MM/YYYY")',
      solution: `// terminal
// mkdir date-app && cd date-app && npm init -y && npm install dayjs

// package.json (edit)
// { "type": "module", "scripts": { "start": "node index.js" }, "dependencies": { "dayjs": "^1.11.10" } }

// index.js
import dayjs from 'dayjs';
console.log('Today is', dayjs().format('DD/MM/YYYY'));

// terminal
// npm start`,
    },
    {
      task: 'Create a Vite vanilla project, move your Day 28 to-do app into it (split into main.js, storage.js and ui.js modules), and build it with npm run build.',
      hint: 'Export functions from storage.js and ui.js and import them in main.js.',
      solution: `// src/storage.js
const KEY = 'todos';
export const loadTodos = () => JSON.parse(localStorage.getItem(KEY) || '[]');
export const saveTodos = (todos) => localStorage.setItem(KEY, JSON.stringify(todos));

// src/ui.js
export function renderTodos(list, todos) {
  list.innerHTML = '';
  todos.forEach((t) => {
    const li = document.createElement('li');
    li.textContent = t.text;
    list.appendChild(li);
  });
}

// src/main.js
import { loadTodos, saveTodos } from './storage.js';
import { renderTodos } from './ui.js';
const todos = loadTodos();
const list = document.querySelector('#list');
document.querySelector('#form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.querySelector('#text');
  todos.push({ id: Date.now(), text: input.value });
  saveTodos(todos);
  renderTodos(list, todos);
  input.value = '';
});
renderTodos(list, todos);

// terminal: npm run build  -> dist/ folder ready to deploy`,
    },
    {
      task: 'Add ESLint and Prettier to the project with lint, lint:fix and format scripts, and fix all reported problems.',
      hint: 'npm init @eslint/config@latest creates the config interactively.',
      solution: `// terminal
// npm install -D eslint @eslint/js globals prettier eslint-config-prettier

// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
export default [
  js.configs.recommended,
  { languageOptions: { globals: globals.browser }, rules: { eqeqeq: 'error', 'prefer-const': 'error' } },
  prettier,
];

// package.json
// "scripts": { "lint": "eslint .", "lint:fix": "eslint . --fix", "format": "prettier --write ." }`,
    },
    {
      task: 'Rewrite this old ES5 code with modern features: var self = this; var name = user && user.profile && user.profile.name ? user.profile.name : "Guest"; var copy = Object.assign({}, obj, { a: 1 }); var last = arr[arr.length - 1];',
      hint: 'Use ?., ??, spread and .at().',
      solution: `const user = { profile: null };
const obj = { b: 2 };
const arr = [1, 2, 3];

const name = user?.profile?.name ?? 'Guest';
const copy = { ...obj, a: 1 };
const last = arr.at(-1);
console.log(name, copy, last); // Guest { b: 2, a: 1 } 3`,
    },
  ],
  quiz: [
    {
      question: 'Which command installs a package only for development?',
      options: ['npm install pkg', 'npm install -D pkg', 'npm run pkg', 'npx pkg'],
      answer: 1,
      explanation: '-D (or --save-dev) adds it to devDependencies.',
    },
    {
      question: 'Which version does "^2.3.1" NOT allow?',
      options: ['2.3.5', '2.9.0', '3.0.0', '2.3.1'],
      answer: 2,
      explanation: 'Caret ranges never allow a new MAJOR version.',
    },
    {
      question: 'Which file guarantees identical installs on every machine?',
      options: ['package.json', '.gitignore', 'vite.config.js', 'package-lock.json'],
      answer: 3,
      explanation: 'The lock file records exact versions of the whole dependency tree.',
    },
    {
      question: 'Prettier is mainly responsible for...',
      options: ['Code formatting', 'Finding logic bugs', 'Bundling', 'Installing packages'],
      answer: 0,
      explanation: 'Prettier formats; ESLint finds problems.',
    },
    {
      question: 'Which feature arrived in ES2020?',
      options: ['Arrow functions', 'async/await', 'Optional chaining ?.', 'toSorted()'],
      answer: 2,
      explanation: '?. and ?? were added in ES2020.',
    },
  ],
};
