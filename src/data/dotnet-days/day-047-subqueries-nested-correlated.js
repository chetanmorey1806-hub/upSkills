export default {
  id: 'day-047-subqueries-nested-correlated',
  title: 'Subqueries, Nested Queries and Correlated Subqueries',
  module: 'SQL Server & Database Management',
  day: 47,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Write a query inside another query. Learn single-value (scalar) subqueries, multi-row subqueries with IN / NOT IN, correlated subqueries that run per outer row, EXISTS / NOT EXISTS, subqueries in SELECT and FROM (derived tables) - and find employees earning above the average salary.',
  objectives: [
    'Write scalar subqueries in WHERE (above-average salary)',
    'Use IN, NOT IN, EXISTS and NOT EXISTS with subqueries',
    'Explain and write correlated subqueries',
    'Use subqueries in the SELECT list and as derived tables in FROM',
  ],
  theory: [
    {
      heading: 'What is a Subquery?',
      content: 'A subquery (inner / nested query) is a SELECT written inside brackets within another statement (outer query). SQL Server first needs the inner result, then uses it in the outer query. It lets you answer questions in one statement such as "who earns more than the average?" - you cannot write WHERE Salary > AVG(Salary) directly.',
      syntax: `SELECT EmpName, Salary
FROM Employees
WHERE Salary > (SELECT AVG(Salary * 1.0) FROM Employees);`,
      points: [
        'Subqueries can appear in WHERE, HAVING, SELECT list, FROM, and in INSERT/UPDATE/DELETE',
        'Must be in parentheses',
        'ORDER BY is not allowed inside a subquery (unless TOP/OFFSET is used)',
        'Nested queries can go many levels deep (up to 32)',
      ],
    },
    {
      heading: 'Single-Row vs Multi-Row Subqueries',
      content: 'A scalar (single-row) subquery returns exactly one value and can be used with =, >, < etc. A multi-row subquery returns a list and must be used with IN, NOT IN, ANY, ALL or EXISTS. Using = with a subquery that returns several rows gives Msg 512: "Subquery returned more than 1 value."',
      syntax: `-- scalar
WHERE Salary = (SELECT MAX(Salary) FROM Employees)
-- multi-row
WHERE DeptId IN (SELECT DeptId FROM Departments WHERE Location = 'Pune')
-- ALL / ANY
WHERE Salary > ALL (SELECT Salary FROM Employees WHERE DeptId = 3)`,
      tip: 'NOT IN with a subquery that returns a NULL returns no rows. Add WHERE col IS NOT NULL inside the subquery or use NOT EXISTS.',
    },
    {
      heading: 'Correlated Subqueries',
      content: 'A correlated subquery refers to a column of the OUTER query, so it is (logically) executed once for every outer row. Example: compare each employee with the average of HIS OWN department. The inner query uses e.DeptId from the outer row.',
      syntax: `SELECT e.EmpName, e.Salary
FROM Employees e
WHERE e.Salary > (SELECT AVG(x.Salary * 1.0)
                  FROM Employees x
                  WHERE x.DeptId = e.DeptId);   -- e comes from outside`,
      points: ['Non-correlated: inner query runs once, independent of the outer query', 'Correlated: inner query depends on the outer row - can be slower on big tables, but SQL Server often optimises it into a join'],
    },
    {
      heading: 'EXISTS and NOT EXISTS',
      content: 'EXISTS returns TRUE as soon as the subquery finds at least one row - it does not care about the values, so SELECT 1 is common. NOT EXISTS is the safest way to find "missing" rows (handles NULL correctly).',
      syntax: `SELECT d.DeptName FROM Departments d
WHERE NOT EXISTS (SELECT 1 FROM Employees e WHERE e.DeptId = d.DeptId);`,
    },
    {
      heading: 'Subqueries in SELECT and FROM (Derived Tables)',
      content: 'A scalar subquery in the SELECT list calculates a value per row. A subquery in FROM is a derived table - it must have an alias and its columns must have names. Derived tables let you filter on aggregated results; CTEs (WITH ... AS) are a more readable alternative.',
      syntax: `SELECT t.DeptName, t.TotalSalary
FROM (SELECT d.DeptName, SUM(e.Salary) AS TotalSalary
      FROM Departments d JOIN Employees e ON e.DeptId = d.DeptId
      GROUP BY d.DeptName) AS t
WHERE t.TotalSalary > 100000;`,
    },
    {
      heading: 'Subqueries in DML',
      content: 'Subqueries also work in UPDATE, DELETE and INSERT. Always test the subquery alone first (highlight it and press F5).',
      syntax: `UPDATE Employees SET Salary = Salary + 2000
WHERE DeptId = (SELECT DeptId FROM Departments WHERE DeptName = 'HR');

DELETE FROM Employees
WHERE DeptId IN (SELECT DeptId FROM Departments WHERE Location = 'Delhi');`,
    },
  ],
  examples: [
    {
      title: 'Employees above average salary',
      scenario: 'Day 47 practical: HR wants a list of employees who earn more than the company average.',
      steps: ['Open SSMS > New Query (Ctrl+N)', 'Type the script (creates Departments and Employees)', 'Press F5', 'Highlight only the inner SELECT AVG(...) and press F5 to see the subquery value alone'],
      code: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL,
    Location NVARCHAR(30) NOT NULL
);
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Salary INT NOT NULL,
    DeptId INT FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName, Location) VALUES
('HR', 'Pune'), ('IT', 'Bengaluru'), ('Sales', 'Mumbai'), ('Finance', 'Pune'), ('Legal', 'Delhi');
INSERT INTO Employees (EmpName, Salary, DeptId) VALUES
('Meera', 42000, 1), ('Arjun', 85000, 2), ('Sana', 72000, 2),
('Rahul', 38000, 3), ('Divya', 91000, 2), ('Karan', 45000, 3),
('Nisha', 48000, 1), ('Vikram', 67000, 4), ('Rohan', 58000, 2), ('Priya', 41000, 3);
GO
SELECT AVG(Salary * 1.0) AS AvgSalary FROM Employees;
SELECT EmpName, Salary
FROM Employees
WHERE Salary > (SELECT AVG(Salary * 1.0) FROM Employees)
ORDER BY Salary DESC;`,
      tsql: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL,
    Location NVARCHAR(30) NOT NULL
);
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Salary INT NOT NULL,
    DeptId INT FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName, Location) VALUES
('HR', 'Pune'), ('IT', 'Bengaluru'), ('Sales', 'Mumbai'), ('Finance', 'Pune'), ('Legal', 'Delhi');
INSERT INTO Employees (EmpName, Salary, DeptId) VALUES
('Meera', 42000, 1), ('Arjun', 85000, 2), ('Sana', 72000, 2),
('Rahul', 38000, 3), ('Divya', 91000, 2), ('Karan', 45000, 3),
('Nisha', 48000, 1), ('Vikram', 67000, 4), ('Rohan', 58000, 2), ('Priya', 41000, 3);
GO
SELECT AVG(Salary * 1.0) AS AvgSalary FROM Employees;
SELECT EmpName, Salary
FROM Employees
WHERE Salary > (SELECT AVG(Salary * 1.0) FROM Employees)
ORDER BY Salary DESC;`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Departments ( -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Departments (DeptName, Location) VALUES -> (5 rows affected)
>> INSERT INTO Employees (EmpName, Salary, DeptId) VALUES -> (10 rows affected)
>> SELECT AVG(Salary * 1.0) AS AvgSalary FROM Employees
+-----------+
| AvgSalary |
+-----------+
| 58700.0   |
+-----------+
1 row(s) returned
>> SELECT EmpName, Salary
+---------+--------+
| EmpName | Salary |
+---------+--------+
| Divya   | 91000  |
| Arjun   | 85000  |
| Sana    | 72000  |
| Vikram  | 67000  |
+---------+--------+
4 row(s) returned`,
      explanation: 'Total salary 587000 / 10 = 58700. The inner query runs once, then the outer query keeps the 4 salaries above 58700. Real SSMS shows the average as 58700.000000.',
    },
    {
      title: 'IN, NOT IN and the second highest salary',
      scenario: 'Find employees working in Pune departments, departments with no employees, and the second highest salary.',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL,
    Location NVARCHAR(30) NOT NULL
);
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Salary INT NOT NULL,
    DeptId INT FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName, Location) VALUES
('HR', 'Pune'), ('IT', 'Bengaluru'), ('Sales', 'Mumbai'), ('Finance', 'Pune'), ('Legal', 'Delhi');
INSERT INTO Employees (EmpName, Salary, DeptId) VALUES
('Meera', 42000, 1), ('Arjun', 85000, 2), ('Sana', 72000, 2),
('Rahul', 38000, 3), ('Divya', 91000, 2), ('Karan', 45000, 3),
('Nisha', 48000, 1), ('Vikram', 67000, 4), ('Rohan', 58000, 2), ('Priya', 41000, 3);
GO
SELECT EmpName, Salary FROM Employees
WHERE DeptId IN (SELECT DeptId FROM Departments WHERE Location = 'Pune')
ORDER BY EmpName;
SELECT DeptName FROM Departments
WHERE DeptId NOT IN (SELECT DeptId FROM Employees WHERE DeptId IS NOT NULL);
SELECT MAX(Salary) AS SecondHighest FROM Employees
WHERE Salary < (SELECT MAX(Salary) FROM Employees);`,
      tsql: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL,
    Location NVARCHAR(30) NOT NULL
);
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Salary INT NOT NULL,
    DeptId INT FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName, Location) VALUES
('HR', 'Pune'), ('IT', 'Bengaluru'), ('Sales', 'Mumbai'), ('Finance', 'Pune'), ('Legal', 'Delhi');
INSERT INTO Employees (EmpName, Salary, DeptId) VALUES
('Meera', 42000, 1), ('Arjun', 85000, 2), ('Sana', 72000, 2),
('Rahul', 38000, 3), ('Divya', 91000, 2), ('Karan', 45000, 3),
('Nisha', 48000, 1), ('Vikram', 67000, 4), ('Rohan', 58000, 2), ('Priya', 41000, 3);
GO
SELECT EmpName, Salary FROM Employees
WHERE DeptId IN (SELECT DeptId FROM Departments WHERE Location = 'Pune')
ORDER BY EmpName;
SELECT DeptName FROM Departments
WHERE DeptId NOT IN (SELECT DeptId FROM Employees WHERE DeptId IS NOT NULL);
SELECT MAX(Salary) AS SecondHighest FROM Employees
WHERE Salary < (SELECT MAX(Salary) FROM Employees);`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Departments ( -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Departments (DeptName, Location) VALUES -> (5 rows affected)
>> INSERT INTO Employees (EmpName, Salary, DeptId) VALUES -> (10 rows affected)
>> SELECT EmpName, Salary FROM Employees
+---------+--------+
| EmpName | Salary |
+---------+--------+
| Meera   | 42000  |
| Nisha   | 48000  |
| Vikram  | 67000  |
+---------+--------+
3 row(s) returned
>> SELECT DeptName FROM Departments
+----------+
| DeptName |
+----------+
| Legal    |
+----------+
1 row(s) returned
>> SELECT MAX(Salary) AS SecondHighest FROM Employees
+---------------+
| SecondHighest |
+---------------+
| 85000         |
+---------------+
1 row(s) returned`,
      explanation: 'HR (1) and Finance (4) are in Pune, so their employees are returned. Legal has no employees. IS NOT NULL inside the NOT IN subquery protects against the NULL trap. The second highest is the MAX of all salaries smaller than the top salary (91000) = 85000.',
    },
    {
      title: 'Correlated subquery - above department average',
      scenario: 'Find employees who earn more than the average salary of their own department.',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL,
    Location NVARCHAR(30) NOT NULL
);
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Salary INT NOT NULL,
    DeptId INT FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName, Location) VALUES
('HR', 'Pune'), ('IT', 'Bengaluru'), ('Sales', 'Mumbai'), ('Finance', 'Pune'), ('Legal', 'Delhi');
INSERT INTO Employees (EmpName, Salary, DeptId) VALUES
('Meera', 42000, 1), ('Arjun', 85000, 2), ('Sana', 72000, 2),
('Rahul', 38000, 3), ('Divya', 91000, 2), ('Karan', 45000, 3),
('Nisha', 48000, 1), ('Vikram', 67000, 4), ('Rohan', 58000, 2), ('Priya', 41000, 3);
GO
SELECT e.EmpName, e.Salary, e.DeptId
FROM Employees e
WHERE e.Salary > (SELECT AVG(x.Salary * 1.0)
                  FROM Employees x
                  WHERE x.DeptId = e.DeptId)
ORDER BY e.DeptId, e.Salary DESC;`,
      tsql: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL,
    Location NVARCHAR(30) NOT NULL
);
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Salary INT NOT NULL,
    DeptId INT FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName, Location) VALUES
('HR', 'Pune'), ('IT', 'Bengaluru'), ('Sales', 'Mumbai'), ('Finance', 'Pune'), ('Legal', 'Delhi');
INSERT INTO Employees (EmpName, Salary, DeptId) VALUES
('Meera', 42000, 1), ('Arjun', 85000, 2), ('Sana', 72000, 2),
('Rahul', 38000, 3), ('Divya', 91000, 2), ('Karan', 45000, 3),
('Nisha', 48000, 1), ('Vikram', 67000, 4), ('Rohan', 58000, 2), ('Priya', 41000, 3);
GO
SELECT e.EmpName, e.Salary, e.DeptId
FROM Employees e
WHERE e.Salary > (SELECT AVG(x.Salary * 1.0)
                  FROM Employees x
                  WHERE x.DeptId = e.DeptId)
ORDER BY e.DeptId, e.Salary DESC;`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Departments ( -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Departments (DeptName, Location) VALUES -> (5 rows affected)
>> INSERT INTO Employees (EmpName, Salary, DeptId) VALUES -> (10 rows affected)
>> SELECT e.EmpName, e.Salary, e.DeptId
+---------+--------+--------+
| EmpName | Salary | DeptId |
+---------+--------+--------+
| Nisha   | 48000  | 1      |
| Divya   | 91000  | 2      |
| Arjun   | 85000  | 2      |
| Karan   | 45000  | 3      |
+---------+--------+--------+
4 row(s) returned`,
      explanation: 'For every outer row, the inner query computes that department\'s average: HR 45000 (Nisha 48000 qualifies), IT 76500 (Divya, Arjun), Sales 41333.33 (Karan 45000), Finance 67000 (Vikram is equal, not greater).',
    },
    {
      title: 'EXISTS and NOT EXISTS',
      scenario: 'Which departments have someone earning above 80000? Which departments have no staff at all?',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL,
    Location NVARCHAR(30) NOT NULL
);
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Salary INT NOT NULL,
    DeptId INT FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName, Location) VALUES
('HR', 'Pune'), ('IT', 'Bengaluru'), ('Sales', 'Mumbai'), ('Finance', 'Pune'), ('Legal', 'Delhi');
INSERT INTO Employees (EmpName, Salary, DeptId) VALUES
('Meera', 42000, 1), ('Arjun', 85000, 2), ('Sana', 72000, 2),
('Rahul', 38000, 3), ('Divya', 91000, 2), ('Karan', 45000, 3),
('Nisha', 48000, 1), ('Vikram', 67000, 4), ('Rohan', 58000, 2), ('Priya', 41000, 3);
GO
SELECT d.DeptName FROM Departments d
WHERE EXISTS (SELECT 1 FROM Employees e WHERE e.DeptId = d.DeptId AND e.Salary > 80000);
SELECT d.DeptName FROM Departments d
WHERE NOT EXISTS (SELECT 1 FROM Employees e WHERE e.DeptId = d.DeptId);`,
      tsql: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL,
    Location NVARCHAR(30) NOT NULL
);
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Salary INT NOT NULL,
    DeptId INT FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName, Location) VALUES
('HR', 'Pune'), ('IT', 'Bengaluru'), ('Sales', 'Mumbai'), ('Finance', 'Pune'), ('Legal', 'Delhi');
INSERT INTO Employees (EmpName, Salary, DeptId) VALUES
('Meera', 42000, 1), ('Arjun', 85000, 2), ('Sana', 72000, 2),
('Rahul', 38000, 3), ('Divya', 91000, 2), ('Karan', 45000, 3),
('Nisha', 48000, 1), ('Vikram', 67000, 4), ('Rohan', 58000, 2), ('Priya', 41000, 3);
GO
SELECT d.DeptName FROM Departments d
WHERE EXISTS (SELECT 1 FROM Employees e WHERE e.DeptId = d.DeptId AND e.Salary > 80000);
SELECT d.DeptName FROM Departments d
WHERE NOT EXISTS (SELECT 1 FROM Employees e WHERE e.DeptId = d.DeptId);`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Departments ( -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Departments (DeptName, Location) VALUES -> (5 rows affected)
>> INSERT INTO Employees (EmpName, Salary, DeptId) VALUES -> (10 rows affected)
>> SELECT d.DeptName FROM Departments d
+----------+
| DeptName |
+----------+
| IT       |
+----------+
1 row(s) returned
>> SELECT d.DeptName FROM Departments d
+----------+
| DeptName |
+----------+
| Legal    |
+----------+
1 row(s) returned`,
      explanation: 'Only IT has Arjun (85000) and Divya (91000). NOT EXISTS returns Legal. EXISTS stops at the first matching row, which makes it efficient.',
    },
    {
      title: 'Subquery in SELECT and in FROM (derived table)',
      scenario: 'Show staff count for every department, then only departments whose total salary exceeds 1,00,000.',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL,
    Location NVARCHAR(30) NOT NULL
);
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Salary INT NOT NULL,
    DeptId INT FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName, Location) VALUES
('HR', 'Pune'), ('IT', 'Bengaluru'), ('Sales', 'Mumbai'), ('Finance', 'Pune'), ('Legal', 'Delhi');
INSERT INTO Employees (EmpName, Salary, DeptId) VALUES
('Meera', 42000, 1), ('Arjun', 85000, 2), ('Sana', 72000, 2),
('Rahul', 38000, 3), ('Divya', 91000, 2), ('Karan', 45000, 3),
('Nisha', 48000, 1), ('Vikram', 67000, 4), ('Rohan', 58000, 2), ('Priya', 41000, 3);
GO
SELECT d.DeptName,
       (SELECT COUNT(*) FROM Employees e WHERE e.DeptId = d.DeptId) AS Staff
FROM Departments d
ORDER BY d.DeptId;
SELECT t.DeptName, t.TotalSalary
FROM (SELECT d.DeptName, SUM(e.Salary) AS TotalSalary
      FROM Departments d JOIN Employees e ON e.DeptId = d.DeptId
      GROUP BY d.DeptName) AS t
WHERE t.TotalSalary > 100000
ORDER BY t.TotalSalary DESC;`,
      tsql: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL,
    Location NVARCHAR(30) NOT NULL
);
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Salary INT NOT NULL,
    DeptId INT FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName, Location) VALUES
('HR', 'Pune'), ('IT', 'Bengaluru'), ('Sales', 'Mumbai'), ('Finance', 'Pune'), ('Legal', 'Delhi');
INSERT INTO Employees (EmpName, Salary, DeptId) VALUES
('Meera', 42000, 1), ('Arjun', 85000, 2), ('Sana', 72000, 2),
('Rahul', 38000, 3), ('Divya', 91000, 2), ('Karan', 45000, 3),
('Nisha', 48000, 1), ('Vikram', 67000, 4), ('Rohan', 58000, 2), ('Priya', 41000, 3);
GO
SELECT d.DeptName,
       (SELECT COUNT(*) FROM Employees e WHERE e.DeptId = d.DeptId) AS Staff
FROM Departments d
ORDER BY d.DeptId;
SELECT t.DeptName, t.TotalSalary
FROM (SELECT d.DeptName, SUM(e.Salary) AS TotalSalary
      FROM Departments d JOIN Employees e ON e.DeptId = d.DeptId
      GROUP BY d.DeptName) AS t
WHERE t.TotalSalary > 100000
ORDER BY t.TotalSalary DESC;`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Departments ( -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Departments (DeptName, Location) VALUES -> (5 rows affected)
>> INSERT INTO Employees (EmpName, Salary, DeptId) VALUES -> (10 rows affected)
>> SELECT d.DeptName,
+----------+-------+
| DeptName | Staff |
+----------+-------+
| HR       | 2     |
| IT       | 4     |
| Sales    | 3     |
| Finance  | 1     |
| Legal    | 0     |
+----------+-------+
5 row(s) returned
>> SELECT t.DeptName, t.TotalSalary
+----------+-------------+
| DeptName | TotalSalary |
+----------+-------------+
| IT       | 306000      |
| Sales    | 124000      |
+----------+-------------+
2 row(s) returned`,
      explanation: 'The SELECT-list subquery is correlated and runs per department (Legal gets 0). The derived table t groups salaries first; the outer WHERE can then filter on TotalSalary - the same result as HAVING, but the pattern is useful for multi-step calculations.',
    },
  ],
  interview: [
    { q: 'What is a subquery?', a: 'A SELECT statement nested inside another statement (SELECT, INSERT, UPDATE, DELETE), enclosed in parentheses, whose result is used by the outer query.', level: 'Easy' },
    { q: 'Difference between a nested (non-correlated) and a correlated subquery?', a: 'A non-correlated subquery runs once independently. A correlated subquery references outer-query columns and is evaluated for each outer row.', level: 'Medium' },
    { q: 'Write a query to find employees earning above the average salary.', a: 'SELECT * FROM Employees WHERE Salary > (SELECT AVG(Salary) FROM Employees);', level: 'Easy' },
    { q: 'Find the second highest salary without TOP.', a: 'SELECT MAX(Salary) FROM Employees WHERE Salary < (SELECT MAX(Salary) FROM Employees);', level: 'Medium' },
    { q: 'Find the Nth highest salary.', a: 'SELECT DISTINCT Salary FROM Employees ORDER BY Salary DESC OFFSET N-1 ROWS FETCH NEXT 1 ROWS ONLY; or WHERE DENSE_RANK() OVER (ORDER BY Salary DESC) = N in a CTE.', level: 'Hard' },
    { q: 'What causes "Subquery returned more than 1 value"?', a: 'Using =, <, > etc. with a subquery that returns multiple rows. Use IN or make the subquery return one value (MAX, TOP 1).', level: 'Medium' },
    { q: 'IN vs EXISTS?', a: 'IN compares a value against a list returned by the subquery; EXISTS checks only whether any row exists and stops at the first match. EXISTS handles NULLs safely and is usually preferred for correlated checks.', level: 'Medium' },
    { q: 'Why can NOT IN return no rows?', a: 'If the subquery returns a NULL, the NOT IN comparison becomes UNKNOWN for every row. Use NOT EXISTS or filter NULLs.', level: 'Hard' },
    { q: 'What is a derived table?', a: 'A subquery in the FROM clause that acts as a temporary table; it must have an alias.', level: 'Medium' },
    { q: 'Subquery vs JOIN - which is faster?', a: 'Often the optimizer produces the same plan. JOINs are usually clearer when you need columns from both tables; EXISTS/subqueries are clearer for existence checks. Check the execution plan.', level: 'Medium' },
  ],
  practice: [
    { task: 'Find the employee(s) with the lowest salary.', hint: 'Scalar subquery with MIN', solution: `SELECT EmpName, Salary FROM Employees WHERE Salary = (SELECT MIN(Salary) FROM Employees);` },
    { task: 'List employees who work in the IT department using a subquery (not a join).', hint: 'DeptId = (SELECT DeptId ...)', solution: `SELECT EmpName FROM Employees
WHERE DeptId = (SELECT DeptId FROM Departments WHERE DeptName = 'IT');` },
    { task: 'Show each employee with the company average salary and the difference.', hint: 'Subquery in SELECT', solution: `SELECT EmpName, Salary,
       (SELECT AVG(Salary * 1.0) FROM Employees) AS CompanyAvg,
       Salary - (SELECT AVG(Salary * 1.0) FROM Employees) AS Diff
FROM Employees;` },
    { task: 'Give a 10% raise to employees whose salary is below their department average.', hint: 'Correlated subquery in UPDATE', solution: `UPDATE e SET Salary = Salary + Salary / 10
FROM Employees e
WHERE e.Salary < (SELECT AVG(x.Salary) FROM Employees x WHERE x.DeptId = e.DeptId);` },
    { task: 'List departments where every employee earns more than 40000.', hint: 'NOT EXISTS an employee <= 40000, and EXISTS some employee', solution: `SELECT d.DeptName FROM Departments d
WHERE EXISTS (SELECT 1 FROM Employees e WHERE e.DeptId = d.DeptId)
  AND NOT EXISTS (SELECT 1 FROM Employees e WHERE e.DeptId = d.DeptId AND e.Salary <= 40000);` },
  ],
  quiz: [
    { question: 'A subquery that refers to a column of the outer query is called:', options: ['Derived table', 'Scalar function', 'View', 'Correlated subquery'], answer: 3, explanation: 'It is correlated with each outer row.' },
    { question: 'Which operator is correct for a subquery returning many rows?', options: ['=', 'IN', '>', '<>'], answer: 1, explanation: 'Multi-row subqueries need IN / ANY / ALL / EXISTS.' },
    { question: 'EXISTS returns TRUE when:', options: ['The subquery returns at least one row', 'The subquery returns NULL', 'The subquery returns exactly one row', 'The subquery has no WHERE'], answer: 0, explanation: 'EXISTS only checks for at least one row.' },
    { question: 'A subquery in the FROM clause must have:', options: ['ORDER BY', 'TOP', 'An alias', 'GROUP BY'], answer: 2, explanation: 'Derived tables require an alias, e.g. AS t.' },
    { question: 'Salaries 50, 70, 90. MAX(Salary) WHERE Salary < (SELECT MAX(Salary)) returns:', options: ['90', '50', 'NULL', '70'], answer: 3, explanation: 'Values below 90 are 50 and 70; the max is 70.' },
  ],
};
