export default {
  "id": "mysql-day-14",
  "title": "Control Flow: CASE, IF, IFNULL, COALESCE, NULLIF",
  "module": "Module 3: Functions & Grouping",
  "day": 14,
  "level": "Intermediate",
  "duration": "2 hours",
  "summary": "Make decisions inside queries: searched and simple CASE, the IF() function and its NULL trap, replacing NULLs with IFNULL and COALESCE, safe division and blank handling with NULLIF, and using control flow in aggregates (pivot reports), ORDER BY and multi-rule UPDATE statements.",
  "objectives": [
    "Write searched and simple CASE expressions in the correct order",
    "Use IF() and avoid the NULL-condition trap",
    "Replace missing values with IFNULL and COALESCE and treat blanks with NULLIF",
    "Prevent division-by-zero problems with NULLIF",
    "Build pivot-style reports and multi-rule updates with CASE"
  ],
  "theory": [
    {
      "heading": "1. Why control-flow functions?",
      "content": "Control-flow functions let a query make decisions row by row: show 'Pass' or 'Fail', replace NULL with a default, translate codes into labels, or count only rows that meet a condition. They return a value, so you can use them anywhere an expression is allowed: SELECT, WHERE, ORDER BY, GROUP BY, HAVING, UPDATE SET and inside aggregates.",
      "points": [
        "CASE - the standard SQL, most flexible (many conditions).",
        "IF(condition, a, b) - MySQL shortcut for two outcomes.",
        "IFNULL(x, default) - MySQL; replace NULL with a default.",
        "COALESCE(a, b, c, ...) - standard; first non-NULL value from a list.",
        "NULLIF(a, b) - returns NULL when a = b, else a (mainly to avoid division by zero).",
        "Do not confuse the IF() FUNCTION with the IF ... THEN ... END IF STATEMENT used in stored procedures (Day 22)."
      ]
    },
    {
      "heading": "2. CASE expression (searched and simple)",
      "content": "A searched CASE tests conditions top to bottom and returns the result of the FIRST true condition. A simple CASE compares one expression with a list of values.",
      "syntax": "-- Searched CASE\nCASE\n  WHEN marks >= 90 THEN 'A+'\n  WHEN marks >= 75 THEN 'A'\n  WHEN marks >= 60 THEN 'B'\n  WHEN marks IS NULL THEN 'Absent'\n  ELSE 'C'\nEND AS grade\n\n-- Simple CASE\nCASE gender\n  WHEN 'M' THEN 'Male'\n  WHEN 'F' THEN 'Female'\n  ELSE 'Not specified'\nEND AS gender_text",
      "points": [
        "Order matters: put the most specific / highest condition first. If 'marks >= 60' were first, a 95 would get 'B'.",
        "Without ELSE, a row that matches nothing gets NULL.",
        "Simple CASE cannot test NULL (CASE x WHEN NULL never matches) - use searched CASE with IS NULL.",
        "All THEN results should have the same data type (text vs number).",
        "Always close with END (and give an alias)."
      ]
    },
    {
      "heading": "3. IF() function",
      "content": "IF(condition, value_if_true, value_if_false) is a compact two-way CASE.",
      "syntax": "IF(marks >= 40, 'Pass', 'Fail')\nIF(fees > 60000, fees * 0.9, fees)                 -- numbers too\nIF(marks IS NULL, 'Absent', IF(marks >= 40, 'Pass', 'Fail'))   -- nested",
      "points": [
        "If the condition is NULL (e.g. marks is NULL in marks >= 40), IF returns the FALSE value - a frequent bug: NULL marks become 'Fail'. Test IS NULL first.",
        "IF() is MySQL-specific; CASE works in every database. SQL Server's equivalent is IIF().",
        "Deeply nested IFs are hard to read - switch to CASE."
      ]
    },
    {
      "heading": "4. IFNULL and COALESCE",
      "content": "Both replace NULL. IFNULL takes exactly two arguments; COALESCE takes any number and returns the first non-NULL one.",
      "syntax": "IFNULL(marks, 0)                                 -- NULL -> 0\nIFNULL(city, 'Unknown')\nCOALESCE(mobile, landline, email, 'No contact')  -- first available contact\nCOALESCE(discount, 0) + price",
      "points": [
        "Use them in calculations: NULL + 100 = NULL, but IFNULL(bonus, 0) + 100 = 100.",
        "Empty string '' is NOT NULL, so COALESCE('', 'x') returns ''. Combine with NULLIF to treat '' as NULL: COALESCE(NULLIF(mobile, ''), landline).",
        "IFNULL(AVG(marks), 0) shows 0 for groups with no marks.",
        "ISNULL(x) in MySQL returns 1/0 (is x NULL?) - it is NOT the SQL Server ISNULL replacement function."
      ]
    },
    {
      "heading": "5. NULLIF",
      "content": "NULLIF(a, b) returns NULL if a equals b, otherwise it returns a. Its classic use is safe division: dividing by NULL gives NULL instead of a division-by-zero problem.",
      "syntax": "NULLIF(10, 10)        -- NULL\nNULLIF(10, 5)         -- 10\npassed * 100 / NULLIF(attempted, 0)          -- NULL instead of error/warning when attempted = 0\nIFNULL(passed * 100 / NULLIF(attempted, 0), 0)  -- and then 0 for display\nNULLIF(TRIM(mobile), '')                     -- treat blank text as NULL",
      "points": [
        "MySQL returns NULL with a warning for x / 0 in default mode, but with ERROR_FOR_DIVISION_BY_ZERO in strict mode an INSERT/UPDATE can fail - NULLIF prevents both.",
        "Other databases (SQL Server, PostgreSQL) raise an error on division by zero, so NULLIF is a portable habit."
      ]
    },
    {
      "heading": "6. Control flow inside aggregates, ORDER BY and UPDATE",
      "content": "Combining CASE/IF with aggregates gives 'conditional aggregation', the standard way to build pivot-style reports in MySQL (which has no PIVOT keyword).",
      "syntax": "SELECT dept_id,\n       COUNT(*)                                   AS total,\n       SUM(CASE WHEN gender = 'F' THEN 1 ELSE 0 END) AS female,\n       SUM(IF(gender = 'M', 1, 0))                AS male,\n       COUNT(CASE WHEN marks >= 80 THEN 1 END)    AS above_80   -- no ELSE -> NULL -> not counted\nFROM students GROUP BY dept_id;\n\nORDER BY CASE city WHEN 'Pune' THEN 1 WHEN 'Mumbai' THEN 2 ELSE 3 END;\n\nUPDATE students\nSET fees = CASE WHEN marks >= 90 THEN fees - 10000\n                WHEN marks >= 80 THEN fees - 5000\n                ELSE fees END\nWHERE student_id > 0;",
      "points": [
        "SUM(condition) also works in MySQL because a true condition is 1: SUM(gender = 'F').",
        "One UPDATE with CASE is safer than several UPDATEs that could overlap.",
        "Always include ELSE <column> in an UPDATE CASE, otherwise non-matching rows are set to NULL!"
      ],
      "tip": "Lab note: the browser Lab shows IF() results correctly; just give every expression an alias so the column header is readable."
    }
  ],
  "examples": [
    {
      "title": "Grades with a searched CASE and labels with a simple CASE",
      "scenario": "Produce a grade for every student (A+ >= 90, A >= 75, B >= 60, C otherwise, Absent when marks are missing) and show gender as text.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Check Vikram: his NULL marks produce 'Absent' because the IS NULL test comes before ELSE"
      ],
      "code": "SELECT first_name,\n       marks,\n       CASE\n         WHEN marks IS NULL THEN 'Absent'\n         WHEN marks >= 90   THEN 'A+'\n         WHEN marks >= 75   THEN 'A'\n         WHEN marks >= 60   THEN 'B'\n         ELSE 'C'\n       END AS grade,\n       CASE gender\n         WHEN 'M' THEN 'Male'\n         WHEN 'F' THEN 'Female'\n         ELSE 'Not specified'\n       END AS gender_text\nFROM students\nORDER BY marks DESC;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT first_name,\n       marks,\n       CASE\n         WHEN marks IS NULL THEN 'Absent'\n         WHEN marks >= 90   THEN 'A+'\n         WHEN marks >= 75   THEN 'A'\n         WHEN marks >= 60   THEN 'B'\n         ELSE 'C'\n       END AS grade,\n       CASE gender\n         WHEN 'M' THEN 'Male'\n         WHEN 'F' THEN 'Female'\n         ELSE 'Not specified'\n       END AS gender_text\nFROM students\nORDER BY marks DESC;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT first_name,\n+------------+-------+--------+-------------+\n| first_name | marks | grade  | gender_text |\n+------------+-------+--------+-------------+\n| Meera      | 95    | A+     | Female      |\n| Diya       | 92    | A+     | Female      |\n| Aarav      | 88    | A      | Male        |\n| Priya      | 85    | A      | Female      |\n| Ananya     | 81    | A      | Female      |\n| Rohan      | 75    | A      | Male        |\n| Arjun      | 70    | B      | Male        |\n| Kabir      | 64    | B      | Male        |\n| Sneha      | 58    | C      | Female      |\n| Vikram     | NULL  | Absent | Male        |\n+------------+-------+--------+-------------+\n10 row(s) returned",
      "explanation": "CASE stops at the first true WHEN, so 92 is caught by >= 90 before the >= 75 test. Sneha's 58 matches no WHEN and falls into ELSE 'C'. The simple CASE compares gender with each listed value. Vikram is listed last because NULL sorts last in DESC order."
    },
    {
      "title": "IF(): pass/fail, the NULL trap, and fee discount",
      "scenario": "Mark each student Pass (>= 60) or Fail, show the trap when marks are NULL, fix it with a nested IF, and calculate a 10% discount for fees above 60000.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Compare the result_wrong and result_ok columns for Vikram"
      ],
      "code": "SELECT first_name,\n       marks,\n       IF(marks >= 60, 'Pass', 'Fail')                              AS result_wrong,\n       IF(marks IS NULL, 'Absent', IF(marks >= 60, 'Pass', 'Fail')) AS result_ok,\n       fees,\n       IF(fees > 60000, fees * 90 / 100, fees)                      AS fees_after_discount\nFROM students\nWHERE student_id IN (1, 3, 7, 8);",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT first_name,\n       marks,\n       IF(marks >= 60, 'Pass', 'Fail')                              AS result_wrong,\n       IF(marks IS NULL, 'Absent', IF(marks >= 60, 'Pass', 'Fail')) AS result_ok,\n       fees,\n       IF(fees > 60000, fees * 90 / 100, fees)                      AS fees_after_discount\nFROM students\nWHERE student_id IN (1, 3, 7, 8);",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT first_name,\n+------------+-------+--------------+-----------+-------+---------------------+\n| first_name | marks | result_wrong | result_ok | fees  | fees_after_discount |\n+------------+-------+--------------+-----------+-------+---------------------+\n| Aarav      | 88    | Pass         | Pass      | 85000 | 76500.0             |\n| Rohan      | 75    | Pass         | Pass      | 60000 | 60000               |\n| Vikram     | NULL  | Fail         | Absent    | 50000 | 50000               |\n| Sneha      | 58    | Fail         | Fail      | 85000 | 76500.0             |\n+------------+-------+--------------+-----------+-------+---------------------+\n4 row(s) returned",
      "explanation": "For Vikram, marks >= 60 is NULL (unknown), and IF treats NULL as false, so result_wrong wrongly says 'Fail'. Testing IS NULL first gives 'Absent'. Aarav and Sneha pay more than 60000 so they get 10% off (76500); Rohan and Vikram keep their fees."
    },
    {
      "title": "IFNULL and COALESCE: defaults and the first available contact",
      "scenario": "For each guardian choose the best way to contact them: mobile, else landline, else email, else 'No contact'. Treat an empty mobile ('') as missing.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script (it creates the guardians table)",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Look at Sneha: her mobile is an empty string, not NULL"
      ],
      "code": "SELECT student_name,\n       IFNULL(mobile, '-')                                         AS mobile_shown,\n       COALESCE(mobile, landline, email, 'No contact')             AS contact_naive,\n       COALESCE(NULLIF(mobile, ''), landline, email, 'No contact') AS contact_ok,\n       IFNULL(tests_attempted, 0)                                  AS attempted\nFROM guardians;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS guardians;\nCREATE TABLE guardians (\n  guardian_id INT AUTO_INCREMENT PRIMARY KEY,\n  student_name VARCHAR(30) NOT NULL,\n  mobile VARCHAR(15),\n  landline VARCHAR(15),\n  email VARCHAR(60),\n  tests_attempted INT,\n  tests_passed INT\n);\nINSERT INTO guardians (student_name, mobile, landline, email, tests_attempted, tests_passed) VALUES\n('Aarav',  '9822012345', NULL,         'sharma.family@mail.com', 5, 4),\n('Diya',   NULL,         '022-2456789', 'patel.home@mail.com',   4, 4),\n('Rohan',  NULL,         NULL,          'verma.r@mail.com',      0, 0),\n('Meera',  '9123456789', '0484-223344', NULL,                    6, 3),\n('Vikram', NULL,         NULL,          NULL,                    NULL, NULL),\n('Sneha',  '',           NULL,          'kulkarni@mail.com',     3, 1);\nSELECT student_name,\n       IFNULL(mobile, '-')                                         AS mobile_shown,\n       COALESCE(mobile, landline, email, 'No contact')             AS contact_naive,\n       COALESCE(NULLIF(mobile, ''), landline, email, 'No contact') AS contact_ok,\n       IFNULL(tests_attempted, 0)                                  AS attempted\nFROM guardians;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS guardians -> 0 row(s) affected\n>> CREATE TABLE guardians ( -> 0 row(s) affected\n>> INSERT INTO guardians (student_name, mobile, landline, email, tests_at -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> SELECT student_name,\n+--------------+--------------+------------------+-------------------+-----------+\n| student_name | mobile_shown | contact_naive    | contact_ok        | attempted |\n+--------------+--------------+------------------+-------------------+-----------+\n| Aarav        | 9822012345   | 9822012345       | 9822012345        | 5         |\n| Diya         | -            | 022-2456789      | 022-2456789       | 4         |\n| Rohan        | -            | verma.r@mail.com | verma.r@mail.com  | 0         |\n| Meera        | 9123456789   | 9123456789       | 9123456789        | 6         |\n| Vikram       | -            | No contact       | No contact        | 0         |\n| Sneha        |              |                  | kulkarni@mail.com | 3         |\n+--------------+--------------+------------------+-------------------+-----------+\n6 row(s) returned",
      "explanation": "COALESCE returns the first argument that is not NULL. Diya has no mobile so her landline is used; Rohan only has email; Vikram has nothing so the literal 'No contact' is returned. Sneha's mobile is '' (empty, not NULL), so the naive version returns an empty contact; NULLIF(mobile, '') converts '' to NULL first, so contact_ok correctly falls through to her email."
    },
    {
      "title": "NULLIF for safe division",
      "scenario": "Compute each student's pass percentage = tests_passed * 100 / tests_attempted. Rohan attempted 0 tests and Vikram has no data.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "In real MySQL, the unsafe column produces a warning for Rohan: 1365 Division by 0 (see the Output panel)"
      ],
      "code": "SELECT student_name,\n       tests_attempted,\n       tests_passed,\n       ROUND(tests_passed * 100.0 / tests_attempted, 1)          AS unsafe_pct,\n       ROUND(tests_passed * 100.0 / NULLIF(tests_attempted, 0), 1) AS safe_pct,\n       IFNULL(ROUND(tests_passed * 100.0 / NULLIF(tests_attempted, 0), 1), 0) AS display_pct\nFROM guardians;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS guardians;\nCREATE TABLE guardians (\n  guardian_id INT AUTO_INCREMENT PRIMARY KEY,\n  student_name VARCHAR(30) NOT NULL,\n  mobile VARCHAR(15),\n  landline VARCHAR(15),\n  email VARCHAR(60),\n  tests_attempted INT,\n  tests_passed INT\n);\nINSERT INTO guardians (student_name, mobile, landline, email, tests_attempted, tests_passed) VALUES\n('Aarav',  '9822012345', NULL,         'sharma.family@mail.com', 5, 4),\n('Diya',   NULL,         '022-2456789', 'patel.home@mail.com',   4, 4),\n('Rohan',  NULL,         NULL,          'verma.r@mail.com',      0, 0),\n('Meera',  '9123456789', '0484-223344', NULL,                    6, 3),\n('Vikram', NULL,         NULL,          NULL,                    NULL, NULL),\n('Sneha',  '',           NULL,          'kulkarni@mail.com',     3, 1);\nSELECT student_name,\n       tests_attempted,\n       tests_passed,\n       ROUND(tests_passed * 100.0 / tests_attempted, 1)          AS unsafe_pct,\n       ROUND(tests_passed * 100.0 / NULLIF(tests_attempted, 0), 1) AS safe_pct,\n       IFNULL(ROUND(tests_passed * 100.0 / NULLIF(tests_attempted, 0), 1), 0) AS display_pct\nFROM guardians;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS guardians -> 0 row(s) affected\n>> CREATE TABLE guardians ( -> 0 row(s) affected\n>> INSERT INTO guardians (student_name, mobile, landline, email, tests_at -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> SELECT student_name,\n+--------------+-----------------+--------------+------------+----------+-------------+\n| student_name | tests_attempted | tests_passed | unsafe_pct | safe_pct | display_pct |\n+--------------+-----------------+--------------+------------+----------+-------------+\n| Aarav        | 5               | 4            | 80.0       | 80.0     | 80.0        |\n| Diya         | 4               | 4            | 100.0      | 100.0    | 100.0       |\n| Rohan        | 0               | 0            | NULL       | NULL     | 0           |\n| Meera        | 6               | 3            | 50.0       | 50.0     | 50.0        |\n| Vikram       | NULL            | NULL         | NULL       | NULL     | 0           |\n| Sneha        | 3               | 1            | 33.3       | 33.3     | 33.3        |\n+--------------+-----------------+--------------+------------+----------+-------------+\n6 row(s) returned",
      "explanation": "NULLIF(tests_attempted, 0) turns 0 into NULL, and any number divided by NULL is NULL - no division by zero. IFNULL then shows 0 for display. MySQL returns NULL for x / 0 too, but with a warning, and in strict mode inside INSERT/UPDATE it can be an error; other databases always raise an error, so NULLIF is the portable habit."
    },
    {
      "title": "Conditional aggregation: a pivot report per department",
      "scenario": "One row per department with total students, girls, boys, students scoring 80+, and absent (NULL marks) students.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script"
      ],
      "code": "SELECT IFNULL(d.dept_name, 'No department')            AS department,\n       COUNT(*)                                        AS total,\n       SUM(CASE WHEN s.gender = 'F' THEN 1 ELSE 0 END) AS girls,\n       SUM(IF(s.gender = 'M', 1, 0))                   AS boys,\n       COUNT(CASE WHEN s.marks >= 80 THEN 1 END)       AS scored_80_plus,\n       SUM(CASE WHEN s.marks IS NULL THEN 1 ELSE 0 END) AS absent\nFROM students s\nLEFT JOIN departments d ON d.dept_id = s.dept_id\nGROUP BY d.dept_name\nORDER BY total DESC, department;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT IFNULL(d.dept_name, 'No department')            AS department,\n       COUNT(*)                                        AS total,\n       SUM(CASE WHEN s.gender = 'F' THEN 1 ELSE 0 END) AS girls,\n       SUM(IF(s.gender = 'M', 1, 0))                   AS boys,\n       COUNT(CASE WHEN s.marks >= 80 THEN 1 END)       AS scored_80_plus,\n       SUM(CASE WHEN s.marks IS NULL THEN 1 ELSE 0 END) AS absent\nFROM students s\nLEFT JOIN departments d ON d.dept_id = s.dept_id\nGROUP BY d.dept_name\nORDER BY total DESC, department;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT IFNULL(d.dept_name, 'No department')            AS department,\n+------------------+-------+-------+------+----------------+--------+\n| department       | total | girls | boys | scored_80_plus | absent |\n+------------------+-------+-------+------+----------------+--------+\n| Computer Science | 3     | 2     | 1    | 2              | 0      |\n| Commerce         | 2     | 1     | 1    | 1              | 0      |\n| Mathematics      | 2     | 1     | 1    | 1              | 0      |\n| Physics          | 2     | 1     | 1    | 1              | 0      |\n| No department    | 1     | 0     | 1    | 0              | 1      |\n+------------------+-------+-------+------+----------------+--------+\n5 row(s) returned",
      "explanation": "Each CASE/IF returns 1 or 0 per row, and SUM adds them up inside each group - turning rows into columns (a pivot). COUNT(CASE ... THEN 1 END) works because rows that do not match return NULL, which COUNT ignores. The LEFT JOIN keeps Vikram (no department), and IFNULL labels his group."
    },
    {
      "title": "CASE in ORDER BY and in UPDATE (scholarships)",
      "scenario": "Sort students with Pune first, then Mumbai, then everyone else; then apply a scholarship in ONE update: 10000 off for marks >= 90, 5000 off for 80-89, no change otherwise.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "In Workbench with Safe Updates on, the WHERE student_id > 0 keeps the UPDATE allowed"
      ],
      "code": "SELECT first_name, city\nFROM students\nORDER BY CASE city WHEN 'Pune' THEN 1 WHEN 'Mumbai' THEN 2 ELSE 3 END, first_name\nLIMIT 6;\n\nUPDATE students\nSET fees = CASE\n             WHEN marks >= 90 THEN fees - 10000\n             WHEN marks >= 80 THEN fees - 5000\n             ELSE fees\n           END\nWHERE student_id > 0;\n\nSELECT first_name, marks, fees FROM students WHERE marks >= 80 ORDER BY marks DESC;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT first_name, city\nFROM students\nORDER BY CASE city WHEN 'Pune' THEN 1 WHEN 'Mumbai' THEN 2 ELSE 3 END, first_name\nLIMIT 6;\nUPDATE students\nSET fees = CASE\n             WHEN marks >= 90 THEN fees - 10000\n             WHEN marks >= 80 THEN fees - 5000\n             ELSE fees\n           END\nWHERE student_id > 0;\nSELECT first_name, marks, fees FROM students WHERE marks >= 80 ORDER BY marks DESC;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT first_name, city\n+------------+---------+\n| first_name | city    |\n+------------+---------+\n| Aarav      | Pune    |\n| Vikram     | Pune    |\n| Diya       | Mumbai  |\n| Sneha      | Mumbai  |\n| Ananya     | Chennai |\n| Arjun      | NULL    |\n+------------+---------+\n6 row(s) returned\n>> UPDATE students -> 10 row(s) affected Rows matched: 10  Changed: 10  Warnings: 0\n>> SELECT first_name, marks, fees FROM students WHERE marks >= 80 ORDER B\n+------------+-------+-------+\n| first_name | marks | fees  |\n+------------+-------+-------+\n| Meera      | 95    | 50000 |\n| Diya       | 92    | 75000 |\n| Aarav      | 88    | 80000 |\n| Priya      | 85    | 50000 |\n| Ananya     | 81    | 60000 |\n+------------+-------+-------+\n5 row(s) returned",
      "explanation": "The CASE in ORDER BY creates a sort key 1/2/3, so Pune rows come first, then Mumbai, then the rest alphabetically. The single UPDATE applies different rules per row; ELSE fees keeps other rows unchanged (without ELSE they would be set to NULL!). Meera and Diya (90+) lose 10000, Aarav, Priya and Ananya (80-89) lose 5000."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between IFNULL and COALESCE?",
      "a": "IFNULL(a, b) takes exactly two arguments and is MySQL-specific. COALESCE(a, b, c, ...) is standard SQL, accepts many arguments and returns the first non-NULL.",
      "level": "Beginner"
    },
    {
      "q": "What does NULLIF do and when is it used?",
      "a": "NULLIF(a, b) returns NULL if a = b, otherwise a. It is used to avoid division by zero (x / NULLIF(y, 0)) and to convert sentinel values like '' to NULL.",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between a simple CASE and a searched CASE?",
      "a": "Simple CASE compares one expression with values (CASE gender WHEN 'M' THEN ...). Searched CASE evaluates independent boolean conditions (CASE WHEN marks >= 90 THEN ...). Only searched CASE can test ranges and IS NULL.",
      "level": "Beginner"
    },
    {
      "q": "What does CASE return if no WHEN matches and there is no ELSE?",
      "a": "NULL.",
      "level": "Beginner"
    },
    {
      "q": "What does IF(NULL > 5, 'yes', 'no') return?",
      "a": "'no'. The condition is NULL (unknown), which IF treats as false.",
      "level": "Intermediate"
    },
    {
      "q": "How do you build a pivot table in MySQL?",
      "a": "With conditional aggregation: SUM(CASE WHEN col = 'X' THEN value ELSE 0 END) AS X for each output column, grouped by the row dimension. MySQL has no PIVOT operator.",
      "level": "Intermediate"
    },
    {
      "q": "How do you update a column with different values based on conditions in one statement?",
      "a": "UPDATE t SET col = CASE WHEN cond1 THEN v1 WHEN cond2 THEN v2 ELSE col END WHERE ...; - the ELSE col is essential to keep other rows unchanged.",
      "level": "Intermediate"
    },
    {
      "q": "How do you sort rows in a custom order?",
      "a": "ORDER BY CASE col WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, or ORDER BY FIELD(col, 'High', 'Medium', 'Low').",
      "level": "Beginner"
    },
    {
      "q": "Is an empty string the same as NULL in MySQL?",
      "a": "No. '' is a known empty value; NULL is unknown/missing. IS NULL is false for ''. Use NULLIF(col, '') to treat blanks as NULL.",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between MySQL's IF() function and the IF statement?",
      "a": "IF() is a function returning a value inside a query. IF ... THEN ... ELSEIF ... END IF is a flow-control statement only allowed in stored programs (procedures, functions, triggers).",
      "level": "Beginner"
    },
    {
      "q": "Count students scoring above 80 and below 50 in one query.",
      "a": "SELECT SUM(marks > 80) AS above_80, SUM(marks < 50) AS below_50 FROM students; or COUNT(CASE WHEN ... THEN 1 END).",
      "level": "Intermediate"
    }
  ],
  "practice": [
    {
      "task": "Show each student's fee category: 'High' (> 70000), 'Medium' (55000-70000), 'Low' (below 55000).",
      "hint": "Searched CASE with BETWEEN or >=.",
      "solution": "SELECT first_name, fees,\n       CASE WHEN fees > 70000 THEN 'High'\n            WHEN fees >= 55000 THEN 'Medium'\n            ELSE 'Low' END AS fee_category\nFROM students;"
    },
    {
      "task": "Display city, replacing NULL with 'Not given', and dept_id replaced with 0 when NULL.",
      "hint": "IFNULL or COALESCE.",
      "solution": "SELECT first_name, COALESCE(city, 'Not given') AS city, IFNULL(dept_id, 0) AS dept_id\nFROM students;"
    },
    {
      "task": "Per admission year, count students with marks >= 75 ('good') and the rest ('others'), ignoring NULL marks.",
      "hint": "GROUP BY YEAR(admission_date) with SUM(CASE ...).",
      "solution": "SELECT YEAR(admission_date) AS yr,\n       SUM(CASE WHEN marks >= 75 THEN 1 ELSE 0 END) AS good,\n       SUM(CASE WHEN marks < 75 THEN 1 ELSE 0 END)  AS others\nFROM students\nGROUP BY YEAR(admission_date)\nORDER BY yr;"
    },
    {
      "task": "Compute average marks per department, showing 0 instead of NULL for a department with no marks, using LEFT JOIN from departments.",
      "hint": "IFNULL(ROUND(AVG(s.marks),1), 0).",
      "solution": "SELECT d.dept_name, IFNULL(ROUND(AVG(s.marks), 1), 0) AS avg_marks\nFROM departments d\nLEFT JOIN students s ON s.dept_id = d.dept_id\nGROUP BY d.dept_name;"
    },
    {
      "task": "Increase marks by 5 for students below 60 and by 2 for students 60-69, in a single UPDATE (cap at 100).",
      "hint": "CASE with ELSE marks; LEAST(...,100).",
      "solution": "UPDATE students\nSET marks = CASE WHEN marks < 60 THEN LEAST(marks + 5, 100)\n                 WHEN marks < 70 THEN LEAST(marks + 2, 100)\n                 ELSE marks END\nWHERE student_id > 0;"
    }
  ],
  "quiz": [
    {
      "question": "COALESCE(NULL, NULL, 'x', 'y') returns:",
      "options": [
        "NULL",
        "y",
        "Error",
        "x"
      ],
      "answer": 3,
      "explanation": "COALESCE returns the first non-NULL argument."
    },
    {
      "question": "NULLIF(5, 5) returns:",
      "options": [
        "5",
        "NULL",
        "0",
        "1"
      ],
      "answer": 1,
      "explanation": "Equal arguments -> NULL."
    },
    {
      "question": "What is wrong with: UPDATE t SET bonus = CASE WHEN grade = 'A' THEN 500 END;",
      "options": [
        "Rows with other grades get bonus NULL",
        "Syntax error",
        "Only the first row is updated",
        "Nothing, it is correct"
      ],
      "answer": 0,
      "explanation": "Without ELSE bonus, non-matching rows receive NULL."
    },
    {
      "question": "IF(marks >= 40, 'Pass', 'Fail') for a row with marks NULL returns:",
      "options": [
        "Pass",
        "NULL",
        "Fail",
        "Error"
      ],
      "answer": 2,
      "explanation": "A NULL condition is treated as false."
    },
    {
      "question": "Which expression counts only female students inside GROUP BY?",
      "options": [
        "COUNT(gender = 'F')",
        "SUM(CASE WHEN gender = 'F' THEN 1 ELSE 0 END)",
        "COUNT(*) WHERE gender = 'F'",
        "IF(COUNT(gender) = 'F')"
      ],
      "answer": 1,
      "explanation": "COUNT(gender = 'F') counts non-NULL results (true AND false), so it is wrong; SUM(CASE ...) or SUM(gender = 'F') is correct."
    }
  ]
};
