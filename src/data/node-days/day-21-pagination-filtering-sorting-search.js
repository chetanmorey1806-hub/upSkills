export default {
  id: 'day-21-pagination-filtering-sorting-search',
  title: 'Pagination, Filtering, Sorting and Search in APIs',
  module: 'Module 3: Databases',
  day: 21,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Real APIs never return 1 million rows at once. Today you learn how to let clients ask for "page 2, 5 items, only Electronics, cheapest first, name contains phone" using query strings, and how to implement it with in-memory arrays, Mongoose and SQL.',
  objectives: [
    'Implement offset pagination with page and limit and return useful metadata (total, totalPages, hasNext)',
    'Add filtering (exact match and ranges like minPrice/maxPrice) safely from req.query',
    'Add multi-field sorting (sort=-price,name) and case-insensitive search',
    'Translate the same query to Mongoose (find/skip/limit/sort/countDocuments) and SQL (LIMIT/OFFSET)',
    'Know when to use cursor-based pagination instead of offset pagination',
  ],
  theory: [
    {
      heading: 'Why pagination? The library analogy',
      content:
        'Imagine asking a librarian for "all books". She would bring you 50,000 books on a trolley that you cannot even carry. A good librarian brings you **one shelf at a time** and tells you "this is shelf 2 of 400". That is pagination.\n\nWithout pagination an endpoint like `GET /api/products` becomes slower every day as data grows: the database reads everything, Node converts everything to JSON (blocking the event loop), the network sends megabytes, and the phone app freezes while rendering. With pagination every response has a **fixed, small size**, no matter how big the table becomes.\n\nThe client controls the request through the **query string** (the part after `?`): `GET /api/products?page=2&limit=5`. In Express you read it from `req.query`, which always gives **strings** (`"2"`, not `2`), so you must convert and validate it.',
      points: [
        'page: which page the client wants (1-based is most common for humans)',
        'limit (or pageSize / per_page): how many items per page; always enforce a maximum (e.g. 100)',
        'skip/offset = (page - 1) * limit',
        'Return metadata: total, totalPages, page, limit, hasNextPage, hasPrevPage',
      ],
      syntax: `const page = Math.max(parseInt(req.query.page) || 1, 1);
const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
const skip = (page - 1) * limit;
const data = items.slice(skip, skip + limit);
res.json({ page, limit, total: items.length, totalPages: Math.ceil(items.length / limit), data });`,
      tip: 'Never trust req.query. "limit=1000000" or "page=-5" or "page=abc" must not crash or overload your server: parse, default and clamp every value.',
    },
    {
      heading: 'Filtering: only the rows the client needs',
      content:
        'Filtering means returning only items that match conditions: `?category=Electronics`, `?inStock=true`, `?minPrice=100&maxPrice=500`.\n\nGood design rules:\n- Use **whitelisted** filter fields only. Never pass `req.query` straight into a database query - in MongoDB a query like `?password[$ne]=x` could become an operator injection (`{ password: { $ne: "x" } }`).\n- Convert types: `"true"` → `true`, `"500"` → `500`.\n- Ranges use either separate params (`minPrice`, `maxPrice`) or bracket syntax (`price[gte]=100`).\n\n**Express 5 change:** Express 4 used the `qs` library ("extended" parser) by default, so `?price[gte]=100` became `{ price: { gte: "100" } }`. Express 5 defaults to the **"simple"** parser (Node querystring), so you get `{ "price[gte]": "100" }`. If you want nested objects, opt in with `app.set(\'query parser\', \'extended\')`. Also in Express 5 `req.query` is a **getter (read-only)**: you cannot do `req.query.page = 1`; store cleaned values in a new object (e.g. `req.pagination`).',
      syntax: `// Express 5: opt in to nested query objects (Express 4 default)
app.set('query parser', 'extended');
// GET /products?price[gte]=100&price[lte]=500
// req.query -> { price: { gte: '100', lte: '500' } }`,
      tip: 'Prefer flat names like minPrice/maxPrice for public APIs - they are simple for every client and avoid operator-injection surprises.',
    },
    {
      heading: 'Sorting: ?sort=-price,name',
      content:
        'A popular convention (used by many REST APIs and by Mongoose itself) is a comma separated list of fields where a leading minus means descending: `?sort=-price,name` means "price high → low, and for equal prices name A → Z".\n\nImplementation steps:\n1. Split by comma: `["-price", "name"]`.\n2. For each part: direction = part starts with "-" ? -1 : 1, field = part without "-".\n3. Ignore fields that are not in an **allowed list** (sorting by an unindexed or secret field is a performance/security risk).\n4. Compare items field by field.\n\nIn Mongoose you can pass the string directly: `.sort("-price name")` (space separated). In SQL: `ORDER BY price DESC, name ASC` - but never concatenate user text into SQL; map it to known column names first.',
      syntax: `function buildComparator(sortParam, allowed) {
  const rules = sortParam.split(',').map(s => s.trim())
    .map(s => ({ field: s.replace(/^-/, ''), dir: s.startsWith('-') ? -1 : 1 }))
    .filter(r => allowed.includes(r.field));
  return (a, b) => {
    for (const { field, dir } of rules) {
      if (a[field] < b[field]) return -1 * dir;
      if (a[field] > b[field]) return 1 * dir;
    }
    return 0;
  };
}`,
    },
    {
      heading: 'Search: ?q=phone',
      content:
        'Search is a "contains" filter usually across one or more text fields, case-insensitive. In JavaScript: `name.toLowerCase().includes(q.toLowerCase())`.\n\nIn MongoDB you have two choices:\n- **Regex**: `{ name: { $regex: q, $options: "i" } }` - easy, but cannot use an index efficiently when not anchored, and you must **escape** user input (`q.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")`) or a value like `.*` matches everything and malicious patterns can be very slow (ReDoS).\n- **Text index**: `schema.index({ name: "text", description: "text" })` then `{ $text: { $search: q } }` - fast word search with relevance score.\n\nIn MySQL: `WHERE name LIKE ?` with value `%phone%` (parameterised!), or a FULLTEXT index with `MATCH ... AGAINST`. For big products (Amazon-style search) teams use Elasticsearch / OpenSearch / Atlas Search.',
      tip: 'Order of operations matters: search → filter → sort → count total → paginate. If you paginate before filtering, page 1 might be empty!',
    },
    {
      heading: 'Offset vs cursor (keyset) pagination',
      content:
        '**Offset pagination** (`page`, `limit`, `skip`) is simple and lets users jump to page 37. Problems: the database still walks over all skipped rows (`OFFSET 100000` is slow), and if new rows are inserted while the user is paging, items can be duplicated or skipped.\n\n**Cursor pagination** (also called keyset) says "give me 10 items **after** the item with id 120": `WHERE id > 120 ORDER BY id LIMIT 10`. It uses the index directly, so it is equally fast on page 1 and page 10,000, and it is stable while data changes. You cannot jump to an arbitrary page - perfect for infinite scroll feeds (Instagram, Twitter, chat history).\n\nThe response returns `nextCursor` (often the last id, sometimes base64 encoded) and the client sends it back: `GET /api/posts?limit=10&cursor=120`.',
      points: [
        'Admin tables with page numbers → offset pagination',
        'Infinite scroll, feeds, very large tables, real-time data → cursor pagination',
        'Always sort by a unique, indexed field (or a tie-breaker like _id) for stable pages',
      ],
    },
    {
      heading: 'Doing it in the database (Mongoose and SQL)',
      content:
        'Slicing arrays in Node is fine for learning, but in production the **database** must do the work so that only the requested rows travel over the network.\n\nMongoose: `Model.find(filter).sort(sort).skip(skip).limit(limit).lean()` plus `Model.countDocuments(filter)` for the total - run them in parallel with `Promise.all`. `lean()` returns plain objects (faster, no Mongoose document overhead).\n\nSQL (mysql2): `SELECT ... WHERE category = ? ORDER BY price DESC LIMIT ? OFFSET ?` and `SELECT COUNT(*) AS total FROM products WHERE category = ?`.\n\nAdd **indexes** on fields you filter and sort on (e.g. `{ category: 1, price: -1 }`), otherwise the database scans every document.',
      syntax: `const [items, total] = await Promise.all([
  Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
  Product.countDocuments(filter),
]);`,
    },
  ],
  examples: [
    {
      title: 'Offset pagination with metadata',
      scenario: 'A shop has 12 products. The mobile app wants 5 products per page and needs to know if there is a next page.',
      steps: [
        'Create a folder, run npm init -y and npm install express',
        'Create server.js with an in-memory products array of 12 items',
        'Parse page and limit from req.query, apply defaults and clamp them',
        'Slice the array and return data plus metadata',
        'Run node server.js and call /api/products?page=2&limit=5, page=3, and an invalid page',
      ],
      code: `const express = require('express');
const app = express();

const products = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: 'Product ' + (i + 1) }));

app.get('/api/products', (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 100);
  const skip = (page - 1) * limit;
  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  res.json({
    page, limit, total, totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    data: products.slice(skip, skip + limit),
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      api: {
        code: `const express = require('express');
const app = express();

const products = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: 'Product ' + (i + 1) }));

app.get('/api/products', (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 100);
  const skip = (page - 1) * limit;
  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  res.json({
    page, limit, total, totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    data: products.slice(skip, skip + limit),
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/products?page=2&limit=5' },
          { method: 'GET', url: '/api/products?page=3&limit=5' },
          { method: 'GET', url: '/api/products?page=abc&limit=2' },
        ],
      },
      result: "GET /api/products?page=2&limit=5 → 200 {\"page\":2,\"limit\":5,\"total\":12,\"totalPages\":3,\"hasNextPage\":true,\"hasPrevPage\":true,\"data\":[{\"id\":6,\"name\":\"Product 6\"},{\"id\":7,\"name\":\"Product 7\"},{\"id\":8,\"name\":\"Product 8\"},{\"id\":9,\"name\":\"Product 9\"},{\"id\":10,\"name\":\"Product 10\"}]}\nGET /api/products?page=3&limit=5 → 200 {\"page\":3,\"limit\":5,\"total\":12,\"totalPages\":3,\"hasNextPage\":false,\"hasPrevPage\":true,\"data\":[{\"id\":11,\"name\":\"Product 11\"},{\"id\":12,\"name\":\"Product 12\"}]}\nGET /api/products?page=abc&limit=2 → 200 {\"page\":1,\"limit\":2,\"total\":12,\"totalPages\":6,\"hasNextPage\":true,\"hasPrevPage\":false,\"data\":[{\"id\":1,\"name\":\"Product 1\"},{\"id\":2,\"name\":\"Product 2\"}]}",
      explanation:
        'parseInt("abc") is NaN, and NaN || 1 gives the default 1, so bad input falls back safely. skip = (page-1)*limit, so page 2 with limit 5 starts at index 5 (Product 6). Page 3 has only 2 items left and hasNextPage is false. Math.min(..., 100) stops a client from requesting a million rows.',
    },
    {
      title: 'Filter + search + sort + paginate in one endpoint',
      scenario: 'A product listing page with a category dropdown, price range, search box and "sort by price" option.',
      steps: [
        'Whitelist the fields that may be sorted (name, price, rating)',
        'Apply search (q) on name, then category and price filters',
        'Sort with a comparator built from ?sort=-price,name',
        'Count the total AFTER filtering, then paginate',
        'Test several query combinations',
      ],
      code: `const express = require('express');
const app = express();

const products = [
  { id: 1, name: 'iPhone 15', category: 'Phones', price: 799, rating: 4.7 },
  { id: 2, name: 'Galaxy S24', category: 'Phones', price: 699, rating: 4.6 },
  { id: 3, name: 'Pixel 8', category: 'Phones', price: 599, rating: 4.5 },
  { id: 4, name: 'MacBook Air', category: 'Laptops', price: 1099, rating: 4.8 },
  { id: 5, name: 'ThinkPad X1', category: 'Laptops', price: 1299, rating: 4.4 },
  { id: 6, name: 'Phone Stand', category: 'Accessories', price: 15, rating: 4.1 },
  { id: 7, name: 'USB-C Cable', category: 'Accessories', price: 9, rating: 4.3 },
];
const SORTABLE = ['name', 'price', 'rating'];

app.get('/api/products', (req, res) => {
  const { q, category, minPrice, maxPrice, sort = 'id' } = req.query;
  let result = products;

  if (q) result = result.filter(p => p.name.toLowerCase().includes(String(q).toLowerCase()));
  if (category) result = result.filter(p => p.category === category);
  if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
  if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));

  const rules = String(sort).split(',')
    .map(s => ({ field: s.replace(/^-/, ''), dir: s.startsWith('-') ? -1 : 1 }))
    .filter(r => SORTABLE.includes(r.field));
  result = [...result].sort((a, b) => {
    for (const { field, dir } of rules) {
      if (a[field] < b[field]) return -dir;
      if (a[field] > b[field]) return dir;
    }
    return 0;
  });

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const total = result.length;
  res.json({ total, page, limit, data: result.slice((page - 1) * limit, page * limit).map(p => p.name + ' $' + p.price) });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      api: {
        code: `const express = require('express');
const app = express();

const products = [
  { id: 1, name: 'iPhone 15', category: 'Phones', price: 799, rating: 4.7 },
  { id: 2, name: 'Galaxy S24', category: 'Phones', price: 699, rating: 4.6 },
  { id: 3, name: 'Pixel 8', category: 'Phones', price: 599, rating: 4.5 },
  { id: 4, name: 'MacBook Air', category: 'Laptops', price: 1099, rating: 4.8 },
  { id: 5, name: 'ThinkPad X1', category: 'Laptops', price: 1299, rating: 4.4 },
  { id: 6, name: 'Phone Stand', category: 'Accessories', price: 15, rating: 4.1 },
  { id: 7, name: 'USB-C Cable', category: 'Accessories', price: 9, rating: 4.3 },
];
const SORTABLE = ['name', 'price', 'rating'];

app.get('/api/products', (req, res) => {
  const { q, category, minPrice, maxPrice, sort = 'id' } = req.query;
  let result = products;

  if (q) result = result.filter(p => p.name.toLowerCase().includes(String(q).toLowerCase()));
  if (category) result = result.filter(p => p.category === category);
  if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
  if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));

  const rules = String(sort).split(',')
    .map(s => ({ field: s.replace(/^-/, ''), dir: s.startsWith('-') ? -1 : 1 }))
    .filter(r => SORTABLE.includes(r.field));
  result = [...result].sort((a, b) => {
    for (const { field, dir } of rules) {
      if (a[field] < b[field]) return -dir;
      if (a[field] > b[field]) return dir;
    }
    return 0;
  });

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const total = result.length;
  res.json({ total, page, limit, data: result.slice((page - 1) * limit, page * limit).map(p => p.name + ' $' + p.price) });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/products?category=Phones&sort=price' },
          { method: 'GET', url: '/api/products?minPrice=500&maxPrice=1100&sort=-rating' },
          { method: 'GET', url: '/api/products?q=phone&sort=-price' },
          { method: 'GET', url: '/api/products?sort=-price&page=2&limit=3' },
        ],
      },
      result: "GET /api/products?category=Phones&sort=price → 200 {\"total\":3,\"page\":1,\"limit\":10,\"data\":[\"Pixel 8 $599\",\"Galaxy S24 $699\",\"iPhone 15 $799\"]}\nGET /api/products?minPrice=500&maxPrice=1100&sort=-rating → 200 {\"total\":4,\"page\":1,\"limit\":10,\"data\":[\"MacBook Air $1099\",\"iPhone 15 $799\",\"Galaxy S24 $699\",\"Pixel 8 $599\"]}\nGET /api/products?q=phone&sort=-price → 200 {\"total\":2,\"page\":1,\"limit\":10,\"data\":[\"iPhone 15 $799\",\"Phone Stand $15\"]}\nGET /api/products?sort=-price&page=2&limit=3 → 200 {\"total\":7,\"page\":2,\"limit\":3,\"data\":[\"Galaxy S24 $699\",\"Pixel 8 $599\",\"Phone Stand $15\"]}",
      explanation:
        'Each filter narrows the array, so the order search → filter → sort → paginate is respected and total reflects the filtered count. "q=phone" matches "iPhone 15" and "Phone Stand" because both sides are lower-cased. The sort parser turns "-rating" into {field:"rating",dir:-1}; unknown fields (like "id" here, not in SORTABLE) are ignored, leaving the original order.',
    },
    {
      title: 'Cursor-based pagination for an infinite feed',
      scenario: 'A social feed must load "the next 3 posts after the last one I saw" without duplicates even while new posts arrive.',
      steps: [
        'Keep posts sorted by id (unique and indexed in a real DB)',
        'Read ?cursor= (last id seen) and ?limit=',
        'Return items with id > cursor and a nextCursor equal to the last returned id',
        'When fewer items than limit come back, nextCursor is null (end of feed)',
      ],
      code: `const express = require('express');
const app = express();

const posts = Array.from({ length: 8 }, (_, i) => ({ id: 101 + i, text: 'Post #' + (101 + i) }));

app.get('/api/feed', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 3, 20);
  const cursor = parseInt(req.query.cursor) || 0;
  const items = posts.filter(p => p.id > cursor).slice(0, limit);
  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  res.json({ items: items.map(p => p.id), nextCursor });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      api: {
        code: `const express = require('express');
const app = express();

const posts = Array.from({ length: 8 }, (_, i) => ({ id: 101 + i, text: 'Post #' + (101 + i) }));

app.get('/api/feed', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 3, 20);
  const cursor = parseInt(req.query.cursor) || 0;
  const items = posts.filter(p => p.id > cursor).slice(0, limit);
  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  res.json({ items: items.map(p => p.id), nextCursor });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/feed?limit=3' },
          { method: 'GET', url: '/api/feed?limit=3&cursor=103' },
          { method: 'GET', url: '/api/feed?limit=3&cursor=106' },
        ],
      },
      result: "GET /api/feed?limit=3 → 200 {\"items\":[101,102,103],\"nextCursor\":103}\nGET /api/feed?limit=3&cursor=103 → 200 {\"items\":[104,105,106],\"nextCursor\":106}\nGET /api/feed?limit=3&cursor=106 → 200 {\"items\":[107,108],\"nextCursor\":null}",
      explanation:
        'The client never sends a page number; it sends the last id it received. In MongoDB this becomes find({ _id: { $gt: cursor } }).sort({ _id: 1 }).limit(limit), which uses the _id index directly, so page 10,000 is as fast as page 1. The (simplified) rule "fewer items than limit = end" may cost one extra empty request when the count divides exactly; production code often fetches limit + 1 rows to know if more exist.',
    },
    {
      title: 'The same API with Mongoose (real database code)',
      scenario: 'Move the listing endpoint to MongoDB so the database does the filtering, sorting and paging.',
      steps: [
        'npm install express mongoose',
        'Create the Product model with indexes on category+price and a text index on name',
        'Build a safe filter object from whitelisted query params only',
        'Run find().sort().skip().limit().lean() and countDocuments() in parallel',
        'Return the same response shape as the in-memory version',
      ],
      code: `// models/Product.js
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, index: true },
  price: { type: Number, min: 0 },
  rating: Number,
}, { timestamps: true });
productSchema.index({ category: 1, price: -1 });
productSchema.index({ name: 'text' });
module.exports = mongoose.model('Product', productSchema);

// controllers/productController.js
const Product = require('../models/Product');
const SORTABLE = ['name', 'price', 'rating', 'createdAt'];
const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

exports.listProducts = async (req, res) => {
  const { q, category, minPrice, maxPrice, sort = '-createdAt' } = req.query;
  const filter = {};
  if (category) filter.category = String(category);           // String() blocks {$ne:..} objects
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (q) filter.name = { $regex: escapeRegex(String(q)), $options: 'i' };

  const sortStr = String(sort).split(',')
    .filter(s => SORTABLE.includes(s.replace(/^-/, '')))
    .join(' ') || '-createdAt';

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

  // Express 5: a rejected promise here is forwarded to the error middleware automatically
  const [data, total] = await Promise.all([
    Product.find(filter).sort(sortStr + ' _id').skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ page, limit, total, totalPages: Math.ceil(total / limit), data });
};

// SQL equivalent with mysql2 (parameterised - never concatenate user input):
// const [rows] = await pool.query(
//   'SELECT * FROM products WHERE category = ? AND price BETWEEN ? AND ? ORDER BY price DESC LIMIT ? OFFSET ?',
//   [category, min, max, limit, (page - 1) * limit]);`,
      result:
        'GET /api/products?category=Phones&sort=-price&page=1&limit=2 returns the two most expensive phones plus total/totalPages computed by MongoDB. With the compound index { category: 1, price: -1 } MongoDB does not need an in-memory sort.',
      explanation:
        'The structure mirrors the in-memory version, but now only `limit` documents leave the database. String(category) is an important security habit: with Express 4 extended parsing, ?category[$ne]=x would arrive as an object and become a NoSQL operator. The extra " _id" in the sort is a tie-breaker so items with the same price never jump between pages.',
    },
  ],
  interview: [
    { q: 'What is pagination and why is it needed in REST APIs?', a: 'Pagination splits a large result set into smaller pages (e.g. 20 items). It keeps response size, DB work, memory and JSON serialization constant as data grows, makes the UI faster, and prevents a single request from overloading the server.', level: 'Easy' },
    { q: 'How do you calculate skip/offset for page-based pagination?', a: 'skip = (page - 1) * limit for 1-based pages. Page 3 with limit 10 skips 20 rows and returns rows 21-30. totalPages = Math.ceil(total / limit).', level: 'Easy' },
    { q: 'What is the difference between offset and cursor pagination?', a: 'Offset uses page/limit (LIMIT/OFFSET or skip); simple and allows jumping to any page, but large offsets are slow and results shift when data changes. Cursor (keyset) pagination uses the last seen key (WHERE id > lastId LIMIT n); fast on any depth via the index and stable for changing data, but no random page jumping. Feeds and infinite scroll use cursors.', level: 'Medium' },
    { q: 'Why are req.query values always strings and what should you do about it?', a: 'The query string is text, so Express parses ?page=2 into "2" (or arrays for repeated keys). You must convert (parseInt/Number/=== "true"), apply defaults, clamp ranges (max limit) and validate (e.g. with zod or express-validator).', level: 'Easy' },
    { q: 'What changed about req.query in Express 5?', a: 'req.query is now a read-only getter (you cannot assign to it; store sanitized values elsewhere like req.validatedQuery) and the default query parser is "simple" (Node querystring) instead of "extended" (qs). Nested syntax like price[gte]=100 is not parsed into objects unless you call app.set("query parser", "extended").', level: 'Medium' },
    { q: 'What is NoSQL injection in filtering and how do you prevent it?', a: 'If you pass req.query/req.body directly into Mongo queries, a value like {"$ne": null} turns an equality check into an operator (e.g. ?password[$ne]=1 bypasses checks). Prevent it by whitelisting fields, casting values with String()/Number(), validating with a schema, and using mongoose sanitizeFilter or express-mongo-sanitize.', level: 'Hard' },
    { q: 'How would you implement sorting by multiple fields from a query string?', a: 'Use a convention like ?sort=-price,name. Split by comma; "-" means descending. Whitelist allowed fields, then pass to the DB: Mongoose .sort("-price name"), SQL ORDER BY price DESC, name ASC (mapped to known column names). Add a unique tie-breaker (_id) for stable ordering.', level: 'Medium' },
    { q: 'Regex search vs text index in MongoDB?', a: 'Regex ($regex with "i") is flexible "contains" matching but unanchored patterns cannot use an index efficiently and user input must be escaped (ReDoS, wildcard abuse). A text index ($text/$search) tokenises words, supports stemming and relevance scores, and is much faster for word search but does not do partial-word matching. For advanced search use Atlas Search/Elasticsearch.', level: 'Medium' },
    { q: 'In which order should you apply search, filter, sort and pagination? Why?', a: 'Filter/search first, then sort, then count the total, then paginate. Paginating before filtering produces wrong or empty pages and an incorrect total.', level: 'Easy' },
    { q: 'How do you get the total count efficiently in Mongoose?', a: 'Run Model.countDocuments(filter) in parallel with the find query using Promise.all. For huge collections with no filter, estimatedDocumentCount() uses metadata and is very fast. Some APIs skip totals and only return hasNextPage (fetch limit + 1 items) to avoid expensive counts.', level: 'Hard' },
    { q: 'Which indexes help a query like category=Phones sorted by price desc?', a: 'A compound index { category: 1, price: -1 }: equality field first, then sort field (ESR rule: Equality, Sort, Range). MongoDB can then read results already in order without an in-memory sort.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a reusable function paginate(array, query) that returns { page, limit, total, totalPages, hasNextPage, data } with defaults page=1, limit=10 and max limit 50.',
      hint: 'parseInt with || defaults, Math.max/Math.min for clamping, slice for data.',
      solution: `function paginate(array, query = {}) {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 50);
  const total = array.length;
  const totalPages = Math.ceil(total / limit);
  return {
    page, limit, total, totalPages,
    hasNextPage: page < totalPages,
    data: array.slice((page - 1) * limit, page * limit),
  };
}
module.exports = paginate;
// usage: app.get('/api/users', (req, res) => res.json(paginate(users, req.query)));`,
    },
    {
      task: 'Create a middleware parsePagination that puts { page, limit, skip } on req.pagination (remember: req.query is read-only in Express 5).',
      hint: 'Middleware signature (req, res, next). Do not assign to req.query.',
      solution: `function parsePagination(defaultLimit = 10, maxLimit = 100) {
  return (req, res, next) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || defaultLimit, 1), maxLimit);
    req.pagination = { page, limit, skip: (page - 1) * limit };
    next();
  };
}

app.get('/api/orders', parsePagination(20), (req, res) => {
  const { skip, limit, page } = req.pagination;
  res.json({ page, data: orders.slice(skip, skip + limit) });
});`,
    },
    {
      task: 'Add ?fields=name,price support (field selection / projection) to the products endpoint so clients receive only the requested fields.',
      hint: 'Whitelist fields, then map each item to an object with only those keys. In Mongoose use .select("name price").',
      solution: `const SELECTABLE = ['id', 'name', 'price', 'category', 'rating'];
app.get('/api/products', (req, res) => {
  let data = products;
  if (req.query.fields) {
    const fields = String(req.query.fields).split(',').filter(f => SELECTABLE.includes(f));
    data = data.map(p => Object.fromEntries(fields.map(f => [f, p[f]])));
  }
  res.json(data);
});
// Mongoose: Product.find(filter).select(fields.join(' '))`,
    },
    {
      task: 'Implement a MySQL (mysql2/promise) version of GET /api/products with category filter, price sort direction and pagination using placeholders only.',
      hint: 'Map sort to a fixed SQL fragment instead of inserting user text; LIMIT ? OFFSET ? accept numbers.',
      solution: `const mysql = require('mysql2/promise');
const pool = mysql.createPool({ host: 'localhost', user: 'root', password: process.env.DB_PASS, database: 'shop' });

app.get('/api/products', async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const order = req.query.sort === '-price' ? 'price DESC' : 'price ASC'; // whitelisted
  const where = req.query.category ? 'WHERE category = ?' : '';
  const params = req.query.category ? [String(req.query.category)] : [];

  const [rows] = await pool.query(
    \`SELECT id, name, price FROM products \${where} ORDER BY \${order}, id LIMIT ? OFFSET ?\`,
    [...params, limit, (page - 1) * limit]);
  const [[{ total }]] = await pool.query(\`SELECT COUNT(*) AS total FROM products \${where}\`, params);
  res.json({ page, limit, total, data: rows });
});`,
    },
    {
      task: 'Return pagination links (self, next, prev) in the response like GitHub does, e.g. "/api/products?page=3&limit=5".',
      hint: 'Use req.path and URLSearchParams to rebuild the query with a new page number.',
      solution: `function buildLink(req, page) {
  const params = new URLSearchParams(req.query);
  params.set('page', page);
  return req.baseUrl + req.path + '?' + params.toString();
}
app.get('/api/products', (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 5, 50);
  const totalPages = Math.ceil(products.length / limit);
  res.json({
    links: {
      self: buildLink(req, page),
      next: page < totalPages ? buildLink(req, page + 1) : null,
      prev: page > 1 ? buildLink(req, page - 1) : null,
    },
    data: products.slice((page - 1) * limit, page * limit),
  });
});`,
    },
  ],
  quiz: [
    { question: 'With page=4 and limit=25, how many items are skipped?', options: ['100', '75', '25', '4'], answer: 1, explanation: 'skip = (page - 1) * limit = 3 * 25 = 75.' },
    { question: 'In Express 5, what does req.query look like for /p?price[gte]=10 with default settings?', options: ['{ price: { gte: 10 } }', '{ price: { gte: "10" } }', '{ "price[gte]": "10" }', 'It throws an error'], answer: 2, explanation: 'Express 5 uses the "simple" query parser by default; set app.set("query parser", "extended") to get nested objects.' },
    { question: 'Which pagination style is best for an infinite-scroll feed with constantly added posts?', options: ['Offset pagination', 'Returning all posts', 'Random sampling', 'Cursor (keyset) pagination'], answer: 3, explanation: 'Cursor pagination is stable while data changes and stays fast at any depth.' },
    { question: 'What does ?sort=-price,name mean in the common convention?', options: ['Price descending, then name ascending', 'Price ascending, then name descending', 'Exclude price, sort by name', 'Sort by price minus name'], answer: 0, explanation: 'A leading "-" means descending for that field; later fields break ties.' },
    { question: 'Why should you call String(req.query.category) before using it in a MongoDB filter?', options: ['To make it faster', 'To prevent operator injection when the value is an object like { $ne: null }', 'Because Mongo only stores strings', 'It is required by Express 5'], answer: 1, explanation: 'Casting blocks objects such as { $ne: ... } from becoming query operators.' },
  ],
};
