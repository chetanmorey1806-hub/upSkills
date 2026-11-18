export default {
  id: 'day-01-nosql-vs-sql-documents-bson-setup-atlas',
  title: 'NoSQL vs SQL, Documents, Collections, BSON & Setting Up MongoDB (mongosh, Compass, Atlas)',
  module: 'Module 1: MongoDB Basics',
  day: 1,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'MongoDB is the "M" in MERN. Today you learn how a document database differs from a SQL database, what documents, collections and BSON are, when MongoDB is (and is not) the right choice, and you set up MongoDB 8, mongosh, Compass and a free Atlas cluster.',
  objectives: [
    'Explain the difference between SQL (relational) and NoSQL (document) databases with examples',
    'Describe databases, collections, documents, fields and the _id field',
    'Explain what BSON is and name the common BSON data types',
    'Decide when MongoDB is a good choice and when a SQL database is better',
    'Install MongoDB Community Server, mongosh and Compass, and create a free Atlas M0 cluster',
  ],
  theory: [
    {
      heading: 'SQL vs NoSQL: two ways to store data',
      content: `A **SQL (relational) database** such as MySQL or PostgreSQL stores data in **tables** with fixed columns. Every row must follow the same structure, and related data is split across tables and joined back with \`JOIN\`.

A **NoSQL database** is any database that does not use the table-and-row model. There are four main families:

- **Document** databases – MongoDB, Couchbase (data stored as JSON-like documents)
- **Key-value** stores – Redis, DynamoDB (a giant dictionary: key → value)
- **Wide-column** stores – Cassandra, HBase (huge, write-heavy data)
- **Graph** databases – Neo4j (nodes and relationships, e.g. "friends of friends")

**Analogy:** a SQL database is like a government form – every person fills the same boxes, and an empty box still exists. A document database is like a file folder for each customer – each folder holds exactly the papers that customer has, and two folders can look a little different.

MongoDB is a **document database**. It is the most popular NoSQL database and the default database in the MERN stack (MongoDB, Express, React, Node.js) because its documents look exactly like the JavaScript objects you already use.`,
      points: [
        'SQL: tables, rows, columns, fixed schema, JOINs, strong relational integrity',
        'MongoDB: databases, collections, documents, flexible schema, related data often embedded',
        'Both support indexes, transactions (MongoDB since 4.0), replication and backups',
        'NoSQL does not mean "no SQL ever" – it is often read as "Not Only SQL"',
      ],
      tip: 'In interviews never say "NoSQL is better than SQL". Say "it depends on the data shape and access pattern", then give an example of each.',
    },
    {
      heading: 'Database → Collection → Document → Field',
      content: `MongoDB organises data in four levels:

1. **Database** – a container for collections, e.g. \`shop\` (like a MySQL database).
2. **Collection** – a group of related documents, e.g. \`products\` (like a table, but with no fixed columns).
3. **Document** – one record, written as a JSON-like object (like a row).
4. **Field** – a key-value pair inside a document, e.g. \`price: 79900\` (like a column value).

| SQL term | MongoDB term |
|---|---|
| database | database |
| table | collection |
| row | document |
| column | field |
| primary key | \`_id\` field |
| JOIN | embedding or \`$lookup\` |

A document can hold **arrays** and **embedded (nested) documents**, so one order document can carry its own list of items. In SQL you would need a separate \`order_items\` table.

Every document **must** have a unique \`_id\` field. If you do not give one, MongoDB creates an \`ObjectId\` for you (Day 2 covers this in detail).`,
      syntax: `// one document in the "orders" collection
{
  _id: 1001,
  customerId: 101,
  status: 'delivered',
  orderDate: ISODate('2025-01-10T10:15:00Z'),
  items: [                                  // array of embedded documents
    { productId: 3, qty: 1, price: 17999 },
    { productId: 7, qty: 2, price: 1299 }
  ],
  total: 20597
}`,
      tip: 'Collections and databases are created automatically the first time you insert a document. There is no CREATE TABLE step.',
    },
    {
      heading: 'BSON: how MongoDB really stores documents',
      content: `You write documents as JSON-like objects, but MongoDB stores them as **BSON** (Binary JSON). BSON is a binary format that is fast to scan and supports **more data types than JSON**.

JSON only knows string, number, boolean, null, array and object. BSON adds types that real applications need:

- **ObjectId** – 12-byte unique id (default type of \`_id\`)
- **Date** – a real date-time (shown as \`ISODate('...')\` in mongosh), stored in UTC
- **Int32 / Int64 (Long) / Double / Decimal128** – different number types; use **Decimal128** for exact money values in banking-type apps
- **Binary data**, **Regular expression**, **Timestamp**, **Boolean**, **Null**, **Array**, **Object** (embedded document)

Limits to remember: a single document can be at most **16 MB**, and documents can be nested up to 100 levels deep. If you need to store large files (videos, big PDFs) use **GridFS** or, more commonly, cloud storage like S3 and keep only the URL in MongoDB.`,
      points: [
        'JSON = text format for humans and APIs; BSON = binary format for storage and the wire protocol',
        'Dates must be stored as Date type (ISODate), not as strings, so you can sort and compare them',
        'Max document size: 16 MB',
        'The $type operator / aggregation expression tells you a field\'s BSON type',
      ],
    },
    {
      heading: 'Flexible schema – and why it still needs discipline',
      content: `MongoDB has a **flexible schema**: documents in the same collection do not have to share the same fields. A product of category "Mobiles" can have a \`ram\` field while a "Speaker" does not.

This is great for:
- Fast development – change the shape of data without migrations
- Data that really varies (product catalogues, user profiles, CMS content, event logs)

But "flexible" does not mean "messy". In real projects the shape of data is controlled by:
- **Mongoose schemas** in your Node.js code (Module 4)
- **$jsonSchema validators** on the collection (Day 14)

A good rule: **model your data around how your application reads it**. Data that is read together should be stored together.`,
      tip: 'A common fresher mistake is storing the same field with different types (price as "79900" string in some documents and 79900 number in others). Range queries like $gt then silently miss documents.',
    },
    {
      heading: 'When to choose MongoDB (and when not to)',
      content: `**MongoDB is a great fit when:**
- Your data is naturally hierarchical / JSON-shaped (orders with items, posts with comments, user profiles)
- The structure changes often (startups, MVPs, product catalogues with different attributes)
- You need horizontal scaling for large data and high traffic (built-in **sharding**)
- You build JavaScript/Node.js apps (MERN) and want the same object shape end to end
- Use cases: e-commerce catalogues, content management, real-time analytics, IoT, mobile backends, gaming profiles

**A SQL database may be better when:**
- Data is highly relational with many-to-many joins in almost every query (accounting ledgers, ERP)
- You need complex multi-table transactions everywhere and strict, rarely-changing structure
- Your team and reporting tools are heavily SQL-based

Modern MongoDB (8.0) supports multi-document ACID transactions, joins with \`$lookup\`, and schema validation, so the gap is smaller than it used to be. The decision is about **data shape and access patterns**, not about which one is "better".`,
    },
    {
      heading: 'Installing the tools: MongoDB Server, mongosh, Compass and Atlas',
      content: `You need three tools locally and one cloud account:

1. **MongoDB Community Server 8** – the database itself (\`mongod\` process).
   - Windows/macOS: download the installer from mongodb.com/try/download/community (tick "Install MongoDB as a Service" on Windows).
   - Ubuntu: add the official MongoDB apt repository, then \`sudo apt install mongodb-org\` and \`sudo systemctl start mongod\`.
   - The server listens on port **27017** by default.
2. **mongosh** (MongoDB Shell 2.x) – the command-line client where you type queries. Run \`mongosh\` to connect to \`mongodb://localhost:27017\`.
3. **MongoDB Compass** – the official GUI to browse documents, run queries, build aggregations visually and look at indexes and explain plans.
4. **MongoDB Atlas** – MongoDB's cloud service. The **M0 free tier** gives you a 512 MB cluster (a 3-node replica set) – perfect for learning and for deploying MERN projects.

**Creating a free Atlas cluster (step by step):**
1. Sign up at mongodb.com/cloud/atlas and create an Organization + Project.
2. Click **Create** → choose **M0 Free**, a provider (AWS/GCP/Azure) and the region closest to you (e.g. Mumbai ap-south-1).
3. **Database Access** → add a database user with a username and a strong password.
4. **Network Access** → add your current IP address (avoid 0.0.0.0/0 except for quick experiments).
5. Click **Connect** → copy the connection string \`mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/\`.
6. Paste it into Compass, mongosh (\`mongosh "mongodb+srv://..." --username asha\`) or your Node app's \`.env\` file.

In this course you can practise every query directly in the **MongoDB Shell Lab** in the app – it has three ready datasets: \`shop\`, \`college\` and \`blog\`.`,
      syntax: `# check the installation
mongod --version          # server version (8.x)
mongosh --version         # shell version (2.x)

# connect to the local server
mongosh                                  # same as mongosh "mongodb://localhost:27017"

# connect to Atlas
mongosh "mongodb+srv://cluster0.abcde.mongodb.net/" --username asha`,
      tip: 'Never commit your Atlas connection string (it contains the password) to GitHub. Keep it in a .env file that is listed in .gitignore.',
    },
    {
      heading: 'Your first mongosh commands',
      content: `mongosh is a JavaScript REPL connected to MongoDB, so you can use variables, loops and functions. The most used navigation commands:

- \`show dbs\` – list databases
- \`use shop\` – switch to (or create on first insert) the \`shop\` database
- \`db\` – print the current database name
- \`show collections\` – list collections in the current database
- \`db.products.findOne()\` – look at one document
- \`db.products.countDocuments()\` – count documents
- \`db.products.find()\` – show documents (mongosh shows 20 at a time; type \`it\` for more)

The pattern is always \`db.<collection>.<method>(...)\`. Tomorrow you will learn all the CRUD methods in detail.`,
      syntax: `show dbs
use shop
show collections
db.products.findOne()
db.products.countDocuments()`,
    },
  ],
  examples: [
    {
      title: 'Explore the databases and collections',
      scenario: 'You just connected to a MongoDB server and want to see which databases exist and which collections the college database contains.',
      steps: [
        'Open the MongoDB Shell Lab (or mongosh in a terminal)',
        'Type show dbs to list all databases',
        'Switch to the college database with use college',
        'List its collections with show collections and confirm the current database with db.getName()',
      ],
      code: `show dbs
use college
show collections
db.getName()`,
      mongo: {
        dataset: 'shop',
        query: `show dbs
use college
show collections
db.getName()`,
      },
      result: `shop         32 documents
college      27 documents
blog         13 documents
switched to db college
courses
enrollments
students
'college'`,
      explanation: '`show dbs` lists every database with its size (the Lab shows document counts; real mongosh shows disk size like 72.00 KiB). `use college` switches the current database, so `db` now points to college. `show collections` lists its three collections. Note that `use` does not create anything by itself – a new database appears only after you insert the first document.',
    },
    {
      title: 'Look at one document and count a collection',
      scenario: 'Before writing queries, a developer always checks what a document looks like. Inspect one customer of the shop and count how many customers and orders exist.',
      steps: [
        'Select the shop dataset',
        'Run db.customers.findOne() to print the first customer document',
        'Run countDocuments() on customers and orders',
        'Notice the field names and types (string, number, boolean, date)',
      ],
      code: `db.customers.findOne()
db.customers.countDocuments()
db.orders.countDocuments()`,
      mongo: {
        dataset: 'shop',
        query: `db.customers.findOne()
db.customers.countDocuments()
db.orders.countDocuments()`,
      },
      result: `{
  _id: 101,
  name: 'Asha Patil',
  email: 'asha@example.com',
  city: 'Pune',
  age: 24,
  prime: true,
  joined: ISODate('2024-02-11T00:00:00.000Z')
}
8
12`,
      explanation: '`findOne()` returns a single document (the first in natural order) – a quick way to learn the shape of a collection. The `joined` field is a real BSON Date, displayed as `ISODate(...)`. `countDocuments()` returns how many documents match a filter (empty filter = all).',
    },
    {
      title: 'See BSON types with $type',
      scenario: 'A teammate is not sure whether price is stored as a number or a string. Use the $type aggregation expression to print the BSON type of several product fields.',
      steps: [
        'Open the shop dataset',
        'Use aggregate with a $project stage that returns { $type: "$field" } for price, rating and tags',
        'Limit to 2 documents so the output is short',
        'Read the type names: int, double, array',
      ],
      code: `db.products.aggregate([
  { $project: { name: 1, priceType: { $type: '$price' }, ratingType: { $type: '$rating' }, tagsType: { $type: '$tags' } } },
  { $limit: 2 }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.products.aggregate([
  { $project: { name: 1, priceType: { $type: '$price' }, ratingType: { $type: '$rating' }, tagsType: { $type: '$tags' } } },
  { $limit: 2 }
])`,
      },
      result: `[
  {
    _id: 1,
    name: 'iPhone 15',
    priceType: 'int',
    ratingType: 'double',
    tagsType: 'array'
  },
  {
    _id: 2,
    name: 'Galaxy S24',
    priceType: 'int',
    ratingType: 'double',
    tagsType: 'array'
  }
]`,
      explanation: 'BSON distinguishes `int` (whole numbers like 79900), `double` (4.7) and `array`. `$type` is very useful when cleaning data: if some documents show `string` for price, your numeric queries will miss them. Aggregation is covered fully on Day 5 – here we only borrow `$project` to inspect types.',
    },
    {
      title: 'Flexible schema: two different shapes in one collection',
      scenario: 'The shop starts selling a gaming laptop that has extra specs (ram, gpu) that other products do not have. Insert it and read it back – no schema change is needed.',
      steps: [
        'Open the shop dataset',
        'Insert a product that has an embedded specs document with fields that no other product has',
        'Find it by name to see the stored document',
        'Find an old product too and compare the two shapes',
      ],
      code: `db.products.insertOne({
  _id: 13,
  name: 'ROG Strix G16',
  brand: 'ASUS',
  category: 'Laptops',
  price: 139990,
  stock: 4,
  specs: { ram: '16GB', gpu: 'RTX 4060' },
  tags: ['gaming', 'windows']
})
db.products.find({ _id: { $in: [5, 13] } })`,
      mongo: {
        dataset: 'shop',
        query: `db.products.insertOne({
  _id: 13,
  name: 'ROG Strix G16',
  brand: 'ASUS',
  category: 'Laptops',
  price: 139990,
  stock: 4,
  specs: { ram: '16GB', gpu: 'RTX 4060' },
  tags: ['gaming', 'windows']
})
db.products.find({ _id: { $in: [5, 13] } })`,
      },
      result: `{ acknowledged: true, insertedId: 13 }
{
  _id: 5,
  name: 'IdeaPad Slim 3',
  brand: 'Lenovo',
  category: 'Laptops',
  price: 45990,
  stock: 15,
  rating: 4.1,
  tags: [ 'windows', 'budget' ]
}
{
  _id: 13,
  name: 'ROG Strix G16',
  brand: 'ASUS',
  category: 'Laptops',
  price: 139990,
  stock: 4,
  specs: { ram: '16GB', gpu: 'RTX 4060' },
  tags: [ 'gaming', 'windows' ]
}`,
      explanation: 'In SQL you would need `ALTER TABLE products ADD COLUMN ram ...` (or a separate specs table). In MongoDB the new document simply carries the extra `specs` embedded document. We passed `_id: 13` ourselves; if you omit `_id`, MongoDB generates an ObjectId. Flexible does not mean careless – Day 10 adds Mongoose schemas to keep shapes consistent.',
    },
    {
      title: 'Connecting from Node.js to Atlas (real project code)',
      scenario: 'Your MERN backend needs to talk to the free Atlas cluster you created. Connect with the official MongoDB Node.js driver using an environment variable.',
      steps: [
        'Create a folder, run npm init -y and npm install mongodb dotenv',
        'Create a .env file with MONGODB_URI=<your Atlas connection string> and add .env to .gitignore',
        'Create index.js with the code below',
        'Run node index.js – it pings the server and prints the number of products',
      ],
      code: `// .env  (never commit this file)
// MONGODB_URI=mongodb+srv://asha:StrongPass123@cluster0.abcde.mongodb.net/shop?retryWrites=true&w=majority

// index.js  (Node.js 22, mongodb driver v6)
require('dotenv').config();
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

async function main() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Connected to MongoDB Atlas');

    const products = client.db('shop').collection('products');
    const count = await products.countDocuments();
    console.log('Products in shop:', count);
  } finally {
    await client.close();
  }
}

main().catch(console.error);`,
      result: `Connected to MongoDB Atlas
Products in shop: 12        (if you imported the same shop data into Atlas)`,
      explanation: 'The connection string starting with `mongodb+srv://` uses DNS to find all members of the Atlas replica set. `retryWrites=true&w=majority` are the recommended defaults. In MERN projects you will usually use **Mongoose** (Module 4) on top of this driver, but the connection string and the .env pattern are the same. Create only ONE client per application and reuse it – do not connect on every request.',
    },
  ],
  interview: [
    {
      q: 'What is MongoDB?',
      a: 'MongoDB is an open-source, document-oriented NoSQL database. It stores data as flexible JSON-like documents (internally BSON) grouped in collections, supports rich queries, indexes, aggregation, replication (replica sets), sharding for horizontal scaling and multi-document ACID transactions.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between SQL and NoSQL databases?',
      a: 'SQL databases are relational: data in tables with a fixed schema, related through foreign keys and JOINs, scaled mainly vertically. NoSQL databases (document, key-value, wide-column, graph) use other models, usually have a flexible schema, are designed to scale horizontally and store related data together (e.g. embedded documents). The choice depends on data shape, consistency needs and access patterns.',
      level: 'Easy',
    },
    {
      q: 'Map SQL terms to MongoDB terms.',
      a: 'Database → database, table → collection, row → document, column → field, primary key → _id, JOIN → embedding or $lookup, index → index, GROUP BY → $group in an aggregation pipeline.',
      level: 'Easy',
    },
    {
      q: 'What is BSON and why does MongoDB use it instead of JSON?',
      a: 'BSON is Binary JSON – a binary-encoded serialization of JSON-like documents. It is faster to traverse (length prefixes let the server skip fields), and supports extra types JSON lacks: ObjectId, Date, Int32/Int64/Double/Decimal128, binary data, regex, timestamp. JSON is still used at the API level; drivers convert between them.',
      level: 'Medium',
    },
    {
      q: 'What is the maximum size of a MongoDB document and how do you store bigger files?',
      a: '16 MB per document. For larger files use GridFS (splits the file into 255 KB chunks across two collections) or, more commonly in production, object storage like Amazon S3 / Cloudinary and store only the URL and metadata in MongoDB.',
      level: 'Medium',
    },
    {
      q: 'What does "schema-less" or "flexible schema" mean? Is it really schema-less?',
      a: 'Documents in one collection do not have to share the same fields or types – MongoDB does not force a table definition. But applications still have an implicit schema. In practice we enforce it with Mongoose schemas or with $jsonSchema validation rules on the collection, so "flexible schema" is more accurate than "schema-less".',
      level: 'Medium',
    },
    {
      q: 'When would you NOT choose MongoDB?',
      a: 'When the data is highly relational and almost every query joins many tables (accounting ledgers, ERP), when you need complex multi-table transactions everywhere, or when the team/tools are built around SQL reporting. MongoDB can do joins and transactions, but if they dominate the workload a relational database is the more natural fit.',
      level: 'Medium',
    },
    {
      q: 'What are mongod, mongosh and Compass?',
      a: 'mongod is the database server process (default port 27017). mongosh is the modern JavaScript-based command-line shell used to connect and run queries/admin commands. Compass is the official GUI for browsing data, building queries and aggregations, viewing indexes and explain plans.',
      level: 'Easy',
    },
    {
      q: 'What is MongoDB Atlas and what does the free tier give you?',
      a: 'Atlas is MongoDB\'s fully managed cloud database service on AWS, Azure and GCP. It handles provisioning, backups, monitoring, scaling and security. The M0 free cluster is a 3-node replica set with 512 MB storage – enough for learning and small projects, but without some features like dedicated performance tools and continuous backups.',
      level: 'Easy',
    },
    {
      q: 'Why is MongoDB popular in the MERN stack?',
      a: 'Because data stays in the same JSON/JavaScript object shape from the database (BSON documents) through the Node/Express API (JS objects) to the React frontend (JSON). There is no object-relational mapping mismatch, Mongoose gives schemas and validation, and Atlas makes deployment easy.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between mongodb:// and mongodb+srv:// connection strings?',
      a: 'mongodb:// lists host:port pairs explicitly (e.g. mongodb://localhost:27017). mongodb+srv:// gives one hostname; the driver looks up a DNS SRV record to discover all replica set members and TLS is enabled by default. Atlas uses mongodb+srv:// so you do not need to update your app when nodes change.',
      level: 'Hard',
    },
    {
      q: 'Does MongoDB support ACID transactions?',
      a: 'Yes. Single-document operations have always been atomic. Since MongoDB 4.0 multi-document transactions are supported on replica sets and since 4.2 on sharded clusters. Good schema design (embedding related data) means most operations need only single-document atomicity, so transactions are used only where truly required (e.g. money transfer).',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write a comparison table (at least 6 rows) between MySQL and MongoDB covering data model, schema, relationships, scaling, query language and a typical use case.',
      hint: 'Think about tables vs collections, fixed vs flexible schema, JOIN vs embed/$lookup, vertical vs horizontal scaling.',
      solution: `| Point | MySQL | MongoDB |
|---|---|---|
| Data model | Tables, rows, columns | Collections, documents (BSON), fields |
| Schema | Fixed – ALTER TABLE to change | Flexible – enforce with Mongoose / $jsonSchema |
| Relationships | Foreign keys + JOIN | Embedding or references + $lookup |
| Scaling | Mainly vertical (read replicas) | Horizontal with sharding + replica sets |
| Query language | SQL (SELECT ... WHERE ...) | MQL: db.coll.find({ ... }), aggregation pipeline |
| Transactions | ACID, multi-table, very mature | Single-doc atomic; multi-doc ACID since 4.0 |
| Typical use | Banking ledger, ERP, billing | Product catalogue, CMS, user profiles, IoT, MERN apps |`,
    },
    {
      task: 'Using the college dataset, switch to the college database, list its collections, print one student document and count the students and the courses.',
      hint: 'use, show collections, findOne(), countDocuments().',
      solution: `use college
show collections
db.students.findOne()
db.students.countDocuments()   // 10
db.courses.countDocuments()    // 5`,
    },
    {
      task: 'Using $type, show the BSON type of the cgpa, skills and marks fields for the first 2 students in the college dataset.',
      hint: 'aggregate with $project and { $type: "$cgpa" }, then $limit.',
      solution: `db.students.aggregate([
  { $project: { name: 1, cgpaType: { $type: '$cgpa' }, skillsType: { $type: '$skills' }, marksType: { $type: '$marks' } } },
  { $limit: 2 }
])
// cgpa → 'double', skills → 'array', marks → 'object' (embedded document)`,
    },
    {
      task: 'Create a free Atlas M0 cluster, create a database user and allow your IP, then connect from mongosh and from a Node.js script that reads the URI from .env and prints "Connected".',
      hint: 'Atlas → Database Access, Network Access, Connect → Drivers. Use dotenv and MongoClient.',
      solution: `# terminal
mongosh "mongodb+srv://cluster0.abcde.mongodb.net/" --username asha

// .env
MONGODB_URI=mongodb+srv://asha:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority

// index.js
require('dotenv').config();
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);
(async () => {
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  console.log('Connected');
  await client.close();
})();

// .gitignore
node_modules
.env`,
    },
    {
      task: 'Design (on paper) a MongoDB document for a food-delivery order that includes the restaurant name, the delivery address and a list of ordered dishes with quantity and price. Then insert it into a new collection called foodOrders in the shop dataset and read it back.',
      hint: 'Use an embedded document for the address and an array of embedded documents for dishes. Give _id yourself so the output is predictable.',
      solution: `db.foodOrders.insertOne({
  _id: 1,
  restaurant: 'Vaishali, Pune',
  address: { line1: 'FC Road', city: 'Pune', pin: '411004' },
  dishes: [
    { name: 'Masala Dosa', qty: 2, price: 120 },
    { name: 'Filter Coffee', qty: 2, price: 50 }
  ],
  total: 340,
  placedAt: ISODate('2025-06-01T13:30:00Z')
})
db.foodOrders.find()
show collections   // foodOrders now exists – created automatically`,
    },
  ],
  quiz: [
    {
      question: 'In MongoDB, what is the equivalent of a SQL table?',
      options: ['Document', 'Collection', 'Field', 'Cluster'],
      answer: 1,
      explanation: 'A collection groups related documents, like a table groups rows. A document is like a row and a field is like a column.',
    },
    {
      question: 'Which statement about BSON is correct?',
      options: [
        'BSON is a text format that is identical to JSON',
        'BSON is only used by Mongoose, not by MongoDB',
        'BSON is a binary format that supports extra types like ObjectId and Date',
        'BSON cannot store arrays',
      ],
      answer: 2,
      explanation: 'BSON (Binary JSON) is how MongoDB stores documents and sends them over the network. It adds types such as ObjectId, Date, Decimal128 and binary data.',
    },
    {
      question: 'What is the maximum size of a single MongoDB document?',
      options: ['16 MB', '1 MB', '64 MB', 'Unlimited'],
      answer: 0,
      explanation: 'The BSON document size limit is 16 MB. Use GridFS or object storage for larger files.',
    },
    {
      question: 'Which tool is the official graphical user interface for MongoDB?',
      options: ['mongod', 'mongosh', 'Atlas CLI', 'MongoDB Compass'],
      answer: 3,
      explanation: 'Compass is the GUI. mongod is the server, mongosh is the command-line shell, and the Atlas CLI manages Atlas resources.',
    },
    {
      question: 'Which use case is usually the BEST fit for MongoDB?',
      options: [
        'A double-entry accounting ledger with joins on every query',
        'A product catalogue where different categories have different attributes',
        'A system that must only ever use SQL reporting tools',
        'A spreadsheet with exactly two fixed columns',
      ],
      answer: 1,
      explanation: 'A catalogue with varying attributes fits the flexible document model perfectly. Heavily relational, join-everywhere workloads fit SQL better.',
    },
  ],
};
