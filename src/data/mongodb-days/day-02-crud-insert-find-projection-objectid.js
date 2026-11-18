export default {
  id: 'day-02-crud-insert-find-projection-objectid',
  title: 'CRUD Part 1: insertOne, insertMany, find, findOne, Projection, _id and ObjectId',
  module: 'Module 1: MongoDB Basics',
  day: 2,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'CRUD = Create, Read, Update, Delete. Today you master the C and R: inserting one or many documents, reading them back with find() and findOne(), choosing fields with projection, and understanding the _id field and ObjectId.',
  objectives: [
    'Insert documents with insertOne() and insertMany() and read the result objects',
    'Explain ordered vs unordered insertMany and what happens on a duplicate _id',
    'Read data with find() and findOne() using simple equality filters',
    'Return only the fields you need with inclusion and exclusion projections',
    'Explain the _id field, ObjectId structure and when to use your own _id values',
  ],
  theory: [
    {
      heading: 'What is CRUD and how mongosh methods are named',
      content: `Every application does four things with data – **C**reate, **R**ead, **U**pdate, **D**elete. MongoDB gives each a clear method on a collection:

| Operation | Methods |
|---|---|
| Create | \`insertOne()\`, \`insertMany()\` |
| Read | \`find()\`, \`findOne()\`, \`countDocuments()\` |
| Update | \`updateOne()\`, \`updateMany()\`, \`replaceOne()\` (Day 4) |
| Delete | \`deleteOne()\`, \`deleteMany()\` (Day 4) |

The pattern is always \`db.<collection>.<method>(arguments)\`. If the collection does not exist, the first insert **creates it automatically** (and the database too).

**Analogy:** think of a collection as a register in a college office. Create = writing a new entry, Read = searching the register, Update = correcting an entry, Delete = striking it out.

The old methods \`insert()\`, \`update()\` and \`remove()\` are **deprecated** – always use the \`One\` / \`Many\` versions in new code and in interviews.`,
    },
    {
      heading: 'insertOne() and insertMany()',
      content: `**insertOne(doc)** adds one document and returns \`{ acknowledged: true, insertedId: ... }\`.

**insertMany([doc1, doc2, ...])** adds an array of documents and returns \`{ acknowledged: true, insertedIds: { '0': ..., '1': ... } }\`.

insertMany has an important option, **ordered**:
- \`ordered: true\` (default) – documents are inserted in order; on the **first error** (e.g. duplicate _id) MongoDB **stops**. Documents before the error stay inserted, documents after it are **not** inserted.
- \`ordered: false\` – MongoDB tries **every** document and reports all errors at the end. Faster for bulk loads where a few bad records are acceptable.

There is no rollback for the documents that were already inserted (unless you use a transaction – Day 9).`,
      syntax: `db.products.insertOne({ name: 'Pen', price: 20 })

db.products.insertMany([
  { name: 'Pencil', price: 10 },
  { name: 'Eraser', price: 5 }
])

db.products.insertMany([ ... ], { ordered: false })`,
      tip: 'Inserting 10,000 documents one by one with insertOne in a loop is slow (10,000 network round trips). Use insertMany (or bulkWrite) to send them in batches.',
    },
    {
      heading: 'The _id field and ObjectId',
      content: `Every document must have a **unique \`_id\`** in its collection. MongoDB automatically creates a **unique index on _id** – you cannot drop it.

If you do not provide \`_id\`, the driver/shell generates an **ObjectId**: a 12-byte value shown as 24 hex characters, e.g. \`ObjectId('665f1c2ab4d3e21a9c0f1a01')\`.

The 12 bytes are:
1. **4 bytes – timestamp** (seconds since 1970) → the creation time is inside the id
2. **5 bytes – random value** unique to the machine/process
3. **3 bytes – incrementing counter**

Because of this, ObjectIds are **roughly sorted by creation time**, are generated **on the client without asking the server**, and are unique across machines – perfect for distributed systems.

In mongosh you can read the time with \`ObjectId('665f1c2ab4d3e21a9c0f1a01').getTimestamp()\`.

You can also use your **own _id** (number, string, email, etc.) when you already have a natural unique key – e.g. course codes like \`'C101'\`. Our practice datasets use small numbers for readability.`,
      points: [
        '_id is immutable – you cannot change it with an update; delete and re-insert instead',
        '_id can be any type except an array',
        'Inserting a duplicate _id fails with error code 11000 (E11000 duplicate key error)',
        'ObjectId is not a string: find({ _id: "665f..." }) will NOT match an ObjectId; use ObjectId("665f...")',
      ],
      tip: 'In Express apps, req.params.id is a string. Mongoose converts it to ObjectId for you, but with the plain driver you must write new ObjectId(req.params.id).',
    },
    {
      heading: 'Reading data: find() and findOne()',
      content: `**find(filter, projection)** returns a **cursor** – a pointer to the result set. mongosh prints the first 20 documents; type \`it\` to see more. In Node.js you call \`.toArray()\` or loop with \`for await\`.

**findOne(filter, projection)** returns the **first matching document** or **null** if nothing matches. Use it when you expect one result (find by _id, find user by email).

The **filter** is a document describing what you want:
- \`{}\` or no argument – all documents
- \`{ city: 'Pune' }\` – equality on one field
- \`{ city: 'Pune', prime: true }\` – several fields = implicit **AND**
- \`{ 'marks.dsa': 92 }\` – a field inside an embedded document (dot notation, needs quotes)
- \`{ tags: '5g' }\` – matches if the **array contains** '5g'

Matching is **case-sensitive** and **type-sensitive**: \`{ price: '79900' }\` (string) does not match \`price: 79900\` (number).`,
      syntax: `db.customers.find()                              // all
db.customers.find({ city: 'Pune' })              // equality
db.customers.find({ city: 'Pune', prime: true }) // AND
db.customers.findOne({ email: 'asha@example.com' })
db.customers.findOne({ _id: 999 })               // null`,
    },
    {
      heading: 'Projection: choose which fields come back',
      content: `The second argument of find/findOne is the **projection**. It works like the column list in \`SELECT name, price FROM products\`.

- **Inclusion:** \`{ name: 1, price: 1 }\` → only name, price **and _id**
- **Exclusion:** \`{ tags: 0, stock: 0 }\` → everything except tags and stock
- **Hide _id:** \`{ name: 1, _id: 0 }\` – _id is the only field you may exclude inside an inclusion projection
- **Embedded fields:** \`{ 'marks.dsa': 1 }\`
- You **cannot mix** inclusion and exclusion (other than _id): \`{ name: 1, stock: 0 }\` throws an error.

Why it matters: smaller documents = less network traffic and less memory in your Node app. Never send a password hash to the frontend – exclude it with projection (or \`select: false\` in Mongoose).`,
      syntax: `db.products.find({}, { name: 1, price: 1, _id: 0 })   // inclusion
db.products.find({}, { tags: 0, rating: 0 })           // exclusion
db.students.find({}, { name: 1, 'marks.dsa': 1 })      // embedded field`,
      tip: 'Projection also supports $slice for arrays, e.g. { comments: { $slice: 2 } } returns only the first 2 comments.',
    },
    {
      heading: 'Doing the same in Node.js (driver) – a preview',
      content: `In your Express backend the methods are the same, but they return **Promises**, so you use \`await\`:

- \`await col.insertOne(doc)\` → \`result.insertedId\`
- \`await col.find(filter, { projection: { name: 1 } }).toArray()\` – note the projection goes inside an **options object** named \`projection\` in the Node driver
- \`await col.findOne({ _id: new ObjectId(id) })\`

In Mongoose (Module 4) it becomes \`Product.create()\`, \`Product.find().select('name price')\`, \`Product.findById(id)\`.`,
      syntax: `const { MongoClient, ObjectId } = require('mongodb');
const col = client.db('shop').collection('products');

const { insertedId } = await col.insertOne({ name: 'Pen', price: 20 });
const list = await col.find({ category: 'Mobiles' }, { projection: { name: 1, price: 1 } }).toArray();
const one = await col.findOne({ _id: new ObjectId('665f1c2ab4d3e21a9c0f1a01') });`,
    },
  ],
  examples: [
    {
      title: 'insertOne and read the new document back',
      scenario: 'The shop adds a new product, a Realme Narzo 70 phone. Insert it with your own _id and then fetch it with findOne().',
      steps: [
        'Open the shop dataset in the MongoDB Shell Lab',
        'Call db.products.insertOne() with _id 13 and the product fields',
        'Check the returned insertedId',
        'Call findOne({ _id: 13 }) to read it back',
      ],
      code: `db.products.insertOne({
  _id: 13,
  name: 'Realme Narzo 70',
  brand: 'Realme',
  category: 'Mobiles',
  price: 15999,
  stock: 40,
  rating: 4.1,
  tags: ['5g', 'android', 'budget']
})
db.products.findOne({ _id: 13 })`,
      mongo: {
        dataset: 'shop',
        query: `db.products.insertOne({
  _id: 13,
  name: 'Realme Narzo 70',
  brand: 'Realme',
  category: 'Mobiles',
  price: 15999,
  stock: 40,
  rating: 4.1,
  tags: ['5g', 'android', 'budget']
})
db.products.findOne({ _id: 13 })`,
      },
      result: `{ acknowledged: true, insertedId: 13 }
{
  _id: 13,
  name: 'Realme Narzo 70',
  brand: 'Realme',
  category: 'Mobiles',
  price: 15999,
  stock: 40,
  rating: 4.1,
  tags: [ '5g', 'android', 'budget' ]
}`,
      explanation: '`insertOne` returns `acknowledged: true` (the server confirmed the write) and the `insertedId`. Because we passed `_id: 13`, that value is used; without it, MongoDB would generate an ObjectId. `findOne` returns the full document as a plain object (not a cursor).',
    },
    {
      title: 'insertMany with a duplicate _id (ordered insert)',
      scenario: 'An admin uploads three new courses but one of them reuses the existing code C101. See exactly which documents get inserted when insertMany is ordered (the default).',
      steps: [
        'Open the college dataset',
        'Wrap insertMany in try/catch so the error message is printed',
        'Insert C106, then a duplicate C101, then C107',
        'Count the courses and list their titles to see what was saved',
      ],
      code: `try {
  db.courses.insertMany([
    { _id: 'C106', title: 'Cloud Computing', credits: 3, dept: 'IT', instructor: 'Prof. Gupta' },
    { _id: 'C101', title: 'Duplicate Course', credits: 1 },
    { _id: 'C107', title: 'Cyber Security', credits: 3, dept: 'IT', instructor: 'Dr. Bose' }
  ])
} catch (e) {
  print(e.message)
}
db.courses.countDocuments()
db.courses.find({}, { title: 1 })`,
      mongo: {
        dataset: 'college',
        query: `try {
  db.courses.insertMany([
    { _id: 'C106', title: 'Cloud Computing', credits: 3, dept: 'IT', instructor: 'Prof. Gupta' },
    { _id: 'C101', title: 'Duplicate Course', credits: 1 },
    { _id: 'C107', title: 'Cyber Security', credits: 3, dept: 'IT', instructor: 'Dr. Bose' }
  ])
} catch (e) {
  print(e.message)
}
db.courses.countDocuments()
db.courses.find({}, { title: 1 })`,
      },
      result: `E11000 duplicate key error collection: college.courses index: _id_ dup key: { _id: "C101" }
6
{ _id: 'C101', title: 'Data Structures' }
{ _id: 'C102', title: 'Database Systems' }
{ _id: 'C103', title: 'Web Development (MERN)' }
{ _id: 'C104', title: 'Embedded Systems' }
{ _id: 'C105', title: 'Machine Learning' }
{ _id: 'C106', title: 'Cloud Computing' }`,
      explanation: 'With the default `ordered: true`, MongoDB inserts C106, hits the duplicate key error on C101 and **stops** – so C107 is never inserted and the count is 6, not 7. With `{ ordered: false }` real MongoDB would also insert C107 and report one error at the end. E11000 is the duplicate-key error code you will see often in Mongoose apps (e.g. "email already registered").',
    },
    {
      title: 'find with a filter and an inclusion projection',
      scenario: 'The college placement cell wants only the names and DSA marks of CSE students – nothing else.',
      steps: [
        'Open the college dataset',
        'Filter with { branch: "CSE" }',
        'Project { name: 1, "marks.dsa": 1, _id: 0 } – note the quotes around the dotted field',
        'Run and compare with the full documents',
      ],
      code: 'db.students.find({ branch: \'CSE\' }, { name: 1, \'marks.dsa\': 1, _id: 0 })',
      mongo: {
        dataset: 'college',
        query: 'db.students.find({ branch: \'CSE\' }, { name: 1, \'marks.dsa\': 1, _id: 0 })',
      },
      result: `{ marks: { dsa: 92 }, name: 'Asha Patil' }
{ marks: { dsa: 90 }, name: 'Neha Shah' }
{ marks: { dsa: 0 }, name: 'Rahul Joshi' }
{ marks: { dsa: 89 }, name: 'Karan Mehta' }`,
      explanation: 'The filter is an equality match on `branch`. The projection keeps `name` and only the `dsa` field inside the `marks` embedded document; `_id: 0` hides the _id, which is otherwise always returned. Dotted field names must be in quotes because a dot is not allowed in a plain JavaScript key.',
    },
    {
      title: 'findOne with exclusion projection and a no-match case',
      scenario: 'A profile page needs Neha\'s basic details without her marks and skills. Also check what findOne returns when nothing matches.',
      steps: [
        'Open the college dataset',
        'Run findOne({ _id: 3 }, { marks: 0, skills: 0 })',
        'Run findOne({ name: "Nobody" })',
        'Notice the second call prints null',
      ],
      code: `db.students.findOne({ _id: 3 }, { marks: 0, skills: 0 })
db.students.findOne({ name: 'Nobody' })`,
      mongo: {
        dataset: 'college',
        query: `db.students.findOne({ _id: 3 }, { marks: 0, skills: 0 })
db.students.findOne({ name: 'Nobody' })`,
      },
      result: `{
  _id: 3,
  name: 'Neha Shah',
  branch: 'CSE',
  year: 4,
  city: 'Ahmedabad',
  cgpa: 9.4
}
null`,
      explanation: 'An exclusion projection returns every field except the listed ones. `findOne` returns `null` when there is no match – in Express you check `if (!student) return res.status(404)...`. `find()` with no match instead returns an empty cursor.',
    },
    {
      title: 'Working with ObjectId values',
      scenario: 'Real apps use ObjectId as _id. Insert a customer with an ObjectId, then query it by ObjectId – and see that querying by the plain string does not match.',
      steps: [
        'Open the shop dataset',
        'Insert a customer with _id: ObjectId("665f1c2ab4d3e21a9c0f1a01")',
        'Find it with the ObjectId(...) wrapper',
        'Count documents that match the plain string version of the id',
      ],
      code: `db.customers.insertOne({
  _id: ObjectId('665f1c2ab4d3e21a9c0f1a01'),
  name: 'Zoya Ansari',
  email: 'zoya@example.com',
  city: 'Surat',
  age: 27,
  prime: false
})
db.customers.findOne({ _id: ObjectId('665f1c2ab4d3e21a9c0f1a01') }, { name: 1, city: 1 })`,
      mongo: {
        dataset: 'shop',
        query: `db.customers.insertOne({
  _id: ObjectId('665f1c2ab4d3e21a9c0f1a01'),
  name: 'Zoya Ansari',
  email: 'zoya@example.com',
  city: 'Surat',
  age: 27,
  prime: false
})
db.customers.findOne({ _id: ObjectId('665f1c2ab4d3e21a9c0f1a01') }, { name: 1, city: 1 })`,
      },
      result: `{ acknowledged: true, insertedId: ObjectId('665f1c2ab4d3e21a9c0f1a01') }
{
  _id: ObjectId('665f1c2ab4d3e21a9c0f1a01'),
  city: 'Surat',
  name: 'Zoya Ansari'
}`,
      explanation: 'mongosh displays ObjectIds as `ObjectId(\'...\')`. In real MongoDB, `{ _id: \'665f1c2ab4d3e21a9c0f1a01\' }` (a string) would return nothing because the stored value is of type ObjectId – one of the most common bugs in Node.js APIs. The first 8 hex characters (665f1c2a) are the creation timestamp; `getTimestamp()` returns it as a date in mongosh.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between insertOne() and insertMany()?',
      a: 'insertOne inserts a single document and returns { acknowledged, insertedId }. insertMany takes an array and inserts many documents in one round trip, returning { acknowledged, insertedIds } (an object of index → id). insertMany is much faster for bulk data.',
      level: 'Easy',
    },
    {
      q: 'What happens if one document in insertMany has a duplicate _id?',
      a: 'With ordered: true (default) MongoDB stops at the first error: documents before it are inserted, the failing one and all after it are not, and a BulkWriteError (E11000) is thrown. With ordered: false it continues with the remaining documents and reports all errors at the end. Already-inserted documents are not rolled back unless you use a transaction.',
      level: 'Medium',
    },
    {
      q: 'What is ObjectId and what is it made of?',
      a: 'A 12-byte BSON type used as the default _id: a 4-byte timestamp (seconds since epoch), a 5-byte random value per process, and a 3-byte incrementing counter. It is shown as 24 hex characters, generated client-side, globally unique in practice and roughly ordered by creation time.',
      level: 'Medium',
    },
    {
      q: 'How do you get the creation time of a document that uses ObjectId?',
      a: 'Call getTimestamp() on the _id: ObjectId("665f1c2ab4d3e21a9c0f1a01").getTimestamp(). In Mongoose: doc._id.getTimestamp(). Note it has only second precision, so for exact times store a createdAt field (Mongoose timestamps: true).',
      level: 'Easy',
    },
    {
      q: 'Can you update the _id of a document?',
      a: 'No. _id is immutable. Trying to $set _id gives an error ("Performing an update on the path \'_id\' would modify the immutable field \'_id\'"). To change it you insert a copy with the new _id and delete the old document.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between find() and findOne()?',
      a: 'find() returns a cursor over all matching documents (mongosh prints them in batches of 20; in Node use toArray() or iterate). findOne() returns the first matching document directly, or null if nothing matches. findOne is equivalent to find(filter).limit(1) and reading the first element.',
      level: 'Easy',
    },
    {
      q: 'What is a cursor in MongoDB?',
      a: 'A cursor is a pointer to the result set of a query. The server returns results in batches (first batch up to 101 documents or 16 MB in drivers); the client fetches more batches as you iterate. Cursors support chaining like sort(), skip(), limit(). Idle cursors time out after 10 minutes by default.',
      level: 'Medium',
    },
    {
      q: 'What is projection? Give an example.',
      a: 'Projection is the second argument to find/findOne that chooses which fields to return, like the column list in SQL SELECT. db.products.find({}, { name: 1, price: 1, _id: 0 }) returns only name and price. It reduces network traffic and hides sensitive fields.',
      level: 'Easy',
    },
    {
      q: 'Can you mix inclusion and exclusion in a projection?',
      a: 'No – except for _id. { name: 1, _id: 0 } is allowed, but { name: 1, stock: 0 } throws "Cannot do exclusion on field stock in inclusion projection". Choose either a whitelist (1s) or a blacklist (0s).',
      level: 'Medium',
    },
    {
      q: 'Why does db.users.findOne({ _id: "665f1c2ab4d3e21a9c0f1a01" }) return null even though the user exists?',
      a: 'Because the stored _id is of BSON type ObjectId, and the query passes a string. MongoDB comparison is type-sensitive. Use findOne({ _id: ObjectId("665f...") }) in mongosh or new ObjectId(id) in the Node driver. Mongoose casts strings to ObjectId automatically based on the schema.',
      level: 'Hard',
    },
    {
      q: 'Do you have to create a collection before inserting into it?',
      a: 'No. MongoDB creates the database and collection lazily on the first insert. You only call db.createCollection() explicitly when you need options such as a validator, capped collection or time-series collection.',
      level: 'Easy',
    },
    {
      q: 'Which insert methods are deprecated?',
      a: 'db.collection.insert(), update() and remove() from the legacy shell are deprecated. Use insertOne/insertMany, updateOne/updateMany/replaceOne and deleteOne/deleteMany. Similarly count() is deprecated in favour of countDocuments() / estimatedDocumentCount().',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Insert three new customers into the shop dataset with insertMany (use _id 109, 110, 111), then show only their names and cities.',
      hint: 'insertMany([...]) then find with { _id: { $in: [...] } } or { _id: { $gt: 108 } } and a projection.',
      solution: `db.customers.insertMany([
  { _id: 109, name: 'Zoya Ansari', email: 'zoya@example.com', city: 'Surat', age: 27, prime: false },
  { _id: 110, name: 'Vikram Rao', email: 'vikram@example.com', city: 'Hyderabad', age: 33, prime: true },
  { _id: 111, name: 'Meera Iyer', email: 'meera@example.com', city: 'Chennai', age: 25, prime: true }
])
db.customers.find({ _id: { $gt: 108 } }, { name: 1, city: 1, _id: 0 })`,
    },
    {
      task: 'In the college dataset, list the name, city and cgpa of all 4th-year students, without the _id.',
      hint: 'Filter { year: 4 }, projection with _id: 0.',
      solution: `db.students.find({ year: 4 }, { name: 1, city: 1, cgpa: 1, _id: 0 })
// Neha Shah, Priya Desai, Karan Mehta`,
    },
    {
      task: 'In the blog dataset, find the post with _id 4 but return only its title and tags. Then find the user with username "neha_js" and return everything except followers.',
      hint: 'Use findOne twice – an inclusion projection, then an exclusion projection.',
      solution: `db.posts.findOne({ _id: 4 }, { title: 1, tags: 1, _id: 0 })
db.users.findOne({ username: 'neha_js' }, { followers: 0 })`,
    },
    {
      task: 'Insert two products with insertMany using { ordered: false } where the second one reuses _id 1. Explain how many documents end up inserted and why.',
      hint: 'Wrap in try/catch and count before/after.',
      solution: `try {
  db.products.insertMany([
    { _id: 1, name: 'Duplicate iPhone' },
    { _id: 14, name: 'USB-C Cable', category: 'Accessories', price: 499 }
  ], { ordered: false })
} catch (e) {
  print(e.message)   // E11000 duplicate key error ... _id: 1
}
db.products.countDocuments()
// In real MongoDB: _id 14 IS inserted because ordered:false continues after the error (13 products).
// With ordered:true it would stop at the first document and insert nothing.`,
    },
    {
      task: 'Write a Node.js function getProductById(id) using the official driver that converts the string id to ObjectId, returns null for an invalid id, and hides the stock field.',
      hint: 'ObjectId.isValid(id), new ObjectId(id), findOne with { projection }.',
      solution: `const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);
const products = client.db('shop').collection('products');

async function getProductById(id) {
  if (!ObjectId.isValid(id)) return null;
  return products.findOne(
    { _id: new ObjectId(id) },
    { projection: { stock: 0 } }
  );
}

module.exports = { getProductById };`,
    },
  ],
  quiz: [
    {
      question: 'What does db.products.findOne({ _id: 999 }) return if no product has _id 999?',
      options: ['An empty array []', 'An error', 'null', 'An empty cursor'],
      answer: 2,
      explanation: 'findOne returns the first matching document, or null when nothing matches.',
    },
    {
      question: 'How many bytes is an ObjectId and what does the first part store?',
      options: [
        '12 bytes; the first 4 bytes are a timestamp',
        '16 bytes; the first 8 bytes are a random UUID',
        '24 bytes; the first 12 bytes are the server IP',
        '12 bytes; the first 4 bytes are the collection name',
      ],
      answer: 0,
      explanation: 'An ObjectId is 12 bytes (24 hex characters): 4-byte timestamp, 5-byte random value, 3-byte counter.',
    },
    {
      question: 'Which projection is INVALID?',
      options: [
        '{ name: 1, price: 1 }',
        '{ name: 1, _id: 0 }',
        '{ tags: 0, stock: 0 }',
        '{ name: 1, stock: 0 }',
      ],
      answer: 3,
      explanation: 'You cannot mix inclusion (1) and exclusion (0) in one projection, except for _id.',
    },
    {
      question: 'insertMany([A, B(duplicate _id), C]) runs with the default options. What is inserted?',
      options: ['Nothing', 'Only A', 'A and C', 'A, B and C'],
      answer: 1,
      explanation: 'The default is ordered: true, so MongoDB stops at the first error (B). A stays inserted; B and C are not.',
    },
    {
      question: 'What does find() return in mongosh and in the Node.js driver?',
      options: ['A single document', 'A JSON string', 'A cursor', 'The number of matching documents'],
      answer: 2,
      explanation: 'find() returns a cursor. mongosh iterates it for you (20 at a time); in Node you call toArray() or iterate with for await.',
    },
  ],
};
