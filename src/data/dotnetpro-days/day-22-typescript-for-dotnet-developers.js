const consoleHtml = '<p style="font-family:sans-serif">This is the JavaScript that <code>tsc</code> produces. Open the <b>Console</b> tab to see the output.</p>';

export default {
  id: 'day-22-typescript-for-dotnet-developers',
  title: 'TypeScript for .NET Developers: Types, Interfaces, Type Aliases, Unions, Enums, Classes, tsc and tsconfig',
  module: 'Module 6: TypeScript & Angular with .NET',
  day: 22,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'TypeScript is JavaScript with C#-like static types, created by Anders Hejlsberg, the designer of C#. Learn the type system from a .NET developer\'s point of view: basic types, inference, interfaces and type aliases, union and literal types, enums, classes with access modifiers, and how the tsc compiler and tsconfig.json turn TypeScript into JavaScript.',
  objectives: [
    'Explain what TypeScript adds to JavaScript and how its types map to C# types',
    'Use basic types, arrays, tuples, any, unknown and type inference correctly',
    'Model data with interfaces and type aliases, including optional and readonly properties',
    'Use union and literal types, narrowing and enums to model real business states',
    'Write classes with public, private, protected, readonly, abstract and implements, and compile with tsc using tsconfig.json',
  ],
  theory: [
    {
      heading: 'Why TypeScript? A .NET developer\'s view',
      content:
        'JavaScript runs everywhere (browser, Node.js), but it is dynamically typed: `order.totl` (a typo) or passing a string where a number is expected only fails at runtime, often in front of a customer. In C# the compiler catches these mistakes before you run.\n\n**TypeScript (TS)** is a superset of JavaScript from Microsoft that adds **static types**. Every valid JS file is valid TS. You write `.ts` files, the TypeScript compiler **tsc** checks the types and outputs plain `.js`. The types are **erased**: at runtime there is only JavaScript, so types cost nothing at runtime but also do not exist at runtime (no reflection like C#).\n\nWhy .NET teams love it:\n- Angular is written in TypeScript and uses it by default; React and Node projects increasingly use it too.\n- IntelliSense, rename refactoring, go to definition and safe refactoring in VS Code and Visual Studio, just like C#.\n- You can describe your ASP.NET Core API DTOs as TypeScript interfaces, so the front end and back end agree on the data shape.\n\nTypeScript feels familiar: classes, interfaces, generics, enums, access modifiers, async/await and lambdas (`=>`) all exist. The big difference: TypeScript uses **structural typing** (if it has the right shape, it fits), while C# uses **nominal typing** (the declared type name must match).',
      points: [
        'C# string / int, double, decimal / bool -> TS string / number / boolean (only ONE number type, a 64-bit float)',
        'C# List<T> / T[] -> TS T[] or Array<T>; C# Dictionary<string, T> -> TS Record<string, T> or Map<string, T>',
        'C# null -> TS null and undefined (two "empty" values)',
        'C# object / dynamic -> TS unknown (safe) / any (unsafe, switches checking off)',
        'C# void -> TS void; a function that never returns (always throws) -> never',
      ],
    },
    {
      heading: 'Basic types, inference, any and unknown',
      content:
        'Annotate with a colon after the name: `let age: number = 21;`. Like C# `var`, TypeScript **infers** types: `let city = "Pune";` is a string, and `city = 5` is an error. Annotate function parameters and public APIs; let inference handle local variables.\n\n- **Arrays**: `number[]` or `Array<number>`.\n- **Tuples**: fixed-length arrays with a type per position: `[string, number]` (like C# `(string, int)`).\n- **null and undefined**: with `strict` mode on, `string` does NOT accept null. Write `string | null` to allow it, similar to C# nullable reference types (`string?`). Use `?.` and `??` exactly like C#.\n- **any**: turns off type checking for that value. `let x: any = 5; x.foo();` compiles and crashes at runtime. Avoid it.\n- **unknown**: "some value, I do not know its type yet" (for JSON.parse results, API data, catch variables). You must check (narrow) it before use, so it is the safe alternative to any.\n- **void** for functions that return nothing, **never** for functions that never finish normally (always throw) and for impossible cases.',
      syntax: `let name: string = "Asha";
let rollNo = 101;                 // inferred: number
let marks: number[] = [78, 91];
let pair: [string, number] = ["Asha", 77.6];
let middle: string | null = null;
function log(msg: string): void { console.log(msg); }
function fail(msg: string): never { throw new Error(msg); }`,
      tip: 'Turn on "strict": true in every project. Without it, null checks and implicit any are off and TypeScript catches far fewer bugs.',
    },
    {
      heading: 'Interfaces and type aliases',
      content:
        'An **interface** describes the shape of an object: which properties it has and their types. It is the TypeScript equivalent of a C# DTO class or record, but it produces **no JavaScript code**; it exists only for the compiler.\n\n- `email?: string` makes a property **optional** (its type becomes `string | undefined`).\n- `readonly id: number` can be set when the object is created but not changed later (like a C# `init` property).\n- Interfaces can **extend** other interfaces (`interface Manager extends Employee`) and classes can **implement** them.\n- Method signatures: `deposit(amount: number): void;`. Index signatures for dictionaries: `[sku: string]: number;`.\n\nA **type alias** gives a name to any type with `type`: `type Id = number | string;`, `type Point = { x: number; y: number };`, `type Handler = (msg: string) => void;`.\n\n**interface or type?** For object shapes both work. Interfaces can be extended and re-opened (declaration merging), and give nicer error messages. Type aliases are needed for unions, tuples, primitives and function types. A common team rule: interfaces for object shapes and DTOs, type aliases for everything else.\n\n**Structural typing**: a function that takes `Employee` accepts any object that has all Employee properties with the right types, even if it was never declared as Employee. Extra properties are allowed for variables, but an object **literal** written directly with unknown extra properties is flagged (excess property check), which catches typos.',
    },
    {
      heading: 'Union types, literal types and narrowing',
      content:
        'A **union type** says a value can be one of several types: `let id: number | string;`. You can only use members that exist on all parts until you **narrow** the type with a check:\n- `typeof x === "string"` for primitives,\n- `x instanceof Date` for classes,\n- `"email" in user` for property checks,\n- equality checks (`if (status === "Paid")`).\n\nInside the `if` block, TypeScript knows the narrowed type and gives correct IntelliSense, similar to C# pattern matching (`if (obj is string s)`).\n\n**Literal types** restrict a value to exact values: `type OrderStatus = "Pending" | "Shipped" | "Delivered";`. `let s: OrderStatus = "Shiped"` is a compile error. This is often preferred over enums in modern TypeScript because it creates no JavaScript code and matches JSON from APIs directly.\n\nA **discriminated union** combines object types that share a literal property (the discriminant), for example `mode: "UPI" | "CARD" | "COD"`. A `switch` on that property narrows to the exact shape. Adding `const x: never = p;` in the default branch makes the compiler complain if someone adds a new mode and forgets to handle it (exhaustiveness check).',
      syntax: `type Status = "Pending" | "Paid" | "Failed";
type Result =
  | { ok: true; data: string[] }
  | { ok: false; error: string };

function show(r: Result) {
  if (r.ok) console.log(r.data.length);   // r is the success shape
  else console.log(r.error);              // r is the error shape
}`,
    },
    {
      heading: 'Enums',
      content:
        'TypeScript enums look like C# enums:\n- **Numeric enum**: `enum OrderStatus { Pending, Shipped, Delivered }` gives 0, 1, 2. It also creates a **reverse mapping**: `OrderStatus[1]` is `"Shipped"`.\n- **String enum**: `enum PaymentMode { Upi = "UPI", Card = "CARD" }`. Values are readable in logs and JSON, so string enums are usually better for API data. No reverse mapping.\n- **const enum**: values are inlined at compile time and no object is emitted.\n\nUnlike interfaces and types, a normal enum **does produce JavaScript** (an object built by a small function). If your ASP.NET Core API serializes enums as numbers (the System.Text.Json default), use a numeric TS enum with the same order; if you configured `JsonStringEnumConverter`, use a string enum or a string literal union.',
      tip: 'Many style guides prefer string literal unions (type Mode = "UPI" | "CARD") over enums because they emit no code and work directly with JSON. Know both for interviews.',
    },
    {
      heading: 'Classes and access modifiers',
      content:
        'TypeScript classes look very close to C#:\n- `public` (default), `private`, `protected` access modifiers, and `readonly` fields.\n- **Parameter properties**: `constructor(private readonly repo: Repo) {}` declares and assigns a field in one go, like a C# 12 primary constructor. Angular uses this everywhere for dependency injection.\n- `static` members, getters and setters (`get total(): number { ... }`).\n- `abstract` classes and methods, `extends` for inheritance (single inheritance only), `implements` for interfaces, `super(...)` to call the base constructor (like `: base(...)`).\n- `override` keyword (with the `noImplicitOverride` option) like C#.\n\nImportant difference: `private` and `protected` are **compile-time only**. In the emitted JavaScript the field is a normal property, so it is visible at runtime. For true runtime privacy, JavaScript has `#balance` private fields, which TypeScript also supports.\n\nThere is no method overloading by multiple bodies as in C#: you write several overload signatures and ONE implementation that handles all of them.',
      syntax: `class Student {
  private static count = 0;
  constructor(public readonly id: number, private name: string) {
    Student.count++;
  }
  get displayName(): string { return this.name.toUpperCase(); }
}`,
    },
    {
      heading: 'Compiling with tsc and configuring tsconfig.json',
      content:
        'Install the compiler per project: `npm install -D typescript`, then run it with `npx tsc`. `npx tsc --init` creates **tsconfig.json**, the TypeScript equivalent of a .csproj: it tells the compiler which files to compile and how.\n\nKey compiler options:\n- `target`: which JavaScript version to emit (ES2022 for modern browsers and Node).\n- `module` / `moduleResolution`: module system (NodeNext for Node.js, ESNext/Bundler with Vite or Angular).\n- `rootDir` / `outDir`: input and output folders (src -> dist).\n- `strict`: enables all strict checks (strictNullChecks, noImplicitAny, strictPropertyInitialization...). Always true.\n- `noEmitOnError`: no JS output when there are errors.\n- `sourceMap`: map JS back to TS for debugging.\n- `lib`: which built-in APIs exist (DOM, ES2022).\n- `include` / `exclude`: which files are part of the project.\n\nCommands: `npx tsc` (build), `npx tsc --watch` (rebuild on save), `npx tsc --noEmit` (type-check only, great in CI). Errors look like `src/app.ts:5:41 - error TS2322: Type \'string\' is not assignable to type \'number\'.` Every error has a TS code you can search for.\n\nIn real projects you rarely call tsc yourself: Angular CLI, Vite and Next.js compile TypeScript for you, but they read the same tsconfig.json. Node.js 22.6+ can even run simple .ts files directly by stripping types, and `npx tsx app.ts` runs TS without a build step.',
    },
  ],
  examples: [
    {
      title: 'Basic types, inference, tuples and unknown',
      scenario:
        'A college result script stores a student\'s name, roll number, marks and an optional middle name, calculates the average and grade, and reads a value from JSON safely.',
      steps: [
        'In VS Code: create folder ts-basics, run npm init -y and npm install -D typescript',
        'Create src/marks.ts with the TypeScript code',
        'Uncomment the rollNo = "A101" line and see the red underline and the TS2322 error; comment it again',
        'Run npx tsc src/marks.ts --strict --target ES2022 --outDir dist, then node dist/marks.js',
        'Or click Run on the playground, which runs the emitted JavaScript',
      ],
      code: `// src/marks.ts
let studentName: string = "Asha Patil";
let rollNo = 101;                          // inferred as number (like C# var)
let marks: number[] = [78, 91, 64];
let isHosteller: boolean = false;
let middleName: string | null = null;      // like string? in C#

// rollNo = "A101";
// error TS2322: Type 'string' is not assignable to type 'number'.

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function grade(avg: number): string {
  if (avg >= 75) return "Distinction";
  if (avg >= 60) return "First Class";
  return "Pass";
}

const summary: [string, number] = [studentName, average(marks)];   // tuple
console.log(\`\${summary[0]} (roll \${rollNo})\`);
console.log(\`Average: \${summary[1].toFixed(2)} -> \${grade(summary[1])}\`);
console.log(\`Hosteller: \${isHosteller}, middle name: \${middleName ?? "none"}\`);

let raw: unknown = JSON.parse('{"city":"Pune"}');
// raw.city;   // error TS18046: 'raw' is of type 'unknown'.
if (typeof raw === "object" && raw !== null && "city" in raw) {
  console.log(\`City from JSON: \${(raw as { city: string }).city}\`);
}`,
      playground: { html: consoleHtml, js: `// JavaScript that tsc emits for marks.ts (all type annotations removed)
let studentName = "Asha Patil";
let rollNo = 101;
let marks = [78, 91, 64];
let isHosteller = false;
let middleName = null;

function average(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function grade(avg) {
  if (avg >= 75) return "Distinction";
  if (avg >= 60) return "First Class";
  return "Pass";
}

const summary = [studentName, average(marks)];
console.log(\`\${summary[0]} (roll \${rollNo})\`);
console.log(\`Average: \${summary[1].toFixed(2)} -> \${grade(summary[1])}\`);
console.log(\`Hosteller: \${isHosteller}, middle name: \${middleName ?? "none"}\`);

let raw = JSON.parse('{"city":"Pune"}');
if (typeof raw === "object" && raw !== null && "city" in raw) {
  console.log(\`City from JSON: \${raw.city}\`);
}` },
      result: `Asha Patil (roll 101)
Average: 77.67 -> Distinction
Hosteller: false, middle name: none
City from JSON: Pune`,
      explanation:
        'rollNo has no annotation but is inferred as number, so assigning a string is a compile error. The tuple [string, number] fixes the type of each position. (78 + 91 + 64) / 3 = 77.666..., toFixed(2) gives 77.67, which is >= 75. middleName is string | null, and ?? supplies "none" just like C#. JSON.parse returns any, but storing it as unknown forces us to check it is an object with a city property before using it. The playground JS is the same code with every type removed: that is all tsc does at runtime level.',
    },
    {
      title: 'Interfaces, type aliases and structural typing',
      scenario:
        'An HR portal shows employees and managers that come from an ASP.NET Core API. Describe their shapes with interfaces (readonly id, optional email), extend Employee into Manager, and see structural typing accept API data.',
      steps: [
        'Create src/employee.ts with the code',
        'Hover over describe in VS Code to see its signature, and type "emp." to see IntelliSense',
        'Uncomment emp.id = 2 and the bad object to read the TS2540 and TS2741 errors',
        'Compile with npx tsc and run node dist/employee.js (or click Run in the playground)',
      ],
      code: `// src/employee.ts
interface Employee {
  readonly id: number;        // like a C# get-only / init property
  name: string;
  department: string;
  salary: number;
  email?: string;             // optional: string | undefined
}

interface Manager extends Employee {
  reports: EmployeeId[];
}

type EmployeeId = number;                  // type alias for a primitive
type Point = { x: number; y: number };     // type alias for an object shape

const emp: Employee = { id: 1, name: "Ravi Kumar", department: "IT", salary: 65000 };
// emp.id = 2;
// error TS2540: Cannot assign to 'id' because it is a read-only property.
// const bad: Employee = { id: 2, name: "X", department: "HR" };
// error TS2741: Property 'salary' is missing in type ... but required in type 'Employee'.

const mgr: Manager = {
  id: 10, name: "Priya Sharma", department: "IT", salary: 120000,
  email: "priya@shopkart.in", reports: [1, 2, 3],
};

function describe(e: Employee): string {
  const mail = e.email ?? "no email";
  return \`\${e.id} \${e.name} (\${e.department}) - \${mail}\`;
}

console.log(describe(emp));
console.log(describe(mgr));                 // a Manager is an Employee
console.log(\`\${mgr.name} manages \${mgr.reports.length} people\`);

// Structural typing: the shape matters, not the declared name
const fromApi = { id: 7, name: "Neha Singh", department: "HR", salary: 50000, joinedOn: "2024-06-01" };
console.log(describe(fromApi));             // OK: it has every Employee property`,
      playground: { html: consoleHtml, js: `// Interfaces and type aliases disappear completely after compilation
const emp = { id: 1, name: "Ravi Kumar", department: "IT", salary: 65000 };
const mgr = { id: 10, name: "Priya Sharma", department: "IT", salary: 120000, email: "priya@shopkart.in", reports: [1, 2, 3] };

function describe(e) {
  const mail = e.email ?? "no email";
  return \`\${e.id} \${e.name} (\${e.department}) - \${mail}\`;
}

console.log(describe(emp));
console.log(describe(mgr));
console.log(\`\${mgr.name} manages \${mgr.reports.length} people\`);

const fromApi = { id: 7, name: "Neha Singh", department: "HR", salary: 50000, joinedOn: "2024-06-01" };
console.log(describe(fromApi));` },
      result: `1 Ravi Kumar (IT) - no email
10 Priya Sharma (IT) - priya@shopkart.in
Priya Sharma manages 3 people
7 Neha Singh (HR) - no email`,
      explanation:
        'Interfaces and type aliases produce no JavaScript at all: the emitted file contains only the objects and the function. describe accepts a Manager because Manager extends Employee, and it accepts fromApi because that object has every required Employee property (structural typing); the extra joinedOn is fine because it is a variable, not a fresh object literal. emp.email is undefined, so ?? gives "no email".',
    },
    {
      title: 'Union types, discriminated unions and enums',
      scenario:
        'A shopping app shows order ids (numbers from the old system, strings from the new one), order status as an enum, and payment details that depend on the payment mode (UPI id, card last 4 digits, or nothing for cash on delivery).',
      steps: [
        'Create src/orders.ts with the code',
        'Inside describePayment, type "p." in each case and notice IntelliSense shows only that shape\'s properties',
        'Add Wallet = "WALLET" to PaymentMode and a { mode: PaymentMode.Wallet } shape: the never line now gives a compile error until you add a case',
        'Compile and run, or click Run in the playground (it shows the enum code tsc really emits)',
      ],
      code: `// src/orders.ts
enum OrderStatus { Pending, Shipped, Delivered, Cancelled }        // numeric: 0, 1, 2, 3
enum PaymentMode { Upi = "UPI", Card = "CARD", Cod = "COD" }       // string enum

type Id = number | string;                                          // union type

// discriminated union: "mode" tells TypeScript which shape it is
type Payment =
  | { mode: PaymentMode.Upi; upiId: string }
  | { mode: PaymentMode.Card; last4: string }
  | { mode: PaymentMode.Cod };

function formatId(id: Id): string {
  // narrowing with typeof: inside each branch TS knows the exact type
  return typeof id === "number" ? \`#\${id.toString().padStart(5, "0")}\` : id.toUpperCase();
}

function describePayment(p: Payment): string {
  switch (p.mode) {
    case PaymentMode.Upi: return \`UPI (\${p.upiId})\`;        // p is the UPI shape here
    case PaymentMode.Card: return \`Card ending \${p.last4}\`;
    case PaymentMode.Cod: return "Cash on delivery";
    default: {
      const unreachable: never = p;   // compile error if a new mode is not handled
      return unreachable;
    }
  }
}

console.log(formatId(42));
console.log(formatId("ord-a7"));
console.log(OrderStatus.Shipped, OrderStatus[2]);
console.log(describePayment({ mode: PaymentMode.Upi, upiId: "asha@okhdfc" }));
console.log(describePayment({ mode: PaymentMode.Card, last4: "4242" }));
console.log(describePayment({ mode: PaymentMode.Cod }));`,
      playground: { html: consoleHtml, js: `// This is exactly what tsc emits for the two enums
var OrderStatus;
(function (OrderStatus) {
    OrderStatus[OrderStatus["Pending"] = 0] = "Pending";
    OrderStatus[OrderStatus["Shipped"] = 1] = "Shipped";
    OrderStatus[OrderStatus["Delivered"] = 2] = "Delivered";
    OrderStatus[OrderStatus["Cancelled"] = 3] = "Cancelled";
})(OrderStatus || (OrderStatus = {}));
var PaymentMode;
(function (PaymentMode) {
    PaymentMode["Upi"] = "UPI";
    PaymentMode["Card"] = "CARD";
    PaymentMode["Cod"] = "COD";
})(PaymentMode || (PaymentMode = {}));

function formatId(id) {
  return typeof id === "number" ? \`#\${id.toString().padStart(5, "0")}\` : id.toUpperCase();
}

function describePayment(p) {
  switch (p.mode) {
    case PaymentMode.Upi: return \`UPI (\${p.upiId})\`;
    case PaymentMode.Card: return \`Card ending \${p.last4}\`;
    case PaymentMode.Cod: return "Cash on delivery";
    default: return p;
  }
}

console.log(formatId(42));
console.log(formatId("ord-a7"));
console.log(OrderStatus.Shipped, OrderStatus[2]);
console.log(describePayment({ mode: PaymentMode.Upi, upiId: "asha@okhdfc" }));
console.log(describePayment({ mode: PaymentMode.Card, last4: "4242" }));
console.log(describePayment({ mode: PaymentMode.Cod }));` },
      result: `#00042
ORD-A7
1 Delivered
UPI (asha@okhdfc)
Card ending 4242
Cash on delivery`,
      explanation:
        'typeof narrows Id: numbers are zero-padded with padStart, strings upper-cased. OrderStatus.Shipped is 1 and the reverse mapping OrderStatus[2] is "Delivered" (see the emitted IIFE in the playground; string enums have no reverse mapping). The switch on the discriminant p.mode narrows p, so p.upiId is only allowed in the UPI case. The never assignment is the compile-time guarantee that every mode is handled.',
    },
    {
      title: 'Classes: access modifiers, parameter properties, abstract and implements',
      scenario:
        'Model a savings bank account the way you would in C#: an Account interface, an abstract BankAccount base class with a protected balance and an auto-generated account number, and a SavingsAccount that enforces a minimum balance of 1000.',
      steps: [
        'Create src/bank.ts with the code',
        'Uncomment acc.balance = 1000000 and new BankAccount("X") to see TS2445 and TS2511',
        'Compile with npx tsc and open dist/bank.js: access modifiers and abstract are gone',
        'Run node dist/bank.js or click Run in the playground',
      ],
      code: `// src/bank.ts
interface Account {
  readonly accountNo: string;
  deposit(amount: number): void;
}

abstract class BankAccount implements Account {
  private static nextNo = 1001;
  readonly accountNo: string;
  protected balance = 0;

  // "public readonly holder" is a parameter property: declares AND assigns the field
  constructor(public readonly holder: string) {
    this.accountNo = \`SB\${BankAccount.nextNo++}\`;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Amount must be positive");
    this.balance += amount;
  }

  abstract withdraw(amount: number): boolean;

  get currentBalance(): number {
    return this.balance;
  }
}

class SavingsAccount extends BankAccount {
  private readonly minBalance = 1000;

  withdraw(amount: number): boolean {
    if (this.balance - amount < this.minBalance) return false;
    this.balance -= amount;          // allowed: balance is protected
    return true;
  }
}

const acc = new SavingsAccount("Asha");
acc.deposit(5000);
console.log(\`\${acc.accountNo} \${acc.holder}: \${acc.currentBalance}\`);
console.log(\`Withdraw 4500: \${acc.withdraw(4500)}\`);
console.log(\`Withdraw 3000: \${acc.withdraw(3000)}\`);
console.log(\`Balance: \${acc.currentBalance}\`);
// acc.balance = 1000000;
// error TS2445: Property 'balance' is protected and only accessible within class 'BankAccount' and its subclasses.
// new BankAccount("X");
// error TS2511: Cannot create an instance of an abstract class.

const acc2 = new SavingsAccount("Ravi");
console.log(acc2.accountNo);
try {
  acc2.deposit(-50);
} catch (e) {
  console.log((e as Error).message);
}`,
      playground: { html: consoleHtml, js: `// Plain JavaScript version: no access modifiers, no abstract, no implements
class BankAccount {
  static nextNo = 1001;
  balance = 0;

  constructor(holder) {
    this.holder = holder;
    this.accountNo = \`SB\${BankAccount.nextNo++}\`;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Amount must be positive");
    this.balance += amount;
  }

  get currentBalance() { return this.balance; }
}

class SavingsAccount extends BankAccount {
  minBalance = 1000;

  withdraw(amount) {
    if (this.balance - amount < this.minBalance) return false;
    this.balance -= amount;
    return true;
  }
}

const acc = new SavingsAccount("Asha");
acc.deposit(5000);
console.log(\`\${acc.accountNo} \${acc.holder}: \${acc.currentBalance}\`);
console.log(\`Withdraw 4500: \${acc.withdraw(4500)}\`);
console.log(\`Withdraw 3000: \${acc.withdraw(3000)}\`);
console.log(\`Balance: \${acc.currentBalance}\`);

const acc2 = new SavingsAccount("Ravi");
console.log(acc2.accountNo);
try {
  acc2.deposit(-50);
} catch (e) {
  console.log(e.message);
}` },
      result: `SB1001 Asha: 5000
Withdraw 4500: false
Withdraw 3000: true
Balance: 2000
SB1002
Amount must be positive`,
      explanation:
        'The static counter nextNo gives SB1001, then SB1002 for the second account. Withdrawing 4500 would leave 500, below the 1000 minimum, so it returns false; 3000 leaves 2000, so it succeeds. "public readonly holder" in the constructor is a parameter property: it declares and assigns this.holder. protected balance is visible in SavingsAccount but not outside, and abstract prevents creating a BankAccount directly. All of this is compile-time only, as the plain JavaScript in the playground shows.',
    },
    {
      title: 'Setting up tsc and tsconfig.json for a real project',
      scenario:
        'Set up a TypeScript project from scratch the professional way: local compiler, tsconfig.json with strict mode, src and dist folders, npm scripts and watch mode.',
      steps: [
        'Install Node.js LTS from nodejs.org and check node -v in a terminal',
        'Run the commands in section 1, then edit tsconfig.json as in section 2',
        'Create src/app.ts (section 3)',
        'Run npx tsc, then node dist/app.js (section 4)',
        'Change fee: 4999 to "4999", run npx tsc again and read the error; no dist file is written because of noEmitOnError',
      ],
      code: `# ===== 1. Create the project (Node.js 18+ installed) =====
mkdir ts-basics
cd ts-basics
npm init -y
npm install -D typescript
npx tsc --version          # Version 5.x
npx tsc --init             # creates tsconfig.json

# ===== 2. tsconfig.json (trimmed) =====
{
  "compilerOptions": {
    "target": "ES2022",              // JavaScript version to emit
    "module": "NodeNext",            // module system for Node.js
    "moduleResolution": "NodeNext",
    "rootDir": "./src",              // where .ts files are
    "outDir": "./dist",              // where .js files go
    "strict": true,                  // strictNullChecks, noImplicitAny, ... (always on!)
    "noEmitOnError": true,           // do not write .js if there are type errors
    "sourceMap": true,               // debug .ts in VS Code / browser
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}

# ===== 3. src/app.ts =====
type Course = { code: string; title: string; fee: number };

const courses: Course[] = [
  { code: "DN101", title: ".NET Advanced", fee: 14999 },
  { code: "TS201", title: "TypeScript", fee: 4999 },
];

const total: number = courses.reduce((sum, c) => sum + c.fee, 0);
console.log(\`Courses: \${courses.map((c) => c.code).join(", ")}\`);
console.log(\`Total fee: \${total}\`);

# ===== 4. Compile and run =====
npx tsc                    # compiles src/app.ts -> dist/app.js
node dist/app.js
npx tsc --watch            # recompile on every save (like dotnet watch)
npx tsc --noEmit           # type-check only (used in CI)

# ===== 5. package.json scripts =====
"scripts": {
  "build": "tsc",
  "start": "node dist/app.js",
  "typecheck": "tsc --noEmit"
}

# ===== A type error =====
# change fee: 4999 to fee: "4999" and run npx tsc:
# src/app.ts:5:41 - error TS2322: Type 'string' is not assignable to type 'number'.
# Found 1 error in src/app.ts:5`,
      playground: { html: consoleHtml, js: `"use strict";
// dist/app.js produced by: npx tsc
const courses = [
    { code: "DN101", title: ".NET Advanced", fee: 14999 },
    { code: "TS201", title: "TypeScript", fee: 4999 },
];
const total = courses.reduce((sum, c) => sum + c.fee, 0);
console.log(\`Courses: \${courses.map((c) => c.code).join(", ")}\`);
console.log(\`Total fee: \${total}\`);` },
      result: `PS> npx tsc
PS> node dist/app.js
Courses: DN101, TS201
Total fee: 19998`,
      explanation:
        'tsc reads tsconfig.json, compiles everything in src to dist and erases the Course type. A successful build prints nothing. The emitted file starts with "use strict" because strict mode includes alwaysStrict. With the string fee, tsc reports file, line and column (5:41), the code TS2322 and a summary, and with noEmitOnError no broken JS reaches dist.',
    },
  ],
  interview: [
    { q: 'What is TypeScript and how is it related to JavaScript?', a: 'TypeScript is a typed superset of JavaScript from Microsoft. Any valid JavaScript is valid TypeScript. The compiler (tsc) checks types and emits plain JavaScript; types are erased, so there is no runtime cost and no runtime type information.', level: 'Easy' },
    { q: 'What is the difference between any and unknown?', a: 'any disables type checking: you can call any method and assign it anywhere, so errors appear only at runtime. unknown accepts any value but you cannot use it until you narrow it (typeof, instanceof, in, or a type guard). unknown is the safe choice for JSON and external data.', level: 'Easy' },
    { q: 'Interface vs type alias?', a: 'Both describe object shapes. Interfaces can be extended with extends, implemented by classes and merged when declared twice. Type aliases can name any type: unions, tuples, primitives, function types and mapped types, but cannot be re-opened. Common rule: interface for object shapes and DTOs, type for unions and other compositions.', level: 'Medium' },
    { q: 'What is structural typing? How is it different from C#?', a: 'TypeScript compares types by shape: an object is compatible with an interface if it has the required properties with compatible types, regardless of its declared name. C# is nominal: a class must explicitly implement the interface or inherit the type.', level: 'Medium' },
    { q: 'What is a union type and what is narrowing?', a: 'A union (A | B) means a value can be either type. Narrowing is how TypeScript refines it to one type inside a block using checks like typeof, instanceof, in, equality or a discriminant property, so the specific members become available.', level: 'Easy' },
    { q: 'What is a discriminated union and why is it useful?', a: 'A union of object types that share a literal property (kind, type, status). Checking that property narrows to the exact member. It models states safely (loading/success/error, payment modes), and with a never check the compiler forces every case to be handled.', level: 'Medium' },
    { q: 'Numeric enum vs string enum vs literal union?', a: 'Numeric enums auto-number (0, 1, 2) and have a reverse mapping. String enums have readable values and no reverse mapping. Both emit a JavaScript object. A literal union ("A" | "B") emits nothing and matches JSON strings directly; many teams prefer it.', level: 'Medium' },
    { q: 'Are private members in TypeScript really private at runtime?', a: 'No. private and protected are checked only at compile time; the emitted JavaScript has normal properties that can be read at runtime. JavaScript #private fields give real runtime privacy.', level: 'Medium' },
    { q: 'What are parameter properties?', a: 'Constructor parameters with an access modifier or readonly, e.g. constructor(private http: HttpClient) {}. TypeScript declares a field with that name and assigns it automatically. Angular uses this pattern for dependency injection.', level: 'Easy' },
    { q: 'What does "strict": true enable in tsconfig.json?', a: 'A group of checks including strictNullChecks (null/undefined not assignable to other types), noImplicitAny, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, useUnknownInCatchVariables and alwaysStrict. It is recommended for all new projects.', level: 'Medium' },
    { q: 'What is the difference between target and module in tsconfig?', a: 'target sets the JavaScript language version emitted (ES5, ES2022...), so newer syntax may be down-levelled. module sets the module system used for import/export in the output (CommonJS, ESNext, NodeNext).', level: 'Medium' },
    { q: 'Does TypeScript check types at runtime? How do you validate API responses then?', a: 'No, types are erased. A response typed as Student[] is only a promise to the compiler. To validate real data at runtime use type guards or schema libraries like Zod, or trust a contract generated from the API (OpenAPI/NSwag).', level: 'Hard' },
    { q: 'What is the never type used for?', a: 'For values that can never occur: return type of functions that always throw or loop forever, and in exhaustiveness checks where all union cases have been handled, so any unhandled case becomes a compile error.', level: 'Medium' },
    { q: 'Map these C# types to TypeScript: int, decimal, string?, List<string>, Dictionary<string,int>, DateTime.', a: 'int and decimal -> number; string? -> string | null; List<string> -> string[]; Dictionary<string,int> -> Record<string, number> (or Map<string, number>); DateTime -> string in JSON (ISO 8601), converted to Date when needed.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write an interface Product (readonly id, name, price, optional discountPercent, category of type "Electronics" | "Books" | "Fashion") and a function finalPrice(p: Product): number that applies the discount.',
      hint: 'Use p.discountPercent ?? 0.',
      solution: `type Category = "Electronics" | "Books" | "Fashion";

interface Product {
  readonly id: number;
  name: string;
  price: number;
  discountPercent?: number;
  category: Category;
}

function finalPrice(p: Product): number {
  const d = p.discountPercent ?? 0;
  return p.price - (p.price * d) / 100;
}

console.log(finalPrice({ id: 1, name: "Earbuds", price: 2000, discountPercent: 10, category: "Electronics" })); // 1800
console.log(finalPrice({ id: 2, name: "C# in Depth", price: 900, category: "Books" }));                       // 900`,
    },
    {
      task: 'Model an API call state with a discriminated union: loading, success (with data: string[]) and error (with message). Write render(state) that returns a display string and has an exhaustiveness check.',
      hint: 'type State = { status: "loading" } | { status: "success"; data: string[] } | { status: "error"; message: string }',
      solution: `type State =
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };

function render(s: State): string {
  switch (s.status) {
    case "loading": return "Loading...";
    case "success": return \`\${s.data.length} items\`;
    case "error":   return \`Error: \${s.message}\`;
    default: {
      const x: never = s;
      return x;
    }
  }
}`,
    },
    {
      task: 'Write a class Student with a parameter property id (public readonly), a private marks array, a method addMark(m: number) that rejects marks outside 0-100, and a getter average.',
      hint: 'constructor(public readonly id: number, public name: string) {}',
      solution: `class Student {
  private marks: number[] = [];

  constructor(public readonly id: number, public name: string) {}

  addMark(m: number): void {
    if (m < 0 || m > 100) throw new Error(\`Invalid mark \${m}\`);
    this.marks.push(m);
  }

  get average(): number {
    return this.marks.length === 0 ? 0 : this.marks.reduce((a, b) => a + b, 0) / this.marks.length;
  }
}

const s = new Student(1, "Asha");
s.addMark(80); s.addMark(90);
console.log(s.average); // 85`,
    },
    {
      task: 'Convert this C# DTO into a TypeScript interface and a matching string enum: public record OrderDto(int Id, string CustomerName, decimal Total, OrderStatus Status, DateTime PlacedOn, string? Coupon); enum OrderStatus { Pending, Paid, Shipped } serialized with JsonStringEnumConverter.',
      hint: 'System.Text.Json uses camelCase; DateTime arrives as an ISO string; string? becomes string | null.',
      solution: `enum OrderStatus { Pending = "Pending", Paid = "Paid", Shipped = "Shipped" }

interface OrderDto {
  id: number;
  customerName: string;
  total: number;
  status: OrderStatus;
  placedOn: string;        // "2026-11-20T10:15:00Z"
  coupon: string | null;
}`,
    },
    {
      task: 'Create a tsconfig.json for a Node project with sources in src, output in build, ES2022 target, strict mode, source maps and no emit on error. Add npm scripts build, start and typecheck.',
      hint: 'rootDir, outDir, strict, sourceMap, noEmitOnError.',
      solution: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "build",
    "strict": true,
    "sourceMap": true,
    "noEmitOnError": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}

// package.json
"scripts": {
  "build": "tsc",
  "start": "node build/app.js",
  "typecheck": "tsc --noEmit"
}`,
    },
  ],
  quiz: [
    {
      question: 'What happens to interfaces and type annotations when tsc compiles to JavaScript?',
      options: [
        'They become JavaScript classes',
        'They are erased; only plain JavaScript remains',
        'They are kept as comments and checked at runtime',
        'They are converted to JSON schema',
      ],
      answer: 1,
      explanation: 'Types exist only at compile time. That is why runtime validation needs extra code.',
    },
    {
      question: 'Which type forces you to check the value before using it?',
      options: ['any', 'object', 'never', 'unknown'],
      answer: 3,
      explanation: 'unknown accepts anything but allows no operations until narrowed. any allows everything without checks.',
    },
    {
      question: 'Given enum Level { Low, Medium, High }, what is Level[2]?',
      options: ['2', '"High"', '"Medium"', 'undefined'],
      answer: 1,
      explanation: 'Numeric enums get a reverse mapping from value to name; High has value 2.',
    },
    {
      question: 'Which tsconfig option makes null not assignable to string?',
      options: ['strict (via strictNullChecks)', 'target', 'sourceMap', 'outDir'],
      answer: 0,
      explanation: 'strictNullChecks is part of strict. Without it, null and undefined are assignable to every type.',
    },
    {
      question: 'What does constructor(private readonly repo: Repo) {} do?',
      options: [
        'Only declares a constructor parameter',
        'Creates a public field named repo',
        'Declares a private readonly field repo and assigns the argument to it',
        'Makes repo a static property',
      ],
      answer: 2,
      explanation: 'It is a parameter property, the shortcut Angular services and components use for dependency injection.',
    },
  ],
};
