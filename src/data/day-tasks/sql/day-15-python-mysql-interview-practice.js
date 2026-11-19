export default {
  lesson: 'day-15-python-mysql-interview-practice',
  minutes: 40,
  intro: 'Use Python with a database safely (parameterised queries, commit/rollback) and solve the most-asked SQL interview problems: duplicates, Nth highest, monthly growth and top customer.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'With `mysql-connector-python`, which line is **safe from SQL injection**?',
      options: [
        'cur.execute(f"SELECT * FROM users WHERE email = \'{email}\'")',
        'cur.execute("SELECT * FROM users WHERE email = \'" + email + "\'")',
        'cur.execute("SELECT * FROM users WHERE email = %s", (email,))',
        'cur.execute("SELECT * FROM users WHERE email = %s" % email)',
      ],
      answer: 2,
      explain: 'Passing values separately as parameters lets the driver send them as **data**, never as SQL code. Building the string yourself (f-string, +, %) lets input like `\' OR \'1\'=\'1` change the query. Note the tuple `(email,)` – the trailing comma matters.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about Python + MySQL are TRUE? (choose all that apply)',
      options: ['mysql-connector does not autocommit by default, so call `conn.commit()` after INSERT/UPDATE/DELETE', 'Call `conn.rollback()` in an `except` block when a statement fails', '`cur.executemany(sql, rows)` inserts many rows efficiently', 'Close the cursor and connection (or use `with` / finally) when done', 'Store the database password directly in the source code pushed to GitHub'],
      answers: [0, 1, 2, 3],
      explain: 'Forgetting `commit()` is the #1 reason "my insert worked but the row is not in the table". Keep credentials in environment variables or a config file that is not committed.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: '**Find duplicates.** Show each `email` that appears **more than once** in `customers` and how many times (`cnt`).',
      example: { title: 'GROUP BY … HAVING COUNT(*) > 1', code: 'SELECT phone, COUNT(*) AS cnt FROM leads GROUP BY phone HAVING COUNT(*) > 1;' },
      setup: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT);
INSERT INTO customers VALUES (1, 'Asha', 'asha@x.in'), (2, 'Ravi', 'ravi@x.in'), (3, 'Asha P', 'asha@x.in'), (4, 'Neha', 'neha@x.in'), (5, 'R Kumar', 'ravi@x.in'), (6, 'Asha Patil', 'asha@x.in');`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT email, COUNT(*) AS cnt FROM customers GROUP BY email HAVING COUNT(*) > 1;',
      explain: 'Group by the column that should be unique and keep groups with more than one row. In interviews the follow-up is "delete the duplicates but keep the lowest id" (next task).',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: '**Delete duplicates, keep the first.** Delete duplicate customers by `email`, keeping the row with the **smallest id** for each email.',
      example: { title: 'keep MIN(id) per group', code: 'DELETE FROM leads\nWHERE id NOT IN (SELECT MIN(id) FROM leads GROUP BY phone);\n-- MySQL needs a derived table wrapper: (SELECT * FROM (SELECT MIN(id) ...) t)' },
      setup: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT);
INSERT INTO customers VALUES (1, 'Asha', 'asha@x.in'), (2, 'Ravi', 'ravi@x.in'), (3, 'Asha P', 'asha@x.in'), (4, 'Neha', 'neha@x.in'), (5, 'R Kumar', 'ravi@x.in'), (6, 'Asha Patil', 'asha@x.in');`,
      starter: '-- DELETE FROM customers ...\n',
      solution: 'DELETE FROM customers WHERE id NOT IN (SELECT MIN(id) FROM customers GROUP BY email);',
      check: 'SELECT id, email FROM customers ORDER BY id;',
      explain: 'The subquery finds the id to keep for each email; everything else is deleted. MySQL refuses to read from the table it is deleting from in a direct subquery (error 1093), so there you wrap it: `NOT IN (SELECT id FROM (SELECT MIN(id) AS id FROM customers GROUP BY email) t)`, or use a self-join DELETE or ROW_NUMBER.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 8,
      q: '**Monthly revenue and growth.** Show `month` (\'YYYY-MM\'), `revenue` and `growth_pct` = % change vs the previous month rounded to 1 decimal (NULL for the first month). Order by month. (SQLite: `strftime(\'%Y-%m\', order_date)`; multiply by 100.0 to avoid integer division.)',
      example: { title: 'CTE + LAG', code: "WITH m AS (\n  SELECT strftime('%Y-%m', d) AS month, SUM(x) AS total FROM t GROUP BY month\n)\nSELECT month, total, total - LAG(total) OVER (ORDER BY month) FROM m;" },
      setup: `CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer TEXT, order_date TEXT, amount INTEGER);
INSERT INTO orders VALUES (1, 'Asha', '2024-01-04', 4000), (2, 'Ravi', '2024-01-20', 6000), (3, 'Asha', '2024-02-02', 5000),
(4, 'Neha', '2024-02-15', 7500), (5, 'Ravi', '2024-03-09', 3000), (6, 'Asha', '2024-03-21', 8000), (7, 'Neha', '2024-03-30', 4000);`,
      starter: '-- WITH monthly AS (...)\n',
      solution: `WITH monthly AS (
  SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue FROM orders GROUP BY month
)
SELECT month, revenue,
  ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0 / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
FROM monthly ORDER BY month;`,
      ordered: true,
      explain: 'Aggregate first (CTE), then compare each month with the previous one using LAG. Growth % = (current − previous) ÷ previous × 100. `* 100.0` forces decimal maths; with integers some databases would truncate the result to 0.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: '**Top customer.** Show the `customer` with the highest total `amount` and that total as `total`. If several customers tie for the top, show all of them.',
      example: { title: 'ties-safe top 1', code: 'SELECT city, SUM(amount) AS revenue FROM orders GROUP BY city\nHAVING SUM(amount) = (SELECT MAX(s) FROM (SELECT SUM(amount) AS s FROM orders GROUP BY city));' },
      setup: `CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer TEXT, order_date TEXT, amount INTEGER);
INSERT INTO orders VALUES (1, 'Asha', '2024-01-04', 4000), (2, 'Ravi', '2024-01-20', 6000), (3, 'Asha', '2024-02-02', 5000),
(4, 'Neha', '2024-02-15', 7500), (5, 'Ravi', '2024-03-09', 3000), (6, 'Asha', '2024-03-21', 8000), (7, 'Neha', '2024-03-30', 4000);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT customer, SUM(amount) AS total FROM orders GROUP BY customer HAVING SUM(amount) = (SELECT MAX(t) FROM (SELECT SUM(amount) AS t FROM orders GROUP BY customer));',
      explain: '`ORDER BY total DESC LIMIT 1` silently drops a tied customer; comparing with the maximum total (or `RANK() = 1`) returns all winners. Interviewers often ask "what if there is a tie?" – mention it before they do.',
    },
  ],
};
