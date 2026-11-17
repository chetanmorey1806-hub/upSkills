export default {
  id: 'day-044-aggregate-functions-count-sum-avg-min-max',
  title: 'Aggregate Functions: COUNT, SUM, AVG, MIN, MAX',
  module: 'SQL Server & Database Management',
  day: 44,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Summarise many rows into one value with COUNT, SUM, AVG, MIN and MAX. Learn how each function treats NULL, the difference between COUNT(*) and COUNT(column), COUNT(DISTINCT), the integer-average trap, and calculate total, average and percentage of student marks.',
  objectives: [
    'Use COUNT, SUM, AVG, MIN and MAX on numeric, text and date columns',
    'Explain COUNT(*) vs COUNT(column) vs COUNT(DISTINCT column)',
    'Avoid integer division in AVG and percentages',
    'Combine aggregates with WHERE and with a subquery to find the topper',
  ],
  theory: [
    {
      heading: 'What is an Aggregate Function?',
      content: 'An aggregate function takes many rows and returns ONE value: how many students, total fees, average marks, lowest and highest score. Without GROUP BY (Day 45) the whole table (after WHERE) becomes one group, so the query returns exactly one row.',
      syntax: `SELECT COUNT(*), SUM(Marks), AVG(Marks), MIN(Marks), MAX(Marks)
FROM Students
WHERE Course = '.NET';`,
      points: [
        'WHERE filters rows BEFORE aggregation',
        'You cannot mix an aggregate with a normal column without GROUP BY: SELECT FullName, MAX(Marks) FROM Students -> error 8120',
        'Aggregates cannot be used in WHERE (use HAVING or a subquery)',
      ],
    },
    {
      heading: 'COUNT',
      content: 'COUNT(*) counts rows (including rows with NULLs). COUNT(column) counts only non-NULL values of that column. COUNT(DISTINCT column) counts unique non-NULL values. COUNT_BIG returns BIGINT for huge tables.',
      syntax: `SELECT COUNT(*) AS TotalStudents,
       COUNT(Email) AS WithEmail,
       COUNT(DISTINCT City) AS Cities
FROM Students;`,
    },
    {
      heading: 'SUM and AVG',
      content: 'SUM adds numeric values; AVG returns SUM / COUNT of non-NULL values. Both ignore NULL. Important SQL Server trap: AVG of an INT column returns an INT (decimals are truncated): AVG of 88 and 91 gives 89, not 89.5. Multiply by 1.0 or CAST to DECIMAL to get decimals.',
      syntax: `SELECT AVG(Marks)               -- INT result in SQL Server (71)
SELECT AVG(Marks * 1.0)         -- 71.875000
SELECT ROUND(AVG(Marks * 1.0), 1)   -- 71.900000
SELECT CAST(AVG(Marks * 1.0) AS DECIMAL(5,2))  -- 71.88`,
      tip: 'The in-app lab always returns decimal averages and prints decimals without trailing zeros. Write AVG(col * 1.0) so the result is correct in both the lab and real SQL Server.',
    },
    {
      heading: 'MIN and MAX',
      content: 'MIN and MAX work on numbers, text (alphabetical) and dates (earliest / latest). They also ignore NULL.',
      syntax: `SELECT MIN(Marks), MAX(Marks), MIN(FullName), MAX(JoinDate) FROM Students;`,
      points: ['To get the NAME of the topper, use a subquery: WHERE Marks = (SELECT MAX(Marks) FROM Students)', 'Or ORDER BY Marks DESC with TOP 1 (but this hides ties)'],
    },
    {
      heading: 'Aggregates and NULL',
      content: 'All aggregate functions except COUNT(*) skip NULL. This changes averages: if one of three papers is not evaluated (NULL), AVG divides by 2, not 3. If you want NULL treated as 0, write AVG(ISNULL(Marks, 0)). On an empty set, COUNT returns 0 but SUM/AVG/MIN/MAX return NULL.',
      points: ['SUM of an empty set is NULL - use ISNULL(SUM(x), 0) in reports', 'Warning message in SSMS: "Null value is eliminated by an aggregate or other SET operation."'],
    },
  ],
  examples: [
    {
      title: 'COUNT(*) vs COUNT(column) vs COUNT(DISTINCT)',
      scenario: 'How many students, how many gave an email, and how many different cities do they come from?',
      steps: ['Open SSMS > New Query (Ctrl+N)', 'Type the script (it creates the 8-student table)', 'Press F5'],
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
SELECT COUNT(*) AS TotalStudents,
       COUNT(Email) AS WithEmail,
       COUNT(DISTINCT City) AS Cities
FROM Students;`,
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
SELECT COUNT(*) AS TotalStudents,
       COUNT(Email) AS WithEmail,
       COUNT(DISTINCT City) AS Cities
FROM Students;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT COUNT(*) AS TotalStudents,
+---------------+-----------+--------+
| TotalStudents | WithEmail | Cities |
+---------------+-----------+--------+
| 8             | 6         | 4      |
+---------------+-----------+--------+
1 row(s) returned`,
      explanation: 'COUNT(*) = 8 rows. COUNT(Email) = 6 because 2 emails are NULL. COUNT(DISTINCT City) = 4 (Pune, Mumbai, Nagpur, Delhi).',
    },
    {
      title: 'SUM, AVG, MIN, MAX of marks',
      scenario: 'Day 44 practical: calculate class total, average, lowest and highest marks, and the average of .NET students.',
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
SELECT SUM(Marks) AS TotalMarks,
       AVG(Marks * 1.0) AS Average,
       ROUND(AVG(Marks * 1.0), 1) AS AvgRounded,
       MIN(Marks) AS Lowest,
       MAX(Marks) AS Highest
FROM Students;
SELECT AVG(Marks * 1.0) AS AvgNet FROM Students WHERE Course = '.NET';`,
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
SELECT SUM(Marks) AS TotalMarks,
       AVG(Marks * 1.0) AS Average,
       ROUND(AVG(Marks * 1.0), 1) AS AvgRounded,
       MIN(Marks) AS Lowest,
       MAX(Marks) AS Highest
FROM Students;
SELECT AVG(Marks * 1.0) AS AvgNet FROM Students WHERE Course = '.NET';`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT SUM(Marks) AS TotalMarks,
+------------+---------+------------+--------+---------+
| TotalMarks | Average | AvgRounded | Lowest | Highest |
+------------+---------+------------+--------+---------+
| 575        | 71.875  | 71.9       | 35     | 91      |
+------------+---------+------------+--------+---------+
1 row(s) returned
>> SELECT AVG(Marks * 1.0) AS AvgNet FROM Students WHERE Course = '.NET'
+--------+
| AvgNet |
+--------+
| 87.25  |
+--------+
1 row(s) returned`,
      explanation: '575 / 8 = 71.875. Marks * 1.0 forces decimal maths. In real SSMS these print as 71.875000 and 71.900000 (decimal scale), and plain AVG(Marks) would print 71. .NET average: (88 + 91 + 79 + 91) / 4 = 87.25.',
    },
    {
      title: 'MIN/MAX on text and dates, and finding the topper',
      scenario: 'Who comes first alphabetically, when did the first and latest students join, and who scored the highest?',
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
SELECT MIN(FullName) AS FirstAlphabetically,
       MAX(FullName) AS LastAlphabetically,
       MIN(JoinDate) AS FirstJoin,
       MAX(JoinDate) AS LatestJoin
FROM Students;
SELECT FullName, Marks FROM Students
WHERE Marks = (SELECT MAX(Marks) FROM Students) ORDER BY FullName;`,
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
SELECT MIN(FullName) AS FirstAlphabetically,
       MAX(FullName) AS LastAlphabetically,
       MIN(JoinDate) AS FirstJoin,
       MAX(JoinDate) AS LatestJoin
FROM Students;
SELECT FullName, Marks FROM Students
WHERE Marks = (SELECT MAX(Marks) FROM Students) ORDER BY FullName;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Gender, City, Course, Marks, Email, Jo -> (8 rows affected)
>> SELECT MIN(FullName) AS FirstAlphabetically,
+---------------------+--------------------+------------+------------+
| FirstAlphabetically | LastAlphabetically | FirstJoin  | LatestJoin |
+---------------------+--------------------+------------+------------+
| Amit Verma          | Sneha Rao          | 2026-01-10 | 2026-05-02 |
+---------------------+--------------------+------------+------------+
1 row(s) returned
>> SELECT FullName, Marks FROM Students
+-------------+-------+
| FullName    | Marks |
+-------------+-------+
| Kiran Shah  | 91    |
| Pooja Singh | 91    |
+-------------+-------+
2 row(s) returned`,
      explanation: 'MIN/MAX on text compare alphabetically; on dates, earliest/latest. The subquery calculates 91 first, then the outer query returns every student with 91 - both toppers are shown (TOP 1 would hide one).',
    },
    {
      title: 'Aggregates with NULL marks and percentage',
      scenario: 'Ravi\'s SQL paper is not evaluated yet (NULL). Calculate his papers, total and average, and Asha\'s percentage out of 300.',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE ResultDB;
GO
USE ResultDB;
GO
CREATE TABLE ExamMarks (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    StudentName NVARCHAR(50) NOT NULL,
    Subject NVARCHAR(30) NOT NULL,
    Marks INT
);
GO
INSERT INTO ExamMarks (StudentName, Subject, Marks) VALUES
('Asha', 'C#', 90), ('Asha', 'SQL', 85), ('Asha', 'HTML', 78),
('Ravi', 'C#', 65), ('Ravi', 'SQL', NULL), ('Ravi', 'HTML', 70);
GO
SELECT COUNT(*) AS Papers, COUNT(Marks) AS Evaluated,
       SUM(Marks) AS Total, AVG(Marks * 1.0) AS Average
FROM ExamMarks WHERE StudentName = 'Ravi';
SELECT SUM(Marks) AS AshaTotal,
       ROUND(SUM(Marks) * 100.0 / 300, 2) AS AshaPercent
FROM ExamMarks WHERE StudentName = 'Asha';`,
      tsql: `CREATE DATABASE ResultDB;
GO
USE ResultDB;
GO
CREATE TABLE ExamMarks (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    StudentName NVARCHAR(50) NOT NULL,
    Subject NVARCHAR(30) NOT NULL,
    Marks INT
);
GO
INSERT INTO ExamMarks (StudentName, Subject, Marks) VALUES
('Asha', 'C#', 90), ('Asha', 'SQL', 85), ('Asha', 'HTML', 78),
('Ravi', 'C#', 65), ('Ravi', 'SQL', NULL), ('Ravi', 'HTML', 70);
GO
SELECT COUNT(*) AS Papers, COUNT(Marks) AS Evaluated,
       SUM(Marks) AS Total, AVG(Marks * 1.0) AS Average
FROM ExamMarks WHERE StudentName = 'Ravi';
SELECT SUM(Marks) AS AshaTotal,
       ROUND(SUM(Marks) * 100.0 / 300, 2) AS AshaPercent
FROM ExamMarks WHERE StudentName = 'Asha';`,
      result: `>> CREATE DATABASE ResultDB -> Commands completed successfully.
>> USE ResultDB -> Commands completed successfully.
>> CREATE TABLE ExamMarks ( -> Commands completed successfully.
>> INSERT INTO ExamMarks (StudentName, Subject, Marks) VALUES -> (6 rows affected)
>> SELECT COUNT(*) AS Papers, COUNT(Marks) AS Evaluated,
+--------+-----------+-------+---------+
| Papers | Evaluated | Total | Average |
+--------+-----------+-------+---------+
| 3      | 2         | 135   | 67.5    |
+--------+-----------+-------+---------+
1 row(s) returned
>> SELECT SUM(Marks) AS AshaTotal,
+-----------+-------------+
| AshaTotal | AshaPercent |
+-----------+-------------+
| 253       | 84.33       |
+-----------+-------------+
1 row(s) returned`,
      explanation: 'COUNT(*) = 3 papers but COUNT(Marks) = 2. AVG ignores the NULL: 135 / 2 = 67.5 (not 45). Percentage: 253 * 100.0 / 300 = 84.333..., rounded to 84.33. Using 100 instead of 100.0 would give integer 84 in SQL Server. SSMS also shows the warning "Null value is eliminated by an aggregate or other SET operation." in Messages.',
    },
  ],
  interview: [
    { q: 'Difference between COUNT(*), COUNT(1) and COUNT(column)?', a: 'COUNT(*) and COUNT(1) both count all rows (same performance). COUNT(column) counts only rows where that column is NOT NULL.', level: 'Easy' },
    { q: 'Do aggregate functions consider NULL?', a: 'All except COUNT(*) ignore NULL values. AVG divides by the count of non-NULL values.', level: 'Easy' },
    { q: 'SELECT AVG(Marks) FROM T where Marks are 1 and 2 (INT). Output?', a: '1 in SQL Server, because AVG of INT returns INT (1.5 truncated). Use AVG(Marks * 1.0) for 1.500000.', level: 'Medium' },
    { q: 'What does SUM return when no rows match?', a: 'NULL (COUNT returns 0). Use ISNULL(SUM(x), 0).', level: 'Medium' },
    { q: 'Why does SELECT FullName, MAX(Marks) FROM Students fail?', a: 'FullName is not aggregated and not in a GROUP BY; SQL Server does not know which name to show for the single aggregate row (error 8120).', level: 'Medium' },
    { q: 'How do you find the second highest marks?', a: 'SELECT MAX(Marks) FROM Students WHERE Marks < (SELECT MAX(Marks) FROM Students); or DENSE_RANK() = 2.', level: 'Medium' },
    { q: 'Can you use an aggregate function in WHERE?', a: 'No. WHERE runs before aggregation. Use HAVING (with GROUP BY) or a subquery.', level: 'Easy' },
    { q: 'What is COUNT(DISTINCT City)?', a: 'Number of unique non-NULL City values.', level: 'Easy' },
    { q: 'Can MIN and MAX be used with strings and dates?', a: 'Yes - strings compare by collation (alphabetical), dates chronologically.', level: 'Easy' },
    { q: 'AVG(Marks) vs SUM(Marks)/COUNT(*) - can they differ?', a: 'Yes, when Marks contains NULLs: AVG divides by non-NULL count, SUM/COUNT(*) divides by all rows. Also SUM/COUNT on INT does integer division.', level: 'Hard' },
  ],
  practice: [
    { task: 'Find how many students are in the React course and their average marks.', hint: 'WHERE Course = \'React\'', solution: `SELECT COUNT(*) AS ReactStudents, AVG(Marks * 1.0) AS AvgMarks
FROM Students WHERE Course = 'React';` },
    { task: 'Find the difference between the highest and lowest marks (range).', hint: 'MAX - MIN', solution: `SELECT MAX(Marks) - MIN(Marks) AS MarksRange FROM Students;` },
    { task: 'Show the name(s) of the student(s) with the lowest marks.', hint: 'Subquery with MIN', solution: `SELECT FullName, Marks FROM Students WHERE Marks = (SELECT MIN(Marks) FROM Students);` },
    { task: 'In ExamMarks, calculate Ravi\'s average treating the missing paper as 0.', hint: 'ISNULL inside AVG', solution: `SELECT AVG(ISNULL(Marks, 0) * 1.0) AS AvgWithZero FROM ExamMarks WHERE StudentName = 'Ravi';  -- 45` },
    { task: 'Count how many students have marks above the class average.', hint: 'Subquery AVG', solution: `SELECT COUNT(*) AS AboveAverage FROM Students WHERE Marks > (SELECT AVG(Marks * 1.0) FROM Students);` },
  ],
  quiz: [
    { question: 'Which function counts rows including NULL values?', options: ['COUNT(Email)', 'COUNT(DISTINCT Email)', 'COUNT(*)', 'SUM(1) only'], answer: 2, explanation: 'COUNT(*) counts every row.' },
    { question: 'Marks values: 80, NULL, 60. AVG(Marks * 1.0) = ?', options: ['46.67', '70', '140', 'NULL'], answer: 1, explanation: 'NULL is ignored: (80 + 60) / 2 = 70.' },
    { question: 'In SQL Server, AVG over INT values 7 and 8 returns:', options: ['7', '7.5', '8', 'Error'], answer: 0, explanation: 'Integer average truncates 7.5 to 7. Use * 1.0 for decimals.' },
    { question: 'MAX(JoinDate) returns:', options: ['The earliest date', 'The number of dates', 'NULL always', 'The latest date'], answer: 3, explanation: 'MAX on dates returns the most recent date.' },
    { question: 'SUM(Marks) on a table with zero matching rows returns:', options: ['0', 'NULL', 'Error', 'Empty string'], answer: 1, explanation: 'SUM, AVG, MIN, MAX return NULL on an empty set; COUNT returns 0.' },
  ],
};
