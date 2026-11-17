export default {
  id: 'day-045-group-by-having-order-by-aggregates',
  title: 'GROUP BY, HAVING and ORDER BY with Aggregate Functions',
  module: 'SQL Server & Database Management',
  day: 45,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Turn aggregates into reports: GROUP BY splits rows into groups (one result row per department), HAVING filters those groups, and ORDER BY sorts by aggregated values. Build department-wise employee count, salary totals and averages on CompanyDB.',
  objectives: [
    'Group rows by one or more columns with GROUP BY',
    'Apply COUNT, SUM, AVG, MIN, MAX per group',
    'Filter groups with HAVING and know when to use WHERE instead',
    'Sort grouped results by aggregate values or aliases',
  ],
  theory: [
    {
      heading: 'GROUP BY - One Row per Group',
      content: 'GROUP BY collects rows that have the same value(s) in the given column(s) into a group, and aggregate functions are then calculated for each group separately. Think of sorting exam papers into piles by department, then counting each pile.',
      syntax: `SELECT Department, COUNT(*) AS EmployeeCount
FROM Employees
GROUP BY Department;`,
      points: [
        'Rule: every column in SELECT must be either in GROUP BY or inside an aggregate function',
        'Otherwise: Msg 8120 "Column \'Employees.EmpName\' is invalid in the select list because it is not contained in either an aggregate function or the GROUP BY clause."',
        'NULL values form their own group',
        'GROUP BY does NOT guarantee order - add ORDER BY',
      ],
    },
    {
      heading: 'Grouping by Multiple Columns',
      content: 'GROUP BY Department, Gender creates one group for every unique (Department, Gender) combination - for example "IT-F", "IT-M", "HR-F".',
      syntax: `SELECT Department, Gender, COUNT(*) AS Staff
FROM Employees
GROUP BY Department, Gender;`,
    },
    {
      heading: 'HAVING - Filtering Groups',
      content: 'WHERE filters individual ROWS before grouping; HAVING filters GROUPS after aggregation. HAVING usually contains an aggregate function.',
      syntax: `SELECT Department, COUNT(*) AS Staff
FROM Employees
WHERE City <> 'Delhi'          -- row filter
GROUP BY Department
HAVING COUNT(*) >= 3           -- group filter
ORDER BY Staff DESC;`,
      points: [
        'Put non-aggregate conditions in WHERE (faster - fewer rows to group)',
        'You cannot use a SELECT alias in HAVING in SQL Server: write HAVING COUNT(*) >= 3, not HAVING Staff >= 3',
        'Aliases ARE allowed in ORDER BY',
      ],
    },
    {
      heading: 'Full Query Order',
      content: 'Written order: SELECT - FROM - WHERE - GROUP BY - HAVING - ORDER BY. Logical (execution) order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> TOP. Memorise both; many interview questions are based on this.',
      tip: 'Mnemonic for the written order: "Some Friends Will Go Have Oranges" (SELECT FROM WHERE GROUP BY HAVING ORDER BY).',
    },
    {
      heading: 'ROLLUP and Grand Totals (real SSMS)',
      content: 'GROUP BY ROLLUP(Department) adds a grand-total row (Department = NULL). GROUPING SETS and CUBE produce several groupings at once. These are used in reports; they are not supported in the in-app lab.',
      syntax: `SELECT ISNULL(Department, 'ALL') AS Department, SUM(Salary) AS Total
FROM Employees
GROUP BY ROLLUP(Department);`,
    },
  ],
  examples: [
    {
      title: 'Department-wise employee count',
      scenario: 'Day 45 practical: HR wants to know how many employees each department has.',
      steps: ['Open SSMS > New Query (Ctrl+N)', 'Type the script (it creates CompanyDB with 10 employees)', 'Press F5'],
      code: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Department NVARCHAR(30) NOT NULL,
    Gender CHAR(1) NOT NULL,
    City NVARCHAR(30),
    Salary INT NOT NULL,
    JoinYear INT
);
GO
INSERT INTO Employees (EmpName, Department, Gender, City, Salary, JoinYear) VALUES
('Meera', 'HR', 'F', 'Pune', 42000, 2022),
('Arjun', 'IT', 'M', 'Pune', 85000, 2021),
('Sana', 'IT', 'F', 'Mumbai', 72000, 2023),
('Rahul', 'Sales', 'M', 'Delhi', 38000, 2024),
('Divya', 'IT', 'F', 'Pune', 91000, 2020),
('Karan', 'Sales', 'M', 'Mumbai', 45000, 2022),
('Nisha', 'HR', 'F', 'Delhi', 48000, 2023),
('Vikram', 'Finance', 'M', 'Mumbai', 67000, 2021),
('Rohan', 'IT', 'M', 'Delhi', 58000, 2024),
('Priya', 'Sales', 'F', 'Pune', 41000, 2023);
GO
SELECT Department, COUNT(*) AS EmployeeCount
FROM Employees
GROUP BY Department
ORDER BY Department;`,
      tsql: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Department NVARCHAR(30) NOT NULL,
    Gender CHAR(1) NOT NULL,
    City NVARCHAR(30),
    Salary INT NOT NULL,
    JoinYear INT
);
GO
INSERT INTO Employees (EmpName, Department, Gender, City, Salary, JoinYear) VALUES
('Meera', 'HR', 'F', 'Pune', 42000, 2022),
('Arjun', 'IT', 'M', 'Pune', 85000, 2021),
('Sana', 'IT', 'F', 'Mumbai', 72000, 2023),
('Rahul', 'Sales', 'M', 'Delhi', 38000, 2024),
('Divya', 'IT', 'F', 'Pune', 91000, 2020),
('Karan', 'Sales', 'M', 'Mumbai', 45000, 2022),
('Nisha', 'HR', 'F', 'Delhi', 48000, 2023),
('Vikram', 'Finance', 'M', 'Mumbai', 67000, 2021),
('Rohan', 'IT', 'M', 'Delhi', 58000, 2024),
('Priya', 'Sales', 'F', 'Pune', 41000, 2023);
GO
SELECT Department, COUNT(*) AS EmployeeCount
FROM Employees
GROUP BY Department
ORDER BY Department;`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Employees (EmpName, Department, Gender, City, Salary, Join -> (10 rows affected)
>> SELECT Department, COUNT(*) AS EmployeeCount
+------------+---------------+
| Department | EmployeeCount |
+------------+---------------+
| Finance    | 1             |
| HR         | 2             |
| IT         | 4             |
| Sales      | 3             |
+------------+---------------+
4 row(s) returned`,
      explanation: 'The 10 rows are split into 4 piles (Finance, HR, IT, Sales); COUNT(*) counts each pile. 1 + 2 + 4 + 3 = 10.',
    },
    {
      title: 'Salary report per department',
      scenario: 'Finance needs total, average, minimum and maximum salary per department, biggest payroll first.',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Department NVARCHAR(30) NOT NULL,
    Gender CHAR(1) NOT NULL,
    City NVARCHAR(30),
    Salary INT NOT NULL,
    JoinYear INT
);
GO
INSERT INTO Employees (EmpName, Department, Gender, City, Salary, JoinYear) VALUES
('Meera', 'HR', 'F', 'Pune', 42000, 2022),
('Arjun', 'IT', 'M', 'Pune', 85000, 2021),
('Sana', 'IT', 'F', 'Mumbai', 72000, 2023),
('Rahul', 'Sales', 'M', 'Delhi', 38000, 2024),
('Divya', 'IT', 'F', 'Pune', 91000, 2020),
('Karan', 'Sales', 'M', 'Mumbai', 45000, 2022),
('Nisha', 'HR', 'F', 'Delhi', 48000, 2023),
('Vikram', 'Finance', 'M', 'Mumbai', 67000, 2021),
('Rohan', 'IT', 'M', 'Delhi', 58000, 2024),
('Priya', 'Sales', 'F', 'Pune', 41000, 2023);
GO
SELECT Department,
       COUNT(*) AS Staff,
       SUM(Salary) AS TotalSalary,
       ROUND(AVG(Salary * 1.0), 2) AS AvgSalary,
       MIN(Salary) AS MinSalary,
       MAX(Salary) AS MaxSalary
FROM Employees
GROUP BY Department
ORDER BY TotalSalary DESC;`,
      tsql: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Department NVARCHAR(30) NOT NULL,
    Gender CHAR(1) NOT NULL,
    City NVARCHAR(30),
    Salary INT NOT NULL,
    JoinYear INT
);
GO
INSERT INTO Employees (EmpName, Department, Gender, City, Salary, JoinYear) VALUES
('Meera', 'HR', 'F', 'Pune', 42000, 2022),
('Arjun', 'IT', 'M', 'Pune', 85000, 2021),
('Sana', 'IT', 'F', 'Mumbai', 72000, 2023),
('Rahul', 'Sales', 'M', 'Delhi', 38000, 2024),
('Divya', 'IT', 'F', 'Pune', 91000, 2020),
('Karan', 'Sales', 'M', 'Mumbai', 45000, 2022),
('Nisha', 'HR', 'F', 'Delhi', 48000, 2023),
('Vikram', 'Finance', 'M', 'Mumbai', 67000, 2021),
('Rohan', 'IT', 'M', 'Delhi', 58000, 2024),
('Priya', 'Sales', 'F', 'Pune', 41000, 2023);
GO
SELECT Department,
       COUNT(*) AS Staff,
       SUM(Salary) AS TotalSalary,
       ROUND(AVG(Salary * 1.0), 2) AS AvgSalary,
       MIN(Salary) AS MinSalary,
       MAX(Salary) AS MaxSalary
FROM Employees
GROUP BY Department
ORDER BY TotalSalary DESC;`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Employees (EmpName, Department, Gender, City, Salary, Join -> (10 rows affected)
>> SELECT Department,
+------------+-------+-------------+-----------+-----------+-----------+
| Department | Staff | TotalSalary | AvgSalary | MinSalary | MaxSalary |
+------------+-------+-------------+-----------+-----------+-----------+
| IT         | 4     | 306000      | 76500.0   | 58000     | 91000     |
| Sales      | 3     | 124000      | 41333.33  | 38000     | 45000     |
| HR         | 2     | 90000       | 45000.0   | 42000     | 48000     |
| Finance    | 1     | 67000       | 67000.0   | 67000     | 67000     |
+------------+-------+-------------+-----------+-----------+-----------+
4 row(s) returned`,
      explanation: 'IT: 85000 + 72000 + 91000 + 58000 = 306000, average 76500. Sales average 124000 / 3 = 41333.33. ORDER BY uses the alias TotalSalary. In real SSMS the averages show as 76500.000000, 41333.330000 etc. (decimal scale); the lab trims zeros.',
    },
    {
      title: 'Grouping by two columns, with WHERE',
      scenario: 'Count employees by department and gender, and count recent joiners (2023 onwards) per city and year.',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Department NVARCHAR(30) NOT NULL,
    Gender CHAR(1) NOT NULL,
    City NVARCHAR(30),
    Salary INT NOT NULL,
    JoinYear INT
);
GO
INSERT INTO Employees (EmpName, Department, Gender, City, Salary, JoinYear) VALUES
('Meera', 'HR', 'F', 'Pune', 42000, 2022),
('Arjun', 'IT', 'M', 'Pune', 85000, 2021),
('Sana', 'IT', 'F', 'Mumbai', 72000, 2023),
('Rahul', 'Sales', 'M', 'Delhi', 38000, 2024),
('Divya', 'IT', 'F', 'Pune', 91000, 2020),
('Karan', 'Sales', 'M', 'Mumbai', 45000, 2022),
('Nisha', 'HR', 'F', 'Delhi', 48000, 2023),
('Vikram', 'Finance', 'M', 'Mumbai', 67000, 2021),
('Rohan', 'IT', 'M', 'Delhi', 58000, 2024),
('Priya', 'Sales', 'F', 'Pune', 41000, 2023);
GO
SELECT Department, Gender, COUNT(*) AS Staff
FROM Employees
GROUP BY Department, Gender
ORDER BY Department, Gender;
SELECT City, JoinYear, COUNT(*) AS Joined
FROM Employees
WHERE JoinYear >= 2023
GROUP BY City, JoinYear
ORDER BY City, JoinYear;`,
      tsql: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Department NVARCHAR(30) NOT NULL,
    Gender CHAR(1) NOT NULL,
    City NVARCHAR(30),
    Salary INT NOT NULL,
    JoinYear INT
);
GO
INSERT INTO Employees (EmpName, Department, Gender, City, Salary, JoinYear) VALUES
('Meera', 'HR', 'F', 'Pune', 42000, 2022),
('Arjun', 'IT', 'M', 'Pune', 85000, 2021),
('Sana', 'IT', 'F', 'Mumbai', 72000, 2023),
('Rahul', 'Sales', 'M', 'Delhi', 38000, 2024),
('Divya', 'IT', 'F', 'Pune', 91000, 2020),
('Karan', 'Sales', 'M', 'Mumbai', 45000, 2022),
('Nisha', 'HR', 'F', 'Delhi', 48000, 2023),
('Vikram', 'Finance', 'M', 'Mumbai', 67000, 2021),
('Rohan', 'IT', 'M', 'Delhi', 58000, 2024),
('Priya', 'Sales', 'F', 'Pune', 41000, 2023);
GO
SELECT Department, Gender, COUNT(*) AS Staff
FROM Employees
GROUP BY Department, Gender
ORDER BY Department, Gender;
SELECT City, JoinYear, COUNT(*) AS Joined
FROM Employees
WHERE JoinYear >= 2023
GROUP BY City, JoinYear
ORDER BY City, JoinYear;`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Employees (EmpName, Department, Gender, City, Salary, Join -> (10 rows affected)
>> SELECT Department, Gender, COUNT(*) AS Staff
+------------+--------+-------+
| Department | Gender | Staff |
+------------+--------+-------+
| Finance    | M      | 1     |
| HR         | F      | 2     |
| IT         | F      | 2     |
| IT         | M      | 2     |
| Sales      | F      | 1     |
| Sales      | M      | 2     |
+------------+--------+-------+
6 row(s) returned
>> SELECT City, JoinYear, COUNT(*) AS Joined
+--------+----------+--------+
| City   | JoinYear | Joined |
+--------+----------+--------+
| Delhi  | 2023     | 1      |
| Delhi  | 2024     | 2      |
| Mumbai | 2023     | 1      |
| Pune   | 2023     | 1      |
+--------+----------+--------+
4 row(s) returned`,
      explanation: 'Each unique pair becomes a row. In the second query WHERE removes employees who joined before 2023 BEFORE grouping, so only 5 rows are grouped (Sana, Rahul, Nisha, Rohan, Priya).',
    },
    {
      title: 'HAVING - filter the groups',
      scenario: 'Which departments have at least 3 employees? Which departments (ignoring Delhi staff) have an average salary above 50,000?',
      steps: ['New Query, type the script, press F5', 'Try changing HAVING COUNT(*) >= 3 to HAVING Staff >= 3 - SQL Server reports "Invalid column name \'Staff\'"'],
      code: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Department NVARCHAR(30) NOT NULL,
    Gender CHAR(1) NOT NULL,
    City NVARCHAR(30),
    Salary INT NOT NULL,
    JoinYear INT
);
GO
INSERT INTO Employees (EmpName, Department, Gender, City, Salary, JoinYear) VALUES
('Meera', 'HR', 'F', 'Pune', 42000, 2022),
('Arjun', 'IT', 'M', 'Pune', 85000, 2021),
('Sana', 'IT', 'F', 'Mumbai', 72000, 2023),
('Rahul', 'Sales', 'M', 'Delhi', 38000, 2024),
('Divya', 'IT', 'F', 'Pune', 91000, 2020),
('Karan', 'Sales', 'M', 'Mumbai', 45000, 2022),
('Nisha', 'HR', 'F', 'Delhi', 48000, 2023),
('Vikram', 'Finance', 'M', 'Mumbai', 67000, 2021),
('Rohan', 'IT', 'M', 'Delhi', 58000, 2024),
('Priya', 'Sales', 'F', 'Pune', 41000, 2023);
GO
SELECT Department, COUNT(*) AS Staff
FROM Employees
GROUP BY Department
HAVING COUNT(*) >= 3
ORDER BY Staff DESC, Department;
SELECT Department, ROUND(AVG(Salary * 1.0), 2) AS AvgSalary
FROM Employees
WHERE City <> 'Delhi'
GROUP BY Department
HAVING AVG(Salary * 1.0) > 50000
ORDER BY AvgSalary DESC;`,
      tsql: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Department NVARCHAR(30) NOT NULL,
    Gender CHAR(1) NOT NULL,
    City NVARCHAR(30),
    Salary INT NOT NULL,
    JoinYear INT
);
GO
INSERT INTO Employees (EmpName, Department, Gender, City, Salary, JoinYear) VALUES
('Meera', 'HR', 'F', 'Pune', 42000, 2022),
('Arjun', 'IT', 'M', 'Pune', 85000, 2021),
('Sana', 'IT', 'F', 'Mumbai', 72000, 2023),
('Rahul', 'Sales', 'M', 'Delhi', 38000, 2024),
('Divya', 'IT', 'F', 'Pune', 91000, 2020),
('Karan', 'Sales', 'M', 'Mumbai', 45000, 2022),
('Nisha', 'HR', 'F', 'Delhi', 48000, 2023),
('Vikram', 'Finance', 'M', 'Mumbai', 67000, 2021),
('Rohan', 'IT', 'M', 'Delhi', 58000, 2024),
('Priya', 'Sales', 'F', 'Pune', 41000, 2023);
GO
SELECT Department, COUNT(*) AS Staff
FROM Employees
GROUP BY Department
HAVING COUNT(*) >= 3
ORDER BY Staff DESC, Department;
SELECT Department, ROUND(AVG(Salary * 1.0), 2) AS AvgSalary
FROM Employees
WHERE City <> 'Delhi'
GROUP BY Department
HAVING AVG(Salary * 1.0) > 50000
ORDER BY AvgSalary DESC;`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Employees (EmpName, Department, Gender, City, Salary, Join -> (10 rows affected)
>> SELECT Department, COUNT(*) AS Staff
+------------+-------+
| Department | Staff |
+------------+-------+
| IT         | 4     |
| Sales      | 3     |
+------------+-------+
2 row(s) returned
>> SELECT Department, ROUND(AVG(Salary * 1.0), 2) AS AvgSalary
+------------+-----------+
| Department | AvgSalary |
+------------+-----------+
| IT         | 82666.67  |
| Finance    | 67000.0   |
+------------+-----------+
2 row(s) returned`,
      explanation: 'First query: HR (2) and Finance (1) are removed by HAVING. Second: WHERE first drops Delhi rows (Rahul, Nisha, Rohan); IT average becomes (85000 + 72000 + 91000) / 3 = 82666.67; Sales (43000) and HR (42000) fail HAVING.',
    },
  ],
  interview: [
    { q: 'Difference between WHERE and HAVING?', a: 'WHERE filters rows before grouping and cannot contain aggregates. HAVING filters groups after GROUP BY and normally contains aggregates. Both can be used in the same query.', level: 'Easy' },
    { q: 'Can we use HAVING without GROUP BY?', a: 'Yes - the whole table is treated as one group: SELECT COUNT(*) FROM Employees HAVING COUNT(*) > 5 returns one row or none.', level: 'Medium' },
    { q: 'Why does SELECT EmpName, Department, COUNT(*) FROM Employees GROUP BY Department fail?', a: 'EmpName is neither grouped nor aggregated; a department group has many names, so SQL Server cannot choose one (error 8120).', level: 'Medium' },
    { q: 'Can you use a column alias in HAVING in SQL Server?', a: 'No, because HAVING is processed before SELECT. Repeat the expression. Aliases can be used in ORDER BY.', level: 'Medium' },
    { q: 'Write a query: departments whose total salary is more than 1,00,000.', a: 'SELECT Department, SUM(Salary) FROM Employees GROUP BY Department HAVING SUM(Salary) > 100000;', level: 'Easy' },
    { q: 'Find duplicate emails in a Users table.', a: 'SELECT Email, COUNT(*) FROM Users GROUP BY Email HAVING COUNT(*) > 1;', level: 'Medium' },
    { q: 'Does GROUP BY sort the result?', a: 'Not guaranteed. It may appear sorted because of the algorithm used, but always add ORDER BY.', level: 'Medium' },
    { q: 'What is ROLLUP?', a: 'A GROUP BY extension that adds subtotal and grand-total rows: GROUP BY ROLLUP(Department) adds a NULL row with the overall total.', level: 'Hard' },
    { q: 'How are NULLs treated in GROUP BY?', a: 'All NULLs are grouped together into one group.', level: 'Medium' },
    { q: 'Write the logical execution order of SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY.', a: 'FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY.', level: 'Easy' },
  ],
  practice: [
    { task: 'Count employees in each city, most employees first.', hint: 'GROUP BY City ORDER BY COUNT(*) DESC', solution: `SELECT City, COUNT(*) AS Staff FROM Employees GROUP BY City ORDER BY Staff DESC, City;` },
    { task: 'Show the highest salary in each department, only where the highest salary exceeds 60000.', hint: 'MAX + HAVING', solution: `SELECT Department, MAX(Salary) AS Highest FROM Employees
GROUP BY Department HAVING MAX(Salary) > 60000;` },
    { task: 'Show the number of employees who joined each year.', hint: 'GROUP BY JoinYear', solution: `SELECT JoinYear, COUNT(*) AS Joined FROM Employees GROUP BY JoinYear ORDER BY JoinYear;` },
    { task: 'Average salary of female employees per department, only departments with more than 1 female.', hint: 'WHERE Gender = \'F\' then HAVING COUNT(*) > 1', solution: `SELECT Department, AVG(Salary * 1.0) AS AvgSalary, COUNT(*) AS Females
FROM Employees WHERE Gender = 'F'
GROUP BY Department HAVING COUNT(*) > 1;` },
    { task: 'Using StudentDB.Students, show course-wise student count, average marks and topper marks.', hint: 'GROUP BY Course', solution: `SELECT Course, COUNT(*) AS Students, AVG(Marks * 1.0) AS AvgMarks, MAX(Marks) AS TopMarks
FROM Students GROUP BY Course ORDER BY Course;` },
  ],
  quiz: [
    { question: 'Which clause filters groups after aggregation?', options: ['WHERE', 'HAVING', 'ORDER BY', 'TOP'], answer: 1, explanation: 'HAVING filters groups; WHERE filters rows.' },
    { question: 'In a GROUP BY Department query, which SELECT list is valid?', options: ['Department, EmpName', 'EmpName, COUNT(*)', 'Department, COUNT(*)', '*'], answer: 2, explanation: 'Only grouped columns and aggregates are allowed.' },
    { question: 'Logical processing order is:', options: ['SELECT, FROM, WHERE, GROUP BY', 'FROM, GROUP BY, WHERE, HAVING', 'FROM, WHERE, SELECT, GROUP BY', 'FROM, WHERE, GROUP BY, HAVING'], answer: 3, explanation: 'Rows are read, filtered, grouped, then groups are filtered; SELECT comes after.' },
    { question: 'To find departments with more than 5 employees use:', options: ['HAVING COUNT(*) > 5', 'WHERE COUNT(*) > 5', 'GROUP BY COUNT(*) > 5', 'ORDER BY COUNT(*) > 5'], answer: 0, explanation: 'Aggregate conditions go in HAVING.' },
    { question: 'GROUP BY Department, Gender with 3 departments and 2 genders returns at most:', options: ['3 rows', '2 rows', '6 rows', '5 rows'], answer: 2, explanation: 'One row per existing combination: up to 3 x 2 = 6.' },
  ],
};
