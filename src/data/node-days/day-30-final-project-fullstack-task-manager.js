export default {
  id: 'day-30-final-project-fullstack-task-manager',
  title: 'Final Project: Full-stack Task Manager (React + Node/Express + MongoDB), Practical Test and Interview Questions',
  module: 'Module 6: Project',
  day: 30,
  level: 'Advanced',
  duration: '6 hours (project) + 1.5 hours (test and interview revision)',
  summary:
    'Put all 30 days together in one portfolio project: a multi-user Task Manager with a React front end and an Express 5 + MongoDB REST API featuring JWT auth, roles, validation, pagination/filtering, security middleware, tests and deployment. Then take the practical test and revise 35 interview questions covering the whole Node.js course.',
  objectives: [
    'Design and build a layered Express 5 API (routes → controllers → services → models) with MongoDB/Mongoose',
    'Implement JWT authentication, role-based and ownership authorization, validation, pagination, filtering and statistics',
    'Connect a React (Vite) front end with an auth context, protected routes and an API client',
    'Test the API with Jest + Supertest and deploy API + front end with environment configuration',
    'Answer 35 common Node.js / Express interview questions confidently',
  ],
  theory: [
    {
      heading: 'Project overview and requirements',
      content:
        '**TaskFlow** - a task manager for small teams.\n\nFunctional requirements:\n1. Users can register and log in (email + password). The first registered user becomes **admin**.\n2. Logged-in users create, read, update and delete **their own** tasks (title, description, status `todo | in-progress | done`, priority `low | medium | high`, due date).\n3. Task list supports **filtering** (status, priority), **search** (title), **sorting** and **pagination**.\n4. A dashboard shows **statistics** (count per status).\n5. Admins can see all users and all tasks.\n\nNon-functional requirements:\n- Passwords hashed with bcrypt, JWT access tokens, helmet, CORS whitelist, rate limit on auth routes, input validation with zod.\n- Consistent JSON errors `{ error, details? }` and correct status codes.\n- Automated tests for the main flows; deploy API on Render/Railway with MongoDB Atlas and front end on Vercel/Netlify/Render static.',
      points: [
        'Backend: Node 22, Express 5, Mongoose 8, bcrypt, jsonwebtoken, zod, helmet, cors, express-rate-limit, pino',
        'Frontend: React 19 + Vite, React Router, fetch wrapper (or axios), Context for auth',
        'Testing: Jest + Supertest (+ mongodb-memory-server)',
        'DevOps: GitHub, GitHub Actions CI, Render/Railway, MongoDB Atlas',
      ],
    },
    {
      heading: 'Architecture and folder structure',
      content:
        'We use a **layered architecture** so each file has one job:\n- **routes** - map URL + method to middleware and controller (no logic).\n- **middleware** - auth, validation, error handling.\n- **controllers** - read the request, call a service, send the response (HTTP layer).\n- **services** - business rules (ownership, stats); no `req`/`res`, so they are easy to unit-test.\n- **models** - Mongoose schemas and indexes.',
      syntax: 'taskflow/\n  server/\n    src/\n      config/env.js          # zod-validated environment\n      models/User.js  Task.js\n      middleware/auth.js  validate.js  error.js\n      services/task.service.js\n      controllers/auth.controller.js  task.controller.js\n      routes/auth.routes.js  task.routes.js\n      app.js                 # express app (exported for tests)\n    server.js                # connect DB + listen + graceful shutdown\n    tests/\n  client/                    # Vite React app\n    src/api.js  AuthContext.jsx  pages/  components/',
      tip: 'Keep app.js free of listen() and DB connection so Supertest can import it (Day 26). server.js is the only file that starts things.',
    },
    {
      heading: 'REST API design',
      content:
        'Endpoints (all JSON, prefix `/api`):\n- `POST /auth/register` → 201 user | 400 | 409\n- `POST /auth/login` → 200 `{ token, user }` | 401 | 429 (rate limited)\n- `GET /auth/me` → 200 current user | 401\n- `GET /tasks?status=&priority=&q=&sort=-createdAt&page=1&limit=10` → 200 `{ page, limit, total, data }`\n- `GET /tasks/stats` → 200 `{ total, todo, in-progress, done }`\n- `POST /tasks` → 201 | 400\n- `GET /tasks/:id`, `PATCH /tasks/:id`, `DELETE /tasks/:id` → 200/204 | 403 (not owner) | 404\n- `GET /admin/users` → 200 (admin) | 403\n\nNote route order: `/tasks/stats` must be registered **before** `/tasks/:id`, otherwise "stats" is treated as an id.\n\nAuthorization has two levels: **role** (`authorize("admin")`) and **ownership** (task.owner equals req.user.id, or admin). Missing ownership checks are the #1 API vulnerability (OWASP "Broken Object Level Authorization").',
    },
    {
      heading: 'Build plan (suggested 6-hour schedule)',
      content:
        '1. **Setup (30 min)** - repo, `server/` with npm init, install deps, `.env`, config validation, app.js/server.js split, health check.\n2. **Models (30 min)** - User (select:false password, pre-save hash), Task (owner ref, indexes `{ owner: 1, status: 1, createdAt: -1 }`, text index on title).\n3. **Auth (60 min)** - register/login/me, JWT middleware, authorize, rate limiting.\n4. **Tasks (75 min)** - zod schemas, service with ownership, controller, routes, pagination/filter/sort, stats aggregation.\n5. **Hardening (20 min)** - helmet, CORS, body limit, error handler, 404, logging.\n6. **Tests (45 min)** - Supertest for auth, CRUD, ownership, validation.\n7. **Frontend (75 min)** - Vite React app, AuthContext, login/register pages, task list with filters and pagination, create/edit form.\n8. **Deploy (25 min)** - Atlas, Render/Railway API, front end static hosting, CORS + VITE_API_URL, smoke test.',
      tip: 'Commit after every step with clear messages (feat: add task pagination). A clean Git history and a README with screenshots, API table and live links make the project interview-ready.',
    },
    {
      heading: 'Practical test (2 hours, 100 marks)',
      content:
        'Solve without looking at the solution, then compare:\n1. **(15)** Add a `dueDate` field to tasks; `GET /tasks?overdue=true` returns tasks whose dueDate is in the past and status is not done.\n2. **(15)** Add `PATCH /tasks/bulk-status` that accepts `{ ids: [...], status }` and updates only tasks owned by the user; return the number updated.\n3. **(15)** Add a `tags` array (max 5 tags, each 2-20 chars, lowercase) and filtering `?tag=urgent`.\n4. **(15)** Write Supertest tests: an expired/invalid token gives 401, another user\'s task gives 403, page 2 with limit 2 returns the right items.\n5. **(10)** Add an in-memory (or Redis) cache for `/tasks/stats` per user with 30 s TTL, invalidated on create/update/delete.\n6. **(10)** Emit a Socket.io event `task:updated` to room `user:<id>` whenever a task changes, and update the React list live.\n7. **(10)** Add `POST /auth/logout` with refresh-token rotation or tokenVersion invalidation.\n8. **(10)** Deploy and submit: live API URL, live front-end URL, GitHub repo with README and passing CI badge.\n\nSolutions to tasks 1, 2 and 4 are in the practice section.',
    },
  ],
  examples: [
    {
      title: 'Backend core: models, auth middleware, service, controller and routes',
      scenario: 'The production code of the TaskFlow API with Mongoose 8 and Express 5.',
      steps: [
        'mkdir taskflow && cd taskflow && mkdir server client && cd server && npm init -y',
        'npm install express mongoose bcrypt jsonwebtoken zod helmet cors express-rate-limit pino-http',
        'npm install --save-dev jest supertest mongodb-memory-server',
        'Create the files below inside server/src and server/server.js',
        'Create .env with MONGODB_URI, JWT_SECRET, CLIENT_URL and run node --env-file=.env server.js',
      ],
      code: `// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function (plain) { return bcrypt.compare(plain, this.password); };
userSchema.set('toJSON', { transform: (doc, ret) => { delete ret.password; delete ret.__v; return ret; } });
module.exports = mongoose.model('User', userSchema);

// src/models/Task.js
const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
  description: { type: String, maxlength: 2000 },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: Date,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });
taskSchema.index({ owner: 1, status: 1, createdAt: -1 });
taskSchema.index({ title: 'text' });
module.exports = mongoose.model('Task', taskSchema);

// src/utils/HttpError.js
class HttpError extends Error {
  constructor(status, message, details) { super(message); this.status = status; this.details = details; }
}
module.exports = HttpError;

// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const HttpError = require('../utils/HttpError');

exports.authenticate = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Unauthorized');
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { id: p.sub, role: p.role };
    next();
  } catch (err) {
    throw new HttpError(401, err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token');
  }
};
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw new HttpError(403, 'Forbidden');
  next();
};

// src/middleware/validate.js  (zod)
const HttpError = require('../utils/HttpError');
module.exports = (schema, part = 'body') => (req, res, next) => {
  const r = schema.safeParse(req[part] ?? {});
  if (!r.success) {
    throw new HttpError(400, 'Validation failed', r.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })));
  }
  req.validated = { ...req.validated, [part]: r.data };   // Express 5: req.query is read-only
  next();
};

// src/schemas/task.schema.js
const { z } = require('zod');
exports.createTask = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().max(2000).optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.coerce.date().optional(),
}).strict();
exports.updateTask = exports.createTask.partial();
exports.listQuery = z.object({
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  q: z.string().max(50).optional(),
  sort: z.enum(['createdAt', '-createdAt', 'dueDate', '-dueDate', 'priority', '-priority', 'title']).default('-createdAt'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// src/services/task.service.js
const mongoose = require('mongoose');
const Task = require('../models/Task');
const HttpError = require('../utils/HttpError');

const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

exports.list = async (user, { status, priority, q, sort, page, limit }) => {
  const filter = user.role === 'admin' ? {} : { owner: user.id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (q) filter.title = { $regex: escapeRegex(q), $options: 'i' };
  const [data, total] = await Promise.all([
    Task.find(filter).sort(sort + ' _id').skip((page - 1) * limit).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);
  return { page, limit, total, totalPages: Math.ceil(total / limit), data };
};

exports.getOwned = async (user, id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Task not found');
  const task = await Task.findById(id);
  if (!task) throw new HttpError(404, 'Task not found');
  if (String(task.owner) !== user.id && user.role !== 'admin') throw new HttpError(403, 'Not your task');
  return task;
};

exports.stats = async (user) => {
  const rows = await Task.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(user.id) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const result = { total: 0, todo: 0, 'in-progress': 0, done: 0 };
  for (const r of rows) { result[r._id] = r.count; result.total += r.count; }
  return result;
};

// src/controllers/task.controller.js
const Task = require('../models/Task');
const service = require('../services/task.service');
exports.list = async (req, res) => res.json(await service.list(req.user, req.validated.query));
exports.stats = async (req, res) => res.json(await service.stats(req.user));
exports.create = async (req, res) => res.status(201).json(await Task.create({ ...req.validated.body, owner: req.user.id }));
exports.get = async (req, res) => res.json(await service.getOwned(req.user, req.params.id));
exports.update = async (req, res) => {
  const task = await service.getOwned(req.user, req.params.id);
  Object.assign(task, req.validated.body);
  res.json(await task.save());          // save() runs schema validators
};
exports.remove = async (req, res) => {
  const task = await service.getOwned(req.user, req.params.id);
  await task.deleteOne();
  res.sendStatus(204);
};

// src/routes/task.routes.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../schemas/task.schema');
const c = require('../controllers/task.controller');

router.use(authenticate);
router.get('/', validate(schemas.listQuery, 'query'), c.list);
router.get('/stats', c.stats);                     // before /:id !
router.post('/', validate(schemas.createTask), c.create);
router.get('/:id', c.get);
router.patch('/:id', validate(schemas.updateTask), c.update);
router.delete('/:id', c.remove);
module.exports = router;

// src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');

exports.register = async (req, res) => {
  const isFirst = (await User.estimatedDocumentCount()) === 0;
  const user = await User.create({ ...req.validated.body, role: isFirst ? 'admin' : 'user' }); // 11000 -> 409 in error handler
  res.status(201).json(user);
};
exports.login = async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new HttpError(401, 'Invalid email or password');
  const token = jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  res.json({ token, user });
};
exports.me = async (req, res) => res.json(await User.findById(req.user.id));

// src/routes/auth.routes.js
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authRouter = require('express').Router();
const auth = require('../controllers/auth.controller');
const credentials = z.object({ email: z.email().toLowerCase(), password: z.string().min(8).max(72) });
authRouter.post('/register', validate(credentials.extend({ name: z.string().trim().min(2).max(60) }).strict()), auth.register);
authRouter.post('/login', validate(credentials), auth.login);
authRouter.get('/me', authenticate, auth.me);
module.exports = authRouter;

// src/routes/admin.routes.js
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Task = require('../models/Task');
const adminRouter = require('express').Router();
adminRouter.get('/users', authenticate, authorize('admin'), async (req, res) => {
  const counts = await Task.aggregate([{ $group: { _id: '$owner', tasks: { $sum: 1 } } }]);
  const byOwner = Object.fromEntries(counts.map(c => [String(c._id), c.tasks]));
  const users = await User.find().lean();
  res.json(users.map(({ password, __v, ...u }) => ({ ...u, tasks: byOwner[String(u._id)] || 0 })));
});
module.exports = adminRouter;

// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const pinoHttp = require('pino-http');
const HttpError = require('./utils/HttpError');

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','), credentials: true }));
app.use(express.json({ limit: '20kb' }));
if (process.env.NODE_ENV !== 'test') app.use(pinoHttp());

app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }), require('./routes/auth.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') err = new HttpError(400, 'Validation failed', Object.keys(err.errors));
  if (err.code === 11000) err = new HttpError(409, 'Email already registered');
  const status = err.status || 500;
  if (status === 500) req.log?.error(err);
  res.status(status).json({ error: status === 500 ? 'Internal Server Error' : err.message, ...(err.details && { details: err.details }) });
});
module.exports = app;

// server.js
const mongoose = require('mongoose');
const app = require('./src/app');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const server = app.listen(process.env.PORT || 3000, () => console.log('Server running on port ' + (process.env.PORT || 3000)));
  process.on('SIGTERM', () => server.close(() => mongoose.connection.close().then(() => process.exit(0))));
})();`,
      result:
        'node --env-file=.env server.js → "Server running on port 3000". The HTTP behaviour of this code is exactly what the next example shows in the API Lab (same routes, status codes and response shapes, with MongoDB ObjectIds instead of numeric ids and createdAt/updatedAt timestamps).',
      explanation:
        'Every layer has one responsibility: routes wire middleware, validate() converts zod issues into a 400 HttpError, the service enforces ownership, controllers stay tiny. Because Express 5 forwards thrown errors and rejected promises, there is not a single try/catch in the controllers - one error middleware formats every failure. Indexes match the main query (owner + status, sorted by createdAt).',
    },
    {
      title: 'API Lab: the complete Task Manager API in memory',
      scenario: 'Run the whole TaskFlow API flow in the API Lab: register, login, create/validate tasks, filter, sort, paginate, update, stats, ownership and admin checks. Data lives in arrays and tokens are demo strings so it runs in the simulator.',
      steps: [
        'Paste the code into the API Lab',
        'Send the requests in order - Asha registers first and becomes admin',
        'Ravi logs in (token-2) and manages his tasks; Meera (token-3) tries to read Ravi\'s task',
        'Compare each response with the production code in the previous example',
      ],
      code: `// Same API, production version: previous example (MongoDB + bcrypt + JWT)
// Simulator differences: arrays instead of collections, 'token-<id>' instead of JWT, plain password compare.`,
      api: {
        code: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\n// ---------- in-memory \"database\" ----------\nconst db = { users: [], tasks: [], sessions: new Map() };\nlet nextUserId = 1;\nlet nextTaskId = 1;\nconst STATUSES = ['todo', 'in-progress', 'done'];\nconst PRIORITIES = ['low', 'medium', 'high'];\n\n// ---------- helpers ----------\nclass HttpError extends Error {\n  constructor(status, message) { super(message); this.status = status; }\n}\nconst publicUser = ({ password, ...u }) => u;\n\n// ---------- auth ----------\napp.post('/api/auth/register', (req, res) => {\n  const { name, email, password } = req.body ?? {};\n  if (!name || !email || !password || password.length < 8) {\n    throw new HttpError(400, 'name, email and password (8+ chars) are required');\n  }\n  const normalized = email.trim().toLowerCase();\n  if (db.users.some(u => u.email === normalized)) throw new HttpError(409, 'Email already registered');\n  const user = { id: nextUserId++, name, email: normalized, password, role: db.users.length === 0 ? 'admin' : 'user' };\n  db.users.push(user);   // real app: bcrypt.hash(password, 12) + MongoDB\n  res.status(201).json(publicUser(user));\n});\n\napp.post('/api/auth/login', (req, res) => {\n  const { email, password } = req.body ?? {};\n  const user = db.users.find(u => u.email === String(email).toLowerCase() && u.password === password);\n  if (!user) throw new HttpError(401, 'Invalid email or password');\n  const token = 'token-' + user.id;               // real app: jwt.sign({ sub, role }, secret, { expiresIn: '15m' })\n  db.sessions.set(token, user.id);\n  res.json({ token, user: publicUser(user) });\n});\n\nfunction authenticate(req, res, next) {\n  const [scheme, token] = (req.headers.authorization || '').split(' ');\n  const userId = scheme === 'Bearer' ? db.sessions.get(token) : undefined;\n  if (!userId) throw new HttpError(401, 'Unauthorized');\n  req.user = db.users.find(u => u.id === userId);\n  next();\n}\nconst authorize = (...roles) => (req, res, next) => {\n  if (!roles.includes(req.user.role)) throw new HttpError(403, 'Forbidden');\n  next();\n};\n\n// ---------- tasks (all routes require login) ----------\nconst tasks = express.Router();\ntasks.use(authenticate);\n\nfunction validateTask(body, partial = false) {\n  const errors = [];\n  if (!partial || body.title !== undefined) {\n    if (typeof body.title !== 'string' || body.title.trim().length < 3) errors.push('title must have at least 3 characters');\n  }\n  if (body.status !== undefined && !STATUSES.includes(body.status)) errors.push('status must be one of ' + STATUSES.join(', '));\n  if (body.priority !== undefined && !PRIORITIES.includes(body.priority)) errors.push('priority must be one of ' + PRIORITIES.join(', '));\n  if (errors.length) { const e = new HttpError(400, 'Validation failed'); e.details = errors; throw e; }\n}\n\nfunction findOwnTask(req) {\n  const task = db.tasks.find(t => t.id === Number(req.params.id));\n  if (!task) throw new HttpError(404, 'Task not found');\n  if (task.ownerId !== req.user.id && req.user.role !== 'admin') throw new HttpError(403, 'Not your task');\n  return task;\n}\n\ntasks.get('/', (req, res) => {\n  const { status, priority, q, sort = '-id' } = req.query;\n  let list = db.tasks.filter(t => req.user.role === 'admin' || t.ownerId === req.user.id);\n  if (status) list = list.filter(t => t.status === status);\n  if (priority) list = list.filter(t => t.priority === priority);\n  if (q) list = list.filter(t => t.title.toLowerCase().includes(String(q).toLowerCase()));\n  const field = String(sort).replace(/^-/, '');\n  const dir = String(sort).startsWith('-') ? -1 : 1;\n  if (['id', 'title', 'priority'].includes(field)) {\n    list = [...list].sort((a, b) => (a[field] > b[field] ? dir : a[field] < b[field] ? -dir : 0));\n  }\n  const page = Math.max(parseInt(req.query.page) || 1, 1);\n  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);\n  res.json({ page, limit, total: list.length, data: list.slice((page - 1) * limit, page * limit) });\n});\n\ntasks.get('/stats', (req, res) => {\n  const mine = db.tasks.filter(t => t.ownerId === req.user.id);\n  const byStatus = Object.fromEntries(STATUSES.map(s => [s, mine.filter(t => t.status === s).length]));\n  res.json({ total: mine.length, ...byStatus });\n});\n\ntasks.post('/', (req, res) => {\n  const body = req.body ?? {};\n  validateTask(body);\n  const task = {\n    id: nextTaskId++, title: body.title.trim(), status: body.status || 'todo',\n    priority: body.priority || 'medium', ownerId: req.user.id,\n  };\n  db.tasks.push(task);\n  res.status(201).json(task);\n});\n\ntasks.get('/:id', (req, res) => res.json(findOwnTask(req)));\n\ntasks.patch('/:id', (req, res) => {\n  const task = findOwnTask(req);\n  const body = req.body ?? {};\n  validateTask(body, true);\n  for (const key of ['title', 'status', 'priority']) if (body[key] !== undefined) task[key] = key === 'title' ? body.title.trim() : body[key];\n  res.json(task);\n});\n\ntasks.delete('/:id', (req, res) => {\n  const task = findOwnTask(req);\n  db.tasks = db.tasks.filter(t => t !== task);\n  res.sendStatus(204);\n});\n\napp.use('/api/tasks', tasks);\n\n// ---------- admin ----------\napp.get('/api/admin/users', authenticate, authorize('admin'), (req, res) => {\n  res.json(db.users.map(u => ({ ...publicUser(u), tasks: db.tasks.filter(t => t.ownerId === u.id).length })));\n});\n\n// ---------- 404 + error handler ----------\napp.use((req, res) => res.status(404).json({ error: 'Route not found' }));\napp.use((err, req, res, next) => {\n  const status = err.status || 500;\n  res.status(status).json({ error: status === 500 ? 'Internal Server Error' : err.message, ...(err.details && { details: err.details }) });\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));",
        requests: [
          { method: 'POST', url: '/api/auth/register', body: { name: 'Asha', email: 'asha@mail.com', password: 'Secret@123' } },
          { method: 'POST', url: '/api/auth/register', body: { name: 'Ravi', email: 'ravi@mail.com', password: 'Secret@456' } },
          { method: 'POST', url: '/api/auth/register', body: { name: 'Meera', email: 'meera@mail.com', password: 'Secret@789' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'ravi@mail.com', password: 'Secret@456' } },
          { method: 'POST', url: '/api/tasks', body: { title: 'Design login page', priority: 'high' }, headers: { Authorization: 'Bearer token-2' } },
          { method: 'POST', url: '/api/tasks', body: { title: 'Write API tests', status: 'in-progress' }, headers: { Authorization: 'Bearer token-2' } },
          { method: 'POST', url: '/api/tasks', body: { title: 'Deploy to Render', priority: 'low' }, headers: { Authorization: 'Bearer token-2' } },
          { method: 'POST', url: '/api/tasks', body: { title: 'No', priority: 'urgent' }, headers: { Authorization: 'Bearer token-2' } },
          { method: 'GET', url: '/api/tasks' },
          { method: 'GET', url: '/api/tasks?sort=title&limit=2', headers: { Authorization: 'Bearer token-2' } },
          { method: 'GET', url: '/api/tasks?status=in-progress', headers: { Authorization: 'Bearer token-2' } },
          { method: 'PATCH', url: '/api/tasks/1', body: { status: 'done' }, headers: { Authorization: 'Bearer token-2' } },
          { method: 'GET', url: '/api/tasks/stats', headers: { Authorization: 'Bearer token-2' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'meera@mail.com', password: 'Secret@789' } },
          { method: 'GET', url: '/api/tasks/1', headers: { Authorization: 'Bearer token-3' } },
          { method: 'DELETE', url: '/api/tasks/3', headers: { Authorization: 'Bearer token-2' } },
          { method: 'GET', url: '/api/tasks/3', headers: { Authorization: 'Bearer token-2' } },
          { method: 'GET', url: '/api/admin/users', headers: { Authorization: 'Bearer token-2' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'asha@mail.com', password: 'Secret@123' } },
          { method: 'GET', url: '/api/admin/users', headers: { Authorization: 'Bearer token-1' } },
          { method: 'GET', url: '/api/nothing' },
        ],
      },
      result: "POST /api/auth/register → 201 {\"id\":1,\"name\":\"Asha\",\"email\":\"asha@mail.com\",\"role\":\"admin\"}\nPOST /api/auth/register → 201 {\"id\":2,\"name\":\"Ravi\",\"email\":\"ravi@mail.com\",\"role\":\"user\"}\nPOST /api/auth/register → 201 {\"id\":3,\"name\":\"Meera\",\"email\":\"meera@mail.com\",\"role\":\"user\"}\nPOST /api/auth/login → 200 {\"token\":\"token-2\",\"user\":{\"id\":2,\"name\":\"Ravi\",\"email\":\"ravi@mail.com\",\"role\":\"user\"}}\nPOST /api/tasks → 201 {\"id\":1,\"title\":\"Design login page\",\"status\":\"todo\",\"priority\":\"high\",\"ownerId\":2}\nPOST /api/tasks → 201 {\"id\":2,\"title\":\"Write API tests\",\"status\":\"in-progress\",\"priority\":\"medium\",\"ownerId\":2}\nPOST /api/tasks → 201 {\"id\":3,\"title\":\"Deploy to Render\",\"status\":\"todo\",\"priority\":\"low\",\"ownerId\":2}\nPOST /api/tasks → 400 {\"error\":\"Validation failed\",\"details\":[\"title must have at least 3 characters\",\"priority must be one of low, medium, high\"]}\nGET /api/tasks → 401 {\"error\":\"Unauthorized\"}\nGET /api/tasks?sort=title&limit=2 → 200 {\"page\":1,\"limit\":2,\"total\":3,\"data\":[{\"id\":3,\"title\":\"Deploy to Render\",\"status\":\"todo\",\"priority\":\"low\",\"ownerId\":2},{\"id\":1,\"title\":\"Design login page\",\"status\":\"todo\",\"priority\":\"high\",\"ownerId\":2}]}\nGET /api/tasks?status=in-progress → 200 {\"page\":1,\"limit\":10,\"total\":1,\"data\":[{\"id\":2,\"title\":\"Write API tests\",\"status\":\"in-progress\",\"priority\":\"medium\",\"ownerId\":2}]}\nPATCH /api/tasks/1 → 200 {\"id\":1,\"title\":\"Design login page\",\"status\":\"done\",\"priority\":\"high\",\"ownerId\":2}\nGET /api/tasks/stats → 200 {\"total\":3,\"todo\":1,\"in-progress\":1,\"done\":1}\nPOST /api/auth/login → 200 {\"token\":\"token-3\",\"user\":{\"id\":3,\"name\":\"Meera\",\"email\":\"meera@mail.com\",\"role\":\"user\"}}\nGET /api/tasks/1 → 403 {\"error\":\"Not your task\"}\nDELETE /api/tasks/3 → 204\nGET /api/tasks/3 → 404 {\"error\":\"Task not found\"}\nGET /api/admin/users → 403 {\"error\":\"Forbidden\"}\nPOST /api/auth/login → 200 {\"token\":\"token-1\",\"user\":{\"id\":1,\"name\":\"Asha\",\"email\":\"asha@mail.com\",\"role\":\"admin\"}}\nGET /api/admin/users → 200 [{\"id\":1,\"name\":\"Asha\",\"email\":\"asha@mail.com\",\"role\":\"admin\",\"tasks\":0},{\"id\":2,\"name\":\"Ravi\",\"email\":\"ravi@mail.com\",\"role\":\"user\",\"tasks\":2},{\"id\":3,\"name\":\"Meera\",\"email\":\"meera@mail.com\",\"role\":\"user\",\"tasks\":0}]\nGET /api/nothing → 404 {\"error\":\"Route not found\"}",
      explanation:
        'Validation collects all errors at once (title too short + invalid priority). Without a token every task route returns 401 because the router uses authenticate. Sorting by title puts "Deploy to Render" before "Design login page" (alphabetical) and limit=2 paginates. Meera is authenticated but not the owner → 403. The deleted task returns 404 afterwards. Only the admin can list users, and the list never contains passwords. Errors thrown in synchronous handlers are forwarded to the error middleware by Express automatically.',
    },
    {
      title: 'Supertest suite for the project',
      scenario: 'Lock the most important behaviour - auth required, validation, ownership, filtering, stats and admin access - with automated tests that run in CI.',
      steps: [
        'Export the app from src/app.js (here: the in-memory version from the API Lab with app.listen replaced by module.exports = app)',
        'Create tests/tasks.test.js with the code below',
        'Run npx jest --verbose',
        'For the MongoDB version add tests/setupDb.js with mongodb-memory-server (Day 26)',
      ],
      code: "const request = require('supertest');\nconst app = require('../src/app');\n\nlet adminToken, userToken, otherToken;\n\nbeforeAll(async () => {\n  const users = [\n    ['Asha', 'asha@mail.com'], ['Ravi', 'ravi@mail.com'], ['Meera', 'meera@mail.com'],\n  ];\n  for (const [name, email] of users) {\n    await request(app).post('/api/auth/register').send({ name, email, password: 'Secret@123' }).expect(201);\n  }\n  const login = async (email) =>\n    (await request(app).post('/api/auth/login').send({ email, password: 'Secret@123' })).body.token;\n  adminToken = await login('asha@mail.com');\n  userToken = await login('ravi@mail.com');\n  otherToken = await login('meera@mail.com');\n});\n\nconst as = (token) => ({ Authorization: 'Bearer ' + token });\n\ndescribe('Task Manager API', () => {\n  test('rejects requests without a token', async () => {\n    await request(app).get('/api/tasks').expect(401, { error: 'Unauthorized' });\n  });\n\n  test('creates a task with defaults', async () => {\n    const res = await request(app).post('/api/tasks').set(as(userToken)).send({ title: '  Write tests  ' });\n    expect(res.status).toBe(201);\n    expect(res.body).toMatchObject({ title: 'Write tests', status: 'todo', priority: 'medium' });\n  });\n\n  test('validates input and returns all errors', async () => {\n    const res = await request(app).post('/api/tasks').set(as(userToken)).send({ title: 'x', status: 'later' });\n    expect(res.status).toBe(400);\n    expect(res.body.details).toHaveLength(2);\n  });\n\n  test(\"users cannot read or delete other users' tasks\", async () => {\n    const { body: task } = await request(app).post('/api/tasks').set(as(userToken)).send({ title: 'Private task' });\n    await request(app).get('/api/tasks/' + task.id).set(as(otherToken)).expect(403);\n    await request(app).delete('/api/tasks/' + task.id).set(as(otherToken)).expect(403);\n    await request(app).get('/api/tasks/' + task.id).set(as(adminToken)).expect(200);   // admin may\n  });\n\n  test('filters by status and reports stats', async () => {\n    const { body: task } = await request(app).post('/api/tasks').set(as(userToken)).send({ title: 'Ship it' });\n    await request(app).patch('/api/tasks/' + task.id).set(as(userToken)).send({ status: 'done' }).expect(200);\n\n    const done = await request(app).get('/api/tasks?status=done').set(as(userToken));\n    expect(done.body.data.map(t => t.title)).toEqual(['Ship it']);\n\n    const stats = await request(app).get('/api/tasks/stats').set(as(userToken));\n    expect(stats.body).toEqual({ total: 3, todo: 2, 'in-progress': 0, done: 1 });\n  });\n\n  test('only admins can list users', async () => {\n    await request(app).get('/api/admin/users').set(as(userToken)).expect(403);\n    const res = await request(app).get('/api/admin/users').set(as(adminToken)).expect(200);\n    expect(res.body).toHaveLength(3);\n    expect(res.body[0]).not.toHaveProperty('password');\n  });\n});",
      result: `PASS tests/tasks.test.js
  Task Manager API
    ✓ rejects requests without a token (9 ms)
    ✓ creates a task with defaults (8 ms)
    ✓ validates input and returns all errors (6 ms)
    ✓ users cannot read or delete other users' tasks (17 ms)
    ✓ filters by status and reports stats (16 ms)
    ✓ only admins can list users (8 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total`,
      explanation:
        'beforeAll registers three users and logs them in once; the small as(token) helper keeps each request readable. The ownership test checks both the forbidden case (403 for Meera) and the allowed admin case. The stats assertion uses toEqual on the whole object, so any accidental extra or missing field fails the test.',
    },
    {
      title: 'React front end: API client, AuthContext, protected route and task list',
      scenario: 'Build the client in client/ with Vite and connect it to the API.',
      steps: [
        'cd client && npm create vite@latest . -- --template react && npm install react-router-dom',
        'Create .env with VITE_API_URL=http://localhost:3000',
        'Create src/api.js, src/AuthContext.jsx, src/ProtectedRoute.jsx and src/pages/Tasks.jsx',
        'npm run dev, register, log in and manage tasks; deploy with npm run build (dist/) to Vercel/Netlify and set VITE_API_URL to the live API URL',
      ],
      code: `// src/api.js
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function api(path, { token, method = 'GET', body } = {}) {
  const res = await fetch(BASE + '/api' + path, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: 'Bearer ' + token }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, details: data.details });
  return data;
}

// src/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => JSON.parse(sessionStorage.getItem('auth') || 'null'));
  const login = async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    sessionStorage.setItem('auth', JSON.stringify(data));
    setAuth(data);
  };
  const logout = () => { sessionStorage.removeItem('auth'); setAuth(null); };
  return <AuthContext.Provider value={{ user: auth?.user, token: auth?.token, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

// src/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

// src/pages/Tasks.jsx
import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Tasks() {
  const { token, user, logout } = useAuth();
  const [filters, setFilters] = useState({ status: '', q: '', page: 1 });
  const [result, setResult] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== ''));
    try { setResult(await api('/tasks?' + params, { token })); }
    catch (err) { if (err.status === 401) logout(); else setError(err.message); }
  };
  useEffect(() => { load(); }, [filters]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api('/tasks', { token, method: 'POST', body: { title } });
      setTitle(''); setError(''); load();
    } catch (err) { setError(err.details ? err.details.map(d => d.message ?? d).join(', ') : err.message); }
  };
  const toggle = async (t) => { await api('/tasks/' + (t._id ?? t.id), { token, method: 'PATCH', body: { status: t.status === 'done' ? 'todo' : 'done' } }); load(); };
  const remove = async (t) => { await api('/tasks/' + (t._id ?? t.id), { token, method: 'DELETE' }); load(); };

  const pages = Math.ceil(result.total / result.limit) || 1;
  return (
    <main>
      <header>Hi {user?.name} <button onClick={logout}>Logout</button></header>
      <form onSubmit={create}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New task" />
        <button>Add</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}>
        <option value="">All</option><option value="todo">To do</option>
        <option value="in-progress">In progress</option><option value="done">Done</option>
      </select>
      <input placeholder="Search" value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value, page: 1 })} />
      <ul>
        {result.data.map(t => (
          <li key={t._id ?? t.id}>
            <input type="checkbox" checked={t.status === 'done'} onChange={() => toggle(t)} />
            {t.title} <small>({t.priority})</small>
            <button onClick={() => remove(t)}>Delete</button>
          </li>
        ))}
      </ul>
      <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Prev</button>
      <span> Page {result.page} of {pages} </span>
      <button disabled={filters.page >= pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
    </main>
  );
}

// src/main.jsx (routes)
// <AuthProvider><BrowserRouter><Routes>
//   <Route path="/login" element={<Login />} />
//   <Route path="/" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
// </Routes></BrowserRouter></AuthProvider>`,
      result:
        'Logged-in users see their tasks with a status filter, live search and Prev/Next pagination. Adding "No" shows the validation message from the API; an expired token (401) logs the user out automatically. After deploying, the browser network tab shows calls to https://<your-api>/api/tasks with the Authorization header and CORS allowing the front-end origin.',
      explanation:
        'One api() helper centralises base URL, JSON headers, the Bearer token and error conversion, so components only handle data. AuthContext keeps the token for the session (a production refinement is the httpOnly refresh-cookie pattern from Day 23). The list re-fetches whenever filters change; the server does the filtering and pagination, so the client stays fast with thousands of tasks.',
    },
  ],
  interview: [
    { q: 'What is Node.js and why is it good for APIs?', a: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine with libuv providing an event loop and non-blocking I/O. It handles many concurrent I/O-bound connections with one thread efficiently, shares a language with the front end and has the huge npm ecosystem.', level: 'Easy' },
    { q: 'Explain the Node.js event loop phases.', a: 'After running the main script, the loop cycles through timers (setTimeout/setInterval callbacks), pending callbacks, poll (I/O events, waits for new ones), check (setImmediate), and close callbacks. Between each callback, process.nextTick and Promise microtasks are drained.', level: 'Hard' },
    { q: 'process.nextTick vs setImmediate vs setTimeout(fn, 0)?', a: 'nextTick runs right after the current operation, before promise microtasks and before the loop continues. setImmediate runs in the check phase after I/O polling. setTimeout(0) runs in the timers phase; order relative to setImmediate is non-deterministic in the main module but setImmediate is first inside an I/O callback.', level: 'Hard' },
    { q: 'Is Node.js single-threaded?', a: 'JavaScript execution is single-threaded per process (event loop), but libuv uses a thread pool (default 4) for file system, DNS, crypto and zlib work, and you can use worker_threads, child processes or cluster for parallelism.', level: 'Medium' },
    { q: 'CommonJS vs ES Modules?', a: 'CommonJS uses require/module.exports, loads synchronously and is the historical Node default. ESM uses import/export, is statically analysable (tree shaking), supports top-level await and is the standard; enabled via "type": "module" or .mjs. Node 22 can also require() synchronous ESM.', level: 'Easy' },
    { q: 'What is middleware in Express?', a: 'A function (req, res, next) in the request pipeline that can read/modify req and res, end the response, or call next() to pass control (next(err) jumps to error middleware). Used for parsing, logging, auth, validation, CORS, error handling. Order of app.use matters.', level: 'Easy' },
    { q: 'How do you handle errors in Express 5 compared to Express 4?', a: 'Both use 4-argument error middleware (err, req, res, next) registered last. Express 5 automatically forwards rejected promises/throws from async handlers to it, so no try/catch or express-async-handler wrapper is needed just for forwarding. Express 4 required next(err) or wrappers for async errors.', level: 'Medium' },
    { q: 'Name other notable Express 5 changes.', a: 'Async error forwarding; req.query is a read-only getter and the default query parser is "simple"; path-to-regexp v8 syntax (named wildcards like /*splat, optional segments with braces, no regex chars in strings); removed deprecated methods (res.send(status), app.del, req.param()); req.body is undefined when no parser ran; Node 18+ required.', level: 'Hard' },
    { q: 'What is the difference between PUT and PATCH?', a: 'PUT replaces the whole resource with the request body (idempotent); PATCH applies a partial update to specific fields. In our API PATCH /tasks/:id updates only provided fields.', level: 'Easy' },
    { q: 'Which status codes would you return for create, delete, validation error, not logged in, forbidden, not found, conflict and rate limited?', a: '201 Created, 204 No Content, 400 Bad Request (or 422), 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 429 Too Many Requests; 500 for unexpected server errors.', level: 'Easy' },
    { q: 'What makes an API RESTful?', a: 'Resources identified by URLs (nouns, plural), standard HTTP methods for actions, stateless requests, proper status codes, representations (JSON), cacheability, consistent naming/versioning (/api/v1), and HATEOAS links in the strict definition.', level: 'Medium' },
    { q: 'How is a JWT structured and validated?', a: 'header.payload.signature in base64url. The server recomputes the signature with its secret/public key and checks claims like exp, iss and aud using jwt.verify with a pinned algorithm. The payload is readable, so it must not contain secrets.', level: 'Medium' },
    { q: 'How do you store passwords securely?', a: 'Hash with a slow, salted algorithm (bcrypt cost >= 10, or Argon2id), never store plain text or reversible encryption, compare with bcrypt.compare, enforce length limits, and rate-limit login.', level: 'Easy' },
    { q: 'Authentication vs authorization in your project?', a: 'Authentication: authenticate middleware verifies the JWT and sets req.user (401 on failure). Authorization: authorize("admin") checks roles, and the service checks ownership of each task (403 when the user is not the owner and not admin).', level: 'Medium' },
    { q: 'What is BOLA / IDOR and how did you prevent it?', a: 'Broken Object Level Authorization (Insecure Direct Object Reference): a user accesses another user\'s object by changing an id in the URL. Prevent by checking ownership on every object access (task.owner === req.user.id) or scoping queries by owner, never trusting ids alone.', level: 'Hard' },
    { q: 'How do you prevent NoSQL injection in Mongoose?', a: 'Validate and type-cast input with schemas (zod), whitelist filter fields, never pass raw req.body/req.query objects as filters, enable mongoose sanitizeFilter or express-mongo-sanitize, and escape regex input.', level: 'Medium' },
    { q: 'Explain CORS and how you configured it for the project.', a: 'Browsers block cross-origin responses unless the server allows the origin. The API uses cors({ origin: CLIENT_URL list, credentials: true }) so only the React app\'s domains can call it from a browser; preflight OPTIONS requests are answered automatically.', level: 'Medium' },
    { q: 'What does helmet do?', a: 'Sets security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Cross-Origin policies) and removes X-Powered-By, reducing XSS, clickjacking and information leakage risk.', level: 'Easy' },
    { q: 'Mongoose: what are schemas, models and documents?', a: 'A schema defines the shape, types, validation, defaults, indexes, hooks and methods. A model is a compiled constructor bound to a collection (mongoose.model("Task", schema)) used for queries. A document is an instance of a model representing one record, with save()/deleteOne() etc.', level: 'Easy' },
    { q: 'What does populate() do and what is the cost?', a: 'It replaces an ObjectId reference with the referenced document by running an extra query (using $in for arrays). Convenient for relationships, but adds queries; select only needed fields, avoid deep populate, or use $lookup aggregation for complex reports.', level: 'Medium' },
    { q: 'lean() - when and why?', a: 'lean() returns plain JS objects instead of Mongoose documents: faster and lighter, ideal for read-only list endpoints. You lose getters/setters, virtuals (unless plugin), save() and other document methods.', level: 'Medium' },
    { q: 'How do you implement pagination and what are the trade-offs?', a: 'Offset: skip((page-1)*limit).limit(limit) plus countDocuments - simple, allows page jumps, slower for deep pages and unstable with inserts. Cursor/keyset: filter by _id/createdAt greater than the last seen value - fast and stable, ideal for infinite scroll.', level: 'Medium' },
    { q: 'SQL vs NoSQL - why MongoDB for this project and when would you choose MySQL/Postgres?', a: 'MongoDB suits flexible, document-shaped data (task with tags, nested settings) and fast iteration. Relational DBs are better for strongly relational data, complex joins, strict schemas and multi-row transactions (finance, inventory). Both can work for a task manager; the decision depends on data relations and team skills.', level: 'Medium' },
    { q: 'How do you validate request bodies?', a: 'With a schema library (zod/Joi/express-validator) in a middleware: parse, coerce types, apply defaults, reject unknown keys (mass assignment), and respond 400 with field-level messages. Mongoose schema validation is a second safety net at the database layer.', level: 'Easy' },
    { q: 'How do you test an Express API?', a: 'Unit tests (Jest) for pure services/utils with mocks; integration tests with Supertest against the exported app and an isolated DB (mongodb-memory-server); cover success and error paths (401/403/404/400), run in CI on every push, track coverage.', level: 'Medium' },
    { q: 'What are streams and when would you use them?', a: 'Streams process data in chunks (Readable, Writable, Duplex, Transform) instead of loading everything into memory. Use for large files, CSV exports, uploads/downloads, proxying, compression; pipeline() handles backpressure and errors.', level: 'Medium' },
    { q: 'How do you scale a Node.js application?', a: 'Vertically: cluster/PM2 to use all cores. Horizontally: multiple stateless instances behind a load balancer with shared state in Redis/DB, caching, CDN for static assets, background job queues for heavy work, DB indexes/read replicas, and the Socket.io Redis adapter for real-time features.', level: 'Hard' },
    { q: 'How do you find a memory leak in Node.js?', a: 'Monitor heap usage over time (process.memoryUsage, APM), take heap snapshots with --inspect/Chrome DevTools or heapdump and compare them, look for growing arrays/maps (unbounded caches), forgotten listeners/timers and closures holding large objects; fix and verify under load.', level: 'Hard' },
    { q: 'What happens when an unhandled promise rejection or uncaught exception occurs?', a: 'Since Node 15 an unhandled rejection crashes the process by default (like an uncaught exception). Best practice: handle errors properly, log in process.on("uncaughtException"/"unhandledRejection") handlers, then exit and let PM2/the platform restart a clean process - do not keep running in an unknown state.', level: 'Hard' },
    { q: 'How do WebSockets / Socket.io fit into a REST API project?', a: 'REST handles CRUD and history; Socket.io pushes real-time events (task updated, notifications) to rooms like user:<id>. The REST controller emits after saving, the client updates its UI without polling. Authenticate sockets with JWT in io.use.', level: 'Medium' },
    { q: 'What environment variables does your project need and how are they managed?', a: 'PORT, NODE_ENV, MONGODB_URI, JWT_SECRET, CLIENT_URL (and SMTP/S3 keys if used). Locally in a git-ignored .env loaded with node --env-file; in production in Render/Railway settings; validated with zod at startup; .env.example documents them.', level: 'Easy' },
    { q: 'Walk me through what happens when the React app calls GET /api/tasks?status=done.', a: 'Browser sends the request (preflight if cross-origin with Authorization) → load balancer/HTTPS → Express: helmet, cors, json parser, logger → task router → authenticate verifies JWT → validate parses query with zod → controller → service builds { owner, status } filter → MongoDB uses the compound index → lean results + count → JSON response with pagination → React updates state and renders.', level: 'Hard' },
    { q: 'How did you deploy the project?', a: 'MongoDB Atlas cluster with a dedicated user and network rule; API on Render/Railway from GitHub with npm ci / npm start, env vars, /healthz health check, trust proxy and graceful shutdown; front end built with Vite and hosted as static site with VITE_API_URL; CORS set to the front-end URL; GitHub Actions runs tests before triggering the deploy hook.', level: 'Medium' },
    { q: 'What is the difference between dependencies and devDependencies, and npm install vs npm ci?', a: 'dependencies are needed at runtime (express, mongoose); devDependencies only for development/testing (jest, nodemon) and are skipped with npm ci --omit=dev in production images. npm ci installs exactly from package-lock.json for reproducible builds.', level: 'Easy' },
    { q: 'If you had one more week, what would you improve in this project?', a: 'Refresh tokens in httpOnly cookies, email verification and password reset, Socket.io live updates, Redis caching and rate-limit store, file attachments to S3, OpenAPI/Swagger docs, end-to-end tests with Playwright, TypeScript, observability (structured logs + metrics + alerts) and Docker Compose for local development.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Practical test Q1: add dueDate to tasks and support GET /api/tasks?overdue=true (dueDate in the past and status not done) in the Mongoose service.',
      hint: 'Extend the zod listQuery with overdue: z.enum(["true","false"]).optional() and add a filter.',
      solution: `// schemas/task.schema.js
exports.listQuery = exports.listQuery.extend({
  overdue: z.enum(['true', 'false']).optional(),
});

// services/task.service.js (inside list)
if (query.overdue === 'true') {
  filter.dueDate = { $lt: new Date() };
  filter.status = { $ne: 'done' };
}
// index to keep it fast:
taskSchema.index({ owner: 1, dueDate: 1, status: 1 });`,
    },
    {
      task: 'Practical test Q2: PATCH /api/tasks/bulk-status with { ids, status } that updates only the caller\'s tasks and returns how many were modified.',
      hint: 'updateMany with { _id: { $in: ids }, owner: req.user.id }; register the route before /:id.',
      solution: `// schema
exports.bulkStatus = z.object({
  ids: z.array(z.string().regex(/^[a-f0-9]{24}$/)).min(1).max(100),
  status: z.enum(['todo', 'in-progress', 'done']),
}).strict();

// route (before router.patch('/:id', ...))
router.patch('/bulk-status', validate(schemas.bulkStatus), async (req, res) => {
  const { ids, status } = req.validated.body;
  const result = await Task.updateMany({ _id: { $in: ids }, owner: req.user.id }, { $set: { status } });
  res.json({ matched: result.matchedCount, modified: result.modifiedCount });
});`,
    },
    {
      task: 'Practical test Q4: write Supertest tests for an invalid token (401) and pagination (page 2, limit 2) for the in-memory TaskFlow app.',
      hint: 'Create 3 tasks first; page 2 with limit 2 must contain exactly 1 item.',
      solution: `test('invalid token -> 401', async () => {
  await request(app).get('/api/tasks').set('Authorization', 'Bearer not-a-token').expect(401);
});

test('page 2 with limit 2 returns the third task', async () => {
  const token = otherToken;            // Meera has no tasks yet
  const titles = ['Task A', 'Task B', 'Task C'];
  for (const title of titles) await request(app).post('/api/tasks').set(as(token)).send({ title });
  const res = await request(app).get('/api/tasks?q=task&sort=title&page=2&limit=2').set(as(token)).expect(200);
  expect(res.body.page).toBe(2);
  expect(res.body.data.map(t => t.title)).toEqual(['Task C']);
});`,
    },
    {
      task: 'Add a task stats endpoint using MongoDB aggregation that returns counts per priority and per status in one query ($facet).',
      hint: '$match owner, then $facet with two $group stages.',
      solution: `exports.detailedStats = async (user) => {
  const [result] = await Task.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(user.id) } },
    { $facet: {
      byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
      byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
      total: [{ $count: 'n' }],
    } },
  ]);
  const toObj = (rows) => Object.fromEntries(rows.map(r => [r._id, r.count]));
  return { total: result.total[0]?.n ?? 0, byStatus: toObj(result.byStatus), byPriority: toObj(result.byPriority) };
};`,
    },
    {
      task: 'Write the README section "API Endpoints" for your project as a Markdown table, plus run/deploy instructions.',
      hint: 'Columns: Method, Path, Auth, Description.',
      solution: `## API Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | - | Create account (first user = admin) |
| POST | /api/auth/login | - | Get JWT access token |
| GET | /api/auth/me | user | Current user |
| GET | /api/tasks | user | List own tasks (?status, priority, q, sort, page, limit) |
| GET | /api/tasks/stats | user | Counts per status |
| POST | /api/tasks | user | Create task |
| GET/PATCH/DELETE | /api/tasks/:id | owner/admin | Read / update / delete task |
| GET | /api/admin/users | admin | All users with task counts |

## Run locally
cp server/.env.example server/.env   # fill MONGODB_URI, JWT_SECRET
cd server && npm ci && npm run dev
cd client && npm ci && npm run dev

## Deploy
API: Render web service (root: server, build: npm ci, start: npm start, health: /healthz)
Client: Vercel/Netlify (root: client, build: npm run build, output: dist, env VITE_API_URL)`,
    },
  ],
  quiz: [
    { question: 'Why must GET /api/tasks/stats be registered before GET /api/tasks/:id?', options: ['Express sorts routes alphabetically', 'Otherwise "stats" is matched as the :id parameter', 'Stats routes must always be first in Express 5', 'It does not matter'], answer: 1, explanation: 'Routes match in registration order; /:id would capture "stats".' },
    { question: 'A logged-in user requests another user\'s task by id. Correct response?', options: ['200 with the task', '401 Unauthorized', '403 Forbidden (or 404 to hide existence)', '500'], answer: 2, explanation: 'Ownership check fails → 403 (some APIs return 404 to avoid revealing the id exists).' },
    { question: 'In Express 5, what happens when an async controller throws?', options: ['The process crashes', 'The request hangs forever', 'The error is ignored', 'The error is forwarded to the error-handling middleware'], answer: 3, explanation: 'Express 5 catches rejected promises from handlers and calls next(err).' },
    { question: 'Which layer should contain the ownership rule "only the owner or an admin can edit a task"?', options: ['The service layer (business logic)', 'The Mongoose connection', 'The React component only', 'package.json'], answer: 0, explanation: 'Business rules live in services; the UI may hide buttons but the server must enforce it.' },
    { question: 'Which setting lets the deployed React app call the API from the browser?', options: ['helmet()', 'A CORS whitelist containing the front-end origin', 'express.static()', 'trust proxy'], answer: 1, explanation: 'CORS must allow the front-end origin (and credentials if cookies are used).' },
  ],
};
