export default {
  id: 'day-10-mongoose-basics-schemas-models-crud-validation',
  title: 'Mongoose Basics: Connecting, Schemas, Models, CRUD, Timestamps, Validation & Error Handling',
  module: 'Module 4: Mongoose',
  day: 10,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Mongoose is the ODM (Object Data Modeling) library used in almost every MERN backend. Today you connect Node.js to MongoDB with Mongoose 8, define schemas and models, perform CRUD, add timestamps and built-in/custom validation, and handle ValidationError, CastError and duplicate key (E11000) errors properly.',
  objectives: [
    'Explain what an ODM is and why Mongoose is used on top of the MongoDB driver',
    'Connect to local MongoDB or Atlas with mongoose.connect() and listen to connection events',
    'Define schemas with types, defaults, required, enum, min/max, match and custom validators',
    'Perform CRUD with Model.create, find, findById, findByIdAndUpdate (with runValidators) and deleteOne',
    'Handle ValidationError, CastError and E11000 duplicate key errors and return clean API responses',
  ],
  theory: [
    {
      heading: 'What is Mongoose and why use it?',
      content: `The official **MongoDB Node.js driver** lets you run any query, but it does not care what your documents look like. **Mongoose** is an **ODM (Object Data Modeling)** library built on top of the driver. It adds:

- **Schemas** – the shape of documents: field names, types, defaults
- **Validation** – required fields, min/max, enum, regex, custom rules – before data reaches the database
- **Models** – classes with methods like \`find\`, \`create\`, \`findByIdAndUpdate\`
- **Casting** – the string \`"79900"\` from a form becomes the number \`79900\`; an id string becomes an ObjectId
- **Middleware (hooks)**, **populate**, **virtuals**, **plugins** (Day 11)

**Analogy:** MongoDB is a big warehouse that accepts any box. Mongoose is the security guard at the gate with a checklist: "Every box must have a label, weight must be positive, and the type must be one of these three." Bad boxes are rejected before they enter.

Install: \`npm install mongoose\` (current major version: **Mongoose 8**, which needs Node.js 16+ and supports MongoDB 8).`,
      points: [
        'Driver = raw access, no schema; Mongoose = schema + validation + helpers',
        'A Schema describes the shape; a Model is the class you use to query a collection',
        'Mongoose 8: promise/async-await only – callbacks were removed in Mongoose 7',
        'Old options useNewUrlParser / useUnifiedTopology are no longer needed',
      ],
    },
    {
      heading: 'Connecting with mongoose.connect()',
      content: `Connect **once** when your app starts, then reuse the connection everywhere. Mongoose keeps a **connection pool** (default maxPoolSize 100) and buffers queries until the connection is ready.

Best practices:
- Read the URI from an environment variable (\`process.env.MONGODB_URI\`)
- Start the Express server **after** the database connects
- Exit the process (or retry) if the first connection fails
- Listen to \`connected\`, \`error\` and \`disconnected\` events for logging
- Close the connection on shutdown (\`SIGINT\`) with \`mongoose.connection.close()\``,
      syntax: `// src/config/db.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'shop',                 // optional: overrides the db in the URI
      serverSelectionTimeoutMS: 5000, // fail fast if the server is unreachable
    });
    console.log('MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
module.exports = connectDB;`,
      tip: 'Do not call mongoose.connect() inside a route handler. Connecting on every request creates new pools and quickly exhausts Atlas connection limits.',
    },
    {
      heading: 'Schemas, SchemaTypes and models',
      content: `A **Schema** maps to one MongoDB collection and defines the fields. Each field has a **SchemaType**: \`String\`, \`Number\`, \`Boolean\`, \`Date\`, \`Buffer\`, \`ObjectId\` (\`Schema.Types.ObjectId\`), \`Array\` (e.g. \`[String]\`), \`Decimal128\`, \`Map\`, \`Mixed\`, and nested objects / sub-schemas.

\`mongoose.model('Product', productSchema)\` compiles the schema into a **Model**. Mongoose automatically uses the **lowercase plural** of the model name as the collection name: \`Product\` → \`products\`, \`Person\` → \`people\`.

Useful field options:
- \`required\`, \`default\`, \`unique\` (creates a unique **index**, it is NOT a validator)
- Strings: \`trim\`, \`lowercase\`, \`uppercase\`, \`minLength\`, \`maxLength\`, \`enum\`, \`match\`
- Numbers/Dates: \`min\`, \`max\`
- \`select: false\` – hide a field (e.g. password) from query results by default
- \`immutable: true\` – value cannot be changed after creation

**timestamps: true** in schema options adds \`createdAt\` and \`updatedAt\` Date fields that Mongoose maintains automatically.`,
      syntax: `// src/models/product.model.js
const { Schema, model } = require('mongoose');

const productSchema = new Schema(
  {
    name:     { type: String, required: [true, 'Product name is required'], trim: true, maxLength: 100 },
    sku:      { type: String, required: true, unique: true, uppercase: true },
    brand:    String,                                   // shorthand for { type: String }
    category: { type: String, enum: { values: ['Mobiles', 'Laptops', 'Audio', 'Wearables', 'Accessories'], message: '{VALUE} is not a valid category' } },
    price:    { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    stock:    { type: Number, default: 0, min: 0 },
    tags:     [String],
    specs:    { ram: String, storage: String },          // nested object
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }                                   // adds createdAt, updatedAt
);

module.exports = model('Product', productSchema);       // collection: products`,
      tip: 'Mongoose 8 uses strict mode by default: fields that are not in the schema are silently dropped when you save. That is why a typo like "prise" never reaches the database.',
    },
    {
      heading: 'CRUD with Mongoose models',
      content: `Every model method returns a **Query** or a **Promise**, so you use \`await\`.

**Create**
- \`await Product.create({ ... })\` – validates then inserts (one or an array)
- \`const p = new Product({ ... }); await p.save();\` – same, in two steps
- \`await Product.insertMany([...])\` – fast bulk insert (validates each document)

**Read**
- \`Product.find(filter, projection)\` → array (empty array if none)
- \`Product.findOne(filter)\` / \`Product.findById(id)\` → document or \`null\`
- Chain query helpers: \`.select('name price')\`, \`.sort({ price: -1 })\`, \`.skip(10)\`, \`.limit(10)\`, \`.lean()\`
- \`Product.countDocuments(filter)\`, \`Product.exists(filter)\`

**Update**
- \`Product.findByIdAndUpdate(id, update, { new: true, runValidators: true })\` → returns the updated document
- \`Product.updateOne(filter, update)\` / \`updateMany\` → returns \`{ matchedCount, modifiedCount }\`
- Or load, change and \`await doc.save()\` (runs all validators and save middleware)

**Delete**
- \`Product.findByIdAndDelete(id)\` → deleted document or \`null\`
- \`Product.deleteOne(filter)\` / \`deleteMany(filter)\` → \`{ deletedCount }\`

Mongoose translates each call into a normal MongoDB command – for example \`Product.find({ category: 'Audio' }).sort({ price: -1 }).limit(2)\` is exactly \`db.products.find({ category: 'Audio' }).sort({ price: -1 }).limit(2)\` in mongosh.`,
      points: [
        'find() never returns null – it returns [] when nothing matches',
        'findById(id) is a shortcut for findOne({ _id: id }) and casts the string to ObjectId',
        'Update validators are OFF by default for update queries – pass runValidators: true',
        'Pass { new: true } (or returnDocument: "after") to get the document after the update',
      ],
      tip: 'Mongoose wraps plain update objects in $set automatically: Product.updateOne({ _id }, { price: 500 }) becomes { $set: { price: 500 } }. With the raw driver you must write $set yourself.',
    },
    {
      heading: 'Validation: built-in and custom validators',
      content: `Validation runs automatically on \`save()\` and \`create()\` (and on updates when \`runValidators: true\`). If any rule fails, Mongoose throws a **ValidationError** and nothing is written.

**Built-in validators:**
- All types: \`required\`
- Number/Date: \`min\`, \`max\`
- String: \`enum\`, \`match\` (regex), \`minLength\`, \`maxLength\`

**Custom validators** use the \`validate\` option with a function that returns \`true\`/\`false\` (or a Promise for async checks). Inside the function \`this\` is the document on save.

Custom error messages: use the array syntax \`min: [0, 'Price cannot be negative']\` or the \`message\` property. \`{VALUE}\` and \`{PATH}\` placeholders are replaced automatically.

**Important:** \`unique: true\` is **not a validator**. It only builds a unique index. Duplicates are rejected by MongoDB itself with error **code 11000** (E11000), which you must handle separately.`,
      syntax: `const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,                       // unique index, not a validator
    lowercase: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    validate: {
      validator: (v) => /^[6-9]\\d{9}$/.test(v),        // Indian mobile number
      message: (props) => props.value + ' is not a valid mobile number',
    },
  },
  age: { type: Number, min: [18, 'Must be at least 18'], max: 100 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});`,
    },
    {
      heading: 'Error handling: ValidationError, CastError and E11000',
      content: `Three errors appear in every Mongoose API. Learn to recognise them:

1. **ValidationError** (\`err.name === 'ValidationError'\`) – a schema rule failed. \`err.errors\` is an object with one entry per invalid field, each with a \`message\`. Respond with **400 Bad Request**.
2. **CastError** (\`err.name === 'CastError'\`) – a value could not be converted to the schema type, most often an invalid ObjectId in \`/api/products/abc\`. \`err.path\` and \`err.value\` tell you which. Respond with **400** (or 404).
3. **Duplicate key** (\`err.code === 11000\`) – a unique index was violated. \`err.keyValue\` shows the duplicate value, e.g. \`{ email: 'asha@example.com' }\`. Respond with **409 Conflict**.

Put this mapping in **one central Express error middleware** instead of repeating try/catch logic in every route. In Express 5, a rejected promise from an \`async\` handler is passed to the error middleware automatically.`,
      syntax: `// src/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ' + err.path + ': ' + err.value });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: field + ' already exists' });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
};`,
      tip: 'Never send err.stack or the raw Mongo error to the client in production – it leaks internal details. Log it on the server and send a clean message.',
    },
  ],
  examples: [
    {
      title: 'Connect, define a schema and create the first product',
      scenario: 'Set up a Node.js project that connects to MongoDB with Mongoose 8, defines a Product model with timestamps and validation, and creates and reads a product.',
      steps: [
        'Run npm init -y and npm install mongoose dotenv',
        'Add MONGODB_URI=mongodb://127.0.0.1:27017/shop (or your Atlas URI) to .env',
        'Create product.model.js and app.js with the code below',
        'Run node app.js and look at the printed document – note _id, createdAt, updatedAt and __v',
      ],
      code: `// product.model.js
const { Schema, model } = require('mongoose');

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['Mobiles', 'Laptops', 'Audio', 'Wearables', 'Accessories'] },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);
module.exports = model('Product', productSchema);

// app.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./product.model');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const p = await Product.create({ name: '  OnePlus 12  ', category: 'Mobiles', price: '64999', tags: ['5g'] });
  console.log(p.toObject());

  const cheap = await Product.find({ price: { $lt: 70000 } }).select('name price').sort({ price: 1 });
  console.log(cheap.length, 'products under 70000');

  await mongoose.connection.close();
}
main().catch((err) => { console.error(err); process.exit(1); });`,
      result: `Connected
{
  name: 'OnePlus 12',
  category: 'Mobiles',
  price: 64999,
  stock: 0,
  tags: [ '5g' ],
  _id: new ObjectId('6650f1c2a8b4d2e1f0a1b2c3'),
  createdAt: 2025-06-01T10:00:00.000Z,
  updatedAt: 2025-06-01T10:00:00.000Z,
  __v: 0
}
1 products under 70000        (ids and dates will differ on your machine)`,
      explanation: '`trim: true` removed the spaces, the string "64999" was **cast** to the number 64999, `stock` got its default 0, and `timestamps` added createdAt/updatedAt. `__v` is the **version key** Mongoose uses to detect conflicting array updates. The collection name is `products` (lowercase plural of "Product").',
    },
    {
      title: 'What Mongoose sends: find + select + sort + limit',
      scenario: 'Your controller runs Product.find({ category: "Laptops", price: { $lte: 60000 } }).select("name price stock").sort({ price: 1 }).limit(5). Run the identical raw query in the shell to see the result.',
      steps: [
        'Open the MongoDB Shell Lab with the shop dataset',
        'Translate .select("name price stock") into the projection { name: 1, price: 1, stock: 1 }',
        'Add .sort({ price: 1 }) and .limit(5) exactly as in Mongoose',
        'Run it and compare with what your API would return',
      ],
      code: `// Mongoose: Product.find({ category: 'Laptops', price: { $lte: 60000 } })
//             .select('name price stock').sort({ price: 1 }).limit(5)
db.products.find(
  { category: 'Laptops', price: { $lte: 60000 } },
  { name: 1, price: 1, stock: 1 }
).sort({ price: 1 }).limit(5)`,
      mongo: {
        dataset: 'shop',
        query: `// Mongoose: Product.find({ category: 'Laptops', price: { $lte: 60000 } })
//             .select('name price stock').sort({ price: 1 }).limit(5)
db.products.find(
  { category: 'Laptops', price: { $lte: 60000 } },
  { name: 1, price: 1, stock: 1 }
).sort({ price: 1 }).limit(5)`,
      },
      result: `{ _id: 5, name: 'IdeaPad Slim 3', price: 45990, stock: 15 }
{ _id: 6, name: 'Inspiron 15', price: 52990, stock: 0 }`,
      explanation: 'Mongoose query helpers map one-to-one onto MongoDB cursor methods: `.select()` → projection, `.sort()` → sort, `.limit()` → limit. Knowing the raw query helps you debug with `mongoose.set("debug", true)`, which logs every command Mongoose sends.',
    },
    {
      title: 'findByIdAndUpdate with { new: true } = findOneAndUpdate returning "after"',
      scenario: 'When an order is placed you decrease stock and want the updated product back. In Mongoose: Product.findByIdAndUpdate(5, { $inc: { stock: -1 } }, { new: true, runValidators: true }). Mongoose also sets updatedAt because of timestamps.',
      steps: [
        'Open the shop dataset',
        'Run findOneAndUpdate on _id 5 with $inc stock -1 and $set updatedAt',
        'Pass returnDocument: "after" (what { new: true } means in Mongoose)',
        'Check that stock went from 15 to 14 and updatedAt was added',
      ],
      code: `db.products.findOneAndUpdate(
  { _id: 5 },
  { $inc: { stock: -1 }, $set: { updatedAt: ISODate('2025-06-01T10:00:00Z') } },
  { returnDocument: 'after' }
)`,
      mongo: {
        dataset: 'shop',
        query: `db.products.findOneAndUpdate(
  { _id: 5 },
  { $inc: { stock: -1 }, $set: { updatedAt: ISODate('2025-06-01T10:00:00Z') } },
  { returnDocument: 'after' }
)`,
      },
      result: `{
  _id: 5,
  name: 'IdeaPad Slim 3',
  brand: 'Lenovo',
  category: 'Laptops',
  price: 45990,
  stock: 14,
  rating: 4.1,
  tags: [ 'windows', 'budget' ],
  updatedAt: ISODate('2025-06-01T10:00:00.000Z')
}`,
      explanation: 'By default findOneAndUpdate/findByIdAndUpdate returns the document **before** the update. `{ new: true }` in Mongoose (or `returnDocument: "after"`) returns the updated one, which is what an API usually wants to send back. With `timestamps: true`, Mongoose adds `$set: { updatedAt: new Date() }` to every update for you.',
    },
    {
      title: 'Duplicate key error E11000 from a unique index',
      scenario: 'The customer schema has email: { type: String, unique: true }. Mongoose builds a unique index on email. See the error MongoDB returns when a second customer signs up with an existing email.',
      steps: [
        'Open the shop dataset',
        'Create the unique index that Mongoose would build from unique: true',
        'Insert a customer with an email that already exists inside try/catch',
        'Print the error code and message – this is what err.code === 11000 checks',
      ],
      code: `db.customers.createIndex({ email: 1 }, { unique: true })
try {
  db.customers.insertOne({ _id: 109, name: 'Copy Cat', email: 'asha@example.com' })
} catch (e) {
  print(e.code + ' ' + e.message)
}`,
      mongo: {
        dataset: 'shop',
        query: `db.customers.createIndex({ email: 1 }, { unique: true })
try {
  db.customers.insertOne({ _id: 109, name: 'Copy Cat', email: 'asha@example.com' })
} catch (e) {
  print(e.code + ' ' + e.message)
}`,
      },
      result: `'email_1'
11000 E11000 duplicate key error collection: shop.customers index: email_1 dup key: { email: "asha@example.com" }`,
      explanation: 'The insert is rejected by MongoDB, not by Mongoose validation – that is why it is not a ValidationError. In your error middleware check `err.code === 11000` and read `err.keyValue` (`{ email: "asha@example.com" }`) to build a friendly "email already exists" message with status 409.',
    },
    {
      title: 'API Lab: create/read products with Mongoose-style errors',
      scenario: 'Simulate a Mongoose-backed products API: POST validates like a schema (ValidationError), GET /:id rejects invalid ObjectIds (CastError) and duplicate SKUs give E11000 – all mapped by one error middleware. The fake model uses an in-memory array so it runs in the API Lab.',
      steps: [
        'Open the API Lab and paste the code',
        'Send the requests in order: valid create, invalid create, duplicate SKU, bad id, missing id, list',
        'Compare the status codes: 201, 400, 409, 400, 404, 200',
        'In a real project replace the fake Product object with the Mongoose model – the controllers and error middleware stay the same',
      ],
      code: `// Real project (Mongoose 8):
// router.post('/', async (req, res) => res.status(201).json(await Product.create(req.body)));
// router.get('/:id', async (req, res) => {
//   const p = await Product.findById(req.params.id);   // CastError if id is invalid
//   if (!p) return res.status(404).json({ message: 'Product not found' });
//   res.json(p);
// });
// app.use(errorHandler);   // maps ValidationError / CastError / 11000`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// ---- fake "Mongoose model" with in-memory data ----
const products = [{ _id: '000000000000000000000001', name: 'iPhone 15', sku: 'APL-IP15', price: 79900 }];
let seq = 1;
const isObjectId = (id) => /^[0-9a-f]{24}$/.test(id);
const Product = {
  async create(data) {
    const errors = {};
    if (!data.name) errors.name = { message: 'Product name is required' };
    if (data.price === undefined) errors.price = { message: 'Path \`price\` is required.' };
    else if (Number(data.price) < 0) errors.price = { message: 'Price cannot be negative' };
    if (Object.keys(errors).length) throw Object.assign(new Error('Validation failed'), { name: 'ValidationError', errors });
    const sku = String(data.sku || '').toUpperCase();
    if (products.some((p) => p.sku === sku)) throw Object.assign(new Error('E11000 duplicate key error'), { code: 11000, keyValue: { sku } });
    seq++;
    const doc = { _id: seq.toString(16).padStart(24, '0'), name: data.name.trim(), sku, price: Number(data.price) };
    products.push(doc);
    return doc;
  },
  async findById(id) {
    if (!isObjectId(id)) throw Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError', path: '_id', value: id });
    return products.find((p) => p._id === id) || null;
  },
  async find() { return products; },
};

// ---- routes (Express 5 forwards async errors automatically) ----
app.post('/api/products', async (req, res) => {
  res.status(201).json(await Product.create(req.body));
});
app.get('/api/products', async (req, res) => {
  res.json(await Product.find());
});
app.get('/api/products/:id', async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
});

// ---- central error middleware ----
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', errors: Object.values(err.errors).map((e) => e.message) });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ' + err.path + ': ' + err.value });
  if (err.code === 11000) return res.status(409).json({ message: Object.keys(err.keyValue)[0] + ' already exists' });
  res.status(500).json({ message: 'Something went wrong' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          {
            method: 'POST',
            url: '/api/products',
            body: { name: ' Galaxy S24 ', sku: 'sam-s24', price: 74999 },
          },
          { method: 'POST', url: '/api/products', body: { price: -10 } },
          {
            method: 'POST',
            url: '/api/products',
            body: { name: 'iPhone 15 copy', sku: 'apl-ip15', price: 1 },
          },
          { method: 'GET', url: '/api/products/abc' },
          { method: 'GET', url: '/api/products/000000000000000000000009' },
          { method: 'GET', url: '/api/products' },
        ],
      },
      result: `POST /api/products → 201 {"_id":"000000000000000000000002","name":"Galaxy S24","sku":"SAM-S24","price":74999}
POST /api/products → 400 {"message":"Validation failed","errors":["Product name is required","Price cannot be negative"]}
POST /api/products → 409 {"message":"sku already exists"}
GET /api/products/abc → 400 {"message":"Invalid _id: abc"}
GET /api/products/000000000000000000000009 → 404 {"message":"Product not found"}
GET /api/products → 200 [{"_id":"000000000000000000000001","name":"iPhone 15","sku":"APL-IP15","price":79900},{"_id":"000000000000000000000002","name":"Galaxy S24","sku":"SAM-S24","price":74999}]`,
      explanation: 'The fake model throws errors with the same shape as Mongoose: `name: "ValidationError"` with an `errors` map, `name: "CastError"` with `path`/`value`, and `code: 11000` with `keyValue`. One error middleware turns each into the right HTTP status. A valid-looking but non-existing id returns `null` (→ 404), while an invalid id throws CastError (→ 400) – interviewers love this distinction.',
    },
  ],
  interview: [
    {
      q: 'What is Mongoose and how is it different from the MongoDB Node.js driver?',
      a: 'Mongoose is an ODM library built on top of the official driver. The driver gives raw access with no schema. Mongoose adds schemas, type casting, validation, models with helper methods, middleware (hooks), populate, virtuals and plugins. It trades a little performance for structure and safety.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between a Schema and a Model?',
      a: 'A Schema defines the structure of documents – fields, types, defaults, validators, indexes, methods. A Model is compiled from a schema with mongoose.model("Product", schema); it is a class bound to a collection (products) used to create and query documents. A document is an instance of a model.',
      level: 'Easy',
    },
    {
      q: 'How does Mongoose decide the collection name?',
      a: 'It lowercases and pluralises the model name: Product → products, Category → categories, Person → people. You can override it with the third argument of model() or the schema option { collection: "my_products" }.',
      level: 'Easy',
    },
    {
      q: 'What does timestamps: true do?',
      a: 'It adds createdAt and updatedAt Date fields. createdAt is set when the document is created; updatedAt is set on create and refreshed on every save() and update query (Mongoose adds $set: { updatedAt } to updates). You can rename them: { timestamps: { createdAt: "created_on" } }.',
      level: 'Easy',
    },
    {
      q: 'Is unique: true a validator in Mongoose?',
      a: 'No. unique only tells Mongoose to build a unique index in MongoDB. The duplicate is rejected by the database with error code 11000 (E11000 duplicate key error), not by Mongoose validation. Also, if the collection already contains duplicates the index build fails, and autoIndex should usually be disabled in production with indexes created by migrations.',
      level: 'Medium',
    },
    {
      q: 'Do validators run on findByIdAndUpdate / updateOne?',
      a: 'Not by default. Update validators run only when you pass { runValidators: true }. Even then they behave slightly differently: they only validate the paths in the update and "this" is the Query, not the document. For full validation and save middleware, load the document, modify it and call save().',
      level: 'Medium',
    },
    {
      q: 'What is the difference between ValidationError and CastError?',
      a: 'CastError happens when a value cannot be converted to the schema type, for example findById("abc") where "abc" is not a valid ObjectId, or price: "ten" for a Number. ValidationError happens when a value has the right type but breaks a rule (required, min, enum, match, custom validator). When saving, cast failures are reported inside the ValidationError.errors map as CastError entries.',
      level: 'Medium',
    },
    {
      q: 'What is __v in a Mongoose document?',
      a: 'It is the version key, added by default. Mongoose increments it when an array is modified via save(), so it can detect conflicting concurrent updates to arrays (it throws a VersionError). You can rename it with versionKey: "_version" or disable it with versionKey: false, and you can enable full optimistic concurrency with optimisticConcurrency: true.',
      level: 'Hard',
    },
    {
      q: 'What does strict mode mean in Mongoose?',
      a: 'With strict: true (the default) any field not defined in the schema is ignored when creating or saving documents. strict: "throw" throws an error instead. For queries, Mongoose 7+ sets strictQuery: false by default, so unknown fields in filters are passed through. This protects against typos and against clients injecting extra fields like isAdmin.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between findByIdAndUpdate and doc.save()?',
      a: 'findByIdAndUpdate sends one atomic update command (fast, no document loaded, validators only with runValidators, save middleware does NOT run). save() loads the doc first, runs all validators and pre/post save middleware (e.g. password hashing) and then writes only the changed paths. Use save() when hooks or full validation matter.',
      level: 'Hard',
    },
    {
      q: 'How should you connect Mongoose in an Express app?',
      a: 'Connect once at startup with await mongoose.connect(process.env.MONGODB_URI), start app.listen only after it succeeds, exit or retry on failure, keep the URI in .env, and reuse the default connection (Mongoose manages a pool). Use mongoose.connection events for logging and close it on SIGINT/SIGTERM.',
      level: 'Medium',
    },
    {
      q: 'How do you return clean error messages for Mongoose errors in an API?',
      a: 'Use one Express error-handling middleware (err, req, res, next). Map err.name === "ValidationError" to 400 with Object.values(err.errors).map(e => e.message), err.name === "CastError" to 400 "Invalid id", err.code === 11000 to 409 using err.keyValue, and everything else to 500 with a generic message, logging the full error on the server.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a Student model (college app) with: name (required, trimmed, 2-50 chars), email (required, unique, lowercase, valid format), branch (enum CSE/IT/ENTC/MECH), year (1-4), cgpa (0-10, default 0), skills (array of strings) and timestamps.',
      hint: 'Use minLength/maxLength, match, enum, min/max and { timestamps: true }.',
      solution: `const { Schema, model } = require('mongoose');

const studentSchema = new Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minLength: 2, maxLength: 50 },
    email: {
      type: String, required: true, unique: true, lowercase: true, trim: true,
      match: [/^\\S+@\\S+\\.\\S+$/, 'Invalid email'],
    },
    branch: { type: String, enum: { values: ['CSE', 'IT', 'ENTC', 'MECH'], message: '{VALUE} is not a valid branch' } },
    year: { type: Number, min: 1, max: 4 },
    cgpa: { type: Number, min: 0, max: 10, default: 0 },
    skills: [String],
  },
  { timestamps: true }
);

module.exports = model('Student', studentSchema);`,
    },
    {
      task: 'Write an async script that inserts 3 students with Student.insertMany, finds all CSE students sorted by cgpa (desc) showing only name and cgpa, updates one student\'s cgpa with findByIdAndUpdate (returning the new doc and running validators) and deletes a student by id.',
      hint: '.select("name cgpa").sort({ cgpa: -1 }); { new: true, runValidators: true }.',
      solution: `require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./student.model');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const docs = await Student.insertMany([
    { name: 'Asha Patil', email: 'asha@college.in', branch: 'CSE', year: 3, cgpa: 8.9 },
    { name: 'Neha Shah', email: 'neha@college.in', branch: 'CSE', year: 4, cgpa: 9.4 },
    { name: 'Ravi Kumar', email: 'ravi@college.in', branch: 'IT', year: 2, cgpa: 7.2 },
  ]);

  const cse = await Student.find({ branch: 'CSE' }).select('name cgpa').sort({ cgpa: -1 });
  console.log(cse);

  const updated = await Student.findByIdAndUpdate(docs[2]._id, { cgpa: 7.6 }, { new: true, runValidators: true });
  console.log('Updated:', updated.cgpa);

  const removed = await Student.findByIdAndDelete(docs[2]._id);
  console.log('Deleted:', removed.name);

  await mongoose.connection.close();
}
main().catch(console.error);`,
    },
    {
      task: 'Add a custom validator to the Student schema so that skills cannot contain more than 10 items, and an async custom validator that rejects email domains other than "college.in".',
      hint: 'validate: { validator: fn, message } – the validator can be an async function.',
      solution: `skills: {
  type: [String],
  validate: {
    validator: (arr) => arr.length <= 10,
    message: 'A student can list at most 10 skills',
  },
},
email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  validate: {
    validator: async (v) => v.endsWith('@college.in'),   // could also call a DB/API
    message: (props) => props.value + ' must be a college.in email',
  },
},`,
    },
    {
      task: 'Write the Express error middleware that converts Mongoose errors into API responses: ValidationError → 400 with an array of messages, CastError → 400 "Invalid <path>", duplicate key → 409 "<field> already exists", others → 500.',
      hint: 'Check err.name and err.code; read err.errors and err.keyValue.',
      solution: `module.exports = function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ' + err.path });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: field + ' already exists' });
  }
  console.error(err);
  res.status(err.status || 500).json({ message: 'Internal server error' });
};

// app.js – register AFTER all routes
app.use(require('./middleware/errorHandler'));`,
    },
    {
      task: 'In the shop dataset write the raw shell query that Mongoose would send for: Customer.find({ city: "Pune" }).select("name age -_id").sort({ age: -1 }).',
      hint: 'A "-_id" in select means _id: 0 in the projection.',
      solution: `db.customers.find({ city: 'Pune' }, { name: 1, age: 1, _id: 0 }).sort({ age: -1 })
// { name: 'Imran Khan', age: 35 }
// { name: 'Asha Patil', age: 24 }`,
    },
  ],
  quiz: [
    {
      question: 'What does mongoose.model("Category", categorySchema) use as the collection name by default?',
      options: ['Category', 'category', 'categories', 'categorys'],
      answer: 2,
      explanation: 'Mongoose lowercases and pluralises the model name with English rules, so Category → categories.',
    },
    {
      question: 'Which error does Product.findById("abc") produce?',
      options: [
        'CastError',
        'ValidationError',
        'E11000 duplicate key error',
        'It returns an empty array',
      ],
      answer: 0,
      explanation: '"abc" cannot be cast to an ObjectId, so Mongoose throws a CastError before querying the database.',
    },
    {
      question: 'Which option makes findByIdAndUpdate return the updated document and apply schema validators?',
      options: [
        '{ upsert: true }',
        '{ lean: true }',
        '{ strict: false }',
        '{ new: true, runValidators: true }',
      ],
      answer: 3,
      explanation: 'new: true returns the document after the update; runValidators: true turns on update validators, which are off by default.',
    },
    {
      question: 'A user signs up with an email that already exists and the schema has email: { unique: true }. What do you get?',
      options: [
        'A ValidationError with message "unique"',
        'A MongoServerError with code 11000',
        'A CastError',
        'The second user silently replaces the first',
      ],
      answer: 1,
      explanation: 'unique creates a unique index; MongoDB rejects the insert with duplicate key error code 11000. It is not a Mongoose validator.',
    },
    {
      question: 'What does { timestamps: true } in schema options add?',
      options: [
        'A __v field',
        'An expireAt TTL field',
        'createdAt and updatedAt fields',
        'An index on _id',
      ],
      answer: 2,
      explanation: 'timestamps adds createdAt and updatedAt Date fields that Mongoose maintains automatically. __v is the version key, added separately.',
    },
  ],
};
