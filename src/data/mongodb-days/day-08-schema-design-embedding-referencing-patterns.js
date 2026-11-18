export default {
  id: 'day-08-schema-design-embedding-referencing-patterns',
  title: 'Schema Design: Embedding vs Referencing, Relationships, Design Patterns & Anti-Patterns',
  module: 'Module 3: Data Modeling',
  day: 8,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'In MongoDB you design the schema around how the application reads and writes data, not around normalisation rules. Today you learn when to embed and when to reference, how to model one-to-one, one-to-many and many-to-many relationships, the most used schema design patterns and the anti-patterns that slow apps down.',
  objectives: [
    'Decide between embedding and referencing using clear rules (read together, size, growth, independence)',
    'Model one-to-one, one-to-few, one-to-many, one-to-squillions and many-to-many relationships',
    'Apply the subset, extended reference, bucket, computed and outlier patterns',
    'Recognise schema anti-patterns: unbounded arrays, massive documents, too many collections, unnecessary indexes, separating data that is read together',
    'Join referenced data with $lookup when you really need it',
  ],
  theory: [
    {
      heading: 'The golden rule: data that is accessed together is stored together',
      content: `In SQL you first **normalise** (split data into many tables so nothing is duplicated) and then write queries. In MongoDB you do the opposite: you first list the **queries your application runs most often**, then shape documents so that those queries read **one document** (or as few as possible).

**Analogy:** a SQL schema is like a library where every page of a book is stored on a different shelf and joined when you read. A MongoDB schema is like a book – the chapters you read together are bound together.

The design process used by MongoDB engineers:
1. **Describe the workload** – which screens/API endpoints exist, how often they run, read vs write ratio.
2. **Identify entities and relationships** – users, posts, comments, orders, products.
3. **Decide embed vs reference** for every relationship.
4. **Apply patterns** (subset, computed, bucket, ...) where the workload needs them.

There is no single "correct" schema. A schema is good if it makes the **most frequent operations cheap** and keeps documents well under the 16 MB limit.`,
      tip: 'In interviews, start every schema-design answer with "It depends on the access pattern. Which queries are most frequent?" – interviewers look for exactly this.',
    },
    {
      heading: 'Embedding vs Referencing',
      content: `**Embedding** = put related data inside the parent document (embedded document or array).
**Referencing** = store only the \`_id\` of the related document and fetch it separately (or with \`$lookup\`).

**Embed when:**
- The child data is read together with the parent (an order and its items)
- The child has no meaning without the parent (address of a user, items of an order)
- The number of children is **small and bounded** (a few to a few hundred)
- You want **atomic** updates of parent + child (single-document writes are always atomic)

**Reference when:**
- The child is large or grows without limit (all orders of a customer, all logs of a device)
- The child is used independently or by many parents (a product in many orders, a course in many enrollments)
- The child changes often and is duplicated in many places
- You need to query the children on their own with pagination

| | Embedding | Referencing |
|---|---|---|
| Reads | One query, very fast | Two queries or $lookup |
| Writes | Atomic in one document | May need a transaction for multi-doc consistency |
| Duplication | May duplicate data | No duplication |
| Size | Risk of large docs / 16 MB | Documents stay small |`,
      syntax: `// EMBEDDED: blog post with its comments (blog dataset)
{ _id: 4, title: 'MongoDB Aggregation for Beginners', authorId: 3,
  comments: [ { userId: 5, text: 'The $lookup part helped me a lot' }, ... ] }

// REFERENCED: enrollment points to student and course (college dataset)
{ _id: 1, studentId: 1, courseId: 'C101', grade: 'A', semester: 5 }`,
    },
    {
      heading: 'Modelling relationships: 1-1, 1-few, 1-many, 1-squillions, many-to-many',
      content: `- **One-to-one** (user → profile, student → marks): **embed** almost always. In the college dataset \`marks\` is embedded inside each student.
- **One-to-few** (user → addresses, product → tags): **embed an array**. Example: \`tags: ['5g', 'android']\` in products.
- **One-to-many** (customer → orders, post → comments when there can be thousands): **reference from the child** (\`orders.customerId\`) or embed only a subset. In the shop dataset each order stores \`customerId\`.
- **One-to-squillions** (server → millions of log lines): **always reference from the child** (\`log.serverId\`). Never keep an array of millions of ids in the parent.
- **Many-to-many** (students ↔ courses, products ↔ categories):
  - Small sides: arrays of ids on one or both sides (\`student.courseIds: ['C101', 'C103']\`)
  - Extra data on the relationship (grade, semester, enrolledAt): use a **linking collection**, exactly like \`enrollments\` in the college dataset.

Reference direction matters: put the reference on the side that keeps arrays **bounded**. "One customer has many orders" → store \`customerId\` in each order, not an \`orderIds\` array in the customer.`,
      points: [
        '1-1 → embed',
        '1-few → embed array',
        '1-many → reference in child (or subset pattern)',
        '1-squillions → reference in child only',
        'many-to-many → array of ids, or linking collection when the link has its own data',
      ],
    },
    {
      heading: 'Schema design patterns (part 1): subset, extended reference, computed',
      content: `**Subset pattern** – keep only the **most used part** of a large related list in the main document and the rest in another collection. Example: a product page shows the **latest 5 reviews**; the product document embeds those 5, and all 10,000 reviews live in a \`reviews\` collection. Keeps the working set small and pages fast.

**Extended reference pattern** – when you reference another document, also **copy the few fields you always display**. Example: an order stores \`customer: { _id: 101, name: 'Asha Patil', city: 'Pune' }\` instead of only \`customerId\`, so the order list needs no join. The copied fields should be ones that **rarely change** (name, not wallet balance). Accept that you must update copies if they change.

**Computed pattern** – store a value that would otherwise be calculated again and again. Example: \`commentCount\`, \`likes\`, \`totalSales\`, \`averageRating\`. Update it when the data changes (\`$inc\` on every new comment) instead of counting the array on every page view. Reads are frequent, writes are rare → pre-compute on write.`,
      syntax: `// computed pattern: add comment and update counter in ONE atomic write
db.posts.updateOne(
  { _id: 3 },
  { $push: { comments: { userId: 1, text: 'Nice' } }, $inc: { commentCount: 1 } }
)`,
      tip: 'Duplication is not a sin in MongoDB. Duplicate data that is read often and changes rarely; reference data that changes often.',
    },
    {
      heading: 'Schema design patterns (part 2): bucket and outlier (plus a few more)',
      content: `**Bucket pattern** – group many small, related items into one document per time window or per count. Example: an IoT sensor sending a reading every minute. Instead of 1,440 tiny documents per day, store **one document per sensor per hour** with a \`readings\` array of up to 60 values and pre-computed \`count\`, \`sum\`, \`min\`, \`max\`. Fewer documents, smaller indexes, faster range queries. (MongoDB **time series collections** apply this pattern automatically.)

**Outlier pattern** – design for the **normal** case and handle the rare huge case separately. Example: most books have a few hundred buyers embedded, but a bestseller has 2 million. Normal documents embed buyers; the outlier sets \`hasOverflow: true\` and moves extra buyers to an overflow collection. Your code checks the flag.

Other patterns you should be able to name:
- **Attribute pattern** – many optional fields become an array of key-value pairs \`specs: [{ k: 'ram', v: '16GB' }]\` so one index covers all of them.
- **Polymorphic pattern** – different shapes in one collection with a \`type\` field (Mongoose discriminators, Day 11).
- **Schema versioning pattern** – add \`schemaVersion: 2\` and migrate documents lazily.
- **Archive pattern** – move old data (orders older than 2 years) to an archive collection or cheaper storage.`,
      syntax: `// bucket pattern: one document per sensor per hour
{
  _id: 'sensor-7:2025-06-01T10',
  sensorId: 7,
  start: ISODate('2025-06-01T10:00:00Z'),
  readings: [ { m: 0, temp: 31.2 }, { m: 1, temp: 31.4 } /* ... up to 60 */ ],
  count: 60, sum: 1880.5, min: 30.9, max: 32.1
}`,
    },
    {
      heading: 'Schema anti-patterns to avoid',
      content: `MongoDB Atlas Performance Advisor and Compass actually flag these:

1. **Unbounded arrays** – arrays that grow forever (all followers of a celebrity, all orders of a customer inside the customer). Documents grow towards 16 MB, every update rewrites a big document, and array indexes explode. Fix: reference from the child, or subset/bucket/outlier.
2. **Massive documents / bloated documents** – storing rarely used large fields (full HTML, base64 images, long history) in documents that are read on every list page. Fix: move them to another collection; use projections.
3. **Separating data that is accessed together** – a "SQL-style" design with 8 collections and \`$lookup\` on every request. Fix: embed.
4. **Too many collections** – one collection per user or per day (\`orders_2025_06_01\`). Every collection has indexes and files, which waste memory. Fix: one collection with a field.
5. **Unnecessary indexes** – indexes that no query uses still slow down every insert/update and use RAM. Fix: \`$indexStats\`, drop unused ones.
6. **Case-insensitive queries without a case-insensitive index** – \`/^asha$/i\` regex cannot use a normal index efficiently. Fix: collation index or store a lowercase copy.`,
      tip: 'A useful rule of thumb: if an array can have more than a few hundred elements, or if you cannot say what its maximum size is, do not embed it.',
    },
  ],
  examples: [
    {
      title: 'One-to-many embedded: post with its comments',
      scenario: 'The blog post page shows the post title and all its comments. Because comments are embedded, one findOne returns everything the page needs.',
      steps: [
        'Open the blog dataset',
        'Run findOne for post 4 with a projection on title and comments',
        'Notice there is no second query and no join',
        'Think: is the number of comments per post bounded? (For a small blog, yes.)',
      ],
      code: 'db.posts.findOne({ _id: 4 }, { title: 1, comments: 1 })',
      mongo: { dataset: 'blog', query: 'db.posts.findOne({ _id: 4 }, { title: 1, comments: 1 })' },
      result: `{
  _id: 4,
  comments: [
    { userId: 5, text: 'The $lookup part helped me a lot' },
    { userId: 4, text: 'More examples please' },
    { userId: 2, text: 'Bookmarked' }
  ],
  title: 'MongoDB Aggregation for Beginners'
}`,
      explanation: 'Embedding fits "read together" data. The whole page is served by one document read, and adding a comment is a single atomic `$push`. If posts could get tens of thousands of comments, you would switch to the subset pattern (next examples).',
    },
    {
      title: 'Many-to-many with a linking collection + $lookup',
      scenario: 'Students and courses are a many-to-many relationship. The college dataset stores the relationship in enrollments (with grade and semester). Show Asha\'s (studentId 1) courses with titles.',
      steps: [
        'Open the college dataset',
        'Start an aggregation on enrollments and $match studentId 1',
        'Use $lookup to join courses on courseId → _id, then $unwind the result array',
        'Project the grade, course title and credits',
      ],
      code: `db.enrollments.aggregate([
  { $match: { studentId: 1 } },
  { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } },
  { $unwind: '$course' },
  { $project: { _id: 0, grade: 1, title: '$course.title', credits: '$course.credits' } }
])`,
      mongo: {
        dataset: 'college',
        query: `db.enrollments.aggregate([
  { $match: { studentId: 1 } },
  { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } },
  { $unwind: '$course' },
  { $project: { _id: 0, grade: 1, title: '$course.title', credits: '$course.credits' } }
])`,
      },
      result: `[
  { credits: 4, grade: 'A', title: 'Data Structures' },
  { credits: 3, grade: 'A+', title: 'Web Development (MERN)' }
]`,
      explanation: 'The relationship itself has data (grade, semester), so a linking collection is the right model – just like a junction table in SQL. `$lookup` performs a left outer join. Because it costs more than a single read, use it for reports and less frequent screens, not for the hottest query of the app.',
    },
    {
      title: 'Computed pattern: keep a comment counter',
      scenario: 'The home page lists posts with "N comments". Instead of counting the array on every request, store commentCount and update it in the same write that adds a comment.',
      steps: [
        'Open the blog dataset',
        'Use updateOne with $push (add the comment) and $inc (increase commentCount) together',
        'Read the post back with a projection',
        'Notice both changes happened in one atomic operation',
      ],
      code: `db.posts.updateOne(
  { _id: 3 },
  { $push: { comments: { userId: 1, text: 'Nice' } }, $inc: { commentCount: 1 } }
)
db.posts.findOne({ _id: 3 }, { comments: 1, commentCount: 1 })`,
      mongo: {
        dataset: 'blog',
        query: `db.posts.updateOne(
  { _id: 3 },
  { $push: { comments: { userId: 1, text: 'Nice' } }, $inc: { commentCount: 1 } }
)
db.posts.findOne({ _id: 3 }, { comments: 1, commentCount: 1 })`,
      },
      result: `{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
{ _id: 3, commentCount: 1, comments: [ { userId: 1, text: 'Nice' } ] }`,
      explanation: '`$inc` creates the field with the value 1 if it does not exist. Because both operators run on the same document in one updateOne, they are atomic: there is never a moment where the comment exists but the counter is old. This is the computed pattern – pay a tiny cost on write, save repeated work on every read.',
    },
    {
      title: 'Subset pattern: show only the latest comments',
      scenario: 'A post card shows only the 2 most recent comments and the total. Use $slice and $size so the client receives a small subset instead of the full array.',
      steps: [
        'Open the blog dataset',
        'Aggregate on posts and $match _id 4',
        'Use $slice with -2 to take the last 2 comments and $size to count all comments',
        'Compare the response size with returning the full array',
      ],
      code: `db.posts.aggregate([
  { $match: { _id: 4 } },
  { $project: { title: 1, recentComments: { $slice: ['$comments', -2] }, totalComments: { $size: '$comments' } } }
])`,
      mongo: {
        dataset: 'blog',
        query: `db.posts.aggregate([
  { $match: { _id: 4 } },
  { $project: { title: 1, recentComments: { $slice: ['$comments', -2] }, totalComments: { $size: '$comments' } } }
])`,
      },
      result: `[
  {
    _id: 4,
    recentComments: [
      { userId: 4, text: 'More examples please' },
      { userId: 2, text: 'Bookmarked' }
    ],
    title: 'MongoDB Aggregation for Beginners',
    totalComments: 3
  }
]`,
      explanation: 'In a real subset-pattern design the post document itself would store only the latest N comments (`$push` with `$each` + `$slice: -5` keeps it capped) and all comments would live in a separate `comments` collection with `postId`. This example shows the read side: the client only needs a small slice of a potentially large list.',
    },
    {
      title: 'Extended reference + bucket pattern in a real Mongoose model',
      scenario: 'An e-commerce order should show the customer name and city without a join, and an IoT dashboard should store sensor readings in hourly buckets. Here is how both are modelled in a Node.js project.',
      steps: [
        'Create models/order.model.js with an embedded customer snapshot (extended reference)',
        'Create models/reading.model.js with one bucket document per sensor per hour',
        'Use updateOne with upsert, $push, $inc, $min and $max to add a reading to the right bucket',
        'Run the app and look at the documents in Compass',
      ],
      code: `// models/order.model.js  – extended reference pattern
const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
  customer: {                       // copy of the fields every order list shows
    _id: { type: Number, required: true },
    name: String,
    city: String,
  },
  items: [{ productId: Number, name: String, qty: Number, price: Number }], // 1-few: embedded
  total: Number,
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'] },
}, { timestamps: true });

module.exports = model('Order', orderSchema);

// models/reading.model.js – bucket pattern (one doc per sensor per hour)
const readingBucketSchema = new Schema({
  sensorId: Number,
  hour: Date,                       // e.g. 2025-06-01T10:00:00Z
  readings: [{ at: Date, temp: Number }],
  count: Number, sum: Number, min: Number, max: Number,
});
readingBucketSchema.index({ sensorId: 1, hour: 1 }, { unique: true });
const ReadingBucket = model('ReadingBucket', readingBucketSchema);

// add one reading – creates the bucket on first reading of the hour
async function addReading(sensorId, at, temp) {
  const hour = new Date(at); hour.setUTCMinutes(0, 0, 0);
  await ReadingBucket.updateOne(
    { sensorId, hour, count: { $lt: 60 } },
    {
      $push: { readings: { at, temp } },
      $inc: { count: 1, sum: temp },
      $min: { min: temp },
      $max: { max: temp },
    },
    { upsert: true }
  );
}`,
      result: `orders document:
{ _id: ObjectId('...'), customer: { _id: 101, name: 'Asha Patil', city: 'Pune' }, items: [...], total: 20597, status: 'delivered', createdAt: ..., updatedAt: ... }

readingbuckets document after 3 readings:
{ sensorId: 7, hour: ISODate('2025-06-01T10:00:00Z'), readings: [ {...}, {...}, {...} ], count: 3, sum: 93.9, min: 30.9, max: 31.6 }`,
      explanation: 'The order list now needs no `$lookup` – the customer snapshot is inside the order. If Asha changes her name you update the copies with `updateMany({ "customer._id": 101 }, { $set: { "customer.name": ... } })`, which is rare. The bucket upsert adds a reading to the current hour\'s document, keeps the array bounded (max 60) and maintains pre-computed stats for fast dashboards.',
    },
  ],
  interview: [
    {
      q: 'How do you decide between embedding and referencing in MongoDB?',
      a: 'Look at the access pattern. Embed when data is read together, belongs to the parent, is small and bounded, and needs atomic updates with the parent (order + items, user + addresses). Reference when the child is large or unbounded, shared by many parents, updated independently, or queried on its own (customer → orders, product in many orders).',
      level: 'Easy',
    },
    {
      q: 'How would you model a one-to-many relationship like customer and orders?',
      a: 'Store customerId in each order (reference from the child), because a customer can have an unbounded number of orders. Optionally use the extended reference pattern to copy the customer name/city into each order, and the subset pattern to keep the last few orders in the customer document for the profile page.',
      level: 'Medium',
    },
    {
      q: 'How do you model many-to-many in MongoDB?',
      a: 'If both sides are small, keep an array of ids on one or both sides (student.courseIds). If the relationship has its own data (grade, semester, enrolledAt) or either side is large, use a linking collection like enrollments { studentId, courseId, grade } with indexes on both ids, and join with $lookup when needed.',
      level: 'Medium',
    },
    {
      q: 'What is the subset pattern?',
      a: 'Keep only the frequently used part of a large related list inside the main document (e.g. the 5 latest reviews in a product) and store the full list in another collection. It reduces document size and working-set memory while keeping the main page a single read. Use $push with $each and $slice to keep the embedded subset capped.',
      level: 'Medium',
    },
    {
      q: 'What is the extended reference pattern and what is its trade-off?',
      a: 'Along with the reference id you copy a few frequently displayed fields of the referenced document (customer name and city in an order) to avoid joins. Trade-off: data duplication – if the source changes you must update the copies, so only copy fields that rarely change.',
      level: 'Medium',
    },
    {
      q: 'Explain the computed pattern with an example.',
      a: 'Pre-calculate values on write instead of on every read. Example: store commentCount, likes or averageRating in the post/product and update them with $inc when a comment or rating is added. Useful when reads greatly outnumber writes.',
      level: 'Easy',
    },
    {
      q: 'What is the bucket pattern and where is it used?',
      a: 'Grouping many small items into one document per time range or per fixed count, e.g. one document per sensor per hour holding up to 60 readings plus summary stats. It reduces document count and index size and speeds up range queries. Used for IoT, logs, metrics, chat messages; MongoDB time series collections implement it internally.',
      level: 'Medium',
    },
    {
      q: 'What is the outlier pattern?',
      a: 'Design for the typical document and handle rare huge cases separately. Example: a book embeds its buyers, but a bestseller with millions of buyers sets hasOverflow: true and stores extra buyers in an overflow collection. Typical documents stay simple and fast while outliers do not break the 16 MB limit.',
      level: 'Hard',
    },
    {
      q: 'What is an unbounded array and why is it an anti-pattern?',
      a: 'An array that grows without a known limit (followers, all orders, all log lines in one document). It makes documents huge (risking 16 MB), every update rewrites a large document, multikey indexes grow massively and reads load data that is not needed. Fix by referencing from the child, or with subset, bucket or outlier patterns.',
      level: 'Medium',
    },
    {
      q: 'Is data duplication bad in MongoDB?',
      a: 'Not by default. Duplicating data that is read often and changes rarely (product name in an order, author name in a post) is a deliberate trade-off that avoids joins. Avoid duplicating data that changes frequently or must always be consistent everywhere (stock count, account balance).',
      level: 'Easy',
    },
    {
      q: 'Why is "one collection per user / per day" a bad design?',
      a: 'Each collection has its own indexes and storage files. Thousands of collections waste RAM and file handles, make queries across users/days hard and complicate indexing. Use one collection with a userId or date field and an index on it (or time series / archive patterns).',
      level: 'Hard',
    },
    {
      q: 'How does schema design affect atomicity?',
      a: 'Writes to a single document are always atomic, including embedded arrays and sub-documents. If related data is embedded, you get atomic updates without transactions. If it is split across documents, keeping them consistent may require a multi-document transaction, which is slower. So embedding data that must change together is also a consistency decision.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'For each relationship decide embed or reference and give a one-line reason: (a) user → addresses (max 5), (b) product → reviews (thousands), (c) order → items, (d) author → posts, (e) student ↔ course with grade.',
      hint: 'Ask: bounded? read together? shared? has its own data?',
      solution: `(a) Embed – few, bounded, always shown with the user.
(b) Reference (reviews collection with productId) + subset pattern: embed latest 5 reviews and a computed reviewCount/avgRating.
(c) Embed – items belong to the order, bounded, must be atomic with the order total.
(d) Reference – store authorId in each post (unbounded); optionally extended reference { authorId, authorName }.
(e) Linking collection enrollments { studentId, courseId, grade, semester } – the relationship has its own data.`,
    },
    {
      task: 'Using the blog dataset, add a like to post 5 AND record who liked it (userId 4) in a likedBy array, without adding duplicates, in one atomic write. Then show likes and likedBy.',
      hint: '$inc on likes and $addToSet on likedBy in one updateOne.',
      solution: `db.posts.updateOne(
  { _id: 5, likedBy: { $ne: 4 } },          // only if user 4 has not liked yet
  { $inc: { likes: 1 }, $addToSet: { likedBy: 4 } }
)
db.posts.findOne({ _id: 5 }, { likes: 1, likedBy: 1 })
// likes: 321, likedBy: [ 4 ]  – running it again matches 0 documents, so likes stays 321`,
    },
    {
      task: 'Using the blog dataset, write an aggregation that shows every published post with an extended-reference style author object { username, name } built with $lookup from users.',
      hint: '$match published, $lookup users on authorId → _id, $unwind, $project.',
      solution: `db.posts.aggregate([
  { $match: { published: true } },
  { $lookup: { from: 'users', localField: 'authorId', foreignField: '_id', as: 'a' } },
  { $unwind: '$a' },
  { $project: { title: 1, author: { username: '$a.username', name: '$a.name' } } }
])
// In an extended reference design you would STORE this author object inside each post
// so the list page needs no $lookup.`,
    },
    {
      task: 'Design the collections (with one sample document each) for a food-delivery app: restaurants with menus, customers with saved addresses, orders and delivery-partner GPS pings every 10 seconds.',
      hint: 'Menu: embed (bounded). Orders: reference + extended reference. GPS pings: bucket pattern.',
      solution: `// restaurants – menu embedded (bounded, read together)
{ _id: 1, name: 'Vaishali', city: 'Pune', rating: 4.5,
  menu: [ { itemId: 11, name: 'Masala Dosa', price: 120, veg: true } ] }

// customers – addresses embedded (1-few)
{ _id: 101, name: 'Asha Patil', phone: '98xxxxxx10',
  addresses: [ { label: 'Home', line1: 'FC Road', city: 'Pune', pin: '411004' } ] }

// orders – references + extended reference + embedded items
{ _id: 5001, customer: { _id: 101, name: 'Asha Patil' },
  restaurant: { _id: 1, name: 'Vaishali' },
  items: [ { itemId: 11, name: 'Masala Dosa', qty: 2, price: 120 } ],
  total: 240, status: 'out-for-delivery', partnerId: 77, createdAt: ISODate('2025-06-01T13:30:00Z') }

// partnerLocations – bucket pattern: one doc per partner per 10 minutes (max 60 pings)
{ _id: '77:2025-06-01T13:30', partnerId: 77, start: ISODate('2025-06-01T13:30:00Z'),
  pings: [ { t: 0, lat: 18.52, lng: 73.84 }, { t: 10, lat: 18.521, lng: 73.842 } ], count: 2 }`,
    },
    {
      task: 'Find the anti-pattern and fix it: a "users" collection where each user document has a followers array with user ids. Some influencers have 3 million followers.',
      hint: 'Unbounded array. Move the relationship to its own collection.',
      solution: `Anti-pattern: unbounded array (documents near 16 MB, slow updates, huge multikey index).

Fix: a follows collection, one document per relationship, plus a computed counter.
// follows
{ _id: ObjectId('...'), followerId: 42, followeeId: 7, createdAt: ISODate('2025-06-01T10:00:00Z') }
db.follows.createIndex({ followeeId: 1, createdAt: -1 })   // list followers of a user
db.follows.createIndex({ followerId: 1, followeeId: 1 }, { unique: true }) // no duplicates

// users keeps only computed counts
{ _id: 7, username: 'star', followersCount: 3000000, followingCount: 120 }
// on follow: insert into follows, then $inc followersCount by 1`,
    },
  ],
  quiz: [
    {
      question: 'Which relationship is the best candidate for embedding?',
      options: [
        'Customer → all orders over 10 years',
        'Order → its line items',
        'Server → millions of log lines',
        'Product → every review ever written',
      ],
      answer: 1,
      explanation: 'Line items are bounded, belong to the order, are always read with it and must change atomically with the total. The others are unbounded.',
    },
    {
      question: 'Storing customer name and city inside every order (along with customerId) is called…',
      options: ['Bucket pattern', 'Outlier pattern', 'Computed pattern', 'Extended reference pattern'],
      answer: 3,
      explanation: 'The extended reference pattern copies frequently displayed, rarely changing fields of the referenced document to avoid joins.',
    },
    {
      question: 'An IoT sensor sends a reading every second. Which pattern reduces the number of documents and index size?',
      options: ['Bucket pattern', 'Subset pattern', 'Polymorphic pattern', 'Extended reference pattern'],
      answer: 0,
      explanation: 'The bucket pattern groups many readings into one document per time window (time series collections do this automatically).',
    },
    {
      question: 'Which is a schema anti-pattern?',
      options: [
        'Embedding addresses in a user',
        'Storing a commentCount field',
        'An array that grows without limit inside one document',
        'Using a linking collection for enrollments',
      ],
      answer: 2,
      explanation: 'Unbounded arrays make documents grow toward the 16 MB limit and slow down every update and index.',
    },
    {
      question: 'Students and courses where each enrollment has a grade and semester should be modelled as…',
      options: [
        'Embedding all students inside each course',
        'A linking (enrollments) collection with studentId and courseId',
        'One collection per course',
        'A single array of course names in each student, with no grade',
      ],
      answer: 1,
      explanation: 'Many-to-many with data on the relationship → linking collection, like a junction table, indexed on both ids.',
    },
  ],
};
