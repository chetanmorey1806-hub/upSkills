export default {
  id: "day-06-insert-data",
  title: "INSERT: Single Row, Multiple Rows, INSERT ... SELECT, INSERT IGNORE and Editing Rows in the Result Grid",
  module: "Module 2: CRUD Operations",
  day: 6,
  level: "Beginner",
  duration: "2 hours",
  summary: "Add data to tables in every common way: one row, many rows in one statement, copying rows from another table with INSERT ... SELECT, skipping duplicates with INSERT IGNORE, and adding or editing rows directly in the Workbench Result Grid with Apply. Learn how AUTO_INCREMENT, DEFAULT and NULL behave during inserts and how to read the \"Records / Duplicates / Warnings\" message.",
  objectives: [
    "Write INSERT statements with and without a column list",
    "Insert many rows in one statement and understand why it is faster",
    "Copy data between tables using INSERT ... SELECT",
    "Use INSERT IGNORE and know its risks",
    "Insert and edit rows in the Workbench Result Grid and apply the changes"
  ],
  theory: [
    {
      heading: "INSERT INTO ... VALUES (Single Row)",
      content: "INSERT adds new rows to a table. The safest form lists the columns explicitly, then gives values in the same order. Text and dates go in single quotes, numbers without quotes, and NULL without quotes.",
      syntax: `-- Recommended: with a column list
INSERT INTO table_name (col1, col2, col3)
VALUES (value1, value2, value3);

-- Without a column list: you must give a value for EVERY column, in table order
INSERT INTO departments VALUES (6, 'Biology', 'Block F');

-- MySQL extra syntax (SET form)
INSERT INTO departments SET dept_name = 'Biology', building = 'Block F';`,
      points: [
        "Columns left out of the list get their DEFAULT value, or NULL if there is no default, or the next AUTO_INCREMENT number.",
        "Use NULL (or omit the column) for the AUTO_INCREMENT id to let MySQL generate it.",
        "Wrong number of values gives Error 1136 \"Column count doesn't match value count at row 1\".",
        "Dates must be 'YYYY-MM-DD'. '15-03-2004' gives Error 1292 \"Incorrect date value\" in strict mode.",
        "A single quote inside text is written twice: 'O''Brien' or escaped: 'O\\'Brien'.",
        "Strict mode (default in MySQL 8: STRICT_TRANS_TABLES) rejects too-long strings (Error 1406 Data too long) instead of silently cutting them."
      ],
      tip: "Always use a column list in application code. If someone later adds a column to the table, INSERTs without a column list break."
    },
    {
      heading: "Multi-Row INSERT",
      content: "One INSERT can add many rows by separating value groups with commas. It is much faster than many single-row INSERTs because the statement is parsed once and sent in one network round trip. The result message says e.g. \"3 row(s) affected Records: 3 Duplicates: 0 Warnings: 0\".",
      syntax: `INSERT INTO courses (course_name, dept_id, credits, fee) VALUES
('Machine Learning', 1, 4, 15000),
('Calculus',         2, 3,  8000),
('Optics',           3, 3,  9000);`,
      points: [
        "If any row fails a constraint, the whole multi-row INSERT fails in InnoDB (no partial insert) - unless you use INSERT IGNORE.",
        "Keep batches reasonable (a few thousand rows); the statement size is limited by max_allowed_packet (64 MB by default in 8.0).",
        "For very large files use LOAD DATA INFILE or the Table Data Import Wizard (Day 10)."
      ]
    },
    {
      heading: "INSERT ... SELECT (Copy Rows from a Query)",
      content: "Instead of VALUES you can write a SELECT. Every row returned by the SELECT is inserted. This is used for archiving, building summary tables, copying data into a new structure and backing up rows before a risky update.",
      syntax: `INSERT INTO target_table (col1, col2)
SELECT colA, colB
FROM source_table
WHERE condition;`,
      points: [
        "The number and order of SELECT columns must match the target column list; names do not have to match.",
        "You can use expressions: CONCAT(first_name, ' ', last_name), marks * 1.1, CURDATE().",
        "CREATE TABLE new_table AS SELECT ... creates and fills a table in one go (no keys are copied)."
      ]
    },
    {
      heading: "INSERT IGNORE, REPLACE and ON DUPLICATE KEY UPDATE",
      content: "Normally a duplicate primary/unique key stops the INSERT with Error 1062. MySQL offers three ways to handle duplicates:",
      points: [
        "INSERT IGNORE: rows that would cause duplicate-key (or some other) errors are skipped with a warning; the remaining rows are inserted. Run SHOW WARNINGS; to see what was skipped.",
        "REPLACE INTO: if a row with the same key exists it is DELETED and the new row is inserted (affected rows = 2). Danger: columns you do not supply are reset, and ON DELETE CASCADE children are deleted.",
        "INSERT ... ON DUPLICATE KEY UPDATE col = VALUES(col): insert new rows, update existing ones (\"upsert\"). Most useful for counters and syncing data.",
        "INSERT IGNORE also turns some data errors (too long, invalid values) into warnings, so bad data can slip in. Use it consciously."
      ],
      syntax: `INSERT IGNORE INTO students (first_name, email) VALUES ('Riya', 'aarav.sharma@college.edu');

INSERT INTO stock (product_id, qty) VALUES (5, 10)
ON DUPLICATE KEY UPDATE qty = qty + 10;`
    },
    {
      heading: "Inserting and Editing Rows in the Workbench Result Grid",
      content: "Workbench lets you add data like a spreadsheet. It only works when the result comes from ONE table that has a primary key (otherwise the grid is Read Only).",
      points: [
        "Step 1: In the Navigator hover over the table and click the grid icon (Select Rows - Limit 1000), or run SELECT * FROM table;",
        "Step 2: Scroll to the last empty row marked with an asterisk (*) or click \"Insert new row\" in the Result Grid toolbar (Edit: section).",
        "Step 3: Double-click each cell and type the value. Leave the AUTO_INCREMENT id empty. Press Tab to move to the next cell.",
        "Step 4: To edit an existing value double-click the cell, type, press Enter. Changed cells are highlighted.",
        "Step 5: Click Apply (bottom-right of the result area). The \"Apply SQL Script to Database\" dialog shows the generated INSERT/UPDATE statements. Click Apply, then Finish.",
        "Click Revert to discard unapplied edits. Right-click a cell > Set Field to NULL to store NULL; \"Delete Row(s)\" removes a row (also needs Apply).",
        "If auto-commit is off, you must also click Commit in the query toolbar."
      ],
      tip: "Grid editing is great for fixing a few values. For more than a handful of rows, write an INSERT/UPDATE statement or use the Import Wizard - it is repeatable and reviewable."
    }
  ],
  examples: [
    {
      title: "Single-row INSERT with and without a column list",
      scenario: "A new department \"Biology\" opens, and a new student joins Computer Science.",
      steps: [
        "In MySQL Workbench: open the Local instance connection (run the college setup from Day 4 first)",
        "File > New Query Tab",
        "Type the statements and press Ctrl+Shift+Enter",
        "Check the Action Output: each INSERT says \"1 row(s) affected\""
      ],
      code: `-- without a column list: a value for every column in order
INSERT INTO departments VALUES (6, 'Biology', 'Block F');

-- with a column list: student_id auto-generated, last_name and city left NULL
INSERT INTO students (first_name, email, gender, dob, dept_id, marks, fees, admission_date)
VALUES ('Riya', 'riya.shah@college.edu', 'F', '2005-06-12', 1, 79, 85000, '2024-07-01');

SELECT * FROM departments WHERE dept_id = 6;
SELECT student_id, first_name, last_name, city, dept_id FROM students WHERE first_name = 'Riya';`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id INT AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL UNIQUE,
  building VARCHAR(20)
);
INSERT INTO departments (dept_name, building) VALUES
('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),
('Commerce','Block D'),('History','Block E');
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30),
  email VARCHAR(80) UNIQUE,
  gender CHAR(1),
  dob DATE,
  city VARCHAR(30),
  dept_id INT,
  marks INT,
  fees INT,
  admission_date DATE,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
INSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES
('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),
('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),
('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),
('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),
('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),
('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),
('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),
('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),
('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),
('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');
INSERT INTO departments VALUES (6, 'Biology', 'Block F');
INSERT INTO students (first_name, email, gender, dob, dept_id, marks, fees, admission_date)
VALUES ('Riya', 'riya.shah@college.edu', 'F', '2005-06-12', 1, 79, 85000, '2024-07-01');
SELECT * FROM departments WHERE dept_id = 6;
SELECT student_id, first_name, last_name, city, dept_id FROM students WHERE first_name = 'Riya';`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected
>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected
>> DROP TABLE IF EXISTS courses -> 0 row(s) affected
>> DROP TABLE IF EXISTS students -> 0 row(s) affected
>> DROP TABLE IF EXISTS departments -> 0 row(s) affected
>> CREATE TABLE departments ( -> 0 row(s) affected
>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0
>> CREATE TABLE students ( -> 0 row(s) affected
>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0
>> INSERT INTO departments VALUES (6, 'Biology', 'Block F') -> 1 row(s) affected
>> INSERT INTO students (first_name, email, gender, dob, dept_id, marks,  -> 1 row(s) affected
>> SELECT * FROM departments WHERE dept_id = 6
+---------+-----------+----------+
| dept_id | dept_name | building |
+---------+-----------+----------+
| 6       | Biology   | Block F  |
+---------+-----------+----------+
1 row(s) returned
>> SELECT student_id, first_name, last_name, city, dept_id FROM students 
+------------+------------+-----------+------+---------+
| student_id | first_name | last_name | city | dept_id |
+------------+------------+-----------+------+---------+
| 11         | Riya       | NULL      | NULL | 1       |
+------------+------------+-----------+------+---------+
1 row(s) returned`,
      explanation: "Riya got student_id 11 automatically (the next AUTO_INCREMENT value). last_name and city were not in the column list and have no DEFAULT, so they are NULL. The departments INSERT without a column list needed exactly 3 values in the table's column order."
    },
    {
      title: "Multi-row INSERT",
      scenario: "Add three new courses in a single statement.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type the statement",
        "Press Ctrl+Shift+Enter",
        "Action Output shows \"3 row(s) affected Records: 3 Duplicates: 0 Warnings: 0\""
      ],
      code: `INSERT INTO courses (course_name, dept_id, credits, fee) VALUES
('Machine Learning', 1, 4, 15000),
('Calculus',         2, 3,  8000),
('Optics',           3, 3,  9000);

SELECT * FROM courses WHERE course_id > 8;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id INT AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL UNIQUE,
  building VARCHAR(20)
);
INSERT INTO departments (dept_name, building) VALUES
('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),
('Commerce','Block D'),('History','Block E');
CREATE TABLE courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(60) NOT NULL,
  dept_id INT,
  credits INT,
  fee INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
INSERT INTO courses (course_name, dept_id, credits, fee) VALUES
('Database Systems',1,4,12000),('Python Programming',1,3,10000),('Data Structures',1,4,12000),
('Linear Algebra',2,3,8000),('Statistics',2,3,8000),('Quantum Physics',3,4,9000),
('Financial Accounting',4,3,7000),('Business Law',4,2,6000);
INSERT INTO courses (course_name, dept_id, credits, fee) VALUES
('Machine Learning', 1, 4, 15000),
('Calculus',         2, 3,  8000),
('Optics',           3, 3,  9000);
SELECT * FROM courses WHERE course_id > 8;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected
>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected
>> DROP TABLE IF EXISTS courses -> 0 row(s) affected
>> DROP TABLE IF EXISTS students -> 0 row(s) affected
>> DROP TABLE IF EXISTS departments -> 0 row(s) affected
>> CREATE TABLE departments ( -> 0 row(s) affected
>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0
>> CREATE TABLE courses ( -> 0 row(s) affected
>> INSERT INTO courses (course_name, dept_id, credits, fee) VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0
>> INSERT INTO courses (course_name, dept_id, credits, fee) VALUES -> 3 row(s) affected Records: 3  Duplicates: 0  Warnings: 0
>> SELECT * FROM courses WHERE course_id > 8
+-----------+------------------+---------+---------+-------+
| course_id | course_name      | dept_id | credits | fee   |
+-----------+------------------+---------+---------+-------+
| 9         | Machine Learning | 1       | 4       | 15000 |
| 10        | Calculus         | 2       | 3       | 8000  |
| 11        | Optics           | 3       | 3       | 9000  |
+-----------+------------------+---------+---------+-------+
3 row(s) returned`,
      explanation: "The three rows received ids 9, 10 and 11 because the table already had 8 courses. The message \"Records: 3 Duplicates: 0 Warnings: 0\" is printed for multi-row inserts. One statement = one round trip, so this is much faster than three separate INSERTs when loading data."
    },
    {
      title: "INSERT ... SELECT: build a toppers table",
      scenario: "The principal wants a separate table of students who scored 85 or more, with the full name in one column.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type the script",
        "Press Ctrl+Shift+Enter",
        "Refresh the Navigator to see the new toppers table"
      ],
      code: `CREATE TABLE toppers (
  student_id INT PRIMARY KEY,
  full_name  VARCHAR(70),
  marks      INT
);

INSERT INTO toppers (student_id, full_name, marks)
SELECT student_id, CONCAT(first_name, ' ', last_name), marks
FROM students
WHERE marks >= 85;

SELECT * FROM toppers;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id INT AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL UNIQUE,
  building VARCHAR(20)
);
INSERT INTO departments (dept_name, building) VALUES
('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),
('Commerce','Block D'),('History','Block E');
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30),
  email VARCHAR(80) UNIQUE,
  gender CHAR(1),
  dob DATE,
  city VARCHAR(30),
  dept_id INT,
  marks INT,
  fees INT,
  admission_date DATE,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
INSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES
('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),
('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),
('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),
('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),
('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),
('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),
('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),
('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),
('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),
('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');
DROP TABLE IF EXISTS toppers;
CREATE TABLE toppers (
  student_id INT PRIMARY KEY,
  full_name  VARCHAR(70),
  marks      INT
);
INSERT INTO toppers (student_id, full_name, marks)
SELECT student_id, CONCAT(first_name, ' ', last_name), marks
FROM students
WHERE marks >= 85;
SELECT * FROM toppers;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected
>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected
>> DROP TABLE IF EXISTS courses -> 0 row(s) affected
>> DROP TABLE IF EXISTS students -> 0 row(s) affected
>> DROP TABLE IF EXISTS departments -> 0 row(s) affected
>> CREATE TABLE departments ( -> 0 row(s) affected
>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0
>> CREATE TABLE students ( -> 0 row(s) affected
>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0
>> DROP TABLE IF EXISTS toppers -> 0 row(s) affected
>> CREATE TABLE toppers ( -> 0 row(s) affected
>> INSERT INTO toppers (student_id, full_name, marks) -> 4 row(s) affected Records: 4  Duplicates: 0  Warnings: 0
>> SELECT * FROM toppers
+------------+--------------+-------+
| student_id | full_name    | marks |
+------------+--------------+-------+
| 1          | Aarav Sharma | 88    |
| 2          | Diya Patel   | 92    |
| 6          | Meera Nair   | 95    |
| 10         | Priya Das    | 85    |
+------------+--------------+-------+
4 row(s) returned`,
      explanation: "The SELECT found 4 students with marks >= 85 and all 4 rows were inserted in one statement. CONCAT joined first and last name with a space. The SELECT column order (id, name, marks) matches the target column list. This pattern is used for archiving old orders, creating report tables and backups."
    },
    {
      title: "INSERT IGNORE: skip duplicates, keep the rest",
      scenario: "A batch of new students from an admission form contains one email that already exists. Insert the valid rows without failing the whole batch.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type the script",
        "Press Ctrl+Shift+Enter. The plain INSERT fails with Error 1062 and inserts nothing",
        "The INSERT IGNORE succeeds for the new rows; in real Workbench the Action Output shows a yellow warning triangle - run SHOW WARNINGS; to read it"
      ],
      code: `-- Fails completely: 'diya.patel@college.edu' already exists
INSERT INTO students (first_name, email) VALUES
('Nikhil', 'nikhil.jain@college.edu'),
('Diya',   'diya.patel@college.edu'),
('Tanvi',  'tanvi.roy@college.edu');

-- Skips the duplicate, inserts the other two
INSERT IGNORE INTO students (first_name, email) VALUES
('Nikhil', 'nikhil.jain@college.edu'),
('Diya',   'diya.patel@college.edu'),
('Tanvi',  'tanvi.roy@college.edu');

SELECT COUNT(*) AS total_students FROM students;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id INT AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL UNIQUE,
  building VARCHAR(20)
);
INSERT INTO departments (dept_name, building) VALUES
('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),
('Commerce','Block D'),('History','Block E');
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30),
  email VARCHAR(80) UNIQUE,
  gender CHAR(1),
  dob DATE,
  city VARCHAR(30),
  dept_id INT,
  marks INT,
  fees INT,
  admission_date DATE,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
INSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES
('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),
('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),
('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),
('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),
('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),
('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),
('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),
('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),
('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),
('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');
INSERT INTO students (first_name, email) VALUES
('Nikhil', 'nikhil.jain@college.edu'),
('Diya',   'diya.patel@college.edu'),
('Tanvi',  'tanvi.roy@college.edu');
INSERT IGNORE INTO students (first_name, email) VALUES
('Nikhil', 'nikhil.jain@college.edu'),
('Diya',   'diya.patel@college.edu'),
('Tanvi',  'tanvi.roy@college.edu');
SELECT COUNT(*) AS total_students FROM students;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected
>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected
>> DROP TABLE IF EXISTS courses -> 0 row(s) affected
>> DROP TABLE IF EXISTS students -> 0 row(s) affected
>> DROP TABLE IF EXISTS departments -> 0 row(s) affected
>> CREATE TABLE departments ( -> 0 row(s) affected
>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0
>> CREATE TABLE students ( -> 0 row(s) affected
>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0
>> INSERT INTO students (first_name, email) VALUES -> ERROR: Error Code: 1062. Duplicate entry for key (students.email)
>> INSERT IGNORE INTO students (first_name, email) VALUES -> 2 row(s) affected Records: 2  Duplicates: 0  Warnings: 0
>> SELECT COUNT(*) AS total_students FROM students
+----------------+
| total_students |
+----------------+
| 12             |
+----------------+
1 row(s) returned`,
      explanation: "The normal multi-row INSERT is all-or-nothing: one duplicate email stopped all three rows. INSERT IGNORE inserted Nikhil and Tanvi and skipped the duplicate Diya, so the count went from 10 to 12. Real MySQL reports \"2 row(s) affected, 1 warning(s): 1062 Duplicate entry 'diya.patel@college.edu' for key 'students.email' Records: 3 Duplicates: 1 Warnings: 1\"."
    },
    {
      title: "Adding and editing rows in the Result Grid (Apply)",
      scenario: "The office clerk prefers clicking to typing SQL. Add a faculty member and correct a salary directly in the grid, then review the SQL Workbench generates.",
      steps: [
        "Navigator > college > Tables > hover faculty > click the grid icon (Select Rows - Limit 1000)",
        "Click the empty last row (marked *) or the \"Insert new row\" toolbar icon; leave faculty_id empty and type: Dr. Farah Khan, 2, Assistant Professor, 72000, 2024-06-01",
        "Double-click the salary cell of Dr. Kavita Menon (70000), type 75000 and press Enter",
        "Click Apply (bottom-right). Review the two statements in \"Apply SQL Script to Database\", click Apply, then Finish",
        "Re-run the query (Ctrl+Shift+Enter) to confirm the saved data"
      ],
      code: `-- Statements generated by Workbench after clicking Apply:
INSERT INTO college.faculty (name, dept_id, designation, salary, hire_date)
VALUES ('Dr. Farah Khan', '2', 'Assistant Professor', '72000', '2024-06-01');
UPDATE college.faculty SET salary = '75000' WHERE (faculty_id = '4');`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id INT AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL UNIQUE,
  building VARCHAR(20)
);
INSERT INTO departments (dept_name, building) VALUES
('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),
('Commerce','Block D'),('History','Block E');
CREATE TABLE faculty (
  faculty_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  dept_id INT,
  designation VARCHAR(30),
  salary INT,
  hire_date DATE,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
INSERT INTO faculty (name, dept_id, designation, salary, hire_date) VALUES
('Dr. Anil Kumar',1,'Professor',120000,'2010-06-15'),
('Dr. Neha Joshi',1,'Associate Professor',95000,'2015-08-01'),
('Prof. Suresh Rao',2,'Professor',110000,'2008-01-10'),
('Dr. Kavita Menon',3,'Assistant Professor',70000,'2019-07-20'),
('Prof. Rahul Gupta',4,'Associate Professor',90000,'2016-03-12'),
('Ms. Pooja Shah',NULL,'Lecturer',50000,'2023-01-05');
INSERT INTO faculty (name, dept_id, designation, salary, hire_date)
VALUES ('Dr. Farah Khan', '2', 'Assistant Professor', '72000', '2024-06-01');
UPDATE faculty SET salary = '75000' WHERE (faculty_id = '4');
SELECT faculty_id, name, salary FROM faculty;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected
>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected
>> DROP TABLE IF EXISTS courses -> 0 row(s) affected
>> DROP TABLE IF EXISTS students -> 0 row(s) affected
>> DROP TABLE IF EXISTS departments -> 0 row(s) affected
>> CREATE TABLE departments ( -> 0 row(s) affected
>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0
>> CREATE TABLE faculty ( -> 0 row(s) affected
>> INSERT INTO faculty (name, dept_id, designation, salary, hire_date) VA -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0
>> INSERT INTO faculty (name, dept_id, designation, salary, hire_date) -> 1 row(s) affected
>> UPDATE faculty SET salary = '75000' WHERE (faculty_id = '4') -> 1 row(s) affected Rows matched: 1  Changed: 1  Warnings: 0
>> SELECT faculty_id, name, salary FROM faculty
+------------+-------------------+--------+
| faculty_id | name              | salary |
+------------+-------------------+--------+
| 1          | Dr. Anil Kumar    | 120000 |
| 2          | Dr. Neha Joshi    | 95000  |
| 3          | Prof. Suresh Rao  | 110000 |
| 4          | Dr. Kavita Menon  | 75000  |
| 5          | Prof. Rahul Gupta | 90000  |
| 6          | Ms. Pooja Shah    | 50000  |
| 7          | Dr. Farah Khan    | 72000  |
+------------+-------------------+--------+
7 row(s) returned`,
      explanation: "Grid edits are converted into normal SQL. Workbench quotes every value and always uses the primary key in the WHERE clause (faculty_id = 4) - this is why the grid is read-only for tables without a primary key. MySQL converts the quoted numbers back to INT automatically. The new row received faculty_id 7."
    }
  ],
  interview: [
    {
      q: "What is the difference between INSERT with and without a column list?",
      a: "Without a column list you must supply a value for every column in the table's exact order, and the statement breaks if the table structure changes. With a column list you supply only the listed columns; the rest get DEFAULT/NULL/AUTO_INCREMENT. Always prefer the column list.",
      level: "Easy"
    },
    {
      q: "How do you insert multiple rows in one statement and why is it better?",
      a: "INSERT INTO t (a,b) VALUES (1,2),(3,4),(5,6); It is parsed once, uses one network round trip and one transaction commit, so it is much faster than separate inserts.",
      level: "Easy"
    },
    {
      q: "What is INSERT ... SELECT used for?",
      a: "To insert the result of a query into a table: archiving rows, creating summary or report tables, copying data to a new structure, or backing up rows before changes.",
      level: "Easy"
    },
    {
      q: "Explain INSERT IGNORE vs REPLACE vs ON DUPLICATE KEY UPDATE.",
      a: "INSERT IGNORE skips rows causing duplicate-key errors (as warnings). REPLACE deletes the existing conflicting row and inserts the new one (affected rows = 2, cascades fire, unspecified columns reset). ON DUPLICATE KEY UPDATE updates the existing row in place (upsert) without deleting it.",
      level: "Medium"
    },
    {
      q: "How do you get the id generated by the last INSERT?",
      a: "SELECT LAST_INSERT_ID(); It is per-connection, so concurrent users do not interfere. For a multi-row insert it returns the id of the FIRST inserted row.",
      level: "Medium"
    },
    {
      q: "What is Error 1136?",
      a: "Column count doesn't match value count at row N - the number of values does not equal the number of columns (listed or in the table).",
      level: "Easy"
    },
    {
      q: "What is SQL strict mode and how does it affect INSERT?",
      a: "With STRICT_TRANS_TABLES (default in MySQL 8) invalid or out-of-range values and too-long strings cause errors (e.g. 1406 Data too long, 1292 Incorrect date value) instead of being silently truncated or converted with a warning.",
      level: "Medium"
    },
    {
      q: "Why is the Workbench Result Grid sometimes read-only?",
      a: "Editing requires the result to come from a single table with a primary key (or unique not-null key) so Workbench can build WHERE pk = value for updates. JOINs, aggregates, expressions or tables without a key make it read-only.",
      level: "Medium"
    },
    {
      q: "If a multi-row INSERT has one bad row, are the other rows inserted?",
      a: "In InnoDB with strict mode the whole statement fails and no rows are inserted (statement-level atomicity). With INSERT IGNORE the good rows are inserted and bad ones skipped with warnings.",
      level: "Medium"
    },
    {
      q: "How do you insert a value containing a single quote, like O'Brien?",
      a: "Double it: 'O''Brien', or escape it: 'O\\'Brien'. In applications always use prepared statements/parameters instead of building strings, to avoid SQL injection.",
      level: "Easy"
    }
  ],
  practice: [
    {
      task: "Insert a new faculty member \"Dr. Sameer Kulkarni\" (dept 3, Associate Professor, salary 98000, hired 2018-09-01) using a column list, then show all faculty in department 3.",
      hint: "faculty_id is AUTO_INCREMENT - leave it out.",
      solution: `INSERT INTO faculty (name, dept_id, designation, salary, hire_date)
VALUES ('Dr. Sameer Kulkarni', 3, 'Associate Professor', 98000, '2018-09-01');
SELECT * FROM faculty WHERE dept_id = 3;`
    },
    {
      task: "Insert three enrollments in one statement: student 7 into course 1, student 7 into course 5, student 4 into course 2, all on 2024-02-01 with grade NULL.",
      hint: "One INSERT with three value groups.",
      solution: `INSERT INTO enrollments (student_id, course_id, enroll_date, grade) VALUES
(7, 1, '2024-02-01', NULL),
(7, 5, '2024-02-01', NULL),
(4, 2, '2024-02-01', NULL);
SELECT * FROM enrollments WHERE enroll_date = '2024-02-01';`
    },
    {
      task: "Create a table pune_students (student_id INT PRIMARY KEY, first_name VARCHAR(30), email VARCHAR(80)) and fill it with all students from Pune using INSERT ... SELECT.",
      hint: "WHERE city = 'Pune'.",
      solution: `DROP TABLE IF EXISTS pune_students;
CREATE TABLE pune_students (student_id INT PRIMARY KEY, first_name VARCHAR(30), email VARCHAR(80));
INSERT INTO pune_students (student_id, first_name, email)
SELECT student_id, first_name, email FROM students WHERE city = 'Pune';
SELECT * FROM pune_students;`
    },
    {
      task: "Insert departments 'Physics' and 'Chemistry' in one statement so that the existing Physics is skipped but Chemistry is added.",
      hint: "dept_name is UNIQUE. Use INSERT IGNORE.",
      solution: `INSERT IGNORE INTO departments (dept_name, building) VALUES ('Physics', 'Block C'), ('Chemistry', 'Block G');
SELECT * FROM departments;`
    },
    {
      task: "Using the Result Grid, add a course \"Cloud Computing\" (dept 1, 3 credits, fee 11000). Write the INSERT that Workbench generates.",
      hint: "Select Rows - Limit 1000 on courses, type in the * row, Apply.",
      solution: `INSERT INTO courses (course_name, dept_id, credits, fee) VALUES ('Cloud Computing', '1', '3', '11000');
SELECT * FROM courses WHERE course_name = 'Cloud Computing';`
    }
  ],
  quiz: [
    {
      question: "What does a column omitted from the INSERT column list receive?",
      options: [
        "Always 0",
        "An error is raised",
        "Its DEFAULT value (or NULL / next AUTO_INCREMENT)",
        "The value from the previous row"
      ],
      answer: 2,
      explanation: "Missing columns get their default, NULL if there is none, or the next auto-increment number."
    },
    {
      question: "Which statement copies rows from one table into another existing table?",
      options: [
        "INSERT INTO t2 (a,b) SELECT a,b FROM t1;",
        "COPY t1 TO t2;",
        "SELECT INTO t2 FROM t1;",
        "UPDATE t2 FROM t1;"
      ],
      answer: 0,
      explanation: "INSERT ... SELECT inserts the query result."
    },
    {
      question: "A multi-row INSERT contains one duplicate key. Without IGNORE, how many rows are inserted (InnoDB)?",
      options: [
        "All except the duplicate",
        "Only rows before the duplicate",
        "All rows including the duplicate",
        "None"
      ],
      answer: 3,
      explanation: "The statement is atomic: it fails as a whole with Error 1062."
    },
    {
      question: "Which keyword makes MySQL skip rows that would cause a duplicate-key error?",
      options: [
        "SKIP",
        "IGNORE",
        "NOWAIT",
        "DISTINCT"
      ],
      answer: 1,
      explanation: "INSERT IGNORE converts the error into a warning and skips that row."
    },
    {
      question: "After editing cells in the Workbench Result Grid, what saves them to the database?",
      options: [
        "Ctrl+S",
        "Refresh",
        "Apply, then Apply in the review dialog",
        "Closing the tab"
      ],
      answer: 2,
      explanation: "Apply shows the generated SQL; confirming with Apply runs it (plus Commit if auto-commit is off)."
    }
  ]
};
