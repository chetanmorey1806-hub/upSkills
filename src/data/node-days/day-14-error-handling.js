export default {
  id: 'day-14-error-handling',
  title: 'Error Handling: Error Middleware, Async Errors, 404 Handler and Custom Error Classes',
  module: 'Module 2: Express.js',
  day: 14,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Things go wrong: bad input, missing records, a database that is down. A professional API never crashes and never leaks stack traces – it turns every failure into a clear JSON error with the right status code. Today you build a centralised error-handling system.',
  objectives: [
    'Write 4-argument error-handling middleware and place it correctly',
    'Add a 404 "route not found" handler',
    'Understand how Express 5 forwards async errors automatically (and the Express 4 asyncHandler pattern)',
    'Create custom error classes (AppError, NotFoundError, ValidationError) with status codes',
    'Distinguish operational errors from programmer errors and handle process-level errors',
  ],
  theory: [
    {
      heading: 'How Express handles errors (the hospital emergency lane)',
      content: `Normal requests walk down the middleware stack like patients in a queue. When something goes wrong, the request is moved to the **emergency lane**: Express **skips all normal middleware** and jumps straight to the next **error-handling middleware** – a function with **four** parameters \`(err, req, res, next)\`.

A request enters the emergency lane when:
1. A **synchronous** handler/middleware **throws** (\`throw new Error('x')\`).
2. Someone calls **\`next(err)\`** with any value except \`'route'\` / \`'router'\`.
3. (**Express 5**) An **async** handler returns a **rejected promise** (an \`await\` throws).

If you do not write an error handler, Express uses its **default handler**, which sends an HTML page with status 500 (and the stack trace when \`NODE_ENV\` is not \`production\`). That is not acceptable for a JSON API – so we write our own.`,
      syntax: `// MUST have 4 parameters – that is how Express recognises it
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});`,
      tip: 'Even if you do not use `next`, keep all four parameters. With three, Express treats it as normal middleware and it will never receive errors.',
    },
    {
      heading: 'Where to put the 404 handler and error handler',
      content: `Order is everything:

\`\`\`
app.use(express.json());      // 1. global middleware
app.use('/api/users', users); // 2. routes
app.use(notFound);            // 3. 404 – only reached when NO route matched
app.use(errorHandler);        // 4. error handler – LAST
\`\`\`

The **404 handler** is a normal middleware (3 params) at the bottom: if a request reached it, nothing above responded. It can respond directly or create a NotFound error and call \`next(err)\` so that all errors share one format.

In Express 5 the catch-all path syntax changed: \`app.all('*', ...)\` (Express 4) becomes \`app.all('/*splat', ...)\`. Using \`app.use(fn)\` without a path avoids the issue entirely.`,
    },
    {
      heading: 'Async errors: Express 5 vs Express 4',
      content: `Most real handlers are \`async\` (database calls). In **Express 4**, a rejected promise was NOT caught – the request hung and Node printed an *UnhandledPromiseRejection*. Everyone wrapped handlers:

\`\`\`js
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
router.get('/', asyncHandler(async (req, res) => { ... }));
\`\`\`
(or used the \`express-async-errors\` package).

In **Express 5** this is built in: if a handler or middleware returns a promise that rejects, Express calls \`next(err)\` for you. So you can simply write:

\`\`\`js
app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id); // if this throws → error handler
  res.json(user);
});
\`\`\`

Watch out: errors thrown inside **callbacks** (\`setTimeout\`, \`fs.readFile(cb)\`, event emitters) are outside the promise chain. Catch them yourself and call \`next(err)\`.`,
    },
    {
      heading: 'Custom error classes',
      content: `\`new Error('Not found')\` carries only a message. We also want an HTTP status, maybe a machine-readable code and details. Create a base class that **extends Error**:

- \`AppError(message, statusCode)\` – base class, marks \`isOperational = true\`
- \`NotFoundError\` → 404, \`ValidationError\` → 400 (with a \`details\` array), \`UnauthorizedError\` → 401, \`ConflictError\` → 409

Controllers/services simply \`throw new NotFoundError('Student')\`. The single error handler converts any error into JSON. Unknown errors (bugs) become a generic 500 – you log the full error on the server but show the client only "Something went wrong".`,
      syntax: `class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}
class NotFoundError extends AppError {
  constructor(resource = 'Resource') { super(resource + ' not found', 404); }
}`,
    },
    {
      heading: 'Operational vs programmer errors, and process-level safety nets',
      content: `- **Operational errors** are expected situations: invalid input, record not found, duplicate email, third-party API timeout. Handle them and send a 4xx/5xx with a helpful message.
- **Programmer errors** are bugs: \`undefined is not a function\`, typos, wrong logic. You cannot "handle" them; log them, return 500, fix the code.

Safety nets for errors outside Express:
- \`process.on('unhandledRejection', err => { ... })\` – a promise rejected and nobody caught it.
- \`process.on('uncaughtException', err => { ... })\` – a sync throw escaped everything. The process is in an unknown state: log and **exit** (\`process.exit(1)\`), letting PM2/Docker restart it (Day 28).

Production checklist: never send \`err.stack\` to clients, log with a logger (pino/winston), use the same JSON error shape everywhere, and map known library errors (Mongoose \`ValidationError\`/\`CastError\`, duplicate key \`11000\`, JSON \`entity.parse.failed\`) to friendly 4xx errors.`,
      tip: 'express.json() sends malformed JSON to your error handler with err.type === "entity.parse.failed" and err.status === 400. Use err.status || err.statusCode when picking the status.',
    },
  ],
  examples: [
    {
      title: 'Error handler + 404 handler for synchronous errors',
      scenario: 'Turn thrown errors and unknown URLs into clean JSON instead of the default HTML error page.',
      steps: [
        'Add normal routes, one of which throws an Error',
        'Add a 404 middleware after all routes',
        'Add an error middleware with FOUR parameters as the very last app.use',
        'Request a normal route, the failing route and a non-existent URL',
      ],
      code: `app.use((req, res) => {
  res.status(404).json({ error: 'Route not found: ' + req.method + ' ' + req.originalUrl });
});
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  res.status(err.statusCode || 500).json({ error: err.message });
});`,
      api: {
        code: `const express = require('express');
const app = express();

app.get('/api/ok', (req, res) => {
  res.json({ status: 'fine' });
});

app.get('/api/divide', (req, res) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);
  if (b === 0) {
    const err = new Error('Cannot divide by zero');
    err.statusCode = 400;
    throw err; // sync throw -> Express jumps to the error handler
  }
  res.json({ result: a / b });
});

app.get('/api/bug', (req, res) => {
  const user = undefined;
  res.json({ name: user.name }); // programmer error -> TypeError
});

// 404 handler: after all routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found: ' + req.method + ' ' + req.originalUrl });
});

// error handler: 4 params, LAST
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({ error: status === 500 ? 'Internal Server Error' : err.message });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/ok' },
          { method: 'GET', url: '/api/divide?a=10&b=2' },
          { method: 'GET', url: '/api/divide?a=10&b=0' },
          { method: 'GET', url: '/api/bug' },
          { method: 'POST', url: '/api/unknown' },
        ],
      },
      result: `GET /api/ok → 200 {"status":"fine"}
GET /api/divide?a=10&b=2 → 200 {"result":5}
GET /api/divide?a=10&b=0 → 400 {"error":"Cannot divide by zero"}
GET /api/bug → 500 {"error":"Internal Server Error"}
POST /api/unknown → 404 {"error":"Route not found: POST /api/unknown"}
Console: ERROR: Cannot divide by zero / ERROR: Cannot read properties of undefined (reading 'name')`,
      explanation: 'Both thrown errors skip the 404 middleware and land in the 4-argument handler. The TypeError is a bug, so the client only sees a generic 500 while the real message is logged on the server.',
    },
    {
      title: 'Async errors are forwarded automatically in Express 5',
      scenario: 'A fake async "database" sometimes rejects. With Express 5 no try/catch or wrapper is needed.',
      steps: [
        'Write a fake async function findUser(id) that resolves or rejects',
        'Use async route handlers with await',
        'Throw inside the async handler when the user is missing',
        'Let Express 5 forward the rejection to the error handler',
        'Compare with the Express 4 asyncHandler wrapper shown in the theory',
      ],
      code: `app.get('/api/users/:id', async (req, res) => {
  const user = await db.findUser(Number(req.params.id)); // may reject
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;              // rejected promise -> error handler (Express 5)
  }
  res.json(user);
});`,
      api: {
        code: `const express = require('express');
const app = express();

const users = [{ id: 1, name: 'Asha' }, { id: 2, name: 'Ravi' }];

// fake async database layer
const db = {
  findUser: async (id) => {
    if (id === 13) throw new Error('Database connection lost');
    return users.find(u => u.id === id) || null;
  },
};

app.get('/api/users/:id', async (req, res) => {
  const user = await db.findUser(Number(req.params.id));
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  res.json(user);
});

app.use((err, req, res, next) => {
  console.error('Caught:', err.message);
  res.status(err.statusCode || 500).json({ error: err.message });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/users/1' },
          { method: 'GET', url: '/api/users/5' },
          { method: 'GET', url: '/api/users/13' },
        ],
      },
      result: `GET /api/users/1 → 200 {"id":1,"name":"Asha"}
GET /api/users/5 → 404 {"error":"User not found"}
GET /api/users/13 → 500 {"error":"Database connection lost"}`,
      explanation: 'Both the "not found" throw and the rejected db call become rejected promises of the async handler. Express 5 catches them and calls next(err). On Express 4 these requests would hang without asyncHandler or try/catch.',
    },
    {
      title: 'Custom error classes and one central error handler',
      scenario: 'Build AppError, NotFoundError, ValidationError and ConflictError, throw them from a service, and format all errors the same way.',
      steps: [
        'Create class AppError extends Error with statusCode and details',
        'Create subclasses NotFoundError (404), ValidationError (400) and ConflictError (409)',
        'Throw them in the service functions; controllers stay clean',
        'Turn unknown routes into NotFoundError with next(err)',
        'In the error handler: AppError → its status/message; anything else → 500 generic',
      ],
      code: `class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}
class NotFoundError extends AppError { constructor(what) { super(what + ' not found', 404); } }
class ValidationError extends AppError { constructor(details) { super('Validation failed', 400, details); } }
class ConflictError extends AppError { constructor(message) { super(message, 409); } }`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// ---------- utils/errors.js ----------
class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}
class NotFoundError extends AppError { constructor(what) { super(what + ' not found', 404); } }
class ValidationError extends AppError { constructor(details) { super('Validation failed', 400, details); } }
class ConflictError extends AppError { constructor(message) { super(message, 409); } }

// ---------- services/user.service.js ----------
const users = [{ id: 1, email: 'asha@mail.com', name: 'Asha' }];
const userService = {
  async getById(id) {
    const user = users.find(u => u.id === id);
    if (!user) throw new NotFoundError('User ' + id);
    return user;
  },
  async create({ email, name } = {}) {
    const details = [];
    if (!email || !email.includes('@')) details.push({ field: 'email', message: 'valid email required' });
    if (!name) details.push({ field: 'name', message: 'name required' });
    if (details.length) throw new ValidationError(details);
    if (users.some(u => u.email === email)) throw new ConflictError('Email already registered');
    const user = { id: users.length + 1, email, name };
    users.push(user);
    return user;
  },
};

// ---------- routes ----------
app.get('/api/users/:id', async (req, res) => {
  res.json(await userService.getById(Number(req.params.id)));
});
app.post('/api/users', async (req, res) => {
  res.status(201).json(await userService.create(req.body));
});

// ---------- middlewares/notFound.js ----------
app.use((req, res, next) => {
  next(new NotFoundError('Route ' + req.originalUrl));
});

// ---------- middlewares/errorHandler.js ----------
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    const body = { error: { type: err.name, message: err.message } };
    if (err.details) body.error.details = err.details;
    return res.status(err.statusCode).json(body);
  }
  console.error('UNEXPECTED', err);
  res.status(500).json({ error: { type: 'InternalError', message: 'Something went wrong' } });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/users/1' },
          { method: 'GET', url: '/api/users/9' },
          { method: 'POST', url: '/api/users', body: { email: 'bad' } },
          { method: 'POST', url: '/api/users', body: { email: 'asha@mail.com', name: 'Asha K' } },
          { method: 'POST', url: '/api/users', body: { email: 'ravi@mail.com', name: 'Ravi' } },
          { method: 'GET', url: '/api/teachers' },
        ],
      },
      result: `GET /api/users/1 → 200 {"id":1,"email":"asha@mail.com","name":"Asha"}
GET /api/users/9 → 404 {"error":{"type":"NotFoundError","message":"User 9 not found"}}
POST /api/users → 400 {"error":{"type":"ValidationError","message":"Validation failed","details":[{"field":"email","message":"valid email required"},{"field":"name","message":"name required"}]}}
POST /api/users → 409 {"error":{"type":"ConflictError","message":"Email already registered"}}
POST /api/users → 201 {"id":2,"email":"ravi@mail.com","name":"Ravi"}
GET /api/teachers → 404 {"error":{"type":"NotFoundError","message":"Route /api/teachers not found"}}`,
      explanation: 'The routes are one line each because the service throws meaningful errors. this.name = this.constructor.name gives each subclass its own type. All errors – including unknown routes – leave the API in exactly one shape.',
    },
    {
      title: 'Errors from callbacks, next(err) and the Express 4 asyncHandler',
      scenario: 'Callback-based code (timers, old libraries) is outside the promise chain, so you must call next(err) yourself.',
      steps: [
        'Create a route that uses setTimeout with a callback (simulates an old callback API)',
        'Inside the callback, call next(err) on failure instead of throwing',
        'Create an asyncHandler wrapper (needed in Express 4, harmless in Express 5)',
        'Test both routes',
      ],
      code: `// throwing inside a callback would CRASH the process – use next(err)
app.get('/api/legacy/:n', (req, res, next) => {
  setTimeout(() => {
    if (req.params.n === '0') return next(new Error('Legacy service failed'));
    res.json({ value: Number(req.params.n) * 10 });
  }, 10);
});

// Express 4 style wrapper
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);`,
      api: {
        code: `const express = require('express');
const app = express();

// old callback-style API
function legacyCompute(n, callback) {
  setTimeout(() => {
    if (n === 0) return callback(new Error('Legacy service failed'));
    callback(null, n * 10);
  }, 10);
}

app.get('/api/legacy/:n', (req, res, next) => {
  legacyCompute(Number(req.params.n), (err, value) => {
    if (err) return next(err); // NEVER throw inside a callback
    res.json({ value });
  });
});

// Express 4 compatible wrapper for async handlers
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get('/api/report', asyncHandler(async (req, res) => {
  if (req.query.fail === 'yes') throw new Error('Report generation failed');
  res.json({ report: 'ready' });
}));

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/legacy/4' },
          { method: 'GET', url: '/api/legacy/0' },
          { method: 'GET', url: '/api/report' },
          { method: 'GET', url: '/api/report?fail=yes' },
        ],
      },
      result: `GET /api/legacy/4 → 200 {"value":40}
GET /api/legacy/0 → 500 {"error":"Legacy service failed"}
GET /api/report → 200 {"report":"ready"}
GET /api/report?fail=yes → 500 {"error":"Report generation failed"}`,
      explanation: 'A throw inside the setTimeout callback would happen after the handler already returned, so neither Express 4 nor 5 could catch it and the whole process would crash. next(err) puts the error back on the Express track.',
    },
    {
      title: 'Production-grade error handler with process safety nets (run locally)',
      scenario: 'The real files you would put in src/middlewares and src/server.js, including mapping library errors.',
      steps: [
        'Create src/utils/AppError.js and src/middlewares/errorHandler.js as below',
        'Register notFound and errorHandler last in app.js',
        'Add process handlers in server.js',
        'Send malformed JSON with curl to see the 400 from entity.parse.failed',
      ],
      code: `// src/middlewares/errorHandler.js
const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  // 1. express.json() parse errors
  if (err.type === 'entity.parse.failed') {
    err = new AppError('Malformed JSON body', 400);
  }
  // 2. Mongoose errors (Day 18-19)
  if (err.name === 'CastError') err = new AppError('Invalid id: ' + err.value, 400);
  if (err.code === 11000) err = new AppError('Duplicate value: ' + Object.keys(err.keyValue).join(', '), 409);
  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    err = new AppError('Validation failed', 400, details);
  }

  const status = err.statusCode || err.status || 500;
  if (status >= 500) console.error(err); // log full error only on the server

  res.status(status).json({
    success: false,
    message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    ...(err.details && { details: err.details }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

// src/server.js
const app = require('./app');
const server = app.listen(process.env.PORT || 3000, () => console.log('Server running on port 3000'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // let PM2 / Docker restart the app
});

// test malformed JSON:
// curl -X POST localhost:3000/api/users -H "Content-Type: application/json" -d "{bad json"`,
      result: `curl with "{bad json" → 400 {"success":false,"message":"Malformed JSON body","stack":"..."}  (stack hidden when NODE_ENV=production)`,
      explanation: 'One handler translates every known error type (body-parser, Mongoose, custom) into the same response shape. Process handlers are the last line of defence for errors that escaped Express.',
    },
  ],
  interview: [
    { q: 'How does Express recognise error-handling middleware?', a: 'By its arity: a function with exactly four parameters (err, req, res, next). With fewer parameters it is treated as normal middleware.', level: 'Easy' },
    { q: 'How do you pass an error to the error handler?', a: 'Throw synchronously inside a handler, call next(err), or (Express 5) let an async handler reject. Express then skips regular middleware and runs the next error middleware.', level: 'Easy' },
    { q: 'How are async errors handled differently in Express 4 and Express 5?', a: 'Express 4 does not catch rejected promises: you need try/catch with next(err), an asyncHandler wrapper or express-async-errors. Express 5 automatically calls next(err) when a handler or middleware returns a rejected promise.', level: 'Medium' },
    { q: 'Where should the 404 handler and error handler be registered?', a: 'After all routes: first the 404 middleware (reached only when no route responded), then the error handler as the very last middleware.', level: 'Easy' },
    { q: 'Why create custom error classes?', a: 'To attach HTTP status codes, error codes and details to errors, use instanceof checks, keep controllers clean (just throw NotFoundError) and produce consistent responses from one central handler.', level: 'Medium' },
    { q: 'What is the difference between operational and programmer errors?', a: 'Operational errors are expected runtime problems (invalid input, not found, network timeouts) that you handle gracefully. Programmer errors are bugs (TypeError, wrong logic) – log them, return 500, and fix the code.', level: 'Medium' },
    { q: 'Why should you not send err.stack to the client in production?', a: 'Stack traces reveal file paths, library versions and internal logic that help attackers. Log them on the server; send a generic message to clients.', level: 'Easy' },
    { q: 'What happens if you throw inside a setTimeout or fs callback in a route?', a: 'The throw happens outside Express and outside any promise, so it becomes an uncaughtException that crashes the process. Use next(err) inside callbacks or promisify the API.', level: 'Hard' },
    { q: 'What are unhandledRejection and uncaughtException?', a: 'Process-level events: unhandledRejection fires when a promise rejects with no handler; uncaughtException fires when a synchronous error escapes all code. Log them and exit gracefully, relying on a process manager to restart.', level: 'Medium' },
    { q: 'What happens if the error handler itself calls next(err)?', a: 'Express passes the error to the next error handler, or to its built-in default handler which sends a 500 HTML response. If headers are already sent, you must call next(err) so Express can close the connection.', level: 'Hard' },
    { q: 'How do you write a catch-all route in Express 5?', a: 'Use a named wildcard: app.all("/*splat", handler) (or "/{*splat}" to include the root). The bare "*" from Express 4 is no longer valid. Simplest for 404s: app.use((req, res) => ...).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add a 404 handler that returns { error: "Not Found", path } and an error handler returning { error: message } with err.statusCode or 500.',
      hint: 'Two app.use calls at the end; the second has four parameters.',
      solution: `app.use((req, res) => res.status(404).json({ error: 'Not Found', path: req.originalUrl }));
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});`,
    },
    {
      task: 'Create an UnauthorizedError (401) class and use it in a middleware that requires ?token=letmein.',
      hint: 'Extend your AppError; call next(new UnauthorizedError()).',
      solution: `class AppError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; this.name = this.constructor.name; }
}
class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') { super(message, 401); }
}
function auth(req, res, next) {
  if (req.query.token !== 'letmein') return next(new UnauthorizedError());
  next();
}
app.get('/api/profile', auth, (req, res) => res.json({ name: 'Asha' }));`,
    },
    {
      task: 'Write the asyncHandler utility and explain in a comment why it is optional in Express 5.',
      hint: 'Wrap the function call in Promise.resolve(...).catch(next).',
      solution: `// Express 4: rejected promises are not caught, so we forward them manually.
// Express 5 does this automatically, but the wrapper is harmless and keeps code portable.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
module.exports = asyncHandler;`,
    },
    {
      task: 'Make the error handler hide messages of 5xx errors when NODE_ENV is "production" and include the stack otherwise.',
      hint: 'Read process.env.NODE_ENV once.',
      solution: `const isProd = process.env.NODE_ENV === 'production';
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const body = { error: status >= 500 && isProd ? 'Internal Server Error' : err.message };
  if (!isProd) body.stack = err.stack;
  res.status(status).json(body);
});`,
    },
    {
      task: 'Handle malformed JSON bodies: respond 400 { error: "Invalid JSON" } instead of a generic 500.',
      hint: 'express.json() errors have type "entity.parse.failed".',
      solution: `app.use(express.json());
// ... routes ...
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  res.status(err.statusCode || 500).json({ error: err.message });
});`,
    },
  ],
  quiz: [
    { question: 'How many parameters does an Express error-handling middleware have?', options: ['2', '3', '4', '5'], answer: 2, explanation: '(err, req, res, next).' },
    { question: 'In Express 5, an async route handler awaits a promise that rejects. What happens?', options: ['The request hangs', 'The process crashes', 'Express ignores it', 'Express forwards the error to error middleware'], answer: 3, explanation: 'Express 5 catches rejected promises and calls next(err).' },
    { question: 'Where should the 404 handler go?', options: ['After all routes, before the error handler', 'Before all routes', 'After the error handler', 'Inside every route'], answer: 0, explanation: 'It must only run when no route matched, and errors still go to the final handler.' },
    { question: 'Inside an fs.readFile callback in a route, the file is missing. What should you do?', options: ['throw err', 'return next(err)', 'process.exit(1)', 'res.json(err) with status 200'], answer: 1, explanation: 'Throwing in a callback escapes Express; next(err) forwards it properly.' },
    { question: 'Which is a programmer error rather than an operational error?', options: ['User submits an invalid email', 'Record not found', 'TypeError: cannot read properties of undefined', 'Database timeout'], answer: 2, explanation: 'A TypeError from bad code is a bug.' },
  ],
};
