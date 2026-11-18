const steps = (db) => [
  'Open SSMS and connect to your SQL Server instance (or open the in-app SSMS Lab)',
  'Click New Query (Ctrl+N) on the toolbar',
  'Paste the complete script below',
  `Press F5 (Execute). The script creates the ${db} database; read the Results tab`,
];

const q1 = `CREATE DATABASE TempTableDB;
GO
USE TempTableDB;
GO
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    Customer NVARCHAR(50) NOT NULL,
    Product NVARCHAR(50) NOT NULL,
    Qty INT NOT NULL,
    Price INT NOT NULL
);
GO
INSERT INTO Orders (Customer, Product, Qty, Price) VALUES
('Asha', 'Laptop', 1, 55000), ('Ravi', 'Mouse', 3, 500),
('Asha', 'Keyboard', 2, 1500), ('Meera', 'Monitor', 2, 12000),
('Ravi', 'Laptop', 1, 52000), ('John', 'Mouse', 1, 500);
GO
-- Step 1: create a local temporary table (lives in tempdb, visible only to this session)
CREATE TABLE #CustomerTotals (
    Customer NVARCHAR(50) PRIMARY KEY,
    TotalAmount INT NOT NULL,
    OrderCount INT NOT NULL
);
GO
-- Step 2: fill it from a query
INSERT INTO #CustomerTotals (Customer, TotalAmount, OrderCount)
SELECT Customer, SUM(Qty * Price), COUNT(*)
FROM Orders
GROUP BY Customer;
GO
-- Step 3: use it like a normal table (filter, update, join)
UPDATE #CustomerTotals SET TotalAmount = TotalAmount - 1000 WHERE OrderCount > 1;
SELECT Customer, TotalAmount, OrderCount,
       CASE WHEN TotalAmount >= 50000 THEN 'Gold' ELSE 'Silver' END AS Tier
FROM #CustomerTotals
ORDER BY TotalAmount DESC;
GO
-- Step 4: drop it when finished (SQL Server also drops it when the session closes)
DROP TABLE #CustomerTotals;`;
const q2 = `CREATE DATABASE TempSelectIntoDB;
GO
USE TempSelectIntoDB;
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Category NVARCHAR(30) NOT NULL,
    Stock INT NOT NULL,
    ReorderLevel INT NOT NULL
);
GO
INSERT INTO Products (Name, Category, Stock, ReorderLevel) VALUES
('Pen', 'Stationery', 500, 100), ('Notebook', 'Stationery', 40, 50),
('Laptop', 'Electronics', 3, 5), ('Mouse', 'Electronics', 25, 10),
('Stapler', 'Stationery', 8, 10);
GO
-- SELECT ... INTO creates the temp table automatically with matching columns
SELECT ProductId, Name, Category, Stock, ReorderLevel
INTO #LowStock
FROM Products
WHERE Stock < ReorderLevel;
GO
SELECT Name, Stock, ReorderLevel, ReorderLevel * 2 - Stock AS OrderQty
FROM #LowStock
ORDER BY Name;
SELECT Category, COUNT(*) AS ItemsToReorder
FROM #LowStock
GROUP BY Category;
GO
DROP TABLE #LowStock;`;

const q3 = `-- Run Example 1 first (it creates TempTableDB and the Orders table).
-- Table variables need DECLARE, so run this in real SQL Server (SSMS), not in the in-app lab.
USE TempTableDB;
GO
DECLARE @ProductRevenue TABLE (
    Product NVARCHAR(50) PRIMARY KEY,
    Revenue INT NOT NULL
);

INSERT INTO @ProductRevenue (Product, Revenue)
SELECT Product, SUM(Qty * Price)
FROM Orders
GROUP BY Product;

SELECT Product, Revenue
FROM @ProductRevenue
ORDER BY Revenue DESC;

-- Table variables are NOT affected by ROLLBACK
BEGIN TRAN;
INSERT INTO @ProductRevenue (Product, Revenue) VALUES ('Webcam', 2500);
ROLLBACK;

SELECT COUNT(*) AS RowsAfterRollback FROM @ProductRevenue;
GO
-- The variable no longer exists here (new batch) - this line would fail:
-- SELECT * FROM @ProductRevenue;   -- Msg 1087: Must declare the table variable`;

const q4 = `-- Session scope demo: needs two query windows in SSMS (not supported in the in-app lab)

-- Window 1 (Ctrl+N):
USE tempdb;
GO
CREATE TABLE #LocalCart (Item NVARCHAR(30));     -- visible only to THIS window/session
CREATE TABLE ##SharedRates (Currency CHAR(3), Rate DECIMAL(10,4));  -- visible to ALL sessions
INSERT INTO #LocalCart VALUES ('Pen');
INSERT INTO ##SharedRates VALUES ('USD', 83.2500);
GO
-- See the real names SQL Server gave them inside tempdb
SELECT name FROM tempdb.sys.tables WHERE name LIKE '#LocalCart%' OR name = '##SharedRates';

-- Window 2 (open another New Query and run):
SELECT * FROM ##SharedRates;   -- works: global temp table
SELECT * FROM #LocalCart;      -- fails: Invalid object name '#LocalCart'

-- Close Window 1: #LocalCart is dropped immediately;
-- ##SharedRates is dropped when the last session using it ends.

-- Safe re-run pattern for scripts (SQL Server 2016+):
DROP TABLE IF EXISTS #LocalCart;`;

export default {
  id: 'extra-34-temp-tables-and-table-variables',
  title: 'Temporary Tables and Table Variables',
  module: 'Extra: SQL Server',
  extraNo: 34,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `Temporary objects hold intermediate results while a script or stored procedure runs. Learn local temp tables (#table), global temp tables (##table) and table variables (@table): how to create and fill them (CREATE TABLE, INSERT ... SELECT, SELECT ... INTO), where they live (tempdb), how long they last, how they behave with transactions and indexes, and when to choose each one instead of a CTE.`,
  objectives: [
    'Create, fill, query and drop local temporary tables (#temp)',
    'Use SELECT ... INTO to create a temp table from a query',
    'Declare and use table variables (@table) and understand their batch scope',
    'Explain scope, lifetime, statistics, indexing and transaction differences',
    'Choose between temp table, table variable, CTE and permanent table',
  ],
  theory: [
    {
      heading: 'Local temporary tables (#table)',
      content: `A table whose name starts with **#** is a **local temporary table**.
- Stored in the system database **tempdb** (not in your database).
- Visible only to the **session** (query window / connection) that created it.
- Dropped automatically when the session ends (or when the stored procedure that created it finishes). You can also DROP it yourself.
- Behaves like a normal table: primary keys, indexes, constraints, UPDATE, DELETE, JOIN, statistics.

Analogy: a whiteboard in your private cabin. You write intermediate figures on it during the meeting and it is wiped when you leave.`,
      syntax: `CREATE TABLE #CustomerTotals (
    Customer NVARCHAR(50) PRIMARY KEY,
    TotalAmount INT NOT NULL
);
INSERT INTO #CustomerTotals (Customer, TotalAmount)
SELECT Customer, SUM(Qty * Price) FROM Orders GROUP BY Customer;

SELECT * FROM #CustomerTotals;
DROP TABLE #CustomerTotals;   -- or DROP TABLE IF EXISTS #CustomerTotals;`,
    },
    {
      heading: 'SELECT ... INTO and global temp tables (##table)',
      content: `**SELECT columns INTO #NewTable FROM ...** creates the table automatically, with column names and types taken from the query, and fills it in one step. It also works for permanent tables (quick copies/backups).

A **global temporary table** starts with **##**. It is visible to **all sessions** and is dropped when the session that created it ends and no other session is still using it. Rarely needed - use it for short-lived data shared between connections (for example a quick admin script).`,
      syntax: `SELECT ProductId, Name, Stock
INTO #LowStock
FROM Products
WHERE Stock < ReorderLevel;

CREATE TABLE ##ExchangeRates (Currency CHAR(3), Rate DECIMAL(10,4));`,
    },
    {
      heading: 'Table variables (@table)',
      content: `A **table variable** is declared like a variable: DECLARE @Name TABLE (...).
- Scope is the current **batch**, stored procedure or function - it disappears at the next GO.
- Also physically stored in tempdb (it is not "only in memory").
- Supports PRIMARY KEY, UNIQUE, CHECK and inline INDEX definitions, but no ALTER TABLE and no statistics.
- **Not affected by ROLLBACK** - rows inserted inside a rolled-back transaction remain. Useful for keeping error-log rows.
- Can be passed to stored procedures as a **table-valued parameter** (with a user-defined table type).
- Fewer recompilations; good for **small** row counts (tens or hundreds of rows).

Note: the in-app SSMS Lab does not support DECLARE, so table variable scripts must be run in real SQL Server.`,
      syntax: `DECLARE @Top TABLE (
    Product NVARCHAR(50) PRIMARY KEY,
    Revenue INT NOT NULL,
    INDEX IX_Revenue (Revenue)
);
INSERT INTO @Top SELECT Product, SUM(Qty * Price) FROM Orders GROUP BY Product;
SELECT * FROM @Top;`,
    },
    {
      heading: 'Temp table vs table variable vs CTE',
      content: `| Feature | #Temp table | @Table variable | CTE |
|---|---|---|---|
| Created with | CREATE TABLE / SELECT INTO | DECLARE | WITH |
| Stored | tempdb | tempdb | not stored |
| Scope | session / procedure | batch / procedure | one statement |
| Statistics | yes - better plans for big data | no (SQL 2019+ uses deferred compilation) | uses base tables |
| Add indexes later | yes (CREATE INDEX) | only inline in DECLARE | no |
| ROLLBACK | rolled back | NOT rolled back | n/a |
| Best for | large intermediate results reused many times | small sets, TVPs, logging inside transactions | readability, recursion |

Rule of thumb: few rows and simple use -> table variable; thousands of rows, joins and reuse -> temp table; just making a single query readable -> CTE.`,
      tip: `Always clean up with DROP TABLE IF EXISTS #name at the start of a script you will run repeatedly in the same window, otherwise the second run fails with "There is already an object named '#name'".`,
    },
  ],
  examples: [
    {
      title: 'Local temp table: customer totals with tiers',
      scenario: 'Summarize each customer\'s orders into a temp table, apply a loyalty discount to repeat customers and label them Gold/Silver.',
      steps: steps('TempTableDB'),
      code: q1,
      tsql: q1,
      result: `+----------+-------------+------------+--------+
| Customer | TotalAmount | OrderCount | Tier   |
+----------+-------------+------------+--------+
| Asha     | 57000       | 2          | Gold   |
| Ravi     | 52500       | 2          | Gold   |
| Meera    | 24000       | 1          | Silver |
| John     | 500         | 1          | Silver |
+----------+-------------+------------+--------+
4 row(s) returned`,
      explanation: `The temp table is created with a primary key, filled with INSERT ... SELECT (one row per customer) and then used like any table. Asha (55000 + 2 x 1500 = 58000) and Ravi (3 x 500 + 52000 = 53500) have 2 orders each, so 1000 is subtracted. The CASE assigns the tier. DROP TABLE frees the tempdb space; in SSMS it would also be dropped automatically when you close the query window.`,
    },
    {
      title: 'SELECT ... INTO a temp table: reorder report',
      scenario: 'Copy all products below their reorder level into a temp table, then calculate order quantities and a per-category count from it.',
      steps: steps('TempSelectIntoDB'),
      code: q2,
      tsql: q2,
      result: `+----------+-------+--------------+----------+
| Name     | Stock | ReorderLevel | OrderQty |
+----------+-------+--------------+----------+
| Laptop   | 3     | 5            | 7        |
| Notebook | 40    | 50           | 60       |
| Stapler  | 8     | 10           | 12       |
+----------+-------+--------------+----------+
3 row(s) returned

+-------------+----------------+
| Category    | ItemsToReorder |
+-------------+----------------+
| Electronics | 1              |
| Stationery  | 2              |
+-------------+----------------+
2 row(s) returned`,
      explanation: `SELECT ... INTO creates #LowStock with the same columns and types as the query and fills it - no CREATE TABLE needed. Laptop (3 < 5), Notebook (40 < 50) and Stapler (8 < 10) qualify. The order quantity tops each item up to twice its reorder level (e.g. 2 x 50 - 40 = 60). Both reports read the small temp table instead of scanning Products again.`,
    },
    {
      title: 'Table variable and its behaviour with ROLLBACK (SSMS only)',
      scenario: 'Store product revenue in a table variable, and prove that a ROLLBACK does not remove rows from a table variable.',
      steps: [
        'Run Example 1 first so that TempTableDB and its Orders table exist',
        'In SSMS click New Query (Ctrl+N) - this script uses DECLARE, which the in-app lab does not support',
        'Paste the script and press F5',
        'Look at the two result grids, then try uncommenting the last SELECT to see error 1087',
      ],
      code: q3,
      result: `Product   Revenue
--------  -------
Laptop    107000
Monitor   24000
Keyboard  3000
Mouse     2000

RowsAfterRollback
-----------------
5`,
      explanation: `The table variable gets one row per product: Laptop 55000 + 52000, Monitor 2 x 12000, Keyboard 2 x 1500, Mouse 3 x 500 + 500. Webcam is inserted inside a transaction that is rolled back, yet the count is 5, not 4: table variables do not take part in transactions. A temp table would have lost the Webcam row. After GO the variable is gone, so any later batch must declare it again.`,
    },
    {
      title: 'Scope of #local and ##global temp tables (SSMS only)',
      scenario: 'Use two query windows to see which temp tables other sessions can see and how SQL Server names them in tempdb.',
      steps: [
        'In SSMS open a New Query window (Window 1) and run the Window 1 part of the script',
        'Open a second New Query window (Window 2) and run the two SELECT statements of the Window 2 part',
        'Observe that ##SharedRates is visible but #LocalCart gives an error',
        'Close Window 1 and run the ##SharedRates query again in Window 2 - it now fails too',
      ],
      code: q4,
      result: `Window 1, sys.tables query:
name
----------------------------------------------
##SharedRates
#LocalCart__________________..._000000000012   (suffix differs per session)

Window 2:
Currency  Rate
USD       83.2500
Msg 208, Level 16, State 0: Invalid object name '#LocalCart'.`,
      explanation: `SQL Server stores local temp tables in tempdb with a long padded name plus a unique suffix, so two sessions can each have their own #LocalCart without clashing. ##SharedRates keeps its exact name and is shared. This is why stored procedures can safely use #temp tables even when many users run them at the same time.`,
    },
  ],
  interview: [
    { q: 'Where are temporary tables stored?', a: 'In the tempdb system database, for both #local and ##global temp tables (and table variables).', level: 'Easy' },
    { q: 'Difference between #temp and ##temp tables?', a: '#local tables are visible only to the creating session (and dropped when it ends); ##global tables are visible to all sessions and dropped when the creator ends and no other session references them.', level: 'Easy' },
    { q: 'Temp table vs table variable - key differences?', a: 'Temp tables have statistics, can be indexed after creation, are affected by transactions and live for the session. Table variables have no statistics, only inline indexes, ignore ROLLBACK, live for the batch, and can be table-valued parameters.', level: 'Medium' },
    { q: 'Are table variables stored only in memory?', a: 'No - a common myth. Both table variables and temp tables are created in tempdb and may be cached in memory; neither is guaranteed to stay purely in RAM.', level: 'Medium' },
    { q: 'What happens to a table variable on ROLLBACK?', a: 'Nothing - its rows stay. Table variables are not part of user transactions, which makes them useful for collecting log/error rows inside a transaction.', level: 'Medium' },
    { q: 'When is a temp table better than a table variable?', a: 'For larger row counts, complex joins or repeated use, because statistics give the optimizer accurate row estimates and you can add indexes.', level: 'Medium' },
    { q: 'What does SELECT ... INTO do?', a: 'Creates a new table (permanent or temporary) with columns based on the query and inserts the result rows in one step. The target table must not already exist.', level: 'Easy' },
    { q: 'Why might a script fail the second time with "There is already an object named #X"?', a: 'The temp table still exists in the same session. Add DROP TABLE IF EXISTS #X at the start or drop it at the end.', level: 'Easy' },
    { q: 'Can two users run a procedure that creates #Temp at the same time?', a: 'Yes. Each session gets its own copy with a unique internal name in tempdb, so there is no conflict.', level: 'Medium' },
    { q: 'CTE or temp table for an intermediate result used in five later queries?', a: 'A temp table: a CTE exists for only one statement, and repeating it would recompute the query each time.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Using Orders from Example 1, create #ProductSales with Product, TotalQty and Revenue, then show only products whose revenue is above the average product revenue.',
      hint: 'INSERT INTO #ProductSales SELECT ... GROUP BY Product, then a subquery with AVG(Revenue).',
      solution: `CREATE TABLE #ProductSales (Product NVARCHAR(50), TotalQty INT, Revenue INT);
INSERT INTO #ProductSales
SELECT Product, SUM(Qty), SUM(Qty * Price) FROM Orders GROUP BY Product;

SELECT Product, TotalQty, Revenue
FROM #ProductSales
WHERE Revenue > (SELECT AVG(Revenue) FROM #ProductSales);
DROP TABLE #ProductSales;`,
    },
    {
      task: 'Use SELECT ... INTO to copy all Electronics products into #Electronics, add an index on Stock, and list items with Stock < 10.',
      hint: 'CREATE INDEX works on temp tables just like on normal tables.',
      solution: `SELECT ProductId, Name, Stock INTO #Electronics FROM Products WHERE Category = 'Electronics';
CREATE INDEX IX_Electronics_Stock ON #Electronics (Stock);
SELECT Name, Stock FROM #Electronics WHERE Stock < 10;
DROP TABLE #Electronics;`,
    },
    {
      task: 'In SSMS, declare a table variable @Errors(Msg NVARCHAR(200)), start a transaction, insert an error message into @Errors, roll back, and show that the message is still there.',
      hint: 'Everything must be in one batch (no GO between DECLARE and the SELECT).',
      solution: `DECLARE @Errors TABLE (Msg NVARCHAR(200));
BEGIN TRAN;
    INSERT INTO @Errors VALUES ('Stock update failed for Laptop');
ROLLBACK;
SELECT Msg FROM @Errors;   -- 1 row: the log survives the rollback`,
    },
    {
      task: 'Write a re-runnable script that recreates #DeptSummary(Department, Headcount) every time it runs.',
      hint: 'DROP TABLE IF EXISTS #DeptSummary; then SELECT ... INTO.',
      solution: `DROP TABLE IF EXISTS #DeptSummary;
SELECT Department, COUNT(*) AS Headcount
INTO #DeptSummary
FROM Employees
GROUP BY Department;
SELECT * FROM #DeptSummary ORDER BY Headcount DESC;`,
    },
  ],
  quiz: [
    {
      question: 'Which prefix creates a temporary table visible only to your session?',
      options: ['@', '##', '#', '$'],
      answer: 2,
      explanation: 'A single # makes a local temp table; ## is global; @ is a table variable.',
    },
    {
      question: 'Where are temp tables created?',
      options: ['tempdb', 'master', 'the current user database', 'Only in RAM'],
      answer: 0,
      explanation: 'All temporary tables (and table variables) live in tempdb.',
    },
    {
      question: 'Rows are inserted into a table variable inside BEGIN TRAN ... ROLLBACK. What happens to them?',
      options: ['They are removed', 'They stay in the table variable', 'The table variable is dropped', 'An error is raised'],
      answer: 1,
      explanation: 'Table variables are not affected by transaction rollback.',
    },
    {
      question: 'How long does a table variable exist?',
      options: ['Until the server restarts', 'Until the session closes', 'Until DROP is called', 'Until the end of the batch, procedure or function'],
      answer: 3,
      explanation: 'A table variable goes out of scope at the end of the batch (for example at GO).',
    },
    {
      question: 'Which choice is best for 500,000 intermediate rows joined several times?',
      options: ['A local temp table with an index', 'A table variable', 'A CTE referenced five times', 'A global temp table without indexes'],
      answer: 0,
      explanation: 'Temp tables have statistics and can be indexed, giving better plans for large data.',
    },
  ],
};
