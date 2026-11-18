export default {
  id: 'day-18-mongoose-schemas-models-validation',
  title: 'Mongoose: Schemas, Models and Validation',
  module: 'Module 3: Databases',
  day: 18,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'MongoDB accepts any shape of data – including typos and garbage. Mongoose, the most popular MongoDB library for Node.js, adds schemas, type casting, validation, defaults, hooks and handy model methods. Today you design schemas and models and turn validation errors into clean API responses.',
  objectives: [
    'Explain what an ODM is and why Mongoose is used on top of the MongoDB driver',
    'Connect with mongoose.connect() and define schemas with types, required, defaults, trim, enum, min/max and match',
    'Write custom validators and understand that unique is an index, not a validator',
    'Create models and documents; use timestamps, virtuals, instance methods, statics and pre-save hooks',
    'Map Mongoose ValidationError, CastError and duplicate-key errors to HTTP 400/409 in Express 5',
  ],
  theory: [
    {
      heading: 'What is Mongoose? (the building-plan analogy)',
      content: `MongoDB is like an open plot of land – you can build anything anywhere. Great freedom, but one careless worker can put a door on the roof. **Mongoose** gives you an **approved building plan** (schema): every new document is checked against the plan before it is saved.

Mongoose is an **ODM – Object Data Modeling** library (the MongoDB cousin of an ORM). It provides:
- **Schemas** – the shape of documents: field names, types, rules.
- **Casting** – \`"21"\` becomes the number \`21\`, \`"2026-01-05"\` becomes a Date.
- **Validation** – required, min/max, enum, regex match, custom validators.
- **Models** – classes with ready-made methods: \`create\`, \`find\`, \`findById\`, \`updateOne\`, \`deleteOne\` ...
- **Middleware (hooks)**, **virtuals**, **population** (relationships, Day 19), query builders.

Install: \`npm install mongoose\` (Mongoose 8 uses the official mongodb driver internally).`,
      syntax: `const mongoose = require('mongoose');

await mongoose.connect(process.env.MONGODB_URI); // e.g. mongodb+srv://.../college
console.log('MongoDB connected');

mongoose.connection.on('error', err => console.error(err));
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));`,
      tip: 'Connect ONCE when the app starts (before app.listen) and reuse the connection. Mongoose buffers queries until the connection is ready, so a wrong URI shows up as "buffering timed out after 10000ms".',
    },
    {
      heading: 'Schemas: types and built-in options',
      content: `A schema maps field names to **SchemaTypes**: \`String\`, \`Number\`, \`Boolean\`, \`Date\`, \`Buffer\`, \`mongoose.Schema.Types.ObjectId\`, \`Array\` (\`[String]\`), \`Map\`, \`mongoose.Schema.Types.Decimal128\`, nested objects and sub-schemas.

Common options per field:
- \`required: [true, 'Custom message']\`
- \`default: 'Node'\` or a function \`default: () => new Date()\`
- Strings: \`trim\`, \`lowercase\`, \`uppercase\`, \`minlength\`, \`maxlength\`, \`enum\`, \`match: /regex/\`
- Numbers / Dates: \`min\`, \`max\`
- \`select: false\` – hide by default (passwords!), \`immutable: true\` – cannot change after creation
- \`index: true\`, \`unique: true\` – create indexes

Schema options (second argument): \`{ timestamps: true }\` adds \`createdAt\`/\`updatedAt\`; \`toJSON: { virtuals: true }\` includes virtuals in JSON; \`strict: true\` (default) silently drops fields that are not in the schema.`,
    },
    {
      heading: 'Validation: built-in, custom and the unique trap',
      content: `Validation runs automatically on \`save()\` / \`Model.create()\`. If any rule fails, Mongoose throws a **ValidationError** whose \`errors\` object contains one entry per failing field (\`err.errors.email.message\`). All failing fields are reported at once.

**Custom validators**: \`validate: { validator: v => /^[6-9]\\d{9}$/.test(v), message: props => props.value + ' is not valid' }\`. A validator may also be \`async\` (e.g. check an external service).

**unique is NOT a validator.** It builds a unique **index** in MongoDB. A duplicate is rejected by the database with a \`MongoServerError\` code **11000** (not a ValidationError), and only if the index already exists – so build indexes before inserting (\`autoIndex\` does it on startup in development; in production create indexes via migrations or \`Model.syncIndexes()\`).

**Updates:** \`findByIdAndUpdate\` / \`updateOne\` do NOT run validators unless you pass \`{ runValidators: true }\` (Day 19).

**CastError:** when a value cannot be converted – e.g. \`findById('abc')\` – Mongoose throws a CastError. Map it to HTTP 400.`,
      tip: 'Validate in the schema (last line of defence) AND optionally in the request layer with zod/express-validator (Day 24) for nicer messages before hitting the database.',
    },
    {
      heading: 'Models and documents',
      content: `\`const Student = mongoose.model('Student', studentSchema)\` compiles the schema into a **model**. Mongoose pluralises and lower-cases the name for the collection: \`Student\` → \`students\`, \`Person\` → \`people\`.

- **Create**: \`await Student.create({...})\` or \`const s = new Student({...}); await s.save();\`
- **Read**: \`Student.find(filter)\`, \`Student.findById(id)\`, \`Student.findOne(filter)\`, chain \`.select('name email')\`, \`.sort({ name: 1 })\`, \`.limit(10)\`, \`.lean()\`
- **Update / Delete**: tomorrow (Day 19)

A **document** is a model instance with change tracking (\`doc.isModified('name')\`), methods (\`save\`, \`validate\`, \`toJSON\`) and virtuals. Every saved doc gets \`_id\` (ObjectId) and \`__v\` (version key used for array concurrency).

\`.lean()\` returns plain JS objects – faster and lighter, but without virtuals, methods or save(). Use it for read-only API responses.`,
    },
    {
      heading: 'Virtuals, instance methods, statics and hooks',
      content: `- **Virtual** – a computed property not stored in the DB: \`fullName\`, \`finalPrice\`. Defined with \`schema.virtual('x').get(function () { ... })\`. Use a normal \`function\`, not an arrow, so \`this\` is the document.
- **Instance method** – \`schema.methods.isInStock = function () {...}\` → \`product.isInStock()\`. Example: \`user.comparePassword()\` (Day 22).
- **Static** – \`schema.statics.findByEmail = function (email) { return this.findOne({ email }) }\` → \`User.findByEmail(...)\`.
- **Middleware (hooks)** – \`schema.pre('save', function () {...})\` runs before saving (slugify, hash a password); \`post('save')\` after. In Mongoose 8, hooks can be \`async\` or plain functions – no need to call \`next()\`.

Define all of these BEFORE calling \`mongoose.model()\`.`,
      tip: 'Coming next (Day 19): full CRUD with Mongoose, relationships with ObjectId references and populate().',
    },
  ],
  examples: [
    {
      title: 'Designing a Student schema with validation (verified run)',
      scenario: 'Create a Student model with built-in and custom validation, then see casting, defaults, ValidationError and the duplicate-key error in action.',
      steps: [
        'mkdir mongoose-demo && cd mongoose-demo && npm init -y && npm i mongoose',
        'Create models/Student.js with the schema below',
        'Create validate-demo.js below and set MONGODB_URI (Atlas or mongodb://127.0.0.1:27017/college)',
        'Run node validate-demo.js',
        'Open Compass → college → students: only the valid student was saved',
      ],
      code: `// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must have at least 2 characters'],
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,                       // creates a unique INDEX (not a validator)
      lowercase: true,
      trim: true,
      match: [/^\\S+@\\S+\\.\\S+$/, 'Email is invalid'],
    },
    age: { type: Number, min: [16, 'Minimum age is 16'], max: 60 },
    course: {
      type: String,
      enum: { values: ['Node', 'React', 'Java'], message: '{VALUE} is not a valid course' },
      default: 'Node',
    },
    skills: [String],
    phone: {
      type: String,
      validate: {
        validator: (v) => /^[6-9]\\d{9}$/.test(v),
        message: (props) => props.value + ' is not a valid Indian mobile number',
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }                    // adds createdAt and updatedAt
);

module.exports = mongoose.model('Student', studentSchema); // collection: "students"

// validate-demo.js
const mongoose = require('mongoose');
const Student = require('./models/Student');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college');
  await Student.init(); // wait until indexes (unique email) are built

  // 1. valid document: casting, trim, lowercase, defaults
  const asha = await Student.create({ name: '  Asha  ', email: 'ASHA@Mail.com', age: '21', phone: '9876543210' });
  console.log('Saved:', asha.name, asha.email, asha.age, typeof asha.age, asha.course, asha.isActive);
  console.log('Has timestamps:', asha.createdAt instanceof Date, asha.updatedAt instanceof Date);

  // 2. invalid document: collect every validation message
  try {
    await Student.create({ name: 'R', email: 'not-an-email', age: 12, course: 'PHP', phone: '12345' });
  } catch (err) {
    console.log(err.name);
    for (const [field, e] of Object.entries(err.errors)) console.log(' -', field + ':', e.message);
  }

  // 3. duplicate email -> MongoServerError 11000 (unique index, not a validator)
  try {
    await Student.create({ name: 'Asha Copy', email: 'asha@mail.com' });
  } catch (err) {
    console.log('Duplicate:', err.code, Object.keys(err.keyValue));
  }

  // 4. validate without saving
  const draft = new Student({ email: 'x@y.com' });
  const vErr = draft.validateSync();
  console.log('validateSync:', vErr.errors.name.message);

  await mongoose.disconnect();
}
main().catch(console.error);`,
      result: `Saved: Asha asha@mail.com 21 number Node true
Has timestamps: true true
ValidationError
 - name: Name must have at least 2 characters
 - email: Email is invalid
 - age: Minimum age is 16
 - course: PHP is not a valid course
 - phone: 12345 is not a valid Indian mobile number
Duplicate: 11000 [ 'email' ]
validateSync: Name is required
(verified with Mongoose 8 on MongoDB 8)`,
      explanation: '"  Asha  " was trimmed, "ASHA@Mail.com" lower-cased and the string "21" cast to the number 21; course and isActive got defaults. The invalid document produced ONE ValidationError listing all five problems. The duplicate email was rejected by the unique index with code 11000, which is a different error type.',
    },
    {
      title: 'Virtuals, methods, statics and a pre-save hook (verified run)',
      scenario: 'A Product model that computes the discounted price, auto-generates a URL slug and offers helper methods.',
      steps: [
        'Create models/Product.js with the schema, virtual, method, static and hook',
        'Create features-demo.js that inserts three products and calls each feature',
        'Run node features-demo.js',
        'Notice that finalPrice is NOT stored in Compass – it is computed',
      ],
      code: `// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: String,
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// virtual: computed, NOT stored in MongoDB
productSchema.virtual('finalPrice').get(function () {
  return Math.round(this.price * (1 - this.discountPercent / 100));
});

// instance method: works on one document
productSchema.methods.isInStock = function () {
  return this.stock > 0;
};

// static method: works on the Model
productSchema.statics.findCheaperThan = function (max) {
  return this.find({ price: { $lt: max } }).sort({ price: 1 });
};

// middleware (hook): runs before every save()
productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().split(' ').join('-');
  }
});

module.exports = mongoose.model('Product', productSchema);

// features-demo.js
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shop');

  await Product.create([
    { name: 'Wireless Mouse', price: 800, discountPercent: 25, stock: 10 },
    { name: 'USB Cable', price: 150 },
    { name: 'Mechanical Keyboard', price: 3500, discountPercent: 10, stock: 3 },
  ]);

  const mouse = await Product.findOne({ name: 'Wireless Mouse' });
  console.log('slug (pre-save hook):', mouse.slug);
  console.log('finalPrice (virtual):', mouse.finalPrice);
  console.log('isInStock (method):', mouse.isInStock());

  const cheap = await Product.findCheaperThan(1000);
  console.log('cheaper than 1000 (static):', cheap.map(p => p.name));

  const cable = await Product.findOne({ slug: 'usb-cable' }).lean(); // plain object, no virtuals/methods
  console.log('lean result has finalPrice?', 'finalPrice' in cable, '| stock default:', cable.stock);

  const json = mouse.toJSON();
  console.log('toJSON keys:', Object.keys(json).filter(k => ['name', 'finalPrice', 'createdAt'].includes(k)));

  await mongoose.disconnect();
}
main().catch(console.error);`,
      result: `slug (pre-save hook): wireless-mouse
finalPrice (virtual): 600
isInStock (method): true
cheaper than 1000 (static): [ 'USB Cable', 'Wireless Mouse' ]
lean result has finalPrice? false | stock default: 0
toJSON keys: [ 'name', 'createdAt', 'finalPrice' ]`,
      explanation: 'The pre-save hook built the slug from the name. finalPrice = 800 × 0.75 = 600 is computed on access and included in JSON because of toJSON: { virtuals: true }. lean() returns a plain object, so virtuals are missing – a trade-off for speed.',
    },
    {
      title: 'Express 5 + Mongoose API with proper error mapping',
      scenario: 'Expose the Student model over HTTP. Validation problems → 400, bad ids → 400, duplicate email → 409, unknown id → 404.',
      steps: [
        'npm i express mongoose',
        'Reuse models/Student.js from the first example',
        'Create app.js below: routes are async and simply await the model (Express 5 forwards errors)',
        'The error middleware translates ValidationError, CastError and code 11000',
        'Start: node app.js, then send the requests (real run results shown in the explanation)',
      ],
      code: `// app.js – Express 5 + Mongoose 8
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const app = express();
app.use(express.json());

app.post('/api/students', async (req, res) => {
  const { name, email, age, course, phone, skills } = req.body ?? {};   // whitelist fields
  const student = await Student.create({ name, email, age, course, phone, skills });
  res.status(201).json(student);
});

app.get('/api/students', async (req, res) => {
  const students = await Student.find().select('name email course').sort({ name: 1 });
  res.json(students);
});

app.get('/api/students/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);   // invalid id -> CastError
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

// translate Mongoose / MongoDB errors into HTTP responses
app.use((err, req, res, next) => {
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    return res.status(400).json({ error: 'Validation failed', errors });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Invalid ' + err.path + ': ' + err.value });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate ' + Object.keys(err.keyValue).join(', ') });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college')
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log('Server running on port ' + PORT));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });`,
      api: {
        code: `// API Lab simulation of the Mongoose students API (in-memory, same rules & error shapes)
const express = require('express');
const app = express();
app.use(express.json());

let counter = 0;
const fakeObjectId = () => '665f1c2e9b1d4a00120000' + String(++counter).padStart(2, '0');
const students = [];

// mimics studentSchema: trim, lowercase, defaults, validators, unique email
function createStudent(data) {
  const doc = {
    name: typeof data.name === 'string' ? data.name.trim() : data.name,
    email: typeof data.email === 'string' ? data.email.trim().toLowerCase() : data.email,
    age: data.age === undefined ? undefined : Number(data.age),
    course: data.course ?? 'Node',
    skills: data.skills ?? [],
    isActive: true,
  };
  const errors = [];
  if (!doc.name) errors.push({ field: 'name', message: 'Name is required' });
  else if (doc.name.length < 2) errors.push({ field: 'name', message: 'Name must have at least 2 characters' });
  if (!doc.email) errors.push({ field: 'email', message: 'Email is required' });
  else if (!/^[^@ ]+@[^@ ]+[.][^@ ]+$/.test(doc.email)) errors.push({ field: 'email', message: 'Email is invalid' });
  if (doc.age !== undefined && doc.age < 16) errors.push({ field: 'age', message: 'Minimum age is 16' });
  if (!['Node', 'React', 'Java'].includes(doc.course)) errors.push({ field: 'course', message: doc.course + ' is not a valid course' });
  if (errors.length) return { status: 400, body: { error: 'Validation failed', errors } };
  if (students.some(s => s.email === doc.email)) return { status: 409, body: { error: 'Duplicate email' } };
  const saved = { _id: fakeObjectId(), ...doc, __v: 0 };
  students.push(saved);
  return { status: 201, body: saved };
}

app.post('/api/students', (req, res) => {
  const { name, email, age, course, skills } = req.body ?? {};
  const result = createStudent({ name, email, age, course, skills });
  res.status(result.status).json(result.body);
});

app.get('/api/students', (req, res) => {
  const list = students
    .map(s => ({ _id: s._id, name: s.name, email: s.email, course: s.course }))
    .sort((a, b) => a.name.localeCompare(b.name));
  res.json(list);
});

app.get('/api/students/:id', (req, res) => {
  if (!/^[0-9a-f]{24}$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid _id: ' + req.params.id });
  const student = students.find(s => s._id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/students', body: { name: 'Asha', email: 'ASHA@mail.com', age: 21 } },
          { method: 'POST', url: '/api/students', body: { name: 'R', email: 'bad', age: 12, course: 'PHP' } },
          { method: 'POST', url: '/api/students', body: { name: 'Asha Two', email: 'asha@mail.com' } },
          { method: 'POST', url: '/api/students', body: { name: 'Ravi', email: 'ravi@mail.com', course: 'Java', skills: ['spring'] } },
          { method: 'GET', url: '/api/students' },
          { method: 'GET', url: '/api/students/665f1c2e9b1d4a0012000001' },
          { method: 'GET', url: '/api/students/abc' },
          { method: 'GET', url: '/api/students/665f1c2e9b1d4a0012000099' },
        ],
      },
      result: `POST /api/students → 201 {"_id":"665f1c2e9b1d4a0012000001","name":"Asha","email":"asha@mail.com","age":21,"course":"Node","skills":[],"isActive":true,"__v":0}
POST /api/students → 400 {"error":"Validation failed","errors":[{"field":"name","message":"Name must have at least 2 characters"},{"field":"email","message":"Email is invalid"},{"field":"age","message":"Minimum age is 16"},{"field":"course","message":"PHP is not a valid course"}]}
POST /api/students → 409 {"error":"Duplicate email"}
POST /api/students → 201 {"_id":"665f1c2e9b1d4a0012000002","name":"Ravi","email":"ravi@mail.com","course":"Java","skills":["spring"],"isActive":true,"__v":0}
GET /api/students → 200 [{"_id":"665f1c2e9b1d4a0012000001","name":"Asha","email":"asha@mail.com","course":"Node"},{"_id":"665f1c2e9b1d4a0012000002","name":"Ravi","email":"ravi@mail.com","course":"Java"}]
GET /api/students/665f1c2e9b1d4a0012000001 → 200 {"_id":"665f1c2e9b1d4a0012000001","name":"Asha","email":"asha@mail.com","age":21,"course":"Node","skills":[],"isActive":true,"__v":0}
GET /api/students/abc → 400 {"error":"Invalid _id: abc"}
GET /api/students/665f1c2e9b1d4a0012000099 → 404 {"error":"Student not found"}`,
      explanation: 'The API Lab simulation applies the same rules in memory with deterministic ids (no createdAt/updatedAt, to stay deterministic). Real Mongoose run (verified): POST returned 201 {"name":"Asha","email":"asha@mail.com","age":21,"course":"Node","skills":[],"phone":"9876543210","isActive":true,"_id":"6afd59fc8a045174af127d29","createdAt":"2026-11-18T07:55:40.128Z","updatedAt":"2026-11-18T07:55:40.128Z","__v":0}; the invalid body gave 400 with the four field errors; the duplicate gave 409 {"error":"Duplicate email"}; /abc gave 400 {"error":"Invalid _id: abc"}; an unknown id gave 404. Note that the route whitelists fields from req.body before calling create().',
    },
    {
      title: 'Schema design cheat-sheet: nested objects, arrays, enums, select:false',
      scenario: 'A User schema showing the field types you will use most in real projects.',
      steps: [
        'Read each field and its options',
        'Create the model and insert a user in a script',
        'Run User.findOne() – password is not returned because of select: false',
        'Run User.findOne().select("+password") when you really need it (login, Day 22)',
      ],
      code: `const { Schema, model } = require('mongoose');

const addressSchema = new Schema(
  { line1: String, city: { type: String, required: true }, pin: { type: String, match: /^[1-9][0-9]{5}$/ } },
  { _id: false }                                    // sub-document without its own _id
);

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },  // hidden by default
    role: { type: String, enum: ['student', 'trainer', 'admin'], default: 'student' },
    dob: Date,
    address: addressSchema,                           // nested object
    interests: { type: [String], default: [] },       // array of strings
    wallet: { type: Schema.Types.Decimal128, default: 0 }, // money
    meta: { type: Map, of: String },                  // free-form key/value
    referredBy: { type: Schema.Types.ObjectId, ref: 'User' }, // relationship (Day 19)
    joinedAt: { type: Date, default: Date.now, immutable: true },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, createdAt: -1 });        // compound index for admin lists

module.exports = model('User', userSchema);

// usage
const u = await User.create({ username: 'Asha_K', password: 'secret123', address: { city: 'Pune', pin: '411001' } });
const found = await User.findOne({ username: 'asha_k' });           // password not included
const withPwd = await User.findOne({ username: 'asha_k' }).select('+password');`,
      result: `found → { username: 'asha_k', role: 'student', address: { city: 'Pune', pin: '411001' }, interests: [], ... } (no password)
withPwd.password → 'secret123' (plain only in this demo – hash it with bcrypt on Day 22!)`,
      explanation: 'Sub-schemas keep nested objects validated. select: false protects sensitive fields from accidental exposure. Decimal128 avoids floating-point errors with money. immutable stops later updates to joinedAt.',
    },
  ],
  interview: [
    { q: 'What is Mongoose and why use it instead of the raw MongoDB driver?', a: 'Mongoose is an ODM for MongoDB and Node.js. It adds schemas, type casting, validation, defaults, middleware hooks, virtuals, population of references and a convenient model API, giving structure and safety to a schemaless database.', level: 'Easy' },
    { q: 'Difference between a schema and a model?', a: 'A schema describes the structure and rules of documents. A model is a class compiled from a schema (mongoose.model(name, schema)) bound to a collection; it is used to create, query, update and delete documents.', level: 'Easy' },
    { q: 'Is unique: true a validator?', a: 'No. It creates a unique index in MongoDB. Duplicates are rejected by the database with error code 11000 (MongoServerError), not a Mongoose ValidationError, and only once the index exists.', level: 'Medium' },
    { q: 'How do you write a custom validator?', a: 'Use validate: { validator: (value) => boolean | Promise<boolean>, message: "..." } on the field. The message can be a function receiving props (props.value).', level: 'Medium' },
    { q: 'Do validators run on findByIdAndUpdate?', a: 'Not by default. Pass { runValidators: true } (and usually { new: true } to return the updated document). Alternatively load the document, modify it and call save().', level: 'Medium' },
    { q: 'What is a virtual in Mongoose?', a: 'A computed property defined on the schema that is not persisted in MongoDB (e.g. fullName from firstName + lastName). Include it in JSON with toJSON: { virtuals: true }.', level: 'Medium' },
    { q: 'Difference between methods and statics?', a: 'schema.methods add instance methods called on a document (doc.isInStock()); schema.statics add functions on the model itself (Product.findCheaperThan(1000)).', level: 'Medium' },
    { q: 'What does .lean() do?', a: 'Returns plain JavaScript objects instead of Mongoose documents, skipping hydration. It is faster and uses less memory but loses virtuals, getters, methods and save().', level: 'Medium' },
    { q: 'What is a CastError?', a: 'An error thrown when Mongoose cannot convert a value to the schema type, e.g. findById("abc") cannot become an ObjectId. APIs should return 400 Bad Request for it.', level: 'Easy' },
    { q: 'What are timestamps and __v?', a: 'timestamps: true adds createdAt and updatedAt managed automatically. __v is the version key Mongoose uses for optimistic concurrency on arrays; it increments when array structure changes.', level: 'Medium' },
    { q: 'What are pre and post hooks? Give a use case.', a: 'Middleware that runs before or after operations like save, validate, findOneAndUpdate or deleteOne. Common pre-save use: hashing a password or generating a slug; post-save: sending a welcome email or writing an audit log.', level: 'Hard' },
    { q: 'What does strict mode do in a schema?', a: 'With strict: true (default), fields not defined in the schema are silently ignored when saving. strict: "throw" raises an error instead; strict: false stores them.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a Course schema: title (required, 3-100 chars, trimmed), fee (number ≥ 0, required), level (Beginner/Intermediate/Advanced, default Beginner), tags (array of strings), published (default false), timestamps.',
      hint: 'Use minlength/maxlength, min, enum, default.',
      solution: `const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 3, maxlength: 100 },
    fee: { type: Number, required: true, min: [0, 'Fee cannot be negative'] },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    tags: [String],
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Course', courseSchema);`,
    },
    {
      task: 'Add a custom validator to Course: tags must contain at most 5 items.',
      hint: 'Put validate on the array field.',
      solution: `tags: {
  type: [String],
  validate: {
    validator: (arr) => arr.length <= 5,
    message: 'A course can have at most 5 tags',
  },
},`,
    },
    {
      task: 'Add a virtual feeWithGst (fee × 1.18, rounded) and a static findPublished() that returns published courses sorted by title.',
      hint: 'schema.virtual(...).get(function () {...}); schema.statics.',
      solution: `courseSchema.virtual('feeWithGst').get(function () {
  return Math.round(this.fee * 1.18);
});
courseSchema.statics.findPublished = function () {
  return this.find({ published: true }).sort({ title: 1 });
};
courseSchema.set('toJSON', { virtuals: true });`,
    },
    {
      task: 'Write POST /api/courses with Express 5 + Mongoose that returns 201, or 400 with [{ field, message }] on validation errors.',
      hint: 'Let the async handler throw; map ValidationError in the error middleware.',
      solution: `app.post('/api/courses', async (req, res) => {
  const { title, fee, level, tags } = req.body ?? {};
  res.status(201).json(await Course.create({ title, fee, level, tags }));
});
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ errors: Object.values(err.errors).map(e => ({ field: e.path, message: e.message })) });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});`,
    },
    {
      task: 'Add a pre-save hook to Course that converts every tag to lowercase and removes duplicates.',
      hint: 'new Set(...) and isModified("tags").',
      solution: `courseSchema.pre('save', function () {
  if (this.isModified('tags')) {
    this.tags = [...new Set(this.tags.map(t => t.toLowerCase().trim()))];
  }
});`,
    },
  ],
  quiz: [
    { question: 'mongoose.model("Person", schema) uses which collection by default?', options: ['Person', 'persons', 'people', 'person_list'], answer: 2, explanation: 'Mongoose lower-cases and pluralises the name (Person → people).' },
    { question: 'A duplicate value on a field with unique: true produces…', options: ['A ValidationError', 'A MongoServerError with code 11000', 'A CastError', 'No error'], answer: 1, explanation: 'unique is enforced by a database index.' },
    { question: 'Which option hides a field (like password) from query results by default?', options: ['hidden: true', 'private: true', 'select: false', 'strict: false'], answer: 2, explanation: 'select: false excludes it unless you .select("+field").' },
    { question: 'Student.findById("abc") throws…', options: ['CastError', 'ValidationError', 'SyntaxError', 'Nothing – returns null'], answer: 0, explanation: '"abc" cannot be cast to ObjectId.' },
    { question: 'Which statement about virtuals is TRUE?', options: ['They are stored in MongoDB', 'They are computed and not stored', 'They run only on delete', 'They work with lean() by default'], answer: 1, explanation: 'Virtuals are computed on the document.' },
  ],
};
