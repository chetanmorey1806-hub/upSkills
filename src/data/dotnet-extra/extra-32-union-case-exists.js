const steps = (db) => [
  'Open SSMS and connect to your SQL Server instance (or open the in-app SSMS Lab)',
  'Click New Query (Ctrl+N) on the toolbar',
  'Paste the complete script below',
  `Press F5 (Execute). The script creates the ${db} database; read the Results and Messages tabs`,
];

const q1 = `CREATE DATABASE ShopUnionDB;
GO
USE ShopUnionDB;
GO
CREATE TABLE OnlineCustomers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    City NVARCHAR(50) NOT NULL
);
CREATE TABLE StoreCustomers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    City NVARCHAR(50) NOT NULL
);
GO
INSERT INTO OnlineCustomers (Name, City) VALUES
('Asha', 'Pune'), ('Ravi', 'Delhi'), ('Meera', 'Mumbai');
INSERT INTO StoreCustomers (Name, City) VALUES
('Ravi', 'Delhi'), ('Kiran', 'Pune'), ('Asha', 'Pune'), ('John', 'Chennai');
GO
-- UNION removes duplicate rows
SELECT Name, City FROM OnlineCustomers
UNION
SELECT Name, City FROM StoreCustomers
ORDER BY Name;
-- UNION ALL keeps every row and adds a label column
SELECT Name, City, 'Online' AS Source FROM OnlineCustomers
UNION ALL
SELECT Name, City, 'Store' AS Source FROM StoreCustomers
ORDER BY Name, Source;
-- Count rows of each version
SELECT COUNT(*) AS UnionRows FROM (
    SELECT Name, City FROM OnlineCustomers
    UNION
    SELECT Name, City FROM StoreCustomers
) AS u;
SELECT COUNT(*) AS UnionAllRows FROM (
    SELECT Name, City FROM OnlineCustomers
    UNION ALL
    SELECT Name, City FROM StoreCustomers
) AS ua;`;
const q2 = `CREATE DATABASE SchoolCaseDB;
GO
USE SchoolCaseDB;
GO
CREATE TABLE Students (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Gender CHAR(1) NOT NULL,
    Marks INT NOT NULL
);
GO
INSERT INTO Students (Name, Gender, Marks) VALUES
('Asha', 'F', 92), ('Ravi', 'M', 74), ('Meera', 'F', 58),
('Kiran', 'M', 33), ('John', 'M', 81), ('Sara', 'F', 45);
GO
-- Simple CASE (compare one value) and searched CASE (conditions)
SELECT Name,
       CASE Gender WHEN 'F' THEN 'Female' WHEN 'M' THEN 'Male' ELSE 'Other' END AS GenderText,
       Marks,
       CASE
           WHEN Marks >= 90 THEN 'A+'
           WHEN Marks >= 75 THEN 'A'
           WHEN Marks >= 60 THEN 'B'
           WHEN Marks >= 35 THEN 'C'
           ELSE 'Fail'
       END AS Grade
FROM Students
ORDER BY Marks DESC;
-- CASE inside aggregates: pivot-style counting
SELECT COUNT(*) AS Total,
       SUM(CASE WHEN Marks >= 35 THEN 1 ELSE 0 END) AS Passed,
       SUM(CASE WHEN Marks < 35 THEN 1 ELSE 0 END) AS Failed,
       SUM(CASE WHEN Gender = 'F' THEN 1 ELSE 0 END) AS Girls
FROM Students;
-- CASE in UPDATE: grace marks only for students between 30 and 34
UPDATE Students
SET Marks = CASE WHEN Marks BETWEEN 30 AND 34 THEN 35 ELSE Marks END;
-- CASE in ORDER BY: show failed students first, then by name
SELECT Name, Marks, IIF(Marks >= 35, 'Pass', 'Fail') AS Result
FROM Students
ORDER BY CASE WHEN Marks < 50 THEN 0 ELSE 1 END, Name;`;
const q3 = `CREATE DATABASE OrdersExistsDB;
GO
USE OrdersExistsDB;
GO
CREATE TABLE Customers (
    CustomerId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    City NVARCHAR(50) NOT NULL
);
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL FOREIGN KEY REFERENCES Customers(CustomerId),
    Amount DECIMAL(10,2) NOT NULL,
    OrderDate DATE NOT NULL
);
GO
INSERT INTO Customers (Name, City) VALUES
('Asha', 'Pune'), ('Ravi', 'Delhi'), ('Meera', 'Mumbai'), ('Kiran', 'Pune');
INSERT INTO Orders (CustomerId, Amount, OrderDate) VALUES
(1, 2500.00, '2026-10-01'), (1, 800.00, '2026-10-15'),
(2, 12000.00, '2026-10-20'), (4, 450.50, '2026-11-02');
GO
-- Customers who placed at least one order
SELECT c.CustomerId, c.Name
FROM Customers c
WHERE EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerId = c.CustomerId)
ORDER BY c.CustomerId;
-- Customers who never ordered
SELECT c.CustomerId, c.Name, c.City
FROM Customers c
WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerId = c.CustomerId);
-- Customers with a big order (above 10000)
SELECT c.Name
FROM Customers c
WHERE EXISTS (SELECT 1 FROM Orders o
              WHERE o.CustomerId = c.CustomerId AND o.Amount > 10000);
-- Same "never ordered" result with LEFT JOIN ... IS NULL
SELECT c.Name
FROM Customers c
LEFT JOIN Orders o ON o.CustomerId = c.CustomerId
WHERE o.OrderId IS NULL;`;

export default {
  id: 'extra-32-union-case-exists',
  title: 'UNION / UNION ALL, CASE, EXISTS and NOT EXISTS',
  module: 'Extra: SQL Server',
  extraNo: 32,
  level: 'Intermediate',
  duration: '2 hours',
  summary: `Combine the results of several queries with UNION and UNION ALL, add if-else logic inside queries with CASE (and IIF), and test whether related rows exist with EXISTS and NOT EXISTS. These are used every day for reports (pass/fail, grade, status labels), merging data from similar tables, and finding customers without orders or products never sold.`,
  objectives: [
    'Combine result sets with UNION, UNION ALL and know the rules (same column count, compatible types)',
    'Write simple and searched CASE expressions in SELECT, ORDER BY, UPDATE and aggregates',
    'Use EXISTS and NOT EXISTS with correlated subqueries',
    'Compare NOT EXISTS, NOT IN and LEFT JOIN ... IS NULL, including the NULL trap',
  ],
  theory: [
    {
      heading: 'UNION and UNION ALL',
      content: `**UNION** stacks the rows of two (or more) SELECT statements **vertically** into one result.
- **UNION** removes duplicate rows (it has to sort/hash the data - slower).
- **UNION ALL** keeps every row, including duplicates (faster - prefer it when duplicates are impossible or wanted).

Rules:
- Every SELECT must have the **same number of columns** with **compatible data types**, in the same order.
- Column names come from the **first** SELECT.
- Only **one ORDER BY**, at the very end, applies to the whole result.

Related set operators: **INTERSECT** (rows in both) and **EXCEPT** (rows in the first but not the second).

Analogy: two class registers (online batch and classroom batch) photocopied onto one sheet. UNION crosses out students who appear twice; UNION ALL keeps both lines.`,
      syntax: `SELECT Name, City FROM OnlineCustomers
UNION            -- or UNION ALL
SELECT Name, City FROM StoreCustomers
ORDER BY Name;`,
      tip: `JOIN combines tables side by side (more columns); UNION combines results one below the other (more rows).`,
    },
    {
      heading: 'CASE expression',
      content: `CASE is SQL's if-else. It returns a value, so it can be used anywhere an expression is allowed: SELECT list, WHERE, ORDER BY, GROUP BY, UPDATE SET, inside SUM/COUNT.

**Simple CASE** compares one expression with values:
CASE Gender WHEN 'F' THEN 'Female' WHEN 'M' THEN 'Male' ELSE 'Other' END

**Searched CASE** evaluates conditions top to bottom and returns the first true branch:
CASE WHEN Marks >= 90 THEN 'A+' WHEN Marks >= 75 THEN 'A' ELSE 'B' END

Without ELSE, unmatched rows get NULL. **IIF(condition, trueValue, falseValue)** is a short form for a two-way CASE.`,
      syntax: `SELECT Name,
       CASE WHEN Marks >= 35 THEN 'Pass' ELSE 'Fail' END AS Result,
       IIF(Marks >= 90, 'Topper', '') AS Badge
FROM Students;

-- conditional counting (pivot style)
SELECT SUM(CASE WHEN Marks >= 35 THEN 1 ELSE 0 END) AS Passed FROM Students;`,
    },
    {
      heading: 'EXISTS and NOT EXISTS',
      content: `**EXISTS (subquery)** is true if the subquery returns **at least one row**. It does not care about the selected columns, so SELECT 1 is the convention. SQL Server stops searching as soon as it finds the first matching row - efficient.

Usually the subquery is **correlated**: it refers to the outer row (o.CustomerId = c.CustomerId), so it is evaluated for each customer.

**NOT EXISTS** is true when the subquery returns **no rows** - perfect for "customers who never ordered", "products never sold", "students not enrolled".

In T-SQL scripts EXISTS is also used in IF statements: IF EXISTS (SELECT 1 FROM Orders WHERE ...) PRINT '...'; and in IF NOT EXISTS (...) INSERT ... to avoid duplicates. (IF blocks run only in real SQL Server, not in the in-app lab.)`,
      syntax: `SELECT c.Name
FROM Customers c
WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerId = c.CustomerId);

IF NOT EXISTS (SELECT 1 FROM Categories WHERE Name = 'Toys')
    INSERT INTO Categories (Name) VALUES ('Toys');`,
    },
    {
      heading: 'NOT EXISTS vs NOT IN vs LEFT JOIN ... IS NULL',
      content: `All three can find "rows without a match", but they behave differently:

| Technique | Notes |
|---|---|
| NOT EXISTS | Safe with NULLs, usually the best plan (anti semi join). Recommended. |
| LEFT JOIN ... WHERE right.Id IS NULL | Same result, readable, may be slightly slower on big data. |
| NOT IN (subquery) | **Trap**: if the subquery returns even one NULL, NOT IN returns **no rows at all**, because x <> NULL is UNKNOWN. |

Similarly, **IN** and **EXISTS** usually produce the same plan for positive checks; use whichever reads better.`,
      syntax: `-- Dangerous if Orders.CustomerId can be NULL:
SELECT Name FROM Customers WHERE CustomerId NOT IN (SELECT CustomerId FROM Orders);
-- Safe:
SELECT Name FROM Customers c
WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerId = c.CustomerId);`,
    },
  ],
  examples: [
    {
      title: 'UNION vs UNION ALL: merging online and store customers',
      scenario: 'A shop keeps online and in-store customers in two tables. Build a single unique customer list, a full list with the source of each row, and compare the row counts.',
      steps: steps('ShopUnionDB'),
      code: q1,
      tsql: q1,
      result: `+-------+---------+
| Name  | City    |
+-------+---------+
| Asha  | Pune    |
| John  | Chennai |
| Kiran | Pune    |
| Meera | Mumbai  |
| Ravi  | Delhi   |
+-------+---------+
5 row(s) returned

+-------+---------+--------+
| Name  | City    | Source |
+-------+---------+--------+
| Asha  | Pune    | Online |
| Asha  | Pune    | Store  |
| John  | Chennai | Store  |
| Kiran | Pune    | Store  |
| Meera | Mumbai  | Online |
| Ravi  | Delhi   | Online |
| Ravi  | Delhi   | Store  |
+-------+---------+--------+
7 row(s) returned

+-----------+
| UnionRows |
+-----------+
| 5         |
+-----------+
1 row(s) returned

+--------------+
| UnionAllRows |
+--------------+
| 7            |
+--------------+
1 row(s) returned`,
      explanation: `Asha (Pune) and Ravi (Delhi) appear in both tables. UNION removes the duplicates (5 rows); UNION ALL keeps all 3 + 4 = 7 rows. Adding a literal column (Source) makes the duplicate rows different, which is a common way to label where each row came from. ORDER BY is written once at the end and sorts the combined result.`,
    },
    {
      title: 'CASE for grades, counts, updates and custom sorting',
      scenario: 'A school needs a grade report, pass/fail counts in one row, grace marks for students who just missed passing, and a list with weak students on top.',
      steps: steps('SchoolCaseDB'),
      code: q2,
      tsql: q2,
      result: `+-------+------------+-------+-------+
| Name  | GenderText | Marks | Grade |
+-------+------------+-------+-------+
| Asha  | Female     | 92    | A+    |
| John  | Male       | 81    | A     |
| Ravi  | Male       | 74    | B     |
| Meera | Female     | 58    | C     |
| Sara  | Female     | 45    | C     |
| Kiran | Male       | 33    | Fail  |
+-------+------------+-------+-------+
6 row(s) returned

+-------+--------+--------+-------+
| Total | Passed | Failed | Girls |
+-------+--------+--------+-------+
| 6     | 5      | 1      | 3     |
+-------+--------+--------+-------+
1 row(s) returned

+-------+-------+--------+
| Name  | Marks | Result |
+-------+-------+--------+
| Kiran | 35    | Pass   |
| Sara  | 45    | Pass   |
| Asha  | 92    | Pass   |
| John  | 81    | Pass   |
| Meera | 58    | Pass   |
| Ravi  | 74    | Pass   |
+-------+-------+--------+
6 row(s) returned`,
      explanation: `The simple CASE converts F/M to text; the searched CASE checks ranges from the highest down, so 74 gets B (not A). SUM(CASE ... 1 ELSE 0) counts rows meeting each condition in a single pass. The UPDATE gives Kiran (33) 35 marks; all other rows keep their value through ELSE Marks. In the last query, CASE in ORDER BY puts students below 50 (Kiran, Sara) first, then the rest, each group by name.`,
    },
    {
      title: 'EXISTS and NOT EXISTS: customers with and without orders',
      scenario: 'Marketing wants three lists: customers who ordered, customers who never ordered (for a welcome coupon), and customers with a big order above 10000.',
      steps: steps('OrdersExistsDB'),
      code: q3,
      tsql: q3,
      result: `+------------+-------+
| CustomerId | Name  |
+------------+-------+
| 1          | Asha  |
| 2          | Ravi  |
| 4          | Kiran |
+------------+-------+
3 row(s) returned

+------------+-------+--------+
| CustomerId | Name  | City   |
+------------+-------+--------+
| 3          | Meera | Mumbai |
+------------+-------+--------+
1 row(s) returned

+------+
| Name |
+------+
| Ravi |
+------+
1 row(s) returned

+-------+
| Name  |
+-------+
| Meera |
+-------+
1 row(s) returned`,
      explanation: `For each customer the correlated subquery looks for an order with the same CustomerId. Meera (3) has none, so she appears only in the NOT EXISTS list. Only Ravi has an order with Amount > 10000. The LEFT JOIN version returns the same answer: Meera's joined order columns are NULL. In SSMS you can also write IF EXISTS (SELECT 1 FROM Orders WHERE Amount > 10000) PRINT 'High value orders found'; (IF blocks are not supported in the in-app lab).`,
    },
  ],
  interview: [
    { q: 'Difference between UNION and UNION ALL?', a: 'UNION removes duplicate rows from the combined result (extra sort/hash work); UNION ALL returns all rows including duplicates and is faster.', level: 'Easy' },
    { q: 'What are the rules for UNION?', a: 'Each SELECT must return the same number of columns with compatible data types in the same order. Column names come from the first query, and ORDER BY can appear only once at the end.', level: 'Easy' },
    { q: 'Difference between JOIN and UNION?', a: 'JOIN combines columns from related tables side by side based on a condition. UNION appends rows from multiple queries one below another.', level: 'Easy' },
    { q: 'What do INTERSECT and EXCEPT do?', a: 'INTERSECT returns distinct rows present in both queries; EXCEPT returns distinct rows from the first query that are not in the second.', level: 'Medium' },
    { q: 'Difference between simple and searched CASE?', a: 'Simple CASE compares one expression to a list of values (CASE Dept WHEN ...). Searched CASE evaluates independent boolean conditions (CASE WHEN Marks > 90 ...). Both return the first matching branch.', level: 'Easy' },
    { q: 'What does CASE return when no WHEN matches and there is no ELSE?', a: 'NULL.', level: 'Easy' },
    { q: 'How do you count rows by condition in one query?', a: 'Use conditional aggregation: SUM(CASE WHEN condition THEN 1 ELSE 0 END) or COUNT(CASE WHEN condition THEN 1 END).', level: 'Medium' },
    { q: 'Difference between IN and EXISTS?', a: 'IN compares a value with a list/subquery result; EXISTS checks whether a (usually correlated) subquery returns any row. For positive checks SQL Server often uses the same plan; EXISTS stops at the first match and is NULL-safe.', level: 'Medium' },
    { q: 'Why can NOT IN return no rows?', a: 'If the subquery returns a NULL, every comparison value <> NULL is UNKNOWN, so the NOT IN predicate is never true. Use NOT EXISTS or filter NULLs out.', level: 'Hard' },
    { q: 'Why is SELECT 1 used inside EXISTS?', a: 'EXISTS only checks whether rows exist; the select list is ignored. SELECT 1 (or SELECT *) makes no performance difference, 1 just shows intent.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Using the Students table from Example 2, show Name, Marks and a Category column: "Distinction" (>= 75), "First Class" (60-74), "Pass" (35-59), "Fail" (< 35).',
      hint: 'Searched CASE from the highest range down.',
      solution: `SELECT Name, Marks,
       CASE WHEN Marks >= 75 THEN 'Distinction'
            WHEN Marks >= 60 THEN 'First Class'
            WHEN Marks >= 35 THEN 'Pass'
            ELSE 'Fail' END AS Category
FROM Students
ORDER BY Marks DESC;`,
    },
    {
      task: 'Find products that have never been sold, given Products(ProductId, Name) and Sales(SaleId, ProductId, Qty).',
      hint: 'NOT EXISTS with a correlated subquery on ProductId.',
      solution: `SELECT p.ProductId, p.Name
FROM Products p
WHERE NOT EXISTS (SELECT 1 FROM Sales s WHERE s.ProductId = p.ProductId);`,
    },
    {
      task: 'Create one contact list from Employees(Name, Email) and Vendors(CompanyName, ContactEmail) with a Type column ("Employee"/"Vendor") sorted by name.',
      hint: 'UNION ALL with a literal column; alias the columns in the first SELECT.',
      solution: `SELECT Name AS ContactName, Email, 'Employee' AS Type FROM Employees
UNION ALL
SELECT CompanyName, ContactEmail, 'Vendor' FROM Vendors
ORDER BY ContactName;`,
    },
    {
      task: 'In the Orders table from Example 3, show for each order an AmountBand: "Small" (< 1000), "Medium" (1000-9999) and "Large" (>= 10000), plus the number of orders in each band.',
      hint: 'Use the CASE expression in a CTE or derived table, then GROUP BY the band.',
      solution: `SELECT AmountBand, COUNT(*) AS Orders
FROM (
    SELECT CASE WHEN Amount < 1000 THEN 'Small'
                WHEN Amount < 10000 THEN 'Medium'
                ELSE 'Large' END AS AmountBand
    FROM Orders
) AS b
GROUP BY AmountBand
ORDER BY AmountBand;`,
    },
  ],
  quiz: [
    {
      question: 'Table A has 3 rows, table B has 4 rows, and 2 rows are identical in both. How many rows does A UNION B return?',
      options: ['7', '3', '5', '2'],
      answer: 2,
      explanation: 'UNION removes the 2 duplicates: 3 + 4 - 2 = 5.',
    },
    {
      question: 'Which is true about ORDER BY in a UNION query?',
      options: ['Each SELECT needs its own ORDER BY', 'Only one ORDER BY is allowed, at the end', 'ORDER BY is not allowed', 'It must appear after the first SELECT'],
      answer: 1,
      explanation: 'One ORDER BY at the end sorts the combined result.',
    },
    {
      question: 'What does CASE WHEN 1 = 2 THEN \'Yes\' END return?',
      options: ['NULL', '\'No\'', '0', 'An error'],
      answer: 0,
      explanation: 'No branch matched and there is no ELSE, so the result is NULL.',
    },
    {
      question: 'Which query safely finds customers without orders even if Orders.CustomerId contains NULLs?',
      options: ['WHERE CustomerId NOT IN (SELECT CustomerId FROM Orders)', 'WHERE CustomerId <> ALL (SELECT CustomerId FROM Orders)', 'WHERE CustomerId != (SELECT CustomerId FROM Orders)', 'WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerId = c.CustomerId)'],
      answer: 3,
      explanation: 'NOT EXISTS is NULL-safe; NOT IN and <> ALL fail when the subquery contains NULL.',
    },
    {
      question: 'Which operator is fastest when you know there are no duplicates to remove?',
      options: ['UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT'],
      answer: 1,
      explanation: 'UNION ALL skips the duplicate-removal step.',
    },
  ],
};
