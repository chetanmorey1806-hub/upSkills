export default {
  id: 'day-046-sql-joins-inner-left-right-full-cross',
  title: 'SQL Joins: INNER, LEFT, RIGHT, FULL and CROSS JOIN',
  module: 'SQL Server & Database Management',
  day: 46,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Combine data from related tables with joins. Learn INNER JOIN (only matches), LEFT and RIGHT OUTER JOIN (keep all rows of one side), FULL OUTER JOIN (keep everything), CROSS JOIN (every combination) and SELF JOIN, using Student and Course details.',
  objectives: [
    'Explain why data is split into tables and joined back with keys',
    'Write INNER, LEFT, RIGHT, FULL OUTER and CROSS joins',
    'Find unmatched rows with LEFT JOIN ... WHERE key IS NULL',
    'Combine joins with GROUP BY and use a SELF JOIN',
  ],
  theory: [
    {
      heading: 'Why Joins?',
      content: 'In a normalised database, related data is stored in separate tables (Students and Courses) and linked by keys (Students.CourseId -> Courses.CourseId). A JOIN puts the pieces back together in a query. The ON clause tells SQL Server which columns must match.',
      syntax: `SELECT s.FullName, c.CourseName
FROM Students s
JOIN Courses c ON s.CourseId = c.CourseId;`,
      points: ['Always use table aliases (s, c) and prefix columns - avoids "Ambiguous column name" errors', 'JOIN alone means INNER JOIN', 'Joins can be chained: FROM A JOIN B ON ... JOIN C ON ...'],
    },
    {
      heading: 'INNER JOIN',
      content: 'Returns only rows that have a match in BOTH tables. A student without a course, or a course without students, is not shown. Venn diagram: the overlapping middle part.',
      syntax: `SELECT s.FullName, c.CourseName
FROM Students s
INNER JOIN Courses c ON s.CourseId = c.CourseId;`,
    },
    {
      heading: 'LEFT and RIGHT OUTER JOIN',
      content: 'LEFT JOIN returns ALL rows from the left (first) table plus matching rows from the right; where there is no match, the right-side columns are NULL. RIGHT JOIN is the mirror image: all rows from the right table. Most developers rewrite RIGHT joins as LEFT joins by swapping table order.',
      syntax: `-- all students, with course if any
SELECT s.FullName, c.CourseName
FROM Students s LEFT JOIN Courses c ON s.CourseId = c.CourseId;

-- students NOT enrolled (anti-join)
SELECT s.FullName
FROM Students s LEFT JOIN Courses c ON s.CourseId = c.CourseId
WHERE c.CourseId IS NULL;`,
      tip: 'A condition on the right table placed in WHERE turns a LEFT JOIN into an INNER JOIN (NULL rows are filtered out). Put such conditions in the ON clause if you want to keep unmatched left rows.',
    },
    {
      heading: 'FULL OUTER JOIN',
      content: 'Returns all rows from BOTH tables: matched rows are combined, unmatched rows from either side appear with NULLs on the other side. Useful for reconciliation reports ("what is missing on either side?").',
      syntax: `SELECT s.FullName, c.CourseName
FROM Students s FULL OUTER JOIN Courses c ON s.CourseId = c.CourseId;`,
    },
    {
      heading: 'CROSS JOIN and SELF JOIN',
      content: 'CROSS JOIN returns the Cartesian product - every row of A combined with every row of B (3 sizes x 2 colours = 6 rows). No ON clause. A SELF JOIN joins a table to itself using two aliases - for example, an Employees table where ManagerId points to another employee.',
      syntax: `SELECT z.Size, c.Color FROM Sizes z CROSS JOIN Colors c;

SELECT e.EmpName AS Employee, m.EmpName AS Manager
FROM Employees e LEFT JOIN Employees m ON e.ManagerId = m.EmpId;`,
      points: ['CROSS JOIN of 1000 x 1000 rows = 1,000,000 rows - use carefully', 'SELF JOIN is not a keyword; it is any join of a table with itself'],
    },
    {
      heading: 'Joins with Aggregates',
      content: 'Joins are often followed by GROUP BY. To include parents with zero children, start FROM the parent and LEFT JOIN the child, and count a child column (COUNT(s.StudentId)), not COUNT(*) - COUNT(*) would count the NULL row as 1.',
      syntax: `SELECT c.CourseName, COUNT(s.StudentId) AS Students
FROM Courses c LEFT JOIN Students s ON s.CourseId = c.CourseId
GROUP BY c.CourseName;`,
    },
  ],
  examples: [
    {
      title: 'INNER JOIN - student and course details',
      scenario: 'Day 46 practical: show each enrolled student with course name and fees. Amit (no course) and Azure (no students) exist in the data.',
      steps: ['Open SSMS > New Query (Ctrl+N)', 'Type the script (creates Courses and Students)', 'Press F5'],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL,
    Fees INT NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(50) NOT NULL,
    City NVARCHAR(30),
    CourseId INT NULL FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName, Fees) VALUES
('.NET Full Stack', 45000), ('SQL Server', 12000), ('React', 18000), ('Azure', 25000);
INSERT INTO Students (FullName, City, CourseId) VALUES
('Asha', 'Pune', 1), ('Ravi', 'Mumbai', 2), ('Kiran', 'Nagpur', 1),
('Neha', 'Pune', 3), ('Amit', 'Delhi', NULL);
GO
SELECT s.StudentId, s.FullName, c.CourseName, c.Fees
FROM Students s
INNER JOIN Courses c ON s.CourseId = c.CourseId
ORDER BY s.StudentId;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL,
    Fees INT NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(50) NOT NULL,
    City NVARCHAR(30),
    CourseId INT NULL FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName, Fees) VALUES
('.NET Full Stack', 45000), ('SQL Server', 12000), ('React', 18000), ('Azure', 25000);
INSERT INTO Students (FullName, City, CourseId) VALUES
('Asha', 'Pune', 1), ('Ravi', 'Mumbai', 2), ('Kiran', 'Nagpur', 1),
('Neha', 'Pune', 3), ('Amit', 'Delhi', NULL);
GO
SELECT s.StudentId, s.FullName, c.CourseName, c.Fees
FROM Students s
INNER JOIN Courses c ON s.CourseId = c.CourseId
ORDER BY s.StudentId;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Courses ( -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Courses (CourseName, Fees) VALUES -> (4 rows affected)
>> INSERT INTO Students (FullName, City, CourseId) VALUES -> (5 rows affected)
>> SELECT s.StudentId, s.FullName, c.CourseName, c.Fees
+-----------+----------+-----------------+-------+
| StudentId | FullName | CourseName      | Fees  |
+-----------+----------+-----------------+-------+
| 1         | Asha     | .NET Full Stack | 45000 |
| 2         | Ravi     | SQL Server      | 12000 |
| 3         | Kiran    | .NET Full Stack | 45000 |
| 4         | Neha     | React           | 18000 |
+-----------+----------+-----------------+-------+
4 row(s) returned`,
      explanation: 'Only 4 rows: Amit has CourseId NULL so he has no match; Azure has no students. INNER JOIN shows matches only.',
    },
    {
      title: 'LEFT JOIN - all students, and the unenrolled ones',
      scenario: 'The office wants every student listed, plus a list of students who have not chosen a course.',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL,
    Fees INT NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(50) NOT NULL,
    City NVARCHAR(30),
    CourseId INT NULL FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName, Fees) VALUES
('.NET Full Stack', 45000), ('SQL Server', 12000), ('React', 18000), ('Azure', 25000);
INSERT INTO Students (FullName, City, CourseId) VALUES
('Asha', 'Pune', 1), ('Ravi', 'Mumbai', 2), ('Kiran', 'Nagpur', 1),
('Neha', 'Pune', 3), ('Amit', 'Delhi', NULL);
GO
SELECT s.FullName, ISNULL(c.CourseName, 'Not enrolled') AS CourseName
FROM Students s
LEFT JOIN Courses c ON s.CourseId = c.CourseId
ORDER BY s.StudentId;
SELECT s.FullName
FROM Students s
LEFT JOIN Courses c ON s.CourseId = c.CourseId
WHERE c.CourseId IS NULL;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL,
    Fees INT NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(50) NOT NULL,
    City NVARCHAR(30),
    CourseId INT NULL FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName, Fees) VALUES
('.NET Full Stack', 45000), ('SQL Server', 12000), ('React', 18000), ('Azure', 25000);
INSERT INTO Students (FullName, City, CourseId) VALUES
('Asha', 'Pune', 1), ('Ravi', 'Mumbai', 2), ('Kiran', 'Nagpur', 1),
('Neha', 'Pune', 3), ('Amit', 'Delhi', NULL);
GO
SELECT s.FullName, ISNULL(c.CourseName, 'Not enrolled') AS CourseName
FROM Students s
LEFT JOIN Courses c ON s.CourseId = c.CourseId
ORDER BY s.StudentId;
SELECT s.FullName
FROM Students s
LEFT JOIN Courses c ON s.CourseId = c.CourseId
WHERE c.CourseId IS NULL;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Courses ( -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Courses (CourseName, Fees) VALUES -> (4 rows affected)
>> INSERT INTO Students (FullName, City, CourseId) VALUES -> (5 rows affected)
>> SELECT s.FullName, ISNULL(c.CourseName, 'Not enrolled') AS CourseName
+----------+-----------------+
| FullName | CourseName      |
+----------+-----------------+
| Asha     | .NET Full Stack |
| Ravi     | SQL Server      |
| Kiran    | .NET Full Stack |
| Neha     | React           |
| Amit     | Not enrolled    |
+----------+-----------------+
5 row(s) returned
>> SELECT s.FullName
+----------+
| FullName |
+----------+
| Amit     |
+----------+
1 row(s) returned`,
      explanation: 'LEFT JOIN keeps all 5 students; Amit gets NULL course, displayed as "Not enrolled" by ISNULL. The second query keeps only rows where no course matched - the classic "find missing" pattern.',
    },
    {
      title: 'RIGHT JOIN and FULL OUTER JOIN',
      scenario: 'List every course with its students (even empty courses), then a complete reconciliation of both tables.',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL,
    Fees INT NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(50) NOT NULL,
    City NVARCHAR(30),
    CourseId INT NULL FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName, Fees) VALUES
('.NET Full Stack', 45000), ('SQL Server', 12000), ('React', 18000), ('Azure', 25000);
INSERT INTO Students (FullName, City, CourseId) VALUES
('Asha', 'Pune', 1), ('Ravi', 'Mumbai', 2), ('Kiran', 'Nagpur', 1),
('Neha', 'Pune', 3), ('Amit', 'Delhi', NULL);
GO
SELECT c.CourseName, s.FullName
FROM Students s
RIGHT JOIN Courses c ON s.CourseId = c.CourseId
ORDER BY c.CourseId, s.FullName;
SELECT s.FullName, c.CourseName
FROM Students s
FULL OUTER JOIN Courses c ON s.CourseId = c.CourseId
ORDER BY c.CourseName, s.FullName;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL,
    Fees INT NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(50) NOT NULL,
    City NVARCHAR(30),
    CourseId INT NULL FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName, Fees) VALUES
('.NET Full Stack', 45000), ('SQL Server', 12000), ('React', 18000), ('Azure', 25000);
INSERT INTO Students (FullName, City, CourseId) VALUES
('Asha', 'Pune', 1), ('Ravi', 'Mumbai', 2), ('Kiran', 'Nagpur', 1),
('Neha', 'Pune', 3), ('Amit', 'Delhi', NULL);
GO
SELECT c.CourseName, s.FullName
FROM Students s
RIGHT JOIN Courses c ON s.CourseId = c.CourseId
ORDER BY c.CourseId, s.FullName;
SELECT s.FullName, c.CourseName
FROM Students s
FULL OUTER JOIN Courses c ON s.CourseId = c.CourseId
ORDER BY c.CourseName, s.FullName;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Courses ( -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Courses (CourseName, Fees) VALUES -> (4 rows affected)
>> INSERT INTO Students (FullName, City, CourseId) VALUES -> (5 rows affected)
>> SELECT c.CourseName, s.FullName
+-----------------+----------+
| CourseName      | FullName |
+-----------------+----------+
| .NET Full Stack | Asha     |
| .NET Full Stack | Kiran    |
| SQL Server      | Ravi     |
| React           | Neha     |
| Azure           | NULL     |
+-----------------+----------+
5 row(s) returned
>> SELECT s.FullName, c.CourseName
+----------+-----------------+
| FullName | CourseName      |
+----------+-----------------+
| Amit     | NULL            |
| Asha     | .NET Full Stack |
| Kiran    | .NET Full Stack |
| NULL     | Azure           |
| Neha     | React           |
| Ravi     | SQL Server      |
+----------+-----------------+
6 row(s) returned`,
      explanation: 'RIGHT JOIN keeps all courses: Azure appears with NULL student. FULL OUTER JOIN keeps everything: Amit (no course) AND Azure (no student). NULL CourseName sorts first in ascending order.',
    },
    {
      title: 'Course-wise count and revenue with LEFT JOIN + GROUP BY',
      scenario: 'Management wants students per course and fee revenue, including courses with zero students.',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL,
    Fees INT NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(50) NOT NULL,
    City NVARCHAR(30),
    CourseId INT NULL FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName, Fees) VALUES
('.NET Full Stack', 45000), ('SQL Server', 12000), ('React', 18000), ('Azure', 25000);
INSERT INTO Students (FullName, City, CourseId) VALUES
('Asha', 'Pune', 1), ('Ravi', 'Mumbai', 2), ('Kiran', 'Nagpur', 1),
('Neha', 'Pune', 3), ('Amit', 'Delhi', NULL);
GO
SELECT c.CourseName, COUNT(s.StudentId) AS Students, COUNT(s.StudentId) * c.Fees AS Revenue
FROM Courses c
LEFT JOIN Students s ON s.CourseId = c.CourseId
GROUP BY c.CourseName, c.Fees
ORDER BY Revenue DESC;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL,
    Fees INT NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(50) NOT NULL,
    City NVARCHAR(30),
    CourseId INT NULL FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName, Fees) VALUES
('.NET Full Stack', 45000), ('SQL Server', 12000), ('React', 18000), ('Azure', 25000);
INSERT INTO Students (FullName, City, CourseId) VALUES
('Asha', 'Pune', 1), ('Ravi', 'Mumbai', 2), ('Kiran', 'Nagpur', 1),
('Neha', 'Pune', 3), ('Amit', 'Delhi', NULL);
GO
SELECT c.CourseName, COUNT(s.StudentId) AS Students, COUNT(s.StudentId) * c.Fees AS Revenue
FROM Courses c
LEFT JOIN Students s ON s.CourseId = c.CourseId
GROUP BY c.CourseName, c.Fees
ORDER BY Revenue DESC;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Courses ( -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Courses (CourseName, Fees) VALUES -> (4 rows affected)
>> INSERT INTO Students (FullName, City, CourseId) VALUES -> (5 rows affected)
>> SELECT c.CourseName, COUNT(s.StudentId) AS Students, COUNT(s.StudentId
+-----------------+----------+---------+
| CourseName      | Students | Revenue |
+-----------------+----------+---------+
| .NET Full Stack | 2        | 90000   |
| React           | 1        | 18000   |
| SQL Server      | 1        | 12000   |
| Azure           | 0        | 0       |
+-----------------+----------+---------+
4 row(s) returned`,
      explanation: 'Starting FROM Courses and LEFT JOINing Students keeps Azure. COUNT(s.StudentId) gives 0 for Azure; COUNT(*) would wrongly give 1. Fees is in GROUP BY so it can be used in the SELECT expression.',
    },
    {
      title: 'CROSS JOIN and SELF JOIN',
      scenario: 'Generate all T-shirt size/colour combinations, and show each employee with their manager.',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE ShopDB;
GO
USE ShopDB;
GO
CREATE TABLE Sizes (Size VARCHAR(5));
CREATE TABLE Colors (Color VARCHAR(10));
INSERT INTO Sizes VALUES ('S'), ('M'), ('L');
INSERT INTO Colors VALUES ('Red'), ('Blue');
GO
SELECT z.Size, c.Color FROM Sizes z CROSS JOIN Colors c ORDER BY z.Size, c.Color;
GO
CREATE TABLE Employees (
    EmpId INT PRIMARY KEY,
    EmpName NVARCHAR(30) NOT NULL,
    ManagerId INT NULL
);
INSERT INTO Employees (EmpId, EmpName, ManagerId) VALUES
(1, 'Divya', NULL), (2, 'Arjun', 1), (3, 'Sana', 1), (4, 'Rohan', 2);
GO
SELECT e.EmpName AS Employee, ISNULL(m.EmpName, '-') AS Manager
FROM Employees e
LEFT JOIN Employees m ON e.ManagerId = m.EmpId
ORDER BY e.EmpId;`,
      tsql: `CREATE DATABASE ShopDB;
GO
USE ShopDB;
GO
CREATE TABLE Sizes (Size VARCHAR(5));
CREATE TABLE Colors (Color VARCHAR(10));
INSERT INTO Sizes VALUES ('S'), ('M'), ('L');
INSERT INTO Colors VALUES ('Red'), ('Blue');
GO
SELECT z.Size, c.Color FROM Sizes z CROSS JOIN Colors c ORDER BY z.Size, c.Color;
GO
CREATE TABLE Employees (
    EmpId INT PRIMARY KEY,
    EmpName NVARCHAR(30) NOT NULL,
    ManagerId INT NULL
);
INSERT INTO Employees (EmpId, EmpName, ManagerId) VALUES
(1, 'Divya', NULL), (2, 'Arjun', 1), (3, 'Sana', 1), (4, 'Rohan', 2);
GO
SELECT e.EmpName AS Employee, ISNULL(m.EmpName, '-') AS Manager
FROM Employees e
LEFT JOIN Employees m ON e.ManagerId = m.EmpId
ORDER BY e.EmpId;`,
      result: `>> CREATE DATABASE ShopDB -> Commands completed successfully.
>> USE ShopDB -> Commands completed successfully.
>> CREATE TABLE Sizes (Size VARCHAR(5)) -> Commands completed successfully.
>> CREATE TABLE Colors (Color VARCHAR(10)) -> Commands completed successfully.
>> INSERT INTO Sizes VALUES ('S'), ('M'), ('L') -> (3 rows affected)
>> INSERT INTO Colors VALUES ('Red'), ('Blue') -> (2 rows affected)
>> SELECT z.Size, c.Color FROM Sizes z CROSS JOIN Colors c ORDER BY z.Siz
+------+-------+
| Size | Color |
+------+-------+
| L    | Blue  |
| L    | Red   |
| M    | Blue  |
| M    | Red   |
| S    | Blue  |
| S    | Red   |
+------+-------+
6 row(s) returned
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Employees (EmpId, EmpName, ManagerId) VALUES -> (4 rows affected)
>> SELECT e.EmpName AS Employee, ISNULL(m.EmpName, '-') AS Manager
+----------+---------+
| Employee | Manager |
+----------+---------+
| Divya    | -       |
| Arjun    | Divya   |
| Sana     | Divya   |
| Rohan    | Arjun   |
+----------+---------+
4 row(s) returned`,
      explanation: '3 sizes x 2 colours = 6 combinations. In the self join, alias e is the employee and m is the manager row. Divya has no manager (ManagerId NULL), so LEFT JOIN keeps her and ISNULL shows "-".',
    },
  ],
  interview: [
    { q: 'Difference between INNER JOIN and LEFT JOIN?', a: 'INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table plus matches from the right; unmatched right columns are NULL.', level: 'Easy' },
    { q: 'What is a FULL OUTER JOIN?', a: 'It returns all rows from both tables, matching where possible and filling NULLs where there is no match on either side.', level: 'Easy' },
    { q: 'What is a CROSS JOIN? How many rows does it return?', a: 'A Cartesian product: rows(A) x rows(B). No join condition.', level: 'Easy' },
    { q: 'What is a SELF JOIN? Give an example.', a: 'Joining a table to itself with two aliases, e.g. Employees e JOIN Employees m ON e.ManagerId = m.EmpId to show employee and manager names.', level: 'Medium' },
    { q: 'How do you find students who are not enrolled in any course?', a: 'LEFT JOIN Courses and filter WHERE c.CourseId IS NULL, or use NOT EXISTS.', level: 'Medium' },
    { q: 'Table A has 5 rows, B has 4 rows. Max/min rows for INNER JOIN on a one-to-one key?', a: 'Between 0 and 4 (each B row matches at most one A row). A CROSS JOIN would give 20.', level: 'Medium' },
    { q: 'Why can a condition in WHERE turn a LEFT JOIN into an INNER JOIN?', a: 'Unmatched rows have NULL in the right-table columns; a WHERE condition like c.Fees > 10000 is UNKNOWN for NULL and removes them. Move the condition to the ON clause to keep them.', level: 'Hard' },
    { q: 'In a LEFT JOIN with GROUP BY, why use COUNT(child.Id) instead of COUNT(*)?', a: 'COUNT(*) counts the NULL-extended row as 1 for parents without children; COUNT(child.Id) correctly returns 0.', level: 'Hard' },
    { q: 'What is the "Ambiguous column name" error?', a: 'Both tables have a column with the same name (CourseId) and the query does not say which one; prefix it with the alias.', level: 'Easy' },
    { q: 'Can you join more than two tables?', a: 'Yes - chain joins: FROM Students s JOIN Enrollments e ON ... JOIN Courses c ON ...', level: 'Easy' },
    { q: 'Is RIGHT JOIN needed?', a: 'Not strictly - any RIGHT JOIN can be written as a LEFT JOIN by swapping table order. Teams usually prefer LEFT JOIN for readability.', level: 'Medium' },
  ],
  practice: [
    { task: 'Show student name, city and course fees for students from Pune only.', hint: 'INNER JOIN + WHERE', solution: `SELECT s.FullName, s.City, c.Fees
FROM Students s JOIN Courses c ON s.CourseId = c.CourseId
WHERE s.City = 'Pune';` },
    { task: 'List courses that have no students.', hint: 'LEFT JOIN from Courses, WHERE s.StudentId IS NULL', solution: `SELECT c.CourseName
FROM Courses c LEFT JOIN Students s ON s.CourseId = c.CourseId
WHERE s.StudentId IS NULL;` },
    { task: 'Create an Enrollments table (StudentId, CourseId) for many-to-many and list each student with all their courses.', hint: 'Join three tables', solution: `CREATE TABLE Enrollments (StudentId INT REFERENCES Students(StudentId), CourseId INT REFERENCES Courses(CourseId));
INSERT INTO Enrollments VALUES (1, 1), (1, 2), (2, 2), (4, 3);
SELECT s.FullName, c.CourseName
FROM Students s
JOIN Enrollments e ON e.StudentId = s.StudentId
JOIN Courses c ON c.CourseId = e.CourseId
ORDER BY s.FullName, c.CourseName;` },
    { task: 'Using the self-join Employees table, show managers and how many people report to them.', hint: 'JOIN e to m, GROUP BY m.EmpName', solution: `SELECT m.EmpName AS Manager, COUNT(*) AS Reports
FROM Employees e JOIN Employees m ON e.ManagerId = m.EmpId
GROUP BY m.EmpName;` },
  ],
  quiz: [
    { question: 'Which join returns only matching rows from both tables?', options: ['LEFT JOIN', 'FULL JOIN', 'INNER JOIN', 'CROSS JOIN'], answer: 2, explanation: 'INNER JOIN = intersection.' },
    { question: 'Students LEFT JOIN Courses: a student with no course appears with:', options: ['NULL course columns', 'The row is removed', 'An error', 'The first course'], answer: 0, explanation: 'LEFT JOIN keeps all left rows; missing right values are NULL.' },
    { question: 'A CROSS JOIN between 4 rows and 5 rows gives:', options: ['9 rows', '5 rows', '4 rows', '20 rows'], answer: 3, explanation: 'Cartesian product 4 x 5.' },
    { question: 'Which join keeps unmatched rows from BOTH tables?', options: ['INNER JOIN', 'FULL OUTER JOIN', 'RIGHT JOIN', 'SELF JOIN'], answer: 1, explanation: 'FULL OUTER JOIN keeps everything.' },
    { question: 'Employees e JOIN Employees m ON e.ManagerId = m.EmpId is a:', options: ['SELF JOIN', 'CROSS JOIN', 'NATURAL JOIN', 'Invalid query'], answer: 0, explanation: 'The same table joined to itself with two aliases.' },
  ],
};
