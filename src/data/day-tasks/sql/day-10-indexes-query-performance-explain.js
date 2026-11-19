export default {
  lesson: 'day-10-indexes-query-performance-explain',
  minutes: 30,
  intro: 'Create single, composite and unique indexes, apply the leftmost-prefix rule, read EXPLAIN plans and write index-friendly queries.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'There is a composite index on `(city, last_name)`. Which WHERE clause **cannot** use it efficiently?',
      options: ["WHERE city = 'Pune'", "WHERE city = 'Pune' AND last_name = 'Patil'", "WHERE last_name = 'Patil'", "WHERE city = 'Pune' AND last_name LIKE 'Pa%'"],
      answer: 2,
      explain: '**Leftmost prefix rule**: a composite index is sorted by city first, then last_name, like a phone book sorted by city then surname. Searching by surname alone means scanning every city. Put the most frequently filtered (and selective) column first.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which practices usually make queries faster or keep indexes usable? (choose all that apply)',
      options: ["Write `WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'` instead of `WHERE YEAR(order_date) = 2024`", 'Select only the columns you need instead of SELECT *', 'Add an index on every column of every table', "Avoid a leading wildcard like `LIKE '%kumar'` on large tables", 'Index foreign-key columns used in joins'],
      answers: [0, 1, 3, 4],
      explain: 'Wrapping an indexed column in a function hides it from the index; a range on the raw column can use it. Indexes speed up reads but slow down INSERT/UPDATE/DELETE and use disk, so "index everything" is wrong. A leading `%` cannot use a B-tree index.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: 'Create an index named **`idx_orders_customer`** on `orders(customer_id)`, then list the names of all indexes on `orders` (in SQLite: `SELECT name FROM pragma_index_list(\'orders\')`).',
      example: { title: 'CREATE INDEX', code: 'CREATE INDEX idx_students_city ON students(city);\n-- MySQL: SHOW INDEX FROM students;' },
      setup: `CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, amount INTEGER);
INSERT INTO orders VALUES (1, 10, '2024-01-05', 1200), (2, 11, '2024-01-07', 800), (3, 10, '2024-02-01', 450);`,
      starter: '-- CREATE INDEX ...\n',
      solution: `CREATE INDEX idx_orders_customer ON orders(customer_id);
SELECT name FROM pragma_index_list('orders');`,
      check: "SELECT il.name, ii.name FROM pragma_index_list('orders') il JOIN pragma_index_info(il.name) ii ORDER BY 1, 2;",
      explain: 'An index is a sorted copy of the column(s) with pointers to the rows, so `WHERE customer_id = 10` can jump straight to the matches instead of scanning the table. Index the columns you filter, join and sort on most often.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'Business rule: **no two users may share an email**. Create a **unique** index `idx_users_email` on `users(email)`. Then insert a new user (4, \'Meera\', \'meera@x.in\') and show all users.',
      example: { title: 'UNIQUE INDEX', code: 'CREATE UNIQUE INDEX idx_emp_pan ON employees(pan_number);' },
      setup: `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);
INSERT INTO users VALUES (1, 'Asha', 'asha@x.in'), (2, 'Ravi', 'ravi@x.in'), (3, 'Neha', 'neha@x.in');`,
      starter: '-- CREATE UNIQUE INDEX ...\n',
      solution: `CREATE UNIQUE INDEX idx_users_email ON users(email);
INSERT INTO users VALUES (4, 'Meera', 'meera@x.in');
SELECT * FROM users;`,
      check: `SELECT (SELECT COUNT(*) FROM pragma_index_list('users') WHERE name = 'idx_users_email' AND "unique" = 1) AS unique_idx,
  (SELECT COUNT(*) FROM users) AS n_users;`,
      explain: 'A unique index both speeds up lookups by email and makes the database **reject** a duplicate (`UNIQUE constraint failed` / MySQL error 1062). Enforcing rules in the database protects you from bugs in every application that writes to it.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In MySQL, which keyword placed before a SELECT shows the query plan (which index is used, how many rows are examined)? (one word)',
      accept: ['EXPLAIN', 'explain', 'EXPLAIN ANALYZE', 'explain analyze'],
      explain: '`EXPLAIN SELECT ...` shows the plan: `type = ALL` means a full table scan, `ref`/`range`/`const` mean index use, and `key` shows which index was chosen. `EXPLAIN ANALYZE` (MySQL 8.0.18+) actually runs the query and reports real timings. SQLite uses `EXPLAIN QUERY PLAN`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`EXPLAIN` shows `type: ALL`, `rows: 2,000,000` for `SELECT * FROM orders WHERE customer_id = 42`. What is the most likely fix?',
      options: ['Add LIMIT 1000', 'Create an index on orders(customer_id)', 'Use SELECT DISTINCT', 'Increase the server RAM'],
      answer: 1,
      explain: '`type: ALL` = full table scan: every one of 2 million rows is checked. An index on the filtered column lets MySQL read only the matching rows (`type: ref`). LIMIT does not help when the matching rows are spread across the table and must be found first.',
    },
  ],
};
