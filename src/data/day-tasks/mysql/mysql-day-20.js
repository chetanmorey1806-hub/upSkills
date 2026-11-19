const COLLEGE = `CREATE TABLE departments (dept_id INT PRIMARY KEY, dept_name VARCHAR(50));
CREATE TABLE students (student_id INT PRIMARY KEY, first_name VARCHAR(30), city VARCHAR(30), dept_id INT, marks INT, phone VARCHAR(10), fees INT);
CREATE TABLE courses (course_id INT PRIMARY KEY, course_name VARCHAR(50), fee INT);
CREATE TABLE enrollments (student_id INT, course_id INT);
INSERT INTO departments VALUES (1, 'Computer Science'), (2, 'Mechanical'), (3, 'Commerce');
INSERT INTO students VALUES
 (1, 'Aarav', 'Pune', 1, 88, '9876543210', 65000), (2, 'Diya', 'Mumbai', 1, 92, '9123456780', 65000),
 (3, 'Kabir', 'Nagpur', 2, 64, '9988776655', 55000), (4, 'Meera', 'Pune', 3, 85, '9090909090', 45000),
 (5, 'Rohan', 'Nashik', 2, 58, '9812345678', 55000), (6, 'Vikram', 'Delhi', 3, 79, '9555544444', 45000);
INSERT INTO courses VALUES (101, 'DBMS', 12000), (102, 'Python', 10000), (201, 'Thermodynamics', 9000), (301, 'Accounting', 8000);
INSERT INTO enrollments VALUES (1, 101), (2, 101), (2, 102), (3, 201), (4, 301), (5, 201), (6, 301);`;

export default {
  lesson: 'mysql-day-20',
  minutes: 30,
  intro: 'Save queries as views, query them like tables, use them to hide sensitive columns and manage them safely.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does a (normal) MySQL **view** store?',
      options: ['A copy of the result rows, refreshed every night', 'Only the SELECT definition; the data is read from the base tables every time', 'An index on the base table', 'A backup of the tables'],
      answer: 1,
      explain: 'A view is a **saved SELECT** (a virtual table). Every time you query it, MySQL runs the definition against the current base-table data, so it is always up to date. MySQL has no materialized views.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about views are TRUE? (choose all that apply)',
      options: [
        '`CREATE OR REPLACE VIEW` changes an existing view without dropping it first',
        'A view can hide sensitive columns such as phone or salary from some users',
        'A view with GROUP BY or DISTINCT is not updatable',
        '`WITH CHECK OPTION` blocks inserts/updates through the view that would make the row disappear from the view',
        'Dropping a view deletes the rows of the base table',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Views simplify complex joins and support security (grant SELECT on the view, not the table). Views with aggregates, DISTINCT, GROUP BY or UNION are read-only. `DROP VIEW` removes only the definition, never the base data.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Create a view `v_toppers` with `first_name`, `dept_name` and `marks` of students with **marks >= 85**. Then query the view.',
      example: { title: 'creating and using a view', code: "CREATE VIEW v_pune_customers AS\nSELECT name, phone FROM customers WHERE city = 'Pune';\n\nSELECT * FROM v_pune_customers;" },
      setup: COLLEGE,
      starter: '-- CREATE VIEW v_toppers AS SELECT ...\n',
      solution: 'CREATE VIEW v_toppers AS\nSELECT s.first_name, d.dept_name, s.marks\nFROM students s\nJOIN departments d ON d.dept_id = s.dept_id\nWHERE s.marks >= 85;\n\nSELECT * FROM v_toppers;',
      check: 'SELECT first_name, dept_name, marks FROM v_toppers ORDER BY first_name;',
      explain: '`CREATE VIEW name AS SELECT ...` saves the query; afterwards `SELECT * FROM v_toppers` works like a table. The join and filter are written once and reused everywhere.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Create a view `v_course_stats` with `course_name`, `students` (number enrolled) and `fee_earned` (= fee × number of students) for each course.',
      example: { title: 'a summary view', code: 'CREATE VIEW v_city_sales AS\nSELECT city, COUNT(*) AS orders, SUM(amount) AS revenue\nFROM orders\nGROUP BY city;' },
      setup: COLLEGE,
      starter: '-- CREATE VIEW v_course_stats AS ...\n',
      solution: 'CREATE VIEW v_course_stats AS\nSELECT c.course_name,\n       COUNT(e.student_id) AS students,\n       c.fee * COUNT(e.student_id) AS fee_earned\nFROM courses c\nLEFT JOIN enrollments e ON e.course_id = c.course_id\nGROUP BY c.course_id, c.course_name, c.fee;',
      check: 'SELECT course_name, students, fee_earned FROM v_course_stats ORDER BY course_name;',
      explain: 'Name the calculated columns with aliases: they become the view\'s column names. Because of GROUP BY this view is **read-only** (not updatable), which is fine for reports.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'The office staff must not see phone numbers or fees. Create a view `v_student_public` with only `student_id`, `first_name`, `city` of all students.',
      example: { title: 'hiding columns', code: 'CREATE VIEW v_staff_directory AS\nSELECT emp_id, name, department\nFROM employees;   -- salary and bank details are not exposed' },
      setup: COLLEGE,
      starter: '-- CREATE VIEW v_student_public AS ...\n',
      solution: 'CREATE VIEW v_student_public AS\nSELECT student_id, first_name, city\nFROM students;',
      check: 'SELECT * FROM v_student_public ORDER BY student_id;',
      explain: 'A view that lists only safe columns is a simple **security layer**: give the staff user `GRANT SELECT ON college.v_student_public` instead of access to the students table.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: 'The view `v_old_report` is no longer needed. Remove it **safely** (no error if it does not exist) — the students table must stay untouched.',
      example: { title: 'removing a view', code: 'DROP VIEW IF EXISTS v_city_sales;' },
      setup: COLLEGE + '\nCREATE VIEW v_old_report AS SELECT first_name, marks FROM students;',
      starter: '-- drop the view\n',
      solution: 'DROP VIEW IF EXISTS v_old_report;',
      check: 'SHOW FULL TABLES;',
      explain: '`DROP VIEW IF EXISTS` removes only the view definition; the base table keeps all its rows. `IF EXISTS` avoids Error 1051 when the view was already removed. Use `SHOW FULL TABLES WHERE Table_type = \'VIEW\'` to list views.',
    },
  ],
};
