export default {
  id: 'day-04-crud-update-operators-upsert-delete-pagination',
  title: 'CRUD Part 2: Update Operators ($set, $inc, $push, $pull, positional $ ...), Upsert, replaceOne, Delete, Sort/Skip/Limit and Pagination',
  module: 'Module 1: MongoDB Basics',
  day: 4,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Today you finish CRUD: changing documents with update operators (fields and arrays), creating-if-missing with upsert, replacing and deleting documents, and returning results page by page with sort, skip and limit – exactly what every admin panel and product listing API needs.',
  objectives: [
    'Use updateOne / updateMany with $set, $unset, $inc, $mul, $rename and read the result object',
    'Change arrays with $push (+ $each), $addToSet, $pull, $pop and the positional $ / $[] operators',
    'Use upsert, replaceOne and findOneAndUpdate correctly',
    'Delete documents safely with deleteOne / deleteMany',
    'Implement pagination with sort, skip and limit and know its limits (range-based pagination)',
  ],
  theory: [
    {
      heading: 'updateOne and updateMany: filter + update operators',
      content: `An update takes **two** main arguments: a **filter** (which documents) and an **update document** (what to change):

\`db.products.updateOne({ _id: 7 }, { $set: { price: 1199 } })\`

- **updateOne** changes the **first** matching document.
- **updateMany** changes **all** matching documents.

Both return a result object:
\`{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }\`

- **matchedCount** – how many documents matched the filter
- **modifiedCount** – how many actually changed (setting a field to the value it already has counts as matched but **not** modified)

The update document **must use operators** like \`$set\`. Passing a plain object (\`{ price: 1199 }\`) to updateOne is an error in modern MongoDB – to replace a whole document use \`replaceOne\`.

**Analogy:** \`$set\` is like correcting one box in a form with white-out; \`replaceOne\` is throwing the form away and filling a fresh one (only the _id stays).`,
      tip: 'Always test the filter with find() first. updateMany({}, ...) with an empty filter updates EVERY document in the collection.',
    },
    {
      heading: 'Field update operators',
      content: `- \`$set\` – set a field (creates it if missing). Works with dot notation: \`{ $set: { 'address.city': 'Pune' } }\`
- \`$unset\` – remove a field: \`{ $unset: { rating: '' } }\` (the value is ignored)
- \`$inc\` – add a number (use a negative number to subtract): \`{ $inc: { stock: -1, sold: 1 } }\`. **Atomic** – safe when 100 users buy at the same time.
- \`$mul\` – multiply: \`{ $mul: { price: 0.9 } }\` (10% discount)
- \`$rename\` – rename a field: \`{ $rename: { stock: 'qty' } }\`
- \`$min\` / \`$max\` – set only if the new value is lower / higher (e.g. keep the lowest price ever)
- \`$currentDate\` – set a field to the current date: \`{ $currentDate: { updatedAt: true } }\`
- \`$setOnInsert\` – set fields **only when an upsert inserts** a new document

You can combine several operators in one update, but **not the same field in two operators** (e.g. $set and $inc on stock together is a conflict error).`,
      syntax: `db.products.updateOne(
  { _id: 7 },
  { $set: { price: 1199 }, $inc: { stock: -2 }, $currentDate: { updatedAt: true } }
)
db.products.updateMany({ category: 'Audio' }, { $mul: { price: 0.9 } })
db.products.updateMany({}, { $rename: { rating: 'avgRating' } })
db.products.updateOne({ _id: 7 }, { $unset: { tags: '' } })`,
      tip: 'Why $inc instead of "read stock, subtract 1 in Node, save"? Two requests may read the same old value and both save stock - 1 (a lost update). $inc runs atomically on the server.',
    },
    {
      heading: 'Array update operators',
      content: `- \`$push\` – append a value: \`{ $push: { tags: 'sale' } }\`
- \`$push\` + \`$each\` – append several values; add \`$sort\` and \`$slice\` to keep only the latest N: \`{ $push: { recent: { $each: [x], $slice: -10 } } }\`
- \`$addToSet\` – append **only if not already present** (no duplicates). Also works with \`$each\`.
- \`$pull\` – remove all elements that match a value or condition: \`{ $pull: { comments: { userId: 4 } } }\`
- \`$pop\` – remove the **last** (\`1\`) or **first** (\`-1\`) element
- \`$pullAll\` – remove all listed values

**Positional operators** for updating elements **inside** arrays:
- \`$\` – the **first element matched by the filter**: \`updateOne({ _id: 1001, 'items.productId': 7 }, { $set: { 'items.$.qty': 5 } })\`. The array field must appear in the filter.
- \`$[]\` – **all** elements: \`{ $inc: { 'items.$[].qty': 1 } }\`
- \`$[elem]\` + \`arrayFilters\` – all elements that match a condition: \`{ $set: { 'items.$[i].price': 999 } }, { arrayFilters: [ { 'i.productId': 7 } ] }\``,
      syntax: `// positional $ – update the qty of product 7 inside order 1001
db.orders.updateOne(
  { _id: 1001, 'items.productId': 7 },
  { $set: { 'items.$.qty': 5 } }
)

// arrayFilters – give 10% off on product 12 in every order
db.orders.updateMany(
  { 'items.productId': 12 },
  { $mul: { 'items.$[it].price': 0.9 } },
  { arrayFilters: [ { 'it.productId': 12 } ] }
)`,
      tip: 'The MongoDB Shell Lab supports $push, $pull, $addToSet, $pop and $[], but not the single positional $ or arrayFilters – run those two in mongosh or Compass.',
    },
    {
      heading: 'Upsert, replaceOne and findOneAndUpdate',
      content: `**Upsert = update + insert.** With \`{ upsert: true }\`, if no document matches, MongoDB **inserts** one built from the filter's equality fields plus the update. Perfect for "create or update" logic: user settings, daily counters, cart lines.

\`db.customers.updateOne({ email: 'zoya@example.com' }, { $set: { city: 'Surat' }, $setOnInsert: { prime: false } }, { upsert: true })\`

**replaceOne(filter, newDoc)** replaces the whole document except \`_id\`. Fields not in newDoc are **lost** – use it only when you really have the complete new version (e.g. a PUT request that sends the full resource).

**findOneAndUpdate(filter, update, options)** updates one document **and returns it** – before the change by default, or after with \`{ returnDocument: 'after' }\` (Mongoose: \`{ new: true }\`). Use it for counters ("give me the next invoice number") or when the API must respond with the updated object. Similar: \`findOneAndReplace\`, \`findOneAndDelete\`.`,
      points: [
        'PATCH (partial change) → updateOne + $set',
        'PUT (full replacement) → replaceOne',
        'Create-or-update → updateOne with upsert: true',
        'Need the updated document back → findOneAndUpdate with returnDocument: "after"',
      ],
    },
    {
      heading: 'Deleting documents',
      content: `- \`deleteOne(filter)\` – deletes the first match → \`{ acknowledged: true, deletedCount: 1 }\`
- \`deleteMany(filter)\` – deletes all matches
- \`deleteMany({})\` – deletes **every** document but keeps the collection and its indexes
- \`db.collection.drop()\` – removes the collection **and its indexes** completely

**Soft delete** is very common in real apps: instead of deleting, set \`{ $set: { isDeleted: true, deletedAt: new Date() } }\` and filter \`{ isDeleted: { $ne: true } }\` in normal queries. You keep history, can "undo", and avoid breaking references from other documents.

For automatic deletion of old data (sessions, OTPs, logs) use a **TTL index** (Day 7).`,
      tip: 'Before running deleteMany in production, run countDocuments with the same filter and check the number. There is no undo button (unless you restore from a backup).',
    },
    {
      heading: 'sort, skip, limit and pagination',
      content: `Cursor methods shape the result:
- \`sort({ price: -1 })\` – 1 = ascending, -1 = descending; several keys = tie-breakers: \`sort({ category: 1, price: -1 })\`
- \`limit(n)\` – return at most n documents
- \`skip(n)\` – skip the first n documents

MongoDB always applies them in the order **sort → skip → limit**, no matter how you chain them.

**Page-number pagination** (page starts at 1):

\`skip = (page - 1) * pageSize\`, \`limit = pageSize\`

Page 2 with 4 items per page → \`sort({ price: -1 }).skip(4).limit(4)\`. Also return \`total = countDocuments(filter)\` so the frontend can show "Page 2 of 3".

Rules for correct pagination:
1. **Always sort** – without sort the order is not guaranteed, so items can repeat or disappear between pages.
2. Sort on a **unique** field or add \`_id\` as a tie-breaker: \`sort({ price: -1, _id: 1 })\`.
3. Large skip values are slow (the server still walks over skipped documents). For infinite scroll on big collections use **range-based (keyset) pagination**: \`find({ _id: { $gt: lastSeenId } }).sort({ _id: 1 }).limit(20)\`.`,
      syntax: `const page = 2, pageSize = 4;
db.products.find({}, { name: 1, price: 1 })
  .sort({ price: -1, _id: 1 })
  .skip((page - 1) * pageSize)
  .limit(pageSize)`,
    },
  ],
  examples: [
    {
      title: 'Field operators: $set, $inc, $mul, $rename, $unset',
      scenario: 'The shop drops the price of boAt Airdopes, sells 2 units, then runs a 10% Audio sale. Later the team renames stock to qty and removes rating from that product.',
      steps: [
        'Open the shop dataset',
        'updateOne with $set on price and $inc on stock',
        'updateMany with $mul on price for all Audio products, and print how many changed',
        'updateOne with $rename and $unset, then findOne to see the final document',
      ],
      code: `db.products.updateOne({ _id: 7 }, { $set: { price: 1199 }, $inc: { stock: -2 } })
const sale = db.products.updateMany({ category: 'Audio' }, { $mul: { price: 0.9 }, $set: { onSale: true } })
print('Audio products modified:', sale.modifiedCount)
db.products.updateOne({ _id: 7 }, { $rename: { stock: 'qty' }, $unset: { rating: '' } })
db.products.findOne({ _id: 7 })`,
      mongo: {
        dataset: 'shop',
        query: `db.products.updateOne({ _id: 7 }, { $set: { price: 1199 }, $inc: { stock: -2 } })
const sale = db.products.updateMany({ category: 'Audio' }, { $mul: { price: 0.9 }, $set: { onSale: true } })
print('Audio products modified:', sale.modifiedCount)
db.products.updateOne({ _id: 7 }, { $rename: { stock: 'qty' }, $unset: { rating: '' } })
db.products.findOne({ _id: 7 })`,
      },
      result: `{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
Audio products modified: 3
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
{
  _id: 7,
  name: 'boAt Airdopes 141',
  brand: 'boAt',
  category: 'Audio',
  price: 1079.1,
  tags: [ 'wireless', 'budget' ],
  onSale: true,
  qty: 138
}`,
      explanation: 'The first update both sets price and decrements stock (140 → 138) atomically. `$mul` applied 0.9 to all 3 Audio products (1199 → 1079.1). In real money code use whole paise or Decimal128 to avoid floating-point decimals. `$rename` moved the value 138 into `qty`, and `$unset` removed `rating` entirely.',
    },
    {
      title: 'Array operators: $push with $each, $addToSet, $pull, $pop, $[]',
      scenario: 'On the blog, two readers comment on "React Hooks Cheat Sheet" and it gets a like. Then a moderator removes user 4\'s comment and the author tidies the tags. In the shop, every item in order 1001 gets one extra free unit.',
      steps: [
        'Open the blog dataset',
        'Push two comments with $each and increment likes in one update',
        'Use $addToSet with $each (only "frontend" is new), then $pull the comment by userId 4 and $pop the last tag',
        'Switch to shop with use shop and use $[] to increase qty of every item',
      ],
      code: `db.posts.updateOne({ _id: 3 }, { $push: { comments: { $each: [{ userId: 1, text: 'Nice!' }, { userId: 4, text: 'Saved' }] } }, $inc: { likes: 1 } })
db.posts.updateOne({ _id: 3 }, { $addToSet: { tags: { $each: ['react', 'frontend'] } } })
db.posts.updateOne({ _id: 3 }, { $pull: { comments: { userId: 4 } } })
db.posts.updateOne({ _id: 3 }, { $pop: { tags: 1 } })
db.posts.findOne({ _id: 3 }, { tags: 1, likes: 1, comments: 1 })
use shop
db.orders.updateOne({ _id: 1001 }, { $inc: { 'items.$[].qty': 1 } })
db.orders.findOne({ _id: 1001 }, { items: 1 })`,
      mongo: {
        dataset: 'blog',
        query: `db.posts.updateOne({ _id: 3 }, { $push: { comments: { $each: [{ userId: 1, text: 'Nice!' }, { userId: 4, text: 'Saved' }] } }, $inc: { likes: 1 } })
db.posts.updateOne({ _id: 3 }, { $addToSet: { tags: { $each: ['react', 'frontend'] } } })
db.posts.updateOne({ _id: 3 }, { $pull: { comments: { userId: 4 } } })
db.posts.updateOne({ _id: 3 }, { $pop: { tags: 1 } })
db.posts.findOne({ _id: 3 }, { tags: 1, likes: 1, comments: 1 })
use shop
db.orders.updateOne({ _id: 1001 }, { $inc: { 'items.$[].qty': 1 } })
db.orders.findOne({ _id: 1001 }, { items: 1 })`,
      },
      result: `{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
{
  _id: 3,
  comments: [ { userId: 1, text: 'Nice!' } ],
  likes: 411,
  tags: [ 'react', 'hooks' ]
}
switched to db shop
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
{
  _id: 1001,
  items: [
    { productId: 3, qty: 2, price: 17999 },
    { productId: 7, qty: 3, price: 1299 }
  ]
}`,
      explanation: '`$push` + `$each` appends both comments. `$addToSet` skipped "react" (already there) and added "frontend". `$pull` with a condition removed every comment whose userId is 4. `$pop: { tags: 1 }` removed the last tag ("frontend"), leaving the original two. `$[]` applies the update to all elements of `items`. To change only one element you would use the positional `$` (see theory) in mongosh.',
    },
    {
      title: 'Upsert, replaceOne and findOneAndUpdate',
      scenario: 'A checkout form saves a customer by email: update if the customer exists, otherwise create them. An admin replaces an old product completely, and the stock service needs the updated stock value back after selling 2 JBL speakers.',
      steps: [
        'Open the shop dataset',
        'updateOne with { upsert: true } and $setOnInsert for a new email',
        'replaceOne the product with _id 6 and read it back – the old fields are gone',
        'findOneAndUpdate with returnDocument: "after" to get the new stock',
      ],
      code: `db.customers.updateOne(
  { email: 'zoya@example.com' },
  { $set: { city: 'Surat' }, $setOnInsert: { _id: 109, name: 'Zoya Ansari', prime: false } },
  { upsert: true }
)
db.customers.findOne({ email: 'zoya@example.com' })
db.products.replaceOne({ _id: 6 }, { name: 'Inspiron 15 (2025)', brand: 'Dell', price: 49990 })
db.products.findOne({ _id: 6 })
db.products.findOneAndUpdate({ _id: 9 }, { $inc: { stock: -2 } }, { returnDocument: 'after' })`,
      mongo: {
        dataset: 'shop',
        query: `db.customers.updateOne(
  { email: 'zoya@example.com' },
  { $set: { city: 'Surat' }, $setOnInsert: { _id: 109, name: 'Zoya Ansari', prime: false } },
  { upsert: true }
)
db.customers.findOne({ email: 'zoya@example.com' })
db.products.replaceOne({ _id: 6 }, { name: 'Inspiron 15 (2025)', brand: 'Dell', price: 49990 })
db.products.findOne({ _id: 6 })
db.products.findOneAndUpdate({ _id: 9 }, { $inc: { stock: -2 } }, { returnDocument: 'after' })`,
      },
      result: `{
  acknowledged: true,
  insertedId: 109,
  matchedCount: 0,
  modifiedCount: 0,
  upsertedCount: 1
}
{
  _id: 109,
  email: 'zoya@example.com',
  city: 'Surat',
  name: 'Zoya Ansari',
  prime: false
}
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
{ _id: 6, name: 'Inspiron 15 (2025)', brand: 'Dell', price: 49990 }
{
  _id: 9,
  name: 'JBL Flip 6',
  brand: 'JBL',
  category: 'Audio',
  price: 9999,
  stock: 23,
  rating: 4.4,
  tags: [ 'wireless', 'speaker' ]
}`,
      explanation: 'No customer had that email, so the upsert inserted one: the equality field from the filter (email) + $set + $setOnInsert. `upsertedCount: 1` and the new id appear in the result. If you run the same upsert again it only updates city – $setOnInsert is skipped. replaceOne kept only `_id` and the new fields (category, stock, rating, tags were removed). findOneAndUpdate returned the document after the change (stock 25 → 23).',
    },
    {
      title: 'deleteOne, deleteMany and soft delete',
      scenario: 'The shop removes cancelled orders, deletes one specific pending order and soft-deletes a discontinued product instead of removing it.',
      steps: [
        'Open the shop dataset',
        'Count cancelled orders first, then deleteMany with the same filter',
        'deleteOne the order with _id 1012',
        'Soft-delete product 6 with $set isDeleted: true and count the active products',
      ],
      code: `db.orders.countDocuments({ status: 'cancelled' })
db.orders.deleteMany({ status: 'cancelled' })
db.orders.deleteOne({ _id: 1012 })
db.orders.countDocuments()
db.products.updateOne({ _id: 6 }, { $set: { isDeleted: true } })
db.products.countDocuments({ isDeleted: { $ne: true } })`,
      mongo: {
        dataset: 'shop',
        query: `db.orders.countDocuments({ status: 'cancelled' })
db.orders.deleteMany({ status: 'cancelled' })
db.orders.deleteOne({ _id: 1012 })
db.orders.countDocuments()
db.products.updateOne({ _id: 6 }, { $set: { isDeleted: true } })
db.products.countDocuments({ isDeleted: { $ne: true } })`,
      },
      result: `1
{ acknowledged: true, deletedCount: 1 }
{ acknowledged: true, deletedCount: 1 }
10
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
11`,
      explanation: 'Counting with the same filter before deleting is a cheap safety check. `deletedCount` tells you how many were removed (12 orders → 10). The soft delete keeps product 6 in the database (so old orders still refer to a real product) while normal queries exclude it with `isDeleted: { $ne: true }` – which also matches products that do not have the field yet.',
    },
    {
      title: 'Pagination with sort, skip and limit',
      scenario: 'The product listing API shows 4 products per page, most expensive first. Return page 2 and the total so the UI can show "Page 2 of 3".',
      steps: [
        'Open the shop dataset',
        'Store page and pageSize in const variables',
        'Sort by price descending with _id as a tie-breaker, skip (page - 1) * pageSize, limit pageSize',
        'Print the total pages using countDocuments',
      ],
      code: `const page = 2
const pageSize = 4
db.products.find({}, { name: 1, price: 1 }).sort({ price: -1, _id: 1 }).skip((page - 1) * pageSize).limit(pageSize)
const total = db.products.countDocuments()
print('Page', page, 'of', Math.ceil(total / pageSize), '- total products:', total)`,
      mongo: {
        dataset: 'shop',
        query: `const page = 2
const pageSize = 4
db.products.find({}, { name: 1, price: 1 }).sort({ price: -1, _id: 1 }).skip((page - 1) * pageSize).limit(pageSize)
const total = db.products.countDocuments()
print('Page', page, 'of', Math.ceil(total / pageSize), '- total products:', total)`,
      },
      result: `{ _id: 5, name: 'IdeaPad Slim 3', price: 45990 }
{ _id: 8, name: 'Sony WH-1000XM5', price: 29990 }
{ _id: 10, name: 'Apple Watch SE', price: 29900 }
{ _id: 3, name: 'Redmi Note 13', price: 17999 }
Page 2 of 3 - total products: 12`,
      explanation: 'Page 1 holds the 4 most expensive products; skip(4) jumps over them and limit(4) returns the next four. The `_id` tie-breaker makes the order deterministic even if two prices are equal. For very deep pages, switch to range-based pagination: remember the last price/_id and query `{ price: { $lt: lastPrice } }` instead of using skip.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between updateOne, updateMany and replaceOne?',
      a: 'updateOne applies update operators to the first matching document; updateMany to all matching documents. replaceOne replaces the entire first matching document with a new one (only _id is kept) and does not accept operators.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between matchedCount and modifiedCount?',
      a: 'matchedCount is how many documents matched the filter; modifiedCount is how many were actually changed. If you $set a field to the value it already has, the document is matched but not modified.',
      level: 'Easy',
    },
    {
      q: 'What is an upsert? Give a real use case.',
      a: 'An update with { upsert: true } that inserts a new document when nothing matches the filter. Use cases: saving user settings, "add to cart" (increase qty or create the line), daily page-view counters: updateOne({ page, day }, { $inc: { views: 1 } }, { upsert: true }). Use $setOnInsert for fields that should be set only on creation.',
      level: 'Medium',
    },
    {
      q: 'Why use $inc instead of reading a value, changing it in Node.js and saving it?',
      a: 'Because $inc is atomic on the server. The read-modify-write approach has a race condition: two concurrent requests can read the same stock, both subtract 1 and both save, losing one update. Single-document updates in MongoDB are atomic.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between $push and $addToSet?',
      a: '$push always appends (duplicates allowed). $addToSet appends only if the value is not already in the array – like a set. Both support $each to add multiple values; $push additionally supports $sort, $slice and $position.',
      level: 'Easy',
    },
    {
      q: 'How do you remove an element from an array?',
      a: '$pull removes all elements equal to a value or matching a condition ({ $pull: { comments: { userId: 4 } } }); $pullAll removes all listed values; $pop removes the first (-1) or last (1) element; $unset on "arr.2" only sets that element to null.',
      level: 'Medium',
    },
    {
      q: 'Explain the positional $ operator, $[] and $[identifier].',
      a: '$ updates the first array element matched by the query filter (the array field must be in the filter): { "items.productId": 7 } → { $set: { "items.$.qty": 5 } }. $[] updates all elements. $[id] with arrayFilters updates all elements that match a condition: { $set: { "items.$[i].price": 999 } }, { arrayFilters: [{ "i.productId": 7 }] }.',
      level: 'Hard',
    },
    {
      q: 'What does findOneAndUpdate return, and how do you get the updated document?',
      a: 'By default it returns the document as it was BEFORE the update. Pass { returnDocument: "after" } in mongosh/driver, or { new: true } in Mongoose, to get the updated version. It is atomic, so it is used for counters and sequence generators.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between deleteMany({}) and drop()?',
      a: 'deleteMany({}) removes every document one by one but keeps the collection, its indexes and validation rules. drop() removes the collection with all indexes – much faster for clearing huge collections, but you must recreate indexes afterwards.',
      level: 'Medium',
    },
    {
      q: 'What is soft delete and why is it used?',
      a: 'Instead of physically deleting, you set a flag like isDeleted: true (and deletedAt). Benefits: undo/restore, audit history, references from other collections stay valid. Downside: every query must exclude deleted documents (Mongoose query middleware or a partial index can help).',
      level: 'Medium',
    },
    {
      q: 'How do you implement pagination in MongoDB? What are the problems with skip?',
      a: 'Page-based: sort by a stable key, skip((page-1)*size).limit(size), and return countDocuments for total pages. Problems: skip still walks over all skipped documents, so deep pages get slow, and inserts between requests can shift items. For large data use range/keyset pagination: find({ _id: { $gt: lastId } }).sort({ _id: 1 }).limit(size).',
      level: 'Hard',
    },
    {
      q: 'In what order are sort, skip and limit applied?',
      a: 'Always sort first, then skip, then limit – regardless of the order you chain them in the shell. db.c.find().limit(5).sort({ a: 1 }) still sorts all matches and then takes 5.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'College: Rahul Joshi (_id 6) learned "Python" and "Git". Add them without creating duplicates, increase his year to 2 and set his DSA mark to 72. Show his updated document.',
      hint: '$addToSet with $each, $inc and $set with dot notation in one updateOne.',
      solution: `db.students.updateOne(
  { _id: 6 },
  {
    $addToSet: { skills: { $each: ['Python', 'Git'] } },
    $inc: { year: 1 },
    $set: { 'marks.dsa': 72 }
  }
)
db.students.findOne({ _id: 6 })`,
    },
    {
      task: 'Shop: increase the price of all Apple products by 5% and mark them { priceRevised: true }. Then show name and price of Apple products sorted by price descending.',
      hint: 'updateMany with $mul: { price: 1.05 } and $set.',
      solution: `db.products.updateMany({ brand: 'Apple' }, { $mul: { price: 1.05 }, $set: { priceRevised: true } })
db.products.find({ brand: 'Apple' }, { name: 1, price: 1, _id: 0 }).sort({ price: -1 })`,
    },
    {
      task: 'Shop: in order 1004, change the quantity of product 12 to 2 using the positional $ operator and recalculate the total (3999 + 2 × 9495 = 22989). Run it in mongosh or Compass.',
      hint: 'Include "items.productId": 12 in the filter.',
      solution: `db.orders.updateOne(
  { _id: 1004, 'items.productId': 12 },
  { $set: { 'items.$.qty': 2, total: 22989 } }
)
db.orders.findOne({ _id: 1004 }, { items: 1, total: 1 })`,
    },
    {
      task: 'Blog: implement a "like counter per day" using upsert: increase the count for post 1 on 2025-06-01 in a collection postStats. Run it twice and show that only one document exists with count 2.',
      hint: 'updateOne({ postId, day }, { $inc: { count: 1 } }, { upsert: true }). Give an _id inside $setOnInsert so the result is predictable.',
      solution: `db.postStats.updateOne(
  { postId: 1, day: '2025-06-01' },
  { $inc: { count: 1 }, $setOnInsert: { _id: 1 } },
  { upsert: true }
)
db.postStats.updateOne(
  { postId: 1, day: '2025-06-01' },
  { $inc: { count: 1 }, $setOnInsert: { _id: 1 } },
  { upsert: true }
)
db.postStats.find()
// { _id: 1, postId: 1, day: '2025-06-01', count: 2 }`,
    },
    {
      task: 'College: return page 3 of students (3 per page) sorted by cgpa descending showing only name and cgpa. Then delete all 1st-year students and print how many were deleted.',
      hint: 'skip((3-1)*3).limit(3); deleteMany returns deletedCount.',
      solution: `db.students.find({}, { name: 1, cgpa: 1, _id: 0 }).sort({ cgpa: -1, _id: 1 }).skip(6).limit(3)
// page 3 = 7th–9th best cgpa: Sneha More 7.5, Ravi Kumar 7.2, Imran Khan 6.8
const r = db.students.deleteMany({ year: 1 })
print('Deleted:', r.deletedCount)   // 2 (Rahul Joshi, Amit Verma)`,
    },
  ],
  quiz: [
    {
      question: 'Which update removes the field "rating" from a document?',
      options: [
        '{ $set: { rating: null } }',
        '{ $pull: { rating: 1 } }',
        '{ $unset: { rating: \'\' } }',
        '{ $delete: \'rating\' }',
      ],
      answer: 2,
      explanation: '$unset removes the field. $set: null keeps the field with a null value. $pull is for arrays and there is no $delete operator.',
    },
    {
      question: 'tags is ["5g", "ios"]. What is tags after { $addToSet: { tags: "ios" } }?',
      options: ['["5g", "ios"]', '["5g", "ios", "ios"]', '["ios"]', 'An error is thrown'],
      answer: 0,
      explanation: '$addToSet adds the value only if it is not already present, so the array is unchanged (modifiedCount 0).',
    },
    {
      question: 'An updateOne with { upsert: true } finds no matching document. What happens?',
      options: [
        'Nothing; matchedCount is 0',
        'An error is thrown',
        'All documents are updated',
        'A new document is inserted from the filter equality fields plus the update',
      ],
      answer: 3,
      explanation: 'Upsert inserts a new document built from the filter equality fields and the update operators (and $setOnInsert).',
    },
    {
      question: 'For page 5 with 10 items per page, which cursor chain is correct?',
      options: [
        '.sort({ _id: 1 }).skip(40).limit(10)',
        '.sort({ _id: 1 }).skip(50).limit(10)',
        '.limit(50).skip(10)',
        '.skip(5).limit(10)',
      ],
      answer: 0,
      explanation: 'skip = (page - 1) × pageSize = 4 × 10 = 40, then limit 10. Always sort for stable pages.',
    },
    {
      question: 'What does findOneAndUpdate return by default?',
      options: [
        'The update result with matchedCount',
        'The document as it was before the update',
        'The document after the update',
        'true or false',
      ],
      answer: 1,
      explanation: 'By default the original (pre-update) document is returned. Use returnDocument: "after" (or { new: true } in Mongoose) for the updated one.',
    },
  ],
};
