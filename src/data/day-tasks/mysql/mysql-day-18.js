const COLLEGE = `CREATE TABLE departments (dept_id INT PRIMARY KEY, dept_name VARCHAR(50));
CREATE TABLE faculty (faculty_id INT PRIMARY KEY, name VARCHAR(40), dept_id INT, salary INT);
CREATE TABLE students (student_id INT PRIMARY KEY, first_name VARCHAR(30), dept_id INT, marks INT);
CREATE TABLE courses (course_id INT PRIMARY KEY, course_name VARCHAR(50));
CREATE TABLE enrollments (student_id INT, course_id INT, grade CHAR(1));
INSERT INTO departments VALUES (1, 'Computer Science'), (2, 'Mechanical'), (3, 'Commerce');
INSERT INTO faculty VALUES
 (1, 'Dr. Mehta', 1, 95000), (2, 'Dr. Rao', 1, 82000), (3, 'Prof. Joshi', 2, 70000),
 (4, 'Ms. Kapoor', 2, 76000), (5, 'Dr. Nair', 3, 95000), (6, 'Mr. Shah', 3, 60000);
INSERT INTO students VALUES
 (1, 'Aarav', 1, 88), (2, 'Diya', 1, 92), (3, 'Kabir', 2, 64), (4, 'Meera', 3, 75),
 (5, 'Rohan', 2, 58), (6, 'Sneha', 1, 71), (7, 'Vikram', 3, 81);
INSERT INTO courses VALUES (101, 'DBMS'), (102, 'Python'), (201, 'Thermodynamics'), (301, 'Accounting');
INSERT INTO enrollments VALUES (1, 101, 'A'), (2, 101, 'A'), (3, 201, 'C'), (4, 301, 'B'), (5, 201, 'D'), (6, 102, 'B'), (7, 301, 'A');`;

export default {
  lesson: 'mysql-day-18',
  minutes: 34,
  intro: 'Answer questions in steps with subqueries: scalar, multi-row (IN), correlated and derived tables.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: '`SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);` returns **no rows at all**, even though some customers never ordered. The orders table has a row with `customer_id = NULL`. Why?',
      options: [
        'NOT IN cannot be used with subqueries',
        'x NOT IN (..., NULL) is never TRUE, so every row is filtered out; use NOT EXISTS or exclude NULLs',
        'The subquery needs an alias',
        'customers must be sorted first',
      ],
      answer: 1,
      explain: '`x NOT IN (1, 2, NULL)` means `x <> 1 AND x <> 2 AND x <> NULL`; the last part is UNKNOWN, so the whole condition is never TRUE. Fix: `WHERE customer_id IS NOT NULL` inside the subquery, or use `NOT EXISTS` (NULL-safe).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which statement about a **derived table** (subquery in FROM) is correct in MySQL?',
      options: ['It must have an alias, e.g. FROM (SELECT ...) AS t', 'It cannot use GROUP BY', 'It is stored permanently', 'It must return exactly one row'],
      answer: 0,
      explain: 'MySQL requires every derived table to have an alias, otherwise you get **Error 1248: Every derived table must have its own alias**. A derived table exists only while the query runs and can return many rows and columns.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Find the faculty member(s) with the **highest salary**: `name`, `salary`. (There may be a tie — return all of them.)',
      example: { title: 'scalar subquery', code: 'SELECT product_name, price\nFROM products\nWHERE price = (SELECT MAX(price) FROM products);' },
      setup: COLLEGE,
      starter: '-- WHERE salary = (SELECT ...)\n',
      solution: 'SELECT name, salary\nFROM faculty\nWHERE salary = (SELECT MAX(salary) FROM faculty);',
      explain: 'The inner query returns one value (95000); the outer query keeps every row equal to it, so both Dr. Mehta and Dr. Nair appear. `ORDER BY salary DESC LIMIT 1` would wrongly return only one of them.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Find the **second highest** faculty salary (one value, column `second_highest`).',
      example: { title: 'MAX below the MAX', code: 'SELECT MAX(marks) AS runner_up\nFROM students\nWHERE marks < (SELECT MAX(marks) FROM students);' },
      setup: COLLEGE,
      starter: '-- MAX(...) WHERE salary < (SELECT MAX(...))\n',
      solution: 'SELECT MAX(salary) AS second_highest\nFROM faculty\nWHERE salary < (SELECT MAX(salary) FROM faculty);',
      explain: 'Remove the top value with the subquery, then take the MAX of what is left → 82000. This handles ties correctly (95000 appears twice). `ORDER BY salary DESC LIMIT 1 OFFSET 1` would return 95000 again because of the tie.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'List the `course_name` of courses that have **at least one student with grade C or D** (use IN with a subquery).',
      example: { title: 'multi-row subquery with IN', code: "SELECT name FROM customers\nWHERE customer_id IN (SELECT customer_id FROM orders WHERE status = 'RETURNED');" },
      setup: COLLEGE,
      starter: '-- WHERE course_id IN (SELECT ...)\n',
      solution: "SELECT course_name\nFROM courses\nWHERE course_id IN (SELECT course_id FROM enrollments WHERE grade IN ('C', 'D'));",
      explain: 'The subquery returns a **list** of course ids (201, 201), so use `IN`, not `=` (Error 1242: Subquery returns more than 1 row). Duplicates in the list do not matter for IN.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Show faculty who earn **more than the average salary of their own department**: `name`, `dept_id`, `salary`.',
      example: { title: 'correlated subquery', code: 'SELECT p.product_name, p.price\nFROM products p\nWHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p.category_id);' },
      setup: COLLEGE,
      starter: '-- inner query uses the outer row\'s dept_id\n',
      solution: 'SELECT f.name, f.dept_id, f.salary\nFROM faculty f\nWHERE f.salary > (SELECT AVG(f2.salary) FROM faculty f2 WHERE f2.dept_id = f.dept_id);',
      explain: 'A **correlated** subquery refers to the outer row (`f.dept_id`), so it is re-evaluated for each faculty member with that department\'s average. Use different aliases (f, f2) for the two copies of the table.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Using a **derived table**, find the department(s) with the **highest number of students**: show `dept_name`, `total`.',
      example: { title: 'subquery in FROM', code: 'SELECT t.city, t.n\nFROM (SELECT city, COUNT(*) AS n FROM customers GROUP BY city) AS t\nWHERE t.n >= 3;' },
      setup: COLLEGE,
      starter: '-- FROM (SELECT dept_id, COUNT(*) ... GROUP BY dept_id) AS t\n',
      solution: 'SELECT d.dept_name, t.total\nFROM (SELECT dept_id, COUNT(*) AS total FROM students GROUP BY dept_id) AS t\nJOIN departments d ON d.dept_id = t.dept_id\nWHERE t.total = (SELECT MAX(total) FROM (SELECT COUNT(*) AS total FROM students GROUP BY dept_id) AS x);',
      explain: 'The derived table `t` turns the counts per department into a temporary table you can join and filter. Comparing with the MAX of the counts keeps ties; `ORDER BY total DESC LIMIT 1` also works when there is a single winner (Computer Science, 3 students).',
    },
  ],
};
