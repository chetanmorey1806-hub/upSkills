export default {
  id: 'extra-08-express-rest-api-interview',
  title: 'Express & REST API Design Interview: Middleware, Routing, Errors, Validation, Versioning, Status Codes, Idempotency, Auth & Rate Limiting',
  module: 'Interview: Backend',
  extraNo: 8,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Revision notes and 28 interview questions on Express 5 and REST API design: how middleware works, routers, centralised error handling, validation, versioning, correct status codes, idempotency, JWT/session auth flows, pagination and rate limiting, with runnable plain-JS simulations.',
  objectives: [
    'Explain the Express request-response cycle and the middleware chain with next()',
    'Design clean REST endpoints with correct HTTP methods, status codes, versioning and pagination',
    'Implement centralised error handling and request validation the Express 5 way',
    'Explain idempotency, authentication flows (JWT access + refresh, sessions) and authorization',
    'Protect APIs with rate limiting, CORS, helmet and input sanitisation',
  ],
  theory: [
    {
      heading: 'Express in one minute and the middleware chain',
      content: `**Express is a minimal, unopinionated web framework for Node.js** that adds routing, middleware, and helpers (\`res.json\`, \`req.params\`) on top of the \`http\` module. Express 5 (5.1 is the npm "latest" since 2025) requires Node 18+.

**Middleware** is a function \`(req, res, next)\` that runs during the request-response cycle. It can:
- read/modify \`req\` and \`res\` (e.g. attach \`req.user\`)
- end the cycle (\`res.json(...)\`)
- call \`next()\` to pass control to the next middleware
- call \`next(err)\` to jump to the error handlers

Middleware runs **in the order it is registered**. Types: application-level (\`app.use\`), router-level (\`router.use\`), built-in (\`express.json()\`, \`express.static()\`, \`express.urlencoded()\`), third-party (\`cors\`, \`helmet\`, \`morgan\`, \`cookie-parser\`), and **error-handling middleware** with **4 arguments** \`(err, req, res, next)\`.

Analogy: airport security. Each counter (middleware) checks something; if all is fine you move to the next; if one fails, you are sent to a special desk (error handler) and never reach the gate (route handler).`,
      syntax: `import express from 'express';
const app = express();
app.use(express.json({ limit: '100kb' }));   // parse JSON body
app.use((req, res, next) => {                // logger
  console.log(req.method, req.originalUrl);
  next();
});
app.get('/api/v1/health', (req, res) => res.json({ ok: true }));
app.listen(5000);`,
      tip: 'Classic bug: forgetting next() (request hangs) or calling res.json() twice ("Cannot set headers after they are sent"). Use return res.json(...) to stop.',
    },
    {
      heading: 'Routing, Router and Express 5 changes',
      content: `- Route params: \`/users/:id\` → \`req.params.id\` (always a string)
- Query string: \`/products?page=2&sort=price\` → \`req.query.page\`
- Body: \`req.body\` (needs \`express.json()\`; in Express 5 it is \`undefined\` if no parser ran)
- \`express.Router()\` creates a mini-app to split routes by feature: \`app.use('/api/v1/users', userRouter)\`
- \`router.route('/:id').get(getOne).patch(update).delete(remove)\` groups methods on one path

**Express 5 changes interviewers ask about:**
1. **Async errors are forwarded automatically**: if an \`async\` handler throws or returns a rejected promise, Express calls \`next(err)\` for you. No more \`express-async-handler\` wrapper.
2. New path syntax (path-to-regexp v8): wildcard must be named \`/*splat\` (not \`*\`), optional segment \`/:file{.:ext}\`, no inline regex like \`/:id(\\d+)\`.
3. Removed old APIs: \`app.del\`, \`res.send(status)\`, \`req.param()\`; use \`res.status(404).send()\`, \`res.sendStatus()\`.
4. \`req.query\` is a read-only getter; default query parser is "simple".`,
      syntax: `// routes/user.routes.js
import { Router } from 'express';
const router = Router();
router.get('/', listUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
export default router;
// app.js
app.use('/api/v1/users', userRouter);`,
    },
    {
      heading: 'Centralised error handling and validation',
      content: `Put **one error-handling middleware at the end** (after all routes). Throw custom errors from anywhere; the handler formats a consistent JSON response.

Use a small \`AppError\` class with a \`statusCode\` and \`isOperational\` flag. Map known library errors: Mongoose \`ValidationError\` → 400, \`CastError\` (bad ObjectId) → 400, duplicate key \`code 11000\` → 409, \`JsonWebTokenError\` → 401. Add a 404 handler before the error handler for unknown routes. Never send stack traces in production.

**Validation:** never trust client input. Validate **body, params and query** at the edge with a schema library (**zod**, joi, express-validator) and return **400** (or 422) with field-wise messages. Mongoose schema validation is a second layer, not a replacement.`,
      syntax: `class AppError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}
app.get('/api/v1/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);   // Express 5: rejection -> error handler
  if (!user) throw new AppError('User not found', 404);
  res.json({ data: user });
});
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
});`,
      tip: 'How to answer: "async errors go to a single error middleware, validation happens before the controller with zod, responses have one consistent shape."',
    },
    {
      heading: 'REST design: resources, methods, status codes, versioning, pagination',
      content: `**REST** = Representational State Transfer: resources identified by URLs, manipulated with standard HTTP methods, **stateless** requests (each request carries all info, e.g. a token), cacheable responses, uniform interface.

Good URL design: nouns, plural, lowercase, nested only one level.
- \`GET /api/v1/products\` list, \`GET /api/v1/products/42\` one
- \`POST /api/v1/products\` create → **201 Created** + Location header
- \`PUT /api/v1/products/42\` replace whole resource; \`PATCH\` partial update → 200
- \`DELETE /api/v1/products/42\` → **204 No Content**
- \`GET /api/v1/users/7/orders\` sub-resource
- Actions that are not CRUD: \`POST /api/v1/orders/42/cancel\`

**Status codes to know:** 200 OK, 201 Created, 204 No Content, 301/302 redirects, 304 Not Modified, 400 Bad Request, 401 Unauthorized (not logged in), 403 Forbidden (logged in, no permission), 404 Not Found, 405 Method Not Allowed, 409 Conflict (duplicate email), 422 Unprocessable Content (validation), 429 Too Many Requests, 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable.

**Versioning:** URL (\`/api/v1\`, most common and simple), header (\`Accept: application/vnd.app.v2+json\`), or query (\`?version=2\`). Bump the major version only for breaking changes.

**Pagination/filter/sort:** \`GET /products?page=2&limit=20&sort=-price&category=mobile\`. Return metadata (\`total\`, \`page\`, \`totalPages\` or \`nextCursor\`). Always cap \`limit\`.`,
    },
    {
      heading: 'Idempotency and safe methods',
      content: `- **Safe** method: does not change server state: GET, HEAD, OPTIONS.
- **Idempotent** method: calling it once or N times leaves the server in the **same state**: GET, PUT, DELETE, HEAD, OPTIONS. (DELETE twice: first 204, second 404 – the response differs but the state is the same.)
- **POST is not idempotent**: two POSTs create two orders. **PATCH** is not guaranteed idempotent (e.g. \`{ "$inc": 1 }\`-style patches).

Why it matters: networks fail. If a payment request times out, the client retries. Without protection the customer is charged twice. Solution: an **Idempotency-Key** header (a UUID created by the client). The server stores key → response; a repeated key returns the saved response instead of processing again. Stripe and Razorpay APIs use this. Also use unique DB indexes (e.g. unique \`orderId\`) as a last line of defence.`,
      tip: 'Interview line: "Idempotent means same effect, not same response."',
    },
    {
      heading: 'Authentication flows, authorization and rate limiting',
      content: `**Authentication** = who are you? **Authorization** = what are you allowed to do?

**Session-based:** server stores session (in Redis/Mongo), browser gets an httpOnly cookie with session id. Easy to revoke; needs shared session store when scaling.

**JWT-based (common in MERN):**
1. \`POST /auth/login\` → verify password with bcrypt
2. Issue a short-lived **access token** (e.g. 15 min) and a long-lived **refresh token** (e.g. 7 days, stored in an **httpOnly, Secure, SameSite** cookie and in DB so it can be revoked/rotated)
3. Client sends \`Authorization: Bearer <access>\`; an \`auth\` middleware verifies it with \`jwt.verify\` and sets \`req.user\`
4. When access expires (401), client calls \`POST /auth/refresh\`; server verifies refresh token, **rotates** it and issues a new access token
5. Logout deletes the refresh token from DB and clears the cookie

**Authorization:** role middleware \`authorize('admin')\` returns 403; ownership checks (a user can only edit their own order).

**Rate limiting:** limit requests per IP/user per time window to stop brute force and abuse; respond **429** with \`Retry-After\`. Use \`express-rate-limit\` with a Redis store when running multiple instances. Algorithms: fixed window, sliding window, token bucket.

Other security middleware: \`helmet\` (headers), \`cors({ origin: ['https://myapp.com'], credentials: true })\`, body size limits, input sanitisation against NoSQL injection.`,
      syntax: `const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden' });
router.delete('/:id', auth, authorize('admin'), deleteProduct);`,
    },
  ],
  examples: [
    {
      title: 'How next() and error middleware work: a mini Express pipeline',
      scenario: 'Interviewer: "How does Express decide which middleware runs next, and how does an error skip to the error handler?" Build a tiny version to prove it.',
      steps: [
        'Store middleware in an array (the stack)',
        'next() runs the next function; next(err) skips normal middleware until a 4-argument function is found',
        'Error handlers are detected by fn.length === 4, exactly like Express',
        'Send one request with a token and one without, then click Run',
      ],
      code: `function createApp() {
  const stack = [];
  return {
    use(fn) { stack.push(fn); },
    handle(req, res) {
      let i = 0;
      function next(err) {
        const fn = stack[i++];
        if (!fn) return;
        const isErrorHandler = fn.length === 4;
        try {
          if (err && isErrorHandler) return fn(err, req, res, next);
          if (err) return next(err);          // skip normal middleware
          if (!isErrorHandler) return fn(req, res, next);
          return next();                      // skip error handler when no error
        } catch (e) { next(e); }
      }
      next();
    },
  };
}
const app = createApp();
app.use((req, res, next) => { console.log('logger:', req.method, req.url); next(); });
app.use((req, res, next) => {
  if (!req.headers.authorization) return next(new Error('401 Unauthorized'));
  req.user = { id: 7 }; next();
});
app.use((req, res, next) => { res.send('Hello user ' + req.user.id); });
app.use((err, req, res, next) => { res.send('Error handler: ' + err.message); });
const res = { send: (msg) => console.log('response ->', msg) };
app.handle({ method: 'GET', url: '/profile', headers: { authorization: 'Bearer abc' } }, res);
app.handle({ method: 'GET', url: '/profile', headers: {} }, res);`,
      playground: {
        html: '<p>Open the console to see the middleware chain run.</p>',
        js: `function createApp() {
  const stack = [];
  return {
    use(fn) { stack.push(fn); },
    handle(req, res) {
      let i = 0;
      function next(err) {
        const fn = stack[i++];
        if (!fn) return;
        const isErrorHandler = fn.length === 4;
        try {
          if (err && isErrorHandler) return fn(err, req, res, next);
          if (err) return next(err);
          if (!isErrorHandler) return fn(req, res, next);
          return next();
        } catch (e) { next(e); }
      }
      next();
    },
  };
}
const app = createApp();
app.use((req, res, next) => { console.log('logger:', req.method, req.url); next(); });
app.use((req, res, next) => {
  if (!req.headers.authorization) return next(new Error('401 Unauthorized'));
  req.user = { id: 7 }; next();
});
app.use((req, res, next) => { res.send('Hello user ' + req.user.id); });
app.use((err, req, res, next) => { res.send('Error handler: ' + err.message); });
const res = { send: (msg) => console.log('response ->', msg) };
app.handle({ method: 'GET', url: '/profile', headers: { authorization: 'Bearer abc' } }, res);
app.handle({ method: 'GET', url: '/profile', headers: {} }, res);`,
      },
      result: `logger: GET /profile
response -> Hello user 7
logger: GET /profile
response -> Error handler: 401 Unauthorized`,
      explanation: `With a token, the chain runs logger → auth (sets req.user) → route handler, and the error handler is skipped. Without a token, auth calls next(err); every normal middleware is skipped until the 4-argument function is reached. That is why Express error handlers MUST declare all 4 parameters (even if next is unused) and must be registered after the routes. The try/catch mirrors how Express catches synchronous throws; Express 5 additionally catches rejected promises from async handlers.`,
    },
    {
      title: 'Fixed-window rate limiter returning 429 and Retry-After',
      scenario: 'Machine-coding style question: "Implement a rate limiter that allows 3 requests per second per IP."',
      steps: [
        'Keep a Map of ip → { count, start }',
        'If the window expired, reset the counter',
        'If count < limit, allow and increment; else return 429 with seconds to wait',
        'Pass a fake "now" so the result is deterministic, then click Run',
      ],
      code: `function createRateLimiter({ limit, windowMs }) {
  const hits = new Map(); // ip -> { count, start }
  return function check(ip, now = Date.now()) {
    const entry = hits.get(ip);
    if (!entry || now - entry.start >= windowMs) {
      hits.set(ip, { count: 1, start: now });
      return { allowed: true, remaining: limit - 1 };
    }
    if (entry.count < limit) {
      entry.count++;
      return { allowed: true, remaining: limit - entry.count };
    }
    const retryAfter = Math.ceil((entry.start + windowMs - now) / 1000);
    return { allowed: false, status: 429, retryAfter };
  };
}
const check = createRateLimiter({ limit: 3, windowMs: 1000 });
const t = 0;
console.log(check('1.1.1.1', t));
console.log(check('1.1.1.1', t + 100));
console.log(check('1.1.1.1', t + 200));
console.log(check('1.1.1.1', t + 300));
console.log(check('2.2.2.2', t + 300));
console.log(check('1.1.1.1', t + 1001));

// As Express middleware:
// const limiter = createRateLimiter({ limit: 100, windowMs: 15 * 60 * 1000 });
// app.use((req, res, next) => {
//   const r = limiter(req.ip);
//   if (!r.allowed) return res.set('Retry-After', String(r.retryAfter)).status(429).json({ error: 'Too many requests' });
//   res.set('X-RateLimit-Remaining', String(r.remaining));
//   next();
// });`,
      playground: {
        html: '<p>Open the console to see which requests are allowed.</p>',
        js: `function createRateLimiter({ limit, windowMs }) {
  const hits = new Map();
  return function check(ip, now = Date.now()) {
    const entry = hits.get(ip);
    if (!entry || now - entry.start >= windowMs) {
      hits.set(ip, { count: 1, start: now });
      return { allowed: true, remaining: limit - 1 };
    }
    if (entry.count < limit) {
      entry.count++;
      return { allowed: true, remaining: limit - entry.count };
    }
    const retryAfter = Math.ceil((entry.start + windowMs - now) / 1000);
    return { allowed: false, status: 429, retryAfter };
  };
}
const check = createRateLimiter({ limit: 3, windowMs: 1000 });
const t = 0;
console.log(check('1.1.1.1', t));
console.log(check('1.1.1.1', t + 100));
console.log(check('1.1.1.1', t + 200));
console.log(check('1.1.1.1', t + 300));
console.log(check('2.2.2.2', t + 300));
console.log(check('1.1.1.1', t + 1001));`,
      },
      result: `{ allowed: true, remaining: 2 }
{ allowed: true, remaining: 1 }
{ allowed: true, remaining: 0 }
{ allowed: false, status: 429, retryAfter: 1 }
{ allowed: true, remaining: 2 }
{ allowed: true, remaining: 2 }`,
      explanation: `The 4th request from 1.1.1.1 within the same second is rejected with 429; a different IP has its own counter; after 1000 ms the window resets. Weakness of a fixed window: a client can send 3 requests at 0.99 s and 3 more at 1.01 s (burst at the boundary). Sliding window or token bucket smooth this. In-memory Maps only work for a single server; with multiple instances behind a load balancer store counters in Redis (INCR + EXPIRE).`,
    },
    {
      title: 'Idempotency-Key to prevent double payments',
      scenario: 'Interviewer: "The client timed out and retried a POST /payments. How do you make sure the customer is not charged twice?"',
      steps: [
        'Require an Idempotency-Key header on POST /payments',
        'Before processing, check whether the key was already processed',
        'If yes, return the stored response; if no, process and store the response',
        'Click Run and watch the balance',
      ],
      code: `const processed = new Map(); // key -> saved response (use Redis/Mongo with TTL in real apps)
let balance = 1000;
function createPayment(idempotencyKey, amount) {
  if (!idempotencyKey) return { status: 400, body: { error: 'Idempotency-Key header required' } };
  if (processed.has(idempotencyKey)) {
    return { ...processed.get(idempotencyKey), replayed: true };
  }
  balance -= amount;
  const response = { status: 201, body: { paymentId: 'pay_' + processed.size, amount, balance } };
  processed.set(idempotencyKey, response);
  return response;
}
console.log(createPayment('key-abc', 200));
console.log(createPayment('key-abc', 200)); // client retried after timeout
console.log(createPayment('key-xyz', 50));
console.log(createPayment(undefined, 50));
console.log('final balance:', balance);`,
      playground: {
        html: '<p>Open the console: the retried request does not charge twice.</p>',
        js: `const processed = new Map();
let balance = 1000;
function createPayment(idempotencyKey, amount) {
  if (!idempotencyKey) return { status: 400, body: { error: 'Idempotency-Key header required' } };
  if (processed.has(idempotencyKey)) {
    return { ...processed.get(idempotencyKey), replayed: true };
  }
  balance -= amount;
  const response = { status: 201, body: { paymentId: 'pay_' + processed.size, amount, balance } };
  processed.set(idempotencyKey, response);
  return response;
}
console.log(createPayment('key-abc', 200));
console.log(createPayment('key-abc', 200));
console.log(createPayment('key-xyz', 50));
console.log(createPayment(undefined, 50));
console.log('final balance:', balance);`,
      },
      result: `{
  status: 201,
  body: { paymentId: 'pay_0', amount: 200, balance: 800 }
}
{
  status: 201,
  body: { paymentId: 'pay_0', amount: 200, balance: 800 },
  replayed: true
}
{ status: 201, body: { paymentId: 'pay_1', amount: 50, balance: 750 } }
{ status: 400, body: { error: 'Idempotency-Key header required' } }
final balance: 750

(The browser console shows the same objects in its own expandable format.)`,
      explanation: `The retry with the same key returns the original response (same paymentId) and the balance is deducted only once: 1000 - 200 - 50 = 750. In production: store keys in Redis or a Mongo collection with a unique index and a TTL (e.g. 24 h), save a "processing" marker first to handle two retries arriving at the same time, and include the user id in the key scope.`,
    },
    {
      title: 'Request validation returning 422 with field errors',
      scenario: 'Interviewer: "How do you validate a request body in Express and what do you return?" This is what a validation middleware (zod/joi) does internally.',
      steps: [
        'Collect all errors instead of stopping at the first',
        'Return 422 (or 400) with an array of { field, msg }',
        'On success return sanitised data (trimmed name)',
        'Click Run',
      ],
      code: `function validateUser(body) {
  const errors = [];
  if (typeof body.name !== 'string' || body.name.trim().length < 2) errors.push({ field: 'name', msg: 'Name must be at least 2 characters' });
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(body.email ?? '')) errors.push({ field: 'email', msg: 'Invalid email' });
  if (!Number.isInteger(body.age) || body.age < 18) errors.push({ field: 'age', msg: 'Age must be an integer >= 18' });
  return errors.length ? { status: 422, errors } : { status: 201, data: { ...body, name: body.name.trim() } };
}
console.log(JSON.stringify(validateUser({ name: ' Ravi ', email: 'ravi@mail.com', age: 22 })));
console.log(JSON.stringify(validateUser({ name: 'R', email: 'ravi@', age: '22' }), null, 2));

// Same with zod in a real Express 5 app:
// import { z } from 'zod';
// const userSchema = z.object({ name: z.string().trim().min(2), email: z.string().email(), age: z.number().int().min(18) });
// const validate = (schema) => (req, res, next) => {
//   const r = schema.safeParse(req.body);
//   if (!r.success) return res.status(422).json({ errors: r.error.issues });
//   req.body = r.data; next();
// };
// router.post('/users', validate(userSchema), createUser);`,
      playground: {
        html: '<p>Open the console to see valid and invalid results.</p>',
        js: `function validateUser(body) {
  const errors = [];
  if (typeof body.name !== 'string' || body.name.trim().length < 2) errors.push({ field: 'name', msg: 'Name must be at least 2 characters' });
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(body.email ?? '')) errors.push({ field: 'email', msg: 'Invalid email' });
  if (!Number.isInteger(body.age) || body.age < 18) errors.push({ field: 'age', msg: 'Age must be an integer >= 18' });
  return errors.length ? { status: 422, errors } : { status: 201, data: { ...body, name: body.name.trim() } };
}
console.log(JSON.stringify(validateUser({ name: ' Ravi ', email: 'ravi@mail.com', age: 22 })));
console.log(JSON.stringify(validateUser({ name: 'R', email: 'ravi@', age: '22' }), null, 2));`,
      },
      result: `{"status":201,"data":{"name":"Ravi","email":"ravi@mail.com","age":22}}
{
  "status": 422,
  "errors": [
    {
      "field": "name",
      "msg": "Name must be at least 2 characters"
    },
    {
      "field": "email",
      "msg": "Invalid email"
    },
    {
      "field": "age",
      "msg": "Age must be an integer >= 18"
    }
  ]
}`,
      explanation: `Reporting all errors at once gives the frontend everything it needs to highlight every invalid field. Note age "22" (a string) fails: strict type checks prevent surprises and also block NoSQL-injection objects like { "$gt": "" }. Validation middleware sits before the controller, so controllers only receive clean data.`,
    },
  ],
  interview: [
    {
      q: 'What is Express.js and why use it over the plain http module?',
      level: 'Easy',
      a: `Express is a minimal, unopinionated Node.js web framework. With plain http you parse URLs, bodies, headers and route manually in one big callback. Express gives: routing by method+path (app.get('/users/:id')), a middleware pipeline, helpers (res.json, res.status, req.params, req.query), static files (express.static), and a huge ecosystem (cors, helmet, morgan, passport, multer).
Example: app.get('/api/health', (req, res) => res.json({ ok: true })).`,
    },
    {
      q: 'What is middleware in Express? Give examples.',
      level: 'Easy',
      a: `Middleware is a function (req, res, next) that runs between receiving the request and sending the response. It can modify req/res, end the response, or call next().
Examples: express.json() (parse body), cors(), helmet(), morgan('dev') (logging), an auth middleware that verifies a JWT and sets req.user, multer for file uploads, a validation middleware, and the error-handling middleware (err, req, res, next).
Order matters: app.use(express.json()) must come before routes that read req.body.`,
    },
    {
      q: 'What happens if you do not call next() or send a response in middleware?',
      level: 'Easy',
      a: `The request hangs: the client waits until it times out because the cycle never ends. Every middleware must either send a response (res.json/res.send/res.end) or call next(). Also do not do both: calling next() after res.json() can lead to "Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client". Use return res.status(401).json(...) to exit early.`,
    },
    {
      q: 'How do you write an error-handling middleware? Why 4 arguments?',
      level: 'Medium',
      a: `app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message || 'Server error' });
});
Express identifies error handlers by function length (arity) = 4. If you write only (err, req, res), Express treats it as normal middleware. Register it after all routes. You reach it by calling next(err), throwing in a sync handler, or (Express 5) a rejected promise in an async handler.`,
    },
    {
      q: 'How are errors in async route handlers handled in Express 4 vs Express 5?',
      level: 'Medium',
      a: `Express 4 did not catch rejected promises: an error inside an async handler caused an unhandled rejection and the request hung. You wrapped handlers: const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next), or used express-async-errors.
Express 5 automatically forwards rejected promises / thrown errors from async handlers and middleware to next(err). So you can write:
app.get('/users/:id', async (req, res) => { const u = await User.findById(req.params.id); if (!u) throw new AppError('Not found', 404); res.json(u); });`,
    },
    {
      q: 'Difference between app.use() and app.get()?',
      level: 'Easy',
      a: `app.use(path?, fn) mounts middleware for all HTTP methods and matches the path as a prefix: app.use('/api', fn) runs for /api, /api/users, /api/x/y. Inside it req.url is relative to the mount path.
app.get(path, fn) handles only GET requests and matches the path exactly (with params). Use app.use for middleware and routers, app.get/post/... for endpoints.`,
    },
    {
      q: 'What is express.Router() and why use it?',
      level: 'Easy',
      a: `Router creates a modular mini-application with its own routes and middleware. It keeps code organised by feature (MVC style: routes → controllers → services → models).
const router = express.Router();
router.use(auth);                  // applies only to this router
router.get('/', getOrders);
router.post('/', createOrder);
app.use('/api/v1/orders', router);
Benefits: separation of concerns, easier testing, route-level middleware, versioning (/api/v1 and /api/v2 routers).`,
    },
    {
      q: 'req.params vs req.query vs req.body?',
      level: 'Easy',
      a: `- req.params: named URL segments. Route /users/:id, URL /users/42 → req.params.id === '42' (a string). Used to identify a resource.
- req.query: query string. /products?page=2&sort=price → req.query.page === '2'. Used for filtering, sorting, pagination.
- req.body: the request payload for POST/PUT/PATCH; needs express.json() or express.urlencoded(). Used for data to create/update.
All three are strings/untrusted input: validate and convert types.`,
    },
    {
      q: 'What is REST? What are its constraints?',
      level: 'Easy',
      a: `REST (Representational State Transfer) is an architectural style for APIs where resources are identified by URLs and manipulated with HTTP methods, usually exchanging JSON.
Constraints: client-server separation, statelessness (every request has all info needed, e.g. JWT; server keeps no client session), cacheability, uniform interface (resource URLs, standard methods, representations), layered system (proxies/load balancers), optional code on demand.
Example: GET /api/v1/products/42 returns product 42; DELETE /api/v1/products/42 deletes it.`,
    },
    {
      q: 'PUT vs PATCH vs POST?',
      level: 'Easy',
      a: `- POST: create a new resource (server assigns id) or trigger an action. Not idempotent. Returns 201 Created.
- PUT: replace the entire resource at a known URL (missing fields are removed/reset). Idempotent.
- PATCH: partial update, only sent fields change. Not guaranteed idempotent.
Example: user {name, email, phone}. PUT /users/7 with {name, email} → phone is lost. PATCH /users/7 with {phone} → only phone changes. In MERN most "edit" forms use PATCH with findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).`,
    },
    {
      q: 'What does idempotent mean? Which HTTP methods are idempotent?',
      level: 'Medium',
      a: `An operation is idempotent if doing it once or many times leaves the server in the same state. GET, HEAD, OPTIONS, PUT and DELETE are idempotent; POST is not; PATCH is not guaranteed.
DELETE /orders/5 twice: first deletes (204), second returns 404, but the state (order 5 gone) is the same.
Why it matters: clients, proxies and load balancers can safely retry idempotent requests after timeouts. For POST (payments, orders) use an Idempotency-Key header stored on the server so retries are not processed twice.`,
    },
    {
      q: 'Which status codes would you return for create, delete, validation error, duplicate email, not logged in, no permission?',
      level: 'Easy',
      a: `- Create success: 201 Created (with the new resource, optionally Location header)
- Delete success: 204 No Content (no body) or 200 with a message
- Validation error: 400 Bad Request or 422 Unprocessable Content
- Duplicate email: 409 Conflict
- Not logged in / invalid token: 401 Unauthorized
- Logged in but no permission: 403 Forbidden
- Resource missing: 404 Not Found
- Too many requests: 429
- Unexpected server bug: 500`,
    },
    {
      q: '401 vs 403?',
      level: 'Easy',
      a: `401 Unauthorized actually means "unauthenticated": the server does not know who you are (no token, expired or invalid token). The client should log in or refresh the token.
403 Forbidden: the server knows who you are, but you are not allowed (a normal user calling DELETE /admin/users/5, or editing someone else's order). Logging in again will not help.
Some APIs return 404 instead of 403 to hide that a resource exists.`,
    },
    {
      q: 'How do you version a REST API?',
      level: 'Medium',
      a: `Common strategies:
1. URL path: /api/v1/users (most popular; visible, easy to route and cache)
2. Header: Accept: application/vnd.myapp.v2+json or a custom X-API-Version header (clean URLs, harder to test in a browser)
3. Query param: /users?version=2
In Express: app.use('/api/v1', v1Router); app.use('/api/v2', v2Router).
Only bump the major version for breaking changes (removing/renaming fields, changing types). Adding optional fields is backward compatible. Keep old versions alive for a deprecation period (Deprecation/Sunset headers).`,
    },
    {
      q: 'How do you implement pagination, filtering and sorting in an Express + MongoDB API?',
      level: 'Medium',
      a: `GET /api/v1/products?page=2&limit=20&sort=-price&category=mobile
const page = Math.max(1, Number(req.query.page) || 1);
const limit = Math.min(100, Number(req.query.limit) || 20);   // cap limit
const filter = {};
if (req.query.category) filter.category = String(req.query.category);
const [items, total] = await Promise.all([
  Product.find(filter).sort(req.query.sort || '-createdAt').skip((page - 1) * limit).limit(limit).lean(),
  Product.countDocuments(filter),
]);
res.json({ data: items, page, limit, total, totalPages: Math.ceil(total / limit) });
For very large collections or infinite scroll use cursor pagination (_id > lastId) because skip gets slower as it grows. Whitelist sortable fields.`,
    },
    {
      q: 'How do you validate requests in Express?',
      level: 'Medium',
      a: `Validate at the edge (before controllers) with a schema library: zod, joi or express-validator. Validate body, params (e.g. valid ObjectId) and query.
const schema = z.object({ title: z.string().min(3), price: z.number().positive() });
const validate = (s) => (req, res, next) => {
  const r = s.safeParse(req.body);
  if (!r.success) return res.status(400).json({ errors: r.error.issues });
  req.body = r.data; next();
};
Benefits: consistent error responses, type coercion, protection from NoSQL injection and mass assignment (only whitelisted fields pass). Mongoose schema validation is the second layer.`,
    },
    {
      q: 'Explain the JWT authentication flow with access and refresh tokens.',
      level: 'Medium',
      a: `1. Login: verify email + bcrypt.compare(password, hash).
2. Issue access token (short, ~15 min, payload { sub: userId, role }) and refresh token (long, ~7 days).
3. Store the refresh token in an httpOnly, Secure, SameSite cookie (and a hash of it in DB). Access token is kept in memory on the client.
4. Each API call: Authorization: Bearer <accessToken>; auth middleware runs jwt.verify and sets req.user.
5. On 401 (expired), client calls POST /auth/refresh; server verifies the refresh token, rotates it (old one invalidated), returns a new access token.
6. Logout: delete the refresh token from DB, clear cookie.
Why: short access tokens limit damage if stolen; refresh tokens in httpOnly cookies are not readable by JavaScript (XSS).`,
    },
    {
      q: 'JWT vs session-based authentication?',
      level: 'Medium',
      a: `Session: server stores session data (Redis/Mongo) and the client holds only a session id cookie. Easy logout/revocation, small cookie, but needs a shared store across servers.
JWT: signed token containing claims; server verifies the signature without a DB lookup (stateless), good for mobile clients and microservices. Downsides: cannot revoke before expiry without a blacklist, payload is only base64-encoded (not encrypted, so never put passwords in it), larger size.
Typical MERN choice: short-lived JWT access tokens + refresh tokens stored in DB (revocable) in httpOnly cookies.`,
    },
    {
      q: 'Where should you store a JWT on the client: localStorage or cookie?',
      level: 'Hard',
      a: `localStorage: easy, but any XSS script can read it and steal the token.
httpOnly cookie: JavaScript cannot read it, so XSS cannot steal it; but cookies are sent automatically, so you must protect against CSRF with SameSite=Lax/Strict, CSRF tokens for cookie-authenticated state-changing requests, and CORS with explicit origins and credentials: true.
Common best practice: refresh token in an httpOnly, Secure, SameSite cookie; access token in memory (React state), re-fetched via /auth/refresh after page reload. In all cases prevent XSS (React escapes output; avoid dangerouslySetInnerHTML with user data).`,
    },
    {
      q: 'How do you implement role-based authorization in Express?',
      level: 'Medium',
      a: `After the auth middleware sets req.user, add a role middleware:
const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden' });
router.delete('/products/:id', auth, authorize('admin', 'seller'), deleteProduct);
Also check ownership in the controller/query: Order.findOne({ _id: id, user: req.user.id }) so users cannot access other users' data by changing the id (IDOR vulnerability). Never trust a role sent from the client; read it from the verified token or DB.`,
    },
    {
      q: 'What is rate limiting and how do you implement it in Express?',
      level: 'Medium',
      a: `Rate limiting restricts how many requests a client (IP, user or API key) can make in a time window, to prevent brute-force logins, scraping and DoS, and to protect costs.
import { rateLimit } from 'express-rate-limit';
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false }));
Excess requests get 429 Too Many Requests with Retry-After. For multiple server instances use a shared store (rate-limit-redis). Behind a proxy/load balancer set app.set('trust proxy', 1) so req.ip is the real client IP. Algorithms: fixed window, sliding window, token bucket, leaky bucket.`,
    },
    {
      q: 'What is CORS and how do you configure it in Express?',
      level: 'Easy',
      a: `CORS (Cross-Origin Resource Sharing) is a browser security mechanism: a page from http://localhost:5173 cannot read responses from http://localhost:5000 unless the server sends Access-Control-Allow-Origin headers. For non-simple requests (PUT, DELETE, JSON content-type, Authorization header) the browser first sends a preflight OPTIONS request.
import cors from 'cors';
app.use(cors({ origin: ['http://localhost:5173', 'https://myapp.com'], credentials: true }));
Do not use origin: '*' with credentials (browsers reject it). CORS is enforced by browsers only; Postman/curl ignore it, so it is not an authentication mechanism.`,
    },
    {
      q: 'How do you upload files in Express?',
      level: 'Medium',
      a: `Use multer (multipart/form-data parser):
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, ['image/png', 'image/jpeg'].includes(file.mimetype)) });
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => { /* req.file.buffer */ });
Best practice: limit size and type, never trust the original filename, store files in cloud storage (S3/Cloudinary) not the server disk (servers are ephemeral and scaled horizontally), and save only the URL in MongoDB. For big files use presigned URLs so the browser uploads directly to S3.`,
    },
    {
      q: 'How do you structure a large Express project?',
      level: 'Medium',
      a: `Layered / feature-based structure:
src/
  app.js (express app, middleware, routes)  server.js (listen, DB connect, graceful shutdown)
  config/ (env, db)
  routes/ → controllers/ → services/ → models/
  middlewares/ (auth, validate, errorHandler, rateLimit)
  utils/ (AppError, logger)  validators/ (zod schemas)
  tests/
Controllers handle HTTP (req/res), services hold business logic (testable without Express), models are Mongoose schemas. Separating app.js from server.js lets Supertest import the app without starting a port.`,
    },
    {
      q: 'What security middleware/practices do you use in an Express API?',
      level: 'Medium',
      a: `- helmet(): sets secure headers (CSP, X-Content-Type-Options, HSTS, etc.)
- cors with an origin whitelist
- express.json({ limit: '100kb' }) to block huge bodies
- express-rate-limit, especially on /auth routes
- input validation (zod) and NoSQL injection protection (reject $ operators in user input; Mongoose strictQuery / sanitizeFilter)
- bcrypt for passwords, JWT secrets in env vars, short token expiry
- disable x-powered-by (helmet does this), HTTPS only, secure cookies
- generic error messages in production, centralised logging
- npm audit and updated dependencies.`,
    },
    {
      q: 'How do you test Express APIs?',
      level: 'Medium',
      a: `Use Jest or Vitest (or node:test) with Supertest, which calls the Express app in-process without opening a real port:
import request from 'supertest';
import app from '../src/app.js';
test('GET /api/v1/health', async () => {
  const res = await request(app).get('/api/v1/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true });
});
Use mongodb-memory-server or a test database, seed data in beforeEach, and clear it after. Unit-test services separately with mocked models.`,
    },
    {
      q: 'What is the difference between res.send(), res.json() and res.end()?',
      level: 'Easy',
      a: `- res.json(obj): converts to JSON with JSON.stringify, sets Content-Type: application/json. Use for APIs.
- res.send(body): sends a string/Buffer/object; sets Content-Type based on type (object → JSON, string → text/html) and ETag.
- res.end(): ends the response without data processing (from Node's http). Use for empty responses, or res.sendStatus(204).
All of them end the cycle; calling any of them twice throws "headers already sent".`,
    },
    {
      q: 'How would you design the API for an e-commerce cart and checkout?',
      level: 'Hard',
      a: `Resources and endpoints (all under /api/v1, auth required):
GET /cart, POST /cart/items {productId, qty}, PATCH /cart/items/:productId {qty}, DELETE /cart/items/:productId
POST /orders (checkout) with Idempotency-Key header → validates stock and prices on the server (never trust client price), creates order with status 'pending', creates a payment order (Razorpay/Stripe), returns 201 with order id.
POST /payments/webhook (signature verified, idempotent by event id) → marks order 'paid', decrements stock with an atomic $inc and condition { stock: { $gte: qty } } (or a transaction).
GET /orders?page=1, GET /orders/:id (ownership check), POST /orders/:id/cancel.
Status codes: 201 create, 409 out of stock, 422 invalid input, 402/400 payment failures.`,
    },
  ],
  practice: [
    {
      task: 'Write a request-logger middleware that logs method, URL, status code and response time in ms after the response finishes.',
      hint: 'Record process.hrtime.bigint() or performance.now() at start, listen to res.on("finish").',
      solution: `export function requestLogger(req, res, next) {
  const start = performance.now();
  res.on('finish', () => {
    const ms = (performance.now() - start).toFixed(1);
    console.log(req.method + ' ' + req.originalUrl + ' ' + res.statusCode + ' - ' + ms + ' ms');
  });
  next();
}
// app.use(requestLogger);
// Output example: GET /api/v1/products 200 - 12.4 ms`,
    },
    {
      task: 'Create a full CRUD router for /api/v1/tasks (Express 5 + Mongoose) with correct status codes, 404 handling and a centralised error handler.',
      hint: 'Express 5 forwards async errors automatically. Use findByIdAndUpdate with { new: true, runValidators: true }.',
      solution: `import express from 'express';
import mongoose from 'mongoose';

const Task = mongoose.model('Task', new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3 },
  done: { type: Boolean, default: false },
}, { timestamps: true }));

class AppError extends Error {
  constructor(msg, statusCode) { super(msg); this.statusCode = statusCode; }
}

const router = express.Router();
router.get('/', async (req, res) => {
  res.json({ data: await Task.find().sort('-createdAt').lean() });
});
router.get('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new AppError('Task not found', 404);
  res.json({ data: task });
});
router.post('/', async (req, res) => {
  const task = await Task.create({ title: req.body.title });
  res.status(201).json({ data: task });
});
router.patch('/:id', async (req, res) => {
  const { title, done } = req.body;               // whitelist fields
  const task = await Task.findByIdAndUpdate(req.params.id, { title, done }, { new: true, runValidators: true });
  if (!task) throw new AppError('Task not found', 404);
  res.json({ data: task });
});
router.delete('/:id', async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new AppError('Task not found', 404);
  res.status(204).end();
});

const app = express();
app.use(express.json());
app.use('/api/v1/tasks', router);
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
  if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
  res.status(err.statusCode || 500).json({ error: err.statusCode ? err.message : 'Internal server error' });
});
export default app;`,
    },
    {
      task: 'Write auth and authorize middlewares using jsonwebtoken, and protect DELETE /api/v1/products/:id for admins only.',
      hint: 'Read the Bearer token, jwt.verify, set req.user; authorize checks req.user.role.',
      solution: `import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Not logged in' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    res.status(401).json({ error: msg });
  }
}

export const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'Forbidden' });

// usage
// router.delete('/:id', auth, authorize('admin'), deleteProduct);
// login: jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' })`,
    },
    {
      task: 'Implement a sliding-window-log rate limiter function allow(userId, now) that allows at most 5 requests in any 60-second window.',
      hint: 'Store an array of timestamps per user; drop timestamps older than now - 60000 before checking.',
      solution: `function createSlidingLimiter(limit = 5, windowMs = 60_000) {
  const logs = new Map();
  return function allow(userId, now = Date.now()) {
    const times = (logs.get(userId) || []).filter((t) => t > now - windowMs);
    if (times.length >= limit) { logs.set(userId, times); return false; }
    times.push(now);
    logs.set(userId, times);
    return true;
  };
}
const allow = createSlidingLimiter();
const results = [0, 10, 20, 30, 40, 50].map((s) => allow('u1', s * 1000));
console.log(results);                 // [ true, true, true, true, true, false ]
console.log(allow('u1', 60_001));     // true (request at 0 s has left the window)`,
    },
    {
      task: 'Design (write the route table) a REST API for a blog with users, posts and comments, including versioning, pagination and the status code for each route.',
      hint: 'Nouns, plural, nesting one level, actions as sub-resources.',
      solution: `Base: /api/v1   (JSON, JWT in Authorization header)

AUTH
POST   /auth/register            201 user created | 409 email exists | 422 invalid
POST   /auth/login               200 { accessToken } + refresh cookie | 401 wrong credentials
POST   /auth/refresh             200 new access token | 401
POST   /auth/logout              204

POSTS
GET    /posts?page=1&limit=10&sort=-createdAt&tag=react   200 { data, page, total, totalPages }
GET    /posts/:slug              200 | 404
POST   /posts                    201 (auth)            | 401 | 422
PATCH  /posts/:id                200 (owner or admin)  | 403 | 404
DELETE /posts/:id                204 (owner or admin)  | 403 | 404
POST   /posts/:id/like           200 (idempotent: $addToSet userId)
DELETE /posts/:id/like           204

COMMENTS
GET    /posts/:id/comments?cursor=<lastId>&limit=20   200 { data, nextCursor }
POST   /posts/:id/comments       201 (auth)
DELETE /comments/:id             204 (owner/admin)

USERS
GET    /users/me                 200 (auth)
PATCH  /users/me                 200
GET    /users/:username/posts    200`,
    },
  ],
  quiz: [
    {
      question: 'How does Express recognise an error-handling middleware?',
      options: ['It is registered with app.error()', 'Its name ends with Error', 'It has exactly four parameters (err, req, res, next)', 'It is the first middleware registered'],
      answer: 2,
      explanation: 'Express checks the function arity. Error handlers must declare 4 parameters and should be registered after all routes.',
    },
    {
      question: 'A logged-in normal user tries to delete another user. Correct status code?',
      options: ['403 Forbidden', '401 Unauthorized', '400 Bad Request', '409 Conflict'],
      answer: 0,
      explanation: 'The user is authenticated (so not 401) but lacks permission, which is 403.',
    },
    {
      question: 'Which HTTP method is NOT idempotent?',
      options: ['PUT', 'DELETE', 'GET', 'POST'],
      answer: 3,
      explanation: 'Repeating POST typically creates duplicate resources. Use an Idempotency-Key for safe retries.',
    },
    {
      question: 'In Express 5, an async route handler throws an error. What happens?',
      options: ['The server crashes', 'The error is forwarded to the error-handling middleware automatically', 'The request hangs forever', 'Express returns 200 with an empty body'],
      answer: 1,
      explanation: 'Express 5 catches rejected promises from handlers and calls next(err). Express 4 needed a wrapper.',
    },
    {
      question: 'Your API runs on 4 instances behind a load balancer. Where should the rate limiter store its counters?',
      options: ['In a JavaScript Map in each instance', 'In localStorage', 'In a shared store such as Redis', 'In the JWT payload'],
      answer: 2,
      explanation: 'Per-instance memory would allow 4x the limit. A shared Redis store gives one global count per client.',
    },
  ],
};
