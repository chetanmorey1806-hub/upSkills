const DATA = `CREATE TABLE Orders (OrderId INT PRIMARY KEY, CustomerId INT, OrderDate DATE, Amount INT, Status NVARCHAR(20));
INSERT INTO Orders VALUES
(1, 10, '2023-12-28', 1500, 'Delivered'), (2, 11, '2024-01-05', 2300, 'Delivered'), (3, 10, '2024-02-14', 800, 'Cancelled'),
(4, 12, '2024-03-01', 5400, 'Delivered'), (5, 13, '2024-03-18', 1200, 'Pending'), (6, 11, '2024-04-22', 3100, 'Delivered'),
(7, 14, '2024-06-30', 650, 'Delivered'), (8, 12, '2024-08-15', 9900, 'Delivered'), (9, 15, '2024-11-11', 4200, 'Pending'),
(10, 10, '2024-12-31', 2750, 'Delivered'), (11, 16, '2025-01-02', 1800, 'Delivered'), (12, 13, '2025-02-10', 600, 'Cancelled');
CREATE TABLE Customers (CustomerId INT PRIMARY KEY, Name NVARCHAR(50), City NVARCHAR(30));
INSERT INTO Customers VALUES (10, 'Asha', 'Pune'), (11, 'Ravi', 'Nagpur'), (12, 'Meera', 'Mumbai'), (13, 'Kiran', 'Pune'), (14, 'Zoya', 'Delhi'), (15, 'Imran', 'Indore'), (16, 'Pooja', 'Pune'), (17, 'Sunil', 'Nashik');`;

export default {
  lesson: 'extra-37-query-optimization-and-execution-plans',
  minutes: 30,
  intro: 'Write index-friendly (sargable) predicates, page results efficiently and read the key signals in an execution plan.',
  tasks: [
    {
      type: 'multi',
      mins: 3,
      q: 'There is an index on `Orders(OrderDate)` and one on `Customers(Name)`. Which WHERE clauses are **sargable** (can use an Index Seek)? Select all that apply.',
      options: ["`WHERE OrderDate >= '2024-01-01' AND OrderDate < '2025-01-01'`", '`WHERE YEAR(OrderDate) = 2024`', "`WHERE Name LIKE 'As%'`", "`WHERE Name LIKE '%sha'`", "`WHERE OrderDate = '2024-03-01'`"],
      answers: [0, 2, 4],
      explain: 'A predicate is sargable when the indexed column is left **bare**. Wrapping it in a function (`YEAR(OrderDate)`) or using a leading wildcard (`%sha`) forces SQL Server to evaluate every row (Index/Table Scan). A range or a prefix LIKE can seek.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Rewrite "orders placed in 2024" in a **sargable** way (no function on `OrderDate`): return `OrderId`, `OrderDate`, `Amount` for orders from 1 Jan 2024 up to (not including) 1 Jan 2025.',
      example: { title: 'half-open date range', code: `WHERE CreatedAt >= '2024-03-01' AND CreatedAt < '2024-04-01'   -- all of March` },
      setup: DATA,
      starter: '-- SELECT OrderId, OrderDate, Amount FROM Orders WHERE ... (no YEAR() please)\nSELECT OrderId, OrderDate, Amount FROM Orders WHERE 1 = 0;\n',
      solution: "SELECT OrderId, OrderDate, Amount\nFROM Orders\nWHERE OrderDate >= '2024-01-01' AND OrderDate < '2025-01-01';",
      explain: 'The half-open range `>= start AND < next start` returns the same 9 rows as `YEAR(OrderDate) = 2024`, but lets the optimizer seek the OrderDate index. It also works correctly for DATETIME values with a time part, unlike `BETWEEN \'2024-01-01\' AND \'2024-12-31\'`.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'The orders screen shows **5 orders per page**. Return **page 2** (`OrderId`, `Amount`) ordered by `OrderId`, using `OFFSET ... FETCH`.',
      example: { title: 'page 1', code: `SELECT OrderId, Amount FROM Orders
ORDER BY OrderId
OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY;` },
      setup: DATA,
      starter: 'SELECT OrderId, Amount FROM Orders\nORDER BY OrderId;\n',
      solution: 'SELECT OrderId, Amount FROM Orders\nORDER BY OrderId\nOFFSET 5 ROWS FETCH NEXT 5 ROWS ONLY;',
      ordered: true,
      explain: 'Page n skips `(n − 1) × pageSize` rows: page 2 → OFFSET 5. OFFSET/FETCH requires an ORDER BY. Returning only one page (instead of all rows) saves network, memory and time, which is how EF Core\'s `Skip(5).Take(5)` is translated.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Return `Name` and `City` of **Pune** customers who have at least one **Delivered** order. Use `EXISTS` (no JOIN + DISTINCT).',
      example: { title: 'EXISTS instead of JOIN + DISTINCT', code: `SELECT p.Name FROM Products p
WHERE EXISTS (SELECT 1 FROM Sales s WHERE s.ProductId = p.ProductId);` },
      setup: DATA,
      starter: "SELECT c.Name, c.City FROM Customers c WHERE c.City = 'Pune';\n",
      solution: "SELECT c.Name, c.City\nFROM Customers c\nWHERE c.City = 'Pune'\n  AND EXISTS (SELECT 1 FROM Orders o\n              WHERE o.CustomerId = c.CustomerId AND o.Status = 'Delivered');",
      explain: 'Asha and Pooja qualify; Kiran (Pune) only has Pending/Cancelled orders. A JOIN would return Asha twice (two delivered orders) and need DISTINCT, an extra sort. EXISTS stops at the first match per customer.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Make this a **covering index** so the query \`SELECT OrderDate, Amount FROM Orders WHERE CustomerId = 10\` never needs a Key Lookup. Complete the keyword:
\`CREATE NONCLUSTERED INDEX IX_Orders_Customer ON Orders(CustomerId) ______ (OrderDate, Amount);\``,
      example: { title: 'simple non-clustered index', code: 'CREATE NONCLUSTERED INDEX IX_Customers_City ON Customers(City);' },
      accept: ['INCLUDE'],
      explain: '`INCLUDE` stores extra columns in the index leaf level without making them part of the key. The query can then be answered from the index alone (Index Seek, no Key Lookup into the clustered index).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'In an actual execution plan you see a **Key Lookup** that runs 50,000 times next to an Index Seek. What does it usually mean?',
      options: ['The query is perfectly optimised', 'The non-clustered index finds the rows but lacks some selected columns, so each row is fetched from the clustered index; consider a covering index', 'The table has no primary key', 'Statistics are disabled'],
      answer: 1,
      explain: 'Each lookup jumps to the clustered index to fetch missing columns. Few lookups are fine; thousands are expensive. Add the columns with `INCLUDE`, select fewer columns, or let the optimizer choose a scan. `SET STATISTICS IO ON` shows the extra logical reads.',
    },
  ],
};
