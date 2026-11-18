export default {
  id: 'day-03-query-operators-arrays-embedded-documents',
  title: 'Query Operators: Comparison, Logical, $in/$nin, $exists, $type, $regex, Arrays ($all, $size, $elemMatch) and Embedded Documents',
  module: 'Module 1: MongoDB Basics',
  day: 3,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Equality filters only take you so far. Today you learn the MongoDB Query Language operators that power every search box, filter panel and report: ranges, OR conditions, lists of values, missing fields, data types, text patterns, array queries and dot notation for embedded documents.',
  objectives: [
    'Write range queries with $eq, $ne, $gt, $gte, $lt, $lte',
    'Combine conditions with implicit AND, $and, $or, $nor and $not',
    'Match lists of values with $in / $nin and check fields with $exists and $type',
    'Search text patterns with $regex (and know when it cannot use an index)',
    'Query arrays with $all, $size, $elemMatch and embedded documents with dot notation',
  ],
  theory: [
    {
      heading: 'How operators fit into a filter',
      content: `A query operator is a key starting with \`$\` placed **inside** the value of a field:

\`{ field: { $operator: value } }\`

For example \`{ price: { $gt: 50000 } }\` means "price greater than 50000". Equality \`{ price: 50000 }\` is just a short form of \`{ price: { $eq: 50000 } }\`.

**Analogy:** filters are like the filter panel on Flipkart or Amazon – "Price: 20,000 to 80,000", "Brand: Apple OR Samsung", "Rating: 4★ & above". Each tick box becomes one operator in the query your backend sends to MongoDB.

Operators fall into groups:
- **Comparison:** $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin
- **Logical:** $and, $or, $nor, $not
- **Element:** $exists, $type
- **Evaluation:** $regex, $expr (compare two fields), $mod
- **Array:** $all, $size, $elemMatch`,
      tip: 'Operators like $gt must be keys inside an object. Writing db.products.find({ price > 50000 }) is a syntax error – this is not SQL.',
    },
    {
      heading: 'Comparison operators',
      content: `- \`$eq\` equal, \`$ne\` not equal
- \`$gt\` greater than, \`$gte\` greater than or equal
- \`$lt\` less than, \`$lte\` less than or equal
- \`$in\` value is in a list, \`$nin\` value is NOT in the list

You can put several operators on the **same field** to create a range: \`{ price: { $gte: 20000, $lte: 80000 } }\` (like SQL BETWEEN).

They work on numbers, strings (alphabetical), and **dates**: \`{ orderDate: { $gte: ISODate('2025-03-01') } }\`.

Important details:
- \`$ne\` and \`$nin\` also match documents where the field **does not exist**.
- \`$in\` is the clean replacement for many ORs on the same field: \`{ city: { $in: ['Pune', 'Mumbai'] } }\`.
- Comparison is **type-aware**: \`{ price: { $gt: 1000 } }\` will not match a price stored as the string "5000".`,
      syntax: `db.products.find({ price: { $gte: 20000, $lte: 80000 } })
db.products.find({ category: { $in: ['Audio', 'Wearables'] } })
db.products.find({ brand: { $nin: ['Apple', 'Samsung'] } })
db.orders.find({ orderDate: { $gte: ISODate('2025-03-01'), $lt: ISODate('2025-04-01') } })`,
    },
    {
      heading: 'Logical operators: $and, $or, $nor, $not',
      content: `**Implicit AND:** listing several fields in one filter already means AND: \`{ city: 'Pune', prime: true }\`.

**$and** is needed only when you must use the **same field or operator twice**, e.g. two $or groups:
\`{ $and: [ { $or: [...] }, { $or: [...] } ] }\`

**$or** takes an array of conditions; a document matches if **any** is true:
\`{ $or: [ { city: 'Pune' }, { age: { $gte: 35 } } ] }\`

**$nor** matches documents where **none** of the conditions is true.

**$not** negates **one operator expression** on a field: \`{ rating: { $not: { $gte: 4.5 } } }\` → rating below 4.5 **or rating missing**. (It is not a top-level operator – \`{ $not: {...} }\` at the top level is an error.)`,
      syntax: `db.customers.find({ $or: [ { city: 'Pune' }, { age: { $gte: 35 } } ] })
db.customers.find({ $nor: [ { prime: true }, { city: 'Mumbai' } ] })
db.products.find({ rating: { $not: { $gte: 4.5 } } })`,
      tip: 'For OR on the same field prefer $in – it is shorter and usually faster: { city: { $in: ["Pune","Mumbai"] } } instead of { $or: [{city:"Pune"},{city:"Mumbai"}] }.',
    },
    {
      heading: 'Element operators: $exists and $type',
      content: `Because MongoDB has a flexible schema, a field may be **missing** in some documents or have a **different type**.

- \`{ phone: { $exists: true } }\` – documents that have a phone field (even if its value is null)
- \`{ phone: { $exists: false } }\` – documents without the field
- \`{ phone: null }\` – matches documents where phone is null **or missing**
- \`{ price: { $type: 'string' } }\` – price stored as a string (common after a bad CSV import)
- \`$type\` accepts names ('double', 'int', 'string', 'bool', 'date', 'array', 'object', 'objectId', 'null') or the alias **'number'** for any numeric type

These are mainly used for **data cleaning** and for migrations ("find all users that do not have the new field yet").`,
      syntax: `db.products.find({ rating: { $exists: false } })
db.products.find({ price: { $type: 'string' } })
db.products.find({ price: { $type: 'number' } })`,
    },
    {
      heading: '$regex: pattern matching for search boxes',
      content: `\`$regex\` matches strings against a regular expression. You can write it as a regex literal or with the operator:

- \`{ name: /^R/ }\` – name starts with R (case-sensitive)
- \`{ name: { $regex: 'phone', $options: 'i' } }\` – contains "phone", case-insensitive
- \`{ email: /example\\.com$/ }\` – ends with example.com (escape the dot)

**Performance:** only a **case-sensitive prefix** regex like \`/^Red/\` can use an index efficiently. \`/phone/i\` must check every value (slow on big collections). For real search features use **Atlas Search** (Day 13) or a text index (Day 7).

**Security:** never put raw user input into a regex – a user could send \`.*\` or a catastrophic pattern. Escape special characters first (Day 14).`,
      syntax: `db.products.find({ name: /^Re/ })
db.products.find({ name: { $regex: 'book', $options: 'i' } })
db.customers.find({ email: { $regex: 'example\\\\.com$' } })`,
    },
    {
      heading: 'Querying arrays: contains, $all, $size, $elemMatch',
      content: `MongoDB makes array queries easy:

- \`{ tags: '5g' }\` – the array **contains** '5g'
- \`{ tags: ['5g', 'ios'] }\` – the array is **exactly** ['5g', 'ios'] (same order, same length) – rarely what you want
- \`{ tags: { $all: ['5g', 'android'] } }\` – contains **all** of these, in any order
- \`{ tags: { $in: ['ios', 'macos'] } }\` – contains **at least one** of these
- \`{ skills: { $size: 0 } }\` – array has exactly 0 items (\`$size\` takes only an exact number, not a range)
- \`{ 'tags.0': '5g' }\` – first element is '5g' (index with dot notation)

**Arrays of embedded documents** (order items, post comments) need care:
- \`{ 'comments.userId': 4, 'comments.text': /great/i }\` – each condition can be satisfied by **different** comments
- \`{ comments: { $elemMatch: { userId: 4, text: /great/i } } }\` – **one single comment** must satisfy **all** conditions

Use \`$elemMatch\` whenever several conditions must apply to the **same** array element.`,
      tip: 'For a size range use $expr or store a counter field (e.g. commentCount) – { $size: { $gt: 2 } } is NOT valid.',
    },
    {
      heading: 'Embedded documents and dot notation',
      content: `To query a field inside an embedded document use **dot notation** in quotes: \`{ 'marks.dsa': { $gte: 90 } }\`.

Compare with matching the **whole** embedded document: \`{ marks: { maths: 88, dsa: 92, dbms: 79 } }\` only matches if the object is **exactly** equal, including **field order** – fragile, so almost always use dot notation instead.

Dot notation also reaches into arrays of documents: \`{ 'items.productId': 12 }\` finds orders that contain product 12 in any item.

The same dotted paths are used in projection (\`{ 'marks.dsa': 1 }\`), sorting (\`sort({ 'marks.dsa': -1 })\`), updates (\`$set: { 'address.city': 'Pune' }\`) and indexes.`,
      syntax: `db.students.find({ 'marks.dsa': { $gte: 90 } })
db.orders.find({ 'items.productId': 12 })
db.students.find({ 'marks.maths': { $gt: 80 }, 'marks.dbms': { $gt: 80 } })`,
    },
  ],
  examples: [
    {
      title: 'Price range filter (Flipkart-style)',
      scenario: 'A customer sets the price slider to ₹20,000 – ₹80,000. Return the matching products with only name and price.',
      steps: [
        'Open the shop dataset',
        'Use $gte and $lte on the same price field',
        'Add a projection { name: 1, price: 1, _id: 0 }',
        'Run and check that every price is inside the range',
      ],
      code: `db.products.find(
  { price: { $gte: 20000, $lte: 80000 } },
  { name: 1, price: 1, _id: 0 }
)`,
      mongo: {
        dataset: 'shop',
        query: `db.products.find(
  { price: { $gte: 20000, $lte: 80000 } },
  { name: 1, price: 1, _id: 0 }
)`,
      },
      result: `{ name: 'iPhone 15', price: 79900 }
{ name: 'Galaxy S24', price: 74999 }
{ name: 'IdeaPad Slim 3', price: 45990 }
{ name: 'Inspiron 15', price: 52990 }
{ name: 'Sony WH-1000XM5', price: 29990 }
{ name: 'Apple Watch SE', price: 29900 }`,
      explanation: 'Two operators on one field are combined with AND, giving a BETWEEN-style range. Both ends are inclusive because we used $gte and $lte. In an Express API, the slider values come from req.query (strings!), so convert them with Number() before building the filter.',
    },
    {
      title: '$in with $ne: category list and in-stock only',
      scenario: 'The "Audio & Wearables" landing page should show products from either category that are currently in stock.',
      steps: [
        'Open the shop dataset',
        'Filter category with $in: ["Audio", "Wearables"]',
        'Add stock: { $ne: 0 } in the same filter (implicit AND)',
        'Project name and category',
      ],
      code: `db.products.find(
  { category: { $in: ['Audio', 'Wearables'] }, stock: { $ne: 0 } },
  { name: 1, category: 1, _id: 0 }
)`,
      mongo: {
        dataset: 'shop',
        query: `db.products.find(
  { category: { $in: ['Audio', 'Wearables'] }, stock: { $ne: 0 } },
  { name: 1, category: 1, _id: 0 }
)`,
      },
      result: `{ category: 'Audio', name: 'boAt Airdopes 141' }
{ category: 'Audio', name: 'Sony WH-1000XM5' }
{ category: 'Audio', name: 'JBL Flip 6' }
{ category: 'Wearables', name: 'Apple Watch SE' }
{ category: 'Wearables', name: 'Noise ColorFit Pro 5' }`,
      explanation: '`$in` matches any value in the list – cleaner than an $or on the same field. The second field condition is joined with AND automatically. A better "in stock" condition is `stock: { $gt: 0 }`, because $ne would also match documents with no stock field at all.',
    },
    {
      title: 'Logical operators: $or, $nor and $not',
      scenario: 'Marketing wants (1) customers from Pune OR aged 35+, (2) customers who are neither Prime members nor from Mumbai, and (3) mobiles rated below 4.5.',
      steps: [
        'Open the shop dataset',
        'Write an $or with two conditions for the first list',
        'Write a $nor for the second list',
        'Use $not with $gte on rating for the third list',
      ],
      code: `db.customers.find({ $or: [{ city: 'Pune' }, { age: { $gte: 35 } }] }, { name: 1, city: 1, age: 1, _id: 0 })
db.customers.find({ $nor: [{ prime: true }, { city: 'Mumbai' }] }, { name: 1, _id: 0 })
db.products.find({ category: 'Mobiles', rating: { $not: { $gte: 4.5 } } }, { name: 1, rating: 1, _id: 0 })`,
      mongo: {
        dataset: 'shop',
        query: `db.customers.find({ $or: [{ city: 'Pune' }, { age: { $gte: 35 } }] }, { name: 1, city: 1, age: 1, _id: 0 })
db.customers.find({ $nor: [{ prime: true }, { city: 'Mumbai' }] }, { name: 1, _id: 0 })
db.products.find({ category: 'Mobiles', rating: { $not: { $gte: 4.5 } } }, { name: 1, rating: 1, _id: 0 })`,
      },
      result: `{ age: 24, city: 'Pune', name: 'Asha Patil' }
{ age: 35, city: 'Pune', name: 'Imran Khan' }
{ age: 40, city: 'Delhi', name: 'Karan Mehta' }
{ name: 'Imran Khan' }
{ name: 'Rahul Joshi' }
{ name: 'Karan Mehta' }
{ name: 'Redmi Note 13', rating: 4.2 }`,
      explanation: 'Imran Khan matches the $or twice (Pune and 35) but is returned once. $nor keeps documents where every listed condition is false. $not wraps an operator expression on one field; it would also match mobiles that have no rating field at all.',
    },
    {
      title: 'Data cleaning with $type, $exists and $regex',
      scenario: 'A bad CSV import added a gift card with price stored as a string and no rating. Find it with $type and $exists, then find customers whose name starts with R and email ends with example.com.',
      steps: [
        'Open the shop dataset',
        'Insert the bad document (price: "500" as a string)',
        'Find products whose price is a string and products without a rating',
        'Use regex literals for the name prefix and the email suffix',
      ],
      code: `db.products.insertOne({ _id: 13, name: 'Gift Card', category: 'Vouchers', price: '500' })
db.products.find({ price: { $type: 'string' } }, { name: 1, price: 1 })
db.products.find({ rating: { $exists: false } }, { name: 1 })
db.customers.find({ name: /^R/, email: /example\\.com$/ }, { name: 1, _id: 0 })`,
      mongo: {
        dataset: 'shop',
        query: `db.products.insertOne({ _id: 13, name: 'Gift Card', category: 'Vouchers', price: '500' })
db.products.find({ price: { $type: 'string' } }, { name: 1, price: 1 })
db.products.find({ rating: { $exists: false } }, { name: 1 })
db.customers.find({ name: /^R/, email: /example\\.com$/ }, { name: 1, _id: 0 })`,
      },
      result: `{ acknowledged: true, insertedId: 13 }
{ _id: 13, name: 'Gift Card', price: '500' }
{ _id: 13, name: 'Gift Card' }
{ name: 'Ravi Kumar' }
{ name: 'Rahul Joshi' }`,
      explanation: 'A string price would silently disappear from every `$gt` / `$lt` query, so `$type` is the tool to find such records before fixing them (Day 4 shows how to update them). `/^R/` is an anchored, case-sensitive prefix – the kind of regex that can use an index. In the email pattern the dot is escaped so it matches a literal dot.',
    },
    {
      title: 'Arrays and embedded documents: $all, $size, $elemMatch, dot notation',
      scenario: 'The college wants full-stack students (React AND Node.js), students with exactly one skill and toppers in DSA. The blog team wants to understand why a comment search returns a wrong post.',
      steps: [
        'Open the college dataset and run the $all and $size queries',
        'Use dot notation "marks.dsa" for the DSA toppers',
        'Switch to the blog database with use blog',
        'Compare a dot-notation comment query with the same query using $elemMatch',
      ],
      code: `db.students.find({ skills: { $all: ['React', 'Node.js'] } }, { name: 1, skills: 1, _id: 0 })
db.students.find({ skills: { $size: 1 } }, { name: 1, skills: 1, _id: 0 })
db.students.find({ 'marks.dsa': { $gte: 90 } }, { name: 1, marks: 1, _id: 0 })
use blog
db.posts.find({ 'comments.userId': 4, 'comments.text': /great/i }, { title: 1, _id: 0 })
db.posts.countDocuments({ comments: { $elemMatch: { userId: 4, text: /great/i } } })`,
      mongo: {
        dataset: 'college',
        query: `db.students.find({ skills: { $all: ['React', 'Node.js'] } }, { name: 1, skills: 1, _id: 0 })
db.students.find({ skills: { $size: 1 } }, { name: 1, skills: 1, _id: 0 })
db.students.find({ 'marks.dsa': { $gte: 90 } }, { name: 1, marks: 1, _id: 0 })
use blog
db.posts.find({ 'comments.userId': 4, 'comments.text': /great/i }, { title: 1, _id: 0 })
db.posts.countDocuments({ comments: { $elemMatch: { userId: 4, text: /great/i } } })`,
      },
      result: `{ name: 'Neha Shah', skills: [ 'Node.js', 'MongoDB', 'React' ] }
{
  name: 'Karan Mehta',
  skills: [ 'Node.js', 'Express', 'MongoDB', 'React' ]
}
{ name: 'Ravi Kumar', skills: [ 'Java' ] }
{ name: 'Sneha More', skills: [ 'AutoCAD' ] }
{ name: 'Amit Verma', skills: [ 'C' ] }
{ marks: { maths: 88, dsa: 92, dbms: 79 }, name: 'Asha Patil' }
{ marks: { maths: 95, dsa: 90, dbms: 98 }, name: 'Neha Shah' }
{ marks: { maths: 90, dsa: 93, dbms: 85 }, name: 'Pooja Nair' }
switched to db blog
{ title: 'Understanding the Node.js Event Loop' }
0`,
      explanation: '`$all` ignores order and extra items. `$size: 1` needs an exact number. Dot notation reaches into the `marks` embedded document. In the blog post "Understanding the Node.js Event Loop", user 4 wrote "Very clear, thanks!" and user 2 wrote "Great diagrams" – the dot-notation query matches because each condition is satisfied by a **different** comment. `$elemMatch` requires one comment to satisfy both, so the correct count is 0.',
    },
  ],
  interview: [
    {
      q: 'List the MongoDB comparison operators.',
      a: '$eq (equal), $ne (not equal), $gt, $gte, $lt, $lte, $in (in a list), $nin (not in a list). Example: db.products.find({ price: { $gte: 20000, $lte: 80000 } }).',
      level: 'Easy',
    },
    {
      q: 'When do you need an explicit $and if multiple fields are already ANDed?',
      a: 'When the same field or the same operator must appear twice in one filter object, because a JS object cannot have duplicate keys. Example: two $or groups – { $and: [ { $or: [{a:1},{b:1}] }, { $or: [{c:1},{d:1}] } ] }.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between $or and $in?',
      a: '$in checks one field against a list of values: { city: { $in: ["Pune","Mumbai"] } }. $or combines arbitrary conditions on different fields: { $or: [{ city: "Pune" }, { age: { $gte: 35 } }] }. For one field, $in is shorter and generally more efficient.',
      level: 'Easy',
    },
    {
      q: 'What does { phone: null } match?',
      a: 'Documents where phone is null AND documents where the phone field does not exist. To match only explicit nulls use { phone: { $type: "null" } }; to match only missing fields use { phone: { $exists: false } }.',
      level: 'Hard',
    },
    {
      q: 'What is the difference between $ne and $not?',
      a: '$ne is a comparison: { status: { $ne: "cancelled" } }. $not negates another operator expression on a field: { rating: { $not: { $gte: 4.5 } } }. Both also match documents where the field is missing.',
      level: 'Medium',
    },
    {
      q: 'How do you find documents where an array contains all of several values?',
      a: 'Use $all: db.products.find({ tags: { $all: ["5g", "android"] } }). Order does not matter and the array may contain other values too.',
      level: 'Easy',
    },
    {
      q: 'Explain $elemMatch with an example where it changes the result.',
      a: 'Without $elemMatch, conditions on fields of an array of documents can be satisfied by different elements. { "comments.userId": 4, "comments.text": /great/i } matches a post where user 4 wrote one comment and someone else wrote "Great". { comments: { $elemMatch: { userId: 4, text: /great/i } } } requires the same comment to satisfy both. Use $elemMatch for multiple conditions on one element (e.g. an order item with productId 2 AND qty >= 2).',
      level: 'Hard',
    },
    {
      q: 'How do you query a field inside an embedded document?',
      a: 'Use dot notation in quotes: db.students.find({ "marks.dsa": { $gte: 90 } }). Matching the whole embedded document ({ marks: {...} }) needs an exact match of all fields in the same order, so dot notation is preferred.',
      level: 'Easy',
    },
    {
      q: 'Can $size be used with $gt to find arrays with more than 2 elements?',
      a: 'No, $size accepts only an exact number. Alternatives: check that index 2 exists – { "tags.2": { $exists: true } } (3+ elements); use $expr: { $expr: { $gt: [{ $size: "$tags" }, 2] } }; or maintain a count field and index it.',
      level: 'Hard',
    },
    {
      q: 'Does a $regex query use an index?',
      a: 'Only efficiently when it is a case-sensitive prefix expression like /^Red/. Case-insensitive (i option) or unanchored patterns like /phone/ must scan all index keys or documents. For search use Atlas Search, a text index, or a collation-based case-insensitive index with exact matches.',
      level: 'Medium',
    },
    {
      q: 'How do you query by date range?',
      a: 'Store dates as BSON Date and compare with ISODate (mongosh) or new Date() (Node): db.orders.find({ orderDate: { $gte: ISODate("2025-03-01"), $lt: ISODate("2025-04-01") } }). Use $lt on the first day of the next month to include the whole last day.',
      level: 'Medium',
    },
    {
      q: 'How do you compare two fields of the same document, e.g. stock less than a reorderLevel field?',
      a: 'Use $expr with aggregation expressions: db.products.find({ $expr: { $lt: ["$stock", "$reorderLevel"] } }). Normal query operators compare a field with a constant only.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Shop: find all orders placed in March 2025 that were paid by UPI. Show only _id, total and status.',
      hint: 'orderDate range with ISODate plus payment equality.',
      solution: `db.orders.find(
  { orderDate: { $gte: ISODate('2025-03-01'), $lt: ISODate('2025-04-01') }, payment: 'UPI' },
  { total: 1, status: 1 }
)
// 1006 (delivered, 109800) and 1008 (delivered, 55485)`,
    },
    {
      task: 'College: find students who are from Pune or Mumbai AND have a cgpa of at least 7. Return name, city and cgpa.',
      hint: '$in for the cities plus $gte on cgpa.',
      solution: `db.students.find(
  { city: { $in: ['Pune', 'Mumbai'] }, cgpa: { $gte: 7 } },
  { name: 1, city: 1, cgpa: 1, _id: 0 }
)
// Asha Patil (Pune 8.9), Ravi Kumar (Mumbai 7.2), Sneha More (Mumbai 7.5)`,
    },
    {
      task: 'Shop: find orders that contain an item with productId 2 bought at a price above 70000, and orders that contain product 12 anywhere.',
      hint: 'Use $elemMatch for the first, dot notation for the second.',
      solution: `db.orders.find({ items: { $elemMatch: { productId: 2, price: { $gt: 70000 } } } }, { customerId: 1, status: 1 })
// 1005 and 1010
db.orders.find({ 'items.productId': 12 }, { customerId: 1, total: 1 })
// 1004 and 1008`,
    },
    {
      task: 'Blog: find published posts tagged "node" or "mongodb" that have at least one comment, and users whose username ends with "_js" or "_ui".',
      hint: '$in on tags, comments.0 with $exists, regex alternation /_(js|ui)$/.',
      solution: `db.posts.find(
  { published: true, tags: { $in: ['node', 'mongodb'] }, 'comments.0': { $exists: true } },
  { title: 1, _id: 0 }
)
db.users.find({ username: /_(js|ui)$/ }, { username: 1, _id: 0 })`,
    },
    {
      task: 'College: find students who have NO skills or whose DSA mark is 0, and students that have both "Python" and "SQL" skills.',
      hint: '$or with $size: 0 and "marks.dsa": 0; $all for the second query.',
      solution: `db.students.find(
  { $or: [{ skills: { $size: 0 } }, { 'marks.dsa': 0 }] },
  { name: 1, year: 1, _id: 0 }
)
// Rahul Joshi and Amit Verma (1st years)
db.students.find({ skills: { $all: ['Python', 'SQL'] } }, { name: 1, _id: 0 })
// Priya Desai`,
    },
  ],
  quiz: [
    {
      question: 'Which filter returns products priced from 10,000 to 30,000 inclusive?',
      options: [
        '{ price: { $gt: 10000, $lt: 30000 } }',
        '{ price: { $gte: 10000, $lte: 30000 } }',
        '{ price: { $between: [10000, 30000] } }',
        '{ $and: { price: 10000, price: 30000 } }',
      ],
      answer: 1,
      explanation: '$gte and $lte include both ends. There is no $between operator in MongoDB.',
    },
    {
      question: 'Which query finds students whose skills array contains BOTH "React" and "Node.js"?',
      options: [
        '{ skills: [\'React\', \'Node.js\'] }',
        '{ skills: { $in: [\'React\', \'Node.js\'] } }',
        '{ skills: { $size: 2 } }',
        '{ skills: { $all: [\'React\', \'Node.js\'] } }',
      ],
      answer: 3,
      explanation: '$all requires every listed value. $in needs only one, and the plain array form requires an exact array match.',
    },
    {
      question: 'What does { email: { $exists: false } } return?',
      options: [
        'Documents that do not have an email field',
        'Documents whose email is an empty string',
        'Documents whose email is null only',
        'All documents',
      ],
      answer: 0,
      explanation: '$exists: false matches documents where the field is missing.',
    },
    {
      question: 'When must you use $elemMatch?',
      options: [
        'Whenever you query any array',
        'To count the elements of an array',
        'When several conditions must be true for the same array element',
        'To sort an array',
      ],
      answer: 2,
      explanation: 'Without $elemMatch, different array elements may satisfy different conditions.',
    },
    {
      question: 'Which $regex is most likely to use an index efficiently?',
      options: ['/phone/i', '/^Red/', '/note$/', '/.*air.*/'],
      answer: 1,
      explanation: 'A case-sensitive, left-anchored prefix regex can use index bounds. Unanchored or case-insensitive patterns scan everything.',
    },
  ],
};
