const procCode = `USE InventoryDB;
GO
CREATE OR ALTER PROCEDURE dbo.usp_PlaceOrder
    @ProductId INT,
    @Quantity  INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;            -- any error rolls back the whole transaction

    BEGIN TRY
        BEGIN TRAN;

        DECLARE @Stock INT;
        SELECT @Stock = Stock FROM Products WITH (UPDLOCK) WHERE ProductId = @ProductId;

        IF @Stock IS NULL
            THROW 50001, 'Product not found.', 1;

        IF @Stock < @Quantity
            THROW 50002, 'Insufficient stock.', 1;

        INSERT INTO Orders (ProductId, Quantity, OrderDate)
        VALUES (@ProductId, @Quantity, CAST(GETDATE() AS DATE));

        UPDATE Products SET Stock = Stock - @Quantity WHERE ProductId = @ProductId;

        COMMIT;
        SELECT 'Order placed' AS Status, SCOPE_IDENTITY() AS OrderId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT 'Order failed' AS Status, ERROR_NUMBER() AS ErrorNo, ERROR_MESSAGE() AS Reason;
    END CATCH
END
GO

EXEC dbo.usp_PlaceOrder @ProductId = 3, @Quantity = 4;    -- Monitor stock 10
EXEC dbo.usp_PlaceOrder @ProductId = 3, @Quantity = 25;   -- only 6 left
SELECT ProductName, Stock FROM Products WHERE ProductId = 3;`;

const trgCode = `USE InventoryDB;
GO
CREATE TABLE StockAudit (
    AuditId   INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    OldStock  INT NOT NULL,
    NewStock  INT NOT NULL,
    ChangedOn DATETIME NOT NULL DEFAULT GETDATE()
);
GO
-- 1) AFTER INSERT trigger: every new order reduces stock automatically
CREATE OR ALTER TRIGGER trg_Orders_AfterInsert
ON Orders
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE p
    SET p.Stock = p.Stock - i.Quantity
    FROM Products p
    INNER JOIN inserted i ON p.ProductId = i.ProductId;
END
GO
-- 2) AFTER UPDATE trigger: audit every stock change (deleted = old values, inserted = new values)
CREATE OR ALTER TRIGGER trg_Products_StockAudit
ON Products
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(Stock)
        INSERT INTO StockAudit (ProductId, OldStock, NewStock)
        SELECT d.ProductId, d.Stock, i.Stock
        FROM deleted d
        INNER JOIN inserted i ON d.ProductId = i.ProductId
        WHERE d.Stock <> i.Stock;
END
GO

INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (2, 3, '2026-11-17');
SELECT ProductId, ProductName, Stock FROM Products WHERE ProductId = 2;
SELECT AuditId, ProductId, OldStock, NewStock, ChangedOn FROM StockAudit;`;

export default {
  id: 'day-050-triggers-transactions-indexes-normalization',
  title: 'Triggers, Transactions, COMMIT, ROLLBACK, Indexes and Normalization',
  module: 'SQL Server & Database Management',
  day: 50,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Finish the SQL Server module with the features that keep real systems correct and fast: transactions (ACID, BEGIN TRAN, COMMIT, ROLLBACK, TRY/CATCH), triggers (AFTER/INSTEAD OF, inserted/deleted tables), indexes (clustered, non-clustered, unique) and normalization (1NF, 2NF, 3NF). Build a safe stock update transaction.',
  objectives: [
    'Explain ACID and use BEGIN TRAN, COMMIT and ROLLBACK for a stock update',
    'Write AFTER triggers using the inserted and deleted tables',
    'Create clustered, non-clustered and unique indexes and know when they help',
    'Normalize a table design to 1NF, 2NF and 3NF',
  ],
  theory: [
    {
      heading: 'Transactions and ACID',
      content: 'A transaction is a unit of work where all statements succeed together or none of them do. Example: placing an order must insert the order AND reduce stock - if one fails, both must be undone. SQL Server guarantees the ACID properties.',
      points: [
        'Atomicity - all or nothing',
        'Consistency - data moves from one valid state to another (constraints are respected)',
        'Isolation - concurrent transactions do not see each other\'s half-finished work',
        'Durability - once committed, changes survive a crash (written to the transaction log)',
        'BEGIN TRAN starts; COMMIT saves; ROLLBACK undoes; SAVE TRAN name creates a savepoint',
        '@@TRANCOUNT shows how many transactions are open in your session',
      ],
      syntax: `BEGIN TRAN;
INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (3, 4, '2026-11-17');
UPDATE Products SET Stock = Stock - 4 WHERE ProductId = 3;
COMMIT;      -- or ROLLBACK;`,
    },
    {
      heading: 'Error Handling with TRY...CATCH and XACT_ABORT',
      content: 'By default, many errors (like a CHECK violation) end only the failing statement - the transaction stays open and earlier statements are NOT undone automatically. Professional code uses BEGIN TRY / BEGIN CATCH with ROLLBACK in the CATCH block, and SET XACT_ABORT ON so any runtime error rolls back the entire transaction.',
      syntax: `SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRAN;
    -- statements
    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;            -- re-raise the error to the caller
END CATCH`,
      points: ['ERROR_NUMBER(), ERROR_MESSAGE(), ERROR_LINE() are available inside CATCH', 'Isolation levels: READ UNCOMMITTED, READ COMMITTED (default), REPEATABLE READ, SERIALIZABLE, SNAPSHOT', 'Keep transactions short - they hold locks that block other users'],
    },
    {
      heading: 'Triggers',
      content: 'A trigger is special code that runs automatically when an INSERT, UPDATE or DELETE happens on a table (DML trigger), or when CREATE/ALTER/DROP happens (DDL trigger). Inside a DML trigger two virtual tables are available: inserted (new rows) and deleted (old rows). An UPDATE fills both.',
      points: [
        'AFTER (FOR) trigger: runs after the statement succeeded - used for auditing, maintaining summary/stock columns',
        'INSTEAD OF trigger: runs instead of the statement - used on views or for soft delete',
        'Triggers fire once per STATEMENT, not per row - always write set-based code with JOIN inserted',
        'The trigger is part of the same transaction - ROLLBACK inside a trigger undoes the original statement too',
        'SSMS: Tables > dbo.Orders > Triggers folder; DISABLE TRIGGER trg_Name ON Orders; DROP TRIGGER trg_Name;',
        'Use sparingly: hidden logic makes debugging harder; prefer stored procedures/application code when possible',
      ],
    },
    {
      heading: 'Indexes',
      content: 'An index is like the index at the back of a book: instead of reading every page (table scan), SQL Server jumps directly to matching rows (index seek). Indexes speed up SELECT, JOIN, WHERE and ORDER BY but slow down INSERT/UPDATE/DELETE slightly and use disk space.',
      syntax: `CREATE CLUSTERED INDEX CIX_Orders_Date ON Orders (OrderDate);          -- only one per table
CREATE NONCLUSTERED INDEX IX_Orders_ProductId ON Orders (ProductId);
CREATE UNIQUE INDEX UX_Products_Name ON Products (ProductName);
CREATE INDEX IX_Orders_Product_Date ON Orders (ProductId, OrderDate) INCLUDE (Quantity);  -- composite + covering
DROP INDEX IX_Orders_ProductId ON Orders;`,
      points: [
        'Clustered index: sorts and stores the table rows themselves; one per table; the PRIMARY KEY creates it by default',
        'Non-clustered index: separate structure with key values + pointer to the row; up to 999 per table',
        'Index columns used in WHERE, JOIN and ORDER BY, and foreign key columns',
        'Do not index small tables or columns with few distinct values (e.g. Gender)',
        'Check usage with the Actual Execution Plan (Ctrl+M in SSMS, then F5): look for Index Seek vs Table/Clustered Index Scan',
      ],
    },
    {
      heading: 'Normalization: 1NF, 2NF, 3NF',
      content: 'Normalization organises tables to remove duplicate data and update anomalies. Example of a bad design: one Enrollment sheet with StudentName, City, CourseName, Trainer, and "Courses = .NET, SQL" in one cell. If a trainer changes, many rows must be updated (update anomaly); deleting the last student of a course loses the trainer info (delete anomaly).',
      points: [
        '1NF: each cell holds one atomic value, no repeating groups (no "C#, SQL" in one column), each row unique (has a key)',
        '2NF: 1NF + every non-key column depends on the WHOLE primary key (no partial dependency on part of a composite key) - move CourseName/Trainer out of Enrollments(StudentId, CourseId)',
        '3NF: 2NF + no transitive dependency (non-key column depending on another non-key column) - e.g. Trainer depends on Course, not on Student',
        'BCNF: a stricter 3NF - every determinant is a candidate key',
        'Result: Students, Courses, Enrollments(StudentId, CourseId) linked by keys',
        'Denormalization: deliberately adding redundancy for reporting speed (data warehouses, Power BI star schemas)',
      ],
      tip: 'Mnemonic: every non-key column must depend on "the key (1NF), the whole key (2NF), and nothing but the key (3NF)".',
    },
  ],
  examples: [
    {
      title: 'Stock update transaction with COMMIT',
      scenario: 'Day 50 practical: a customer buys 4 monitors. Insert the order and reduce stock together as one transaction.',
      steps: [
        'Open SSMS > New Query (Ctrl+N)',
        'Type the script (creates InventoryDB with a CHECK (Stock >= 0) rule)',
        'Press F5',
        'Monitor stock goes from 10 to 6 and the order is saved',
      ],
      code: `CREATE DATABASE InventoryDB;
GO
USE InventoryDB;
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL CHECK (Stock >= 0)
);
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(ProductId),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    OrderDate DATE NOT NULL
);
GO
INSERT INTO Products (ProductName, Price, Stock) VALUES
('Keyboard', 799, 50), ('Mouse', 349, 100), ('Monitor', 8999, 10);
GO
BEGIN TRAN;
INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (3, 4, '2026-11-17');
UPDATE Products SET Stock = Stock - 4 WHERE ProductId = 3;
COMMIT;
GO
SELECT ProductId, ProductName, Stock FROM Products ORDER BY ProductId;
SELECT * FROM Orders;`,
      tsql: `CREATE DATABASE InventoryDB;
GO
USE InventoryDB;
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL CHECK (Stock >= 0)
);
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(ProductId),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    OrderDate DATE NOT NULL
);
GO
INSERT INTO Products (ProductName, Price, Stock) VALUES
('Keyboard', 799, 50), ('Mouse', 349, 100), ('Monitor', 8999, 10);
GO
BEGIN TRAN;
INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (3, 4, '2026-11-17');
UPDATE Products SET Stock = Stock - 4 WHERE ProductId = 3;
COMMIT;
GO
SELECT ProductId, ProductName, Stock FROM Products ORDER BY ProductId;
SELECT * FROM Orders;`,
      result: `>> CREATE DATABASE InventoryDB -> Commands completed successfully.
>> USE InventoryDB -> Commands completed successfully.
>> CREATE TABLE Products ( -> Commands completed successfully.
>> CREATE TABLE Orders ( -> Commands completed successfully.
>> INSERT INTO Products (ProductName, Price, Stock) VALUES -> (3 rows affected)
>> BEGIN TRAN -> Commands completed successfully.
>> INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (3, 4, '202 -> (1 row affected)
>> UPDATE Products SET Stock = Stock - 4 WHERE ProductId = 3 -> (1 row affected)
>> COMMIT -> Commands completed successfully.
>> SELECT ProductId, ProductName, Stock FROM Products ORDER BY ProductId
+-----------+-------------+-------+
| ProductId | ProductName | Stock |
+-----------+-------------+-------+
| 1         | Keyboard    | 50    |
| 2         | Mouse       | 100   |
| 3         | Monitor     | 6     |
+-----------+-------------+-------+
3 row(s) returned
>> SELECT * FROM Orders
+---------+-----------+----------+------------+
| OrderId | ProductId | Quantity | OrderDate  |
+---------+-----------+----------+------------+
| 1       | 3         | 4        | 2026-11-17 |
+---------+-----------+----------+------------+
1 row(s) returned`,
      explanation: 'Both statements are inside BEGIN TRAN ... COMMIT, so they are saved together. If the server crashed between the INSERT and the UPDATE, recovery would undo the INSERT because the transaction was not committed.',
    },
    {
      title: 'Insufficient stock - ROLLBACK',
      scenario: 'A customer tries to buy 25 monitors, but only 10 are in stock. The UPDATE violates CHECK (Stock >= 0), so the whole order is rolled back.',
      steps: ['New Query, type the script, press F5', 'Read the red CHECK error in Messages, then confirm that stock is still 10 and no order was saved'],
      code: `CREATE DATABASE InventoryDB;
GO
USE InventoryDB;
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL CHECK (Stock >= 0)
);
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(ProductId),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    OrderDate DATE NOT NULL
);
GO
INSERT INTO Products (ProductName, Price, Stock) VALUES
('Keyboard', 799, 50), ('Mouse', 349, 100), ('Monitor', 8999, 10);
GO
BEGIN TRAN;
INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (3, 25, '2026-11-17');
UPDATE Products SET Stock = Stock - 25 WHERE ProductId = 3;
ROLLBACK;
GO
SELECT ProductId, ProductName, Stock FROM Products WHERE ProductId = 3;
SELECT COUNT(*) AS OrdersSaved FROM Orders;`,
      tsql: `CREATE DATABASE InventoryDB;
GO
USE InventoryDB;
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL CHECK (Stock >= 0)
);
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(ProductId),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    OrderDate DATE NOT NULL
);
GO
INSERT INTO Products (ProductName, Price, Stock) VALUES
('Keyboard', 799, 50), ('Mouse', 349, 100), ('Monitor', 8999, 10);
GO
BEGIN TRAN;
INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (3, 25, '2026-11-17');
UPDATE Products SET Stock = Stock - 25 WHERE ProductId = 3;
ROLLBACK;
GO
SELECT ProductId, ProductName, Stock FROM Products WHERE ProductId = 3;
SELECT COUNT(*) AS OrdersSaved FROM Orders;`,
      result: `>> CREATE DATABASE InventoryDB -> Commands completed successfully.
>> USE InventoryDB -> Commands completed successfully.
>> CREATE TABLE Products ( -> Commands completed successfully.
>> CREATE TABLE Orders ( -> Commands completed successfully.
>> INSERT INTO Products (ProductName, Price, Stock) VALUES -> (3 rows affected)
>> BEGIN TRAN -> Commands completed successfully.
>> INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (3, 25, '20 -> (1 row affected)
>> UPDATE Products SET Stock = Stock - 25 WHERE ProductId = 3 -> ERROR: Msg 547, Level 16, State 0, Line 1
The statement conflicted with the CHECK constraint.
>> ROLLBACK -> Commands completed successfully.
>> SELECT ProductId, ProductName, Stock FROM Products WHERE ProductId = 3
+-----------+-------------+-------+
| ProductId | ProductName | Stock |
+-----------+-------------+-------+
| 3         | Monitor     | 10    |
+-----------+-------------+-------+
1 row(s) returned
>> SELECT COUNT(*) AS OrdersSaved FROM Orders
+-------------+
| OrdersSaved |
+-------------+
| 0           |
+-------------+
1 row(s) returned`,
      explanation: 'The INSERT succeeded, but the UPDATE failed. Because SQL Server does not automatically undo the INSERT (XACT_ABORT is OFF by default), we must ROLLBACK - afterwards the order count is 0 and stock is unchanged. In real code, put the ROLLBACK in a CATCH block (next examples).',
    },
    {
      title: 'Stored procedure: safe order placement with TRY/CATCH',
      scenario: 'Production-quality version of the stock transaction that an ASP.NET Core API would call.',
      steps: [
        'Start from a fresh InventoryDB (run the first part of example 1 without the order, so Monitor stock is 10)',
        'New Query, type the script below',
        'Highlight the CREATE OR ALTER PROCEDURE part up to GO and press F5',
        'Highlight the two EXEC lines and the SELECT and press F5 - three result grids appear',
      ],
      code: procCode,
      result: `Status        OrderId
------------  -------
Order placed  1

Status        ErrorNo  Reason
------------  -------  -------------------
Order failed  50002    Insufficient stock.

ProductName  Stock
-----------  -----
Monitor      6`,
      explanation: 'The first call passes the stock check, inserts the order and commits (10 -> 6). The second call finds 6 < 25, THROWs 50002, the CATCH block rolls back and returns the reason. UPDLOCK stops two users from buying the last items at the same time. SCOPE_IDENTITY() returns DECIMAL, shown as 1.',
    },
    {
      title: 'Triggers: auto stock reduction and audit log',
      scenario: 'Whenever an order is inserted, reduce stock automatically and record every stock change in an audit table.',
      steps: [
        'Use a fresh InventoryDB from example 1 (before any orders: Mouse stock 100)',
        'New Query, type the script below and press F5',
        'Object Explorer: Tables > dbo.Orders > Triggers and dbo.Products > Triggers show the two triggers',
        'Notice: the INSERT on Orders fired trg_Orders_AfterInsert, whose UPDATE on Products fired trg_Products_StockAudit (nested trigger)',
      ],
      code: trgCode,
      result: `(1 row affected)

ProductId  ProductName  Stock
---------  -----------  -----
2          Mouse        97

AuditId  ProductId  OldStock  NewStock  ChangedOn
-------  ---------  --------  --------  -----------------------
1        2          100       97        2026-11-17 10:42:15.237

(ChangedOn shows your current date and time)`,
      explanation: 'inserted contains the new order row (Quantity 3); the trigger joins it to Products and subtracts. The audit trigger compares deleted (old Stock 100) with inserted (new Stock 97). Because both triggers are set-based, a multi-row INSERT of orders also works. Triggers are not supported in the in-app lab - run this in SSMS.',
    },
    {
      title: 'Creating indexes',
      scenario: 'Orders are searched by ProductId constantly, and product names must be unique.',
      steps: [
        'New Query, type the script, press F5',
        'Object Explorer: Tables > dbo.Orders > Indexes shows IX_Orders_ProductId and the clustered PK index',
        'In real SSMS press Ctrl+M (Include Actual Execution Plan) and run the final SELECT - on a large table the plan shows an Index Seek on IX_Orders_ProductId',
      ],
      code: `CREATE DATABASE InventoryDB;
GO
USE InventoryDB;
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL CHECK (Stock >= 0)
);
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(ProductId),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    OrderDate DATE NOT NULL
);
GO
INSERT INTO Products (ProductName, Price, Stock) VALUES
('Keyboard', 799, 50), ('Mouse', 349, 100), ('Monitor', 8999, 10);
GO
CREATE INDEX IX_Orders_ProductId ON Orders (ProductId);
GO
CREATE UNIQUE INDEX UX_Products_Name ON Products (ProductName);
GO
INSERT INTO Products (ProductName, Price, Stock) VALUES ('Mouse', 299, 5);
GO
INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (1, 2, '2026-11-15'), (2, 5, '2026-11-16'), (1, 1, '2026-11-17');
GO
SELECT o.OrderId, p.ProductName, o.Quantity
FROM Orders o JOIN Products p ON p.ProductId = o.ProductId
WHERE o.ProductId = 1
ORDER BY o.OrderId;`,
      tsql: `CREATE DATABASE InventoryDB;
GO
USE InventoryDB;
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL CHECK (Stock >= 0)
);
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(ProductId),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    OrderDate DATE NOT NULL
);
GO
INSERT INTO Products (ProductName, Price, Stock) VALUES
('Keyboard', 799, 50), ('Mouse', 349, 100), ('Monitor', 8999, 10);
GO
CREATE INDEX IX_Orders_ProductId ON Orders (ProductId);
GO
CREATE UNIQUE INDEX UX_Products_Name ON Products (ProductName);
GO
INSERT INTO Products (ProductName, Price, Stock) VALUES ('Mouse', 299, 5);
GO
INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (1, 2, '2026-11-15'), (2, 5, '2026-11-16'), (1, 1, '2026-11-17');
GO
SELECT o.OrderId, p.ProductName, o.Quantity
FROM Orders o JOIN Products p ON p.ProductId = o.ProductId
WHERE o.ProductId = 1
ORDER BY o.OrderId;`,
      result: `>> CREATE DATABASE InventoryDB -> Commands completed successfully.
>> USE InventoryDB -> Commands completed successfully.
>> CREATE TABLE Products ( -> Commands completed successfully.
>> CREATE TABLE Orders ( -> Commands completed successfully.
>> INSERT INTO Products (ProductName, Price, Stock) VALUES -> (3 rows affected)
>> CREATE INDEX IX_Orders_ProductId ON Orders (ProductId) -> Commands completed successfully.
>> CREATE UNIQUE INDEX UX_Products_Name ON Products (ProductName) -> Commands completed successfully.
>> INSERT INTO Products (ProductName, Price, Stock) VALUES ('Mouse', 299, -> ERROR: Msg 2627, Level 14, State 1, Line 1
Violation of PRIMARY KEY / UNIQUE KEY constraint. Cannot insert duplicate key. Products.ProductName
>> INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (1, 2, '202 -> (3 rows affected)
>> SELECT o.OrderId, p.ProductName, o.Quantity
+---------+-------------+----------+
| OrderId | ProductName | Quantity |
+---------+-------------+----------+
| 1       | Keyboard    | 2        |
| 3       | Keyboard    | 1        |
+---------+-------------+----------+
2 row(s) returned`,
      explanation: 'The non-clustered index on ProductId speeds up WHERE o.ProductId = 1 and the join. The unique index rejects a second "Mouse". Real SQL Server reports this as Msg 2601: "Cannot insert duplicate key row in object \'dbo.Products\' with unique index \'UX_Products_Name\'. The duplicate key value is (Mouse)."',
    },
    {
      title: 'Normalized design (3NF): Students, Courses, Enrollments',
      scenario: 'Replace a flat sheet (StudentName, City, "Courses: .NET, SQL", Trainer...) with three normalized tables, then change a trainer in ONE place.',
      steps: ['New Query, type the script, press F5', 'Notice that updating one row in Courses changes the trainer for every enrolled student'],
      code: `CREATE DATABASE SchoolDB;
GO
USE SchoolDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL UNIQUE,
    Trainer NVARCHAR(50) NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(50) NOT NULL,
    City NVARCHAR(30)
);
CREATE TABLE Enrollments (
    StudentId INT NOT NULL FOREIGN KEY REFERENCES Students(StudentId),
    CourseId INT NOT NULL FOREIGN KEY REFERENCES Courses(CourseId),
    PRIMARY KEY (StudentId, CourseId)
);
GO
INSERT INTO Courses (CourseName, Trainer) VALUES ('.NET', 'Mr. Rao'), ('SQL', 'Ms. Iyer'), ('React', 'Mr. Khan');
INSERT INTO Students (FullName, City) VALUES ('Asha', 'Pune'), ('Ravi', 'Mumbai');
INSERT INTO Enrollments (StudentId, CourseId) VALUES (1, 1), (1, 2), (2, 2), (2, 3);
GO
UPDATE Courses SET Trainer = 'Ms. Kapoor' WHERE CourseName = 'SQL';
GO
SELECT s.FullName, c.CourseName, c.Trainer
FROM Enrollments e
JOIN Students s ON s.StudentId = e.StudentId
JOIN Courses c ON c.CourseId = e.CourseId
ORDER BY s.FullName, c.CourseName;`,
      tsql: `CREATE DATABASE SchoolDB;
GO
USE SchoolDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL UNIQUE,
    Trainer NVARCHAR(50) NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(50) NOT NULL,
    City NVARCHAR(30)
);
CREATE TABLE Enrollments (
    StudentId INT NOT NULL FOREIGN KEY REFERENCES Students(StudentId),
    CourseId INT NOT NULL FOREIGN KEY REFERENCES Courses(CourseId),
    PRIMARY KEY (StudentId, CourseId)
);
GO
INSERT INTO Courses (CourseName, Trainer) VALUES ('.NET', 'Mr. Rao'), ('SQL', 'Ms. Iyer'), ('React', 'Mr. Khan');
INSERT INTO Students (FullName, City) VALUES ('Asha', 'Pune'), ('Ravi', 'Mumbai');
INSERT INTO Enrollments (StudentId, CourseId) VALUES (1, 1), (1, 2), (2, 2), (2, 3);
GO
UPDATE Courses SET Trainer = 'Ms. Kapoor' WHERE CourseName = 'SQL';
GO
SELECT s.FullName, c.CourseName, c.Trainer
FROM Enrollments e
JOIN Students s ON s.StudentId = e.StudentId
JOIN Courses c ON c.CourseId = e.CourseId
ORDER BY s.FullName, c.CourseName;`,
      result: `>> CREATE DATABASE SchoolDB -> Commands completed successfully.
>> USE SchoolDB -> Commands completed successfully.
>> CREATE TABLE Courses ( -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> CREATE TABLE Enrollments ( -> Commands completed successfully.
>> INSERT INTO Courses (CourseName, Trainer) VALUES ('.NET', 'Mr. Rao'),  -> (3 rows affected)
>> INSERT INTO Students (FullName, City) VALUES ('Asha', 'Pune'), ('Ravi' -> (2 rows affected)
>> INSERT INTO Enrollments (StudentId, CourseId) VALUES (1, 1), (1, 2), ( -> (4 rows affected)
>> UPDATE Courses SET Trainer = 'Ms. Kapoor' WHERE CourseName = 'SQL' -> (1 row affected)
>> SELECT s.FullName, c.CourseName, c.Trainer
+----------+------------+------------+
| FullName | CourseName | Trainer    |
+----------+------------+------------+
| Asha     | .NET       | Mr. Rao    |
| Asha     | SQL        | Ms. Kapoor |
| Ravi     | React      | Mr. Khan   |
| Ravi     | SQL        | Ms. Kapoor |
+----------+------------+------------+
4 row(s) returned`,
      explanation: '1NF: one course per Enrollments row. 2NF: Enrollments has only its composite key - CourseName/Trainer moved to Courses. 3NF: Trainer depends on the course, so it lives in Courses, not with students. Updating the SQL trainer touched 1 row instead of every student row; the JOIN rebuilds the original "flat" view.',
    },
  ],
  interview: [
    { q: 'What are the ACID properties?', a: 'Atomicity (all or nothing), Consistency (valid state to valid state), Isolation (concurrent transactions do not interfere), Durability (committed changes survive failures).', level: 'Easy' },
    { q: 'Does a failed statement inside BEGIN TRAN roll back the whole transaction automatically?', a: 'Not by default - most errors only abort the statement and the transaction stays open. Use TRY/CATCH with ROLLBACK, or SET XACT_ABORT ON to roll back on any runtime error.', level: 'Hard' },
    { q: 'What are the inserted and deleted tables?', a: 'Virtual tables available inside DML triggers. inserted holds new rows (INSERT/UPDATE), deleted holds old rows (DELETE/UPDATE).', level: 'Medium' },
    { q: 'AFTER vs INSTEAD OF trigger?', a: 'AFTER runs after the statement succeeds (table only). INSTEAD OF replaces the statement and can be defined on views - used to make complex views updatable or implement soft deletes.', level: 'Medium' },
    { q: 'Does a trigger fire once per row?', a: 'No, once per statement. A multi-row INSERT fires the trigger once with all rows in inserted, so trigger code must be set-based.', level: 'Hard' },
    { q: 'Clustered vs non-clustered index?', a: 'Clustered index defines the physical order of rows (the table IS the index); only one per table. Non-clustered is a separate structure with keys and row locators; many per table.', level: 'Medium' },
    { q: 'Why not index every column?', a: 'Each index slows INSERT/UPDATE/DELETE, consumes storage and memory, and must be maintained. Index columns used for filtering, joining and sorting.', level: 'Medium' },
    { q: 'What is a covering index?', a: 'An index that contains all columns a query needs (key + INCLUDE columns), so SQL Server does not need to look up the base table (no Key Lookup).', level: 'Hard' },
    { q: 'Explain 1NF, 2NF and 3NF.', a: '1NF: atomic values, no repeating groups. 2NF: 1NF and no partial dependency on part of a composite key. 3NF: 2NF and no transitive dependency between non-key columns.', level: 'Medium' },
    { q: 'What is denormalization and when is it used?', a: 'Intentionally adding redundant data to reduce joins - used in reporting/data warehouse (star schema) systems where read speed matters more than update cost.', level: 'Medium' },
    { q: 'What is the default isolation level in SQL Server?', a: 'READ COMMITTED - a transaction cannot read uncommitted changes of others (no dirty reads).', level: 'Medium' },
    { q: 'What is a deadlock?', a: 'Two transactions each hold a lock the other needs; SQL Server detects it and kills one (error 1205, the deadlock victim). Prevent with short transactions and accessing tables in the same order.', level: 'Hard' },
  ],
  practice: [
    { task: 'Write a transaction that moves 10 units of stock from Keyboard (Id 1) to Mouse (Id 2) and commits.', hint: 'Two UPDATEs inside BEGIN TRAN ... COMMIT', solution: `BEGIN TRAN;
UPDATE Products SET Stock = Stock - 10 WHERE ProductId = 1;
UPDATE Products SET Stock = Stock + 10 WHERE ProductId = 2;
COMMIT;
SELECT ProductName, Stock FROM Products;   -- Keyboard 40, Mouse 110` },
    { task: 'Write a script that deletes all Orders inside a transaction, shows the count, then rolls back.', hint: 'BEGIN TRAN / ROLLBACK', solution: `BEGIN TRAN;
DELETE FROM Orders;
SELECT COUNT(*) AS Remaining FROM Orders;   -- 0
ROLLBACK;
SELECT COUNT(*) AS Restored FROM Orders;` },
    { task: 'Create an INSTEAD OF DELETE trigger on Products that marks IsDeleted = 1 instead of deleting (soft delete).', hint: 'ALTER TABLE add IsDeleted BIT DEFAULT 0; UPDATE ... FROM deleted', solution: `ALTER TABLE Products ADD IsDeleted BIT NOT NULL DEFAULT 0;
GO
CREATE OR ALTER TRIGGER trg_Products_SoftDelete ON Products
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE p SET IsDeleted = 1
    FROM Products p JOIN deleted d ON p.ProductId = d.ProductId;
END
GO
DELETE FROM Products WHERE ProductId = 1;
SELECT ProductId, ProductName, IsDeleted FROM Products;` },
    { task: 'Create a composite non-clustered index on Orders(ProductId, OrderDate) including Quantity, then drop it.', hint: 'INCLUDE clause', solution: `CREATE NONCLUSTERED INDEX IX_Orders_Product_Date ON Orders (ProductId, OrderDate) INCLUDE (Quantity);
DROP INDEX IX_Orders_Product_Date ON Orders;` },
    { task: 'Normalize this sheet to 3NF: OrderNo, OrderDate, CustomerName, CustomerPhone, ProductName, ProductPrice, Qty (one row per product per order).', hint: 'Customers, Products, Orders, OrderItems', solution: `Customers(CustomerId PK, CustomerName, CustomerPhone)
Products(ProductId PK, ProductName, ProductPrice)
Orders(OrderNo PK, OrderDate, CustomerId FK)
OrderItems(OrderNo FK, ProductId FK, Qty, PRIMARY KEY (OrderNo, ProductId))` },
  ],
  quiz: [
    { question: 'Which command permanently saves the changes of a transaction?', options: ['SAVE TRAN', 'ROLLBACK', 'COMMIT', 'END TRAN'], answer: 2, explanation: 'COMMIT makes the changes durable.' },
    { question: 'Inside an AFTER UPDATE trigger, the old values are in:', options: ['deleted', 'inserted', 'old', 'updated'], answer: 0, explanation: 'deleted holds the before-image; inserted holds the after-image.' },
    { question: 'How many clustered indexes can a table have?', options: ['Unlimited', '999', 'Two', 'One'], answer: 3, explanation: 'The clustered index is the physical order of the table, so only one.' },
    { question: 'A table storing "C#, SQL, React" in one Courses column violates:', options: ['3NF', '1NF', '2NF', 'BCNF only'], answer: 1, explanation: '1NF requires atomic values.' },
    { question: 'The "I" in ACID stands for:', options: ['Integrity', 'Indexing', 'Isolation', 'Identity'], answer: 2, explanation: 'Isolation - concurrent transactions do not see each other\'s uncommitted work.' },
  ],
};
