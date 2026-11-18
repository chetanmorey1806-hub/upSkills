export default {
  id: 'day-084-linq-ef-core-loading-related-data',
  title: `LINQ with EF Core, Include, ThenInclude, AsNoTracking, Eager and Lazy Loading`,
  module: `Module 7: Entity Framework Core & Database Connectivity`,
  day: 84,
  level: `Intermediate`,
  duration: `3 hours`,
  summary: `Write LINQ queries that EF Core translates into efficient SQL. Understand IQueryable vs IEnumerable and deferred execution, how each LINQ operator becomes SQL, and every way to load related data: eager loading with Include/ThenInclude (including filtered Include and split queries), explicit loading, lazy loading with proxies and the N+1 problem, and projection with Select. Learn when to use AsNoTracking and AsNoTrackingWithIdentityResolution. The running example fetches employees with their department in the EmployeePortal project.`,
  objectives: [
    `Explain deferred execution and the difference between IQueryable<T> and IEnumerable<T> with EF Core`,
    `Write LINQ queries (Where, Select, OrderBy, GroupBy, Join, Any, Contains, Like) and predict the SQL`,
    `Load related data with Include, ThenInclude, filtered Include and AsSplitQuery`,
    `Compare eager, explicit and lazy loading, and recognise and fix the N+1 query problem`,
    `Use AsNoTracking and projections for fast read-only queries`,
  ],
  theory: [
    {
      heading: `LINQ to Entities, IQueryable and Deferred Execution`,
      content: `db.Employees is an IQueryable<Employee>. Each LINQ operator you add (Where, OrderBy, Select ...) does not run anything - it only builds an expression tree. When the query is enumerated (ToList, ToListAsync, foreach, First, Count, Any, Sum ...), EF Core translates the whole expression tree into ONE SQL statement and sends it to SQL Server. This is deferred execution.

IEnumerable<T> is different: its operators run in C# memory. If you turn a DbSet into IEnumerable too early (AsEnumerable(), ToList(), or a variable typed IEnumerable<Employee>), every following filter runs in memory after ALL rows have been downloaded.`,
      syntax: `IQueryable<Employee> q = db.Employees.Where(e => e.Salary > 50000);   // nothing sent yet
q = q.OrderBy(e => e.LastName);                                          // still nothing
var list = await q.ToListAsync();          // SELECT ... WHERE [Salary] > 50000.0 ORDER BY [LastName]

IEnumerable<Employee> bad = db.Employees;  // typed as IEnumerable!
var x = bad.Where(e => e.Salary > 50000).ToList();   // SELECT * FROM Employees, then filters in C#`,
      points: [
        `Build queries step by step with IQueryable (great for optional search filters)`,
        `Every enumeration runs the SQL again - store results in a list if you need them twice`,
        `EF Core 3+ throws an exception if part of a query cannot be translated (except in the final Select), instead of silently evaluating it on the client`,
        `Call ToQueryString() to see the SQL without executing it`,
      ],
    },
    {
      heading: `How LINQ Operators Become SQL`,
      content: `Most everyday operators have a direct SQL equivalent:`,
      syntax: `Where(e => e.Salary > 50000)            -> WHERE [e].[Salary] > 50000.0
Select(e => new { e.FullName })          -> SELECT [e].[FullName]     (only these columns)
OrderBy / ThenByDescending               -> ORDER BY [x], [y] DESC
Skip(20).Take(10)                        -> OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY
First / FirstOrDefault                   -> SELECT TOP(1)
Single                                   -> SELECT TOP(2)
Any(e => ...)                            -> EXISTS (SELECT 1 ...)  / CASE WHEN EXISTS
Count / Sum / Average / Max              -> COUNT(*) / SUM / AVG / MAX
GroupBy(e => e.DepartmentId).Select(g => new { g.Key, Total = g.Count() })  -> GROUP BY
codes.Contains(e.EmpCode)                -> [e].[EmpCode] IN (...)  (EF 8+: OPENJSON parameter)
e.FirstName.StartsWith("A")              -> [e].[FirstName] LIKE N'A%'
e.FirstName.Contains("ar")               -> [e].[FirstName] LIKE N'%ar%'
EF.Functions.Like(e.Email, "%@gmail.com")-> [e].[Email] LIKE N'%@gmail.com'
e.Department.Name == "IT"                -> INNER JOIN [Departments] ... WHERE [d].[Name] = N'IT'
join d in db.Departments on ...          -> INNER JOIN (rarely needed: use navigations)`,
      tip: `Prefer navigation properties (e.Department.Name) over manual join clauses - EF generates the JOIN for you and the query reads like plain English.`,
    },
    {
      heading: `Eager Loading: Include and ThenInclude`,
      content: `Related entities are not loaded unless you ask. Eager loading asks up front: Include loads a navigation of the root entity, ThenInclude goes one level deeper from the previous Include. Several Includes can be chained. Since EF Core 5, an Include can contain Where, OrderBy, Skip and Take to load only some children (filtered include).`,
      syntax: `var emps = await db.Employees
    .Include(e => e.Department)                     // employee -> department
    .Include(e => e.Manager)                        // employee -> manager
    .ToListAsync();

var depts = await db.Departments
    .Include(d => d.Employees)                      // department -> employees
        .ThenInclude(e => e.Manager)                // -> each employee's manager
    .Include(d => d.Head)
    .ToListAsync();

var topPaid = await db.Departments
    .Include(d => d.Employees.Where(e => e.Status == EmployeeStatus.Active)
                             .OrderByDescending(e => e.Salary).Take(3))  // filtered include
    .ToListAsync();`,
      points: [
        `Reference navigations become JOINs; collection navigations become LEFT JOIN + ORDER BY on keys`,
        `Including several collections in one query multiplies rows ("cartesian explosion") - use AsSplitQuery() to run one SQL per collection`,
        `Configure the default with UseSqlServer(cs, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))`,
        `AutoInclude(): modelBuilder.Entity<Employee>().Navigation(e => e.Department).AutoInclude(); (turn off per query with IgnoreAutoIncludes())`,
      ],
    },
    {
      heading: `Explicit and Lazy Loading`,
      content: `Explicit loading: first load the main entity, then load a navigation later, only when you decide it is needed. Use the Entry API. Query() on a collection lets you count or filter children without loading them all.

Lazy loading: the navigation loads itself automatically the first time you read the property. It requires the Microsoft.EntityFrameworkCore.Proxies package, UseLazyLoadingProxies() and virtual navigation properties (or ILazyLoader injection). It is convenient but dangerous: looping over 100 departments and reading d.Employees sends 1 + 100 queries - the famous N+1 problem. It also does not work after the context is disposed.`,
      syntax: `// explicit
var it = await db.Departments.SingleAsync(d => d.Name == "IT");
await db.Entry(it).Collection(d => d.Employees).LoadAsync();         // collection
await db.Entry(emp).Reference(e => e.Department).LoadAsync();        // reference
int active = await db.Entry(it).Collection(d => d.Employees).Query()
                     .CountAsync(e => e.Status == EmployeeStatus.Active);

// lazy
// PM> Install-Package Microsoft.EntityFrameworkCore.Proxies
options.UseLazyLoadingProxies().UseSqlServer(cs);
public virtual Department Department { get; set; } = null!;   // virtual!
public virtual List<Employee> Employees { get; set; } = new();`,
    },
    {
      heading: `Projection with Select: Load Exactly What the Page Needs`,
      content: `Often the best way to fetch related data is not to load entities at all but to project into a small DTO or view model. Navigations used inside Select are translated to JOINs automatically, no Include is required, only the requested columns are read and nothing is tracked. For list pages, reports and APIs this is usually the fastest option.`,
      syntax: `var rows = await db.Employees
    .Where(e => e.Status == EmployeeStatus.Active)
    .OrderBy(e => e.EmpCode)
    .Select(e => new EmployeeListItem
    {
        EmpCode = e.EmpCode,
        FullName = e.FullName,
        Department = e.Department.Name,
        Manager = e.Manager != null ? e.Manager.FullName : "-",
        TeamSize = e.Subordinates.Count
    })
    .ToListAsync();`,
      tip: `Include + projection: when a query ends with Select, Include is ignored - the projection already decides what is loaded.`,
    },
    {
      heading: `Tracking vs AsNoTracking`,
      content: `By default every entity returned by a query is tracked: EF stores a snapshot of its original values so SaveChanges can detect changes, and returns the same object for the same key (identity resolution). Tracking costs memory and CPU. For read-only screens use AsNoTracking().`,
      points: [
        `Tracking (default) - use when you will modify and SaveChanges the entities`,
        `AsNoTracking() - faster, less memory; changes to these objects are NOT saved; the same row loaded twice becomes two different objects`,
        `AsNoTrackingWithIdentityResolution() - no tracking, but one object per key inside the result (useful with Include of shared parents)`,
        `Context-wide default: options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking), then use AsTracking() when needed`,
        `Projections to non-entity types (DTOs, anonymous types) are never tracked`,
      ],
    },
  ],
  examples: [
    {
      title: `Fetch employees with their department (Include / ThenInclude in MVC)`,
      scenario: `In EmployeePortal (Department and Employee from Day 83) build the Employees list page showing the department of each employee, and a Details page showing the department, its head, the employee's manager and direct reports.`,
      steps: [
        `Open EmployeePortal in Visual Studio`,
        `Make sure EmployeeDb exists: PMC > Update-Database (CLI: dotnet ef database update)`,
        `Enable SQL logging: add "Microsoft.EntityFrameworkCore.Database.Command": "Information" under Logging:LogLevel in appsettings.Development.json`,
        `Right-click Controllers > Add > Controller > MVC Controller - Empty > EmployeesController.cs, paste the code`,
        `Right-click inside Index > Add View > Razor View > Index.cshtml (model List<Employee>), and the same for Details`,
        `Press F5, open /Employees and /Employees/Details/2`,
        `View > Output > Show output from: ASP.NET Core Web Server to read the SQL`,
      ],
      code: `// ===== appsettings.Development.json =====
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}

// ===== Controllers/EmployeesController.cs =====
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeePortal.Data;

namespace EmployeePortal.Controllers;

public class EmployeesController : Controller
{
    private readonly EmployeeDbContext _db;
    public EmployeesController(EmployeeDbContext db) => _db = db;

    // GET /Employees?dept=IT
    public async Task<IActionResult> Index(string? dept)
    {
        var query = _db.Employees
            .AsNoTracking()
            .Include(e => e.Department)                  // fetch employee WITH department
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(dept))
            query = query.Where(e => e.Department.Name == dept);

        var employees = await query.OrderBy(e => e.EmpCode).ToListAsync();
        ViewBag.Dept = dept;
        return View(employees);
    }

    // GET /Employees/Details/2
    public async Task<IActionResult> Details(int id)
    {
        var employee = await _db.Employees
            .AsNoTracking()
            .Include(e => e.Department)
                .ThenInclude(d => d.Head)                // employee -> department -> head
            .Include(e => e.Manager)                     // employee -> manager
            .Include(e => e.Subordinates.OrderBy(s => s.EmpCode))   // filtered/ordered include
            .FirstOrDefaultAsync(e => e.EmployeeId == id);

        return employee is null ? NotFound() : View(employee);
    }
}

@* ===== Views/Employees/Index.cshtml ===== *@
@model List<EmployeePortal.Models.Employee>
@{ ViewData["Title"] = "Employees"; }

<h2>Employees @(ViewBag.Dept is string d ? "- " + d : "")</h2>
<p>
    <a asp-action="Index">All</a> |
    <a asp-action="Index" asp-route-dept="IT">IT</a> |
    <a asp-action="Index" asp-route-dept="HR">HR</a>
</p>
<table class="table table-sm">
    <thead><tr><th>Code</th><th>Name</th><th>Department</th><th>Location</th><th>Salary</th><th></th></tr></thead>
    <tbody>
    @foreach (var e in Model)
    {
        <tr>
            <td>@e.EmpCode</td>
            <td>@e.FullName</td>
            <td>@e.Department.Name</td>
            <td>@e.Department.Location</td>
            <td>@e.Salary.ToString("0.00")</td>
            <td><a asp-action="Details" asp-route-id="@e.EmployeeId">Details</a></td>
        </tr>
    }
    </tbody>
</table>

@* ===== Views/Employees/Details.cshtml ===== *@
@model EmployeePortal.Models.Employee
<h2>@Model.FullName (@Model.EmpCode)</h2>
<dl class="row">
    <dt class="col-sm-3">Department</dt><dd class="col-sm-9">@Model.Department.Name, @Model.Department.Location</dd>
    <dt class="col-sm-3">Department head</dt><dd class="col-sm-9">@(Model.Department.Head?.FullName ?? "-")</dd>
    <dt class="col-sm-3">Reports to</dt><dd class="col-sm-9">@(Model.Manager?.FullName ?? "-")</dd>
    <dt class="col-sm-3">Direct reports</dt>
    <dd class="col-sm-9">
        @if (Model.Subordinates.Count == 0) { <span>None</span> }
        @foreach (var s in Model.Subordinates) { <div>@s.EmpCode - @s.FullName</div> }
    </dd>
</dl>
<a asp-action="Index">Back to list</a>

-- ===== SQL for Index (logged) =====
SELECT [e].[EmployeeId], [e].[DepartmentId], [e].[Email], [e].[EmpCode], [e].[FirstName], [e].[FullName],
       [e].[JoinDate], [e].[LastName], [e].[ManagerId], [e].[RowVersion], [e].[Salary], [e].[Status],
       [d].[DepartmentId], [d].[HeadEmployeeId], [d].[Location], [d].[Name]
FROM [Employees] AS [e]
INNER JOIN [Departments] AS [d] ON [e].[DepartmentId] = [d].[DepartmentId]
ORDER BY [e].[EmpCode]

-- ===== SQL for Details (simplified) =====
SELECT [s].[EmployeeId], ..., [s].[DepartmentId0], [s].[Name], [s].[EmployeeId0], [s].[FullName0], ..., [e2].[EmployeeId], [e2].[EmpCode], ...
FROM (
    SELECT TOP(1) [e].*, [d].*, [e0].* /* head */, [e1].* /* manager */
    FROM [Employees] AS [e]
    INNER JOIN [Departments] AS [d] ON [e].[DepartmentId] = [d].[DepartmentId]
    LEFT JOIN [Employees] AS [e0] ON [d].[HeadEmployeeId] = [e0].[EmployeeId]
    LEFT JOIN [Employees] AS [e1] ON [e].[ManagerId] = [e1].[EmployeeId]
    WHERE [e].[EmployeeId] = @id
) AS [s]
LEFT JOIN [Employees] AS [e2] ON [s].[EmployeeId] = [e2].[ManagerId]
ORDER BY [s].[EmployeeId], [s].[DepartmentId0], [s].[EmployeeId0], [s].[EmployeeId1], [e2].[EmpCode]`,
      result: `/Employees (data from Day 83):
Code | Name        | Department | Location    | Salary
E001 | Priya Nair  | IT         | Head Office | 120000.00
E002 | Arjun Rao   | IT         | Head Office | 85000.00
E003 | Sara Khan   | IT         | Head Office | 78000.00
E004 | Vikram Das  | HR         | Pune Branch | 70000.00
E005 | Meena Joshi | IT         | Head Office | 60000.00

/Employees/Details/2 (Arjun):
Department: IT, Head Office | Department head: Priya Nair | Reports to: Priya Nair | Direct reports: E005 - Meena Joshi

Only ONE SQL statement is logged per page.`,
      explanation: `Include(e => e.Department) turns into an INNER JOIN (the FK is required), so the list page needs one query no matter how many employees there are. In Details, ThenInclude continues from Department to its Head, Include(e => e.Manager) adds a LEFT JOIN to Employees (optional self-reference), and the ordered collection include adds a LEFT JOIN on the subordinates with ORDER BY. Without the Includes, @e.Department.Name would throw NullReferenceException because the navigation is null. AsNoTracking is used because both pages only display data. The optional dept filter shows how IQueryable lets you add Where conditionally before the query runs.`,
    },
    {
      title: `Eager vs explicit vs lazy loading vs projection - count the queries`,
      scenario: `Measure how many SQL statements each loading strategy sends, using a small command interceptor, and see the N+1 problem of lazy loading with your own eyes.`,
      steps: [
        `Open the EmployeeNavigation console app from Day 83 (Department, Employee, configurations)`,
        `PMC: Install-Package Microsoft.EntityFrameworkCore.Proxies (CLI: dotnet add package Microsoft.EntityFrameworkCore.Proxies)`,
        `Make every navigation property virtual in Department and Employee (needed by lazy-loading proxies)`,
        `Add QueryCounter.cs, update EmployeeContext and add LazyEmployeeContext as below`,
        `Replace Program.cs and press Ctrl+F5`,
      ],
      code: `// ===== Entities (navigations made virtual) =====
public class Department
{
    public int DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public int? HeadEmployeeId { get; set; }
    public virtual Employee? Head { get; set; }
    public virtual List<Employee> Employees { get; set; } = new();
}
// Employee: public virtual Department Department ..., public virtual Employee? Manager ...,
//           public virtual List<Employee> Subordinates ... (other members as on Day 83)

// ===== QueryCounter.cs =====
using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace EmployeeNavigation;

public class QueryCounter : DbCommandInterceptor
{
    public static int Count;
    public static void Reset() => Count = 0;

    public override InterceptionResult<DbDataReader> ReaderExecuting(
        DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result)
    {
        Count++;
        return result;
    }

    public override InterceptionResult<object> ScalarExecuting(
        DbCommand command, CommandEventData eventData, InterceptionResult<object> result)
    {
        Count++;
        return result;
    }
}

// ===== EmployeeContext.cs =====
using Microsoft.EntityFrameworkCore;

namespace EmployeeNavigation;

public class EmployeeContext : DbContext
{
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnConfiguring(DbContextOptionsBuilder o)
        => o.UseSqlServer(@"Server=(localdb)\\MSSQLLocalDB;Database=EmployeeLoadDb;Trusted_Connection=True;TrustServerCertificate=True")
            .AddInterceptors(new QueryCounter());

    protected override void OnModelCreating(ModelBuilder mb)
        => mb.ApplyConfigurationsFromAssembly(typeof(EmployeeContext).Assembly);
}

public class LazyEmployeeContext : EmployeeContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder o)
    {
        base.OnConfiguring(o);
        o.UseLazyLoadingProxies();          // navigations load on first access
    }
}

// ===== Program.cs =====
using Microsoft.EntityFrameworkCore;
using EmployeeNavigation;

using (var db = new EmployeeContext())
{
    db.Database.EnsureDeleted();
    db.Database.EnsureCreated();
    var it = new Department { Name = "IT" };
    var hr = new Department { Name = "HR", Location = "Pune Branch" };
    var priya = new Employee { EmpCode = "E001", FirstName = "Priya", LastName = "Nair", Salary = 120000m, Department = it };
    var arjun = new Employee { EmpCode = "E002", FirstName = "Arjun", LastName = "Rao", Salary = 85000m, Department = it, Manager = priya };
    db.Employees.AddRange(priya, arjun,
        new Employee { EmpCode = "E003", FirstName = "Sara", LastName = "Khan", Salary = 78000m, Department = it, Manager = priya },
        new Employee { EmpCode = "E004", FirstName = "Vikram", LastName = "Das", Salary = 70000m, Department = hr },
        new Employee { EmpCode = "E005", FirstName = "Meena", LastName = "Joshi", Salary = 60000m, Department = it, Manager = arjun });
    db.SaveChanges();
}

// 1. No loading at all
using (var db = new EmployeeContext())
{
    QueryCounter.Reset();
    var arjun = db.Employees.First(e => e.EmpCode == "E002");
    Console.WriteLine($"1. No Include: Department is {(arjun.Department == null ? "null" : arjun.Department.Name)} | queries: {QueryCounter.Count}");
}

// 2. Eager loading
using (var db = new EmployeeContext())
{
    QueryCounter.Reset();
    var list = db.Employees.Include(e => e.Department).OrderBy(e => e.EmpCode).ToList();
    Console.WriteLine("2. Eager loading (Include):");
    foreach (var e in list)
        Console.WriteLine($"   {e.EmpCode} {e.FirstName} - {e.Department.Name}");
    Console.WriteLine($"   queries: {QueryCounter.Count}");
}

// 3. Explicit loading
using (var db = new EmployeeContext())
{
    QueryCounter.Reset();
    var it = db.Departments.Single(d => d.Name == "IT");
    db.Entry(it).Collection(d => d.Employees).Load();
    int highPaid = db.Entry(it).Collection(d => d.Employees).Query().Count(e => e.Salary > 80000);
    Console.WriteLine($"3. Explicit: IT has {it.Employees.Count} employees, {highPaid} earn above 80000 | queries: {QueryCounter.Count}");
}

// 4. Lazy loading (N+1)
using (var db = new LazyEmployeeContext())
{
    QueryCounter.Reset();
    Console.WriteLine("4. Lazy loading:");
    foreach (var d in db.Departments.OrderBy(d => d.Name).ToList())
        Console.WriteLine($"   {d.Name}: {d.Employees.Count} employees");   // each access = 1 query
    Console.WriteLine($"   queries: {QueryCounter.Count} (1 + N)");
}

// 5. Projection, no tracking
using (var db = new EmployeeContext())
{
    QueryCounter.Reset();
    var rows = db.Employees
        .Where(e => e.Department.Name == "IT")
        .OrderByDescending(e => e.Salary)
        .Select(e => new { e.FullName, Dept = e.Department.Name, Manager = e.Manager != null ? e.Manager.FullName : "-" })
        .ToList();
    Console.WriteLine("5. Projection:");
    foreach (var r in rows)
        Console.WriteLine($"   {r.FullName} | {r.Dept} | {r.Manager}");
    Console.WriteLine($"   queries: {QueryCounter.Count}, tracked entities: {db.ChangeTracker.Entries().Count()}");
}`,
      result: `1. No Include: Department is null | queries: 1
2. Eager loading (Include):
   E001 Priya - IT
   E002 Arjun - IT
   E003 Sara - IT
   E004 Vikram - HR
   E005 Meena - IT
   queries: 1
3. Explicit: IT has 4 employees, 2 earn above 80000 | queries: 3
4. Lazy loading:
   HR: 1 employees
   IT: 4 employees
   queries: 3 (1 + N)
5. Projection:
   Priya Nair | IT | -
   Arjun Rao | IT | Priya Nair
   Sara Khan | IT | Priya Nair
   Meena Joshi | IT | Arjun Rao
   queries: 1, tracked entities: 0`,
      explanation: `Each scenario uses a fresh context so nothing is already in memory. (1) Without Include the navigation stays null - EF never loads related data silently. (2) Include joins Departments into the same SELECT: 1 query for any number of employees. (3) Explicit loading costs one query per Load/Query call: Single + Load + Count = 3; Query().Count runs COUNT(*) in SQL without loading rows. (4) With lazy proxies every first access to d.Employees fires a new SELECT: 1 query for the departments + 1 per department. With 2 departments that is 3, with 500 departments it would be 501 - the N+1 problem. (5) The projection produces one SQL statement with two JOINs, reads only three columns and tracks nothing. Professional rule: use projection for lists, Include when you need entities, explicit loading for rare conditional cases, and avoid lazy loading in web apps.`,
    },
    {
      title: `Deferred execution: when does a query really run? (runnable)`,
      scenario: `Before blaming EF Core for "extra queries", understand deferred execution with plain LINQ to Objects. The same rules apply to IQueryable: building a query does nothing, every enumeration runs it again.`,
      steps: [
        `In Visual Studio: File > New > Project > Console App`,
        `Name it DeferredExecutionDemo`,
        `Replace Program.cs with the code`,
        `Set a breakpoint (F9) on the line var list = query.ToList(); and press F5; step with F10 and watch the evaluated variable in the Locals window`,
        `Press Ctrl+F5 to run without debugging`,
      ],
      code: `var employees = new List<Emp>
{
    new("E001", "Priya", 120000),
    new("E002", "Arjun", 85000),
    new("E003", "Sara", 78000),
    new("E004", "Vikram", 70000),
    new("E005", "Meena", 60000),
};

int evaluated = 0;
var query = employees.Where(e => { evaluated++; return e.Salary > 70000; });
Console.WriteLine($"Query created. Predicate calls so far: {evaluated}");

employees.Add(new Emp("E006", "Kabir", 95000));      // added AFTER the query was defined

var list = query.ToList();                            // runs now
Console.WriteLine($"After ToList: {list.Count} matches, predicate calls: {evaluated}");

int again = query.Count();                            // runs AGAIN
Console.WriteLine($"After Count: {again} matches, predicate calls: {evaluated}");

int fromList = list.Count;                            // no re-run: list is materialised
Console.WriteLine($"list.Count: {fromList}, predicate calls: {evaluated}");

Console.WriteLine(string.Join(", ", list.Select(e => e.Name)));

record Emp(string Code, string Name, decimal Salary);

/* EF Core equivalent:
   var q = db.Employees.Where(e => e.Salary > 70000);   // no SQL
   var l = await q.ToListAsync();                       // SQL #1
   var c = await q.CountAsync();                        // SQL #2 (SELECT COUNT(*) ...)
   var n = l.Count;                                     // no SQL */`,
      csharp: {
        files: {
          'Program.cs': `var employees = new List<Emp>
{
    new("E001", "Priya", 120000),
    new("E002", "Arjun", 85000),
    new("E003", "Sara", 78000),
    new("E004", "Vikram", 70000),
    new("E005", "Meena", 60000),
};

int evaluated = 0;
var query = employees.Where(e => { evaluated++; return e.Salary > 70000; });
Console.WriteLine($"Query created. Predicate calls so far: {evaluated}");

employees.Add(new Emp("E006", "Kabir", 95000));      // added AFTER the query was defined

var list = query.ToList();                            // runs now
Console.WriteLine($"After ToList: {list.Count} matches, predicate calls: {evaluated}");

int again = query.Count();                            // runs AGAIN
Console.WriteLine($"After Count: {again} matches, predicate calls: {evaluated}");

int fromList = list.Count;                            // no re-run: list is materialised
Console.WriteLine($"list.Count: {fromList}, predicate calls: {evaluated}");

Console.WriteLine(string.Join(", ", list.Select(e => e.Name)));

record Emp(string Code, string Name, decimal Salary);
`,
        },
        stdin: '',
      },
      result: `Query created. Predicate calls so far: 0
After ToList: 4 matches, predicate calls: 6
After Count: 4 matches, predicate calls: 12
list.Count: 4, predicate calls: 12
Priya, Arjun, Sara, Kabir`,
      explanation: `Defining the query calls the predicate zero times. Kabir is added afterwards but is still included, proving the query runs only at ToList: it checks all 6 employees (6 calls) and finds 4 with salary above 70000 (Vikram's 70000 is not greater). Count() enumerates the source again: 6 more calls, 12 in total. list.Count is just a property of the materialised list. With EF Core every re-enumeration means another SQL round trip, so materialise once (ToListAsync) when you need the data several times.`,
    },
    {
      title: `Filtered Include, AsSplitQuery and the cartesian explosion`,
      scenario: `The Department dashboard needs each department with its top 3 active earners and its projects. Loading two collections in one query can multiply rows; compare single and split queries.`,
      steps: [
        `Add a Project entity with a many-to-many Employee.Projects / Project.Members (Day 83 practice)`,
        `PM> Add-Migration EmployeeProjects ; PM> Update-Database`,
        `Add the Dashboard action to a DepartmentsController`,
        `Run the page with and without .AsSplitQuery() and compare the Output window`,
      ],
      code: `// ===== DepartmentsController.Dashboard =====
public async Task<IActionResult> Dashboard()
{
    var depts = await _db.Departments
        .AsNoTracking()
        .Include(d => d.Head)
        .Include(d => d.Employees
                .Where(e => e.Status == EmployeeStatus.Active)
                .OrderByDescending(e => e.Salary)
                .Take(3))                                   // filtered include (EF Core 5+)
            .ThenInclude(e => e.Projects)
        .OrderBy(d => d.Name)
        .AsSplitQuery()                                     // one SQL per collection
        .ToListAsync();
    return View(depts);
}

-- ===== Without AsSplitQuery: ONE query, rows = departments x employees x projects =====
SELECT [d].[DepartmentId], [d].[Name], [e].[EmployeeId], [e].[FullName], ..., [s].[ProjectId], [s].[Title]
FROM [Departments] AS [d]
LEFT JOIN [Employees] AS [e] ON [d].[HeadEmployeeId] = [e].[EmployeeId]
LEFT JOIN (
    SELECT [t].* FROM (
        SELECT [e0].*, ROW_NUMBER() OVER(PARTITION BY [e0].[DepartmentId] ORDER BY [e0].[Salary] DESC) AS [row]
        FROM [Employees] AS [e0]
        WHERE [e0].[Status] = N'Active'
    ) AS [t] WHERE [t].[row] <= 3
) AS [t0] ON [d].[DepartmentId] = [t0].[DepartmentId]
LEFT JOIN ( ... EmployeeProjects JOIN Projects ... ) AS [s] ON [t0].[EmployeeId] = [s].[EmployeeId]
ORDER BY [d].[Name], [d].[DepartmentId], ...

-- ===== With AsSplitQuery: three simpler queries =====
-- 1) departments + head
SELECT [d].*, [e].* FROM [Departments] AS [d]
LEFT JOIN [Employees] AS [e] ON [d].[HeadEmployeeId] = [e].[EmployeeId]
ORDER BY [d].[Name], [d].[DepartmentId], [e].[EmployeeId];
-- 2) top 3 active employees per department (joined back to departments for ordering)
-- 3) projects of those employees

// ===== Global default (Program.cs) =====
builder.Services.AddDbContext<EmployeeDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("EmployeeDb"),
        sql => sql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));
// then use .AsSingleQuery() on queries that should stay single`,
      result: `Both versions show the same dashboard. For a department with 3 employees who each work on 4 projects, the single query returns 3 x 4 = 12 rows for that department (department columns repeated 12 times); the split version returns 1 + 3 + 12 smaller rows across 3 queries. EF Core also logs a warning for multiple collection Includes without a splitting behavior: "Compiling a query which loads related collections for more than one collection navigation ... QuerySplittingBehavior".`,
      explanation: `The filtered Include is translated with ROW_NUMBER() OVER (PARTITION BY DepartmentId ...) so only the top 3 per department are loaded. Every additional collection Include in a single query multiplies the number of rows (cartesian explosion) and repeats parent columns, which wastes network and memory. AsSplitQuery sends one query per collection and stitches the results together. Trade-off: split queries need several round trips and, without a transaction, data could change between them. Use single queries for reference navigations and small collections, split queries for several or large collections.`,
    },
    {
      title: `AsNoTracking, AsNoTrackingWithIdentityResolution and common mistakes`,
      scenario: `A developer loads an employee with AsNoTracking, changes the salary and wonders why nothing is saved. Another sees the same Department object duplicated. Explore tracking behaviors with the console app.`,
      steps: [
        `Open the EmployeeNavigation console app (data from Example 2)`,
        `Add the code below to the end of Program.cs`,
        `Press Ctrl+F5 and compare the printed values`,
      ],
      code: `using (var db = new EmployeeContext())
{
    // Mistake: modifying a no-tracking entity
    var meena = db.Employees.AsNoTracking().First(e => e.EmpCode == "E005");
    meena.Salary = 65000m;
    Console.WriteLine($"Saved rows (no tracking): {db.SaveChanges()}");          // 0

    // Fix A: query with tracking
    var tracked = db.Employees.First(e => e.EmpCode == "E005");
    tracked.Salary = 65000m;
    Console.WriteLine($"Saved rows (tracking): {db.SaveChanges()}");             // 1

    // Fix B: attach the detached object and mark only Salary modified
    // db.Attach(meena); db.Entry(meena).Property(e => e.Salary).IsModified = true; db.SaveChanges();

    // Identity resolution
    var a = db.Employees.AsNoTracking().Include(e => e.Department).Where(e => e.Department.Name == "IT").ToList();
    var b = db.Employees.AsNoTrackingWithIdentityResolution().Include(e => e.Department).Where(e => e.Department.Name == "IT").ToList();
    Console.WriteLine($"AsNoTracking: same Department object? {ReferenceEquals(a[0].Department, a[1].Department)}");
    Console.WriteLine($"WithIdentityResolution: same Department object? {ReferenceEquals(b[0].Department, b[1].Department)}");
}

// Context-wide default for read-heavy apps (Program.cs of a web app)
builder.Services.AddDbContext<EmployeeDbContext>(o =>
    o.UseSqlServer(cs).UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));
// then: var e = await _db.Employees.AsTracking().FirstAsync(x => x.EmployeeId == id);`,
      result: `Saved rows (no tracking): 0
Saved rows (tracking): 1
AsNoTracking: same Department object? False
WithIdentityResolution: same Department object? True`,
      explanation: `SaveChanges only writes what the change tracker knows about. A no-tracking entity is invisible to it, so the first save writes 0 rows; the tracked query detects the Salary change and writes 1 row (UPDATE ... SET [Salary] = @p0). With plain AsNoTracking, each row of the result creates its own Department object, so two IT employees get two different (but equal) Department instances. AsNoTrackingWithIdentityResolution keeps a temporary lookup during the query so shared parents are one object, without the cost of full tracking. Rule of thumb: AsNoTracking for read-only pages, tracking when you will update.`,
    },
  ],
  interview: [
    { q: `What is the difference between IQueryable<T> and IEnumerable<T> in EF Core?`, a: `IQueryable builds an expression tree that EF translates into SQL, so filters run in the database. IEnumerable runs LINQ in memory; if a DbSet is treated as IEnumerable, all rows are downloaded first and then filtered in C#.`, level: 'Medium' },
    { q: `What is deferred execution?`, a: `A LINQ query is not executed when it is defined but when it is enumerated (ToList, foreach, First, Count ...). Each enumeration executes it again - in EF Core that means a new SQL query.`, level: 'Easy' },
    { q: `What does Include do?`, a: `It eagerly loads a navigation property in the same query (JOIN for references, LEFT JOIN for collections), so related entities are available without extra round trips.`, level: 'Easy' },
    { q: `What is ThenInclude?`, a: `It continues eager loading from the navigation of the previous Include, e.g. Include(d => d.Employees).ThenInclude(e => e.Manager) loads departments, their employees and each employee's manager.`, level: 'Easy' },
    { q: `Compare eager, explicit and lazy loading.`, a: `Eager: related data loaded with the main query via Include. Explicit: loaded later on demand with Entry(x).Collection/Reference(...).Load(). Lazy: loaded automatically when the navigation is first accessed (proxies + virtual navigations). Eager is predictable; lazy is convenient but risks N+1 queries.`, level: 'Medium' },
    { q: `What is the N+1 problem and how do you fix it?`, a: `Loading N parents with 1 query and then triggering 1 extra query per parent to load children (often through lazy loading in a loop), giving N+1 round trips. Fix with Include, projection (Select) or batching related data in one query.`, level: 'Medium' },
    { q: `How do you enable lazy loading in EF Core?`, a: `Install Microsoft.EntityFrameworkCore.Proxies, call UseLazyLoadingProxies() on the options and make navigation properties virtual (or inject ILazyLoader into the entity). It is off by default.`, level: 'Medium' },
    { q: `What does AsNoTracking do and when should you use it?`, a: `The query results are not added to the change tracker: no snapshots, no identity resolution, less memory and faster. Use it for read-only data such as list pages, reports and GET APIs.`, level: 'Easy' },
    { q: `What is AsNoTrackingWithIdentityResolution?`, a: `A no-tracking query that still ensures one instance per key within the result, so shared related entities (e.g. the same Department for many Employees) are not duplicated.`, level: 'Hard' },
    { q: `What is a filtered Include?`, a: `EF Core 5+ allows Where, OrderBy, Skip and Take inside Include for collections, e.g. Include(d => d.Employees.Where(e => e.IsActive).Take(3)), to load only some children.`, level: 'Medium' },
    { q: `What is cartesian explosion and how does AsSplitQuery help?`, a: `Including several collections in one SQL multiplies rows (parents x children1 x children2) and repeats data. AsSplitQuery loads each collection with a separate SQL statement, avoiding the multiplication at the cost of more round trips.`, level: 'Hard' },
    { q: `Is Include needed when you use Select projection with navigation properties?`, a: `No. Navigations used inside Select are translated to joins automatically, and Include is ignored when the query ends in a projection to a non-entity type.`, level: 'Medium' },
    { q: `What happens if part of a LINQ query cannot be translated to SQL?`, a: `Since EF Core 3.0 an InvalidOperationException ("could not be translated") is thrown, unless the untranslatable part is in the final Select. Rewrite the query or switch to client evaluation explicitly with AsEnumerable() after filtering.`, level: 'Hard' },
    { q: `Output-based: var q = db.Employees.Where(e => e.Salary > 1000); var a = q.Count(); var b = q.ToList(); How many SQL statements run?`, a: `Two: one SELECT COUNT(*) for Count() and one SELECT of the rows for ToList(). Defining q runs nothing.`, level: 'Medium' },
    { q: `Why is lazy loading discouraged in ASP.NET Core APIs?`, a: `It hides database calls (N+1), can cause many queries during JSON serialization, and fails once the DbContext is disposed at the end of the request. Explicit Include or projection to DTOs is predictable.`, level: 'Hard' },
  ],
  practice: [
    {
      task: `Fetch all employees of the HR department with their department name and location using Include, ordered by name. Write the SQL you expect.`,
      hint: `Include + Where on the navigation.`,
      solution: `var hr = await db.Employees.AsNoTracking()
    .Include(e => e.Department)
    .Where(e => e.Department.Name == "HR")
    .OrderBy(e => e.FullName)
    .ToListAsync();
-- SELECT [e].*, [d].* FROM [Employees] AS [e]
-- INNER JOIN [Departments] AS [d] ON [e].[DepartmentId] = [d].[DepartmentId]
-- WHERE [d].[Name] = N'HR' ORDER BY [e].[FullName]`,
    },
    {
      task: `Load all departments with their employees and each employee's manager in one query.`,
      hint: `Include then ThenInclude.`,
      solution: `var depts = await db.Departments
    .Include(d => d.Employees)
        .ThenInclude(e => e.Manager)
    .ToListAsync();`,
    },
    {
      task: `Department-wise report: department name, employee count and average salary, using GroupBy (no entities loaded).`,
      hint: `GroupBy on Department.Name with Select of aggregates.`,
      solution: `var report = await db.Employees
    .GroupBy(e => e.Department.Name)
    .Select(g => new { Dept = g.Key, Count = g.Count(), AvgSalary = g.Average(e => e.Salary) })
    .OrderBy(x => x.Dept)
    .ToListAsync();
-- SELECT [d].[Name] AS [Dept], COUNT(*) AS [Count], AVG([e].[Salary]) AS [AvgSalary]
-- FROM [Employees] AS [e] INNER JOIN [Departments] AS [d] ON ... GROUP BY [d].[Name] ORDER BY [d].[Name]`,
    },
    {
      task: `Rewrite this N+1 code so it uses one query: foreach (var d in db.Departments.ToList()) Console.WriteLine(d.Name + ": " + d.Employees.Count); (lazy loading on).`,
      hint: `Projection with Count inside Select.`,
      solution: `var rows = await db.Departments
    .Select(d => new { d.Name, Count = d.Employees.Count })
    .ToListAsync();
foreach (var r in rows) Console.WriteLine($"{r.Name}: {r.Count}");
-- one SELECT with a COUNT(*) subquery per department`,
    },
    {
      task: `Using explicit loading, load an employee by code, then load the department only if the employee is Active.`,
      hint: `Entry(emp).Reference(e => e.Department).LoadAsync().`,
      solution: `var emp = await db.Employees.SingleAsync(e => e.EmpCode == "E003");
if (emp.Status == EmployeeStatus.Active)
    await db.Entry(emp).Reference(e => e.Department).LoadAsync();
Console.WriteLine(emp.Department?.Name ?? "Department not loaded");`,
    },
    {
      task: `Build a search query with optional filters (name contains text, department id, minimum salary) using IQueryable so only the filters given are added to the SQL.`,
      hint: `Start from db.Employees.AsNoTracking() and add Where conditionally.`,
      solution: `IQueryable<Employee> q = db.Employees.AsNoTracking().Include(e => e.Department);
if (!string.IsNullOrWhiteSpace(name)) q = q.Where(e => e.FullName.Contains(name));
if (deptId is not null) q = q.Where(e => e.DepartmentId == deptId);
if (minSalary is not null) q = q.Where(e => e.Salary >= minSalary);
var result = await q.OrderBy(e => e.EmpCode).ToListAsync();`,
    },
  ],
  quiz: [
    { question: `When is an EF Core LINQ query executed?`, options: [`When Where() is called`, `When the DbContext is created`, `When it is enumerated, e.g. ToListAsync()`, `When OrderBy() is called`], answer: 2, explanation: `Deferred execution: SQL is generated and sent only on enumeration.` },
    { question: `Which method loads a navigation of a navigation?`, options: [`ThenInclude`, `Include only`, `Join`, `SelectMany`], answer: 0, explanation: `ThenInclude continues from the previously included navigation.` },
    { question: `Lazy loading with proxies requires navigation properties to be:`, options: [`static`, `sealed`, `readonly`, `virtual`], answer: 3, explanation: `Proxies override virtual navigations to load data on first access.` },
    { question: `Which query is best for a read-only list page?`, options: [`A tracked query with lazy loading`, `AsNoTracking or a Select projection`, `Load all tables with ToList then filter`, `Explicit loading in a loop`], answer: 1, explanation: `No-tracking queries and projections avoid tracking overhead and load only what is needed.` },
    { question: `What problem does AsSplitQuery solve?`, options: [`SQL injection`, `Concurrency conflicts`, `Cartesian explosion when including multiple collections`, `Missing migrations`], answer: 2, explanation: `Split queries load each collection separately so rows are not multiplied.` },
  ],
};
