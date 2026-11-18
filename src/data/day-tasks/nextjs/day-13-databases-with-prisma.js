export default {
  lesson: 'day-13-databases-with-prisma',
  minutes: 35,
  intro: 'Practise Prisma schema and migration basics, the PrismaClient singleton and the findMany options where, orderBy, skip, take and include.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You changed `schema.prisma` during development. Which command creates a migration file, applies it to the database and regenerates Prisma Client?',
      options: ['npx prisma generate', 'npx prisma migrate dev --name add_fee', 'npx prisma studio', 'npm run build'],
      answer: 1,
      explain: '`prisma migrate dev` creates a SQL migration from the schema change, applies it and runs `generate`. `prisma generate` only regenerates the client, `studio` opens a GUI, and in production you use `prisma migrate deploy`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the Prisma schema line for an auto-incrementing integer primary key:\n\n`id Int @id @default(_______)`',
      accept: ['autoincrement()', 'autoincrement'],
      explain: '`@id` marks the primary key and `@default(autoincrement())` lets the database assign 1, 2, 3... For string ids you would use `String @id @default(cuid())` or `uuid()`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why do Next.js projects store the PrismaClient on `globalThis` in development (`globalThis.prisma ??= new PrismaClient()`)?',
      options: [
        'Because PrismaClient only works as a global variable',
        'Hot reload re-runs modules, and creating a new client each time opens too many database connections',
        'To make Prisma work in the browser',
        'To make queries run faster in production',
      ],
      answer: 1,
      explain: 'Every file save re-executes your modules in dev; a `new PrismaClient()` each time leaks connection pools until the database refuses connections ("too many clients"). Keeping one instance on `globalThis` survives hot reload. In production the module runs once, so the guard is only needed in dev.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the query so each course comes back together with its related lessons:\n\n`await prisma.course.findMany({ _______: { lessons: true } })`',
      accept: ['include'],
      explain: '`include` loads relations (a JOIN behind the scenes). `select` instead chooses which fields to return. Forgetting `include` and then reading `course.lessons` gives `undefined`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'This plain-JS code does the same as\n`prisma.student.findMany({ where: { city: "Pune" }, orderBy: { fee: "desc" }, skip: 1, take: 2 })`.\nWhat is printed?',
      code: `const students = [
  { name: 'Asha', city: 'Pune', fee: 5000 },
  { name: 'Ravi', city: 'Delhi', fee: 7000 },
  { name: 'Meera', city: 'Pune', fee: 9000 },
  { name: 'Kabir', city: 'Pune', fee: 3000 },
];
const result = students
  .filter((s) => s.city === 'Pune')
  .sort((a, b) => b.fee - a.fee)
  .slice(1, 3)
  .map((s) => s.name);
console.log(result.join(', '));`,
      expected: 'Asha, Kabir',
      explain: 'Order of operations: **where** (Asha, Meera, Kabir) → **orderBy fee desc** (Meera 9000, Asha 5000, Kabir 3000) → **skip 1** drops Meera → **take 2** keeps Asha and Kabir. skip/take are how you build pagination.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write a data-access function `getStudentsPage(db, page, pageSize)` that calls `db.student.findMany(...)` with:\n- `orderBy: { name: "asc" }`\n- `skip` = how many rows come before this page (pages start at 1)\n- `take` = `pageSize`\n\nand returns its result. The tests pass a fake `db` that echoes the options it receives.',
      example: { title: 'pagination maths', code: '// page 1 → skip 0, page 2 → skip 10 (pageSize 10)\nconst skip = (page - 1) * pageSize;' },
      starter: 'async function getStudentsPage(db, page, pageSize) {\n  // TODO\n}\n',
      solution: "async function getStudentsPage(db, page, pageSize) {\n  return db.student.findMany({\n    orderBy: { name: 'asc' },\n    skip: (page - 1) * pageSize,\n    take: pageSize,\n  });\n}",
      tests: [
        { call: 'getStudentsPage({ student: { findMany: async (opts) => opts } }, 1, 10)', expect: { orderBy: { name: 'asc' }, skip: 0, take: 10 } },
        { call: 'getStudentsPage({ student: { findMany: async (opts) => opts } }, 3, 20)', expect: { orderBy: { name: 'asc' }, skip: 40, take: 20 } },
      ],
      explain: 'Putting queries in a data-access layer (`lib/data/students.js`) keeps pages and actions small, makes queries reusable and easy to test with a fake db. The usual pagination bug is `skip: page * pageSize`, which skips the whole first page.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: 'Build a tiny in-memory imitation of Prisma: `findMany(rows, options)` supports\n- `where`: object of exact field matches (all must match)\n- `orderBy`: `{ field: "asc" | "desc" }` (one field, numbers or strings)\n- `skip` and `take`\n\nAll options are optional. Return a new array.',
      example: { title: 'sorting by a dynamic field', code: "const [field, dir] = Object.entries({ fee: 'desc' })[0];\nlist.sort((a, b) => (a[field] > b[field] ? 1 : -1) * (dir === 'desc' ? -1 : 1));" },
      starter: 'function findMany(rows, options = {}) {\n  // TODO\n  return rows;\n}\n',
      solution: "function findMany(rows, options = {}) {\n  let out = rows.filter((r) => Object.entries(options.where || {}).every(([k, v]) => r[k] === v));\n  if (options.orderBy) {\n    const [field, dir] = Object.entries(options.orderBy)[0];\n    out = [...out].sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * (dir === 'desc' ? -1 : 1));\n  }\n  const skip = options.skip || 0;\n  const end = options.take != null ? skip + options.take : undefined;\n  return out.slice(skip, end);\n}",
      tests: [
        { call: "findMany([{ n: 'A', c: 'Pune' }, { n: 'B', c: 'Goa' }], { where: { c: 'Pune' } }).map((r) => r.n)", expect: ['A'] },
        { call: "findMany([{ n: 'A', f: 5 }, { n: 'B', f: 9 }, { n: 'C', f: 1 }], { orderBy: { f: 'desc' } }).map((r) => r.n)", expect: ['B', 'A', 'C'] },
        { call: "findMany([{ n: 'C' }, { n: 'A' }, { n: 'B' }, { n: 'D' }], { orderBy: { n: 'asc' }, skip: 1, take: 2 }).map((r) => r.n)", expect: ['B', 'C'] },
        { call: "findMany([{ n: 'A' }, { n: 'B' }]).length", expect: 2, msg: 'Without options return all rows' },
      ],
      explain: 'Prisma applies options in the same order as SQL: WHERE → ORDER BY → OFFSET (skip) → LIMIT (take). Building it yourself makes clear why pagination without a stable `orderBy` gives random pages.',
    },
  ],
};
