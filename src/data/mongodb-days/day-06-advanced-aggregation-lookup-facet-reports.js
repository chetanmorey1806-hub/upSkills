export default {
  id: 'day-06-advanced-aggregation-lookup-facet-reports',
  title: 'Advanced Aggregation: $unwind, $lookup Joins, $facet, $bucket, Date & String Operators, $cond/$switch, $out',
  module: 'Module 2: Aggregation & Performance',
  day: 6,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Real dashboards need joins, array flattening, date grouping and multi-part summaries. Today you build production-style reports – sales by month, top customers, best-selling products, price bands and a one-call dashboard – with $unwind, $lookup, $facet, $bucket, date/string operators, $cond/$switch and $out.',
  objectives: [
    'Flatten arrays with $unwind and aggregate data inside arrays such as order items',
    'Join collections with $lookup (simple localField/foreignField and the pipeline form)',
    'Group by month/year using date operators and format text with string operators',
    'Use $cond and $switch for if/else logic inside pipelines',
    'Build multi-report dashboards with $facet and $bucket, and save results with $out / $merge',
  ],
  theory: [
    {
      heading: '$unwind – one document per array element',
      content: `\`$unwind\` takes a document with an array and outputs **one copy of the document for each element**, with the array field replaced by that single element.

**Analogy:** an order slip with 3 items is photocopied 3 times, and on each copy only one item is highlighted. Now you can group by item.

Order 1001 has \`items: [A, B]\` → after \`{ $unwind: '$items' }\` you get two documents: one with \`items: A\`, one with \`items: B\`.

Options:
- \`{ $unwind: { path: '$items', preserveNullAndEmptyArrays: true } }\` – keep documents whose array is empty or missing (otherwise they disappear!)
- \`includeArrayIndex: 'position'\` – store the element's index`,
      syntax: `db.orders.aggregate([
  { $unwind: '$items' },
  { $group: { _id: '$items.productId', unitsSold: { $sum: '$items.qty' } } }
])`,
      tip: 'Posts with comments: [] vanish after a plain $unwind: "$comments". If you still want them in the report, use preserveNullAndEmptyArrays: true.',
    },
    {
      heading: '$lookup – joining collections',
      content: `\`$lookup\` performs a **left outer join**: for every input document it finds matching documents in another collection (in the same database) and stores them in a **new array field**.

**Simple form (equality join):**
\`{ $lookup: { from: 'customers', localField: 'customerId', foreignField: '_id', as: 'customer' } }\`

The result \`customer\` is always an **array** (possibly empty). For a one-to-one relationship add \`{ $unwind: '$customer' }\` to turn it into an object.

**Pipeline form (MongoDB 3.6+, with \`let\`):** run a whole sub-pipeline on the joined collection – filter, project, sort inside the join:
\`\`\`
{ $lookup: {
    from: 'enrollments',
    let: { sid: '$_id' },
    pipeline: [
      { $match: { $expr: { $eq: ['$studentId', '$$sid'] } } },
      { $project: { _id: 0, courseId: 1, grade: 1 } }
    ],
    as: 'enrolled'
} }
\`\`\`
\`$$sid\` (double dollar) refers to a variable defined in \`let\`. Since MongoDB 5.0 you can combine \`localField/foreignField\` **and** \`pipeline\` in one \`$lookup\`.

**Performance:** make sure the \`foreignField\` is indexed (\`_id\` always is). A \`$lookup\` on an unindexed field scans the whole foreign collection for every input document.`,
      tip: 'Mongoose populate() is NOT a $lookup – it runs a second query from Node.js. Inside aggregation pipelines you must use $lookup.',
    },
    {
      heading: 'Date and string operators',
      content: `**Date operators** (dates are stored in UTC):
- \`$year\`, \`$month\`, \`$dayOfMonth\`, \`$dayOfWeek\` (1 = Sunday), \`$hour\`
- \`$dateToString: { format: '%Y-%m', date: '$orderDate' }\` – format a date as text (\`%Y\` year, \`%m\` month, \`%d\` day, \`%H\` hour)
- \`$dateDiff: { startDate, endDate, unit: 'day' }\` (MongoDB 5+) – difference between two dates
- \`$dateTrunc\` (MongoDB 5+) – round a date down to a unit (week, month)
- Add \`timezone: 'Asia/Kolkata'\` to date operators to group by Indian time instead of UTC.

**String operators:**
- \`$concat\`, \`$toUpper\`, \`$toLower\`, \`$trim\`
- \`$substrCP: [str, start, length]\` – substring
- \`$split: [str, ' ']\` – string → array, \`$strLenCP\` – length
- \`$replaceAll: { input, find, replacement }\` – replace text (useful for slugs)
- \`$regexMatch\` – test a regex inside an expression`,
      syntax: `{ $group: {
    _id: { $dateToString: { format: '%Y-%m', date: '$orderDate', timezone: 'Asia/Kolkata' } },
    revenue: { $sum: '$total' }
} }`,
      tip: 'An order at 2025-01-31T20:00Z is 1 Feb 01:30 in India. Without timezone it is counted in January. For Indian business reports always pass timezone: "Asia/Kolkata".',
    },
    {
      heading: 'Conditional logic: $cond, $switch, $ifNull',
      content: `- \`$cond\` – if/else: \`{ $cond: { if: <condition>, then: <value>, else: <value> } }\` or the short array form \`{ $cond: [<condition>, <then>, <else>] }\`
- \`$switch\` – many branches, like \`switch/case\`: \`{ $switch: { branches: [ { case: ..., then: ... } ], default: ... } }\`
- \`$ifNull: ['$discount', 0]\` – use a fallback when a field is null or missing

Conditions use **expression** comparison operators with arrays: \`{ $gte: ['$price', 70000] }\` (not the query form \`{ price: { $gte: 70000 } }\`).

A powerful trick is **conditional counting**: \`{ $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } }\` counts delivered orders inside a \`$group\` – like SQL's \`SUM(CASE WHEN ... THEN 1 ELSE 0 END)\`.`,
    },
    {
      heading: '$facet and $bucket – dashboards in one query',
      content: `**$facet** runs **several sub-pipelines on the same input** and returns one document with one array per sub-pipeline. Perfect for e-commerce search pages ("results + category counts + price ranges") and admin dashboards.

\`\`\`
{ $facet: {
    byCategory: [ { $sortByCount: '$category' } ],
    priceStats: [ { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } } ],
    page1:      [ { $sort: { price: 1 } }, { $limit: 5 } ]
} }
\`\`\`

**$bucket** groups documents into ranges you define (\`boundaries\`, lower bound inclusive, upper bound exclusive). Values outside all ranges go to the \`default\` bucket (if you omit \`default\` and a value is out of range, the query errors).

**$bucketAuto** lets MongoDB choose the boundaries for a given number of buckets.

**$sortByCount: '$field'** is a shortcut for \`$group\` + count + \`$sort\` descending.`,
    },
    {
      heading: 'Saving results: $out and $merge',
      content: `- \`{ $out: 'reportCollection' }\` – must be the **last stage**; **replaces** the whole target collection with the pipeline result.
- \`{ $merge: { into: 'monthlySales', on: '_id', whenMatched: 'replace', whenNotMatched: 'insert' } }\` – also last stage, but **upserts** into an existing collection instead of replacing it. Ideal for incremental reports (e.g. recompute only this month every night).

Use these for **materialized views**: heavy reports computed by a scheduled job (cron) and read instantly by the dashboard API. This is the **computed pattern** you will meet again on Day 8.`,
      syntax: `// nightly job (node-cron): refresh monthly sales
db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$orderDate' } }, revenue: { $sum: '$total' } } },
  { $merge: { into: 'monthlySales', on: '_id', whenMatched: 'replace', whenNotMatched: 'insert' } }
])`,
      tip: '$out drops the old target collection\'s data. Never point $out at a collection that holds real data you need.',
    },
  ],
  examples: [
    {
      title: 'Report 1: Sales by month',
      scenario: 'The founder wants a monthly sales report for 2025: number of orders, revenue and average order value per month, ignoring cancelled orders.',
      steps: [
        'Choose the shop dataset',
        'Remove cancelled orders with $match',
        'Group by $dateToString with format "%Y-%m" on orderDate; sum total and count orders',
        'Round the average with $project and sort by month ascending',
      ],
      code: `db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$orderDate' } },
      orders: { $sum: 1 },
      revenue: { $sum: '$total' },
      avgOrder: { $avg: '$total' }
  } },
  { $project: { orders: 1, revenue: 1, avgOrder: { $round: ['$avgOrder', 0] } } },
  { $sort: { _id: 1 } }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$orderDate' } },
      orders: { $sum: 1 },
      revenue: { $sum: '$total' },
      avgOrder: { $avg: '$total' }
  } },
  { $project: { orders: 1, revenue: 1, avgOrder: { $round: ['$avgOrder', 0] } } },
  { $sort: { _id: 1 } }
])`,
      },
      result: `[
  { _id: '2025-01', avgOrder: 67748, orders: 2, revenue: 135497 },
  { _id: '2025-02', avgOrder: 21742, orders: 2, revenue: 43484 },
  { _id: '2025-03', avgOrder: 56394, orders: 3, revenue: 169182 },
  { _id: '2025-04', avgOrder: 53662, orders: 3, revenue: 160985 },
  { _id: '2025-05', avgOrder: 7998, orders: 1, revenue: 7998 }
]`,
      explanation: '`$dateToString` turns each orderDate into a text key like "2025-03", so all orders from the same month fall into one group. February shows 2 orders because the cancelled one was filtered out first. Sorting by the "YYYY-MM" string is the same as sorting by date. In production add `timezone: \'Asia/Kolkata\'` so late-night orders land in the correct Indian month.',
    },
    {
      title: 'Report 2: Top 3 customers with $lookup',
      scenario: 'For a loyalty campaign, find the 3 customers who spent the most (non-cancelled orders) and show their name and city from the customers collection.',
      steps: [
        'Choose the shop dataset',
        'Group orders by customerId with total spent and order count; sort by spent desc and limit 3 (do this BEFORE the join)',
        'Join the customers collection with $lookup (localField _id, foreignField _id) and $unwind the result',
        'Project a clean output with name, city, orders and spent',
      ],
      code: `db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: { _id: '$customerId', spent: { $sum: '$total' }, orders: { $sum: 1 } } },
  { $sort: { spent: -1 } },
  { $limit: 3 },
  { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
  { $unwind: '$customer' },
  { $project: { _id: 0, name: '$customer.name', city: '$customer.city', orders: 1, spent: 1 } }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: { _id: '$customerId', spent: { $sum: '$total' }, orders: { $sum: 1 } } },
  { $sort: { spent: -1 } },
  { $limit: 3 },
  { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
  { $unwind: '$customer' },
  { $project: { _id: 0, name: '$customer.name', city: '$customer.city', orders: 1, spent: 1 } }
])`,
      },
      result: `[
  { city: 'Mumbai', name: 'Ravi Kumar', orders: 2, spent: 150898 },
  { city: 'Bengaluru', name: 'Priya Desai', orders: 2, spent: 117798 },
  { city: 'Delhi', name: 'Karan Mehta', orders: 1, spent: 104989 }
]`,
      explanation: 'After `$group`, `_id` holds the customerId, so the join uses `localField: \'_id\'`. Doing `$sort + $limit` before `$lookup` means only 3 joins happen instead of one per customer – an important performance habit. `$lookup` always returns an array, so `$unwind` turns the single matched customer into an object we can read with `$customer.name`.',
    },
    {
      title: 'Report 3: Best-selling products ($unwind + $lookup)',
      scenario: 'Which products sold the most units? Items live inside the orders\' items array, so flatten it, group by productId and fetch product names.',
      steps: [
        'Choose the shop dataset',
        '$unwind "$items" so each item becomes its own document',
        'Group by "$items.productId" summing qty and qty × price; sort by units desc and keep the top 3',
        '$lookup products to get the name and use $arrayElemAt to pick the first match',
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
  { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
  { $project: { _id: 0, product: { $arrayElemAt: ['$product.name', 0] }, unitsSold: 1, revenue: 1 } }
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
  { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
  { $project: { _id: 0, product: { $arrayElemAt: ['$product.name', 0] }, unitsSold: 1, revenue: 1 } }
])`,
      },
      result: `[
  { product: 'boAt Airdopes 141', revenue: 6495, unitsSold: 5 },
  { product: 'Redmi Note 13', revenue: 53997, unitsSold: 3 },
  { product: 'Noise ColorFit Pro 5', revenue: 11997, unitsSold: 3 }
]`,
      explanation: 'Without `$unwind` you cannot group by an element inside an array. Revenue uses the price stored in the order item (the price at purchase time), not the current product price – this snapshot is a deliberate modelling choice. `$arrayElemAt: [\'$product.name\', 0]` is an alternative to `$unwind` when you only need one field of the joined document.',
    },
    {
      title: 'Report 4: Dashboard with $facet and $bucket',
      scenario: 'The admin dashboard needs, in ONE request: product counts per category, overall price statistics, price bands (under 10k, 10k-50k, 50k-1L, premium) and the out-of-stock list.',
      steps: [
        'Choose the shop dataset',
        'Write a $facet with four named sub-pipelines',
        'Use $sortByCount for categories, $group with _id: null for stats, $bucket with boundaries and a default for price bands',
        'Run once and read the single result document',
      ],
      code: `db.products.aggregate([
  { $facet: {
      byCategory: [ { $sortByCount: '$category' } ],
      priceStats: [ { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' }, avg: { $avg: '$price' } } } ],
      priceBands: [ { $bucket: {
          groupBy: '$price',
          boundaries: [0, 10000, 50000, 100000],
          default: 'Premium',
          output: { count: { $sum: 1 } }
      } } ],
      outOfStock: [ { $match: { stock: 0 } }, { $project: { _id: 0, name: 1 } } ]
  } }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.products.aggregate([
  { $facet: {
      byCategory: [ { $sortByCount: '$category' } ],
      priceStats: [ { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' }, avg: { $avg: '$price' } } } ],
      priceBands: [ { $bucket: {
          groupBy: '$price',
          boundaries: [0, 10000, 50000, 100000],
          default: 'Premium',
          output: { count: { $sum: 1 } }
      } } ],
      outOfStock: [ { $match: { stock: 0 } }, { $project: { _id: 0, name: 1 } } ]
  } }
])`,
      },
      result: `[
  {
    byCategory: [
      { _id: 'Mobiles', count: 3 },
      { _id: 'Laptops', count: 3 },
      { _id: 'Audio', count: 3 },
      { _id: 'Wearables', count: 2 },
      { _id: 'Accessories', count: 1 }
    ],
    priceStats: [ { _id: null, min: 1299, max: 114900, avg: 39288.333333 } ],
    priceBands: [
      { count: 4, _id: 0 },
      { count: 4, _id: 10000 },
      { count: 3, _id: 50000 },
      { count: 1, _id: 'Premium' }
    ],
    outOfStock: [ { name: 'Inspiron 15' } ]
  }
]`,
      explanation: 'Every sub-pipeline of `$facet` receives the same 12 products, and the output is ONE document with four arrays. In `$bucket` the `_id` of each band is its lower boundary (0, 10000, 50000) – 0 ≤ price < 10000 and so on; the MacBook (114900) is above the last boundary so it goes to the "Premium" default bucket. One `$facet` call replaces four round trips from your API.',
    },
    {
      title: '$cond / $switch segments saved with $out',
      scenario: 'Create a "productSegments" collection that labels every product with a price segment (Premium / Mid-range / Budget) and a stock status (Out of stock / Low / OK), then query the saved collection.',
      steps: [
        'Choose the shop dataset',
        'Use $project with $switch for the segment and nested $cond for stock status',
        'Finish the pipeline with { $out: "productSegments" } (it prints [] because $out returns nothing)',
        'Query the new collection: Premium products only',
      ],
      code: `db.products.aggregate([
  { $project: {
      name: 1,
      price: 1,
      segment: { $switch: {
          branches: [
            { case: { $gte: ['$price', 70000] }, then: 'Premium' },
            { case: { $gte: ['$price', 20000] }, then: 'Mid-range' }
          ],
          default: 'Budget'
      } },
      stockStatus: { $cond: { if: { $eq: ['$stock', 0] }, then: 'Out of stock', else: { $cond: [{ $lt: ['$stock', 10] }, 'Low', 'OK'] } } }
  } },
  { $out: 'productSegments' }
])
db.productSegments.find({ segment: 'Premium' })`,
      mongo: {
        dataset: 'shop',
        query: `db.products.aggregate([
  { $project: {
      name: 1,
      price: 1,
      segment: { $switch: {
          branches: [
            { case: { $gte: ['$price', 70000] }, then: 'Premium' },
            { case: { $gte: ['$price', 20000] }, then: 'Mid-range' }
          ],
          default: 'Budget'
      } },
      stockStatus: { $cond: { if: { $eq: ['$stock', 0] }, then: 'Out of stock', else: { $cond: [{ $lt: ['$stock', 10] }, 'Low', 'OK'] } } }
  } },
  { $out: 'productSegments' }
])
db.productSegments.find({ segment: 'Premium' })`,
      },
      result: `[]
{
  _id: 1,
  name: 'iPhone 15',
  price: 79900,
  segment: 'Premium',
  stockStatus: 'OK'
}
{
  _id: 2,
  name: 'Galaxy S24',
  price: 74999,
  segment: 'Premium',
  stockStatus: 'OK'
}
{
  _id: 4,
  name: 'MacBook Air M3',
  price: 114900,
  segment: 'Premium',
  stockStatus: 'Low'
}`,
      explanation: '`$switch` checks branches top to bottom and returns the first match, so a 79900 phone is "Premium" and never reaches the Mid-range branch. The nested `$cond` is an if / else-if / else. `$out` wrote the result to a new collection, which we then query like any other collection – a simple materialized view.',
    },
  ],
  interview: [
    {
      q: 'What does $unwind do and what happens to documents with an empty array?',
      a: '$unwind deconstructs an array field and outputs one document per element. Documents where the array is empty, null or missing are dropped by default; use { $unwind: { path: "$arr", preserveNullAndEmptyArrays: true } } to keep them.',
      level: 'Easy',
    },
    {
      q: 'How does $lookup work? What type of join is it?',
      a: '$lookup is a left outer join to another collection in the same database. For each input document it finds documents in the "from" collection where foreignField equals localField (or that match a sub-pipeline) and stores them in an array field named by "as". Unmatched documents get an empty array.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between Mongoose populate() and $lookup?',
      a: 'populate() runs separate queries from the application (one extra query per populated path) and merges results in Node.js; it works with find queries and Mongoose refs. $lookup performs the join inside the database within an aggregation pipeline, so you can filter/group/sort on joined fields in the same query. populate is simpler; $lookup is better for reports and joined filtering.',
      level: 'Medium',
    },
    {
      q: 'How do you optimize a pipeline that uses $lookup?',
      a: 'Filter ($match), sort and limit before the $lookup so fewer documents are joined; index the foreignField; use the pipeline form to project only needed fields from the joined collection; avoid $lookup inside hot paths by embedding frequently-read fields (extended reference pattern).',
      level: 'Hard',
    },
    {
      q: 'What is $facet used for?',
      a: '$facet runs multiple sub-pipelines on the same set of input documents and outputs a single document with one array per facet. It is used for faceted search (results + counts by category + price ranges) and dashboards in a single round trip. Note the output document must stay under 16 MB.',
      level: 'Medium',
    },
    {
      q: 'Explain $bucket vs $bucketAuto.',
      a: '$bucket groups documents into ranges you specify with boundaries (lower inclusive, upper exclusive) and an optional default bucket for out-of-range values. $bucketAuto takes a number of buckets and automatically computes boundaries so documents are distributed evenly.',
      level: 'Medium',
    },
    {
      q: 'How would you write a "sales by month" report in MongoDB?',
      a: '$match the relevant orders, then $group with _id: { $dateToString: { format: "%Y-%m", date: "$orderDate", timezone: "Asia/Kolkata" } } (or _id: { y: { $year: "$orderDate" }, m: { $month: "$orderDate" } }) and $sum the totals, then $sort by _id.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between $cond and $switch?',
      a: '$cond is a single if/then/else expression. $switch evaluates a list of case branches in order and returns the "then" of the first true case, with a default if none match – cleaner than deeply nested $cond for 3+ outcomes.',
      level: 'Easy',
    },
    {
      q: 'How do you count only orders with a certain status inside a $group?',
      a: 'Conditional sum: { delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } } }. It works like SUM(CASE WHEN status = "delivered" THEN 1 ELSE 0 END) in SQL.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between $out and $merge?',
      a: 'Both must be the last stage and write pipeline output to a collection. $out replaces the entire target collection. $merge (MongoDB 4.2+) merges into an existing collection with configurable behaviour (whenMatched: replace/merge/keepExisting/fail/pipeline, whenNotMatched: insert/discard/fail), allowing incremental materialized views.',
      level: 'Hard',
    },
    {
      q: 'Why might a monthly report give different numbers in India than expected?',
      a: 'MongoDB stores dates in UTC and date operators default to UTC. Orders placed between 00:00 and 05:30 IST on the 1st of a month belong to the previous month in UTC. Pass timezone: "Asia/Kolkata" to $dateToString / $month / $dateTrunc.',
      level: 'Hard',
    },
    {
      q: 'What does $$ mean in a $lookup pipeline?',
      a: 'Variables defined in let (e.g. let: { sid: "$_id" }) are referenced with a double dollar ($$sid) inside the sub-pipeline, while a single $ refers to fields of the joined (foreign) documents. Matching needs $expr: { $match: { $expr: { $eq: ["$studentId", "$$sid"] } } }.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'College dataset: show how many students are enrolled in each course, displaying the course TITLE (not the id), sorted by count descending then title.',
      hint: '$lookup from courses with localField courseId, $unwind, $group by "$course.title".',
      solution: `db.enrollments.aggregate([
  { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } },
  { $unwind: '$course' },
  { $group: { _id: '$course.title', students: { $sum: 1 } } },
  { $sort: { students: -1, _id: 1 } }
])
// Web Development (MERN): 4, Data Structures: 3, Database Systems: 2, Machine Learning: 2, Embedded Systems: 1`,
    },
    {
      task: 'College dataset: for every final-year (year 4) student, list the courses they are enrolled in with grades using the pipeline form of $lookup.',
      hint: 'let: { sid: "$_id" } and $match: { $expr: { $eq: ["$studentId", "$$sid"] } }.',
      solution: `db.students.aggregate([
  { $match: { year: 4 } },
  { $lookup: {
      from: 'enrollments',
      let: { sid: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$studentId', '$$sid'] } } },
        { $project: { _id: 0, courseId: 1, grade: 1 } }
      ],
      as: 'enrolled'
  } },
  { $project: { name: 1, enrolled: 1 } }
])`,
    },
    {
      task: 'Blog dataset: for each post show a URL slug (lowercase title with spaces replaced by "-"), the number of comments and the number of days between createdAt and 1 June 2025.',
      hint: '$toLower + $replaceAll, $size, $dateDiff.',
      solution: `db.posts.aggregate([
  { $project: {
      _id: 0,
      slug: { $toLower: { $replaceAll: { input: '$title', find: ' ', replacement: '-' } } },
      comments: { $size: '$comments' },
      ageDays: { $dateDiff: { startDate: '$createdAt', endDate: ISODate('2025-06-01T00:00:00Z'), unit: 'day' } }
  } }
])`,
    },
    {
      task: 'Shop dataset: build a per-customer order summary with total orders, delivered orders, cancelled orders and total spent on delivered orders only (conditional sums).',
      hint: '$sum with $cond inside $group.',
      solution: `db.orders.aggregate([
  { $group: {
      _id: '$customerId',
      orders: { $sum: 1 },
      delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
      cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
      deliveredSpend: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$total', 0] } }
  } },
  { $sort: { deliveredSpend: -1 } }
])`,
    },
    {
      task: 'Blog dataset: find the most active commenters – unwind comments, count comments per userId, join users to get the username, and save the result into a collection called commenterStats with $out.',
      hint: '$unwind "$comments", $group by "$comments.userId", $lookup users, $out last.',
      solution: `db.posts.aggregate([
  { $unwind: '$comments' },
  { $group: { _id: '$comments.userId', comments: { $sum: 1 } } },
  { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
  { $project: { comments: 1, username: { $arrayElemAt: ['$user.username', 0] } } },
  { $sort: { comments: -1 } },
  { $out: 'commenterStats' }
])
db.commenterStats.find()
// karan_m (userId 4) leads with 3 comments, then ravi_codes with 2`,
    },
  ],
  quiz: [
    {
      question: 'What does $lookup add to each input document?',
      options: [
        'A single embedded object always',
        'An array field containing the matching documents',
        'A new collection',
        'A foreign key constraint',
      ],
      answer: 1,
      explanation: '$lookup always outputs an array (empty if nothing matched). Use $unwind or $arrayElemAt to get a single object.',
    },
    {
      question: 'An order has items: [A, B, C]. How many documents does { $unwind: "$items" } produce for it?',
      options: ['1', '0', '3', 'It depends on the index'],
      answer: 2,
      explanation: 'One output document per array element: three.',
    },
    {
      question: 'Which stage runs several independent sub-pipelines over the same input and returns them in one document?',
      options: ['$facet', '$bucket', '$merge', '$unionWith'],
      answer: 0,
      explanation: '$facet is designed for multi-faceted reports such as dashboards and faceted search.',
    },
    {
      question: 'In $bucket with boundaries [0, 10000, 50000], which bucket does a price of exactly 10000 go into?',
      options: ['The 0 bucket', 'The default bucket', 'Both buckets', 'The 10000 bucket'],
      answer: 3,
      explanation: 'The lower boundary is inclusive and the upper is exclusive, so 10000 belongs to the bucket [10000, 50000), whose _id is 10000.',
    },
    {
      question: 'What is the key difference between $out and $merge?',
      options: [
        '$out can appear anywhere in the pipeline',
        '$out replaces the target collection while $merge can upsert into an existing one',
        '$merge only works on sharded clusters',
        'There is no difference',
      ],
      answer: 1,
      explanation: 'Both are final stages. $out overwrites the whole collection; $merge merges documents with configurable matched/not-matched behaviour.',
    },
  ],
};
