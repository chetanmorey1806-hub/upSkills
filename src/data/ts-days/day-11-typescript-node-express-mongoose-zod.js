export default {
  id: 'day-11-typescript-node-express-mongoose-zod',
  title: 'TypeScript with Node.js, Express and Mongoose: Typed Request/Response, Middleware, Env Config, Mongoose Schemas, Zod and Shared Types',
  module: 'Module 3: TypeScript in the MERN Stack',
  day: 11,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'This is where TypeScript pays off in a MERN backend: typed Express routes and middleware, validated environment config, Mongoose models with real types, runtime validation of request bodies with Zod (whose schemas also generate your TypeScript types), and one set of shared types used by both the React client and the Express server.',
  objectives: [
    'Set up an Express 5 + TypeScript project (tsx for dev, tsc for build)',
    'Type route handlers with Request<Params, ResBody, ReqBody, Query> and Response<T>',
    'Write typed middleware and extend Request with a user property',
    'Load environment configuration safely at startup',
    'Type Mongoose schemas and models, and validate input at runtime with Zod and z.infer',
    'Share types between frontend and backend',
  ],
  theory: [
    {
      heading: 'Project setup for an Express + TypeScript API',
      content: `1. \`npm init -y\` and set \`"type": "module"\` in package.json
2. \`npm i express mongoose zod\`
3. \`npm i -D typescript tsx @types/node @types/express\`
4. tsconfig.json: \`strict: true\`, \`module\` and \`moduleResolution\` \`NodeNext\`, \`target\` \`ES2022\`, \`rootDir: "src"\`, \`outDir: "dist"\`
5. Scripts: \`"dev": "tsx watch src/server.ts"\`, \`"build": "tsc"\`, \`"start": "node dist/server.js"\`

Mongoose and Zod ship their own types; Express needs \`@types/express\` (use version 5 types for Express 5).

Typical folder structure: \`src/config\`, \`src/models\`, \`src/routes\`, \`src/controllers\`, \`src/middleware\`, \`src/types\`, \`src/app.ts\` (builds the app), \`src/server.ts\` (connects to MongoDB and calls listen). Exporting \`app\` separately makes it easy to test with Supertest.`,
    },
    {
      heading: 'Typed Request, Response and route handlers',
      content: `Express's \`Request\` type is generic: \`Request<Params, ResBody, ReqBody, Query>\`.
- **Params**: \`{ id: string }\` for \`/courses/:id\` (route params are always strings)
- **ResBody**: the JSON shape you send back
- **ReqBody**: the expected body
- **Query**: \`{ page?: string }\` (query values are strings, or arrays of strings)

\`Response<T>\` types \`res.json(...)\`: sending the wrong shape is a compile error. Using one \`ApiResponse<T>\` type for every route keeps your API consistent.

Inline handlers passed directly to \`app.get(...)\` get \`req\`/\`res\` types from the route path automatically: in \`app.get("/users/:id", (req) => ...)\` \`req.params.id\` is already typed.

**Express 5:** if an \`async\` handler throws or returns a rejected promise, Express 5 forwards the error to the error middleware automatically. In Express 4 you needed try/catch or an \`asyncHandler\` wrapper.`,
      tip: 'Typing `ReqBody` as `CreateCourseInput` does NOT validate anything. `req.body` is whatever the client sent. Always validate it at runtime (Zod) before trusting the type.',
    },
    {
      heading: 'Typed middleware and extending Request',
      content: `- Normal middleware: \`RequestHandler\` or \`(req: Request, res: Response, next: NextFunction) => void\`
- Error middleware has **four** parameters: \`(err: unknown, req, res, next)\`. Type \`err\` as \`unknown\` and narrow with \`instanceof\`.
- Middleware factories return a handler: \`requireRole("admin")\`, \`validateBody(schema)\`

To add \`req.user\` after authentication, use **declaration merging** on Express's global namespace:

\`declare global { namespace Express { interface Request { user?: AuthUser } } }\`

Put it in a file that tsconfig includes (e.g. \`src/types/express.d.ts\` or any module with \`export {}\`). Make it optional (\`user?\`) because it only exists on routes behind the auth middleware.`,
    },
    {
      heading: 'Environment configuration',
      content: `\`process.env.X\` is typed \`string | undefined\` and may be missing or malformed. Do not read \`process.env\` all over the code. Instead:

1. Parse and validate all variables **once at startup** (a Zod schema or a small hand-written loader)
2. Convert types (PORT to number, comma lists to arrays)
3. **Fail fast** with a clear message if something is wrong, before the server starts
4. Export a typed \`config\` / \`env\` object and import it everywhere

This avoids the classic bug where a missing \`JWT_SECRET\` is only discovered when the first user tries to log in in production. Node 22 can load a .env file natively with \`node --env-file=.env\` (tsx supports the same flag).`,
    },
    {
      heading: 'Mongoose models with TypeScript',
      content: `Two common approaches with Mongoose 8:

**1. Interface first:** write \`interface IUser\`, then \`new Schema<IUser>({...})\` and \`model<IUser>("User", schema)\`. The schema is checked against the interface, and \`User.find()\`, \`User.create()\` return typed documents.
**2. Schema first:** write the schema and derive the type with \`InferSchemaType<typeof schema>\`. One source of truth, less duplication.

Useful types:
- \`HydratedDocument<IUser>\` – a full Mongoose document (IUser + \`_id\` + methods like \`save()\`)
- \`Types.ObjectId\` – for references (\`ref: "Course"\`)
- \`.lean<T>()\` – returns plain objects instead of documents (faster for read-only APIs)

Do not make your interface extend \`Document\` (old pattern); Mongoose's docs recommend plain interfaces.`,
    },
    {
      heading: 'Runtime validation with Zod and z.infer',
      content: `TypeScript types disappear at runtime, so they cannot protect you from bad JSON sent by a client. **Zod** is a schema library that validates data at runtime AND gives you the TypeScript type:

- \`const schema = z.object({ title: z.string().min(3), price: z.coerce.number() })\`
- \`type Input = z.infer<typeof schema>\` – the type is generated from the schema, so they can never get out of sync
- \`schema.parse(data)\` throws a \`ZodError\` on invalid data; \`schema.safeParse(data)\` returns \`{ success: true, data } | { success: false, error }\` (a discriminated union)
- Zod also **transforms**: trims strings, coerces "2999" to 2999, fills defaults

Use Zod at every **trust boundary**: request bodies, query strings, params, environment variables, responses from third-party APIs, and even on the React side for forms (with React Hook Form's zodResolver).

Note: these lessons use Zod 3 (\`zod@3\`). Zod 4 keeps the same core API (\`z.object\`, \`z.infer\`, \`safeParse\`) with some changes in error formatting helpers.`,
      syntax: `import { z } from "zod";
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
type LoginInput = z.infer<typeof LoginSchema>;
const result = LoginSchema.safeParse(req.body);`,
    },
    {
      heading: 'Shared types between frontend and backend',
      content: `In a MERN project the client and server talk through JSON. If the server renames \`courseId\` to \`course_id\` and the client is not updated, the bug appears only at runtime. With **shared types**, the compiler catches it in both places.

Options:
- **Monorepo with npm workspaces**: \`packages/shared\` (Zod schemas + types), \`apps/client\`, \`apps/server\`. Both apps depend on \`@yourapp/shared\`.
- A simpler setup: a \`shared/\` folder imported through a tsconfig path alias by both apps.
- Generate types from an OpenAPI spec, or use end-to-end typed tools like tRPC (no shared folder needed).

Share **Zod schemas**, not only types: the server uses them to validate requests, the client uses the same schema to validate forms before sending, and both use \`z.infer\` for types. Never share Mongoose models with the client (they import server-only code).`,
    },
  ],
  examples: [
    {
      title: 'Typed environment config that fails fast',
      scenario: 'Load PORT, MONGO_URI, JWT_SECRET and CORS origins once, convert them to the right types, and stop the server early if something is wrong. Written without libraries so it also runs in the playground (practice task 1 shows the Zod version).',
      steps: [
        'Create src/config/env.ts',
        'Export `config = loadConfig(process.env)`',
        'Run it with tsx or the playground (it uses fake env objects)',
        'Import `config` everywhere instead of reading process.env',
      ],
      code: `// config/env.ts - load and validate environment variables ONCE at startup
type NodeEnv = "development" | "production" | "test";

export interface AppConfig {
  nodeEnv: NodeEnv;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  corsOrigins: string[];
}

type RawEnv = Record<string, string | undefined>;

function required(env: RawEnv, key: string): string {
  const value = env[key];
  if (!value) throw new Error(\`Missing environment variable \${key}\`);
  return value;
}

export function loadConfig(env: RawEnv): AppConfig {
  const nodeEnv = env.NODE_ENV ?? "development";
  if (nodeEnv !== "development" && nodeEnv !== "production" && nodeEnv !== "test") {
    throw new Error(\`NODE_ENV must be development | production | test, got "\${nodeEnv}"\`);
  }
  const port = Number(env.PORT ?? 5000);
  if (!Number.isInteger(port) || port <= 0) throw new Error("PORT must be a positive integer");

  const jwtSecret = required(env, "JWT_SECRET");
  if (jwtSecret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");

  return {
    nodeEnv,
    port,
    mongoUri: required(env, "MONGO_URI"),
    jwtSecret,
    corsOrigins: (env.CORS_ORIGINS ?? "http://localhost:5173").split(",").map((s) => s.trim()),
  };
}

// In the real server: export const config = loadConfig(process.env);
// Here we try it with two fake environments:
const good = loadConfig({
  PORT: "8080",
  MONGO_URI: "mongodb://localhost:27017/upskillr",
  JWT_SECRET: "a-very-long-random-secret-of-32-chars!!",
  CORS_ORIGINS: "http://localhost:5173, https://upskillr.in",
});
console.log(good);

try {
  loadConfig({ MONGO_URI: "mongodb://localhost/x", JWT_SECRET: "short" });
} catch (e) {
  console.log("Startup failed:", (e as Error).message);
}`,
      playground: {
        html: '<p>Open the console</p>',
        js: `function required(env, key) {
    const value = env[key];
    if (!value)
        throw new Error(\`Missing environment variable \${key}\`);
    return value;
}
function loadConfig(env) {
    const nodeEnv = env.NODE_ENV ?? "development";
    if (nodeEnv !== "development" && nodeEnv !== "production" && nodeEnv !== "test") {
        throw new Error(\`NODE_ENV must be development | production | test, got "\${nodeEnv}"\`);
    }
    const port = Number(env.PORT ?? 5000);
    if (!Number.isInteger(port) || port <= 0)
        throw new Error("PORT must be a positive integer");
    const jwtSecret = required(env, "JWT_SECRET");
    if (jwtSecret.length < 32)
        throw new Error("JWT_SECRET must be at least 32 characters");
    return {
        nodeEnv,
        port,
        mongoUri: required(env, "MONGO_URI"),
        jwtSecret,
        corsOrigins: (env.CORS_ORIGINS ?? "http://localhost:5173").split(",").map((s) => s.trim()),
    };
}
// In the real server: export const config = loadConfig(process.env);
// Here we try it with two fake environments:
const good = loadConfig({
    PORT: "8080",
    MONGO_URI: "mongodb://localhost:27017/upskillr",
    JWT_SECRET: "a-very-long-random-secret-of-32-chars!!",
    CORS_ORIGINS: "http://localhost:5173, https://upskillr.in",
});
console.log(good);
try {
    loadConfig({ MONGO_URI: "mongodb://localhost/x", JWT_SECRET: "short" });
}
catch (e) {
    console.log("Startup failed:", e.message);
}`,
      },
      result: `Console output:
{
  nodeEnv: 'development',
  port: 8080,
  mongoUri: 'mongodb://localhost:27017/upskillr',
  jwtSecret: 'a-very-long-random-secret-of-32-chars!!',
  corsOrigins: [ 'http://localhost:5173', 'https://upskillr.in' ]
}
Startup failed: JWT_SECRET must be at least 32 characters`,
      explanation: '`loadConfig` accepts the loose `Record<string, string | undefined>` shape of process.env and returns a strict `AppConfig`: `port` is a number, `nodeEnv` is a literal union, `corsOrigins` is an array. Narrowing with `!==` checks makes `nodeEnv` the union type without a cast. A short JWT secret stops the app at startup instead of failing later.',
    },
    {
      title: 'Express 5 API with typed handlers, middleware, Request augmentation and error handling',
      scenario: 'A courses API with a public list, a detail route that may 404, an admin-only create route and a central error handler.',
      steps: [
        'Create src/types.ts and src/app.ts',
        'Run `npx tsc --noEmit` (no errors)',
        'Start it with a small server.ts: `app.listen(5000)`',
        'Call the endpoints with curl, Postman or fetch',
      ],
      code: `// ===== types.ts =====
// src/types.ts - shared API types and the Request augmentation
export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type AuthUser = { id: string; role: "student" | "admin" };

// Add \`user\` to Express's Request interface (declaration merging)
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// ===== app.ts =====
// src/app.ts - Express 5 with typed handlers and middleware
import express from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ApiResponse, AuthUser } from "./types.js";

type Course = { id: string; title: string; price: number };
const courses: Course[] = [
  { id: "c1", title: "TypeScript for MERN", price: 2999 },
  { id: "c2", title: "React 19", price: 1999 },
];

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export const app = express();
app.use(express.json());

// Middleware: typed with RequestHandler
const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.header("authorization");
  if (token !== "Bearer demo-admin") return next(new AppError(401, "Unauthorized"));
  const user: AuthUser = { id: "u1", role: "admin" };
  req.user = user; // allowed thanks to the augmentation in types.ts
  next();
};

// Request<Params, ResBody, ReqBody, Query>
app.get(
  "/api/courses",
  (req: Request<{}, ApiResponse<Course[]>, unknown, { maxPrice?: string }>, res: Response<ApiResponse<Course[]>>) => {
    const max = req.query.maxPrice ? Number(req.query.maxPrice) : Infinity;
    res.json({ success: true, data: courses.filter((c) => c.price <= max) });
  },
);

app.get("/api/courses/:id", async (req: Request<{ id: string }>, res: Response<ApiResponse<Course>>) => {
  const course = courses.find((c) => c.id === req.params.id);
  // Express 5: a rejected promise / thrown error goes to the error middleware automatically
  if (!course) throw new AppError(404, \`Course \${req.params.id} not found\`);
  res.json({ success: true, data: course });
});

type NewCourseBody = { title: string; price: number };

app.post(
  "/api/courses",
  requireAuth,
  (req: Request<{}, ApiResponse<Course>, NewCourseBody>, res: Response<ApiResponse<Course>>) => {
    // NOTE: the NewCourseBody type is NOT checked at runtime (see the Zod example)
    const course: Course = { id: "c" + (courses.length + 1), ...req.body };
    courses.push(course);
    res.status(201).json({ success: true, data: course });
  },
);

// Error middleware: 4 parameters
app.use((err: unknown, _req: Request, res: Response<ApiResponse<never>>, _next: NextFunction) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(status).json({ success: false, error: message });
});`,
      result: `Type-checks with no errors. Real responses from the running app (status + JSON body):
GET /api/courses?maxPrice=2000 -> 200 {"success":true,"data":[{"id":"c2","title":"React 19","price":1999}]}
GET /api/courses/c9 -> 404 {"success":false,"error":"Course c9 not found"}
POST /api/courses (no token) -> 401 {"success":false,"error":"Unauthorized"}
POST /api/courses (admin) -> 201 {"success":true,"data":{"id":"c3","title":"Node","price":999}}`,
      explanation: '`Request<{ id: string }>` types `req.params.id`; `Response<ApiResponse<Course>>` makes `res.json` accept only the API envelope. `requireAuth` is a `RequestHandler`, and assigning `req.user` compiles because `types.ts` merges `user?` into Express\'s `Request` interface. In Express 5 the `throw` inside the async handler reaches the 4-argument error middleware automatically, which turns `AppError` into the right status code.',
    },
    {
      title: 'Mongoose schema and model with TypeScript',
      scenario: 'A User model typed with an interface, and a Course model whose type is inferred from its schema.',
      steps: [
        'Create src/models/user.model.ts',
        'Run `npx tsc --noEmit`',
        'Run it with `npx tsx` (validation works without a MongoDB connection)',
      ],
      code: `// src/models/user.model.ts - Mongoose 8 with TypeScript
import { Schema, model, Types } from "mongoose";
import type { HydratedDocument, InferSchemaType } from "mongoose";

// 1) Interface describing the document (what is stored in MongoDB)
export interface IUser {
  name: string;
  email: string;
  role: "student" | "mentor" | "admin";
  enrolledCourses: Types.ObjectId[];
  phone?: string;
}

// 2) Schema typed with the interface: a typo or wrong type in the schema is an error
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, enum: ["student", "mentor", "admin"], default: "student" },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    phone: { type: String, match: /^[6-9]\\d{9}$/ },
  },
  { timestamps: true },
);

// 3) Model: User.find(), User.create() ... all return typed documents
export const User = model<IUser>("User", userSchema);
export type UserDoc = HydratedDocument<IUser>; // IUser + _id + Mongoose methods (save, populate...)

// Alternative: infer the type FROM the schema (one source of truth)
const courseSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  tags: [String],
});
export type ICourse = InferSchemaType<typeof courseSchema>; // { title: string; price: number; tags: string[] }
export const Course = model("Course", courseSchema);

// Typed queries (need a DB connection, shown for the types only):
export async function findStudents(): Promise<UserDoc[]> {
  return User.find({ role: "student" }).exec();
}
export async function findStudentEmails(): Promise<Pick<IUser, "email">[]> {
  // lean() returns plain objects, not documents: faster for read-only APIs
  return User.find({ role: "student" }).select("email").lean<Pick<IUser, "email">[]>().exec();
}

// Validation works without a database connection:
const bad = new User({ name: "  ", email: "ASHA@EXAMPLE.COM", role: "student", phone: "12345" });
const err = bad.validateSync();
console.log(Object.keys(err?.errors ?? {}).sort());

const good: UserDoc = new User({ name: " Asha ", email: "ASHA@EXAMPLE.COM" });
console.log(good.validateSync() === undefined, good.name, good.email, good.role, good._id instanceof Types.ObjectId);`,
      result: `Type-checks with no errors. Output:
[ 'name', 'phone' ]
true Asha asha@example.com student true`,
      explanation: '`new Schema<IUser>` checks the schema definition against the interface, and `model<IUser>` makes every query return typed documents (`HydratedDocument<IUser>`). `InferSchemaType` derives the Course type from its schema instead. `validateSync()` runs Mongoose validators in memory: the empty (trimmed) name and the invalid phone fail, while the second user is valid, gets `role: "student"` from the default, and has its email lower-cased.',
    },
    {
      title: 'Zod validation middleware and z.infer',
      scenario: 'Validate POST /courses bodies at runtime and get the TypeScript type from the same schema.',
      steps: [
        '`npm i zod@3`',
        'Create src/validation/course.schema.ts',
        'Use `validateBody(createCourseSchema)` before the route handler',
        'Run the file with tsx to see a valid and an invalid body',
      ],
      code: `// Runtime validation with Zod + z.infer + a reusable Express middleware
import { z } from "zod";
import type { RequestHandler } from "express";

// 1) The schema is the single source of truth...
export const createCourseSchema = z.object({
  title: z.string().trim().min(3, "Title must have at least 3 characters"),
  price: z.coerce.number().int().nonnegative(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  tags: z.array(z.string()).max(5).optional(),
});

// 2) ...and the TypeScript type is DERIVED from it (no duplicate interface)
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
// { title: string; price: number; level: "beginner" | "intermediate" | "advanced"; tags?: string[] }

// 3) Generic validation middleware for any body schema
export function validateBody<S extends z.ZodTypeAny>(schema: S): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ success: false, error: "Validation failed", issues: result.error.flatten().fieldErrors });
      return;
    }
    req.body = result.data; // cleaned data: trimmed, coerced, defaults applied
    next();
  };
}
// Usage: router.post("/courses", validateBody(createCourseSchema), (req: Request<{}, {}, CreateCourseInput>, res) => {...})

// 4) Try the schema directly with an untrusted body
const untrusted: unknown = JSON.parse('{"title":"  TypeScript  ","price":"2999"}');
const ok = createCourseSchema.safeParse(untrusted);
if (ok.success) {
  const input: CreateCourseInput = ok.data;
  console.log(input);
}

const bad = createCourseSchema.safeParse({ title: "TS", price: -5, level: "expert" });
if (!bad.success) console.log(bad.error.flatten().fieldErrors);`,
      result: `Type-checks with no errors. Output:
{ title: 'TypeScript', price: 2999, level: 'beginner' }
{
  title: [ 'Title must have at least 3 characters' ],
  price: [ 'Number must be greater than or equal to 0' ],
  level: [
    "Invalid enum value. Expected 'beginner' | 'intermediate' | 'advanced', received 'expert'"
  ]
}`,
      explanation: 'The schema validates AND transforms: the title is trimmed, the string "2999" is coerced to a number, and the missing level gets the default. `z.infer` produces `CreateCourseInput`, so there is no hand-written interface to keep in sync. `safeParse` returns a discriminated union: `ok.data` is only accessible after checking `ok.success`. `flatten().fieldErrors` gives per-field messages, perfect for a 400 response that a React form can display.',
    },
    {
      title: 'Shared types between React client and Express server',
      scenario: 'The enrollment request schema and response types live in one shared module used by both sides.',
      steps: [
        'Create shared/index.ts with the Zod schema and types',
        'Map `@upskillr/shared` with a path alias (or an npm workspace package)',
        'Use it in the Express route and in the React API client',
        'Run `npx tsc --noEmit` (no errors); rename a field in shared and both sides show errors',
      ],
      code: `// ===== tsconfig.json =====
{
  "compilerOptions": {
    "paths": { "@upskillr/shared": ["./shared/index.ts"] }
  }
}

// ===== shared/index.ts =====
// shared/index.ts - used by BOTH the React client and the Express server
import { z } from "zod";

export const enrollmentSchema = z.object({
  courseId: z.string().min(1),
  couponCode: z.string().toUpperCase().optional(),
});
export type EnrollmentRequest = z.infer<typeof enrollmentSchema>;

export interface Enrollment {
  id: string;
  courseId: string;
  amountPaid: number;
  status: "active" | "pending_payment";
}

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

// ===== server/enroll.route.ts =====
// server/enroll.route.ts - Express router using the shared contract
import { Router } from "express";
import type { Request, Response } from "express";
import { enrollmentSchema } from "@upskillr/shared";
import type { ApiResponse, Enrollment, EnrollmentRequest } from "@upskillr/shared";

export const enrollRouter = Router();

enrollRouter.post("/enroll", (req: Request<{}, ApiResponse<Enrollment>, unknown>, res: Response<ApiResponse<Enrollment>>) => {
  const parsed = enrollmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid body" });
    return;
  }
  const body: EnrollmentRequest = parsed.data;
  const amount = body.couponCode === "FIRST100" ? 2899 : 2999;
  res.status(201).json({
    success: true,
    data: { id: "en_1", courseId: body.courseId, amountPaid: amount, status: "active" },
  });
});

// ===== client/api.ts =====
// client/api.ts - React side: same types, so the compiler checks both ends
import type { ApiResponse, Enrollment, EnrollmentRequest } from "@upskillr/shared";

export async function enroll(body: EnrollmentRequest): Promise<Enrollment> {
  const res = await fetch("/api/enroll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as ApiResponse<Enrollment>;
  if (!json.success) throw new Error(json.error); // narrowed by the discriminant
  return json.data;
}

// Called from a React component: const enrollment = await enrollInCourse(id, coupon);
export function enrollInCourse(courseId: string, couponCode?: string): Promise<Enrollment> {
  return enroll({ courseId, couponCode });
}`,
      result: `Type-checks with no errors. If you rename \`courseId\` to \`course_id\` in the shared schema, tsc immediately reports errors on BOTH sides:
client/api.ts: error TS2561: Object literal may only specify known properties, but 'courseId' does not exist in type '{ course_id: string; couponCode?: string | undefined; }'. Did you mean to write 'course_id'?
server/enroll.route.ts: error TS2551: Property 'courseId' does not exist on type '{ course_id: string; couponCode?: string | undefined; }'. Did you mean 'course_id'?
So the client and server can never drift apart silently.`,
      explanation: 'The server validates with `enrollmentSchema.safeParse` and responds with `ApiResponse<Enrollment>`. The client sends an `EnrollmentRequest` and reads the same `ApiResponse<Enrollment>`, narrowing on `success`. In a real monorepo `@upskillr/shared` is an npm workspace package; here a tsconfig path alias stands in for it.',
    },
  ],
  interview: [
    {
      q: 'How do you type req.params, req.body and req.query in Express?',
      a: 'Use the generics of Request: `Request<Params, ResBody, ReqBody, Query>`, e.g. `Request<{ id: string }, ApiResponse<User>, CreateUserBody, { page?: string }>`. Inline handlers on app.get(\'/users/:id\') infer params from the path automatically.',
      level: 'Medium',
    },
    {
      q: 'Does typing req.body make the API safe?',
      a: 'No. Types are erased at runtime, so req.body can contain anything the client sends. The ReqBody type is only an assumption. You must validate at runtime with Zod/Joi/express-validator and then use the validated data.',
      level: 'Easy',
    },
    {
      q: 'How do you add a `user` property to Express\'s Request?',
      a: 'Declaration merging: `declare global { namespace Express { interface Request { user?: AuthUser } } }` in a .d.ts or module file included by tsconfig. The auth middleware sets req.user and later handlers can read it (checking it is defined).',
      level: 'Medium',
    },
    {
      q: 'How do you type an error-handling middleware?',
      a: 'With four parameters: `(err: unknown, req: Request, res: Response, next: NextFunction) => void` (or ErrorRequestHandler). Type err as unknown and narrow with instanceof (e.g. AppError, ZodError) to choose the status code.',
      level: 'Medium',
    },
    {
      q: 'How does Express 5 handle errors in async handlers?',
      a: 'If an async handler throws or returns a rejected promise, Express 5 catches it and calls next(err) automatically. Express 4 did not, so you needed try/catch or an asyncHandler wrapper.',
      level: 'Medium',
    },
    {
      q: 'How do you use Mongoose with TypeScript?',
      a: 'Define an interface (IUser), create `new Schema<IUser>({...})` and `model<IUser>(\'User\', schema)`. Queries then return HydratedDocument<IUser>. Alternatively infer the type from the schema with InferSchemaType<typeof schema>. Use Types.ObjectId for references and lean<T>() for plain objects.',
      level: 'Medium',
    },
    {
      q: 'What is z.infer?',
      a: 'A Zod helper type that extracts the TypeScript type from a schema: `type User = z.infer<typeof UserSchema>`. The schema becomes the single source of truth for both runtime validation and compile-time types (z.input gives the type before transforms/defaults).',
      level: 'Easy',
    },
    {
      q: 'parse vs safeParse in Zod?',
      a: 'parse returns the data or throws a ZodError. safeParse never throws; it returns a discriminated union { success: true, data } | { success: false, error }. Use safeParse in middleware to send a 400 response, parse when an invalid value should crash (e.g. env at startup).',
      level: 'Easy',
    },
    {
      q: 'Why validate environment variables at startup?',
      a: 'process.env values are string | undefined and may be missing or malformed. Validating once at startup converts them to correct types, gives one typed config object, and fails fast with a clear message instead of crashing later in production.',
      level: 'Medium',
    },
    {
      q: 'How do you share types between a React frontend and an Express backend?',
      a: 'Put the API contract (Zod schemas, z.infer types, ApiResponse<T>) in a shared package of a monorepo (npm/pnpm workspaces) or a shared folder imported via path aliases. Both apps import it, so changes cause compile errors on both sides. Alternatives: OpenAPI-generated types or tRPC.',
      level: 'Hard',
    },
    {
      q: 'What is the difference between HydratedDocument<IUser> and a lean() result?',
      a: 'HydratedDocument is a full Mongoose document with _id, getters, virtuals and methods like save() and populate(). lean() returns plain JavaScript objects (no methods), which are faster and smaller; type them with lean<T>().',
      level: 'Hard',
    },
    {
      q: 'How would you run a TypeScript Express app in development and production?',
      a: 'Development: `tsx watch src/server.ts` (fast, no type-check) plus `tsc --noEmit` in the editor/CI. Production: `tsc` to build into dist/, then `node dist/server.js` (or a Docker image that runs it). Do not run tsx or ts-node in production.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Rewrite the environment loader with Zod: NODE_ENV enum with default, PORT coerced to a positive integer with default 5000, MONGO_URI must be a URL, JWT_SECRET at least 32 characters, JWT_EXPIRES_IN default \'7d\'. Throw one readable error listing every problem.',
      hint: 'Use z.coerce.number() for PORT and error.flatten().fieldErrors to build the message.',
      solution: `// config/env.ts - the Zod version of environment validation
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = Object.entries(result.error.flatten().fieldErrors)
      .map(([key, msgs]) => \`\${key}: \${msgs?.join(", ")}\`)
      .join("; ");
    throw new Error("Invalid environment -> " + problems);
  }
  return result.data;
}

// export const env = loadEnv(process.env);
console.log(loadEnv({ MONGO_URI: "mongodb://localhost:27017/app", JWT_SECRET: "x".repeat(32) }));
try {
  loadEnv({ PORT: "abc", MONGO_URI: "not-a-url", JWT_SECRET: "short" });
} catch (e) {
  console.log((e as Error).message);
}`,
    },
    {
      task: 'Create a typed Mongoose Order model with embedded order items (product ref, title, price, qty), a status enum, and a pre(\'validate\') hook that computes the total. Validate one order without a database.',
      hint: 'Use a sub-schema with `{ _id: false }` for items and `this.items.reduce` in the hook.',
      solution: `import { Schema, model, Types } from "mongoose";
import type { HydratedDocument } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  title: string;
  price: number;
  qty: number;
}

export interface IOrder {
  user: Types.ObjectId;
  items: IOrderItem[];
  status: "pending" | "paid" | "shipped" | "cancelled";
  total: number;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], validate: (v: IOrderItem[]) => v.length > 0 },
    status: { type: String, enum: ["pending", "paid", "shipped", "cancelled"], default: "pending" },
    total: { type: Number, required: true },
  },
  { timestamps: true },
);

// Compute the total before validation so it is always correct
orderSchema.pre("validate", function () {
  this.total = this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
});

export const Order = model<IOrder>("Order", orderSchema);
export type OrderDoc = HydratedDocument<IOrder>;

const order: OrderDoc = new Order({
  user: new Types.ObjectId(),
  items: [
    { product: new Types.ObjectId(), title: "Keyboard", price: 1500, qty: 1 },
    { product: new Types.ObjectId(), title: "Mouse", price: 600, qty: 2 },
  ],
});
order.validate().then(() => console.log(order.status, order.total)); // pending 2700`,
    },
    {
      task: 'Write typed `authenticate` and `requireRole(...roles)` middleware. authenticate reads a Bearer token, sets `req.user` (add it to Express\'s Request type) or returns 401; requireRole returns 403 if the role is not allowed.',
      hint: 'requireRole is a factory that returns a RequestHandler.',
      solution: `// middleware/auth.ts - typed JWT-style auth + role guard (token check simplified)
import type { RequestHandler } from "express";

type Role = "student" | "admin";
interface AuthUser {
  id: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// In a real app: jwt.verify(token, env.JWT_SECRET) as JwtPayload
function verifyToken(token: string): AuthUser | null {
  if (token === "admin-token") return { id: "u1", role: "admin" };
  if (token === "student-token") return { id: "u2", role: "student" };
  return null;
}

export const authenticate: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const user = token ? verifyToken(token) : null;
  if (!user) {
    res.status(401).json({ success: false, error: "Login required" });
    return;
  }
  req.user = user;
  next();
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: "Forbidden" });
      return;
    }
    next();
  };
}

// router.delete("/courses/:id", authenticate, requireRole("admin"), deleteCourse);`,
    },
    {
      task: 'Build GET /api/products with a Zod-validated query (page and limit coerced to numbers with defaults and limits, optional search) that returns a typed Paginated<Product> response.',
      hint: 'listQuerySchema.safeParse(req.query); slice((page - 1) * limit, page * limit).',
      solution: `// A typed async handler wrapper + typed params/query for a paginated list route
import express from "express";
import type { Request, Response } from "express";
import { z } from "zod";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional(),
});
type ListQuery = z.infer<typeof listQuerySchema>;

type Product = { id: number; name: string };
type Paginated<T> = { items: T[]; page: number; limit: number; total: number };

const products: Product[] = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, name: \`Product \${i + 1}\` }));

function listProducts(q: ListQuery): Paginated<Product> {
  const filtered = q.search ? products.filter((p) => p.name.includes(q.search!)) : products;
  const start = (q.page - 1) * q.limit;
  return { items: filtered.slice(start, start + q.limit), page: q.page, limit: q.limit, total: filtered.length };
}

export const app = express();

app.get("/api/products", (req: Request, res: Response<Paginated<Product> | { error: string }>) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  res.json(listProducts(parsed.data));
});

const page3 = listProducts(listQuerySchema.parse({ page: "3", limit: "10" }));
console.log(page3.items.map((p) => p.id), page3.total); // [ 21, 22, 23 ] 23`,
    },
  ],
  quiz: [
    {
      question: 'In `Request<P, ResBody, ReqBody, Query>`, which position types req.body?',
      options: [
        'First',
        'Second',
        'Third',
        'Fourth',
      ],
      answer: 2,
      explanation: 'Params, response body, request body, query.',
    },
    {
      question: 'What does `z.infer<typeof schema>` give you?',
      options: [
        'A runtime validator',
        'The TypeScript type described by the schema',
        'A JSON Schema',
        'A Mongoose model',
      ],
      answer: 1,
      explanation: 'z.infer extracts the static type; the schema itself does runtime validation.',
    },
    {
      question: 'Which Mongoose type represents a full document with _id and methods like save()?',
      options: [
        'InferSchemaType<T>',
        'Types.ObjectId',
        'LeanDocument<T>',
        'HydratedDocument<T>',
      ],
      answer: 3,
      explanation: 'HydratedDocument<T> = T plus Mongoose document features.',
    },
    {
      question: 'How many parameters does an Express error-handling middleware have?',
      options: [
        '4',
        '2',
        '3',
        '5',
      ],
      answer: 0,
      explanation: '(err, req, res, next): Express detects error handlers by their four parameters.',
    },
    {
      question: 'What is the main reason to share Zod schemas between client and server?',
      options: [
        'Smaller bundles',
        'Faster MongoDB queries',
        'One contract for validation and types on both sides',
        'It is required by Express',
      ],
      answer: 2,
      explanation: 'Both sides validate and type data from the same source, so they cannot drift apart.',
    },
  ],
};
