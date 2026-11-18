export default {
  id: 'day-03-full-stack-crud-feature-shared-zod-validation',
  title: 'Full-Stack CRUD Feature End to End: Mongoose Model → Controller → Routes → React List/Form/Edit/Delete with a Shared Zod Schema',
  module: 'Module 1: Architecture & Setup',
  day: 3,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    'Build one complete feature (an Expense Tracker resource) across the whole stack: a shared Zod schema used by BOTH React and Express, a Mongoose model, controller and routes, TanStack Query hooks, and React pages for listing, creating, editing and deleting, with validation errors shown under the right input.',
  objectives: [
    'Plan a feature as a vertical slice: schema → model → API → hooks → UI',
    'Write one Zod schema in a shared workspace package and use it on client and server',
    'Implement create/read/update/delete with correct status codes (201, 200, 204, 400, 404)',
    'Build React list, create/edit form (React Hook Form + zodResolver) and delete with confirmation',
    'Map server-side validation errors back to form fields',
  ],
  theory: [
    {
      heading: 'Think in vertical slices, not layers',
      content:
        'Juniors often build "all models", then "all routes", then "all pages". Seniors build **one feature completely, top to bottom**, then the next one. This is called a **vertical slice**.\n\nFor an **Expense** feature the slice is:\n\n1. **Contract**: fields, rules and URLs (`expenseSchema`, `/api/expenses`).\n2. **Database**: Mongoose model with indexes.\n3. **Backend**: service → controller → routes with a `validate()` middleware.\n4. **Client data layer**: `expensesApi` + TanStack Query hooks.\n5. **UI**: list page, form for create and edit, delete button, empty/loading/error states.\n\nAnalogy: building a house room by room (each room usable) instead of pouring all foundations, then all walls, then all roofs. After one slice you can demo, test and get feedback.',
      points: [
        'REST mapping: GET /api/expenses (list), GET /:id (one), POST / (create → 201), PATCH /:id (partial update → 200), DELETE /:id (→ 204)',
        'PUT replaces the whole document; PATCH changes only sent fields. Most UIs use PATCH',
        'Each slice ends with a manual test in the browser AND an API test (Day 12)',
      ],
    },
    {
      heading: 'Validation on both sides: why and where',
      content:
        '**Client-side validation** is for **user experience**: instant feedback ("Amount must be positive") without a network round trip.\n\n**Server-side validation** is for **security and data integrity**: anyone can skip your React app and send `curl -X POST` with garbage. The server must never trust the client.\n\nSo you validate twice, and the risk is that the two sets of rules **drift apart** (client allows 60 characters, server allows 50). The fix: write the rules **once** in a **shared Zod schema** and import it in both apps.\n\nThere is also a third layer, **Mongoose schema validation**, which is the last safety net at the database level (required fields, enums, min/max) and also handles things Zod cannot know, like **unique** indexes.',
      syntax:
        '// packages/shared/src/expense.schema.js\nimport { z } from \'zod\';\n\nexport const CATEGORIES = [\'food\', \'travel\', \'rent\', \'shopping\', \'bills\', \'other\'];\n\nexport const expenseSchema = z.object({\n  title: z.string().trim().min(3, \'Title must be at least 3 characters\').max(60),\n  amount: z.coerce.number().positive(\'Amount must be greater than 0\').max(1_000_000),\n  category: z.enum(CATEGORIES),\n  date: z.coerce.date(),\n  note: z.string().max(200).optional().or(z.literal(\'\')),\n});\n\nexport const expenseUpdateSchema = expenseSchema.partial(); // for PATCH',
      tip: 'z.coerce.number() is important for forms: HTML inputs always give strings ("250"), and coerce converts them to numbers before checking.',
    },
    {
      heading: 'The shared package with npm workspaces',
      content:
        'Create `packages/shared` with its own package.json named, for example, `@mernshop/shared`. Because the root package.json lists `"packages/*"` in workspaces, `npm install` creates a **symlink** in node_modules, so both apps can do:\n\n```\nimport { expenseSchema } from \'@mernshop/shared\';\n```\n\nRules for shared code:\n\n- Only **pure** code: schemas, constants, enums, small utility functions. No Express, no React, no Mongoose.\n- Use **ES modules** (`"type": "module"`) so Vite and Node 22 can both import it.\n- Add `zod` as a dependency of the shared package (installed once, hoisted).\n\nWithout a monorepo, teams copy the schema into both apps or publish a private npm package. With TypeScript you also get shared types for free via `z.infer<typeof expenseSchema>`.',
      syntax:
        '// packages/shared/package.json\n{\n  "name": "@mernshop/shared",\n  "version": "1.0.0",\n  "type": "module",\n  "exports": "./src/index.js",\n  "dependencies": { "zod": "^4.1.0" }\n}\n\n// packages/shared/src/index.js\nexport * from \'./expense.schema.js\';\n\n// then: npm install   (root)  →  node_modules/@mernshop/shared → ../packages/shared',
    },
    {
      heading: 'Backend: model, validate middleware, controller, routes',
      content:
        'The backend for one resource is four small files:\n\n- **Model** (`models/Expense.js`): Mongoose schema with `user` reference (owner), `timestamps: true`, and an **index** on `{ user: 1, date: -1 }` because the list is always "my expenses, newest first".\n- **validate(schema)** middleware: runs `schema.safeParse(req.body)`. On failure returns **400** with `{ message, errors: { field: message } }`. On success replaces `req.body` with the **parsed** (trimmed, coerced) data. Note: in Express 5 `req.query` is a read-only getter, so for query validation store the result in `req.validatedQuery` instead of overwriting it.\n- **Controller**: thin functions using the model. Return **404** when `findOne` returns null, **201** on create, **204** with no body on delete.\n- **Routes**: `router.route(\'/\').get(list).post(validate(expenseSchema), create)` and `router.route(\'/:id\').get(getOne).patch(validate(expenseUpdateSchema), update).delete(remove)`.\n\nAlways query by **both** `_id` and `user` (`Expense.findOne({ _id: id, user: req.user.id })`) so a logged-in user cannot read someone else\'s expense by guessing an id (more on Day 5).',
      tip: 'Use { new: true, runValidators: true } with findOneAndUpdate. Without runValidators, Mongoose skips schema validation on updates.',
    },
    {
      heading: 'Frontend: list, form, edit and delete',
      content:
        'On the React side the same feature becomes:\n\n- **Hooks** (`useExpenses`, `useCreateExpense`, `useUpdateExpense`, `useDeleteExpense`) as on Day 2.\n- **ExpenseForm**: one component for **create and edit**. It receives `defaultValues` and an `onSubmit`. Built with **React Hook Form** + `zodResolver(expenseSchema)` from `@hookform/resolvers/zod`, so the shared schema validates on the client.\n- **ExpensesPage**: list with total, "Add expense" button, edit and delete buttons per row.\n- **Delete**: always confirm (`window.confirm` or a modal); disable the button while pending.\n- **Routes** (React Router 7): `/expenses`, `/expenses/new`, `/expenses/:id/edit`.\n\nWhen the **server** rejects data (e.g. a rule only the server knows, like a monthly budget limit), map `error.fieldErrors` into the form with `setError(field, { message })` so the message appears under the right input, exactly like client errors.',
      points: [
        'Same component for create and edit = less code, consistent behaviour',
        'After create/edit: invalidate the list and navigate back',
        'Dates: send ISO strings; show with toLocaleDateString("en-IN")',
        'Money: show with Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })',
      ],
    },
    {
      heading: 'Status codes and responses for CRUD (cheat sheet)',
      content:
        'Use this table in every project and interview:\n\n- `GET /api/expenses` → **200** `{ data, total }`\n- `GET /api/expenses/:id` → **200** expense, or **404** `{ message }`; invalid ObjectId → **400**\n- `POST /api/expenses` → **201** created expense (+ optional `Location` header), or **400** with field errors\n- `PATCH /api/expenses/:id` → **200** updated expense, **400**, or **404**\n- `DELETE /api/expenses/:id` → **204** No Content (empty body), or **404**\n- Not logged in → **401**; logged in but not allowed → **403**; duplicate unique field → **409**\n\nReturn the **created/updated document** from POST/PATCH so the client can update its cache without another GET.',
    },
  ],
  examples: [
    {
      title: 'Complete CRUD API with validation and correct status codes (API Lab)',
      scenario:
        'Build the /api/expenses contract with an in-memory array so you can test every status code. The validation function mirrors the Zod schema (the API Lab cannot load zod; the real project uses validate(expenseSchema)).',
      steps: [
        'Create the in-memory store and a validateExpense(body, partial) function with the same rules as the shared schema',
        'Write a validate middleware factory that returns 400 with field errors',
        'Add list, getOne, create (201), update (PATCH), remove (204) and 404 handling',
        'Run the requests in order: list, invalid create, valid create, patch, delete, get deleted',
      ],
      code: `// Real project: server/src/middleware/validate.js
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = Object.fromEntries(
      result.error.issues.map((i) => [i.path.join('.'), i.message])
    );
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  req.body = result.data;     // trimmed + coerced values
  next();
};`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const CATEGORIES = ['food', 'travel', 'rent', 'shopping', 'bills', 'other'];
let expenses = [
  { _id: 'e1', title: 'Groceries', amount: 1450, category: 'food', date: '2026-11-02' },
  { _id: 'e2', title: 'Metro card', amount: 500, category: 'travel', date: '2026-11-05' },
];
let seq = 3;

// same rules as the shared Zod schema
function check(body, partial) {
  const errors = {};
  const has = (k) => body[k] !== undefined;
  if (!partial || has('title')) {
    if (typeof body.title !== 'string' || body.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  }
  if (!partial || has('amount')) {
    const n = Number(body.amount);
    if (!Number.isFinite(n) || n <= 0) errors.amount = 'Amount must be greater than 0';
  }
  if (!partial || has('category')) {
    if (!CATEGORIES.includes(body.category)) errors.category = 'Category must be one of: ' + CATEGORIES.join(', ');
  }
  if (!partial || has('date')) {
    if (isNaN(new Date(body.date))) errors.date = 'Invalid date';
  }
  return errors;
}
const validate = (partial) => (req, res, next) => {
  const errors = check(req.body || {}, partial);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Validation failed', errors });
  if (req.body.amount !== undefined) req.body.amount = Number(req.body.amount); // coerce like z.coerce
  if (typeof req.body.title === 'string') req.body.title = req.body.title.trim();
  next();
};

const router = express.Router();

router.get('/', (req, res) => {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  res.json({ data: expenses, total });
});

router.get('/:id', (req, res) => {
  const exp = expenses.find(e => e._id === req.params.id);
  if (!exp) return res.status(404).json({ message: 'Expense not found' });
  res.json(exp);
});

router.post('/', validate(false), (req, res) => {
  const { title, amount, category, date, note } = req.body;
  const exp = { _id: 'e' + seq++, title, amount, category, date, ...(note && { note }) };
  expenses.push(exp);
  res.status(201).set('Location', '/api/expenses/' + exp._id).json(exp);
});

router.patch('/:id', validate(true), (req, res) => {
  const exp = expenses.find(e => e._id === req.params.id);
  if (!exp) return res.status(404).json({ message: 'Expense not found' });
  const allowed = ['title', 'amount', 'category', 'date', 'note'];
  for (const k of allowed) if (req.body[k] !== undefined) exp[k] = req.body[k];
  res.json(exp);
});

router.delete('/:id', (req, res) => {
  const before = expenses.length;
  expenses = expenses.filter(e => e._id !== req.params.id);
  if (expenses.length === before) return res.status(404).json({ message: 'Expense not found' });
  res.sendStatus(204);
});

app.use('/api/expenses', router);
app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/expenses' },
          { method: 'POST', url: '/api/expenses', body: { title: 'TV', amount: '-20', category: 'gadgets', date: 'someday' } },
          { method: 'POST', url: '/api/expenses', body: { title: '  Movie tickets ', amount: '480', category: 'other', date: '2026-11-10' } },
          { method: 'PATCH', url: '/api/expenses/e3', body: { amount: 520 } },
          { method: 'PATCH', url: '/api/expenses/e3', body: { category: 'fun' } },
          { method: 'DELETE', url: '/api/expenses/e1' },
          { method: 'GET', url: '/api/expenses/e1' },
          { method: 'GET', url: '/api/expenses' },
        ],
      },
      result: "GET /api/expenses → 200 {\"data\":[{\"_id\":\"e1\",\"title\":\"Groceries\",\"amount\":1450,\"category\":\"food\",\"date\":\"2026-11-02\"},{\"_id\":\"e2\",\"title\":\"Metro card\",\"amount\":500,\"category\":\"travel\",\"date\":\"2026-11-05\"}],\"total\":1950}\nPOST /api/expenses → 400 {\"message\":\"Validation failed\",\"errors\":{\"title\":\"Title must be at least 3 characters\",\"amount\":\"Amount must be greater than 0\",\"category\":\"Category must be one of: food, travel, rent, shopping, bills, other\",\"date\":\"Invalid date\"}}\nPOST /api/expenses → 201 {\"_id\":\"e3\",\"title\":\"Movie tickets\",\"amount\":480,\"category\":\"other\",\"date\":\"2026-11-10\"}\nPATCH /api/expenses/e3 → 200 {\"_id\":\"e3\",\"title\":\"Movie tickets\",\"amount\":520,\"category\":\"other\",\"date\":\"2026-11-10\"}\nPATCH /api/expenses/e3 → 400 {\"message\":\"Validation failed\",\"errors\":{\"category\":\"Category must be one of: food, travel, rent, shopping, bills, other\"}}\nDELETE /api/expenses/e1 → 204\nGET /api/expenses/e1 → 404 {\"message\":\"Expense not found\"}\nGET /api/expenses → 200 {\"data\":[{\"_id\":\"e2\",\"title\":\"Metro card\",\"amount\":500,\"category\":\"travel\",\"date\":\"2026-11-05\"},{\"_id\":\"e3\",\"title\":\"Movie tickets\",\"amount\":520,\"category\":\"other\",\"date\":\"2026-11-10\"}],\"total\":1020}",
      explanation:
        'The invalid POST returns ALL problems at once in errors, keyed by field name, which React Hook Form can map with setError. The valid POST sends amount as the string "480" (as a form would) and the server coerces it to the number 480 and trims the title, like z.coerce and z.string().trim(). PATCH with partial=true validates only the fields sent, so { category: "fun" } fails while { amount: 520 } succeeds. DELETE returns 204 with an empty body, and the next GET of the same id is 404. Note the update copies only allowed keys: never spread req.body directly into a document (mass assignment).',
    },
    {
      title: 'Backend files: shared schema, Mongoose model, controller and routes',
      scenario: 'The production version of the same API with MongoDB, owner scoping and Express 5 async handlers.',
      steps: [
        'Create packages/shared with expense.schema.js and run npm install at the root',
        'Create server/src/models/Expense.js with an owner field and a compound index',
        'Create the controller using req.user.id (set by the auth middleware from Day 4)',
        'Create the routes with validate() and mount them in app.js',
        'Test with the requests from the previous example (Thunder Client / Postman)',
      ],
      code: `// ===== server/src/models/Expense.js =====
import mongoose from 'mongoose';
import { CATEGORIES } from '@mernshop/shared';

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 60 },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, enum: CATEGORIES, required: true },
    date: { type: Date, required: true },
    note: { type: String, maxlength: 200 },
  },
  { timestamps: true }
);
expenseSchema.index({ user: 1, date: -1 });   // "my expenses, newest first"
export const Expense = mongoose.model('Expense', expenseSchema);

// ===== server/src/controllers/expense.controller.js =====
import mongoose from 'mongoose';
import { Expense } from '../models/Expense.js';
import { AppError } from '../utils/AppError.js';

const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));
const FIELDS = ['title', 'amount', 'category', 'date', 'note'];

function ensureId(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, 'Invalid expense id');
}

export async function list(req, res) {
  const data = await Expense.find({ user: req.user.id }).sort({ date: -1 }).lean();
  const total = data.reduce((s, e) => s + e.amount, 0);
  res.json({ data, total });
}

export async function getOne(req, res) {
  ensureId(req.params.id);
  const exp = await Expense.findOne({ _id: req.params.id, user: req.user.id }).lean();
  if (!exp) throw new AppError(404, 'Expense not found');
  res.json(exp);
}

export async function create(req, res) {
  const exp = await Expense.create({ ...pick(req.body, FIELDS), user: req.user.id });
  res.status(201).location('/api/expenses/' + exp._id).json(exp);
}

export async function update(req, res) {
  ensureId(req.params.id);
  const exp = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    pick(req.body, FIELDS),
    { new: true, runValidators: true }
  );
  if (!exp) throw new AppError(404, 'Expense not found');
  res.json(exp);
}

export async function remove(req, res) {
  ensureId(req.params.id);
  const result = await Expense.deleteOne({ _id: req.params.id, user: req.user.id });
  if (result.deletedCount === 0) throw new AppError(404, 'Expense not found');
  res.sendStatus(204);
}

// ===== server/src/routes/expense.routes.js =====
import { Router } from 'express';
import { expenseSchema, expenseUpdateSchema } from '@mernshop/shared';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/expense.controller.js';

const router = Router();
router.use(requireAuth);
router.route('/').get(ctrl.list).post(validate(expenseSchema), ctrl.create);
router.route('/:id').get(ctrl.getOne).patch(validate(expenseUpdateSchema), ctrl.update).delete(ctrl.remove);
export default router;

// ===== server/src/app.js =====
// app.use('/api/expenses', expenseRoutes);`,
      result:
        'POST /api/expenses with a valid body returns 201 and a document with _id, user, createdAt and updatedAt. GET /api/expenses/123 returns 400 "Invalid expense id" instead of a Mongoose CastError 500. Another user\'s expense id returns 404.',
      explanation:
        'Controllers throw AppError and Express 5 forwards the error (even from async functions) to the error middleware from Day 1. pick() whitelists fields so a client cannot set user or _id. The compound index { user: 1, date: -1 } matches the query AND the sort, so MongoDB reads the results already in order. runValidators makes findOneAndUpdate respect min/enum rules.',
    },
    {
      title: 'Frontend files: hooks, reusable ExpenseForm with zodResolver, list page and routes',
      scenario: 'Build the React side of the slice using the same shared schema, React Hook Form and TanStack Query.',
      steps: [
        'npm i react-hook-form @hookform/resolvers react-router -w client',
        'Write src/api/expenses.queries.js with list/create/update/delete hooks',
        'Write ExpenseForm used by both NewExpense and EditExpense pages',
        'Write ExpensesPage with total, edit links and delete buttons',
        'Register routes in React Router 7 and test the full flow in the browser',
      ],
      code: `// ===== client/src/api/expenses.queries.js =====
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export const expenseKeys = { all: ['expenses'], detail: (id) => ['expenses', id] };

export const useExpenses = () =>
  useQuery({ queryKey: expenseKeys.all, queryFn: () => api.get('/expenses').then((r) => r.data) });

export const useExpense = (id) =>
  useQuery({ queryKey: expenseKeys.detail(id), queryFn: () => api.get('/expenses/' + id).then((r) => r.data), enabled: !!id });

function useInvalidatingMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }) });
}
export const useCreateExpense = () => useInvalidatingMutation((body) => api.post('/expenses', body).then((r) => r.data));
export const useUpdateExpense = () => useInvalidatingMutation(({ id, ...body }) => api.patch('/expenses/' + id, body).then((r) => r.data));
export const useDeleteExpense = () => useInvalidatingMutation((id) => api.delete('/expenses/' + id));

// ===== client/src/components/ExpenseForm.jsx =====
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema, CATEGORIES } from '@mernshop/shared';

export function ExpenseForm({ defaultValues, onSubmit, submitLabel = 'Save' }) {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues ?? { title: '', amount: '', category: 'food', date: new Date().toISOString().slice(0, 10), note: '' },
  });

  async function submit(values) {
    try {
      await onSubmit(values);
    } catch (err) {
      // server-side field errors → same place as client errors
      Object.entries(err.fieldErrors ?? {}).forEach(([field, message]) => setError(field, { message }));
      if (!err.fieldErrors) setError('root', { message: err.message });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <label>Title <input {...register('title')} /></label>
      {errors.title && <p className="error">{errors.title.message}</p>}

      <label>Amount (₹) <input type="number" step="0.01" {...register('amount')} /></label>
      {errors.amount && <p className="error">{errors.amount.message}</p>}

      <label>Category
        <select {...register('category')}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      <label>Date <input type="date" {...register('date')} /></label>
      {errors.date && <p className="error">{errors.date.message}</p>}

      <label>Note <textarea {...register('note')} /></label>
      {errors.root && <p className="error" role="alert">{errors.root.message}</p>}

      <button disabled={isSubmitting}>{isSubmitting ? 'Saving...' : submitLabel}</button>
    </form>
  );
}

// ===== client/src/pages/ExpensesPage.jsx =====
import { Link } from 'react-router';
import { useExpenses, useDeleteExpense } from '../api/expenses.queries';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export default function ExpensesPage() {
  const { data, isPending, isError, error, refetch } = useExpenses();
  const del = useDeleteExpense();

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p role="alert">{error.message} <button onClick={() => refetch()}>Retry</button></p>;

  return (
    <section>
      <header>
        <h1>Expenses ({inr.format(data.total)})</h1>
        <Link to="/expenses/new">+ Add expense</Link>
      </header>
      {data.data.length === 0 ? <p>No expenses yet.</p> : (
        <table>
          <tbody>
            {data.data.map((e) => (
              <tr key={e._id}>
                <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                <td>{e.title}</td>
                <td>{e.category}</td>
                <td>{inr.format(e.amount)}</td>
                <td>
                  <Link to={'/expenses/' + e._id + '/edit'}>Edit</Link>
                  <button
                    disabled={del.isPending}
                    onClick={() => window.confirm('Delete "' + e.title + '"?') && del.mutate(e._id)}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

// ===== client/src/pages/NewExpense.jsx & EditExpense.jsx =====
import { useNavigate, useParams } from 'react-router';
import { ExpenseForm } from '../components/ExpenseForm';
import { useCreateExpense, useExpense, useUpdateExpense } from '../api/expenses.queries';

export function NewExpense() {
  const navigate = useNavigate();
  const create = useCreateExpense();
  return <ExpenseForm submitLabel="Add" onSubmit={async (v) => { await create.mutateAsync(v); navigate('/expenses'); }} />;
}

export function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isPending } = useExpense(id);
  const update = useUpdateExpense();
  if (isPending) return <p>Loading...</p>;
  return (
    <ExpenseForm
      defaultValues={{ ...data, date: data.date.slice(0, 10), note: data.note ?? '' }}
      onSubmit={async (v) => { await update.mutateAsync({ id, ...v }); navigate('/expenses'); }}
    />
  );
}

// ===== client/src/App.jsx (React Router 7, declarative mode) =====
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/expenses" />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/expenses/new" element={<NewExpense />} />
        <Route path="/expenses/:id/edit" element={<EditExpense />} />
      </Routes>
    </BrowserRouter>
  );
}`,
      result:
        'Submitting the empty form shows "Title must be at least 3 characters" without any network request. A valid submit sends POST /api/expenses, navigates back, and the list (refetched through invalidation) shows the new row and the updated ₹ total. Editing pre-fills the form. Delete asks for confirmation, then the row disappears.',
      explanation:
        'zodResolver(expenseSchema) runs the exact same schema the server runs, so client and server messages are identical. mutateAsync returns a promise so the form can await it and catch server errors; the catch maps err.fieldErrors (from the Day 2 interceptor) onto fields with setError. The date input needs "YYYY-MM-DD", hence slice(0, 10) when editing. React Router 7 exports everything from the "react-router" package (react-router-dom is now just a re-export).',
    },
    {
      title: 'Working CRUD UI with shared validation rules (playground)',
      scenario:
        'Run the whole client-side flow in the browser: one validation function (standing in for the shared Zod schema), a fake async API, list with total, add/edit with one form, delete with confirm and field-level errors.',
      steps: [
        'Click Run. Try submitting an empty form to see field errors',
        'Add an expense, then click Edit on it and change the amount',
        'Delete a row and watch the total update',
        'Try the title "fail" to simulate a server-side rejection mapped to the field',
      ],
      code: `// The same validate() would be imported from '@mernshop/shared' in a real project
function validate(v) {
  const e = {};
  if (!v.title || v.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
  if (!(Number(v.amount) > 0)) e.amount = 'Amount must be greater than 0';
  return e;
}`,
      playground: {
        jsx: `const CATEGORIES = ['food', 'travel', 'rent', 'shopping', 'bills', 'other'];
function validate(v) {
  const e = {};
  if (!v.title || v.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
  if (!(Number(v.amount) > 0)) e.amount = 'Amount must be greater than 0';
  if (!CATEGORIES.includes(v.category)) e.category = 'Pick a category';
  return e;
}

let db = [
  { _id: 'e1', title: 'Groceries', amount: 1450, category: 'food' },
  { _id: 'e2', title: 'Metro card', amount: 500, category: 'travel' },
];
let seq = 3;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fakeApi = {
  async list() { await wait(300); return db.map((e) => ({ ...e })); },
  async save(body) {
    await wait(400);
    const errors = validate(body);
    if (body.title.trim().toLowerCase() === 'fail') errors.title = 'Server: this title is reserved';
    if (Object.keys(errors).length) throw { status: 400, message: 'Validation failed', fieldErrors: errors };
    const clean = { title: body.title.trim(), amount: Number(body.amount), category: body.category };
    if (body._id) { db = db.map((e) => (e._id === body._id ? { ...e, ...clean } : e)); return; }
    db.push({ _id: 'e' + seq++, ...clean });
  },
  async remove(id) { await wait(300); db = db.filter((e) => e._id !== id); },
};

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const empty = { title: '', amount: '', category: 'food' };

function ExpenseForm({ initial, onSaved, onCancel }) {
  const [v, setV] = React.useState(initial);
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const clientErrors = validate(v);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;     // no request at all
    setSaving(true);
    try { await fakeApi.save(v); onSaved(); }
    catch (err) { setErrors(err.fieldErrors || { root: err.message }); }
    finally { setSaving(false); }
  }
  const err = (k) => errors[k] && <div style={{ color: 'crimson', fontSize: 13 }}>{errors[k]}</div>;
  return (
    <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 6, maxWidth: 320, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
      <b>{v._id ? 'Edit expense' : 'New expense'}</b>
      <input placeholder="Title" value={v.title} onChange={set('title')} />{err('title')}
      <input placeholder="Amount" type="number" value={v.amount} onChange={set('amount')} />{err('amount')}
      <select value={v.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      {err('root')}
      <div>
        <button disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>{' '}
        {v._id && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

function App() {
  const [list, setList] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  const [formKey, setFormKey] = React.useState(0);
  const reload = () => fakeApi.list().then(setList);
  React.useEffect(() => { reload(); }, []);

  async function del(e) {
    if (!window.confirm('Delete "' + e.title + '"?')) return;
    await fakeApi.remove(e._id);
    reload();
  }
  const done = () => { setEditing(null); setFormKey((k) => k + 1); reload(); };

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <ExpenseForm key={editing ? editing._id : 'new-' + formKey} initial={editing || empty} onSaved={done} onCancel={() => setEditing(null)} />
      {!list ? <p>Loading...</p> : (
        <>
          <h3>Total: {inr.format(list.reduce((s, e) => s + e.amount, 0))}</h3>
          {list.length === 0 && <p>No expenses yet.</p>}
          {list.map((e) => (
            <div key={e._id} style={{ display: 'flex', gap: 10, padding: 4 }}>
              <span style={{ width: 140 }}>{e.title}</span>
              <span style={{ width: 70 }}>{e.category}</span>
              <span style={{ width: 90 }}>{inr.format(e.amount)}</span>
              <button onClick={() => setEditing(e)}>Edit</button>
              <button onClick={() => del(e)}>Delete</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}`,
      },
      result:
        'The list shows Groceries ₹1,450.00 and Metro card ₹500.00 with Total ₹1,950.00. Empty submit shows both field errors instantly. Adding "Chai" 40 updates the total to ₹1,990.00. Edit pre-fills the form; Cancel returns to "New expense". Title "fail" passes client checks but shows "Server: this title is reserved" under the title (server error mapped to the field).',
      explanation:
        'The key prop on ExpenseForm resets the form state when switching between create and edit (a fresh component instance). The client validates first and skips the request on errors; the server validates again and its fieldErrors land in the same errors object. In the real app TanStack Query replaces reload() with invalidateQueries, and React Hook Form + zodResolver replace the manual state.',
    },
  ],
  interview: [
    {
      q: 'Why validate on both the client and the server?',
      a: 'Client validation gives instant, friendly feedback and avoids useless requests, but it can be bypassed (DevTools, curl, Postman). Server validation is the real security and data-integrity check. The database schema (Mongoose) is a final safety net. Sharing one Zod schema avoids the rules drifting apart.',
      level: 'Easy',
    },
    {
      q: 'How do you share validation code between React and Express?',
      a: 'Put the Zod schemas in a shared package inside an npm workspaces monorepo (e.g. packages/shared, name @app/shared, "type": "module"). Both client and server depend on it; npm install symlinks it. The server uses schema.safeParse in a validate middleware; the client uses zodResolver(schema) with React Hook Form. With TypeScript, z.infer gives shared types too.',
      level: 'Medium',
    },
    {
      q: 'Which status codes should a CRUD API return for create, update, delete and not found?',
      a: 'Create: 201 Created (return the new resource, optionally a Location header). Read/update: 200 OK with the resource. Delete: 204 No Content (empty body) or 200 with a message. Not found: 404. Invalid input: 400 (some APIs use 422). Unauthenticated: 401. Forbidden: 403. Duplicate: 409.',
      level: 'Easy',
    },
    {
      q: 'PUT vs PATCH: which do you use for an edit form and why?',
      a: 'PUT replaces the entire resource, so the client must send every field (missing fields become empty). PATCH applies a partial update with only the changed fields. Edit forms usually use PATCH with a partial schema (schema.partial()) so you can also update a single field like status without resending everything.',
      level: 'Medium',
    },
    {
      q: 'What is mass assignment and how do you prevent it in Express + Mongoose?',
      a: 'Mass assignment is when you pass req.body directly into Model.create or findByIdAndUpdate, letting an attacker set fields they should not, like role: "admin", user: someoneElse or isPaid: true. Prevent it by whitelisting allowed fields (a pick() helper or a Zod schema that strips unknown keys, which is Zod\'s default behaviour with z.object), and by setting owner fields from req.user on the server.',
      level: 'Medium',
    },
    {
      q: 'Why use { new: true, runValidators: true } with findOneAndUpdate?',
      a: 'new: true returns the updated document instead of the old one (in Mongoose 8 you can also use returnDocument: "after"). runValidators: true makes Mongoose run schema validators (min, enum, maxlength) on the update; by default update queries skip validation, so invalid data could be saved.',
      level: 'Medium',
    },
    {
      q: 'How do you show a server-side validation error under the correct form field in React?',
      a: 'Have the API return a consistent shape like { message, errors: { field: message } } with status 400. Normalise it in the axios interceptor (fieldErrors). In the submit handler, catch the error and call React Hook Form\'s setError(field, { message }) for each entry, or setError("root", ...) for general errors. The input then shows the message exactly like a client-side error.',
      level: 'Medium',
    },
    {
      q: 'Why should every query include the owner (user) id, e.g. findOne({ _id, user: req.user.id })?',
      a: 'Because ids are not secrets. Without the owner filter, any logged-in user could read, edit or delete another user\'s document by changing the id in the URL. This vulnerability is called IDOR (Insecure Direct Object Reference) and is part of OWASP "Broken Access Control". Return 404 (not 403) to avoid revealing that the id exists.',
      level: 'Hard',
    },
    {
      q: 'What does z.coerce.number() do and why is it useful in forms?',
      a: 'It converts the input with Number(value) before validating. HTML inputs (and query strings) always produce strings, so "250" would fail z.number(); with coerce it becomes 250. Be careful: Number("") is 0, so combine with .positive() or a refine for required numeric fields.',
      level: 'Easy',
    },
    {
      q: 'What is a vertical slice and why build features that way?',
      a: 'A vertical slice is one feature implemented through every layer: schema, database model, API, client data hooks and UI. Building slice by slice gives a working, demo-able, testable feature early, exposes integration problems (CORS, field names, status codes) on day one, and keeps the team focused on user value instead of finishing layers nobody can use yet.',
      level: 'Medium',
    },
    {
      q: 'How would you handle an invalid MongoDB ObjectId in GET /api/items/:id?',
      a: 'Check mongoose.isValidObjectId(id) (or validate params with Zod) and return 400 "Invalid id" before querying. Otherwise Mongoose throws a CastError which, if not handled, becomes a 500. Alternatively map CastError to 400 in the global error handler.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write a shared Zod schema for a "Contact" (name 2-50 chars, email valid, phone exactly 10 digits Indian mobile starting with 6-9, tags optional array of strings max 5) plus a partial update schema, and an Express validate middleware that returns { message, errors } with 400.',
      hint: 'Use regex /^[6-9]\\d{9}$/ for the phone. Map issues by path.join(".").',
      solution: `// packages/shared/src/contact.schema.js
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  phone: z.string().regex(/^[6-9]\\d{9}$/, 'Enter a valid 10-digit mobile number'),
  tags: z.array(z.string().trim().min(1)).max(5, 'Maximum 5 tags').optional(),
});
export const contactUpdateSchema = contactSchema.partial();

// server/src/middleware/validate.js
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || 'root';
      errors[key] ??= issue.message;           // first message per field
    }
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  req.body = result.data;
  next();
};`,
    },
    {
      task: 'Write the Mongoose model, controller and router for Contacts with owner scoping, a unique index on { user, email } (same email allowed for different users), and map the duplicate key error to 409.',
      hint: 'Compound unique index; error code 11000.',
      solution: `// models/Contact.js
import mongoose from 'mongoose';
const contactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  tags: [String],
}, { timestamps: true });
contactSchema.index({ user: 1, email: 1 }, { unique: true });
export const Contact = mongoose.model('Contact', contactSchema);

// controllers/contact.controller.js
import { Contact } from '../models/Contact.js';
const FIELDS = ['name', 'email', 'phone', 'tags'];
const pick = (o) => Object.fromEntries(FIELDS.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));

export const list = async (req, res) =>
  res.json({ data: await Contact.find({ user: req.user.id }).sort('name').lean() });

export async function create(req, res) {
  try {
    const c = await Contact.create({ ...pick(req.body), user: req.user.id });
    res.status(201).json(c);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'A contact with this email already exists', errors: { email: 'Already in your contacts' } });
    throw err;
  }
}

export async function update(req, res) {
  const c = await Contact.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, pick(req.body), { new: true, runValidators: true });
  if (!c) return res.status(404).json({ message: 'Contact not found' });
  res.json(c);
}

export async function remove(req, res) {
  const r = await Contact.deleteOne({ _id: req.params.id, user: req.user.id });
  if (!r.deletedCount) return res.status(404).json({ message: 'Contact not found' });
  res.sendStatus(204);
}

// routes/contact.routes.js
import { Router } from 'express';
import { contactSchema, contactUpdateSchema } from '@mernshop/shared';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import * as c from '../controllers/contact.controller.js';
const router = Router();
router.use(requireAuth);
router.route('/').get(c.list).post(validate(contactSchema), c.create);
router.route('/:id').patch(validate(contactUpdateSchema), c.update).delete(c.remove);
export default router;`,
    },
    {
      task: 'Build a React ContactForm with React Hook Form + zodResolver(contactSchema) that works for create and edit, disables the button while submitting, and maps a 409 server error to the email field.',
      hint: 'Catch the error in onSubmit and use setError.',
      solution: `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '@mernshop/shared';

export function ContactForm({ defaultValues = { name: '', email: '', phone: '' }, onSubmit }) {
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues,
  });

  const submit = async (values) => {
    try {
      await onSubmit(values);
      if (!defaultValues._id) reset();
    } catch (err) {
      if (err.status === 409 || err.fieldErrors) {
        Object.entries(err.fieldErrors ?? { email: err.message }).forEach(([k, m]) => setError(k, { message: m }));
      } else {
        setError('root', { message: err.message });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <input placeholder="Name" {...register('name')} />
      {errors.name && <small>{errors.name.message}</small>}
      <input placeholder="Email" {...register('email')} />
      {errors.email && <small>{errors.email.message}</small>}
      <input placeholder="Mobile" inputMode="numeric" {...register('phone')} />
      {errors.phone && <small>{errors.phone.message}</small>}
      {errors.root && <p role="alert">{errors.root.message}</p>}
      <button disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save contact'}</button>
    </form>
  );
}

// usage
// const create = useCreateContact();
// <ContactForm onSubmit={(v) => create.mutateAsync(v)} />`,
    },
    {
      task: 'Write a delete flow with an accessible confirmation modal (instead of window.confirm) and TanStack Query: the row shows "Deleting..." while pending and the list refetches after success; on failure show a toast-like message.',
      hint: 'Keep the selected item in state; use the native <dialog> element.',
      solution: `import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete('/contacts/' + id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function ContactRow({ contact }) {
  const dialogRef = useRef(null);
  const [error, setError] = useState('');
  const del = useDeleteContact();

  const confirmDelete = () => {
    del.mutate(contact._id, {
      onSuccess: () => dialogRef.current.close(),
      onError: (e) => { setError(e.message); dialogRef.current.close(); },
    });
  };

  return (
    <li>
      {contact.name} {del.isPending && <em>Deleting...</em>}
      <button onClick={() => dialogRef.current.showModal()} disabled={del.isPending}>Delete</button>
      {error && <span role="alert">{error}</span>}
      <dialog ref={dialogRef} aria-labelledby={'del-' + contact._id}>
        <h3 id={'del-' + contact._id}>Delete {contact.name}?</h3>
        <p>This cannot be undone.</p>
        <button onClick={() => dialogRef.current.close()}>Cancel</button>
        <button onClick={confirmDelete} disabled={del.isPending}>Yes, delete</button>
      </dialog>
    </li>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'What is the main benefit of a shared Zod schema in a MERN monorepo?',
      options: [
        'It makes MongoDB queries faster',
        'Client and server enforce exactly the same validation rules from one source',
        'It removes the need for server-side validation',
        'It replaces Mongoose models completely',
      ],
      answer: 1,
      explanation: 'One schema, two consumers. The server still validates (security); the schema just guarantees the rules match.',
    },
    {
      question: 'Which response is most appropriate for a successful DELETE /api/expenses/:id?',
      options: ['201 Created', '404 Not Found', '302 Found', '204 No Content'],
      answer: 3,
      explanation: '204 means success with no body. 404 is for a missing resource.',
    },
    {
      question: 'Why is Expense.findByIdAndUpdate(req.params.id, req.body) dangerous?',
      options: [
        'It allows mass assignment and ignores ownership, so a user could edit other users\' data or protected fields',
        'findByIdAndUpdate is deprecated in Mongoose 8',
        'It always creates a new document',
        'It cannot update numbers',
      ],
      answer: 0,
      explanation: 'Whitelist fields and filter by { _id, user: req.user.id }. Also add runValidators: true.',
    },
    {
      question: 'A form input type="number" sends amount as "250". Which Zod rule accepts it as a number?',
      options: ['z.number()', 'z.string().number()', 'z.coerce.number()', 'z.int()'],
      answer: 2,
      explanation: 'z.coerce.number() converts the string with Number() before validating.',
    },
    {
      question: 'In React Hook Form, how do you display an error returned by the server for the "email" field?',
      options: [
        'alert(error)',
        'setError("email", { message })',
        'reset({ email: message })',
        'register("email", { error: message })',
      ],
      answer: 1,
      explanation: 'setError puts the message into formState.errors.email, so it renders exactly like a client-side validation error.',
    },
  ],
};
