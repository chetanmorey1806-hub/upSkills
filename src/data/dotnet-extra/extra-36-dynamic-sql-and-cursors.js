const ssmsOnly = (db) => [
  'Open SSMS and connect to your SQL Server instance (this script uses DECLARE/EXEC, which the in-app lab does not support)',
  'Click New Query (Ctrl+N) on the toolbar',
  `Paste the complete script below - it creates the ${db} database`,
  'Press F5 (Execute). Check the Results tab AND the Messages tab (PRINT output appears there)',
];

const q1 = `CREATE DATABASE DynamicSqlDB;
GO
USE DynamicSqlDB;
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Category NVARCHAR(30) NOT NULL,
    Price INT NOT NULL
);
INSERT INTO Products (Name, Category, Price) VALUES
('Laptop', 'Electronics', 55000), ('Mouse', 'Electronics', 500),
('Pen', 'Stationery', 20), ('Notebook', 'Stationery', 60);
GO
-- 1) Sort column and direction chosen at run time (validated against a whitelist)
DECLARE @SortColumn SYSNAME = N'Price';
DECLARE @SortDir NVARCHAR(4) = N'DESC';
IF @SortColumn NOT IN (N'Name', N'Price') OR @SortDir NOT IN (N'ASC', N'DESC')
    THROW 50001, 'Invalid sort option', 1;

DECLARE @sql NVARCHAR(MAX) =
    N'SELECT Name, Category, Price FROM dbo.Products ORDER BY '
    + QUOTENAME(@SortColumn) + N' ' + @SortDir + N';';
PRINT @sql;                         -- always print the SQL while learning/debugging
EXEC sp_executesql @sql;
GO
-- 2) Parameterized dynamic SQL: values travel as parameters, never concatenated
DECLARE @sql NVARCHAR(MAX) =
    N'SELECT Name, Price FROM dbo.Products
      WHERE Category = @cat AND Price <= @maxPrice ORDER BY Price;';
EXEC sp_executesql @sql,
     N'@cat NVARCHAR(30), @maxPrice INT',     -- parameter definitions
     @cat = N'Electronics', @maxPrice = 1000;  -- parameter values
GO
-- 3) Dynamic object name (e.g. yearly archive tables): always wrap in QUOTENAME
DECLARE @table SYSNAME = N'Products';
DECLARE @sql NVARCHAR(MAX) = N'SELECT COUNT(*) AS TotalRows FROM dbo.' + QUOTENAME(@table) + N';';
EXEC sp_executesql @sql;`;

const q2 = `CREATE DATABASE CursorDemoDB;
GO
USE CursorDemoDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Rating INT NOT NULL,
    Salary INT NOT NULL
);
INSERT INTO Employees (Name, Rating, Salary) VALUES
('Asha', 5, 80000), ('Ravi', 3, 50000), ('Meera', 4, 60000), ('Kiran', 2, 45000);
GO
DECLARE @EmpId INT, @Name NVARCHAR(50), @Rating INT, @Salary INT, @Hike INT;

-- 1) DECLARE the cursor for a SELECT
DECLARE emp_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT EmpId, Name, Rating, Salary FROM Employees ORDER BY EmpId;

-- 2) OPEN it and FETCH the first row into variables
OPEN emp_cursor;
FETCH NEXT FROM emp_cursor INTO @EmpId, @Name, @Rating, @Salary;

-- 3) Loop while the last FETCH succeeded
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @Hike = CASE WHEN @Rating = 5 THEN @Salary * 15 / 100
                     WHEN @Rating = 4 THEN @Salary * 10 / 100
                     WHEN @Rating = 3 THEN @Salary * 5 / 100
                     ELSE 0 END;

    UPDATE Employees SET Salary = Salary + @Hike WHERE EmpId = @EmpId;
    PRINT @Name + ': hike ' + CAST(@Hike AS VARCHAR(10));

    FETCH NEXT FROM emp_cursor INTO @EmpId, @Name, @Rating, @Salary;
END;

-- 4) CLOSE and DEALLOCATE to free resources
CLOSE emp_cursor;
DEALLOCATE emp_cursor;

SELECT EmpId, Name, Rating, Salary FROM Employees ORDER BY EmpId;`;

const q3 = `CREATE DATABASE PayrollSetBasedDB;
GO
USE PayrollSetBasedDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Rating INT NOT NULL,
    Salary INT NOT NULL
);
GO
INSERT INTO Employees (Name, Rating, Salary) VALUES
('Asha', 5, 80000), ('Ravi', 3, 50000), ('Meera', 4, 60000), ('Kiran', 2, 45000);
GO
-- The cursor in Example 2 updates one row at a time.
-- The same hike rule as ONE set-based UPDATE (faster, simpler):
UPDATE Employees
SET Salary = Salary + CASE
                        WHEN Rating = 5 THEN Salary * 15 / 100
                        WHEN Rating = 4 THEN Salary * 10 / 100
                        WHEN Rating = 3 THEN Salary * 5 / 100
                        ELSE 0
                     END;
GO
SELECT EmpId, Name, Rating, Salary FROM Employees ORDER BY EmpId;
-- A cursor that only prints rows can usually be replaced by one SELECT
SELECT 'Employee ' + Name + ' now earns ' + CAST(Salary AS VARCHAR(20)) AS Message
FROM Employees
ORDER BY EmpId;`;

const q4 = `CREATE DATABASE InjectionDemoDB;
GO
USE InjectionDemoDB;
GO
CREATE TABLE Customers (
    CustomerId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    City NVARCHAR(30) NOT NULL
);
INSERT INTO Customers (Name, City) VALUES ('Asha', 'Pune'), ('Ravi', 'Delhi'), ('Meera', 'Mumbai');
GO
-- Imagine this value came from a search box on a website
DECLARE @city NVARCHAR(100) = N'Pune'' OR 1=1 --';

-- BAD: user input concatenated into the SQL text
DECLARE @bad NVARCHAR(MAX) = N'SELECT Name, City FROM dbo.Customers WHERE City = ''' + @city + N'''';
PRINT @bad;
EXEC (@bad);                      -- returns EVERY customer!

-- GOOD: the same search with a parameter
EXEC sp_executesql
     N'SELECT Name, City FROM dbo.Customers WHERE City = @city',
     N'@city NVARCHAR(100)',
     @city = @city;               -- returns 0 rows: the whole text is just a value`;

export default {
  id: 'extra-36-dynamic-sql-and-cursors',
  title: 'Dynamic SQL and Cursor Basics',
  module: 'Extra: SQL Server',
  extraNo: 36,
  level: 'Advanced',
  duration: '2 hours',
  summary: `Dynamic SQL builds a T-SQL statement as a string and executes it at run time - useful for user-selected sort columns, optional search filters and dynamic table names, but dangerous if user input is concatenated (SQL injection). Cursors process a result set one row at a time. Learn EXEC vs sp_executesql, QUOTENAME and parameters, the cursor life cycle (DECLARE, OPEN, FETCH, @@FETCH_STATUS, CLOSE, DEALLOCATE), and why set-based SQL should replace most cursors.`,
  objectives: [
    'Build and run dynamic SQL with EXEC and sp_executesql',
    'Prevent SQL injection with parameters, QUOTENAME and whitelists',
    'Write a cursor using DECLARE, OPEN, FETCH NEXT, WHILE @@FETCH_STATUS = 0, CLOSE and DEALLOCATE',
    'Choose cursor options (LOCAL, FAST_FORWARD, STATIC) and know their cost',
    'Rewrite row-by-row cursor logic as a single set-based statement',
  ],
  theory: [
    {
      heading: 'What is dynamic SQL?',
      content: `**Dynamic SQL** is SQL text built in a variable and executed at run time. Normal (static) SQL cannot use a variable for a column name, table name or ORDER BY direction - dynamic SQL can.

Typical uses:
- Search screens with **optional filters** (add "AND City = @city" only when a city is chosen)
- **User-selected sorting** (ORDER BY [Price] DESC)
- **Dynamic object names** (archive tables per year, maintenance scripts looping over all tables)
- **Dynamic PIVOT** when the column list comes from data

Two ways to run it:
- **EXEC (@sql)** - simple, but cannot take parameters, so values must be concatenated (risky) and each different text gets its own cached plan.
- **EXEC sp_executesql @sql, N'@p1 type, ...', @p1 = value** - supports **parameters**, plan reuse and is the recommended way.

Note: DECLARE, EXEC and IF are not supported by the in-app SSMS Lab - run these scripts in real SSMS.`,
      syntax: `DECLARE @sql NVARCHAR(MAX) = N'SELECT * FROM dbo.Products WHERE Price <= @max';
EXEC sp_executesql @sql, N'@max INT', @max = 1000;`,
    },
    {
      heading: 'SQL injection and how to prevent it',
      content: `**SQL injection** happens when user input becomes part of the SQL text. Input like  Pune' OR 1=1 --  closes the string, adds a condition that is always true and comments out the rest, so the attacker sees all rows - or worse, runs DROP TABLE.

Defences:
1. **Parameters** for values (sp_executesql in T-SQL; SqlParameter / EF Core / Dapper in C#). Parameters are never executed as code.
2. **QUOTENAME(name)** for object/column names - wraps them in [ ] and escapes ]: QUOTENAME('Products') = [Products].
3. **Whitelists**: allow only known column names and ASC/DESC.
4. **Least privilege**: the application login should not be db_owner (see the security topic).
5. Never trust input from URLs, forms, cookies or files.

In EF Core, FromSqlInterpolated / FromSql with $"... {value}" creates parameters automatically; FromSqlRaw with string concatenation does not.`,
      syntax: `-- WRONG
SET @sql = N'SELECT * FROM Customers WHERE City = ''' + @city + '''';
-- RIGHT
EXEC sp_executesql N'SELECT * FROM Customers WHERE City = @city',
                   N'@city NVARCHAR(50)', @city = @city;`,
    },
    {
      heading: 'Cursors: processing rows one by one',
      content: `A **cursor** is a pointer that walks through a result set row by row, like a foreach loop in C#.

Life cycle:
1. **DECLARE** name CURSOR [options] FOR SELECT ...
2. **OPEN** name - runs the query
3. **FETCH NEXT FROM** name **INTO** @variables - reads one row
4. **WHILE @@FETCH_STATUS = 0** - loop while the last fetch succeeded (0 = success, -1 = no more rows, -2 = row missing)
5. Process the row, then FETCH NEXT again at the end of the loop
6. **CLOSE** name - releases the result set and locks
7. **DEALLOCATE** name - removes the cursor definition

Common options: **LOCAL** (scope = batch/procedure), **FAST_FORWARD** (forward-only, read-only - fastest), **STATIC** (works on a tempdb copy), **SCROLL** (allows FETCH PRIOR/FIRST/LAST/ABSOLUTE n), **FOR UPDATE** (allows UPDATE ... WHERE CURRENT OF).`,
      syntax: `DECLARE c CURSOR LOCAL FAST_FORWARD FOR SELECT Name FROM Students;
OPEN c;
FETCH NEXT FROM c INTO @name;
WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT @name;
    FETCH NEXT FROM c INTO @name;
END;
CLOSE c;
DEALLOCATE c;`,
    },
    {
      heading: 'Why avoid cursors: think in sets',
      content: `SQL Server is optimized for **set-based** operations: one UPDATE for 1 million rows is typically hundreds of times faster than a cursor that runs 1 million single-row UPDATEs (each with its own logging, locking and round trip inside the engine).

Cursor replacements:
| Cursor task | Set-based alternative |
|---|---|
| Update each row with a rule | UPDATE ... SET col = CASE ... END |
| Running total | SUM() OVER (ORDER BY ... ROWS UNBOUNDED PRECEDING) |
| Copy rows to another table | INSERT INTO ... SELECT |
| Rank / number rows | ROW_NUMBER(), RANK() |
| Build a comma list | STRING_AGG(Name, ', ') |

When a cursor (or WHILE loop) **is** reasonable: calling a stored procedure once per row, sending one email per row, running DDL/maintenance per database or table, or processing large data in small batches to avoid long locks.`,
      tip: `If you must use a cursor, declare it LOCAL FAST_FORWARD, select only the columns you need, and always CLOSE and DEALLOCATE it (use TRY...CATCH to clean up on errors).`,
    },
  ],
  examples: [
    {
      title: 'Dynamic SQL with sp_executesql, QUOTENAME and parameters (SSMS)',
      scenario: 'A product listing page lets the user choose the sort column and direction, filter by category and maximum price, and an admin script counts rows of a table chosen at run time.',
      steps: ssmsOnly('DynamicSqlDB'),
      code: q1,
      result: `Messages tab:
SELECT Name, Category, Price FROM dbo.Products ORDER BY [Price] DESC;

Result 1:
Name      Category     Price
Laptop    Electronics  55000
Mouse     Electronics  500
Notebook  Stationery   60
Pen       Stationery   20

Result 2:
Name   Price
Mouse  500

Result 3:
TotalRows
4`,
      explanation: `The sort column and direction are checked against a whitelist (THROW stops the batch if they are invalid), the column name is wrapped with QUOTENAME and the final SQL is printed so you can see exactly what runs. In part 2 the category and price are real parameters: sp_executesql receives the SQL, the parameter definition string and the values, so the plan is cached and injection is impossible. Part 3 shows a dynamic table name - names cannot be parameters, so QUOTENAME is essential.`,
    },
    {
      title: 'Cursor: salary hike row by row (SSMS)',
      scenario: 'Give each employee a hike based on rating (5 = 15 percent, 4 = 10 percent, 3 = 5 percent) by looping through employees with a cursor and printing a message per employee.',
      steps: ssmsOnly('CursorDemoDB'),
      code: q2,
      result: `Messages tab:
Asha: hike 12000
Ravi: hike 2500
Meera: hike 6000
Kiran: hike 0

Results tab:
EmpId  Name   Rating  Salary
1      Asha   5       92000
2      Ravi   3       52500
3      Meera  4       66000
4      Kiran  2       45000`,
      explanation: `The cursor fetches one employee at a time into variables. Inside the loop the hike is calculated (80000 x 15 / 100 = 12000, 50000 x 5 / 100 = 2500, 60000 x 10 / 100 = 6000, rating 2 gets 0), one UPDATE runs per row and PRINT writes to the Messages tab. The final FETCH inside the loop moves to the next row; when no rows remain @@FETCH_STATUS becomes -1 and the loop ends. CLOSE and DEALLOCATE free the cursor.`,
    },
    {
      title: 'The same hike as one set-based UPDATE (runs in the lab)',
      scenario: 'Replace the cursor from Example 2 with a single UPDATE using CASE, and replace the PRINT loop with one SELECT.',
      steps: [
        'Open SSMS (or the in-app SSMS Lab) and click New Query (Ctrl+N)',
        'Paste the script - it creates PayrollSetBasedDB with the same four employees',
        'Press F5 (Execute)',
        'Compare the salaries with the cursor result from Example 2 - they are identical',
      ],
      code: q3,
      tsql: q3,
      result: `+-------+-------+--------+--------+
| EmpId | Name  | Rating | Salary |
+-------+-------+--------+--------+
| 1     | Asha  | 5      | 92000  |
| 2     | Ravi  | 3      | 52500  |
| 3     | Meera | 4      | 66000  |
| 4     | Kiran | 2      | 45000  |
+-------+-------+--------+--------+
4 row(s) returned

+--------------------------------+
| Message                        |
+--------------------------------+
| Employee Asha now earns 92000  |
| Employee Ravi now earns 52500  |
| Employee Meera now earns 66000 |
| Employee Kiran now earns 45000 |
+--------------------------------+
4 row(s) returned`,
      explanation: `One UPDATE statement processes all rows at once: the CASE expression calculates each row's hike from its own Rating and Salary. The result is exactly the same as the cursor, but the engine does one scan and one logged operation instead of four separate updates - on a million rows the difference is huge. The message list is produced by a single SELECT that concatenates text with CAST, instead of PRINT inside a loop.`,
    },
    {
      title: 'SQL injection demo: concatenation vs parameters (SSMS)',
      scenario: 'A search box sends the city typed by the user. See how a malicious value returns all customers when concatenated, and nothing when passed as a parameter.',
      steps: ssmsOnly('InjectionDemoDB'),
      code: q4,
      result: `Messages tab:
SELECT Name, City FROM dbo.Customers WHERE City = 'Pune' OR 1=1 --'

Result 1 (EXEC with concatenation):
Name   City
Asha   Pune
Ravi   Delhi
Meera  Mumbai

Result 2 (sp_executesql with parameter):
Name   City
(0 rows)`,
      explanation: `The input contains a quote that closes the string, "OR 1=1" which is always true, and "--" which comments out the trailing quote. With concatenation the attacker's text becomes part of the query, so every customer is returned. With sp_executesql the entire input is treated as one value: no city is literally named "Pune' OR 1=1 --", so 0 rows come back. The same rule applies in C#: always use parameters (SqlParameter, EF Core, Dapper).`,
    },
  ],
  interview: [
    { q: 'What is dynamic SQL?', a: 'SQL text built as a string at run time and executed with EXEC or sp_executesql. It allows variable table/column names, dynamic sorting and optional filters.', level: 'Easy' },
    { q: 'Difference between EXEC and sp_executesql?', a: 'EXEC (@sql) runs a string with no parameters. sp_executesql accepts typed parameters (and OUTPUT parameters), which prevents injection for values and allows plan reuse.', level: 'Medium' },
    { q: 'What is SQL injection?', a: 'An attack where user input is concatenated into SQL text and changes the query logic, e.g. "x\' OR 1=1 --". It can leak, change or delete data.', level: 'Easy' },
    { q: 'How do you prevent SQL injection in dynamic SQL?', a: 'Pass values as sp_executesql parameters, wrap object names with QUOTENAME, validate names against a whitelist, and run the app with least-privilege permissions.', level: 'Medium' },
    { q: 'What does QUOTENAME do?', a: 'Returns the name wrapped in brackets with any closing bracket escaped, e.g. QUOTENAME(\'Order Details\') = [Order Details]. It makes a dynamic identifier safe.', level: 'Medium' },
    { q: 'What is a cursor?', a: 'A database object that lets you process a query result one row at a time using DECLARE, OPEN, FETCH, CLOSE and DEALLOCATE.', level: 'Easy' },
    { q: 'What does @@FETCH_STATUS return?', a: '0 when the last FETCH succeeded, -1 when it failed or went beyond the result set, -2 when the fetched row is missing (deleted).', level: 'Medium' },
    { q: 'Why are cursors considered slow?', a: 'They process rows one at a time with separate operations, locking and logging per row, while SQL Server is optimized for set-based operations that handle many rows in one statement.', level: 'Medium' },
    { q: 'Difference between CLOSE and DEALLOCATE?', a: 'CLOSE releases the current result set and locks but keeps the definition (you can OPEN again). DEALLOCATE removes the cursor completely.', level: 'Easy' },
    { q: 'What is a FAST_FORWARD cursor?', a: 'A forward-only, read-only cursor with performance optimizations - the best option when you just need to read rows in order.', level: 'Medium' },
    { q: 'When is a cursor acceptable?', a: 'For row-by-row actions that cannot be set-based: calling a procedure per row, sending emails, running maintenance or DDL per object, or batching huge updates to limit locks.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a dynamic search on Products where @Category and @MaxPrice are optional (NULL means "no filter"). Use sp_executesql with parameters.',
      hint: 'Start with N\'SELECT ... WHERE 1 = 1\' and append " AND Category = @cat" only when @Category IS NOT NULL.',
      solution: `DECLARE @Category NVARCHAR(30) = N'Stationery', @MaxPrice INT = NULL;
DECLARE @sql NVARCHAR(MAX) = N'SELECT Name, Category, Price FROM dbo.Products WHERE 1 = 1';
IF @Category IS NOT NULL SET @sql += N' AND Category = @cat';
IF @MaxPrice IS NOT NULL SET @sql += N' AND Price <= @max';
SET @sql += N' ORDER BY Price;';
EXEC sp_executesql @sql, N'@cat NVARCHAR(30), @max INT', @cat = @Category, @max = @MaxPrice;`,
    },
    {
      task: 'Write a cursor that prints "Product: <Name> costs <Price>" for every product ordered by price.',
      hint: 'DECLARE a LOCAL FAST_FORWARD cursor, FETCH into @name and @price, PRINT with CAST.',
      solution: `DECLARE @name NVARCHAR(50), @price INT;
DECLARE p CURSOR LOCAL FAST_FORWARD FOR SELECT Name, Price FROM Products ORDER BY Price;
OPEN p;
FETCH NEXT FROM p INTO @name, @price;
WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT 'Product: ' + @name + ' costs ' + CAST(@price AS VARCHAR(10));
    FETCH NEXT FROM p INTO @name, @price;
END;
CLOSE p;
DEALLOCATE p;`,
    },
    {
      task: 'Rewrite the previous cursor as one SELECT that returns the same messages.',
      hint: 'Concatenate in the SELECT list.',
      solution: `SELECT 'Product: ' + Name + ' costs ' + CAST(Price AS VARCHAR(10)) AS Message
FROM Products
ORDER BY Price;`,
    },
    {
      task: 'Write a maintenance script that prints the row count of every user table in the current database using dynamic SQL and a cursor over sys.tables.',
      hint: 'Cursor over SELECT name FROM sys.tables; build N\'SELECT COUNT(*) FROM \' + QUOTENAME(@t).',
      solution: `DECLARE @t SYSNAME, @sql NVARCHAR(MAX), @cnt INT;
DECLARE tc CURSOR LOCAL FAST_FORWARD FOR SELECT name FROM sys.tables ORDER BY name;
OPEN tc;
FETCH NEXT FROM tc INTO @t;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = N'SELECT @c = COUNT(*) FROM dbo.' + QUOTENAME(@t);
    EXEC sp_executesql @sql, N'@c INT OUTPUT', @c = @cnt OUTPUT;
    PRINT @t + ': ' + CAST(@cnt AS VARCHAR(20));
    FETCH NEXT FROM tc INTO @t;
END;
CLOSE tc;
DEALLOCATE tc;`,
    },
  ],
  quiz: [
    {
      question: 'Which way of running dynamic SQL supports typed parameters?',
      options: ['EXEC (@sql)', 'PRINT @sql', 'sp_executesql', 'GO @sql'],
      answer: 2,
      explanation: 'sp_executesql accepts a parameter definition string and parameter values.',
    },
    {
      question: 'What does QUOTENAME(\'Products\') return?',
      options: ['[Products]', '\'Products\'', '"Products"', 'dbo.Products'],
      answer: 0,
      explanation: 'QUOTENAME wraps an identifier in square brackets by default.',
    },
    {
      question: 'What value of @@FETCH_STATUS means the fetch succeeded?',
      options: ['1', '-1', '-2', '0'],
      answer: 3,
      explanation: '0 means success; -1 means no more rows.',
    },
    {
      question: 'Which statement removes a cursor definition completely?',
      options: ['CLOSE', 'DEALLOCATE', 'DROP CURSOR', 'END'],
      answer: 1,
      explanation: 'CLOSE releases the result set; DEALLOCATE removes the cursor.',
    },
    {
      question: 'What is usually the best replacement for a cursor that updates every row using a rule?',
      options: ['A WHILE loop', 'A trigger', 'A single UPDATE with a CASE expression', 'Dynamic SQL'],
      answer: 2,
      explanation: 'Set-based UPDATE ... CASE processes all rows in one efficient statement.',
    },
  ],
};
