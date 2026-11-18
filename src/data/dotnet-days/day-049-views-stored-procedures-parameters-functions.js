const spGet = `USE CompanyDB;
GO
CREATE OR ALTER PROCEDURE dbo.usp_GetEmployeesByDept
    @DeptName NVARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT e.EmpId, e.EmpName, d.DeptName, e.Salary
    FROM Employees e
    INNER JOIN Departments d ON e.DeptId = d.DeptId
    WHERE d.DeptName = @DeptName
    ORDER BY e.Salary DESC;
END
GO

-- run it
EXEC dbo.usp_GetEmployeesByDept @DeptName = 'IT';`;

const spAdd = `USE CompanyDB;
GO
CREATE OR ALTER PROCEDURE dbo.usp_AddEmployee
    @EmpName  NVARCHAR(50),
    @Salary   INT,
    @DeptId   INT,
    @NewEmpId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF @Salary <= 0
    BEGIN
        THROW 50001, 'Salary must be greater than zero.', 1;
    END

    IF NOT EXISTS (SELECT 1 FROM Departments WHERE DeptId = @DeptId)
    BEGIN
        THROW 50002, 'Department does not exist.', 1;
    END

    INSERT INTO Employees (EmpName, Salary, DeptId)
    VALUES (@EmpName, @Salary, @DeptId);

    SET @NewEmpId = SCOPE_IDENTITY();
END
GO

-- run it
DECLARE @Id INT;
EXEC dbo.usp_AddEmployee @EmpName = 'Anita', @Salary = 52000, @DeptId = 4, @NewEmpId = @Id OUTPUT;
SELECT @Id AS NewEmpId;

-- invalid call
EXEC dbo.usp_AddEmployee 'Test', -10, 1, @Id OUTPUT;`;

const spRaise = `USE CompanyDB;
GO
CREATE OR ALTER PROCEDURE dbo.usp_IncreaseSalary
    @DeptId  INT,
    @Percent DECIMAL(5,2) = 10      -- default parameter value
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Employees
    SET Salary = Salary + Salary * @Percent / 100
    WHERE DeptId = @DeptId;

    SELECT @@ROWCOUNT AS EmployeesUpdated;   -- must be read immediately after UPDATE

    SELECT EmpName, Salary FROM Employees WHERE DeptId = @DeptId ORDER BY EmpName;
END
GO

EXEC dbo.usp_IncreaseSalary @DeptId = 1;            -- uses default 10%
-- EXEC dbo.usp_IncreaseSalary @DeptId = 3, @Percent = 5;`;

const fnCode = `USE CompanyDB;
GO
-- 1) Scalar function: returns ONE value
CREATE OR ALTER FUNCTION dbo.fn_AnnualSalary (@Monthly INT)
RETURNS INT
AS
BEGIN
    RETURN @Monthly * 12;
END
GO

-- 2) Inline table-valued function: returns a TABLE
CREATE OR ALTER FUNCTION dbo.fn_EmployeesByLocation (@Location NVARCHAR(30))
RETURNS TABLE
AS
RETURN
(
    SELECT e.EmpName, d.DeptName, e.Salary
    FROM Employees e
    INNER JOIN Departments d ON e.DeptId = d.DeptId
    WHERE d.Location = @Location
);
GO

SELECT TOP 3 EmpName, Salary, dbo.fn_AnnualSalary(Salary) AS AnnualSalary
FROM Employees ORDER BY EmpId;

SELECT * FROM dbo.fn_EmployeesByLocation('Pune') ORDER BY EmpName;`;

export default {
  id: 'day-049-views-stored-procedures-parameters-functions',
  title: 'Views, Stored Procedures, Parameters and Functions',
  module: 'SQL Server & Database Management',
  day: 49,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Save reusable logic inside SQL Server. Create views (saved SELECT queries), stored procedures with input parameters, default values and OUTPUT parameters, and user-defined functions (scalar and table-valued). Build the employee stored procedures that a .NET application will later call.',
  objectives: [
    'Create, query, alter and drop views',
    'Write stored procedures with input, default and OUTPUT parameters and run them with EXEC',
    'Create scalar and inline table-valued functions and use them in SELECT',
    'Choose between a view, a stored procedure and a function',
  ],
  theory: [
    {
      heading: 'Views',
      content: 'A view is a saved SELECT statement that behaves like a virtual table. It stores no data itself (except indexed views) - every time you query the view, its SELECT runs against the base tables, so it always shows current data. Views hide complex joins, restrict which columns users can see (security) and give a stable interface to applications.',
      syntax: `CREATE VIEW vw_EmployeeDetails
AS
SELECT e.EmpId, e.EmpName, d.DeptName, e.Salary
FROM Employees e INNER JOIN Departments d ON e.DeptId = d.DeptId;
GO
SELECT * FROM vw_EmployeeDetails WHERE DeptName = 'IT';

ALTER VIEW vw_EmployeeDetails AS ...;      -- change definition
DROP VIEW vw_EmployeeDetails;`,
      points: [
        'CREATE VIEW must be the only statement in its batch (put GO before and after)',
        'ORDER BY is not allowed inside a view (unless TOP is used) - sort when you query it',
        'A simple view on one table can be used in INSERT/UPDATE; views with joins/aggregates usually cannot',
        'WITH SCHEMABINDING prevents base tables from being changed in a way that breaks the view',
        'SSMS: Database > Views folder; right-click > Script View as > CREATE To to see the definition',
      ],
    },
    {
      heading: 'Stored Procedures',
      content: 'A stored procedure (SP) is a named, precompiled batch of T-SQL stored in the database. It can contain several statements, IF/ELSE logic, variables, transactions and error handling, and can return result sets, OUTPUT parameters and a return code. Applications call SPs instead of sending raw SQL.',
      syntax: `CREATE OR ALTER PROCEDURE dbo.usp_GetEmployeesByDept
    @DeptName NVARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;           -- hide "(n rows affected)" messages
    SELECT ... WHERE d.DeptName = @DeptName;
END
GO
EXEC dbo.usp_GetEmployeesByDept @DeptName = 'IT';`,
      points: [
        'Benefits: reusable, faster (cached execution plan), less network traffic, security (grant EXECUTE only), protects against SQL injection when parameters are used',
        'Naming: usp_ prefix (never sp_ - reserved for system procedures, slower lookup in master)',
        'CREATE OR ALTER (SQL Server 2016 SP1+) creates or replaces in one statement',
        'SSMS: Database > Programmability > Stored Procedures; right-click a procedure > Execute Stored Procedure... opens a parameter dialog',
        'DROP PROCEDURE dbo.usp_GetEmployeesByDept;',
      ],
    },
    {
      heading: 'Parameters: Input, Default and OUTPUT',
      content: 'Parameters start with @ and have a data type. Input parameters pass values in. A default value makes a parameter optional. OUTPUT parameters send a value back to the caller (for example the new identity value). You can pass parameters by position or by name (recommended).',
      syntax: `CREATE PROCEDURE dbo.usp_AddEmployee
    @EmpName NVARCHAR(50),
    @Salary INT = 30000,          -- default
    @NewEmpId INT OUTPUT          -- output
AS ...
    SET @NewEmpId = SCOPE_IDENTITY();

DECLARE @Id INT;
EXEC dbo.usp_AddEmployee @EmpName = 'Anita', @NewEmpId = @Id OUTPUT;
SELECT @Id;`,
      points: ['SCOPE_IDENTITY() returns the last identity value created in the current scope', 'RETURN n gives an integer status code (0 = success by convention)', 'THROW 50001, \'message\', 1; raises a custom error (user error numbers start at 50000)'],
    },
    {
      heading: 'User-Defined Functions',
      content: 'A function takes parameters and RETURNS a value or a table. Unlike procedures, functions can be used inside SELECT, WHERE and JOIN. Functions cannot change data (no INSERT/UPDATE/DELETE on real tables) and cannot use TRY/CATCH or call procedures.',
      points: [
        'Scalar function: RETURNS INT / DECIMAL / NVARCHAR ... - one value per call: SELECT dbo.fn_AnnualSalary(Salary)',
        'Inline table-valued function (iTVF): RETURNS TABLE AS RETURN (SELECT ...) - like a view with parameters, fast',
        'Multi-statement TVF: RETURNS @t TABLE (...) and fills it with several statements - flexible but slower',
        'Always call with the schema: dbo.fn_Name(...)',
        'Built-in functions: GETDATE(), LEN(), UPPER(), ISNULL(), ROUND() ...',
      ],
    },
    {
      heading: 'View vs Stored Procedure vs Function',
      content: 'Choose the right tool for the job.',
      points: [
        'View: no parameters, returns a table, used in SELECT/JOIN, cannot change data by itself',
        'Function: has parameters, returns a value or table, used inside queries, cannot modify data',
        'Stored procedure: has parameters (incl. OUTPUT), can modify data, transactions, error handling, called with EXEC - cannot be used inside SELECT',
        'In .NET: views are queried like tables (EF Core can map them), procedures are called via SqlCommand (CommandType.StoredProcedure) or FromSqlRaw / ExecuteSqlRaw in EF Core',
      ],
      tip: 'The in-app SSMS Lab runs views, but stored procedures, functions and DECLARE variables need real SQL Server - those examples below show complete scripts, SSMS steps and the output you will see.',
    },
  ],
  examples: [
    {
      title: 'Create and query a view',
      scenario: 'The reporting team needs employee names with department and location without writing joins every time.',
      steps: [
        'Open SSMS > New Query (Ctrl+N)',
        'Type the script (creates CompanyDB, then the view) and press F5',
        'Object Explorer: CompanyDB > Views > Refresh - dbo.vw_EmployeeDetails appears',
        'Right-click the view > Select Top 1000 Rows to query it like a table',
      ],
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
CREATE VIEW vw_EmployeeDetails
AS
SELECT e.EmpId, e.EmpName, d.DeptName, d.Location, e.Salary
FROM Employees e
INNER JOIN Departments d ON e.DeptId = d.DeptId;
GO
SELECT * FROM vw_EmployeeDetails WHERE Location = 'Pune' ORDER BY EmpId;
SELECT DeptName, COUNT(*) AS Staff FROM vw_EmployeeDetails GROUP BY DeptName ORDER BY DeptName;`,
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
CREATE VIEW vw_EmployeeDetails
AS
SELECT e.EmpId, e.EmpName, d.DeptName, d.Location, e.Salary
FROM Employees e
INNER JOIN Departments d ON e.DeptId = d.DeptId;
GO
SELECT * FROM vw_EmployeeDetails WHERE Location = 'Pune' ORDER BY EmpId;
SELECT DeptName, COUNT(*) AS Staff FROM vw_EmployeeDetails GROUP BY DeptName ORDER BY DeptName;`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Departments ( -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Departments (DeptName, Location) VALUES -> (5 rows affected)
>> INSERT INTO Employees (EmpName, Salary, DeptId) VALUES -> (10 rows affected)
>> CREATE VIEW vw_EmployeeDetails -> Commands completed successfully.
>> SELECT * FROM vw_EmployeeDetails WHERE Location = 'Pune' ORDER BY EmpI
+-------+---------+----------+----------+--------+
| EmpId | EmpName | DeptName | Location | Salary |
+-------+---------+----------+----------+--------+
| 1     | Meera   | HR       | Pune     | 42000  |
| 7     | Nisha   | HR       | Pune     | 48000  |
| 8     | Vikram  | Finance  | Pune     | 67000  |
+-------+---------+----------+----------+--------+
3 row(s) returned
>> SELECT DeptName, COUNT(*) AS Staff FROM vw_EmployeeDetails GROUP BY De
+----------+-------+
| DeptName | Staff |
+----------+-------+
| Finance  | 1     |
| HR       | 2     |
| IT       | 4     |
| Sales    | 3     |
+----------+-------+
4 row(s) returned`,
      explanation: 'The view hides the join. You can filter, group and sort it like a normal table. GO before CREATE VIEW is required because CREATE VIEW must be the first statement in a batch.',
    },
    {
      title: 'A summary view always shows live data',
      scenario: 'Create a department salary summary view, then give HR a raise and query the view again.',
      steps: ['New Query, type the script, press F5', 'Notice that the view result changed after the UPDATE without recreating the view'],
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
CREATE VIEW vw_DeptSalarySummary
AS
SELECT d.DeptName, COUNT(e.EmpId) AS Staff, ISNULL(SUM(e.Salary), 0) AS TotalSalary
FROM Departments d
LEFT JOIN Employees e ON e.DeptId = d.DeptId
GROUP BY d.DeptName;
GO
SELECT * FROM vw_DeptSalarySummary ORDER BY TotalSalary DESC;
GO
UPDATE Employees SET Salary = Salary + 5000 WHERE DeptId = 1;
GO
SELECT * FROM vw_DeptSalarySummary WHERE DeptName = 'HR';`,
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
CREATE VIEW vw_DeptSalarySummary
AS
SELECT d.DeptName, COUNT(e.EmpId) AS Staff, ISNULL(SUM(e.Salary), 0) AS TotalSalary
FROM Departments d
LEFT JOIN Employees e ON e.DeptId = d.DeptId
GROUP BY d.DeptName;
GO
SELECT * FROM vw_DeptSalarySummary ORDER BY TotalSalary DESC;
GO
UPDATE Employees SET Salary = Salary + 5000 WHERE DeptId = 1;
GO
SELECT * FROM vw_DeptSalarySummary WHERE DeptName = 'HR';`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Departments ( -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Departments (DeptName, Location) VALUES -> (5 rows affected)
>> INSERT INTO Employees (EmpName, Salary, DeptId) VALUES -> (10 rows affected)
>> CREATE VIEW vw_DeptSalarySummary -> Commands completed successfully.
>> SELECT * FROM vw_DeptSalarySummary ORDER BY TotalSalary DESC
+----------+-------+-------------+
| DeptName | Staff | TotalSalary |
+----------+-------+-------------+
| IT       | 4     | 306000      |
| Sales    | 3     | 124000      |
| HR       | 2     | 90000       |
| Finance  | 1     | 67000       |
| Legal    | 0     | 0           |
+----------+-------+-------------+
5 row(s) returned
>> UPDATE Employees SET Salary = Salary + 5000 WHERE DeptId = 1 -> (2 rows affected)
>> SELECT * FROM vw_DeptSalarySummary WHERE DeptName = 'HR'
+----------+-------+-------------+
| DeptName | Staff | TotalSalary |
+----------+-------+-------------+
| HR       | 2     | 100000      |
+----------+-------+-------------+
1 row(s) returned`,
      explanation: 'A view stores only the query, not the data. After HR salaries increased by 5000 each, the same view returns 100000 for HR. LEFT JOIN keeps Legal with 0 staff.',
    },
    {
      title: 'Employee stored procedure with an input parameter',
      scenario: 'Day 49 practical: create usp_GetEmployeesByDept so the application can fetch employees of any department.',
      steps: [
        'In SSMS select CompanyDB (from Day 47 data: 5 departments, 10 employees)',
        'New Query (Ctrl+N), type the script below',
        'Highlight from CREATE OR ALTER PROCEDURE down to the GO and press F5 - Messages: "Commands completed successfully."',
        'Object Explorer: CompanyDB > Programmability > Stored Procedures > Refresh - dbo.usp_GetEmployeesByDept appears',
        'Highlight the EXEC line and press F5 (or right-click the procedure > Execute Stored Procedure... > enter IT in the Value column > OK)',
      ],
      code: spGet,
      result: `Commands completed successfully.

EmpId  EmpName  DeptName  Salary
-----  -------  --------  ------
5      Divya    IT        91000
2      Arjun    IT        85000
3      Sana     IT        72000
9      Rohan    IT        58000

(4 rows in Results tab; no "rows affected" message because SET NOCOUNT ON)`,
      explanation: 'The procedure is compiled once and its plan is cached. @DeptName is a typed parameter, so values are never concatenated into SQL - this prevents SQL injection. Changing the procedure later only needs CREATE OR ALTER again.',
    },
    {
      title: 'Insert procedure with validation and an OUTPUT parameter',
      scenario: 'Add a new employee safely and return the generated EmpId to the caller (exactly what an ASP.NET Core API needs after an insert).',
      steps: [
        'New Query in CompanyDB, type the script',
        'Highlight the CREATE OR ALTER PROCEDURE part up to GO, press F5',
        'Highlight the three lines after "-- run it" and press F5 - the Results tab shows NewEmpId',
        'Highlight the "invalid call" EXEC (together with the DECLARE line, because variables live only inside one batch) and press F5 - the Messages tab shows the custom error',
      ],
      code: spAdd,
      result: `Results tab:
NewEmpId
--------
11

Invalid call - Messages tab:
Msg 50001, Level 16, State 1, Procedure dbo.usp_AddEmployee, Line 12
Salary must be greater than zero.`,
      explanation: 'The procedure validates input with IF and THROW before inserting. SCOPE_IDENTITY() returns 11 because 10 employees already exist. OUTPUT parameters must be marked OUTPUT both in the definition and in the EXEC call.',
    },
    {
      title: 'Procedure with a default parameter (salary increase)',
      scenario: 'Increase salaries of one department by a percentage; 10% if not specified.',
      steps: [
        'New Query in CompanyDB (fresh Day 47 data), type the script',
        'Run the CREATE part (highlight + F5), then run the EXEC line',
        'Two result grids appear: the count and the updated employees',
      ],
      code: spRaise,
      result: `EmployeesUpdated
----------------
2

EmpName  Salary
-------  ------
Meera    46200
Nisha    52800`,
      explanation: '@Percent was omitted so the default 10 was used: 42000 -> 46200 and 48000 -> 52800. @@ROWCOUNT must be read in the very next statement because every statement resets it.',
    },
    {
      title: 'Scalar and table-valued functions',
      scenario: 'Calculate annual salary inside a SELECT, and get employees of a location like a parameterised view.',
      steps: [
        'New Query in CompanyDB (fresh Day 47 data), type the script',
        'Press F5 to run everything (each CREATE is separated by GO)',
        'Object Explorer: Programmability > Functions > Scalar-valued Functions and Table-valued Functions show the two functions',
      ],
      code: fnCode,
      result: `EmpName  Salary  AnnualSalary
-------  ------  ------------
Meera    42000   504000
Arjun    85000   1020000
Sana     72000   864000

EmpName  DeptName  Salary
-------  --------  ------
Meera    HR        42000
Nisha    HR        48000
Vikram   Finance   67000`,
      explanation: 'A scalar function is called once per row inside SELECT. The inline table-valued function is used in FROM like a table and accepts a parameter - something a view cannot do. Neither function can modify data.',
    },
  ],
  interview: [
    { q: 'What is a view? Does it store data?', a: 'A saved SELECT query that acts as a virtual table. A normal view stores only the definition; data comes from base tables at query time. An indexed (materialised) view stores data.', level: 'Easy' },
    { q: 'What are the advantages of stored procedures?', a: 'Reusability, cached execution plans, reduced network traffic, centralised business logic, security (grant EXECUTE without table access), and protection from SQL injection through parameters.', level: 'Easy' },
    { q: 'Difference between a stored procedure and a function?', a: 'Functions must return a value/table, can be used in SELECT/WHERE/JOIN, cannot modify table data or use TRY/CATCH. Procedures are called with EXEC, can modify data, use transactions, have OUTPUT parameters and return multiple result sets, but cannot be used inside SELECT.', level: 'Medium' },
    { q: 'What is an OUTPUT parameter?', a: 'A parameter that returns a value from the procedure to the caller; declared with OUTPUT in the procedure and in the EXEC call.', level: 'Easy' },
    { q: 'Why should you not prefix procedures with sp_?', a: 'sp_ is reserved for system procedures; SQL Server first searches master for them, causing a small overhead and possible name clashes.', level: 'Medium' },
    { q: 'What does SET NOCOUNT ON do?', a: 'Suppresses the "(n rows affected)" messages, reducing network traffic and avoiding confusion for some client libraries.', level: 'Medium' },
    { q: 'SCOPE_IDENTITY() vs @@IDENTITY vs IDENT_CURRENT?', a: 'SCOPE_IDENTITY returns the last identity in the current scope and session (safest). @@IDENTITY returns the last in the session across scopes (affected by triggers). IDENT_CURRENT(\'table\') returns the last for a table in any session.', level: 'Hard' },
    { q: 'Types of user-defined functions?', a: 'Scalar functions, inline table-valued functions and multi-statement table-valued functions.', level: 'Medium' },
    { q: 'Can we update data through a view?', a: 'Yes if the modification affects only one base table and the view has no aggregates, DISTINCT, GROUP BY, etc. WITH CHECK OPTION ensures modified rows still satisfy the view filter.', level: 'Hard' },
    { q: 'Can you use ORDER BY inside a view?', a: 'Not by itself - only together with TOP/OFFSET, and even then the outer query order is not guaranteed. Sort when selecting from the view.', level: 'Medium' },
    { q: 'How do you call a stored procedure from C#?', a: 'SqlCommand with CommandType.StoredProcedure and SqlParameter objects (OUTPUT via Direction = ParameterDirection.Output), or EF Core FromSqlRaw/FromSqlInterpolated / ExecuteSqlRaw.', level: 'Medium' },
    { q: 'How do you see the definition of a procedure?', a: 'Right-click > Modify or Script Stored Procedure as > CREATE To, or EXEC sp_helptext \'dbo.usp_Name\', or OBJECT_DEFINITION(OBJECT_ID(\'dbo.usp_Name\')).', level: 'Easy' },
  ],
  practice: [
    { task: 'Create a view vw_HighEarners showing EmpName, DeptName and Salary for salaries above 60000. Query it sorted by salary.', hint: 'JOIN inside the view; ORDER BY outside', solution: `CREATE VIEW vw_HighEarners
AS
SELECT e.EmpName, d.DeptName, e.Salary
FROM Employees e JOIN Departments d ON e.DeptId = d.DeptId
WHERE e.Salary > 60000;
GO
SELECT * FROM vw_HighEarners ORDER BY Salary DESC;` },
    { task: 'Create usp_GetEmployeeById @EmpId that returns one employee, and a message if not found.', hint: 'IF NOT EXISTS ... PRINT / THROW', solution: `CREATE OR ALTER PROCEDURE dbo.usp_GetEmployeeById @EmpId INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Employees WHERE EmpId = @EmpId)
        THROW 50010, 'Employee not found.', 1;
    SELECT EmpId, EmpName, Salary, DeptId FROM Employees WHERE EmpId = @EmpId;
END
GO
EXEC dbo.usp_GetEmployeeById 3;` },
    { task: 'Create usp_DeptStats @DeptId with OUTPUT parameters @Count and @AvgSalary.', hint: 'SELECT @Count = COUNT(*), @AvgSalary = AVG(...)', solution: `CREATE OR ALTER PROCEDURE dbo.usp_DeptStats
    @DeptId INT, @Count INT OUTPUT, @AvgSalary DECIMAL(10,2) OUTPUT
AS
BEGIN
    SELECT @Count = COUNT(*), @AvgSalary = AVG(Salary * 1.0)
    FROM Employees WHERE DeptId = @DeptId;
END
GO
DECLARE @c INT, @a DECIMAL(10,2);
EXEC dbo.usp_DeptStats 2, @c OUTPUT, @a OUTPUT;
SELECT @c AS Staff, @a AS AvgSalary;   -- 4, 76500.00` },
    { task: 'Create a scalar function fn_Grade(@Marks INT) returning \'A\' (>=80), \'B\' (>=60), \'C\' (>=40) else \'F\', and use it on the Students table.', hint: 'CASE inside RETURN', solution: `CREATE OR ALTER FUNCTION dbo.fn_Grade (@Marks INT)
RETURNS CHAR(1)
AS
BEGIN
    RETURN CASE WHEN @Marks >= 80 THEN 'A' WHEN @Marks >= 60 THEN 'B'
                WHEN @Marks >= 40 THEN 'C' ELSE 'F' END;
END
GO
SELECT FullName, Marks, dbo.fn_Grade(Marks) AS Grade FROM Students;` },
    { task: 'Create an inline table-valued function fn_EmployeesAboveSalary(@Min INT) and join it with Departments.', hint: 'RETURNS TABLE AS RETURN (SELECT ...)', solution: `CREATE OR ALTER FUNCTION dbo.fn_EmployeesAboveSalary (@Min INT)
RETURNS TABLE AS RETURN (SELECT EmpId, EmpName, Salary, DeptId FROM Employees WHERE Salary > @Min);
GO
SELECT f.EmpName, d.DeptName, f.Salary
FROM dbo.fn_EmployeesAboveSalary(50000) f JOIN Departments d ON d.DeptId = f.DeptId;` },
  ],
  quiz: [
    { question: 'Which object can be used inside a SELECT statement?', options: ['Stored procedure', 'Function', 'Trigger', 'Login'], answer: 1, explanation: 'Functions (scalar/table-valued) can be used in SELECT, WHERE and FROM; procedures need EXEC.' },
    { question: 'Which keyword returns a value from a procedure through a parameter?', options: ['RETURNS', 'INOUT', 'OUTPUT', 'REF'], answer: 2, explanation: 'Parameters marked OUTPUT pass values back to the caller.' },
    { question: 'A normal (non-indexed) view stores:', options: ['Only its SELECT definition', 'A copy of the data', 'An index of the data', 'Nothing - it is deleted after use'], answer: 0, explanation: 'Data is read from base tables each time.' },
    { question: 'Which statement runs a stored procedure?', options: ['CALL usp_X', 'RUN usp_X', 'SELECT usp_X()', 'EXEC usp_X'], answer: 3, explanation: 'EXEC (or EXECUTE) runs a procedure in SQL Server.' },
    { question: 'Which is NOT allowed inside a user-defined function?', options: ['RETURN', 'SELECT from a table', 'INSERT into a permanent table', 'CASE expression'], answer: 2, explanation: 'Functions cannot modify database state.' },
  ],
};
