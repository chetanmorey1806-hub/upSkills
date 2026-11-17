export default {
  id: 'mysql-day-18',
  title: 'Subqueries: Single-row, Multi-row, Correlated and Derived Tables',
  module: 'Module 4: Joins & Subqueries',
  day: 18,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'A subquery is a SELECT inside another SQL statement. Learn single-row (scalar) subqueries, multi-row subqueries with IN / NOT IN, correlated subqueries that run once per outer row, subqueries in SELECT, and derived tables in FROM. Also learn the NOT IN + NULL trap and MySQL Error 1093.',
  objectives: [
    'Write scalar subqueries that compare a column against a single computed value',
    'Use IN / NOT IN with multi-row subqueries and understand the NULL trap',
    'Write correlated subqueries that reference the outer query',
    'Use derived tables (subquery in FROM) with a mandatory alias',
    'Decide when a JOIN is better than a subquery',
  ],
  theory: [
    {
      heading: '1. What is a subquery?',
      content: 'A subquery (inner query) is a complete SELECT written inside brackets within another statement (outer query). MySQL runs the inner query and uses its result in the outer query. Subqueries can appear in WHERE, HAVING, SELECT list, FROM, and inside INSERT, UPDATE and DELETE.',
      points: [
        'Always enclose the subquery in parentheses ( )',
        'Scalar subquery = returns exactly one value (1 row, 1 column)',
        'Multi-row subquery = returns one column, many rows (use IN, NOT IN, EXISTS, ANY, ALL)',
        'Table subquery / derived table = returns many rows and columns (used in FROM)',
      ],
    },
    {
      heading: '2. Single-row (scalar) subqueries',
      content: 'A scalar subquery returns one value, so it can be used with =, <>, >, <, >=, <=. Classic use: "students who scored above average", "the most expensive product". If the subquery accidentally returns more than one row MySQL raises Error 1242: Subquery returns more than 1 row.',
      syntax: `SELECT name, marks
FROM students
WHERE marks > (SELECT AVG(marks) FROM students);`,
      tip: 'Aggregates such as AVG and MAX cannot be used directly in WHERE (WHERE marks > AVG(marks) is invalid). Wrap them in a subquery.',
    },
    {
      heading: '3. Multi-row subqueries: IN and NOT IN',
      content: 'When the inner query returns a list of values, use IN (value is in the list) or NOT IN (value is not in the list). Danger: if the list returned to NOT IN contains even one NULL, the whole condition becomes UNKNOWN and NO rows are returned. Filter NULLs inside the subquery (WHERE col IS NOT NULL) or use NOT EXISTS.',
      syntax: `SELECT name FROM students
WHERE student_id IN (SELECT student_id FROM enrollments WHERE grade = 'A');

SELECT dept_name FROM departments
WHERE dept_id NOT IN (SELECT dept_id FROM students WHERE dept_id IS NOT NULL);`,
    },
    {
      heading: '4. Correlated subqueries',
      content: 'A correlated subquery refers to a column of the outer query, so conceptually it runs once for every outer row. Example: students who scored above the average of THEIR OWN department. The inner query uses s.dept_id from the outer row.',
      syntax: `SELECT s.name, s.dept_id, s.marks
FROM students s
WHERE s.marks > (SELECT AVG(s2.marks)
                 FROM students s2
                 WHERE s2.dept_id = s.dept_id);`,
      points: [
        'Non-correlated subquery: runs once, independent of the outer query',
        'Correlated subquery: depends on the outer row; can be slow on big tables without an index on the correlated column',
        'MySQL 8 often rewrites them internally into joins (semi-join optimisation)',
      ],
    },
    {
      heading: '5. Subqueries in SELECT and in FROM (derived tables)',
      content: 'A scalar subquery in the SELECT list computes one extra value per row (for example, the number of enrollments of each course). A subquery in FROM is called a derived table: it builds a temporary result set that the outer query reads like a table. Every derived table MUST have an alias, otherwise MySQL raises Error 1248: Every derived table must have its own alias.',
      syntax: `SELECT dept_id, avg_marks
FROM (SELECT dept_id, AVG(marks) AS avg_marks
      FROM students
      GROUP BY dept_id) AS dept_avg
WHERE avg_marks > 70;`,
    },
    {
      heading: '6. Subqueries in DML and Error 1093',
      content: 'Subqueries also work inside INSERT ... SELECT, UPDATE and DELETE. MySQL does not let you UPDATE or DELETE a table while selecting from the same table in a subquery (Error 1093: You can\'t specify target table for update in FROM clause). Work-around: wrap the inner query in another derived table, or use a JOIN in the UPDATE.',
      syntax: `-- Error 1093
DELETE FROM students WHERE marks < (SELECT AVG(marks) FROM students);
-- Works: derived table is materialised first
DELETE FROM students
WHERE marks < (SELECT avg_m FROM (SELECT AVG(marks) AS avg_m FROM students) AS t);`,
      tip: 'Subquery or JOIN? Use a JOIN when you need columns from both tables. Use a subquery (IN / EXISTS) when you only need to filter. Both are fine in MySQL 8; check with EXPLAIN when performance matters.',
    },
  ],
  examples: [
    {
      title: 'Scalar subquery: students above the college average',
      scenario: 'The scholarship committee wants students whose marks are above the overall average.',
      steps: [
        'In MySQL Workbench: open the Local instance MySQL80 connection',
        'File > New Query Tab',
        'Paste the script and press Ctrl+Shift+Enter',
        'Tip: select only the inner SELECT and press Ctrl+Enter to see the average on its own',
      ],
      code: `SELECT ROUND(AVG(marks), 2) AS college_avg FROM students;

SELECT name, marks
FROM students
WHERE marks > (SELECT AVG(marks) FROM students)
ORDER BY marks DESC;`,
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
SELECT ROUND(AVG(marks), 2) AS college_avg FROM students;
SELECT name, marks
FROM students
WHERE marks > (SELECT AVG(marks) FROM students)
ORDER BY marks DESC;`,
      result: ">> SELECT ROUND(AVG(marks), 2) AS college_avg FROM students\n+-------------+\n| college_avg |\n+-------------+\n| 77.1        |\n+-------------+\n1 row(s) returned\n>> SELECT name, marks\n+--------------+-------+\n| name         | marks |\n+--------------+-------+\n| Ananya Rao   | 95    |\n| Diya Patel   | 92    |\n| Aarav Sharma | 88    |\n| Sneha Iyer   | 81    |\n| Priya Desai  | 79    |\n+--------------+-------+\n5 row(s) returned",
      explanation: 'The inner query returns 77.1. The outer query keeps students with marks greater than 77.1, so 5 students qualify.',
    },
    {
      title: 'Multi-row subquery with IN and the NOT IN NULL trap',
      scenario: 'Find students who got at least one A grade, and departments that have no students.',
      steps: ['Open a new query tab', 'Paste the script and execute', 'Compare Result 3 (empty because of NULL) with Result 4 (correct)'],
      code: `-- students with at least one A
SELECT name FROM students
WHERE student_id IN (SELECT student_id FROM enrollments WHERE grade = 'A');

-- WRONG: students.dept_id contains NULL, so NOT IN returns nothing
SELECT dept_name FROM departments
WHERE dept_id NOT IN (SELECT dept_id FROM students);

-- RIGHT: remove NULLs inside the subquery
SELECT dept_name FROM departments
WHERE dept_id NOT IN (SELECT dept_id FROM students WHERE dept_id IS NOT NULL);`,
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
SELECT name FROM students
WHERE student_id IN (SELECT student_id FROM enrollments WHERE grade = 'A');
SELECT COUNT(*) AS students_without_dept FROM students WHERE dept_id IS NULL;
SELECT dept_name FROM departments
WHERE dept_id NOT IN (SELECT dept_id FROM students);
SELECT dept_name FROM departments
WHERE dept_id NOT IN (SELECT dept_id FROM students WHERE dept_id IS NOT NULL);`,
      result: ">> SELECT name FROM students\n+--------------+\n| name         |\n+--------------+\n| Aarav Sharma |\n| Diya Patel   |\n| Sneha Iyer   |\n| Ananya Rao   |\n+--------------+\n4 row(s) returned\n>> SELECT COUNT(*) AS students_without_dept FROM students WHERE dept_id I\n+-----------------------+\n| students_without_dept |\n+-----------------------+\n| 2                     |\n+-----------------------+\n1 row(s) returned\n>> SELECT dept_name FROM departments\n+-----------+\n| dept_name |\n+-----------+\n+-----------+\n0 row(s) returned\n>> SELECT dept_name FROM departments\n+------------+\n| dept_name  |\n+------------+\n| Management |\n+------------+\n1 row(s) returned",
      explanation: 'IN works as expected. NOT IN against a list that contains NULL returns 0 rows because "5 <> NULL" is UNKNOWN. After filtering NULLs, Management is correctly returned.',
    },
    {
      title: 'Correlated subquery: above their own department average',
      scenario: 'Each HOD wants students who scored above the average of their own department.',
      steps: ['Open a new query tab', 'Paste the script and click ⚡ Execute', 'Note how the inner query uses s.dept_id from the outer query'],
      code: `SELECT s.name, s.dept_id, s.marks
FROM students s
WHERE s.marks > (SELECT AVG(s2.marks)
                 FROM students s2
                 WHERE s2.dept_id = s.dept_id)
ORDER BY s.dept_id;`,
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
SELECT dept_id, AVG(marks) AS dept_avg FROM students WHERE dept_id IS NOT NULL GROUP BY dept_id;
SELECT s.name, s.dept_id, s.marks
FROM students s
WHERE s.marks > (SELECT AVG(s2.marks)
                 FROM students s2
                 WHERE s2.dept_id = s.dept_id)
ORDER BY s.dept_id;`,
      result: ">> SELECT dept_id, AVG(marks) AS dept_avg FROM students WHERE dept_id IS \n+---------+-------------------+\n| dept_id | dept_avg          |\n+---------+-------------------+\n| 1       | 91.66666666666667 |\n| 2       | 78.0              |\n| 3       | 62.5              |\n| 4       | 72.0              |\n+---------+-------------------+\n4 row(s) returned\n>> SELECT s.name, s.dept_id, s.marks\n+-------------+---------+-------+\n| name        | dept_id | marks |\n+-------------+---------+-------+\n| Diya Patel  | 1       | 92    |\n| Ananya Rao  | 1       | 95    |\n| Sneha Iyer  | 2       | 81    |\n| Kabir Singh | 3       | 67    |\n+-------------+---------+-------+\n4 row(s) returned",
      explanation: 'For Aarav (dept 1) the inner query computes AVG for dept 1 = 91.67; 88 is not above it. Ananya (95) and Diya (92) are. Sneha (81 > 78.0) and Kabir (67 > 62.5) also qualify. Civil has only Meera, whose marks equal the average, so nobody from dept 4 appears. Students with NULL dept never match because s2.dept_id = NULL is unknown.',
    },
    {
      title: 'Subquery in SELECT and derived table in FROM',
      scenario: 'Show each course with its number of students (subquery in SELECT), then list departments whose average marks are above 70 (derived table).',
      steps: ['Open a new query tab', 'Paste and execute the script', 'Remove the alias "AS dept_avg" and run again to see Error 1248'],
      code: `SELECT c.course_name,
       (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.course_id) AS students
FROM courses c
ORDER BY students DESC, c.course_name;

SELECT d.dept_name, dept_avg.avg_marks
FROM (SELECT dept_id, ROUND(AVG(marks), 1) AS avg_marks
      FROM students
      GROUP BY dept_id) AS dept_avg
JOIN departments d ON d.dept_id = dept_avg.dept_id
WHERE dept_avg.avg_marks > 70
ORDER BY dept_avg.avg_marks DESC;`,
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
SELECT c.course_name,
       (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.course_id) AS students
FROM courses c
ORDER BY students DESC, c.course_name;
SELECT d.dept_name, dept_avg.avg_marks
FROM (SELECT dept_id, ROUND(AVG(marks), 1) AS avg_marks
      FROM students
      GROUP BY dept_id) AS dept_avg
JOIN departments d ON d.dept_id = dept_avg.dept_id
WHERE dept_avg.avg_marks > 70
ORDER BY dept_avg.avg_marks DESC;`,
      result: ">> SELECT c.course_name,\n+---------------------+----------+\n| course_name         | students |\n+---------------------+----------+\n| Database Systems    | 3        |\n| Digital Electronics | 2        |\n| Machine Learning    | 2        |\n| Python Programming  | 2        |\n| Thermodynamics      | 2        |\n| Structural Analysis | 1        |\n| Marketing Basics    | 0        |\n+---------------------+----------+\n7 row(s) returned\n>> SELECT d.dept_name, dept_avg.avg_marks\n+------------------+-----------+\n| dept_name        | avg_marks |\n+------------------+-----------+\n| Computer Science | 91.7      |\n| Electronics      | 78.0      |\n| Civil            | 72.0      |\n+------------------+-----------+\n3 row(s) returned",
      explanation: 'The scalar subquery runs per course. The derived table dept_avg is computed first, then joined to departments; Mechanical (62.5) is filtered out.',
    },
    {
      title: 'E-commerce: products never ordered and big spenders',
      scenario: 'Find products that were never ordered, and customers whose total spend is higher than the average customer spend.',
      steps: ['Open a new query tab', 'Paste the script (creates ecommerce) and press Ctrl+Shift+Enter', 'Read Result 1 and Result 2'],
      code: `SELECT name FROM products
WHERE product_id NOT IN (SELECT product_id FROM order_items);

SELECT t.name, t.total_spent
FROM (SELECT c.name, SUM(oi.qty * oi.unit_price) AS total_spent
      FROM customers c
      JOIN orders o ON o.customer_id = c.customer_id
      JOIN order_items oi ON oi.order_id = o.order_id
      GROUP BY c.customer_id, c.name) AS t
WHERE t.total_spent > (SELECT AVG(x.s)
                       FROM (SELECT SUM(oi.qty * oi.unit_price) AS s
                             FROM orders o
                             JOIN order_items oi ON oi.order_id = o.order_id
                             GROUP BY o.customer_id) AS x)
ORDER BY t.total_spent DESC;`,
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
SELECT name FROM products
WHERE product_id NOT IN (SELECT product_id FROM order_items);
SELECT t.name, t.total_spent
FROM (SELECT c.name, SUM(oi.qty * oi.unit_price) AS total_spent
      FROM customers c
      JOIN orders o ON o.customer_id = c.customer_id
      JOIN order_items oi ON oi.order_id = o.order_id
      GROUP BY c.customer_id, c.name) AS t
WHERE t.total_spent > (SELECT AVG(x.s)
                       FROM (SELECT SUM(oi.qty * oi.unit_price) AS s
                             FROM orders o
                             JOIN order_items oi ON oi.order_id = o.order_id
                             GROUP BY o.customer_id) AS x)
ORDER BY t.total_spent DESC;`,
      result: ">> SELECT name FROM products\n+------+\n| name |\n+------+\n+------+\n0 row(s) returned\n>> SELECT t.name, t.total_spent\n+--------------+-------------+\n| name         | total_spent |\n+--------------+-------------+\n| Neha Gupta   | 90300       |\n| Rahul Khanna | 80100       |\n+--------------+-------------+\n2 row(s) returned",
      explanation: 'Every product has been ordered at least once, so the first query returns an empty grid. Average spend per ordering customer is 39,860; Neha (90,300) and Rahul (80,100) are above it. Nested derived tables each need an alias (t, x).',
    },
  ],
  interview: [
    { q: 'What is a subquery?', a: 'A SELECT statement nested inside another statement (SELECT, INSERT, UPDATE, DELETE), written in parentheses. The inner result is used by the outer query.', level: 'Easy' },
    { q: 'Difference between a correlated and a non-correlated subquery?', a: 'A non-correlated subquery is independent and runs once. A correlated subquery references a column of the outer query and is evaluated for each outer row.', level: 'Medium' },
    { q: 'What does Error 1242 "Subquery returns more than 1 row" mean?', a: 'A subquery used with a single-value operator (=, >, <) returned several rows. Use IN / ANY / ALL, or make the subquery return one value (aggregate, LIMIT 1, better filter).', level: 'Easy' },
    { q: 'Why can NOT IN return no rows at all?', a: 'If the subquery list contains NULL, x NOT IN (..., NULL) evaluates to UNKNOWN for every row. Filter NULLs with WHERE col IS NOT NULL or use NOT EXISTS.', level: 'Hard' },
    { q: 'What is a derived table?', a: 'A subquery in the FROM clause. It produces a temporary result set used like a table. MySQL requires an alias for it (Error 1248 otherwise).', level: 'Medium' },
    { q: 'How do you find the second highest salary using a subquery?', a: 'SELECT MAX(salary) FROM faculty WHERE salary < (SELECT MAX(salary) FROM faculty);', level: 'Medium' },
    { q: 'What is MySQL Error 1093 and how do you fix it?', a: 'You cannot modify a table and select from the same table in a subquery. Wrap the subquery in another derived table (SELECT ... FROM (subquery) AS t) or rewrite with a JOIN / temporary table.', level: 'Hard' },
    { q: 'Subquery vs JOIN: which to use?', a: 'Use JOIN when you need columns from multiple tables; use IN/EXISTS subqueries to filter. In MySQL 8 the optimizer converts many IN subqueries to semi-joins, so performance is often equal. Check with EXPLAIN.', level: 'Medium' },
    { q: 'Can a subquery be used in the SELECT list?', a: 'Yes, as long as it is scalar (one value per outer row), e.g. (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id) AS order_count.', level: 'Easy' },
    { q: 'Can you use ORDER BY inside a subquery?', a: 'It is allowed but usually ignored unless combined with LIMIT, because a derived table is an unordered set. Put ORDER BY in the outer query.', level: 'Medium' },
  ],
  practice: [
    { task: 'Find the faculty member(s) with the highest salary.', hint: 'Scalar subquery with MAX.', solution: `SELECT name, salary FROM faculty
WHERE salary = (SELECT MAX(salary) FROM faculty);` },
    { task: 'Find the second highest faculty salary.', hint: 'MAX of salaries lower than the MAX.', solution: `SELECT MAX(salary) AS second_highest
FROM faculty
WHERE salary < (SELECT MAX(salary) FROM faculty);` },
    { task: 'List courses that have at least one student with grade C or D.', hint: 'IN with a subquery on enrollments.', solution: `SELECT course_name FROM courses
WHERE course_id IN (SELECT course_id FROM enrollments WHERE grade IN ('C','D'));` },
    { task: 'Show faculty who earn more than the average salary of their own department.', hint: 'Correlated subquery on dept_id.', solution: `SELECT f.name, f.dept_id, f.salary
FROM faculty f
WHERE f.salary > (SELECT AVG(f2.salary) FROM faculty f2 WHERE f2.dept_id = f.dept_id);` },
    { task: 'Using a derived table, show the department with the highest number of students.', hint: 'Count per dept in FROM, then ORDER BY ... LIMIT 1.', solution: `SELECT t.dept_id, t.cnt
FROM (SELECT dept_id, COUNT(*) AS cnt FROM students
      WHERE dept_id IS NOT NULL GROUP BY dept_id) AS t
ORDER BY t.cnt DESC
LIMIT 1;` },
  ],
  quiz: [
    { question: 'Which error do you get if a derived table has no alias?', options: ['1062', '1248', '1175', '1452'], answer: 1, explanation: 'Error 1248: Every derived table must have its own alias.' },
    { question: 'A subquery that references a column from the outer query is called:', options: ['Scalar subquery', 'Derived table', 'Inline view', 'Correlated subquery'], answer: 3, explanation: 'It is correlated with the outer row.' },
    { question: 'What does WHERE x NOT IN (1, 2, NULL) return?', options: ['No rows', 'Rows where x is 3 or more', 'Rows where x is NULL', 'An error'], answer: 0, explanation: 'Comparison with NULL is UNKNOWN, so NOT IN never becomes TRUE.' },
    { question: 'Which operator is correct for a subquery returning many rows?', options: ['=', '>', 'IN', '<>'], answer: 2, explanation: 'IN accepts a list of values.' },
    { question: 'Where is a subquery NOT allowed?', options: ['In the WHERE clause', 'In the FROM clause', 'In the SELECT list', 'As the table name in CREATE TABLE ... (col INT)'], answer: 3, explanation: 'Subqueries can appear in WHERE, FROM, SELECT, HAVING and DML, not as a table definition name.' },
  ],
};
