export default {
  id: 'mysql-day-22',
  title: 'Stored Procedures: DELIMITER, IN/OUT/INOUT, Variables, IF and Loops',
  module: 'Module 5: Advanced MySQL',
  day: 22,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'A stored procedure is a named block of SQL saved inside the database and executed with CALL. Learn DELIMITER, parameters (IN, OUT, INOUT), local and session variables, IF / CASE, WHILE / REPEAT / LOOP, error handlers, and how to create, call, edit and drop procedures in MySQL Workbench.',
  objectives: [
    'Explain why DELIMITER is needed and write a procedure with BEGIN ... END',
    'Use IN, OUT and INOUT parameters and call procedures with CALL',
    'Declare variables and use IF, CASE, WHILE, REPEAT and LOOP',
    'Handle errors with DECLARE ... HANDLER and SIGNAL',
    'Create, view, alter and drop procedures with the Workbench GUI',
  ],
  theory: [
    {
      heading: '1. What is a stored procedure and why use it?',
      content: 'A stored procedure is a saved program of SQL statements stored on the MySQL server. Applications run it with one CALL statement instead of sending many separate queries.',
      points: [
        'Reusability: write business logic once (e.g. "place order") and call it from Java, Python, PHP or Workbench',
        'Performance: fewer network round trips; one CALL runs many statements on the server',
        'Security: users can be given EXECUTE on a procedure without direct access to the tables',
        'Consistency: every application applies the same rules',
        'Drawbacks: harder to debug and version-control, and logic is tied to MySQL',
      ],
    },
    {
      heading: '2. DELIMITER and the basic syntax',
      content: 'Inside a procedure each statement ends with a semicolon. If the client also used ; to end the CREATE PROCEDURE command, it would cut the procedure at the first ;. So we temporarily change the client delimiter to $$ (or //), write the procedure, end it with $$, and switch back to ;. DELIMITER is a client command (Workbench / mysql CLI), not SQL.',
      syntax: `DELIMITER $$
CREATE PROCEDURE sp_list_students()
BEGIN
    SELECT student_id, name, marks FROM students ORDER BY marks DESC;
END$$
DELIMITER ;

CALL sp_list_students();`,
      tip: 'Workbench creates procedures through the GUI without you needing DELIMITER; in a normal query tab you must write it.',
    },
    {
      heading: '3. Parameters: IN, OUT, INOUT',
      content: 'IN (default) passes a value into the procedure; changes inside are not visible outside. OUT returns a value to the caller through a session variable (@var). INOUT passes a value in, the procedure modifies it, and the caller sees the new value.',
      syntax: `CREATE PROCEDURE sp_dept_stats(IN p_dept INT, OUT p_count INT, OUT p_avg DECIMAL(5,2))
...
CALL sp_dept_stats(1, @cnt, @avg);
SELECT @cnt, @avg;`,
      points: [
        'Prefix parameters (p_) and variables (v_) so they never clash with column names',
        'Session (user) variables start with @ and live until the connection closes',
        'Local variables are declared with DECLARE inside BEGIN ... END and live only during the call',
      ],
    },
    {
      heading: '4. Variables and control flow',
      content: 'DECLARE v_name TYPE [DEFAULT value]; must come at the start of the BEGIN block. Assign with SET v := value or SELECT col INTO v FROM ... . Control flow statements:',
      syntax: `IF v_avg >= 85 THEN SET v_label = 'Excellent';
ELSEIF v_avg >= 70 THEN SET v_label = 'Good';
ELSE SET v_label = 'Needs improvement';
END IF;

WHILE v_i <= 5 DO  ... SET v_i = v_i + 1; END WHILE;
REPEAT ... UNTIL v_i > 5 END REPEAT;
my_loop: LOOP ... IF v_i > 5 THEN LEAVE my_loop; END IF; END LOOP;`,
      points: [
        'CASE ... WHEN ... THEN ... END CASE also works as a statement',
        'LEAVE label exits a loop; ITERATE label skips to the next iteration',
        'SELECT ... INTO must return exactly one row (Error 1172 if more rows)',
      ],
    },
    {
      heading: '5. Error handling: HANDLER and SIGNAL',
      content: 'DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; ... END; catches any error, undoes the transaction and leaves the procedure. DECLARE CONTINUE HANDLER FOR NOT FOUND is used with cursors. SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'...\'; raises your own business error that the caller sees as Error 1644.',
    },
    {
      heading: '6. Managing procedures in MySQL Workbench',
      content: 'Navigator > Schemas > college > Stored Procedures. Right-click > Create Stored Procedure... opens an editor tab with a template (CREATE PROCEDURE new_procedure () BEGIN END). Type the body, click Apply, review the SQL in the "Apply SQL Script to Database" dialog, click Apply and Finish. To run it, hover the procedure and click the lightning icon (Execute) or right-click > Execute Stored Procedure... which asks for the parameter values and opens a tab with the CALL statement. Right-click > Alter Stored Procedure... to edit, and Drop Stored Procedure... to delete. In SQL: SHOW PROCEDURE STATUS WHERE Db = \'college\'; SHOW CREATE PROCEDURE sp_name; DROP PROCEDURE IF EXISTS sp_name;',
      tip: 'Stored procedures are not supported in the browser Workbench Lab. Run these examples in real MySQL Workbench. Where possible, a Lab script runs the SQL that lives inside the procedure so you can still check the logic.',
    },
  ],
  examples: [
    {
      title: 'First procedure: no parameters',
      scenario: 'Create a procedure that lists all students with their department, ordered by marks.',
      steps: [
        'In MySQL Workbench: open the Local instance MySQL80 connection and run USE college;',
        'File > New Query Tab, paste the code (including both DELIMITER lines)',
        'Click ⚡ Execute (Ctrl+Shift+Enter). Action Output: CREATE PROCEDURE ... 0 row(s) affected',
        'Navigator: right-click SCHEMAS > Refresh All; college > Stored Procedures now shows sp_list_students',
        'Run CALL sp_list_students(); (Ctrl+Enter) to see the Result Grid',
        'Browser Lab: "Open in Workbench Lab" runs the SELECT that is inside the procedure',
      ],
      code: `USE college;
DROP PROCEDURE IF EXISTS sp_list_students;

DELIMITER $$
CREATE PROCEDURE sp_list_students()
BEGIN
    SELECT s.name, d.dept_name, s.marks
    FROM students s
    LEFT JOIN departments d ON d.dept_id = s.dept_id
    ORDER BY s.marks DESC
    LIMIT 5;
END$$
DELIMITER ;

CALL sp_list_students();`,
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
SELECT s.name, d.dept_name, s.marks
FROM students s
LEFT JOIN departments d ON d.dept_id = s.dept_id
ORDER BY s.marks DESC
LIMIT 5;`,
      result: ">> SELECT s.name, d.dept_name, s.marks\n+--------------+------------------+-------+\n| name         | dept_name        | marks |\n+--------------+------------------+-------+\n| Ananya Rao   | Computer Science | 95    |\n| Diya Patel   | Computer Science | 92    |\n| Aarav Sharma | Computer Science | 88    |\n| Sneha Iyer   | Electronics      | 81    |\n| Priya Desai  | NULL             | 79    |\n+--------------+------------------+-------+\n5 row(s) returned",
      explanation: 'CALL sp_list_students(); returns exactly this grid (top 5 students by marks), followed in Action Output by "CALL sp_list_students() 5 row(s) returned". The procedure body is stored on the server and can be called any time.',
    },
    {
      title: 'IN parameter: students of a given department',
      scenario: 'The office wants to pass a department id and get that department\'s students.',
      steps: [
        'Open a new query tab in real MySQL Workbench and run USE college;',
        'Paste the code and execute it',
        'Run CALL sp_students_by_dept(1); then CALL sp_students_by_dept(2);',
        'GUI way: Navigator > Stored Procedures > right-click sp_students_by_dept > Execute Stored Procedure..., type 1 for p_dept_id, click Execute',
        'Browser Lab: runs the same SELECT with p_dept_id replaced by 1',
      ],
      code: `DROP PROCEDURE IF EXISTS sp_students_by_dept;
DELIMITER $$
CREATE PROCEDURE sp_students_by_dept(IN p_dept_id INT)
BEGIN
    SELECT student_id, name, city, marks
    FROM students
    WHERE dept_id = p_dept_id
    ORDER BY name;
END$$
DELIMITER ;

CALL sp_students_by_dept(1);`,
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
SELECT student_id, name, city, marks
FROM students
WHERE dept_id = 1
ORDER BY name;`,
      result: ">> SELECT student_id, name, city, marks\n+------------+--------------+-----------+-------+\n| student_id | name         | city      | marks |\n+------------+--------------+-----------+-------+\n| 1          | Aarav Sharma | Pune      | 88    |\n| 6          | Ananya Rao   | Bengaluru | 95    |\n| 2          | Diya Patel   | Mumbai    | 92    |\n+------------+--------------+-----------+-------+\n3 row(s) returned",
      explanation: 'p_dept_id receives the value 1. Calling with 2 returns Rohan Verma and Sneha Iyer. Using a parameter keeps one procedure for every department.',
    },
    {
      title: 'OUT parameters: department statistics',
      scenario: 'Return the number of students and the average marks of a department to the caller.',
      steps: [
        'Paste and execute the code in a real MySQL query tab',
        'CALL passes two session variables @cnt and @avg that receive the OUT values',
        'Run SELECT @cnt, @avg; to read them in the Result Grid',
      ],
      code: `DROP PROCEDURE IF EXISTS sp_dept_stats;
DELIMITER $$
CREATE PROCEDURE sp_dept_stats(
    IN  p_dept_id INT,
    OUT p_count   INT,
    OUT p_avg     DECIMAL(5,2))
BEGIN
    SELECT COUNT(*), ROUND(AVG(marks), 2)
    INTO   p_count, p_avg
    FROM   students
    WHERE  dept_id = p_dept_id;
END$$
DELIMITER ;

CALL sp_dept_stats(1, @cnt, @avg);
SELECT @cnt AS students, @avg AS average_marks;`,
      result: `Action Output:
1  DROP PROCEDURE IF EXISTS sp_dept_stats      0 row(s) affected, 1 warning(s): 1305 PROCEDURE college.sp_dept_stats does not exist
2  CREATE PROCEDURE sp_dept_stats( ...         0 row(s) affected
3  CALL sp_dept_stats(1, @cnt, @avg)           1 row(s) affected
4  SELECT @cnt AS students, @avg ...           1 row(s) returned

Result Grid:
+----------+---------------+
| students | average_marks |
+----------+---------------+
|        3 |         91.67 |
+----------+---------------+`,
      explanation: 'SELECT ... INTO stores the query result in the OUT parameters. After the CALL, @cnt = 3 and @avg = 91.67 (88, 92 and 95 for Computer Science). The 1305 warning only means the procedure did not exist before the first run.',
    },
    {
      title: 'INOUT parameter with IF: grace marks capped at 100',
      scenario: 'Add grace marks to a value but never exceed 100.',
      steps: [
        'Paste and execute the code in real MySQL',
        'SET @m = 95; prepares the INOUT variable',
        'CALL changes @m inside the procedure; SELECT @m shows the new value',
      ],
      code: `DROP PROCEDURE IF EXISTS sp_add_grace;
DELIMITER $$
CREATE PROCEDURE sp_add_grace(INOUT p_marks INT, IN p_grace INT)
BEGIN
    SET p_marks = p_marks + p_grace;
    IF p_marks > 100 THEN
        SET p_marks = 100;
    END IF;
END$$
DELIMITER ;

SET @m = 95;
CALL sp_add_grace(@m, 10);
SELECT @m AS after_grace;

SET @m = 60;
CALL sp_add_grace(@m, 5);
SELECT @m AS after_grace;`,
      result: `Result 1:
+-------------+
| after_grace |
+-------------+
|         100 |
+-------------+
Result 2:
+-------------+
| after_grace |
+-------------+
|          65 |
+-------------+`,
      explanation: 'INOUT reads the current value of @m, changes it and writes it back. 95 + 10 = 105 is capped to 100 by the IF block; 60 + 5 = 65.',
    },
    {
      title: 'Variables, CASE and a WHILE loop: performance label and number table',
      scenario: 'Give each department a performance label and fill a helper table with numbers 1 to 5 using a loop.',
      steps: [
        'Paste the code in a real MySQL query tab and execute',
        'CALL sp_dept_label(3); returns one row with the label',
        'CALL sp_fill_numbers(5); inserts 5 rows; SELECT * FROM numbers; shows them',
      ],
      code: `DROP PROCEDURE IF EXISTS sp_dept_label;
DELIMITER $$
CREATE PROCEDURE sp_dept_label(IN p_dept_id INT)
BEGIN
    DECLARE v_avg DECIMAL(5,2) DEFAULT 0;
    DECLARE v_label VARCHAR(30);

    SELECT AVG(marks) INTO v_avg FROM students WHERE dept_id = p_dept_id;

    CASE
        WHEN v_avg >= 85 THEN SET v_label = 'Excellent';
        WHEN v_avg >= 70 THEN SET v_label = 'Good';
        ELSE SET v_label = 'Needs improvement';
    END CASE;

    SELECT p_dept_id AS dept_id, v_avg AS avg_marks, v_label AS label;
END$$

DROP TABLE IF EXISTS numbers$$
CREATE TABLE numbers (n INT PRIMARY KEY)$$

DROP PROCEDURE IF EXISTS sp_fill_numbers$$
CREATE PROCEDURE sp_fill_numbers(IN p_max INT)
BEGIN
    DECLARE v_i INT DEFAULT 1;
    TRUNCATE TABLE numbers;
    WHILE v_i <= p_max DO
        INSERT INTO numbers VALUES (v_i);
        SET v_i = v_i + 1;
    END WHILE;
END$$
DELIMITER ;

CALL sp_dept_label(3);
CALL sp_fill_numbers(5);
SELECT * FROM numbers;`,
      result: `CALL sp_dept_label(3):
+---------+-----------+-------------------+
| dept_id | avg_marks | label             |
+---------+-----------+-------------------+
|       3 |     62.50 | Needs improvement |
+---------+-----------+-------------------+

CALL sp_fill_numbers(5)   1 row(s) affected

SELECT * FROM numbers:
+---+
| n |
+---+
| 1 |
| 2 |
| 3 |
| 4 |
| 5 |
+---+`,
      explanation: 'DECLAREs come first in the block. SELECT ... INTO fills v_avg (Mechanical = 62.50), CASE picks the label. WHILE repeats the INSERT until v_i becomes 6. CALL sp_dept_label(1) would return 91.67 / Excellent.',
    },
    {
      title: 'Real-world: place an order with a transaction, SIGNAL and an error handler',
      scenario: 'E-commerce: place an order for one product. Reject it if stock is insufficient; otherwise insert the order and item and reduce stock, all-or-nothing.',
      steps: [
        'Run USE ecommerce; in a real MySQL query tab',
        'Paste and execute the procedure code',
        'CALL sp_place_order(6, 3, 2); succeeds and returns the new order id',
        'CALL sp_place_order(6, 7, 1); fails because Bluetooth Speaker has 0 stock: Action Output shows Error Code: 1644. Insufficient stock',
        'Browser Lab: runs the same INSERT/UPDATE steps manually inside START TRANSACTION ... COMMIT so you can check the effect',
      ],
      code: `USE ecommerce;
DROP PROCEDURE IF EXISTS sp_place_order;
DELIMITER $$
CREATE PROCEDURE sp_place_order(IN p_customer INT, IN p_product INT, IN p_qty INT)
BEGIN
    DECLARE v_stock INT;
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_order INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;          -- pass the original error to the caller
    END;

    START TRANSACTION;

    SELECT stock, price INTO v_stock, v_price
    FROM products WHERE product_id = p_product
    FOR UPDATE;            -- lock the product row

    IF v_stock < p_qty THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock';
    END IF;

    INSERT INTO orders (customer_id, order_date, status)
    VALUES (p_customer, CURDATE(), 'PLACED');
    SET v_order = LAST_INSERT_ID();

    INSERT INTO order_items (order_id, product_id, qty, unit_price)
    VALUES (v_order, p_product, p_qty, v_price);

    UPDATE products SET stock = stock - p_qty WHERE product_id = p_product;

    COMMIT;
    SELECT v_order AS new_order_id, p_qty * v_price AS amount;
END$$
DELIMITER ;

CALL sp_place_order(6, 3, 2);
CALL sp_place_order(6, 7, 1);`,
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
START TRANSACTION;
INSERT INTO orders (customer_id, order_date, status) VALUES (6, '2024-07-25', 'PLACED');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (9, 3, 2, 6500.00);
UPDATE products SET stock = stock - 2 WHERE product_id = 3;
COMMIT;
SELECT o.order_id, c.name, p.name AS product, oi.qty, oi.qty * oi.unit_price AS amount, p.stock AS stock_left
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.order_id = 9;`,
      result: `Real MySQL - CALL sp_place_order(6, 3, 2):
+--------------+----------+
| new_order_id | amount   |
+--------------+----------+
|            9 | 13000.00 |
+--------------+----------+
CALL sp_place_order(6, 7, 1)   Error Code: 1644. Insufficient stock

Browser Lab (manual steps):
>> START TRANSACTION -> 0 row(s) affected
>> INSERT INTO orders (customer_id, order_date, status) VALUES (6, '2024- -> 1 row(s) affected
>> INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES -> 1 row(s) affected
>> UPDATE products SET stock = stock - 2 WHERE product_id = 3 -> 1 row(s) affected Rows matched: 1  Changed: 1  Warnings: 0
>> COMMIT -> 0 row(s) affected
>> SELECT o.order_id, c.name, p.name AS product, oi.qty, oi.qty * oi.unit
+----------+-------------+--------------+-----+--------+------------+
| order_id | name        | product      | qty | amount | stock_left |
+----------+-------------+--------------+-----+--------+------------+
| 9        | Isha Kapoor | Office Chair | 2   | 13000  | 38         |
+----------+-------------+--------------+-----+--------+------------+
1 row(s) returned`,
      explanation: 'SIGNAL raises a custom error (SQLSTATE 45000, shown as 1644). The EXIT HANDLER catches it, rolls back so no half-order remains, and RESIGNAL passes the message to the caller. FOR UPDATE locks the product row so two buyers cannot take the last item together.',
    },
  ],
  interview: [
    { q: 'What is a stored procedure?', a: 'A named set of SQL statements stored in the database and executed with CALL. It can take parameters, use variables, control flow and transactions.', level: 'Easy' },
    { q: 'Why do we use DELIMITER when creating a procedure?', a: 'The body contains semicolons. Changing the client delimiter (e.g. to $$) lets the whole CREATE PROCEDURE be sent as one statement. Afterwards we reset it with DELIMITER ;.', level: 'Easy' },
    { q: 'Explain IN, OUT and INOUT parameters.', a: 'IN passes a value in (default). OUT returns a value to a caller variable. INOUT passes a value in and returns the modified value.', level: 'Easy' },
    { q: 'Difference between a stored procedure and a function?', a: 'A function returns exactly one value with RETURN and can be used inside SELECT. A procedure is executed with CALL, can return result sets and multiple OUT values, and can contain transactions; it cannot be used in a SELECT expression.', level: 'Medium' },
    { q: 'Difference between local variables and user (session) variables?', a: 'Local variables are DECLAREd inside BEGIN ... END and exist only during the call. User variables start with @, need no declaration and live until the session ends.', level: 'Medium' },
    { q: 'How do you raise a custom error in a procedure?', a: 'SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'message\'; The caller receives Error 1644 with that message.', level: 'Medium' },
    { q: 'What is DECLARE EXIT HANDLER FOR SQLEXCEPTION used for?', a: 'To catch any SQL error inside the procedure, typically to ROLLBACK the transaction and log or re-raise the error, then exit the block.', level: 'Hard' },
    { q: 'Which loop types does MySQL support?', a: 'WHILE ... DO ... END WHILE, REPEAT ... UNTIL ... END REPEAT (runs at least once) and LOOP ... END LOOP with LEAVE to exit. ITERATE skips to the next iteration.', level: 'Medium' },
    { q: 'How do you see and remove procedures?', a: 'SHOW PROCEDURE STATUS WHERE Db = \'db\'; SHOW CREATE PROCEDURE name; DROP PROCEDURE IF EXISTS name; In Workbench use the Stored Procedures node in the Navigator.', level: 'Easy' },
    { q: 'Can you alter the body of a procedure with ALTER PROCEDURE?', a: 'No. ALTER PROCEDURE only changes characteristics like COMMENT or SQL SECURITY. To change the body you DROP and CREATE it again (Workbench Alter Stored Procedure does this for you).', level: 'Hard' },
    { q: 'What privilege is needed to run a procedure?', a: 'EXECUTE on the procedure (or schema). CREATE ROUTINE is needed to create it and ALTER ROUTINE to change or drop it.', level: 'Medium' },
  ],
  practice: [
    { task: 'Create sp_course_students(IN p_course_id INT) that lists the names and grades of students in a course.', hint: 'Join enrollments and students.', solution: `DELIMITER $$
CREATE PROCEDURE sp_course_students(IN p_course_id INT)
BEGIN
    SELECT s.name, e.grade
    FROM enrollments e
    JOIN students s ON s.student_id = e.student_id
    WHERE e.course_id = p_course_id;
END$$
DELIMITER ;
CALL sp_course_students(101);` },
    { task: 'Create sp_total_fee(IN p_student_id INT, OUT p_total DECIMAL(10,2)) that returns the total course fee of a student.', hint: 'SUM(c.fee) INTO p_total.', solution: `DELIMITER $$
CREATE PROCEDURE sp_total_fee(IN p_student_id INT, OUT p_total DECIMAL(10,2))
BEGIN
    SELECT IFNULL(SUM(c.fee), 0) INTO p_total
    FROM enrollments e JOIN courses c ON c.course_id = e.course_id
    WHERE e.student_id = p_student_id;
END$$
DELIMITER ;
CALL sp_total_fee(1, @fee);
SELECT @fee;   -- 27000.00` },
    { task: 'Create sp_raise_salary(IN p_dept INT, IN p_percent DECIMAL(5,2)) that raises faculty salaries of a department, but SIGNALs an error if p_percent > 20.', hint: 'IF ... THEN SIGNAL ... END IF; then UPDATE.', solution: `DELIMITER $$
CREATE PROCEDURE sp_raise_salary(IN p_dept INT, IN p_percent DECIMAL(5,2))
BEGIN
    IF p_percent > 20 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Raise above 20% not allowed';
    END IF;
    UPDATE faculty SET salary = salary * (1 + p_percent / 100) WHERE dept_id = p_dept;
    SELECT ROW_COUNT() AS rows_updated;
END$$
DELIMITER ;` },
    { task: 'Write a procedure that uses REPEAT to compute the factorial of a number into an OUT parameter.', hint: 'REPEAT ... UNTIL v_i > p_n END REPEAT.', solution: `DELIMITER $$
CREATE PROCEDURE sp_factorial(IN p_n INT, OUT p_result BIGINT)
BEGIN
    DECLARE v_i INT DEFAULT 1;
    SET p_result = 1;
    REPEAT
        SET p_result = p_result * v_i;
        SET v_i = v_i + 1;
    UNTIL v_i > p_n END REPEAT;
END$$
DELIMITER ;
CALL sp_factorial(5, @f); SELECT @f;  -- 120` },
    { task: 'List all procedures of the college database and drop sp_add_grace.', hint: 'SHOW PROCEDURE STATUS and DROP PROCEDURE IF EXISTS.', solution: `SHOW PROCEDURE STATUS WHERE Db = 'college';
DROP PROCEDURE IF EXISTS sp_add_grace;` },
  ],
  quiz: [
    { question: 'How do you execute a stored procedure?', options: ['EXEC sp()', 'RUN sp()', 'CALL sp()', 'SELECT sp()'], answer: 2, explanation: 'MySQL uses CALL procedure_name(args).' },
    { question: 'Which parameter mode both receives and returns a value?', options: ['IN', 'INOUT', 'OUT', 'RETURN'], answer: 1, explanation: 'INOUT passes a value in and returns the changed value.' },
    { question: 'Why do we write DELIMITER $$ before CREATE PROCEDURE?', options: ['So the semicolons inside the body do not end the statement early', 'To speed up the procedure', 'It is required for SELECT', 'To enable transactions'], answer: 0, explanation: 'The client must send the whole body as one statement.' },
    { question: 'Which statement raises a custom error?', options: ['RAISE ERROR', 'THROW', 'ERROR 45000', 'SIGNAL SQLSTATE \'45000\''], answer: 3, explanation: 'SIGNAL raises a user-defined error.' },
    { question: 'Where do you create a procedure with the Workbench GUI?', options: ['Server > Data Import', 'Navigator > schema > Stored Procedures > right-click > Create Stored Procedure...', 'Database > Reverse Engineer', 'Edit > Preferences'], answer: 1, explanation: 'Right-click the Stored Procedures node of the schema.' },
  ],
};
