export default {
  id: 'day-15-mongodb-interview-preparation',
  title: 'MongoDB Interview Preparation: 28 Interview Q&A + 10 Query-Writing Questions',
  module: 'Module 5: Production & Interview',
  day: 15,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'The final day turns everything you learned into interview answers. You revise the core concepts in a quick cheat sheet, practise 10 real query-writing questions that are asked in MERN developer interviews (each runnable in the MongoDB Shell Lab), and go through 28 theory questions from easy to hard.',
  objectives: [
    'Revise MongoDB concepts in a structured way: CRUD, operators, aggregation, indexes, modeling, transactions, Mongoose',
    'Solve typical query-writing interview questions with find() and aggregation pipelines',
    'Explain answers clearly: definition → example → trade-off',
    'Recognise trick questions (second highest value, HAVING equivalent, joins, never-ordered products)',
    'Prepare a 2-minute explanation of the MongoDB part of your MERN project',
  ],
  theory: [
    {
      heading: 'How MongoDB is tested in MERN interviews',
      content: `For fresher and 0–3 year MERN roles, interviewers usually check MongoDB in four rounds:

1. **Concept questions** – SQL vs NoSQL, BSON, \`_id\`/ObjectId, embedding vs referencing, indexes, transactions, replica sets, sharding.
2. **Query writing** – on a shared screen or paper: "find the second highest price", "top 3 customers by spend", "monthly revenue", "students per branch with average > 7.5".
3. **Mongoose / backend** – schemas, validation, populate, middleware (password hashing), pagination API, error handling.
4. **Project discussion** – "show me your schema", "why did you embed this?", "how would it scale to 1 million users?"

**How to answer any concept question (D-E-T formula):**
- **D**efinition in one line
- **E**xample from a real app (e-commerce, blog, college)
- **T**rade-off or a "when not to use it"

Example: "An index is a sorted data structure (B-tree) on one or more fields that lets MongoDB find documents without scanning the whole collection. For example an index on \`email\` makes login lookups IXSCAN instead of COLLSCAN. The trade-off is extra RAM/disk and slower writes, so we index only fields used in frequent filters and sorts."`,
      tip: 'When writing a query in an interview, say your plan out loud first ("I will filter, then group by customer, sort by total and limit to 3"). Interviewers give marks for the approach even if you forget a bracket.',
    },
    {
      heading: 'Cheat sheet 1: CRUD and query operators',
      content: `- **Create:** \`insertOne(doc)\`, \`insertMany([docs], { ordered: false })\`
- **Read:** \`find(filter, projection)\`, \`findOne()\`, \`countDocuments()\`, \`distinct()\`; cursor \`.sort().skip().limit()\`
- **Update:** \`updateOne/updateMany(filter, update, { upsert })\`, \`replaceOne\`, \`findOneAndUpdate(..., { returnDocument: 'after' })\`
- **Delete:** \`deleteOne\`, \`deleteMany\`, \`findOneAndDelete\`
- **Comparison:** \`$eq $ne $gt $gte $lt $lte $in $nin\`
- **Logical:** \`$and $or $not $nor\` (comma between fields = implicit AND)
- **Element:** \`$exists\`, \`$type\`
- **Arrays:** \`$all\`, \`$size\`, \`$elemMatch\`; positional \`$\`, \`$[]\`, \`$[id]\` with arrayFilters
- **Update operators:** \`$set $unset $inc $mul $rename $min $max $currentDate $setOnInsert\`, arrays: \`$push ($each, $slice, $sort) $addToSet $pull $pop\`
- **Embedded fields:** dot notation in quotes – \`{ 'marks.dbms': { $gt: 80 } }\`
- **Pagination:** \`skip((page - 1) * limit).limit(limit)\`; keyset: \`{ _id: { $gt: lastId } }\` for big data`,
    },
    {
      heading: 'Cheat sheet 2: aggregation pipeline',
      content: `A pipeline is an array of stages; documents flow through each stage in order (like a factory conveyor belt).

| SQL | Aggregation |
|---|---|
| WHERE | \`$match\` (put it first to use indexes) |
| GROUP BY + SUM/AVG/COUNT | \`$group\` with \`$sum $avg $min $max $first $last $push $addToSet\` |
| HAVING | \`$match\` **after** \`$group\` |
| SELECT columns / computed | \`$project\`, \`$addFields\` / \`$set\`, \`$unset\` |
| ORDER BY / LIMIT / OFFSET | \`$sort\`, \`$limit\`, \`$skip\` |
| JOIN | \`$lookup\` (+ \`$unwind\` to flatten) |
| COUNT(*) | \`$count\` |
| CASE WHEN | \`$cond\`, \`$switch\` |
| several reports in one query | \`$facet\` |
| ranges / histogram | \`$bucket\`, \`$bucketAuto\` |
| CREATE TABLE AS SELECT | \`$out\`, \`$merge\` |

Useful expression operators: \`$multiply\`, \`$round\`, \`$dateToString\`, \`$year\`, \`$month\`, \`$concat\`, \`$toUpper\`, \`$size\`, \`$first\`, \`$ifNull\`.

Performance rules: \`$match\` and \`$sort\` early (they can use indexes), \`$project\` away unneeded fields, each stage has a 100 MB memory limit (\`allowDiskUse\` is on by default since MongoDB 6.0).`,
    },
    {
      heading: 'Cheat sheet 3: indexes and performance',
      content: `- Default index: \`_id\` (unique). Types: **single-field, compound, multikey (arrays), text, geospatial (2dsphere), hashed, wildcard**; properties: **unique, partial, sparse, TTL**.
- **explain('executionStats')**: look at the winning plan stage (**COLLSCAN** = full scan, bad on big collections; **IXSCAN** = index used), \`totalKeysExamined\`, \`totalDocsExamined\` and \`nReturned\`. Ideal: docsExamined ≈ nReturned.
- **Covered query**: all filter and returned fields are in the index → no FETCH stage.
- **Compound index prefix rule**: index \`{ a: 1, b: 1, c: 1 }\` supports queries on \`a\`, \`a+b\`, \`a+b+c\` – not on \`b\` alone.
- **ESR rule** for compound index order: **E**quality fields first, then **S**ort fields, then **R**ange fields.
- Cost of indexes: extra storage/RAM and slower writes. Remove unused ones (\`$indexStats\`, Atlas Performance Advisor).
- Other tips: projection to reduce data, \`lean()\` in Mongoose for read-only lists, keyset pagination instead of huge skip, connection pooling (one client per app).`,
    },
    {
      heading: 'Cheat sheet 4: modeling, transactions, scaling, Mongoose',
      content: `- **Embed** when data is read together, belongs to one parent and is bounded (address in user, items in order). **Reference** when data is shared, large, unbounded or updated independently (users ↔ posts, students ↔ courses).
- Relationships: one-to-one (embed), one-to-few (embed array), one-to-many (array of ids or child stores parentId), one-to-squillions (child stores parentId), many-to-many (arrays of ids on one/both sides or a junction collection like \`enrollments\`).
- Patterns: **subset, extended reference, computed, bucket, outlier, polymorphic, schema versioning**. Anti-patterns: unbounded arrays, massive number of collections, bloated documents, unnecessary indexes, separating data that is always read together.
- **Atomicity**: a single-document write is always atomic. **Multi-document ACID transactions** (replica set / sharded cluster) with \`session.withTransaction()\`; keep them short (< 60 s default limit).
- **Write concern** \`w: 'majority'\` + journal; **read concern** \`local / majority / snapshot\`; **read preference** primary / secondary.
- **Replica set**: 1 primary + secondaries, automatic failover via election (high availability). **Sharding**: horizontal partitioning by a shard key through \`mongos\` routers (scalability).
- **Mongoose**: Schema → Model → Document; validation (built-in + custom), \`timestamps\`, \`ref\` + \`populate()\`, virtuals, pre/post middleware, instance/static methods, query helpers, \`lean()\`, discriminators.`,
    },
    {
      heading: 'Explaining your MERN project database (2-minute script)',
      content: `Almost every interview ends with "explain the database design of your project". Prepare this structure:

1. **Collections**: "My e-commerce app has users, products, orders and reviews collections."
2. **Embedding decisions**: "Order items are embedded in the order with a copy of the product name and price at purchase time (extended reference) because an order must not change when the product price changes."
3. **References**: "Reviews reference productId and userId because a product can have thousands of reviews (unbounded)."
4. **Indexes**: "Unique index on users.email, compound index { category: 1, price: 1 } for the shop filter page, and { userId: 1, createdAt: -1 } for 'my orders'."
5. **Validation & security**: "Mongoose schemas with validation, passwords hashed with bcrypt in a pre-save hook, password field select: false, input validated with zod to prevent NoSQL injection."
6. **Scaling story**: "Hosted on Atlas with a 3-node replica set; if traffic grows I would add read replicas for reports, cache hot data in Redis, and shard orders by userId."

Practise saying it aloud. Clear, structured answers beat long, unorganised ones.`,
      tip: 'Keep numbers realistic. Saying "my college project handles 10 million users" invites hard follow-up questions you cannot answer.',
    },
  ],
  examples: [
    {
      title: 'Q1. Find the product with the second highest price',
      scenario: 'Classic question (also asked in SQL rounds). Return the name and price of the second most expensive product. Then handle ties by working on distinct prices.',
      steps: [
        'Sort products by price descending',
        'Skip the first document and limit to 1',
        'For a tie-safe answer, group by price first so duplicate prices collapse into one',
        'Run both in the shop dataset and compare',
      ],
      code: `// simple answer
db.products.find({}, { name: 1, price: 1, _id: 0 }).sort({ price: -1 }).skip(1).limit(1)

// tie-safe: second highest DISTINCT price
db.products.aggregate([
  { $group: { _id: '$price' } },
  { $sort: { _id: -1 } },
  { $skip: 1 },
  { $limit: 1 }
])`,
      mongo: {
        dataset: 'shop',
        query: `// simple answer
db.products.find({}, { name: 1, price: 1, _id: 0 }).sort({ price: -1 }).skip(1).limit(1)

// tie-safe: second highest DISTINCT price
db.products.aggregate([
  { $group: { _id: '$price' } },
  { $sort: { _id: -1 } },
  { $skip: 1 },
  { $limit: 1 }
])`,
      },
      result: `{ name: 'iPhone 15', price: 79900 }
[ { _id: 79900 } ]`,
      explanation: '`sort({ price: -1 }).skip(1).limit(1)` is the direct answer. If two products shared the top price, it would return the second product with the SAME price, so the tie-safe version groups distinct prices first. Mention the index too: with `{ price: -1 }` indexed, the sort does not need an in-memory sort.',
    },
    {
      title: 'Q2. Total revenue, order count and average order value of delivered orders',
      scenario: 'The business wants one summary line for delivered orders only.',
      steps: [
        'Filter delivered orders with $match',
        'Group everything into one bucket with _id: null',
        'Use $sum for revenue and count, $avg for average',
        'Round the average with $round in $project',
      ],
      code: `db.orders.aggregate([
  { $match: { status: 'delivered' } },
  { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 }, avgOrderValue: { $avg: '$total' } } },
  { $project: { _id: 0, revenue: 1, orders: 1, avgOrderValue: { $round: ['$avgOrderValue', 0] } } }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.orders.aggregate([
  { $match: { status: 'delivered' } },
  { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 }, avgOrderValue: { $avg: '$total' } } },
  { $project: { _id: 0, revenue: 1, orders: 1, avgOrderValue: { $round: ['$avgOrderValue', 0] } } }
])`,
      },
      result: '[ { avgOrderValue: 52896, orders: 7, revenue: 370272 } ]',
      explanation: '`_id: null` means "put all documents in one group" – the equivalent of SQL aggregate functions without GROUP BY. `{ $sum: 1 }` counts documents. Always $match first so less data flows through the pipeline and an index on status can be used.',
    },
    {
      title: 'Q3. Top 3 customers by total spend (with their names)',
      scenario: 'Exclude cancelled orders, compute each customer\'s total spend and number of orders, return the top 3 with name and city from the customers collection.',
      steps: [
        'Filter out cancelled orders',
        'Group by customerId summing total and counting orders',
        'Sort by totalSpent descending and limit 3 BEFORE the join (cheaper)',
        '$lookup customers, $unwind the single match and $project the final shape',
      ],
      code: `db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: { _id: '$customerId', totalSpent: { $sum: '$total' }, orders: { $sum: 1 } } },
  { $sort: { totalSpent: -1 } },
  { $limit: 3 },
  { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
  { $unwind: '$customer' },
  { $project: { _id: 0, name: '$customer.name', city: '$customer.city', totalSpent: 1, orders: 1 } }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: { _id: '$customerId', totalSpent: { $sum: '$total' }, orders: { $sum: 1 } } },
  { $sort: { totalSpent: -1 } },
  { $limit: 3 },
  { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
  { $unwind: '$customer' },
  { $project: { _id: 0, name: '$customer.name', city: '$customer.city', totalSpent: 1, orders: 1 } }
])`,
      },
      result: `[
  { city: 'Mumbai', name: 'Ravi Kumar', orders: 2, totalSpent: 150898 },
  { city: 'Bengaluru', name: 'Priya Desai', orders: 2, totalSpent: 117798 },
  { city: 'Delhi', name: 'Karan Mehta', orders: 1, totalSpent: 104989 }
]`,
      explanation: 'The interview point: do `$limit` before `$lookup` so the join runs for 3 documents instead of all customers. `$lookup` always returns an array, so `$unwind` turns the one-element array into an object. (Field order in the Lab output may differ from real mongosh, the values are the same.)',
    },
    {
      title: 'Q4. Monthly revenue report',
      scenario: 'Show revenue and number of orders per month (YYYY-MM) for all non-cancelled orders, oldest month first.',
      steps: [
        'Filter non-cancelled orders',
        'Group by $dateToString with format "%Y-%m" on orderDate',
        'Sum total and count orders',
        'Sort by _id ascending',
      ],
      code: `db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$orderDate' } },
      revenue: { $sum: '$total' },
      orders: { $sum: 1 }
  } },
  { $sort: { _id: 1 } }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$orderDate' } },
      revenue: { $sum: '$total' },
      orders: { $sum: 1 }
  } },
  { $sort: { _id: 1 } }
])`,
      },
      result: `[
  { _id: '2025-01', revenue: 135497, orders: 2 },
  { _id: '2025-02', revenue: 43484, orders: 2 },
  { _id: '2025-03', revenue: 169182, orders: 3 },
  { _id: '2025-04', revenue: 160985, orders: 3 },
  { _id: '2025-05', revenue: 7998, orders: 1 }
]`,
      explanation: '`$dateToString` turns the date into a "2025-01" string that sorts correctly. An alternative is `_id: { year: { $year: "$orderDate" }, month: { $month: "$orderDate" } }`. Dates are stored in UTC – in real Indian reports add `timezone: "Asia/Kolkata"` so an order at 11:30 PM IST is not counted in the wrong day/month.',
    },
    {
      title: 'Q5. Best-selling products by units sold',
      scenario: 'Each order has an items array. Find the top 3 products by units sold (ignoring cancelled orders) with product name and revenue.',
      steps: [
        'Filter out cancelled orders',
        '$unwind the items array so each item becomes its own document',
        'Group by items.productId, summing qty and qty × price',
        'Sort, limit 3, then $lookup products to get the name',
      ],
      code: `db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $unwind: '$items' },
  { $group: {
      _id: '$items.productId',
      unitsSold: { $sum: '$items.qty' },
      revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } }
  } },
  { $sort: { unitsSold: -1, revenue: -1 } },
  { $limit: 3 },
  { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'p' } },
  { $project: { _id: 0, product: { $first: '$p.name' }, unitsSold: 1, revenue: 1 } }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $unwind: '$items' },
  { $group: {
      _id: '$items.productId',
      unitsSold: { $sum: '$items.qty' },
      revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } }
  } },
  { $sort: { unitsSold: -1, revenue: -1 } },
  { $limit: 3 },
  { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'p' } },
  { $project: { _id: 0, product: { $first: '$p.name' }, unitsSold: 1, revenue: 1 } }
])`,
      },
      result: `[
  { product: 'boAt Airdopes 141', revenue: 6495, unitsSold: 5 },
  { product: 'Redmi Note 13', revenue: 53997, unitsSold: 3 },
  { product: 'Noise ColorFit Pro 5', revenue: 11997, unitsSold: 3 }
]`,
      explanation: '`$unwind` is the key step for any "per item" question on embedded arrays. The second sort key (revenue) breaks ties deterministically. `$first: "$p.name"` takes the name from the joined array without a separate `$unwind`.',
    },
    {
      title: 'Q6. Products that were never ordered',
      scenario: 'The inventory team wants products that appear in no order at all (dead stock).',
      steps: [
        'Start from products',
        '$lookup orders where orders.items.productId equals the product _id',
        'Keep products whose joined array is empty with { $size: 0 }',
        'Project name and stock',
      ],
      code: `db.products.aggregate([
  { $lookup: { from: 'orders', localField: '_id', foreignField: 'items.productId', as: 'orders' } },
  { $match: { orders: { $size: 0 } } },
  { $project: { _id: 0, name: 1, stock: 1 } }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.products.aggregate([
  { $lookup: { from: 'orders', localField: '_id', foreignField: 'items.productId', as: 'orders' } },
  { $match: { orders: { $size: 0 } } },
  { $project: { _id: 0, name: 1, stock: 1 } }
])`,
      },
      result: '[ { name: \'Inspiron 15\', stock: 0 } ]',
      explanation: 'This is the MongoDB version of a SQL LEFT JOIN ... WHERE right.id IS NULL (anti-join). `foreignField` can point into an array of embedded documents (`items.productId`) – $lookup matches if any element equals the local value. On a big collection, index `orders.items.productId`.',
    },
    {
      title: 'Q7. Find duplicate values (cities with more than one customer)',
      scenario: 'A common data-cleaning question: find values that occur more than once. Here: cities that have more than one customer, with the customer names.',
      steps: [
        'Group customers by city',
        'Count with $sum: 1 and collect names with $push',
        'Filter groups with count > 1 using $match AFTER $group (HAVING)',
        'Sort by city',
      ],
      code: `db.customers.aggregate([
  { $group: { _id: '$city', count: { $sum: 1 }, names: { $push: '$name' } } },
  { $match: { count: { $gt: 1 } } },
  { $sort: { _id: 1 } }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.customers.aggregate([
  { $group: { _id: '$city', count: { $sum: 1 }, names: { $push: '$name' } } },
  { $match: { count: { $gt: 1 } } },
  { $sort: { _id: 1 } }
])`,
      },
      result: `[
  { _id: 'Mumbai', count: 2, names: [ 'Ravi Kumar', 'Sneha More' ] },
  { _id: 'Pune', count: 2, names: [ 'Asha Patil', 'Imran Khan' ] }
]`,
      explanation: 'The same pattern finds duplicate emails before creating a unique index (the index creation fails with E11000 if duplicates exist). `$match` after `$group` is the equivalent of SQL HAVING.',
    },
    {
      title: 'Q8. Students with BOTH React and Node.js, and branches with average CGPA above 7.5',
      scenario: 'Two short college questions often asked together: an array query and a GROUP BY + HAVING query.',
      steps: [
        'Use $all to match students whose skills array contains both values (any order)',
        'Group students by branch with $avg on cgpa and a count',
        'Keep only branches with avgCgpa > 7.5',
        'Round to 2 decimals and sort descending',
      ],
      code: `db.students.find({ skills: { $all: ['React', 'Node.js'] } }, { name: 1, skills: 1 })

db.students.aggregate([
  { $group: { _id: '$branch', avgCgpa: { $avg: '$cgpa' }, students: { $sum: 1 } } },
  { $match: { avgCgpa: { $gt: 7.5 } } },
  { $project: { avgCgpa: { $round: ['$avgCgpa', 2] }, students: 1 } },
  { $sort: { avgCgpa: -1 } }
])`,
      mongo: {
        dataset: 'college',
        query: `db.students.find({ skills: { $all: ['React', 'Node.js'] } }, { name: 1, skills: 1 })

db.students.aggregate([
  { $group: { _id: '$branch', avgCgpa: { $avg: '$cgpa' }, students: { $sum: 1 } } },
  { $match: { avgCgpa: { $gt: 7.5 } } },
  { $project: { avgCgpa: { $round: ['$avgCgpa', 2] }, students: 1 } },
  { $sort: { avgCgpa: -1 } }
])`,
      },
      result: `{ _id: 3, name: 'Neha Shah', skills: [ 'Node.js', 'MongoDB', 'React' ] }
{
  _id: 8,
  name: 'Karan Mehta',
  skills: [ 'Node.js', 'Express', 'MongoDB', 'React' ]
}
[
  { _id: 'CSE', avgCgpa: 8.67, students: 4 },
  { _id: 'IT', avgCgpa: 8.13, students: 3 }
]`,
      explanation: '`{ skills: ["React", "Node.js"] }` would require the EXACT array in that order – a classic trap. `$all` checks that both values are present. In the second query, the HAVING filter is a $match on the computed field after $group.',
    },
    {
      title: 'Q9. Course enrollment report (many-to-many join)',
      scenario: 'Students and courses are linked through the enrollments collection. For each course, show the number of enrolled students and their names, most popular first.',
      steps: [
        'Start from courses',
        '$lookup enrollments by courseId',
        'Second $lookup into students using the array of studentIds from the first join',
        'Project title, the count with $size and the names, then sort',
      ],
      code: `db.courses.aggregate([
  { $lookup: { from: 'enrollments', localField: '_id', foreignField: 'courseId', as: 'enr' } },
  { $lookup: { from: 'students', localField: 'enr.studentId', foreignField: '_id', as: 'studs' } },
  { $project: { _id: 0, title: 1, enrolled: { $size: '$enr' }, students: '$studs.name' } },
  { $sort: { enrolled: -1 } }
])`,
      mongo: {
        dataset: 'college',
        query: `db.courses.aggregate([
  { $lookup: { from: 'enrollments', localField: '_id', foreignField: 'courseId', as: 'enr' } },
  { $lookup: { from: 'students', localField: 'enr.studentId', foreignField: '_id', as: 'studs' } },
  { $project: { _id: 0, title: 1, enrolled: { $size: '$enr' }, students: '$studs.name' } },
  { $sort: { enrolled: -1 } }
])`,
      },
      result: `[
  {
    enrolled: 4,
    students: [ 'Asha Patil', 'Ravi Kumar', 'Karan Mehta', 'Pooja Nair' ],
    title: 'Web Development (MERN)'
  },
  {
    enrolled: 3,
    students: [ 'Asha Patil', 'Karan Mehta', 'Sneha More' ],
    title: 'Data Structures'
  },
  {
    enrolled: 2,
    students: [ 'Neha Shah', 'Priya Desai' ],
    title: 'Database Systems'
  },
  {
    enrolled: 2,
    students: [ 'Neha Shah', 'Pooja Nair' ],
    title: 'Machine Learning'
  },
  { enrolled: 1, students: [ 'Imran Khan' ], title: 'Embedded Systems' }
]`,
      explanation: 'When `localField` is an array (`enr.studentId`), $lookup matches every element – a neat way to do a two-hop join without `$unwind`. `"$studs.name"` maps an array of documents to an array of names. This junction-collection design is the standard many-to-many model when the relationship has its own data (grade, semester).',
    },
    {
      title: 'Q10. Author leaderboard for the blog',
      scenario: 'For published posts only, show each author\'s username, number of posts and total likes, highest likes first.',
      steps: [
        'Filter published posts',
        'Group by authorId with post count and total likes',
        '$lookup users to get the username',
        'Project the final fields and sort by totalLikes descending',
      ],
      code: `db.posts.aggregate([
  { $match: { published: true } },
  { $group: { _id: '$authorId', posts: { $sum: 1 }, totalLikes: { $sum: '$likes' } } },
  { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'author' } },
  { $project: { _id: 0, username: { $first: '$author.username' }, posts: 1, totalLikes: 1 } },
  { $sort: { totalLikes: -1 } }
])`,
      mongo: {
        dataset: 'blog',
        query: `db.posts.aggregate([
  { $match: { published: true } },
  { $group: { _id: '$authorId', posts: { $sum: 1 }, totalLikes: { $sum: '$likes' } } },
  { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'author' } },
  { $project: { _id: 0, username: { $first: '$author.username' }, posts: 1, totalLikes: 1 } },
  { $sort: { totalLikes: -1 } }
])`,
      },
      result: `[
  { posts: 2, totalLikes: 415, username: 'neha_js' },
  { posts: 1, totalLikes: 410, username: 'pooja_ui' },
  { posts: 1, totalLikes: 320, username: 'asha_dev' },
  { posts: 2, totalLikes: 270, username: 'ravi_codes' }
]`,
      explanation: 'Group first, join later: grouping reduces 6 posts to 4 authors, so $lookup runs only 4 times. In Mongoose you could instead `populate("authorId")` on posts, but for reports an aggregation is far more efficient because grouping happens inside the database.',
    },
  ],
  interview: [
    {
      q: 'What is MongoDB and why is it used in the MERN stack?',
      a: 'A document-oriented NoSQL database that stores BSON documents in collections with a flexible schema. In MERN it fits naturally because data stays JSON-shaped from MongoDB through Express/Node to React, Mongoose provides schemas/validation, and Atlas gives easy cloud hosting, replication and scaling.',
      level: 'Easy',
    },
    {
      q: 'What is the _id field and what does an ObjectId contain?',
      a: '_id is the mandatory primary key of every document, unique within the collection and automatically indexed. If not provided, the driver generates a 12-byte ObjectId: a 4-byte timestamp (seconds since epoch), a 5-byte random value unique to the machine/process and a 3-byte incrementing counter. So ObjectIds are roughly sortable by creation time and getTimestamp() returns the creation date.',
      level: 'Easy',
    },
    {
      q: 'Difference between find() and findOne()?',
      a: 'find() returns a cursor over all matching documents (iterated in batches; mongosh shows 20 at a time). findOne() returns the first matching document itself or null. In Mongoose, find() resolves to an array and findOne() to a document or null.',
      level: 'Easy',
    },
    {
      q: 'What is projection?',
      a: 'The second argument of find() that chooses which fields to return: { name: 1, price: 1 } (inclusion) or { password: 0 } (exclusion). You cannot mix inclusion and exclusion except for _id, which is included by default and can be removed with _id: 0. It reduces network traffic and avoids leaking sensitive fields.',
      level: 'Easy',
    },
    {
      q: 'Difference between updateOne() with $set and replaceOne()?',
      a: 'updateOne with $set changes only the listed fields and keeps the rest. replaceOne replaces the entire document (except _id) with the new one – fields not in the replacement are removed. Passing a plain object without operators to updateOne throws an error in modern drivers, which protects you from accidental replacement.',
      level: 'Easy',
    },
    {
      q: 'What is an upsert?',
      a: 'An update with { upsert: true }: if a document matches it is updated, otherwise a new document is inserted, built from the equality fields of the filter plus the update operators. $setOnInsert sets fields only when inserting. Used for "create or update" logic like counters, carts and daily stats.',
      level: 'Medium',
    },
    {
      q: 'Difference between $push and $addToSet?',
      a: '$push always appends the value (duplicates allowed) and supports modifiers $each, $slice, $sort, $position. $addToSet appends only if the value is not already in the array (set semantics), and supports $each. Use $addToSet for tags, likes by userId, followers.',
      level: 'Easy',
    },
    {
      q: 'How do you query embedded documents and arrays of embedded documents?',
      a: 'Use dot notation in quotes: { "address.city": "Pune" } or { "items.productId": 3 }. To make several conditions apply to the SAME array element use $elemMatch: { items: { $elemMatch: { productId: 3, qty: { $gte: 2 } } } }. Without $elemMatch, each condition can be satisfied by different elements.',
      level: 'Medium',
    },
    {
      q: 'What is the aggregation pipeline?',
      a: 'A framework for data processing where documents pass through an ordered array of stages ($match, $group, $project, $sort, $lookup, $unwind, $facet...), each transforming the stream. It replaces most SQL GROUP BY/JOIN/HAVING reporting and runs inside the database, which is much faster than processing in Node.',
      level: 'Easy',
    },
    {
      q: 'Difference between $project and $addFields (or $set)?',
      a: '$project reshapes the document – only the listed fields (plus _id) are kept unless you use exclusion mode. $addFields/$set keeps all existing fields and adds or overwrites the given ones. Use $addFields when you just need one computed field.',
      level: 'Medium',
    },
    {
      q: 'How does $lookup work and what are its limitations?',
      a: '$lookup performs a left outer join with another collection in the same database: { from, localField, foreignField, as } returns matching documents as an array. The pipeline form ({ from, let, pipeline, as }) allows conditions and projections inside the join. Limitations: it can be slow without an index on foreignField, results count toward the 16 MB document limit (use $unwind right after or project only needed fields), and frequent heavy joins suggest you should embed or denormalize instead.',
      level: 'Medium',
    },
    {
      q: 'What does $unwind do?',
      a: 'It deconstructs an array field, outputting one document per element (the other fields are copied). It is needed to group or sort by array elements (e.g. units sold per product from order items). Options: preserveNullAndEmptyArrays: true keeps documents with empty/missing arrays, includeArrayIndex adds the index.',
      level: 'Easy',
    },
    {
      q: 'What is $facet used for?',
      a: '$facet runs several sub-pipelines on the same input documents in a single stage and returns one document with an array per facet. Typical use: an e-commerce search page that needs the paginated results, the total count, category counts and price ranges in one query.',
      level: 'Medium',
    },
    {
      q: 'What is an index and what are its trade-offs?',
      a: 'An index is an ordered B-tree structure on one or more fields that lets queries find documents without scanning the whole collection (IXSCAN instead of COLLSCAN) and can return sorted results without an in-memory sort. Trade-offs: extra disk and RAM, and every insert/update/delete must also update the indexes, so too many indexes slow down writes.',
      level: 'Easy',
    },
    {
      q: 'Explain the ESR rule.',
      a: 'For compound indexes, order the fields Equality first, then Sort, then Range. Example: query { category: "Mobiles", price: { $lt: 50000 } } sorted by rating → index { category: 1, rating: -1, price: 1 }. Equality narrows to a contiguous range, the sort field then gives ordered results without a blocking sort, and the range filter is applied last.',
      level: 'Hard',
    },
    {
      q: 'What is a covered query?',
      a: 'A query where all fields in the filter and the projection are part of one index (and _id is excluded or in the index), so MongoDB answers it from the index alone without reading documents. explain() shows no FETCH stage and totalDocsExamined: 0.',
      level: 'Hard',
    },
    {
      q: 'How do you find a slow query and fix it?',
      a: 'Enable the profiler (db.setProfilingLevel(1, { slowms: 100 })) or check Atlas Query Profiler / Performance Advisor; run explain("executionStats") and look for COLLSCAN, large totalDocsExamined vs nReturned, or SORT stages. Fix with a suitable (ESR) compound index, projection, $match earlier in pipelines, keyset pagination, lean() in Mongoose, or schema changes (computed/subset patterns).',
      level: 'Medium',
    },
    {
      q: 'Embedding vs referencing – how do you decide?',
      a: 'Embed when the data is accessed together, belongs to one parent, is bounded in size and does not need to be queried on its own (address in user, items in order). Reference when the data is shared by many parents, large or unbounded, changes independently or is queried alone (author in posts, products in orders by id). Rule: "data that is accessed together should be stored together", while respecting the 16 MB limit.',
      level: 'Medium',
    },
    {
      q: 'How do you model a many-to-many relationship in MongoDB?',
      a: 'Options: (1) arrays of references on one or both sides (student.courseIds, course.studentIds) – fine when the lists are bounded; (2) a junction collection like enrollments { studentId, courseId, grade, semester } when the relationship has its own data or can grow large. Index the reference fields and use $lookup or populate to join.',
      level: 'Medium',
    },
    {
      q: 'Name some schema design patterns and anti-patterns.',
      a: 'Patterns: subset (keep only recent items embedded), extended reference (copy frequently-read fields like customer name into orders), computed (store pre-calculated totals/counts), bucket (group time-series into one doc per hour), outlier (handle rare huge cases separately), polymorphic, schema versioning, attribute. Anti-patterns: unbounded arrays, bloated documents, massive number of collections, unnecessary indexes, case-insensitive queries without a collation index, separating data that is always read together.',
      level: 'Hard',
    },
    {
      q: 'Does MongoDB support transactions? When should you use them?',
      a: 'Yes – single-document operations are always atomic, and multi-document ACID transactions are supported on replica sets (4.0+) and sharded clusters (4.2+), using sessions (session.withTransaction). Use them when several documents must change together, e.g. debit one wallet and credit another, or create an order and decrement stock. Keep them short; prefer schema designs where one document holds the data that changes together.',
      level: 'Medium',
    },
    {
      q: 'What are write concern and read concern?',
      a: 'Write concern defines how many replica set members must acknowledge a write before it is considered successful: w: 1 (primary only), w: "majority" (default in modern versions; survives failover), plus j: true for journaling. Read concern defines the consistency of data read: "local" (default, may be rolled back), "majority" (only majority-committed data), "snapshot" (in transactions), "linearizable".',
      level: 'Hard',
    },
    {
      q: 'What is a replica set and how does failover work?',
      a: 'A group of mongod processes holding the same data: one primary that accepts writes and secondaries that replicate the primary\'s oplog. If the primary becomes unreachable, the remaining members hold an election (usually within ~10-12 seconds) and a secondary becomes the new primary; drivers with retryable writes reconnect automatically. It provides high availability and data redundancy; use an odd number of voting members (typically 3).',
      level: 'Medium',
    },
    {
      q: 'What is sharding and how do you choose a shard key?',
      a: 'Sharding splits a collection across multiple shards (each a replica set) for horizontal scaling; mongos routers send queries to the right shards using the shard key, and config servers store metadata. A good shard key has high cardinality, low frequency (no hot values) and is not monotonically increasing (or is hashed), and is used in most queries so they target one shard. Example: hashed userId for orders.',
      level: 'Hard',
    },
    {
      q: 'What is populate() in Mongoose and how is it different from $lookup?',
      a: 'populate() replaces ObjectId references (ref fields) with the referenced documents. It runs as separate queries from Node (one extra query per populated path, using $in), not a server-side join. $lookup is a server-side join inside an aggregation pipeline. populate is convenient for CRUD APIs; $lookup is better for reports and complex filters on joined data.',
      level: 'Medium',
    },
    {
      q: 'What is lean() in Mongoose and when should you use it?',
      a: 'lean() makes a query return plain JavaScript objects instead of full Mongoose documents – no getters/setters, virtuals (unless a plugin is used), save() or change tracking. It is much faster and uses less memory, so use it for read-only API responses (lists, reports). Do not use it when you need to modify and save the document or rely on document methods.',
      level: 'Medium',
    },
    {
      q: 'How do you hash passwords using Mongoose middleware?',
      a: 'Add a pre("save") hook: if (!this.isModified("password")) return; this.password = await bcrypt.hash(this.password, 12). In Mongoose 8 async hooks need no next(). Mark the field select: false, and add an instance method comparePassword(candidate) that calls bcrypt.compare. Note that findOneAndUpdate does not trigger save hooks, so password changes should go through save().',
      level: 'Medium',
    },
    {
      q: 'How do you prevent NoSQL injection?',
      a: 'Never pass req.body/req.query straight into filters or updates; validate types and shapes (zod/joi/express-validator); whitelist fields; strip keys starting with $ or containing dots; enable Mongoose sanitizeFilter and strictQuery; avoid $where and server-side JS; escape user input used in $regex; use least-privilege database users.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Blog dataset: find the titles of all posts that have at least one comment written by user 4, and separately list posts that have no comments at all with their published status.',
      hint: '$elemMatch (or dot notation "comments.userId") and $size: 0.',
      solution: `db.posts.find({ comments: { $elemMatch: { userId: 4 } } }, { title: 1, _id: 0 })
// or: db.posts.find({ 'comments.userId': 4 }, { title: 1, _id: 0 })
// → Understanding the Node.js Event Loop, MongoDB Aggregation for Beginners, Deploying MERN on Render and Vercel

db.posts.find({ comments: { $size: 0 } }, { title: 1, published: 1, _id: 0 })
// → React Hooks Cheat Sheet (true), Tailwind vs CSS Modules (false), Mongoose Middleware Explained (false)`,
    },
    {
      task: 'Shop dataset: apply a 10% discount to every Audio product with one update query, then show the new prices.',
      hint: '$mul with 0.9 in updateMany. Mention how you would round the result.',
      solution: `db.products.updateMany({ category: 'Audio' }, { $mul: { price: 0.9 } })
db.products.find({ category: 'Audio' }, { name: 1, price: 1, _id: 0 })
// boAt Airdopes 141 → 1169.1, Sony WH-1000XM5 → 26991, JBL Flip 6 → 8999.1

// rounding with a pipeline update (MongoDB 4.2+)
db.products.updateMany({ category: 'Audio' }, [
  { $set: { price: { $round: [{ $multiply: ['$price', 0.9] }, 0] } } }
])`,
    },
    {
      task: 'Shop dataset: for each payment method (UPI, Card, COD) show the number of orders, the revenue and the percentage of all orders, sorted by revenue. Ignore cancelled orders.',
      hint: 'Use $facet or two steps: first count all non-cancelled orders, then group by payment. A simpler way: $group by payment, then $group again with _id: null pushing the rows and summing counts, then $unwind and compute the percentage.',
      solution: `db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: { _id: '$payment', orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
  { $group: { _id: null, all: { $sum: '$orders' }, rows: { $push: '$$ROOT' } } },
  { $unwind: '$rows' },
  { $project: {
      _id: 0,
      payment: '$rows._id',
      orders: '$rows.orders',
      revenue: '$rows.revenue',
      percent: { $round: [{ $multiply: [{ $divide: ['$rows.orders', '$all'] }, 100] }, 1] }
  } },
  { $sort: { revenue: -1 } }
])
// UPI: 6 orders, Card: 3 orders, COD: 2 orders (11 non-cancelled orders)`,
    },
    {
      task: 'Write a Mongoose aggregation endpoint GET /api/reports/top-customers?limit=3 that returns the top customers by spend (excluding cancelled orders) with name and city. Cap limit at 10.',
      hint: 'Order.aggregate([...]) with the same stages as Q3. Mongoose does not cast aggregation pipelines, so convert values yourself.',
      solution: `// controllers/report.controller.js
const Order = require('../models/order.model');

exports.topCustomers = async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 3, 1), 10);
  const rows = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: '$customer', totalSpent: { $sum: '$total' }, orders: { $sum: 1 } } },
    { $sort: { totalSpent: -1 } },
    { $limit: limit },
    { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
    { $unwind: '$customer' },
    { $project: { _id: 0, customerId: '$_id', name: '$customer.name', city: '$customer.city', totalSpent: 1, orders: 1 } },
  ]);
  res.json(rows);
};

// routes/report.routes.js
// router.get('/top-customers', reportController.topCustomers);
// Note: 'from' must be the real collection name (Mongoose pluralises Customer → customers).`,
    },
    {
      task: 'Mock interview: answer these in 2-3 sentences each, out loud, then compare with the interview section: (1) Why is skip() slow for page 10,000? (2) Your orders collection has 50 million documents and the "my orders" page is slow – what do you check? (3) Why would you copy the product name into each order item?',
      hint: 'Think of: keyset pagination, explain(), compound index { userId: 1, createdAt: -1 }, extended reference pattern.',
      solution: `(1) skip(n) still walks and discards n index entries/documents, so cost grows with the page number. Use keyset (range) pagination: find({ userId, createdAt: { $lt: lastSeenCreatedAt } }).sort({ createdAt: -1 }).limit(20) on an index, or limit how deep users can paginate.

(2) Run explain('executionStats') on the exact query. If it is COLLSCAN or examines far more documents than it returns, create a compound index following ESR, e.g. db.orders.createIndex({ userId: 1, createdAt: -1 }). Also return only needed fields (projection), use lean() in Mongoose, paginate, and check Atlas Performance Advisor and the Query Profiler.

(3) Extended reference pattern: the order page can show item names without a $lookup/populate, and the order keeps the name and price at the time of purchase – an invoice must not change if the product is renamed or repriced later. The trade-off is duplicated data, which is acceptable because it rarely changes and is historical by nature.`,
    },
  ],
  quiz: [
    {
      question: 'Which query returns the product with the second highest price (assuming no ties)?',
      options: [
        'db.products.find().sort({ price: 1 }).limit(2)',
        'db.products.find().sort({ price: -1 }).skip(1).limit(1)',
        'db.products.find({ price: { $max: 2 } })',
        'db.products.findOne().sort({ price: -1 }).skip(1)',
      ],
      answer: 1,
      explanation: 'Sort descending, skip the highest, take one. findOne() returns a document, not a cursor, so you cannot chain sort/skip on it.',
    },
    {
      question: 'In an aggregation pipeline, what is the equivalent of SQL HAVING?',
      options: ['$project before $group', '$having', '$filter', '$match after $group'],
      answer: 3,
      explanation: 'A $match placed after $group filters on the grouped/computed fields, just like HAVING filters after GROUP BY.',
    },
    {
      question: 'Which filter matches students whose skills array contains both "React" and "Node.js" in any order?',
      options: [
        '{ skills: { $all: [\'React\', \'Node.js\'] } }',
        '{ skills: [\'React\', \'Node.js\'] }',
        '{ skills: { $in: [\'React\', \'Node.js\'] } }',
        '{ skills: { $size: 2 } }',
      ],
      answer: 0,
      explanation: '$all requires every listed value. An array literal requires an exact match (same elements, same order), and $in matches if ANY value is present.',
    },
    {
      question: 'For the query { category: "Mobiles", price: { $lt: 50000 } } sorted by { rating: -1 }, which index follows the ESR rule?',
      options: [
        '{ price: 1, rating: -1, category: 1 }',
        '{ rating: -1, price: 1, category: 1 }',
        '{ category: 1, rating: -1, price: 1 }',
        '{ category: 1, price: 1, rating: -1 }',
      ],
      answer: 2,
      explanation: 'Equality (category) first, then Sort (rating), then Range (price).',
    },
    {
      question: 'Why do we usually put $limit BEFORE $lookup in a "top 3 customers" pipeline?',
      options: [
        '$lookup cannot run after $sort',
        '$limit after $lookup is a syntax error',
        'It changes which customers are in the top 3',
        'So the join runs only for 3 documents instead of every group, which is much faster',
      ],
      answer: 3,
      explanation: 'Reducing documents before an expensive stage like $lookup is a core aggregation optimisation; the result is the same because the join does not affect the ranking.',
    },
  ],
};
