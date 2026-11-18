export default {
  id: 'extra-51-ef-core-raw-sql-stored-procedures',
  title: 'EF Core Raw SQL, Stored Procedure Integration and Connection Strings',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 51,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Drop down to SQL when LINQ is not enough: FromSql / FromSqlRaw for entities, Database.SqlQuery<T> for any type, ExecuteSql for commands, calling stored procedures with input and OUTPUT parameters, keyless entities for views and SP results, mapping inserts/updates/deletes to stored procedures, SQL injection safety, and managing connection strings securely across Development and Production (User Secrets, environment variables, Azure Key Vault, retry and encryption options).',
  objectives: [
    'Choose between LINQ, FromSql, SqlQuery<T> and ExecuteSql for a given task',
    'Call SQL Server stored procedures with input and OUTPUT parameters from EF Core',
    'Map views and stored-procedure results to keyless entities',
    'Explain why FromSql/ExecuteSql interpolation is safe and string concatenation is not',
    'Store connection strings safely and configure resiliency (EnableRetryOnFailure, Encrypt, timeouts)',
  ],
  theory: [
    {
      heading: 'When to use raw SQL with EF Core',
      content: 'LINQ covers most queries, but sometimes you need SQL: existing stored procedures written by a DBA, complex reports with window functions or hints, table-valued functions, full-text search, or performance tuning. EF Core lets you run raw SQL and still get typed C# objects. Rule of thumb: use LINQ by default, raw SQL for the 5% where LINQ is impossible or slow, and ALWAYS use parameters.',
      points: [
        'DbSet<T>.FromSql($"...") - query returning ENTITIES (tracked, can be composed with LINQ when the SQL is a plain SELECT).',
        'Database.SqlQuery<T>($"...") - query returning scalars or ANY class (unmapped types from EF Core 8).',
        'Database.ExecuteSql($"...") / ExecuteSqlAsync - INSERT/UPDATE/DELETE/EXEC that returns rows affected.',
        'The ...Raw versions (FromSqlRaw, ExecuteSqlRaw) take a plain string + parameters: use them only for dynamic SQL you build safely.',
      ],
    },
    {
      heading: 'FromSql and SQL injection safety',
      content: 'FromSql and ExecuteSql accept a FormattableString. When you write db.Products.FromSql($"SELECT * FROM Products WHERE Name = {name}"), C# does NOT build the final string; it passes the format "... WHERE Name = {0}" and the argument separately. EF converts every argument into a DbParameter (@p0). Even if the user types Pen\' OR 1=1 --, it is just a value. String concatenation ("... = \'" + name + "\'") or passing an interpolated string to FromSqlRaw builds executable SQL from user input: SQL injection.',
      syntax: `// SAFE - parameterized automatically
var list = await db.Products
    .FromSql($"SELECT * FROM Products WHERE CategoryId = {categoryId}")
    .Where(p => p.Stock > 0)          // composed: EF wraps the SQL as a subquery
    .OrderBy(p => p.Name)
    .ToListAsync();

// SAFE - explicit parameters with FromSqlRaw
var p = new SqlParameter("@name", name);
var byName = await db.Products.FromSqlRaw("SELECT * FROM Products WHERE Name = @name", p).ToListAsync();

// DANGEROUS - never do this
// db.Products.FromSqlRaw("SELECT * FROM Products WHERE Name = '" + name + "'");`,
      tip: 'Column and table names cannot be parameters. If they must be dynamic (sorting), choose them from a fixed whitelist, never from raw user input.',
    },
    {
      heading: 'Calling stored procedures',
      content: 'A stored procedure that returns rows can be mapped with FromSql (for entity types) or SqlQuery<T> (for DTOs). SP calls are NOT composable: EF cannot wrap EXEC in a subquery, so call AsEnumerable()/ToListAsync() before further LINQ. For procedures that change data and return OUTPUT parameters, use ExecuteSqlRawAsync with SqlParameter objects whose Direction is Output, then read parameter.Value after the call. Errors raised by THROW/RAISERROR in the SP arrive as SqlException (Number 50000+ for custom errors).',
      syntax: `// rows from an SP into a keyless DTO type
var rows = await db.Database
    .SqlQuery<ProductListItem>($"EXEC dbo.usp_GetProductsByCategory @CategoryId = {categoryId}")
    .ToListAsync();

// OUTPUT parameter
var newId = new SqlParameter("@NewOrderId", SqlDbType.Int) { Direction = ParameterDirection.Output };
await db.Database.ExecuteSqlRawAsync(
    "EXEC dbo.usp_PlaceOrder @ProductId, @Quantity, @NewOrderId OUTPUT",
    new SqlParameter("@ProductId", productId),
    new SqlParameter("@Quantity", quantity),
    newId);
int orderId = (int)newId.Value;`,
    },
    {
      heading: 'Keyless entities, views and SP mapping',
      content: 'A keyless entity type (modelBuilder.Entity<T>().HasNoKey()) is read-only: perfect for views, SP results and report rows. Map it to a view with .ToView("vw_SalesSummary") so you can query it with normal LINQ. EF Core 7+ can also send INSERT/UPDATE/DELETE of a normal entity through stored procedures with InsertUsingStoredProcedure, UpdateUsingStoredProcedure and DeleteUsingStoredProcedure - useful when the DBA allows writes only through SPs.',
      syntax: `mb.Entity<SalesSummary>().HasNoKey().ToView("vw_SalesSummary");

mb.Entity<Customer>()
  .InsertUsingStoredProcedure("usp_Customer_Insert", sp =>
  {
      sp.HasParameter(c => c.Name);
      sp.HasResultColumn(c => c.Id);        // identity returned by SELECT SCOPE_IDENTITY()
  });`,
    },
    {
      heading: 'Connection strings: where to keep them',
      content: 'A connection string tells the provider which server, database, and credentials to use. ASP.NET Core reads it with builder.Configuration.GetConnectionString("Default"), which looks for ConnectionStrings:Default in ALL configuration sources. Later sources override earlier ones: appsettings.json -> appsettings.{Environment}.json -> User Secrets (Development only) -> environment variables -> command-line arguments. NEVER commit production passwords to Git.',
      points: [
        'Development: right-click project > Manage User Secrets (or dotnet user-secrets set "ConnectionStrings:Default" "...").',
        'Production: environment variable ConnectionStrings__Default (double underscore = colon), Azure App Service "Connection strings" blade, or Azure Key Vault (AddAzureKeyVault).',
        'Best: no password at all - Azure SQL with Managed Identity: "Server=tcp:x.database.windows.net;Database=Shop;Authentication=Active Directory Default".',
        'LocalDB: Server=(localdb)\\MSSQLLocalDB;Database=ShopDb;Trusted_Connection=True; SQL login: User Id=...;Password=...',
      ],
    },
    {
      heading: 'Connection options and resiliency',
      content: 'Microsoft.Data.SqlClient 4+ encrypts connections by default (Encrypt=True). For a local SQL Server with a self-signed certificate add TrustServerCertificate=True (development only). Other useful keywords: Connect Timeout (seconds to open), Command Timeout (EF option CommandTimeout), MultipleActiveResultSets, Application Name (visible in SSMS Activity Monitor). Cloud databases have short transient failures; EnableRetryOnFailure retries automatically. Connection pooling is ON by default: always dispose connections (DbContext does this) and never keep them open across requests.',
      syntax: `builder.Services.AddDbContext<ShopDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default"), sql =>
    {
        sql.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(10), errorNumbersToAdd: null);
        sql.CommandTimeout(60);
    }));`,
      tip: 'With EnableRetryOnFailure, user-started transactions must run inside db.Database.CreateExecutionStrategy().ExecuteAsync(...) so the whole unit can be retried.',
    },
  ],
  examples: [
    {
      title: 'Stored procedures, a view and raw SQL from a Web API',
      scenario: 'The DBA provides usp_GetProductsByCategory, usp_PlaceOrder (with OUTPUT parameter and stock validation) and a sales view. The Web API must call them through EF Core, plus run one ad-hoc report query.',
      steps: [
        'Open SSMS, connect to (localdb)\\MSSQLLocalDB, click New Query and run the SQL script from the code below (database, tables, view and procedures)',
        'In Visual Studio: File > New > Project > ASP.NET Core Web API; name RawSqlApi; .NET 8/10 > Create',
        'Package Manager Console: Install-Package Microsoft.EntityFrameworkCore.SqlServer',
        'Right-click project > Manage User Secrets and paste the connection string JSON shown below',
        'Add Data/ShopDbContext.cs, Models/*.cs and Controllers/ShopController.cs; press F5 and test in Swagger',
      ],
      code: `-- ===== SQL Server script (run in SSMS) =====
CREATE DATABASE ShopRawDb;
GO
USE ShopRawDb;
GO
CREATE TABLE Categories (Id INT IDENTITY(1,1) PRIMARY KEY, Name NVARCHAR(50) NOT NULL);
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY, Name NVARCHAR(100) NOT NULL,
    CategoryId INT NOT NULL FOREIGN KEY REFERENCES Categories(Id),
    Price DECIMAL(18,2) NOT NULL, Stock INT NOT NULL CHECK (Stock >= 0));
CREATE TABLE Orders (
    Id INT IDENTITY(1,1) PRIMARY KEY, ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    Quantity INT NOT NULL, Total DECIMAL(18,2) NOT NULL, CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME());
GO
INSERT INTO Categories (Name) VALUES ('Stationery'), ('Books');
INSERT INTO Products (Name, CategoryId, Price, Stock) VALUES
('Pen', 1, 10, 100), ('Pencil', 1, 5, 200), ('Notebook', 1, 60, 40), ('C# Basics', 2, 450, 12), ('SQL Guide', 2, 380, 0);
GO
CREATE OR ALTER VIEW dbo.vw_SalesSummary AS
SELECT c.Name AS Category, COUNT(o.Id) AS Orders, ISNULL(SUM(o.Total), 0) AS Revenue
FROM Categories c
JOIN Products p ON p.CategoryId = c.Id
LEFT JOIN Orders o ON o.ProductId = p.Id
GROUP BY c.Name;
GO
CREATE OR ALTER PROCEDURE dbo.usp_GetProductsByCategory @CategoryId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.Id, p.Name, p.Price, p.Stock
    FROM Products p
    WHERE p.CategoryId = @CategoryId AND p.Stock > 0
    ORDER BY p.Name;
END
GO
CREATE OR ALTER PROCEDURE dbo.usp_PlaceOrder
    @ProductId INT, @Quantity INT, @NewOrderId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRAN;
        DECLARE @Price DECIMAL(18,2), @Stock INT;
        SELECT @Price = Price, @Stock = Stock FROM Products WITH (UPDLOCK) WHERE Id = @ProductId;
        IF @Price IS NULL THROW 50001, 'Product not found.', 1;
        IF @Stock < @Quantity THROW 50002, 'Insufficient stock.', 1;
        UPDATE Products SET Stock = Stock - @Quantity WHERE Id = @ProductId;
        INSERT INTO Orders (ProductId, Quantity, Total) VALUES (@ProductId, @Quantity, @Price * @Quantity);
        SET @NewOrderId = SCOPE_IDENTITY();
        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO

// ===== secrets.json (Manage User Secrets) =====
{
  "ConnectionStrings": {
    "Default": "Server=(localdb)\\\\MSSQLLocalDB;Database=ShopRawDb;Trusted_Connection=True;TrustServerCertificate=True;Application Name=RawSqlApi"
  }
}

// ===== Models/Models.cs =====
namespace RawSqlApi.Models;
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int CategoryId { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
}
public class SalesSummary            // keyless, mapped to the view
{
    public string Category { get; set; } = "";
    public int Orders { get; set; }
    public decimal Revenue { get; set; }
}
public record ProductListItem(int Id, string Name, decimal Price, int Stock);   // SP result
public record PlaceOrderDto(int ProductId, int Quantity);

// ===== Data/ShopDbContext.cs =====
using Microsoft.EntityFrameworkCore;
using RawSqlApi.Models;
namespace RawSqlApi.Data;
public class ShopDbContext(DbContextOptions<ShopDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<SalesSummary> SalesSummaries => Set<SalesSummary>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);
        mb.Entity<SalesSummary>().HasNoKey().ToView("vw_SalesSummary");
        mb.Entity<SalesSummary>().Property(s => s.Revenue).HasPrecision(18, 2);
    }
}

// ===== Controllers/ShopController.cs =====
using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using RawSqlApi.Data;
using RawSqlApi.Models;
namespace RawSqlApi.Controllers;

[ApiController]
[Route("api")]
public class ShopController(ShopDbContext db) : ControllerBase
{
    // 1) stored procedure -> DTO list (not composable, so ToListAsync first)
    [HttpGet("categories/{categoryId:int}/products")]
    public async Task<IActionResult> ByCategory(int categoryId) =>
        Ok(await db.Database
            .SqlQuery<ProductListItem>($"EXEC dbo.usp_GetProductsByCategory @CategoryId = {categoryId}")
            .ToListAsync());

    // 2) FromSql on an entity + LINQ composition (plain SELECT is composable)
    [HttpGet("products/search")]
    public async Task<IActionResult> Search(string name, decimal maxPrice = 1000) =>
        Ok(await db.Products
            .FromSql($"SELECT * FROM Products WHERE Name LIKE {"%" + name + "%"}")
            .Where(p => p.Price <= maxPrice)
            .OrderBy(p => p.Price)
            .AsNoTracking()
            .ToListAsync());

    // 3) stored procedure with OUTPUT parameter and custom errors
    [HttpPost("orders")]
    public async Task<IActionResult> PlaceOrder(PlaceOrderDto dto)
    {
        var newId = new SqlParameter("@NewOrderId", SqlDbType.Int) { Direction = ParameterDirection.Output };
        try
        {
            await db.Database.ExecuteSqlRawAsync(
                "EXEC dbo.usp_PlaceOrder @ProductId, @Quantity, @NewOrderId OUTPUT",
                new SqlParameter("@ProductId", dto.ProductId),
                new SqlParameter("@Quantity", dto.Quantity),
                newId);
            return Created($"/api/orders/{newId.Value}", new { orderId = (int)newId.Value });
        }
        catch (SqlException ex) when (ex.Number is 50001 or 50002)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // 4) keyless entity mapped to a view, queried with LINQ
    [HttpGet("reports/sales")]
    public async Task<IActionResult> Sales() =>
        Ok(await db.SalesSummaries.OrderByDescending(s => s.Revenue).ToListAsync());

    // 5) scalar query and bulk command
    [HttpPost("products/increase-prices")]
    public async Task<IActionResult> IncreasePrices(int categoryId, decimal percent)
    {
        int affected = await db.Database.ExecuteSqlAsync(
            $"UPDATE Products SET Price = Price * (1 + {percent} / 100.0) WHERE CategoryId = {categoryId}");
        int total = await db.Database.SqlQuery<int>($"SELECT COUNT(*) AS Value FROM Products").SingleAsync();
        return Ok(new { affected, totalProducts = total });
    }
}

// ===== Program.cs =====
using Microsoft.EntityFrameworkCore;
using RawSqlApi.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<ShopDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default"), sql =>
        sql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null)));

var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.MapControllers();
app.Run();`,
      result: `GET /api/categories/1/products
[{"id":3,"name":"Notebook","price":60.00,"stock":40},{"id":1,"name":"Pen","price":10.00,"stock":100},{"id":2,"name":"Pencil","price":5.00,"stock":200}]

GET /api/products/search?name=pen&maxPrice=50
[{"id":2,"name":"Pencil","categoryId":1,"price":5.00,"stock":200},{"id":1,"name":"Pen","categoryId":1,"price":10.00,"stock":100}]
SQL: SELECT ... FROM (SELECT * FROM Products WHERE Name LIKE @p0) AS [p] WHERE [p].[Price] <= @__maxPrice_1 ORDER BY [p].[Price]

POST /api/orders {"productId":1,"quantity":10}   -> 201 {"orderId":1}
POST /api/orders {"productId":5,"quantity":1}    -> 400 {"message":"Insufficient stock."}

GET /api/reports/sales
[{"category":"Stationery","orders":1,"revenue":100.00},{"category":"Books","orders":0,"revenue":0.00}]

POST /api/products/increase-prices?categoryId=2&percent=10 -> {"affected":2,"totalProducts":5}`,
      explanation: 'Every interpolated value - categoryId, the LIKE pattern, percent - becomes a SQL parameter because SqlQuery, FromSql and ExecuteSql take a FormattableString. The FromSql SELECT is wrapped as a subquery so Where/OrderBy run on the server. The EXEC result cannot be composed, so it is materialized directly. The OUTPUT parameter value is read after the call, and THROW 50002 inside the SP becomes SqlException.Number 50002, mapped to 400. SqlQuery<int> requires the column to be named Value for scalar results. Search uses LIKE, whose case sensitivity follows the database collation (case-insensitive by default).',
    },
    {
      title: 'SSMS Lab: the tables and queries behind the procedures',
      scenario: 'Run in the in-app SSMS Lab the table design and the SELECT statements that usp_GetProductsByCategory and the sales report execute, to verify the data before wiring them into EF Core.',
      steps: [
        'Open the SSMS Lab (or SSMS: New Query, Ctrl+N)',
        'Paste the script and press F5 (Execute)',
        'Compare the results with the API responses of the previous example',
      ],
      code: `CREATE DATABASE ShopRawDb;
GO
USE ShopRawDb;
GO
CREATE TABLE Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL
);
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    CategoryId INT NOT NULL FOREIGN KEY REFERENCES Categories(Id),
    Price DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL CHECK (Stock >= 0)
);
CREATE TABLE Orders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    Quantity INT NOT NULL,
    Total DECIMAL(18,2) NOT NULL
);
GO
INSERT INTO Categories (Name) VALUES ('Stationery'), ('Books');
INSERT INTO Products (Name, CategoryId, Price, Stock) VALUES
('Pen', 1, 10.00, 100), ('Pencil', 1, 5.00, 200), ('Notebook', 1, 60.00, 40),
('C# Basics', 2, 450.00, 12), ('SQL Guide', 2, 380.00, 0);
INSERT INTO Orders (ProductId, Quantity, Total) VALUES
(1, 10, 100.00), (3, 2, 120.00), (4, 1, 450.00), (1, 5, 50.00);
GO
-- Body of usp_GetProductsByCategory with @CategoryId = 1
SELECT p.Id, p.Name, p.Price, p.Stock
FROM Products p
WHERE p.CategoryId = 1 AND p.Stock > 0
ORDER BY p.Name;
GO
-- Query used with Database.SqlQuery<SalesRow>
SELECT c.Name AS Category, COUNT(o.Id) AS Orders, SUM(o.Total) AS Revenue
FROM Categories c
JOIN Products p ON p.CategoryId = c.Id
JOIN Orders o ON o.ProductId = p.Id
GROUP BY c.Name
ORDER BY Revenue DESC;
GO`,
      tsql: `CREATE DATABASE ShopRawDb;
GO
USE ShopRawDb;
GO
CREATE TABLE Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL
);
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    CategoryId INT NOT NULL FOREIGN KEY REFERENCES Categories(Id),
    Price DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL CHECK (Stock >= 0)
);
CREATE TABLE Orders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    Quantity INT NOT NULL,
    Total DECIMAL(18,2) NOT NULL
);
GO
INSERT INTO Categories (Name) VALUES ('Stationery'), ('Books');
INSERT INTO Products (Name, CategoryId, Price, Stock) VALUES
('Pen', 1, 10.00, 100), ('Pencil', 1, 5.00, 200), ('Notebook', 1, 60.00, 40),
('C# Basics', 2, 450.00, 12), ('SQL Guide', 2, 380.00, 0);
INSERT INTO Orders (ProductId, Quantity, Total) VALUES
(1, 10, 100.00), (3, 2, 120.00), (4, 1, 450.00), (1, 5, 50.00);
GO
-- Body of usp_GetProductsByCategory with @CategoryId = 1
SELECT p.Id, p.Name, p.Price, p.Stock
FROM Products p
WHERE p.CategoryId = 1 AND p.Stock > 0
ORDER BY p.Name;
GO
-- Query used with Database.SqlQuery<SalesRow>
SELECT c.Name AS Category, COUNT(o.Id) AS Orders, SUM(o.Total) AS Revenue
FROM Categories c
JOIN Products p ON p.CategoryId = c.Id
JOIN Orders o ON o.ProductId = p.Id
GROUP BY c.Name
ORDER BY Revenue DESC;
GO`,
      result: `(2 rows affected)
(5 rows affected)
(4 rows affected)

Id | Name     | Price | Stock
3  | Notebook | 60    | 40
1  | Pen      | 10    | 100
2  | Pencil   | 5     | 200
3 row(s) returned

Category   | Orders | Revenue
Books      | 1      | 450
Stationery | 3      | 270
2 row(s) returned`,
      explanation: 'The first SELECT is exactly what the procedure runs for @CategoryId = 1: SQL Guide is excluded (other category) and only in-stock rows are returned, sorted by name. The report groups orders per category: Stationery has 3 orders (100 + 120 + 50 = 270), Books has 1 (450). The lab cannot create stored procedures (use real SSMS for CREATE PROCEDURE) and prints DECIMAL values without trailing zeros (60 instead of 60.00).',
    },
    {
      title: 'Console simulation: how FormattableString turns values into parameters',
      scenario: 'Use the real .NET FormattableString type (the same one FromSql/ExecuteSql receive) to see why interpolation is safe and concatenation is SQL injection.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it SqlParameterDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Linq;

string userInput = "Pen' OR 1=1 --";
int categoryId = 2;

// 1) What FromSqlRaw("..." + input) would send: injection!
string unsafeSql = "SELECT * FROM Products WHERE Name = '" + userInput + "'";
Console.WriteLine("Concatenated SQL:");
Console.WriteLine("  " + unsafeSql);

// 2) What FromSql($"...") receives: format + separate arguments
FormattableString safe = $"SELECT * FROM Products WHERE Name = {userInput} AND CategoryId = {categoryId}";
Console.WriteLine("FormattableString.Format:");
Console.WriteLine("  " + safe.Format);
Console.WriteLine("ArgumentCount: " + safe.ArgumentCount);

object[] args = safe.GetArguments()!;
object[] names = args.Select((a, i) => (object)("@p" + i)).ToArray();
Console.WriteLine("SQL sent to SQL Server:");
Console.WriteLine("  " + string.Format(safe.Format, names));
for (int i = 0; i < args.Length; i++)
    Console.WriteLine("  @p" + i + " (" + args[i]!.GetType().Name + ") = [" + args[i] + "]");`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Linq;

string userInput = "Pen' OR 1=1 --";
int categoryId = 2;

// 1) What FromSqlRaw("..." + input) would send: injection!
string unsafeSql = "SELECT * FROM Products WHERE Name = '" + userInput + "'";
Console.WriteLine("Concatenated SQL:");
Console.WriteLine("  " + unsafeSql);

// 2) What FromSql($"...") receives: format + separate arguments
FormattableString safe = $"SELECT * FROM Products WHERE Name = {userInput} AND CategoryId = {categoryId}";
Console.WriteLine("FormattableString.Format:");
Console.WriteLine("  " + safe.Format);
Console.WriteLine("ArgumentCount: " + safe.ArgumentCount);

object[] args = safe.GetArguments()!;
object[] names = args.Select((a, i) => (object)("@p" + i)).ToArray();
Console.WriteLine("SQL sent to SQL Server:");
Console.WriteLine("  " + string.Format(safe.Format, names));
for (int i = 0; i < args.Length; i++)
    Console.WriteLine("  @p" + i + " (" + args[i]!.GetType().Name + ") = [" + args[i] + "]");
`,
        },
        stdin: '',
      },
      result: `Concatenated SQL:
  SELECT * FROM Products WHERE Name = 'Pen' OR 1=1 --'
FormattableString.Format:
  SELECT * FROM Products WHERE Name = {0} AND CategoryId = {1}
ArgumentCount: 2
SQL sent to SQL Server:
  SELECT * FROM Products WHERE Name = @p0 AND CategoryId = @p1
  @p0 (String) = [Pen' OR 1=1 --]
  @p1 (Int32) = [2]`,
      explanation: 'With concatenation the quote in the input closes the string literal, OR 1=1 returns every row and -- comments out the rest: classic SQL injection. Assigning an interpolated string to FormattableString keeps the template ({0}, {1}) and the values apart; EF Core replaces each hole with a DbParameter, so the malicious text is only ever compared as a name. Danger: if you pass $"..." to FromSqlRaw (which takes string), C# formats it into plain text first and the protection is gone.',
    },
    {
      title: 'Console simulation: which connection string wins?',
      scenario: 'Model the configuration layering of ASP.NET Core for ConnectionStrings:Default in Development and Production, and print a masked, parsed version safe for logs.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ConnectionStringDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Linq;

var appsettings = new Dictionary<string, string>
{
    ["ConnectionStrings:Default"] = "Server=localhost;Database=ShopDb;Trusted_Connection=True;TrustServerCertificate=True"
};
var userSecrets = new Dictionary<string, string>      // only loaded in Development
{
    ["ConnectionStrings:Default"] = "Server=localhost;Database=ShopDb;User Id=sa;Password=Dev@12345;TrustServerCertificate=True"
};
var envVars = new Dictionary<string, string>          // set on the production server
{
    ["ConnectionStrings__Default"] = "Server=tcp:prod-sql.database.windows.net,1433;Database=ShopDb;User Id=shopapp;Password=Pr0d!Secret;Encrypt=True"
};

(string Value, string Source) Resolve(string environment, bool envVarSet)
{
    const string key = "ConnectionStrings:Default";
    string value = appsettings[key], source = "appsettings.json";
    if (environment == "Development" && userSecrets.TryGetValue(key, out var secret))
        (value, source) = (secret, "User Secrets (secrets.json)");
    if (envVarSet)
        foreach (var kv in envVars)
            if (kv.Key.Replace("__", ":") == key)
                (value, source) = (kv.Value, "Environment variable " + kv.Key);
    return (value, source);
}

string Mask(string cs) => string.Join(";", cs.Split(';').Select(part =>
{
    string[] kv = part.Split('=', 2);
    return kv[0].Equals("Password", StringComparison.OrdinalIgnoreCase) ? kv[0] + "=*****" : part;
}));

void Show(string environment, bool envVarSet)
{
    var (value, source) = Resolve(environment, envVarSet);
    var parts = value.Split(';').Select(p => p.Split('=', 2))
                     .ToDictionary(p => p[0], p => p[1], StringComparer.OrdinalIgnoreCase);
    string auth = parts.ContainsKey("User Id") ? "SQL login " + parts["User Id"] : "Windows (Trusted_Connection)";
    Console.WriteLine("[" + environment + (envVarSet ? " + env var" : "") + "]");
    Console.WriteLine("  source: " + source);
    Console.WriteLine("  value : " + Mask(value));
    Console.WriteLine("  server: " + parts["Server"] + ", database: " + parts["Database"] + ", auth: " + auth);
}

Show("Development", false);
Show("Production", false);
Show("Production", true);`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Linq;

var appsettings = new Dictionary<string, string>
{
    ["ConnectionStrings:Default"] = "Server=localhost;Database=ShopDb;Trusted_Connection=True;TrustServerCertificate=True"
};
var userSecrets = new Dictionary<string, string>      // only loaded in Development
{
    ["ConnectionStrings:Default"] = "Server=localhost;Database=ShopDb;User Id=sa;Password=Dev@12345;TrustServerCertificate=True"
};
var envVars = new Dictionary<string, string>          // set on the production server
{
    ["ConnectionStrings__Default"] = "Server=tcp:prod-sql.database.windows.net,1433;Database=ShopDb;User Id=shopapp;Password=Pr0d!Secret;Encrypt=True"
};

(string Value, string Source) Resolve(string environment, bool envVarSet)
{
    const string key = "ConnectionStrings:Default";
    string value = appsettings[key], source = "appsettings.json";
    if (environment == "Development" && userSecrets.TryGetValue(key, out var secret))
        (value, source) = (secret, "User Secrets (secrets.json)");
    if (envVarSet)
        foreach (var kv in envVars)
            if (kv.Key.Replace("__", ":") == key)
                (value, source) = (kv.Value, "Environment variable " + kv.Key);
    return (value, source);
}

string Mask(string cs) => string.Join(";", cs.Split(';').Select(part =>
{
    string[] kv = part.Split('=', 2);
    return kv[0].Equals("Password", StringComparison.OrdinalIgnoreCase) ? kv[0] + "=*****" : part;
}));

void Show(string environment, bool envVarSet)
{
    var (value, source) = Resolve(environment, envVarSet);
    var parts = value.Split(';').Select(p => p.Split('=', 2))
                     .ToDictionary(p => p[0], p => p[1], StringComparer.OrdinalIgnoreCase);
    string auth = parts.ContainsKey("User Id") ? "SQL login " + parts["User Id"] : "Windows (Trusted_Connection)";
    Console.WriteLine("[" + environment + (envVarSet ? " + env var" : "") + "]");
    Console.WriteLine("  source: " + source);
    Console.WriteLine("  value : " + Mask(value));
    Console.WriteLine("  server: " + parts["Server"] + ", database: " + parts["Database"] + ", auth: " + auth);
}

Show("Development", false);
Show("Production", false);
Show("Production", true);
`,
        },
        stdin: '',
      },
      result: `[Development]
  source: User Secrets (secrets.json)
  value : Server=localhost;Database=ShopDb;User Id=sa;Password=*****;TrustServerCertificate=True
  server: localhost, database: ShopDb, auth: SQL login sa
[Production]
  source: appsettings.json
  value : Server=localhost;Database=ShopDb;Trusted_Connection=True;TrustServerCertificate=True
  server: localhost, database: ShopDb, auth: Windows (Trusted_Connection)
[Production + env var]
  source: Environment variable ConnectionStrings__Default
  value : Server=tcp:prod-sql.database.windows.net,1433;Database=ShopDb;User Id=shopapp;Password=*****;Encrypt=True
  server: tcp:prod-sql.database.windows.net,1433, database: ShopDb, auth: SQL login shopapp`,
      explanation: 'Each later source overrides earlier ones for the same key. User Secrets are only added when the environment is Development, so Production falls back to appsettings.json unless the server defines the environment variable. The double underscore in ConnectionStrings__Default is translated to ":" because many operating systems do not allow ":" in variable names. Mask() hides the password before logging - never log full connection strings.',
    },
  ],
  interview: [
    { q: 'FromSql vs FromSqlRaw?', a: 'FromSql takes a FormattableString and parameterizes every interpolated value automatically. FromSqlRaw takes a plain string plus optional DbParameter/positional parameters; it is safe only if you never concatenate user input into the SQL.', level: 'Medium' },
    { q: 'What does Database.SqlQuery<T> add in EF Core 7/8?', a: 'It returns scalars (EF 7) and any unmapped type (EF 8) from raw SQL without defining a DbSet. The column names must match the property names (for scalars the column must be named Value).', level: 'Medium' },
    { q: 'Can you compose LINQ on top of a stored procedure call?', a: 'No. EXEC cannot be used as a subquery. Materialize with ToListAsync or AsEnumerable before further LINQ. Composition works for plain SELECT statements and TVFs.', level: 'Medium' },
    { q: 'How do you read an OUTPUT parameter from a stored procedure?', a: 'Create a SqlParameter with Direction = ParameterDirection.Output, pass it to ExecuteSqlRaw(Async) with "@Name OUTPUT" in the SQL, then read parameter.Value after the call.', level: 'Medium' },
    { q: 'What is a keyless entity type?', a: 'An entity configured with HasNoKey (or [Keyless]); it is read-only, never tracked, and used for views, SP results and raw SQL projections.', level: 'Easy' },
    { q: 'Why is passing $"...{x}" to FromSqlRaw dangerous?', a: 'FromSqlRaw expects a string, so C# turns the interpolated string into plain text before EF sees it; values are embedded in SQL and injection becomes possible. Use FromSql instead.', level: 'Hard' },
    { q: 'Where should production connection strings be stored?', a: 'Outside source control: environment variables, Azure App Service connection strings, Azure Key Vault, or use Managed Identity with no password at all. User Secrets only for local development.', level: 'Easy' },
    { q: 'What is the configuration precedence in ASP.NET Core?', a: 'appsettings.json < appsettings.{Environment}.json < User Secrets (Development) < environment variables < command-line arguments; later sources override earlier ones.', level: 'Medium' },
    { q: 'What does EnableRetryOnFailure do?', a: 'Configures an execution strategy that retries operations on transient SQL errors (network blips, Azure SQL throttling). Manual transactions must be wrapped in CreateExecutionStrategy().ExecuteAsync.', level: 'Medium' },
    { q: 'Why might you get a certificate error connecting to local SQL Server with SqlClient 4+?', a: 'Encrypt defaults to True and the local server uses a self-signed certificate. Add TrustServerCertificate=True for development or install a trusted certificate.', level: 'Medium' },
    { q: 'How can EF Core save entities through stored procedures?', a: 'EF Core 7+ supports InsertUsingStoredProcedure, UpdateUsingStoredProcedure and DeleteUsingStoredProcedure in the model configuration, mapping parameters and result columns.', level: 'Hard' },
    { q: 'Output question: FormattableString f = $"WHERE Id = {5} AND Name = {"Pen"}"; what is f.Format?', a: '"WHERE Id = {0} AND Name = {1}" and f.ArgumentCount is 2.', level: 'Medium' },
  ],
  practice: [
    { task: 'Write a stored procedure usp_GetTopProducts @Top INT that returns the best-selling products, and call it from EF Core into a record TopProduct(string Name, int Sold).', hint: 'Use SqlQuery<TopProduct> with interpolation.', solution: 'SQL: CREATE PROCEDURE usp_GetTopProducts @Top INT AS SELECT TOP (@Top) p.Name, SUM(o.Quantity) AS Sold FROM Orders o JOIN Products p ON p.Id = o.ProductId GROUP BY p.Name ORDER BY Sold DESC; C#: var top = await db.Database.SqlQuery<TopProduct>($"EXEC dbo.usp_GetTopProducts @Top = {n}").ToListAsync();' },
    { task: 'Implement a safe dynamic sort: GET /api/products?sort=price|name|stock using raw SQL.', hint: 'Map the user value to a column name through a switch; anything else falls back to Name.', solution: 'string column = sort switch { "price" => "Price", "stock" => "Stock", _ => "Name" }; var list = await db.Products.FromSqlRaw("SELECT * FROM Products ORDER BY " + column).ToListAsync(); // column comes only from the whitelist' },
    { task: 'Map Customer inserts to a stored procedure usp_Customer_Insert(@Name) that returns the new Id.', hint: 'InsertUsingStoredProcedure with HasParameter and HasResultColumn.', solution: 'mb.Entity<Customer>().InsertUsingStoredProcedure("usp_Customer_Insert", sp => { sp.HasParameter(c => c.Name); sp.HasResultColumn(c => c.Id); }); SP body: INSERT INTO Customers(Name) VALUES (@Name); SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;' },
    { task: 'Move the connection string to User Secrets in Development and an environment variable in Production; verify with a /config-check endpoint that prints only the server and database.', hint: 'Use SqlConnectionStringBuilder from Microsoft.Data.SqlClient.', solution: 'dotnet user-secrets set "ConnectionStrings:Default" "Server=...;Database=ShopDb;..."; app.MapGet("/config-check", (IConfiguration c) => { var b = new SqlConnectionStringBuilder(c.GetConnectionString("Default")); return new { b.DataSource, b.InitialCatalog }; }); On the server: setx ConnectionStrings__Default "..." (Windows) or App Service > Configuration > Connection strings.' },
    { task: 'Wrap a manual transaction (two ExecuteSql calls) so it works with EnableRetryOnFailure.', hint: 'db.Database.CreateExecutionStrategy().ExecuteAsync(async () => { ... }).', solution: 'var strategy = db.Database.CreateExecutionStrategy(); await strategy.ExecuteAsync(async () => { await using var tx = await db.Database.BeginTransactionAsync(); await db.Database.ExecuteSqlAsync($"UPDATE Products SET Stock = Stock - {q} WHERE Id = {id}"); await db.Database.ExecuteSqlAsync($"INSERT INTO Orders (ProductId, Quantity, Total) VALUES ({id}, {q}, {total})"); await tx.CommitAsync(); });' },
  ],
  quiz: [
    { question: 'Which method returns an unmapped DTO list from raw SQL in EF Core 8?', options: ['db.Products.FromSql', 'db.Database.SqlQuery<T>', 'db.Database.ExecuteSql', 'db.Set<T>().Find'], answer: 1, explanation: 'SqlQuery<T> supports arbitrary types from EF Core 8.' },
    { question: 'Which call is vulnerable to SQL injection?', options: ['FromSql($"... WHERE Name = {name}")', 'FromSqlRaw("... WHERE Name = @n", new SqlParameter("@n", name))', 'ExecuteSql($"DELETE FROM T WHERE Id = {id}")', 'FromSqlRaw("... WHERE Name = \'" + name + "\'")'], answer: 3, explanation: 'Concatenating input builds executable SQL.' },
    { question: 'You call db.Products.FromSql($"EXEC usp_X").Where(p => p.Stock > 0). What happens?', options: ['Error: EXEC cannot be composed - materialize first', 'Works and filters on the server', 'Filters only the first row', 'Returns an empty list'], answer: 0, explanation: 'Stored procedure calls are not composable.' },
    { question: 'Which environment variable overrides ConnectionStrings:Default?', options: ['ConnectionStrings.Default', 'CONNECTIONSTRINGS-DEFAULT', 'ConnectionStrings__Default', 'Default_ConnectionStrings'], answer: 2, explanation: 'A double underscore maps to the ":" section separator.' },
    { question: 'How do you configure an entity for a database view?', options: ['HasKey().ToTable("vw")', 'HasNoKey().ToView("vw_SalesSummary")', 'Ignore<SalesSummary>()', 'OwnsOne(...)'], answer: 1, explanation: 'Keyless entity types mapped with ToView are read-only.' },
  ],
};
