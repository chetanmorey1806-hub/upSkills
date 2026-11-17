export default {
  id: 'day-02-setup-with-vite',
  title: 'React Setup with Vite: Project Structure, npm Scripts and React DevTools',
  module: 'Module 1: React Fundamentals',
  day: 2,
  level: 'Beginner',
  duration: '1.5 hours',
  summary:
    'Create a real React project on your computer using Vite, understand every file in the generated folder, use npm scripts to run and build the app, and inspect components with React DevTools.',
  objectives: [
    'Install Node.js and create a React project with npm create vite',
    'Explain the role of index.html, main.jsx, App.jsx and package.json',
    'Use npm run dev, npm run build and npm run preview',
    'Install React DevTools and inspect components, props and state',
  ],
  theory: [
    {
      heading: 'Prerequisites: Node.js and npm',
      content:
        'React code runs in the browser, but the **tools** that build your project (Vite, Babel, ESLint) run on **Node.js**. Installing Node.js also installs **npm** (Node Package Manager), which downloads libraries like React from the npm registry.\n\nCheck your installation in a terminal:\n\n- `node -v` should print v18 or newer (v20+ recommended)\n- `npm -v` prints the npm version',
      tip: 'Install the LTS (Long Term Support) version of Node.js from nodejs.org. Odd-numbered "Current" versions can break tools.',
    },
    {
      heading: 'Why Vite (and not Create React App)?',
      content:
        '**Vite** (French for "fast") is a modern build tool. During development it serves your files as native ES modules, so the dev server starts in milliseconds and changes appear instantly thanks to **HMR (Hot Module Replacement)**. For production it bundles and minifies with Rollup.\n\n**Create React App (CRA)** was the old official starter, but it is slow and has been deprecated. The React docs now recommend a framework (like Next.js) or a build tool like Vite.\n\nAnalogy: CRA is like cooking the whole meal before tasting; Vite gives you each dish the moment you ask for it.',
      syntax: `npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev`,
      tip: 'Use the template "react-ts" if you want TypeScript (Day 28).',
    },
    {
      heading: 'Project structure explained',
      content:
        'After creation, your folder looks like this:',
      syntax: `my-app/
├── node_modules/      # installed packages (never edit, never commit)
├── public/            # static files copied as-is (favicon, robots.txt)
├── src/
│   ├── assets/        # images/fonts imported from code
│   ├── App.css
│   ├── App.jsx        # root component
│   ├── index.css      # global styles
│   └── main.jsx       # entry point: renders <App /> into #root
├── .gitignore
├── eslint.config.js
├── index.html         # the single HTML page (Vite entry)
├── package.json       # project info, scripts, dependencies
├── package-lock.json  # exact installed versions
└── vite.config.js     # Vite configuration (React plugin)`,
      points: [
        '**index.html** lives in the project root and contains `<div id="root"></div>` and `<script type="module" src="/src/main.jsx">`',
        '**main.jsx** creates the React root and renders App inside StrictMode',
        '**App.jsx** is where you start writing your UI',
        'Files in **src/** are processed by Vite; files in **public/** are served unchanged',
      ],
    },
    {
      heading: 'package.json and npm scripts',
      content:
        '`package.json` describes your project. The **dependencies** section lists packages needed at runtime (react, react-dom). **devDependencies** are tools needed only while developing (vite, eslint, @vitejs/plugin-react).\n\nThe **scripts** section defines shortcuts that you run with `npm run <name>`:',
      syntax: `"scripts": {
  "dev": "vite",               // start dev server with HMR (http://localhost:5173)
  "build": "vite build",       // create optimized production files in dist/
  "lint": "eslint .",          // check code quality
  "preview": "vite preview"    // serve the dist/ folder locally to test the build
}`,
      tip: 'Never upload node_modules. Anyone can recreate it from package.json with npm install.',
    },
    {
      heading: 'main.jsx, StrictMode and the root',
      content:
        '`createRoot` (from react-dom/client) connects React to the DOM container. `StrictMode` is a development-only helper that warns about unsafe patterns and intentionally renders components twice (and runs effects twice) in development to expose bugs. It has no effect in production.',
      syntax: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
      tip: 'If you see console.log printed twice in development, that is StrictMode, not a bug in your code.',
    },
    {
      heading: 'React Developer Tools',
      content:
        'React DevTools is a browser extension (Chrome, Firefox, Edge). After installing it, open the browser DevTools and you get two new tabs:\n\n- **Components**: shows the component tree, and for the selected component its props, state and hooks. You can even edit values live.\n- **Profiler**: records renders so you can see which components re-render and how long they take.\n\nIt works only on pages built with React, and shows real component names in development builds.',
      points: [
        'Use the "select element" picker to jump from the page to its component',
        'Enable "Highlight updates when components render" to see re-renders',
      ],
    },
  ],
  examples: [
    {
      title: 'Create and run a Vite React project',
      scenario: 'Set up a brand-new React app on your laptop and open it in the browser.',
      steps: [
        'Open a terminal in the folder where you keep projects',
        'Run npm create vite@latest my-app -- --template react',
        'Run cd my-app, then npm install',
        'Run npm run dev and open http://localhost:5173',
        'Edit src/App.jsx, save, and watch the browser update instantly (HMR)',
      ],
      code: `npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev

# VITE v6.x ready in 300 ms
# ➜  Local:   http://localhost:5173/`,
      playground: {
        jsx: `// Playground note: we cannot run a terminal here, so this demo
// shows what a freshly created Vite + React App.jsx looks like.
function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div className="app">
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount(c => c + 1)}>count is {count}</button>
        <p>Edit <code>src/App.jsx</code> and save to test HMR</p>
      </div>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #242424; color: #fff; display: grid; place-items: center; min-height: 90vh; }
.app { text-align: center; }
h1 { font-size: 2.4rem; }
button { padding: .6em 1.2em; border-radius: 8px; border: 1px solid transparent; background: #1a1a1a; color: #fff; cursor: pointer; font-size: 1rem; }
button:hover { border-color: #646cff; }
code { background: #333; padding: 2px 4px; border-radius: 4px; }`,
      },
      result: 'The Vite starter page with a "count is 0" button that increments on click.',
      explanation:
        'npm create vite downloads the template, npm install fetches react, react-dom and vite into node_modules, and npm run dev executes the "dev" script which starts the Vite dev server.',
    },
    {
      title: 'Understanding main.jsx and App.jsx',
      scenario: 'Replace the starter content with your own App and see how main.jsx connects it to index.html.',
      steps: [
        'Open index.html and find <div id="root"></div>',
        'Open src/main.jsx and see createRoot(...).render(<App />)',
        'Replace the contents of src/App.jsx with the code below and save',
      ],
      code: `// index.html (body)
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>

// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode><App /></StrictMode>
);

// src/App.jsx
function App() {
  return (
    <main>
      <h1>My First Vite App</h1>
      <p>Rendered from App.jsx into #root</p>
    </main>
  );
}
export default App;`,
      playground: {
        jsx: `// In the playground React renders <App /> into #root for you
// (this is exactly what main.jsx does in a Vite project).
function App() {
  return (
    <main>
      <h1>My First Vite App</h1>
      <p>Rendered from App.jsx into #root</p>
      <p className="hint">Root element id: <b>{document.getElementById("root") ? "root ✔" : "?"}</b></p>
    </main>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.hint { color: #555; }`,
      },
      result: 'The heading "My First Vite App" and two lines of text.',
      explanation:
        'The browser loads index.html, which loads main.jsx as an ES module. main.jsx imports App and renders it into the #root div. export default App lets main.jsx import it.',
    },
    {
      title: 'npm scripts: dev vs build vs preview',
      scenario: 'Create a production build, check the dist folder and preview it locally.',
      steps: [
        'Stop the dev server with Ctrl + C',
        'Run npm run build and look at the new dist/ folder',
        'Run npm run preview and open http://localhost:4173',
        'Compare the file sizes printed in the terminal',
      ],
      code: `npm run build
# vite v6.x building for production...
# dist/index.html                  0.46 kB
# dist/assets/index-BX12abcd.css   1.39 kB
# dist/assets/index-C9xyz123.js  143.60 kB │ gzip: 46.10 kB
# ✓ built in 1.2s

npm run preview
# ➜  Local:   http://localhost:4173/`,
      playground: {
        jsx: `const scripts = [
  { name: "dev", cmd: "vite", use: "Start dev server with HMR on port 5173", when: "While coding" },
  { name: "build", cmd: "vite build", use: "Bundle + minify into dist/", when: "Before deploying" },
  { name: "preview", cmd: "vite preview", use: "Serve dist/ locally on port 4173", when: "To test the build" },
  { name: "lint", cmd: "eslint .", use: "Find code problems", when: "Before committing" },
];

function App() {
  const [selected, setSelected] = React.useState("dev");
  const s = scripts.find(x => x.name === selected);
  return (
    <div>
      <h2>npm scripts explorer</h2>
      {scripts.map(x => (
        <button key={x.name} className={x.name === selected ? "on" : ""} onClick={() => setSelected(x.name)}>
          npm run {x.name}
        </button>
      ))}
      <div className="panel">
        <p><b>Runs:</b> <code>{s.cmd}</code></p>
        <p><b>Does:</b> {s.use}</p>
        <p><b>When:</b> {s.when}</p>
      </div>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
button { margin: 4px; padding: 6px 10px; border: 1px solid #888; background: #fff; border-radius: 6px; cursor: pointer; }
button.on { background: #087ea4; color: #fff; }
.panel { margin-top: 12px; padding: 12px; background: #f3f6f8; border-radius: 8px; }`,
      },
      result: 'Clicking each "npm run" button shows what that script runs and when to use it.',
      explanation:
        'npm run <name> looks up the name in the scripts section of package.json and runs the command with the project\'s local node_modules/.bin on the PATH, which is why "vite" works without a global install.',
    },
    {
      title: 'Inspecting components with React DevTools',
      scenario: 'Use the Components tab to look at props and state of a running app.',
      steps: [
        'Install "React Developer Tools" from the Chrome Web Store or Firefox Add-ons',
        'Run your Vite app (npm run dev) and open browser DevTools (F12)',
        'Open the "Components" tab and select Greeting',
        'See its props (name) and, for Counter, its State hook; edit the value live',
      ],
      code: `function Greeting({ name }) {
  return <h2>Hello, {name}</h2>;
}

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count}</button>;
}

export default function App() {
  return (
    <>
      <Greeting name="Asha" />
      <Counter />
    </>
  );
}`,
      playground: {
        jsx: `function Greeting({ name }) {
  return <h2>Hello, {name}</h2>;
}

function Counter() {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}

function App() {
  return (
    <>
      <Greeting name="Asha" />
      <Counter />
      <p className="note">Open React DevTools → Components to see App › Greeting (props) and Counter (state).</p>
    </>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.note { color: #666; font-size: .9rem; }`,
      },
      result: 'A greeting and a click counter; in DevTools the tree shows App, Greeting and Counter.',
      explanation:
        'DevTools reads React\'s internal component tree, so you see components (Greeting, Counter) rather than raw divs. Props appear under "props" and useState values under "hooks".',
    },
  ],
  interview: [
    { q: 'What is Vite and why is it preferred for new React projects?', a: 'Vite is a build tool and dev server. It serves source files as native ES modules in development, giving near-instant startup and fast HMR, and uses Rollup to create optimized production bundles. CRA is deprecated and much slower.', level: 'Easy' },
    { q: 'What is HMR?', a: 'Hot Module Replacement: when you save a file, only that module is replaced in the running app, usually keeping component state, instead of reloading the whole page.', level: 'Easy' },
    { q: 'Difference between dependencies and devDependencies?', a: 'dependencies are needed at runtime in the shipped app (react, react-dom). devDependencies are only needed for development and building (vite, eslint, testing tools).', level: 'Easy' },
    { q: 'What does npm run build produce?', a: 'A dist/ folder containing index.html and hashed, minified, tree-shaken JS and CSS files ready to be hosted on any static server.', level: 'Medium' },
    { q: 'Why should node_modules not be committed to Git?', a: 'It is huge and fully reproducible from package.json and package-lock.json by running npm install. It is listed in .gitignore.', level: 'Easy' },
    { q: 'What is the purpose of package-lock.json?', a: 'It records the exact versions of every installed package (including nested ones) so every developer and CI server installs the identical dependency tree.', level: 'Medium' },
    { q: 'What is React.StrictMode?', a: 'A development-only wrapper that enables extra checks: it double-invokes render functions and effects, warns about deprecated APIs, and helps find impure components. It renders nothing visible and has no effect in production.', level: 'Medium' },
    { q: 'Why does index.html sit in the root folder in Vite but inside public/ in CRA?', a: 'In Vite, index.html is the entry point of the module graph; Vite parses its script tags to find main.jsx. CRA used webpack with a JS entry and treated index.html as a template.', level: 'Hard' },
    { q: 'What is the difference between the public folder and src/assets?', a: 'Files in public are copied as-is and referenced by absolute path (/logo.png). Files in src/assets are imported in code, processed, hashed and optimized by Vite.', level: 'Medium' },
    { q: 'What can you do with React DevTools?', a: 'Inspect the component tree, view and edit props, state and hooks, find which component renders a DOM element, and profile render performance with the Profiler tab.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a Vite React project named portfolio and change the App title to "My Portfolio".',
      hint: 'npm create vite@latest portfolio -- --template react, then edit src/App.jsx.',
      solution: `// Terminal
// npm create vite@latest portfolio -- --template react
// cd portfolio && npm install && npm run dev

// src/App.jsx
function App() {
  return <h1>My Portfolio</h1>;
}
export default App;`,
    },
    {
      task: 'Add a custom npm script "start" that runs the Vite dev server, so npm start works.',
      hint: 'npm start is a special shortcut that runs the "start" script.',
      solution: `// package.json
"scripts": {
  "start": "vite",
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}`,
    },
    {
      task: 'Change the dev server port to 3000 and make it open the browser automatically.',
      hint: 'Use the server option in vite.config.js.',
      solution: `// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, open: true },
});`,
    },
    {
      task: 'Build a component that shows a checklist of setup steps (Node installed, project created, dev server running) and lets you tick each one.',
      hint: 'Keep an array of booleans in state and toggle by index.',
      solution: `const steps = ["Node.js installed", "Project created with Vite", "npm install done", "npm run dev running"];

function App() {
  const [done, setDone] = React.useState(steps.map(() => false));
  const toggle = i => setDone(done.map((d, j) => (j === i ? !d : d)));
  return (
    <div>
      <h2>Setup checklist ({done.filter(Boolean).length}/{steps.length})</h2>
      {steps.map((s, i) => (
        <label key={s} style={{ display: "block" }}>
          <input type="checkbox" checked={done[i]} onChange={() => toggle(i)} /> {s}
        </label>
      ))}
    </div>
  );
}`,
    },
  ],
  quiz: [
    { question: 'Which command creates a new React project with Vite?', options: ['npx react-new my-app', 'npm create vite@latest my-app -- --template react', 'npm install react-app', 'vite new react'], answer: 1, explanation: 'npm create vite@latest scaffolds a project; --template react selects React.' },
    { question: 'Which file renders <App /> into the #root element in a Vite project?', options: ['index.css', 'vite.config.js', 'package.json', 'src/main.jsx'], answer: 3, explanation: 'main.jsx calls createRoot(document.getElementById("root")).render(<App />).' },
    { question: 'What does npm run build create?', options: ['A dist/ folder with optimized files', 'A node_modules folder', 'A new React project', 'A Git commit'], answer: 0, explanation: 'vite build outputs a production-ready dist/ folder.' },
    { question: 'Default port of the Vite dev server?', options: ['3000', '8080', '5173', '4200'], answer: 2, explanation: 'Vite uses 5173 by default (preview uses 4173).' },
    { question: 'Why do logs appear twice in development with StrictMode?', options: ['A bug in React', 'StrictMode intentionally double-renders to find impure code', 'Vite runs two servers', 'The browser duplicates console output'], answer: 1, explanation: 'StrictMode double-invokes renders and effects only in development.' },
  ],
};
