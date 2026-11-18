export default {
  id: 'day-12-testing-mern-app-jest-supertest-playwright',
  title: 'Testing a MERN App: API Tests (Jest + Supertest + mongodb-memory-server), React Tests and End-to-End Tests with Playwright',
  module: 'Module 4: Production',
  day: 12,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Build a complete test setup for a MERN project: integration tests for the Express API against a real in-memory MongoDB, component tests for React with Vitest, Testing Library and MSW, and end-to-end browser tests with Playwright that run the whole stack.',
  objectives: [
    'Explain the testing pyramid and what to test at each level in a MERN app',
    'Separate app.js from server.js so Supertest can test the API without opening a port',
    'Write API integration tests with Jest, Supertest and mongodb-memory-server, including authenticated routes',
    'Test React components that call the API using Vitest, React Testing Library and MSW',
    'Write Playwright end-to-end tests that log in, create data and check the UI, and run them in CI',
  ],
  theory: [
    {
      heading: 'The testing pyramid for a full-stack app',
      content:
        'Tests are your safety net. When you change the login code on Friday evening, tests tell you in two minutes whether checkout still works.\n\nThe **testing pyramid** says: many small fast tests at the bottom, fewer slow big tests at the top.\n\n1. **Unit tests** (many, milliseconds): pure functions like `calculateCartTotal`, Zod schemas, utility helpers, a single hook.\n2. **Integration tests** (some, ~100 ms each): an Express route with a real (in-memory) MongoDB; a React page with a mocked network (MSW).\n3. **End-to-end (E2E) tests** (few, seconds each): a real browser (Playwright) clicks through the real React app talking to the real API and database: register → login → add to cart → checkout.\n\nAnalogy: building a car. Unit tests check each bolt and spark plug. Integration tests check the engine connected to the gearbox. E2E tests are the test drive on the road. You need all three, but you do not test-drive the car to check one bolt.\n\nFor MERN projects, **API integration tests give the best value**: they catch bugs in routes, validation, auth middleware and Mongoose queries together, and they are still fast.',
      points: [
        'Backend: Jest (or Vitest) + Supertest + mongodb-memory-server',
        'Frontend: Vitest + @testing-library/react + @testing-library/user-event + MSW (Mock Service Worker)',
        'E2E: Playwright (@playwright/test) with Chromium/Firefox/WebKit',
        'Coverage is a guide, not a goal: 70-80% on important business logic beats 100% on trivial code',
      ],
    },
    {
      heading: 'Make the server testable: split app.js and server.js',
      content:
        'Supertest takes an Express **app object** and sends fake HTTP requests to it in memory, without you starting a server on a port. So the app must be **exported without calling listen()**.\n\n- `app.js` → creates the Express app, adds middleware and routes, `export default app`.\n- `server.js` → connects to MongoDB, then calls `app.listen(PORT)`.\n\nTests import `app.js` and connect to a **test database** themselves. This same split is also what you need for serverless deployment, so it is a good habit in every project.\n\nAlso read configuration from `process.env` (JWT secret, Mongo URI) so tests can set their own values, and avoid side effects at import time (no connecting to MongoDB or Redis inside app.js).',
      syntax:
        "// src/app.js\nimport express from 'express';\nimport authRoutes from './routes/auth.routes.js';\nimport noteRoutes from './routes/note.routes.js';\nimport { errorHandler } from './middleware/error.js';\n\nconst app = express();\napp.use(express.json());\napp.use('/api/auth', authRoutes);\napp.use('/api/notes', noteRoutes);\napp.use(errorHandler);\nexport default app;\n\n// src/server.js\nimport mongoose from 'mongoose';\nimport app from './app.js';\nawait mongoose.connect(process.env.MONGO_URI);\napp.listen(process.env.PORT || 5000, () => console.log('API ready'));",
    },
    {
      heading: 'API integration tests with Jest, Supertest and mongodb-memory-server',
      content:
        '**mongodb-memory-server** downloads a real `mongod` binary once and starts it in memory for tests. Your Mongoose models, indexes, unique constraints and aggregations behave exactly like production, but nothing touches your real Atlas database.\n\nTypical lifecycle:\n\n1. `beforeAll`: start `MongoMemoryServer`, `mongoose.connect(mongod.getUri())`.\n2. `afterEach`: clear all collections so every test starts clean (tests must not depend on each other).\n3. `afterAll`: `mongoose.disconnect()` and `mongod.stop()`.\n\nThen each test uses `request(app).post(\'/api/auth/register\').send({...})` and asserts on `status` and `body`. For protected routes, register/login first and send the token (`.set(\'Authorization\', \'Bearer \' + token)`) or keep cookies with `request.agent(app)`.\n\nTest the **unhappy paths** too: missing fields (400), wrong password (401), another user\'s resource (403/404), duplicate email (409). Interviewers love candidates who test failures, not only success.',
      tip: 'Jest with native ES modules needs: "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js". Many teams now use Vitest for the server too because it supports ESM out of the box with the same expect API.',
    },
    {
      heading: 'React component tests with Vitest, Testing Library and MSW',
      content:
        '**React Testing Library** tests components the way a user uses them: find elements by role, label or text, type, click, and check what appears. Do not test internal state or implementation details.\n\nProblem: components fetch data from the API. We do not want to start the backend for every component test. **MSW (Mock Service Worker)** intercepts `fetch`/`axios` requests at the network level and returns fake responses you define. Your component code does not change at all.\n\nSetup pieces:\n\n- `vitest` with `environment: \'jsdom\'` in `vite.config.js`.\n- `src/test/setup.js` that imports `@testing-library/jest-dom/vitest` and starts the MSW server (`setupServer` from `msw/node`).\n- A `renderWithProviders` helper that wraps the component in `QueryClientProvider` (with `retry: false`) and a `MemoryRouter`.\n\nUse `findBy...` queries (they wait) for things that appear after a request, and `user-event` for realistic typing and clicking.',
      syntax:
        "// MSW v2 handler\nimport { http, HttpResponse } from 'msw';\nexport const handlers = [\n  http.get('/api/notes', () => HttpResponse.json([{ _id: '1', title: 'Buy milk' }])),\n  http.post('/api/notes', async ({ request }) => {\n    const body = await request.json();\n    return HttpResponse.json({ _id: '2', ...body }, { status: 201 });\n  }),\n];",
    },
    {
      heading: 'End-to-end tests with Playwright',
      content:
        '**Playwright** (by Microsoft) drives real browsers. An E2E test opens the React app, fills the login form, clicks buttons and checks the screen, while the real Express API and a test MongoDB run underneath.\n\nKey features:\n\n- **Auto-waiting**: `await page.getByRole(\'button\', { name: \'Save\' }).click()` waits until the button is visible and enabled. No manual sleeps.\n- **Web-first assertions**: `await expect(page.getByText(\'Note saved\')).toBeVisible()` retries until it passes or times out.\n- **webServer** config: Playwright can start your API and Vite dev server before the tests.\n- **Trace viewer**: on failure you get a timeline with screenshots, DOM snapshots and network calls (`npx playwright show-trace`).\n- **Auth state reuse**: log in once in a setup project, save `storageState` (cookies), and reuse it in other tests to save time.\n\nKeep E2E tests few and focused on **critical user journeys**: sign up, login, create the main resource, payment flow. Use a separate test database and seed/clean it before the run.',
      tip: 'Prefer role-based locators (getByRole, getByLabel) over CSS selectors like .btn-primary > span. They match what users see and survive styling changes; they also push you towards accessible markup.',
    },
    {
      heading: 'Running tests in CI and good testing habits',
      content:
        'Tests only help if they run on every push. In GitHub Actions (Day 14) a typical pipeline is: install → lint → server tests → client tests → build → Playwright E2E. mongodb-memory-server works in CI without a separate MongoDB service (or use a `mongo:8` service container).\n\nGood habits:\n\n- **Independent tests**: clean the DB between tests; never rely on test order.\n- **Factories** for test data: `createUser({ role: \'admin\' })` instead of copying objects everywhere.\n- **Arrange - Act - Assert** structure in each test.\n- **Deterministic**: mock time (`vi.useFakeTimers()`), random ids and external services (Razorpay, Cloudinary, email) with mocks or MSW.\n- **Test names are documentation**: `it(\'returns 403 when a user deletes another user\\\'s note\')`.\n- **Fix flaky tests immediately**; a red test that everyone ignores is worse than no test.',
    },
  ],
  examples: [
    {
      title: 'The API behaviour our tests will check (simulated)',
      scenario:
        'Before writing tests, see the exact responses the notes API returns: 401 without a token, 400 for invalid input, 201 on create and 200 with only the logged-in user\'s notes. These are the assertions we will write with Supertest.',
      steps: [
        'Create an in-memory notes array and a fake token map (token → userId) instead of JWT',
        'Write an auth middleware that returns 401 when the Bearer token is missing or unknown',
        'Validate the title (required, max 100 chars) and return 400 with a clear error',
        'List only notes that belong to req.userId',
        'Run the requests and note each status code: these become expect(res.status).toBe(...) lines',
      ],
      code: `// src/app.js shape used by the tests (real version uses JWT + Mongoose)
app.use('/api/notes', protect, noteRoutes);
// GET  /api/notes        -> 200 [notes of current user]
// POST /api/notes {title}-> 201 note | 400 { error }
// any request without token -> 401`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const tokens = { 'token-asha': 'u1', 'token-ravi': 'u2' };   // stands in for JWT
const notes = [{ id: 1, userId: 'u2', title: 'Ravi private note' }];

function protect(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || !tokens[token]) return res.status(401).json({ error: 'Not authenticated' });
  req.userId = tokens[token];
  next();
}

app.get('/api/notes', protect, (req, res) => {
  res.json(notes.filter(n => n.userId === req.userId));
});

app.post('/api/notes', protect, (req, res) => {
  const title = (req.body && req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (title.length > 100) return res.status(400).json({ error: 'Title must be at most 100 characters' });
  const note = { id: notes.length + 1, userId: req.userId, title };
  notes.push(note);
  res.status(201).json(note);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/notes' },
          { method: 'POST', url: '/api/notes', headers: { Authorization: 'Bearer token-asha' }, body: { title: '   ' } },
          { method: 'POST', url: '/api/notes', headers: { Authorization: 'Bearer token-asha' }, body: { title: 'Revise JWT' } },
          { method: 'GET', url: '/api/notes', headers: { Authorization: 'Bearer token-asha' } },
        ],
      },
      result: "GET /api/notes → 401 {\"error\":\"Not authenticated\"}\nPOST /api/notes → 400 {\"error\":\"Title is required\"}\nPOST /api/notes → 201 {\"id\":2,\"userId\":\"u1\",\"title\":\"Revise JWT\"}\nGET /api/notes → 200 [{\"id\":2,\"userId\":\"u1\",\"title\":\"Revise JWT\"}]",
      explanation:
        'Each line is a test case: no token → 401; whitespace-only title → 400 (trim before validating); valid title → 201 with userId u1; and the list for Asha does NOT include Ravi\'s note, which proves the ownership filter works. In the next example these exact expectations become Supertest assertions running against a real in-memory MongoDB.',
    },
    {
      title: 'API integration tests with Jest + Supertest + mongodb-memory-server',
      scenario: 'Automate the checks from the previous example against the real Express app, real Mongoose models and an in-memory MongoDB.',
      steps: [
        'cd server && npm i -D jest supertest mongodb-memory-server',
        'Add "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand" to package.json',
        'Create tests/setup.js with beforeAll/afterEach/afterAll for the in-memory DB',
        'Create tests/notes.test.js with a helper that registers and logs in a user',
        'Run npm test and read the summary',
      ],
      code: `// server/jest.config.js
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 20000,
};

// server/tests/setup.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) await c.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// server/tests/notes.test.js
import request from 'supertest';
import app from '../src/app.js';

async function loginAs(name) {
  const email = name + '@test.com';
  await request(app).post('/api/auth/register').send({ name, email, password: 'Secret@123' }).expect(201);
  const res = await request(app).post('/api/auth/login').send({ email, password: 'Secret@123' }).expect(200);
  return res.body.accessToken;
}

describe('Notes API', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(401);
  });

  it('returns 400 when title is empty', async () => {
    const token = await loginAs('asha');
    const res = await request(app).post('/api/notes')
      .set('Authorization', 'Bearer ' + token)
      .send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it('creates a note and lists only my notes', async () => {
    const asha = await loginAs('asha');
    const ravi = await loginAs('ravi');
    await request(app).post('/api/notes').set('Authorization', 'Bearer ' + ravi).send({ title: 'Ravi note' }).expect(201);

    const created = await request(app).post('/api/notes')
      .set('Authorization', 'Bearer ' + asha).send({ title: 'Revise JWT' });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ title: 'Revise JWT' });

    const list = await request(app).get('/api/notes').set('Authorization', 'Bearer ' + asha);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].title).toBe('Revise JWT');
  });

  it('returns 404 when deleting another user\\'s note', async () => {
    const asha = await loginAs('asha');
    const ravi = await loginAs('ravi');
    const note = await request(app).post('/api/notes').set('Authorization', 'Bearer ' + ravi).send({ title: 'x' });
    await request(app).delete('/api/notes/' + note.body._id)
      .set('Authorization', 'Bearer ' + asha)
      .expect(404);
  });
});`,
      result:
        'PASS tests/notes.test.js\n  Notes API\n    ✓ returns 401 without a token\n    ✓ returns 400 when title is empty\n    ✓ creates a note and lists only my notes\n    ✓ returns 404 when deleting another user\'s note\nTests: 4 passed, 4 total',
      explanation:
        'setup.js runs around every test file: one in-memory MongoDB per run, collections cleared after each test, so tests never affect each other. loginAs() uses the real register and login routes, so bcrypt hashing and JWT signing are tested too. --runInBand runs files one after another, which avoids several files sharing one database at the same time. The ownership test expects 404 (not 403) because the controller queries { _id, user: req.user.id } and so does not reveal that the note exists.',
    },
    {
      title: 'React component test with Vitest, Testing Library and MSW',
      scenario: 'Test the NotesPage component: it should load notes from the API, show them, and add a new note when the form is submitted, without starting the backend.',
      steps: [
        'cd client && npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw',
        'Add test config to vite.config.js (environment jsdom, setupFiles)',
        'Create src/test/server.js with MSW handlers and src/test/setup.js to start it',
        'Create a renderWithProviders helper with QueryClient (retry false) and MemoryRouter',
        'Write NotesPage.test.jsx and run npx vitest',
      ],
      code: `// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: './src/test/setup.js', globals: true },
});

// client/src/test/server.js
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
let notes = [{ _id: '1', title: 'Buy milk' }];
export const server = setupServer(
  http.get('*/api/notes', () => HttpResponse.json(notes)),
  http.post('*/api/notes', async ({ request }) => {
    const { title } = await request.json();
    const note = { _id: String(notes.length + 1), title };
    notes = [...notes, note];
    return HttpResponse.json(note, { status: 201 });
  }),
);

// client/src/test/setup.js
import '@testing-library/jest-dom/vitest';
import { server } from './server';
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// client/src/test/utils.jsx
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
export function renderWithProviders(ui) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>);
}

// client/src/pages/NotesPage.test.jsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { renderWithProviders } from '../test/utils';
import NotesPage from './NotesPage';

test('shows notes from the API', async () => {
  renderWithProviders(<NotesPage />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(await screen.findByText('Buy milk')).toBeInTheDocument();
});

test('adds a note', async () => {
  const user = userEvent.setup();
  renderWithProviders(<NotesPage />);
  await user.type(await screen.findByLabelText(/title/i), 'Practice DSA');
  await user.click(screen.getByRole('button', { name: /add/i }));
  expect(await screen.findByText('Practice DSA')).toBeInTheDocument();
});

test('shows an error message when the API fails', async () => {
  server.use(http.get('*/api/notes', () => HttpResponse.json({ error: 'boom' }, { status: 500 })));
  renderWithProviders(<NotesPage />);
  expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
});`,
      result: ' ✓ src/pages/NotesPage.test.jsx (3 tests) 412ms\n Test Files  1 passed (1)\n      Tests  3 passed (3)',
      explanation:
        'MSW answers the axios/fetch calls exactly as the backend would, so the component, its TanStack Query hook and the axios instance are all exercised. server.use() overrides a handler for one test (the 500 error case) and resetHandlers() restores the defaults afterwards. onUnhandledRequest: "error" makes the test fail if the component calls an endpoint you forgot to mock.',
    },
    {
      title: 'Understand assertions with a tiny in-browser test runner',
      scenario: 'See how describe/it/expect work under the hood by running unit tests for a cart-total function and a shared validation function directly in the playground.',
      steps: [
        'Write two pure functions: cartTotal(items, coupon) and validateNote(input)',
        'Write a mini expect() with toBe and toEqual, and a test() that catches failures',
        'Add tests for normal and edge cases (empty cart, 100% coupon, long title)',
        'Click Run and read the pass/fail list',
        'Break a function on purpose (e.g. remove Math.max) and run again to see a red test',
      ],
      code: `// The same tests in Vitest (client/src/utils/cart.test.js)
import { describe, it, expect } from 'vitest';
import { cartTotal } from './cart';

describe('cartTotal', () => {
  it('adds price x qty', () => {
    expect(cartTotal([{ price: 100, qty: 2 }, { price: 50, qty: 1 }])).toBe(250);
  });
  it('never goes below zero with a big coupon', () => {
    expect(cartTotal([{ price: 100, qty: 1 }], 500)).toBe(0);
  });
});`,
      playground: {
        jsx: `function cartTotal(items, coupon = 0) {
  const sum = items.reduce((s, i) => s + i.price * i.qty, 0);
  return Math.max(sum - coupon, 0);
}
function validateNote(input) {
  const title = (input.title || '').trim();
  if (!title) return { ok: false, error: 'Title is required' };
  if (title.length > 100) return { ok: false, error: 'Too long' };
  return { ok: true, data: { title } };
}

function runTests() {
  const results = [];
  const expect = (actual) => ({
    toBe: (exp) => { if (actual !== exp) throw new Error('expected ' + JSON.stringify(exp) + ' but got ' + JSON.stringify(actual)); },
    toEqual: (exp) => { if (JSON.stringify(actual) !== JSON.stringify(exp)) throw new Error('expected ' + JSON.stringify(exp) + ' but got ' + JSON.stringify(actual)); },
  });
  const test = (name, fn) => {
    try { fn(); results.push({ name, pass: true }); }
    catch (e) { results.push({ name, pass: false, msg: e.message }); }
  };

  test('cartTotal: adds price x qty', () => expect(cartTotal([{ price: 100, qty: 2 }, { price: 50, qty: 1 }])).toBe(250));
  test('cartTotal: empty cart is 0', () => expect(cartTotal([])).toBe(0));
  test('cartTotal: coupon never makes total negative', () => expect(cartTotal([{ price: 100, qty: 1 }], 500)).toBe(0));
  test('validateNote: trims title', () => expect(validateNote({ title: '  Hi  ' })).toEqual({ ok: true, data: { title: 'Hi' } }));
  test('validateNote: blank title fails', () => expect(validateNote({ title: '   ' }).ok).toBe(false));
  test('validateNote: 101 chars fails', () => expect(validateNote({ title: 'a'.repeat(101) }).error).toBe('Too long'));
  return results;
}

function App() {
  const [results, setResults] = React.useState(runTests);
  const passed = results.filter(r => r.pass).length;
  return (
    <div style={{ fontFamily: 'monospace' }}>
      <button onClick={() => setResults(runTests())}>Re-run tests</button>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {results.map(r => (
          <li key={r.name} style={{ color: r.pass ? 'green' : 'crimson' }}>
            {r.pass ? 'PASS ' : 'FAIL '} {r.name} {r.msg ? ' - ' + r.msg : ''}
          </li>
        ))}
      </ul>
      <b>{passed}/{results.length} tests passed</b>
    </div>
  );
}`,
      },
      result: 'Six green PASS lines and "6/6 tests passed". If you change Math.max(sum - coupon, 0) to sum - coupon, the coupon test turns red with "expected 0 but got -400".',
      explanation:
        'A test framework is just functions: test() runs a callback inside try/catch, and expect() throws when a value is wrong. Jest and Vitest add nicer output, mocking, watch mode and async support, but the idea is identical. Pure functions like cartTotal are the easiest and fastest things to unit test, which is a good reason to keep business logic out of components.',
    },
    {
      title: 'End-to-end test with Playwright: register, login, create a note',
      scenario: 'One E2E test that proves the whole stack works: React UI → Express API → MongoDB → back to the UI.',
      steps: [
        'In the repo root: npm init playwright@latest (choose e2e folder, TypeScript or JavaScript)',
        'Configure webServer to start the API (with a test MONGO_URI) and the Vite dev server',
        'Write e2e/notes.spec.js using role-based locators',
        'Run npx playwright test (headless) or npx playwright test --ui (interactive)',
        'On failure open the HTML report: npx playwright show-report',
      ],
      code: `// playwright.config.js
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run dev -w server',
      url: 'http://localhost:5000/api/health',
      env: { MONGO_URI: 'mongodb://127.0.0.1:27017/notes_e2e', NODE_ENV: 'test' },
      reuseExistingServer: !process.env.CI,
    },
    { command: 'npm run dev -w client', url: 'http://localhost:5173', reuseExistingServer: !process.env.CI },
  ],
});

// e2e/notes.spec.js
import { test, expect } from '@playwright/test';

test('user can register, log in and create a note', async ({ page }) => {
  const email = 'e2e' + Date.now() + '@test.com';     // unique per run

  await page.goto('/register');
  await page.getByLabel('Name').fill('E2E User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('Secret@123');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\\/notes/);
  await expect(page.getByRole('heading', { name: 'My Notes' })).toBeVisible();

  await page.getByLabel('Title').fill('Prepare for MERN interview');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Prepare for MERN interview')).toBeVisible();

  await page.reload();                                   // data really saved in MongoDB
  await expect(page.getByText('Prepare for MERN interview')).toBeVisible();
});

test('protected page redirects to login', async ({ page }) => {
  await page.goto('/notes');
  await expect(page).toHaveURL(/\\/login/);
});`,
      result:
        'Running 2 tests using 1 worker\n  ✓ [chromium] › notes.spec.js:3:1 › user can register, log in and create a note (3.1s)\n  ✓ [chromium] › notes.spec.js:24:1 › protected page redirects to login (0.6s)\n  2 passed (9.8s)',
      explanation:
        'webServer starts both apps before the tests and waits until their URLs respond. Locators like getByLabel("Email") require proper <label> elements, so E2E tests also enforce accessibility. page.reload() proves the note was persisted in MongoDB, not just kept in React state. The second test checks the client-side protected route. trace: "on-first-retry" records a full trace when a CI test fails once, which makes flaky failures easy to debug.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between unit, integration and end-to-end tests? Give a MERN example of each.',
      a: 'Unit tests check one small piece in isolation, e.g. a cartTotal() function or a Zod schema. Integration tests check several pieces together, e.g. POST /api/orders through Express, auth middleware, validation and Mongoose with an in-memory MongoDB. E2E tests run the full system through a real browser, e.g. Playwright logging in and completing checkout on the React app backed by the real API and database. Unit tests are fastest and most numerous; E2E tests are slowest and fewest.',
      level: 'Easy',
    },
    {
      q: 'Why do we separate app.js from server.js in an Express project?',
      a: 'So tests (Supertest) and serverless adapters can import the configured app without starting a network listener or connecting to the production database. server.js does the side effects (connect DB, listen on a port); app.js only builds the app. This avoids port conflicts and open handles in tests.',
      level: 'Easy',
    },
    {
      q: 'Why use mongodb-memory-server instead of mocking Mongoose?',
      a: 'Mocking Mongoose methods only checks that you called functions, not that your queries, schema validation, unique indexes, populate or aggregations actually work. mongodb-memory-server runs a real mongod in memory, so tests catch real bugs (wrong filter, missing index constraint) while staying fast and isolated, with no shared external database.',
      level: 'Medium',
    },
    {
      q: 'How do you test a route protected by JWT in Supertest?',
      a: 'Either call the real register/login endpoints in a helper and use the returned token with .set("Authorization", "Bearer " + token), or sign a token directly with the test secret (jwt.sign({ sub: user.id }, process.env.JWT_ACCESS_SECRET)). For cookie-based auth use request.agent(app), which stores cookies from the login response and sends them on later requests.',
      level: 'Medium',
    },
    {
      q: 'What is MSW and why is it preferred over mocking axios directly?',
      a: 'Mock Service Worker intercepts network requests (in the browser via a service worker, in Node via request interception) and returns mocked responses. Components and API hooks run their real code including the axios instance, interceptors and TanStack Query, so tests are closer to reality. Mocking axios couples tests to the HTTP library; switching to fetch would break every test.',
      level: 'Medium',
    },
    {
      q: 'What are findBy, getBy and queryBy in React Testing Library?',
      a: 'getBy returns the element or throws immediately if not found (for things already on screen). queryBy returns null if not found, used to assert something is absent. findBy returns a Promise and retries until the element appears (default 1 s), used for content that appears after async work like an API call. Each has an AllBy variant for multiple elements.',
      level: 'Easy',
    },
    {
      q: 'How do you avoid flaky tests?',
      a: 'Make tests independent (clean DB between tests, unique test data), avoid fixed sleeps and use auto-waiting assertions (findBy, Playwright expect), mock time and randomness, mock third-party services, do not share state between test files running in parallel (use --runInBand or a database per worker), and use stable locators (roles/labels) rather than CSS classes or nth-child.',
      level: 'Hard',
    },
    {
      q: 'How would you test a Razorpay payment flow without charging money?',
      a: 'Unit test the signature verification function with known inputs (HMAC SHA256 of order_id|payment_id with the test secret). Integration test the /verify and /webhook endpoints by generating valid and invalid signatures in the test. Mock the Razorpay SDK orders.create call. For E2E use Razorpay test mode keys and test cards, or stub the checkout script in Playwright with page.route and call the verify endpoint directly.',
      level: 'Hard',
    },
    {
      q: 'What does Playwright auto-waiting mean?',
      a: 'Before actions like click or fill, Playwright waits for the element to be attached, visible, stable (not animating), enabled and able to receive events. Web-first assertions like expect(locator).toBeVisible() retry until the condition is true or a timeout. So you rarely need manual waits, which removes a major source of flakiness seen in older Selenium tests.',
      level: 'Medium',
    },
    {
      q: 'How do you reuse login state across Playwright tests?',
      a: 'Create a setup project that logs in once through the UI or API and saves page.context().storageState({ path: "playwright/.auth/user.json" }). Other projects declare dependencies: ["setup"] and use: { storageState: "playwright/.auth/user.json" }, so they start already logged in with the saved cookies/localStorage.',
      level: 'Hard',
    },
    {
      q: 'What should you test in a React component, and what should you not test?',
      a: 'Test behaviour visible to the user: rendered text, what happens on click/type, loading and error states, accessibility roles, and calls that reach the network (via MSW). Do not test implementation details such as internal state variable values, which hook was used, CSS class names, or snapshot entire large trees, because those tests break on refactors without catching real bugs.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write Supertest tests for POST /api/auth/register: success (201, no password in response), duplicate email (409), and invalid email (400).',
      hint: 'Use the same setup.js with mongodb-memory-server. Check that res.body.user.password is undefined.',
      solution: `import request from 'supertest';
import app from '../src/app.js';

const valid = { name: 'Asha', email: 'asha@test.com', password: 'Secret@123' };

describe('POST /api/auth/register', () => {
  it('creates a user and hides the password', async () => {
    const res = await request(app).post('/api/auth/register').send(valid);
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: 'Asha', email: 'asha@test.com' });
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(valid).expect(201);
    const res = await request(app).post('/api/auth/register').send(valid);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already/i);
  });

  it('rejects an invalid email with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});`,
    },
    {
      task: 'Test cookie-based refresh: login sets a refreshToken cookie, and POST /api/auth/refresh with that cookie returns a new access token.',
      hint: 'request.agent(app) keeps cookies between requests.',
      solution: `import request from 'supertest';
import app from '../src/app.js';

it('refreshes the access token using the httpOnly cookie', async () => {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({ name: 'A', email: 'a@t.com', password: 'Secret@123' });
  const login = await agent.post('/api/auth/login').send({ email: 'a@t.com', password: 'Secret@123' });

  const setCookie = login.headers['set-cookie'].join(';');
  expect(setCookie).toMatch(/refreshToken=/);
  expect(setCookie).toMatch(/HttpOnly/i);

  const res = await agent.post('/api/auth/refresh');   // cookie sent automatically
  expect(res.status).toBe(200);
  expect(res.body.accessToken).toEqual(expect.any(String));
});`,
    },
    {
      task: 'Write a Vitest + Testing Library test for a LoginForm that shows "Invalid email or password" when the API returns 401.',
      hint: 'Override the MSW handler with server.use for this test; use findByRole("alert").',
      solution: `import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { renderWithProviders } from '../test/utils';
import LoginForm from './LoginForm';

test('shows an error on wrong credentials', async () => {
  server.use(
    http.post('*/api/auth/login', () =>
      HttpResponse.json({ error: 'Invalid email or password' }, { status: 401 })),
  );
  const user = userEvent.setup();
  renderWithProviders(<LoginForm />);

  await user.type(screen.getByLabelText(/email/i), 'asha@test.com');
  await user.type(screen.getByLabelText(/password/i), 'wrong');
  await user.click(screen.getByRole('button', { name: /log in/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
});`,
    },
    {
      task: 'Write a Playwright test that checks an admin-only page: a normal user visiting /admin is redirected or sees "Forbidden", and the admin API returns 403 for that user.',
      hint: 'Playwright gives a request fixture that shares cookies with the page context via page.request.',
      solution: `import { test, expect } from '@playwright/test';

test('normal user cannot open the admin panel', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@test.com');      // seeded normal user
  await page.getByLabel('Password').fill('Secret@123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\\/dashboard/);

  await page.goto('/admin');
  await expect(page.getByText(/forbidden|not allowed/i)).toBeVisible();

  // server-side check too: UI hiding is not security
  const res = await page.request.get('http://localhost:5000/api/admin/users');
  expect(res.status()).toBe(403);
});`,
    },
  ],
  quiz: [
    {
      question: 'Which tool runs a real MongoDB in memory for fast, isolated API tests?',
      options: ['Supertest', 'MSW', 'mongodb-memory-server', 'Playwright'],
      answer: 2,
      explanation: 'mongodb-memory-server starts a real mongod process with in-memory storage for each test run.',
    },
    {
      question: 'Why must app.js export the app without calling app.listen() for Supertest?',
      options: [
        'Supertest can only test GET requests otherwise',
        'Supertest binds the app to an ephemeral port itself, so calling listen in the module causes extra open servers and port conflicts',
        'Express 5 does not allow listen()',
        'Because listen() disables JSON parsing',
      ],
      answer: 1,
      explanation: 'Supertest wraps the app itself. Importing a module that calls listen would start a real server in every test file.',
    },
    {
      question: 'In React Testing Library, which query should you use for text that appears after an API call finishes?',
      options: ['getByText', 'queryByText', 'container.querySelector', 'findByText'],
      answer: 3,
      explanation: 'findBy* returns a Promise and retries until the element appears or the timeout passes.',
    },
    {
      question: 'What is the main job of MSW in frontend tests?',
      options: [
        'Intercept network requests and return mocked responses',
        'Render components into a fake DOM',
        'Run tests in real browsers',
        'Measure code coverage',
      ],
      answer: 0,
      explanation: 'MSW mocks the network layer so components and data hooks run unchanged against predictable responses.',
    },
    {
      question: 'Which tests should be the FEWEST in a healthy test pyramid?',
      options: ['Unit tests', 'Integration tests', 'End-to-end tests', 'Linting checks'],
      answer: 2,
      explanation: 'E2E tests are slow and more brittle; keep them for critical journeys and cover details with unit and integration tests.',
    },
  ],
};
