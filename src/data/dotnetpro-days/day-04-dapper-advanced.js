const ordersScript = `CREATE DATABASE OrdersDB;
GO
USE OrdersDB;
GO
CREATE TABLE Customers (
    CustomerId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    City NVARCHAR(50) NOT NULL
);
CREATE TABLE Orders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL FOREIGN KEY REFERENCES Customers(CustomerId),
    OrderDate DATE NOT NULL
);
CREATE TABLE OrderItems (
    ItemId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL FOREIGN KEY REFERENCES Orders(Id),
    Product NVARCHAR(100) NOT NULL,
    Qty INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL
);
INSERT INTO Customers (Name, City) VALUES ('Asha Patil', 'Pune'), ('Ravi Kumar', 'Chennai');
INSERT INTO Orders (CustomerId, OrderDate) VALUES (1, '2025-07-01'), (2, '2025-07-02'), (1, '2025-07-05');
INSERT INTO OrderItems (OrderId, Product, Qty, Price) VALUES
(1, 'Notebook', 5, 45),
(1, 'Pen Pack', 2, 120),
(2, 'School Bag', 1, 899),
(3, 'Lunch Box', 1, 349);
GO
-- one-to-one: each order with its customer (splitOn: "CustomerId")
SELECT o.Id, o.OrderDate, c.CustomerId, c.Name, c.City
FROM Orders o
INNER JOIN Customers c ON c.CustomerId = o.CustomerId
ORDER BY o.Id;
-- one-to-many: orders with their items (splitOn: "ItemId")
SELECT o.Id, o.OrderDate, i.ItemId, i.Product, i.Qty, i.Price
FROM Orders o
INNER JOIN OrderItems i ON i.OrderId = o.Id
ORDER BY o.Id, i.ItemId;`;

const models = `public class Customer
{
    public int CustomerId { get; set; }
    public string Name { get; set; } = "";
    public string City { get; set; } = "";
}

public class OrderItem
{
    public int ItemId { get; set; }
    public string Product { get; set; } = "";
    public int Qty { get; set; }
    public decimal Price { get; set; }
}

public class Order
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }
    public Customer? Customer { get; set; }
    public List<OrderItem> Items { get; set; } = new();
    public decimal Total => Items.Sum(i => i.Qty * i.Price);
}`;

const multiMapCode = `// dotnet add package Dapper ; dotnet add package Microsoft.Data.SqlClient
using Dapper;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrdersDB;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);

// ---------- 1. ONE-TO-ONE: Order -> Customer ----------
const string orderCustomerSql = """
    SELECT o.Id, o.OrderDate, c.CustomerId, c.Name, c.City
    FROM Orders o
    INNER JOIN Customers c ON c.CustomerId = o.CustomerId
    ORDER BY o.Id
    """;
// <TFirst, TSecond, TReturn>: columns BEFORE "CustomerId" -> Order, from "CustomerId" on -> Customer
var orders = await conn.QueryAsync<Order, Customer, Order>(
    orderCustomerSql,
    (order, customer) => { order.Customer = customer; return order; },
    splitOn: "CustomerId");

foreach (var o in orders)
    Console.WriteLine($"Order {o.Id} on {o.OrderDate:yyyy-MM-dd} by {o.Customer!.Name} ({o.Customer.City})");

// ---------- 2. ONE-TO-MANY: Order -> Items ----------
const string orderItemsSql = """
    SELECT o.Id, o.OrderDate, i.ItemId, i.Product, i.Qty, i.Price
    FROM Orders o
    INNER JOIN OrderItems i ON i.OrderId = o.Id
    ORDER BY o.Id, i.ItemId
    """;
var lookup = new Dictionary<int, Order>();       // one Order object per order Id
await conn.QueryAsync<Order, OrderItem, Order>(
    orderItemsSql,
    (order, item) =>
    {
        if (!lookup.TryGetValue(order.Id, out var existing))
        {
            existing = order;
            lookup.Add(existing.Id, existing);
        }
        existing.Items.Add(item);
        return existing;
    },
    splitOn: "ItemId");

foreach (var o in lookup.Values)
    Console.WriteLine($"Order {o.Id}: {o.Items.Count} item(s), total {o.Total}");

${models}`;

const multipleCode = `using Dapper;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrdersDB;Trusted_Connection=True;TrustServerCertificate=True";
await using var conn = new SqlConnection(cs);

// Order details page: 3 SELECTs, ONE round trip to SQL Server
const string sql = """
    SELECT Id, OrderDate FROM Orders WHERE Id = @Id;

    SELECT c.CustomerId, c.Name, c.City
    FROM Customers c INNER JOIN Orders o ON o.CustomerId = c.CustomerId
    WHERE o.Id = @Id;

    SELECT ItemId, Product, Qty, Price FROM OrderItems WHERE OrderId = @Id ORDER BY ItemId;
    """;

using var multi = await conn.QueryMultipleAsync(sql, new { Id = 1 });

// read the result sets IN THE SAME ORDER as the SELECTs
var order = await multi.ReadSingleOrDefaultAsync<Order>();
if (order is null) { Console.WriteLine("Order not found"); return; }
order.Customer = await multi.ReadSingleAsync<Customer>();
order.Items = (await multi.ReadAsync<OrderItem>()).ToList();

Console.WriteLine($"Order {order.Id} for {order.Customer.Name}");
foreach (var i in order.Items)
    Console.WriteLine($"  {i.Product,-9} x{i.Qty} @ {i.Price}");
Console.WriteLine($"  Total: {order.Total}");

${models}`;

const txProcBulkCode = `using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrdersDB;Trusted_Connection=True;TrustServerCertificate=True";

// ---------- A. Transaction: order header + items, all or nothing ----------
await using (var conn = new SqlConnection(cs))
{
    await conn.OpenAsync();                                   // must be open to begin a transaction
    await using var tx = await conn.BeginTransactionAsync();
    try
    {
        int orderId = await conn.ExecuteScalarAsync<int>(
            "INSERT INTO Orders (CustomerId, OrderDate) OUTPUT INSERTED.Id VALUES (@CustomerId, @OrderDate)",
            new { CustomerId = 2, OrderDate = new DateTime(2025, 7, 10) },
            transaction: tx);                                 // pass the transaction to EVERY call

        var items = new[]
        {
            new { OrderId = orderId, Product = "Notebook", Qty = 10, Price = 45m },
            new { OrderId = orderId, Product = "Pencil Box", Qty = 2, Price = 85m },
        };
        // a collection as the parameter: Dapper runs the INSERT once per item
        int itemRows = await conn.ExecuteAsync(
            "INSERT INTO OrderItems (OrderId, Product, Qty, Price) VALUES (@OrderId, @Product, @Qty, @Price)",
            items, transaction: tx);

        await tx.CommitAsync();
        Console.WriteLine($"Order {orderId} saved with {itemRows} items");
    }
    catch
    {
        await tx.RollbackAsync();
        throw;
    }
}

// ---------- B. Stored procedure with an OUTPUT parameter ----------
// CREATE OR ALTER PROCEDURE dbo.usp_CustomerOrders @CustomerId INT, @OrderCount INT OUTPUT AS
// BEGIN
//     SET NOCOUNT ON;
//     SELECT @OrderCount = COUNT(*) FROM Orders WHERE CustomerId = @CustomerId;
//     SELECT Id, OrderDate FROM Orders WHERE CustomerId = @CustomerId ORDER BY Id;
// END
await using (var conn = new SqlConnection(cs))
{
    var p = new DynamicParameters();
    p.Add("@CustomerId", 1);
    p.Add("@OrderCount", dbType: DbType.Int32, direction: ParameterDirection.Output);

    var ashaOrders = (await conn.QueryAsync<Order>(
        "dbo.usp_CustomerOrders", p, commandType: CommandType.StoredProcedure)).ToList();

    // buffered query -> reader already closed -> output value is available
    Console.WriteLine($"Asha has {p.Get<int>("@OrderCount")} orders: {string.Join(", ", ashaOrders.Select(o => o.Id))}");
}

// ---------- C. Bulk insert 10,000 rows with SqlBulkCopy ----------
var table = new DataTable();
table.Columns.Add("OrderId", typeof(int));
table.Columns.Add("Product", typeof(string));
table.Columns.Add("Qty", typeof(int));
table.Columns.Add("Price", typeof(decimal));
for (int i = 1; i <= 10_000; i++)
    table.Rows.Add(3, $"Sticker #{i}", 1, 5m);

await using (var conn = new SqlConnection(cs))
{
    await conn.OpenAsync();
    using var bulk = new SqlBulkCopy(conn) { DestinationTableName = "dbo.OrderItems", BatchSize = 5000 };
    bulk.ColumnMappings.Add("OrderId", "OrderId");
    bulk.ColumnMappings.Add("Product", "Product");
    bulk.ColumnMappings.Add("Qty", "Qty");
    bulk.ColumnMappings.Add("Price", "Price");
    await bulk.WriteToServerAsync(table);
    Console.WriteLine($"Bulk copied {table.Rows.Count} rows");
}

public class Order { public int Id { get; set; } public DateTime OrderDate { get; set; } }`;

const simCode = `using System;
using System.Collections.Generic;
using System.Linq;

// ---- Part 1: how splitOn cuts ONE row into two objects ----
string[] columns = { "Id", "OrderDate", "CustomerId", "Name", "City" };
ShowSplit(columns, "CustomerId");

// ---- Part 2: a one-to-many JOIN repeats the order on every item row ----
var rows = new List<(int OrderId, string Customer, int ItemId, string Product, int Qty)>
{
    (1, "Asha", 1, "Notebook", 5),
    (1, "Asha", 2, "Pen Pack", 2),
    (2, "Ravi", 3, "School Bag", 1),
};

// naive mapping: a NEW Order for every row
var naive = rows.Select(r => new Order(r.OrderId, r.Customer,
    new List<Item> { new(r.ItemId, r.Product, r.Qty) })).ToList();
Console.WriteLine($"Naive mapping: {naive.Count} orders");

// Dapper pattern: reuse the Order already created for this Id
var lookup = new Dictionary<int, Order>();
foreach (var r in rows)
{
    if (!lookup.TryGetValue(r.OrderId, out var order))
    {
        order = new Order(r.OrderId, r.Customer, new List<Item>());
        lookup.Add(order.Id, order);
    }
    order.Items.Add(new Item(r.ItemId, r.Product, r.Qty));
}
Console.WriteLine($"Dictionary mapping: {lookup.Count} orders");
foreach (var o in lookup.Values)
    Console.WriteLine($"Order {o.Id} ({o.Customer}): " +
        string.Join(", ", o.Items.Select(i => $"{i.Product} x{i.Qty}")));

static void ShowSplit(string[] cols, string splitOn)
{
    int at = Array.IndexOf(cols, splitOn, 1);       // the split column starts the 2nd object
    Console.WriteLine($"splitOn: '{splitOn}'");
    Console.WriteLine("  Order    <- " + string.Join(", ", cols[..at]));
    Console.WriteLine("  Customer <- " + string.Join(", ", cols[at..]));
}

record Item(int Id, string Product, int Qty);
record Order(int Id, string Customer, List<Item> Items);`;

export default {
  id: 'day-04-dapper-advanced',
  title: 'Dapper Advanced: Multi-Mapping, QueryMultiple, Transactions, Stored Procedures and Bulk Insert',
  module: 'Module 1: Data Access – ADO.NET & Dapper',
  day: 4,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Turn JOIN results into nested objects with Dapper multi-mapping and splitOn, load a whole details page in one round trip with QueryMultiple, run Dapper inside transactions, call stored procedures with DynamicParameters, insert thousands of rows quickly, and decide when to choose ADO.NET, Dapper or EF Core.',
  objectives: [
    'Map one-to-one and one-to-many JOINs into nested objects with multi-mapping and splitOn',
    'Read several result sets in one call with QueryMultiple',
    'Use Dapper with transactions and stored procedures (input, output, return values)',
    'Choose a bulk insert approach: Execute with a list, SqlBulkCopy, table-valued parameters',
    'Compare ADO.NET, Dapper and EF Core and justify a choice in an interview',
  ],
  theory: [
    {
      heading: 'Multi-mapping: JOIN rows into nested objects',
      content:
        'A JOIN returns flat rows, but in C# we want an Order object with a Customer property. Dapper multi-mapping reads each row, splits its columns into two (up to seven) objects, and calls your map function to connect them. The generic arguments are the types in column order followed by the return type: Query<Order, Customer, Order>. splitOn names the column where the NEXT object starts. Its default is "Id", so if the second table\'s key is called CustomerId (or the SELECT has no Id column for the second object) you must set splitOn, otherwise you get "When using the multi-mapping APIs ensure you set the splitOn param if you have keys other than Id". For three objects pass two names: splitOn: "CustomerId,ItemId".',
      syntax: `var orders = await conn.QueryAsync<Order, Customer, Order>(
    sql,
    (order, customer) => { order.Customer = customer; return order; },
    splitOn: "CustomerId");`,
      points: [
        'Put the columns of each object together in the SELECT, in the same order as the generic types',
        'The split column itself belongs to the second object',
        'If the second object\'s columns are all NULL (LEFT JOIN with no match), Dapper passes null',
      ],
    },
    {
      heading: 'One-to-many and the dictionary pattern',
      content:
        'For an Order with many Items, the JOIN repeats the order columns on every item row. Dapper calls the map function once per ROW, so without extra code you get one Order object per item (3 orders instead of 2). The standard fix is a Dictionary<int, Order>: if the order Id is already in the dictionary, add the item to that existing order; otherwise store the new order. At the end use dictionary.Values. Another approach is QueryMultiple: load orders and items in two result sets and join them in memory with ToLookup, which avoids sending repeated order columns over the network.',
      tip: 'Interview favourite: "Why does my multi-mapping return duplicate parents?" - because the map function runs per row; de-duplicate with a dictionary.',
    },
    {
      heading: 'QueryMultiple: many result sets in one round trip',
      content:
        'A details page often needs an order, its customer and its items. Instead of three database calls, send one batch with three SELECTs and read the results with QueryMultiple. GridReader.Read<T>, ReadFirst<T>, ReadSingleOrDefault<T> and their async versions must be called in the same order as the SELECTs. Dispose the GridReader (using) to close the underlying reader.',
      syntax: `using var multi = await conn.QueryMultipleAsync(sql, new { Id = id });
var order = await multi.ReadSingleOrDefaultAsync<Order>();
var customer = await multi.ReadSingleAsync<Customer>();
var items = (await multi.ReadAsync<OrderItem>()).ToList();`,
    },
    {
      heading: 'Transactions and stored procedures with Dapper',
      content:
        'Dapper uses the normal ADO.NET transaction: open the connection, begin a transaction and pass it as the transaction argument to every Dapper call. For stored procedures pass the procedure name and commandType: CommandType.StoredProcedure. Simple input parameters can be an anonymous object; for output and return values use DynamicParameters and read them with p.Get<T>("@Name") after the call (after all rows are read).',
      syntax: `await using var tx = await conn.BeginTransactionAsync();
await conn.ExecuteAsync(sql1, param1, transaction: tx);
await conn.ExecuteAsync(sql2, param2, transaction: tx);
await tx.CommitAsync();

var p = new DynamicParameters(new { CustomerId = 1 });
p.Add("@OrderCount", dbType: DbType.Int32, direction: ParameterDirection.Output);
p.Add("@ret", dbType: DbType.Int32, direction: ParameterDirection.ReturnValue);
await conn.ExecuteAsync("dbo.usp_X", p, commandType: CommandType.StoredProcedure);
int count = p.Get<int>("@OrderCount");`,
      points: [
        'Forgetting transaction: tx on one call throws "...requires the command to have a transaction..."',
        'TransactionScope with TransactionScopeAsyncFlowOption.Enabled also works with Dapper',
      ],
    },
    {
      heading: 'Bulk insert patterns',
      content:
        'Passing a list to Execute is convenient but runs one INSERT per item (1,000 items = 1,000 round trips) - fine for tens of rows, slow for thousands. For large imports (CSV upload, nightly sync) choose a real bulk method.',
      points: [
        'Execute(sql, list): simple, N round trips; wrap in a transaction so it is all-or-nothing and faster',
        'Multi-row VALUES (@a1,@b1),(@a2,@b2)...: fewer round trips, but SQL Server allows max 1000 rows per VALUES and 2100 parameters',
        'SqlBulkCopy: streams a DataTable or IDataReader using the bulk-load protocol; the fastest option for 10,000+ rows',
        'Table-valued parameter (TVP): CREATE TYPE ... AS TABLE, pass a DataTable with .AsTableValuedParameter("dbo.ItemType") to a procedure that does INSERT ... SELECT or MERGE',
        'Commercial libraries such as Dapper Plus / EF Core BulkExtensions add BulkInsert/BulkMerge helpers',
      ],
    },
    {
      heading: 'ADO.NET vs Dapper vs EF Core: when to use which',
      content:
        'There is no single winner; real projects often mix them. EF Core gives the most productivity: LINQ queries, change tracking, migrations, relationships and SaveChanges with a transaction - ideal for CRUD-heavy business apps. Dapper gives near-raw speed with full control of SQL - ideal for complex reporting queries, read-heavy APIs, existing databases with stored procedures and high-traffic endpoints. Raw ADO.NET is for special cases: SqlBulkCopy, streaming huge results, provider-specific features, or legacy code. A common enterprise pattern (Day 8) is CQRS: EF Core for commands (writes) and Dapper for queries (reads).',
      points: [
        'Speed: ADO.NET >= Dapper > EF Core (EF Core 8 with AsNoTracking and compiled queries is close)',
        'Code to write: ADO.NET most, Dapper medium, EF Core least',
        'SQL control: ADO.NET and Dapper full, EF Core generated (but FromSql/SqlQuery available)',
        'Schema management: only EF Core has migrations; with Dapper use SQL scripts / DbUp / Flyway',
        'Learning curve: Dapper is smallest; EF Core needs understanding of tracking, loading and query translation',
      ],
    },
  ],
  examples: [
    {
      title: 'Create OrdersDB and look at the JOIN rows Dapper will receive',
      scenario: 'An online stationery shop stores customers, orders and order items. Before mapping, see the flat rows each JOIN returns.',
      steps: [
        'Open SSMS (or the in-app SSMS Lab) and click New Query',
        'Paste the script and press F5',
        'Notice that order 1 appears twice in the second result - once per item',
      ],
      code: ordersScript,
      tsql: ordersScript,
      result: `+----+------------+------------+------------+---------+
| Id | OrderDate  | CustomerId | Name       | City    |
+----+------------+------------+------------+---------+
| 1  | 2025-07-01 | 1          | Asha Patil | Pune    |
| 2  | 2025-07-02 | 2          | Ravi Kumar | Chennai |
| 3  | 2025-07-05 | 1          | Asha Patil | Pune    |
+----+------------+------------+------------+---------+
+----+------------+--------+------------+-----+-------+
| Id | OrderDate  | ItemId | Product    | Qty | Price |
+----+------------+--------+------------+-----+-------+
| 1  | 2025-07-01 | 1      | Notebook   | 5   | 45    |
| 1  | 2025-07-01 | 2      | Pen Pack   | 2   | 120   |
| 2  | 2025-07-02 | 3      | School Bag | 1   | 899   |
| 3  | 2025-07-05 | 4      | Lunch Box  | 1   | 349   |
+----+------------+--------+------------+-----+-------+`,
      explanation: 'In the first result the Order columns are Id and OrderDate, and the Customer columns start at CustomerId - that is our splitOn. In the second result the Item columns start at ItemId, and order 1 is repeated for each of its 2 items, which is why one-to-many mapping needs a dictionary. Real SQL Server prints prices as 45.00 and so on.',
    },
    {
      title: 'Multi-mapping: one-to-one and one-to-many',
      scenario: 'Show every order with its customer, then every order with its list of items and total amount.',
      steps: [
        'File > New > Project > Console App, name it DapperAdvanced; add the Dapper and Microsoft.Data.SqlClient packages',
        'Replace Program.cs with the code (the model classes are at the bottom) and press Ctrl+F5',
        'Remove the dictionary logic (just add the item and return order) and run again - you will see order 1 twice',
      ],
      code: multiMapCode,
      result: `Order 1 on 2025-07-01 by Asha Patil (Pune)
Order 2 on 2025-07-02 by Ravi Kumar (Chennai)
Order 3 on 2025-07-05 by Asha Patil (Pune)
Order 1: 2 item(s), total 465.00
Order 2: 1 item(s), total 899.00
Order 3: 1 item(s), total 349.00`,
      explanation:
        'In the first query Dapper gives Order the columns Id and OrderDate, and Customer the columns from CustomerId onwards; the lambda attaches the customer. In the second query the map function runs 4 times (once per row), but the dictionary makes sure order 1 is created once and receives both items. Order 1 total = 5 x 45.00 + 2 x 120.00 = 465.00. Without splitOn the default "Id" would not be found in the right place and Dapper would throw.',
    },
    {
      title: 'QueryMultiple: an order details page in one round trip',
      scenario: 'The order details page needs the order header, the customer and the items. Load all three with a single database call.',
      steps: [
        'In the same project replace Program.cs with this code and press Ctrl+F5',
        'Open SQL Server Profiler / Extended Events: you see ONE batch with three SELECTs',
        'Change Id = 1 to Id = 99 to see the "Order not found" path',
      ],
      code: multipleCode,
      result: `Order 1 for Asha Patil
  Notebook  x5 @ 45.00
  Pen Pack  x2 @ 120.00
  Total: 465.00`,
      explanation:
        'QueryMultipleAsync sends the three SELECTs together. The GridReader must be read in order: first the order, then the customer, then the items - reading them in another order maps the wrong columns. Checking the first result for null before reading on lets us return 404 in an API. This is often faster than one big JOIN because order and customer columns are not repeated for every item.',
    },
    {
      title: 'Transactions, a stored procedure with DynamicParameters, and SqlBulkCopy',
      scenario: 'Save a new order with its items atomically, call a stored procedure that returns rows plus an OUTPUT count, then import 10,000 sticker items in bulk.',
      steps: [
        'Run the Example 1 script, then in SSMS create dbo.usp_CustomerOrders from the comment in part B (stored procedures do not run in the SSMS Lab)',
        'Create a Console App with Dapper and Microsoft.Data.SqlClient, paste the code and press Ctrl+F5',
        'Check in SSMS: SELECT COUNT(*) FROM OrderItems WHERE OrderId = 3',
      ],
      code: txProcBulkCode,
      result: `Order 4 saved with 2 items
Asha has 2 orders: 1, 3
Bulk copied 10000 rows`,
      explanation:
        'Part A: the connection is opened manually because a transaction needs an open connection, and transaction: tx is passed to both calls; Dapper ran the item INSERT once per array element and returned the total 2. Part B: DynamicParameters carries the output parameter; Query is buffered, so the reader is closed when it returns and p.Get<int> works. Part C: SqlBulkCopy sends 10,000 rows in two batches of 5,000 using the bulk protocol - typically well under a second, while 10,000 separate INSERTs take many seconds. Order 4 assumes a fresh OrdersDB.',
    },
    {
      title: 'Simulate splitOn and the duplicate-parent problem (no database)',
      scenario: 'Understand exactly what multi-mapping does by simulating it: split a row\'s columns at the splitOn column, then map one-to-many rows naively and with a dictionary.',
      steps: [
        'File > New > Project > Console App, name it SplitOnDemo',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Change "CustomerId" to "Name" in ShowSplit and see how CustomerId would wrongly go to Order',
      ],
      code: simCode,
      csharp: { files: { 'Program.cs': simCode }, stdin: '' },
      result: `splitOn: 'CustomerId'
  Order    <- Id, OrderDate
  Customer <- CustomerId, Name, City
Naive mapping: 3 orders
Dictionary mapping: 2 orders
Order 1 (Asha): Notebook x5, Pen Pack x2
Order 2 (Ravi): School Bag x1`,
      explanation:
        'The split column starts the second object, so CustomerId goes to Customer. In part 2 the JOIN produced 3 rows for 2 orders. Creating an Order per row gives 3 orders, with order 1 duplicated and its items split between two objects. The dictionary keyed by order Id keeps one Order per Id and adds every item to it - exactly the code you write inside Dapper\'s map function.',
    },
  ],
  interview: [
    { q: 'What is multi-mapping in Dapper?', a: 'Mapping a single row to several objects, typically from a JOIN. You call Query<T1, T2, TReturn>(sql, map, splitOn) and the map function links the objects, e.g. order.Customer = customer. Up to 7 input types are supported.', level: 'Easy' },
    { q: 'What does splitOn do and what is its default?', a: 'It names the column where the next object\'s columns start; the default is "Id". With several splits pass a comma-separated list, e.g. "CustomerId,ItemId". The split column belongs to the next object.', level: 'Easy' },
    { q: 'Why does a one-to-many multi-map query return duplicate parent objects and how do you fix it?', a: 'The JOIN returns one row per child and Dapper calls the map function once per row, creating a new parent each time. Keep a Dictionary<int, Parent>; reuse the existing parent and add the child to its list; return dictionary.Values (or call .Distinct() on the result when the dictionary returns the same instance).', level: 'Medium' },
    { q: 'What error appears when splitOn is wrong?', a: '"When using the multi-mapping APIs ensure you set the splitOn param if you have keys other than Id (Parameter splitOn)". It happens when the split column is not found in the result columns.', level: 'Medium' },
    { q: 'When would you use QueryMultiple instead of a JOIN?', a: 'When you need several independent result sets (header, lookup lists, children) for one screen. It saves round trips and avoids repeating parent columns for every child row. Results must be read in order.', level: 'Medium' },
    { q: 'How do you use a transaction with Dapper?', a: 'Open the connection, call BeginTransaction(Async), pass transaction: tx to every Execute/Query call, then Commit or Rollback. Dapper does not manage transactions itself; it uses ADO.NET\'s.', level: 'Easy' },
    { q: 'How do you call a stored procedure with an output parameter in Dapper?', a: 'Create DynamicParameters, add inputs, add the output with dbType and direction: ParameterDirection.Output, execute with commandType: CommandType.StoredProcedure, then read p.Get<T>("@Name"). If the procedure returns rows, read them all first.', level: 'Medium' },
    { q: 'Is conn.Execute(sql, listOfItems) a bulk insert?', a: 'No. Dapper loops and executes the command once per item - N round trips. For thousands of rows use SqlBulkCopy, a table-valued parameter or a bulk library.', level: 'Medium' },
    { q: 'What is a table-valued parameter and how is it used with Dapper?', a: 'A user-defined table type (CREATE TYPE dbo.ItemList AS TABLE (...)) passed as one parameter to a procedure or query. In Dapper: new { Items = dataTable.AsTableValuedParameter("dbo.ItemList") }. Good for sending many rows or a large IN list in one call.', level: 'Hard' },
    { q: 'Dapper vs EF Core: which one would you choose for a new project?', a: 'It depends. EF Core for CRUD-heavy domains needing change tracking, migrations, relationships and LINQ. Dapper for performance-critical or complex SQL queries, reporting, or when working with an existing database and stored procedures. Many teams use both: EF Core for writes, Dapper for reads.', level: 'Medium' },
    { q: 'What are the disadvantages of Dapper?', a: 'You write and maintain all SQL (typos found only at runtime), no change tracking, no migrations, no automatic relationship loading, SQL is tied to one database dialect, and refactoring property names does not update SQL strings.', level: 'Medium' },
    { q: 'How would you avoid the 2100-parameter limit when querying with a huge list of Ids in Dapper?', a: 'Use a table-valued parameter, insert the Ids into a temp table with SqlBulkCopy and JOIN, use STRING_SPLIT on a delimited string parameter, or batch the list into chunks.', level: 'Hard' },
    { q: 'How does QueryUnbufferedAsync help with very large result sets?', a: 'It returns IAsyncEnumerable<T> and streams rows one by one instead of loading them all into a List, so memory stays low (e.g. exporting 1 million rows to CSV). The connection stays busy until the enumeration finishes.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a query that returns every Employee with its Department (one-to-one) using multi-mapping. Tables: Employees(EmpId, Name, Salary, DeptId), Departments(DeptId, DeptName).',
      hint: 'SELECT e.EmpId, e.Name, e.Salary, d.DeptId, d.DeptName ... splitOn: "DeptId".',
      solution: `var list = await conn.QueryAsync<Employee, Department, Employee>(
    """
    SELECT e.EmpId, e.Name, e.Salary, d.DeptId, d.DeptName
    FROM Employees e INNER JOIN Departments d ON d.DeptId = e.DeptId
    """,
    (e, d) => { e.Department = d; return e; },
    splitOn: "DeptId");`,
    },
    {
      task: 'Load every Department with its list of Employees (one-to-many). Include departments with no employees.',
      hint: 'LEFT JOIN; the employee can be null in the map function.',
      solution: `var lookup = new Dictionary<int, Department>();
await conn.QueryAsync<Department, Employee, Department>(
    """
    SELECT d.DeptId, d.DeptName, e.EmpId, e.Name, e.Salary
    FROM Departments d LEFT JOIN Employees e ON e.DeptId = d.DeptId
    ORDER BY d.DeptId
    """,
    (d, e) =>
    {
        if (!lookup.TryGetValue(d.DeptId, out var dept)) { dept = d; lookup.Add(d.DeptId, dept); }
        if (e is not null) dept.Employees.Add(e);
        return dept;
    },
    splitOn: "EmpId");
var departments = lookup.Values.ToList();`,
    },
    {
      task: 'Write GetDashboardAsync() that returns the total number of orders, the top 3 products by quantity and the latest 5 orders using ONE QueryMultiple call.',
      hint: 'Three SELECTs separated by semicolons; ReadSingle<int>, Read<ProductSales>, Read<Order>.',
      solution: `const string sql = """
    SELECT COUNT(*) FROM Orders;
    SELECT TOP 3 Product, SUM(Qty) AS Qty FROM OrderItems GROUP BY Product ORDER BY SUM(Qty) DESC;
    SELECT TOP 5 Id, OrderDate FROM Orders ORDER BY OrderDate DESC;
    """;
using var multi = await conn.QueryMultipleAsync(sql);
var dashboard = new Dashboard(
    await multi.ReadSingleAsync<int>(),
    (await multi.ReadAsync<ProductSales>()).ToList(),
    (await multi.ReadAsync<Order>()).ToList());`,
    },
    {
      task: 'Create a table type dbo.ItemList(Product NVARCHAR(100), Qty INT, Price DECIMAL(10,2)) and a procedure that inserts all rows for an order. Call it from Dapper with a TVP.',
      hint: 'dataTable.AsTableValuedParameter("dbo.ItemList")',
      solution: `-- SQL
CREATE TYPE dbo.ItemList AS TABLE (Product NVARCHAR(100), Qty INT, Price DECIMAL(10,2));
GO
CREATE OR ALTER PROCEDURE dbo.usp_AddItems @OrderId INT, @Items dbo.ItemList READONLY AS
    INSERT INTO OrderItems (OrderId, Product, Qty, Price)
    SELECT @OrderId, Product, Qty, Price FROM @Items;

// C#
var dt = new DataTable();
dt.Columns.Add("Product", typeof(string));
dt.Columns.Add("Qty", typeof(int));
dt.Columns.Add("Price", typeof(decimal));
dt.Rows.Add("Eraser", 10, 5m);
dt.Rows.Add("Sharpener", 5, 10m);
await conn.ExecuteAsync("dbo.usp_AddItems",
    new { OrderId = 2, Items = dt.AsTableValuedParameter("dbo.ItemList") },
    commandType: CommandType.StoredProcedure);`,
    },
    {
      task: 'Your team must build (a) an admin CRUD app for 30 tables, (b) a reporting API with 15 complex SQL reports, (c) a nightly import of 2 lakh rows from CSV. Choose EF Core, Dapper or ADO.NET for each and justify.',
      hint: 'Think productivity vs control vs raw speed.',
      solution: `(a) EF Core - change tracking, migrations, LINQ and relationships save a lot of code for CRUD.
(b) Dapper - reports need hand-tuned SQL (CTEs, window functions); Dapper maps results quickly with full SQL control.
(c) ADO.NET SqlBulkCopy - streams 200,000 rows using the bulk-load protocol in seconds; row-by-row inserts would take minutes.`,
    },
  ],
  quiz: [
    {
      question: 'In conn.Query<Order, Customer, Order>(sql, map, splitOn: "CustomerId"), which object receives the CustomerId column?',
      options: ['Order', 'Customer', 'Both', 'Neither'],
      answer: 1,
      explanation: 'The split column is the first column of the next object.',
    },
    {
      question: 'Without extra code, a one-to-many query for 2 orders with 5 items in total returns how many Order objects?',
      options: ['2', '1', '7', '5'],
      answer: 3,
      explanation: 'The map function runs once per row (5 rows), creating a new Order each time unless you de-duplicate with a dictionary.',
    },
    {
      question: 'What is TRUE about QueryMultiple?',
      options: ['Result sets must be read in the order of the SELECT statements', 'It opens one connection per SELECT', 'It can only read two result sets', 'It is only for stored procedures'],
      answer: 0,
      explanation: 'The GridReader moves forward through result sets, so read them in order.',
    },
    {
      question: 'Which is the fastest way to insert 100,000 rows into SQL Server from .NET?',
      options: ['conn.Execute(sql, listOf100000)', 'A foreach loop with ExecuteNonQuery', 'SqlBulkCopy', 'EF Core Add + SaveChanges per row'],
      answer: 2,
      explanation: 'SqlBulkCopy uses SQL Server\'s bulk-load protocol and is far faster than row-by-row INSERTs.',
    },
    {
      question: 'A team needs migrations, change tracking and LINQ for a CRUD-heavy HR app. Which is the best fit?',
      options: ['Raw ADO.NET', 'Dapper', 'DataSet with SqlCommandBuilder', 'EF Core'],
      answer: 3,
      explanation: 'EF Core provides migrations, change tracking and LINQ out of the box.',
    },
  ],
};
