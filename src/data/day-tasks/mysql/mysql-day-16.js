const COLLEGE = `CREATE TABLE departments (dept_id INT PRIMARY KEY, dept_name VARCHAR(50), location VARCHAR(20));
CREATE TABLE faculty (faculty_id INT PRIMARY KEY, name VARCHAR(40), dept_id INT, salary INT);
CREATE TABLE courses (course_id INT PRIMARY KEY, course_name VARCHAR(50), fee INT);
CREATE TABLE enrollments (student_id INT, course_id INT, grade CHAR(1));
INSERT INTO departments VALUES (1, 'Computer Science', 'Block A'), (2, 'Mechanical', 'Block B'), (3, 'Commerce', 'Block C'), (4, 'Civil', 'Block D');
INSERT INTO faculty VALUES
 (1, 'Dr. Mehta', 1, 95000), (2, 'Dr. Rao', 1, 82000), (3, 'Prof. Joshi', 2, 70000),
 (4, 'Ms. Kapoor', NULL, 45000), (5, 'Dr. Nair', 3, 88000);
INSERT INTO courses VALUES (101, 'DBMS', 12000), (102, 'Python', 10000), (201, 'Thermodynamics', 9000), (301, 'Accounting', 8000), (401, 'Surveying', 7500);
INSERT INTO enrollments VALUES (1, 101, 'A'), (2, 101, 'B'), (3, 102, 'A'), (4, 301, 'C'), (5, 101, NULL);`;

export default {
  lesson: 'mysql-day-16',
  minutes: 32,
  intro: 'Keep unmatched rows with LEFT and RIGHT JOIN, find missing rows with the anti-join pattern and emulate FULL OUTER JOIN with UNION.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: '`faculty f LEFT JOIN departments d ON f.dept_id = d.dept_id` — what happens to Ms. Kapoor, who has **no department**?',
      options: ['She is removed', 'She is kept and the department columns are NULL', 'She is matched with every department', 'MySQL raises an error'],
      answer: 1,
      explain: 'A **LEFT JOIN keeps every row of the left table**. When there is no match, the columns of the right table are filled with NULL. INNER JOIN would drop her.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'MySQL has no `FULL OUTER JOIN` keyword. How do you get all faculty **and** all departments, matched where possible?',
      options: [
        'faculty CROSS JOIN departments',
        'A LEFT JOIN … UNION … RIGHT JOIN (same columns)',
        'faculty INNER JOIN departments twice',
        'It is impossible in MySQL',
      ],
      answer: 1,
      explain: 'Emulate FULL OUTER JOIN with `SELECT … FROM a LEFT JOIN b ON … UNION SELECT … FROM a RIGHT JOIN b ON …`. **UNION** (not UNION ALL) removes the matched rows that appear in both halves.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'List **every** faculty member with their department: `name`, `dept_name`. Faculty without a department must also appear (dept_name NULL).',
      example: { title: 'LEFT JOIN', code: 'SELECT c.name, o.order_id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id;' },
      setup: COLLEGE,
      starter: '-- faculty LEFT JOIN departments\n',
      solution: 'SELECT f.name, d.dept_name\nFROM faculty f\nLEFT JOIN departments d ON f.dept_id = d.dept_id;',
      explain: 'The table you want to keep completely goes on the **left**. Ms. Kapoor shows `NULL` for dept_name. The same result with RIGHT JOIN: `departments d RIGHT JOIN faculty f ON …`.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Show the departments that have **no faculty members** (`dept_name` only).',
      example: { title: 'anti-join: rows with no match', code: 'SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL;' },
      setup: COLLEGE,
      starter: '-- LEFT JOIN ... WHERE ... IS NULL\n',
      solution: 'SELECT d.dept_name\nFROM departments d\nLEFT JOIN faculty f ON f.dept_id = d.dept_id\nWHERE f.faculty_id IS NULL;',
      explain: 'LEFT JOIN keeps all departments; departments without faculty get NULL in every faculty column. Testing the right table\'s **primary key** for NULL keeps only those unmatched rows (Civil). Testing a nullable column could give wrong results.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'For **every course** show `course_name` and `students` = number of enrollments, with **0** for courses nobody took.',
      example: { title: 'counting with a LEFT JOIN', code: 'SELECT c.name, COUNT(o.order_id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name;' },
      setup: COLLEGE,
      starter: '-- courses LEFT JOIN enrollments, COUNT(...)\n',
      solution: 'SELECT c.course_name, COUNT(e.student_id) AS students\nFROM courses c\nLEFT JOIN enrollments e ON e.course_id = c.course_id\nGROUP BY c.course_id, c.course_name;',
      explain: 'Use `COUNT(e.student_id)`, **not** `COUNT(*)`: an unmatched course still produces one row (with NULLs), so COUNT(*) would wrongly say 1. COUNT(column) ignores the NULL and gives 0.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'For **every course** show `course_name` and the `student_id` of students who got grade **A** in it. Courses without any A-grade student must still appear (once) with NULL student_id.',
      example: { title: 'filter the right table in ON, not WHERE', code: "SELECT c.name, o.order_id\nFROM customers c\nLEFT JOIN orders o\n  ON o.customer_id = c.customer_id AND o.status = 'PAID';" },
      setup: COLLEGE,
      starter: "-- put the grade = 'A' condition in the right place\n",
      solution: "SELECT c.course_name, e.student_id\nFROM courses c\nLEFT JOIN enrollments e\n  ON e.course_id = c.course_id AND e.grade = 'A';",
      explain: "This is the classic **ON vs WHERE** trap. With `AND e.grade = 'A'` in ON, unmatched courses are still kept (NULL). Writing `WHERE e.grade = 'A'` would remove every course without an A, turning the LEFT JOIN into an INNER JOIN.",
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Write a **FULL OUTER JOIN** of faculty and departments in MySQL: show `name`, `dept_name` for all faculty (even without department) **and** all departments (even without faculty).',
      example: { title: 'FULL OUTER JOIN emulation', code: 'SELECT a.x, b.y FROM a LEFT JOIN b ON a.id = b.id\nUNION\nSELECT a.x, b.y FROM a RIGHT JOIN b ON a.id = b.id;' },
      setup: COLLEGE,
      starter: '-- LEFT JOIN ... UNION ... RIGHT JOIN ...\n',
      solution: 'SELECT f.name, d.dept_name\nFROM faculty f LEFT JOIN departments d ON f.dept_id = d.dept_id\nUNION\nSELECT f.name, d.dept_name\nFROM faculty f RIGHT JOIN departments d ON f.dept_id = d.dept_id;',
      explain: 'The LEFT half brings all faculty (Ms. Kapoor with NULL), the RIGHT half brings all departments (Civil with NULL name). UNION removes the duplicates of the matched rows. Both SELECTs must return the same number of columns in the same order.',
    },
  ],
};
