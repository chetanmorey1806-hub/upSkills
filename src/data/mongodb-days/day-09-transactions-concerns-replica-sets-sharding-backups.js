export default {
  id: 'day-09-transactions-concerns-replica-sets-sharding-backups',
  title: 'Transactions, Write & Read Concerns, Replica Sets, Sharding and Backups (mongodump / mongorestore)',
  module: 'Module 3: Data Modeling',
  day: 9,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Production databases must stay correct when many users write at once, when a server crashes and when data grows beyond one machine. Today you learn single-document atomicity, multi-document ACID transactions, write and read concerns, how replica sets give high availability, how sharding scales horizontally, and how to back up and restore with mongodump and mongorestore.',
  objectives: [
    'Use single-document atomic updates (conditional $inc, findOneAndUpdate) to avoid race conditions',
    'Write a multi-document ACID transaction with the Node.js driver and with Mongoose',
    'Explain write concern (w, j, wtimeout) and read concern / read preference',
    'Describe how a replica set elects a primary and how failover works',
    'Explain sharding, shard keys and good vs bad shard key choices',
    'Back up and restore databases with mongodump, mongorestore, mongoexport and mongoimport',
  ],
  theory: [
    {
      heading: 'Atomicity: single-document first',
      content: `**Atomic** means "all or nothing". In MongoDB **every write to a single document is atomic** – even if it changes many fields, embedded documents and arrays. Nobody can ever read a half-updated document.

This is why good schema design (Day 8) reduces the need for transactions: if an order and its items are in one document, saving them is one atomic write.

**Race condition example:** two customers buy the last MacBook at the same moment. A naive app does:
1. read product → stock is 1
2. if stock > 0 → set stock = stock - 1

Both requests read 1, both decrease, stock becomes -1 and you sold one laptop twice.

**Fix: put the condition inside the update** so the check and the change happen atomically on the server:

\`db.products.updateOne({ _id: 4, stock: { $gte: 1 } }, { $inc: { stock: -1 } })\`

If \`matchedCount\` is 0, the item is out of stock. Use \`findOneAndUpdate\` when you also need the updated document back (e.g. to generate an invoice number from a counter).`,
      tip: 'Never do "read, change in JavaScript, write back" for counters or stock. Use $inc with a condition in the filter.',
    },
    {
      heading: 'Multi-document ACID transactions',
      content: `Sometimes one business action must change **several documents** or collections together – e.g. a wallet transfer (debit Asha, credit Ravi) or "create order + reduce stock of 3 products". If the server fails halfway, you must not lose money.

MongoDB supports multi-document **ACID transactions** (since 4.0 on replica sets, 4.2 on sharded clusters):
- **A**tomicity – all operations commit or none do
- **C**onsistency – data moves from one valid state to another
- **I**solation – other clients do not see uncommitted changes (snapshot isolation)
- **D**urability – committed data survives crashes (with write concern majority)

**Rules to remember:**
- Transactions require a **replica set or sharded cluster** (Atlas clusters, even M0, are replica sets). A standalone local \`mongod\` cannot run them unless you start it as a single-node replica set.
- Use a **session**: \`client.startSession()\` and pass \`{ session }\` to every operation.
- Prefer \`session.withTransaction(callback)\` – it commits, aborts on error and **retries** on transient errors (e.g. \`TransientTransactionError\`, write conflicts).
- Keep transactions **short** (default limit 60 seconds) and touch few documents. They hold locks and cost performance.
- Transactions are not a replacement for good schema design.`,
      syntax: `const session = client.startSession();
try {
  await session.withTransaction(async () => {
    await accounts.updateOne({ _id: 'A' }, { $inc: { balance: -500 } }, { session });
    await accounts.updateOne({ _id: 'B' }, { $inc: { balance: 500 } }, { session });
  });
} finally {
  await session.endSession();
}`,
    },
    {
      heading: 'Write concern: how sure do you want to be?',
      content: `**Write concern** tells MongoDB how many servers must confirm a write before the driver says "success".

- \`w: 1\` – the primary has applied the write (fast, but if the primary crashes before replicating, the write can be rolled back).
- \`w: 'majority'\` – a majority of replica set members have the write (**default since MongoDB 5.0**). Survives failover.
- \`w: 0\` – fire and forget, no acknowledgement (only for unimportant logs/metrics).
- \`j: true\` – the write is written to the on-disk **journal** before acknowledging.
- \`wtimeout: 5000\` – stop waiting after 5 s (the write may still complete later).

**Analogy:** sending an important document by courier. \`w: 0\` = drop it in the post box. \`w: 1\` = the local office signed for it. \`w: 'majority'\` = most branch offices have a copy, so even if one office burns down the document survives.

In connection strings you usually see \`?retryWrites=true&w=majority\`.`,
      syntax: `db.orders.insertOne(
  { _id: 2001, customerId: 101, total: 4999 },
  { writeConcern: { w: 'majority', j: true, wtimeout: 5000 } }
)`,
    },
    {
      heading: 'Read concern and read preference',
      content: `**Read concern** controls **which version** of data a read can see:
- \`local\` (default) – the latest data on the node you read from, which might later be rolled back.
- \`majority\` – only data acknowledged by a majority (will not be rolled back).
- \`snapshot\` – a consistent point-in-time view (used inside transactions).
- \`linearizable\` – strongest guarantee for single-document reads, slowest.

**Read preference** controls **which member** of the replica set serves the read:
- \`primary\` (default) – always up-to-date
- \`primaryPreferred\`, \`secondary\`, \`secondaryPreferred\` – offload reads to secondaries; data may be slightly stale (replication lag)
- \`nearest\` – lowest network latency (good for globally distributed clusters)

Use secondaries for analytics/reporting where a few seconds of staleness is fine. Keep user-facing "read your own write" flows on the primary.`,
      syntax: `// connection string options
mongodb+srv://user:pass@cluster0.abcde.mongodb.net/shop?readPreference=secondaryPreferred&readConcernLevel=majority

// per query in mongosh
db.orders.find({ status: 'delivered' }).readPref('secondary')`,
    },
    {
      heading: 'Replica sets: high availability',
      content: `A **replica set** is a group of \`mongod\` servers that keep **copies of the same data**:
- **1 primary** – receives all writes
- **2 or more secondaries** – copy the primary's operations from the **oplog** (operations log) and apply them
- Optionally an **arbiter** – votes in elections but holds no data (not recommended for production on Atlas)

If the primary stops responding (heartbeats fail for ~10 seconds), the remaining members hold an **election** and a secondary becomes the new primary – usually within seconds. Drivers detect this automatically and, with \`retryWrites=true\`, retry the failed write once.

Why replica sets matter:
- **High availability** – the app keeps working if one server dies
- **Data redundancy** – copies in different zones/data centres
- **Read scaling** – reports can read from secondaries
- **Required** for transactions and change streams

Use an **odd number of voting members** (3, 5) so a majority can always be formed. Every Atlas cluster is a 3-node replica set by default.`,
      syntax: `# local 3-member replica set for learning (three terminals)
mongod --replSet rs0 --port 27017 --dbpath ./data/1
mongod --replSet rs0 --port 27018 --dbpath ./data/2
mongod --replSet rs0 --port 27019 --dbpath ./data/3

// in mongosh connected to 27017
rs.initiate({ _id: 'rs0', members: [
  { _id: 0, host: 'localhost:27017' },
  { _id: 1, host: 'localhost:27018' },
  { _id: 2, host: 'localhost:27019' }
] })
rs.status()        // shows PRIMARY / SECONDARY states`,
    },
    {
      heading: 'Sharding: horizontal scaling',
      content: `**Replication** copies the same data to more servers (availability). **Sharding** splits the data **across** servers (scale). Each **shard** is itself a replica set holding part of the data.

A sharded cluster has three parts:
- **Shards** – replica sets that store chunks of data
- **mongos** – the query router your app connects to; it sends each query to the right shard(s)
- **Config servers** – a replica set that stores metadata (which key ranges live on which shard)

The **shard key** decides how documents are distributed. A good shard key has:
- **High cardinality** (many distinct values) – \`email\`, \`userId\`; not \`gender\` or \`status\`
- **Even frequency** – no single value holds most of the data
- **Non-monotonic** values – a timestamp or ObjectId as a ranged shard key sends all new inserts to one "hot" shard; use a **hashed** shard key or a compound key
- It appears in your most common queries, so mongos can target one shard (**targeted query**) instead of asking all shards (**scatter-gather**)

Since MongoDB 5.0 you can **reshard** a collection with a new key, and since 8.0 resharding and moving collections are much faster – but choosing well at the start is still important.`,
      syntax: `sh.enableSharding('shop')                                   // optional since 6.0
sh.shardCollection('shop.orders', { customerId: 'hashed' }) // hashed: even spread of writes
sh.shardCollection('shop.events', { tenantId: 1, createdAt: 1 }) // compound ranged key
sh.status()`,
      tip: 'Do not shard too early. A single replica set with good indexes handles very large apps. Shard when data or write load exceeds what one replica set (vertical scaling) can handle.',
    },
    {
      heading: 'Backups: mongodump, mongorestore, mongoexport, mongoimport',
      content: `The **MongoDB Database Tools** (separate download) give you command-line backup and import/export:

- **mongodump** – writes a binary **BSON** backup of databases/collections (keeps all types and index definitions).
- **mongorestore** – restores a mongodump backup.
- **mongoexport** – exports a collection to **JSON or CSV** (for Excel, other tools). Not a full-fidelity backup.
- **mongoimport** – imports JSON/CSV/TSV files.

On **Atlas**, use **Cloud Backup** (snapshots and point-in-time restore on paid tiers) for production. mongodump is great for small databases, migrations between clusters and seeding dev data. For a consistent dump of a replica set use \`--oplog\` (full instance dump).

Golden rule: **a backup you never tested restoring is not a backup.** Practise restores regularly.`,
      syntax: `# backup the shop database to ./backup
mongodump --uri="mongodb+srv://asha:PASS@cluster0.abcde.mongodb.net/shop" --out=./backup

# compressed single-file archive
mongodump --uri="$MONGODB_URI" --db=shop --gzip --archive=shop-2025-06-01.gz

# restore (into another cluster), dropping existing collections first
mongorestore --uri="$NEW_URI" --drop ./backup
mongorestore --uri="$NEW_URI" --gzip --archive=shop-2025-06-01.gz

# rename database while restoring: shop → shop_test
mongorestore --uri="$URI" --nsFrom='shop.*' --nsTo='shop_test.*' ./backup

# CSV / JSON export and import
mongoexport --uri="$MONGODB_URI" --collection=orders --type=csv --fields=_id,status,total --out=orders.csv
mongoimport --uri="$MONGODB_URI" --collection=products --file=products.json --jsonArray`,
    },
  ],
  examples: [
    {
      title: 'Prevent overselling with a conditional atomic update',
      scenario: 'Only 6 MacBook Air M3 (product 4) are in stock. One customer buys 2, then another tries to buy 10. The stock check must happen inside the update so it is atomic.',
      steps: [
        'Open the shop dataset',
        'Run updateOne with filter { _id: 4, stock: { $gte: 2 } } and $inc stock by -2',
        'Run a second updateOne that tries to remove 10 with { stock: { $gte: 10 } }',
        'Read the product back and compare matchedCount of both updates',
      ],
      code: `db.products.updateOne({ _id: 4, stock: { $gte: 2 } }, { $inc: { stock: -2 } })
db.products.updateOne({ _id: 4, stock: { $gte: 10 } }, { $inc: { stock: -10 } })
db.products.findOne({ _id: 4 }, { name: 1, stock: 1 })`,
      mongo: {
        dataset: 'shop',
        query: `db.products.updateOne({ _id: 4, stock: { $gte: 2 } }, { $inc: { stock: -2 } })
db.products.updateOne({ _id: 4, stock: { $gte: 10 } }, { $inc: { stock: -10 } })
db.products.findOne({ _id: 4 }, { name: 1, stock: 1 })`,
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
  matchedCount: 0,
  modifiedCount: 0,
  upsertedCount: 0
}
{ _id: 4, name: 'MacBook Air M3', stock: 4 }`,
      explanation: 'The first update matches (6 ≥ 2) and stock becomes 4. The second matches 0 documents because 4 < 10, so nothing changes – your API checks `matchedCount === 0` and returns "Out of stock". Because filter + update run as one atomic operation on the server, two parallel requests can never both pass the check for the last unit.',
    },
    {
      title: 'findOneAndUpdate: change state and get the new document',
      scenario: 'The warehouse ships pending order 1007. You must change the status only if it is still pending, record the event in a history array and return the updated order to the API in one step.',
      steps: [
        'Open the shop dataset',
        'Call findOneAndUpdate with filter { _id: 1007, status: "pending" }',
        'Use $set for the status and $push for a history entry',
        'Pass { returnDocument: "after" } to receive the updated document',
      ],
      code: `db.orders.findOneAndUpdate(
  { _id: 1007, status: 'pending' },
  { $set: { status: 'shipped' }, $push: { history: { status: 'shipped', at: ISODate('2025-03-10T09:00:00Z') } } },
  { returnDocument: 'after' }
)`,
      mongo: {
        dataset: 'shop',
        query: `db.orders.findOneAndUpdate(
  { _id: 1007, status: 'pending' },
  { $set: { status: 'shipped' }, $push: { history: { status: 'shipped', at: ISODate('2025-03-10T09:00:00Z') } } },
  { returnDocument: 'after' }
)`,
      },
      result: `{
  _id: 1007,
  customerId: 106,
  status: 'shipped',
  payment: 'COD',
  orderDate: ISODate('2025-03-09T20:10:00.000Z'),
  items: [ { productId: 7, qty: 3, price: 1299 } ],
  total: 3897,
  history: [ { status: 'shipped', at: ISODate('2025-03-10T09:00:00.000Z') } ]
}`,
      explanation: 'The status condition in the filter acts like an optimistic lock: if another worker already shipped or cancelled the order, the call returns `null` and nothing changes. Without `returnDocument: "after"` you get the document as it was before the update (useful for audit logs).',
    },
    {
      title: 'Atomic counter for invoice numbers (single-document upsert)',
      scenario: 'Every new order needs a sequential invoice number like INV-1. A counters collection with findOneAndUpdate + $inc gives unique numbers even under heavy load.',
      steps: [
        'Open the shop dataset',
        'Insert a counters document { _id: "invoice", seq: 0 }',
        'Call findOneAndUpdate with $inc seq by 1 and returnDocument "after" twice',
        'Each call returns the next number – no two requests can get the same value',
      ],
      code: `db.counters.insertOne({ _id: 'invoice', seq: 0 })
db.counters.findOneAndUpdate({ _id: 'invoice' }, { $inc: { seq: 1 } }, { returnDocument: 'after' })
db.counters.findOneAndUpdate({ _id: 'invoice' }, { $inc: { seq: 1 } }, { returnDocument: 'after' })`,
      mongo: {
        dataset: 'shop',
        query: `db.counters.insertOne({ _id: 'invoice', seq: 0 })
db.counters.findOneAndUpdate({ _id: 'invoice' }, { $inc: { seq: 1 } }, { returnDocument: 'after' })
db.counters.findOneAndUpdate({ _id: 'invoice' }, { $inc: { seq: 1 } }, { returnDocument: 'after' })`,
      },
      result: `{ acknowledged: true, insertedId: 'invoice' }
{ _id: 'invoice', seq: 1 }
{ _id: 'invoice', seq: 2 }`,
      explanation: 'Both reading and increasing the counter happen in a single atomic document operation. In a real app you would build the label as `"INV-" + doc.seq`. In production with the Node driver you can also pass `upsert: true` so the first call creates the counter automatically.',
    },
    {
      title: 'Wallet transfer with a multi-document transaction (Node.js driver)',
      scenario: 'A UPI-style wallet app moves ₹500 from Asha to Ravi and writes a transfer record. All three writes must succeed together or not at all. (Transactions need a replica set such as an Atlas cluster, so this runs in a real project, not in the Shell Lab.)',
      steps: [
        'Create an Atlas cluster (it is a replica set) and put MONGODB_URI in .env',
        'npm install mongodb dotenv',
        'Create transfer.js with the code below and run node transfer.js',
        'Try transferring more than the balance – the transaction aborts and no balance changes',
      ],
      code: `require('dotenv').config();
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

async function transfer(fromId, toId, amount) {
  const db = client.db('bank');
  const accounts = db.collection('accounts');
  const transfers = db.collection('transfers');
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const debit = await accounts.updateOne(
        { _id: fromId, balance: { $gte: amount } },          // atomic balance check
        { $inc: { balance: -amount } },
        { session }
      );
      if (debit.matchedCount === 0) throw new Error('Insufficient balance');

      await accounts.updateOne({ _id: toId }, { $inc: { balance: amount } }, { session });
      await transfers.insertOne({ fromId, toId, amount, at: new Date() }, { session });
    }, {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    });
    console.log(\`Transferred ₹\${amount} from \${fromId} to \${toId}\`);
  } catch (err) {
    console.log('Transaction aborted:', err.message);
  } finally {
    await session.endSession();
  }
}

(async () => {
  await client.connect();
  await client.db('bank').collection('accounts').deleteMany({});
  await client.db('bank').collection('accounts').insertMany([
    { _id: 'asha', balance: 1000 },
    { _id: 'ravi', balance: 200 },
  ]);
  await transfer('asha', 'ravi', 500);
  await transfer('asha', 'ravi', 900);   // fails: only 500 left
  console.log(await client.db('bank').collection('accounts').find().toArray());
  await client.close();
})();`,
      result: `Transferred ₹500 from asha to ravi
Transaction aborted: Insufficient balance
[ { _id: 'asha', balance: 500 }, { _id: 'ravi', balance: 700 } ]`,
      explanation: '`withTransaction` starts the transaction, runs the callback, commits, and retries automatically on transient errors. Every operation receives `{ session }` – forgetting it is the most common bug (that operation then runs OUTSIDE the transaction). Throwing inside the callback aborts the transaction, so the debit is rolled back and no transfer record is written.',
    },
    {
      title: 'The same transaction with Mongoose + backup before a risky migration',
      scenario: 'In a MERN app you place an order and reduce stock in one transaction using Mongoose. Before deploying a data migration you also take a backup with mongodump and know how to restore it.',
      steps: [
        'In your Express project (Mongoose 8) create services/order.service.js',
        'Use mongoose.connection.transaction() which wraps withTransaction',
        'Before running a migration script, run mongodump with --gzip --archive',
        'If something goes wrong, run mongorestore --drop with the same archive',
      ],
      code: `// services/order.service.js
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Order = require('../models/order.model');

async function placeOrder(customerId, items) {
  return mongoose.connection.transaction(async (session) => {
    let total = 0;
    for (const { productId, qty } of items) {
      const p = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true, session }
      );
      if (!p) throw new Error(\`Product \${productId} is out of stock\`);
      total += p.price * qty;
    }
    const [order] = await Order.create([{ customerId, items, total, status: 'pending' }], { session });
    return order;          // committed only if every step succeeded
  });
}
module.exports = { placeOrder };

# ---- backup / restore around a migration (terminal) ----
mongodump --uri="$MONGODB_URI" --db=shop --gzip --archive=before-migration.gz
node scripts/migrate-prices.js
# something broke? restore exactly the old data:
mongorestore --uri="$MONGODB_URI" --drop --gzip --archive=before-migration.gz`,
      result: `placeOrder(101, [{ productId: 3, qty: 1 }, { productId: 7, qty: 2 }])
→ order document created, stock of 3 and 7 reduced together.
If product 7 had only 1 in stock → Error "Product 7 is out of stock", stock of product 3 is NOT reduced.

mongodump → "done dumping shop.products (12 documents)" ...
mongorestore → "15 document(s) restored successfully. 0 document(s) failed to restore."`,
      explanation: 'With Mongoose, `Model.create()` must receive an **array** when you pass options like `{ session }`. `connection.transaction()` also resets document state if the transaction retries. The dump/restore pair is the simplest safety net for scripts that modify many documents.',
    },
  ],
  interview: [
    {
      q: 'Are writes in MongoDB atomic?',
      a: 'Yes, at the single-document level. Any update to one document (including nested fields and arrays) is atomic. Multi-document atomicity requires a transaction (supported since 4.0 on replica sets and 4.2 on sharded clusters).',
      level: 'Easy',
    },
    {
      q: 'How do you prevent two users from buying the last item at the same time?',
      a: 'Put the stock condition in the update filter so check-and-decrement is one atomic operation: updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } }). If matchedCount is 0 the item is out of stock. Do not read the stock, check in JavaScript and then write.',
      level: 'Medium',
    },
    {
      q: 'What are the requirements and limitations of MongoDB transactions?',
      a: 'They need a replica set or sharded cluster, a client session passed to every operation, and should be short (default 60 s lifetime limit). They have performance costs (locks, write conflicts, cache pressure), and you cannot create collections in some older versions within them. Use withTransaction for automatic retry on TransientTransactionError and UnknownTransactionCommitResult.',
      level: 'Hard',
    },
    {
      q: 'What is write concern? Explain w:1 vs w:"majority".',
      a: 'Write concern is the level of acknowledgement requested for a write. w:1 means only the primary confirmed it – it could be rolled back if the primary fails before replicating. w:"majority" (default since 5.0) waits until a majority of voting members have it, so it survives failover. j:true also waits for the journal write; wtimeout limits the wait.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between read concern and read preference?',
      a: 'Read concern decides what data a read may return (local, available, majority, snapshot, linearizable – i.e. how durable/consistent). Read preference decides which replica set member serves the read (primary, primaryPreferred, secondary, secondaryPreferred, nearest).',
      level: 'Medium',
    },
    {
      q: 'What is a replica set and how does failover work?',
      a: 'A group of mongod processes holding the same data: one primary for writes and secondaries replicating from its oplog. Members exchange heartbeats; if the primary is unreachable (about 10 s election timeout), eligible secondaries call an election and the one with the latest data and majority votes becomes primary. Drivers rediscover the topology and retryable writes retry once.',
      level: 'Medium',
    },
    {
      q: 'What is the oplog?',
      a: 'The operations log – a special capped collection (local.oplog.rs) on each replica set member that records every data-changing operation in an idempotent form. Secondaries tail the primary\'s oplog to replicate. Change streams and point-in-time backups also rely on it.',
      level: 'Hard',
    },
    {
      q: 'Why should a replica set have an odd number of voting members?',
      a: 'An election needs a strict majority of voting members. With 3 members, losing 1 still leaves 2 of 3 (majority). With 4 members, losing 2 leaves 2 of 4 – no majority, so no primary. An odd number gives the best fault tolerance per server.',
      level: 'Medium',
    },
    {
      q: 'What is sharding and what are its components?',
      a: 'Sharding is horizontal partitioning of a collection across multiple shards (each a replica set). Components: shards store the data, mongos routers route queries, and config servers store the cluster metadata (chunk ranges → shards). The shard key determines the distribution.',
      level: 'Medium',
    },
    {
      q: 'How do you choose a good shard key?',
      a: 'High cardinality, even distribution of values, not monotonically increasing for ranged keys (or use hashed), and present in the most frequent queries so they are targeted to one shard instead of scatter-gather. Example: { customerId: "hashed" } for orders, or a compound key like { tenantId: 1, createdAt: 1 } for multi-tenant apps.',
      level: 'Hard',
    },
    {
      q: 'Replication vs sharding?',
      a: 'Replication copies the same data to multiple servers for high availability and redundancy (and read scaling). Sharding splits different parts of the data across servers for write and storage scalability. Production sharded clusters use both: every shard is a replica set.',
      level: 'Easy',
    },
    {
      q: 'How do you back up and restore a MongoDB database?',
      a: 'For small/medium databases: mongodump (BSON backup, optionally --gzip --archive) and mongorestore (with --drop, --nsFrom/--nsTo to rename). For Atlas production use Cloud Backup snapshots with point-in-time restore. mongoexport/mongoimport handle JSON/CSV but are not full-fidelity backups. Always test restores.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'In the shop dataset, a customer wants 3 units of product 6 (Inspiron 15, stock 0). Write the atomic update and show that nothing changes. Then do the same for 3 units of product 5.',
      hint: 'Filter with stock: { $gte: 3 }; check matchedCount.',
      solution: `db.products.updateOne({ _id: 6, stock: { $gte: 3 } }, { $inc: { stock: -3 } })
// matchedCount: 0 → out of stock, stock stays 0
db.products.updateOne({ _id: 5, stock: { $gte: 3 } }, { $inc: { stock: -3 } })
// matchedCount: 1 → stock 15 → 12
db.products.find({ _id: { $in: [5, 6] } }, { name: 1, stock: 1 })`,
    },
    {
      task: 'Cancel order 1012 only if it is still pending, store cancelledAt and a reason, and return the document after the change. Then try to cancel the delivered order 1001 the same way and explain the result.',
      hint: 'findOneAndUpdate with status: "pending" in the filter and returnDocument: "after".',
      solution: `db.orders.findOneAndUpdate(
  { _id: 1012, status: 'pending' },
  { $set: { status: 'cancelled', cancelledAt: ISODate('2025-05-03T10:00:00Z'), reason: 'Changed mind' } },
  { returnDocument: 'after' }
)
db.orders.findOneAndUpdate(
  { _id: 1001, status: 'pending' },
  { $set: { status: 'cancelled' } },
  { returnDocument: 'after' }
)
// second call returns null: order 1001 is 'delivered', so the filter matches nothing
// and a delivered order can never be cancelled by mistake.`,
    },
    {
      task: 'Write a Node.js function using the MongoDB driver that, inside a transaction, moves a student from course C101 to C105 in the enrollments collection and increments a seatsTaken counter in courses for C105 and decrements it for C101.',
      hint: 'startSession, withTransaction, pass { session } everywhere, throw to abort.',
      solution: `async function switchCourse(client, studentId) {
  const db = client.db('college');
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const r = await db.collection('enrollments').updateOne(
        { studentId, courseId: 'C101' },
        { $set: { courseId: 'C105' } },
        { session }
      );
      if (r.matchedCount === 0) throw new Error('Student not enrolled in C101');
      await db.collection('courses').updateOne({ _id: 'C101' }, { $inc: { seatsTaken: -1 } }, { session });
      await db.collection('courses').updateOne({ _id: 'C105' }, { $inc: { seatsTaken: 1 } }, { session });
    }, { writeConcern: { w: 'majority' } });
    return 'switched';
  } finally {
    await session.endSession();
  }
}`,
    },
    {
      task: 'Write the commands to (1) back up only the orders and customers collections of the shop database from Atlas into a gzip archive, (2) restore them into a local database called shop_dev, (3) export delivered orders to CSV.',
      hint: 'mongodump --collection takes one collection per run; to dump several, dump the db and use --excludeCollection for the rest. mongorestore --nsFrom/--nsTo. mongoexport --query.',
      solution: `# 1. backup the shop db WITHOUT products (= orders + customers) into one archive
mongodump --uri="$ATLAS_URI" --db=shop --excludeCollection=products --gzip --archive=shop-orders.gz

# 2. restore locally under a new database name
mongorestore --uri="mongodb://localhost:27017" --gzip --archive=shop-orders.gz --nsFrom='shop.*' --nsTo='shop_dev.*' --drop

# 3. CSV of delivered orders
mongoexport --uri="$ATLAS_URI" --db=shop --collection=orders --query='{"status":"delivered"}' --type=csv --fields=_id,customerId,total,orderDate --out=delivered.csv`,
    },
    {
      task: 'You are sharding a "messages" collection of a chat app (fields: chatId, senderId, sentAt, text). Most queries are "latest 50 messages of a chat". Evaluate these shard keys: { sentAt: 1 }, { senderId: 1 }, { chatId: 1, sentAt: 1 }, { _id: "hashed" }.',
      hint: 'Think: monotonic? targeted queries? hot shards? cardinality?',
      solution: `{ sentAt: 1 } – BAD: monotonically increasing, every new message goes to the last chunk (hot shard); chat queries are scatter-gather.
{ senderId: 1 } – POOR: queries are by chatId, not sender, so they hit all shards; very active users create jumbo chunks.
{ chatId: 1, sentAt: 1 } – GOOD: high cardinality, writes spread across many chats, and "latest 50 of a chat" is a targeted, already-sorted range read on one shard.
{ _id: 'hashed' } – OK for even writes, but every chat query becomes scatter-gather because chatId is not in the key.

Choice: sh.shardCollection('chat.messages', { chatId: 1, sentAt: 1 })`,
    },
  ],
  quiz: [
    {
      question: 'Which MongoDB operations are atomic without a transaction?',
      options: [
        'Any write to a single document',
        'Updates to any number of documents with updateMany',
        'Inserts into two different collections',
        'Nothing is atomic without a transaction',
      ],
      answer: 0,
      explanation: 'Single-document writes are always atomic. updateMany is atomic per document, not for the whole set.',
    },
    {
      question: 'What is required to run a multi-document transaction?',
      options: [
        'A standalone mongod with no options',
        'A replica set (or sharded cluster) and a client session',
        'MongoDB Compass',
        'The $transaction aggregation stage',
      ],
      answer: 1,
      explanation: 'Transactions need replica set / sharded deployments and a session passed to each operation. Atlas clusters are replica sets.',
    },
    {
      question: 'With write concern { w: "majority" } the write is acknowledged when…',
      options: [
        'the driver has sent it',
        'only the primary has applied it',
        'a majority of voting replica set members have applied it',
        'every member including hidden ones has applied it',
      ],
      answer: 2,
      explanation: 'Majority write concern survives primary failover because most members already have the data. It is the default since MongoDB 5.0.',
    },
    {
      question: 'Which shard key is most likely to create a "hot shard" for inserts?',
      options: [
        '{ userId: "hashed" }',
        '{ tenantId: 1, createdAt: 1 }',
        '{ email: 1 }',
        '{ createdAt: 1 } (ranged)',
      ],
      answer: 3,
      explanation: 'A monotonically increasing ranged key sends all new documents to the chunk with the highest values, i.e. one shard.',
    },
    {
      question: 'Which tool creates a full-fidelity BSON backup that mongorestore can restore?',
      options: ['mongoexport', 'mongodump', 'mongoimport', 'mongostat'],
      answer: 1,
      explanation: 'mongodump writes BSON (all types preserved). mongoexport writes JSON/CSV, which can lose type information.',
    },
  ],
};
