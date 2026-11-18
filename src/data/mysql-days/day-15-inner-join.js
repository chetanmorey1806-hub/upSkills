export default {
  "id": "mysql-day-15",
  "title": "INNER JOIN",
  "module": "Module 4: Joins & Subqueries",
  "day": 15,
  "level": "Intermediate",
  "duration": "2 hours",
  "summary": "Combine data from related tables with INNER JOIN: why joins are needed in a normalized database, ON conditions between foreign and primary keys, table aliases and ambiguous columns, joining three or more tables through a junction table, ON vs USING vs NATURAL JOIN, filters, and joins combined with GROUP BY for reports.",
  "objectives": [
    "Explain how INNER JOIN matches rows and why unmatched rows disappear",
    "Write INNER JOIN queries with aliases and fully qualified columns",
    "Join three or more tables, including many-to-many relationships",
    "Use ON, USING and filters correctly",
    "Combine joins with GROUP BY to build summary reports"
  ],
  "theory": [
    {
      "heading": "1. Why joins? Data lives in related tables",
      "content": "A normalized database stores each fact once: students in one table, departments in another, linked by dept_id (a foreign key). To show a student's name WITH their department name you must JOIN the tables, matching the foreign key to the primary key.",
      "syntax": "students                         departments\n+------------+--------------+---------+     +---------+------------------+\n| student_id | name         | dept_id | --> | dept_id | dept_name        |\n| 1          | Aarav Sharma | 1       |     | 1       | Computer Science |\n| 9          | Arjun Mehta  | NULL    |     | 5       | Management       |",
      "points": [
        "The join condition is usually child.foreign_key = parent.primary_key.",
        "Joins combine columns from several tables into one result row.",
        "Types: INNER JOIN (today), LEFT/RIGHT/FULL OUTER (Day 16), SELF and CROSS (Day 17)."
      ]
    },
    {
      "heading": "2. INNER JOIN syntax",
      "content": "INNER JOIN returns only the rows that have a match in BOTH tables according to the ON condition. Rows without a partner are left out on both sides.",
      "syntax": "SELECT s.name, d.dept_name\nFROM students AS s\nINNER JOIN departments AS d\n        ON s.dept_id = d.dept_id;\n\n-- JOIN alone means INNER JOIN\nSELECT s.name, d.dept_name\nFROM students s JOIN departments d ON s.dept_id = d.dept_id;\n\n-- old style (implicit join) - same result, avoid it\nSELECT s.name, d.dept_name\nFROM students s, departments d\nWHERE s.dept_id = d.dept_id;",
      "points": [
        "INNER JOIN and JOIN are identical.",
        "Students with dept_id NULL (Arjun, Priya) and departments with no students (Management) are NOT in the result.",
        "NULL never equals anything, not even NULL, so NULL foreign keys never match.",
        "The implicit comma syntax is easy to break: forget the WHERE and you get a Cartesian product (every row x every row)."
      ]
    },
    {
      "heading": "3. Table aliases and qualified column names",
      "content": "When two tables have a column with the same name (dept_id, name), you must say which table you mean: table.column or alias.column. Otherwise MySQL raises Error 1052: Column 'dept_id' in field list is ambiguous.",
      "syntax": "SELECT s.name AS student, f.name AS faculty, d.dept_name\nFROM students s\nJOIN departments d ON d.dept_id = s.dept_id\nJOIN faculty f     ON f.dept_id = d.dept_id;",
      "points": [
        "Short aliases (s, d, c, e) keep queries readable. Once you alias a table you must use the alias.",
        "Qualify EVERY column in a join query, even unambiguous ones - it documents where the data comes from.",
        "Use column aliases (AS student) when two tables both have a 'name' column."
      ]
    },
    {
      "heading": "4. Joining three or more tables",
      "content": "Add one JOIN per extra table. Each JOIN needs its own ON condition linking it to a table already in the query. A many-to-many relationship (students <-> courses) always goes through a bridge/junction table (enrollments).",
      "syntax": "SELECT s.name, c.course_name, e.grade\nFROM students s\nJOIN enrollments e ON e.student_id = s.student_id\nJOIN courses c     ON c.course_id  = e.course_id;",
      "points": [
        "With n tables you normally need n-1 join conditions.",
        "Order of INNER JOINs does not change the result; the optimizer chooses the best physical order (see EXPLAIN, Day 21).",
        "A missing ON condition multiplies rows - always check row counts."
      ]
    },
    {
      "heading": "5. ON vs USING vs NATURAL JOIN, extra conditions",
      "content": "ON is the general form. USING(col) is a shortcut when both tables use the same column name. NATURAL JOIN joins automatically on ALL columns with equal names - dangerous.",
      "syntax": "SELECT s.name, d.dept_name FROM students s JOIN departments d USING (dept_id);\n\n-- additional conditions can go in ON or WHERE (same result for INNER JOIN)\nSELECT s.name, c.course_name\nFROM enrollments e\nJOIN students s ON s.student_id = e.student_id\nJOIN courses  c ON c.course_id = e.course_id AND c.credits = 4\nWHERE s.marks > 80;",
      "points": [
        "With USING, the common column appears once and can be referenced without a prefix.",
        "NATURAL JOIN breaks silently when someone adds a same-named column (e.g. 'name' in both tables) - avoid it in real code.",
        "For INNER JOIN, a filter in ON or in WHERE gives the same rows; for LEFT JOIN it does NOT (Day 16).",
        "Joins can also use non-equality conditions (BETWEEN for grade bands) - called non-equi joins."
      ]
    },
    {
      "heading": "6. Joins with GROUP BY, and performance",
      "content": "Most real reports join tables and then aggregate: revenue per department, students per course.",
      "syntax": "SELECT d.dept_name, COUNT(e.enroll_id) AS enrollments\nFROM departments d\nJOIN courses c     ON c.dept_id = d.dept_id\nJOIN enrollments e ON e.course_id = c.course_id\nGROUP BY d.dept_name;",
      "points": [
        "Index the foreign key columns (InnoDB does it automatically when you declare FOREIGN KEY).",
        "Join on columns with the same data type and collation, otherwise indexes may not be used.",
        "Select only the columns you need instead of SELECT *.",
        "Workbench tip: in the SQL editor type the table alias and a dot (s.) - auto-complete lists the columns; Query > Explain Current Statement shows the join plan."
      ]
    }
  ],
  "examples": [
    {
      "title": "Students with their department names",
      "scenario": "List each student with the name and location of their department.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Double-click the college schema to set it as default",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Count the rows: 8, not 10 - Arjun and Priya have no department"
      ],
      "code": "SELECT s.student_id, s.name, d.dept_name, d.location\nFROM students s\nINNER JOIN departments d ON s.dept_id = d.dept_id\nORDER BY s.student_id;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL,\n  location VARCHAR(50)\n);\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  gender ENUM('M','F'),\n  city VARCHAR(40),\n  dept_id INT,\n  marks INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE courses (\n  course_id INT PRIMARY KEY,\n  course_name VARCHAR(60) NOT NULL,\n  dept_id INT,\n  credits INT,\n  fee DECIMAL(10,2),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE enrollments (\n  enroll_id INT AUTO_INCREMENT PRIMARY KEY,\n  student_id INT NOT NULL,\n  course_id INT NOT NULL,\n  grade CHAR(1),\n  FOREIGN KEY (student_id) REFERENCES students(student_id),\n  FOREIGN KEY (course_id) REFERENCES courses(course_id)\n);\nCREATE TABLE faculty (\n  faculty_id INT PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INT,\n  salary DECIMAL(10,2),\n  manager_id INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO departments VALUES\n (1,'Computer Science','Block A'),(2,'Electronics','Block B'),\n (3,'Mechanical','Block C'),(4,'Civil','Block D'),(5,'Management','Block E');\nINSERT INTO students (name, gender, city, dept_id, marks) VALUES\n ('Aarav Sharma','M','Pune',1,88),('Diya Patel','F','Mumbai',1,92),\n ('Rohan Verma','M','Delhi',2,75),('Sneha Iyer','F','Chennai',2,81),\n ('Kabir Singh','M','Pune',3,67),('Ananya Rao','F','Bengaluru',1,95),\n ('Vikram Joshi','M','Mumbai',3,58),('Meera Nair','F','Kochi',4,72),\n ('Arjun Mehta','M','Delhi',NULL,64),('Priya Desai','F','Pune',NULL,79);\nINSERT INTO courses VALUES\n (101,'Database Systems',1,4,15000.00),(102,'Python Programming',1,3,12000.00),\n (103,'Digital Electronics',2,4,14000.00),(104,'Thermodynamics',3,3,11000.00),\n (105,'Structural Analysis',4,4,13000.00),(106,'Machine Learning',1,4,18000.00),\n (107,'Marketing Basics',5,2,9000.00);\nINSERT INTO enrollments (student_id, course_id, grade) VALUES\n (1,101,'A'),(1,102,'B'),(2,101,'A'),(2,106,'A'),(3,103,'B'),\n (4,103,'A'),(5,104,'C'),(6,101,'A'),(6,106,'A'),(7,104,'D'),\n (8,105,'B'),(9,102,'C');\nINSERT INTO faculty VALUES\n (1,'Dr. Rao',1,150000.00,NULL),(2,'Prof. Gupta',1,95000.00,1),\n (3,'Prof. Khan',1,90000.00,1),(4,'Dr. Menon',2,120000.00,NULL),\n (5,'Prof. Bose',2,85000.00,4),(6,'Dr. Kulkarni',3,110000.00,NULL),\n (7,'Prof. Das',3,80000.00,6),(8,'Prof. Pillai',NULL,70000.00,NULL);\nSELECT s.student_id, s.name, d.dept_name, d.location\nFROM students s\nINNER JOIN departments d ON s.dept_id = d.dept_id\nORDER BY s.student_id;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> CREATE TABLE courses ( -> 0 row(s) affected\n>> CREATE TABLE enrollments ( -> 0 row(s) affected\n>> CREATE TABLE faculty ( -> 0 row(s) affected\n>> INSERT INTO departments VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> INSERT INTO students (name, gender, city, dept_id, marks) VALUES -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> INSERT INTO courses VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO enrollments (student_id, course_id, grade) VALUES -> 12 row(s) affected Records: 12  Duplicates: 0  Warnings: 0\n>> INSERT INTO faculty VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> SELECT s.student_id, s.name, d.dept_name, d.location\n+------------+--------------+------------------+----------+\n| student_id | name         | dept_name        | location |\n+------------+--------------+------------------+----------+\n| 1          | Aarav Sharma | Computer Science | Block A  |\n| 2          | Diya Patel   | Computer Science | Block A  |\n| 3          | Rohan Verma  | Electronics      | Block B  |\n| 4          | Sneha Iyer   | Electronics      | Block B  |\n| 5          | Kabir Singh  | Mechanical       | Block C  |\n| 6          | Ananya Rao   | Computer Science | Block A  |\n| 7          | Vikram Joshi | Mechanical       | Block C  |\n| 8          | Meera Nair   | Civil            | Block D  |\n+------------+--------------+------------------+----------+\n8 row(s) returned",
      "explanation": "Only students whose dept_id matches a department appear. Arjun (9) and Priya (10) have NULL dept_id, so they are excluded; the Management department (5) has no students, so it is not shown either. That is the definition of INNER JOIN: matches on both sides only."
    },
    {
      "title": "Three-table join: who studies which course",
      "scenario": "Show every enrollment as student name, course name, credits and grade, ordered by student and course.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Notice enrollments is the bridge table between students and courses"
      ],
      "code": "SELECT s.name, c.course_name, c.credits, e.grade\nFROM enrollments e\nJOIN students s ON s.student_id = e.student_id\nJOIN courses  c ON c.course_id  = e.course_id\nORDER BY s.name, c.course_name;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL,\n  location VARCHAR(50)\n);\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  gender ENUM('M','F'),\n  city VARCHAR(40),\n  dept_id INT,\n  marks INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE courses (\n  course_id INT PRIMARY KEY,\n  course_name VARCHAR(60) NOT NULL,\n  dept_id INT,\n  credits INT,\n  fee DECIMAL(10,2),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE enrollments (\n  enroll_id INT AUTO_INCREMENT PRIMARY KEY,\n  student_id INT NOT NULL,\n  course_id INT NOT NULL,\n  grade CHAR(1),\n  FOREIGN KEY (student_id) REFERENCES students(student_id),\n  FOREIGN KEY (course_id) REFERENCES courses(course_id)\n);\nCREATE TABLE faculty (\n  faculty_id INT PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INT,\n  salary DECIMAL(10,2),\n  manager_id INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO departments VALUES\n (1,'Computer Science','Block A'),(2,'Electronics','Block B'),\n (3,'Mechanical','Block C'),(4,'Civil','Block D'),(5,'Management','Block E');\nINSERT INTO students (name, gender, city, dept_id, marks) VALUES\n ('Aarav Sharma','M','Pune',1,88),('Diya Patel','F','Mumbai',1,92),\n ('Rohan Verma','M','Delhi',2,75),('Sneha Iyer','F','Chennai',2,81),\n ('Kabir Singh','M','Pune',3,67),('Ananya Rao','F','Bengaluru',1,95),\n ('Vikram Joshi','M','Mumbai',3,58),('Meera Nair','F','Kochi',4,72),\n ('Arjun Mehta','M','Delhi',NULL,64),('Priya Desai','F','Pune',NULL,79);\nINSERT INTO courses VALUES\n (101,'Database Systems',1,4,15000.00),(102,'Python Programming',1,3,12000.00),\n (103,'Digital Electronics',2,4,14000.00),(104,'Thermodynamics',3,3,11000.00),\n (105,'Structural Analysis',4,4,13000.00),(106,'Machine Learning',1,4,18000.00),\n (107,'Marketing Basics',5,2,9000.00);\nINSERT INTO enrollments (student_id, course_id, grade) VALUES\n (1,101,'A'),(1,102,'B'),(2,101,'A'),(2,106,'A'),(3,103,'B'),\n (4,103,'A'),(5,104,'C'),(6,101,'A'),(6,106,'A'),(7,104,'D'),\n (8,105,'B'),(9,102,'C');\nINSERT INTO faculty VALUES\n (1,'Dr. Rao',1,150000.00,NULL),(2,'Prof. Gupta',1,95000.00,1),\n (3,'Prof. Khan',1,90000.00,1),(4,'Dr. Menon',2,120000.00,NULL),\n (5,'Prof. Bose',2,85000.00,4),(6,'Dr. Kulkarni',3,110000.00,NULL),\n (7,'Prof. Das',3,80000.00,6),(8,'Prof. Pillai',NULL,70000.00,NULL);\nSELECT s.name, c.course_name, c.credits, e.grade\nFROM enrollments e\nJOIN students s ON s.student_id = e.student_id\nJOIN courses  c ON c.course_id  = e.course_id\nORDER BY s.name, c.course_name;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> CREATE TABLE courses ( -> 0 row(s) affected\n>> CREATE TABLE enrollments ( -> 0 row(s) affected\n>> CREATE TABLE faculty ( -> 0 row(s) affected\n>> INSERT INTO departments VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> INSERT INTO students (name, gender, city, dept_id, marks) VALUES -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> INSERT INTO courses VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO enrollments (student_id, course_id, grade) VALUES -> 12 row(s) affected Records: 12  Duplicates: 0  Warnings: 0\n>> INSERT INTO faculty VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> SELECT s.name, c.course_name, c.credits, e.grade\n+--------------+---------------------+---------+-------+\n| name         | course_name         | credits | grade |\n+--------------+---------------------+---------+-------+\n| Aarav Sharma | Database Systems    | 4       | A     |\n| Aarav Sharma | Python Programming  | 3       | B     |\n| Ananya Rao   | Database Systems    | 4       | A     |\n| Ananya Rao   | Machine Learning    | 4       | A     |\n| Arjun Mehta  | Python Programming  | 3       | C     |\n| Diya Patel   | Database Systems    | 4       | A     |\n| Diya Patel   | Machine Learning    | 4       | A     |\n| Kabir Singh  | Thermodynamics      | 3       | C     |\n| Meera Nair   | Structural Analysis | 4       | B     |\n| Rohan Verma  | Digital Electronics | 4       | B     |\n| Sneha Iyer   | Digital Electronics | 4       | A     |\n| Vikram Joshi | Thermodynamics      | 3       | D     |\n+--------------+---------------------+---------+-------+\n12 row(s) returned",
      "explanation": "Each enrollment row is matched with exactly one student and one course, so the result has the same 12 rows as enrollments, but with readable names instead of ids. Students with no enrollments (Priya) and courses nobody takes (Marketing Basics) do not appear."
    },
    {
      "title": "Join with filters: A grades in 4-credit courses",
      "scenario": "Find students who got grade A in a 4-credit course, with the department that offers the course.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Try moving c.credits = 4 from ON into WHERE - for INNER JOIN the result is the same"
      ],
      "code": "SELECT s.name, c.course_name, d.dept_name AS offered_by, e.grade\nFROM enrollments e\nJOIN students s    ON s.student_id = e.student_id\nJOIN courses c     ON c.course_id = e.course_id AND c.credits = 4\nJOIN departments d ON d.dept_id = c.dept_id\nWHERE e.grade = 'A'\nORDER BY c.course_name, s.name;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL,\n  location VARCHAR(50)\n);\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  gender ENUM('M','F'),\n  city VARCHAR(40),\n  dept_id INT,\n  marks INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE courses (\n  course_id INT PRIMARY KEY,\n  course_name VARCHAR(60) NOT NULL,\n  dept_id INT,\n  credits INT,\n  fee DECIMAL(10,2),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE enrollments (\n  enroll_id INT AUTO_INCREMENT PRIMARY KEY,\n  student_id INT NOT NULL,\n  course_id INT NOT NULL,\n  grade CHAR(1),\n  FOREIGN KEY (student_id) REFERENCES students(student_id),\n  FOREIGN KEY (course_id) REFERENCES courses(course_id)\n);\nCREATE TABLE faculty (\n  faculty_id INT PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INT,\n  salary DECIMAL(10,2),\n  manager_id INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO departments VALUES\n (1,'Computer Science','Block A'),(2,'Electronics','Block B'),\n (3,'Mechanical','Block C'),(4,'Civil','Block D'),(5,'Management','Block E');\nINSERT INTO students (name, gender, city, dept_id, marks) VALUES\n ('Aarav Sharma','M','Pune',1,88),('Diya Patel','F','Mumbai',1,92),\n ('Rohan Verma','M','Delhi',2,75),('Sneha Iyer','F','Chennai',2,81),\n ('Kabir Singh','M','Pune',3,67),('Ananya Rao','F','Bengaluru',1,95),\n ('Vikram Joshi','M','Mumbai',3,58),('Meera Nair','F','Kochi',4,72),\n ('Arjun Mehta','M','Delhi',NULL,64),('Priya Desai','F','Pune',NULL,79);\nINSERT INTO courses VALUES\n (101,'Database Systems',1,4,15000.00),(102,'Python Programming',1,3,12000.00),\n (103,'Digital Electronics',2,4,14000.00),(104,'Thermodynamics',3,3,11000.00),\n (105,'Structural Analysis',4,4,13000.00),(106,'Machine Learning',1,4,18000.00),\n (107,'Marketing Basics',5,2,9000.00);\nINSERT INTO enrollments (student_id, course_id, grade) VALUES\n (1,101,'A'),(1,102,'B'),(2,101,'A'),(2,106,'A'),(3,103,'B'),\n (4,103,'A'),(5,104,'C'),(6,101,'A'),(6,106,'A'),(7,104,'D'),\n (8,105,'B'),(9,102,'C');\nINSERT INTO faculty VALUES\n (1,'Dr. Rao',1,150000.00,NULL),(2,'Prof. Gupta',1,95000.00,1),\n (3,'Prof. Khan',1,90000.00,1),(4,'Dr. Menon',2,120000.00,NULL),\n (5,'Prof. Bose',2,85000.00,4),(6,'Dr. Kulkarni',3,110000.00,NULL),\n (7,'Prof. Das',3,80000.00,6),(8,'Prof. Pillai',NULL,70000.00,NULL);\nSELECT s.name, c.course_name, d.dept_name AS offered_by, e.grade\nFROM enrollments e\nJOIN students s    ON s.student_id = e.student_id\nJOIN courses c     ON c.course_id = e.course_id AND c.credits = 4\nJOIN departments d ON d.dept_id = c.dept_id\nWHERE e.grade = 'A'\nORDER BY c.course_name, s.name;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> CREATE TABLE courses ( -> 0 row(s) affected\n>> CREATE TABLE enrollments ( -> 0 row(s) affected\n>> CREATE TABLE faculty ( -> 0 row(s) affected\n>> INSERT INTO departments VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> INSERT INTO students (name, gender, city, dept_id, marks) VALUES -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> INSERT INTO courses VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO enrollments (student_id, course_id, grade) VALUES -> 12 row(s) affected Records: 12  Duplicates: 0  Warnings: 0\n>> INSERT INTO faculty VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> SELECT s.name, c.course_name, d.dept_name AS offered_by, e.grade\n+--------------+---------------------+------------------+-------+\n| name         | course_name         | offered_by       | grade |\n+--------------+---------------------+------------------+-------+\n| Aarav Sharma | Database Systems    | Computer Science | A     |\n| Ananya Rao   | Database Systems    | Computer Science | A     |\n| Diya Patel   | Database Systems    | Computer Science | A     |\n| Sneha Iyer   | Digital Electronics | Electronics      | A     |\n| Ananya Rao   | Machine Learning    | Computer Science | A     |\n| Diya Patel   | Machine Learning    | Computer Science | A     |\n+--------------+---------------------+------------------+-------+\n6 row(s) returned",
      "explanation": "Four tables are joined (three ON conditions). The credits filter sits in ON and the grade filter in WHERE - for INNER JOIN both places behave identically. Python Programming and Thermodynamics (3 credits) are excluded by the ON condition, and the B/C/D grades by WHERE, leaving 6 A grades in 4-credit courses."
    },
    {
      "title": "USING and qualified names (and the ambiguous-column error)",
      "scenario": "Show students with their department using USING(dept_id), and understand Error 1052.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Run the first query: Workbench shows Error Code: 1052. Column 'dept_id' in field list is ambiguous",
        "Run the corrected queries",
        "Compare ON and USING outputs: identical rows"
      ],
      "code": "-- Error 1052 (both tables have dept_id):\n-- SELECT name, dept_id, dept_name FROM students JOIN departments ON students.dept_id = departments.dept_id;\n\nSELECT s.name, dept_id, d.dept_name\nFROM students s\nJOIN departments d USING (dept_id)\nWHERE dept_id IN (2, 4)\nORDER BY dept_id, s.name;\n\nSELECT s.name, s.dept_id, d.dept_name\nFROM students s\nJOIN departments d ON d.dept_id = s.dept_id\nWHERE s.dept_id IN (2, 4)\nORDER BY s.dept_id, s.name;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL,\n  location VARCHAR(50)\n);\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  gender ENUM('M','F'),\n  city VARCHAR(40),\n  dept_id INT,\n  marks INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE courses (\n  course_id INT PRIMARY KEY,\n  course_name VARCHAR(60) NOT NULL,\n  dept_id INT,\n  credits INT,\n  fee DECIMAL(10,2),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE enrollments (\n  enroll_id INT AUTO_INCREMENT PRIMARY KEY,\n  student_id INT NOT NULL,\n  course_id INT NOT NULL,\n  grade CHAR(1),\n  FOREIGN KEY (student_id) REFERENCES students(student_id),\n  FOREIGN KEY (course_id) REFERENCES courses(course_id)\n);\nCREATE TABLE faculty (\n  faculty_id INT PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INT,\n  salary DECIMAL(10,2),\n  manager_id INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO departments VALUES\n (1,'Computer Science','Block A'),(2,'Electronics','Block B'),\n (3,'Mechanical','Block C'),(4,'Civil','Block D'),(5,'Management','Block E');\nINSERT INTO students (name, gender, city, dept_id, marks) VALUES\n ('Aarav Sharma','M','Pune',1,88),('Diya Patel','F','Mumbai',1,92),\n ('Rohan Verma','M','Delhi',2,75),('Sneha Iyer','F','Chennai',2,81),\n ('Kabir Singh','M','Pune',3,67),('Ananya Rao','F','Bengaluru',1,95),\n ('Vikram Joshi','M','Mumbai',3,58),('Meera Nair','F','Kochi',4,72),\n ('Arjun Mehta','M','Delhi',NULL,64),('Priya Desai','F','Pune',NULL,79);\nINSERT INTO courses VALUES\n (101,'Database Systems',1,4,15000.00),(102,'Python Programming',1,3,12000.00),\n (103,'Digital Electronics',2,4,14000.00),(104,'Thermodynamics',3,3,11000.00),\n (105,'Structural Analysis',4,4,13000.00),(106,'Machine Learning',1,4,18000.00),\n (107,'Marketing Basics',5,2,9000.00);\nINSERT INTO enrollments (student_id, course_id, grade) VALUES\n (1,101,'A'),(1,102,'B'),(2,101,'A'),(2,106,'A'),(3,103,'B'),\n (4,103,'A'),(5,104,'C'),(6,101,'A'),(6,106,'A'),(7,104,'D'),\n (8,105,'B'),(9,102,'C');\nINSERT INTO faculty VALUES\n (1,'Dr. Rao',1,150000.00,NULL),(2,'Prof. Gupta',1,95000.00,1),\n (3,'Prof. Khan',1,90000.00,1),(4,'Dr. Menon',2,120000.00,NULL),\n (5,'Prof. Bose',2,85000.00,4),(6,'Dr. Kulkarni',3,110000.00,NULL),\n (7,'Prof. Das',3,80000.00,6),(8,'Prof. Pillai',NULL,70000.00,NULL);\nSELECT s.name, dept_id, d.dept_name\nFROM students s\nJOIN departments d USING (dept_id)\nWHERE dept_id IN (2, 4)\nORDER BY dept_id, s.name;\nSELECT s.name, s.dept_id, d.dept_name\nFROM students s\nJOIN departments d ON d.dept_id = s.dept_id\nWHERE s.dept_id IN (2, 4)\nORDER BY s.dept_id, s.name;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> CREATE TABLE courses ( -> 0 row(s) affected\n>> CREATE TABLE enrollments ( -> 0 row(s) affected\n>> CREATE TABLE faculty ( -> 0 row(s) affected\n>> INSERT INTO departments VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> INSERT INTO students (name, gender, city, dept_id, marks) VALUES -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> INSERT INTO courses VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO enrollments (student_id, course_id, grade) VALUES -> 12 row(s) affected Records: 12  Duplicates: 0  Warnings: 0\n>> INSERT INTO faculty VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> SELECT s.name, dept_id, d.dept_name\n+-------------+---------+-------------+\n| name        | dept_id | dept_name   |\n+-------------+---------+-------------+\n| Rohan Verma | 2       | Electronics |\n| Sneha Iyer  | 2       | Electronics |\n| Meera Nair  | 4       | Civil       |\n+-------------+---------+-------------+\n3 row(s) returned\n>> SELECT s.name, s.dept_id, d.dept_name\n+-------------+---------+-------------+\n| name        | dept_id | dept_name   |\n+-------------+---------+-------------+\n| Rohan Verma | 2       | Electronics |\n| Sneha Iyer  | 2       | Electronics |\n| Meera Nair  | 4       | Civil       |\n+-------------+---------+-------------+\n3 row(s) returned",
      "explanation": "With USING(dept_id) the join column is merged into one, so it can be written without a prefix. With ON, both s.dept_id and d.dept_id exist and you must qualify it. Both queries return the same three students from Electronics and Civil."
    },
    {
      "title": "Join + GROUP BY: enrollments and fee revenue per department",
      "scenario": "For each department, count enrollments in its courses, the number of different students, and the total course fee revenue.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script"
      ],
      "code": "SELECT d.dept_name,\n       COUNT(e.enroll_id)          AS enrollments,\n       COUNT(DISTINCT e.student_id) AS students,\n       SUM(c.fee)                  AS revenue\nFROM departments d\nJOIN courses c     ON c.dept_id   = d.dept_id\nJOIN enrollments e ON e.course_id = c.course_id\nGROUP BY d.dept_id, d.dept_name\nORDER BY revenue DESC;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL,\n  location VARCHAR(50)\n);\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  gender ENUM('M','F'),\n  city VARCHAR(40),\n  dept_id INT,\n  marks INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE courses (\n  course_id INT PRIMARY KEY,\n  course_name VARCHAR(60) NOT NULL,\n  dept_id INT,\n  credits INT,\n  fee DECIMAL(10,2),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE enrollments (\n  enroll_id INT AUTO_INCREMENT PRIMARY KEY,\n  student_id INT NOT NULL,\n  course_id INT NOT NULL,\n  grade CHAR(1),\n  FOREIGN KEY (student_id) REFERENCES students(student_id),\n  FOREIGN KEY (course_id) REFERENCES courses(course_id)\n);\nCREATE TABLE faculty (\n  faculty_id INT PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INT,\n  salary DECIMAL(10,2),\n  manager_id INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO departments VALUES\n (1,'Computer Science','Block A'),(2,'Electronics','Block B'),\n (3,'Mechanical','Block C'),(4,'Civil','Block D'),(5,'Management','Block E');\nINSERT INTO students (name, gender, city, dept_id, marks) VALUES\n ('Aarav Sharma','M','Pune',1,88),('Diya Patel','F','Mumbai',1,92),\n ('Rohan Verma','M','Delhi',2,75),('Sneha Iyer','F','Chennai',2,81),\n ('Kabir Singh','M','Pune',3,67),('Ananya Rao','F','Bengaluru',1,95),\n ('Vikram Joshi','M','Mumbai',3,58),('Meera Nair','F','Kochi',4,72),\n ('Arjun Mehta','M','Delhi',NULL,64),('Priya Desai','F','Pune',NULL,79);\nINSERT INTO courses VALUES\n (101,'Database Systems',1,4,15000.00),(102,'Python Programming',1,3,12000.00),\n (103,'Digital Electronics',2,4,14000.00),(104,'Thermodynamics',3,3,11000.00),\n (105,'Structural Analysis',4,4,13000.00),(106,'Machine Learning',1,4,18000.00),\n (107,'Marketing Basics',5,2,9000.00);\nINSERT INTO enrollments (student_id, course_id, grade) VALUES\n (1,101,'A'),(1,102,'B'),(2,101,'A'),(2,106,'A'),(3,103,'B'),\n (4,103,'A'),(5,104,'C'),(6,101,'A'),(6,106,'A'),(7,104,'D'),\n (8,105,'B'),(9,102,'C');\nINSERT INTO faculty VALUES\n (1,'Dr. Rao',1,150000.00,NULL),(2,'Prof. Gupta',1,95000.00,1),\n (3,'Prof. Khan',1,90000.00,1),(4,'Dr. Menon',2,120000.00,NULL),\n (5,'Prof. Bose',2,85000.00,4),(6,'Dr. Kulkarni',3,110000.00,NULL),\n (7,'Prof. Das',3,80000.00,6),(8,'Prof. Pillai',NULL,70000.00,NULL);\nSELECT d.dept_name,\n       COUNT(e.enroll_id)          AS enrollments,\n       COUNT(DISTINCT e.student_id) AS students,\n       SUM(c.fee)                  AS revenue\nFROM departments d\nJOIN courses c     ON c.dept_id   = d.dept_id\nJOIN enrollments e ON e.course_id = c.course_id\nGROUP BY d.dept_id, d.dept_name\nORDER BY revenue DESC;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> CREATE TABLE courses ( -> 0 row(s) affected\n>> CREATE TABLE enrollments ( -> 0 row(s) affected\n>> CREATE TABLE faculty ( -> 0 row(s) affected\n>> INSERT INTO departments VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> INSERT INTO students (name, gender, city, dept_id, marks) VALUES -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> INSERT INTO courses VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO enrollments (student_id, course_id, grade) VALUES -> 12 row(s) affected Records: 12  Duplicates: 0  Warnings: 0\n>> INSERT INTO faculty VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> SELECT d.dept_name,\n+------------------+-------------+----------+---------+\n| dept_name        | enrollments | students | revenue |\n+------------------+-------------+----------+---------+\n| Computer Science | 7           | 4        | 105000  |\n| Electronics      | 2           | 2        | 28000   |\n| Mechanical       | 2           | 2        | 22000   |\n| Civil            | 1           | 1        | 13000   |\n+------------------+-------------+----------+---------+\n4 row(s) returned",
      "explanation": "Joining enrollments repeats each course once per enrolled student, so SUM(c.fee) is the fee revenue. Computer Science has 7 enrollments (Database Systems x3, Python x2, Machine Learning x2) from only 4 different students (Aarav, Diya, Ananya and Arjun) - COUNT(DISTINCT) removes the repeats. Management does not appear: its only course has no enrollments, and INNER JOIN drops it."
    },
    {
      "title": "E-commerce: order totals with customer names",
      "scenario": "In the ecommerce database list every delivered order with the customer's name, number of items, and order value.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "Double-click the ecommerce schema",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script"
      ],
      "code": "SELECT o.order_id,\n       o.order_date,\n       c.name                        AS customer,\n       SUM(oi.qty)                   AS items,\n       SUM(oi.qty * oi.unit_price)   AS order_value\nFROM orders o\nJOIN customers c    ON c.customer_id = o.customer_id\nJOIN order_items oi ON oi.order_id   = o.order_id\nWHERE o.status = 'DELIVERED'\nGROUP BY o.order_id, o.order_date, c.name\nORDER BY o.order_date;",
      "mysql": "CREATE DATABASE IF NOT EXISTS ecommerce;\nUSE ecommerce;\nDROP TABLE IF EXISTS payments;\nDROP TABLE IF EXISTS order_items;\nDROP TABLE IF EXISTS orders;\nDROP TABLE IF EXISTS products;\nDROP TABLE IF EXISTS customers;\nCREATE TABLE customers (\n  customer_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(60) NOT NULL,\n  city VARCHAR(40),\n  email VARCHAR(80) UNIQUE,\n  signup_date DATE\n);\nCREATE TABLE products (\n  product_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(80) NOT NULL,\n  category VARCHAR(40),\n  price DECIMAL(10,2) NOT NULL CHECK (price > 0),\n  stock INT DEFAULT 0\n);\nCREATE TABLE orders (\n  order_id INT AUTO_INCREMENT PRIMARY KEY,\n  customer_id INT NOT NULL,\n  order_date DATE NOT NULL,\n  status ENUM('PLACED','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PLACED',\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);\nCREATE TABLE order_items (\n  item_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  product_id INT NOT NULL,\n  qty INT NOT NULL CHECK (qty > 0),\n  unit_price DECIMAL(10,2) NOT NULL,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nCREATE TABLE payments (\n  payment_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  amount DECIMAL(10,2) NOT NULL,\n  method ENUM('UPI','CARD','COD','NETBANKING'),\n  paid_on DATE,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id)\n);\nINSERT INTO customers (name, city, email, signup_date) VALUES\n ('Rahul Khanna','Mumbai','rahul@mail.com','2024-01-10'),\n ('Neha Gupta','Delhi','neha@mail.com','2024-02-15'),\n ('Amit Shah','Pune','amit@mail.com','2024-03-05'),\n ('Pooja Reddy','Hyderabad','pooja@mail.com','2024-03-20'),\n ('Karan Malhotra','Delhi','karan@mail.com','2024-04-01'),\n ('Isha Kapoor','Mumbai','isha@mail.com','2024-05-12');\nINSERT INTO products (name, category, price, stock) VALUES\n ('Laptop Pro 14','Electronics',75000.00,15),('Wireless Mouse','Electronics',800.00,200),\n ('Office Chair','Furniture',6500.00,40),('Study Table','Furniture',9000.00,25),\n ('Running Shoes','Fashion',3500.00,60),('Cotton T-Shirt','Fashion',600.00,150),\n ('Bluetooth Speaker','Electronics',2500.00,0);\nINSERT INTO orders (customer_id, order_date, status) VALUES\n (1,'2024-06-01','DELIVERED'),(2,'2024-06-03','DELIVERED'),(1,'2024-06-10','SHIPPED'),\n (3,'2024-06-15','DELIVERED'),(4,'2024-06-20','CANCELLED'),(2,'2024-07-02','DELIVERED'),\n (5,'2024-07-05','PLACED'),(3,'2024-07-18','DELIVERED');\nINSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES\n (1,1,1,75000.00),(1,2,2,800.00),(2,3,1,6500.00),(2,6,3,600.00),\n (3,5,1,3500.00),(4,4,1,9000.00),(4,3,2,6500.00),(5,7,1,2500.00),\n (6,1,1,75000.00),(6,5,2,3500.00),(7,6,4,600.00),(8,2,1,800.00),(8,6,2,600.00);\nINSERT INTO payments (order_id, amount, method, paid_on) VALUES\n (1,76600.00,'CARD','2024-06-01'),(2,8300.00,'UPI','2024-06-03'),\n (3,3500.00,'UPI','2024-06-10'),(4,22000.00,'NETBANKING','2024-06-15'),\n (6,82000.00,'CARD','2024-07-02'),(8,2000.00,'COD','2024-07-20');\nSELECT o.order_id,\n       o.order_date,\n       c.name                        AS customer,\n       SUM(oi.qty)                   AS items,\n       SUM(oi.qty * oi.unit_price)   AS order_value\nFROM orders o\nJOIN customers c    ON c.customer_id = o.customer_id\nJOIN order_items oi ON oi.order_id   = o.order_id\nWHERE o.status = 'DELIVERED'\nGROUP BY o.order_id, o.order_date, c.name\nORDER BY o.order_date;",
      "result": ">> CREATE DATABASE IF NOT EXISTS ecommerce -> 1 row(s) affected\n>> USE ecommerce -> 0 row(s) affected\n>> DROP TABLE IF EXISTS payments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS order_items -> 0 row(s) affected\n>> DROP TABLE IF EXISTS orders -> 0 row(s) affected\n>> DROP TABLE IF EXISTS products -> 0 row(s) affected\n>> DROP TABLE IF EXISTS customers -> 0 row(s) affected\n>> CREATE TABLE customers ( -> 0 row(s) affected\n>> CREATE TABLE products ( -> 0 row(s) affected\n>> CREATE TABLE orders ( -> 0 row(s) affected\n>> CREATE TABLE order_items ( -> 0 row(s) affected\n>> CREATE TABLE payments ( -> 0 row(s) affected\n>> INSERT INTO customers (name, city, email, signup_date) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> INSERT INTO products (name, category, price, stock) VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO orders (customer_id, order_date, status) VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES -> 13 row(s) affected Records: 13  Duplicates: 0  Warnings: 0\n>> INSERT INTO payments (order_id, amount, method, paid_on) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> SELECT o.order_id,\n+----------+------------+--------------+-------+-------------+\n| order_id | order_date | customer     | items | order_value |\n+----------+------------+--------------+-------+-------------+\n| 1        | 2024-06-01 | Rahul Khanna | 3     | 76600       |\n| 2        | 2024-06-03 | Neha Gupta   | 4     | 8300        |\n| 4        | 2024-06-15 | Amit Shah    | 3     | 22000       |\n| 6        | 2024-07-02 | Neha Gupta   | 3     | 82000       |\n| 8        | 2024-07-18 | Amit Shah    | 3     | 2000        |\n+----------+------------+--------------+-------+-------------+\n5 row(s) returned",
      "explanation": "orders -> customers is many-to-one (one name per order) and orders -> order_items is one-to-many, so grouping by order collapses the item rows back to one row per order. Only DELIVERED orders are kept (5 of 8)."
    }
  ],
  "interview": [
    {
      "q": "What is an INNER JOIN?",
      "a": "A join that returns only rows where the join condition is true in both tables; unmatched rows from either side are excluded.",
      "level": "Beginner"
    },
    {
      "q": "Is JOIN the same as INNER JOIN?",
      "a": "Yes. In MySQL JOIN, INNER JOIN and CROSS JOIN with an ON clause are equivalent.",
      "level": "Beginner"
    },
    {
      "q": "Why are rows with NULL in the foreign key missing from an INNER JOIN?",
      "a": "NULL = value is unknown, never true, so those rows find no match. Use LEFT JOIN to keep them.",
      "level": "Beginner"
    },
    {
      "q": "What causes Error 1052 'Column is ambiguous'?",
      "a": "A column name exists in more than one joined table and is used without a table name or alias prefix.",
      "level": "Beginner"
    },
    {
      "q": "How many join conditions do you need to join 4 tables?",
      "a": "Normally 3 (n - 1). Missing one creates a Cartesian product for that table.",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between ON and USING?",
      "a": "ON accepts any condition and keeps both columns; USING(col) requires the same column name in both tables, compares for equality and returns the column once.",
      "level": "Intermediate"
    },
    {
      "q": "Why should you avoid NATURAL JOIN?",
      "a": "It joins on all columns that share a name, so schema changes (adding a 'name' or 'created_at' column) silently change the join logic.",
      "level": "Intermediate"
    },
    {
      "q": "Implicit join (FROM a, b WHERE ...) vs explicit JOIN?",
      "a": "Same execution plan, but explicit JOIN separates join conditions from filters, is easier to read and avoids accidental Cartesian products.",
      "level": "Beginner"
    },
    {
      "q": "Does the order of tables in an INNER JOIN matter?",
      "a": "Not for the result. The optimizer chooses the join order; for OUTER joins the order does matter.",
      "level": "Intermediate"
    },
    {
      "q": "How do you join a many-to-many relationship?",
      "a": "Through the junction table: students JOIN enrollments ON ... JOIN courses ON ...",
      "level": "Beginner"
    },
    {
      "q": "Why might a join return more rows than expected?",
      "a": "One-to-many relationships repeat the parent row for each child, duplicates in the joined column, or a missing/incorrect join condition.",
      "level": "Intermediate"
    },
    {
      "q": "What is a non-equi join?",
      "a": "A join whose condition is not equality, e.g. s.marks BETWEEN g.min_marks AND g.max_marks.",
      "level": "Advanced"
    }
  ],
  "practice": [
    {
      "task": "List faculty members with their department name and location (exclude faculty without department).",
      "hint": "faculty JOIN departments ON dept_id.",
      "solution": "SELECT f.name, d.dept_name, d.location\nFROM faculty f\nJOIN departments d ON d.dept_id = f.dept_id\nORDER BY d.dept_name, f.name;"
    },
    {
      "task": "Show the courses taken by students from Pune with the grade.",
      "hint": "students -> enrollments -> courses, WHERE s.city = 'Pune'.",
      "solution": "SELECT s.name, c.course_name, e.grade\nFROM students s\nJOIN enrollments e ON e.student_id = s.student_id\nJOIN courses c     ON c.course_id = e.course_id\nWHERE s.city = 'Pune';"
    },
    {
      "task": "Count how many students are enrolled in each course (only courses with enrollments), most popular first.",
      "hint": "courses JOIN enrollments GROUP BY course.",
      "solution": "SELECT c.course_name, COUNT(*) AS students\nFROM courses c\nJOIN enrollments e ON e.course_id = c.course_id\nGROUP BY c.course_id, c.course_name\nORDER BY students DESC, c.course_name;"
    },
    {
      "task": "Find students who are enrolled in a course of a DIFFERENT department than their own.",
      "hint": "Join students, enrollments, courses and compare s.dept_id <> c.dept_id.",
      "solution": "SELECT s.name, s.dept_id AS student_dept, c.course_name, c.dept_id AS course_dept\nFROM students s\nJOIN enrollments e ON e.student_id = s.student_id\nJOIN courses c     ON c.course_id = e.course_id\nWHERE s.dept_id <> c.dept_id;"
    },
    {
      "task": "(ecommerce) Show each payment with order date, customer name and method, for payments above 5000.",
      "hint": "payments -> orders -> customers.",
      "solution": "SELECT p.payment_id, o.order_date, c.name, p.method, p.amount\nFROM payments p\nJOIN orders o    ON o.order_id = p.order_id\nJOIN customers c ON c.customer_id = o.customer_id\nWHERE p.amount > 5000\nORDER BY p.amount DESC;"
    }
  ],
  "quiz": [
    {
      "question": "An INNER JOIN between students (10 rows, 2 with NULL dept_id) and departments returns at most how many student rows (one dept per student)?",
      "options": [
        "10",
        "8",
        "12",
        "2"
      ],
      "answer": 1,
      "explanation": "The 2 students with NULL dept_id have no match."
    },
    {
      "question": "Which keyword can replace INNER JOIN without changing the result?",
      "options": [
        "LEFT JOIN",
        "OUTER JOIN",
        "UNION",
        "JOIN"
      ],
      "answer": 3,
      "explanation": "JOIN defaults to INNER JOIN."
    },
    {
      "question": "Error 1052 means:",
      "options": [
        "Table does not exist",
        "Duplicate key",
        "Column name is ambiguous",
        "Syntax error"
      ],
      "answer": 2,
      "explanation": "Qualify the column with a table alias."
    },
    {
      "question": "To join students and courses (many-to-many) you need:",
      "options": [
        "The junction table enrollments",
        "A CROSS JOIN",
        "A UNION",
        "A self join"
      ],
      "answer": 0,
      "explanation": "Many-to-many relationships are resolved through a bridge table."
    },
    {
      "question": "FROM a JOIN b USING (id) is equivalent to:",
      "options": [
        "FROM a, b",
        "FROM a LEFT JOIN b ON a.id = b.id",
        "FROM a NATURAL JOIN b always",
        "FROM a JOIN b ON a.id = b.id (id shown once)"
      ],
      "answer": 3,
      "explanation": "USING is shorthand for an equality ON on the named column, returning that column once."
    }
  ]
};
