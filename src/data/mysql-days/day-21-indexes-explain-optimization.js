export default {
  id: 'mysql-day-21',
  title: 'Indexes, EXPLAIN, Visual Explain and Query Optimization',
  module: 'Module 5: Advanced MySQL',
  day: 21,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Indexes let MySQL find rows without scanning the whole table. Learn index types (primary, unique, normal, composite, full-text), the leftmost-prefix rule, how to read EXPLAIN and Workbench Visual Explain, and practical rules to write faster queries.',
  objectives: [
    'Explain how a B-Tree index speeds up searches and what it costs',
    'Create, list and drop single-column, composite and unique indexes',
    'Read the key columns of EXPLAIN output (type, key, rows, Extra)',
    'Use Visual Explain in MySQL Workbench to spot full table scans',
    'Rewrite slow queries so they can use indexes (sargable conditions)',
  ],
  theory: [
    {
      heading: '1. What is an index?',
      content: 'An index is a separate sorted data structure (a B-Tree in InnoDB) that stores column values with pointers to the rows, like the index at the back of a book. Without an index MySQL must read every row (full table scan). With an index it jumps directly to the matching rows.',
      points: [
        'Speeds up WHERE, JOIN ON, ORDER BY, GROUP BY, MIN/MAX on the indexed columns',
        'Costs disk space and slows down INSERT/UPDATE/DELETE slightly (index must be updated)',
        'InnoDB tables are clustered on the PRIMARY KEY: the table data itself is stored in PK order',
        'Secondary indexes store the PK value to find the full row',
        'FOREIGN KEY columns are indexed automatically by InnoDB',
      ],
    },
    {
      heading: '2. Types of indexes and syntax',
      content: 'PRIMARY KEY (unique, not null, one per table), UNIQUE (no duplicate values, NULLs allowed), normal INDEX/KEY (duplicates allowed), composite index (several columns), FULLTEXT (word search with MATCH ... AGAINST) and SPATIAL. Indexes can be created in CREATE TABLE, with CREATE INDEX or with ALTER TABLE.',
      syntax: `CREATE INDEX idx_students_city ON students(city);
CREATE UNIQUE INDEX uq_products_name ON products(name);
CREATE INDEX idx_orders_cust_date ON orders(customer_id, order_date);
ALTER TABLE products ADD FULLTEXT INDEX ft_name (name);

SHOW INDEX FROM orders;
DROP INDEX idx_students_city ON students;
-- or: ALTER TABLE students DROP INDEX idx_students_city;`,
      tip: 'In the browser Workbench Lab CREATE INDEX and SHOW INDEX work; DROP INDEX, FULLTEXT and EXPLAIN need a real MySQL server.',
    },
    {
      heading: '3. Composite indexes and the leftmost-prefix rule',
      content: 'A composite index on (customer_id, order_date) is sorted by customer_id first, then by order_date. MySQL can use it for conditions on customer_id alone, or on customer_id AND order_date, but NOT for order_date alone, just as a phone book sorted by surname then first name cannot find "all people named Amit" quickly.',
      points: [
        'Put the column used with = first, the range column (BETWEEN, >, <) last',
        'Index (a, b, c) serves WHERE a=?, a=? AND b=?, a=? AND b=? AND c=?',
        'It does not serve WHERE b=? or WHERE c=? alone',
        'A covering index contains every column the query needs, so MySQL never reads the table (Extra: Using index)',
      ],
    },
    {
      heading: '4. Reading EXPLAIN',
      content: 'Put EXPLAIN before a SELECT (or UPDATE/DELETE) to see the execution plan without running the query. EXPLAIN ANALYZE (8.0.18+) actually runs the query and shows real timings. The most important columns are:',
      points: [
        'type: access method, from best to worst: system, const, eq_ref, ref, range, index, ALL (ALL = full table scan)',
        'possible_keys: indexes MySQL could use',
        'key: the index actually chosen (NULL = no index used)',
        'rows: estimated rows MySQL must examine (smaller is better)',
        'filtered: percentage of rows left after the WHERE condition',
        'Extra: Using where, Using index (covering), Using filesort (extra sort), Using temporary (temp table)',
      ],
      syntax: `EXPLAIN SELECT * FROM orders WHERE customer_id = 2;
EXPLAIN FORMAT=TREE SELECT * FROM orders WHERE customer_id = 2;
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 2;`,
    },
    {
      heading: '5. Visual Explain in MySQL Workbench',
      content: 'Workbench draws the plan as a diagram. Write the query in a query tab, then use Query > Explain Current Statement (Ctrl+Alt+X) or click the magnifying-glass-with-lightning icon in the editor toolbar. The Execution Plan tab shows boxes for each table access: red "Full Table Scan" boxes are the expensive ones, green "Unique Key Lookup"/"Non-Unique Key Lookup" boxes are good. Hover a box to see cost and rows. You can switch the right-side drop-down from Visual Explain to Tabular Explain to see the normal EXPLAIN grid. After running a query, the Execution Plan button on the right of the result area shows the same plan.',
    },
    {
      heading: '6. Query optimization rules of thumb',
      content: 'Most slow queries are fixed with the right index and a "sargable" WHERE clause (one that lets MySQL use the index).',
      points: [
        'Do not wrap indexed columns in functions: WHERE YEAR(order_date) = 2024 cannot use an index; use WHERE order_date >= \'2024-01-01\' AND order_date < \'2025-01-01\'',
        'Avoid leading wildcards: LIKE \'%phone\' scans; LIKE \'phone%\' can use an index',
        'Select only needed columns instead of SELECT *',
        'Index columns used in JOIN ON and WHERE; check with EXPLAIN that type is not ALL',
        'Use LIMIT for previews, and keep data types of joined columns identical',
        'Do not over-index: every extra index slows writes; drop unused ones (sys.schema_unused_indexes)',
        'Find slow queries with the slow query log or Workbench Performance Reports',
      ],
    },
  ],
  examples: [
    {
      title: 'Create a single-column index and list indexes',
      scenario: 'The college office searches students by city many times a day. Add an index on city and check it exists.',
      steps: [
        'In MySQL Workbench: open the Local instance MySQL80 connection',
        'File > New Query Tab, paste the script and press Ctrl+Shift+Enter',
        'GUI alternative: Navigator > college > Tables > right-click students > Alter Table... > Indexes tab > add idx_students_city on city > Apply',
      ],
      code: `SHOW INDEX FROM students;
CREATE INDEX idx_students_city ON students(city);
SHOW INDEX FROM students;
SELECT name, city FROM students WHERE city = 'Mumbai';`,
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
SHOW INDEX FROM students;
CREATE INDEX idx_students_city ON students(city);
SHOW INDEX FROM students;
SELECT name, city FROM students WHERE city = 'Mumbai';`,
      result: ">> SHOW INDEX FROM students\n+----------+------------+----------+--------------+-------------+\n| Table    | Non_unique | Key_name | Seq_in_index | Column_name |\n+----------+------------+----------+--------------+-------------+\n| students | 0          | PRIMARY  | 1            | student_id  |\n+----------+------------+----------+--------------+-------------+\n1 row(s) returned\n>> CREATE INDEX idx_students_city ON students(city) -> 0 row(s) affected\n>> SHOW INDEX FROM students\n+----------+------------+-------------------+--------------+-------------+\n| Table    | Non_unique | Key_name          | Seq_in_index | Column_name |\n+----------+------------+-------------------+--------------+-------------+\n| students | 0          | PRIMARY           | 1            | student_id  |\n| students | 1          | idx_students_city | 1            | city        |\n+----------+------------+-------------------+--------------+-------------+\n2 row(s) returned\n>> SELECT name, city FROM students WHERE city = 'Mumbai'\n+--------------+--------+\n| name         | city   |\n+--------------+--------+\n| Diya Patel   | Mumbai |\n| Vikram Joshi | Mumbai |\n+--------------+--------+\n2 row(s) returned",
      explanation: 'Before: only the PRIMARY index exists. After CREATE INDEX a second row appears with Non_unique = 1 (duplicates allowed). The SELECT result is the same; only the speed changes on big tables. (Real MySQL shows extra columns such as Cardinality and Index_type BTREE, and also lists the automatic FK index on dept_id.)',
    },
    {
      title: 'Composite index and the leftmost prefix',
      scenario: 'Customer support always looks up orders by customer and date range. Create a composite index (customer_id, order_date).',
      steps: [
        'Open a new query tab, paste the script and execute',
        'Read Seq_in_index: 1 = customer_id (leftmost), 2 = order_date',
        'In real MySQL, run the three EXPLAIN statements from the code box one by one with Ctrl+Enter and compare the key column',
      ],
      code: `CREATE INDEX idx_orders_cust_date ON orders(customer_id, order_date);
SHOW INDEX FROM orders;

SELECT order_id, order_date, status FROM orders
WHERE customer_id = 2 AND order_date >= '2024-06-01' AND order_date < '2024-08-01';

-- real MySQL only:
EXPLAIN SELECT * FROM orders WHERE customer_id = 2;                         -- uses index
EXPLAIN SELECT * FROM orders WHERE customer_id = 2 AND order_date > '2024-06-15'; -- uses index (range)
EXPLAIN SELECT * FROM orders WHERE order_date > '2024-06-15';               -- cannot use it (not leftmost)`,
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
CREATE INDEX idx_orders_cust_date ON orders(customer_id, order_date);
SHOW INDEX FROM orders;
SELECT order_id, order_date, status FROM orders
WHERE customer_id = 2 AND order_date >= '2024-06-01' AND order_date < '2024-08-01';`,
      result: ">> CREATE INDEX idx_orders_cust_date ON orders(customer_id, order_date) -> 0 row(s) affected\n>> SHOW INDEX FROM orders\n+--------+------------+----------------------+--------------+-------------+\n| Table  | Non_unique | Key_name             | Seq_in_index | Column_name |\n+--------+------------+----------------------+--------------+-------------+\n| orders | 0          | PRIMARY              | 1            | order_id    |\n| orders | 1          | idx_orders_cust_date | 1            | customer_id |\n| orders | 1          | idx_orders_cust_date | 2            | order_date  |\n+--------+------------+----------------------+--------------+-------------+\n3 row(s) returned\n>> SELECT order_id, order_date, status FROM orders\n+----------+------------+-----------+\n| order_id | order_date | status    |\n+----------+------------+-----------+\n| 2        | 2024-06-03 | DELIVERED |\n| 6        | 2024-07-02 | DELIVERED |\n+----------+------------+-----------+\n2 row(s) returned",
      explanation: 'In real MySQL the first two EXPLAINs show key = idx_orders_cust_date (type ref / range), while the third shows key = NULL, type = ALL because order_date is not the leftmost column.',
    },
    {
      title: 'UNIQUE index prevents duplicates',
      scenario: 'Product names must be unique in the catalogue. Add a UNIQUE index and try to insert a duplicate.',
      steps: ['Open a new query tab', 'Paste and execute the script', 'The INSERT fails with Error 1062 in the Action Output panel; the count stays 7'],
      code: `CREATE UNIQUE INDEX uq_products_name ON products(name);
INSERT INTO products (name, category, price, stock)
VALUES ('Wireless Mouse', 'Electronics', 750.00, 10);
SELECT COUNT(*) AS products FROM products;`,
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
CREATE UNIQUE INDEX uq_products_name ON products(name);
INSERT INTO products (name, category, price, stock)
VALUES ('Wireless Mouse', 'Electronics', 750.00, 10);
SELECT COUNT(*) AS products FROM products;`,
      result: ">> CREATE UNIQUE INDEX uq_products_name ON products(name) -> 0 row(s) affected\n>> INSERT INTO products (name, category, price, stock) -> ERROR: Error Code: 1062. Duplicate entry for key (products.name)\n>> SELECT COUNT(*) AS products FROM products\n+----------+\n| products |\n+----------+\n| 7        |\n+----------+\n1 row(s) returned",
      explanation: 'A UNIQUE index is both a constraint and a search index. Real MySQL shows: Error Code: 1062. Duplicate entry \'Wireless Mouse\' for key \'products.uq_products_name\'.',
    },
    {
      title: 'EXPLAIN before and after adding an index (real MySQL)',
      scenario: 'A report filtering students by marks feels slow. Check the plan, add an index, and check again.',
      steps: [
        'In real MySQL Workbench open a new query tab and run: USE college;',
        'Run the first EXPLAIN with Ctrl+Enter; the Result Grid shows the plan as rows',
        'Run CREATE INDEX, then the second EXPLAIN, and compare the type, key and rows columns',
      ],
      code: `EXPLAIN SELECT name, marks FROM students WHERE marks > 85;

CREATE INDEX idx_students_marks ON students(marks);

EXPLAIN SELECT name, marks FROM students WHERE marks > 85;

EXPLAIN FORMAT=TREE SELECT name, marks FROM students WHERE marks > 85;`,
      result: `-- BEFORE the index
+----+-------------+----------+------------+------+---------------+------+---------+------+------+----------+-------------+
| id | select_type | table    | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra       |
+----+-------------+----------+------------+------+---------------+------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | students | NULL       | ALL  | NULL          | NULL | NULL    | NULL |   10 |    33.33 | Using where |
+----+-------------+----------+------------+------+---------------+------+---------+------+------+----------+-------------+

-- AFTER CREATE INDEX idx_students_marks
+----+-------------+----------+------------+-------+--------------------+--------------------+---------+------+------+----------+-----------------------+
| id | select_type | table    | partitions | type  | possible_keys      | key                | key_len | ref  | rows | filtered | Extra                 |
+----+-------------+----------+------------+-------+--------------------+--------------------+---------+------+------+----------+-----------------------+
|  1 | SIMPLE      | students | NULL       | range | idx_students_marks | idx_students_marks | 5       | NULL |    3 |   100.00 | Using index condition |
+----+-------------+----------+------------+-------+--------------------+--------------------+---------+------+------+----------+-----------------------+

-- FORMAT=TREE
-> Index range scan on students using idx_students_marks over (85 < marks), with index condition: (students.marks > 85)  (cost=1.61 rows=3)`,
      explanation: 'Before: type ALL, key NULL, rows 10 = full table scan. After: type range using idx_students_marks and only 3 estimated rows. On a 10-million-row table this is the difference between seconds and milliseconds. Note: on very small tables the optimizer may still choose ALL because scanning is cheaper.',
    },
    {
      title: 'Visual Explain in Workbench',
      scenario: 'See the plan of a join query as a diagram and find the full table scan.',
      steps: [
        'Open a new query tab in real MySQL Workbench and run USE ecommerce;',
        'Type the SELECT from the code box and place the cursor inside it',
        'Menu Query > Explain Current Statement (or press Ctrl+Alt+X, or click the magnifier-with-lightning toolbar icon)',
        'The Execution Plan tab opens with a diagram: a "query_block #1" box on top, a "nested loop" box, and one box per table',
        'The orders box is red "Full Table Scan" (status filter, no index); order_items and customers boxes are green "Non-Unique Key Lookup" / "Unique Key Lookup"',
        'Hover each box to read Cost Info and rows; switch the drop-down at the top right from "Visual Explain" to "Tabular Explain" to see the grid',
        'Run CREATE INDEX idx_orders_status ON orders(status); and explain again: the orders box changes to "Non-Unique Key Lookup"',
      ],
      code: `SELECT c.name, o.order_id, SUM(oi.qty * oi.unit_price) AS total
FROM orders o
JOIN customers c    ON c.customer_id = o.customer_id
JOIN order_items oi ON oi.order_id   = o.order_id
WHERE o.status = 'DELIVERED'
GROUP BY c.name, o.order_id;

CREATE INDEX idx_orders_status ON orders(status);`,
      result: `Tabular Explain (before idx_orders_status):
+----+-------------+-------+------------+--------+-----------------------+----------+---------+----------------------------+------+----------+------------------------------+
| id | select_type | table | partitions | type   | possible_keys         | key      | key_len | ref                        | rows | filtered | Extra                        |
+----+-------------+-------+------------+--------+-----------------------+----------+---------+----------------------------+------+----------+------------------------------+
|  1 | SIMPLE      | o     | NULL       | ALL    | PRIMARY,customer_id   | NULL     | NULL    | NULL                       |    8 |    25.00 | Using where; Using temporary |
|  1 | SIMPLE      | c     | NULL       | eq_ref | PRIMARY               | PRIMARY  | 4       | ecommerce.o.customer_id    |    1 |   100.00 | NULL                         |
|  1 | SIMPLE      | oi    | NULL       | ref    | order_id              | order_id | 4       | ecommerce.o.order_id       |    1 |   100.00 | NULL                         |
+----+-------------+-------+------------+--------+-----------------------+----------+---------+----------------------------+------+----------+------------------------------+
Visual Explain: o = Full Table Scan (red), c = Unique Key Lookup (green), oi = Non-Unique Key Lookup (green)`,
      explanation: 'Visual Explain makes the expensive step obvious (red box). The joins already use the PRIMARY and FK indexes; only the status filter scans the whole orders table, which an index on status (or a composite index) fixes.',
    },
    {
      title: 'Sargable rewrite: avoid functions on indexed columns',
      scenario: 'A report uses YEAR(order_date) = 2024 AND MONTH(order_date) = 6. Rewrite it as a date range so an index on order_date can be used, and confirm both return the same rows.',
      steps: ['Open a new query tab', 'Paste and run the script', 'Both result grids are identical, but only the second form can use idx_orders_date (check with EXPLAIN in real MySQL: type ALL vs range)'],
      code: `CREATE INDEX idx_orders_date ON orders(order_date);

-- NOT sargable: function on the column
SELECT order_id, order_date FROM orders
WHERE YEAR(order_date) = 2024 AND MONTH(order_date) = 6;

-- Sargable: plain range on the column
SELECT order_id, order_date FROM orders
WHERE order_date >= '2024-06-01' AND order_date < '2024-07-01';`,
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
CREATE INDEX idx_orders_date ON orders(order_date);
SELECT order_id, order_date FROM orders
WHERE YEAR(order_date) = 2024 AND MONTH(order_date) = 6;
SELECT order_id, order_date FROM orders
WHERE order_date >= '2024-06-01' AND order_date < '2024-07-01';`,
      result: ">> CREATE INDEX idx_orders_date ON orders(order_date) -> 0 row(s) affected\n>> SELECT order_id, order_date FROM orders\n+----------+------------+\n| order_id | order_date |\n+----------+------------+\n| 1        | 2024-06-01 |\n| 2        | 2024-06-03 |\n| 3        | 2024-06-10 |\n| 4        | 2024-06-15 |\n| 5        | 2024-06-20 |\n+----------+------------+\n5 row(s) returned\n>> SELECT order_id, order_date FROM orders\n+----------+------------+\n| order_id | order_date |\n+----------+------------+\n| 1        | 2024-06-01 |\n| 2        | 2024-06-03 |\n| 3        | 2024-06-10 |\n| 4        | 2024-06-15 |\n| 5        | 2024-06-20 |\n+----------+------------+\n5 row(s) returned",
      explanation: 'Same 5 rows, but in MySQL the first version must compute YEAR() and MONTH() for every row (full scan), while the second does an index range scan. Using < first-day-of-next-month also handles DATETIME values correctly.',
    },
  ],
  interview: [
    { q: 'What is an index and why is it used?', a: 'A sorted data structure (B-Tree) on one or more columns that lets MySQL find rows without scanning the whole table. It speeds up reads (WHERE, JOIN, ORDER BY) at the cost of storage and slower writes.', level: 'Easy' },
    { q: 'Difference between clustered and non-clustered (secondary) index in InnoDB?', a: 'The clustered index is the PRIMARY KEY; table rows are physically stored in its order (one per table). Secondary indexes store the indexed columns plus the primary key value, and use it to look up the row.', level: 'Medium' },
    { q: 'Difference between PRIMARY KEY and UNIQUE index?', a: 'Both enforce uniqueness. PRIMARY KEY does not allow NULL and only one exists per table (it is the clustered index). A table may have many UNIQUE indexes, and they allow multiple NULLs.', level: 'Easy' },
    { q: 'Explain the leftmost-prefix rule.', a: 'A composite index (a, b, c) can be used for searches on a, (a, b) or (a, b, c), but not on b or c alone, because the index is sorted by a first.', level: 'Medium' },
    { q: 'What does type = ALL mean in EXPLAIN?', a: 'Full table scan: MySQL reads every row. It is the worst access type and often means a missing or unusable index.', level: 'Easy' },
    { q: 'What is a covering index?', a: 'An index that contains every column needed by the query, so MySQL answers from the index alone without reading table rows. EXPLAIN shows "Using index" in Extra.', level: 'Medium' },
    { q: 'Why might MySQL ignore an index?', a: 'The condition is not sargable (function on column, leading %, implicit type conversion), low selectivity (most rows match), small table, wrong column order in composite index, or outdated statistics (run ANALYZE TABLE).', level: 'Hard' },
    { q: 'What is the difference between EXPLAIN and EXPLAIN ANALYZE?', a: 'EXPLAIN shows the estimated plan without running the query. EXPLAIN ANALYZE (8.0.18+) runs the query and reports actual rows and time per step.', level: 'Medium' },
    { q: 'What do "Using filesort" and "Using temporary" mean?', a: 'Using filesort: MySQL must sort rows itself because no index provides the ORDER BY order. Using temporary: a temporary table is needed (often GROUP BY/DISTINCT on non-indexed columns). Both are signals to consider an index.', level: 'Hard' },
    { q: 'Should you index every column?', a: 'No. Each index uses space and slows INSERT/UPDATE/DELETE. Index columns that are frequently filtered, joined or sorted, with good selectivity.', level: 'Easy' },
    { q: 'How do you open Visual Explain in Workbench?', a: 'Place the cursor in the query and choose Query > Explain Current Statement (Ctrl+Alt+X) or click the explain icon; the Execution Plan tab shows the diagram.', level: 'Easy' },
    { q: 'What is index selectivity / cardinality?', a: 'Cardinality is the number of distinct values in the index (SHOW INDEX column Cardinality). High selectivity (many distinct values, e.g. email) makes an index useful; low selectivity (gender) usually does not.', level: 'Medium' },
  ],
  practice: [
    { task: 'Create an index on enrollments(course_id, grade) and show all indexes of enrollments.', hint: 'CREATE INDEX then SHOW INDEX.', solution: `CREATE INDEX idx_enr_course_grade ON enrollments(course_id, grade);
SHOW INDEX FROM enrollments;` },
    { task: 'Which of these queries can use the index (course_id, grade)? a) WHERE course_id = 101  b) WHERE grade = \'A\'  c) WHERE course_id = 101 AND grade = \'A\'', hint: 'Leftmost prefix.', solution: `-- a) yes (leftmost column)
-- b) no  (grade is not the leftmost column)
-- c) yes (both columns, in order)
EXPLAIN SELECT * FROM enrollments WHERE course_id = 101 AND grade = 'A';` },
    { task: 'Rewrite to be sargable: SELECT * FROM customers WHERE YEAR(signup_date) = 2024;', hint: 'Use a date range.', solution: `SELECT * FROM customers
WHERE signup_date >= '2024-01-01' AND signup_date < '2025-01-01';` },
    { task: 'Drop the index idx_students_city in two different ways (write both statements).', hint: 'DROP INDEX ... ON ... or ALTER TABLE ... DROP INDEX.', solution: `DROP INDEX idx_students_city ON students;
-- or
ALTER TABLE students DROP INDEX idx_students_city;` },
    { task: 'Create a covering index for: SELECT customer_id, status FROM orders WHERE status = \'DELIVERED\'; and verify with EXPLAIN.', hint: 'Index (status, customer_id); Extra should say Using index.', solution: `CREATE INDEX idx_orders_status_cust ON orders(status, customer_id);
EXPLAIN SELECT customer_id, status FROM orders WHERE status = 'DELIVERED';
-- Extra: Using index` },
  ],
  quiz: [
    { question: 'Which EXPLAIN type means a full table scan?', options: ['ref', 'ALL', 'const', 'eq_ref'], answer: 1, explanation: 'type = ALL reads every row.' },
    { question: 'Index (customer_id, order_date) can NOT help which condition?', options: ['WHERE customer_id = 5', 'WHERE customer_id = 5 AND order_date > \'2024-01-01\'', 'WHERE order_date > \'2024-01-01\'', 'WHERE customer_id IN (1,2)'], answer: 2, explanation: 'order_date alone is not the leftmost column.' },
    { question: 'Which WHERE clause is sargable on an indexed name column?', options: ['WHERE UPPER(name) = \'RAHUL\'', 'WHERE name LIKE \'%hul\'', 'WHERE LEFT(name, 3) = \'Rah\'', 'WHERE name LIKE \'Rah%\''], answer: 3, explanation: 'A prefix LIKE without a leading wildcard can use the index.' },
    { question: 'Workbench shortcut for Explain Current Statement:', options: ['Ctrl+Alt+X', 'Ctrl+Shift+Enter', 'Ctrl+B', 'Ctrl+T'], answer: 0, explanation: 'Ctrl+Alt+X opens the Visual Explain execution plan.' },
    { question: 'What is a disadvantage of indexes?', options: ['Slower SELECTs', 'They delete data', 'Slower INSERT/UPDATE/DELETE and extra storage', 'They disable foreign keys'], answer: 2, explanation: 'Every write must also update each index.' },
  ],
};
