const steps = (db) => [
  'Open SSMS and connect to your SQL Server instance (or open the in-app SSMS Lab)',
  'Click New Query (Ctrl+N) on the toolbar',
  `Paste the complete script below - it creates the ${db} database with tables and sample data`,
  'Press F5 (Execute) and compare every result grid with the expected output. Then try changing the data and re-running the queries',
];

const q1 = `CREATE DATABASE StudentPracticeDB;
GO
USE StudentPracticeDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL UNIQUE,
    Fees INT NOT NULL CHECK (Fees > 0)
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    City NVARCHAR(30) NOT NULL,
    CourseId INT NOT NULL FOREIGN KEY REFERENCES Courses(CourseId),
    Marks INT NOT NULL CHECK (Marks BETWEEN 0 AND 100),
    JoinDate DATE NOT NULL
);
GO
INSERT INTO Courses (CourseName, Fees) VALUES
('.NET Full Stack', 45000), ('Data Analytics', 35000), ('Java', 40000);
INSERT INTO Students (Name, City, CourseId, Marks, JoinDate) VALUES
('Asha', 'Pune', 1, 91, '2026-01-10'), ('Ravi', 'Delhi', 1, 67, '2026-01-12'),
('Meera', 'Pune', 2, 78, '2026-02-01'), ('Kiran', 'Mumbai', 2, 32, '2026-02-03'),
('John', 'Delhi', 1, 85, '2026-03-05'), ('Sara', 'Mumbai', 3, 55, '2026-03-07');
GO
-- Q1: Student report card with course name, grade and result
SELECT s.StudentId, s.Name, c.CourseName, s.Marks,
       CASE WHEN s.Marks >= 85 THEN 'A' WHEN s.Marks >= 60 THEN 'B'
            WHEN s.Marks >= 35 THEN 'C' ELSE 'F' END AS Grade,
       IIF(s.Marks >= 35, 'Pass', 'Fail') AS Result
FROM Students s
JOIN Courses c ON c.CourseId = s.CourseId
ORDER BY s.Marks DESC;
-- Q2: Course-wise count, average and topper marks (courses with no students show 0)
SELECT c.CourseName, COUNT(s.StudentId) AS Students,
       ISNULL(AVG(s.Marks), 0) AS AvgMarks, ISNULL(MAX(s.Marks), 0) AS TopMarks
FROM Courses c
LEFT JOIN Students s ON s.CourseId = c.CourseId
GROUP BY c.CourseName
ORDER BY Students DESC, c.CourseName;
-- Q3: Topper of each course using a window function
WITH Ranked AS (
    SELECT s.Name, c.CourseName, s.Marks,
           RANK() OVER (PARTITION BY s.CourseId ORDER BY s.Marks DESC) AS rk
    FROM Students s JOIN Courses c ON c.CourseId = s.CourseId
)
SELECT CourseName, Name AS Topper, Marks FROM Ranked WHERE rk = 1 ORDER BY CourseName;
-- Q4: Students above the overall average (subquery)
SELECT Name, Marks FROM Students
WHERE Marks > (SELECT AVG(Marks) FROM Students)
ORDER BY Marks DESC;`;
const q2 = `CREATE DATABASE EmployeeSalaryDB;
GO
USE EmployeeSalaryDB;
GO
CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(30) NOT NULL UNIQUE,
    Location NVARCHAR(30) NOT NULL
);
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    DeptId INT NULL FOREIGN KEY REFERENCES Departments(DeptId),
    ManagerId INT NULL,
    Salary INT NOT NULL CHECK (Salary > 0),
    HireDate DATE NOT NULL
);
GO
INSERT INTO Departments (DeptName, Location) VALUES
('IT', 'Pune'), ('HR', 'Mumbai'), ('Sales', 'Delhi'), ('Legal', 'Delhi');
INSERT INTO Employees (Name, DeptId, ManagerId, Salary, HireDate) VALUES
('Anil', 1, NULL, 120000, '2018-04-01'), ('Asha', 1, 1, 85000, '2021-06-15'),
('Ravi', 1, 1, 62000, '2023-01-09'), ('Meera', 2, 1, 48000, '2022-03-21'),
('Kiran', 2, 4, 52000, '2020-11-30'), ('Sara', 3, 1, 71000, '2019-08-19'),
('John', 3, 6, 40000, '2024-02-05'), ('Tina', NULL, NULL, 30000, '2026-05-01');
GO
-- Q1: Second highest salary (classic interview question)
SELECT MAX(Salary) AS SecondHighest
FROM Employees
WHERE Salary < (SELECT MAX(Salary) FROM Employees);
-- Q2: Nth highest (N = 3) with DENSE_RANK
WITH S AS (SELECT Name, Salary, DENSE_RANK() OVER (ORDER BY Salary DESC) AS dr FROM Employees)
SELECT Name, Salary FROM S WHERE dr = 3;
-- Q3: Department-wise headcount and salary bill (includes empty department)
SELECT d.DeptName, d.Location, COUNT(e.EmpId) AS Headcount, ISNULL(SUM(e.Salary), 0) AS SalaryBill
FROM Departments d
LEFT JOIN Employees e ON e.DeptId = d.DeptId
GROUP BY d.DeptName, d.Location
ORDER BY SalaryBill DESC;
-- Q4: Employee with manager name (self join) and years of service at 2026-11-17
SELECT e.Name AS Employee, ISNULL(m.Name, '-') AS Manager, ISNULL(d.DeptName, 'Not assigned') AS Dept,
       DATEDIFF(YEAR, e.HireDate, '2026-11-17') AS Years
FROM Employees e
LEFT JOIN Employees m ON m.EmpId = e.ManagerId
LEFT JOIN Departments d ON d.DeptId = e.DeptId
ORDER BY e.EmpId;
-- Q5: Employees earning more than their department average (correlated subquery)
SELECT e.Name, e.Salary, e.DeptId
FROM Employees e
WHERE e.Salary > (SELECT AVG(x.Salary) FROM Employees x WHERE x.DeptId = e.DeptId)
ORDER BY e.DeptId;`;
const q3 = `CREATE DATABASE ProductCategoryDB;
GO
USE ProductCategoryDB;
GO
CREATE TABLE Categories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(30) NOT NULL UNIQUE
);
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    CategoryId INT NOT NULL FOREIGN KEY REFERENCES Categories(CategoryId),
    Price INT NOT NULL CHECK (Price > 0),
    IsActive BIT NOT NULL DEFAULT 1
);
GO
INSERT INTO Categories (CategoryName) VALUES ('Electronics'), ('Stationery'), ('Furniture'), ('Toys');
INSERT INTO Products (Name, CategoryId, Price) VALUES
('Laptop', 1, 55000), ('Mouse', 1, 500), ('Monitor', 1, 12000),
('Pen', 2, 20), ('Notebook', 2, 60), ('Chair', 3, 4500), ('Desk', 3, 9000);
UPDATE Products SET IsActive = 0 WHERE Name = 'Monitor';
GO
-- Q1: Products with category (active only), costliest first
SELECT p.Name, c.CategoryName, p.Price
FROM Products p JOIN Categories c ON c.CategoryId = p.CategoryId
WHERE p.IsActive = 1
ORDER BY p.Price DESC;
-- Q2: Category summary with price range
SELECT c.CategoryName, COUNT(p.ProductId) AS Items,
       MIN(p.Price) AS Cheapest, MAX(p.Price) AS Costliest
FROM Categories c LEFT JOIN Products p ON p.CategoryId = c.CategoryId
GROUP BY c.CategoryName
ORDER BY c.CategoryName;
-- Q3: Categories without any product
SELECT CategoryName FROM Categories c
WHERE NOT EXISTS (SELECT 1 FROM Products p WHERE p.CategoryId = c.CategoryId);
-- Q4: Most expensive product in each category
SELECT c.CategoryName, p.Name, p.Price
FROM Products p JOIN Categories c ON c.CategoryId = p.CategoryId
WHERE p.Price = (SELECT MAX(x.Price) FROM Products x WHERE x.CategoryId = p.CategoryId)
ORDER BY c.CategoryName;`;
const q4 = `CREATE DATABASE SalesPurchaseDB;
GO
USE SalesPurchaseDB;
GO
CREATE TABLE Items (
    ItemId INT IDENTITY(1,1) PRIMARY KEY,
    ItemName NVARCHAR(50) NOT NULL,
    CostPrice INT NOT NULL,
    SellPrice INT NOT NULL
);
CREATE TABLE Purchases (
    PurchaseId INT IDENTITY(1,1) PRIMARY KEY,
    ItemId INT NOT NULL FOREIGN KEY REFERENCES Items(ItemId),
    Qty INT NOT NULL,
    PurchaseDate DATE NOT NULL
);
CREATE TABLE Sales (
    SaleId INT IDENTITY(1,1) PRIMARY KEY,
    ItemId INT NOT NULL FOREIGN KEY REFERENCES Items(ItemId),
    Qty INT NOT NULL,
    SaleDate DATE NOT NULL
);
GO
INSERT INTO Items (ItemName, CostPrice, SellPrice) VALUES
('Rice 5kg', 300, 360), ('Oil 1L', 150, 175), ('Sugar 1kg', 40, 48);
INSERT INTO Purchases (ItemId, Qty, PurchaseDate) VALUES
(1, 50, '2026-10-01'), (2, 40, '2026-10-01'), (3, 100, '2026-10-02'), (1, 20, '2026-11-01');
INSERT INTO Sales (ItemId, Qty, SaleDate) VALUES
(1, 30, '2026-10-10'), (2, 25, '2026-10-12'), (3, 60, '2026-10-15'),
(1, 25, '2026-11-05'), (3, 30, '2026-11-08');
GO
-- Q1: Month-wise sales revenue
SELECT YEAR(s.SaleDate) AS Yr, MONTH(s.SaleDate) AS Mon,
       SUM(s.Qty * i.SellPrice) AS Revenue
FROM Sales s JOIN Items i ON i.ItemId = s.ItemId
GROUP BY YEAR(s.SaleDate), MONTH(s.SaleDate)
ORDER BY Yr, Mon;
-- Q2: Purchased vs sold vs balance stock per item (aggregate first, then join)
WITH P AS (SELECT ItemId, SUM(Qty) AS Bought FROM Purchases GROUP BY ItemId),
     S AS (SELECT ItemId, SUM(Qty) AS Sold FROM Sales GROUP BY ItemId)
SELECT i.ItemName, ISNULL(P.Bought, 0) AS Bought, ISNULL(S.Sold, 0) AS Sold,
       ISNULL(P.Bought, 0) - ISNULL(S.Sold, 0) AS Balance
FROM Items i
LEFT JOIN P ON P.ItemId = i.ItemId
LEFT JOIN S ON S.ItemId = i.ItemId
ORDER BY i.ItemId;
-- Q3: Profit per item = sold qty * (sell - cost)
SELECT i.ItemName, SUM(s.Qty) AS SoldQty,
       SUM(s.Qty * (i.SellPrice - i.CostPrice)) AS Profit
FROM Sales s JOIN Items i ON i.ItemId = s.ItemId
GROUP BY i.ItemName
ORDER BY Profit DESC;
-- Q4: One combined ledger of all stock movements
SELECT 'IN' AS Movement, i.ItemName, p.Qty, p.PurchaseDate AS MoveDate
FROM Purchases p JOIN Items i ON i.ItemId = p.ItemId
UNION ALL
SELECT 'OUT', i.ItemName, s.Qty, s.SaleDate
FROM Sales s JOIN Items i ON i.ItemId = s.ItemId
ORDER BY MoveDate, Movement, ItemName;`;
const q5 = `CREATE DATABASE CustomerOrdersDB;
GO
USE CustomerOrdersDB;
GO
CREATE TABLE Customers (
    CustomerId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    City NVARCHAR(30) NOT NULL
);
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL FOREIGN KEY REFERENCES Customers(CustomerId),
    OrderDate DATE NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending'
);
CREATE TABLE OrderItems (
    OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL FOREIGN KEY REFERENCES Orders(OrderId),
    Product NVARCHAR(50) NOT NULL,
    Qty INT NOT NULL CHECK (Qty > 0),
    UnitPrice INT NOT NULL
);
GO
INSERT INTO Customers (Name, Email, City) VALUES
('Asha', 'asha@mail.com', 'Pune'), ('Ravi', 'ravi@mail.com', 'Delhi'),
('Meera', 'meera@mail.com', 'Mumbai'), ('Kiran', 'kiran@mail.com', 'Pune');
INSERT INTO Orders (CustomerId, OrderDate, Status) VALUES
(1, '2026-10-01', 'Delivered'), (2, '2026-10-03', 'Delivered'),
(1, '2026-10-20', 'Shipped'), (3, '2026-11-02', 'Cancelled'), (1, '2026-11-10', 'Pending');
INSERT INTO OrderItems (OrderId, Product, Qty, UnitPrice) VALUES
(1, 'Mouse', 2, 500), (1, 'Keyboard', 1, 1500), (2, 'Laptop', 1, 55000),
(3, 'Pen', 10, 20), (4, 'Chair', 1, 4500), (5, 'Monitor', 1, 12000);
GO
-- Q1: Order totals (order header + sum of its lines)
SELECT o.OrderId, c.Name, o.OrderDate, o.Status, SUM(oi.Qty * oi.UnitPrice) AS OrderTotal
FROM Orders o
JOIN Customers c ON c.CustomerId = o.CustomerId
JOIN OrderItems oi ON oi.OrderId = o.OrderId
GROUP BY o.OrderId, c.Name, o.OrderDate, o.Status
ORDER BY o.OrderId;
-- Q2: Customer lifetime value (ignoring cancelled orders), including customers with no orders
SELECT c.Name, COUNT(DISTINCT o.OrderId) AS Orders,
       ISNULL(SUM(oi.Qty * oi.UnitPrice), 0) AS TotalSpent
FROM Customers c
LEFT JOIN Orders o ON o.CustomerId = c.CustomerId AND o.Status <> 'Cancelled'
LEFT JOIN OrderItems oi ON oi.OrderId = o.OrderId
GROUP BY c.Name
ORDER BY TotalSpent DESC, c.Name;
-- Q3: Each customer's latest order (ROW_NUMBER = 1)
WITH Latest AS (
    SELECT o.*, ROW_NUMBER() OVER (PARTITION BY o.CustomerId ORDER BY o.OrderDate DESC) AS rn
    FROM Orders o
)
SELECT c.Name, l.OrderId, l.OrderDate, l.Status
FROM Latest l JOIN Customers c ON c.CustomerId = l.CustomerId
WHERE l.rn = 1
ORDER BY c.Name;
-- Q4: Repeat customers (more than one order)
SELECT c.Name, COUNT(*) AS OrderCount
FROM Orders o JOIN Customers c ON c.CustomerId = o.CustomerId
GROUP BY c.Name
HAVING COUNT(*) > 1;`;
const q6 = `CREATE DATABASE InventoryPracticeDB;
GO
USE InventoryPracticeDB;
GO
CREATE TABLE Warehouses (
    WarehouseId INT IDENTITY(1,1) PRIMARY KEY,
    WarehouseName NVARCHAR(30) NOT NULL
);
CREATE TABLE Stock (
    StockId INT IDENTITY(1,1) PRIMARY KEY,
    WarehouseId INT NOT NULL FOREIGN KEY REFERENCES Warehouses(WarehouseId),
    Product NVARCHAR(50) NOT NULL,
    Qty INT NOT NULL CHECK (Qty >= 0),
    ReorderLevel INT NOT NULL,
    UnitCost INT NOT NULL
);
GO
INSERT INTO Warehouses (WarehouseName) VALUES ('Pune-WH'), ('Delhi-WH');
INSERT INTO Stock (WarehouseId, Product, Qty, ReorderLevel, UnitCost) VALUES
(1, 'Laptop', 12, 5, 50000), (1, 'Mouse', 8, 20, 300), (1, 'Keyboard', 30, 10, 900),
(2, 'Laptop', 2, 5, 50000), (2, 'Mouse', 60, 20, 300), (2, 'Monitor', 4, 4, 9000);
GO
-- Q1: Stock transfer inside a transaction: move 5 laptops Pune -> Delhi
BEGIN TRAN;
UPDATE Stock SET Qty = Qty - 5 WHERE WarehouseId = 1 AND Product = 'Laptop';
UPDATE Stock SET Qty = Qty + 5 WHERE WarehouseId = 2 AND Product = 'Laptop';
COMMIT;
GO
-- Q2: Items at or below reorder level, with suggested order quantity
SELECT w.WarehouseName, s.Product, s.Qty, s.ReorderLevel,
       s.ReorderLevel * 2 - s.Qty AS SuggestedOrder
FROM Stock s JOIN Warehouses w ON w.WarehouseId = s.WarehouseId
WHERE s.Qty <= s.ReorderLevel
ORDER BY w.WarehouseName, s.Product;
-- Q3: Stock value per warehouse
SELECT w.WarehouseName, SUM(s.Qty) AS Units, SUM(s.Qty * s.UnitCost) AS StockValue
FROM Stock s JOIN Warehouses w ON w.WarehouseId = s.WarehouseId
GROUP BY w.WarehouseName
ORDER BY StockValue DESC;
-- Q4: Product-wise total across warehouses with status label
SELECT Product, SUM(Qty) AS TotalQty,
       CASE WHEN SUM(Qty) = 0 THEN 'Out of stock'
            WHEN SUM(Qty) < 10 THEN 'Low'
            ELSE 'OK' END AS Status
FROM Stock
GROUP BY Product
ORDER BY Product;`;

export default {
  id: 'extra-40-sql-practical-programs',
  title: 'SQL Practical Programs: Student, Employee, Product, Sales, Orders, Inventory',
  module: 'Extra: SQL Server',
  extraNo: 40,
  level: 'Intermediate',
  duration: '4 hours',
  summary: `Six complete, runnable mini-projects that combine everything from the SQL Server module: table design with keys and constraints, joins, grouping, subqueries, CASE, CTEs, window functions and transactions. Student results, employee salary and department reports, product/category catalog, sales and purchase stock ledger, customer orders, and multi-warehouse inventory - each with the classic interview and real-job queries.`,
  objectives: [
    'Design related tables with PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK and DEFAULT constraints',
    'Write report queries with JOINs, GROUP BY/HAVING, CASE and subqueries',
    'Solve classic interview questions (second highest salary, Nth highest, topper per group, latest order per customer)',
    'Combine CTEs, window functions and UNION ALL for business reports',
    'Use transactions for multi-step updates such as stock transfers',
  ],
  theory: [
    {
      heading: 'How to approach a SQL practical',
      content: `1. **Understand the entities** - what are the "things" (Student, Course, Order, Product)? Each becomes a table.
2. **Identify relationships** - one course has many students (one-to-many: put CourseId in Students as a FOREIGN KEY); orders and products are many-to-many (use an OrderItems bridge table).
3. **Choose data types and constraints** - INT IDENTITY primary keys, NVARCHAR for names, DATE for dates, DECIMAL for money, CHECK for valid ranges, UNIQUE for emails, DEFAULT for status.
4. **Insert realistic sample data**, including edge cases (a course without students, a customer without orders, a NULL department).
5. **Write the queries step by step** - start with FROM/JOIN, add WHERE, then GROUP BY, then the SELECT list, then ORDER BY. Check row counts after each step.`,
      points: [
        'Logical order of evaluation: FROM/JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> OFFSET/TOP',
        'Use LEFT JOIN when the report must include rows without matches (e.g. departments with 0 employees)',
        'Aggregate BEFORE joining when two child tables would multiply rows (sales and purchases per item)',
      ],
    },
    {
      heading: 'Patterns you will reuse',
      content: `| Problem | Pattern |
|---|---|
| Totals per group | GROUP BY + SUM/COUNT/AVG |
| Include groups with no rows | LEFT JOIN from the parent table + COUNT(child.Id) + ISNULL |
| Filter on an aggregate | HAVING COUNT(*) > 1 |
| Above average | WHERE x > (SELECT AVG(x) FROM ...) |
| Above own group's average | correlated subquery on the group column |
| Second highest | MAX(x) WHERE x < (SELECT MAX(x) ...) or DENSE_RANK = 2 |
| Top / latest per group | ROW_NUMBER() OVER (PARTITION BY g ORDER BY ...) = 1 in a CTE |
| Missing related rows | NOT EXISTS / LEFT JOIN ... IS NULL |
| Labels and buckets | CASE WHEN ... |
| Ledger of different events | UNION ALL with a type column |
| Several dependent updates | BEGIN TRAN ... COMMIT (ROLLBACK on error) |`,
    },
    {
      heading: 'Naming and design conventions',
      content: `- Tables: plural PascalCase (Students, OrderItems); columns: PascalCase (StudentId, OrderDate).
- Primary key: TableNameId (or Id) INT IDENTITY(1,1).
- Foreign key column has the same name as the referenced key (CourseId -> Courses.CourseId).
- Name constraints and indexes in real projects: PK_Students, FK_Students_Courses, CK_Students_Marks, IX_Orders_CustomerId.
- Money: DECIMAL(10,2), never FLOAT. Dates: DATE when the time is not needed.
- Index every foreign key column that is used in joins.
- These designs map directly to EF Core entities and navigation properties in the ASP.NET Core modules.`,
    },
    {
      heading: 'Interview tips for SQL practicals',
      content: `- Say the approach aloud before writing: "I'll join Orders to Customers, group by customer, and use HAVING".
- Ask about ties ("If two employees share the highest salary, should both appear?") - choose ROW_NUMBER, RANK or DENSE_RANK accordingly.
- Ask about NULLs (employees without a department) and decide INNER vs LEFT JOIN.
- Always add ORDER BY when the output order matters - tables have no guaranteed order.
- Know at least two ways to solve common problems (subquery and window function).
- Lab note: in the in-app SSMS Lab, AVG of an INT column prints a decimal (81.0); real SQL Server returns an integer (81) because AVG keeps the INT type - use AVG(CAST(x AS DECIMAL(10,2))) when you want decimals in SQL Server.`,
    },
  ],
  examples: [
    {
      title: 'Program 1: Student result management',
      scenario: 'A training institute stores courses and students. Produce a report card with grades, a course-wise summary (including empty courses), the topper of each course and the students above the overall average.',
      steps: steps('StudentPracticeDB'),
      code: q1,
      tsql: q1,
      result: `+-----------+-------+-----------------+-------+-------+--------+
| StudentId | Name  | CourseName      | Marks | Grade | Result |
+-----------+-------+-----------------+-------+-------+--------+
| 1         | Asha  | .NET Full Stack | 91    | A     | Pass   |
| 5         | John  | .NET Full Stack | 85    | A     | Pass   |
| 3         | Meera | Data Analytics  | 78    | B     | Pass   |
| 2         | Ravi  | .NET Full Stack | 67    | B     | Pass   |
| 6         | Sara  | Java            | 55    | C     | Pass   |
| 4         | Kiran | Data Analytics  | 32    | F     | Fail   |
+-----------+-------+-----------------+-------+-------+--------+
6 row(s) returned

+-----------------+----------+----------+----------+
| CourseName      | Students | AvgMarks | TopMarks |
+-----------------+----------+----------+----------+
| .NET Full Stack | 3        | 81.0     | 91       |
| Data Analytics  | 2        | 55.0     | 78       |
| Java            | 1        | 55.0     | 55       |
+-----------------+----------+----------+----------+
3 row(s) returned

+-----------------+--------+-------+
| CourseName      | Topper | Marks |
+-----------------+--------+-------+
| .NET Full Stack | Asha   | 91    |
| Data Analytics  | Meera  | 78    |
| Java            | Sara   | 55    |
+-----------------+--------+-------+
3 row(s) returned

+-------+-------+
| Name  | Marks |
+-------+-------+
| Asha  | 91    |
| John  | 85    |
| Meera | 78    |
+-------+-------+
3 row(s) returned`,
      explanation: `Q1 joins Students to Courses and uses two CASE expressions for grade and result. Q2 starts from Courses with LEFT JOIN so a course with no students would still appear with 0; COUNT(s.StudentId) counts only matched students. Q3 ranks students inside each course with RANK() and keeps rank 1 (ties would all be shown). Q4 compares each mark with the overall average (408 / 6 = 68). Lab difference: AvgMarks shows 81.0 / 55.0 here; SQL Server shows 81 / 55 (integer AVG).`,
    },
    {
      title: 'Program 2: Employee salary and department reports',
      scenario: 'HR needs the second and third highest salaries, the department-wise salary bill including empty departments, each employee with manager and years of service, and employees earning more than their department average.',
      steps: steps('EmployeeSalaryDB'),
      code: q2,
      tsql: q2,
      result: `+---------------+
| SecondHighest |
+---------------+
| 85000         |
+---------------+
1 row(s) returned

+------+--------+
| Name | Salary |
+------+--------+
| Sara | 71000  |
+------+--------+
1 row(s) returned

+----------+----------+-----------+------------+
| DeptName | Location | Headcount | SalaryBill |
+----------+----------+-----------+------------+
| IT       | Pune     | 3         | 267000     |
| Sales    | Delhi    | 2         | 111000     |
| HR       | Mumbai   | 2         | 100000     |
| Legal    | Delhi    | 0         | 0          |
+----------+----------+-----------+------------+
4 row(s) returned

+----------+---------+--------------+-------+
| Employee | Manager | Dept         | Years |
+----------+---------+--------------+-------+
| Anil     | -       | IT           | 8     |
| Asha     | Anil    | IT           | 5     |
| Ravi     | Anil    | IT           | 3     |
| Meera    | Anil    | HR           | 4     |
| Kiran    | Meera   | HR           | 6     |
| Sara     | Anil    | Sales        | 7     |
| John     | Sara    | Sales        | 2     |
| Tina     | -       | Not assigned | 0     |
+----------+---------+--------------+-------+
8 row(s) returned

+-------+--------+--------+
| Name  | Salary | DeptId |
+-------+--------+--------+
| Anil  | 120000 | 1      |
| Kiran | 52000  | 2      |
| Sara  | 71000  | 3      |
+-------+--------+--------+
3 row(s) returned`,
      explanation: `Q1 is the classic second-highest query: the highest salary below the maximum (120000) is 85000. Q2 uses DENSE_RANK so equal salaries would share a rank. Q3 starts from Departments with LEFT JOIN, so Legal appears with 0 (and Tina without a department is not counted anywhere). Q4 self-joins Employees as m to get the manager name; DATEDIFF(YEAR, ...) counts year boundaries crossed. Q5's correlated subquery calculates the average of the employee's own department (Tina has no department, so her subquery returns NULL and she is excluded).`,
    },
    {
      title: 'Program 3: Product and category catalog',
      scenario: 'An e-commerce catalog needs active products with their category, a category summary with price range, categories that have no products, and the costliest product in each category.',
      steps: steps('ProductCategoryDB'),
      code: q3,
      tsql: q3,
      result: `+----------+--------------+-------+
| Name     | CategoryName | Price |
+----------+--------------+-------+
| Laptop   | Electronics  | 55000 |
| Desk     | Furniture    | 9000  |
| Chair    | Furniture    | 4500  |
| Mouse    | Electronics  | 500   |
| Notebook | Stationery   | 60    |
| Pen      | Stationery   | 20    |
+----------+--------------+-------+
6 row(s) returned

+--------------+-------+----------+-----------+
| CategoryName | Items | Cheapest | Costliest |
+--------------+-------+----------+-----------+
| Electronics  | 3     | 500      | 55000     |
| Furniture    | 2     | 4500     | 9000      |
| Stationery   | 2     | 20       | 60        |
| Toys         | 0     | NULL     | NULL      |
+--------------+-------+----------+-----------+
4 row(s) returned

+--------------+
| CategoryName |
+--------------+
| Toys         |
+--------------+
1 row(s) returned

+--------------+----------+-------+
| CategoryName | Name     | Price |
+--------------+----------+-------+
| Electronics  | Laptop   | 55000 |
| Furniture    | Desk     | 9000  |
| Stationery   | Notebook | 60    |
+--------------+----------+-------+
3 row(s) returned`,
      explanation: `IsActive is a BIT with DEFAULT 1, and the Monitor is deactivated by an UPDATE, so Q1 lists 6 products. Q2 uses LEFT JOIN from Categories: Toys has 0 items and NULL min/max (inactive products are still counted here because Q2 does not filter on IsActive). Q3 finds Toys with NOT EXISTS. Q4 compares each product's price with the maximum of its own category through a correlated subquery.`,
    },
    {
      title: 'Program 4: Sales and purchase stock ledger',
      scenario: 'A grocery wholesaler records purchases and sales. Report monthly revenue, purchased vs sold vs balance quantity per item, profit per item, and one combined IN/OUT ledger.',
      steps: steps('SalesPurchaseDB'),
      code: q4,
      tsql: q4,
      result: `+------+-----+---------+
| Yr   | Mon | Revenue |
+------+-----+---------+
| 2026 | 10  | 18055   |
| 2026 | 11  | 10440   |
+------+-----+---------+
2 row(s) returned

+-----------+--------+------+---------+
| ItemName  | Bought | Sold | Balance |
+-----------+--------+------+---------+
| Rice 5kg  | 70     | 55   | 15      |
| Oil 1L    | 40     | 25   | 15      |
| Sugar 1kg | 100    | 90   | 10      |
+-----------+--------+------+---------+
3 row(s) returned

+-----------+---------+--------+
| ItemName  | SoldQty | Profit |
+-----------+---------+--------+
| Rice 5kg  | 55      | 3300   |
| Sugar 1kg | 90      | 720    |
| Oil 1L    | 25      | 625    |
+-----------+---------+--------+
3 row(s) returned

+----------+-----------+-----+------------+
| Movement | ItemName  | Qty | MoveDate   |
+----------+-----------+-----+------------+
| IN       | Oil 1L    | 40  | 2026-10-01 |
| IN       | Rice 5kg  | 50  | 2026-10-01 |
| IN       | Sugar 1kg | 100 | 2026-10-02 |
| OUT      | Rice 5kg  | 30  | 2026-10-10 |
| OUT      | Oil 1L    | 25  | 2026-10-12 |
| OUT      | Sugar 1kg | 60  | 2026-10-15 |
| IN       | Rice 5kg  | 20  | 2026-11-01 |
| OUT      | Rice 5kg  | 25  | 2026-11-05 |
| OUT      | Sugar 1kg | 30  | 2026-11-08 |
+----------+-----------+-----+------------+
9 row(s) returned`,
      explanation: `Q1 groups by YEAR and MONTH of the sale date: October = 30 x 360 + 25 x 175 + 60 x 48 = 18055. Q2 aggregates purchases and sales in separate CTEs BEFORE joining - joining the raw Purchases and Sales tables together would multiply rows and double-count. Q3 profit = quantity x (sell price - cost price), e.g. rice 55 x 60 = 3300. Q4 stacks purchases (IN) and sales (OUT) with UNION ALL and sorts the combined rows by date - a typical stock ledger.`,
    },
    {
      title: 'Program 5: Customer orders',
      scenario: 'An online shop has customers, order headers and order lines. Show order totals, each customer\'s lifetime value (excluding cancelled orders), the latest order per customer and repeat customers.',
      steps: steps('CustomerOrdersDB'),
      code: q5,
      tsql: q5,
      result: `+---------+-------+------------+-----------+------------+
| OrderId | Name  | OrderDate  | Status    | OrderTotal |
+---------+-------+------------+-----------+------------+
| 1       | Asha  | 2026-10-01 | Delivered | 2500       |
| 2       | Ravi  | 2026-10-03 | Delivered | 55000      |
| 3       | Asha  | 2026-10-20 | Shipped   | 200        |
| 4       | Meera | 2026-11-02 | Cancelled | 4500       |
| 5       | Asha  | 2026-11-10 | Pending   | 12000      |
+---------+-------+------------+-----------+------------+
5 row(s) returned

+-------+--------+------------+
| Name  | Orders | TotalSpent |
+-------+--------+------------+
| Ravi  | 1      | 55000      |
| Asha  | 3      | 14700      |
| Kiran | 0      | 0          |
| Meera | 0      | 0          |
+-------+--------+------------+
4 row(s) returned

+-------+---------+------------+-----------+
| Name  | OrderId | OrderDate  | Status    |
+-------+---------+------------+-----------+
| Asha  | 5       | 2026-11-10 | Pending   |
| Meera | 4       | 2026-11-02 | Cancelled |
| Ravi  | 2       | 2026-10-03 | Delivered |
+-------+---------+------------+-----------+
3 row(s) returned

+------+------------+
| Name | OrderCount |
+------+------------+
| Asha | 3          |
+------+------------+
1 row(s) returned`,
      explanation: `Q1 joins the header (Orders) with its lines (OrderItems) and sums Qty x UnitPrice per order. In Q2 the Status condition is placed in the LEFT JOIN's ON clause - putting it in WHERE would turn the LEFT JOIN into an INNER JOIN and remove customers without orders. COUNT(DISTINCT o.OrderId) avoids counting an order once per line (Asha's first order has two lines). Q3 numbers each customer's orders newest first and keeps rn = 1. Q4 uses HAVING to keep customers with more than one order.`,
    },
    {
      title: 'Program 6: Multi-warehouse inventory',
      scenario: 'A company keeps stock in Pune and Delhi warehouses. Transfer 5 laptops safely in a transaction, list items at or below reorder level, value the stock per warehouse and show product totals with a status label.',
      steps: steps('InventoryPracticeDB'),
      code: q6,
      tsql: q6,
      result: `+---------------+---------+-----+--------------+----------------+
| WarehouseName | Product | Qty | ReorderLevel | SuggestedOrder |
+---------------+---------+-----+--------------+----------------+
| Delhi-WH      | Monitor | 4   | 4            | 4              |
| Pune-WH       | Mouse   | 8   | 20           | 32             |
+---------------+---------+-----+--------------+----------------+
2 row(s) returned

+---------------+-------+------------+
| WarehouseName | Units | StockValue |
+---------------+-------+------------+
| Delhi-WH      | 71    | 404000     |
| Pune-WH       | 45    | 379400     |
+---------------+-------+------------+
2 row(s) returned

+----------+----------+--------+
| Product  | TotalQty | Status |
+----------+----------+--------+
| Keyboard | 30       | OK     |
| Laptop   | 14       | OK     |
| Monitor  | 4        | Low    |
| Mouse    | 68       | OK     |
+----------+----------+--------+
4 row(s) returned`,
      explanation: `The transfer has two UPDATEs that must succeed or fail together, so they are wrapped in BEGIN TRAN ... COMMIT (in a real procedure use TRY...CATCH with ROLLBACK). After it Pune has 7 laptops and Delhi 7. Q2 lists Delhi's monitor (4 <= 4) and Pune's mouse (8 <= 20) with a suggested top-up quantity. Q3 multiplies quantity by unit cost per warehouse (Delhi: 7 x 50000 + 60 x 300 + 4 x 9000 = 404000). Q4 sums each product across warehouses and labels totals below 10 as Low.`,
    },
  ],
  interview: [
    { q: 'Write a query to find the second highest salary.', a: 'SELECT MAX(Salary) FROM Employees WHERE Salary < (SELECT MAX(Salary) FROM Employees); or use DENSE_RANK() OVER (ORDER BY Salary DESC) = 2 in a CTE.', level: 'Easy' },
    { q: 'How do you find duplicate emails in a Customers table?', a: 'SELECT Email, COUNT(*) FROM Customers GROUP BY Email HAVING COUNT(*) > 1;', level: 'Easy' },
    { q: 'How do you show departments that have no employees?', a: 'SELECT d.DeptName FROM Departments d LEFT JOIN Employees e ON e.DeptId = d.DeptId WHERE e.EmpId IS NULL; or WHERE NOT EXISTS (SELECT 1 FROM Employees e WHERE e.DeptId = d.DeptId).', level: 'Easy' },
    { q: 'Find the employee(s) with the highest salary in each department.', a: 'Use RANK() OVER (PARTITION BY DeptId ORDER BY Salary DESC) in a CTE and keep rank 1, or a correlated subquery WHERE Salary = (SELECT MAX(Salary) FROM Employees x WHERE x.DeptId = e.DeptId).', level: 'Medium' },
    { q: 'Why did my LEFT JOIN stop returning customers without orders after adding WHERE o.Status <> \'Cancelled\'?', a: 'For unmatched customers o.Status is NULL, and NULL <> \'Cancelled\' is UNKNOWN, so WHERE removes them. Put the condition in the ON clause of the LEFT JOIN instead.', level: 'Hard' },
    { q: 'Why aggregate sales and purchases separately before joining them to Items?', a: 'Joining two one-to-many child tables at once creates a row for every purchase-sale combination, multiplying the sums. Aggregating each first gives one row per item per table.', level: 'Hard' },
    { q: 'How do you get each customer\'s latest order?', a: 'ROW_NUMBER() OVER (PARTITION BY CustomerId ORDER BY OrderDate DESC) AS rn in a CTE, then WHERE rn = 1.', level: 'Medium' },
    { q: 'Why is a stock transfer done in a transaction?', a: 'The decrease in one warehouse and the increase in another must be atomic. If the second update fails, ROLLBACK undoes the first so stock is never lost or duplicated.', level: 'Medium' },
    { q: 'Difference between WHERE and HAVING?', a: 'WHERE filters rows before grouping; HAVING filters groups after aggregation and can use aggregate functions.', level: 'Easy' },
    { q: 'Why use COUNT(column) instead of COUNT(*) after a LEFT JOIN?', a: 'COUNT(*) counts the row produced for an unmatched parent (giving 1); COUNT(child.Id) ignores NULLs and correctly returns 0.', level: 'Medium' },
    { q: 'Write a query for the month-wise total sales.', a: 'SELECT YEAR(SaleDate) AS Yr, MONTH(SaleDate) AS Mon, SUM(Amount) FROM Sales GROUP BY YEAR(SaleDate), MONTH(SaleDate) ORDER BY Yr, Mon;', level: 'Easy' },
    { q: 'How do you find customers who ordered in October but not in November?', a: 'Use EXISTS for October and NOT EXISTS for November on the Orders table correlated by CustomerId (or EXCEPT between two SELECTs of CustomerId).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Student program: list students who joined in February 2026 with their course name and fees.',
      hint: 'JOIN Courses; use a date range on JoinDate.',
      solution: `SELECT s.Name, c.CourseName, c.Fees, s.JoinDate
FROM Students s
JOIN Courses c ON c.CourseId = s.CourseId
WHERE s.JoinDate >= '2026-02-01' AND s.JoinDate < '2026-03-01'
ORDER BY s.JoinDate;
-- Meera (Data Analytics), Kiran (Data Analytics)`,
    },
    {
      task: 'Employee program: give a 10 percent raise to everyone in IT earning less than 70000 inside a transaction, show the result, then roll it back.',
      hint: 'BEGIN TRAN; UPDATE ... WHERE DeptId = 1 AND Salary < 70000; SELECT; ROLLBACK;',
      solution: `BEGIN TRAN;
UPDATE Employees SET Salary = Salary * 110 / 100 WHERE DeptId = 1 AND Salary < 70000;
SELECT Name, Salary FROM Employees WHERE DeptId = 1 ORDER BY EmpId;   -- Ravi 68200
ROLLBACK;
SELECT Name, Salary FROM Employees WHERE DeptId = 1 ORDER BY EmpId;   -- Ravi back to 62000`,
    },
    {
      task: 'Product program: show each category with a comma-separated list of its product names (SQL Server 2017+).',
      hint: 'STRING_AGG(p.Name, \', \') WITHIN GROUP (ORDER BY p.Name) with GROUP BY. (Run in SSMS - STRING_AGG is not in the lab function list.)',
      solution: `SELECT c.CategoryName,
       STRING_AGG(p.Name, ', ') WITHIN GROUP (ORDER BY p.Name) AS Products
FROM Categories c
JOIN Products p ON p.CategoryId = c.CategoryId
GROUP BY c.CategoryName;
-- Electronics: Laptop, Monitor, Mouse ...`,
    },
    {
      task: 'Customer orders program: find the best-selling product by total quantity and the customer who spent the most.',
      hint: 'TOP 1 with ORDER BY SUM(...) DESC for each question.',
      solution: `SELECT TOP 1 Product, SUM(Qty) AS TotalQty
FROM OrderItems GROUP BY Product ORDER BY TotalQty DESC;           -- Pen 10

SELECT TOP 1 c.Name, SUM(oi.Qty * oi.UnitPrice) AS Spent
FROM Customers c
JOIN Orders o ON o.CustomerId = c.CustomerId
JOIN OrderItems oi ON oi.OrderId = o.OrderId
GROUP BY c.Name ORDER BY Spent DESC;                               -- Ravi 55000`,
    },
    {
      task: 'Inventory program: write the reverse transfer (move 3 laptops from Delhi back to Pune) but only if Delhi has at least 3; otherwise change nothing.',
      hint: 'Put the stock check in the UPDATE WHERE clause and make the second UPDATE depend on the first succeeding; in SSMS check @@ROWCOUNT and ROLLBACK.',
      solution: `BEGIN TRAN;
UPDATE Stock SET Qty = Qty - 3 WHERE WarehouseId = 2 AND Product = 'Laptop' AND Qty >= 3;
-- In SSMS:  IF @@ROWCOUNT = 0 BEGIN ROLLBACK; RETURN; END
UPDATE Stock SET Qty = Qty + 3 WHERE WarehouseId = 1 AND Product = 'Laptop';
COMMIT;
SELECT WarehouseId, Qty FROM Stock WHERE Product = 'Laptop';   -- Pune 10, Delhi 4`,
    },
  ],
  quiz: [
    {
      question: 'Which join keeps departments that have no employees?',
      options: ['Departments INNER JOIN Employees', 'Departments LEFT JOIN Employees', 'Employees LEFT JOIN Departments', 'CROSS JOIN'],
      answer: 1,
      explanation: 'LEFT JOIN keeps every row of the left table (Departments) even without matches.',
    },
    {
      question: 'Salaries: 120000, 85000, 85000, 71000. What does MAX(Salary) WHERE Salary < (SELECT MAX(Salary) ...) return?',
      options: ['120000', '71000', '85000', 'NULL'],
      answer: 2,
      explanation: 'The highest value below 120000 is 85000.',
    },
    {
      question: 'Where should a filter on the right table of a LEFT JOIN go if unmatched left rows must stay?',
      options: ['In the ON clause', 'In WHERE', 'In HAVING', 'In ORDER BY'],
      answer: 0,
      explanation: 'A WHERE filter on the right table removes the NULL rows created for unmatched left rows.',
    },
    {
      question: 'Which function picks exactly one latest order per customer even if two orders share the same date?',
      options: ['RANK()', 'DENSE_RANK()', 'NTILE(1)', 'ROW_NUMBER()'],
      answer: 3,
      explanation: 'ROW_NUMBER always gives unique numbers, so rn = 1 returns one row per partition.',
    },
    {
      question: 'Why are the two stock UPDATEs of a transfer wrapped in BEGIN TRAN ... COMMIT?',
      options: ['To make them run faster', 'So both succeed or both are undone', 'Because UPDATE requires a transaction', 'To lock the whole database'],
      answer: 1,
      explanation: 'Transactions make multi-step changes atomic.',
    },
  ],
};
