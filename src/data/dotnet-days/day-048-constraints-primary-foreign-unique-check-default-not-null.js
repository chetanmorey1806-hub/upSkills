export default {
  id: 'day-048-constraints-primary-foreign-unique-check-default-not-null',
  title: 'Constraints: PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, DEFAULT, NOT NULL',
  module: 'SQL Server & Database Management',
  day: 48,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Protect data quality inside the database itself. Learn all six SQL Server constraints - NOT NULL, PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK and DEFAULT - how to name them, add or drop them with ALTER TABLE, and what error each one raises when rules are broken. Build an Employees table with full constraints.',
  objectives: [
    'Explain the purpose of each constraint type',
    'Create an employee table with column-level and table-level constraints',
    'Read and understand constraint-violation errors (515, 547, 2627)',
    'Add, name and drop constraints with ALTER TABLE',
  ],
  theory: [
    {
      heading: 'What are Constraints?',
      content: 'Constraints are rules that SQL Server enforces on every INSERT and UPDATE. Even if a bug in the C# application tries to save bad data, the database rejects it. Validation in the UI and API is for user experience; constraints are the final safety net.',
      points: [
        'NOT NULL - value is required',
        'PRIMARY KEY - unique + not null row identifier (one per table)',
        'FOREIGN KEY - value must exist in the parent table',
        'UNIQUE - no duplicate values (allows one NULL in SQL Server)',
        'CHECK - value must satisfy a condition',
        'DEFAULT - value used when INSERT does not supply one',
      ],
    },
    {
      heading: 'NOT NULL, DEFAULT and CHECK',
      content: 'NOT NULL forbids missing values (error 515). DEFAULT supplies a value when the column is omitted from INSERT - it does NOT replace an explicit NULL. CHECK accepts a row only when its condition is not FALSE (error 547).',
      syntax: `EmpName  NVARCHAR(50) NOT NULL,
City     NVARCHAR(30) DEFAULT 'Pune',
IsActive BIT NOT NULL DEFAULT 1,
JoinDate DATE NOT NULL DEFAULT GETDATE(),
Age      INT CHECK (Age >= 18 AND Age <= 60),
Gender   CHAR(1) CHECK (Gender IN ('M', 'F', 'O'))`,
      tip: 'CHECK passes when the condition is TRUE or UNKNOWN. So a NULL Age passes CHECK (Age >= 18). Add NOT NULL if the value is required.',
    },
    {
      heading: 'UNIQUE vs PRIMARY KEY',
      content: 'Both prevent duplicates and create an index. Differences: a table has one PRIMARY KEY but can have many UNIQUE constraints; PRIMARY KEY never allows NULL, UNIQUE allows a single NULL in SQL Server; PRIMARY KEY is clustered by default, UNIQUE is non-clustered. Typical UNIQUE columns: Email, Mobile, PAN, ProductCode. Violation error: 2627.',
    },
    {
      heading: 'FOREIGN KEY and Cascading Actions',
      content: 'A FOREIGN KEY keeps relationships valid. By default (NO ACTION) you cannot delete a parent that still has children. Cascade options change that behaviour.',
      syntax: `DeptId INT NOT NULL
    CONSTRAINT FK_Employees_Departments FOREIGN KEY REFERENCES Departments(DeptId)
    ON DELETE CASCADE        -- delete employees when department is deleted
    ON UPDATE NO ACTION`,
      points: ['ON DELETE CASCADE / SET NULL / SET DEFAULT / NO ACTION', 'Use CASCADE carefully - one delete can remove thousands of rows'],
    },
    {
      heading: 'Naming, Adding and Dropping Constraints',
      content: 'If you do not name a constraint, SQL Server generates names like CK__Employees__Age__3B75D760 - ugly and different on every server. Name them with CONSTRAINT Name. Naming convention: PK_Table, FK_Child_Parent, UQ_Table_Column, CK_Table_Column, DF_Table_Column.',
      syntax: `-- table-level named constraints
CONSTRAINT PK_Products PRIMARY KEY (ProductId),
CONSTRAINT UQ_Products_Code UNIQUE (ProductCode),
CONSTRAINT CK_Products_Price CHECK (Price >= 1)

-- add / drop later (real SSMS)
ALTER TABLE Employees ADD CONSTRAINT CK_Employees_Salary CHECK (Salary > 0);
ALTER TABLE Employees ADD CONSTRAINT DF_Employees_City DEFAULT 'Pune' FOR City;
ALTER TABLE Employees DROP CONSTRAINT CK_Employees_Salary;`,
      points: ['Object Explorer: Tables > dbo.Employees > Keys and Constraints folders list them', 'sp_help \'Employees\' shows all constraints of a table', 'ALTER TABLE ... NOCHECK CONSTRAINT disables a check/foreign key temporarily (for bulk loads)'],
    },
    {
      heading: 'Constraint Errors You Will See',
      content: 'Know these message numbers - they also appear inside SqlException.Number in C# / EF Core, and you will translate them into friendly API messages later.',
      points: [
        'Msg 515: Cannot insert the value NULL into column ... column does not allow nulls',
        'Msg 547: The INSERT statement conflicted with the CHECK / FOREIGN KEY constraint ...',
        'Msg 2627: Violation of PRIMARY KEY / UNIQUE KEY constraint ... Cannot insert duplicate key',
        'Msg 2601: Cannot insert duplicate key row ... with unique index',
      ],
    },
  ],
  examples: [
    {
      title: 'Create an employee table with constraints',
      scenario: 'Day 48 practical: build an Employees table where email is unique, age 18-60, salary positive, gender restricted, city defaults to Pune and every employee belongs to a valid department.',
      steps: ['Open SSMS > New Query (Ctrl+N)', 'Type the script and press F5', 'Object Explorer: CompanyDB > Tables > dbo.Employees > Constraints (Refresh) to see the CHECK and DEFAULT constraints; Keys shows PK, UQ and FK'],
      code: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL UNIQUE
);
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Age INT CHECK (Age >= 18 AND Age <= 60),
    Salary DECIMAL(10,2) NOT NULL CHECK (Salary > 0),
    Gender CHAR(1) CHECK (Gender IN ('M', 'F', 'O')),
    City NVARCHAR(30) DEFAULT 'Pune',
    IsActive BIT NOT NULL DEFAULT 1,
    DeptId INT NOT NULL FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName) VALUES ('HR'), ('IT'), ('Sales');
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES
('Meera', 'meera@corp.com', 28, 42000, 'F', 1),
('Arjun', 'arjun@corp.com', 35, 85000, 'M', 2);
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, City, DeptId) VALUES
('Karan', 'karan@corp.com', 41, 45000, 'M', 'Mumbai', 3);
GO
SELECT EmpId, EmpName, Email, Age, Salary, Gender, City, IsActive, DeptId FROM Employees;`,
      tsql: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL UNIQUE
);
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Age INT CHECK (Age >= 18 AND Age <= 60),
    Salary DECIMAL(10,2) NOT NULL CHECK (Salary > 0),
    Gender CHAR(1) CHECK (Gender IN ('M', 'F', 'O')),
    City NVARCHAR(30) DEFAULT 'Pune',
    IsActive BIT NOT NULL DEFAULT 1,
    DeptId INT NOT NULL FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName) VALUES ('HR'), ('IT'), ('Sales');
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES
('Meera', 'meera@corp.com', 28, 42000, 'F', 1),
('Arjun', 'arjun@corp.com', 35, 85000, 'M', 2);
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, City, DeptId) VALUES
('Karan', 'karan@corp.com', 41, 45000, 'M', 'Mumbai', 3);
GO
SELECT EmpId, EmpName, Email, Age, Salary, Gender, City, IsActive, DeptId FROM Employees;`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Departments ( -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Departments (DeptName) VALUES ('HR'), ('IT'), ('Sales') -> (3 rows affected)
>> INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VA -> (2 rows affected)
>> INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, City, Dept -> (1 row affected)
>> SELECT EmpId, EmpName, Email, Age, Salary, Gender, City, IsActive, Dep
+-------+---------+----------------+-----+--------+--------+--------+----------+--------+
| EmpId | EmpName | Email          | Age | Salary | Gender | City   | IsActive | DeptId |
+-------+---------+----------------+-----+--------+--------+--------+----------+--------+
| 1     | Meera   | meera@corp.com | 28  | 42000  | F      | Pune   | 1        | 1      |
| 2     | Arjun   | arjun@corp.com | 35  | 85000  | M      | Pune   | 1        | 2      |
| 3     | Karan   | karan@corp.com | 41  | 45000  | M      | Mumbai | 1        | 3      |
+-------+---------+----------------+-----+--------+--------+--------+----------+--------+
3 row(s) returned`,
      explanation: 'Meera and Arjun did not specify City or IsActive, so DEFAULT filled Pune and 1. Karan specified Mumbai, so DEFAULT was not used. Real SSMS prints Salary as 42000.00 (DECIMAL(10,2)); the lab trims trailing zeros.',
    },
    {
      title: 'Watching each constraint reject bad data',
      scenario: 'Try to insert a duplicate email, an under-age employee, a negative salary, a missing name, an invalid gender, an unknown department and a duplicate department name.',
      steps: ['New Query, type the script, press F5', 'Each bad INSERT is in its own batch (GO) - read the red messages in the Messages tab', 'The final count shows that only the 2 valid employees were saved'],
      code: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL UNIQUE
);
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Age INT CHECK (Age >= 18 AND Age <= 60),
    Salary DECIMAL(10,2) NOT NULL CHECK (Salary > 0),
    Gender CHAR(1) CHECK (Gender IN ('M', 'F', 'O')),
    City NVARCHAR(30) DEFAULT 'Pune',
    IsActive BIT NOT NULL DEFAULT 1,
    DeptId INT NOT NULL FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName) VALUES ('HR'), ('IT'), ('Sales');
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES
('Meera', 'meera@corp.com', 28, 42000, 'F', 1),
('Arjun', 'arjun@corp.com', 35, 85000, 'M', 2);
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES ('Tina', 'meera@corp.com', 25, 30000, 'F', 1);
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES ('Raj', 'raj@corp.com', 16, 20000, 'M', 2);
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES ('Sam', 'sam@corp.com', 30, -500, 'M', 2);
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES (NULL, 'x@corp.com', 30, 30000, 'M', 2);
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES ('Lee', 'lee@corp.com', 30, 30000, 'X', 2);
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES ('Zoe', 'zoe@corp.com', 30, 30000, 'F', 9);
GO
INSERT INTO Departments (DeptName) VALUES ('HR');
GO
SELECT COUNT(*) AS EmployeesSaved FROM Employees;`,
      tsql: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL UNIQUE
);
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    EmpName NVARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Age INT CHECK (Age >= 18 AND Age <= 60),
    Salary DECIMAL(10,2) NOT NULL CHECK (Salary > 0),
    Gender CHAR(1) CHECK (Gender IN ('M', 'F', 'O')),
    City NVARCHAR(30) DEFAULT 'Pune',
    IsActive BIT NOT NULL DEFAULT 1,
    DeptId INT NOT NULL FOREIGN KEY REFERENCES Departments(DeptId)
);
GO
INSERT INTO Departments (DeptName) VALUES ('HR'), ('IT'), ('Sales');
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES
('Meera', 'meera@corp.com', 28, 42000, 'F', 1),
('Arjun', 'arjun@corp.com', 35, 85000, 'M', 2);
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES ('Tina', 'meera@corp.com', 25, 30000, 'F', 1);
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES ('Raj', 'raj@corp.com', 16, 20000, 'M', 2);
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES ('Sam', 'sam@corp.com', 30, -500, 'M', 2);
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES (NULL, 'x@corp.com', 30, 30000, 'M', 2);
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES ('Lee', 'lee@corp.com', 30, 30000, 'X', 2);
GO
INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VALUES ('Zoe', 'zoe@corp.com', 30, 30000, 'F', 9);
GO
INSERT INTO Departments (DeptName) VALUES ('HR');
GO
SELECT COUNT(*) AS EmployeesSaved FROM Employees;`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Departments ( -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> INSERT INTO Departments (DeptName) VALUES ('HR'), ('IT'), ('Sales') -> (3 rows affected)
>> INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VA -> (2 rows affected)
>> INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VA -> ERROR: Msg 2627, Level 14, State 1, Line 1
Violation of PRIMARY KEY / UNIQUE KEY constraint. Cannot insert duplicate key. Employees.Email
>> INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VA -> ERROR: Msg 547, Level 16, State 0, Line 1
The statement conflicted with the CHECK constraint.
>> INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VA -> ERROR: Msg 547, Level 16, State 0, Line 1
The statement conflicted with the CHECK constraint.
>> INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VA -> ERROR: Msg 515, Level 16, State 2, Line 1
Cannot insert the value NULL into column EmpName; column does not allow nulls.
>> INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VA -> ERROR: Msg 547, Level 16, State 0, Line 1
The statement conflicted with the CHECK constraint.
>> INSERT INTO Employees (EmpName, Email, Age, Salary, Gender, DeptId) VA -> ERROR: Msg 547, Level 16, State 0, Line 1
The INSERT/UPDATE statement conflicted with the FOREIGN KEY constraint.
>> INSERT INTO Departments (DeptName) VALUES ('HR') -> ERROR: Msg 2627, Level 14, State 1, Line 1
Violation of PRIMARY KEY / UNIQUE KEY constraint. Cannot insert duplicate key. Departments.DeptName
>> SELECT COUNT(*) AS EmployeesSaved FROM Employees
+----------------+
| EmployeesSaved |
+----------------+
| 2              |
+----------------+
1 row(s) returned`,
      explanation: 'UNIQUE (2627) blocks the reused email; CHECK (547) blocks Age 16, Salary -500 and Gender X; NOT NULL (515) blocks the missing name; FOREIGN KEY (547) blocks DeptId 9; UNIQUE on DeptName blocks a second HR. Real SSMS messages also name the constraint, e.g. "The INSERT statement conflicted with the CHECK constraint \\"CK__Employees__Age__...\\"".',
    },
    {
      title: 'Named table-level constraints',
      scenario: 'Create a Products table with properly named PK, UNIQUE, CHECK and DEFAULT constraints.',
      steps: ['New Query, type the script, press F5', 'In real SSMS run EXEC sp_help \'Products\'; and look at the constraint_name column'],
      code: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1),
    ProductCode VARCHAR(10) NOT NULL,
    ProductName NVARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL CONSTRAINT DF_Products_Stock DEFAULT 0,
    CONSTRAINT PK_Products PRIMARY KEY (ProductId),
    CONSTRAINT UQ_Products_Code UNIQUE (ProductCode),
    CONSTRAINT CK_Products_Price CHECK (Price >= 1)
);
GO
INSERT INTO Products (ProductCode, ProductName, Price) VALUES ('P100', 'Keyboard', 799.50), ('P101', 'Mouse', 349);
INSERT INTO Products (ProductCode, ProductName, Price, Stock) VALUES ('P102', 'Monitor', 8999, 15);
GO
INSERT INTO Products (ProductCode, ProductName, Price) VALUES ('P103', 'Sticker', 0.5);
GO
SELECT * FROM Products;`,
      tsql: `CREATE DATABASE CompanyDB;
GO
USE CompanyDB;
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1),
    ProductCode VARCHAR(10) NOT NULL,
    ProductName NVARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL CONSTRAINT DF_Products_Stock DEFAULT 0,
    CONSTRAINT PK_Products PRIMARY KEY (ProductId),
    CONSTRAINT UQ_Products_Code UNIQUE (ProductCode),
    CONSTRAINT CK_Products_Price CHECK (Price >= 1)
);
GO
INSERT INTO Products (ProductCode, ProductName, Price) VALUES ('P100', 'Keyboard', 799.50), ('P101', 'Mouse', 349);
INSERT INTO Products (ProductCode, ProductName, Price, Stock) VALUES ('P102', 'Monitor', 8999, 15);
GO
INSERT INTO Products (ProductCode, ProductName, Price) VALUES ('P103', 'Sticker', 0.5);
GO
SELECT * FROM Products;`,
      result: `>> CREATE DATABASE CompanyDB -> Commands completed successfully.
>> USE CompanyDB -> Commands completed successfully.
>> CREATE TABLE Products ( -> Commands completed successfully.
>> INSERT INTO Products (ProductCode, ProductName, Price) VALUES ('P100', -> (2 rows affected)
>> INSERT INTO Products (ProductCode, ProductName, Price, Stock) VALUES ( -> (1 row affected)
>> INSERT INTO Products (ProductCode, ProductName, Price) VALUES ('P103', -> ERROR: Msg 547, Level 16, State 0, Line 1
The statement conflicted with the CHECK constraint.
>> SELECT * FROM Products
+-----------+-------------+-------------+-------+-------+
| ProductId | ProductCode | ProductName | Price | Stock |
+-----------+-------------+-------------+-------+-------+
| 1         | P100        | Keyboard    | 799.5 | 0     |
| 2         | P101        | Mouse       | 349   | 0     |
| 3         | P102        | Monitor     | 8999  | 15    |
+-----------+-------------+-------------+-------+-------+
3 row(s) returned`,
      explanation: 'DF_Products_Stock gives Stock 0 when not supplied. CK_Products_Price rejects the 0.5 sticker. Named constraints make error messages readable and are easy to drop: ALTER TABLE Products DROP CONSTRAINT CK_Products_Price;',
    },
    {
      title: 'Composite primary key with DEFAULT and CHECK',
      scenario: 'A student may enrol in many courses but only once per course.',
      steps: ['New Query, type the script, press F5'],
      code: `CREATE DATABASE SchoolDB;
GO
USE SchoolDB;
GO
CREATE TABLE Enrollments (
    StudentId INT NOT NULL,
    CourseId INT NOT NULL,
    EnrolledOn DATE NOT NULL DEFAULT '2026-11-17',
    Grade CHAR(1) NULL CHECK (Grade IN ('A', 'B', 'C', 'D', 'F')),
    PRIMARY KEY (StudentId, CourseId)
);
GO
INSERT INTO Enrollments (StudentId, CourseId, Grade) VALUES (1, 10, 'A'), (1, 20, NULL), (2, 10, 'B');
GO
INSERT INTO Enrollments (StudentId, CourseId, Grade) VALUES (1, 10, 'C');
GO
SELECT * FROM Enrollments ORDER BY StudentId, CourseId;`,
      tsql: `CREATE DATABASE SchoolDB;
GO
USE SchoolDB;
GO
CREATE TABLE Enrollments (
    StudentId INT NOT NULL,
    CourseId INT NOT NULL,
    EnrolledOn DATE NOT NULL DEFAULT '2026-11-17',
    Grade CHAR(1) NULL CHECK (Grade IN ('A', 'B', 'C', 'D', 'F')),
    PRIMARY KEY (StudentId, CourseId)
);
GO
INSERT INTO Enrollments (StudentId, CourseId, Grade) VALUES (1, 10, 'A'), (1, 20, NULL), (2, 10, 'B');
GO
INSERT INTO Enrollments (StudentId, CourseId, Grade) VALUES (1, 10, 'C');
GO
SELECT * FROM Enrollments ORDER BY StudentId, CourseId;`,
      result: `>> CREATE DATABASE SchoolDB -> Commands completed successfully.
>> USE SchoolDB -> Commands completed successfully.
>> CREATE TABLE Enrollments ( -> Commands completed successfully.
>> INSERT INTO Enrollments (StudentId, CourseId, Grade) VALUES (1, 10, 'A -> (3 rows affected)
>> INSERT INTO Enrollments (StudentId, CourseId, Grade) VALUES (1, 10, 'C -> ERROR: Msg 2627, Level 14, State 1, Line 1
Violation of PRIMARY KEY / UNIQUE KEY constraint. Cannot insert duplicate key. Enrollments.StudentId, Enrollments.CourseId
>> SELECT * FROM Enrollments ORDER BY StudentId, CourseId
+-----------+----------+------------+-------+
| StudentId | CourseId | EnrolledOn | Grade |
+-----------+----------+------------+-------+
| 1         | 10       | 2026-11-17 | A     |
| 1         | 20       | 2026-11-17 | NULL  |
| 2         | 10       | 2026-11-17 | B     |
+-----------+----------+------------+-------+
3 row(s) returned`,
      explanation: 'PRIMARY KEY (StudentId, CourseId) allows (1,10) and (1,20) but not a second (1,10). Grade NULL passes the CHECK because NULL is UNKNOWN, not FALSE. A fixed default date is used here so the output is repeatable; real tables normally use DEFAULT GETDATE().',
    },
  ],
  interview: [
    { q: 'What is a constraint? Name the types in SQL Server.', a: 'A rule enforced by the database on column/table data. NOT NULL, PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK and DEFAULT.', level: 'Easy' },
    { q: 'Difference between PRIMARY KEY and UNIQUE?', a: 'One PK per table, never NULL, clustered by default. Many UNIQUE constraints allowed, each allows one NULL, non-clustered by default.', level: 'Easy' },
    { q: 'Does a DEFAULT apply when you insert NULL explicitly?', a: 'No. DEFAULT applies only when the column is omitted from the INSERT (or DEFAULT keyword is used). An explicit NULL is stored as NULL (or rejected if NOT NULL).', level: 'Medium' },
    { q: 'Will CHECK (Age >= 18) reject a NULL age?', a: 'No - the condition is UNKNOWN, and CHECK only rejects FALSE. Add NOT NULL to require a value.', level: 'Hard' },
    { q: 'What is ON DELETE CASCADE?', a: 'A foreign key option that automatically deletes child rows when the parent row is deleted.', level: 'Medium' },
    { q: 'How do you add a constraint to an existing table?', a: 'ALTER TABLE Employees ADD CONSTRAINT CK_Employees_Salary CHECK (Salary > 0); existing rows must satisfy it (unless WITH NOCHECK).', level: 'Medium' },
    { q: 'Why name constraints?', a: 'Readable error messages, predictable names across environments (dev/test/prod), and easy ALTER/DROP scripts and migrations.', level: 'Medium' },
    { q: 'Which error numbers indicate duplicate key and NULL violations?', a: '2627 (PK/UNIQUE constraint) or 2601 (unique index) for duplicates, 515 for NULL into NOT NULL, 547 for CHECK/FK conflicts.', level: 'Hard' },
    { q: 'How many NULLs can a UNIQUE column hold in SQL Server?', a: 'Only one (SQL Server treats NULLs as equal for UNIQUE). A filtered unique index WHERE Col IS NOT NULL allows many.', level: 'Hard' },
    { q: 'Should you validate in C# or in the database?', a: 'Both: validation in UI/API gives friendly messages; constraints guarantee integrity no matter which app or script writes the data.', level: 'Medium' },
  ],
  practice: [
    { task: 'Create a Customers table: CustomerId PK identity, Name NOT NULL, Mobile unique and NOT NULL, Email unique, CreditLimit CHECK between 0 and 500000 default 10000.', hint: 'Combine NOT NULL, UNIQUE, CHECK, DEFAULT', solution: `CREATE TABLE Customers (
    CustomerId INT IDENTITY(1,1) CONSTRAINT PK_Customers PRIMARY KEY,
    Name NVARCHAR(60) NOT NULL,
    Mobile VARCHAR(15) NOT NULL CONSTRAINT UQ_Customers_Mobile UNIQUE,
    Email VARCHAR(100) CONSTRAINT UQ_Customers_Email UNIQUE,
    CreditLimit INT NOT NULL CONSTRAINT DF_Customers_Credit DEFAULT 10000
        CONSTRAINT CK_Customers_Credit CHECK (CreditLimit BETWEEN 0 AND 500000)
);` },
    { task: 'Create an Orders table whose CustomerId references Customers with ON DELETE CASCADE, and Quantity must be at least 1.', hint: 'FOREIGN KEY ... ON DELETE CASCADE', solution: `CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL CONSTRAINT FK_Orders_Customers
        FOREIGN KEY REFERENCES Customers(CustomerId) ON DELETE CASCADE,
    Quantity INT NOT NULL CONSTRAINT CK_Orders_Qty CHECK (Quantity >= 1),
    OrderDate DATE NOT NULL DEFAULT GETDATE()
);` },
    { task: 'Add a CHECK constraint to Employees so that Salary must be <= 500000, then drop it.', hint: 'ALTER TABLE ... ADD CONSTRAINT / DROP CONSTRAINT', solution: `ALTER TABLE Employees ADD CONSTRAINT CK_Employees_MaxSalary CHECK (Salary <= 500000);
ALTER TABLE Employees DROP CONSTRAINT CK_Employees_MaxSalary;` },
    { task: 'Write 4 INSERT statements, each breaking a different constraint of your Customers table, and note the error numbers.', hint: '515, 2627, 547', solution: `INSERT INTO Customers (Name, Mobile) VALUES (NULL, '9000000001');           -- 515
INSERT INTO Customers (Name, Mobile) VALUES ('A', '9000000001');
INSERT INTO Customers (Name, Mobile) VALUES ('B', '9000000001');           -- 2627
INSERT INTO Customers (Name, Mobile, CreditLimit) VALUES ('C', '9000000002', -5);  -- 547` },
  ],
  quiz: [
    { question: 'Which constraint supplies a value when a column is omitted in INSERT?', options: ['CHECK', 'UNIQUE', 'NOT NULL', 'DEFAULT'], answer: 3, explanation: 'DEFAULT fills omitted columns.' },
    { question: 'How many PRIMARY KEY constraints can a table have?', options: ['One', 'Two', 'Unlimited', 'One per column'], answer: 0, explanation: 'Exactly one (it may span several columns).' },
    { question: 'CHECK (Salary > 0) with Salary = -100 raises error:', options: ['515', '547', '2627', '208'], answer: 1, explanation: '547 is raised for CHECK and FOREIGN KEY conflicts.' },
    { question: 'Which allows a single NULL value in SQL Server?', options: ['PRIMARY KEY', 'NOT NULL', 'UNIQUE', 'IDENTITY'], answer: 2, explanation: 'UNIQUE allows one NULL; PRIMARY KEY allows none.' },
    { question: 'ON DELETE CASCADE on Orders.CustomerId means:', options: ['Deleting a customer deletes their orders', 'Orders cannot be deleted', 'Customers cannot be deleted', 'CustomerId becomes NULL'], answer: 0, explanation: 'Child rows are deleted automatically with the parent.' },
  ],
};
