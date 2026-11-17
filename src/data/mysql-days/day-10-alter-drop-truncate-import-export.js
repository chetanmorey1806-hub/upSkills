export default {
  "id": "mysql-day-10",
  "title": "ALTER, DROP, TRUNCATE, RENAME and CSV Import/Export",
  "module": "Module 2: CRUD Operations",
  "day": 10,
  "level": "Beginner",
  "duration": "2.5 hours",
  "summary": "Change table structure after creation with ALTER TABLE (add, drop, modify, change and rename columns, add constraints and indexes), rename and drop tables and databases, empty tables with TRUNCATE, and move data in and out of MySQL with Workbench's Table Data Export and Import Wizards (CSV/JSON).",
  "objectives": [
    "Add, drop, rename and redefine columns with ALTER TABLE and with the Workbench Alter Table editor",
    "Add and drop constraints and indexes on existing tables",
    "Choose correctly between DELETE, TRUNCATE and DROP",
    "Rename tables and drop tables and databases safely with IF EXISTS",
    "Export a table to CSV and import a CSV file using the Workbench wizards"
  ],
  "theory": [
    {
      "heading": "1. ALTER TABLE: changing the structure of an existing table",
      "content": "ALTER TABLE changes a table's design without losing its data: add, remove, rename or redefine columns, add or drop constraints and indexes, rename the table, or change table options. It is a DDL (Data Definition Language) command, so it commits automatically and cannot be rolled back.",
      "syntax": "ALTER TABLE students ADD COLUMN phone VARCHAR(15);                    -- add at the end\nALTER TABLE students ADD COLUMN middle_name VARCHAR(30) AFTER first_name; -- position\nALTER TABLE students ADD COLUMN roll_no INT FIRST;                      -- first column\nALTER TABLE students DROP COLUMN phone;                                 -- remove\nALTER TABLE students MODIFY city VARCHAR(50) NOT NULL;                  -- new type/constraint, same name\nALTER TABLE students CHANGE city home_city VARCHAR(50);                 -- rename AND redefine\nALTER TABLE students RENAME COLUMN home_city TO city;                   -- rename only (MySQL 8)\nALTER TABLE students ALTER COLUMN fees SET DEFAULT 50000;               -- change default only",
      "points": [
        "ADD COLUMN: existing rows get NULL, or the DEFAULT value if you give one (ADD COLUMN status VARCHAR(10) NOT NULL DEFAULT 'active').",
        "MODIFY keeps the column name and replaces the full definition - repeat NOT NULL / DEFAULT, otherwise they are lost.",
        "CHANGE old_name new_name definition renames and redefines in one go; RENAME COLUMN (MySQL 8.0+) only renames.",
        "Several changes can be combined: ALTER TABLE students ADD phone VARCHAR(15), DROP COLUMN gender;",
        "Changing a type that does not fit existing data (VARCHAR(50) -> VARCHAR(5)) gives Error 1406 Data too long or truncates in non-strict mode."
      ],
      "tip": "In the Workbench Lab only ADD COLUMN, DROP COLUMN, RENAME COLUMN and RENAME TO run; practise MODIFY / CHANGE / ADD CONSTRAINT in real MySQL Workbench."
    },
    {
      "heading": "2. ALTER TABLE for constraints and indexes",
      "content": "Keys and constraints can also be added after the table is created - very common when you get a table without proper keys.",
      "syntax": "ALTER TABLE students ADD CONSTRAINT uq_email UNIQUE (email);\nALTER TABLE students ADD CONSTRAINT chk_marks CHECK (marks BETWEEN 0 AND 100);\nALTER TABLE students ADD CONSTRAINT fk_dept\n      FOREIGN KEY (dept_id) REFERENCES departments(dept_id);\nALTER TABLE students ADD INDEX idx_city (city);\nALTER TABLE students ADD PRIMARY KEY (student_id);\n\nALTER TABLE students DROP INDEX idx_city;\nALTER TABLE students DROP CONSTRAINT chk_marks;       -- MySQL 8.0.19+\nALTER TABLE students DROP FOREIGN KEY fk_dept;\nALTER TABLE students AUTO_INCREMENT = 1000;          -- next id will be 1000",
      "points": [
        "Adding a UNIQUE or PRIMARY KEY fails (Error 1062) if existing data already has duplicates - clean the data first.",
        "Adding a FOREIGN KEY fails (Error 1452) if some child rows point to parents that do not exist.",
        "Give constraints names (uq_email, fk_dept) so you can drop them later; otherwise MySQL generates names like students_ibfk_1 (see SHOW CREATE TABLE)."
      ]
    },
    {
      "heading": "3. ALTER TABLE in the Workbench GUI",
      "content": "Workbench can generate ALTER statements for you. In the Navigator, right-click a table > Alter Table... opens the Table Editor with tabs at the bottom: Columns, Indexes, Foreign Keys, Triggers, Partitioning, Options.",
      "points": [
        "Columns tab: double-click a column name to rename it, change Datatype, tick PK, NN (not null), UQ (unique), B (binary), UN (unsigned), ZF (zero fill), AI (auto increment), G (generated), and set Default/Expression.",
        "Click an empty row at the bottom of the column list to add a new column; right-click a column > Delete Selected to drop it; drag columns to reorder.",
        "Indexes tab: add an index name, choose type (INDEX, UNIQUE, FULLTEXT, SPATIAL, PRIMARY) and tick the columns.",
        "Foreign Keys tab: name the FK, choose the Referenced Table, map columns and choose On Update / On Delete (RESTRICT, CASCADE, SET NULL, NO ACTION).",
        "Click Apply: the \"Review the SQL Script to be Applied on the Database\" dialog shows the exact ALTER TABLE statement - read it, click Apply, then Finish. This is a great way to learn the syntax."
      ]
    },
    {
      "heading": "4. RENAME, DROP and TRUNCATE",
      "content": "RENAME changes a table's name, DROP deletes objects completely, TRUNCATE empties a table but keeps its structure.",
      "syntax": "RENAME TABLE students TO learners;                -- MySQL statement\nRENAME TABLE a TO a_old, a_new TO a;              -- atomic swap of two tables\nALTER TABLE learners RENAME TO students;          -- same effect\n\nDROP TABLE IF EXISTS temp_marks;                  -- table + data gone\nDROP DATABASE IF EXISTS test_db;                  -- whole schema gone\n\nTRUNCATE TABLE audit_log;                         -- all rows gone, structure kept",
      "points": [
        "IF EXISTS prevents an error (only a warning) when the object is missing - ideal in scripts that you re-run.",
        "DROP TABLE fails if another table has a foreign key pointing to it: drop the child table first (that is why scripts drop enrollments before students before departments).",
        "TRUNCATE is faster than DELETE because it drops and re-creates the table internally; it resets AUTO_INCREMENT, fires no triggers and cannot be rolled back.",
        "TRUNCATE is not allowed on a table referenced by a foreign key from another table (Error 1701) - use DELETE in that case.",
        "In the Navigator: right-click a table > Drop Table... / Truncate Table... ; right-click a schema > Drop Schema... Workbench offers \"Review SQL\" or \"Drop Now\"."
      ],
      "tip": "Before any DROP or TRUNCATE in a real project, take a backup (Day 29) or at least CREATE TABLE copy AS SELECT * FROM original."
    },
    {
      "heading": "5. Table Data Export Wizard (table -> CSV/JSON)",
      "content": "Workbench can export one table to a CSV or JSON file without writing SQL.",
      "points": [
        "Navigator > Schemas > college > Tables > right-click students > Table Data Export Wizard.",
        "Screen 1 Select data for export: choose the table and tick the columns to export (all by default). Optionally tick \"Export selected rows\" or use a custom row count/offset. Click Next.",
        "Screen 2 Select output file location: choose the file path (C:\\exports\\students.csv), format csv or json, Field Separator (, ; tab |), Line Separator LF, Enclose Strings in \", Null and NULL word as SQL keyword. Tick \"Export to CSV\". Click Next.",
        "Screen 3 Export data: Next -> Workbench runs a SELECT and writes the file; the log shows \"Export data to file\" and \"10 records exported\". Click Finish.",
        "Alternative for any query: run the query, then in the Result Grid toolbar click the Export button (disk icon) > choose CSV / JSON / Excel XML / HTML."
      ]
    },
    {
      "heading": "6. Table Data Import Wizard (CSV -> table)",
      "content": "The import wizard reads a CSV or JSON file and inserts its rows into a new or existing table.",
      "points": [
        "Right-click the schema (or a table) > Table Data Import Wizard.",
        "Screen 1 Select File to Import: Browse to the CSV file. Click Next.",
        "Screen 2 Select Destination: Use existing table (choose college.students; optional \"Truncate table before import\") OR Create new table (give a name, optional \"Drop table if exists\"). Click Next.",
        "Screen 3 Configure Import Settings: check Encoding (utf-8), map each Source Column to a Destination Column and check the detected Field Type (int, text, double, datetime). Preview shows the first rows. Click Next.",
        "Screen 4 Import Data: Next starts the import; the log shows \"Prepare Import\", \"Import data file\" and \"10 records imported\". Screen 5 Import Results: Finish.",
        "Common problems: dates must be YYYY-MM-DD; wrong encoding shows garbled characters; rows that violate constraints (duplicate key, FK) are skipped and reported. For very large files use LOAD DATA INFILE instead (much faster)."
      ],
      "tip": "LOAD DATA LOCAL INFILE '/path/students.csv' INTO TABLE students FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\\n' IGNORE 1 LINES; - needs local_infile enabled on the server and in the connection (Advanced tab: OPT_LOCAL_INFILE=1)."
    }
  ],
  "examples": [
    {
      "title": "ADD COLUMN and DROP COLUMN",
      "scenario": "The college wants to store each student's phone number and a status flag that is 'active' for everyone. Later the phone column turns out to be unnecessary and is removed.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the ALTER statements and DESCRIBE",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Look at the DESCRIBE result: phone and status appear at the end of the column list",
        "Alternatively: Navigator > right-click students > Alter Table..., click the empty row at the bottom, type phone, Datatype VARCHAR(15), Apply > Apply > Finish",
        "Right-click the students table > Refresh All in the Navigator to see the new columns"
      ],
      "code": "ALTER TABLE students ADD COLUMN phone VARCHAR(15);\nALTER TABLE students ADD COLUMN status VARCHAR(10) NOT NULL DEFAULT 'active';\n\nSELECT student_id, first_name, phone, status FROM students LIMIT 3;\n\nALTER TABLE students DROP COLUMN phone;\nDESCRIBE students;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nALTER TABLE students ADD COLUMN phone VARCHAR(15);\nALTER TABLE students ADD COLUMN status VARCHAR(10) NOT NULL DEFAULT 'active';\nSELECT student_id, first_name, phone, status FROM students LIMIT 3;\nALTER TABLE students DROP COLUMN phone;\nDESCRIBE students;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> ALTER TABLE students ADD COLUMN phone VARCHAR(15) -> 0 row(s) affected\n>> ALTER TABLE students ADD COLUMN status VARCHAR(10) NOT NULL DEFAULT 'a -> 0 row(s) affected\n>> SELECT student_id, first_name, phone, status FROM students LIMIT 3\n+------------+------------+-------+--------+\n| student_id | first_name | phone | status |\n+------------+------------+-------+--------+\n| 1          | Aarav      | NULL  | active |\n| 2          | Diya       | NULL  | active |\n| 3          | Rohan      | NULL  | active |\n+------------+------------+-------+--------+\n3 row(s) returned\n>> ALTER TABLE students DROP COLUMN phone -> 0 row(s) affected\n>> DESCRIBE students\n+----------------+-------------+------+-----+---------+----------------+\n| Field          | Type        | Null | Key | Default | Extra          |\n+----------------+-------------+------+-----+---------+----------------+\n| student_id     | integer     | NO   | PRI | NULL    | auto_increment |\n| first_name     | varchar(30) | NO   |     | NULL    |                |\n| last_name      | varchar(30) | YES  |     | NULL    |                |\n| email          | varchar(80) | YES  | UNI | NULL    |                |\n| gender         | char(1)     | YES  |     | NULL    |                |\n| dob            | date        | YES  |     | NULL    |                |\n| city           | varchar(30) | YES  |     | NULL    |                |\n| dept_id        | int         | YES  | MUL | NULL    |                |\n| marks          | int         | YES  |     | NULL    |                |\n| fees           | int         | YES  |     | NULL    |                |\n| admission_date | date        | YES  |     | NULL    |                |\n| status         | varchar(10) | NO   |     | active  |                |\n+----------------+-------------+------+-----+---------+----------------+\n12 row(s) returned",
      "explanation": "New columns are added at the end of the table. phone is NULL for existing rows because it has no default; status is filled with 'active' for all 10 existing rows because of NOT NULL DEFAULT 'active'. After DROP COLUMN phone, DESCRIBE no longer lists it - the data in that column is gone permanently."
    },
    {
      "title": "Rename a column and rename a table",
      "scenario": "The column city should be called home_city, and the departments table should be called depts during a migration and then renamed back.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the statements",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Check SHOW TABLES: depts appears instead of departments in the middle of the script",
        "In the Navigator, right-click Tables > Refresh All to see the new names",
        "GUI way: Alter Table... and double-click the column name in the Columns tab to rename it"
      ],
      "code": "ALTER TABLE students RENAME COLUMN city TO home_city;\nSELECT first_name, home_city FROM students WHERE student_id <= 3;\n\nALTER TABLE departments RENAME TO depts;     -- or: RENAME TABLE departments TO depts;\nSHOW TABLES;\nALTER TABLE depts RENAME TO departments;     -- or: RENAME TABLE depts TO departments;\nSHOW TABLES;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nALTER TABLE students RENAME COLUMN city TO home_city;\nSELECT first_name, home_city FROM students WHERE student_id <= 3;\nALTER TABLE departments RENAME TO depts;\nSHOW TABLES;\nALTER TABLE depts RENAME TO departments;\nSHOW TABLES;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> ALTER TABLE students RENAME COLUMN city TO home_city -> 0 row(s) affected\n>> SELECT first_name, home_city FROM students WHERE student_id <= 3\n+------------+-----------+\n| first_name | home_city |\n+------------+-----------+\n| Aarav      | Pune      |\n| Diya       | Mumbai    |\n| Rohan      | Delhi     |\n+------------+-----------+\n3 row(s) returned\n>> ALTER TABLE departments RENAME TO depts -> 0 row(s) affected\n>> SHOW TABLES\n+-------------------+\n| Tables_in_college |\n+-------------------+\n| depts             |\n| students          |\n+-------------------+\n2 row(s) returned\n>> ALTER TABLE depts RENAME TO departments -> 0 row(s) affected\n>> SHOW TABLES\n+-------------------+\n| Tables_in_college |\n+-------------------+\n| departments       |\n| students          |\n+-------------------+\n2 row(s) returned",
      "explanation": "RENAME COLUMN only changes the name; data and type stay. ALTER TABLE ... RENAME TO and RENAME TABLE ... TO do the same job (the Lab supports the ALTER form). Foreign keys follow the renamed table automatically, so students still references the departments table after it is renamed back."
    },
    {
      "title": "MODIFY, CHANGE, constraints and indexes (real MySQL Workbench)",
      "scenario": "Make city longer and mandatory, rename last_name to surname, add a CHECK on marks and an index on city. These ALTER forms are not supported by the browser Lab, so run them in MySQL Workbench.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Make sure college is the default schema (double-click it)",
        "Fix data first: UPDATE students SET city = 'Unknown' WHERE city IS NULL AND student_id > 0;",
        "Run each ALTER with Ctrl+Enter and read the Output panel",
        "Run SHOW CREATE TABLE students; then right-click the Create Table cell > Open Value in Viewer to read the full definition",
        "GUI check: right-click students > Alter Table... > Indexes tab shows idx_city"
      ],
      "code": "UPDATE students SET city = 'Unknown' WHERE city IS NULL AND student_id > 0;\n\nALTER TABLE students MODIFY city VARCHAR(50) NOT NULL;\nALTER TABLE students CHANGE last_name surname VARCHAR(40);\nALTER TABLE students ADD CONSTRAINT chk_marks CHECK (marks BETWEEN 0 AND 100);\nALTER TABLE students ADD INDEX idx_city (city);\nALTER TABLE students ALTER COLUMN fees SET DEFAULT 50000;\n\nSHOW CREATE TABLE students;",
      "result": "1 row(s) affected Rows matched: 1  Changed: 1  Warnings: 0\n0 row(s) affected Records: 0  Duplicates: 0  Warnings: 0      -- MODIFY\n0 row(s) affected Records: 0  Duplicates: 0  Warnings: 0      -- CHANGE\n10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0    -- ADD CHECK (table rebuilt)\n0 row(s) affected Records: 0  Duplicates: 0  Warnings: 0      -- ADD INDEX\n0 row(s) affected Records: 0  Duplicates: 0  Warnings: 0      -- SET DEFAULT\n\nSHOW CREATE TABLE (excerpt):\n  `city` varchar(50) NOT NULL,\n  `surname` varchar(40) DEFAULT NULL,\n  `fees` int DEFAULT '50000',\n  KEY `idx_city` (`city`),\n  CONSTRAINT `chk_marks` CHECK ((`marks` between 0 and 100))",
      "explanation": "MODIFY needed the UPDATE first: a NOT NULL column cannot hold the existing NULL city (Error 1138 Invalid use of NULL value). CHANGE renamed and redefined last_name. ADD CONSTRAINT ... CHECK is validated against existing rows; if any row had marks 120 it would fail with Error 3819. SHOW CREATE TABLE prints the final DDL including the named constraint and index."
    },
    {
      "title": "TRUNCATE vs DELETE: AUTO_INCREMENT behaviour",
      "scenario": "Create a small log table, empty it once with DELETE and once with TRUNCATE, and watch the id of the next inserted row.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the full script",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Compare the two result grids: after DELETE the next id is 4, after TRUNCATE it is 1",
        "Navigator alternative: right-click login_log > Truncate Table... > Truncate"
      ],
      "code": "CREATE TABLE login_log (\n  log_id INT AUTO_INCREMENT PRIMARY KEY,\n  username VARCHAR(30)\n);\nINSERT INTO login_log (username) VALUES ('aarav'),('diya'),('rohan');\n\nDELETE FROM login_log;                       -- rows gone, counter kept\nINSERT INTO login_log (username) VALUES ('meera');\nSELECT * FROM login_log;                     -- log_id = 4\n\nTRUNCATE TABLE login_log;                    -- rows gone, counter reset\nINSERT INTO login_log (username) VALUES ('kabir');\nSELECT * FROM login_log;                     -- log_id = 1",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS login_log;\nCREATE TABLE login_log (\n  log_id INT AUTO_INCREMENT PRIMARY KEY,\n  username VARCHAR(30)\n);\nINSERT INTO login_log (username) VALUES ('aarav'),('diya'),('rohan');\nDELETE FROM login_log;\nINSERT INTO login_log (username) VALUES ('meera');\nSELECT * FROM login_log;\nTRUNCATE TABLE login_log;\nINSERT INTO login_log (username) VALUES ('kabir');\nSELECT * FROM login_log;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS login_log -> 0 row(s) affected\n>> CREATE TABLE login_log ( -> 0 row(s) affected\n>> INSERT INTO login_log (username) VALUES ('aarav'),('diya'),('rohan') -> 3 row(s) affected Records: 3  Duplicates: 0  Warnings: 0\n>> DELETE FROM login_log -> 3 row(s) affected\n>> INSERT INTO login_log (username) VALUES ('meera') -> 1 row(s) affected\n>> SELECT * FROM login_log\n+--------+----------+\n| log_id | username |\n+--------+----------+\n| 4      | meera    |\n+--------+----------+\n1 row(s) returned\n>> TRUNCATE TABLE login_log -> 0 row(s) affected\n>> INSERT INTO login_log (username) VALUES ('kabir') -> 1 row(s) affected\n>> SELECT * FROM login_log\n+--------+----------+\n| log_id | username |\n+--------+----------+\n| 1      | kabir    |\n+--------+----------+\n1 row(s) returned",
      "explanation": "DELETE removes the rows but the AUTO_INCREMENT counter remembers 3, so Meera gets id 4. TRUNCATE re-creates the table, so the counter restarts and Kabir gets id 1. Remember also: DELETE can be rolled back and fires triggers; TRUNCATE cannot and does not."
    },
    {
      "title": "DROP TABLE, DROP DATABASE and IF EXISTS",
      "scenario": "Create a practice schema with a table, check it exists, then remove the table and the whole schema. Use IF EXISTS so the script can be re-run.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "In the Navigator click the refresh icon next to SCHEMAS: practice_db appears and then disappears",
        "GUI way: right-click a schema > Drop Schema... > Review SQL / Drop Now"
      ],
      "code": "DROP DATABASE IF EXISTS practice_db;\nCREATE DATABASE practice_db;\nUSE practice_db;\nCREATE TABLE temp_marks (id INT PRIMARY KEY, marks INT);\nINSERT INTO temp_marks VALUES (1, 50), (2, 60);\nSHOW TABLES;\n\nDROP TABLE temp_marks;\nDROP TABLE IF EXISTS temp_marks;       -- no error, only a warning\nSHOW TABLES;\n\nDROP DATABASE practice_db;\nSHOW DATABASES;          -- college is still there, practice_db is gone",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nDROP DATABASE IF EXISTS practice_db;\nCREATE DATABASE practice_db;\nUSE practice_db;\nCREATE TABLE temp_marks (id INT PRIMARY KEY, marks INT);\nINSERT INTO temp_marks VALUES (1, 50), (2, 60);\nSHOW TABLES;\nDROP TABLE temp_marks;\nDROP TABLE IF EXISTS temp_marks;\nSHOW TABLES;\nDROP DATABASE practice_db;\nSHOW DATABASES;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> DROP DATABASE IF EXISTS practice_db -> 0 row(s) affected, 1 warning(s)\n>> CREATE DATABASE practice_db -> 1 row(s) affected\n>> USE practice_db -> 0 row(s) affected\n>> CREATE TABLE temp_marks (id INT PRIMARY KEY, marks INT) -> 0 row(s) affected\n>> INSERT INTO temp_marks VALUES (1, 50), (2, 60) -> 2 row(s) affected Records: 2  Duplicates: 0  Warnings: 0\n>> SHOW TABLES\n+-----------------------+\n| Tables_in_practice_db |\n+-----------------------+\n| temp_marks            |\n+-----------------------+\n1 row(s) returned\n>> DROP TABLE temp_marks -> 0 row(s) affected\n>> DROP TABLE IF EXISTS temp_marks -> 0 row(s) affected\n>> SHOW TABLES\n+-----------------------+\n| Tables_in_practice_db |\n+-----------------------+\n+-----------------------+\n0 row(s) returned\n>> DROP DATABASE practice_db -> 0 row(s) affected\n>> SHOW DATABASES\n+----------+\n| Database |\n+----------+\n| college  |\n+----------+\n1 row(s) returned",
      "explanation": "The first DROP DATABASE IF EXISTS gives \"0 row(s) affected, 1 warning(s)\" because practice_db did not exist yet. After DROP TABLE, SHOW TABLES returns no rows; the second DROP TABLE IF EXISTS does not fail. DROP DATABASE removes the schema and every table in it - there is no undo. (Real MySQL also lists system schemas such as information_schema, mysql, performance_schema and sys in SHOW DATABASES.)"
    },
    {
      "title": "Export students to CSV and import it into a new table",
      "scenario": "Export the students table to students.csv with the Table Data Export Wizard and import it back into a new table students_import with the Table Data Import Wizard.",
      "steps": [
        "In MySQL Workbench: Navigator > SCHEMAS > college > Tables",
        "Right-click students > Table Data Export Wizard",
        "Select data for export: all columns ticked > Next",
        "Select output file location: File Path = C:\\exports\\students.csv (Linux/macOS: ~/exports/students.csv), Format = csv, Field Separator = , , Enclose Strings in = \" > Next",
        "Export data: Next > log shows 10 records exported > Finish",
        "Right-click the college schema > Table Data Import Wizard",
        "Select File to Import: Browse to students.csv > Next",
        "Select Destination: Create new table college.students_import, tick Drop table if exists > Next",
        "Configure Import Settings: Encoding utf-8; check that student_id is int, dob/admission_date are datetime or text, marks and fees are int > Next",
        "Import Data: Next > log shows 10 records imported > Next > Finish",
        "Refresh the Navigator and run the check query below"
      ],
      "code": "-- Check the imported table\nSELECT COUNT(*) AS imported_rows FROM students_import;\nSELECT student_id, first_name, city, marks FROM students_import LIMIT 3;\n\n-- Same import with SQL (needs local_infile enabled):\n-- LOAD DATA LOCAL INFILE 'C:/exports/students.csv'\n-- INTO TABLE students_import\n-- FIELDS TERMINATED BY ',' ENCLOSED BY '\"'\n-- LINES TERMINATED BY '\\r\\n'\n-- IGNORE 1 LINES;",
      "result": "students.csv (first lines):\nstudent_id,first_name,last_name,email,gender,dob,city,dept_id,marks,fees,admission_date\n1,Aarav,Sharma,aarav.sharma@college.edu,M,2004-03-15,Pune,1,88,85000,2022-07-01\n2,Diya,Patel,diya.patel@college.edu,F,2003-11-02,Mumbai,1,92,85000,2021-07-01\n\nImport log: 10 records imported\n\n+---------------+\n| imported_rows |\n+---------------+\n| 10            |\n+---------------+",
      "explanation": "The wizard writes a header row with the column names and one line per row. When importing into a NEW table, the wizard creates columns based on detected types (text for strings, int, double, datetime) - check them on the Configure Import Settings screen; for production tables create the table yourself first with proper types and keys, then import into the existing table."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between MODIFY and CHANGE in ALTER TABLE?",
      "a": "MODIFY changes the definition of a column but keeps its name. CHANGE takes the old name, a new name and the full definition, so it can rename and redefine at once. RENAME COLUMN (MySQL 8) only renames.",
      "level": "Intermediate"
    },
    {
      "q": "What is the difference between TRUNCATE and DELETE?",
      "a": "TRUNCATE is DDL: removes all rows by re-creating the table, is fast, resets AUTO_INCREMENT, does not fire triggers, cannot be rolled back, and fails if referenced by a foreign key. DELETE is DML: can use WHERE, is logged per row, fires triggers and can be rolled back.",
      "level": "Beginner"
    },
    {
      "q": "What does DROP TABLE IF EXISTS do differently from DROP TABLE?",
      "a": "If the table does not exist, IF EXISTS produces only a warning instead of Error 1051 Unknown table, so scripts can be re-run safely.",
      "level": "Beginner"
    },
    {
      "q": "How do you add a column at a specific position?",
      "a": "ALTER TABLE t ADD COLUMN c INT AFTER other_column; or FIRST to make it the first column.",
      "level": "Beginner"
    },
    {
      "q": "Why can adding a UNIQUE constraint or primary key with ALTER TABLE fail?",
      "a": "Existing data already violates it: duplicate values give Error 1062, NULLs block a primary key. Clean the data before adding the constraint.",
      "level": "Intermediate"
    },
    {
      "q": "Can you roll back an ALTER TABLE or DROP TABLE?",
      "a": "No. DDL statements cause an implicit commit in MySQL, so they cannot be rolled back. Take a backup first.",
      "level": "Beginner"
    },
    {
      "q": "How do you rename a table in MySQL?",
      "a": "RENAME TABLE old TO new; or ALTER TABLE old RENAME TO new;. RENAME TABLE can rename several tables atomically, useful for swapping a new table into place.",
      "level": "Beginner"
    },
    {
      "q": "Why must child tables be dropped before parent tables?",
      "a": "A parent table referenced by a foreign key cannot be dropped (Error 3730). Drop children first, or temporarily SET FOREIGN_KEY_CHECKS = 0.",
      "level": "Intermediate"
    },
    {
      "q": "How do you import a CSV into MySQL using Workbench?",
      "a": "Right-click the schema or table > Table Data Import Wizard > choose the file > choose an existing table or create a new one > map columns and types > Import. For large files use LOAD DATA INFILE.",
      "level": "Beginner"
    },
    {
      "q": "How do you export query results to CSV/Excel in Workbench?",
      "a": "Run the query and click the Export button on the Result Grid toolbar (choose CSV, JSON, Excel XML, HTML...), or use the Table Data Export Wizard for a whole table.",
      "level": "Beginner"
    },
    {
      "q": "How do you reset AUTO_INCREMENT without deleting data?",
      "a": "ALTER TABLE t AUTO_INCREMENT = n; (n must be greater than the current maximum id for InnoDB to accept it).",
      "level": "Intermediate"
    }
  ],
  "practice": [
    {
      "task": "Add a column blood_group VARCHAR(3) after gender and a column scholarship INT NOT NULL DEFAULT 0 to students.",
      "hint": "Use AFTER for the position; the default fills existing rows.",
      "solution": "ALTER TABLE students\n  ADD COLUMN blood_group VARCHAR(3) AFTER gender,\n  ADD COLUMN scholarship INT NOT NULL DEFAULT 0;\nDESCRIBE students;"
    },
    {
      "task": "Rename the column building in departments to block_name and then rename departments to dept.",
      "hint": "RENAME COLUMN and RENAME TABLE.",
      "solution": "ALTER TABLE departments RENAME COLUMN building TO block_name;\nRENAME TABLE departments TO dept;"
    },
    {
      "task": "Make email mandatory and add a unique constraint named uq_students_email.",
      "hint": "MODIFY with NOT NULL, then ADD CONSTRAINT ... UNIQUE.",
      "solution": "ALTER TABLE students MODIFY email VARCHAR(80) NOT NULL;\nALTER TABLE students ADD CONSTRAINT uq_students_email UNIQUE (email);"
    },
    {
      "task": "Create a copy of students called students_backup, empty the copy with TRUNCATE, then drop it.",
      "hint": "CREATE TABLE ... AS SELECT, TRUNCATE, DROP.",
      "solution": "CREATE TABLE students_backup AS SELECT * FROM students;\nTRUNCATE TABLE students_backup;\nSELECT COUNT(*) FROM students_backup;   -- 0\nDROP TABLE students_backup;"
    },
    {
      "task": "Write the LOAD DATA statement to import C:/data/new_students.csv (header row, comma separated, quoted strings) into students(first_name, last_name, city, marks).",
      "hint": "List the target columns in brackets at the end; IGNORE 1 LINES skips the header.",
      "solution": "LOAD DATA LOCAL INFILE 'C:/data/new_students.csv'\nINTO TABLE students\nFIELDS TERMINATED BY ',' ENCLOSED BY '\"'\nLINES TERMINATED BY '\\r\\n'\nIGNORE 1 LINES\n(first_name, last_name, city, marks);"
    }
  ],
  "quiz": [
    {
      "question": "Which statement renames a column without changing its type in MySQL 8?",
      "options": [
        "ALTER TABLE t MODIFY a b",
        "ALTER TABLE t RENAME COLUMN a TO b",
        "RENAME COLUMN t.a TO b",
        "UPDATE t SET a = b"
      ],
      "answer": 1,
      "explanation": "RENAME COLUMN old TO new (MySQL 8.0+) only renames. CHANGE a b <definition> also works but needs the full definition."
    },
    {
      "question": "After TRUNCATE TABLE on an AUTO_INCREMENT table, the next inserted id is:",
      "options": [
        "1",
        "The old maximum + 1",
        "0",
        "NULL"
      ],
      "answer": 0,
      "explanation": "TRUNCATE resets the AUTO_INCREMENT counter."
    },
    {
      "question": "Which of these can be rolled back?",
      "options": [
        "DROP TABLE",
        "TRUNCATE TABLE",
        "ALTER TABLE",
        "DELETE FROM t WHERE id = 3"
      ],
      "answer": 3,
      "explanation": "Only DML such as DELETE is transactional; DDL causes an implicit commit."
    },
    {
      "question": "Where do you start the Table Data Import Wizard in Workbench?",
      "options": [
        "File > Import",
        "Right-click a schema or table in the Navigator > Table Data Import Wizard",
        "Server > Data Import",
        "Query > Import CSV"
      ],
      "answer": 1,
      "explanation": "Table Data Import/Export Wizards are on the Navigator right-click menu. Server > Data Import is for SQL dump files (Day 29)."
    },
    {
      "question": "ALTER TABLE students MODIFY city VARCHAR(50); - what happens to an existing NOT NULL on city?",
      "options": [
        "It is kept automatically",
        "It is removed because MODIFY replaces the whole definition",
        "The statement fails",
        "City becomes the primary key"
      ],
      "answer": 1,
      "explanation": "MODIFY replaces the full column definition; repeat NOT NULL / DEFAULT if you want to keep them."
    }
  ]
};
