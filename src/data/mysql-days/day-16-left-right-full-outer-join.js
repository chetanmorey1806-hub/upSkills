export default {
  id: 'mysql-day-16',
  title: 'LEFT, RIGHT and FULL OUTER JOIN (UNION Emulation)',
  module: 'Module 4: Joins & Subqueries',
  day: 16,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Outer joins keep rows that have no match in the other table. Learn LEFT JOIN, RIGHT JOIN, the "find missing rows" (anti-join) pattern, the ON-vs-WHERE trap, and how to build a FULL OUTER JOIN in MySQL with UNION because MySQL has no FULL OUTER JOIN keyword.',
  objectives: [
    'Explain the difference between INNER JOIN and OUTER JOIN using matched and unmatched rows',
    'Write LEFT JOIN and RIGHT JOIN queries and read the NULLs they produce',
    'Find rows with no match using LEFT JOIN ... WHERE right.key IS NULL',
    'Emulate FULL OUTER JOIN in MySQL using LEFT JOIN UNION RIGHT JOIN',
    'Avoid the common mistake of filtering the right table in WHERE instead of ON',
  ],
  theory: [
    {
      heading: '1. Why do we need outer joins?',
      content: 'An INNER JOIN (Day 15) returns only rows that have a match in BOTH tables. In real life we often need the rows that do NOT match: departments with no students, customers who never ordered, courses nobody joined. An OUTER JOIN keeps all rows of one table (or both) and fills the missing side with NULL.',
      points: [
        'INNER JOIN = only matching rows',
        'LEFT JOIN = all rows of the LEFT table + matching rows of the right table',
        'RIGHT JOIN = all rows of the RIGHT table + matching rows of the left table',
        'FULL OUTER JOIN = all rows of both tables (MySQL needs UNION to do this)',
        'Columns from the side that has no match are shown as NULL in the Result Grid',
      ],
    },
    {
      heading: '2. LEFT JOIN (LEFT OUTER JOIN)',
      content: 'LEFT JOIN returns every row of the table written before the JOIN keyword (the left table). If a left row has no partner in the right table, it still appears once, with NULL in all right-table columns. The words LEFT JOIN and LEFT OUTER JOIN are exactly the same in MySQL.',
      syntax: `SELECT l.col, r.col
FROM left_table l
LEFT JOIN right_table r
       ON l.key = r.key;`,
      tip: 'Use COUNT(r.some_column), not COUNT(*), when counting matches after a LEFT JOIN. COUNT(*) counts the NULL row as 1, COUNT(column) ignores NULL and correctly gives 0.',
    },
    {
      heading: '3. RIGHT JOIN (RIGHT OUTER JOIN)',
      content: 'RIGHT JOIN is the mirror image of LEFT JOIN: it keeps every row of the table written after JOIN. Any RIGHT JOIN can be rewritten as a LEFT JOIN by swapping the table order, so most teams use LEFT JOIN everywhere for readability.',
      syntax: `SELECT s.name, d.dept_name
FROM students s
RIGHT JOIN departments d ON s.dept_id = d.dept_id;
-- same result as:
SELECT s.name, d.dept_name
FROM departments d
LEFT JOIN students s ON s.dept_id = d.dept_id;`,
    },
    {
      heading: '4. Anti-join: finding rows with NO match',
      content: 'A very common interview and business query is "show records that are missing in another table". Do a LEFT JOIN and keep only rows where the right table key IS NULL. This is called an anti-join. It is usually as fast as NOT EXISTS and is easy to read.',
      syntax: `SELECT s.name
FROM students s
LEFT JOIN enrollments e ON e.student_id = s.student_id
WHERE e.enroll_id IS NULL;   -- students who joined no course`,
      points: [
        'Always test the right table PRIMARY KEY (or a NOT NULL column) for IS NULL',
        'Never write = NULL; it is always unknown. Use IS NULL',
      ],
    },
    {
      heading: '5. ON vs WHERE in outer joins (the classic trap)',
      content: 'A condition on the right table placed in the WHERE clause runs AFTER the join, so it removes the NULL rows and silently turns your LEFT JOIN into an INNER JOIN. If you want to keep all left rows and only match some right rows, put the condition inside ON.',
      syntax: `-- keeps all courses, counts only 'A' grades
SELECT c.course_name, COUNT(e.enroll_id) AS a_grades
FROM courses c
LEFT JOIN enrollments e
       ON e.course_id = c.course_id AND e.grade = 'A'
GROUP BY c.course_name;`,
      tip: 'Rule of thumb: conditions on the LEFT table go in WHERE; conditions on the RIGHT (optional) table go in ON.',
    },
    {
      heading: '6. FULL OUTER JOIN in MySQL (UNION emulation)',
      content: 'MySQL 8 does not support the FULL OUTER JOIN keyword (you get Error 1064). To get every row from both tables, run a LEFT JOIN and a RIGHT JOIN with the same columns and combine them with UNION. UNION removes the duplicate matched rows that appear in both halves. Use UNION ALL plus "WHERE left.key IS NULL" in the second half if you need to keep genuine duplicates.',
      syntax: `SELECT s.name, d.dept_name
FROM students s LEFT JOIN departments d ON s.dept_id = d.dept_id
UNION
SELECT s.name, d.dept_name
FROM students s RIGHT JOIN departments d ON s.dept_id = d.dept_id;`,
      points: [
        'Both SELECTs must return the same number of columns in the same order',
        'Workbench shows a single Result Grid for the whole UNION',
        'The Workbench Lab engine also accepts FULL OUTER JOIN, but real MySQL 8 does NOT: always use the UNION form in MySQL',
      ],
    },
  ],
  examples: [
    {
      title: 'LEFT JOIN: every department with its student count',
      scenario: 'The principal wants a list of ALL departments with how many students each has, including departments that have no students yet.',
      steps: [
        'In MySQL Workbench: open the Local instance MySQL80 connection from the Home screen',
        'File > New Query Tab (Ctrl+T)',
        'Paste the full script (it creates the college sample database)',
        'Click the ⚡ Execute button (or press Ctrl+Shift+Enter) to run all statements',
        'Look at the last Result Grid tab: Management shows 0',
      ],
      code: `USE college;
SELECT d.dept_name,
       COUNT(s.student_id) AS total_students
FROM departments d
LEFT JOIN students s ON s.dept_id = d.dept_id
GROUP BY d.dept_id, d.dept_name
ORDER BY total_students DESC, d.dept_name;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id INT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL,
  location VARCHAR(50)
);
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  gender ENUM('M','F'),
  city VARCHAR(40),
  dept_id INT,
  marks INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE courses (
  course_id INT PRIMARY KEY,
  course_name VARCHAR(60) NOT NULL,
  dept_id INT,
  credits INT,
  fee DECIMAL(10,2),
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE enrollments (
  enroll_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  grade CHAR(1),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
CREATE TABLE faculty (
  faculty_id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  dept_id INT,
  salary DECIMAL(10,2),
  manager_id INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
INSERT INTO departments VALUES
 (1,'Computer Science','Block A'),(2,'Electronics','Block B'),
 (3,'Mechanical','Block C'),(4,'Civil','Block D'),(5,'Management','Block E');
INSERT INTO students (name, gender, city, dept_id, marks) VALUES
 ('Aarav Sharma','M','Pune',1,88),('Diya Patel','F','Mumbai',1,92),
 ('Rohan Verma','M','Delhi',2,75),('Sneha Iyer','F','Chennai',2,81),
 ('Kabir Singh','M','Pune',3,67),('Ananya Rao','F','Bengaluru',1,95),
 ('Vikram Joshi','M','Mumbai',3,58),('Meera Nair','F','Kochi',4,72),
 ('Arjun Mehta','M','Delhi',NULL,64),('Priya Desai','F','Pune',NULL,79);
INSERT INTO courses VALUES
 (101,'Database Systems',1,4,15000.00),(102,'Python Programming',1,3,12000.00),
 (103,'Digital Electronics',2,4,14000.00),(104,'Thermodynamics',3,3,11000.00),
 (105,'Structural Analysis',4,4,13000.00),(106,'Machine Learning',1,4,18000.00),
 (107,'Marketing Basics',5,2,9000.00);
INSERT INTO enrollments (student_id, course_id, grade) VALUES
 (1,101,'A'),(1,102,'B'),(2,101,'A'),(2,106,'A'),(3,103,'B'),
 (4,103,'A'),(5,104,'C'),(6,101,'A'),(6,106,'A'),(7,104,'D'),
 (8,105,'B'),(9,102,'C');
INSERT INTO faculty VALUES
 (1,'Dr. Rao',1,150000.00,NULL),(2,'Prof. Gupta',1,95000.00,1),
 (3,'Prof. Khan',1,90000.00,1),(4,'Dr. Menon',2,120000.00,NULL),
 (5,'Prof. Bose',2,85000.00,4),(6,'Dr. Kulkarni',3,110000.00,NULL),
 (7,'Prof. Das',3,80000.00,6),(8,'Prof. Pillai',NULL,70000.00,NULL);
SELECT d.dept_name,
       COUNT(s.student_id) AS total_students
FROM departments d
LEFT JOIN students s ON s.dept_id = d.dept_id
GROUP BY d.dept_id, d.dept_name
ORDER BY total_students DESC, d.dept_name;`,
      result: ">> SELECT d.dept_name,\n+------------------+----------------+\n| dept_name        | total_students |\n+------------------+----------------+\n| Computer Science | 3              |\n| Electronics      | 2              |\n| Mechanical       | 2              |\n| Civil            | 1              |\n| Management       | 0              |\n+------------------+----------------+\n5 row(s) returned",
      explanation: 'departments is the left table, so all 5 departments appear. Management has no students, so s.student_id is NULL and COUNT(s.student_id) gives 0. With an INNER JOIN Management would disappear.',
    },
    {
      title: 'Anti-join: students not enrolled and courses with no students',
      scenario: 'The exam cell needs (a) students who have not enrolled in any course and (b) courses that nobody has taken.',
      steps: [
        'Open a new query tab (File > New Query Tab)',
        'Paste the script and press Ctrl+Shift+Enter',
        'Workbench opens two Result Grid tabs (Result 1, Result 2) for the two SELECT statements',
      ],
      code: `-- (a) students with no enrollment
SELECT s.student_id, s.name
FROM students s
LEFT JOIN enrollments e ON e.student_id = s.student_id
WHERE e.enroll_id IS NULL;

-- (b) courses with no enrollment
SELECT c.course_id, c.course_name
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.course_id
WHERE e.enroll_id IS NULL;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id INT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL,
  location VARCHAR(50)
);
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  gender ENUM('M','F'),
  city VARCHAR(40),
  dept_id INT,
  marks INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE courses (
  course_id INT PRIMARY KEY,
  course_name VARCHAR(60) NOT NULL,
  dept_id INT,
  credits INT,
  fee DECIMAL(10,2),
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE enrollments (
  enroll_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  grade CHAR(1),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
CREATE TABLE faculty (
  faculty_id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  dept_id INT,
  salary DECIMAL(10,2),
  manager_id INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
INSERT INTO departments VALUES
 (1,'Computer Science','Block A'),(2,'Electronics','Block B'),
 (3,'Mechanical','Block C'),(4,'Civil','Block D'),(5,'Management','Block E');
INSERT INTO students (name, gender, city, dept_id, marks) VALUES
 ('Aarav Sharma','M','Pune',1,88),('Diya Patel','F','Mumbai',1,92),
 ('Rohan Verma','M','Delhi',2,75),('Sneha Iyer','F','Chennai',2,81),
 ('Kabir Singh','M','Pune',3,67),('Ananya Rao','F','Bengaluru',1,95),
 ('Vikram Joshi','M','Mumbai',3,58),('Meera Nair','F','Kochi',4,72),
 ('Arjun Mehta','M','Delhi',NULL,64),('Priya Desai','F','Pune',NULL,79);
INSERT INTO courses VALUES
 (101,'Database Systems',1,4,15000.00),(102,'Python Programming',1,3,12000.00),
 (103,'Digital Electronics',2,4,14000.00),(104,'Thermodynamics',3,3,11000.00),
 (105,'Structural Analysis',4,4,13000.00),(106,'Machine Learning',1,4,18000.00),
 (107,'Marketing Basics',5,2,9000.00);
INSERT INTO enrollments (student_id, course_id, grade) VALUES
 (1,101,'A'),(1,102,'B'),(2,101,'A'),(2,106,'A'),(3,103,'B'),
 (4,103,'A'),(5,104,'C'),(6,101,'A'),(6,106,'A'),(7,104,'D'),
 (8,105,'B'),(9,102,'C');
INSERT INTO faculty VALUES
 (1,'Dr. Rao',1,150000.00,NULL),(2,'Prof. Gupta',1,95000.00,1),
 (3,'Prof. Khan',1,90000.00,1),(4,'Dr. Menon',2,120000.00,NULL),
 (5,'Prof. Bose',2,85000.00,4),(6,'Dr. Kulkarni',3,110000.00,NULL),
 (7,'Prof. Das',3,80000.00,6),(8,'Prof. Pillai',NULL,70000.00,NULL);
SELECT s.student_id, s.name
FROM students s
LEFT JOIN enrollments e ON e.student_id = s.student_id
WHERE e.enroll_id IS NULL;
SELECT c.course_id, c.course_name
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.course_id
WHERE e.enroll_id IS NULL;`,
      result: ">> SELECT s.student_id, s.name\n+------------+-------------+\n| student_id | name        |\n+------------+-------------+\n| 10         | Priya Desai |\n+------------+-------------+\n1 row(s) returned\n>> SELECT c.course_id, c.course_name\n+-----------+------------------+\n| course_id | course_name      |\n+-----------+------------------+\n| 107       | Marketing Basics |\n+-----------+------------------+\n1 row(s) returned",
      explanation: 'The LEFT JOIN keeps every student/course. Only the rows where no enrollment was found have e.enroll_id = NULL, and the WHERE keeps exactly those rows.',
    },
    {
      title: 'RIGHT JOIN and its LEFT JOIN twin',
      scenario: 'Show every department and the students in it, keeping departments without students, written once with RIGHT JOIN and once with LEFT JOIN.',
      steps: [
        'Open a new query tab',
        'Paste the script and click ⚡ Execute',
        'Compare Result 1 and Result 2: they contain the same 9 rows',
      ],
      code: `SELECT d.dept_name, s.name
FROM students s
RIGHT JOIN departments d ON s.dept_id = d.dept_id
ORDER BY d.dept_id, s.name;

SELECT d.dept_name, s.name
FROM departments d
LEFT JOIN students s ON s.dept_id = d.dept_id
ORDER BY d.dept_id, s.name;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id INT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL,
  location VARCHAR(50)
);
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  gender ENUM('M','F'),
  city VARCHAR(40),
  dept_id INT,
  marks INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE courses (
  course_id INT PRIMARY KEY,
  course_name VARCHAR(60) NOT NULL,
  dept_id INT,
  credits INT,
  fee DECIMAL(10,2),
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE enrollments (
  enroll_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  grade CHAR(1),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
CREATE TABLE faculty (
  faculty_id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  dept_id INT,
  salary DECIMAL(10,2),
  manager_id INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
INSERT INTO departments VALUES
 (1,'Computer Science','Block A'),(2,'Electronics','Block B'),
 (3,'Mechanical','Block C'),(4,'Civil','Block D'),(5,'Management','Block E');
INSERT INTO students (name, gender, city, dept_id, marks) VALUES
 ('Aarav Sharma','M','Pune',1,88),('Diya Patel','F','Mumbai',1,92),
 ('Rohan Verma','M','Delhi',2,75),('Sneha Iyer','F','Chennai',2,81),
 ('Kabir Singh','M','Pune',3,67),('Ananya Rao','F','Bengaluru',1,95),
 ('Vikram Joshi','M','Mumbai',3,58),('Meera Nair','F','Kochi',4,72),
 ('Arjun Mehta','M','Delhi',NULL,64),('Priya Desai','F','Pune',NULL,79);
INSERT INTO courses VALUES
 (101,'Database Systems',1,4,15000.00),(102,'Python Programming',1,3,12000.00),
 (103,'Digital Electronics',2,4,14000.00),(104,'Thermodynamics',3,3,11000.00),
 (105,'Structural Analysis',4,4,13000.00),(106,'Machine Learning',1,4,18000.00),
 (107,'Marketing Basics',5,2,9000.00);
INSERT INTO enrollments (student_id, course_id, grade) VALUES
 (1,101,'A'),(1,102,'B'),(2,101,'A'),(2,106,'A'),(3,103,'B'),
 (4,103,'A'),(5,104,'C'),(6,101,'A'),(6,106,'A'),(7,104,'D'),
 (8,105,'B'),(9,102,'C');
INSERT INTO faculty VALUES
 (1,'Dr. Rao',1,150000.00,NULL),(2,'Prof. Gupta',1,95000.00,1),
 (3,'Prof. Khan',1,90000.00,1),(4,'Dr. Menon',2,120000.00,NULL),
 (5,'Prof. Bose',2,85000.00,4),(6,'Dr. Kulkarni',3,110000.00,NULL),
 (7,'Prof. Das',3,80000.00,6),(8,'Prof. Pillai',NULL,70000.00,NULL);
SELECT d.dept_name, s.name
FROM students s
RIGHT JOIN departments d ON s.dept_id = d.dept_id
ORDER BY d.dept_id, s.name;
SELECT d.dept_name, s.name
FROM departments d
LEFT JOIN students s ON s.dept_id = d.dept_id
ORDER BY d.dept_id, s.name;`,
      result: ">> SELECT d.dept_name, s.name\n+------------------+--------------+\n| dept_name        | name         |\n+------------------+--------------+\n| Computer Science | Aarav Sharma |\n| Computer Science | Ananya Rao   |\n| Computer Science | Diya Patel   |\n| Electronics      | Rohan Verma  |\n| Electronics      | Sneha Iyer   |\n| Mechanical       | Kabir Singh  |\n| Mechanical       | Vikram Joshi |\n| Civil            | Meera Nair   |\n| Management       | NULL         |\n+------------------+--------------+\n9 row(s) returned\n>> SELECT d.dept_name, s.name\n+------------------+--------------+\n| dept_name        | name         |\n+------------------+--------------+\n| Computer Science | Aarav Sharma |\n| Computer Science | Ananya Rao   |\n| Computer Science | Diya Patel   |\n| Electronics      | Rohan Verma  |\n| Electronics      | Sneha Iyer   |\n| Mechanical       | Kabir Singh  |\n| Mechanical       | Vikram Joshi |\n| Civil            | Meera Nair   |\n| Management       | NULL         |\n+------------------+--------------+\n9 row(s) returned",
      explanation: 'Both queries keep all departments. Arjun Mehta and Priya Desai (no department) are missing because students is the optional side here. Swapping table order turns RIGHT JOIN into LEFT JOIN.',
    },
    {
      title: 'FULL OUTER JOIN using UNION',
      scenario: 'Audit report: show every student and every department, including students without a department AND departments without students.',
      steps: [
        'Open a new query tab',
        'Paste the script. Notice there is no FULL OUTER JOIN keyword: we combine a LEFT and a RIGHT join',
        'Press Ctrl+Shift+Enter and read the single combined Result Grid',
      ],
      code: `SELECT s.name AS student, d.dept_name AS department
FROM students s
LEFT JOIN departments d ON s.dept_id = d.dept_id
UNION
SELECT s.name, d.dept_name
FROM students s
RIGHT JOIN departments d ON s.dept_id = d.dept_id;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id INT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL,
  location VARCHAR(50)
);
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  gender ENUM('M','F'),
  city VARCHAR(40),
  dept_id INT,
  marks INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE courses (
  course_id INT PRIMARY KEY,
  course_name VARCHAR(60) NOT NULL,
  dept_id INT,
  credits INT,
  fee DECIMAL(10,2),
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE enrollments (
  enroll_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  grade CHAR(1),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
CREATE TABLE faculty (
  faculty_id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  dept_id INT,
  salary DECIMAL(10,2),
  manager_id INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
INSERT INTO departments VALUES
 (1,'Computer Science','Block A'),(2,'Electronics','Block B'),
 (3,'Mechanical','Block C'),(4,'Civil','Block D'),(5,'Management','Block E');
INSERT INTO students (name, gender, city, dept_id, marks) VALUES
 ('Aarav Sharma','M','Pune',1,88),('Diya Patel','F','Mumbai',1,92),
 ('Rohan Verma','M','Delhi',2,75),('Sneha Iyer','F','Chennai',2,81),
 ('Kabir Singh','M','Pune',3,67),('Ananya Rao','F','Bengaluru',1,95),
 ('Vikram Joshi','M','Mumbai',3,58),('Meera Nair','F','Kochi',4,72),
 ('Arjun Mehta','M','Delhi',NULL,64),('Priya Desai','F','Pune',NULL,79);
INSERT INTO courses VALUES
 (101,'Database Systems',1,4,15000.00),(102,'Python Programming',1,3,12000.00),
 (103,'Digital Electronics',2,4,14000.00),(104,'Thermodynamics',3,3,11000.00),
 (105,'Structural Analysis',4,4,13000.00),(106,'Machine Learning',1,4,18000.00),
 (107,'Marketing Basics',5,2,9000.00);
INSERT INTO enrollments (student_id, course_id, grade) VALUES
 (1,101,'A'),(1,102,'B'),(2,101,'A'),(2,106,'A'),(3,103,'B'),
 (4,103,'A'),(5,104,'C'),(6,101,'A'),(6,106,'A'),(7,104,'D'),
 (8,105,'B'),(9,102,'C');
INSERT INTO faculty VALUES
 (1,'Dr. Rao',1,150000.00,NULL),(2,'Prof. Gupta',1,95000.00,1),
 (3,'Prof. Khan',1,90000.00,1),(4,'Dr. Menon',2,120000.00,NULL),
 (5,'Prof. Bose',2,85000.00,4),(6,'Dr. Kulkarni',3,110000.00,NULL),
 (7,'Prof. Das',3,80000.00,6),(8,'Prof. Pillai',NULL,70000.00,NULL);
SELECT s.name AS student, d.dept_name AS department
FROM students s
LEFT JOIN departments d ON s.dept_id = d.dept_id
UNION
SELECT s.name, d.dept_name
FROM students s
RIGHT JOIN departments d ON s.dept_id = d.dept_id;`,
      result: ">> SELECT s.name AS student, d.dept_name AS department\n+--------------+------------------+\n| student      | department       |\n+--------------+------------------+\n| NULL         | Management       |\n| Aarav Sharma | Computer Science |\n| Ananya Rao   | Computer Science |\n| Arjun Mehta  | NULL             |\n| Diya Patel   | Computer Science |\n| Kabir Singh  | Mechanical       |\n| Meera Nair   | Civil            |\n| Priya Desai  | NULL             |\n| Rohan Verma  | Electronics      |\n| Sneha Iyer   | Electronics      |\n| Vikram Joshi | Mechanical       |\n+--------------+------------------+\n11 row(s) returned",
      explanation: '11 rows: 8 matched pairs, 2 students with NULL department and 1 department (Management) with NULL student. UNION removed the 8 matched rows that both halves returned.',
    },
    {
      title: 'ON vs WHERE: keeping all courses while counting only A grades',
      scenario: 'The HOD wants the number of A grades in every course, with 0 for courses that have no A grade.',
      steps: [
        'Open a new query tab',
        'Paste the script and execute it',
        'Result 1 (filter in WHERE) is missing courses; Result 2 (filter in ON) shows all 7 courses',
      ],
      code: `-- WRONG: WHERE removes courses without an A
SELECT c.course_name, COUNT(e.enroll_id) AS a_grades
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.course_id
WHERE e.grade = 'A'
GROUP BY c.course_id, c.course_name;

-- RIGHT: condition inside ON
SELECT c.course_name, COUNT(e.enroll_id) AS a_grades
FROM courses c
LEFT JOIN enrollments e
       ON e.course_id = c.course_id AND e.grade = 'A'
GROUP BY c.course_id, c.course_name
ORDER BY c.course_id;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id INT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL,
  location VARCHAR(50)
);
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  gender ENUM('M','F'),
  city VARCHAR(40),
  dept_id INT,
  marks INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE courses (
  course_id INT PRIMARY KEY,
  course_name VARCHAR(60) NOT NULL,
  dept_id INT,
  credits INT,
  fee DECIMAL(10,2),
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE enrollments (
  enroll_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  grade CHAR(1),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
CREATE TABLE faculty (
  faculty_id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  dept_id INT,
  salary DECIMAL(10,2),
  manager_id INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
INSERT INTO departments VALUES
 (1,'Computer Science','Block A'),(2,'Electronics','Block B'),
 (3,'Mechanical','Block C'),(4,'Civil','Block D'),(5,'Management','Block E');
INSERT INTO students (name, gender, city, dept_id, marks) VALUES
 ('Aarav Sharma','M','Pune',1,88),('Diya Patel','F','Mumbai',1,92),
 ('Rohan Verma','M','Delhi',2,75),('Sneha Iyer','F','Chennai',2,81),
 ('Kabir Singh','M','Pune',3,67),('Ananya Rao','F','Bengaluru',1,95),
 ('Vikram Joshi','M','Mumbai',3,58),('Meera Nair','F','Kochi',4,72),
 ('Arjun Mehta','M','Delhi',NULL,64),('Priya Desai','F','Pune',NULL,79);
INSERT INTO courses VALUES
 (101,'Database Systems',1,4,15000.00),(102,'Python Programming',1,3,12000.00),
 (103,'Digital Electronics',2,4,14000.00),(104,'Thermodynamics',3,3,11000.00),
 (105,'Structural Analysis',4,4,13000.00),(106,'Machine Learning',1,4,18000.00),
 (107,'Marketing Basics',5,2,9000.00);
INSERT INTO enrollments (student_id, course_id, grade) VALUES
 (1,101,'A'),(1,102,'B'),(2,101,'A'),(2,106,'A'),(3,103,'B'),
 (4,103,'A'),(5,104,'C'),(6,101,'A'),(6,106,'A'),(7,104,'D'),
 (8,105,'B'),(9,102,'C');
INSERT INTO faculty VALUES
 (1,'Dr. Rao',1,150000.00,NULL),(2,'Prof. Gupta',1,95000.00,1),
 (3,'Prof. Khan',1,90000.00,1),(4,'Dr. Menon',2,120000.00,NULL),
 (5,'Prof. Bose',2,85000.00,4),(6,'Dr. Kulkarni',3,110000.00,NULL),
 (7,'Prof. Das',3,80000.00,6),(8,'Prof. Pillai',NULL,70000.00,NULL);
SELECT c.course_name, COUNT(e.enroll_id) AS a_grades
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.course_id
WHERE e.grade = 'A'
GROUP BY c.course_id, c.course_name;
SELECT c.course_name, COUNT(e.enroll_id) AS a_grades
FROM courses c
LEFT JOIN enrollments e
       ON e.course_id = c.course_id AND e.grade = 'A'
GROUP BY c.course_id, c.course_name
ORDER BY c.course_id;`,
      result: ">> SELECT c.course_name, COUNT(e.enroll_id) AS a_grades\n+---------------------+----------+\n| course_name         | a_grades |\n+---------------------+----------+\n| Database Systems    | 3        |\n| Digital Electronics | 1        |\n| Machine Learning    | 2        |\n+---------------------+----------+\n3 row(s) returned\n>> SELECT c.course_name, COUNT(e.enroll_id) AS a_grades\n+---------------------+----------+\n| course_name         | a_grades |\n+---------------------+----------+\n| Database Systems    | 3        |\n| Python Programming  | 0        |\n| Digital Electronics | 1        |\n| Thermodynamics      | 0        |\n| Structural Analysis | 0        |\n| Machine Learning    | 2        |\n| Marketing Basics    | 0        |\n+---------------------+----------+\n7 row(s) returned",
      explanation: 'In the first query the NULL rows fail e.grade = \'A\' and are removed, so only 3 courses remain (it behaves like an INNER JOIN). Moving the filter into ON keeps every course and simply matches fewer enrollments.',
    },
    {
      title: 'E-commerce: customers with order count and unpaid orders',
      scenario: 'Marketing wants every customer with the number of orders placed (0 for those who never ordered). Finance wants orders that have no payment row.',
      steps: [
        'Open a new query tab',
        'Paste the script (it builds the ecommerce sample database) and press Ctrl+Shift+Enter',
        'Result 1 = customers, Result 2 = unpaid orders',
      ],
      code: `USE ecommerce;
SELECT c.name, COUNT(o.order_id) AS orders_placed
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY orders_placed DESC, c.name;

SELECT o.order_id, o.status, p.payment_id
FROM orders o
LEFT JOIN payments p ON p.order_id = o.order_id
WHERE p.payment_id IS NULL;`,
      mysql: `CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  city VARCHAR(40),
  email VARCHAR(80) UNIQUE,
  signup_date DATE
);
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  category VARCHAR(40),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  stock INT DEFAULT 0
);
CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date DATE NOT NULL,
  status ENUM('PLACED','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PLACED',
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
CREATE TABLE order_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL CHECK (qty > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);
CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('UPI','CARD','COD','NETBANKING'),
  paid_on DATE,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
INSERT INTO customers (name, city, email, signup_date) VALUES
 ('Rahul Khanna','Mumbai','rahul@mail.com','2024-01-10'),
 ('Neha Gupta','Delhi','neha@mail.com','2024-02-15'),
 ('Amit Shah','Pune','amit@mail.com','2024-03-05'),
 ('Pooja Reddy','Hyderabad','pooja@mail.com','2024-03-20'),
 ('Karan Malhotra','Delhi','karan@mail.com','2024-04-01'),
 ('Isha Kapoor','Mumbai','isha@mail.com','2024-05-12');
INSERT INTO products (name, category, price, stock) VALUES
 ('Laptop Pro 14','Electronics',75000.00,15),('Wireless Mouse','Electronics',800.00,200),
 ('Office Chair','Furniture',6500.00,40),('Study Table','Furniture',9000.00,25),
 ('Running Shoes','Fashion',3500.00,60),('Cotton T-Shirt','Fashion',600.00,150),
 ('Bluetooth Speaker','Electronics',2500.00,0);
INSERT INTO orders (customer_id, order_date, status) VALUES
 (1,'2024-06-01','DELIVERED'),(2,'2024-06-03','DELIVERED'),(1,'2024-06-10','SHIPPED'),
 (3,'2024-06-15','DELIVERED'),(4,'2024-06-20','CANCELLED'),(2,'2024-07-02','DELIVERED'),
 (5,'2024-07-05','PLACED'),(3,'2024-07-18','DELIVERED');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES
 (1,1,1,75000.00),(1,2,2,800.00),(2,3,1,6500.00),(2,6,3,600.00),
 (3,5,1,3500.00),(4,4,1,9000.00),(4,3,2,6500.00),(5,7,1,2500.00),
 (6,1,1,75000.00),(6,5,2,3500.00),(7,6,4,600.00),(8,2,1,800.00),(8,6,2,600.00);
INSERT INTO payments (order_id, amount, method, paid_on) VALUES
 (1,76600.00,'CARD','2024-06-01'),(2,8300.00,'UPI','2024-06-03'),
 (3,3500.00,'UPI','2024-06-10'),(4,22000.00,'NETBANKING','2024-06-15'),
 (6,82000.00,'CARD','2024-07-02'),(8,2000.00,'COD','2024-07-20');
SELECT c.name, COUNT(o.order_id) AS orders_placed
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY orders_placed DESC, c.name;
SELECT o.order_id, o.status, p.payment_id
FROM orders o
LEFT JOIN payments p ON p.order_id = o.order_id
WHERE p.payment_id IS NULL;`,
      result: ">> SELECT c.name, COUNT(o.order_id) AS orders_placed\n+----------------+---------------+\n| name           | orders_placed |\n+----------------+---------------+\n| Amit Shah      | 2             |\n| Neha Gupta     | 2             |\n| Rahul Khanna   | 2             |\n| Karan Malhotra | 1             |\n| Pooja Reddy    | 1             |\n| Isha Kapoor    | 0             |\n+----------------+---------------+\n6 row(s) returned\n>> SELECT o.order_id, o.status, p.payment_id\n+----------+-----------+------------+\n| order_id | status    | payment_id |\n+----------+-----------+------------+\n| 5        | CANCELLED | NULL       |\n| 7        | PLACED    | NULL       |\n+----------+-----------+------------+\n2 row(s) returned",
      explanation: 'Isha Kapoor never ordered, so she shows 0. Orders 5 (CANCELLED) and 7 (PLACED) have no payment row; the anti-join finds them.',
    },
  ],
  interview: [
    { q: 'What is the difference between INNER JOIN and LEFT JOIN?', a: 'INNER JOIN returns only rows that match in both tables. LEFT JOIN returns all rows of the left table and the matching rows of the right table; when there is no match, right-table columns are NULL.', level: 'Easy' },
    { q: 'Does MySQL support FULL OUTER JOIN?', a: 'No. MySQL 8 gives a syntax error. You emulate it with SELECT ... LEFT JOIN ... UNION SELECT ... RIGHT JOIN ... using the same column list.', level: 'Easy' },
    { q: 'Why use UNION and not UNION ALL in the FULL OUTER JOIN emulation?', a: 'Matched rows are returned by both the LEFT and the RIGHT half. UNION removes these duplicates. If real duplicate rows must be kept, use UNION ALL and add WHERE left_key IS NULL to the second half so it only returns the unmatched right rows.', level: 'Medium' },
    { q: 'How do you find customers who never placed an order?', a: 'SELECT c.* FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id WHERE o.order_id IS NULL; (or use NOT EXISTS).', level: 'Easy' },
    { q: 'Can every RIGHT JOIN be written as a LEFT JOIN?', a: 'Yes. A RIGHT JOIN B is the same as B LEFT JOIN A. Most style guides prefer LEFT JOIN only, so the "kept" table is always first.', level: 'Easy' },
    { q: 'What happens if you put a right-table condition in WHERE after a LEFT JOIN?', a: 'The WHERE runs after the join; NULL rows fail the condition and are removed, so the query behaves like an INNER JOIN. Put such conditions in the ON clause instead.', level: 'Medium' },
    { q: 'After a LEFT JOIN, why is COUNT(*) wrong for counting matches?', a: 'An unmatched left row still produces one row (with NULLs), so COUNT(*) returns 1. COUNT(right.column) ignores NULL and returns 0.', level: 'Medium' },
    { q: 'Is LEFT OUTER JOIN different from LEFT JOIN?', a: 'No, OUTER is optional. LEFT JOIN and LEFT OUTER JOIN are identical.', level: 'Easy' },
    { q: 'Which is faster for an anti-join: LEFT JOIN ... IS NULL or NOT EXISTS?', a: 'In MySQL 8 the optimizer usually converts both to the same anti-join plan, so performance is similar. Use EXPLAIN to check. Avoid NOT IN when the subquery column can contain NULL because it returns no rows.', level: 'Hard' },
    { q: 'Table A has 5 rows and B has 3 rows. What is the minimum row count of A LEFT JOIN B?', a: 'At least 5 (every A row appears at least once). It can be more if an A row matches several B rows.', level: 'Medium' },
  ],
  practice: [
    { task: 'List every faculty member with their department name, including faculty without a department.', hint: 'faculty is the table you must keep, so put it on the left.', solution: `SELECT f.name, d.dept_name
FROM faculty f
LEFT JOIN departments d ON d.dept_id = f.dept_id;` },
    { task: 'Show departments that have no faculty members.', hint: 'LEFT JOIN faculty and test faculty_id IS NULL.', solution: `SELECT d.dept_name
FROM departments d
LEFT JOIN faculty f ON f.dept_id = d.dept_id
WHERE f.faculty_id IS NULL;` },
    { task: 'For every course show the number of enrolled students (0 when nobody enrolled).', hint: 'COUNT the right-table column, not *.', solution: `SELECT c.course_name, COUNT(e.student_id) AS students
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name;` },
    { task: 'Write a FULL OUTER JOIN of faculty and departments in MySQL.', hint: 'LEFT JOIN UNION RIGHT JOIN.', solution: `SELECT f.name, d.dept_name
FROM faculty f LEFT JOIN departments d ON f.dept_id = d.dept_id
UNION
SELECT f.name, d.dept_name
FROM faculty f RIGHT JOIN departments d ON f.dept_id = d.dept_id;` },
    { task: 'In ecommerce, list every product with total quantity sold (0 if never sold).', hint: 'Use COALESCE(SUM(qty),0).', solution: `SELECT p.name, COALESCE(SUM(oi.qty), 0) AS qty_sold
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.product_id
GROUP BY p.product_id, p.name
ORDER BY qty_sold DESC;` },
  ],
  quiz: [
    { question: 'Which join returns all rows from the left table even when there is no match?', options: ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'NATURAL JOIN'], answer: 1, explanation: 'LEFT JOIN keeps every row of the left table and fills missing right columns with NULL.' },
    { question: 'How do you get a FULL OUTER JOIN in MySQL 8?', options: ['FULL OUTER JOIN keyword', 'OUTER JOIN keyword', 'LEFT JOIN UNION RIGHT JOIN', 'CROSS JOIN with WHERE'], answer: 2, explanation: 'MySQL has no FULL OUTER JOIN; combine a LEFT and a RIGHT join with UNION.' },
    { question: 'Which WHERE clause finds left rows that have NO match?', options: ['WHERE right.id = NULL', 'WHERE right.id <> NULL', 'WHERE left.id IS NULL', 'WHERE right.id IS NULL'], answer: 3, explanation: 'Unmatched rows have NULL in the right-table key; test it with IS NULL.' },
    { question: 'A LEFT JOIN query has WHERE e.grade = \'A\' on the right table. What happens?', options: ['It behaves like an INNER JOIN', 'It returns more rows', 'MySQL raises an error', 'Nothing changes'], answer: 0, explanation: 'NULL rows fail the condition, so unmatched left rows disappear.' },
    { question: 'students RIGHT JOIN departments is the same as:', options: ['students LEFT JOIN departments', 'departments LEFT JOIN students', 'departments INNER JOIN students', 'students CROSS JOIN departments'], answer: 1, explanation: 'Swapping the tables turns a RIGHT JOIN into a LEFT JOIN.' },
  ],
};
