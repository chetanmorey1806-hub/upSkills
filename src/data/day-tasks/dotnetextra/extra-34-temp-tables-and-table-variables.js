const DATA = `CREATE TABLE Orders (OrderId INT PRIMARY KEY, Customer NVARCHAR(50), Amount INT);
INSERT INTO Orders VALUES (1, 'Asha', 12000), (2, 'Ravi', 3000), (3, 'Asha', 9000), (4, 'Meera', 26000), (5, 'Ravi', 4500), (6, 'Kiran', 800);
CREATE TABLE Products (ProductId INT PRIMARY KEY, Name NVARCHAR(50), Stock INT, ReorderLevel INT);
INSERT INTO Products VALUES (1, 'Rice 5kg', 40, 20), (2, 'Sugar 1kg', 8, 15), (3, 'Tea 250g', 3, 10), (4, 'Salt 1kg', 25, 10), (5, 'Oil 1L', 12, 12);`;

export default {
  lesson: 'extra-34-temp-tables-and-table-variables',
  minutes: 30,
  intro: 'Store intermediate results in #temp tables (CREATE + INSERT or SELECT INTO) and know when a table variable fits better.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which name creates a **local** temporary table in SQL Server?',
      options: ['`@Totals`', '`#Totals`', '`##Totals`', '`temp.Totals`'],
      answer: 1,
      explain: '`#Name` is a local temp table, visible only to your session and dropped when the session (or the procedure that created it) ends. `##Name` is a global temp table visible to all sessions, and `@Name` is a table variable.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 7,
      q: `Create a temp table \`#CustTotals (Customer NVARCHAR(50), Total INT)\`, fill it with each customer's total order amount, then SELECT \`Customer\`, \`Total\` and a \`Tier\` column from it:
- 20000 or more → \`Gold\`
- 5000 to 19999 → \`Silver\`
- otherwise → \`Bronze\``,
      example: { title: 'CREATE + INSERT ... SELECT', code: `CREATE TABLE #CityCount (City NVARCHAR(50), Cnt INT);
INSERT INTO #CityCount SELECT City, COUNT(*) FROM Customers GROUP BY City;
SELECT * FROM #CityCount;` },
      setup: DATA,
      starter: 'CREATE TABLE #CustTotals (Customer NVARCHAR(50), Total INT);\n-- INSERT INTO #CustTotals SELECT ...\nSELECT Customer, Total FROM #CustTotals;\n',
      solution: "CREATE TABLE #CustTotals (Customer NVARCHAR(50), Total INT);\nINSERT INTO #CustTotals\nSELECT Customer, SUM(Amount) FROM Orders GROUP BY Customer;\nSELECT Customer, Total,\n       CASE WHEN Total >= 20000 THEN 'Gold'\n            WHEN Total >= 5000 THEN 'Silver'\n            ELSE 'Bronze' END AS Tier\nFROM #CustTotals;",
      explain: 'The temp table holds the grouped totals (Asha 21000, Ravi 7500, Meera 26000, Kiran 800) so the next statement can work on them like a normal table. Asha and Meera are Gold, Ravi Silver, Kiran Bronze.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 6,
      q: 'Use **SELECT ... INTO** to create `#Reorder` from products whose `Stock` is below `ReorderLevel`, with columns `Name` and `OrderQty` (= `ReorderLevel * 2 - Stock`). Then return `Name, OrderQty` from `#Reorder`.',
      example: { title: 'SELECT INTO creates the table', code: `SELECT Name, Marks INTO #Toppers FROM Students WHERE Marks >= 90;
SELECT * FROM #Toppers;` },
      setup: DATA,
      starter: '-- SELECT ... INTO #Reorder FROM Products WHERE ...\nSELECT Name, Stock AS OrderQty FROM Products;\n',
      solution: 'SELECT Name, ReorderLevel * 2 - Stock AS OrderQty\nINTO #Reorder\nFROM Products\nWHERE Stock < ReorderLevel;\n\nSELECT Name, OrderQty FROM #Reorder;',
      explain: '`SELECT ... INTO #Reorder` creates the table with the right columns automatically. Only Sugar (8 < 15 → 22) and Tea (3 < 10 → 17) qualify; Oil (12 = 12) is not below its level. INTO fails if the table already exists.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Declare a **table variable** \`@Top\` with columns \`Name NVARCHAR(50)\` and \`Marks INT\`:
\`______ @Top TABLE (Name NVARCHAR(50), Marks INT);\``,
      example: { title: 'scalar variable', code: 'DECLARE @Cutoff INT = 75;' },
      accept: ['DECLARE'],
      explain: 'Table variables are declared like other variables: `DECLARE @Top TABLE (...)`. They live only for the current batch/procedure. (The browser lab cannot run DECLARE; try it in SSMS.)',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements comparing **#temp tables** and **@table variables** are TRUE? Select all that apply.',
      options: ['Both are stored in tempdb', 'Temp tables have statistics and can get extra indexes later, so they suit large row counts', 'A ROLLBACK undoes rows inserted into a table variable', 'Table variables are scoped to the batch; #temp tables to the session/procedure', 'Table variables can be passed as table-valued parameters to procedures'],
      answers: [0, 1, 3, 4],
      explain: 'Both live in tempdb. #temp tables have statistics and support CREATE INDEX later, so they are better for big data. Table variables are batch-scoped, ideal for small sets and table-valued parameters, and are **not** affected by ROLLBACK (their rows stay).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the best practice when you are done with a large `#temp` table in a long script?',
      options: ['Nothing, it is dropped instantly anyway', '`DROP TABLE #Reorder;` (or `DROP TABLE IF EXISTS #Reorder;`) to free tempdb space early', '`DELETE FROM tempdb`', 'Restart SQL Server'],
      answer: 1,
      explain: 'Temp tables are dropped automatically when the session ends, but in a long script or connection-pooled app it is good practice to drop them as soon as you finish. `DROP TABLE IF EXISTS` (SQL Server 2016+) also makes the script re-runnable.',
    },
  ],
};
