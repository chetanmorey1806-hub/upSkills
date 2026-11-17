export default {
  id: 'day-043-and-or-not-in-between-like-is-null',
  title: 'AND, OR, NOT, IN, BETWEEN, LIKE and IS NULL',
  module: 'SQL Server & Database Management',
  day: 43,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Build powerful search conditions: combine filters with AND / OR / NOT, control precedence with parentheses, match lists with IN, ranges with BETWEEN, patterns with LIKE wildcards, and handle missing values correctly with IS NULL / IS NOT NULL and ISNULL.',
  objectives: [
    'Combine conditions with AND, OR, NOT and parentheses',
    'Use IN / NOT IN and BETWEEN for lists and ranges',
    'Search text patterns with LIKE and the %, _ and [ ] wildcards',
    'Test and replace NULL values correctly',
  ],
  theory: [
    {
      heading: 'Logical Operators: AND, OR, NOT',
      content: 'AND returns rows where BOTH conditions are true. OR returns rows where AT LEAST ONE is true. NOT reverses a condition. Precedence: NOT is evaluated first, then AND, then OR - exactly like * before + in maths. Use parentheses to make your intention clear.',
      syntax: `WHERE City = 'Pune' AND Marks >= 50
WHERE Course = 'SQL' OR City = 'Delhi'
WHERE NOT City = 'Pune'          -- same as City <> 'Pune'
WHERE (Course = 'React' OR Course = '.NET') AND Marks > 80`,
      tip: 'A OR B AND C is read as A OR (B AND C). Whenever you mix AND and OR, add brackets.',
    },
    {
      heading: 'IN and NOT IN',
      content: 'IN checks whether a value matches any value in a list - a short form of several OR conditions. NOT IN excludes the list. The list can also come from a subquery (Day 47).',
      syntax: `WHERE City IN ('Pune', 'Delhi')          -- City = 'Pune' OR City = 'Delhi'
WHERE Course NOT IN ('.NET', 'SQL')`,
      points: ['Danger: if a NOT IN list (or subquery) contains NULL, NOT IN returns no rows at all'],
    },
    {
      heading: 'BETWEEN',
      content: 'BETWEEN a AND b selects values in an INCLUSIVE range (both ends included). Works with numbers, dates and text. NOT BETWEEN gives values outside the range.',
      syntax: `WHERE Marks BETWEEN 60 AND 80              -- 60 <= Marks <= 80
WHERE JoinDate BETWEEN '2026-02-01' AND '2026-03-31'`,
      tip: 'With DATETIME columns, BETWEEN \'2026-03-01\' AND \'2026-03-31\' misses times after midnight on 31 March. Prefer: Col >= \'2026-03-01\' AND Col < \'2026-04-01\'.',
    },
    {
      heading: 'LIKE and Wildcards',
      content: 'LIKE compares text with a pattern. With SQL Server\'s default case-insensitive collation, \'r%\' also matches \'Rahul\'.',
      points: [
        '% = any number of characters (zero or more): \'R%\' starts with R, \'%a\' ends with a, \'%sh%\' contains sh',
        '_ = exactly one character: \'_a%\' second letter is a',
        '[ ] = one character from a set: \'[AK]%\' starts with A or K; \'[A-F]%\' range (real SSMS; not supported in the in-app lab)',
        '[^ ] = not in the set: \'[^A]%\' does not start with A (real SSMS)',
        'To search a literal % or _ use brackets: LIKE \'%[%]%\'',
        'A pattern starting with % cannot use an index well (slow on big tables)',
      ],
    },
    {
      heading: 'NULL, IS NULL, IS NOT NULL',
      content: 'NULL means "unknown / no value" - it is not 0 and not an empty string. Any comparison with NULL using =, <>, >, LIKE gives UNKNOWN, which WHERE treats as false. So WHERE Email = NULL returns nothing. Always use IS NULL or IS NOT NULL.',
      syntax: `WHERE Email IS NULL
WHERE Email IS NOT NULL
SELECT ISNULL(Email, 'not provided')          -- replace NULL in output
SELECT COALESCE(Phone, Email, 'no contact')   -- first non-NULL value`,
      points: ['NOT LIKE \'r%\' also skips NULL rows - NULL is neither like nor not like', 'COUNT(Email) counts only non-NULL emails; COUNT(*) counts all rows'],
    },
  ],
  examples: [
    {
      title: 'AND, OR and NOT',
      scenario: 'Search students: Pune students with at least 50 marks; SQL students OR anyone from Delhi; everyone not from Pune.',
      steps: ['Open SSMS > New Query (Ctrl+N)', 'Type the script (it creates and fills Students first)', 'Press F5 and read the three grids'],
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
SELECT FullName, City, Course, Marks FROM Students
WHERE City = 'Pune' AND Marks >= 50 ORDER BY FullName;
SELECT FullName, City, Course FROM Students
WHERE Course = 'SQL' OR City = 'Delhi' ORDER BY FullName;
SELECT FullName, City FROM Students
WHERE NOT City = 'Pune' ORDER BY FullName;`,
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
SELECT FullName, City, Course, Marks FROM Students
WHERE City = 'Pune' AND Marks >= 50 ORDER BY FullName;
SELECT FullName, City, Course FROM Students
WHERE Course = 'SQL' OR City = 'Delhi' ORDER BY FullName;
SELECT FullName, City FROM Students
WHERE NOT City = 'Pune' ORDER BY FullName;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT FullName, City, Course, Marks FROM Students
+-------------+------+--------+-------+
| FullName    | City | Course | Marks |
+-------------+------+--------+-------+
| Asha Patil  | Pune | .NET   | 88    |
| Rahul Mehta | Pune | React  | 55    |
+-------------+------+--------+-------+
2 row(s) returned
>> SELECT FullName, City, Course FROM Students
+-------------+--------+--------+
| FullName    | City   | Course |
+-------------+--------+--------+
| Amit Verma  | Delhi  | SQL    |
| Pooja Singh | Delhi  | .NET   |
| Ravi Kumar  | Mumbai | SQL    |
+-------------+--------+--------+
3 row(s) returned
>> SELECT FullName, City FROM Students
+-------------+--------+
| FullName    | City   |
+-------------+--------+
| Amit Verma  | Delhi  |
| Kiran Shah  | Nagpur |
| Pooja Singh | Delhi  |
| Ravi Kumar  | Mumbai |
| Sneha Rao   | Mumbai |
+-------------+--------+
5 row(s) returned`,
      explanation: 'AND: Neha (Pune, 35) fails the marks test. OR: Amit matches both, Pooja only city, Ravi only course - each row appears once. NOT City = \'Pune\' removes the 3 Pune students.',
    },
    {
      title: 'Operator precedence - why brackets matter',
      scenario: 'Find React or .NET students who scored above 80. Compare the query with and without parentheses.',
      steps: ['New Query, type the script, press F5', 'Compare the row counts: 3 vs 5'],
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
SELECT FullName, Course, Marks FROM Students
WHERE (Course = 'React' OR Course = '.NET') AND Marks > 80 ORDER BY FullName;
SELECT FullName, Course, Marks FROM Students
WHERE Course = 'React' OR Course = '.NET' AND Marks > 80 ORDER BY FullName;`,
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
SELECT FullName, Course, Marks FROM Students
WHERE (Course = 'React' OR Course = '.NET') AND Marks > 80 ORDER BY FullName;
SELECT FullName, Course, Marks FROM Students
WHERE Course = 'React' OR Course = '.NET' AND Marks > 80 ORDER BY FullName;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT FullName, Course, Marks FROM Students
+-------------+--------+-------+
| FullName    | Course | Marks |
+-------------+--------+-------+
| Asha Patil  | .NET   | 88    |
| Kiran Shah  | .NET   | 91    |
| Pooja Singh | .NET   | 91    |
+-------------+--------+-------+
3 row(s) returned
>> SELECT FullName, Course, Marks FROM Students
+-------------+--------+-------+
| FullName    | Course | Marks |
+-------------+--------+-------+
| Asha Patil  | .NET   | 88    |
| Kiran Shah  | .NET   | 91    |
| Neha Joshi  | React  | 35    |
| Pooja Singh | .NET   | 91    |
| Rahul Mehta | React  | 55    |
+-------------+--------+-------+
5 row(s) returned`,
      explanation: 'Without brackets SQL reads Course = \'React\' OR (Course = \'.NET\' AND Marks > 80), so ALL React students (even 35 and 55) are returned. The bracketed version is what the business asked for.',
    },
    {
      title: 'IN, NOT IN and BETWEEN',
      scenario: 'Students from Pune or Delhi; students not in .NET/SQL; marks between 60 and 80; students who joined in February-March.',
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
SELECT FullName, City FROM Students WHERE City IN ('Pune', 'Delhi') ORDER BY City, FullName;
SELECT FullName, Course FROM Students WHERE Course NOT IN ('.NET', 'SQL') ORDER BY FullName;
SELECT FullName, Marks FROM Students WHERE Marks BETWEEN 60 AND 80 ORDER BY Marks;
SELECT FullName, JoinDate FROM Students WHERE JoinDate BETWEEN '2026-02-01' AND '2026-03-31' ORDER BY JoinDate;`,
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
SELECT FullName, City FROM Students WHERE City IN ('Pune', 'Delhi') ORDER BY City, FullName;
SELECT FullName, Course FROM Students WHERE Course NOT IN ('.NET', 'SQL') ORDER BY FullName;
SELECT FullName, Marks FROM Students WHERE Marks BETWEEN 60 AND 80 ORDER BY Marks;
SELECT FullName, JoinDate FROM Students WHERE JoinDate BETWEEN '2026-02-01' AND '2026-03-31' ORDER BY JoinDate;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT FullName, City FROM Students WHERE City IN ('Pune', 'Delhi') OR
+-------------+-------+
| FullName    | City  |
+-------------+-------+
| Amit Verma  | Delhi |
| Pooja Singh | Delhi |
| Asha Patil  | Pune  |
| Neha Joshi  | Pune  |
| Rahul Mehta | Pune  |
+-------------+-------+
5 row(s) returned
>> SELECT FullName, Course FROM Students WHERE Course NOT IN ('.NET', 'SQ
+-------------+--------+
| FullName    | Course |
+-------------+--------+
| Neha Joshi  | React  |
| Rahul Mehta | React  |
+-------------+--------+
2 row(s) returned
>> SELECT FullName, Marks FROM Students WHERE Marks BETWEEN 60 AND 80 ORD
+------------+-------+
| FullName   | Marks |
+------------+-------+
| Amit Verma | 64    |
| Ravi Kumar | 72    |
| Sneha Rao  | 79    |
+------------+-------+
3 row(s) returned
>> SELECT FullName, JoinDate FROM Students WHERE JoinDate BETWEEN '2026-0
+-------------+------------+
| FullName    | JoinDate   |
+-------------+------------+
| Ravi Kumar  | 2026-02-05 |
| Amit Verma  | 2026-02-18 |
| Neha Joshi  | 2026-03-12 |
| Rahul Mehta | 2026-03-25 |
+-------------+------------+
4 row(s) returned`,
      explanation: 'IN is cleaner than City = \'Pune\' OR City = \'Delhi\'. BETWEEN is inclusive - a student with exactly 60 or 80 would be included. The date range works well because JoinDate is DATE (no time part).',
    },
    {
      title: 'Pattern search with LIKE',
      scenario: 'Day 43 practical: search students by name patterns.',
      steps: ['New Query, type the script, press F5', 'In real SSMS also try LIKE \'[AK]%\' (names starting with A or K)'],
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
SELECT FullName FROM Students WHERE FullName LIKE 'R%' ORDER BY FullName;
SELECT FullName FROM Students WHERE FullName LIKE '%a' ORDER BY FullName;
SELECT FullName FROM Students WHERE FullName LIKE '%Sh%' ORDER BY FullName;
SELECT FullName FROM Students WHERE FullName LIKE '_a%' ORDER BY FullName;
SELECT FullName, Email FROM Students WHERE Email NOT LIKE 'r%' ORDER BY FullName;`,
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
SELECT FullName FROM Students WHERE FullName LIKE 'R%' ORDER BY FullName;
SELECT FullName FROM Students WHERE FullName LIKE '%a' ORDER BY FullName;
SELECT FullName FROM Students WHERE FullName LIKE '%Sh%' ORDER BY FullName;
SELECT FullName FROM Students WHERE FullName LIKE '_a%' ORDER BY FullName;
SELECT FullName, Email FROM Students WHERE Email NOT LIKE 'r%' ORDER BY FullName;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT FullName FROM Students WHERE FullName LIKE 'R%' ORDER BY FullNa
+-------------+
| FullName    |
+-------------+
| Rahul Mehta |
| Ravi Kumar  |
+-------------+
2 row(s) returned
>> SELECT FullName FROM Students WHERE FullName LIKE '%a' ORDER BY FullNa
+-------------+
| FullName    |
+-------------+
| Amit Verma  |
| Rahul Mehta |
+-------------+
2 row(s) returned
>> SELECT FullName FROM Students WHERE FullName LIKE '%Sh%' ORDER BY Full
+------------+
| FullName   |
+------------+
| Asha Patil |
| Kiran Shah |
| Neha Joshi |
+------------+
3 row(s) returned
>> SELECT FullName FROM Students WHERE FullName LIKE '_a%' ORDER BY FullN
+-------------+
| FullName    |
+-------------+
| Rahul Mehta |
| Ravi Kumar  |
+-------------+
2 row(s) returned
>> SELECT FullName, Email FROM Students WHERE Email NOT LIKE 'r%' ORDER B
+-------------+----------------+
| FullName    | Email          |
+-------------+----------------+
| Asha Patil  | asha@mail.com  |
| Neha Joshi  | neha@mail.com  |
| Pooja Singh | pooja@mail.com |
| Sneha Rao   | sneha@mail.com |
+-------------+----------------+
4 row(s) returned`,
      explanation: '\'R%\' starts with R; \'%a\' ends with a; \'%Sh%\' contains "sh" anywhere (case-insensitive, so Asha and Joshi match too); \'_a%\' has "a" as the 2nd letter. NOT LIKE \'r%\' returns 4 rows, not 6: the two NULL emails are excluded because NULL is unknown. In real SSMS LIKE \'[AK]%\' returns Amit Verma, Asha Patil and Kiran Shah.',
    },
    {
      title: 'Handling NULL values',
      scenario: 'Find students without email, count those with email, and show a friendly text when email is missing.',
      steps: ['New Query, type the script, press F5', 'Notice that WHERE Email = NULL returns an empty grid'],
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
SELECT FullName, Email FROM Students WHERE Email IS NULL;
SELECT COUNT(*) AS WithEmail FROM Students WHERE Email IS NOT NULL;
SELECT FullName, Email FROM Students WHERE Email = NULL;
SELECT FullName, ISNULL(Email, 'not provided') AS Email FROM Students WHERE Course = '.NET' ORDER BY FullName;`,
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
SELECT FullName, Email FROM Students WHERE Email IS NULL;
SELECT COUNT(*) AS WithEmail FROM Students WHERE Email IS NOT NULL;
SELECT FullName, Email FROM Students WHERE Email = NULL;
SELECT FullName, ISNULL(Email, 'not provided') AS Email FROM Students WHERE Course = '.NET' ORDER BY FullName;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT FullName, Email FROM Students WHERE Email IS NULL
+------------+-------+
| FullName   | Email |
+------------+-------+
| Kiran Shah | NULL  |
| Amit Verma | NULL  |
+------------+-------+
2 row(s) returned
>> SELECT COUNT(*) AS WithEmail FROM Students WHERE Email IS NOT NULL
+-----------+
| WithEmail |
+-----------+
| 6         |
+-----------+
1 row(s) returned
>> SELECT FullName, Email FROM Students WHERE Email = NULL
+----------+-------+
| FullName | Email |
+----------+-------+
+----------+-------+
0 row(s) returned
>> SELECT FullName, ISNULL(Email, 'not provided') AS Email FROM Students 
+-------------+----------------+
| FullName    | Email          |
+-------------+----------------+
| Asha Patil  | asha@mail.com  |
| Kiran Shah  | not provided   |
| Pooja Singh | pooja@mail.com |
| Sneha Rao   | sneha@mail.com |
+-------------+----------------+
4 row(s) returned`,
      explanation: 'IS NULL finds the 2 missing emails. Email = NULL is never true, so it returns 0 rows - a classic bug. ISNULL(Email, \'not provided\') only changes the displayed value, not the table.',
    },
  ],
  interview: [
    { q: 'What is the precedence of AND, OR and NOT?', a: 'NOT first, then AND, then OR. A OR B AND C means A OR (B AND C). Use parentheses to be explicit.', level: 'Easy' },
    { q: 'Is BETWEEN inclusive or exclusive?', a: 'Inclusive on both ends: BETWEEN 10 AND 20 includes 10 and 20.', level: 'Easy' },
    { q: 'Why does WHERE Email = NULL return no rows?', a: 'NULL is unknown; any comparison with NULL yields UNKNOWN (not TRUE), and WHERE keeps only TRUE rows. Use IS NULL.', level: 'Easy' },
    { q: 'Difference between % and _ in LIKE?', a: '% matches any sequence of zero or more characters; _ matches exactly one character.', level: 'Easy' },
    { q: 'What is the problem with NOT IN when the list contains NULL?', a: 'x NOT IN (1, NULL) becomes x <> 1 AND x <> NULL; the second part is UNKNOWN, so no rows are returned. Use NOT EXISTS or filter NULLs out of the subquery.', level: 'Hard' },
    { q: 'Difference between ISNULL and COALESCE?', a: 'ISNULL(a, b) takes exactly two arguments and is SQL Server specific; result type comes from the first argument. COALESCE(a, b, c, ...) takes many arguments, is ANSI standard, returns the first non-NULL value.', level: 'Medium' },
    { q: 'How do you find names starting with a vowel in SQL Server?', a: 'WHERE FullName LIKE \'[AEIOU]%\' (case-insensitive under default collation).', level: 'Medium' },
    { q: 'Why can LIKE \'%abc\' be slow?', a: 'A leading wildcard prevents an index seek - SQL Server must scan every row. LIKE \'abc%\' can use an index on the column.', level: 'Medium' },
    { q: 'Write a query for students with marks outside 40-90.', a: 'SELECT * FROM Students WHERE Marks NOT BETWEEN 40 AND 90;', level: 'Easy' },
    { q: 'How do you search for a literal underscore, e.g. emails containing "_"?', a: 'Escape it with brackets: LIKE \'%[_]%\', or use the ESCAPE clause: LIKE \'%!_%\' ESCAPE \'!\'.', level: 'Hard' },
  ],
  practice: [
    { task: 'Find female students from Pune or Mumbai who scored at least 70.', hint: 'Gender AND City IN AND Marks', solution: `SELECT FullName, City, Marks FROM Students
WHERE Gender = 'F' AND City IN ('Pune', 'Mumbai') AND Marks >= 70;` },
    { task: 'List students whose name contains "ha" and whose email ends with "@mail.com".', hint: 'Two LIKE conditions', solution: `SELECT FullName, Email FROM Students
WHERE FullName LIKE '%ha%' AND Email LIKE '%@mail.com';` },
    { task: 'Show students who joined in January 2026 or scored below 40.', hint: 'BETWEEN with OR', solution: `SELECT FullName, JoinDate, Marks FROM Students
WHERE JoinDate BETWEEN '2026-01-01' AND '2026-01-31' OR Marks < 40;` },
    { task: 'Display all students with email shown as "N/A" when missing, only for courses other than SQL.', hint: 'ISNULL + <> or NOT IN', solution: `SELECT FullName, Course, ISNULL(Email, 'N/A') AS Email
FROM Students WHERE Course <> 'SQL';` },
    { task: 'Find students whose name has exactly 9 characters.', hint: 'Nine underscores, or LEN()', solution: `SELECT FullName FROM Students WHERE FullName LIKE '_________';
-- or WHERE LEN(FullName) = 9` },
  ],
  quiz: [
    { question: 'Which condition finds names starting with "S"?', options: ['LIKE \'%S\'', 'LIKE \'S%\'', 'LIKE \'_S\'', '= \'S*\''], answer: 1, explanation: 'S followed by any characters.' },
    { question: 'Marks BETWEEN 50 AND 60 is equivalent to:', options: ['Marks > 50 AND Marks < 60', 'Marks >= 50 OR Marks <= 60', 'Marks > 50 AND Marks <= 60', 'Marks >= 50 AND Marks <= 60'], answer: 3, explanation: 'BETWEEN includes both boundaries.' },
    { question: 'How do you find rows where Phone has no value?', options: ['WHERE Phone IS NULL', 'WHERE Phone = NULL', 'WHERE Phone = \'\'', 'WHERE Phone == NULL'], answer: 0, explanation: 'Only IS NULL tests for NULL.' },
    { question: 'A OR B AND C is evaluated as:', options: ['(A OR B) AND C', 'A OR (B AND C)', 'Left to right always', 'Error'], answer: 1, explanation: 'AND has higher precedence than OR.' },
    { question: 'City IN (\'Pune\', \'Delhi\') is the same as:', options: ['City = \'Pune\' AND City = \'Delhi\'', 'City LIKE \'Pune%Delhi\'', 'City = \'Pune\' OR City = \'Delhi\'', 'City BETWEEN \'Pune\' AND \'Delhi\''], answer: 2, explanation: 'IN is a shortcut for multiple OR equality conditions.' },
  ],
};
