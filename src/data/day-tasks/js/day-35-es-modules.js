export default {
  lesson: 'day-35-es-modules',
  minutes: 25,
  intro: 'Use named and default exports and imports, load modules in the browser, and recognise the IIFE and CommonJS patterns.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: '`math.js` contains `export const PI = 3.14;` and `export function area(r) { ... }`. Which import is correct?',
      options: ['import PI, area from "./math.js";', 'import { PI, area } from "./math.js";', 'import * from "./math.js";', 'require { PI, area } from "./math.js";'],
      answer: 1,
      explain: '**Named** exports are imported with curly braces and the exact names: `import { PI, area } from "./math.js"`. Without braces you would be importing the **default** export, which this file does not have.',
    },
    {
      type: 'fill',
      mins: 2,
      q: '`cart.js` has `export default function addToCart(item) { ... }`. Write the import line in `app.js` that imports it under the name **add** (path `./cart.js`).',
      accept: ['import add from "./cart.js"', "import add from './cart.js'", 'import add from "./cart.js";', "import add from './cart.js';", 'import { default as add } from "./cart.js"', "import { default as add } from './cart.js'", 'import { default as add } from "./cart.js";', "import { default as add } from './cart.js';"],
      explain: 'A default export is imported **without braces**, and you can choose any local name. A file can have only one default export but many named exports.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Import the named export `formatPrice` from `./utils.js` but call it `money` in this file. Write the full import statement.',
      accept: ['import { formatPrice as money } from "./utils.js"', "import { formatPrice as money } from './utils.js'", 'import { formatPrice as money } from "./utils.js";', "import { formatPrice as money } from './utils.js';"],
      explain: '`as` renames an import (useful to avoid name clashes). You can also import everything as a namespace: `import * as utils from "./utils.js"` and call `utils.formatPrice()`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about ES modules in the browser are TRUE? (choose all that apply)',
      options: ['You load them with <script type="module" src="app.js">', 'Module scripts are deferred automatically', 'Top-level variables in a module become global window properties', 'Modules run in strict mode automatically', 'They work when you open the HTML file with file:// in every browser without a server'],
      answers: [0, 1, 3],
      explain: 'Modules need `type="module"`, are deferred by default, always use strict mode and have their **own scope** (no accidental globals). Because of CORS rules you usually need a local server (e.g. Vite or Live Server), not `file://`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'When should you use **dynamic** `import("./chart.js")`?',
      options: ['Always, instead of static import', 'To load a heavy module only when it is needed (e.g. when the user opens the reports tab); it returns a promise', 'To import CSS files', 'To make a module run twice'],
      answer: 1,
      explain: '`import()` is a function-like expression that returns a **promise** for the module. Use it for lazy loading, so the first page load stays small. A module is evaluated only once and then cached, even if imported many times.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Before ES modules: the IIFE pattern. What is printed?',
      code: `const counterModule = (function () {
  let count = 0; // private
  return {
    increment() { count++; return count; },
    reset() { count = 0; },
  };
})();
counterModule.increment();
console.log(counterModule.increment());
console.log(typeof count);
console.log(counterModule.count);`,
      expected: '2\nundefined\nundefined',
      explain: 'An **IIFE** (Immediately Invoked Function Expression) creates a private scope: `count` is hidden inside it and only the returned methods can reach it. This is how code was organised before `import`/`export`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Build a module with the IIFE pattern. Create `const gradeBook` using an IIFE that keeps a **private** array of marks and exposes:\n- `add(mark)` → adds a mark\n- `average()` → returns the average (0 if empty)\n- `count()` → returns how many marks there are\n\nThe array must not be reachable as `gradeBook.marks`.',
      example: { title: 'IIFE module', code: 'const logger = (function () {\n  const lines = [];\n  return {\n    log(msg) { lines.push(msg); },\n    size() { return lines.length; },\n  };\n})();' },
      starter: 'const gradeBook = (function () {\n  // TODO: private marks array and public methods\n  return {};\n})();',
      solution: 'const gradeBook = (function () {\n  const marks = [];\n  return {\n    add(mark) { marks.push(mark); },\n    average() {\n      if (marks.length === 0) return 0;\n      return marks.reduce((s, m) => s + m, 0) / marks.length;\n    },\n    count() { return marks.length; },\n  };\n})();',
      tests: [
        { call: '(gradeBook.add(80), gradeBook.add(90), gradeBook.average())', expect: 85 },
        { call: '(gradeBook.add(50), gradeBook.count())', expect: 1 },
        { call: 'gradeBook.average()', expect: 0 },
        { call: 'gradeBook.marks', expect: undefined, msg: 'marks stays private' },
      ],
      explain: 'The returned object is the module\'s **public API**; everything else in the function stays private thanks to closures. ES modules give you the same privacy automatically: anything not exported is private to the file.',
    },
  ],
};
