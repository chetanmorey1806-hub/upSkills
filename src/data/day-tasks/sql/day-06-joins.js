export default {
  lesson: 'day-06-joins',
  minutes: 35,
  intro: 'Combine tables with INNER, LEFT and SELF joins, find unmatched rows with an anti-join, and join three tables for a report.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: '`departments` has 4 rows; one department has **no employees**. Which join lists **all 4 departments**, with NULL employee columns for the empty one?',
      options: ['departments INNER JOIN employees', 'departments LEFT JOIN employees', 'departments CROSS JOIN employees', 'employees INNER JOIN departments'],
      answer: 1,
      explain: 'A LEFT JOIN keeps every row of the **left** table and fills NULLs when there is no match. INNER JOIN keeps only matching pairs, so the empty department disappears. CROSS JOIN pairs every row with every row (4 × n).',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: 'Show each employee\'s `name` with their `dept_name` (only employees that have a valid department).',
      example: { title: 'INNER JOIN', code: 'SELECT o.order_id, c.name\nFROM orders o\nINNER JOIN customers c ON o.customer_id = c.id;' },
      setup: `CREATE TABLE departments (dept_id INTEGER PRIMARY KEY, dept_name TEXT);
CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT, dept_id INTEGER, manager_id INTEGER, salary INTEGER);
INSERT INTO departments VALUES (10, 'IT'), (20, 'HR'), (30, 'Sales'), (40, 'Legal');
INSERT INTO employees VALUES (1, 'Asha', 10, NULL, 90000), (2, 'Ravi', 10, 1, 65000), (3, 'Neha', 20, 1, 52000), (4, 'Karan', 30, 3, 41000), (5, 'Meera', NULL, 3, 38000);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT e.name, d.dept_name FROM employees e INNER JOIN departments d ON e.dept_id = d.dept_id;',
      explain: 'The ON clause says which columns must match. Meera has no department (NULL), so the inner join drops her. Use table aliases (`e`, `d`) to keep queries short and avoid "ambiguous column" errors.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'List **every department** with its number of employees (`emp_count`), including departments with **0** employees. Show `dept_name`, `emp_count`.',
      example: { title: 'LEFT JOIN + COUNT(column)', code: 'SELECT c.name, COUNT(o.order_id) AS orders\nFROM customers c LEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name;' },
      setup: `CREATE TABLE departments (dept_id INTEGER PRIMARY KEY, dept_name TEXT);
CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT, dept_id INTEGER, manager_id INTEGER, salary INTEGER);
INSERT INTO departments VALUES (10, 'IT'), (20, 'HR'), (30, 'Sales'), (40, 'Legal');
INSERT INTO employees VALUES (1, 'Asha', 10, NULL, 90000), (2, 'Ravi', 10, 1, 65000), (3, 'Neha', 20, 1, 52000), (4, 'Karan', 30, 3, 41000), (5, 'Meera', NULL, 3, 38000);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT d.dept_name, COUNT(e.emp_id) AS emp_count FROM departments d LEFT JOIN employees e ON e.dept_id = d.dept_id GROUP BY d.dept_id, d.dept_name;',
      explain: 'Count a column from the **right** table (`COUNT(e.emp_id)`): for Legal it is NULL, so the count is 0. `COUNT(*)` would count the NULL-filled row and wrongly report 1 employee in Legal.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: '**Anti-join.** Show the `name` of customers who have **never placed an order**.',
      example: { title: 'LEFT JOIN … WHERE right.key IS NULL', code: 'SELECT s.name\nFROM students s LEFT JOIN fees f ON f.roll_no = s.roll_no\nWHERE f.roll_no IS NULL;' },
      setup: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Asha', 'Pune'), (2, 'Ravi', 'Delhi'), (3, 'Neha', 'Mumbai'), (4, 'Karan', 'Pune'), (5, 'Meera', 'Nagpur');
INSERT INTO orders VALUES (101, 2, 1200), (102, 4, 800), (103, 2, 450), (104, 9, 300);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.order_id IS NULL;',
      explain: 'After a LEFT JOIN, customers without orders have NULL in every order column; filtering `IS NULL` keeps exactly them. `NOT EXISTS` (Day 7) is an equivalent alternative. Order 104 points to a non-existent customer 9 – an orphan row that only a foreign key would have prevented.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: '**SELF JOIN.** Show each employee\'s `name` as `employee` and their manager\'s name as `manager`. Include the employee with **no manager** (manager shown as NULL).',
      example: { title: 'joining a table to itself', code: 'SELECT a.name, b.name AS mentor\nFROM students a LEFT JOIN students b ON a.mentor_id = b.roll_no;' },
      setup: `CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT, dept_id INTEGER, manager_id INTEGER, salary INTEGER);
INSERT INTO employees VALUES (1, 'Asha', 10, NULL, 90000), (2, 'Ravi', 10, 1, 65000), (3, 'Neha', 20, 1, 52000), (4, 'Karan', 30, 3, 41000), (5, 'Meera', NULL, 3, 38000);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.emp_id;',
      explain: 'The same table plays two roles, so it needs two aliases (`e` for the employee, `m` for the manager). A LEFT join keeps Asha, the top manager, whose `manager_id` is NULL; an inner join would drop her.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: '**Three-table report.** Show `customer` name, `product` name and `revenue` (= qty × price) for every order item, sorted by revenue **highest first**.',
      example: { title: 'chaining joins', code: 'SELECT s.name, c.title, e.grade\nFROM enrolments e\nJOIN students s ON s.id = e.student_id\nJOIN courses c ON c.id = e.course_id;' },
      setup: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER);
CREATE TABLE order_items (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, qty INTEGER);
INSERT INTO customers VALUES (1, 'Asha'), (2, 'Ravi'), (3, 'Neha');
INSERT INTO products VALUES (1, 'Pen', 10), (2, 'Bag', 799), (3, 'Lamp', 450);
INSERT INTO order_items VALUES (1, 1, 1, 20), (2, 2, 2, 1), (3, 3, 3, 2), (4, 1, 3, 1), (5, 2, 1, 5);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT c.name AS customer, p.name AS product, oi.qty * p.price AS revenue FROM order_items oi JOIN customers c ON c.id = oi.customer_id JOIN products p ON p.id = oi.product_id ORDER BY revenue DESC;',
      ordered: true,
      explain: 'Start from the fact table (order_items) and join each lookup table on its key. Each extra JOIN needs its own ON condition – forgetting one turns it into a cross join and multiplies the rows.',
    },
  ],
};
