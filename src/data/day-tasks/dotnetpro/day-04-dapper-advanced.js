const ORDERS = `CREATE TABLE Customers (
    CustomerId INT PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    City NVARCHAR(50) NOT NULL
);
CREATE TABLE Orders (
    Id INT PRIMARY KEY,
    CustomerId INT NOT NULL,
    OrderDate DATE NOT NULL
);
CREATE TABLE OrderItems (
    ItemId INT PRIMARY KEY,
    OrderId INT NOT NULL,
    Product NVARCHAR(100) NOT NULL,
    Qty INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL
);
INSERT INTO Customers VALUES (1, 'Asha Patil', 'Pune'), (2, 'Ravi Kumar', 'Chennai'), (3, 'Neha Sharma', 'Delhi');
INSERT INTO Orders VALUES (1, 1, '2025-07-01'), (2, 2, '2025-07-02'), (3, 1, '2025-07-05');
INSERT INTO OrderItems VALUES
(1, 1, 'Notebook', 5, 45),
(2, 1, 'Pen Pack', 2, 120),
(3, 2, 'School Bag', 1, 899),
(4, 3, 'Lunch Box', 1, 349);`;

export default {
  lesson: 'day-04-dapper-advanced',
  minutes: 30,
  intro: 'Practise multi-mapping with splitOn, the one-to-many dictionary pattern, QueryMultiple, stored procedures, bulk inserts and choosing between ADO.NET, Dapper and EF Core.',
  tasks: [
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Write the JOIN for `conn.QueryAsync<Order, Customer, Order>(sql, map, splitOn: "CustomerId")`. Return the order columns `Id`, `OrderDate` **first**, then the customer columns `CustomerId`, `Name`, `City`, for every order, ordered by order `Id`.',
      example: { title: 'column order matters for splitOn', code: 'SELECT e.EmpId, e.Name, d.DeptId, d.DeptName\nFROM Employees e INNER JOIN Departments d ON d.DeptId = e.DeptId;' },
      setup: ORDERS,
      starter: '-- SELECT o.Id, o.OrderDate, c.CustomerId, ...\n',
      solution: 'SELECT o.Id, o.OrderDate, c.CustomerId, c.Name, c.City\nFROM Orders o\nINNER JOIN Customers c ON c.CustomerId = o.CustomerId\nORDER BY o.Id;',
      ordered: true,
      explain: 'Dapper splits each row by POSITION: everything before the splitOn column goes to the first type (Order), and from `CustomerId` onwards to the second type (Customer). So the order columns must come first, and the customer block must start with `CustomerId`. Neha has no orders, so the INNER JOIN leaves her out.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The SELECT is `e.EmpId, e.Name, d.DeptId, d.DeptName` and you call `Query<Employee, Department, Employee>` **without** `splitOn`. What happens?',
      options: [
        'Dapper guesses DeptId automatically',
        'Dapper throws an error asking you to set splitOn, because the default split column "Id" is not in the result',
        'Both objects receive all columns',
        'The Department is always null but no error occurs',
      ],
      answer: 1,
      explain: 'The default `splitOn` is `"Id"`. There is no column called exactly Id, so Dapper throws "When using the multi-mapping APIs ensure you set the splitOn param if you have keys other than Id". Fix: `splitOn: "DeptId"`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The JOIN for this one-to-many query returns **4 rows**: (order 7, Pen), (order 7, Ink), (order 9, Bag), (order 7, Pad). What does the program print?',
      example: { title: 'remember', code: 'Dapper calls the map function once for EVERY row of the result.' },
      code: `int calls = 0;
var lookup = new Dictionary<int, Order>();

await conn.QueryAsync<Order, Item, Order>(sql, (order, item) =>
{
    calls++;
    if (!lookup.TryGetValue(order.Id, out var existing))
    {
        existing = order;
        lookup.Add(order.Id, existing);
    }
    existing.Items.Add(item.Name);
    return existing;
}, splitOn: "ItemId");

Console.WriteLine(calls);
Console.WriteLine(lookup.Count);
Console.WriteLine(string.Join(",", lookup[7].Items));`,
      expected: `4
2
Pen,Ink,Pad`,
      explain: 'The map function runs once per row, so `calls` is 4. The dictionary keeps one Order per Id (7 and 9), so it has 2 entries. Order 7 receives its three items in row order: Pen, Ink, Pad - even though Pad came after order 9. Without the dictionary you would get 4 Order objects.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Three SELECTs are sent in one batch. Complete the Dapper method that returns a reader for **multiple result sets**:
\`using var grid = await conn.______(sql, new { Id = id });\``,
      example: { title: 'reading the results', code: 'var order = await grid.ReadSingleOrDefaultAsync<Order>();\nvar items = (await grid.ReadAsync<OrderItem>()).ToList();' },
      accept: ['QueryMultipleAsync', 'QueryMultiple'],
      caseSensitive: true,
      explain: '`QueryMultipleAsync` returns a GridReader. Read the result sets in the same order as the SELECT statements; it saves database round trips compared with three separate queries.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'You must import **2 lakh (200,000)** product rows from a CSV file every night. Which approaches are good choices? Select all that apply.',
      options: [
        '`SqlBulkCopy` with a DataTable or IDataReader',
        'A table-valued parameter passed to a stored procedure that does `INSERT ... SELECT`',
        '`conn.Execute(insertSql, listOf200000)` without a transaction',
        'A foreach loop calling EF Core `Add` and `SaveChanges` for each row',
      ],
      answers: [0, 1],
      explain: 'SqlBulkCopy uses the bulk-load protocol and TVPs send all rows in one call. Dapper\'s Execute with a list still runs one INSERT per item (200,000 round trips), and SaveChanges per row is even slower.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the line that adds an OUTPUT parameter to Dapper's DynamicParameters:
\`p.Add("@OrderCount", dbType: DbType.Int32, direction: ParameterDirection.______);\``,
      example: { title: 'reading it afterwards', code: 'int count = p.Get<int>("@OrderCount");' },
      accept: ['Output', 'InputOutput'],
      caseSensitive: true,
      explain: 'With `ParameterDirection.Output` Dapper reads the value back after execution, and `p.Get<int>` returns it. If the procedure also returns rows, read them all first (a buffered Query does that for you).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A fintech team has a heavy **reporting API** with 20 hand-tuned SQL queries (CTEs, window functions) and **no** need for change tracking. What is the best data access choice?',
      options: ['Dapper', 'DataSet + SqlCommandBuilder', 'EF Core with lazy loading', 'Writing SQL inside Razor views'],
      answer: 0,
      explain: 'Dapper gives full control of complex SQL with near-ADO.NET speed and maps results to DTOs with little code. EF Core shines for CRUD with tracking and migrations; DataSets are heavy and untyped.',
    },
  ],
};
