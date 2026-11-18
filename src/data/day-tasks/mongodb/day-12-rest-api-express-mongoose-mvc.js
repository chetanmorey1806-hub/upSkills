export default {
  lesson: 'day-12-rest-api-express-mongoose-mvc',
  minutes: 40,
  intro: 'Build a production-style products API: MVC structure, correct status codes, a list endpoint with filter/sort/pagination and central error handling.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In an Express + Mongoose MVC project, where should `Product.find(...)` and the response logic live?',
      options: ['In routes/productRoutes.js next to router.get()', 'In controllers/productController.js', 'In models/Product.js inside the schema', 'In server.js'],
      answer: 1,
      explain: '**Routes** only map URL + method to a controller function. **Controllers** read `req`, call the model and send the response. **Models** define schema, validation, methods. `server.js` connects to the database and starts listening. Thin routes + controllers keep the code testable.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match the correct REST status codes. Which pairs are correct? (choose all that apply)',
      options: [
        'POST created a product → 201 Created',
        'DELETE succeeded, no body → 204 No Content',
        'Product id does not exist → 404 Not Found',
        'Duplicate unique SKU (E11000) → 409 Conflict',
        'Validation failed → 500 Internal Server Error',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Validation problems are the **client\'s** fault: **400 Bad Request** (or 422). 500 is only for unexpected server bugs. 201 for create, 204 for an empty successful delete, 404 for missing resources and 409 for conflicts like duplicate keys.',
    },
    {
      type: 'code',
      lang: 'mongo',
      dataset: 'shop',
      mins: 4,
      q: 'This is the MongoDB query behind `GET /api/products?category=Audio&sort=-price&fields=name,price&page=1&limit=2`. Write it: Audio products, only `name` and `price` (keep `_id`), price **high to low**, page 1 with 2 per page.',
      example: { title: 'query string → find', code: "// ?brand=Apple&sort=rating&limit=3\ndb.products.find({ brand: 'Apple' }).sort({ rating: 1 }).limit(3)" },
      starter: '// Audio, sort -price, fields name,price, page 1, limit 2\n',
      solution: "db.products.find({ category: 'Audio' }, { name: 1, price: 1 }).sort({ price: -1 }).skip(0).limit(2)",
      ordered: true,
      explain: '`sort=-price` means descending (`{ price: -1 }`), `fields=name,price` becomes a projection (Mongoose `.select(\'name price\')`) and page 1 means `skip((1 − 1) × 2) = 0`. The controller builds exactly this from `req.query`, after whitelisting allowed fields.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: 'Build the products **CRUD** in MVC style (in-memory array instead of Mongoose):\n- `GET /api/products` → 200 array\n- `GET /api/products/:id` → 200 product or **404** `{ error: \'Product not found\' }`\n- `POST /api/products` → **201** with `{ id, name, price }` (name and price required, otherwise **400** `{ error: ... }`)\n- `PATCH /api/products/:id` → 200 updated product (404 if missing)\n- `DELETE /api/products/:id` → **204** (404 if missing)\n\nNew ids start at **3** (two products exist).',
      example: { title: 'controller functions + router', code: "const list = (req, res) => res.json(items);\nconst router = express.Router();\nrouter.route('/').get(list).post(create);\nrouter.route('/:id').get(getOne).patch(update).delete(remove);\napp.use('/api/items', router);" },
      starter: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nconst products = [\n  { id: 1, name: 'Pen', price: 10 },\n  { id: 2, name: 'Notebook', price: 60 },\n];\nlet nextId = 3;\n\n// TODO: controllers\n// TODO: router + app.use('/api/products', router)\n\napp.listen(3000);\n",
      solution: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nconst products = [\n  { id: 1, name: 'Pen', price: 10 },\n  { id: 2, name: 'Notebook', price: 60 },\n];\nlet nextId = 3;\n\n// controllers\nconst find = (id) => products.find((p) => p.id === Number(id));\nconst list = (req, res) => res.json(products);\nconst getOne = (req, res) => {\n  const p = find(req.params.id);\n  if (!p) return res.status(404).json({ error: 'Product not found' });\n  res.json(p);\n};\nconst create = (req, res) => {\n  const { name, price } = req.body || {};\n  if (!name || typeof price !== 'number') return res.status(400).json({ error: 'name and price are required' });\n  const p = { id: nextId++, name, price };\n  products.push(p);\n  res.status(201).json(p);\n};\nconst update = (req, res) => {\n  const p = find(req.params.id);\n  if (!p) return res.status(404).json({ error: 'Product not found' });\n  const { name, price } = req.body || {};\n  if (name !== undefined) p.name = name;\n  if (price !== undefined) p.price = price;\n  res.json(p);\n};\nconst remove = (req, res) => {\n  const i = products.findIndex((p) => p.id === Number(req.params.id));\n  if (i === -1) return res.status(404).json({ error: 'Product not found' });\n  products.splice(i, 1);\n  res.status(204).end();\n};\n\n// routes\nconst router = express.Router();\nrouter.route('/').get(list).post(create);\nrouter.route('/:id').get(getOne).patch(update).delete(remove);\napp.use('/api/products', router);\n\napp.listen(3000);\n",
      tests: [
        { name: 'list and get one', steps: [
          { method: 'GET', url: '/api/products', expect: { status: 200, length: 2 } },
          { method: 'GET', url: '/api/products/2', expect: { status: 200, json: { id: 2, name: 'Notebook' } } },
          { method: 'GET', url: '/api/products/9', expect: { status: 404, json: { error: 'Product not found' } } },
        ] },
        { name: 'create → 201, invalid → 400', steps: [
          { method: 'POST', url: '/api/products', body: { name: 'Bag', price: 799 }, expect: { status: 201, json: { id: 3, name: 'Bag', price: 799 } } },
          { method: 'POST', url: '/api/products', body: { name: 'NoPrice' }, expect: { status: 400 } },
          { method: 'GET', url: '/api/products', expect: { status: 200, length: 3 } },
        ] },
        { name: 'patch updates only sent fields', steps: [
          { method: 'PATCH', url: '/api/products/1', body: { price: 12 }, expect: { status: 200, json: { id: 1, name: 'Pen', price: 12 } } },
          { method: 'PATCH', url: '/api/products/9', body: { price: 1 }, expect: { status: 404 } },
        ] },
        { name: 'delete → 204 then 404', steps: [
          { method: 'DELETE', url: '/api/products/1', expect: { status: 204 } },
          { method: 'GET', url: '/api/products/1', expect: { status: 404 } },
          { method: 'GET', url: '/api/products', expect: { status: 200, length: 1 } },
        ] },
      ],
      explain: 'In the Mongoose version each controller is one line longer: `await Product.findById(id)`, `Product.create(req.body)`, `findByIdAndUpdate(id, req.body, { new: true, runValidators: true })`, `findByIdAndDelete(id)`. The status codes and 404 checks stay exactly the same. PATCH changes only the fields that were sent.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: 'List endpoint with query features. `GET /api/products` must support:\n- `?category=Mobiles` (exact match)\n- `?minPrice=` / `?maxPrice=` (numbers, inclusive)\n- `?sort=price` (ascending) or `?sort=-price` (descending)\n- `?page=` and `?limit=` (defaults page 1, limit 3)\n\nRespond `{ total, page, pages, data }` where `total` counts all matches **before** pagination and `pages = Math.ceil(total / limit)`.',
      example: { title: 'reading numbers from req.query', code: "const page = Math.max(1, Number(req.query.page) || 1);\nconst limit = Math.min(50, Number(req.query.limit) || 10);\nconst start = (page - 1) * limit;\nconst data = rows.slice(start, start + limit);" },
      starter: "const express = require('express');\nconst app = express();\n\nconst products = [\n  { id: 1, name: 'iPhone 15', category: 'Mobiles', price: 79900 },\n  { id: 2, name: 'Galaxy S24', category: 'Mobiles', price: 74999 },\n  { id: 3, name: 'Redmi Note 13', category: 'Mobiles', price: 17999 },\n  { id: 4, name: 'MacBook Air', category: 'Laptops', price: 114900 },\n  { id: 5, name: 'IdeaPad Slim 3', category: 'Laptops', price: 45990 },\n  { id: 6, name: 'boAt Airdopes', category: 'Audio', price: 1299 },\n  { id: 7, name: 'JBL Flip 6', category: 'Audio', price: 9999 },\n];\n\napp.get('/api/products', (req, res) => {\n  // TODO: filter, sort, paginate\n  res.json(products);\n});\n\napp.listen(3000);\n",
      solution: "const express = require('express');\nconst app = express();\n\nconst products = [\n  { id: 1, name: 'iPhone 15', category: 'Mobiles', price: 79900 },\n  { id: 2, name: 'Galaxy S24', category: 'Mobiles', price: 74999 },\n  { id: 3, name: 'Redmi Note 13', category: 'Mobiles', price: 17999 },\n  { id: 4, name: 'MacBook Air', category: 'Laptops', price: 114900 },\n  { id: 5, name: 'IdeaPad Slim 3', category: 'Laptops', price: 45990 },\n  { id: 6, name: 'boAt Airdopes', category: 'Audio', price: 1299 },\n  { id: 7, name: 'JBL Flip 6', category: 'Audio', price: 9999 },\n];\n\napp.get('/api/products', (req, res) => {\n  const { category, minPrice, maxPrice, sort } = req.query;\n  let rows = products.filter((p) =>\n    (!category || p.category === category) &&\n    (minPrice === undefined || p.price >= Number(minPrice)) &&\n    (maxPrice === undefined || p.price <= Number(maxPrice)));\n  if (sort === 'price') rows = [...rows].sort((a, b) => a.price - b.price);\n  if (sort === '-price') rows = [...rows].sort((a, b) => b.price - a.price);\n  const page = Math.max(1, Number(req.query.page) || 1);\n  const limit = Math.min(50, Number(req.query.limit) || 3);\n  const total = rows.length;\n  const data = rows.slice((page - 1) * limit, page * limit);\n  res.json({ total, page, pages: Math.ceil(total / limit), data });\n});\n\napp.listen(3000);\n",
      tests: [
        { name: 'defaults: page 1 of 3', steps: [
          { method: 'GET', url: '/api/products', expect: { status: 200, json: { total: 7, page: 1, pages: 3, data: [{ id: 1 }, { id: 2 }, { id: 3 }] } } },
        ] },
        { name: 'category + sort descending', steps: [
          { method: 'GET', url: '/api/products?category=Laptops&sort=-price', expect: { status: 200, json: { total: 2, data: [{ id: 4 }, { id: 5 }] } } },
        ] },
        { name: 'price range + ascending sort', steps: [
          { method: 'GET', url: '/api/products?minPrice=5000&maxPrice=80000&sort=price', expect: { status: 200, json: { total: 5, data: [{ id: 7 }, { id: 3 }, { id: 5 }] } } },
        ] },
        { name: 'page 2 with limit 2', steps: [
          { method: 'GET', url: '/api/products?sort=-price&page=2&limit=2', expect: { status: 200, json: { total: 7, page: 2, pages: 4, data: [{ id: 2 }, { id: 5 }] } } },
        ] },
      ],
      explain: 'Query-string values are always **strings**: convert with `Number()` before comparing, otherwise "5000" > "45990" is compared as text. Count `total` **before** slicing so the frontend can show "Page 2 of 4". With Mongoose: `Product.find(filter).sort(sort).skip(skip).limit(limit)` plus `Product.countDocuments(filter)`.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 8,
      q: 'Central error handling. Add:\n1. a class `AppError extends Error` with a `statusCode`\n2. `GET /api/products/:id` that **throws** `new AppError(\'Product not found\', 404)` for unknown ids (id 1 exists)\n3. a **404 handler** for unknown routes → 404 `{ error: \'Route not found\' }`\n4. an **error middleware** `(err, req, res, next)` → status `err.statusCode || 500` and `{ error: err.message }`',
      example: { title: 'error middleware', code: "app.use((err, req, res, next) => {\n  res.status(err.statusCode || 500).json({ error: err.message });\n});" },
      starter: "const express = require('express');\nconst app = express();\n\nconst products = [{ id: 1, name: 'Pen', price: 10 }];\n\n// TODO: AppError class\n// TODO: GET /api/products/:id\n// TODO: 404 handler, then error middleware\n\napp.listen(3000);\n",
      solution: "const express = require('express');\nconst app = express();\n\nconst products = [{ id: 1, name: 'Pen', price: 10 }];\n\nclass AppError extends Error {\n  constructor(message, statusCode) {\n    super(message);\n    this.statusCode = statusCode;\n  }\n}\n\napp.get('/api/products/:id', (req, res) => {\n  const p = products.find((x) => x.id === Number(req.params.id));\n  if (!p) throw new AppError('Product not found', 404);\n  res.json(p);\n});\n\napp.use((req, res) => res.status(404).json({ error: 'Route not found' }));\n\napp.use((err, req, res, next) => {\n  res.status(err.statusCode || 500).json({ error: err.message });\n});\n\napp.listen(3000);\n",
      tests: [
        { name: 'existing product', steps: [
          { method: 'GET', url: '/api/products/1', expect: { status: 200, json: { id: 1, name: 'Pen' } } },
        ] },
        { name: 'AppError → 404 JSON', steps: [
          { method: 'GET', url: '/api/products/5', expect: { status: 404, json: { error: 'Product not found' } } },
        ] },
        { name: 'unknown route → 404 JSON', steps: [
          { method: 'GET', url: '/api/unknown', expect: { status: 404, json: { error: 'Route not found' } } },
        ] },
      ],
      explain: 'Express recognises error middleware by its **4 parameters** and it must be registered **last**, after the routes and the 404 handler. In Express 5, errors thrown (or rejected promises) inside async controllers reach it automatically, so you do not need try/catch in every controller. Real apps also map CastError → 400, ValidationError → 400 and E11000 → 409 here.',
    },
  ],
};
