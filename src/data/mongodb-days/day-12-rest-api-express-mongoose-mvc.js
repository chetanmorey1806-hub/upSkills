export default {
  id: 'day-12-rest-api-express-mongoose-mvc',
  title: 'Building a REST API with Express + Mongoose: MVC Structure, Controllers, Pagination/Filter/Sort and Error Middleware',
  module: 'Module 4: Mongoose',
  day: 12,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Today you put everything together and build a production-style products API with Express 5 and Mongoose 8: a clean MVC folder structure, thin routes, controllers, a reusable query builder for filtering, sorting, field selection, search and pagination, plus a custom AppError class, 404 handler and central error middleware.',
  objectives: [
    'Organise an Express + Mongoose project into config, models, controllers, routes, middleware and utils',
    'Write CRUD controllers with correct status codes (200, 201, 204, 400, 404, 409)',
    'Build list endpoints that support filtering, price ranges, search, sorting, field selection and pagination with metadata',
    'Handle errors centrally with an AppError class, a 404 handler and Mongoose-aware error middleware (Express 5 async errors)',
    'Translate API query strings into safe Mongoose queries (whitelisting fields, limiting page size)',
  ],
  theory: [
    {
      heading: 'MVC folder structure for an Express + Mongoose API',
      content: `In a REST API there is no HTML "View" – the **JSON response** is the view. The usual layering is:

- **Model** (\`models/\`) – Mongoose schemas and models: shape, validation, indexes, hooks
- **Controller** (\`controllers/\`) – one function per endpoint: read \`req\`, call the model (or a service), send \`res\`
- **Routes** (\`routes/\`) – map URL + HTTP method to a controller; attach middleware (auth, validation)
- **Middleware** (\`middleware/\`) – error handler, 404, auth, validation
- **Utils** (\`utils/\`) – AppError class, APIFeatures / query builder
- **Config** (\`config/\`) – database connection, environment variables

**app.js** creates and configures the Express app (middleware, routes, error handler). **server.js** connects to MongoDB and calls \`app.listen\`. Keeping them separate lets tests (Supertest) import the app without opening a port.

Bigger projects add a **services/** layer between controllers and models for business rules (e.g. "place order" = check stock + create order + decrease stock).`,
      syntax: `shop-api/
├── .env                      # MONGODB_URI, PORT, NODE_ENV
├── package.json              # "type": "commonjs", scripts: dev = node --watch src/server.js
└── src/
    ├── config/db.js          # connectDB()
    ├── models/product.model.js
    ├── controllers/product.controller.js
    ├── routes/product.routes.js
    ├── middleware/
    │   ├── notFound.js
    │   └── errorHandler.js
    ├── utils/
    │   ├── AppError.js
    │   └── apiFeatures.js
    ├── app.js                # express app, routes, error handler
    └── server.js             # connect DB, then app.listen`,
    },
    {
      heading: 'RESTful routes and status codes',
      content: `A resource like products gets five standard endpoints:

| Method | URL | Controller | Success status |
|---|---|---|---|
| GET | /api/v1/products | getProducts (list) | 200 |
| GET | /api/v1/products/:id | getProduct | 200 (404 if missing) |
| POST | /api/v1/products | createProduct | 201 Created |
| PATCH | /api/v1/products/:id | updateProduct | 200 (404 if missing) |
| DELETE | /api/v1/products/:id | deleteProduct | 204 No Content |

Error statuses: **400** bad input / ValidationError / CastError, **401** not logged in, **403** not allowed, **404** not found, **409** duplicate (E11000), **500** unexpected bug.

Use **PATCH** for partial updates (only the sent fields change) and **PUT** for full replacement. Version your API (\`/api/v1\`) so you can change it later without breaking mobile apps.`,
      syntax: `// routes/product.routes.js
const router = require('express').Router();
const c = require('../controllers/product.controller');

router.route('/').get(c.getProducts).post(c.createProduct);
router.route('/:id').get(c.getProduct).patch(c.updateProduct).delete(c.deleteProduct);

module.exports = router;

// app.js
app.use('/api/v1/products', require('./routes/product.routes'));`,
    },
    {
      heading: 'Controllers with Mongoose (and why Express 5 makes them shorter)',
      content: `A controller should be **thin**: read input, call the model, choose the status code. In **Express 4** an error thrown inside an async handler was NOT caught – you needed try/catch or an \`asyncHandler\` wrapper in every controller. **Express 5** automatically forwards rejected promises to the error middleware, so you can simply \`await\` and \`throw\`.

Patterns to follow:
- \`findById\` returns \`null\` for a missing document → throw \`new AppError('Product not found', 404)\`
- Use \`findByIdAndUpdate(id, req.body, { new: true, runValidators: true })\` for PATCH
- **Never pass req.body blindly** when it may contain fields users must not set (\`role\`, \`isAdmin\`, \`stock\`) – pick allowed fields
- Return consistent JSON: \`{ status: 'success', data: ... }\` or just the resource – but be consistent across the API`,
      syntax: `// controllers/product.controller.js  (Express 5 + Mongoose 8)
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');

exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
};

exports.createProduct = async (req, res) => {
  const { name, brand, category, price, stock } = req.body;   // whitelist fields
  const product = await Product.create({ name, brand, category, price, stock });
  res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.status(204).end();
};`,
      tip: 'If your project is still on Express 4, wrap each handler: const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);',
    },
    {
      heading: 'Pagination, filtering, sorting, field selection and search',
      content: `List endpoints must never return "all documents" – a collection may hold millions. A professional list API supports:

- **Filtering**: \`?category=Audio&brand=Sony\` → \`{ category: 'Audio', brand: 'Sony' }\`
- **Ranges**: \`?minPrice=10000&maxPrice=50000\` → \`{ price: { $gte: 10000, $lte: 50000 } }\`
- **Search**: \`?search=air\` → \`{ name: { $regex: 'air', $options: 'i' } }\` (escape regex characters!) or Atlas Search / $text for big data
- **Sorting**: \`?sort=-price,name\` → \`.sort('-price name')\` (minus = descending)
- **Field selection**: \`?fields=name,price\` → \`.select('name price')\`
- **Pagination**: \`?page=2&limit=10\` → \`.skip((page-1)*limit).limit(limit)\` plus a **countDocuments** for metadata: \`{ page, limit, total, totalPages, results }\`

Safety rules:
- **Whitelist** filterable and sortable fields – never spread \`req.query\` into a filter (NoSQL injection, Day 14)
- **Cap limit** (e.g. max 100) and default it (e.g. 10)
- Always include a **unique tie-breaker** in sort (\`_id\`) so pages do not repeat or skip documents
- In **Express 5** \`req.query\` is read-only and the default parser is "simple", so \`?price[gte]=100\` is NOT turned into a nested object – prefer flat names like \`minPrice\`
- For very deep pages, skip becomes slow (it still walks skipped entries) – use **cursor/keyset pagination**: \`?after=<lastId>\` → \`{ _id: { $gt: lastId } }\``,
      syntax: `// utils/buildProductQuery.js
const FILTERS = ['category', 'brand'];
const SORTABLE = ['price', 'name', 'stock', 'createdAt'];
const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

module.exports = function buildProductQuery(q) {
  const filter = {};
  for (const f of FILTERS) if (typeof q[f] === 'string') filter[f] = q[f];
  if (q.minPrice || q.maxPrice) {
    filter.price = {};
    if (q.minPrice) filter.price.$gte = Number(q.minPrice);
    if (q.maxPrice) filter.price.$lte = Number(q.maxPrice);
  }
  if (typeof q.search === 'string' && q.search) filter.name = { $regex: escapeRegex(q.search), $options: 'i' };

  const sort = String(q.sort || '-createdAt').split(',')
    .filter((f) => SORTABLE.includes(f.replace('-', '')))
    .join(' ') + ' _id';
  const fields = q.fields ? String(q.fields).split(',').join(' ') : '-__v';
  const page = Math.max(1, parseInt(q.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(q.limit) || 10));
  return { filter, sort, fields, page, limit, skip: (page - 1) * limit };
};

// controller
exports.getProducts = async (req, res) => {
  const { filter, sort, fields, page, limit, skip } = buildProductQuery(req.query);
  const [items, total] = await Promise.all([
    Product.find(filter).select(fields).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ page, limit, total, totalPages: Math.ceil(total / limit), results: items.length, data: items });
};`,
    },
    {
      heading: 'Central error handling: AppError, 404 handler, error middleware',
      content: `Three pieces give you clean, consistent errors:

1. **AppError class** – extends Error with \`statusCode\` and \`isOperational = true\` (an expected error like "not found", not a bug).
2. **notFound middleware** – registered after all routes; any unmatched URL creates a 404 AppError.
3. **errorHandler middleware** – the LAST \`app.use\`, with **4 parameters** \`(err, req, res, next)\`. It converts Mongoose errors (ValidationError → 400, CastError → 400, 11000 → 409, Day 10) and AppErrors into JSON, and hides details of unknown errors in production.

Order in app.js matters: body parser → routes → notFound → errorHandler.`,
      syntax: `// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
module.exports = AppError;

// middleware/notFound.js
module.exports = (req, res, next) => next(new AppError('Route ' + req.originalUrl + ' not found', 404));

// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.isOperational ? err.message : 'Something went wrong';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  if (err.name === 'CastError') { status = 400; message = 'Invalid ' + err.path + ': ' + err.value; }
  if (err.code === 11000) { status = 409; message = Object.keys(err.keyValue)[0] + ' already exists'; }
  if (status === 500) console.error(err);
  res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};`,
    },
    {
      heading: 'app.js and server.js',
      content: 'Separate the **app** (what the API does) from the **server** (how it starts). server.js loads env variables, connects to MongoDB and only then listens. It also handles graceful shutdown so in-flight requests finish and the Mongo connection closes cleanly – important on platforms like Render or Railway that send SIGTERM on every deploy.',
      syntax: `// src/app.js
const express = require('express');
const app = express();
app.use(express.json({ limit: '10kb' }));        // limit body size
app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/v1/products', require('./routes/product.routes'));
app.use(require('./middleware/notFound'));
app.use(require('./middleware/errorHandler'));
module.exports = app;

// src/server.js
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    const server = app.listen(PORT, () => console.log('API running on port ' + PORT));
    process.on('SIGTERM', () => server.close(() => mongoose.connection.close()));
  })
  .catch((err) => { console.error('DB connection failed', err.message); process.exit(1); });`,
    },
  ],
  examples: [
    {
      title: 'API Lab: full products CRUD in MVC style',
      scenario: 'A single-file simulation of the MVC layout: a fake Product "model" (in-memory, same method names as Mongoose), a controller object, a router mounted at /api/v1/products, AppError, a 404 handler and an error middleware.',
      steps: [
        'Open the API Lab and paste the code',
        'Create a product (201), then try an invalid one (400)',
        'Read, update with PATCH and delete it (200, 200, 204), then read it again (404)',
        'Call an unknown route to see the 404 handler',
      ],
      code: `// In the real project each block below is its own file:
// models/product.model.js, controllers/product.controller.js,
// routes/product.routes.js, utils/AppError.js, middleware/*.js, app.js
// and the fake model is replaced by the Mongoose model:
//   const Product = require('../models/product.model');`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// ===== utils/AppError.js =====
class AppError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; this.isOperational = true; }
}

// ===== models/product.model.js (fake Mongoose model, in memory) =====
const store = [{ _id: 1, name: 'iPhone 15', category: 'Mobiles', price: 79900, stock: 12 }];
let nextId = 2;
const validate = (p) => {
  const errors = {};
  if (!p.name) errors.name = { message: 'Product name is required' };
  if (typeof p.price !== 'number' || p.price < 0) errors.price = { message: 'Price must be a positive number' };
  if (Object.keys(errors).length) throw Object.assign(new Error('Validation failed'), { name: 'ValidationError', errors });
};
const Product = {
  async create(data) {
    const doc = { _id: nextId, stock: 0 };                 // schema default
    for (const k in data) if (data[k] !== undefined) doc[k] = data[k];
    validate(doc); nextId++; store.push(doc); return doc;
  },
  async findById(id) { return store.find((p) => p._id === id) || null; },
  async findByIdAndUpdate(id, update) {
    const doc = store.find((p) => p._id === id);
    if (!doc) return null;
    const next = { ...doc, ...update, _id: doc._id };
    validate(next);                       // like { runValidators: true }
    Object.assign(doc, next);
    return doc;                           // like { new: true }
  },
  async findByIdAndDelete(id) { const i = store.findIndex((p) => p._id === id); return i < 0 ? null : store.splice(i, 1)[0]; },
};

// ===== controllers/product.controller.js =====
const controller = {
  async getProduct(req, res) {
    const p = await Product.findById(Number(req.params.id));
    if (!p) throw new AppError('Product not found', 404);
    res.json(p);
  },
  async createProduct(req, res) {
    const { name, category, price, stock } = req.body;   // whitelist
    res.status(201).json(await Product.create({ name, category, price, stock }));
  },
  async updateProduct(req, res) {
    const p = await Product.findByIdAndUpdate(Number(req.params.id), req.body);
    if (!p) throw new AppError('Product not found', 404);
    res.json(p);
  },
  async deleteProduct(req, res) {
    const p = await Product.findByIdAndDelete(Number(req.params.id));
    if (!p) throw new AppError('Product not found', 404);
    res.status(204).end();
  },
};

// ===== routes/product.routes.js =====
const router = express.Router();
router.post('/', controller.createProduct);
router.route('/:id').get(controller.getProduct).patch(controller.updateProduct).delete(controller.deleteProduct);

// ===== app.js =====
app.use('/api/v1/products', router);
app.use((req, res, next) => next(new AppError('Route ' + req.originalUrl + ' not found', 404)));
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ status: 'error', message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  res.status(err.statusCode || 500).json({ status: 'error', message: err.isOperational ? err.message : 'Something went wrong' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          {
            method: 'POST',
            url: '/api/v1/products',
            body: { name: 'JBL Flip 6', category: 'Audio', price: 9999, isAdmin: true },
          },
          { method: 'POST', url: '/api/v1/products', body: { category: 'Audio', price: -5 } },
          { method: 'GET', url: '/api/v1/products/2' },
          { method: 'PATCH', url: '/api/v1/products/2', body: { price: 8999, stock: 25 } },
          { method: 'PATCH', url: '/api/v1/products/2', body: { price: -1 } },
          { method: 'DELETE', url: '/api/v1/products/2' },
          { method: 'GET', url: '/api/v1/products/2' },
          { method: 'GET', url: '/api/v1/orders' },
        ],
      },
      result: `POST /api/v1/products → 201 {"_id":2,"stock":0,"name":"JBL Flip 6","category":"Audio","price":9999}
POST /api/v1/products → 400 {"status":"error","message":"Product name is required, Price must be a positive number"}
GET /api/v1/products/2 → 200 {"_id":2,"stock":0,"name":"JBL Flip 6","category":"Audio","price":9999}
PATCH /api/v1/products/2 → 200 {"_id":2,"stock":25,"name":"JBL Flip 6","category":"Audio","price":8999}
PATCH /api/v1/products/2 → 400 {"status":"error","message":"Price must be a positive number"}
DELETE /api/v1/products/2 → 204
GET /api/v1/products/2 → 404 {"status":"error","message":"Product not found"}
GET /api/v1/orders → 404 {"status":"error","message":"Route /api/v1/orders not found"}`,
      explanation: 'Controllers never send error responses themselves – they `throw new AppError(...)` and Express 5 forwards the rejected promise to the error middleware. `isAdmin` from the first request is dropped because the controller whitelists fields. The PATCH with price -1 fails validation (like runValidators: true) and the stored document is unchanged. Unknown routes fall through to the 404 middleware.',
    },
    {
      title: 'API Lab: list endpoint with filter, price range, search, sort, fields and pagination',
      scenario: 'Implement GET /api/v1/products with the same query-string contract you would build on Mongoose: category, minPrice/maxPrice, search, sort (=-price,name), fields, page and limit, returning pagination metadata.',
      steps: [
        'Open the API Lab and paste the code',
        'Request page 1 and page 2 with limit=2 sorted by -price and compare',
        'Filter by category and price range, then search by name',
        'Try limit=1000 – it is capped at 5 – and an unknown sort field, which is ignored',
      ],
      code: `// Same contract on Mongoose 8:
const { filter, sort, fields, page, limit, skip } = buildProductQuery(req.query);
const [data, total] = await Promise.all([
  Product.find(filter).select(fields).sort(sort).skip(skip).limit(limit).lean(),
  Product.countDocuments(filter),
]);
res.json({ page, limit, total, totalPages: Math.ceil(total / limit), results: data.length, data });`,
      api: {
        code: `const express = require('express');
const app = express();

const products = [
  { _id: 1, name: 'iPhone 15', brand: 'Apple', category: 'Mobiles', price: 79900, stock: 12 },
  { _id: 2, name: 'Galaxy S24', brand: 'Samsung', category: 'Mobiles', price: 74999, stock: 20 },
  { _id: 3, name: 'Redmi Note 13', brand: 'Xiaomi', category: 'Mobiles', price: 17999, stock: 55 },
  { _id: 4, name: 'MacBook Air M3', brand: 'Apple', category: 'Laptops', price: 114900, stock: 6 },
  { _id: 5, name: 'IdeaPad Slim 3', brand: 'Lenovo', category: 'Laptops', price: 45990, stock: 15 },
  { _id: 7, name: 'boAt Airdopes 141', brand: 'boAt', category: 'Audio', price: 1299, stock: 140 },
  { _id: 8, name: 'Sony WH-1000XM5', brand: 'Sony', category: 'Audio', price: 29990, stock: 9 },
  { _id: 9, name: 'JBL Flip 6', brand: 'JBL', category: 'Audio', price: 9999, stock: 25 },
];

const FILTERS = ['category', 'brand'];
const SORTABLE = ['price', 'name', 'stock'];
const MAX_LIMIT = 5;

function buildQuery(q) {
  const filter = {};
  for (const f of FILTERS) if (typeof q[f] === 'string') filter[f] = q[f];
  const min = Number(q.minPrice), max = Number(q.maxPrice);
  const search = typeof q.search === 'string' ? q.search.toLowerCase() : '';
  const sortFields = String(q.sort || 'name').split(',').filter((f) => SORTABLE.includes(f.replace('-', '')));
  const page = Math.max(1, parseInt(q.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(q.limit) || 3));
  const fields = q.fields ? String(q.fields).split(',') : null;
  return { filter, min, max, search, sortFields, page, limit, fields };
}

app.get('/api/v1/products', (req, res) => {
  const { filter, min, max, search, sortFields, page, limit, fields } = buildQuery(req.query);
  // Product.find(filter)  — price: { $gte, $lte }, name: { $regex, $options: 'i' }
  let rows = products.filter((p) =>
    Object.entries(filter).every(([k, v]) => p[k] === v) &&
    (isNaN(min) || p.price >= min) && (isNaN(max) || p.price <= max) &&
    (!search || p.name.toLowerCase().includes(search)));
  const total = rows.length;
  // .sort('-price name _id')
  rows = [...rows].sort((a, b) => {
    for (const f of [...sortFields, '_id']) {
      const key = f.replace('-', ''), dir = f.startsWith('-') ? -1 : 1;
      if (a[key] < b[key]) return -dir;
      if (a[key] > b[key]) return dir;
    }
    return 0;
  });
  // .skip().limit().select()
  const data = rows.slice((page - 1) * limit, page * limit).map((p) =>
    fields ? Object.fromEntries(['_id', ...fields].filter((f) => f in p).map((f) => [f, p[f]])) : p);
  res.json({ page, limit, total, totalPages: Math.ceil(total / limit), results: data.length, data });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/v1/products?sort=-price&fields=name,price&page=1&limit=2' },
          { method: 'GET', url: '/api/v1/products?sort=-price&fields=name,price&page=2&limit=2' },
          {
            method: 'GET',
            url: '/api/v1/products?category=Mobiles&minPrice=20000&maxPrice=80000&fields=name,price&sort=price',
          },
          { method: 'GET', url: '/api/v1/products?search=AIR&fields=name,brand' },
          { method: 'GET', url: '/api/v1/products?limit=1000&sort=password&fields=name' },
        ],
      },
      result: `GET /api/v1/products?sort=-price&fields=name,price&page=1&limit=2 → 200 {"page":1,"limit":2,"total":8,"totalPages":4,"results":2,"data":[{"_id":4,"name":"MacBook Air M3","price":114900},{"_id":1,"name":"iPhone 15","price":79900}]}
GET /api/v1/products?sort=-price&fields=name,price&page=2&limit=2 → 200 {"page":2,"limit":2,"total":8,"totalPages":4,"results":2,"data":[{"_id":2,"name":"Galaxy S24","price":74999},{"_id":5,"name":"IdeaPad Slim 3","price":45990}]}
GET /api/v1/products?category=Mobiles&minPrice=20000&maxPrice=80000&fields=name,price&sort=price → 200 {"page":1,"limit":3,"total":2,"totalPages":1,"results":2,"data":[{"_id":2,"name":"Galaxy S24","price":74999},{"_id":1,"name":"iPhone 15","price":79900}]}
GET /api/v1/products?search=AIR&fields=name,brand → 200 {"page":1,"limit":3,"total":2,"totalPages":1,"results":2,"data":[{"_id":4,"name":"MacBook Air M3","brand":"Apple"},{"_id":7,"name":"boAt Airdopes 141","brand":"boAt"}]}
GET /api/v1/products?limit=1000&sort=password&fields=name → 200 {"page":1,"limit":5,"total":8,"totalPages":2,"results":5,"data":[{"_id":1,"name":"iPhone 15"},{"_id":2,"name":"Galaxy S24"},{"_id":3,"name":"Redmi Note 13"},{"_id":4,"name":"MacBook Air M3"},{"_id":5,"name":"IdeaPad Slim 3"}]}`,
      explanation: 'The API turns flat query-string values into a filter object, a sort list and a page window – exactly the pieces you pass to Product.find().sort().skip().limit(). Unknown sort fields are ignored (whitelist), `limit` is capped, and `_id` is always appended to the sort as a tie-breaker so pages are stable. The metadata (total, totalPages) lets the React frontend render page buttons.',
    },
    {
      title: 'The MongoDB query behind page 2',
      scenario: 'GET /api/v1/products?category=Mobiles,Laptops&minPrice=20000&maxPrice=100000&sort=-price&page=2&limit=2&fields=name,price. Run the exact find + countDocuments Mongoose would send.',
      steps: [
        'Open the shop dataset',
        'Build the filter with $in for the two categories and $gte/$lte for price',
        'Apply sort({ price: -1, _id: 1 }), skip((page-1)*limit) and limit(limit) with page 2, limit 2',
        'Run countDocuments(filter) for the pagination metadata',
      ],
      code: `const filter = { category: { $in: ['Mobiles', 'Laptops'] }, price: { $gte: 20000, $lte: 100000 } }
const page = 2, limit = 2
db.products.find(filter, { name: 1, price: 1 }).sort({ price: -1, _id: 1 }).skip((page - 1) * limit).limit(limit)
db.products.countDocuments(filter)`,
      mongo: {
        dataset: 'shop',
        query: `const filter = { category: { $in: ['Mobiles', 'Laptops'] }, price: { $gte: 20000, $lte: 100000 } }
const page = 2, limit = 2
db.products.find(filter, { name: 1, price: 1 }).sort({ price: -1, _id: 1 }).skip((page - 1) * limit).limit(limit)
db.products.countDocuments(filter)`,
      },
      result: `{ _id: 6, name: 'Inspiron 15', price: 52990 }
{ _id: 5, name: 'IdeaPad Slim 3', price: 45990 }
4`,
      explanation: 'Four products match (iPhone 15, Galaxy S24, Inspiron 15, IdeaPad Slim 3). Page 1 holds the two most expensive, page 2 the next two, and total = 4 → totalPages = 2. A compound index such as { category: 1, price: -1 } would serve both the filter and the sort (the ESR rule from Day 7).',
    },
    {
      title: 'Case-insensitive search query',
      scenario: 'GET /api/v1/products?search=air&sort=price&fields=name,brand,price. The controller converts search into a case-insensitive $regex on name. Run it in the shell.',
      steps: [
        'Open the shop dataset',
        'Use { name: { $regex: "air", $options: "i" } } as the filter',
        'Project name, brand and price and sort by price ascending',
        'Notice both "Airdopes" and "Air" match because of the i option',
      ],
      code: `db.products.find(
  { name: { $regex: 'air', $options: 'i' } },
  { name: 1, brand: 1, price: 1 }
).sort({ price: 1 })`,
      mongo: {
        dataset: 'shop',
        query: `db.products.find(
  { name: { $regex: 'air', $options: 'i' } },
  { name: 1, brand: 1, price: 1 }
).sort({ price: 1 })`,
      },
      result: `{ _id: 7, brand: 'boAt', name: 'boAt Airdopes 141', price: 1299 }
{ _id: 4, brand: 'Apple', name: 'MacBook Air M3', price: 114900 }`,
      explanation: 'A regex that is not anchored with ^ and is case-insensitive cannot use an index efficiently, so it scans the whole index/collection. That is fine for small catalogues; for large ones use Atlas Search (Day 13) or a text index. Always escape user input before building a regex, otherwise a search like ".*" or a catastrophic pattern can match everything or hang the query.',
    },
    {
      title: 'API Lab: orders API with nested routes and an aggregation-style summary',
      scenario: 'Add GET /api/v1/customers/:customerId/orders (mergeParams) and GET /api/v1/orders/stats that returns the per-status totals – the JSON your controller would return from Order.aggregate([{ $group }]).',
      steps: [
        'Open the API Lab and paste the code',
        'Request orders of customer 101, then of a customer with none',
        'Request /api/v1/orders/stats for the grouped summary',
        'Request orders for customer "abc" to see the 400 error for a malformed id',
      ],
      code: `// Real Mongoose 8 controllers
exports.getCustomerOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.params.customerId }).sort({ orderDate: -1 }).lean();
  res.json({ results: orders.length, data: orders });
};
exports.getOrderStats = async (req, res) => {
  const stats = await Order.aggregate([
    { $group: { _id: '$status', orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
    { $sort: { revenue: -1 } },
  ]);
  res.json(stats);
};
// routes: const router = express.Router({ mergeParams: true });
// app.use('/api/v1/customers/:customerId/orders', orderRouter);`,
      api: {
        code: `const express = require('express');
const app = express();

const orders = [
  { _id: 1001, customerId: 101, status: 'delivered', total: 20597 },
  { _id: 1002, customerId: 102, status: 'delivered', total: 114900 },
  { _id: 1003, customerId: 103, status: 'shipped', total: 29990 },
  { _id: 1004, customerId: 101, status: 'delivered', total: 13494 },
  { _id: 1005, customerId: 104, status: 'cancelled', total: 74999 },
  { _id: 1007, customerId: 106, status: 'pending', total: 3897 },
];

// nested router: needs mergeParams to read :customerId from the parent path
const customerOrders = express.Router({ mergeParams: true });
customerOrders.get('/', (req, res) => {
  const id = Number(req.params.customerId);
  if (!Number.isInteger(id)) return res.status(400).json({ status: 'error', message: 'Invalid customerId: ' + req.params.customerId });
  const data = orders.filter((o) => o.customerId === id).sort((a, b) => b._id - a._id);
  res.json({ results: data.length, data });
});

// Order.aggregate([{ $group: { _id: '$status', orders: { $sum: 1 }, revenue: { $sum: '$total' } } }, { $sort: { revenue: -1 } }])
app.get('/api/v1/orders/stats', (req, res) => {
  const groups = {};
  for (const o of orders) {
    groups[o.status] ??= { _id: o.status, orders: 0, revenue: 0 };
    groups[o.status].orders += 1;
    groups[o.status].revenue += o.total;
  }
  res.json(Object.values(groups).sort((a, b) => b.revenue - a.revenue));
});

app.use('/api/v1/customers/:customerId/orders', customerOrders);

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/v1/customers/101/orders' },
          { method: 'GET', url: '/api/v1/customers/999/orders' },
          { method: 'GET', url: '/api/v1/orders/stats' },
          { method: 'GET', url: '/api/v1/customers/abc/orders' },
        ],
      },
      result: `GET /api/v1/customers/101/orders → 200 {"results":2,"data":[{"_id":1004,"customerId":101,"status":"delivered","total":13494},{"_id":1001,"customerId":101,"status":"delivered","total":20597}]}
GET /api/v1/customers/999/orders → 200 {"results":0,"data":[]}
GET /api/v1/orders/stats → 200 [{"_id":"delivered","orders":3,"revenue":148991},{"_id":"cancelled","orders":1,"revenue":74999},{"_id":"shipped","orders":1,"revenue":29990},{"_id":"pending","orders":1,"revenue":3897}]
GET /api/v1/customers/abc/orders → 400 {"status":"error","message":"Invalid customerId: abc"}`,
      explanation: '`express.Router({ mergeParams: true })` lets the child router read `:customerId` defined in the parent mount path. An empty result is still 200 with `results: 0` (the customer list is just empty), while a malformed id is a 400. The stats endpoint shows how an aggregation result is returned directly as JSON – in Mongoose, Model.aggregate() already gives plain objects.',
    },
  ],
  interview: [
    {
      q: 'How do you structure an Express + Mongoose REST API?',
      a: 'Separate concerns: config (DB connection, env), models (schemas), controllers (request handling), routes (URL → controller + middleware), middleware (auth, validation, 404, error handler), utils (AppError, query builder) and optionally services for business logic. app.js builds the app; server.js connects to MongoDB then listens, so tests can import app without a port.',
      level: 'Easy',
    },
    {
      q: 'Which status codes should CRUD endpoints return?',
      a: 'GET 200 (404 if not found), POST 201 Created with the new resource, PATCH/PUT 200 with the updated resource (or 204), DELETE 204 No Content (or 200 with a message). Errors: 400 invalid input, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict (duplicate key), 422 sometimes for semantic validation, 500 server errors.',
      level: 'Easy',
    },
    {
      q: 'How are async errors handled in Express 5 vs Express 4?',
      a: 'In Express 4 a rejected promise from an async route handler was not caught – you needed try/catch with next(err) or an asyncHandler wrapper (or express-async-errors). Express 5 automatically catches rejected promises from handlers and middleware and passes the error to next(err), so you can just throw.',
      level: 'Medium',
    },
    {
      q: 'How do you implement pagination with Mongoose?',
      a: 'Read page and limit from the query (with defaults and a maximum limit), compute skip = (page-1)*limit, run Model.find(filter).sort(sort).skip(skip).limit(limit) and Model.countDocuments(filter) in parallel with Promise.all, and return data plus metadata (page, limit, total, totalPages). Always sort with a unique tie-breaker like _id.',
      level: 'Medium',
    },
    {
      q: 'What is the problem with skip-based pagination and what is the alternative?',
      a: 'skip still has to walk all skipped index entries/documents, so page 10,000 is slow, and inserts/deletes between requests can cause duplicates or missed rows. Cursor (keyset) pagination remembers the last value seen: find({ _id: { $gt: lastId } }).sort({ _id: 1 }).limit(20) – constant time with an index, ideal for infinite scroll.',
      level: 'Hard',
    },
    {
      q: 'Why should you not pass req.query directly into Model.find()?',
      a: 'A client could send operators like ?password[$ne]=x (with an extended parser) or filter by private fields, causing NoSQL injection or data leaks, and unindexed filters can overload the DB. Whitelist allowed fields, cast values to the expected types, and build the filter object yourself. Mongoose sanitizeFilter / express-mongo-sanitize help too.',
      level: 'Hard',
    },
    {
      q: 'What is the purpose of a central error-handling middleware?',
      a: 'It keeps controllers clean (they just throw), guarantees a consistent error JSON shape, maps known errors (AppError, ValidationError, CastError, 11000, JWT errors) to correct status codes, logs unexpected errors, and hides stack traces in production. It must have four parameters and be registered after all routes.',
      level: 'Medium',
    },
    {
      q: 'What is an AppError / operational error?',
      a: 'A custom Error subclass carrying a statusCode and isOperational flag for expected failures (not found, invalid input, unauthorized). The error middleware sends their message to the client. Non-operational errors (bugs, programmer errors) get a generic 500 message while the details are logged.',
      level: 'Medium',
    },
    {
      q: 'PUT vs PATCH in a Mongoose API?',
      a: 'PUT replaces the whole resource (use findOneAndReplace / overwrite and require all fields); PATCH updates only the sent fields (findByIdAndUpdate with $set semantics). Most Mongoose APIs use PATCH with { new: true, runValidators: true } and a whitelist of updatable fields.',
      level: 'Easy',
    },
    {
      q: 'How do you implement sorting via the query string safely?',
      a: 'Accept something like ?sort=-price,name, split on commas, keep only fields from an allowed list (so users cannot sort by unindexed or private fields), convert to Mongoose syntax "-price name", and append _id as a tie-breaker. Provide a sensible default such as -createdAt.',
      level: 'Medium',
    },
    {
      q: 'What does mergeParams do in express.Router?',
      a: 'By default a router only sees its own route params. express.Router({ mergeParams: true }) makes params from the parent mount path (e.g. /customers/:customerId/orders) available as req.params.customerId inside the child router – used for nested resources.',
      level: 'Medium',
    },
    {
      q: 'Why separate app.js and server.js?',
      a: 'app.js exports a configured Express app without listening; server.js connects to the database and starts listening. This allows Supertest to import the app for integration tests, lets you reuse the app in serverless handlers, and keeps startup/shutdown logic (DB connection, SIGTERM) in one place.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Write a complete Mongoose product controller (getProducts, getProduct, createProduct, updateProduct, deleteProduct) for Express 5 that throws AppError for missing products and whitelists fields on create/update.',
      hint: 'Use a pick() helper; throw new AppError(..., 404) when findById returns null.',
      solution: `const Product = require('../models/product.model');
const AppError = require('../utils/AppError');
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));
const ALLOWED = ['name', 'brand', 'category', 'price', 'stock', 'tags'];

exports.getProducts = async (req, res) => {
  const products = await Product.find().sort('-createdAt').limit(20).lean();
  res.json({ results: products.length, data: products });
};

exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
};

exports.createProduct = async (req, res) => {
  const product = await Product.create(pick(req.body, ALLOWED));
  res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body, ALLOWED), { new: true, runValidators: true });
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.status(204).end();
};`,
    },
    {
      task: 'Write a reusable APIFeatures class that takes a Mongoose query and req.query and offers chainable filter(), search(field), sort(), limitFields() and paginate() methods.',
      hint: 'Each method modifies this.query and returns this.',
      solution: `class APIFeatures {
  constructor(query, qs, allowedFilters = []) {
    this.query = query; this.qs = qs; this.allowed = allowedFilters;
  }
  filter() {
    const f = {};
    for (const k of this.allowed) if (typeof this.qs[k] === 'string') f[k] = this.qs[k];
    if (this.qs.minPrice) f.price = { ...f.price, $gte: Number(this.qs.minPrice) };
    if (this.qs.maxPrice) f.price = { ...f.price, $lte: Number(this.qs.maxPrice) };
    this.query = this.query.find(f);
    return this;
  }
  search(field) {
    if (typeof this.qs.search === 'string' && this.qs.search) {
      const safe = this.qs.search.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
      this.query = this.query.find({ [field]: { $regex: safe, $options: 'i' } });
    }
    return this;
  }
  sort() {
    const s = this.qs.sort ? String(this.qs.sort).split(',').join(' ') : '-createdAt';
    this.query = this.query.sort(s + ' _id');
    return this;
  }
  limitFields() {
    this.query = this.query.select(this.qs.fields ? String(this.qs.fields).split(',').join(' ') : '-__v');
    return this;
  }
  paginate() {
    this.page = Math.max(1, parseInt(this.qs.page) || 1);
    this.limit = Math.min(100, parseInt(this.qs.limit) || 10);
    this.query = this.query.skip((this.page - 1) * this.limit).limit(this.limit);
    return this;
  }
}

// usage
const features = new APIFeatures(Product.find(), req.query, ['category', 'brand'])
  .filter().search('name').sort().limitFields().paginate();
const products = await features.query.lean();`,
    },
    {
      task: 'In the shop dataset, write the query for GET /api/v1/orders?status=delivered&sort=-total&page=1&limit=3&fields=customerId,total and the count for its metadata.',
      hint: 'Filter { status: "delivered" }, projection { customerId: 1, total: 1 }, sort { total: -1, _id: 1 }.',
      solution: `const filter = { status: 'delivered' }
db.orders.find(filter, { customerId: 1, total: 1 }).sort({ total: -1, _id: 1 }).skip(0).limit(3)
db.orders.countDocuments(filter)
// 1002 (114900), 1006 (109800), 1008 (55485); total 7 → totalPages 3`,
    },
    {
      task: 'Implement cursor-based pagination for an infinite-scroll feed: GET /api/v1/posts?after=<lastId>&limit=10 returning posts newer-first and a nextCursor.',
      hint: 'Sort by _id descending, filter { _id: { $lt: after } }, fetch limit + 1 to know if there is more.',
      solution: `exports.getFeed = async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const filter = { published: true };
  if (req.query.after) filter._id = { $lt: req.query.after };   // cast to ObjectId by Mongoose

  const posts = await Post.find(filter).sort({ _id: -1 }).limit(limit + 1)
    .populate('author', 'username').lean();

  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, limit) : posts;
  res.json({ data, nextCursor: hasMore ? data[data.length - 1]._id : null });
};
// React: fetch('/api/v1/posts?after=' + nextCursor) when the user reaches the bottom`,
    },
    {
      task: 'Write app.js and server.js for the products API with express.json body limit, a /health route, versioned routes, 404 handler, error handler, DB connection before listen and graceful SIGTERM shutdown.',
      hint: 'Order: json → routes → notFound → errorHandler. server.js: connect, then listen.',
      solution: `// src/app.js
const express = require('express');
const productRoutes = require('./routes/product.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json({ limit: '10kb' }));
app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/v1/products', productRoutes);
app.use(notFound);
app.use(errorHandler);
module.exports = app;

// src/server.js
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  const server = app.listen(process.env.PORT || 5000, () => console.log('API ready'));
  const shutdown = () => server.close(async () => { await mongoose.connection.close(); process.exit(0); });
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
start().catch((err) => { console.error(err); process.exit(1); });`,
    },
  ],
  quiz: [
    {
      question: 'In Express 5, what happens when an async controller throws an error?',
      options: [
        'The request hangs forever',
        'The process crashes with an unhandled rejection',
        'The error is automatically passed to the error-handling middleware',
        'Express returns 200 with an empty body',
      ],
      answer: 2,
      explanation: 'Express 5 catches rejected promises returned by handlers and calls next(err) automatically. In Express 4 you needed a wrapper.',
    },
    {
      question: 'For page 3 with limit 20, what skip value do you pass to Mongoose?',
      options: ['40', '60', '3', '20'],
      answer: 0,
      explanation: 'skip = (page - 1) × limit = 2 × 20 = 40.',
    },
    {
      question: 'Which status code best fits a successful DELETE that returns no body?',
      options: ['200 OK', '201 Created', '404 Not Found', '204 No Content'],
      answer: 3,
      explanation: '204 means success with no response body – the usual choice for DELETE.',
    },
    {
      question: 'Why do we append _id to the sort of a paginated query?',
      options: [
        'MongoDB requires _id in every sort',
        'To give a unique tie-breaker so pages are stable and do not repeat/skip documents',
        'To make the query use the text index',
        'To hide the _id field',
      ],
      answer: 1,
      explanation: 'If many documents share the same price, their order is not guaranteed; adding the unique _id makes the order deterministic across pages.',
    },
    {
      question: 'Where must the error-handling middleware be registered in app.js?',
      options: [
        'Before express.json()',
        'Before the routes so it can catch everything',
        'After all routes and the 404 handler',
        'Inside every controller',
      ],
      answer: 2,
      explanation: 'Error middleware (4 arguments) must be added last, after routes and the 404 handler, so errors from them reach it.',
    },
  ],
};
