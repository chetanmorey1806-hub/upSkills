export default {
  lesson: 'day-03-dml-dql-insert-update-delete-select',
  minutes: 30,
  intro: 'Add, change and remove rows with INSERT, UPDATE and DELETE, and read exactly the rows you need with SELECT and WHERE (queries run in SQLite).',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens if you run `UPDATE employees SET salary = 50000;` **without a WHERE clause**?',
      options: ['Nothing – MySQL needs a WHERE', 'Only the first row changes', 'Every employee\'s salary becomes 50000', 'It raises a syntax error'],
      answer: 2,
      explain: 'Without WHERE, UPDATE and DELETE affect **every row**. Always write and test the WHERE as a SELECT first. MySQL Workbench\'s "safe updates" mode blocks UPDATE/DELETE without a key in WHERE for this reason.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: 'Insert these two new products into `products` in **one** INSERT statement:\n- id 4, \'Stapler\', 120, stock 30\n- id 5, \'Marker\', 35, stock 200',
      example: { title: 'multi-row INSERT', code: "INSERT INTO students (roll_no, name, city)\nVALUES (5, 'Meera', 'Nashik'),\n       (6, 'Arjun', 'Nagpur');" },
      setup: `CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price INTEGER, stock INTEGER DEFAULT 0);
INSERT INTO products VALUES (1, 'Notebook', 45, 120), (2, 'Pen', 10, 500), (3, 'Bag', 799, 15);`,
      starter: '-- INSERT INTO products ...\n',
      solution: "INSERT INTO products (id, name, price, stock) VALUES (4, 'Stapler', 120, 30), (5, 'Marker', 35, 200);",
      check: 'SELECT * FROM products ORDER BY id;',
      explain: 'Listing the column names makes the INSERT safe even if the table later gets new columns or a different column order. One multi-row INSERT is much faster than many single-row inserts.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: 'Give every employee of the **Sales** department a **10% raise** (salary × 1.10). Other departments must not change.',
      example: { title: 'UPDATE with WHERE', code: "UPDATE products SET price = price * 0.9 WHERE category = 'Clearance';" },
      setup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary REAL);
INSERT INTO employees VALUES (1, 'Asha', 'Sales', 40000), (2, 'Ravi', 'IT', 65000), (3, 'Neha', 'Sales', 45000), (4, 'Karan', 'HR', 38000);`,
      starter: '-- UPDATE employees ...\n',
      solution: "UPDATE employees SET salary = salary * 1.10 WHERE dept = 'Sales';",
      check: 'SELECT id, ROUND(salary, 2) FROM employees ORDER BY id;',
      explain: '`SET salary = salary * 1.10` uses the old value of each row. The WHERE limits the change to Sales; run `SELECT * FROM employees WHERE dept = \'Sales\'` first to see which rows will be touched.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: 'Delete all orders whose status is **\'Cancelled\'**.',
      example: { title: 'DELETE with WHERE', code: "DELETE FROM sessions WHERE last_seen < '2024-01-01';" },
      setup: `CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer TEXT, amount INTEGER, status TEXT);
INSERT INTO orders VALUES (1, 'Asha', 1200, 'Delivered'), (2, 'Ravi', 800, 'Cancelled'), (3, 'Neha', 450, 'Pending'), (4, 'Karan', 2300, 'Cancelled'), (5, 'Meera', 990, 'Delivered');`,
      starter: '-- DELETE FROM orders ...\n',
      solution: "DELETE FROM orders WHERE status = 'Cancelled';",
      check: 'SELECT * FROM orders ORDER BY order_id;',
      explain: 'DELETE removes whole rows that match the WHERE. Many companies prefer a **soft delete** (an `is_deleted` flag or status) so history is kept for reports and audits.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'Show `name`, `salary` and a calculated column **`annual_salary`** (= salary × 12) for employees in **Pune** with salary **at least 40000**.',
      example: { title: 'expressions and aliases', code: "SELECT name, price, price * 1.18 AS price_with_gst\nFROM products\nWHERE category = 'Books' AND price < 500;" },
      setup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, city TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Asha', 'Pune', 52000), (2, 'Ravi', 'Delhi', 61000), (3, 'Neha', 'Pune', 38000), (4, 'Karan', 'Pune', 40000), (5, 'Meera', 'Mumbai', 72000);`,
      starter: '-- SELECT ...\n',
      solution: "SELECT name, salary, salary * 12 AS annual_salary FROM employees WHERE city = 'Pune' AND salary >= 40000;",
      explain: 'WHERE filters rows **before** they are returned; `AND` needs both conditions. `>=` includes Karan with exactly 40000 – using `>` would miss him. `AS` names the calculated column.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: '**INSERT … SELECT.** Copy every order **from 2023** (order_date before \'2024-01-01\') into `orders_archive`, then delete them from `orders`.',
      example: { title: 'copy rows between tables', code: "INSERT INTO old_students (roll_no, name)\nSELECT roll_no, name FROM students WHERE passed_out = 1;" },
      setup: `CREATE TABLE orders (order_id INTEGER PRIMARY KEY, order_date TEXT, amount INTEGER);
CREATE TABLE orders_archive (order_id INTEGER PRIMARY KEY, order_date TEXT, amount INTEGER);
INSERT INTO orders VALUES (1, '2023-11-05', 1200), (2, '2023-12-28', 640), (3, '2024-01-03', 900), (4, '2024-02-14', 1500);`,
      starter: '-- INSERT INTO orders_archive SELECT ...;\n-- DELETE FROM orders ...;\n',
      solution: `INSERT INTO orders_archive SELECT * FROM orders WHERE order_date < '2024-01-01';
DELETE FROM orders WHERE order_date < '2024-01-01';`,
      check: "SELECT 'archive' AS t, order_id FROM orders_archive UNION ALL SELECT 'live', order_id FROM orders ORDER BY 1, 2;",
      explain: 'INSERT … SELECT copies many rows in one statement. Run the copy first, then the delete with the **same** condition – in production wrap both in a transaction so a failure cannot lose rows. Dates stored as \'YYYY-MM-DD\' text compare correctly as strings.',
    },
  ],
};
