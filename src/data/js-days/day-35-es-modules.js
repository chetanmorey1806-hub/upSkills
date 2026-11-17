const ex1code = `// ===== math.js =====
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export function circleArea(r) { return PI * r * r; }

// ===== main.js =====
import { add, circleArea, PI } from './math.js';
console.log(add(2, 3));          // 5
console.log(circleArea(2));      // 12.56636
console.log(PI);                 // 3.14159

// ===== index.html =====
// <script type="module" src="main.js"></script>`;

const ex1 = `// The playground is a single file, so we create a "virtual file" with a data: URL
// and load it with dynamic import(). In a real project this would be ./math.js.
const mathJs = \`
  export const PI = 3.14159;
  export function add(a, b) { return a + b; }
  export function circleArea(r) { return PI * r * r; }
\`;
const url = 'data:text/javascript,' + encodeURIComponent(mathJs);

import(url).then(({ add, circleArea, PI }) => {   // named imports (destructured)
  console.log('add(2, 3) =', add(2, 3));
  console.log('circleArea(2) =', circleArea(2).toFixed(2));
  console.log('PI =', PI);
});`;

const ex2code = `// ===== logger.js =====
export default function log(msg) {          // ONE default export
  console.log('[LOG] ' + msg);
}
export const LEVEL = 'info';                // plus named exports

// ===== main.js =====
import log, { LEVEL } from './logger.js';   // default name is YOUR choice
import writeLog from './logger.js';         // same default, different name
log('App started');
writeLog('Level is ' + LEVEL);`;

const ex2 = `const loggerJs = \`
  export default function log(msg) { console.log('[LOG] ' + msg); }
  export const LEVEL = 'info';
\`;
const url = 'data:text/javascript,' + encodeURIComponent(loggerJs);

import(url).then((mod) => {
  // A module namespace object: default export lives under the key "default"
  console.log('exports:', Object.keys(mod).sort().join(', '));
  const log = mod.default;          // same as: import log from './logger.js'
  const writeLog = mod.default;     // you can pick any name for a default
  log('App started');
  writeLog('Level is ' + mod.LEVEL);
});`;

const ex3code = `// ===== utils/string.js =====
export const upper = (s) => s.toUpperCase();
export const lower = (s) => s.toLowerCase();

// ===== utils/index.js (barrel file: re-exports) =====
export * from './string.js';
export { default as formatPrice } from './price.js';

// ===== main.js =====
import { upper as shout } from './utils/index.js';   // rename on import
import * as utils from './utils/index.js';           // namespace import
console.log(shout('hi'));          // HI
console.log(utils.lower('HEY'));   // hey`;

const ex3 = `const stringJs = \`
  export const upper = (s) => s.toUpperCase();
  export const lower = (s) => s.toLowerCase();
  const secret = 'not exported';   // private to the module
\`;
const url = 'data:text/javascript,' + encodeURIComponent(stringJs);

async function main() {
  'use strict'; // module code is always strict - we mimic that here
  const { upper: shout } = await import(url);  // like: import { upper as shout }
  const utils = await import(url);             // like: import * as utils
  console.log(shout('hi'));
  console.log(utils.lower('HEY'));
  console.log('secret exported?', 'secret' in utils);
  // Modules are cached: importing again gives the SAME object
  console.log('same module object?', utils === (await import(url)));
  // Imports are read-only live bindings
  try {
    utils.upper = null;
  } catch (err) {
    console.log('Cannot reassign an import:', err.constructor.name);
  }
}
main();`;

const ex4code = `// Lazy-load a heavy module only when it is needed
button.addEventListener('click', async () => {
  const { renderChart } = await import('./chart.js');  // separate file, loaded on demand
  renderChart(data);
});`;

const ex4html = `<button id="load">Open chart (lazy-load module)</button>
<p id="status">Chart module not loaded yet.</p>
<div id="chart"></div>`;

const ex4css = `body { font-family: system-ui, sans-serif; }
.bar { height: 22px; background: #42a5f5; color: #fff; margin: 4px 0; padding-left: 6px; border-radius: 4px; font-size: 13px; line-height: 22px; }`;

const ex4js = `// Pretend this string is the file chart.js (a big library we do not want on page load)
const chartJs = \`
  export function renderChart(el, data) {
    el.innerHTML = '';
    for (const [label, value] of Object.entries(data)) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.width = value * 3 + 'px';
      bar.textContent = label + ': ' + value;
      el.appendChild(bar);
    }
  }
\`;
const chartUrl = 'data:text/javascript,' + encodeURIComponent(chartJs);

document.querySelector('#load').addEventListener('click', async () => {
  const status = document.querySelector('#status');
  status.textContent = 'Loading chart module...';
  try {
    const { renderChart } = await import(chartUrl);   // dynamic import returns a promise
    renderChart(document.querySelector('#chart'), { Mon: 40, Tue: 75, Wed: 55, Thu: 90 });
    status.textContent = 'Chart module loaded on demand.';
  } catch (err) {
    status.textContent = 'Failed to load module: ' + err.message;
  }
});`;

const ex5 = `// Before ES modules: the IIFE "module pattern" (still seen in old code)
const Counter = (function () {
  let count = 0;                    // private - hidden inside the function scope
  function increment() { count++; return count; }
  function reset() { count = 0; }
  return { increment, reset };      // the "exports"
})();

console.log(Counter.increment());
console.log(Counter.increment());
console.log('count visible?', typeof count !== 'undefined');

// CommonJS (Node.js classic) for comparison - shown as text only:
const cjs = "const fs = require('fs');  module.exports = { readConfig };";
const esm = "import fs from 'fs';       export { readConfig };";
console.log('CommonJS :', cjs);
console.log('ES Module:', esm);`;

export default {
  id: 'day-35-es-modules',
  title: 'ES Modules: import / export, Default vs Named',
  module: 'Module 6: Advanced JavaScript',
  day: 35,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary:
    'ES Modules let you split JavaScript into small files that explicitly export what they share and import what they need. They are the standard way every modern project (Vite, React, Node.js) organises code.',
  objectives: [
    'Explain why modules exist and the problems of global scripts',
    'Use named exports/imports, renaming with as, and namespace imports',
    'Use default exports and know when to choose default vs named',
    'Load modules in the browser with <script type="module"> and lazily with dynamic import()',
    'Recognise CommonJS (require/module.exports) and the old IIFE pattern',
  ],
  theory: [
    {
      heading: 'Why Modules?',
      content:
        'In early JavaScript every `<script>` shared one **global scope**. With many files you got name clashes ("who overwrote my `init` function?"), hidden dependencies and a strict script order you had to remember.\n\nA **module** is simply a JS file with its **own scope**. Nothing leaks out unless you `export` it, and nothing comes in unless you `import` it.\n\nAnalogy: modules are like rooms in a house with doors. Each room keeps its own furniture (variables) private, and you only pass items through the door (export/import) on purpose.',
      points: [
        'Each module has its own top-level scope (no accidental globals)',
        'Dependencies are explicit and visible at the top of the file',
        'Modules are loaded once and cached – every importer shares the same instance',
        'Modules always run in strict mode',
      ],
    },
    {
      heading: 'Named Exports and Imports',
      content:
        'A file can have **many named exports**. Import them with curly braces using the **exact same names**. Use `as` to rename, and `* as name` to get all exports as one object (namespace import).',
      syntax: `// math.js
export const PI = 3.14;
export function add(a, b) { return a + b; }
const sub = (a, b) => a - b;
export { sub };                 // export list at the bottom also works

// main.js
import { PI, add } from './math.js';
import { sub as minus } from './math.js';
import * as math from './math.js';  // math.PI, math.add(...)`,
      tip: 'In the browser, import paths need the file extension and must be relative ("./math.js"), absolute or a full URL. Bare names like "lodash" work only with a bundler (Vite) or an import map.',
    },
    {
      heading: 'Default Export',
      content:
        'Each module can have **at most one default export** – "the main thing this file provides" (e.g. a React component or a class). Import it **without braces** and with **any name** you like.\n\nYou can combine both: `import React, { useState } from "react";`\n\n**Default vs named – which one?**\n- Named exports: better for utility files with several functions; names stay consistent across the codebase and editors can auto-import them; renaming is explicit\n- Default export: when a file has one main thing (component, class, config)\n\nMany teams prefer named exports for consistency.',
      syntax: `// User.js
export default class User { /* ... */ }

// main.js
import User from './User.js';
import Person from './User.js';   // same thing, different local name`,
      tip: 'Common mistake: import { User } from "./User.js" when User is a DEFAULT export → undefined / SyntaxError "does not provide an export named User".',
    },
    {
      heading: 'Using Modules in the Browser',
      content:
        'Add `type="module"` to the script tag:\n\n`<script type="module" src="main.js"></script>`\n\nModule scripts are special:\n- **Deferred automatically** – they run after the HTML is parsed (like `defer`)\n- **Strict mode** by default\n- Top-level `this` is `undefined`, top-level variables are not globals\n- Must be served over **http(s)** – opening the HTML file directly (file://) causes CORS errors; use a local server like VS Code Live Server or Vite\n- **Top-level await** is allowed',
      syntax: `<script type="module">
  import { add } from './math.js';
  const data = await fetch('/api').then(r => r.json()); // top-level await
</script>`,
    },
    {
      heading: 'Re-exports and Barrel Files',
      content:
        'A **barrel file** (usually `index.js`) collects exports from several files so others can import from one place.\n\n- `export * from "./string.js"` – re-export all named exports\n- `export { default as Button } from "./Button.js"` – re-export a default under a name\n- `export { format as formatDate } from "./date.js"` – re-export with rename',
    },
    {
      heading: 'Dynamic import() and Other Module Systems',
      content:
        '`import("./file.js")` is a **function-like expression** that returns a **promise** for the module object. Use it to load code **only when needed** (code splitting / lazy loading), e.g. a chart library when the user opens the chart tab.\n\n**Other module systems you will meet:**\n- **CommonJS** (classic Node.js): `const fs = require("fs")` and `module.exports = {...}`. Synchronous, not native in browsers.\n- **IIFE module pattern** (pre-2015): a function that runs immediately and returns a public object, keeping other variables private through closure (Day 13).\n\nStatic `import` declarations must be at the top level (not inside if/functions); dynamic `import()` can be used anywhere.',
      tip: 'Coming next (Day 36): classes – often each class lives in its own module as a default or named export.',
    },
  ],
  examples: [
    {
      title: 'Named exports and imports',
      scenario: 'A math.js utility module exporting a constant and two functions, used by main.js.',
      steps: [
        'Create math.js and add export in front of PI, add and circleArea',
        'Create main.js and import { add, circleArea, PI } from "./math.js"',
        'Load main.js with <script type="module"> and serve with a local server',
        'In the playground (single file) click Run – it simulates math.js with a data: URL',
      ],
      code: ex1code,
      playground: { js: ex1 },
      result: 'add(2, 3) = 5\ncircleArea(2) = 12.57\nPI = 3.14159',
      explanation:
        'Only exported names are visible to the importer. The playground uses dynamic import() of a data: URL because it cannot create a second file; destructuring the module object is exactly what import { add, circleArea, PI } does.',
    },
    {
      title: 'Default export (plus a named one)',
      scenario: 'A logger module whose main export is the log function.',
      steps: [
        'Write export default function log(...) in logger.js',
        'Add a named export LEVEL',
        'Import the default without braces and the named one with braces',
        'Click Run to see the module object keys',
      ],
      code: ex2code,
      playground: { js: ex2 },
      result: 'exports: LEVEL, default\n[LOG] App started\n[LOG] Level is info',
      explanation:
        'A default export is really just an export named "default". That is why you can give it any local name when importing, while named exports must match.',
    },
    {
      title: 'Renaming, namespace imports, privacy and caching',
      scenario: 'Use as and * as, prove that non-exported values stay private and modules are singletons.',
      steps: [
        'Create a string utils module with one non-exported variable',
        'Import upper with a new name and import everything as utils',
        'Check if secret is visible, import twice and compare, try to reassign an import',
        'Click Run',
      ],
      code: ex3code,
      playground: { js: ex3 },
      result: 'HI\nhey\nsecret exported? false\nsame module object? true\nCannot reassign an import: TypeError',
      explanation:
        'Non-exported variables are private to the module. A module is evaluated only once and cached, so every import gets the same object. Imports are read-only bindings, so assigning to them throws a TypeError.',
    },
    {
      title: 'Lazy-loading a module with dynamic import()',
      scenario: 'Load a "heavy" chart module only when the user clicks the button.',
      steps: [
        'Create a button and an empty chart container',
        'On click, await import(...) the chart module',
        'Call the exported renderChart function',
        'Click the button',
      ],
      code: ex4code,
      playground: { html: ex4html, css: ex4css, js: ex4js },
      result:
        'Initially "Chart module not loaded yet." After clicking: four blue bars (Mon: 40, Tue: 75, Wed: 55, Thu: 90) and the text "Chart module loaded on demand."',
      explanation:
        'import() returns a promise, so we await it. Bundlers like Vite turn each import() into a separate file (chunk), so users do not download the chart code until they need it.',
    },
    {
      title: 'Before ES modules: IIFE pattern and CommonJS',
      scenario: 'Understand older code you will still find in many projects.',
      steps: [
        'Write an IIFE that keeps count private and returns { increment, reset }',
        'Call the public methods and check that count is not global',
        'Compare CommonJS and ESM syntax, then click Run',
      ],
      code: ex5,
      playground: { js: ex5 },
      result:
        "1\n2\ncount visible? false\nCommonJS : const fs = require('fs');  module.exports = { readConfig };\nES Module: import fs from 'fs';       export { readConfig };",
      explanation:
        'The IIFE creates a private scope; the returned object acts like exports, and closure keeps count alive. ES modules give the same privacy with cleaner syntax and are understood natively by browsers and Node.js.',
    },
  ],
  interview: [
    {
      q: 'What is an ES module?',
      a: 'A JavaScript file with its own scope that shares values using export and consumes others with import. ES modules are the official standard module system (ES2015), supported natively by browsers and Node.js.',
      level: 'Easy',
    },
    {
      q: 'Difference between named and default exports?',
      a: 'A module can have many named exports, imported with braces and the exact names (renamable with as). It can have only one default export, imported without braces under any name.',
      level: 'Easy',
    },
    {
      q: 'How do you use modules in the browser?',
      a: '<script type="module" src="main.js"></script>. Module scripts are deferred, run in strict mode, have their own scope, and must be served over HTTP(S), not file://.',
      level: 'Easy',
    },
    {
      q: 'What is dynamic import()?',
      a: 'import(path) loads a module at runtime and returns a promise for its namespace object. It is used for lazy loading / code splitting and can be called conditionally or inside functions.',
      level: 'Medium',
    },
    {
      q: 'ES Modules vs CommonJS?',
      a: 'ESM: import/export, static structure analysable at build time (tree shaking), asynchronous loading, live read-only bindings, native in browsers. CommonJS: require/module.exports, synchronous, dynamic, copies of values, Node.js-specific.',
      level: 'Medium',
    },
    {
      q: 'What is tree shaking?',
      a: 'A bundler optimisation that removes exports that are never imported. It works because ES module imports/exports are static and can be analysed without running the code.',
      level: 'Medium',
    },
    {
      q: 'If two files import the same module, is it executed twice?',
      a: 'No. A module is evaluated once and cached; all importers share the same instance (singleton), so module-level state is shared.',
      level: 'Medium',
    },
    {
      q: 'What is a barrel file?',
      a: 'An index.js that re-exports from several modules (export * from "./a.js"; export { default as B } from "./b.js") so consumers can import from one path.',
      level: 'Easy',
    },
    {
      q: 'What is the value of this at the top level of a module?',
      a: 'undefined, because modules run in strict mode. In a classic script it is the window object.',
      level: 'Hard',
    },
    {
      q: 'Why do you get a CORS error when opening a module page via file://?',
      a: 'Module scripts are fetched with CORS rules, and file:// URLs have a null origin, so browsers block them. Serve the files with a local server (Live Server, npx serve, Vite).',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a module temperature.js with named exports cToF(c) and fToC(f), import them in main.js and log cToF(100) and fToC(32).',
      hint: 'F = C * 9/5 + 32',
      solution: `// temperature.js
export const cToF = (c) => c * 9 / 5 + 32;
export const fToC = (f) => (f - 32) * 5 / 9;

// main.js
import { cToF, fToC } from './temperature.js';
console.log(cToF(100)); // 212
console.log(fToC(32));  // 0

// index.html
// <script type="module" src="main.js"></script>`,
    },
    {
      task: 'Create a Cart.js module whose default export is a createCart() function, plus a named export TAX_RATE = 0.18. Import both in main.js and print a total.',
      hint: 'import createCart, { TAX_RATE } from "./Cart.js"',
      solution: `// Cart.js
export const TAX_RATE = 0.18;
export default function createCart() {
  const items = [];
  return {
    add(name, price) { items.push({ name, price }); },
    total() { return items.reduce((s, i) => s + i.price, 0) * (1 + TAX_RATE); },
  };
}

// main.js
import createCart, { TAX_RATE } from './Cart.js';
const cart = createCart();
cart.add('Pen', 100);
console.log('Tax', TAX_RATE, 'Total', cart.total()); // Total 118`,
    },
    {
      task: 'Create utils/index.js that re-exports everything from utils/math.js and utils/string.js, then import two functions from "./utils/index.js".',
      hint: 'export * from "./math.js";',
      solution: `// utils/math.js
export const double = (n) => n * 2;
// utils/string.js
export const capitalize = (s) => s[0].toUpperCase() + s.slice(1);
// utils/index.js
export * from './math.js';
export * from './string.js';
// main.js
import { double, capitalize } from './utils/index.js';
console.log(double(4), capitalize('hello')); // 8 Hello`,
    },
    {
      task: 'Add a "Show help" button that lazy-loads a help.js module with dynamic import() and displays its exported text.',
      hint: 'const { helpText } = await import("./help.js");',
      solution: `// help.js
export const helpText = 'Press N for new item, S to save.';

// main.js (loaded with type="module")
document.querySelector('#help').addEventListener('click', async () => {
  const { helpText } = await import('./help.js');
  document.querySelector('#out').textContent = helpText;
});`,
    },
  ],
  quiz: [
    {
      question: 'How many default exports can one module have?',
      options: ['Unlimited', 'One', 'Two', 'None'],
      answer: 1,
      explanation: 'At most one default export per module.',
    },
    {
      question: 'Which import is correct for: export const sum = ...?',
      options: ['import sum from "./m.js"', 'import "sum" from "./m.js"', 'require sum', 'import { sum } from "./m.js"'],
      answer: 3,
      explanation: 'Named exports are imported with braces and the same name.',
    },
    {
      question: 'What attribute makes a script tag load as a module?',
      options: ['type="module"', 'module="true"', 'defer', 'async'],
      answer: 0,
      explanation: '<script type="module"> enables import/export.',
    },
    {
      question: 'What does import("./a.js") return?',
      options: ['The module object directly', 'undefined', 'A Promise for the module object', 'A string'],
      answer: 2,
      explanation: 'Dynamic import is asynchronous and returns a promise.',
    },
    {
      question: 'How do you rename a named import?',
      options: ['import { add => plus }', 'import { add as plus } from "./m.js"', 'import add: plus', 'import plus = add'],
      answer: 1,
      explanation: 'Use the as keyword inside the braces.',
    },
  ],
};
