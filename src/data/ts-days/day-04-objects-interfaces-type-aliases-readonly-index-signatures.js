export default {
  id: 'day-04-objects-interfaces-type-aliases-readonly-index-signatures',
  title: 'Objects: Interfaces vs Type Aliases, Optional and Readonly Properties, Index Signatures, Extending',
  module: 'Module 1: TypeScript Basics',
  day: 4,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'In MERN apps almost all data is objects: users, products, orders, API responses. Today you learn to describe object shapes with interfaces and type aliases, mark properties optional or readonly, type objects with dynamic keys, and build bigger types by extending smaller ones.',
  objectives: [
    'Describe object shapes with interface and type alias',
    'Use optional (?) and readonly properties correctly',
    'Type dictionaries with index signatures and Record',
    'Extend interfaces and combine types with intersections',
    'Explain the practical differences between interface and type',
  ],
  theory: [
    {
      heading: 'Object types: inline, interface and type alias',
      content: `An object type lists property names and their types. You can write it inline: \`function show(user: { name: string; age: number }) {}\`, but for anything reused you give it a name.

**Interface**:
\`interface User { name: string; age: number; }\`

**Type alias**:
\`type User = { name: string; age: number; };\`

For plain object shapes both work the same way, and both are erased at compile time. Think of them as a **blueprint form** for a bank account opening: the form lists which fields must be filled and what kind of value goes in each.

TypeScript uses **structural typing** ("duck typing"): any object that has the required properties with the right types is accepted, no matter what it was called or where it was created.`,
      syntax: `interface Product {
  id: string;
  title: string;
  price: number;
}

type Order = {
  id: string;
  items: Product[];
  total: number;
};`,
    },
    {
      heading: 'Optional and readonly properties',
      content: `- **Optional** \`phone?: string\` – the property may be missing. Its type is \`string | undefined\`, so use \`?.\`, \`??\` or an \`if\` check before using it.
- **readonly** \`readonly id: string\` – can be set when the object is created but not reassigned later. Perfect for database ids and createdAt fields.

\`readonly\` is **shallow** and **compile-time only**: it does not freeze the object at runtime, and nested objects are still mutable unless they are readonly too. For runtime immutability use \`Object.freeze\`.

With strict mode, writing \`user.phone.length\` when phone is optional is an error (\`'user.phone' is possibly 'undefined'\`).`,
      tip: 'Do not make everything optional to silence errors. Optional should mean "this really can be missing", otherwise every reader must handle undefined for no reason.',
    },
    {
      heading: 'Excess property checks',
      content: `When you assign an **object literal** directly to a typed variable, TypeScript reports properties that the type does not have: \`Object literal may only specify known properties\`. This catches typos like \`emial\` instead of \`email\`.

The check only applies to fresh object literals. If you first store the object in a variable and then pass the variable, extra properties are allowed (because of structural typing).

This is why typos in React props or API payload objects are caught immediately.`,
    },
    {
      heading: 'Index signatures and Record',
      content: `Sometimes you do not know the keys in advance: marks by subject, stock by product name, HTTP headers. Use an **index signature**: \`{ [key: string]: number }\`.

\`Record<K, V>\` is a built-in shorthand: \`Record<string, number>\` is the same as \`{ [key: string]: number }\`. With a union of keys, \`Record<"mon" | "tue", number>\`, **every** listed key is required, which is great for lookup tables.

Fixed properties can live next to an index signature, but their types must be compatible with the index type.

Caution: by default \`marks["history"]\` is typed \`number\` even if the key does not exist. The compiler option \`noUncheckedIndexedAccess\` makes it \`number | undefined\`, which is safer.`,
      syntax: `interface Scores {
  [subject: string]: number;
}
type PriceList = Record<string, number>;
type Weekdays = Record<"mon" | "tue" | "wed", boolean>;`,
    },
    {
      heading: 'Extending: extends and intersections (&)',
      content: `Real models share fields: every MongoDB document has \`_id\` and timestamps, every person has name and email. Build types from smaller pieces:

- \`interface Student extends BaseDocument, Person { ... }\` – an interface can extend one or many interfaces (or object type aliases)
- \`type Mentor = BaseDocument & Person & { rating: number }\` – a type alias combines types with an **intersection** \`&\`

Difference: if two extended interfaces declare the same property with conflicting types, \`extends\` gives a clear error. An intersection silently produces \`never\` for that property, which is harder to debug.`,
      tip: 'Use extends for object hierarchies (it gives better error messages and is slightly faster for the compiler). Use & when combining with unions or utility types.',
    },
    {
      heading: 'interface vs type: what should I use?',
      content: `Both describe objects. The differences that matter:

- **Declaration merging**: only interfaces. Declaring \`interface Window { myApp: string }\` twice merges both. Libraries use this to let you extend their types (for example adding \`user\` to Express's \`Request\`, Day 11).
- **Unions, primitives, tuples, mapped and conditional types**: only type aliases (\`type ID = string | number\`).
- **extends** vs **&**: both can compose, as shown above.
- **Classes** can \`implement\` both (if the type is an object type).

**Practical rule:** many teams use \`interface\` for object shapes (props, models, API contracts) and \`type\` for everything else (unions, functions, utility combinations). Others use \`type\` everywhere. Be consistent in a codebase; both answers are fine in an interview if you can explain the differences.`,
      points: [
        'interface: object shapes, can merge, extends',
        'type: anything, unions, tuples, computed types',
        'both: erased at runtime, structural',
      ],
    },
  ],
  examples: [
    {
      title: 'An interface with optional and readonly properties',
      scenario: 'A User model in a MERN app: the id never changes and phone is optional.',
      steps: [
        'Create user.ts',
        'Run with tsx or the playground',
        'Try `user.id = "x"` and see the compile error',
      ],
      code: `// Describing object shapes with an interface
interface User {
  readonly id: string;      // cannot be changed after creation
  name: string;
  email: string;
  phone?: string;           // optional: may be missing
  isVerified: boolean;
}

const user: User = {
  id: "u_101",
  name: "Asha Patil",
  email: "asha@example.com",
  isVerified: false,
};

function contactLine(u: User): string {
  // phone is string | undefined, so give a fallback
  return \`\${u.name} <\${u.email}> phone: \${u.phone ?? "not added"}\`;
}

user.isVerified = true;   // fine: normal property
user.phone = "98765 43210";
console.log(contactLine(user));
console.log(user);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `const user = {
    id: "u_101",
    name: "Asha Patil",
    email: "asha@example.com",
    isVerified: false,
};
function contactLine(u) {
    // phone is string | undefined, so give a fallback
    return \`\${u.name} <\${u.email}> phone: \${u.phone ?? "not added"}\`;
}
user.isVerified = true; // fine: normal property
user.phone = "98765 43210";
console.log(contactLine(user));
console.log(user);`,
      },
      result: `Console output:
Asha Patil <asha@example.com> phone: 98765 43210
{
  id: 'u_101',
  name: 'Asha Patil',
  email: 'asha@example.com',
  isVerified: true,
  phone: '98765 43210'
}`,
      explanation: '`readonly id` can be set in the object literal but not reassigned. `phone?` may be missing at creation; inside `contactLine` it is `string | undefined`, so `??` supplies a fallback. Notice the interface disappears entirely in the playground JavaScript.',
    },
    {
      title: 'Three object mistakes TypeScript catches',
      scenario: 'Changing a readonly field, forgetting a required field and a typo-like extra field.',
      steps: [
        'Create product.ts',
        'Run `npx tsc --noEmit --strict product.ts`',
        'Read each error and fix it',
      ],
      code: `interface Product {
  readonly sku: string;
  title: string;
  price: number;
  discount?: number;
}

const p: Product = { sku: "TS-01", title: "TS Handbook", price: 499 };
p.sku = "TS-02";                      // 1) readonly

const q: Product = { sku: "TS-03", title: "Mug" };   // 2) missing property

const r: Product = { sku: "TS-04", title: "Pen", price: 20, colour: "blue" }; // 3) excess property`,
      result: `This example intentionally does NOT compile. tsc reports:
error TS2540: Cannot assign to 'sku' because it is a read-only property.
error TS2741: Property 'price' is missing in type '{ sku: string; title: string; }' but required in type 'Product'.
error TS2353: Object literal may only specify known properties, and 'colour' does not exist in type 'Product'.`,
      explanation: '1) `sku` is readonly (TS2540). 2) `price` is required but missing (TS2741). 3) `colour` is not in the interface; the excess property check (TS2353) catches it because it is a fresh object literal. Fix: add `colour?: string` to the interface if it is a real field, or remove it.',
    },
    {
      title: 'Index signatures and Record for dynamic keys',
      scenario: 'Marks by subject, stock by product name and weekly class hours.',
      steps: [
        'Create records.ts',
        'Run it',
        'Remove `wed` from classHours and see the missing-key error',
      ],
      code: `// Index signatures: objects with dynamic keys
interface MarksBySubject {
  [subject: string]: number;
}

const marks: MarksBySubject = { maths: 88, physics: 72 };
marks["chemistry"] = 91;           // any string key allowed, value must be a number

// Record<K, V> is the shorthand most codebases use
type Inventory = Record<string, number>;
const stock: Inventory = { laptop: 4, mouse: 25 };

// Record with a union of keys = every key is REQUIRED
type Day = "mon" | "tue" | "wed";
const classHours: Record<Day, number> = { mon: 2, tue: 3, wed: 1 };

function average(m: MarksBySubject): number {
  const values = Object.values(m);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

console.log(marks, "avg:", average(marks).toFixed(2));
console.log(stock["keyboard"] ?? 0, "keyboards in stock");
console.log(classHours);

// Mixing fixed and dynamic keys: fixed ones must match the index type
interface HttpHeaders {
  "content-type": string;
  [header: string]: string;
}
const h: HttpHeaders = { "content-type": "application/json", authorization: "Bearer abc" };
console.log(Object.keys(h));`,
      playground: {
        html: '<p>Open the console</p>',
        js: `const marks = { maths: 88, physics: 72 };
marks["chemistry"] = 91; // any string key allowed, value must be a number
const stock = { laptop: 4, mouse: 25 };
const classHours = { mon: 2, tue: 3, wed: 1 };
function average(m) {
    const values = Object.values(m);
    return values.reduce((a, b) => a + b, 0) / values.length;
}
console.log(marks, "avg:", average(marks).toFixed(2));
console.log(stock["keyboard"] ?? 0, "keyboards in stock");
console.log(classHours);
const h = { "content-type": "application/json", authorization: "Bearer abc" };
console.log(Object.keys(h));`,
      },
      result: `Console output:
{ maths: 88, physics: 72, chemistry: 91 } avg: 83.67
0 keyboards in stock
{ mon: 2, tue: 3, wed: 1 }
[ 'content-type', 'authorization' ]`,
      explanation: '`[subject: string]: number` allows any string key with a number value. `Record<string, number>` is the same thing in shorter form. `Record<Day, number>` requires every key in the `Day` union. `stock["keyboard"]` is typed `number` but is undefined at runtime, so `?? 0` protects us (enable `noUncheckedIndexedAccess` to make the compiler force this).',
    },
    {
      title: 'Extending interfaces and intersecting types',
      scenario: 'Student and Mentor documents share database fields and personal details.',
      steps: [
        'Create people.ts',
        'Run it',
        'Notice badge() accepts both Student and Mentor',
      ],
      code: `// Extending interfaces and intersecting types
interface BaseDocument {
  _id: string;
  createdAt: Date;
}

interface Person {
  name: string;
  email: string;
}

// interface can extend one or more interfaces
interface Student extends BaseDocument, Person {
  enrolledCourses: string[];
}

// type alias "extends" with an intersection (&)
type Mentor = BaseDocument & Person & {
  expertise: string[];
  rating: number;
};

const s: Student = {
  _id: "s1",
  createdAt: new Date("2025-06-01"),
  name: "Ravi",
  email: "ravi@example.com",
  enrolledCourses: ["MERN", "TypeScript"],
};

const m: Mentor = {
  _id: "m1",
  createdAt: new Date("2024-01-10"),
  name: "Neha",
  email: "neha@example.com",
  expertise: ["React", "Node.js"],
  rating: 4.8,
};

// Any object with name + email can be passed (structural typing)
function badge(p: Person): string {
  return \`\${p.name} (\${p.email})\`;
}

console.log(badge(s));
console.log(badge(m), "rating", m.rating);
console.log(s.enrolledCourses.length, "courses since", s.createdAt.getFullYear());`,
      playground: {
        html: '<p>Open the console</p>',
        js: `const s = {
    _id: "s1",
    createdAt: new Date("2025-06-01"),
    name: "Ravi",
    email: "ravi@example.com",
    enrolledCourses: ["MERN", "TypeScript"],
};
const m = {
    _id: "m1",
    createdAt: new Date("2024-01-10"),
    name: "Neha",
    email: "neha@example.com",
    expertise: ["React", "Node.js"],
    rating: 4.8,
};
// Any object with name + email can be passed (structural typing)
function badge(p) {
    return \`\${p.name} (\${p.email})\`;
}
console.log(badge(s));
console.log(badge(m), "rating", m.rating);
console.log(s.enrolledCourses.length, "courses since", s.createdAt.getFullYear());`,
      },
      result: `Console output:
Ravi (ravi@example.com)
Neha (neha@example.com) rating 4.8
2 courses since 2025`,
      explanation: '`Student` extends two interfaces at once; `Mentor` achieves the same with `&`. `badge(p: Person)` accepts both because of structural typing: they have `name` and `email`. Small reusable pieces (BaseDocument, Person) avoid copy-pasting fields across models.',
    },
    {
      title: 'interface vs type: declaration merging and unions',
      scenario: 'An app config split across two declarations, and a Course model that uses union and tuple aliases.',
      steps: [
        'Create course.ts',
        'Run it',
        'Try writing `type AppConfig` twice: it is an error (Duplicate identifier)',
      ],
      code: `// Interface vs type alias: what only each one can do

// 1) Only interfaces support declaration merging
interface AppConfig {
  apiUrl: string;
}
interface AppConfig {
  timeoutMs: number; // merged into the same interface
}
const config: AppConfig = { apiUrl: "https://api.example.com", timeoutMs: 5000 };

// 2) Only type aliases can name unions, primitives and tuples
type ID = string | number;
type Coordinates = [lat: number, lng: number];
type Status = "draft" | "published";

// 3) Both can describe objects and nested objects
type Course = {
  id: ID;
  title: string;
  status: Status;
  location?: Coordinates;
  modules: { title: string; lessons: number }[];
};

const course: Course = {
  id: 42,
  title: "TypeScript for MERN",
  status: "published",
  modules: [
    { title: "Basics", lessons: 4 },
    { title: "Type System Power", lessons: 4 },
  ],
};

const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons, 0);
console.log(config);
console.log(\`\${course.title} [\${course.status}] has \${totalLessons} lessons\`);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Interface vs type alias: what only each one can do
const config = { apiUrl: "https://api.example.com", timeoutMs: 5000 };
const course = {
    id: 42,
    title: "TypeScript for MERN",
    status: "published",
    modules: [
        { title: "Basics", lessons: 4 },
        { title: "Type System Power", lessons: 4 },
    ],
};
const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons, 0);
console.log(config);
console.log(\`\${course.title} [\${course.status}] has \${totalLessons} lessons\`);`,
      },
      result: `Console output:
{ apiUrl: 'https://api.example.com', timeoutMs: 5000 }
TypeScript for MERN [published] has 8 lessons`,
      explanation: 'The two `interface AppConfig` blocks merge into one with both properties. `ID`, `Coordinates` and `Status` can only be type aliases because they are a union, a tuple and a literal union. `Course` is a type alias for an object, which works exactly like an interface here.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between an interface and a type alias?',
      a: 'Both describe object shapes and are erased at runtime. Interfaces support declaration merging and use `extends`; they can only describe object/function shapes. Type aliases can name any type: unions, primitives, tuples, mapped and conditional types, and compose with `&`. For plain objects they are mostly interchangeable; pick one convention per codebase.',
      level: 'Easy',
    },
    {
      q: 'What is declaration merging?',
      a: 'When two interfaces with the same name are declared in the same scope, TypeScript merges them into one interface with all properties. Libraries use it so you can extend their types, e.g. adding properties to Express\'s Request or the global Window interface. Type aliases cannot merge (duplicate identifier error).',
      level: 'Medium',
    },
    {
      q: 'What does `readonly` do? Is it enforced at runtime?',
      a: 'It prevents reassigning a property after the object is created, checked only at compile time. It is shallow (nested objects stay mutable) and does not freeze anything at runtime. Use Object.freeze or immutable patterns for runtime protection.',
      level: 'Medium',
    },
    {
      q: 'What is the type of an optional property `age?: number`?',
      a: 'number | undefined. With the exactOptionalPropertyTypes option, you also cannot explicitly assign undefined to it; without that option you can.',
      level: 'Easy',
    },
    {
      q: 'What is an index signature?',
      a: 'A way to type objects whose keys are not known in advance: `{ [key: string]: number }`. Every property must match the value type. Record<string, number> is equivalent shorthand.',
      level: 'Easy',
    },
    {
      q: 'What is structural typing?',
      a: 'TypeScript compares types by their structure (properties and their types), not by their names. Any object that has at least the required properties is compatible, even if it was declared with a different interface or no interface at all. Java and C# use nominal typing instead.',
      level: 'Medium',
    },
    {
      q: 'What is an excess property check?',
      a: 'When an object literal is assigned directly to a typed target, TypeScript reports properties that the target type does not declare (error TS2353). It catches typos. It does not apply when you pass a variable that already holds the object, because of structural typing.',
      level: 'Medium',
    },
    {
      q: 'Difference between `extends` and intersection `&`?',
      a: 'Both combine object types. `interface A extends B` reports an error if a property conflicts with B. `type A = B & C` merges silently: a conflicting property becomes the intersection of both types (often never). extends gives clearer errors and is cached better by the compiler; & works with any types including unions.',
      level: 'Hard',
    },
    {
      q: 'What is Record<K, V>?',
      a: 'A built-in utility type that creates an object type with keys K and values V. Record<string, number> is a dictionary; Record<\'a\' | \'b\', boolean> requires exactly keys a and b. It is implemented as a mapped type: { [P in K]: V }.',
      level: 'Easy',
    },
    {
      q: 'What does noUncheckedIndexedAccess do?',
      a: 'It adds undefined to the type of values read through an index signature or array index: with `Record<string, number>`, `obj[key]` becomes number | undefined. It forces you to handle missing keys, catching real bugs. It is not part of strict, you enable it separately.',
      level: 'Hard',
    },
    {
      q: 'Can a class implement a type alias?',
      a: 'Yes, as long as the type alias describes an object type (not a union). `type Shape = { area(): number }; class Circle implements Shape { ... }` is valid.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Model an e-commerce Customer with a readonly id, name, an array of Address objects (line1, city, pincode, optional landmark) and an optional defaultAddressIndex. Write `shippingLabel(customer)` that prints the default address (index 0 if not set) and handles customers without addresses.',
      hint: 'Use `??` for the default index and check that the address exists.',
      solution: `interface Address {
  line1: string;
  city: string;
  pincode: string;
  landmark?: string;
}

interface Customer {
  readonly id: number;
  name: string;
  addresses: Address[];
  defaultAddressIndex?: number;
}

function shippingLabel(c: Customer): string {
  const addr = c.addresses[c.defaultAddressIndex ?? 0];
  if (!addr) return \`\${c.name}: no address on file\`;
  const landmark = addr.landmark ? \` (near \${addr.landmark})\` : "";
  return \`\${c.name}, \${addr.line1}\${landmark}, \${addr.city} - \${addr.pincode}\`;
}

const customer: Customer = {
  id: 1,
  name: "Karan Mehta",
  addresses: [{ line1: "12 MG Road", city: "Bengaluru", pincode: "560001", landmark: "Metro station" }],
};

console.log(shippingLabel(customer));
console.log(shippingLabel({ id: 2, name: "Sara", addresses: [] }));`,
    },
    {
      task: 'Write `countWords(text)` that returns an object mapping each lowercase word to how many times it appears. Type the return value with Record.',
      hint: 'type WordCount = Record<string, number>; use `(counts[word] ?? 0) + 1`.',
      solution: `type WordCount = Record<string, number>;

function countWords(text: string): WordCount {
  const counts: WordCount = {};
  for (const word of text.toLowerCase().split(/\\s+/).filter(Boolean)) {
    counts[word] = (counts[word] ?? 0) + 1;
  }
  return counts;
}

console.log(countWords("the cat and the hat and the bat"));
// { the: 3, cat: 1, and: 2, hat: 1, bat: 1 }`,
    },
    {
      task: 'Create interfaces Timestamps (createdAt, updatedAt), Post (readonly id, title, body, optional tags) that extends Timestamps, and PublishedPost that extends Post with publishedAt and slug. Create one PublishedPost and print its URL.',
      hint: 'Each interface adds a few properties with extends.',
      solution: `interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

interface Post extends Timestamps {
  readonly id: string;
  title: string;
  body: string;
  tags?: string[];
}

interface PublishedPost extends Post {
  publishedAt: Date;
  slug: string;
}

const post: PublishedPost = {
  id: "p1",
  title: "Learning TypeScript",
  body: "Types make refactoring safe.",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-02"),
  publishedAt: new Date("2025-01-03"),
  slug: "learning-typescript",
};

console.log(\`/blog/\${post.slug}\`, post.tags?.length ?? 0, "tags");`,
    },
    {
      task: 'Create a fully readonly Settings type (theme \'light\' | \'dark\', language, nested notifications). Write `withTheme(settings, theme)` that returns a NEW settings object instead of mutating it.',
      hint: 'Use spread syntax: `{ ...s, theme }`. You can reuse the property type with Settings["theme"].',
      solution: `type Settings = {
  readonly theme: "light" | "dark";
  readonly language: string;
  readonly notifications: { readonly email: boolean; readonly sms: boolean };
};

// Return a NEW object instead of mutating the readonly one
function withTheme(s: Settings, theme: Settings["theme"]): Settings {
  return { ...s, theme };
}

const defaults: Settings = {
  theme: "light",
  language: "en-IN",
  notifications: { email: true, sms: false },
};

const dark = withTheme(defaults, "dark");
console.log(defaults.theme, dark.theme); // light dark`,
    },
  ],
  quiz: [
    {
      question: 'Which feature is available ONLY for interfaces?',
      options: [
        'Optional properties',
        'Declaration merging',
        'readonly properties',
        'Describing object shapes',
      ],
      answer: 1,
      explanation: 'Two interfaces with the same name merge; type aliases cannot.',
    },
    {
      question: 'Which can ONLY be written with a type alias?',
      options: [
        'type ID = string | number',
        'An object with optional fields',
        'An object with readonly fields',
        'An object with methods',
      ],
      answer: 0,
      explanation: 'Unions need a type alias; interfaces describe object shapes only.',
    },
    {
      question: 'What does `Record<"a" | "b", number>` require?',
      options: [
        'Any keys with number values',
        'At least one of a or b',
        'Both keys a and b with number values',
        'An array of numbers',
      ],
      answer: 2,
      explanation: 'Record with a key union makes every key required.',
    },
    {
      question: 'Is `readonly` enforced at runtime?',
      options: [
        'Yes, the object is frozen',
        'Only in strict mode',
        'Only for arrays',
        'No, it is a compile-time check only',
      ],
      answer: 3,
      explanation: 'readonly is erased with the types; use Object.freeze for runtime immutability.',
    },
    {
      question: 'TypeScript compares object types by...',
      options: [
        'Their names (nominal typing)',
        'Their structure (structural typing)',
        'The file they are declared in',
        'Their runtime class',
      ],
      answer: 1,
      explanation: 'TypeScript is structurally typed: matching properties are what count.',
    },
  ],
};
