export default {
  "id": "mysql-day-27",
  "title": "ER / EER Diagrams in Workbench: Modeling, Forward & Reverse Engineering, Synchronize",
  "module": "Module 6: Design, Administration & Project",
  "day": 27,
  "level": "Intermediate",
  "duration": "2.5 hours",
  "summary": "Design databases visually in MySQL Workbench: ER/EER concepts and crow's-foot notation, creating a model and diagram, placing tables and editing columns, drawing 1:n, identifying and n:m relationships, Forward Engineering a model to the server screen by screen, Reverse Engineering an existing database into a diagram, Synchronize Model and exporting diagrams and scripts.",
  "objectives": [
    "Read and draw ER/EER diagrams with entities, attributes, relationships and cardinality",
    "Create a Workbench model and diagram with tables, keys and relationships",
    "Forward engineer a model to a MySQL server and export the DDL script",
    "Reverse engineer an existing database into an EER diagram",
    "Keep a model and a database in sync with Synchronize Model"
  ],
  "theory": [
    {
      "heading": "1. ER and EER diagrams",
      "content": "An Entity-Relationship (ER) diagram is a picture of a database design: entities (tables) as boxes, attributes (columns) inside them, and relationships as lines between them. MySQL Workbench draws EER (Enhanced ER) diagrams, which add database details: data types, primary keys (key icon), foreign keys (red diamond), NOT NULL (filled diamond), indexes, and crow's-foot notation for cardinality.",
      "points": [
        "Entity = a thing we store data about (Student, Course). In the database it becomes a table.",
        "Attribute = a property (name, credits). It becomes a column. Workbench icons: yellow key = primary key, filled blue diamond = NOT NULL column, empty diamond = nullable, red diamond = foreign key column.",
        "Relationship = how entities are connected; cardinality says how many: 1:1, 1:N (one department has many students), M:N (students take many courses, courses have many students).",
        "Crow's-foot notation: a single bar | means 'one', the crow's foot (three lines) means 'many', a circle O means 'optional (zero)'. |O---< reads 'zero or many'.",
        "The 'Enhanced' in EER adds concepts such as specialization/generalization (a Person can be a Student or a Faculty)."
      ]
    },
    {
      "heading": "2. Modeling in Workbench: the model file and the diagram canvas",
      "content": "A Workbench model is a .mwb file that holds a physical schema (tables, views, routines) and one or more EER diagrams. You design offline - no server needed - and later push the design to MySQL.",
      "points": [
        "Home screen > the Models icon (left sidebar, second icon) > (+) or File > New Model (Ctrl+N). The MySQL Model tab opens with Physical Schemas showing a default schema 'mydb'.",
        "Double-click the 'mydb' tab to rename the schema (e.g. college_erd) and set charset/collation.",
        "Click 'Add Diagram' (icon at the top of the MySQL Model tab) - an empty EER Diagram canvas opens with a vertical toolbar on its left.",
        "Toolbar tools (top to bottom): Select (Esc), Hand (H), Eraser (D), Layer (L), Text/Note (N), Image (I), Place a New Table (T), Place a New View (V), Place a Routine Group (G), then relationship tools: 1:1 Non-Identifying, 1:n Non-Identifying, 1:1 Identifying, 1:n Identifying, n:m Identifying, and 1:n 'Using Existing Columns'.",
        "Right side panels: Catalog Tree (all schema objects), Layers, User Types, History, and Properties of the selected object.",
        "Double-click a table on the canvas to open the Table Editor at the bottom (tabs: Columns, Indexes, Foreign Keys, Triggers, Partitioning, Options, Inserts, Privileges)."
      ]
    },
    {
      "heading": "3. Relationships: identifying vs non-identifying",
      "content": "When you draw a relationship, Workbench automatically adds the foreign key column to the child table.",
      "points": [
        "Non-identifying (dashed line): the child has its OWN primary key; the FK is a normal column. Example: students.dept_id -> departments. Use the 1:n Non-Identifying tool: click the CHILD table (students) first, then the PARENT table (departments).",
        "Identifying (solid line): the FK becomes PART of the child's primary key - the child cannot exist without the parent. Example: order_items(order_id, line_no).",
        "n:m Identifying tool: click students then courses - Workbench creates a junction table 'students_has_courses' with a composite PK (students_student_id, courses_course_id). Rename it to enrollments and add columns like grade.",
        "'1:n Using Existing Columns' (the last tool) lets you pick an existing column as the FK instead of creating a new one - useful when columns are already there.",
        "Double-click a relationship line to edit it: Relationship tab (caption, cardinality, mandatory flags) and Foreign Key tab (ON UPDATE / ON DELETE rules).",
        "Automatically generated column names like departments_dept_id can be changed: Edit > Preferences > Modeling > Relationship/FK naming templates (e.g. %table%_%column%) BEFORE drawing."
      ]
    },
    {
      "heading": "4. Forward Engineering: model -> database",
      "content": "Forward engineering turns your diagram into a real database: Workbench generates the CREATE SCHEMA / CREATE TABLE script and runs it on a server.",
      "points": [
        "Database > Forward Engineer... (Ctrl+G).",
        "Screen 1 'Set Parameters for Connecting to a DBMS': choose the Stored Connection (Local instance MySQL80), check host/port/user > Next (enter the password if asked).",
        "Screen 2 'Set Options for Database to be Created': optional checkboxes - DROP objects before each CREATE object, Generate DROP SCHEMA, Skip creation of FOREIGN KEYS, Skip creation of FK Indexes as well, Omit schema qualifier in object names, Generate separate CREATE INDEX statements, Add SHOW WARNINGS after every DDL statement, Do not create users, Generate INSERT statements for tables, Disable FK checks for INSERTs > Next.",
        "Screen 3 'Select Objects to Forward Engineer': tick Export MySQL Table Objects (Show Filter lets you choose individual tables), Views, Routines, Triggers, Users > Next.",
        "Screen 4 'Review the SQL Script to be Executed': read the generated script; buttons Save to Other File... and Copy to Clipboard > Next.",
        "Screen 5 'Commit Progress': Connect to DBMS, Execute forward-engineered script, Read back changes made by server, Save synchronization state - all ticked green > Close. Refresh SCHEMAS in the Navigator to see the new schema.",
        "No server? File > Export > Forward Engineer SQL CREATE Script... (Ctrl+Shift+G) saves the same script to a .sql file."
      ]
    },
    {
      "heading": "5. Reverse Engineering and Synchronize Model",
      "content": "Reverse engineering draws a diagram from an existing database - the fastest way to understand a database you did not design. Synchronize keeps model and database in step afterwards.",
      "points": [
        "Database > Reverse Engineer... (Ctrl+R).",
        "Screen 1 'Set Parameters for Connecting to a DBMS' > Next. Screen 2 'Connect to DBMS and Fetch Information': Workbench connects and retrieves the schema list > Next.",
        "Screen 3 'Select Schemas to Reverse Engineer': tick college (one or more) > Next. Screen 4 'Retrieve and Reverse Engineer Schema Objects': progress, all green > Next.",
        "Screen 5 'Select Objects to Reverse Engineer': Import MySQL Table Objects / View Objects / Routine Objects, and keep 'Place imported objects on a diagram' ticked > Execute.",
        "Screen 6 'Reverse Engineering Progress' > Next > Screen 7 'Reverse Engineering Results' (summary: n tables, n views) > Close. The diagram opens; use Arrange > Auto-Layout to tidy it.",
        "Relationships are drawn only where FOREIGN KEY constraints exist - tables 'linked' only by naming conventions appear unconnected.",
        "Database > Synchronize Model... (Ctrl+Shift+Z): compares model and live schema, shows differences per object with arrows (Update Model, Update Source, Ignore), then generates ALTER statements. Database > Compare Schemas... produces a diff report.",
        "Typical workflow: reverse engineer production -> change the model -> Synchronize -> review the ALTER script -> Execute."
      ]
    },
    {
      "heading": "6. Tips: saving, exporting and printing diagrams",
      "content": "Diagrams are documentation - keep them current and share them.",
      "points": [
        "File > Save Model (Ctrl+S) saves the .mwb file (put it in version control with your SQL).",
        "File > Export > Export as PNG / SVG / PDF / Single Page PDF / PostScript for documents and presentations.",
        "File > Print / Page Setup to print large diagrams across pages; Model > Diagram Properties and Size sets the canvas size.",
        "Arrange > Auto-Layout, Align, Bring to Front; Layers (L) group related tables with a coloured background (e.g. 'Academics', 'Finance').",
        "Model > Object Notation (Workbench Default, Workbench Simplified, Classic, IDEF1X) and Model > Relationship Notation (Crow's Foot, Classic, UML, IDEF1X, Connect to Columns).",
        "Model > Model Options > uncheck 'Use defaults from global settings' to change naming per model.",
        "Use 'Inserts' tab in the Table Editor to store seed data that is generated as INSERTs during forward engineering."
      ],
      "tip": "Lab note: drawing diagrams needs the real MySQL Workbench. The Lab scripts in this lesson run the SQL that Workbench generates or reads, so you can still test the resulting database."
    }
  ],
  "examples": [
    {
      "title": "Create a new EER model and design the tables",
      "scenario": "Design the college database visually: departments, students and courses, with columns, data types, keys and NOT NULL flags.",
      "steps": [
        "Open MySQL Workbench; on the Home screen click the Models icon (left sidebar) or choose File > New Model (Ctrl+N)",
        "In the MySQL Model tab, double-click the 'mydb' schema tab; in the editor below change Name to college_erd, Charset utf8mb4, Collation utf8mb4_0900_ai_ci; close the editor",
        "Click 'Add Diagram' (top of the MySQL Model tab) - the EER Diagram canvas opens",
        "Click the 'Place a New Table' tool (or press T), then click on the canvas - table1 appears",
        "Double-click table1: in the Table Editor set Table Name = departments",
        "Columns tab: rename idtable1 to dept_id (INT, PK, NN, AI ticked); click the next empty row and add dept_name VARCHAR(50) with NN and UQ ticked; add location VARCHAR(50)",
        "Repeat for students (student_id INT PK NN AI, name VARCHAR(50) NN, email VARCHAR(80) UQ) and courses (course_id INT PK NN, course_name VARCHAR(60) NN, credits INT NN Default 3)",
        "File > Save Model As... college_erd.mwb"
      ],
      "code": "-- What the three boxes on the canvas mean (before relationships are drawn)\nCREATE TABLE departments (\n  dept_id   INT NOT NULL AUTO_INCREMENT,   -- PK + NN + AI ticked\n  dept_name VARCHAR(50) NOT NULL,          -- NN + UQ ticked\n  location  VARCHAR(50) NULL,\n  PRIMARY KEY (dept_id),\n  UNIQUE INDEX dept_name_UNIQUE (dept_name)\n);\nCREATE TABLE students (\n  student_id INT NOT NULL AUTO_INCREMENT,\n  name  VARCHAR(50) NOT NULL,\n  email VARCHAR(80) NULL,\n  PRIMARY KEY (student_id),\n  UNIQUE INDEX email_UNIQUE (email)\n);\nCREATE TABLE courses (\n  course_id   INT NOT NULL,\n  course_name VARCHAR(60) NOT NULL,\n  credits     INT NOT NULL DEFAULT 3,\n  PRIMARY KEY (course_id)\n);",
      "result": "EER Diagram canvas (Workbench Default notation):\n+------------------------+   +------------------------+   +------------------------+\n| departments            |   | students               |   | courses                |\n|  [key] dept_id INT     |   |  [key] student_id INT  |   |  [key] course_id INT   |\n|  [#] dept_name VARCHAR |   |  [#] name VARCHAR(50)  |   |  [#] course_name ...   |\n|  [ ] location VARCHAR  |   |  [ ] email VARCHAR(80) |   |  [#] credits INT       |\n|  Indexes: PRIMARY,     |   |  Indexes: PRIMARY,     |   |  Indexes: PRIMARY      |\n|   dept_name_UNIQUE     |   |   email_UNIQUE         |   |                        |\n+------------------------+   +------------------------+   +------------------------+\n[key] = primary key   [#] = NOT NULL (filled diamond)   [ ] = nullable (empty diamond)",
      "explanation": "Each table box shows a yellow key for the primary key, filled diamonds for NOT NULL columns and empty diamonds for nullable ones. Ticking UQ makes Workbench create an index named <column>_UNIQUE. Nothing exists on the server yet - the design lives only in the .mwb file until you forward engineer it (Example 3)."
    },
    {
      "title": "Draw 1:n and n:m relationships",
      "scenario": "Connect the tables: one department has many students (optional), one department offers many courses (mandatory), and students and courses are many-to-many through enrollments.",
      "steps": [
        "In the EER diagram toolbar choose '1:n Non-Identifying Relationship' (dashed line icon)",
        "Click students (the MANY / child side) first, then departments (the ONE / parent side) - Workbench adds departments_dept_id to students as a red-diamond FK column",
        "Double-click the new relationship line > Foreign Key tab: rename the column to dept_id in the table editor, set On Delete = SET NULL, On Update = CASCADE; Relationship tab: untick 'Mandatory' on the students side so a student may have no department",
        "Repeat with courses -> departments (keep Mandatory ticked, so dept_id is NOT NULL)",
        "Choose the 'n:m Identifying Relationship' tool, click students then courses - a new table students_has_courses appears",
        "Double-click it: rename to enrollments, rename the columns to student_id and course_id, add grade CHAR(1)",
        "Hover over a line: the related columns are highlighted. Model > Relationship Notation > Crow's Foot to show cardinality symbols"
      ],
      "code": "-- Columns and keys that the drawn relationships add:\nALTER TABLE students ADD COLUMN dept_id INT NULL,\n  ADD INDEX fk_students_departments_idx (dept_id),\n  ADD CONSTRAINT fk_students_departments FOREIGN KEY (dept_id)\n      REFERENCES departments (dept_id) ON DELETE SET NULL ON UPDATE CASCADE;\n\nALTER TABLE courses ADD COLUMN dept_id INT NOT NULL,\n  ADD CONSTRAINT fk_courses_departments FOREIGN KEY (dept_id) REFERENCES departments (dept_id);\n\n-- n:m junction table (identifying: FKs form the primary key)\nCREATE TABLE enrollments (\n  student_id INT NOT NULL,\n  course_id  INT NOT NULL,\n  grade CHAR(1) NULL,\n  PRIMARY KEY (student_id, course_id),\n  CONSTRAINT fk_enrollments_students FOREIGN KEY (student_id) REFERENCES students (student_id),\n  CONSTRAINT fk_enrollments_courses  FOREIGN KEY (course_id)  REFERENCES courses (course_id)\n);\nDESCRIBE enrollments;\nDESCRIBE students;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college_erd;\nUSE college_erd;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT NOT NULL AUTO_INCREMENT,\n  dept_name VARCHAR(50) NOT NULL,\n  location VARCHAR(50) NULL,\n  PRIMARY KEY (dept_id),\n  UNIQUE KEY dept_name_UNIQUE (dept_name)\n) ENGINE = InnoDB;\nCREATE TABLE students (\n  student_id INT NOT NULL AUTO_INCREMENT,\n  name VARCHAR(50) NOT NULL,\n  email VARCHAR(80) NULL,\n  dept_id INT NULL,\n  PRIMARY KEY (student_id),\n  UNIQUE KEY email_UNIQUE (email),\n  KEY fk_students_departments_idx (dept_id),\n  CONSTRAINT fk_students_departments FOREIGN KEY (dept_id) REFERENCES departments (dept_id)\n    ON DELETE SET NULL ON UPDATE CASCADE\n) ENGINE = InnoDB;\nCREATE TABLE courses (\n  course_id INT NOT NULL,\n  course_name VARCHAR(60) NOT NULL,\n  credits INT NOT NULL DEFAULT 3,\n  dept_id INT NOT NULL,\n  PRIMARY KEY (course_id),\n  KEY fk_courses_departments_idx (dept_id),\n  CONSTRAINT fk_courses_departments FOREIGN KEY (dept_id) REFERENCES departments (dept_id)\n) ENGINE = InnoDB;\nCREATE TABLE enrollments (\n  student_id INT NOT NULL,\n  course_id INT NOT NULL,\n  grade CHAR(1) NULL,\n  PRIMARY KEY (student_id, course_id),\n  KEY fk_enrollments_courses_idx (course_id),\n  CONSTRAINT fk_enrollments_students FOREIGN KEY (student_id) REFERENCES students (student_id),\n  CONSTRAINT fk_enrollments_courses FOREIGN KEY (course_id) REFERENCES courses (course_id)\n) ENGINE = InnoDB;\nDESCRIBE enrollments;\nDESCRIBE students;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college_erd -> 1 row(s) affected\n>> USE college_erd -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> CREATE TABLE courses ( -> 0 row(s) affected\n>> CREATE TABLE enrollments ( -> 0 row(s) affected\n>> DESCRIBE enrollments\n+------------+---------+------+-----+---------+-------+\n| Field      | Type    | Null | Key | Default | Extra |\n+------------+---------+------+-----+---------+-------+\n| student_id | int     | NO   | PRI | NULL    |       |\n| course_id  | int     | NO   | PRI | NULL    |       |\n| grade      | char(1) | YES  |     | NULL    |       |\n+------------+---------+------+-----+---------+-------+\n3 row(s) returned\n>> DESCRIBE students\n+------------+-------------+------+-----+---------+----------------+\n| Field      | Type        | Null | Key | Default | Extra          |\n+------------+-------------+------+-----+---------+----------------+\n| student_id | integer     | NO   | PRI | NULL    | auto_increment |\n| name       | varchar(50) | NO   |     | NULL    |                |\n| email      | varchar(80) | YES  | UNI | NULL    |                |\n| dept_id    | int         | YES  | MUL | NULL    |                |\n+------------+-------------+------+-----+---------+----------------+\n4 row(s) returned",
      "explanation": "The Lab script creates the final tables exactly as the diagram defines them and DESCRIBE shows the result (MUL in the Key column marks the indexed foreign key students.dept_id): enrollments has a composite primary key made from the two foreign keys (that is what 'identifying' means - an enrollment cannot exist without its student and course). students.dept_id is nullable (optional relationship, shown as |O< in crow's foot), while courses.dept_id is NOT NULL (mandatory, ||<)."
    },
    {
      "title": "Forward Engineer the model to the MySQL server",
      "scenario": "Create the college_erd database on your local server directly from the diagram and verify it.",
      "steps": [
        "With the model open: Database > Forward Engineer... (Ctrl+G)",
        "Set Parameters for Connecting to a DBMS: Stored Connection = Local instance MySQL80 > Next; type the root password if prompted",
        "Set Options for Database to be Created: tick 'DROP objects before each CREATE object' and 'Generate DROP SCHEMA' (handy while you are still designing) > Next",
        "Select Objects to Forward Engineer: Export MySQL Table Objects is ticked (4 objects) > Next",
        "Review the SQL Script to be Executed: scroll through the script (you can Save to Other File... or Copy to Clipboard) > Next",
        "Commit Progress: Connect to DBMS / Execute forward engineered script / Read back changes made by server / Save synchronization state all turn green > Close",
        "Navigator > SCHEMAS > click refresh: college_erd appears with 4 tables"
      ],
      "code": "-- Header and part of the script generated by Forward Engineer:\n-- MySQL Workbench Forward Engineering\nSET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;\nSET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;\nSET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';\n\nDROP SCHEMA IF EXISTS `college_erd` ;\nCREATE SCHEMA IF NOT EXISTS `college_erd` DEFAULT CHARACTER SET utf8mb4 ;\nUSE `college_erd` ;\n\nDROP TABLE IF EXISTS `college_erd`.`departments` ;\nCREATE TABLE IF NOT EXISTS `college_erd`.`departments` (\n  `dept_id` INT NOT NULL AUTO_INCREMENT,\n  `dept_name` VARCHAR(50) NOT NULL,\n  `location` VARCHAR(50) NULL,\n  PRIMARY KEY (`dept_id`),\n  UNIQUE INDEX `dept_name_UNIQUE` (`dept_name` ASC) VISIBLE)\nENGINE = InnoDB;\n-- ... students, courses, enrollments ...\n\nSET SQL_MODE=@OLD_SQL_MODE;\nSET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;\nSET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;\n\n-- Verify after Close:\nSHOW TABLES;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college_erd;\nUSE college_erd;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT NOT NULL AUTO_INCREMENT,\n  dept_name VARCHAR(50) NOT NULL,\n  location VARCHAR(50) NULL,\n  PRIMARY KEY (dept_id),\n  UNIQUE KEY dept_name_UNIQUE (dept_name)\n) ENGINE = InnoDB;\nCREATE TABLE students (\n  student_id INT NOT NULL AUTO_INCREMENT,\n  name VARCHAR(50) NOT NULL,\n  email VARCHAR(80) NULL,\n  dept_id INT NULL,\n  PRIMARY KEY (student_id),\n  UNIQUE KEY email_UNIQUE (email),\n  KEY fk_students_departments_idx (dept_id),\n  CONSTRAINT fk_students_departments FOREIGN KEY (dept_id) REFERENCES departments (dept_id)\n    ON DELETE SET NULL ON UPDATE CASCADE\n) ENGINE = InnoDB;\nCREATE TABLE courses (\n  course_id INT NOT NULL,\n  course_name VARCHAR(60) NOT NULL,\n  credits INT NOT NULL DEFAULT 3,\n  dept_id INT NOT NULL,\n  PRIMARY KEY (course_id),\n  KEY fk_courses_departments_idx (dept_id),\n  CONSTRAINT fk_courses_departments FOREIGN KEY (dept_id) REFERENCES departments (dept_id)\n) ENGINE = InnoDB;\nCREATE TABLE enrollments (\n  student_id INT NOT NULL,\n  course_id INT NOT NULL,\n  grade CHAR(1) NULL,\n  PRIMARY KEY (student_id, course_id),\n  KEY fk_enrollments_courses_idx (course_id),\n  CONSTRAINT fk_enrollments_students FOREIGN KEY (student_id) REFERENCES students (student_id),\n  CONSTRAINT fk_enrollments_courses FOREIGN KEY (course_id) REFERENCES courses (course_id)\n) ENGINE = InnoDB;\nSHOW TABLES;\nINSERT INTO departments (dept_name, location) VALUES ('Computer Science','Block A'),('Electronics','Block B');\nINSERT INTO courses VALUES (101,'Database Systems',4,1),(103,'Digital Electronics',4,2);\nINSERT INTO courses VALUES (999,'Ghost Course',3,77);\nSELECT c.course_name, d.dept_name FROM courses c JOIN departments d ON d.dept_id = c.dept_id;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college_erd -> 1 row(s) affected\n>> USE college_erd -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> CREATE TABLE courses ( -> 0 row(s) affected\n>> CREATE TABLE enrollments ( -> 0 row(s) affected\n>> SHOW TABLES\n+-----------------------+\n| Tables_in_college_erd |\n+-----------------------+\n| courses               |\n| departments           |\n| enrollments           |\n| students              |\n+-----------------------+\n4 row(s) returned\n>> INSERT INTO departments (dept_name, location) VALUES ('Computer Scienc -> 2 row(s) affected Records: 2  Duplicates: 0  Warnings: 0\n>> INSERT INTO courses VALUES (101,'Database Systems',4,1),(103,'Digital  -> 2 row(s) affected Records: 2  Duplicates: 0  Warnings: 0\n>> INSERT INTO courses VALUES (999,'Ghost Course',3,77) -> ERROR: Error Code: 1452. Cannot add or update a child row: a foreign key constraint fails\n>> SELECT c.course_name, d.dept_name FROM courses c JOIN departments d ON\n+---------------------+------------------+\n| course_name         | dept_name        |\n+---------------------+------------------+\n| Database Systems    | Computer Science |\n| Digital Electronics | Electronics      |\n+---------------------+------------------+\n2 row(s) returned",
      "explanation": "Workbench wraps the script in SET statements that temporarily disable unique and foreign-key checks, so tables can be created in any order, and restores them at the end. Every name is schema-qualified and back-quoted. The Lab script runs the same DDL (without the session-variable lines) and inserts sample rows to prove the foreign keys work: a course for a non-existent department is rejected."
    },
    {
      "title": "Reverse Engineer an existing database into a diagram",
      "scenario": "You join a project and receive an existing college database with no documentation. Generate its EER diagram.",
      "steps": [
        "Make sure the database exists on the server (the Lab script below creates it)",
        "Database > Reverse Engineer... (Ctrl+R)",
        "Set Parameters for Connecting to a DBMS: Local instance > Next; Connect to DBMS and Fetch Information: wait for green ticks > Next",
        "Select Schemas to Reverse Engineer: tick college_erd > Next; Retrieve and Reverse Engineer Schema Objects: green ticks > Next",
        "Select Objects to Reverse Engineer: Import MySQL Table Objects (4), keep 'Place imported objects on a diagram' ticked > Execute",
        "Reverse Engineering Progress > Next; Reverse Engineering Results shows the summary > Close",
        "The EER diagram opens with 4 tables and 4 relationship lines; use Arrange > Auto-Layout and File > Save Model As... college_reverse.mwb"
      ],
      "code": "-- Workbench reads the catalog, e.g. the list of tables and each table's DDL:\nSHOW FULL TABLES;\nSHOW CREATE TABLE enrollments;\n-- Relationships are drawn from FOREIGN KEY constraints:\nSELECT table_name, column_name, referenced_table_name, referenced_column_name\nFROM information_schema.KEY_COLUMN_USAGE\nWHERE table_schema = 'college_erd' AND referenced_table_name IS NOT NULL;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college_erd;\nUSE college_erd;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT NOT NULL AUTO_INCREMENT,\n  dept_name VARCHAR(50) NOT NULL,\n  location VARCHAR(50) NULL,\n  PRIMARY KEY (dept_id),\n  UNIQUE KEY dept_name_UNIQUE (dept_name)\n) ENGINE = InnoDB;\nCREATE TABLE students (\n  student_id INT NOT NULL AUTO_INCREMENT,\n  name VARCHAR(50) NOT NULL,\n  email VARCHAR(80) NULL,\n  dept_id INT NULL,\n  PRIMARY KEY (student_id),\n  UNIQUE KEY email_UNIQUE (email),\n  KEY fk_students_departments_idx (dept_id),\n  CONSTRAINT fk_students_departments FOREIGN KEY (dept_id) REFERENCES departments (dept_id)\n    ON DELETE SET NULL ON UPDATE CASCADE\n) ENGINE = InnoDB;\nCREATE TABLE courses (\n  course_id INT NOT NULL,\n  course_name VARCHAR(60) NOT NULL,\n  credits INT NOT NULL DEFAULT 3,\n  dept_id INT NOT NULL,\n  PRIMARY KEY (course_id),\n  KEY fk_courses_departments_idx (dept_id),\n  CONSTRAINT fk_courses_departments FOREIGN KEY (dept_id) REFERENCES departments (dept_id)\n) ENGINE = InnoDB;\nCREATE TABLE enrollments (\n  student_id INT NOT NULL,\n  course_id INT NOT NULL,\n  grade CHAR(1) NULL,\n  PRIMARY KEY (student_id, course_id),\n  KEY fk_enrollments_courses_idx (course_id),\n  CONSTRAINT fk_enrollments_students FOREIGN KEY (student_id) REFERENCES students (student_id),\n  CONSTRAINT fk_enrollments_courses FOREIGN KEY (course_id) REFERENCES courses (course_id)\n) ENGINE = InnoDB;\nSHOW FULL TABLES;\nDESCRIBE courses;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college_erd -> 1 row(s) affected\n>> USE college_erd -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> CREATE TABLE courses ( -> 0 row(s) affected\n>> CREATE TABLE enrollments ( -> 0 row(s) affected\n>> SHOW FULL TABLES\n+-----------------------+------------+\n| Tables_in_college_erd | Table_type |\n+-----------------------+------------+\n| courses               | BASE TABLE |\n| departments           | BASE TABLE |\n| enrollments           | BASE TABLE |\n| students              | BASE TABLE |\n+-----------------------+------------+\n4 row(s) returned\n>> DESCRIBE courses\n+-------------+-------------+------+-----+---------+-------+\n| Field       | Type        | Null | Key | Default | Extra |\n+-------------+-------------+------+-----+---------+-------+\n| course_id   | int         | NO   | PRI | NULL    |       |\n| course_name | varchar(60) | NO   |     | NULL    |       |\n| credits     | int         | NO   |     | 3       |       |\n| dept_id     | int         | NO   | MUL | NULL    |       |\n+-------------+-------------+------+-----+---------+-------+\n4 row(s) returned",
      "explanation": "Reverse engineering reads the server's catalog (information_schema / SHOW CREATE TABLE). Each FOREIGN KEY becomes a relationship line; the composite PK of enrollments made of FKs is shown as identifying (solid lines). Tables that are related only by column names, without FOREIGN KEY constraints, appear on the diagram without lines - a good reason to always declare foreign keys. The Lab can run the SHOW statements; information_schema queries need real MySQL."
    },
    {
      "title": "Change the model and Synchronize it with the database",
      "scenario": "The college wants to store a phone number for each student and a semester for each enrollment. Change the diagram and push only the differences to the server.",
      "steps": [
        "Open college_erd.mwb, double-click students on the diagram, add column phone VARCHAR(15) after email",
        "Double-click enrollments and add semester TINYINT NOT NULL DEFAULT 1",
        "Database > Synchronize Model... (Ctrl+Shift+Z) > choose the Local instance connection > Next",
        "Select Schemas: college_erd (model) <-> college_erd (source) > Next; Workbench fetches the server objects",
        "Choose where to apply changes: the tree lists students and enrollments with an arrow 'Update Source' (model -> database); click an object to see its difference; you can switch the arrow to 'Update Model' or 'Ignore'",
        "Next: review the generated ALTER script > Execute > Close",
        "Run DESCRIBE students; to confirm"
      ],
      "code": "-- Script generated by Synchronize Model (only the differences):\nALTER TABLE `college_erd`.`students`\nADD COLUMN `phone` VARCHAR(15) NULL AFTER `email`;\n\nALTER TABLE `college_erd`.`enrollments`\nADD COLUMN `semester` TINYINT NOT NULL DEFAULT 1 AFTER `grade`;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college_erd;\nUSE college_erd;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT NOT NULL AUTO_INCREMENT,\n  dept_name VARCHAR(50) NOT NULL,\n  location VARCHAR(50) NULL,\n  PRIMARY KEY (dept_id),\n  UNIQUE KEY dept_name_UNIQUE (dept_name)\n) ENGINE = InnoDB;\nCREATE TABLE students (\n  student_id INT NOT NULL AUTO_INCREMENT,\n  name VARCHAR(50) NOT NULL,\n  email VARCHAR(80) NULL,\n  dept_id INT NULL,\n  PRIMARY KEY (student_id),\n  UNIQUE KEY email_UNIQUE (email),\n  KEY fk_students_departments_idx (dept_id),\n  CONSTRAINT fk_students_departments FOREIGN KEY (dept_id) REFERENCES departments (dept_id)\n    ON DELETE SET NULL ON UPDATE CASCADE\n) ENGINE = InnoDB;\nCREATE TABLE courses (\n  course_id INT NOT NULL,\n  course_name VARCHAR(60) NOT NULL,\n  credits INT NOT NULL DEFAULT 3,\n  dept_id INT NOT NULL,\n  PRIMARY KEY (course_id),\n  KEY fk_courses_departments_idx (dept_id),\n  CONSTRAINT fk_courses_departments FOREIGN KEY (dept_id) REFERENCES departments (dept_id)\n) ENGINE = InnoDB;\nCREATE TABLE enrollments (\n  student_id INT NOT NULL,\n  course_id INT NOT NULL,\n  grade CHAR(1) NULL,\n  PRIMARY KEY (student_id, course_id),\n  KEY fk_enrollments_courses_idx (course_id),\n  CONSTRAINT fk_enrollments_students FOREIGN KEY (student_id) REFERENCES students (student_id),\n  CONSTRAINT fk_enrollments_courses FOREIGN KEY (course_id) REFERENCES courses (course_id)\n) ENGINE = InnoDB;\nALTER TABLE students ADD COLUMN phone VARCHAR(15) NULL;\nALTER TABLE enrollments ADD COLUMN semester TINYINT NOT NULL DEFAULT 1;\nDESCRIBE students;\nDESCRIBE enrollments;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college_erd -> 1 row(s) affected\n>> USE college_erd -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> CREATE TABLE courses ( -> 0 row(s) affected\n>> CREATE TABLE enrollments ( -> 0 row(s) affected\n>> ALTER TABLE students ADD COLUMN phone VARCHAR(15) NULL -> 0 row(s) affected\n>> ALTER TABLE enrollments ADD COLUMN semester TINYINT NOT NULL DEFAULT 1 -> 0 row(s) affected\n>> DESCRIBE students\n+------------+-------------+------+-----+---------+----------------+\n| Field      | Type        | Null | Key | Default | Extra          |\n+------------+-------------+------+-----+---------+----------------+\n| student_id | integer     | NO   | PRI | NULL    | auto_increment |\n| name       | varchar(50) | NO   |     | NULL    |                |\n| email      | varchar(80) | YES  | UNI | NULL    |                |\n| dept_id    | int         | YES  | MUL | NULL    |                |\n| phone      | varchar(15) | YES  |     | NULL    |                |\n+------------+-------------+------+-----+---------+----------------+\n5 row(s) returned\n>> DESCRIBE enrollments\n+------------+---------+------+-----+---------+-------+\n| Field      | Type    | Null | Key | Default | Extra |\n+------------+---------+------+-----+---------+-------+\n| student_id | int     | NO   | PRI | NULL    |       |\n| course_id  | int     | NO   | PRI | NULL    |       |\n| grade      | char(1) | YES  |     | NULL    |       |\n| semester   | tinyint | NO   |     | 1       |       |\n+------------+---------+------+-----+---------+-------+\n4 row(s) returned",
      "explanation": "Synchronize compares the model with the live schema and generates only ALTER statements for the differences - existing data is kept. The Lab version adds the columns at the end (the Lab does not support AFTER); DESCRIBE then shows phone and semester. Use Update Model instead when someone changed the database directly and you want the diagram to catch up."
    },
    {
      "title": "Export the diagram and the SQL script for documentation",
      "scenario": "Share the design with your team: an image for the project report and a .sql script for developers, without connecting to a server.",
      "steps": [
        "File > Export > Export as PNG... > choose college_erd.png > Save (also SVG, PDF, Single Page PDF, PostScript)",
        "File > Export > Forward Engineer SQL CREATE Script... (Ctrl+Shift+G)",
        "Output SQL Script File: browse to college_erd.sql; tick 'Generate INSERT Statements for Tables' if you entered seed data in the Inserts tab > Next",
        "SQL Object Export Filter: tick Export MySQL Table Objects > Next",
        "Review the generated script > Finish - the .sql file is written",
        "File > Save Model (Ctrl+S) to save the .mwb; commit both .mwb and .sql to version control"
      ],
      "code": "-- Run the exported script later in any SQL tab:\n-- File > Open SQL Script... > college_erd.sql > Execute (Ctrl+Shift+Enter)\n-- or from the command line:\nmysql -u root -p < college_erd.sql",
      "result": "Export to PNG: college_erd.png written (diagram 1 of 1)\nForward Engineer SQL CREATE Script: Finished - SQL script saved to college_erd.sql\nContents start with:\n-- MySQL Script generated by MySQL Workbench\n-- Model: New Model    Version: 1.0\n-- MySQL Workbench Forward Engineering",
      "explanation": "The PNG/PDF is for humans (reports, presentations, onboarding). The exported .sql file contains the same script as Forward Engineer and can be run on any server without Workbench. Keeping the .mwb file in version control lets the team review design changes."
    }
  ],
  "interview": [
    {
      "q": "What is an ER diagram?",
      "a": "A visual model of a database showing entities (tables), their attributes (columns) and the relationships between them with cardinality.",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between ER and EER?",
      "a": "EER (Enhanced ER) adds concepts like specialization/generalization, subclasses, categories and inheritance. In MySQL Workbench 'EER diagram' also means the physical diagram with data types, keys and indexes.",
      "level": "Beginner"
    },
    {
      "q": "What do the symbols in crow's-foot notation mean?",
      "a": "A bar | = one, a crow's foot = many, a circle O = zero/optional. |O< = zero or many, || = exactly one, |< = one or many.",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between an identifying and a non-identifying relationship?",
      "a": "Identifying: the parent's key becomes part of the child's primary key (solid line); the child depends on the parent for identity. Non-identifying: the FK is an ordinary column, the child has its own PK (dashed line).",
      "level": "Intermediate"
    },
    {
      "q": "How do you implement a many-to-many relationship?",
      "a": "With a junction (associative) table holding foreign keys to both tables, typically with a composite primary key; Workbench's n:m tool creates it automatically.",
      "level": "Beginner"
    },
    {
      "q": "What is forward engineering?",
      "a": "Generating and executing SQL DDL from a model to create the database objects on a server (Database > Forward Engineer, Ctrl+G).",
      "level": "Beginner"
    },
    {
      "q": "What is reverse engineering?",
      "a": "Building a model/diagram from an existing database by reading its catalog (Database > Reverse Engineer, Ctrl+R).",
      "level": "Beginner"
    },
    {
      "q": "What does Synchronize Model do?",
      "a": "Compares a model with a live schema and generates ALTER statements to make one match the other, in either direction, keeping existing data.",
      "level": "Intermediate"
    },
    {
      "q": "Why might reverse engineering show tables with no relationship lines?",
      "a": "The tables have no FOREIGN KEY constraints (e.g. MyISAM tables or FKs never declared); Workbench draws lines only from real FK constraints.",
      "level": "Intermediate"
    },
    {
      "q": "What is cardinality vs optionality (modality)?",
      "a": "Cardinality is the maximum number of related rows (one or many); optionality is the minimum (zero = optional, one = mandatory). In SQL optional FKs are nullable, mandatory ones NOT NULL.",
      "level": "Intermediate"
    },
    {
      "q": "Where are Workbench models stored?",
      "a": "In .mwb files (a zipped XML document) - separate from the database; you can design offline and share/version them.",
      "level": "Beginner"
    },
    {
      "q": "How do you export a diagram as an image?",
      "a": "File > Export > Export as PNG/SVG/PDF.",
      "level": "Beginner"
    }
  ],
  "practice": [
    {
      "task": "Design (on paper or in Workbench) an EER model for a library: books, authors (a book can have many authors), members and loans. Write the forward-engineered DDL.",
      "hint": "authors <-> books is M:N (book_authors); members 1:N loans; books 1:N loans.",
      "solution": "CREATE TABLE authors (author_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80) NOT NULL);\nCREATE TABLE books (book_id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(120) NOT NULL, isbn VARCHAR(13) UNIQUE);\nCREATE TABLE book_authors (\n  book_id INT NOT NULL, author_id INT NOT NULL,\n  PRIMARY KEY (book_id, author_id),\n  FOREIGN KEY (book_id) REFERENCES books(book_id),\n  FOREIGN KEY (author_id) REFERENCES authors(author_id));\nCREATE TABLE members (member_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80) NOT NULL);\nCREATE TABLE loans (\n  loan_id INT AUTO_INCREMENT PRIMARY KEY,\n  book_id INT NOT NULL, member_id INT NOT NULL,\n  loan_date DATE NOT NULL, return_date DATE,\n  FOREIGN KEY (book_id) REFERENCES books(book_id),\n  FOREIGN KEY (member_id) REFERENCES members(member_id));"
    },
    {
      "task": "Reverse engineer the ecommerce database (customers, products, orders, order_items, payments) and list every relationship with its cardinality.",
      "hint": "Database > Reverse Engineer; read each FK.",
      "solution": "-- customers 1 --< orders        (orders.customer_id NOT NULL: mandatory)\n-- orders    1 --< order_items   (order_items.order_id)\n-- products  1 --< order_items   (order_items.product_id)\n-- orders    1 --< payments      (payments.order_id)\n-- products >--< orders is M:N resolved by order_items"
    },
    {
      "task": "In the model, add a faculty table with a self-relationship (manager_id -> faculty_id) and forward engineer it.",
      "hint": "Use the 1:n Non-Identifying tool, clicking faculty twice.",
      "solution": "CREATE TABLE faculty (\n  faculty_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  manager_id INT NULL,\n  CONSTRAINT fk_faculty_manager FOREIGN KEY (manager_id) REFERENCES faculty (faculty_id)\n);"
    },
    {
      "task": "Write the ALTER statement that Synchronize Model would generate if you renamed students.name to full_name in the model.",
      "hint": "RENAME COLUMN or CHANGE.",
      "solution": "ALTER TABLE `college_erd`.`students`\nCHANGE COLUMN `name` `full_name` VARCHAR(50) NOT NULL;"
    },
    {
      "task": "Export your model as PDF and as a SQL script; list the menu paths.",
      "hint": "File > Export.",
      "solution": "-- File > Export > Export as Single Page PDF...\n-- File > Export > Forward Engineer SQL CREATE Script... (Ctrl+Shift+G)"
    }
  ],
  "quiz": [
    {
      "question": "Which menu creates database tables from an EER model?",
      "options": [
        "Database > Reverse Engineer",
        "Database > Forward Engineer",
        "File > Import",
        "Server > Data Import"
      ],
      "answer": 1,
      "explanation": "Forward Engineer (Ctrl+G) generates and runs the DDL."
    },
    {
      "question": "Keyboard shortcut for Reverse Engineer in Workbench:",
      "options": [
        "Ctrl+G",
        "Ctrl+Shift+Z",
        "Ctrl+E",
        "Ctrl+R"
      ],
      "answer": 3,
      "explanation": "Ctrl+R reverse engineers; Ctrl+G forward engineers; Ctrl+Shift+Z synchronizes."
    },
    {
      "question": "Using the n:m relationship tool between students and courses creates:",
      "options": [
        "Nothing until forward engineering",
        "A foreign key in students",
        "A junction table with a composite primary key",
        "A view"
      ],
      "answer": 2,
      "explanation": "Workbench adds students_has_courses with both FKs as the PK."
    },
    {
      "question": "A dashed relationship line in Workbench means:",
      "options": [
        "Non-identifying relationship",
        "Identifying relationship",
        "Broken foreign key",
        "Many-to-many"
      ],
      "answer": 0,
      "explanation": "Non-identifying relationships are dashed; identifying ones are solid."
    },
    {
      "question": "Reverse engineering draws relationship lines based on:",
      "options": [
        "Matching column names",
        "Indexes only",
        "Table comments",
        "FOREIGN KEY constraints"
      ],
      "answer": 3,
      "explanation": "Only declared foreign keys become relationships."
    }
  ]
};
