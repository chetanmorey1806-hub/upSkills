export default {
  id: "day-08-order-by-limit-distinct-aliases",
  title: "ORDER BY, LIMIT, DISTINCT, Aliases and Calculated Columns",
  module: "Module 2: CRUD Operations",
  day: 8,
  level: "Beginner",
  duration: "2 hours",
  summary: "Shape query output: sort rows with ORDER BY (ascending, descending, multiple columns, NULL handling), return only the top N rows or a page of rows with LIMIT and OFFSET, remove duplicates with DISTINCT, give friendly names to columns and tables with aliases, and compute new values with arithmetic and functions in calculated columns.",
  objectives: [
    "Sort results by one or more columns in ASC or DESC order",
    "Write top-N and pagination queries with LIMIT and OFFSET",
    "Remove duplicate rows or combinations with DISTINCT",
    "Use column and table aliases correctly",
    "Create calculated columns with arithmetic operators and functions"
  ],
  theory: [
    {
      heading: "ORDER BY: Sorting Results",
      content: "Without ORDER BY, MySQL returns rows in no guaranteed order (often primary key order, but never rely on it). ORDER BY sorts the result. ASC (ascending, A-Z, 0-9, oldest date first) is the default; DESC is descending.",
      syntax: `SELECT columns FROM table
WHERE condition
ORDER BY col1 [ASC|DESC], col2 [ASC|DESC];`,
      points: [
        "Multiple columns: ORDER BY city ASC, marks DESC sorts by city, and inside each city by marks high to low.",
        "You can sort by a column not in the SELECT list, by an alias, by an expression (ORDER BY marks + 5), or by position (ORDER BY 2 - the second column; avoid in production code).",
        "NULLs come FIRST in ascending order and LAST in descending order in MySQL. To push NULLs last in ASC: ORDER BY marks IS NULL, marks.",
        "Text sorts alphabetically using the collation (case-insensitive by default).",
        "Custom order: ORDER BY FIELD(city, 'Mumbai', 'Pune', 'Delhi')."
      ]
    },
    {
      heading: "LIMIT and OFFSET: Top-N and Pagination",
      content: "LIMIT restricts the number of rows returned. It is MySQL's way of writing TOP (SQL Server) or FETCH FIRST (standard SQL). Combined with ORDER BY it answers \"top 3 students\" or \"5 most expensive courses\". With an offset it implements pages in a website.",
      syntax: `LIMIT 5                 -- first 5 rows
LIMIT 5 OFFSET 10       -- skip 10 rows, then return 5  (rows 11-15)
LIMIT 10, 5             -- same: LIMIT offset, count

-- page n with page_size rows: LIMIT page_size OFFSET (n - 1) * page_size`,
      points: [
        "Always use ORDER BY with LIMIT, otherwise \"top 3\" is random.",
        "LIMIT is applied last, after WHERE, GROUP BY, HAVING and ORDER BY.",
        "Ties: if the 3rd and 4th students have the same marks, LIMIT 3 picks one arbitrarily. Add a tie-breaker column (ORDER BY marks DESC, student_id).",
        "Large offsets (OFFSET 1000000) are slow because MySQL still reads the skipped rows; \"keyset pagination\" (WHERE id > last_seen_id LIMIT 20) is faster.",
        "Workbench's \"Limit to 1000 rows\" adds LIMIT automatically only if your query has none."
      ]
    },
    {
      heading: "DISTINCT: Removing Duplicates",
      content: "DISTINCT removes duplicate rows from the result. It applies to the whole selected row, not just the first column.",
      syntax: `SELECT DISTINCT city FROM students;                 -- each city once
SELECT DISTINCT city, gender FROM students;         -- each (city, gender) combination once
SELECT COUNT(DISTINCT city) FROM students;          -- number of different cities`,
      points: [
        "DISTINCT treats all NULLs as equal, so NULL appears once.",
        "COUNT(DISTINCT col) ignores NULLs.",
        "DISTINCT needs sorting or hashing, so do not add it \"just in case\" on large results.",
        "If you need DISTINCT because a JOIN produced duplicates, check the JOIN logic first."
      ]
    },
    {
      heading: "Column and Table Aliases",
      content: "An alias is a temporary name used only in that query. Column aliases make headings readable; table aliases make queries shorter, especially with joins.",
      syntax: `SELECT first_name AS name, marks AS score FROM students;
SELECT first_name name FROM students;                  -- AS is optional
SELECT first_name AS 'First Name' FROM students;      -- quotes for spaces
SELECT s.first_name, s.city FROM students AS s;        -- table alias`,
      points: [
        "Aliases can be used in ORDER BY (and HAVING, GROUP BY in MySQL) but NOT in WHERE of the same query.",
        "Use quotes or backticks for aliases with spaces; better to use underscores: full_name.",
        "Once a table has an alias, refer to it by the alias (s.city), not the table name."
      ]
    },
    {
      heading: "Calculated (Derived) Columns",
      content: "A SELECT list can contain expressions that compute new values for each row. The stored data is not changed. Arithmetic operators: + - * / DIV (integer division) % or MOD (remainder). Functions like CONCAT, ROUND and TIMESTAMPDIFF also create calculated columns.",
      syntax: `SELECT first_name,
       fees,
       fees * 110 / 100              AS fees_next_year,
       fees - 5000                   AS fees_after_scholarship,
       CONCAT(first_name, ' ', last_name) AS full_name,
       TIMESTAMPDIFF(YEAR, dob, '2025-01-01') AS age_on_new_year
FROM students;`,
      points: [
        "In MySQL 10 / 4 = 2.5000 (decimal division) and 10 DIV 4 = 2 (integer division).",
        "Any arithmetic with NULL gives NULL: NULL + 5 = NULL.",
        "Division by zero returns NULL (with a warning) in MySQL.",
        "Order of evaluation: FROM -> WHERE -> SELECT (calculations, aliases) -> ORDER BY -> LIMIT. That is why the alias works in ORDER BY."
      ],
      tip: "Do not store values you can calculate (like age from dob) - they become wrong over time. Calculate them in the query or use a generated column."
    }
  ],
  examples: [
    {
      title: "Sort by one and by two columns",
      scenario: "Show students ordered from highest to lowest marks, then a list sorted by city and, within each city, by marks descending.",
      steps: [
        "In MySQL Workbench: open the Local instance connection (college database)",
        "File > New Query Tab, type both queries",
        "Press Ctrl+Shift+Enter and compare Result 1 and Result 2",
        "Tip: clicking a column header in the Result Grid only sorts the grid on screen; ORDER BY sorts in the query itself"
      ],
      code: `SELECT first_name, marks
FROM students
ORDER BY marks DESC;

SELECT first_name, city, marks
FROM students
WHERE city IS NOT NULL
ORDER BY city ASC, marks DESC;`,
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
SELECT first_name, marks
FROM students
ORDER BY marks DESC;
SELECT first_name, city, marks
FROM students
WHERE city IS NOT NULL
ORDER BY city ASC, marks DESC;`,
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
>> SELECT first_name, marks
+------------+-------+
| first_name | marks |
+------------+-------+
| Meera      | 95    |
| Diya       | 92    |
| Aarav      | 88    |
| Priya      | 85    |
| Ananya     | 81    |
| Rohan      | 75    |
| Arjun      | 70    |
| Kabir      | 64    |
| Sneha      | 58    |
| Vikram     | NULL  |
+------------+-------+
10 row(s) returned
>> SELECT first_name, city, marks
+------------+---------+-------+
| first_name | city    | marks |
+------------+---------+-------+
| Ananya     | Chennai | 81    |
| Rohan      | Delhi   | 75    |
| Kabir      | Delhi   | 64    |
| Meera      | Kochi   | 95    |
| Priya      | Kolkata | 85    |
| Diya       | Mumbai  | 92    |
| Sneha      | Mumbai  | 58    |
| Aarav      | Pune    | 88    |
| Vikram     | Pune    | NULL  |
+------------+---------+-------+
9 row(s) returned`,
      explanation: "In DESC order Vikram's NULL marks appear last (in ASC order they would come first). In the second query cities are alphabetical, and inside Mumbai Diya (92) comes before Sneha (58); inside Pune Aarav (88) comes before Vikram (NULL)."
    },
    {
      title: "Top-N and pagination with LIMIT / OFFSET",
      scenario: "Find the top 3 scorers, and show \"page 2\" of the student list when each page shows 4 students sorted by name.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type both queries",
        "Press Ctrl+Shift+Enter"
      ],
      code: `-- top 3
SELECT first_name, marks
FROM students
ORDER BY marks DESC
LIMIT 3;

-- page 2, 4 rows per page -> skip (2-1)*4 = 4 rows
SELECT student_id, first_name
FROM students
ORDER BY first_name
LIMIT 4 OFFSET 4;          -- same as LIMIT 4, 4`,
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
SELECT first_name, marks
FROM students
ORDER BY marks DESC
LIMIT 3;
SELECT student_id, first_name
FROM students
ORDER BY first_name
LIMIT 4 OFFSET 4;`,
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
>> SELECT first_name, marks
+------------+-------+
| first_name | marks |
+------------+-------+
| Meera      | 95    |
| Diya       | 92    |
| Aarav      | 88    |
+------------+-------+
3 row(s) returned
>> SELECT student_id, first_name
+------------+------------+
| student_id | first_name |
+------------+------------+
| 5          | Kabir      |
| 6          | Meera      |
| 10         | Priya      |
| 3          | Rohan      |
+------------+------------+
4 row(s) returned`,
      explanation: "ORDER BY runs first, then LIMIT keeps the first 3 rows: Meera, Diya and Aarav. For page 2 the sorted names are Aarav, Ananya, Arjun, Diya | Kabir, Meera, Priya, Rohan | Sneha, Vikram; OFFSET 4 skips the first page and LIMIT 4 returns the second."
    },
    {
      title: "DISTINCT values and combinations",
      scenario: "Which cities do our students come from, which (city, gender) combinations exist, and how many different cities are there?",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type the queries",
        "Press Ctrl+Shift+Enter"
      ],
      code: `SELECT DISTINCT city FROM students ORDER BY city;
SELECT DISTINCT city, gender FROM students WHERE city IN ('Pune', 'Mumbai', 'Delhi') ORDER BY city, gender;
SELECT COUNT(DISTINCT city) AS different_cities FROM students;`,
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
SELECT DISTINCT city FROM students ORDER BY city;
SELECT DISTINCT city, gender FROM students WHERE city IN ('Pune', 'Mumbai', 'Delhi') ORDER BY city, gender;
SELECT COUNT(DISTINCT city) AS different_cities FROM students;`,
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
>> SELECT DISTINCT city FROM students ORDER BY city
+---------+
| city    |
+---------+
| NULL    |
| Chennai |
| Delhi   |
| Kochi   |
| Kolkata |
| Mumbai  |
| Pune    |
+---------+
7 row(s) returned
>> SELECT DISTINCT city, gender FROM students WHERE city IN ('Pune', 'Mum
+--------+--------+
| city   | gender |
+--------+--------+
| Delhi  | M      |
| Mumbai | F      |
| Pune   | M      |
+--------+--------+
3 row(s) returned
>> SELECT COUNT(DISTINCT city) AS different_cities FROM students
+------------------+
| different_cities |
+------------------+
| 6                |
+------------------+
1 row(s) returned`,
      explanation: "DISTINCT city lists each city once; NULL is shown once and sorts first. DISTINCT city, gender works on the pair: Delhi-M appears once although two male students live in Delhi. COUNT(DISTINCT city) is 6 because NULL is not counted."
    },
    {
      title: "Aliases and calculated columns",
      scenario: "Prepare a fee report: full name, current fees, fees after a 10 percent increase, fees after a 5000 scholarship, and age on 1 January 2025, sorted by age.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type the query",
        "Press Ctrl+B to beautify, then Ctrl+Enter",
        "Note the Result Grid is read-only (calculated columns cannot be edited)"
      ],
      code: `SELECT CONCAT(s.first_name, ' ', s.last_name)    AS full_name,
       s.fees                                    AS current_fees,
       s.fees * 110 / 100                        AS fees_next_year,
       s.fees - 5000                             AS after_scholarship,
       TIMESTAMPDIFF(YEAR, s.dob, '2025-01-01')  AS age
FROM students AS s
WHERE s.dept_id = 1
ORDER BY age DESC, full_name;`,
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
SELECT CONCAT(s.first_name, ' ', s.last_name)    AS full_name,
       s.fees                                    AS current_fees,
       s.fees * 110 / 100                        AS fees_next_year,
       s.fees - 5000                             AS after_scholarship,
       TIMESTAMPDIFF(YEAR, s.dob, '2025-01-01')  AS age
FROM students AS s
WHERE s.dept_id = 1
ORDER BY age DESC, full_name;`,
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
>> SELECT CONCAT(s.first_name, ' ', s.last_name)    AS full_name,
+----------------+--------------+----------------+-------------------+-----+
| full_name      | current_fees | fees_next_year | after_scholarship | age |
+----------------+--------------+----------------+-------------------+-----+
| Diya Patel     | 85000        | 93500.0        | 80000             | 21  |
| Aarav Sharma   | 85000        | 93500.0        | 80000             | 20  |
| Sneha Kulkarni | 85000        | 93500.0        | 80000             | 20  |
+----------------+--------------+----------------+-------------------+-----+
3 row(s) returned`,
      explanation: "Each calculated column is computed per row; the table itself is unchanged. The table alias s shortens column references, and the column aliases become the grid headings. The alias age is used in ORDER BY (allowed), but WHERE uses the real column dept_id because aliases are not visible in WHERE. In real MySQL fees_next_year displays as 93500.0000 because / returns a decimal."
    },
    {
      title: "Putting NULLs last and custom sort order",
      scenario: "List students by marks ascending but keep the student with missing marks at the bottom; then sort cities in a custom priority order.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type the queries",
        "Press Ctrl+Shift+Enter"
      ],
      code: `SELECT first_name, marks
FROM students
ORDER BY marks IS NULL, marks ASC;

SELECT first_name, city
FROM students
WHERE city IN ('Pune', 'Mumbai', 'Delhi')
ORDER BY FIELD(city, 'Mumbai', 'Pune', 'Delhi'), first_name;`,
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
SELECT first_name, marks
FROM students
ORDER BY marks IS NULL, marks ASC;
SELECT first_name, city
FROM students
WHERE city IN ('Pune', 'Mumbai', 'Delhi')
ORDER BY FIELD(city, 'Mumbai', 'Pune', 'Delhi'), first_name;`,
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
>> SELECT first_name, marks
+------------+-------+
| first_name | marks |
+------------+-------+
| Sneha      | 58    |
| Kabir      | 64    |
| Arjun      | 70    |
| Rohan      | 75    |
| Ananya     | 81    |
| Priya      | 85    |
| Aarav      | 88    |
| Diya       | 92    |
| Meera      | 95    |
| Vikram     | NULL  |
+------------+-------+
10 row(s) returned
>> SELECT first_name, city
+------------+--------+
| first_name | city   |
+------------+--------+
| Diya       | Mumbai |
| Sneha      | Mumbai |
| Aarav      | Pune   |
| Vikram     | Pune   |
| Kabir      | Delhi  |
| Rohan      | Delhi  |
+------------+--------+
6 row(s) returned`,
      explanation: "marks IS NULL is 0 for normal rows and 1 for NULL, so NULL rows sort after all others; the second key then sorts by marks. FIELD() returns the position of city in the list (Mumbai = 1, Pune = 2, Delhi = 3), giving a custom non-alphabetical order."
    }
  ],
  interview: [
    {
      q: "What is the default sort order of ORDER BY?",
      a: "Ascending (ASC). Use DESC for descending. Without ORDER BY the order is not guaranteed.",
      level: "Easy"
    },
    {
      q: "How do you get the 3rd highest marks?",
      a: "SELECT DISTINCT marks FROM students ORDER BY marks DESC LIMIT 1 OFFSET 2; (DISTINCT handles ties). Alternatives: DENSE_RANK() window function or a correlated subquery.",
      level: "Medium"
    },
    {
      q: "What is the difference between LIMIT 5, 10 and LIMIT 5 OFFSET 10?",
      a: "LIMIT 5, 10 means offset 5, count 10 (rows 6-15). LIMIT 5 OFFSET 10 means count 5, offset 10 (rows 11-15). The two-argument form puts the offset first.",
      level: "Medium"
    },
    {
      q: "Where do NULLs appear when sorting in MySQL?",
      a: "First in ascending order and last in descending order. Use ORDER BY col IS NULL, col to put them last in ascending order.",
      level: "Medium"
    },
    {
      q: "Can you use a column alias in WHERE? In ORDER BY?",
      a: "Not in WHERE (evaluated before SELECT). Yes in ORDER BY (evaluated after SELECT). MySQL also allows aliases in GROUP BY and HAVING.",
      level: "Medium"
    },
    {
      q: "Does DISTINCT apply to one column or all selected columns?",
      a: "To the entire row of selected columns. SELECT DISTINCT a, b returns unique (a, b) pairs.",
      level: "Easy"
    },
    {
      q: "What is the logical order of execution of a SELECT?",
      a: "FROM/JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT (expressions, aliases, DISTINCT) -> ORDER BY -> LIMIT.",
      level: "Medium"
    },
    {
      q: "What is the difference between / and DIV in MySQL?",
      a: "/ is normal division returning a decimal (10/4 = 2.5000). DIV is integer division discarding the fraction (10 DIV 4 = 2). % or MOD gives the remainder.",
      level: "Easy"
    },
    {
      q: "Why is OFFSET-based pagination slow for deep pages and what is the alternative?",
      a: "MySQL must read and discard all the skipped rows. Keyset (seek) pagination uses the last seen key: WHERE id > :last_id ORDER BY id LIMIT 20, which uses the index directly.",
      level: "Hard"
    },
    {
      q: "How do you sort by a custom order, e.g. status pending, shipped, delivered?",
      a: "ORDER BY FIELD(status, 'pending', 'shipped', 'delivered') or a CASE expression that maps each value to a number.",
      level: "Medium"
    }
  ],
  practice: [
    {
      task: "List the 5 most expensive courses (name and fee), highest first; for equal fees sort by course name.",
      hint: "ORDER BY fee DESC, course_name LIMIT 5.",
      solution: `SELECT course_name, fee
FROM courses
ORDER BY fee DESC, course_name
LIMIT 5;`
    },
    {
      task: "Show each distinct designation in the faculty table in alphabetical order.",
      hint: "SELECT DISTINCT ... ORDER BY.",
      solution: `SELECT DISTINCT designation
FROM faculty
ORDER BY designation;`
    },
    {
      task: "Show faculty name, monthly salary (salary column) and annual salary (salary * 12) with headings monthly and annual, sorted by annual salary descending.",
      hint: "Calculated column with alias, ORDER BY alias.",
      solution: `SELECT name, salary AS monthly, salary * 12 AS annual
FROM faculty
ORDER BY annual DESC;`
    },
    {
      task: "Return page 3 of the students list ordered by student_id with 3 students per page.",
      hint: "OFFSET = (3 - 1) * 3 = 6.",
      solution: `SELECT student_id, first_name
FROM students
ORDER BY student_id
LIMIT 3 OFFSET 6;`
    },
    {
      task: "Find the second-highest distinct marks value among students.",
      hint: "DISTINCT + ORDER BY DESC + LIMIT 1 OFFSET 1.",
      solution: `SELECT DISTINCT marks
FROM students
WHERE marks IS NOT NULL
ORDER BY marks DESC
LIMIT 1 OFFSET 1;`
    }
  ],
  quiz: [
    {
      question: "Which clause returns only the first 5 rows?",
      options: [
        "TOP 5",
        "LIMIT 5",
        "FIRST 5",
        "ROWNUM <= 5"
      ],
      answer: 1,
      explanation: "MySQL uses LIMIT. TOP is SQL Server, ROWNUM is Oracle."
    },
    {
      question: "LIMIT 10, 5 returns:",
      options: [
        "Rows 11 to 15",
        "Rows 10 to 15",
        "Rows 6 to 10",
        "Rows 1 to 5 and 10"
      ],
      answer: 0,
      explanation: "Offset 10, count 5: rows 11-15."
    },
    {
      question: "Where can a column alias defined in SELECT NOT be used?",
      options: [
        "ORDER BY",
        "HAVING",
        "WHERE",
        "It can be used everywhere"
      ],
      answer: 2,
      explanation: "WHERE is evaluated before SELECT, so the alias does not exist yet."
    },
    {
      question: "SELECT DISTINCT city, gender FROM students returns:",
      options: [
        "Distinct cities only",
        "Distinct genders only",
        "An error",
        "Distinct (city, gender) combinations"
      ],
      answer: 3,
      explanation: "DISTINCT applies to the whole selected row."
    },
    {
      question: "In ascending ORDER BY, MySQL places NULL values:",
      options: [
        "First",
        "Last",
        "Randomly",
        "They are excluded"
      ],
      answer: 0,
      explanation: "NULL is treated as lower than any value: first in ASC, last in DESC."
    }
  ]
};
