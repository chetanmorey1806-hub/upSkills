// MERN final projects. The backend is built and auto-tested in the browser (Express simulator from the API Lab);
// the frontend, database and deployment parts are milestones the student completes in VS Code.
// Each test starts a FRESH server from the student's code and sends its requests in order.
// expect: { status, json (deep partial match), length (array length), headers: { name: substring } }

const RUBRIC = [
  ['Automated API tests pass', 50],
  ['Milestones completed (frontend, database, deployment)', 20],
  ['Code quality: folder structure, naming, no repetition', 10],
  ['Validation & error handling (400/401/404 with clear messages)', 10],
  ['Presentation: can explain the architecture in an interview', 10],
];

export const MERN_PROJECTS = [
  {
    id: 'task-manager', icon: '✅', level: 'Beginner', hours: '8-10 hours', title: 'Task Manager (MERN CRUD)',
    summary: 'A to-do / task manager: REST API with full CRUD, validation and filtering, then a React UI and MongoDB storage.',
    skills: ['Express routing', 'REST & status codes', 'Validation', 'React CRUD UI', 'Mongoose model'],
    story: 'A small team wants a simple task board. Every task has a title, a status (todo, doing, done) and a priority. They need an API first, then a clean React screen to add, edit, filter and delete tasks.',
    api: [
      ['GET', '/api/tasks', 'List tasks, optional ?status=todo|doing|done'],
      ['GET', '/api/tasks/:id', 'One task or 404'],
      ['POST', '/api/tasks', 'Create: title required (3+ chars); status defaults to "todo"; priority low|medium|high (default medium) → 201'],
      ['PATCH', '/api/tasks/:id', 'Update title/status/priority (validate) → 200 or 404'],
      ['DELETE', '/api/tasks/:id', 'Delete → 204 or 404'],
    ],
    milestones: [
      { title: 'Backend API (in the browser)', tasks: ['All routes pass the automated tests', 'Return { error: "…" } with the right status for bad input'] },
      { title: 'React frontend', tasks: ['Vite + React app with a task list and an "Add task" form', 'Filter buttons (All / Todo / Doing / Done) using ?status=', 'Edit status with a dropdown and delete with confirmation', 'Loading and error states'] },
      { title: 'MongoDB', tasks: ['Create a Task Mongoose model with validation and timestamps', 'Replace the in-memory array with Task.find/create/findByIdAndUpdate/findByIdAndDelete', 'Store MONGO_URI in .env'] },
      { title: 'Ship it', tasks: ['Deploy API on Render and frontend on Vercel/Netlify', 'Push to GitHub with a README (features, screenshots, live link)'] },
    ],
    hints: ['Keep tasks in an array and an auto-increment nextId counter.', 'Number(req.params.id) converts the URL id to a number.', 'res.status(204).end() for a successful delete.', 'Validate with a small helper function so POST and PATCH share the rules.'],
    starter: `const express = require('express');
const app = express();
app.use(express.json());

// In-memory "database" (replace with MongoDB later)
let tasks = [
  { id: 1, title: 'Learn Express routing', status: 'done', priority: 'high' },
  { id: 2, title: 'Build the React UI', status: 'doing', priority: 'medium' },
];
let nextId = 3;

// TODO: GET /api/tasks  (support ?status=)
// TODO: GET /api/tasks/:id
// TODO: POST /api/tasks
// TODO: PATCH /api/tasks/:id
// TODO: DELETE /api/tasks/:id

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.listen(3000, () => console.log('Task API running on port 3000'));
`,
    solution: `const express = require('express');
const app = express();
app.use(express.json());

let tasks = [
  { id: 1, title: 'Learn Express routing', status: 'done', priority: 'high' },
  { id: 2, title: 'Build the React UI', status: 'doing', priority: 'medium' },
];
let nextId = 3;
const STATUS = ['todo', 'doing', 'done'];
const PRIORITY = ['low', 'medium', 'high'];

function validate(body, partial) {
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length < 3) return 'title must be at least 3 characters';
  }
  if (body.status !== undefined && !STATUS.includes(body.status)) return 'status must be todo, doing or done';
  if (body.priority !== undefined && !PRIORITY.includes(body.priority)) return 'priority must be low, medium or high';
  return null;
}
const findTask = (req) => tasks.find((t) => t.id === Number(req.params.id));

app.get('/api/tasks', (req, res) => {
  const { status } = req.query;
  res.json(status ? tasks.filter((t) => t.status === status) : tasks);
});

app.get('/api/tasks/:id', (req, res) => {
  const task = findTask(req);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.post('/api/tasks', (req, res) => {
  const error = validate(req.body || {}, false);
  if (error) return res.status(400).json({ error });
  const { title, status = 'todo', priority = 'medium' } = req.body;
  const task = { id: nextId++, title: title.trim(), status, priority };
  tasks.push(task);
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const task = findTask(req);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const error = validate(req.body || {}, true);
  if (error) return res.status(400).json({ error });
  ['title', 'status', 'priority'].forEach((k) => { if (req.body[k] !== undefined) task[k] = k === 'title' ? req.body[k].trim() : req.body[k]; });
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const task = findTask(req);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  tasks = tasks.filter((t) => t !== task);
  res.status(204).end();
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.listen(3000, () => console.log('Task API running on port 3000'));
`,
    tests: [
      { name: 'GET /api/tasks lists all tasks', steps: [{ method: 'GET', url: '/api/tasks', expect: { status: 200, length: 2 } }] },
      { name: 'GET /api/tasks?status=done filters', steps: [{ method: 'GET', url: '/api/tasks?status=done', expect: { status: 200, length: 1, json: [{ id: 1 }] } }] },
      { name: 'GET /api/tasks/:id returns one task', steps: [{ method: 'GET', url: '/api/tasks/2', expect: { status: 200, json: { id: 2, status: 'doing' } } }] },
      { name: 'Unknown id gives 404 with an error message', steps: [{ method: 'GET', url: '/api/tasks/1', expect: { status: 200, json: { id: 1 } } }, { method: 'GET', url: '/api/tasks/99', expect: { status: 404, json: { error: '' } } }] },
      { name: 'POST creates a task with defaults (201)', steps: [{ method: 'POST', url: '/api/tasks', body: { title: '  Write tests ' }, expect: { status: 201, json: { id: 3, title: 'Write tests', status: 'todo', priority: 'medium' } } }, { method: 'GET', url: '/api/tasks', expect: { length: 3 } }] },
      { name: 'POST validates title, status and priority (400)', steps: [{ method: 'POST', url: '/api/tasks', body: { title: 'ab' }, expect: { status: 400 } }, { method: 'POST', url: '/api/tasks', body: { title: 'Valid title', status: 'later' }, expect: { status: 400 } }, { method: 'POST', url: '/api/tasks', body: { title: 'Valid title', priority: 'urgent' }, expect: { status: 400 } }] },
      { name: 'PATCH updates only the given fields', steps: [{ method: 'PATCH', url: '/api/tasks/2', body: { status: 'done' }, expect: { status: 200, json: { id: 2, status: 'done', title: 'Build the React UI' } } }, { method: 'PATCH', url: '/api/tasks/2', body: { status: 'x' }, expect: { status: 400 } }, { method: 'PATCH', url: '/api/tasks/77', body: { status: 'done' }, expect: { status: 404 } }] },
      { name: 'DELETE removes the task (204, then 404)', steps: [{ method: 'DELETE', url: '/api/tasks/1', expect: { status: 204 } }, { method: 'GET', url: '/api/tasks/1', expect: { status: 404 } }, { method: 'DELETE', url: '/api/tasks/1', expect: { status: 404 } }] },
    ],
    mongoose: `// models/Task.js
const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3 },
  status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
}, { timestamps: true });
module.exports = mongoose.model('Task', taskSchema);`,
    viva: ['Why does POST return 201 and DELETE 204?', 'Difference between PUT and PATCH?', 'How would you add pagination to GET /api/tasks?', 'Where do you validate: frontend, backend or both? Why?', 'How does your React app know a task was deleted (state update vs refetch)?'],
  },

  {
    id: 'student-api', icon: '🎓', level: 'Intermediate', hours: '10-12 hours', title: 'Student Records API (search, sort, pagination)',
    summary: 'A college student-records API with search, filters, sorting and paginated responses, nested routes with express.Router, and an admin dashboard in React.',
    skills: ['express.Router', 'Query params', 'Pagination', 'Sorting & filtering', 'Error middleware'],
    story: 'The placement cell has 200+ student records. Recruiters need to search by name, filter by branch and minimum CGPA, sort by CGPA and page through the results quickly. Build the API that powers this dashboard.',
    api: [
      ['GET', '/api/students', '?search=&branch=&minCgpa=&sort=cgpa|-cgpa|name&page=1&limit=5 → { data, page, limit, total, totalPages }'],
      ['GET', '/api/students/:id', 'One student or 404'],
      ['POST', '/api/students', 'Create: name, branch (CSE|IT|ENTC|MECH), cgpa 0-10 → 201'],
      ['GET', '/api/stats/branches', 'Count and average CGPA per branch'],
    ],
    milestones: [
      { title: 'Backend API (in the browser)', tasks: ['Students router mounted at /api/students', 'Search, filter, sort and pagination all work together', 'Central error-handling middleware returns { error }'] },
      { title: 'React dashboard', tasks: ['Table with search box (debounced 300 ms)', 'Branch dropdown + min CGPA slider', 'Sortable column headers and Prev/Next pagination', 'Keep filters in the URL with useSearchParams'] },
      { title: 'MongoDB', tasks: ['Mongoose Student model with an index on { branch: 1, cgpa: -1 }', 'Implement the list with find().sort().skip().limit() and countDocuments()', 'Implement /api/stats/branches with an aggregation pipeline ($group, $avg)'] },
      { title: 'Ship it', tasks: ['Deploy and add 30+ seed students with a seed script', 'README with API documentation table'] },
    ],
    hints: ['Parse numbers: Number(req.query.page) || 1.', 'Filter first, then sort, then slice for the page.', 'const router = express.Router(); app.use("/api/students", router).', 'For "-cgpa", the leading "-" means descending.'],
    starter: `const express = require('express');
const app = express();
app.use(express.json());

const students = [
  { id: 1, name: 'Asha Patil', branch: 'CSE', cgpa: 8.9 },
  { id: 2, name: 'Ravi Kumar', branch: 'IT', cgpa: 7.2 },
  { id: 3, name: 'Neha Shah', branch: 'CSE', cgpa: 9.4 },
  { id: 4, name: 'Imran Khan', branch: 'ENTC', cgpa: 6.8 },
  { id: 5, name: 'Priya Desai', branch: 'IT', cgpa: 8.1 },
  { id: 6, name: 'Rahul Joshi', branch: 'CSE', cgpa: 7.8 },
  { id: 7, name: 'Sneha More', branch: 'MECH', cgpa: 7.5 },
  { id: 8, name: 'Karan Mehta', branch: 'CSE', cgpa: 8.6 },
];
let nextId = 9;

const router = express.Router();
// TODO: router.get('/', …)  search, branch, minCgpa, sort, page, limit
// TODO: router.get('/:id', …)
// TODO: router.post('/', …)
app.use('/api/students', router);

// TODO: app.get('/api/stats/branches', …)

// TODO: error-handling middleware (err, req, res, next)
app.listen(3000, () => console.log('Student API on port 3000'));
`,
    solution: `const express = require('express');
const app = express();
app.use(express.json());

const students = [
  { id: 1, name: 'Asha Patil', branch: 'CSE', cgpa: 8.9 },
  { id: 2, name: 'Ravi Kumar', branch: 'IT', cgpa: 7.2 },
  { id: 3, name: 'Neha Shah', branch: 'CSE', cgpa: 9.4 },
  { id: 4, name: 'Imran Khan', branch: 'ENTC', cgpa: 6.8 },
  { id: 5, name: 'Priya Desai', branch: 'IT', cgpa: 8.1 },
  { id: 6, name: 'Rahul Joshi', branch: 'CSE', cgpa: 7.8 },
  { id: 7, name: 'Sneha More', branch: 'MECH', cgpa: 7.5 },
  { id: 8, name: 'Karan Mehta', branch: 'CSE', cgpa: 8.6 },
];
let nextId = 9;
const BRANCHES = ['CSE', 'IT', 'ENTC', 'MECH'];

const router = express.Router();

router.get('/', (req, res) => {
  const { search = '', branch, minCgpa, sort = 'name' } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 5));
  let list = students.filter((s) => s.name.toLowerCase().includes(String(search).toLowerCase()));
  if (branch) list = list.filter((s) => s.branch === branch);
  if (minCgpa) list = list.filter((s) => s.cgpa >= Number(minCgpa));
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  if (!['name', 'cgpa'].includes(field)) return res.status(400).json({ error: 'sort must be name, cgpa or -cgpa' });
  list = [...list].sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * (desc ? -1 : 1));
  const total = list.length;
  res.json({ data: list.slice((page - 1) * limit, page * limit), page, limit, total, totalPages: Math.ceil(total / limit) });
});

router.get('/:id', (req, res, next) => {
  const s = students.find((x) => x.id === Number(req.params.id));
  if (!s) { const err = new Error('Student not found'); err.status = 404; return next(err); }
  res.json(s);
});

router.post('/', (req, res) => {
  const { name, branch, cgpa } = req.body || {};
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name is required' });
  if (!BRANCHES.includes(branch)) return res.status(400).json({ error: 'branch must be one of ' + BRANCHES.join(', ') });
  if (typeof cgpa !== 'number' || cgpa < 0 || cgpa > 10) return res.status(400).json({ error: 'cgpa must be a number between 0 and 10' });
  const s = { id: nextId++, name, branch, cgpa };
  students.push(s);
  res.status(201).json(s);
});

app.use('/api/students', router);

app.get('/api/stats/branches', (req, res) => {
  const map = {};
  students.forEach((s) => { (map[s.branch] ||= []).push(s.cgpa); });
  const stats = Object.entries(map).map(([branch, list]) => ({ branch, count: list.length, avgCgpa: Math.round((list.reduce((a, b) => a + b, 0) / list.length) * 100) / 100 }));
  res.json(stats.sort((a, b) => b.count - a.count || a.branch.localeCompare(b.branch)));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});
app.listen(3000, () => console.log('Student API on port 3000'));
`,
    tests: [
      { name: 'Default list is page 1 of 5, sorted by name', steps: [{ method: 'GET', url: '/api/students', expect: { status: 200, json: { page: 1, limit: 5, total: 8, totalPages: 2, data: [{ name: 'Asha Patil' }, { name: 'Imran Khan' }, { name: 'Karan Mehta' }, { name: 'Neha Shah' }, { name: 'Priya Desai' }] } } }] },
      { name: 'Page 2 returns the remaining students', steps: [{ method: 'GET', url: '/api/students?page=2', expect: { status: 200, json: { page: 2, data: [{ name: 'Rahul Joshi' }, { name: 'Ravi Kumar' }, { name: 'Sneha More' }] } } }] },
      { name: 'Search is case-insensitive', steps: [{ method: 'GET', url: '/api/students?search=SHA', expect: { json: { total: 2, data: [{ name: 'Asha Patil' }, { name: 'Neha Shah' }] } } }] },
      { name: 'Filter by branch and minCgpa, sort by -cgpa', steps: [{ method: 'GET', url: '/api/students?branch=CSE&minCgpa=8&sort=-cgpa', expect: { json: { total: 3, data: [{ name: 'Neha Shah' }, { name: 'Asha Patil' }, { name: 'Karan Mehta' }] } } }] },
      { name: 'Custom limit', steps: [{ method: 'GET', url: '/api/students?limit=3&sort=cgpa', expect: { json: { limit: 3, totalPages: 3, data: [{ cgpa: 6.8 }, { cgpa: 7.2 }, { cgpa: 7.5 }] } } }] },
      { name: 'GET /:id uses the error middleware for 404', steps: [{ method: 'GET', url: '/api/students/3', expect: { status: 200, json: { name: 'Neha Shah' } } }, { method: 'GET', url: '/api/students/42', expect: { status: 404, json: { error: 'Student not found' } } }] },
      { name: 'POST validates and creates (201)', steps: [{ method: 'POST', url: '/api/students', body: { name: 'Pooja Nair', branch: 'CIVIL', cgpa: 9 }, expect: { status: 400 } }, { method: 'POST', url: '/api/students', body: { name: 'Pooja Nair', branch: 'IT', cgpa: 11 }, expect: { status: 400 } }, { method: 'POST', url: '/api/students', body: { name: 'Pooja Nair', branch: 'IT', cgpa: 9.1 }, expect: { status: 201, json: { id: 9, branch: 'IT' } } }, { method: 'GET', url: '/api/students?branch=IT', expect: { json: { total: 3 } } }] },
      { name: 'Branch statistics', steps: [{ method: 'GET', url: '/api/stats/branches', expect: { status: 200, json: [{ branch: 'CSE', count: 4, avgCgpa: 8.68 }, { branch: 'IT', count: 2, avgCgpa: 7.65 }, { branch: 'ENTC', count: 1 }, { branch: 'MECH', count: 1 }] } }] },
    ],
    mongoose: `// GET /api/students with Mongoose
const filter = { name: { $regex: search, $options: 'i' } };
if (branch) filter.branch = branch;
if (minCgpa) filter.cgpa = { $gte: Number(minCgpa) };
const [data, total] = await Promise.all([
  Student.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
  Student.countDocuments(filter),
]);
res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });`,
    viva: ['Offset (skip/limit) vs cursor pagination: which scales better and why?', 'Which index would you create for this query and why (ESR rule)?', 'Why put filters in the URL on the frontend?', 'How does Express know a middleware is an error handler?', 'How do you prevent a huge limit=100000 request?'],
  },

  {
    id: 'auth-api', icon: '🔐', level: 'Intermediate', hours: '10-12 hours', title: 'Authentication & Roles API',
    summary: 'Register, login, logout, a protected profile route and admin-only routes using bearer tokens and middleware, then the same flow with bcrypt + JWT + React protected routes.',
    skills: ['Auth middleware', 'Bearer tokens', 'Role-based access', '401 vs 403', 'React protected routes'],
    story: 'Every MERN app needs login. In the browser lab you build the full flow with simple random tokens so you can focus on the logic; in VS Code you switch to bcrypt password hashing and JWT, and protect React pages.',
    api: [
      ['POST', '/api/auth/register', 'name, email, password (8+ chars) → 201 { id, name, email, role } (never return the password); duplicate email → 409'],
      ['POST', '/api/auth/login', 'email, password → 200 { token, user } or 401'],
      ['GET', '/api/me', 'Header Authorization: Bearer <token> → 200 user, missing/invalid token → 401'],
      ['POST', '/api/auth/logout', 'Invalidates the token → 204'],
      ['GET', '/api/admin/users', 'Admin only: list users without passwords; logged-in non-admin → 403'],
    ],
    milestones: [
      { title: 'Backend API (in the browser)', tasks: ['register/login/me/logout/admin routes pass all tests', 'requireAuth and requireRole(role) middleware functions', 'Passwords never appear in any response'] },
      { title: 'Real security in VS Code', tasks: ['Hash passwords with bcrypt (cost 10+)', 'Issue a JWT (15 min) and a refresh token in an httpOnly cookie', 'Add rate limiting to /login'] },
      { title: 'React frontend', tasks: ['Login and Register pages with validation', 'AuthContext storing the user; axios interceptor adds the token', 'ProtectedRoute and AdminRoute components with React Router'] },
      { title: 'MongoDB & ship', tasks: ['User model with unique email index and select: false on password', 'Deploy and test the full flow on the live site'] },
    ],
    hints: ['Store tokens in a Map: token → userId. crypto.randomUUID() makes a token.', 'Read the header: (req.headers.authorization || "").replace("Bearer ", "").', 'Return a copy without the password: const { password, ...safe } = user.', '401 = not logged in, 403 = logged in but not allowed.'],
    starter: `const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

// In the lab passwords are stored as plain text to keep the focus on the flow.
// In a real app ALWAYS hash them with bcrypt.
const users = [{ id: 1, name: 'Admin', email: 'admin@upskillr.dev', password: 'admin12345', role: 'admin' }];
let nextId = 2;
const tokens = new Map(); // token -> userId

// TODO: function requireAuth(req, res, next)
// TODO: function requireRole(role)

// TODO: POST /api/auth/register
// TODO: POST /api/auth/login
// TODO: GET /api/me
// TODO: POST /api/auth/logout
// TODO: GET /api/admin/users

app.listen(3000, () => console.log('Auth API on port 3000'));
`,
    solution: `const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

const users = [{ id: 1, name: 'Admin', email: 'admin@upskillr.dev', password: 'admin12345', role: 'admin' }];
let nextId = 2;
const tokens = new Map();
const safe = ({ password, ...u }) => u;

function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const userId = tokens.get(token);
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ error: 'Please log in' });
  req.user = user;
  req.token = token;
  next();
}
const requireRole = (role) => (req, res, next) => (req.user.role === role ? next() : res.status(403).json({ error: 'Forbidden' }));

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !/^\\S+@\\S+\\.\\S+$/.test(email)) return res.status(400).json({ error: 'name and a valid email are required' });
  if (!password || password.length < 8) return res.status(400).json({ error: 'password must be at least 8 characters' });
  if (users.some((u) => u.email === email.toLowerCase())) return res.status(409).json({ error: 'Email already registered' });
  const user = { id: nextId++, name, email: email.toLowerCase(), password, role: 'user' };
  users.push(user);
  res.status(201).json(safe(user));
});

app.post('/api/auth/login', (req, res) => {
  const { email = '', password } = req.body || {};
  const user = users.find((u) => u.email === email.toLowerCase());
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid email or password' });
  const token = crypto.randomUUID();
  tokens.set(token, user.id);
  res.json({ token, user: safe(user) });
});

app.get('/api/me', requireAuth, (req, res) => res.json(safe(req.user)));

app.post('/api/auth/logout', requireAuth, (req, res) => {
  tokens.delete(req.token);
  res.status(204).end();
});

app.get('/api/admin/users', requireAuth, requireRole('admin'), (req, res) => res.json(users.map(safe)));

app.listen(3000, () => console.log('Auth API on port 3000'));
`,
    tests: [
      { name: 'Register returns the user without the password (201)', steps: [{ method: 'POST', url: '/api/auth/register', body: { name: 'Asha', email: 'Asha@Example.com', password: 'secret123' }, expect: { status: 201, json: { id: 2, name: 'Asha', email: 'asha@example.com', role: 'user' }, absent: ['password'] } }] },
      { name: 'Register validation: short password, bad email, duplicate (409)', steps: [{ method: 'POST', url: '/api/auth/register', body: { name: 'A', email: 'a@b.com', password: '123' }, expect: { status: 400 } }, { method: 'POST', url: '/api/auth/register', body: { name: 'A', email: 'not-an-email', password: 'secret123' }, expect: { status: 400 } }, { method: 'POST', url: '/api/auth/register', body: { name: 'A', email: 'admin@upskillr.dev', password: 'secret123' }, expect: { status: 409 } }] },
      { name: 'Login with wrong password gives 401', steps: [{ method: 'POST', url: '/api/auth/login', body: { email: 'admin@upskillr.dev', password: 'nope' }, expect: { status: 401 } }] },
      { name: 'Login returns a token and the safe user', steps: [{ method: 'POST', url: '/api/auth/login', body: { email: 'admin@upskillr.dev', password: 'admin12345' }, expect: { status: 200, json: { user: { id: 1, role: 'admin' } }, has: ['token'], absentIn: { user: ['password'] } } }] },
      { name: '/api/me needs a valid token', steps: [{ method: 'GET', url: '/api/me', expect: { status: 401 } }, { method: 'GET', url: '/api/me', headers: { Authorization: 'Bearer fake' }, expect: { status: 401 } }] },
      { name: '/api/me works with the login token', steps: [{ method: 'POST', url: '/api/auth/register', body: { name: 'Ravi', email: 'ravi@example.com', password: 'password1' } }, { method: 'POST', url: '/api/auth/login', body: { email: 'ravi@example.com', password: 'password1' }, save: 'token' }, { method: 'GET', url: '/api/me', auth: true, expect: { status: 200, json: { name: 'Ravi', role: 'user' }, absent: ['password'] } }] },
      { name: 'Admin route: 403 for users, 200 for admin', steps: [{ method: 'POST', url: '/api/auth/register', body: { name: 'Ravi', email: 'ravi@example.com', password: 'password1' } }, { method: 'POST', url: '/api/auth/login', body: { email: 'ravi@example.com', password: 'password1' }, save: 'token' }, { method: 'GET', url: '/api/admin/users', auth: true, expect: { status: 403 } }, { method: 'POST', url: '/api/auth/login', body: { email: 'admin@upskillr.dev', password: 'admin12345' }, save: 'token' }, { method: 'GET', url: '/api/admin/users', auth: true, expect: { status: 200, length: 2, json: [{ role: 'admin' }, { role: 'user' }] } }] },
      { name: 'Logout invalidates the token', steps: [{ method: 'POST', url: '/api/auth/login', body: { email: 'admin@upskillr.dev', password: 'admin12345' }, save: 'token' }, { method: 'POST', url: '/api/auth/logout', auth: true, expect: { status: 204 } }, { method: 'GET', url: '/api/me', auth: true, expect: { status: 401 } }] },
    ],
    mongoose: `// Real version: bcrypt + JWT
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
user.password = await bcrypt.hash(password, 12);           // register
const ok = await bcrypt.compare(password, user.password);   // login
const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
const payload = jwt.verify(token, process.env.JWT_SECRET);  // in requireAuth`,
    viva: ['Where should a JWT be stored in the browser and why?', 'Access token vs refresh token?', 'Why must passwords be hashed and why bcrypt instead of SHA-256?', 'Difference between 401 and 403?', 'How do you log out a user when using stateless JWTs?'],
  },

  {
    id: 'shop-cart-api', icon: '🛒', level: 'Advanced', hours: '12-15 hours', title: 'E-commerce Cart & Orders API',
    summary: 'Products, a per-user cart, checkout with stock checks, 18% GST and coupons, and order history: the core of every MERN e-commerce interview project.',
    skills: ['Business logic', 'Nested resources', 'Atomic updates', 'Money calculations', 'Order workflow'],
    story: 'An online electronics store needs its backend. Customers browse products, manage a cart, apply a coupon and check out. Checkout must never sell more than the stock and must calculate GST correctly.',
    api: [
      ['GET', '/api/products', 'List products, ?category= filter'],
      ['GET', '/api/cart/:userId', 'Cart lines with name, price, qty, lineTotal and cart subtotal'],
      ['POST', '/api/cart/:userId/items', '{ productId, qty } adds (or increases) a line; unknown product 404; qty > stock 400'],
      ['DELETE', '/api/cart/:userId/items/:productId', 'Remove a line → 204'],
      ['POST', '/api/orders/:userId/checkout', '{ coupon? } → 201 order { items, subtotal, discount, gst, total, status: "placed" }; reduces stock; empties cart; empty cart → 400'],
      ['GET', '/api/orders/:userId', 'Order history (newest first)'],
    ],
    milestones: [
      { title: 'Backend API (in the browser)', tasks: ['Products, cart, checkout and orders pass all tests', 'Money rounded to 2 decimals; GST 18% on the discounted subtotal', 'Coupon SAVE10 = 10% off (max 1000), FLAT500 = 500 off on subtotal ≥ 5000'] },
      { title: 'React storefront', tasks: ['Product grid with category filter', 'Cart drawer with quantity +/- and remove', 'Checkout page with coupon input and order summary', 'Order history page'] },
      { title: 'MongoDB', tasks: ['Product, Cart and Order models (embed order items with price snapshot)', 'Decrease stock atomically with updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })', 'Use a transaction for checkout (replica set / Atlas)'] },
      { title: 'Ship it', tasks: ['Razorpay test-mode payment (optional)', 'Deploy and add the project to your resume with metrics'] },
    ],
    hints: ['Keep carts in an object: { [userId]: [{ productId, qty }] }.', 'Check ALL stock first, then change anything (all-or-nothing).', 'round2 = (n) => Math.round(n * 100) / 100.', 'Copy name and price into the order items: prices change later, orders must not.'],
    starter: `const express = require('express');
const app = express();
app.use(express.json());

const products = [
  { id: 1, name: 'Redmi Note 13', category: 'Mobiles', price: 17999, stock: 5 },
  { id: 2, name: 'boAt Airdopes 141', category: 'Audio', price: 1299, stock: 50 },
  { id: 3, name: 'JBL Flip 6', category: 'Audio', price: 9999, stock: 2 },
  { id: 4, name: 'Logitech MX Master 3S', category: 'Accessories', price: 9495, stock: 10 },
];
const carts = {};   // userId -> [{ productId, qty }]
const orders = [];  // { id, userId, items, subtotal, discount, gst, total, status }
let nextOrderId = 1001;
const round2 = (n) => Math.round(n * 100) / 100;

// TODO: GET /api/products (?category=)
// TODO: GET /api/cart/:userId
// TODO: POST /api/cart/:userId/items
// TODO: DELETE /api/cart/:userId/items/:productId
// TODO: POST /api/orders/:userId/checkout  (coupons SAVE10 and FLAT500, GST 18%)
// TODO: GET /api/orders/:userId

app.listen(3000, () => console.log('Shop API on port 3000'));
`,
    solution: `const express = require('express');
const app = express();
app.use(express.json());

const products = [
  { id: 1, name: 'Redmi Note 13', category: 'Mobiles', price: 17999, stock: 5 },
  { id: 2, name: 'boAt Airdopes 141', category: 'Audio', price: 1299, stock: 50 },
  { id: 3, name: 'JBL Flip 6', category: 'Audio', price: 9999, stock: 2 },
  { id: 4, name: 'Logitech MX Master 3S', category: 'Accessories', price: 9495, stock: 10 },
];
const carts = {};
const orders = [];
let nextOrderId = 1001;
const round2 = (n) => Math.round(n * 100) / 100;
const product = (id) => products.find((p) => p.id === Number(id));

function cartView(userId) {
  const lines = (carts[userId] || []).map((l) => {
    const p = product(l.productId);
    return { productId: p.id, name: p.name, price: p.price, qty: l.qty, lineTotal: round2(p.price * l.qty) };
  });
  return { items: lines, subtotal: round2(lines.reduce((s, l) => s + l.lineTotal, 0)) };
}

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  res.json(category ? products.filter((p) => p.category === category) : products);
});

app.get('/api/cart/:userId', (req, res) => res.json(cartView(req.params.userId)));

app.post('/api/cart/:userId/items', (req, res) => {
  const { productId, qty = 1 } = req.body || {};
  const p = product(productId);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ error: 'qty must be a positive integer' });
  const cart = (carts[req.params.userId] ||= []);
  const line = cart.find((l) => l.productId === p.id);
  const newQty = (line ? line.qty : 0) + qty;
  if (newQty > p.stock) return res.status(400).json({ error: 'Only ' + p.stock + ' in stock' });
  if (line) line.qty = newQty; else cart.push({ productId: p.id, qty });
  res.status(201).json(cartView(req.params.userId));
});

app.delete('/api/cart/:userId/items/:productId', (req, res) => {
  const cart = carts[req.params.userId] || [];
  const i = cart.findIndex((l) => l.productId === Number(req.params.productId));
  if (i < 0) return res.status(404).json({ error: 'Item not in cart' });
  cart.splice(i, 1);
  res.status(204).end();
});

app.post('/api/orders/:userId/checkout', (req, res) => {
  const { userId } = req.params;
  const cart = carts[userId] || [];
  if (!cart.length) return res.status(400).json({ error: 'Cart is empty' });
  for (const l of cart) {
    const p = product(l.productId);
    if (l.qty > p.stock) return res.status(400).json({ error: 'Not enough stock for ' + p.name });
  }
  const { items, subtotal } = cartView(userId);
  const coupon = (req.body && req.body.coupon) || '';
  let discount = 0;
  if (coupon === 'SAVE10') discount = Math.min(round2(subtotal * 0.1), 1000);
  else if (coupon === 'FLAT500') { if (subtotal < 5000) return res.status(400).json({ error: 'FLAT500 needs a subtotal of 5000 or more' }); discount = 500; }
  else if (coupon) return res.status(400).json({ error: 'Invalid coupon' });
  const gst = round2((subtotal - discount) * 0.18);
  const order = { id: nextOrderId++, userId, items, subtotal, discount, gst, total: round2(subtotal - discount + gst), status: 'placed' };
  cart.forEach((l) => { product(l.productId).stock -= l.qty; });
  carts[userId] = [];
  orders.push(order);
  res.status(201).json(order);
});

app.get('/api/orders/:userId', (req, res) => {
  res.json(orders.filter((o) => o.userId === req.params.userId).sort((a, b) => b.id - a.id));
});

app.listen(3000, () => console.log('Shop API on port 3000'));
`,
    tests: [
      { name: 'Products list and category filter', steps: [{ method: 'GET', url: '/api/products', expect: { status: 200, length: 4 } }, { method: 'GET', url: '/api/products?category=Audio', expect: { length: 2, json: [{ id: 2 }, { id: 3 }] } }] },
      { name: 'Add to cart and view the cart', steps: [{ method: 'POST', url: '/api/cart/u1/items', body: { productId: 2, qty: 2 }, expect: { status: 201 } }, { method: 'POST', url: '/api/cart/u1/items', body: { productId: 2, qty: 1 } }, { method: 'POST', url: '/api/cart/u1/items', body: { productId: 4 } }, { method: 'GET', url: '/api/cart/u1', expect: { status: 200, json: { subtotal: 13392, items: [{ productId: 2, qty: 3, lineTotal: 3897 }, { productId: 4, qty: 1, lineTotal: 9495 }] } } }] },
      { name: 'Cart rules: unknown product 404, more than stock 400', steps: [{ method: 'POST', url: '/api/cart/u1/items', body: { productId: 99, qty: 1 }, expect: { status: 404 } }, { method: 'POST', url: '/api/cart/u1/items', body: { productId: 3, qty: 3 }, expect: { status: 400 } }] },
      { name: 'Remove a cart line (204)', steps: [{ method: 'POST', url: '/api/cart/u1/items', body: { productId: 1, qty: 1 } }, { method: 'DELETE', url: '/api/cart/u1/items/1', expect: { status: 204 } }, { method: 'GET', url: '/api/cart/u1', expect: { json: { items: [], subtotal: 0 } } }] },
      { name: 'Checkout an empty cart gives 400', steps: [{ method: 'POST', url: '/api/orders/u9/checkout', body: {}, expect: { status: 400 } }] },
      { name: 'Checkout: GST 18%, stock reduced, cart emptied', steps: [{ method: 'POST', url: '/api/cart/u1/items', body: { productId: 3, qty: 2 } }, { method: 'POST', url: '/api/orders/u1/checkout', body: {}, expect: { status: 201, json: { id: 1001, subtotal: 19998, discount: 0, gst: 3599.64, total: 23597.64, status: 'placed' } } }, { method: 'GET', url: '/api/products?category=Audio', expect: { json: [{ id: 2, stock: 50 }, { id: 3, stock: 0 }] } }, { method: 'GET', url: '/api/cart/u1', expect: { json: { items: [] } } }] },
      { name: 'Coupons SAVE10 (max 1000) and FLAT500', steps: [{ method: 'POST', url: '/api/cart/u1/items', body: { productId: 1, qty: 1 } }, { method: 'POST', url: '/api/orders/u1/checkout', body: { coupon: 'SAVE10' }, expect: { status: 201, json: { subtotal: 17999, discount: 1000, gst: 3059.82, total: 20058.82 } } }, { method: 'POST', url: '/api/cart/u2/items', body: { productId: 2, qty: 1 } }, { method: 'POST', url: '/api/orders/u2/checkout', body: { coupon: 'FLAT500' }, expect: { status: 400 } }, { method: 'POST', url: '/api/orders/u2/checkout', body: { coupon: 'FREE' }, expect: { status: 400 } }] },
      { name: 'Order history, newest first', steps: [{ method: 'POST', url: '/api/cart/u1/items', body: { productId: 2, qty: 1 } }, { method: 'POST', url: '/api/orders/u1/checkout', body: {} }, { method: 'POST', url: '/api/cart/u1/items', body: { productId: 4, qty: 1 } }, { method: 'POST', url: '/api/orders/u1/checkout', body: {} }, { method: 'GET', url: '/api/orders/u1', expect: { status: 200, length: 2, json: [{ id: 1002 }, { id: 1001 }] } }, { method: 'GET', url: '/api/orders/u2', expect: { length: 0 } }] },
    ],
    mongoose: `// Atomic stock update with Mongoose (never oversell)
const r = await Product.updateOne({ _id: productId, stock: { $gte: qty } }, { $inc: { stock: -qty } });
if (r.modifiedCount === 0) throw new Error('Out of stock');

// Checkout in a transaction
const session = await mongoose.startSession();
await session.withTransaction(async () => { /* update stock, create order, clear cart with { session } */ });`,
    viva: ['Why copy the price into the order instead of referencing the product?', 'How do you prevent two customers buying the last item at the same time?', 'Embed or reference cart items in MongoDB? Why?', 'How would you integrate Razorpay and verify the payment signature?', 'How would you scale this API for a sale day?'],
  },
];

export const findMernProject = (id) => MERN_PROJECTS.find((p) => p.id === id);
export const MERN_RUBRIC = RUBRIC;
MERN_PROJECTS.forEach((p) => { p.rubric = RUBRIC; });
