export default {
  id: 'day-11-middleware',
  title: 'Middleware in Express: Application-level, Router-level, Built-in, Third-party (morgan, cors) and Custom',
  module: 'Module 2: Express.js',
  day: 11,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Middleware functions are the heart of Express: every request flows through a pipeline of small functions that can read, change, stop or pass the request on. Today you learn how that pipeline works and write your own middleware.',
  objectives: [
    'Explain what middleware is and how the (req, res, next) pipeline works',
    'Write application-level and router-level middleware with app.use() and router.use()',
    'Use built-in middleware: express.json(), express.urlencoded(), express.static()',
    'Install and configure third-party middleware such as morgan and cors',
    'Build custom middleware for logging, authentication and validation, and understand why order matters',
  ],
  theory: [
    {
      heading: 'What is middleware? (the airport security analogy)',
      content: `A **middleware** is simply a function with the signature \`(req, res, next)\` that Express calls while handling a request. Think of an airport: before you reach the plane (your route handler) you pass check-in, security, passport control and boarding. Each counter can **look at you** (read \`req\`), **add something** (stick a boarding-pass sticker = add \`req.user\`), **send you back** (end the response with \`res.status(401).json(...)\`) or **wave you through** (call \`next()\`).

A middleware must do exactly ONE of these two things:
1. End the request–response cycle by sending a response (\`res.json\`, \`res.send\`, \`res.end\` ...), OR
2. Call \`next()\` to hand control to the next middleware/route in the stack.

If it does neither, the request **hangs** forever (the browser spins until timeout). This is the most common beginner bug.

In Express, **route handlers are middleware too** — they are just the last function in the chain, which usually sends the response.`,
      syntax: `function myMiddleware(req, res, next) {
  // 1. read / modify req and res
  req.startedAt = 'now';
  // 2. either respond ...
  // return res.status(403).json({ error: 'Forbidden' });
  // ... or pass control on
  next();
}

app.use(myMiddleware);          // runs for EVERY request
app.get('/x', myMiddleware, handler); // runs only for GET /x`,
      tip: 'Use `return res.status(...).json(...)` inside middleware when you stop the request. The `return` prevents the code below from also calling `next()` and causing "Cannot set headers after they are sent".',
    },
    {
      heading: 'The middleware stack and why ORDER matters',
      content: `Express keeps an ordered list (a **stack**) of middleware and routes in the exact order you register them with \`app.use()\`, \`app.get()\` etc. For each request Express walks the stack from top to bottom and runs every function whose path and method match.

- \`app.use(fn)\` with no path matches **every** request (all methods, all paths).
- \`app.use('/api', fn)\` matches every path that **starts with** \`/api\` (\`/api\`, \`/api/users\`, \`/api/users/5\`).
- \`app.get('/api/users', fn)\` matches only GET and the exact path.

Because the stack is ordered:
- \`express.json()\` must be registered **before** routes that read \`req.body\`, otherwise \`req.body\` is \`undefined\`.
- A logger should be at the **top** so it sees every request.
- A 404 handler goes at the **bottom** (only reached when nothing matched).
- An error handler \`(err, req, res, next)\` goes at the very **end**.`,
      points: [
        'Registration order = execution order',
        'app.use(path) matches path prefixes; app.get(path) matches exact paths',
        'A middleware that never calls next() and never responds makes the request hang',
        'next("route") skips the remaining handlers of the current route (only for app.METHOD/router.METHOD)',
      ],
    },
    {
      heading: 'Types of middleware',
      content: `1. **Application-level** – bound to the \`app\` object with \`app.use()\` or \`app.METHOD()\`. Example: a global logger.
2. **Router-level** – bound to an \`express.Router()\` instance with \`router.use()\`. Works exactly like app-level but only for routes in that router (e.g. an admin-only check for every \`/admin\` route).
3. **Route-level (inline)** – passed directly as extra arguments to one route: \`app.post('/students', validate, createStudent)\`. You can pass several or an array.
4. **Built-in** – shipped with Express: \`express.json()\` (parse JSON bodies), \`express.urlencoded({ extended: true })\` (parse HTML form bodies), \`express.static('public')\` (serve files), \`express.text()\`, \`express.raw()\`.
5. **Third-party** – installed from npm: \`morgan\` (HTTP request logging), \`cors\` (Cross-Origin Resource Sharing headers), \`helmet\` (security headers), \`cookie-parser\`, \`compression\`, \`express-rate-limit\`...
6. **Error-handling** – has FOUR parameters \`(err, req, res, next)\`. Covered fully on Day 14.`,
      syntax: `const express = require('express');
const morgan = require('morgan');   // npm i morgan
const cors = require('cors');       // npm i cors
const app = express();

app.use(morgan('dev'));                          // third-party
app.use(cors({ origin: 'http://localhost:5173' })); // third-party
app.use(express.json());                         // built-in
app.use(express.urlencoded({ extended: true })); // built-in
app.use(express.static('public'));               // built-in`,
    },
    {
      heading: 'Built-in body parsers and Express 5 changes',
      content: `\`express.json()\` reads the raw request stream, checks the \`Content-Type: application/json\` header, parses the JSON and puts the object in \`req.body\`. If the JSON is malformed it calls \`next(err)\` with a 400 error. \`express.urlencoded({ extended: true })\` does the same for HTML form posts (\`name=Asha&age=21\`).

**Express 5 differences you must know:**
- In Express 5, \`req.body\` is **undefined** (not \`{}\`) when no body parser ran or the content-type did not match. So write \`const { name } = req.body ?? {}\` or validate first.
- \`express.urlencoded()\` now defaults to \`extended: false\` – pass \`{ extended: true }\` if you want nested objects.
- \`req.query\` is a read-only getter: middleware cannot replace it (\`req.query = ...\` does nothing). Store cleaned values in a new property such as \`req.filters\` instead.
- If an \`async\` middleware throws or its promise rejects, Express 5 forwards the error to the error handler automatically (Express 4 needed try/catch + \`next(err)\`).`,
      tip: 'Body parsers only parse; they do not validate. Always check required fields yourself (or with a library like zod / express-validator, Day 24).',
    },
    {
      heading: 'Third-party middleware: morgan and cors',
      content: `**morgan** logs each request in one line – method, URL, status, response time. Formats: \`'dev'\` (coloured, for development), \`'tiny'\`, \`'combined'\` (Apache style, for production logs).

**cors** solves the classic error: *"Access to fetch at http://localhost:3000 from origin http://localhost:5173 has been blocked by CORS policy"*. Browsers block JavaScript from reading responses from a different **origin** (scheme + host + port) unless the server sends \`Access-Control-Allow-Origin\`. The \`cors\` middleware adds those headers and answers the browser's pre-flight \`OPTIONS\` request.

- \`app.use(cors())\` → allow every origin (fine for public APIs / learning).
- \`app.use(cors({ origin: ['https://myapp.com'], credentials: true }))\` → allow only your front-end, with cookies.

CORS is a **browser** rule. Postman, curl and server-to-server calls ignore it.`,
    },
    {
      heading: 'Writing good custom middleware (factory pattern)',
      content: `Often you want configurable middleware, e.g. "require role X". Write a function that **returns** a middleware – a *middleware factory*. This is exactly how \`express.json(options)\`, \`cors(options)\` and \`morgan('dev')\` work.

Good middleware is small, does one job, attaches data to \`req\` (e.g. \`req.user\`) or \`res.locals\` for later handlers, and either responds or calls \`next()\`.`,
      syntax: `function requireRole(role) {          // factory
  return (req, res, next) => {          // the real middleware
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

app.delete('/api/users/:id', requireRole('admin'), deleteUser);`,
      tip: 'Coming next (Day 12): the full Request and Response objects that every middleware receives.',
    },
  ],
  examples: [
    {
      title: 'Application-level logger and request counter',
      scenario: 'Log every request and give each request an id that the route can read.',
      steps: [
        'Create app.js and require express',
        'Register a middleware with app.use() at the top that increments a counter, sets req.requestId and logs method + URL',
        'Call next() so the request continues to the routes',
        'Add two routes that return req.requestId',
        'Run node app.js (or open the API Lab) and send the requests',
      ],
      code: `app.use((req, res, next) => {
  requestCount++;
  req.requestId = requestCount;
  console.log('#' + req.requestId, req.method, req.url);
  next();   // without this every request would hang
});`,
      api: {
        code: `const express = require('express');
const app = express();

let requestCount = 0;

// application-level middleware: runs for EVERY request
app.use((req, res, next) => {
  requestCount++;
  req.requestId = requestCount;
  console.log('#' + req.requestId, req.method, req.url);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Home', requestId: req.requestId });
});

app.get('/api/courses', (req, res) => {
  res.json({ courses: ['Node', 'Express'], requestId: req.requestId });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/' },
          { method: 'GET', url: '/api/courses' },
          { method: 'GET', url: '/' },
        ],
      },
      result: `GET / → 200 {"message":"Home","requestId":1}
GET /api/courses → 200 {"courses":["Node","Express"],"requestId":2}
GET / → 200 {"message":"Home","requestId":3}
Console: #1 GET / , #2 GET /api/courses , #3 GET /`,
      explanation: 'The middleware is registered first, so it runs before every route. It attaches requestId to req, which is the same object the route handler later receives. next() passes control down the stack.',
    },
    {
      title: 'Route-level authentication middleware (API key)',
      scenario: 'Protect only the /api/secret route: the client must send ?apiKey=abc123, otherwise 401.',
      steps: [
        'Write a function checkApiKey(req, res, next)',
        'Read req.query.apiKey; if it is wrong, return res.status(401).json(...)',
        'If it is correct attach req.client and call next()',
        'Pass checkApiKey as the second argument of app.get("/api/secret", ...)',
        'Send requests with no key, a wrong key and the right key',
      ],
      code: `function checkApiKey(req, res, next) {
  if (req.query.apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  req.client = 'trusted-client';
  next();
}
app.get('/api/secret', checkApiKey, handler);`,
      api: {
        code: `const express = require('express');
const app = express();

const API_KEY = 'abc123';

function checkApiKey(req, res, next) {
  if (req.query.apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  req.client = 'trusted-client';
  next();
}

app.get('/api/public', (req, res) => {
  res.json({ data: 'Anyone can see this' });
});

// route-level middleware: only this route is protected
app.get('/api/secret', checkApiKey, (req, res) => {
  res.json({ data: 'Top secret report', client: req.client });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/public' },
          { method: 'GET', url: '/api/secret' },
          { method: 'GET', url: '/api/secret?apiKey=wrong' },
          { method: 'GET', url: '/api/secret?apiKey=abc123' },
        ],
      },
      result: `GET /api/public → 200 {"data":"Anyone can see this"}
GET /api/secret → 401 {"error":"Invalid or missing API key"}
GET /api/secret?apiKey=wrong → 401 {"error":"Invalid or missing API key"}
GET /api/secret?apiKey=abc123 → 200 {"data":"Top secret report","client":"trusted-client"}`,
      explanation: 'checkApiKey is placed between the path and the final handler, so it only runs for /api/secret. When the key is wrong the middleware ends the cycle with 401 and the handler never runs. (Real apps send keys/tokens in headers, see Day 23.)',
    },
    {
      title: 'Router-level middleware for an admin area',
      scenario: 'Every route under /admin must check that the user is an admin. Instead of repeating the check, put it on the router.',
      steps: [
        'Create const adminRouter = express.Router()',
        'Call adminRouter.use(isAdmin) – it runs for every route in this router',
        'Add adminRouter.get("/stats") and adminRouter.get("/users")',
        'Mount it with app.use("/admin", adminRouter)',
        'Send requests with ?role=admin and ?role=student',
      ],
      code: `const adminRouter = express.Router();
adminRouter.use((req, res, next) => {
  if (req.query.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' });
  }
  next();
});
app.use('/admin', adminRouter);`,
      api: {
        code: `const express = require('express');
const app = express();

const adminRouter = express.Router();

// router-level middleware: runs for every /admin/* route
adminRouter.use((req, res, next) => {
  if (req.query.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' });
  }
  next();
});

adminRouter.get('/stats', (req, res) => {
  res.json({ students: 120, courses: 8 });
});

adminRouter.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Asha' }, { id: 2, name: 'Ravi' }]);
});

app.use('/admin', adminRouter);

app.get('/home', (req, res) => res.send('Public home page'));

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/home' },
          { method: 'GET', url: '/admin/stats?role=student' },
          { method: 'GET', url: '/admin/stats?role=admin' },
          { method: 'GET', url: '/admin/users?role=admin' },
        ],
      },
      result: `GET /home → 200 Public home page
GET /admin/stats?role=student → 403 {"error":"Admins only"}
GET /admin/stats?role=admin → 200 {"students":120,"courses":8}
GET /admin/users?role=admin → 200 [{"id":1,"name":"Asha"},{"id":2,"name":"Ravi"}]`,
      explanation: 'adminRouter.use() applies only inside the router, so /home is not affected. The router is mounted at /admin, so /admin/stats reaches adminRouter as /stats.',
    },
    {
      title: 'Built-in express.json() + validation middleware chain',
      scenario: 'Create students only when the body has a name of at least 2 characters and a numeric age.',
      steps: [
        'Register app.use(express.json()) before the routes',
        'Write validateStudent middleware that checks req.body (remember: req.body can be undefined in Express 5)',
        'On failure respond 400 with a list of errors',
        'On success call next(); the final handler pushes the student and returns 201',
        'Send one valid and two invalid POST requests',
      ],
      code: `function validateStudent(req, res, next) {
  const { name, age } = req.body ?? {};
  const errors = [];
  if (typeof name !== 'string' || name.trim().length < 2) errors.push('name must have at least 2 characters');
  if (typeof age !== 'number') errors.push('age must be a number');
  if (errors.length) return res.status(400).json({ errors });
  next();
}
app.post('/api/students', validateStudent, createStudent);`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json()); // built-in body parser

const students = [{ id: 1, name: 'Asha', age: 21 }];

function validateStudent(req, res, next) {
  const { name, age } = req.body ?? {};
  const errors = [];
  if (typeof name !== 'string' || name.trim().length < 2) errors.push('name must have at least 2 characters');
  if (typeof age !== 'number') errors.push('age must be a number');
  if (errors.length) return res.status(400).json({ errors });
  next();
}

app.post('/api/students', validateStudent, (req, res) => {
  const student = { id: students.length + 1, name: req.body.name.trim(), age: req.body.age };
  students.push(student);
  res.status(201).json(student);
});

app.get('/api/students', (req, res) => res.json(students));

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/students', body: { name: 'R' } },
          { method: 'POST', url: '/api/students', body: { name: 'Ravi', age: '22' } },
          { method: 'POST', url: '/api/students', body: { name: 'Ravi', age: 22 } },
          { method: 'GET', url: '/api/students' },
        ],
      },
      result: `POST /api/students → 400 {"errors":["name must have at least 2 characters","age must be a number"]}
POST /api/students → 400 {"errors":["age must be a number"]}
POST /api/students → 201 {"id":2,"name":"Ravi","age":22}
GET /api/students → 200 [{"id":1,"name":"Asha","age":21},{"id":2,"name":"Ravi","age":22}]`,
      explanation: 'express.json() turns the JSON text into req.body. validateStudent runs next and blocks bad data with 400, so the handler only ever sees clean input. "22" (string) fails the number check – JSON types matter.',
    },
    {
      title: 'Third-party middleware: morgan + cors (run locally)',
      scenario: 'A React app on http://localhost:5173 calls your API on port 3000. You want request logs and must fix the CORS error.',
      steps: [
        'mkdir mw-demo && cd mw-demo && npm init -y',
        'npm install express morgan cors',
        'Create app.js with the code below',
        'node app.js, then open http://localhost:3000/api/health',
        'Watch the terminal: morgan prints "GET /api/health 200 3.123 ms - 15"',
        'From the browser console of a page on localhost:5173 run fetch("http://localhost:3000/api/health") – it now works because of the Access-Control-Allow-Origin header',
      ],
      code: `const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(morgan('dev'));                                   // 1. log every request
app.use(cors({ origin: 'http://localhost:5173' }));       // 2. allow the React dev server
app.use(express.json());                                  // 3. parse JSON bodies

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      result: `Terminal: GET /api/health 200 2.481 ms - 15
Response headers include: Access-Control-Allow-Origin: http://localhost:5173
Body: {"status":"ok"}`,
      explanation: 'morgan and cors are just functions that return (req, res, next) middleware, exactly like the ones you wrote. They are not available in the in-browser API Lab (only express is), so run this one with real Node.',
    },
  ],
  interview: [
    { q: 'What is middleware in Express?', a: 'A function with signature (req, res, next) that runs during the request–response cycle. It can read/modify req and res, end the response, or call next() to pass control to the next middleware or route handler.', level: 'Easy' },
    { q: 'What happens if a middleware neither sends a response nor calls next()?', a: 'The request hangs: the client waits until it times out because the cycle never finishes. Every middleware must either respond or call next().', level: 'Easy' },
    { q: 'Difference between app.use() and app.get()?', a: 'app.use(path, fn) matches all HTTP methods and every path that starts with path (prefix match); it is used for middleware and mounting routers. app.get(path, fn) matches only GET requests whose path matches exactly (with params).', level: 'Medium' },
    { q: 'Name the types of middleware.', a: 'Application-level (app.use), router-level (router.use), route-level/inline, built-in (express.json, express.urlencoded, express.static), third-party (morgan, cors, helmet), and error-handling middleware with four arguments (err, req, res, next).', level: 'Easy' },
    { q: 'Why does order of middleware matter? Give an example.', a: 'Express runs middleware in registration order. If express.json() is registered after a POST route, req.body is undefined in that route. A 404 handler placed before routes would catch every request.', level: 'Medium' },
    { q: 'What does next("route") do?', a: 'Inside a handler registered with app.METHOD/router.METHOD it skips the remaining callbacks of the current route and moves to the next matching route. next(err) with any other value goes to error middleware.', level: 'Hard' },
    { q: 'What is CORS and how does the cors package help?', a: 'Cross-Origin Resource Sharing is a browser security rule that blocks JS from reading responses from another origin unless the server allows it with Access-Control-Allow-* headers. The cors middleware adds these headers and responds to pre-flight OPTIONS requests.', level: 'Medium' },
    { q: 'What is morgan used for?', a: 'HTTP request logging. It logs method, URL, status, response time and size in a chosen format (dev, tiny, combined) or to a stream such as a log file.', level: 'Easy' },
    { q: 'How do you pass data from one middleware to another?', a: 'Attach it to req (e.g. req.user = decoded) or to res.locals (e.g. res.locals.user, also visible to templates). Later middleware in the same request read it from there.', level: 'Medium' },
    { q: 'What is a middleware factory?', a: 'A function that takes options and returns a middleware, e.g. requireRole("admin") or cors({ origin }). It lets you configure reusable middleware.', level: 'Medium' },
    { q: 'What changed for middleware in Express 5?', a: 'Rejected promises / thrown errors in async middleware are forwarded to error handlers automatically; req.body is undefined when no parser ran; req.query is a read-only getter; express.urlencoded defaults to extended:false; path patterns use the new path-to-regexp syntax (/*splat).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a middleware that adds an X-Powered-By-Course header with value "Node Day 11" to every response.',
      hint: 'Use res.set(name, value) and then next().',
      solution: `app.use((req, res, next) => {
  res.set('X-Powered-By-Course', 'Node Day 11');
  next();
});`,
    },
    {
      task: 'Create a "maintenance mode" middleware: when the variable MAINTENANCE is true, every request gets 503 {"error":"Under maintenance"}, except GET /health.',
      hint: 'Check req.path inside the middleware and register it first.',
      solution: `const MAINTENANCE = true;
app.use((req, res, next) => {
  if (MAINTENANCE && req.path !== '/health') {
    return res.status(503).json({ error: 'Under maintenance' });
  }
  next();
});
app.get('/health', (req, res) => res.json({ ok: true }));`,
    },
    {
      task: 'Write a middleware factory requireFields(...fields) that returns 400 listing missing fields in req.body.',
      hint: 'Return a (req, res, next) function; remember req.body may be undefined.',
      solution: `function requireFields(...fields) {
  return (req, res, next) => {
    const body = req.body ?? {};
    const missing = fields.filter(f => body[f] === undefined || body[f] === '');
    if (missing.length) return res.status(400).json({ error: 'Missing fields', missing });
    next();
  };
}
app.post('/api/products', requireFields('name', 'price'), (req, res) => {
  res.status(201).json(req.body);
});`,
    },
    {
      task: 'Write a timing middleware that logs how long each request took (method, url, status, ms).',
      hint: 'Record process.hrtime.bigint() at the start and listen to res.on("finish").',
      solution: `app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(req.method, req.originalUrl, res.statusCode, ms.toFixed(1) + 'ms');
  });
  next();
});`,
    },
    {
      task: 'Set up morgan to write "combined" logs to a file access.log and cors to allow only https://myshop.com.',
      hint: 'morgan accepts { stream } – create it with fs.createWriteStream with flags "a".',
      solution: `const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const accessLog = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLog }));
app.use(cors({ origin: 'https://myshop.com' }));`,
    },
  ],
  quiz: [
    { question: 'What are the three parameters of a normal Express middleware?', options: ['(req, res, next)', '(err, req, res)', '(request, response)', '(app, req, res)'], answer: 0, explanation: 'Normal middleware receives req, res and next. Error middleware adds err as the first of four.' },
    { question: 'You call app.use(express.json()) AFTER your POST route. What is req.body inside that route in Express 5?', options: ['An empty object {}', 'A string', 'undefined', 'The parsed JSON'], answer: 2, explanation: 'The parser has not run yet, and in Express 5 req.body stays undefined when no parser handled the request.' },
    { question: 'Which package fixes "blocked by CORS policy" errors in the browser?', options: ['morgan', 'helmet', 'body-parser', 'cors'], answer: 3, explanation: 'cors adds Access-Control-Allow-Origin and related headers.' },
    { question: 'app.use("/api", fn) will run fn for which request?', options: ['Only GET /api', 'POST /api/users', 'Only exact path /api', 'GET /home'], answer: 1, explanation: 'app.use matches any method and any path that starts with /api.' },
    { question: 'A middleware that stops a bad request should usually be written as…', options: ['next(); res.status(400).json(...)', 'return res.status(400).json(...)', 'res.status(400); next()', 'throw 400'], answer: 1, explanation: 'Respond and return so that next() is not also called.' },
  ],
};
