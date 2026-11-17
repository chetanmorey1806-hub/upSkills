export default {
  id: 'mysql-day-19',
  title: 'UNION / UNION ALL, EXISTS / NOT EXISTS, ANY / ALL',
  module: 'Module 4: Joins & Subqueries',
  day: 19,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Stack the results of several queries vertically with UNION and UNION ALL, test whether related rows exist with EXISTS / NOT EXISTS, and compare a value with every value of a list using ANY / SOME / ALL. Also see INTERSECT and EXCEPT (MySQL 8.0.31+).',
  objectives: [
    'Combine result sets with UNION and UNION ALL and know the column rules',
    'Explain why UNION ALL is faster than UNION',
    'Use EXISTS and NOT EXISTS for semi-joins and anti-joins (NULL-safe)',
    'Use ANY / ALL comparisons and their MIN / MAX equivalents',
  ],
  theory: [
    {
      heading: '1. UNION and UNION ALL',
      content: 'UNION places the rows of a second SELECT under the rows of the first SELECT (vertical combination), while a JOIN puts columns side by side (horizontal). UNION removes duplicate rows; UNION ALL keeps every row, including duplicates.',
      syntax: `SELECT name, 'Student' AS role FROM students
UNION ALL
SELECT name, 'Faculty' FROM faculty
ORDER BY role, name;`,
      points: [
        'Every SELECT must return the same number of columns',
        'Matching columns should have compatible data types',
        'Column names of the result come from the FIRST SELECT',
        'ORDER BY and LIMIT at the end apply to the whole combined result',
        'To sort/limit one part only, wrap it in parentheses: (SELECT ... ORDER BY x LIMIT 2) UNION ALL (SELECT ...) (real MySQL only, not the Lab)',
      ],
    },
    {
      heading: '2. UNION vs UNION ALL performance',
      content: 'UNION must sort or hash the whole result to remove duplicates, which costs time and memory. UNION ALL simply appends rows. If you know the parts cannot overlap (for example each row has a different "role" label) or you need duplicates, always prefer UNION ALL.',
      tip: 'Interview favourite: "UNION removes duplicates and is slower; UNION ALL keeps duplicates and is faster."',
    },
    {
      heading: '3. EXISTS and NOT EXISTS',
      content: 'EXISTS (subquery) is TRUE when the subquery returns at least one row. MySQL stops searching as soon as it finds the first matching row, so SELECT 1 or SELECT * inside makes no difference. EXISTS is almost always correlated (it refers to the outer row). NOT EXISTS is the safest way to write an anti-join because it is not affected by NULLs like NOT IN is.',
      syntax: `-- departments that have at least one faculty member
SELECT d.dept_name
FROM departments d
WHERE EXISTS (SELECT 1 FROM faculty f WHERE f.dept_id = d.dept_id);

-- students who have no enrollment
SELECT s.name
FROM students s
WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.student_id);`,
    },
    {
      heading: '4. ANY / SOME and ALL',
      content: 'ANY (synonym SOME) and ALL compare one value with every value returned by a subquery. "> ANY (list)" means greater than at least one value (greater than the minimum). "> ALL (list)" means greater than every value (greater than the maximum). "= ANY" is the same as IN, and "<> ALL" is the same as NOT IN.',
      syntax: `SELECT name, marks FROM students
WHERE marks > ALL (SELECT marks FROM students WHERE dept_id = 2);   -- > MAX
SELECT name, marks FROM students
WHERE marks > ANY (SELECT marks FROM students WHERE dept_id = 2);   -- > MIN`,
      points: [
        '> ALL (...)  equals  > (SELECT MAX(...))',
        '< ALL (...)  equals  < (SELECT MIN(...))',
        '> ANY (...)  equals  > (SELECT MIN(...))',
        '< ANY (...)  equals  < (SELECT MAX(...))',
        'ANY / ALL work in real MySQL 8. The browser Workbench Lab does not support them, so the Lab examples use the MIN/MAX form',
      ],
    },
    {
      heading: '5. INTERSECT and EXCEPT (MySQL 8.0.31+)',
      content: 'From MySQL 8.0.31, INTERSECT returns rows present in both queries and EXCEPT returns rows of the first query that are not in the second. In older MySQL versions use IN / EXISTS for INTERSECT and NOT EXISTS / LEFT JOIN ... IS NULL for EXCEPT.',
      syntax: `SELECT dept_id FROM departments
EXCEPT
SELECT dept_id FROM faculty;      -- departments with no faculty`,
    },
  ],
  examples: [
    {
      title: 'UNION ALL: one directory of students and faculty',
      scenario: 'The Computer Science notice board needs one list of all people in the department with their role.',
      steps: [
        'In MySQL Workbench: open the Local instance MySQL80 connection',
        'File > New Query Tab',
        'Paste the script and press Ctrl+Shift+Enter',
        'Note that the column headers come from the first SELECT',
      ],
      code: `SELECT name AS person, 'Student' AS role FROM students WHERE dept_id = 1
UNION ALL
SELECT name, 'Faculty' FROM faculty WHERE dept_id = 1
ORDER BY role, person;`,
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
SELECT name AS person, 'Student' AS role FROM students WHERE dept_id = 1
UNION ALL
SELECT name, 'Faculty' FROM faculty WHERE dept_id = 1
ORDER BY role, person;`,
      result: ">> SELECT name AS person, 'Student' AS role FROM students WHERE dept_id =\n+--------------+---------+\n| person       | role    |\n+--------------+---------+\n| Dr. Rao      | Faculty |\n| Prof. Gupta  | Faculty |\n| Prof. Khan   | Faculty |\n| Aarav Sharma | Student |\n| Ananya Rao   | Student |\n| Diya Patel   | Student |\n+--------------+---------+\n6 row(s) returned",
      explanation: '3 faculty + 3 students = 6 rows. A literal column (role) labels where each row came from. ORDER BY at the end sorts the whole combined result.',
    },
    {
      title: 'UNION vs UNION ALL: duplicate handling',
      scenario: 'Which department ids are used by students or faculty? Compare the two operators.',
      steps: ['Open a new query tab', 'Paste the script and execute', 'Result 1 (UNION) has unique values; Result 2 (UNION ALL) has all 18 values'],
      code: `SELECT dept_id FROM students
UNION
SELECT dept_id FROM faculty
ORDER BY dept_id;

SELECT COUNT(*) AS total_rows FROM (
  SELECT dept_id FROM students
  UNION ALL
  SELECT dept_id FROM faculty
) AS t;`,
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
SELECT dept_id FROM students
UNION
SELECT dept_id FROM faculty
ORDER BY dept_id;
SELECT COUNT(*) AS total_rows FROM (
  SELECT dept_id FROM students
  UNION ALL
  SELECT dept_id FROM faculty
) AS t;`,
      result: ">> SELECT dept_id FROM students\n+---------+\n| dept_id |\n+---------+\n| NULL    |\n| 1       |\n| 2       |\n| 3       |\n| 4       |\n+---------+\n5 row(s) returned\n>> SELECT COUNT(*) AS total_rows FROM (\n+------------+\n| total_rows |\n+------------+\n| 18         |\n+------------+\n1 row(s) returned",
      explanation: 'UNION removes duplicates, so each dept_id (and NULL) appears once. UNION ALL keeps all 10 student rows + 8 faculty rows = 18.',
    },
    {
      title: 'EXISTS and NOT EXISTS',
      scenario: 'Find departments that have faculty, and students who have not enrolled anywhere (NULL-safe).',
      steps: ['Open a new query tab', 'Paste and run the script', 'Check Result 1 and Result 2'],
      code: `SELECT d.dept_name
FROM departments d
WHERE EXISTS (SELECT 1 FROM faculty f WHERE f.dept_id = d.dept_id);

SELECT s.name
FROM students s
WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.student_id);`,
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
SELECT d.dept_name
FROM departments d
WHERE EXISTS (SELECT 1 FROM faculty f WHERE f.dept_id = d.dept_id);
SELECT s.name
FROM students s
WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.student_id);`,
      result: ">> SELECT d.dept_name\n+------------------+\n| dept_name        |\n+------------------+\n| Computer Science |\n| Electronics      |\n| Mechanical       |\n+------------------+\n3 row(s) returned\n>> SELECT s.name\n+-------------+\n| name        |\n+-------------+\n| Priya Desai |\n+-------------+\n1 row(s) returned",
      explanation: 'Departments 1, 2 and 3 have faculty. For each student MySQL checks enrollments; only Priya Desai has no row, so NOT EXISTS is TRUE for her.',
    },
    {
      title: 'ANY / ALL and their MIN / MAX equivalents',
      scenario: 'Find students who scored higher than EVERY Electronics student, and higher than AT LEAST ONE Electronics student.',
      steps: [
        'In real MySQL Workbench run the ANY/ALL version from the code box',
        'In the browser Lab, the MAX/MIN version (same result) runs',
        'Electronics marks are 75 and 81, so > ALL means > 81 and > ANY means > 75',
      ],
      code: `-- real MySQL 8
SELECT name, marks FROM students
WHERE marks > ALL (SELECT marks FROM students WHERE dept_id = 2);

SELECT name, marks FROM students
WHERE marks > ANY (SELECT marks FROM students WHERE dept_id = 2);

-- equivalent forms (work everywhere)
SELECT name, marks FROM students
WHERE marks > (SELECT MAX(marks) FROM students WHERE dept_id = 2);
SELECT name, marks FROM students
WHERE marks > (SELECT MIN(marks) FROM students WHERE dept_id = 2);`,
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
SELECT name, marks FROM students
WHERE marks > (SELECT MAX(marks) FROM students WHERE dept_id = 2)
ORDER BY marks DESC;
SELECT name, marks FROM students
WHERE marks > (SELECT MIN(marks) FROM students WHERE dept_id = 2)
ORDER BY marks DESC;`,
      result: ">> SELECT name, marks FROM students\n+--------------+-------+\n| name         | marks |\n+--------------+-------+\n| Ananya Rao   | 95    |\n| Diya Patel   | 92    |\n| Aarav Sharma | 88    |\n+--------------+-------+\n3 row(s) returned\n>> SELECT name, marks FROM students\n+--------------+-------+\n| name         | marks |\n+--------------+-------+\n| Ananya Rao   | 95    |\n| Diya Patel   | 92    |\n| Aarav Sharma | 88    |\n| Sneha Iyer   | 81    |\n| Priya Desai  | 79    |\n+--------------+-------+\n5 row(s) returned",
      explanation: '> ALL gives the 3 students above 81. > ANY gives 5 students above 75 (Sneha 81 is above 75, which is the minimum of her own department).',
    },
    {
      title: 'INTERSECT and EXCEPT (MySQL 8.0.31+)',
      scenario: 'Which departments have both students and faculty? Which departments have no faculty?',
      steps: ['Check your server version: SELECT VERSION(); must be 8.0.31 or newer', 'Paste the script and execute', 'On older versions use the EXISTS / NOT EXISTS versions instead'],
      code: `SELECT dept_id FROM students WHERE dept_id IS NOT NULL
INTERSECT
SELECT dept_id FROM faculty;

SELECT dept_id FROM departments
EXCEPT
SELECT dept_id FROM faculty;`,
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
SELECT dept_id FROM students WHERE dept_id IS NOT NULL
INTERSECT
SELECT dept_id FROM faculty;
SELECT dept_id FROM departments
EXCEPT
SELECT dept_id FROM faculty;`,
      result: ">> SELECT dept_id FROM students WHERE dept_id IS NOT NULL\n+---------+\n| dept_id |\n+---------+\n| 1       |\n| 2       |\n| 3       |\n+---------+\n3 row(s) returned\n>> SELECT dept_id FROM departments\n+---------+\n| dept_id |\n+---------+\n| 4       |\n| 5       |\n+---------+\n2 row(s) returned",
      explanation: 'INTERSECT returns ids present in both lists (1, 2, 3). EXCEPT returns department ids with no faculty row (4 Civil, 5 Management).',
    },
    {
      title: 'E-commerce: customer activity timeline with UNION ALL',
      scenario: 'Customer support wants one timeline of events (orders placed and payments received) for Neha Gupta (customer 2).',
      steps: ['Open a new query tab', 'Paste the script (creates ecommerce) and press Ctrl+Shift+Enter', 'Events are sorted by date'],
      code: `SELECT o.order_date AS event_date, 'Order placed' AS event, o.order_id AS ref
FROM orders o WHERE o.customer_id = 2
UNION ALL
SELECT p.paid_on, CONCAT('Payment via ', p.method), p.order_id
FROM payments p JOIN orders o ON o.order_id = p.order_id
WHERE o.customer_id = 2
ORDER BY event_date, event;`,
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
SELECT o.order_date AS event_date, 'Order placed' AS event, o.order_id AS ref
FROM orders o WHERE o.customer_id = 2
UNION ALL
SELECT p.paid_on, CONCAT('Payment via ', p.method), p.order_id
FROM payments p JOIN orders o ON o.order_id = p.order_id
WHERE o.customer_id = 2
ORDER BY event_date, event;`,
      result: ">> SELECT o.order_date AS event_date, 'Order placed' AS event, o.order_id\n+------------+------------------+-----+\n| event_date | event            | ref |\n+------------+------------------+-----+\n| 2024-06-03 | Order placed     | 2   |\n| 2024-06-03 | Payment via UPI  | 2   |\n| 2024-07-02 | Order placed     | 6   |\n| 2024-07-02 | Payment via CARD | 6   |\n+------------+------------------+-----+\n4 row(s) returned",
      explanation: 'Two different tables are stacked into one timeline with the same 3 columns. UNION ALL is used because the two parts can never be duplicates of each other.',
    },
  ],
  interview: [
    { q: 'What is the difference between UNION and UNION ALL?', a: 'UNION removes duplicate rows (extra sort/hash step, slower). UNION ALL keeps all rows and is faster.', level: 'Easy' },
    { q: 'What are the rules for using UNION?', a: 'Same number of columns in every SELECT, compatible data types in the same positions; result column names come from the first SELECT; ORDER BY goes once at the end.', level: 'Easy' },
    { q: 'What is the difference between JOIN and UNION?', a: 'JOIN combines columns of related rows horizontally. UNION stacks rows of similar queries vertically.', level: 'Easy' },
    { q: 'How does EXISTS work?', a: 'It returns TRUE if the subquery returns at least one row; MySQL stops at the first match. The SELECT list inside does not matter.', level: 'Medium' },
    { q: 'EXISTS vs IN: which is better?', a: 'For small lists IN is simple. For large correlated checks EXISTS can stop early. In MySQL 8 both are usually turned into semi-joins with similar plans. For NOT, prefer NOT EXISTS because NOT IN fails when the list has NULLs.', level: 'Hard' },
    { q: 'What does > ALL (subquery) mean?', a: 'The value must be greater than every value returned, i.e. greater than the maximum. If the subquery returns no rows, > ALL is TRUE.', level: 'Medium' },
    { q: 'What does = ANY mean?', a: 'Equal to at least one value in the list, which is the same as IN.', level: 'Medium' },
    { q: 'Does MySQL support INTERSECT and EXCEPT?', a: 'Yes, from MySQL 8.0.31. Earlier versions emulate them with IN / EXISTS and NOT EXISTS / LEFT JOIN IS NULL.', level: 'Medium' },
    { q: 'How do you apply ORDER BY to only one part of a UNION?', a: 'Wrap that SELECT in parentheses together with LIMIT: (SELECT ... ORDER BY x LIMIT 3) UNION ALL (SELECT ...). Without LIMIT the inner ORDER BY is ignored.', level: 'Hard' },
    { q: 'Why might UNION return fewer rows than the sum of both queries?', a: 'Because it removes duplicate rows, including duplicates within the same SELECT.', level: 'Easy' },
  ],
  practice: [
    { task: 'Make a list of all cities found in the students table and all locations in the departments table, without duplicates.', hint: 'UNION on one column.', solution: `SELECT city AS place FROM students
UNION
SELECT location FROM departments
ORDER BY place;` },
    { task: 'Show courses that have at least one enrollment using EXISTS.', hint: 'Correlate on course_id.', solution: `SELECT c.course_name FROM courses c
WHERE EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.course_id);` },
    { task: 'Show faculty who earn less than every Computer Science faculty member (use ALL, then rewrite with MIN).', hint: '< ALL equals < MIN.', solution: `SELECT name, salary FROM faculty
WHERE salary < ALL (SELECT salary FROM faculty WHERE dept_id = 1);
-- same as
SELECT name, salary FROM faculty
WHERE salary < (SELECT MIN(salary) FROM faculty WHERE dept_id = 1);` },
    { task: 'In ecommerce, list customers who have never made a payment using NOT EXISTS.', hint: 'Join payments to orders inside the subquery.', solution: `SELECT c.name FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o JOIN payments p ON p.order_id = o.order_id
  WHERE o.customer_id = c.customer_id);` },
    { task: 'Build a report with total students per department and a final "TOTAL" row using UNION ALL.', hint: 'Second SELECT has no GROUP BY.', solution: `SELECT CAST(dept_id AS CHAR) AS dept, COUNT(*) AS students
FROM students GROUP BY dept_id
UNION ALL
SELECT 'TOTAL', COUNT(*) FROM students;` },
  ],
  quiz: [
    { question: 'Which operator keeps duplicate rows?', options: ['UNION', 'UNION ALL', 'INTERSECT', 'DISTINCT'], answer: 1, explanation: 'UNION ALL does not remove duplicates.' },
    { question: 'Where do the column names of a UNION result come from?', options: ['The last SELECT', 'They are numbered', 'The first SELECT', 'The ORDER BY clause'], answer: 2, explanation: 'Names are taken from the first SELECT.' },
    { question: 'x > ALL (SELECT ...) is equivalent to:', options: ['x > (SELECT MAX(...))', 'x > (SELECT MIN(...))', 'x IN (SELECT ...)', 'x > (SELECT AVG(...))'], answer: 0, explanation: 'Greater than every value means greater than the maximum.' },
    { question: 'Which is the NULL-safe anti-join?', options: ['NOT IN', '<> ANY', 'UNION', 'NOT EXISTS'], answer: 3, explanation: 'NOT EXISTS is not affected by NULLs in the subquery.' },
    { question: 'EXCEPT is available in MySQL from version:', options: ['5.7', '8.0.0', '8.0.31', 'It is not available'], answer: 2, explanation: 'INTERSECT and EXCEPT were added in 8.0.31.' },
  ],
};
