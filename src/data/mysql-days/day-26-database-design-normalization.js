export default {
  "id": "mysql-day-26",
  "title": "Database Design and Normalization (1NF, 2NF, 3NF, BCNF), Anomalies",
  "module": "Module 6: Design, Administration & Project",
  "day": 26,
  "level": "Intermediate",
  "duration": "2.5 hours",
  "summary": "Design tables the right way: see insert, update and delete anomalies in a flat table, learn functional dependencies, candidate/composite keys, partial and transitive dependencies, and normalize step by step to 1NF, 2NF, 3NF and BCNF in MySQL - then rebuild the original report with joins and understand when denormalization is acceptable.",
  "objectives": [
    "Identify insert, update and delete anomalies caused by redundancy",
    "Describe functional, partial and transitive dependencies and candidate keys",
    "Normalize a table to 1NF, 2NF, 3NF and BCNF and implement it with keys in MySQL",
    "Verify a lossless decomposition by rebuilding data with joins",
    "Decide when denormalization is justified"
  ],
  "theory": [
    {
      "heading": "1. What is database design and why normalize?",
      "content": "Database design decides which tables to create, which columns go where and how tables relate. Normalization is a step-by-step method (normal forms 1NF, 2NF, 3NF, BCNF) that removes REDUNDANCY - the same fact stored in many rows - by splitting a big table into smaller related tables linked with keys.",
      "points": [
        "Goal: each fact is stored once, in one place.",
        "Benefits: no contradictory data, less storage, simpler updates, clear relationships enforced by foreign keys.",
        "Cost: more tables and more JOINs in queries.",
        "Design process: 1) list entities (Student, Department, Course) and attributes; 2) choose primary keys; 3) find relationships (1:1, 1:N, M:N); 4) normalize; 5) draw the ER diagram (Day 27); 6) create tables."
      ]
    },
    {
      "heading": "2. Anomalies: the problems caused by redundancy",
      "content": "Imagine one flat table admissions_flat(student_id, student_name, phones, dept_name, dept_head, course_code, course_name, credits, grade). Because departments and courses are repeated in many rows, three kinds of anomalies appear.",
      "points": [
        "Update anomaly: the head of Computer Science changes. You must update EVERY row of every CS student; if you miss one, the table now contains two different heads for the same department.",
        "Insert anomaly: you cannot record a new course (or a new department) until at least one student enrolls in it, because every row needs a student.",
        "Delete anomaly: if the only student enrolled in Digital Electronics leaves and you delete their rows, the fact that the course exists (and its credits) is lost too.",
        "Redundancy also wastes space and makes data entry errors likely (Computer Science vs Comp. Science)."
      ]
    },
    {
      "heading": "3. Functional dependency and keys (the vocabulary)",
      "content": "A functional dependency A -> B means: if you know A, B is fixed. student_id -> student_name; course_code -> course_name, credits; (student_id, course_code) -> grade; dept_name -> dept_head.",
      "points": [
        "Candidate key: a minimal set of columns that uniquely identifies a row. The chosen one is the PRIMARY KEY; the others become UNIQUE keys.",
        "Composite key: a key made of 2+ columns, e.g. (student_id, course_code) in enrollments.",
        "Prime attribute: a column that is part of some candidate key.",
        "Partial dependency: a non-key column depends on only PART of a composite key (course_name depends only on course_code).",
        "Transitive dependency: a non-key column depends on another non-key column (student_id -> dept_name -> dept_head)."
      ]
    },
    {
      "heading": "4. 1NF, 2NF and 3NF",
      "content": "Each normal form adds one rule on top of the previous one.",
      "syntax": "1NF  First Normal Form\n     - every column holds ONE atomic value (no lists like '9822012345, 9011122233')\n     - no repeating groups (phone1, phone2, phone3 columns)\n     - each row is unique (has a primary key)\n     Fix: move multi-valued data to its own table: student_phones(student_id, phone)\n\n2NF  Second Normal Form = 1NF + no PARTIAL dependency\n     - every non-key column depends on the WHOLE primary key\n     - only relevant when the key is composite\n     Fix: (student_id, course_code) -> grade stays; student_name -> students table,\n          course_name, credits -> courses table\n\n3NF  Third Normal Form = 2NF + no TRANSITIVE dependency\n     - non-key columns depend ONLY on the key (\"the key, the whole key and nothing but the key\")\n     Fix: student_id -> dept_id -> dept_name, dept_head : move department data to departments",
      "points": [
        "Memory aid: every non-key attribute must provide a fact about the key (1NF), the whole key (2NF), and nothing but the key (3NF), so help me Codd.",
        "A table with a single-column primary key that is in 1NF is automatically in 2NF.",
        "Most business databases aim for 3NF."
      ]
    },
    {
      "heading": "5. BCNF (Boyce-Codd Normal Form) and beyond",
      "content": "BCNF is a stricter 3NF: for EVERY functional dependency X -> Y, X must be a candidate key (superkey). It matters when a table has overlapping candidate keys.",
      "syntax": "teaching(student, subject, teacher)\nRules: each teacher teaches exactly one subject (teacher -> subject);\n       a student has one teacher per subject ((student, subject) -> teacher).\nCandidate keys: (student, subject) and (student, teacher)\nteacher -> subject violates BCNF because teacher alone is not a key\n(it is still 3NF because subject is a prime attribute).\nFix: teacher_subject(teacher PK, subject) + student_teacher(student, teacher)",
      "points": [
        "4NF removes multi-valued dependencies (independent lists in the same table); 5NF removes join dependencies - rarely needed in practice.",
        "Denormalization: deliberately adding redundancy (e.g. storing order_total in orders, or reporting tables) for read performance - done consciously, with triggers or jobs to keep it consistent.",
        "OLTP systems (banking, e-commerce orders) are normalized; data warehouses (star schema: fact + dimension tables) are intentionally denormalized."
      ]
    },
    {
      "heading": "6. Normalization in MySQL Workbench",
      "content": "After deciding the tables, implement them with keys and constraints so MySQL enforces the design.",
      "points": [
        "Use PRIMARY KEY on each entity table, composite PRIMARY KEY (student_id, course_code) on junction tables.",
        "Use FOREIGN KEY with ON DELETE / ON UPDATE rules to keep references valid.",
        "Use UNIQUE for alternate candidate keys (dept_name, email).",
        "Model the design visually in File > New Model > Add Diagram (Day 27) and Forward Engineer it to create the tables.",
        "Use views (Day 20) to give users a 'flat' picture of normalized data without storing it twice."
      ],
      "tip": "Interview shortcut: 1NF = atomic values; 2NF = no partial dependency on a composite key; 3NF = no transitive dependency; BCNF = every determinant is a candidate key."
    }
  ],
  "examples": [
    {
      "title": "See the anomalies in a flat (unnormalized) table",
      "scenario": "The admissions office keeps everything in one spreadsheet-like table. The head of Computer Science changes to Dr. Iyer, but the clerk updates only one row. Show the resulting inconsistency, and how many times each fact is repeated.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script (it creates college_design.admissions_flat)",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Result 1: the department head is stored 5 times for 2 departments",
        "Result 2 (after the partial UPDATE): Computer Science now has TWO different heads"
      ],
      "code": "SELECT dept_name, dept_head, COUNT(*) AS times_stored\nFROM admissions_flat\nGROUP BY dept_name, dept_head;\n\n-- update anomaly: only one row is changed\nUPDATE admissions_flat SET dept_head = 'Dr. Iyer' WHERE row_id = 1;\n\nSELECT dept_name, COUNT(DISTINCT dept_head) AS different_heads,\n       GROUP_CONCAT(DISTINCT dept_head) AS heads\nFROM admissions_flat\nGROUP BY dept_name;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college_design;\nUSE college_design;\nDROP TABLE IF EXISTS admissions_flat;\nCREATE TABLE admissions_flat (\n  row_id INT AUTO_INCREMENT PRIMARY KEY,\n  student_id INT,\n  student_name VARCHAR(40),\n  phones VARCHAR(60),\n  dept_name VARCHAR(40),\n  dept_head VARCHAR(40),\n  course_code VARCHAR(10),\n  course_name VARCHAR(40),\n  credits INT,\n  grade CHAR(1)\n);\nINSERT INTO admissions_flat (student_id, student_name, phones, dept_name, dept_head, course_code, course_name, credits, grade) VALUES\n(1,'Aarav Sharma','9822012345, 9011122233','Computer Science','Dr. Rao','CS101','Database Systems',4,'A'),\n(1,'Aarav Sharma','9822012345, 9011122233','Computer Science','Dr. Rao','CS102','Python Programming',3,'B'),\n(2,'Diya Patel','9876543210','Computer Science','Dr. Rao','CS101','Database Systems',4,'A'),\n(3,'Rohan Verma','9988776655','Electronics','Dr. Menon','EC103','Digital Electronics',4,'B'),\n(4,'Sneha Iyer','9123456789, 9000011111','Electronics','Dr. Menon','EC103','Digital Electronics',4,'A');\nSELECT dept_name, dept_head, COUNT(*) AS times_stored\nFROM admissions_flat\nGROUP BY dept_name, dept_head;\nUPDATE admissions_flat SET dept_head = 'Dr. Iyer' WHERE row_id = 1;\nSELECT dept_name, COUNT(DISTINCT dept_head) AS different_heads,\n       GROUP_CONCAT(DISTINCT dept_head) AS heads\nFROM admissions_flat\nGROUP BY dept_name;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college_design -> 1 row(s) affected\n>> USE college_design -> 0 row(s) affected\n>> DROP TABLE IF EXISTS admissions_flat -> 0 row(s) affected\n>> CREATE TABLE admissions_flat ( -> 0 row(s) affected\n>> INSERT INTO admissions_flat (student_id, student_name, phones, dept_na -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> SELECT dept_name, dept_head, COUNT(*) AS times_stored\n+------------------+-----------+--------------+\n| dept_name        | dept_head | times_stored |\n+------------------+-----------+--------------+\n| Computer Science | Dr. Rao   | 3            |\n| Electronics      | Dr. Menon | 2            |\n+------------------+-----------+--------------+\n2 row(s) returned\n>> UPDATE admissions_flat SET dept_head = 'Dr. Iyer' WHERE row_id = 1 -> 1 row(s) affected Rows matched: 1  Changed: 1  Warnings: 0\n>> SELECT dept_name, COUNT(DISTINCT dept_head) AS different_heads,\n+------------------+-----------------+------------------+\n| dept_name        | different_heads | heads            |\n+------------------+-----------------+------------------+\n| Computer Science | 2               | Dr. Iyer,Dr. Rao |\n| Electronics      | 1               | Dr. Menon        |\n+------------------+-----------------+------------------+\n2 row(s) returned",
      "explanation": "The department head is stored once per enrollment row, so Computer Science's head is repeated 3 times. Changing only one row creates two different heads for the same department - an update anomaly. The table also shows a 1NF violation (two phone numbers in one column), an insert anomaly (a new course without students cannot be stored) and a delete anomaly (deleting Rohan's and Sneha's rows would lose the Digital Electronics course)."
    },
    {
      "title": "1NF: split a multi-valued column into rows",
      "scenario": "The phones column stores lists like '9822012345, 9011122233'. Finding the student who owns phone 9011122233 needs LIKE '%...%' and cannot use an index. Move phones into a student_phones table (one phone per row).",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script (creates the normalized tables in college_design)",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Compare: the 1NF table answers the question with a simple equality"
      ],
      "code": "-- Before (not 1NF): pattern search inside a list\nSELECT student_name FROM admissions_flat WHERE phones LIKE '%9011122233%';\n\n-- After (1NF): one atomic value per column, composite PK (student_id, phone)\nCREATE TABLE student_phones (\n  student_id INT NOT NULL,\n  phone VARCHAR(15) NOT NULL,\n  PRIMARY KEY (student_id, phone),\n  FOREIGN KEY (student_id) REFERENCES students_n(student_id)\n);\n\nSELECT s.student_name, p.phone\nFROM student_phones p JOIN students_n s ON s.student_id = p.student_id\nWHERE p.phone = '9011122233';\n\nSELECT s.student_name, COUNT(*) AS phone_count\nFROM student_phones p JOIN students_n s ON s.student_id = p.student_id\nGROUP BY s.student_name\nORDER BY phone_count DESC, s.student_name;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college_design;\nUSE college_design;\nDROP TABLE IF EXISTS admissions_flat;\nCREATE TABLE admissions_flat (\n  row_id INT AUTO_INCREMENT PRIMARY KEY,\n  student_id INT,\n  student_name VARCHAR(40),\n  phones VARCHAR(60),\n  dept_name VARCHAR(40),\n  dept_head VARCHAR(40),\n  course_code VARCHAR(10),\n  course_name VARCHAR(40),\n  credits INT,\n  grade CHAR(1)\n);\nINSERT INTO admissions_flat (student_id, student_name, phones, dept_name, dept_head, course_code, course_name, credits, grade) VALUES\n(1,'Aarav Sharma','9822012345, 9011122233','Computer Science','Dr. Rao','CS101','Database Systems',4,'A'),\n(1,'Aarav Sharma','9822012345, 9011122233','Computer Science','Dr. Rao','CS102','Python Programming',3,'B'),\n(2,'Diya Patel','9876543210','Computer Science','Dr. Rao','CS101','Database Systems',4,'A'),\n(3,'Rohan Verma','9988776655','Electronics','Dr. Menon','EC103','Digital Electronics',4,'B'),\n(4,'Sneha Iyer','9123456789, 9000011111','Electronics','Dr. Menon','EC103','Digital Electronics',4,'A');\nDROP TABLE IF EXISTS enrollments_n;\nDROP TABLE IF EXISTS student_phones;\nDROP TABLE IF EXISTS students_n;\nDROP TABLE IF EXISTS courses_n;\nDROP TABLE IF EXISTS departments_n;\nCREATE TABLE departments_n (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(40) NOT NULL UNIQUE,\n  dept_head VARCHAR(40)\n);\nCREATE TABLE students_n (\n  student_id INT PRIMARY KEY,\n  student_name VARCHAR(40) NOT NULL,\n  dept_id INT NOT NULL,\n  FOREIGN KEY (dept_id) REFERENCES departments_n(dept_id)\n);\nCREATE TABLE student_phones (\n  student_id INT NOT NULL,\n  phone VARCHAR(15) NOT NULL,\n  PRIMARY KEY (student_id, phone),\n  FOREIGN KEY (student_id) REFERENCES students_n(student_id)\n);\nCREATE TABLE courses_n (\n  course_code VARCHAR(10) PRIMARY KEY,\n  course_name VARCHAR(40) NOT NULL,\n  credits INT NOT NULL\n);\nCREATE TABLE enrollments_n (\n  student_id INT NOT NULL,\n  course_code VARCHAR(10) NOT NULL,\n  grade CHAR(1),\n  PRIMARY KEY (student_id, course_code),\n  FOREIGN KEY (student_id) REFERENCES students_n(student_id),\n  FOREIGN KEY (course_code) REFERENCES courses_n(course_code)\n);\nINSERT INTO departments_n (dept_name, dept_head) VALUES ('Computer Science','Dr. Rao'),('Electronics','Dr. Menon');\nINSERT INTO students_n VALUES (1,'Aarav Sharma',1),(2,'Diya Patel',1),(3,'Rohan Verma',2),(4,'Sneha Iyer',2);\nINSERT INTO student_phones VALUES (1,'9822012345'),(1,'9011122233'),(2,'9876543210'),(3,'9988776655'),(4,'9123456789'),(4,'9000011111');\nINSERT INTO courses_n VALUES ('CS101','Database Systems',4),('CS102','Python Programming',3),('EC103','Digital Electronics',4);\nINSERT INTO enrollments_n VALUES (1,'CS101','A'),(1,'CS102','B'),(2,'CS101','A'),(3,'EC103','B'),(4,'EC103','A');\nSELECT student_name FROM admissions_flat WHERE phones LIKE '%9011122233%';\nSELECT s.student_name, p.phone\nFROM student_phones p JOIN students_n s ON s.student_id = p.student_id\nWHERE p.phone = '9011122233';\nSELECT s.student_name, COUNT(*) AS phone_count\nFROM student_phones p JOIN students_n s ON s.student_id = p.student_id\nGROUP BY s.student_name\nORDER BY phone_count DESC, s.student_name;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college_design -> 1 row(s) affected\n>> USE college_design -> 0 row(s) affected\n>> DROP TABLE IF EXISTS admissions_flat -> 0 row(s) affected\n>> CREATE TABLE admissions_flat ( -> 0 row(s) affected\n>> INSERT INTO admissions_flat (student_id, student_name, phones, dept_na -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> DROP TABLE IF EXISTS enrollments_n -> 0 row(s) affected\n>> DROP TABLE IF EXISTS student_phones -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students_n -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses_n -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments_n -> 0 row(s) affected\n>> CREATE TABLE departments_n ( -> 0 row(s) affected\n>> CREATE TABLE students_n ( -> 0 row(s) affected\n>> CREATE TABLE student_phones ( -> 0 row(s) affected\n>> CREATE TABLE courses_n ( -> 0 row(s) affected\n>> CREATE TABLE enrollments_n ( -> 0 row(s) affected\n>> INSERT INTO departments_n (dept_name, dept_head) VALUES ('Computer Sci -> 2 row(s) affected Records: 2  Duplicates: 0  Warnings: 0\n>> INSERT INTO students_n VALUES (1,'Aarav Sharma',1),(2,'Diya Patel',1), -> 4 row(s) affected Records: 4  Duplicates: 0  Warnings: 0\n>> INSERT INTO student_phones VALUES (1,'9822012345'),(1,'9011122233'),(2 -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> INSERT INTO courses_n VALUES ('CS101','Database Systems',4),('CS102',' -> 3 row(s) affected Records: 3  Duplicates: 0  Warnings: 0\n>> INSERT INTO enrollments_n VALUES (1,'CS101','A'),(1,'CS102','B'),(2,'C -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> SELECT student_name FROM admissions_flat WHERE phones LIKE '%901112223\n+--------------+\n| student_name |\n+--------------+\n| Aarav Sharma |\n| Aarav Sharma |\n+--------------+\n2 row(s) returned\n>> SELECT s.student_name, p.phone\n+--------------+------------+\n| student_name | phone      |\n+--------------+------------+\n| Aarav Sharma | 9011122233 |\n+--------------+------------+\n1 row(s) returned\n>> SELECT s.student_name, COUNT(*) AS phone_count\n+--------------+-------------+\n| student_name | phone_count |\n+--------------+-------------+\n| Aarav Sharma | 2           |\n| Sneha Iyer   | 2           |\n| Diya Patel   | 1           |\n| Rohan Verma  | 1           |\n+--------------+-------------+\n4 row(s) returned",
      "explanation": "The LIKE search on the flat table returns Aarav TWICE, because his phone list is repeated in each of his enrollment rows, and it cannot use an index. In 1NF each cell holds one value, so the phone search is an exact match that can use the primary key index, and counting phones per student is a simple GROUP BY. Adding a third phone is an INSERT, not a schema change (no phone1/phone2/phone3 columns)."
    },
    {
      "title": "2NF and 3NF: decompose, then rebuild the flat view with JOINs",
      "scenario": "In the flat table the key of an enrollment is (student_id, course_code). course_name/credits depend only on course_code (partial dependency -> 2NF violation) and dept_head depends on dept_name, not on the student (transitive -> 3NF violation). Create the normalized tables and reproduce the original report with joins.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Open the Navigator, refresh college_design, and see the five normalized tables",
        "The final SELECT returns the same information as the flat table - but each fact is now stored once"
      ],
      "code": "CREATE TABLE departments_n (dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(40) NOT NULL UNIQUE, dept_head VARCHAR(40));          -- 3NF fix\nCREATE TABLE students_n (student_id INT PRIMARY KEY, student_name VARCHAR(40) NOT NULL,\n  dept_id INT NOT NULL, FOREIGN KEY (dept_id) REFERENCES departments_n(dept_id));\nCREATE TABLE courses_n (course_code VARCHAR(10) PRIMARY KEY,\n  course_name VARCHAR(40) NOT NULL, credits INT NOT NULL);                -- 2NF fix\nCREATE TABLE enrollments_n (student_id INT NOT NULL, course_code VARCHAR(10) NOT NULL,\n  grade CHAR(1), PRIMARY KEY (student_id, course_code),\n  FOREIGN KEY (student_id) REFERENCES students_n(student_id),\n  FOREIGN KEY (course_code) REFERENCES courses_n(course_code));\n\nSELECT s.student_id, s.student_name, d.dept_name, d.dept_head,\n       c.course_code, c.course_name, c.credits, e.grade\nFROM enrollments_n e\nJOIN students_n s    ON s.student_id = e.student_id\nJOIN departments_n d ON d.dept_id = s.dept_id\nJOIN courses_n c     ON c.course_code = e.course_code\nORDER BY s.student_id, c.course_code;\n\nUPDATE departments_n SET dept_head = 'Dr. Iyer' WHERE dept_name = 'Computer Science';\nSELECT DISTINCT s.student_name, d.dept_head\nFROM students_n s JOIN departments_n d ON d.dept_id = s.dept_id\nWHERE d.dept_name = 'Computer Science';",
      "mysql": "CREATE DATABASE IF NOT EXISTS college_design;\nUSE college_design;\nDROP TABLE IF EXISTS enrollments_n;\nDROP TABLE IF EXISTS student_phones;\nDROP TABLE IF EXISTS students_n;\nDROP TABLE IF EXISTS courses_n;\nDROP TABLE IF EXISTS departments_n;\nCREATE TABLE departments_n (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(40) NOT NULL UNIQUE,\n  dept_head VARCHAR(40)\n);\nCREATE TABLE students_n (\n  student_id INT PRIMARY KEY,\n  student_name VARCHAR(40) NOT NULL,\n  dept_id INT NOT NULL,\n  FOREIGN KEY (dept_id) REFERENCES departments_n(dept_id)\n);\nCREATE TABLE student_phones (\n  student_id INT NOT NULL,\n  phone VARCHAR(15) NOT NULL,\n  PRIMARY KEY (student_id, phone),\n  FOREIGN KEY (student_id) REFERENCES students_n(student_id)\n);\nCREATE TABLE courses_n (\n  course_code VARCHAR(10) PRIMARY KEY,\n  course_name VARCHAR(40) NOT NULL,\n  credits INT NOT NULL\n);\nCREATE TABLE enrollments_n (\n  student_id INT NOT NULL,\n  course_code VARCHAR(10) NOT NULL,\n  grade CHAR(1),\n  PRIMARY KEY (student_id, course_code),\n  FOREIGN KEY (student_id) REFERENCES students_n(student_id),\n  FOREIGN KEY (course_code) REFERENCES courses_n(course_code)\n);\nINSERT INTO departments_n (dept_name, dept_head) VALUES ('Computer Science','Dr. Rao'),('Electronics','Dr. Menon');\nINSERT INTO students_n VALUES (1,'Aarav Sharma',1),(2,'Diya Patel',1),(3,'Rohan Verma',2),(4,'Sneha Iyer',2);\nINSERT INTO student_phones VALUES (1,'9822012345'),(1,'9011122233'),(2,'9876543210'),(3,'9988776655'),(4,'9123456789'),(4,'9000011111');\nINSERT INTO courses_n VALUES ('CS101','Database Systems',4),('CS102','Python Programming',3),('EC103','Digital Electronics',4);\nINSERT INTO enrollments_n VALUES (1,'CS101','A'),(1,'CS102','B'),(2,'CS101','A'),(3,'EC103','B'),(4,'EC103','A');\nSELECT s.student_id, s.student_name, d.dept_name, d.dept_head,\n       c.course_code, c.course_name, c.credits, e.grade\nFROM enrollments_n e\nJOIN students_n s    ON s.student_id = e.student_id\nJOIN departments_n d ON d.dept_id = s.dept_id\nJOIN courses_n c     ON c.course_code = e.course_code\nORDER BY s.student_id, c.course_code;\nUPDATE departments_n SET dept_head = 'Dr. Iyer' WHERE dept_name = 'Computer Science';\nSELECT DISTINCT s.student_name, d.dept_head\nFROM students_n s JOIN departments_n d ON d.dept_id = s.dept_id\nWHERE d.dept_name = 'Computer Science';",
      "result": ">> CREATE DATABASE IF NOT EXISTS college_design -> 1 row(s) affected\n>> USE college_design -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments_n -> 0 row(s) affected\n>> DROP TABLE IF EXISTS student_phones -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students_n -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses_n -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments_n -> 0 row(s) affected\n>> CREATE TABLE departments_n ( -> 0 row(s) affected\n>> CREATE TABLE students_n ( -> 0 row(s) affected\n>> CREATE TABLE student_phones ( -> 0 row(s) affected\n>> CREATE TABLE courses_n ( -> 0 row(s) affected\n>> CREATE TABLE enrollments_n ( -> 0 row(s) affected\n>> INSERT INTO departments_n (dept_name, dept_head) VALUES ('Computer Sci -> 2 row(s) affected Records: 2  Duplicates: 0  Warnings: 0\n>> INSERT INTO students_n VALUES (1,'Aarav Sharma',1),(2,'Diya Patel',1), -> 4 row(s) affected Records: 4  Duplicates: 0  Warnings: 0\n>> INSERT INTO student_phones VALUES (1,'9822012345'),(1,'9011122233'),(2 -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> INSERT INTO courses_n VALUES ('CS101','Database Systems',4),('CS102',' -> 3 row(s) affected Records: 3  Duplicates: 0  Warnings: 0\n>> INSERT INTO enrollments_n VALUES (1,'CS101','A'),(1,'CS102','B'),(2,'C -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> SELECT s.student_id, s.student_name, d.dept_name, d.dept_head,\n+------------+--------------+------------------+-----------+-------------+---------------------+---------+-------+\n| student_id | student_name | dept_name        | dept_head | course_code | course_name         | credits | grade |\n+------------+--------------+------------------+-----------+-------------+---------------------+---------+-------+\n| 1          | Aarav Sharma | Computer Science | Dr. Rao   | CS101       | Database Systems    | 4       | A     |\n| 1          | Aarav Sharma | Computer Science | Dr. Rao   | CS102       | Python Programming  | 3       | B     |\n| 2          | Diya Patel   | Computer Science | Dr. Rao   | CS101       | Database Systems    | 4       | A     |\n| 3          | Rohan Verma  | Electronics      | Dr. Menon | EC103       | Digital Electronics | 4       | B     |\n| 4          | Sneha Iyer   | Electronics      | Dr. Menon | EC103       | Digital Electronics | 4       | A     |\n+------------+--------------+------------------+-----------+-------------+---------------------+---------+-------+\n5 row(s) returned\n>> UPDATE departments_n SET dept_head = 'Dr. Iyer' WHERE dept_name = 'Com -> 1 row(s) affected Rows matched: 1  Changed: 1  Warnings: 0\n>> SELECT DISTINCT s.student_name, d.dept_head\n+--------------+-----------+\n| student_name | dept_head |\n+--------------+-----------+\n| Aarav Sharma | Dr. Iyer  |\n| Diya Patel   | Dr. Iyer  |\n+--------------+-----------+\n2 row(s) returned",
      "explanation": "Joining the four tables rebuilds exactly the 5 rows of the flat table. Now the department head is stored once: one UPDATE of one row changes it for every CS student, so the update anomaly is gone. A new course can be inserted into courses_n without any student (no insert anomaly), and deleting enrollments no longer deletes course facts (no delete anomaly)."
    },
    {
      "title": "Insert and delete anomalies are gone",
      "scenario": "Add a new course 'Cloud Computing' that has no students yet, and remove Rohan's enrollment without losing the Digital Electronics course.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Run the normalized-tables script from the previous example first (the Lab script below includes it)",
        "Type the statements",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script"
      ],
      "code": "INSERT INTO courses_n VALUES ('CS201', 'Cloud Computing', 3);    -- no student needed\n\nDELETE FROM enrollments_n WHERE student_id = 3 AND course_code = 'EC103';\n\nSELECT c.course_code, c.course_name, COUNT(e.student_id) AS enrolled\nFROM courses_n c\nLEFT JOIN enrollments_n e ON e.course_code = c.course_code\nGROUP BY c.course_code, c.course_name\nORDER BY c.course_code;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college_design;\nUSE college_design;\nDROP TABLE IF EXISTS enrollments_n;\nDROP TABLE IF EXISTS student_phones;\nDROP TABLE IF EXISTS students_n;\nDROP TABLE IF EXISTS courses_n;\nDROP TABLE IF EXISTS departments_n;\nCREATE TABLE departments_n (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(40) NOT NULL UNIQUE,\n  dept_head VARCHAR(40)\n);\nCREATE TABLE students_n (\n  student_id INT PRIMARY KEY,\n  student_name VARCHAR(40) NOT NULL,\n  dept_id INT NOT NULL,\n  FOREIGN KEY (dept_id) REFERENCES departments_n(dept_id)\n);\nCREATE TABLE student_phones (\n  student_id INT NOT NULL,\n  phone VARCHAR(15) NOT NULL,\n  PRIMARY KEY (student_id, phone),\n  FOREIGN KEY (student_id) REFERENCES students_n(student_id)\n);\nCREATE TABLE courses_n (\n  course_code VARCHAR(10) PRIMARY KEY,\n  course_name VARCHAR(40) NOT NULL,\n  credits INT NOT NULL\n);\nCREATE TABLE enrollments_n (\n  student_id INT NOT NULL,\n  course_code VARCHAR(10) NOT NULL,\n  grade CHAR(1),\n  PRIMARY KEY (student_id, course_code),\n  FOREIGN KEY (student_id) REFERENCES students_n(student_id),\n  FOREIGN KEY (course_code) REFERENCES courses_n(course_code)\n);\nINSERT INTO departments_n (dept_name, dept_head) VALUES ('Computer Science','Dr. Rao'),('Electronics','Dr. Menon');\nINSERT INTO students_n VALUES (1,'Aarav Sharma',1),(2,'Diya Patel',1),(3,'Rohan Verma',2),(4,'Sneha Iyer',2);\nINSERT INTO student_phones VALUES (1,'9822012345'),(1,'9011122233'),(2,'9876543210'),(3,'9988776655'),(4,'9123456789'),(4,'9000011111');\nINSERT INTO courses_n VALUES ('CS101','Database Systems',4),('CS102','Python Programming',3),('EC103','Digital Electronics',4);\nINSERT INTO enrollments_n VALUES (1,'CS101','A'),(1,'CS102','B'),(2,'CS101','A'),(3,'EC103','B'),(4,'EC103','A');\nINSERT INTO courses_n VALUES ('CS201', 'Cloud Computing', 3);\nDELETE FROM enrollments_n WHERE student_id = 3 AND course_code = 'EC103';\nSELECT c.course_code, c.course_name, COUNT(e.student_id) AS enrolled\nFROM courses_n c\nLEFT JOIN enrollments_n e ON e.course_code = c.course_code\nGROUP BY c.course_code, c.course_name\nORDER BY c.course_code;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college_design -> 1 row(s) affected\n>> USE college_design -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments_n -> 0 row(s) affected\n>> DROP TABLE IF EXISTS student_phones -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students_n -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses_n -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments_n -> 0 row(s) affected\n>> CREATE TABLE departments_n ( -> 0 row(s) affected\n>> CREATE TABLE students_n ( -> 0 row(s) affected\n>> CREATE TABLE student_phones ( -> 0 row(s) affected\n>> CREATE TABLE courses_n ( -> 0 row(s) affected\n>> CREATE TABLE enrollments_n ( -> 0 row(s) affected\n>> INSERT INTO departments_n (dept_name, dept_head) VALUES ('Computer Sci -> 2 row(s) affected Records: 2  Duplicates: 0  Warnings: 0\n>> INSERT INTO students_n VALUES (1,'Aarav Sharma',1),(2,'Diya Patel',1), -> 4 row(s) affected Records: 4  Duplicates: 0  Warnings: 0\n>> INSERT INTO student_phones VALUES (1,'9822012345'),(1,'9011122233'),(2 -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> INSERT INTO courses_n VALUES ('CS101','Database Systems',4),('CS102',' -> 3 row(s) affected Records: 3  Duplicates: 0  Warnings: 0\n>> INSERT INTO enrollments_n VALUES (1,'CS101','A'),(1,'CS102','B'),(2,'C -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> INSERT INTO courses_n VALUES ('CS201', 'Cloud Computing', 3) -> 1 row(s) affected\n>> DELETE FROM enrollments_n WHERE student_id = 3 AND course_code = 'EC10 -> 1 row(s) affected\n>> SELECT c.course_code, c.course_name, COUNT(e.student_id) AS enrolled\n+-------------+---------------------+----------+\n| course_code | course_name         | enrolled |\n+-------------+---------------------+----------+\n| CS101       | Database Systems    | 2        |\n| CS102       | Python Programming  | 1        |\n| CS201       | Cloud Computing     | 0        |\n| EC103       | Digital Electronics | 1        |\n+-------------+---------------------+----------+\n4 row(s) returned",
      "explanation": "Cloud Computing exists with 0 enrollments - impossible in the flat table without inventing a student. Deleting Rohan's enrollment removes only that relationship: Digital Electronics is still there with Sneha. The composite primary key (student_id, course_code) also prevents enrolling the same student twice in the same course."
    },
    {
      "title": "BCNF: teacher determines subject",
      "scenario": "A tutoring table stores (student, subject, teacher). Each teacher teaches only one subject. Show the problem and the BCNF decomposition.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Result 1 shows Prof. Khan's subject stored in 2 rows; Result 3 rebuilds the original data from the two BCNF tables"
      ],
      "code": "-- 3NF but not BCNF: teacher -> subject, but teacher is not a candidate key\nCREATE TABLE tutoring (\n  student VARCHAR(20), subject VARCHAR(20), teacher VARCHAR(20),\n  PRIMARY KEY (student, subject)\n);\n\n-- BCNF decomposition\nCREATE TABLE teacher_subject (teacher VARCHAR(20) PRIMARY KEY, subject VARCHAR(20) NOT NULL);\nCREATE TABLE student_teacher (\n  student VARCHAR(20), teacher VARCHAR(20),\n  PRIMARY KEY (student, teacher),\n  FOREIGN KEY (teacher) REFERENCES teacher_subject(teacher)\n);\nINSERT INTO teacher_subject SELECT DISTINCT teacher, subject FROM tutoring;\nINSERT INTO student_teacher SELECT student, teacher FROM tutoring;\n\nSELECT st.student, ts.subject, st.teacher\nFROM student_teacher st JOIN teacher_subject ts ON ts.teacher = st.teacher\nORDER BY st.student, ts.subject;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college_design;\nUSE college_design;\nDROP TABLE IF EXISTS student_teacher;\nDROP TABLE IF EXISTS teacher_subject;\nDROP TABLE IF EXISTS tutoring;\nCREATE TABLE tutoring (\n  student VARCHAR(20), subject VARCHAR(20), teacher VARCHAR(20),\n  PRIMARY KEY (student, subject)\n);\nINSERT INTO tutoring VALUES\n('Aarav','Maths','Prof. Khan'),('Aarav','Physics','Prof. Bose'),\n('Diya','Maths','Prof. Khan'),('Diya','Physics','Prof. Das'),('Rohan','Physics','Prof. Bose');\nSELECT teacher, subject, COUNT(*) AS rows_storing_this_fact\nFROM tutoring GROUP BY teacher, subject ORDER BY teacher;\nCREATE TABLE teacher_subject (teacher VARCHAR(20) PRIMARY KEY, subject VARCHAR(20) NOT NULL);\nCREATE TABLE student_teacher (\n  student VARCHAR(20), teacher VARCHAR(20),\n  PRIMARY KEY (student, teacher),\n  FOREIGN KEY (teacher) REFERENCES teacher_subject(teacher)\n);\nINSERT INTO teacher_subject SELECT DISTINCT teacher, subject FROM tutoring;\nINSERT INTO student_teacher SELECT student, teacher FROM tutoring;\nSELECT st.student, ts.subject, st.teacher\nFROM student_teacher st JOIN teacher_subject ts ON ts.teacher = st.teacher\nORDER BY st.student, ts.subject;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college_design -> 1 row(s) affected\n>> USE college_design -> 0 row(s) affected\n>> DROP TABLE IF EXISTS student_teacher -> 0 row(s) affected\n>> DROP TABLE IF EXISTS teacher_subject -> 0 row(s) affected\n>> DROP TABLE IF EXISTS tutoring -> 0 row(s) affected\n>> CREATE TABLE tutoring ( -> 0 row(s) affected\n>> INSERT INTO tutoring VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> SELECT teacher, subject, COUNT(*) AS rows_storing_this_fact\n+------------+---------+------------------------+\n| teacher    | subject | rows_storing_this_fact |\n+------------+---------+------------------------+\n| Prof. Bose | Physics | 2                      |\n| Prof. Das  | Physics | 1                      |\n| Prof. Khan | Maths   | 2                      |\n+------------+---------+------------------------+\n3 row(s) returned\n>> CREATE TABLE teacher_subject (teacher VARCHAR(20) PRIMARY KEY, subject -> 0 row(s) affected\n>> CREATE TABLE student_teacher ( -> 0 row(s) affected\n>> INSERT INTO teacher_subject SELECT DISTINCT teacher, subject FROM tuto -> 3 row(s) affected Records: 3  Duplicates: 0  Warnings: 0\n>> INSERT INTO student_teacher SELECT student, teacher FROM tutoring -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> SELECT st.student, ts.subject, st.teacher\n+---------+---------+------------+\n| student | subject | teacher    |\n+---------+---------+------------+\n| Aarav   | Maths   | Prof. Khan |\n| Aarav   | Physics | Prof. Bose |\n| Diya    | Maths   | Prof. Khan |\n| Diya    | Physics | Prof. Das  |\n| Rohan   | Physics | Prof. Bose |\n+---------+---------+------------+\n5 row(s) returned",
      "explanation": "In tutoring, the fact 'Prof. Khan teaches Maths' is repeated for every student he teaches (update anomaly if he switches subject). After decomposition each teacher's subject is stored once in teacher_subject, where teacher IS the key - so every determinant is a key (BCNF). The join reproduces the original rows without loss (a lossless decomposition)."
    }
  ],
  "interview": [
    {
      "q": "What is normalization?",
      "a": "A process of organizing tables to reduce redundancy and avoid insert, update and delete anomalies, by decomposing tables according to normal forms (1NF, 2NF, 3NF, BCNF) based on functional dependencies.",
      "level": "Beginner"
    },
    {
      "q": "Explain insert, update and delete anomalies with an example.",
      "a": "In a flat student-course-department table: you cannot add a course without a student (insert), changing a department head requires updating many rows and can leave inconsistent data (update), deleting the last student of a course loses the course details (delete).",
      "level": "Beginner"
    },
    {
      "q": "What is 1NF?",
      "a": "Every column holds atomic (single) values, there are no repeating groups, and each row is uniquely identifiable (primary key).",
      "level": "Beginner"
    },
    {
      "q": "What is 2NF?",
      "a": "1NF and no partial dependency: every non-key attribute depends on the whole of a composite primary key. Tables with single-column keys in 1NF are already in 2NF.",
      "level": "Beginner"
    },
    {
      "q": "What is 3NF?",
      "a": "2NF and no transitive dependency: non-key attributes depend only on the key, not on other non-key attributes.",
      "level": "Beginner"
    },
    {
      "q": "What is BCNF and how is it different from 3NF?",
      "a": "BCNF requires that for every functional dependency X -> Y, X is a superkey. 3NF allows X -> Y when Y is a prime attribute; BCNF does not. BCNF matters with overlapping candidate keys.",
      "level": "Advanced"
    },
    {
      "q": "What is a functional dependency?",
      "a": "A relationship A -> B where each value of A determines exactly one value of B, e.g. student_id -> student_name.",
      "level": "Intermediate"
    },
    {
      "q": "What are partial and transitive dependencies?",
      "a": "Partial: a non-key column depends on part of a composite key. Transitive: a non-key column depends on another non-key column (A -> B -> C).",
      "level": "Intermediate"
    },
    {
      "q": "What is denormalization and when would you use it?",
      "a": "Intentionally adding redundancy (duplicated or pre-aggregated columns, summary tables) to speed up reads, typically in reporting/data warehouses or hot read paths, accepting extra work to keep data consistent.",
      "level": "Intermediate"
    },
    {
      "q": "What is a lossless decomposition?",
      "a": "Splitting a table so that joining the parts reproduces exactly the original rows, without spurious rows. It is guaranteed when the common columns form a key of at least one of the parts.",
      "level": "Advanced"
    },
    {
      "q": "Is storing a comma-separated list of tags in one column acceptable?",
      "a": "It violates 1NF: you cannot index, join or constrain individual values efficiently. Use a separate table (or a JSON column only when you truly need flexible, rarely-queried data).",
      "level": "Beginner"
    },
    {
      "q": "Should every database be normalized to BCNF?",
      "a": "Usually 3NF is the practical target for OLTP. Higher normal forms add tables and joins; analytical systems often use denormalized star schemas.",
      "level": "Intermediate"
    }
  ],
  "practice": [
    {
      "task": "A table orders_flat(order_id, order_date, customer_id, customer_name, customer_city, product_id, product_name, price, qty). Identify the key and the dependencies.",
      "hint": "Think about what each id determines.",
      "solution": "-- Key: (order_id, product_id)\n-- order_id -> order_date, customer_id               (partial dependency)\n-- customer_id -> customer_name, customer_city       (transitive)\n-- product_id -> product_name, price                 (partial dependency)\n-- (order_id, product_id) -> qty                      (full dependency)"
    },
    {
      "task": "Normalize orders_flat into 3NF and write the CREATE TABLE statements.",
      "hint": "customers, products, orders, order_items.",
      "solution": "CREATE TABLE customers (customer_id INT PRIMARY KEY, name VARCHAR(60), city VARCHAR(40));\nCREATE TABLE products  (product_id INT PRIMARY KEY, name VARCHAR(80), price DECIMAL(10,2));\nCREATE TABLE orders    (order_id INT PRIMARY KEY, order_date DATE,\n                        customer_id INT, FOREIGN KEY (customer_id) REFERENCES customers(customer_id));\nCREATE TABLE order_items (order_id INT, product_id INT, qty INT,\n                        unit_price DECIMAL(10,2),     -- price at time of sale (history, not redundancy)\n                        PRIMARY KEY (order_id, product_id),\n                        FOREIGN KEY (order_id) REFERENCES orders(order_id),\n                        FOREIGN KEY (product_id) REFERENCES products(product_id));"
    },
    {
      "task": "A table employee(emp_id, name, skills) stores 'Java, SQL, Python' in skills. Bring it to 1NF.",
      "hint": "One row per employee-skill pair.",
      "solution": "CREATE TABLE employee (emp_id INT PRIMARY KEY, name VARCHAR(50));\nCREATE TABLE employee_skill (\n  emp_id INT, skill VARCHAR(30),\n  PRIMARY KEY (emp_id, skill),\n  FOREIGN KEY (emp_id) REFERENCES employee(emp_id)\n);"
    },
    {
      "task": "Write a query on admissions_flat that detects update anomalies: departments with more than one distinct head.",
      "hint": "GROUP BY dept_name HAVING COUNT(DISTINCT dept_head) > 1.",
      "solution": "SELECT dept_name, COUNT(DISTINCT dept_head) AS heads\nFROM admissions_flat\nGROUP BY dept_name\nHAVING COUNT(DISTINCT dept_head) > 1;"
    },
    {
      "task": "Create a view enrollment_report that gives users the flat picture on top of the normalized tables.",
      "hint": "CREATE VIEW ... AS SELECT with the 4-table join.",
      "solution": "CREATE VIEW enrollment_report AS\nSELECT s.student_name, d.dept_name, d.dept_head, c.course_name, c.credits, e.grade\nFROM enrollments_n e\nJOIN students_n s    ON s.student_id = e.student_id\nJOIN departments_n d ON d.dept_id = s.dept_id\nJOIN courses_n c     ON c.course_code = e.course_code;"
    }
  ],
  "quiz": [
    {
      "question": "A column storing '9822012345, 9011122233' violates:",
      "options": [
        "1NF",
        "2NF only",
        "3NF only",
        "BCNF only"
      ],
      "answer": 0,
      "explanation": "Multiple values in one cell break atomicity (1NF)."
    },
    {
      "question": "Key (student_id, course_code); course_name depends only on course_code. This is a:",
      "options": [
        "Transitive dependency",
        "Partial dependency (2NF violation)",
        "Multi-valued dependency",
        "Valid 3NF design"
      ],
      "answer": 1,
      "explanation": "A non-key attribute depending on part of a composite key violates 2NF."
    },
    {
      "question": "student_id -> dept_id -> dept_head in the students table violates:",
      "options": [
        "1NF",
        "2NF",
        "3NF",
        "Nothing"
      ],
      "answer": 2,
      "explanation": "dept_head depends on a non-key attribute (transitive dependency)."
    },
    {
      "question": "You cannot add a new course until a student enrolls. This is an:",
      "options": [
        "Update anomaly",
        "Delete anomaly",
        "Insert anomaly",
        "Join anomaly"
      ],
      "answer": 2,
      "explanation": "Insert anomaly: a fact cannot be stored without an unrelated fact."
    },
    {
      "question": "BCNF requires that:",
      "options": [
        "Every table has an AUTO_INCREMENT id",
        "Every determinant is a candidate key",
        "There are no NULL values",
        "All tables have exactly two columns"
      ],
      "answer": 1,
      "explanation": "For every non-trivial FD X -> Y, X must be a superkey."
    }
  ]
};
