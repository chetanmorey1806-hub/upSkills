export default {
  id: 'day-14-security-nosql-injection-schema-validation-best-practices',
  title: 'Security & Best Practices: NoSQL Injection, $jsonSchema Validation, Field-level Design, Limiting Results, Unbounded Arrays',
  module: 'Module 5: Production & Interview',
  day: 14,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Most MongoDB security bugs in MERN apps are not in MongoDB itself – they come from passing user input straight into queries, returning too much data and letting documents grow without limit. Today you learn how NoSQL injection works and how to stop it, how to enforce structure with $jsonSchema validators, and the everyday best practices that keep a production database safe and fast.',
  objectives: [
    'Explain how NoSQL (operator) injection works and reproduce it in the shell',
    'Prevent injection with type checks, validation libraries, sanitizing $ keys and Mongoose strictQuery',
    'Create collection-level schema validation with $jsonSchema (validationLevel, validationAction)',
    'Design fields so sensitive data is never returned (projection, select: false, separate collections)',
    'Always limit results, cap page sizes and avoid unbounded arrays with $push + $slice or separate collections',
  ],
  theory: [
    {
      heading: 'What is NoSQL injection?',
      content: `In SQL injection an attacker sends text like \`' OR 1=1 --\` that changes the meaning of the SQL string. MongoDB queries are **objects**, not strings, so the classic attack does not work – but a different one does: **operator injection**.

Express parses JSON bodies (and query strings like \`?email[$ne]=x\` with some parsers) into **objects**. If your code does this:

\`\`\`
const user = await User.findOne({ email: req.body.email, password: req.body.password });
\`\`\`

and the attacker sends this JSON body:

\`\`\`
{ "email": { "$gt": "" }, "password": { "$ne": null } }
\`\`\`

the query becomes "email greater than empty string AND password not null" – which matches the **first user in the collection**, often the admin. The attacker logs in without knowing any password.

**Analogy:** you asked a visitor to write their name on a form, but they wrote "anyone whose name is not empty". If the guard reads the form literally, everyone gets in.

Other dangerous inputs:
- \`$where\` and \`$function\` – run JavaScript on the server (disable server-side JS with \`--noscripting\` / \`security.javascriptEnabled: false\`; \`$where\` is also deprecated in favour of \`$expr\`)
- \`$regex\` from user input – a crafted pattern like \`(a+)+$\` can cause very slow queries (ReDoS)
- Passing the whole \`req.body\` into \`updateOne\` – the user could send \`{ "$set": { "role": "admin" } }\` or \`{ "role": "admin" }\` (**mass assignment**)`,
      tip: 'Golden rule: never put req.body, req.query or req.params directly into a filter or update. Pick the fields you expect and check their types first.',
    },
    {
      heading: 'Preventing injection: 5 layers of defence',
      content: `1. **Validate types.** An email must be a string. If \`typeof req.body.email !== 'string'\` reject with 400. Libraries like **zod**, **joi** or **express-validator** do this declaratively.
2. **Pick fields explicitly** (whitelist). Build the filter yourself: \`{ email: String(email) }\`, and for updates copy only allowed fields (\`name\`, \`city\`) – never \`role\` or \`isAdmin\`.
3. **Sanitize keys that start with \`$\` or contain \`.\`.** Write a tiny middleware (or use a maintained package) that removes such keys from \`req.body\`. Note: in **Express 5** \`req.query\` is a read-only getter, so validate query values instead of mutating them (older \`express-mongo-sanitize\` mutates req.query and breaks on Express 5).
4. **Use Mongoose safety options.** Mongoose casts values to the schema type, but an object like \`{ $gt: '' }\` is still treated as an operator. Turn on \`sanitizeFilter: true\` – it wraps user-supplied objects in \`$eq\` so they are matched literally (use \`mongoose.trusted()\` for operators you add yourself). Also set \`strictQuery: true\` (the Mongoose 7+ default is \`false\`) so filter paths that are not in the schema are dropped.
5. **Least privilege at the database level.** The app's database user should have \`readWrite\` on its own database only – never \`atlasAdmin\` or \`root\`. Disable server-side JavaScript if you do not need it.`,
      syntax: `// Mongoose 8 – global safety settings (put before creating models)
mongoose.set('strictQuery', true);     // ignore filter paths that are not in the schema
mongoose.set('sanitizeFilter', true);  // { $ne: null } from users becomes { $eq: { $ne: null } }

// zod validation for a login body
const { z } = require('zod');
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});
const { email, password } = LoginSchema.parse(req.body);   // throws on bad input`,
    },
    {
      heading: 'Schema validation inside MongoDB with $jsonSchema',
      content: `Mongoose validation only protects writes that go **through your Node app**. Scripts, other services, admin tools and Compass can still insert bad data. **Collection-level validation** makes MongoDB itself reject invalid documents.

You attach a \`validator\` when creating a collection (or later with \`collMod\`). The most powerful form is \`$jsonSchema\` (JSON Schema draft 4 subset with \`bsonType\`):

- \`required\` – list of fields that must exist
- \`bsonType\` – \`'string'\`, \`'int'\`, \`'double'\`, \`'decimal'\`, \`'date'\`, \`'objectId'\`, \`'array'\`, \`'object'\`, \`'bool'\`
- \`minimum\` / \`maximum\`, \`minLength\` / \`maxLength\`, \`pattern\`, \`enum\`
- \`maxItems\` – limit array length (great against unbounded arrays)
- \`additionalProperties: false\` – reject unknown fields (remember to list \`_id\`)

Two options control behaviour:
- **validationLevel**: \`'strict'\` (default – check all inserts and updates) or \`'moderate'\` (existing invalid documents can still be updated; useful when adding rules to old data)
- **validationAction**: \`'error'\` (default – reject the write) or \`'warn'\` (allow, but log a warning). MongoDB 8 also supports \`'errorAndLog'\`.

When a write fails you get error code **121 "Document failed validation"** with details about which rule failed.`,
      syntax: `db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'passwordHash', 'role'],
      additionalProperties: false,
      properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string', minLength: 2, maxLength: 60 },
        email: { bsonType: 'string', pattern: '^[^@\\\\s]+@[^@\\\\s]+\\\\.[^@\\\\s]+$' },
        passwordHash: { bsonType: 'string', minLength: 50 },
        role: { enum: ['customer', 'seller', 'admin'] },
        addresses: { bsonType: 'array', maxItems: 5 },
        createdAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
})

// add or change rules on an existing collection
db.runCommand({ collMod: 'products', validator: { $jsonSchema: { /* ... */ } }, validationLevel: 'moderate' })

// see the current rules
db.getCollectionInfos({ name: 'users' })[0].options.validator`,
      tip: 'Use both: Mongoose validation for friendly error messages in the API, and $jsonSchema as the last line of defence in the database.',
    },
    {
      heading: 'Field-level design: never leak sensitive data',
      content: `Security is also about **what you return**. Common leaks in fresher projects: sending \`passwordHash\`, \`resetToken\`, \`otp\`, internal flags or other users' emails to the frontend.

Good practices:
- **Projection everywhere** – return only the fields the screen needs: \`find({}, { name: 1, price: 1 })\`.
- **Mongoose \`select: false\`** on sensitive paths (\`password: { type: String, select: false }\`) – they are excluded by default; explicitly add \`.select('+password')\` only in the login code.
- **toJSON transform** – delete \`passwordHash\` and \`__v\` when converting documents to JSON.
- **Separate collections** for very sensitive or rarely-used data (e.g. \`userSecrets\`, \`paymentTokens\`) with stricter roles.
- **Never store** plain passwords (use bcrypt/argon2), full card numbers (use the payment gateway's token), or Aadhaar/PAN in plain text – use **Client-Side Field Level Encryption (CSFLE)** or **Queryable Encryption** (MongoDB 7+/8) for regulated data.
- **Hash or encrypt tokens** (password reset, refresh tokens) before storing them, and give them a TTL index so they expire automatically.`,
      syntax: `// Mongoose – hide the hash by default
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, {
  timestamps: true,
  toJSON: { transform(doc, ret) { delete ret.passwordHash; delete ret.__v; return ret; } },
});

// only the login route asks for it
const user = await User.findOne({ email }).select('+passwordHash');`,
    },
    {
      heading: 'Always limit results and cap page sizes',
      content: `\`db.collection.find()\` with no limit can return millions of documents, use a lot of RAM in Node, and make your API an easy target for denial-of-service.

Rules for production APIs:
- **Every list endpoint is paginated.** Default \`limit\` 10–20; **cap** the maximum (e.g. 50 or 100) no matter what the client sends: \`const limit = Math.min(Number(req.query.limit) || 10, 50)\`.
- **Prefer range (keyset) pagination** for big collections: \`find({ _id: { $gt: lastId } }).sort({ _id: 1 }).limit(20)\` – \`skip(100000)\` still has to walk 100,000 index entries.
- **Whitelist sort fields** – do not let users sort by any field (unindexed sorts are slow and can hit the 100 MB in-memory sort limit).
- **Use \`maxTimeMS\`** to stop runaway queries: \`find(filter).maxTimeMS(2000)\`.
- **Escape user text before using it in \`$regex\`**, and prefer anchored, case-sensitive prefixes (\`^abc\`) which can use an index; for real search use Atlas Search.
- **Rate-limit** search and login endpoints (express-rate-limit).`,
      syntax: `// escape special regex characters from user input
const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
const q = String(req.query.q || '').slice(0, 50);
const filter = q ? { name: { $regex: '^' + escapeRegex(q), $options: 'i' } } : {};
const items = await Product.find(filter).limit(20).maxTimeMS(2000).lean();`,
    },
    {
      heading: 'Avoid unbounded arrays (and other anti-patterns)',
      content: `An **unbounded array** is an array that can grow forever: all comments of a viral post, every login of a user, every reading from an IoT sensor. Problems:

- The document approaches the **16 MB** limit and writes start failing.
- Every read loads the whole array even if you show 10 items.
- Large array updates rewrite big documents and multikey indexes grow huge.

Fixes:
1. **Cap the array** with \`$push: { field: { $each: [newItem], $slice: -N } }\` – keep only the latest N (the **subset pattern**: last 3 comments in the post, the rest in a \`comments\` collection).
2. **Move to a separate collection** with a reference (\`postId\`) and an index on it – the default for anything that can grow without limit.
3. **Bucket pattern** for time-series (one document per sensor per hour), or use native **time-series collections**.
4. Add \`maxItems\` in \`$jsonSchema\` as a safety net.

Other best practices to remember:
- Enable **authentication** and TLS; never expose port 27017 to the internet; on Atlas allow only known IPs / VPC peering / private endpoints.
- Create **one database user per application** with least-privilege roles; rotate passwords; keep secrets in environment variables or a secret manager.
- Turn on **auditing / Atlas alerts**, keep MongoDB and drivers updated, and take regular **backups** and test restores.`,
      tip: 'Interview line: "Arrays are great when they are bounded and read together with the parent. If an array can grow without a known limit, it belongs in its own collection."',
    },
  ],
  examples: [
    {
      title: 'Reproduce a NoSQL injection login bypass',
      scenario: 'A login route does findOne({ email: req.body.email, passwordHash: req.body.passwordHash }). An attacker sends operator objects instead of strings. Simulate it in the shell with a small accounts collection.',
      steps: [
        'Open the shop dataset in the MongoDB Shell Lab',
        'Insert two accounts (an admin and a customer) with explicit _ids',
        'Create a const body that looks like a malicious JSON request body with $gt and $ne operators',
        'Run the same findOne the vulnerable route runs and see that it returns the admin account',
      ],
      code: `db.accounts.insertMany([
  { _id: 1, email: 'admin@shop.in', passwordHash: '$2b$10$adminHashXyz', role: 'admin' },
  { _id: 2, email: 'asha@example.com', passwordHash: '$2b$10$ashaHashAbc', role: 'customer' }
])
// what the attacker sends as JSON: {"email":{"$gt":""},"passwordHash":{"$ne":null}}
const body = { email: { $gt: '' }, passwordHash: { $ne: null } }
db.accounts.findOne({ email: body.email, passwordHash: body.passwordHash }, { email: 1, role: 1 })`,
      mongo: {
        dataset: 'shop',
        query: `db.accounts.insertMany([
  { _id: 1, email: 'admin@shop.in', passwordHash: '$2b$10$adminHashXyz', role: 'admin' },
  { _id: 2, email: 'asha@example.com', passwordHash: '$2b$10$ashaHashAbc', role: 'customer' }
])
// what the attacker sends as JSON: {"email":{"$gt":""},"passwordHash":{"$ne":null}}
const body = { email: { $gt: '' }, passwordHash: { $ne: null } }
db.accounts.findOne({ email: body.email, passwordHash: body.passwordHash }, { email: 1, role: 1 })`,
      },
      result: `{ acknowledged: true, insertedIds: { '0': 1, '1': 2 } }
{ _id: 1, email: 'admin@shop.in', role: 'admin' }`,
      explanation: 'The attacker never typed a real email or password. `{ $gt: "" }` matches every non-empty email and `{ $ne: null }` matches every password hash, so findOne returns the first account – the admin. (A real app compares bcrypt hashes in code, but the same bug appears in any query built straight from req.body, e.g. password-reset tokens or OTP checks.) The fix is to check that each value is a string before querying.',
    },
    {
      title: 'Fix it: type-check input before building the filter',
      scenario: 'Apply the first defence layer: accept only strings, otherwise reject the request. Simulate the same malicious body and a normal body.',
      steps: [
        'Insert the same accounts collection',
        'Write a small safeFilter function that returns null if email is not a string',
        'Call it with the malicious body and with a normal body',
        'Print what happens in each case',
      ],
      code: `db.accounts.insertMany([
  { _id: 1, email: 'admin@shop.in', role: 'admin' },
  { _id: 2, email: 'asha@example.com', role: 'customer' }
])
function safeFilter(body) {
  if (typeof body.email !== 'string') return null
  return { email: body.email.trim().toLowerCase() }
}
const attack = { email: { $gt: '' } }
const normal = { email: 'Asha@Example.com ' }
print('attack filter:', safeFilter(attack) === null ? 'rejected with 400' : 'allowed')
db.accounts.findOne(safeFilter(normal), { email: 1, role: 1 })`,
      mongo: {
        dataset: 'shop',
        query: `db.accounts.insertMany([
  { _id: 1, email: 'admin@shop.in', role: 'admin' },
  { _id: 2, email: 'asha@example.com', role: 'customer' }
])
function safeFilter(body) {
  if (typeof body.email !== 'string') return null
  return { email: body.email.trim().toLowerCase() }
}
const attack = { email: { $gt: '' } }
const normal = { email: 'Asha@Example.com ' }
print('attack filter:', safeFilter(attack) === null ? 'rejected with 400' : 'allowed')
db.accounts.findOne(safeFilter(normal), { email: 1, role: 1 })`,
      },
      result: `{ acknowledged: true, insertedIds: { '0': 1, '1': 2 } }
attack filter: rejected with 400
{ _id: 2, email: 'asha@example.com', role: 'customer' }`,
      explanation: 'Because the attack value is an object, `typeof` is "object", so the request is rejected before MongoDB sees it. The normal string is trimmed and lower-cased (store emails lower-case too) and used as an exact match. In real code use zod/joi/express-validator to do this for every field, and Mongoose `sanitizeFilter` as a second layer.',
    },
    {
      title: 'Return only safe fields and limit the result size',
      scenario: 'An admin "customers" screen needs name, city and age only, sorted by age, 2 per page. Show two safe ways: projection in find, and $unset in an aggregation.',
      steps: [
        'Use find with an exclusion projection to hide email, joined and prime',
        'Add sort and a limit so the API never returns the whole collection',
        'Do the same with an aggregation pipeline using $match and $unset',
        'Compare: neither output contains the email field',
      ],
      code: `db.customers.find({}, { email: 0, joined: 0, prime: 0 }).sort({ age: -1 }).limit(2)
db.customers.aggregate([
  { $match: { city: 'Pune' } },
  { $unset: ['email', 'joined'] }
])`,
      mongo: {
        dataset: 'shop',
        query: `db.customers.find({}, { email: 0, joined: 0, prime: 0 }).sort({ age: -1 }).limit(2)
db.customers.aggregate([
  { $match: { city: 'Pune' } },
  { $unset: ['email', 'joined'] }
])`,
      },
      result: `{ _id: 108, name: 'Karan Mehta', city: 'Delhi', age: 40 }
{ _id: 104, name: 'Imran Khan', city: 'Pune', age: 35 }
[
  { _id: 101, name: 'Asha Patil', city: 'Pune', age: 24, prime: true },
  { _id: 104, name: 'Imran Khan', city: 'Pune', age: 35, prime: false }
]`,
      explanation: 'A projection controls exactly which fields leave the database – less data on the network and no accidental leaks. `limit()` protects the server and the client. In aggregation, `$unset` (or `$project` with 0) removes fields. In Mongoose, mark secrets with `select: false` so you cannot forget the projection.',
    },
    {
      title: 'Keep an embedded array bounded with $push + $slice',
      scenario: 'Post 4 in the blog shows "latest comments" inside the post document. To avoid an unbounded array, keep only the 3 newest comments embedded (the full history lives in a separate comments collection).',
      steps: [
        'Open the blog dataset; post 4 already has 3 comments',
        'Push a new comment using $each and $slice: -3',
        'Read the post back with a projection on comments',
        'Notice the oldest comment was dropped automatically',
      ],
      code: `db.posts.updateOne(
  { _id: 4 },
  { $push: { comments: { $each: [{ userId: 1, text: 'Nice' }], $slice: -3 } } }
)
db.posts.findOne({ _id: 4 }, { comments: 1 })`,
      mongo: {
        dataset: 'blog',
        query: `db.posts.updateOne(
  { _id: 4 },
  { $push: { comments: { $each: [{ userId: 1, text: 'Nice' }], $slice: -3 } } }
)
db.posts.findOne({ _id: 4 }, { comments: 1 })`,
      },
      result: `{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
{
  _id: 4,
  comments: [
    { userId: 4, text: 'More examples please' },
    { userId: 2, text: 'Bookmarked' },
    { userId: 1, text: 'Nice' }
  ]
}`,
      explanation: '`$each` adds the new items and `$slice: -3` keeps only the last 3 elements in the same atomic update, so the array can never grow beyond 3. This is the **subset pattern**: the post page loads fast with recent comments, and "View all comments" queries a separate `comments` collection indexed on `postId`.',
    },
    {
      title: 'Express middleware that blocks operator injection',
      scenario: 'Protect a login API: a middleware removes any key starting with $ (or containing a dot) from req.body, and the route also checks types. Real Express 5 – req.query is read-only, so only the body is sanitized.',
      steps: [
        'Create a folder, npm install express, and paste the code into server.js',
        'Run node server.js',
        'Send a normal login, an injection attempt and a request with a wrong password',
        'Check that the injection attempt is rejected with 400',
      ],
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// in-memory "users" collection (passwords would be bcrypt hashes in real apps)
const users = [
  { id: 1, email: 'admin@shop.in', password: 'Admin@123', role: 'admin' },
  { id: 2, email: 'asha@example.com', password: 'Asha@123', role: 'customer' },
];

// remove keys that start with $ or contain a dot – recursively
function stripOperators(value) {
  if (Array.isArray(value)) return value.map(stripOperators);
  if (value && typeof value === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('$') || k.includes('.')) continue;
      clean[k] = stripOperators(v);
    }
    return clean;
  }
  return value;
}
app.use((req, res, next) => {
  if (req.body) req.body = stripOperators(req.body);
  next();
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password must be strings' });
  }
  const user = users.find((u) => u.email === email.toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ message: 'Logged in', user: { id: user.id, email: user.email, role: user.role } });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/login', body: { email: 'asha@example.com', password: 'Asha@123' } },
          { method: 'POST', url: '/api/login', body: { email: { $gt: '' }, password: { $ne: null } } },
          { method: 'POST', url: '/api/login', body: { email: 'admin@shop.in', password: 'guess' } },
        ],
      },
      result: `POST /api/login → 200 {"message":"Logged in","user":{"id":2,"email":"asha@example.com","role":"customer"}}
POST /api/login → 400 {"error":"email and password must be strings"}
POST /api/login → 401 {"error":"Invalid email or password"}`,
      explanation: 'The sanitizer turns `{ "$gt": "" }` into `{}`, and the type check then rejects it with 400 – two independent layers. The response never includes the password. In a real app you would `findOne({ email })` with Mongoose, `.select("+passwordHash")`, compare with `bcrypt.compare`, and return the same 401 message for "no user" and "wrong password" so attackers cannot discover which emails exist.',
    },
  ],
  interview: [
    {
      q: 'What is NoSQL injection? Give an example.',
      a: 'It is when user input is interpreted as query operators instead of plain values. Example: a login does findOne({ email: req.body.email, password: req.body.password }) and the attacker sends {"email":{"$gt":""},"password":{"$ne":null}} – the filter matches the first user, bypassing authentication. It happens because Express parses JSON (and some query-string formats) into objects.',
      level: 'Easy',
    },
    {
      q: 'How do you prevent NoSQL injection in an Express + Mongoose app?',
      a: '1) Validate input types and shapes with zod/joi/express-validator; 2) build filters from explicitly picked, type-checked fields; 3) strip keys starting with $ or containing dots from req.body; 4) enable Mongoose sanitizeFilter and strictQuery; 5) never pass req.body directly into update operations (mass assignment); 6) disable server-side JavaScript and avoid $where; 7) use least-privilege DB users.',
      level: 'Medium',
    },
    {
      q: 'Why is $where dangerous and what should you use instead?',
      a: '$where executes JavaScript on the server for every document – it is slow (no index use), and if user input reaches it, attackers can run arbitrary JS such as infinite loops (DoS). It is deprecated; use $expr with aggregation operators instead, and disable server-side scripting (security.javascriptEnabled: false).',
      level: 'Medium',
    },
    {
      q: 'What is $jsonSchema validation and how is it different from Mongoose validation?',
      a: '$jsonSchema is a validator stored on the collection inside MongoDB; the server rejects (or warns about) any insert/update that does not match, no matter which client wrote it. Mongoose validation runs only in your Node app, so scripts, other services or Compass can bypass it. Best practice: use both – Mongoose for user-friendly errors, $jsonSchema as the database-level safety net.',
      level: 'Medium',
    },
    {
      q: 'Explain validationLevel and validationAction.',
      a: 'validationLevel decides WHICH writes are checked: "strict" (default) checks all inserts and updates, "moderate" checks inserts and updates to documents that are already valid – existing invalid documents can still be updated. validationAction decides WHAT happens on failure: "error" (default) rejects the write with code 121, "warn" allows it but logs a warning (MongoDB 8 also has "errorAndLog").',
      level: 'Hard',
    },
    {
      q: 'What is mass assignment and how do you prevent it?',
      a: 'Mass assignment is passing the whole request body into a create/update, e.g. User.findByIdAndUpdate(id, req.body). A user could add role: "admin" or isVerified: true. Prevent it by whitelisting fields (const { name, city } = req.body), using DTO/validation schemas that strip unknown keys, and never letting users set protected fields.',
      level: 'Medium',
    },
    {
      q: 'How do you make sure a password hash is never sent to the client?',
      a: 'Use projection or Mongoose select: false on the field so it is excluded by default, explicitly select("+passwordHash") only in login; add a toJSON transform that deletes it; return a DTO with only the needed fields. Also store only bcrypt/argon2 hashes, never plain passwords.',
      level: 'Easy',
    },
    {
      q: 'What is an unbounded array and why is it an anti-pattern?',
      a: 'An array with no upper limit (all comments, all logs, all followers). It can push the document towards the 16 MB limit, makes every read load the whole array, causes expensive updates and large multikey indexes. Fix it by moving items to their own collection with a reference, capping with $push + $each + $slice (subset pattern), or using the bucket pattern / time-series collections.',
      level: 'Medium',
    },
    {
      q: 'Why should every list API have a maximum limit?',
      a: 'Without a cap a client can request limit=1000000 or no limit at all, which loads huge result sets into the server memory, slows down the database for everyone and makes denial-of-service easy. Always set a default (10-20) and a hard maximum (50-100), whitelist sort fields, use maxTimeMS and prefer keyset pagination for large collections.',
      level: 'Easy',
    },
    {
      q: 'How can a $regex search become a security or performance problem?',
      a: 'If user input is used as a raw pattern, attackers can send catastrophic patterns like (a+)+$ that take a very long time (ReDoS), and unanchored or case-insensitive regexes cannot use indexes efficiently, causing collection scans. Escape special characters, limit input length, use anchored prefix searches, set maxTimeMS, and use Atlas Search for real full-text search.',
      level: 'Hard',
    },
    {
      q: 'Which MongoDB features help protect sensitive fields such as Aadhaar or card data?',
      a: 'Client-Side Field Level Encryption (CSFLE) encrypts selected fields in the driver before they are sent, so the server never sees plain text; Queryable Encryption (GA in 7.0, extended in 8.0) also allows equality and range queries on encrypted fields. Combine with TLS in transit, encryption at rest (default on Atlas), role-based access control and auditing. Card numbers should not be stored at all – keep the payment gateway token.',
      level: 'Hard',
    },
    {
      q: 'List five MongoDB production security best practices.',
      a: 'Enable authentication and RBAC with least-privilege users (one per app); enable TLS and never expose 27017 publicly – use IP access lists, VPC peering or private endpoints on Atlas; keep credentials in environment variables/secret managers and rotate them; disable server-side JavaScript if unused; enable auditing and alerts; keep MongoDB and drivers patched; take regular backups and test restores.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write a function safeLoginFilter(body) for an Express route that returns a safe Mongo filter { email } when email and password are non-empty strings, or throws an error with status 400 otherwise. Test it with a normal body and with {"email":{"$ne":null},"password":{"$ne":null}}.',
      hint: 'Check typeof for both fields; trim and lower-case the email. Do not include the password in the filter – compare it with bcrypt after loading the user.',
      solution: `function safeLoginFilter(body = {}) {
  const { email, password } = body;
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    const err = new Error('email and password must be non-empty strings');
    err.status = 400;
    throw err;
  }
  return { email: email.trim().toLowerCase() };
}

console.log(safeLoginFilter({ email: ' Asha@Example.com', password: 'Asha@123' }));
// { email: 'asha@example.com' }

try {
  safeLoginFilter({ email: { $ne: null }, password: { $ne: null } });
} catch (e) {
  console.log(e.status, e.message);   // 400 email and password must be non-empty strings
}

// in the route
// const user = await User.findOne(safeLoginFilter(req.body)).select('+passwordHash');
// const ok = user && await bcrypt.compare(req.body.password, user.passwordHash);`,
    },
    {
      task: 'Create a products collection with a $jsonSchema validator: name (string, 2-100 chars), price (number >= 0), category (one of Mobiles, Laptops, Audio, Wearables, Accessories), stock (int >= 0), tags (array of strings, max 10 items). All except tags are required. Then show one insert that passes and one that fails.',
      hint: 'Use bsonType: ["int","double","decimal"] for price (numbers from mongosh can be int or double). Use items: { bsonType: "string" } and maxItems.',
      solution: `db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'price', 'category', 'stock'],
      properties: {
        name: { bsonType: 'string', minLength: 2, maxLength: 100 },
        price: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 0 },
        category: { enum: ['Mobiles', 'Laptops', 'Audio', 'Wearables', 'Accessories'] },
        stock: { bsonType: 'int', minimum: 0 },
        tags: { bsonType: 'array', maxItems: 10, items: { bsonType: 'string' } }
      }
    }
  },
  validationAction: 'error'
})

db.products.insertOne({ name: 'Pixel 9', price: 79999, category: 'Mobiles', stock: 10, tags: ['5g'] })
// { acknowledged: true, insertedId: ObjectId('...') }

db.products.insertOne({ name: 'X', price: -5, category: 'Toys', stock: 1 })
// MongoServerError: Document failed validation  (code 121)
// errInfo.details shows: name minLength, price minimum, category enum`,
    },
    {
      task: 'In the blog dataset, add a new comment { userId: 5, text: "Thanks!" } to post 1 but keep only the latest 2 comments embedded. Then show the post title and comments.',
      hint: '$push with $each and $slice: -2.',
      solution: `db.posts.updateOne(
  { _id: 1 },
  { $push: { comments: { $each: [{ userId: 5, text: 'Thanks!' }], $slice: -2 } } }
)
db.posts.findOne({ _id: 1 }, { title: 1, comments: 1 })
// comments: [ { userId: 2, text: 'Great diagrams' }, { userId: 5, text: 'Thanks!' } ]`,
    },
    {
      task: 'Write an Express 5 controller getProducts that supports ?page, ?limit, ?sort and ?q safely: default limit 10, max 50, page >= 1, sort only by price, rating or name (prefix "-" for descending), and q is an escaped, anchored, case-insensitive prefix search on name limited to 50 characters. Use Mongoose with lean() and maxTimeMS.',
      hint: 'Do not mutate req.query in Express 5 – just read it. Whitelist sort fields with a Set.',
      solution: `const Product = require('../models/product.model');

const SORTABLE = new Set(['price', 'rating', 'name']);
const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

exports.getProducts = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  let sort = { _id: 1 };
  if (typeof req.query.sort === 'string') {
    const field = req.query.sort.replace(/^-/, '');
    if (SORTABLE.has(field)) sort = { [field]: req.query.sort.startsWith('-') ? -1 : 1 };
  }

  const filter = {};
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    const q = req.query.q.trim().slice(0, 50);
    filter.name = { $regex: '^' + escapeRegex(q), $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Product.find(filter).select('name price rating category')
      .sort(sort).skip((page - 1) * limit).limit(limit).maxTimeMS(2000).lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ page, limit, total, pages: Math.ceil(total / limit), items });
};
// Express 5 forwards rejected promises to the error middleware automatically.`,
    },
    {
      task: 'Create a Mongoose User schema that: stores email lower-case and unique, hides passwordHash by default, restricts role to customer/admin, removes passwordHash and __v from JSON output, and allows at most 5 addresses. Show how the login code fetches the hash.',
      hint: 'select: false, toJSON transform, a validator on the addresses array length.',
      solution: `const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  city: { type: String, required: true },
  pin: { type: String, match: /^[1-9][0-9]{5}$/ },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: {
    type: [addressSchema],
    validate: { validator: (arr) => arr.length <= 5, message: 'Maximum 5 addresses allowed' },
  },
}, {
  timestamps: true,
  toJSON: { transform(doc, ret) { delete ret.passwordHash; delete ret.__v; return ret; } },
});

module.exports = mongoose.model('User', userSchema);

// login service
// const user = await User.findOne({ email }).select('+passwordHash');
// if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError('Invalid email or password', 401);`,
    },
  ],
  quiz: [
    {
      question: 'An attacker sends {"email":{"$ne":null},"password":{"$ne":null}} to a login route that uses findOne(req.body). What is this attack called?',
      options: ['SQL injection', 'Cross-site scripting', 'NoSQL (operator) injection', 'CSRF'],
      answer: 2,
      explanation: 'User input is interpreted as MongoDB query operators ($ne), changing the meaning of the filter. This is NoSQL / operator injection.',
    },
    {
      question: 'Which $jsonSchema option makes MongoDB allow an invalid write but log a warning?',
      options: [
        'validationAction: "warn"',
        'validationLevel: "strict"',
        'validationLevel: "off"',
        'additionalProperties: true',
      ],
      answer: 0,
      explanation: 'validationAction controls what happens on failure: "error" rejects, "warn" allows and logs. validationLevel controls which writes are checked.',
    },
    {
      question: 'What does { $push: { comments: { $each: [c], $slice: -3 } } } do?',
      options: [
        'Adds c and deletes the whole array',
        'Adds c to the start and keeps the first 3 items',
        'Throws an error because $slice is only for projection',
        'Adds c to the end and keeps only the last 3 items',
      ],
      answer: 3,
      explanation: '$each appends the items and a negative $slice keeps the last N elements – a simple way to keep an embedded array bounded.',
    },
    {
      question: 'Why is Mongoose validation alone NOT enough to guarantee clean data in a collection?',
      options: [
        'Mongoose validation does not support required fields',
        'Writes from other clients (scripts, Compass, other services) bypass it; $jsonSchema is enforced by the server',
        'Mongoose validation only works with MySQL',
        'Mongoose validation runs only on find()',
      ],
      answer: 1,
      explanation: 'Mongoose validation runs inside your Node app. Collection-level $jsonSchema validation is enforced by MongoDB for every client.',
    },
    {
      question: 'Which is the BEST way to handle ?limit in a public list API?',
      options: [
        'Use whatever the client sends, with no default',
        'Ignore limit and always return all documents',
        'Use a default (e.g. 10) and cap it at a maximum (e.g. 50)',
        'Use $where to compute the limit on the server',
      ],
      answer: 2,
      explanation: 'A sensible default plus a hard maximum protects the database and the API from huge responses and denial-of-service.',
    },
  ],
};
