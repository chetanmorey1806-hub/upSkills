export default {
  id: 'day-05-union-intersection-narrowing-type-guards-satisfies',
  title: 'Union and Intersection Types, Narrowing (typeof, in, instanceof), Discriminated Unions, Type Guards, satisfies',
  module: 'Module 2: Type System Power',
  day: 5,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Real data is rarely one fixed type: an id can be a string or a number, an API call can be loading, successful or failed. Union types describe \'one of these\', intersections describe \'all of these\', and narrowing is how TypeScript figures out which one you have at each line of code.',
  objectives: [
    'Create union and intersection types and know when to use each',
    'Narrow unions with typeof, truthiness, equality, in and instanceof',
    'Model state with discriminated unions and exhaustive switch checks',
    'Write custom type guards (value is T) and assertion functions',
    'Use the satisfies operator to validate values without losing precise types',
  ],
  theory: [
    {
      heading: 'Union types: A | B',
      content: `A **union type** means "the value is ONE of these types": \`let id: string | number;\`. Think of a payment counter that accepts **cash OR UPI OR card**: you know it is one of them, but you must check which before processing.

On a union you can only use what is **common to all members**. With \`string | number\` you can call \`toString()\` (both have it) but not \`toUpperCase()\` (numbers do not). To use member-specific features you must **narrow** first.

Unions of literals are very common: \`type Status = "active" | "blocked" | "deleted"\`.`,
      syntax: `type ID = string | number;
type Theme = "light" | "dark";
let result: string[] | null = null;`,
    },
    {
      heading: 'Intersection types: A & B',
      content: `An **intersection** means "the value is ALL of these types at once": it must have every property of each part. \`type Employee = Person & { salary: number }\`.

Use it to mix reusable pieces: \`WithTimestamps\`, \`WithId\`, \`WithAuthor\`. Intersections are the type-alias equivalent of \`extends\`.

Do not confuse the names: a union \`A | B\` accepts *more* values (either), while an intersection \`A & B\` accepts *fewer* values (must satisfy both). Intersecting two incompatible primitives gives \`never\`: \`string & number\` is \`never\`.`,
    },
    {
      heading: 'Narrowing: typeof, truthiness, equality, in, instanceof',
      content: `**Narrowing** is TypeScript following your \`if\` checks and refining the type inside each branch (this is called **control flow analysis**).

- \`typeof x === "string"\` – for primitives (string, number, boolean, bigint, symbol, undefined, function, object)
- Truthiness \`if (x)\` – removes null, undefined, "", 0, NaN, false
- Equality \`x === "none"\`, \`x !== null\` – narrows to/away from specific values
- \`"prop" in obj\` – for object unions that have different properties
- \`x instanceof Date\` / \`instanceof HttpError\` – for class instances
- \`Array.isArray(x)\` – for arrays

Narrowing also works with early returns: after \`if (!user) return;\` the rest of the function knows \`user\` is defined.`,
      tip: '`typeof null === "object"` in JavaScript! When you check `typeof x === "object"`, also check `x !== null`.',
    },
    {
      heading: 'Discriminated (tagged) unions',
      content: `The most useful pattern in TypeScript. Every member of the union has a common literal property (the **discriminant** or tag), usually \`type\`, \`kind\` or \`status\`:

\`{ status: "loading" } | { status: "success"; data: T } | { status: "error"; error: string }\`

Checking the tag (\`switch (state.status)\`) narrows the whole object, so \`state.data\` is only available in the success branch. This makes impossible states impossible: you cannot have \`data\` and \`error\` at the same time, unlike \`{ loading: boolean; data?: T; error?: string }\`.

Used everywhere in MERN code: React request state, Redux actions, useReducer actions, WebSocket messages and webhook events. Add a \`never\` check in the \`default\` branch to get a compile error when a new member is added but not handled.`,
    },
    {
      heading: 'Custom type guards and assertion functions',
      content: `When the built-in checks are not enough (for example validating an unknown API payload), write a function that returns a **type predicate**:

\`function isUser(value: unknown): value is User { ... }\`

If it returns true, TypeScript narrows the argument to \`User\` in the calling code. Since TypeScript 5.5, simple guards are even inferred, and \`array.filter(isUser)\` returns \`User[]\`.

An **assertion function** throws instead of returning a boolean: \`function assertIsDefined<T>(v: T): asserts v is NonNullable<T>\`. After calling it, the variable is narrowed for the rest of the scope.

Warning: TypeScript trusts your guard. If the implementation is wrong, the type will be wrong. For complex payloads use a validation library like Zod (Day 11) which builds the guard for you.`,
      syntax: `function isString(x: unknown): x is string {
  return typeof x === "string";
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}`,
    },
    {
      heading: 'The satisfies operator',
      content: `\`satisfies\` (TypeScript 4.9+) checks that a value **matches** a type, but keeps the value's own, more precise **inferred** type.

Compare:
- \`const routes: Record<string, Route> = {...}\` – checked, but the type becomes \`Record<string, Route>\`: keys are just \`string\`, so \`routes.dashbord\` (typo) is not caught
- \`const routes = {...} satisfies Record<string, Route>\` – checked, AND the type remembers the exact keys \`home\` and \`dashboard\`

Use \`satisfies\` for config objects, route maps, theme palettes and lookup tables. Use a normal annotation when you want the wider type on purpose (for example a variable that will be reassigned later).

Do not confuse it with \`as\`: \`as\` is a type assertion that **overrides** the compiler (unsafe), while \`satisfies\` only **checks** (safe).`,
      tip: '`as const satisfies T` combines both: readonly literal values that are also validated against T.',
    },
  ],
  examples: [
    {
      title: 'Union types with typeof, truthiness and equality narrowing',
      scenario: 'Order IDs may be strings or numbers; names may be missing; limits can be a number or "none".',
      steps: [
        'Create narrowing.ts',
        'Hover `id` inside each branch to see its narrowed type',
        'Run it',
      ],
      code: `// Union types + typeof / truthiness / equality narrowing
type ID = string | number;

function formatId(id: ID): string {
  // id.toUpperCase();  // Error: Property 'toUpperCase' does not exist on type 'number'.
  if (typeof id === "string") {
    return id.toUpperCase();         // here id: string
  }
  return "#" + id.toString().padStart(5, "0"); // here id: number
}

function greet(name: string | null | undefined): string {
  if (!name) return "Hello, guest";  // truthiness removes null, undefined and ""
  return \`Hello, \${name.trim()}\`;     // name: string
}

function applyLimit(value: number, limit: number | "none"): number {
  if (limit === "none") return value; // equality narrowing
  return Math.min(value, limit);      // limit: number
}

console.log(formatId("ord-9a"), formatId(42));
console.log(greet(null), "|", greet("  Asha "));
console.log(applyLimit(150, 100), applyLimit(150, "none"));

// Intersection: a value that is BOTH types at once
type WithTimestamps = { createdAt: Date };
type Note = { text: string } & WithTimestamps;
const note: Note = { text: "Revise generics", createdAt: new Date(Date.UTC(2025, 2, 1)) };
console.log(note.text, note.createdAt.toISOString().slice(0, 10));`,
      playground: {
        html: '<p>Open the console</p>',
        js: `function formatId(id) {
    // id.toUpperCase();  // Error: Property 'toUpperCase' does not exist on type 'number'.
    if (typeof id === "string") {
        return id.toUpperCase(); // here id: string
    }
    return "#" + id.toString().padStart(5, "0"); // here id: number
}
function greet(name) {
    if (!name)
        return "Hello, guest"; // truthiness removes null, undefined and ""
    return \`Hello, \${name.trim()}\`; // name: string
}
function applyLimit(value, limit) {
    if (limit === "none")
        return value; // equality narrowing
    return Math.min(value, limit); // limit: number
}
console.log(formatId("ord-9a"), formatId(42));
console.log(greet(null), "|", greet("  Asha "));
console.log(applyLimit(150, 100), applyLimit(150, "none"));
const note = { text: "Revise generics", createdAt: new Date(Date.UTC(2025, 2, 1)) };
console.log(note.text, note.createdAt.toISOString().slice(0, 10));`,
      },
      result: `Console output:
ORD-9A #00042
Hello, guest | Hello, Asha
100 150
Revise generics 2025-03-01`,
      explanation: 'In each `if` branch TypeScript knows exactly which member of the union you have. `!name` removes null, undefined and empty string, `limit === "none"` removes the literal, so the rest of the function sees `number`. `Note` is an intersection: it must have both `text` and `createdAt`.',
    },
    {
      title: 'Narrowing objects with in and classes with instanceof',
      scenario: 'Describe different kinds of users and handle errors thrown from an API layer.',
      steps: [
        'Create in-instanceof.ts',
        'Run it',
        'Note that `err` in `handle` starts as unknown',
      ],
      code: `// "in" narrowing for object unions, instanceof for classes
type Admin = { name: string; permissions: string[] };
type Customer = { name: string; loyaltyPoints: number };

function describe(person: Admin | Customer): string {
  if ("permissions" in person) {
    return \`\${person.name} is an admin with \${person.permissions.length} permissions\`;
  }
  return \`\${person.name} has \${person.loyaltyPoints} points\`;
}

console.log(describe({ name: "Neha", permissions: ["users:write", "courses:write"] }));
console.log(describe({ name: "Karan", loyaltyPoints: 320 }));

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function handle(err: unknown): string {
  if (err instanceof HttpError) return \`HTTP \${err.status}: \${err.message}\`;
  if (err instanceof Error) return \`Error: \${err.message}\`;
  return "Unknown error: " + String(err);
}

console.log(handle(new HttpError(404, "Course not found")));
console.log(handle(new TypeError("x is not a function")));
console.log(handle("plain string thrown"));`,
      playground: {
        html: '<p>Open the console</p>',
        js: `function describe(person) {
    if ("permissions" in person) {
        return \`\${person.name} is an admin with \${person.permissions.length} permissions\`;
    }
    return \`\${person.name} has \${person.loyaltyPoints} points\`;
}
console.log(describe({ name: "Neha", permissions: ["users:write", "courses:write"] }));
console.log(describe({ name: "Karan", loyaltyPoints: 320 }));
class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
function handle(err) {
    if (err instanceof HttpError)
        return \`HTTP \${err.status}: \${err.message}\`;
    if (err instanceof Error)
        return \`Error: \${err.message}\`;
    return "Unknown error: " + String(err);
}
console.log(handle(new HttpError(404, "Course not found")));
console.log(handle(new TypeError("x is not a function")));
console.log(handle("plain string thrown"));`,
      },
      result: `Console output:
Neha is an admin with 2 permissions
Karan has 320 points
HTTP 404: Course not found
Error: x is not a function
Unknown error: plain string thrown`,
      explanation: '`"permissions" in person` narrows to `Admin` because only Admin has that property. `instanceof HttpError` narrows to the class, so `err.status` is available. Order matters: check the more specific class (HttpError) before the general `Error`.',
    },
    {
      title: 'Discriminated union for API request state',
      scenario: 'A React-style component must render idle, loading, success and error states correctly.',
      steps: [
        'Create request-state.ts',
        'Run it',
        'Try reading `state.data` in the "error" case: it is a compile error',
      ],
      code: `// Discriminated union: the classic way to model API request state
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

type Course = { id: number; title: string };

function render(state: RequestState<Course[]>): string {
  switch (state.status) {
    case "idle":
      return "Click 'Load courses'";
    case "loading":
      return "Loading...";
    case "success":
      // only here does TypeScript allow state.data
      return state.data.map((c) => c.title).join(", ");
    case "error":
      return "Failed: " + state.error;
    default: {
      const unreachable: never = state; // exhaustive check
      return unreachable;
    }
  }
}

const states: RequestState<Course[]>[] = [
  { status: "idle" },
  { status: "loading" },
  { status: "success", data: [{ id: 1, title: "React" }, { id: 2, title: "Node" }] },
  { status: "error", error: "Network timeout" },
];

for (const s of states) console.log(s.status.padEnd(8), "->", render(s));`,
      playground: {
        html: '<p>Open the console</p>',
        js: `function render(state) {
    switch (state.status) {
        case "idle":
            return "Click 'Load courses'";
        case "loading":
            return "Loading...";
        case "success":
            // only here does TypeScript allow state.data
            return state.data.map((c) => c.title).join(", ");
        case "error":
            return "Failed: " + state.error;
        default: {
            const unreachable = state; // exhaustive check
            return unreachable;
        }
    }
}
const states = [
    { status: "idle" },
    { status: "loading" },
    { status: "success", data: [{ id: 1, title: "React" }, { id: 2, title: "Node" }] },
    { status: "error", error: "Network timeout" },
];
for (const s of states)
    console.log(s.status.padEnd(8), "->", render(s));`,
      },
      result: `Console output:
idle     -> Click 'Load courses'
loading  -> Loading...
success  -> React, Node
error    -> Failed: Network timeout`,
      explanation: '`status` is the discriminant. Inside `case "success"`, `state` is narrowed to `{ status: "success"; data: Course[] }`. The `never` assignment in default proves every status is handled; adding a fifth status without handling it would fail to compile. The generic `<T>` (Day 6) lets the same state type work for any data.',
    },
    {
      title: 'Custom type guards and assertion functions',
      scenario: 'Filter valid users out of untrusted payloads and make sure required config values exist.',
      steps: [
        'Create guards.ts',
        'Run it',
        'Hover `users`: it is `User[]`, not `unknown[]`',
      ],
      code: `// User-defined type guards (x is T) and assertion functions (asserts x is T)
interface User {
  id: string;
  email: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).id === "string" &&
    typeof (value as Record<string, unknown>).email === "string"
  );
}

function assertIsDefined<T>(value: T, name: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(\`\${name} is required\`);
  }
}

const payloads: unknown[] = [
  { id: "u1", email: "asha@example.com" },
  { id: 2, email: "wrong-id-type@example.com" },
  "not even an object",
];

const users = payloads.filter(isUser); // TS 5.5+: filter keeps the guard -> User[]
console.log("valid users:", users.map((u) => u.email));

const apiKey: string | undefined = "abc123";
assertIsDefined(apiKey, "API_KEY");
console.log("key length:", apiKey.length); // narrowed to string after the assertion

try {
  const secret: string | undefined = undefined;
  assertIsDefined(secret, "JWT_SECRET");
} catch (e) {
  if (e instanceof Error) console.log(e.message);
}`,
      playground: {
        html: '<p>Open the console</p>',
        js: `function isUser(value) {
    return (typeof value === "object" &&
        value !== null &&
        typeof value.id === "string" &&
        typeof value.email === "string");
}
function assertIsDefined(value, name) {
    if (value === undefined || value === null) {
        throw new Error(\`\${name} is required\`);
    }
}
const payloads = [
    { id: "u1", email: "asha@example.com" },
    { id: 2, email: "wrong-id-type@example.com" },
    "not even an object",
];
const users = payloads.filter(isUser); // TS 5.5+: filter keeps the guard -> User[]
console.log("valid users:", users.map((u) => u.email));
const apiKey = "abc123";
assertIsDefined(apiKey, "API_KEY");
console.log("key length:", apiKey.length); // narrowed to string after the assertion
try {
    const secret = undefined;
    assertIsDefined(secret, "JWT_SECRET");
}
catch (e) {
    if (e instanceof Error)
        console.log(e.message);
}`,
      },
      result: `Console output:
valid users: [ 'asha@example.com' ]
key length: 6
JWT_SECRET is required`,
      explanation: '`value is User` tells TypeScript that a `true` result means the value is a User, so `filter(isUser)` returns `User[]`. `asserts value is NonNullable<T>` narrows the variable after the call, so `apiKey.length` compiles. The second payload is rejected because its id is a number.',
    },
    {
      title: 'satisfies vs a type annotation',
      scenario: 'A route map and a design palette that must follow a shape but keep their exact keys and value types.',
      steps: [
        'Create routes.ts',
        'Run it',
        'Uncomment the `profile` line and the `routes.dashbord` line and run `npx tsc --noEmit --strict routes.ts`',
      ],
      code: `// satisfies: check a value against a type WITHOUT losing its precise type
type Route = { path: string; auth: boolean };

// With an annotation, the keys become plain \`string\` and literal info is lost
const routesAnnotated: Record<string, Route> = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
};
// routesAnnotated.dashbord -> NO error, any string key is allowed

// With satisfies, TS checks the shape AND remembers the exact keys
const routes = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
  // profile: { path: "/me", auth: "yes" }, // Error: Type 'string' is not assignable to type 'boolean'.
} satisfies Record<string, Route>;

type RouteName = keyof typeof routes; // "home" | "dashboard"

function linkTo(name: RouteName): string {
  return routes[name].path;
}

// routes.dashbord  -> Error: Property 'dashbord' does not exist
console.log(linkTo("dashboard"));

// Palette example: values keep their own precise types
const palette = {
  primary: "#2563eb",
  spacing: [4, 8, 16],
} satisfies Record<string, string | number[]>;

console.log(palette.primary.toUpperCase());          // known to be a string
console.log(palette.spacing.map((n) => n * 2));      // known to be number[]
console.log(Object.keys(routesAnnotated).length, "annotated routes");`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// With an annotation, the keys become plain \`string\` and literal info is lost
const routesAnnotated = {
    home: { path: "/", auth: false },
    dashboard: { path: "/dashboard", auth: true },
};
// routesAnnotated.dashbord -> NO error, any string key is allowed
// With satisfies, TS checks the shape AND remembers the exact keys
const routes = {
    home: { path: "/", auth: false },
    dashboard: { path: "/dashboard", auth: true },
    // profile: { path: "/me", auth: "yes" }, // Error: Type 'string' is not assignable to type 'boolean'.
};
function linkTo(name) {
    return routes[name].path;
}
// routes.dashbord  -> Error: Property 'dashbord' does not exist
console.log(linkTo("dashboard"));
// Palette example: values keep their own precise types
const palette = {
    primary: "#2563eb",
    spacing: [4, 8, 16],
};
console.log(palette.primary.toUpperCase()); // known to be a string
console.log(palette.spacing.map((n) => n * 2)); // known to be number[]
console.log(Object.keys(routesAnnotated).length, "annotated routes");`,
      },
      result: `Console output:
/dashboard
#2563EB
[ 8, 16, 32 ]
2 annotated routes

With the two commented lines enabled, tsc reports:
error TS2322: Type 'string' is not assignable to type 'boolean'.
error TS2551: Property 'dashbord' does not exist on type '{ home: { path: string; auth: false; }; dashboard: { path: string; auth: true; }; profile: { path: string; auth: string; }; }'. Did you mean 'dashboard'?`,
      explanation: '`routesAnnotated` is widened to `Record<string, Route>`, so any key, even a typo, is accepted. `routes` is checked with `satisfies` but keeps its literal keys, so `keyof typeof routes` is exactly `"home" | "dashboard"` and typos are errors. For `palette`, satisfies remembers that `primary` is a string and `spacing` is `number[]`, so both method calls compile without narrowing.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between a union and an intersection type?',
      a: 'A union `A | B` is a value that is either A or B; you can only use members common to both until you narrow. An intersection `A & B` is a value that is both A and B at the same time, so it has all properties of both. Unions widen the set of allowed values, intersections narrow it.',
      level: 'Easy',
    },
    {
      q: 'What is type narrowing?',
      a: 'The process where TypeScript refines a broad type to a more specific one inside a block, based on checks in your code: typeof, instanceof, in, equality, truthiness, Array.isArray, discriminant checks and custom type guards. It is driven by control flow analysis.',
      level: 'Easy',
    },
    {
      q: 'What is a discriminated union?',
      a: 'A union of object types that share a literal property (the discriminant) such as `kind` or `status`. Checking that property narrows the whole object to one member. It is used for reducer actions, API states and events, and pairs with a never check for exhaustiveness.',
      level: 'Medium',
    },
    {
      q: 'How do you write a custom type guard?',
      a: 'A function returning a type predicate: `function isUser(x: unknown): x is User { return typeof x === \'object\' && x !== null && \'email\' in x; }`. When it returns true, the argument is narrowed to User at the call site.',
      level: 'Medium',
    },
    {
      q: 'What is an assertion function?',
      a: 'A function with a return type like `asserts value is T` or `asserts condition`. It throws if the check fails; after it returns, TypeScript narrows the value for the rest of the scope. Node\'s `assert` is typed this way.',
      level: 'Hard',
    },
    {
      q: 'What does `satisfies` do and how is it different from a type annotation and `as`?',
      a: '`satisfies T` checks that the expression is assignable to T but keeps the expression\'s own inferred (narrower) type. An annotation `const x: T` replaces the inferred type with T (losing literal keys/values). `as T` is an assertion that tells the compiler to trust you and can hide errors. satisfies is the safe way to validate config objects.',
      level: 'Medium',
    },
    {
      q: 'Why does `typeof x === \'object\'` not fully narrow to a non-null object?',
      a: 'Because in JavaScript `typeof null === \'object\'`. TypeScript knows this, so after that check x is `object | null`. You also need `x !== null`.',
      level: 'Medium',
    },
    {
      q: 'How do you make a switch over a union exhaustive?',
      a: 'In the default branch assign the value to a variable of type never (`const _x: never = value;`) or pass it to an `assertNever(x: never)` function. If a union member is not handled, its type is not never and compilation fails.',
      level: 'Medium',
    },
    {
      q: 'What happens when you intersect `string & number`?',
      a: 'The result is never, because no value can be both a string and a number. For objects with a conflicting property, that property becomes never, which often makes the whole object type impossible to create.',
      level: 'Hard',
    },
    {
      q: 'Why prefer `{ status: \'loading\' } | { status: \'success\'; data: T }` over `{ loading: boolean; data?: T; error?: string }`?',
      a: 'The flags version allows impossible combinations (loading true with data and error both set) and forces optional checks everywhere. The discriminated union makes illegal states unrepresentable, and narrowing guarantees data exists only in the success branch.',
      level: 'Hard',
    },
    {
      q: 'Does `filter(Boolean)` narrow `(string | undefined)[]` to `string[]`?',
      a: 'Not with the built-in `Boolean` function, because its signature is not a type predicate. Use an explicit guard: `arr.filter((x): x is string => x !== undefined)`. Since TS 5.5, `arr.filter((x) => x !== undefined)` is inferred as a type predicate and does return string[].',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Write `formatPrice(value: number | string | null)` that returns \'₹\' + the Indian-formatted number, \'Price on request\' for null and \'Invalid price\' for non-numeric strings.',
      hint: 'Narrow null first, convert strings with Number(), use toLocaleString(\'en-IN\').',
      solution: `function formatPrice(value: number | string | null): string {
  if (value === null) return "Price on request";
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return "Invalid price";
  return "₹" + amount.toLocaleString("en-IN");
}

console.log(formatPrice(125000));   // ₹1,25,000
console.log(formatPrice("4999"));   // ₹4,999
console.log(formatPrice(null));     // Price on request
console.log(formatPrice("abc"));    // Invalid price`,
    },
    {
      task: 'Model circle, rectangle and triangle as a discriminated union with a `kind` property and write an `area(shape)` function with an exhaustive never check.',
      hint: 'switch (shape.kind) and a `const check: never = shape` in default.',
      solution: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
    default: {
      const check: never = shape;
      return check;
    }
  }
}

const shapes: Shape[] = [
  { kind: "circle", radius: 2 },
  { kind: "rectangle", width: 3, height: 4 },
  { kind: "triangle", base: 6, height: 2 },
];
shapes.forEach((s) => console.log(s.kind, area(s).toFixed(2)));`,
    },
    {
      task: 'A payment provider sends webhooks with three event types. Write a type guard `isPaymentEvent(value: unknown): value is PaymentEvent` and a `handleWebhook(body: unknown)` that returns a message for each valid event and ignores invalid ones.',
      hint: 'Check `orderId` first, then switch on `type` and check the extra field of each event.',
      solution: `type PaymentEvent =
  | { type: "payment.success"; orderId: string; amount: number }
  | { type: "payment.failed"; orderId: string; reason: string }
  | { type: "refund.created"; orderId: string; refundId: string };

function isPaymentEvent(value: unknown): value is PaymentEvent {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.orderId !== "string") return false;
  switch (v.type) {
    case "payment.success":
      return typeof v.amount === "number";
    case "payment.failed":
      return typeof v.reason === "string";
    case "refund.created":
      return typeof v.refundId === "string";
    default:
      return false;
  }
}

function handleWebhook(body: unknown): string {
  if (!isPaymentEvent(body)) return "ignored: invalid event";
  switch (body.type) {
    case "payment.success":
      return \`order \${body.orderId} paid ₹\${body.amount}\`;
    case "payment.failed":
      return \`order \${body.orderId} failed: \${body.reason}\`;
    case "refund.created":
      return \`refund \${body.refundId} for \${body.orderId}\`;
  }
}

console.log(handleWebhook({ type: "payment.success", orderId: "o1", amount: 999 }));
console.log(handleWebhook({ type: "payment.failed", orderId: "o2", reason: "card declined" }));
console.log(handleWebhook({ type: "payment.success", orderId: "o3" }));`,
    },
    {
      task: 'Create a `themes` object with light and dark themes validated with `satisfies Record<string, Theme>`, derive `ThemeName` from its keys and write `applyTheme(name)`.',
      hint: 'type ThemeName = keyof typeof themes;',
      solution: `type Theme = { bg: string; text: string };

const themes = {
  light: { bg: "#ffffff", text: "#111827" },
  dark: { bg: "#111827", text: "#f9fafb" },
} satisfies Record<string, Theme>;

type ThemeName = keyof typeof themes; // "light" | "dark"

function applyTheme(name: ThemeName): string {
  const t = themes[name];
  return \`background:\${t.bg};color:\${t.text}\`;
}

console.log(applyTheme("dark"));
// applyTheme("blue"); // Error: Argument of type '"blue"' is not assignable to parameter of type '"light" | "dark"'.`,
    },
  ],
  quiz: [
    {
      question: 'Given `let id: string | number`, which call is allowed WITHOUT narrowing?',
      options: [
        'id.toUpperCase()',
        'id.toFixed(2)',
        'id.toString()',
        'id.length',
      ],
      answer: 2,
      explanation: 'Only members common to every union member can be used: both string and number have toString().',
    },
    {
      question: 'Which operator narrows a union of object types by checking for a property?',
      options: [
        'in',
        'typeof',
        'keyof',
        'as',
      ],
      answer: 0,
      explanation: '\'prop\' in obj narrows to the members that have that property.',
    },
    {
      question: 'What is the return type of a custom type guard for User?',
      options: [
        'boolean<User>',
        'User | false',
        'asserts User',
        'value is User',
      ],
      answer: 3,
      explanation: 'A type predicate has the form `paramName is Type`.',
    },
    {
      question: 'What does `satisfies` do?',
      options: [
        'Casts the value to the type, like as',
        'Checks the value against a type but keeps the inferred type',
        'Converts the value at runtime',
        'Makes the object readonly',
      ],
      answer: 1,
      explanation: 'satisfies validates without widening the inferred type.',
    },
    {
      question: 'In a discriminated union, what is the discriminant?',
      options: [
        'A shared literal property such as status or kind',
        'The first member of the union',
        'A class used with instanceof',
        'The never type',
      ],
      answer: 0,
      explanation: 'A common literal-typed property lets TypeScript narrow the whole object.',
    },
  ],
};
