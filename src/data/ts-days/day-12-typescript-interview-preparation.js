export default {
  id: 'day-12-typescript-interview-preparation',
  title: 'TypeScript Interview Preparation: 25+ Questions, Tricky Type Puzzles and Migrating a JS Project to TS',
  module: 'Module 4: Interview',
  day: 12,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'The final day brings everything together for interviews: the concepts interviewers ask most, tricky compile-time and runtime puzzles with real answers, a live-coding round with typed utilities, and a step-by-step plan for migrating an existing JavaScript MERN project to TypeScript, a very common real-world task and interview discussion.',
  objectives: [
    'Answer the 25+ most common TypeScript interview questions clearly',
    'Predict compiler errors and runtime output in tricky puzzles',
    'Implement typed utilities (debounce, pick, memoize) and your own utility types in a live-coding round',
    'Explain and execute an incremental JavaScript to TypeScript migration plan',
  ],
  theory: [
    {
      heading: 'What interviewers test in TypeScript rounds',
      content: `For MERN / full-stack roles (fresher to 3 years), TypeScript questions usually fall into four groups:

1. **Fundamentals**: why TS, type inference, any vs unknown vs never, interface vs type, enums vs unions, tsconfig strict
2. **Type system**: unions and narrowing, discriminated unions, generics with constraints, utility types, keyof/typeof, mapped and conditional types
3. **Practical stack usage**: typing React props/events/hooks, Express req/res and middleware, Mongoose models, Zod validation, shared types
4. **Live coding / puzzles**: predict the error or output, implement Pick/Omit/ReturnType, type a debounce or API client

How to answer: give a **one-line definition**, a **tiny example**, and **when you would use it in a real project**. Interviewers value "I used X in my project to solve Y" far more than memorised text.`,
    },
    {
      heading: 'The five ideas behind most tricky questions',
      content: `Nearly every "tricky" TypeScript question is explained by one of these:

1. **Types are erased.** Nothing typed exists at runtime: \`as\` does not convert, interfaces cannot be checked with \`instanceof\`, \`private\` and \`readonly\` are not enforced in JS.
2. **Structural typing.** Compatibility depends on shape, not name. Extra properties are allowed, except in fresh object literals (excess property checks).
3. **Control-flow narrowing.** The type of a variable changes line by line based on checks (typeof, in, instanceof, discriminants, guards).
4. **Assignability rules of special types.** \`any\` goes everywhere and accepts everything; \`unknown\` accepts everything but goes nowhere without narrowing; \`never\` goes everywhere but accepts nothing; \`{}\` means "any non-null value", not "empty object".
5. **Distribution.** Conditional types distribute over unions; \`keyof (A | B)\` gives only the common keys; \`never\` disappears from unions.`,
    },
    {
      heading: 'Live-coding round: what to practise',
      content: `Typical tasks (all solved in this lesson's examples and practice):
- Implement \`MyPick\`, \`MyOmit\`, \`MyPartial\`, \`MyReadonly\`, \`MyReturnType\`, \`MyAwaited\`, \`MyExclude\`
- Type \`debounce\`, \`throttle\`, \`memoize\`, \`pick\`, \`groupBy\`, a typed \`EventEmitter\`
- Model API state or reducer actions with a discriminated union
- Write a generic \`fetchJson<T>\` / \`ApiResponse<T>\` and explain why runtime validation is still needed
- Type a React component with props, children and an event handler
- Type an Express route with params, body and response

Talk while you code: say why you chose a constraint, why \`unknown\` instead of \`any\`, and where the trust boundary is.`,
      tip: 'If you get stuck on a type, write the runtime code first with a simple signature, make it work, then tighten the types. A working, slightly loose solution beats an unfinished perfect one.',
    },
    {
      heading: 'Migrating a JavaScript project to TypeScript: the plan',
      content: `Never rewrite everything in one big PR. Migrate **incrementally** while the app keeps running:

1. **Install and configure**: \`npm i -D typescript @types/node @types/express @types/react ...\`, add tsconfig.json with \`allowJs: true\`, \`checkJs: false\`, \`strict: false\` at first. JS and TS files now build together.
2. **Add type checking to the build/CI**: \`tsc --noEmit\` must pass.
3. **Start from the leaves**: convert files with no internal imports first (utils, constants, config), then models/types, services, routes/controllers, and finally components/pages. Rename \`.js\` → \`.ts\` (or \`.jsx\` → \`.tsx\`) and fix errors.
4. **Create shared types early**: \`User\`, \`Course\`, \`ApiResponse<T>\` in a \`types/\` folder (or Zod schemas in a shared package).
5. **Add runtime validation at boundaries** (request bodies, env, external APIs) with Zod while converting routes.
6. **Tighten gradually**: turn on \`noImplicitAny\`, then \`strictNullChecks\`, then full \`strict\`, fixing errors folder by folder. Use \`// @ts-expect-error\` with a comment (not \`@ts-ignore\`) for known temporary issues.
7. **Finish**: remove \`allowJs\`, ban \`any\` with ESLint (\`@typescript-eslint/no-explicit-any\`), and keep \`strict: true\` for all new code.`,
    },
    {
      heading: 'Migration pitfalls and how to avoid them',
      content: `- **any everywhere**: makes the migration look done but gives no safety. Prefer \`unknown\` + narrowing, or a \`TODO\` type alias you can search for later.
- **Casting API data** with \`as User\`: hides real bugs. Validate with Zod at the boundary.
- **Big-bang strict mode**: thousands of errors at once demoralise the team. Enable flags one at a time.
- **Forgetting runtime paths**: tsconfig \`paths\` are not resolved at runtime; configure Vite/tsx/subpath imports too.
- **Missing types for packages**: install \`@types/*\` or write a small \`declare module\` file.
- **Mixing CommonJS and ESM**: decide on ESM (\`"type": "module"\`, NodeNext) for the backend before converting files.
- **No tests**: add a few tests for critical flows before refactoring so behaviour does not change silently.`,
      tip: '`@ts-expect-error` is better than `@ts-ignore`: if the error disappears later (because you fixed it), TypeScript reports the unused directive, so stale suppressions do not pile up.',
    },
    {
      heading: 'Quick revision sheet',
      content: `- \`any\` = no checks; \`unknown\` = must narrow; \`never\` = impossible
- \`interface\` merges and extends; \`type\` does unions, tuples, mapped and conditional types
- Union \`A | B\` = one of; intersection \`A & B\` = all of
- Narrowing: \`typeof\`, \`in\`, \`instanceof\`, equality, discriminant, \`x is T\`, \`asserts x is T\`
- \`satisfies\` checks without widening; \`as\` overrides (unsafe); \`as const\` makes literals readonly
- Generics keep relationships between inputs and outputs; constrain with \`extends\`, \`keyof\`
- Utility types: Partial, Required, Readonly, Pick, Omit, Record, Exclude, Extract, NonNullable, ReturnType, Parameters, Awaited
- Types are erased: validate external data at runtime (Zod + \`z.infer\`)
- React: \`ReactNode\` children, \`ChangeEvent<HTMLInputElement>\`, \`useState<T | null>(null)\`, \`useRef<HTMLInputElement>(null)\`
- Express: \`Request<Params, ResBody, ReqBody, Query>\`, \`Response<T>\`, augment \`Express.Request\` for \`req.user\`
- Mongoose: \`Schema<IUser>\`, \`model<IUser>\`, \`HydratedDocument<IUser>\`, \`InferSchemaType\``,
    },
  ],
  examples: [
    {
      title: 'Puzzle 1: which lines fail to compile?',
      scenario: 'A classic interview question: seven assignments, some legal and some not. Predict before you read the answer.',
      steps: [
        'Read each numbered line and decide: error or OK?',
        'Run `npx tsc --noEmit --strict puzzle1.ts`',
        'Compare with your predictions',
      ],
      code: `// PUZZLE: which of these lines are compile errors? Predict first, then run tsc.
interface Point {
  x: number;
  y: number;
}

const p3 = { x: 1, y: 2, z: 3 };
const a: Point = p3;                      // 1) extra property via a variable
const b: Point = { x: 1, y: 2, z: 3 };    // 2) extra property in a fresh literal

const nums: readonly number[] = [1, 2, 3];
const copy: number[] = nums;              // 3) readonly -> mutable

let anything: unknown = "hello";
let text: string = anything;              // 4) unknown -> string

let loose: any = 42;
let str: string = loose;                  // 5) any -> string

const empty: {} = 0;                      // 6) number into {}

function greet(name: string, greeting = "Hi") {
  return \`\${greeting}, \${name}\`;
}
greet("Asha", undefined);                 // 7) passing undefined to a default param`,
      result: `This puzzle intentionally does NOT compile. tsc reports exactly three errors:
error TS2353: Object literal may only specify known properties, and 'z' does not exist in type 'Point'.
error TS4104: The type 'readonly number[]' is 'readonly' and cannot be assigned to the mutable type 'number[]'.
error TS2322: Type 'unknown' is not assignable to type 'string'.

Answer: lines 2, 3 and 4 are errors. Lines 1, 5, 6 and 7 compile.`,
      explanation: '1) OK: excess property checks only apply to fresh object literals; `p3` has x and y, so it is structurally a Point. 2) Error: a fresh literal with an unknown property `z`. 3) Error: a readonly array cannot be assigned to a mutable one (that would allow push). 4) Error: `unknown` must be narrowed first. 5) OK: `any` is assignable to everything (that is why it is dangerous). 6) OK: `{}` means any non-null, non-undefined value, so `0` fits. 7) OK: passing `undefined` to a parameter with a default uses the default.',
    },
    {
      title: 'Puzzle 2: predict the runtime output',
      scenario: 'Six snippets where TypeScript code behaves differently from what beginners expect, because types are erased.',
      steps: [
        'Write down your predicted output for each numbered line',
        'Run it with tsx or in the playground',
        'Explain each line in one sentence',
      ],
      code: `// PUZZLE: predict the console output. Types are erased - only JavaScript runs!

// 1) "as" does not convert anything
const input: unknown = "42";
const n = input as number;
console.log(1, typeof n, n + 1);

// 2) Numeric enums have a reverse mapping
enum Level {
  Low,
  Medium,
  High,
}
console.log(2, Level.Medium, Level[2], Object.keys(Level).length);

// 3) Optional property vs undefined value
type Opts = { debug?: boolean };
const o1: Opts = {};
const o2: Opts = { debug: undefined };
console.log(3, "debug" in o1, "debug" in o2);

// 4) Interfaces do not exist at runtime: you cannot check them with instanceof
interface Animal {
  name: string;
}
const pet: Animal = { name: "Tommy" };
console.log(4, typeof pet, pet.constructor === Object);

// 5) readonly is compile-time only
const frozenLooking: readonly string[] = ["a"];
(frozenLooking as string[]).push("b");
console.log(5, frozenLooking);

// 6) private is compile-time only, #private is real
class Wallet {
  private balance = 100;
  #pin = 1234;
  hasPin() {
    return this.#pin > 0;
  }
}
const w = new Wallet();
console.log(6, JSON.stringify(w), (w as any).balance, w.hasPin());`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// PUZZLE: predict the console output. Types are erased - only JavaScript runs!
// 1) "as" does not convert anything
const input = "42";
const n = input;
console.log(1, typeof n, n + 1);
// 2) Numeric enums have a reverse mapping
var Level;
(function (Level) {
    Level[Level["Low"] = 0] = "Low";
    Level[Level["Medium"] = 1] = "Medium";
    Level[Level["High"] = 2] = "High";
})(Level || (Level = {}));
console.log(2, Level.Medium, Level[2], Object.keys(Level).length);
const o1 = {};
const o2 = { debug: undefined };
console.log(3, "debug" in o1, "debug" in o2);
const pet = { name: "Tommy" };
console.log(4, typeof pet, pet.constructor === Object);
// 5) readonly is compile-time only
const frozenLooking = ["a"];
frozenLooking.push("b");
console.log(5, frozenLooking);
// 6) private is compile-time only, #private is real
class Wallet {
    balance = 100;
    #pin = 1234;
    hasPin() {
        return this.#pin > 0;
    }
}
const w = new Wallet();
console.log(6, JSON.stringify(w), w.balance, w.hasPin());`,
      },
      result: `Console output:
1 string 421
2 1 High 6
3 false true
4 object true
5 [ 'a', 'b' ]
6 {"balance":100} 100 true`,
      explanation: '1) `as number` changes nothing at runtime: n is still the string "42", so `n + 1` is "421". 2) Numeric enums compile to an object with both name→value and value→name keys, so it has 6 keys. 3) An optional property can be missing (`in` is false) or present with the value undefined (`in` is true). 4) Interfaces vanish; `pet` is a plain object. 5) `readonly` is a compile-time view: a cast allows mutation. 6) `private balance` is a normal JS property visible in JSON and via `any`; `#pin` is truly private and not serialised.',
    },
    {
      title: 'Puzzle 3: type-level reasoning',
      scenario: 'Questions about keyof on unions, never, distributive conditional types and array types, answered with compile-time tests.',
      steps: [
        'Hover each type alias in VS Code and compare with the comment',
        'Run `npx tsc --noEmit --strict puzzle3.ts` (no errors: the tests pass)',
        'Then try the wrong answers shown in the result',
      ],
      code: `// Type-level puzzles: hover each alias in VS Code, then check the "tests" below
const LEVELS = ["low", "high"] as const;
type Lit = (typeof LEVELS)[number];                   // "low" | "high"
type Keys = keyof { a: 1 } | keyof { b: 2 };          // "a" | "b"
type CommonKeys = keyof ({ a: 1; c: 3 } | { b: 2; c: 3 }); // "c"  (keyof a union = shared keys)
type WithNever = string | never;                      // string (never disappears in unions)
type Both = string & never;                           // never
type Dist<T> = T extends string ? "S" : "N";
type R1 = Dist<string | number>;                      // "S" | "N" (distributive)
type NoDist<T> = [T] extends [string] ? "S" : "N";
type R2 = NoDist<string | number>;                    // "N"
type Arr = (string | number)[];                       // not the same as string[] | number[]

// "Tests": each line only compiles if the comment above is correct
const t1: Keys[] = ["a", "b"];
const t2: CommonKeys = "c";
const t3: WithNever = "still a string";
const t4: R1[] = ["S", "N"];
const t5: R2 = "N";
const t6: Arr = ["mixed", 1];
const t7: Lit = "high";
function impossible(x: Both): string {
  return x; // never is assignable to everything
}
console.log(t1, t2, t3, t4, t5, t6, t7, typeof impossible);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Type-level puzzles: hover each alias in VS Code, then check the "tests" below
const LEVELS = ["low", "high"];
// "Tests": each line only compiles if the comment above is correct
const t1 = ["a", "b"];
const t2 = "c";
const t3 = "still a string";
const t4 = ["S", "N"];
const t5 = "N";
const t6 = ["mixed", 1];
const t7 = "high";
function impossible(x) {
    return x; // never is assignable to everything
}
console.log(t1, t2, t3, t4, t5, t6, t7, typeof impossible);`,
      },
      result: `Console output:
[ 'a', 'b' ] c still a string [ 'S', 'N' ] N [ 'mixed', 1 ] high function

The tests are real. These WRONG answers:
const wrong1: CommonKeys = "a";
const wrong2: NoDist<string | number> = "S";
const wrong3: string[] | number[] = ["mixed", 1];
are rejected by tsc:
error TS2322: Type '"a"' is not assignable to type '"c"'.
error TS2322: Type '"S"' is not assignable to type '"N"'.
error TS2322: Type '(string | number)[]' is not assignable to type 'string[] | number[]'.
  Type '(string | number)[]' is not assignable to type 'string[]'.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.`,
      explanation: '`keyof (A | B)` is only the keys that exist in both (you can only safely access common keys of a union). `never` disappears from unions and makes intersections impossible. `Dist` distributes over the union, `NoDist` does not because `[T]` is not a naked type parameter. `(string | number)[]` allows mixed arrays, while `string[] | number[]` requires all elements of one type.',
    },
    {
      title: 'Migrating a JavaScript module to TypeScript',
      scenario: 'A cart utility from a JS MERN project. In JS, a coupon with a wrong shape silently produced NaN. The TS version makes the coupon shape explicit.',
      steps: [
        'Rename utils/cart.js to utils/cart.ts',
        'Add interfaces for the data and a discriminated union for coupons',
        'Fix the errors tsc reports',
        'Run it',
      ],
      code: `// ===== BEFORE: utils/cart.js =====
// utils/cart.js - BEFORE: plain JavaScript (works... until it doesn't)
export function applyCoupon(cart, coupon) {
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  if (!coupon) return subtotal;
  if (coupon.type === "flat") return Math.max(subtotal - coupon.amount, 0);
  if (coupon.type === "percent") return subtotal - (subtotal * coupon.percent) / 100;
  return subtotal;
}

// ===== AFTER: utils/cart.ts =====
// utils/cart.ts - AFTER: migrated to TypeScript
export interface CartItem {
  sku: string;
  price: number;
  qty: number;
}

export interface Cart {
  items: CartItem[];
}

// The implicit "type" string becomes a discriminated union
export type Coupon =
  | { type: "flat"; amount: number }
  | { type: "percent"; percent: number };

export function applyCoupon(cart: Cart, coupon?: Coupon): number {
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  if (!coupon) return subtotal;
  switch (coupon.type) {
    case "flat":
      return Math.max(subtotal - coupon.amount, 0);
    case "percent":
      return subtotal - (subtotal * coupon.percent) / 100;
    default: {
      const unknownCoupon: never = coupon; // new coupon types must be handled
      return unknownCoupon;
    }
  }
}

const cart: Cart = { items: [{ sku: "TS-BOOK", price: 500, qty: 2 }, { sku: "PEN", price: 20, qty: 5 }] };
console.log(applyCoupon(cart));
console.log(applyCoupon(cart, { type: "flat", amount: 150 }));
console.log(applyCoupon(cart, { type: "percent", percent: 10 }));
// applyCoupon(cart, { type: "percent", amount: 10 });
// JS silently returned NaN for this. TS: Object literal may only specify known properties...`,
      playground: {
        html: '<p>Open the console</p>',
        js: `function applyCoupon(cart, coupon) {
    const subtotal = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
    if (!coupon)
        return subtotal;
    switch (coupon.type) {
        case "flat":
            return Math.max(subtotal - coupon.amount, 0);
        case "percent":
            return subtotal - (subtotal * coupon.percent) / 100;
        default: {
            const unknownCoupon = coupon; // new coupon types must be handled
            return unknownCoupon;
        }
    }
}
const cart = { items: [{ sku: "TS-BOOK", price: 500, qty: 2 }, { sku: "PEN", price: 20, qty: 5 }] };
console.log(applyCoupon(cart));
console.log(applyCoupon(cart, { type: "flat", amount: 150 }));
console.log(applyCoupon(cart, { type: "percent", percent: 10 }));
// applyCoupon(cart, { type: "percent", amount: 10 });
// JS silently returned NaN for this. TS: Object literal may only specify known properties...`,
      },
      result: `Console output:
1100
950
990`,
      explanation: 'The implicit contract in the JS version ("coupon has a type and either amount or percent") becomes the explicit `Coupon` discriminated union. The optional `coupon?` documents that it may be missing, and the `never` check forces new coupon types to be handled. The commented call shows the bug JS allowed: `{ type: "percent", amount: 10 }` would compute `subtotal * undefined` = NaN; TypeScript rejects it at compile time.',
    },
    {
      title: 'Live-coding round: typed debounce, pick, memoize and your own utility types',
      scenario: 'Common live-coding tasks in TypeScript interviews, implemented with full type safety.',
      steps: [
        'Implement each function and type',
        'Run `npx tsc --noEmit --strict` (no errors)',
        'Run it with tsx or the playground (debounce prints after 100 ms)',
      ],
      code: `// Live-coding round: implement typed utilities that interviewers love

// 1) A typed debounce: keeps the parameter types of the original function
function debounce<A extends unknown[]>(fn: (...args: A) => void, waitMs: number): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
}

// 2) pick: a typed version of lodash's pick
function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) result[key] = obj[key];
  return result;
}

// 3) Your own utility types
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
type MyAwaited<T> = T extends Promise<infer V> ? MyAwaited<V> : T;

// 4) A typed memoize for single-argument functions
function memoize<Arg, R>(fn: (arg: Arg) => R): (arg: Arg) => R {
  const cache = new Map<Arg, R>();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg)!;
  };
}

// ---- Try them ----
const search = debounce((query: string, page: number) => console.log("search:", query, "page", page), 100);
search("re", 1);
search("rea", 1);
search("react", 2); // only this call runs, 100 ms later
// search(42, 1);   // Error: Argument of type 'number' is not assignable to parameter of type 'string'.

const user = { id: "u1", name: "Asha", password: "secret", role: "admin" };
const safe = pick(user, ["id", "name"] as const); // { id: string; name: string }
console.log(safe);

let calls = 0;
const slowSquare = memoize((n: number) => {
  calls++;
  return n * n;
});
console.log(slowSquare(9), slowSquare(9), "computed", calls, "time(s)");

const draft: MyPartial<typeof user> = { name: "Ravi" };
const locked: MyReadonly<{ port: number }> = { port: 5000 };
const r: MyReturnType<typeof slowSquare> = 81;
const v: MyAwaited<Promise<Promise<string>>> = "deep";
console.log(draft, locked.port, r, v);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Live-coding round: implement typed utilities that interviewers love
// 1) A typed debounce: keeps the parameter types of the original function
function debounce(fn, waitMs) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), waitMs);
    };
}
// 2) pick: a typed version of lodash's pick
function pick(obj, keys) {
    const result = {};
    for (const key of keys)
        result[key] = obj[key];
    return result;
}
// 4) A typed memoize for single-argument functions
function memoize(fn) {
    const cache = new Map();
    return (arg) => {
        if (!cache.has(arg))
            cache.set(arg, fn(arg));
        return cache.get(arg);
    };
}
// ---- Try them ----
const search = debounce((query, page) => console.log("search:", query, "page", page), 100);
search("re", 1);
search("rea", 1);
search("react", 2); // only this call runs, 100 ms later
// search(42, 1);   // Error: Argument of type 'number' is not assignable to parameter of type 'string'.
const user = { id: "u1", name: "Asha", password: "secret", role: "admin" };
const safe = pick(user, ["id", "name"]); // { id: string; name: string }
console.log(safe);
let calls = 0;
const slowSquare = memoize((n) => {
    calls++;
    return n * n;
});
console.log(slowSquare(9), slowSquare(9), "computed", calls, "time(s)");
const draft = { name: "Ravi" };
const locked = { port: 5000 };
const r = 81;
const v = "deep";
console.log(draft, locked.port, r, v);`,
      },
      result: `Console output:
{ id: 'u1', name: 'Asha' }
81 81 computed 1 time(s)
{ name: 'Ravi' } 5000 81 deep
search: react page 2`,
      explanation: '`debounce<A extends unknown[]>` captures the parameter tuple of the original function, so the debounced version accepts exactly `(query: string, page: number)`. `pick<T, K extends keyof T>` returns `Pick<T, K>`, so `safe` has no password property in its type. `memoize` is generic over argument and result. `MyReturnType` and `MyAwaited` use `infer`; `MyAwaited` recurses to unwrap nested promises. Note the debounced log appears last because it runs after the timer.',
    },
  ],
  interview: [
    {
      q: '1. What is TypeScript and why use it?',
      a: 'A statically typed superset of JavaScript that compiles to plain JS. It catches type errors at compile time, improves editor tooling (autocomplete, refactoring), documents code, and scales better for teams. Types are erased at runtime.',
      level: 'Easy',
    },
    {
      q: '2. any vs unknown vs never?',
      a: 'any disables checking (assignable to and from everything). unknown accepts any value but must be narrowed before use (type-safe any). never has no values: return type of functions that never return, the leftover type in exhaustive checks, and the result of impossible intersections.',
      level: 'Easy',
    },
    {
      q: '3. interface vs type?',
      a: 'Both describe object shapes. Interfaces support declaration merging and extends; type aliases can name unions, tuples, primitives, mapped and conditional types and compose with &. Use one consistently; interface is common for object contracts, type for everything else.',
      level: 'Easy',
    },
    {
      q: '4. What is type inference? When should you annotate?',
      a: 'TS deduces types from values and return statements. Rely on inference for locals; annotate function parameters, exported/public function return types, empty arrays/null-initialised state, and object literals that must match a contract.',
      level: 'Easy',
    },
    {
      q: '5. What does strict mode include?',
      a: 'noImplicitAny, strictNullChecks, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitThis, useUnknownInCatchVariables, alwaysStrict (and strictBuiltinIteratorReturn in newer versions). Always on for new projects.',
      level: 'Medium',
    },
    {
      q: '6. Union vs intersection types?',
      a: 'A | B: the value is one of the types (only common members usable without narrowing). A & B: the value has all members of both. Unions model alternatives (status, id), intersections combine pieces (WithTimestamps & User).',
      level: 'Easy',
    },
    {
      q: '7. What is narrowing? List the ways to narrow.',
      a: 'Refining a union to a more specific type via control flow: typeof, instanceof, in, equality/literal checks, truthiness, Array.isArray, discriminant property checks, user-defined type guards (x is T) and assertion functions (asserts x is T).',
      level: 'Medium',
    },
    {
      q: '8. What is a discriminated union and why is it useful?',
      a: 'A union of object types with a shared literal tag (type/kind/status). Switching on the tag narrows the object, so payload fields are only accessible in the right branch. With a never default it gives exhaustiveness checking. Used for API state, reducer actions and events.',
      level: 'Medium',
    },
    {
      q: '9. What are generics? Give a real example.',
      a: 'Type parameters that preserve type relationships: `async function apiGet<T>(url: string): Promise<ApiResponse<T>>`, `useState<User | null>(null)`, `Repository<T extends { id: string }>`. They avoid any while keeping code reusable.',
      level: 'Easy',
    },
    {
      q: '10. What is a generic constraint? Write getProperty.',
      a: 'A limit on a type parameter with extends. function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }',
      level: 'Medium',
    },
    {
      q: '11. Explain Partial, Pick, Omit and Record with a MERN example.',
      a: 'For a User model: Omit<User, \'_id\'> for the create body, Partial<Omit<User, \'_id\'>> for a PATCH body, Pick<User, \'_id\' | \'name\'> for a public profile, Record<Role, Permission[]> for a role-permission table.',
      level: 'Easy',
    },
    {
      q: '12. keyof vs typeof?',
      a: 'keyof T gives the union of T\'s property names (type → type). typeof x in a type position gives the type of a value (value → type). Combined: keyof typeof config.',
      level: 'Medium',
    },
    {
      q: '13. What is `as const`?',
      a: 'A const assertion that infers the narrowest literal types and makes objects/arrays deeply readonly: [\'a\', \'b\'] as const is readonly [\'a\', \'b\']. Used to derive union types from runtime arrays: (typeof ARR)[number].',
      level: 'Medium',
    },
    {
      q: '14. satisfies vs as vs type annotation?',
      a: 'Annotation (const x: T) checks and widens to T. as T asserts without checking compatibility thoroughly (can hide bugs). satisfies T checks compatibility but keeps the narrower inferred type (exact keys and literal values).',
      level: 'Medium',
    },
    {
      q: '15. What are mapped types?',
      a: 'Types that iterate over keys: { [K in keyof T]: ... }. Partial, Readonly and Record are mapped types. Modifiers +/- readonly and ? can be added/removed and keys can be remapped with as (e.g. getter names with template literal types).',
      level: 'Medium',
    },
    {
      q: '16. What are conditional types and infer?',
      a: 'T extends U ? X : Y chooses a type. infer captures part of a matched type: type ReturnType<F> = F extends (...a: any[]) => infer R ? R : never. They distribute over unions when T is a naked type parameter.',
      level: 'Hard',
    },
    {
      q: '17. What are declaration files and @types?',
      a: '.d.ts files contain only type declarations for JS code. Libraries ship them or the community publishes them as @types/<pkg> (DefinitelyTyped). For untyped packages write `declare module \'pkg\' { ... }`.',
      level: 'Medium',
    },
    {
      q: '18. What is declaration merging? Real use?',
      a: 'Same-named interfaces (and namespaces) merge. Used to augment library types: adding user to Express.Request, extending Window, typing Vite\'s ImportMetaEnv or NodeJS.ProcessEnv.',
      level: 'Medium',
    },
    {
      q: '19. Does TypeScript validate API data at runtime?',
      a: 'No. Types are erased. fetch().json() and req.body are effectively any/unknown. Use runtime validation (Zod, Valibot, type guards) at trust boundaries; z.infer keeps types and validation in sync.',
      level: 'Easy',
    },
    {
      q: '20. How do you type React props, children and events?',
      a: 'Props with a type/interface on the destructured parameter; children: ReactNode; events: ChangeEvent<HTMLInputElement>, FormEvent<HTMLFormElement>, MouseEvent<HTMLButtonElement>. Extend native props with ComponentProps<\'button\'>.',
      level: 'Easy',
    },
    {
      q: '21. How do you type Express handlers and add req.user?',
      a: 'Request<Params, ResBody, ReqBody, Query> and Response<ResBody>; middleware as RequestHandler; error middleware with four params and err: unknown. Augment via declare global { namespace Express { interface Request { user?: AuthUser } } }.',
      level: 'Medium',
    },
    {
      q: '22. How do you type a Mongoose model?',
      a: 'interface IUser; new Schema<IUser>({...}); model<IUser>(\'User\', schema). Documents are HydratedDocument<IUser>; use Types.ObjectId for refs, lean<T>() for plain objects, or derive types with InferSchemaType.',
      level: 'Medium',
    },
    {
      q: '23. TypeScript private vs JavaScript #private?',
      a: 'private is compile-time only and erased (accessible at runtime and via any). #private is enforced by the JS engine, invisible to Object.keys/JSON.stringify and inaccessible outside the class.',
      level: 'Medium',
    },
    {
      q: '24. Abstract class vs interface?',
      a: 'Interface: pure contract, no runtime code, multiple can be implemented. Abstract class: real class with shared implementation and abstract members, cannot be instantiated, only one can be extended.',
      level: 'Medium',
    },
    {
      q: '25. Enums vs union literal types?',
      a: 'Enums generate runtime objects (numeric ones have reverse mappings) and have quirks with isolated transpilers (const enum). Union literals have zero runtime cost and match JSON directly. Modern code usually prefers unions, using as const arrays when runtime values are needed.',
      level: 'Medium',
    },
    {
      q: '26. What is the difference between @ts-ignore and @ts-expect-error?',
      a: 'Both suppress the error on the next line. @ts-expect-error itself becomes an error if there is no error to suppress, so stale suppressions are detected after the code is fixed. Prefer it, always with a comment explaining why.',
      level: 'Medium',
    },
    {
      q: '27. How would you migrate a large JS MERN project to TypeScript?',
      a: 'Incrementally: add TS with allowJs and loose settings, run tsc --noEmit in CI, convert leaf modules first (utils, config, models), add shared types and Zod validation at boundaries, then convert routes and components, enable strict flags one by one, remove allowJs and ban any with ESLint at the end.',
      level: 'Hard',
    },
    {
      q: '28. Why does `keyof (A | B)` return only the common keys?',
      a: 'A value of type A | B is either an A or a B, so the only keys you can safely access without narrowing are those present in both. keyof (A & B), by contrast, gives the keys of both.',
      level: 'Hard',
    },
    {
      q: '29. What is variance in function parameters (strictFunctionTypes)?',
      a: 'With strictFunctionTypes, function type parameters are checked contravariantly: a function expecting Animal can be used where a function expecting Dog is required, but not the other way round. Method-shorthand parameters stay bivariant for compatibility.',
      level: 'Hard',
    },
    {
      q: '30. What does `{}` mean as a type?',
      a: 'Any value except null and undefined (strings, numbers, objects...). It does NOT mean an empty object. For \'any object\' use object or Record<string, unknown>; for \'empty object\' use Record<string, never>.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: `Migrate this JS function to TypeScript, adding a User interface (with an optional nickname) and making the parameter types strict:

function getActiveUserNames(users, minAge) {
  return users.filter(u => u.active && u.age >= minAge).map(u => u.name.toUpperCase());
}

Also use the nickname when present.`,
      hint: 'Use readonly User[] for the input and `u.nickname ?? u.name`.',
      solution: `// BEFORE (JS):
// function getActiveUserNames(users, minAge) {
//   return users.filter(u => u.active && u.age >= minAge).map(u => u.name.toUpperCase());
// }
// getActiveUserNames(users, "18"); // works by accident ("18" coerces), a bug waiting to happen

// AFTER (TS):
interface User {
  id: string;
  name: string;
  age: number;
  active: boolean;
  nickname?: string;
}

function getActiveUserNames(users: readonly User[], minAge: number): string[] {
  return users.filter((u) => u.active && u.age >= minAge).map((u) => (u.nickname ?? u.name).toUpperCase());
}

const users: User[] = [
  { id: "1", name: "Asha", age: 22, active: true },
  { id: "2", name: "Ravi", age: 17, active: true },
  { id: "3", name: "Neha", age: 30, active: false },
  { id: "4", name: "Karan", age: 25, active: true, nickname: "KK" },
];

console.log(getActiveUserNames(users, 18)); // [ 'ASHA', 'KK' ]
// getActiveUserNames(users, "18"); // Error: Argument of type 'string' is not assignable to parameter of type 'number'.`,
    },
    {
      task: 'Type challenges: implement MyExclude, MyOmit (using key remapping), TupleToUnion, First, Last and Length, and prove them with compile-time tests.',
      hint: 'First: T extends readonly [infer F, ...unknown[]] ? F : never. Length: T[\'length\'].',
      solution: `// Type challenges (solutions)
type MyExclude<T, U> = T extends U ? never : T;
type MyOmit<T, K extends keyof any> = { [P in keyof T as P extends K ? never : P]: T[P] };
type TupleToUnion<T extends readonly unknown[]> = T[number];
type First<T extends readonly unknown[]> = T extends readonly [infer F, ...unknown[]] ? F : never;
type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never;
type Length<T extends readonly unknown[]> = T["length"];

// Tests (the file only compiles if every answer is right)
type Status = "draft" | "published" | "archived";
const s1: MyExclude<Status, "archived"> = "draft";
const o1: MyOmit<{ a: number; b: string; c: boolean }, "b" | "c"> = { a: 1 };
const u1: TupleToUnion<["x", "y"]> = "y";
const f1: First<[1, 2, 3]> = 1;
const l1: Last<[1, 2, 3]> = 3;
const len: Length<["a", "b", "c"]> = 3;

console.log(s1, o1, u1, f1, l1, len);`,
    },
    {
      task: 'Write the tsconfig.json for phase 1 of a migration (JS and TS side by side, loose checking) and list the flags you will flip in phase 2.',
      hint: 'allowJs: true, checkJs: false, strict: false; later strict, noImplicitAny, noUncheckedIndexedAccess.',
      solution: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",

    // Phase 1: let JS and TS live together
    "allowJs": true,          // .js files are compiled/copied with .ts files
    "checkJs": false,         // turn on per file with // @ts-check
    "strict": false,          // start loose...
    "noImplicitAny": false,

    // Phase 2 (after most files are .ts): flip these one at a time
    // "strict": true,
    // "noImplicitAny": true,
    // "noUncheckedIndexedAccess": true,

    "esModuleInterop": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src"]
}`,
    },
    {
      task: `Convert this Express JS route to TypeScript with Zod validation and a typed ApiResponse:

router.post('/users', async (req, res) => {
  const { name, email, age } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  res.status(201).json({ id: Date.now(), name, email, age });
});`,
      hint: 'Create createUserSchema, type the input with z.infer and respond with Response<ApiResponse<UserDto>>.',
      solution: `// BEFORE (routes/users.js):
// router.post("/users", async (req, res) => {
//   const { name, email, age } = req.body;   // anything could be here
//   if (!email) return res.status(400).json({ error: "email required" });
//   res.status(201).json({ id: Date.now(), name, email, age });
// });

// AFTER (routes/users.ts):
import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  age: z.coerce.number().int().min(13).optional(),
});
type CreateUserInput = z.infer<typeof createUserSchema>;
type UserDto = CreateUserInput & { id: number };
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string; issues?: Record<string, string[] | undefined> };

export const usersRouter = Router();

usersRouter.post("/users", (req: Request<{}, ApiResponse<UserDto>, unknown>, res: Response<ApiResponse<UserDto>>) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: "Invalid body", issues: parsed.error.flatten().fieldErrors });
    return;
  }
  const user: UserDto = { id: Date.now(), ...parsed.data };
  res.status(201).json({ success: true, data: user });
});`,
    },
    {
      task: `Debugging round: fix every strict-mode error in this code without \`any\` or \`@ts-ignore\`, then make it print the discounted price of the product whose id comes from the URL:

interface Product { id: number; title: string; price: number; discount?: number }
function finalPrice(p: Product) { return Math.round(p.price * (1 - p.discount / 100)); }
function findProduct(list, id) { return list.find((p: Product) => p.id === id); }
const idFromUrl = "1";
const product: Product | undefined = catalogue.find((p) => p.id === idFromUrl);
console.log(product.title, finalPrice(product));

tsc reports: 'p.discount' is possibly 'undefined' (TS18048), implicit any for 'list' and 'id' (TS7006), comparing number and string has no overlap (TS2367), and 'product' is possibly 'undefined' (TS18048, TS2345).`,
      hint: 'Use `??` for the optional discount, type the parameters, convert the id with Number() and check the product before using it.',
      solution: `// Fix the bugs that the compiler reports, without using any or @ts-ignore.
// (Buggy version had: implicit any params, possibly-undefined access, wrong return type, string vs number.)
interface Product {
  id: number;
  title: string;
  price: number;
  discount?: number; // percent
}

function finalPrice(p: Product): number {
  const discount = p.discount ?? 0;
  return Math.round(p.price * (1 - discount / 100));
}

function findProduct(list: Product[], id: number): Product | undefined {
  return list.find((p) => p.id === id);
}

const catalogue: Product[] = [
  { id: 1, title: "Headphones", price: 2000, discount: 25 },
  { id: 2, title: "Cable", price: 300 },
];

const idFromUrl = "1"; // e.g. from req.params.id (always a string)
const product = findProduct(catalogue, Number(idFromUrl));
console.log(product ? \`\${product.title}: ₹\${finalPrice(product)}\` : "Not found"); // Headphones: ₹1500`,
    },
  ],
  quiz: [
    {
      question: 'What does `const n = ("42" as unknown) as number; console.log(n + 1)` print?',
      options: [
        '43',
        '421',
        'NaN',
        'A compile error',
      ],
      answer: 1,
      explanation: 'as does not convert at runtime; n is still the string "42", so + concatenates.',
    },
    {
      question: 'What is `keyof ({ a: 1; c: 3 } | { b: 2; c: 3 })`?',
      options: [
        '\'a\' | \'b\' | \'c\'',
        'never',
        '\'c\'',
        '\'a\' | \'b\'',
      ],
      answer: 2,
      explanation: 'keyof a union gives only the keys common to every member.',
    },
    {
      question: 'Which assignment compiles under strict mode?',
      options: [
        'let s: string = someUnknown',
        'const b: Point = { x: 1, y: 2, z: 3 }',
        'const m: number[] = readonlyNums',
        'const e: {} = 0',
      ],
      answer: 3,
      explanation: '{} accepts any non-null value, including 0. The others are errors.',
    },
    {
      question: 'What is the recommended first step when migrating a JS project?',
      options: [
        'Enable allowJs and add tsconfig, then convert files incrementally',
        'Rename every file to .ts in one PR',
        'Turn on strict and fix all errors at once',
        'Rewrite the project from scratch',
      ],
      answer: 0,
      explanation: 'Incremental migration keeps the app working while types are added.',
    },
    {
      question: 'Which directive is safer for temporarily suppressing a known type error?',
      options: [
        '// @ts-ignore',
        '// @ts-nocheck',
        '// eslint-disable',
        '// @ts-expect-error',
      ],
      answer: 3,
      explanation: '@ts-expect-error reports itself when the underlying error is gone.',
    },
  ],
};
