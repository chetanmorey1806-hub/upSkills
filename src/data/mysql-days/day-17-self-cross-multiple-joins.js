export default {
  id: 'mysql-day-17',
  title: 'SELF JOIN, CROSS JOIN and Joining Multiple Tables',
  module: 'Module 4: Joins & Subqueries',
  day: 17,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Join a table to itself to read hierarchies (employee and manager), create every combination with CROSS JOIN, use non-equi joins for ranges, and chain 3 to 4 tables in one query to build real reports.',
  objectives: [
    'Write a SELF JOIN using two aliases of the same table',
    'Explain what a CROSS JOIN (Cartesian product) returns and when it is useful',
    'Join three or four tables correctly through bridge (junction) tables',
    'Use a non-equi join to match values against ranges',
  ],
  theory: [
    {
      heading: '1. SELF JOIN',
      content: 'A self join joins a table with itself. MySQL has no SELF JOIN keyword: you write the same table twice in FROM with two different aliases and then use INNER or LEFT JOIN. It is used for hierarchies stored in one table (faculty.manager_id points to another faculty.faculty_id) and for comparing rows of the same table (students from the same city).',
      syntax: `SELECT emp.name AS employee, mgr.name AS manager
FROM faculty emp
LEFT JOIN faculty mgr ON emp.manager_id = mgr.faculty_id;`,
      points: [
        'Aliases are mandatory, otherwise MySQL cannot tell the two copies apart (Error 1066: Not unique table/alias)',
        'Use LEFT JOIN to keep the top-level people whose manager_id is NULL',
        'When pairing rows, use a.id < b.id to avoid (A,A) and duplicate (A,B)/(B,A) pairs',
      ],
    },
    {
      heading: '2. CROSS JOIN (Cartesian product)',
      content: 'CROSS JOIN combines every row of the first table with every row of the second table. If A has 3 rows and B has 4 rows the result has 3 x 4 = 12 rows. It has no ON clause. It is useful for generating combinations (sizes x colours, every student x every exam slot, a calendar x products grid), but it is dangerous on large tables.',
      syntax: `SELECT s.size, c.colour
FROM sizes s
CROSS JOIN colours c;
-- old comma syntax gives the same result:
SELECT s.size, c.colour FROM sizes s, colours c;`,
      tip: 'Forgetting the ON condition in an old comma-style join creates an accidental CROSS JOIN. If your row count suddenly explodes, look for a missing join condition.',
    },
    {
      heading: '3. Joining multiple tables',
      content: 'Most business questions need more than two tables. Add one JOIN at a time; each new JOIN needs its own ON condition that connects it to a table already in the query. A many-to-many relationship (students and courses) always goes through a bridge table (enrollments).',
      syntax: `SELECT s.name, c.course_name, d.dept_name
FROM enrollments e
JOIN students    s ON s.student_id = e.student_id
JOIN courses     c ON c.course_id  = e.course_id
JOIN departments d ON d.dept_id    = c.dept_id;`,
      points: [
        'N tables need at least N-1 join conditions',
        'Start FROM the bridge/fact table (enrollments, order_items) and join the lookup tables to it',
        'If one join in the chain is LEFT, later joins to that table usually also need LEFT, otherwise the NULL rows are removed again',
      ],
    },
    {
      heading: '4. Non-equi joins',
      content: 'Joins do not have to use =. A non-equi join uses BETWEEN, <, > or <> in the ON clause. A classic example is grading: a grade_bands table holds min and max marks, and each student is matched to the band where marks BETWEEN min_marks AND max_marks.',
      syntax: `SELECT s.name, s.marks, g.band
FROM students s
JOIN grade_bands g ON s.marks BETWEEN g.min_marks AND g.max_marks;`,
    },
    {
      heading: '5. Reading multi-join queries in Workbench',
      content: 'Long join queries are easier to read when formatted. In the SQL Editor select the query and click the Beautify/Format button (the broom icon, or Ctrl+B). Hover over a table name with Ctrl held to see its columns, and use the Schemas panel (right-click table > Send to SQL Editor > Select All Statement) to paste column lists quickly.',
      points: [
        'Use short meaningful aliases (s, c, e, d) and prefix every column with its alias',
        'Put each JOIN on its own line',
        'Check row counts: a join that multiplies rows unexpectedly usually has a wrong or missing ON',
      ],
    },
  ],
  examples: [
    {
      title: 'SELF JOIN: faculty and their manager',
      scenario: 'HR wants each faculty member with the name of the person they report to. Heads of department have no manager.',
      steps: [
        'In MySQL Workbench: open the Local instance MySQL80 connection',
        'File > New Query Tab',
        'Paste the script (creates the college database) and press Ctrl+Shift+Enter',
        'In the Result Grid, rows with NULL manager are the department heads',
      ],
      code: `SELECT emp.faculty_id, emp.name AS faculty, mgr.name AS reports_to
FROM faculty emp
LEFT JOIN faculty mgr ON emp.manager_id = mgr.faculty_id
ORDER BY emp.faculty_id;`,
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
SELECT emp.faculty_id, emp.name AS faculty, mgr.name AS reports_to
FROM faculty emp
LEFT JOIN faculty mgr ON emp.manager_id = mgr.faculty_id
ORDER BY emp.faculty_id;`,
      result: ">> SELECT emp.faculty_id, emp.name AS faculty, mgr.name AS reports_to\n+------------+--------------+--------------+\n| faculty_id | faculty      | reports_to   |\n+------------+--------------+--------------+\n| 1          | Dr. Rao      | NULL         |\n| 2          | Prof. Gupta  | Dr. Rao      |\n| 3          | Prof. Khan   | Dr. Rao      |\n| 4          | Dr. Menon    | NULL         |\n| 5          | Prof. Bose   | Dr. Menon    |\n| 6          | Dr. Kulkarni | NULL         |\n| 7          | Prof. Das    | Dr. Kulkarni |\n| 8          | Prof. Pillai | NULL         |\n+------------+--------------+--------------+\n8 row(s) returned",
      explanation: 'The faculty table is used twice: emp (the employee) and mgr (the manager). LEFT JOIN keeps Dr. Rao, Dr. Menon, Dr. Kulkarni and Prof. Pillai whose manager_id is NULL.',
    },
    {
      title: 'SELF JOIN: pairs of students from the same city',
      scenario: 'The hostel office wants to pair students who live in the same city for travel arrangements.',
      steps: ['Open a new query tab', 'Paste and execute the script', 'Note that every pair appears only once'],
      code: `SELECT a.name AS student_1, b.name AS student_2, a.city
FROM students a
JOIN students b ON a.city = b.city AND a.student_id < b.student_id
ORDER BY a.city, a.name;`,
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
SELECT a.name AS student_1, b.name AS student_2, a.city
FROM students a
JOIN students b ON a.city = b.city AND a.student_id < b.student_id
ORDER BY a.city, a.name;`,
      result: ">> SELECT a.name AS student_1, b.name AS student_2, a.city\n+--------------+--------------+--------+\n| student_1    | student_2    | city   |\n+--------------+--------------+--------+\n| Rohan Verma  | Arjun Mehta  | Delhi  |\n| Diya Patel   | Vikram Joshi | Mumbai |\n| Aarav Sharma | Kabir Singh  | Pune   |\n| Aarav Sharma | Priya Desai  | Pune   |\n| Kabir Singh  | Priya Desai  | Pune   |\n+--------------+--------------+--------+\n5 row(s) returned",
      explanation: 'a.student_id < b.student_id removes self pairs (Aarav, Aarav) and mirrored pairs (Diya-Vikram and Vikram-Diya). Pune has 3 students, so it gives 3 pairs.',
    },
    {
      title: 'CROSS JOIN: exam timetable combinations',
      scenario: 'The exam cell needs every combination of exam slot and exam hall to plan seating.',
      steps: ['Open a new query tab', 'Paste the script and click ⚡ Execute', 'Count the rows: 3 slots x 2 halls = 6 rows'],
      code: `CREATE TABLE exam_slots (slot VARCHAR(20));
CREATE TABLE exam_halls (hall VARCHAR(20));
INSERT INTO exam_slots VALUES ('Mon 10:00'),('Mon 14:00'),('Tue 10:00');
INSERT INTO exam_halls VALUES ('Hall A'),('Hall B');

SELECT s.slot, h.hall
FROM exam_slots s
CROSS JOIN exam_halls h
ORDER BY s.slot, h.hall;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS exam_slots;
DROP TABLE IF EXISTS exam_halls;
CREATE TABLE exam_slots (slot VARCHAR(20));
CREATE TABLE exam_halls (hall VARCHAR(20));
INSERT INTO exam_slots VALUES ('Mon 10:00'),('Mon 14:00'),('Tue 10:00');
INSERT INTO exam_halls VALUES ('Hall A'),('Hall B');
SELECT s.slot, h.hall
FROM exam_slots s
CROSS JOIN exam_halls h
ORDER BY s.slot, h.hall;
SELECT COUNT(*) AS combinations FROM exam_slots CROSS JOIN exam_halls;`,
      result: ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS exam_slots -> 0 row(s) affected\n>> DROP TABLE IF EXISTS exam_halls -> 0 row(s) affected\n>> CREATE TABLE exam_slots (slot VARCHAR(20)) -> 0 row(s) affected\n>> CREATE TABLE exam_halls (hall VARCHAR(20)) -> 0 row(s) affected\n>> INSERT INTO exam_slots VALUES ('Mon 10:00'),('Mon 14:00'),('Tue 10:00' -> 3 row(s) affected Records: 3  Duplicates: 0  Warnings: 0\n>> INSERT INTO exam_halls VALUES ('Hall A'),('Hall B') -> 2 row(s) affected Records: 2  Duplicates: 0  Warnings: 0\n>> SELECT s.slot, h.hall\n+-----------+--------+\n| slot      | hall   |\n+-----------+--------+\n| Mon 10:00 | Hall A |\n| Mon 10:00 | Hall B |\n| Mon 14:00 | Hall A |\n| Mon 14:00 | Hall B |\n| Tue 10:00 | Hall A |\n| Tue 10:00 | Hall B |\n+-----------+--------+\n6 row(s) returned\n>> SELECT COUNT(*) AS combinations FROM exam_slots CROSS JOIN exam_halls\n+--------------+\n| combinations |\n+--------------+\n| 6            |\n+--------------+\n1 row(s) returned",
      explanation: 'CROSS JOIN has no ON clause and returns 3 x 2 = 6 rows. On two tables of 10,000 rows each it would return 100 million rows, so use it only on small tables.',
    },
    {
      title: 'Four-table join: student, course, department report',
      scenario: 'The registrar needs a report: student name, course taken, grade, and the department that offers the course.',
      steps: ['Open a new query tab', 'Paste the script', 'Select the SELECT statement and click the Beautify button (broom icon) to format it', 'Press Ctrl+Shift+Enter'],
      code: `SELECT s.name, c.course_name, e.grade, d.dept_name AS offered_by
FROM enrollments e
JOIN students    s ON s.student_id = e.student_id
JOIN courses     c ON c.course_id  = e.course_id
JOIN departments d ON d.dept_id    = c.dept_id
WHERE e.grade IN ('A','B')
ORDER BY d.dept_name, s.name;`,
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
SELECT s.name, c.course_name, e.grade, d.dept_name AS offered_by
FROM enrollments e
JOIN students    s ON s.student_id = e.student_id
JOIN courses     c ON c.course_id  = e.course_id
JOIN departments d ON d.dept_id    = c.dept_id
WHERE e.grade IN ('A','B')
ORDER BY d.dept_name, s.name;`,
      result: ">> SELECT s.name, c.course_name, e.grade, d.dept_name AS offered_by\n+--------------+---------------------+-------+------------------+\n| name         | course_name         | grade | offered_by       |\n+--------------+---------------------+-------+------------------+\n| Meera Nair   | Structural Analysis | B     | Civil            |\n| Aarav Sharma | Database Systems    | A     | Computer Science |\n| Aarav Sharma | Python Programming  | B     | Computer Science |\n| Ananya Rao   | Database Systems    | A     | Computer Science |\n| Ananya Rao   | Machine Learning    | A     | Computer Science |\n| Diya Patel   | Database Systems    | A     | Computer Science |\n| Diya Patel   | Machine Learning    | A     | Computer Science |\n| Rohan Verma  | Digital Electronics | B     | Electronics      |\n| Sneha Iyer   | Digital Electronics | A     | Electronics      |\n+--------------+---------------------+-------+------------------+\n9 row(s) returned",
      explanation: 'Four tables need three ON conditions. enrollments is the bridge between students and courses; departments is reached through courses.dept_id.',
    },
    {
      title: 'Non-equi join: grade bands',
      scenario: 'Assign a performance band to each student using a band table with min and max marks.',
      steps: ['Open a new query tab', 'Paste and run the script', 'Every student falls into exactly one band'],
      code: `CREATE TABLE grade_bands (band VARCHAR(15), min_marks INT, max_marks INT);
INSERT INTO grade_bands VALUES
 ('Distinction',85,100),('First Class',70,84),('Second Class',60,69),('Pass',0,59);

SELECT s.name, s.marks, g.band
FROM students s
JOIN grade_bands g ON s.marks BETWEEN g.min_marks AND g.max_marks
ORDER BY s.marks DESC;`,
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
DROP TABLE IF EXISTS grade_bands;
CREATE TABLE grade_bands (band VARCHAR(15), min_marks INT, max_marks INT);
INSERT INTO grade_bands VALUES
 ('Distinction',85,100),('First Class',70,84),('Second Class',60,69),('Pass',0,59);
SELECT s.name, s.marks, g.band
FROM students s
JOIN grade_bands g ON s.marks BETWEEN g.min_marks AND g.max_marks
ORDER BY s.marks DESC;`,
      result: ">> DROP TABLE IF EXISTS grade_bands -> 0 row(s) affected\n>> CREATE TABLE grade_bands (band VARCHAR(15), min_marks INT, max_marks I -> 0 row(s) affected\n>> INSERT INTO grade_bands VALUES -> 4 row(s) affected Records: 4  Duplicates: 0  Warnings: 0\n>> SELECT s.name, s.marks, g.band\n+--------------+-------+--------------+\n| name         | marks | band         |\n+--------------+-------+--------------+\n| Ananya Rao   | 95    | Distinction  |\n| Diya Patel   | 92    | Distinction  |\n| Aarav Sharma | 88    | Distinction  |\n| Sneha Iyer   | 81    | First Class  |\n| Priya Desai  | 79    | First Class  |\n| Rohan Verma  | 75    | First Class  |\n| Meera Nair   | 72    | First Class  |\n| Kabir Singh  | 67    | Second Class |\n| Arjun Mehta  | 64    | Second Class |\n| Vikram Joshi | 58    | Pass         |\n+--------------+-------+--------------+\n10 row(s) returned",
      explanation: 'The ON clause uses BETWEEN instead of =. Because the bands do not overlap, each student matches exactly one band.',
    },
    {
      title: 'E-commerce: full order line report (4 tables)',
      scenario: 'Operations wants each order line with customer name, product, quantity and line amount for delivered orders.',
      steps: ['Open a new query tab', 'Paste the script (creates ecommerce) and press Ctrl+Shift+Enter', 'Check the line_amount column'],
      code: `SELECT o.order_id, c.name AS customer, p.name AS product,
       oi.qty, oi.qty * oi.unit_price AS line_amount
FROM order_items oi
JOIN orders    o ON o.order_id    = oi.order_id
JOIN customers c ON c.customer_id = o.customer_id
JOIN products  p ON p.product_id  = oi.product_id
WHERE o.status = 'DELIVERED'
ORDER BY o.order_id, p.name;`,
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
SELECT o.order_id, c.name AS customer, p.name AS product,
       oi.qty, oi.qty * oi.unit_price AS line_amount
FROM order_items oi
JOIN orders    o ON o.order_id    = oi.order_id
JOIN customers c ON c.customer_id = o.customer_id
JOIN products  p ON p.product_id  = oi.product_id
WHERE o.status = 'DELIVERED'
ORDER BY o.order_id, p.name;`,
      result: ">> SELECT o.order_id, c.name AS customer, p.name AS product,\n+----------+--------------+----------------+-----+-------------+\n| order_id | customer     | product        | qty | line_amount |\n+----------+--------------+----------------+-----+-------------+\n| 1        | Rahul Khanna | Laptop Pro 14  | 1   | 75000       |\n| 1        | Rahul Khanna | Wireless Mouse | 2   | 1600        |\n| 2        | Neha Gupta   | Cotton T-Shirt | 3   | 1800        |\n| 2        | Neha Gupta   | Office Chair   | 1   | 6500        |\n| 4        | Amit Shah    | Office Chair   | 2   | 13000       |\n| 4        | Amit Shah    | Study Table    | 1   | 9000        |\n| 6        | Neha Gupta   | Laptop Pro 14  | 1   | 75000       |\n| 6        | Neha Gupta   | Running Shoes  | 2   | 7000        |\n| 8        | Amit Shah    | Cotton T-Shirt | 2   | 1200        |\n| 8        | Amit Shah    | Wireless Mouse | 1   | 800         |\n+----------+--------------+----------------+-----+-------------+\n10 row(s) returned",
      explanation: 'order_items is the fact table; orders, customers and products are joined to it. Only DELIVERED orders (1, 2, 4, 6, 8) appear.',
    },
  ],
  interview: [
    { q: 'What is a self join? Give a real example.', a: 'A join of a table with itself using two aliases. Example: employees table with manager_id; join emp.manager_id = mgr.emp_id to show each employee with the manager name.', level: 'Easy' },
    { q: 'Is SELF JOIN a keyword in MySQL?', a: 'No. It is a technique. You use a normal INNER/LEFT JOIN and list the same table twice with different aliases.', level: 'Easy' },
    { q: 'What does CROSS JOIN return?', a: 'The Cartesian product: every row of table A combined with every row of table B. Row count = rows(A) x rows(B).', level: 'Easy' },
    { q: 'Give a practical use of CROSS JOIN.', a: 'Generating combinations: all sizes x colours for a product catalogue, every store x every date for a sales calendar so missing days show 0, or every student x every subject for a mark-sheet template.', level: 'Medium' },
    { q: 'In MySQL, what happens if you write JOIN without ON?', a: 'In MySQL, JOIN / INNER JOIN without ON behaves as a CROSS JOIN (Cartesian product). Other databases raise an error, so always write ON.', level: 'Medium' },
    { q: 'How do you avoid duplicate pairs in a self join that pairs rows?', a: 'Add a.id < b.id in the ON clause. It removes self pairs and keeps only one ordering of each pair.', level: 'Medium' },
    { q: 'What is a non-equi join?', a: 'A join whose condition uses an operator other than =, e.g. BETWEEN for salary grades or price ranges, or < for finding earlier events.', level: 'Medium' },
    { q: 'How many join conditions are needed to join 5 tables?', a: 'At least 4 (N - 1). Missing one causes a partial Cartesian product.', level: 'Easy' },
    { q: 'How would you find employees who earn more than their manager?', a: 'Self join: SELECT e.name FROM emp e JOIN emp m ON e.manager_id = m.emp_id WHERE e.salary > m.salary;', level: 'Medium' },
    { q: 'Why does order matter when mixing LEFT and INNER joins in a chain?', a: 'If table B is LEFT joined (may be NULL) and then C is INNER joined on B.col, the rows where B was NULL fail the inner join and are removed, cancelling the LEFT JOIN. Use LEFT JOIN for the rest of that chain.', level: 'Hard' },
  ],
  practice: [
    { task: 'Show faculty who earn more than their manager.', hint: 'Self join faculty and compare salaries.', solution: `SELECT e.name, e.salary, m.name AS manager, m.salary AS manager_salary
FROM faculty e
JOIN faculty m ON e.manager_id = m.faculty_id
WHERE e.salary > m.salary;` },
    { task: 'Count how many people report to each manager.', hint: 'Self join and GROUP BY the manager.', solution: `SELECT m.name AS manager, COUNT(e.faculty_id) AS team_size
FROM faculty m
JOIN faculty e ON e.manager_id = m.faculty_id
GROUP BY m.faculty_id, m.name;` },
    { task: 'List student name, course name and course fee for all enrollments, highest fee first.', hint: 'enrollments + students + courses.', solution: `SELECT s.name, c.course_name, c.fee
FROM enrollments e
JOIN students s ON s.student_id = e.student_id
JOIN courses  c ON c.course_id  = e.course_id
ORDER BY c.fee DESC;` },
    { task: 'Generate a template of every Computer Science student x every Computer Science course.', hint: 'CROSS JOIN two filtered sets (or JOIN ON TRUE with WHERE).', solution: `SELECT s.name, c.course_name
FROM students s
CROSS JOIN courses c
WHERE s.dept_id = 1 AND c.dept_id = 1
ORDER BY s.name, c.course_name;` },
    { task: 'In ecommerce show revenue per product category for delivered orders.', hint: 'order_items + orders + products, GROUP BY category.', solution: `SELECT p.category, SUM(oi.qty * oi.unit_price) AS revenue
FROM order_items oi
JOIN orders o   ON o.order_id = oi.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status = 'DELIVERED'
GROUP BY p.category
ORDER BY revenue DESC;` },
  ],
  quiz: [
    { question: 'Table A has 4 rows and table B has 5 rows. How many rows does A CROSS JOIN B return?', options: ['9', '5', '20', '4'], answer: 2, explanation: 'Cartesian product: 4 x 5 = 20.' },
    { question: 'What is required to write a self join?', options: ['The SELF keyword', 'Two different aliases for the same table', 'A view', 'A FOREIGN KEY'], answer: 1, explanation: 'You list the same table twice with different aliases.' },
    { question: 'To join 4 tables you need at least how many join conditions?', options: ['3', '4', '2', '1'], answer: 0, explanation: 'N tables need N - 1 conditions.' },
    { question: 'Which ON clause is a non-equi join?', options: ['ON a.id = b.id', 'ON a.id = b.a_id AND a.x = b.x', 'USING (id)', 'ON a.marks BETWEEN b.min_m AND b.max_m'], answer: 3, explanation: 'BETWEEN compares against a range instead of equality.' },
    { question: 'Why add a.id < b.id when pairing rows with a self join?', options: ['To speed up the query', 'To remove self pairs and mirrored duplicates', 'It is required syntax', 'To sort the result'], answer: 1, explanation: 'It keeps only one ordering of each pair and removes (A,A).' },
  ],
};
