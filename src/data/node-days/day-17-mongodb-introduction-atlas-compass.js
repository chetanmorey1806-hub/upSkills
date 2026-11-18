export default {
  id: 'day-17-mongodb-introduction-atlas-compass',
  title: 'MongoDB Introduction: Atlas, Compass, Documents and Collections',
  module: 'Module 3: Databases',
  day: 17,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'MongoDB is the most popular database in the Node.js world (the "M" in MERN). Today you learn how a document database stores data, create a free cloud cluster on MongoDB Atlas, explore it with Compass and mongosh, and connect to it from Node.js with the official driver.',
  objectives: [
    'Explain NoSQL vs SQL and how MongoDB organises data into databases, collections and documents',
    'Understand BSON, data types and the ObjectId primary key',
    'Create a free MongoDB Atlas cluster, a database user, a network rule and a connection string',
    'Use MongoDB Compass and mongosh to insert, find, update and delete documents with query operators',
    'Connect from Node.js with the official mongodb driver and perform CRUD from an Express API',
  ],
  theory: [
    {
      heading: 'What is MongoDB? SQL tables vs document collections',
      content: `**MongoDB** is a **NoSQL document database**. Instead of rows in tables with a fixed set of columns, it stores **documents** – JSON-like objects – in **collections**.

Analogy: a SQL database is an **Excel workbook** – each sheet (table) has fixed columns and every row must fit them. MongoDB is a **filing cabinet** – each drawer (collection) holds folders (documents); most folders look similar, but one folder can contain an extra page (field) or a nested envelope (sub-document) without redesigning the whole cabinet.

| SQL (MySQL) | MongoDB |
|---|---|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| Primary key (id) | \`_id\` (ObjectId by default) |
| JOIN | Embedding or \`$lookup\` / Mongoose \`populate()\` |

**Why developers like MongoDB with Node:** data is already JSON (no object–table mapping), flexible schema for fast iteration, nested objects and arrays are natural, horizontal scaling (sharding) and replication are built in, and Atlas offers a free hosted cluster.

**When SQL is a better fit:** highly relational data with many joins, strict multi-table transactions everywhere (banking ledgers), complex reporting. (MongoDB does support multi-document ACID transactions since 4.0, but its design favours embedding.)`,
    },
    {
      heading: 'Documents, BSON and ObjectId',
      content: `A document looks like JSON:

\`\`\`json
{
  "_id": ObjectId("665f1c2e9b1d4a0012000001"),
  "name": "Asha",
  "age": 21,
  "skills": ["node", "react"],
  "address": { "city": "Pune", "pin": "411001" },
  "joinedAt": ISODate("2026-06-01T10:00:00Z")
}
\`\`\`

MongoDB actually stores **BSON** (Binary JSON), which adds types JSON lacks: \`ObjectId\`, \`Date\`, \`Int32/Int64\`, \`Decimal128\` (money), \`Binary\`. Max document size is **16 MB**.

**_id** is required and unique in every collection. If you do not provide one, MongoDB generates an **ObjectId**: 12 bytes shown as **24 hex characters** = 4-byte timestamp + 5-byte random value + 3-byte counter. So ids are unique across machines without a central counter, and roughly sortable by creation time (\`id.getTimestamp()\`).

**Flexible schema:** two documents in the same collection may have different fields. Flexibility is powerful but dangerous (typos like \`nmae\`) – that is why we add **Mongoose schemas** tomorrow.`,
      tip: 'ObjectId is not a string. In queries use new ObjectId(idString); comparing a string to an ObjectId field finds nothing.',
    },
    {
      heading: 'MongoDB Atlas: free cloud database in 5 minutes',
      content: `**Atlas** is MongoDB's official cloud service (runs on AWS/GCP/Azure). The **M0 free tier** gives 512 MB – perfect for learning and small projects.

1. Sign up at **mongodb.com/atlas** and create a project.
2. **Create a cluster** → choose **M0 Free**, a provider and a region close to your users (e.g. Mumbai ap-south-1).
3. **Database Access** → add a database user (username + strong password). This is NOT your Atlas login.
4. **Network Access** → add your IP address (or \`0.0.0.0/0\` = anywhere, only for learning/hosting platforms with dynamic IPs).
5. **Connect → Drivers → Node.js** → copy the connection string:
   \`mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/college?retryWrites=true&w=majority\`
6. Put it in a \`.env\` file as \`MONGODB_URI=...\` and add \`.env\` to \`.gitignore\`.

Anatomy of the URI: \`mongodb+srv://\` (SRV DNS lookup finds all replica-set members) – credentials – cluster host – \`/college\` (default database) – options. Special characters in the password (\`@ : / ?\`) must be URL-encoded (\`encodeURIComponent\`).

**Local alternative:** install MongoDB Community Server (\`mongodb://127.0.0.1:27017/college\`) or run \`docker run -d -p 27017:27017 mongo:8\`. Use \`127.0.0.1\` instead of \`localhost\` – Node 18+ may resolve localhost to IPv6 \`::1\` where mongod is not listening.`,
      tip: 'The #1 Atlas connection error ("Could not connect to any servers" / timeout) is a missing Network Access IP rule. The #2 is a wrong database-user password.',
    },
    {
      heading: 'Compass and mongosh: GUI and shell',
      content: `**MongoDB Compass** is the official desktop GUI: paste your connection string, browse databases/collections, insert/edit documents, run filters like \`{ city: "Pune" }\`, view schema analysis, build indexes and aggregation pipelines visually. Great for checking what your API actually saved.

**mongosh** is the interactive shell (also embedded at the bottom of Compass):

\`\`\`js
show dbs
use college                          // switch (creates on first insert)
db.students.insertOne({ name: 'Asha', age: 21, city: 'Pune' })
db.students.insertMany([{ name: 'Ravi', age: 23 }, { name: 'Meera', age: 20 }])
db.students.find()                   // all
db.students.find({ city: 'Pune' })   // filter
db.students.find({ age: { $gte: 21 } }, { name: 1, _id: 0 })  // filter + projection
db.students.find().sort({ age: -1 }).limit(2)
db.students.countDocuments({ city: 'Pune' })
db.students.updateOne({ name: 'Ravi' }, { $set: { city: 'Mumbai' } })
db.students.updateMany({}, { $inc: { age: 1 } })
db.students.deleteOne({ name: 'Meera' })
db.students.drop()
\`\`\``,
    },
    {
      heading: 'Query and update operators',
      content: `**Comparison:** \`$eq\`, \`$ne\`, \`$gt\`, \`$gte\`, \`$lt\`, \`$lte\`, \`$in\`, \`$nin\` → \`{ age: { $gte: 18, $lt: 25 } }\`, \`{ city: { $in: ['Pune', 'Mumbai'] } }\`
**Logical:** \`$and\`, \`$or\`, \`$not\`, \`$nor\` → \`{ $or: [{ city: 'Pune' }, { age: { $lt: 20 } }] }\`
**Element / evaluation:** \`$exists\`, \`$type\`, \`$regex\` → \`{ name: { $regex: '^a', $options: 'i' } }\`
**Arrays:** \`{ skills: 'node' }\` matches if the array contains 'node'; \`$all\`, \`$size\`, \`$elemMatch\`
**Nested fields:** dot notation in quotes → \`{ 'address.city': 'Pune' }\`

**Update operators** (never send a plain object to updateOne – it needs operators): \`$set\`, \`$unset\`, \`$inc\`, \`$push\`, \`$pull\`, \`$addToSet\`, \`$rename\`. Option \`{ upsert: true }\` inserts when nothing matches.

**Indexes** speed up queries the way a book index does: \`db.students.createIndex({ email: 1 }, { unique: true })\`. Without an index MongoDB scans every document (COLLSCAN).`,
      tip: 'Coming next (Day 18): Mongoose adds schemas, validation and models on top of this driver.',
    },
  ],
  examples: [
    {
      title: 'CRUD from Node.js with the official mongodb driver',
      scenario: 'Write a Node script that connects to MongoDB (Atlas or local), inserts students, queries with filters/projection/sort, updates and deletes.',
      steps: [
        'mkdir mongo-demo && cd mongo-demo && npm init -y && npm i mongodb dotenv',
        'Create .env with MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/college (or mongodb://127.0.0.1:27017/college)',
        'Create crud.js with the code below (add require("dotenv").config() at the top when using .env)',
        'Run node crud.js',
        'Open Compass → college → students to see the documents',
      ],
      code: `const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college';
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db();                       // database from the URI ("college")
  const students = db.collection('students');   // created on first insert

  await students.deleteMany({});                // start clean for the demo

  // CREATE
  const one = await students.insertOne({ name: 'Asha', age: 21, city: 'Pune', skills: ['node', 'react'] });
  console.log('insertedId type:', one.insertedId.constructor.name);

  const many = await students.insertMany([
    { name: 'Ravi', age: 23, city: 'Mumbai', skills: ['java'] },
    { name: 'Meera', age: 20, city: 'Pune', skills: ['node', 'mongodb'], address: { pin: '411001' } },
  ]);
  console.log('insertedCount:', many.insertedCount);

  // READ
  const puneStudents = await students
    .find({ city: 'Pune' }, { projection: { _id: 0, name: 1, age: 1 } })
    .sort({ age: 1 })
    .toArray();
  console.log('Pune students:', puneStudents);

  const nodeDevs = await students.countDocuments({ skills: 'node' });
  console.log('Know node:', nodeDevs);

  const olderThan20 = await students.find({ age: { $gt: 20 } }).project({ _id: 0, name: 1 }).toArray();
  console.log('Age > 20:', olderThan20);

  // UPDATE
  const upd = await students.updateOne({ name: 'Ravi' }, { $set: { city: 'Nagpur' }, $push: { skills: 'node' } });
  console.log('matched:', upd.matchedCount, 'modified:', upd.modifiedCount);
  console.log('Ravi now:', await students.findOne({ name: 'Ravi' }, { projection: { _id: 0 } }));

  // DELETE
  const del = await students.deleteOne({ name: 'Meera' });
  console.log('deletedCount:', del.deletedCount, '| remaining:', await students.countDocuments());
}

main()
  .catch(err => console.error('Error:', err.message))
  .finally(() => client.close());`,
      result: `insertedId type: ObjectId
insertedCount: 2
Pune students: [ { name: 'Meera', age: 20 }, { name: 'Asha', age: 21 } ]
Know node: 2
Age > 20: [ { name: 'Asha' }, { name: 'Ravi' } ]
matched: 1 modified: 1
Ravi now: { name: 'Ravi', age: 23, city: 'Nagpur', skills: [ 'java', 'node' ] }
deletedCount: 1 | remaining: 2
(verified with mongodb driver 7.x on MongoDB 8)`,
      explanation: 'The collection is created automatically on the first insert. find() returns a cursor, so we chain sort() and call toArray(). { skills: "node" } matches documents whose array contains "node". updateOne needs operators like $set/$push.',
    },
    {
      title: 'Express API on top of the MongoDB driver (real code)',
      scenario: 'Expose the students collection over HTTP: list (with ?city filter), get by id, create. Connect once at startup, then listen.',
      steps: [
        'npm i express mongodb dotenv',
        'Create app.js with the code below',
        'Run node app.js – "Connected to MongoDB" must appear before "Server running"',
        'POST a student, copy its _id and GET /api/students/<_id>',
        'Try an invalid id (abc) and a valid but unknown id',
      ],
      code: `// app.js – Express + official MongoDB driver
require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college');
let students; // collection handle, set after connecting

const app = express();
app.use(express.json());

app.get('/api/students', async (req, res) => {
  const filter = req.query.city ? { city: req.query.city } : {};
  res.json(await students.find(filter).sort({ name: 1 }).toArray());
});

app.get('/api/students/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const student = await students.findOne({ _id: new ObjectId(req.params.id) });
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

app.post('/api/students', async (req, res) => {
  const { name, city } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const doc = { name, city: city || 'Unknown' };
  const result = await students.insertOne(doc);
  res.status(201).json({ _id: result.insertedId, ...doc });
});

async function start() {
  await client.connect();                      // connect ONCE, reuse the pool
  students = client.db().collection('students');
  console.log('Connected to MongoDB');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log('Server running on port ' + PORT));
}
start().catch(err => { console.error(err); process.exit(1); });`,
      api: {
        code: `// API Lab simulation of the same endpoints (in-memory "collection", fake ObjectIds)
const express = require('express');
const app = express();
app.use(express.json());

let counter = 0;
const fakeObjectId = () => '665f1c2e9b1d4a00120000' + String(++counter).padStart(2, '0');
const isValidObjectId = (id) => /^[0-9a-f]{24}$/.test(id);

const students = [
  { _id: fakeObjectId(), name: 'Ravi', city: 'Mumbai' },
  { _id: fakeObjectId(), name: 'Asha', city: 'Pune' },
];

app.get('/api/students', (req, res) => {
  const list = req.query.city ? students.filter(s => s.city === req.query.city) : students;
  res.json([...list].sort((a, b) => a.name.localeCompare(b.name)));
});

app.get('/api/students/:id', (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const student = students.find(s => s._id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

app.post('/api/students', (req, res) => {
  const { name, city } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const doc = { name, city: city || 'Unknown' };
  const created = { _id: fakeObjectId(), ...doc };
  students.push(created);
  res.status(201).json(created);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/students' },
          { method: 'POST', url: '/api/students', body: { name: 'Meera', city: 'Pune' } },
          { method: 'POST', url: '/api/students', body: {} },
          { method: 'GET', url: '/api/students?city=Pune' },
          { method: 'GET', url: '/api/students/665f1c2e9b1d4a0012000003' },
          { method: 'GET', url: '/api/students/abc' },
          { method: 'GET', url: '/api/students/665f1c2e9b1d4a0012000099' },
        ],
      },
      result: `GET /api/students → 200 [{"_id":"665f1c2e9b1d4a0012000002","name":"Asha","city":"Pune"},{"_id":"665f1c2e9b1d4a0012000001","name":"Ravi","city":"Mumbai"}]
POST /api/students → 201 {"_id":"665f1c2e9b1d4a0012000003","name":"Meera","city":"Pune"}
POST /api/students → 400 {"error":"name is required"}
GET /api/students?city=Pune → 200 [{"_id":"665f1c2e9b1d4a0012000002","name":"Asha","city":"Pune"},{"_id":"665f1c2e9b1d4a0012000003","name":"Meera","city":"Pune"}]
GET /api/students/665f1c2e9b1d4a0012000003 → 200 {"_id":"665f1c2e9b1d4a0012000003","name":"Meera","city":"Pune"}
GET /api/students/abc → 400 {"error":"Invalid id"}
GET /api/students/665f1c2e9b1d4a0012000099 → 404 {"error":"Student not found"}
Real MongoDB run of the driver code (verified): POST returned 201 {"_id":"6afd593c104398de6e2e0c0f","name":"Asha","city":"Pune"} (a real ObjectId, different every time); /abc gave 400; an unknown valid id gave 404`,
      explanation: 'The real app connects once and reuses the driver\'s connection pool for every request. ObjectId.isValid() prevents a crash from new ObjectId("abc"). The API Lab has no database, so the simulation uses an array and deterministic 24-hex ids; the HTTP behaviour is identical.',
    },
    {
      title: 'mongosh query operators practice',
      scenario: 'Practise filters on a products collection in mongosh (Compass → _MONGOSH tab, or the mongosh terminal).',
      steps: [
        'Connect: mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/shop" --username <user>',
        'Insert the sample products',
        'Run each query and compare with the expected result',
        'Create a unique index on sku and try inserting a duplicate',
      ],
      code: `use shop
db.products.insertMany([
  { sku: 'P1', name: 'Laptop',   price: 55000, category: 'electronics', tags: ['work', 'sale'], stock: 5 },
  { sku: 'P2', name: 'Mouse',    price: 600,   category: 'electronics', tags: ['work'],         stock: 0 },
  { sku: 'P3', name: 'Notebook', price: 80,    category: 'stationery',  tags: ['school'],       stock: 200 },
  { sku: 'P4', name: 'Backpack', price: 1500,  category: 'bags',        tags: ['school', 'sale'], stock: 12 }
])

db.products.find({ price: { $gte: 500, $lte: 2000 } }, { name: 1, price: 1, _id: 0 })
// Mouse 600, Backpack 1500

db.products.find({ $or: [{ stock: 0 }, { category: 'bags' }] }, { name: 1, _id: 0 })
// Mouse, Backpack

db.products.find({ tags: { $all: ['school', 'sale'] } }, { name: 1, _id: 0 })
// Backpack

db.products.find({ name: { $regex: '^n', $options: 'i' } }, { name: 1, _id: 0 })
// Notebook

db.products.updateMany({ tags: 'sale' }, { $inc: { price: -100 } })
// { matchedCount: 2, modifiedCount: 2 }

db.products.createIndex({ sku: 1 }, { unique: true })
db.products.insertOne({ sku: 'P1', name: 'Duplicate' })
// MongoServerError: E11000 duplicate key error ... index: sku_1 dup key: { sku: "P1" }`,
      result: `Range query → Mouse (600), Backpack (1500)
$or → Mouse, Backpack
$all → Backpack
$regex → Notebook
updateMany → matchedCount 2, modifiedCount 2
Duplicate sku → E11000 duplicate key error (code 11000)`,
      explanation: 'Operators start with $. Ranges combine $gte/$lte inside one field object. Array fields match single values directly; $all requires every listed value. A unique index makes MongoDB reject duplicates with error code 11000 – you will map it to HTTP 409 in your API.',
    },
    {
      title: 'Connection best practices: .env, single client, graceful shutdown',
      scenario: 'Production-ready db.js module shared by the whole app.',
      steps: [
        'npm i mongodb dotenv',
        'Create .env (never commit it) and .gitignore with .env',
        'Create src/config/db.js exporting connectDB() and getDb()',
        'Call connectDB() in server.js before app.listen',
        'Close the client on SIGINT (Ctrl+C) / SIGTERM (Docker, Render)',
      ],
      code: `# .env
MONGODB_URI=mongodb+srv://appUser:S3cret%40123@cluster0.abcde.mongodb.net/college?retryWrites=true&w=majority
PORT=3000

// src/config/db.js
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 });
let db;

async function connectDB() {
  await client.connect();
  db = client.db();
  await db.command({ ping: 1 });
  console.log('MongoDB connected to', db.databaseName);
}
const getDb = () => {
  if (!db) throw new Error('Call connectDB() first');
  return db;
};
async function closeDB() { await client.close(); }
module.exports = { connectDB, getDb, closeDB };

// src/server.js
require('dotenv').config();
const app = require('./app');
const { connectDB, closeDB } = require('./config/db');

connectDB()
  .then(() => {
    const server = app.listen(process.env.PORT, () => console.log('Server running on port ' + process.env.PORT));
    const shutdown = async () => { server.close(); await closeDB(); process.exit(0); };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  })
  .catch(err => { console.error('DB connection failed:', err.message); process.exit(1); });`,
      result: `MongoDB connected to college
Server running on port 3000
(wrong password → "DB connection failed: bad auth : authentication failed"; IP not allowed → server selection timed out after 5000 ms)`,
      explanation: 'The password "S3cret@123" is URL-encoded as S3cret%40123. One MongoClient per process manages a pool of connections – never create a new client per request. serverSelectionTimeoutMS makes misconfiguration fail fast.',
    },
  ],
  interview: [
    { q: 'What is MongoDB and how is it different from MySQL?', a: 'MongoDB is a NoSQL document database storing BSON documents in collections with a flexible schema. MySQL is relational: tables with fixed columns, rows, foreign keys and SQL joins. MongoDB favours embedding related data; MySQL favours normalisation and joins.', level: 'Easy' },
    { q: 'What is a document and a collection?', a: 'A document is a single record – a BSON object with fields (like a JSON object). A collection is a group of documents, similar to a table, but documents need not share the same structure.', level: 'Easy' },
    { q: 'What is BSON?', a: 'Binary JSON: MongoDB\'s storage and wire format. It is faster to traverse and supports more types than JSON, such as ObjectId, Date, Decimal128, Int64 and binary data.', level: 'Medium' },
    { q: 'What is an ObjectId?', a: 'The default 12-byte _id value: 4-byte timestamp, 5-byte random value and 3-byte incrementing counter, displayed as 24 hex characters. It is unique without coordination and roughly ordered by creation time.', level: 'Medium' },
    { q: 'What is MongoDB Atlas?', a: 'MongoDB\'s fully managed cloud database service on AWS/GCP/Azure, with a free M0 tier, automated backups, monitoring, scaling and security (database users and IP access lists).', level: 'Easy' },
    { q: 'What is Compass?', a: 'The official MongoDB GUI for browsing data, running queries and aggregations, editing documents, analysing schema and managing indexes. mongosh is the command-line shell.', level: 'Easy' },
    { q: 'Explain $set, $inc, $push and $addToSet.', a: '$set sets field values, $inc increments numbers, $push appends to an array, $addToSet appends only if the value is not already present.', level: 'Medium' },
    { q: 'What is an index and why is it important?', a: 'A sorted data structure (B-tree) on one or more fields that lets MongoDB find documents without scanning the whole collection. It speeds reads but costs storage and slows writes slightly. Unique indexes also enforce uniqueness.', level: 'Medium' },
    { q: 'Embedding vs referencing in MongoDB?', a: 'Embedding stores related data inside the document (address inside user) – one read, good for one-to-few data accessed together. Referencing stores the related document\'s _id (posts referencing an author) – good for large or many-to-many data; you join with $lookup or Mongoose populate().', level: 'Hard' },
    { q: 'Why should you create one MongoClient per application, not per request?', a: 'The client maintains a connection pool. Creating one per request opens new TCP/TLS connections and authentication every time – slow and can exhaust server connections.', level: 'Medium' },
    { q: 'What does error code 11000 mean?', a: 'Duplicate key error: an insert or update violated a unique index. APIs typically translate it into HTTP 409 Conflict.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'In mongosh create a "library" database with a books collection and insert 4 books (title, author, year, genres array).',
      hint: 'use library; db.books.insertMany([...]).',
      solution: `use library
db.books.insertMany([
  { title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', year: 1999, genres: ['biography'] },
  { title: 'The Alchemist', author: 'Paulo Coelho', year: 1988, genres: ['fiction'] },
  { title: 'Clean Code', author: 'Robert C. Martin', year: 2008, genres: ['programming'] },
  { title: 'You Don\\'t Know JS', author: 'Kyle Simpson', year: 2014, genres: ['programming', 'javascript'] }
])`,
    },
    {
      task: 'Write queries: books after 2000; programming books sorted by year desc; count of books by Paulo Coelho; only title fields.',
      hint: '$gt, sort({year:-1}), countDocuments, projection.',
      solution: `db.books.find({ year: { $gt: 2000 } })
db.books.find({ genres: 'programming' }).sort({ year: -1 })
db.books.countDocuments({ author: 'Paulo Coelho' })
db.books.find({}, { title: 1, _id: 0 })`,
    },
    {
      task: 'Add a "classic" tag to every book older than 2000 and remove the genres field from "The Alchemist".',
      hint: 'updateMany with $addToSet; updateOne with $unset.',
      solution: `db.books.updateMany({ year: { $lt: 2000 } }, { $addToSet: { genres: 'classic' } })
db.books.updateOne({ title: 'The Alchemist' }, { $unset: { genres: '' } })`,
    },
    {
      task: 'Write a Node script that connects with MONGODB_URI, prints the number of books per genre using an aggregation pipeline.',
      hint: '$unwind the genres array, then $group.',
      solution: `require('dotenv').config();
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);
(async () => {
  await client.connect();
  const result = await client.db('library').collection('books').aggregate([
    { $unwind: '$genres' },
    { $group: { _id: '$genres', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();
  console.log(result);
  await client.close();
})();`,
    },
    {
      task: 'Create a free Atlas cluster, a user "appUser", allow your IP, and connect from Compass. Write down the 6 parts of your connection string.',
      hint: 'Protocol, user, password, host, database, options.',
      solution: `mongodb+srv://  -> protocol (SRV lookup)
appUser          -> database user
<password>       -> URL-encoded password
cluster0.xxxxx.mongodb.net -> cluster host
/college         -> default database
?retryWrites=true&w=majority -> options (retry writes, majority write concern)`,
    },
  ],
  quiz: [
    { question: 'In MongoDB, a "collection" is closest to which SQL concept?', options: ['Row', 'Column', 'Database', 'Table'], answer: 3, explanation: 'Collections group documents like tables group rows.' },
    { question: 'How many hex characters does an ObjectId string have?', options: ['12', '24', '32', '36'], answer: 1, explanation: '12 bytes = 24 hex characters.' },
    { question: 'Which query finds students aged 18 to 25 inclusive?', options: ['{ age: { $gte: 18, $lte: 25 } }', '{ age: 18-25 }', '{ age: { $between: [18, 25] } }', '{ $age: { gt: 18 } }'], answer: 0, explanation: 'Combine $gte and $lte in one field object.' },
    { question: 'Your app cannot connect to Atlas and times out. Most likely cause?', options: ['Wrong collection name', 'Missing index', 'Your IP is not in the Network Access list', 'Using insertMany'], answer: 2, explanation: 'Atlas blocks unknown IPs by default.' },
    { question: 'Which operator adds a value to an array only if it is not already present?', options: ['$push', '$set', '$inc', '$addToSet'], answer: 3, explanation: '$addToSet avoids duplicates.' },
  ],
};
