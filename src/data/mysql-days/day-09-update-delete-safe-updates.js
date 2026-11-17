export default {
  "id": "mysql-day-09",
  "title": "UPDATE and DELETE, Safe Updates Mode (Error 1175)",
  "module": "Module 2: CRUD Operations",
  "day": 9,
  "level": "Beginner",
  "duration": "2 hours",
  "summary": "Change and remove data correctly: UPDATE single and multiple columns, expressions on the old value, DELETE with WHERE, ORDER BY and LIMIT, updates driven by another table, foreign-key protection, transactions as a safety net, and MySQL Workbench Safe Updates mode - why Error 1175 appears and four ways to handle it.",
  "objectives": [
    "Write UPDATE statements that change one or many columns for exactly the right rows",
    "Delete rows safely with WHERE and understand foreign-key errors on delete",
    "Explain Workbench Safe Updates mode and fix Error 1175 in four ways",
    "Update or delete rows based on another table with subqueries or multi-table syntax",
    "Use preview SELECTs and transactions to undo mistakes"
  ],
  "theory": [
    {
      "heading": "1. UPDATE: changing existing rows",
      "content": "UPDATE changes values in rows that already exist. You name the table, give the new values with SET, and choose WHICH rows to change with WHERE. UPDATE never adds or removes rows; it only changes column values. Workbench shows the result in the Output panel as \"n row(s) affected Rows matched: n Changed: n Warnings: 0\".",
      "syntax": "UPDATE table_name\nSET column1 = value1,\n    column2 = expression\nWHERE condition;          -- which rows to change\n\n-- examples\nUPDATE students SET city = 'Bengaluru' WHERE student_id = 4;\nUPDATE students SET fees = fees + 5000, marks = marks + 2 WHERE dept_id = 2;",
      "points": [
        "SET can change one column or many columns separated by commas.",
        "The new value can be a constant ('Pune'), an expression (fees * 1.10, marks + 5), a function (UPPER(city)) or NULL.",
        "Expressions on the right side use the OLD value of the row: SET fees = fees + 5000 adds 5000 to each row's current fees.",
        "WITHOUT a WHERE clause every row in the table is updated. This is the number one beginner disaster.",
        "Rows matched = rows found by WHERE; Changed = rows whose value really changed (a row already holding the new value is matched but not changed)."
      ],
      "tip": "Golden rule: write the SELECT first. Run SELECT * FROM students WHERE <your condition>; check the rows, then change SELECT * FROM into UPDATE ... SET ... and keep the same WHERE."
    },
    {
      "heading": "2. DELETE: removing rows",
      "content": "DELETE removes whole rows from a table. Like UPDATE, the WHERE clause decides which rows are removed; without WHERE, all rows are deleted (the table itself stays, but it is empty).",
      "syntax": "DELETE FROM table_name\nWHERE condition;\n\nDELETE FROM students WHERE student_id = 7;          -- one row by primary key\nDELETE FROM students WHERE marks IS NULL;           -- many rows\nDELETE FROM students ORDER BY marks LIMIT 2;        -- MySQL extension: lowest 2",
      "points": [
        "DELETE removes complete rows. To blank out only one column use UPDATE ... SET col = NULL.",
        "DELETE is a DML command: it is logged row by row and can be rolled back inside a transaction.",
        "AUTO_INCREMENT does not go back after DELETE. If you delete id 10, the next insert gets 11.",
        "UPDATE and DELETE in MySQL also accept ORDER BY and LIMIT, useful to change \"the first N rows\" in a known order.",
        "Foreign keys protect related data: deleting a department that still has students fails with Error 1451 (Cannot delete or update a parent row) unless the FK is ON DELETE CASCADE / SET NULL."
      ]
    },
    {
      "heading": "3. Safe Updates mode in Workbench (Error 1175)",
      "content": "MySQL Workbench turns on the session variable sql_safe_updates by default. In this mode MySQL refuses an UPDATE or DELETE whose WHERE clause does not use a KEY column (primary key or indexed column) and that has no LIMIT. You will see: Error Code: 1175. You are using safe update mode and you tried to update a table without a WHERE that uses a KEY column. To disable safe mode, toggle the option in Preferences -> SQL Editor and reconnect.",
      "syntax": "-- Fails in Workbench (city is not a key column):\nUPDATE students SET fees = 70000 WHERE city = 'Delhi';\n-- Error Code: 1175. You are using safe update mode ...\n\n-- Fix 1 (best): filter on the primary key\nUPDATE students SET fees = 70000 WHERE student_id IN (3, 5);\n\n-- Fix 2: add a LIMIT\nUPDATE students SET fees = 70000 WHERE city = 'Delhi' LIMIT 10;\n\n-- Fix 3: switch it off for this session only, then back on\nSET SQL_SAFE_UPDATES = 0;\nUPDATE students SET fees = 70000 WHERE city = 'Delhi';\nSET SQL_SAFE_UPDATES = 1;",
      "points": [
        "Fix 4 (permanent): Edit > Preferences > SQL Editor > scroll to the bottom > untick \"Safe Updates (rejects UPDATEs and DELETEs with no restrictions)\" > OK. Then Query > Reconnect to Server (or close and reopen the connection tab) - the setting only applies to NEW connections.",
        "Safe mode is a Workbench (client) protection. The same UPDATE from the mysql command line client works unless you start it with --safe-updates.",
        "A WHERE on the primary key, on an indexed column, or a LIMIT clause all satisfy safe mode.",
        "WHERE 1=1 or WHERE student_id > 0 also passes the check (student_id is a key) - it is legal but defeats the purpose, so use it consciously.",
        "Keep safe mode ON in daily work; turn it off only for a planned bulk change."
      ],
      "tip": "Interviewers love this one: \"What is Error 1175 and how do you fix it?\" Answer: safe update mode; use a key in WHERE, add LIMIT, SET SQL_SAFE_UPDATES = 0 for the session, or untick it in Preferences and reconnect."
    },
    {
      "heading": "4. UPDATE and DELETE using other tables",
      "content": "Often the rows to change are decided by another table: \"increase fees of all students in the Mathematics department\". Two ways: a subquery in WHERE (works everywhere) or the MySQL multi-table UPDATE / DELETE with JOIN.",
      "syntax": "-- subquery form\nUPDATE students\nSET fees = fees + 2000\nWHERE dept_id = (SELECT dept_id FROM departments WHERE dept_name = 'Mathematics');\n\n-- MySQL JOIN form (multi-table UPDATE)\nUPDATE students s\nJOIN departments d ON s.dept_id = d.dept_id\nSET s.fees = s.fees + 2000\nWHERE d.dept_name = 'Mathematics';\n\n-- MySQL JOIN form of DELETE: name the table(s) to delete from after DELETE\nDELETE s\nFROM students s\nJOIN departments d ON s.dept_id = d.dept_id\nWHERE d.dept_name = 'History';",
      "points": [
        "In multi-table DELETE you must write which alias to delete from (DELETE s FROM ...), otherwise MySQL does not know which table loses rows.",
        "MySQL does not allow UPDATE t ... WHERE id IN (SELECT ... FROM t) on the SAME table (Error 1093). Wrap the subquery in a derived table: WHERE id IN (SELECT id FROM (SELECT ...) AS x).",
        "The in-app Workbench Lab supports the subquery form; practise the JOIN form in real MySQL Workbench."
      ]
    },
    {
      "heading": "5. Working safely: preview, transactions and verification",
      "content": "UPDATE and DELETE are permanent once committed. Workbench runs in autocommit mode by default, so each statement is saved immediately. Professionals protect themselves with a preview SELECT, a transaction, and a check afterwards.",
      "syntax": "-- 1. preview\nSELECT student_id, first_name, fees FROM students WHERE dept_id = 2;\n-- 2. change inside a transaction\nSTART TRANSACTION;\nUPDATE students SET fees = fees + 5000 WHERE dept_id = 2;\nSELECT student_id, first_name, fees FROM students WHERE dept_id = 2;   -- check\nROLLBACK;     -- undo   (or COMMIT; to keep)",
      "points": [
        "Workbench toolbar: the \"Toggle auto-commit mode\" button (two arrows icon) switches autocommit off; then Commit (tick icon) and Rollback (circle-cross icon) buttons become active.",
        "The Output panel's \"Message\" column shows Rows matched / Changed - compare it with the preview count.",
        "Never test UPDATE/DELETE first on production data; use a copy table (CREATE TABLE students_copy AS SELECT * FROM students).",
        "You can also edit a single cell in the Result Grid and click Apply - Workbench generates the UPDATE ... WHERE primary_key = ... statement for you and shows it before running."
      ]
    },
    {
      "heading": "6. DELETE vs TRUNCATE vs DROP (overview)",
      "content": "Three ways to \"remove\" data, with very different effects. Day 10 covers TRUNCATE and DROP in detail.",
      "points": [
        "DELETE FROM t WHERE ... - DML, removes selected (or all) rows, can be rolled back, fires DELETE triggers, keeps AUTO_INCREMENT counter.",
        "TRUNCATE TABLE t - DDL, removes ALL rows very fast, cannot be rolled back, resets AUTO_INCREMENT to 1, no triggers, not allowed if another table's FK points to it.",
        "DROP TABLE t - DDL, removes the table structure AND data completely."
      ]
    }
  ],
  "examples": [
    {
      "title": "Update one row using the primary key",
      "scenario": "Ananya (student_id 4) moved from Chennai to Bengaluru and her marks were re-evaluated to 84. Update both columns in one statement and verify.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Double-click the college schema in the Navigator so it is the default schema (bold)",
        "Type the SELECT first and run it with Ctrl+Enter to see the current row",
        "Type the UPDATE below it, place the cursor on it and press Ctrl+Enter (Execute current statement)",
        "Read the Output panel: 1 row(s) affected Rows matched: 1 Changed: 1 Warnings: 0",
        "Run the SELECT again to confirm the new values"
      ],
      "code": "SELECT student_id, first_name, city, marks FROM students WHERE student_id = 4;\n\nUPDATE students\nSET city = 'Bengaluru',\n    marks = 84\nWHERE student_id = 4;\n\nSELECT student_id, first_name, city, marks FROM students WHERE student_id = 4;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT student_id, first_name, city, marks FROM students WHERE student_id = 4;\nUPDATE students\nSET city = 'Bengaluru',\n    marks = 84\nWHERE student_id = 4;\nSELECT student_id, first_name, city, marks FROM students WHERE student_id = 4;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT student_id, first_name, city, marks FROM students WHERE student\n+------------+------------+---------+-------+\n| student_id | first_name | city    | marks |\n+------------+------------+---------+-------+\n| 4          | Ananya     | Chennai | 81    |\n+------------+------------+---------+-------+\n1 row(s) returned\n>> UPDATE students -> 1 row(s) affected Rows matched: 1  Changed: 1  Warnings: 0\n>> SELECT student_id, first_name, city, marks FROM students WHERE student\n+------------+------------+-----------+-------+\n| student_id | first_name | city      | marks |\n+------------+------------+-----------+-------+\n| 4          | Ananya     | Bengaluru | 84    |\n+------------+------------+-----------+-------+\n1 row(s) returned",
      "explanation": "The WHERE on the primary key matched exactly one row, so the Output panel reports 1 row affected. Both columns changed in a single statement. Because the WHERE uses the primary key, this UPDATE also works with Workbench's Safe Updates mode turned on."
    },
    {
      "title": "Update many rows with an expression",
      "scenario": "The Mathematics department (dept_id 2) increases fees by 5000 and adds 2 grace marks. Preview the rows, update them, and check.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Write the preview SELECT with the same WHERE you will use in the UPDATE",
        "Run the preview (Ctrl+Enter) and count the rows: 2",
        "Run the UPDATE; Output shows 2 row(s) affected Rows matched: 2 Changed: 2",
        "Run the final SELECT to see the new values"
      ],
      "code": "SELECT student_id, first_name, marks, fees FROM students WHERE dept_id = 2;\n\nUPDATE students\nSET fees  = fees + 5000,\n    marks = marks + 2\nWHERE dept_id = 2;\n\nSELECT student_id, first_name, marks, fees FROM students WHERE dept_id = 2;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT student_id, first_name, marks, fees FROM students WHERE dept_id = 2;\nUPDATE students\nSET fees  = fees + 5000,\n    marks = marks + 2\nWHERE dept_id = 2;\nSELECT student_id, first_name, marks, fees FROM students WHERE dept_id = 2;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT student_id, first_name, marks, fees FROM students WHERE dept_id\n+------------+------------+-------+-------+\n| student_id | first_name | marks | fees  |\n+------------+------------+-------+-------+\n| 3          | Rohan      | 75    | 60000 |\n| 6          | Meera      | 95    | 60000 |\n+------------+------------+-------+-------+\n2 row(s) returned\n>> UPDATE students -> 2 row(s) affected Rows matched: 2  Changed: 2  Warnings: 0\n>> SELECT student_id, first_name, marks, fees FROM students WHERE dept_id\n+------------+------------+-------+-------+\n| student_id | first_name | marks | fees  |\n+------------+------------+-------+-------+\n| 3          | Rohan      | 77    | 65000 |\n| 6          | Meera      | 97    | 65000 |\n+------------+------------+-------+-------+\n2 row(s) returned",
      "explanation": "fees = fees + 5000 reads each row's OLD value and adds 5000, so Rohan goes 60000 -> 65000 and Meera 60000 -> 65000; marks 75 -> 77 and 95 -> 97. dept_id is a foreign key column and InnoDB automatically indexes foreign key columns, so this UPDATE passes Workbench's Safe Updates check. A filter on a plain, non-indexed column such as city would be blocked (see the next example)."
    },
    {
      "title": "Error 1175 (Safe Updates) and its three fixes",
      "scenario": "You want to give every student from Delhi a fee of 70000. In Workbench the straightforward UPDATE fails with Error 1175. Fix it.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type: UPDATE students SET fees = 70000 WHERE city = 'Delhi';  and press Ctrl+Enter",
        "Output panel shows a red icon: Error Code: 1175. You are using safe update mode and you tried to update a table without a WHERE that uses a KEY column. To disable safe mode, toggle the option in Preferences -> SQL Editor and reconnect.",
        "Fix 1: find the keys with SELECT student_id FROM students WHERE city = 'Delhi'; then UPDATE ... WHERE student_id IN (3, 5)",
        "Fix 2: SET SQL_SAFE_UPDATES = 0; run the UPDATE; SET SQL_SAFE_UPDATES = 1;",
        "Fix 3 (permanent): Edit > Preferences > SQL Editor > untick Safe Updates > OK > Query > Reconnect to Server"
      ],
      "code": "-- In Workbench this fails:\nUPDATE students SET fees = 70000 WHERE city = 'Delhi';\n-- Error Code: 1175. You are using safe update mode and you tried to update\n-- a table without a WHERE that uses a KEY column. ...\n\n-- Fix 1: use the primary key\nSELECT student_id FROM students WHERE city = 'Delhi';      -- 3, 5\nUPDATE students SET fees = 70000 WHERE student_id IN (3, 5);\n\n-- Fix 2: turn safe mode off only for this session\nSET SQL_SAFE_UPDATES = 0;\nUPDATE students SET fees = 72000 WHERE city = 'Delhi';\nSET SQL_SAFE_UPDATES = 1;\n\nSELECT student_id, first_name, city, fees FROM students WHERE city = 'Delhi';",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT student_id FROM students WHERE city = 'Delhi';\nUPDATE students SET fees = 70000 WHERE student_id IN (3, 5);\nSET SQL_SAFE_UPDATES = 0;\nUPDATE students SET fees = 72000 WHERE city = 'Delhi';\nSET SQL_SAFE_UPDATES = 1;\nSELECT student_id, first_name, city, fees FROM students WHERE city = 'Delhi';",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT student_id FROM students WHERE city = 'Delhi'\n+------------+\n| student_id |\n+------------+\n| 3          |\n| 5          |\n+------------+\n2 row(s) returned\n>> UPDATE students SET fees = 70000 WHERE student_id IN (3, 5) -> 2 row(s) affected Rows matched: 2  Changed: 2  Warnings: 0\n>> SET SQL_SAFE_UPDATES = 0 -> 0 row(s) affected\n>> UPDATE students SET fees = 72000 WHERE city = 'Delhi' -> 2 row(s) affected Rows matched: 2  Changed: 2  Warnings: 0\n>> SET SQL_SAFE_UPDATES = 1 -> 0 row(s) affected\n>> SELECT student_id, first_name, city, fees FROM students WHERE city = '\n+------------+------------+-------+-------+\n| student_id | first_name | city  | fees  |\n+------------+------------+-------+-------+\n| 3          | Rohan      | Delhi | 72000 |\n| 5          | Kabir      | Delhi | 72000 |\n+------------+------------+-------+-------+\n2 row(s) returned",
      "explanation": "The browser lab does not enforce safe mode, so the first failing UPDATE is shown only in the code panel; the lab script contains the two fixes. Fix 1 passes the safe-mode check because student_id is the primary key. Fix 2 disables the check only for the current session and switches it back on immediately. The final values (72000) come from the second UPDATE."
    },
    {
      "title": "DELETE rows and respect foreign keys",
      "scenario": "Remove the student who has no department and no marks (an incomplete admission), then try to remove the History department (no students) and the Commerce department (has students).",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Preview: SELECT * FROM students WHERE marks IS NULL;",
        "Run the DELETE statements one by one with Ctrl+Enter",
        "Deleting History works (no student points to it)",
        "In real MySQL, DELETE FROM departments WHERE dept_id = 4 fails with Error Code: 1451. Cannot delete or update a parent row: a foreign key constraint fails - because Kabir and Priya still reference dept 4",
        "Count the remaining rows"
      ],
      "code": "SELECT student_id, first_name FROM students WHERE marks IS NULL;\n\nDELETE FROM students WHERE marks IS NULL;              -- 1 row\nDELETE FROM departments WHERE dept_name = 'History';   -- 1 row (no children)\n\n-- In MySQL this one fails because students still reference Commerce:\n-- DELETE FROM departments WHERE dept_id = 4;\n-- Error Code: 1451. Cannot delete or update a parent row: a foreign key constraint fails\n\nSELECT COUNT(*) AS students_left FROM students;\nSELECT dept_id, dept_name FROM departments;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT student_id, first_name FROM students WHERE marks IS NULL;\nDELETE FROM students WHERE marks IS NULL;\nDELETE FROM departments WHERE dept_name = 'History';\nSELECT COUNT(*) AS students_left FROM students;\nSELECT dept_id, dept_name FROM departments;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT student_id, first_name FROM students WHERE marks IS NULL\n+------------+------------+\n| student_id | first_name |\n+------------+------------+\n| 7          | Vikram     |\n+------------+------------+\n1 row(s) returned\n>> DELETE FROM students WHERE marks IS NULL -> 1 row(s) affected\n>> DELETE FROM departments WHERE dept_name = 'History' -> 1 row(s) affected\n>> SELECT COUNT(*) AS students_left FROM students\n+---------------+\n| students_left |\n+---------------+\n| 9             |\n+---------------+\n1 row(s) returned\n>> SELECT dept_id, dept_name FROM departments\n+---------+------------------+\n| dept_id | dept_name        |\n+---------+------------------+\n| 4       | Commerce         |\n| 1       | Computer Science |\n| 2       | Mathematics      |\n| 3       | Physics          |\n+---------+------------------+\n4 row(s) returned",
      "explanation": "Vikram's row (marks NULL) is deleted. History has no students, so deleting it is allowed. Commerce still has two students referencing it, so MySQL protects the relationship (Error 1451) - delete or move the child rows first, or define the FK with ON DELETE CASCADE / ON DELETE SET NULL. Note that student_id 7 will never be reused: AUTO_INCREMENT keeps counting."
    },
    {
      "title": "UPDATE and DELETE driven by another table",
      "scenario": "Commerce students get a fee concession of 3000. Then remove all students of the Physics department. Use the department NAME, not the id.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the statements (subquery form works everywhere)",
        "Press Ctrl+Shift+Enter",
        "Check the Output panel: the UPDATE matched 2 rows, the DELETE removed 2 rows",
        "Optional (real MySQL only): try the JOIN form shown in the comments"
      ],
      "code": "UPDATE students\nSET fees = fees - 3000\nWHERE dept_id = (SELECT dept_id FROM departments WHERE dept_name = 'Commerce');\n\nDELETE FROM students\nWHERE dept_id IN (SELECT dept_id FROM departments WHERE dept_name = 'Physics');\n\n-- Same in MySQL multi-table syntax:\n-- UPDATE students s JOIN departments d ON s.dept_id = d.dept_id\n-- SET s.fees = s.fees - 3000 WHERE d.dept_name = 'Commerce';\n-- DELETE s FROM students s JOIN departments d ON s.dept_id = d.dept_id\n-- WHERE d.dept_name = 'Physics';\n\nSELECT s.first_name, d.dept_name, s.fees\nFROM students s JOIN departments d ON s.dept_id = d.dept_id\nORDER BY d.dept_name, s.first_name;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nUPDATE students\nSET fees = fees - 3000\nWHERE dept_id = (SELECT dept_id FROM departments WHERE dept_name = 'Commerce');\nDELETE FROM students\nWHERE dept_id IN (SELECT dept_id FROM departments WHERE dept_name = 'Physics');\nSELECT s.first_name, d.dept_name, s.fees\nFROM students s JOIN departments d ON s.dept_id = d.dept_id\nORDER BY d.dept_name, s.first_name;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> UPDATE students -> 2 row(s) affected Rows matched: 2  Changed: 2  Warnings: 0\n>> DELETE FROM students -> 2 row(s) affected\n>> SELECT s.first_name, d.dept_name, s.fees\n+------------+------------------+-------+\n| first_name | dept_name        | fees  |\n+------------+------------------+-------+\n| Kabir      | Commerce         | 52000 |\n| Priya      | Commerce         | 52000 |\n| Aarav      | Computer Science | 85000 |\n| Diya       | Computer Science | 85000 |\n| Sneha      | Computer Science | 85000 |\n| Meera      | Mathematics      | 60000 |\n| Rohan      | Mathematics      | 60000 |\n+------------+------------------+-------+\n7 row(s) returned",
      "explanation": "The subquery returns the dept_id for the given name, so the statements keep working even if ids change. Kabir and Priya (Commerce) now pay 52000. Ananya and Arjun (Physics) are deleted, so Physics no longer appears in the final join."
    },
    {
      "title": "Undo a mistake with a transaction",
      "scenario": "You accidentally run DELETE without WHERE. Because you started a transaction first, you can ROLLBACK and get all rows back.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script exactly as shown",
        "Press Ctrl+Shift+Enter",
        "Result 1 shows 0 students (inside the transaction)",
        "Result 2 shows 10 students again after ROLLBACK",
        "In Workbench you can also click the Rollback toolbar button when auto-commit is turned off"
      ],
      "code": "START TRANSACTION;\nDELETE FROM students;                       -- oops, no WHERE!\nSELECT COUNT(*) AS inside_transaction FROM students;\nROLLBACK;\nSELECT COUNT(*) AS after_rollback FROM students;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSTART TRANSACTION;\nDELETE FROM students;\nSELECT COUNT(*) AS inside_transaction FROM students;\nROLLBACK;\nSELECT COUNT(*) AS after_rollback FROM students;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> START TRANSACTION -> 0 row(s) affected\n>> DELETE FROM students -> 10 row(s) affected\n>> SELECT COUNT(*) AS inside_transaction FROM students\n+--------------------+\n| inside_transaction |\n+--------------------+\n| 0                  |\n+--------------------+\n1 row(s) returned\n>> ROLLBACK -> 0 row(s) affected\n>> SELECT COUNT(*) AS after_rollback FROM students\n+----------------+\n| after_rollback |\n+----------------+\n| 10             |\n+----------------+\n1 row(s) returned",
      "explanation": "START TRANSACTION suspends autocommit until COMMIT or ROLLBACK. The DELETE removed all 10 rows inside the transaction, ROLLBACK undid it. Without the transaction the data would be gone (and with Safe Updates ON Workbench would have blocked this DELETE anyway). This is why DELETE is \"safer\" than TRUNCATE, which cannot be rolled back."
    }
  ],
  "interview": [
    {
      "q": "What happens if you run UPDATE or DELETE without a WHERE clause?",
      "a": "Every row of the table is updated or deleted. In MySQL Workbench Safe Updates mode blocks this with Error 1175, but in other clients it runs immediately and, with autocommit on, is permanent.",
      "level": "Beginner"
    },
    {
      "q": "What is Error 1175 in MySQL Workbench and how do you fix it?",
      "a": "It is raised when sql_safe_updates = 1 and an UPDATE/DELETE has no WHERE on a key column and no LIMIT. Fixes: filter by primary key/indexed column, add LIMIT, run SET SQL_SAFE_UPDATES = 0 for the session (and set it back to 1), or untick Edit > Preferences > SQL Editor > Safe Updates and reconnect.",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between DELETE, TRUNCATE and DROP?",
      "a": "DELETE is DML: removes chosen rows, supports WHERE, can be rolled back, fires triggers, keeps the AUTO_INCREMENT counter. TRUNCATE is DDL: removes all rows quickly, cannot be rolled back, resets AUTO_INCREMENT, does not fire triggers. DROP removes the table structure and data.",
      "level": "Intermediate"
    },
    {
      "q": "What do 'Rows matched' and 'Changed' mean in the UPDATE output?",
      "a": "Rows matched is the number of rows found by WHERE. Changed is how many actually got a different value. If a row already had the new value MySQL counts it as matched but not changed.",
      "level": "Beginner"
    },
    {
      "q": "How do you update a table based on values in another table?",
      "a": "Use a subquery in WHERE (WHERE dept_id IN (SELECT ...)) or MySQL's multi-table syntax UPDATE a JOIN b ON ... SET a.col = ... WHERE ...",
      "level": "Intermediate"
    },
    {
      "q": "Why does 'UPDATE students SET x = 1 WHERE id IN (SELECT id FROM students WHERE ...)' give Error 1093?",
      "a": "MySQL does not allow modifying a table and selecting from the same table in a subquery. Wrap the subquery in a derived table: WHERE id IN (SELECT id FROM (SELECT id FROM students WHERE ...) AS t).",
      "level": "Advanced"
    },
    {
      "q": "How can you undo an accidental DELETE?",
      "a": "Only if it ran inside an open transaction (START TRANSACTION or autocommit off): run ROLLBACK. After COMMIT you need a backup or binary-log point-in-time recovery.",
      "level": "Beginner"
    },
    {
      "q": "Can you use ORDER BY and LIMIT with UPDATE and DELETE in MySQL?",
      "a": "Yes, for single-table statements: DELETE FROM logs ORDER BY created_at LIMIT 1000; is a common way to delete in batches. They are not allowed in multi-table UPDATE/DELETE.",
      "level": "Intermediate"
    },
    {
      "q": "Why might DELETE on a parent table fail?",
      "a": "A foreign key in a child table references the row. MySQL raises Error 1451. Delete/re-point the child rows first or use ON DELETE CASCADE / SET NULL on the foreign key.",
      "level": "Beginner"
    },
    {
      "q": "Does DELETE reset AUTO_INCREMENT?",
      "a": "No. The counter continues from the highest value ever used. TRUNCATE (or ALTER TABLE t AUTO_INCREMENT = n) resets it.",
      "level": "Beginner"
    },
    {
      "q": "How do you set a column to NULL for some rows?",
      "a": "UPDATE table SET col = NULL WHERE condition; - note SET uses '=' while the WHERE test for NULL uses IS NULL.",
      "level": "Beginner"
    }
  ],
  "practice": [
    {
      "task": "Change Sneha's (student_id 8) email to sneha.k@college.edu and her city to Pune, then show her row.",
      "hint": "One UPDATE with two columns in SET, WHERE on the primary key.",
      "solution": "UPDATE students\nSET email = 'sneha.k@college.edu', city = 'Pune'\nWHERE student_id = 8;\nSELECT * FROM students WHERE student_id = 8;"
    },
    {
      "task": "Increase marks by 5 for all students who scored below 65, but never above 100.",
      "hint": "Use LEAST(marks + 5, 100). Preview with SELECT first.",
      "solution": "SELECT student_id, first_name, marks FROM students WHERE marks < 65;\nUPDATE students\nSET marks = LEAST(marks + 5, 100)\nWHERE marks < 65;"
    },
    {
      "task": "Delete students admitted in 2021 who are from Delhi. Write it so it also runs under Workbench Safe Updates.",
      "hint": "Find keys first or add LIMIT.",
      "solution": "SELECT student_id FROM students\nWHERE YEAR(admission_date) = 2021 AND city = 'Delhi';   -- returns 5\nDELETE FROM students WHERE student_id IN (5);\n-- or: DELETE FROM students WHERE YEAR(admission_date) = 2021 AND city = 'Delhi' LIMIT 100;"
    },
    {
      "task": "Give a 10% fee discount to all Computer Science students using the department name, inside a transaction, and roll it back after checking.",
      "hint": "START TRANSACTION; UPDATE ... WHERE dept_id = (SELECT ...); SELECT; ROLLBACK;",
      "solution": "START TRANSACTION;\nUPDATE students\nSET fees = fees * 90 / 100\nWHERE dept_id = (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science');\nSELECT first_name, fees FROM students WHERE dept_id = 1;\nROLLBACK;"
    },
    {
      "task": "Set city to NULL for every student whose city is 'Kochi', then list students with no city.",
      "hint": "SET city = NULL ... WHERE city IS NULL in the check.",
      "solution": "UPDATE students SET city = NULL WHERE city = 'Kochi';\nSELECT student_id, first_name FROM students WHERE city IS NULL;"
    }
  ],
  "quiz": [
    {
      "question": "What does UPDATE students SET fees = 0; do?",
      "options": [
        "Updates only the first row",
        "Sets fees to 0 for every row",
        "Gives a syntax error",
        "Deletes the fees column"
      ],
      "answer": 1,
      "explanation": "Without WHERE, UPDATE applies to all rows (Workbench Safe Updates would block it with Error 1175)."
    },
    {
      "question": "Which error code does MySQL Workbench show when Safe Updates blocks an UPDATE?",
      "options": [
        "1062",
        "1451",
        "1064",
        "1175"
      ],
      "answer": 3,
      "explanation": "Error 1175: You are using safe update mode and you tried to update a table without a WHERE that uses a KEY column."
    },
    {
      "question": "Which statement can be rolled back inside a transaction?",
      "options": [
        "DELETE FROM t WHERE id = 5",
        "TRUNCATE TABLE t",
        "DROP TABLE t",
        "None of them"
      ],
      "answer": 0,
      "explanation": "DELETE is DML and is transactional in InnoDB; TRUNCATE and DROP are DDL and cause an implicit commit."
    },
    {
      "question": "After SET SQL_SAFE_UPDATES = 0; how long does the change last?",
      "options": [
        "Forever for all users",
        "Until the current session/connection ends",
        "Only for the next statement",
        "Until the server restarts"
      ],
      "answer": 1,
      "explanation": "SET without GLOBAL changes the session variable for the current connection only."
    },
    {
      "question": "Deleting a department fails with Error 1451. Why?",
      "options": [
        "The department name is misspelled",
        "Safe Updates is on",
        "Rows in another table reference it through a foreign key",
        "The table has no primary key"
      ],
      "answer": 2,
      "explanation": "1451 = Cannot delete or update a parent row: a foreign key constraint fails."
    }
  ]
};
