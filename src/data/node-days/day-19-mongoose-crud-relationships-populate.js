export default {
  id: 'day-19-mongoose-crud-relationships-populate',
  title: 'CRUD with Mongoose, Relationships and populate()',
  module: 'Module 3: Databases',
  day: 19,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Today the Task-style REST API of Day 16 gets a real database: you implement every CRUD operation with Mongoose, model relationships (embedding vs referencing, one-to-many, many-to-many) and use populate() to "join" related documents – then build a complete Blog Posts API.',
  objectives: [
    'Perform Create, Read, Update and Delete with Mongoose model methods and query chaining',
    'Use findByIdAndUpdate with { new: true, runValidators: true } and update operators',
    'Choose between embedding (sub-documents) and referencing (ObjectId + ref) for relationships',
    'Use populate() – with field selection, multiple paths and virtual populate',
    'Build a complete Express 5 + Mongoose CRUD API with sub-resources and cascade deletes',
  ],
  theory: [
    {
      heading: 'Mongoose CRUD cheat-sheet',
      content: `**Create**
- \`await Model.create(obj)\` or \`await Model.create([obj1, obj2])\`
- \`const doc = new Model(obj); await doc.save();\`
- \`await Model.insertMany(array)\` (fast bulk insert)

**Read** (all return a **Query** – chain then \`await\`)
- \`Model.find(filter)\`, \`Model.findOne(filter)\`, \`Model.findById(id)\`
- \`.select('name email')\` / \`.select('-password')\`, \`.sort({ createdAt: -1 })\`, \`.skip(20).limit(10)\`, \`.populate('author')\`, \`.lean()\`
- \`Model.countDocuments(filter)\`, \`Model.exists(filter)\` (returns \`{ _id }\` or \`null\`), \`Model.distinct('city')\`

**Update**
- \`Model.findByIdAndUpdate(id, update, { new: true, runValidators: true })\` – returns the **updated** doc (default returns the OLD one!)
- \`Model.updateOne(filter, update)\` / \`updateMany\` – returns counts \`{ matchedCount, modifiedCount }\`
- Load–modify–save: \`doc.title = 'x'; await doc.save();\` – runs all validators and save hooks
- Plain objects are wrapped in \`$set\` automatically; use operators for more: \`$inc\`, \`$push\`, \`$pull\`, \`$addToSet\`

**Delete**
- \`Model.findByIdAndDelete(id)\` (returns the deleted doc or null), \`Model.deleteOne(filter)\`, \`Model.deleteMany(filter)\`

Mongoose 8 removed callbacks entirely – always use \`await\` (or \`.then()\`). The old \`remove()\` method is gone; use \`deleteOne()\`.`,
      tip: 'A Query is "thenable" but not a Promise. Use .exec() when you want a real Promise and better stack traces: await Post.find().exec().',
    },
    {
      heading: 'Relationships: embed or reference? (the wallet analogy)',
      content: `You keep your **driving licence inside your wallet** (embedded – always needed together, small, belongs only to you). You keep your **bank account number** in the wallet, but the account itself lives at the bank (reference – large, shared, changes independently).

**Embedding** (sub-documents): \`comments: [commentSchema]\` inside a post.
- ✅ One read returns everything, atomic updates on one document
- ❌ Document grows (16 MB limit), hard to query sub-items across all parents, data duplicated if shared
- Use for **one-to-few**, owned data read together: addresses, order line items, small comment lists

**Referencing**: \`author: { type: Schema.Types.ObjectId, ref: 'User' }\`
- ✅ No duplication, unbounded growth, independent access
- ❌ Needs a second query (\`populate\`) to "join"
- Use for **one-to-many / many-to-many**, shared or large data: users ↔ posts, students ↔ courses

Patterns:
- **One-to-one**: embed, or reference with \`unique\` (user ↔ profile)
- **One-to-many**: reference from the "many" side (\`post.author\`) – the parent does not keep a growing array
- **Many-to-many**: array of references on one side (\`post.likes: [userIds]\`, \`student.courses: [courseIds]\`) or a separate "join" collection (\`enrollments\`) when the link has its own data (date, grade).`,
    },
    {
      heading: 'populate(): Mongoose "joins"',
      content: `\`populate\` replaces stored ObjectIds with the referenced documents by running an extra query (\`User.find({ _id: { $in: ids } })\`) and stitching results together.

\`\`\`js
Post.find().populate('author')                       // whole user
Post.find().populate('author', 'name email')         // only some fields
Post.find().populate('author', 'name').populate('likes', 'name')   // several paths
Post.find().populate({ path: 'author', select: 'name', match: { isActive: true } })
Post.find().populate({ path: 'comments.user', select: 'name' })   // inside arrays
Course.find().populate({ path: 'instructor', populate: { path: 'company' } }) // nested
await post.populate('author')                        // on an existing document
\`\`\`

**Virtual populate** lets the "one" side see its "many" without storing an array: \`userSchema.virtual('posts', { ref: 'Post', localField: '_id', foreignField: 'author' })\`, then \`User.findById(id).populate('posts')\`.

**Performance:** each populated path = one more query. Select only needed fields, avoid populating huge arrays, add indexes on reference fields (\`author\`), and use the aggregation \`$lookup\` for heavy reporting.`,
      tip: 'If a referenced document was deleted, populate returns null for that field – always handle it (post.author?.name).',
    },
    {
      heading: 'Validation and safety on updates',
      content: `- Pass \`runValidators: true\` on \`findByIdAndUpdate\`/\`updateOne\`, otherwise enum/min/match rules are skipped (required is only checked for fields you \`$set\`/\`$unset\`).
- Pass \`new: true\` (or \`returnDocument: 'after'\`) to get the updated document.
- **Whitelist** body fields: \`const { title, body, status } = req.body\` – never pass \`req.body\` directly (a client could change \`author\` or \`likes\`). Fields that are \`undefined\` are ignored by Mongoose.
- **Ownership checks**: before updating, make sure \`post.author\` equals the logged-in user (Day 23).
- **Cascade deletes**: MongoDB has no foreign keys. When a user is deleted, delete or reassign their posts yourself (\`Post.deleteMany({ author: id })\`), or use a \`pre('deleteOne')\` hook / transaction.
- **Invalid ids** throw \`CastError\` → map to 400; \`findById\` returning \`null\` → 404.`,
    },
    {
      heading: 'Transactions (overview)',
      content: `When several writes must succeed or fail together (transfer money, enrol a student AND decrease seats), use a **transaction** (requires a replica set – Atlas clusters are replica sets):

\`\`\`js
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  await Course.updateOne({ _id: courseId, seats: { $gt: 0 } }, { $inc: { seats: -1 } }, { session });
  await Enrollment.create([{ student: studentId, course: courseId }], { session });
});
await session.endSession();
\`\`\`

Coming next (Day 20): the same ideas in a relational database – MySQL with mysql2, and ORMs like Sequelize and Prisma.`,
    },
  ],
  examples: [
    {
      title: 'Relationships, populate and CRUD operations (verified run)',
      scenario: 'A blog with users and posts: one-to-many (author), many-to-many (likes), embedded comments, updates with validation, virtual populate and a cascade delete.',
      steps: [
        'npm i mongoose',
        'Create models/User.js (with a virtual populate "posts") and models/Post.js',
        'Create relations-demo.js and run node relations-demo.js',
        'Compare the raw author (ObjectId) with the populated author',
        'Watch $addToSet keep likes unique and runValidators reject "archived"',
      ],
      code: `// models/User.js
const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// virtual populate: user.posts without storing post ids on the user
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author',
});

module.exports = model('User', userSchema);

// models/Post.js
const { Schema, model } = require('mongoose');

// embedded sub-document (one-to-few, always read with the post)
const commentSchema = new Schema(
  {
    by: { type: String, required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

const postSchema = new Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 3 },
    body: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    // reference (one-to-many): many posts -> one user
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // many-to-many via an array of references
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = model('Post', postSchema);

// relations-demo.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blog');

  // CREATE
  const [asha, ravi] = await User.create([
    { name: 'Asha', email: 'asha@mail.com' },
    { name: 'Ravi', email: 'ravi@mail.com' },
  ]);
  const p1 = await Post.create({ title: 'Intro to Mongoose', author: asha._id, status: 'published' });
  await Post.create({ title: 'Populate explained', author: asha._id });
  await Post.create({ title: 'Java vs Node', author: ravi._id, status: 'published' });

  // READ without populate: author is only an ObjectId
  const raw = await Post.findById(p1._id).lean();
  console.log('raw author is ObjectId:', raw.author instanceof mongoose.Types.ObjectId);

  // READ with populate: replace the id with selected fields of the user
  const full = await Post.findById(p1._id).populate('author', 'name email');
  console.log('populated author:', full.author.name, '<' + full.author.email + '>');

  // many-to-many: Ravi likes Asha's post ($addToSet avoids duplicates)
  await Post.updateOne({ _id: p1._id }, { $addToSet: { likes: ravi._id } });
  await Post.updateOne({ _id: p1._id }, { $addToSet: { likes: ravi._id } });
  const liked = await Post.findById(p1._id).populate('likes', 'name');
  console.log('likes:', liked.likes.map(u => u.name));

  // embedded sub-documents: push a comment, then edit it by its _id
  full.comments.push({ by: 'Ravi', text: 'Great post!' });
  await full.save();
  const comment = full.comments[0];
  comment.text = 'Great post, thanks!';
  await full.save();
  console.log('comment:', full.comments.id(comment._id).text);

  // UPDATE with validation and return the new document
  const updated = await Post.findByIdAndUpdate(
    p1._id,
    { title: 'Mongoose CRUD & Relations' },
    { new: true, runValidators: true }
  );
  console.log('updated title:', updated.title);

  try {
    await Post.findByIdAndUpdate(p1._id, { status: 'archived' }, { runValidators: true });
  } catch (err) {
    console.log('update validation:', err.errors.status.message);
  }

  // filter + sort + select + populate together
  const published = await Post.find({ status: 'published' })
    .select('title author')
    .populate('author', 'name')
    .sort({ title: 1 })
    .lean();
  console.log('published:', published.map(p => p.title + ' by ' + p.author.name));

  // virtual populate on the "one" side
  const ashaWithPosts = await User.findOne({ email: 'asha@mail.com' }).populate({ path: 'posts', select: 'title -author' });
  console.log('Asha posts:', ashaWithPosts.posts.map(p => p.title));

  // DELETE + cascade (MongoDB has no foreign keys: clean up yourself)
  await User.findByIdAndDelete(ravi._id);
  const removed = await Post.deleteMany({ author: ravi._id });
  await Post.updateMany({}, { $pull: { likes: ravi._id } });
  console.log('cascade deleted posts:', removed.deletedCount, '| posts left:', await Post.countDocuments());

  await mongoose.disconnect();
}
main().catch(console.error);`,
      result: `raw author is ObjectId: true
populated author: Asha <asha@mail.com>
likes: [ 'Ravi' ]
comment: Great post, thanks!
updated title: Mongoose CRUD & Relations
update validation: \`archived\` is not a valid enum value for path \`status\`.
published: [ 'Java vs Node by Ravi', 'Mongoose CRUD & Relations by Asha' ]
Asha posts: [ 'Mongoose CRUD & Relations', 'Populate explained' ]
cascade deleted posts: 1 | posts left: 2
(verified with Mongoose 8 on MongoDB 8)`,
      explanation: 'Without populate the author is just an ObjectId; populate("author", "name email") fetched the user. Liking twice with $addToSet stored Ravi once. comments.id() finds an embedded sub-document by its own _id. runValidators made the enum rule apply to the update. Deleting Ravi required manually deleting his posts and pulling his likes.',
    },
    {
      title: 'Complete Blog Posts REST API with Express 5 + Mongoose',
      scenario: 'Full CRUD on /api/posts with populate, a comments sub-resource, validation on update and proper 400/404 handling.',
      steps: [
        'npm i express mongoose',
        'Reuse models/User.js and models/Post.js from the first example',
        'Create app.js below and run it (MONGODB_URI from Atlas or local)',
        'Create a user, then posts with that user id as author',
        'PATCH, comment, list, get, delete – compare with the results',
      ],
      code: `// app.js – full CRUD for posts with Express 5 + Mongoose 8
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

const app = express();
app.use(express.json());

const notFound = (res) => res.status(404).json({ error: 'Post not found' });

// CREATE a user (needed as post author)
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body ?? {};
  res.status(201).json(await User.create({ name, email }));
});

// CREATE a post
app.post('/api/posts', async (req, res) => {
  const { title, body, status, author } = req.body ?? {};
  if (!(await User.exists({ _id: author }))) return res.status(400).json({ error: 'author does not exist' });
  const post = await Post.create({ title, body, status, author });
  res.status(201).json(await post.populate('author', 'name'));
});

// READ all (optional ?status=published), newest first, author populated
app.get('/api/posts', async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const posts = await Post.find(filter)
    .select('title status author likes')
    .populate('author', 'name')
    .sort({ createdAt: -1 })
    .lean();
  res.json(posts);
});

// READ one
app.get('/api/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name email');
  if (!post) return notFound(res);
  res.json(post);
});

// UPDATE (partial) – validators + return the updated doc
app.patch('/api/posts/:id', async (req, res) => {
  const { title, body, status } = req.body ?? {};
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { title, body, status },                        // undefined fields are ignored
    { new: true, runValidators: true }
  ).populate('author', 'name');
  if (!post) return notFound(res);
  res.json(post);
});

// sub-resource: add a comment (embedded document)
app.post('/api/posts/:id/comments', async (req, res) => {
  const { by, text } = req.body ?? {};
  const post = await Post.findById(req.params.id);
  if (!post) return notFound(res);
  post.comments.push({ by, text });
  await post.save();
  res.status(201).json(post.comments.at(-1));
});

// DELETE
app.delete('/api/posts/:id', async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return notFound(res);
  res.sendStatus(204);
});

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid ' + err.path });
  if (err.code === 11000) return res.status(409).json({ error: 'Duplicate value' });
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blog')
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log('Server running on port ' + PORT));
  })
  .catch(err => { console.error(err.message); process.exit(1); });`,
      api: {
        code: `// API Lab simulation of the Mongoose posts API: two in-memory "collections" + a populate() helper
const express = require('express');
const app = express();
app.use(express.json());

let counter = 0;
const oid = () => '665f1c2e9b1d4a00120000' + String(++counter).padStart(2, '0');
const isObjectId = (id) => /^[0-9a-f]{24}$/.test(id);

const users = [{ _id: oid(), name: 'Asha', email: 'asha@mail.com' }];
const posts = [];

// like .populate('author', 'name'): swap the stored id for selected user fields
const populateAuthor = (post, fields = ['name']) => {
  const u = users.find(x => x._id === post.author);
  const author = { _id: u._id };
  fields.forEach(f => { author[f] = u[f]; });
  return { ...post, author };
};

// like a CastError check + findById
const findPost = (req, res) => {
  if (!isObjectId(req.params.id)) { res.status(400).json({ error: 'Invalid _id' }); return null; }
  const post = posts.find(p => p._id === req.params.id);
  if (!post) res.status(404).json({ error: 'Post not found' });
  return post;
};

const validatePost = ({ title, status }) => {
  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 3)) return 'Title is required (min 3 characters)';
  if (status !== undefined && !['draft', 'published'].includes(status)) return status + ' is not a valid enum value for path status';
  return null;
};

app.post('/api/posts', (req, res) => {
  const { title, body, status, author } = req.body ?? {};
  if (!users.some(u => u._id === author)) return res.status(400).json({ error: 'author does not exist' });
  const error = validatePost({ title: title ?? '', status });
  if (error) return res.status(400).json({ error });
  const post = { _id: oid(), title: title.trim(), body: body ?? '', status: status ?? 'draft', author, likes: [], comments: [] };
  posts.push(post);
  res.status(201).json(populateAuthor(post));
});

app.get('/api/posts', (req, res) => {
  const list = posts
    .filter(p => !req.query.status || p.status === req.query.status)
    .reverse() // newest first
    .map(p => populateAuthor({ _id: p._id, title: p.title, status: p.status, author: p.author, likes: p.likes }));
  res.json(list);
});

app.get('/api/posts/:id', (req, res) => {
  const post = findPost(req, res);
  if (post) res.json(populateAuthor(post, ['name', 'email']));
});

app.patch('/api/posts/:id', (req, res) => {
  const post = findPost(req, res);
  if (!post) return;
  const { title, body, status } = req.body ?? {};
  const error = validatePost({ title, status });          // like runValidators: true
  if (error) return res.status(400).json({ error });
  if (title !== undefined) post.title = title.trim();
  if (body !== undefined) post.body = body;
  if (status !== undefined) post.status = status;
  res.json(populateAuthor(post));                           // like { new: true }
});

app.post('/api/posts/:id/comments', (req, res) => {
  const post = findPost(req, res);
  if (!post) return;
  const { by, text } = req.body ?? {};
  if (!by || !text) return res.status(400).json({ error: 'by and text are required' });
  const comment = { _id: oid(), by, text };
  post.comments.push(comment);
  res.status(201).json(comment);
});

app.delete('/api/posts/:id', (req, res) => {
  const post = findPost(req, res);
  if (!post) return;
  posts.splice(posts.indexOf(post), 1);
  res.sendStatus(204);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/posts', body: { title: 'Hi' } },
          { method: 'POST', url: '/api/posts', body: { title: 'Intro to Mongoose', author: '665f1c2e9b1d4a0012000001' } },
          { method: 'POST', url: '/api/posts', body: { title: 'Populate explained', author: '665f1c2e9b1d4a0012000001', status: 'published' } },
          { method: 'PATCH', url: '/api/posts/665f1c2e9b1d4a0012000002', body: { status: 'archived' } },
          { method: 'PATCH', url: '/api/posts/665f1c2e9b1d4a0012000002', body: { status: 'published' } },
          { method: 'POST', url: '/api/posts/665f1c2e9b1d4a0012000002/comments', body: { by: 'Ravi', text: 'Nice!' } },
          { method: 'GET', url: '/api/posts?status=published' },
          { method: 'GET', url: '/api/posts/665f1c2e9b1d4a0012000002' },
          { method: 'GET', url: '/api/posts/xyz' },
          { method: 'DELETE', url: '/api/posts/665f1c2e9b1d4a0012000002' },
          { method: 'DELETE', url: '/api/posts/665f1c2e9b1d4a0012000002' },
        ],
      },
      result: `POST /api/posts → 400 {"error":"author does not exist"}
POST /api/posts → 201 {"_id":"665f1c2e9b1d4a0012000002","title":"Intro to Mongoose","body":"","status":"draft","author":{"_id":"665f1c2e9b1d4a0012000001","name":"Asha"},"likes":[],"comments":[]}
POST /api/posts → 201 {"_id":"665f1c2e9b1d4a0012000003","title":"Populate explained","body":"","status":"published","author":{"_id":"665f1c2e9b1d4a0012000001","name":"Asha"},"likes":[],"comments":[]}
PATCH /api/posts/665f1c2e9b1d4a0012000002 → 400 {"error":"archived is not a valid enum value for path status"}
PATCH /api/posts/665f1c2e9b1d4a0012000002 → 200 {"_id":"665f1c2e9b1d4a0012000002","title":"Intro to Mongoose","body":"","status":"published","author":{"_id":"665f1c2e9b1d4a0012000001","name":"Asha"},"likes":[],"comments":[]}
POST /api/posts/665f1c2e9b1d4a0012000002/comments → 201 {"_id":"665f1c2e9b1d4a0012000004","by":"Ravi","text":"Nice!"}
GET /api/posts?status=published → 200 [{"_id":"665f1c2e9b1d4a0012000003","title":"Populate explained","status":"published","author":{"_id":"665f1c2e9b1d4a0012000001","name":"Asha"},"likes":[]},{"_id":"665f1c2e9b1d4a0012000002","title":"Intro to Mongoose","status":"published","author":{"_id":"665f1c2e9b1d4a0012000001","name":"Asha"},"likes":[]}]
GET /api/posts/665f1c2e9b1d4a0012000002 → 200 {"_id":"665f1c2e9b1d4a0012000002","title":"Intro to Mongoose","body":"","status":"published","author":{"_id":"665f1c2e9b1d4a0012000001","name":"Asha","email":"asha@mail.com"},"likes":[],"comments":[{"_id":"665f1c2e9b1d4a0012000004","by":"Ravi","text":"Nice!"}]}
GET /api/posts/xyz → 400 {"error":"Invalid _id"}
DELETE /api/posts/665f1c2e9b1d4a0012000002 → 204
DELETE /api/posts/665f1c2e9b1d4a0012000002 → 404 {"error":"Post not found"}`,
      explanation: 'The API Lab version keeps users/posts in arrays and a populateAuthor() helper mimics populate("author", "name"); ids are deterministic and timestamps are left out. Real Mongoose run (verified): POST /api/users gave 201 with a real ObjectId; POST /api/posts gave 201 {"title":"Intro to Mongoose","body":"","status":"draft","author":{"_id":"6afd5aa0e702ebaf484a6a28","name":"Asha","id":"6afd5aa0e702ebaf484a6a28"},"likes":[],"_id":"6afd5aa0e702ebaf484a6a2c","comments":[],"createdAt":"...","updatedAt":"...","__v":0}; PATCH status "archived" gave 400 with the enum message; GET /api/posts/xyz gave 400 {"error":"Invalid _id"}; the second DELETE gave 404. The extra "id" field comes from toJSON: { virtuals: true } on the User schema.',
    },
    {
      title: 'Many-to-many with a join collection: students, courses and enrollments',
      scenario: 'An enrollment has its own data (enrolledAt, grade), so it becomes a separate model referencing both sides.',
      steps: [
        'Create Student, Course and Enrollment models',
        'Add a compound unique index { student: 1, course: 1 } to block double enrollment',
        'Enroll a student, then list the courses of a student and the students of a course with populate',
      ],
      code: `const { Schema, model } = require('mongoose');

const Student = model('Student', new Schema({ name: String }));
const Course = model('Course', new Schema({ title: String, seats: { type: Number, min: 0 } }));

const enrollmentSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F', null], default: null },
  },
  { timestamps: { createdAt: 'enrolledAt', updatedAt: false } }
);
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
const Enrollment = model('Enrollment', enrollmentSchema);

// enroll (decrement seats only if one is available)
async function enroll(studentId, courseId) {
  const course = await Course.findOneAndUpdate(
    { _id: courseId, seats: { $gt: 0 } },
    { $inc: { seats: -1 } },
    { new: true }
  );
  if (!course) throw new Error('Course full or not found');
  return Enrollment.create({ student: studentId, course: courseId });
}

// courses of one student
const myCourses = await Enrollment.find({ student: ashaId }).populate('course', 'title').lean();
// students of one course, with grades
const roster = await Enrollment.find({ course: nodeId }).populate('student', 'name').select('student grade').lean();`,
      result: `myCourses → [{ course: { _id: ..., title: 'Node.js' }, enrolledAt: ... }, { course: { title: 'MongoDB' }, ... }]
roster → [{ student: { name: 'Asha' }, grade: null }, { student: { name: 'Ravi' }, grade: 'A' }]
Enrolling Asha in Node.js twice → E11000 duplicate key error (map to 409)`,
      explanation: 'A join collection is the MongoDB equivalent of a SQL junction table. The conditional findOneAndUpdate ({ seats: { $gt: 0 } }) prevents overbooking atomically; wrap both writes in a transaction for full safety.',
    },
    {
      title: 'Service layer for posts (clean controllers)',
      scenario: 'Move Mongoose calls into a service that throws HTTP-friendly errors, as learned on Day 13–14.',
      steps: [
        'Create src/services/post.service.js',
        'Each function uses Mongoose and throws AppError for 404',
        'Controllers just call the service and send the result',
      ],
      code: `// src/services/post.service.js
const Post = require('../models/Post');
const AppError = require('../utils/AppError');

exports.list = ({ status, page = 1, limit = 10 }) => {
  const filter = status ? { status } : {};
  return Post.find(filter).populate('author', 'name').sort({ createdAt: -1 })
    .skip((page - 1) * limit).limit(limit).lean();
};

exports.get = async (id) => {
  const post = await Post.findById(id).populate('author', 'name email');
  if (!post) throw new AppError('Post not found', 404);
  return post;
};

exports.update = async (id, { title, body, status }) => {
  const post = await Post.findByIdAndUpdate(id, { title, body, status }, { new: true, runValidators: true });
  if (!post) throw new AppError('Post not found', 404);
  return post;
};

exports.remove = async (id) => {
  const post = await Post.findByIdAndDelete(id);
  if (!post) throw new AppError('Post not found', 404);
};

// src/controllers/post.controller.js
const service = require('../services/post.service');
exports.list = async (req, res) => res.json(await service.list({ status: req.query.status, page: Number(req.query.page) || 1 }));
exports.get = async (req, res) => res.json(await service.get(req.params.id));
exports.update = async (req, res) => res.json(await service.update(req.params.id, req.body ?? {}));
exports.remove = async (req, res) => { await service.remove(req.params.id); res.sendStatus(204); };`,
      result: 'Same HTTP behaviour as the previous example, but each controller is one line and the service can be unit-tested with an in-memory MongoDB (mongodb-memory-server, Day 26).',
      explanation: 'Express 5 forwards the AppError or CastError thrown inside the async service to the central error handler, so there is no try/catch anywhere.',
    },
  ],
  interview: [
    { q: 'How do you perform CRUD in Mongoose?', a: 'Create: Model.create / new Model().save(); Read: find, findOne, findById with select/sort/limit/populate; Update: findByIdAndUpdate, updateOne/updateMany or modify + save(); Delete: findByIdAndDelete, deleteOne, deleteMany.', level: 'Easy' },
    { q: 'Why does findByIdAndUpdate return the old document?', a: 'By default it returns the document as it was before the update. Pass { new: true } (or returnDocument: "after") to get the updated version.', level: 'Medium' },
    { q: 'What is populate()?', a: 'A Mongoose feature that replaces ObjectId references with the referenced documents by running additional queries, similar to a SQL join. You can select fields, filter with match, populate multiple or nested paths.', level: 'Easy' },
    { q: 'Embedding vs referencing – how do you decide?', a: 'Embed data that is small, owned by the parent and read together (one-to-few). Reference data that is large, unbounded, shared or accessed independently (one-to-many, many-to-many). Consider document size (16 MB) and update patterns.', level: 'Medium' },
    { q: 'What is virtual populate?', a: 'A virtual field defined with ref, localField and foreignField that lets you populate the "many" side (e.g. user.posts) without storing an array of ids on the parent document.', level: 'Hard' },
    { q: 'Difference between updateOne() and save()?', a: 'updateOne sends an atomic update directly to MongoDB (no document loaded, save hooks not run, validators only with runValidators). save() works on a loaded document, runs all validators and save middleware, and only sends changed paths.', level: 'Medium' },
    { q: 'How do you handle cascading deletes in MongoDB?', a: 'MongoDB has no foreign keys, so you delete or update related documents yourself: in the service, in a pre("deleteOne") / post hook, or inside a transaction to keep it atomic.', level: 'Medium' },
    { q: 'What does lean() do and when should you use it?', a: 'Returns plain JS objects instead of Mongoose documents – faster and lighter. Use it for read-only responses where you do not need save(), virtuals or methods.', level: 'Medium' },
    { q: 'How do you avoid N+1 queries with populate?', a: 'populate already batches ids with one $in query per path. Avoid populating inside loops; populate on the query instead, select only needed fields, and use $lookup aggregations for complex reports.', level: 'Hard' },
    { q: 'What is the difference between findById returning null and a CastError?', a: 'null means a valid ObjectId was not found (HTTP 404). CastError means the id string is not a valid ObjectId at all (HTTP 400).', level: 'Easy' },
    { q: 'When do you need transactions in MongoDB?', a: 'When multiple documents/collections must be updated atomically (e.g. order + inventory, money transfer). They require a replica set or sharded cluster and use sessions (session.withTransaction).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write GET /api/posts/:id/likes that returns the names of users who liked the post.',
      hint: 'populate("likes", "name") and map.',
      solution: `app.get('/api/posts/:id/likes', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('likes', 'name');
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post.likes.map(u => u.name));
});`,
    },
    {
      task: 'Write POST /api/posts/:id/like and DELETE /api/posts/:id/like that add/remove the user id from body.userId.',
      hint: '$addToSet and $pull with findByIdAndUpdate.',
      solution: `app.post('/api/posts/:id/like', async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.body.userId } }, { new: true });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ likes: post.likes.length });
});
app.delete('/api/posts/:id/like', async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.body.userId } }, { new: true });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ likes: post.likes.length });
});`,
    },
    {
      task: 'Write DELETE /api/posts/:id/comments/:commentId to remove an embedded comment.',
      hint: 'post.comments.id(commentId).deleteOne() then save(), or $pull by _id.',
      solution: `app.delete('/api/posts/:id/comments/:commentId', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const comment = post.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  comment.deleteOne();
  await post.save();
  res.sendStatus(204);
});`,
    },
    {
      task: 'Write GET /api/users/:id with the user and the titles of their posts using virtual populate.',
      hint: 'populate({ path: "posts", select: "title" }).',
      solution: `app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id).populate({ path: 'posts', select: 'title status -author' });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user); // toJSON: { virtuals: true } includes posts
});`,
    },
    {
      task: 'Make deleting a user also delete all their posts using a pre hook.',
      hint: 'userSchema.pre("findOneAndDelete") – findByIdAndDelete triggers it; read the filter with this.getFilter().',
      solution: `userSchema.pre('findOneAndDelete', async function () {
  const { _id } = this.getFilter();
  await model('Post').deleteMany({ author: _id });
});
// now: await User.findByIdAndDelete(id) also removes the user's posts`,
    },
  ],
  quiz: [
    { question: 'Which option makes findByIdAndUpdate return the updated document?', options: ['{ upsert: true }', '{ new: true }', '{ lean: true }', '{ strict: false }'], answer: 1, explanation: 'new: true returns the document after the update.' },
    { question: 'Comments that belong to one post and are always shown with it are best…', options: ['Embedded as sub-documents', 'Stored in a separate database', 'Saved as a JSON string', 'Referenced from the User model'], answer: 0, explanation: 'One-to-few owned data read together → embed.' },
    { question: 'What does Post.find().populate("author", "name") do?', options: ['Deletes the author', 'Creates a new author', 'Replaces author ids with user docs containing name (and _id)', 'Sorts by author name'], answer: 2, explanation: 'populate fetches referenced docs and selects fields.' },
    { question: 'Validators on updateOne run only when…', options: ['Always', 'You pass { runValidators: true }', 'You use lean()', 'The schema has timestamps'], answer: 1, explanation: 'Update validators are opt-in.' },
    { question: 'Which operator removes a value from an array?', options: ['$unset', '$pop', '$pull', '$inc'], answer: 2, explanation: '$pull removes all matching values.' },
  ],
};
