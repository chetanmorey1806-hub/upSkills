const DATA = `CREATE TABLE students (student_id INT PRIMARY KEY, first_name VARCHAR(30), email VARCHAR(80), city VARCHAR(30), marks INT);
CREATE TABLE enrollments (student_id INT, course_id INT, grade CHAR(1));
CREATE TABLE orders (order_id INT PRIMARY KEY, customer_id INT, order_date DATE, status VARCHAR(15), amount INT);
INSERT INTO students VALUES (1, 'Aarav', 'aarav@college.edu', 'Pune', 88), (2, 'Diya', 'diya@college.edu', 'Mumbai', 92), (3, 'Kabir', 'kabir@college.edu', 'Pune', 64);
INSERT INTO enrollments VALUES (1, 101, 'A'), (2, 101, 'B'), (3, 201, 'A');
INSERT INTO orders VALUES
 (1, 10, '2023-12-30', 'DELIVERED', 1500), (2, 11, '2024-01-02', 'DELIVERED', 900),
 (3, 10, '2024-03-15', 'CANCELLED', 2200), (4, 12, '2024-11-20', 'DELIVERED', 450), (5, 13, '2025-01-01', 'PENDING', 3000);`;

export default {
  lesson: 'mysql-day-21',
  minutes: 30,
  intro: 'Speed up queries with indexes: create single, composite and unique indexes, apply the leftmost-prefix rule, read EXPLAIN and write sargable conditions.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about indexes are TRUE? (choose all that apply)',
      options: [
        'An index lets MySQL find rows without scanning the whole table',
        'Every index makes INSERT, UPDATE and DELETE a little slower and uses disk space',
        'The PRIMARY KEY is automatically indexed',
        'You should index every column of every table',
        'A UNIQUE index also prevents duplicate values',
      ],
      answers: [0, 1, 2, 4],
      explain: 'A B-Tree index is like the index at the back of a book: fast lookups, but it must be updated on every write. Index the columns used in WHERE, JOIN and ORDER BY of frequent queries, not everything. PRIMARY KEY and UNIQUE constraints create indexes automatically.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'There is a composite index on `enrollments(course_id, grade)`. Which WHERE clauses **can use** it? (choose all that apply)',
      options: ['WHERE course_id = 101', "WHERE grade = 'A'", "WHERE course_id = 101 AND grade = 'A'", "WHERE grade = 'A' AND course_id = 101"],
      answers: [0, 2, 3],
      explain: '**Leftmost-prefix rule**: a composite index (a, b) helps queries on `a` or on `a AND b`, but not on `b` alone, just like a phone book sorted by surname then first name cannot find "all Rahuls". The order of conditions inside WHERE does not matter.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which rewrite of `SELECT * FROM orders WHERE YEAR(order_date) = 2024;` can use an index on `order_date` (is **sargable**)?',
      options: [
        "WHERE order_date LIKE '2024%'",
        "WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'",
        "WHERE DATE_FORMAT(order_date, '%Y') = '2024'",
        "WHERE YEAR(order_date) IN (2024)",
      ],
      answer: 1,
      explain: 'Wrapping the column in a function (YEAR, DATE_FORMAT) or converting it to text hides it from the index, so MySQL scans every row. A **range on the bare column** lets the index jump straight to 2024. The half-open range `< \'2025-01-01\'` also covers times on 31 December.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In `EXPLAIN` output a row shows **type = ALL**, **key = NULL**, **rows = 250000**. What does it mean?',
      options: ['The query uses the best index', 'A full table scan: no index is used and about 250000 rows are examined', 'The table is empty', 'All columns are returned'],
      answer: 1,
      explain: '`type = ALL` is a full table scan (in Visual Explain: a red "Full Table Scan" box). Good types are `const`, `eq_ref`, `ref` and `range`, with a value in `key`. Add an index on the filtered column and run EXPLAIN again.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: 'Searches by city are slow. Create an index named **`idx_students_city`** on `students(city)`.',
      example: { title: 'creating an index', code: 'CREATE INDEX idx_orders_customer ON orders(customer_id);' },
      setup: DATA,
      starter: '-- CREATE INDEX ...\n',
      solution: 'CREATE INDEX idx_students_city ON students(city);',
      check: 'SHOW INDEX FROM students;',
      explain: '`CREATE INDEX name ON table(column)` (or `ALTER TABLE students ADD INDEX idx_students_city (city)`). A naming convention like idx_<table>_<column> makes indexes easy to find in `SHOW INDEX FROM students`.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: 'Create a **composite** index named **`idx_enr_course_grade`** on `enrollments(course_id, grade)` (in that order).',
      example: { title: 'a composite index', code: 'CREATE INDEX idx_orders_status_date ON orders(status, order_date);' },
      setup: DATA,
      starter: '-- composite index\n',
      solution: 'CREATE INDEX idx_enr_course_grade ON enrollments(course_id, grade);',
      check: 'SHOW INDEX FROM enrollments;',
      explain: 'The column order matters: put the column used in equality filters (and most often) first. SHOW INDEX lists one row per column with `Seq_in_index` 1 and 2.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: 'No two students may share an email, and logins search by email. Create a **unique** index named **`uq_students_email`** on `students(email)`.',
      example: { title: 'a unique index', code: 'CREATE UNIQUE INDEX uq_products_sku ON products(sku);' },
      setup: DATA,
      starter: '-- CREATE UNIQUE INDEX ...\n',
      solution: 'CREATE UNIQUE INDEX uq_students_email ON students(email);',
      check: 'SHOW INDEX FROM students;',
      explain: 'A UNIQUE index both speeds up lookups and blocks duplicates (Error 1062). In SHOW INDEX it has `Non_unique = 0`. Creating it fails if duplicates already exist, so clean the data first.',
    },
  ],
};
