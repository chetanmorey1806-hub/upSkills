export default {
  id: "day-04-creating-databases-tables",
  title: "Creating Databases and Tables (SQL and Workbench GUI) and MySQL Data Types",
  module: "Module 1: Getting Started with MySQL & Workbench",
  day: 4,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Create, select and drop databases; create tables with CREATE TABLE and with the Workbench Create Schema and Create Table wizards; inspect them with SHOW TABLES and DESCRIBE; and choose the right MySQL data type (numeric, string, date/time, ENUM, JSON) for every column. You will also build the college sample database used for the rest of the course.",
  objectives: [
    "Create, list, select and drop databases with SQL and with the Workbench GUI",
    "Write CREATE TABLE statements with suitable column data types",
    "Use the Workbench Create Table wizard and review the generated SQL",
    "Inspect structures with SHOW TABLES, DESCRIBE and SHOW CREATE TABLE",
    "Choose between INT/BIGINT, DECIMAL/FLOAT, CHAR/VARCHAR/TEXT, DATE/DATETIME/TIMESTAMP"
  ],
  theory: [
    {
      heading: "Databases (Schemas): Create, Use, Drop",
      content: "A database (MySQL also calls it a schema) is a container for tables, views and procedures. One MySQL server can hold many databases, e.g. college, ecommerce and hr. In MySQL the words DATABASE and SCHEMA are interchangeable.",
      syntax: `CREATE DATABASE college;                       -- error 1007 if it already exists
CREATE DATABASE IF NOT EXISTS college;         -- safe version
CREATE DATABASE shop CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SHOW DATABASES;                                -- list all
USE college;                                   -- make it the default
SELECT DATABASE();                             -- which one is selected?
DROP DATABASE IF EXISTS shop;                  -- delete it with ALL its tables`,
      points: [
        "Naming rules: letters, digits, _ and $; up to 64 characters; avoid spaces and reserved words; use lowercase with underscores (snake_case) like student_marks.",
        "utf8mb4 is the default character set in MySQL 8 and supports all languages and emojis.",
        "DROP DATABASE cannot be undone. Workbench asks for confirmation in the GUI, but SQL does not."
      ]
    },
    {
      heading: "CREATE TABLE Syntax",
      content: "A table is defined by its name and a list of columns. Each column needs a name and a data type, and may have constraints (rules) such as PRIMARY KEY, NOT NULL, UNIQUE or DEFAULT (constraints are covered in depth on Day 5).",
      syntax: `CREATE TABLE [IF NOT EXISTS] table_name (
  column1 datatype [constraints],
  column2 datatype [constraints],
  ...,
  [table_constraints]
) [ENGINE=InnoDB] [DEFAULT CHARSET=utf8mb4];`,
      points: [
        "SHOW TABLES; lists tables of the current database. SHOW FULL TABLES; also shows whether each is a BASE TABLE or VIEW.",
        "DESCRIBE students; (or DESC students; or SHOW COLUMNS FROM students;) shows Field, Type, Null, Key, Default, Extra.",
        "SHOW CREATE TABLE students; returns the full CREATE statement exactly as MySQL stores it.",
        "ENGINE=InnoDB is the default storage engine: it supports transactions and foreign keys. MyISAM is older and does not.",
        "Create a copy: CREATE TABLE students_backup AS SELECT * FROM students; (copies data but not keys) or CREATE TABLE t2 LIKE t1; (copies structure with keys, no data)."
      ]
    },
    {
      heading: "Numeric Data Types",
      content: "Choose the smallest type that safely fits your data. Smaller types use less disk and memory and make indexes faster.",
      points: [
        "TINYINT: 1 byte, -128 to 127 (UNSIGNED 0 to 255). Good for age, rating, flags.",
        "SMALLINT: 2 bytes, up to 32,767 (UNSIGNED 65,535). MEDIUMINT: 3 bytes, about 8 million.",
        "INT (INTEGER): 4 bytes, about -2.1 billion to 2.1 billion (UNSIGNED 4.29 billion). Default choice for ids and counts.",
        "BIGINT: 8 bytes, about 9.2 quintillion. For very large ids, phone numbers stored as numbers, bytes counters.",
        "DECIMAL(p,s): exact fixed-point. p = total digits, s = digits after the decimal point. DECIMAL(10,2) stores up to 99,999,999.99. ALWAYS use DECIMAL for money.",
        "FLOAT (4 bytes) and DOUBLE (8 bytes): approximate floating point. Fine for scientific values, NOT for money (0.1 + 0.2 may become 0.30000000000000004).",
        "BOOLEAN / BOOL: synonym for TINYINT(1); TRUE = 1, FALSE = 0.",
        "UNSIGNED: disallows negatives and doubles the positive range."
      ],
      tip: "INT(11) display width is deprecated in MySQL 8. INT(5) does NOT limit the value to 5 digits."
    },
    {
      heading: "String Data Types",
      content: "Strings hold text. The key difference is fixed versus variable length.",
      points: [
        "CHAR(n): fixed length, 0-255 characters. Always uses n characters (pads with spaces). Good for fixed codes: gender CHAR(1), country_code CHAR(2), PIN codes.",
        "VARCHAR(n): variable length up to 65,535 bytes (shared by the row). Uses only the length you store + 1-2 bytes. Use for names, emails, cities.",
        "TEXT family: TINYTEXT (255 B), TEXT (64 KB), MEDIUMTEXT (16 MB), LONGTEXT (4 GB). For long descriptions, comments, articles. Cannot have a DEFAULT value (before 8.0.13) and indexing needs a prefix length.",
        "ENUM('M','F','O'): one value from a fixed list. SET('a','b','c'): zero or more values from a list.",
        "BINARY/VARBINARY and BLOB family: raw bytes (images, files). Usually it is better to store files on disk/cloud and keep only the path in VARCHAR.",
        "Store phone numbers and PIN codes as VARCHAR/CHAR, not INT: they may start with 0 or +, and you never do maths on them."
      ]
    },
    {
      heading: "Date, Time and Other Types",
      content: "MySQL stores dates in the ISO format YYYY-MM-DD. Always insert dates as strings in that format: '2024-07-15'.",
      points: [
        "DATE: 'YYYY-MM-DD', range 1000-01-01 to 9999-12-31. Birthdays, admission dates.",
        "TIME: 'HH:MM:SS' (can also hold durations up to 838 hours).",
        "DATETIME: 'YYYY-MM-DD HH:MM:SS', 1000 to 9999, no time-zone conversion. Order dates, appointment times.",
        "TIMESTAMP: same format, range 1970 to 2038, stored in UTC and converted to the session time zone. Ideal for created_at/updated_at with DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP.",
        "YEAR: 4-digit year, 1901 to 2155.",
        "JSON (MySQL 5.7+): validated JSON documents, queried with ->, ->> and JSON_EXTRACT.",
        "Spatial types (POINT, GEOMETRY) exist for maps and GIS."
      ]
    },
    {
      heading: "Doing It in the Workbench GUI: Create Schema and Create Table Wizards",
      content: "Workbench can generate DDL for you. Every wizard ends with an \"Apply SQL Script to Database\" review screen that shows the exact SQL before it runs - a great way to learn syntax.",
      points: [
        "Create Schema: click the \"Create a new schema in the connected server\" icon (cylinder with +) on the main toolbar, or right-click in the Schemas list > Create Schema... Enter Name: college, Charset/Collation: utf8mb4 / utf8mb4_0900_ai_ci (or Default). Click Apply > review CREATE SCHEMA college; > Apply > Finish.",
        "Create Table: expand college, right-click Tables > Create Table... A new tab opens. Table Name: courses. Charset/Collation and Engine (InnoDB) are on the same row; Comments box beside them.",
        "In the column grid, double-click under \"Column Name\" to add a column. Choose the Datatype from the drop-down (INT, VARCHAR(45), DECIMAL(10,2), DATE ...).",
        "Check boxes per column: PK (primary key), NN (not null), UQ (unique), B (binary), UN (unsigned), ZF (zero fill), AI (auto increment), G (generated). Default/Expression column for default values.",
        "Bottom tabs of the editor: Columns, Indexes, Foreign Keys, Triggers, Partitioning, Options.",
        "Click Apply > review the CREATE TABLE statement > Apply > Finish. The table appears under Tables (refresh if needed).",
        "To change a table later: hover > wrench icon (Alter Table...) opens the same editor."
      ],
      tip: "Workbench defaults new VARCHAR columns to VARCHAR(45). Change it to a sensible size like VARCHAR(100) for names or VARCHAR(150) for emails."
    }
  ],
  examples: [
    {
      title: "Create, list, select and drop databases",
      scenario: "Set up the college database for the course and practise creating and removing a temporary one.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script below and press Ctrl+Shift+Enter",
        "In the Navigator > Schemas, click refresh: college is listed, temp_db is not (it was dropped)"
      ],
      code: `CREATE DATABASE IF NOT EXISTS college;
CREATE DATABASE IF NOT EXISTS temp_db;
SHOW DATABASES;
DROP DATABASE IF EXISTS temp_db;
USE college;
SELECT DATABASE() AS now_using;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
CREATE DATABASE IF NOT EXISTS temp_db;
SHOW DATABASES;
DROP DATABASE IF EXISTS temp_db;
USE college;
SELECT DATABASE() AS now_using;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> CREATE DATABASE IF NOT EXISTS temp_db -> 1 row(s) affected
>> SHOW DATABASES
+----------+
| Database |
+----------+
| college  |
| temp_db  |
+----------+
2 row(s) returned
>> DROP DATABASE IF EXISTS temp_db -> 0 row(s) affected
>> USE college -> 0 row(s) affected
>> SELECT DATABASE() AS now_using
+-----------+
| now_using |
+-----------+
| college   |
+-----------+
1 row(s) returned`,
      explanation: "IF NOT EXISTS prevents error 1007 when the database already exists and IF EXISTS prevents error 1008 when dropping something missing. On a real server SHOW DATABASES also lists information_schema, mysql, performance_schema and sys. USE sets the default database for every following statement."
    },
    {
      title: "Create the departments and students tables and inspect them",
      scenario: "Design two tables for the college with suitable data types and check the structure with DESCRIBE.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type the script",
        "Press Ctrl+Shift+Enter",
        "Refresh the Navigator and click students; the Information panel (Object Info) shows its columns",
        "Look at Result 2 (DESCRIBE) in the result area"
      ],
      code: `USE college;

CREATE TABLE departments (
  dept_id    INT AUTO_INCREMENT PRIMARY KEY,
  dept_name  VARCHAR(50) NOT NULL,
  building   VARCHAR(20)
);

CREATE TABLE students (
  student_id     INT AUTO_INCREMENT PRIMARY KEY,
  first_name     VARCHAR(30) NOT NULL,
  last_name      VARCHAR(30),
  email          VARCHAR(80),
  gender         CHAR(1),
  dob            DATE,
  city           VARCHAR(30),
  dept_id        INT,
  marks          TINYINT UNSIGNED,
  fees           DECIMAL(10,2),
  admission_date DATE
);

SHOW TABLES;
DESCRIBE students;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id    INT AUTO_INCREMENT PRIMARY KEY,
  dept_name  VARCHAR(50) NOT NULL,
  building   VARCHAR(20)
);
CREATE TABLE students (
  student_id     INT AUTO_INCREMENT PRIMARY KEY,
  first_name     VARCHAR(30) NOT NULL,
  last_name      VARCHAR(30),
  email          VARCHAR(80),
  gender         CHAR(1),
  dob            DATE,
  city           VARCHAR(30),
  dept_id        INT,
  marks          TINYINT UNSIGNED,
  fees           DECIMAL(10,2),
  admission_date DATE
);
SHOW TABLES;
DESCRIBE students;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected
>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected
>> DROP TABLE IF EXISTS courses -> 0 row(s) affected
>> DROP TABLE IF EXISTS students -> 0 row(s) affected
>> DROP TABLE IF EXISTS departments -> 0 row(s) affected
>> CREATE TABLE departments ( -> 0 row(s) affected
>> CREATE TABLE students ( -> 0 row(s) affected
>> SHOW TABLES
+-------------------+
| Tables_in_college |
+-------------------+
| departments       |
| students          |
+-------------------+
2 row(s) returned
>> DESCRIBE students
+----------------+---------------+------+-----+---------+----------------+
| Field          | Type          | Null | Key | Default | Extra          |
+----------------+---------------+------+-----+---------+----------------+
| student_id     | integer       | NO   | PRI | NULL    | auto_increment |
| first_name     | varchar(30)   | NO   |     | NULL    |                |
| last_name      | varchar(30)   | YES  |     | NULL    |                |
| email          | varchar(80)   | YES  |     | NULL    |                |
| gender         | char(1)       | YES  |     | NULL    |                |
| dob            | date          | YES  |     | NULL    |                |
| city           | varchar(30)   | YES  |     | NULL    |                |
| dept_id        | int           | YES  |     | NULL    |                |
| marks          | tinyint       | YES  |     | NULL    |                |
| fees           | decimal(10,2) | YES  |     | NULL    |                |
| admission_date | date          | YES  |     | NULL    |                |
+----------------+---------------+------+-----+---------+----------------+
11 row(s) returned`,
      explanation: "DESCRIBE shows each Field with its Type, whether NULL is allowed, Key (PRI = primary key) and Extra (auto_increment). On a real MySQL 8 server the types appear as int, varchar(30), char(1), date, tinyint unsigned and decimal(10,2). Choices made: CHAR(1) for a one-letter gender code, DATE for dates, DECIMAL for money, TINYINT UNSIGNED for marks 0-100."
    },
    {
      title: "Create Table wizard in Workbench (courses table)",
      scenario: "Create the courses table using only the mouse, then compare with the SQL Workbench generates.",
      steps: [
        "Navigator > Schemas > expand college > right-click Tables > Create Table...",
        "Table Name: courses, Engine: InnoDB",
        "Row 1: Column Name course_id, Datatype INT, tick PK, NN, AI",
        "Row 2: course_name, VARCHAR(60), tick NN. Row 3: dept_id, INT. Row 4: credits, TINYINT. Row 5: fee, DECIMAL(8,2), Default/Expression 5000.00",
        "Click Apply: the \"Apply SQL Script to Database\" window shows the statement below. Click Apply, then Finish",
        "Run DESCRIBE courses; in a query tab to confirm"
      ],
      code: `-- Generated by Workbench (it adds backticks around every name):
CREATE TABLE courses (
  course_id   INT NOT NULL AUTO_INCREMENT,
  course_name VARCHAR(60) NOT NULL,
  dept_id     INT NULL,
  credits     TINYINT NULL,
  fee         DECIMAL(8,2) NULL DEFAULT 5000.00,
  PRIMARY KEY (course_id)
);

DESCRIBE courses;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
  course_id   INT NOT NULL AUTO_INCREMENT,
  course_name VARCHAR(60) NOT NULL,
  dept_id     INT NULL,
  credits     TINYINT NULL,
  fee         DECIMAL(8,2) NULL DEFAULT 5000.00,
  PRIMARY KEY (course_id)
);
DESCRIBE courses;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected
>> DROP TABLE IF EXISTS courses -> 0 row(s) affected
>> CREATE TABLE courses ( -> 0 row(s) affected
>> DESCRIBE courses
+-------------+--------------+------+-----+---------+----------------+
| Field       | Type         | Null | Key | Default | Extra          |
+-------------+--------------+------+-----+---------+----------------+
| course_id   | integer      | NO   | PRI | NULL    | auto_increment |
| course_name | varchar(60)  | NO   |     | NULL    |                |
| dept_id     | int          | YES  |     | NULL    |                |
| credits     | tinyint      | YES  |     | NULL    |                |
| fee         | decimal(8,2) | YES  |     | 5000.00 |                |
+-------------+--------------+------+-----+---------+----------------+
5 row(s) returned`,
      explanation: "The wizard writes the primary key as a separate table constraint PRIMARY KEY (course_id) at the end - equivalent to writing PRIMARY KEY after the column. NN became NOT NULL, AI became AUTO_INCREMENT and the Default/Expression box became DEFAULT 5000.00. Use the review screen to learn the syntax."
    },
    {
      title: "Build the complete college sample database",
      scenario: "Create all five course tables (departments, students, courses, faculty, enrollments) with sample data. Every later lesson uses this database - save this script as college_setup.sql (Ctrl+S).",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, paste the whole script",
        "File > Save Script As... college_setup.sql (so you can reopen it with Ctrl+Shift+O later)",
        "Press Ctrl+Shift+Enter; the Action Output should show only green ticks",
        "Refresh the Navigator: college > Tables shows the five tables"
      ],
      code: `CREATE DATABASE IF NOT EXISTS college;
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
CREATE TABLE enrollments (
  enroll_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enroll_date DATE,
  grade CHAR(2),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
INSERT INTO enrollments (student_id, course_id, enroll_date, grade) VALUES
(1,1,'2024-01-10','A'),(1,2,'2024-01-10','B'),(2,1,'2024-01-11','A'),(2,3,'2024-01-11','A'),
(3,4,'2024-01-12','B'),(3,5,'2024-01-12','C'),(4,6,'2024-01-15','A'),(5,7,'2024-01-15','C'),
(6,4,'2024-01-16','A'),(6,5,'2024-01-16','A'),(8,2,'2024-01-18',NULL),(9,6,'2024-01-18','B'),
(10,7,'2024-01-20','A');

SHOW TABLES;
SELECT COUNT(*) AS students FROM students;
SELECT COUNT(*) AS enrollments FROM enrollments;`,
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
CREATE TABLE enrollments (
  enroll_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enroll_date DATE,
  grade CHAR(2),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
INSERT INTO enrollments (student_id, course_id, enroll_date, grade) VALUES
(1,1,'2024-01-10','A'),(1,2,'2024-01-10','B'),(2,1,'2024-01-11','A'),(2,3,'2024-01-11','A'),
(3,4,'2024-01-12','B'),(3,5,'2024-01-12','C'),(4,6,'2024-01-15','A'),(5,7,'2024-01-15','C'),
(6,4,'2024-01-16','A'),(6,5,'2024-01-16','A'),(8,2,'2024-01-18',NULL),(9,6,'2024-01-18','B'),
(10,7,'2024-01-20','A');
SHOW TABLES;
SELECT COUNT(*) AS students FROM students;
SELECT COUNT(*) AS enrollments FROM enrollments;`,
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
>> CREATE TABLE courses ( -> 0 row(s) affected
>> INSERT INTO courses (course_name, dept_id, credits, fee) VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0
>> CREATE TABLE faculty ( -> 0 row(s) affected
>> INSERT INTO faculty (name, dept_id, designation, salary, hire_date) VA -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0
>> CREATE TABLE enrollments ( -> 0 row(s) affected
>> INSERT INTO enrollments (student_id, course_id, enroll_date, grade) VA -> 13 row(s) affected Records: 13  Duplicates: 0  Warnings: 0
>> SHOW TABLES
+-------------------+
| Tables_in_college |
+-------------------+
| courses           |
| departments       |
| enrollments       |
| faculty           |
| students          |
+-------------------+
5 row(s) returned
>> SELECT COUNT(*) AS students FROM students
+----------+
| students |
+----------+
| 10       |
+----------+
1 row(s) returned
>> SELECT COUNT(*) AS enrollments FROM enrollments
+-------------+
| enrollments |
+-------------+
| 13          |
+-------------+
1 row(s) returned`,
      explanation: "Tables are dropped child-first (enrollments before students and courses) and created parent-first (departments before students), because foreign keys need the parent table to exist. The college database now has 5 departments, 10 students, 8 courses, 6 faculty members and 13 enrollments. Keep this script: any time your data gets messed up, run it again to reset."
    },
    {
      title: "Data types in action",
      scenario: "Create a table that uses many data types, insert a row and read it back to see how each value is stored.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab, type the script",
        "Press Ctrl+Shift+Enter",
        "Switch the result area to \"Field Types\" (right-side vertical bar) to see the type of each returned column"
      ],
      code: `CREATE TABLE type_demo (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  age        TINYINT UNSIGNED,
  population BIGINT,
  price      DECIMAL(8,2),
  rating     FLOAT,
  pin_code   CHAR(6),
  full_name  VARCHAR(60),
  bio        TEXT,
  is_active  BOOLEAN,
  birth_date DATE,
  login_time DATETIME,
  grad_year  YEAR
);
INSERT INTO type_demo (age, population, price, rating, pin_code, full_name, bio, is_active, birth_date, login_time, grad_year)
VALUES (20, 1400000000, 499, 4.5, '411001', 'Aarav Sharma', 'Loves databases', TRUE, '2004-03-15', '2024-08-01 09:30:00', 2026);
SELECT age, population, pin_code, is_active, birth_date, login_time, grad_year FROM type_demo;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS type_demo;
CREATE TABLE type_demo (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  age        TINYINT UNSIGNED,
  population BIGINT,
  price      DECIMAL(8,2),
  rating     FLOAT,
  pin_code   CHAR(6),
  full_name  VARCHAR(60),
  bio        TEXT,
  is_active  BOOLEAN,
  birth_date DATE,
  login_time DATETIME,
  grad_year  YEAR
);
INSERT INTO type_demo (age, population, price, rating, pin_code, full_name, bio, is_active, birth_date, login_time, grad_year)
VALUES (20, 1400000000, 499, 4.5, '411001', 'Aarav Sharma', 'Loves databases', TRUE, '2004-03-15', '2024-08-01 09:30:00', 2026);
SELECT age, population, pin_code, is_active, birth_date, login_time, grad_year FROM type_demo;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> DROP TABLE IF EXISTS type_demo -> 0 row(s) affected
>> CREATE TABLE type_demo ( -> 0 row(s) affected
>> INSERT INTO type_demo (age, population, price, rating, pin_code, full_ -> 1 row(s) affected
>> SELECT age, population, pin_code, is_active, birth_date, login_time, g
+-----+------------+----------+-----------+------------+---------------------+-----------+
| age | population | pin_code | is_active | birth_date | login_time          | grad_year |
+-----+------------+----------+-----------+------------+---------------------+-----------+
| 20  | 1400000000 | 411001   | 1         | 2004-03-15 | 2024-08-01 09:30:00 | 2026      |
+-----+------------+----------+-----------+------------+---------------------+-----------+
1 row(s) returned`,
      explanation: "BOOLEAN TRUE is stored as 1. BIGINT holds 1.4 billion easily (INT would also fit, but 3 billion would not). PIN code is CHAR(6) text so leading zeros are never lost. DATETIME keeps both date and time. In real MySQL, price would display as 499.00 because DECIMAL(8,2) always keeps two decimals."
    }
  ],
  interview: [
    {
      q: "What is the difference between CHAR and VARCHAR?",
      a: "CHAR(n) is fixed length: it always uses n characters and pads with spaces (trailing spaces are removed on retrieval). VARCHAR(n) is variable length: it stores only the actual characters plus 1-2 length bytes. CHAR is slightly faster for fixed-size codes; VARCHAR saves space for varying text.",
      level: "Easy"
    },
    {
      q: "Why should money be stored as DECIMAL and not FLOAT?",
      a: "FLOAT/DOUBLE are approximate binary floating-point types and cause rounding errors (0.1 + 0.2 != 0.3). DECIMAL stores exact base-10 values, so totals and balances are always correct.",
      level: "Easy"
    },
    {
      q: "What is the difference between DATETIME and TIMESTAMP?",
      a: "DATETIME stores the value as given (range 1000-9999, 5 bytes) with no time-zone conversion. TIMESTAMP stores UTC and converts to the session time zone, range 1970-2038 (4 bytes), and is commonly used with DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP.",
      level: "Medium"
    },
    {
      q: "Are DATABASE and SCHEMA the same in MySQL?",
      a: "Yes. CREATE SCHEMA and CREATE DATABASE are synonyms in MySQL. (In Oracle or SQL Server a schema is a namespace inside a database.)",
      level: "Easy"
    },
    {
      q: "How can you see the structure of a table?",
      a: "DESCRIBE table; / DESC table; / SHOW COLUMNS FROM table; for columns, SHOW CREATE TABLE table; for the full DDL, or query information_schema.COLUMNS. In Workbench: Table Inspector or the Object Info panel.",
      level: "Easy"
    },
    {
      q: "What does INT(11) mean in MySQL?",
      a: "11 is only a display width (used with ZEROFILL); it does not limit the range. It is deprecated in MySQL 8. INT always stores 4 bytes, -2,147,483,648 to 2,147,483,647.",
      level: "Medium"
    },
    {
      q: "What is the difference between CREATE TABLE ... AS SELECT and CREATE TABLE ... LIKE?",
      a: "CREATE TABLE new AS SELECT copies the column definitions and data, but not indexes, primary key or AUTO_INCREMENT. CREATE TABLE new LIKE old copies the full structure including indexes and keys but no data.",
      level: "Medium"
    },
    {
      q: "What is the default storage engine in MySQL 8 and why?",
      a: "InnoDB. It supports ACID transactions, row-level locking, foreign keys and crash recovery. MyISAM has table-level locking and no transactions or foreign keys.",
      level: "Medium"
    },
    {
      q: "What are ENUM and SET?",
      a: "ENUM allows exactly one value from a predefined list (e.g. ENUM('pending','shipped')), stored internally as an index number. SET allows zero or more values from a list (e.g. SET('sms','email')).",
      level: "Medium"
    },
    {
      q: "Which data type would you use for a phone number and why?",
      a: "VARCHAR(15) (or CHAR for fixed formats) because phone numbers can have leading zeros, +country codes and are never used in arithmetic. INT would also overflow for 10-digit numbers above 2,147,483,647.",
      level: "Easy"
    },
    {
      q: "What is utf8mb4 and why is it preferred over utf8?",
      a: "utf8mb4 is full UTF-8 (up to 4 bytes per character) supporting all Unicode including emojis and many Asian scripts. MySQL's old utf8 (utf8mb3) supports only 3 bytes. utf8mb4 is the default in MySQL 8.",
      level: "Medium"
    }
  ],
  practice: [
    {
      task: "Create a database hostel and inside it a table rooms with: room_no INT primary key, block CHAR(1), capacity TINYINT UNSIGNED, monthly_rent DECIMAL(8,2), is_ac BOOLEAN. Show its structure.",
      hint: "CREATE DATABASE IF NOT EXISTS hostel; USE hostel; CREATE TABLE ...; DESCRIBE rooms;",
      solution: `CREATE DATABASE IF NOT EXISTS hostel;
USE hostel;
DROP TABLE IF EXISTS rooms;
CREATE TABLE rooms (
  room_no      INT PRIMARY KEY,
  block        CHAR(1),
  capacity     TINYINT UNSIGNED,
  monthly_rent DECIMAL(8,2),
  is_ac        BOOLEAN
);
DESCRIBE rooms;`
    },
    {
      task: "In college, create a table library_books with book_id auto-increment primary key, title VARCHAR(150) NOT NULL, author VARCHAR(80), published_year YEAR, price DECIMAL(7,2), added_on DATETIME.",
      hint: "Pick YEAR for the year and DATETIME for added_on.",
      solution: `USE college;
DROP TABLE IF EXISTS library_books;
CREATE TABLE library_books (
  book_id        INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(150) NOT NULL,
  author         VARCHAR(80),
  published_year YEAR,
  price          DECIMAL(7,2),
  added_on       DATETIME
);
SHOW TABLES;`
    },
    {
      task: "Choose data types for: Aadhaar number (12 digits), product weight in kg with 3 decimals, a blog post body, an order time, a T-shirt size (S/M/L/XL).",
      hint: "Think: do you do maths on it? Fixed or variable? Exact or approximate?",
      solution: `aadhaar_no   CHAR(12)                      -- fixed-length digits, no maths
weight_kg    DECIMAL(7,3)                  -- exact with 3 decimals
post_body    TEXT  (or MEDIUMTEXT)         -- long text
ordered_at   DATETIME  (or TIMESTAMP)      -- date + time
tshirt_size  ENUM('S','M','L','XL')        -- fixed list`
    },
    {
      task: "Use the Workbench Create Table wizard to create a table notices (notice_id PK NN AI, title VARCHAR(100) NN, posted_on DATE). Write the SQL that the Apply screen shows.",
      hint: "Right-click Tables > Create Table..., tick PK, NN, AI.",
      solution: `CREATE TABLE notices (
  notice_id INT NOT NULL AUTO_INCREMENT,
  title     VARCHAR(100) NOT NULL,
  posted_on DATE NULL,
  PRIMARY KEY (notice_id)
);`
    },
    {
      task: "Make a copy of the students table called students_2024 including its data, then show both tables in SHOW TABLES.",
      hint: "CREATE TABLE ... AS SELECT * FROM ...",
      solution: `DROP TABLE IF EXISTS students_2024;
CREATE TABLE students_2024 AS SELECT * FROM students;
SHOW TABLES;`
    }
  ],
  quiz: [
    {
      question: "Which data type is best for storing a product price?",
      options: [
        "FLOAT",
        "DECIMAL(10,2)",
        "VARCHAR(10)",
        "INT"
      ],
      answer: 1,
      explanation: "DECIMAL is exact, so money calculations never suffer rounding errors."
    },
    {
      question: "Which statement shows the columns of the students table?",
      options: [
        "SHOW students;",
        "SELECT COLUMNS students;",
        "DESCRIBE students;",
        "LIST students;"
      ],
      answer: 2,
      explanation: "DESCRIBE (or DESC / SHOW COLUMNS FROM) lists Field, Type, Null, Key, Default and Extra."
    },
    {
      question: "In the Workbench Create Table editor, what does the AI checkbox mean?",
      options: [
        "Artificial Index",
        "Allow Insert",
        "Auto Import",
        "AUTO_INCREMENT"
      ],
      answer: 3,
      explanation: "PK = primary key, NN = not null, UQ = unique, UN = unsigned, ZF = zero fill, AI = auto increment."
    },
    {
      question: "What is the range of TINYINT UNSIGNED?",
      options: [
        "0 to 255",
        "-128 to 127",
        "0 to 65,535",
        "0 to 1"
      ],
      answer: 0,
      explanation: "TINYINT is 1 byte: 256 values. UNSIGNED makes it 0-255."
    },
    {
      question: "In MySQL, CREATE SCHEMA college; is:",
      options: [
        "An error",
        "The same as CREATE DATABASE college;",
        "Creates a table named college",
        "Creates a user named college"
      ],
      answer: 1,
      explanation: "SCHEMA and DATABASE are synonyms in MySQL."
    }
  ]
};
