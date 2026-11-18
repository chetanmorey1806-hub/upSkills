export default {
  id: 'day-26-testing-apis-jest-supertest',
  title: 'Testing APIs with Jest and Supertest',
  module: 'Module 5: Advanced Node',
  day: 26,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Clicking through Postman after every change does not scale. Today you write automated unit tests with Jest and HTTP integration tests with Supertest, mock external services like email, test JWT-protected routes, measure coverage and run everything on each push.',
  objectives: [
    'Explain the testing pyramid: unit, integration and end-to-end tests',
    'Write Jest tests with describe/test/expect, common matchers, test.each and lifecycle hooks',
    'Separate app.js from server.js so Supertest can test the app without opening a port',
    'Test CRUD and auth endpoints (status, headers, body) and mock modules with jest.mock / jest.fn',
    'Use coverage reports and an in-memory MongoDB for database tests',
  ],
  theory: [
    {
      heading: 'Why automated tests? The testing pyramid',
      content:
        'Imagine a car factory that only tests cars by driving each finished car around the block. Defects are found late and expensively. Real factories test every part (unit), every assembly (integration) and finally drive a few cars (end-to-end).\n\nSoftware is the same:\n- **Unit tests** check one function in isolation (e.g. `calculateTotal`). Thousands of them, milliseconds each.\n- **Integration tests** check several parts together, e.g. an HTTP request through routes → middleware → controller → (test) database. For APIs these give the best value - this is what Supertest is for.\n- **End-to-end (E2E) tests** drive the real UI in a browser (Playwright, Cypress). Few, slow, but closest to the user.\n\nBenefits: you can refactor without fear, bugs are caught before users see them, tests document how the API behaves, and CI blocks broken code from being deployed.',
      points: [
        'Jest - test runner + assertion library + mocking (by Meta), zero config for Node',
        'Supertest - sends HTTP requests to an Express app in memory and lets you assert on the response',
        'Alternatives: Vitest (fast, Jest-compatible API), node:test (built into Node 22) with node:assert',
      ],
    },
    {
      heading: 'Jest essentials',
      content:
        'Install: `npm install --save-dev jest supertest`, add `"test": "jest"` to package.json scripts, and set `"jest": { "testEnvironment": "node" }`. Jest finds files named `*.test.js` / `*.spec.js` or inside `__tests__`.\n\nStructure: `describe` groups tests, `test` (alias `it`) defines one case, `expect(value)` + a **matcher** asserts.\n\nCommon matchers:\n- `toBe(x)` - strict equality (`Object.is`) for primitives\n- `toEqual(obj)` - deep equality for objects/arrays; `toMatchObject` - partial match\n- `toContain`, `toHaveLength`, `toHaveProperty("a.b")`, `toMatch(/regex/)`\n- `toBeTruthy`, `toBeNull`, `toBeDefined`, `toBeGreaterThan`, `toBeCloseTo` (floats)\n- `toThrow(ErrorClass | "message")` - wrap the call in a function!\n- `.not` negates any matcher; `await expect(promise).rejects.toThrow()` for async\n\nHooks: `beforeAll`, `beforeEach`, `afterEach`, `afterAll` - set up and clean data so **every test is independent** (a test must never depend on another test running first).',
      syntax: `describe('calculateTotal', () => {
  test('applies a coupon', () => {
    expect(calculateTotal([{ price: 100, qty: 2 }], 10)).toBe(180);
  });
  test('throws for bad coupon', () => {
    expect(() => calculateTotal([], 150)).toThrow(RangeError);
  });
});`,
      tip: 'Follow the AAA pattern in each test: Arrange (prepare data), Act (call the function / send the request), Assert (expect). One behaviour per test with a descriptive name.',
    },
    {
      heading: 'Supertest and the app.js / server.js split',
      content:
        'Supertest needs the Express **app object**, not a running server. So split your entry point:\n- `app.js` creates and configures the app and `module.exports = app` - **no `listen()`**.\n- `server.js` imports the app, connects to the DB and calls `app.listen(PORT)`.\n\nIn tests: `const res = await request(app).get("/api/todos")`. Supertest binds the app to a random free port internally, sends the request and closes it. You get `res.status`, `res.body` (parsed JSON), `res.headers`, `res.text`.\n\nUseful methods: `.post(url).send({ ... })` (JSON body), `.set("Authorization", "Bearer " + token)`, `.query({ page: 2 })`, `.attach("avatar", "tests/fixtures/me.png")` for uploads, and chained expectations `.expect(201)`, `.expect("Content-Type", /json/)`.',
      syntax: `const request = require('supertest');
const app = require('../src/app');

test('creates a todo', async () => {
  const res = await request(app).post('/api/todos').send({ title: 'Learn Jest' });
  expect(res.status).toBe(201);
  expect(res.body).toMatchObject({ title: 'Learn Jest', done: false });
});`,
    },
    {
      heading: 'Mocking: replacing slow or dangerous dependencies',
      content:
        'Tests must not send real emails, charge real credit cards or call a weather API. A **mock** is a fake replacement that records how it was called and returns what you tell it.\n\n- `jest.fn()` - a standalone mock function: `const fn = jest.fn().mockReturnValue(42)`; later `expect(fn).toHaveBeenCalledWith(...)`.\n- `jest.mock("../src/mailer")` - replaces every export of that module with auto-mocks for this test file (hoisted to the top automatically). Configure with `sendWelcomeEmail.mockResolvedValue({...})`.\n- `jest.spyOn(obj, "method")` - wrap an existing method to observe or temporarily replace it; restore with `mockRestore()`.\n- Timers: `jest.useFakeTimers()` and `jest.advanceTimersByTime(ms)`.\n\nReset mocks between tests with `jest.clearAllMocks()` in `beforeEach` or `"clearMocks": true` in the Jest config.\n\nDesign tip: code that receives its dependencies (dependency injection, e.g. `createApp({ mailer })`) is easier to test than code that hard-codes them.',
    },
    {
      heading: 'Testing with a database, coverage and CI',
      content:
        '**Databases:** never run tests against your real/production DB. Options:\n- `mongodb-memory-server` - starts a throwaway MongoDB in memory for each test run; connect Mongoose to `mongod.getUri()` in `beforeAll`, `deleteMany` collections in `afterEach`, disconnect and stop in `afterAll`.\n- A dedicated test database in Docker (MySQL/Postgres) with migrations + seed data.\n- For MySQL/Prisma: run each test inside a transaction and roll back.\n\n**Coverage:** `jest --coverage` shows which statements, branches, functions and lines ran during tests. 70-90% is a healthy goal; 100% is not a guarantee of correctness - test behaviour, especially error paths and edge cases.\n\n**CI:** a GitHub Actions workflow runs `npm ci && npm test` on every push/pull request, so broken code never reaches main (Day 29).',
      syntax: `// package.json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
},
"jest": { "testEnvironment": "node", "clearMocks": true }`,
      tip: 'Use a cheap bcrypt cost (e.g. 4) and a fixed JWT secret in the test environment (process.env.NODE_ENV === "test") so the test suite stays fast.',
    },
  ],
  examples: [
    {
      title: 'Unit testing pure functions with Jest',
      scenario: 'A shop has a calculateTotal function with coupons and a slugify helper for product URLs. Lock their behaviour with unit tests.',
      steps: [
        'npm init -y && npm install --save-dev jest',
        'Add "test": "jest" to scripts and "jest": { "testEnvironment": "node" } to package.json',
        'Create src/utils.js and tests/utils.test.js',
        'Run npx jest --verbose',
      ],
      code: `// src/utils.js
function calculateTotal(items, couponPercent = 0) {
  if (!Array.isArray(items)) throw new TypeError('items must be an array');
  if (couponPercent < 0 || couponPercent > 100) throw new RangeError('couponPercent must be 0-100');
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return Math.round(subtotal * (1 - couponPercent / 100) * 100) / 100;
}

function slugify(text) {
  return String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

module.exports = { calculateTotal, slugify };

// tests/utils.test.js
const { calculateTotal, slugify } = require('../src/utils');

describe('calculateTotal', () => {
  const cart = [{ price: 100, qty: 2 }, { price: 50.5, qty: 1 }];

  test('adds price * qty for every item', () => {
    expect(calculateTotal(cart)).toBe(250.5);
  });

  test('applies a percentage coupon', () => {
    expect(calculateTotal(cart, 10)).toBe(225.45);
  });

  test('returns 0 for an empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });

  test('throws for invalid input', () => {
    expect(() => calculateTotal('abc')).toThrow(TypeError);
    expect(() => calculateTotal(cart, 150)).toThrow('couponPercent must be 0-100');
  });
});

describe('slugify', () => {
  test.each([
    ['Hello World', 'hello-world'],
    ['  Node.js & Express 5!  ', 'node-js-express-5'],
    ['already-slug', 'already-slug'],
  ])('slugify(%p) -> %p', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});`,
      result: `PASS tests/utils.test.js
  calculateTotal
    ✓ adds price * qty for every item (2 ms)
    ✓ applies a percentage coupon (1 ms)
    ✓ returns 0 for an empty cart
    ✓ throws for invalid input (10 ms)
  slugify
    ✓ slugify("Hello World") -> "hello-world" (1 ms)
    ✓ slugify("  Node.js & Express 5!  ") -> "node-js-express-5" (1 ms)
    ✓ slugify("already-slug") -> "already-slug" (1 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total`,
      explanation:
        'toThrow needs a function wrapper (() => calculateTotal("abc")) so Jest can catch the error. test.each runs the same test with a table of inputs - %p pretty-prints each value in the test name. Rounding to 2 decimals inside calculateTotal avoids floating-point surprises like 225.45000000000002.',
    },
    {
      title: 'Integration tests for a CRUD API with Supertest',
      scenario: 'Test a todos API end to end over HTTP without starting a real server.',
      steps: [
        'npm install express && npm install --save-dev jest supertest',
        'Create src/app.js that exports the app (no listen) and src/server.js that listens',
        'Create tests/todos.test.js; reset data in beforeEach so tests are independent',
        'Run npm test -- --verbose',
      ],
      code: `// src/app.js
const express = require('express');

const app = express();
app.use(express.json());

let todos = [];
let nextId = 1;

app.get('/api/todos', (req, res) => res.json(todos));

app.get('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

app.post('/api/todos', (req, res) => {
  const title = req.body?.title;
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const todo = { id: nextId++, title: title.trim(), done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.patch('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  if (typeof req.body?.done === 'boolean') todo.done = req.body.done;
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const before = todos.length;
  todos = todos.filter(t => t.id !== Number(req.params.id));
  if (todos.length === before) return res.status(404).json({ error: 'Todo not found' });
  res.sendStatus(204);
});

// test helper: reset in-memory data between tests
app.resetData = () => { todos = []; nextId = 1; };

module.exports = app;

// src/server.js
const app = require('./app');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));

// tests/todos.test.js
const request = require('supertest');
const app = require('../src/app');

beforeEach(() => app.resetData());

describe('Todos API', () => {
  test('GET /api/todos returns an empty array at start', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual([]);
  });

  test('POST /api/todos creates a todo', async () => {
    const res = await request(app).post('/api/todos').send({ title: '  Learn Jest  ' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, title: 'Learn Jest', done: false });
  });

  test('POST /api/todos validates the title', async () => {
    const res = await request(app).post('/api/todos').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('title is required');
  });

  test('PATCH then GET shows the updated todo', async () => {
    await request(app).post('/api/todos').send({ title: 'Write tests' });
    await request(app).patch('/api/todos/1').send({ done: true }).expect(200);
    const res = await request(app).get('/api/todos/1').expect(200);
    expect(res.body.done).toBe(true);
  });

  test('DELETE returns 204, then 404 for the same id', async () => {
    await request(app).post('/api/todos').send({ title: 'Temp' });
    await request(app).delete('/api/todos/1').expect(204);
    await request(app).delete('/api/todos/1').expect(404, { error: 'Todo not found' });
  });
});`,
      result: `PASS tests/todos.test.js
  Todos API
    ✓ GET /api/todos returns an empty array at start (68 ms)
    ✓ POST /api/todos creates a todo (41 ms)
    ✓ POST /api/todos validates the title (6 ms)
    ✓ PATCH then GET shows the updated todo (27 ms)
    ✓ DELETE returns 204, then 404 for the same id (15 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total

-- and if you break an expectation (e.g. expect POST to return 200):
FAIL tests/fail.test.js
  ● POST /api/todos returns 200
    expect(received).toBe(expected) // Object.is equality
    Expected: 200
    Received: 201`,
      explanation:
        'request(app) works because app.js does not call listen(). beforeEach(() => app.resetData()) gives each test a clean state, so "creates a todo" always gets id 1 regardless of test order. .expect(404, { error: ... }) checks status and exact body in one call. A failing test shows the expected vs received value and the exact line.',
    },
    {
      title: 'API Lab: run the requests your tests send',
      scenario: 'Before writing assertions, explore the exact responses of the todos API in the API Lab - these become the expected values in your tests.',
      steps: [
        'Paste the app code into the API Lab',
        'Send the requests in order (they mirror the five Supertest tests)',
        'Turn each response into an expect(): status → expect(res.status).toBe(...), body → toEqual(...)',
      ],
      code: `// response line → assertion
// POST /api/todos → 201 {"id":1,"title":"Learn Jest","done":false}
expect(res.status).toBe(201);
expect(res.body).toEqual({ id: 1, title: 'Learn Jest', done: false });`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

let todos = [];
let nextId = 1;

app.get('/api/todos', (req, res) => res.json(todos));

app.get('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

app.post('/api/todos', (req, res) => {
  const title = req.body?.title;
  if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ error: 'title is required' });
  const todo = { id: nextId++, title: title.trim(), done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.patch('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  if (typeof req.body?.done === 'boolean') todo.done = req.body.done;
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const before = todos.length;
  todos = todos.filter(t => t.id !== Number(req.params.id));
  if (todos.length === before) return res.status(404).json({ error: 'Todo not found' });
  res.sendStatus(204);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/todos' },
          { method: 'POST', url: '/api/todos', body: { title: '  Learn Jest  ' } },
          { method: 'POST', url: '/api/todos', body: {} },
          { method: 'PATCH', url: '/api/todos/1', body: { done: true } },
          { method: 'GET', url: '/api/todos/1' },
          { method: 'DELETE', url: '/api/todos/1' },
          { method: 'DELETE', url: '/api/todos/1' },
        ],
      },
      result: "GET /api/todos → 200 []\nPOST /api/todos → 201 {\"id\":1,\"title\":\"Learn Jest\",\"done\":false}\nPOST /api/todos → 400 {\"error\":\"title is required\"}\nPATCH /api/todos/1 → 200 {\"id\":1,\"title\":\"Learn Jest\",\"done\":true}\nGET /api/todos/1 → 200 {\"id\":1,\"title\":\"Learn Jest\",\"done\":true}\nDELETE /api/todos/1 → 204\nDELETE /api/todos/1 → 404 {\"error\":\"Todo not found\"}",
      explanation:
        'The responses match the Supertest assertions exactly: 201 with the trimmed title, 400 for a missing title, 204 with an empty body for the first DELETE and 404 for the second. Note sendStatus(204) sends no body - in Supertest res.body is {} for it.',
    },
    {
      title: 'Testing JWT auth and mocking the email module',
      scenario: 'Registration sends a welcome email. Tests must check that the email is triggered - without actually sending one - and that the token unlocks protected routes.',
      steps: [
        'npm install bcrypt jsonwebtoken nodemailer',
        'Create src/mailer.js (real nodemailer) and src/authApp.js which uses it',
        'In tests/auth.test.js call jest.mock("../src/mailer") before requiring the app',
        'Use mockResolvedValue and toHaveBeenCalledWith to verify the email call',
        'Log in, read the token and send it with .set("Authorization", ...)',
      ],
      code: `// src/mailer.js
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
async function sendWelcomeEmail(user) {
  return transporter.sendMail({ from: 'no-reply@myshop.com', to: user.email, subject: 'Welcome ' + user.name });
}
module.exports = { sendWelcomeEmail };

// src/authApp.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('./mailer');

const app = express();
app.use(express.json());
const SECRET = process.env.JWT_SECRET || 'test-secret';
const users = [];

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
  if (users.some(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
  const user = { id: users.length + 1, name, email, passwordHash: await bcrypt.hash(password, 4) };
  users.push(user);
  await sendWelcomeEmail(user);
  res.status(201).json({ id: user.id, name, email });
});

app.post('/api/auth/login', async (req, res) => {
  const user = users.find(u => u.email === req.body?.email);
  if (!user || !(await bcrypt.compare(String(req.body.password), user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ token: jwt.sign({ sub: String(user.id) }, SECRET, { expiresIn: '15m' }) });
});

app.get('/api/profile', (req, res) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const { sub } = jwt.verify(token, SECRET);
    const { passwordHash, ...me } = users.find(u => u.id === Number(sub));
    res.json(me);
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = app;

// tests/auth.test.js
const request = require('supertest');

jest.mock('../src/mailer');                 // replace the real module with auto-mocks
const { sendWelcomeEmail } = require('../src/mailer');
const app = require('../src/authApp');

describe('Auth flow', () => {
  const user = { name: 'Asha', email: 'asha@mail.com', password: 'Secret@123' };
  let token;

  test('register -> 201 and sends a welcome email', async () => {
    sendWelcomeEmail.mockResolvedValue({ messageId: 'fake-id' });
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, name: 'Asha', email: 'asha@mail.com' });
    expect(res.body).not.toHaveProperty('passwordHash');
    expect(sendWelcomeEmail).toHaveBeenCalledTimes(1);
    expect(sendWelcomeEmail).toHaveBeenCalledWith(expect.objectContaining({ email: 'asha@mail.com' }));
  });

  test('duplicate register -> 409', async () => {
    await request(app).post('/api/auth/register').send(user).expect(409);
  });

  test('login with wrong password -> 401', async () => {
    await request(app).post('/api/auth/login').send({ email: user.email, password: 'nope' }).expect(401);
  });

  test('login -> token, token unlocks /api/profile', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(login.status).toBe(200);
    token = login.body.token;
    expect(token.split('.')).toHaveLength(3);

    const res = await request(app).get('/api/profile').set('Authorization', \`Bearer \${token}\`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Asha');
  });

  test('profile without token -> 401', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(401);
  });
});`,
      result: `PASS tests/auth.test.js
  Auth flow
    ✓ register -> 201 and sends a welcome email (104 ms)
    ✓ duplicate register -> 409 (17 ms)
    ✓ login with wrong password -> 401 (13 ms)
    ✓ login -> token, token unlocks /api/profile (28 ms)
    ✓ profile without token -> 401 (7 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total

$ npx jest --coverage   (all three test files)
------------|---------|----------|---------|---------|-------------------
File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------|---------|----------|---------|---------|-------------------
All files   |   95.34 |    86.11 |   94.73 |   98.52 |
 app.js     |   94.87 |       75 |     100 |     100 | 13,29-30
 authApp.js |   97.05 |    88.23 |     100 |     100 | 12-13
 mailer.js  |      75 |      100 |       0 |      75 | 7
 utils.js   |     100 |      100 |     100 |     100 |
------------|---------|----------|---------|---------|-------------------
Tests:       17 passed, 17 total`,
      explanation:
        'jest.mock is hoisted, so even though authApp.js requires ./mailer, it receives the mocked version and no SMTP connection is attempted. The tests in this describe intentionally share state (the registered user) and run in order - acceptable for a flow test, but keep most tests independent. bcrypt cost 4 keeps the suite fast. The coverage table shows mailer.js line 7 never ran - correct, because it was mocked; uncovered lines in app.js point to the 404 branches we did not test yet.',
    },
    {
      title: 'Testing Mongoose models with mongodb-memory-server',
      scenario: 'The real Task API uses MongoDB. Run tests against a throwaway in-memory MongoDB so they are isolated and need no installed database.',
      steps: [
        'npm install --save-dev mongodb-memory-server (downloads a MongoDB binary on first run)',
        'Create tests/setupDb.js with beforeAll / afterEach / afterAll hooks',
        'Write tests that use the real Mongoose model through the HTTP API',
        'Run npm test',
      ],
      code: `// tests/setupDb.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) await c.deleteMany({});   // clean data between tests
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// tests/tasks.test.js
require('./setupDb');
const request = require('supertest');
const app = require('../src/app');          // Express app using the Task model
const Task = require('../src/models/Task');

test('POST /api/tasks saves to MongoDB', async () => {
  const res = await request(app).post('/api/tasks').send({ title: 'Deploy app', priority: 'high' }).expect(201);
  expect(res.body._id).toBeDefined();
  const inDb = await Task.findById(res.body._id).lean();
  expect(inDb.title).toBe('Deploy app');
});

test('POST /api/tasks returns 400 for schema validation errors', async () => {
  const res = await request(app).post('/api/tasks').send({ priority: 'urgent!!' }).expect(400);
  expect(res.body.errors).toHaveProperty('title');
});

test('GET /api/tasks?status=done filters in the database', async () => {
  await Task.insertMany([{ title: 'A', status: 'done' }, { title: 'B', status: 'todo' }]);
  const res = await request(app).get('/api/tasks?status=done').expect(200);
  expect(res.body.data.map(t => t.title)).toEqual(['A']);
});`,
      result:
        'PASS tests/tasks.test.js - 3 tests pass against a fresh in-memory MongoDB. The first run is slower while the MongoDB binary downloads; later runs start the server in about a second.',
      explanation:
        'Each test file gets its own database, so tests never touch development or production data. afterEach clears all collections, keeping tests independent. Because the app is the real one, these tests also verify your Mongoose schema validation, indexes and query logic.',
    },
  ],
  interview: [
    { q: 'What is the difference between unit, integration and end-to-end tests?', a: 'Unit tests check one function/class in isolation with dependencies mocked; integration tests check several components together (e.g. HTTP route + middleware + DB) ; E2E tests drive the full system like a user (browser + frontend + backend + DB). Pyramid: many unit, fewer integration, few E2E.', level: 'Easy' },
    { q: 'What is Supertest and why split app.js and server.js?', a: 'Supertest sends HTTP requests to an Express app in memory and provides assertions on status, headers and body. Exporting the app without calling listen() lets tests import it without opening a fixed port or starting DB connections twice; server.js handles listen and startup.', level: 'Easy' },
    { q: 'toBe vs toEqual in Jest?', a: 'toBe uses Object.is (identity) - correct for primitives; toEqual recursively compares values of objects/arrays (ignores undefined properties). toStrictEqual also checks undefined properties and class types.', level: 'Easy' },
    { q: 'How do you test async code in Jest?', a: 'Make the test async and await the promise (or return it). For rejections use await expect(promise).rejects.toThrow(). For callbacks use the done argument. Forgetting await makes the test pass before assertions run.', level: 'Medium' },
    { q: 'What is mocking and when do you use jest.mock vs jest.fn vs jest.spyOn?', a: 'Mocking replaces real dependencies with controllable fakes. jest.fn creates a standalone mock function; jest.mock(path) auto-mocks a whole module (hoisted); jest.spyOn wraps an existing object method to track calls and optionally replace its implementation, restorable with mockRestore.', level: 'Medium' },
    { q: 'How do you test a route protected by JWT?', a: 'Either log in through the API in the test and reuse the returned token, or create a token directly with jwt.sign using the test secret, then send it with .set("Authorization", "Bearer " + token). Also test missing, invalid, expired tokens and wrong roles (401/403).', level: 'Medium' },
    { q: 'How do you handle the database in API tests?', a: 'Use an isolated test database: mongodb-memory-server, a Docker test DB, or SQLite/transactions. Seed in beforeEach/beforeAll, clean in afterEach, close connections in afterAll. Never test against production data.', level: 'Medium' },
    { q: 'What does code coverage measure and is 100% coverage enough?', a: 'The percentage of statements, branches, functions and lines executed during tests. It shows untested code but not whether assertions are meaningful; 100% coverage can still miss wrong logic. Aim for high coverage of critical paths and error branches.', level: 'Medium' },
    { q: 'Why must tests be independent, and how do you ensure it?', a: 'Tests that depend on order or shared state become flaky and fail randomly when run in parallel or alone. Reset state in beforeEach, use unique test data, clear mocks, and avoid global mutable state.', level: 'Easy' },
    { q: 'What is TDD?', a: 'Test-Driven Development: write a failing test (red), write the minimal code to pass (green), then refactor while tests stay green. It leads to testable design and documents requirements.', level: 'Easy' },
    { q: 'Jest says "A worker process has failed to exit gracefully" or "Jest did not exit". What is wrong?', a: 'Something keeps the event loop alive: open DB connections, servers started with listen(), timers, or sockets. Close them in afterAll (mongoose.disconnect, server.close, clearInterval). --detectOpenHandles helps find them.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write tests for GET /api/todos/:id covering: existing id → 200, unknown id → 404 with error message, non-numeric id "abc" → 404.',
      hint: 'Create a todo first in each test or in beforeEach.',
      solution: `describe('GET /api/todos/:id', () => {
  beforeEach(async () => {
    app.resetData();
    await request(app).post('/api/todos').send({ title: 'First' });
  });

  test('returns the todo', async () => {
    const res = await request(app).get('/api/todos/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, title: 'First', done: false });
  });

  test('404 for unknown id', async () => {
    await request(app).get('/api/todos/99').expect(404, { error: 'Todo not found' });
  });

  test('404 for non-numeric id', async () => {
    await request(app).get('/api/todos/abc').expect(404);
  });
});`,
    },
    {
      task: 'Test a role-protected route DELETE /api/admin/users/:id: no token → 401, user token → 403, admin token → 204. Create tokens directly with jwt.sign.',
      hint: 'Use the same secret as the app (process.env.JWT_SECRET set in the test).',
      solution: `process.env.JWT_SECRET = 'test-secret';
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../src/app');

const tokenFor = (role) => jwt.sign({ sub: '1', role }, 'test-secret', { expiresIn: '5m' });

describe('DELETE /api/admin/users/:id', () => {
  test('401 without token', () => request(app).delete('/api/admin/users/2').expect(401));
  test('403 for normal user', () =>
    request(app).delete('/api/admin/users/2').set('Authorization', 'Bearer ' + tokenFor('user')).expect(403));
  test('204 for admin', () =>
    request(app).delete('/api/admin/users/2').set('Authorization', 'Bearer ' + tokenFor('admin')).expect(204));
});`,
    },
    {
      task: 'Write a unit test for an authorize("admin") middleware without Express or Supertest, using fake req/res objects and jest.fn().',
      hint: 'res.status must return res so .json() can be chained: res.status = jest.fn().mockReturnThis().',
      solution: `const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden' });

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

test('calls next for allowed role', () => {
  const next = jest.fn();
  authorize('admin')({ user: { role: 'admin' } }, mockRes(), next);
  expect(next).toHaveBeenCalledTimes(1);
});

test('returns 403 for other roles', () => {
  const res = mockRes(); const next = jest.fn();
  authorize('admin')({ user: { role: 'user' } }, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
});`,
    },
    {
      task: 'Test that when the email service fails, registration still returns 201 (the app should catch email errors). Use mockRejectedValue.',
      hint: 'First change the route to wrap sendWelcomeEmail in try/catch, then write the test.',
      solution: `// route change
try { await sendWelcomeEmail(user); } catch (err) { console.error('email failed', err.message); }

// test
jest.mock('../src/mailer');
const { sendWelcomeEmail } = require('../src/mailer');
const app = require('../src/authApp');

test('register succeeds even if email fails', async () => {
  sendWelcomeEmail.mockRejectedValue(new Error('SMTP down'));
  jest.spyOn(console, 'error').mockImplementation(() => {});   // keep output clean
  const res = await request(app).post('/api/auth/register')
    .send({ name: 'Ravi', email: 'ravi@mail.com', password: 'Secret@123' });
  expect(res.status).toBe(201);
  expect(console.error).toHaveBeenCalled();
});`,
    },
    {
      task: 'Write the same calculateTotal tests using Node 22\'s built-in test runner (node:test + node:assert) instead of Jest, and run them with node --test.',
      hint: 'import { test, describe } from "node:test"; assert.strictEqual / assert.throws.',
      solution: `// tests/utils.node.test.js   run: node --test tests/
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateTotal } = require('../src/utils');

describe('calculateTotal (node:test)', () => {
  test('applies a coupon', () => {
    assert.equal(calculateTotal([{ price: 100, qty: 2 }, { price: 50.5, qty: 1 }], 10), 225.45);
  });
  test('throws on bad coupon', () => {
    assert.throws(() => calculateTotal([], 150), RangeError);
  });
});`,
    },
  ],
  quiz: [
    { question: 'Why should app.js export the app without calling app.listen()?', options: ['listen() is deprecated in Express 5', 'So Supertest can test the app in memory without binding a fixed port', 'Because Jest cannot run servers', 'To make the app faster'], answer: 1, explanation: 'server.js does listen(); tests import app.js and Supertest handles the port internally.' },
    { question: 'Which matcher compares two objects by their contents?', options: ['toBe', 'toEqual', 'toBeTruthy', 'toHaveBeenCalled'], answer: 1, explanation: 'toEqual does a deep comparison; toBe checks identity.' },
    { question: 'What does jest.mock("../src/mailer") do?', options: ['Deletes the mailer file', 'Sends emails to a test inbox', 'Replaces the module\'s exports with mock functions for that test file', 'Runs the mailer in a worker'], answer: 2, explanation: 'Every exported function becomes a jest.fn you can configure and inspect.' },
    { question: 'How do you send a JWT with Supertest?', options: ['request(app).get(url).auth(token)', 'request(app).get(url).send({ token })', 'request(app).get(url).query({ jwt: token })', 'request(app).get(url).set("Authorization", "Bearer " + token)'], answer: 3, explanation: '.set() adds a request header.' },
    { question: 'A test passes even though the assertion inside .then() is wrong. Most likely cause?', options: ['The promise was not awaited/returned, so the test ended early', 'Jest is broken', 'toBe should be toEqual', 'The test name is too long'], answer: 0, explanation: 'Always await (or return) async work inside tests.' },
  ],
};
