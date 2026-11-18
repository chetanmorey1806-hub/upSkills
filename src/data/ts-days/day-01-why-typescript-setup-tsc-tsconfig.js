export default {
  id: 'day-01-why-typescript-setup-tsc-tsconfig',
  title: 'Why TypeScript, Installing, tsc, tsconfig.json Essentials and Running TS with tsx',
  module: 'Module 1: TypeScript Basics',
  day: 1,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'TypeScript is JavaScript with types. It catches bugs while you type, before the code ever runs, which is why most MERN job descriptions now list it. Today you install it, compile your first file with tsc, understand the key tsconfig.json options and run TS directly with tsx.',
  objectives: [
    'Explain what TypeScript is and why companies use it for MERN projects',
    'Install TypeScript in a project and compile .ts files with tsc',
    'Understand the essential tsconfig.json options: strict, target, module, outDir, rootDir',
    'Run TypeScript files directly during development with tsx',
    'Read a TypeScript compile error and fix it',
  ],
  theory: [
    {
      heading: 'What is TypeScript and why use it?',
      content: `**TypeScript (TS)** is a programming language made by Microsoft that adds **static types** on top of JavaScript. Every valid JavaScript program is also (almost always) valid TypeScript, so you can adopt it slowly.

Think of TypeScript like **spell-check in Microsoft Word**. You can still write anything you want, but a red underline warns you about mistakes *before* you send the letter. JavaScript only tells you about the mistake when the user is already using the app (a runtime crash like \`Cannot read properties of undefined\`).

Why companies use it:
- **Fewer bugs**: wrong argument types, typos in property names and missing \`null\` checks are caught at compile time
- **Better editor support**: VS Code autocomplete, go-to-definition and safe rename all come from types
- **Self-documenting code**: a function signature like \`getUser(id: string): Promise<User>\` tells you exactly how to use it
- **Safe refactoring** in big teams: change a type and the compiler lists every place that must be updated
- **Industry standard**: React, Next.js, NestJS, Express starter kits and most MERN job posts use TypeScript

Important: TypeScript types **disappear** after compilation. The browser and Node.js still run plain JavaScript. Types are a development-time safety net, not runtime checks (for runtime checks we use Zod on Day 11).`,
      points: [
        'TypeScript = JavaScript + a type system + a compiler (tsc)',
        'Type errors are reported at compile time; JavaScript errors appear at runtime',
        'Types are erased: the output is normal JavaScript',
      ],
    },
    {
      heading: 'Installing TypeScript',
      content: `TypeScript needs **Node.js** (use Node.js 22 LTS). Install TypeScript as a **dev dependency** of each project, not globally, so every developer and the CI server use the same version.

1. Create a project: \`npm init -y\`
2. Install the compiler: \`npm i -D typescript\`
3. Install Node.js type definitions: \`npm i -D @types/node\`
4. Create a config file: \`npx tsc --init\`
5. Check the version: \`npx tsc -v\`

\`npx\` runs the locally installed binary from \`node_modules/.bin\`, so you never depend on a global install.`,
      syntax: `npm init -y
npm i -D typescript tsx @types/node
npx tsc --init
npx tsc -v      # Version 5.x`,
      tip: 'Avoid `npm i -g typescript`. A global version can differ from the project version and cause "works on my machine" problems.',
    },
    {
      heading: 'Compiling with tsc',
      content: `\`tsc\` is the **TypeScript compiler**. It does two jobs:
1. **Type-checks** your code and prints errors
2. **Emits** (outputs) plain \`.js\` files with the types removed

- \`npx tsc greet.ts\` compiles one file (ignores tsconfig.json)
- \`npx tsc\` compiles the whole project using tsconfig.json
- \`npx tsc --watch\` recompiles on every save
- \`npx tsc --noEmit\` only type-checks, writes no files (great for CI and pre-commit hooks)

By default tsc **still writes the .js file even when there are type errors**, because the JavaScript is usually still runnable. Set \`"noEmitOnError": true\` if you want the build to stop on errors.`,
      syntax: `// greet.ts
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
console.log(greet("Priya"));`,
      tip: 'A TypeScript error looks like `greet.ts(3,7): error TS2322: Type \'string\' is not assignable to type \'number\'.` Read it as: file (line,column), error code, message. Searching the TS code (TS2322) online gives quick answers.',
    },
    {
      heading: 'tsconfig.json essentials',
      content: `\`tsconfig.json\` sits in the project root and tells tsc how to check and build the project. The options you must know for interviews:

- **strict**: turns on a family of checks (\`strictNullChecks\`, \`noImplicitAny\`, \`strictFunctionTypes\` and more). Always \`true\` for new projects.
- **target**: the JavaScript version to output, e.g. \`ES2022\`. Newer target = less down-levelling, smaller output. Node.js 22 supports ES2022+ fully.
- **module**: the module system of the output. Use \`NodeNext\` for Node.js backends, \`ESNext\` (with \`moduleResolution: "Bundler"\`) for Vite/React apps.
- **outDir**: folder for compiled \`.js\` files, usually \`dist\`.
- **rootDir**: folder that contains your source \`.ts\` files, usually \`src\`.
- **include / exclude**: which files belong to the project.
- **sourceMap**: generates \`.js.map\` files so stack traces point to your \`.ts\` lines.
- **esModuleInterop** and **skipLibCheck**: almost always \`true\` in real projects.`,
      syntax: `{
  "compilerOptions": {
    "target": "ES2022",          // which JS version to output
    "module": "NodeNext",        // module system (ESM/CommonJS per package.json)
    "moduleResolution": "NodeNext",
    "rootDir": "./src",          // where your .ts files live
    "outDir": "./dist",          // where compiled .js files go
    "strict": true,              // turn on ALL strict type checks
    "esModuleInterop": true,     // smooth default imports from CommonJS packages
    "skipLibCheck": true,        // don't type-check .d.ts files in node_modules (faster)
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true            // map dist/*.js back to src/*.ts for debugging
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}`,
      tip: 'tsconfig.json allows comments (it is "JSON with comments"). The file created by `tsc --init` lists every option with a short comment; read it once.',
    },
    {
      heading: 'Running TypeScript directly with tsx',
      content: `Compiling with tsc and then running \`node dist/file.js\` is two steps. During development we use **tsx** (TypeScript Execute), a fast tool that runs \`.ts\` files directly.

- \`npx tsx src/index.ts\` runs the file once
- \`npx tsx watch src/server.ts\` restarts on every save (like nodemon)

**Important:** tsx only **removes** the types and runs the code; it does **not** type-check. So a real project uses both: tsx for fast running, and \`tsc --noEmit\` (or the editor) to catch type errors.

A typical package.json for a Node + TS backend:
- \`"dev": "tsx watch src/server.ts"\`
- \`"build": "tsc"\`
- \`"start": "node dist/server.js"\`
- \`"typecheck": "tsc --noEmit"\`

Note: Node.js 22.6+ can also run simple .ts files with \`--experimental-strip-types\` (on by default from Node 23.6), but it does not support every TS feature (for example \`enum\`), so tsx is still the common choice.`,
      tip: 'In production do not run tsx. Build once with `tsc` and run the compiled JavaScript with `node` for faster start-up and fewer dependencies.',
    },
    {
      heading: 'How TypeScript fits into a MERN project',
      content: `In a MERN stack TypeScript is used on both sides:

- **React (frontend)**: Vite's \`react-ts\` template already has TypeScript set up. Vite uses esbuild to strip types (fast) and you run \`tsc --noEmit\` for checking. Files use \`.tsx\` when they contain JSX.
- **Express + Mongoose (backend)**: tsx in development, tsc to build \`dist/\`, node in production.
- **Shared types**: the same \`User\` or \`Order\` type can describe both the API response and the React state, so frontend and backend never disagree about data shape.

Coming next (Day 2): basic types, type inference, any vs unknown vs never, arrays, tuples and enums.`,
      points: [
        'Frontend: `npm create vite@latest my-app -- --template react-ts`',
        'Backend: typescript + tsx + @types/node + @types/express',
        'Both: `strict: true`',
      ],
    },
  ],
  examples: [
    {
      title: 'TypeScript catches a bug before running',
      scenario: 'A shopping cart reads quantity from a form input. Form values are strings, so `499 * "3"` would silently work in JS today and break tomorrow (for example "3" + 1 = "31"). TypeScript stops it at compile time.',
      steps: [
        'Create cart.ts with the code',
        'Run `npx tsc --noEmit --strict cart.ts`',
        'Read the error: the string cannot be passed where a number is expected',
      ],
      code: `// The same bug that JavaScript only finds at runtime...
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

// Value came from an <input>, so it is a string, not a number
const qtyFromForm = "3";

const total = calculateTotal(499, qtyFromForm); // TypeScript stops us here
console.log(total);`,
      result: `This example intentionally does NOT compile. tsc reports:
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.`,
      explanation: 'The parameter `quantity: number` is a contract. `qtyFromForm` holds a string, so passing it breaks the contract. In plain JavaScript this bug would only appear later, at runtime, in a customer\'s browser.',
    },
    {
      title: 'Fixing the bug and running the program',
      scenario: 'Convert the input explicitly, then compile and run.',
      steps: [
        'Update cart.ts as shown',
        'Run `npx tsc --noEmit --strict cart.ts` (no output = no errors)',
        'Run it with `npx tsx cart.ts` or click Run in the playground (plain JS version)',
      ],
      code: `function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

const qtyFromForm = "3";
// Convert explicitly, so the type is now number
const quantity = Number(qtyFromForm);

const total = calculateTotal(499, quantity);
console.log("Total:", total);

// Type inference: TypeScript already knows \`total\` is a number
console.log("With 18% GST:", (total * 1.18).toFixed(2));`,
      playground: {
        html: '<p>Open the console</p>',
        js: `function calculateTotal(price, quantity) {
    return price * quantity;
}
const qtyFromForm = "3";
// Convert explicitly, so the type is now number
const quantity = Number(qtyFromForm);
const total = calculateTotal(499, quantity);
console.log("Total:", total);
// Type inference: TypeScript already knows \`total\` is a number
console.log("With 18% GST:", (total * 1.18).toFixed(2));`,
      },
      result: `Console output:
Total: 1497
With 18% GST: 1766.46`,
      explanation: '`Number(qtyFromForm)` returns a `number`, so the call now matches the function signature. Notice we never wrote `: number` on `total`: TypeScript **infers** it from the return type of `calculateTotal`.',
    },
    {
      title: 'A production-ready tsconfig.json for a Node.js project',
      scenario: 'You are starting the backend of a MERN app and need a sensible tsconfig.',
      steps: [
        'Run `npx tsc --init`',
        'Replace its content with the config below',
        'Put your code in src/ and run `npx tsc`',
        'Compiled files appear in dist/',
      ],
      code: `{
  "compilerOptions": {
    "target": "ES2022",          // which JS version to output
    "module": "NodeNext",        // module system (ESM/CommonJS per package.json)
    "moduleResolution": "NodeNext",
    "rootDir": "./src",          // where your .ts files live
    "outDir": "./dist",          // where compiled .js files go
    "strict": true,              // turn on ALL strict type checks
    "esModuleInterop": true,     // smooth default imports from CommonJS packages
    "skipLibCheck": true,        // don't type-check .d.ts files in node_modules (faster)
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true            // map dist/*.js back to src/*.ts for debugging
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}`,
      result: 'Running `npx tsc` reads src/**/*.ts, reports any type errors and writes dist/*.js plus .js.map source maps. `node dist/index.js` runs the output.',
      explanation: '`strict` enables all safety checks, `target` ES2022 keeps modern syntax (Node 22 supports it), `module`/`moduleResolution` NodeNext follows Node\'s real ESM/CommonJS rules (based on the "type" field in package.json), and `rootDir`/`outDir` keep source and build output separate.',
    },
    {
      title: 'Strict mode catches a \'possibly undefined\' crash',
      scenario: '`Array.find()` returns `undefined` when nothing matches. In JS, `found.name` then crashes with "Cannot read properties of undefined". With `strict: true` TypeScript forces you to handle that case.',
      steps: [
        'Create students.ts',
        'Run `npx tsc --noEmit --strict students.ts`',
        'See the error and add an `if (found)` check to fix it',
      ],
      code: `// strict mode (strictNullChecks) catches "possibly undefined" bugs
interface Student {
  id: number;
  name: string;
}

const students: Student[] = [
  { id: 1, name: "Asha" },
  { id: 2, name: "Ravi" },
];

// .find() returns Student | undefined
const found = students.find((s) => s.id === 3);

console.log(found.name.toUpperCase()); // compile error in strict mode`,
      result: `This example intentionally does NOT compile. tsc reports:
error TS18048: 'found' is possibly 'undefined'.

Fix: \`if (found) console.log(found.name.toUpperCase());\` or use optional chaining \`found?.name\`.`,
      explanation: 'With `strictNullChecks` (part of `strict`), the type of `found` is `Student | undefined`. TypeScript will not let you read `.name` until you prove it is not undefined. Without strict mode this check is off and the bug reaches production.',
    },
    {
      title: 'A small script run with tsx',
      scenario: 'Write a quick sales report script and run it directly with tsx, no build step.',
      steps: [
        'Create src/report.ts',
        'Run `npx tsx src/report.ts`',
        'Type-check separately with `npx tsc --noEmit`',
      ],
      code: `// src/report.ts  ->  run with:  npx tsx src/report.ts
type Order = {
  id: string;
  customer: string;
  amount: number;
  paid: boolean;
};

const orders: Order[] = [
  { id: "A101", customer: "Neha", amount: 1200, paid: true },
  { id: "A102", customer: "Karan", amount: 850, paid: false },
  { id: "A103", customer: "Neha", amount: 400, paid: true },
];

function totalPaid(list: Order[]): number {
  return list.filter((o) => o.paid).reduce((sum, o) => sum + o.amount, 0);
}

function pendingCustomers(list: Order[]): string[] {
  return list.filter((o) => !o.paid).map((o) => o.customer);
}

console.log("Paid revenue:", totalPaid(orders));
console.log("Pending:", pendingCustomers(orders));`,
      playground: {
        html: '<p>Open the console</p>',
        js: `const orders = [
    { id: "A101", customer: "Neha", amount: 1200, paid: true },
    { id: "A102", customer: "Karan", amount: 850, paid: false },
    { id: "A103", customer: "Neha", amount: 400, paid: true },
];
function totalPaid(list) {
    return list.filter((o) => o.paid).reduce((sum, o) => sum + o.amount, 0);
}
function pendingCustomers(list) {
    return list.filter((o) => !o.paid).map((o) => o.customer);
}
console.log("Paid revenue:", totalPaid(orders));
console.log("Pending:", pendingCustomers(orders));`,
      },
      result: `Console output:
Paid revenue: 1600
Pending: [ 'Karan' ]`,
      explanation: '`type Order` describes the shape of each order. Inside `filter`, `reduce` and `map`, the parameter `o` is automatically typed as `Order`, so a typo like `o.ammount` would be a compile error. tsx strips the types and runs the code instantly.',
    },
  ],
  interview: [
    {
      q: 'What is TypeScript?',
      a: 'TypeScript is a statically typed superset of JavaScript developed by Microsoft. It adds optional type annotations, interfaces, generics and other features, and is compiled (transpiled) to plain JavaScript by the TypeScript compiler (tsc). Types are checked at compile time and removed from the output.',
      level: 'Easy',
    },
    {
      q: 'Why would you use TypeScript instead of JavaScript in a MERN project?',
      a: 'It catches type errors at compile time instead of in production, gives much better autocomplete and refactoring in the editor, documents function and API contracts in code, and lets frontend and backend share the same types (for example a User type used by Express responses and React components). It matters most in large codebases and teams.',
      level: 'Easy',
    },
    {
      q: 'Does TypeScript run in the browser or in Node.js?',
      a: 'No. Browsers and Node.js execute JavaScript. TypeScript is compiled to JavaScript first (by tsc, esbuild, Vite, tsx, etc.). Types are erased during compilation, so they have no runtime cost and give no runtime protection.',
      level: 'Easy',
    },
    {
      q: 'Is TypeScript statically or dynamically typed? What does that mean?',
      a: 'Statically typed: types are checked before the program runs (at compile time). JavaScript is dynamically typed: types belong to values and are only known at runtime. TypeScript is also \'gradually\' typed because you can mix typed and untyped (any) code.',
      level: 'Easy',
    },
    {
      q: 'What does `strict: true` do in tsconfig.json?',
      a: 'It enables a group of strict checks at once, including noImplicitAny (no silent any), strictNullChecks (null/undefined must be handled), strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitThis, alwaysStrict and useUnknownInCatchVariables. New projects should always enable it.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between `target` and `module` in tsconfig?',
      a: '`target` controls which JavaScript language version is emitted (ES5, ES2020, ES2022…): newer syntax is down-levelled for older targets. `module` controls the module system of the output (CommonJS require/module.exports vs ES modules import/export, or NodeNext which follows Node\'s rules). They are independent settings.',
      level: 'Medium',
    },
    {
      q: 'What are outDir and rootDir?',
      a: 'rootDir is the folder containing the source .ts files (e.g. src); outDir is where tsc writes compiled .js files (e.g. dist). tsc keeps the same folder structure, so src/routes/user.ts becomes dist/routes/user.js.',
      level: 'Easy',
    },
    {
      q: 'Does tsc emit JavaScript if there are type errors?',
      a: 'Yes, by default it still emits the .js files because type errors do not prevent JavaScript from being generated. Set `noEmitOnError: true` to stop emission when there are errors, or use `tsc --noEmit` to only type-check.',
      level: 'Medium',
    },
    {
      q: 'What is tsx and how is it different from tsc?',
      a: 'tsx is a tool that runs TypeScript files directly in Node.js using esbuild to strip the types on the fly (`npx tsx file.ts`, or `tsx watch` for auto-restart). It does not type-check. tsc is the official compiler that type-checks and emits JS. In practice: tsx for development, tsc --noEmit for checking, tsc for building production output.',
      level: 'Medium',
    },
    {
      q: 'What is a .d.ts file? (short answer)',
      a: 'A declaration file that contains only type information (no implementation). It describes the types of JavaScript code, for example the @types/node package describes Node\'s APIs. We cover them in detail on Day 9.',
      level: 'Medium',
    },
    {
      q: 'What is type inference?',
      a: 'TypeScript automatically works out a type when you do not write one. `let count = 5` is inferred as number; a function returning a + b where both are numbers is inferred to return number. Good TS code relies on inference for local variables and annotates function parameters and public APIs.',
      level: 'Easy',
    },
    {
      q: 'Can TypeScript prevent all runtime errors? Why not?',
      a: 'No. Types are erased at compile time, so data that comes from outside the program (API responses, req.body, localStorage, JSON.parse) is not checked at runtime. A wrong `as` cast or `any` can also lie to the compiler. That is why we validate external input at runtime with a library like Zod.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Set up a TypeScript project from scratch: create a folder, install typescript, tsx and @types/node, create tsconfig.json with rootDir src, outDir dist and strict true. Write src/index.ts with two typed functions `fullName(first, last)` and `isAdult(age)`. Compile with tsc, run the output with node, then run the source directly with tsx.',
      hint: 'Use `npx tsc --init` and edit rootDir/outDir. After `npx tsc`, check that dist/index.js has no type annotations.',
      solution: `// src/index.ts
function fullName(first: string, last: string): string {
  return \`\${first} \${last}\`;
}

function isAdult(age: number): boolean {
  return age >= 18;
}

const studentName = fullName("Rahul", "Sharma");
console.log(studentName, "adult?", isAdult(20));

// Commands used:
// npm init -y
// npm i -D typescript tsx @types/node
// npx tsc --init
// npx tsc          -> creates dist/index.js
// node dist/index.js
// npx tsx src/index.ts  (runs directly, no dist folder)`,
    },
    {
      task: `This code has three problems that strict mode reports. Fix them without using \`any\`:

function applyDiscount(price, percent) { return price - (price * percent) / 100; }
const items = [{ name: 'Mouse', price: 600 }, { name: 'Keyboard', price: 1500 }];
const keyboard = items.find(i => i.name === 'Keyboard');
console.log(applyDiscount(keyboard.price, '10'));`,
      hint: 'Errors: implicit any parameters, \'keyboard\' is possibly undefined, and \'10\' is a string.',
      solution: `// Fixed version: every bug that strict mode reported is solved
function applyDiscount(price: number, percent: number): number {
  return price - (price * percent) / 100;
}

const items: { name: string; price: number }[] = [
  { name: "Mouse", price: 600 },
  { name: "Keyboard", price: 1500 },
];

const keyboard = items.find((i) => i.name === "Keyboard");

if (keyboard) {
  console.log(applyDiscount(keyboard.price, 10)); // 1350
} else {
  console.log("Keyboard not found");
}`,
    },
    {
      task: 'Write src/temperature.ts that converts an array of Celsius readings to Fahrenheit and prints each with one decimal place. Run it with `npx tsx src/temperature.ts`.',
      hint: 'F = C × 9/5 + 32. Use `toFixed(1)`.',
      solution: `// src/temperature.ts
function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

const readings: number[] = [22, 30.5, 41];

for (const c of readings) {
  console.log(\`\${c}°C = \${celsiusToFahrenheit(c).toFixed(1)}°F\`);
}`,
    },
    {
      task: 'Add npm scripts dev, build, start and typecheck to a Node + TS backend and write a tiny src/server.ts that prints the port read from process.env.PORT (default 5000).',
      hint: 'process.env values are `string | undefined`. Use `??` for the default and Number() to convert.',
      solution: `// package.json "scripts" (shown as a comment):
// "dev":   "tsx watch src/server.ts",
// "build": "tsc",
// "start": "node dist/server.js",
// "typecheck": "tsc --noEmit"

// src/server.ts
const PORT: number = Number(process.env.PORT ?? 5000);
const appName: string = "UpSkillr API";

function startMessage(name: string, port: number): string {
  return \`\${name} running on http://localhost:\${port}\`;
}

console.log(startMessage(appName, PORT));`,
    },
  ],
  quiz: [
    {
      question: 'What does the TypeScript compiler output?',
      options: [
        'Machine code',
        'Plain JavaScript with types removed',
        'WebAssembly',
        'Java bytecode',
      ],
      answer: 1,
      explanation: 'tsc type-checks and emits JavaScript. Type annotations are erased.',
    },
    {
      question: 'Which tsconfig option decides the folder where compiled .js files are written?',
      options: [
        'rootDir',
        'target',
        'include',
        'outDir',
      ],
      answer: 3,
      explanation: 'outDir is the output folder (usually dist). rootDir is the source folder.',
    },
    {
      question: 'What does `npx tsx src/app.ts` do?',
      options: [
        'Runs the file directly by stripping types, without type-checking',
        'Type-checks and fails on any error',
        'Converts the file to JSX',
        'Publishes the package to npm',
      ],
      answer: 0,
      explanation: 'tsx strips types with esbuild and runs the code. Use tsc --noEmit to type-check.',
    },
    {
      question: 'Which command only type-checks a project without writing files?',
      options: [
        'npx tsc --watch',
        'npx tsc --init',
        'npx tsc --noEmit',
        'npx tsx --check',
      ],
      answer: 2,
      explanation: '--noEmit runs all checks but does not write output; ideal for CI.',
    },
    {
      question: 'With `strict: true`, what is the type of `[1, 2, 3].find(n => n > 5)`?',
      options: [
        'number',
        'number | undefined',
        'undefined',
        'any',
      ],
      answer: 1,
      explanation: 'find returns undefined when nothing matches, and strictNullChecks makes that visible in the type.',
    },
  ],
};
