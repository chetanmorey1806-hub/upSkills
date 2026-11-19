const DATA = `CREATE TABLE departments (dept_id INT PRIMARY KEY, dept_name VARCHAR(50), location VARCHAR(30));
CREATE TABLE students (student_id INT PRIMARY KEY, first_name VARCHAR(30), city VARCHAR(30), dept_id INT);
CREATE TABLE courses (course_id INT PRIMARY KEY, course_name VARCHAR(50));
CREATE TABLE enrollments (student_id INT, course_id INT);
CREATE TABLE customers (customer_id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE payments (payment_id INT PRIMARY KEY, customer_id INT, amount INT);
INSERT INTO departments VALUES (1, 'Computer Science', 'Pune'), (2, 'Mechanical', 'Nashik'), (3, 'Commerce', 'Mumbai');
INSERT INTO students VALUES (1, 'Aarav', 'Pune', 1), (2, 'Diya', 'Mumbai', 1), (3, 'Kabir', 'Nagpur', 2), (4, 'Meera', 'Pune', 3), (5, 'Rohan', 'Goa', 2);
INSERT INTO courses VALUES (101, 'DBMS'), (102, 'Python'), (201, 'Thermodynamics'), (301, 'Accounting');
INSERT INTO enrollments VALUES (1, 101), (2, 101), (3, 201), (4, 301);
INSERT INTO customers VALUES (1, 'Asha'), (2, 'Ravi'), (3, 'Neel'), (4, 'Tara');
INSERT INTO payments VALUES (1, 1, 2500), (2, 1, 1200), (3, 3, 8000), (4, NULL, 500);`;

export default {
  lesson: 'mysql-day-19',
  minutes: 30,
  intro: 'Stack results with UNION / UNION ALL, test for related rows with EXISTS / NOT EXISTS and compare against lists with ANY / ALL.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between **UNION** and **UNION ALL**?',
      options: [
        'UNION keeps duplicates, UNION ALL removes them',
        'UNION removes duplicate rows (extra sort/dedupe work); UNION ALL keeps all rows and is faster',
        'UNION ALL works only on numbers',
        'There is no difference',
      ],
      answer: 1,
      explain: '**UNION** = combine + remove duplicates (needs extra work). **UNION ALL** = just append, so it is faster; use it whenever duplicates are impossible or wanted. Both require the same number of columns with compatible types; column names come from the first SELECT.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`WHERE salary > ALL (SELECT salary FROM faculty WHERE dept_id = 1)` is equivalent to:',
      options: [
        'salary > (SELECT MIN(salary) FROM faculty WHERE dept_id = 1)',
        'salary > (SELECT MAX(salary) FROM faculty WHERE dept_id = 1)',
        'salary > (SELECT AVG(salary) FROM faculty WHERE dept_id = 1)',
        'salary IN (SELECT salary FROM faculty WHERE dept_id = 1)',
      ],
      answer: 1,
      explain: '`> ALL (list)` = greater than **every** value = greater than the **MAX**. `> ANY (list)` (same as SOME) = greater than at least one = greater than the **MIN**. And `= ANY` is the same as `IN`. Watch out: `> ALL` on an empty list is TRUE.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Make one list of **all cities** found in `students.city` **and** `departments.location`, **without duplicates**, sorted A→Z. Name the column `city`.',
      example: { title: 'UNION with ORDER BY', code: 'SELECT email AS contact FROM customers\nUNION\nSELECT email FROM suppliers\nORDER BY contact;' },
      setup: DATA,
      starter: '-- SELECT ... UNION SELECT ... ORDER BY ...\n',
      solution: 'SELECT city FROM students\nUNION\nSELECT location FROM departments\nORDER BY city;',
      ordered: true,
      explain: 'UNION removes the repeated Pune and Mumbai. The column heading comes from the **first** SELECT, and ORDER BY at the very end sorts the combined result (not only the second SELECT).',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Show the `course_name` of courses that have **at least one enrollment**, using **EXISTS**.',
      example: { title: 'EXISTS (semi-join)', code: 'SELECT c.name\nFROM customers c\nWHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);' },
      setup: DATA,
      starter: '-- WHERE EXISTS (SELECT 1 FROM enrollments e WHERE ...)\n',
      solution: 'SELECT c.course_name\nFROM courses c\nWHERE EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.course_id);',
      explain: 'EXISTS returns TRUE as soon as the correlated subquery finds **one** row, so what you SELECT inside does not matter (`SELECT 1` is the convention). Unlike a JOIN, it never duplicates the course when there are many enrollments.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'List customers (`name`) who have **never made a payment**, using **NOT EXISTS**. (Note: payments contains a row with NULL customer_id.)',
      example: { title: 'NOT EXISTS (anti-join)', code: 'SELECT p.product_name\nFROM products p\nWHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.product_id);' },
      setup: DATA,
      starter: '-- WHERE NOT EXISTS (...)\n',
      solution: 'SELECT c.name\nFROM customers c\nWHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.customer_id = c.customer_id);',
      explain: 'NOT EXISTS is **NULL-safe**: the payment with NULL customer_id simply never matches. `NOT IN (SELECT customer_id FROM payments)` would return **nothing** because of that NULL. Ravi and Tara never paid.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Build a report with the number of students per department (`dept_name`, `total`) **plus** a final row `TOTAL` with the overall count, using **UNION ALL**.',
      example: { title: 'adding a grand total row', code: "SELECT city, COUNT(*) AS n FROM customers GROUP BY city\nUNION ALL\nSELECT 'ALL CITIES', COUNT(*) FROM customers;" },
      setup: DATA,
      starter: "-- per department ... UNION ALL SELECT 'TOTAL', ...\n",
      solution: "SELECT d.dept_name, COUNT(*) AS total\nFROM students s JOIN departments d ON d.dept_id = s.dept_id\nGROUP BY d.dept_name\nUNION ALL\nSELECT 'TOTAL', COUNT(*) FROM students;",
      explain: 'The second SELECT returns one extra row with a text label and the overall count. UNION ALL is right here: no duplicates need removing. Both parts have 2 columns (text, number). This is a portable alternative to `WITH ROLLUP`.',
    },
  ],
};
