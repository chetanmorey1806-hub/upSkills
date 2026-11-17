export default {
  id: 'day-083-fluent-api-data-annotations-navigation',
  title: `Fluent API, Data Annotations, Navigation Properties`,
  module: `Module 7: Entity Framework Core & Database Connectivity`,
  day: 83,
  level: `Intermediate`,
  duration: `3 hours`,
  summary: `Conventions give you a working database, but real projects need exact column sizes, unique codes, default values, check constraints, computed columns, enums stored as text and carefully named relationships. Today you configure an Employee database in two ways - Data Annotations (attributes on the class) and the Fluent API (code in OnModelCreating / IEntityTypeConfiguration) - compare the generated SQL, and master navigation properties: inverse navigations, self-referencing Manager/Subordinates, two relationships between the same tables with [InverseProperty], and shadow foreign keys.`,
  objectives: [
    `Explain the three configuration layers (conventions, Data Annotations, Fluent API) and their precedence`,
    `Use schema annotations: [Key], [Required], [MaxLength], [Column], [Table], [Index], [Precision], [NotMapped], [ForeignKey], [InverseProperty], [Timestamp]`,
    `Use the Fluent API for everything annotations cannot do: defaults, computed columns, check constraints, filtered indexes, value conversions, delete behavior`,
    `Organise configuration with IEntityTypeConfiguration<T> and ApplyConfigurationsFromAssembly`,
    `Design navigation properties including self-referencing and multiple relationships between two entities`,
  ],
  theory: [
    {
      heading: `Three Ways to Configure the Model`,
      content: `EF Core builds its model (tables, columns, keys, relationships) in three layers. Each later layer can override the earlier one:

1. Conventions - built-in rules: a property called Id or <Class>Id is the key, string becomes nvarchar(max), a DbSet name becomes the table name, int? is NULL.
2. Data Annotations - attributes from System.ComponentModel.DataAnnotations(.Schema) placed on classes and properties.
3. Fluent API - method calls on ModelBuilder in OnModelCreating. It has the highest priority and can configure everything.

Analogy: conventions are the default settings of a new phone, annotations are labels you stick on each app, the Fluent API is the full settings menu.`,
      points: [
        `Precedence: Fluent API > Data Annotations > Conventions`,
        `Some annotations ([Required], [StringLength], [Range], [EmailAddress]) ALSO drive MVC/API validation; Fluent API affects the database only`,
        `Use annotations for simple rules visible on the model; use Fluent API for database-specific or complex rules and to keep entity classes clean`,
      ],
    },
    {
      heading: `Data Annotations Reference`,
      content: `Schema attributes live in System.ComponentModel.DataAnnotations and System.ComponentModel.DataAnnotations.Schema; [Index], [Precision], [PrimaryKey], [Unicode], [Comment], [DeleteBehavior] come from Microsoft.EntityFrameworkCore.`,
      syntax: `[Table("Employees", Schema = "dbo")]             // table name / schema
[Index(nameof(EmpCode), IsUnique = true)]          // index on the class (EF Core 5+)
[PrimaryKey(nameof(A), nameof(B))]                 // composite key (EF Core 7+)
public class Employee
{
    [Key]                                          // primary key
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int EmployeeId { get; set; }

    [Required, MaxLength(10)]                      // NOT NULL, nvarchar(10)
    public string EmpCode { get; set; } = "";

    [StringLength(50)]                             // nvarchar(50) + validation
    public string FirstName { get; set; } = "";

    [Column("Email_Address", TypeName = "varchar(150)")]   // column name and exact type
    public string? Email { get; set; }

    [Precision(12, 2)]                             // decimal(12,2)
    public decimal Salary { get; set; }

    [NotMapped]                                    // no column
    public string Display => EmpCode + " " + FirstName;

    [ForeignKey(nameof(Department))]               // explicit FK
    public int DepartmentId { get; set; }

    [Timestamp]                                    // rowversion for concurrency
    public byte[] RowVersion { get; set; } = null!;

    [Comment("Employee date of joining")]          // extended property in SQL Server
    public DateOnly JoinDate { get; set; }
}`,
    },
    {
      heading: `Fluent API Reference`,
      content: `Override OnModelCreating(ModelBuilder modelBuilder) in the DbContext. Each entity is configured with modelBuilder.Entity<T>(). The Fluent API can do everything annotations can and much more.`,
      syntax: `modelBuilder.Entity<Employee>(b =>
{
    b.ToTable("Employees", t => t.HasCheckConstraint("CK_Employees_Salary", "[Salary] > 0"));
    b.HasKey(e => e.EmployeeId);
    b.Property(e => e.EmpCode).IsRequired().HasMaxLength(10).IsUnicode(false);   // varchar(10)
    b.HasIndex(e => e.EmpCode).IsUnique();
    b.HasIndex(e => e.Email).IsUnique().HasFilter("[Email] IS NOT NULL");
    b.Property(e => e.Salary).HasPrecision(12, 2);
    b.Property(e => e.JoinDate).HasDefaultValueSql("CAST(GETDATE() AS date)");
    b.Property(e => e.FullName).HasComputedColumnSql("[FirstName] + ' ' + [LastName]", stored: true);
    b.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);   // enum as text
    b.Property(e => e.RowVersion).IsRowVersion();
    b.Property(e => e.Notes).HasColumnName("Remarks").HasColumnType("nvarchar(500)");
    b.Ignore(e => e.Display);                                           // = [NotMapped]
    b.HasOne(e => e.Department).WithMany(d => d.Employees)
     .HasForeignKey(e => e.DepartmentId).OnDelete(DeleteBehavior.Restrict);
});
modelBuilder.HasDefaultSchema("hr");                                    // all tables in schema hr`,
      points: [
        `Only Fluent API: HasDefaultValue/Sql, HasComputedColumnSql, check constraints, HasFilter, HasConversion, HasAlternateKey, HasSequence, HasQueryFilter, owned types, table splitting`,
        `Chain methods: Property(...).IsRequired().HasMaxLength(50)`,
        `Always rebuild and create a migration after changing configuration: Add-Migration ConfigureEmployees`,
      ],
    },
    {
      heading: `IEntityTypeConfiguration<T>: Keep OnModelCreating Small`,
      content: `In a big project OnModelCreating becomes hundreds of lines. Move each entity's Fluent configuration into its own class that implements IEntityTypeConfiguration<T>, usually in a Data/Configurations folder, and load them all with one line.`,
      syntax: `public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> b)
    {
        b.Property(e => e.EmpCode).HasMaxLength(10);
        // ...
    }
}

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(EmployeeDbContext).Assembly);
    // or: modelBuilder.ApplyConfiguration(new EmployeeConfiguration());
}`,
      tip: `ConfigureConventions (EF Core 6+) sets rules for ALL properties of a type, e.g. every decimal as decimal(18,2) and every string max 200: configurationBuilder.Properties<decimal>().HavePrecision(18, 2);`,
    },
    {
      heading: `Navigation Properties in Depth`,
      content: `A navigation property lets you move from one object to related objects in C# (employee.Department.Name, department.Employees.Count) instead of writing joins. A pair of navigations on both ends of the same relationship are "inverse" navigations. EF pairs them automatically when there is only one possible match.`,
      points: [
        `Reference navigation: Department Department / Employee? Manager (null! for required, ? for optional)`,
        `Collection navigation: List<Employee> Employees / ICollection<Employee> Subordinates`,
        `Unidirectional: a navigation on one side only (Department.Head with no Employee.HeadOf) - configure with WithMany() or WithOne() with no argument`,
        `Self-referencing: Employee.Manager and Employee.Subordinates point to the same table (ManagerId int?)`,
        `Two relationships between the same two classes (Department.Employees and Department.Head): EF cannot guess the pairs - use [InverseProperty] or explicit Fluent configuration`,
        `Shadow FK: if you have a navigation but no FK property, EF adds a hidden FK column (e.g. DepartmentId) that you can reach with EF.Property<int>(e, "DepartmentId")`,
        `Navigations are NOT loaded automatically - see Day 84 for Include, explicit and lazy loading`,
      ],
    },
    {
      heading: `Choosing Between Annotations and Fluent API`,
      content: `Most teams mix both: validation-related attributes on the model (or better, on view models/DTOs) and all database mapping in Fluent configuration classes. The important rule is consistency - one place per kind of rule, so a teammate knows where to look.`,
      points: [
        `Data Annotations: quick, readable, shared with validation, but clutter the class and are limited`,
        `Fluent API: complete, keeps entities as plain classes (POCOs), entity classes can live in a project with no EF reference`,
        `Database First scaffolding generates Fluent API by default; add -DataAnnotations (--data-annotations) to get attributes instead`,
        `If both are used for the same property, Fluent API wins - avoid contradicting yourself`,
      ],
    },
  ],
  examples: [
    {
      title: `Configure the Employee database with Data Annotations`,
      scenario: `Create the EmployeePortal MVC project and design Department and Employee using only attributes: unique employee codes, sized columns, money precision, an enum status stored as text, a self-referencing manager and a non-mapped display property.`,
      steps: [
        `Visual Studio: File > New > Project > ASP.NET Core Web App (Model-View-Controller) > Name: EmployeePortal > .NET 10 (or 8) > Authentication: None > Create`,
        `PMC (Tools > NuGet Package Manager > Package Manager Console): Install-Package Microsoft.EntityFrameworkCore.SqlServer ; Install-Package Microsoft.EntityFrameworkCore.Tools`,
        `(CLI: dotnet add package Microsoft.EntityFrameworkCore.SqlServer ; dotnet add package Microsoft.EntityFrameworkCore.Design)`,
        `Add Models/Department.cs, Models/Employee.cs and Data/EmployeeDbContext.cs`,
        `Add the connection string to appsettings.json and register the DbContext in Program.cs`,
        `PM> Add-Migration InitialEmployeeDb  (CLI: dotnet ef migrations add InitialEmployeeDb)`,
        `PM> Update-Database  (CLI: dotnet ef database update)`,
        `SSMS: EmployeeDb > Tables > dbo.Employees > Columns / Keys / Indexes to verify`,
      ],
      code: `// ===== appsettings.json =====
{
  "ConnectionStrings": {
    "EmployeeDb": "Server=(localdb)\\\\MSSQLLocalDB;Database=EmployeeDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*"
}

// ===== Program.cs =====
using Microsoft.EntityFrameworkCore;
using EmployeePortal.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<EmployeeDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("EmployeeDb")));

var app = builder.Build();
app.UseStaticFiles();
app.UseRouting();
app.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");
app.Run();

// ===== Models/EmployeeStatus.cs =====
namespace EmployeePortal.Models;
public enum EmployeeStatus { Active, OnLeave, Resigned }

// ===== Models/Department.cs =====
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EmployeePortal.Models;

[Table("Departments")]
[Index(nameof(Name), IsUnique = true)]
public class Department
{
    [Key]
    public int DepartmentId { get; set; }

    [Required, StringLength(60)]
    public string Name { get; set; } = string.Empty;

    [StringLength(60)]
    public string? Location { get; set; }

    [InverseProperty(nameof(Employee.Department))]
    public List<Employee> Employees { get; set; } = new();
}

// ===== Models/Employee.cs =====
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EmployeePortal.Models;

[Table("Employees")]
[Index(nameof(EmpCode), IsUnique = true)]
public class Employee
{
    [Key]
    public int EmployeeId { get; set; }

    [Required, StringLength(10), Display(Name = "Employee Code")]
    public string EmpCode { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string LastName { get; set; } = string.Empty;

    [EmailAddress, StringLength(150)]
    public string? Email { get; set; }

    [Precision(12, 2), Range(1, 10000000)]
    public decimal Salary { get; set; }

    [Column(TypeName = "date")]
    public DateTime JoinDate { get; set; }

    [Column(TypeName = "nvarchar(20)")]           // enum stored as text: 'Active', 'OnLeave' ...
    public EmployeeStatus Status { get; set; }

    [ForeignKey(nameof(Department))]
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    public int? ManagerId { get; set; }
    [ForeignKey(nameof(ManagerId))]
    public Employee? Manager { get; set; }

    [InverseProperty(nameof(Manager))]
    public List<Employee> Subordinates { get; set; } = new();

    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;

    [NotMapped]
    public string DisplayName => $"{EmpCode} - {FirstName} {LastName}";
}

// ===== Data/EmployeeDbContext.cs =====
using Microsoft.EntityFrameworkCore;
using EmployeePortal.Models;

namespace EmployeePortal.Data;

public class EmployeeDbContext : DbContext
{
    public EmployeeDbContext(DbContextOptions<EmployeeDbContext> options) : base(options) { }
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();
}

// ===== Commands =====
PM> Add-Migration InitialEmployeeDb
PM> Update-Database
dotnet ef migrations add InitialEmployeeDb
dotnet ef database update

-- ===== Generated SQL =====
CREATE TABLE [Departments] (
    [DepartmentId] int NOT NULL IDENTITY,
    [Name] nvarchar(60) NOT NULL,
    [Location] nvarchar(60) NULL,
    CONSTRAINT [PK_Departments] PRIMARY KEY ([DepartmentId])
);
CREATE TABLE [Employees] (
    [EmployeeId] int NOT NULL IDENTITY,
    [EmpCode] nvarchar(10) NOT NULL,
    [FirstName] nvarchar(50) NOT NULL,
    [LastName] nvarchar(50) NOT NULL,
    [Email] nvarchar(150) NULL,
    [Salary] decimal(12,2) NOT NULL,
    [JoinDate] date NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    [DepartmentId] int NOT NULL,
    [ManagerId] int NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_Employees] PRIMARY KEY ([EmployeeId]),
    CONSTRAINT [FK_Employees_Departments_DepartmentId] FOREIGN KEY ([DepartmentId])
        REFERENCES [Departments] ([DepartmentId]) ON DELETE CASCADE,
    CONSTRAINT [FK_Employees_Employees_ManagerId] FOREIGN KEY ([ManagerId])
        REFERENCES [Employees] ([EmployeeId])
);
CREATE UNIQUE INDEX [IX_Departments_Name] ON [Departments] ([Name]);
CREATE INDEX [IX_Employees_DepartmentId] ON [Employees] ([DepartmentId]);
CREATE UNIQUE INDEX [IX_Employees_EmpCode] ON [Employees] ([EmpCode]);
CREATE INDEX [IX_Employees_ManagerId] ON [Employees] ([ManagerId]);`,
      result: `Applying migration '..._InitialEmployeeDb'. Done.

EmployeeDb contains Departments and Employees. Employees has 11 columns: no DisplayName column (NotMapped), Status is nvarchar(20) and stores the text 'Active', RowVersion is a rowversion column filled automatically by SQL Server, and the self-referencing FK_Employees_Employees_ManagerId has no cascade.`,
      explanation: `Every attribute maps to one piece of schema: [StringLength]/[Required] to nvarchar(n) NOT NULL, [Precision] to decimal(12,2), [Column(TypeName)] to the exact SQL type (for an enum, a string column type makes EF convert the enum to text automatically), [Index] to CREATE INDEX, [Timestamp] to rowversion. [InverseProperty] pairs Manager with Subordinates explicitly; the optional ManagerId (int?) gives a NULL-able FK with NO ACTION, which is required because SQL Server forbids cascade on self-references. Notice what annotations could NOT express: a default for JoinDate, a CHECK on Salary, a computed full name or Restrict on Department (EF Core 8+ has [DeleteBehavior] for that) - that is the job of the Fluent API in the next example.`,
    },
    {
      title: `The same database with the Fluent API and IEntityTypeConfiguration`,
      scenario: `The team decides to keep entity classes clean (no attributes) and put all mapping into configuration classes. Add the extra rules annotations could not express: default join date, salary CHECK constraint, computed FullName, filtered unique email, Restrict on delete, and a department Head (a second relationship to Employee).`,
      steps: [
        `Remove the schema attributes from Department and Employee (keep the classes below)`,
        `Right-click the Data folder > Add > New Folder > Configurations; add DepartmentConfiguration.cs and EmployeeConfiguration.cs`,
        `Change OnModelCreating to ApplyConfigurationsFromAssembly`,
        `Build with Ctrl+Shift+B`,
        `PM> Add-Migration FluentConfiguration  (CLI: dotnet ef migrations add FluentConfiguration)`,
        `Open the migration and check: AddColumn FullName (computed), AddCheckConstraint, AlterColumn JoinDate with defaultValueSql`,
        `PM> Update-Database  (CLI: dotnet ef database update)`,
      ],
      code: `// ===== Models/Department.cs (plain class) =====
public class Department
{
    public int DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }

    public int? HeadEmployeeId { get; set; }          // department head (optional)
    public Employee? Head { get; set; }

    public List<Employee> Employees { get; set; } = new();
}

// ===== Models/Employee.cs (plain class) =====
public class Employee
{
    public int EmployeeId { get; set; }
    public string EmpCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;   // computed by SQL Server
    public string? Email { get; set; }
    public decimal Salary { get; set; }
    public DateOnly JoinDate { get; set; }
    public EmployeeStatus Status { get; set; }

    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    public int? ManagerId { get; set; }
    public Employee? Manager { get; set; }
    public List<Employee> Subordinates { get; set; } = new();

    public byte[] RowVersion { get; set; } = null!;
    public string DisplayName => $"{EmpCode} - {FullName}";      // not mapped (no setter is ignored, Ignore() makes it explicit)
}

// ===== Data/Configurations/DepartmentConfiguration.cs =====
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EmployeePortal.Models;

namespace EmployeePortal.Data.Configurations;

public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> b)
    {
        b.ToTable("Departments");
        b.HasKey(d => d.DepartmentId);
        b.Property(d => d.Name).IsRequired().HasMaxLength(60);
        b.HasIndex(d => d.Name).IsUnique();
        b.Property(d => d.Location).HasMaxLength(60).HasDefaultValue("Head Office");

        // second relationship Department -> Employee (unidirectional: no inverse on Employee)
        b.HasOne(d => d.Head)
         .WithMany()
         .HasForeignKey(d => d.HeadEmployeeId)
         .OnDelete(DeleteBehavior.NoAction);
    }
}

// ===== Data/Configurations/EmployeeConfiguration.cs =====
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EmployeePortal.Models;

namespace EmployeePortal.Data.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> b)
    {
        b.ToTable("Employees", t => t.HasCheckConstraint("CK_Employees_Salary", "[Salary] > 0"));
        b.HasKey(e => e.EmployeeId);

        b.Property(e => e.EmpCode).IsRequired().HasMaxLength(10).IsUnicode(false);   // varchar(10)
        b.HasIndex(e => e.EmpCode).IsUnique();

        b.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
        b.Property(e => e.LastName).IsRequired().HasMaxLength(50);
        b.Property(e => e.FullName)
         .HasMaxLength(101)
         .HasComputedColumnSql("[FirstName] + ' ' + [LastName]", stored: true);

        b.Property(e => e.Email).HasMaxLength(150);
        b.HasIndex(e => e.Email).IsUnique().HasFilter("[Email] IS NOT NULL");

        b.Property(e => e.Salary).HasPrecision(12, 2);
        b.Property(e => e.JoinDate).HasDefaultValueSql("CAST(GETDATE() AS date)");
        b.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        b.Property(e => e.RowVersion).IsRowVersion();
        b.Ignore(e => e.DisplayName);

        // Employee * -> 1 Department
        b.HasOne(e => e.Department)
         .WithMany(d => d.Employees)
         .HasForeignKey(e => e.DepartmentId)
         .OnDelete(DeleteBehavior.Restrict);

        // self-reference: Employee * -> 0..1 Manager
        b.HasOne(e => e.Manager)
         .WithMany(m => m.Subordinates)
         .HasForeignKey(e => e.ManagerId)
         .OnDelete(DeleteBehavior.NoAction);
    }
}

// ===== Data/EmployeeDbContext.cs =====
public class EmployeeDbContext : DbContext
{
    public EmployeeDbContext(DbContextOptions<EmployeeDbContext> options) : base(options) { }
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.ApplyConfigurationsFromAssembly(typeof(EmployeeDbContext).Assembly);

    protected override void ConfigureConventions(ModelConfigurationBuilder cb)
        => cb.Properties<string>().HaveMaxLength(200);    // default for strings not configured above
}

// ===== Commands =====
PM> Add-Migration FluentConfiguration
PM> Update-Database
dotnet ef migrations add FluentConfiguration
dotnet ef database update

-- ===== Generated SQL for a fresh database (dotnet ef migrations script) =====
CREATE TABLE [Departments] (
    [DepartmentId] int NOT NULL IDENTITY,
    [Name] nvarchar(60) NOT NULL,
    [Location] nvarchar(60) NULL DEFAULT N'Head Office',
    [HeadEmployeeId] int NULL,
    CONSTRAINT [PK_Departments] PRIMARY KEY ([DepartmentId])
);
CREATE TABLE [Employees] (
    [EmployeeId] int NOT NULL IDENTITY,
    [EmpCode] varchar(10) NOT NULL,
    [FirstName] nvarchar(50) NOT NULL,
    [LastName] nvarchar(50) NOT NULL,
    [FullName] AS [FirstName] + ' ' + [LastName] PERSISTED,
    [Email] nvarchar(150) NULL,
    [Salary] decimal(12,2) NOT NULL,
    [JoinDate] date NOT NULL DEFAULT (CAST(GETDATE() AS date)),
    [Status] nvarchar(20) NOT NULL,
    [DepartmentId] int NOT NULL,
    [ManagerId] int NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_Employees] PRIMARY KEY ([EmployeeId]),
    CONSTRAINT [CK_Employees_Salary] CHECK ([Salary] > 0),
    CONSTRAINT [FK_Employees_Departments_DepartmentId] FOREIGN KEY ([DepartmentId])
        REFERENCES [Departments] ([DepartmentId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Employees_Employees_ManagerId] FOREIGN KEY ([ManagerId])
        REFERENCES [Employees] ([EmployeeId])
);
CREATE INDEX [IX_Departments_HeadEmployeeId] ON [Departments] ([HeadEmployeeId]);
CREATE UNIQUE INDEX [IX_Departments_Name] ON [Departments] ([Name]);
CREATE UNIQUE INDEX [IX_Employees_Email] ON [Employees] ([Email]) WHERE [Email] IS NOT NULL;
CREATE UNIQUE INDEX [IX_Employees_EmpCode] ON [Employees] ([EmpCode]);
-- (IX_Employees_DepartmentId and IX_Employees_ManagerId as before)
ALTER TABLE [Departments] ADD CONSTRAINT [FK_Departments_Employees_HeadEmployeeId]
    FOREIGN KEY ([HeadEmployeeId]) REFERENCES [Employees] ([EmployeeId]);`,
      result: `Applying migration '..._FluentConfiguration'. Done.

In SSMS: Employees > Columns shows FullName (Computed), EmpCode varchar(10); Keys shows CK_Employees_Salary; Indexes shows the filtered unique index IX_Employees_Email. Departments has the new HeadEmployeeId column and a FK to Employees.`,
      explanation: `The configuration classes contain all database rules, so Department and Employee are plain C# classes. Departments and Employees reference each other (Head and Department), so EF creates both tables first and adds the circular foreign key afterwards with ALTER TABLE. Because Department has two relationships with Employee, they must be configured explicitly: Employees pairs with Employee.Department, and Head is unidirectional (WithMany() with no argument). Restrict/NoAction avoid "multiple cascade paths" errors. HasFilter keeps several NULL emails possible while non-NULL emails stay unique (EF adds this filter automatically for nullable columns, but writing it documents the intent).`,
    },
    {
      title: `Navigation properties at work: org chart and department heads (console)`,
      scenario: `Use the Fluent-configured model in a console program: insert departments and employees, assign a department head, print each department with its head and staff count, print the reporting tree using Manager/Subordinates, and see the CHECK constraint reject a negative salary.`,
      steps: [
        `In Visual Studio: File > New > Project > Console App > Name: EmployeeNavigation > .NET 10 (or 8)`,
        `PMC: Install-Package Microsoft.EntityFrameworkCore.SqlServer`,
        `Copy EmployeeStatus, Department, Employee and the two configuration classes from Example 2 (namespace EmployeeNavigation)`,
        `Add EmployeeContext.cs and replace Program.cs with the code below`,
        `Press Ctrl+F5`,
      ],
      code: `// ===== EmployeeContext.cs =====
using Microsoft.EntityFrameworkCore;

namespace EmployeeNavigation;

public class EmployeeContext : DbContext
{
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnConfiguring(DbContextOptionsBuilder o)
        => o.UseSqlServer(@"Server=(localdb)\\MSSQLLocalDB;Database=EmployeeNavDb;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder mb)
        => mb.ApplyConfigurationsFromAssembly(typeof(EmployeeContext).Assembly);
}

// ===== Program.cs =====
using Microsoft.EntityFrameworkCore;
using EmployeeNavigation;

using var db = new EmployeeContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();

var it = new Department { Name = "IT" };
var hr = new Department { Name = "HR", Location = "Pune Branch" };

var priya  = new Employee { EmpCode = "E001", FirstName = "Priya",  LastName = "Nair",  Salary = 120000m, Department = it };
var arjun  = new Employee { EmpCode = "E002", FirstName = "Arjun",  LastName = "Rao",   Salary = 85000m,  Department = it, Manager = priya };
var sara   = new Employee { EmpCode = "E003", FirstName = "Sara",   LastName = "Khan",  Salary = 78000m,  Department = it, Manager = priya, Status = EmployeeStatus.OnLeave };
var vikram = new Employee { EmpCode = "E004", FirstName = "Vikram", LastName = "Das",   Salary = 70000m,  Department = hr };
var meena  = new Employee { EmpCode = "E005", FirstName = "Meena",  LastName = "Joshi", Salary = 60000m,  Department = it, Manager = arjun };

db.Employees.AddRange(priya, arjun, sara, vikram, meena);
db.SaveChanges();                         // 2 departments + 5 employees
Console.WriteLine($"Saved. Priya's computed FullName = {priya.FullName}");

it.Head = priya;                          // second step: avoids a circular insert
db.SaveChanges();

db.ChangeTracker.Clear();

Console.WriteLine("--- Departments ---");
var depts = db.Departments
    .Include(d => d.Head)
    .Include(d => d.Employees)
    .OrderBy(d => d.Name)
    .ToList();
foreach (var d in depts)
    Console.WriteLine($"{d.Name} ({d.Location}) | Head: {d.Head?.FullName ?? "none"} | Staff: {d.Employees.Count}");

Console.WriteLine("--- Reporting tree ---");
var all = db.Employees.OrderBy(e => e.EmpCode).ToList();   // fix-up links Manager and Subordinates
foreach (var boss in all.Where(e => e.ManagerId == null))
    PrintTree(boss, 0);

Console.WriteLine("--- CHECK constraint ---");
db.Employees.Add(new Employee { EmpCode = "E006", FirstName = "Test", LastName = "User", Salary = -5m, DepartmentId = 1 });
try
{
    db.SaveChanges();
}
catch (DbUpdateException ex)
{
    Console.WriteLine("Rejected: " + ex.InnerException?.Message.Split('.')[0]);
}

static void PrintTree(Employee e, int level)
{
    Console.WriteLine($"{new string(' ', level * 2)}{e.EmpCode} {e.FullName} ({e.Status})");
    foreach (var s in e.Subordinates.OrderBy(x => x.EmpCode))
        PrintTree(s, level + 1);
}`,
      result: `Saved. Priya's computed FullName = Priya Nair
--- Departments ---
HR (Pune Branch) | Head: none | Staff: 1
IT (Head Office) | Head: Priya Nair | Staff: 4
--- Reporting tree ---
E001 Priya Nair (Active)
  E002 Arjun Rao (Active)
    E005 Meena Joshi (Active)
  E003 Sara Khan (OnLeave)
E004 Vikram Das (Active)
--- CHECK constraint ---
Rejected: The INSERT statement conflicted with the CHECK constraint "CK_Employees_Salary"`,
      explanation: `After the INSERT, EF reads back store-generated values (identity, computed FullName, rowversion and the defaults for Location and JoinDate), which is why priya.FullName is filled without a query. Setting it.Head in the same first SaveChanges would create a cycle (Department needs Employee, Employee needs Department), so the head is assigned in a second save - a common real-world pattern. The reporting tree needs no Include: loading all employees into the same context lets EF "fix up" navigations - every Manager and Subordinates collection is linked automatically because the related objects are already tracked. Status is stored as the text 'OnLeave' thanks to HasConversion<string>(). The CHECK constraint is enforced by SQL Server (error 547) even though C# allowed -5.`,
    },
    {
      title: `Shadow properties, [NotMapped] and value conversions in practice`,
      scenario: `Audit columns (CreatedAt, CreatedBy) should exist in the table but not clutter the Employee class; a phone number should be stored without spaces; and a calculated property must never become a column.`,
      steps: [
        `Add the shadow properties and the converter to EmployeeConfiguration`,
        `Override SaveChanges in EmployeeDbContext to fill CreatedAt automatically`,
        `PM> Add-Migration AuditColumns ; PM> Update-Database (CLI: dotnet ef migrations add AuditColumns ; dotnet ef database update)`,
        `Insert an employee and look at the row in SSMS`,
      ],
      code: `// ===== Employee.cs (only what the business needs) =====
public string? Phone { get; set; }
public int YearsOfService => DateTime.Today.Year - JoinDate.Year;   // calculated -> ignored

// ===== EmployeeConfiguration.Configure =====
b.Property<DateTime>("CreatedAt").HasDefaultValueSql("SYSUTCDATETIME()");   // shadow property
b.Property<string>("CreatedBy").HasMaxLength(50);                           // shadow property
b.Ignore(e => e.YearsOfService);

b.Property(e => e.Phone)
 .HasMaxLength(15)
 .HasConversion(
     v => v == null ? null : v.Replace(" ", ""),     // C# -> database
     v => v);                                        // database -> C#

// ===== EmployeeDbContext: fill CreatedBy for every new employee =====
public override Task<int> SaveChangesAsync(CancellationToken ct = default)
{
    foreach (var entry in ChangeTracker.Entries<Employee>().Where(e => e.State == EntityState.Added))
        entry.Property("CreatedBy").CurrentValue = "admin";
    return base.SaveChangesAsync(ct);
}

// ===== Query a shadow property with EF.Property =====
var newest = await db.Employees
    .OrderByDescending(e => EF.Property<DateTime>(e, "CreatedAt"))
    .Select(e => new { e.EmpCode, CreatedBy = EF.Property<string>(e, "CreatedBy") })
    .FirstAsync();

-- ===== Generated migration SQL =====
ALTER TABLE [Employees] ADD [CreatedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME());
ALTER TABLE [Employees] ADD [CreatedBy] nvarchar(50) NULL;
ALTER TABLE [Employees] ADD [Phone] nvarchar(15) NULL;`,
      result: `Saving new Employee { EmpCode = "E010", Phone = "98 220 11223", ... } stores Phone = '9822011223', CreatedBy = 'admin' and CreatedAt = the UTC time of the insert. The Employee class still has no CreatedAt/CreatedBy properties, and there is no YearsOfService column.`,
      explanation: `Shadow properties exist in the EF model and the table but not in the class; you read and write them through the change tracker (entry.Property("CreatedBy")) or EF.Property<T>() in LINQ. HasConversion converts values on the way to and from the database - here a simple normalisation, often used for enums, strongly typed IDs or encrypted values. Ignore (or [NotMapped]) is needed for calculated properties that have a setter or are not obviously read-only; get-only expression-bodied properties are not mapped anyway, but being explicit avoids surprises.`,
    },
    {
      title: `Employee database rules in plain T-SQL (SSMS Lab)`,
      scenario: `See the constraints EF Core generated - UNIQUE, DEFAULT, CHECK and a self-referencing FOREIGN KEY - working directly in SQL, and write the manager self-join that Include(e => e.Manager) produces.`,
      steps: [
        `Open SSMS (or the in-app SSMS Lab) > New Query`,
        `Paste the script and press F5`,
        `Compare the self-join result with the console org chart from Example 3`,
        `Read the two error messages for the invalid salary and the duplicate EmpCode`,
      ],
      code: `CREATE DATABASE EmployeeLabDb;
GO
USE EmployeeLabDb;
GO
CREATE TABLE Departments (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(60) NOT NULL UNIQUE,
    Location NVARCHAR(60) NOT NULL DEFAULT 'Head Office'
);
CREATE TABLE Employees (
    EmployeeId INT IDENTITY(1,1) PRIMARY KEY,
    EmpCode NVARCHAR(10) NOT NULL UNIQUE,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Salary DECIMAL(12,2) NOT NULL CHECK (Salary > 0),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    DepartmentId INT NOT NULL FOREIGN KEY REFERENCES Departments(DepartmentId),
    ManagerId INT NULL FOREIGN KEY REFERENCES Employees(EmployeeId)
);
GO
INSERT INTO Departments (Name) VALUES ('IT');
INSERT INTO Departments (Name, Location) VALUES ('HR', 'Pune Branch');
INSERT INTO Employees (EmpCode, FirstName, LastName, Salary, DepartmentId, ManagerId) VALUES ('E001', 'Priya', 'Nair', 120000, 1, NULL);
INSERT INTO Employees (EmpCode, FirstName, LastName, Salary, DepartmentId, ManagerId) VALUES ('E002', 'Arjun', 'Rao', 85000, 1, 1), ('E004', 'Vikram', 'Das', 70000, 2, NULL);
INSERT INTO Employees (EmpCode, FirstName, LastName, Salary, Status, DepartmentId, ManagerId) VALUES ('E003', 'Sara', 'Khan', 78000, 'OnLeave', 1, 1);
INSERT INTO Employees (EmpCode, FirstName, LastName, Salary, DepartmentId, ManagerId) VALUES ('E005', 'Meena', 'Joshi', 60000, 1, 2);
GO
SELECT * FROM Departments;
SELECT e.EmpCode, e.FirstName + ' ' + e.LastName AS FullName, e.Status, d.Name AS Department,
       ISNULL(m.FirstName + ' ' + m.LastName, '-') AS Manager
FROM Employees e
INNER JOIN Departments d ON d.DepartmentId = e.DepartmentId
LEFT JOIN Employees m ON m.EmployeeId = e.ManagerId
ORDER BY e.EmpCode;
INSERT INTO Employees (EmpCode, FirstName, LastName, Salary, DepartmentId) VALUES ('E006', 'Test', 'User', -5, 1);
INSERT INTO Employees (EmpCode, FirstName, LastName, Salary, DepartmentId) VALUES ('E001', 'Dup', 'Code', 50000, 1);`,
      tsql: `CREATE DATABASE EmployeeLabDb;
GO
USE EmployeeLabDb;
GO
CREATE TABLE Departments (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(60) NOT NULL UNIQUE,
    Location NVARCHAR(60) NOT NULL DEFAULT 'Head Office'
);
CREATE TABLE Employees (
    EmployeeId INT IDENTITY(1,1) PRIMARY KEY,
    EmpCode NVARCHAR(10) NOT NULL UNIQUE,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Salary DECIMAL(12,2) NOT NULL CHECK (Salary > 0),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    DepartmentId INT NOT NULL FOREIGN KEY REFERENCES Departments(DepartmentId),
    ManagerId INT NULL FOREIGN KEY REFERENCES Employees(EmployeeId)
);
GO
INSERT INTO Departments (Name) VALUES ('IT');
INSERT INTO Departments (Name, Location) VALUES ('HR', 'Pune Branch');
INSERT INTO Employees (EmpCode, FirstName, LastName, Salary, DepartmentId, ManagerId) VALUES ('E001', 'Priya', 'Nair', 120000, 1, NULL);
INSERT INTO Employees (EmpCode, FirstName, LastName, Salary, DepartmentId, ManagerId) VALUES ('E002', 'Arjun', 'Rao', 85000, 1, 1), ('E004', 'Vikram', 'Das', 70000, 2, NULL);
INSERT INTO Employees (EmpCode, FirstName, LastName, Salary, Status, DepartmentId, ManagerId) VALUES ('E003', 'Sara', 'Khan', 78000, 'OnLeave', 1, 1);
INSERT INTO Employees (EmpCode, FirstName, LastName, Salary, DepartmentId, ManagerId) VALUES ('E005', 'Meena', 'Joshi', 60000, 1, 2);
GO
SELECT * FROM Departments;
SELECT e.EmpCode, e.FirstName + ' ' + e.LastName AS FullName, e.Status, d.Name AS Department,
       ISNULL(m.FirstName + ' ' + m.LastName, '-') AS Manager
FROM Employees e
INNER JOIN Departments d ON d.DepartmentId = e.DepartmentId
LEFT JOIN Employees m ON m.EmployeeId = e.ManagerId
ORDER BY e.EmpCode;
INSERT INTO Employees (EmpCode, FirstName, LastName, Salary, DepartmentId) VALUES ('E006', 'Test', 'User', -5, 1);
INSERT INTO Employees (EmpCode, FirstName, LastName, Salary, DepartmentId) VALUES ('E001', 'Dup', 'Code', 50000, 1);`,
      result: `DepartmentId | Name | Location
1            | IT   | Head Office
2            | HR   | Pune Branch
(2 rows)

EmpCode | FullName    | Status  | Department | Manager
E001    | Priya Nair  | Active  | IT         | -
E002    | Arjun Rao   | Active  | IT         | Priya Nair
E003    | Sara Khan   | OnLeave | IT         | Priya Nair
E004    | Vikram Das  | Active  | HR         | -
E005    | Meena Joshi | Active  | IT         | Arjun Rao
(5 rows)

INSERT ... Salary -5    -> Msg 547: The statement conflicted with the CHECK constraint.
INSERT ... EmpCode E001 -> Msg 2627: Violation of PRIMARY KEY / UNIQUE KEY constraint. Cannot insert duplicate key.`,
      explanation: `DEFAULT 'Head Office' fills Location for IT because the INSERT omitted it, just like HasDefaultValue. Status defaults to 'Active' and stores the enum's text. The manager column is a self-referencing FK; the LEFT JOIN of Employees to itself (alias m) is what EF generates for Include(e => e.Manager). Note that E004 was inserted together with E002, so Meena's ManagerId 2 is Arjun. The CHECK and UNIQUE constraints reject bad data no matter which application writes it - this is why database-level configuration (Fluent API) matters in addition to C# validation.`,
    },
  ],
  interview: [
    { q: `What are the three ways to configure an EF Core model and which one wins?`, a: `Conventions, Data Annotations and the Fluent API. Fluent API overrides Data Annotations, which override conventions.`, level: 'Easy' },
    { q: `Name configurations that are only possible with the Fluent API.`, a: `Default values (HasDefaultValue/HasDefaultValueSql), computed columns, check constraints, filtered indexes (HasFilter), value conversions, alternate keys, sequences, global query filters, owned types, table splitting and keyless entity mapping to views.`, level: 'Medium' },
    { q: `Difference between [MaxLength] and [StringLength]?`, a: `Both set nvarchar(n) in EF Core. [StringLength] also supports MinimumLength and is commonly used for MVC validation messages; [MaxLength] also works for arrays.`, level: 'Easy' },
    { q: `What does [NotMapped] / Ignore() do?`, a: `Excludes a property (or class) from the EF model, so no column is created and EF does not read or write it. Useful for calculated or UI-only properties.`, level: 'Easy' },
    { q: `What is IEntityTypeConfiguration<T>?`, a: `An interface with a Configure(EntityTypeBuilder<T>) method that holds the Fluent API configuration for one entity in its own class. They are registered with ApplyConfiguration or ApplyConfigurationsFromAssembly.`, level: 'Medium' },
    { q: `When do you need [InverseProperty]?`, a: `When there is more than one relationship between the same two entities (e.g. Department.Employees and Department.Head), or for self-references, so EF knows which navigations pair together.`, level: 'Hard' },
    { q: `What is a self-referencing relationship? Give an example.`, a: `An entity related to itself, such as Employee.Manager (ManagerId int?) and Employee.Subordinates. It must be optional and use NoAction/Restrict on delete in SQL Server.`, level: 'Medium' },
    { q: `What is a shadow property?`, a: `A property in the EF model and database table that has no CLR property in the class. It is accessed via ChangeTracker entries or EF.Property<T>(entity, "Name") in queries. Shadow FKs and audit columns are common examples.`, level: 'Hard' },
    { q: `How do you store an enum as text instead of int?`, a: `HasConversion<string>() in Fluent API, or [Column(TypeName = "nvarchar(20)")] on the property. The column then stores names like 'Active'.`, level: 'Medium' },
    { q: `How do you add a CHECK constraint with EF Core?`, a: `In Fluent API: ToTable("Employees", t => t.HasCheckConstraint("CK_Employees_Salary", "[Salary] > 0")); then Add-Migration and Update-Database.`, level: 'Medium' },
    { q: `HasDefaultValue vs HasDefaultValueSql?`, a: `HasDefaultValue sets a constant default (e.g. "Head Office"); HasDefaultValueSql uses a SQL expression evaluated by the server (e.g. GETDATE(), NEWID()).`, level: 'Medium' },
    { q: `What is a unidirectional navigation and how do you configure it?`, a: `A relationship with a navigation on only one side, e.g. Department.Head with nothing on Employee. Configure with HasOne(d => d.Head).WithMany() (or WithOne()) with no lambda.`, level: 'Hard' },
    { q: `Do validation attributes like [Range] or [EmailAddress] change the database schema?`, a: `No. They are used by model validation (MVC, Web API). Only schema-related attributes such as [Required], [MaxLength], [StringLength], [Column], [Key], [Precision] influence the generated schema.`, level: 'Medium' },
    { q: `Output-based: in EF Core, a property has [MaxLength(50)] and Fluent API HasMaxLength(100). What column is created?`, a: `nvarchar(100), because the Fluent API overrides Data Annotations.`, level: 'Easy' },
  ],
  practice: [
    {
      task: `Using Data Annotations only, create a Project entity: ProjectId key, Code (required, max 12, unique), Title (required, max 100), Budget decimal(14,2), StartDate as SQL date.`,
      hint: `[Index] goes on the class; [Precision] for decimals; [Column(TypeName = "date")].`,
      solution: `[Index(nameof(Code), IsUnique = true)]
public class Project
{
    [Key] public int ProjectId { get; set; }
    [Required, MaxLength(12)] public string Code { get; set; } = "";
    [Required, MaxLength(100)] public string Title { get; set; } = "";
    [Precision(14, 2)] public decimal Budget { get; set; }
    [Column(TypeName = "date")] public DateTime StartDate { get; set; }
}`,
    },
    {
      task: `Write a ProjectConfiguration class that configures the same rules with the Fluent API plus a CHECK that Budget >= 0 and a default StartDate of today.`,
      hint: `IEntityTypeConfiguration<Project>, ToTable with HasCheckConstraint, HasDefaultValueSql.`,
      solution: `public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> b)
    {
        b.ToTable("Projects", t => t.HasCheckConstraint("CK_Projects_Budget", "[Budget] >= 0"));
        b.Property(p => p.Code).IsRequired().HasMaxLength(12);
        b.HasIndex(p => p.Code).IsUnique();
        b.Property(p => p.Title).IsRequired().HasMaxLength(100);
        b.Property(p => p.Budget).HasPrecision(14, 2);
        b.Property(p => p.StartDate).HasColumnType("date").HasDefaultValueSql("CAST(GETDATE() AS date)");
    }
}`,
    },
    {
      task: `Add a many-to-many between Employee and Project (an employee works on many projects) using skip navigations, and name the join table EmployeeProjects.`,
      hint: `HasMany().WithMany().UsingEntity(j => j.ToTable(...)).`,
      solution: `// Employee: public List<Project> Projects { get; set; } = new();
// Project:  public List<Employee> Members { get; set; } = new();
modelBuilder.Entity<Employee>()
    .HasMany(e => e.Projects)
    .WithMany(p => p.Members)
    .UsingEntity(j => j.ToTable("EmployeeProjects"));
// PM> Add-Migration EmployeeProjects ; Update-Database`,
    },
    {
      task: `Store an EmployeeStatus enum as text and make 'Active' the database default.`,
      hint: `HasConversion<string>() and HasDefaultValue with the enum value.`,
      solution: `b.Property(e => e.Status)
 .HasConversion<string>()
 .HasMaxLength(20)
 .HasDefaultValue(EmployeeStatus.Active);
-- [Status] nvarchar(20) NOT NULL DEFAULT N'Active'`,
    },
    {
      task: `Write a LINQ query that lists every employee code with their manager's name (or "-"), using the Manager navigation property instead of a manual join.`,
      hint: `Navigation access inside Select becomes a LEFT JOIN.`,
      solution: `var rows = await db.Employees
    .OrderBy(e => e.EmpCode)
    .Select(e => new { e.EmpCode, Manager = e.Manager != null ? e.Manager.FullName : "-" })
    .ToListAsync();
// SQL: ... FROM [Employees] AS [e] LEFT JOIN [Employees] AS [e0] ON [e].[ManagerId] = [e0].[EmployeeId]`,
    },
  ],
  quiz: [
    { question: `Which configuration has the highest priority in EF Core?`, options: [`Conventions`, `Data Annotations`, `Fluent API`, `appsettings.json`], answer: 2, explanation: `Fluent API overrides annotations and conventions.` },
    { question: `Which attribute prevents a property from becoming a column?`, options: [`[NotMapped]`, `[Key]`, `[Required]`, `[Timestamp]`], answer: 0, explanation: `[NotMapped] (or Ignore in Fluent API) excludes the property.` },
    { question: `How do you create a computed column?`, options: [`[Computed] attribute`, `HasDefaultValueSql`, `[DatabaseGenerated] only`, `HasComputedColumnSql`], answer: 3, explanation: `HasComputedColumnSql defines the SQL expression, optionally stored (PERSISTED).` },
    { question: `Which line loads all IEntityTypeConfiguration classes at once?`, options: [`modelBuilder.LoadAll()`, `modelBuilder.ApplyConfigurationsFromAssembly(typeof(MyContext).Assembly)`, `services.AddConfigurations()`, `modelBuilder.Entity<object>()`], answer: 1, explanation: `ApplyConfigurationsFromAssembly scans the assembly for configuration classes.` },
    { question: `Department has both Employees (collection) and Head (reference) to Employee. What is needed?`, options: [`Nothing, EF guesses`, `Two DbContexts`, `[InverseProperty] or explicit Fluent configuration`, `A stored procedure`], answer: 2, explanation: `With two relationships between the same entities, EF cannot pair the navigations automatically.` },
  ],
};
