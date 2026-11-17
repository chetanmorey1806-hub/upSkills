export default {
  id: "day-01-introduction-to-databases",
  title: "Introduction to Databases, DBMS vs RDBMS, SQL vs MySQL",
  module: "Module 1: Getting Started with MySQL & Workbench",
  day: 1,
  level: "Beginner",
  duration: "1.5 hours",
  summary: "Understand what data and databases are, why we use a DBMS instead of Excel files, how an RDBMS stores data in related tables, the difference between SQL (the language) and MySQL (the software), and where MySQL is used in the real world.",
  objectives: [
    "Explain data, information, database and DBMS in simple words",
    "Compare file systems, DBMS and RDBMS and list the advantages of an RDBMS",
    "Describe tables, rows, columns, primary keys and relationships",
    "Differentiate SQL (language) from MySQL (database server) and name the SQL sub-languages DDL, DML, DQL, DCL, TCL",
    "Run your first SQL statements and read the Result Grid"
  ],
  theory: [
    {
      heading: "Data, Information and Database",
      content: "Data is raw facts: \"Aarav\", \"88\", \"Pune\". Information is data that has meaning: \"Aarav from Pune scored 88 marks\". A database is an organised collection of related data stored electronically so it can be searched, updated and protected easily. Think of a college office: earlier every student record was written in registers (paper files). Searching \"all students from Pune with marks above 80\" meant turning hundreds of pages. A database does the same search in milliseconds.",
      points: [
        "Data = raw facts (numbers, text, dates, images).",
        "Information = processed data that answers a question.",
        "Database = organised, persistent collection of related data.",
        "Examples around you: bank accounts, railway reservations, Instagram posts, Amazon orders, college results."
      ]
    },
    {
      heading: "File System vs DBMS",
      content: "Before databases, programs stored data in separate files (text files, Excel sheets). This caused problems: the same student address saved in three files (redundancy), one file updated and another not (inconsistency), no easy way to search, no protection when two people edit together, and weak security. A DBMS (Database Management System) is software that sits between users and the data files and solves these problems. It stores data centrally, controls who can see what, allows many users at once, and can back up and recover data.",
      points: [
        "Redundancy: duplicate data wastes space. DBMS reduces it.",
        "Inconsistency: two copies disagree. DBMS keeps one copy with rules.",
        "Concurrency: DBMS lets many users read and write safely at the same time.",
        "Security: user accounts and privileges (you will do this on Day 28).",
        "Backup and recovery: tools to restore data after a crash (Day 29).",
        "Examples of DBMS software: MySQL, Oracle, SQL Server, PostgreSQL, MongoDB, SQLite."
      ],
      tip: "Excel is great for analysis of small data by one person. A DBMS is for large, shared, always-correct data used by applications."
    },
    {
      heading: "DBMS vs RDBMS",
      content: "A DBMS is any software that manages data. An RDBMS (Relational DBMS) is a DBMS that stores data in tables (relations) and links tables using keys. The relational model was proposed by E. F. Codd in 1970. In an RDBMS a table has columns (attributes, also called fields) and rows (records, also called tuples). A primary key uniquely identifies each row, and a foreign key in one table points to the primary key of another table, creating a relationship. MySQL is an RDBMS.",
      points: [
        "Table (relation): data about one kind of thing, e.g. students.",
        "Column (field / attribute): one property, e.g. city. Every value in a column has the same data type.",
        "Row (record / tuple): one complete entry, e.g. one student.",
        "Primary key: unique, not-null identifier, e.g. student_id.",
        "Foreign key: column that refers to a primary key in another table, e.g. students.dept_id -> departments.dept_id.",
        "Non-relational (NoSQL) databases such as MongoDB, Redis and Cassandra store documents, key-value pairs or wide columns instead of fixed tables."
      ],
      syntax: `departments                       students
+---------+------------------+     +------------+------------+---------+
| dept_id | dept_name        |     | student_id | first_name | dept_id |
+---------+------------------+     +------------+------------+---------+
| 1       | Computer Science | <-- | 1          | Aarav      | 1       |
| 2       | Mathematics      | <-- | 3          | Rohan      | 2       |
+---------+------------------+     +------------+------------+---------+
  primary key                         primary key            foreign key`
    },
    {
      heading: "SQL vs MySQL",
      content: "SQL (Structured Query Language, pronounced \"S-Q-L\" or \"sequel\") is the standard language used to talk to relational databases. MySQL is a software product (a database server) that understands SQL. Analogy: SQL is like the English language and MySQL is like one person who speaks English. Oracle, SQL Server and PostgreSQL also \"speak\" SQL, with small accents (dialect differences). MySQL was created in 1995 by MySQL AB (Sweden), bought by Sun Microsystems in 2008 and then by Oracle in 2010. It is open source (Community Edition is free) with a paid Enterprise Edition. MariaDB is a community fork of MySQL.",
      points: [
        "SQL = language (a standard: ANSI/ISO). MySQL = RDBMS software that executes SQL.",
        "SQL is declarative: you say WHAT you want, the database decides HOW to get it.",
        "SQL keywords are not case sensitive: SELECT and select are the same. We write keywords in CAPITALS for readability.",
        "Each statement ends with a semicolon ( ; ).",
        "MySQL Workbench is the official graphical tool (GUI) for working with MySQL. You will install it tomorrow."
      ]
    },
    {
      heading: "Types of SQL Commands",
      content: "SQL statements are grouped into five families. Remember them because interviewers love this question.",
      points: [
        "DDL (Data Definition Language): defines structure. CREATE, ALTER, DROP, TRUNCATE, RENAME.",
        "DML (Data Manipulation Language): changes data. INSERT, UPDATE, DELETE.",
        "DQL (Data Query Language): reads data. SELECT.",
        "DCL (Data Control Language): permissions. GRANT, REVOKE.",
        "TCL (Transaction Control Language): manages transactions. COMMIT, ROLLBACK, SAVEPOINT, START TRANSACTION."
      ],
      tip: "Some books put SELECT inside DML. Both answers are accepted; mention DQL to show you know the finer grouping."
    },
    {
      heading: "Where MySQL is Used",
      content: "MySQL is one of the most popular databases in the world. It is the \"M\" in the LAMP stack (Linux, Apache, MySQL, PHP/Python). Large companies such as Facebook (Meta), YouTube, Netflix, Uber, Airbnb, Booking.com and Twitter have used MySQL. WordPress, Joomla, Drupal and Magento store all their data in MySQL. Data analysts use MySQL as a data source for Excel and Power BI reports, and backend developers use it with Java (Spring Boot), Python (Django, Flask), Node.js and PHP (Laravel).",
      points: [
        "Web and mobile apps: users, orders, payments, products.",
        "Data analytics: write SQL to clean and summarise data, then connect Power BI or Excel to MySQL.",
        "Cloud: Amazon RDS for MySQL, Azure Database for MySQL, Google Cloud SQL.",
        "Default port: 3306. Default admin user: root."
      ]
    }
  ],
  examples: [
    {
      title: "Your first SQL statements: check the server",
      scenario: "You have just opened MySQL Workbench and want to confirm the server answers and see which database is selected.",
      steps: [
        "In MySQL Workbench: click the \"Local instance MySQL80\" connection tile on the Home screen",
        "File > New Query Tab (Ctrl+T)",
        "Type the query below",
        "Click the lightning bolt (Execute) or press Ctrl+Shift+Enter",
        "Read the answer in the Result Grid at the bottom"
      ],
      code: `-- Which MySQL version am I using and which database is selected?
SELECT VERSION() AS mysql_version, DATABASE() AS current_db;

-- SQL can also work like a calculator
SELECT 25 * 4 AS answer, 'Hello MySQL' AS greeting;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
SELECT VERSION() AS mysql_version, DATABASE() AS current_db;
SELECT 25 * 4 AS answer, 'Hello MySQL' AS greeting;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> SELECT VERSION() AS mysql_version, DATABASE() AS current_db
+------------------------------+------------+
| mysql_version                | current_db |
+------------------------------+------------+
| 8.0.36 (simulated on SQLite) | college    |
+------------------------------+------------+
1 row(s) returned
>> SELECT 25 * 4 AS answer, 'Hello MySQL' AS greeting
+--------+-------------+
| answer | greeting    |
+--------+-------------+
| 100    | Hello MySQL |
+--------+-------------+
1 row(s) returned`,
      explanation: "VERSION() returns the server version (in real MySQL Workbench you will see something like 8.0.36 or 8.4.x; the lab shows a simulated version). DATABASE() returns the database chosen with USE. A SELECT does not always need a table: SELECT 25 * 4 simply evaluates the expression. AS gives a column a friendly heading (an alias)."
    },
    {
      title: "See a table: rows and columns",
      scenario: "The college office wants a table of departments. Create it, add three rows and display it so you can identify the table, columns, rows and primary key.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script below",
        "Press Ctrl+Shift+Enter to execute the whole script",
        "In the Navigator (left side) click the refresh icon next to SCHEMAS to see the new table under college > Tables"
      ],
      code: `CREATE DATABASE IF NOT EXISTS college;
USE college;

CREATE TABLE departments (
  dept_id   INT PRIMARY KEY,      -- unique id of each row
  dept_name VARCHAR(50),          -- text up to 50 characters
  building  VARCHAR(20)
);

INSERT INTO departments VALUES
(1, 'Computer Science', 'Block A'),
(2, 'Mathematics', 'Block B'),
(3, 'Physics', 'Block C');

SELECT * FROM departments;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id   INT PRIMARY KEY,
  dept_name VARCHAR(50),
  building  VARCHAR(20)
);
INSERT INTO departments VALUES
(1, 'Computer Science', 'Block A'),
(2, 'Mathematics', 'Block B'),
(3, 'Physics', 'Block C');
SELECT * FROM departments;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected
>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected
>> DROP TABLE IF EXISTS courses -> 0 row(s) affected
>> DROP TABLE IF EXISTS students -> 0 row(s) affected
>> DROP TABLE IF EXISTS departments -> 0 row(s) affected
>> CREATE TABLE departments ( -> 0 row(s) affected
>> INSERT INTO departments VALUES -> 3 row(s) affected Records: 3  Duplicates: 0  Warnings: 0
>> SELECT * FROM departments
+---------+------------------+----------+
| dept_id | dept_name        | building |
+---------+------------------+----------+
| 1       | Computer Science | Block A  |
| 2       | Mathematics      | Block B  |
| 3       | Physics          | Block C  |
+---------+------------------+----------+
3 row(s) returned`,
      explanation: "The table departments is a relation. dept_id, dept_name and building are columns (fields). Each line in the grid is a row (record). dept_id is the primary key, so no two rows can share the same id. The Output panel shows one message per statement, e.g. \"3 row(s) affected\" for the INSERT. (The DROP TABLE lines in the lab script just clear old copies so it can be re-run.)"
    },
    {
      title: "A relationship between two tables",
      scenario: "Students belong to departments. Instead of typing \"Computer Science\" in every student row, we store only dept_id in students and link it to departments. This is the core idea of an RDBMS.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Paste the script and press Ctrl+Shift+Enter",
        "Look at the last Result Grid tab: names come from students, department names come from departments"
      ],
      code: `CREATE TABLE students (
  student_id INT PRIMARY KEY,
  first_name VARCHAR(30),
  dept_id    INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

INSERT INTO students VALUES (1,'Aarav',1),(2,'Diya',1),(3,'Rohan',2),(4,'Ananya',3);

-- Combine the two tables (you will master JOINs on Day 15)
SELECT s.first_name, d.dept_name
FROM students s
JOIN departments d ON s.dept_id = d.dept_id;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (dept_id INT PRIMARY KEY, dept_name VARCHAR(50));
INSERT INTO departments VALUES (1,'Computer Science'),(2,'Mathematics'),(3,'Physics');
CREATE TABLE students (
  student_id INT PRIMARY KEY,
  first_name VARCHAR(30),
  dept_id    INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
INSERT INTO students VALUES (1,'Aarav',1),(2,'Diya',1),(3,'Rohan',2),(4,'Ananya',3);
SELECT s.first_name, d.dept_name
FROM students s
JOIN departments d ON s.dept_id = d.dept_id;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected
>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected
>> DROP TABLE IF EXISTS courses -> 0 row(s) affected
>> DROP TABLE IF EXISTS students -> 0 row(s) affected
>> DROP TABLE IF EXISTS departments -> 0 row(s) affected
>> CREATE TABLE departments (dept_id INT PRIMARY KEY, dept_name VARCHAR(5 -> 0 row(s) affected
>> INSERT INTO departments VALUES (1,'Computer Science'),(2,'Mathematics' -> 3 row(s) affected Records: 3  Duplicates: 0  Warnings: 0
>> CREATE TABLE students ( -> 0 row(s) affected
>> INSERT INTO students VALUES (1,'Aarav',1),(2,'Diya',1),(3,'Rohan',2),( -> 4 row(s) affected Records: 4  Duplicates: 0  Warnings: 0
>> SELECT s.first_name, d.dept_name
+------------+------------------+
| first_name | dept_name        |
+------------+------------------+
| Aarav      | Computer Science |
| Diya       | Computer Science |
| Rohan      | Mathematics      |
| Ananya     | Physics          |
+------------+------------------+
4 row(s) returned`,
      explanation: "students.dept_id is a foreign key that refers to departments.dept_id. The department name is stored only once (no redundancy). If \"Physics\" is renamed, we update one row in departments and every student automatically shows the new name. The JOIN in the last query reads both related tables together."
    },
    {
      title: "DDL, DML and DQL in one script",
      scenario: "Identify which SQL family each statement belongs to while building a tiny notice board table.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script; place the cursor on each statement and press Ctrl+Enter to run them one at a time",
        "Watch the Output panel: every statement adds a line with a green tick, the action and \"row(s) affected\""
      ],
      code: `CREATE TABLE notices (id INT PRIMARY KEY, message VARCHAR(100));   -- DDL
INSERT INTO notices VALUES (1, 'Exams start on 10 March');            -- DML
INSERT INTO notices VALUES (2, 'Library closed on Sunday');           -- DML
UPDATE notices SET message = 'Exams start on 12 March' WHERE id = 1;  -- DML
SELECT * FROM notices;                                                -- DQL
DROP TABLE notices;                                                   -- DDL`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS notices;
CREATE TABLE notices (id INT PRIMARY KEY, message VARCHAR(100));
INSERT INTO notices VALUES (1, 'Exams start on 10 March');
INSERT INTO notices VALUES (2, 'Library closed on Sunday');
UPDATE notices SET message = 'Exams start on 12 March' WHERE id = 1;
SELECT * FROM notices;
DROP TABLE notices;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> DROP TABLE IF EXISTS notices -> 0 row(s) affected
>> CREATE TABLE notices (id INT PRIMARY KEY, message VARCHAR(100)) -> 0 row(s) affected
>> INSERT INTO notices VALUES (1, 'Exams start on 10 March') -> 1 row(s) affected
>> INSERT INTO notices VALUES (2, 'Library closed on Sunday') -> 1 row(s) affected
>> UPDATE notices SET message = 'Exams start on 12 March' WHERE id = 1 -> 1 row(s) affected Rows matched: 1  Changed: 1  Warnings: 0
>> SELECT * FROM notices
+----+--------------------------+
| id | message                  |
+----+--------------------------+
| 1  | Exams start on 12 March  |
| 2  | Library closed on Sunday |
+----+--------------------------+
2 row(s) returned
>> DROP TABLE notices -> 0 row(s) affected`,
      explanation: "CREATE and DROP change the structure (DDL). INSERT and UPDATE change the data (DML). SELECT only reads (DQL). Notice that UPDATE reports \"Rows matched: 1 Changed: 1\". After DROP TABLE the table and all its data are gone permanently."
    }
  ],
  interview: [
    {
      q: "What is a database?",
      a: "An organised, persistent collection of related data stored electronically so that it can be accessed, managed and updated efficiently, e.g. a bank's customer and account data.",
      level: "Easy"
    },
    {
      q: "What is the difference between DBMS and RDBMS?",
      a: "A DBMS is software to store and manage data (it may use files, hierarchies or documents). An RDBMS stores data in related tables using primary and foreign keys, supports SQL, enforces integrity constraints and ACID transactions. MySQL, Oracle and PostgreSQL are RDBMS.",
      level: "Easy"
    },
    {
      q: "What is the difference between SQL and MySQL?",
      a: "SQL is a standard query language for relational databases. MySQL is an open-source RDBMS software (owned by Oracle) that uses SQL to store and query data.",
      level: "Easy"
    },
    {
      q: "What are DDL, DML, DQL, DCL and TCL? Give examples.",
      a: "DDL defines structure (CREATE, ALTER, DROP, TRUNCATE, RENAME). DML changes data (INSERT, UPDATE, DELETE). DQL reads data (SELECT). DCL controls access (GRANT, REVOKE). TCL controls transactions (COMMIT, ROLLBACK, SAVEPOINT).",
      level: "Easy"
    },
    {
      q: "What is a primary key and a foreign key?",
      a: "A primary key uniquely identifies each row; it cannot be NULL or duplicate, and a table has only one. A foreign key is a column in one table that references the primary (or unique) key of another table to create a relationship and enforce referential integrity.",
      level: "Easy"
    },
    {
      q: "What problems of the file system does a DBMS solve?",
      a: "Data redundancy, inconsistency, difficult data access, no concurrency control, weak security, integrity problems and no automatic backup/recovery.",
      level: "Medium"
    },
    {
      q: "What is the default port and default administrative user of MySQL?",
      a: "Port 3306 and the user root.",
      level: "Easy"
    },
    {
      q: "Is SQL case sensitive?",
      a: "SQL keywords are not case sensitive (SELECT = select). In MySQL, table and database names may be case sensitive on Linux because they map to files, and string comparison depends on the collation (the default utf8mb4_0900_ai_ci is case-insensitive).",
      level: "Medium"
    },
    {
      q: "Name some RDBMS and some NoSQL databases.",
      a: "RDBMS: MySQL, PostgreSQL, Oracle, Microsoft SQL Server, MariaDB, SQLite. NoSQL: MongoDB (document), Redis (key-value), Cassandra (wide-column), Neo4j (graph).",
      level: "Easy"
    },
    {
      q: "What is the difference between MySQL and MariaDB?",
      a: "MariaDB is a community-developed fork of MySQL created by MySQL's original founder after Oracle acquired MySQL. It is largely compatible but has diverged in features such as storage engines, JSON handling and some optimiser features.",
      level: "Medium"
    }
  ],
  practice: [
    {
      task: "Write a query that shows the result of 150 + 75 with the heading total and the text 'SQL is fun' with the heading note.",
      hint: "SELECT can evaluate expressions without a table. Use AS for headings.",
      solution: "SELECT 150 + 75 AS total, 'SQL is fun' AS note;"
    },
    {
      task: "Create a database called library (only if it does not exist), select it and confirm with DATABASE().",
      hint: "CREATE DATABASE IF NOT EXISTS, then USE, then SELECT DATABASE().",
      solution: `CREATE DATABASE IF NOT EXISTS library;
USE library;
SELECT DATABASE() AS current_db;`
    },
    {
      task: "In the library database create a table books (book_id INT PRIMARY KEY, title VARCHAR(100), author VARCHAR(50)), add two books and display all rows.",
      hint: "CREATE TABLE, INSERT INTO ... VALUES (...),(...), SELECT * FROM books.",
      solution: `CREATE DATABASE IF NOT EXISTS library;
USE library;
DROP TABLE IF EXISTS books;
CREATE TABLE books (book_id INT PRIMARY KEY, title VARCHAR(100), author VARCHAR(50));
INSERT INTO books VALUES (1, 'Wings of Fire', 'A. P. J. Abdul Kalam'), (2, 'The Guide', 'R. K. Narayan');
SELECT * FROM books;`
    },
    {
      task: "Label each statement with its SQL family: (a) GRANT SELECT ON college.* TO 'ravi'@'localhost'; (b) TRUNCATE TABLE logs; (c) ROLLBACK; (d) DELETE FROM logs WHERE id = 5; (e) SELECT COUNT(*) FROM logs;",
      hint: "DDL changes structure, DML changes rows, DQL reads, DCL is permissions, TCL is transactions.",
      solution: `-- (a) GRANT ...      -> DCL
-- (b) TRUNCATE ...   -> DDL
-- (c) ROLLBACK       -> TCL
-- (d) DELETE ...     -> DML
-- (e) SELECT ...     -> DQL`
    }
  ],
  quiz: [
    {
      question: "Which of these is an RDBMS?",
      options: [
        "MongoDB",
        "MySQL",
        "Redis",
        "Excel"
      ],
      answer: 1,
      explanation: "MySQL stores data in related tables and uses SQL. MongoDB and Redis are NoSQL, Excel is a spreadsheet."
    },
    {
      question: "A single record in a table is called a:",
      options: [
        "Column",
        "Field",
        "Schema",
        "Row (tuple)"
      ],
      answer: 3,
      explanation: "Rows are records (tuples); columns are fields (attributes)."
    },
    {
      question: "Which command belongs to DDL?",
      options: [
        "CREATE",
        "INSERT",
        "SELECT",
        "GRANT"
      ],
      answer: 0,
      explanation: "CREATE defines structure, so it is DDL. INSERT is DML, SELECT is DQL, GRANT is DCL."
    },
    {
      question: "What is the default port of MySQL Server?",
      options: [
        "1521",
        "5432",
        "3306",
        "8080"
      ],
      answer: 2,
      explanation: "3306 is MySQL. 1521 is Oracle, 5432 is PostgreSQL."
    },
    {
      question: "Which statement about SQL and MySQL is correct?",
      options: [
        "SQL is a database and MySQL is a language",
        "SQL is a language and MySQL is an RDBMS that uses it",
        "They are two names for the same product",
        "MySQL can only be used from PHP"
      ],
      answer: 1,
      explanation: "SQL is the query language; MySQL is database software that understands SQL."
    }
  ]
};
