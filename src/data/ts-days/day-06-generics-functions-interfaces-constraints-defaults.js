export default {
  id: 'day-06-generics-functions-interfaces-constraints-defaults',
  title: 'Generics: Generic Functions, Interfaces, Constraints, Defaults and Generic API Response Types',
  module: 'Module 2: Type System Power',
  day: 6,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Generics let you write one function, interface or class that works with many types while keeping full type safety, instead of falling back to any. They are behind Array<T>, Promise<T>, useState<T> and every typed API response in a MERN app.',
  objectives: [
    'Explain why generics are better than any for reusable code',
    'Write generic functions and let TypeScript infer the type arguments',
    'Restrict generics with constraints (extends, keyof)',
    'Create generic interfaces, type aliases and classes with default type parameters',
    'Type API responses with ApiResponse<T> and Paginated<T>',
  ],
  theory: [
    {
      heading: 'Why generics?',
      content: `Suppose you write \`firstItem(items)\` that returns the first element. If you type it as \`(items: number[]) => number\`, it only works for numbers. If you type it as \`any[] => any\`, it works for everything but the caller loses all type information.

A **generic** adds a **type parameter**, a placeholder written in angle brackets: \`function firstItem<T>(items: T[]): T | undefined\`. When you call it with \`string[]\`, T becomes \`string\` and the result is \`string | undefined\`.

Analogy: a **tiffin box** is designed once, but whatever you put inside (rice, roti, dal), you know exactly what you will get back when you open it. \`any\` is a box with no label; you have to guess what is inside.

You already use generics daily: \`Array<string>\`, \`Promise<User>\`, \`Map<string, number>\`, \`useState<User | null>(null)\`.`,
      syntax: `function identity<T>(value: T): T {
  return value;
}
identity<string>("hi"); // explicit
identity(42);            // inferred: T = number`,
    },
    {
      heading: 'Type argument inference',
      content: `You rarely write the type argument yourself. TypeScript **infers** T from the arguments: \`firstItem([1, 2])\` → T = number.

Write it explicitly when there is nothing to infer from, for example \`useState<User | null>(null)\` (from \`null\` alone TS cannot know about User) or \`apiGet<User>("/api/me")\` where T is only used in the return type.

Naming: \`T\` (type), \`K\` (key), \`V\` (value), \`E\` (element/error) are conventions. For complex code use descriptive names like \`TData\`, \`TError\`.

In \`.tsx\` files, a generic arrow function needs a trailing comma, \`<T,>(x: T) => x\`, so the parser does not confuse \`<T>\` with a JSX tag.`,
    },
    {
      heading: 'Constraints: T extends ...',
      content: `Inside a generic function you cannot assume anything about T. \`value.length\` is an error because T could be a number. A **constraint** limits what T can be:

- \`<T extends { length: number }>\` – anything with a length (strings, arrays)
- \`<T extends HasId>\` – any model that has an \`id\`
- \`<K extends keyof T>\` – K must be one of T's property names; then \`T[K]\` is the type of that property

\`keyof T\` produces a union of T's keys: for \`{ title: string; price: number }\` it is \`"title" | "price"\`. The pair \`<T, K extends keyof T>(obj: T, key: K): T[K]\` is a classic interview question: it is how lodash's \`get\`, \`pluck\` and \`sortBy\` are typed.`,
      syntax: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}`,
    },
    {
      heading: 'Generic interfaces, type aliases and default type parameters',
      content: `Types can have type parameters too. This is how you model API responses once and reuse them for every endpoint:

- \`interface ApiResponse<T> { success: boolean; data: T; message?: string }\`
- \`interface Paginated<T> { items: T[]; page: number; totalPages: number }\`
- nested: \`ApiResponse<Paginated<Course>>\`

A **default type parameter** is used when no argument is given: \`interface ApiError<D = string>\`. React's types use this a lot, for example \`ChangeEvent<T = Element>\`.

Generic type aliases work for unions too: \`type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };\``,
      tip: 'When typing `fetch` results, `apiGet<User>(url)` only TELLS TypeScript what the server returns; it does not CHECK it. At the network boundary validate the data at runtime (Zod, Day 11).',
    },
    {
      heading: 'Generic classes',
      content: `Classes can be generic: \`class Repository<T extends Entity> { ... }\`. Each instance fixes T: \`new Repository<Student>()\` only accepts and returns Students.

Built-in generic classes: \`Map<K, V>\`, \`Set<T>\`, \`Promise<T>\`. Mongoose's \`Model<T>\` and \`Schema<T>\` (Day 11) are also generic classes.

Note: static members cannot use the class's type parameter, because statics belong to the class itself, not to an instance with a specific T.`,
    },
    {
      heading: 'Best practices and common mistakes',
      content: `- **Use the type parameter at least twice** (e.g. in a parameter and the return type). If T appears only once, you probably do not need a generic: \`function log<T>(x: T): void\` is just \`function log(x: unknown): void\`.
- Prefer **inference**: design signatures so callers do not need to write \`<...>\`.
- Add **constraints** instead of using \`as\` inside the function.
- Do not over-engineer: three nested generics with conditional types are hard to read for the next developer.
- Avoid returning \`T\` from a function that cannot actually produce a T (e.g. \`JSON.parse(text) as T\`) without a runtime check; at least document it as a trust boundary.`,
      tip: 'Interview favourite: "Write a generic function that returns the value of a property of any object" → `<T, K extends keyof T>(obj: T, key: K): T[K]`.',
    },
  ],
  examples: [
    {
      title: 'Generic functions and type inference',
      scenario: 'Reusable helpers that work with any element type: firstItem, pair, wrap and groupBy.',
      steps: [
        'Create generics.ts',
        'Hover the variables to see the inferred types',
        'Run it',
      ],
      code: `// Generic functions: one function, many types, full type safety
function firstItem<T>(items: T[]): T | undefined {
  return items[0];
}

const firstScore = firstItem([90, 75, 60]);        // T = number  -> number | undefined
const firstCity = firstItem(["Pune", "Delhi"]);    // T = string  -> string | undefined
console.log(firstScore, firstCity);

// Compare with any: the type information is lost
function firstAny(items: any[]): any {
  return items[0];
}
const lost = firstAny([1, 2]); // any: lost.toUpperCase() would compile and crash

// Multiple type parameters
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}
const p = pair("age", 25); // [string, number]
console.log(p);

// Generic arrow function and explicit type argument
const wrap = <T,>(value: T): { value: T; at: string } => ({ value, at: "2025-01-01" });
console.log(wrap<boolean>(true));

// Generic helper used in real apps: group items by a key
function groupBy<T>(items: T[], getKey: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = getKey(item);
    (groups[key] ??= []).push(item);
  }
  return groups;
}

const students = [
  { name: "Asha", batch: "A" },
  { name: "Ravi", batch: "B" },
  { name: "Neha", batch: "A" },
];
console.log(groupBy(students, (s) => s.batch));
console.log(typeof lost);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Generic functions: one function, many types, full type safety
function firstItem(items) {
    return items[0];
}
const firstScore = firstItem([90, 75, 60]); // T = number  -> number | undefined
const firstCity = firstItem(["Pune", "Delhi"]); // T = string  -> string | undefined
console.log(firstScore, firstCity);
// Compare with any: the type information is lost
function firstAny(items) {
    return items[0];
}
const lost = firstAny([1, 2]); // any: lost.toUpperCase() would compile and crash
// Multiple type parameters
function pair(key, value) {
    return [key, value];
}
const p = pair("age", 25); // [string, number]
console.log(p);
// Generic arrow function and explicit type argument
const wrap = (value) => ({ value, at: "2025-01-01" });
console.log(wrap(true));
// Generic helper used in real apps: group items by a key
function groupBy(items, getKey) {
    const groups = {};
    for (const item of items) {
        const key = getKey(item);
        (groups[key] ??= []).push(item);
    }
    return groups;
}
const students = [
    { name: "Asha", batch: "A" },
    { name: "Ravi", batch: "B" },
    { name: "Neha", batch: "A" },
];
console.log(groupBy(students, (s) => s.batch));
console.log(typeof lost);`,
      },
      result: `Console output:
90 Pune
[ 'age', 25 ]
{ value: true, at: '2025-01-01' }
{
  A: [ { name: 'Asha', batch: 'A' }, { name: 'Neha', batch: 'A' } ],
  B: [ { name: 'Ravi', batch: 'B' } ]
}
number`,
      explanation: 'TypeScript infers `T` from each call, so `firstScore` is `number | undefined` and `firstCity` is `string | undefined`. `firstAny` returns `any`, so mistakes would go unnoticed. `groupBy<T>` keeps the full student type inside each group, and the callback parameter `s` is typed automatically.',
    },
    {
      title: 'Constraints and keyof',
      scenario: 'Functions that need something from T: a length, a specific key, or an id.',
      steps: [
        'Create constraints.ts',
        'Run it',
        'Hover `title` and `price`: string and number',
      ],
      code: `// Constraints with extends, and keyof constraints
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
console.log(longest("TypeScript", "React"));
console.log(longest([1, 2, 3], [4, 5]));

// K must be one of T's keys; return type is the type of that property
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const course = { title: "TS for MERN", price: 2999, published: true };
const title = getProp(course, "title");     // string
const price = getProp(course, "price");     // number
console.log(title.toUpperCase(), price * 2);

// Constraint to objects that have an id: works for any model
interface HasId {
  id: string;
}
function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

const products = [
  { id: "p1", name: "Keyboard", stock: 4 },
  { id: "p2", name: "Mouse", stock: 0 },
];
const found = findById(products, "p2");      // keeps the full product type
console.log(found?.name, "stock:", found?.stock);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Constraints with extends, and keyof constraints
function longest(a, b) {
    return a.length >= b.length ? a : b;
}
console.log(longest("TypeScript", "React"));
console.log(longest([1, 2, 3], [4, 5]));
// K must be one of T's keys; return type is the type of that property
function getProp(obj, key) {
    return obj[key];
}
const course = { title: "TS for MERN", price: 2999, published: true };
const title = getProp(course, "title"); // string
const price = getProp(course, "price"); // number
console.log(title.toUpperCase(), price * 2);
function findById(items, id) {
    return items.find((item) => item.id === id);
}
const products = [
    { id: "p1", name: "Keyboard", stock: 4 },
    { id: "p2", name: "Mouse", stock: 0 },
];
const found = findById(products, "p2"); // keeps the full product type
console.log(found?.name, "stock:", found?.stock);`,
      },
      result: `Console output:
TypeScript
[ 1, 2, 3 ]
TS FOR MERN 5998
Mouse stock: 0`,
      explanation: '`T extends { length: number }` allows strings and arrays. `K extends keyof T` limits `key` to `"title" | "price" | "published"`, and `T[K]` gives the exact property type. `findById<T extends HasId>` works with any model that has an id and returns the full model type, not just HasId.',
    },
    {
      title: 'Constraint violations are compile errors',
      scenario: 'What happens when an argument does not satisfy a constraint.',
      steps: [
        'Create bad-constraints.ts',
        'Run `npx tsc --noEmit --strict bad-constraints.ts`',
      ],
      code: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

longest(10, 20);                           // numbers have no length
const course = { title: "TS", price: 2999 };
getProp(course, "rating");                 // not a key of course`,
      result: `This example intentionally does NOT compile. tsc reports:
error TS2345: Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.
error TS2345: Argument of type '"rating"' is not assignable to parameter of type '"title" | "price"'.`,
      explanation: '`number` does not have a `length` property, so it does not satisfy `{ length: number }`. `"rating"` is not in `keyof typeof course` (`"title" | "price"`). Constraints move these mistakes from runtime (undefined values) to compile time.',
    },
    {
      title: 'Generic API response types',
      scenario: 'A MERN frontend calls several endpoints that all wrap their data in the same `{ success, data }` envelope.',
      steps: [
        'Create api.ts',
        'Run it (the fake server responds after 50 ms)',
        'Hover `me.data` and `page.data.items`',
      ],
      code: `// Generic interfaces for API responses (the most common real-world use)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
}

// Generic with a DEFAULT type parameter
interface ApiError<D = string> {
  success: false;
  error: { code: number; details: D };
}

type User = { id: string; name: string };
type Course = { id: number; title: string };

// Fake "server" so the example runs anywhere
const db: Record<string, unknown> = {
  "/api/me": { success: true, data: { id: "u1", name: "Asha" } },
  "/api/courses?page=1": {
    success: true,
    data: { items: [{ id: 1, title: "React" }, { id: 2, title: "Node" }], page: 1, totalPages: 3 },
  },
};

async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  await new Promise((r) => setTimeout(r, 50)); // simulate network
  const body = db[url];
  if (!body) throw new Error("404 " + url);
  return body as ApiResponse<T>; // trust boundary: validate with Zod in real apps (Day 11)
}

async function main(): Promise<void> {
  const me = await apiGet<User>("/api/me");
  console.log("Hello", me.data.name);                // data: User

  const page = await apiGet<Paginated<Course>>("/api/courses?page=1");
  console.log(page.data.items.map((c) => c.title), \`page \${page.data.page}/\${page.data.totalPages}\`);

  const err: ApiError = { success: false, error: { code: 400, details: "Email is required" } };
  const err2: ApiError<{ field: string }[]> = {
    success: false,
    error: { code: 422, details: [{ field: "email" }, { field: "password" }] },
  };
  console.log(err.error.details, "|", err2.error.details.map((d) => d.field));
}

main();`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Fake "server" so the example runs anywhere
const db = {
    "/api/me": { success: true, data: { id: "u1", name: "Asha" } },
    "/api/courses?page=1": {
        success: true,
        data: { items: [{ id: 1, title: "React" }, { id: 2, title: "Node" }], page: 1, totalPages: 3 },
    },
};
async function apiGet(url) {
    await new Promise((r) => setTimeout(r, 50)); // simulate network
    const body = db[url];
    if (!body)
        throw new Error("404 " + url);
    return body; // trust boundary: validate with Zod in real apps (Day 11)
}
async function main() {
    const me = await apiGet("/api/me");
    console.log("Hello", me.data.name); // data: User
    const page = await apiGet("/api/courses?page=1");
    console.log(page.data.items.map((c) => c.title), \`page \${page.data.page}/\${page.data.totalPages}\`);
    const err = { success: false, error: { code: 400, details: "Email is required" } };
    const err2 = {
        success: false,
        error: { code: 422, details: [{ field: "email" }, { field: "password" }] },
    };
    console.log(err.error.details, "|", err2.error.details.map((d) => d.field));
}
main();`,
      },
      result: `Console output:
Hello Asha
[ 'React', 'Node' ] page 1/3
Email is required | [ 'email', 'password' ]`,
      explanation: '`ApiResponse<T>` and `Paginated<T>` are written once and reused for every endpoint. `apiGet<User>` makes `me.data` a `User`; `apiGet<Paginated<Course>>` nests generics. `ApiError` uses the default `D = string`, while `ApiError<{ field: string }[]>` overrides it. The `as` cast marks the trust boundary where real code should validate.',
    },
    {
      title: 'A generic Repository class',
      scenario: 'An in-memory data store similar to a Mongoose model, reusable for any entity with an id.',
      steps: [
        'Create repository.ts',
        'Run it',
        'Uncomment the `salary` line to see that only Student fields are allowed',
      ],
      code: `// A generic class: an in-memory repository, like a tiny Mongoose model
interface Entity {
  id: string;
}

class Repository<T extends Entity> {
  private items = new Map<string, T>();

  create(item: T): T {
    this.items.set(item.id, item);
    return item;
  }

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  update(id: string, changes: Partial<Omit<T, "id">>): T | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...changes };
    this.items.set(id, updated);
    return updated;
  }

  findAll(filter?: (item: T) => boolean): T[] {
    const all = [...this.items.values()];
    return filter ? all.filter(filter) : all;
  }
}

interface Student extends Entity {
  name: string;
  batch: string;
  fees: number;
}

const students = new Repository<Student>();
students.create({ id: "s1", name: "Asha", batch: "MERN-01", fees: 30000 });
students.create({ id: "s2", name: "Ravi", batch: "MERN-02", fees: 25000 });

students.update("s2", { fees: 28000 });           // only Student fields allowed
// students.update("s2", { salary: 1 });          // Error: 'salary' does not exist

console.log(students.findById("s2"));
console.log(students.findAll((s) => s.fees > 26000).map((s) => s.name));`,
      playground: {
        html: '<p>Open the console</p>',
        js: `class Repository {
    items = new Map();
    create(item) {
        this.items.set(item.id, item);
        return item;
    }
    findById(id) {
        return this.items.get(id);
    }
    update(id, changes) {
        const existing = this.items.get(id);
        if (!existing)
            return undefined;
        const updated = { ...existing, ...changes };
        this.items.set(id, updated);
        return updated;
    }
    findAll(filter) {
        const all = [...this.items.values()];
        return filter ? all.filter(filter) : all;
    }
}
const students = new Repository();
students.create({ id: "s1", name: "Asha", batch: "MERN-01", fees: 30000 });
students.create({ id: "s2", name: "Ravi", batch: "MERN-02", fees: 25000 });
students.update("s2", { fees: 28000 }); // only Student fields allowed
// students.update("s2", { salary: 1 });          // Error: 'salary' does not exist
console.log(students.findById("s2"));
console.log(students.findAll((s) => s.fees > 26000).map((s) => s.name));`,
      },
      result: `Console output:
{ id: 's2', name: 'Ravi', batch: 'MERN-02', fees: 28000 }
[ 'Asha', 'Ravi' ]`,
      explanation: '`Repository<T extends Entity>` guarantees every item has an `id`. `new Repository<Student>()` fixes T for that instance, so `create`, `findById` and `findAll` all work with `Student`. `Partial<Omit<T, "id">>` (utility types, Day 8) means "any subset of the fields except id".',
    },
  ],
  interview: [
    {
      q: 'What are generics in TypeScript?',
      a: 'Generics are type parameters that let functions, interfaces, type aliases and classes work with many types while preserving type information. Example: `function first<T>(arr: T[]): T | undefined`. Calling it with string[] returns string | undefined.',
      level: 'Easy',
    },
    {
      q: 'Why use generics instead of any?',
      a: 'any throws away type information: the result is any and errors are missed. Generics keep the relationship between input and output types, so the compiler still checks how the result is used and autocomplete works.',
      level: 'Easy',
    },
    {
      q: 'What is a generic constraint?',
      a: 'A restriction on a type parameter using extends, e.g. `<T extends { length: number }>` or `<T extends HasId>`. Inside the function you can use the constrained properties, and callers get an error if their argument does not satisfy the constraint.',
      level: 'Medium',
    },
    {
      q: 'Write a type-safe getProperty function.',
      a: `function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
K is limited to T's keys and the return type is the exact type of that property.`,
      level: 'Medium',
    },
    {
      q: 'What is a default type parameter?',
      a: 'A fallback type used when the caller does not provide one: `interface ApiError<D = string> {...}`. `ApiError` means `ApiError<string>`. Defaults must come after required type parameters.',
      level: 'Medium',
    },
    {
      q: 'When do you need to pass the type argument explicitly?',
      a: 'When TypeScript cannot infer it from the arguments: e.g. `useState<User | null>(null)`, `apiGet<User>(\'/me\')` where T only appears in the return type, or `new Map<string, number>()` when created empty.',
      level: 'Medium',
    },
    {
      q: 'How would you type a generic API response?',
      a: `interface ApiResponse<T> { success: boolean; data: T; message?: string }
interface Paginated<T> { items: T[]; page: number; total: number }
Then \`ApiResponse<Paginated<Product>>\`. Use a discriminated union if success and error responses have different shapes.`,
      level: 'Easy',
    },
    {
      q: 'Can static members of a generic class use the class\'s type parameter?',
      a: 'No. Static members belong to the class constructor, which is shared by all instances regardless of T, so `static x: T` is an error (TS2302).',
      level: 'Hard',
    },
    {
      q: 'Why do generic arrow functions in .tsx files need `<T,>`?',
      a: 'In TSX, `<T>` could be parsed as the start of a JSX element. Adding a trailing comma `<T,>` or a constraint `<T extends unknown>` tells the parser it is a type parameter list.',
      level: 'Hard',
    },
    {
      q: 'Does `fetchJson<User>(url)` guarantee the data is a User?',
      a: 'No. It only tells the compiler to treat the parsed JSON as User; types are erased at runtime. If the server returns something else, the code will misbehave. Validate at the boundary with a schema library (Zod, Valibot) or type guards.',
      level: 'Medium',
    },
    {
      q: 'What is the rule of thumb for \'unnecessary generics\'?',
      a: 'A type parameter should appear at least twice (relating two things, like input and output). If it appears only once, replace it with unknown or the constraint type; the generic adds complexity without adding safety.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Write three generic utilities: `lastItem<T>(items)`, `unique<T>(items)` (removes duplicates) and `chunk<T>(items, size)` (splits into groups of size).',
      hint: 'unique can use a Set; chunk returns T[][].',
      solution: `function lastItem<T>(items: readonly T[]): T | undefined {
  return items[items.length - 1];
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

console.log(lastItem(["a", "b", "c"]));        // c
console.log(unique([1, 2, 2, 3, 1]));          // [ 1, 2, 3 ]
console.log(chunk([1, 2, 3, 4, 5], 2));        // [ [ 1, 2 ], [ 3, 4 ], [ 5 ] ]`,
    },
    {
      task: 'Write `pluck(items, key)` that returns an array of the values of one property (typed exactly), and `sortBy(items, key)` that returns a sorted copy.',
      hint: 'pluck<T, K extends keyof T>(items: T[], key: K): T[K][]',
      solution: `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

function sortBy<T>(items: T[], key: keyof T): T[] {
  return [...items].sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0));
}

const orders = [
  { id: "o3", amount: 750, city: "Pune" },
  { id: "o1", amount: 1200, city: "Mumbai" },
  { id: "o2", amount: 300, city: "Delhi" },
];

const amounts = pluck(orders, "amount"); // number[]
console.log(amounts, amounts.reduce((a, b) => a + b, 0));
console.log(sortBy(orders, "amount").map((o) => o.id)); // [ 'o2', 'o3', 'o1' ]`,
    },
    {
      task: 'Create a generic `Result<T, E = Error>` discriminated union and a `safeParseJson<T>(text)` that never throws but returns a Result.',
      hint: '{ ok: true; value: T } | { ok: false; error: E }',
      solution: `type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function safeParseJson<T = unknown>(text: string): Result<T> {
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

const good = safeParseJson<{ name: string }>('{"name":"Asha"}');
if (good.ok) console.log("name:", good.value.name);

const bad = safeParseJson("{oops}");
if (!bad.ok) console.log("failed:", bad.error.name);`,
    },
    {
      task: 'Write a generic class `TypedCache<V>` with a time-to-live: `set(key, value)` and `get(key)` that returns undefined when the entry is missing or expired. Make the current time injectable for testing.',
      hint: 'Store `{ value, expiresAt }` in a Map<string, ...>.',
      solution: `class TypedCache<V> {
  private store = new Map<string, { value: V; expiresAt: number }>();

  constructor(private ttlMs: number) {}

  set(key: string, value: V, now: number = Date.now()): void {
    this.store.set(key, { value, expiresAt: now + this.ttlMs });
  }

  get(key: string, now: number = Date.now()): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (now > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }
}

const cache = new TypedCache<{ id: string; name: string }>(1000);
cache.set("u1", { id: "u1", name: "Asha" }, 0);
console.log(cache.get("u1", 500)?.name); // Asha (still fresh)
console.log(cache.get("u1", 1500));      // undefined (expired)`,
    },
  ],
  quiz: [
    {
      question: 'What does `<T>` in `function wrap<T>(x: T)` declare?',
      options: [
        'A type parameter',
        'A JSX element',
        'A type assertion',
        'A tuple',
      ],
      answer: 0,
      explanation: 'Angle brackets after the function name declare type parameters.',
    },
    {
      question: 'What is `K` limited to in `<T, K extends keyof T>`?',
      options: [
        'Any string',
        'The values of T',
        'The property names of T',
        'Number indexes only',
      ],
      answer: 2,
      explanation: 'keyof T is the union of T\'s keys.',
    },
    {
      question: 'With `interface Box<T = string> { value: T }`, what is the type of `Box[\'value\']`?',
      options: [
        'unknown',
        'any',
        'T',
        'string',
      ],
      answer: 3,
      explanation: 'Without a type argument the default string is used.',
    },
    {
      question: 'What is the return type of `getProp(course, "price")` if price is a number?',
      options: [
        'number',
        'unknown',
        'keyof course',
        'string | number',
      ],
      answer: 0,
      explanation: 'T[K] resolves to the exact property type.',
    },
    {
      question: 'Which is the main advantage of generics over any?',
      options: [
        'Faster runtime',
        'They keep type information between input and output',
        'They validate data at runtime',
        'They make code shorter',
      ],
      answer: 1,
      explanation: 'Generics preserve types; any discards them. Neither validates at runtime.',
    },
  ],
};
