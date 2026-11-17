export default {
  id: "day-03-workbench-interface-tour",
  title: "MySQL Workbench Interface Tour: Navigator, SQL Editor, Result Grid, Output, Shortcuts",
  module: "Module 1: Getting Started with MySQL & Workbench",
  day: 3,
  level: "Beginner",
  duration: "2 hours",
  summary: "A guided tour of every important part of MySQL Workbench 8.0: the Home screen, the Navigator with its Administration and Schemas tabs, the SQL Editor and its toolbar, the Result Grid, the Output panel, the SQL Additions sidebar (Context Help and Snippets), Beautify, Preferences and the keyboard shortcuts professionals use every day.",
  objectives: [
    "Name and locate every panel of the Workbench SQL Editor window",
    "Use the Execute, Execute Current Statement, Stop and Beautify toolbar buttons and their shortcuts",
    "Read multiple Result tabs, the Result Grid toolbar and the Action Output panel",
    "Use Navigator shortcuts such as Select Rows - Limit 1000, Table Inspector and Send to SQL Editor",
    "Save and reuse queries with Snippets and change key Preferences"
  ],
  theory: [
    {
      heading: "The Home Screen",
      content: "When Workbench starts you see the Home screen titled \"Welcome to MySQL Workbench\". It has three icons on the far-left vertical bar and the connection tiles in the middle.",
      points: [
        "Left vertical bar, icon 1 (dolphin): MySQL Connections - the default view with your connection tiles.",
        "Left vertical bar, icon 2 (overlapping squares): Models - EER diagram files (.mwb). Used on Day 27.",
        "Left vertical bar, icon 3 (arrow): Migration Wizard - move data from other databases (SQL Server, PostgreSQL, Access) into MySQL.",
        "Next to \"MySQL Connections\": the + icon (Setup New Connection) and the wrench icon (Manage Server Connections).",
        "Connection tile: shows connection name, user (root) and host:port (localhost:3306). Click once to open; right-click for Open Connection, Edit Connection..., Copy JDBC Connection String, Move to Group..., Delete Connection.",
        "The house-shaped \"Home\" tab at the top-left always brings you back here while other tabs stay open."
      ]
    },
    {
      heading: "SQL Editor Window: The Four Main Areas",
      content: "Opening a connection shows the SQL Editor. Remember the layout as a cross: Navigator on the left, Query editor in the centre, SQL Additions on the right, and Results plus Output at the bottom. The three small square buttons at the top-right of the window toggle the left sidebar, the bottom output area and the right sidebar (also View > Panels).",
      syntax: `+----------------------------------------------------------------------------+
| Menu: File Edit View Query Database Server Tools Scripting Help            |
| Main toolbar: New SQL tab | Open SQL script | ... | panel toggles (3 icons)|
+------------------+-------------------------------------+-------------------+
| NAVIGATOR        |  Query 1  (editor tab)              | SQL Additions     |
|  Administration  |  [Query toolbar: lightning bolts,   |  Context Help     |
|  Schemas         |   stop, commit, limit, beautify..]  |  Snippets         |
|  Filter objects  |                                     |                   |
|  college         |  SELECT * FROM students;            |                   |
|   > Tables       +-------------------------------------+                   |
|   > Views        |  Result Grid | Form Editor | ...    |                   |
|------------------|  Result 1 | Result 2 (tabs)         |                   |
| Information      +-------------------------------------+                   |
| Object Info |    | Output: Action Output                                   |
| Session          |  # | Time | Action | Message | Duration / Fetch        |
+------------------+---------------------------------------------------------+`,
      points: [
        "Navigator (left): Administration tab and Schemas tab (shown as two tabs at the bottom of the Navigator in Workbench 8.0).",
        "Information panel (below Navigator): Object Info tab (columns and types of the selected table) and Session tab (connection details).",
        "Query editor (centre): one tab per script, named Query 1, Query 2... or the file name once saved.",
        "SQL Additions (right): Context Help and Snippets tabs.",
        "Output area (bottom): Action Output, Text Output and History Output (choose in the drop-down)."
      ]
    },
    {
      heading: "Navigator: Schemas and Administration",
      content: "The Schemas tab lists every database the user can see. Expand a schema to see Tables, Views, Stored Procedures and Functions. A bold schema name is the default (current) schema. Hover over a table to show three small icons: (i) Table Inspector, wrench = Alter Table, grid = Select Rows - Limit 1000. The Administration tab groups server tools under three headings.",
      points: [
        "Schemas tab: \"Filter objects\" search box at the top, refresh icon (two arrows) to reload after CREATE/DROP from SQL.",
        "Right-click a schema: Set as Default Schema, Filter to This Schema, Schema Inspector, Create Table..., Create View..., Create Stored Procedure..., Alter Schema..., Drop Schema..., Refresh All.",
        "Right-click a table: Select Rows - Limit 1000, Table Inspector, Copy to Clipboard (Name, Create Statement...), Send to SQL Editor (Name, Select All Statement, Insert Statement, Create Statement...), Create Table..., Alter Table..., Table Maintenance, Drop Table..., Truncate Table..., Table Data Export Wizard, Table Data Import Wizard.",
        "Administration > MANAGEMENT: Server Status, Client Connections, Users and Privileges, Status and System Variables, Data Export, Data Import/Restore.",
        "Administration > INSTANCE: Startup / Shutdown, Server Logs, Options File.",
        "Administration > PERFORMANCE: Dashboard, Performance Reports, Performance Schema Setup."
      ],
      tip: "Double-clicking a schema name is the quickest way to make it the default schema (same as USE schema_name;)."
    },
    {
      heading: "The Query Toolbar and Execute Buttons",
      content: "Above each query tab is a toolbar. From left to right the most used buttons are:",
      points: [
        "Folder icon: Open a SQL script file (Ctrl+Shift+O). Disk icon: Save the script (Ctrl+S).",
        "Lightning bolt: Execute the selected portion of the script or everything (Ctrl+Shift+Enter). If text is selected, only the selection runs.",
        "Lightning bolt with a cursor (I-beam): Execute the statement under the keyboard cursor (Ctrl+Enter).",
        "Lightning bolt with magnifying glass: Execute the EXPLAIN command on the statement under the cursor (Visual Explain, Ctrl+Alt+X).",
        "Hand (Stop) icon: Stop the query being executed.",
        "Red circle icon: Toggle whether execution of SQL script should continue after failed statements (Query > Stop Script Execution on Errors).",
        "Commit, Rollback and Toggle auto-commit icons: transaction control (Day 24).",
        "\"Limit to 1000 rows\" drop-down: adds a LIMIT automatically to SELECTs; choose Don't Limit for full results.",
        "Broom icon: Beautify/reformat the SQL script (Ctrl+B, also Edit > Format > Beautify Query).",
        "Magnifier: Show the Find panel (Ctrl+F). Then icons for invisible characters and word wrap.",
        "Bookmark/star icon: Save current statement or selection to the snippet list."
      ],
      tip: "Golden rule: Ctrl+Enter runs ONE statement (where the cursor is). Ctrl+Shift+Enter runs ALL (or the selection). Beginners often press Ctrl+Shift+Enter and accidentally run a DROP lower down in the script."
    },
    {
      heading: "Result Grid and Output Panel",
      content: "Every statement that returns rows opens a Result tab (Result 1, Result 2...). Inside it, the Result Grid shows rows like a spreadsheet. The vertical bar on the right of the results switches between Result Grid, Form Editor (one row at a time), Field Types (column metadata), Query Stats (timing, rows examined) and Execution Plan. The Result Grid toolbar contains: Filter Rows (search box), Edit (insert new row, delete selected rows - only for single-table results with a primary key), Export/Import (export recordset to CSV, JSON, Excel XML, HTML...), Wrap Cell Content and Fetch rows. When you edit cells, click Apply at the bottom right to generate and run the UPDATE, or Revert to cancel.",
      points: [
        "Output panel > Action Output columns: # (statement number), Time, Action (the SQL), Message (e.g. \"10 row(s) returned\", \"1 row(s) affected\", or the error), Duration / Fetch (seconds).",
        "Green tick = success, red circle with X = error. Double-click... or right-click a row > Copy Message to copy the error for searching.",
        "Text Output shows results as plain text tables (like the command line). History Output keeps every statement run per day.",
        "Right-click a cell in the grid: Open Value in Editor, Set Field to NULL, Copy Row, Copy Field, Copy Row (with names, tab separated).",
        "Read-only grid? A lock/info icon says \"Read Only\" when the result has no primary key or uses a JOIN/expression."
      ]
    },
    {
      heading: "SQL Additions: Context Help and Snippets; Preferences",
      content: "The right sidebar is called SQL Additions. Context Help shows the MySQL manual entry for the keyword under the cursor (turn on \"Automatic Context Help\"). Snippets stores reusable SQL. Choose a category from the drop-down: My Snippets, SQL DDL Statements, SQL DML Statements, DB Mgmt. Double-click a snippet or use the toolbar buttons \"Insert the snippet text at the current caret position\", \"Replace the current text by this snippet\" and \"Copy the snippet text to the clipboard\". To create your own, select SQL in the editor and click the \"Save current statement or selection to the snippet list\" icon; it is saved under My Snippets.",
      points: [
        "Edit > Preferences (Windows/Linux) or MySQL Workbench > Settings (macOS) opens Workbench Preferences.",
        "SQL Editor > \"Safe Updates\" (rejects UPDATEs and DELETEs with no restrictions) - Day 9.",
        "SQL Editor > SQL Execution > \"Limit Rows Count\" (default 1000) and \"Auto-commit\".",
        "SQL Editor > \"DBMS connection read timeout interval (in seconds)\" - increase it (e.g. 600) if long queries fail with \"Lost connection to MySQL server during query\".",
        "Fonts & Colors: increase the editor font for projector teaching. Appearance: choose a dark theme on newer versions.",
        "Ctrl+Space shows auto-complete for table and column names; type the first letters and press Enter."
      ]
    },
    {
      heading: "Essential Keyboard Shortcuts (Windows/Linux; use Cmd instead of Ctrl on macOS)",
      content: "Memorise these; they save hours over the course.",
      points: [
        "Ctrl+Shift+Enter: execute all statements (or the selected text).",
        "Ctrl+Enter: execute the current statement (under the cursor).",
        "Ctrl+Alt+X: Explain current statement (Visual Explain).",
        "Ctrl+T: new query tab.  Ctrl+W: close the current tab.",
        "Ctrl+Shift+O: open a .sql script.  Ctrl+S: save script.  Ctrl+Shift+S: save script as.",
        "Ctrl+B: beautify (format) the query.",
        "Ctrl+Space: auto-complete.",
        "Ctrl+/: comment / uncomment the selected lines (adds -- ).",
        "Ctrl+F: find.  Ctrl+H: find and replace.",
        "Ctrl+Z / Ctrl+Y: undo / redo."
      ],
      tip: "Comments in SQL: -- comment (two dashes and a space), # comment, and /* multi-line comment */."
    }
  ],
  examples: [
    {
      title: "Execute All vs Execute Current Statement",
      scenario: "A script has three SELECT statements. Run all of them at once, then run only the middle one.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab (Ctrl+T)",
        "Type the three statements on separate lines",
        "Press Ctrl+Shift+Enter (plain lightning bolt): three tabs appear - Result 1, Result 2, Result 3 - and three green ticks in Action Output",
        "Now click anywhere inside the second statement and press Ctrl+Enter (lightning bolt with cursor): only that statement runs"
      ],
      code: `SELECT 'first' AS statement_no;
SELECT 'second' AS statement_no;
SELECT 'third' AS statement_no;`,
      mysql: `CREATE DATABASE IF NOT EXISTS college;
USE college;
SELECT 'first' AS statement_no;
SELECT 'second' AS statement_no;
SELECT 'third' AS statement_no;`,
      result: `>> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected
>> USE college -> 0 row(s) affected
>> SELECT 'first' AS statement_no
+--------------+
| statement_no |
+--------------+
| first        |
+--------------+
1 row(s) returned
>> SELECT 'second' AS statement_no
+--------------+
| statement_no |
+--------------+
| second       |
+--------------+
1 row(s) returned
>> SELECT 'third' AS statement_no
+--------------+
| statement_no |
+--------------+
| third        |
+--------------+
1 row(s) returned`,
      explanation: "Execute All produced one Result tab per SELECT. Look at the bottom of the window: the Action Output shows the line number, time, the SQL text, \"1 row(s) returned\" and duration for each. With Ctrl+Enter only \"second\" would appear. Selecting text with the mouse and pressing Ctrl+Shift+Enter runs just the selection."
    },
    {
      title: "Select Rows - Limit 1000 from the Navigator",
      scenario: "You want to look at a table without typing a query. Workbench writes the SELECT for you.",
      steps: [
        "Run the setup script (Ctrl+Shift+Enter) so the departments and students tables exist",
        "In the Navigator, Schemas tab, click the refresh icon, expand college > Tables",
        "Hover over students and click the small grid icon on the right (or right-click students > Select Rows - Limit 1000)",
        "A new tab opens with the generated query and the Result Grid",
        "Click a column header (e.g. marks) to sort the grid; type in \"Filter Rows\" to search inside the result"
      ],
      code: `-- Workbench generates a schema-qualified query, e.g. SELECT * FROM college.students;
-- (with backticks around the names). Because college is the default schema, this is the same as:
SELECT * FROM students;`,
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
SELECT * FROM students;`,
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
>> SELECT * FROM students
+------------+------------+-----------+----------------------------+--------+------------+---------+---------+-------+-------+----------------+
| student_id | first_name | last_name | email                      | gender | dob        | city    | dept_id | marks | fees  | admission_date |
+------------+------------+-----------+----------------------------+--------+------------+---------+---------+-------+-------+----------------+
| 1          | Aarav      | Sharma    | aarav.sharma@college.edu   | M      | 2004-03-15 | Pune    | 1       | 88    | 85000 | 2022-07-01     |
| 2          | Diya       | Patel     | diya.patel@college.edu     | F      | 2003-11-02 | Mumbai  | 1       | 92    | 85000 | 2021-07-01     |
| 3          | Rohan      | Verma     | rohan.verma@college.edu    | M      | 2004-07-21 | Delhi   | 2       | 75    | 60000 | 2022-07-01     |
| 4          | Ananya     | Iyer      | ananya.iyer@college.edu    | F      | 2005-01-10 | Chennai | 3       | 81    | 65000 | 2023-07-03     |
| 5          | Kabir      | Singh     | kabir.singh@college.edu    | M      | 2003-09-30 | Delhi   | 4       | 64    | 55000 | 2021-07-01     |
| 6          | Meera      | Nair      | meera.nair@college.edu     | F      | 2004-12-05 | Kochi   | 2       | 95    | 60000 | 2022-07-01     |
| 7          | Vikram     | Rao       | vikram.rao@college.edu     | M      | 2005-04-18 | Pune    | NULL    | NULL  | 50000 | 2023-07-03     |
| 8          | Sneha      | Kulkarni  | sneha.kulkarni@college.edu | F      | 2004-08-25 | Mumbai  | 1       | 58    | 85000 | 2022-07-01     |
| 9          | Arjun      | Mehta     | arjun.mehta@college.edu    | M      | 2003-06-14 | NULL    | 3       | 70    | 65000 | 2021-07-01     |
| 10         | Priya      | Das       | priya.das@college.edu      | F      | 2005-02-28 | Kolkata | 4       | 85    | 55000 | 2023-07-03     |
+------------+------------+-----------+----------------------------+--------+------------+---------+---------+-------+-------+----------------+
10 row(s) returned`,
      explanation: "Workbench generates the schema-qualified name college.students so it works even if another schema is the default; with USE college the short name students is enough (the in-app lab supports only the short form). The \"Limit to 1000 rows\" setting adds LIMIT 0, 1000 silently. Notice NULL values are shown as NULL in a grey cell - Vikram has no department or marks yet, and Arjun has no city."
    },
    {
      title: "Beautify a messy query (Ctrl+B)",
      scenario: "A colleague sent a query typed on one line in lowercase. Format it before reviewing.",
      steps: [
        "In MySQL Workbench: open the Local instance connection and run the setup script",
        "Paste the messy one-line query in a new Query Tab",
        "Click the broom icon (Beautify/reformat the SQL script) or press Ctrl+B",
        "Keywords become UPPERCASE and each clause moves to its own line",
        "Press Ctrl+Enter to run it"
      ],
      code: `-- Before
select first_name,city,marks from students where marks>80 order by marks desc;

-- After Ctrl+B (Beautify)
SELECT
    first_name, city, marks
FROM
    students
WHERE
    marks > 80
ORDER BY marks DESC;`,
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
SELECT
    first_name, city, marks
FROM
    students
WHERE
    marks > 80
ORDER BY marks DESC;`,
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
>> SELECT
+------------+---------+-------+
| first_name | city    | marks |
+------------+---------+-------+
| Meera      | Kochi   | 95    |
| Diya       | Mumbai  | 92    |
| Aarav      | Pune    | 88    |
| Priya      | Kolkata | 85    |
| Ananya     | Chennai | 81    |
+------------+---------+-------+
5 row(s) returned`,
      explanation: "Beautify does not change what the query does, only how it looks. Formatted SQL is easier to read, debug and review. Upper-case keywords are a convention (MySQL itself is not case sensitive for keywords). Edit > Preferences > SQL Editor > \"Use UPPERCASE keywords on completion\" makes auto-complete insert capitals too."
    },
    {
      title: "Reading an error in the Action Output panel",
      scenario: "You misspell a table name. Learn to find and read the error message instead of panicking.",
      steps: [
        "In MySQL Workbench: open the Local instance connection",
        "Run the script with Ctrl+Shift+Enter",
        "In Action Output the third row shows a red circle with Error Code 1146",
        "Right-click the red row > Copy Response to copy the message",
        "Fix the name (student -> students) and run again with Ctrl+Enter"
      ],
      code: `SELECT COUNT(*) AS total FROM student;    -- typo
SELECT COUNT(*) AS total FROM students;   -- fixed`,
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
SELECT COUNT(*) AS total FROM student;
SELECT COUNT(*) AS total FROM students;`,
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
>> SELECT COUNT(*) AS total FROM student -> ERROR: Error Code: 1146. Table 'college.student' doesn't exist
>> SELECT COUNT(*) AS total FROM students
+-------+
| total |
+-------+
| 10    |
+-------+
1 row(s) returned`,
      explanation: "Error Code 1146 \"Table college.student doesn't exist\" tells you exactly what is wrong. By default Workbench continues after an error (\"Stop Script Execution on Errors\" is off), so the corrected second statement still ran and returned 10. Other common codes: 1064 syntax error, 1054 unknown column, 1046 no database selected."
    },
    {
      title: "Saving and reusing a Snippet",
      scenario: "You run \"top students\" very often. Save it as a snippet and insert it with a double-click next time.",
      steps: [
        "Type the query in a Query Tab and select it with the mouse",
        "Click the \"Save current statement or selection to the snippet list\" icon in the query toolbar",
        "In the right sidebar (SQL Additions) open the Snippets tab and choose \"My Snippets\" in the drop-down",
        "Right-click the new snippet > Rename Snippet: \"Top 3 students\"",
        "Open a new tab (Ctrl+T), double-click the snippet (or click \"Insert the snippet text at the current caret position\"), then Ctrl+Enter"
      ],
      code: `SELECT first_name, last_name, marks
FROM students
ORDER BY marks DESC
LIMIT 3;`,
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
SELECT first_name, last_name, marks
FROM students
ORDER BY marks DESC
LIMIT 3;`,
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
>> SELECT first_name, last_name, marks
+------------+-----------+-------+
| first_name | last_name | marks |
+------------+-----------+-------+
| Meera      | Nair      | 95    |
| Diya       | Patel     | 92    |
| Aarav      | Sharma    | 88    |
+------------+-----------+-------+
3 row(s) returned`,
      explanation: "Snippets are stored on your computer by Workbench, not in the database, so they are available in every connection. The built-in categories (SQL DDL Statements, SQL DML Statements) contain templates such as CREATE TABLE and UPDATE that you can insert and fill in."
    }
  ],
  interview: [
    {
      q: "What is the difference between Ctrl+Enter and Ctrl+Shift+Enter in MySQL Workbench?",
      a: "Ctrl+Enter executes only the statement under the cursor. Ctrl+Shift+Enter executes the selected text, or the whole script if nothing is selected.",
      level: "Easy"
    },
    {
      q: "What are the two tabs of the Navigator panel?",
      a: "Administration (server management: Server Status, Users and Privileges, Data Export, Data Import/Restore, Startup/Shutdown, Dashboard...) and Schemas (databases with their tables, views, procedures and functions).",
      level: "Easy"
    },
    {
      q: "Why does the Result Grid sometimes say Read Only?",
      a: "Workbench can only edit results that come from a single table with a primary key (or unique not-null key). Results of JOINs, aggregates, calculated columns or tables without a primary key are read-only.",
      level: "Medium"
    },
    {
      q: "How do you change the default 1000-row limit?",
      a: "Use the \"Limit to 1000 rows\" drop-down in the query toolbar, or Edit > Preferences > SQL Editor > SQL Execution > Limit Rows Count. Choosing Don't Limit removes it.",
      level: "Easy"
    },
    {
      q: "What does the Beautify option do and what is its shortcut?",
      a: "Edit > Format > Beautify Query (Ctrl+B, broom icon) reformats SQL with upper-case keywords and line breaks per clause. It does not change the logic.",
      level: "Easy"
    },
    {
      q: "Where do you see the execution time of a query in Workbench?",
      a: "In the Output panel (Action Output) under the Duration / Fetch column, and in more detail in the Query Stats tab on the right of the result area.",
      level: "Easy"
    },
    {
      q: "How can you get the CREATE TABLE statement of an existing table using Workbench?",
      a: "Right-click the table in the Navigator > Copy to Clipboard > Create Statement, or Send to SQL Editor > Create Statement. In SQL: SHOW CREATE TABLE table_name;",
      level: "Medium"
    },
    {
      q: "What are Snippets in Workbench?",
      a: "Reusable pieces of SQL stored in the SQL Additions sidebar. Workbench ships templates (SQL DDL/DML Statements, DB Mgmt) and you can save your own under My Snippets.",
      level: "Easy"
    },
    {
      q: "You get \"Lost connection to MySQL server during query\" on a long query in Workbench. What can you change?",
      a: "Increase Edit > Preferences > SQL Editor > DBMS connection read timeout interval (default 30 seconds) and possibly the keep-alive interval, then reconnect.",
      level: "Medium"
    },
    {
      q: "What is the difference between Action Output, Text Output and History Output?",
      a: "Action Output lists each executed statement with status, message and duration. Text Output shows results as plain-text tables. History Output keeps a dated log of all statements executed in the session.",
      level: "Medium"
    }
  ],
  practice: [
    {
      task: "Use the Navigator to open the students table with Select Rows - Limit 1000, then write the equivalent SQL yourself showing only first_name and city.",
      hint: "SELECT column list FROM students; (college must be the default schema)",
      solution: `USE college;
SELECT first_name, city FROM students;`
    },
    {
      task: "Type this query on one line and Beautify it with Ctrl+B, then execute: select dept_name,building from departments order by dept_name;",
      hint: "Ctrl+B then Ctrl+Enter.",
      solution: `SELECT
    dept_name, building
FROM
    departments
ORDER BY dept_name;`
    },
    {
      task: "Write a script with two statements: count the students and count the departments. Run each separately with Ctrl+Enter, then both with Ctrl+Shift+Enter, and note how many Result tabs appear.",
      hint: "Two SELECT COUNT(*) statements give two Result tabs.",
      solution: `SELECT COUNT(*) AS total_students FROM students;
SELECT COUNT(*) AS total_departments FROM departments;
-- Ctrl+Shift+Enter shows Result 1 and Result 2`
    },
    {
      task: "Change three Workbench preferences: turn off Safe Updates, set the row limit to 500, and set the read timeout to 600 seconds. Write the menu path for each.",
      hint: "All are under Edit > Preferences > SQL Editor.",
      solution: `Edit > Preferences > SQL Editor > untick "Safe Updates (rejects UPDATEs and DELETEs with no restrictions)"
Edit > Preferences > SQL Editor > SQL Execution > Limit Rows Count = 500
Edit > Preferences > SQL Editor > DBMS connection read timeout interval (in seconds) = 600
Click OK, then Query > Reconnect to Server (needed for Safe Updates to take effect)`
    }
  ],
  quiz: [
    {
      question: "Which shortcut executes only the statement where the cursor is?",
      options: [
        "Ctrl+Shift+Enter",
        "Ctrl+Enter",
        "Ctrl+B",
        "F5"
      ],
      answer: 1,
      explanation: "Ctrl+Enter runs the current statement; Ctrl+Shift+Enter runs all or the selection."
    },
    {
      question: "Where is \"Users and Privileges\" found?",
      options: [
        "Navigator > Schemas tab",
        "SQL Additions > Snippets",
        "Navigator > Administration tab > MANAGEMENT",
        "Result Grid toolbar"
      ],
      answer: 2,
      explanation: "Administration > MANAGEMENT contains Server Status, Client Connections, Users and Privileges, Data Export and Data Import/Restore."
    },
    {
      question: "What does the broom icon in the query toolbar do?",
      options: [
        "Deletes all rows",
        "Clears the Output panel",
        "Drops the schema",
        "Beautifies (formats) the SQL"
      ],
      answer: 3,
      explanation: "Beautify/reformat the SQL script, shortcut Ctrl+B."
    },
    {
      question: "After editing cells in the Result Grid, which button saves the change to the database?",
      options: [
        "Apply",
        "Commit Grid",
        "Save Script",
        "Refresh"
      ],
      answer: 0,
      explanation: "Apply shows the generated UPDATE/INSERT/DELETE in a review dialog and runs it; Revert discards the edits."
    },
    {
      question: "The right sidebar of the SQL Editor that contains Context Help and Snippets is called:",
      options: [
        "Navigator",
        "SQL Additions",
        "Information",
        "Object Info"
      ],
      answer: 1,
      explanation: "SQL Additions has the Context Help and Snippets tabs. The Information panel (Object Info, Session) is under the Navigator."
    }
  ]
};
