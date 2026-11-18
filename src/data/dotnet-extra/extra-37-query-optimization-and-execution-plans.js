const steps = (db) => [
  'Open SSMS and connect to your SQL Server instance (or open the in-app SSMS Lab)',
  'Click New Query (Ctrl+N) on the toolbar',
  'Paste the complete script below',
  `Press F5 (Execute). The script creates the ${db} database; read the Results tab`,
];

const q1 = `CREATE DATABASE TuningDB;
GO
USE TuningDB;
GO
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    CustomerName NVARCHAR(50) NOT NULL,
    City NVARCHAR(30) NOT NULL,
    OrderDate DATE NOT NULL,
    Amount INT NOT NULL,
    Status NVARCHAR(20) NOT NULL
);
GO
INSERT INTO Orders (CustomerName, City, OrderDate, Amount, Status) VALUES
('Asha', 'Pune', '2025-12-30', 1200, 'Delivered'),
('Ravi', 'Delhi', '2026-01-05', 5400, 'Delivered'),
('Meera', 'Mumbai', '2026-02-11', 800, 'Cancelled'),
('Kiran', 'Pune', '2026-03-18', 2300, 'Shipped'),
('Asha', 'Pune', '2026-06-02', 650, 'Pending'),
('John', 'Chennai', '2026-07-21', 9100, 'Delivered');
GO
-- Indexes on columns used in WHERE / JOIN / ORDER BY (CREATE INDEX = NONCLUSTERED by default)
CREATE INDEX IX_Orders_OrderDate ON Orders (OrderDate);
CREATE INDEX IX_Orders_City_Status ON Orders (City, Status);
GO
-- NOT sargable: the function on the column hides it from the index (index scan)
SELECT OrderId, CustomerName, OrderDate
FROM Orders
WHERE YEAR(OrderDate) = 2026
ORDER BY OrderDate;
-- Sargable rewrite: a range on the bare column can use an index seek (same rows)
SELECT OrderId, CustomerName, OrderDate
FROM Orders
WHERE OrderDate >= '2026-01-01' AND OrderDate < '2027-01-01'
ORDER BY OrderDate;
-- Leading column of the composite index (City) is used first
SELECT OrderId, CustomerName, Amount
FROM Orders
WHERE City = 'Pune' AND Status <> 'Cancelled'
ORDER BY OrderId;`;

const q2 = `-- Run in real SSMS (execution plans and SET STATISTICS are not available in the in-app lab)
USE TuningDB;   -- created by Example 1
GO
-- Load 100,000 extra rows so the difference is measurable
WITH n AS (
    SELECT TOP (100000) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS i
    FROM sys.all_objects a CROSS JOIN sys.all_objects b
)
INSERT INTO Orders (CustomerName, City, OrderDate, Amount, Status)
SELECT CONCAT('Customer', i),
       CASE i % 4 WHEN 0 THEN 'Pune' WHEN 1 THEN 'Delhi' WHEN 2 THEN 'Mumbai' ELSE 'Chennai' END,
       DATEADD(DAY, -(i % 1500), '2026-11-17'),
       (i % 50) * 100 + 100,
       CASE WHEN i % 10 = 0 THEN 'Cancelled' ELSE 'Delivered' END
FROM n;
GO
SET STATISTICS IO ON;     -- shows logical reads per table in the Messages tab
SET STATISTICS TIME ON;   -- shows CPU and elapsed time
GO
-- Press Ctrl+M (Include Actual Execution Plan) BEFORE running the next two queries

-- Query A: function on the column -> Index Scan
SELECT OrderId, OrderDate FROM Orders WHERE YEAR(OrderDate) = 2023;

-- Query B: sargable range -> Index Seek
SELECT OrderId, OrderDate FROM Orders
WHERE OrderDate >= '2023-01-01' AND OrderDate < '2024-01-01';
GO
SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;`;

const q3 = `CREATE DATABASE PagingDB;
GO
USE PagingDB;
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Category NVARCHAR(30) NOT NULL,
    Price INT NOT NULL,
    Description NVARCHAR(MAX) NULL
);
GO
INSERT INTO Products (Name, Category, Price, Description) VALUES
('Pen', 'Stationery', 20, 'Blue ball pen'), ('Notebook', 'Stationery', 60, '200 pages'),
('Mouse', 'Electronics', 500, 'Wireless'), ('Keyboard', 'Electronics', 1500, 'Mechanical'),
('Monitor', 'Electronics', 12000, '24 inch'), ('Stapler', 'Stationery', 150, 'Metal'),
('Laptop', 'Electronics', 55000, '16 GB RAM');
GO
CREATE INDEX IX_Products_Category_Price ON Products (Category, Price);
GO
-- 1) Select only the columns you need (no SELECT *, no big NVARCHAR(MAX) column)
-- 2) Page with OFFSET/FETCH instead of returning every row
SELECT ProductId, Name, Price
FROM Products
WHERE Category = 'Electronics'
ORDER BY Price
OFFSET 0 ROWS FETCH NEXT 2 ROWS ONLY;
SELECT ProductId, Name, Price
FROM Products
WHERE Category = 'Electronics'
ORDER BY Price
OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;
-- 3) EXISTS stops at the first match; COUNT(*) has to count every row
SELECT 'Has expensive items' AS Answer
WHERE EXISTS (SELECT 1 FROM Products WHERE Price > 10000);
-- 4) Avoid leading wildcards: 'Mo%' can seek an index, '%se' cannot
SELECT Name FROM Products WHERE Name LIKE 'Mo%' ORDER BY Name;`;

const q4 = `-- Run in real SSMS after Example 2 (needs the 100,000-row Orders table)
USE TuningDB;
GO
-- The query we want to speed up: reads City, Status and Amount
SET STATISTICS IO ON;
SELECT City, SUM(Amount) AS Revenue
FROM Orders
WHERE Status = 'Delivered' AND OrderDate >= '2026-01-01'
GROUP BY City;
GO
-- 1) What does SQL Server itself suggest? (missing-index DMVs)
SELECT TOP (5)
       d.statement AS TableName, d.equality_columns, d.inequality_columns, d.included_columns,
       s.user_seeks, s.avg_user_impact
FROM sys.dm_db_missing_index_details d
JOIN sys.dm_db_missing_index_groups g ON g.index_handle = d.index_handle
JOIN sys.dm_db_missing_index_group_stats s ON s.group_handle = g.index_group_handle
ORDER BY s.avg_user_impact DESC;
GO
-- 2) Covering index: key columns for WHERE, INCLUDE for the SELECT/GROUP BY columns
CREATE NONCLUSTERED INDEX IX_Orders_Status_OrderDate
ON Orders (Status, OrderDate)
INCLUDE (City, Amount);
GO
-- 3) Run the query again and compare logical reads in the Messages tab
SELECT City, SUM(Amount) AS Revenue
FROM Orders
WHERE Status = 'Delivered' AND OrderDate >= '2026-01-01'
GROUP BY City;
GO
-- 4) Keep statistics and indexes healthy
UPDATE STATISTICS Orders;
SELECT i.name, ps.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), OBJECT_ID('Orders'), NULL, NULL, 'LIMITED') ps
JOIN sys.indexes i ON i.object_id = ps.object_id AND i.index_id = ps.index_id;
-- ALTER INDEX IX_Orders_Status_OrderDate ON Orders REORGANIZE;   -- 5-30 percent fragmentation
-- ALTER INDEX IX_Orders_Status_OrderDate ON Orders REBUILD;      -- above 30 percent
SET STATISTICS IO OFF;`;

export default {
  id: 'extra-37-query-optimization-and-execution-plans',
  title: 'Query Optimization and Execution Plans',
  module: 'Extra: SQL Server',
  extraNo: 37,
  level: 'Advanced',
  duration: '3 hours',
  summary: `A query that takes 10 ms with 100 rows can take 10 seconds with 10 million rows. Learn how SQL Server executes a query, how to read estimated and actual execution plans in SSMS (scans, seeks, key lookups, joins, sorts), how to measure with SET STATISTICS IO/TIME, how clustered, nonclustered, composite and covering indexes work, what makes a predicate sargable, and a practical checklist of query-writing rules used in real projects.`,
  objectives: [
    'Display and read estimated/actual execution plans in SSMS',
    'Measure queries with SET STATISTICS IO and TIME (logical reads, CPU time)',
    'Explain clustered vs nonclustered, composite and covering (INCLUDE) indexes',
    'Write sargable predicates and avoid common anti-patterns',
    'Use missing-index DMVs, statistics and index maintenance wisely',
  ],
  theory: [
    {
      heading: 'How SQL Server runs a query',
      content: `1. **Parsing** - checks syntax.
2. **Binding** - checks that tables and columns exist.
3. **Optimization** - the **Query Optimizer** looks at indexes and **statistics** (histograms describing data distribution), estimates the cost of many possible plans, and picks the cheapest.
4. **Execution** - the chosen **execution plan** is run and cached in the **plan cache** for reuse.

The execution plan is the "route" SQL Server takes: which index to use, which join algorithm, in which order. Good indexes and accurate statistics give the optimizer better routes.

Analogy: Google Maps chooses a route using road data (statistics) and available roads (indexes). Outdated maps or missing roads lead to slow routes.`,
    },
    {
      heading: 'Execution plans in SSMS',
      content: `- **Display Estimated Execution Plan**: Ctrl+L (does not run the query).
- **Include Actual Execution Plan**: Ctrl+M, then F5 (runs the query and shows actual row counts).
- Read the graphical plan **right to left, top to bottom**; arrow thickness = number of rows; each operator shows its cost percentage.
- Hover an operator (or press F4) to see estimated vs actual rows, predicates and output columns.

Important operators:
| Operator | Meaning |
|---|---|
| Table Scan / Clustered Index Scan | reads the whole table - fine for small tables, bad for selective filters on big ones |
| Index Seek | jumps directly to matching rows - usually what you want |
| Key Lookup (RID Lookup) | for each row found in a nonclustered index, fetches missing columns from the clustered index - expensive for many rows; fix with INCLUDE |
| Nested Loops / Hash Match / Merge Join | join algorithms (small inputs / large unsorted / large sorted) |
| Sort | expensive; an index in the right order can remove it |

A big difference between **estimated** and **actual** rows usually means outdated statistics or a non-sargable predicate.`,
      tip: `Green text "Missing Index (Impact 85%)" at the top of a plan is a hint, not an order - review it before creating the index.`,
    },
    {
      heading: 'Measuring: SET STATISTICS IO and TIME',
      content: `- **SET STATISTICS IO ON** prints, per table, the **logical reads** (8 KB pages read from memory). Fewer reads = less work. This is the most reliable number when comparing two versions of a query.
- **SET STATISTICS TIME ON** prints parse/compile time and CPU/elapsed time.
- Elapsed time varies with cache and load, so compare logical reads first.
- In production, use **Query Store** (Database Properties > Query Store) to find regressed and top resource-consuming queries over time.`,
      syntax: `SET STATISTICS IO, TIME ON;
SELECT ... ;
-- Messages: Table 'Orders'. Scan count 1, logical reads 412, ...
SET STATISTICS IO, TIME OFF;`,
    },
    {
      heading: 'Indexes: clustered, nonclustered, composite, covering',
      content: `- **Clustered index**: the table rows themselves are stored sorted by the key (one per table; the PRIMARY KEY by default). Like a phone directory sorted by name.
- **Nonclustered index**: a separate sorted structure with the key columns plus a pointer to the row. Many per table. Like the index at the back of a book.
- **Composite index**: several key columns, e.g. (City, Status). Useful for WHERE City = ... AND Status = ... and for WHERE City = ... alone - but NOT for WHERE Status = ... alone (the **leftmost-prefix** rule).
- **Covering index**: contains every column the query needs (keys + **INCLUDE** columns), so no Key Lookup is needed.
- **Filtered index**: WHERE clause on the index (e.g. WHERE Status = 'Pending') - small and fast for common filters.
- **Unique index**: enforces uniqueness (UNIQUE constraints create one).

Costs: every index uses disk space and slows down INSERT/UPDATE/DELETE because it must be maintained. Index the columns used in WHERE, JOIN and ORDER BY of frequent queries; don't index everything.`,
      syntax: `CREATE NONCLUSTERED INDEX IX_Orders_City_Status ON Orders (City, Status);
CREATE INDEX IX_Orders_Status_Date ON Orders (Status, OrderDate) INCLUDE (City, Amount);
CREATE INDEX IX_Orders_Pending ON Orders (OrderDate) WHERE Status = 'Pending';`,
    },
    {
      heading: 'Sargable queries and other rules',
      content: `**Sargable** (Search ARGument ABLE) = the predicate can use an index seek. Keep the column **bare** on one side:
| Not sargable | Sargable rewrite |
|---|---|
| WHERE YEAR(OrderDate) = 2026 | WHERE OrderDate >= '2026-01-01' AND OrderDate < '2027-01-01' |
| WHERE LEFT(Name, 2) = 'Mo' | WHERE Name LIKE 'Mo%' |
| WHERE Name LIKE '%se' | full-text search, or a computed column |
| WHERE Salary * 1.1 > 50000 | WHERE Salary > 50000 / 1.1 |
| WHERE ISNULL(City, '') = 'Pune' | WHERE City = 'Pune' |
| WHERE PhoneNo = 9876543210 (PhoneNo is VARCHAR) | WHERE PhoneNo = '9876543210' (avoid implicit conversion) |

Other rules:
- Select only needed columns - avoid SELECT *.
- Use EXISTS instead of COUNT(*) > 0.
- Paginate with OFFSET/FETCH or keyset paging (WHERE Id > @lastId).
- Prefer set-based statements over cursors and loops.
- Avoid scalar functions on large result sets; use parameters (not concatenated literals) so plans are reused.
- Keep statistics updated and maintain fragmented indexes (REORGANIZE 5-30 percent, REBUILD above 30 percent).
- In EF Core: AsNoTracking for reads, project with Select, avoid N+1 queries with Include, and check the generated SQL with ToQueryString() or logging.`,
    },
  ],
  examples: [
    {
      title: 'Indexes and sargable vs non-sargable predicates',
      scenario: 'Create indexes on an Orders table, then compare a YEAR() filter with an equivalent date range, and use a composite (City, Status) index.',
      steps: steps('TuningDB'),
      code: q1,
      tsql: q1,
      result: `+---------+--------------+------------+
| OrderId | CustomerName | OrderDate  |
+---------+--------------+------------+
| 2       | Ravi         | 2026-01-05 |
| 3       | Meera        | 2026-02-11 |
| 4       | Kiran        | 2026-03-18 |
| 5       | Asha         | 2026-06-02 |
| 6       | John         | 2026-07-21 |
+---------+--------------+------------+
5 row(s) returned

+---------+--------------+------------+
| OrderId | CustomerName | OrderDate  |
+---------+--------------+------------+
| 2       | Ravi         | 2026-01-05 |
| 3       | Meera        | 2026-02-11 |
| 4       | Kiran        | 2026-03-18 |
| 5       | Asha         | 2026-06-02 |
| 6       | John         | 2026-07-21 |
+---------+--------------+------------+
5 row(s) returned

+---------+--------------+--------+
| OrderId | CustomerName | Amount |
+---------+--------------+--------+
| 1       | Asha         | 1200   |
| 4       | Kiran        | 2300   |
| 5       | Asha         | 650    |
+---------+--------------+--------+
3 row(s) returned`,
      explanation: `Both date queries return exactly the same 5 rows - the difference is only in HOW SQL Server finds them. YEAR(OrderDate) must be calculated for every row, so the index on OrderDate cannot be used for a seek (Index Scan). The range on the bare column lets SQL Server seek straight into the index. The third query uses the leftmost column of IX_Orders_City_Status (City). CREATE INDEX creates a NONCLUSTERED index by default (the in-app lab accepts only the short form; in SSMS you can write CREATE NONCLUSTERED INDEX). Execution plans themselves can be viewed only in real SSMS - see Example 2.`,
    },
    {
      title: 'Reading execution plans with SET STATISTICS IO (SSMS)',
      scenario: 'Load 100,000 orders, turn on the actual execution plan and IO statistics, and compare the scan and seek versions of the same query.',
      steps: [
        'Run Example 1 first in SSMS so TuningDB exists',
        'Open a New Query window (Ctrl+N), paste this script and run only the first batch (the INSERT) - select it and press F5',
        'Press Ctrl+M to turn on Include Actual Execution Plan',
        'Run the rest of the script (F5) and open the Execution plan and Messages tabs',
      ],
      code: q2,
      result: `Messages tab (numbers vary slightly by machine/version):
Query A: Table 'Orders'. Scan count 1, logical reads ~230
Query B: Table 'Orders'. Scan count 1, logical reads ~60

Execution plan tab:
Query A: Index Scan (NonClustered) [IX_Orders_OrderDate]  - Query cost ~80% of the batch
Query B: Index Seek (NonClustered) [IX_Orders_OrderDate]  - Query cost ~20% of the batch`,
      explanation: `Both queries return the same rows, but Query A scans every entry of IX_Orders_OrderDate and evaluates YEAR() on each, while Query B seeks to 2023-01-01 and reads only the matching range. The index is covering for these queries (OrderId is the clustered key, so it is stored in every nonclustered index), so no Key Lookup appears. Compare logical reads, not elapsed time - the second run of any query is faster because pages are already in memory.`,
    },
    {
      title: 'Lean queries: needed columns, OFFSET/FETCH paging, EXISTS and LIKE',
      scenario: 'Show a product list page that returns only the needed columns, two items per page, checks existence efficiently and searches by prefix.',
      steps: steps('PagingDB'),
      code: q3,
      tsql: q3,
      result: `+-----------+----------+-------+
| ProductId | Name     | Price |
+-----------+----------+-------+
| 3         | Mouse    | 500   |
| 4         | Keyboard | 1500  |
+-----------+----------+-------+
2 row(s) returned

+-----------+---------+-------+
| ProductId | Name    | Price |
+-----------+---------+-------+
| 5         | Monitor | 12000 |
| 7         | Laptop  | 55000 |
+-----------+---------+-------+
2 row(s) returned

+---------------------+
| Answer              |
+---------------------+
| Has expensive items |
+---------------------+
1 row(s) returned

+---------+
| Name    |
+---------+
| Monitor |
| Mouse   |
+---------+
2 row(s) returned`,
      explanation: `The listing avoids SELECT * so the large Description column is never read. OFFSET 0 / FETCH 2 returns page 1 and OFFSET 2 returns page 2 - always with a deterministic ORDER BY. The composite index (Category, Price) can satisfy both the WHERE and the ORDER BY without a Sort. EXISTS stops at the first expensive product instead of counting all of them. 'Mo%' is a prefix search that can seek an index on Name; a leading wildcard like '%se' always scans.`,
    },
    {
      title: 'Missing-index DMVs, covering index with INCLUDE and maintenance (SSMS)',
      scenario: 'A revenue report filters by Status and OrderDate and reads City and Amount. Ask SQL Server for index suggestions, create a covering index and check fragmentation.',
      steps: [
        'Run Examples 1 and 2 first in SSMS (so Orders has 100,000+ rows)',
        'Open a New Query window (Ctrl+N), press Ctrl+M to include the actual plan',
        'Paste and run the script with F5',
        'Compare the logical reads and plans of the report query before and after the index',
      ],
      code: q4,
      result: `Before the index (Messages): Table 'Orders'. logical reads ~600 (Clustered Index Scan)
Missing index DMV row: equality_columns = [Status], inequality_columns = [OrderDate], included_columns = [City], [Amount], avg_user_impact ~90
After the index (Messages): Table 'Orders'. logical reads ~40 (Index Seek on IX_Orders_Status_OrderDate, no Key Lookup)
Fragmentation query: one row per index with avg_fragmentation_in_percent (close to 0 right after creation)`,
      explanation: `The DMV suggestion matches the theory: equality columns first, then inequality (range) columns as keys, and the remaining columns used by the query as INCLUDE. Because City and Amount are included, the new index covers the query and SQL Server never touches the base table. UPDATE STATISTICS refreshes the histograms the optimizer uses; sys.dm_db_index_physical_stats tells you whether an index needs REORGANIZE or REBUILD. Exact read counts depend on your data and SQL Server version.`,
    },
  ],
  interview: [
    { q: 'What is an execution plan?', a: 'The sequence of physical operations (scans, seeks, joins, sorts) SQL Server chooses to run a query. Estimated plans show the optimizer\'s prediction; actual plans include real row counts after execution.', level: 'Easy' },
    { q: 'How do you view an execution plan in SSMS?', a: 'Ctrl+L for the estimated plan, Ctrl+M (Include Actual Execution Plan) then execute for the actual plan. You can also use SET SHOWPLAN_XML ON or Query Store.', level: 'Easy' },
    { q: 'Difference between Index Scan and Index Seek?', a: 'A scan reads all rows/pages of the index; a seek navigates the B-tree to only the qualifying rows. Seeks are usually much cheaper for selective predicates.', level: 'Easy' },
    { q: 'What is a Key Lookup and how do you remove it?', a: 'For each row found via a nonclustered index, SQL Server fetches extra columns from the clustered index. Remove it by adding the needed columns to the index (INCLUDE) to make it covering, or by selecting fewer columns.', level: 'Medium' },
    { q: 'Clustered vs nonclustered index?', a: 'A clustered index defines the physical order of table rows (one per table). A nonclustered index is a separate structure with keys and row locators (many per table).', level: 'Easy' },
    { q: 'What is a covering index?', a: 'An index that contains all columns a query needs (key + INCLUDE columns), so the query is answered from the index alone without lookups.', level: 'Medium' },
    { q: 'What is a sargable predicate?', a: 'A condition that allows an index seek because the column is not wrapped in a function or calculation, e.g. OrderDate >= \'2026-01-01\' instead of YEAR(OrderDate) = 2026.', level: 'Medium' },
    { q: 'Why can too many indexes hurt?', a: 'Each INSERT/UPDATE/DELETE must update every affected index, increasing write time, locking and storage. They also lengthen maintenance and can confuse the optimizer.', level: 'Medium' },
    { q: 'What are statistics?', a: 'Histograms and density information about column values that the optimizer uses to estimate row counts. Outdated statistics cause bad plans; they are updated automatically or with UPDATE STATISTICS.', level: 'Medium' },
    { q: 'What do logical reads in STATISTICS IO mean?', a: 'The number of 8 KB pages read from the buffer cache. It is the best stable measure of query work when comparing alternatives.', level: 'Medium' },
    { q: 'Why does the composite index (City, Status) not help WHERE Status = \'Pending\'?', a: 'Index keys are sorted by City first; without a City predicate SQL Server cannot seek on Status (leftmost-prefix rule). It may scan the index instead.', level: 'Hard' },
    { q: 'What is parameter sniffing?', a: 'SQL Server compiles a cached plan using the first parameter values. If later values have very different row counts, the cached plan can be poor. Fixes include OPTION (RECOMPILE), OPTIMIZE FOR, or better indexing.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Rewrite these non-sargable predicates: (a) WHERE MONTH(JoinDate) = 3 AND YEAR(JoinDate) = 2026, (b) WHERE SUBSTRING(Email, 1, 4) = \'asha\', (c) WHERE Price + 100 > 1000.',
      hint: 'Move all functions/calculations to the constant side.',
      solution: `-- (a)
WHERE JoinDate >= '2026-03-01' AND JoinDate < '2026-04-01'
-- (b)
WHERE Email LIKE 'asha%'
-- (c)
WHERE Price > 900`,
    },
    {
      task: 'A query runs often: SELECT Name, Email FROM Customers WHERE City = @city ORDER BY Name. Design the best index.',
      hint: 'Key = WHERE column then ORDER BY column; INCLUDE the remaining selected column.',
      solution: `CREATE NONCLUSTERED INDEX IX_Customers_City_Name
ON Customers (City, Name)
INCLUDE (Email);
-- Seek on City, rows already sorted by Name (no Sort), Email included (no Key Lookup)`,
    },
    {
      task: 'In SSMS, compare logical reads of SELECT * FROM Orders WHERE OrderId = 50000 and SELECT * FROM Orders WHERE CustomerName = \'Customer50000\' on the 100,000-row table. Then add an index and compare again.',
      hint: 'SET STATISTICS IO ON; the first uses the clustered primary key; the second scans until you index CustomerName.',
      solution: `SET STATISTICS IO ON;
SELECT * FROM Orders WHERE OrderId = 50000;                    -- ~3 reads (Clustered Index Seek)
SELECT * FROM Orders WHERE CustomerName = 'Customer50000';     -- hundreds of reads (Scan)
CREATE INDEX IX_Orders_CustomerName ON Orders (CustomerName);
SELECT * FROM Orders WHERE CustomerName = 'Customer50000';     -- ~6 reads (Seek + Key Lookup)
SET STATISTICS IO OFF;`,
    },
    {
      task: 'Replace this check with a faster version: IF (SELECT COUNT(*) FROM Orders WHERE Status = \'Pending\') > 0 PRINT \'Work to do\';',
      hint: 'EXISTS stops at the first row.',
      solution: `IF EXISTS (SELECT 1 FROM Orders WHERE Status = 'Pending')
    PRINT 'Work to do';`,
    },
    {
      task: 'Write a keyset-pagination query that returns the next 20 orders after the last OrderId shown (@lastId) - faster than large OFFSET values.',
      hint: 'WHERE OrderId > @lastId ORDER BY OrderId with TOP or FETCH.',
      solution: `SELECT TOP (20) OrderId, CustomerName, Amount
FROM Orders
WHERE OrderId > @lastId
ORDER BY OrderId;`,
    },
  ],
  quiz: [
    {
      question: 'Which shortcut includes the ACTUAL execution plan in SSMS?',
      options: ['Ctrl+L', 'Ctrl+M', 'F5', 'Ctrl+K'],
      answer: 1,
      explanation: 'Ctrl+M toggles Include Actual Execution Plan; Ctrl+L shows the estimated plan.',
    },
    {
      question: 'Which WHERE clause is sargable for an index on OrderDate?',
      options: ['YEAR(OrderDate) = 2026', 'CONVERT(VARCHAR(10), OrderDate, 120) LIKE \'2026%\'', 'DATEADD(DAY, 1, OrderDate) > \'2026-01-01\'', 'OrderDate >= \'2026-01-01\' AND OrderDate < \'2027-01-01\''],
      answer: 3,
      explanation: 'Only the last keeps the column bare so an index seek is possible.',
    },
    {
      question: 'How many clustered indexes can a table have?',
      options: ['One', 'Two', '249', 'Unlimited'],
      answer: 0,
      explanation: 'The clustered index is the table\'s physical row order, so only one is possible.',
    },
    {
      question: 'What does INCLUDE (City, Amount) in CREATE INDEX do?',
      options: ['Makes City and Amount part of the sort key', 'Creates two extra indexes', 'Stores City and Amount at the leaf level so queries can be covered', 'Makes the index unique'],
      answer: 2,
      explanation: 'Included columns are stored in the leaf pages but are not key columns.',
    },
    {
      question: 'Which number from SET STATISTICS IO is best for comparing two query versions?',
      options: ['Elapsed time', 'Logical reads', 'Scan count', 'Parse time'],
      answer: 1,
      explanation: 'Logical reads measure work done and do not vary with cache warmth the way time does.',
    },
  ],
};
