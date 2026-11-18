export default {
  id: 'extra-09-mongodb-mongoose-interview',
  title: 'MongoDB & Mongoose Interview: Documents vs Tables, Schema Design, Indexes, Aggregation, Transactions, Replication, Sharding, populate, lean & Middleware',
  module: 'Interview: Backend',
  extraNo: 9,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Revision notes and 29 interview questions on MongoDB 8 and Mongoose 8 for MERN developers: how documents differ from SQL tables, embed vs reference design, indexes and explain(), aggregation pipelines, transactions, replica sets, sharding, and Mongoose features like populate, lean, virtuals and middleware.',
  objectives: [
    'Explain MongoDB concepts (document, collection, BSON, _id/ObjectId) and compare them with SQL',
    'Choose between embedding and referencing using access patterns',
    'Create the right indexes and read explain() output (IXSCAN vs COLLSCAN)',
    'Write aggregation pipelines with $match, $group, $lookup, $project, $sort, $unwind',
    'Explain transactions, replication, sharding and key Mongoose features (populate, lean, middleware, virtuals)',
  ],
  theory: [
    {
      heading: 'MongoDB basics vs SQL',
      content: `**MongoDB is a NoSQL, document-oriented database.** Data is stored as **documents** (JSON-like objects, stored in binary **BSON**) inside **collections**, inside a **database**.

SQL term → MongoDB term:
- Database → Database
- Table → Collection
- Row → Document
- Column → Field
- JOIN → Embedding, or \`$lookup\` / \`populate\`
- Primary key → \`_id\` (ObjectId by default)

Key points:
- **Flexible schema**: documents in one collection can have different fields (Mongoose adds a schema at the app level).
- **Rich types** via BSON: ObjectId, Date, Decimal128, arrays, nested objects, binary.
- **ObjectId** is 12 bytes: 4-byte timestamp + 5-byte random value + 3-byte counter. So it is roughly sortable by creation time and \`id.getTimestamp()\` works.
- Max document size **16 MB** (use GridFS or S3 for big files).
- Single-document operations are **atomic**, even when they update many fields or nested arrays.
- Horizontal scaling (sharding) and high availability (replica sets) are built in.

**When MongoDB fits:** evolving schemas, JSON APIs (MERN), catalogues, content, user profiles, logs, real-time apps. **When SQL may fit better:** highly relational data with many joins and complex multi-row transactions (banking ledgers, ERP).`,
      tip: 'Do not say "MongoDB has no schema". Say "MongoDB has a flexible schema; we enforce structure with Mongoose or $jsonSchema validation".',
    },
    {
      heading: 'Schema design: embed vs reference',
      content: `The golden rule: **design for how the app reads and writes data**, not for normalisation. "Data that is accessed together should be stored together."

**Embed** (sub-documents/arrays inside the parent) when:
- relationship is one-to-one or **one-to-few** (user → 3 addresses)
- child data is read together with the parent and rarely queried alone
- the array is **bounded** (will not grow forever)
Benefit: one read, atomic update. Risk: unbounded arrays hit the 16 MB limit and make documents slow.

**Reference** (store the other document's \`_id\`) when:
- **one-to-many with many/unbounded** children (post → thousands of comments, server → millions of logs: store \`postId\` in each comment)
- **many-to-many** (students ↔ courses: array of ids on one or both sides)
- child is accessed or updated independently, or shared by many parents
Read with \`populate()\` or \`$lookup\`.

Useful patterns: **extended reference** (copy a few frequently read fields, e.g. store \`author: { _id, name }\` in a post), **subset pattern** (embed the latest 10 reviews, keep all in a separate collection), **bucket pattern** (group IoT readings per hour), **computed pattern** (store \`ratingAvg\`, \`reviewCount\`).`,
      tip: 'How to answer: state the access pattern first ("product page shows the latest 5 reviews"), then pick the design. Interviewers check reasoning, not one right answer.',
    },
    {
      heading: 'Indexes and query performance',
      content: `Without an index MongoDB does a **COLLSCAN** (reads every document). An index (B-tree) lets it do an **IXSCAN**. \`_id\` is indexed automatically.

Types:
- **Single field**: \`{ email: 1 }\`, often **unique**
- **Compound**: \`{ category: 1, price: -1 }\` – order matters; supports queries on the **prefix** (\`category\` alone) but not on \`price\` alone
- **Multikey**: index on an array field (automatically)
- **Text**: \`{ title: 'text', description: 'text' }\` for keyword search (Atlas Search for advanced search)
- **TTL**: \`{ createdAt: 1 }, { expireAfterSeconds: 3600 }\` auto-deletes old docs (sessions, OTPs)
- **Partial / sparse**, **hashed** (for sharding), **2dsphere** (geo: "restaurants near me")

**ESR rule** for compound indexes: **Equality** fields first, then **Sort** fields, then **Range** fields. For \`find({ status: 'active', price: { $gte: 100 } }).sort({ createdAt: -1 })\` → index \`{ status: 1, createdAt: -1, price: 1 }\`.

**Covered query:** all queried and returned fields are in the index (project out \`_id\`), so documents are not fetched at all.

Check with \`explain('executionStats')\`: look at \`stage\` (IXSCAN vs COLLSCAN), \`totalKeysExamined\`, \`totalDocsExamined\` vs \`nReturned\` (ideally close).

Cost of indexes: extra RAM/disk and slower writes. Do not index every field.`,
      syntax: `// Mongoose
userSchema.index({ email: 1 }, { unique: true });
orderSchema.index({ user: 1, createdAt: -1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });
// mongosh
db.orders.find({ user: id }).sort({ createdAt: -1 }).explain('executionStats');`,
    },
    {
      heading: 'Aggregation pipeline',
      content: `The aggregation pipeline processes documents through **stages**; each stage's output is the next stage's input (like Unix pipes or array \`.filter().map().reduce()\`).

Common stages:
- \`$match\` – filter (put it **first** so it can use indexes)
- \`$project\` / \`$addFields\` / \`$set\` – shape or compute fields
- \`$group\` – group by \`_id\` with accumulators \`$sum\`, \`$avg\`, \`$min\`, \`$max\`, \`$push\`, \`$addToSet\`, \`$first\`
- \`$sort\`, \`$limit\`, \`$skip\`
- \`$unwind\` – one document per array element
- \`$lookup\` – left outer join with another collection
- \`$facet\` – multiple pipelines at once (e.g. data + total count for pagination)
- \`$bucket\`, \`$count\`, \`$out\` / \`$merge\` (write results to a collection)

Each stage has a 100 MB RAM limit; MongoDB 6+ spills to disk automatically when needed (\`allowDiskUse\` defaults to true).

In Mongoose: \`Order.aggregate([...])\`. Note: aggregate does **not** cast types, so convert ids yourself: \`new mongoose.Types.ObjectId(userId)\`.`,
      syntax: `db.orders.aggregate([
  { $match: { status: 'delivered' } },
  { $group: { _id: '$city', revenue: { $sum: '$amount' }, orders: { $sum: 1 } } },
  { $sort: { revenue: -1 } },
  { $limit: 5 }
]);`,
    },
    {
      heading: 'Transactions, replication and sharding',
      content: `**Transactions:** single-document writes are always atomic. For **multi-document ACID** operations (transfer money between two wallets, create order + decrement stock) use transactions (MongoDB 4.0+ on replica sets, 4.2+ on sharded clusters). They require a **replica set** (Atlas clusters are replica sets; a standalone local mongod is not). Keep them short (default 60-second limit) and prefer good schema design (embedding) to avoid needing them.

**Replication (replica set):** a group of mongod servers with the same data: one **primary** (receives all writes) and **secondaries** that copy the primary's **oplog**. If the primary fails, an **election** makes a secondary the new primary automatically (high availability). Typical size 3 members. **Write concern** \`w: 'majority'\` (default) means a write is acknowledged after most members have it. **Read preference** (\`primary\`, \`secondaryPreferred\`, \`nearest\`) decides where reads go; reading from secondaries may return slightly stale data.

**Sharding:** horizontal scaling: splits a large collection across multiple **shards** (each a replica set) by a **shard key**. Components: shards, **mongos** (query router), **config servers** (metadata). A good shard key has high cardinality, even distribution and matches common queries (e.g. \`{ userId: 'hashed' }\`). A bad key (monotonically increasing like \`createdAt\`, or low cardinality like \`country\`) creates hot shards. Queries that include the shard key are **targeted**; others are **scatter-gather**.

Replication = copies for availability; sharding = partitions for scale.`,
      syntax: `const session = await mongoose.startSession();
await session.withTransaction(async () => {
  await Wallet.updateOne({ _id: from, balance: { $gte: amt } }, { $inc: { balance: -amt } }, { session });
  await Wallet.updateOne({ _id: to }, { $inc: { balance: amt } }, { session });
});
await session.endSession();`,
    },
    {
      heading: 'Mongoose essentials: schema, populate, lean, middleware, virtuals',
      content: `**Mongoose is an ODM (Object Data Modeling) library** for MongoDB and Node.js: schemas, validation, type casting, middleware, population, and a nicer query API. Mongoose 8 is promise-only (callbacks were removed in Mongoose 7).

- **Schema & Model:** \`const User = mongoose.model('User', userSchema)\`. Options: \`{ timestamps: true }\` adds createdAt/updatedAt.
- **Validation:** \`required\`, \`min\`, \`max\`, \`enum\`, \`match\`, custom validators. Runs on \`save()\`/\`create()\`; for update queries pass \`{ runValidators: true }\`. \`unique: true\` is an **index**, not a validator (duplicate gives error code **11000**).
- **populate():** replaces stored ObjectIds with the referenced documents by running a **second query** (\`$in\` on ids). \`Post.find().populate('author', 'name avatar')\`. For heavy joins, \`$lookup\` in one aggregation may be faster.
- **lean():** returns plain JS objects instead of full Mongoose documents: much faster and lighter for read-only APIs, but no getters/setters, virtuals (by default), \`save()\` or change tracking.
- **Middleware (hooks):** \`pre/post\` for document (\`save\`, \`validate\`, \`deleteOne\`), query (\`find\`, \`findOneAndUpdate\`, \`updateOne\`), and aggregate. Classic use: hash the password in \`pre('save')\` when \`this.isModified('password')\`. Note: \`findByIdAndUpdate\` does **not** trigger \`save\` hooks.
- **Virtuals:** computed fields not stored in DB (\`fullName\`), and virtual populate (\`post.comments\` without storing an array).
- **Instance methods / statics:** \`userSchema.methods.comparePassword\`, \`userSchema.statics.findByEmail\`.
- \`select: false\` on password to hide it by default; fetch with \`.select('+password')\` in login.`,
      syntax: `userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};
const posts = await Post.find({ published: true })
  .populate('author', 'name')
  .select('title author createdAt')
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();`,
      tip: 'Use arrow functions carefully: Mongoose middleware and methods need regular functions because they use this.',
    },
  ],
  examples: [
    {
      title: 'Aggregation: top cities by delivered revenue ($match → $group → $sort → $limit)',
      scenario: 'Interviewer: "Write an aggregation to find the top 2 cities by revenue from delivered orders." The pipeline is shown, and simulated in plain JS so you can run it without a database.',
      steps: [
        '$match keeps only delivered orders',
        '$group groups by city and sums amount and counts orders',
        '$sort by revenue descending, then $limit 2',
        'Run the JS simulation to see the exact documents MongoDB would return',
      ],
      code: `// mongosh / Mongoose: Order.aggregate([...])
db.orders.aggregate([
  { $match: { status: 'delivered' } },
  { $group: { _id: '$city', revenue: { $sum: '$amount' }, orders: { $sum: 1 } } },
  { $sort: { revenue: -1 } },
  { $limit: 2 }
]);

// Same logic in plain JS (runnable)
const orders = [
  { city: 'Pune', amount: 1200, status: 'delivered' },
  { city: 'Mumbai', amount: 800, status: 'delivered' },
  { city: 'Pune', amount: 300, status: 'cancelled' },
  { city: 'Delhi', amount: 2500, status: 'delivered' },
  { city: 'Mumbai', amount: 900, status: 'delivered' },
  { city: 'Pune', amount: 700, status: 'delivered' },
];
const matched = orders.filter((o) => o.status === 'delivered');                 // $match
const groups = {};
for (const o of matched) {                                                      // $group
  groups[o.city] ??= { _id: o.city, revenue: 0, orders: 0 };
  groups[o.city].revenue += o.amount;
  groups[o.city].orders += 1;
}
const result = Object.values(groups)
  .sort((a, b) => b.revenue - a.revenue)                                        // $sort
  .slice(0, 2);                                                                 // $limit
console.log(result);`,
      playground: {
        html: '<p>Open the console to see the aggregation result.</p>',
        js: `const orders = [
  { city: 'Pune', amount: 1200, status: 'delivered' },
  { city: 'Mumbai', amount: 800, status: 'delivered' },
  { city: 'Pune', amount: 300, status: 'cancelled' },
  { city: 'Delhi', amount: 2500, status: 'delivered' },
  { city: 'Mumbai', amount: 900, status: 'delivered' },
  { city: 'Pune', amount: 700, status: 'delivered' },
];
const matched = orders.filter((o) => o.status === 'delivered');
const groups = {};
for (const o of matched) {
  groups[o.city] ??= { _id: o.city, revenue: 0, orders: 0 };
  groups[o.city].revenue += o.amount;
  groups[o.city].orders += 1;
}
const result = Object.values(groups)
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 2);
console.log(result);`,
      },
      result: `[
  { _id: 'Delhi', revenue: 2500, orders: 1 },
  { _id: 'Pune', revenue: 1900, orders: 2 }
]`,
      explanation: `Pune's cancelled 300 is removed by $match, so Pune = 1200 + 700 = 1900; Mumbai = 1700 and is cut by $limit. Putting $match first is important: it reduces documents early and can use an index on status. In $group, the _id is the grouping key and "$city" (with $) refers to a field value. Follow-up you may get: "Also show city names in lowercase" → add { $project: { city: { $toLower: '$_id' }, revenue: 1, _id: 0 } }.`,
    },
    {
      title: 'Pagination: skip/limit vs cursor (keyset) pagination',
      scenario: 'Interviewer: "Your product list with skip() becomes slow on page 5000. Why, and how do you fix it?"',
      steps: [
        'skip((page-1)*limit).limit(limit) is simple and supports jumping to any page',
        'Cursor pagination uses the last seen _id: find({ _id: { $gt: lastId } }).sort({ _id: 1 }).limit(n)',
        'Run the simulation and compare the pages',
      ],
      code: `// Mongoose
// skip/limit
const page = 2, limit = 3;
await Product.find().sort({ _id: 1 }).skip((page - 1) * limit).limit(limit);
// cursor
await Product.find(lastId ? { _id: { $gt: lastId } } : {}).sort({ _id: 1 }).limit(limit);

// Simulation (runnable)
const products = Array.from({ length: 10 }, (_, i) => ({ _id: i + 1, name: 'P' + (i + 1) }));
function skipLimit(page, limit) {
  const skip = (page - 1) * limit;
  return products.slice(skip, skip + limit).map((p) => p._id);
}
function cursorPage(afterId, limit) {
  const docs = products.filter((p) => afterId == null || p._id > afterId).slice(0, limit);
  return { ids: docs.map((p) => p._id), nextCursor: docs.length ? docs.at(-1)._id : null };
}
console.log('page 2 (skip/limit):', skipLimit(2, 3));
let c = cursorPage(null, 3);
console.log('first page:', c);
c = cursorPage(c.nextCursor, 3);
console.log('next page :', c);`,
      playground: {
        html: '<p>Open the console to compare skip/limit and cursor pagination.</p>',
        js: `const products = Array.from({ length: 10 }, (_, i) => ({ _id: i + 1, name: 'P' + (i + 1) }));
function skipLimit(page, limit) {
  const skip = (page - 1) * limit;
  return products.slice(skip, skip + limit).map((p) => p._id);
}
function cursorPage(afterId, limit) {
  const docs = products.filter((p) => afterId == null || p._id > afterId).slice(0, limit);
  return { ids: docs.map((p) => p._id), nextCursor: docs.length ? docs.at(-1)._id : null };
}
console.log('page 2 (skip/limit):', skipLimit(2, 3));
let c = cursorPage(null, 3);
console.log('first page:', c);
c = cursorPage(c.nextCursor, 3);
console.log('next page :', c);`,
      },
      result: `page 2 (skip/limit): [ 4, 5, 6 ]
first page: { ids: [ 1, 2, 3 ], nextCursor: 3 }
next page : { ids: [ 4, 5, 6 ], nextCursor: 6 }`,
      explanation: `Both return the same page here, but skip(N) still has to walk past N index entries, so page 5000 × 20 means scanning 100,000 entries per request. Cursor pagination uses the index to jump directly to _id > lastId, so every page costs the same. It is also stable when new items are inserted (no duplicates/missing items between pages). Trade-off: you cannot jump to "page 37"; it suits infinite scroll and feeds. For sorting by another field, use a compound cursor (createdAt + _id) with a matching index.`,
    },
    {
      title: 'What populate() actually does (and why lean helps)',
      scenario: 'Interviewer: "Is populate a JOIN? How many queries does it run?"',
      steps: [
        'Post documents store only the author ObjectId',
        'populate collects unique author ids and runs User.find({ _id: { $in: ids } })',
        'It then replaces each id with the matching user document in memory',
        'Run the simulation',
      ],
      code: `// Mongoose
const posts = await Post.find().populate('author', 'name').lean();
// Internally: 1) db.posts.find()  2) db.users.find({ _id: { $in: [u1, u2] } }, { name: 1 })

// Simulation (runnable)
const users = [{ _id: 'u1', name: 'Asha' }, { _id: 'u2', name: 'Vikram' }];
const posts = [
  { _id: 'p1', title: 'Learning MERN', author: 'u1' },
  { _id: 'p2', title: 'Mongo indexes', author: 'u2' },
  { _id: 'p3', title: 'React 19 notes', author: 'u1' },
];
const authorIds = [...new Set(posts.map((p) => p.author))];
console.log('second query $in:', authorIds);
const byId = new Map(users.filter((u) => authorIds.includes(u._id)).map((u) => [u._id, u]));
const populated = posts.map((p) => ({ ...p, author: byId.get(p.author) }));
console.log(populated);`,
      playground: {
        html: '<p>Open the console to see how populate fills the author field.</p>',
        js: `const users = [{ _id: 'u1', name: 'Asha' }, { _id: 'u2', name: 'Vikram' }];
const posts = [
  { _id: 'p1', title: 'Learning MERN', author: 'u1' },
  { _id: 'p2', title: 'Mongo indexes', author: 'u2' },
  { _id: 'p3', title: 'React 19 notes', author: 'u1' },
];
const authorIds = [...new Set(posts.map((p) => p.author))];
console.log('second query $in:', authorIds);
const byId = new Map(users.filter((u) => authorIds.includes(u._id)).map((u) => [u._id, u]));
const populated = posts.map((p) => ({ ...p, author: byId.get(p.author) }));
console.log(populated);`,
      },
      result: `second query $in: [ 'u1', 'u2' ]
[
  {
    _id: 'p1',
    title: 'Learning MERN',
    author: { _id: 'u1', name: 'Asha' }
  },
  {
    _id: 'p2',
    title: 'Mongo indexes',
    author: { _id: 'u2', name: 'Vikram' }
  },
  {
    _id: 'p3',
    title: 'React 19 notes',
    author: { _id: 'u1', name: 'Asha' }
  }
]`,
      explanation: `populate is not a server-side JOIN: it is an application-level join with one extra query per populated path (2 queries here, not 1 + N). Duplicate ids are de-duplicated. Because it runs separate queries, you cannot filter posts by author.name with populate's match in a single step; use $lookup in an aggregation (or store an extended reference) for that. Adding .lean() skips building heavy Mongoose documents, which makes read-only list APIs noticeably faster and lighter on memory.`,
    },
    {
      title: 'Embed or reference? A decision helper for common interview scenarios',
      scenario: 'Interviewer gives scenarios: user addresses, product reviews, server logs, students and courses. Explain your design choice for each.',
      steps: [
        'Ask: how many children? are they read with the parent? updated alone? bounded?',
        'Encode the rules of thumb in a function',
        'Run it for four classic scenarios',
      ],
      code: `function chooseDesign({ relation, childCount, readTogether, childUpdatedAlone }) {
  if (relation === 'one-to-few' && readTogether && !childUpdatedAlone) return 'EMBED';
  if (relation === 'one-to-many' && childCount < 1000 && readTogether) return 'EMBED (or array of references)';
  if (relation === 'one-to-squillions') return 'REFERENCE from child to parent';
  if (relation === 'many-to-many') return 'ARRAY OF REFERENCES on one/both sides';
  return 'REFERENCE';
}
console.log('User -> addresses:', chooseDesign({ relation: 'one-to-few', readTogether: true, childUpdatedAlone: false }));
console.log('Product -> reviews:', chooseDesign({ relation: 'one-to-many', childCount: 200, readTogether: true }));
console.log('Server -> log lines:', chooseDesign({ relation: 'one-to-squillions' }));
console.log('Student <-> courses:', chooseDesign({ relation: 'many-to-many' }));

// Resulting Mongoose schemas (sketch)
// User:    { name, addresses: [{ line1, city, pincode }] }              // embedded
// Review:  { product: { type: ObjectId, ref: 'Product' }, rating, text } // child references parent
// Product: { name, price, ratingAvg, reviewCount, latestReviews: [ ... up to 5 ] } // computed + subset pattern
// Student: { name, courses: [{ type: ObjectId, ref: 'Course' }] }`,
      playground: {
        html: '<p>Open the console to see the design decision for each scenario.</p>',
        js: `function chooseDesign({ relation, childCount, readTogether, childUpdatedAlone }) {
  if (relation === 'one-to-few' && readTogether && !childUpdatedAlone) return 'EMBED';
  if (relation === 'one-to-many' && childCount < 1000 && readTogether) return 'EMBED (or array of references)';
  if (relation === 'one-to-squillions') return 'REFERENCE from child to parent';
  if (relation === 'many-to-many') return 'ARRAY OF REFERENCES on one/both sides';
  return 'REFERENCE';
}
console.log('User -> addresses:', chooseDesign({ relation: 'one-to-few', readTogether: true, childUpdatedAlone: false }));
console.log('Product -> reviews:', chooseDesign({ relation: 'one-to-many', childCount: 200, readTogether: true }));
console.log('Server -> log lines:', chooseDesign({ relation: 'one-to-squillions' }));
console.log('Student <-> courses:', chooseDesign({ relation: 'many-to-many' }));`,
      },
      result: `User -> addresses: EMBED
Product -> reviews: EMBED (or array of references)
Server -> log lines: REFERENCE from child to parent
Student <-> courses: ARRAY OF REFERENCES on one/both sides`,
      explanation: `Addresses are few, always shown with the user, so embedding gives one read. Reviews: a few hundred can be embedded, but for a big marketplace reviews grow without limit, so a separate Review collection that references the product (plus ratingAvg/reviewCount and the latest 5 embedded) is safer. Log lines are unbounded ("squillions"), so each log stores the serverId; never push them into an array. Many-to-many uses arrays of ObjectIds, usually on the side that is queried more often. Saying the WHY (bounded? read together? updated alone?) is what earns marks.`,
    },
  ],
  interview: [
    {
      q: 'What is MongoDB? How is it different from a relational database like MySQL?',
      level: 'Easy',
      a: `MongoDB is a NoSQL document database that stores data as BSON documents (JSON-like) in collections.
Differences:
- Data model: documents with nested objects/arrays vs rows in fixed-column tables.
- Schema: flexible per document vs strict DDL schema.
- Relations: embedding or references ($lookup/populate) vs foreign keys and JOINs.
- Scaling: built-in horizontal scaling (sharding) vs mostly vertical scaling (plus read replicas).
- Transactions: single-document atomic always; multi-document transactions supported since 4.0, but SQL databases are built around them.
Example: a blog post with its tags array and author info can be one MongoDB document, while SQL needs posts, tags and post_tags tables.`,
    },
    {
      q: 'What is BSON? Why does MongoDB use it instead of JSON?',
      level: 'Easy',
      a: `BSON (Binary JSON) is the binary format MongoDB uses to store documents and send them over the network. Compared with JSON it:
- supports more types: ObjectId, Date, Decimal128, Int32/Int64, Binary, Regex
- is faster to traverse (stores lengths, so the parser can skip fields)
- is efficient for indexing and updates.
Drivers convert JS objects to BSON automatically. JSON only has string, number, boolean, null, array, object, so dates would be strings.`,
    },
    {
      q: 'What is ObjectId? What does it contain?',
      level: 'Easy',
      a: `ObjectId is the default 12-byte unique identifier for _id: 4-byte Unix timestamp (seconds) + 5-byte random value (unique per process) + 3-byte incrementing counter. It is generated by the driver without contacting the server, is roughly ordered by creation time, and you can get the creation time with id.getTimestamp().
In Mongoose, validate route params with mongoose.isValidObjectId(id) (or Types.ObjectId.isValid) to avoid CastError. In aggregation, convert strings with new mongoose.Types.ObjectId(id).`,
    },
    {
      q: 'Embedding vs referencing: how do you decide?',
      level: 'Medium',
      a: `Decide by access pattern and growth:
Embed when the relationship is one-to-one / one-to-few, the data is read together, and the array is bounded (user addresses, order line items with a price snapshot). Benefit: single read and atomic writes.
Reference when the child set is large or unbounded (comments, logs), many-to-many (students-courses), child is queried/updated independently, or shared by many parents. Read with populate or $lookup.
Hybrid: extended reference (store author _id + name), subset (embed latest 5 reviews), computed fields (reviewCount). Mention the 16 MB document limit as the hard constraint.`,
    },
    {
      q: 'How would you design the schema for an e-commerce order?',
      level: 'Medium',
      a: `Order document:
{ user: ObjectId(ref User), items: [{ product: ObjectId, name, price, qty, image }], shippingAddress: { line1, city, pincode }, amount: { subtotal, tax, shipping, total }, payment: { provider, paymentId, status }, status: 'pending'|'paid'|'shipped'|'delivered'|'cancelled', createdAt }
Why embed items and address with copied name/price: an order is a historical snapshot. If the product price changes later, old orders must still show what the customer paid. The user is referenced (users are separate and shared). Indexes: { user: 1, createdAt: -1 } for "my orders", { status: 1 } for admin dashboards.`,
    },
    {
      q: 'What is an index? What are the trade-offs?',
      level: 'Easy',
      a: `An index is a B-tree data structure that stores field values in sorted order with pointers to documents, so queries can find matching documents without scanning the whole collection (IXSCAN instead of COLLSCAN). Also used for sorting and enforcing uniqueness.
Trade-offs: extra disk and RAM (indexes should fit in memory), slower inserts/updates/deletes because each index must be updated. Index fields that are frequently filtered/sorted; avoid indexing low-selectivity fields alone (e.g. a boolean) and unused indexes ($indexStats shows usage).`,
    },
    {
      q: 'What is a compound index and the ESR rule?',
      level: 'Medium',
      a: `A compound index covers multiple fields, e.g. { category: 1, price: -1 }. It supports queries on its prefixes: {category} and {category, price}, but not {price} alone.
ESR rule for field order: Equality fields first, then Sort fields, then Range fields.
Query: find({ category: 'mobile', price: { $lte: 20000 } }).sort({ rating: -1 })
Index: { category: 1, rating: -1, price: 1 }
This lets MongoDB jump to the category, read already sorted by rating (no in-memory sort), and filter price within the index.`,
    },
    {
      q: 'How do you find and fix a slow MongoDB query?',
      level: 'Medium',
      a: `1. Find it: Atlas Performance Advisor / Query Profiler, db.setProfilingLevel(1, { slowms: 100 }), or Mongoose debug mode (mongoose.set('debug', true)).
2. Analyse: query.explain('executionStats'). Red flags: stage COLLSCAN, SORT stage in memory, totalDocsExamined much larger than nReturned.
3. Fix: add the right (compound, ESR-ordered) index, return fewer fields with projection/select, use lean() in Mongoose, put $match early in aggregations, replace large skip with cursor pagination, avoid unbounded arrays and regex without anchors (/^abc/ can use an index, /abc/ cannot).`,
    },
    {
      q: 'What is a TTL index? Give a use case.',
      level: 'Easy',
      a: `A TTL (time-to-live) index is a single-field index on a Date field with expireAfterSeconds; a background task (runs about every 60 seconds) deletes documents after they expire.
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 }); // OTP valid 5 minutes
Use cases: OTPs, password-reset tokens, sessions, refresh tokens, temporary carts, logs retention. Note deletion is not instant (up to ~1 minute delay), so also check expiry in code for security-critical tokens.`,
    },
    {
      q: 'What is the aggregation pipeline? Name common stages.',
      level: 'Medium',
      a: `It is MongoDB's framework for data processing and analytics: documents flow through ordered stages, each transforming the stream.
Stages: $match (filter), $project/$addFields (reshape/compute), $group (group with $sum/$avg/$max/$push), $sort, $limit, $skip, $unwind (flatten arrays), $lookup (join), $facet (multiple sub-pipelines), $count, $bucket, $merge/$out (save results).
Example "monthly revenue": [{ $match: { status: 'paid' } }, { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$amount' } } }, { $sort: { _id: 1 } }].
Put $match and $limit early, and make $match use indexes.`,
    },
    {
      q: 'What does $lookup do? How is it different from populate?',
      level: 'Medium',
      a: `$lookup is an aggregation stage that performs a left outer join with another collection inside the database:
{ $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } }, { $unwind: '$author' }
populate is a Mongoose feature that runs a separate query (find with $in) and merges results in Node.
Use $lookup when you need to filter/sort/group by joined fields or want one round trip; use populate for simple "fill this reference" reads with less code. Both are slower than embedding, so frequent joins may signal a schema design issue.`,
    },
    {
      q: 'What does $unwind do?',
      level: 'Easy',
      a: `$unwind deconstructs an array field so each element becomes its own document.
Input: { _id: 1, tags: ['js', 'node'] }
After { $unwind: '$tags' }: { _id: 1, tags: 'js' } and { _id: 1, tags: 'node' }
Used before $group to count array items (e.g. most popular tags) or after $lookup to turn the joined array into an object. Option preserveNullAndEmptyArrays: true keeps documents with empty/missing arrays.`,
    },
    {
      q: 'How do you implement pagination with total count in one aggregation?',
      level: 'Hard',
      a: `Use $facet to run two sub-pipelines on the same filtered input:
Product.aggregate([
  { $match: { category: 'mobile' } },
  { $sort: { createdAt: -1 } },
  { $facet: {
      data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      total: [{ $count: 'count' }]
  } }
]);
Result: [{ data: [...], total: [{ count: 134 }] }]. Alternatively run find + countDocuments in parallel with Promise.all. For very large collections count is expensive; use estimatedDocumentCount (whole collection) or cursor pagination without totals.`,
    },
    {
      q: 'Does MongoDB support transactions? When do you need them?',
      level: 'Medium',
      a: `Yes. Single-document operations are always atomic. Multi-document ACID transactions exist since 4.0 (replica sets) and 4.2 (sharded clusters). They require a replica set or sharded cluster, not a standalone server.
Need them when several documents must change together or not at all: money transfer between two wallets, placing an order + reducing stock + creating payment record.
const session = await mongoose.startSession();
await session.withTransaction(async () => { ... { session } on every op ... });
Keep transactions short; they hold locks and have a 60-second default limit. Often good schema design (embedding) or a single atomic update ({ $inc } with a condition) avoids the need.`,
    },
    {
      q: 'How do you prevent overselling stock without a transaction?',
      level: 'Hard',
      a: `Use a single atomic conditional update:
const r = await Product.updateOne(
  { _id: productId, stock: { $gte: qty } },
  { $inc: { stock: -qty } }
);
if (r.modifiedCount === 0) throw new AppError('Out of stock', 409);
The filter and update happen atomically on one document, so two buyers cannot both take the last item. Reading stock first and then saving (read-modify-write) has a race condition. For multiple products in one order, either loop with compensation (roll back already decremented items) or use a transaction.`,
    },
    {
      q: 'What is a replica set? How does failover work?',
      level: 'Medium',
      a: `A replica set is a group of mongod instances holding the same data: one primary (all writes) and secondaries that replicate the primary's oplog (operation log) asynchronously. Typically 3 members (or 2 + an arbiter, not recommended for production).
Failover: members send heartbeats every 2 seconds; if the primary is unreachable for ~10 seconds, secondaries hold an election and one becomes the new primary. Drivers automatically discover the new primary and retry writes (retryWrites=true).
Benefits: high availability, data redundancy, read scaling with readPreference, and it enables transactions and change streams.`,
    },
    {
      q: 'What are write concern and read preference?',
      level: 'Hard',
      a: `Write concern says how many members must acknowledge a write before it is reported successful: w: 1 (primary only, fast, can lose data on failover), w: 'majority' (default since 5.0, durable against failover), j: true (written to journal).
Read preference says which members serve reads: primary (default, latest data), primaryPreferred, secondary, secondaryPreferred (offload analytics), nearest (lowest latency). Reading from secondaries may return stale data (replication lag).
Read concern ('local', 'majority', 'snapshot') controls how committed the returned data must be.`,
    },
    {
      q: 'What is sharding? How do you choose a shard key?',
      level: 'Hard',
      a: `Sharding is horizontal partitioning: a large collection is split into chunks distributed across shards (each a replica set). Components: shards, mongos routers (apps connect to mongos), config servers (cluster metadata). The balancer moves chunks to keep shards even.
Good shard key: high cardinality, low frequency (even distribution), not monotonically increasing, and present in most queries so they are targeted (otherwise scatter-gather to all shards).
Examples: { userId: 'hashed' } for a multi-tenant app; compound { customerId: 1, orderDate: 1 }. Bad: createdAt or ObjectId alone (all inserts hit one shard), status or country (low cardinality). Shard only when one replica set cannot handle data size or write throughput.`,
    },
    {
      q: 'Replication vs sharding?',
      level: 'Easy',
      a: `Replication copies the SAME data to multiple servers: for high availability, failover and read scaling. Every member has the full dataset.
Sharding splits DIFFERENT parts of the data across servers: for horizontal scaling of storage and write throughput. Each shard has part of the data.
Production sharded clusters use both: every shard is itself a replica set.`,
    },
    {
      q: 'What is Mongoose and why use it with MongoDB?',
      level: 'Easy',
      a: `Mongoose is an ODM (Object Data Modeling) library for MongoDB in Node.js. It adds an application-level schema on top of schemaless collections: types and casting (string "5" → Number), validation (required, enum, min, match), defaults, timestamps, middleware hooks, virtuals, population of references, instance/static methods and a chainable query API.
const User = mongoose.model('User', new mongoose.Schema({ email: { type: String, required: true, unique: true, lowercase: true } }, { timestamps: true }));
Alternative: the native MongoDB driver (faster, less abstraction) when you do not need these features.`,
    },
    {
      q: 'What does lean() do and when should you use it?',
      level: 'Medium',
      a: `lean() tells Mongoose to return plain JavaScript objects instead of hydrated Mongoose documents. Hydrated documents have change tracking, getters/setters, virtuals, save(), etc., which cost CPU and memory (lean results are several times smaller).
Use lean for read-only queries that are sent straight to res.json (lists, search results). Do not use it when you need doc.save(), virtuals/getters (unless using a plugin like mongoose-lean-virtuals), or document middleware.
const products = await Product.find({ category }).select('name price').lean();`,
    },
    {
      q: 'What is populate() and what are its drawbacks?',
      level: 'Medium',
      a: `populate replaces an ObjectId reference with the referenced document:
const order = await Order.findById(id).populate('user', 'name email').populate('items.product', 'name image');
Drawbacks: it runs an extra query per populated path (application-level join, not a database join); deep/nested populates multiply queries; you cannot filter the parent by populated fields efficiently (populate's match only filters the populated docs, leaving null). For complex joins or filtering by joined fields use $lookup, or denormalise frequently read fields.`,
    },
    {
      q: 'Explain Mongoose middleware (hooks). Give a real example.',
      level: 'Medium',
      a: `Middleware are functions that run before (pre) or after (post) certain operations:
- document middleware: save, validate, deleteOne (this = document)
- query middleware: find, findOne, findOneAndUpdate, updateOne, deleteMany (this = query)
- aggregate and model middleware.
Example: hash password before saving:
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
Example: soft-delete filter: schema.pre(/^find/, function () { this.where({ isDeleted: false }); });
Gotcha: findByIdAndUpdate/updateOne skip save hooks and validators unless runValidators: true; use regular functions, not arrows, because of this.`,
    },
    {
      q: 'What are virtuals in Mongoose?',
      level: 'Easy',
      a: `Virtuals are document properties computed on the fly, not stored in MongoDB.
userSchema.virtual('fullName').get(function () { return this.firstName + ' ' + this.lastName; });
To include them in res.json set { toJSON: { virtuals: true } } on the schema. Virtual populate links related documents without storing an array:
postSchema.virtual('comments', { ref: 'Comment', localField: '_id', foreignField: 'post' });
await Post.findById(id).populate('comments');
Virtuals are not queryable because they are not in the database.`,
    },
    {
      q: 'Why does unique: true sometimes not work in Mongoose?',
      level: 'Medium',
      a: `unique is not a validator; it only tells Mongoose to create a unique index. If the index was not built (autoIndex disabled in production, or duplicates already existed so index creation failed), duplicates get inserted.
When it does work, the error is a MongoServerError with code 11000 (E11000 duplicate key), not a ValidationError, so handle it in the error middleware and return 409 Conflict. Create indexes via migrations or Model.syncIndexes(), and also normalise values (lowercase emails) so 'A@x.com' and 'a@x.com' are not treated as different.`,
    },
    {
      q: 'save() vs updateOne() vs findOneAndUpdate()?',
      level: 'Medium',
      a: `- doc.save(): for a loaded document; runs full validation and save middleware, sends only modified fields. Two round trips (find + save) and possible race conditions.
- Model.updateOne(filter, update): one atomic round trip; returns { matchedCount, modifiedCount }, not the document. Skips save hooks; validators only with runValidators: true.
- findOneAndUpdate / findByIdAndUpdate: atomic update that returns the document (old by default; pass { new: true } or { returnDocument: 'after' } for the updated one).
Use operators like $set, $inc, $push, $addToSet, $pull for atomic changes (e.g. likes: $addToSet userId).`,
    },
    {
      q: 'How do you prevent NoSQL injection in a MERN app?',
      level: 'Hard',
      a: `Attack: login body { "email": "admin@x.com", "password": { "$ne": null } } turns a query into "password not equal to null" and may bypass checks when code does User.findOne(req.body).
Defences:
- Validate types with zod/joi (email must be a string).
- Never pass req.body/req.query directly into filters; pick fields explicitly.
- Enable Mongoose sanitizeFilter (mongoose.set('sanitizeFilter', true)) which wraps $-keys with $eq, or use a sanitiser that strips keys starting with $ or containing dots.
- Avoid $where and server-side JavaScript.
- Compare passwords with bcrypt in code, never inside the query.`,
    },
    {
      q: 'What are change streams in MongoDB?',
      level: 'Hard',
      a: `Change streams let an application subscribe to real-time changes (insert, update, delete) on a collection, database or cluster, built on the oplog, so they need a replica set or sharded cluster.
const stream = Order.watch([{ $match: { operationType: 'insert' } }]);
stream.on('change', (change) => io.emit('newOrder', change.fullDocument));
Use cases: live dashboards, notifications via Socket.IO, cache invalidation, syncing to search engines. They are resumable using a resume token after a disconnect.`,
    },
    {
      q: 'What is new or notable in MongoDB 8 and Mongoose 8?',
      level: 'Medium',
      a: `MongoDB 8.0: big performance improvements (faster reads, bulk writes and replication), queryable encryption with range queries, better sharding (faster resharding, moving unsharded collections), query settings to manage query shapes, and upgraded time-series performance.
Mongoose 8: works with MongoDB Node driver 6; promise-only API (callbacks were removed in 7); findByIdAndRemove removed (use findByIdAndDelete); strictQuery defaults to false (since 7); better TypeScript types. Mentioning that you use async/await with Mongoose and the Atlas cloud cluster is usually enough for freshers.`,
    },
  ],
  practice: [
    {
      task: 'Write a Mongoose User schema with: name (required, 2-50 chars), unique lowercase email with a regex check, password hidden by default and hashed in pre("save"), role enum (user/admin, default user), timestamps, and a comparePassword method.',
      hint: 'select: false on password; this.isModified("password"); use a regular function, not an arrow.',
      solution: `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 50 },
    email: {
      type: String, required: true, unique: true, lowercase: true, trim: true,
      match: [/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, 'Invalid email'],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model('User', userSchema);

// login usage:
// const user = await User.findOne({ email: String(req.body.email) }).select('+password');
// if (!user || !(await user.comparePassword(req.body.password))) return res.status(401).json({ error: 'Invalid credentials' });`,
    },
    {
      task: 'Write an aggregation that returns the top 5 best-selling products (by quantity) in the last 30 days, with product name and total revenue. Orders have items: [{ product, qty, price }].',
      hint: '$match on date and status → $unwind items → $group by items.product → $sort → $limit → $lookup products → $project.',
      solution: `const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const top = await Order.aggregate([
  { $match: { status: 'paid', createdAt: { $gte: since } } },
  { $unwind: '$items' },
  { $group: {
      _id: '$items.product',
      unitsSold: { $sum: '$items.qty' },
      revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } },
  } },
  { $sort: { unitsSold: -1 } },
  { $limit: 5 },
  { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
  { $unwind: '$product' },
  { $project: { _id: 0, productId: '$_id', name: '$product.name', unitsSold: 1, revenue: 1 } },
]);
// Index to support the $match: orderSchema.index({ status: 1, createdAt: -1 })`,
    },
    {
      task: 'Implement a money transfer between two wallets using a Mongoose transaction that fails if the sender has insufficient balance.',
      hint: 'session.withTransaction; conditional updateOne with $gte; throw to abort.',
      solution: `import mongoose from 'mongoose';

export async function transfer(fromId, toId, amount) {
  if (!(amount > 0)) throw new Error('Amount must be positive');
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const debit = await Wallet.updateOne(
        { _id: fromId, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { session }
      );
      if (debit.modifiedCount === 0) throw new Error('Insufficient balance');
      const credit = await Wallet.updateOne({ _id: toId }, { $inc: { balance: amount } }, { session });
      if (credit.matchedCount === 0) throw new Error('Receiver not found');
      await Transaction.create([{ from: fromId, to: toId, amount }], { session });
    });
    return { ok: true };
  } finally {
    await session.endSession();
  }
}
// Any thrown error aborts the transaction, so either all three writes happen or none.
// Requires a replica set (MongoDB Atlas or a local single-node replica set).`,
    },
    {
      task: 'Write the queries for a "posts feed" API: latest published posts with author name, cursor-based pagination by createdAt + _id, and the index that supports it.',
      hint: 'Use a compound cursor so posts with the same createdAt are not skipped.',
      solution: `// Index
postSchema.index({ published: 1, createdAt: -1, _id: -1 });

// GET /api/v1/posts?cursor=<createdAtISO>_<id>&limit=10
router.get('/', async (req, res) => {
  const limit = Math.min(50, Number(req.query.limit) || 10);
  const filter = { published: true };
  if (req.query.cursor) {
    const [ts, id] = String(req.query.cursor).split('_');
    const createdAt = new Date(ts);
    filter.$or = [
      { createdAt: { $lt: createdAt } },
      { createdAt, _id: { $lt: new mongoose.Types.ObjectId(id) } },
    ];
  }
  const posts = await Post.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)                       // fetch one extra to know if more exist
    .populate('author', 'name')
    .select('title slug author createdAt')
    .lean();
  const hasMore = posts.length > limit;
  const page = hasMore ? posts.slice(0, limit) : posts;
  const last = page.at(-1);
  res.json({
    data: page,
    nextCursor: hasMore ? last.createdAt.toISOString() + '_' + last._id : null,
  });
});`,
    },
    {
      task: 'In plain JS, simulate MongoDB\'s $group with $avg and $push: from an array of students { name, dept, marks }, return per dept the average marks and the list of names, sorted by average descending. Run it.',
      hint: 'Accumulate sum and count, then compute avg; push names.',
      solution: `const students = [
  { name: 'Asha', dept: 'CS', marks: 88 },
  { name: 'Ravi', dept: 'IT', marks: 72 },
  { name: 'Meera', dept: 'CS', marks: 94 },
  { name: 'Kiran', dept: 'IT', marks: 81 },
  { name: 'Zoya', dept: 'ME', marks: 67 },
];
// db.students.aggregate([{ $group: { _id: '$dept', avgMarks: { $avg: '$marks' }, names: { $push: '$name' } } }, { $sort: { avgMarks: -1 } }])
const acc = {};
for (const s of students) {
  acc[s.dept] ??= { _id: s.dept, sum: 0, count: 0, names: [] };
  acc[s.dept].sum += s.marks;
  acc[s.dept].count++;
  acc[s.dept].names.push(s.name);
}
const result = Object.values(acc)
  .map(({ _id, sum, count, names }) => ({ _id, avgMarks: sum / count, names }))
  .sort((a, b) => b.avgMarks - a.avgMarks);
console.log(result);
// [
//   { _id: 'CS', avgMarks: 91, names: [ 'Asha', 'Meera' ] },
//   { _id: 'IT', avgMarks: 76.5, names: [ 'Ravi', 'Kiran' ] },
//   { _id: 'ME', avgMarks: 67, names: [ 'Zoya' ] }
// ]`,
    },
  ],
  quiz: [
    {
      question: 'Which index best supports find({ status: "active", price: { $gt: 100 } }).sort({ createdAt: -1 })?',
      options: ['{ price: 1, status: 1, createdAt: -1 }', '{ createdAt: -1 }', '{ status: 1, createdAt: -1, price: 1 }', '{ price: 1 }'],
      answer: 2,
      explanation: 'ESR rule: Equality (status), then Sort (createdAt), then Range (price).',
    },
    {
      question: 'A blog post can receive unlimited comments that are paginated separately. Best design?',
      options: ['Separate Comment collection with a post reference', 'Embed all comments in the post array', 'Store comments as a single string', 'Create one collection per post'],
      answer: 0,
      explanation: 'Unbounded children risk the 16 MB limit and slow documents; store postId in each comment and index it.',
    },
    {
      question: 'What does .lean() do in Mongoose?',
      options: ['Deletes unused fields from the database', 'Returns plain JS objects instead of Mongoose documents', 'Compresses the response', 'Enables transactions'],
      answer: 1,
      explanation: 'lean() skips hydration, making read-only queries faster and lighter, but you lose save(), getters and virtuals.',
    },
    {
      question: 'Multi-document transactions in MongoDB require:',
      options: ['A standalone mongod', 'The $where operator', 'A text index', 'A replica set or sharded cluster'],
      answer: 3,
      explanation: 'Transactions rely on replication internals; Atlas clusters are replica sets by default.',
    },
    {
      question: 'Which shard key is usually a BAD choice for a high-write orders collection?',
      options: ['{ customerId: "hashed" }', '{ createdAt: 1 }', '{ customerId: 1, orderId: 1 }', '{ orderId: "hashed" }'],
      answer: 1,
      explanation: 'A monotonically increasing key sends all new inserts to the same chunk/shard (hot shard).',
    },
  ],
};
