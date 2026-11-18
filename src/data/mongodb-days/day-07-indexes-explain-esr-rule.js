export default {
  id: 'day-07-indexes-explain-esr-rule',
  title: 'Indexes: Single, Compound, Multikey, Unique, Partial, TTL, Text; explain() Plans, COLLSCAN vs IXSCAN & the ESR Rule',
  module: 'Module 2: Aggregation & Performance',
  day: 7,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'An API that is fast with 100 documents can take seconds with 10 lakh documents. Indexes are the number one tool for MongoDB performance. Today you learn every common index type, how to read explain() output (COLLSCAN vs IXSCAN), and how to design compound indexes with the ESR rule.',
  objectives: [
    'Explain what an index is, how it speeds up reads and what it costs on writes',
    'Create and manage single-field, compound, multikey, unique, partial, TTL and text indexes',
    'Read explain("executionStats") and compare COLLSCAN with IXSCAN using keys/docs examined',
    'Apply the prefix rule and the ESR (Equality, Sort, Range) rule to design compound indexes',
    'Avoid common indexing mistakes such as too many indexes and low-selectivity indexes',
  ],
  theory: [
    {
      heading: 'What is an index and why do we need it?',
      content: `Without an index, MongoDB must read **every document** in a collection to find matches – a **collection scan (COLLSCAN)**.

**Analogy:** finding "Aggregation" in a 900-page book. Without the index at the back you flip every page. With the index you jump straight to page 412. A MongoDB index is exactly that: a sorted list of field values with pointers to the documents (internally a **B-tree**).

- With an index MongoDB does an **index scan (IXSCAN)**, then **FETCH**es only the matching documents.
- Indexes also make **sort** fast (the index is already sorted) and can enforce **uniqueness**.
- Every collection has an automatic, unique index on **\`_id\`**.

**The cost:** every insert/update/delete must also update every index, and indexes use RAM and disk. So index the queries your app actually runs – not every field.`,
      syntax: `db.customers.createIndex({ city: 1 })          // 1 = ascending, -1 = descending
db.customers.getIndexes()                       // list indexes
db.customers.dropIndex('city_1')                // drop by name
db.customers.find({ city: 'Pune' }).explain('executionStats')`,
      tip: 'The working set (frequently used indexes + data) should fit in RAM. Atlas\'s Performance Advisor suggests indexes based on your real slow queries (Day 13).',
    },
    {
      heading: 'Index types you must know',
      content: `1. **Single-field** – \`{ email: 1 }\`. Direction does not matter for a single field (MongoDB can walk it both ways).
2. **Compound** – several fields in one index: \`{ category: 1, price: -1 }\`. Field **order matters** (see the prefix and ESR rules).
3. **Multikey** – created automatically when the indexed field is an **array** (\`{ tags: 1 }\`): one index entry per array element, so \`find({ tags: 'budget' })\` is fast. A compound index can contain at most one array field.
4. **Unique** – \`{ email: 1 }, { unique: true }\` rejects duplicates with error **E11000**.
5. **Partial** – index only documents that match a filter, e.g. only pending orders. Smaller and faster to maintain.
6. **TTL (Time-To-Live)** – a single-field index on a Date with \`expireAfterSeconds\`; a background job (every ~60 s) deletes expired documents. Perfect for OTPs, sessions, password-reset tokens, logs.
7. **Text** – full-text search on string content with \`$text\` (one text index per collection). On Atlas, **Atlas Search** (Lucene) is the more powerful modern option.
8. Others: **hashed** (for hash-based sharding), **2dsphere** (geospatial: "restaurants near me"), **wildcard** (\`{ 'attributes.$**': 1 }\` for unpredictable field names).`,
      syntax: `// unique: one account per email
db.customers.createIndex({ email: 1 }, { unique: true })

// partial: index only pending orders
db.orders.createIndex({ orderDate: -1 }, { partialFilterExpression: { status: 'pending' } })

// TTL: delete OTP documents 5 minutes after createdAt
db.otps.createIndex({ createdAt: 1 }, { expireAfterSeconds: 300 })

// text: search in title and body, title counts 3x more
db.posts.createIndex({ title: 'text', body: 'text' }, { weights: { title: 3 } })
db.posts.find({ $text: { $search: 'mongodb aggregation' } }, { score: { $meta: 'textScore' } })
  .sort({ score: { $meta: 'textScore' } })`,
      tip: 'A partial index is used only if the query filter includes the partial condition (e.g. status: "pending"). A sparse index is the older, less flexible form of partial index.',
    },
    {
      heading: 'Reading explain() output',
      content: `\`cursor.explain('executionStats')\` shows how MongoDB ran a query. The important parts:

- **queryPlanner.winningPlan.stage** – the plan tree:
  - \`COLLSCAN\` – full collection scan (bad on big collections)
  - \`IXSCAN\` – walked an index (good); usually under a \`FETCH\` stage that loads the full documents
  - \`SORT\` – an **in-memory sort** (index could not provide the order; costly, 100 MB limit)
  - \`PROJECTION_COVERED\` – a **covered query**: answered from the index alone, no FETCH
- **executionStats.nReturned** – documents returned
- **executionStats.totalKeysExamined** – index entries read
- **executionStats.totalDocsExamined** – documents read
- **executionTimeMillis** – time taken

**Golden ratio:** ideally \`nReturned ≈ totalKeysExamined ≈ totalDocsExamined\`. If docsExamined is 1,00,000 and nReturned is 10, you need a (better) index.

Real mongosh prints a much larger explain document (rejectedPlans, server info, etc.). The MongoDB Shell Lab shows a simplified version with the same key fields, and it chooses IXSCAN when the first field of your filter is the first key of an index.`,
    },
    {
      heading: 'Compound indexes: the prefix rule',
      content: `A compound index \`{ category: 1, price: -1, rating: 1 }\` is sorted first by category, then by price inside each category, then by rating.

It can support queries on its **prefixes**:
- \`{ category }\` ✓
- \`{ category, price }\` ✓
- \`{ category, price, rating }\` ✓
- \`{ price }\` alone ✗ (not a prefix – like searching a phone book by first name only)
- \`{ category, rating }\` – partly: uses the category part, then filters rating

Because of this, an index on \`{ category: 1, price: -1 }\` makes a separate \`{ category: 1 }\` index **redundant** – drop it.

**Sort direction:** for a single-field sort, direction does not matter. For multi-field sorts the directions must match the index or be its exact inverse: index \`{ a: 1, b: -1 }\` supports \`sort({ a: 1, b: -1 })\` and \`sort({ a: -1, b: 1 })\` but NOT \`sort({ a: 1, b: 1 })\`.`,
    },
    {
      heading: 'The ESR rule (Equality → Sort → Range)',
      content: `When a query has equality filters, a sort, and range filters, order the compound index fields as:

1. **E – Equality** fields first (\`status: 'delivered'\`, \`customerId: 101\`) – they narrow the scan to one exact section of the index.
2. **S – Sort** fields next (\`orderDate: -1\`) – inside that section the index is already in sort order, so no in-memory SORT stage is needed.
3. **R – Range** fields last (\`total: { $gte: 10000 }\`, \`$lt\`, \`$in\` with many values, \`$ne\`, \`$regex\`) – they are filtered while walking the index.

**Example query (a common "my orders" API):**
\`db.orders.find({ status: 'delivered', total: { $gte: 10000 } }).sort({ orderDate: -1 })\`

Best index: \`{ status: 1, orderDate: -1, total: 1 }\` (E, S, R).

If you put range before sort – \`{ status: 1, total: 1, orderDate: -1 }\` – the results come out ordered by total, so MongoDB must do an in-memory SORT. On large collections that is slow and can hit the memory limit.`,
      tip: 'Interview line: "I design compound indexes using ESR – equality fields first, then the sort fields, then range fields – and I verify with explain that there is no SORT stage and keys examined ≈ documents returned."',
    },
    {
      heading: 'Indexing best practices',
      content: `- Index fields used in **filters, sorts and $lookup foreignField** of your frequent queries.
- Prefer **high-selectivity** fields (email, userId) over low-selectivity ones (boolean \`prime\`, \`gender\`) – an index that matches 50% of documents barely helps.
- Use **covered queries**: project only indexed fields and exclude \`_id\`, e.g. index \`{ email: 1, name: 1 }\` + \`find({ email }, { _id: 0, email: 1, name: 1 })\`.
- Keep the number of indexes reasonable (each slows writes). Remove unused ones – check \`$indexStats\`.
- In Mongoose declare indexes in the schema (\`email: { type: String, unique: true }\`, \`schema.index({ status: 1, orderDate: -1 })\`) and set \`autoIndex: false\` in production, creating indexes through a deploy script.
- Build big indexes in off-peak hours (since 4.2 builds hold only short locks but still use resources).
- \`hint()\` forces a specific index – useful to test, rarely needed in code.`,
      syntax: `// how often is each index used?
db.orders.aggregate([{ $indexStats: {} }])

// Mongoose
const orderSchema = new mongoose.Schema({ status: String, orderDate: Date, total: Number });
orderSchema.index({ status: 1, orderDate: -1, total: 1 });`,
    },
  ],
  examples: [
    {
      title: 'COLLSCAN before, IXSCAN after creating an index',
      scenario: 'The "customers by city" API is slow. Check the plan, create an index on city, and check again.',
      steps: [
        'Choose the shop dataset',
        'Run find({ city: "Pune" }).explain() and note stage COLLSCAN and totalDocsExamined 8',
        'Create the index with createIndex({ city: 1 }) – it returns the index name city_1',
        'Run the same explain again and note IXSCAN with only 2 keys and 2 documents examined',
      ],
      code: `db.customers.find({ city: 'Pune' }).explain()
db.customers.createIndex({ city: 1 })
db.customers.find({ city: 'Pune' }).explain()`,
      mongo: {
        dataset: 'shop',
        query: `db.customers.find({ city: 'Pune' }).explain()
db.customers.createIndex({ city: 1 })
db.customers.find({ city: 'Pune' }).explain()`,
      },
      result: `{
  queryPlanner: {
    namespace: 'shop.customers',
    winningPlan: { stage: 'COLLSCAN', filter: { city: 'Pune' } }
  },
  executionStats: { nReturned: 2, totalKeysExamined: 0, totalDocsExamined: 8 }
}
'city_1'
{
  queryPlanner: {
    namespace: 'shop.customers',
    winningPlan: {
      stage: 'FETCH',
      inputStage: { stage: 'IXSCAN', indexName: 'city_1', keyPattern: { city: 1 } }
    }
  },
  executionStats: { nReturned: 2, totalKeysExamined: 2, totalDocsExamined: 2 }
}`,
      explanation: 'Before the index MongoDB examined all 8 documents to return 2. After the index it walked 2 index keys and fetched exactly 2 documents (FETCH → IXSCAN). With 8 documents the difference is tiny, but with 10 lakh customers it is the difference between milliseconds and seconds. In real mongosh use `explain("executionStats")` to get the executionStats section.',
    },
    {
      title: 'Unique index and the E11000 duplicate key error',
      scenario: 'Two accounts must never share an email. Add a unique index and try to register a fake account with an existing email.',
      steps: [
        'Choose the shop dataset',
        'Create a unique index on email',
        'Wrap a duplicate insertOne in try/catch and print the error message',
        'List indexes with getIndexes() and notice unique: true',
      ],
      code: `db.customers.createIndex({ email: 1 }, { unique: true })
try {
  db.customers.insertOne({ _id: 109, name: 'Fake Asha', email: 'asha@example.com' })
} catch (e) {
  print(e.message)
}
db.customers.getIndexes()`,
      mongo: {
        dataset: 'shop',
        query: `db.customers.createIndex({ email: 1 }, { unique: true })
try {
  db.customers.insertOne({ _id: 109, name: 'Fake Asha', email: 'asha@example.com' })
} catch (e) {
  print(e.message)
}
db.customers.getIndexes()`,
      },
      result: `'email_1'
E11000 duplicate key error collection: shop.customers index: email_1 dup key: { email: "asha@example.com" }
[
  { v: 2, key: { _id: 1 }, name: '_id_' },
  { v: 2, name: 'email_1', key: { email: 1 }, unique: true }
]`,
      explanation: 'The insert is rejected with error code 11000 (E11000 duplicate key). In an Express + Mongoose API you catch `err.code === 11000` and return 409 Conflict "Email already registered". Note: a unique index is the only reliable way to prevent duplicates – checking with findOne before inserting has a race condition when two requests arrive at the same time. If existing data already has duplicates, createIndex itself fails until you clean them.',
    },
    {
      title: 'Compound index and the prefix rule',
      scenario: 'The product listing page filters by category and price. Create a compound index and check which queries can use it.',
      steps: [
        'Choose the shop dataset',
        'Create the compound index { category: 1, price: -1 }',
        'Explain a query on category + price: it uses IXSCAN',
        'Explain a query on price only: it falls back to COLLSCAN because price is not a prefix of the index',
      ],
      code: `db.products.createIndex({ category: 1, price: -1 })
db.products.find({ category: 'Laptops', price: { $gt: 50000 } }).explain().queryPlanner.winningPlan
db.products.find({ price: { $lt: 5000 } }).explain().executionStats`,
      mongo: {
        dataset: 'shop',
        query: `db.products.createIndex({ category: 1, price: -1 })
db.products.find({ category: 'Laptops', price: { $gt: 50000 } }).explain().queryPlanner.winningPlan
db.products.find({ price: { $lt: 5000 } }).explain().executionStats`,
      },
      result: `'category_1_price_-1'
{
  stage: 'FETCH',
  inputStage: {
    stage: 'IXSCAN',
    indexName: 'category_1_price_-1',
    keyPattern: { category: 1, price: -1 }
  }
}
{ nReturned: 2, totalKeysExamined: 0, totalDocsExamined: 12 }`,
      explanation: 'The compound index is sorted by category first, so queries starting with category can use it. A query on price alone cannot (totalKeysExamined: 0, totalDocsExamined: 12 = all documents). If the price-only query is frequent, add a separate `{ price: 1 }` index. Remember you do NOT also need `{ category: 1 }` – it is a prefix of this index.',
    },
    {
      title: 'Multikey index on an array field',
      scenario: 'Users filter products by tag ("budget", "wireless"). tags is an array, so the index becomes multikey automatically.',
      steps: [
        'Choose the shop dataset',
        'Create an index on tags (no special option needed)',
        'Find budget products and look at the winning plan',
        'List indexes, then drop the tags index by name',
      ],
      code: `db.products.createIndex({ tags: 1 })
db.products.find({ tags: 'budget' }, { _id: 0, name: 1, tags: 1 })
db.products.find({ tags: 'budget' }).explain().queryPlanner.winningPlan
db.products.getIndexes()
db.products.dropIndex('tags_1')`,
      mongo: {
        dataset: 'shop',
        query: `db.products.createIndex({ tags: 1 })
db.products.find({ tags: 'budget' }, { _id: 0, name: 1, tags: 1 })
db.products.find({ tags: 'budget' }).explain().queryPlanner.winningPlan
db.products.getIndexes()
db.products.dropIndex('tags_1')`,
      },
      result: `'tags_1'
{ name: 'Redmi Note 13', tags: [ '5g', 'android', 'budget' ] }
{ name: 'IdeaPad Slim 3', tags: [ 'windows', 'budget' ] }
{ name: 'boAt Airdopes 141', tags: [ 'wireless', 'budget' ] }
{ name: 'Noise ColorFit Pro 5', tags: [ 'budget' ] }
{
  stage: 'FETCH',
  inputStage: { stage: 'IXSCAN', indexName: 'tags_1', keyPattern: { tags: 1 } }
}
[
  { v: 2, key: { _id: 1 }, name: '_id_' },
  { v: 2, name: 'tags_1', key: { tags: 1 } }
]
{ nIndexesWas: 2, ok: 1 }`,
      explanation: 'For each product MongoDB stores one index key per tag, e.g. Redmi Note 13 creates keys "5g", "android" and "budget". So `{ tags: \'budget\' }` jumps straight to the 4 matching products. In real explain output you also see `isMultiKey: true`. dropIndex returns `nIndexesWas` (the count before dropping). Limitation: a compound index can include only ONE array field.',
    },
    {
      title: 'ESR rule for a "delivered orders" API',
      scenario: 'The API runs: delivered orders with total ≥ 10,000, newest first. Design the index with Equality (status), Sort (orderDate), Range (total).',
      steps: [
        'Choose the shop dataset',
        'Create the index { status: 1, orderDate: -1, total: 1 } with a readable name',
        'Run the real query with sort and projection',
        'Explain it and confirm IXSCAN on the esr index',
      ],
      code: `db.orders.createIndex({ status: 1, orderDate: -1, total: 1 }, { name: 'status_date_total_esr' })
db.orders.find({ status: 'delivered', total: { $gte: 10000 } }, { total: 1, orderDate: 1 }).sort({ orderDate: -1 })
db.orders.find({ status: 'delivered', total: { $gte: 10000 } }).sort({ orderDate: -1 }).explain().queryPlanner.winningPlan`,
      mongo: {
        dataset: 'shop',
        query: `db.orders.createIndex({ status: 1, orderDate: -1, total: 1 }, { name: 'status_date_total_esr' })
db.orders.find({ status: 'delivered', total: { $gte: 10000 } }, { total: 1, orderDate: 1 }).sort({ orderDate: -1 })
db.orders.find({ status: 'delivered', total: { $gte: 10000 } }).sort({ orderDate: -1 }).explain().queryPlanner.winningPlan`,
      },
      result: `'status_date_total_esr'
{ _id: 1011, orderDate: ISODate('2025-04-18T10:00:00.000Z'), total: 35998 }
{ _id: 1009, orderDate: ISODate('2025-04-01T14:00:00.000Z'), total: 19998 }
{ _id: 1008, orderDate: ISODate('2025-03-15T08:25:00.000Z'), total: 55485 }
{ _id: 1006, orderDate: ISODate('2025-03-03T11:45:00.000Z'), total: 109800 }
{ _id: 1004, orderDate: ISODate('2025-02-14T12:30:00.000Z'), total: 13494 }
{ _id: 1002, orderDate: ISODate('2025-01-14T18:40:00.000Z'), total: 114900 }
{ _id: 1001, orderDate: ISODate('2025-01-10T10:15:00.000Z'), total: 20597 }
{
  stage: 'FETCH',
  inputStage: {
    stage: 'IXSCAN',
    indexName: 'status_date_total_esr',
    keyPattern: { status: 1, orderDate: -1, total: 1 }
  }
}`,
      explanation: 'Equality on status narrows the index to the "delivered" section; inside it entries are already ordered by orderDate descending, so no in-memory SORT is needed; total is checked while scanning (range). In real MongoDB you would confirm with `explain("executionStats")` that there is no SORT stage. An index ordered `{ status, total, orderDate }` would force a blocking SORT.',
    },
  ],
  interview: [
    {
      q: 'What is an index in MongoDB and how does it work?',
      a: 'An index is a separate B-tree data structure that stores the values of one or more fields in sorted order with pointers to the documents. Queries can walk the index (IXSCAN) instead of scanning every document (COLLSCAN). Indexes speed up filters and sorts but cost RAM/disk and slow down writes.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between COLLSCAN and IXSCAN?',
      a: 'COLLSCAN reads every document in the collection; IXSCAN reads only the relevant range of an index and then FETCHes matching documents. In explain output a COLLSCAN on a large collection with high totalDocsExamined compared with nReturned signals a missing index.',
      level: 'Easy',
    },
    {
      q: 'Explain the ESR rule.',
      a: 'For compound indexes, order fields as Equality first, then Sort, then Range. Equality fields narrow the scan to exact keys, sort fields let the index return documents already sorted (no in-memory SORT), and range fields are filtered last. Example: find({ status: "delivered", total: { $gte: 1000 } }).sort({ orderDate: -1 }) → index { status: 1, orderDate: -1, total: 1 }.',
      level: 'Hard',
    },
    {
      q: 'What is the prefix rule of compound indexes?',
      a: 'A compound index can serve queries that use a left prefix of its fields. Index { a: 1, b: 1, c: 1 } supports queries on a, a+b and a+b+c, but not on b or c alone. Therefore an index { a: 1 } is redundant if { a: 1, b: 1 } exists.',
      level: 'Medium',
    },
    {
      q: 'What is a multikey index?',
      a: 'An index on an array field. MongoDB creates an index key for each element of the array, so queries on array elements are fast. It is created automatically when the indexed field contains an array. A compound index can contain at most one array field, and multikey indexes cannot be shard keys.',
      level: 'Medium',
    },
    {
      q: 'What is a TTL index? Give a use case.',
      a: 'A single-field index on a Date field with expireAfterSeconds. A background thread (roughly every 60 seconds) deletes documents whose date + expireAfterSeconds is in the past. Use cases: OTP codes, sessions, password reset tokens, temporary carts, logs. Deletion is not instant (up to about a minute delay).',
      level: 'Medium',
    },
    {
      q: 'What is a partial index and how is it different from a sparse index?',
      a: 'A partial index indexes only documents matching partialFilterExpression (e.g. { status: "pending" } or { email: { $exists: true } }), making it smaller and cheaper. A sparse index only skips documents missing the field. Partial indexes are more flexible and recommended. The query must include the filter condition to use a partial index.',
      level: 'Hard',
    },
    {
      q: 'What is a covered query?',
      a: 'A query whose filter and projection fields are all in one index, with _id excluded (unless indexed). MongoDB answers it from the index alone without reading documents – explain shows no FETCH stage and totalDocsExamined: 0.',
      level: 'Hard',
    },
    {
      q: 'Why not create an index on every field?',
      a: 'Each index adds work to every insert/update/delete, uses disk and RAM, and too many indexes can push the working set out of memory. Low-selectivity fields (booleans) help little. Index only for your real query patterns and remove unused indexes ($indexStats).',
      level: 'Medium',
    },
    {
      q: 'How do you handle duplicate emails during registration?',
      a: 'Create a unique index on email (in Mongoose: unique: true). Catch the duplicate key error (code 11000) and return HTTP 409. Do not rely only on a findOne check before insert because concurrent requests can both pass the check.',
      level: 'Medium',
    },
    {
      q: 'How do you find which queries need indexes in production?',
      a: 'Use the database profiler or slow query logs (queries over 100 ms by default), Atlas Query Profiler and Performance Advisor (suggests indexes), explain("executionStats") on suspect queries, and $indexStats to find unused indexes.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between a text index and Atlas Search?',
      a: 'A text index is built into MongoDB: one per collection, $text queries with stemming and stop words, basic relevance score. Atlas Search is a Lucene-based search engine integrated into Atlas via the $search stage, with fuzzy matching (typos), autocomplete, synonyms, highlighting, facets and custom scoring. For real product search, Atlas Search is preferred.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'College dataset: run explain() on find({ branch: "CSE" }), create an index on branch, run explain again and write down totalDocsExamined before and after.',
      hint: 'createIndex({ branch: 1 }).',
      solution: `db.students.find({ branch: 'CSE' }).explain()      // COLLSCAN, totalDocsExamined: 10
db.students.createIndex({ branch: 1 })              // 'branch_1'
db.students.find({ branch: 'CSE' }).explain()      // IXSCAN, keys 4, docs 4`,
    },
    {
      task: 'Blog dataset: make username unique in users, then show that inserting another "neha_js" fails (print the error inside try/catch).',
      hint: 'createIndex with { unique: true }; try/catch with print(e.message).',
      solution: `db.users.createIndex({ username: 1 }, { unique: true })
try {
  db.users.insertOne({ _id: 6, username: 'neha_js', name: 'Copy Cat', role: 'reader' })
} catch (e) {
  print(e.message)   // E11000 duplicate key error ... dup key: { username: "neha_js" }
}`,
    },
    {
      task: 'Design the best index for this API query using ESR and explain your order: db.posts.find({ published: true, authorId: 3, likes: { $gte: 100 } }).sort({ createdAt: -1 })',
      hint: 'Two equality fields, one sort, one range.',
      solution: `// E: authorId, published   S: createdAt   R: likes
db.posts.createIndex({ authorId: 1, published: 1, createdAt: -1, likes: 1 })

// authorId first because it is more selective than the boolean published.
// createdAt before likes so results come out of the index already sorted (no SORT stage).
// likes last because it is a range condition.
db.posts.find({ published: true, authorId: 3, likes: { $gte: 100 } }).sort({ createdAt: -1 }).explain()`,
    },
    {
      task: 'Write the real mongosh commands for: (a) an OTP collection whose documents auto-delete 10 minutes after createdAt, (b) a partial index on orders.orderDate only for pending orders, (c) a text index on posts.title and a search for "mongodb" sorted by relevance.',
      hint: 'expireAfterSeconds, partialFilterExpression, $text + $meta.',
      solution: `// (a) TTL index
db.otps.createIndex({ createdAt: 1 }, { expireAfterSeconds: 600 })
db.otps.insertOne({ phone: '9876543210', code: '482913', createdAt: new Date() })

// (b) partial index
db.orders.createIndex({ orderDate: -1 }, { partialFilterExpression: { status: 'pending' } })
db.orders.find({ status: 'pending' }).sort({ orderDate: -1 })   // can use it

// (c) text index + search
db.posts.createIndex({ title: 'text' })
db.posts.find({ $text: { $search: 'mongodb' } }, { title: 1, score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })`,
    },
    {
      task: 'In a Mongoose User/Order schema, declare: unique email, an index on orders.customerId, and the ESR index { status: 1, orderDate: -1, total: 1 }. Also add a TTL on a PasswordReset model.',
      hint: 'unique: true and index: true in field options; schema.index(); expires option on a Date.',
      solution: `const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
});

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'] },
  orderDate: { type: Date, default: Date.now },
  total: Number,
});
orderSchema.index({ status: 1, orderDate: -1, total: 1 });

const resetSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  token: String,
  createdAt: { type: Date, default: Date.now, expires: 900 },  // TTL: 15 minutes
});

// In production: mongoose.set('autoIndex', false) and run Model.syncIndexes() in a deploy script.`,
    },
  ],
  quiz: [
    {
      question: 'In explain() output, which stage means MongoDB read every document in the collection?',
      options: ['IXSCAN', 'FETCH', 'COLLSCAN', 'PROJECTION_COVERED'],
      answer: 2,
      explanation: 'COLLSCAN is a full collection scan. IXSCAN means an index was used.',
    },
    {
      question: 'Given index { category: 1, price: -1 }, which query can NOT use it efficiently?',
      options: [
        'find({ category: "Audio" })',
        'find({ price: { $lt: 5000 } })',
        'find({ category: "Audio", price: { $lt: 5000 } })',
        'find({ category: "Audio" }).sort({ price: -1 })',
      ],
      answer: 1,
      explanation: 'price alone is not a prefix of the index, so the query falls back to a collection scan.',
    },
    {
      question: 'What does the ESR rule stand for?',
      options: [
        'Equality, Sort, Range',
        'Embed, Split, Reference',
        'Exists, Size, Regex',
        'Explain, Scan, Return',
      ],
      answer: 0,
      explanation: 'Order compound index fields: Equality fields, then Sort fields, then Range fields.',
    },
    {
      question: 'Which index type automatically deletes documents after a period of time?',
      options: ['Partial index', 'Multikey index', 'Text index', 'TTL index'],
      answer: 3,
      explanation: 'A TTL index on a Date field with expireAfterSeconds removes expired documents in the background.',
    },
    {
      question: 'Which error code does MongoDB return when an insert violates a unique index?',
      options: ['404', '11000', '500', '16755'],
      answer: 1,
      explanation: 'E11000 duplicate key error (code 11000). APIs usually translate it to HTTP 409 Conflict.',
    },
  ],
};
