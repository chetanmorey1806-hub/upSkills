export default {
  id: 'mysql-day-25',
  title: 'Window Functions and CTEs (incl. Recursive CTE)',
  module: 'Module 5: Advanced MySQL',
  day: 25,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Window functions (MySQL 8+) calculate values across a set of related rows without collapsing them like GROUP BY does. Learn OVER, PARTITION BY, ORDER BY and frames; ranking with ROW_NUMBER, RANK, DENSE_RANK and NTILE; LAG and LEAD; running totals and moving averages; and Common Table Expressions (WITH), including recursive CTEs for series and hierarchies.',
  objectives: [
    'Write window functions with OVER (PARTITION BY ... ORDER BY ...)',
    'Explain the difference between ROW_NUMBER, RANK and DENSE_RANK with ties',
    'Use LAG/LEAD to compare a row with previous/next rows and build running totals',
    'Write readable queries with one or more CTEs',
    'Generate series and walk hierarchies with WITH RECURSIVE',
  ],
  theory: [
    {
      heading: '1. Window functions vs GROUP BY',
      content: 'GROUP BY collapses many rows into one row per group, so you lose the detail. A window function calculates a value over a "window" of rows related to the current row but keeps every row. Example: show every student AND the average of their department in the same row.',
      syntax: `SELECT name, dept_id, marks,
       AVG(marks) OVER (PARTITION BY dept_id) AS dept_avg
FROM students;`,
      points: [
        'OVER () = the window is the whole result set',
        'PARTITION BY col = restart the calculation for each group',
        'ORDER BY col inside OVER = order rows within the window (needed for ranking, LAG/LEAD, running totals)',
        'Window functions are evaluated after WHERE, GROUP BY and HAVING, so to filter on them use a subquery or CTE',
        'Available from MySQL 8.0 (not in 5.7)',
      ],
    },
    {
      heading: '2. Ranking functions',
      content: 'ROW_NUMBER() gives 1, 2, 3, ... with no ties. RANK() gives tied rows the same rank and then skips numbers (1, 1, 3). DENSE_RANK() gives tied rows the same rank without gaps (1, 1, 2). NTILE(n) divides the rows into n roughly equal buckets (quartiles with NTILE(4)). PERCENT_RANK() and CUME_DIST() give relative positions between 0 and 1.',
      syntax: `SELECT course_name, credits,
       ROW_NUMBER() OVER (ORDER BY credits DESC) AS row_num,
       RANK()       OVER (ORDER BY credits DESC) AS rnk,
       DENSE_RANK() OVER (ORDER BY credits DESC) AS dense_rnk
FROM courses;`,
      tip: 'Top-N per group: ROW_NUMBER() OVER (PARTITION BY group ORDER BY value DESC) in a CTE, then WHERE rn <= N.',
    },
    {
      heading: '3. Value functions: LAG, LEAD, FIRST_VALUE, LAST_VALUE',
      content: 'LAG(col, n, default) returns the value from n rows before the current row; LEAD looks n rows ahead. They are perfect for "change from previous month", "days since last order" and "next appointment". FIRST_VALUE / LAST_VALUE / NTH_VALUE return a value from a position in the window frame.',
      syntax: `SELECT order_date, amount,
       LAG(amount)  OVER (ORDER BY order_date) AS prev_amount,
       amount - LAG(amount) OVER (ORDER BY order_date) AS change_amt
FROM daily_sales;`,
    },
    {
      heading: '4. Aggregate windows and frames: running totals, moving averages',
      content: 'SUM, AVG, COUNT, MIN, MAX can be used with OVER. With ORDER BY inside OVER they become cumulative. A frame clause defines exactly which rows around the current row are included.',
      syntax: `SUM(amount) OVER (ORDER BY paid_on
                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,
AVG(amount) OVER (ORDER BY paid_on
                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)         AS moving_avg_3`,
      points: [
        'ROWS counts physical rows; RANGE groups rows with equal ORDER BY values',
        'Default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW',
        'A named window avoids repetition: ... OVER w FROM t WINDOW w AS (PARTITION BY x ORDER BY y)',
      ],
    },
    {
      heading: '5. Common Table Expressions (WITH)',
      content: 'A CTE is a named temporary result set defined with WITH name AS (SELECT ...) right before the main query. It makes long queries readable (step-by-step), can be referenced several times, and one CTE can use the previous ones. It exists only for that single statement.',
      syntax: `WITH dept_avg AS (
    SELECT dept_id, AVG(marks) AS avg_marks FROM students GROUP BY dept_id
),
toppers AS (
    SELECT s.* FROM students s JOIN dept_avg d ON d.dept_id = s.dept_id
    WHERE s.marks > d.avg_marks
)
SELECT * FROM toppers;`,
    },
    {
      heading: '6. Recursive CTEs',
      content: 'WITH RECURSIVE lets a CTE refer to itself. It has an anchor member (the starting rows) UNION ALL a recursive member that joins back to the CTE, and stops when the recursive member returns no rows. Uses: number/date series, organisation charts, category trees, bill of materials. MySQL stops runaway recursion at cte_max_recursion_depth (default 1000).',
      syntax: `WITH RECURSIVE nums AS (
    SELECT 1 AS n                      -- anchor
    UNION ALL
    SELECT n + 1 FROM nums WHERE n < 10 -- recursive member + stop condition
)
SELECT n FROM nums;`,
    },
  ],
  examples: [
    {
      title: 'ROW_NUMBER vs RANK vs DENSE_RANK with ties',
      scenario: 'Rank courses by credits. Several courses have the same credits, so compare the three ranking functions.',
      steps: [
        'In MySQL Workbench: open the Local instance MySQL80 connection',
        'File > New Query Tab, paste the script, press Ctrl+Shift+Enter',
        'Look at the rows with 4 credits: same RANK and DENSE_RANK, different ROW_NUMBER',
      ],
      code: `SELECT course_name, credits,
       ROW_NUMBER() OVER (ORDER BY credits DESC, course_name) AS row_num,
       RANK()       OVER (ORDER BY credits DESC) AS rnk,
       DENSE_RANK() OVER (ORDER BY credits DESC) AS dense_rnk
FROM courses
ORDER BY credits DESC, course_name;`,
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
SELECT course_name, credits,
       ROW_NUMBER() OVER (ORDER BY credits DESC, course_name) AS row_num,
       RANK()       OVER (ORDER BY credits DESC) AS rnk,
       DENSE_RANK() OVER (ORDER BY credits DESC) AS dense_rnk
FROM courses
ORDER BY credits DESC, course_name;`,
      result: ">> SELECT course_name, credits,\n+---------------------+---------+---------+-----+-----------+\n| course_name         | credits | row_num | rnk | dense_rnk |\n+---------------------+---------+---------+-----+-----------+\n| Database Systems    | 4       | 1       | 1   | 1         |\n| Digital Electronics | 4       | 2       | 1   | 1         |\n| Machine Learning    | 4       | 3       | 1   | 1         |\n| Structural Analysis | 4       | 4       | 1   | 1         |\n| Python Programming  | 3       | 5       | 5   | 2         |\n| Thermodynamics      | 3       | 6       | 5   | 2         |\n| Marketing Basics    | 2       | 7       | 7   | 3         |\n+---------------------+---------+---------+-----+-----------+\n7 row(s) returned",
      explanation: 'Four courses tie with 4 credits: RANK gives them 1 and the next rank jumps to 5; DENSE_RANK continues with 2. ROW_NUMBER is always unique (ties broken by course_name).',
    },
    {
      title: 'PARTITION BY: department average and top student per department',
      scenario: 'Show each student next to the department average, then keep only the top scorer of each department.',
      steps: ['Open a new query tab', 'Paste and execute the script', 'Result 1 keeps all rows; Result 2 uses a CTE to filter rn = 1'],
      code: `SELECT name, dept_id, marks,
       ROUND(AVG(marks) OVER (PARTITION BY dept_id), 1) AS dept_avg,
       ROUND(marks - AVG(marks) OVER (PARTITION BY dept_id), 1) AS diff
FROM students
WHERE dept_id IS NOT NULL
ORDER BY dept_id, marks DESC;

WITH ranked AS (
    SELECT s.name, d.dept_name, s.marks,
           ROW_NUMBER() OVER (PARTITION BY s.dept_id ORDER BY s.marks DESC) AS rn
    FROM students s
    JOIN departments d ON d.dept_id = s.dept_id
)
SELECT dept_name, name AS topper, marks
FROM ranked
WHERE rn = 1
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
SELECT name, dept_id, marks,
       ROUND(AVG(marks) OVER (PARTITION BY dept_id), 1) AS dept_avg,
       ROUND(marks - AVG(marks) OVER (PARTITION BY dept_id), 1) AS diff
FROM students
WHERE dept_id IS NOT NULL
ORDER BY dept_id, marks DESC;
WITH ranked AS (
    SELECT s.name, d.dept_name, s.marks,
           ROW_NUMBER() OVER (PARTITION BY s.dept_id ORDER BY s.marks DESC) AS rn
    FROM students s
    JOIN departments d ON d.dept_id = s.dept_id
)
SELECT dept_name, name AS topper, marks
FROM ranked
WHERE rn = 1
ORDER BY marks DESC;`,
      result: ">> SELECT name, dept_id, marks,\n+--------------+---------+-------+----------+------+\n| name         | dept_id | marks | dept_avg | diff |\n+--------------+---------+-------+----------+------+\n| Ananya Rao   | 1       | 95    | 91.7     | 3.3  |\n| Diya Patel   | 1       | 92    | 91.7     | 0.3  |\n| Aarav Sharma | 1       | 88    | 91.7     | -3.7 |\n| Sneha Iyer   | 2       | 81    | 78.0     | 3.0  |\n| Rohan Verma  | 2       | 75    | 78.0     | -3.0 |\n| Kabir Singh  | 3       | 67    | 62.5     | 4.5  |\n| Vikram Joshi | 3       | 58    | 62.5     | -4.5 |\n| Meera Nair   | 4       | 72    | 72.0     | 0.0  |\n+--------------+---------+-------+----------+------+\n8 row(s) returned\n>> WITH ranked AS (\n+------------------+-------------+-------+\n| dept_name        | topper      | marks |\n+------------------+-------------+-------+\n| Computer Science | Ananya Rao  | 95    |\n| Electronics      | Sneha Iyer  | 81    |\n| Civil            | Meera Nair  | 72    |\n| Mechanical       | Kabir Singh | 67    |\n+------------------+-------------+-------+\n4 row(s) returned",
      explanation: 'PARTITION BY dept_id restarts the average and the row numbering for every department while keeping each student row. You cannot write WHERE ROW_NUMBER() ... = 1 directly, so the CTE computes rn first and the outer query filters it.',
    },
    {
      title: 'NTILE: split students into 4 performance quartiles',
      scenario: 'The mentor programme groups students into four equal-sized buckets by marks.',
      steps: ['Open a new query tab', 'Paste and run', 'Quartile 1 = best performers'],
      code: `SELECT name, marks,
       NTILE(4) OVER (ORDER BY marks DESC) AS quartile
FROM students;`,
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
       NTILE(4) OVER (ORDER BY marks DESC) AS quartile
FROM students;`,
      result: ">> SELECT name, marks,\n+--------------+-------+----------+\n| name         | marks | quartile |\n+--------------+-------+----------+\n| Ananya Rao   | 95    | 1        |\n| Diya Patel   | 92    | 1        |\n| Aarav Sharma | 88    | 1        |\n| Sneha Iyer   | 81    | 2        |\n| Priya Desai  | 79    | 2        |\n| Rohan Verma  | 75    | 2        |\n| Meera Nair   | 72    | 3        |\n| Kabir Singh  | 67    | 3        |\n| Arjun Mehta  | 64    | 4        |\n| Vikram Joshi | 58    | 4        |\n+--------------+-------+----------+\n10 row(s) returned",
      explanation: '10 rows into 4 buckets gives sizes 3, 3, 2, 2: the first buckets receive the extra rows.',
    },
    {
      title: 'LAG / LEAD: compare each payment with the previous one',
      scenario: 'Finance wants each payment, the previous payment amount, the change, and the date of the next payment.',
      steps: ['Open a new query tab', 'Paste the script (creates ecommerce) and press Ctrl+Shift+Enter', 'The first row has no previous payment, so LAG returns the default 0'],
      code: `SELECT payment_id, paid_on, amount,
       LAG(amount, 1, 0) OVER (ORDER BY paid_on)          AS prev_amount,
       amount - LAG(amount, 1, 0) OVER (ORDER BY paid_on) AS change_amt,
       LEAD(paid_on) OVER (ORDER BY paid_on)              AS next_payment_on
FROM payments
ORDER BY paid_on;`,
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
SELECT payment_id, paid_on, amount,
       LAG(amount, 1, 0) OVER (ORDER BY paid_on)          AS prev_amount,
       amount - LAG(amount, 1, 0) OVER (ORDER BY paid_on) AS change_amt,
       LEAD(paid_on) OVER (ORDER BY paid_on)              AS next_payment_on
FROM payments
ORDER BY paid_on;`,
      result: ">> SELECT payment_id, paid_on, amount,\n+------------+------------+--------+-------------+------------+-----------------+\n| payment_id | paid_on    | amount | prev_amount | change_amt | next_payment_on |\n+------------+------------+--------+-------------+------------+-----------------+\n| 1          | 2024-06-01 | 76600  | 0           | 76600      | 2024-06-03      |\n| 2          | 2024-06-03 | 8300   | 76600       | -68300     | 2024-06-10      |\n| 3          | 2024-06-10 | 3500   | 8300        | -4800      | 2024-06-15      |\n| 4          | 2024-06-15 | 22000  | 3500        | 18500      | 2024-07-02      |\n| 5          | 2024-07-02 | 82000  | 22000       | 60000      | 2024-07-20      |\n| 6          | 2024-07-20 | 2000   | 82000       | -80000     | NULL            |\n+------------+------------+--------+-------------+------------+-----------------+\n6 row(s) returned",
      explanation: 'LAG looks one row back, LEAD one row ahead in paid_on order. The third LAG argument (0) replaces NULL for the first row; LEAD on the last row has no next value, so it is NULL.',
    },
    {
      title: 'Running total and 3-payment moving average',
      scenario: 'Build a cumulative revenue line and a smoothed moving average for the management dashboard.',
      steps: ['Open a new query tab', 'Paste and execute', 'running_total grows row by row; moving_avg_3 averages the current and 2 previous payments'],
      code: `SELECT paid_on, amount,
       SUM(amount) OVER (ORDER BY paid_on
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,
       ROUND(AVG(amount) OVER (ORDER BY paid_on
                         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2)     AS moving_avg_3,
       ROUND(100.0 * amount / SUM(amount) OVER (), 1)                       AS pct_of_total
FROM payments
ORDER BY paid_on;`,
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
SELECT paid_on, amount,
       SUM(amount) OVER (ORDER BY paid_on
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,
       ROUND(AVG(amount) OVER (ORDER BY paid_on
                         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2)     AS moving_avg_3,
       ROUND(100.0 * amount / SUM(amount) OVER (), 1)                       AS pct_of_total
FROM payments
ORDER BY paid_on;`,
      result: ">> SELECT paid_on, amount,\n+------------+--------+---------------+--------------+--------------+\n| paid_on    | amount | running_total | moving_avg_3 | pct_of_total |\n+------------+--------+---------------+--------------+--------------+\n| 2024-06-01 | 76600  | 76600         | 76600.0      | 39.4         |\n| 2024-06-03 | 8300   | 84900         | 42450.0      | 4.3          |\n| 2024-06-10 | 3500   | 88400         | 29466.67     | 1.8          |\n| 2024-06-15 | 22000  | 110400        | 11266.67     | 11.3         |\n| 2024-07-02 | 82000  | 192400        | 35833.33     | 42.2         |\n| 2024-07-20 | 2000   | 194400        | 35333.33     | 1.0          |\n+------------+--------+---------------+--------------+--------------+\n6 row(s) returned",
      explanation: 'SUM(...) OVER (ORDER BY ...) is cumulative. The frame ROWS BETWEEN 2 PRECEDING AND CURRENT ROW gives a 3-row moving average. SUM(amount) OVER () is the grand total on every row, used for the percentage.',
    },
    {
      title: 'Recursive CTE: number series and faculty hierarchy',
      scenario: 'Generate numbers 1 to 5, then show the reporting chain of Computer Science faculty with their level and path.',
      steps: ['Open a new query tab', 'Paste and execute the script', 'Result 1 = series, Result 2 = organisation tree'],
      code: `WITH RECURSIVE nums AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM nums WHERE n < 5
)
SELECT n, n * n AS square FROM nums;

WITH RECURSIVE org AS (
    SELECT faculty_id, name, manager_id, 1 AS level, CAST(name AS CHAR(200)) AS path
    FROM faculty
    WHERE manager_id IS NULL AND dept_id IN (1, 2)
    UNION ALL
    SELECT f.faculty_id, f.name, f.manager_id, o.level + 1, CONCAT(o.path, ' > ', f.name)
    FROM faculty f
    JOIN org o ON f.manager_id = o.faculty_id
)
SELECT level, name, path FROM org ORDER BY path;`,
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
WITH RECURSIVE nums AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM nums WHERE n < 5
)
SELECT n, n * n AS square FROM nums;
WITH RECURSIVE org AS (
    SELECT faculty_id, name, manager_id, 1 AS level, CAST(name AS CHAR(200)) AS path
    FROM faculty
    WHERE manager_id IS NULL AND dept_id IN (1, 2)
    UNION ALL
    SELECT f.faculty_id, f.name, f.manager_id, o.level + 1, CONCAT(o.path, ' > ', f.name)
    FROM faculty f
    JOIN org o ON f.manager_id = o.faculty_id
)
SELECT level, name, path FROM org ORDER BY path;`,
      result: ">> WITH RECURSIVE nums AS (\n+---+--------+\n| n | square |\n+---+--------+\n| 1 | 1      |\n| 2 | 4      |\n| 3 | 9      |\n| 4 | 16     |\n| 5 | 25     |\n+---+--------+\n5 row(s) returned\n>> WITH RECURSIVE org AS (\n+-------+-------------+------------------------+\n| level | name        | path                   |\n+-------+-------------+------------------------+\n| 1     | Dr. Menon   | Dr. Menon              |\n| 2     | Prof. Bose  | Dr. Menon > Prof. Bose |\n| 1     | Dr. Rao     | Dr. Rao                |\n| 2     | Prof. Gupta | Dr. Rao > Prof. Gupta  |\n| 2     | Prof. Khan  | Dr. Rao > Prof. Khan   |\n+-------+-------------+------------------------+\n5 row(s) returned",
      explanation: 'The anchor selects the heads (manager_id IS NULL). Each recursive step finds people whose manager is already in org, adding 1 to level and extending the path. CAST(... AS CHAR(200)) makes the path column wide enough in MySQL, otherwise it is truncated to the anchor width (Error 1406 in strict mode).',
    },
  ],
  interview: [
    { q: 'What is a window function?', a: 'A function that computes a value over a set of rows related to the current row (defined by OVER) without collapsing rows like GROUP BY.', level: 'Easy' },
    { q: 'Difference between ROW_NUMBER, RANK and DENSE_RANK?', a: 'For values 100, 100, 90: ROW_NUMBER = 1, 2, 3; RANK = 1, 1, 3 (gap); DENSE_RANK = 1, 1, 2 (no gap).', level: 'Easy' },
    { q: 'How do you find the top 3 earners per department?', a: 'WITH r AS (SELECT *, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rk FROM emp) SELECT * FROM r WHERE rk <= 3;', level: 'Medium' },
    { q: 'How do you find the Nth highest salary with window functions?', a: 'SELECT DISTINCT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rk FROM emp) t WHERE rk = N;', level: 'Medium' },
    { q: 'Why can you not use a window function in WHERE?', a: 'WHERE is evaluated before window functions. Compute it in a subquery or CTE and filter in the outer query.', level: 'Medium' },
    { q: 'What do LAG and LEAD do?', a: 'LAG returns a value from a previous row, LEAD from a following row, within the window order; both accept an offset and a default.', level: 'Easy' },
    { q: 'How do you compute a running total?', a: 'SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).', level: 'Easy' },
    { q: 'What is the difference between ROWS and RANGE frames?', a: 'ROWS counts physical rows. RANGE treats rows with the same ORDER BY value as peers and includes them together, which can give surprising running totals with duplicate dates.', level: 'Hard' },
    { q: 'What is a CTE and how is it different from a derived table?', a: 'A named temporary result defined with WITH before the statement. Unlike a derived table it can be referenced multiple times, can refer to earlier CTEs, and can be recursive; readability is much better.', level: 'Medium' },
    { q: 'Explain the parts of a recursive CTE.', a: 'Anchor member (starting rows) UNION ALL recursive member (joins to the CTE itself) with a termination condition. MySQL limits depth with cte_max_recursion_depth (1000).', level: 'Medium' },
    { q: 'Give real uses of recursive CTEs.', a: 'Employee-manager hierarchies, category/sub-category trees, generating missing dates for reports, bill of materials, graph/path traversal.', level: 'Medium' },
    { q: 'From which MySQL version are window functions and CTEs available?', a: 'MySQL 8.0. MySQL 5.7 does not support them.', level: 'Easy' },
  ],
  practice: [
    { task: 'Rank faculty by salary within each department using DENSE_RANK.', hint: 'PARTITION BY dept_id ORDER BY salary DESC.', solution: `SELECT name, dept_id, salary,
       DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS salary_rank
FROM faculty;` },
    { task: 'Find the second highest marks in the college using DENSE_RANK in a CTE.', hint: 'Filter rk = 2.', solution: `WITH r AS (
  SELECT name, marks, DENSE_RANK() OVER (ORDER BY marks DESC) AS rk FROM students)
SELECT name, marks FROM r WHERE rk = 2;` },
    { task: 'For each customer show each order date and the number of days since their previous order.', hint: 'LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) with DATEDIFF.', solution: `SELECT customer_id, order_id, order_date,
       DATEDIFF(order_date, LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)) AS days_since_prev
FROM orders
ORDER BY customer_id, order_date;` },
    { task: 'Generate all dates from 2024-06-01 to 2024-06-07 with a recursive CTE.', hint: 'Anchor DATE(\'2024-06-01\'), recursive d + INTERVAL 1 DAY.', solution: `WITH RECURSIVE days AS (
  SELECT DATE('2024-06-01') AS d
  UNION ALL
  SELECT d + INTERVAL 1 DAY FROM days WHERE d < '2024-06-07')
SELECT d FROM days;` },
    { task: 'Using a CTE, show product categories whose revenue is above the average category revenue.', hint: 'CTE 1: revenue per category; outer query compares to AVG over CTE.', solution: `WITH cat AS (
  SELECT p.category, SUM(oi.qty * oi.unit_price) AS revenue
  FROM order_items oi JOIN products p ON p.product_id = oi.product_id
  GROUP BY p.category)
SELECT category, revenue FROM cat
WHERE revenue > (SELECT AVG(revenue) FROM cat);` },
  ],
  quiz: [
    { question: 'Values 50, 50, 40 ordered DESC. What does RANK() return?', options: ['1, 2, 3', '1, 1, 2', '1, 1, 3', '1, 2, 2'], answer: 2, explanation: 'RANK gives ties the same rank and skips the next number.' },
    { question: 'Which clause restarts a window calculation for each group?', options: ['PARTITION BY', 'GROUP BY', 'ORDER BY', 'HAVING'], answer: 0, explanation: 'PARTITION BY divides rows into independent windows.' },
    { question: 'Which function returns the value from the previous row?', options: ['LEAD', 'FIRST_VALUE', 'NTILE', 'LAG'], answer: 3, explanation: 'LAG looks backwards.' },
    { question: 'What keyword is required for a CTE that references itself?', options: ['WITH LOOP', 'WITH RECURSIVE', 'CONNECT BY', 'REPEAT'], answer: 1, explanation: 'MySQL uses WITH RECURSIVE.' },
    { question: 'NTILE(4) on 10 rows gives bucket sizes:', options: ['3, 3, 2, 2', '2, 2, 3, 3', '4, 4, 2, 0', '2, 2, 2, 4'], answer: 0, explanation: 'Extra rows go to the first buckets.' },
  ],
};
