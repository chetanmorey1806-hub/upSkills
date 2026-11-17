export default {
  id: 'mysql-day-23',
  title: 'Stored Functions and Triggers (BEFORE/AFTER, NEW/OLD), Audit Log',
  module: 'Module 5: Advanced MySQL',
  day: 23,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Stored functions return a single value and can be used inside SELECT just like built-in functions. Triggers run automatically BEFORE or AFTER an INSERT, UPDATE or DELETE on a table. Learn DETERMINISTIC / READS SQL DATA, the NEW and OLD row references, validation triggers, stock-maintenance triggers and a complete audit-log example, plus how to manage both in Workbench.',
  objectives: [
    'Create stored functions with RETURNS, RETURN and the DETERMINISTIC / READS SQL DATA characteristics',
    'Use a stored function in SELECT, WHERE and ORDER BY',
    'Write BEFORE and AFTER triggers for INSERT, UPDATE and DELETE using NEW and OLD',
    'Build an audit log table filled by triggers',
    'View, create and drop triggers and functions in MySQL Workbench',
  ],
  theory: [
    {
      heading: '1. Stored functions',
      content: 'A stored function is a routine that takes IN parameters only and returns exactly one value with RETURN. Unlike a procedure, it is used inside expressions: SELECT fn_grade(marks) FROM students. Since binary logging is on by default in MySQL 8, you must declare at least one characteristic: DETERMINISTIC (same input always gives same output), NO SQL, READS SQL DATA or MODIFIES SQL DATA. Otherwise you get Error 1418.',
      syntax: `DELIMITER $$
CREATE FUNCTION fn_grade(p_marks INT)
RETURNS VARCHAR(2)
DETERMINISTIC
BEGIN
    RETURN CASE
        WHEN p_marks >= 90 THEN 'O'
        WHEN p_marks >= 80 THEN 'A+'
        WHEN p_marks >= 70 THEN 'A'
        WHEN p_marks >= 60 THEN 'B'
        ELSE 'C'
    END;
END$$
DELIMITER ;`,
    },
    {
      heading: '2. Procedure vs function',
      content: 'Choose a function when you need a calculated value inside a query; choose a procedure for multi-step business operations.',
      points: [
        'Function: RETURNS one value, called inside SELECT/WHERE, only IN parameters, no transactions (no COMMIT/ROLLBACK), cannot return a result set',
        'Procedure: called with CALL, IN/OUT/INOUT parameters, can return result sets, can use transactions',
        'Drop with DROP FUNCTION IF EXISTS name; list with SHOW FUNCTION STATUS WHERE Db = \'college\';',
      ],
    },
    {
      heading: '3. What is a trigger?',
      content: 'A trigger is a block of SQL attached to a table that MySQL runs automatically when a row is inserted, updated or deleted. Each trigger has a timing (BEFORE or AFTER) and an event (INSERT, UPDATE, DELETE), giving 6 combinations. FOR EACH ROW means it runs once per affected row.',
      syntax: `CREATE TRIGGER trigger_name
{BEFORE | AFTER} {INSERT | UPDATE | DELETE}
ON table_name
FOR EACH ROW
BEGIN
    -- statements using NEW.col / OLD.col
END;`,
      points: [
        'BEFORE triggers: validate or modify the incoming row (SET NEW.col = ...), or block it with SIGNAL',
        'AFTER triggers: react to a completed change (audit log, update summary/stock tables)',
        'MySQL 8 allows several triggers with the same timing/event; use FOLLOWS / PRECEDES to set order',
        'TRUNCATE TABLE does NOT fire DELETE triggers',
      ],
    },
    {
      heading: '4. NEW and OLD',
      content: 'Inside a trigger NEW refers to the row after the change and OLD to the row before the change.',
      points: [
        'INSERT: only NEW exists',
        'DELETE: only OLD exists',
        'UPDATE: both OLD (before) and NEW (after) exist',
        'NEW.col can be changed only in a BEFORE trigger (SET NEW.email = LOWER(NEW.email))',
        'OLD is always read-only',
      ],
      tip: 'The browser Workbench Lab supports AFTER/BEFORE triggers whose body runs INSERT/UPDATE/DELETE statements. SET NEW.col, IF and SIGNAL inside triggers, and stored functions, need a real MySQL server.',
    },
    {
      heading: '5. Audit logging with triggers',
      content: 'An audit (history) table records who changed what and when. AFTER UPDATE and AFTER DELETE triggers insert OLD and NEW values, the action name, CURRENT_USER() and NOW() into the log. Because the trigger runs inside the same transaction, if the main statement is rolled back the log row is rolled back too.',
    },
    {
      heading: '6. Triggers and functions in Workbench',
      content: 'Triggers: Navigator > college > Tables > right-click students > Alter Table... > Triggers tab (bottom of the table editor). The left list shows BEFORE INSERT, AFTER INSERT, BEFORE UPDATE, etc. Click the + next to a timing to add a trigger, type the body, click Apply > Apply > Finish. In SQL use SHOW TRIGGERS FROM college; and DROP TRIGGER IF EXISTS name;. Functions: Navigator > college > Functions > right-click > Create Function... ; hover a function and click the lightning icon or right-click > Execute Function... to test it.',
      points: [
        'Keep triggers short and fast: they run for every row',
        'Avoid hidden business logic that developers forget exists; document triggers',
        'A trigger cannot modify the same table it is defined on (Error 1442)',
      ],
    },
  ],
  examples: [
    {
      title: 'Stored function: grade from marks (DETERMINISTIC)',
      scenario: 'Create fn_grade(marks) and use it in a SELECT to print the grade of every student.',
      steps: [
        'In real MySQL Workbench: open the connection, File > New Query Tab, run USE college;',
        'Paste the function code (with DELIMITER lines) and click ⚡ Execute',
        'Navigator > college > Functions: refresh to see fn_grade',
        'Run the SELECT that calls fn_grade(marks)',
        'Browser Lab: runs the same logic written as a CASE expression, which returns identical output',
      ],
      code: `DROP FUNCTION IF EXISTS fn_grade;
DELIMITER $$
CREATE FUNCTION fn_grade(p_marks INT)
RETURNS VARCHAR(2)
DETERMINISTIC
BEGIN
    RETURN CASE
        WHEN p_marks >= 90 THEN 'O'
        WHEN p_marks >= 80 THEN 'A+'
        WHEN p_marks >= 70 THEN 'A'
        WHEN p_marks >= 60 THEN 'B'
        ELSE 'C'
    END;
END$$
DELIMITER ;

SELECT name, marks, fn_grade(marks) AS grade
FROM students
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
SELECT name, marks,
       CASE
         WHEN marks >= 90 THEN 'O'
         WHEN marks >= 80 THEN 'A+'
         WHEN marks >= 70 THEN 'A'
         WHEN marks >= 60 THEN 'B'
         ELSE 'C'
       END AS grade
FROM students
ORDER BY marks DESC;`,
      result: ">> SELECT name, marks,\n+--------------+-------+-------+\n| name         | marks | grade |\n+--------------+-------+-------+\n| Ananya Rao   | 95    | O     |\n| Diya Patel   | 92    | O     |\n| Aarav Sharma | 88    | A+    |\n| Sneha Iyer   | 81    | A+    |\n| Priya Desai  | 79    | A     |\n| Rohan Verma  | 75    | A     |\n| Meera Nair   | 72    | A     |\n| Kabir Singh  | 67    | B     |\n| Arjun Mehta  | 64    | B     |\n| Vikram Joshi | 58    | C     |\n+--------------+-------+-------+\n10 row(s) returned",
      explanation: 'The function hides the CASE logic behind a name, so every report uses the same grading rule. DETERMINISTIC is correct because the same marks always give the same grade. In real MySQL the column header is "grade" and values are identical.',
    },
    {
      title: 'Function that reads tables: number of courses of a student',
      scenario: 'Create fn_course_count(student_id) (READS SQL DATA) and show students with their course count.',
      steps: [
        'Paste the code in a real MySQL query tab and execute',
        'Test a single value: SELECT fn_course_count(1); returns 2',
        'Or in the Navigator: hover fn_course_count > lightning icon > enter 1 > Execute',
        'Browser Lab: uses an equivalent correlated subquery',
      ],
      code: `DROP FUNCTION IF EXISTS fn_course_count;
DELIMITER $$
CREATE FUNCTION fn_course_count(p_student_id INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_cnt INT;
    SELECT COUNT(*) INTO v_cnt FROM enrollments WHERE student_id = p_student_id;
    RETURN v_cnt;
END$$
DELIMITER ;

SELECT name, fn_course_count(student_id) AS courses
FROM students
WHERE fn_course_count(student_id) >= 1
ORDER BY courses DESC, name;`,
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
SELECT name, (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = s.student_id) AS courses
FROM students s
WHERE (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = s.student_id) >= 1
ORDER BY courses DESC, name;`,
      result: ">> SELECT name, (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = \n+--------------+---------+\n| name         | courses |\n+--------------+---------+\n| Aarav Sharma | 2       |\n| Ananya Rao   | 2       |\n| Diya Patel   | 2       |\n| Arjun Mehta  | 1       |\n| Kabir Singh  | 1       |\n| Meera Nair   | 1       |\n| Rohan Verma  | 1       |\n| Sneha Iyer   | 1       |\n| Vikram Joshi | 1       |\n+--------------+---------+\n9 row(s) returned",
      explanation: 'READS SQL DATA tells MySQL the function only reads tables. Without any characteristic MySQL 8 raises Error 1418 (This function has none of DETERMINISTIC, NO SQL, or READS SQL DATA ...). Note that a function called in WHERE runs once per row, so on large tables a JOIN is faster.',
    },
    {
      title: 'Audit log: AFTER UPDATE and AFTER DELETE triggers',
      scenario: 'Every change to student marks and every deleted student must be recorded in a student_audit table.',
      steps: [
        'In MySQL Workbench open a new query tab',
        'Paste the full script (it creates college, the audit table and two triggers) and press Ctrl+Shift+Enter',
        'GUI check: Navigator > college > Tables > students > right-click Alter Table... > Triggers tab shows AFTER UPDATE and AFTER DELETE triggers',
      ],
      code: `CREATE TABLE student_audit (
  audit_id   INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  action     VARCHAR(10),
  old_marks  INT,
  new_marks  INT,
  changed_by VARCHAR(80),
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DELIMITER $$
CREATE TRIGGER trg_students_au
AFTER UPDATE ON students
FOR EACH ROW
BEGIN
    INSERT INTO student_audit (student_id, action, old_marks, new_marks, changed_by)
    VALUES (OLD.student_id, 'UPDATE', OLD.marks, NEW.marks, CURRENT_USER());
END$$

CREATE TRIGGER trg_students_ad
AFTER DELETE ON students
FOR EACH ROW
BEGIN
    INSERT INTO student_audit (student_id, action, old_marks, new_marks, changed_by)
    VALUES (OLD.student_id, 'DELETE', OLD.marks, NULL, CURRENT_USER());
END$$
DELIMITER ;

UPDATE students SET marks = marks + 5 WHERE dept_id = 3;
DELETE FROM students WHERE student_id = 10;
SELECT audit_id, student_id, action, old_marks, new_marks FROM student_audit;`,
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
DROP TABLE IF EXISTS student_audit;
CREATE TABLE student_audit (
  audit_id   INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  action     VARCHAR(10),
  old_marks  INT,
  new_marks  INT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
DELIMITER $$
CREATE TRIGGER trg_students_au
AFTER UPDATE ON students
FOR EACH ROW
BEGIN
    INSERT INTO student_audit (student_id, action, old_marks, new_marks)
    VALUES (OLD.student_id, 'UPDATE', OLD.marks, NEW.marks);
END$$
CREATE TRIGGER trg_students_ad
AFTER DELETE ON students
FOR EACH ROW
BEGIN
    INSERT INTO student_audit (student_id, action, old_marks, new_marks)
    VALUES (OLD.student_id, 'DELETE', OLD.marks, NULL);
END$$
DELIMITER ;
UPDATE students SET marks = marks + 5 WHERE dept_id = 3;
DELETE FROM students WHERE student_id = 10;
SELECT audit_id, student_id, action, old_marks, new_marks FROM student_audit;`,
      result: ">> DROP TABLE IF EXISTS student_audit -> 0 row(s) affected\n>> CREATE TABLE student_audit ( -> 0 row(s) affected\n>> CREATE TRIGGER trg_students_au -> 0 row(s) affected\n>> CREATE TRIGGER trg_students_ad -> 0 row(s) affected\n>> UPDATE students SET marks = marks + 5 WHERE dept_id = 3 -> 2 row(s) affected Rows matched: 2  Changed: 2  Warnings: 0\n>> DELETE FROM students WHERE student_id = 10 -> 1 row(s) affected\n>> SELECT audit_id, student_id, action, old_marks, new_marks FROM student\n+----------+------------+--------+-----------+-----------+\n| audit_id | student_id | action | old_marks | new_marks |\n+----------+------------+--------+-----------+-----------+\n| 1        | 5          | UPDATE | 67        | 72        |\n| 2        | 7          | UPDATE | 58        | 63        |\n| 3        | 10         | DELETE | 79        | NULL      |\n+----------+------------+--------+-----------+-----------+\n3 row(s) returned",
      explanation: 'The UPDATE changed 2 Mechanical students, so the AFTER UPDATE trigger fired twice (once per row). The DELETE fired the AFTER DELETE trigger, which saved the old marks. In real MySQL changed_by would show root@localhost. (The Lab version omits CURRENT_USER().)',
    },
    {
      title: 'Stock maintenance: AFTER INSERT and AFTER DELETE on order_items',
      scenario: 'When an item is added to an order, reduce product stock automatically; when it is removed, put the stock back.',
      steps: ['Open a new query tab', 'Paste the script (creates ecommerce) and press Ctrl+Shift+Enter', 'Compare the stock of product 2 after each step'],
      code: `DELIMITER $$
CREATE TRIGGER trg_items_ai AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products SET stock = stock - NEW.qty WHERE product_id = NEW.product_id;
END$$
CREATE TRIGGER trg_items_ad AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
    UPDATE products SET stock = stock + OLD.qty WHERE product_id = OLD.product_id;
END$$
DELIMITER ;

SELECT stock FROM products WHERE product_id = 2;      -- 200
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (7, 2, 5, 800.00);
SELECT stock FROM products WHERE product_id = 2;      -- 195
DELETE FROM order_items WHERE order_id = 7 AND product_id = 2;
SELECT stock FROM products WHERE product_id = 2;      -- 200`,
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
DELIMITER $$
CREATE TRIGGER trg_items_ai AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products SET stock = stock - NEW.qty WHERE product_id = NEW.product_id;
END$$
CREATE TRIGGER trg_items_ad AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
    UPDATE products SET stock = stock + OLD.qty WHERE product_id = OLD.product_id;
END$$
DELIMITER ;
SELECT product_id, name, stock FROM products WHERE product_id = 2;
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (7, 2, 5, 800.00);
SELECT product_id, name, stock FROM products WHERE product_id = 2;
DELETE FROM order_items WHERE order_id = 7 AND product_id = 2;
SELECT product_id, name, stock FROM products WHERE product_id = 2;`,
      result: ">> CREATE TRIGGER trg_items_ai AFTER INSERT ON order_items -> 0 row(s) affected\n>> CREATE TRIGGER trg_items_ad AFTER DELETE ON order_items -> 0 row(s) affected\n>> SELECT product_id, name, stock FROM products WHERE product_id = 2\n+------------+----------------+-------+\n| product_id | name           | stock |\n+------------+----------------+-------+\n| 2          | Wireless Mouse | 200   |\n+------------+----------------+-------+\n1 row(s) returned\n>> INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES -> 1 row(s) affected\n>> SELECT product_id, name, stock FROM products WHERE product_id = 2\n+------------+----------------+-------+\n| product_id | name           | stock |\n+------------+----------------+-------+\n| 2          | Wireless Mouse | 195   |\n+------------+----------------+-------+\n1 row(s) returned\n>> DELETE FROM order_items WHERE order_id = 7 AND product_id = 2 -> 1 row(s) affected\n>> SELECT product_id, name, stock FROM products WHERE product_id = 2\n+------------+----------------+-------+\n| product_id | name           | stock |\n+------------+----------------+-------+\n| 2          | Wireless Mouse | 200   |\n+------------+----------------+-------+\n1 row(s) returned",
      explanation: 'NEW.qty is available in the INSERT trigger and OLD.qty in the DELETE trigger. The application never has to remember to update stock: the database does it.',
    },
    {
      title: 'BEFORE INSERT / BEFORE UPDATE: clean and validate data (real MySQL)',
      scenario: 'Customer emails must be stored in lowercase and must contain @. Product prices may never be reduced by more than 50% in one update.',
      steps: [
        'In real MySQL Workbench run USE ecommerce; then paste and execute the code',
        'Run the statements one at a time (Ctrl+Enter) and watch the Action Output panel',
        'GUI: Navigator > ecommerce > Tables > customers > Alter Table... > Triggers tab > BEFORE INSERT shows trg_customers_bi',
      ],
      code: `DELIMITER $$
CREATE TRIGGER trg_customers_bi
BEFORE INSERT ON customers
FOR EACH ROW
BEGIN
    SET NEW.email = LOWER(TRIM(NEW.email));
    IF NEW.email NOT LIKE '%_@_%._%' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid email address';
    END IF;
    IF NEW.signup_date IS NULL THEN
        SET NEW.signup_date = CURDATE();
    END IF;
END$$

CREATE TRIGGER trg_products_bu
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.price < OLD.price * 0.5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Price cut above 50% not allowed';
    END IF;
END$$
DELIMITER ;

INSERT INTO customers (name, city, email) VALUES ('Ravi Kumar', 'Pune', '  RAVI@Mail.COM ');
SELECT name, email FROM customers WHERE name = 'Ravi Kumar';
INSERT INTO customers (name, city, email) VALUES ('Bad Data', 'Pune', 'not-an-email');
UPDATE products SET price = 30000 WHERE product_id = 1;
SHOW TRIGGERS FROM ecommerce;`,
      result: `INSERT ... 'Ravi Kumar'           1 row(s) affected
SELECT name, email ...
+------------+---------------+
| name       | email         |
+------------+---------------+
| Ravi Kumar | ravi@mail.com |
+------------+---------------+
INSERT ... 'Bad Data'             Error Code: 1644. Invalid email address
UPDATE products SET price = 30000 Error Code: 1644. Price cut above 50% not allowed
SHOW TRIGGERS FROM ecommerce      2 row(s) returned
+------------------+--------+-----------+--------+
| Trigger          | Event  | Table     | Timing |
+------------------+--------+-----------+--------+
| trg_customers_bi | INSERT | customers | BEFORE |
| trg_products_bu  | UPDATE | products  | BEFORE |
+------------------+--------+-----------+--------+`,
      explanation: 'BEFORE triggers can change NEW values (lowercase email, default date) before the row is written, or cancel the statement with SIGNAL. The laptop price 75000 -> 30000 is a 60% cut, so the update is rejected. SHOW TRIGGERS also returns columns like Statement, Created and sql_mode (hidden here).',
    },
  ],
  interview: [
    { q: 'What is the difference between a stored function and a stored procedure?', a: 'A function returns one value with RETURN and is used inside SQL expressions; it only takes IN parameters and cannot use transactions or return result sets. A procedure is executed with CALL, supports IN/OUT/INOUT, result sets and transactions.', level: 'Easy' },
    { q: 'What is Error 1418 when creating a function?', a: 'With binary logging enabled MySQL requires the function to declare DETERMINISTIC, NO SQL or READS SQL DATA (or log_bin_trust_function_creators=1). Add the correct characteristic.', level: 'Medium' },
    { q: 'What is a trigger?', a: 'A named block of SQL attached to a table that runs automatically BEFORE or AFTER an INSERT, UPDATE or DELETE, once for each affected row.', level: 'Easy' },
    { q: 'Explain NEW and OLD.', a: 'NEW is the row after the change (INSERT, UPDATE), OLD is the row before the change (UPDATE, DELETE). Only NEW can be modified, and only in BEFORE triggers.', level: 'Easy' },
    { q: 'When do you use BEFORE vs AFTER triggers?', a: 'BEFORE to validate or modify incoming data (SET NEW.col, SIGNAL). AFTER to perform follow-up actions once the change succeeded, such as audit logs or summary updates.', level: 'Medium' },
    { q: 'How many triggers can a table have?', a: 'In MySQL 5.7+ multiple triggers per timing and event are allowed (6 combinations, any number each); FOLLOWS/PRECEDES control their order.', level: 'Medium' },
    { q: 'Does TRUNCATE fire DELETE triggers?', a: 'No. TRUNCATE drops and recreates the table data without row-by-row deletes, so DELETE triggers do not fire.', level: 'Medium' },
    { q: 'Can a trigger update the same table it is defined on?', a: 'No. It gives Error 1442 (Can\'t update table in stored function/trigger because it is already used by statement). Use a BEFORE trigger with SET NEW.col instead.', level: 'Hard' },
    { q: 'If a trigger fails, what happens to the original statement?', a: 'For InnoDB the whole statement fails and is rolled back together with any changes the trigger made.', level: 'Medium' },
    { q: 'What are the disadvantages of triggers?', a: 'Hidden logic that is hard to debug, extra work on every row (slower bulk loads), possible cascading effects, and logic that is not visible in application code.', level: 'Medium' },
    { q: 'How do you list and remove triggers?', a: 'SHOW TRIGGERS FROM db; or SELECT * FROM information_schema.TRIGGERS; DROP TRIGGER IF EXISTS name; In Workbench: Alter Table > Triggers tab.', level: 'Easy' },
  ],
  practice: [
    { task: 'Create fn_full_fee(p_student_id) returning the total fee of all courses of a student, and use it in a SELECT.', hint: 'READS SQL DATA, SUM(c.fee).', solution: `DELIMITER $$
CREATE FUNCTION fn_full_fee(p_student_id INT)
RETURNS DECIMAL(10,2)
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(10,2);
    SELECT IFNULL(SUM(c.fee), 0) INTO v_total
    FROM enrollments e JOIN courses c ON c.course_id = e.course_id
    WHERE e.student_id = p_student_id;
    RETURN v_total;
END$$
DELIMITER ;
SELECT name, fn_full_fee(student_id) AS total_fee FROM students;` },
    { task: 'Create fn_age_band(p_days INT) that returns \'New\' for < 30, \'Regular\' for < 365 else \'Loyal\'.', hint: 'DETERMINISTIC with IF/ELSEIF.', solution: `DELIMITER $$
CREATE FUNCTION fn_age_band(p_days INT)
RETURNS VARCHAR(10)
DETERMINISTIC
BEGIN
    IF p_days < 30 THEN RETURN 'New';
    ELSEIF p_days < 365 THEN RETURN 'Regular';
    ELSE RETURN 'Loyal';
    END IF;
END$$
DELIMITER ;
SELECT name, fn_age_band(DATEDIFF(CURDATE(), signup_date)) FROM customers;` },
    { task: 'Write an AFTER INSERT trigger on enrollments that inserts a row into enrollment_log(student_id, course_id, logged_at).', hint: 'Use NEW.student_id and NOW().', solution: `CREATE TABLE enrollment_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT, course_id INT, logged_at DATETIME);
DELIMITER $$
CREATE TRIGGER trg_enroll_ai AFTER INSERT ON enrollments
FOR EACH ROW
BEGIN
    INSERT INTO enrollment_log (student_id, course_id, logged_at)
    VALUES (NEW.student_id, NEW.course_id, NOW());
END$$
DELIMITER ;` },
    { task: 'Write a BEFORE INSERT trigger on students that rejects marks outside 0-100.', hint: 'IF ... THEN SIGNAL.', solution: `DELIMITER $$
CREATE TRIGGER trg_students_bi BEFORE INSERT ON students
FOR EACH ROW
BEGIN
    IF NEW.marks < 0 OR NEW.marks > 100 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Marks must be between 0 and 100';
    END IF;
END$$
DELIMITER ;` },
    { task: 'Write a BEFORE UPDATE trigger on faculty that stores the name in proper case trimmed, and list triggers of college.', hint: 'SET NEW.name = TRIM(NEW.name); SHOW TRIGGERS.', solution: `DELIMITER $$
CREATE TRIGGER trg_faculty_bu BEFORE UPDATE ON faculty
FOR EACH ROW
BEGIN
    SET NEW.name = TRIM(NEW.name);
END$$
DELIMITER ;
SHOW TRIGGERS FROM college;` },
  ],
  quiz: [
    { question: 'Which keyword sends the value back from a stored function?', options: ['OUT', 'RETURN', 'SELECT INTO', 'EXIT'], answer: 1, explanation: 'Functions end with RETURN value.' },
    { question: 'In a DELETE trigger, which row reference is available?', options: ['OLD only', 'NEW only', 'Both NEW and OLD', 'Neither'], answer: 0, explanation: 'The deleted row is OLD; there is no NEW row.' },
    { question: 'Where can you change NEW.col values?', options: ['AFTER INSERT trigger', 'Any trigger', 'Only in stored procedures', 'BEFORE INSERT / BEFORE UPDATE trigger'], answer: 3, explanation: 'Values can be modified only before the row is written.' },
    { question: 'Which statement does NOT fire a DELETE trigger?', options: ['DELETE FROM t', 'DELETE FROM t WHERE id = 1', 'TRUNCATE TABLE t', 'DELETE t FROM t JOIN u ...'], answer: 2, explanation: 'TRUNCATE does not run row-level deletes.' },
    { question: 'Where do you see a table\'s triggers in Workbench?', options: ['Server > Status', 'Alter Table > Triggers tab', 'Database > Synchronize', 'Edit > Preferences'], answer: 1, explanation: 'The table editor has a Triggers tab.' },
  ],
};
