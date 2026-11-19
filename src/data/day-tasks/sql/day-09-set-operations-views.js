export default {
  lesson: 'day-09-set-operations-views',
  minutes: 30,
  intro: 'Stack query results with UNION, UNION ALL, INTERSECT and EXCEPT, and save reusable queries as views.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between `UNION` and `UNION ALL`?',
      options: ['UNION ALL removes duplicates, UNION keeps them', 'UNION removes duplicate rows, UNION ALL keeps every row (and is faster)', 'UNION joins tables side by side', 'There is no difference'],
      answer: 1,
      explain: '`UNION` de-duplicates the combined result (extra sort/hash work); `UNION ALL` just appends. Use UNION ALL when duplicates are impossible or wanted (e.g. stacking monthly tables).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which rules apply to set operations like UNION? (choose all that apply)',
      options: ['Each SELECT must return the same number of columns', 'Matching columns should have compatible types', 'Column names of the result come from the first SELECT', 'One ORDER BY at the end sorts the whole combined result', 'Each SELECT must read from the same table'],
      answers: [0, 1, 2, 3],
      explain: 'The SELECTs can read different tables (customers and suppliers, for example) as long as the column count and types line up. Only one ORDER BY is allowed, after the last SELECT.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'Build one contact list of **all customers and suppliers** with columns `name`, `city` and `type` (\'Customer\' or \'Supplier\'), sorted by `name`.',
      example: { title: 'UNION ALL with a label column', code: "SELECT name, 'Student' AS role FROM students\nUNION ALL\nSELECT name, 'Teacher' FROM teachers\nORDER BY name;" },
      setup: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
CREATE TABLE suppliers (id INTEGER PRIMARY KEY, company TEXT, city TEXT);
INSERT INTO customers VALUES (1, 'Asha', 'Pune'), (2, 'Ravi', 'Delhi'), (3, 'Neha', 'Mumbai');
INSERT INTO suppliers VALUES (1, 'Bharat Traders', 'Pune'), (2, 'Akash Supplies', 'Surat');`,
      starter: '-- SELECT ...\n',
      solution: "SELECT name, city, 'Customer' AS type FROM customers UNION ALL SELECT company, city, 'Supplier' FROM suppliers ORDER BY name;",
      ordered: true,
      explain: 'The constant column tells the reader where each row came from. The second SELECT\'s column `company` is placed under `name` because columns are matched by **position**, not by name.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: '`batch_jan` and `batch_feb` list enrolled student emails. Show the emails that are in **January but not in February** (use `EXCEPT`), sorted.',
      example: { title: 'INTERSECT / EXCEPT', code: 'SELECT email FROM newsletter\nINTERSECT\nSELECT email FROM customers;   -- in both' },
      setup: `CREATE TABLE batch_jan (email TEXT);
CREATE TABLE batch_feb (email TEXT);
INSERT INTO batch_jan VALUES ('asha@x.in'), ('ravi@x.in'), ('neha@x.in'), ('karan@x.in');
INSERT INTO batch_feb VALUES ('ravi@x.in'), ('meera@x.in'), ('karan@x.in');`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT email FROM batch_jan EXCEPT SELECT email FROM batch_feb ORDER BY email;',
      ordered: true,
      explain: '`EXCEPT` (called MINUS in Oracle) keeps rows of the first query that are not in the second. MySQL supports INTERSECT and EXCEPT only from 8.0.31; in older versions write `WHERE email NOT IN (...)` or a LEFT JOIN anti-join.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: 'Create a view **`emp_public`** that shows `emp_id`, `name` and `dept` of employees but **hides the salary**. Then select everything from the view for the **IT** department.',
      example: { title: 'CREATE VIEW', code: "CREATE VIEW active_customers AS\nSELECT id, name, city FROM customers WHERE status = 'active';\n\nSELECT * FROM active_customers WHERE city = 'Pune';" },
      setup: `CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Asha', 'IT', 90000), (2, 'Ravi', 'HR', 52000), (3, 'Neha', 'IT', 61000), (4, 'Karan', 'Sales', 43000);`,
      starter: '-- CREATE VIEW emp_public AS ...;\n',
      solution: `CREATE VIEW emp_public AS SELECT emp_id, name, dept FROM employees;
SELECT * FROM emp_public WHERE dept = 'IT';`,
      check: `SELECT (SELECT COUNT(*) FROM sqlite_master WHERE type = 'view' AND name = 'emp_public') AS view_exists,
  (SELECT COUNT(*) FROM pragma_table_info('emp_public')) AS n_cols,
  (SELECT COUNT(*) FROM pragma_table_info('emp_public') WHERE name = 'salary') AS has_salary,
  (SELECT COUNT(*) FROM emp_public) AS n_rows;`,
      explain: 'A view stores the **query**, not the data, so it always shows current rows. Granting users access to the view instead of the table is a simple way to hide sensitive columns like salary.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A view `v_pune` is `SELECT * FROM customers WHERE city = \'Pune\'`. Someone inserts a new Pune customer into `customers`. What does `SELECT * FROM v_pune` show?',
      options: ['The old rows only – views are snapshots', 'The new customer too, because the view re-runs its query', 'An error until the view is refreshed', 'Only the new customer'],
      answer: 1,
      explain: 'A normal view is a saved query that runs every time you read it, so it reflects base-table changes immediately. A *materialised* view (not in MySQL; PostgreSQL/Oracle have them) stores a snapshot that must be refreshed.',
    },
  ],
};
