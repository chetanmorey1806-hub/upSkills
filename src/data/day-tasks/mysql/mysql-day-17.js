const STAFF = `CREATE TABLE employees (emp_id INT PRIMARY KEY, name VARCHAR(40), salary INT, manager_id INT);
INSERT INTO employees VALUES
 (1, 'Anita (Director)', 150000, NULL),
 (2, 'Bharat', 90000, 1), (3, 'Chitra', 95000, 1),
 (4, 'Deepak', 60000, 2), (5, 'Esha', 92000, 2),
 (6, 'Farhan', 58000, 3), (7, 'Gauri', 61000, 3), (8, 'Harsh', 99000, 3);`;

const SHOP = `CREATE TABLE categories (category_id INT PRIMARY KEY, category_name VARCHAR(30));
CREATE TABLE products (product_id INT PRIMARY KEY, product_name VARCHAR(40), category_id INT, price INT);
CREATE TABLE orders (order_id INT PRIMARY KEY, customer VARCHAR(30), status VARCHAR(15));
CREATE TABLE order_items (order_id INT, product_id INT, qty INT);
CREATE TABLE sizes (size VARCHAR(3));
CREATE TABLE colours (colour VARCHAR(10));
CREATE TABLE grade_bands (band CHAR(1), min_amt INT, max_amt INT);
INSERT INTO categories VALUES (1, 'Electronics'), (2, 'Stationery'), (3, 'Clothing');
INSERT INTO products VALUES (1, 'Earphones', 1, 999), (2, 'Power Bank', 1, 1499), (3, 'Notebook', 2, 60), (4, 'Pen Pack', 2, 120), (5, 'T-Shirt', 3, 499);
INSERT INTO orders VALUES (1, 'Asha', 'DELIVERED'), (2, 'Ravi', 'DELIVERED'), (3, 'Asha', 'CANCELLED'), (4, 'Neel', 'DELIVERED');
INSERT INTO order_items VALUES (1, 1, 1), (1, 3, 5), (2, 2, 1), (2, 5, 2), (3, 1, 2), (4, 4, 3), (4, 3, 2);
INSERT INTO sizes VALUES ('S'), ('M'), ('L');
INSERT INTO colours VALUES ('Black'), ('White');
INSERT INTO grade_bands VALUES ('C', 0, 499), ('B', 500, 999), ('A', 1000, 99999);`;

export default {
  lesson: 'mysql-day-17',
  minutes: 32,
  intro: 'Join a table to itself (employee → manager), create combinations with CROSS JOIN, match ranges with non-equi joins and chain 3-4 tables.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: '`sizes` has 3 rows and `colours` has 2 rows. How many rows does `SELECT * FROM sizes CROSS JOIN colours;` return?',
      options: ['2', '3', '5', '6'],
      answer: 3,
      explain: 'A **CROSS JOIN** returns the Cartesian product: every row of the first table combined with every row of the second → 3 × 2 = **6**. Forgetting the ON condition in a normal join produces the same explosion by accident.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Show every employee with their manager\'s name: `employee`, `manager`. The Director (no manager) must also appear with NULL manager.',
      example: { title: 'SELF JOIN with two aliases', code: 'SELECT c.name AS category, p.name AS parent\nFROM categories c\nLEFT JOIN categories p ON p.id = c.parent_id;' },
      setup: STAFF,
      starter: '-- employees e LEFT JOIN employees m ON ...\n',
      solution: 'SELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON m.emp_id = e.manager_id;',
      explain: 'A SELF JOIN uses the same table twice with **different aliases**: `e` plays the employee and `m` the manager. Match the employee\'s `manager_id` with the manager\'s `emp_id`. LEFT JOIN keeps the Director whose manager_id is NULL.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Find employees who **earn more than their own manager**: show `employee`, `emp_salary`, `manager`, `mgr_salary`.',
      example: { title: 'comparing two rows of the same table', code: 'SELECT a.name, b.name\nFROM students a\nJOIN students b ON a.mentor_id = b.student_id\nWHERE a.marks > b.marks;' },
      setup: STAFF,
      starter: '-- self join + WHERE e.salary > m.salary\n',
      solution: 'SELECT e.name AS employee, e.salary AS emp_salary,\n       m.name AS manager, m.salary AS mgr_salary\nFROM employees e\nJOIN employees m ON m.emp_id = e.manager_id\nWHERE e.salary > m.salary;',
      explain: 'After the self join each row has both salaries side by side, so a simple WHERE compares them. Esha (92000) earns more than Bharat (90000) and Harsh (99000) more than Chitra (95000).',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Generate a T-shirt **variant list**: every combination of `size` and `colour`. Sort by colour, then size.',
      example: { title: 'CROSS JOIN', code: 'SELECT d.day_name, s.slot\nFROM days d\nCROSS JOIN slots s;' },
      setup: SHOP,
      starter: '-- sizes CROSS JOIN colours\n',
      solution: 'SELECT s.size, c.colour\nFROM sizes s\nCROSS JOIN colours c\nORDER BY c.colour, s.size;',
      ordered: true,
      explain: 'CROSS JOIN has no ON condition: 3 sizes × 2 colours = 6 variants. Useful for templates (every student × every subject, every day × every time slot). Sizes sort alphabetically as L, M, S here.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Revenue per category for **DELIVERED** orders only: show `category_name`, `revenue` (= SUM of qty × price). Highest revenue first.',
      example: { title: 'four-table join', code: 'SELECT d.dept_name, SUM(c.fee) AS fees\nFROM departments d\nJOIN courses c      ON c.dept_id = d.dept_id\nJOIN enrollments e  ON e.course_id = c.course_id\nJOIN students s     ON s.student_id = e.student_id\nGROUP BY d.dept_name;' },
      setup: SHOP,
      starter: '-- categories -> products -> order_items -> orders\n',
      solution: "SELECT c.category_name, SUM(oi.qty * p.price) AS revenue\nFROM categories c\nJOIN products p     ON p.category_id = c.category_id\nJOIN order_items oi ON oi.product_id = p.product_id\nJOIN orders o       ON o.order_id = oi.order_id\nWHERE o.status = 'DELIVERED'\nGROUP BY c.category_id, c.category_name\nORDER BY revenue DESC;",
      ordered: true,
      explain: 'Follow the foreign keys step by step: category → product → order line → order. Each ON uses the key of the table just added. The WHERE on orders.status removes the cancelled order before grouping.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Each product gets a price band from `grade_bands` (min_amt to max_amt). Show `product_name`, `price`, `band` using a **non-equi join**.',
      example: { title: 'join on a range', code: 'SELECT s.name, g.grade\nFROM students s\nJOIN grade_scale g ON s.marks BETWEEN g.low AND g.high;' },
      setup: SHOP,
      starter: '-- JOIN grade_bands ON price BETWEEN ...\n',
      solution: 'SELECT p.product_name, p.price, g.band\nFROM products p\nJOIN grade_bands g ON p.price BETWEEN g.min_amt AND g.max_amt;',
      explain: 'A **non-equi join** uses a condition other than `=`, here BETWEEN. Each product falls into exactly one band because the ranges do not overlap. Overlapping ranges would duplicate rows.',
    },
  ],
};
