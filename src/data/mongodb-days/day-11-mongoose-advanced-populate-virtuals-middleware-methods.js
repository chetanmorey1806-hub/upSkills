export default {
  id: 'day-11-mongoose-advanced-populate-virtuals-middleware-methods',
  title: 'Mongoose Advanced: References & populate(), Virtuals, Middleware, Methods, Query Helpers, lean(), Indexes & Discriminators',
  module: 'Module 4: Mongoose',
  day: 11,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Real MERN backends use much more than basic CRUD. Today you link models with ref and populate(), compute fields with virtuals, hash passwords in pre-save middleware, add instance/static methods and query helpers, speed up reads with lean(), declare indexes in schemas and model inheritance with discriminators.',
  objectives: [
    'Reference other documents with ObjectId + ref and load them with populate() (including select and nested populate)',
    'Create virtual properties and virtual populate, and include them in JSON output',
    'Write pre/post middleware, including a pre("save") hook that hashes passwords with bcrypt',
    'Add instance methods, static methods and query helpers to schemas',
    'Use lean() for fast read-only queries, define single/compound/text indexes in schemas and use discriminators',
  ],
  theory: [
    {
      heading: 'References and populate()',
      content: `On Day 8 you learned **referencing**: store the \`_id\` of another document instead of embedding it. In Mongoose you declare a reference with \`type: Schema.Types.ObjectId\` and \`ref: 'ModelName'\`.

\`populate('author')\` replaces the stored id with the actual document. It is like a JOIN, but done by **Mongoose in your Node process**: it runs the first query, collects all author ids, then runs a **second query** \`User.find({ _id: { $in: [...] } })\` and stitches the results together.

Options you will use daily:
- \`populate('author', 'name username')\` – select only some fields
- \`populate({ path: 'author', select: 'name', match: { verified: true } })\`
- Multiple paths: \`populate('author').populate('comments.user')\`
- **Nested populate**: \`populate({ path: 'order', populate: { path: 'customer' } })\`

If the referenced document does not exist, the field becomes \`null\` (or is removed from an array).`,
      syntax: `const postSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String],
  comments: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, text: String }],
}, { timestamps: true });

const posts = await Post.find({ published: true })
  .populate('author', 'name username')          // only these fields
  .populate('comments.user', 'username')
  .sort({ createdAt: -1 });`,
      tip: 'populate() makes extra queries. Populating inside a loop or populating huge arrays is a classic performance bug (N+1 problem). For reports, prefer an aggregation with $lookup that runs fully inside MongoDB.',
    },
    {
      heading: 'Virtuals: computed properties that are not stored',
      content: `A **virtual** is a property you can read on a document, but it is **not saved** in MongoDB. It is computed from other fields every time.

- \`fullName\` from firstName + lastName
- \`isInStock\` from stock > 0
- \`priceWithGst\` from price × 1.18

Virtuals are not included in \`res.json(doc)\` by default. Enable them with schema options \`toJSON: { virtuals: true }\` and \`toObject: { virtuals: true }\`.

You cannot query or sort by a virtual (it is not in the database). If you need to filter by it, store it as a real field (the **computed pattern**).

**Virtual populate** lets the "one" side list the "many" side without storing an array of ids: \`userSchema.virtual('posts', { ref: 'Post', localField: '_id', foreignField: 'author' })\`. This avoids unbounded arrays of ids in the parent document.`,
      syntax: `const productSchema = new Schema(
  { name: String, price: Number, stock: Number },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual('priceWithGst').get(function () {
  return Math.round(this.price * 1.18);
});
productSchema.virtual('isInStock').get(function () {
  return this.stock > 0;
});

// virtual populate: user.posts without storing post ids in the user
userSchema.virtual('posts', { ref: 'Post', localField: '_id', foreignField: 'author' });
const user = await User.findById(id).populate('posts');`,
      tip: 'Use a normal function (not an arrow function) in getters, methods and middleware – arrow functions do not get the document as `this`.',
    },
    {
      heading: 'Middleware (hooks): pre and post',
      content: `**Middleware** are functions that run automatically before (\`pre\`) or after (\`post\`) an operation. Types:

- **Document middleware**: \`save\`, \`validate\`, \`deleteOne\` (with \`{ document: true }\`) – \`this\` is the document
- **Query middleware**: \`find\`, \`findOne\`, \`updateOne\`, \`findOneAndUpdate\`, \`deleteMany\`… – \`this\` is the Query
- **Aggregate middleware**: \`aggregate\` – \`this\` is the aggregation object
- **Model middleware**: \`insertMany\`

The most famous use case is **hashing a password before saving**. In Mongoose 8 an \`async\` pre hook does not need \`next()\` – returning (or throwing) is enough.

Other real uses: soft-delete filters (\`pre(/^find/)\` adds \`{ isDeleted: false }\`), slug generation, audit logs in \`post('save')\`, cascading deletes.`,
      syntax: `const bcrypt = require('bcrypt');

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;      // only hash when password changed
  this.password = await bcrypt.hash(this.password, 12);
});

// query middleware: hide soft-deleted users from every find query
userSchema.pre(/^find/, function () {
  this.where({ isDeleted: { $ne: true } });
});

userSchema.post('save', function (doc) {
  console.log('User saved:', doc._id);
});`,
      tip: 'pre("save") does NOT run for findByIdAndUpdate / updateOne. If a user changes the password through an update query, it will be stored in plain text. Use doc.save() for password changes, or add a pre("findOneAndUpdate") hook.',
    },
    {
      heading: 'Instance methods, static methods and query helpers',
      content: `Mongoose lets you attach your own functions to schemas – this keeps business logic close to the data (the **fat model** idea):

- **Instance methods** (\`schema.methods.x\`) work on ONE document: \`user.comparePassword(pw)\`, \`order.calculateTotal()\`. \`this\` = the document.
- **Static methods** (\`schema.statics.x\`) work on the MODEL: \`User.findByEmail(email)\`, \`Product.lowStock()\`. \`this\` = the model.
- **Query helpers** (\`schema.query.x\`) add chainable methods to queries: \`Product.find().byCategory('Audio').sort({ price: 1 })\`. \`this\` = the query.

You can also define them in the schema options: \`new Schema({...}, { methods: {...}, statics: {...}, query: {...} })\`.`,
      syntax: `userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);          // returns a Promise<boolean>
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

productSchema.query.byCategory = function (category) {
  return this.where({ category });
};

// usage
const user = await User.findByEmail('asha@example.com');
const ok = await user.comparePassword('Secret@123');
const audio = await Product.find().byCategory('Audio').sort({ price: -1 });`,
    },
    {
      heading: 'lean(): plain objects for fast reads',
      content: `By default each query result is a full **Mongoose document**: it has change tracking, getters/setters, virtuals, \`save()\` and more. That is heavy.

\`.lean()\` tells Mongoose to return **plain JavaScript objects** straight from the driver. Benefits: often several times less memory and faster, which matters on list endpoints returning hundreds of documents.

What you lose with lean():
- No \`save()\`, no instance methods
- No virtuals or getters (unless you use plugins like mongoose-lean-virtuals)
- No default values applied for fields missing in the database

Rule of thumb: **use lean() for read-only API responses**; skip it when you will modify and save the document.`,
      syntax: `// read-only list endpoint – fast
const products = await Product.find({ category: 'Audio' }).select('name price').lean();

// need to modify and save – no lean
const product = await Product.findById(id);
product.stock -= 1;
await product.save();`,
    },
    {
      heading: 'Indexes in schemas and discriminators',
      content: `**Indexes in schemas** (Day 7 explained how indexes work):
- Field level: \`email: { type: String, unique: true, index: true }\`
- Schema level (compound, text, TTL, partial):
  - \`orderSchema.index({ customer: 1, createdAt: -1 })\`
  - \`postSchema.index({ title: 'text', body: 'text' })\`
  - \`sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 })\`

Mongoose calls \`createIndex\` automatically when the model is first used (\`autoIndex\`). In production with large collections set \`autoIndex: false\` and create indexes deliberately (e.g. with \`Model.syncIndexes()\` in a deploy script), because building indexes on startup can slow the database.

**Discriminators** implement **inheritance** in one collection. A base model holds the shared fields; each discriminator adds its own fields. Mongoose stores a key (\`__t\` by default, or your own \`discriminatorKey\` like \`kind\`) to know the type, and queries on a discriminator model automatically filter by it.

Example: \`Payment\` base (amount, orderId) with \`UpiPayment\` (upiId) and \`CardPayment\` (last4, network) – all stored in the \`payments\` collection (the **polymorphic pattern**).`,
      syntax: `const options = { discriminatorKey: 'kind', timestamps: true };
const paymentSchema = new Schema({ orderId: Number, amount: Number }, options);
const Payment = model('Payment', paymentSchema);

const UpiPayment = Payment.discriminator('UpiPayment', new Schema({ upiId: String }, options));
const CardPayment = Payment.discriminator('CardPayment', new Schema({ last4: String, network: String }, options));

await UpiPayment.create({ orderId: 1001, amount: 20597, upiId: 'asha@okaxis' }); // kind: 'UpiPayment'
await UpiPayment.find();   // → db.payments.find({ kind: 'UpiPayment' })
await Payment.find();      // → all payment types`,
    },
  ],
  examples: [
    {
      title: 'User model with pre-save hashing, methods and statics',
      scenario: 'Build the User model used for register/login in a MERN app: hash the password before saving, hide it from queries, compare it at login and find users by email.',
      steps: [
        'npm install mongoose bcrypt',
        'Create models/user.model.js with the schema, pre("save") hook, comparePassword method and findByEmail static',
        'Create a user with User.create() and print it – the password is a bcrypt hash',
        'Call User.findByEmail() and user.comparePassword() to simulate login',
      ],
      code: `// models/user.model.js
const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minLength: 8, select: false },   // hidden by default
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) { delete ret.password; delete ret.__v; return ret; },
    },
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

module.exports = model('User', userSchema);

// test.js
const user = await User.create({ name: 'Asha', email: 'Asha@Example.com', password: 'Secret@123' });
console.log(user.password.slice(0, 7));                 // '$2b$12$'

const found = await User.findByEmail('ASHA@example.com');
console.log(await found.comparePassword('Secret@123'));  // true
console.log(await found.comparePassword('wrong'));       // false
console.log(JSON.stringify(found));                      // no password field`,
      result: `$2b$12$
true
false
{"_id":"6650...","name":"Asha","email":"asha@example.com","role":"user","createdAt":"...","updatedAt":"..."}`,
      explanation: '`isModified("password")` prevents re-hashing an already hashed password when the user updates only their name. `select: false` hides the hash from every query; `findByEmail` explicitly adds it back with `select("+password")` because login needs it. The `toJSON` transform makes sure the hash never leaks in API responses even if it was selected.',
    },
    {
      title: 'populate() = two queries (see them in the shell)',
      scenario: 'Post.find({ authorId: 3 }).populate("author", "username name") – Mongoose first loads the posts, collects their author ids, then loads the users with $in. Run both queries yourself on the blog dataset.',
      steps: [
        'Open the MongoDB Shell Lab with the blog dataset',
        'Run query 1: the posts of author 3',
        'Collect the authorId values (all 3) and run query 2: users with _id $in that list, selecting username and name',
        'Mongoose would put the user object into each post\'s author field',
      ],
      code: `// query 1 – Post.find({ authorId: 3 })
db.posts.find({ authorId: 3 }, { title: 1, likes: 1 }).sort({ likes: -1 })
// query 2 – what populate sends: User.find({ _id: { $in: [3] } }).select('username name')
db.users.find({ _id: { $in: [3] } }, { username: 1, name: 1 })`,
      mongo: {
        dataset: 'blog',
        query: `// query 1 – Post.find({ authorId: 3 })
db.posts.find({ authorId: 3 }, { title: 1, likes: 1 }).sort({ likes: -1 })
// query 2 – what populate sends: User.find({ _id: { $in: [3] } }).select('username name')
db.users.find({ _id: { $in: [3] } }, { username: 1, name: 1 })`,
      },
      result: `{ _id: 1, likes: 230, title: 'Understanding the Node.js Event Loop' }
{ _id: 4, likes: 185, title: 'MongoDB Aggregation for Beginners' }
{ _id: 8, likes: 75, title: 'Mongoose Middleware Explained' }
{ _id: 3, name: 'Neha Shah', username: 'neha_js' }`,
      explanation: 'populate() is not a server-side join. It runs one extra query per populated path (not per document – ids are batched with $in). That is efficient for pages of 10-50 documents. In real MongoDB the ids would be ObjectIds; here the dataset uses numbers.',
    },
    {
      title: 'Doing the same join inside MongoDB with $lookup',
      scenario: 'For a "Top posts with author" widget you want ONE round-trip. Use an aggregation with $lookup (what you would run with Post.aggregate([...]) in Mongoose).',
      steps: [
        'Open the blog dataset',
        'Match published posts, sort by likes and keep the top 2',
        'Join users with $lookup on authorId → _id and $unwind the single-element array',
        'Project only the fields the UI needs',
      ],
      code: `db.posts.aggregate([
  { $match: { published: true } },
  { $sort: { likes: -1 } },
  { $limit: 2 },
  { $lookup: { from: 'users', localField: 'authorId', foreignField: '_id', as: 'author' } },
  { $unwind: '$author' },
  { $project: { title: 1, likes: 1, 'author.username': 1, 'author.name': 1 } }
])`,
      mongo: {
        dataset: 'blog',
        query: `db.posts.aggregate([
  { $match: { published: true } },
  { $sort: { likes: -1 } },
  { $limit: 2 },
  { $lookup: { from: 'users', localField: 'authorId', foreignField: '_id', as: 'author' } },
  { $unwind: '$author' },
  { $project: { title: 1, likes: 1, 'author.username': 1, 'author.name': 1 } }
])`,
      },
      result: `[
  {
    _id: 3,
    author: { name: 'Pooja Nair', username: 'pooja_ui' },
    likes: 410,
    title: 'React Hooks Cheat Sheet'
  },
  {
    _id: 5,
    author: { name: 'Asha Patil', username: 'asha_dev' },
    likes: 320,
    title: 'JWT Auth in a MERN App'
  }
]`,
      explanation: 'Model.aggregate() passes the pipeline to MongoDB unchanged – no casting, no middleware on documents, and results are plain objects (like lean). Putting $limit BEFORE $lookup means only 2 users are looked up. Use populate for simple CRUD screens and $lookup for reports and heavy lists.',
    },
    {
      title: 'Discriminators: many payment types in one collection',
      scenario: 'UpiPayment and CardPayment are discriminators of Payment with discriminatorKey "kind". See how they are stored and what UpiPayment.find() really queries.',
      steps: [
        'Open the shop dataset',
        'Insert three payments of two kinds (what UpiPayment.create / CardPayment.create would store)',
        'Run the filter that UpiPayment.find() adds automatically: { kind: "UpiPayment" }',
        'Count all documents – Payment.countDocuments() sees every type',
      ],
      code: `db.payments.insertMany([
  { _id: 1, kind: 'UpiPayment', orderId: 1001, amount: 20597, upiId: 'asha@okaxis' },
  { _id: 2, kind: 'CardPayment', orderId: 1002, amount: 114900, last4: '4242', network: 'VISA' },
  { _id: 3, kind: 'UpiPayment', orderId: 1003, amount: 29990, upiId: 'neha@ybl' }
])
db.payments.find({ kind: 'UpiPayment' })
db.payments.countDocuments()`,
      mongo: {
        dataset: 'shop',
        query: `db.payments.insertMany([
  { _id: 1, kind: 'UpiPayment', orderId: 1001, amount: 20597, upiId: 'asha@okaxis' },
  { _id: 2, kind: 'CardPayment', orderId: 1002, amount: 114900, last4: '4242', network: 'VISA' },
  { _id: 3, kind: 'UpiPayment', orderId: 1003, amount: 29990, upiId: 'neha@ybl' }
])
db.payments.find({ kind: 'UpiPayment' })
db.payments.countDocuments()`,
      },
      result: `{ acknowledged: true, insertedIds: { '0': 1, '1': 2, '2': 3 } }
{
  _id: 1,
  kind: 'UpiPayment',
  orderId: 1001,
  amount: 20597,
  upiId: 'asha@okaxis'
}
{
  _id: 3,
  kind: 'UpiPayment',
  orderId: 1003,
  amount: 29990,
  upiId: 'neha@ybl'
}
3`,
      explanation: 'All payment types share one collection, so reports like "total collected today" are a single query on payments. Each discriminator model validates its own extra fields and automatically adds `{ kind: "<Name>" }` to every query. This is the polymorphic schema pattern from Day 8, implemented by Mongoose.',
    },
    {
      title: 'API Lab: posts with populate, virtuals and a static method',
      scenario: 'Simulate a blog API: GET /api/posts uses a static Post.findPublished(), optionally populates the author (?populate=author), and every post exposes a virtual commentCount in its JSON – like toJSON: { virtuals: true }.',
      steps: [
        'Open the API Lab and paste the code',
        'Send GET /api/posts – authors are only ids',
        'Send GET /api/posts?populate=author – authors become objects with selected fields',
        'Send GET /api/users/3/posts – a virtual-populate style "user.posts" list',
      ],
      code: `// Real Mongoose 8 code this simulates
postSchema.virtual('commentCount').get(function () { return this.comments.length; });
postSchema.set('toJSON', { virtuals: true });
postSchema.statics.findPublished = function () { return this.find({ published: true }).sort({ likes: -1 }); };
userSchema.virtual('posts', { ref: 'Post', localField: '_id', foreignField: 'author' });

app.get('/api/posts', async (req, res) => {
  let q = Post.findPublished();
  if (req.query.populate === 'author') q = q.populate('author', 'username name');
  res.json(await q);
});
app.get('/api/users/:id/posts', async (req, res) => {
  const user = await User.findById(req.params.id).populate({ path: 'posts', select: 'title likes' });
  res.json(user);
});`,
      api: {
        code: `const express = require('express');
const app = express();

const users = [
  { _id: 1, username: 'asha_dev', name: 'Asha Patil', role: 'admin' },
  { _id: 3, username: 'neha_js', name: 'Neha Shah', role: 'author' },
];
const posts = [
  { _id: 1, title: 'Understanding the Node.js Event Loop', author: 3, likes: 230, published: true, comments: ['Very clear', 'Great diagrams'] },
  { _id: 4, title: 'MongoDB Aggregation for Beginners', author: 3, likes: 185, published: true, comments: ['Helpful', 'More examples', 'Bookmarked'] },
  { _id: 5, title: 'JWT Auth in a MERN App', author: 1, likes: 320, published: true, comments: ['Refresh tokens?'] },
  { _id: 8, title: 'Mongoose Middleware Explained', author: 3, likes: 75, published: false, comments: [] },
];

// toJSON with virtuals: commentCount is computed, never stored
const toJSON = (p) => ({ ...p, commentCount: p.comments.length });

// static: Post.findPublished()
const Post = { findPublished: () => posts.filter((p) => p.published).sort((a, b) => b.likes - a.likes) };

// populate(path, 'username name')
const populateAuthor = (p) => {
  const u = users.find((x) => x._id === p.author);
  return { ...p, author: u ? { _id: u._id, username: u.username, name: u.name } : null };
};

app.get('/api/posts', (req, res) => {
  let list = Post.findPublished();
  if (req.query.populate === 'author') list = list.map(populateAuthor);
  res.json(list.map(toJSON));
});

app.get('/api/users/:id/posts', (req, res) => {
  const user = users.find((u) => u._id === Number(req.params.id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  const userPosts = posts.filter((p) => p.author === user._id).map((p) => ({ _id: p._id, title: p.title, likes: p.likes }));
  res.json({ ...user, posts: userPosts });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/posts' },
          { method: 'GET', url: '/api/posts?populate=author' },
          { method: 'GET', url: '/api/users/3/posts' },
          { method: 'GET', url: '/api/users/9/posts' },
        ],
      },
      result: `GET /api/posts → 200 [{"_id":5,"title":"JWT Auth in a MERN App","author":1,"likes":320,"published":true,"comments":["Refresh tokens?"],"commentCount":1},{"_id":1,"title":"Understanding the Node.js Event Loop","author":3,"likes":230,"published":true,"comments":["Very clear","Great diagrams"],"commentCount":2},{"_id":4,"title":"MongoDB Aggregation for Beginners","author":3,"likes":185,"published":true,"comments":["Helpful","More examples","Bookmarked"],"commentCount":3}]
GET /api/posts?populate=author → 200 [{"_id":5,"title":"JWT Auth in a MERN App","author":{"_id":1,"username":"asha_dev","name":"Asha Patil"},"likes":320,"published":true,"comments":["Refresh tokens?"],"commentCount":1},{"_id":1,"title":"Understanding the Node.js Event Loop","author":{"_id":3,"username":"neha_js","name":"Neha Shah"},"likes":230,"published":true,"comments":["Very clear","Great diagrams"],"commentCount":2},{"_id":4,"title":"MongoDB Aggregation for Beginners","author":{"_id":3,"username":"neha_js","name":"Neha Shah"},"likes":185,"published":true,"comments":["Helpful","More examples","Bookmarked"],"commentCount":3}]
GET /api/users/3/posts → 200 {"_id":3,"username":"neha_js","name":"Neha Shah","role":"author","posts":[{"_id":1,"title":"Understanding the Node.js Event Loop","likes":230},{"_id":4,"title":"MongoDB Aggregation for Beginners","likes":185},{"_id":8,"title":"Mongoose Middleware Explained","likes":75}]}
GET /api/users/9/posts → 404 {"message":"User not found"}`,
      explanation: 'The static method hides the "published + sorted" rule inside the model, so every controller uses the same logic. populate swaps the stored id for a small user object. The virtual commentCount appears in JSON but would never be saved. The user → posts list comes from the posts collection (foreignField author), so the user document does not need an ever-growing array of post ids.',
    },
  ],
  interview: [
    {
      q: 'What is populate() in Mongoose and how does it work internally?',
      a: 'populate() replaces ObjectId references (fields with ref) with the referenced documents. Internally Mongoose runs the main query, collects the referenced ids, runs one additional find({ _id: { $in: ids } }) per populated path, and merges the results in Node.js. It is not a database-side join like $lookup.',
      level: 'Medium',
    },
    {
      q: 'populate() vs $lookup – when do you use which?',
      a: 'populate is convenient for CRUD endpoints and returns Mongoose documents with validation/casting, but costs extra round-trips. $lookup runs inside MongoDB in one aggregation, works with $match/$group/$project, and is better for reports, dashboards and filtering on joined fields (you cannot filter parent documents by populated fields with populate alone).',
      level: 'Hard',
    },
    {
      q: 'What is a virtual in Mongoose?',
      a: 'A property defined with schema.virtual() that has a getter (and optional setter) but is not stored in MongoDB, e.g. fullName or priceWithGst. Virtuals are excluded from JSON unless you set toJSON: { virtuals: true }, and you cannot query or sort by them.',
      level: 'Easy',
    },
    {
      q: 'What is virtual populate and why is it useful?',
      a: 'It defines a virtual with ref, localField and foreignField so that a parent can populate its children without storing their ids, e.g. user.posts where Post has author. It avoids unbounded arrays of child ids in the parent document (an anti-pattern) while keeping a convenient API.',
      level: 'Hard',
    },
    {
      q: 'How do you hash a password with Mongoose middleware?',
      a: 'Add userSchema.pre("save", async function () { if (!this.isModified("password")) return; this.password = await bcrypt.hash(this.password, 12); }). Use a normal function so this is the document, check isModified to avoid double hashing, and remember that pre("save") does not run for updateOne/findByIdAndUpdate.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between document middleware and query middleware?',
      a: 'Document middleware (save, validate, deleteOne with document: true) runs on a document and this refers to the document. Query middleware (find, findOne, updateOne, findOneAndUpdate, deleteMany...) runs on Model.query calls and this refers to the Query object, so you modify filters/updates via this.where() or this.getUpdate().',
      level: 'Hard',
    },
    {
      q: 'Instance method vs static method vs query helper?',
      a: 'Instance methods (schema.methods) are called on a document: user.comparePassword(). Statics (schema.statics) are called on the model: User.findByEmail(). Query helpers (schema.query) extend the query chain: Product.find().byCategory("Audio"). Use normal functions so this is bound correctly.',
      level: 'Medium',
    },
    {
      q: 'What does lean() do and when should you avoid it?',
      a: 'lean() returns plain JS objects instead of Mongoose documents, skipping hydration – much less memory and faster, ideal for read-only API responses. Avoid it when you need save(), instance methods, virtuals, getters or defaults on the result.',
      level: 'Medium',
    },
    {
      q: 'How do you define a compound index in a Mongoose schema and when are indexes created?',
      a: 'schema.index({ customer: 1, createdAt: -1 }). Mongoose calls createIndex for every declared index when the model is compiled (autoIndex: true by default). In production, set autoIndex: false and create or sync indexes (Model.syncIndexes / createIndexes) during deployment to avoid heavy index builds on app start.',
      level: 'Medium',
    },
    {
      q: 'What are discriminators?',
      a: 'Mongoose\'s inheritance mechanism: a base model plus child models stored in the SAME collection, distinguished by a discriminator key (__t by default or a custom key like kind). Each child adds its own fields and validators, and queries on a child model are automatically filtered by its key. Useful for events, payments, notifications or users with different roles.',
      level: 'Hard',
    },
    {
      q: 'Why should you avoid arrow functions in Mongoose methods and middleware?',
      a: 'Arrow functions do not have their own this. Mongoose binds this to the document (methods, document middleware, virtual getters) or to the query/model (query middleware, statics). With an arrow function this would be undefined or the module scope, so this.password etc. would fail.',
      level: 'Easy',
    },
    {
      q: 'How do you stop a password hash from ever being sent in API responses?',
      a: 'Combine select: false on the password path (it is excluded from queries unless you explicitly select("+password")) with a toJSON transform that deletes ret.password. Also never return the raw document from login – build a response object with only safe fields and the token.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create Order and Customer models where Order has customer: { type: ObjectId, ref: "Customer" } and items with product refs. Write a query that returns the 10 latest delivered orders with the customer\'s name/email and each item\'s product name and price.',
      hint: 'Use populate twice: "customer" and "items.product", with field selection, then sort and limit.',
      solution: `const orderSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, min: 1, required: true },
    price: Number,
  }],
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  total: Number,
}, { timestamps: true });
orderSchema.index({ status: 1, createdAt: -1 });
const Order = model('Order', orderSchema);

const latest = await Order.find({ status: 'delivered' })
  .sort({ createdAt: -1 })
  .limit(10)
  .populate('customer', 'name email')
  .populate('items.product', 'name price')
  .lean();`,
    },
    {
      task: 'Add to the Product schema: a virtual priceWithGst (18%), a virtual isInStock, an instance method applyDiscount(percent) that changes price and saves, a static lowStock(limit = 10) and a query helper inPriceRange(min, max).',
      hint: 'methods, statics, query; normal functions; enable virtuals in toJSON.',
      solution: `const productSchema = new Schema(
  { name: String, category: String, price: Number, stock: Number },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual('priceWithGst').get(function () { return Math.round(this.price * 1.18); });
productSchema.virtual('isInStock').get(function () { return this.stock > 0; });

productSchema.methods.applyDiscount = function (percent) {
  this.price = Math.round(this.price * (1 - percent / 100));
  return this.save();
};

productSchema.statics.lowStock = function (limit = 10) {
  return this.find({ stock: { $lt: limit } }).sort({ stock: 1 });
};

productSchema.query.inPriceRange = function (min, max) {
  return this.where('price').gte(min).lte(max);
};

// usage
const p = await Product.findById(id);
await p.applyDiscount(10);
const low = await Product.lowStock(5);
const mid = await Product.find().inPriceRange(10000, 50000).lean();`,
    },
    {
      task: 'Implement soft delete on a Post model: a deletedAt field, an instance method softDelete(), and query middleware so that every find/findOne/countDocuments ignores soft-deleted posts.',
      hint: 'pre(/^find/) and pre("countDocuments"), this.where({ deletedAt: null }).',
      solution: `postSchema.add({ deletedAt: { type: Date, default: null } });

postSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};

postSchema.pre(/^find/, function () {
  this.where({ deletedAt: null });
});
postSchema.pre('countDocuments', function () {
  this.where({ deletedAt: null });
});

// usage
const post = await Post.findById(id);
await post.softDelete();
await Post.find();   // the deleted post is no longer returned`,
    },
    {
      task: 'In the blog dataset, write the aggregation equivalent of "users with their number of posts" (what User.find().populate("posts") with a virtual populate would give you as counts), sorted by post count descending.',
      hint: '$lookup from posts on _id → authorId, then $size of the joined array.',
      solution: `db.users.aggregate([
  { $lookup: { from: 'posts', localField: '_id', foreignField: 'authorId', as: 'posts' } },
  { $project: { username: 1, postCount: { $size: '$posts' } } },
  { $sort: { postCount: -1 } }
])
// neha_js 3, ravi_codes 2, pooja_ui 2, asha_dev 1, karan_m 0`,
    },
    {
      task: 'Create a Notification base model with discriminators EmailNotification (to, subject) and SmsNotification (phone) using discriminatorKey "channel". Create one of each and write queries for all notifications and only SMS ones.',
      hint: 'Model.discriminator(name, schema) with the same options object.',
      solution: `const opts = { discriminatorKey: 'channel', timestamps: true };
const Notification = model('Notification', new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User' }, message: String }, opts));
const EmailNotification = Notification.discriminator('EmailNotification', new Schema({ to: String, subject: String }, opts));
const SmsNotification = Notification.discriminator('SmsNotification', new Schema({ phone: String }, opts));

await EmailNotification.create({ user: userId, message: 'Order shipped', to: 'asha@example.com', subject: 'Your order' });
await SmsNotification.create({ user: userId, message: 'OTP 4821', phone: '9876543210' });

const all = await Notification.find().lean();   // both, each with channel field
const sms = await SmsNotification.find().lean(); // { channel: 'SmsNotification' } added automatically`,
    },
  ],
  quiz: [
    {
      question: 'How does Mongoose populate() load referenced documents?',
      options: [
        'It runs a $lookup stage inside MongoDB',
        'It runs an extra find() with $in on the referenced ids and merges results in Node.js',
        'It stores a full copy of the referenced document when saving',
        'It uses a SQL JOIN',
      ],
      answer: 1,
      explanation: 'populate is client-side: one extra query per populated path using $in, then Mongoose merges the results.',
    },
    {
      question: 'Which statement about virtuals is TRUE?',
      options: [
        'They are stored in MongoDB like normal fields',
        'You can sort by them with .sort()',
        'They are computed on the fly and need toJSON: { virtuals: true } to appear in res.json()',
        'They only work with lean() queries',
      ],
      answer: 2,
      explanation: 'Virtuals are not persisted, cannot be queried, and are excluded from JSON output unless enabled in toJSON.',
    },
    {
      question: 'Your pre("save") password hashing hook does not run when the user updates their password. Which call is the most likely cause?',
      options: ['user.save()', 'User.create()', 'new User().save()', 'User.findByIdAndUpdate()'],
      answer: 3,
      explanation: 'findByIdAndUpdate is a query, so document "save" middleware does not run. Use doc.save() or add query middleware.',
    },
    {
      question: 'What does .lean() return?',
      options: [
        'Plain JavaScript objects',
        'Mongoose documents with save()',
        'A cursor that must be closed',
        'Only the _id values',
      ],
      answer: 0,
      explanation: 'lean() skips hydration and returns plain objects – faster and lighter, but without document methods, virtuals or defaults.',
    },
    {
      question: 'Where are documents of discriminator models stored?',
      options: [
        'In a separate collection per discriminator',
        'In the base model\'s collection with a discriminator key field',
        'In memory only',
        'In a GridFS bucket',
      ],
      answer: 1,
      explanation: 'All discriminators share the base collection; the key (__t or a custom discriminatorKey) identifies each document\'s type.',
    },
  ],
};
