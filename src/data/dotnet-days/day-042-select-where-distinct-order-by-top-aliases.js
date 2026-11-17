export default {
  id: 'day-042-select-where-distinct-order-by-top-aliases',
  title: 'SELECT, WHERE, DISTINCT, ORDER BY, TOP and Aliases',
  module: 'SQL Server & Database Management',
  day: 42,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Read data from SQL Server like a professional: choose columns with SELECT, filter rows with WHERE, remove duplicates with DISTINCT, sort with ORDER BY, limit rows with TOP and OFFSET-FETCH, and rename columns/tables with aliases - all on the StudentDB Students table.',
  objectives: [
    'Write SELECT statements that return only the needed columns',
    'Filter rows with WHERE and comparison operators',
    'Use DISTINCT, ORDER BY (ASC/DESC, multiple columns) and TOP n',
    'Give readable names with column and table aliases',
  ],
  theory: [
    {
      heading: 'SELECT and FROM',
      content: 'SELECT chooses columns, FROM chooses the table. SELECT * returns every column - handy for exploring, but in applications always list the columns you need (less data over the network and the query does not break when columns are added). You can also select calculated expressions.',
      syntax: `SELECT column1, column2, expression
FROM   TableName;`,
      points: [
        'SELECT FullName, Marks FROM Students;',
        'SELECT FullName, Marks * 5 FROM Students;  -- calculated column (no name unless aliased)',
        'SSMS shortcut: drag the Columns folder from Object Explorer into the editor to get all column names',
        'IntelliSense: Ctrl+Space; if new tables are not suggested press Ctrl+Shift+R (refresh local cache)',
      ],
    },
    {
      heading: 'WHERE - Filtering Rows',
      content: 'WHERE keeps only rows for which the condition is TRUE. Comparison operators: = , <> (or !=), > , < , >= , <= . Text and dates go inside single quotes.',
      syntax: `SELECT FullName, Marks FROM Students WHERE Marks >= 75;
SELECT FullName FROM Students WHERE City = 'Pune';
SELECT FullName FROM Students WHERE JoinDate > '2026-03-01';`,
      points: [
        'Logical order of a query: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> TOP',
        'Because WHERE runs before SELECT, you cannot use a column alias inside WHERE',
        'SQL Server text comparison is case-insensitive by default (\'pune\' = \'Pune\'). The in-app lab is case-sensitive, so match the case exactly there',
        'NULL never matches = ; use IS NULL (Day 43)',
      ],
    },
    {
      heading: 'DISTINCT',
      content: 'DISTINCT removes duplicate rows from the RESULT (the table is not changed). With several columns, the COMBINATION of values must be unique.',
      syntax: `SELECT DISTINCT City FROM Students;
SELECT DISTINCT Course, Gender FROM Students;`,
      tip: 'DISTINCT applies to the whole SELECT list, not to just the first column.',
    },
    {
      heading: 'ORDER BY',
      content: 'ORDER BY sorts the result. ASC (ascending, default) or DESC (descending). Multiple columns sort by the first, then break ties with the next. You can sort by an alias or a column not in the SELECT list. Without ORDER BY, SQL Server does NOT guarantee any order.',
      syntax: `SELECT FullName, Course, Marks
FROM Students
ORDER BY Course ASC, Marks DESC, FullName;`,
      points: ['NULLs come first in ASC order in SQL Server', 'ORDER BY 2 sorts by the 2nd selected column (works but avoid - hard to read)'],
    },
    {
      heading: 'TOP and OFFSET-FETCH',
      content: 'TOP n returns only the first n rows. Combine it with ORDER BY to get meaningful results like "top 3 scorers". TOP n PERCENT returns a percentage. TOP n WITH TIES also returns rows that tie with the last one (real SQL Server; not supported in the in-app lab). OFFSET ... FETCH is used for paging (page 2 of a grid).',
      syntax: `SELECT TOP 3 FullName, Marks FROM Students ORDER BY Marks DESC;
SELECT TOP 3 WITH TIES FullName, Marks FROM Students ORDER BY Marks DESC;  -- SSMS only
SELECT FullName FROM Students ORDER BY StudentId
OFFSET 2 ROWS FETCH NEXT 3 ROWS ONLY;   -- skip 2, take 3`,
      tip: 'Paging formula used in ASP.NET Core: OFFSET (pageNumber - 1) * pageSize ROWS FETCH NEXT pageSize ROWS ONLY.',
    },
    {
      heading: 'Aliases',
      content: 'An alias is a temporary name. Column alias: renames a result column (AS is optional). Use [square brackets] or "double quotes" if the alias has spaces. Table alias: a short name for a table (FROM Students AS s), used heavily in joins.',
      syntax: `SELECT s.FullName AS Name, s.Marks * 5 AS [Marks Out Of 500]
FROM Students AS s;`,
      points: ['Alias can be used in ORDER BY (it runs after SELECT)', 'Alias cannot be used in WHERE or GROUP BY of the same query'],
    },
  ],
  examples: [
    {
      title: 'SELECT all columns vs selected columns',
      scenario: 'Display student records - first everything, then only name, city and marks. The script creates StudentDB with 8 students used in all examples today.',
      steps: [
        'Open SSMS > New Query (Ctrl+N)',
        'Type the script below (the first part creates and fills the table)',
        'Press F5 and compare the two result grids',
      ],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Gender CHAR(1),
    City NVARCHAR(50),
    Course NVARCHAR(30),
    Marks INT,
    Email VARCHAR(100),
    JoinDate DATE
);
GO
INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, JoinDate) VALUES
('Asha Patil', 'F', 'Pune', '.NET', 88, 'asha@mail.com', '2026-01-10'),
('Ravi Kumar', 'M', 'Mumbai', 'SQL', 72, 'ravi@mail.com', '2026-02-05'),
('Kiran Shah', 'M', 'Nagpur', '.NET', 91, NULL, '2026-01-20'),
('Neha Joshi', 'F', 'Pune', 'React', 35, 'neha@mail.com', '2026-03-12'),
('Amit Verma', 'M', 'Delhi', 'SQL', 64, NULL, '2026-02-18'),
('Sneha Rao', 'F', 'Mumbai', '.NET', 79, 'sneha@mail.com', '2026-04-01'),
('Rahul Mehta', 'M', 'Pune', 'React', 55, 'rahul@mail.com', '2026-03-25'),
('Pooja Singh', 'F', 'Delhi', '.NET', 91, 'pooja@mail.com', '2026-05-02');
GO
SELECT * FROM Students;
SELECT FullName, City, Marks FROM Students;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Gender CHAR(1),
    City NVARCHAR(50),
    Course NVARCHAR(30),
    Marks INT,
    Email VARCHAR(100),
    JoinDate DATE
);
GO
INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, JoinDate) VALUES
('Asha Patil', 'F', 'Pune', '.NET', 88, 'asha@mail.com', '2026-01-10'),
('Ravi Kumar', 'M', 'Mumbai', 'SQL', 72, 'ravi@mail.com', '2026-02-05'),
('Kiran Shah', 'M', 'Nagpur', '.NET', 91, NULL, '2026-01-20'),
('Neha Joshi', 'F', 'Pune', 'React', 35, 'neha@mail.com', '2026-03-12'),
('Amit Verma', 'M', 'Delhi', 'SQL', 64, NULL, '2026-02-18'),
('Sneha Rao', 'F', 'Mumbai', '.NET', 79, 'sneha@mail.com', '2026-04-01'),
('Rahul Mehta', 'M', 'Pune', 'React', 55, 'rahul@mail.com', '2026-03-25'),
('Pooja Singh', 'F', 'Delhi', '.NET', 91, 'pooja@mail.com', '2026-05-02');
GO
SELECT * FROM Students;
SELECT FullName, City, Marks FROM Students;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT * FROM Students
+-----------+-------------+--------+--------+--------+-------+----------------+------------+
| StudentId | FullName    | Gender | City   | Course | Marks | Email          | JoinDate   |
+-----------+-------------+--------+--------+--------+-------+----------------+------------+
| 1         | Asha Patil  | F      | Pune   | .NET   | 88    | asha@mail.com  | 2026-01-10 |
| 2         | Ravi Kumar  | M      | Mumbai | SQL    | 72    | ravi@mail.com  | 2026-02-05 |
| 3         | Kiran Shah  | M      | Nagpur | .NET   | 91    | NULL           | 2026-01-20 |
| 4         | Neha Joshi  | F      | Pune   | React  | 35    | neha@mail.com  | 2026-03-12 |
| 5         | Amit Verma  | M      | Delhi  | SQL    | 64    | NULL           | 2026-02-18 |
| 6         | Sneha Rao   | F      | Mumbai | .NET   | 79    | sneha@mail.com | 2026-04-01 |
| 7         | Rahul Mehta | M      | Pune   | React  | 55    | rahul@mail.com | 2026-03-25 |
| 8         | Pooja Singh | F      | Delhi  | .NET   | 91    | pooja@mail.com | 2026-05-02 |
+-----------+-------------+--------+--------+--------+-------+----------------+------------+
8 row(s) returned
>> SELECT FullName, City, Marks FROM Students
+-------------+--------+-------+
| FullName    | City   | Marks |
+-------------+--------+-------+
| Asha Patil  | Pune   | 88    |
| Ravi Kumar  | Mumbai | 72    |
| Kiran Shah  | Nagpur | 91    |
| Neha Joshi  | Pune   | 35    |
| Amit Verma  | Delhi  | 64    |
| Sneha Rao   | Mumbai | 79    |
| Rahul Mehta | Pune   | 55    |
| Pooja Singh | Delhi  | 91    |
+-------------+--------+-------+
8 row(s) returned`,
      explanation: 'SELECT * shows all 8 columns. The second query returns the same 8 rows but only 3 columns. NULL in Email means "no value".',
    },
    {
      title: 'Filtering with WHERE',
      scenario: 'Find high scorers, students from Pune, and students who joined after 1 March 2026.',
      steps: [
        'New Query, type the script, press F5',
        'Three result grids appear one below another in the Results tab',
      ],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Gender CHAR(1),
    City NVARCHAR(50),
    Course NVARCHAR(30),
    Marks INT,
    Email VARCHAR(100),
    JoinDate DATE
);
GO
INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, JoinDate) VALUES
('Asha Patil', 'F', 'Pune', '.NET', 88, 'asha@mail.com', '2026-01-10'),
('Ravi Kumar', 'M', 'Mumbai', 'SQL', 72, 'ravi@mail.com', '2026-02-05'),
('Kiran Shah', 'M', 'Nagpur', '.NET', 91, NULL, '2026-01-20'),
('Neha Joshi', 'F', 'Pune', 'React', 35, 'neha@mail.com', '2026-03-12'),
('Amit Verma', 'M', 'Delhi', 'SQL', 64, NULL, '2026-02-18'),
('Sneha Rao', 'F', 'Mumbai', '.NET', 79, 'sneha@mail.com', '2026-04-01'),
('Rahul Mehta', 'M', 'Pune', 'React', 55, 'rahul@mail.com', '2026-03-25'),
('Pooja Singh', 'F', 'Delhi', '.NET', 91, 'pooja@mail.com', '2026-05-02');
GO
SELECT FullName, Course, Marks FROM Students WHERE Marks >= 75;
SELECT FullName, City FROM Students WHERE City = 'Pune';
SELECT FullName, JoinDate FROM Students WHERE JoinDate > '2026-03-01';`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Gender CHAR(1),
    City NVARCHAR(50),
    Course NVARCHAR(30),
    Marks INT,
    Email VARCHAR(100),
    JoinDate DATE
);
GO
INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, JoinDate) VALUES
('Asha Patil', 'F', 'Pune', '.NET', 88, 'asha@mail.com', '2026-01-10'),
('Ravi Kumar', 'M', 'Mumbai', 'SQL', 72, 'ravi@mail.com', '2026-02-05'),
('Kiran Shah', 'M', 'Nagpur', '.NET', 91, NULL, '2026-01-20'),
('Neha Joshi', 'F', 'Pune', 'React', 35, 'neha@mail.com', '2026-03-12'),
('Amit Verma', 'M', 'Delhi', 'SQL', 64, NULL, '2026-02-18'),
('Sneha Rao', 'F', 'Mumbai', '.NET', 79, 'sneha@mail.com', '2026-04-01'),
('Rahul Mehta', 'M', 'Pune', 'React', 55, 'rahul@mail.com', '2026-03-25'),
('Pooja Singh', 'F', 'Delhi', '.NET', 91, 'pooja@mail.com', '2026-05-02');
GO
SELECT FullName, Course, Marks FROM Students WHERE Marks >= 75;
SELECT FullName, City FROM Students WHERE City = 'Pune';
SELECT FullName, JoinDate FROM Students WHERE JoinDate > '2026-03-01';`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT FullName, Course, Marks FROM Students WHERE Marks >= 75
+-------------+--------+-------+
| FullName    | Course | Marks |
+-------------+--------+-------+
| Asha Patil  | .NET   | 88    |
| Kiran Shah  | .NET   | 91    |
| Sneha Rao   | .NET   | 79    |
| Pooja Singh | .NET   | 91    |
+-------------+--------+-------+
4 row(s) returned
>> SELECT FullName, City FROM Students WHERE City = 'Pune'
+-------------+------+
| FullName    | City |
+-------------+------+
| Asha Patil  | Pune |
| Neha Joshi  | Pune |
| Rahul Mehta | Pune |
+-------------+------+
3 row(s) returned
>> SELECT FullName, JoinDate FROM Students WHERE JoinDate > '2026-03-01'
+-------------+------------+
| FullName    | JoinDate   |
+-------------+------------+
| Neha Joshi  | 2026-03-12 |
| Sneha Rao   | 2026-04-01 |
| Rahul Mehta | 2026-03-25 |
| Pooja Singh | 2026-05-02 |
+-------------+------------+
4 row(s) returned`,
      explanation: 'Each WHERE keeps only matching rows. Dates are written as \'YYYY-MM-DD\' strings - the safest format. These queries have no ORDER BY, so the row order is not guaranteed (it usually follows the primary key).',
    },
    {
      title: 'DISTINCT and multi-column ORDER BY',
      scenario: 'List the cities students come from, the unique course/gender combinations, and a course-wise merit list.',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Gender CHAR(1),
    City NVARCHAR(50),
    Course NVARCHAR(30),
    Marks INT,
    Email VARCHAR(100),
    JoinDate DATE
);
GO
INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, JoinDate) VALUES
('Asha Patil', 'F', 'Pune', '.NET', 88, 'asha@mail.com', '2026-01-10'),
('Ravi Kumar', 'M', 'Mumbai', 'SQL', 72, 'ravi@mail.com', '2026-02-05'),
('Kiran Shah', 'M', 'Nagpur', '.NET', 91, NULL, '2026-01-20'),
('Neha Joshi', 'F', 'Pune', 'React', 35, 'neha@mail.com', '2026-03-12'),
('Amit Verma', 'M', 'Delhi', 'SQL', 64, NULL, '2026-02-18'),
('Sneha Rao', 'F', 'Mumbai', '.NET', 79, 'sneha@mail.com', '2026-04-01'),
('Rahul Mehta', 'M', 'Pune', 'React', 55, 'rahul@mail.com', '2026-03-25'),
('Pooja Singh', 'F', 'Delhi', '.NET', 91, 'pooja@mail.com', '2026-05-02');
GO
SELECT DISTINCT City FROM Students ORDER BY City;
SELECT DISTINCT Course, Gender FROM Students ORDER BY Course, Gender;
SELECT FullName, Course, Marks FROM Students ORDER BY Course ASC, Marks DESC, FullName;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Gender CHAR(1),
    City NVARCHAR(50),
    Course NVARCHAR(30),
    Marks INT,
    Email VARCHAR(100),
    JoinDate DATE
);
GO
INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, JoinDate) VALUES
('Asha Patil', 'F', 'Pune', '.NET', 88, 'asha@mail.com', '2026-01-10'),
('Ravi Kumar', 'M', 'Mumbai', 'SQL', 72, 'ravi@mail.com', '2026-02-05'),
('Kiran Shah', 'M', 'Nagpur', '.NET', 91, NULL, '2026-01-20'),
('Neha Joshi', 'F', 'Pune', 'React', 35, 'neha@mail.com', '2026-03-12'),
('Amit Verma', 'M', 'Delhi', 'SQL', 64, NULL, '2026-02-18'),
('Sneha Rao', 'F', 'Mumbai', '.NET', 79, 'sneha@mail.com', '2026-04-01'),
('Rahul Mehta', 'M', 'Pune', 'React', 55, 'rahul@mail.com', '2026-03-25'),
('Pooja Singh', 'F', 'Delhi', '.NET', 91, 'pooja@mail.com', '2026-05-02');
GO
SELECT DISTINCT City FROM Students ORDER BY City;
SELECT DISTINCT Course, Gender FROM Students ORDER BY Course, Gender;
SELECT FullName, Course, Marks FROM Students ORDER BY Course ASC, Marks DESC, FullName;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT DISTINCT City FROM Students ORDER BY City
+--------+
| City   |
+--------+
| Delhi  |
| Mumbai |
| Nagpur |
| Pune   |
+--------+
4 row(s) returned
>> SELECT DISTINCT Course, Gender FROM Students ORDER BY Course, Gender
+--------+--------+
| Course | Gender |
+--------+--------+
| .NET   | F      |
| .NET   | M      |
| React  | F      |
| React  | M      |
| SQL    | M      |
+--------+--------+
5 row(s) returned
>> SELECT FullName, Course, Marks FROM Students ORDER BY Course ASC, Mark
+-------------+--------+-------+
| FullName    | Course | Marks |
+-------------+--------+-------+
| Kiran Shah  | .NET   | 91    |
| Pooja Singh | .NET   | 91    |
| Asha Patil  | .NET   | 88    |
| Sneha Rao   | .NET   | 79    |
| Rahul Mehta | React  | 55    |
| Neha Joshi  | React  | 35    |
| Ravi Kumar  | SQL    | 72    |
| Amit Verma  | SQL    | 64    |
+-------------+--------+-------+
8 row(s) returned`,
      explanation: 'DISTINCT City gives 4 cities from 8 rows. SQL has no female student - so only 5 combinations. In the merit list, rows are grouped by Course (A-Z), then highest marks first; Kiran and Pooja tie at 91 so FullName decides.',
    },
    {
      title: 'TOP n and paging with OFFSET-FETCH',
      scenario: 'Show the top 3 students and page 2 of a 3-rows-per-page list (skipping the first 2 rows).',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Gender CHAR(1),
    City NVARCHAR(50),
    Course NVARCHAR(30),
    Marks INT,
    Email VARCHAR(100),
    JoinDate DATE
);
GO
INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, JoinDate) VALUES
('Asha Patil', 'F', 'Pune', '.NET', 88, 'asha@mail.com', '2026-01-10'),
('Ravi Kumar', 'M', 'Mumbai', 'SQL', 72, 'ravi@mail.com', '2026-02-05'),
('Kiran Shah', 'M', 'Nagpur', '.NET', 91, NULL, '2026-01-20'),
('Neha Joshi', 'F', 'Pune', 'React', 35, 'neha@mail.com', '2026-03-12'),
('Amit Verma', 'M', 'Delhi', 'SQL', 64, NULL, '2026-02-18'),
('Sneha Rao', 'F', 'Mumbai', '.NET', 79, 'sneha@mail.com', '2026-04-01'),
('Rahul Mehta', 'M', 'Pune', 'React', 55, 'rahul@mail.com', '2026-03-25'),
('Pooja Singh', 'F', 'Delhi', '.NET', 91, 'pooja@mail.com', '2026-05-02');
GO
SELECT TOP 3 FullName, Marks FROM Students ORDER BY Marks DESC, FullName;
SELECT FullName, Marks FROM Students ORDER BY StudentId OFFSET 2 ROWS FETCH NEXT 3 ROWS ONLY;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Gender CHAR(1),
    City NVARCHAR(50),
    Course NVARCHAR(30),
    Marks INT,
    Email VARCHAR(100),
    JoinDate DATE
);
GO
INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, JoinDate) VALUES
('Asha Patil', 'F', 'Pune', '.NET', 88, 'asha@mail.com', '2026-01-10'),
('Ravi Kumar', 'M', 'Mumbai', 'SQL', 72, 'ravi@mail.com', '2026-02-05'),
('Kiran Shah', 'M', 'Nagpur', '.NET', 91, NULL, '2026-01-20'),
('Neha Joshi', 'F', 'Pune', 'React', 35, 'neha@mail.com', '2026-03-12'),
('Amit Verma', 'M', 'Delhi', 'SQL', 64, NULL, '2026-02-18'),
('Sneha Rao', 'F', 'Mumbai', '.NET', 79, 'sneha@mail.com', '2026-04-01'),
('Rahul Mehta', 'M', 'Pune', 'React', 55, 'rahul@mail.com', '2026-03-25'),
('Pooja Singh', 'F', 'Delhi', '.NET', 91, 'pooja@mail.com', '2026-05-02');
GO
SELECT TOP 3 FullName, Marks FROM Students ORDER BY Marks DESC, FullName;
SELECT FullName, Marks FROM Students ORDER BY StudentId OFFSET 2 ROWS FETCH NEXT 3 ROWS ONLY;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT TOP 3 FullName, Marks FROM Students ORDER BY Marks DESC, FullNa
+-------------+-------+
| FullName    | Marks |
+-------------+-------+
| Kiran Shah  | 91    |
| Pooja Singh | 91    |
| Asha Patil  | 88    |
+-------------+-------+
3 row(s) returned
>> SELECT FullName, Marks FROM Students ORDER BY StudentId OFFSET 2 ROWS 
+------------+-------+
| FullName   | Marks |
+------------+-------+
| Kiran Shah | 91    |
| Neha Joshi | 35    |
| Amit Verma | 64    |
+------------+-------+
3 row(s) returned`,
      explanation: 'TOP 3 with ORDER BY Marks DESC returns the 3 highest. Adding FullName as second sort key makes the result deterministic. OFFSET 2 ROWS skips StudentId 1 and 2; FETCH NEXT 3 takes ids 3, 4, 5. In real SSMS try TOP 3 WITH TIES too - it would include any other student with 88.',
    },
    {
      title: 'Column and table aliases',
      scenario: 'Prepare a neat report for .NET students with friendly headings.',
      steps: ['New Query, type the script, press F5', 'Notice the headings in the Results grid'],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Gender CHAR(1),
    City NVARCHAR(50),
    Course NVARCHAR(30),
    Marks INT,
    Email VARCHAR(100),
    JoinDate DATE
);
GO
INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, JoinDate) VALUES
('Asha Patil', 'F', 'Pune', '.NET', 88, 'asha@mail.com', '2026-01-10'),
('Ravi Kumar', 'M', 'Mumbai', 'SQL', 72, 'ravi@mail.com', '2026-02-05'),
('Kiran Shah', 'M', 'Nagpur', '.NET', 91, NULL, '2026-01-20'),
('Neha Joshi', 'F', 'Pune', 'React', 35, 'neha@mail.com', '2026-03-12'),
('Amit Verma', 'M', 'Delhi', 'SQL', 64, NULL, '2026-02-18'),
('Sneha Rao', 'F', 'Mumbai', '.NET', 79, 'sneha@mail.com', '2026-04-01'),
('Rahul Mehta', 'M', 'Pune', 'React', 55, 'rahul@mail.com', '2026-03-25'),
('Pooja Singh', 'F', 'Delhi', '.NET', 91, 'pooja@mail.com', '2026-05-02');
GO
SELECT s.StudentId AS [Roll No],
       s.FullName AS Name,
       s.Marks AS [Marks Out Of 100],
       s.Marks * 5 AS MarksOutOf500,
       'Student of ' + s.City AS Info
FROM Students AS s
WHERE s.Course = '.NET'
ORDER BY Name;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Gender CHAR(1),
    City NVARCHAR(50),
    Course NVARCHAR(30),
    Marks INT,
    Email VARCHAR(100),
    JoinDate DATE
);
GO
INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, JoinDate) VALUES
('Asha Patil', 'F', 'Pune', '.NET', 88, 'asha@mail.com', '2026-01-10'),
('Ravi Kumar', 'M', 'Mumbai', 'SQL', 72, 'ravi@mail.com', '2026-02-05'),
('Kiran Shah', 'M', 'Nagpur', '.NET', 91, NULL, '2026-01-20'),
('Neha Joshi', 'F', 'Pune', 'React', 35, 'neha@mail.com', '2026-03-12'),
('Amit Verma', 'M', 'Delhi', 'SQL', 64, NULL, '2026-02-18'),
('Sneha Rao', 'F', 'Mumbai', '.NET', 79, 'sneha@mail.com', '2026-04-01'),
('Rahul Mehta', 'M', 'Pune', 'React', 55, 'rahul@mail.com', '2026-03-25'),
('Pooja Singh', 'F', 'Delhi', '.NET', 91, 'pooja@mail.com', '2026-05-02');
GO
SELECT s.StudentId AS [Roll No],
       s.FullName AS Name,
       s.Marks AS [Marks Out Of 100],
       s.Marks * 5 AS MarksOutOf500,
       'Student of ' + s.City AS Info
FROM Students AS s
WHERE s.Course = '.NET'
ORDER BY Name;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT s.StudentId AS [Roll No],
+---------+-------------+------------------+---------------+-------------------+
| Roll No | Name        | Marks Out Of 100 | MarksOutOf500 | Info              |
+---------+-------------+------------------+---------------+-------------------+
| 1       | Asha Patil  | 88               | 440           | Student of Pune   |
| 3       | Kiran Shah  | 91               | 455           | Student of Nagpur |
| 8       | Pooja Singh | 91               | 455           | Student of Delhi  |
| 6       | Sneha Rao   | 79               | 395           | Student of Mumbai |
+---------+-------------+------------------+---------------+-------------------+
4 row(s) returned`,
      explanation: 's is a table alias; [Roll No] needs brackets because of the space. ORDER BY Name uses the column alias - allowed because ORDER BY is processed after SELECT. \'Student of \' + s.City concatenates text.',
    },
  ],
  interview: [
    { q: 'Why should you avoid SELECT * in applications?', a: 'It returns unnecessary columns (more I/O and network), can break code when columns are added or reordered, and prevents covering-index optimisations.', level: 'Easy' },
    { q: 'What is the logical processing order of a SELECT statement?', a: 'FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, TOP/OFFSET. That is why an alias defined in SELECT can be used in ORDER BY but not in WHERE.', level: 'Medium' },
    { q: 'Does SQL Server return rows in insertion order without ORDER BY?', a: 'No order is guaranteed without ORDER BY. It often looks like primary key order, but parallelism or indexes can change it.', level: 'Medium' },
    { q: 'Difference between TOP 3 and TOP 3 WITH TIES?', a: 'TOP 3 returns exactly 3 rows. WITH TIES returns extra rows whose ORDER BY value equals the 3rd row\'s value. WITH TIES requires ORDER BY.', level: 'Medium' },
    { q: 'How does DISTINCT work with two columns?', a: 'It removes rows where the combination of both columns is duplicated; each column alone may still repeat.', level: 'Easy' },
    { q: 'Write a query to get page 3 of students, 10 per page, ordered by name.', a: 'SELECT * FROM Students ORDER BY FullName OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;', level: 'Medium' },
    { q: 'How do you give a column alias containing spaces?', a: 'Use square brackets or double quotes: SELECT Marks AS [Total Marks] or AS "Total Marks".', level: 'Easy' },
    { q: 'Is WHERE City = \'pune\' case-sensitive in SQL Server?', a: 'Not with the default collation (SQL_Latin1_General_CP1_CI_AS - CI means case-insensitive). With a CS collation it would be.', level: 'Medium' },
    { q: 'Output: SELECT TOP 2 Marks FROM (VALUES (5),(9),(7)) t(Marks) ORDER BY Marks;', a: '5 and 7 - ascending order, first two rows.', level: 'Easy' },
    { q: 'Where are NULLs placed by ORDER BY ASC in SQL Server?', a: 'First. NULL is treated as the lowest value; with DESC they appear last.', level: 'Medium' },
  ],
  practice: [
    { task: 'Display name and email of all female students sorted by name.', hint: 'WHERE Gender = \'F\'', solution: `SELECT FullName, Email FROM Students WHERE Gender = 'F' ORDER BY FullName;` },
    { task: 'Show the 2 lowest scorers with headings "Student" and "Score".', hint: 'TOP 2 ... ORDER BY Marks ASC', solution: `SELECT TOP 2 FullName AS Student, Marks AS Score FROM Students ORDER BY Marks ASC;` },
    { task: 'List the distinct courses offered, in descending alphabetical order.', hint: 'DISTINCT + ORDER BY DESC', solution: `SELECT DISTINCT Course FROM Students ORDER BY Course DESC;` },
    { task: 'Show students who are NOT from Mumbai with a calculated column Percentage = Marks (out of 100) and "Grade Point" = Marks / 10.', hint: '<> operator; integer division', solution: `SELECT FullName, City, Marks AS Percentage, Marks / 10 AS [Grade Point]
FROM Students WHERE City <> 'Mumbai' ORDER BY Marks DESC;` },
    { task: 'Return rows 4 to 6 of the students table ordered by StudentId.', hint: 'OFFSET 3 ROWS FETCH NEXT 3', solution: `SELECT * FROM Students ORDER BY StudentId OFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY;` },
  ],
  quiz: [
    { question: 'Which clause removes duplicate rows from a result?', options: ['UNIQUE', 'GROUP', 'DISTINCT', 'TOP'], answer: 2, explanation: 'SELECT DISTINCT removes duplicates from the result set.' },
    { question: 'Which query returns the 5 highest marks?', options: ['SELECT TOP 5 Marks FROM Students ORDER BY Marks DESC', 'SELECT TOP 5 Marks FROM Students ORDER BY Marks', 'SELECT Marks FROM Students LIMIT 5', 'SELECT FIRST 5 Marks FROM Students'], answer: 0, explanation: 'TOP with ORDER BY ... DESC. LIMIT is MySQL syntax.' },
    { question: 'Why does SELECT Marks*2 AS Dbl FROM Students WHERE Dbl > 100 fail?', options: ['Aliases need AS', 'Multiplication is not allowed', 'WHERE needs ORDER BY', 'WHERE is processed before SELECT, so the alias does not exist yet'], answer: 3, explanation: 'Logical order is FROM -> WHERE -> ... -> SELECT.' },
    { question: 'Default sort direction of ORDER BY is:', options: ['DESC', 'ASC', 'Random', 'Insertion order'], answer: 1, explanation: 'ASC is the default.' },
    { question: 'OFFSET 10 ROWS FETCH NEXT 5 ROWS ONLY returns:', options: ['Rows 11 to 15', 'Rows 10 to 15', 'Rows 5 to 10', 'The first 15 rows'], answer: 0, explanation: 'Skip 10 rows, then take 5: rows 11-15.' },
  ],
};
