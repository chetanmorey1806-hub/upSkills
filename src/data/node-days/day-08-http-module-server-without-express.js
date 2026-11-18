export default {
  id: 'day-08-http-module-server-without-express',
  title: 'The http Module: Building a Server without Express and Routing by Hand',
  module: 'Module 1: Node.js Fundamentals',
  day: 8,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Build web servers with only the built-in http module: understand the request / response cycle, methods, status codes and headers, route requests by method and URL by hand, parse query strings and JSON bodies, serve static files, and see why frameworks like Express exist.',
  objectives: [
    'Explain the HTTP request / response cycle: method, URL, headers, body, status code',
    'Create a server with http.createServer and send text, HTML and JSON responses',
    'Route requests manually using req.method, URL pathname, query strings and route parameters',
    'Read and parse a JSON request body from the request stream and validate it',
    'Serve static files with the correct Content-Type and compare the effort with Express',
  ],
  theory: [
    {
      heading: 'How HTTP works (in 2 minutes)',
      content:
        '**HTTP** (HyperText Transfer Protocol) is the language browsers, mobile apps and servers use to talk. It is a **request / response** protocol:\n\n1. The **client** sends a **request**: a **method** (GET, POST, PUT, PATCH, DELETE), a **URL** (`/api/users?page=2`), **headers** (Content-Type, Authorization, Accept...) and an optional **body** (usually JSON).\n2. The **server** sends back a **response**: a **status code** (200, 404...), **headers** (Content-Type...) and a **body** (HTML, JSON, an image...).\n\nAnalogy: a **restaurant order**. The method is what you want to do (order, change, cancel), the URL is which dish, headers are notes ("no onions, pay by card"), the body is the details, and the status code is the waiter\'s answer ("here you go" 200, "we don\'t have that" 404, "kitchen on fire" 500).\n\nHTTP is **stateless**: every request is independent; the server does not remember previous requests unless you use cookies, sessions or tokens.',
      points: [
        'GET read data, POST create, PUT replace, PATCH partially update, DELETE remove',
        '2xx success (200 OK, 201 Created, 204 No Content)',
        '3xx redirect (301, 302, 304 Not Modified)',
        '4xx client error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed, 409 Conflict)',
        '5xx server error (500 Internal Server Error, 503 Service Unavailable)',
      ],
    },
    {
      heading: 'http.createServer, req and res',
      content:
        '`http.createServer((req, res) => { ... })` creates a server and registers ONE callback that runs for **every** request. `server.listen(port)` starts listening.\n\n**req** (an `IncomingMessage`, a Readable stream):\n\n- `req.method` `\'GET\'`, `req.url` `\'/api/users?page=2\'` (path + query string, no host)\n- `req.headers` object with **lower-case** header names (`req.headers[\'content-type\']`)\n- the body is NOT ready immediately: it arrives as stream chunks\n\n**res** (a `ServerResponse`, a Writable stream):\n\n- `res.statusCode = 404` and `res.setHeader(\'Content-Type\', \'application/json\')`\n- or both at once: `res.writeHead(201, { \'Content-Type\': \'application/json\' })`\n- `res.write(chunk)` sends part of the body; `res.end(data)` sends the last part and **finishes** the response\n\nEvery request must end with exactly one `res.end()`. Forget it and the browser spins until it times out; call it twice and Node throws `ERR_STREAM_WRITE_AFTER_END`.',
      syntax:
        "const http = require('node:http');\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'text/plain' });\n  res.end('Hello');\n});\nserver.listen(3000);",
    },
    {
      heading: 'Routing by hand',
      content:
        '**Routing** means choosing what code runs based on **method + path**. Without a framework you write it yourself:\n\n1. Parse the URL: `const url = new URL(req.url, \'http://localhost\')` gives `url.pathname` and `url.searchParams`\n2. Compare `req.method` and `url.pathname` with `if / else` or a `switch`, or a lookup table like `routes[\'GET /api/products\']`\n3. **Route parameters** such as `/api/products/42` need string splitting or a regular expression: `pathname.match(/^\\/api\\/products\\/(\\d+)$/)`\n4. If the path exists but the method does not, reply **405 Method Not Allowed**; if nothing matches, reply **404 Not Found**\n\nThis gets long quickly: every route repeats status codes, headers and JSON.stringify. That repetition is exactly what Express removes from Day 9.',
    },
    {
      heading: 'Reading the request body',
      content:
        'For POST / PUT / PATCH requests, the body arrives in **chunks** because `req` is a Readable stream. You must collect the chunks, join them and parse:\n\n```\nlet raw = \'\';\nfor await (const chunk of req) raw += chunk;\nconst data = JSON.parse(raw); // may throw on invalid JSON\n```\n\nThings you must handle yourself (Express does them for you with `express.json()`):\n\n- check `Content-Type: application/json`\n- **invalid JSON** → catch the error and reply **400**\n- **size limit** (e.g. 1 MB) to protect the server from huge bodies\n- validation of required fields → **400** with a helpful message (or **422**)',
    },
    {
      heading: 'Serving static files and MIME types',
      content:
        'To serve a website, map the URL to a file inside a `public` folder, stream it to the response and set the right **Content-Type** (MIME type) so the browser knows how to handle it:\n\n- `.html` `text/html; charset=utf-8`, `.css` `text/css`, `.js` `text/javascript`\n- `.json` `application/json`, `.png` `image/png`, `.jpg` `image/jpeg`, `.svg` `image/svg+xml`\n\n**Security**: never join user input to a path blindly. A request for `/../../etc/passwd` could escape the public folder (**path traversal**). Resolve the final path and check it still starts with the public folder.\n\nCompare with Express (Day 15): `app.use(express.static(\'public\'))` does all of this, plus caching headers and range requests, in one line.',
      tip: 'Use the http module directly when you need zero dependencies or want to understand the internals (interview favourite). For real APIs, a framework (Express, Fastify, NestJS) saves time and avoids security mistakes. Every one of them is built on top of this http module.',
    },
  ],
  examples: [
    {
      title: 'First server: text, HTML and JSON responses',
      scenario: 'Respond differently depending on the URL and log each request in the terminal.',
      steps: [
        'Create `server.js` with the code below',
        'Run `node server.js`',
        'Visit http://localhost:3000, /about and /api/info, or use curl (e.g. `curl -i http://localhost:3000/api/info` shows headers too)',
        'Stop with Ctrl + C; after code changes restart, or use `node --watch server.js`',
      ],
      code: "// server.js\nconst http = require('node:http');\n\nconst server = http.createServer((req, res) => {\n  console.log(`${req.method} ${req.url}`);\n\n  if (req.url === '/') {\n    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });\n    res.end('Welcome to my Node server');\n  } else if (req.url === '/about') {\n    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });\n    res.end('<h1>About</h1><p>Built with the http module</p>');\n  } else if (req.url === '/api/info') {\n    res.statusCode = 200;\n    res.setHeader('Content-Type', 'application/json');\n    res.end(JSON.stringify({ app: 'demo', framework: 'none', node: true }));\n  } else {\n    res.writeHead(404, { 'Content-Type': 'application/json' });\n    res.end(JSON.stringify({ error: `Cannot ${req.method} ${req.url}` }));\n  }\n});\n\nserver.listen(3000, () => console.log('Server running on http://localhost:3000'));",
      result: "Server running on http://localhost:3000\nGET /\nGET /about\nGET /api/info\nGET /contact\nGET / → 200 Welcome to my Node server\nGET /about → 200 <h1>About</h1><p>Built with the http module</p>\nGET /api/info → 200 {\"app\":\"demo\",\"framework\":\"none\",\"node\":true}\nGET /contact → 404 {\"error\":\"Cannot GET /contact\"}",
      explanation:
        'The first lines are the server terminal output (the startup message and one log per request); the lines with → show each request and the real response status and body. One callback handles everything, branching on `req.url`. `writeHead` sets status and headers together; `statusCode` + `setHeader` do the same separately. JSON must be converted with `JSON.stringify` manually, and unknown URLs get a 404.',
    },
    {
      title: 'Routing by method and path, query strings and route parameters',
      scenario: 'A read-only product catalogue API: list, filter by category with ?category=, get one by id, and send 404 / 405 correctly.',
      steps: [
        'Create `products-server.js` and run `node products-server.js`',
        'Try: `curl http://localhost:3000/api/products?category=books`',
        'Try: `curl http://localhost:3000/api/products/2` and an id that does not exist',
        'Try: `curl -X DELETE http://localhost:3000/api/products` to see 405',
      ],
      code: "// products-server.js\nconst http = require('node:http');\n\nconst products = [\n  { id: 1, name: 'Node.js Guide', category: 'books', price: 499 },\n  { id: 2, name: 'Mechanical Keyboard', category: 'electronics', price: 3499 },\n  { id: 3, name: 'Clean Code', category: 'books', price: 650 },\n];\n\nfunction sendJson(res, status, data) {\n  res.writeHead(status, { 'Content-Type': 'application/json' });\n  res.end(JSON.stringify(data));\n}\n\nconst server = http.createServer((req, res) => {\n  const url = new URL(req.url, `http://${req.headers.host}`);\n  const { pathname, searchParams } = url;\n\n  if (pathname === '/api/products') {\n    if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method Not Allowed' });\n    const category = searchParams.get('category');\n    const result = category ? products.filter(p => p.category === category) : products;\n    return sendJson(res, 200, result);\n  }\n\n  const match = pathname.match(/^\\/api\\/products\\/(\\d+)$/); // route parameter :id\n  if (match && req.method === 'GET') {\n    const product = products.find(p => p.id === Number(match[1]));\n    if (!product) return sendJson(res, 404, { error: `Product ${match[1]} not found` });\n    return sendJson(res, 200, product);\n  }\n\n  sendJson(res, 404, { error: 'Route not found' });\n});\n\nserver.listen(3000, () => console.log('Server running on port 3000'));",
      result: "GET /api/products?category=books → 200 [{\"id\":1,\"name\":\"Node.js Guide\",\"category\":\"books\",\"price\":499},{\"id\":3,\"name\":\"Clean Code\",\"category\":\"books\",\"price\":650}]\nGET /api/products/2 → 200 {\"id\":2,\"name\":\"Mechanical Keyboard\",\"category\":\"electronics\",\"price\":3499}\nGET /api/products/99 → 404 {\"error\":\"Product 99 not found\"}\nDELETE /api/products → 405 {\"error\":\"Method Not Allowed\"}\nGET /api/orders → 404 {\"error\":\"Route not found\"}",
      explanation:
        '`new URL(req.url, base)` separates the pathname from the query string. The regular expression captures the id from `/api/products/2` (a "route parameter"); it arrives as a string, so `Number()` converts it. A known path with the wrong method gets 405, an unknown id gets 404 with a clear message. The helper `sendJson` avoids repeating headers, a mini version of Express\'s `res.json()`.',
    },
    {
      title: 'Handling POST, PUT and DELETE with a JSON body',
      scenario: 'A full in-memory notes API built by hand: read the body stream, parse JSON safely, validate, and use the correct status codes.',
      steps: [
        'Create `notes-server.js` and run `node notes-server.js`',
        'Create a note: `curl -X POST http://localhost:3000/api/notes -H "Content-Type: application/json" -d \'{"text":"Learn streams"}\'`',
        'Update with PUT, delete with DELETE, and try invalid JSON to see 400',
      ],
      code: "// notes-server.js\nconst http = require('node:http');\n\nlet notes = [{ id: 1, text: 'Learn the http module' }];\nlet nextId = 2;\n\nfunction sendJson(res, status, data) {\n  res.writeHead(status, { 'Content-Type': 'application/json' });\n  res.end(data === undefined ? undefined : JSON.stringify(data));\n}\n\nasync function readJsonBody(req) {\n  let raw = '';\n  for await (const chunk of req) {\n    raw += chunk;\n    if (raw.length > 1e6) throw Object.assign(new Error('Body too large'), { status: 413 });\n  }\n  try {\n    return raw ? JSON.parse(raw) : {};\n  } catch {\n    throw Object.assign(new Error('Invalid JSON'), { status: 400 });\n  }\n}\n\nconst server = http.createServer(async (req, res) => {\n  try {\n    const { pathname } = new URL(req.url, 'http://localhost');\n    const idMatch = pathname.match(/^\\/api\\/notes\\/(\\d+)$/);\n\n    if (pathname === '/api/notes' && req.method === 'GET') return sendJson(res, 200, notes);\n\n    if (pathname === '/api/notes' && req.method === 'POST') {\n      const body = await readJsonBody(req);\n      if (!body.text || typeof body.text !== 'string') return sendJson(res, 400, { error: 'text is required' });\n      const note = { id: nextId++, text: body.text.trim() };\n      notes.push(note);\n      return sendJson(res, 201, note);\n    }\n\n    if (idMatch) {\n      const id = Number(idMatch[1]);\n      const note = notes.find(n => n.id === id);\n      if (!note) return sendJson(res, 404, { error: `Note ${id} not found` });\n      if (req.method === 'PUT') {\n        const body = await readJsonBody(req);\n        if (!body.text) return sendJson(res, 400, { error: 'text is required' });\n        note.text = body.text;\n        return sendJson(res, 200, note);\n      }\n      if (req.method === 'DELETE') {\n        notes = notes.filter(n => n.id !== id);\n        return sendJson(res, 204);\n      }\n    }\n    sendJson(res, 404, { error: 'Route not found' });\n  } catch (err) {\n    sendJson(res, err.status || 500, { error: err.message });\n  }\n});\n\nserver.listen(3000, () => console.log('Server running on port 3000'));",
      result: "GET /api/notes → 200 [{\"id\":1,\"text\":\"Learn the http module\"}]\nPOST /api/notes → 201 {\"id\":2,\"text\":\"Learn streams\"}\nPOST /api/notes → 400 {\"error\":\"Invalid JSON\"}\nPOST /api/notes → 400 {\"error\":\"text is required\"}\nPUT /api/notes/2 → 200 {\"id\":2,\"text\":\"Learn streams and pipeline\"}\nDELETE /api/notes/1 → 204\nGET /api/notes → 200 [{\"id\":2,\"text\":\"Learn streams and pipeline\"}]\nDELETE /api/notes/1 → 404 {\"error\":\"Note 1 not found\"}",
      explanation:
        'The body is collected chunk by chunk with `for await` because `req` is a stream, then parsed inside try / catch so broken JSON becomes a 400 instead of a crash. POST returns 201 Created with the new object, PUT returns the updated object, DELETE returns 204 No Content (no body). The outer try / catch turns unexpected errors into a 500. Notice how much plumbing this needs; Express handles body parsing, status helpers and errors for you.',
    },
    {
      title: 'Serving static files with streams and MIME types',
      scenario: 'Serve an index.html and style.css from a public folder with correct Content-Types and protection against path traversal.',
      steps: [
        'Create `public/index.html` containing `<h1>Hello static world</h1>` and `public/style.css` containing `h1 { color: teal; }`',
        'Create `static-server.js` next to the public folder and run `node static-server.js`',
        'Open http://localhost:3000 and http://localhost:3000/style.css',
        'Try a missing file and an attack URL like `/..%2fstatic-server.js`',
      ],
      code: "// static-server.js\nconst http = require('node:http');\nconst fs = require('node:fs');\nconst path = require('node:path');\nconst { pipeline } = require('node:stream/promises');\n\nconst PUBLIC_DIR = path.join(__dirname, 'public');\nconst MIME = {\n  '.html': 'text/html; charset=utf-8',\n  '.css': 'text/css; charset=utf-8',\n  '.js': 'text/javascript; charset=utf-8',\n  '.json': 'application/json',\n  '.png': 'image/png',\n};\n\nconst server = http.createServer(async (req, res) => {\n  const { pathname } = new URL(req.url, 'http://localhost');\n  const requested = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);\n  const filePath = path.join(PUBLIC_DIR, requested);\n\n  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {      // path traversal guard\n    res.writeHead(403, { 'Content-Type': 'text/plain' });\n    return res.end('Forbidden');\n  }\n\n  try {\n    const stat = await fs.promises.stat(filePath);\n    res.writeHead(200, {\n      'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream',\n      'Content-Length': stat.size,\n    });\n    await pipeline(fs.createReadStream(filePath), res); // stream instead of readFile\n  } catch {\n    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });\n    res.end('<h1>404 - Page not found</h1>');\n  }\n});\n\nserver.listen(3000, () => console.log('Static server on http://localhost:3000'));",
      result: "GET / → 200 [text/html; charset=utf-8] <h1>Hello static world</h1>\nGET /style.css → 200 [text/css; charset=utf-8] h1 { color: teal; }\nGET /missing.png → 404 [text/html; charset=utf-8] <h1>404 - Page not found</h1>\nGET /..%2fstatic-server.js → 403 [text/plain] Forbidden",
      explanation:
        'The URL path is mapped to a file inside `public`, the extension decides the Content-Type, and the file is streamed to the response (good for big images or videos). The decoded `/../static-server.js` would point outside `public`, so the guard returns 403 instead of leaking the server code. Missing files return a friendly 404 page.',
    },
    {
      title: 'The same product API in Express (preview of Day 9)',
      scenario: 'Rewrite the product catalogue from Example 2 in Express and compare the amount of code. Run it in the API Lab.',
      steps: [
        'In a new folder run `npm init -y` and `npm install express`',
        'Create `app.js` with the code below and run `node app.js`',
        'Send the same requests as in Example 2 (or click Run in the API Lab)',
      ],
      code: "const express = require('express');\nconst app = express();\n\nconst products = [\n  { id: 1, name: 'Node.js Guide', category: 'books', price: 499 },\n  { id: 2, name: 'Mechanical Keyboard', category: 'electronics', price: 3499 },\n  { id: 3, name: 'Clean Code', category: 'books', price: 650 },\n];\n\napp.get('/api/products', (req, res) => {\n  const { category } = req.query;\n  res.json(category ? products.filter(p => p.category === category) : products);\n});\n\napp.get('/api/products/:id', (req, res) => {\n  const product = products.find(p => p.id === Number(req.params.id));\n  if (!product) return res.status(404).json({ error: `Product ${req.params.id} not found` });\n  res.json(product);\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));",
      api: {
        code: "const express = require('express');\nconst app = express();\n\nconst products = [\n  { id: 1, name: 'Node.js Guide', category: 'books', price: 499 },\n  { id: 2, name: 'Mechanical Keyboard', category: 'electronics', price: 3499 },\n  { id: 3, name: 'Clean Code', category: 'books', price: 650 },\n];\n\napp.get('/api/products', (req, res) => {\n  const { category } = req.query;\n  res.json(category ? products.filter(p => p.category === category) : products);\n});\n\napp.get('/api/products/:id', (req, res) => {\n  const product = products.find(p => p.id === Number(req.params.id));\n  if (!product) return res.status(404).json({ error: `Product ${req.params.id} not found` });\n  res.json(product);\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));",
        requests: [
          { method: 'GET', url: '/api/products?category=books' },
          { method: 'GET', url: '/api/products/2' },
          { method: 'GET', url: '/api/products/99' },
        ],
      },
      result: "GET /api/products?category=books → 200 [{\"id\":1,\"name\":\"Node.js Guide\",\"category\":\"books\",\"price\":499},{\"id\":3,\"name\":\"Clean Code\",\"category\":\"books\",\"price\":650}]\nGET /api/products/2 → 200 {\"id\":2,\"name\":\"Mechanical Keyboard\",\"category\":\"electronics\",\"price\":3499}\nGET /api/products/99 → 404 {\"error\":\"Product 99 not found\"}",
      explanation:
        'Express gives the same responses with about half the code: `req.query` replaces URL parsing, `:id` in the path replaces the regular expression, and `res.json()` / `res.status()` replace writeHead + JSON.stringify. Express itself is built on the http module you used today; tomorrow you start learning it properly.',
    },
  ],
  interview: [
    { q: 'How do you create a server with the http module?', a: 'const server = http.createServer((req, res) => { ... }); server.listen(3000). The callback runs for every request; req is an IncomingMessage (Readable stream) and res is a ServerResponse (Writable stream).', level: 'Easy' },
    { q: 'What are req and res in Node\'s http module?', a: 'req (IncomingMessage) holds the method, url, headers and a readable stream of the body. res (ServerResponse) is a writable stream used to set the status code and headers and to send the body with write() and end().', level: 'Easy' },
    { q: 'What happens if you forget res.end()?', a: 'The response never finishes, so the client keeps waiting until it times out, and the connection stays open on the server.', level: 'Easy' },
    { q: 'How do you read a POST body without Express?', a: 'Listen to the data / end events (or use for await over req), concatenate the chunks, then JSON.parse inside try / catch, ideally with a size limit and a Content-Type check.', level: 'Medium' },
    { q: 'Difference between res.writeHead and res.setHeader?', a: 'setHeader sets one header and can be called multiple times before the headers are sent; writeHead sets the status code and any headers at once and sends them immediately. Headers cannot be changed after they are sent (ERR_HTTP_HEADERS_SENT).', level: 'Medium' },
    { q: 'Common HTTP status codes for a REST API?', a: '200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed, 409 Conflict, 422 Unprocessable Entity, 500 Internal Server Error.', level: 'Easy' },
    { q: 'Difference between PUT and PATCH?', a: 'PUT replaces the whole resource with the sent representation (idempotent). PATCH applies a partial update to some fields.', level: 'Medium' },
    { q: 'What is a MIME type / Content-Type?', a: 'A label that tells the receiver what kind of data the body contains, e.g. text/html, application/json, image/png. Browsers use it to decide how to render the response; servers use the request Content-Type to parse the body.', level: 'Easy' },
    { q: 'What is path traversal and how do you prevent it?', a: 'An attack using ../ in URLs to read files outside the intended folder. Prevent it by resolving the final path and verifying it is still inside the public directory, and by using vetted static middleware.', level: 'Hard' },
    { q: 'Why use Express instead of the http module?', a: 'Express adds routing with parameters, middleware, body parsing, response helpers (res.json, res.status), static files, error handling and a large ecosystem, removing a lot of repetitive and error-prone code. It is built on top of the http module.', level: 'Easy' },
    { q: 'What does "HTTP is stateless" mean?', a: 'Each request is independent and contains everything needed to process it; the server keeps no memory of previous requests. State is added with cookies, sessions, tokens (JWT) or databases.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a server with three routes: GET / returns "Home" as text, GET /time returns JSON { "time": <ISO string> }, anything else returns 404 JSON { "error": "Not found" }.',
      hint: 'Compare req.method and req.url; set Content-Type for each response.',
      solution: "const http = require('node:http');\nhttp.createServer((req, res) => {\n  if (req.method === 'GET' && req.url === '/') {\n    res.writeHead(200, { 'Content-Type': 'text/plain' });\n    return res.end('Home');\n  }\n  if (req.method === 'GET' && req.url === '/time') {\n    res.writeHead(200, { 'Content-Type': 'application/json' });\n    return res.end(JSON.stringify({ time: new Date().toISOString() }));\n  }\n  res.writeHead(404, { 'Content-Type': 'application/json' });\n  res.end(JSON.stringify({ error: 'Not found' }));\n}).listen(3000);",
    },
    {
      task: 'Add a GET /api/greet route that reads ?name= from the query string and returns { "message": "Hello <name>" }, defaulting to "Guest".',
      hint: 'new URL(req.url, "http://localhost").searchParams.get("name") ?? "Guest".',
      solution: "const http = require('node:http');\nhttp.createServer((req, res) => {\n  const url = new URL(req.url, 'http://localhost');\n  if (req.method === 'GET' && url.pathname === '/api/greet') {\n    const name = url.searchParams.get('name') ?? 'Guest';\n    res.writeHead(200, { 'Content-Type': 'application/json' });\n    return res.end(JSON.stringify({ message: `Hello ${name}` }));\n  }\n  res.writeHead(404).end();\n}).listen(3000);\n// GET /api/greet?name=Asha -> {\"message\":\"Hello Asha\"}",
    },
    {
      task: 'Build POST /api/sum that accepts JSON { "numbers": [1, 2, 3] } and returns { "sum": 6 }. Return 400 if the body is not valid JSON or numbers is not an array.',
      hint: 'Collect the body with for await, JSON.parse in try / catch, Array.isArray check.',
      solution: "const http = require('node:http');\nhttp.createServer(async (req, res) => {\n  const send = (s, d) => { res.writeHead(s, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(d)); };\n  if (req.method !== 'POST' || req.url !== '/api/sum') return send(404, { error: 'Not found' });\n  let raw = '';\n  for await (const chunk of req) raw += chunk;\n  let body;\n  try { body = JSON.parse(raw); } catch { return send(400, { error: 'Invalid JSON' }); }\n  if (!Array.isArray(body.numbers)) return send(400, { error: 'numbers must be an array' });\n  send(200, { sum: body.numbers.reduce((a, b) => a + Number(b), 0) });\n}).listen(3000);",
    },
    {
      task: 'Write a tiny route table instead of if / else: an object whose keys are "METHOD /path" and values are handler functions. Unknown keys return 404.',
      hint: 'const handler = routes[`${req.method} ${pathname}`].',
      solution: "const http = require('node:http');\nconst json = (res, s, d) => { res.writeHead(s, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(d)); };\nconst routes = {\n  'GET /': (req, res) => json(res, 200, { page: 'home' }),\n  'GET /api/health': (req, res) => json(res, 200, { status: 'ok' }),\n  'POST /api/echo': async (req, res) => {\n    let raw = '';\n    for await (const c of req) raw += c;\n    json(res, 200, { youSent: raw });\n  },\n};\nhttp.createServer((req, res) => {\n  const { pathname } = new URL(req.url, 'http://localhost');\n  const handler = routes[`${req.method} ${pathname}`];\n  if (!handler) return json(res, 404, { error: 'Not found' });\n  handler(req, res);\n}).listen(3000);",
    },
    {
      task: 'Add graceful shutdown to any of your servers: on SIGINT or SIGTERM, log "Shutting down...", stop accepting connections with server.close() and exit with code 0 when closed.',
      hint: 'server.close(callback) waits for open connections to finish.',
      solution: "const http = require('node:http');\nconst server = http.createServer((req, res) => res.end('ok'));\nserver.listen(3000, () => console.log('Listening on 3000'));\nfor (const signal of ['SIGINT', 'SIGTERM']) {\n  process.on(signal, () => {\n    console.log('Shutting down...');\n    server.close(() => {\n      console.log('Closed all connections');\n      process.exit(0);\n    });\n  });\n}",
    },
  ],
  quiz: [
    { question: 'Which method finishes an HTTP response in the http module?', options: ['res.send()', 'res.json()', 'res.end()', 'res.finish()'], answer: 2, explanation: 'res.end() sends the last data and finishes the response; send/json are Express helpers.' },
    { question: 'For GET /api/users?page=2, what is req.url?', options: ['"/api/users?page=2"', '"/api/users"', '"http://localhost:3000/api/users?page=2"', '"page=2"'], answer: 0, explanation: 'req.url contains the path and query string, but not the protocol or host.' },
    { question: 'Status code for successfully creating a resource with POST?', options: ['200', '204', '302', '201'], answer: 3, explanation: '201 Created is the standard response for a successful create.' },
    { question: 'Why do we need for await (const chunk of req) to read a POST body?', options: ['req is a Promise', 'req is a Readable stream; the body arrives in chunks', 'JSON must be awaited', 'It is only needed for GET'], answer: 1, explanation: 'The request body is streamed, so chunks must be collected before parsing.' },
    { question: 'Correct status when /api/products exists but receives a DELETE it does not support?', options: ['404 Not Found', '400 Bad Request', '405 Method Not Allowed', '500 Internal Server Error'], answer: 2, explanation: '405 means the path exists but the HTTP method is not supported.' },
  ],
};
