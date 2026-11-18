export default {
  id: 'day-03-modules-commonjs-vs-es-modules',
  title: 'Modules: CommonJS vs ES Modules, exports, require / import and Built-in Modules',
  module: 'Module 1: Node.js Fundamentals',
  day: 3,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Split code into reusable files with CommonJS (require / module.exports) and ES Modules (import / export), understand how Node decides which system a file uses, how module caching works, and how to load built-in modules with the node: prefix.',
  objectives: [
    'Export and import values with CommonJS (module.exports, exports, require)',
    'Export and import values with ES Modules (named and default exports)',
    'Choose the module system with .cjs / .mjs extensions and the "type" field in package.json',
    'Explain module caching, the module wrapper and why exports = {...} breaks',
    'Load built-in modules with the node: prefix and mix ESM and CommonJS safely',
  ],
  theory: [
    {
      heading: 'Why modules?',
      content:
        'A **module** is simply a file whose variables are **private by default**. You decide what to share by **exporting** it, and other files **import** what they need.\n\nWithout modules, every file would share one global scope: names collide, order matters and code becomes impossible to maintain. With modules you get **encapsulation**, **reuse** and clear **dependencies**.\n\nAnalogy: modules are like **rooms in a house**. Everything inside a room is private; the door (export) decides what can be passed out to other rooms.\n\nNode has three kinds of modules:\n\n1. **Core / built-in modules**: ship with Node (`fs`, `path`, `os`, `http`, `events`, `crypto`, `url`, `util`...)\n2. **Local modules**: your own files, imported with a relative path (`./math.js`)\n3. **Third-party modules**: installed from npm into node_modules (`express`, `mongoose`)',
    },
    {
      heading: 'CommonJS (CJS): require and module.exports',
      content:
        '**CommonJS** is Node\'s original module system (2009) and still the default for `.js` files when package.json has no `"type": "module"` (or has `"type": "commonjs"`).\n\n- Export with `module.exports = value` or by adding properties: `module.exports.add = add` / `exports.add = add`\n- Import with `const x = require(\'./file\')` (the `.js` extension is optional)\n- `require` is **synchronous** and can be called anywhere, even inside an `if`\n- `__dirname` and `__filename` are available\n\nBehind the scenes Node wraps each CJS file in a function:\n`(function (exports, require, module, __filename, __dirname) { /* your code */ })`\nThat is why top-level variables are private, and why these five names "magically" exist.',
      syntax:
        "// math.js\nfunction add(a, b) { return a + b; }\nconst PI = 3.14159;\nmodule.exports = { add, PI };\n\n// app.js\nconst { add, PI } = require('./math');\nconsole.log(add(2, 3), PI);",
      tip: '`exports` is just a shortcut variable pointing to `module.exports`. Adding properties (`exports.add = add`) works, but REASSIGNING it (`exports = { add }`) breaks the link and exports nothing. When exporting a single function or class, always use `module.exports = ...`.',
    },
    {
      heading: 'ES Modules (ESM): import and export',
      content:
        '**ES Modules** are the official JavaScript standard (ES2015), used by browsers, Vite, React, Next.js and, increasingly, Node itself.\n\n- **Named exports**: `export const PI = 3.14;` `export function add() {}` → `import { add, PI } from \'./math.js\';`\n- **Default export** (one per file): `export default class User {}` → `import User from \'./user.js\';` (any name)\n- Rename: `import { add as sum }`, namespace: `import * as math from \'./math.js\'`\n- **File extension is required** in relative imports (`./math.js`, not `./math`)\n- `import` statements are **static** and hoisted; for conditional loading use **dynamic** `await import(\'./x.js\')`\n- Top-level `await` works\n- No `__dirname` / `__filename`: use `import.meta.dirname` and `import.meta.filename` (Node 20.11+) or `import.meta.url`\n- ESM files run in **strict mode** automatically',
    },
    {
      heading: 'How Node decides: .js, .cjs, .mjs and "type"',
      content:
        'Node looks at the file extension first, then at the nearest package.json:\n\n- `.mjs` → always ES Module\n- `.cjs` → always CommonJS\n- `.js` → ES Module if the nearest package.json has `"type": "module"`, otherwise CommonJS\n\nIn modern Node (22+) a `.js` file with `import`/`export` syntax and no type field is also detected as ESM automatically, but being **explicit with `"type"`** is the best practice.\n\n**Interop rules:**\n\n- ESM can `import` a CommonJS module: `module.exports` becomes the **default** import\n- CommonJS can load ESM with dynamic `import()` (returns a Promise); Node 22.12+ also allows `require()` of synchronous ES modules\n- Express 5 projects can use either system; this course uses CommonJS in most examples because it is still the most common in existing Node codebases and tutorials',
      points: [
        'CJS: require / module.exports, synchronous, __dirname available, dynamic by nature',
        'ESM: import / export, static analysis (tree shaking), top-level await, import.meta',
        'Do not mix require and import in the same file (except dynamic import())',
      ],
    },
    {
      heading: 'Module resolution and caching',
      content:
        'When you call `require(\'x\')` or `import \'x\'`, Node resolves the name:\n\n1. Starts with `node:` or is a core module name → built-in module\n2. Starts with `./`, `../` or `/` → a file or folder relative to the current file\n3. Otherwise → searches `node_modules` in the current folder, then parent folders, up to the root\n\nA module\'s code **runs only once**: the first time it is loaded. The result is **cached** (in `require.cache` for CJS) and every later import receives the **same object**. This makes modules natural **singletons**, useful for a shared database connection or config object.',
    },
    {
      heading: 'Built-in modules and the node: prefix',
      content:
        'Built-in modules need no installation. Prefer the **`node:` prefix**: `require(\'node:fs\')` or `import fs from \'node:fs\'`. It makes clear the module is built-in and cannot be hijacked by an npm package with the same name.\n\nMost-used built-ins (several are covered in the next days):\n\n- `node:path` file paths, `node:os` operating system info, `node:url` URLs (Day 4)\n- `node:fs` and `node:fs/promises` file system (Day 5)\n- `node:events` EventEmitter (Day 6), `node:stream` and `Buffer` (Day 7)\n- `node:http` web servers (Day 8), `node:crypto` hashing and UUIDs, `node:util` helpers (promisify, format, parseArgs), `node:child_process`, `node:worker_threads`, `node:test` built-in test runner',
    },
  ],
  examples: [
    {
      title: 'CommonJS: exporting and importing a utility module',
      scenario: 'Move calculation helpers into math.js and use them from app.js.',
      steps: [
        'Create `math.js` and `app.js` in the same folder (no package.json "type" needed: CommonJS is the default)',
        'Export an object with module.exports in math.js',
        'require it with a relative path in app.js',
        'Run `node app.js`',
      ],
      code: "// File: math.js\nconst add = (a, b) => a + b;\nconst multiply = (a, b) => a * b;\nconst secret = 'not exported'; // private to this file\n\nmodule.exports = { add, multiply, PI: 3.14159 };\n\n// File: app.js\nconst math = require('./math');          // whole object\nconst { add, PI } = require('./math');   // or destructure\n\nconsole.log('add(2, 3)      =', add(2, 3));\nconsole.log('multiply(4, 5) =', math.multiply(4, 5));\nconsole.log('PI             =', PI);\nconsole.log('secret         =', math.secret);\nconsole.log('exported keys  =', Object.keys(math));",
      result: "add(2, 3)      = 5\nmultiply(4, 5) = 20\nPI             = 3.14159\nsecret         = undefined\nexported keys  = [ 'add', 'multiply', 'PI' ]",
      explanation:
        'Only what is placed on `module.exports` is visible to other files, so `math.secret` is undefined. `require(\'./math\')` resolves `./math.js` automatically. Requiring the same file twice is cheap because of caching.',
    },
    {
      title: 'The exports vs module.exports trap',
      scenario: 'Understand why reassigning `exports` silently exports nothing.',
      steps: [
        'Create the three files below',
        'good.js adds properties to exports; bad.js reassigns exports; single.js exports one function',
        'Run `node main.js`',
      ],
      code: "// File: good.js\nexports.hello = () => 'hello from good.js';\n\n// File: bad.js\nexports = { hello: () => 'hello from bad.js' }; // breaks the link!\n\n// File: single.js\nmodule.exports = function greet(name) { return `Hi ${name}`; };\n\n// File: main.js\nconst good = require('./good');\nconst bad = require('./bad');\nconst greet = require('./single');\n\nconsole.log('good:', good, '->', good.hello());\nconsole.log('bad :', bad, '-> hello is', typeof bad.hello);\nconsole.log('single:', typeof greet, '->', greet('Ravi'));",
      result: "good: { hello: [Function (anonymous)] } -> hello from good.js\nbad : {} -> hello is undefined\nsingle: function -> Hi Ravi",
      explanation:
        'Node returns `module.exports` from require. In good.js `exports` still points to that object, so adding `hello` works. In bad.js the local variable `exports` now points to a NEW object, but `module.exports` is still the original empty `{}`. single.js replaces `module.exports` itself, which is the correct way to export one function or class.',
    },
    {
      title: 'ES Modules: named, default and namespace imports',
      scenario: 'Write the same kind of utility with the modern import / export syntax using .mjs files.',
      steps: [
        'Create `shapes.mjs` and `main.mjs` (the .mjs extension forces ESM; alternatively use .js with "type": "module" in package.json)',
        'Use named exports for functions and a default export for the class',
        'Run `node main.mjs`',
      ],
      code: "// File: shapes.mjs\nexport const PI = 3.14159;\nexport function circleArea(r) { return +(PI * r * r).toFixed(2); }\nexport function squareArea(s) { return s * s; }\n\nexport default class Rectangle {\n  constructor(w, h) { this.w = w; this.h = h; }\n  area() { return this.w * this.h; }\n}\n\n// File: main.mjs\nimport Rectangle, { circleArea, squareArea as sq } from './shapes.mjs';\nimport * as shapes from './shapes.mjs';\nimport path from 'node:path';\n\nconsole.log('circleArea(2)     =', circleArea(2));\nconsole.log('sq(4)             =', sq(4));\nconsole.log('new Rectangle(3,5)=', new Rectangle(3, 5).area());\nconsole.log('namespace keys    =', Object.keys(shapes));\nconsole.log('this file         =', path.basename(import.meta.filename));\nconsole.log('typeof require    =', typeof require);\n\nconst { PI } = await import('./shapes.mjs'); // dynamic import + top-level await\nconsole.log('PI via import()   =', PI);",
      result: "circleArea(2)     = 12.57\nsq(4)             = 16\nnew Rectangle(3,5)= 15\nnamespace keys    = [ 'PI', 'circleArea', 'default', 'squareArea' ]\nthis file         = main.mjs\ntypeof require    = undefined\nPI via import()   = 3.14159",
      explanation:
        'The default export is imported without braces and can take any name; named exports use braces and can be renamed with `as`. `import * as shapes` collects all exports, including `default`. In ESM `require` does not exist and `import.meta.filename` replaces `__filename`. Top-level `await` with dynamic `import()` works only in ES modules.',
    },
    {
      title: 'Module caching: code runs once, everyone shares one object',
      scenario: 'Prove that a module is executed only once and acts like a singleton.',
      steps: [
        'Create `counter.js` that logs when it loads and keeps a count',
        'Create `a.js` and `b.js` that both require and increment it',
        'Run `node index.js`',
      ],
      code: "// File: counter.js\nconsole.log('counter.js is loading...');\nlet count = 0;\nmodule.exports = {\n  increment() { count += 1; return count; },\n};\n\n// File: a.js\nconst counter = require('./counter');\nmodule.exports = () => counter.increment();\n\n// File: b.js\nconst counter = require('./counter');\nmodule.exports = () => counter.increment();\n\n// File: index.js\nconst incA = require('./a');\nconst incB = require('./b');\n\nconsole.log('a ->', incA());\nconsole.log('b ->', incB());\nconsole.log('a ->', incA());\nconsole.log('same object?', require('./counter') === require('./counter'));\nconsole.log('wrapper vars:', typeof module, typeof exports, typeof __dirname);",
      result: "counter.js is loading...\na -> 1\nb -> 2\na -> 3\nsame object? true\nwrapper vars: object object string",
      explanation:
        '"counter.js is loading..." appears once even though two files require it, because the second require returns the cached exports. Both a.js and b.js increment the same private `count`, giving 1, 2, 3. `module`, `exports` and `__dirname` exist because Node wraps every CommonJS file in a function that passes them in.',
    },
    {
      title: 'Built-in modules and ESM / CommonJS interop',
      scenario: 'Import a CommonJS module and built-in modules from an ES module.',
      steps: [
        'Create `legacy.cjs` (CommonJS) and `app.mjs` (ESM)',
        'Import built-ins with the node: prefix',
        'Run `node app.mjs`',
      ],
      code: "// File: legacy.cjs\nexports.version = '1.0';\nexports.shout = (s) => s.toUpperCase() + '!';\n\n// File: app.mjs\nimport legacy from './legacy.cjs';          // module.exports -> default import\nimport { shout } from './legacy.cjs';        // named import of exports.shout\nimport { isBuiltin } from 'node:module';\nimport { format } from 'node:util';\nimport { createRequire } from 'node:module';\n\nconsole.log('legacy object :', legacy);\nconsole.log('named shout   :', shout('modules'));\nconsole.log('isBuiltin fs  :', isBuiltin('fs'), '| node:path:', isBuiltin('node:path'), '| express:', isBuiltin('express'));\nconsole.log(format('util.format -> %s is %d years old', 'Node', 17));\n\nconst require = createRequire(import.meta.url); // require inside ESM when needed\nconst os = require('node:os');\nconsole.log('os.EOL is newline?', os.EOL === '\\n' || os.EOL === '\\r\\n');",
      result: "legacy object : { version: '1.0', shout: [Function (anonymous)] }\nnamed shout   : MODULES!\nisBuiltin fs  : true | node:path: true | express: false\nutil.format -> Node is 17 years old\nos.EOL is newline? true",
      explanation:
        'ESM can import CommonJS: the whole `module.exports` object is the default import. Node also scans the CommonJS source for `exports.name = ...` assignments, so those names can be imported with braces too (if a named import is not detected, Node throws a SyntaxError and suggests using the default import instead). `isBuiltin` tells whether a name is a core module. `createRequire` gives you a CommonJS `require` inside an ES module when an old package needs it.',
    },
  ],
  interview: [
    { q: 'What is a module in Node.js?', a: 'A file (or package) with its own private scope. It shares functionality by exporting values, which other modules import. Node has core modules, local modules and third-party (npm) modules.', level: 'Easy' },
    { q: 'Difference between CommonJS and ES Modules?', a: 'CommonJS uses require/module.exports, loads synchronously, can require conditionally, and provides __dirname/__filename. ESM uses import/export, is the JS standard, is statically analysable (tree shaking), supports top-level await, requires file extensions in relative imports, runs in strict mode and uses import.meta instead of __dirname.', level: 'Medium' },
    { q: 'What is the difference between exports and module.exports?', a: 'exports is a variable that initially references module.exports. require() returns module.exports. Adding properties to exports works, but reassigning exports breaks the reference, so nothing is exported. Use module.exports = ... to export a single value.', level: 'Medium' },
    { q: 'How does Node decide whether a .js file is CommonJS or ESM?', a: '.mjs is always ESM, .cjs is always CommonJS. For .js, Node checks the nearest package.json: "type": "module" means ESM, "commonjs" or missing means CommonJS (newer Node versions can also detect ESM syntax automatically).', level: 'Medium' },
    { q: 'What is module caching?', a: 'After the first load, a module\'s exports are cached by resolved filename. Subsequent require/import calls return the same object without re-running the code, so modules behave like singletons. In CJS the cache is require.cache.', level: 'Medium' },
    { q: 'What is the module wrapper function?', a: 'Node wraps every CommonJS file in (function (exports, require, module, __filename, __dirname) { ... }). This gives each file private scope and provides those five variables.', level: 'Hard' },
    { q: 'How do you get __dirname in an ES module?', a: 'Use import.meta.dirname (and import.meta.filename) in Node 20.11+, or compute it: path.dirname(fileURLToPath(import.meta.url)).', level: 'Medium' },
    { q: 'Can an ES module import a CommonJS module, and vice versa?', a: 'Yes, ESM can import CJS; module.exports becomes the default export. CJS can load ESM with dynamic import(), which returns a Promise; Node 22.12+ also supports require() of ES modules that do not use top-level await.', level: 'Hard' },
    { q: 'What is the node: prefix?', a: 'A scheme for importing core modules explicitly, e.g. require("node:fs"). It makes the source clear, skips node_modules lookup, and some newer core modules (node:test, node:sqlite) are only available with the prefix.', level: 'Easy' },
    { q: 'What is the order of module resolution for require("x")?', a: 'Core modules first; then if x starts with ./ ../ or /, the file (trying .js, .json, .node extensions) or folder (package.json main or index.js); otherwise node_modules folders from the current directory up to the root.', level: 'Hard' },
    { q: 'Named export vs default export?', a: 'A module can have many named exports, imported with the exact name in braces (renamable with as). It can have one default export, imported without braces under any name. Named exports are better for refactoring and auto-imports.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create `stringUtils.js` (CommonJS) exporting `capitalize(str)` and `reverse(str)`. Use both from `app.js` and print capitalize("node") and reverse("express").',
      hint: 'module.exports = { capitalize, reverse }.',
      solution: "// stringUtils.js\nconst capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);\nconst reverse = s => [...s].reverse().join('');\nmodule.exports = { capitalize, reverse };\n\n// app.js\nconst { capitalize, reverse } = require('./stringUtils');\nconsole.log(capitalize('node'));  // Node\nconsole.log(reverse('express'));  // sserpxe",
    },
    {
      task: 'Rewrite the previous task as ES Modules using .mjs files, with `capitalize` as the default export and `reverse` as a named export.',
      hint: 'import capitalize, { reverse } from "./stringUtils.mjs"; (extension is required).',
      solution: "// stringUtils.mjs\nexport default function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }\nexport const reverse = s => [...s].reverse().join('');\n\n// app.mjs\nimport capitalize, { reverse } from './stringUtils.mjs';\nconsole.log(capitalize('node'), reverse('express')); // Node sserpxe",
    },
    {
      task: 'Create a `config.js` singleton module that stores `{ appName: "Shop", debug: false }`. Change debug to true from file A, then read it from file B to prove both see the same object.',
      hint: 'Module caching returns the same exports object everywhere.',
      solution: "// config.js\nmodule.exports = { appName: 'Shop', debug: false };\n\n// a.js\nrequire('./config').debug = true;\n\n// b.js\nmodule.exports = () => require('./config').debug;\n\n// index.js\nrequire('./a');\nconsole.log(require('./b')()); // true",
    },
    {
      task: 'Export a `Student` class from `student.js` using CommonJS so that `const Student = require("./student")` works, then create a student and print its intro.',
      hint: 'Export a single class with module.exports = Student, not exports = Student.',
      solution: "// student.js\nclass Student {\n  constructor(name, course) { this.name = name; this.course = course; }\n  intro() { return `${this.name} studies ${this.course}`; }\n}\nmodule.exports = Student;\n\n// app.js\nconst Student = require('./student');\nconsole.log(new Student('Asha', 'Node.js').intro()); // Asha studies Node.js",
    },
    {
      task: 'Create a package.json with "type": "module" and an `index.js` that uses import.meta.dirname and the node:path module to print the name of the folder the file is in.',
      hint: 'path.basename(import.meta.dirname).',
      solution: "// package.json\n{ \"name\": \"esm-demo\", \"version\": \"1.0.0\", \"type\": \"module\" }\n\n// index.js\nimport path from 'node:path';\nconsole.log('Folder:', path.basename(import.meta.dirname));\n// run: node index.js  ->  Folder: esm-demo",
    },
  ],
  quiz: [
    { question: 'Which statement exports a single function correctly in CommonJS?', options: ['exports = fn', 'module.exports = fn', 'export default fn', 'require.exports = fn'], answer: 1, explanation: 'Reassigning `exports` breaks the link; module.exports = fn is correct.' },
    { question: 'A file named utils.mjs is always treated as...', options: ['CommonJS', 'JSON', 'An ES Module', 'Depends on package.json'], answer: 2, explanation: '.mjs always means ES Module, .cjs always CommonJS.' },
    { question: 'What does a module\'s top-level code do the second time it is required?', options: ['Runs again', 'Does not run; the cached exports are returned', 'Throws an error', 'Runs only in ESM'], answer: 1, explanation: 'Modules are cached after the first load.' },
    { question: 'Which is NOT available in an ES module by default?', options: ['import.meta.url', 'Top-level await', '__dirname', 'Dynamic import()'], answer: 2, explanation: 'ESM uses import.meta.dirname / import.meta.url instead of __dirname.' },
    { question: 'In "import User, { save } from \'./user.js\'", what is User?', options: ['The default export', 'A named export called User', 'All exports', 'A CommonJS require'], answer: 0, explanation: 'The binding outside the braces receives the default export.' },
  ],
};
