export default {
  id: 'mysql-day-24',
  title: 'Transactions: COMMIT, ROLLBACK, SAVEPOINT, ACID, Autocommit, Isolation Levels and Locks',
  module: 'Module 5: Advanced MySQL',
  day: 24,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'A transaction groups several SQL statements into one all-or-nothing unit. Learn START TRANSACTION, COMMIT, ROLLBACK and SAVEPOINT, the ACID properties, how autocommit works in MySQL Workbench, the four isolation levels with their read problems, and row locks, SELECT ... FOR UPDATE and deadlocks.',
  objectives: [
    'Use START TRANSACTION, COMMIT, ROLLBACK and SAVEPOINT correctly',
    'Explain Atomicity, Consistency, Isolation and Durability with examples',
    'Control autocommit in SQL and with the Workbench toolbar buttons',
    'Compare READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ and SERIALIZABLE',
    'Understand shared/exclusive locks, SELECT ... FOR UPDATE and deadlocks',
  ],
  theory: [
    {
      heading: '1. What is a transaction?',
      content: 'A transaction is a sequence of statements that must succeed or fail as a single unit. Classic example: a bank transfer debits one account and credits another. If the server crashes after the debit, the money must not disappear. Transactions work on transactional engines such as InnoDB (the default); MyISAM ignores them.',
      syntax: `START TRANSACTION;          -- or BEGIN;
UPDATE accounts SET balance = balance - 5000 WHERE acc_no = 101;
UPDATE accounts SET balance = balance + 5000 WHERE acc_no = 102;
COMMIT;                     -- make permanent
-- or ROLLBACK;             -- undo everything since START TRANSACTION`,
    },
    {
      heading: '2. ACID properties',
      content: 'Every reliable database transaction follows ACID:',
      points: [
        'Atomicity: all statements succeed or none do (ROLLBACK undoes partial work; InnoDB uses the undo log)',
        'Consistency: the database moves from one valid state to another; constraints (PK, FK, CHECK) are never violated',
        'Isolation: concurrent transactions do not see each other\'s uncommitted changes (controlled by isolation level)',
        'Durability: once COMMIT returns, the change survives a crash or power failure (InnoDB redo log)',
      ],
    },
    {
      heading: '3. SAVEPOINT and partial rollback',
      content: 'SAVEPOINT name marks a point inside a transaction. ROLLBACK TO SAVEPOINT name undoes only the work done after that point; the transaction stays open and you still need COMMIT or ROLLBACK. RELEASE SAVEPOINT name removes the marker.',
      syntax: `START TRANSACTION;
INSERT ...;            -- step 1
SAVEPOINT after_step1;
DELETE ...;            -- step 2 (mistake)
ROLLBACK TO SAVEPOINT after_step1;   -- undo step 2 only
COMMIT;                -- step 1 is saved`,
    },
    {
      heading: '4. Autocommit in MySQL and Workbench',
      content: 'By default autocommit = 1: every single statement is its own transaction and is committed immediately. START TRANSACTION temporarily suspends autocommit until COMMIT/ROLLBACK. SET autocommit = 0; turns it off for the session, so every change waits for an explicit COMMIT.',
      points: [
        'Workbench SQL Editor toolbar has a "Toggle auto-commit mode" button (icon with a check mark and a database). When it is off, the "Commit" and "Rollback" toolbar buttons become active',
        'Statements that cause an implicit COMMIT: CREATE/ALTER/DROP TABLE, TRUNCATE, CREATE INDEX, CREATE USER, GRANT, LOCK TABLES. DDL cannot be rolled back',
        'Closing a Workbench tab/connection with uncommitted work: Workbench asks whether to commit; the server otherwise rolls it back',
        'Check the mode with SELECT @@autocommit;',
      ],
    },
    {
      heading: '5. Isolation levels and read problems',
      content: 'Isolation controls what one transaction can see of another running transaction. Problems: Dirty read (reading uncommitted data of another transaction), Non-repeatable read (the same row read twice gives different values because another transaction committed an update), Phantom read (the same query returns new rows inserted and committed by another transaction).',
      points: [
        'READ UNCOMMITTED: allows dirty, non-repeatable and phantom reads (fastest, rarely used)',
        'READ COMMITTED: no dirty reads; non-repeatable and phantom reads possible (default in Oracle, SQL Server, PostgreSQL)',
        'REPEATABLE READ: MySQL InnoDB DEFAULT; no dirty or non-repeatable reads; InnoDB also prevents most phantoms with consistent snapshots and next-key locks',
        'SERIALIZABLE: strictest; plain SELECTs take shared locks, transactions behave as if run one after another (slowest)',
      ],
      syntax: `SELECT @@transaction_isolation;                 -- REPEATABLE-READ
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;  -- only the next transaction`,
    },
    {
      heading: '6. Locks, SELECT ... FOR UPDATE and deadlocks',
      content: 'InnoDB uses row-level locks. A shared lock (S, SELECT ... FOR SHARE) lets others read but not change the row; an exclusive lock (X, taken by UPDATE/DELETE or SELECT ... FOR UPDATE) blocks other writers and locking readers until COMMIT/ROLLBACK. A waiting transaction fails with Error 1205 (Lock wait timeout exceeded) after innodb_lock_wait_timeout (50 s). A deadlock happens when T1 waits for T2 and T2 waits for T1; InnoDB detects it immediately and rolls back one of them with Error 1213 (Deadlock found when trying to get lock; try restarting transaction).',
      points: [
        'Keep transactions short; never wait for user input inside a transaction',
        'Access tables/rows in the same order in every transaction to avoid deadlocks',
        'Use SELECT ... FOR UPDATE to read-then-update safely (stock, seat booking, balance)',
        'SHOW ENGINE INNODB STATUS shows the latest deadlock; performance_schema.data_locks shows current locks',
        'LOCK TABLES t WRITE / UNLOCK TABLES locks whole tables (mostly for MyISAM or maintenance)',
      ],
      tip: 'The browser Workbench Lab supports START TRANSACTION, COMMIT, ROLLBACK and SAVEPOINT in a single session. Isolation levels and locking need two real Workbench connections (two query tabs opened from two connections).',
    },
  ],
  examples: [
    {
      title: 'Bank transfer with COMMIT',
      scenario: 'Transfer 5,000 from account 101 to account 102 so that both updates are saved together.',
      steps: [
        'In MySQL Workbench: open the Local instance MySQL80 connection',
        'File > New Query Tab, paste the script',
        'Press Ctrl+Shift+Enter; the Action Output shows each statement including START TRANSACTION and COMMIT',
      ],
      code: `CREATE TABLE accounts (
  acc_no  INT PRIMARY KEY,
  holder  VARCHAR(50) NOT NULL,
  balance DECIMAL(12,2) NOT NULL CHECK (balance >= 0)
);
INSERT INTO accounts VALUES (101,'Aarav',20000.00),(102,'Diya',5000.00),(103,'Rohan',1000.00);

START TRANSACTION;
UPDATE accounts SET balance = balance - 5000 WHERE acc_no = 101;
UPDATE accounts SET balance = balance + 5000 WHERE acc_no = 102;
COMMIT;

SELECT * FROM accounts;`,
      mysql: `CREATE DATABASE IF NOT EXISTS bank;
USE bank;
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
  acc_no  INT PRIMARY KEY,
  holder  VARCHAR(50) NOT NULL,
  balance DECIMAL(12,2) NOT NULL CHECK (balance >= 0)
);
INSERT INTO accounts VALUES (101,'Aarav',20000.00),(102,'Diya',5000.00),(103,'Rohan',1000.00);
START TRANSACTION;
UPDATE accounts SET balance = balance - 5000 WHERE acc_no = 101;
UPDATE accounts SET balance = balance + 5000 WHERE acc_no = 102;
COMMIT;
SELECT * FROM accounts;`,
      result: ">> CREATE DATABASE IF NOT EXISTS bank -> 1 row(s) affected\n>> USE bank -> 0 row(s) affected\n>> DROP TABLE IF EXISTS accounts -> 0 row(s) affected\n>> CREATE TABLE accounts ( -> 0 row(s) affected\n>> INSERT INTO accounts VALUES (101,'Aarav',20000.00),(102,'Diya',5000.00 -> 3 row(s) affected Records: 3  Duplicates: 0  Warnings: 0\n>> START TRANSACTION -> 0 row(s) affected\n>> UPDATE accounts SET balance = balance - 5000 WHERE acc_no = 101 -> 1 row(s) affected Rows matched: 1  Changed: 1  Warnings: 0\n>> UPDATE accounts SET balance = balance + 5000 WHERE acc_no = 102 -> 1 row(s) affected Rows matched: 1  Changed: 1  Warnings: 0\n>> COMMIT -> 0 row(s) affected\n>> SELECT * FROM accounts\n+--------+--------+---------+\n| acc_no | holder | balance |\n+--------+--------+---------+\n| 101    | Aarav  | 15000   |\n| 102    | Diya   | 10000   |\n| 103    | Rohan  | 1000    |\n+--------+--------+---------+\n3 row(s) returned",
      explanation: 'Both updates were committed together. Total money in the bank is still 26,000 (Consistency). If the server had crashed between the two UPDATEs, InnoDB would have undone the first one on restart (Atomicity).',
    },
    {
      title: 'ROLLBACK: undo a mistake',
      scenario: 'A clerk accidentally sets every balance to 0 inside a transaction. Undo it before committing.',
      steps: ['Open a new query tab', 'Paste the script and execute', 'Result 1 shows the wrong data (visible inside the transaction), Result 2 shows the restored data after ROLLBACK'],
      code: `START TRANSACTION;
UPDATE accounts SET balance = 0;          -- forgot WHERE!
SELECT * FROM accounts;                   -- all zero (only inside this transaction)
ROLLBACK;
SELECT * FROM accounts;                   -- original balances are back`,
      mysql: `CREATE DATABASE IF NOT EXISTS bank;
USE bank;
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
  acc_no  INT PRIMARY KEY,
  holder  VARCHAR(50) NOT NULL,
  balance DECIMAL(12,2) NOT NULL CHECK (balance >= 0)
);
INSERT INTO accounts VALUES (101,'Aarav',15000.00),(102,'Diya',10000.00),(103,'Rohan',1000.00);
START TRANSACTION;
UPDATE accounts SET balance = 0;
SELECT * FROM accounts;
ROLLBACK;
SELECT * FROM accounts;`,
      result: ">> CREATE DATABASE IF NOT EXISTS bank -> 1 row(s) affected\n>> USE bank -> 0 row(s) affected\n>> DROP TABLE IF EXISTS accounts -> 0 row(s) affected\n>> CREATE TABLE accounts ( -> 0 row(s) affected\n>> INSERT INTO accounts VALUES (101,'Aarav',15000.00),(102,'Diya',10000.0 -> 3 row(s) affected Records: 3  Duplicates: 0  Warnings: 0\n>> START TRANSACTION -> 0 row(s) affected\n>> UPDATE accounts SET balance = 0 -> 3 row(s) affected Rows matched: 3  Changed: 3  Warnings: 0\n>> SELECT * FROM accounts\n+--------+--------+---------+\n| acc_no | holder | balance |\n+--------+--------+---------+\n| 101    | Aarav  | 0       |\n| 102    | Diya   | 0       |\n| 103    | Rohan  | 0       |\n+--------+--------+---------+\n3 row(s) returned\n>> ROLLBACK -> 0 row(s) affected\n>> SELECT * FROM accounts\n+--------+--------+---------+\n| acc_no | holder | balance |\n+--------+--------+---------+\n| 101    | Aarav  | 15000   |\n| 102    | Diya   | 10000   |\n| 103    | Rohan  | 1000    |\n+--------+--------+---------+\n3 row(s) returned",
      explanation: 'Until COMMIT, changes are provisional. ROLLBACK discards every change made since START TRANSACTION. With autocommit on and no START TRANSACTION, the UPDATE would have been permanent immediately (and Workbench Safe Updates would have blocked it, Error 1175).',
    },
    {
      title: 'SAVEPOINT: keep step 1, undo step 2',
      scenario: 'While closing the semester, the admin adds a new course enrollment, then wrongly deletes all enrollments of a student. Undo only the delete.',
      steps: ['Open a new query tab', 'Paste the script (creates college) and execute', 'Compare the counts in the Result Grids'],
      code: `START TRANSACTION;
INSERT INTO enrollments (student_id, course_id, grade) VALUES (10, 102, 'B');
SAVEPOINT after_insert;
DELETE FROM enrollments WHERE student_id = 1;
SELECT COUNT(*) FROM enrollments;           -- 11
ROLLBACK TO SAVEPOINT after_insert;
COMMIT;
SELECT COUNT(*) FROM enrollments;           -- 13`,
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
SELECT COUNT(*) AS before_tx FROM enrollments;
START TRANSACTION;
INSERT INTO enrollments (student_id, course_id, grade) VALUES (10, 102, 'B');
SAVEPOINT after_insert;
DELETE FROM enrollments WHERE student_id = 1;
SELECT COUNT(*) AS inside_tx FROM enrollments;
ROLLBACK TO SAVEPOINT after_insert;
COMMIT;
SELECT COUNT(*) AS after_commit FROM enrollments;
SELECT student_id, course_id, grade FROM enrollments WHERE student_id IN (1, 10);`,
      result: ">> SELECT COUNT(*) AS before_tx FROM enrollments\n+-----------+\n| before_tx |\n+-----------+\n| 12        |\n+-----------+\n1 row(s) returned\n>> START TRANSACTION -> 0 row(s) affected\n>> INSERT INTO enrollments (student_id, course_id, grade) VALUES (10, 102 -> 1 row(s) affected\n>> SAVEPOINT after_insert -> 0 row(s) affected\n>> DELETE FROM enrollments WHERE student_id = 1 -> 2 row(s) affected\n>> SELECT COUNT(*) AS inside_tx FROM enrollments\n+-----------+\n| inside_tx |\n+-----------+\n| 11        |\n+-----------+\n1 row(s) returned\n>> ROLLBACK TO SAVEPOINT after_insert -> 0 row(s) affected\n>> COMMIT -> 0 row(s) affected\n>> SELECT COUNT(*) AS after_commit FROM enrollments\n+--------------+\n| after_commit |\n+--------------+\n| 13           |\n+--------------+\n1 row(s) returned\n>> SELECT student_id, course_id, grade FROM enrollments WHERE student_id \n+------------+-----------+-------+\n| student_id | course_id | grade |\n+------------+-----------+-------+\n| 1          | 101       | A     |\n| 1          | 102       | B     |\n| 10         | 102       | B     |\n+------------+-----------+-------+\n3 row(s) returned",
      explanation: '12 rows before. Inside the transaction: +1 insert, -2 deletes = 11. ROLLBACK TO SAVEPOINT undid only the delete, COMMIT saved the insert, so 13 rows remain and student 1 still has both courses.',
    },
    {
      title: 'All-or-nothing order: an error forces ROLLBACK',
      scenario: 'An order is created, but its item refers to a product that does not exist (FK error). The whole order must be cancelled.',
      steps: [
        'Open a new query tab, paste the script and press Ctrl+Shift+Enter',
        'Workbench continues after the error only if "Continue on SQL error" (Query menu) is on; otherwise run the remaining lines with Ctrl+Enter',
        'The second INSERT fails with a foreign key error; ROLLBACK removes the order header too',
      ],
      code: `START TRANSACTION;
INSERT INTO orders (customer_id, order_date, status) VALUES (6, '2024-07-25', 'PLACED');
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (9, 99, 1, 500.00);
-- Error Code: 1452. Cannot add or update a child row: a foreign key constraint fails
ROLLBACK;
SELECT COUNT(*) FROM orders;   -- still 8`,
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
SELECT COUNT(*) AS orders_inside_tx FROM orders;
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (9, 99, 1, 500.00);
ROLLBACK;
SELECT COUNT(*) AS orders_after_rollback FROM orders;`,
      result: ">> START TRANSACTION -> 0 row(s) affected\n>> INSERT INTO orders (customer_id, order_date, status) VALUES (6, '2024- -> 1 row(s) affected\n>> SELECT COUNT(*) AS orders_inside_tx FROM orders\n+------------------+\n| orders_inside_tx |\n+------------------+\n| 9                |\n+------------------+\n1 row(s) returned\n>> INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES -> ERROR: Error Code: 1452. Cannot add or update a child row: a foreign key constraint fails\n>> ROLLBACK -> 0 row(s) affected\n>> SELECT COUNT(*) AS orders_after_rollback FROM orders\n+-----------------------+\n| orders_after_rollback |\n+-----------------------+\n| 8                     |\n+-----------------------+\n1 row(s) returned",
      explanation: 'In MySQL a failed statement does not automatically roll back the whole transaction; the order header (order 9) would remain if we committed. The application (or a stored procedure EXIT HANDLER, Day 22) must issue ROLLBACK when any step fails.',
    },
    {
      title: 'Autocommit OFF in Workbench (toolbar) and implicit commit',
      scenario: 'Practise working with autocommit disabled, the Workbench Commit/Rollback buttons, and see that DDL commits automatically.',
      steps: [
        'In real MySQL Workbench open a query tab on the bank database (USE bank;)',
        'Click the toolbar button "Toggle auto-commit mode" (to the right of the execute buttons) so it is switched OFF; the Commit (check) and Rollback (X) toolbar icons become enabled',
        'Run the UPDATE with Ctrl+Enter, then SELECT: the change is visible in this tab',
        'Open a SECOND connection tab (Home > Local instance again) and SELECT the same row: the old value is shown (uncommitted)',
        'Back in the first tab click the Rollback toolbar icon; the change is undone',
        'Repeat the UPDATE, then run CREATE TABLE tmp_x (id INT); this DDL causes an implicit COMMIT, so a Rollback afterwards cannot undo the UPDATE',
        'Turn auto-commit back ON when done',
      ],
      code: `SET autocommit = 0;               -- same as toolbar toggle OFF
SELECT @@autocommit;               -- 0
UPDATE accounts SET balance = balance + 100 WHERE acc_no = 103;
ROLLBACK;                          -- undone

UPDATE accounts SET balance = balance + 100 WHERE acc_no = 103;
CREATE TABLE tmp_x (id INT);       -- implicit COMMIT happens here
ROLLBACK;                          -- nothing to roll back
SELECT balance FROM accounts WHERE acc_no = 103;
SET autocommit = 1;`,
      result: `SELECT @@autocommit
+--------------+
| @@autocommit |
+--------------+
|            0 |
+--------------+
UPDATE accounts ... acc_no = 103   1 row(s) affected Rows matched: 1  Changed: 1  Warnings: 0
ROLLBACK                           0 row(s) affected
UPDATE accounts ... acc_no = 103   1 row(s) affected Rows matched: 1  Changed: 1  Warnings: 0
CREATE TABLE tmp_x (id INT)        0 row(s) affected
ROLLBACK                           0 row(s) affected
SELECT balance FROM accounts WHERE acc_no = 103
+---------+
| balance |
+---------+
| 1100.00 |
+---------+`,
      explanation: 'The first +100 was rolled back. The second +100 was committed implicitly by CREATE TABLE, so the balance is 1100.00 even though ROLLBACK was issued afterwards.',
    },
    {
      title: 'Isolation levels and locking with two sessions',
      scenario: 'See REPEATABLE READ snapshots, a dirty read under READ UNCOMMITTED, and a row lock with SELECT ... FOR UPDATE.',
      steps: [
        'Real MySQL Workbench: open the Local instance connection twice (two connection tabs = Session A and Session B), run USE bank; in both',
        'Follow the numbered statements below, alternating between Session A and Session B',
        'At step B4 Session B shows the spinning "Running..." indicator because it waits for A\'s lock; after A commits (A5) it completes',
        'Run SELECT * FROM performance_schema.data_locks; in a third tab while B is waiting to see the X lock',
      ],
      code: `-- Part 1: REPEATABLE READ (MySQL default)
-- A1: START TRANSACTION; SELECT balance FROM accounts WHERE acc_no = 102;   -> 10000.00
-- B1: UPDATE accounts SET balance = 9000 WHERE acc_no = 102;  (autocommit)
-- A2: SELECT balance FROM accounts WHERE acc_no = 102;   -> still 10000.00 (snapshot)
-- A3: COMMIT; SELECT balance FROM accounts WHERE acc_no = 102;   -> 9000.00

-- Part 2: dirty read
-- A1: SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
-- B1: START TRANSACTION; UPDATE accounts SET balance = 0 WHERE acc_no = 101;
-- A2: SELECT balance FROM accounts WHERE acc_no = 101;   -> 0.00 (dirty, never committed!)
-- B2: ROLLBACK;
-- A3: SELECT balance FROM accounts WHERE acc_no = 101;   -> 15000.00

-- Part 3: row lock with FOR UPDATE
-- A4: START TRANSACTION; SELECT * FROM accounts WHERE acc_no = 103 FOR UPDATE;
-- B4: UPDATE accounts SET balance = balance - 50 WHERE acc_no = 103;   -- waits...
-- A5: UPDATE accounts SET balance = balance + 500 WHERE acc_no = 103; COMMIT;
-- B4 finishes: 1 row(s) affected   (or after 50 s: Error Code: 1205. Lock wait timeout exceeded)`,
      result: `Session A Part 1:  A1 10000.00 | A2 10000.00 | A3 9000.00
Session A Part 2:  A2 0.00 (dirty read) | A3 15000.00
Session B Part 3:  B4 blocked while A holds the lock, then "1 row(s) affected"
Final: SELECT balance FROM accounts WHERE acc_no = 103  ->  1550.00   (1100 from the previous example + 500 - 50)
SELECT @@transaction_isolation;  ->  REPEATABLE-READ   (new session default)`,
      explanation: 'REPEATABLE READ gives each transaction a consistent snapshot, so A kept seeing 10000 until it committed. READ UNCOMMITTED let A read a value that was later rolled back (dirty read). FOR UPDATE placed an exclusive lock so B had to wait, which prevents lost updates.',
    },
  ],
  interview: [
    { q: 'What is a transaction?', a: 'A logical unit of work made of one or more SQL statements that must all succeed (COMMIT) or all be undone (ROLLBACK).', level: 'Easy' },
    { q: 'Explain ACID.', a: 'Atomicity (all or nothing), Consistency (constraints always hold), Isolation (concurrent transactions do not interfere), Durability (committed data survives crashes).', level: 'Easy' },
    { q: 'What is the default isolation level in MySQL InnoDB?', a: 'REPEATABLE READ.', level: 'Easy' },
    { q: 'What is autocommit?', a: 'A session mode (default ON) where each statement is committed automatically. START TRANSACTION or SET autocommit = 0 lets you group statements and commit manually.', level: 'Easy' },
    { q: 'What is a SAVEPOINT?', a: 'A named point inside a transaction. ROLLBACK TO SAVEPOINT undoes only the work after it, keeping the transaction open.', level: 'Medium' },
    { q: 'Can you roll back a DROP TABLE or TRUNCATE?', a: 'No. DDL statements cause an implicit commit in MySQL and cannot be rolled back.', level: 'Medium' },
    { q: 'Explain dirty read, non-repeatable read and phantom read.', a: 'Dirty: reading another transaction\'s uncommitted change. Non-repeatable: re-reading a row gives a different value because another transaction committed an update. Phantom: re-running a range query returns new rows inserted by another committed transaction.', level: 'Medium' },
    { q: 'Which isolation level prevents all three anomalies?', a: 'SERIALIZABLE (InnoDB REPEATABLE READ also prevents most phantoms via MVCC snapshots and next-key locks).', level: 'Medium' },
    { q: 'What does SELECT ... FOR UPDATE do?', a: 'It reads rows and places exclusive locks on them until the transaction ends, so other transactions cannot modify or lock them. Used for read-modify-write such as stock or seat booking.', level: 'Medium' },
    { q: 'What is a deadlock and how does MySQL handle it?', a: 'Two transactions each hold a lock the other needs. InnoDB detects the cycle and rolls back the cheaper transaction with Error 1213; the application should retry it.', level: 'Hard' },
    { q: 'What is MVCC?', a: 'Multi-Version Concurrency Control: InnoDB keeps old row versions in the undo log so readers see a consistent snapshot without blocking writers.', level: 'Hard' },
    { q: 'If one statement in a transaction fails, does MySQL roll back the whole transaction?', a: 'Usually no; only the failed statement is undone (deadlock and some errors are exceptions). The application must explicitly ROLLBACK.', level: 'Hard' },
  ],
  practice: [
    { task: 'Transfer 2,000 from account 102 to 103 in a transaction and commit.', hint: 'Two UPDATEs between START TRANSACTION and COMMIT.', solution: `START TRANSACTION;
UPDATE accounts SET balance = balance - 2000 WHERE acc_no = 102;
UPDATE accounts SET balance = balance + 2000 WHERE acc_no = 103;
COMMIT;` },
    { task: 'Insert two new students in a transaction, set a savepoint after the first, roll back the second and commit.', hint: 'SAVEPOINT s1; ROLLBACK TO SAVEPOINT s1;', solution: `START TRANSACTION;
INSERT INTO students (name, gender, city, dept_id, marks) VALUES ('Nikhil Jain','M','Indore',1,70);
SAVEPOINT s1;
INSERT INTO students (name, gender, city, dept_id, marks) VALUES ('Test Row','M','X',1,0);
ROLLBACK TO SAVEPOINT s1;
COMMIT;` },
    { task: 'Show the current isolation level and change it to READ COMMITTED for your session.', hint: '@@transaction_isolation.', solution: `SELECT @@transaction_isolation;
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SELECT @@transaction_isolation;` },
    { task: 'Safely reduce stock of product 3 by 1 when two customers buy at the same time.', hint: 'Lock the row with FOR UPDATE before checking stock.', solution: `START TRANSACTION;
SELECT stock FROM products WHERE product_id = 3 FOR UPDATE;
UPDATE products SET stock = stock - 1 WHERE product_id = 3 AND stock > 0;
COMMIT;` },
    { task: 'Explain the output: SET autocommit=0; DELETE FROM accounts WHERE acc_no=103; then close the connection without COMMIT.', hint: 'Uncommitted work at disconnect.', solution: `-- The DELETE was never committed.
-- When the session ends, the server rolls back the open transaction,
-- so account 103 still exists. (Workbench asks whether to commit before closing.)` },
  ],
  quiz: [
    { question: 'Which property guarantees committed data survives a crash?', options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], answer: 3, explanation: 'Durability, implemented by the InnoDB redo log.' },
    { question: 'What is MySQL InnoDB\'s default isolation level?', options: ['READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE', 'READ UNCOMMITTED'], answer: 1, explanation: 'InnoDB defaults to REPEATABLE READ.' },
    { question: 'Which statement causes an implicit COMMIT?', options: ['CREATE TABLE', 'SELECT', 'UPDATE', 'SAVEPOINT'], answer: 0, explanation: 'DDL statements commit the current transaction.' },
    { question: 'ROLLBACK TO SAVEPOINT sp1 does what?', options: ['Ends the transaction', 'Undoes everything', 'Undoes only work after sp1 and keeps the transaction open', 'Commits work before sp1'], answer: 2, explanation: 'Partial rollback; you still need COMMIT or ROLLBACK.' },
    { question: 'Error 1213 means:', options: ['Lock wait timeout', 'Deadlock detected, transaction rolled back', 'Duplicate key', 'Table does not exist'], answer: 1, explanation: '1213 = Deadlock found when trying to get lock.' },
  ],
};
