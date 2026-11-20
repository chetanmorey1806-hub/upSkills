const storeScript = `CREATE DATABASE StoreDB;
GO
USE StoreDB;
GO
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL DEFAULT 0
);
INSERT INTO Products (Name, Category, Price, Stock) VALUES
('Notebook', 'Stationery', 45.00, 100),
('Pen Pack', 'Stationery', 120.00, 20),
('School Bag', 'Bags', 899.00, 5),
('Lunch Box', 'Kitchen', 349.00, 12),
('Pencil Box', 'Stationery', 85.00, 40);
GO
SELECT Id, Name, Category, Price, Stock FROM Products WHERE Category = 'Stationery' ORDER BY Price;
SELECT Category, COUNT(*) AS Items FROM Products GROUP BY Category ORDER BY Category;`;

const consoleCode = `// dotnet add package Dapper
// dotnet add package Microsoft.Data.SqlClient
using Dapper;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=StoreDB;Trusted_Connection=True;TrustServerCertificate=True";

// Dapper adds extension methods to IDbConnection. If the connection is closed,
// Dapper opens it for the call and closes it again.
await using var conn = new SqlConnection(cs);

// 1. QueryAsync<T>: many rows -> IEnumerable<Product>. Anonymous object = parameters.
var stationery = await conn.QueryAsync<Product>(
    "SELECT Id, Name, Category, Price, Stock FROM Products WHERE Category = @Category ORDER BY Price",
    new { Category = "Stationery" });
foreach (var p in stationery)
    Console.WriteLine($"{p.Id} {p.Name,-10} {p.Price}");

// 2. QueryFirstOrDefaultAsync<T>: first row or null
var lunchBox = await conn.QueryFirstOrDefaultAsync<Product>(
    "SELECT Id, Name, Category, Price, Stock FROM Products WHERE Id = @Id", new { Id = 4 });
Console.WriteLine(lunchBox is null ? "Not found" : $"Found: {lunchBox.Name} ({lunchBox.Stock} in stock)");

var missing = await conn.QueryFirstOrDefaultAsync<Product>(
    "SELECT Id, Name, Category, Price, Stock FROM Products WHERE Id = @Id", new { Id = 99 });
Console.WriteLine(missing is null ? "Id 99: not found" : "Id 99: found");

// 3. ExecuteAsync: INSERT/UPDATE/DELETE -> rows affected. A typed object works as parameters too.
var newProduct = new Product { Name = "Geometry Box", Category = "Stationery", Price = 150.00m, Stock = 30 };
int inserted = await conn.ExecuteAsync(
    "INSERT INTO Products (Name, Category, Price, Stock) VALUES (@Name, @Category, @Price, @Stock)",
    newProduct);
Console.WriteLine($"Inserted rows: {inserted}");

int updated = await conn.ExecuteAsync(
    "UPDATE Products SET Price = Price * 0.9 WHERE Category = @Category", new { Category = "Bags" });
Console.WriteLine($"Discounted rows: {updated}");

// 4. ExecuteScalarAsync<T>: a single typed value
int count = await conn.ExecuteScalarAsync<int>(
    "SELECT COUNT(*) FROM Products WHERE Category = @Category", new { Category = "Stationery" });
Console.WriteLine($"Stationery items: {count}");

// 5. IN list: Dapper expands an array into (@Ids1, @Ids2, ...)
var names = await conn.QueryAsync<string>(
    "SELECT Name FROM Products WHERE Id IN @Ids ORDER BY Id", new { Ids = new[] { 1, 3 } });
Console.WriteLine("Picked: " + string.Join(", ", names));

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}`;

const mapperCode = `using System;
using System.Collections.Generic;

// Two rows as SQL Server returns them: column name -> value.
// Notice the column names do not match the C# casing exactly, and one column has no property.
var rows = new List<Dictionary<string, object?>>
{
    new() { ["Id"] = 1, ["NAME"] = "Notebook", ["price"] = 45m, ["Category"] = "Stationery" },
    new() { ["Id"] = 2, ["NAME"] = "Pen Pack", ["price"] = 120m, ["Category"] = "Stationery" },
};

foreach (var p in Map<Product>(rows))
    Console.WriteLine(p);

// A tiny version of what Dapper does for Query<T> (real Dapper generates fast IL code and caches it)
static IEnumerable<T> Map<T>(List<Dictionary<string, object?>> rows) where T : new()
{
    var props = typeof(T).GetProperties();
    foreach (var row in rows)
    {
        var item = new T();
        foreach (var (column, value) in row)
        {
            // match column -> property by name, ignoring case
            var prop = Array.Find(props, p => string.Equals(p.Name, column, StringComparison.OrdinalIgnoreCase));
            if (prop is null)
            {
                Console.WriteLine($"  (column {column} has no property - ignored)");
                continue;
            }
            prop.SetValue(item, value);
        }
        yield return item;
    }
}

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }          // not in the SELECT -> keeps its default 0
    public override string ToString() => $"#{Id} {Name} Rs.{Price} stock={Stock}";
}`;

const apiCode = `// dotnet new webapi -n StoreApi --use-controllers
// cd StoreApi ; dotnet add package Dapper ; dotnet add package Microsoft.Data.SqlClient

// ===== appsettings.json =====
{
  "ConnectionStrings": {
    "StoreDb": "Server=localhost;Database=StoreDB;Trusted_Connection=True;TrustServerCertificate=True"
  }
}

// ===== Models/Product.cs =====
namespace StoreApi.Models;
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}
public record CreateProductDto(string Name, string Category, decimal Price, int Stock);

// ===== Data/IDbConnectionFactory.cs =====
using System.Data;
using Microsoft.Data.SqlClient;
namespace StoreApi.Data;
public interface IDbConnectionFactory { IDbConnection Create(); }
public class SqlConnectionFactory(IConfiguration config) : IDbConnectionFactory
{
    private readonly string _cs = config.GetConnectionString("StoreDb")
        ?? throw new InvalidOperationException("Missing connection string StoreDb");
    public IDbConnection Create() => new SqlConnection(_cs);
}

// ===== Repositories/IProductRepository.cs + ProductRepository.cs =====
using Dapper;
using StoreApi.Data;
using StoreApi.Models;
namespace StoreApi.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAllAsync(string? category);
    Task<Product?> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateProductDto dto);
    Task<bool> UpdateStockAsync(int id, int stock);
    Task<bool> DeleteAsync(int id);
}

public class ProductRepository(IDbConnectionFactory factory) : IProductRepository
{
    private const string Columns = "Id, Name, Category, Price, Stock";

    public async Task<IEnumerable<Product>> GetAllAsync(string? category)
    {
        using var conn = factory.Create();
        // optional filter without string concatenation
        return await conn.QueryAsync<Product>(
            $"SELECT {Columns} FROM Products WHERE (@Category IS NULL OR Category = @Category) ORDER BY Name",
            new { Category = category });
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        using var conn = factory.Create();
        return await conn.QuerySingleOrDefaultAsync<Product>(
            $"SELECT {Columns} FROM Products WHERE Id = @id", new { id });
    }

    public async Task<int> CreateAsync(CreateProductDto dto)
    {
        using var conn = factory.Create();
        return await conn.ExecuteScalarAsync<int>("""
            INSERT INTO Products (Name, Category, Price, Stock)
            OUTPUT INSERTED.Id
            VALUES (@Name, @Category, @Price, @Stock)
            """, dto);
    }

    public async Task<bool> UpdateStockAsync(int id, int stock)
    {
        using var conn = factory.Create();
        return await conn.ExecuteAsync("UPDATE Products SET Stock = @stock WHERE Id = @id", new { id, stock }) == 1;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var conn = factory.Create();
        return await conn.ExecuteAsync("DELETE FROM Products WHERE Id = @id", new { id }) == 1;
    }
}

// ===== Controllers/ProductsController.cs =====
using Microsoft.AspNetCore.Mvc;
using StoreApi.Models;
using StoreApi.Repositories;
namespace StoreApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category) => Ok(await repo.GetAllAsync(category));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id) =>
        await repo.GetByIdAsync(id) is { } p ? Ok(p) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        int id = await repo.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id }, await repo.GetByIdAsync(id));
    }

    [HttpPatch("{id:int}/stock")]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] int stock) =>
        await repo.UpdateStockAsync(id, stock) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await repo.DeleteAsync(id) ? NoContent() : NotFound();
}

// ===== Program.cs =====
using StoreApi.Data;
using StoreApi.Repositories;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();   // just holds the string
builder.Services.AddScoped<IProductRepository, ProductRepository>();

var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.MapControllers();
app.Run();`;

export default {
  id: 'day-03-dapper-basics',
  title: 'Dapper Basics: Query, QueryFirstOrDefault, Execute and a Dapper Repository in Web API',
  module: 'Module 1: Data Access – ADO.NET & Dapper',
  day: 3,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Dapper is a micro-ORM from the Stack Overflow team: you still write SQL, but Dapper opens the connection, adds parameters and maps rows to your C# classes in one line. Learn Query<T>, QueryFirstOrDefault, QuerySingle, Execute and ExecuteScalar, parameters with anonymous objects, async methods, and build a clean Dapper repository behind an ASP.NET Core Web API.',
  objectives: [
    'Explain what a micro-ORM is and how Dapper maps columns to properties',
    'Use Query, QueryFirst/FirstOrDefault/Single/SingleOrDefault, Execute and ExecuteScalar (sync and async)',
    'Pass parameters with anonymous objects, typed objects, IN lists and DynamicParameters',
    'Build an IProductRepository implemented with Dapper and use it from a Web API controller',
  ],
  theory: [
    {
      heading: 'What is Dapper (micro-ORM)?',
      content:
        'Plain ADO.NET needs many lines for every query: create the command, add each parameter, loop over the reader and copy each column into a property. Dapper removes that boilerplate. It is a set of extension methods on IDbConnection (so it works with SqlConnection, NpgsqlConnection, MySqlConnection, SQLite) that runs your SQL and maps result columns to object properties by name. It is called a micro-ORM because it does NOT track changes, generate SQL, handle migrations or relationships automatically - you write the SQL. In return it is almost as fast as a hand-written SqlDataReader. Stack Overflow built it for their high-traffic pages, and many Indian product companies use it for read-heavy APIs and reports.',
      syntax: `dotnet add package Dapper
dotnet add package Microsoft.Data.SqlClient

using Dapper;   // brings Query, Execute ... onto the connection`,
      points: [
        'Mapping is by column name, case-insensitive; extra columns are ignored, missing ones keep default values',
        'Use column aliases when names differ: SELECT emp_name AS Name',
        'Dapper caches the generated mapping code per query, so the second call is very fast',
        'If the connection is closed, Dapper opens it for the call and closes it afterwards',
      ],
    },
    {
      heading: 'Query methods',
      content:
        'Pick the method by how many rows you expect. All have async versions (QueryAsync, QueryFirstOrDefaultAsync ...) which you should use in ASP.NET Core. Query<T> returns IEnumerable<T>; by default the results are buffered (loaded into a List), so it is safe to close the connection afterwards.',
      points: [
        'Query<T>: 0..n rows -> IEnumerable<T> (empty, never null, when there are no rows)',
        'QueryFirst<T>: first row; throws if there are no rows',
        'QueryFirstOrDefault<T>: first row or default(T) (null for classes)',
        'QuerySingle<T>: exactly one row; throws if 0 or more than 1',
        'QuerySingleOrDefault<T>: 0 or 1 row; throws if more than 1 (good for lookups by primary key)',
        'Query<string> or Query<int>: map a single column to a simple type',
        'Query (non-generic) returns dynamic rows: row.Name - handy for quick scripts, not for APIs',
      ],
    },
    {
      heading: 'Execute and ExecuteScalar',
      content:
        'Execute runs INSERT, UPDATE, DELETE or any command and returns the number of rows affected - the same as ExecuteNonQuery. ExecuteScalar<T> returns the first column of the first row already converted to T, for example a COUNT or the Id returned by OUTPUT INSERTED.Id. If you pass a list of objects to Execute, Dapper runs the command once per item (useful but not a real bulk insert - see Day 4).',
      syntax: `int rows = await conn.ExecuteAsync("DELETE FROM Products WHERE Id = @Id", new { Id = 7 });
int newId = await conn.ExecuteScalarAsync<int>(
    "INSERT INTO Products (Name, Price) OUTPUT INSERTED.Id VALUES (@Name, @Price)", product);
decimal total = await conn.ExecuteScalarAsync<decimal>("SELECT SUM(Price * Stock) FROM Products");`,
    },
    {
      heading: 'Parameters in Dapper',
      content:
        'Dapper parameters are always real SQL parameters, so they are safe from SQL injection. Pass an anonymous object whose property names match the @names in the SQL, or pass your own typed object (its properties are used). For an IN clause pass an array or list and write WHERE Id IN @Ids without brackets - Dapper expands it. Use DynamicParameters when you need to add parameters conditionally, set exact types, or use output parameters. For strings, DbString lets you choose VARCHAR vs NVARCHAR and length, which avoids index problems on VARCHAR columns.',
      syntax: `new { Category = "Bags", MinPrice = 100m }               // anonymous object
new { Ids = new[] { 1, 3, 5 } }                            // WHERE Id IN @Ids
var p = new DynamicParameters();
p.Add("@City", city, DbType.String, size: 50);
if (minMarks is not null) p.Add("@MinMarks", minMarks);
new { Code = new DbString { Value = "IN-01", IsAnsi = true, Length = 10 } }   // VARCHAR(10)`,
      tip: 'Never build the SQL string with $"... {value}" for values. String interpolation is fine only for constant pieces you control (like a column list constant), never for user input.',
    },
    {
      heading: 'Dapper in an ASP.NET Core Web API repository',
      content:
        'In a Web API, keep SQL out of controllers. Create an IProductRepository interface with methods like GetByIdAsync, and a ProductRepository class that uses Dapper. The repository creates a new connection per method from a small IDbConnectionFactory (registered as a singleton, because it only holds the connection string), and the repository itself is registered as scoped. The controller depends only on the interface, so it can be unit-tested with a fake repository, and you could later switch the implementation to EF Core without changing the controller.',
      points: [
        'Register: AddSingleton<IDbConnectionFactory, SqlConnectionFactory>() and AddScoped<IProductRepository, ProductRepository>()',
        'Use async methods all the way: controller -> repository -> QueryAsync',
        'Return null / false from the repository and let the controller decide 404 vs 200',
        'Pass CancellationToken with new CommandDefinition(sql, param, cancellationToken: ct) for long queries',
      ],
    },
  ],
  examples: [
    {
      title: 'Create StoreDB for the Dapper days',
      scenario: 'A school stationery shop sells notebooks, bags and lunch boxes. Create the StoreDB database and look at the data we will query from Dapper.',
      steps: [
        'Open SSMS (or the in-app SSMS Lab) and click New Query',
        'Paste the script and press F5',
        'Keep the database: Examples 2 and 4 and tomorrow\'s lesson use it',
      ],
      code: storeScript,
      tsql: storeScript,
      result: `(5 rows affected)
+----+------------+------------+-------+-------+
| Id | Name       | Category   | Price | Stock |
+----+------------+------------+-------+-------+
| 1  | Notebook   | Stationery | 45    | 100   |
| 5  | Pencil Box | Stationery | 85    | 40    |
| 2  | Pen Pack   | Stationery | 120   | 20    |
+----+------------+------------+-------+-------+
+------------+-------+
| Category   | Items |
+------------+-------+
| Bags       | 1     |
| Kitchen    | 1     |
| Stationery | 3     |
+------------+-------+`,
      explanation: 'The first SELECT is exactly the SQL Dapper will run in Example 2 with @Category = \'Stationery\'. The lab prints DECIMAL without trailing zeros; real SQL Server shows 45.00, 85.00 and 120.00.',
    },
    {
      title: 'Dapper CRUD in a console app',
      scenario: 'Use every basic Dapper method against StoreDB: list stationery, find one product, handle a missing product, insert, update, count and pick by an IN list.',
      steps: [
        'File > New > Project > Console App, name it DapperBasics (.NET 8)',
        'In Package Manager Console: Install-Package Dapper and Install-Package Microsoft.Data.SqlClient',
        'Replace Program.cs with the code (top-level statements, Product class at the bottom) and press Ctrl+F5',
        'Run the Example 1 script again before re-running, otherwise the insert and discount happen twice',
      ],
      code: consoleCode,
      result: `1 Notebook   45.00
5 Pencil Box 85.00
2 Pen Pack   120.00
Found: Lunch Box (12 in stock)
Id 99: not found
Inserted rows: 1
Discounted rows: 1
Stationery items: 4
Picked: Notebook, School Bag`,
      explanation:
        'Compare with Day 1: no SqlCommand, no Parameters.Add, no reader loop - Dapper did it. The anonymous object new { Category = "Stationery" } became the @Category parameter. QueryFirstOrDefault returned null for Id 99 instead of throwing. Execute returns rows affected (1 product inserted, 1 bag discounted). After the insert there are 4 stationery items. new[] { 1, 3 } was expanded to IN (@Ids1, @Ids2). The connection was never opened manually - Dapper opened and closed it for each call. Decimal columns from SQL Server keep their scale, so 45.00 prints with two decimals.',
    },
    {
      title: 'How Dapper maps columns to properties (mini mapper)',
      scenario:
        'Interviewers ask "how does Dapper know which column goes to which property?" Write a tiny reflection-based mapper that follows the same rules: match by name ignoring case, ignore extra columns, leave missing properties at default values.',
      steps: [
        'File > New > Project > Console App, name it MiniMapper (no database needed)',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Add ["stock"] = 7 to the first row and run again - Stock is now filled',
      ],
      code: mapperCode,
      csharp: { files: { 'Program.cs': mapperCode }, stdin: '' },
      result: `  (column Category has no property - ignored)
#1 Notebook Rs.45 stock=0
  (column Category has no property - ignored)
#2 Pen Pack Rs.120 stock=0`,
      explanation:
        'NAME and price still map to Name and Price because the match ignores case, just like Dapper. Category has no property, so it is skipped (Dapper silently ignores it). Stock was not in the "SELECT", so it keeps 0 - a common bug when you forget a column in your SQL. Because Map uses yield return, each row is mapped only when foreach asks for it, so the "ignored" message prints just before each product. Real Dapper does the same matching but emits compiled IL once per query and caches it, which is why it is nearly as fast as hand-written ADO.NET.',
    },
    {
      title: 'Dapper repository behind an ASP.NET Core Web API',
      scenario: 'Build StoreApi: GET all products (optional category filter), GET by id, POST, PATCH stock and DELETE, with all SQL inside a Dapper repository.',
      steps: [
        'Run: dotnet new webapi -n StoreApi --use-controllers (or Visual Studio > ASP.NET Core Web API, tick "Use controllers")',
        'dotnet add package Dapper and dotnet add package Microsoft.Data.SqlClient',
        'Create the folders Models, Data, Repositories, Controllers and add the files shown',
        'Press F5 and test in Swagger: GET /api/products?category=Bags, GET /api/products/2, POST with JSON, PATCH /api/products/2/stock with body 15, DELETE /api/products/99',
      ],
      code: apiCode,
      result: `GET /api/products?category=Bags -> 200 OK
[ { "id": 3, "name": "School Bag", "category": "Bags", "price": 899.00, "stock": 5 } ]

GET /api/products/2 -> 200 OK
{ "id": 2, "name": "Pen Pack", "category": "Stationery", "price": 120.00, "stock": 20 }

POST /api/products  { "name": "Water Bottle", "category": "Kitchen", "price": 199, "stock": 25 }
-> 201 Created   Location: /api/products/6

PATCH /api/products/2/stock   body: 15   -> 204 No Content
DELETE /api/products/99                  -> 404 Not Found`,
      explanation:
        'The controller never sees SQL; it talks to IProductRepository. (@Category IS NULL OR Category = @Category) makes the filter optional with a single parameterized query. QuerySingleOrDefault fits a primary-key lookup: null means 404, and two rows would throw (a data bug you want to notice). CreateAsync uses OUTPUT INSERTED.Id with ExecuteScalar so the controller can return 201 with a Location header. Each repository method creates and disposes its own connection, and pooling keeps that cheap. The new Id (6 here) depends on earlier inserts. Prices show the database values (899.00) if you start from the Example 1 script.',
    },
  ],
  interview: [
    { q: 'What is Dapper and why is it called a micro-ORM?', a: 'Dapper is an open-source library of extension methods on IDbConnection that executes SQL and maps results to objects. It is "micro" because it only does mapping and parameters: no change tracking, no LINQ-to-SQL translation, no migrations, no lazy loading. You write the SQL yourself.', level: 'Easy' },
    { q: 'How does Dapper map columns to properties?', a: 'By name, case-insensitively. Columns without a matching property are ignored and properties without a column keep their default value. It can also map to constructor parameters (records) when column names and types match. Use SQL aliases or DefaultTypeMap.MatchNamesWithUnderscores = true for snake_case columns.', level: 'Easy' },
    { q: 'Difference between QueryFirst, QueryFirstOrDefault, QuerySingle and QuerySingleOrDefault?', a: 'First: returns the first row, throws if none. FirstOrDefault: first row or default. Single: throws if zero or more than one row. SingleOrDefault: default if zero, throws if more than one. Use SingleOrDefault for primary-key lookups so duplicates are detected.', level: 'Medium' },
    { q: 'Is Dapper safe from SQL injection?', a: 'Yes, as long as values are passed as parameters (anonymous object, DynamicParameters). Dapper sends them as real SqlParameters. It is NOT safe if you build the SQL string with interpolation or concatenation of user input.', level: 'Easy' },
    { q: 'How do you write an IN query in Dapper?', a: 'Pass an IEnumerable and write WHERE Id IN @Ids (no parentheses). Dapper expands it to IN (@Ids1, @Ids2, ...). For very large lists use a table-valued parameter or a temp table instead because SQL Server allows at most 2100 parameters.', level: 'Medium' },
    { q: 'What does Execute return, and what happens if you pass a list of objects?', a: 'It returns the total rows affected. With an IEnumerable parameter, Dapper executes the command once per element (inside the same connection), which is convenient but means N round trips - not a true bulk insert.', level: 'Medium' },
    { q: 'What is the difference between buffered and unbuffered queries?', a: 'By default Query buffers: all rows are read into a List before returning, so the connection can be closed and you can enumerate many times. With buffered: false (or QueryUnbufferedAsync) rows are streamed while you iterate, which saves memory for huge results but keeps the reader and connection open during the loop.', level: 'Hard' },
    { q: 'Do you need to open the connection before calling Dapper methods?', a: 'No. If the connection is closed, Dapper opens it before the command and closes it after. If you opened it yourself (for example for a transaction or several commands), Dapper leaves it open.', level: 'Medium' },
    { q: 'How do you get the identity of a newly inserted row with Dapper?', a: 'Use ExecuteScalar<int> (or QuerySingle<int>) with INSERT ... OUTPUT INSERTED.Id VALUES (...) or INSERT ...; SELECT CAST(SCOPE_IDENTITY() AS INT);', level: 'Easy' },
    { q: 'When would you use DynamicParameters?', a: 'When parameters are added conditionally (dynamic search filters), when you need exact DbType/size/precision, and for output or return-value parameters of stored procedures (read with p.Get<int>("@Id")).', level: 'Medium' },
    { q: 'How do you register a Dapper repository in ASP.NET Core DI and why that lifetime?', a: 'A connection factory holding the connection string can be a singleton. The repository is usually scoped (one per request). Connections themselves are created per method or per request, never singleton, because SqlConnection is not thread-safe.', level: 'Medium' },
    { q: 'Your Dapper query returns objects with Name = null even though the table has data. What is wrong?', a: 'The column name does not match the property name, e.g. the table column is emp_name or the SELECT uses an alias like FullName. Fix with an alias (SELECT emp_name AS Name), a custom type map, or MatchNamesWithUnderscores.', level: 'Medium' },
    { q: 'Why can VARCHAR columns become slow with Dapper string parameters, and how do you fix it?', a: 'Dapper sends .NET strings as NVARCHAR(4000) by default. Comparing a VARCHAR column with an NVARCHAR parameter forces an implicit conversion of the column, which can turn an index seek into a scan. Use new DbString { Value = x, IsAnsi = true, Length = 20 } or DynamicParameters with DbType.AnsiString.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write GetLowStockAsync(int max) that returns products with Stock <= max ordered by Stock using Dapper.',
      hint: 'QueryAsync<Product> with new { max }.',
      solution: `public async Task<IEnumerable<Product>> GetLowStockAsync(int max)
{
    using var conn = factory.Create();
    return await conn.QueryAsync<Product>(
        "SELECT Id, Name, Category, Price, Stock FROM Products WHERE Stock <= @max ORDER BY Stock",
        new { max });
}`,
    },
    {
      task: 'Write a search method with optional filters: category (string?) and maxPrice (decimal?). Only add a WHERE condition for filters that are not null.',
      hint: 'Use a StringBuilder for the constant SQL pieces and DynamicParameters for the values.',
      solution: `public async Task<IEnumerable<Product>> SearchAsync(string? category, decimal? maxPrice)
{
    var sql = new StringBuilder("SELECT Id, Name, Category, Price, Stock FROM Products WHERE 1 = 1");
    var p = new DynamicParameters();
    if (!string.IsNullOrWhiteSpace(category)) { sql.Append(" AND Category = @category"); p.Add("category", category); }
    if (maxPrice is not null) { sql.Append(" AND Price <= @maxPrice"); p.Add("maxPrice", maxPrice); }
    sql.Append(" ORDER BY Price");
    using var conn = factory.Create();
    return await conn.QueryAsync<Product>(sql.ToString(), p);
}`,
    },
    {
      task: 'The table Employees has columns emp_id, emp_name, monthly_salary. Map it to class Employee { int Id; string Name; decimal Salary; } with Dapper.',
      hint: 'Use column aliases in the SELECT.',
      solution: `var employees = await conn.QueryAsync<Employee>(
    "SELECT emp_id AS Id, emp_name AS Name, monthly_salary AS Salary FROM Employees");`,
    },
    {
      task: 'Add GET /api/products/summary to StoreApi returning the number of products and the total stock value (Price * Stock) as one JSON object.',
      hint: 'QuerySingleAsync<StockSummary> with SELECT COUNT(*) AS Products, SUM(Price * Stock) AS StockValue.',
      solution: `public record StockSummary(int Products, decimal StockValue);

// repository
public async Task<StockSummary> GetSummaryAsync()
{
    using var conn = factory.Create();
    return await conn.QuerySingleAsync<StockSummary>(
        "SELECT COUNT(*) AS Products, CAST(SUM(Price * Stock) AS DECIMAL(18,2)) AS StockValue FROM Products");
}

// controller
[HttpGet("summary")]
public async Task<IActionResult> Summary() => Ok(await repo.GetSummaryAsync());`,
    },
    {
      task: 'Delete several products in one call: DeleteManyAsync(int[] ids) returning how many rows were deleted.',
      hint: 'WHERE Id IN @ids',
      solution: `public async Task<int> DeleteManyAsync(int[] ids)
{
    using var conn = factory.Create();
    return await conn.ExecuteAsync("DELETE FROM Products WHERE Id IN @ids", new { ids });
}`,
    },
  ],
  quiz: [
    {
      question: 'Which Dapper method should you use to look up a product by primary key and get null when it does not exist?',
      options: ['QueryFirst', 'QuerySingle', 'QuerySingleOrDefault', 'Execute'],
      answer: 2,
      explanation: 'QuerySingleOrDefault returns null for 0 rows and throws for more than 1, which suits a primary-key lookup.',
    },
    {
      question: 'What does conn.ExecuteAsync("UPDATE Products SET Stock = 0 WHERE Category = @c", new { c = "Bags" }) return?',
      options: ['The number of rows affected', 'The updated products', 'true or false', 'The first column of the first row'],
      answer: 0,
      explanation: 'Execute is Dapper\'s ExecuteNonQuery and returns rows affected.',
    },
    {
      question: 'How do you query products whose Id is 1, 3 or 5 with Dapper?',
      options: [
        '"WHERE Id IN (@Ids)" with new { Ids = "1,3,5" }',
        '"WHERE Id = @Ids" with new { Ids = new[] {1,3,5} }',
        '$"WHERE Id IN ({string.Join(",", ids)})"',
        '"WHERE Id IN @Ids" with new { Ids = new[] {1,3,5} }',
      ],
      answer: 3,
      explanation: 'Dapper expands an enumerable parameter used as IN @Ids into separate parameters.',
    },
    {
      question: 'The SELECT returns a column "FullName" but the class property is "Name". What happens?',
      options: ['Dapper throws an exception', 'Name stays null (default) and FullName is ignored', 'Dapper guesses the mapping', 'The query fails in SQL Server'],
      answer: 1,
      explanation: 'Unmatched columns are ignored and unmatched properties keep their default. Use SELECT FullName AS Name.',
    },
    {
      question: 'Which is NOT a feature of Dapper?',
      options: ['Mapping rows to objects', 'Parameterized queries', 'Automatic change tracking and SaveChanges', 'Async methods'],
      answer: 2,
      explanation: 'Change tracking is an EF Core feature. Dapper only executes your SQL and maps results.',
    },
  ],
};
