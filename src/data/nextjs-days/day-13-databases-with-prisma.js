export default {
  id: 'day-13-databases-with-prisma',
  title: 'Databases with Prisma (and Mongoose) in Next.js',
  module: 'Module 3: Full-stack Next.js',
  day: 13,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    'Connect a Next.js App Router app to a real database. Learn the Prisma ORM workflow (schema.prisma, migrations, Prisma Client), the singleton client pattern for development hot reload, querying from Server Components, writing with Server Actions, relations, a data-access layer, and how the same ideas look with Mongoose and MongoDB.',
  objectives: [
    'Install Prisma, write a schema with models and relations, and run migrations',
    'Create a single shared PrismaClient instance that survives hot reload',
    'Read data in Server Components and write data in Server Actions / Route Handlers',
    'Use findMany, findUnique, create, update, delete, include, where, orderBy, take/skip',
    'Organize database code in a data-access layer and know the Mongoose alternative',
  ],
  theory: [
    {
      heading: 'Why a database and why an ORM?',
      content:
        'Until now our data lived in arrays or came from public APIs. Real apps store users, posts and orders in a **database**: PostgreSQL, MySQL, SQLite (relational, tables + SQL) or MongoDB (documents).\n\nAn **ORM (Object-Relational Mapper)** lets you work with database rows as JavaScript objects: `prisma.post.findMany()` instead of writing `SELECT * FROM "Post"` by hand.\n\nAnalogy: the database is a warehouse, SQL is the warehouse\'s own language, and the ORM is a translator who speaks JavaScript to you and SQL to the warehouse - plus it checks your order form (types) before sending it.\n\nWhy **Prisma** is popular with Next.js:\n- One readable `schema.prisma` file is the source of truth\n- **Migrations** track schema changes in version control\n- Auto-generated, fully typed client (great autocomplete, even in plain JS)\n- **Prisma Studio** (`npx prisma studio`) - a GUI to browse data\n\nBecause Server Components and Server Actions run on the server, you can query the database **directly inside them** - no API layer needed for your own UI.',
    },
    {
      heading: 'Setup: schema, migrations and Prisma Client',
      content:
        '1. `npm install prisma --save-dev` and `npm install @prisma/client`\n2. `npx prisma init --datasource-provider postgresql` (or `sqlite` for learning) - creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env`\n3. Write your **models** in schema.prisma\n4. `npx prisma migrate dev --name init` - creates SQL migration files, applies them, and generates the client\n5. `npx prisma generate` - regenerate the client after schema changes (migrate dev does it for you)\n\nIn production/CI use `npx prisma migrate deploy` (applies existing migrations, never creates new ones). Add `"postinstall": "prisma generate"` to package.json so Vercel builds generate the client.\n\nModel syntax: `fieldName Type modifiers @attributes`. `?` = optional, `[]` = list, `@id`, `@default(autoincrement())`, `@unique`, `@updatedAt`, `@relation(...)`.',
      syntax:
        "// prisma/schema.prisma\ngenerator client {\n  provider = \"prisma-client-js\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel User {\n  id        Int      @id @default(autoincrement())\n  email     String   @unique\n  name      String?\n  posts     Post[]                       // one user has many posts\n  createdAt DateTime @default(now())\n}\n\nmodel Post {\n  id        Int      @id @default(autoincrement())\n  title     String\n  content   String?\n  published Boolean  @default(false)\n  author    User     @relation(fields: [authorId], references: [id])\n  authorId  Int\n  updatedAt DateTime @updatedAt\n}",
      tip: 'Never commit .env with real database passwords. Commit .env.example with placeholder values instead.',
    },
    {
      heading: 'The PrismaClient singleton (hot reload problem)',
      content:
        'In development, `next dev` re-executes your modules on every file save (Fast Refresh). If you write `const prisma = new PrismaClient()` in a normal module, each reload creates **a new client with its own connection pool**, and you soon see "Too many connections".\n\nThe fix: store the client on `globalThis` in development so it is reused across reloads. In production the module is loaded once, so a normal instance is fine.\n\nAlso import `server-only` in database modules: if a Client Component ever imports this file by mistake, the build fails instead of leaking credentials or bundling Prisma into the browser.',
      syntax:
        "// lib/prisma.js\nimport 'server-only';\nimport { PrismaClient } from '@prisma/client';\n\nconst globalForPrisma = globalThis;\n\nexport const prisma =\n  globalForPrisma.prisma ??\n  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'] });\n\nif (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;",
    },
    {
      heading: 'CRUD queries with Prisma Client',
      content:
        'Every model becomes a property on the client: `prisma.user`, `prisma.post`. Common methods:\n- **Read**: `findMany({ where, orderBy, take, skip, select, include })`, `findUnique({ where: { id } })` (unique fields only), `findFirst`, `count`\n- **Create**: `create({ data })`, `createMany({ data: [...] })`\n- **Update**: `update({ where, data })`, `updateMany`, `upsert` (update or insert)\n- **Delete**: `delete({ where })`, `deleteMany`\n\nFilters: `where: { title: { contains: \'next\', mode: \'insensitive\' }, published: true, createdAt: { gte: date } }`, combine with `AND`, `OR`, `NOT`.\n\nRelations: `include: { author: true }` loads the related record; `select` picks only some fields (smaller payloads). Nested writes: `create({ data: { title, author: { connect: { id: 1 } } } })`.\n\n**Transactions**: `prisma.$transaction([op1, op2])` - both succeed or both fail (e.g. move money between accounts).',
      syntax:
        "// Paginated, filtered list with author name\nconst posts = await prisma.post.findMany({\n  where: { published: true, title: { contains: q, mode: 'insensitive' } },\n  include: { author: { select: { name: true } } },\n  orderBy: { updatedAt: 'desc' },\n  take: 10,\n  skip: (page - 1) * 10,\n});\n\nconst post = await prisma.post.update({\n  where: { id: 5 },\n  data: { published: true },\n});",
      points: [
        'findUnique returns null when not found - pair it with notFound() in pages',
        'update/delete throw (error code P2025) when the record does not exist',
        'A unique-constraint violation throws error code P2002 - handle it to show "Email already used"',
      ],
    },
    {
      heading: 'Where the database code lives: data-access layer',
      content:
        'Good structure:\n- `lib/prisma.js` - the client singleton\n- `lib/data/posts.js` - **read** functions (`getPosts`, `getPostById`) used by Server Components; wrap with React `cache()` to deduplicate calls within one request\n- `app/.../actions.js` - **write** functions (Server Actions) that validate, check auth, call Prisma and `revalidatePath`\n- `app/api/.../route.js` - only if external clients need a REST API\n\nRendering note: a page that queries Prisma directly (not via `fetch`) is not cached by the fetch cache. Use `export const revalidate = 60` for ISR, `unstable_cache` / the `"use cache"` directive for function-level caching, or leave it dynamic.\n\n**Edge runtime**: classic Prisma needs Node.js; keep database pages on the default Node runtime (or use Prisma Accelerate / driver adapters for edge).',
    },
    {
      heading: 'The MongoDB alternative: Mongoose in Next.js',
      content:
        'If your team uses MongoDB, **Mongoose** works the same way conceptually:\n- Define a `Schema` and `model` (guard with `mongoose.models.Post || mongoose.model(\'Post\', schema)` because hot reload re-runs the file and models cannot be compiled twice)\n- Cache the connection on `globalThis` (same singleton idea)\n- Call `await dbConnect()` at the start of every Server Component/Action that uses it\n- Use `.lean()` to get plain objects, and convert `_id` to a string before passing data to Client Components (ObjectId is not serializable)\n\nPrisma also supports MongoDB as a provider, but Mongoose remains common in MERN-style teams.',
      syntax:
        "// lib/mongoose.js\nimport mongoose from 'mongoose';\nconst cached = globalThis.mongoose ?? (globalThis.mongoose = { conn: null, promise: null });\n\nexport async function dbConnect() {\n  if (cached.conn) return cached.conn;\n  cached.promise ??= mongoose.connect(process.env.MONGODB_URI);\n  cached.conn = await cached.promise;\n  return cached.conn;\n}\n\n// models/Post.js\nimport mongoose from 'mongoose';\nconst PostSchema = new mongoose.Schema({ title: { type: String, required: true }, body: String }, { timestamps: true });\nexport default mongoose.models.Post || mongoose.model('Post', PostSchema);",
      tip: 'Coming next (Day 14): protecting these database writes with authentication using Auth.js.',
    },
  ],
  examples: [
    {
      title: 'List posts from Prisma in a Server Component',
      scenario: 'The /posts page must show published posts with their author names, newest first, straight from PostgreSQL.',
      steps: [
        'Create prisma/schema.prisma with User and Post models and run npx prisma migrate dev --name init',
        'Create lib/prisma.js with the singleton client',
        'Create app/posts/page.js as an async Server Component',
        'Call prisma.post.findMany with where, include and orderBy',
        'Run npm run dev and open /posts',
        'In the playground SIMULATION, an in-memory "prisma" object with the same method shapes powers the list; change the filter to see where/orderBy behaviour',
      ],
      code:
        "// app/posts/page.js\nimport Link from 'next/link';\nimport { prisma } from '@/lib/prisma';\n\nexport const revalidate = 60; // optional ISR: rebuild at most once a minute\n\nexport default async function PostsPage() {\n  const posts = await prisma.post.findMany({\n    where: { published: true },\n    include: { author: { select: { name: true } } },\n    orderBy: { updatedAt: 'desc' },\n  });\n\n  if (posts.length === 0) return <p>No posts yet.</p>;\n\n  return (\n    <ul>\n      {posts.map((p) => (\n        <li key={p.id}>\n          <Link href={'/posts/' + p.id}>{p.title}</Link> by {p.author.name ?? 'Anonymous'}\n        </li>\n      ))}\n    </ul>\n  );\n}",
      playground: {
        jsx: "// SIMULATION: an in-memory object that mimics Prisma's findMany(where/include/orderBy).\n// In real Next.js this query runs on the server inside an async Server Component.\nconst users = [{ id: 1, name: 'Asha' }, { id: 2, name: 'Ravi' }];\nconst postsTable = [\n  { id: 1, title: 'Hello Next.js', published: true, authorId: 1, updatedAt: '2025-01-10' },\n  { id: 2, title: 'Draft about Prisma', published: false, authorId: 2, updatedAt: '2025-02-01' },\n  { id: 3, title: 'Server Actions guide', published: true, authorId: 2, updatedAt: '2025-03-05' },\n];\n\nconst prisma = {\n  post: {\n    async findMany({ where = {}, include = {}, orderBy } = {}) {\n      let rows = postsTable.filter((p) => Object.entries(where).every(([k, v]) => p[k] === v));\n      if (orderBy) {\n        const [field, dir] = Object.entries(orderBy)[0];\n        rows = [...rows].sort((a, b) => (a[field] > b[field] ? 1 : -1) * (dir === 'desc' ? -1 : 1));\n      }\n      if (include.author) rows = rows.map((p) => ({ ...p, author: users.find((u) => u.id === p.authorId) }));\n      return rows;\n    },\n  },\n};\n\nfunction App() {\n  const [onlyPublished, setOnlyPublished] = React.useState(true);\n  const [dir, setDir] = React.useState('desc');\n  const [posts, setPosts] = React.useState([]);\n  React.useEffect(() => {\n    prisma.post.findMany({\n      where: onlyPublished ? { published: true } : {},\n      include: { author: true },\n      orderBy: { updatedAt: dir },\n    }).then(setPosts);\n  }, [onlyPublished, dir]);\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <label><input type=\"checkbox\" checked={onlyPublished} onChange={(e) => setOnlyPublished(e.target.checked)} /> where: published = true</label>\n      <select value={dir} onChange={(e) => setDir(e.target.value)} style={{ marginLeft: 8 }}>\n        <option value=\"desc\">orderBy updatedAt desc</option>\n        <option value=\"asc\">orderBy updatedAt asc</option>\n      </select>\n      <ul>{posts.map((p) => <li key={p.id}>{p.title} - by {p.author.name} ({p.updatedAt}){p.published ? '' : ' [draft]'}</li>)}</ul>\n    </div>\n  );\n}",
      },
      result: 'By default "Server Actions guide - by Ravi" appears above "Hello Next.js - by Asha". Unticking the checkbox also shows the draft; switching to asc reverses the order.',
      explanation:
        'findMany builds a SQL SELECT with WHERE, ORDER BY and a JOIN (or second query) for include. Because the page is a Server Component, the database credentials and Prisma never reach the browser - only the rendered HTML does.',
    },
    {
      title: 'Create, toggle and delete with Server Actions + Prisma',
      scenario: 'An admin can add a post, publish/unpublish it and delete it. Each change must update the list.',
      steps: [
        'Create app/admin/posts/actions.js with "use server"',
        'Write createPost (validate title), togglePublish(id) and deletePost(id) using Prisma',
        'Call revalidatePath("/admin/posts") and revalidatePath("/posts") after each write',
        'Handle the P2002 unique error and return a friendly message',
        'Wire the actions into forms using .bind(null, post.id)',
        'In the SIMULATION click Publish/Delete and watch the in-memory table change',
      ],
      code:
        "// app/admin/posts/actions.js\n'use server';\nimport { revalidatePath } from 'next/cache';\nimport { Prisma } from '@prisma/client';\nimport { prisma } from '@/lib/prisma';\n\nfunction refresh() {\n  revalidatePath('/admin/posts');\n  revalidatePath('/posts');\n}\n\nexport async function createPost(prevState, formData) {\n  const title = String(formData.get('title') ?? '').trim();\n  if (title.length < 3) return { error: 'Title must be at least 3 characters' };\n  try {\n    await prisma.post.create({ data: { title, author: { connect: { id: 1 } } } });\n  } catch (e) {\n    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {\n      return { error: 'A post with this title already exists' };\n    }\n    throw e;\n  }\n  refresh();\n  return { error: null };\n}\n\nexport async function togglePublish(id) {\n  const post = await prisma.post.findUnique({ where: { id } });\n  if (!post) return;\n  await prisma.post.update({ where: { id }, data: { published: !post.published } });\n  refresh();\n}\n\nexport async function deletePost(id) {\n  await prisma.post.delete({ where: { id } });\n  refresh();\n}\n\n// app/admin/posts/page.js (Server Component)\nimport { prisma } from '@/lib/prisma';\nimport { togglePublish, deletePost } from './actions';\nimport NewPostForm from './NewPostForm';\n\nexport default async function AdminPosts() {\n  const posts = await prisma.post.findMany({ orderBy: { id: 'asc' } });\n  return (\n    <>\n      <NewPostForm />\n      <table>\n        <tbody>\n          {posts.map((p) => (\n            <tr key={p.id}>\n              <td>{p.title}</td>\n              <td>{p.published ? 'Published' : 'Draft'}</td>\n              <td>\n                <form action={togglePublish.bind(null, p.id)}><button>{p.published ? 'Unpublish' : 'Publish'}</button></form>\n                <form action={deletePost.bind(null, p.id)}><button>Delete</button></form>\n              </td>\n            </tr>\n          ))}\n        </tbody>\n      </table>\n    </>\n  );\n}",
      playground: {
        jsx: "// SIMULATION: server-side 'table' + async actions that mimic Prisma writes and revalidatePath.\nconst table = [\n  { id: 1, title: 'Hello Next.js', published: true },\n  { id: 2, title: 'Prisma basics', published: false },\n];\nlet nextId = 3;\nconst wait = () => new Promise((r) => setTimeout(r, 300));\n\nconst actions = {\n  async createPost(title) {\n    await wait();\n    title = title.trim();\n    if (title.length < 3) return { error: 'Title must be at least 3 characters' };\n    if (table.some((p) => p.title === title)) return { error: 'A post with this title already exists (P2002)' };\n    table.push({ id: nextId++, title, published: false });\n    return { error: null };\n  },\n  async togglePublish(id) { await wait(); const p = table.find((x) => x.id === id); if (p) p.published = !p.published; },\n  async deletePost(id) { await wait(); const i = table.findIndex((x) => x.id === id); if (i >= 0) table.splice(i, 1); },\n};\n\nfunction App() {\n  const [rows, setRows] = React.useState(table.map((r) => ({ ...r })));\n  const [error, setError] = React.useState(null);\n  const revalidate = () => setRows(table.map((r) => ({ ...r })));   // like revalidatePath\n\n  async function onCreate(e) {\n    e.preventDefault();\n    const form = e.currentTarget;\n    const res = await actions.createPost(new FormData(form).get('title'));\n    setError(res.error);\n    if (!res.error) form.reset();\n    revalidate();\n  }\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <form onSubmit={onCreate}><input name=\"title\" placeholder=\"New post title\" /> <button>Create</button></form>\n      {error && <p style={{ color: 'crimson' }}>{error}</p>}\n      <table cellPadding=\"4\"><tbody>\n        {rows.map((p) => (\n          <tr key={p.id}>\n            <td>{p.id}</td><td>{p.title}</td><td>{p.published ? 'Published' : 'Draft'}</td>\n            <td>\n              <button onClick={async () => { await actions.togglePublish(p.id); revalidate(); }}>{p.published ? 'Unpublish' : 'Publish'}</button>{' '}\n              <button onClick={async () => { await actions.deletePost(p.id); revalidate(); }}>Delete</button>\n            </td>\n          </tr>\n        ))}\n      </tbody></table>\n    </div>\n  );\n}",
      },
      result: 'Creating "Hello Next.js" again shows the duplicate error; "Hi" shows the length error; a new valid title adds a Draft row. Publish/Delete update the table after a short delay.',
      explanation:
        'Each Server Action performs one Prisma write, then revalidatePath re-renders the Server Component that lists posts. Prisma error code P2002 means a unique constraint failed (it requires @unique on title in the schema).',
    },
    {
      title: 'Search + pagination with a cached data-access function',
      scenario: 'The /posts page takes ?q=next&page=2 from the URL and must return 5 results per page plus the total page count.',
      steps: [
        'Create lib/data/posts.js with getPosts({ q, page }) wrapped in React cache()',
        'Use prisma.$transaction([findMany, count]) to fetch rows and total together',
        'In app/posts/page.js read searchParams (await it in Next.js 15) and call getPosts',
        'Render Prev/Next links that keep q in the URL',
        'Try the SIMULATION search box and pager',
      ],
      code:
        "// lib/data/posts.js\nimport 'server-only';\nimport { cache } from 'react';\nimport { prisma } from '@/lib/prisma';\n\nexport const PAGE_SIZE = 5;\n\nexport const getPosts = cache(async ({ q = '', page = 1 }) => {\n  const where = { published: true, title: { contains: q, mode: 'insensitive' } };\n  const [rows, total] = await prisma.$transaction([\n    prisma.post.findMany({ where, orderBy: { id: 'desc' }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),\n    prisma.post.count({ where }),\n  ]);\n  return { rows, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };\n});\n\n// app/posts/page.js\nimport Link from 'next/link';\nimport { getPosts } from '@/lib/data/posts';\n\nexport default async function Posts({ searchParams }) {\n  const { q = '', page = '1' } = await searchParams;\n  const current = Number(page) || 1;\n  const { rows, totalPages } = await getPosts({ q, page: current });\n  const href = (p) => '/posts?q=' + encodeURIComponent(q) + '&page=' + p;\n  return (\n    <main>\n      <form><input name=\"q\" defaultValue={q} placeholder=\"Search\" /></form>\n      <ul>{rows.map((p) => <li key={p.id}>{p.title}</li>)}</ul>\n      {current > 1 && <Link href={href(current - 1)}>Prev</Link>}\n      <span> Page {current} of {totalPages} </span>\n      {current < totalPages && <Link href={href(current + 1)}>Next</Link>}\n    </main>\n  );\n}",
      playground: {
        jsx: "// SIMULATION of getPosts({ q, page }) with take/skip/count on an in-memory table.\nconst ALL = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, title: (i % 3 === 0 ? 'Next.js tip #' : 'React note #') + (i + 1) }));\nconst PAGE_SIZE = 5;\nfunction getPosts({ q, page }) {\n  const filtered = ALL.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.id - a.id);\n  return {\n    rows: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), // skip + take\n    totalPages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), // count\n  };\n}\n\nfunction App() {\n  const [q, setQ] = React.useState('');\n  const [page, setPage] = React.useState(1);\n  const { rows, totalPages } = getPosts({ q, page });\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <input value={q} placeholder=\"Search (try next)\" onChange={(e) => { setQ(e.target.value); setPage(1); }} />\n      <p style={{ fontSize: 12, color: '#555' }}>URL would be: /posts?q={encodeURIComponent(q)}&page={page}</p>\n      <ul>{rows.map((p) => <li key={p.id}>{p.title}</li>)}</ul>\n      <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>\n      <span> Page {page} of {totalPages} </span>\n      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>\n    </div>\n  );\n}",
      },
      result: 'Initially "Page 1 of 5" with 5 posts. Typing "next" reduces it to "Page 1 of 2" showing only "Next.js tip" posts.',
      explanation:
        'take = page size, skip = (page - 1) * size, and count gives the total for the pager. $transaction runs both queries together. cache() deduplicates the call if generateMetadata and the page both ask for the same data in one request.',
    },
  ],
  interview: [
    { q: 'What is Prisma and what are its main parts?', a: 'Prisma is a Node.js/TypeScript ORM. Parts: the Prisma schema (schema.prisma: datasource, generator, models), Prisma Migrate (creates and applies SQL migrations), Prisma Client (generated, type-safe query builder) and Prisma Studio (GUI for data).', level: 'Easy' },
    { q: 'Why do we create a PrismaClient singleton in Next.js?', a: 'In development, hot reload re-executes modules; a new PrismaClient on every reload opens new connection pools and exhausts database connections. Storing the instance on globalThis in development reuses one client.', level: 'Medium' },
    { q: 'Difference between prisma migrate dev and prisma migrate deploy?', a: 'migrate dev (development) compares the schema to the database, creates a new migration file, applies it and regenerates the client; it may reset the dev DB. migrate deploy (production/CI) only applies pending existing migrations and never creates or resets anything.', level: 'Medium' },
    { q: 'Can you query the database directly inside a React component in Next.js?', a: 'Yes, inside Server Components (async function components), because they run only on the server. Credentials and the ORM never go to the browser. You cannot do this in Client Components; they must call a Server Action or Route Handler.', level: 'Easy' },
    { q: 'What is the difference between include and select in Prisma?', a: 'include adds related records to the full model result (e.g. post + author). select returns only the listed fields (and can nest relations). Use select to reduce payload size; you cannot use both at the same level.', level: 'Medium' },
    { q: 'What is the N+1 problem and how does Prisma help?', a: 'Fetching a list (1 query) and then the relation for each item separately (N queries). Using include/select for relations lets Prisma batch the relation loading in one or few queries instead of N.', level: 'Hard' },
    { q: 'How do you handle a unique constraint error in Prisma?', a: 'Catch Prisma.PrismaClientKnownRequestError and check e.code === "P2002"; return a user-friendly message like "Email already registered". Other common codes: P2025 (record not found for update/delete).', level: 'Medium' },
    { q: 'Why import "server-only" in data-access files?', a: 'It makes the build fail if that module is ever imported into a Client Component, preventing database code and secrets from being bundled for the browser.', level: 'Medium' },
    { q: 'What is a transaction and how do you use one in Prisma?', a: 'A group of operations that succeed or fail together (atomic). prisma.$transaction([op1, op2]) for independent queries, or the interactive form prisma.$transaction(async (tx) => { ... }) when later steps depend on earlier results.', level: 'Medium' },
    { q: 'How do you avoid "OverwriteModelError" with Mongoose in Next.js?', a: 'Hot reload re-runs model files; compile models only once using mongoose.models.Post || mongoose.model("Post", schema). Also cache the connection on globalThis.', level: 'Medium' },
    { q: 'Can Prisma run on the Edge runtime?', a: 'Classic Prisma Client needs Node.js APIs and TCP connections, so database pages should use the default Node.js runtime. For edge, use Prisma Accelerate or driver adapters with serverless drivers (e.g. Neon, PlanetScale) that work over HTTP/WebSockets.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a schema.prisma for a Product catalogue: Category (id, name unique) and Product (id, name, price Decimal, stock Int default 0, category relation, createdAt).',
      hint: 'One-to-many: products Product[] on Category and categoryId + @relation on Product.',
      solution:
        "model Category {\n  id       Int       @id @default(autoincrement())\n  name     String    @unique\n  products Product[]\n}\n\nmodel Product {\n  id         Int      @id @default(autoincrement())\n  name       String\n  price      Decimal  @db.Decimal(10, 2)\n  stock      Int      @default(0)\n  category   Category @relation(fields: [categoryId], references: [id])\n  categoryId Int\n  createdAt  DateTime @default(now())\n\n  @@index([categoryId])\n}\n\n// then: npx prisma migrate dev --name catalogue",
    },
    {
      task: 'Create a seed script (prisma/seed.js) that inserts 2 categories and 3 products, and configure it in package.json.',
      hint: 'upsert for idempotent seeding; "prisma": { "seed": "node prisma/seed.js" }.',
      solution:
        "// prisma/seed.js\nconst { PrismaClient } = require('@prisma/client');\nconst prisma = new PrismaClient();\n\nasync function main() {\n  const shoes = await prisma.category.upsert({ where: { name: 'Shoes' }, update: {}, create: { name: 'Shoes' } });\n  const bags = await prisma.category.upsert({ where: { name: 'Bags' }, update: {}, create: { name: 'Bags' } });\n  await prisma.product.createMany({\n    data: [\n      { name: 'Runner', price: 2499, stock: 10, categoryId: shoes.id },\n      { name: 'Loafer', price: 1999, stock: 5, categoryId: shoes.id },\n      { name: 'Backpack', price: 1499, stock: 20, categoryId: bags.id },\n    ],\n  });\n}\n\nmain().finally(() => prisma.$disconnect());\n\n// package.json\n// \"prisma\": { \"seed\": \"node prisma/seed.js\" }\n// run: npx prisma db seed",
    },
    {
      task: 'Build app/products/[id]/page.js that shows one product with its category, and calls notFound() when missing.',
      hint: 'findUnique + include; await params; Number(id).',
      solution:
        "import { notFound } from 'next/navigation';\nimport { prisma } from '@/lib/prisma';\n\nexport default async function ProductPage({ params }) {\n  const { id } = await params;\n  const product = await prisma.product.findUnique({\n    where: { id: Number(id) },\n    include: { category: true },\n  });\n  if (!product) notFound();\n  return (\n    <article>\n      <h1>{product.name}</h1>\n      <p>Category: {product.category.name}</p>\n      <p>Price: Rs {product.price.toString()}</p>\n      <p>{product.stock > 0 ? product.stock + ' in stock' : 'Out of stock'}</p>\n    </article>\n  );\n}",
    },
    {
      task: 'Write a Server Action updateStock(productId, formData) that sets a new stock value (0-1000) and revalidates the product page.',
      hint: 'Validate with Number.isInteger; prisma.product.update.',
      solution:
        "'use server';\nimport { revalidatePath } from 'next/cache';\nimport { prisma } from '@/lib/prisma';\n\nexport async function updateStock(productId, formData) {\n  const stock = Number(formData.get('stock'));\n  if (!Number.isInteger(stock) || stock < 0 || stock > 1000) {\n    return { error: 'Stock must be a whole number between 0 and 1000' };\n  }\n  await prisma.product.update({ where: { id: productId }, data: { stock } });\n  revalidatePath('/products/' + productId);\n  return { error: null };\n}\n\n// usage: <form action={updateStock.bind(null, product.id)}><input name=\"stock\" type=\"number\" /><button>Save</button></form>",
    },
    {
      task: 'Rewrite the product list using Mongoose instead of Prisma, passing plain serializable objects to a Client Component.',
      hint: 'dbConnect(), .lean(), map _id to string.',
      solution:
        "// models/Product.js\nimport mongoose from 'mongoose';\nconst ProductSchema = new mongoose.Schema({ name: String, price: Number, stock: Number }, { timestamps: true });\nexport default mongoose.models.Product || mongoose.model('Product', ProductSchema);\n\n// app/products/page.js\nimport { dbConnect } from '@/lib/mongoose';\nimport Product from '@/models/Product';\nimport ProductGrid from './ProductGrid'; // 'use client'\n\nexport default async function Products() {\n  await dbConnect();\n  const docs = await Product.find().sort({ createdAt: -1 }).lean();\n  const products = docs.map((d) => ({ id: d._id.toString(), name: d.name, price: d.price, stock: d.stock }));\n  return <ProductGrid products={products} />;\n}",
    },
  ],
  quiz: [
    { question: 'Which command creates and applies a new migration during development?', options: ['npx prisma generate', 'npx prisma migrate deploy', 'npx prisma migrate dev --name init', 'npx prisma studio'], answer: 2, explanation: 'migrate dev creates the migration SQL, applies it and regenerates the client.' },
    { question: 'Why store PrismaClient on globalThis in development?', options: ['To avoid creating many clients and connections on hot reload', 'To share it with the browser', 'It is required by Vercel', 'To enable Prisma Studio'], answer: 0, explanation: 'Hot reload would otherwise create a new client each time.' },
    { question: 'Which Prisma option loads the related author with each post?', options: ['join: { author }', 'populate: "author"', 'with: ["author"]', 'include: { author: true }'], answer: 3, explanation: 'include loads relations (populate is Mongoose).' },
    { question: 'Prisma error code P2002 means…', options: ['Record not found', 'Unique constraint failed', 'Connection timeout', 'Invalid schema'], answer: 1, explanation: 'P2002 = unique constraint violation; P2025 = record not found.' },
    { question: 'Where can you call prisma.post.findMany() directly?', options: ['In a "use client" component', 'In the browser console', 'In an async Server Component', 'Inside a CSS module'], answer: 2, explanation: 'Server Components run on the server and can access the database.' },
  ],
};
