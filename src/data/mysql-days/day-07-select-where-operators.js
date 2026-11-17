export default {
  id: "day-07-select-where-operators",
  title: "SELECT Basics, WHERE, Comparison and Logical Operators, IN, BETWEEN, LIKE, IS NULL",
  module: "Module 2: CRUD Operations",
  day: 7,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Read data with SELECT and filter it with WHERE. Master comparison operators, AND/OR/NOT with correct precedence, IN and NOT IN lists, BETWEEN ranges for numbers and dates, LIKE pattern matching with % and _ wildcards, and the special handling of NULL with IS NULL / IS NOT NULL.",
  objectives: [
    "Select all or specific columns from a table",
    "Filter rows using =, <>, !=, <, >, <=, >=",
    "Combine conditions with AND, OR, NOT and parentheses",
    "Use IN, BETWEEN and LIKE (%, _) for readable filters",
    "Correctly find missing values with IS NULL and avoid the = NULL trap"
  ],
  theory: [
    {
      heading: "SELECT Basics",
      content: "SELECT reads data and returns a result set (a temporary table) - it never changes the stored data. You list the columns you want after SELECT and the table after FROM. SELECT * means \"all columns\".",
      syntax: `SELECT column1, column2, ...
FROM table_name
WHERE condition;

SELECT * FROM students;                      -- all columns, all rows
SELECT first_name, city FROM students;       -- only two columns`,
      points: [
        "Prefer naming columns over SELECT * in real projects: less data over the network, and code does not break when columns are added.",
        "Columns are returned in the order you list them, not the table order.",
        "Logical order of evaluation: FROM -> WHERE -> SELECT (so a column alias defined in SELECT cannot be used in WHERE).",
        "String comparisons in MySQL are case-insensitive by default (collation utf8mb4_0900_ai_ci): 'pune' = 'Pune' is true."
      ]
    },
    {
      heading: "WHERE and Comparison Operators",
      content: "WHERE keeps only the rows for which the condition is TRUE. Rows where the condition is FALSE or UNKNOWN (because of NULL) are removed.",
      points: [
        "=  equal to:  WHERE city = 'Pune'",
        "<> or !=  not equal to:  WHERE city <> 'Delhi'",
        "> < >= <=  greater/less:  WHERE marks >= 80",
        "Text and dates in single quotes: WHERE dob > '2004-12-31'. Numbers without quotes.",
        "Comparing dates works naturally because 'YYYY-MM-DD' sorts correctly.",
        "<=> is the NULL-safe equal operator: NULL <=> NULL is 1 (true)."
      ]
    },
    {
      heading: "Logical Operators: AND, OR, NOT and Precedence",
      content: "AND requires both conditions to be true; OR requires at least one; NOT reverses a condition. AND is evaluated BEFORE OR (like multiplication before addition), so always use parentheses when mixing them.",
      syntax: `-- WRONG intention: CS students from Pune OR anyone from Mumbai
WHERE dept_id = 1 AND city = 'Pune' OR city = 'Mumbai'

-- RIGHT: CS students who live in Pune or Mumbai
WHERE dept_id = 1 AND (city = 'Pune' OR city = 'Mumbai')`,
      points: [
        "Precedence: NOT > AND > OR.",
        "MySQL also accepts && for AND, || for OR (deprecated) and ! for NOT; use the words.",
        "Truth with NULL: TRUE AND NULL = NULL, FALSE AND NULL = FALSE, TRUE OR NULL = TRUE."
      ]
    },
    {
      heading: "IN and BETWEEN",
      content: "IN checks membership in a list - a short form of many ORs. BETWEEN checks an inclusive range - a short form of >= AND <=.",
      syntax: `WHERE city IN ('Pune', 'Mumbai', 'Delhi')        -- = city='Pune' OR city='Mumbai' OR ...
WHERE dept_id NOT IN (1, 2)
WHERE marks BETWEEN 70 AND 90                     -- 70 and 90 included
WHERE dob BETWEEN '2004-01-01' AND '2004-12-31'
WHERE marks NOT BETWEEN 60 AND 80`,
      points: [
        "BETWEEN low AND high: low must come first; BETWEEN 90 AND 70 returns nothing.",
        "For DATETIME columns, BETWEEN '2024-01-01' AND '2024-01-31' misses times after 00:00:00 on the 31st. Use col >= '2024-01-01' AND col < '2024-02-01'.",
        "NOT IN with a NULL in the list returns no rows (x <> NULL is unknown). Be careful with subqueries that may return NULL (Day 18).",
        "BETWEEN also works for text in alphabetical order: last_name BETWEEN 'A' AND 'M'."
      ]
    },
    {
      heading: "LIKE Pattern Matching",
      content: "LIKE compares text against a pattern with two wildcards: % means \"any number of characters (including zero)\" and _ means \"exactly one character\". LIKE is case-insensitive with the default collation.",
      points: [
        "'A%'  starts with A.     '%a'  ends with a.     '%sh%'  contains sh.",
        "'_a%'  second letter is a.     '____'  exactly 4 characters.",
        "NOT LIKE excludes matches: email NOT LIKE '%@college.edu'.",
        "To search for a real % or _ escape it: LIKE '%10\\%%' or use ESCAPE '!'.",
        "A pattern starting with % cannot use an index, so it is slow on large tables. REGEXP / RLIKE provides regular expressions: WHERE first_name REGEXP '^[AEIOU]'."
      ]
    },
    {
      heading: "NULL: IS NULL and IS NOT NULL",
      content: "NULL means unknown or missing. It is not 0, not '' (empty string) and not equal to anything - not even to another NULL. Any comparison with NULL using =, <>, > etc. gives NULL (unknown), so WHERE city = NULL never returns rows. Use IS NULL and IS NOT NULL.",
      syntax: `SELECT * FROM students WHERE city IS NULL;         -- correct
SELECT * FROM students WHERE city = NULL;          -- always empty!
SELECT * FROM students WHERE marks IS NOT NULL;`,
      points: [
        "In the Workbench Result Grid NULL is shown as a grey NULL label; an empty string shows as a blank cell.",
        "WHERE marks < 60 does NOT return students with NULL marks. Ask: should missing values be included?",
        "Functions IFNULL and COALESCE replace NULL with a value (Day 14)."
      ],
      tip: "Interview trick: \"SELECT * FROM t WHERE col <> 'X'\" does not return rows where col is NULL. Add OR col IS NULL if you need them."
    }
  ],
  examples: [
    {
      title: "Selecting all columns vs specific columns",
      scenario: "The office needs a quick contact list (name and email) of all students.",
      steps: [
        "In MySQL Workbench: open the Local instance connection (college database from Day 4)",
        "File > New Query Tab",
        "Type the query and press Ctrl+Enter",
        "Notice the Result Grid shows only the columns you listed, in your order"
      ],
      code: `SELECT first_name, last_name, email
FROM students;`,
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
SELECT first_name, last_name, email
FROM students;`,
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
>> SELECT first_name, last_name, email
+------------+-----------+----------------------------+
| first_name | last_name | email                      |
+------------+-----------+----------------------------+
| Aarav      | Sharma    | aarav.sharma@college.edu   |
| Diya       | Patel     | diya.patel@college.edu     |
| Rohan      | Verma     | rohan.verma@college.edu    |
| Ananya     | Iyer      | ananya.iyer@college.edu    |
| Kabir      | Singh     | kabir.singh@college.edu    |
| Meera      | Nair      | meera.nair@college.edu     |
| Vikram     | Rao       | vikram.rao@college.edu     |
| Sneha      | Kulkarni  | sneha.kulkarni@college.edu |
| Arjun      | Mehta     | arjun.mehta@college.edu    |
| Priya      | Das       | priya.das@college.edu      |
+------------+-----------+----------------------------+
10 row(s) returned`,
      explanation: "Only three columns are returned, in the order written. SELECT * would also return dob, city, dept_id, marks, fees, etc. Fetching only needed columns is faster and clearer."
    },
    {
      title: "Comparison operators and AND / OR with parentheses",
      scenario: "Find (a) students with marks of 80 or more, and (b) female students who live in Mumbai or Delhi.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type both queries",
        "Press Ctrl+Shift+Enter to run all three; read the Result 1, Result 2 and Result 3 tabs",
        "Compare Result 2 (with brackets) and Result 3 (without brackets)"
      ],
      code: `SELECT first_name, marks
FROM students
WHERE marks >= 80;

-- female students from Mumbai or Delhi (correct)
SELECT first_name, gender, city
FROM students
WHERE gender = 'F' AND (city = 'Mumbai' OR city = 'Delhi');

-- same words, no brackets: (F AND Mumbai) OR (anyone from Delhi)
SELECT first_name, gender, city
FROM students
WHERE gender = 'F' AND city = 'Mumbai' OR city = 'Delhi';`,
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
WHERE marks >= 80;
SELECT first_name, gender, city
FROM students
WHERE gender = 'F' AND (city = 'Mumbai' OR city = 'Delhi');
SELECT first_name, gender, city
FROM students
WHERE gender = 'F' AND city = 'Mumbai' OR city = 'Delhi';`,
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
| Aarav      | 88    |
| Diya       | 92    |
| Ananya     | 81    |
| Meera      | 95    |
| Priya      | 85    |
+------------+-------+
5 row(s) returned
>> SELECT first_name, gender, city
+------------+--------+--------+
| first_name | gender | city   |
+------------+--------+--------+
| Diya       | F      | Mumbai |
| Sneha      | F      | Mumbai |
+------------+--------+--------+
2 row(s) returned
>> SELECT first_name, gender, city
+------------+--------+--------+
| first_name | gender | city   |
+------------+--------+--------+
| Diya       | F      | Mumbai |
| Rohan      | M      | Delhi  |
| Kabir      | M      | Delhi  |
| Sneha      | F      | Mumbai |
+------------+--------+--------+
4 row(s) returned`,
      explanation: "Five students have 80 or more; Vikram (marks NULL) is excluded because NULL >= 80 is unknown. With brackets MySQL evaluates the OR first and returns only the two female students from Mumbai. Without brackets AND is evaluated first, so the condition becomes (female AND Mumbai) OR (Delhi) and the male Delhi students Rohan and Kabir sneak in. Always use brackets when mixing AND and OR."
    },
    {
      title: "IN and BETWEEN",
      scenario: "List students from Delhi, Chennai or Kolkata, and students born in 2004 with marks between 70 and 90.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type the queries",
        "Press Ctrl+Shift+Enter"
      ],
      code: `SELECT first_name, city
FROM students
WHERE city IN ('Delhi', 'Chennai', 'Kolkata');

SELECT first_name, dob, marks
FROM students
WHERE dob BETWEEN '2004-01-01' AND '2004-12-31'
  AND marks BETWEEN 70 AND 90;`,
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
SELECT first_name, city
FROM students
WHERE city IN ('Delhi', 'Chennai', 'Kolkata');
SELECT first_name, dob, marks
FROM students
WHERE dob BETWEEN '2004-01-01' AND '2004-12-31'
  AND marks BETWEEN 70 AND 90;`,
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
>> SELECT first_name, city
+------------+---------+
| first_name | city    |
+------------+---------+
| Rohan      | Delhi   |
| Ananya     | Chennai |
| Kabir      | Delhi   |
| Priya      | Kolkata |
+------------+---------+
4 row(s) returned
>> SELECT first_name, dob, marks
+------------+------------+-------+
| first_name | dob        | marks |
+------------+------------+-------+
| Aarav      | 2004-03-15 | 88    |
| Rohan      | 2004-07-21 | 75    |
+------------+------------+-------+
2 row(s) returned`,
      explanation: "IN replaced three OR conditions. BETWEEN is inclusive, so a student born on 2004-01-01 or 2004-12-31 would be included. Aarav (2004, 88) and Rohan (2004, 75) match; Meera and Sneha were also born in 2004 but have 95 and 58 marks."
    },
    {
      title: "LIKE with % and _ wildcards",
      scenario: "Search students by name patterns.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type the queries",
        "Press Ctrl+Shift+Enter and compare the three result tabs"
      ],
      code: `-- first name starts with A
SELECT first_name, last_name FROM students WHERE first_name LIKE 'A%';

-- last name contains 'ar'
SELECT first_name, last_name FROM students WHERE last_name LIKE '%ar%';

-- first name has exactly 4 letters
SELECT first_name FROM students WHERE first_name LIKE '____';`,
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
SELECT first_name, last_name FROM students WHERE first_name LIKE 'A%';
SELECT first_name, last_name FROM students WHERE last_name LIKE '%ar%';
SELECT first_name FROM students WHERE first_name LIKE '____';`,
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
>> SELECT first_name, last_name FROM students WHERE first_name LIKE 'A%'
+------------+-----------+
| first_name | last_name |
+------------+-----------+
| Aarav      | Sharma    |
| Ananya     | Iyer      |
| Arjun      | Mehta     |
+------------+-----------+
3 row(s) returned
>> SELECT first_name, last_name FROM students WHERE last_name LIKE '%ar%'
+------------+-----------+
| first_name | last_name |
+------------+-----------+
| Aarav      | Sharma    |
| Sneha      | Kulkarni  |
+------------+-----------+
2 row(s) returned
>> SELECT first_name FROM students WHERE first_name LIKE '____'
+------------+
| first_name |
+------------+
| Diya       |
+------------+
1 row(s) returned`,
      explanation: "'A%' matched Aarav, Ananya and Arjun. '%ar%' matched Sharma and Kulkarni (ar appears anywhere). Four underscores match first names with exactly four characters: only Diya. % can match zero characters, _ always matches exactly one."
    },
    {
      title: "Finding missing data with IS NULL (and the = NULL trap)",
      scenario: "Find students whose city is not recorded and students without marks.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type the queries",
        "Press Ctrl+Shift+Enter",
        "Result 1 is empty - that is the trap. Result 2 and 3 are correct"
      ],
      code: `SELECT first_name, city FROM students WHERE city = NULL;     -- WRONG: always empty
SELECT first_name, city FROM students WHERE city IS NULL;    -- correct
SELECT first_name, dept_id, marks FROM students WHERE marks IS NULL OR dept_id IS NULL;`,
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
SELECT first_name, city FROM students WHERE city = NULL;
SELECT first_name, city FROM students WHERE city IS NULL;
SELECT first_name, dept_id, marks FROM students WHERE marks IS NULL OR dept_id IS NULL;`,
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
>> SELECT first_name, city FROM students WHERE city = NULL
+------------+------+
| first_name | city |
+------------+------+
+------------+------+
0 row(s) returned
>> SELECT first_name, city FROM students WHERE city IS NULL
+------------+------+
| first_name | city |
+------------+------+
| Arjun      | NULL |
+------------+------+
1 row(s) returned
>> SELECT first_name, dept_id, marks FROM students WHERE marks IS NULL OR
+------------+---------+-------+
| first_name | dept_id | marks |
+------------+---------+-------+
| Vikram     | NULL    | NULL  |
+------------+---------+-------+
1 row(s) returned`,
      explanation: "city = NULL evaluates to NULL (unknown) for every row, so nothing is returned and no error is shown - a silent bug. IS NULL correctly found Arjun. Vikram has neither department nor marks yet."
    }
  ],
  interview: [
    {
      q: "What is the difference between WHERE city = NULL and WHERE city IS NULL?",
      a: "Comparing anything with NULL using = returns NULL (unknown), so the first query returns no rows. IS NULL is the correct operator to test for missing values.",
      level: "Easy"
    },
    {
      q: "What is the order of precedence of AND, OR and NOT?",
      a: "NOT first, then AND, then OR. Use parentheses whenever you mix AND and OR.",
      level: "Easy"
    },
    {
      q: "Is BETWEEN inclusive?",
      a: "Yes, both ends are included: x BETWEEN a AND b equals x >= a AND x <= b.",
      level: "Easy"
    },
    {
      q: "What are the wildcards used with LIKE?",
      a: "% matches zero or more characters and _ matches exactly one character. Escape them with \\ or an ESCAPE clause to search for the literal characters.",
      level: "Easy"
    },
    {
      q: "Why can NOT IN return no rows unexpectedly?",
      a: "If the list or subquery contains NULL, x NOT IN (1, NULL) becomes x<>1 AND x<>NULL, and x<>NULL is unknown, so no row is TRUE. Use NOT EXISTS or filter NULLs out.",
      level: "Hard"
    },
    {
      q: "Are string comparisons case-sensitive in MySQL?",
      a: "By default no, because the default collation utf8mb4_0900_ai_ci is case- and accent-insensitive. Use a binary/_cs collation or BINARY col = 'x' for case-sensitive comparison.",
      level: "Medium"
    },
    {
      q: "Why should you avoid SELECT * in production code?",
      a: "It returns unnecessary data (more I/O and network), prevents covering-index optimisations, and can break application code when columns are added, removed or reordered.",
      level: "Medium"
    },
    {
      q: "Why is WHERE name LIKE '%kumar' slow on big tables?",
      a: "A leading wildcard prevents MySQL from using a B-tree index on name, forcing a full table scan. Patterns like 'kumar%' can use the index. Full-text indexes help for word searches.",
      level: "Medium"
    },
    {
      q: "Can you use a column alias in WHERE?",
      a: "No. WHERE is evaluated before SELECT, so the alias does not exist yet. Repeat the expression, or use the alias in HAVING/ORDER BY, or wrap the query in a derived table.",
      level: "Medium"
    },
    {
      q: "What is the <=> operator?",
      a: "The NULL-safe equality operator. It returns 1 when both sides are NULL and 0 when one is NULL, instead of NULL.",
      level: "Medium"
    }
  ],
  practice: [
    {
      task: "List first_name and fees of students whose fees are more than 60000 and who are female.",
      hint: "Two conditions with AND.",
      solution: `SELECT first_name, fees
FROM students
WHERE fees > 60000 AND gender = 'F';`
    },
    {
      task: "Show students who are NOT from Pune or Mumbai, including those whose city is unknown.",
      hint: "NOT IN does not return NULL cities; add OR city IS NULL.",
      solution: `SELECT first_name, city
FROM students
WHERE city NOT IN ('Pune', 'Mumbai') OR city IS NULL;`
    },
    {
      task: "Find students admitted between 2022-01-01 and 2023-12-31 whose email contains the letter k.",
      hint: "BETWEEN for dates, LIKE '%k%'.",
      solution: `SELECT first_name, email, admission_date
FROM students
WHERE admission_date BETWEEN '2022-01-01' AND '2023-12-31'
  AND email LIKE '%k%';`
    },
    {
      task: "List courses whose name ends with \"ing\" or that have exactly 4 credits.",
      hint: "LIKE '%ing' OR credits = 4.",
      solution: `SELECT course_name, credits
FROM courses
WHERE course_name LIKE '%ing' OR credits = 4;`
    },
    {
      task: "Find faculty whose name starts with \"Dr.\" and salary is not between 80000 and 100000.",
      hint: "LIKE 'Dr.%' and NOT BETWEEN.",
      solution: `SELECT name, salary
FROM faculty
WHERE name LIKE 'Dr.%' AND salary NOT BETWEEN 80000 AND 100000;`
    }
  ],
  quiz: [
    {
      question: "Which query finds students whose city is missing?",
      options: [
        "WHERE city = NULL",
        "WHERE city = ''",
        "WHERE city IS NULL",
        "WHERE city == NULL"
      ],
      answer: 2,
      explanation: "Only IS NULL tests for NULL correctly."
    },
    {
      question: "What does LIKE '_a%' match?",
      options: [
        "Values whose second character is a",
        "Values starting with a",
        "Values ending with a",
        "Values containing exactly two characters"
      ],
      answer: 0,
      explanation: "_ is one character, then a, then anything."
    },
    {
      question: "marks BETWEEN 60 AND 80 is equivalent to:",
      options: [
        "marks > 60 AND marks < 80",
        "marks >= 60 OR marks <= 80",
        "marks IN (60, 80)",
        "marks >= 60 AND marks <= 80"
      ],
      answer: 3,
      explanation: "BETWEEN is inclusive on both ends."
    },
    {
      question: "Which operator is evaluated first?",
      options: [
        "OR",
        "AND",
        "They are evaluated left to right always",
        "Whichever is written first"
      ],
      answer: 1,
      explanation: "AND has higher precedence than OR."
    },
    {
      question: "WHERE city IN ('Pune','Delhi') is the same as:",
      options: [
        "city = 'Pune' AND city = 'Delhi'",
        "city = 'Pune' OR city = 'Delhi'",
        "city LIKE 'Pune%Delhi'",
        "city BETWEEN 'Pune' AND 'Delhi'"
      ],
      answer: 1,
      explanation: "IN is shorthand for several OR equality tests."
    }
  ]
};
