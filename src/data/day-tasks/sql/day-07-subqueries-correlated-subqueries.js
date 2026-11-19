export default {
  lesson: 'day-07-subqueries-correlated-subqueries',
  minutes: 35,
  intro: 'Answer multi-step questions with scalar, multi-row, derived-table and correlated subqueries, and use EXISTS / NOT EXISTS.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'What makes a subquery **correlated**?',
      options: ['It is written inside FROM', 'It refers to a column of the outer query, so it is evaluated for each outer row', 'It returns more than one row', 'It uses GROUP BY'],
      answer: 1,
      explain: 'A correlated subquery uses a value from the current outer row (e.g. `WHERE i.dept = o.dept`), so conceptually it runs once per outer row. A plain subquery is independent and runs once. Correlated subqueries can be slow on big tables – a JOIN to a grouped derived table or a window function is often faster.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: 'Show `name` and `salary` of employees who earn **more than the company average** salary.',
      example: { title: 'scalar subquery', code: 'SELECT name, marks FROM students\nWHERE marks > (SELECT AVG(marks) FROM students);' },
      setup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Asha', 'IT', 90000), (2, 'Ravi', 'IT', 60000), (3, 'Neha', 'HR', 52000), (4, 'Karan', 'HR', 40000), (5, 'Meera', 'Sales', 45000), (6, 'Arjun', 'Sales', 61000);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);',
      explain: 'The inner query returns one number (58000), which the outer WHERE compares against. You cannot write `WHERE salary > AVG(salary)` directly – aggregates are not allowed in WHERE.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'Show `name` and `dept` of employees who earn **more than the average of their own department** (correlated subquery).',
      example: { title: 'correlated subquery', code: 'SELECT s.name FROM students s\nWHERE s.marks > (SELECT AVG(x.marks) FROM students x WHERE x.class = s.class);' },
      setup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Asha', 'IT', 90000), (2, 'Ravi', 'IT', 60000), (3, 'Neha', 'HR', 52000), (4, 'Karan', 'HR', 40000), (5, 'Meera', 'Sales', 45000), (6, 'Arjun', 'Sales', 61000);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT e.name, e.dept FROM employees e WHERE e.salary > (SELECT AVG(i.salary) FROM employees i WHERE i.dept = e.dept);',
      explain: 'The inner query is re-evaluated for each employee with **that employee\'s** department. Note Ravi (60000) is above the company average but below the IT average (75000), so he is not in this result.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'Show the `name` of products that have **never been ordered**, using `NOT EXISTS`.',
      example: { title: 'EXISTS / NOT EXISTS', code: 'SELECT c.name FROM customers c\nWHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);' },
      setup: `CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER);
CREATE TABLE order_items (id INTEGER PRIMARY KEY, product_id INTEGER, qty INTEGER);
INSERT INTO products VALUES (1, 'Pen', 10), (2, 'Bag', 799), (3, 'Lamp', 450), (4, 'Diary', 150), (5, 'Ruler', 20);
INSERT INTO order_items VALUES (1, 1, 10), (2, 3, 1), (3, 1, 4), (4, NULL, 2);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT p.name FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id);',
      explain: '`NOT EXISTS` is true when the subquery finds no row. It is safer than `NOT IN`: here `order_items` contains a NULL product_id, and `WHERE id NOT IN (SELECT product_id ...)` would return **no rows at all**, because comparing with NULL is unknown.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: '**Derived table.** Show departments whose **total payroll** is **above the average department payroll**. Columns: `dept`, `payroll`.',
      example: { title: 'subquery in FROM', code: 'SELECT t.city, t.revenue\nFROM (SELECT city, SUM(amount) AS revenue FROM orders GROUP BY city) AS t\nWHERE t.revenue > 100000;' },
      setup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Asha', 'IT', 90000), (2, 'Ravi', 'IT', 60000), (3, 'Neha', 'HR', 52000), (4, 'Karan', 'HR', 40000), (5, 'Meera', 'Sales', 45000), (6, 'Arjun', 'Sales', 61000);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT t.dept, t.payroll FROM (SELECT dept, SUM(salary) AS payroll FROM employees GROUP BY dept) t WHERE t.payroll > (SELECT AVG(payroll) FROM (SELECT SUM(salary) AS payroll FROM employees GROUP BY dept));',
      explain: 'Payrolls: IT 150000, HR 92000, Sales 106000 → average 116000, so only IT qualifies. A derived table (subquery in FROM, needs an alias in MySQL) turns a grouped result into a table you can filter again. A CTE (Day 14) makes this more readable.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'In MySQL, `WHERE salary > ALL (SELECT salary FROM employees WHERE dept = \'HR\')` means:',
      options: ['salary is greater than at least one HR salary', 'salary is greater than every HR salary (i.e. the HR maximum)', 'salary equals an HR salary', 'it is a syntax error'],
      answer: 1,
      explain: '`> ALL (...)` = greater than the **maximum**; `> ANY (...)` = greater than the **minimum** (at least one). SQLite does not support ANY/ALL, so you rewrite them with `> (SELECT MAX(...))` / `> (SELECT MIN(...))`.',
    },
  ],
};
