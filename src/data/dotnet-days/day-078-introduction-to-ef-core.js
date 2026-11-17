export default {
  id: 'day-078-introduction-to-ef-core',
  title: `Introduction to Entity Framework Core, ORM and EF Core Architecture`,
  module: `Module 7: Entity Framework Core & Database Connectivity`,
  day: 78,
  level: `Intermediate`,
  duration: `2.5 hours`,
  summary: `Learn what an ORM is, why Entity Framework Core replaces most hand-written ADO.NET code, how EF Core is built (DbContext, DbSet, model, change tracker, database provider), and connect an ASP.NET Core MVC application to SQL Server step by step: NuGet packages, connection string, DbContext, Program.cs registration and the first migration.`,
  objectives: [
    `Explain ORM and the object-relational mismatch with a real-world analogy`,
    `Describe the EF Core architecture: DbContext, DbSet, model, change tracker, LINQ provider, database provider`,
    `Install the correct EF Core NuGet packages for SQL Server in Visual Studio and with the dotnet CLI`,
    `Write a SQL Server connection string in appsettings.json and register a DbContext in Program.cs`,
    `Create the database with Add-Migration / Update-Database and see the SQL that EF Core generates`,
  ],
  theory: [
    {
      heading: `What is an ORM?`,
      content: `A database stores data in tables, rows and columns. C# works with classes, objects and properties. Converting between these two worlds by hand (open connection, write SQL text, read every column from a SqlDataReader, copy it into an object) is repetitive and error prone. This gap is called the object-relational mismatch.

An ORM (Object-Relational Mapper) is a library that does this conversion for you. You work with C# objects and LINQ, the ORM generates SQL, sends it to the database and turns the rows back into objects.

Real-world analogy: think of a translator at an international meeting. You speak C# ("give me all students with marks above 60"), the translator speaks SQL to SQL Server ("SELECT ... WHERE Marks > 60"), and translates the answer back into C# objects. You never have to learn every word of the other language for daily work, but knowing a little SQL still helps you check that the translation is good.`,
      points: [
        `Table  <->  C# class (entity)`,
        `Row    <->  object (instance of the entity)`,
        `Column <->  property`,
        `Foreign key  <->  navigation property (reference or collection)`,
        `SQL query  <->  LINQ query`,
      ],
    },
    {
      heading: `ADO.NET vs Entity Framework Core`,
      content: `ADO.NET (SqlConnection, SqlCommand, SqlDataReader) is the low-level data access API in .NET. It is fast and gives full control, but you write every SQL statement and every mapping line yourself. EF Core is built on top of ADO.NET: it still uses a SqlConnection internally, but generates the SQL and the mapping code.

Entity Framework Core is Microsoft's modern, open-source, cross-platform ORM. It replaced the old Entity Framework 6 (which ran only on .NET Framework). EF Core versions follow .NET: EF Core 8 for .NET 8 (LTS), EF Core 9 for .NET 9, EF Core 10 for .NET 10 (LTS).`,
      points: [
        `ADO.NET: manual SQL, manual mapping, manual parameters, best for very special performance cases`,
        `EF Core: LINQ queries, automatic mapping, change tracking, migrations, relationships, async support`,
        `Dapper: a "micro-ORM" in between (you write SQL, it maps rows to objects)`,
        `EF Core still lets you run raw SQL (FromSql, ExecuteSql) when you need it`,
        `EF Core always uses parameters, which protects you from SQL injection`,
      ],
      tip: `Use EF Core for 90 percent of your application. Drop to raw SQL or Dapper only for a few reports or bulk operations that really need it.`,
    },
    {
      heading: `EF Core Architecture`,
      content: `When your code runs a LINQ query, it travels through several layers:

Your code (controller / service)
   -> DbContext (unit of work, holds DbSet properties, change tracker)
   -> Model (metadata built from your classes + conventions + annotations + Fluent API)
   -> LINQ query pipeline (translates the expression tree into SQL)
   -> Database provider (Microsoft.EntityFrameworkCore.SqlServer knows T-SQL)
   -> ADO.NET (SqlConnection, SqlCommand from Microsoft.Data.SqlClient)
   -> SQL Server

Results come back as rows, the materializer creates entity objects, and the change tracker remembers their original values so that SaveChanges() can later produce INSERT, UPDATE and DELETE statements.`,
      points: [
        `DbContext: a session with the database; you create one per request (Scoped)`,
        `DbSet<T>: represents a table; you query it with LINQ and add/remove entities`,
        `Model: EF's internal picture of tables, columns, keys and relationships`,
        `Change Tracker: watches loaded entities (Added, Modified, Deleted, Unchanged, Detached)`,
        `Database Provider: SqlServer, Sqlite, Npgsql (PostgreSQL), Pomelo (MySQL), InMemory, Cosmos`,
        `Migrations: C# files that describe schema changes and create/update the database`,
      ],
    },
    {
      heading: `NuGet Packages You Need`,
      content: `EF Core is split into several NuGet packages. For SQL Server in an ASP.NET Core app you normally install three. Choose the package version that matches your target framework: 10.0.x for net10.0, 9.0.x for net9.0 and 8.0.x for net8.0 (a newer major version will refuse to install into an older framework).`,
      syntax: `# Package Manager Console (Tools > NuGet Package Manager > Package Manager Console)
Install-Package Microsoft.EntityFrameworkCore.SqlServer
Install-Package Microsoft.EntityFrameworkCore.Tools
Install-Package Microsoft.EntityFrameworkCore.Design

# dotnet CLI (in the folder that contains the .csproj)
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet tool install --global dotnet-ef        # once per machine

# For a .NET 8 project pin the major version
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.*`,
      points: [
        `Microsoft.EntityFrameworkCore.SqlServer: the SQL Server provider (brings in EF Core itself)`,
        `Microsoft.EntityFrameworkCore.Tools: Package Manager Console commands (Add-Migration, Update-Database)`,
        `Microsoft.EntityFrameworkCore.Design: design-time services used by both the PMC and dotnet ef`,
        `dotnet-ef: the global CLI tool for VS Code / terminal users (dotnet ef migrations add ...)`,
      ],
    },
    {
      heading: `Connection Strings`,
      content: `A connection string tells the provider which server, which database and how to log in. Keep it in appsettings.json under "ConnectionStrings" and read it with builder.Configuration.GetConnectionString("DefaultConnection"). Never hard-code passwords in C# files; for SQL authentication use User Secrets in development and environment variables or Azure Key Vault in production.`,
      syntax: `LocalDB (installed with Visual Studio):
Server=(localdb)\\MSSQLLocalDB;Database=SchoolDb;Trusted_Connection=True;MultipleActiveResultSets=true

SQL Server Express (Windows login):
Server=.\\SQLEXPRESS;Database=SchoolDb;Trusted_Connection=True;TrustServerCertificate=True

SQL Server / Docker (SQL login):
Server=localhost,1433;Database=SchoolDb;User Id=sa;Password=Your_Strong_Pass1;TrustServerCertificate=True

Note: inside appsettings.json every backslash must be doubled:  "(localdb)\\\\MSSQLLocalDB"`,
      points: [
        `Server / Data Source: machine name and instance (. means this computer)`,
        `Database / Initial Catalog: database name (created by migrations if missing)`,
        `Trusted_Connection=True / Integrated Security=True: use your Windows account`,
        `User Id + Password: SQL Server authentication`,
        `TrustServerCertificate=True: needed for local servers with self-signed certificates (Microsoft.Data.SqlClient encrypts by default)`,
        `MultipleActiveResultSets=true: allows more than one open reader on a connection`,
      ],
      tip: `Error "A network-related or instance-specific error" means the Server part is wrong or the SQL Server service is not running. Check it in SSMS first: if SSMS cannot connect with the same server name, EF Core cannot either.`,
    },
    {
      heading: `Registering the DbContext with Dependency Injection`,
      content: `In ASP.NET Core you never "new" the DbContext in a controller. You register it once in Program.cs with AddDbContext. It is registered as Scoped: one instance per HTTP request, disposed automatically at the end of the request. Controllers and services receive it through constructor injection (Day 72).`,
      syntax: `var cs = builder.Configuration.GetConnectionString("DefaultConnection")
         ?? throw new InvalidOperationException("Connection string not found.");
builder.Services.AddDbContext<SchoolDbContext>(options => options.UseSqlServer(cs));`,
      points: [
        `AddDbContext = Scoped lifetime (one per request)`,
        `AddDbContextPool = reuses DbContext instances for better performance (Day 85)`,
        `The DbContext class needs a constructor that accepts DbContextOptions<T>`,
        `Do not register DbContext as Singleton: it is not thread-safe`,
      ],
    },
  ],
  examples: [
    {
      title: `ADO.NET vs EF Core: the same query written two ways`,
      scenario: `The college already has a Students table. Display all students with Marks above 60. Compare the amount of code needed with plain ADO.NET and with EF Core.`,
      steps: [
        `Read the ADO.NET version first: notice the connection, command, parameter, reader and manual mapping`,
        `Read the EF Core version: one LINQ query does the same job`,
        `Notice that both use parameters (@minMarks / @__minMarks_0), so both are safe from SQL injection`,
        `You will run the EF Core version yourself in Example 2 after setting up the project`,
      ],
      code: `// ---------- 1) ADO.NET (package Microsoft.Data.SqlClient) ----------
using Microsoft.Data.SqlClient;

var students = new List<Student>();
string cs = "Server=(localdb)\\\\MSSQLLocalDB;Database=SchoolDb;Trusted_Connection=True";
using (var con = new SqlConnection(cs))
{
    con.Open();
    using var cmd = new SqlCommand(
        "SELECT Id, Name, Marks FROM Students WHERE Marks > @minMarks ORDER BY Name", con);
    cmd.Parameters.AddWithValue("@minMarks", 60);
    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        students.Add(new Student
        {
            Id = reader.GetInt32(0),
            Name = reader.GetString(1),
            Marks = reader.GetInt32(2)
        });
    }
}

// ---------- 2) EF Core ----------
int minMarks = 60;
var students2 = await db.Students
    .Where(s => s.Marks > minMarks)
    .OrderBy(s => s.Name)
    .ToListAsync();

// ---------- SQL generated by EF Core (seen in the Output window) ----------
// SELECT [s].[Id], [s].[Email], [s].[Marks], [s].[Name]
// FROM [Students] AS [s]
// WHERE [s].[Marks] > @__minMarks_0
// ORDER BY [s].[Name]`,
      result: `Both versions return the same List<Student>. The ADO.NET version needs about 20 lines of plumbing; the EF Core version needs 4 lines and EF writes the parameterised SELECT for you.`,
      explanation: `Note the string literal "Server=(localdb)\\\\MSSQLLocalDB" in C#: inside a normal C# string a backslash must be escaped, just like in JSON. EF Core internally does exactly what the ADO.NET code does (opens a SqlConnection, executes a parameterised command, reads rows), but generates the code from your LINQ expression and your model.`,
    },
    {
      title: `Connect an ASP.NET Core MVC app to SQL Server (complete setup)`,
      scenario: `Create a StudentPortal MVC application, connect it to a SQL Server LocalDB database called SchoolDb, create the Students table with a migration and confirm the connection works.`,
      steps: [
        `Visual Studio: File > New > Project > "ASP.NET Core Web App (Model-View-Controller)" > Next`,
        `Project name: StudentPortal > Next > Framework: .NET 10.0 (Long Term Support) (or .NET 8.0) > Authentication: None > Create`,
        `Right-click the project > Manage NuGet Packages > Browse > install Microsoft.EntityFrameworkCore.SqlServer, Microsoft.EntityFrameworkCore.Tools and Microsoft.EntityFrameworkCore.Design (same major version as your framework)`,
        `Right-click the Models folder > Add > Class > Student.cs and paste the entity`,
        `Right-click the project > Add > New Folder > Data, then add class SchoolDbContext.cs`,
        `Open appsettings.json and add the ConnectionStrings section`,
        `Open Program.cs and add the AddDbContext registration and the connection test`,
        `Tools > NuGet Package Manager > Package Manager Console, run: Add-Migration InitialCreate, then Update-Database`,
        `Press Ctrl+F5 and open /Home/DbCheck in the browser`,
        `View > SQL Server Object Explorer (or SSMS: connect to (localdb)\\MSSQLLocalDB) > Databases > SchoolDb > Tables to see dbo.Students`,
      ],
      code: `// ===== StudentPortal.csproj (packages added by NuGet) =====
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="10.0.0">
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.0">
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
  </ItemGroup>
</Project>

// ===== Models/Student.cs =====
namespace StudentPortal.Models;

public class Student
{
    public int Id { get; set; }                 // primary key by convention
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }          // nullable -> NULL column
    public int Marks { get; set; }
}

// ===== Data/SchoolDbContext.cs =====
using Microsoft.EntityFrameworkCore;
using StudentPortal.Models;

namespace StudentPortal.Data;

public class SchoolDbContext : DbContext
{
    public SchoolDbContext(DbContextOptions<SchoolDbContext> options) : base(options) { }

    public DbSet<Student> Students => Set<Student>();
}

// ===== appsettings.json =====
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\\\MSSQLLocalDB;Database=SchoolDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  },
  "AllowedHosts": "*"
}

// ===== Program.cs =====
using Microsoft.EntityFrameworkCore;
using StudentPortal.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

// 1) Read the connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

// 2) Register the DbContext (Scoped = one per request)
builder.Services.AddDbContext<SchoolDbContext>(options =>
    options.UseSqlServer(connectionString));

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();

// ===== Controllers/HomeController.cs (add this action) =====
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentPortal.Data;

namespace StudentPortal.Controllers;

public class HomeController : Controller
{
    private readonly SchoolDbContext _db;
    public HomeController(SchoolDbContext db) => _db = db;   // injected by DI

    public IActionResult Index() => View();

    // GET /Home/DbCheck
    public async Task<IActionResult> DbCheck()
    {
        bool ok = await _db.Database.CanConnectAsync();
        int count = ok ? await _db.Students.CountAsync() : 0;
        return Content($"Connected: {ok}, Students: {count}");
    }
}

// ===== Package Manager Console =====
PM> Add-Migration InitialCreate
Build started...
Build succeeded.
To undo this action, use Remove-Migration.
PM> Update-Database
Build started...
Build succeeded.
Applying migration '20261117093000_InitialCreate'.
Done.

// ===== dotnet CLI equivalent (terminal in the project folder) =====
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate
dotnet ef database update

// ===== SQL that Update-Database ran (shortened) =====
CREATE DATABASE [SchoolDb];
CREATE TABLE [__EFMigrationsHistory] (
    [MigrationId] nvarchar(150) NOT NULL,
    [ProductVersion] nvarchar(32) NOT NULL,
    CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
);
CREATE TABLE [Students] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NULL,
    [Marks] int NOT NULL,
    CONSTRAINT [PK_Students] PRIMARY KEY ([Id])
);
INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261117093000_InitialCreate', N'10.0.0');`,
      result: `Browser at https://localhost:7xxx/Home/DbCheck shows:
Connected: True, Students: 0

SQL Server Object Explorer shows database SchoolDb with tables dbo.__EFMigrationsHistory and dbo.Students.`,
      explanation: `The connection string lives in configuration, Program.cs registers SchoolDbContext with UseSqlServer, and DI gives each request its own context. Add-Migration compares your model with the last snapshot and writes a C# migration; Update-Database turns it into SQL, creates SchoolDb if it does not exist and records the migration in __EFMigrationsHistory. Because Name is a non-nullable string it became NOT NULL, while string? Email became NULL. The migration timestamp in the name will be your own date and time.`,
    },
    {
      title: `Keep connection strings safe: User Secrets and environments`,
      scenario: `Your team uses LocalDB on laptops but the test server uses SQL authentication with a password. The password must never be committed to Git.`,
      steps: [
        `Right-click the project > Manage User Secrets (Visual Studio creates secrets.json outside the project folder)`,
        `Paste the JSON with the real password into secrets.json`,
        `Or use the CLI: dotnet user-secrets init, then dotnet user-secrets set "ConnectionStrings:DefaultConnection" "..."`,
        `On the server set an environment variable ConnectionStrings__DefaultConnection (double underscore = colon)`,
        `Run the app: configuration sources are layered, so the later source wins`,
      ],
      code: `// ===== appsettings.json (committed - safe default for every developer) =====
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\\\MSSQLLocalDB;Database=SchoolDb;Trusted_Connection=True;TrustServerCertificate=True"
  }
}

// ===== secrets.json (Manage User Secrets - NOT in the project folder, NOT in Git) =====
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TESTSQL01;Database=SchoolDb;User Id=school_app;Password=S3cret!Pass;TrustServerCertificate=True"
  }
}

# ===== dotnet CLI =====
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=TESTSQL01;Database=SchoolDb;User Id=school_app;Password=S3cret!Pass;TrustServerCertificate=True"
dotnet user-secrets list

# ===== Production server (PowerShell) =====
$env:ConnectionStrings__DefaultConnection = "Server=PRODSQL;Database=SchoolDb;User Id=school_app;Password=***;Encrypt=True"

// ===== Program.cs - nothing changes! =====
var cs = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<SchoolDbContext>(o => o.UseSqlServer(cs));`,
      result: `On a developer laptop without secrets the app uses LocalDB. With user secrets set, the Development environment uses TESTSQL01. On the production server the environment variable overrides both. Program.cs is identical everywhere.`,
      explanation: `ASP.NET Core reads configuration in this order: appsettings.json, appsettings.{Environment}.json, user secrets (Development only), environment variables, command-line arguments. A later source overrides an earlier one with the same key. GetConnectionString("X") is just a shortcut for Configuration["ConnectionStrings:X"].`,
    },
    {
      title: `See the SQL that EF Core generates (logging)`,
      scenario: `You want to learn how LINQ becomes SQL and check that queries are efficient. Turn on EF Core command logging.`,
      steps: [
        `In appsettings.Development.json set "Microsoft.EntityFrameworkCore.Database.Command": "Information"`,
        `Optionally add LogTo and EnableSensitiveDataLogging in Program.cs (Development only)`,
        `Run with F5 and open View > Output, choose "Show output from: StudentPortal - ASP.NET Core Web Server" (or look at the console window)`,
        `Call /Home/DbCheck and read the logged SQL`,
      ],
      code: `// ===== Program.cs =====
builder.Services.AddDbContext<SchoolDbContext>(options =>
{
    options.UseSqlServer(connectionString);

    if (builder.Environment.IsDevelopment())
    {
        options.LogTo(Console.WriteLine, LogLevel.Information); // print SQL to console
        options.EnableSensitiveDataLogging();   // show parameter VALUES (dev only!)
        options.EnableDetailedErrors();
    }
});

// ===== Query in a controller =====
var toppers = await _db.Students
    .Where(s => s.Marks >= 80)
    .OrderByDescending(s => s.Marks)
    .Take(3)
    .ToListAsync();`,
      result: `info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (14ms) [Parameters=[@__p_0='3'], CommandType='Text', CommandTimeout='30']
      SELECT TOP(@__p_0) [s].[Id], [s].[Email], [s].[Marks], [s].[Name]
      FROM [Students] AS [s]
      WHERE [s].[Marks] >= 80
      ORDER BY [s].[Marks] DESC`,
      explanation: `Take(3) became TOP(@__p_0), Where became WHERE, OrderByDescending became ORDER BY ... DESC. The constant 80 is inlined while the Take value is a parameter. Execution time (14ms here) will differ on your machine. EnableSensitiveDataLogging shows parameter values, so never enable it in production because it may log personal data.`,
    },
  ],
  interview: [
    { q: `What is an ORM?`, a: `An Object-Relational Mapper maps database tables to classes, rows to objects and columns to properties. It generates SQL from code (LINQ in EF Core) and materializes the results into objects, removing repetitive ADO.NET code.`, level: 'Easy' },
    { q: `What is Entity Framework Core?`, a: `Microsoft's open-source, cross-platform ORM for .NET. It supports LINQ queries, change tracking, migrations, relationships and many providers (SQL Server, SQLite, PostgreSQL, MySQL, Cosmos DB).`, level: 'Easy' },
    { q: `Difference between EF6 and EF Core?`, a: `EF6 is the older ORM for .NET Framework (now in maintenance). EF Core is a rewrite: lighter, faster, cross-platform, works with modern .NET, has new features (ExecuteUpdate/Delete, compiled models, better LINQ translation) but dropped EDMX designer files.`, level: 'Medium' },
    { q: `Which NuGet packages are needed to use EF Core with SQL Server and migrations?`, a: `Microsoft.EntityFrameworkCore.SqlServer (provider), Microsoft.EntityFrameworkCore.Tools (Package Manager Console commands) and Microsoft.EntityFrameworkCore.Design (design-time support). For the CLI also install the dotnet-ef global tool.`, level: 'Easy' },
    { q: `What is DbContext?`, a: `The main EF Core class representing a session with the database. It exposes DbSet properties, tracks changes, builds the model and saves changes as a unit of work with SaveChanges/SaveChangesAsync.`, level: 'Easy' },
    { q: `What lifetime does AddDbContext use and why?`, a: `Scoped: one instance per HTTP request. DbContext is not thread-safe and holds tracked entities, so it should live for one unit of work and then be disposed.`, level: 'Medium' },
    { q: `Explain the EF Core architecture layers.`, a: `Application code -> DbContext/DbSet -> model metadata -> LINQ query pipeline and change tracker -> database provider -> ADO.NET (Microsoft.Data.SqlClient) -> database. Results are materialized back into tracked entities.`, level: 'Medium' },
    { q: `What does TrustServerCertificate=True do and why is it common locally?`, a: `Microsoft.Data.SqlClient encrypts connections by default and validates the server certificate. Local SQL Server uses a self-signed certificate, so validation fails; TrustServerCertificate=True skips validation. In production use a proper certificate instead.`, level: 'Medium' },
    { q: `How can you see the SQL generated by EF Core?`, a: `Enable logging for Microsoft.EntityFrameworkCore.Database.Command, use optionsBuilder.LogTo(Console.WriteLine), call query.ToQueryString(), or watch SQL Server Profiler / Extended Events.`, level: 'Medium' },
    { q: `Is EF Core vulnerable to SQL injection?`, a: `LINQ queries are always parameterised, so normal usage is safe. Raw SQL is safe with FromSql/ExecuteSql using interpolated parameters, but dangerous with FromSqlRaw/ExecuteSqlRaw if you concatenate user input into the string.`, level: 'Hard' },
    { q: `Where should production connection strings be stored?`, a: `Not in source code. Use environment variables, Azure App Service connection strings, Azure Key Vault or another secret store. Use User Secrets during development.`, level: 'Medium' },
    { q: `When would you still choose ADO.NET or Dapper over EF Core?`, a: `For hand-tuned reporting queries, bulk operations, legacy stored-procedure heavy systems or extreme hot paths where you want full control of the SQL and minimal overhead.`, level: 'Hard' },
  ],
  practice: [
    {
      task: `Create a new MVC project LibraryApp, install the three EF Core packages and connect it to a LocalDB database called LibraryDb with a Book entity (Id, Title, Author, Price).`,
      hint: `Use decimal for Price. Follow Example 2: entity, DbContext, appsettings.json, Program.cs, Add-Migration InitialCreate, Update-Database.`,
      solution: `public class Book { public int Id { get; set; } public string Title { get; set; } = ""; public string Author { get; set; } = ""; public decimal Price { get; set; } }
public class LibraryDbContext(DbContextOptions<LibraryDbContext> options) : DbContext(options) { public DbSet<Book> Books => Set<Book>(); }
// appsettings.json: "DefaultConnection": "Server=(localdb)\\\\MSSQLLocalDB;Database=LibraryDb;Trusted_Connection=True;TrustServerCertificate=True"
// Program.cs: builder.Services.AddDbContext<LibraryDbContext>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
// PMC: Add-Migration InitialCreate ; Update-Database`,
    },
    {
      task: `Add a /Home/DbCheck action that prints whether the database can be reached and how many books exist.`,
      hint: `Inject the DbContext and use Database.CanConnectAsync() and CountAsync().`,
      solution: `public async Task<IActionResult> DbCheck() { var ok = await _db.Database.CanConnectAsync(); var n = ok ? await _db.Books.CountAsync() : 0; return Content($"Connected: {ok}, Books: {n}"); }`,
    },
    {
      task: `Write three connection strings for SchoolDb: LocalDB, SQLEXPRESS with Windows login, and a Docker SQL Server using sa.`,
      hint: `Remember to double backslashes inside JSON.`,
      solution: `"Server=(localdb)\\\\MSSQLLocalDB;Database=SchoolDb;Trusted_Connection=True"
"Server=.\\\\SQLEXPRESS;Database=SchoolDb;Trusted_Connection=True;TrustServerCertificate=True"
"Server=localhost,1433;Database=SchoolDb;User Id=sa;Password=Your_Strong_Pass1;TrustServerCertificate=True"`,
    },
    {
      task: `Turn on SQL logging and write down the SQL generated for _db.Students.Where(s => s.Name.StartsWith("A")).ToListAsync().`,
      hint: `Set the Microsoft.EntityFrameworkCore.Database.Command log level to Information.`,
      solution: `SELECT [s].[Id], [s].[Email], [s].[Marks], [s].[Name] FROM [Students] AS [s] WHERE [s].[Name] LIKE N'A%'`,
    },
    {
      task: `Move the connection string of LibraryApp into User Secrets and prove the app still works.`,
      hint: `Right-click project > Manage User Secrets, or dotnet user-secrets set.`,
      solution: `dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\\\\MSSQLLocalDB;Database=LibraryDb;Trusted_Connection=True"
// Remove the value from appsettings.json, run Ctrl+F5, /Home/DbCheck still shows Connected: True`,
    },
  ],
  quiz: [
    { question: `What does ORM stand for?`, options: [`Online Resource Manager`, `Object-Relational Mapper`, `Object Request Model`, `Optimized Row Mapping`], answer: 1, explanation: `An Object-Relational Mapper maps objects to relational tables.` },
    { question: `Which package provides Add-Migration and Update-Database in the Package Manager Console?`, options: [`Microsoft.EntityFrameworkCore.SqlServer`, `Microsoft.Data.SqlClient`, `Microsoft.EntityFrameworkCore.Tools`, `Newtonsoft.Json`], answer: 2, explanation: `The Tools package adds the PowerShell commands to the PMC.` },
    { question: `Which method registers a DbContext with SQL Server in Program.cs?`, options: [`builder.Services.AddDbContext<T>(o => o.UseSqlServer(cs))`, `builder.Services.AddSingleton<T>()`, `app.UseSqlServer(cs)`, `builder.Services.AddSqlServer()`], answer: 0, explanation: `AddDbContext with UseSqlServer registers the context as Scoped with the SQL Server provider.` },
    { question: `In appsettings.json, how is the LocalDB server written?`, options: [`(localdb)/MSSQLLocalDB`, `localdb:MSSQLLocalDB`, `(localdb)MSSQLLocalDB`, `(localdb)\\\\MSSQLLocalDB`], answer: 3, explanation: `JSON needs the backslash escaped, so it is written as two backslashes.` },
    { question: `Which EF Core component remembers original values so SaveChanges can generate UPDATE statements?`, options: [`The database provider`, `The change tracker`, `The migration snapshot`, `Kestrel`], answer: 1, explanation: `The change tracker stores entity states and original values.` },
  ],
};
