const COLLEGE = `CREATE TABLE departments (dept_id INT PRIMARY KEY, dept_name VARCHAR(50), location VARCHAR(20));
CREATE TABLE students (student_id INT PRIMARY KEY, first_name VARCHAR(30), city VARCHAR(30), dept_id INT);
CREATE TABLE courses (course_id INT PRIMARY KEY, course_name VARCHAR(50), dept_id INT, fee INT);
CREATE TABLE enrollments (student_id INT, course_id INT, grade CHAR(1), PRIMARY KEY (student_id, course_id));
INSERT INTO departments VALUES (1, 'Computer Science', 'Block A'), (2, 'Mechanical', 'Block B'), (3, 'Commerce', 'Block C'), (4, 'Civil', 'Block D');
INSERT INTO students VALUES
 (1, 'Aarav', 'Pune', 1), (2, 'Diya', 'Mumbai', 1), (3, 'Kabir', 'Nagpur', 2),
 (4, 'Meera', 'Pune', 3), (5, 'Rohan', 'Pune', 2), (6, 'Sneha', 'Nashik', NULL);
INSERT INTO courses VALUES
 (101, 'DBMS', 1, 12000), (102, 'Python', 1, 10000), (201, 'Thermodynamics', 2, 9000),
 (301, 'Accounting', 3, 8000), (302, 'Business Law', 3, 7000);
INSERT INTO enrollments VALUES
 (1, 101, 'A'), (1, 102, 'B'), (2, 101, 'A'), (2, 102, 'A'), (3, 201, 'C'), (3, 102, 'B'),
 (4, 301, 'A'), (5, 201, 'B'), (5, 301, 'C');`;

export default {
  lesson: 'mysql-day-15',
  minutes: 32,
  intro: 'Combine related tables with INNER JOIN: ON conditions, aliases, three-table joins through a junction table and joins with GROUP BY.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Sneha has `dept_id = NULL` and the Civil department has no students. What does `students INNER JOIN departments ON s.dept_id = d.dept_id` return for them?',
      options: ['Sneha with NULL department and Civil with NULL student', 'Neither of them: INNER JOIN keeps only matching rows', 'Only Sneha', 'An error'],
      answer: 1,
      explain: '**INNER JOIN returns only rows that have a match on both sides.** Unmatched rows (Sneha, Civil) disappear. To keep them you need a LEFT/RIGHT JOIN (next lesson).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`SELECT dept_id, first_name, dept_name FROM students s JOIN departments d ON s.dept_id = d.dept_id;` fails with **Error 1052: Column \'dept_id\' in field list is ambiguous**. Fix?',
      options: ['Rename the tables', 'Write s.dept_id (or d.dept_id) to say which table the column comes from', 'Add DISTINCT', 'Use WHERE instead of ON'],
      answer: 1,
      explain: 'Both tables have a column `dept_id`, so MySQL does not know which one you mean. Qualify it with the table alias: `s.dept_id`. Good habit: qualify **every** column in a join query.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'List each student with their department: `first_name`, `dept_name`, `location`. (Students without a department are not needed.)',
      example: { title: 'INNER JOIN with aliases', code: 'SELECT o.order_id, c.name\nFROM orders o\nJOIN customers c ON c.customer_id = o.customer_id;' },
      setup: COLLEGE,
      starter: '-- students JOIN departments ON ...\n',
      solution: 'SELECT s.first_name, d.dept_name, d.location\nFROM students s\nINNER JOIN departments d ON s.dept_id = d.dept_id;',
      explain: 'The ON condition connects the **foreign key** (students.dept_id) with the **primary key** (departments.dept_id). `JOIN` alone means INNER JOIN. Aliases (s, d) keep the query short.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Show the courses taken by **students from Pune** with their grade: `first_name`, `course_name`, `grade`.',
      example: { title: 'three tables through a junction table', code: 'SELECT c.name, p.product_name, oi.qty\nFROM customers c\nJOIN orders o       ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p     ON p.product_id = oi.product_id;' },
      setup: COLLEGE,
      starter: '-- students -> enrollments -> courses\n',
      solution: "SELECT s.first_name, c.course_name, e.grade\nFROM students s\nJOIN enrollments e ON e.student_id = s.student_id\nJOIN courses c ON c.course_id = e.course_id\nWHERE s.city = 'Pune';",
      explain: 'Students and courses are linked **many-to-many** through `enrollments`, so you need two joins: students → enrollments → courses. The WHERE filter is applied after the joins. Skipping the junction table makes a wrong (or impossible) join.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Count how many students are enrolled in each course: `course_name`, `students`. Most popular first, ties by course name A→Z.',
      example: { title: 'join + GROUP BY', code: 'SELECT c.name, COUNT(*) AS orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name\nORDER BY orders DESC;' },
      setup: COLLEGE,
      starter: '-- courses JOIN enrollments, GROUP BY\n',
      solution: 'SELECT c.course_name, COUNT(*) AS students\nFROM courses c\nJOIN enrollments e ON e.course_id = c.course_id\nGROUP BY c.course_id, c.course_name\nORDER BY students DESC, c.course_name;',
      ordered: true,
      explain: 'Join first, then group the joined rows per course. Grouping by the key (`course_id`) as well as the name is safest when two courses could share a name. Courses with no enrollment do not appear with INNER JOIN (Business Law is missing).',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Find students who are enrolled in a course that belongs to a **different department** than their own. Show `first_name`, `course_name`.',
      example: { title: 'extra condition between joined tables', code: 'SELECT e.name, p.project_name\nFROM employees e\nJOIN assignments a ON a.emp_id = e.emp_id\nJOIN projects p    ON p.project_id = a.project_id\nWHERE p.city <> e.city;' },
      setup: COLLEGE,
      starter: '-- compare s.dept_id with c.dept_id\n',
      solution: 'SELECT s.first_name, c.course_name\nFROM students s\nJOIN enrollments e ON e.student_id = s.student_id\nJOIN courses c ON c.course_id = e.course_id\nWHERE c.dept_id <> s.dept_id;',
      explain: 'After joining the three tables, every row holds both the student\'s dept_id and the course\'s dept_id, so you can compare them. Kabir (Mechanical) takes Python and Rohan (Mechanical) takes Accounting.',
    },
  ],
};
