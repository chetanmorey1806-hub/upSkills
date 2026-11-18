export default {
  id: 'day-16-rest-api-crud-in-memory',
  title: 'Building a Complete REST API (CRUD) with In-memory Data',
  module: 'Module 2: Express.js',
  day: 16,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Time to put Days 9–15 together: design and build a complete, production-style REST API for a Task Manager with Create, Read, Update and Delete, validation, proper status codes, routers, controllers and central error handling – using an in-memory array before we move to real databases.',
  objectives: [
    'Explain REST principles: resources, URIs, HTTP verbs, statelessness and representations',
    'Map CRUD operations to HTTP methods and status codes',
    'Implement GET (list + one), POST, PUT, PATCH and DELETE endpoints with validation',
    'Understand PUT vs PATCH and idempotency',
    'Test an API with curl, Postman/Thunder Client or a .http file',
  ],
  theory: [
    {
      heading: 'What is REST? (the library analogy)',
      content: `**REST** (Representational State Transfer) is an architectural style for APIs over HTTP, described by Roy Fielding in 2000. Think of a **library**:

- Every book is a **resource** with a unique address: shelf + number → \`/api/books/42\`.
- You use a small set of standard **actions** on any resource: look (GET), add (POST), replace (PUT), correct a detail (PATCH), remove (DELETE). You do not invent new verbs like \`/getBook\` or \`/deleteBookNow\`.
- The librarian does not remember you between visits – every request carries all needed info (**stateless**; auth tokens travel with each request).
- What you receive is a **representation** of the resource – usually JSON.

REST constraints: client–server, stateless, cacheable, uniform interface, layered system (and optional code-on-demand). An API that follows them is called **RESTful**.`,
    },
    {
      heading: 'CRUD ↔ HTTP methods ↔ status codes',
      content: `For a resource collection \`/api/tasks\`:

| Operation | Method & URL | Success | Common errors |
|---|---|---|---|
| List all | \`GET /api/tasks\` | 200 + array | – |
| Read one | \`GET /api/tasks/:id\` | 200 + object | 404 |
| Create | \`POST /api/tasks\` | 201 + created object | 400 |
| Replace | \`PUT /api/tasks/:id\` | 200 + object | 400, 404 |
| Partial update | \`PATCH /api/tasks/:id\` | 200 + object | 400, 404 |
| Delete | \`DELETE /api/tasks/:id\` | 204 (no body) | 404 |

**URL design rules:** plural nouns (\`/tasks\` not \`/task\` or \`/getTasks\`), lowercase with hyphens (\`/order-items\`), nesting for ownership (\`/users/5/tasks\`), query strings for filtering/sorting/paging (\`/tasks?completed=true&sort=-createdAt\`), and a version prefix (\`/api/v1\`).`,
    },
    {
      heading: 'PUT vs PATCH and idempotency',
      content: `- **PUT** replaces the **whole** resource. The client sends the complete new version; fields not sent are reset to defaults (or the request is rejected as invalid).
- **PATCH** updates **only the fields sent**. \`{ "completed": true }\` toggles one field and leaves the title alone.

**Idempotent** means: doing the same request once or ten times leaves the server in the same state.
- GET, PUT, DELETE are idempotent (deleting twice → still deleted; the second call may return 404, but the state is the same).
- POST is **not** idempotent – two POSTs create two tasks (that is why double-clicking "Pay" is dangerous; real APIs use idempotency keys).
- PATCH may or may not be idempotent (\`{ "completed": true }\` is; \`{ "op": "increment" }\` is not).

**Safe** methods (GET, HEAD, OPTIONS) never change data.`,
      tip: 'Never use GET for actions that change data (e.g. GET /tasks/5/delete). Crawlers, prefetchers and browser history can trigger GETs accidentally.',
    },
    {
      heading: 'Validation and the "never trust the client" rule',
      content: `Every byte from the client can be wrong or malicious. Before saving:

1. Check **types** (\`typeof title === 'string'\`), **required fields**, **lengths/ranges**, **allowed values** (priority must be low/medium/high).
2. **Whitelist** fields – copy only the fields you expect. Never do \`Object.assign(task, req.body)\` blindly: a client could send \`{ "id": 999, "isAdmin": true }\`.
3. Generate server-owned fields yourself: \`id\`, \`createdAt\`, \`updatedAt\`, \`ownerId\`.
4. Return **all** validation errors at once (better UX than one at a time).

Later (Day 24) you will use libraries like **zod** or **express-validator**, but the logic is the same.`,
    },
    {
      heading: 'In-memory storage: pros, cons and the road to databases',
      content: `Today data lives in a JavaScript array inside the Node process.

**Pros:** zero setup, fast, perfect for learning, prototyping and unit tests.
**Cons:** data disappears on every restart; not shared between multiple server instances (cluster/PM2 or several containers); limited by RAM; no queries, indexes or transactions.

Because we keep data access inside a **model/service** layer (Day 13), switching to MongoDB (Days 17–19) or MySQL (Day 20) changes only that layer – routes and controllers stay almost the same (they just \`await\`).

**Testing tools:**
- **curl**: \`curl -X POST localhost:3000/api/tasks -H "Content-Type: application/json" -d '{"title":"Learn REST"}'\`
- **Postman / Insomnia / Thunder Client** (VS Code) – GUI clients with collections and environments.
- **REST Client** VS Code extension – \`.http\` files you can commit to git.
- The in-app **API Lab** for the examples below.`,
      tip: 'Coming next (Day 17): MongoDB – a real database so your tasks survive a restart.',
    },
  ],
  examples: [
    {
      title: 'Task Manager API: full CRUD with validation',
      scenario: 'Implement all six CRUD endpoints for /api/tasks with field whitelisting, validation and proper status codes.',
      steps: [
        'Create the tasks array and a nextId counter',
        'Write validateTask(body, { partial }) that returns an array of error messages',
        'Implement GET list (with optional ?completed=true/false filter) and GET by id',
        'Implement POST (201), PUT (full replace), PATCH (partial) and DELETE (204)',
        'Add a 404 handler and run the request sequence top to bottom',
      ],
      code: `const PRIORITIES = ['low', 'medium', 'high'];
function validateTask(body, { partial = false } = {}) {
  const errors = [];
  const { title, completed, priority } = body;
  if (!partial || title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 3) errors.push('title must be a string of at least 3 characters');
  }
  if (completed !== undefined && typeof completed !== 'boolean') errors.push('completed must be true or false');
  if (priority !== undefined && !PRIORITIES.includes(priority)) errors.push('priority must be one of ' + PRIORITIES.join(', '));
  return errors;
}`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

let tasks = [
  { id: 1, title: 'Learn Express routing', completed: true, priority: 'high' },
  { id: 2, title: 'Build CRUD API', completed: false, priority: 'medium' },
];
let nextId = 3;

const PRIORITIES = ['low', 'medium', 'high'];

function validateTask(body, { partial = false } = {}) {
  const errors = [];
  const { title, completed, priority } = body;
  if (!partial || title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 3) errors.push('title must be a string of at least 3 characters');
  }
  if (completed !== undefined && typeof completed !== 'boolean') errors.push('completed must be true or false');
  if (priority !== undefined && !PRIORITIES.includes(priority)) errors.push('priority must be one of ' + PRIORITIES.join(', '));
  return errors;
}

const findTask = (id) => tasks.find(t => t.id === Number(id));

// READ all (optional filter ?completed=true|false)
app.get('/api/tasks', (req, res) => {
  let result = tasks;
  if (req.query.completed !== undefined) {
    const wanted = req.query.completed === 'true';
    result = tasks.filter(t => t.completed === wanted);
  }
  res.json(result);
});

// READ one
app.get('/api/tasks/:id', (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// CREATE
app.post('/api/tasks', (req, res) => {
  const body = req.body ?? {};
  const errors = validateTask(body);
  if (errors.length) return res.status(400).json({ errors });
  const task = {
    id: nextId++,                      // server-owned field
    title: body.title.trim(),
    completed: body.completed ?? false,
    priority: body.priority ?? 'medium',
  };
  tasks.push(task);
  res.status(201).json(task);
});

// REPLACE (PUT): every field is required / reset
app.put('/api/tasks/:id', (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const body = req.body ?? {};
  const errors = validateTask(body);
  if (errors.length) return res.status(400).json({ errors });
  task.title = body.title.trim();
  task.completed = body.completed ?? false;
  task.priority = body.priority ?? 'medium';
  res.json(task);
});

// PARTIAL UPDATE (PATCH): only sent fields change
app.patch('/api/tasks/:id', (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const body = req.body ?? {};
  const errors = validateTask(body, { partial: true });
  if (errors.length) return res.status(400).json({ errors });
  if (body.title !== undefined) task.title = body.title.trim();
  if (body.completed !== undefined) task.completed = body.completed;
  if (body.priority !== undefined) task.priority = body.priority;
  res.json(task);
});

// DELETE
app.delete('/api/tasks/:id', (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  tasks = tasks.filter(t => t !== task);
  res.sendStatus(204);
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/tasks' },
          { method: 'POST', url: '/api/tasks', body: { title: 'Hi', priority: 'urgent' } },
          { method: 'POST', url: '/api/tasks', body: { title: '  Write tests  ', priority: 'low', id: 999 } },
          { method: 'GET', url: '/api/tasks/3' },
          { method: 'PATCH', url: '/api/tasks/2', body: { completed: true } },
          { method: 'PUT', url: '/api/tasks/1', body: { title: 'Master Express routing' } },
          { method: 'GET', url: '/api/tasks?completed=true' },
          { method: 'DELETE', url: '/api/tasks/3' },
          { method: 'DELETE', url: '/api/tasks/3' },
          { method: 'GET', url: '/api/tasks' },
        ],
      },
      result: `GET /api/tasks → 200 [{"id":1,"title":"Learn Express routing","completed":true,"priority":"high"},{"id":2,"title":"Build CRUD API","completed":false,"priority":"medium"}]
POST /api/tasks → 400 {"errors":["title must be a string of at least 3 characters","priority must be one of low, medium, high"]}
POST /api/tasks → 201 {"id":3,"title":"Write tests","completed":false,"priority":"low"}
GET /api/tasks/3 → 200 {"id":3,"title":"Write tests","completed":false,"priority":"low"}
PATCH /api/tasks/2 → 200 {"id":2,"title":"Build CRUD API","completed":true,"priority":"medium"}
PUT /api/tasks/1 → 200 {"id":1,"title":"Master Express routing","completed":false,"priority":"medium"}
GET /api/tasks?completed=true → 200 [{"id":2,"title":"Build CRUD API","completed":true,"priority":"medium"}]
DELETE /api/tasks/3 → 204
DELETE /api/tasks/3 → 404 {"error":"Task not found"}
GET /api/tasks → 200 [{"id":1,"title":"Master Express routing","completed":false,"priority":"medium"},{"id":2,"title":"Build CRUD API","completed":true,"priority":"medium"}]`,
      explanation: 'The client tried to set id: 999 – ignored, because only whitelisted fields are copied. PATCH changed one field; PUT replaced the whole task, so completed and priority were reset to defaults. The second DELETE returns 404 but the state is unchanged (idempotent).',
    },
    {
      title: 'Layered version: router + controller + service + central errors',
      scenario: 'Refactor the Task API into the Day 13 structure with Day 14 error classes so controllers become one-liners.',
      steps: [
        'Create HttpError class with status and details',
        'Service: list/get/create/update/remove that THROW HttpError on problems',
        'Controller: async functions calling the service (Express 5 forwards errors)',
        'Router with router.route() mounted at /api/v1/tasks',
        'One 404 handler and one error handler at the end',
      ],
      code: `const taskRouter = express.Router();
taskRouter.route('/').get(ctrl.list).post(ctrl.create);
taskRouter.route('/:id').get(ctrl.get).patch(ctrl.update).delete(ctrl.remove);
app.use('/api/v1/tasks', taskRouter);`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// ---------- utils/HttpError.js ----------
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// ---------- services/task.service.js ----------
const db = { tasks: [{ id: 1, title: 'Plan sprint', completed: false }], nextId: 2 };
const taskService = {
  async list() { return db.tasks; },
  async get(id) {
    const task = db.tasks.find(t => t.id === id);
    if (!task) throw new HttpError(404, 'Task ' + id + ' not found');
    return task;
  },
  async create({ title } = {}) {
    if (typeof title !== 'string' || title.trim().length < 3) {
      throw new HttpError(400, 'Validation failed', ['title must have at least 3 characters']);
    }
    const task = { id: db.nextId++, title: title.trim(), completed: false };
    db.tasks.push(task);
    return task;
  },
  async update(id, { title, completed } = {}) {
    const task = await this.get(id);
    if (title !== undefined) task.title = String(title).trim();
    if (completed !== undefined) task.completed = Boolean(completed);
    return task;
  },
  async remove(id) {
    await this.get(id);
    db.tasks = db.tasks.filter(t => t.id !== id);
  },
};

// ---------- controllers/task.controller.js ----------
const ctrl = {
  list: async (req, res) => res.json(await taskService.list()),
  get: async (req, res) => res.json(await taskService.get(Number(req.params.id))),
  create: async (req, res) => res.status(201).json(await taskService.create(req.body)),
  update: async (req, res) => res.json(await taskService.update(Number(req.params.id), req.body)),
  remove: async (req, res) => { await taskService.remove(Number(req.params.id)); res.sendStatus(204); },
};

// ---------- routes/task.routes.js ----------
const taskRouter = express.Router();
taskRouter.route('/').get(ctrl.list).post(ctrl.create);
taskRouter.route('/:id').get(ctrl.get).patch(ctrl.update).delete(ctrl.remove);

// ---------- app.js ----------
app.use('/api/v1/tasks', taskRouter);
app.use((req, res, next) => next(new HttpError(404, 'Route not found')));
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message, ...(err.details && { details: err.details }) });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/v1/tasks', body: { title: 'Go' } },
          { method: 'POST', url: '/api/v1/tasks', body: { title: 'Review pull requests' } },
          { method: 'PATCH', url: '/api/v1/tasks/2', body: { completed: true } },
          { method: 'GET', url: '/api/v1/tasks' },
          { method: 'DELETE', url: '/api/v1/tasks/1' },
          { method: 'GET', url: '/api/v1/tasks/1' },
          { method: 'GET', url: '/api/v2/tasks' },
        ],
      },
      result: `POST /api/v1/tasks → 400 {"error":"Validation failed","details":["title must have at least 3 characters"]}
POST /api/v1/tasks → 201 {"id":2,"title":"Review pull requests","completed":false}
PATCH /api/v1/tasks/2 → 200 {"id":2,"title":"Review pull requests","completed":true}
GET /api/v1/tasks → 200 [{"id":1,"title":"Plan sprint","completed":false},{"id":2,"title":"Review pull requests","completed":true}]
DELETE /api/v1/tasks/1 → 204
GET /api/v1/tasks/1 → 404 {"error":"Task 1 not found"}
GET /api/v2/tasks → 404 {"error":"Route not found"}`,
      explanation: 'The service methods are async and throw HttpError – exactly how they will look with a real database. Express 5 forwards every rejection to the single error handler, so no try/catch is needed anywhere.',
    },
    {
      title: 'Nested resources and simple search: /api/projects/:projectId/tasks',
      scenario: 'Tasks belong to projects. List the tasks of a project, create a task inside a project and search tasks by text.',
      steps: [
        'Store projects and tasks in two arrays; each task has projectId',
        'GET /api/projects/:projectId/tasks returns 404 if the project does not exist',
        'POST /api/projects/:projectId/tasks creates a task with that projectId',
        'GET /api/tasks/search?q=... does case-insensitive matching (400 if q is missing)',
      ],
      code: `app.get('/api/projects/:projectId/tasks', (req, res) => {
  const project = projects.find(p => p.id === Number(req.params.projectId));
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(tasks.filter(t => t.projectId === project.id));
});`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const projects = [{ id: 1, name: 'Website' }, { id: 2, name: 'Mobile App' }];
const tasks = [
  { id: 1, projectId: 1, title: 'Design homepage' },
  { id: 2, projectId: 1, title: 'Write API docs' },
  { id: 3, projectId: 2, title: 'Setup push notifications' },
];

const findProject = (req, res) => {
  const project = projects.find(p => p.id === Number(req.params.projectId));
  if (!project) res.status(404).json({ error: 'Project not found' });
  return project;
};

// static path BEFORE the dynamic /:id style routes of the same prefix
app.get('/api/tasks/search', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
  res.json(tasks.filter(t => t.title.toLowerCase().includes(q)));
});

app.get('/api/projects/:projectId/tasks', (req, res) => {
  const project = findProject(req, res);
  if (!project) return;
  res.json({ project: project.name, tasks: tasks.filter(t => t.projectId === project.id) });
});

app.post('/api/projects/:projectId/tasks', (req, res) => {
  const project = findProject(req, res);
  if (!project) return;
  const title = req.body?.title;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const task = { id: tasks.length + 1, projectId: project.id, title };
  tasks.push(task);
  res.status(201).json(task);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/projects/1/tasks' },
          { method: 'POST', url: '/api/projects/2/tasks', body: { title: 'Publish to Play Store' } },
          { method: 'GET', url: '/api/projects/2/tasks' },
          { method: 'GET', url: '/api/projects/9/tasks' },
          { method: 'GET', url: '/api/tasks/search?q=API' },
          { method: 'GET', url: '/api/tasks/search' },
        ],
      },
      result: `GET /api/projects/1/tasks → 200 {"project":"Website","tasks":[{"id":1,"projectId":1,"title":"Design homepage"},{"id":2,"projectId":1,"title":"Write API docs"}]}
POST /api/projects/2/tasks → 201 {"id":4,"projectId":2,"title":"Publish to Play Store"}
GET /api/projects/2/tasks → 200 {"project":"Mobile App","tasks":[{"id":3,"projectId":2,"title":"Setup push notifications"},{"id":4,"projectId":2,"title":"Publish to Play Store"}]}
GET /api/projects/9/tasks → 404 {"error":"Project not found"}
GET /api/tasks/search?q=API → 200 [{"id":2,"projectId":1,"title":"Write API docs"}]
GET /api/tasks/search → 400 {"error":"Query parameter q is required"}`,
      explanation: 'Nesting expresses ownership in the URL. Search uses the query string because it filters a collection rather than identifying a single resource. Full pagination/sorting comes on Day 21.',
    },
    {
      title: 'Testing the API with curl and a .http file (run locally)',
      scenario: 'Exercise the Task API from the terminal and from VS Code.',
      steps: [
        'Run the first example locally: node app.js',
        'Open a second terminal and run the curl commands',
        'Or install the "REST Client" VS Code extension, create tasks.http and click "Send Request" above each block',
      ],
      code: `# curl (Linux/macOS/Git Bash; on Windows PowerShell use curl.exe)
curl http://localhost:3000/api/tasks
curl -i -X POST http://localhost:3000/api/tasks \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Write tests","priority":"low"}'
curl -X PATCH http://localhost:3000/api/tasks/2 -H "Content-Type: application/json" -d '{"completed":true}'
curl -i -X DELETE http://localhost:3000/api/tasks/3

### tasks.http (VS Code REST Client)
@base = http://localhost:3000/api

GET {{base}}/tasks

###
POST {{base}}/tasks
Content-Type: application/json

{ "title": "Write tests", "priority": "low" }

###
PATCH {{base}}/tasks/2
Content-Type: application/json

{ "completed": true }

###
DELETE {{base}}/tasks/3`,
      result: `curl -i -X POST ... → HTTP/1.1 201 Created, Content-Type: application/json; charset=utf-8, body {"id":3,"title":"Write tests","completed":false,"priority":"low"}
curl -i -X DELETE .../tasks/3 → HTTP/1.1 204 No Content`,
      explanation: '-i shows status line and headers, -X sets the method, -H adds a header, -d sends the body. Forgetting -H "Content-Type: application/json" is the #1 reason req.body is undefined.',
    },
  ],
  interview: [
    { q: 'What is REST?', a: 'An architectural style for networked APIs: resources identified by URIs, manipulated through a uniform interface (HTTP methods), stateless requests, cacheable responses, client–server separation and a layered system. Data is exchanged as representations, typically JSON.', level: 'Easy' },
    { q: 'Map CRUD to HTTP methods.', a: 'Create → POST, Read → GET, Update → PUT (replace) or PATCH (partial), Delete → DELETE.', level: 'Easy' },
    { q: 'Difference between PUT and PATCH?', a: 'PUT replaces the entire resource with the representation sent; missing fields are reset or the request is invalid. PATCH applies a partial update: only the provided fields change.', level: 'Medium' },
    { q: 'What does idempotent mean? Which methods are idempotent?', a: 'Repeating the request has the same effect on server state as doing it once. GET, HEAD, PUT, DELETE, OPTIONS are idempotent; POST is not; PATCH is not guaranteed.', level: 'Medium' },
    { q: 'What does stateless mean in REST?', a: 'The server keeps no client session between requests; each request contains everything needed (auth token, parameters). This simplifies scaling because any server instance can handle any request.', level: 'Medium' },
    { q: 'Which status codes should a CRUD API return?', a: 'GET 200 (404 if missing), POST 201 (400 on invalid data, 409 on conflict), PUT/PATCH 200 or 204 (400/404), DELETE 204 (404), plus 401/403 for auth and 500 for server errors.', level: 'Easy' },
    { q: 'Good REST URL naming conventions?', a: 'Plural nouns (/users), no verbs, lowercase and hyphens, hierarchy for relations (/users/5/orders), query parameters for filtering/sorting/pagination, versioning (/api/v1).', level: 'Easy' },
    { q: 'Why should you never Object.assign(resource, req.body)?', a: 'Mass assignment: a client could overwrite server-owned fields like id, role, isAdmin or price. Whitelist and validate allowed fields explicitly.', level: 'Hard' },
    { q: 'What are the drawbacks of in-memory storage?', a: 'Data is lost on restart, not shared between processes/instances, limited by RAM, and lacks querying, indexing, transactions and durability. Fine for prototypes and tests only.', level: 'Easy' },
    { q: 'Why must /api/tasks/search be declared before /api/tasks/:id?', a: 'Express matches in order; /:id would match "search" as an id first. Declare specific static paths before dynamic parameter routes (or constrain the param).', level: 'Medium' },
    { q: 'REST vs GraphQL in one line each?', a: 'REST: many endpoints, server decides response shape, great HTTP caching. GraphQL: one endpoint, client asks for exactly the fields it needs, avoids over/under-fetching but needs extra tooling for caching.', level: 'Medium' },
    { q: 'How do you prevent duplicate creation when a client retries a POST?', a: 'Use an Idempotency-Key header stored with the result: if the same key arrives again, return the stored response instead of creating another record. Also unique constraints in the database.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Build a complete CRUD API for /api/notes (id, text, pinned) with validation (text 1–200 chars).',
      hint: 'Copy the Task API pattern.',
      solution: `let notes = []; let nextId = 1;
const validText = (t) => typeof t === 'string' && t.trim().length >= 1 && t.trim().length <= 200;
app.get('/api/notes', (req, res) => res.json(notes));
app.get('/api/notes/:id', (req, res) => {
  const n = notes.find(x => x.id === Number(req.params.id));
  n ? res.json(n) : res.status(404).json({ error: 'Note not found' });
});
app.post('/api/notes', (req, res) => {
  const { text, pinned = false } = req.body ?? {};
  if (!validText(text)) return res.status(400).json({ error: 'text must be 1-200 characters' });
  const note = { id: nextId++, text: text.trim(), pinned: Boolean(pinned) };
  notes.push(note);
  res.status(201).json(note);
});
app.patch('/api/notes/:id', (req, res) => {
  const n = notes.find(x => x.id === Number(req.params.id));
  if (!n) return res.status(404).json({ error: 'Note not found' });
  const { text, pinned } = req.body ?? {};
  if (text !== undefined) { if (!validText(text)) return res.status(400).json({ error: 'invalid text' }); n.text = text.trim(); }
  if (pinned !== undefined) n.pinned = Boolean(pinned);
  res.json(n);
});
app.delete('/api/notes/:id', (req, res) => {
  const before = notes.length;
  notes = notes.filter(x => x.id !== Number(req.params.id));
  notes.length < before ? res.sendStatus(204) : res.status(404).json({ error: 'Note not found' });
});`,
    },
    {
      task: 'Add GET /api/tasks/stats returning { total, completed, pending, byPriority: { low, medium, high } }.',
      hint: 'Use reduce; declare the route before /api/tasks/:id.',
      solution: `app.get('/api/tasks/stats', (req, res) => {
  const completed = tasks.filter(t => t.completed).length;
  const byPriority = tasks.reduce((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, { low: 0, medium: 0, high: 0 });
  res.json({ total: tasks.length, completed, pending: tasks.length - completed, byPriority });
});`,
    },
    {
      task: 'Add createdAt and updatedAt (ISO strings) to tasks: set both on POST, update updatedAt on PUT/PATCH.',
      hint: 'new Date().toISOString(); never accept these from the client.',
      solution: `// POST
const now = new Date().toISOString();
const task = { id: nextId++, title: body.title.trim(), completed: false, priority: 'medium', createdAt: now, updatedAt: now };
// PUT / PATCH (after applying changes)
task.updatedAt = new Date().toISOString();`,
    },
    {
      task: 'Add DELETE /api/tasks?completed=true that deletes all completed tasks and returns { deleted: n }.',
      hint: 'Bulk operations on a collection URL; require the query to avoid deleting everything by accident.',
      solution: `app.delete('/api/tasks', (req, res) => {
  if (req.query.completed !== 'true') {
    return res.status(400).json({ error: 'Only ?completed=true bulk delete is allowed' });
  }
  const before = tasks.length;
  tasks = tasks.filter(t => !t.completed);
  res.json({ deleted: before - tasks.length });
});`,
    },
    {
      task: 'Write a tasks.http file that tests create, read, update, delete and one validation error.',
      hint: 'Separate requests with ###.',
      solution: `@base = http://localhost:3000/api
### create
POST {{base}}/tasks
Content-Type: application/json

{ "title": "Read REST guide" }

### validation error
POST {{base}}/tasks
Content-Type: application/json

{ "title": "x" }

### read
GET {{base}}/tasks/1

### update
PATCH {{base}}/tasks/1
Content-Type: application/json

{ "completed": true }

### delete
DELETE {{base}}/tasks/1`,
    },
  ],
  quiz: [
    { question: 'Which method and status best fit "create a new task"?', options: ['PUT 200', 'GET 201', 'POST 201', 'PATCH 204'], answer: 2, explanation: 'POST creates; 201 Created confirms it.' },
    { question: 'A client sends PATCH /tasks/1 { "completed": true }. What happens to the title?', options: ['It is unchanged', 'It is deleted', 'It becomes null', 'The request must fail'], answer: 0, explanation: 'PATCH only changes the fields sent.' },
    { question: 'Which HTTP method is NOT idempotent?', options: ['GET', 'PUT', 'DELETE', 'POST'], answer: 3, explanation: 'Repeating POST creates duplicates.' },
    { question: 'Which URL is the most RESTful for deleting user 7?', options: ['GET /deleteUser?id=7', 'DELETE /api/users/7', 'POST /api/users/7/delete', 'DELETE /api/user/remove/7'], answer: 1, explanation: 'Noun-based URL plus the DELETE verb.' },
    { question: 'Main problem with in-memory arrays as a datastore?', options: ['They are too slow', 'They cannot hold objects', 'Data is lost on restart and not shared between instances', 'Express cannot read them'], answer: 2, explanation: 'No persistence or sharing – hence databases from Day 17.' },
  ],
};
