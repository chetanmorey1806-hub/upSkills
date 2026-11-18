export default {
  id: 'day-03-functions-parameters-return-types-overloads-void',
  title: 'Functions: Parameter and Return Types, Optional and Default Params, Overloads, void',
  module: 'Module 1: TypeScript Basics',
  day: 3,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Functions are where most bugs hide: wrong arguments, missing arguments and unexpected return values. Today you learn to type parameters and return values, use optional, default and rest parameters, describe function types for callbacks, write overloads and understand void and never as return types.',
  objectives: [
    'Annotate parameters and return types of function declarations and arrow functions',
    'Use optional (?), default and rest parameters correctly',
    'Describe callback and function shapes with function type aliases',
    'Write function overloads when the return type depends on the input',
    'Explain void vs undefined vs never as return types',
  ],
  theory: [
    {
      heading: 'Typing parameters and return values',
      content: `Every parameter should have a type: \`function add(a: number, b: number)\`. Without it, strict mode reports **"Parameter 'a' implicitly has an 'any' type"** (noImplicitAny).

The return type goes after the parameter list: \`function add(a: number, b: number): number\`. TypeScript can infer it, but writing it for exported functions is good practice because:
- it documents the contract
- a wrong \`return\` inside the function becomes an error at the function itself, not at the caller far away

Arrow functions use the same syntax: \`const add = (a: number, b: number): number => a + b;\`

TypeScript also checks the **number of arguments**. Calling \`add(1)\` or \`add(1, 2, 3)\` is an error, unlike JavaScript which silently fills in \`undefined\` or ignores extras.`,
      syntax: `function add(a: number, b: number): number {
  return a + b;
}
const multiply = (a: number, b: number): number => a * b;`,
    },
    {
      heading: 'Optional, default and rest parameters',
      content: `- **Optional** parameter: add \`?\` → \`function greet(name: string, title?: string)\`. Inside the function \`title\` is \`string | undefined\`, so you must check it before use.
- **Default** parameter: \`discount: number = 0\`. The parameter becomes optional for callers and inside the function it is always a \`number\`. Usually you can drop the annotation: \`discount = 0\` is inferred.
- **Rest** parameter: \`...values: number[]\` collects any number of arguments into a typed array.

Rule: optional parameters must come **after** required ones. If you need an optional value in the middle, use an options object instead: \`createUser({ name, role?, isActive? })\`, which is the standard pattern in real APIs.`,
      syntax: `function createUser(name: string, role: string = "student", age?: number) {}
function log(level: string, ...messages: string[]) {}`,
      tip: 'Do not mark a parameter optional AND give it a default (`x?: number = 5` is an error). A default already makes it optional.',
    },
    {
      heading: 'Function types and callbacks',
      content: `You can describe the **shape of a function** as a type: \`type Validator = (value: string) => boolean;\`. Any function with a compatible signature can be stored in a \`Validator\` variable, and its parameters are typed automatically (**contextual typing**).

This is how callbacks are typed: \`arr.map((x) => ...)\`, Express handlers \`(req, res) => ...\`, and React event handlers \`(e) => ...\` all get their parameter types from a function type defined elsewhere.

A function with **fewer** parameters can be assigned to a function type with more parameters (JavaScript ignores extra arguments). That is why \`[1, 2].forEach((n) => ...)\` works even though forEach passes three arguments.`,
      syntax: `type Handler = (event: string, payload?: unknown) => void;

// call signature inside an object type
type Formatter = {
  (value: number): string;
  currency: string;
};`,
    },
    {
      heading: 'void, undefined and never as return types',
      content: `- **void**: the function does not return a useful value (like \`console.log\`). Functions without a return statement are inferred as \`void\`.
- **undefined**: the function explicitly returns the value undefined; rarely written.
- **never**: the function never finishes normally: it always throws or runs forever.

Special rule: a **function type** with a \`void\` return (\`() => void\`) can be implemented by a function that returns something; the value is simply ignored. That is why \`forEach((n) => ids.push(n))\` is allowed even though \`push\` returns a number. But a function **declaration** written as \`function f(): void\` cannot return a value.`,
      points: [
        'void = "don\'t use my return value"',
        'never = "I never return"',
        'A function returning never helps narrowing: code after the call is unreachable',
      ],
    },
    {
      heading: 'Function overloads',
      content: `Sometimes one function accepts different kinds of input and the **return type depends on the input**. Overloads let you declare several call signatures followed by one implementation:

1. Write the overload signatures (no body). These are what callers see.
2. Write one implementation signature with a body. It must be compatible with every overload and is **not** callable directly.
3. TypeScript picks the first overload that matches the call, from top to bottom.

Use overloads only when a **union type** cannot express the relationship. If every input returns the same type, a union parameter (\`value: string | number\`) is simpler. Generics (Day 6) solve many of these cases more cleanly.`,
      syntax: `function parse(input: string): number;
function parse(input: string[]): number[];
function parse(input: string | string[]): number | number[] {
  return Array.isArray(input) ? input.map(Number) : Number(input);
}`,
      tip: 'Order overloads from most specific to most general, because TypeScript uses the first one that matches.',
    },
    {
      heading: 'Typing `this` and best practices',
      content: `In a regular function you can declare the type of \`this\` as a fake first parameter: \`function increment(this: Counter, by: number)\`. It is removed from the JavaScript output and the compiler checks that the function is called with the right \`this\`.

Best practices for functions in MERN projects:
- Annotate parameters always, and return types for exported/public functions
- Prefer an **options object** when a function has more than 3 parameters
- Prefer union types or generics over overloads when possible
- Return \`Promise<T>\` from async functions (Day 6 covers generics): \`async function getUser(id: string): Promise<User>\`
- Do not use the \`Function\` type; write the exact signature instead`,
    },
  ],
  examples: [
    {
      title: 'Typed parameters, optional/default params and rest params',
      scenario: 'A course fee calculator for an online academy with an optional coupon code.',
      steps: [
        'Create fees.ts',
        'Run with `npx tsx fees.ts` or the playground',
        'Try calling `calculateFee("5000")` and read the error',
      ],
      code: `// Parameter types, return types, optional and default parameters
function calculateFee(amount: number, discountPercent: number = 0, coupon?: string): number {
  let fee = amount - (amount * discountPercent) / 100;
  if (coupon) {
    // coupon is string | undefined, narrowed to string here
    fee -= coupon === "FIRST100" ? 100 : 0;
  }
  return Math.max(fee, 0);
}

console.log(calculateFee(5000));               // default discount 0, no coupon
console.log(calculateFee(5000, 10));           // 10% off
console.log(calculateFee(5000, 10, "FIRST100"));

// Arrow function with types
const toRupees = (paise: number): string => \`₹\${(paise / 100).toFixed(2)}\`;
console.log(toRupees(129950));

// Rest parameters are typed as arrays
function sumAll(...values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}
console.log(sumAll(10, 20, 30));`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Parameter types, return types, optional and default parameters
function calculateFee(amount, discountPercent = 0, coupon) {
    let fee = amount - (amount * discountPercent) / 100;
    if (coupon) {
        // coupon is string | undefined, narrowed to string here
        fee -= coupon === "FIRST100" ? 100 : 0;
    }
    return Math.max(fee, 0);
}
console.log(calculateFee(5000)); // default discount 0, no coupon
console.log(calculateFee(5000, 10)); // 10% off
console.log(calculateFee(5000, 10, "FIRST100"));
// Arrow function with types
const toRupees = (paise) => \`₹\${(paise / 100).toFixed(2)}\`;
console.log(toRupees(129950));
// Rest parameters are typed as arrays
function sumAll(...values) {
    return values.reduce((total, v) => total + v, 0);
}
console.log(sumAll(10, 20, 30));`,
      },
      result: `Console output:
5000
4500
4400
₹1299.50
60`,
      explanation: '`discountPercent` defaults to 0, so callers can skip it. `coupon?` is `string | undefined`; the `if (coupon)` check narrows it to string. `...values: number[]` collects all arguments into a typed array. The return type `number` guarantees every code path returns a number.',
    },
    {
      title: 'The compiler checks argument count and return type',
      scenario: 'Three common mistakes when calling a function.',
      steps: [
        'Create greet.ts',
        'Run `npx tsc --noEmit --strict greet.ts`',
        'Read the three errors',
      ],
      code: `function greet(name: string, title?: string): string {
  return title ? \`Hello, \${title} \${name}\` : \`Hello, \${name}\`;
}

greet("Asha", "Dr.", "extra");   // too many arguments
greet();                          // missing required argument
const len: number = greet("Ravi"); // wrong return type usage`,
      result: `This example intentionally does NOT compile. tsc reports:
error TS2554: Expected 1-2 arguments, but got 3.
error TS2554: Expected 1-2 arguments, but got 0.
error TS2322: Type 'string' is not assignable to type 'number'.`,
      explanation: 'JavaScript would silently ignore the extra argument, set `name` to undefined, and store a string in `len`. TypeScript rejects all three: too many arguments (TS2554), missing required argument (TS2554), and assigning a string return value to a number variable (TS2322).',
    },
    {
      title: 'Function types, callbacks and void',
      scenario: 'Reusable form validators for a signup form, passed around as callbacks.',
      steps: [
        'Create validators.ts',
        'Run it',
        'Hover `value` inside `isEmail`: it is a string thanks to the Validator type',
      ],
      code: `// Function types, callbacks and void
type Validator = (value: string) => boolean;

const isEmail: Validator = (value) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
const isStrongPassword: Validator = (value) => value.length >= 8 && /\\d/.test(value);

// void: the function does not return a useful value
function logResult(field: string, ok: boolean): void {
  console.log(\`\${field}: \${ok ? "valid" : "invalid"}\`);
}

// A higher-order function: takes a callback, returns a new function
function withLabel(label: string, check: Validator): (value: string) => void {
  return (value) => logResult(label, check(value));
}

const checkEmail = withLabel("email", isEmail);
const checkPassword = withLabel("password", isStrongPassword);

checkEmail("asha@example.com");
checkEmail("asha@");
checkPassword("secret");
checkPassword("secret123");

// A callback typed as returning void may still return a value - it is just ignored
const ids: number[] = [];
[1, 2, 3].forEach((n) => ids.push(n * 10)); // push returns a number, allowed
console.log(ids);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `const isEmail = (value) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
const isStrongPassword = (value) => value.length >= 8 && /\\d/.test(value);
// void: the function does not return a useful value
function logResult(field, ok) {
    console.log(\`\${field}: \${ok ? "valid" : "invalid"}\`);
}
// A higher-order function: takes a callback, returns a new function
function withLabel(label, check) {
    return (value) => logResult(label, check(value));
}
const checkEmail = withLabel("email", isEmail);
const checkPassword = withLabel("password", isStrongPassword);
checkEmail("asha@example.com");
checkEmail("asha@");
checkPassword("secret");
checkPassword("secret123");
// A callback typed as returning void may still return a value - it is just ignored
const ids = [];
[1, 2, 3].forEach((n) => ids.push(n * 10)); // push returns a number, allowed
console.log(ids);`,
      },
      result: `Console output:
email: valid
email: invalid
password: invalid
password: valid
[ 10, 20, 30 ]`,
      explanation: '`type Validator` describes the function shape once. Arrow functions assigned to it do not need parameter annotations (contextual typing). `withLabel` is a higher-order function: it takes a callback and returns a new function typed `(value: string) => void`. The forEach line shows that a callback typed as returning void may still return a value.',
    },
    {
      title: 'Function overloads',
      scenario: 'A date formatter that accepts a Date, a timestamp or day/month/year, and a parser whose return type depends on the input.',
      steps: [
        'Create overloads.ts',
        'Run it',
        'Hover `one` and `many`: number and number[]',
        'Try `formatDate(1, 2)`: no overload takes 2 arguments, so it is an error',
      ],
      code: `// Function overloads: different input -> different output type
function formatDate(date: Date): string;
function formatDate(timestamp: number): string;
function formatDate(day: number, month: number, year: number): string;
// Implementation signature (not visible to callers)
function formatDate(a: Date | number, month?: number, year?: number): string {
  let d: Date;
  if (a instanceof Date) {
    d = a;
  } else if (month !== undefined && year !== undefined) {
    d = new Date(Date.UTC(year, month - 1, a));
  } else {
    d = new Date(a);
  }
  return d.toISOString().slice(0, 10);
}

console.log(formatDate(new Date(Date.UTC(2025, 0, 26))));
console.log(formatDate(0));
console.log(formatDate(15, 8, 2025));

// Overloads that change the RETURN type based on input
function parse(input: string): number;
function parse(input: string[]): number[];
function parse(input: string | string[]): number | number[] {
  return Array.isArray(input) ? input.map(Number) : Number(input);
}

const one = parse("42");          // type: number
const many = parse(["1", "2"]);   // type: number[]
console.log(one + 1, many.length);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Implementation signature (not visible to callers)
function formatDate(a, month, year) {
    let d;
    if (a instanceof Date) {
        d = a;
    }
    else if (month !== undefined && year !== undefined) {
        d = new Date(Date.UTC(year, month - 1, a));
    }
    else {
        d = new Date(a);
    }
    return d.toISOString().slice(0, 10);
}
console.log(formatDate(new Date(Date.UTC(2025, 0, 26))));
console.log(formatDate(0));
console.log(formatDate(15, 8, 2025));
function parse(input) {
    return Array.isArray(input) ? input.map(Number) : Number(input);
}
const one = parse("42"); // type: number
const many = parse(["1", "2"]); // type: number[]
console.log(one + 1, many.length);`,
      },
      result: `Console output:
2025-01-26
1970-01-01
2025-08-15
43 2`,
      explanation: 'Callers only see the overload signatures, so `formatDate(1, 2)` is rejected even though the implementation has optional parameters. For `parse`, overloads give an exact return type per input: a union return type (`number | number[]`) would force every caller to narrow the result.',
    },
    {
      title: 'never return type and typing this',
      scenario: 'Read a PORT from configuration and fail fast if it is invalid; then call a function with an explicit `this`.',
      steps: [
        'Create config.ts',
        'Run it',
        'In the playground JS notice that the `this: Counter` parameter has disappeared',
      ],
      code: `// never as a return type, and typing \`this\`
function fail(message: string): never {
  throw new Error(message);
}

function getPort(raw: string | undefined): number {
  const port = Number(raw);
  if (!raw || Number.isNaN(port)) {
    fail("PORT must be a number");   // TS knows code after this is unreachable
  }
  return port;
}

console.log(getPort("5000"));
try {
  getPort("abc");
} catch (e) {
  if (e instanceof Error) console.log("Error:", e.message);
}

// Declaring the type of \`this\` (a fake first parameter, removed in JS)
interface Counter {
  count: number;
}
function increment(this: Counter, by: number): number {
  this.count += by;
  return this.count;
}
const counter: Counter = { count: 0 };
console.log(increment.call(counter, 5));`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// never as a return type, and typing \`this\`
function fail(message) {
    throw new Error(message);
}
function getPort(raw) {
    const port = Number(raw);
    if (!raw || Number.isNaN(port)) {
        fail("PORT must be a number"); // TS knows code after this is unreachable
    }
    return port;
}
console.log(getPort("5000"));
try {
    getPort("abc");
}
catch (e) {
    if (e instanceof Error)
        console.log("Error:", e.message);
}
function increment(by) {
    this.count += by;
    return this.count;
}
const counter = { count: 0 };
console.log(increment.call(counter, 5));`,
      },
      result: `Console output:
5000
Error: PORT must be a number
5`,
      explanation: 'Because `fail` returns `never`, TypeScript knows execution stops there, so after the `if` block `raw` is treated as valid. The `this: Counter` parameter is only for type checking; the compiled JavaScript function has just one parameter, `by`.',
    },
  ],
  interview: [
    {
      q: 'How do you type a function\'s parameters and return value?',
      a: 'Annotate each parameter after its name and the return type after the parameter list: `function add(a: number, b: number): number { return a + b; }`. For arrows: `const add = (a: number, b: number): number => a + b;`',
      level: 'Easy',
    },
    {
      q: 'Difference between an optional parameter and a default parameter?',
      a: '`title?: string` makes the parameter optional and its type inside the function is `string | undefined`. `title = \'Mr\'` also makes it optional for callers, but inside the function it always has a value, so its type is `string`. Optional parameters must come after required ones.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between void and never?',
      a: 'void means the function returns no useful value (it finishes normally, returning undefined). never means the function never finishes normally: it always throws or loops forever. never is also used for impossible cases in exhaustive checks.',
      level: 'Easy',
    },
    {
      q: 'How do you type a callback parameter?',
      a: 'Use a function type: `function fetchData(onDone: (data: string) => void) {}` or define an alias `type Callback = (err: Error | null, data?: string) => void`. Arrow functions passed in get their parameter types from it (contextual typing).',
      level: 'Easy',
    },
    {
      q: 'What are function overloads? When should you use them?',
      a: 'Multiple call signatures for one function followed by a single implementation. Use them when the return type depends on the argument types (e.g. string → number, string[] → number[]) or when there are a few distinct calling patterns. If a union parameter or a generic expresses the relationship, prefer that.',
      level: 'Medium',
    },
    {
      q: 'Can you call the implementation signature of an overloaded function directly?',
      a: 'No. The implementation signature is hidden from callers; only the overload signatures are visible. A call must match one of the overloads.',
      level: 'Medium',
    },
    {
      q: 'Why can a function returning a number be assigned to a type `() => void`?',
      a: 'For function types, void return means the caller will ignore the return value, so any return value is allowed. This makes callbacks like `arr.forEach(x => list.push(x))` work. It does not apply to function declarations annotated with `: void`, which must not return a value.',
      level: 'Hard',
    },
    {
      q: 'Why should you avoid the `Function` type?',
      a: '`Function` accepts any function and calling it returns any, so you lose parameter and return type checking. Write the exact signature instead, e.g. `(id: string) => Promise<User>`.',
      level: 'Medium',
    },
    {
      q: 'How do you type rest parameters?',
      a: 'As an array (or tuple) type: `function sum(...nums: number[]): number`. Tuple rest types are also possible: `(...args: [string, number])`.',
      level: 'Easy',
    },
    {
      q: 'What is the `this` parameter in TypeScript?',
      a: 'A fake first parameter that declares what `this` must be inside a regular function: `function f(this: HTMLButtonElement, e: Event)`. It is erased in the JS output and the compiler checks call sites. With noImplicitThis (part of strict), using `this` with an implicit any type is an error.',
      level: 'Hard',
    },
    {
      q: 'Should you always write return types?',
      a: 'Not always. Inference is reliable for small internal functions. Writing explicit return types on exported functions, library APIs and complex functions is recommended: it documents the contract, catches mistakes inside the function, and can speed up type checking in large projects.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write `buildUrl(base, path, query?, secure = true)` that returns a full URL string. query is an optional object of string keys and values that becomes a query string.',
      hint: 'Use `Record<string, string>` for the query and URLSearchParams to build it.',
      solution: `function buildUrl(base: string, path: string, query?: Record<string, string>, secure: boolean = true): string {
  const protocol = secure ? "https" : "http";
  const qs = query ? "?" + new URLSearchParams(query).toString() : "";
  return \`\${protocol}://\${base}/\${path}\${qs}\`;
}

console.log(buildUrl("api.upskillr.in", "courses"));
console.log(buildUrl("api.upskillr.in", "courses", { level: "beginner", page: "2" }));
console.log(buildUrl("localhost:5000", "health", undefined, false));`,
    },
    {
      task: 'Create a function type `MathOp` for (a: number, b: number) => number, two implementations add and multiply, and a function `applyAll(values, start, op)` that reduces an array with the given operation.',
      hint: 'The arrow functions assigned to MathOp need no parameter annotations.',
      solution: `type MathOp = (a: number, b: number) => number;

const add: MathOp = (a, b) => a + b;
const multiply: MathOp = (a, b) => a * b;

function applyAll(values: number[], start: number, op: MathOp): number {
  return values.reduce((acc, v) => op(acc, v), start);
}

console.log(applyAll([1, 2, 3, 4], 0, add));      // 10
console.log(applyAll([1, 2, 3, 4], 1, multiply)); // 24`,
    },
    {
      task: 'Write overloads for `toArray`: given a string it returns string[] (its characters); given a number it returns number[] (an array with that number). Also write `getLength` for strings and arrays.',
      hint: 'Write two overload signatures and one implementation with a union parameter.',
      solution: `function getLength(value: string): number;
function getLength(value: unknown[]): number;
function getLength(value: string | unknown[]): number {
  return value.length;
}

function toArray(value: string): string[];
function toArray(value: number): number[];
function toArray(value: string | number): string[] | number[] {
  return typeof value === "string" ? value.split("") : [value];
}

console.log(getLength("hello"), getLength([1, 2, 3])); // 5 3
const chars = toArray("abc"); // string[]
const nums = toArray(7);      // number[]
console.log(chars, nums);`,
    },
    {
      task: 'Define a `Logger` function type with a message and an optional level (\'info\' | \'warn\' | \'error\') that returns void. Implement it and use it inside `processPayment(amount, logger)`.',
      hint: 'Use a default value `level = "info"` in the implementation.',
      solution: `type Logger = (message: string, level?: "info" | "warn" | "error") => void;

const log: Logger = (message, level = "info") => {
  const prefix = level.toUpperCase().padEnd(5);
  console.log(\`[\${prefix}] \${message}\`);
};

function processPayment(amount: number, logger: Logger): boolean {
  if (amount <= 0) {
    logger("Invalid amount: " + amount, "error");
    return false;
  }
  logger("Charged ₹" + amount);
  return true;
}

processPayment(499, log);
processPayment(0, log);`,
    },
  ],
  quiz: [
    {
      question: 'What is the type of `title` inside `function greet(title?: string)`?',
      options: [
        'string',
        'string | null',
        'string | undefined',
        'any',
      ],
      answer: 2,
      explanation: 'Optional parameters can be missing, so their type includes undefined.',
    },
    {
      question: 'Which return type fits a function that always throws?',
      options: [
        'never',
        'void',
        'undefined',
        'null',
      ],
      answer: 0,
      explanation: 'never means the function never returns normally.',
    },
    {
      question: 'In an overloaded function, which signature can callers use?',
      options: [
        'Only the implementation signature',
        'Any signature, including the implementation',
        'Only the overload signatures',
        'Only the last overload',
      ],
      answer: 2,
      explanation: 'The implementation signature is hidden; callers must match an overload.',
    },
    {
      question: 'Which is a valid function type alias?',
      options: [
        'type F = function(a: number): string',
        'type F = (a: number) => string',
        'type F = (a: number): string',
        'type F = Function<number, string>',
      ],
      answer: 1,
      explanation: 'Function types use arrow syntax: (params) => returnType.',
    },
    {
      question: 'What does TypeScript report for `add(1, 2, 3)` when add takes two parameters?',
      options: [
        'Nothing, extra args are ignored',
        'A runtime error',
        'A warning only',
        'A compile error: Expected 2 arguments, but got 3',
      ],
      answer: 3,
      explanation: 'TypeScript checks the argument count (error TS2554).',
    },
  ],
};
