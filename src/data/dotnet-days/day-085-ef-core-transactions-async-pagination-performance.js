export default {
  id: 'day-085-ef-core-transactions-async-pagination-performance',
  title: `Transactions, Async Database Operations, Pagination, Performance Optimization`,
  module: `Module 7: Entity Framework Core & Database Connectivity`,
  day: 85,
  level: `Advanced`,
  duration: `3.5 hours`,
  summary: `Finish the EF Core module with production skills. Keep data consistent with implicit and explicit transactions (BeginTransaction, Commit, Rollback, savepoints, execution strategies), write fully asynchronous data access with CancellationToken, build a search + sort + paginate Students page with Skip/Take (OFFSET/FETCH) and a reusable PagedResult<T>, learn keyset pagination for big tables, and apply a performance checklist: AsNoTracking, projection, indexes, avoiding N+1, split queries, bulk updates, compiled queries, DbContext pooling and logging slow queries.`,
  objectives: [
    `Explain the implicit transaction of SaveChanges and use explicit transactions with commit, rollback and savepoints`,
    `Write async EF Core code correctly (async all the way, CancellationToken, one operation per DbContext at a time)`,
    `Implement search, sorting and pagination with Skip/Take, total count and a reusable PagedResult<T>`,
    `Compare offset and keyset pagination and know when each is appropriate`,
    `Apply the most important EF Core performance optimizations and measure them with logging`,
  ],
  theory: [
    {
      heading: `Transactions in EF Core`,
      content: `A transaction is an "all or nothing" unit of work: either every change is saved or none is (ACID: Atomic, Consistent, Isolated, Durable). You met BEGIN TRAN / COMMIT / ROLLBACK in SQL on Day 50.

EF Core gives you a transaction automatically: each call to SaveChanges runs all its INSERT/UPDATE/DELETE statements inside one transaction. You need an explicit transaction only when one business operation needs SEVERAL SaveChanges calls (e.g. you need a generated id first), or mixes EF with raw SQL / ExecuteUpdate.

Analogy: a bank transfer. Debiting one account and crediting the other must both happen, or neither. Half a transfer is worse than no transfer.`,
      syntax: `await using var tx = await db.Database.BeginTransactionAsync();
try
{
    db.Orders.Add(order);
    await db.SaveChangesAsync();                 // order.OrderId now known (still uncommitted)

    product.Stock -= qty;
    db.OrderItems.Add(new OrderItem { OrderId = order.OrderId, ProductId = product.ProductId, Qty = qty });
    await db.SaveChangesAsync();

    await tx.CommitAsync();                      // make everything permanent
}
catch
{
    await tx.RollbackAsync();                    // undo everything (also automatic on Dispose without Commit)
    throw;
}`,
      points: [
        `Savepoints: await tx.CreateSavepointAsync("BeforeItems"); ... await tx.RollbackToSavepointAsync("BeforeItems");`,
        `Isolation level: BeginTransactionAsync(IsolationLevel.Serializable) (System.Data) for stricter locking`,
        `Identity values used inside a rolled-back transaction are NOT reused - gaps in ids are normal`,
        `ExecuteUpdate/ExecuteDelete and FromSql/ExecuteSql take part in the current transaction too`,
      ],
    },
    {
      heading: `Execution Strategies (Retry on Failure)`,
      content: `Cloud databases (Azure SQL) sometimes drop connections for a moment. UseSqlServer(cs, o => o.EnableRetryOnFailure()) retries failed commands automatically. With retries enabled, a manual transaction must be wrapped in the execution strategy, so the WHOLE transaction can be replayed, otherwise EF throws "The configured execution strategy does not support user-initiated transactions".`,
      syntax: `var strategy = db.Database.CreateExecutionStrategy();
await strategy.ExecuteAsync(async () =>
{
    await using var tx = await db.Database.BeginTransactionAsync();
    // ... several SaveChangesAsync calls ...
    await tx.CommitAsync();
});`,
      tip: `TransactionScope (System.Transactions) also works with EF Core for a transaction spanning several contexts on the same connection string, but explicit BeginTransaction is simpler and preferred for one DbContext.`,
    },
    {
      heading: `Async Database Operations`,
      content: `Database calls are I/O: the CPU waits for SQL Server. The async methods (ToListAsync, FirstOrDefaultAsync, CountAsync, AnyAsync, SaveChangesAsync, ExecuteUpdateAsync, BeginTransactionAsync ...) release the thread while waiting, so ASP.NET Core can serve more users with the same threads.`,
      points: [
        `Async all the way: controller action async Task<IActionResult> -> service async -> EF async method`,
        `Never block with .Result or .Wait() - it wastes a thread and can deadlock`,
        `Pass a CancellationToken: ASP.NET Core gives HttpContext.RequestAborted (or a CancellationToken action parameter); if the user closes the page the query is cancelled`,
        `A DbContext is NOT thread-safe: do not run two queries on the same context in parallel (no Task.WhenAll on one context) - await each one, or use separate contexts (IDbContextFactory)`,
        `Async helps scalability, not the speed of a single query`,
      ],
      syntax: `public async Task<IActionResult> Index(CancellationToken ct)
{
    var list = await _db.Students.AsNoTracking().OrderBy(s => s.FullName).ToListAsync(ct);
    return View(list);
}`,
    },
    {
      heading: `Search, Sort and Pagination`,
      content: `Never load a whole table into a page. Pagination returns one "page" of rows: Skip((page - 1) * pageSize).Take(pageSize), which EF translates to OFFSET ... ROWS FETCH NEXT ... ROWS ONLY. Always ORDER BY before Skip/Take (and include a unique column such as the key as a tie-breaker), otherwise SQL Server may return rows in a different order on each page. Run a COUNT query with the same filters to know the total number of pages.

Search and sort are applied by composing IQueryable before paging: Where for the search text, a switch on a whitelisted sort column for OrderBy.`,
      syntax: `IQueryable<Student> q = _db.Students.AsNoTracking();
if (!string.IsNullOrWhiteSpace(search))
    q = q.Where(s => s.FullName.Contains(search) || s.RollNo.Contains(search));   // LIKE N'%...%'
q = sort switch
{
    "name_desc" => q.OrderByDescending(s => s.FullName).ThenBy(s => s.StudentId),
    "fees"      => q.OrderBy(s => s.Fees).ThenBy(s => s.StudentId),
    _           => q.OrderBy(s => s.FullName).ThenBy(s => s.StudentId)
};
int total = await q.CountAsync();
var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();`,
      points: [
        `Validate page >= 1 and limit pageSize (e.g. max 100) - never trust query strings`,
        `Offset pagination gets slower on deep pages (OFFSET 100000 still reads 100000 rows)`,
        `Keyset (seek) pagination: Where(s => s.StudentId > lastId).OrderBy(s => s.StudentId).Take(20) - constant speed, ideal for "Load more" and infinite scroll, but no jumping to page 57`,
      ],
    },
    {
      heading: `Performance Optimization Checklist`,
      content: `Most slow EF Core applications suffer from a few well-known problems. Measure first (logging, SQL Server Profiler / Query Store, execution plans), then fix:`,
      points: [
        `Read-only queries: AsNoTracking() or a context default of NoTracking`,
        `Load only needed columns: Select into DTOs/view models instead of whole entities`,
        `Add indexes for columns used in WHERE, ORDER BY and JOIN: HasIndex(s => s.FullName) + migration`,
        `Avoid N+1: Include or projection instead of lazy loading in loops`,
        `Many collections: AsSplitQuery() to avoid cartesian explosion`,
        `Bulk changes: ExecuteUpdateAsync / ExecuteDeleteAsync instead of load-modify-save loops`,
        `Always paginate lists; never ToList() a whole table`,
        `Filter in the database, not in memory (keep IQueryable until the end)`,
        `DbContext pooling: AddDbContextPool<T>() reuses context instances for high-traffic apps`,
        `Compiled queries: EF.CompileAsyncQuery for very hot queries`,
        `Log slow queries: LogTo with a filter, or interceptors, and check Database.Command logs`,
      ],
      tip: `Do not optimize blindly. A missing index often makes a query 100x slower, while micro-optimizations like compiled queries save microseconds. Look at the SQL and its execution plan first.`,
    },
  ],
  examples: [
    {
      title: `Stock update transaction: commit or roll back an order`,
      scenario: `An order inserts an Order row, then for each item reduces product stock and inserts an OrderItem - several SaveChanges calls. If any product does not have enough stock, nothing at all may be saved.`,
      steps: [
        `In Visual Studio: File > New > Project > Console App > Name: StockTransactionDemo > .NET 10 (or 8)`,
        `PMC: Install-Package Microsoft.EntityFrameworkCore.SqlServer (CLI: dotnet add package Microsoft.EntityFrameworkCore.SqlServer)`,
        `Add ShopModels.cs and ShopContext.cs, replace Program.cs with the code`,
        `Set a breakpoint (F9) on await tx.RollbackAsync(); and press F5 to inspect the exception, then F5 to continue`,
        `Press Ctrl+F5 for a normal run; open SSMS > ShopTxDb > Orders to see the ids`,
      ],
      code: `// ===== ShopModels.cs =====
namespace StockTransactionDemo;

public class Product
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

public class Order
{
    public int OrderId { get; set; }
    public string Customer { get; set; } = string.Empty;
    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Qty { get; set; }
    public decimal UnitPrice { get; set; }
}

// ===== ShopContext.cs =====
using Microsoft.EntityFrameworkCore;

namespace StockTransactionDemo;

public class ShopContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnConfiguring(DbContextOptionsBuilder o)
        => o.UseSqlServer(@"Server=(localdb)\\MSSQLLocalDB;Database=ShopTxDb;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Product>().Property(p => p.Price).HasPrecision(10, 2);
        mb.Entity<Product>().ToTable(t => t.HasCheckConstraint("CK_Products_Stock", "[Stock] >= 0"));
        mb.Entity<OrderItem>().Property(i => i.UnitPrice).HasPrecision(10, 2);
    }
}

// ===== Program.cs =====
using Microsoft.EntityFrameworkCore;
using StockTransactionDemo;

await using var db = new ShopContext();
await db.Database.EnsureDeletedAsync();
await db.Database.EnsureCreatedAsync();
db.Products.AddRange(
    new Product { Name = "Laptop", Price = 55000m, Stock = 5 },
    new Product { Name = "Mouse", Price = 500m, Stock = 50 });
await db.SaveChangesAsync();

await PlaceOrderAsync(db, "Asha",  new[] { (1, 2), (2, 3) });    // OK
await PlaceOrderAsync(db, "Rahul", new[] { (2, 10), (1, 10) });  // mouse OK, laptop fails -> all undone
await PlaceOrderAsync(db, "Neha",  new[] { (1, 1) });            // OK

Console.WriteLine("--- Database after all orders ---");
foreach (var p in await db.Products.AsNoTracking().OrderBy(p => p.ProductId).ToListAsync())
    Console.WriteLine($"{p.Name}: stock {p.Stock}");
var orders = await db.Orders.AsNoTracking().OrderBy(o => o.OrderId).ToListAsync();
Console.WriteLine("Orders saved: " + string.Join(", ", orders.Select(o => o.OrderId + "-" + o.Customer)));
Console.WriteLine($"Order items saved: {await db.OrderItems.CountAsync()}");

static async Task PlaceOrderAsync(ShopContext db, string customer, (int ProductId, int Qty)[] items)
{
    await using var tx = await db.Database.BeginTransactionAsync();
    try
    {
        var order = new Order { Customer = customer };
        db.Orders.Add(order);
        await db.SaveChangesAsync();                          // INSERT order (uncommitted), id generated

        foreach (var (productId, qty) in items)
        {
            var p = await db.Products.SingleAsync(x => x.ProductId == productId);
            if (p.Stock < qty)
                throw new InvalidOperationException($"Not enough stock for {p.Name} (have {p.Stock}, need {qty})");

            p.Stock -= qty;
            db.OrderItems.Add(new OrderItem { OrderId = order.OrderId, ProductId = productId, Qty = qty, UnitPrice = p.Price });
            await db.SaveChangesAsync();                      // UPDATE stock + INSERT item (uncommitted)
        }

        await tx.CommitAsync();
        Console.WriteLine($"Order {order.OrderId} for {customer}: committed");
    }
    catch (Exception ex)
    {
        await tx.RollbackAsync();
        db.ChangeTracker.Clear();                             // forget the in-memory changes as well
        Console.WriteLine($"Order for {customer}: rolled back - {ex.Message}");
    }
}

-- ===== SQL sent for Rahul's order (simplified) =====
BEGIN TRANSACTION;
INSERT INTO [Orders] ([Customer]) OUTPUT INSERTED.[OrderId] VALUES (@p0);          -- OrderId 2
SELECT TOP(2) ... FROM [Products] AS [p] WHERE [p].[ProductId] = @productId;
UPDATE [Products] SET [Stock] = @p0 OUTPUT 1 WHERE [ProductId] = @p1;               -- Mouse 47 -> 37
INSERT INTO [OrderItems] (...) OUTPUT INSERTED.[OrderItemId] VALUES (...);
SELECT TOP(2) ... FROM [Products] AS [p] WHERE [p].[ProductId] = @productId;      -- Laptop: 3 < 10
ROLLBACK TRANSACTION;`,
      result: `Order 1 for Asha: committed
Order for Rahul: rolled back - Not enough stock for Laptop (have 3, need 10)
Order 3 for Neha: committed
--- Database after all orders ---
Laptop: stock 2
Mouse: stock 47
Orders saved: 1-Asha, 3-Neha
Order items saved: 3`,
      explanation: `Asha's order reduces Laptop 5 -> 3 and Mouse 50 -> 47 and commits. Rahul's order inserts order 2 and already saves Mouse 47 -> 37 inside the transaction, then fails on the Laptop check; RollbackAsync undoes the order row, the stock change and the item, so Mouse is back to 47. ChangeTracker.Clear() is important: without it the context would still believe Mouse has 37 in memory. Neha's order gets OrderId 3, not 2 - identity values consumed in a rolled-back transaction are not reused. Final: Laptop 5 - 2 - 1 = 2, Mouse 47, orders 1 and 3, items 2 + 1 = 3. If the whole operation fits in ONE SaveChanges (add order with Items collection), no explicit transaction is needed at all.`,
    },
    {
      title: `Search and paginate students (async MVC page)`,
      scenario: `The StudentPortal list now has thousands of students. Build /Students?search=ar&sort=name&page=2 with a search box, sortable columns, a page-size limit, total count and Previous/Next/number links - fully async with cancellation.`,
      steps: [
        `Open StudentPortal. Add Models/PagedResult.cs (generic, reusable)`,
        `Add Extensions/QueryableExtensions.cs with ToPagedResultAsync`,
        `Replace the Index action in StudentsController with the version below`,
        `Replace Views/Students/Index.cshtml`,
        `Add an index for searching/sorting: HasIndex(s => s.FullName) in SchoolDbContext, then PM> Add-Migration StudentNameIndex ; PM> Update-Database (CLI: dotnet ef migrations add StudentNameIndex ; dotnet ef database update)`,
        `Press F5 and try /Students?search=ar&page=1, click the Name header to change sort, use the pager`,
        `Watch the two SQL statements (COUNT + OFFSET/FETCH) in the Output window`,
      ],
      code: `// ===== Models/PagedResult.cs =====
namespace StudentPortal.Models;

public class PagedResult<T>
{
    public required List<T> Items { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}

// ===== Extensions/QueryableExtensions.cs =====
using Microsoft.EntityFrameworkCore;
using StudentPortal.Models;

namespace StudentPortal.Extensions;

public static class QueryableExtensions
{
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
        this IQueryable<T> query, int page, int pageSize, CancellationToken ct = default)
    {
        pageSize = Math.Clamp(pageSize, 1, 100);                  // protect the server
        int total = await query.CountAsync(ct);                   // SQL 1: COUNT(*)
        int totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)pageSize));
        page = Math.Clamp(page, 1, totalPages);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);                                     // SQL 2: OFFSET/FETCH

        return new PagedResult<T> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }
}

// ===== Models/StudentListItem.cs (projection = only needed columns) =====
public record StudentListItem(int StudentId, string RollNo, string FullName, string Department, decimal Fees);

// ===== Controllers/StudentsController.cs - Index =====
public async Task<IActionResult> Index(string? search, string? sort, int page = 1, int pageSize = 10,
                                       CancellationToken ct = default)
{
    IQueryable<Student> query = _db.Students.AsNoTracking().Where(s => s.IsActive);

    if (!string.IsNullOrWhiteSpace(search))
    {
        search = search.Trim();
        query = query.Where(s => s.FullName.Contains(search) || s.RollNo.Contains(search));
    }

    query = sort switch
    {
        "name_desc" => query.OrderByDescending(s => s.FullName).ThenBy(s => s.StudentId),
        "roll"      => query.OrderBy(s => s.RollNo),
        "fees"      => query.OrderBy(s => s.Fees).ThenBy(s => s.StudentId),
        "fees_desc" => query.OrderByDescending(s => s.Fees).ThenBy(s => s.StudentId),
        _           => query.OrderBy(s => s.FullName).ThenBy(s => s.StudentId)
    };

    var result = await query
        .Select(s => new StudentListItem(s.StudentId, s.RollNo, s.FullName, s.Department.Name, s.Fees))
        .ToPagedResultAsync(page, pageSize, ct);

    ViewBag.Search = search;
    ViewBag.Sort = sort;
    ViewBag.NameSort = sort == "name_desc" ? "" : "name_desc";
    ViewBag.FeesSort = sort == "fees" ? "fees_desc" : "fees";
    return View(result);
}

@* ===== Views/Students/Index.cshtml ===== *@
@using StudentPortal.Models
@model PagedResult<StudentListItem>
@{
    ViewData["Title"] = "Students";
    string? search = ViewBag.Search;
    string? sort = ViewBag.Sort;
}

<h2>Students</h2>
<form method="get" class="d-flex gap-2 mb-3">
    <input type="text" name="search" value="@search" class="form-control" placeholder="Search name or roll no" />
    <input type="hidden" name="sort" value="@sort" />
    <button class="btn btn-primary">Search</button>
    <a asp-action="Index" class="btn btn-outline-secondary">Clear</a>
</form>

<p>@Model.TotalCount student(s) found - page @Model.Page of @Model.TotalPages</p>

<table class="table table-striped">
    <thead>
        <tr>
            <th><a asp-action="Index" asp-route-sort="roll" asp-route-search="@search">Roll No</a></th>
            <th><a asp-action="Index" asp-route-sort="@ViewBag.NameSort" asp-route-search="@search">Name</a></th>
            <th>Department</th>
            <th><a asp-action="Index" asp-route-sort="@ViewBag.FeesSort" asp-route-search="@search">Fees</a></th>
        </tr>
    </thead>
    <tbody>
    @foreach (var s in Model.Items)
    {
        <tr><td>@s.RollNo</td><td>@s.FullName</td><td>@s.Department</td><td>@s.Fees.ToString("0.00")</td></tr>
    }
    </tbody>
</table>

<nav>
    <ul class="pagination">
        <li class="page-item @(Model.HasPrevious ? "" : "disabled")">
            <a class="page-link" asp-action="Index" asp-route-page="@(Model.Page - 1)"
               asp-route-search="@search" asp-route-sort="@sort">Previous</a>
        </li>
        @for (int i = 1; i <= Model.TotalPages; i++)
        {
            <li class="page-item @(i == Model.Page ? "active" : "")">
                <a class="page-link" asp-action="Index" asp-route-page="@i"
                   asp-route-search="@search" asp-route-sort="@sort">@i</a>
            </li>
        }
        <li class="page-item @(Model.HasNext ? "" : "disabled")">
            <a class="page-link" asp-action="Index" asp-route-page="@(Model.Page + 1)"
               asp-route-search="@search" asp-route-sort="@sort">Next</a>
        </li>
    </ul>
</nav>

// ===== SchoolDbContext.OnModelCreating (index for search/sort) =====
modelBuilder.Entity<Student>().HasIndex(s => s.FullName);

-- ===== SQL for /Students?search=ar&page=2&pageSize=10 =====
SELECT COUNT(*)
FROM [Students] AS [s]
WHERE [s].[IsActive] = CAST(1 AS bit) AND ([s].[FullName] LIKE @search_contains ESCAPE N'\\' OR [s].[RollNo] LIKE @search_contains ESCAPE N'\\');

SELECT [s].[StudentId], [s].[RollNo], [s].[FullName], [d].[Name], [s].[Fees]
FROM [Students] AS [s]
INNER JOIN [Departments] AS [d] ON [s].[DepartmentId] = [d].[DepartmentId]
WHERE [s].[IsActive] = CAST(1 AS bit) AND ([s].[FullName] LIKE @search_contains ESCAPE N'\\' OR [s].[RollNo] LIKE @search_contains ESCAPE N'\\')
ORDER BY [s].[FullName], [s].[StudentId]
OFFSET @p ROWS FETCH NEXT @p0 ROWS ONLY;
-- @search_contains = N'%ar%', @p = 10, @p0 = 10`,
      result: `/Students?search=ar shows e.g. "34 student(s) found - page 1 of 4", ten rows, and a pager 1 2 3 4 with Previous disabled. Clicking Name toggles A-Z / Z-A, clicking 2 keeps the search text and sort in the links. /Students?page=999 is clamped to the last page and /Students?pageSize=5000 is limited to 100 rows.

Output window: exactly two SQL statements per page request (COUNT + OFFSET/FETCH), each selecting only the five displayed columns.`,
      explanation: `The query stays IQueryable until ToPagedResultAsync, so search, sort, projection and paging all become one SQL SELECT plus one COUNT. ThenBy(s => s.StudentId) makes the order deterministic when names repeat, so no student appears on two pages. Contains(search) becomes LIKE with an escaped parameter (safe from SQL injection; % and _ typed by the user are escaped). The sort parameter is matched against a whitelist in the switch - never build ORDER BY from raw user text. Projecting into StudentListItem avoids tracking and reads only five columns (including the department name through a JOIN). The CancellationToken stops the SQL query when the user navigates away.`,
    },
    {
      title: `Reusable pagination logic (runnable)`,
      scenario: `Test the pagination maths (total pages, clamping out-of-range page numbers, previous/next flags) on an in-memory list of 23 students before using it with EF Core - the same Skip/Take code works on any IQueryable.`,
      steps: [
        `In Visual Studio: File > New > Project > Console App`,
        `Name it PaginationDemo`,
        `Replace Program.cs with the code`,
        `Press Ctrl+F5`,
      ],
      code: `var students = Enumerable.Range(1, 23)
    .Select(i => new Student(i, $"Student {i:00}"))
    .ToList();

Console.WriteLine($"Total: {students.Count} students, page size 5");
foreach (int requested in new[] { 1, 3, 5, 9, 0 })
{
    var r = Paginate(students.AsQueryable().OrderBy(s => s.Id), requested, 5);
    string ids = string.Join(", ", r.Items.Select(s => s.Id));
    Console.WriteLine($"Requested {requested} -> page {r.Page}/{r.TotalPages}: {ids} | prev={r.HasPrevious} next={r.HasNext}");
}

// Keyset ("load more") pagination: continue after the last id seen
int lastId = 20;
var next = students.Where(s => s.Id > lastId).OrderBy(s => s.Id).Take(5).Select(s => s.Name);
Console.WriteLine("After id 20: " + string.Join(", ", next));

static PagedResult<T> Paginate<T>(IQueryable<T> source, int page, int pageSize)
{
    int total = source.Count();
    int totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)pageSize));
    page = Math.Clamp(page, 1, totalPages);
    var items = source.Skip((page - 1) * pageSize).Take(pageSize).ToList();
    return new PagedResult<T>(items, page, totalPages);
}

record Student(int Id, string Name);

record PagedResult<T>(List<T> Items, int Page, int TotalPages)
{
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}`,
      csharp: {
        files: {
          'Program.cs': `var students = Enumerable.Range(1, 23)
    .Select(i => new Student(i, $"Student {i:00}"))
    .ToList();

Console.WriteLine($"Total: {students.Count} students, page size 5");
foreach (int requested in new[] { 1, 3, 5, 9, 0 })
{
    var r = Paginate(students.AsQueryable().OrderBy(s => s.Id), requested, 5);
    string ids = string.Join(", ", r.Items.Select(s => s.Id));
    Console.WriteLine($"Requested {requested} -> page {r.Page}/{r.TotalPages}: {ids} | prev={r.HasPrevious} next={r.HasNext}");
}

// Keyset ("load more") pagination: continue after the last id seen
int lastId = 20;
var next = students.Where(s => s.Id > lastId).OrderBy(s => s.Id).Take(5).Select(s => s.Name);
Console.WriteLine("After id 20: " + string.Join(", ", next));

static PagedResult<T> Paginate<T>(IQueryable<T> source, int page, int pageSize)
{
    int total = source.Count();
    int totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)pageSize));
    page = Math.Clamp(page, 1, totalPages);
    var items = source.Skip((page - 1) * pageSize).Take(pageSize).ToList();
    return new PagedResult<T>(items, page, totalPages);
}

record Student(int Id, string Name);

record PagedResult<T>(List<T> Items, int Page, int TotalPages)
{
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}
`,
        },
        stdin: '',
      },
      result: `Total: 23 students, page size 5
Requested 1 -> page 1/5: 1, 2, 3, 4, 5 | prev=False next=True
Requested 3 -> page 3/5: 11, 12, 13, 14, 15 | prev=True next=True
Requested 5 -> page 5/5: 21, 22, 23 | prev=True next=False
Requested 9 -> page 5/5: 21, 22, 23 | prev=True next=False
Requested 0 -> page 1/5: 1, 2, 3, 4, 5 | prev=False next=True
After id 20: Student 21, Student 22, Student 23`,
      explanation: `23 / 5 = 4.6, rounded up to 5 pages. Page 3 skips (3 - 1) * 5 = 10 items and takes 11-15. The last page holds only 3 items. Out-of-range requests (9 and 0) are clamped to 5 and 1 instead of showing an empty page or throwing. Skip/Take on the IQueryable work identically with EF Core, where they become OFFSET/FETCH. The keyset query does not count or skip anything; it simply continues after the last id seen, which stays fast on huge tables because SQL Server seeks directly in the primary key index.`,
    },
    {
      title: `Performance optimization: before and after`,
      scenario: `The "Fee defaulters" report of StudentPortal takes several seconds. Apply the performance checklist step by step and register the DbContext for high traffic.`,
      steps: [
        `Turn on SQL logging (appsettings.Development.json, Microsoft.EntityFrameworkCore.Database.Command = Information)`,
        `Run the slow version and count the SQL statements in the Output window`,
        `Replace it with the optimized version`,
        `Add the index and create the migration: PM> Add-Migration PerformanceIndexes ; PM> Update-Database (CLI: dotnet ef migrations add PerformanceIndexes ; dotnet ef database update)`,
        `Change Program.cs to use AddDbContextPool and EnableRetryOnFailure`,
        `In SSMS: Query > Include Actual Execution Plan (Ctrl+M), run the logged SQL and check for an Index Seek instead of a Table Scan`,
      ],
      code: `// ===== SLOW: loads every column of every student, filters in memory, N+1 for departments =====
public async Task<IActionResult> Defaulters()
{
    var all = await _db.Students.ToListAsync();                 // whole table, tracked
    var result = new List<object>();
    foreach (var s in all.Where(s => s.IsActive && s.Fees > 40000))  // filtered in C#
    {
        await _db.Entry(s).Reference(x => x.Department).LoadAsync(); // 1 query per student (N+1)
        result.Add(new { s.RollNo, s.FullName, Dept = s.Department.Name, s.Fees });
    }
    return View(result);
}

// ===== FAST: one SQL statement, filtered, projected, paginated, no tracking =====
public async Task<IActionResult> Defaulters(int page = 1, CancellationToken ct = default)
{
    var result = await _db.Students
        .AsNoTracking()
        .Where(s => s.IsActive && s.Fees > 40000)
        .OrderByDescending(s => s.Fees).ThenBy(s => s.StudentId)
        .Select(s => new StudentListItem(s.StudentId, s.RollNo, s.FullName, s.Department.Name, s.Fees))
        .ToPagedResultAsync(page, 20, ct);
    return View(result);
}

// ===== Index matching the WHERE + ORDER BY (SchoolDbContext) =====
modelBuilder.Entity<Student>()
    .HasIndex(s => new { s.IsActive, s.Fees })
    .HasDatabaseName("IX_Students_IsActive_Fees");
-- CREATE INDEX [IX_Students_IsActive_Fees] ON [Students] ([IsActive], [Fees]);

// ===== Bulk update instead of a loop =====
await _db.Students.Where(s => s.IsActive && s.Fees > 40000)
    .ExecuteUpdateAsync(set => set.SetProperty(s => s.Fees, s => s.Fees + 500), ct);   // late fee, 1 statement

// ===== Compiled query for a very frequent lookup =====
private static readonly Func<SchoolDbContext, string, Task<Student?>> ByRollNo =
    EF.CompileAsyncQuery((SchoolDbContext db, string roll) =>
        db.Students.AsNoTracking().FirstOrDefault(s => s.RollNo == roll));
// usage: var s = await ByRollNo(_db, "R101");

// ===== Program.cs: pooling, retries, slow-query logging =====
builder.Services.AddDbContextPool<SchoolDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
            sql =>
            {
                sql.EnableRetryOnFailure(maxRetryCount: 3);
                sql.CommandTimeout(30);
            })
     .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)
     .LogTo(msg => Console.WriteLine(msg),
            (eventId, level) => eventId.Id == RelationalEventId.CommandExecuted.Id && level >= LogLevel.Information),
     poolSize: 128);

// ===== DbContextFactory: several queries in PARALLEL need separate contexts =====
builder.Services.AddPooledDbContextFactory<SchoolDbContext>(o => o.UseSqlServer(cs));
// in a service:
await using var db1 = await _factory.CreateDbContextAsync();
await using var db2 = await _factory.CreateDbContextAsync();
var t1 = db1.Students.CountAsync();
var t2 = db2.Departments.CountAsync();
await Task.WhenAll(t1, t2);                                   // OK: two different contexts`,
      result: `Slow version with 5,000 active students above 40000: 1 query loading all rows + 5,000 department queries (N+1), every column, everything tracked.
Optimized version: 2 statements per page (COUNT + one SELECT with INNER JOIN, OFFSET/FETCH, five columns), no tracking, and the execution plan shows an Index Seek on IX_Students_IsActive_Fees instead of a Clustered Index Scan.`,
      explanation: `The biggest wins come from letting SQL Server do the work: filtering, joining, sorting and paging in one statement, supported by an index on the WHERE/ORDER BY columns. AsNoTracking and projection reduce memory and CPU. ExecuteUpdateAsync replaces thousands of UPDATEs with one. AddDbContextPool reuses DbContext instances (the context must not hold per-request state in fields). EnableRetryOnFailure handles transient errors - remember to wrap manual transactions in CreateExecutionStrategy(). Note that a pooled context with a NoTracking default needs AsTracking() in the Edit/Update actions. Parallel queries require separate contexts, which IDbContextFactory provides; Task.WhenAll on a single context throws "A second operation was started on this context instance".`,
    },
    {
      title: `Pagination, search and transactions in plain T-SQL (SSMS Lab)`,
      scenario: `See exactly what Skip/Take, Contains and a rolled-back transaction do inside SQL Server, using a Students table with 12 rows.`,
      steps: [
        `Open SSMS (or the in-app SSMS Lab) > New Query`,
        `Paste the script and press F5`,
        `Compare page 2 (OFFSET 5 ROWS FETCH NEXT 5) with Skip(5).Take(5)`,
        `Notice that the fees go back to their original value after ROLLBACK`,
      ],
      code: `CREATE DATABASE PagingLabDb;
GO
USE PagingLabDb;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    RollNo NVARCHAR(20) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    Course NVARCHAR(50) NOT NULL,
    Fees DECIMAL(10,2) NOT NULL
);
CREATE INDEX IX_Students_FullName ON Students (FullName);
GO
INSERT INTO Students (RollNo, FullName, Course, Fees) VALUES
('R101', 'Asha Patil', 'BCA', 45000), ('R102', 'Rahul Mehta', 'BSc', 38000), ('R103', 'Neha Shah', 'BCA', 45000),
('R104', 'Kiran Rao', 'BCom', 32000), ('R105', 'Pooja Iyer', 'BCom', 32000), ('R106', 'Arjun Nair', 'BCA', 45000),
('R107', 'Meena Joshi', 'BSc', 38000), ('R108', 'Vikram Das', 'MCA', 60000), ('R109', 'Sara Khan', 'MCA', 60000),
('R110', 'Dev Kumar', 'BCA', 45000), ('R111', 'Isha Gupta', 'BSc', 38000), ('R112', 'Farhan Ali', 'BCom', 32000);
GO
SELECT COUNT(*) AS TotalStudents FROM Students;
SELECT StudentId, RollNo, FullName, Course
FROM Students
ORDER BY FullName
OFFSET 5 ROWS FETCH NEXT 5 ROWS ONLY;
SELECT COUNT(*) AS Matches FROM Students WHERE FullName LIKE '%ar%' OR RollNo LIKE '%ar%';
SELECT RollNo, FullName, Course
FROM Students
WHERE FullName LIKE '%ar%' OR RollNo LIKE '%ar%'
ORDER BY FullName
OFFSET 0 ROWS FETCH NEXT 3 ROWS ONLY;
BEGIN TRAN;
UPDATE Students SET Fees = Fees + 2000 WHERE Course = 'BCA';
SELECT RollNo, Fees FROM Students WHERE Course = 'BCA' ORDER BY RollNo;
ROLLBACK;
SELECT RollNo, Fees FROM Students WHERE Course = 'BCA' ORDER BY RollNo;`,
      tsql: `CREATE DATABASE PagingLabDb;
GO
USE PagingLabDb;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    RollNo NVARCHAR(20) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    Course NVARCHAR(50) NOT NULL,
    Fees DECIMAL(10,2) NOT NULL
);
CREATE INDEX IX_Students_FullName ON Students (FullName);
GO
INSERT INTO Students (RollNo, FullName, Course, Fees) VALUES
('R101', 'Asha Patil', 'BCA', 45000), ('R102', 'Rahul Mehta', 'BSc', 38000), ('R103', 'Neha Shah', 'BCA', 45000),
('R104', 'Kiran Rao', 'BCom', 32000), ('R105', 'Pooja Iyer', 'BCom', 32000), ('R106', 'Arjun Nair', 'BCA', 45000),
('R107', 'Meena Joshi', 'BSc', 38000), ('R108', 'Vikram Das', 'MCA', 60000), ('R109', 'Sara Khan', 'MCA', 60000),
('R110', 'Dev Kumar', 'BCA', 45000), ('R111', 'Isha Gupta', 'BSc', 38000), ('R112', 'Farhan Ali', 'BCom', 32000);
GO
SELECT COUNT(*) AS TotalStudents FROM Students;
SELECT StudentId, RollNo, FullName, Course
FROM Students
ORDER BY FullName
OFFSET 5 ROWS FETCH NEXT 5 ROWS ONLY;
SELECT COUNT(*) AS Matches FROM Students WHERE FullName LIKE '%ar%' OR RollNo LIKE '%ar%';
SELECT RollNo, FullName, Course
FROM Students
WHERE FullName LIKE '%ar%' OR RollNo LIKE '%ar%'
ORDER BY FullName
OFFSET 0 ROWS FETCH NEXT 3 ROWS ONLY;
BEGIN TRAN;
UPDATE Students SET Fees = Fees + 2000 WHERE Course = 'BCA';
SELECT RollNo, Fees FROM Students WHERE Course = 'BCA' ORDER BY RollNo;
ROLLBACK;
SELECT RollNo, Fees FROM Students WHERE Course = 'BCA' ORDER BY RollNo;`,
      result: `TotalStudents
12

StudentId | RollNo | FullName    | Course      (page 2, size 5)
4         | R104   | Kiran Rao   | BCom
7         | R107   | Meena Joshi | BSc
3         | R103   | Neha Shah   | BCA
5         | R105   | Pooja Iyer  | BCom
2         | R102   | Rahul Mehta | BSc

Matches
4

RollNo | FullName   | Course       (search "ar", page 1, size 3)
R106   | Arjun Nair | BCA
R110   | Dev Kumar  | BCA
R112   | Farhan Ali | BCom

(4 rows affected) by the UPDATE inside the transaction
RollNo | Fees
R101   | 47000
R103   | 47000
R106   | 47000
R110   | 47000

after ROLLBACK:
RollNo | Fees
R101   | 45000
R103   | 45000
R106   | 45000
R110   | 45000`,
      explanation: `Sorted by name the students are Arjun, Asha, Dev, Farhan, Isha | Kiran, Meena, Neha, Pooja, Rahul | Sara, Vikram, so OFFSET 5 FETCH NEXT 5 returns the second block - exactly what Skip(5).Take(5) generates. The search matches Arjun Nair, Dev Kumar, Farhan Ali and Sara Khan (4 matches, so with page size 3 there are 2 pages); "Ar" in Arjun matches because SQL Server's default collation is case-insensitive. The UPDATE inside BEGIN TRAN is visible within the transaction but ROLLBACK restores the original fees, which is what tx.RollbackAsync() does in EF Core. Lab note: DECIMAL values print without trailing zeros (47000 instead of 47000.00 in real SSMS).`,
    },
  ],
  interview: [
    { q: `Does SaveChanges use a transaction?`, a: `Yes. By default all commands of a single SaveChanges call run in one transaction; if one fails, everything in that call is rolled back.`, level: 'Easy' },
    { q: `When do you need an explicit transaction in EF Core?`, a: `When one business operation spans several SaveChanges calls, mixes SaveChanges with ExecuteUpdate/ExecuteDelete or raw SQL, or needs a specific isolation level. Use Database.BeginTransactionAsync, CommitAsync and RollbackAsync.`, level: 'Medium' },
    { q: `What happens if you dispose a transaction without calling Commit?`, a: `It is rolled back automatically. Calling RollbackAsync explicitly in a catch block makes the intent clear.`, level: 'Medium' },
    { q: `What are savepoints?`, a: `Named points inside a transaction (CreateSavepointAsync) that you can roll back to (RollbackToSavepointAsync) without abandoning the whole transaction. EF Core also creates one automatically when SaveChanges runs inside an existing transaction.`, level: 'Hard' },
    { q: `Why must manual transactions be wrapped in an execution strategy when EnableRetryOnFailure is on?`, a: `A retrying strategy can only replay a whole unit of work. Wrapping the transaction in CreateExecutionStrategy().ExecuteAsync(...) lets EF retry the entire block; otherwise EF throws an InvalidOperationException about user-initiated transactions.`, level: 'Hard' },
    { q: `Why use async EF Core methods in ASP.NET Core?`, a: `They free the request thread while the database works, improving scalability under load. They do not make an individual query faster.`, level: 'Easy' },
    { q: `Can you run two queries in parallel on the same DbContext?`, a: `No. DbContext is not thread-safe; a second operation while one is running throws InvalidOperationException. Await each call, or use separate contexts from IDbContextFactory.`, level: 'Medium' },
    { q: `How do you implement pagination in EF Core?`, a: `Apply a deterministic OrderBy, then Skip((page - 1) * pageSize).Take(pageSize), which becomes OFFSET/FETCH. Run CountAsync with the same filters for the total, and validate page and pageSize.`, level: 'Easy' },
    { q: `Why must you call OrderBy before Skip/Take?`, a: `Without ORDER BY, SQL Server does not guarantee row order, so pages could overlap or skip rows. EF Core also warns about it. Add a unique tie-breaker such as the primary key.`, level: 'Medium' },
    { q: `Offset vs keyset pagination?`, a: `Offset (Skip/Take) allows jumping to any page but gets slower for deep pages because skipped rows are still read. Keyset (WHERE Id > lastId ORDER BY Id TAKE n) is constant-time using an index, ideal for infinite scroll, but cannot jump to arbitrary pages.`, level: 'Hard' },
    { q: `How do you prevent SQL injection in a search box with EF Core?`, a: `Use LINQ (Contains, StartsWith, EF.Functions.Like) with C# variables - EF sends them as parameters. For raw SQL use FromSql/ExecuteSql with interpolation (parameterised), never string concatenation; whitelist sort columns.`, level: 'Medium' },
    { q: `List five EF Core performance optimizations.`, a: `AsNoTracking for reads, projection with Select, proper indexes, avoiding N+1 with Include/projection, pagination, AsSplitQuery for many collections, ExecuteUpdate/ExecuteDelete for bulk changes, DbContext pooling, compiled queries.`, level: 'Medium' },
    { q: `What is DbContext pooling?`, a: `AddDbContextPool keeps a pool of DbContext instances and resets them between requests instead of creating new ones, reducing allocation overhead in high-throughput apps. The context must not keep request-specific state in fields.`, level: 'Hard' },
    { q: `What is a compiled query?`, a: `A LINQ query pre-translated once with EF.CompileQuery / EF.CompileAsyncQuery and stored in a static delegate, skipping the translation cache lookup on each execution. Useful only for very hot queries.`, level: 'Hard' },
    { q: `Output-based: 47 records, page size 10. How many pages, and how many records are on the last page?`, a: `Ceiling(47 / 10) = 5 pages; the last page contains 47 - 40 = 7 records.`, level: 'Easy' },
    { q: `Why can identity values have gaps after a rollback?`, a: `SQL Server allocates identity values outside the transaction for performance; a rolled-back INSERT does not return its value, so the next row gets the following number. Never rely on ids being consecutive.`, level: 'Medium' },
  ],
  practice: [
    {
      task: `Write a TransferStudentAsync(studentId, newDepartmentId) method that moves a student to another department and writes an AuditLog row, both in one explicit transaction.`,
      hint: `BeginTransactionAsync, two SaveChangesAsync calls, CommitAsync; rollback in catch.`,
      solution: `public async Task TransferStudentAsync(int studentId, int newDeptId, CancellationToken ct = default)
{
    await using var tx = await _db.Database.BeginTransactionAsync(ct);
    try
    {
        var s = await _db.Students.SingleAsync(x => x.StudentId == studentId, ct);
        int oldDept = s.DepartmentId;
        s.DepartmentId = newDeptId;
        await _db.SaveChangesAsync(ct);

        _db.AuditLogs.Add(new AuditLog { Message = $"Student {studentId}: dept {oldDept} -> {newDeptId}" });
        await _db.SaveChangesAsync(ct);

        await tx.CommitAsync(ct);
    }
    catch
    {
        await tx.RollbackAsync(ct);
        throw;
    }
}`,
    },
    {
      task: `Convert this blocking code to proper async: var list = _db.Students.ToList(); var count = _db.Students.Count(); _db.SaveChanges();`,
      hint: `Async methods + await + CancellationToken; no .Result.`,
      solution: `var list = await _db.Students.AsNoTracking().ToListAsync(ct);
var count = await _db.Students.CountAsync(ct);
await _db.SaveChangesAsync(ct);
// the action signature becomes: public async Task<IActionResult> Index(CancellationToken ct)`,
    },
    {
      task: `Create an Employees search page (search by name or code, filter by department, sort by salary, 15 per page) using the ToPagedResultAsync extension.`,
      hint: `Compose IQueryable, whitelist sort values, project to a DTO, then page.`,
      solution: `IQueryable<Employee> q = _db.Employees.AsNoTracking();
if (!string.IsNullOrWhiteSpace(search)) q = q.Where(e => e.FullName.Contains(search) || e.EmpCode.Contains(search));
if (deptId is not null) q = q.Where(e => e.DepartmentId == deptId);
q = sort == "salary_desc" ? q.OrderByDescending(e => e.Salary).ThenBy(e => e.EmployeeId)
                          : q.OrderBy(e => e.Salary).ThenBy(e => e.EmployeeId);
var page1 = await q.Select(e => new { e.EmpCode, e.FullName, Dept = e.Department.Name, e.Salary })
                   .ToPagedResultAsync(page, 15, ct);`,
    },
    {
      task: `Implement "Load more" for students using keyset pagination: given lastId, return the next 20 students and the new lastId.`,
      hint: `Where(s => s.StudentId > lastId).OrderBy(s => s.StudentId).Take(20).`,
      solution: `var batch = await _db.Students.AsNoTracking()
    .Where(s => s.StudentId > lastId)
    .OrderBy(s => s.StudentId)
    .Take(20)
    .Select(s => new { s.StudentId, s.FullName })
    .ToListAsync(ct);
int newLastId = batch.Count > 0 ? batch[^1].StudentId : lastId;`,
    },
    {
      task: `A report loops over 1,000 departments and reads d.Employees.Count with lazy loading. List the problems and write the optimized query.`,
      hint: `N+1, tracking, all columns.`,
      solution: `Problems: 1 + 1000 queries (N+1), every employee entity loaded and tracked only to count them.
var report = await _db.Departments.AsNoTracking()
    .Select(d => new { d.Name, Employees = d.Employees.Count })
    .OrderBy(x => x.Name)
    .ToListAsync(ct);
-- one SELECT with a COUNT(*) subquery per department row`,
    },
  ],
  quiz: [
    { question: `Skip(20).Take(10) on SQL Server becomes:`, options: [`TOP 30`, `LIMIT 10 OFFSET 20`, `OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY`, `ROWNUM BETWEEN 20 AND 30`], answer: 2, explanation: `SQL Server uses OFFSET ... FETCH NEXT, which requires ORDER BY.` },
    { question: `Which call makes an explicit EF Core transaction permanent?`, options: [`tx.CommitAsync()`, `db.SaveChangesAsync()`, `tx.DisposeAsync()`, `db.Database.EnsureCreated()`], answer: 0, explanation: `CommitAsync commits; disposing without commit rolls back.` },
    { question: `Running two queries with Task.WhenAll on the SAME DbContext:`, options: [`Is twice as fast`, `Works only with AsNoTracking`, `Is required for async`, `Throws because DbContext is not thread-safe`], answer: 3, explanation: `Use separate contexts (IDbContextFactory) for parallel work.` },
    { question: `Which pagination style stays fast on very deep pages?`, options: [`Offset pagination`, `Keyset (seek) pagination`, `Loading everything and paging in memory`, `Lazy loading`], answer: 1, explanation: `Keyset pagination seeks by key with an index instead of skipping rows.` },
    { question: `Which is NOT an EF Core performance optimization?`, options: [`AsNoTracking for read-only queries`, `Projection with Select`, `Calling ToList() before Where()`, `Adding an index on filtered columns`], answer: 2, explanation: `ToList before Where downloads the whole table and filters in memory.` },
  ],
};
