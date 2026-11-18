export default {
  id: 'day-02-basic-types-inference-any-unknown-never-tuples-enums',
  title: 'Basic Types, Type Inference, any vs unknown vs never, Arrays, Tuples, Enums vs Union Literals',
  module: 'Module 1: TypeScript Basics',
  day: 2,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Types are labels that tell TypeScript what kind of value a variable can hold. Today you learn the primitive types, how TypeScript infers types for you, the three special types any, unknown and never, and how to type arrays, tuples and fixed sets of values with enums or union literals.',
  objectives: [
    'Use the primitive types string, number, boolean, null, undefined, bigint and symbol',
    'Know when to rely on type inference and when to write annotations',
    'Explain the difference between any, unknown and never with examples',
    'Type arrays, readonly arrays and tuples',
    'Choose between enums and union literal types',
  ],
  theory: [
    {
      heading: 'Type annotations and primitive types',
      content: `A **type annotation** is written after a colon: \`let age: number = 21;\`. It is a promise: this variable will only ever hold numbers.

The primitive types match JavaScript's primitives:
- \`string\` – text: \`"Asha"\`, \`'Pune'\`, template literals
- \`number\` – all numbers, integers and decimals (there is no separate int/float)
- \`boolean\` – \`true\` / \`false\`
- \`null\` and \`undefined\` – "no value"; with \`strict\` they are separate types and are NOT allowed in a \`string\` variable
- \`bigint\` – very large integers, written with \`n\`: \`10n\`
- \`symbol\` – unique identifiers

Use the **lowercase** names. \`String\`, \`Number\` and \`Boolean\` (capital letter) are wrapper object types and should not be used as annotations.`,
      syntax: `let name: string = "Ravi";
let salary: number = 650000.5;
let isActive: boolean = true;
let middleName: string | null = null;`,
      tip: 'Common mistake: `let price: Number`. Always use lowercase `number`, `string`, `boolean`.',
    },
    {
      heading: 'Type inference: let TypeScript do the work',
      content: `You do not need to annotate everything. When you initialise a variable, TypeScript **infers** its type from the value: \`let city = "Pune"\` is a \`string\`.

- \`let\` variables are inferred with the **wider** type: \`let x = "hi"\` → \`string\`
- \`const\` variables get a **literal type**: \`const y = "hi"\` → \`"hi"\` (it can never change)
- Function return types are inferred from the \`return\` statements
- Array methods like \`map\` and \`filter\` keep the element type

**Rule of thumb used in real teams:** let inference handle local variables; annotate function parameters, exported functions and public APIs, and variables declared without a value (\`let total: number;\`).`,
      tip: 'Hover over any variable in VS Code to see what type TypeScript inferred. This is the fastest way to learn TS.',
    },
    {
      heading: 'any vs unknown vs never',
      content: `These three special types are a favourite interview topic.

**any** – "turn off type checking". You can do anything with an \`any\` value and TS will not complain, so bugs slip through. It spreads: anything you read from an \`any\` is also \`any\`. Avoid it; use it only as a temporary step when migrating JS.

**unknown** – "I don't know the type yet". It is the **type-safe any**. You can assign anything to \`unknown\`, but you cannot use it (call methods, read properties) until you **narrow** it with checks like \`typeof\`, \`instanceof\` or \`in\`. Use it for \`JSON.parse\` results, API data and \`catch (err)\` variables.

**never** – "this value can never exist". It is the return type of a function that always throws or loops forever, and the type left over after you have handled every case of a union. It powers **exhaustive checks** in switch statements.

Analogy: \`any\` is a parcel you open without checking (could be a bomb), \`unknown\` is a parcel you must scan first, \`never\` is a parcel that can never be delivered.`,
      points: [
        'any: everything allowed, no safety',
        'unknown: anything can go in, nothing comes out without narrowing',
        'never: nothing can go in; used for impossible cases and exhaustiveness',
        'void (Day 3): a function that returns nothing useful',
      ],
      tip: 'With `strict` (useUnknownInCatchVariables), the error in `catch (err)` is `unknown`. Narrow it with `if (err instanceof Error)` before reading `err.message`.',
    },
    {
      heading: 'Arrays and readonly arrays',
      content: `Two equivalent ways to write an array type: \`number[]\` and \`Array<number>\`. Most code uses \`number[]\`.

- Mixed arrays use a union: \`(string | number)[]\`
- Arrays of objects: \`{ name: string; marks: number }[]\` (or better, a named type, Day 4)
- \`readonly string[]\` (or \`ReadonlyArray<string>\`) removes mutating methods like \`push\`, \`pop\` and \`splice\`. Great for function parameters that must not be changed.

An empty array with no annotation, \`const list = []\`, is inferred as \`any[]\` that evolves as you push items. Annotate empty arrays: \`const list: string[] = [];\`.`,
      syntax: `const ids: number[] = [1, 2, 3];
const names: Array<string> = ["Asha", "Ravi"];
const mixed: (string | number)[] = ["A", 1];
function total(prices: readonly number[]) { /* cannot push here */ }`,
    },
    {
      heading: 'Tuples',
      content: `A **tuple** is an array with a **fixed length** and a **known type at each position**: \`[number, number]\` for a latitude/longitude pair, or \`[string, number]\` for a name and marks.

- Labelled tuples improve readability: \`[name: string, age: number]\`
- Optional elements: \`[string, number?]\`
- React's \`useState\` returns a tuple: \`[value, setValue]\`
- \`readonly [number, number]\` makes it immutable

Without the annotation, \`const p = [1, 2]\` is inferred as \`number[]\`, not a tuple. Write the tuple type or use \`as const\`.`,
      syntax: `let point: [number, number] = [18.52, 73.85];
let user: [id: number, name: string] = [1, "Asha"];
const [lat, lng] = point; // destructuring keeps the types`,
    },
    {
      heading: 'Enums vs union literal types',
      content: `Both describe a fixed set of allowed values, like order status or user role.

**Enum**: \`enum Role { Admin = "ADMIN", User = "USER" }\`. An enum is one of the few TS features that creates **real JavaScript code** (an object). Numeric enums (\`enum Dir { Up, Down }\` → 0, 1) also create a reverse mapping. String enums are safer and easier to debug.

**Union literal type**: \`type Role = "ADMIN" | "USER";\`. Exists only at compile time, produces **zero** JavaScript, works directly with JSON from an API (no conversion needed) and gives perfect autocomplete.

**Which to choose?** Most modern React/Node codebases prefer union literals (simpler, no runtime code, matches JSON). If you also need the list of values at runtime (for a dropdown), use an \`as const\` array and derive the type: \`const ROLES = ["ADMIN", "USER"] as const; type Role = typeof ROLES[number];\`. Enums are still common in older Angular/NestJS code, so be able to read them.

Avoid \`const enum\` in apps built with Vite/esbuild/tsx: those tools compile one file at a time and cannot inline const enums from other files.`,
      tip: 'Numeric enums accept any number in some older TS versions and are confusing; if you use enums, prefer string enums.',
    },
  ],
  examples: [
    {
      title: 'Primitive types and type inference',
      scenario: 'A student profile with explicit annotations and inferred types side by side.',
      steps: [
        'Create types.ts',
        'Hover over `city`, `course` and `marks` in VS Code to see the inferred types',
        'Run with `npx tsx types.ts` or use the playground',
      ],
      code: `// Primitive types with explicit annotations
let studentName: string = "Asha";
let age: number = 21;          // integers and decimals are both \`number\`
let isPlaced: boolean = false;
let nothing: null = null;
let notSet: undefined = undefined;
let bigId: bigint = 9007199254740993n;

// Type inference: no annotation needed, TS works it out
let city = "Pune";             // inferred: string
const course = "MERN";         // inferred: "MERN" (literal type, const never changes)
let marks = [78, 91, 66];      // inferred: number[]

// city = 42;  // Error: Type 'number' is not assignable to type 'string'.

const average = marks.reduce((a, b) => a + b, 0) / marks.length; // number
console.log(studentName, age, isPlaced, nothing, notSet, bigId);
console.log(city, course, marks, "avg:", average.toFixed(1));
console.log(typeof bigId, typeof average);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Primitive types with explicit annotations
let studentName = "Asha";
let age = 21; // integers and decimals are both \`number\`
let isPlaced = false;
let nothing = null;
let notSet = undefined;
let bigId = 9007199254740993n;
// Type inference: no annotation needed, TS works it out
let city = "Pune"; // inferred: string
const course = "MERN"; // inferred: "MERN" (literal type, const never changes)
let marks = [78, 91, 66]; // inferred: number[]
// city = 42;  // Error: Type 'number' is not assignable to type 'string'.
const average = marks.reduce((a, b) => a + b, 0) / marks.length; // number
console.log(studentName, age, isPlaced, nothing, notSet, bigId);
console.log(city, course, marks, "avg:", average.toFixed(1));
console.log(typeof bigId, typeof average);`,
      },
      result: `Console output:
Asha 21 false null undefined 9007199254740993n
Pune MERN [ 78, 91, 66 ] avg: 78.3
bigint number`,
      explanation: 'Annotated variables (`age: number`) and inferred ones (`let city = "Pune"` → string) are equally type-safe. `const course` gets the literal type `"MERN"` because a const can never be reassigned. `bigint` values need the `n` suffix and are a different type from `number`.',
    },
    {
      title: 'any hides bugs, unknown forces you to check',
      scenario: 'Compare how the compiler treats `any` and `unknown` for the same value.',
      steps: [
        'Create unknown-vs-any.ts',
        'Run `npx tsc --noEmit --strict unknown-vs-any.ts`',
        'Notice only the unknown line is reported',
      ],
      code: `// any switches the checker OFF; unknown keeps it ON
let a: any = "hello";
a.toFixed(2);          // no error at compile time... crashes at runtime!

let u: unknown = "hello";
u.toUpperCase();       // compile error: must narrow first`,
      result: `This example intentionally does NOT compile. tsc reports only ONE error, for the unknown line:
error TS18046: 'u' is of type 'unknown'.

The \`a.toFixed(2)\` line passes the compiler but would crash at runtime with: TypeError: a.toFixed is not a function.`,
      explanation: 'With `any`, TypeScript trusts you blindly, so calling a number method on a string compiles fine and crashes later. With `unknown`, you must first prove what the value is (for example `if (typeof u === "string") u.toUpperCase();`). That is why `unknown` is called the type-safe version of any.',
    },
    {
      title: 'Narrowing unknown data from JSON.parse',
      scenario: 'An API sends JSON. You must read `age` safely because the payload might be wrong.',
      steps: [
        'Create parse-age.ts',
        'Run it',
        'Change the JSON to a wrong shape and see the error branch',
      ],
      code: `// Safe JSON parsing: JSON.parse returns any, so we store it as unknown
function parseAge(json: string): number {
  const data: unknown = JSON.parse(json);

  // Narrow step by step before using it
  if (
    typeof data === "object" &&
    data !== null &&
    "age" in data &&
    typeof data.age === "number"
  ) {
    return data.age; // here TS knows data.age is a number
  }
  throw new Error("Invalid payload: age missing or not a number");
}

console.log(parseAge('{"name":"Ravi","age":24}'));

try {
  parseAge('{"name":"Ravi","age":"24"}');
} catch (err) {
  // In strict mode \`err\` is unknown, so we narrow it too
  if (err instanceof Error) console.log("Caught:", err.message);
}`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Safe JSON parsing: JSON.parse returns any, so we store it as unknown
function parseAge(json) {
    const data = JSON.parse(json);
    // Narrow step by step before using it
    if (typeof data === "object" &&
        data !== null &&
        "age" in data &&
        typeof data.age === "number") {
        return data.age; // here TS knows data.age is a number
    }
    throw new Error("Invalid payload: age missing or not a number");
}
console.log(parseAge('{"name":"Ravi","age":24}'));
try {
    parseAge('{"name":"Ravi","age":"24"}');
}
catch (err) {
    // In strict mode \`err\` is unknown, so we narrow it too
    if (err instanceof Error)
        console.log("Caught:", err.message);
}`,
      },
      result: `Console output:
24
Caught: Invalid payload: age missing or not a number`,
      explanation: '`JSON.parse` returns `any`; storing it as `unknown` forces narrowing. Each check (`typeof data === "object"`, `data !== null`, `"age" in data`, `typeof data.age === "number"`) narrows the type further, so `return data.age` is a proven `number`. In the catch block `err` is `unknown`, so `instanceof Error` is required before reading `.message`.',
    },
    {
      title: 'never and exhaustive switch checks',
      scenario: 'A new order status "cancelled" was added to the type. The compiler must tell us every switch that forgot to handle it.',
      steps: [
        'Create status.ts',
        'Run `npx tsc --noEmit --strict status.ts`',
        'Add `case "cancelled": return "Cancelled";` and the error disappears',
      ],
      code: `// never = "this can never happen". Used for exhaustive checks.
type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

function assertNever(value: never): never {
  throw new Error("Unhandled value: " + value);
}

function statusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "Waiting for dispatch";
    case "shipped":
      return "On the way";
    case "delivered":
      return "Delivered";
    // "cancelled" was added to the type but we forgot to handle it!
    default:
      return assertNever(status);
  }
}`,
      result: `This example intentionally does NOT compile. tsc reports:
error TS2345: Argument of type 'string' is not assignable to parameter of type 'never'.

After adding the missing case the file compiles with no errors.`,
      explanation: 'In the `default` branch TypeScript has removed every handled member of the union. If all cases are handled, `status` is `never` and `assertNever(status)` is fine. Because "cancelled" is not handled, `status` still has a leftover value (tsc widens it to `string` in the message), which is not assignable to `never`, so you get a compile error pointing to the exact switch you must update.',
    },
    {
      title: 'Arrays, tuples, enums and union literals together',
      scenario: 'Model a student\'s skills, location and role, and compare an enum with a union literal type.',
      steps: [
        'Create collections.ts',
        'Run it',
        'Look at the playground JS: the enum became a real object, the union type disappeared',
      ],
      code: `// Arrays, readonly arrays, tuples, enums and union literals
const skills: string[] = ["HTML", "CSS"];
const scores: Array<number> = [80, 95];        // same as number[]
skills.push("React");

const weekdays: readonly string[] = ["Mon", "Tue"];
// weekdays.push("Wed"); // Error: Property 'push' does not exist on type 'readonly string[]'.

// Tuple: fixed length, fixed type per position
const point: [number, number] = [18.52, 73.85];  // [lat, lng] of Pune
const entry: [name: string, marks: number] = ["Asha", 91]; // labelled tuple
const [studentName, studentMarks] = entry;

// Enum: creates a real JavaScript object at runtime
enum Role {
  Student = "STUDENT",
  Mentor = "MENTOR",
  Admin = "ADMIN",
}

// Union of string literals: types only, zero runtime code
type Level = "beginner" | "intermediate" | "advanced";

function describe(role: Role, level: Level): string {
  return \`\${role} at \${level} level\`;
}

console.log(skills, scores, weekdays, point);
console.log(studentName, studentMarks);
console.log(describe(Role.Mentor, "advanced"));
console.log("Enum object at runtime:", Role);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Arrays, readonly arrays, tuples, enums and union literals
const skills = ["HTML", "CSS"];
const scores = [80, 95]; // same as number[]
skills.push("React");
const weekdays = ["Mon", "Tue"];
// weekdays.push("Wed"); // Error: Property 'push' does not exist on type 'readonly string[]'.
// Tuple: fixed length, fixed type per position
const point = [18.52, 73.85]; // [lat, lng] of Pune
const entry = ["Asha", 91]; // labelled tuple
const [studentName, studentMarks] = entry;
// Enum: creates a real JavaScript object at runtime
var Role;
(function (Role) {
    Role["Student"] = "STUDENT";
    Role["Mentor"] = "MENTOR";
    Role["Admin"] = "ADMIN";
})(Role || (Role = {}));
function describe(role, level) {
    return \`\${role} at \${level} level\`;
}
console.log(skills, scores, weekdays, point);
console.log(studentName, studentMarks);
console.log(describe(Role.Mentor, "advanced"));
console.log("Enum object at runtime:", Role);`,
      },
      result: `Console output:
[ 'HTML', 'CSS', 'React' ] [ 80, 95 ] [ 'Mon', 'Tue' ] [ 18.52, 73.85 ]
Asha 91
MENTOR at advanced level
Enum object at runtime: { Student: 'STUDENT', Mentor: 'MENTOR', Admin: 'ADMIN' }`,
      explanation: '`readonly string[]` blocks `push`. Tuples fix both the length and the type of each position, and destructuring keeps those types (`studentName` is string, `studentMarks` is number). The `Role` enum is compiled into a JavaScript object (you can see it printed), while `type Level` produces no JavaScript at all.',
    },
  ],
  interview: [
    {
      q: 'What are the primitive types in TypeScript?',
      a: 'string, number, boolean, null, undefined, bigint and symbol (matching JavaScript\'s primitives). TypeScript also adds special types: any, unknown, never, void and object.',
      level: 'Easy',
    },
    {
      q: 'What is type inference?',
      a: 'TypeScript automatically determines a type from the value or expression when you do not write an annotation. `let n = 5` is number, a function\'s return type is inferred from its return statements, and `[1, 2].map(x => x * 2)` is number[].',
      level: 'Easy',
    },
    {
      q: 'What is the difference between any and unknown?',
      a: 'Both accept any value. `any` disables type checking: you can call any method on it and errors appear only at runtime. `unknown` is type-safe: you must narrow it (typeof, instanceof, in, a type guard) before you can use it. Prefer unknown for data whose type you do not know yet (JSON, API responses, catch errors).',
      level: 'Easy',
    },
    {
      q: 'What is the never type and where is it used?',
      a: 'never represents values that can never occur. It is the return type of functions that always throw or never finish, it is what is left of a union after all members are handled (used for exhaustive checks with an assertNever helper), and it appears in conditional types to remove members (e.g. Exclude). never is assignable to every type, but nothing (except never) is assignable to never.',
      level: 'Medium',
    },
    {
      q: 'Difference between `let x = \'hi\'` and `const x = \'hi\'` in terms of type?',
      a: 'let infers the widened type string because the value can change. const infers the literal type \'hi\' because it can never be reassigned. This is called literal widening.',
      level: 'Medium',
    },
    {
      q: 'What is a tuple and how is it different from an array?',
      a: 'A tuple has a fixed number of elements and a known type at each index, e.g. [string, number]. A normal array (number[]) can have any length and every element has the same type. React\'s useState returns a tuple [state, setState].',
      level: 'Easy',
    },
    {
      q: 'Enum vs union literal type: which would you use and why?',
      a: 'Union literals (type Status = \'active\' | \'blocked\') have zero runtime cost, work directly with JSON strings, and are simple. Enums generate a runtime object, which is useful if you need to iterate values, but they add code and have quirks (numeric enums, const enum issues with isolated module compilers). Most modern codebases prefer union literals, optionally derived from an `as const` array when runtime values are needed.',
      level: 'Medium',
    },
    {
      q: 'What is a reverse mapping in enums?',
      a: 'Numeric enums generate a two-way object: enum Dir { Up, Down } compiles so that Dir.Up === 0 and Dir[0] === \'Up\'. String enums do not have reverse mappings.',
      level: 'Medium',
    },
    {
      q: 'Why is `catch (err)` typed as unknown in strict mode?',
      a: 'Because JavaScript can throw anything, not just Error objects (`throw \'oops\'`, `throw 42`). The useUnknownInCatchVariables option (part of strict) types err as unknown so you must check `err instanceof Error` before reading err.message.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between `readonly number[]` and `const arr = [1, 2]`?',
      a: 'const only prevents reassigning the variable; you can still push or modify elements. readonly number[] is a type that removes mutating methods (push, pop, splice) and index assignment at compile time, so the array contents cannot be changed through that reference.',
      level: 'Hard',
    },
    {
      q: 'What type does `const list = []` get and why is that a problem?',
      a: 'Without noImplicitAny it is any[]. With strict, TypeScript uses an \'evolving\' array type that changes as you push values, but if you use it before pushing (or export it) it can be reported as implicitly any[]. Annotate empty arrays explicitly: `const list: string[] = []`.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Declare typed variables for a product: name (string), price (number), inStock (boolean), tags (string array) and dimensions as a tuple [length, width, height]. Print a summary and the volume.',
      hint: 'Tuple type: [number, number, number].',
      solution: `const productName: string = "Wireless Mouse";
const price: number = 799;
const inStock: boolean = true;
const tags: string[] = ["electronics", "accessories"];
const dimensions: [number, number, number] = [10, 6, 4]; // [length, width, height] in cm

console.log(\`\${productName} costs ₹\${price}\`);
console.log("In stock:", inStock, "Tags:", tags.join(", "));
console.log("Volume:", dimensions[0] * dimensions[1] * dimensions[2], "cm³");`,
    },
    {
      task: 'Write `toNumber(value: unknown): number` that accepts numbers, numeric strings and booleans (true → 1, false → 0) and throws an Error for anything else. No `any` allowed.',
      hint: 'Use typeof checks to narrow unknown.',
      solution: `function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  if (typeof value === "boolean") return value ? 1 : 0;
  throw new Error("Cannot convert to number");
}

console.log(toNumber(5), toNumber("42"), toNumber(true)); // 5 42 1`,
    },
    {
      task: 'Create a union type PaymentMethod = \'upi\' | \'card\' | \'cod\' and a function paymentFee(method, amount) using a switch with an exhaustive `assertNever` default. UPI is free, card is 2%, COD is ₹40.',
      hint: 'assertNever(x: never): never throws an error.',
      solution: `type PaymentMethod = "upi" | "card" | "cod";

function assertNever(x: never): never {
  throw new Error("Unexpected: " + x);
}

function paymentFee(method: PaymentMethod, amount: number): number {
  switch (method) {
    case "upi":
      return 0;
    case "card":
      return amount * 0.02;
    case "cod":
      return 40;
    default:
      return assertNever(method);
  }
}

console.log(paymentFee("upi", 1000), paymentFee("card", 1000), paymentFee("cod", 1000)); // 0 20 40`,
    },
    {
      task: 'Write a function `useCounter(start)` that returns a tuple: the start value and an increment function `(by: number) => number`, similar to how React\'s useState returns a tuple.',
      hint: 'Return type: [number, (by: number) => number].',
      solution: `// A function that returns a tuple, like React's useState
function useCounter(start: number): [number, (by: number) => number] {
  let value = start;
  const increment = (by: number): number => {
    value += by;
    return value;
  };
  return [value, increment];
}

const [initial, inc] = useCounter(10);
console.log(initial); // 10
console.log(inc(5));  // 15
console.log(inc(1));  // 16`,
    },
    {
      task: 'Model T-shirt sizes S, M, L twice: once as a string enum and once as a union type derived from an `as const` array. Write a price function for each (L = 499, others = 399).',
      hint: 'type SizeCode = (typeof SIZES)[number];',
      solution: `// 1) enum version
enum Size {
  Small = "S",
  Medium = "M",
  Large = "L",
}
function priceForEnum(size: Size): number {
  return size === Size.Large ? 499 : 399;
}

// 2) union literal version (preferred in most modern codebases)
const SIZES = ["S", "M", "L"] as const;
type SizeCode = (typeof SIZES)[number]; // "S" | "M" | "L"
function priceFor(size: SizeCode): number {
  return size === "L" ? 499 : 399;
}

console.log(priceForEnum(Size.Large), priceFor("M"), SIZES);`,
    },
  ],
  quiz: [
    {
      question: 'Which type must be narrowed before you can call a method on it?',
      options: [
        'any',
        'unknown',
        'string',
        'never',
      ],
      answer: 1,
      explanation: 'unknown accepts any value but requires narrowing before use.',
    },
    {
      question: 'What is the inferred type of `const level = "admin"`?',
      options: [
        'string',
        'any',
        'String',
        '"admin"',
      ],
      answer: 3,
      explanation: 'const declarations get a literal type because they can never change.',
    },
    {
      question: 'Which of these produces JavaScript code at runtime?',
      options: [
        'type Role = \'A\' | \'B\'',
        'interface User { id: number }',
        'enum Role { A = \'A\', B = \'B\' }',
        'let x: number',
      ],
      answer: 2,
      explanation: 'Enums compile to a real object; types and interfaces are erased.',
    },
    {
      question: 'What is the correct type for a [latitude, longitude] pair?',
      options: [
        '[number, number]',
        'number[2]',
        'Array<number, number>',
        'tuple<number>',
      ],
      answer: 0,
      explanation: 'Tuple syntax is [type1, type2].',
    },
    {
      question: 'A function that always throws an error has which return type?',
      options: [
        'void',
        'undefined',
        'null',
        'never',
      ],
      answer: 3,
      explanation: 'never means the function never returns normally.',
    },
  ],
};
