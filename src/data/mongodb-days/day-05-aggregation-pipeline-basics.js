export default {
  id: 'day-05-aggregation-pipeline-basics',
  title: 'Aggregation Pipeline Basics: $match, $group, $sort, $project, $addFields, $count & Accumulators',
  module: 'Module 2: Aggregation & Performance',
  day: 5,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'find() can filter and shape documents, but it cannot answer questions like "total revenue per payment method" or "average price per category". The aggregation pipeline can. Today you learn how a pipeline works stage by stage and master the core stages and accumulators used in every MongoDB report.',
  objectives: [
    'Explain the aggregation pipeline and how documents flow from stage to stage',
    'Filter with $match and group with $group using $sum, $avg, $min, $max, $push, $addToSet, $first and $last',
    'Shape output with $project and $addFields using expression operators ($multiply, $round, $concat)',
    'Sort, limit and count results with $sort, $limit, $skip and $count',
    'Translate common SQL GROUP BY / HAVING queries into aggregation pipelines',
  ],
  theory: [
    {
      heading: 'What is the aggregation pipeline?',
      content: `The **aggregation pipeline** is MongoDB's data-processing framework. You pass an **array of stages** to \`db.collection.aggregate([...])\`. Each stage receives documents, transforms them, and passes the result to the next stage.

**Analogy:** think of a factory conveyor belt. Raw documents enter at one end. Station 1 throws away what you do not need (\`$match\`), station 2 puts items into boxes by category (\`$group\`), station 3 arranges the boxes (\`$sort\`), station 4 labels them (\`$project\`). What comes out at the end is your report.

Key facts:
- Stages run **in order**, and the same stage can appear many times.
- The pipeline **does not change** the stored data (except the \`$out\` / \`$merge\` stages you will see on Day 6).
- The result is a cursor of documents – in mongosh it is printed like a list.
- Field paths inside expressions start with a dollar sign: \`'$price'\` means "the value of the price field".`,
      syntax: `db.orders.aggregate([
  { $match: { status: 'delivered' } },                 // 1. filter
  { $group: { _id: '$payment', revenue: { $sum: '$total' } } }, // 2. group
  { $sort: { revenue: -1 } }                           // 3. sort
])`,
      tip: 'Build pipelines one stage at a time. Run the first stage, look at the output, then add the next stage. This is exactly how Compass\'s Aggregation Builder works.',
    },
    {
      heading: '$match – filter early',
      content: `\`$match\` filters documents using the **same query syntax as find()** – comparison operators, \`$in\`, \`$or\`, dot notation, everything from Day 3.

Put \`$match\` **as early as possible**:
- Fewer documents flow through the later stages, so the pipeline is faster.
- A \`$match\` at the very beginning of a pipeline can use **indexes** (Day 7). A \`$match\` after a \`$group\` cannot.

A \`$match\` **after** \`$group\` filters the grouped results – it plays the role of SQL's **HAVING** clause.`,
      syntax: `// WHERE  → $match before $group
{ $match: { status: { $in: ['delivered', 'shipped'] } } }

// HAVING → $match after $group
{ $group: { _id: '$customerId', orders: { $sum: 1 } } },
{ $match: { orders: { $gte: 2 } } }`,
    },
    {
      heading: '$group and accumulators',
      content: `\`$group\` combines documents that share the same \`_id\` expression into one output document. The \`_id\` field is the **group key** (like the columns in SQL \`GROUP BY\`). Every other field must use an **accumulator**:

- \`$sum\` – total (\`{ $sum: 1 }\` counts documents, \`{ $sum: '$total' }\` adds a field)
- \`$avg\` – average
- \`$min\` / \`$max\` – smallest / largest value
- \`$push\` – collect values into an array (duplicates kept)
- \`$addToSet\` – collect **unique** values into an array
- \`$first\` / \`$last\` – value from the first / last document of the group (meaningful after a \`$sort\`)
- \`$count\` (accumulator form \`{ $count: {} }\`, MongoDB 5+) – same as \`{ $sum: 1 }\`

Special group keys:
- \`_id: null\` – one group for the whole collection (grand total).
- \`_id: { city: '$city', prime: '$prime' }\` – group by **multiple fields**.`,
      syntax: `{ $group: {
    _id: '$category',                 // group key
    count:    { $sum: 1 },
    avgPrice: { $avg: '$price' },
    maxPrice: { $max: '$price' },
    names:    { $push: '$name' },
    brands:   { $addToSet: '$brand' }
} }`,
      tip: 'A very common mistake is writing { $sum: "total" } without the $. That sums the literal string, which gives 0. Field paths always need the $ prefix.',
    },
    {
      heading: '$project and $addFields – shaping documents',
      content: `\`$project\` decides **which fields leave the stage**, and can compute new ones:
- \`{ name: 1 }\` keeps a field, \`{ _id: 0 }\` removes \`_id\`
- \`{ priceWithGst: { $multiply: ['$price', 1.18] } }\` creates a computed field
- \`{ customerName: '$name' }\` renames a field

\`$addFields\` (alias \`$set\`) **adds or overwrites** fields while keeping all existing ones. Use it when you want "everything plus one more field".

Common expression operators:
- Arithmetic: \`$add\`, \`$subtract\`, \`$multiply\`, \`$divide\`, \`$mod\`, \`$round\`, \`$abs\`
- String: \`$concat\`, \`$toUpper\`, \`$toLower\`, \`$substrCP\`
- Array: \`$size\`, \`$arrayElemAt\`, \`$in\`
- Comparison inside expressions: \`$eq\`, \`$gt\`, \`$lt\` (these take an **array** of two values: \`{ $gt: ['$price', 50000] }\`)`,
      syntax: `{ $addFields: { stockValue: { $multiply: ['$price', '$stock'] } } }
{ $project: { _id: 0, name: 1, priceWithGst: { $round: [{ $multiply: ['$price', 1.18] }, 0] } } }`,
      tip: 'Do not mix inclusion (1) and exclusion (0) in one $project, except for _id: 0. { name: 1, stock: 0 } is an error.',
    },
    {
      heading: '$sort, $limit, $skip and $count',
      content: `- \`$sort: { revenue: -1 }\` – 1 ascending, -1 descending; sort by several fields \`{ count: -1, _id: 1 }\` to break ties.
- \`$limit: 5\` – keep only the first N documents ("top 5").
- \`$skip: 10\` – skip N documents (pagination).
- \`$count: 'fieldName'\` – replaces all documents with one document \`{ fieldName: <number> }\`.

Order matters! \`$sort\` then \`$limit\` = "top N". \`$limit\` then \`$sort\` = "N random-ish documents, sorted". MongoDB optimises \`$sort + $limit\` into a top-N sort that uses very little memory.

Memory: each stage may use up to **100 MB of RAM**. Since MongoDB 6.0 \`allowDiskUse\` is on by default, so big \`$group\` / \`$sort\` stages can spill to disk instead of failing.`,
      syntax: `db.products.aggregate([
  { $sort: { price: -1 } },
  { $limit: 3 },
  { $project: { _id: 0, name: 1, price: 1 } }
])`,
    },
    {
      heading: 'SQL GROUP BY → aggregation cheat sheet',
      content: `| SQL | Aggregation |
|---|---|
| WHERE | \`$match\` (before \`$group\`) |
| GROUP BY | \`$group\` with \`_id\` |
| COUNT(*) | \`{ $sum: 1 }\` or \`$count\` stage |
| SUM / AVG / MIN / MAX | \`$sum\` / \`$avg\` / \`$min\` / \`$max\` |
| HAVING | \`$match\` (after \`$group\`) |
| SELECT columns | \`$project\` |
| ORDER BY | \`$sort\` |
| LIMIT / OFFSET | \`$limit\` / \`$skip\` |
| JOIN | \`$lookup\` (Day 6) |

**Example:** "Revenue per payment method for delivered orders, highest first"

SQL: \`SELECT payment, SUM(total) AS revenue FROM orders WHERE status = 'delivered' GROUP BY payment ORDER BY revenue DESC;\`

MongoDB: \`db.orders.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: '$payment', revenue: { $sum: '$total' } } }, { $sort: { revenue: -1 } }])\``,
    },
    {
      heading: 'Aggregation in Node.js / Mongoose',
      content: `The same pipeline array works everywhere:
- Node driver: \`await db.collection('orders').aggregate(pipeline).toArray()\`
- Mongoose: \`await Order.aggregate(pipeline)\`

Two things to remember in Mongoose:
1. \`Model.aggregate()\` returns **plain objects** – no getters, virtuals or schema defaults.
2. Mongoose does **not cast** values inside pipelines. If you filter by an id coming from \`req.params\`, convert it yourself: \`new mongoose.Types.ObjectId(req.params.id)\`.`,
      syntax: `// controllers/report.controller.js
const Order = require('../models/Order');

exports.revenueByPayment = async (req, res) => {
  const data = await Order.aggregate([
    { $match: { status: 'delivered' } },
    { $group: { _id: '$payment', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    { $sort: { revenue: -1 } }
  ]);
  res.json(data);
};`,
    },
  ],
  examples: [
    {
      title: 'Category summary with $group accumulators',
      scenario: 'The store manager wants one line per category showing number of products, average price, most expensive price and total stock, with the biggest categories first.',
      steps: [
        'Open the MongoDB Shell Lab and choose the shop dataset',
        'Group products by "$category" and add $sum, $avg, $max accumulators',
        'Sort by count descending and by _id ascending to break ties',
        'Run the pipeline and read one document per category',
      ],
      code: `db.products.aggregate([
  { $group: {
      _id: '$category',
      count: { $sum: 1 },
      avgPrice: { $avg: '$price' },
      maxPrice: { $max: '$price' },
      totalStock: { $sum: '$stock' }
  } },
  { $sort: { count: -1, _id: 1 } }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.products.aggregate([
  { $group: {
      _id: '$category',
      count: { $sum: 1 },
      avgPrice: { $avg: '$price' },
      maxPrice: { $max: '$price' },
      totalStock: { $sum: '$stock' }
  } },
  { $sort: { count: -1, _id: 1 } }
])`,
      },
      result: `[
  {
    _id: 'Audio',
    count: 3,
    avgPrice: 13762.666667,
    maxPrice: 29990,
    totalStock: 174
  },
  {
    _id: 'Laptops',
    count: 3,
    avgPrice: 71293.333333,
    maxPrice: 114900,
    totalStock: 21
  },
  {
    _id: 'Mobiles',
    count: 3,
    avgPrice: 57632.666667,
    maxPrice: 79900,
    totalStock: 87
  },
  {
    _id: 'Wearables',
    count: 2,
    avgPrice: 16949.5,
    maxPrice: 29900,
    totalStock: 71
  },
  {
    _id: 'Accessories',
    count: 1,
    avgPrice: 9495,
    maxPrice: 9495,
    totalStock: 18
  }
]`,
      explanation: '`_id: \'$category\'` is the group key, so all products with the same category collapse into one document. `{ $sum: 1 }` adds 1 for every product (a count) while `{ $sum: \'$stock\' }` adds the stock values. Three categories have 3 products, so the second sort key `_id: 1` puts them in alphabetical order. In a real app you would round avgPrice – see the next examples.',
    },
    {
      title: 'Revenue per payment method (WHERE + GROUP BY + ORDER BY)',
      scenario: 'Finance asks: for delivered orders only, how much revenue came from each payment method, and how many orders? Also print the total number of delivered orders.',
      steps: [
        'Choose the shop dataset',
        'Start the pipeline with $match: { status: "delivered" }',
        'Group by "$payment" with $sum of "$total" and a count',
        'Sort by revenue descending; then run a second pipeline with $count',
      ],
      code: `db.orders.aggregate([
  { $match: { status: 'delivered' } },
  { $group: { _id: '$payment', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
  { $sort: { revenue: -1 } }
])
db.orders.aggregate([
  { $match: { status: 'delivered' } },
  { $count: 'deliveredOrders' }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.orders.aggregate([
  { $match: { status: 'delivered' } },
  { $group: { _id: '$payment', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
  { $sort: { revenue: -1 } }
])
db.orders.aggregate([
  { $match: { status: 'delivered' } },
  { $count: 'deliveredOrders' }
])`,
      },
      result: `[
  { _id: 'UPI', revenue: 221880, orders: 4 },
  { _id: 'Card', revenue: 134898, orders: 2 },
  { _id: 'COD', revenue: 13494, orders: 1 }
]
[ { deliveredOrders: 7 } ]`,
      explanation: '`$match` comes first so only the 7 delivered orders reach `$group` (and in a real database it could use an index on status). The `$count` stage replaces the stream with a single document whose field name you choose. Equivalent SQL: `SELECT payment, SUM(total), COUNT(*) FROM orders WHERE status = \'delivered\' GROUP BY payment ORDER BY 2 DESC`.',
    },
    {
      title: 'Computed fields with $addFields and $project',
      scenario: 'For the Mobiles category, show each phone\'s price including 18% GST (rounded to the rupee) and the value of the stock on hand (price × stock). Hide _id.',
      steps: [
        'Choose the shop dataset',
        'Filter Mobiles with $match',
        'Use $addFields with $multiply and $round to create priceWithGst and stockValue',
        'Use $project to keep only name, price and the two new fields, with _id: 0',
      ],
      code: `db.products.aggregate([
  { $match: { category: 'Mobiles' } },
  { $addFields: {
      priceWithGst: { $round: [{ $multiply: ['$price', 1.18] }, 0] },
      stockValue: { $multiply: ['$price', '$stock'] }
  } },
  { $project: { _id: 0, name: 1, price: 1, priceWithGst: 1, stockValue: 1 } }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.products.aggregate([
  { $match: { category: 'Mobiles' } },
  { $addFields: {
      priceWithGst: { $round: [{ $multiply: ['$price', 1.18] }, 0] },
      stockValue: { $multiply: ['$price', '$stock'] }
  } },
  { $project: { _id: 0, name: 1, price: 1, priceWithGst: 1, stockValue: 1 } }
])`,
      },
      result: `[
  {
    name: 'iPhone 15',
    price: 79900,
    priceWithGst: 94282,
    stockValue: 958800
  },
  {
    name: 'Galaxy S24',
    price: 74999,
    priceWithGst: 88499,
    stockValue: 1499980
  },
  {
    name: 'Redmi Note 13',
    price: 17999,
    priceWithGst: 21239,
    stockValue: 989945
  }
]`,
      explanation: '`$multiply` takes an array of numbers or field paths. `$round: [value, 0]` rounds to 0 decimal places. `$addFields` keeps every field and adds the new ones; `$project` then trims the output. The stored products are not changed – the pipeline only produces a report.',
    },
    {
      title: '$push, $addToSet and HAVING with $match after $group',
      scenario: 'Marketing wants a list of brands that sell MORE than one product, with the product names and the categories they cover.',
      steps: [
        'Choose the shop dataset',
        'Group by "$brand" collecting names with $push and categories with $addToSet, and count products',
        'Add a $match AFTER the $group to keep only groups with count greater than 1 (this is HAVING)',
        'Run and check that only Apple qualifies',
      ],
      code: `db.products.aggregate([
  { $group: {
      _id: '$brand',
      count: { $sum: 1 },
      products: { $push: '$name' },
      categories: { $addToSet: '$category' }
  } },
  { $match: { count: { $gt: 1 } } }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.products.aggregate([
  { $group: {
      _id: '$brand',
      count: { $sum: 1 },
      products: { $push: '$name' },
      categories: { $addToSet: '$category' }
  } },
  { $match: { count: { $gt: 1 } } }
])`,
      },
      result: `[
  {
    _id: 'Apple',
    count: 3,
    products: [ 'iPhone 15', 'MacBook Air M3', 'Apple Watch SE' ],
    categories: [ 'Mobiles', 'Laptops', 'Wearables' ]
  }
]`,
      explanation: 'After `$group` the documents have the fields `_id, count, products, categories`, so the second `$match` filters on the computed `count` – exactly what SQL `HAVING COUNT(*) > 1` does. `$push` keeps every value (duplicates included); `$addToSet` keeps only unique values (its order is not guaranteed in real MongoDB).',
    },
    {
      title: 'Average marks per branch (grouping on embedded fields)',
      scenario: 'The college placement cell wants the average CGPA and the average DSA marks per branch, rounded to 2 decimals, plus the top student name in each branch.',
      steps: [
        'Choose the college dataset',
        'Sort students by cgpa descending first, so $first picks the topper of each group',
        'Group by "$branch" using $avg on "$cgpa" and on the embedded field "$marks.dsa", and $first on "$name"',
        'Round the averages in a $project and sort by avgCgpa descending',
      ],
      code: `db.students.aggregate([
  { $sort: { cgpa: -1 } },
  { $group: {
      _id: '$branch',
      students: { $sum: 1 },
      avgCgpa: { $avg: '$cgpa' },
      avgDsa: { $avg: '$marks.dsa' },
      topper: { $first: '$name' }
  } },
  { $project: { students: 1, topper: 1, avgCgpa: { $round: ['$avgCgpa', 2] }, avgDsa: { $round: ['$avgDsa', 2] } } },
  { $sort: { avgCgpa: -1 } }
])`,
      mongo: {
        dataset: 'college',
        query: `db.students.aggregate([
  { $sort: { cgpa: -1 } },
  { $group: {
      _id: '$branch',
      students: { $sum: 1 },
      avgCgpa: { $avg: '$cgpa' },
      avgDsa: { $avg: '$marks.dsa' },
      topper: { $first: '$name' }
  } },
  { $project: { students: 1, topper: 1, avgCgpa: { $round: ['$avgCgpa', 2] }, avgDsa: { $round: ['$avgDsa', 2] } } },
  { $sort: { avgCgpa: -1 } }
])`,
      },
      result: `[
  {
    _id: 'CSE',
    avgCgpa: 8.67,
    avgDsa: 67.75,
    students: 4,
    topper: 'Neha Shah'
  },
  {
    _id: 'IT',
    avgCgpa: 8.13,
    avgDsa: 82.33,
    students: 3,
    topper: 'Pooja Nair'
  },
  {
    _id: 'MECH',
    avgCgpa: 7.5,
    avgDsa: 55,
    students: 1,
    topper: 'Sneha More'
  },
  {
    _id: 'ENTC',
    avgCgpa: 6.5,
    avgDsa: 30.5,
    students: 2,
    topper: 'Imran Khan'
  }
]`,
      explanation: 'Dot notation (`$marks.dsa`) reaches inside the embedded marks document. Because the input was sorted by cgpa descending, `$first: \'$name\'` gives the highest-CGPA student of each branch – `$first`/`$last` only make sense after a `$sort`. The final `$project` rounds the averages for a clean report.',
    },
  ],
  interview: [
    {
      q: 'What is the aggregation pipeline in MongoDB?',
      a: 'A framework for data processing in which documents pass through an ordered array of stages ($match, $group, $sort, $project, $lookup, ...). Each stage transforms the stream and hands it to the next. It is used for reports, analytics, transformations and joins, and runs on the server.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between find() and aggregate()?',
      a: 'find() filters documents and can project, sort, skip and limit, but cannot group, compute totals across documents, reshape deeply or join. aggregate() can do all of that with multiple stages. Use find() for simple reads (it is simpler and supports the same indexes); use aggregate() for reports and transformations.',
      level: 'Easy',
    },
    {
      q: 'Why should $match be placed as early as possible?',
      a: 'It reduces the number of documents that later stages process (less CPU and memory), and a $match at the start of the pipeline can use indexes. After $group or $project the original indexes are no longer usable. The optimizer moves some $match stages earlier automatically, but you should write them early yourself.',
      level: 'Medium',
    },
    {
      q: 'How do you write SQL HAVING in MongoDB?',
      a: 'Use a $match stage after the $group stage, filtering on the computed field. Example: [{ $group: { _id: "$customerId", orders: { $sum: 1 } } }, { $match: { orders: { $gte: 2 } } }].',
      level: 'Medium',
    },
    {
      q: 'What is the difference between $push and $addToSet?',
      a: '$push appends every value into the array, including duplicates. $addToSet adds a value only if it is not already present, so the result holds unique values (order not guaranteed). Both are accumulators in $group (and also update operators with similar meaning).',
      level: 'Easy',
    },
    {
      q: 'What is the difference between $project and $addFields?',
      a: '$project outputs only the fields you list (plus _id unless excluded) and can compute new ones. $addFields (alias $set) keeps all existing fields and adds or overwrites the listed ones. Use $addFields when you want to keep the whole document and add a computed field.',
      level: 'Medium',
    },
    {
      q: 'How do you count documents in an aggregation pipeline?',
      a: 'Use the $count stage: { $count: "total" } outputs { total: N }. Inside $group use { $sum: 1 } (or { $count: {} } in MongoDB 5+). For a simple filter count, db.coll.countDocuments(filter) is simpler.',
      level: 'Easy',
    },
    {
      q: 'How do you group by multiple fields?',
      a: 'Use a document as the group key: { $group: { _id: { city: "$city", prime: "$prime" }, count: { $sum: 1 } } }. The output _id is then an embedded document such as { city: "Pune", prime: true }.',
      level: 'Medium',
    },
    {
      q: 'What is _id: null in $group?',
      a: 'It puts all input documents into a single group, used for grand totals: { $group: { _id: null, revenue: { $sum: "$total" }, avgOrder: { $avg: "$total" } } }.',
      level: 'Easy',
    },
    {
      q: 'What is the memory limit of an aggregation stage and how do you handle large data?',
      a: 'Each stage can use up to 100 MB of RAM. Blocking stages like $group and $sort can exceed it on large data; with allowDiskUse (default true since MongoDB 6.0) they spill to temporary files on disk. Better solutions are filtering early with $match, projecting only needed fields, using indexes for $sort, and precomputing results.',
      level: 'Hard',
    },
    {
      q: 'Why is { $sum: "total" } returning 0?',
      a: 'Because "total" without a dollar sign is a string literal, not a field path. $sum ignores non-numeric values, so the result is 0. It must be { $sum: "$total" }.',
      level: 'Medium',
    },
    {
      q: 'Does Mongoose cast types inside Model.aggregate()?',
      a: 'No. Mongoose casts filters for find/update, but aggregation pipelines are sent as-is. If you $match on an ObjectId from req.params you must convert it with new mongoose.Types.ObjectId(id). Also results are plain objects, not Mongoose documents (no virtuals or methods).',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Using the shop dataset, find the total revenue and the average order value of ALL non-cancelled orders (one result document).',
      hint: '$match with $ne, then $group with _id: null.',
      solution: `db.orders.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: { _id: null, revenue: { $sum: '$total' }, avgOrder: { $avg: '$total' }, orders: { $sum: 1 } } },
  { $project: { _id: 0, revenue: 1, orders: 1, avgOrder: { $round: ['$avgOrder', 0] } } }
])
// revenue: 517146, orders: 11`,
    },
    {
      task: 'Using the shop dataset, count customers per city and show only cities that have 2 or more customers, sorted by city name.',
      hint: '$group on "$city", then $match after the group, then $sort.',
      solution: `db.customers.aggregate([
  { $group: { _id: '$city', customers: { $sum: 1 }, names: { $push: '$name' } } },
  { $match: { customers: { $gte: 2 } } },
  { $sort: { _id: 1 } }
])
// Mumbai (Ravi, Sneha) and Pune (Asha, Imran)`,
    },
    {
      task: 'Using the college dataset, show the number of students and the list of unique skills for each year of study, sorted by year.',
      hint: 'Grouping by "$year" with $addToSet on "$skills" gives arrays of arrays – that is fine for today (Day 6 shows $unwind to flatten them).',
      solution: `db.students.aggregate([
  { $group: { _id: '$year', students: { $sum: 1 }, skillSets: { $addToSet: '$skills' } } },
  { $sort: { _id: 1 } }
])
// Bonus (Day 6 preview): flatten skills first
db.students.aggregate([
  { $unwind: '$skills' },
  { $group: { _id: '$year', skills: { $addToSet: '$skills' } } },
  { $sort: { _id: 1 } }
])`,
    },
    {
      task: 'Using the shop dataset, list the 3 cheapest products that are in stock, showing only name, brand and price with a new field label = name + " by " + brand.',
      hint: '$match stock > 0, $sort price ascending, $limit 3, $project with $concat.',
      solution: `db.products.aggregate([
  { $match: { stock: { $gt: 0 } } },
  { $sort: { price: 1 } },
  { $limit: 3 },
  { $project: { _id: 0, name: 1, brand: 1, price: 1, label: { $concat: ['$name', ' by ', '$brand'] } } }
])`,
    },
    {
      task: 'Write an Express route GET /api/reports/categories that returns the category summary (count, avgPrice rounded, totalStock) using a Mongoose Product model.',
      hint: 'Product.aggregate([...]) inside an async controller.',
      solution: `// routes/report.routes.js
const router = require('express').Router();
const Product = require('../models/Product');

router.get('/categories', async (req, res) => {
  const data = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' }, totalStock: { $sum: '$stock' } } },
    { $project: { _id: 0, category: '$_id', count: 1, totalStock: 1, avgPrice: { $round: ['$avgPrice', 0] } } },
    { $sort: { count: -1, category: 1 } }
  ]);
  res.json(data);   // Express 5 forwards async errors to the error middleware automatically
});

module.exports = router;
// app.js: app.use('/api/reports', require('./routes/report.routes'));`,
    },
  ],
  quiz: [
    {
      question: 'Which stage is the MongoDB equivalent of SQL GROUP BY?',
      options: ['$match', '$project', '$group', '$bucket'],
      answer: 2,
      explanation: '$group combines documents with the same _id expression and computes accumulators like $sum and $avg.',
    },
    {
      question: 'What does { $sum: 1 } do inside a $group stage?',
      options: [
        'Counts the documents in each group',
        'Adds the field named "1"',
        'Returns the first document',
        'Always returns 1',
      ],
      answer: 0,
      explanation: 'Adding 1 for every document in the group gives the count of documents.',
    },
    {
      question: 'Where should you put a $match that filters the ORIGINAL documents?',
      options: [
        'At the end of the pipeline',
        'After $group',
        'Inside $project',
        'As early as possible, ideally the first stage',
      ],
      answer: 3,
      explanation: 'An early $match reduces the work for later stages and can use indexes.',
    },
    {
      question: 'Which statement about $addFields is TRUE?',
      options: [
        'It removes all fields except the ones listed',
        'It keeps existing fields and adds or overwrites the listed fields',
        'It permanently updates documents in the collection',
        'It can only be used after $group',
      ],
      answer: 1,
      explanation: '$addFields (alias $set) adds computed fields while keeping the rest of the document. It does not modify stored data.',
    },
    {
      question: 'A $match placed AFTER $group behaves like which SQL clause?',
      options: ['WHERE', 'ORDER BY', 'JOIN', 'HAVING'],
      answer: 3,
      explanation: 'It filters grouped results using computed fields, exactly like HAVING.',
    },
  ],
};
