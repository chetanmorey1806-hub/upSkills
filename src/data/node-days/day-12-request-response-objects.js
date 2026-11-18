export default {
  id: 'day-12-request-response-objects',
  title: 'Request and Response Objects, HTTP Status Codes and JSON APIs',
  module: 'Module 2: Express.js',
  day: 12,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Every handler receives req (what the client sent) and res (what you send back). Today you master their most useful properties and methods, pick the right HTTP status code every time, and design clean, consistent JSON responses.',
  objectives: [
    'Read data from req.params, req.query, req.body, req.headers, req.method, req.path and req.get()',
    'Send responses with res.status(), res.json(), res.send(), res.sendStatus(), res.end() and res.set()',
    'Choose correct HTTP status codes (2xx, 3xx, 4xx, 5xx) for every situation',
    'Design a consistent JSON response format for an API',
    'Know the Express 5 removals: res.json(obj, status), res.send(status), req.param(), redirect("back")',
  ],
  theory: [
    {
      heading: 'The request object (req): the letter you received',
      content: `Think of an HTTP request as a **letter**: the envelope has the address (URL), the delivery type (method) and stamps/labels (headers); inside is the content (body). Express parses all of it into the \`req\` object.

- \`req.method\` – \`'GET'\`, \`'POST'\`, \`'PUT'\`, \`'PATCH'\`, \`'DELETE'\`
- \`req.url\` – path + query as seen by the current router (\`/students?page=2\`); \`req.originalUrl\` – the full original URL even inside mounted routers
- \`req.path\` – only the path part (\`/students\`)
- \`req.params\` – **route parameters** from \`/students/:id\` → \`{ id: '7' }\` (always strings!)
- \`req.query\` – **query string** \`?page=2&sort=name\` → \`{ page: '2', sort: 'name' }\` (strings; read-only in Express 5)
- \`req.body\` – the parsed body (needs \`express.json()\` / \`express.urlencoded()\`; \`undefined\` otherwise in Express 5)
- \`req.headers\` – all headers, **lower-cased** keys: \`req.headers['content-type']\`
- \`req.get('Authorization')\` – case-insensitive header lookup
- \`req.ip\`, \`req.hostname\`, \`req.protocol\`, \`req.secure\`, \`req.cookies\` (with cookie-parser)`,
      tip: 'params and query values are ALWAYS strings. Convert them: `Number(req.params.id)`, and check `Number.isInteger(id)` before using them.',
    },
    {
      heading: 'The response object (res): the reply you send',
      content: `\`res\` builds the HTTP response. Most methods are **chainable**: \`res.status(201).json(data)\`.

- \`res.status(code)\` – set the status code (does NOT send anything yet)
- \`res.json(value)\` – send JSON (sets \`Content-Type: application/json\`)
- \`res.send(value)\` – string → \`text/html\`; object/array → JSON; Buffer → binary
- \`res.sendStatus(code)\` – set status AND send its text (\`res.sendStatus(404)\` → body \`Not Found\`)
- \`res.end()\` – finish without a body (common with 204)
- \`res.set(name, value)\` / \`res.set({ ... })\` – set headers; \`res.get(name)\` reads one
- \`res.redirect([status,] url)\` – 302 redirect by default
- \`res.cookie(name, value, options)\`, \`res.clearCookie(name)\`
- \`res.sendFile(absPath)\`, \`res.download(absPath)\` – send files
- \`res.render(view, data)\` – template engines (Day 15)
- \`res.locals\` – data for the current request only (shared with templates)

**Rule:** send exactly ONE response per request. A second \`res.json()\` throws *"Cannot set headers after they are sent to the client"*.`,
      syntax: `res.status(201).json({ id: 5, name: 'Asha' });
res.set('Location', '/api/students/5');
res.sendStatus(204);              // No Content
res.status(404).json({ error: 'Not found' });`,
    },
    {
      heading: 'HTTP status codes you must know',
      content: `Status codes are the **traffic signals** of an API: the client reads them before it even looks at the body.

- **2xx Success**: \`200 OK\` (read/update succeeded), \`201 Created\` (new resource; often with a \`Location\` header), \`204 No Content\` (success, no body – typical for DELETE)
- **3xx Redirection**: \`301 Moved Permanently\`, \`302 Found\` (temporary), \`304 Not Modified\` (cache is still valid)
- **4xx Client error** (the client must fix something): \`400 Bad Request\` (invalid input), \`401 Unauthorized\` (not logged in / bad token), \`403 Forbidden\` (logged in but not allowed), \`404 Not Found\`, \`405 Method Not Allowed\`, \`409 Conflict\` (duplicate email), \`422 Unprocessable Entity\` (validation failed – some APIs use this instead of 400), \`429 Too Many Requests\` (rate limit)
- **5xx Server error** (your bug or a dependency is down): \`500 Internal Server Error\`, \`502 Bad Gateway\`, \`503 Service Unavailable\`

Memory trick: 2 = "you got it", 3 = "go elsewhere", 4 = "you messed up", 5 = "we messed up".`,
      tip: 'Never return 200 with { error: "..." } in the body. Clients, monitoring tools and fetch libraries rely on the status code.',
    },
    {
      heading: 'Designing consistent JSON APIs',
      content: `A good API is **predictable**. Pick a response shape and use it everywhere. Two popular styles:

1. **Plain resources** – success returns the resource or array directly; errors return \`{ "error": "message" }\`. Simple, used by GitHub-style APIs.
2. **Envelope** – every response is \`{ "success": true, "data": ..., "message": ... }\` or \`{ "success": false, "error": { "code": ..., "message": ... } }\`. Handy for front-ends that want one parser.

Other good habits:
- Use JSON for both requests and responses; send \`Content-Type: application/json\`.
- Use **nouns** for URLs (\`/api/students\`), HTTP methods for actions.
- Return the created/updated object after POST/PUT/PATCH so the client need not re-fetch.
- Include pagination metadata for lists (Day 21).
- Never leak stack traces or passwords in responses.`,
    },
    {
      heading: 'Express 5 changes to req and res',
      content: `Express 5 removed several old signatures. Code from older tutorials may break:

- \`res.json(obj, 201)\` / \`res.send(201)\` / \`res.send(obj, 201)\` → removed. Use \`res.status(201).json(obj)\` and \`res.sendStatus(201)\`.
- \`res.redirect('back')\` and \`res.location('back')\` → removed. Use \`res.redirect(req.get('Referrer') || '/')\`.
- \`res.redirect(url, 301)\` → use \`res.redirect(301, url)\`.
- \`req.param('name')\` → removed. Use \`req.params\`, \`req.body\` or \`req.query\` explicitly.
- \`res.status()\` only accepts integer codes 100–999; anything else throws.
- \`req.query\` is a getter; you cannot reassign it.
- \`req.body\` is \`undefined\` when no parser ran.`,
    },
  ],
  examples: [
    {
      title: 'Inspecting everything the client sent',
      scenario: 'Build an "echo" endpoint that shows the method, path, params, query and body, so you can see how Express parses a request.',
      steps: [
        'Register express.json() so req.body is filled',
        'Create app.all("/api/echo/:category/:id", ...) to accept every method',
        'Return req.method, req.path, req.params, req.query and req.body ?? null',
        'Send a GET with a query string and a POST with a JSON body',
        'Notice that params and query values are strings',
      ],
      code: `app.all('/api/echo/:category/:id', (req, res) => {
  res.json({
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body ?? null,
    idType: typeof req.params.id,
  });
});`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

app.all('/api/echo/:category/:id', (req, res) => {
  res.json({
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body ?? null,
    idType: typeof req.params.id,
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/echo/books/42?sort=price&page=2' },
          { method: 'POST', url: '/api/echo/students/7', body: { name: 'Asha', marks: 91 } },
        ],
      },
      result: `GET /api/echo/books/42?sort=price&page=2 → 200 {"method":"GET","path":"/api/echo/books/42","params":{"category":"books","id":"42"},"query":{"sort":"price","page":"2"},"body":null,"idType":"string"}
POST /api/echo/students/7 → 200 {"method":"POST","path":"/api/echo/students/7","params":{"category":"students","id":"7"},"query":{},"body":{"name":"Asha","marks":91},"idType":"string"}`,
      explanation: 'The GET has no body, so in Express 5 req.body is undefined and we print null. "42" and "2" are strings – always convert numbers yourself. The JSON body keeps its real types (marks is a number).',
    },
    {
      title: 'Choosing the right status code',
      scenario: 'A small products API that returns 200, 201, 204, 400, 404 and 409 in the right situations.',
      steps: [
        'Keep products in an array',
        'GET /api/products/:id → 200 or 404 (and 400 if id is not a number)',
        'POST /api/products → 400 for bad input, 409 if the SKU already exists, 201 + Location header when created',
        'DELETE /api/products/:id → 204 with no body, or 404',
        'Send the request sequence and read each status code',
      ],
      code: `if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be a number' });
if (!product) return res.status(404).json({ error: 'Product not found' });
if (exists)   return res.status(409).json({ error: 'SKU already exists' });
res.status(201).set('Location', '/api/products/' + product.id).json(product);
res.sendStatus(204);`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

let nextId = 3;
let products = [
  { id: 1, sku: 'PEN-01', name: 'Blue Pen', price: 10 },
  { id: 2, sku: 'NB-01', name: 'Notebook', price: 45 },
];

app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be a number' });
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.status(200).json(product);
});

app.post('/api/products', (req, res) => {
  const { sku, name, price } = req.body ?? {};
  if (!sku || !name || typeof price !== 'number') {
    return res.status(400).json({ error: 'sku, name and numeric price are required' });
  }
  if (products.some(p => p.sku === sku)) {
    return res.status(409).json({ error: 'SKU already exists' });
  }
  const product = { id: nextId++, sku, name, price };
  products.push(product);
  res.status(201).set('Location', '/api/products/' + product.id).json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const before = products.length;
  products = products.filter(p => p.id !== id);
  if (products.length === before) return res.status(404).json({ error: 'Product not found' });
  res.sendStatus(204);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/products/1' },
          { method: 'GET', url: '/api/products/abc' },
          { method: 'GET', url: '/api/products/99' },
          { method: 'POST', url: '/api/products', body: { sku: 'PEN-01', name: 'Red Pen', price: 12 } },
          { method: 'POST', url: '/api/products', body: { name: 'Eraser' } },
          { method: 'POST', url: '/api/products', body: { sku: 'ER-01', name: 'Eraser', price: 5 } },
          { method: 'DELETE', url: '/api/products/2' },
          { method: 'DELETE', url: '/api/products/2' },
        ],
      },
      result: `GET /api/products/1 → 200 {"id":1,"sku":"PEN-01","name":"Blue Pen","price":10}
GET /api/products/abc → 400 {"error":"id must be a number"}
GET /api/products/99 → 404 {"error":"Product not found"}
POST /api/products → 409 {"error":"SKU already exists"}
POST /api/products → 400 {"error":"sku, name and numeric price are required"}
POST /api/products → 201 {"id":3,"sku":"ER-01","name":"Eraser","price":5}
DELETE /api/products/2 → 204
DELETE /api/products/2 → 404 {"error":"Product not found"}`,
      explanation: 'Each branch returns early with the code that describes the situation. 204 has no body, so sendStatus(204) is perfect. The 201 response also carries a Location header pointing at the new product.',
    },
    {
      title: 'res.send vs res.json vs res.sendStatus vs res.end',
      scenario: 'See exactly what each response method puts on the wire.',
      steps: [
        'Create one route per response method',
        'Call each route and compare the body and status',
        'Note that res.send with an object behaves like res.json',
        'Note that res.sendStatus writes the status text as the body',
      ],
      code: `app.get('/text',   (req, res) => res.send('<h1>Hello</h1>'));
app.get('/object', (req, res) => res.send({ ok: true }));
app.get('/json',   (req, res) => res.json([1, 2, 3]));
app.get('/status', (req, res) => res.sendStatus(404));
app.get('/empty',  (req, res) => res.status(204).end());`,
      api: {
        code: `const express = require('express');
const app = express();

app.get('/text', (req, res) => res.send('<h1>Hello</h1>'));          // text/html
app.get('/object', (req, res) => res.send({ ok: true }));            // object -> JSON
app.get('/json', (req, res) => res.json([1, 2, 3]));                 // application/json
app.get('/null', (req, res) => res.json(null));                      // valid JSON: null
app.get('/status', (req, res) => res.sendStatus(404));               // body = "Not Found"
app.get('/teapot', (req, res) => res.status(418).send("I'm a teapot"));
app.get('/empty', (req, res) => res.status(204).end());              // no body

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/text' },
          { method: 'GET', url: '/object' },
          { method: 'GET', url: '/json' },
          { method: 'GET', url: '/null' },
          { method: 'GET', url: '/status' },
          { method: 'GET', url: '/teapot' },
          { method: 'GET', url: '/empty' },
        ],
      },
      result: `GET /text → 200 <h1>Hello</h1>
GET /object → 200 {"ok":true}
GET /json → 200 [1,2,3]
GET /null → 200 null
GET /status → 404 Not Found
GET /teapot → 418 I'm a teapot
GET /empty → 204`,
      explanation: 'Prefer res.json() in APIs: it always sends JSON (even for null, numbers or strings) and sets the right Content-Type. res.send() guesses by type; res.sendStatus() is a shortcut for status + status text.',
    },
    {
      title: 'A consistent response envelope with helper functions',
      scenario: 'The front-end team wants every response to look like { success, data } or { success, error }.',
      steps: [
        'Write ok(res, data, status) and fail(res, status, message) helpers',
        'Use them in all routes instead of calling res.json directly',
        'Add a search route that reads req.query.q (with a default)',
        'Send success and failure requests and compare the shapes',
      ],
      code: `const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, status, message) => res.status(status).json({ success: false, error: { status, message } });`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, status, message) => res.status(status).json({ success: false, error: { status, message } });

const courses = [
  { id: 1, title: 'Node.js Basics', level: 'Beginner' },
  { id: 2, title: 'Express Deep Dive', level: 'Intermediate' },
  { id: 3, title: 'Node Performance', level: 'Advanced' },
];

app.get('/api/courses', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const result = courses.filter(c => c.title.toLowerCase().includes(q));
  ok(res, { count: result.length, items: result });
});

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === Number(req.params.id));
  if (!course) return fail(res, 404, 'Course not found');
  ok(res, course);
});

app.post('/api/courses', (req, res) => {
  const { title, level } = req.body ?? {};
  if (!title) return fail(res, 400, 'title is required');
  const course = { id: courses.length + 1, title, level: level || 'Beginner' };
  courses.push(course);
  ok(res, course, 201);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/courses?q=node' },
          { method: 'GET', url: '/api/courses/2' },
          { method: 'GET', url: '/api/courses/9' },
          { method: 'POST', url: '/api/courses', body: { level: 'Advanced' } },
          { method: 'POST', url: '/api/courses', body: { title: 'REST APIs' } },
        ],
      },
      result: `GET /api/courses?q=node → 200 {"success":true,"data":{"count":2,"items":[{"id":1,"title":"Node.js Basics","level":"Beginner"},{"id":3,"title":"Node Performance","level":"Advanced"}]}}
GET /api/courses/2 → 200 {"success":true,"data":{"id":2,"title":"Express Deep Dive","level":"Intermediate"}}
GET /api/courses/9 → 404 {"success":false,"error":{"status":404,"message":"Course not found"}}
POST /api/courses → 400 {"success":false,"error":{"status":400,"message":"title is required"}}
POST /api/courses → 201 {"success":true,"data":{"id":4,"title":"REST APIs","level":"Beginner"}}`,
      explanation: 'Helpers guarantee the same shape everywhere and keep handlers short. The status code still carries the meaning; the envelope only adds convenience for clients.',
    },
    {
      title: 'Headers, redirects, cookies and files (run locally)',
      scenario: 'Response features that need a real server and browser: redirect, cookies, sendFile and download.',
      steps: [
        'npm install express cookie-parser',
        'Create app.js with the code below and a file files/report.pdf',
        'Visit /old-docs → the browser lands on /docs (301)',
        'Visit /login-demo then /whoami → the cookie is sent back',
        'Visit /report → PDF opens inline; /report/download → browser downloads it',
      ],
      code: `const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

app.get('/old-docs', (req, res) => res.redirect(301, '/docs'));
app.get('/docs', (req, res) => res.send('Docs page'));

app.get('/login-demo', (req, res) => {
  res.cookie('theme', 'dark', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax' });
  res.json({ message: 'cookie set' });
});
app.get('/whoami', (req, res) => {
  res.json({ theme: req.cookies.theme ?? 'none', userAgent: req.get('User-Agent') });
});

app.get('/report', (req, res) => res.sendFile(path.join(__dirname, 'files', 'report.pdf')));
app.get('/report/download', (req, res) => res.download(path.join(__dirname, 'files', 'report.pdf'), 'Monthly-Report.pdf'));

// Express 5: res.redirect('back') was removed
app.post('/go-back', (req, res) => res.redirect(req.get('Referrer') || '/'));

app.listen(3000, () => console.log('Server running on port 3000'));`,
      result: `GET /old-docs → 301 Location: /docs, browser shows "Docs page"
GET /login-demo → Set-Cookie: theme=dark; Max-Age=86400; Path=/; Expires=...; HttpOnly; SameSite=Lax
GET /whoami → {"theme":"dark","userAgent":"Mozilla/5.0 ..."}`,
      explanation: 'sendFile needs an absolute path (path.join(__dirname, ...)). res.download sets Content-Disposition: attachment. cookie-parser fills req.cookies. These features use the file system/browser, so they are shown as real code rather than API Lab demos.',
    },
  ],
  interview: [
    { q: 'Difference between req.params, req.query and req.body?', a: 'req.params holds named route segments (/users/:id → { id }); req.query holds the query string (?page=2); req.body holds the parsed request body (JSON/form) and needs a body-parsing middleware. params and query values are strings.', level: 'Easy' },
    { q: 'Difference between res.send() and res.json()?', a: 'res.json() always serialises the value with JSON.stringify and sets application/json (even for null or numbers). res.send() inspects the type: strings become text/html, Buffers binary, objects/arrays JSON.', level: 'Easy' },
    { q: 'When do you use 401 vs 403?', a: '401 Unauthorized means the client is not authenticated (missing/invalid credentials). 403 Forbidden means the client is authenticated but does not have permission for this resource.', level: 'Medium' },
    { q: 'What status code should POST return when it creates a resource?', a: '201 Created, ideally with a Location header pointing to the new resource and the created object in the body.', level: 'Easy' },
    { q: 'What does 204 No Content mean and when is it used?', a: 'The request succeeded and there is intentionally no body. Commonly used for DELETE or for PUT when the client does not need the updated object.', level: 'Easy' },
    { q: 'What causes "Cannot set headers after they are sent to the client"?', a: 'Sending two responses for one request, e.g. calling res.json() and then res.send(), or responding in middleware and still calling next(). Use return when you respond early.', level: 'Medium' },
    { q: 'What is res.locals?', a: 'An object scoped to a single request/response used to pass data between middleware and to template views (res.render automatically exposes res.locals).', level: 'Medium' },
    { q: 'What is the difference between 400 and 422?', a: 'Both are client errors. 400 Bad Request is a general "malformed/invalid request"; 422 Unprocessable Entity specifically means the syntax was fine but the data failed validation. Many APIs use 400 for both; consistency matters most.', level: 'Medium' },
    { q: 'Which Express 4 response signatures were removed in Express 5?', a: 'res.json(obj, status), res.send(status), res.send(obj, status), res.redirect(url, status), res.redirect("back"), and req.param(). Use res.status(code).json(), res.sendStatus(), res.redirect(status, url), and explicit req.params/query/body.', level: 'Hard' },
    { q: 'Why are header names lowercase in req.headers?', a: 'HTTP header names are case-insensitive; Node normalises them to lowercase. Use req.headers["content-type"] or the case-insensitive helper req.get("Content-Type").', level: 'Medium' },
    { q: 'How do you send a file in Express?', a: 'res.sendFile(absolutePath) streams the file with the right Content-Type; res.download(absolutePath, filename) also sets Content-Disposition: attachment so the browser downloads it.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create GET /api/info that returns { method, path, browser } where browser is the User-Agent header or "unknown".',
      hint: 'req.get("User-Agent").',
      solution: `app.get('/api/info', (req, res) => {
  res.json({ method: req.method, path: req.path, browser: req.get('User-Agent') || 'unknown' });
});`,
    },
    {
      task: 'GET /api/square/:n returns { n, square }. Return 400 if n is not an integer.',
      hint: 'Number(req.params.n) and Number.isInteger.',
      solution: `app.get('/api/square/:n', (req, res) => {
  const n = Number(req.params.n);
  if (!Number.isInteger(n)) return res.status(400).json({ error: 'n must be an integer' });
  res.json({ n, square: n * n });
});`,
    },
    {
      task: 'POST /api/register with { email } returns 409 if the email is already in a users array (case-insensitive), else 201 with the new user.',
      hint: 'Normalise with toLowerCase() before comparing.',
      solution: `const users = [{ id: 1, email: 'asha@mail.com' }];
app.post('/api/register', (req, res) => {
  const email = (req.body?.email || '').toLowerCase().trim();
  if (!email) return res.status(400).json({ error: 'email is required' });
  if (users.some(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
  const user = { id: users.length + 1, email };
  users.push(user);
  res.status(201).json(user);
});`,
    },
    {
      task: 'Add a 405 Method Not Allowed response for any method other than GET on /api/time-table.',
      hint: 'Register app.get first, then app.all for the same path; set the Allow header.',
      solution: `app.get('/api/time-table', (req, res) => res.json(['Mon: Node', 'Tue: Express']));
app.all('/api/time-table', (req, res) => {
  res.set('Allow', 'GET').status(405).json({ error: 'Method Not Allowed' });
});`,
    },
    {
      task: 'Write a sendPaged(res, items, page, limit) helper that returns { page, limit, total, data } and use it in GET /api/numbers (1..50).',
      hint: 'slice((page-1)*limit, page*limit). Default page 1, limit 10.',
      solution: `const numbers = Array.from({ length: 50 }, (_, i) => i + 1);
function sendPaged(res, items, page, limit) {
  const data = items.slice((page - 1) * limit, page * limit);
  res.json({ page, limit, total: items.length, data });
}
app.get('/api/numbers', (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);
  sendPaged(res, numbers, page, limit);
});`,
    },
  ],
  quiz: [
    { question: 'For GET /users/15?tab=posts with route /users/:id, what is req.params.id?', options: ['15 (number)', '"posts"', '"15" (string)', 'undefined'], answer: 2, explanation: 'Route params are always strings.' },
    { question: 'Which status code fits "email already registered"?', options: ['400', '404', '500', '409'], answer: 3, explanation: '409 Conflict signals a clash with the current state of the resource.' },
    { question: 'What does res.sendStatus(403) send as the body?', options: ['Forbidden', 'Nothing', '{"status":403}', '403'], answer: 0, explanation: 'sendStatus sets the code and sends the standard status text.' },
    { question: 'Which is valid in Express 5?', options: ['res.json({ ok: true }, 201)', 'res.status(201).json({ ok: true })', 'res.send(201)', 'res.redirect("back")'], answer: 1, explanation: 'The others were removed in Express 5.' },
    { question: 'A logged-in student tries to open an admin-only route. Best status?', options: ['401', '404', '403', '400'], answer: 2, explanation: 'Authenticated but not permitted = 403 Forbidden.' },
  ],
};
