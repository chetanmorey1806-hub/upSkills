const consoleHtml = '<p style="font-family:sans-serif">This is the JavaScript version of the TypeScript code. Open the <b>Console</b> tab to see the output.</p>';

export default {
  id: 'day-23-typescript-generics-utility-types-fetch-dotnet-api',
  title: 'TypeScript Advanced: Generics, Utility Types, Modules, async/await with fetch and Typed .NET Web API Responses',
  module: 'Module 6: TypeScript & Angular with .NET',
  day: 23,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Write reusable, type-safe code with generics, reshape types with utility types (Partial, Pick, Omit, Record, Readonly), split code into ES modules, and call an ASP.NET Core Web API with async/await and fetch. Describe the API\'s JSON with DTO interfaces, handle errors and ProblemDetails, and keep the front end in sync with the C# contracts.',
  objectives: [
    'Write generic functions, interfaces and classes with constraints and keyof, and compare them with C# generics',
    'Use Partial, Required, Readonly, Pick, Omit and Record to create DTO variants without repeating code',
    'Organise code with named and default exports, import type and barrel files',
    'Call a .NET Web API with async/await and fetch, handle non-2xx responses and CORS',
    'Type API responses with DTO interfaces, PagedResult<T>, ProblemDetails and type guards',
  ],
  theory: [
    {
      heading: 'Generics: reusable code that keeps its types',
      content:
        'You already know generics from C#: `List<T>`, `Task<T>`, `IRepository<T>`. TypeScript generics work the same way at compile time. A type parameter `<T>` is a placeholder filled in by the caller, so one function or class works for students, products and orders while keeping full type checking.\n\n- **Generic functions**: `function first<T>(items: T[]): T | undefined`. Usually you do not write `first<number>(...)`, because TypeScript **infers** T from the arguments.\n- **Generic interfaces and types**: `interface ApiResponse<T> { success: boolean; data: T; }`, `type Paged<T> = { items: T[]; totalCount: number }`.\n- **Generic classes**: `class InMemoryRepository<T extends Entity>`.\n- **Constraints** with `extends`: `T extends { id: number }` means "T must at least have a numeric id", like C#\'s `where T : IEntity`.\n- **keyof and indexed access**: `K extends keyof T` limits a parameter to T\'s property names, and `T[K]` is the type of that property. `pluck(students, "name")` returns `string[]`, and a typo like `"nmae"` is a compile error.\n- **Default type parameters**: `interface ApiResponse<T = unknown>`.\n\nDifference from C#: TypeScript generics are **erased** at runtime. You cannot write `new T()` or `typeof T` inside a generic function; C# keeps generic type information at runtime (reified generics), TypeScript does not.',
      syntax: `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}
class Repo<T extends { id: number }> {
  private items = new Map<number, T>();
  add(item: T) { this.items.set(item.id, item); }
}`,
      tip: 'If you find yourself writing any to make a helper "work for every type", you almost always want a generic instead.',
    },
    {
      heading: 'Utility types: Partial, Required, Readonly, Pick, Omit, Record',
      content:
        'Utility types are built-in generic types that create new types from existing ones, so you define the main model once and derive the DTO variants:\n\n- `Partial<T>`: every property optional. Perfect for PATCH bodies and form state: `Partial<Student>`.\n- `Required<T>`: every property required (removes `?`).\n- `Readonly<T>`: every property readonly; use for state that must not be mutated (Angular signals, Redux).\n- `Pick<T, "a" | "b">`: only the listed properties: `Pick<Student, "id" | "name">` for a dropdown.\n- `Omit<T, "a">`: everything except the listed properties: `Omit<Student, "id">` for a create DTO where the server generates the id.\n- `Record<K, V>`: an object type with keys K and values V, like C# `Dictionary<K, V>`: `Record<string, number>` or `Record<"CSE" | "ECE", number>` (then every listed key is required).\n\nOthers worth knowing: `ReturnType<typeof fn>`, `Parameters<typeof fn>`, `NonNullable<T>`, `Awaited<Promise<T>>`, `Exclude<U, X>` and `Extract<U, X>` for unions. They can be combined: `Partial<Omit<Student, "id">>` is "any subset of the fields except id".\n\nAll of them are compile-time only: they create no JavaScript.',
      syntax: `interface Student { id: number; name: string; email: string; cgpa: number }
type CreateStudentDto = Omit<Student, "id">;
type UpdateStudentDto = Partial<CreateStudentDto>;
type StudentOption = Pick<Student, "id" | "name">;
type MarksBySubject = Record<string, number>;`,
    },
    {
      heading: 'Modules: export, import, default exports and import type',
      content:
        'Real applications are split into many files. Modern TypeScript uses **ES modules**: every file that has a top-level `import` or `export` is a module with its own scope (nothing leaks into the global scope, much like each C# file having its own namespace and access control).\n\n- **Named exports**: `export function formatInr(...)`, `export interface Product`. Import with braces: `import { formatInr } from "./utils/format";`. Names must match (you can rename: `import { formatInr as inr }`).\n- **Default export**: one per file, `export default function withGst(...)`. Import without braces, with any name: `import withGst from "./utils/format";`. Many teams prefer named exports because renames and auto-imports work better.\n- **Namespace import**: `import * as fmt from "./utils/format";` then `fmt.formatInr(...)`.\n- **Type-only imports**: `import type { Product } from "./models";` is removed completely from the JavaScript, making it clear it is only used for types.\n- **Re-exports / barrel files**: an `index.ts` that does `export * from "./format";` so others can import from one folder path.\n\nModule resolution: with Angular and Vite (`"moduleResolution": "Bundler"`) you write `"./utils/format"` without an extension. With pure Node ESM (`NodeNext`) you must write `"./utils/format.js"`, even in a .ts file, because that is the file that will exist at runtime. `paths` in tsconfig allows aliases like `@app/models`.',
      tip: 'Old TypeScript code may use "namespace" blocks and /// <reference> comments. In new code always use ES modules.',
    },
    {
      heading: 'async/await with fetch: calling a .NET Web API',
      content:
        '`fetch` is the browser\'s built-in HTTP client (Angular has its own HttpClient, React apps often use fetch or axios). It returns a **Promise**, the JavaScript equivalent of C#\'s `Task`. `async`/`await` works almost exactly like in C#: an `async` function returns `Promise<T>` and `await` pauses until the promise settles.\n\nThe typical steps:\n1. `const res = await fetch(url, { method, headers, body })`.\n2. **Check `res.ok`** (true for 200-299). Important: fetch only rejects on network failures (server down, DNS, CORS blocked). A 404 or 500 is a successful fetch with `res.ok === false`, so you must check it yourself and throw.\n3. `await res.json()` parses the body. It returns `Promise<any>`, so you state the type you expect: `(await res.json()) as StudentDto[]`, or assign it to `unknown` and validate.\n4. Send JSON with `body: JSON.stringify(dto)` and header `Content-Type: application/json`, otherwise ASP.NET Core returns **415 Unsupported Media Type**.\n5. Wrap calls in `try/catch` (like C#) and show friendly messages.\n\n**CORS**: when the Angular app on http://localhost:4200 calls the API on https://localhost:7001, they are different origins. The browser blocks the response unless the API sends CORS headers: `builder.Services.AddCors(...)` with `WithOrigins("http://localhost:4200")` and `app.UseCors(...)`. A CORS error shows up in the browser console and as a rejected fetch (TypeError: Failed to fetch).\n\nTo cancel a request (user leaves the page), pass `signal` from an `AbortController`, like a C# CancellationToken. `Promise.all([...])` runs several calls in parallel, like `Task.WhenAll`.',
      syntax: `async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return (await res.json()) as T;
}`,
    },
    {
      heading: 'Typing API responses with DTO interfaces',
      content:
        'Describe the JSON your ASP.NET Core API returns with TypeScript interfaces that mirror the C# DTOs. Rules to get them right:\n\n- **camelCase**: System.Text.Json writes `CustomerName` as `customerName` by default.\n- **Numbers**: int, long, double and decimal all become `number` (very large longs and exact decimals can lose precision; send money as a string or in paise if that matters).\n- **Dates**: `DateTime`/`DateOnly` arrive as ISO strings (`"2026-11-20T10:15:00Z"`), not `Date` objects. Type them as `string` in the DTO and convert with `new Date(...)` when mapping to a front-end model.\n- **Nullable**: `string?` in C# -> `string | null` in TS (the property is present with value null).\n- **Enums**: numbers by default; strings if the API uses `JsonStringEnumConverter`.\n- **Collections**: `List<T>` -> `T[]`, `Dictionary<string, int>` -> `Record<string, number>`.\n- **Wrappers**: write one generic `PagedResult<T>` and one `ProblemDetails` interface (title, status, detail, errors) for the standard error format of `[ApiController]` and `AddProblemDetails()`.\n\n`as T` is a promise to the compiler, not a check. If the API changes, the types silently lie. Protect yourself with **type guards** (`function isProblemDetails(x: unknown): x is ProblemDetails`) or a schema library such as Zod for critical data, and in bigger projects **generate** the TypeScript types from the API\'s OpenAPI (Swagger) document with NSwag or openapi-typescript so the contracts never drift.\n\nA `Result<T>`-style discriminated union (`{ ok: true; data: T } | { ok: false; problem: ProblemDetails }`) makes callers handle both success and error, without try/catch everywhere.',
    },
  ],
  examples: [
    {
      title: 'Generic functions, constraints, keyof and a generic repository',
      scenario:
        'An online course portal needs reusable helpers: find the first item matching a condition, extract one property from a list, and an in-memory repository that works for any entity with an id, just like a C# generic repository.',
      steps: [
        'Create src/generics.ts in your ts-basics project (from Day 22)',
        'Hover over cheap and over the pluck(...) result in VS Code: TypeScript inferred Course and string[]',
        'Uncomment the two error lines at the bottom and read TS2345 and TS2344',
        'Run npx tsc and node dist/generics.js, or click Run in the playground',
      ],
      code: `// src/generics.ts
interface ApiResponse<T> {            // generic interface, like C# ApiResponse<T>
  success: boolean;
  data: T;
  message?: string;
}

interface Entity {
  id: number;
}

interface Course extends Entity {
  title: string;
  fee: number;
}

// generic function: T is inferred from the arguments
function firstOrDefault<T>(items: T[], predicate: (item: T) => boolean, fallback: T): T {
  for (const item of items) {
    if (predicate(item)) return item;
  }
  return fallback;
}

// K must be one of T's property names; the result type is T[K][]
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

// generic class with a constraint, like: class Repo<T> where T : IEntity
class InMemoryRepository<T extends Entity> {
  private items = new Map<number, T>();

  add(item: T): void {
    this.items.set(item.id, item);
  }

  getById(id: number): T | undefined {
    return this.items.get(id);
  }

  getAll(): T[] {
    return [...this.items.values()];
  }

  get count(): number {
    return this.items.size;
  }
}

const repo = new InMemoryRepository<Course>();
repo.add({ id: 1, title: "C# Basics", fee: 2999 });
repo.add({ id: 2, title: "ASP.NET Core", fee: 4999 });
repo.add({ id: 3, title: "Angular", fee: 3999 });

const cheap = firstOrDefault(repo.getAll(), (c) => c.fee < 3500, { id: 0, title: "None", fee: 0 });
console.log(\`Count: \${repo.count}\`);
console.log(\`First under 3500: \${cheap.title}\`);
console.log(\`Titles: \${pluck(repo.getAll(), "title").join(", ")}\`);
console.log(\`Course 2: \${repo.getById(2)?.title ?? "not found"}\`);
console.log(\`Course 9: \${repo.getById(9)?.title ?? "not found"}\`);

const response: ApiResponse<Course[]> = { success: true, data: repo.getAll() };
console.log(\`Response ok: \${response.success}, items: \${response.data.length}\`);

// pluck(repo.getAll(), "price");
// error TS2345: Argument of type '"price"' is not assignable to parameter of type 'keyof Course'.
// new InMemoryRepository<string>();
// error TS2344: Type 'string' does not satisfy the constraint 'Entity'.`,
      playground: { html: consoleHtml, js: `// Emitted JavaScript: all <T> parameters and constraints are erased
function firstOrDefault(items, predicate, fallback) {
  for (const item of items) {
    if (predicate(item)) return item;
  }
  return fallback;
}

function pluck(items, key) {
  return items.map((item) => item[key]);
}

class InMemoryRepository {
  items = new Map();

  add(item) {
    this.items.set(item.id, item);
  }

  getById(id) {
    return this.items.get(id);
  }

  getAll() {
    return [...this.items.values()];
  }

  get count() {
    return this.items.size;
  }
}

const repo = new InMemoryRepository();
repo.add({ id: 1, title: "C# Basics", fee: 2999 });
repo.add({ id: 2, title: "ASP.NET Core", fee: 4999 });
repo.add({ id: 3, title: "Angular", fee: 3999 });

const cheap = firstOrDefault(repo.getAll(), (c) => c.fee < 3500, { id: 0, title: "None", fee: 0 });
console.log(\`Count: \${repo.count}\`);
console.log(\`First under 3500: \${cheap.title}\`);
console.log(\`Titles: \${pluck(repo.getAll(), "title").join(", ")}\`);
console.log(\`Course 2: \${repo.getById(2)?.title ?? "not found"}\`);
console.log(\`Course 9: \${repo.getById(9)?.title ?? "not found"}\`);

const response = { success: true, data: repo.getAll() };
console.log(\`Response ok: \${response.success}, items: \${response.data.length}\`);` },
      result: `Count: 3
First under 3500: C# Basics
Titles: C# Basics, ASP.NET Core, Angular
Course 2: ASP.NET Core
Course 9: not found
Response ok: true, items: 3`,
      explanation:
        'firstOrDefault returns the first course with fee below 3500 (C# Basics, 2999). pluck(..., "title") is typed string[] because K = "title" and T[K] = string; "price" is rejected because it is not a key of Course. InMemoryRepository<T extends Entity> can call item.id only because of the constraint; InMemoryRepository<string> is rejected. getById(9) returns undefined, so ?. and ?? print "not found". The emitted JavaScript shows that all generic information disappears.',
    },
    {
      title: 'Utility types for create, update, list and count DTOs',
      scenario:
        'A college admin screen needs: a create form (no id), a PATCH update (any subset of fields), a dropdown (id and name only) and a count of students per branch. Derive all of these from one Student interface.',
      steps: [
        'Create src/student-dtos.ts with the code',
        'Hover over UpdateStudentDto in VS Code to see the expanded type',
        'Uncomment the frozen.cgpa and bad lines and read the errors',
        'Compile and run, or click Run in the playground',
      ],
      code: `// src/student-dtos.ts
interface Student {
  id: number;
  name: string;
  email: string;
  branch: "CSE" | "ECE" | "MECH";
  cgpa: number;
}

type CreateStudentDto = Omit<Student, "id">;              // POST body: the server generates id
type UpdateStudentDto = Partial<Omit<Student, "id">>;     // PATCH body: only changed fields
type StudentListItem = Pick<Student, "id" | "name">;      // for a dropdown
type CountByBranch = Record<Student["branch"], number>;   // { CSE: number; ECE: number; MECH: number }

const students: Student[] = [
  { id: 1, name: "Asha", email: "asha@college.in", branch: "CSE", cgpa: 8.7 },
  { id: 2, name: "Rahul", email: "rahul@college.in", branch: "ECE", cgpa: 7.9 },
  { id: 3, name: "Meena", email: "meena@college.in", branch: "CSE", cgpa: 9.1 },
];

function applyPatch(s: Student, patch: UpdateStudentDto): Student {
  return { ...s, ...patch };                 // like a PATCH endpoint: keep the rest
}

function toListItems(list: Student[]): StudentListItem[] {
  return list.map(({ id, name }) => ({ id, name }));
}

function countByBranch(list: Student[]): CountByBranch {
  const counts: CountByBranch = { CSE: 0, ECE: 0, MECH: 0 };
  for (const s of list) counts[s.branch]++;
  return counts;
}

const newStudent: CreateStudentDto = { name: "Kiran", email: "kiran@college.in", branch: "MECH", cgpa: 7.2 };
const updated = applyPatch(students[1], { cgpa: 8.1 });
const frozen: Readonly<Student> = students[0];
// frozen.cgpa = 10;
// error TS2540: Cannot assign to 'cgpa' because it is a read-only property.
// const bad: CreateStudentDto = { id: 9, name: "X", email: "x@y.in", branch: "CSE", cgpa: 7 };
// error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'CreateStudentDto'.

console.log(JSON.stringify(newStudent));
console.log(\`\${updated.name}: \${students[1].cgpa} -> \${updated.cgpa}\`);
console.log(JSON.stringify(toListItems(students)));
console.log(JSON.stringify(countByBranch(students)));
console.log(\`Readonly view of \${frozen.name}\`);`,
      playground: { html: consoleHtml, js: `// Utility types are compile-time only, so the JavaScript is just the logic
const students = [
  { id: 1, name: "Asha", email: "asha@college.in", branch: "CSE", cgpa: 8.7 },
  { id: 2, name: "Rahul", email: "rahul@college.in", branch: "ECE", cgpa: 7.9 },
  { id: 3, name: "Meena", email: "meena@college.in", branch: "CSE", cgpa: 9.1 },
];

function applyPatch(s, patch) {
  return { ...s, ...patch };
}

function toListItems(list) {
  return list.map(({ id, name }) => ({ id, name }));
}

function countByBranch(list) {
  const counts = { CSE: 0, ECE: 0, MECH: 0 };
  for (const s of list) counts[s.branch]++;
  return counts;
}

const newStudent = { name: "Kiran", email: "kiran@college.in", branch: "MECH", cgpa: 7.2 };
const updated = applyPatch(students[1], { cgpa: 8.1 });
const frozen = students[0];

console.log(JSON.stringify(newStudent));
console.log(\`\${updated.name}: \${students[1].cgpa} -> \${updated.cgpa}\`);
console.log(JSON.stringify(toListItems(students)));
console.log(JSON.stringify(countByBranch(students)));
console.log(\`Readonly view of \${frozen.name}\`);` },
      result: `{"name":"Kiran","email":"kiran@college.in","branch":"MECH","cgpa":7.2}
Rahul: 7.9 -> 8.1
[{"id":1,"name":"Asha"},{"id":2,"name":"Rahul"},{"id":3,"name":"Meena"}]
{"CSE":2,"ECE":1,"MECH":0}
Readonly view of Asha`,
      explanation:
        'Omit<Student, "id"> makes id unknown in the create DTO, so passing an id is an error (TS2353). The spread { ...s, ...patch } copies the student and overwrites only cgpa, and the original students[1] is unchanged (7.9). Pick keeps id and name only. Record<Student["branch"], number> requires all three branch keys, so MECH must start at 0. Readonly<Student> blocks assignments at compile time.',
    },
    {
      title: 'Splitting code into modules: named, default and type-only imports',
      scenario:
        'A cart page shows prices with 18% GST in Indian number format. Put models, formatting helpers and the page logic in separate modules, the way Angular and Vite projects are organised.',
      steps: [
        'Create the folders src/api and src/utils and the four files shown',
        'Add "type": "module" to package.json and set module/moduleResolution to NodeNext in tsconfig.json',
        'Run npx tsc and node dist/main.js',
        'Open dist/main.js: the import type line is gone, the other import remains',
      ],
      code: `// ===== src/api/models.ts =====
export interface Product {
  id: number;
  name: string;
  price: number;
}
export type ProductSummary = Pick<Product, "id" | "name">;

// ===== src/utils/format.ts =====
export const GST_PERCENT = 18;

export function formatInr(amount: number): string {
  return "Rs. " + amount.toLocaleString("en-IN");      // Indian digit grouping
}

export default function withGst(price: number): number {   // ONE default export per file
  return Math.round((price * (100 + GST_PERCENT)) / 100);
}

// ===== src/utils/index.ts (a "barrel" file) =====
export * from "./format.js";
export { default as withGst } from "./format.js";

// ===== src/main.ts =====
import withGst, { formatInr, GST_PERCENT } from "./utils/format.js";   // default + named
import type { Product } from "./api/models.js";                         // type-only: erased

const cart: Product[] = [
  { id: 1, name: "Keyboard", price: 1499 },
  { id: 2, name: "Monitor", price: 12500 },
  { id: 3, name: "Laptop", price: 89990 },
];

for (const p of cart) {
  console.log(\`\${p.name}: \${formatInr(p.price)} + \${GST_PERCENT}% GST = \${formatInr(withGst(p.price))}\`);
}
const total = cart.reduce((sum, p) => sum + withGst(p.price), 0);
console.log(\`Cart total: \${formatInr(total)}\`);

// ===== Run it =====
// tsconfig: "module": "NodeNext", "moduleResolution": "NodeNext"; package.json: "type": "module"
// npx tsc && node dist/main.js
// (In Angular/Vite projects you write "./utils/format" without .js; the bundler resolves it.)`,
      playground: { html: consoleHtml, js: `// The playground runs ONE file, so the three modules are pasted together here.
// In the real project each block is its own file with export / import.

// --- utils/format.js ---
const GST_PERCENT = 18;

function formatInr(amount) {
  return "Rs. " + amount.toLocaleString("en-IN");
}

function withGst(price) {
  return Math.round((price * (100 + GST_PERCENT)) / 100);
}

// --- main.js ---
const cart = [
  { id: 1, name: "Keyboard", price: 1499 },
  { id: 2, name: "Monitor", price: 12500 },
  { id: 3, name: "Laptop", price: 89990 },
];

for (const p of cart) {
  console.log(\`\${p.name}: \${formatInr(p.price)} + \${GST_PERCENT}% GST = \${formatInr(withGst(p.price))}\`);
}
const total = cart.reduce((sum, p) => sum + withGst(p.price), 0);
console.log(\`Cart total: \${formatInr(total)}\`);` },
      result: `Keyboard: Rs. 1,499 + 18% GST = Rs. 1,769
Monitor: Rs. 12,500 + 18% GST = Rs. 14,750
Laptop: Rs. 89,990 + 18% GST = Rs. 1,06,188
Cart total: Rs. 1,22,707`,
      explanation:
        'withGst is the default export (imported without braces); formatInr and GST_PERCENT are named exports (imported in braces with exactly those names). import type disappears from the output because Product is only a type. toLocaleString("en-IN") uses Indian grouping (1,06,188). 1499 x 1.18 = 1768.82 rounds to 1769; the total is 1769 + 14750 + 106188 = 122707. The barrel index.ts lets other files write import { formatInr, withGst } from "./utils/index.js".',
    },
    {
      title: 'Calling an ASP.NET Core Web API with async/await and fetch',
      scenario:
        'Build a small Students API in ASP.NET Core with CORS for the Angular (4200) and Vite (5173) dev servers, and a typed TypeScript client with one generic http<T>() helper that throws on non-2xx responses.',
      steps: [
        'Back end: dotnet new web -n StudentsApi, replace Program.cs with the C# part, run with F5 (note the https port, here 7001)',
        'Front end: npm create vite@latest web -- --template vanilla-ts, then cd web and npm install',
        'Create src/api/models.ts, src/api/studentsApi.ts and replace src/main.ts with the TypeScript parts',
        'npm run dev, open http://localhost:5173, press F12 and look at the Console',
        'The playground runs the same pattern against the public jsonplaceholder API because it cannot reach your localhost',
      ],
      code: `// ===================== BACK END: StudentsApi/Program.cs (ASP.NET Core 8+) =====================
// dotnet new web -n StudentsApi   ->  runs on https://localhost:7001
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(o => o.AddPolicy("frontend", p => p
    .WithOrigins("http://localhost:4200", "http://localhost:5173")   // Angular, Vite
    .AllowAnyHeader()
    .AllowAnyMethod()));
builder.Services.AddProblemDetails();

var app = builder.Build();
app.UseCors("frontend");

var students = new List<StudentDto>
{
    new(1, "Asha", "CSE", 8.7),
    new(2, "Rahul", "ECE", 7.9),
};

app.MapGet("/api/students", () => students);
app.MapGet("/api/students/{id:int}", (int id) =>
    students.FirstOrDefault(s => s.Id == id) is { } s ? Results.Ok(s) : Results.NotFound());
app.MapPost("/api/students", (CreateStudentDto dto) =>
{
    var s = new StudentDto(students.Max(x => x.Id) + 1, dto.Name, dto.Branch, dto.Cgpa);
    students.Add(s);
    return Results.Created($"/api/students/{s.Id}", s);
});
app.Run();

public record StudentDto(int Id, string Name, string Branch, double Cgpa);
public record CreateStudentDto(string Name, string Branch, double Cgpa);

// ===================== FRONT END: src/api/models.ts =====================
// System.Text.Json sends camelCase property names by default
export interface StudentDto {
  id: number;
  name: string;
  branch: string;
  cgpa: number;
}
export type CreateStudentDto = Omit<StudentDto, "id">;

// ===================== FRONT END: src/api/studentsApi.ts =====================
import type { StudentDto, CreateStudentDto } from "./models";

const BASE_URL = "https://localhost:7001/api";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

// one generic helper for every call: the caller says what T the JSON is
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(\`\${BASE_URL}\${path}\`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new ApiError(res.status, \`HTTP \${res.status} for \${path}\`);   // fetch does NOT throw on 404/500
  }
  return (await res.json()) as T;
}

export const studentsApi = {
  getAll: () => http<StudentDto[]>("/students"),
  getById: (id: number) => http<StudentDto>(\`/students/\${id}\`),
  create: (dto: CreateStudentDto) =>
    http<StudentDto>("/students", { method: "POST", body: JSON.stringify(dto) }),
};

// ===================== FRONT END: src/main.ts =====================
import { studentsApi, ApiError } from "./api/studentsApi";

async function main(): Promise<void> {
  try {
    const all = await studentsApi.getAll();                      // StudentDto[]
    all.forEach((s) => console.log(\`\${s.id}. \${s.name} (\${s.branch}) CGPA \${s.cgpa}\`));

    const created = await studentsApi.create({ name: "Kiran", branch: "IT", cgpa: 7.5 });
    console.log(\`Created id \${created.id}\`);

    await studentsApi.getById(99);
  } catch (err) {
    if (err instanceof ApiError) console.log(\`Error: \${err.message}\`);
    else console.log("Network error or CORS problem", err);
  }
}

main();
// Run the API (F5 in Visual Studio), then: npm create vite@latest web -- --template vanilla-ts
// copy the files into web/src, npm install, npm run dev, open http://localhost:5173 and F12 > Console`,
      playground: { html: consoleHtml, js: `// Same pattern against a public demo API (the playground cannot reach your localhost .NET API)
const BASE_URL = "https://jsonplaceholder.typicode.com";

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function http(path, init) {
  const res = await fetch(\`\${BASE_URL}\${path}\`, init);
  if (!res.ok) {
    throw new ApiError(res.status, \`HTTP \${res.status} for \${path}\`);
  }
  return await res.json();
}

async function main() {
  try {
    const users = await http("/users?_limit=3");
    users.forEach((u) => console.log(\`\${u.id}. \${u.name} (\${u.address.city})\`));

    const created = await http("/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Hello from TypeScript", body: "Day 23", userId: 1 }),
    });
    console.log(\`Created id \${created.id}\`);

    await http("/users/999");
  } catch (err) {
    if (err instanceof ApiError) console.log(\`Error: \${err.message}\`);
    else console.log("Network error", err);
  }
}

main();` },
      result: `Playground (jsonplaceholder.typicode.com):
1. Leanne Graham (Gwenborough)
2. Ervin Howell (Wisokyburgh)
3. Clementine Bauch (McKenziehaven)
Created id 101
Error: HTTP 404 for /users/999

Vite app with the .NET API (browser console):
1. Asha (CSE) CGPA 8.7
2. Rahul (ECE) CGPA 7.9
Created id 3
Error: HTTP 404 for /students/99`,
      explanation:
        'http<T> centralises the base URL, JSON header and the res.ok check; each API function only states its path and return type. fetch does not throw for 404, so we throw an ApiError ourselves and catch it in main. Without AddCors/UseCors the browser blocks every call and you would see "Network error or CORS problem" plus a CORS message in the console. The playground needs internet access; jsonplaceholder always returns id 101 for a new post.',
    },
    {
      title: 'Typed responses: PagedResult<T>, ProblemDetails, type guards and date mapping',
      scenario:
        'The students list API is paged and returns RFC 7807 ProblemDetails on errors (404 and validation 400). Model both, convert ISO date strings to Date objects, and make callers handle success and failure through a Result-style union. A small fake API replaces fetch so the demo runs offline.',
      steps: [
        'Create src/typed-api.ts with the code',
        'Notice that inside if (page.ok) TypeScript knows page.data exists, and in the else branch only page.problem exists',
        'Run npx tsc and node dist/typed-api.js (Node 18+ has fetch and Response), or click Run in the playground',
        'To call your real API, delete the fake API block and use full URLs such as https://localhost:7001/api/students',
      ],
      code: `// src/typed-api.ts
// ----- Shapes returned by the ASP.NET Core API (camelCase JSON) -----
interface StudentDto {
  id: number;
  name: string;
  branch: string;
  admittedOn: string;              // C# DateTime arrives as an ISO 8601 string
}

interface PagedResult<T> {         // matches C# PagedResult<T>
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

interface ProblemDetails {         // RFC 7807 errors from AddProblemDetails / [ApiController]
  type?: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; problem: ProblemDetails };

// ----- Front-end model (Date instead of string) -----
interface Student {
  id: number;
  name: string;
  branch: string;
  admittedOn: Date;
}

// type guard: checks at RUNTIME and tells the compiler the type
function isProblemDetails(x: unknown): x is ProblemDetails {
  return typeof x === "object" && x !== null && "title" in x && "status" in x;
}

async function request<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(url, init);
  const body: unknown = await res.json();
  if (res.ok) return { ok: true, data: body as T };
  if (isProblemDetails(body)) return { ok: false, problem: body };
  return { ok: false, problem: { title: "Unexpected error", status: res.status } };
}

const toStudent = (d: StudentDto): Student => ({ ...d, admittedOn: new Date(d.admittedOn) });

// ----- Fake .NET API for this demo (delete this block to call the real API) -----
const db: StudentDto[] = [
  { id: 1, name: "Asha", branch: "CSE", admittedOn: "2023-07-15T00:00:00Z" },
  { id: 2, name: "Rahul", branch: "ECE", admittedOn: "2023-07-20T00:00:00Z" },
  { id: 3, name: "Meena", branch: "CSE", admittedOn: "2024-07-18T00:00:00Z" },
];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = new URL(String(input), "https://localhost:7001");
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

  if (init?.method === "POST") {
    const dto = JSON.parse(String(init.body));
    if (!dto.name) {
      return json({ title: "One or more validation errors occurred.", status: 400,
                    errors: { Name: ["The Name field is required."] } }, 400);
    }
    return json({ id: 4, ...dto, admittedOn: "2026-07-01T00:00:00Z" }, 201);
  }
  const match = url.pathname.match(/^\\/api\\/students\\/(\\d+)$/);
  if (match) {
    const s = db.find((x) => x.id === Number(match[1]));
    return s ? json(s, 200)
             : json({ type: "https://tools.ietf.org/html/rfc9110#section-15.5.5", title: "Not Found", status: 404 }, 404);
  }
  const page = Number(url.searchParams.get("page") ?? 1);
  const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
  const items = db.slice((page - 1) * pageSize, page * pageSize);
  return json({ items, page, pageSize, totalCount: db.length }, 200);
};

// ----- Using the typed client -----
async function main(): Promise<void> {
  const page = await request<PagedResult<StudentDto>>("/api/students?page=1&pageSize=2");
  if (page.ok) {
    const totalPages = Math.ceil(page.data.totalCount / page.data.pageSize);
    console.log(\`Page \${page.data.page} of \${totalPages}\`);
    for (const s of page.data.items.map(toStudent)) {
      console.log(\`\${s.id} \${s.name} (\${s.branch}) admitted \${s.admittedOn.getUTCFullYear()}\`);
    }
  }

  const missing = await request<StudentDto>("/api/students/99");
  if (!missing.ok) console.log(\`\${missing.problem.status} \${missing.problem.title}\`);

  const invalid = await request<StudentDto>("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "", branch: "CSE" }),
  });
  if (!invalid.ok) {
    for (const [field, messages] of Object.entries(invalid.problem.errors ?? {})) {
      console.log(\`\${field}: \${messages.join("; ")}\`);
    }
  }
}

main();`,
      playground: { html: consoleHtml, js: `// JavaScript version: same logic, interfaces and generics removed
function isProblemDetails(x) {
  return typeof x === "object" && x !== null && "title" in x && "status" in x;
}

async function request(url, init) {
  const res = await fetch(url, init);
  const body = await res.json();
  if (res.ok) return { ok: true, data: body };
  if (isProblemDetails(body)) return { ok: false, problem: body };
  return { ok: false, problem: { title: "Unexpected error", status: res.status } };
}

const toStudent = (d) => ({ ...d, admittedOn: new Date(d.admittedOn) });

// ----- Fake .NET API for this demo -----
const db = [
  { id: 1, name: "Asha", branch: "CSE", admittedOn: "2023-07-15T00:00:00Z" },
  { id: 2, name: "Rahul", branch: "ECE", admittedOn: "2023-07-20T00:00:00Z" },
  { id: 3, name: "Meena", branch: "CSE", admittedOn: "2024-07-18T00:00:00Z" },
];

globalThis.fetch = async (input, init) => {
  const url = new URL(String(input), "https://localhost:7001");
  const json = (body, status) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

  if (init?.method === "POST") {
    const dto = JSON.parse(String(init.body));
    if (!dto.name) {
      return json({ title: "One or more validation errors occurred.", status: 400,
                    errors: { Name: ["The Name field is required."] } }, 400);
    }
    return json({ id: 4, ...dto, admittedOn: "2026-07-01T00:00:00Z" }, 201);
  }
  const match = url.pathname.match(/^\\/api\\/students\\/(\\d+)$/);
  if (match) {
    const s = db.find((x) => x.id === Number(match[1]));
    return s ? json(s, 200)
             : json({ type: "https://tools.ietf.org/html/rfc9110#section-15.5.5", title: "Not Found", status: 404 }, 404);
  }
  const page = Number(url.searchParams.get("page") ?? 1);
  const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
  const items = db.slice((page - 1) * pageSize, page * pageSize);
  return json({ items, page, pageSize, totalCount: db.length }, 200);
};

// ----- Using the client -----
async function main() {
  const page = await request("/api/students?page=1&pageSize=2");
  if (page.ok) {
    const totalPages = Math.ceil(page.data.totalCount / page.data.pageSize);
    console.log(\`Page \${page.data.page} of \${totalPages}\`);
    for (const s of page.data.items.map(toStudent)) {
      console.log(\`\${s.id} \${s.name} (\${s.branch}) admitted \${s.admittedOn.getUTCFullYear()}\`);
    }
  }

  const missing = await request("/api/students/99");
  if (!missing.ok) console.log(\`\${missing.problem.status} \${missing.problem.title}\`);

  const invalid = await request("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "", branch: "CSE" }),
  });
  if (!invalid.ok) {
    for (const [field, messages] of Object.entries(invalid.problem.errors ?? {})) {
      console.log(\`\${field}: \${messages.join("; ")}\`);
    }
  }
}

main();` },
      result: `Page 1 of 2
1 Asha (CSE) admitted 2023
2 Rahul (ECE) admitted 2023
404 Not Found
Name: The Name field is required.`,
      explanation:
        'With 3 students and pageSize 2, totalPages = Math.ceil(3 / 2) = 2 and page 1 holds Asha and Rahul. toStudent turns the ISO string into a Date, so getUTCFullYear() works. The 404 body has title and status, so the isProblemDetails type guard returns true and the result becomes { ok: false, problem }. The validation response has an errors dictionary (Record<string, string[]>), exactly like ASP.NET Core\'s ValidationProblemDetails, and we print each field\'s messages.',
    },
  ],
  interview: [
    { q: 'What are generics in TypeScript and why use them?', a: 'Type parameters (<T>) that let functions, interfaces and classes work with many types while keeping type safety. The caller (or inference) supplies T, so first<Student>(list) returns Student | undefined instead of any.', level: 'Easy' },
    { q: 'How do you constrain a generic type parameter?', a: 'With extends: function getId<T extends { id: number }>(x: T) only accepts types that have a numeric id. Similar to C# where T : IEntity. You can also constrain to keys: K extends keyof T.', level: 'Medium' },
    { q: 'How are TypeScript generics different from C# generics?', a: 'TypeScript generics are erased at compile time, so there is no runtime type information: you cannot do new T(), typeof T or check "is T" at runtime. C# generics are reified; List<int> and List<string> are different runtime types.', level: 'Hard' },
    { q: 'Explain Partial, Pick, Omit and Record with a use case each.', a: 'Partial<T> makes all properties optional (PATCH body, form state). Pick<T, K> keeps selected properties (dropdown item: id and name). Omit<T, K> removes properties (create DTO without id). Record<K, V> builds an object type with keys K and values V (counts per branch, a dictionary).', level: 'Medium' },
    { q: 'What is keyof and T[K]?', a: 'keyof T is the union of T\'s property names ("id" | "name"). T[K] is an indexed access type: the type of property K in T. Together they write type-safe helpers like getProp<T, K extends keyof T>(obj: T, key: K): T[K].', level: 'Medium' },
    { q: 'Named export vs default export?', a: 'A module can have many named exports, imported with braces and the exact name. It can have one default export, imported without braces under any name. Named exports are preferred by many teams because they keep names consistent and work better with refactoring and auto-import.', level: 'Easy' },
    { q: 'What does import type do?', a: 'It imports only type information. The import is removed completely from the emitted JavaScript, which avoids runtime side effects and circular import problems and makes intent clear.', level: 'Medium' },
    { q: 'Does fetch throw an error for a 404 or 500 response?', a: 'No. fetch rejects only on network errors (server unreachable, DNS failure, CORS blocked, aborted). For HTTP errors it resolves with res.ok === false, so you must check res.ok or res.status and throw yourself.', level: 'Easy' },
    { q: 'Your Angular app gets "blocked by CORS policy" when calling the .NET API. What do you do?', a: 'Configure CORS on the API: builder.Services.AddCors(o => o.AddPolicy("frontend", p => p.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod())) and app.UseCors("frontend") before the endpoints. CORS is enforced by the browser, so Postman works even when the browser does not. In development you can also use the Angular dev-server proxy.', level: 'Medium' },
    { q: 'Why might a POST from fetch get 415 from ASP.NET Core?', a: '415 Unsupported Media Type: the body was sent without Content-Type: application/json, so the JSON input formatter does not accept it. Add the header and JSON.stringify the body.', level: 'Medium' },
    { q: 'How should a C# DateTime property be typed in a TypeScript DTO?', a: 'As string, because JSON has no date type and System.Text.Json writes ISO 8601 strings. Convert to Date (new Date(value)) when mapping the DTO to a front-end model or when displaying.', level: 'Medium' },
    { q: 'Is "const data = (await res.json()) as Student[]" type-safe?', a: 'Only at compile time. as is an unchecked assertion; if the API returns a different shape, the code fails later at runtime. For safety use type guards or schema validation (Zod), and generate types from OpenAPI so they match the backend.', level: 'Hard' },
    { q: 'What is a user-defined type guard?', a: 'A function with a return type like x is ProblemDetails. It performs runtime checks and, when it returns true, TypeScript narrows the argument to that type in the calling code.', level: 'Medium' },
    { q: 'How do you keep TypeScript DTOs in sync with C# DTOs in a large project?', a: 'Generate them from the API\'s OpenAPI/Swagger document using NSwag, openapi-typescript or Kiota as part of the build, instead of writing them by hand. Then any backend change shows up as a compile error in the front end.', level: 'Hard' },
    { q: 'How do you run several API calls in parallel with async/await?', a: 'Start them without awaiting and use Promise.all: const [students, courses] = await Promise.all([api.getStudents(), api.getCourses()]). It is the equivalent of Task.WhenAll; use Promise.allSettled if one failure should not cancel the others.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a generic function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> and use it to group students by branch.',
      hint: 'Start with an empty object typed as Partial<Record<K, T[]>> and push into each group.',
      solution: `function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}

const byBranch = groupBy(students, (s) => s.branch);
// { CSE: [Asha, Meena], ECE: [Rahul] }`,
    },
    {
      task: 'Given interface Product { id: number; name: string; price: number; stock: number; description: string }, create types: ProductCreateDto (no id), ProductPatchDto (any field except id), ProductCard (id, name, price) and StockBySku (Record of string to number).',
      hint: 'Omit, Partial, Pick and Record.',
      solution: `type ProductCreateDto = Omit<Product, "id">;
type ProductPatchDto = Partial<Omit<Product, "id">>;
type ProductCard = Pick<Product, "id" | "name" | "price">;
type StockBySku = Record<string, number>;`,
    },
    {
      task: 'Write a typed productsApi object with getAll, getById, create, update (PUT) and remove (DELETE) using one generic http<T> helper. remove should not try to parse JSON (the API returns 204 No Content).',
      hint: 'Return Promise<void> for delete; check res.status === 204 before res.json().',
      solution: `const BASE = "https://localhost:7001/api/products";

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const productsApi = {
  getAll: () => http<Product[]>(BASE),
  getById: (id: number) => http<Product>(\`\${BASE}/\${id}\`),
  create: (dto: ProductCreateDto) => http<Product>(BASE, { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: ProductCreateDto) =>
    http<void>(\`\${BASE}/\${id}\`, { method: "PUT", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(\`\${BASE}/\${id}\`, { method: "DELETE" }),
};`,
    },
    {
      task: 'Write the TypeScript DTO for this C# record and a mapper to a front-end model with a Date: public record InvoiceDto(int InvoiceNo, string CustomerName, decimal Amount, DateTime IssuedOn, DateTime? PaidOn, List<string> Items);',
      hint: 'DateTime? becomes string | null; map it to Date | null.',
      solution: `interface InvoiceDto {
  invoiceNo: number;
  customerName: string;
  amount: number;
  issuedOn: string;
  paidOn: string | null;
  items: string[];
}

interface Invoice extends Omit<InvoiceDto, "issuedOn" | "paidOn"> {
  issuedOn: Date;
  paidOn: Date | null;
}

const toInvoice = (d: InvoiceDto): Invoice => ({
  ...d,
  issuedOn: new Date(d.issuedOn),
  paidOn: d.paidOn ? new Date(d.paidOn) : null,
});`,
    },
    {
      task: 'Load a dashboard\'s students and courses in parallel with Promise.all, and cancel both requests if they take longer than 5 seconds.',
      hint: 'AbortController + setTimeout, pass signal to fetch; or AbortSignal.timeout(5000).',
      solution: `async function loadDashboard() {
  const signal = AbortSignal.timeout(5000);
  try {
    const [students, courses] = await Promise.all([
      fetch("/api/students", { signal }).then((r) => r.json() as Promise<StudentDto[]>),
      fetch("/api/courses", { signal }).then((r) => r.json() as Promise<CourseDto[]>),
    ]);
    console.log(students.length, courses.length);
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") console.log("Server too slow");
    else throw err;
  }
}`,
    },
  ],
  quiz: [
    {
      question: 'What is the type of x? const x = pluck([{ id: 1, name: "Asha" }], "name"); where pluck<T, K extends keyof T>(items: T[], key: K): T[K][]',
      options: ['string[]', 'any[]', 'number[]', '"name"[]'],
      answer: 0,
      explanation: 'T is { id: number; name: string }, K is "name", so T[K] is string and the result is string[].',
    },
    {
      question: 'Which type is best for the body of a PATCH /api/students/5 request?',
      options: ['Student', 'Required<Student>', 'Partial<Omit<Student, "id">>', 'Record<string, any>'],
      answer: 2,
      explanation: 'PATCH sends only the changed fields, and the id comes from the URL, so all fields except id are optional.',
    },
    {
      question: 'fetch("/api/students/99") gets a 404 response. What happens?',
      options: [
        'The promise rejects with a 404 error',
        'The promise resolves and res.ok is false',
        'res.json() returns null automatically',
        'The browser retries the request',
      ],
      answer: 1,
      explanation: 'fetch only rejects on network failures. Always check res.ok or res.status.',
    },
    {
      question: 'How should a C# property "public DateTime PlacedOn { get; set; }" appear in the TypeScript DTO?',
      options: ['PlacedOn: Date', 'placedOn: Date', 'placedOn: number', 'placedOn: string'],
      answer: 3,
      explanation: 'JSON has no date type: System.Text.Json writes a camelCase ISO 8601 string. Convert to Date in a mapper.',
    },
    {
      question: 'What does "import type { Product } from \'./models\'" produce in the emitted JavaScript?',
      options: [
        'Nothing; the import is removed',
        'A require call',
        'An empty object named Product',
        'A runtime type check',
      ],
      answer: 0,
      explanation: 'Type-only imports are erased because types do not exist at runtime.',
    },
  ],
};
