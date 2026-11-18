const METHODS_APP = "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nlet books = [\n  { id: 1, title: 'Atomic Habits', author: 'James Clear', price: 499 },\n  { id: 2, title: 'Deep Work', author: 'Cal Newport', price: 399 },\n];\nlet nextId = 3;\n\n// app.route() groups all methods for the same path\napp.route('/api/books')\n  .get((req, res) => res.json(books))\n  .post((req, res) => {\n    const book = { id: nextId++, ...req.body };\n    books.push(book);\n    res.status(201).json(book);\n  });\n\napp.route('/api/books/:id')\n  .get((req, res) => {\n    const book = books.find(b => b.id === Number(req.params.id));\n    if (!book) return res.status(404).json({ error: 'Book not found' });\n    res.json(book);\n  })\n  .put((req, res) => {                         // replace the whole book\n    const index = books.findIndex(b => b.id === Number(req.params.id));\n    if (index === -1) return res.status(404).json({ error: 'Book not found' });\n    books[index] = { id: books[index].id, ...req.body };\n    res.json(books[index]);\n  })\n  .patch((req, res) => {                       // update only some fields\n    const book = books.find(b => b.id === Number(req.params.id));\n    if (!book) return res.status(404).json({ error: 'Book not found' });\n    Object.assign(book, req.body);\n    res.json(book);\n  })\n  .delete((req, res) => {\n    books = books.filter(b => b.id !== Number(req.params.id));\n    res.sendStatus(204);\n  });\n\n// app.all() matches every method (here: tell clients about the API version)\napp.all('/api/version', (req, res) => res.json({ method: req.method, version: '1.0' }));\n\napp.listen(3000, () => console.log('Server running on port 3000'));";

const PARAMS_APP = "const express = require('express');\nconst app = express();\n\nconst users = [\n  { id: 1, name: 'Asha', orders: [{ id: 101, item: 'Laptop' }, { id: 102, item: 'Mouse' }] },\n  { id: 2, name: 'Ravi', orders: [{ id: 201, item: 'Phone' }] },\n];\n\n// several params in one path\napp.get('/api/users/:userId/orders/:orderId', (req, res) => {\n  const { userId, orderId } = req.params;            // always strings\n  const user = users.find(u => u.id === Number(userId));\n  if (!user) return res.status(404).json({ error: `User ${userId} not found` });\n  const order = user.orders.find(o => o.id === Number(orderId));\n  if (!order) return res.status(404).json({ error: `Order ${orderId} not found for ${user.name}` });\n  res.json({ params: req.params, user: user.name, order });\n});\n\n// validate a numeric id\napp.get('/api/users/:id', (req, res) => {\n  const id = Number(req.params.id);\n  if (!Number.isInteger(id) || id <= 0) {\n    return res.status(400).json({ error: 'id must be a positive integer', received: req.params.id });\n  }\n  const user = users.find(u => u.id === id);\n  if (!user) return res.status(404).json({ error: `User ${id} not found` });\n  res.json({ id: user.id, name: user.name, orderCount: user.orders.length });\n});\n\n// optional param (Express 5 braces) and a param with a hyphen-separated pair\napp.get('/api/flights/:from-:to{/:date}', (req, res) => {\n  res.json(req.params);\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));";

const QUERY_APP = "const express = require('express');\nconst app = express();\n\nconst products = [\n  { id: 1, name: 'Wireless Mouse', category: 'electronics', price: 799, rating: 4.3 },\n  { id: 2, name: 'Notebook', category: 'stationery', price: 60, rating: 4.8 },\n  { id: 3, name: 'USB-C Cable', category: 'electronics', price: 299, rating: 4.1 },\n  { id: 4, name: 'Desk Lamp', category: 'home', price: 1299, rating: 4.6 },\n  { id: 5, name: 'Keyboard', category: 'electronics', price: 1499, rating: 4.5 },\n  { id: 6, name: 'Gel Pens', category: 'stationery', price: 120, rating: 4.0 },\n];\n\napp.get('/api/products', (req, res) => {\n  // req.query values are strings (or arrays); read them into local variables\n  const { category, q, sort = 'id', order = 'asc' } = req.query;\n  const minPrice = Number(req.query.minPrice) || 0;\n  const maxPrice = Number(req.query.maxPrice) || Infinity;\n  const page = Math.max(1, Number(req.query.page) || 1);\n  const limit = Math.min(50, Number(req.query.limit) || 3);\n\n  let result = products.filter(p =>\n    (!category || p.category === category) &&\n    (!q || p.name.toLowerCase().includes(String(q).toLowerCase())) &&\n    p.price >= minPrice && p.price <= maxPrice\n  );\n\n  const dir = order === 'desc' ? -1 : 1;\n  result = [...result].sort((a, b) => (a[sort] > b[sort] ? dir : a[sort] < b[sort] ? -dir : 0));\n\n  const total = result.length;\n  const data = result.slice((page - 1) * limit, page * limit).map(p => `${p.name} (${p.price})`);\n  res.json({ page, limit, total, pages: Math.ceil(total / limit), data });\n});\n\napp.get('/api/debug-query', (req, res) => {\n  res.json({ query: req.query, typeOfPage: typeof req.query.page });\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));";

const ORDER_APP = "const express = require('express');\nconst app = express();\n\n// 1. Specific route BEFORE the parameter route\napp.get('/api/users/me', (req, res) => {\n  res.json({ route: 'current user profile' });\n});\n\napp.get('/api/users/:id', (req, res) => {\n  res.json({ route: 'user by id', id: req.params.id });\n});\n\n// 2. This route is registered AFTER /:id, so it can never be reached\napp.get('/api/users/admins', (req, res) => {\n  res.json({ route: 'admins list (unreachable!)' });\n});\n\n// 3. Paths are case-insensitive and ignore a trailing slash by default\napp.get('/api/Health', (req, res) => res.json({ status: 'up' }));\n\n// 4. Catch-all 404 must be last\napp.use((req, res) => {\n  res.status(404).json({ error: 'Route not found', method: req.method, path: req.originalUrl });\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));";

const MOVIES_APP = "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nlet movies = [\n  { id: 1, title: 'Inception', genre: 'sci-fi', year: 2010 },\n  { id: 2, title: '3 Idiots', genre: 'comedy', year: 2009 },\n  { id: 3, title: 'Interstellar', genre: 'sci-fi', year: 2014 },\n];\nlet nextId = 4;\nconst findMovie = id => movies.find(m => m.id === Number(id));\n\n// GET /api/movies?genre=sci-fi&year=2014\napp.get('/api/movies', (req, res) => {\n  const { genre, year } = req.query;\n  res.json(movies.filter(m => (!genre || m.genre === genre) && (!year || m.year === Number(year))));\n});\n\napp.get('/api/movies/:id', (req, res) => {\n  const movie = findMovie(req.params.id);\n  if (!movie) return res.status(404).json({ error: 'Movie not found' });\n  res.json(movie);\n});\n\napp.post('/api/movies', (req, res) => {\n  const { title, genre, year } = req.body ?? {};\n  if (!title || !genre || !year) return res.status(400).json({ error: 'title, genre and year are required' });\n  const movie = { id: nextId++, title, genre, year: Number(year) };\n  movies.push(movie);\n  res.status(201).json(movie);\n});\n\napp.patch('/api/movies/:id', (req, res) => {\n  const movie = findMovie(req.params.id);\n  if (!movie) return res.status(404).json({ error: 'Movie not found' });\n  const { title, genre, year } = req.body ?? {};\n  if (title !== undefined) movie.title = title;\n  if (genre !== undefined) movie.genre = genre;\n  if (year !== undefined) movie.year = Number(year);\n  res.json(movie);\n});\n\napp.delete('/api/movies/:id', (req, res) => {\n  if (!findMovie(req.params.id)) return res.status(404).json({ error: 'Movie not found' });\n  movies = movies.filter(m => m.id !== Number(req.params.id));\n  res.status(204).end();\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));";

export default {
  id: 'day-10-routing-methods-params-query-strings',
  title: 'Routing in Express: Route Methods, Route Parameters and Query Strings',
  module: 'Module 2: Express.js',
  day: 10,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Master Express routing: the HTTP route methods (get, post, put, patch, delete, all) and app.route(), route parameters with req.params (multiple, validated, optional), query strings with req.query for filtering, sorting and pagination, and how route order decides which handler runs.',
  objectives: [
    'Map CRUD operations to HTTP methods and REST-style URLs',
    'Use app.get / post / put / patch / delete / all and group them with app.route()',
    'Read and validate route parameters with req.params (including several params and optional segments)',
    'Implement filtering, searching, sorting and pagination with req.query',
    'Explain route matching order, the 404 catch-all and Express 5 path rules',
  ],
  theory: [
    {
      heading: 'What is routing?',
      content:
        '**Routing** decides **which code runs for which request**, based on two things: the **HTTP method** and the **URL path**. A route in Express is:\n\n`app.METHOD(PATH, HANDLER)`\n\nAnalogy: a **receptionist** in an office building. "I want to DELIVER a parcel to the ACCOUNTS department" → method POST, path /accounts. The receptionist (router) looks at both and sends you to the right desk (handler). If no desk matches, you hear "sorry, no such department" (404).\n\nIn a **REST API**, URLs name **resources** (nouns, plural) and methods say what to do:\n\n- `GET /api/books` list, `GET /api/books/7` read one\n- `POST /api/books` create\n- `PUT /api/books/7` replace, `PATCH /api/books/7` partial update\n- `DELETE /api/books/7` remove\n\nAvoid verbs in URLs like `/api/getBooks` or `/api/deleteBook?id=7`; the method already is the verb.',
    },
    {
      heading: 'Route methods, app.all and app.route',
      content:
        'Express has a function for every HTTP method: `app.get`, `app.post`, `app.put`, `app.patch`, `app.delete`, plus `app.head` and `app.options` (handled automatically in most cases).\n\n- `app.all(path, handler)` matches **every** method for that path; useful for logging, auth checks or "method not supported" responses on a path\n- `app.route(path)` returns a chainable object, so you write the path **once** and attach handlers for each method: `app.route(\'/api/books\').get(...).post(...)`. Less duplication, fewer typos\n- A handler can have **several callbacks** (`app.get(path, checkAuth, handler)`), which is middleware (Day 11)\n\nPUT vs PATCH: PUT **replaces** the whole resource (missing fields are removed); PATCH **changes only the fields you send**. GET, PUT and DELETE are **idempotent** (repeating them has the same effect); POST is not (each call creates a new item).',
    },
    {
      heading: 'Route parameters: req.params',
      content:
        'A **route parameter** is a named part of the path that starts with a colon: `/api/users/:id`. Express captures the actual value into **req.params**:\n\n- `/api/users/42` → `req.params.id === \'42\'` (a **string**, convert with `Number()`)\n- Several params: `/api/users/:userId/orders/:orderId` → `{ userId, orderId }`\n- Param names use letters, digits and underscore; a hyphen or dot can separate two params: `/flights/:from-:to`\n- **Express 5 optional segments** use braces: `/docs{/:section}` matches `/docs` and `/docs/intro`\n- **Express 5 wildcards** must be named: `/files/*filepath` (value is an array of segments)\n\nAlways **validate** params: `Number(\'abc\')` is `NaN` and should produce **400 Bad Request**, while a valid id that does not exist produces **404 Not Found**.\n\nUse params to **identify a specific resource** (`/books/7`); use query strings to **filter, sort or paginate** a list.',
      syntax:
        "app.get('/api/users/:userId/orders/:orderId', (req, res) => {\n  const { userId, orderId } = req.params; // strings\n  res.json({ userId: Number(userId), orderId: Number(orderId) });\n});",
    },
    {
      heading: 'Query strings: req.query',
      content:
        'The **query string** is everything after `?` in a URL: `/api/products?category=books&sort=price&page=2`. Express parses it into **req.query**:\n\n```\n{ category: \'books\', sort: \'price\', page: \'2\' }\n```\n\n- Values are **strings**; a repeated key (`?tag=a&tag=b`) becomes an **array**\n- A missing key is `undefined`, so provide **defaults**: `const page = Number(req.query.page) || 1`\n- Clamp user input: `Math.min(50, limit)` stops someone requesting a million rows\n- Common uses: **filtering** (`?category=`), **search** (`?q=`), **sorting** (`?sort=price&order=desc`), **pagination** (`?page=2&limit=10`), field selection\n- **Express 5**: `req.query` is a read-only getter (assigning to it has no effect); copy values into your own variables. The default "simple" parser does not create nested objects from `a[b]=1`\n\nPagination formula: `skip = (page - 1) * limit`, then `items.slice(skip, skip + limit)`, and return metadata (`page`, `limit`, `total`, `pages`) so the front end can render page buttons.',
    },
    {
      heading: 'Route order and matching rules',
      content:
        'Express checks routes **in the order they are registered** and runs the **first match**:\n\n1. Put **specific** routes (`/users/me`, `/users/admins`) **before** parameter routes (`/users/:id`), otherwise `:id` swallows "me"\n2. Put the **404 catch-all** (`app.use((req, res) => ...)`) **after** all routes\n3. By default paths are **case-insensitive** (`/API/Health` matches `/api/health`) and a **trailing slash** is ignored (`/about/` matches `/about`); enable `app.set(\'case sensitive routing\', true)` or `\'strict routing\'` to change this\n4. The query string is **not** part of route matching: `/api/books?x=1` matches `/api/books`\n5. `req.path` is the path without the query; `req.originalUrl` is the full original URL\n\nComing next (Day 11): middleware, the functions that run before your route handlers.',
      tip: 'Design URLs before writing code: list your resources, then for each one write the five REST routes. A clean, predictable URL design is one of the first things interviewers and API consumers notice.',
    },
  ],
  examples: [
    {
      title: 'All route methods with app.route() and app.all()',
      scenario: 'A bookstore API that supports listing, creating, reading, replacing, partially updating and deleting books.',
      steps: [
        'Create `books.js` with the code and run `node --watch books.js`',
        'Send the requests in order (API Lab, Postman, Thunder Client or curl)',
        'Compare PUT (replace: author disappears) with PATCH (only price changes)',
      ],
      code: METHODS_APP,
      api: {
        code: METHODS_APP,
        requests: [
          { method: 'GET', url: '/api/books' },
          { method: 'POST', url: '/api/books', body: { title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', price: 899 } },
          { method: 'PATCH', url: '/api/books/1', body: { price: 449 } },
          { method: 'PUT', url: '/api/books/2', body: { title: 'Deep Work (2nd ed.)', price: 450 } },
          { method: 'DELETE', url: '/api/books/3' },
          { method: 'GET', url: '/api/books' },
          { method: 'GET', url: '/api/books/3' },
          { method: 'DELETE', url: '/api/version' },
        ],
      },
      result: "GET /api/books → 200 [{\"id\":1,\"title\":\"Atomic Habits\",\"author\":\"James Clear\",\"price\":499},{\"id\":2,\"title\":\"Deep Work\",\"author\":\"Cal Newport\",\"price\":399}]\nPOST /api/books → 201 {\"id\":3,\"title\":\"The Pragmatic Programmer\",\"author\":\"Hunt & Thomas\",\"price\":899}\nPATCH /api/books/1 → 200 {\"id\":1,\"title\":\"Atomic Habits\",\"author\":\"James Clear\",\"price\":449}\nPUT /api/books/2 → 200 {\"id\":2,\"title\":\"Deep Work (2nd ed.)\",\"price\":450}\nDELETE /api/books/3 → 204\nGET /api/books → 200 [{\"id\":1,\"title\":\"Atomic Habits\",\"author\":\"James Clear\",\"price\":449},{\"id\":2,\"title\":\"Deep Work (2nd ed.)\",\"price\":450}]\nGET /api/books/3 → 404 {\"error\":\"Book not found\"}\nDELETE /api/version → 200 {\"method\":\"DELETE\",\"version\":\"1.0\"}",
      explanation:
        '`app.route()` attaches GET/POST to `/api/books` and GET/PUT/PATCH/DELETE to `/api/books/:id` without repeating the path. PATCH merged `{ price: 449 }` into book 1, keeping the other fields. PUT replaced book 2 completely, so its `author` is gone, which is the real difference between PUT and PATCH. DELETE answers 204 with no body. `app.all` matched the DELETE request to `/api/version` and reported the method.',
    },
    {
      title: 'Route parameters: multiple, validated and optional',
      scenario: 'Fetch a specific order of a specific user, validate ids, and see optional and hyphen-separated params.',
      steps: [
        'Create `params.js` and run it',
        'Request a nested user/order path, then invalid and missing ids',
        'Try the flights route with and without the optional date',
      ],
      code: PARAMS_APP,
      api: {
        code: PARAMS_APP,
        requests: [
          { method: 'GET', url: '/api/users/1/orders/102' },
          { method: 'GET', url: '/api/users/2/orders/999' },
          { method: 'GET', url: '/api/users/2' },
          { method: 'GET', url: '/api/users/abc' },
          { method: 'GET', url: '/api/users/7' },
          { method: 'GET', url: '/api/flights/PNQ-DEL' },
          { method: 'GET', url: '/api/flights/BOM-BLR/2025-12-24' },
        ],
      },
      result: "GET /api/users/1/orders/102 → 200 {\"params\":{\"userId\":\"1\",\"orderId\":\"102\"},\"user\":\"Asha\",\"order\":{\"id\":102,\"item\":\"Mouse\"}}\nGET /api/users/2/orders/999 → 404 {\"error\":\"Order 999 not found for Ravi\"}\nGET /api/users/2 → 200 {\"id\":2,\"name\":\"Ravi\",\"orderCount\":1}\nGET /api/users/abc → 400 {\"error\":\"id must be a positive integer\",\"received\":\"abc\"}\nGET /api/users/7 → 404 {\"error\":\"User 7 not found\"}\nGET /api/flights/PNQ-DEL → 200 {\"from\":\"PNQ\",\"to\":\"DEL\"}\nGET /api/flights/BOM-BLR/2025-12-24 → 200 {\"from\":\"BOM\",\"to\":\"BLR\",\"date\":\"2025-12-24\"}",
      explanation:
        '`req.params` holds every named segment as a string, so ids are converted with `Number()` before comparing. "abc" fails validation and returns 400 (bad input), while 7 is a valid id that does not exist and returns 404 (not found). The flights route shows two params split by a hyphen and an optional Express 5 `{/:date}` segment that is simply absent from req.params when not provided.',
    },
    {
      title: 'Filtering, searching, sorting and pagination with req.query',
      scenario: 'A product list endpoint that supports ?category, ?q, price range, ?sort / ?order and ?page / ?limit, with safe defaults.',
      steps: [
        'Create `products.js` and run it',
        'Call /api/products with different query strings',
        'Look at /api/debug-query to see exactly what Express parsed (strings and arrays)',
      ],
      code: QUERY_APP,
      api: {
        code: QUERY_APP,
        requests: [
          { method: 'GET', url: '/api/products' },
          { method: 'GET', url: '/api/products?page=2' },
          { method: 'GET', url: '/api/products?category=electronics&sort=price&order=desc' },
          { method: 'GET', url: '/api/products?minPrice=100&maxPrice=1000&sort=rating&order=desc&limit=10' },
          { method: 'GET', url: '/api/products?q=pen' },
          { method: 'GET', url: '/api/debug-query?page=2&tag=new&tag=sale&q=lamp' },
        ],
      },
      result: "GET /api/products → 200 {\"page\":1,\"limit\":3,\"total\":6,\"pages\":2,\"data\":[\"Wireless Mouse (799)\",\"Notebook (60)\",\"USB-C Cable (299)\"]}\nGET /api/products?page=2 → 200 {\"page\":2,\"limit\":3,\"total\":6,\"pages\":2,\"data\":[\"Desk Lamp (1299)\",\"Keyboard (1499)\",\"Gel Pens (120)\"]}\nGET /api/products?category=electronics&sort=price&order=desc → 200 {\"page\":1,\"limit\":3,\"total\":3,\"pages\":1,\"data\":[\"Keyboard (1499)\",\"Wireless Mouse (799)\",\"USB-C Cable (299)\"]}\nGET /api/products?minPrice=100&maxPrice=1000&sort=rating&order=desc&limit=10 → 200 {\"page\":1,\"limit\":10,\"total\":3,\"pages\":1,\"data\":[\"Wireless Mouse (799)\",\"USB-C Cable (299)\",\"Gel Pens (120)\"]}\nGET /api/products?q=pen → 200 {\"page\":1,\"limit\":3,\"total\":1,\"pages\":1,\"data\":[\"Gel Pens (120)\"]}\nGET /api/debug-query?page=2&tag=new&tag=sale&q=lamp → 200 {\"query\":{\"page\":\"2\",\"tag\":[\"new\",\"sale\"],\"q\":\"lamp\"},\"typeOfPage\":\"string\"}",
      explanation:
        'Without any query, defaults apply: page 1, limit 3, sorted by id. Every filter is optional (`!category ||` skips it when absent). Numbers are converted and clamped (`limit` max 50). The response includes pagination metadata (total, pages) so a front end can render page buttons. The debug route proves that query values are strings and that a repeated key (`tag`) becomes an array.',
    },
    {
      title: 'Route order, specific vs parameter routes, and the 404 catch-all',
      scenario: 'Understand why /api/users/me must come before /api/users/:id, and how Express treats case and trailing slashes.',
      steps: [
        'Create `order.js` and run it',
        'Request /api/users/me, /api/users/42 and /api/users/admins',
        'Request /API/health/ (different case + trailing slash) and an unknown path with a query string',
      ],
      code: ORDER_APP,
      api: {
        code: ORDER_APP,
        requests: [
          { method: 'GET', url: '/api/users/me' },
          { method: 'GET', url: '/api/users/42' },
          { method: 'GET', url: '/api/users/admins' },
          { method: 'GET', url: '/API/health/' },
          { method: 'POST', url: '/api/users/me' },
          { method: 'GET', url: '/api/unknown?x=1' },
        ],
      },
      result: "GET /api/users/me → 200 {\"route\":\"current user profile\"}\nGET /api/users/42 → 200 {\"route\":\"user by id\",\"id\":\"42\"}\nGET /api/users/admins → 200 {\"route\":\"user by id\",\"id\":\"admins\"}\nGET /API/health/ → 200 {\"status\":\"up\"}\nPOST /api/users/me → 404 {\"error\":\"Route not found\",\"method\":\"POST\",\"path\":\"/api/users/me\"}\nGET /api/unknown?x=1 → 404 {\"error\":\"Route not found\",\"method\":\"GET\",\"path\":\"/api/unknown?x=1\"}",
      explanation:
        '`/api/users/me` matched its own route because it was registered first. `/api/users/admins` was captured by `/:id` (id = "admins") because that route comes earlier, so the admins route is dead code; move it above `/:id` to fix it. `/API/health/` still matched `/api/Health` because routing is case-insensitive and ignores a trailing slash by default. POST to a GET-only path and unknown paths fall through to the catch-all 404, and `req.originalUrl` includes the query string.',
    },
    {
      title: 'Mini project: Movies API combining params and query',
      scenario: 'A complete movies resource: list with ?genre and ?year filters, get one, create with validation, partial update and delete.',
      steps: [
        'Create `movies.js` and run it',
        'Filter the list with query strings',
        'Create, update and delete a movie, checking status codes (201, 200, 204, 404, 400)',
      ],
      code: MOVIES_APP,
      api: {
        code: MOVIES_APP,
        requests: [
          { method: 'GET', url: '/api/movies?genre=sci-fi' },
          { method: 'GET', url: '/api/movies?genre=sci-fi&year=2014' },
          { method: 'POST', url: '/api/movies', body: { title: 'Dangal', genre: 'drama', year: '2016' } },
          { method: 'POST', url: '/api/movies', body: { title: 'Untitled' } },
          { method: 'PATCH', url: '/api/movies/2', body: { genre: 'comedy-drama' } },
          { method: 'DELETE', url: '/api/movies/1' },
          { method: 'GET', url: '/api/movies/1' },
          { method: 'GET', url: '/api/movies' },
        ],
      },
      result: "GET /api/movies?genre=sci-fi → 200 [{\"id\":1,\"title\":\"Inception\",\"genre\":\"sci-fi\",\"year\":2010},{\"id\":3,\"title\":\"Interstellar\",\"genre\":\"sci-fi\",\"year\":2014}]\nGET /api/movies?genre=sci-fi&year=2014 → 200 [{\"id\":3,\"title\":\"Interstellar\",\"genre\":\"sci-fi\",\"year\":2014}]\nPOST /api/movies → 201 {\"id\":4,\"title\":\"Dangal\",\"genre\":\"drama\",\"year\":2016}\nPOST /api/movies → 400 {\"error\":\"title, genre and year are required\"}\nPATCH /api/movies/2 → 200 {\"id\":2,\"title\":\"3 Idiots\",\"genre\":\"comedy-drama\",\"year\":2009}\nDELETE /api/movies/1 → 204\nGET /api/movies/1 → 404 {\"error\":\"Movie not found\"}\nGET /api/movies → 200 [{\"id\":2,\"title\":\"3 Idiots\",\"genre\":\"comedy-drama\",\"year\":2009},{\"id\":3,\"title\":\"Interstellar\",\"genre\":\"sci-fi\",\"year\":2014},{\"id\":4,\"title\":\"Dangal\",\"genre\":\"drama\",\"year\":2016}]",
      explanation:
        'The list route uses req.query for optional filters while single-item routes use req.params to identify the movie. POST validates required fields (400) and converts year to a number before saving (201). PATCH only changes fields that were sent. DELETE returns 204, and a later GET for the same id correctly returns 404. On Day 13 you will split such a file into routes, controllers and services.',
    },
  ],
  interview: [
    { q: 'What is routing in Express?', a: 'Mapping an HTTP method and URL path to a handler function: app.METHOD(path, handler). Express checks routes in registration order and runs the first match.', level: 'Easy' },
    { q: 'Difference between req.params and req.query?', a: 'req.params holds named path segments defined in the route (/users/:id → req.params.id) and identifies a specific resource. req.query holds key-value pairs from the query string after ? and is used for optional filtering, sorting, searching and pagination. Both contain strings.', level: 'Easy' },
    { q: 'Difference between PUT and PATCH?', a: 'PUT replaces the entire resource with the request body (fields not sent are removed) and is idempotent. PATCH partially updates only the fields provided.', level: 'Easy' },
    { q: 'What does app.route() do?', a: 'Returns a single route instance for a path, so you can chain handlers for different methods (.get().post().put()) without repeating the path string.', level: 'Easy' },
    { q: 'What does app.all() do?', a: 'Registers a handler for a path that matches every HTTP method. Common for path-wide checks or logging, or for returning 405 for unsupported methods.', level: 'Medium' },
    { q: 'Why does /users/me return the wrong handler when /users/:id is defined first?', a: 'Routes match in order, and :id matches any segment including "me". Define the static route /users/me before the parameter route.', level: 'Medium' },
    { q: 'What status codes should a GET /items/:id route return?', a: '200 with the item when found, 404 when the id is valid but no item exists, 400 when the id is malformed (e.g. not a number), and 500 for unexpected server errors.', level: 'Medium' },
    { q: 'How do you implement pagination with query strings?', a: 'Read page and limit from req.query with defaults and limits (page >= 1, limit <= 50), compute skip = (page - 1) * limit, return items.slice(skip, skip + limit) (or .skip().limit() in a DB) plus metadata: page, limit, total, total pages.', level: 'Medium' },
    { q: 'What changed about req.query and route paths in Express 5?', a: 'req.query is a read-only getter and uses the simple parser by default. Path syntax uses path-to-regexp v8: optional segments with braces ({/:id}), named wildcards (/*splat), and no regex characters inside string paths.', level: 'Hard' },
    { q: 'What is an idempotent HTTP method?', a: 'A method where making the same request many times has the same effect as making it once: GET, PUT, DELETE, HEAD, OPTIONS. POST is not idempotent because each call can create a new resource.', level: 'Medium' },
    { q: 'Are Express routes case-sensitive?', a: 'Not by default: /About matches /about, and a trailing slash is ignored. Enable app.set("case sensitive routing", true) and app.set("strict routing", true) to change that.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create GET /api/square/:n that returns { n, square } and responds 400 with an error message if n is not a number.',
      hint: 'const n = Number(req.params.n); Number.isNaN(n).',
      solution: "app.get('/api/square/:n', (req, res) => {\n  const n = Number(req.params.n);\n  if (Number.isNaN(n)) return res.status(400).json({ error: 'n must be a number' });\n  res.json({ n, square: n * n });\n});\n// GET /api/square/12 -> {\"n\":12,\"square\":144}",
    },
    {
      task: 'Create GET /api/students?course=<name>&minMarks=<n> that filters an in-memory student array by course (optional) and minimum marks (optional, default 0).',
      hint: 'Use the "!value ||" trick so each filter is optional.',
      solution: "const students = [\n  { name: 'Asha', course: 'node', marks: 82 },\n  { name: 'Ravi', course: 'react', marks: 67 },\n  { name: 'Meera', course: 'node', marks: 58 },\n];\napp.get('/api/students', (req, res) => {\n  const { course } = req.query;\n  const minMarks = Number(req.query.minMarks) || 0;\n  res.json(students.filter(s => (!course || s.course === course) && s.marks >= minMarks));\n});\n// GET /api/students?course=node&minMarks=60 -> [{\"name\":\"Asha\",\"course\":\"node\",\"marks\":82}]",
    },
    {
      task: 'Add pagination to a list of 25 generated items: GET /api/items?page=&limit= with default limit 5 and maximum 20. Return { page, limit, total, pages, items }.',
      hint: 'Array.from({ length: 25 }, (_, i) => ({ id: i + 1 })) and slice.',
      solution: "const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));\napp.get('/api/items', (req, res) => {\n  const page = Math.max(1, Number(req.query.page) || 1);\n  const limit = Math.min(20, Number(req.query.limit) || 5);\n  const start = (page - 1) * limit;\n  res.json({ page, limit, total: items.length, pages: Math.ceil(items.length / limit), items: items.slice(start, start + limit) });\n});\n// GET /api/items?page=3 -> items 11..15, pages: 5",
    },
    {
      task: 'Using app.route(), build /api/todos (GET, POST) and /api/todos/:id (GET, PATCH to toggle "done", DELETE) with proper 201 / 204 / 404 responses.',
      hint: 'PATCH can set todo.done = !todo.done when no body is sent.',
      solution: "app.use(express.json());\nlet todos = [{ id: 1, title: 'Learn routing', done: false }];\nlet nextId = 2;\napp.route('/api/todos')\n  .get((req, res) => res.json(todos))\n  .post((req, res) => {\n    const { title } = req.body ?? {};\n    if (!title) return res.status(400).json({ error: 'title is required' });\n    const todo = { id: nextId++, title, done: false };\n    todos.push(todo);\n    res.status(201).json(todo);\n  });\napp.route('/api/todos/:id')\n  .get((req, res) => {\n    const todo = todos.find(t => t.id === Number(req.params.id));\n    todo ? res.json(todo) : res.status(404).json({ error: 'Not found' });\n  })\n  .patch((req, res) => {\n    const todo = todos.find(t => t.id === Number(req.params.id));\n    if (!todo) return res.status(404).json({ error: 'Not found' });\n    todo.done = req.body?.done ?? !todo.done;\n    res.json(todo);\n  })\n  .delete((req, res) => {\n    const before = todos.length;\n    todos = todos.filter(t => t.id !== Number(req.params.id));\n    if (todos.length === before) return res.status(404).json({ error: 'Not found' });\n    res.sendStatus(204);\n  });",
    },
    {
      task: 'Design (just write the method + URL list) a REST API for a library with books, members and loans, including "all loans of one member" and "return a loan".',
      hint: 'Nouns in plural, nested resources for relationships, methods as verbs.',
      solution: "GET    /api/books                 list books (?author=&available=true&page=)\nGET    /api/books/:id             one book\nPOST   /api/books                 add book\nPUT    /api/books/:id             replace book\nPATCH  /api/books/:id             update some fields\nDELETE /api/books/:id             remove book\n\nGET    /api/members               list members\nGET    /api/members/:id           one member\nPOST   /api/members               register member\n\nGET    /api/members/:id/loans     all loans of one member\nPOST   /api/loans                 borrow a book { bookId, memberId }\nPATCH  /api/loans/:id             return a loan { returnedAt }\nGET    /api/loans?status=overdue  filter loans",
    },
  ],
  quiz: [
    { question: 'For the route /api/users/:id and request /api/users/15?tab=orders, what is req.params.id?', options: ['15 (number)', '"15"', '"15?tab=orders"', 'undefined'], answer: 1, explanation: 'Params are strings and the query string is not part of the path.' },
    { question: 'Which object holds "electronics" for GET /api/products?category=electronics?', options: ['req.params', 'req.body', 'req.query', 'req.headers'], answer: 2, explanation: 'Values after ? are parsed into req.query.' },
    { question: 'Routes registered: app.get("/posts/:slug") then app.get("/posts/latest"). What handles GET /posts/latest?', options: ['The /posts/latest route', 'Both, in order', 'Neither; 404', 'The /posts/:slug route'], answer: 3, explanation: 'The first registered match wins, and :slug matches "latest".' },
    { question: 'Which method is used for a partial update of a resource?', options: ['PATCH', 'PUT', 'POST', 'GET'], answer: 0, explanation: 'PATCH changes only the fields sent; PUT replaces the whole resource.' },
    { question: 'How do you write an optional :id segment in Express 5?', options: ["'/user/:id?'", "'/user{/:id}'", "'/user/(:id)'", "'/user/*id?'"], answer: 1, explanation: 'Express 5 uses braces for optional parts; the ? suffix was Express 4 syntax.' },
  ],
};
