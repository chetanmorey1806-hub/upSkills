const shopScript = `CREATE DATABASE ShopDB;
GO
USE ShopDB;
GO
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL CHECK (Stock >= 0)
);
CREATE TABLE Orders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    Quantity INT NOT NULL,
    OrderDate DATE NOT NULL
);
INSERT INTO Products (Name, Price, Stock) VALUES
('Notebook', 45.00, 100),
('Pen Pack', 120.00, 20),
('School Bag', 899.00, 5);
GO
-- Order 1: 2 school bags -> both statements succeed -> COMMIT
BEGIN TRAN;
INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (3, 2, '2025-06-10');
UPDATE Products SET Stock = Stock - 2 WHERE Id = 3;
COMMIT;
GO
-- Order 2: 50 pen packs but only 20 in stock -> CHECK fails -> ROLLBACK undoes the INSERT too
BEGIN TRAN;
INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (2, 50, '2025-06-10');
UPDATE Products SET Stock = Stock - 50 WHERE Id = 2;
ROLLBACK;
GO
SELECT Id, Name, Price, Stock FROM Products ORDER BY Id;
SELECT Id, ProductId, Quantity FROM Orders ORDER BY Id;`;

const txCode = `using System.Data;
using Microsoft.Data.SqlClient;

const string connStr =
    "Server=localhost;Database=ShopDB;Trusted_Connection=True;TrustServerCertificate=True";

await PlaceOrderAsync(productId: 1, qty: 10);    // enough stock
await PlaceOrderAsync(productId: 2, qty: 50);    // only 20 pen packs
await PrintStockAsync();

async Task PlaceOrderAsync(int productId, int qty)
{
    await using var conn = new SqlConnection(connStr);
    await conn.OpenAsync();
    // every command that should be part of the transaction must get this tx object
    await using var tx = (SqlTransaction)await conn.BeginTransactionAsync();
    try
    {
        await using var insert = new SqlCommand(
            "INSERT INTO Orders (ProductId, Quantity, OrderDate) VALUES (@p, @q, CAST(GETDATE() AS DATE))",
            conn, tx);
        insert.Parameters.Add("@p", SqlDbType.Int).Value = productId;
        insert.Parameters.Add("@q", SqlDbType.Int).Value = qty;
        await insert.ExecuteNonQueryAsync();

        // "AND Stock >= @q" protects us: 0 rows updated means not enough stock
        await using var update = new SqlCommand(
            "UPDATE Products SET Stock = Stock - @q WHERE Id = @p AND Stock >= @q", conn, tx);
        update.Parameters.Add("@p", SqlDbType.Int).Value = productId;
        update.Parameters.Add("@q", SqlDbType.Int).Value = qty;
        int rows = await update.ExecuteNonQueryAsync();
        if (rows == 0)
            throw new InvalidOperationException($"Not enough stock for product {productId}");

        await tx.CommitAsync();
        Console.WriteLine($"Product {productId} x{qty}: COMMITTED");
    }
    catch (Exception ex)
    {
        await tx.RollbackAsync();                 // the INSERT above is undone as well
        Console.WriteLine($"Product {productId} x{qty}: ROLLED BACK ({ex.Message})");
    }
}

async Task PrintStockAsync()
{
    await using var conn = new SqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new SqlCommand("SELECT Name, Stock FROM Products ORDER BY Id", conn);
    await using var r = await cmd.ExecuteReaderAsync();
    while (await r.ReadAsync())
        Console.WriteLine($"{r.GetString(0),-10} stock {r.GetInt32(1)}");
}`;

const procCode = `-- ===== 1. Create the stored procedure in SSMS (ShopDB) =====
CREATE OR ALTER PROCEDURE dbo.usp_PlaceOrder
    @ProductId INT,
    @Quantity  INT,
    @OrderId   INT OUTPUT,
    @Message   NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @stock INT = (SELECT Stock FROM Products WHERE Id = @ProductId);

    IF @stock IS NULL
    BEGIN
        SELECT @OrderId = 0, @Message = N'Product not found';
        RETURN 1;
    END
    IF @stock < @Quantity
    BEGIN
        SELECT @OrderId = 0, @Message = CONCAT(N'Only ', @stock, N' in stock');
        RETURN 2;
    END

    BEGIN TRAN;
        INSERT INTO Orders (ProductId, Quantity, OrderDate)
        VALUES (@ProductId, @Quantity, CAST(GETDATE() AS DATE));
        SET @OrderId = SCOPE_IDENTITY();
        UPDATE Products SET Stock = Stock - @Quantity WHERE Id = @ProductId;
    COMMIT;

    SET @Message = N'Order placed';
    RETURN 0;
END
GO

// ===== 2. Program.cs: call it from C# =====
using System.Data;
using Microsoft.Data.SqlClient;

const string connStr =
    "Server=localhost;Database=ShopDB;Trusted_Connection=True;TrustServerCertificate=True";

await CallAsync(3, 1);     // 1 school bag
await CallAsync(3, 10);    // too many
await CallAsync(99, 1);    // no such product

async Task CallAsync(int productId, int qty)
{
    await using var conn = new SqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new SqlCommand("dbo.usp_PlaceOrder", conn)
    {
        CommandType = CommandType.StoredProcedure      // the text is a procedure NAME, not SQL
    };
    cmd.Parameters.Add("@ProductId", SqlDbType.Int).Value = productId;
    cmd.Parameters.Add("@Quantity", SqlDbType.Int).Value = qty;

    var orderId = cmd.Parameters.Add("@OrderId", SqlDbType.Int);
    orderId.Direction = ParameterDirection.Output;
    var message = cmd.Parameters.Add("@Message", SqlDbType.NVarChar, 200);   // size is REQUIRED for output strings
    message.Direction = ParameterDirection.Output;
    var returnCode = cmd.Parameters.Add("@ReturnValue", SqlDbType.Int);
    returnCode.Direction = ParameterDirection.ReturnValue;

    await cmd.ExecuteNonQueryAsync();     // output values are filled AFTER execution

    Console.WriteLine($"Return={returnCode.Value}, OrderId={orderId.Value}, Message={message.Value}");
}`;

const dataTableCode = `using System;
using System.Data;
using System.Linq;

// A DataTable is an in-memory table. SqlDataAdapter.Fill() creates one like this from a query.
var table = new DataTable("Students");
table.Columns.Add("Id", typeof(int));
table.Columns.Add("Name", typeof(string));
table.Columns.Add("Marks", typeof(int));
table.PrimaryKey = new[] { table.Columns["Id"]! };

table.Rows.Add(1, "Asha", 82);
table.Rows.Add(2, "Ravi", 67);
table.Rows.Add(3, "Neha", 91);
table.AcceptChanges();               // all rows are now "Unchanged", like right after Fill()

table.Rows.Find(2)!["Marks"] = 72;   // edit Ravi
table.Rows.Add(4, "Kiran", 58);      // new student
table.Rows.Find(1)!.Delete();        // mark Asha as deleted (still in the collection!)

foreach (DataRow row in table.Rows)
{
    // a deleted row only has its Original version
    var version = row.RowState == DataRowState.Deleted ? DataRowVersion.Original : DataRowVersion.Current;
    Console.WriteLine($"Id {row["Id", version]}: {row.RowState}");
}

DataRow ravi = table.Rows.Find(2)!;
Console.WriteLine($"Ravi: {ravi["Marks", DataRowVersion.Original]} -> {ravi["Marks"]}");
Console.WriteLine($"Pending changes: {table.GetChanges()!.Rows.Count}");

DataRow[] passed = table.Select("Marks >= 60", "Marks DESC");    // filter + sort, skips deleted rows
Console.WriteLine("Passed: " + string.Join(", ", passed.Select(r => $"{r["Name"]} {r["Marks"]}")));

table.AcceptChanges();               // what SqlDataAdapter.Update() does after saving
Console.WriteLine($"Rows after AcceptChanges: {table.Rows.Count}");`;

const adapterCode = `using System.Data;
using Microsoft.Data.SqlClient;

const string connStr =
    "Server=localhost;Database=ShopDB;Trusted_Connection=True;TrustServerCertificate=True";

using var conn = new SqlConnection(connStr);   // Fill/Update open and close it for us

// 1. Fill a DataSet with TWO tables (disconnected: the connection closes after Fill)
var adapter = new SqlDataAdapter("SELECT Id, Name, Price, Stock FROM Products", conn);
var builder = new SqlCommandBuilder(adapter);  // generates INSERT/UPDATE/DELETE commands from the SELECT
var ds = new DataSet("Shop");
adapter.Fill(ds, "Products");
new SqlDataAdapter("SELECT Id, ProductId, Quantity FROM Orders", conn).Fill(ds, "Orders");

Console.WriteLine($"Tables: {ds.Tables.Count}, products: {ds.Tables["Products"]!.Rows.Count}, orders: {ds.Tables["Orders"]!.Rows.Count}");

// 2. Relation between the tables (in memory, like a foreign key)
ds.Relations.Add("ProductOrders",
    ds.Tables["Products"]!.Columns["Id"]!, ds.Tables["Orders"]!.Columns["ProductId"]!);
foreach (DataRow p in ds.Tables["Products"]!.Rows)
    Console.WriteLine($"{p["Name"],-10} orders: {p.GetChildRows("ProductOrders").Length}");

// 3. Work offline: increase all prices by 10 percent and add a product
foreach (DataRow p in ds.Tables["Products"]!.Rows)
    p["Price"] = Math.Round((decimal)p["Price"] * 1.10m, 2);
ds.Tables["Products"]!.Rows.Add(null, "Geometry Box", 150.00m, 30);

// 4. Push ALL changes back in one call: 3 UPDATEs + 1 INSERT
int saved = adapter.Update(ds, "Products");
Console.WriteLine($"Rows saved to SQL Server: {saved}");`;

const poolCode = `using Microsoft.Data.SqlClient;

// A tiny pool so the problem shows up quickly
const string connStr = "Server=localhost;Database=ShopDB;Trusted_Connection=True;" +
                       "TrustServerCertificate=True;Max Pool Size=5;Connect Timeout=3";

// ---- 1. CORRECT: open, use, dispose -> the same pooled connection is reused ----
for (int i = 1; i <= 50; i++)
{
    using var conn = new SqlConnection(connStr);
    conn.Open();                         // takes a connection from the pool (fast after the first)
}                                        // Dispose returns it to the pool
Console.WriteLine("50 open/close cycles OK with a pool of 5");

// ---- 2. BUG: connections are opened but never closed -> pool exhausted ----
var leaked = new List<SqlConnection>();
try
{
    for (int i = 1; i <= 6; i++)
    {
        var conn = new SqlConnection(connStr);
        conn.Open();                     // no using, no Close()
        leaked.Add(conn);
        Console.WriteLine($"Leaked connection {i} opened");
    }
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"ERROR: {ex.Message}");
}
finally
{
    foreach (var c in leaked) c.Dispose();
    SqlConnection.ClearAllPools();
}`;

export default {
  id: 'day-02-ado-net-transactions-procs-dataset',
  title: 'ADO.NET Advanced: Transactions, Stored Procedures, DataSet and Connection Pooling',
  module: 'Module 1: Data Access – ADO.NET & Dapper',
  day: 2,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    'Make several SQL statements succeed or fail together with SqlTransaction, call stored procedures with input, output and return values, work offline with DataTable, DataSet and SqlDataAdapter, and understand how connection pooling keeps ADO.NET fast - and how a connection leak brings an app down.',
  objectives: [
    'Use SqlTransaction to commit or roll back a group of commands (ACID)',
    'Call a stored procedure with CommandType.StoredProcedure and read output parameters and return values',
    'Explain DataTable, DataSet, DataRow states and SqlDataAdapter Fill/Update',
    'Explain connection pooling, its settings and how connection leaks happen',
  ],
  theory: [
    {
      heading: 'Transactions and SqlTransaction',
      content:
        'A transaction groups several statements into one unit of work: either all of them are saved (COMMIT) or none of them are (ROLLBACK). Classic examples: a bank transfer (debit one account, credit another) and placing a shop order (insert the order, reduce stock). Transactions follow ACID: Atomicity (all or nothing), Consistency (rules like CHECK constraints stay true), Isolation (other users do not see half-finished work) and Durability (committed data survives a crash). In ADO.NET you start a transaction on an open connection, pass the transaction object to every SqlCommand, then call Commit or Rollback.',
      syntax: `await using var conn = new SqlConnection(connStr);
await conn.OpenAsync();
await using var tx = (SqlTransaction)await conn.BeginTransactionAsync();
try
{
    var cmd1 = new SqlCommand(sql1, conn, tx);     // pass tx!
    var cmd2 = new SqlCommand(sql2, conn, tx);
    await cmd1.ExecuteNonQueryAsync();
    await cmd2.ExecuteNonQueryAsync();
    await tx.CommitAsync();
}
catch
{
    await tx.RollbackAsync();
    throw;
}`,
      points: [
        'Forgetting to pass tx to a command throws: "ExecuteNonQuery requires the command to have a transaction when the connection assigned to the command is in a pending local transaction"',
        'If a transaction is disposed without Commit, it is rolled back automatically',
        'Isolation level: conn.BeginTransaction(IsolationLevel.ReadCommitted) is the SQL Server default; Serializable is strictest, Snapshot avoids blocking readers',
        'Keep transactions SHORT: they hold locks that block other users',
        'TransactionScope (System.Transactions) is another option that makes any connection opened inside it join the transaction',
      ],
    },
    {
      heading: 'Stored procedures from C#',
      content:
        'A stored procedure is SQL code saved in the database with a name and parameters. Companies use them for security (the app login can only EXEC procedures, not touch tables), for reuse across apps and for complex logic close to the data. From ADO.NET set CommandText to the procedure name and CommandType = CommandType.StoredProcedure. Input parameters work as usual. For output parameters set Direction = ParameterDirection.Output (and a size for strings); their values are available only after the command has executed (and after the reader is closed, if you used one). The integer from RETURN is read with a parameter whose Direction is ReturnValue.',
      syntax: `var cmd = new SqlCommand("dbo.usp_PlaceOrder", conn) { CommandType = CommandType.StoredProcedure };
cmd.Parameters.Add("@ProductId", SqlDbType.Int).Value = 3;
var outId = cmd.Parameters.Add("@OrderId", SqlDbType.Int);
outId.Direction = ParameterDirection.Output;
var ret = cmd.Parameters.Add("@ReturnValue", SqlDbType.Int);
ret.Direction = ParameterDirection.ReturnValue;
await cmd.ExecuteNonQueryAsync();
int newId = (int)outId.Value;`,
      points: [
        'Procedures that SELECT rows: use ExecuteReader as usual',
        'SET NOCOUNT ON inside the procedure stops "n rows affected" messages (ExecuteNonQuery then returns -1)',
        'ParameterDirection: Input (default), Output, InputOutput, ReturnValue',
      ],
    },
    {
      heading: 'DataTable, DataSet and SqlDataAdapter (disconnected model)',
      content:
        'The connected model (SqlDataReader) reads rows while the connection is open. The disconnected model loads data into memory and closes the connection: a DataTable is an in-memory table with columns, rows, constraints and a primary key; a DataSet is a collection of DataTables plus DataRelations between them. SqlDataAdapter is the bridge: Fill() runs the SELECT, fills the DataTable and closes the connection; Update() looks at every row\'s RowState and runs INSERT, UPDATE or DELETE for changed rows. SqlCommandBuilder can generate those commands automatically for a simple single-table SELECT that includes the primary key.',
      points: [
        'DataRowState: Added, Modified, Deleted, Unchanged, Detached',
        'Each row keeps Original and Current versions; AcceptChanges() makes Current the new Original and all rows Unchanged',
        'DataTable.Select("Marks >= 60", "Marks DESC") filters and sorts in memory; DataView adds filtering for UI binding',
        'Still common in WinForms apps, reports, Excel export, legacy code and SqlBulkCopy (it can copy a DataTable)',
        'For modern Web APIs prefer a reader, Dapper or EF Core with typed classes - DataSets are heavy and untyped',
      ],
    },
    {
      heading: 'Connection pooling',
      content:
        'Opening a real TCP connection and logging in to SQL Server is slow (tens of milliseconds). So SqlClient keeps a pool of already-open connections. conn.Open() takes one from the pool and conn.Close()/Dispose() puts it back instead of closing it. A separate pool is created for every distinct connection string (even a different space or order creates a new pool) and per Windows identity with Integrated Security. That is why "open late, close early, always dispose" is cheap and correct.',
      points: [
        'Pooling=true (default), Min Pool Size=0, Max Pool Size=100, Connection Lifetime / Load Balance Timeout',
        'If all connections are in use, Open() waits up to Connect Timeout seconds, then throws InvalidOperationException "Timeout expired... obtaining a connection from the pool"',
        'Cause of that error is almost always a leak: a connection or reader not disposed, often in an exception path',
        'Monitor with SQL Server: SELECT COUNT(*) FROM sys.dm_exec_sessions WHERE program_name LIKE \'%SqlClient%\'',
        'SqlConnection.ClearPool(conn) / ClearAllPools() drops pooled connections (e.g. after a failover)',
      ],
      tip: 'Interview line: "Connection pooling is per connection string and per process. Disposing a connection does not close the physical connection - it returns it to the pool."',
    },
  ],
  examples: [
    {
      title: 'ShopDB and transactions in T-SQL (COMMIT vs ROLLBACK)',
      scenario:
        'Create the ShopDB database used today. Then place two orders inside transactions: the first succeeds, the second tries to sell 50 pen packs when only 20 exist, so the CHECK constraint fails and the whole order is rolled back.',
      steps: [
        'Open SSMS (or the in-app SSMS Lab), click New Query, paste the script and press F5',
        'Read the Messages tab: one statement fails with Msg 547 (CHECK constraint)',
        'Look at the final two SELECTs: the failed order left no trace',
      ],
      code: shopScript,
      tsql: shopScript,
      result: `(3 rows affected)
(1 row affected)
(1 row affected)
(1 row affected)
Msg 547, Level 16: The UPDATE statement conflicted with the CHECK constraint.
+----+------------+-------+-------+
| Id | Name       | Price | Stock |
+----+------------+-------+-------+
| 1  | Notebook   | 45    | 100   |
| 2  | Pen Pack   | 120   | 20    |
| 3  | School Bag | 899   | 3     |
+----+------------+-------+-------+
+----+-----------+----------+
| Id | ProductId | Quantity |
+----+-----------+----------+
| 1  | 3         | 2        |
+----+-----------+----------+`,
      explanation:
        'Order 1 inserts an order and reduces School Bag stock from 5 to 3, then COMMIT saves both. In order 2 the INSERT succeeds but the UPDATE would make Stock -30, which breaks CHECK (Stock >= 0). ROLLBACK undoes the INSERT too, so Orders still has only one row - all or nothing. In real SQL Server, prices print as 45.00 / 120.00 / 899.00 (the lab drops trailing zeros), and the rolled-back IDENTITY value 2 is NOT reused: the next order gets Id 3. Identity values are never rolled back.',
    },
    {
      title: 'Place an order safely from C# with SqlTransaction',
      scenario:
        'The shop API must insert an order and reduce stock in one transaction. If stock is insufficient, nothing may be saved.',
      steps: [
        'Run the Example 1 script so ShopDB exists',
        'File > New > Project > Console App, name it ShopTransactions; dotnet add package Microsoft.Data.SqlClient',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Put a breakpoint (F9) on tx.CommitAsync(), run with F5 and query Orders in SSMS with NOLOCK while paused to see uncommitted work',
      ],
      code: txCode,
      result: `Product 1 x10: COMMITTED
Product 2 x50: ROLLED BACK (Not enough stock for product 2)
Notebook   stock 90
Pen Pack   stock 20
School Bag stock 3`,
      explanation:
        'Both commands receive the same tx object. For product 2 the UPDATE condition "AND Stock >= @q" matches 0 rows, so the code throws, the catch block rolls back, and the already-inserted order row disappears. Checking rows affected is better than relying only on the CHECK constraint because you get a clear business message. Using one connection for both commands is required - a transaction belongs to a single connection.',
    },
    {
      title: 'Call a stored procedure with output parameters and a return value',
      scenario:
        'The DBA does not allow the app to write to tables directly. Orders must go through dbo.usp_PlaceOrder, which returns the new OrderId and a message as OUTPUT parameters and a status code with RETURN.',
      steps: [
        'In SSMS run part 1 (CREATE OR ALTER PROCEDURE) against ShopDB. Stored procedures do not run in the in-app SSMS Lab, use real SSMS',
        'Test it in SSMS: DECLARE @id INT, @msg NVARCHAR(200); EXEC dbo.usp_PlaceOrder 3, 1, @id OUTPUT, @msg OUTPUT; SELECT @id, @msg;',
        'Create a Console App, add Microsoft.Data.SqlClient, paste part 2 into Program.cs and press Ctrl+F5',
      ],
      code: procCode,
      result: `Return=0, OrderId=5, Message=Order placed
Return=2, OrderId=0, Message=Only 2 in stock
Return=1, OrderId=0, Message=Product not found`,
      explanation:
        'CommandType.StoredProcedure tells SqlClient that the text is a procedure name, so it sends an RPC call with the parameters. Output parameters must exist in the Parameters collection with Direction = Output, and NVARCHAR outputs need a size (200), otherwise you get "String[3]: the Size property has an invalid size of 0". Values are read after ExecuteNonQueryAsync. The OrderId depends on earlier inserts: 5 here after Examples 1 and 2, because Ids 2 and 4 were used by the rolled-back inserts and identity values are never given back. One bag was sold, so the second call sees only 2 in stock and the procedure returns code 2.',
    },
    {
      title: 'DataTable in memory: row states, versions and Select',
      scenario:
        'Understand what SqlDataAdapter does behind the scenes. Build a Students DataTable in memory, edit, add and delete rows, and see how every row remembers its state and original values.',
      steps: [
        'File > New > Project > Console App, name it DataTableDemo (no database or package needed, System.Data is built in)',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Put a breakpoint on table.AcceptChanges() at the end, hover over table and click the magnifier to open the DataTable Visualizer',
      ],
      code: dataTableCode,
      csharp: { files: { 'Program.cs': dataTableCode }, stdin: '' },
      result: `Id 1: Deleted
Id 2: Modified
Id 3: Unchanged
Id 4: Added
Ravi: 67 -> 72
Pending changes: 3
Passed: Neha 91, Ravi 72
Rows after AcceptChanges: 3`,
      explanation:
        'After the first AcceptChanges all rows are Unchanged. Editing Ravi makes his row Modified and keeps 67 as the Original version. Kiran is Added. Delete() on an existing row does not remove it - it is marked Deleted so that adapter.Update can send a DELETE, and its values are only readable through DataRowVersion.Original (reading row["Id"] directly would throw DeletedRowInaccessibleException). GetChanges() returns the 3 changed rows. Select() works on current rows only, so deleted Asha is skipped and Kiran (58) fails the filter. The final AcceptChanges removes the deleted row for good, leaving 3 rows.',
    },
    {
      title: 'SqlDataAdapter: fill a DataSet, work offline, save all changes',
      scenario:
        'A small WinForms-style admin tool loads products and orders into a DataSet, shows order counts per product, raises all prices by 10 percent offline and saves everything back with one Update call.',
      steps: [
        'Create a Console App, add Microsoft.Data.SqlClient and paste the code',
        'Press Ctrl+F5 and then run SELECT * FROM Products in SSMS to see the new prices and the new row',
        'Open SQL Server Profiler or Extended Events if you want to see the generated UPDATE statements',
      ],
      code: adapterCode,
      result: `Tables: 2, products: 3, orders: 3
Notebook   orders: 1
Pen Pack   orders: 0
School Bag orders: 2
Rows saved to SQL Server: 4`,
      explanation:
        'Fill opens the connection, runs the SELECT, loads rows and closes the connection - we never call Open. The DataRelation links Products.Id to Orders.ProductId so GetChildRows works in memory. Counts depend on the orders created in Examples 1 to 3 (shown here after running all of them). SqlCommandBuilder generated an UPDATE for each of the 3 modified rows and an INSERT for the Added row, so Update returns 4. Passing null for the identity column lets SQL Server generate the Id. CommandBuilder only works for single-table SELECTs that include the primary key.',
    },
    {
      title: 'Connection pooling and a connection leak',
      scenario:
        'An intern\'s code forgets to dispose connections. With a small pool (Max Pool Size=5) we can see the production error that happens after a few hours under real load.',
      steps: [
        'Create a Console App, add Microsoft.Data.SqlClient and paste the code',
        'Press Ctrl+F5 and wait about 3 seconds for the 6th Open() to time out',
        'Change Max Pool Size to 100 and remove the leak section to see the normal behaviour',
      ],
      code: poolCode,
      result: `50 open/close cycles OK with a pool of 5
Leaked connection 1 opened
Leaked connection 2 opened
Leaked connection 3 opened
Leaked connection 4 opened
Leaked connection 5 opened
ERROR: Timeout expired.  The timeout period elapsed prior to obtaining a connection from the pool.  This may have occurred because all pooled connections were in use and max pool size was reached.`,
      explanation:
        'In the first loop each using block returns the connection to the pool, so 50 opens reuse the same physical connection and the pool never grows. In the second loop no connection is returned; when 5 are in use the 6th Open() waits Connect Timeout (3 s) and throws InvalidOperationException. In a real Web API this looks like random slow requests followed by 500 errors under load. The fix is always using / await using.',
    },
  ],
  interview: [
    { q: 'What is a transaction? Explain ACID.', a: 'A group of operations treated as one unit: all succeed or all are undone. Atomicity (all or nothing), Consistency (constraints remain valid), Isolation (concurrent transactions do not see each other\'s uncommitted work, depending on isolation level), Durability (committed data survives crashes, via the transaction log).', level: 'Easy' },
    { q: 'How do you use a transaction in ADO.NET?', a: 'Open the connection, call BeginTransaction (or BeginTransactionAsync), create every SqlCommand with that connection AND the transaction (or set cmd.Transaction), execute them, Commit in the try block and Rollback in the catch block. Dispose the transaction; disposing without commit rolls back.', level: 'Easy' },
    { q: 'What error do you get if one command in a transaction is not given the transaction object?', a: 'InvalidOperationException: "ExecuteNonQuery requires the command to have a transaction when the connection assigned to the command is in a pending local transaction. The Transaction property of the command has not been initialized."', level: 'Medium' },
    { q: 'What isolation levels does SQL Server support, and which is the default?', a: 'Read Uncommitted, Read Committed (default), Repeatable Read, Serializable and Snapshot (plus the database option READ_COMMITTED_SNAPSHOT). Higher levels prevent more anomalies (dirty, non-repeatable, phantom reads) but cause more blocking.', level: 'Hard' },
    { q: 'SqlTransaction vs TransactionScope?', a: 'SqlTransaction is a local transaction on one connection and must be passed to each command. TransactionScope is ambient: connections opened inside the using block enlist automatically, and it can span several connections or resources (which may escalate to a distributed transaction). For async code create it with TransactionScopeAsyncFlowOption.Enabled.', level: 'Hard' },
    { q: 'How do you call a stored procedure and read an output parameter?', a: 'Set CommandText to the procedure name and CommandType = CommandType.StoredProcedure. Add input parameters, add the output parameter with Direction = ParameterDirection.Output (with Size for strings), execute, then read param.Value. A RETURN value uses ParameterDirection.ReturnValue.', level: 'Easy' },
    { q: 'When are output parameter values available if the procedure also returns rows?', a: 'Only after the SqlDataReader has been fully read and closed, because output values are sent at the end of the result stream.', level: 'Hard' },
    { q: 'Why might companies prefer stored procedures?', a: 'Security (grant EXECUTE only, no direct table access), one place for complex data logic used by several apps, fewer round trips, and DBAs can tune them without redeploying the app. Downsides: business logic split between C# and SQL, harder to unit test and version.', level: 'Medium' },
    { q: 'What is the difference between DataSet and DataReader?', a: 'DataReader is connected, forward-only, read-only and very fast; it needs an open connection while reading. DataSet is disconnected, holds one or more DataTables with relations in memory, supports editing and saving back via SqlDataAdapter, but uses more memory.', level: 'Easy' },
    { q: 'What do SqlDataAdapter.Fill and Update do?', a: 'Fill opens the connection if needed, runs the SelectCommand, loads rows into a DataTable and closes the connection. Update walks through changed rows and runs InsertCommand, UpdateCommand or DeleteCommand depending on RowState, then calls AcceptChanges on them.', level: 'Medium' },
    { q: 'What are DataRowState values?', a: 'Detached (not in a table yet), Added, Modified, Deleted, Unchanged. Rows also keep Original and Current versions, so the adapter can build UPDATE ... WHERE with original values for optimistic concurrency.', level: 'Medium' },
    { q: 'What is connection pooling and how does it work in SqlClient?', a: 'A cache of open physical connections. Open takes one from the pool, Close/Dispose returns it. Pools are created per unique connection string (and identity) per process. Defaults: Min Pool Size 0, Max Pool Size 100. It avoids the cost of TCP and login for every request.', level: 'Medium' },
    { q: 'Your API throws "Timeout expired. The timeout period elapsed prior to obtaining a connection from the pool". How do you investigate?', a: 'It means all pooled connections are busy. Look for leaks (connections or readers not disposed, especially in exception paths or async code that never completes), long-running queries or transactions holding connections, and sync-over-async blocking. Check sys.dm_exec_sessions, use await using everywhere, and only then consider a larger Max Pool Size.', level: 'Hard' },
    { q: 'Are identity values rolled back with a transaction?', a: 'No. If an INSERT inside a rolled-back transaction used identity 5, the next insert gets 6. Identity columns can have gaps; never rely on them being continuous.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write TransferAsync(int fromId, int toId, decimal amount) for an Accounts(Id, Holder, Balance) table using SqlTransaction. Roll back if the source account has insufficient balance.',
      hint: 'UPDATE ... SET Balance = Balance - @amt WHERE Id = @from AND Balance >= @amt; check rows affected.',
      solution: `static async Task<bool> TransferAsync(string cs, int fromId, int toId, decimal amount)
{
    await using var conn = new SqlConnection(cs);
    await conn.OpenAsync();
    await using var tx = (SqlTransaction)await conn.BeginTransactionAsync();
    try
    {
        var debit = new SqlCommand("UPDATE Accounts SET Balance = Balance - @amt WHERE Id = @id AND Balance >= @amt", conn, tx);
        debit.Parameters.Add("@amt", SqlDbType.Decimal).Value = amount;
        debit.Parameters.Add("@id", SqlDbType.Int).Value = fromId;
        if (await debit.ExecuteNonQueryAsync() == 0) throw new InvalidOperationException("Insufficient balance");

        var credit = new SqlCommand("UPDATE Accounts SET Balance = Balance + @amt WHERE Id = @id", conn, tx);
        credit.Parameters.Add("@amt", SqlDbType.Decimal).Value = amount;
        credit.Parameters.Add("@id", SqlDbType.Int).Value = toId;
        if (await credit.ExecuteNonQueryAsync() == 0) throw new InvalidOperationException("Target account not found");

        await tx.CommitAsync();
        return true;
    }
    catch
    {
        await tx.RollbackAsync();
        return false;
    }
}`,
    },
    {
      task: 'Create a stored procedure dbo.usp_GetLowStock @MaxStock INT, @Count INT OUTPUT that returns products with Stock <= @MaxStock and sets @Count. Call it from C#, print each product and then the count.',
      hint: 'Read all rows first, close the reader, then read the output parameter.',
      solution: `-- SQL
CREATE OR ALTER PROCEDURE dbo.usp_GetLowStock @MaxStock INT, @Count INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Name, Stock FROM Products WHERE Stock <= @MaxStock ORDER BY Stock;
    SELECT @Count = COUNT(*) FROM Products WHERE Stock <= @MaxStock;
END

// C#
var cmd = new SqlCommand("dbo.usp_GetLowStock", conn) { CommandType = CommandType.StoredProcedure };
cmd.Parameters.Add("@MaxStock", SqlDbType.Int).Value = 10;
var count = cmd.Parameters.Add("@Count", SqlDbType.Int);
count.Direction = ParameterDirection.Output;
await using (var r = await cmd.ExecuteReaderAsync())
{
    while (await r.ReadAsync()) Console.WriteLine($"{r.GetString(1)}: {r.GetInt32(2)}");
}                                   // reader closed here
Console.WriteLine($"Low stock products: {count.Value}");`,
    },
    {
      task: 'Build an Employees DataTable (Id, Name, Dept, Salary) with 5 rows in memory. Use Select to list IT employees by salary descending, and Compute to get the total salary of HR.',
      hint: 'table.Select("Dept = \'IT\'", "Salary DESC") and table.Compute("SUM(Salary)", "Dept = \'HR\'").',
      solution: `var t = new DataTable();
t.Columns.Add("Id", typeof(int));
t.Columns.Add("Name", typeof(string));
t.Columns.Add("Dept", typeof(string));
t.Columns.Add("Salary", typeof(decimal));
t.Rows.Add(1, "Asha", "IT", 65000m);
t.Rows.Add(2, "Ravi", "HR", 40000m);
t.Rows.Add(3, "Neha", "IT", 82000m);
t.Rows.Add(4, "Om", "HR", 38000m);
t.Rows.Add(5, "Kiran", "IT", 51000m);
foreach (DataRow r in t.Select("Dept = 'IT'", "Salary DESC"))
    Console.WriteLine($"{r["Name"]} {r["Salary"]}");
Console.WriteLine($"HR total: {t.Compute("SUM(Salary)", "Dept = 'HR'")}");   // 78000`,
    },
    {
      task: 'Use TransactionScope instead of SqlTransaction for the order example. Make it async-safe.',
      hint: 'new TransactionScope(TransactionScopeAsyncFlowOption.Enabled); open the connection INSIDE the scope; call scope.Complete().',
      solution: `using System.Transactions;

using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
{
    await using var conn = new SqlConnection(cs);
    await conn.OpenAsync();                     // enlists automatically
    // ... insert order, update stock (no tx parameter needed)
    scope.Complete();                           // without this, everything rolls back on Dispose
}`,
    },
    {
      task: 'Find the bug: public List<string> GetNames() { var conn = new SqlConnection(cs); conn.Open(); var r = new SqlCommand("SELECT Name FROM Products", conn).ExecuteReader(); var list = new List<string>(); while (r.Read()) list.Add(r.GetString(0)); return list; }',
      hint: 'What happens to the connection after return?',
      solution: `// The connection and reader are never disposed -> connection leak -> pool timeout under load.
public List<string> GetNames()
{
    using var conn = new SqlConnection(cs);
    conn.Open();
    using var cmd = new SqlCommand("SELECT Name FROM Products", conn);
    using var r = cmd.ExecuteReader();
    var list = new List<string>();
    while (r.Read()) list.Add(r.GetString(0));
    return list;
}`,
    },
  ],
  quiz: [
    {
      question: 'Inside a SqlTransaction, the second of two commands fails and the code calls RollbackAsync(). What happens to the first command\'s changes?',
      options: ['They stay saved', 'They are undone as well', 'Only the inserted rows stay', 'SQL Server asks the user'],
      answer: 1,
      explanation: 'Atomicity: a rollback undoes every change made inside the transaction.',
    },
    {
      question: 'Which property must be set to call dbo.usp_PlaceOrder by name?',
      options: ['cmd.CommandTimeout = 0', 'cmd.CommandType = CommandType.Text', 'cmd.UpdatedRowSource = None', 'cmd.CommandType = CommandType.StoredProcedure'],
      answer: 3,
      explanation: 'CommandType.StoredProcedure tells ADO.NET the CommandText is a procedure name.',
    },
    {
      question: 'What does SqlDataAdapter.Fill() do with the connection if it was closed?',
      options: ['Throws an exception', 'Leaves it open', 'Opens it, loads the data and closes it again', 'Disposes the DataSet'],
      answer: 2,
      explanation: 'Fill and Update restore the connection to the state it was in, so a closed connection is opened and closed automatically.',
    },
    {
      question: 'A row was loaded with Fill() and then row.Delete() was called. What is its RowState?',
      options: ['Deleted', 'Detached', 'Removed', 'Unchanged'],
      answer: 0,
      explanation: 'It stays in the table marked Deleted so Update() can send a DELETE; AcceptChanges removes it.',
    },
    {
      question: 'Which statement about connection pooling is TRUE?',
      options: ['Every Open() creates a new TCP connection', 'Dispose() returns the physical connection to the pool', 'All connection strings share one pool', 'Pooling must be enabled manually'],
      answer: 1,
      explanation: 'Pooling is on by default, there is one pool per distinct connection string, and Close/Dispose returns connections to it.',
    },
  ],
};
