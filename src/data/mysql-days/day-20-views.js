export default {
  id: 'mysql-day-20',
  title: 'Views: Create, Use, Update, Drop (and Views in Workbench Navigator)',
  module: 'Module 5: Advanced MySQL',
  day: 20,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'A view is a saved SELECT query that behaves like a virtual table. Learn to create, query, replace, alter and drop views, which views are updatable, WITH CHECK OPTION, using views for security, and how to create and edit views from the Workbench Navigator.',
  objectives: [
    'Create views with CREATE VIEW and CREATE OR REPLACE VIEW',
    'Query, alter and drop views and list them with SHOW FULL TABLES',
    'Identify updatable views and use WITH CHECK OPTION',
    'Use views to simplify complex joins and hide sensitive columns',
    'Create and edit a view through the MySQL Workbench Navigator',
  ],
  theory: [
    {
      heading: '1. What is a view?',
      content: 'A view is a named, stored SELECT statement. It does not store data itself (it is a virtual table); every time you query the view, MySQL runs the underlying SELECT on the base tables. So a view always shows the latest data.',
      points: [
        'Simplicity: hide a long 4-table join behind a short name',
        'Security: show only some columns/rows (e.g. hide salary) and GRANT SELECT on the view only',
        'Consistency: everyone uses the same business logic (e.g. how "revenue" is calculated)',
        'Abstraction: base tables can change while the view name stays the same for reports',
      ],
    },
    {
      heading: '2. Creating and using views',
      content: 'Use CREATE VIEW name AS SELECT ... . Afterwards use the view in FROM exactly like a table: you can filter, sort, group and even join it with other tables or views.',
      syntax: `CREATE VIEW v_student_directory AS
SELECT s.student_id, s.name, s.city, d.dept_name
FROM students s
LEFT JOIN departments d ON d.dept_id = s.dept_id;

SELECT * FROM v_student_directory WHERE city = 'Pune';`,
      tip: 'Name views with a prefix such as v_ or vw_ so they are easy to tell apart from tables.',
    },
    {
      heading: '3. Changing and removing views',
      content: 'CREATE OR REPLACE VIEW creates the view, or replaces its definition if it already exists. ALTER VIEW changes the definition of an existing view. DROP VIEW [IF EXISTS] removes only the view, never the data in the base tables. SHOW CREATE VIEW shows the stored definition, and SHOW FULL TABLES lists views with Table_type = VIEW.',
      syntax: `CREATE OR REPLACE VIEW v_student_directory AS
SELECT student_id, name, city FROM students;

ALTER VIEW v_student_directory AS
SELECT student_id, name, city, marks FROM students;

SHOW CREATE VIEW v_student_directory;
SHOW FULL TABLES WHERE Table_type = 'VIEW';
DROP VIEW IF EXISTS v_student_directory;`,
    },
    {
      heading: '4. Updatable views and WITH CHECK OPTION',
      content: 'A view is updatable (you can INSERT/UPDATE/DELETE through it) when each view row maps to exactly one base-table row. A view is NOT updatable if it uses aggregate functions, DISTINCT, GROUP BY, HAVING, UNION, a subquery in the SELECT list, or certain joins. WITH CHECK OPTION prevents changes through the view that would make the row disappear from the view.',
      syntax: `CREATE OR REPLACE VIEW v_cs_students AS
SELECT student_id, name, dept_id, marks
FROM students
WHERE dept_id = 1
WITH CHECK OPTION;

UPDATE v_cs_students SET marks = 90 WHERE student_id = 1;   -- OK
UPDATE v_cs_students SET dept_id = 2 WHERE student_id = 1;  -- Error 1369 CHECK OPTION failed`,
      points: [
        'Updating a view really updates the base table',
        'Aggregate/GROUP BY views are read-only (Error 1288: The target table ... is not updatable)',
        'The browser Workbench Lab treats all views as read-only and does not support CREATE OR REPLACE / ALTER VIEW / WITH CHECK OPTION; run those in real MySQL',
      ],
    },
    {
      heading: '5. Views in the Workbench Navigator',
      content: 'In the Navigator (left panel) expand Schemas > college > Views. Right-click Views > Create View... to open a view editor tab with a template "CREATE VIEW new_view AS". Write the SELECT, click Apply, review the generated SQL in the Apply SQL Script dialog, click Apply again and then Finish. To edit an existing view, right-click it > Alter View...; to see data, right-click > Select Rows - Limit 1000; to delete, right-click > Drop View... > Drop Now.',
      points: [
        'Click the refresh icon next to SCHEMAS if a new view does not appear',
        'Views show a different icon from tables in the Navigator',
        'Hovering a view and clicking the small "i" icon shows its information and DDL',
      ],
    },
    {
      heading: '6. Performance notes',
      content: 'A view is not faster than its query, because MySQL simply merges the view definition into your query (MERGE algorithm) or builds a temporary table (TEMPTABLE algorithm for GROUP BY/DISTINCT views). Indexes on the base tables are what make views fast. MySQL does not have materialized views; you can simulate them with a summary table refreshed by an event or procedure.',
    },
  ],
  examples: [
    {
      title: 'Create and query a simple directory view',
      scenario: 'The front office needs a student directory with department names but without marks.',
      steps: [
        'In MySQL Workbench: open the Local instance MySQL80 connection',
        'File > New Query Tab',
        'Paste the script and press Ctrl+Shift+Enter',
        'In the Navigator, right-click SCHEMAS > Refresh All, then expand college > Views to see v_student_directory',
      ],
      code: `CREATE VIEW v_student_directory AS
SELECT s.student_id, s.name, s.city, d.dept_name
FROM students s
LEFT JOIN departments d ON d.dept_id = s.dept_id;

SELECT * FROM v_student_directory WHERE city = 'Pune';`,
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
DROP VIEW IF EXISTS v_student_directory;
CREATE VIEW v_student_directory AS
SELECT s.student_id, s.name, s.city, d.dept_name
FROM students s
LEFT JOIN departments d ON d.dept_id = s.dept_id;
SELECT * FROM v_student_directory WHERE city = 'Pune';`,
      result: ">> DROP VIEW IF EXISTS v_student_directory -> 0 row(s) affected\n>> CREATE VIEW v_student_directory AS -> 0 row(s) affected\n>> SELECT * FROM v_student_directory WHERE city = 'Pune'\n+------------+--------------+------+------------------+\n| student_id | name         | city | dept_name        |\n+------------+--------------+------+------------------+\n| 1          | Aarav Sharma | Pune | Computer Science |\n| 5          | Kabir Singh  | Pune | Mechanical       |\n| 10         | Priya Desai  | Pune | NULL             |\n+------------+--------------+------+------------------+\n3 row(s) returned",
      explanation: 'The view stores only the query. Selecting from it with WHERE city = \'Pune\' runs the join and returns 3 Pune students; marks are not exposed.',
    },
    {
      title: 'A reporting view built on a 4-table join',
      scenario: 'The registrar runs the enrollment report daily. Save the join as a view and query it in different ways.',
      steps: ['Open a new query tab', 'Paste and execute the script', 'Result 1 filters the view, Result 2 groups it'],
      code: `CREATE VIEW v_enrollment_report AS
SELECT s.name AS student, c.course_name, d.dept_name, e.grade, c.fee
FROM enrollments e
JOIN students s    ON s.student_id = e.student_id
JOIN courses c     ON c.course_id  = e.course_id
JOIN departments d ON d.dept_id    = c.dept_id;

SELECT student, course_name, grade
FROM v_enrollment_report
WHERE grade = 'A'
ORDER BY student;

SELECT dept_name, COUNT(*) AS enrollments, SUM(fee) AS fee_collected
FROM v_enrollment_report
GROUP BY dept_name
ORDER BY fee_collected DESC;`,
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
DROP VIEW IF EXISTS v_enrollment_report;
CREATE VIEW v_enrollment_report AS
SELECT s.name AS student, c.course_name, d.dept_name, e.grade, c.fee
FROM enrollments e
JOIN students s    ON s.student_id = e.student_id
JOIN courses c     ON c.course_id  = e.course_id
JOIN departments d ON d.dept_id    = c.dept_id;
SELECT student, course_name, grade
FROM v_enrollment_report
WHERE grade = 'A'
ORDER BY student;
SELECT dept_name, COUNT(*) AS enrollments, SUM(fee) AS fee_collected
FROM v_enrollment_report
GROUP BY dept_name
ORDER BY fee_collected DESC;`,
      result: ">> DROP VIEW IF EXISTS v_enrollment_report -> 0 row(s) affected\n>> CREATE VIEW v_enrollment_report AS -> 0 row(s) affected\n>> SELECT student, course_name, grade\n+--------------+---------------------+-------+\n| student      | course_name         | grade |\n+--------------+---------------------+-------+\n| Aarav Sharma | Database Systems    | A     |\n| Ananya Rao   | Database Systems    | A     |\n| Ananya Rao   | Machine Learning    | A     |\n| Diya Patel   | Database Systems    | A     |\n| Diya Patel   | Machine Learning    | A     |\n| Sneha Iyer   | Digital Electronics | A     |\n+--------------+---------------------+-------+\n6 row(s) returned\n>> SELECT dept_name, COUNT(*) AS enrollments, SUM(fee) AS fee_collected\n+------------------+-------------+---------------+\n| dept_name        | enrollments | fee_collected |\n+------------------+-------------+---------------+\n| Computer Science | 7           | 105000        |\n| Electronics      | 2           | 28000         |\n| Mechanical       | 2           | 22000         |\n| Civil            | 1           | 13000         |\n+------------------+-------------+---------------+\n4 row(s) returned",
      explanation: 'Once the join is saved as a view, report writers only need simple SELECTs. The view can be filtered, grouped and sorted like a normal table.',
    },
    {
      title: 'Security view: hide faculty salary, then list and drop views',
      scenario: 'Students may see faculty names and departments but not salaries. Create the view, list all views, then drop one.',
      steps: [
        'Open a new query tab, paste the script and execute',
        'Result 1 shows the public view; Result 2 lists base tables and views (Table_type)',
        'In the Navigator you can also right-click a view > Drop View... > Drop Now',
      ],
      code: `CREATE VIEW v_faculty_public AS
SELECT f.name, d.dept_name
FROM faculty f
LEFT JOIN departments d ON d.dept_id = f.dept_id;

SELECT * FROM v_faculty_public ORDER BY dept_name, name;
SHOW FULL TABLES;
DROP VIEW v_faculty_public;
SHOW FULL TABLES;`,
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
DROP VIEW IF EXISTS v_faculty_public;
CREATE VIEW v_faculty_public AS
SELECT f.name, d.dept_name
FROM faculty f
LEFT JOIN departments d ON d.dept_id = f.dept_id;
SELECT * FROM v_faculty_public ORDER BY dept_name, name;
SHOW FULL TABLES;
DROP VIEW v_faculty_public;
SHOW FULL TABLES;`,
      result: ">> DROP VIEW IF EXISTS v_faculty_public -> 0 row(s) affected\n>> CREATE VIEW v_faculty_public AS -> 0 row(s) affected\n>> SELECT * FROM v_faculty_public ORDER BY dept_name, name\n+--------------+------------------+\n| name         | dept_name        |\n+--------------+------------------+\n| Prof. Pillai | NULL             |\n| Dr. Rao      | Computer Science |\n| Prof. Gupta  | Computer Science |\n| Prof. Khan   | Computer Science |\n| Dr. Menon    | Electronics      |\n| Prof. Bose   | Electronics      |\n| Dr. Kulkarni | Mechanical       |\n| Prof. Das    | Mechanical       |\n+--------------+------------------+\n8 row(s) returned\n>> SHOW FULL TABLES\n+-------------------+------------+\n| Tables_in_college | Table_type |\n+-------------------+------------+\n| courses           | BASE TABLE |\n| departments       | BASE TABLE |\n| enrollments       | BASE TABLE |\n| faculty           | BASE TABLE |\n| students          | BASE TABLE |\n| v_faculty_public  | VIEW       |\n+-------------------+------------+\n6 row(s) returned\n>> DROP VIEW v_faculty_public -> 0 row(s) affected\n>> SHOW FULL TABLES\n+-------------------+------------+\n| Tables_in_college | Table_type |\n+-------------------+------------+\n| courses           | BASE TABLE |\n| departments       | BASE TABLE |\n| enrollments       | BASE TABLE |\n| faculty           | BASE TABLE |\n| students          | BASE TABLE |\n+-------------------+------------+\n5 row(s) returned",
      explanation: 'A user who is granted SELECT only on v_faculty_public (Day 28) can never read salary. SHOW FULL TABLES marks the view with Table_type VIEW; after DROP VIEW it is gone but the faculty table and its data are untouched.',
    },
    {
      title: 'Updatable view with WITH CHECK OPTION (real MySQL)',
      scenario: 'The CS department office may edit marks of CS students only, through a view.',
      steps: [
        'In real MySQL Workbench open a new query tab (this example needs the full MySQL server, not the browser Lab)',
        'Run the CREATE OR REPLACE VIEW statement with Ctrl+Enter',
        'Run each UPDATE one at a time with Ctrl+Enter and watch the Action Output panel',
      ],
      code: `USE college;
CREATE OR REPLACE VIEW v_cs_students AS
SELECT student_id, name, dept_id, marks
FROM students
WHERE dept_id = 1
WITH CHECK OPTION;

UPDATE v_cs_students SET marks = 90 WHERE student_id = 1;
SELECT name, marks FROM students WHERE student_id = 1;

UPDATE v_cs_students SET dept_id = 2 WHERE student_id = 1;

CREATE OR REPLACE VIEW v_dept_avg AS
SELECT dept_id, AVG(marks) AS avg_marks FROM students GROUP BY dept_id;
UPDATE v_dept_avg SET avg_marks = 80 WHERE dept_id = 1;`,
      result: `Action Output (MySQL 8.0):
#  Action                                              Message
1  CREATE OR REPLACE VIEW v_cs_students AS ...         0 row(s) affected
2  UPDATE v_cs_students SET marks = 90 WHERE ...       1 row(s) affected Rows matched: 1  Changed: 1  Warnings: 0
3  SELECT name, marks FROM students WHERE ...          1 row(s) returned   -> Aarav Sharma | 90
4  UPDATE v_cs_students SET dept_id = 2 WHERE ...      Error Code: 1369. CHECK OPTION failed 'college.v_cs_students'
5  CREATE OR REPLACE VIEW v_dept_avg AS ...            0 row(s) affected
6  UPDATE v_dept_avg SET avg_marks = 80 WHERE ...      Error Code: 1288. The target table v_dept_avg of the UPDATE is not updatable`,
      explanation: 'Updating marks through the view changes the students table. Moving the student to dept 2 would remove the row from the view, so WITH CHECK OPTION rejects it (1369). A GROUP BY view is never updatable (1288).',
    },
    {
      title: 'Create a view with the Workbench GUI (Navigator)',
      scenario: 'Create v_order_totals in the ecommerce schema without typing CREATE VIEW yourself, then use it.',
      steps: [
        'Navigator > Schemas: expand ecommerce, right-click Views > Create View...',
        'A new tab "new_view - View" opens with: CREATE VIEW new_view AS',
        'Replace it with the CREATE VIEW statement shown in the code box (name v_order_totals)',
        'Click Apply (bottom right). The "Apply SQL Script to Database" dialog shows the generated SQL: CREATE ALGORITHM=UNDEFINED DEFINER=root@localhost SQL SECURITY DEFINER VIEW v_order_totals AS ...',
        'Click Apply, then Finish. Refresh the Navigator: Views > v_order_totals appears',
        'Right-click v_order_totals > Select Rows - Limit 1000 to see the data (or run the SELECT in a query tab)',
      ],
      code: `CREATE VIEW v_order_totals AS
SELECT o.order_id, c.name AS customer, o.status,
       SUM(oi.qty * oi.unit_price) AS order_total
FROM orders o
JOIN customers c   ON c.customer_id = o.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY o.order_id, c.name, o.status;

SELECT * FROM v_order_totals WHERE status = 'DELIVERED' ORDER BY order_total DESC;`,
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
DROP VIEW IF EXISTS v_order_totals;
CREATE VIEW v_order_totals AS
SELECT o.order_id, c.name AS customer, o.status,
       SUM(oi.qty * oi.unit_price) AS order_total
FROM orders o
JOIN customers c   ON c.customer_id = o.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY o.order_id, c.name, o.status;
SELECT * FROM v_order_totals WHERE status = 'DELIVERED' ORDER BY order_total DESC;`,
      result: ">> DROP VIEW IF EXISTS v_order_totals -> 0 row(s) affected\n>> CREATE VIEW v_order_totals AS -> 0 row(s) affected\n>> SELECT * FROM v_order_totals WHERE status = 'DELIVERED' ORDER BY order\n+----------+--------------+-----------+-------------+\n| order_id | customer     | status    | order_total |\n+----------+--------------+-----------+-------------+\n| 6        | Neha Gupta   | DELIVERED | 82000       |\n| 1        | Rahul Khanna | DELIVERED | 76600       |\n| 4        | Amit Shah    | DELIVERED | 22000       |\n| 2        | Neha Gupta   | DELIVERED | 8300        |\n| 8        | Amit Shah    | DELIVERED | 2000        |\n+----------+--------------+-----------+-------------+\n5 row(s) returned",
      explanation: 'The GUI only generates and runs the same CREATE VIEW statement. The view returns one row per order with its total; because it uses GROUP BY it is read-only.',
    },
  ],
  interview: [
    { q: 'What is a view?', a: 'A virtual table defined by a stored SELECT query. It does not store data; the query runs against base tables each time the view is used.', level: 'Easy' },
    { q: 'Why use views?', a: 'To simplify complex queries, restrict access to certain columns/rows (security), keep business logic consistent and provide a stable interface when base tables change.', level: 'Easy' },
    { q: 'Does a view store data? Does dropping it delete data?', a: 'No and no. A view stores only its definition. DROP VIEW removes the definition; base table data is unchanged.', level: 'Easy' },
    { q: 'When is a view updatable in MySQL?', a: 'When each row of the view maps to one row in one base table: no aggregates, DISTINCT, GROUP BY, HAVING, UNION, subqueries in the select list, and no TEMPTABLE algorithm.', level: 'Medium' },
    { q: 'What does WITH CHECK OPTION do?', a: 'It rejects INSERT/UPDATE through the view if the resulting row would not satisfy the view WHERE condition (Error 1369 CHECK OPTION failed).', level: 'Medium' },
    { q: 'Difference between CREATE OR REPLACE VIEW and ALTER VIEW?', a: 'CREATE OR REPLACE creates the view if missing or replaces it if present. ALTER VIEW only changes an existing view and fails if it does not exist.', level: 'Medium' },
    { q: 'Does MySQL support materialized views?', a: 'No. Simulate them with a summary table refreshed by a scheduled event, a stored procedure or triggers.', level: 'Hard' },
    { q: 'Is a view faster than the underlying query?', a: 'No. With the MERGE algorithm the view text is merged into your query; with TEMPTABLE a temporary table is built. Performance depends on base-table indexes.', level: 'Medium' },
    { q: 'How do you see the definition of a view?', a: 'SHOW CREATE VIEW view_name; or query information_schema.VIEWS; in Workbench right-click the view > Alter View... or Copy to Clipboard > Create Statement.', level: 'Easy' },
    { q: 'What happens to a view when a column it uses is dropped from the base table?', a: 'The view becomes invalid; selecting from it raises Error 1356 (View references invalid table(s) or column(s)). Recreate or alter the view.', level: 'Hard' },
    { q: 'What are DEFINER and SQL SECURITY in a view?', a: 'DEFINER is the account that owns the view. SQL SECURITY DEFINER (default) runs the view with the definer privileges; INVOKER uses the privileges of the user who queries the view.', level: 'Hard' },
  ],
  practice: [
    { task: 'Create a view v_toppers showing students with marks >= 85 and their department name.', hint: 'JOIN departments and filter in WHERE.', solution: `CREATE VIEW v_toppers AS
SELECT s.name, s.marks, d.dept_name
FROM students s
JOIN departments d ON d.dept_id = s.dept_id
WHERE s.marks >= 85;

SELECT * FROM v_toppers ORDER BY marks DESC;` },
    { task: 'Create a view v_course_stats with course name, number of students and fee earned per course.', hint: 'LEFT JOIN enrollments and GROUP BY course.', solution: `CREATE VIEW v_course_stats AS
SELECT c.course_name, COUNT(e.enroll_id) AS students, COUNT(e.enroll_id) * c.fee AS fee_earned
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name, c.fee;` },
    { task: 'Change v_toppers so it also shows the city (use CREATE OR REPLACE).', hint: 'Repeat the whole SELECT with the new column.', solution: `CREATE OR REPLACE VIEW v_toppers AS
SELECT s.name, s.city, s.marks, d.dept_name
FROM students s
JOIN departments d ON d.dept_id = s.dept_id
WHERE s.marks >= 85;` },
    { task: 'List all views in the college database and then drop v_course_stats safely.', hint: 'SHOW FULL TABLES and DROP VIEW IF EXISTS.', solution: `SHOW FULL TABLES WHERE Table_type = 'VIEW';
DROP VIEW IF EXISTS v_course_stats;` },
    { task: 'In ecommerce create v_low_stock showing products with stock < 20 and query it.', hint: 'Simple single-table view (updatable).', solution: `CREATE VIEW v_low_stock AS
SELECT product_id, name, stock FROM products WHERE stock < 20;
SELECT * FROM v_low_stock;` },
  ],
  quiz: [
    { question: 'What does a view store?', options: ['A copy of the data', 'Only the SELECT definition', 'An index', 'A backup'], answer: 1, explanation: 'Views are virtual; only the query is stored.' },
    { question: 'Which view is NOT updatable?', options: ['SELECT id, name FROM t', 'SELECT * FROM t WHERE x > 5', 'SELECT dept, COUNT(*) FROM t GROUP BY dept', 'SELECT id, name, city FROM t'], answer: 2, explanation: 'Aggregates and GROUP BY make a view read-only.' },
    { question: 'Which error appears when WITH CHECK OPTION blocks an update?', options: ['1175', '1062', '1146', '1369'], answer: 3, explanation: 'Error 1369: CHECK OPTION failed.' },
    { question: 'In Workbench, where do you right-click to create a view with the GUI?', options: ['Schemas > database > Views', 'Administration > Users and Privileges', 'Server > Data Export', 'Help > About'], answer: 0, explanation: 'Right-click the Views node under the schema and choose Create View...' },
    { question: 'Which statement lists views together with their type?', options: ['SHOW VIEWS', 'SHOW FULL TABLES', 'DESCRIBE VIEWS', 'LIST VIEWS'], answer: 1, explanation: 'SHOW FULL TABLES adds a Table_type column (BASE TABLE / VIEW).' },
  ],
};
