export default {
  id: 'day-08-utility-types-and-advanced-types',
  title: 'Utility Types (Partial, Required, Pick, Omit, Record, ReturnType, Awaited) and Advanced Types (keyof, typeof, Mapped, Conditional, Template Literal, infer)',
  module: 'Module 2: Type System Power',
  day: 8,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Instead of writing similar types again and again, TypeScript lets you derive new types from existing ones. Utility types like Partial, Pick and Omit build API DTOs from one model, and advanced tools like keyof, typeof, mapped, conditional and template literal types let you compute types the way functions compute values.',
  objectives: [
    'Use Partial, Required, Readonly, Pick, Omit and Record to build DTOs from one model',
    'Derive types from functions with ReturnType, Parameters and Awaited',
    'Use keyof, typeof, indexed access and as const to keep one source of truth',
    'Write mapped types and template literal types',
    'Read and write conditional types with infer',
  ],
  theory: [
    {
      heading: 'Why derive types?',
      content: `In a MERN app one \`User\` model leads to many related shapes: the body for creating a user (no \`_id\`), the body for updating (everything optional), the public profile (no password), a form error object, and so on.

Writing each of them by hand means that when you add a field to \`User\`, you must remember to update five types. **Deriving** them keeps a **single source of truth**: change the model once and all derived types follow.

Think of it like **Excel formulas**: you do not type totals by hand, you compute them from the source cells so they update automatically.`,
    },
    {
      heading: 'Object utility types: Partial, Required, Readonly, Pick, Omit, Record',
      content: `- \`Partial<T>\` – all properties optional (PATCH bodies, form drafts)
- \`Required<T>\` – all properties required (removes \`?\`)
- \`Readonly<T>\` – all properties readonly (shallow)
- \`Pick<T, "a" | "b">\` – keep only some properties (public profile, card view)
- \`Omit<T, "password">\` – remove some properties (create DTOs without \`_id\`, responses without password)
- \`Record<K, V>\` – object with keys K and values V (lookup tables)

They compose: \`Partial<Omit<User, "_id">>\` = an update body where any field except _id can be sent.

Union helpers: \`Exclude<"a" | "b" | "c", "a">\` → \`"b" | "c"\`, \`Extract<T, U>\` keeps the members assignable to U, and \`NonNullable<T>\` removes null and undefined.`,
      syntax: `type CreateUser = Omit<User, "_id">;
type UpdateUser = Partial<CreateUser>;
type PublicUser = Pick<User, "_id" | "name">;
type RoleMap = Record<Role, string[]>;`,
      tip: '`Omit` does not check that the key exists: `Omit<User, "pasword">` (typo) silently does nothing. `Pick` does check its keys.',
    },
    {
      heading: 'Function utility types: ReturnType, Parameters, Awaited',
      content: `- \`ReturnType<typeof fn>\` – the type a function returns
- \`Parameters<typeof fn>\` – the parameter types as a tuple
- \`Awaited<T>\` – unwraps a Promise (recursively): \`Awaited<Promise<User>>\` is \`User\`
- \`InstanceType<typeof SomeClass>\` – the type of \`new SomeClass()\`

Notice \`typeof fn\`: utility types take **types**, and \`typeof\` turns a value (the function) into its type.

A common pattern: \`type Profile = Awaited<ReturnType<typeof fetchProfile>>\` gives the resolved data type of an async function without writing it by hand. Redux Toolkit uses \`ReturnType<typeof store.getState>\` to type the whole state.`,
    },
    {
      heading: 'keyof, typeof, indexed access and as const',
      content: `- \`keyof T\` – union of the property names of T: \`keyof { a: 1; b: 2 }\` → \`"a" | "b"\`
- \`typeof value\` (in a type position) – the type of a JavaScript value: \`type Config = typeof config\`
- Indexed access \`T["db"]\` – the type of one property; \`T[number]\` – the element type of an array type
- \`as const\` – makes a value deeply readonly and keeps literal types: \`["pending", "paid"] as const\` is \`readonly ["pending", "paid"]\`

Together they give the classic pattern for enums without \`enum\`:
\`const STATUSES = ["pending", "paid"] as const;\`
\`type Status = (typeof STATUSES)[number]; // "pending" | "paid"\`
You get a runtime array for dropdowns AND a type, from one line.`,
    },
    {
      heading: 'Mapped types and template literal types',
      content: `A **mapped type** loops over keys and builds a new object type, like \`Array.map\` for types:

\`type Nullable<T> = { [K in keyof T]: T[K] | null };\`

\`Partial\`, \`Readonly\` and \`Record\` are all mapped types internally. Modifiers can be added or removed: \`readonly\`, \`?\`, \`-readonly\`, \`-?\` (that is how \`Required\` works).

**Key remapping** with an \`as\` clause renames keys while mapping (see \`Getters<T>\` in the syntax box).

**Template literal types** build string types the same way template strings build strings. A union inside the template expands into every combination, so \`product:\${"created" | "deleted"}\` becomes \`"product:created" | "product:deleted"\`. Helpers: \`Uppercase\`, \`Lowercase\`, \`Capitalize\`, \`Uncapitalize\`.`,
      syntax: `type Optional<T> = { [K in keyof T]?: T[K] };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Route = \`/api/\${"users" | "courses"}\`;
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};`,
    },
    {
      heading: 'Conditional types and infer',
      content: `A **conditional type** chooses a type based on a condition: \`T extends U ? X : Y\`, like a ternary operator for types.

**infer** declares a type variable inside the condition and captures part of a type:
- \`T extends Promise<infer V> ? V : T\` – the value inside a promise
- \`T extends (infer E)[] ? E : never\` – the element of an array
- \`F extends (...args: any[]) => infer R ? R : never\` – this is exactly how \`ReturnType\` is built

When T is a union, conditional types are **distributive**: they are applied to each member separately and the results are joined. \`Exclude<T, U> = T extends U ? never : T\` uses this to remove members (returning \`never\` deletes a member from a union).

You will mostly **read** these in library types (React, Redux, Mongoose, Zod). Writing your own is useful for shared API types, but keep them simple and readable.`,
      tip: 'To stop distribution, wrap both sides in brackets: `[T] extends [string] ? ... : ...`.',
    },
  ],
  examples: [
    {
      title: 'Building API DTOs from one User model',
      scenario: 'A user module needs create, update and public types. Instead of four hand-written interfaces we derive them.',
      steps: [
        'Create user-types.ts',
        'Hover each derived type to see the result',
        'Run it',
      ],
      code: `// Built-in utility types on one User model (a typical MERN backend)
interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "student" | "mentor" | "admin";
  avatarUrl?: string;
}

// POST /users body: the server creates _id
type CreateUserDto = Omit<User, "_id">;

// PATCH /users/:id body: every field optional, _id cannot be changed
type UpdateUserDto = Partial<Omit<User, "_id">>;

// What the API sends back: never the password
type PublicUser = Pick<User, "_id" | "name" | "role" | "avatarUrl">;

// Required removes the "?" (e.g. after a profile is completed)
type CompleteProfile = Required<Pick<User, "name" | "avatarUrl">>;

// Record: a lookup table with a value for EVERY role
const permissions: Record<User["role"], readonly string[]> = {
  student: ["courses:read"],
  mentor: ["courses:read", "courses:write"],
  admin: ["*"],
};

// Readonly: freeze the type of a config object
const settings: Readonly<{ maxUploadMb: number }> = { maxUploadMb: 5 };
// settings.maxUploadMb = 10; // Error: Cannot assign to 'maxUploadMb' because it is a read-only property.

function toPublic(user: User): PublicUser {
  const { _id, name, role, avatarUrl } = user;
  return { _id, name, role, avatarUrl };
}

function applyUpdate(user: User, changes: UpdateUserDto): User {
  return { ...user, ...changes };
}

const newUser: CreateUserDto = { name: "Asha", email: "asha@example.com", password: "hashed!", role: "student" };
const saved: User = { _id: "u1", ...newUser };
const updated = applyUpdate(saved, { role: "mentor" });
const profile: CompleteProfile = { name: "Asha", avatarUrl: "/img/asha.png" };

console.log(toPublic(updated));
console.log(permissions[updated.role], settings.maxUploadMb, profile.avatarUrl);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Record: a lookup table with a value for EVERY role
const permissions = {
    student: ["courses:read"],
    mentor: ["courses:read", "courses:write"],
    admin: ["*"],
};
// Readonly: freeze the type of a config object
const settings = { maxUploadMb: 5 };
// settings.maxUploadMb = 10; // Error: Cannot assign to 'maxUploadMb' because it is a read-only property.
function toPublic(user) {
    const { _id, name, role, avatarUrl } = user;
    return { _id, name, role, avatarUrl };
}
function applyUpdate(user, changes) {
    return { ...user, ...changes };
}
const newUser = { name: "Asha", email: "asha@example.com", password: "hashed!", role: "student" };
const saved = { _id: "u1", ...newUser };
const updated = applyUpdate(saved, { role: "mentor" });
const profile = { name: "Asha", avatarUrl: "/img/asha.png" };
console.log(toPublic(updated));
console.log(permissions[updated.role], settings.maxUploadMb, profile.avatarUrl);`,
      },
      result: `Console output:
{ _id: 'u1', name: 'Asha', role: 'mentor', avatarUrl: undefined }
[ 'courses:read', 'courses:write' ] 5 /img/asha.png`,
      explanation: '`Omit` removes `_id` for the create body, `Partial<Omit<...>>` makes the update body, and `Pick` exposes only safe fields (no password or email). `Record<User["role"], ...>` forces a permissions entry for every role: adding a new role to `User` immediately shows an error here until you add its permissions.',
    },
    {
      title: 'ReturnType, Parameters and Awaited',
      scenario: 'Reuse the types of existing functions instead of copying them.',
      steps: [
        'Create derive-from-functions.ts',
        'Hover `Order`, `CreateOrderArgs` and `Profile`',
        'Run it',
      ],
      code: `// ReturnType, Parameters and Awaited: derive types from existing code
function createOrder(userId: string, items: { sku: string; qty: number }[], coupon?: string) {
  return {
    id: "ord_" + userId,
    items,
    coupon: coupon ?? null,
    status: "created" as const,
  };
}

type Order = ReturnType<typeof createOrder>;
// { id: string; items: {...}[]; coupon: string | null; status: "created" }

type CreateOrderArgs = Parameters<typeof createOrder>;
// [userId: string, items: {...}[], coupon?: string | undefined]

async function fetchProfile(id: string) {
  return { id, name: "Ravi", followers: 120 };
}

type Profile = Awaited<ReturnType<typeof fetchProfile>>;
// { id: string; name: string; followers: number }  (not a Promise)

function logCall(...args: CreateOrderArgs): Order {
  console.log("createOrder called with", args.length, "args");
  return createOrder(...args);
}

const order: Order = logCall("u7", [{ sku: "TS-BOOK", qty: 2 }]);
console.log(order);

fetchProfile("u9").then((p: Profile) => console.log(p.name, p.followers));`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// ReturnType, Parameters and Awaited: derive types from existing code
function createOrder(userId, items, coupon) {
    return {
        id: "ord_" + userId,
        items,
        coupon: coupon ?? null,
        status: "created",
    };
}
// [userId: string, items: {...}[], coupon?: string | undefined]
async function fetchProfile(id) {
    return { id, name: "Ravi", followers: 120 };
}
// { id: string; name: string; followers: number }  (not a Promise)
function logCall(...args) {
    console.log("createOrder called with", args.length, "args");
    return createOrder(...args);
}
const order = logCall("u7", [{ sku: "TS-BOOK", qty: 2 }]);
console.log(order);
fetchProfile("u9").then((p) => console.log(p.name, p.followers));`,
      },
      result: `Console output:
createOrder called with 2 args
{
  id: 'ord_u7',
  items: [ { sku: 'TS-BOOK', qty: 2 } ],
  coupon: null,
  status: 'created'
}
Ravi 120`,
      explanation: '`typeof createOrder` turns the function value into a type, then `ReturnType` and `Parameters` extract parts of it. `Awaited<ReturnType<typeof fetchProfile>>` gives the resolved object, not the Promise. If `createOrder` changes, every derived type updates automatically. `status: "created" as const` keeps the literal type in the return value.',
    },
    {
      title: 'keyof, typeof, indexed access and as const',
      scenario: 'Order statuses and app config defined once as values, with types derived from them.',
      steps: [
        'Create derive-from-values.ts',
        'Run it',
        'Try `isEnabled("chat")` and read the error',
      ],
      code: `// keyof, typeof, indexed access and "as const": one source of truth
const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];
// "pending" | "paid" | "shipped" | "delivered"

const config = {
  port: 5000,
  db: { uri: "mongodb://localhost:27017/shop", poolSize: 10 },
  features: { reviews: true, wishlist: false },
};

type Config = typeof config;                 // type from a value
type DbConfig = Config["db"];                // indexed access: { uri: string; poolSize: number }
type FeatureName = keyof Config["features"]; // "reviews" | "wishlist"

function isEnabled(feature: FeatureName): boolean {
  return config.features[feature];
}

function nextStatus(current: OrderStatus): OrderStatus | null {
  const i = ORDER_STATUSES.indexOf(current);
  return ORDER_STATUSES[i + 1] ?? null;
}

const db: DbConfig = config.db;
console.log("wishlist enabled?", isEnabled("wishlist"));
console.log("after paid:", nextStatus("paid"), "| after delivered:", nextStatus("delivered"));
console.log("pool size:", db.poolSize, "| statuses:", ORDER_STATUSES.join(" -> "));`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// keyof, typeof, indexed access and "as const": one source of truth
const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered"];
// "pending" | "paid" | "shipped" | "delivered"
const config = {
    port: 5000,
    db: { uri: "mongodb://localhost:27017/shop", poolSize: 10 },
    features: { reviews: true, wishlist: false },
};
function isEnabled(feature) {
    return config.features[feature];
}
function nextStatus(current) {
    const i = ORDER_STATUSES.indexOf(current);
    return ORDER_STATUSES[i + 1] ?? null;
}
const db = config.db;
console.log("wishlist enabled?", isEnabled("wishlist"));
console.log("after paid:", nextStatus("paid"), "| after delivered:", nextStatus("delivered"));
console.log("pool size:", db.poolSize, "| statuses:", ORDER_STATUSES.join(" -> "));`,
      },
      result: `Console output:
wishlist enabled? false
after paid: shipped | after delivered: null
pool size: 10 | statuses: pending -> paid -> shipped -> delivered`,
      explanation: '`as const` keeps `ORDER_STATUSES` as a readonly tuple of literals, and `(typeof ORDER_STATUSES)[number]` turns it into a union. `typeof config` copies the config object\'s type, `Config["db"]` reads one property\'s type, and `keyof Config["features"]` lists the feature names. Add a feature to the object and the type updates automatically.',
    },
    {
      title: 'Mapped types with key remapping and template literal types',
      scenario: 'Generate getter types, nullable drafts, form error types and event names from a Product type.',
      steps: [
        'Create mapped.ts',
        'Hover `Getters<Product>`',
        'Run it',
      ],
      code: `// Mapped types + template literal types
type Product = { title: string; price: number; inStock: boolean };

// Mapped type: transform every property of T
type Nullable<T> = { [K in keyof T]: T[K] | null };
type FormErrors<T> = { [K in keyof T]?: string };

// Key remapping with "as" + template literal types
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
// { getTitle: () => string; getPrice: () => number; getInStock: () => boolean }

type ProductEvent = \`product:\${"created" | "updated" | "deleted"}\`;
// "product:created" | "product:updated" | "product:deleted"

type CssSize = \`\${number}\${"px" | "rem" | "%"}\`;

function makeGetters<T extends object>(obj: T): Getters<T> {
  const result: Record<string, () => unknown> = {};
  for (const key of Object.keys(obj) as (keyof T & string)[]) {
    result["get" + key[0].toUpperCase() + key.slice(1)] = () => obj[key];
  }
  return result as Getters<T>;
}

const p: Product = { title: "Desk Lamp", price: 1299, inStock: true };
const g = makeGetters(p);
console.log(g.getTitle(), g.getPrice() * 2, g.getInStock());

const draft: Nullable<Product> = { title: "Chair", price: null, inStock: null };
const errors: FormErrors<Product> = { price: "Price is required" };
const evt: ProductEvent = "product:updated";
const width: CssSize = "250px";
console.log(draft, errors, evt, width);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `function makeGetters(obj) {
    const result = {};
    for (const key of Object.keys(obj)) {
        result["get" + key[0].toUpperCase() + key.slice(1)] = () => obj[key];
    }
    return result;
}
const p = { title: "Desk Lamp", price: 1299, inStock: true };
const g = makeGetters(p);
console.log(g.getTitle(), g.getPrice() * 2, g.getInStock());
const draft = { title: "Chair", price: null, inStock: null };
const errors = { price: "Price is required" };
const evt = "product:updated";
const width = "250px";
console.log(draft, errors, evt, width);`,
      },
      result: `Console output:
Desk Lamp 2598 true
{ title: 'Chair', price: null, inStock: null } { price: 'Price is required' } product:updated 250px`,
      explanation: '`[K in keyof T]` loops over keys. The `as` clause with the template `get${Capitalize<string & K>}` renames each key, so `g.getPrice()` is known to return a number. `string & K` is needed because keys can also be numbers or symbols. `ProductEvent` expands to three string literals and `CssSize` accepts any number followed by px, rem or %.',
    },
    {
      title: 'Conditional types and infer',
      scenario: 'Extract element, promise, argument and API data types, and prove the results with compile-time tests.',
      steps: [
        'Create conditional.ts',
        'Run `npx tsc --noEmit --strict conditional.ts` (no errors)',
        'Run it',
      ],
      code: `// Conditional types and infer
type IsString<T> = T extends string ? "yes" : "no";
type A = IsString<"hi">;   // "yes"
type B = IsString<42>;     // "no"

// infer: pull a type out of another type
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T;
type FirstArg<F> = F extends (first: infer A, ...rest: any[]) => any ? A : never;

type E1 = ElementOf<string[]>;                // string
type E2 = UnwrapPromise<Promise<number[]>>;   // number[]
type E3 = FirstArg<(id: string, n: number) => void>; // string

// Distributive conditional types: applied to each union member
type NonNull<T> = T extends null | undefined ? never : T; // same idea as NonNullable
type C = NonNull<string | null | undefined>;  // string

// Real use: pick the data type out of an API response type
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };
type DataOf<R> = R extends { success: true; data: infer D } ? D : never;
type UsersData = DataOf<ApiResponse<{ id: string }[]>>; // { id: string }[]

// Compile-time "tests": these lines only compile if the types are right
const a: A = "yes";
const b: B = "no";
const e1: E1 = "text";
const e2: E2 = [1, 2];
const e3: E3 = "user-1";
const c: C = "not null";
const users: UsersData = [{ id: "u1" }];

console.log(a, b, e1, e2, e3, c, users);`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Compile-time "tests": these lines only compile if the types are right
const a = "yes";
const b = "no";
const e1 = "text";
const e2 = [1, 2];
const e3 = "user-1";
const c = "not null";
const users = [{ id: "u1" }];
console.log(a, b, e1, e2, e3, c, users);`,
      },
      result: `Console output:
yes no text [ 1, 2 ] user-1 not null [ { id: 'u1' } ]

The type tests really check something. Assigning a wrong value, for example \`const wrong1: IsString<42> = "yes"\` and \`const wrong2: ElementOf<number[]> = "5"\`, gives:
error TS2322: Type '"yes"' is not assignable to type '"no"'.
error TS2322: Type 'string' is not assignable to type 'number'.`,
      explanation: '`infer E` captures the element type, `infer V` the promise value, `infer A` the first parameter and `infer D` the data of the success branch. `NonNull` is distributive: it runs for `string`, `null` and `undefined` separately and keeps only `string`. The variables at the bottom are type tests: if a conditional type computed the wrong result, the file would not compile.',
    },
  ],
  interview: [
    {
      q: 'What do Partial, Required and Readonly do?',
      a: 'They are mapped utility types. Partial<T> makes all properties optional, Required<T> makes all properties required (removes ?), Readonly<T> makes all properties readonly. All three are shallow.',
      level: 'Easy',
    },
    {
      q: 'Difference between Pick and Omit?',
      a: 'Pick<T, K> creates a type with only the listed keys; Omit<T, K> creates a type with all keys except the listed ones. Pick checks that the keys exist in T; Omit accepts any string keys (a typo does not error).',
      level: 'Easy',
    },
    {
      q: 'What is Record<K, V> used for?',
      a: 'To type an object whose keys are K and values are V: dictionaries (Record<string, number>) or exhaustive lookup tables (Record<Role, Permission[]>), where every key of the union must be present.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between `keyof` and `typeof` in types?',
      a: 'keyof takes a type and returns the union of its keys. typeof (in a type position) takes a value and returns its type. They are often combined: `keyof typeof config` gives the keys of the config object.',
      level: 'Medium',
    },
    {
      q: 'How do you get the resolved type of an async function\'s result?',
      a: 'Awaited<ReturnType<typeof fn>>. ReturnType gives Promise<X> and Awaited unwraps it (recursively, also for nested promises/thenables).',
      level: 'Medium',
    },
    {
      q: 'How do you create a union type from an array of strings?',
      a: `const ROLES = ['admin', 'user'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'user'
as const keeps literal types; [number] indexes every element.`,
      level: 'Medium',
    },
    {
      q: 'What is a mapped type? Write Partial yourself.',
      a: 'A type that iterates over keys to build a new object type. type MyPartial<T> = { [K in keyof T]?: T[K] }. Modifiers ? and readonly can be added or removed with + / -.',
      level: 'Medium',
    },
    {
      q: 'What is a conditional type?',
      a: 'A type of the form `T extends U ? X : Y` that resolves to X if T is assignable to U, otherwise Y. With a union T it distributes over each member. Used to build Exclude, Extract, NonNullable, ReturnType and so on.',
      level: 'Medium',
    },
    {
      q: 'What does `infer` do? Implement ReturnType.',
      a: `infer declares a type variable inside the extends clause of a conditional type, capturing part of the matched type.
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;`,
      level: 'Hard',
    },
    {
      q: 'What are template literal types? Give a real use.',
      a: 'String literal types built with template syntax: type Event = `user:${\'login\' | \'logout\'}` gives \'user:login\' | \'user:logout\'. Uses: typed event names, CSS units, route strings, key remapping in mapped types like `get${Capitalize<K>}`.',
      level: 'Hard',
    },
    {
      q: 'What is a distributive conditional type and how do you prevent distribution?',
      a: 'When the checked type is a naked type parameter and receives a union, the condition is applied to each member and the results are unioned. Exclude<\'a\' | \'b\', \'a\'> works this way. Wrap in a tuple to prevent it: [T] extends [U] ? X : Y.',
      level: 'Hard',
    },
    {
      q: 'Implement DeepReadonly<T>.',
      a: `type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] };
It recursively applies readonly to nested objects (functions are objects too, so production versions often special-case them).`,
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Given a Product interface (_id, title, price, optional description, createdAt), derive CreateProductInput (no _id or createdAt), UpdateProductInput (all optional) and ProductCard (_id, title, price). Write `toCard(product)`.',
      hint: 'Omit, Partial and Pick.',
      solution: `interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  createdAt: Date;
}

type CreateProductInput = Omit<Product, "_id" | "createdAt">;
type UpdateProductInput = Partial<CreateProductInput>;
type ProductCard = Pick<Product, "_id" | "title" | "price">;

function toCard(p: Product): ProductCard {
  return { _id: p._id, title: p.title, price: p.price };
}

const input: CreateProductInput = { title: "Water Bottle", price: 349 };
const product: Product = { ...input, _id: "p1", createdAt: new Date() };
const patch: UpdateProductInput = { price: 299 };

console.log(toCard({ ...product, ...patch })); // { _id: 'p1', title: 'Water Bottle', price: 299 }`,
    },
    {
      task: 'Define user roles once as an `as const` array, derive the Role union, create a labels object checked with `satisfies Record<Role, string>`, and write a type guard `isRole(value: string)`.',
      hint: 'type Role = (typeof ROLES)[number]; cast ROLES to readonly string[] for includes().',
      solution: `const ROLES = ["student", "mentor", "admin"] as const;
type Role = (typeof ROLES)[number];

const ROLE_LABELS = {
  student: "Student",
  mentor: "Mentor",
  admin: "Administrator",
} satisfies Record<Role, string>;

function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

for (const r of ["mentor", "guest"]) {
  console.log(r, "->", isRole(r) ? ROLE_LABELS[r] : "unknown role");
}
// mentor -> Mentor
// guest -> unknown role`,
    },
    {
      task: 'Write recursive mapped types DeepReadonly<T> and DeepPartial<T>, and use them for an app config and a config override.',
      hint: 'Check `T[K] extends object` and recurse.',
      solution: `// DeepReadonly and DeepPartial with recursive mapped types
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type AppConfig = {
  server: { port: number; host: string };
  db: { uri: string; options: { poolSize: number } };
};

const config: DeepReadonly<AppConfig> = {
  server: { port: 5000, host: "localhost" },
  db: { uri: "mongodb://localhost/app", options: { poolSize: 5 } },
};
// config.db.options.poolSize = 10; // Error: read-only property

const override: DeepPartial<AppConfig> = { db: { options: { poolSize: 20 } } };

console.log(config.db.options.poolSize, override.db?.options?.poolSize); // 5 20`,
    },
    {
      task: 'Given a type mapping API routes to their response arrays, create a template literal type `cache:<route>` and a conditional type `ItemOf<R>` (the array element type), and write `getFirst(route)` returning the correct item type.',
      hint: 'ApiRoutes[R] extends (infer Item)[] ? Item : never',
      solution: `type ApiRoutes = {
  "/users": { id: string; name: string }[];
  "/courses": { id: number; title: string }[];
};

// Template literal type built from the keys
type RouteKey = keyof ApiRoutes;
type CacheKey = \`cache:\${RouteKey}\`;

// Conditional + infer: the element type of each route's array
type ItemOf<R extends RouteKey> = ApiRoutes[R] extends (infer Item)[] ? Item : never;

const fakeDb: ApiRoutes = {
  "/users": [{ id: "u1", name: "Asha" }],
  "/courses": [{ id: 1, title: "TypeScript" }],
};

function getFirst<R extends RouteKey>(route: R): ItemOf<R> | undefined {
  return (fakeDb[route] as ItemOf<R>[])[0];
}

const key: CacheKey = "cache:/courses";
const firstCourse = getFirst("/courses"); // { id: number; title: string } | undefined
console.log(key, firstCourse?.title); // cache:/courses TypeScript`,
    },
  ],
  quiz: [
    {
      question: 'Which type is best for a PATCH request body that can update any field except _id?',
      options: [
        'Pick<User, \'_id\'>',
        'Required<User>',
        'Partial<Omit<User, \'_id\'>>',
        'Readonly<User>',
      ],
      answer: 2,
      explanation: 'Omit removes _id and Partial makes the rest optional.',
    },
    {
      question: 'What is `keyof { name: string; age: number }`?',
      options: [
        'string | number',
        '\'name\' | \'age\'',
        '{ name; age }',
        'string[]',
      ],
      answer: 1,
      explanation: 'keyof gives the union of property names.',
    },
    {
      question: 'What does `Awaited<Promise<Promise<number>>>` resolve to?',
      options: [
        'number',
        'Promise<number>',
        'unknown',
        'never',
      ],
      answer: 0,
      explanation: 'Awaited unwraps promises recursively.',
    },
    {
      question: 'In `T extends Promise<infer V> ? V : T`, what is infer V doing?',
      options: [
        'Declaring a generic default',
        'Converting V to a promise',
        'Checking V at runtime',
        'Capturing the type inside the Promise',
      ],
      answer: 3,
      explanation: 'infer introduces a type variable that captures part of the matched type.',
    },
    {
      question: 'What does the template literal type `on${\'Click\' | \'Hover\'}` produce?',
      options: [
        'string',
        '\'onClick\' | \'onHover\'',
        '\'on\' | \'Click\' | \'Hover\'',
        'A runtime string',
      ],
      answer: 1,
      explanation: 'Template literal types expand unions into every combination.',
    },
  ],
};
