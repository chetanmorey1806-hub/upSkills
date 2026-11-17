export default {
  "id": "mysql-day-13",
  "title": "Aggregate Functions, GROUP BY, HAVING, GROUP_CONCAT and WITH ROLLUP",
  "module": "Module 3: Functions & Grouping",
  "day": 13,
  "level": "Intermediate",
  "duration": "2.5 hours",
  "summary": "Summarise data with COUNT, SUM, AVG, MIN and MAX, split it into groups with GROUP BY (single and multiple columns), filter groups with HAVING, understand WHERE vs HAVING and ONLY_FULL_GROUP_BY, list group members with GROUP_CONCAT and add subtotals and grand totals with WITH ROLLUP.",
  "objectives": [
    "Use aggregate functions correctly, including their NULL behaviour",
    "Group rows by one or more columns and follow the ONLY_FULL_GROUP_BY rule",
    "Choose between WHERE and HAVING and know the logical order of a query",
    "Build list columns with GROUP_CONCAT",
    "Produce subtotals and grand totals with WITH ROLLUP or UNION ALL"
  ],
  "theory": [
    {
      "heading": "1. Aggregate functions: many rows -> one value",
      "content": "An aggregate function reads a set of rows and returns ONE summary value. Without GROUP BY, the whole table (after WHERE) is one group, so the query returns exactly one row.",
      "syntax": "SELECT COUNT(*)              AS total_rows,       -- counts rows (NULLs included)\n       COUNT(marks)          AS with_marks,       -- counts non-NULL values\n       COUNT(DISTINCT city)  AS cities,           -- counts different non-NULL values\n       SUM(fees)             AS total_fees,\n       AVG(marks)            AS avg_marks,        -- ignores NULLs\n       MIN(marks)            AS lowest,\n       MAX(dob)              AS youngest_dob      -- MIN/MAX work on dates and text too\nFROM students;",
      "points": [
        "All aggregates except COUNT(*) IGNORE NULL values. AVG(marks) divides by the number of non-NULL marks, not by all rows.",
        "On an empty set COUNT returns 0 while SUM/AVG/MIN/MAX return NULL - wrap with IFNULL(SUM(x), 0) if you need 0.",
        "AVG of an INT column returns a DECIMAL with 4 decimals (78.6667); use ROUND(AVG(marks), 2).",
        "Other aggregates: GROUP_CONCAT, STD/STDDEV, VARIANCE, BIT_AND, JSON_ARRAYAGG.",
        "You cannot mix an aggregate with a plain column without GROUP BY (SELECT city, COUNT(*) FROM students; -> Error 1140 when ONLY_FULL_GROUP_BY is on)."
      ]
    },
    {
      "heading": "2. GROUP BY: one summary row per group",
      "content": "GROUP BY splits rows into groups that share the same value(s) and calculates the aggregates separately for each group.",
      "syntax": "SELECT dept_id, COUNT(*) AS students, ROUND(AVG(marks), 1) AS avg_marks\nFROM students\nGROUP BY dept_id;\n\nSELECT city, gender, COUNT(*) FROM students GROUP BY city, gender;   -- groups on 2 columns",
      "points": [
        "Rule (ONLY_FULL_GROUP_BY, default in MySQL 8): every column in SELECT must be either in GROUP BY or inside an aggregate function. Otherwise Error 1055: Expression #1 of SELECT list is not in GROUP BY clause...",
        "NULL values form their own group (all NULL cities together).",
        "GROUP BY can use expressions (GROUP BY YEAR(admission_date)) and, in MySQL, column aliases.",
        "MySQL 8 does not sort by GROUP BY automatically - add ORDER BY.",
        "Grouping by a primary key and selecting other columns of that table is allowed (functional dependency)."
      ]
    },
    {
      "heading": "3. HAVING: filtering groups",
      "content": "WHERE filters ROWS before grouping; HAVING filters GROUPS after aggregation. Conditions on aggregates (COUNT(*) > 2, AVG(marks) >= 80) must go in HAVING.",
      "syntax": "SELECT dept_id, COUNT(*) AS students, AVG(marks) AS avg_marks\nFROM students\nWHERE admission_date >= '2022-01-01'     -- 1. filter rows\nGROUP BY dept_id                         -- 2. make groups\nHAVING COUNT(*) >= 2                     -- 3. filter groups\nORDER BY avg_marks DESC;                 -- 4. sort",
      "points": [
        "Logical order of a query: FROM -> WHERE -> GROUP BY -> aggregates -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT.",
        "Put non-aggregate conditions in WHERE whenever possible: fewer rows to group means a faster query.",
        "WHERE AVG(marks) > 80 is an error (Error 1111: Invalid use of group function).",
        "MySQL lets HAVING use SELECT aliases (HAVING avg_marks > 80); standard SQL requires repeating the expression."
      ]
    },
    {
      "heading": "4. GROUP_CONCAT: list values of a group in one cell",
      "content": "GROUP_CONCAT joins the values of each group into one comma-separated string - a MySQL favourite for reports.",
      "syntax": "SELECT dept_id,\n       GROUP_CONCAT(first_name ORDER BY first_name SEPARATOR ', ') AS students,\n       GROUP_CONCAT(DISTINCT city) AS cities\nFROM students\nGROUP BY dept_id;",
      "points": [
        "Optional parts: DISTINCT, ORDER BY inside the function, SEPARATOR (default ',').",
        "NULL values are skipped.",
        "The result is truncated at group_concat_max_len (default 1024 bytes) with a warning - raise it with SET SESSION group_concat_max_len = 100000;",
        "SQL Server/PostgreSQL equivalent: STRING_AGG."
      ]
    },
    {
      "heading": "5. WITH ROLLUP: subtotals and grand totals (concept)",
      "content": "Adding WITH ROLLUP to GROUP BY makes MySQL add extra summary rows: a subtotal for each higher-level group and a grand total, shown with NULL in the rolled-up column.",
      "syntax": "SELECT category, SUM(qty * unit_price) AS sales\nFROM order_items oi JOIN products p ON p.product_id = oi.product_id\nGROUP BY category WITH ROLLUP;\n-- last row: category = NULL, sales = grand total\n\nSELECT IF(GROUPING(category), 'ALL CATEGORIES', category) AS category,\n       SUM(qty * unit_price) AS sales\nFROM order_items oi JOIN products p ON p.product_id = oi.product_id\nGROUP BY category WITH ROLLUP;      -- GROUPING() is MySQL 8.0+",
      "points": [
        "With two columns, GROUP BY a, b WITH ROLLUP gives detail rows, a subtotal per a, and a grand total.",
        "GROUPING(col) returns 1 on rows produced by ROLLUP, so you can label them instead of showing NULL.",
        "Before MySQL 8.0.12 ORDER BY could not be combined with ROLLUP; now it can.",
        "Same idea without ROLLUP: UNION ALL a detail query with a total query (works in every database and in the Workbench Lab)."
      ]
    },
    {
      "heading": "6. Common mistakes",
      "content": "Most GROUP BY bugs come from a few patterns.",
      "points": [
        "Counting the wrong thing: COUNT(marks) skips NULL marks; COUNT(*) counts rows.",
        "Averages of averages: the average of department averages is not the overall average when groups have different sizes.",
        "JOIN before aggregate duplicates rows: SUM(o.amount) after joining order_items counts each order once per item - aggregate in a subquery first.",
        "Selecting a non-grouped column (Error 1055) - add it to GROUP BY or wrap it in MIN/MAX/ANY_VALUE().",
        "Using WHERE instead of HAVING for aggregate conditions (Error 1111)."
      ],
      "tip": "In the Workbench Result Grid you can quickly check a GROUP BY: right-click a column > Copy Field, or sort by clicking the header - but put ORDER BY in the query for reliable output."
    }
  ],
  "examples": [
    {
      "title": "Summary statistics for the whole table",
      "scenario": "The principal wants one line: number of students, how many have marks, how many cities, total fees, average/min/max marks.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Only one row comes back because there is no GROUP BY"
      ],
      "code": "SELECT COUNT(*)              AS total_students,\n       COUNT(marks)          AS with_marks,\n       COUNT(DISTINCT city)  AS cities,\n       SUM(fees)             AS total_fees,\n       ROUND(AVG(marks), 2)  AS avg_marks,\n       MIN(marks)            AS min_marks,\n       MAX(marks)            AS max_marks,\n       MIN(dob)              AS oldest_dob\nFROM students;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT COUNT(*)              AS total_students,\n       COUNT(marks)          AS with_marks,\n       COUNT(DISTINCT city)  AS cities,\n       SUM(fees)             AS total_fees,\n       ROUND(AVG(marks), 2)  AS avg_marks,\n       MIN(marks)            AS min_marks,\n       MAX(marks)            AS max_marks,\n       MIN(dob)              AS oldest_dob\nFROM students;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT COUNT(*)              AS total_students,\n+----------------+------------+--------+------------+-----------+-----------+-----------+------------+\n| total_students | with_marks | cities | total_fees | avg_marks | min_marks | max_marks | oldest_dob |\n+----------------+------------+--------+------------+-----------+-----------+-----------+------------+\n| 10             | 9          | 6      | 665000     | 78.67     | 58        | 95        | 2003-06-14 |\n+----------------+------------+--------+------------+-----------+-----------+-----------+------------+\n1 row(s) returned",
      "explanation": "There are 10 students but only 9 marks (Vikram's is NULL), so COUNT(marks) = 9 and AVG divides 708 by 9 = 78.67. COUNT(DISTINCT city) = 6 (Pune, Mumbai, Delhi, Chennai, Kochi, Kolkata) because repeated cities are counted once and Arjun's NULL city is not counted. MIN works on dates too: the oldest date of birth."
    },
    {
      "title": "GROUP BY department with a JOIN",
      "scenario": "Show, for every department that has students, the number of students, average marks, highest marks and total fees, best average first.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script"
      ],
      "code": "SELECT d.dept_name,\n       COUNT(*)              AS students,\n       ROUND(AVG(s.marks), 1) AS avg_marks,\n       MAX(s.marks)          AS top_marks,\n       SUM(s.fees)           AS total_fees\nFROM students s\nJOIN departments d ON d.dept_id = s.dept_id\nGROUP BY d.dept_name\nORDER BY avg_marks DESC;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT d.dept_name,\n       COUNT(*)              AS students,\n       ROUND(AVG(s.marks), 1) AS avg_marks,\n       MAX(s.marks)          AS top_marks,\n       SUM(s.fees)           AS total_fees\nFROM students s\nJOIN departments d ON d.dept_id = s.dept_id\nGROUP BY d.dept_name\nORDER BY avg_marks DESC;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT d.dept_name,\n+------------------+----------+-----------+-----------+------------+\n| dept_name        | students | avg_marks | top_marks | total_fees |\n+------------------+----------+-----------+-----------+------------+\n| Mathematics      | 2        | 85.0      | 95        | 120000     |\n| Computer Science | 3        | 79.3      | 92        | 255000     |\n| Physics          | 2        | 75.5      | 81        | 130000     |\n| Commerce         | 2        | 74.5      | 85        | 110000     |\n+------------------+----------+-----------+-----------+------------+\n4 row(s) returned",
      "explanation": "Rows are first joined, then grouped by department name, so each department becomes one line. Mathematics has the best average (85.0 from 75 and 95). Vikram (no department) disappears because of the inner join, and History has no students so it does not appear either (a LEFT JOIN from departments would show it with 0 - Day 16)."
    },
    {
      "title": "WHERE vs HAVING together",
      "scenario": "Among students admitted from 2022 onwards, find the cities that have at least 2 such students, with the average marks of those students.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Try moving COUNT(*) >= 2 into WHERE - Workbench shows Error Code: 1111. Invalid use of group function"
      ],
      "code": "SELECT city,\n       COUNT(*)               AS students,\n       ROUND(AVG(marks), 1)   AS avg_marks\nFROM students\nWHERE admission_date >= '2022-01-01'     -- row filter\nGROUP BY city\nHAVING COUNT(*) >= 2                     -- group filter\nORDER BY students DESC, city;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT city,\n       COUNT(*)               AS students,\n       ROUND(AVG(marks), 1)   AS avg_marks\nFROM students\nWHERE admission_date >= '2022-01-01'\nGROUP BY city\nHAVING COUNT(*) >= 2\nORDER BY students DESC, city;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT city,\n+------+----------+-----------+\n| city | students | avg_marks |\n+------+----------+-----------+\n| Pune | 2        | 88.0      |\n+------+----------+-----------+\n1 row(s) returned",
      "explanation": "WHERE first keeps the 7 students admitted in 2022 or 2023 (Diya, Kabir and Arjun from 2021 are removed). GROUP BY city then builds the groups Pune (Aarav, Vikram), Delhi (Rohan), Chennai, Kochi, Mumbai (only Sneha - Diya was filtered out) and Kolkata. HAVING keeps only groups with 2 or more students, so just Pune remains. Pune's average is 88.0 because Vikram's NULL marks are ignored by AVG."
    },
    {
      "title": "GROUP BY two columns and GROUP_CONCAT",
      "scenario": "For each department and gender, show the count and the names of the students in one cell; also list each department's cities without duplicates.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type both queries",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Widen the GROUP_CONCAT column in the Result Grid or hover a cell to read the full list"
      ],
      "code": "SELECT dept_id, gender, COUNT(*) AS cnt,\n       GROUP_CONCAT(first_name ORDER BY first_name SEPARATOR ', ') AS names\nFROM students\nWHERE dept_id IS NOT NULL\nGROUP BY dept_id, gender\nORDER BY dept_id, gender;\n\nSELECT d.dept_name,\n       GROUP_CONCAT(DISTINCT s.city) AS cities\nFROM departments d\nJOIN students s ON s.dept_id = d.dept_id\nGROUP BY d.dept_name\nORDER BY d.dept_name;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT dept_id, gender, COUNT(*) AS cnt,\n       GROUP_CONCAT(first_name ORDER BY first_name SEPARATOR ', ') AS names\nFROM students\nWHERE dept_id IS NOT NULL\nGROUP BY dept_id, gender\nORDER BY dept_id, gender;\nSELECT d.dept_name,\n       GROUP_CONCAT(DISTINCT s.city) AS cities\nFROM departments d\nJOIN students s ON s.dept_id = d.dept_id\nGROUP BY d.dept_name\nORDER BY d.dept_name;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT dept_id, gender, COUNT(*) AS cnt,\n+---------+--------+-----+-------------+\n| dept_id | gender | cnt | names       |\n+---------+--------+-----+-------------+\n| 1       | F      | 2   | Diya, Sneha |\n| 1       | M      | 1   | Aarav       |\n| 2       | F      | 1   | Meera       |\n| 2       | M      | 1   | Rohan       |\n| 3       | F      | 1   | Ananya      |\n| 3       | M      | 1   | Arjun       |\n| 4       | F      | 1   | Priya       |\n| 4       | M      | 1   | Kabir       |\n+---------+--------+-----+-------------+\n8 row(s) returned\n>> SELECT d.dept_name,\n+------------------+---------------+\n| dept_name        | cities        |\n+------------------+---------------+\n| Commerce         | Delhi,Kolkata |\n| Computer Science | Pune,Mumbai   |\n| Mathematics      | Delhi,Kochi   |\n| Physics          | Chennai       |\n+------------------+---------------+\n4 row(s) returned",
      "explanation": "Grouping by (dept_id, gender) gives one row per combination that exists. GROUP_CONCAT lists names alphabetically, separated by ', '. In the second query DISTINCT removes repeated cities (Computer Science has two Mumbai students but shows Mumbai once) and NULL cities are skipped (Arjun in Physics). Full syntax in MySQL: GROUP_CONCAT(DISTINCT s.city ORDER BY s.city SEPARATOR ' / ') - DISTINCT, ORDER BY and SEPARATOR can all be combined in real MySQL (the browser Lab accepts DISTINCT only with a single argument)."
    },
    {
      "title": "Sales by category with a grand total (ROLLUP and its UNION ALL equivalent)",
      "scenario": "In the ecommerce database, show sales value by product category for non-cancelled orders, with a grand total row. In real MySQL use WITH ROLLUP; the lab script shows the equivalent UNION ALL version.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Double-click the ecommerce schema to make it default",
        "Type the ROLLUP query and run it with Ctrl+Enter in MySQL Workbench (the last row has NULL category = grand total)",
        "Run the UNION ALL version - it gives the same numbers and works in every database"
      ],
      "code": "-- MySQL 8 with ROLLUP\nSELECT IF(GROUPING(p.category), 'GRAND TOTAL', p.category) AS category,\n       SUM(oi.qty)                AS units,\n       SUM(oi.qty * oi.unit_price) AS sales\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nJOIN orders o   ON o.order_id = oi.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY p.category WITH ROLLUP;\n\n-- Portable version\nSELECT p.category, SUM(oi.qty) AS units, SUM(oi.qty * oi.unit_price) AS sales\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nJOIN orders o   ON o.order_id = oi.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY p.category\nUNION ALL\nSELECT 'GRAND TOTAL', SUM(oi.qty), SUM(oi.qty * oi.unit_price)\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id\nWHERE o.status <> 'CANCELLED';",
      "mysql": "CREATE DATABASE IF NOT EXISTS ecommerce;\nUSE ecommerce;\nDROP TABLE IF EXISTS payments;\nDROP TABLE IF EXISTS order_items;\nDROP TABLE IF EXISTS orders;\nDROP TABLE IF EXISTS products;\nDROP TABLE IF EXISTS customers;\nCREATE TABLE customers (\n  customer_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(60) NOT NULL,\n  city VARCHAR(40),\n  email VARCHAR(80) UNIQUE,\n  signup_date DATE\n);\nCREATE TABLE products (\n  product_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(80) NOT NULL,\n  category VARCHAR(40),\n  price DECIMAL(10,2) NOT NULL CHECK (price > 0),\n  stock INT DEFAULT 0\n);\nCREATE TABLE orders (\n  order_id INT AUTO_INCREMENT PRIMARY KEY,\n  customer_id INT NOT NULL,\n  order_date DATE NOT NULL,\n  status ENUM('PLACED','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PLACED',\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);\nCREATE TABLE order_items (\n  item_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  product_id INT NOT NULL,\n  qty INT NOT NULL CHECK (qty > 0),\n  unit_price DECIMAL(10,2) NOT NULL,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nCREATE TABLE payments (\n  payment_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  amount DECIMAL(10,2) NOT NULL,\n  method ENUM('UPI','CARD','COD','NETBANKING'),\n  paid_on DATE,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id)\n);\nINSERT INTO customers (name, city, email, signup_date) VALUES\n ('Rahul Khanna','Mumbai','rahul@mail.com','2024-01-10'),\n ('Neha Gupta','Delhi','neha@mail.com','2024-02-15'),\n ('Amit Shah','Pune','amit@mail.com','2024-03-05'),\n ('Pooja Reddy','Hyderabad','pooja@mail.com','2024-03-20'),\n ('Karan Malhotra','Delhi','karan@mail.com','2024-04-01'),\n ('Isha Kapoor','Mumbai','isha@mail.com','2024-05-12');\nINSERT INTO products (name, category, price, stock) VALUES\n ('Laptop Pro 14','Electronics',75000.00,15),('Wireless Mouse','Electronics',800.00,200),\n ('Office Chair','Furniture',6500.00,40),('Study Table','Furniture',9000.00,25),\n ('Running Shoes','Fashion',3500.00,60),('Cotton T-Shirt','Fashion',600.00,150),\n ('Bluetooth Speaker','Electronics',2500.00,0);\nINSERT INTO orders (customer_id, order_date, status) VALUES\n (1,'2024-06-01','DELIVERED'),(2,'2024-06-03','DELIVERED'),(1,'2024-06-10','SHIPPED'),\n (3,'2024-06-15','DELIVERED'),(4,'2024-06-20','CANCELLED'),(2,'2024-07-02','DELIVERED'),\n (5,'2024-07-05','PLACED'),(3,'2024-07-18','DELIVERED');\nINSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES\n (1,1,1,75000.00),(1,2,2,800.00),(2,3,1,6500.00),(2,6,3,600.00),\n (3,5,1,3500.00),(4,4,1,9000.00),(4,3,2,6500.00),(5,7,1,2500.00),\n (6,1,1,75000.00),(6,5,2,3500.00),(7,6,4,600.00),(8,2,1,800.00),(8,6,2,600.00);\nINSERT INTO payments (order_id, amount, method, paid_on) VALUES\n (1,76600.00,'CARD','2024-06-01'),(2,8300.00,'UPI','2024-06-03'),\n (3,3500.00,'UPI','2024-06-10'),(4,22000.00,'NETBANKING','2024-06-15'),\n (6,82000.00,'CARD','2024-07-02'),(8,2000.00,'COD','2024-07-20');\nSELECT p.category, SUM(oi.qty) AS units, SUM(oi.qty * oi.unit_price) AS sales\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nJOIN orders o   ON o.order_id = oi.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY p.category\nUNION ALL\nSELECT 'GRAND TOTAL', SUM(oi.qty), SUM(oi.qty * oi.unit_price)\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id\nWHERE o.status <> 'CANCELLED';",
      "result": ">> CREATE DATABASE IF NOT EXISTS ecommerce -> 1 row(s) affected\n>> USE ecommerce -> 0 row(s) affected\n>> DROP TABLE IF EXISTS payments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS order_items -> 0 row(s) affected\n>> DROP TABLE IF EXISTS orders -> 0 row(s) affected\n>> DROP TABLE IF EXISTS products -> 0 row(s) affected\n>> DROP TABLE IF EXISTS customers -> 0 row(s) affected\n>> CREATE TABLE customers ( -> 0 row(s) affected\n>> CREATE TABLE products ( -> 0 row(s) affected\n>> CREATE TABLE orders ( -> 0 row(s) affected\n>> CREATE TABLE order_items ( -> 0 row(s) affected\n>> CREATE TABLE payments ( -> 0 row(s) affected\n>> INSERT INTO customers (name, city, email, signup_date) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> INSERT INTO products (name, category, price, stock) VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO orders (customer_id, order_date, status) VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES -> 13 row(s) affected Records: 13  Duplicates: 0  Warnings: 0\n>> INSERT INTO payments (order_id, amount, method, paid_on) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> SELECT p.category, SUM(oi.qty) AS units, SUM(oi.qty * oi.unit_price) A\n+-------------+-------+--------+\n| category    | units | sales  |\n+-------------+-------+--------+\n| Electronics | 5     | 152400 |\n| Fashion     | 12    | 15900  |\n| Furniture   | 4     | 28500  |\n| GRAND TOTAL | 21    | 196800 |\n+-------------+-------+--------+\n4 row(s) returned",
      "explanation": "Order 5 (CANCELLED, the Bluetooth Speaker) is excluded by WHERE before grouping, so Electronics sales = 75000 + 1600 + 75000 + 800 = 152400. The extra GRAND TOTAL row is what WITH ROLLUP adds automatically (as category NULL, relabelled with GROUPING()). Categories in the ROLLUP output come in GROUP BY order with the total last."
    },
    {
      "title": "Customers who spent more than 10,000 (aggregate per customer)",
      "scenario": "Find customers whose total order value (excluding cancelled orders) is above 10,000, with number of orders and average order value.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Make ecommerce the default schema",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script"
      ],
      "code": "SELECT c.name,\n       COUNT(DISTINCT o.order_id)                        AS orders,\n       SUM(oi.qty * oi.unit_price)                       AS total_spent,\n       ROUND(SUM(oi.qty * oi.unit_price) / COUNT(DISTINCT o.order_id), 2) AS avg_order_value\nFROM customers c\nJOIN orders o       ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY c.customer_id, c.name\nHAVING SUM(oi.qty * oi.unit_price) > 10000\nORDER BY total_spent DESC;",
      "mysql": "CREATE DATABASE IF NOT EXISTS ecommerce;\nUSE ecommerce;\nDROP TABLE IF EXISTS payments;\nDROP TABLE IF EXISTS order_items;\nDROP TABLE IF EXISTS orders;\nDROP TABLE IF EXISTS products;\nDROP TABLE IF EXISTS customers;\nCREATE TABLE customers (\n  customer_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(60) NOT NULL,\n  city VARCHAR(40),\n  email VARCHAR(80) UNIQUE,\n  signup_date DATE\n);\nCREATE TABLE products (\n  product_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(80) NOT NULL,\n  category VARCHAR(40),\n  price DECIMAL(10,2) NOT NULL CHECK (price > 0),\n  stock INT DEFAULT 0\n);\nCREATE TABLE orders (\n  order_id INT AUTO_INCREMENT PRIMARY KEY,\n  customer_id INT NOT NULL,\n  order_date DATE NOT NULL,\n  status ENUM('PLACED','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PLACED',\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);\nCREATE TABLE order_items (\n  item_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  product_id INT NOT NULL,\n  qty INT NOT NULL CHECK (qty > 0),\n  unit_price DECIMAL(10,2) NOT NULL,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nCREATE TABLE payments (\n  payment_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  amount DECIMAL(10,2) NOT NULL,\n  method ENUM('UPI','CARD','COD','NETBANKING'),\n  paid_on DATE,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id)\n);\nINSERT INTO customers (name, city, email, signup_date) VALUES\n ('Rahul Khanna','Mumbai','rahul@mail.com','2024-01-10'),\n ('Neha Gupta','Delhi','neha@mail.com','2024-02-15'),\n ('Amit Shah','Pune','amit@mail.com','2024-03-05'),\n ('Pooja Reddy','Hyderabad','pooja@mail.com','2024-03-20'),\n ('Karan Malhotra','Delhi','karan@mail.com','2024-04-01'),\n ('Isha Kapoor','Mumbai','isha@mail.com','2024-05-12');\nINSERT INTO products (name, category, price, stock) VALUES\n ('Laptop Pro 14','Electronics',75000.00,15),('Wireless Mouse','Electronics',800.00,200),\n ('Office Chair','Furniture',6500.00,40),('Study Table','Furniture',9000.00,25),\n ('Running Shoes','Fashion',3500.00,60),('Cotton T-Shirt','Fashion',600.00,150),\n ('Bluetooth Speaker','Electronics',2500.00,0);\nINSERT INTO orders (customer_id, order_date, status) VALUES\n (1,'2024-06-01','DELIVERED'),(2,'2024-06-03','DELIVERED'),(1,'2024-06-10','SHIPPED'),\n (3,'2024-06-15','DELIVERED'),(4,'2024-06-20','CANCELLED'),(2,'2024-07-02','DELIVERED'),\n (5,'2024-07-05','PLACED'),(3,'2024-07-18','DELIVERED');\nINSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES\n (1,1,1,75000.00),(1,2,2,800.00),(2,3,1,6500.00),(2,6,3,600.00),\n (3,5,1,3500.00),(4,4,1,9000.00),(4,3,2,6500.00),(5,7,1,2500.00),\n (6,1,1,75000.00),(6,5,2,3500.00),(7,6,4,600.00),(8,2,1,800.00),(8,6,2,600.00);\nINSERT INTO payments (order_id, amount, method, paid_on) VALUES\n (1,76600.00,'CARD','2024-06-01'),(2,8300.00,'UPI','2024-06-03'),\n (3,3500.00,'UPI','2024-06-10'),(4,22000.00,'NETBANKING','2024-06-15'),\n (6,82000.00,'CARD','2024-07-02'),(8,2000.00,'COD','2024-07-20');\nSELECT c.name,\n       COUNT(DISTINCT o.order_id)                        AS orders,\n       SUM(oi.qty * oi.unit_price)                       AS total_spent,\n       ROUND(SUM(oi.qty * oi.unit_price) / COUNT(DISTINCT o.order_id), 2) AS avg_order_value\nFROM customers c\nJOIN orders o       ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY c.customer_id, c.name\nHAVING SUM(oi.qty * oi.unit_price) > 10000\nORDER BY total_spent DESC;",
      "result": ">> CREATE DATABASE IF NOT EXISTS ecommerce -> 1 row(s) affected\n>> USE ecommerce -> 0 row(s) affected\n>> DROP TABLE IF EXISTS payments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS order_items -> 0 row(s) affected\n>> DROP TABLE IF EXISTS orders -> 0 row(s) affected\n>> DROP TABLE IF EXISTS products -> 0 row(s) affected\n>> DROP TABLE IF EXISTS customers -> 0 row(s) affected\n>> CREATE TABLE customers ( -> 0 row(s) affected\n>> CREATE TABLE products ( -> 0 row(s) affected\n>> CREATE TABLE orders ( -> 0 row(s) affected\n>> CREATE TABLE order_items ( -> 0 row(s) affected\n>> CREATE TABLE payments ( -> 0 row(s) affected\n>> INSERT INTO customers (name, city, email, signup_date) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> INSERT INTO products (name, category, price, stock) VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO orders (customer_id, order_date, status) VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES -> 13 row(s) affected Records: 13  Duplicates: 0  Warnings: 0\n>> INSERT INTO payments (order_id, amount, method, paid_on) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> SELECT c.name,\n+--------------+--------+-------------+-----------------+\n| name         | orders | total_spent | avg_order_value |\n+--------------+--------+-------------+-----------------+\n| Neha Gupta   | 2      | 90300       | 45150.0         |\n| Rahul Khanna | 2      | 80100       | 40050.0         |\n| Amit Shah    | 2      | 24000       | 12000.0         |\n+--------------+--------+-------------+-----------------+\n3 row(s) returned",
      "explanation": "Joining order_items produces one row per item, so COUNT(*) would count items, not orders - COUNT(DISTINCT o.order_id) fixes this. The average order value is total / distinct orders. HAVING removes Karan (2400). Grouping by c.customer_id (the key) plus name is the safe pattern when two customers might share a name."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between COUNT(*), COUNT(col) and COUNT(DISTINCT col)?",
      "a": "COUNT(*) counts all rows; COUNT(col) counts rows where col is not NULL; COUNT(DISTINCT col) counts different non-NULL values.",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between WHERE and HAVING?",
      "a": "WHERE filters individual rows before grouping and cannot use aggregates. HAVING filters groups after GROUP BY and can use aggregates. Use WHERE for row conditions for better performance.",
      "level": "Beginner"
    },
    {
      "q": "How do aggregate functions treat NULL?",
      "a": "They ignore NULLs (except COUNT(*)). AVG divides by the number of non-NULL values. On an empty set SUM/AVG/MIN/MAX return NULL and COUNT returns 0.",
      "level": "Beginner"
    },
    {
      "q": "What is ONLY_FULL_GROUP_BY and Error 1055?",
      "a": "An SQL mode (default since MySQL 5.7) requiring that every selected column be in GROUP BY, be functionally dependent on it, or be inside an aggregate. Violations raise Error 1055. Fix by adding the column to GROUP BY or using ANY_VALUE()/MIN().",
      "level": "Intermediate"
    },
    {
      "q": "What does GROUP_CONCAT do and what is its limit?",
      "a": "It concatenates values of a group into one string with optional DISTINCT, ORDER BY and SEPARATOR. Output is limited by group_concat_max_len (1024 bytes by default).",
      "level": "Intermediate"
    },
    {
      "q": "What does WITH ROLLUP do?",
      "a": "Adds super-aggregate rows to GROUP BY results: subtotals for each level and a grand total; rolled-up columns show NULL, detectable with GROUPING().",
      "level": "Intermediate"
    },
    {
      "q": "Find the second highest marks using aggregates.",
      "a": "SELECT MAX(marks) FROM students WHERE marks < (SELECT MAX(marks) FROM students); or ORDER BY marks DESC LIMIT 1 OFFSET 1 with DISTINCT.",
      "level": "Intermediate"
    },
    {
      "q": "How do you find duplicate values in a column?",
      "a": "SELECT email, COUNT(*) FROM t GROUP BY email HAVING COUNT(*) > 1;",
      "level": "Beginner"
    },
    {
      "q": "Why can SUM give a wrong (too large) result after a JOIN?",
      "a": "A one-to-many join repeats the parent row for every child, so summing a parent column counts it multiple times. Aggregate the child table in a subquery first or use DISTINCT carefully.",
      "level": "Advanced"
    },
    {
      "q": "Can you use a column alias in HAVING and GROUP BY in MySQL?",
      "a": "Yes, MySQL allows aliases in GROUP BY, HAVING and ORDER BY (not in WHERE). Standard SQL only allows them in ORDER BY.",
      "level": "Beginner"
    },
    {
      "q": "What is the order of execution of a SELECT with GROUP BY?",
      "a": "FROM/JOIN -> WHERE -> GROUP BY -> aggregate -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT.",
      "level": "Beginner"
    }
  ],
  "practice": [
    {
      "task": "Count students per city (including a row for students with no city) sorted by count descending.",
      "hint": "GROUP BY city keeps NULL as its own group; use IFNULL for a label.",
      "solution": "SELECT IFNULL(city, '(no city)') AS city, COUNT(*) AS students\nFROM students\nGROUP BY city\nORDER BY students DESC, city;"
    },
    {
      "task": "Show the departments where the average fees is more than 60000 and list student names in each.",
      "hint": "JOIN departments, GROUP BY dept_name, HAVING AVG(fees) > 60000, GROUP_CONCAT.",
      "solution": "SELECT d.dept_name, AVG(s.fees) AS avg_fees,\n       GROUP_CONCAT(s.first_name ORDER BY s.first_name) AS students\nFROM students s JOIN departments d ON d.dept_id = s.dept_id\nGROUP BY d.dept_name\nHAVING AVG(s.fees) > 60000;"
    },
    {
      "task": "Number of admissions per year and gender.",
      "hint": "GROUP BY YEAR(admission_date), gender.",
      "solution": "SELECT YEAR(admission_date) AS yr, gender, COUNT(*) AS admissions\nFROM students\nGROUP BY YEAR(admission_date), gender\nORDER BY yr, gender;"
    },
    {
      "task": "(ecommerce) For each payment method, show number of payments, total amount and the largest payment; with a grand total using WITH ROLLUP.",
      "hint": "GROUP BY method WITH ROLLUP; label with GROUPING(method).",
      "solution": "SELECT IF(GROUPING(method), 'TOTAL', method) AS method,\n       COUNT(*) AS payments, SUM(amount) AS total, MAX(amount) AS biggest\nFROM payments\nGROUP BY method WITH ROLLUP;"
    },
    {
      "task": "(ecommerce) Find products that were ordered in more than one order.",
      "hint": "GROUP BY product, HAVING COUNT(DISTINCT order_id) > 1.",
      "solution": "SELECT p.name, COUNT(DISTINCT oi.order_id) AS orders\nFROM order_items oi JOIN products p ON p.product_id = oi.product_id\nGROUP BY p.product_id, p.name\nHAVING COUNT(DISTINCT oi.order_id) > 1\nORDER BY orders DESC;"
    }
  ],
  "quiz": [
    {
      "question": "A table has 10 rows; 3 have NULL in marks. What does COUNT(marks) return?",
      "options": [
        "10",
        "7",
        "3",
        "NULL"
      ],
      "answer": 1,
      "explanation": "COUNT(col) ignores NULLs."
    },
    {
      "question": "Which clause filters groups using aggregate values?",
      "options": [
        "WHERE",
        "HAVING",
        "ORDER BY",
        "LIMIT"
      ],
      "answer": 1,
      "explanation": "HAVING is evaluated after GROUP BY and may use aggregates."
    },
    {
      "question": "SELECT city, COUNT(*) FROM students; fails in MySQL 8 by default because:",
      "options": [
        "COUNT needs a column name",
        "city is not in GROUP BY (ONLY_FULL_GROUP_BY)",
        "students has no primary key",
        "COUNT cannot be used with SELECT"
      ],
      "answer": 1,
      "explanation": "Error 1140/1055: a non-aggregated column requires GROUP BY under ONLY_FULL_GROUP_BY."
    },
    {
      "question": "What does WITH ROLLUP add to GROUP BY category?",
      "options": [
        "A row per product",
        "A grand-total row with NULL category",
        "Sorting by category",
        "Removes NULL categories"
      ],
      "answer": 1,
      "explanation": "ROLLUP adds super-aggregate rows; with one grouping column that is a grand total."
    },
    {
      "question": "Default separator of GROUP_CONCAT is:",
      "options": [
        "a space",
        "a semicolon",
        "a comma",
        "a pipe |"
      ],
      "answer": 2,
      "explanation": "Default is ','; change it with SEPARATOR."
    }
  ]
};
