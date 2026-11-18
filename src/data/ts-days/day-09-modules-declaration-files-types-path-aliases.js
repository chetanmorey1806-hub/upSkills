export default {
  id: 'day-09-modules-declaration-files-types-path-aliases',
  title: 'Modules, Declaration Files (.d.ts), @types Packages, Path Aliases and Type-Only Imports',
  module: 'Module 3: TypeScript in the MERN Stack',
  day: 9,
  level: 'Advanced',
  duration: '2 hours',
  summary: 'Real projects are split into many files and depend on hundreds of npm packages. Today you learn how TypeScript handles ES modules, where the types of libraries come from (.d.ts files and @types packages), how to write your own declarations for untyped code, how to use type-only imports, and how to replace ../../../ imports with path aliases.',
  objectives: [
    'Use named, default and type-only imports/exports in TypeScript ES modules',
    'Explain what .d.ts files are and how @types packages work',
    'Write declaration files for untyped JavaScript, untyped npm packages and globals',
    'Configure path aliases and know who resolves them at runtime',
    'Understand verbatimModuleSyntax and moduleResolution (NodeNext vs Bundler)',
  ],
  theory: [
    {
      heading: 'ES modules in TypeScript',
      content: `TypeScript uses standard JavaScript **ES module** syntax: \`export\`, \`export default\`, \`import { x } from\`, \`import * as ns from\`. Any file with a top-level \`import\` or \`export\` is a **module** with its own scope; a file without them is a **script** whose declarations become global (that is why \`const name = ...\` in a script file can clash with the DOM's global \`name\`).

Types can be exported and imported exactly like values: \`export interface User {}\` and \`import { User } from "./models.js"\`.

**The .js extension:** with \`module\`/\`moduleResolution\` set to \`NodeNext\` (Node.js backends using ESM), relative imports must include the **.js** extension even though the source file is \`.ts\`: \`import { x } from "./cart.js"\`. TypeScript maps it to cart.ts at compile time, and the compiled output works in Node unchanged. With \`moduleResolution: "Bundler"\` (Vite/React apps), extensions are optional because the bundler resolves them.

Prefer **named exports** in shared code: they are easier to refactor, auto-import better and avoid naming inconsistencies. React components often use default exports by convention.`,
      tip: 'Error TS2835 "Relative import paths need explicit file extensions in ECMAScript imports" means you are in NodeNext mode and forgot the `.js` extension.',
    },
    {
      heading: 'Type-only imports and verbatimModuleSyntax',
      content: `\`import type { User } from "./models.js"\` imports **only the type**; the line is completely removed from the JavaScript output. You can also mark individual names: \`import { createUser, type User } from "./models.js"\`.

Why it matters:
- Tools like Vite, esbuild and tsx compile **one file at a time** and cannot always know whether an imported name is a type. Marking types explicitly lets them safely delete the import.
- It avoids loading a module at runtime just for its types (and some circular-import problems).

The compiler option **\`verbatimModuleSyntax: true\`** (recommended, used by the Vite React-TS template) enforces this: any import that is only used as a type must be written with \`type\`, otherwise you get error TS1484. Imports without \`type\` are kept exactly as written.

\`export type { User } from "./user.js"\` re-exports a type in a barrel file.`,
    },
    {
      heading: 'Declaration files (.d.ts) and @types',
      content: `A **declaration file** (\`.d.ts\`) contains only type information: function signatures, interfaces, \`declare const\` and so on, with **no implementation**. It is like the **menu card** of a restaurant: it tells you what dishes exist and what they contain, but the cooking happens in the kitchen (the \`.js\` file).

Where library types come from:
1. **Bundled types**: the package ships its own .d.ts (axios, zod, mongoose, express 5's dependencies, React Router). Check for a \`types\` field in its package.json.
2. **DefinitelyTyped**: community types published as \`@types/<package>\`, e.g. \`@types/express\`, \`@types/node\`, \`@types/react\`, \`@types/jsonwebtoken\`, \`@types/bcryptjs\`. Install them as dev dependencies: \`npm i -D @types/express\`.
3. **None**: you get error TS7016 "Could not find a declaration file for module 'x'". Then you write your own declaration.

tsc can also **generate** .d.ts files from your code with \`declaration: true\`, which is how libraries publish types.`,
      points: [
        'VS Code shows a ... under the import when types are missing',
        '@types versions should match the library\'s major version',
        'skipLibCheck: true skips checking .d.ts files in node_modules (faster builds)',
      ],
    },
    {
      heading: 'Writing your own declarations',
      content: `Three common situations:

1. **A local JS file**: put \`gst.d.ts\` next to \`gst.js\`. TypeScript automatically picks the .d.ts for imports of \`./gst.js\`.
2. **An npm package without types**: an **ambient module** declaration \`declare module "package-name" { ... }\` in a \`.d.ts\` file inside your project (for a quick fix, \`declare module "package-name";\` makes everything \`any\`).
3. **Globals**: add properties to existing global interfaces using **declaration merging**: \`interface Window { ... }\`, \`interface ImportMetaEnv { ... }\` for Vite env variables, \`namespace NodeJS { interface ProcessEnv { ... } }\` for \`process.env\`, or \`declare global { ... }\` inside a module file.

Wildcard modules type non-JS imports: \`declare module "*.module.css"\` or \`declare module "*.svg"\` (Vite's \`vite/client\` types already include these).`,
      syntax: `// types/globals.d.ts
declare module "untyped-lib" {
  export function doThing(x: string): number;
}

declare global {      // only needed inside a module file
  interface Window { analytics: { track(e: string): void } }
}
export {};`,
      tip: 'Make sure your .d.ts files are included by tsconfig (`include: ["src"]` covers src/types/*.d.ts). A .d.ts file that has top-level import/export becomes a module and its interfaces stop being global unless you wrap them in `declare global`.',
    },
    {
      heading: 'Path aliases',
      content: `Deep folders lead to imports like \`../../../utils/format.js\`. **Path aliases** let you write \`@/utils/format.js\` instead. Configure them in tsconfig.json with \`paths\`:

\`"paths": { "@/*": ["./src/*"] }\`

**Important:** \`paths\` only tells the **type checker** where to find files. It does **not** rewrite the imports in the emitted JavaScript. Something must resolve the alias at runtime:
- **Vite (React)**: add \`resolve.alias\` in vite.config.ts or the \`vite-tsconfig-paths\` plugin
- **tsx**: reads tsconfig paths automatically in development
- **Node.js production (tsc output)**: use Node's native **subpath imports** in package.json (\`"imports": { "#src/*": "./dist/*" }\`, written as \`#src/utils/format.js\`), which TypeScript understands with NodeNext, or a tool like tsc-alias

Older setups also set \`baseUrl\`; it is no longer needed for \`paths\` and is deprecated in TypeScript 6+, so avoid it in new projects.`,
    },
    {
      heading: 'module and moduleResolution: NodeNext vs Bundler',
      content: `- **NodeNext**: for code that Node.js runs directly (Express backend compiled by tsc). Follows Node's rules exactly: \`"type": "module"\` in package.json means ESM, relative imports need \`.js\` extensions, package \`exports\` fields are respected.
- **Bundler** (with \`module: "ESNext"\`): for code processed by Vite, webpack or esbuild (React frontend). Extensionless imports are allowed because the bundler resolves them.

A MERN monorepo often has two tsconfigs: \`client/tsconfig.json\` with Bundler and \`server/tsconfig.json\` with NodeNext, plus a shared \`packages/types\` folder for common types (Day 11).`,
    },
  ],
  examples: [
    {
      title: 'Named, default, namespace and type imports',
      scenario: 'A cart feature split into three files in a Node.js ESM project (module: NodeNext).',
      steps: [
        'Create types.ts, cart.ts and app.ts in src/',
        'Note the .js extensions in the import paths',
        'Run `npx tsc --noEmit` (no errors), then `npx tsx src/app.ts`',
      ],
      code: `// ===== types.ts =====
// types.ts - shared types for the cart feature
export interface CartItem {
  sku: string;
  title: string;
  price: number;
  qty: number;
}

export type Currency = "INR" | "USD";

// ===== cart.ts =====
// cart.ts - named exports + one default export
import type { CartItem, Currency } from "./types.js";

export const GST_RATE = 0.18;

export function subtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export default function formatMoney(amount: number, currency: Currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
}

// ===== app.ts =====
// app.ts - default import + named imports + namespace import
import formatMoney, { subtotal, GST_RATE } from "./cart.js";
import * as cart from "./cart.js";
import type { CartItem } from "./types.js";

const items: CartItem[] = [
  { sku: "TS-BOOK", title: "TypeScript Book", price: 499, qty: 2 },
  { sku: "MUG", title: "Coffee Mug", price: 250, qty: 1 },
];

const net = subtotal(items);
console.log(formatMoney(net));                       // ₹1,248.00
console.log(formatMoney(net * (1 + GST_RATE)));      // ₹1,472.64
console.log(cart.subtotal === subtotal);             // true`,
      result: `Type-checks with no errors. Running app.ts prints:
₹1,248.00
₹1,472.64
true`,
      explanation: '`cart.ts` has one default export (`formatMoney`) and named exports. `app.ts` imports the default without braces, named exports with braces, and the whole module as a namespace object. `import type` lines disappear completely from the compiled JavaScript. The `.js` extension is required by NodeNext; TypeScript maps it to the .ts file.',
    },
    {
      title: 'verbatimModuleSyntax requires type-only imports',
      scenario: 'A Vite or modern Node project enables `verbatimModuleSyntax`. Importing an interface like a value is now an error.',
      steps: [
        'Add `"verbatimModuleSyntax": true` to tsconfig.json',
        'Create models.ts and app.ts',
        'Run `npx tsc --noEmit` and read the error',
        'Fix the import: `import { type User, createUser } from "./models.js";`',
      ],
      code: `// ===== tsconfig.json =====
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}

// ===== models.ts =====
export interface User {
  id: string;
  name: string;
}

export function createUser(name: string): User {
  return { id: crypto.randomUUID(), name };
}

// ===== app.ts =====
// User is only a type, but it is imported like a value
import { User, createUser } from "./models.js";

const u: User = createUser("Asha");
console.log(u.name);`,
      result: `This example intentionally does NOT compile. tsc reports:
error TS1484: 'User' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.

After changing the import to \`import { type User, createUser } from "./models.js";\` it compiles, and the emitted JS becomes \`import { createUser } from "./models.js";\`.`,
      explanation: '`User` is an interface, which does not exist at runtime. With verbatimModuleSyntax, TypeScript keeps non-type imports exactly as written, so a plain `import { User }` would make the JavaScript try to import a name that does not exist. Marking it `type` tells every tool (tsc, Vite, esbuild, tsx) to remove it safely.',
    },
    {
      title: 'Declaration files: local JS, untyped npm package, globals and env',
      scenario: 'A project still has a legacy JS helper, uses a tiny npm package without types, and reads Vite env variables, a Window global and process.env.',
      steps: [
        'Add legacy/gst.d.ts next to legacy/gst.js',
        'Create types/untyped-modules.d.ts and types/env.d.ts',
        'Import and use everything in app.ts',
        'Run `npx tsc --noEmit` (no errors)',
      ],
      code: `// ===== legacy/gst.js =====
// legacy/gst.js - old JavaScript code we cannot convert yet
export function addGst(amount, rate) {
  return Math.round(amount * (1 + (rate ?? 0.18)) * 100) / 100;
}
export const DEFAULT_RATE = 0.18;

// ===== legacy/gst.d.ts =====
// legacy/gst.d.ts - types for gst.js (no implementation, only shapes)
export declare function addGst(amount: number, rate?: number): number;
export declare const DEFAULT_RATE: number;

// ===== types/untyped-modules.d.ts =====
// types/untyped-modules.d.ts - an npm package that ships no types
// and has no @types package (e.g. a small old library)
declare module "indian-number-words" {
  export function toWords(n: number): string;
  const version: string;
  export default version;
}

// ===== types/env.d.ts =====
// types/env.d.ts - typing environment variables and globals

// Vite's import.meta.env (this is how vite/client declares it)
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_RAZORPAY_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Adding a property to the browser's global Window object
interface Window {
  __APP_VERSION__: string;
}

// Node's process.env (provided by @types/node) can be augmented too
declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_URI: string;
    JWT_SECRET: string;
  }
}

// ===== app.ts =====
import { addGst, DEFAULT_RATE } from "./legacy/gst.js";
import { toWords } from "indian-number-words";

const price = addGst(1000);             // number, typed from gst.d.ts
// addGst("1000");                      // Error: string is not assignable to number

const apiUrl: string = import.meta.env.VITE_API_URL;   // typed by env.d.ts
const version: string = window.__APP_VERSION__;
const mongoUri: string = process.env.MONGO_URI;       // string, not string | undefined

console.log(price, DEFAULT_RATE, toWords(42), apiUrl, version, mongoUri);`,
      result: 'Type-checks with no errors. `price` is `number` (from gst.d.ts), `toWords` is typed by the ambient module, `import.meta.env.VITE_API_URL` and `window.__APP_VERSION__` are `string`, and `process.env.MONGO_URI` is `string` instead of `string | undefined`.',
      explanation: 'gst.d.ts sits next to gst.js, so TypeScript uses it for `./legacy/gst.js` imports. `declare module "indian-number-words"` types a package that has no .d.ts. env.d.ts is a script file (no import/export), so its interfaces merge with the global `ImportMeta`, `Window` and `NodeJS.ProcessEnv` interfaces. Note: declaring an env variable as `string` is a promise; validate env at startup (Day 11).',
    },
    {
      title: 'Path aliases with tsconfig paths',
      scenario: 'Replace `../utils/format.js` style imports with `@/utils/format.js`.',
      steps: [
        'Add the `paths` option to tsconfig.json',
        'Use `@/` imports in course-service.ts',
        'Run `npx tsc --noEmit` (no errors)',
        'Configure the same alias for runtime: Vite `resolve.alias`, or tsx in development',
      ],
      code: `// ===== tsconfig.json =====
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// ===== src/utils/format.ts =====
export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ===== src/models/course.ts =====
export interface Course {
  id: string;
  title: string;
  startsOn: Date;
}

// ===== src/services/course-service.ts =====
// Without aliases this would be "../utils/format.js" and "../models/course.js"
import { formatDate } from "@/utils/format.js";
import type { Course } from "@/models/course.js";

export function courseBanner(c: Course): string {
  return \`\${c.title} starts on \${formatDate(c.startsOn)}\`;
}`,
      result: 'Type-checks with no errors: `@/utils/format.js` resolves to src/utils/format.ts and `@/models/course.js` to src/models/course.ts. Remember that tsc does NOT rewrite these paths in the output; Vite/tsx/subpath imports must resolve them at runtime.',
      explanation: '`"@/*": ["./src/*"]` maps anything starting with `@/` into the src folder. The import is shorter and does not break when you move the importing file to another folder. For a Vite app add `resolve: { alias: { "@": "/src" } }` in vite.config.ts so the bundler understands the same alias.',
    },
    {
      title: 'Typing plain JavaScript with JSDoc and @ts-check',
      scenario: 'Before migrating a JS file to TS, you can add types with JSDoc comments and let TypeScript check it. The file stays valid JavaScript, so it runs directly in the playground.',
      steps: [
        'Add `// @ts-check` at the top of a .js file',
        'Describe types with @typedef, @param and @returns',
        'Open it in VS Code: wrong calls are underlined',
        'Run it with node or the playground',
      ],
      code: `// @ts-check
// cart.js - plain JavaScript, type-checked by TypeScript through JSDoc

/**
 * @typedef {Object} CartItem
 * @property {string} title
 * @property {number} price
 * @property {number} qty
 */

/**
 * @param {CartItem[]} items
 * @param {number} [discountPercent] optional
 * @returns {number}
 */
function cartTotal(items, discountPercent = 0) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return total - (total * discountPercent) / 100;
}

/** @type {CartItem[]} */
const items = [
  { title: "Notebook", price: 60, qty: 5 },
  { title: "Pen", price: 20, qty: 3 },
];

console.log("Total:", cartTotal(items));
console.log("With 10% off:", cartTotal(items, 10));
// cartTotal(items, "10"); // VS Code shows: Argument of type 'string' is not assignable to parameter of type 'number'.`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// @ts-check
// cart.js - plain JavaScript, type-checked by TypeScript through JSDoc
/**
 * @typedef {Object} CartItem
 * @property {string} title
 * @property {number} price
 * @property {number} qty
 */
/**
 * @param {CartItem[]} items
 * @param {number} [discountPercent] optional
 * @returns {number}
 */
function cartTotal(items, discountPercent = 0) {
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    return total - (total * discountPercent) / 100;
}
/** @type {CartItem[]} */
const items = [
    { title: "Notebook", price: 60, qty: 5 },
    { title: "Pen", price: 20, qty: 3 },
];
console.log("Total:", cartTotal(items));
console.log("With 10% off:", cartTotal(items, 10));
// cartTotal(items, "10"); // VS Code shows: Argument of type 'string' is not assignable to parameter of type 'number'.`,
      },
      result: `Console output:
Total: 360
With 10% off: 324`,
      explanation: '`// @ts-check` turns on TypeScript checking for this JS file. JSDoc tags provide the types: `@typedef` defines an object type, `[discountPercent]` marks an optional parameter. With `allowJs` + `declaration: true`, tsc can even generate a .d.ts from these comments. This is a common first step when migrating a JS project (Day 12).',
    },
  ],
  interview: [
    {
      q: 'What is a .d.ts file?',
      a: 'A TypeScript declaration file containing only type declarations (no implementation). It describes the shape of JavaScript code so TypeScript can type-check its usage. Libraries ship them, @types packages provide them, and tsc generates them with `declaration: true`.',
      level: 'Easy',
    },
    {
      q: 'What are @types packages?',
      a: 'Packages from the DefinitelyTyped repository that provide type declarations for JavaScript libraries that do not ship their own, e.g. @types/express, @types/node, @types/react. Install as dev dependencies. Libraries written in TypeScript (zod, axios, mongoose) bundle their own types and do not need them.',
      level: 'Easy',
    },
    {
      q: 'What do you do if an npm package has no types?',
      a: 'First check for @types/<name>. If none exists, write an ambient module declaration in a .d.ts file: `declare module \'pkg\' { export function fn(x: string): number; }`. As a temporary shortcut `declare module \'pkg\';` types everything as any.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between `import type` and a normal import?',
      a: '`import type` imports only type information and is always removed from the emitted JavaScript. A normal import may be kept at runtime. Type-only imports help single-file transpilers (Vite, esbuild, tsx) and avoid loading modules only for their types.',
      level: 'Medium',
    },
    {
      q: 'What does verbatimModuleSyntax do?',
      a: 'It makes TypeScript emit imports/exports exactly as written, dropping only those marked with `type`. Therefore any import used only as a type must use `import type` or `type` modifiers, otherwise error TS1484. It replaces the older importsNotUsedAsValues and preserveValueImports options.',
      level: 'Hard',
    },
    {
      q: 'Why do imports need a .js extension in a NodeNext project even though the file is .ts?',
      a: 'TypeScript does not rewrite import paths. Node\'s ESM loader requires full file paths, and the file that exists at runtime is the compiled .js. So you write the path that will be valid after compilation; TypeScript maps `./x.js` to `./x.ts` during type checking.',
      level: 'Hard',
    },
    {
      q: 'Do tsconfig `paths` aliases work at runtime?',
      a: 'No. paths only affects type checking and module resolution inside the compiler; emitted JS keeps the alias text. A bundler alias (Vite resolve.alias / vite-tsconfig-paths), tsx, Node subpath imports (#alias in package.json) or a post-build tool like tsc-alias must resolve them at runtime.',
      level: 'Medium',
    },
    {
      q: 'How do you type Vite environment variables?',
      a: `Declare them in a .d.ts file (vite-env.d.ts):
interface ImportMetaEnv { readonly VITE_API_URL: string }
interface ImportMeta { readonly env: ImportMetaEnv }
These merge with Vite's own declarations from vite/client.`,
      level: 'Medium',
    },
    {
      q: 'How do you add a property to the global Window object?',
      a: 'In a script .d.ts file: `interface Window { myGlobal: string }`. In a module file: `declare global { interface Window { myGlobal: string } } export {};`. Declaration merging adds the property to the existing interface.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between a module and a script in TypeScript?',
      a: 'A file with any top-level import or export is a module and has its own scope. A file without them is a script, and its top-level declarations are global and can clash with other scripts or lib.dom globals. The moduleDetection option (auto/force/legacy) controls this.',
      level: 'Hard',
    },
    {
      q: 'What does skipLibCheck do and is it safe?',
      a: 'It skips type-checking of all .d.ts files (mainly in node_modules), which speeds up compilation and avoids errors from conflicting third-party declarations. Your own code is still fully checked against those types. It is enabled in almost every real project.',
      level: 'Medium',
    },
    {
      q: 'NodeNext vs Bundler moduleResolution?',
      a: 'NodeNext mirrors Node\'s real resolution rules (ESM vs CJS based on package.json type, required file extensions, exports field) and is used for backends run by Node. Bundler mirrors bundlers like Vite/webpack (extensionless imports, exports field support) and is used for frontend code that a bundler processes.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'A legacy validators.js exports isEmail, isIndianMobile and a default validate(rules, value). Write validators.d.ts (including an exported Rule type) and use it from signup.ts without changing the JS file.',
      hint: 'Use `export declare function` and `export default function` in the .d.ts.',
      solution: `// ===== validators.js =====
// validators.js (legacy, untouched)
export function isEmail(value) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
}
export function isIndianMobile(value) {
  return /^[6-9]\\d{9}$/.test(value);
}
export default function validate(rules, value) {
  return rules.every((rule) => rule(value));
}

// ===== validators.d.ts =====
// validators.d.ts
export type Rule = (value: string) => boolean;
export declare function isEmail(value: string): boolean;
export declare function isIndianMobile(value: string): boolean;
export default function validate(rules: Rule[], value: string): boolean;

// ===== signup.ts =====
// signup.ts
import validate, { isEmail, isIndianMobile, type Rule } from "./validators.js";

const notEmpty: Rule = (v) => v.trim().length > 0;

console.log(validate([notEmpty, isEmail], "asha@example.com")); // true
console.log(validate([notEmpty, isIndianMobile], "12345"));     // false`,
    },
    {
      task: 'Type process.env for an Express app (NODE_ENV union, optional PORT, required MONGO_URI) and build a typed config object in config.ts. Import the config value normally and the AppConfig type with a type-only import.',
      hint: 'Augment `namespace NodeJS { interface ProcessEnv { ... } }` in a .d.ts file.',
      solution: `// ===== env.d.ts =====
// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    PORT?: string;
    MONGO_URI: string;
  }
}

// ===== config.ts =====
// src/config.ts
export interface AppConfig {
  env: "development" | "production" | "test";
  port: number;
  mongoUri: string;
}

export const config: AppConfig = {
  env: process.env.NODE_ENV,
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI,
};

// ===== server.ts =====
// src/server.ts
import { config } from "./config.js";
import type { AppConfig } from "./config.js";

function describe(c: AppConfig): string {
  return \`[\${c.env}] listening on \${c.port}\`;
}
console.log(describe(config));`,
    },
    {
      task: 'Create a models folder with user.ts and course.ts and a barrel index.ts that re-exports values normally and types with `export type`. Import from the barrel in app.ts.',
      hint: 'export type { User } from "./user.js";',
      solution: `// ===== models/user.ts =====
// models/user.ts
export interface User {
  id: string;
  name: string;
}
export const createUser = (name: string): User => ({ id: name.toLowerCase(), name });

// ===== models/course.ts =====
// models/course.ts
export interface Course {
  id: string;
  title: string;
}
export type CourseLevel = "beginner" | "advanced";

// ===== models/index.ts =====
// models/index.ts - the "barrel" file
export { createUser } from "./user.js";
export type { User } from "./user.js";
export type { Course, CourseLevel } from "./course.js";

// ===== app.ts =====
// app.ts - one import line instead of many
import { createUser, type User, type CourseLevel } from "./models/index.js";

const u: User = createUser("Asha");
const level: CourseLevel = "beginner";
console.log(u, level);`,
    },
    {
      task: 'In a React + Vite project (without vite/client), imports of `./Button.module.css` and `./logo.svg` fail with TS2307. Write wildcard module declarations that fix them.',
      hint: 'declare module "*.module.css" { const classes: Readonly<Record<string, string>>; export default classes; }',
      solution: `// ===== vite-assets.d.ts =====
// src/types/assets.d.ts (vite/client already contains similar declarations)
declare module "*.module.css" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

// ===== Button.ts =====
// Button.ts
import styles from "./Button.module.css";
import logoUrl from "./logo.svg";

export function buttonClass(primary: boolean): string {
  return primary ? styles.primary : styles.secondary;
}
export const logo: string = logoUrl;`,
    },
  ],
  quiz: [
    {
      question: 'Which install gives you types for Express when they are not bundled?',
      options: [
        'npm i express-types',
        'npm i -D @types/express',
        'npm i -D typescript-express',
        'They are always built into TypeScript',
      ],
      answer: 1,
      explanation: 'DefinitelyTyped packages are published under the @types scope.',
    },
    {
      question: 'What does `import type { User } from \'./user.js\'` compile to?',
      options: [
        'Nothing: the line is removed',
        'import { User } from \'./user.js\'',
        'const User = require(\'./user.js\')',
        'An empty object',
      ],
      answer: 0,
      explanation: 'Type-only imports are always erased.',
    },
    {
      question: 'Which statement about tsconfig `paths` is TRUE?',
      options: [
        'tsc rewrites aliases in the output',
        'Node.js reads tsconfig paths automatically',
        'It only affects type checking; a bundler or tool must resolve aliases at runtime',
        'It replaces node_modules resolution',
      ],
      answer: 2,
      explanation: 'paths is compile-time only.',
    },
    {
      question: 'In a NodeNext ESM project, how do you import src/cart.ts from src/app.ts?',
      options: [
        'import x from \'./cart\'',
        'import x from \'./cart.ts\'',
        'import x from \'cart\'',
        'import x from \'./cart.js\'',
      ],
      answer: 3,
      explanation: 'Use the extension of the compiled file; TypeScript maps .js to .ts.',
    },
    {
      question: 'What kind of declaration types an npm package that has no types at all?',
      options: [
        'declare module \'pkg\' { ... }',
        'interface pkg { }',
        'import type pkg',
        'namespace pkg.d.ts',
      ],
      answer: 0,
      explanation: 'An ambient module declaration describes the package\'s exports.',
    },
  ],
};
