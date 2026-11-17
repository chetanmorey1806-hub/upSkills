export default {
  id: 'day-080-ef-core-migrations',
  title: `Migrations: Add-Migration, Update-Database, Remove-Migration`,
  module: `Module 7: Entity Framework Core & Database Connectivity`,
  day: 80,
  level: `Intermediate`,
  duration: `2.5 hours`,
  summary: `Migrations keep your SQL Server schema in sync with your C# model. Learn what a migration file contains (Up, Down, Designer, ModelSnapshot), how __EFMigrationsHistory works, and practise every command in both Package Manager Console and dotnet ef syntax: Add-Migration, Update-Database, Remove-Migration, rolling back to an earlier migration, Script-Migration, idempotent scripts, Drop-Database, seeding with HasData and applying migrations at startup.`,
  objectives: [
    `Explain what a migration is and how EF Core compares the model with the ModelSnapshot`,
    `Create and apply migrations with Add-Migration / Update-Database and dotnet ef`,
    `Undo a migration with Remove-Migration and roll the database back to a previous migration`,
    `Generate SQL scripts (normal and idempotent) for production deployment`,
    `Seed initial data with HasData and understand Database.Migrate() vs EnsureCreated()`,
  ],
  theory: [
    {
      heading: `What is a Migration?`,
      content: `Your model changes over time: new tables, new columns, renamed properties. A migration is a C# class that describes one set of schema changes, so the database can be upgraded (or downgraded) step by step, exactly like versions in Git.

Analogy: migrations are like the numbered chapters of a renovation diary. "Chapter 1: build the house. Chapter 2: add a garage. Chapter 3: paint the kitchen." Any new house can be built to today's state by applying all chapters in order, and a chapter can be undone if it was a mistake.`,
      points: [
        `Migrations live in the Migrations folder and are committed to source control`,
        `Each migration has a timestamp prefix, e.g. 20261117101500_AddStudentPhone`,
        `EF Core never guesses from the database: it compares your current model with the last ModelSnapshot`,
        `The database records applied migrations in the table __EFMigrationsHistory`,
      ],
    },
    {
      heading: `Files Created by Add-Migration`,
      content: `Running Add-Migration AddStudentPhone creates or updates three files:`,
      points: [
        `20261117101500_AddStudentPhone.cs - the Up() method (apply changes) and Down() method (undo changes) using MigrationBuilder (CreateTable, AddColumn, DropColumn, RenameColumn, CreateIndex ...)`,
        `20261117101500_AddStudentPhone.Designer.cs - a snapshot of the model at that migration (metadata, do not edit)`,
        `SchoolDbContextModelSnapshot.cs - the latest full model, updated each time; used to calculate the next difference`,
      ],
      tip: `You may edit the Up/Down methods (for example to add migrationBuilder.Sql(...) for data fixes), but never edit the snapshot by hand. Review every generated migration before applying it, especially for DropColumn or DropTable which delete data.`,
    },
    {
      heading: `Command Reference: Package Manager Console vs dotnet CLI`,
      content: `Visual Studio users run PowerShell commands in Tools > NuGet Package Manager > Package Manager Console (needs Microsoft.EntityFrameworkCore.Tools). CLI users run dotnet ef in a terminal in the project folder (needs the dotnet-ef global tool and Microsoft.EntityFrameworkCore.Design). Both do the same job.`,
      syntax: `Package Manager Console                     dotnet CLI
------------------------------------------  ----------------------------------------------
Add-Migration InitialCreate                 dotnet ef migrations add InitialCreate
Update-Database                             dotnet ef database update
Update-Database AddStudentPhone             dotnet ef database update AddStudentPhone
Update-Database 0                           dotnet ef database update 0
Remove-Migration                            dotnet ef migrations remove
Get-Migration                               dotnet ef migrations list
Script-Migration                            dotnet ef migrations script
Script-Migration -Idempotent                dotnet ef migrations script --idempotent
Script-Migration Init AddStudentPhone       dotnet ef migrations script Init AddStudentPhone
Drop-Database                               dotnet ef database drop
Bundle-Migration                            dotnet ef migrations bundle
Get-Help about_EntityFrameworkCore          dotnet ef --help`,
      points: [
        `-Context SchoolDbContext / --context SchoolDbContext: choose the DbContext when the project has more than one`,
        `-Project / -StartupProject (--project / --startup-project): when the DbContext is in a class library`,
        `-OutputDir Data/Migrations (--output-dir): store migrations in another folder`,
        `-Verbose (--verbose): show details when a command fails`,
      ],
    },
    {
      heading: `Remove-Migration and Rolling Back`,
      content: `Remove-Migration deletes the LAST migration files and resets the snapshot. If that migration was already applied to the database, EF Core first reverts it (runs Down) - in recent versions it refuses unless you pass -Force, so the safe order is:

1. Update-Database <PreviousMigrationName>   (database goes back, Down() runs)
2. Remove-Migration                           (files are deleted)

Update-Database 0 reverts ALL migrations (empty database, only __EFMigrationsHistory remains). Never remove a migration that has already been applied on a shared or production database; instead add a new migration that reverses the change.`,
    },
    {
      heading: `Deploying Migrations`,
      content: `On your PC, Update-Database is fine. For production you usually generate SQL and let a DBA or a CI/CD pipeline run it.`,
      points: [
        `Script-Migration -Idempotent: a script that checks __EFMigrationsHistory and applies only missing migrations - safe to run on any version of the database`,
        `Migration bundles (Bundle-Migration / dotnet ef migrations bundle): a self-contained efbundle.exe that applies migrations with a connection string`,
        `context.Database.Migrate() / MigrateAsync() at application startup: simple for small apps and demos, risky when several servers start at once`,
        `EnsureCreated(): creates the database WITHOUT migrations - only for tests or prototypes, and it cannot be combined with migrations later`,
      ],
    },
    {
      heading: `Seeding Data with HasData`,
      content: `HasData in OnModelCreating adds fixed lookup data (courses, departments, roles) as part of a migration. EF generates InsertData/UpdateData/DeleteData calls. Primary key values must be given explicitly. For large or dynamic test data, use code at startup (or UseSeeding/UseAsyncSeeding in EF Core 9+) instead.`,
      syntax: `modelBuilder.Entity<Course>().HasData(
    new Course { CourseId = 1, Title = "BCA" },
    new Course { CourseId = 2, Title = "BCom" });`,
    },
  ],
  examples: [
    {
      title: `InitialCreate: read the migration file and the history table`,
      scenario: `Start the StudentManagement database from scratch and understand every file and table that Add-Migration and Update-Database produce.`,
      steps: [
        `Open the StudentPortal project (Student entity from Day 79)`,
        `If you have older migrations, run Drop-Database in PMC and delete the Migrations folder in Solution Explorer`,
        `Tools > NuGet Package Manager > Package Manager Console`,
        `Run Add-Migration InitialCreate and open Migrations/xxxx_InitialCreate.cs`,
        `Run Update-Database -Verbose and read the SQL in the console`,
        `In SSMS: connect to (localdb)\\MSSQLLocalDB > SchoolDb > New Query > SELECT * FROM __EFMigrationsHistory`,
      ],
      code: `// ===== Migrations/20261117093000_InitialCreate.cs (generated) =====
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentPortal.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Students",
                columns: table => new
                {
                    StudentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RollNo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: false),
                    Course = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Fees = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Students", x => x.StudentId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Students_RollNo",
                table: "Students",
                column: "RollNo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Students");
        }
    }
}

// ===== Package Manager Console =====
PM> Add-Migration InitialCreate
PM> Update-Database -Verbose
// ===== dotnet CLI =====
dotnet ef migrations add InitialCreate
dotnet ef database update --verbose

-- ===== Check in SSMS =====
SELECT * FROM __EFMigrationsHistory;`,
      result: `MigrationId                       | ProductVersion
20261117093000_InitialCreate      | 10.0.0

(Your timestamp and ProductVersion will match your own date and EF Core version.)`,
      explanation: `Up() builds the table and the unique index; Down() drops the table, so the migration can be reverted. "SqlServer:Identity" "1, 1" means IDENTITY(1,1). Update-Database first creates the database if needed, checks __EFMigrationsHistory, runs only migrations that are not recorded yet, and inserts one history row per applied migration.`,
    },
    {
      title: `Automatically add a new column: AddStudentPhone`,
      scenario: `The college now needs each student's phone number and admission date. Change the C# class and let a migration alter the existing table without losing data.`,
      steps: [
        `Open Models/Student.cs and add the Phone and AdmissionDate properties`,
        `Save, then in PMC run Add-Migration AddStudentPhone`,
        `Review the Up() and Down() methods`,
        `Run Script-Migration InitialCreate AddStudentPhone to preview the SQL (opens in a new editor tab)`,
        `Run Update-Database`,
        `Refresh dbo.Students > Columns in SQL Server Object Explorer`,
      ],
      code: `// ===== Models/Student.cs (new properties) =====
public string? Phone { get; set; }                       // NULL -> safe for existing rows
public DateTime AdmissionDate { get; set; }              // NOT NULL -> needs a default

// ===== SchoolDbContext.OnModelCreating (inside Entity<Student>) =====
e.Property(s => s.Phone).HasMaxLength(15);
e.Property(s => s.AdmissionDate).HasDefaultValueSql("GETDATE()");

// ===== PMC / CLI =====
PM> Add-Migration AddStudentPhone
dotnet ef migrations add AddStudentPhone

// ===== Migrations/20261117101500_AddStudentPhone.cs =====
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<DateTime>(
        name: "AdmissionDate",
        table: "Students",
        type: "datetime2",
        nullable: false,
        defaultValueSql: "GETDATE()");

    migrationBuilder.AddColumn<string>(
        name: "Phone",
        table: "Students",
        type: "nvarchar(15)",
        maxLength: 15,
        nullable: true);
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropColumn(name: "AdmissionDate", table: "Students");
    migrationBuilder.DropColumn(name: "Phone", table: "Students");
}

-- ===== Script-Migration InitialCreate AddStudentPhone =====
ALTER TABLE [Students] ADD [AdmissionDate] datetime2 NOT NULL DEFAULT (GETDATE());
GO
ALTER TABLE [Students] ADD [Phone] nvarchar(15) NULL;
GO
INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261117101500_AddStudentPhone', N'10.0.0');
GO

PM> Update-Database
dotnet ef database update`,
      result: `Applying migration '20261117101500_AddStudentPhone'.
Done.

dbo.Students now has 10 columns. Existing rows keep their data: Phone is NULL and AdmissionDate is filled with the date/time when the column was added.`,
      explanation: `EF compared the new model with SchoolDbContextModelSnapshot, found two new properties and generated AddColumn calls. A NOT NULL column on a table with rows needs a default, which is why HasDefaultValueSql("GETDATE()") was configured; without it EF uses a default of '0001-01-01T00:00:00'. Script-Migration lets you review the exact SQL before touching the database.`,
    },
    {
      title: `Undo mistakes: Remove-Migration and rolling back`,
      scenario: `You added a migration AddHostelFlag by mistake and already applied it. Roll the database back and delete the migration. Then practise resetting the whole database.`,
      steps: [
        `Add public bool InHostel { get; set; } to Student, run Add-Migration AddHostelFlag and Update-Database (the mistake)`,
        `Remove the InHostel property from Student.cs`,
        `Run Get-Migration to list migrations and see which are applied`,
        `Run Update-Database AddStudentPhone (go back to the previous migration - Down() of AddHostelFlag runs)`,
        `Run Remove-Migration (deletes the AddHostelFlag files and fixes the snapshot)`,
        `Optional full reset: Update-Database 0, then Update-Database`,
      ],
      code: `# ===== Package Manager Console =====
PM> Add-Migration AddHostelFlag
PM> Update-Database

PM> Get-Migration
id                               name            applied
--                               ----            -------
20261117093000_InitialCreate     InitialCreate   True
20261117101500_AddStudentPhone   AddStudentPhone True
20261117104000_AddHostelFlag     AddHostelFlag   True

PM> Update-Database AddStudentPhone
Reverting migration '20261117104000_AddHostelFlag'.
Done.

PM> Remove-Migration
Removing migration '20261117104000_AddHostelFlag'.
Reverting the model snapshot.
Done.

# Full reset (drops all tables created by migrations, then recreates)
PM> Update-Database 0
PM> Update-Database

# Delete the whole database
PM> Drop-Database

# ===== dotnet CLI equivalents =====
dotnet ef migrations list
dotnet ef database update AddStudentPhone
dotnet ef migrations remove
dotnet ef database update 0
dotnet ef database drop --force

-- ===== SQL run by the rollback (Down of AddHostelFlag) =====
ALTER TABLE [Students] DROP COLUMN [InHostel];
DELETE FROM [__EFMigrationsHistory]
WHERE [MigrationId] = N'20261117104000_AddHostelFlag';`,
      result: `After the steps, Get-Migration lists only InitialCreate and AddStudentPhone (both applied), the InHostel column is gone from dbo.Students and the AddHostelFlag files are deleted from the Migrations folder.`,
      explanation: `Update-Database <name> moves the database to exactly that migration, running Down() of every later migration and removing their history rows. Remove-Migration only works on the last migration; if it is still applied it would have to revert it first, so roll back first. On a shared/production database never remove applied migrations - add a new migration that reverses the change instead.`,
    },
    {
      title: `Seed data, idempotent scripts and migrating at startup`,
      scenario: `Seed fixed courses into the database, produce a SQL script for the DBA who deploys to production, and optionally apply migrations automatically when the app starts in Development.`,
      steps: [
        `Add the Course entity and HasData seed code to SchoolDbContext`,
        `PMC: Add-Migration SeedCourses, then Update-Database`,
        `Run Script-Migration -Idempotent -Output deploy.sql (CLI: dotnet ef migrations script --idempotent -o deploy.sql) and give deploy.sql to the DBA`,
        `Add the Migrate() block in Program.cs for local development`,
        `Press Ctrl+F5 - pending migrations are applied before the first request`,
      ],
      code: `// ===== Models/Course.cs =====
public class Course
{
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int DurationYears { get; set; }
}

// ===== SchoolDbContext =====
public DbSet<Course> Courses => Set<Course>();

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // ... Student configuration from earlier ...
    modelBuilder.Entity<Course>(e =>
    {
        e.Property(c => c.Title).HasMaxLength(60);
        e.HasData(
            new Course { CourseId = 1, Title = "BCA",  DurationYears = 3 },
            new Course { CourseId = 2, Title = "BSc",  DurationYears = 3 },
            new Course { CourseId = 3, Title = "MCA",  DurationYears = 2 });
    });
}

// ===== Generated in Migrations/xxxx_SeedCourses.cs (Up) =====
migrationBuilder.InsertData(
    table: "Courses",
    columns: new[] { "CourseId", "DurationYears", "Title" },
    values: new object[,]
    {
        { 1, 3, "BCA" },
        { 2, 3, "BSc" },
        { 3, 2, "MCA" }
    });

# ===== Commands =====
PM> Add-Migration SeedCourses
PM> Update-Database
PM> Script-Migration -Idempotent -Output deploy.sql
dotnet ef migrations add SeedCourses
dotnet ef database update
dotnet ef migrations script --idempotent -o deploy.sql
dotnet ef migrations bundle --self-contained -r win-x64      # creates efbundle.exe
.\\efbundle.exe --connection "Server=PRODSQL;Database=SchoolDb;..."

-- ===== Part of deploy.sql (idempotent) =====
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261117110000_SeedCourses'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'CourseId', N'DurationYears', N'Title') AND [object_id] = OBJECT_ID(N'[Courses]'))
        SET IDENTITY_INSERT [Courses] ON;
    INSERT INTO [Courses] ([CourseId], [DurationYears], [Title])
    VALUES (1, 3, N'BCA'), (2, 3, N'BSc'), (3, 2, N'MCA');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'CourseId', N'DurationYears', N'Title') AND [object_id] = OBJECT_ID(N'[Courses]'))
        SET IDENTITY_INSERT [Courses] OFF;
END;
GO

// ===== Program.cs (after var app = builder.Build();) =====
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<SchoolDbContext>();
    await db.Database.MigrateAsync();      // applies any pending migrations
}`,
      result: `SELECT * FROM Courses in SSMS:
CourseId | Title | DurationYears
1        | BCA   | 3
2        | BSc   | 3
3        | MCA   | 2

deploy.sql can be run several times; each block is skipped if its MigrationId is already in __EFMigrationsHistory.`,
      explanation: `HasData seeds become InsertData calls in a migration, with explicit keys (IDENTITY_INSERT is switched on automatically). The idempotent script wraps every migration in IF NOT EXISTS checks so it is safe for any database version. MigrateAsync is convenient in development; in production prefer scripts or bundles executed by the deployment pipeline. Never mix EnsureCreated with migrations.`,
    },
  ],
  interview: [
    { q: `What is a migration in EF Core?`, a: `A versioned C# class (Up and Down methods) that describes schema changes between two versions of the model, used to create and update the database incrementally.`, level: 'Easy' },
    { q: `What does Add-Migration do?`, a: `It compares the current model with the ModelSnapshot, generates a new migration class with the differences, a Designer file and updates the snapshot. It does not touch the database.`, level: 'Easy' },
    { q: `What does Update-Database do?`, a: `Builds the project, creates the database if needed, reads __EFMigrationsHistory and applies all pending migrations (or migrates up/down to a named target), recording each one in the history table.`, level: 'Easy' },
    { q: `What is __EFMigrationsHistory?`, a: `A table EF Core creates to store the MigrationId and ProductVersion of every applied migration, so it knows which migrations are pending.`, level: 'Easy' },
    { q: `What is the ModelSnapshot used for?`, a: `It is the full model as of the latest migration. The next Add-Migration diffs the current model against it, so EF never needs to read the live database to create migrations.`, level: 'Medium' },
    { q: `How do you undo the last migration that has already been applied locally?`, a: `Run Update-Database <PreviousMigration> (dotnet ef database update <PreviousMigration>) to revert it, then Remove-Migration (dotnet ef migrations remove) to delete the files.`, level: 'Medium' },
    { q: `What does Update-Database 0 do?`, a: `Reverts all migrations by running every Down() method, leaving an empty database (except the history table).`, level: 'Medium' },
    { q: `What is an idempotent migration script?`, a: `A SQL script generated with Script-Migration -Idempotent / --idempotent that checks __EFMigrationsHistory before each migration, so it can be run safely against a database at any migration level.`, level: 'Medium' },
    { q: `EnsureCreated vs Migrate?`, a: `EnsureCreated creates the schema directly from the model without migrations and does nothing if the database exists - good for tests/prototypes. Migrate applies migrations and supports incremental changes. Do not combine them.`, level: 'Hard' },
    { q: `Why is calling Migrate() at startup risky in production?`, a: `Multiple instances may run migrations simultaneously, the app needs ALTER permissions, failures happen at startup and there is no review step. Use scripts or bundles in the deployment pipeline instead.`, level: 'Hard' },
    { q: `How do you rename a column without losing data?`, a: `Rename the property; EF usually generates RenameColumn. If it generates DropColumn + AddColumn, edit the migration to use migrationBuilder.RenameColumn, or configure HasColumnName to keep the old column name.`, level: 'Hard' },
    { q: `How do you run migrations when the DbContext is in a separate class library?`, a: `Use -Project <DataProject> -StartupProject <WebProject> in PMC, or --project and --startup-project with dotnet ef. The startup project provides configuration and the connection string.`, level: 'Hard' },
    { q: `What is a migration bundle?`, a: `An executable (efbundle) created with dotnet ef migrations bundle / Bundle-Migration that applies migrations to a database given a connection string, without needing the .NET SDK or source code on the server.`, level: 'Medium' },
  ],
  practice: [
    {
      task: `Add a Gender property (string?, max 10) to Student and create/apply migration AddGender. Write the generated ALTER TABLE statement.`,
      hint: `Configure HasMaxLength(10).`,
      solution: `PM> Add-Migration AddGender
PM> Update-Database
-- SQL: ALTER TABLE [Students] ADD [Gender] nvarchar(10) NULL;`,
    },
    {
      task: `Roll back AddGender and delete it, using dotnet CLI commands only.`,
      hint: `First move the database to the previous migration.`,
      solution: `dotnet ef database update AddStudentPhone
dotnet ef migrations remove`,
    },
    {
      task: `Seed three departments (1 Science, 2 Commerce, 3 Arts) with HasData and create the migration SeedDepartments.`,
      hint: `Keys must be specified.`,
      solution: `modelBuilder.Entity<Department>().HasData(
    new Department { DepartmentId = 1, Name = "Science" },
    new Department { DepartmentId = 2, Name = "Commerce" },
    new Department { DepartmentId = 3, Name = "Arts" });
// PM> Add-Migration SeedDepartments ; Update-Database`,
    },
    {
      task: `Generate an idempotent SQL script of all migrations into Scripts/full.sql.`,
      hint: `-Idempotent and -Output.`,
      solution: `PM> Script-Migration -Idempotent -Output Scripts/full.sql
dotnet ef migrations script --idempotent -o Scripts/full.sql`,
    },
    {
      task: `Rename the Student property Course to CourseName and make sure the migration keeps data.`,
      hint: `Inspect the generated migration - it should contain RenameColumn.`,
      solution: `PM> Add-Migration RenameCourseColumn
// Up(): migrationBuilder.RenameColumn(name: "Course", table: "Students", newName: "CourseName");
// If it shows DropColumn/AddColumn, replace them with RenameColumn before Update-Database.`,
    },
  ],
  quiz: [
    { question: `Which file does Add-Migration use to find what changed?`, options: [`The live database schema`, `appsettings.json`, `The ModelSnapshot`, `__EFMigrationsHistory`], answer: 2, explanation: `The current model is compared with the ModelSnapshot.` },
    { question: `The dotnet CLI equivalent of Update-Database is:`, options: [`dotnet ef database update`, `dotnet ef migrations apply`, `dotnet migrate`, `dotnet ef update-database`], answer: 0, explanation: `dotnet ef database update applies pending migrations.` },
    { question: `Which method in a migration undoes its changes?`, options: [`Up()`, `Revert()`, `Rollback()`, `Down()`], answer: 3, explanation: `Down() reverses what Up() did.` },
    { question: `What does Remove-Migration delete?`, options: [`The whole database`, `The last migration's files (and updates the snapshot)`, `All migrations`, `The __EFMigrationsHistory table`], answer: 1, explanation: `Only the most recent migration is removed.` },
    { question: `Which option makes a migration script safe to run on any database version?`, options: [`-Verbose`, `-Force`, `-Idempotent`, `-Context`], answer: 2, explanation: `Idempotent scripts check the history table before applying each migration.` },
  ],
};
