const FLAT = `CREATE TABLE admissions_flat (
  student_id INT, student_name VARCHAR(30), dept_name VARCHAR(40), dept_head VARCHAR(30), course VARCHAR(30)
);
INSERT INTO admissions_flat VALUES
 (1, 'Aarav', 'Computer Science', 'Dr. Mehta', 'DBMS'),
 (1, 'Aarav', 'Computer Science', 'Dr. Mehta', 'Python'),
 (2, 'Diya',  'Computer Science', 'Dr. Metha', 'DBMS'),
 (3, 'Kabir', 'Mechanical',       'Prof. Joshi', 'Thermodynamics'),
 (4, 'Meera', 'Commerce',         'Dr. Nair', 'Accounting'),
 (5, 'Rohan', 'Commerce',         'Dr. Nayar', 'Accounting');`;

const NORMAL = `CREATE TABLE departments_n (dept_id INT PRIMARY KEY, dept_name VARCHAR(40), dept_head VARCHAR(30));
CREATE TABLE students_n (student_id INT PRIMARY KEY, student_name VARCHAR(30), dept_id INT);
CREATE TABLE courses_n (course_id INT PRIMARY KEY, course_name VARCHAR(30));
CREATE TABLE enrollments_n (student_id INT, course_id INT, PRIMARY KEY (student_id, course_id));
INSERT INTO departments_n VALUES (1, 'Computer Science', 'Dr. Mehta'), (2, 'Mechanical', 'Prof. Joshi'), (3, 'Commerce', 'Dr. Nair');
INSERT INTO students_n VALUES (1, 'Aarav', 1), (2, 'Diya', 1), (3, 'Kabir', 2), (4, 'Meera', 3);
INSERT INTO courses_n VALUES (10, 'DBMS'), (11, 'Python'), (20, 'Thermodynamics'), (30, 'Accounting');
INSERT INTO enrollments_n VALUES (1, 10), (1, 11), (2, 10), (3, 20), (4, 30);`;

export default {
  lesson: 'mysql-day-26',
  minutes: 34,
  intro: 'Recognise anomalies and dependencies, normalise tables to 1NF, 2NF, 3NF and BCNF, and rebuild the flat picture with joins.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'In one flat table every row repeats the department head. The head of Computer Science changes and the clerk updates only some rows, so now CS has two different heads. Which anomaly is this?',
      options: ['Insert anomaly', 'Update anomaly', 'Delete anomaly', 'No anomaly'],
      answer: 1,
      explain: 'Redundant copies of the same fact get out of sync → **update anomaly**. An **insert anomaly** is when you cannot add a fact (a new department) without unrelated data (a student). A **delete anomaly** is when deleting a row loses another fact (the last student removes the department).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Table `enrollment(student_id, course_id, student_name, grade)` has the key (student_id, course_id). `student_name` depends only on `student_id`. Which normal form is violated?',
      options: ['1NF', '2NF (partial dependency on part of the composite key)', '3NF (transitive dependency)', 'None'],
      answer: 1,
      explain: '**2NF** forbids non-key columns depending on **part** of a composite key. Move student_name to a students table. **3NF** forbids transitive dependencies (non-key → non-key, e.g. dept_id → dept_name). **1NF** requires atomic values and no repeating groups.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which designs are in **1NF**? (choose all that apply)',
      options: [
        "employee(emp_id, name, skills) with skills = 'Java, SQL, Python'",
        'employee(emp_id, name) + employee_skill(emp_id, skill) with one skill per row',
        'student(student_id, phone1, phone2, phone3)',
        'student(student_id, name) + student_phone(student_id, phone)',
      ],
      answers: [1, 3],
      explain: 'A comma-separated list in one cell is **not atomic**, and phone1/phone2/phone3 is a **repeating group**; both break 1NF. The fix is a child table with one value per row, linked by the parent key.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: '**Detect the update anomaly** in `admissions_flat`: list each `dept_name` that has **more than one** distinct `dept_head` value, with `heads` = the number of different heads.',
      example: { title: 'finding inconsistent copies', code: 'SELECT customer_id, COUNT(DISTINCT customer_city) AS cities\nFROM orders_flat\nGROUP BY customer_id\nHAVING COUNT(DISTINCT customer_city) > 1;' },
      setup: FLAT,
      starter: '-- GROUP BY dept_name HAVING COUNT(DISTINCT dept_head) > 1\n',
      solution: 'SELECT dept_name, COUNT(DISTINCT dept_head) AS heads\nFROM admissions_flat\nGROUP BY dept_name\nHAVING COUNT(DISTINCT dept_head) > 1;',
      explain: 'A fact (head of a department) should have exactly one value. Two spellings for the CS head (Mehta / Metha) and two heads for Commerce prove that redundant copies have drifted. After normalisation the head is stored once in departments, so this cannot happen.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Bring `employee(emp_id, name, skills)` to **1NF**: create a table `employee_skill` with `emp_id INT`, `skill VARCHAR(30)` and **primary key (emp_id, skill)**, then insert one row per skill for Ravi (emp_id 1): Java, SQL, Python.',
      example: { title: 'one value per row', code: "CREATE TABLE student_phone (\n  student_id INT,\n  phone VARCHAR(15),\n  PRIMARY KEY (student_id, phone)\n);\nINSERT INTO student_phone VALUES (1, '9876543210'), (1, '9123456780');" },
      setup: "CREATE TABLE employee (emp_id INT PRIMARY KEY, name VARCHAR(30), skills VARCHAR(100));\nINSERT INTO employee VALUES (1, 'Ravi', 'Java, SQL, Python');",
      starter: '-- CREATE TABLE employee_skill ...; INSERT ...\n',
      solution: "CREATE TABLE employee_skill (\n  emp_id INT,\n  skill  VARCHAR(30),\n  PRIMARY KEY (emp_id, skill)\n);\nINSERT INTO employee_skill VALUES (1, 'Java'), (1, 'SQL'), (1, 'Python');",
      check: "INSERT IGNORE INTO employee_skill VALUES (1, 'SQL');\nSELECT emp_id, skill FROM employee_skill ORDER BY skill;",
      explain: 'Each skill is now its own row, so you can search (`WHERE skill = \'SQL\'`), count and index skills. The composite primary key stops the same skill being stored twice for one employee (the checker tries).',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'The data is now normalised (`students_n`, `departments_n`, `courses_n`, `enrollments_n`). Prove the decomposition is **lossless**: rebuild the flat report `student_name`, `dept_name`, `dept_head`, `course_name` with joins.',
      example: { title: 'rebuilding with joins', code: 'SELECT o.order_id, c.name, p.product_name\nFROM orders o\nJOIN customers c    ON c.customer_id = o.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p     ON p.product_id = oi.product_id;' },
      setup: NORMAL,
      starter: '-- join the 4 tables\n',
      solution: 'SELECT s.student_name, d.dept_name, d.dept_head, c.course_name\nFROM students_n s\nJOIN departments_n d ON d.dept_id = s.dept_id\nJOIN enrollments_n e ON e.student_id = s.student_id\nJOIN courses_n c ON c.course_id = e.course_id;',
      explain: 'Joining on the keys gives back exactly the original rows — no rows lost, no fake rows added — so the decomposition is **lossless**. You can save this query as a view so users still see the "flat" picture.',
    },
  ],
};
