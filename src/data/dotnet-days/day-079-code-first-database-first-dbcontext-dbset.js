export default {
  id: 'day-079-code-first-database-first-dbcontext-dbset',
  title: `Code First, Database First, DbContext and DbSet`,
  module: `Module 7: Entity Framework Core & Database Connectivity`,
  day: 79,
  level: `Intermediate`,
  duration: `2.5 hours`,
  summary: `Compare the two ways of working with EF Core: Code First (C# classes create the database) and Database First (an existing database generates the C# classes with Scaffold-DbContext). Build a Student entity, understand EF Core conventions, write a complete DbContext with DbSet properties, OnConfiguring vs constructor options, OnModelCreating and SaveChanges, and use the DbSet in an MVC controller.`,
  objectives: [
    `Explain Code First and Database First and choose the right one for a project`,
    `Create a Student entity and know the EF Core naming conventions for keys, nullability and table names`,
    `Write a DbContext with DbSet properties, constructor options and OnModelCreating`,
    `Reverse-engineer an existing SQL Server database with Scaffold-DbContext / dotnet ef dbcontext scaffold`,
    `Use DbSet methods (Add, Find, Remove, Where, ToListAsync) and SaveChangesAsync from a controller`,
  ],
  theory: [
    {
      heading: `Code First Approach`,
      content: `In Code First you write C# classes (entities) first. EF Core reads them, builds a model and creates or updates the database through migrations. The C# code is the "source of truth" and the database schema is generated from it.

Analogy: an architect draws the house plan (classes) and the builder (EF Core migrations) constructs the building (database) exactly from the plan. If you want an extra room, you change the plan and the builder adds it.`,
      points: [
        `Best for new projects where developers own the database`,
        `Schema changes are versioned in source control as migration files`,
        `Easy to recreate the database on any machine with Update-Database`,
        `Works together with conventions, Data Annotations and the Fluent API (Day 83)`,
      ],
    },
    {
      heading: `Database First Approach`,
      content: `In Database First the database already exists (often designed by a DBA or used by older applications). You point EF Core at it and it generates (scaffolds) entity classes and a DbContext. This is also called reverse engineering.

Analogy: you buy an existing house and an inspector measures every room to draw the plan for you.

EF Core has no EDMX designer like the old EF6. Instead it uses the Scaffold-DbContext command (PMC) or dotnet ef dbcontext scaffold (CLI). When the database changes you scaffold again with -Force. Because the generated classes are partial, put your own code in separate partial class files so it is not overwritten.`,
      syntax: `Scaffold-DbContext "Server=(localdb)\\MSSQLLocalDB;Database=CollegeDb;Trusted_Connection=True;TrustServerCertificate=True" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models -ContextDir Data -Context CollegeDbContext -Force

dotnet ef dbcontext scaffold "Name=ConnectionStrings:CollegeDb" Microsoft.EntityFrameworkCore.SqlServer --output-dir Models --context-dir Data --context CollegeDbContext --force`,
      points: [
        `-OutputDir / --output-dir: folder for entity classes`,
        `-ContextDir and -Context: folder and name of the DbContext`,
        `-Tables Students,Courses: scaffold only some tables`,
        `-DataAnnotations: use attributes instead of Fluent API where possible`,
        `-Force: overwrite files when re-scaffolding`,
        `"Name=ConnectionStrings:CollegeDb" reads the connection string from configuration so it is not hard-coded into the generated OnConfiguring`,
      ],
      tip: `Visual Studio users can also install the free "EF Core Power Tools" extension (Extensions > Manage Extensions) for a GUI to reverse engineer a database.`,
    },
    {
      heading: `Entities and EF Core Conventions`,
      content: `An entity is a plain C# class (POCO) that maps to a table. EF Core uses conventions, so most classes need no configuration at all.`,
      points: [
        `A property named Id or <ClassName>Id (StudentId) becomes the primary key`,
        `An int or long key becomes an IDENTITY column (auto-increment)`,
        `Table name = the DbSet property name (DbSet<Student> Students -> table Students)`,
        `With <Nullable>enable</Nullable>: string -> NOT NULL, string? -> NULL; int -> NOT NULL, int? -> NULL`,
        `string -> nvarchar(max) unless you set a max length; decimal -> decimal(18,2) with a warning (configure precision!); DateTime -> datetime2; bool -> bit; DateOnly -> date`,
        `A property of another entity type is a navigation property and creates a relationship (Day 82)`,
        `Properties without a setter, or marked [NotMapped], are not stored`,
      ],
    },
    {
      heading: `DbContext in Detail`,
      content: `DbContext is the bridge between your entities and the database. A typical context does four things: exposes DbSet properties, receives configuration (provider + connection string), configures the model in OnModelCreating, and saves changes with SaveChanges/SaveChangesAsync.

There are two ways to give the context its options:
1. Constructor with DbContextOptions<T> (used with AddDbContext in ASP.NET Core) - recommended.
2. Override OnConfiguring and call UseSqlServer there - handy for small console apps and tests.`,
      syntax: `public class SchoolDbContext : DbContext
{
    public SchoolDbContext(DbContextOptions<SchoolDbContext> options) : base(options) { }

    public DbSet<Student> Students => Set<Student>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Student>().Property(s => s.Name).HasMaxLength(100);
    }
}`,
      points: [
        `Database: DatabaseFacade for EnsureCreated, Migrate, CanConnect, BeginTransaction`,
        `ChangeTracker: inspect tracked entities and their states`,
        `SaveChanges(): sends all pending INSERT/UPDATE/DELETE in one transaction and returns the number of affected rows`,
        `Entry(entity): access state and original/current values of one entity`,
        `Dispose: handled by DI in ASP.NET Core; use "using var db = new ..." in console apps`,
      ],
    },
    {
      heading: `DbSet<T> in Detail`,
      content: `DbSet<T> represents a table and is the starting point for queries. It implements IQueryable<T>, so LINQ operators build SQL; the query runs only when you enumerate it (ToList, ToListAsync, First, Count, foreach).`,
      points: [
        `Add / AddRange / AddAsync: mark entities as Added -> INSERT`,
        `Find / FindAsync(key): look in the change tracker first, then the database`,
        `Update / Attach: mark a detached entity as Modified / Unchanged`,
        `Remove / RemoveRange: mark entities as Deleted -> DELETE`,
        `Where, OrderBy, Select, Include ... : build a query (deferred execution)`,
        `ToListAsync, FirstOrDefaultAsync, AnyAsync, CountAsync: execute the query`,
        `ExecuteUpdateAsync / ExecuteDeleteAsync: bulk operations without loading entities (EF Core 7+)`,
      ],
      tip: `Writing "public DbSet<Student> Students => Set<Student>();" avoids the nullable warning you get with "{ get; set; }". Both styles work; "public DbSet<Student> Students { get; set; } = null!;" is also common.`,
    },
    {
      heading: `Code First vs Database First: how to choose`,
      content: `Most new ASP.NET Core projects use Code First. Database First is used when the database is shared with other systems, is controlled by a DBA, or already exists with many tables. You can also start Database First (scaffold once) and then continue Code First with migrations from that point on.`,
      points: [
        `New project, developers own schema -> Code First`,
        `Legacy / shared database, schema changes made in SSMS -> Database First (re-scaffold)`,
        `Code First: migrations in Git, repeatable deployments`,
        `Database First: no migrations; schema changes happen in SQL scripts first`,
      ],
    },
  ],
  examples: [
    {
      title: `Create the Student entity and SchoolDbContext (Code First)`,
      scenario: `In the StudentPortal MVC project from Day 78, design a proper Student entity with roll number, name, email, date of birth, course name, fees and active flag, then let EF Core create the table.`,
      steps: [
        `Open StudentPortal in Visual Studio 2022/2026`,
        `Replace Models/Student.cs with the new entity`,
        `Replace Data/SchoolDbContext.cs with the version below (Program.cs registration stays as on Day 78)`,
        `Tools > NuGet Package Manager > Package Manager Console > Default project: StudentPortal`,
        `Run: Add-Migration StudentEntity, then Update-Database`,
        `Open View > SQL Server Object Explorer > (localdb)\\MSSQLLocalDB > Databases > SchoolDb > Tables > dbo.Students > right-click > View Designer`,
      ],
      code: `// ===== Models/Student.cs =====
namespace StudentPortal.Models;

public class Student
{
    public int StudentId { get; set; }                  // <ClassName>Id -> primary key + IDENTITY
    public string RollNo { get; set; } = string.Empty;  // NOT NULL
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }                  // NULL allowed
    public DateOnly DateOfBirth { get; set; }           // date
    public string Course { get; set; } = string.Empty;
    public decimal Fees { get; set; }                   // decimal(10,2) configured below
    public bool IsActive { get; set; } = true;          // bit
}

// ===== Data/SchoolDbContext.cs =====
using Microsoft.EntityFrameworkCore;
using StudentPortal.Models;

namespace StudentPortal.Data;

public class SchoolDbContext : DbContext
{
    public SchoolDbContext(DbContextOptions<SchoolDbContext> options) : base(options) { }

    public DbSet<Student> Students => Set<Student>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Student>(e =>
        {
            e.Property(s => s.RollNo).HasMaxLength(20);
            e.HasIndex(s => s.RollNo).IsUnique();
            e.Property(s => s.FullName).HasMaxLength(100);
            e.Property(s => s.Email).HasMaxLength(150);
            e.Property(s => s.Course).HasMaxLength(50);
            e.Property(s => s.Fees).HasPrecision(10, 2);
            e.Property(s => s.IsActive).HasDefaultValue(true);
        });
    }
}

// ===== Program.cs (unchanged from Day 78) =====
builder.Services.AddDbContext<SchoolDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ===== Package Manager Console =====
PM> Add-Migration StudentEntity
PM> Update-Database

// ===== dotnet CLI =====
dotnet ef migrations add StudentEntity
dotnet ef database update

// ===== Generated SQL (Script-Migration) =====
CREATE TABLE [Students] (
    [StudentId] int NOT NULL IDENTITY,
    [RollNo] nvarchar(20) NOT NULL,
    [FullName] nvarchar(100) NOT NULL,
    [Email] nvarchar(150) NULL,
    [DateOfBirth] date NOT NULL,
    [Course] nvarchar(50) NOT NULL,
    [Fees] decimal(10,2) NOT NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK_Students] PRIMARY KEY ([StudentId])
);
CREATE UNIQUE INDEX [IX_Students_RollNo] ON [Students] ([RollNo]);`,
      result: `Update-Database prints "Applying migration '..._StudentEntity'. Done." The Students table in SchoolDb now has 8 columns, StudentId as IDENTITY primary key and a unique index IX_Students_RollNo.

(If you created the Day 78 Students table already, EF generates ALTER/RENAME statements instead; for a clean start run Drop-Database, delete the Migrations folder and add one migration.)`,
      explanation: `StudentId is the key because it matches <ClassName>Id. Nullable reference types decide NULL / NOT NULL. HasMaxLength turns nvarchar(max) into nvarchar(n), HasPrecision fixes the decimal warning and HasIndex(...).IsUnique() guarantees roll numbers are unique. The table is named Students because of the DbSet property name.`,
    },
    {
      title: `DbContext with OnConfiguring in a Console App (Code First without ASP.NET)`,
      scenario: `Before using EF in MVC, practise DbContext and DbSet in a small console program that inserts and reads students.`,
      steps: [
        `File > New > Project > Console App > name StudentConsoleEf > .NET 10.0 (or 8.0) > Create`,
        `Install Microsoft.EntityFrameworkCore.SqlServer and Microsoft.EntityFrameworkCore.Tools via Manage NuGet Packages`,
        `Replace Program.cs with the code (entity and context are in the same file for simplicity)`,
        `PMC: Add-Migration Init, then Update-Database (database StudentConsoleDb is created)`,
        `Press Ctrl+F5`,
      ],
      code: `// ===== Program.cs =====
using Microsoft.EntityFrameworkCore;

using var db = new SchoolContext();

if (!db.Students.Any())
{
    db.Students.AddRange(
        new Student { Name = "Asha", Marks = 88 },
        new Student { Name = "Ravi", Marks = 54 },
        new Student { Name = "Meena", Marks = 72 });
    int saved = db.SaveChanges();          // 3 INSERTs in one transaction
    Console.WriteLine($"Saved {saved} students");
}

var passed = db.Students
    .Where(s => s.Marks >= 60)
    .OrderBy(s => s.Name)
    .ToList();

foreach (var s in passed)
    Console.WriteLine($"{s.Id}: {s.Name} - {s.Marks}");

Student? first = db.Students.Find(1);      // by primary key
Console.WriteLine($"Find(1) -> {first?.Name}");

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
}

public class SchoolContext : DbContext
{
    public DbSet<Student> Students => Set<Student>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer(
            "Server=(localdb)\\\\MSSQLLocalDB;Database=StudentConsoleDb;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      result: `Saved 3 students
1: Asha - 88
3: Meena - 72
Find(1) -> Asha

(Second run: the "Saved 3 students" line is skipped because Any() returns true.)`,
      explanation: `With no DI container, the context configures itself in OnConfiguring. AddRange marks three objects as Added; SaveChanges sends the INSERTs and fills the generated Id values (1, 2, 3) back into the objects. Ravi (54) is filtered out by Where. Find(1) returns the already-tracked Asha object without a new query. This program needs SQL Server LocalDB, so run it in Visual Studio, not in the browser runner.`,
    },
    {
      title: `Database First: scaffold an existing CollegeDb`,
      scenario: `The college DBA has already created CollegeDb with Departments and Students tables in SSMS. Generate the entity classes and DbContext instead of writing them by hand.`,
      steps: [
        `Open SSMS, connect to (localdb)\\MSSQLLocalDB, click New Query and run the SQL script below`,
        `In Visual Studio create (or open) an ASP.NET Core MVC project CollegePortal and install Microsoft.EntityFrameworkCore.SqlServer, .Tools and .Design`,
        `Add "CollegeDb" to ConnectionStrings in appsettings.json`,
        `Open Package Manager Console and run the Scaffold-DbContext command`,
        `Look at the new Models/Department.cs, Models/Student.cs and Data/CollegeDbContext.cs`,
        `Register CollegeDbContext in Program.cs and build with Ctrl+Shift+B`,
      ],
      code: `-- ===== 1) Existing database (run in SSMS) =====
CREATE DATABASE CollegeDb;
GO
USE CollegeDb;
GO
CREATE TABLE Departments (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NULL,
    DepartmentId INT NOT NULL FOREIGN KEY REFERENCES Departments(DepartmentId)
);
INSERT INTO Departments (Name) VALUES ('Computer Science'), ('Commerce');
INSERT INTO Students (FullName, Email, DepartmentId)
VALUES ('Asha Patil', 'asha@college.in', 1), ('Ravi Kumar', NULL, 2);

// ===== 2) appsettings.json =====
"ConnectionStrings": {
  "CollegeDb": "Server=(localdb)\\\\MSSQLLocalDB;Database=CollegeDb;Trusted_Connection=True;TrustServerCertificate=True"
}

# ===== 3) Package Manager Console =====
PM> Scaffold-DbContext "Name=ConnectionStrings:CollegeDb" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models -ContextDir Data -Context CollegeDbContext

# dotnet CLI equivalent
dotnet ef dbcontext scaffold "Name=ConnectionStrings:CollegeDb" Microsoft.EntityFrameworkCore.SqlServer --output-dir Models --context-dir Data --context CollegeDbContext

// ===== 4) Generated Models/Department.cs =====
namespace CollegePortal.Models;

public partial class Department
{
    public int DepartmentId { get; set; }
    public string Name { get; set; } = null!;
    public virtual ICollection<Student> Students { get; set; } = new List<Student>();
}

// ===== Generated Models/Student.cs =====
public partial class Student
{
    public int StudentId { get; set; }
    public string FullName { get; set; } = null!;
    public string? Email { get; set; }
    public int DepartmentId { get; set; }
    public virtual Department Department { get; set; } = null!;
}

// ===== Generated Data/CollegeDbContext.cs (shortened) =====
public partial class CollegeDbContext : DbContext
{
    public CollegeDbContext(DbContextOptions<CollegeDbContext> options) : base(options) { }

    public virtual DbSet<Department> Departments { get; set; }
    public virtual DbSet<Student> Students { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:CollegeDb");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.DepartmentId).HasName("PK__Departme__B2079BED...");
            entity.Property(e => e.Name).HasMaxLength(50);
        });
        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.StudentId).HasName("PK__Students__32C52B99...");
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.HasOne(d => d.Department).WithMany(p => p.Students)
                  .HasForeignKey(d => d.DepartmentId)
                  .OnDelete(DeleteBehavior.ClientSetNull)
                  .HasConstraintName("FK__Students__Depart__...");
        });
        OnModelCreatingPartial(modelBuilder);
    }
    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

// ===== 5) Program.cs =====
builder.Services.AddDbContext<CollegeDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("CollegeDb")));`,
      result: `Build succeeded. The Models folder contains Department.cs and Student.cs, the Data folder contains CollegeDbContext.cs. No migration is created, because the database already exists. (Constraint names such as PK__Departme__... are random names chosen by SQL Server and will differ on your machine.)`,
      explanation: `Scaffold-DbContext reads the schema (tables, columns, keys, foreign keys, indexes) and writes matching C# code. The foreign key DepartmentId became both a scalar property and a navigation property (Department) plus a collection on the other side (Students). Using "Name=ConnectionStrings:CollegeDb" avoids hard-coding the connection string. Put custom code in another partial class file, because re-running the command with -Force overwrites the generated files.`,
    },
    {
      title: `Use the DbSet in an MVC controller and view`,
      scenario: `Show all active students on /Students using the SchoolDbContext from Example 1.`,
      steps: [
        `Right-click Controllers > Add > Controller > MVC Controller - Empty > name StudentsController`,
        `Paste the controller code (the DbContext is injected through the constructor)`,
        `Right-click inside Index() > Add View > Razor View - Empty > name Index.cshtml (it goes into Views/Students)`,
        `Insert a few students in SSMS or SQL Server Object Explorer (right-click dbo.Students > View Data)`,
        `Press Ctrl+F5 and browse to /Students`,
      ],
      code: `// ===== Controllers/StudentsController.cs =====
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentPortal.Data;

namespace StudentPortal.Controllers;

public class StudentsController : Controller
{
    private readonly SchoolDbContext _db;
    public StudentsController(SchoolDbContext db) => _db = db;

    // GET /Students
    public async Task<IActionResult> Index()
    {
        var students = await _db.Students
            .Where(s => s.IsActive)
            .OrderBy(s => s.RollNo)
            .ToListAsync();
        return View(students);
    }
}

@* ===== Views/Students/Index.cshtml ===== *@
@model IEnumerable<StudentPortal.Models.Student>
@{
    ViewData["Title"] = "Students";
}
<h2>Active Students</h2>
<table class="table table-striped">
    <thead>
        <tr><th>Roll No</th><th>Name</th><th>Course</th><th>Fees</th></tr>
    </thead>
    <tbody>
    @foreach (var s in Model)
    {
        <tr>
            <td>@s.RollNo</td>
            <td>@s.FullName</td>
            <td>@s.Course</td>
            <td>@s.Fees.ToString("0.00")</td>
        </tr>
    }
    </tbody>
</table>

-- ===== Sample data (SSMS, New Query on SchoolDb) =====
INSERT INTO Students (RollNo, FullName, Email, DateOfBirth, Course, Fees, IsActive)
VALUES ('R001', 'Asha Patil', 'asha@mail.com', '2004-05-10', 'BCA', 45000.00, 1),
       ('R002', 'Ravi Kumar', NULL, '2003-11-02', 'BSc', 38000.00, 1),
       ('R003', 'John Dsouza', NULL, '2004-01-20', 'BCom', 30000.00, 0);

-- ===== SQL EF Core sends for Index() =====
SELECT [s].[StudentId], [s].[Course], [s].[DateOfBirth], [s].[Email], [s].[Fees],
       [s].[FullName], [s].[IsActive], [s].[RollNo]
FROM [Students] AS [s]
WHERE [s].[IsActive] = CAST(1 AS bit)
ORDER BY [s].[RollNo]`,
      result: `Active Students
Roll No | Name       | Course | Fees
R001    | Asha Patil | BCA    | 45000.00
R002    | Ravi Kumar | BSc    | 38000.00

(John Dsouza is not shown because IsActive = 0.)`,
      explanation: `The controller never creates the DbContext; DI injects a scoped instance. The LINQ query on the DbSet is translated to one SELECT with WHERE and ORDER BY and runs only at ToListAsync(). The strongly typed view receives List<Student> as its model. Note that Fees uses ToString("0.00") to avoid culture-dependent currency output.`,
    },
  ],
  interview: [
    { q: `What is the Code First approach?`, a: `You write entity classes and a DbContext first; EF Core builds the model and creates/updates the database through migrations. The C# code is the source of truth.`, level: 'Easy' },
    { q: `What is the Database First approach in EF Core?`, a: `The database already exists and you reverse-engineer it with Scaffold-DbContext (PMC) or dotnet ef dbcontext scaffold, which generates entity classes and a DbContext.`, level: 'Easy' },
    { q: `Does EF Core support EDMX files?`, a: `No. EDMX designer files belonged to EF6. EF Core uses code-based models only; Database First is done by scaffolding C# code.`, level: 'Medium' },
    { q: `What is DbSet<T>?`, a: `A collection-like object representing a table of entity T. It implements IQueryable<T> for LINQ queries and has Add, Find, Update, Remove, and bulk ExecuteUpdate/ExecuteDelete methods.`, level: 'Easy' },
    { q: `How does EF Core decide the primary key?`, a: `By convention a property named Id or <ClassName>Id. Otherwise use [Key] or modelBuilder.Entity<T>().HasKey(...). Composite keys need HasKey(x => new { x.A, x.B }) or [PrimaryKey] (EF Core 7+).`, level: 'Easy' },
    { q: `Difference between OnConfiguring and constructor-injected DbContextOptions?`, a: `OnConfiguring configures the provider inside the class (simple console apps, tests). Constructor options come from AddDbContext in Program.cs, keeping configuration and connection strings outside the class - recommended for ASP.NET Core.`, level: 'Medium' },
    { q: `What does SaveChanges return?`, a: `The number of rows affected (state entries written). All changes are sent in a single transaction by default.`, level: 'Medium' },
    { q: `Difference between Find() and FirstOrDefault()?`, a: `Find looks up by primary key and first checks the change tracker, so it may not hit the database. FirstOrDefault accepts any condition and always sends a query.`, level: 'Medium' },
    { q: `How do you re-scaffold after the database changes without losing custom code?`, a: `Run the scaffold command again with -Force (--force). Keep custom code in separate partial class files and use OnModelCreatingPartial for extra configuration, because generated files are overwritten.`, level: 'Hard' },
    { q: `Why use "Name=ConnectionStrings:X" in the scaffold command?`, a: `So the generated OnConfiguring reads the connection string from configuration instead of hard-coding the server and credentials into source code.`, level: 'Medium' },
    { q: `What column type does a C# string map to by default on SQL Server?`, a: `nvarchar(max), NOT NULL if the property is non-nullable with nullable reference types enabled. Set HasMaxLength / [MaxLength] / [StringLength] for nvarchar(n).`, level: 'Easy' },
    { q: `Can you mix Database First and Code First?`, a: `Yes. A common approach is to scaffold an existing database once, then add an initial (empty or baseline) migration and continue evolving the schema with migrations.`, level: 'Hard' },
  ],
  practice: [
    {
      task: `Create a Course entity (CourseId, Title max 80, Duration in months, Fee decimal(10,2)) and add DbSet<Course> to SchoolDbContext. Create and apply a migration AddCourse.`,
      hint: `Configure length and precision in OnModelCreating.`,
      solution: `public class Course { public int CourseId { get; set; } public string Title { get; set; } = ""; public int Duration { get; set; } public decimal Fee { get; set; } }
// SchoolDbContext
public DbSet<Course> Courses => Set<Course>();
modelBuilder.Entity<Course>(e => { e.Property(c => c.Title).HasMaxLength(80); e.Property(c => c.Fee).HasPrecision(10, 2); });
// PMC: Add-Migration AddCourse ; Update-Database   (CLI: dotnet ef migrations add AddCourse ; dotnet ef database update)`,
    },
    {
      task: `Scaffold only the Students table of CollegeDb into a folder named Entities using Data Annotations.`,
      hint: `Use -Tables and -DataAnnotations.`,
      solution: `Scaffold-DbContext "Name=ConnectionStrings:CollegeDb" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Entities -Tables Students -DataAnnotations -Context CollegeDbContext -Force`,
    },
    {
      task: `In the console app, print the total number of students and the average marks using the DbSet.`,
      hint: `Count() and Average(s => s.Marks).`,
      solution: `Console.WriteLine($"Total: {db.Students.Count()}");
Console.WriteLine($"Average: {db.Students.Average(s => s.Marks):0.00}");`,
    },
    {
      task: `Add a Details(int id) action in StudentsController that uses FindAsync and returns NotFound() when the student does not exist.`,
      hint: `FindAsync returns null if the key is missing.`,
      solution: `public async Task<IActionResult> Details(int id) { var s = await _db.Students.FindAsync(id); if (s == null) return NotFound(); return View(s); }`,
    },
    {
      task: `Write in your own words three situations where Database First is better than Code First.`,
      hint: `Think of DBAs, legacy systems and shared databases.`,
      solution: `1) A large legacy database already used by other applications. 2) A DBA team controls schema changes through SQL scripts. 3) Reporting or integration projects that only read an existing database.`,
    },
  ],
  quiz: [
    { question: `Which command reverse-engineers an existing database in the Package Manager Console?`, options: [`Add-Migration`, `Update-Database`, `Scaffold-DbContext`, `Script-Migration`], answer: 2, explanation: `Scaffold-DbContext generates entities and a DbContext from an existing database.` },
    { question: `With the convention rules, which property becomes the primary key of class Student?`, options: [`StudentId`, `StudentKey`, `RollNo`, `Key`], answer: 0, explanation: `Id or <ClassName>Id is the conventional key.` },
    { question: `What table name does EF Core use for "public DbSet<Student> Students"?`, options: [`Student`, `tblStudent`, `dbo.StudentEntity`, `Students`], answer: 3, explanation: `By default the table name comes from the DbSet property name.` },
    { question: `When does a LINQ query on a DbSet actually run against SQL Server?`, options: [`When Where() is called`, `When it is enumerated, e.g. ToListAsync()`, `When the DbContext is created`, `When the controller is constructed`], answer: 1, explanation: `IQueryable queries use deferred execution.` },
    { question: `Which method should hold the provider configuration in a simple console app without DI?`, options: [`OnModelCreating`, `SaveChanges`, `OnConfiguring`, `Dispose`], answer: 2, explanation: `OnConfiguring receives a DbContextOptionsBuilder where you call UseSqlServer.` },
  ],
};
