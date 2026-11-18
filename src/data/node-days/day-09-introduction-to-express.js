const HELLO_APP = "const express = require('express');\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\n// Route: method + path + handler\napp.get('/', (req, res) => {\n  res.send('Hello from Express 5!');\n});\n\napp.get('/api/status', (req, res) => {\n  res.json({ status: 'ok', framework: 'express', version: 5 });\n});\n\napp.get('/about', (req, res) => {\n  res.send('<h1>About us</h1><p>We teach Node.js</p>');\n});\n\n// Catch-all 404 (must be registered AFTER all routes)\napp.use((req, res) => {\n  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));";

const RESPONSES_APP = "const express = require('express');\nconst app = express();\n\napp.get('/text', (req, res) => res.send('plain words'));                  // string -> text/html\napp.get('/object', (req, res) => res.send({ sentAs: 'json' }));            // object -> JSON\napp.get('/json', (req, res) => res.json({ ok: true, items: [1, 2, 3] }));  // explicit JSON\napp.get('/created', (req, res) => res.status(201).json({ id: 7 }));       // status + JSON\napp.get('/empty', (req, res) => res.sendStatus(204));                     // status only\napp.get('/csv', (req, res) => {\n  res.set('Content-Type', 'text/csv');                                      // custom header\n  res.send('name,marks,city');\n});\napp.get('/teapot', (req, res) => res.status(418).send(\"I'm a teapot\"));\n\napp.listen(3000, () => console.log('Server running on port 3000'));";

const STUDENTS_APP = "const express = require('express');\nconst app = express();\napp.use(express.json()); // parse JSON request bodies into req.body\n\nconst students = [\n  { id: 1, name: 'Asha', course: 'Node.js' },\n  { id: 2, name: 'Ravi', course: 'React' },\n];\nlet nextId = 3;\n\napp.get('/api/students', (req, res) => {\n  res.json(students);\n});\n\napp.post('/api/students', (req, res) => {\n  const { name, course } = req.body ?? {};\n  if (!name || !course) {\n    return res.status(400).json({ error: 'name and course are required' });\n  }\n  const student = { id: nextId++, name, course };\n  students.push(student);\n  res.status(201).json(student);\n});\n\napp.get('/api/students/count', (req, res) => {\n  res.json({ total: students.length });\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));";

const EXPRESS5_APP = "const express = require('express');\nconst app = express();\n\nconst docs = { intro: 'Welcome to the docs', install: 'npm install express' };\n\n// Express 5: async handlers - a rejected promise goes to the error handler automatically\napp.get('/api/docs/:section', async (req, res) => {\n  const text = await Promise.resolve(docs[req.params.section]); // pretend DB call\n  if (!text) throw new Error(`No section ${req.params.section}`);\n  res.json({ section: req.params.section, text });\n});\n\n// Express 5: named wildcard (Express 4 used just *)\napp.get('/files/*filepath', (req, res) => {\n  res.json({ segments: req.params.filepath, joined: req.params.filepath.join('/') });\n});\n\n// Express 5: optional part in braces (Express 4 used :format?)\napp.get('/report{.:format}', (req, res) => {\n  res.json({ format: req.params.format ?? 'html' });\n});\n\n// error-handling middleware (4 arguments) - covered fully on Day 14\napp.use((err, req, res, next) => {\n  res.status(404).json({ error: err.message });\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));";

export default {
  id: 'day-09-introduction-to-express',
  title: 'Introduction to Express: First Server, Responses, nodemon and node --watch',
  module: 'Module 2: Express.js',
  day: 9,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Meet Express, the most popular Node.js web framework: install Express 5, build your first server and JSON API, send different kinds of responses, restart automatically with node --watch or nodemon, and learn the key differences between Express 4 and Express 5.',
  objectives: [
    'Explain what Express is and what problems it solves on top of the http module',
    'Set up an Express 5 project with npm scripts for start and dev (node --watch / nodemon)',
    'Create routes with app.get / app.post and send text, HTML, JSON and status codes',
    'Parse JSON request bodies with express.json() and add a catch-all 404 handler',
    'Know the main Express 4 → 5 changes (async errors, path syntax, req.query, removed methods)',
  ],
  theory: [
    {
      heading: 'What is Express and why use it?',
      content:
        '**Express** is a minimal, unopinionated web framework for Node.js, first released in 2010. It sits on top of the `http` module you used on Day 8 and adds:\n\n- **Routing** by method and path, with **route parameters** (`/users/:id`) and query parsing (`req.query`)\n- **Middleware**: small functions that run in a chain for every request (logging, auth, parsing bodies)\n- **Response helpers**: `res.json()`, `res.status()`, `res.send()`, `res.redirect()`, `res.sendFile()`\n- **Body parsing** (`express.json()`), **static files** (`express.static`), template engines and **error handling**\n\n"Unopinionated" means Express does not force a folder structure or database; you choose. It is the "E" in the **MERN / MEAN** stacks and the foundation many other frameworks (NestJS by default) build on.\n\nAnalogy: the http module is a **bare kitchen** with a stove; Express is the same kitchen with **labelled shelves, knives and recipe cards**: you cook faster and make fewer mistakes.',
    },
    {
      heading: 'Setting up an Express 5 project',
      content:
        'Express 5 is the current major version (`npm install express` installs 5.x). It requires **Node.js 18+**.\n\n1. `mkdir my-api && cd my-api`\n2. `npm init -y`\n3. `npm install express`\n4. Create `app.js` (or `index.js` / `server.js`)\n5. Add scripts to package.json and run `npm run dev`\n\n**Auto-restart during development**: by default you must stop (Ctrl + C) and restart Node after every change.\n\n- **node --watch app.js**: built into Node (stable since v22), no install needed\n- **nodemon**: the classic tool, `npm i -D nodemon`, then `nodemon app.js`; configurable with `nodemon.json` (watch folders, ignore files, extensions)',
      syntax:
        '"scripts": {\n  "start": "node app.js",\n  "dev": "node --watch app.js",\n  "dev:nodemon": "nodemon app.js"\n}',
    },
    {
      heading: 'Anatomy of an Express app',
      content:
        '```\nconst express = require(\'express\');  // 1. import\nconst app = express();               // 2. create the app\napp.use(express.json());             // 3. middleware\napp.get(\'/\', (req, res) => {        // 4. routes\n  res.send(\'Hello\');\n});\napp.listen(3000, () => {...});       // 5. start the server\n```\n\nA **route** = HTTP method + path + handler: `app.METHOD(PATH, HANDLER)`. The handler receives `req` and `res` (Express-enhanced versions of the http objects) and must **send exactly one response**.\n\nExpress checks routes **from top to bottom** and runs the first one that matches. That is why the catch-all 404 handler (`app.use((req, res) => ...)`) goes at the **end**: it only runs when nothing above matched.\n\n`app.listen(port)` is a shortcut for `http.createServer(app).listen(port)`: an Express app is just a request handler function.',
    },
    {
      heading: 'Sending responses',
      content:
        '- `res.send(body)`: string → `text/html`, object/array → JSON, Buffer → binary\n- `res.json(data)`: always JSON (`application/json`), also handles `null` and numbers\n- `res.status(code)`: sets the status and is **chainable**: `res.status(201).json(obj)`\n- `res.sendStatus(code)`: status with its standard text as body (204 sends no body)\n- `res.set(name, value)` / `res.type(\'csv\')`: headers\n- `res.redirect(\'/login\')`, `res.sendFile(absPath)`, `res.download(path)`, `res.end()`\n\nCommon errors:\n\n- **Cannot set headers after they are sent** (`ERR_HTTP_HEADERS_SENT`): you sent two responses, usually a missing `return` before an early `res.status(400).json(...)`\n- **Request hangs**: no response was sent at all',
      tip: 'Always write `return res.status(400).json(...)` for early exits inside a handler. The `return` stops the rest of the function from running and sending a second response.',
    },
    {
      heading: 'Express 4 vs Express 5: what changed',
      content:
        'Many tutorials still show Express 4, so know the differences:\n\n1. **Async errors**: in Express 5, if an `async` handler throws or returns a rejected promise, the error goes to your error middleware automatically. In Express 4 you needed `try/catch` + `next(err)` or the `express-async-errors` package.\n2. **Path syntax** (path-to-regexp v8): wildcards must be named, `/*splat` instead of `/*`; optional segments use braces, `/:file{.:ext}` instead of `/:file.:ext?`; regular-expression characters in strings are no longer supported.\n3. **req.query** is a read-only getter; the default query parser is "simple" (no nested objects like `a[b]=1` unless you configure `extended`).\n4. **req.body** is `undefined` (not `{}`) when no body parser ran.\n5. **Removed**: `app.del()` (use `app.delete`), `res.send(status)` with a number (use `res.sendStatus`), `res.json(obj, status)` (use `res.status().json()`), `req.param()`, `res.redirect(\'back\')`.\n6. Requires Node.js 18 or newer.',
    },
  ],
  examples: [
    {
      title: 'Hello Express: first routes and a 404 handler',
      scenario: 'Create a server with a home page, a JSON status endpoint, an HTML page and a JSON 404 for everything else.',
      steps: [
        'Run `mkdir hello-express && cd hello-express && npm init -y && npm install express`',
        'Create `app.js` with the code below',
        'Run `node --watch app.js` and open http://localhost:3000',
        'Try /api/status, /about and a wrong URL like /contact (or click Run in the API Lab)',
      ],
      code: HELLO_APP,
      api: {
        code: HELLO_APP,
        requests: [
          { method: 'GET', url: '/' },
          { method: 'GET', url: '/api/status' },
          { method: 'GET', url: '/about' },
          { method: 'GET', url: '/contact' },
          { method: 'POST', url: '/api/status' },
        ],
      },
      result: "GET / → 200 Hello from Express 5!\nGET /api/status → 200 {\"status\":\"ok\",\"framework\":\"express\",\"version\":5}\nGET /about → 200 <h1>About us</h1><p>We teach Node.js</p>\nGET /contact → 404 {\"error\":\"Cannot GET /contact\"}\nPOST /api/status → 404 {\"error\":\"Cannot POST /api/status\"}",
      explanation:
        'Each `app.get` registers a handler for one method + path. `res.send` with a string sends HTML/text, `res.json` sends JSON. `/contact` and `POST /api/status` match no route, so they fall through to the last `app.use`, which returns a JSON 404 (without it, Express would send its default HTML "Cannot GET /contact" page). The API Lab replaces the browser and curl.',
    },
    {
      title: 'All the ways to send a response',
      scenario: 'Compare res.send, res.json, res.status, res.sendStatus and res.set and look at the Content-Type of each response.',
      steps: [
        'Create `responses.js` and run it with `node --watch responses.js`',
        'Request each URL with curl -i (shows headers) or in the API Lab',
        'Look at the status code and Content-Type (shown in [brackets] in the result)',
      ],
      code: RESPONSES_APP,
      api: {
        code: RESPONSES_APP,
        requests: [
          { method: 'GET', url: '/text' },
          { method: 'GET', url: '/object' },
          { method: 'GET', url: '/json' },
          { method: 'GET', url: '/created' },
          { method: 'GET', url: '/empty' },
          { method: 'GET', url: '/csv' },
          { method: 'GET', url: '/teapot' },
        ],
      },
      result: "GET /text → 200 [text/html; charset=utf-8] plain words\nGET /object → 200 [application/json; charset=utf-8] {\"sentAs\":\"json\"}\nGET /json → 200 [application/json; charset=utf-8] {\"ok\":true,\"items\":[1,2,3]}\nGET /created → 201 [application/json; charset=utf-8] {\"id\":7}\nGET /empty → 204 [null]\nGET /csv → 200 [text/csv; charset=utf-8] name,marks,city\nGET /teapot → 418 [text/html; charset=utf-8] I'm a teapot",
      explanation:
        'A string sent with `res.send` becomes `text/html`; an object becomes JSON automatically. `res.status(201)` is chainable. `sendStatus(204)` sends no body and no Content-Type (shown as null) because 204 means "No Content". `res.set` overrides the Content-Type so `/csv` is treated as CSV data. Express adds `charset=utf-8` to text and JSON responses.',
    },
    {
      title: 'A first JSON API with express.json()',
      scenario: 'A student registration API: list students, add a student with validation, and count them.',
      steps: [
        'Create `students.js` and run `node --watch students.js`',
        'GET /api/students lists everyone',
        'POST /api/students with a JSON body `{ "name": "Meera", "course": "Express" }` (curl: `-H "Content-Type: application/json" -d \'...\'`)',
        'Send a POST without course to see the 400 validation error',
      ],
      code: STUDENTS_APP,
      api: {
        code: STUDENTS_APP,
        requests: [
          { method: 'GET', url: '/api/students' },
          { method: 'POST', url: '/api/students', body: { name: 'Meera', course: 'Express' } },
          { method: 'POST', url: '/api/students', body: { name: 'Kiran' } },
          { method: 'GET', url: '/api/students/count' },
        ],
      },
      result: "GET /api/students → 200 [{\"id\":1,\"name\":\"Asha\",\"course\":\"Node.js\"},{\"id\":2,\"name\":\"Ravi\",\"course\":\"React\"}]\nPOST /api/students → 201 {\"id\":3,\"name\":\"Meera\",\"course\":\"Express\"}\nPOST /api/students → 400 {\"error\":\"name and course are required\"}\nGET /api/students/count → 200 {\"total\":3}",
      explanation:
        '`app.use(express.json())` is middleware that reads the request stream and puts the parsed JSON in `req.body` (all the work you did by hand on Day 8). In Express 5, `req.body` is undefined when there is no body, so `req.body ?? {}` keeps destructuring safe. Validation fails fast with `return res.status(400)`, and a successful create returns 201 with the new object. The data lives in memory, so it resets when the server restarts.',
    },
    {
      title: 'Project setup with npm scripts, node --watch and nodemon',
      scenario: 'Create a real project folder the way teams do: package.json, Express dependency, nodemon as a dev dependency and dev / start scripts.',
      steps: [
        'Run the terminal commands below in an empty folder',
        'Use `npm run dev` while coding (auto-restart) and `npm start` in production',
        'Optional: add a nodemon.json to control what is watched',
      ],
      code: "# File: nodemon.json\n{\n  \"watch\": [\"src\", \"app.js\"],\n  \"ext\": \"js,json\",\n  \"ignore\": [\"data/*.json\"]\n}\n\n# Terminal\nnpm init -y > /dev/null\nnpm install express --silent\nnpm install -D nodemon --silent\nnpm pkg set scripts.start=\"node app.js\" scripts.dev=\"node --watch app.js\" scripts.dev:nodemon=\"nodemon app.js\"\nnpm pkg delete scripts.test\nnode -p \"const p = require('./package.json'); JSON.stringify({ scripts: p.scripts, dependencies: Object.keys(p.dependencies), devDependencies: Object.keys(p.devDependencies) }, null, 2)\"\nnode -p \"'Express major version: ' + require('express/package.json').version.split('.')[0]\"\nnpm run",
      result: "{\n  \"scripts\": {\n    \"start\": \"node app.js\",\n    \"dev\": \"node --watch app.js\",\n    \"dev:nodemon\": \"nodemon app.js\"\n  },\n  \"dependencies\": [\n    \"express\"\n  ],\n  \"devDependencies\": [\n    \"nodemon\"\n  ]\n}\nExpress major version: 5\nLifecycle scripts included in my-api@1.0.0:\n  start\n    node app.js\navailable via `npm run`:\n  dev\n    node --watch app.js\n  dev:nodemon\n    nodemon app.js",
      explanation:
        'Express is a runtime dependency; nodemon is a devDependency because it is only used while coding. The `dev` script uses Node\'s built-in watch mode, `dev:nodemon` the classic tool configured by nodemon.json (here it ignores data files so saving data does not restart the server). `npm run` with no name lists all scripts. On the server you run `npm start`, which uses plain `node`.',
    },
    {
      title: 'Express 5 features: async handlers, named wildcards, optional segments',
      scenario: 'See the Express 5 behaviour you must know when reading older Express 4 tutorials.',
      steps: [
        'Create `express5.js` and run it',
        'Request an existing and a missing docs section: the async handler throws, Express 5 forwards the error',
        'Request nested paths under /files/ and /report with and without an extension',
      ],
      code: EXPRESS5_APP,
      api: {
        code: EXPRESS5_APP,
        requests: [
          { method: 'GET', url: '/api/docs/install' },
          { method: 'GET', url: '/api/docs/pricing' },
          { method: 'GET', url: '/files/images/2025/logo.png' },
          { method: 'GET', url: '/report' },
          { method: 'GET', url: '/report.pdf' },
        ],
      },
      result: "GET /api/docs/install → 200 {\"section\":\"install\",\"text\":\"npm install express\"}\nGET /api/docs/pricing → 404 {\"error\":\"No section pricing\"}\nGET /files/images/2025/logo.png → 200 {\"segments\":[\"images\",\"2025\",\"logo.png\"],\"joined\":\"images/2025/logo.png\"}\nGET /report → 200 {\"format\":\"html\"}\nGET /report.pdf → 200 {\"format\":\"pdf\"}",
      explanation:
        'In Express 5, the error thrown inside the async handler is caught by Express and sent to the 4-argument error middleware; in Express 4 this would have been an unhandled rejection and the request would hang. `*filepath` captures the rest of the path as an array of segments. `{.:format}` makes the extension optional, so `/report` and `/report.pdf` both match.',
    },
  ],
  interview: [
    { q: 'What is Express.js?', a: 'A minimal, unopinionated web framework for Node.js that provides routing, middleware, request/response helpers, static file serving and error handling on top of the http module. It is used to build REST APIs and web apps.', level: 'Easy' },
    { q: 'Why use Express instead of the plain http module?', a: 'It removes boilerplate: routing with params, automatic JSON responses, body parsing middleware, chainable status helpers, static files, centralised error handling and a large middleware ecosystem.', level: 'Easy' },
    { q: 'What does app.listen do?', a: 'It creates an http server with the app as the request handler and starts listening on the given port: equivalent to http.createServer(app).listen(port). It returns the http.Server instance.', level: 'Medium' },
    { q: 'Difference between res.send and res.json?', a: 'res.send inspects the argument: strings become text/html, Buffers binary, objects JSON. res.json always serialises the value as JSON and sets Content-Type application/json, including for null or numbers.', level: 'Easy' },
    { q: 'What does express.json() do?', a: 'Built-in middleware that parses incoming requests with Content-Type application/json and puts the result in req.body. It also enforces a size limit (100kb by default) and returns 400 for malformed JSON.', level: 'Easy' },
    { q: 'What causes "Cannot set headers after they are sent to the client"?', a: 'Sending more than one response for the same request, typically a missing return after an early res.status(...).json(...), or calling next() after responding.', level: 'Medium' },
    { q: 'What is nodemon and what is the built-in alternative?', a: 'nodemon is a dev tool that restarts the Node process when files change. Node.js has a built-in equivalent: node --watch app.js (stable in Node 22).', level: 'Easy' },
    { q: 'Name three differences between Express 4 and Express 5.', a: 'Express 5 forwards rejected promises from async handlers to error middleware; uses new path syntax (named wildcards /*splat, optional segments with braces); makes req.query a read-only getter; removes app.del, res.send(status) and res.json(obj, status); req.body is undefined without a parser; requires Node 18+.', level: 'Hard' },
    { q: 'Why must the 404 handler be registered last?', a: 'Express matches middleware and routes in registration order. A catch-all app.use placed earlier would answer every request before the real routes get a chance.', level: 'Medium' },
    { q: 'Is Express opinionated?', a: 'No. It does not impose a project structure, ORM or template engine. This flexibility is a strength, but teams must choose their own structure (e.g. routes/controllers/services, Day 13). NestJS is an opinionated alternative.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create an Express app with GET / returning "Welcome", GET /api/time returning { "now": <ISO date> } and a JSON 404 handler.',
      hint: 'new Date().toISOString(); put app.use for 404 at the end.',
      solution: "const express = require('express');\nconst app = express();\napp.get('/', (req, res) => res.send('Welcome'));\napp.get('/api/time', (req, res) => res.json({ now: new Date().toISOString() }));\napp.use((req, res) => res.status(404).json({ error: 'Not found' }));\napp.listen(3000, () => console.log('Server running on port 3000'));",
    },
    {
      task: 'Build a "quotes" API: GET /api/quotes returns all quotes, GET /api/quotes/random returns one random quote, POST /api/quotes adds { text, author } with validation (400 if text is missing).',
      hint: 'quotes[Math.floor(Math.random() * quotes.length)]; app.use(express.json()).',
      solution: "const express = require('express');\nconst app = express();\napp.use(express.json());\nconst quotes = [{ text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' }];\napp.get('/api/quotes', (req, res) => res.json(quotes));\napp.get('/api/quotes/random', (req, res) => res.json(quotes[Math.floor(Math.random() * quotes.length)]));\napp.post('/api/quotes', (req, res) => {\n  const { text, author = 'Unknown' } = req.body ?? {};\n  if (!text) return res.status(400).json({ error: 'text is required' });\n  const quote = { text, author };\n  quotes.push(quote);\n  res.status(201).json(quote);\n});\napp.listen(3000);",
    },
    {
      task: 'Set up a project with `start` and `dev` scripts where dev uses node --watch, and read the port from the PORT environment variable with a default of 3000.',
      hint: 'const PORT = Number(process.env.PORT) || 3000.',
      solution: "// package.json\n\"scripts\": {\n  \"start\": \"node app.js\",\n  \"dev\": \"node --watch app.js\"\n}\n\n// app.js\nconst express = require('express');\nconst app = express();\nconst PORT = Number(process.env.PORT) || 3000;\napp.get('/', (req, res) => res.send(`Running on ${PORT}`));\napp.listen(PORT, () => console.log(`Server running on port ${PORT}`));\n// PORT=5000 npm run dev",
    },
    {
      task: 'Find and fix the bug: app.post("/api/login", (req, res) => { if (!req.body.email) { res.status(400).json({ error: "email required" }); } res.json({ ok: true }); }). Also make it safe when no JSON body is sent.',
      hint: 'Two responses are sent when email is missing; req.body may be undefined in Express 5.',
      solution: "app.use(express.json());\napp.post('/api/login', (req, res) => {\n  const { email } = req.body ?? {};\n  if (!email) {\n    return res.status(400).json({ error: 'email required' }); // return stops the second send\n  }\n  res.json({ ok: true });\n});",
    },
    {
      task: 'Rewrite this Express 4 code for Express 5: app.get("/assets/*", handler); app.get("/user/:id?", handler); res.json({ ok: true }, 201); app.del("/item/:id", handler).',
      hint: 'Named wildcard, braces for optional, status().json(), app.delete.',
      solution: "app.get('/assets/*path', handler);        // req.params.path is an array\napp.get('/user{/:id}', handler);           // optional id\nres.status(201).json({ ok: true });\napp.delete('/item/:id', handler);",
    },
  ],
  quiz: [
    { question: 'Which line creates an Express application?', options: ["const app = require('express')", 'const app = express()', 'const app = new Express()', 'const app = http.express()'], answer: 1, explanation: 'Call the imported express function: const app = express().' },
    { question: 'res.send({ a: 1 }) responds with Content-Type...', options: ['text/html', 'text/plain', 'application/json', 'application/octet-stream'], answer: 2, explanation: 'Objects passed to res.send are serialised as JSON.' },
    { question: 'Which middleware fills req.body from a JSON request?', options: ['express.static()', 'express.Router()', 'express.urlencoded()', 'express.json()'], answer: 3, explanation: 'express.json() parses application/json bodies.' },
    { question: 'What happens in Express 5 when an async route handler throws?', options: ['The error goes to the error-handling middleware automatically', 'The server crashes immediately', 'The request hangs forever', 'Express retries the handler'], answer: 0, explanation: 'Express 5 catches rejected promises and calls next(err) for you.' },
    { question: 'Built-in Node.js alternative to nodemon:', options: ['node --inspect', 'node --watch', 'npm restart', 'node --reload'], answer: 1, explanation: 'node --watch restarts the process when files change.' },
  ],
};
