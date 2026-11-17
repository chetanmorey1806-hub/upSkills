export default {
  id: 'day-082-ef-core-relationships',
  title: `Relationships: One-to-One, One-to-Many, Many-to-Many`,
  module: `Module 7: Entity Framework Core & Database Connectivity`,
  day: 82,
  level: `Intermediate`,
  duration: `3 hours`,
  summary: `Real databases are made of related tables. Learn how EF Core maps C# navigation properties and foreign keys to SQL Server relationships: one-to-one (Student - StudentProfile), one-to-many (Department - Students) and many-to-many (Students - Courses), both with an automatic join table and with an explicit Enrollment entity that stores extra data. You will create the migration, read the generated CREATE TABLE and FOREIGN KEY SQL, insert a whole object graph with one SaveChanges, query related data and control what happens on delete (Cascade, Restrict, SetNull).`,
  objectives: [
    `Identify principal and dependent entities, foreign keys and navigation properties`,
    `Model one-to-one, one-to-many and many-to-many relationships by convention and with HasOne/WithMany/WithOne/HasMany`,
    `Choose between an automatic many-to-many join table and an explicit join entity with payload`,
    `Insert and query related data (object graphs, Include) and read the generated SQL`,
    `Configure delete behavior: Cascade, Restrict/NoAction, SetNull and ClientSetNull`,
  ],
  theory: [
    {
      heading: `Relationship Vocabulary`,
      content: `A relationship links rows of two tables through a foreign key (FK). EF Core describes it with these terms:`,
      points: [
        `Principal entity - the "parent" that holds the primary key being referenced (Department)`,
        `Dependent entity - the "child" that holds the foreign key column (Student.DepartmentId)`,
        `Foreign key property - the C# property that stores the parent's key (int DepartmentId)`,
        `Reference navigation - a property pointing to ONE related object (Student.Department)`,
        `Collection navigation - a property holding MANY related objects (Department.Students)`,
        `Required relationship - FK is non-nullable (int); optional relationship - FK is nullable (int?)`,
      ],
      tip: `Analogy: a Department is a class teacher's register, each Student row carries the register number (FK). The register (principal) can exist without students; a student (dependent) must point to a register if the relationship is required.`,
    },
    {
      heading: `One-to-Many (most common)`,
      content: `One Department has many Students; each Student belongs to one Department. Put a collection navigation on the principal and a reference navigation plus FK property on the dependent. EF Core discovers everything by convention: the property DepartmentId matches the principal's key name, so it becomes the FK, and an index IX_Students_DepartmentId is created automatically.`,
      syntax: `public class Department
{
    public int DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Student> Students { get; set; } = new();     // collection navigation
}

public class Student
{
    public int StudentId { get; set; }
    public int DepartmentId { get; set; }                     // FK (required because int)
    public Department Department { get; set; } = null!;       // reference navigation
}

// Fluent API (optional - same as the convention)
modelBuilder.Entity<Student>()
    .HasOne(s => s.Department)
    .WithMany(d => d.Students)
    .HasForeignKey(s => s.DepartmentId);`,
      points: [
        `Generated SQL: [DepartmentId] int NOT NULL + CONSTRAINT FK_Students_Departments_DepartmentId FOREIGN KEY ... REFERENCES Departments`,
        `= null! tells the compiler "EF will fill this"; it removes the nullable warning`,
        `Initialise collections (= new()) so Add() never throws NullReferenceException`,
        `If you omit the FK property, EF creates a "shadow" FK column DepartmentId anyway`,
      ],
    },
    {
      heading: `One-to-One`,
      content: `One Student has at most one StudentProfile (address, guardian, photo) and a profile belongs to exactly one student. Splitting rarely used or large columns into a second table keeps the main table small. For one-to-one EF cannot guess which side is the dependent, so state it with HasForeignKey<T>. EF then creates a UNIQUE index on the FK, which is what makes it "one" and not "many".`,
      syntax: `public class StudentProfile
{
    public int StudentProfileId { get; set; }
    public int StudentId { get; set; }                 // FK + unique index
    public string Address { get; set; } = string.Empty;
    public string? GuardianName { get; set; }
    public Student Student { get; set; } = null!;
}
// in Student: public StudentProfile? Profile { get; set; }   (optional - a student may have no profile)

modelBuilder.Entity<Student>()
    .HasOne(s => s.Profile)
    .WithOne(p => p.Student)
    .HasForeignKey<StudentProfile>(p => p.StudentId);`,
    },
    {
      heading: `Many-to-Many: Automatic Join Table`,
      content: `A Student takes many Courses and a Course has many Students. A relational database needs a third "join" table for this. Since EF Core 5, if both classes have collection navigations to each other (skip navigations), EF creates the join table for you - you never write a class for it.`,
      syntax: `public class Student { ... public List<Course> Courses { get; set; } = new(); }
public class Course  { ... public List<Student> Students { get; set; } = new(); }

// generated join table: CourseStudent (CoursesCourseId, StudentsStudentId) - composite PK, two FKs
// rename it:
modelBuilder.Entity<Student>()
    .HasMany(s => s.Courses)
    .WithMany(c => c.Students)
    .UsingEntity(j => j.ToTable("StudentCourses"));

// usage
asha.Courses.Add(csharpCourse);      // inserts a row in the join table
await db.SaveChangesAsync();`,
    },
    {
      heading: `Many-to-Many with a Join Entity (payload)`,
      content: `Usually the link itself has data: the date of enrollment, the grade, the fees paid. Then create an explicit join entity (Enrollment) with two one-to-many relationships: Student 1-* Enrollment *-1 Course. The primary key is the composite (StudentId, CourseId), so a student cannot enroll in the same course twice.`,
      syntax: `public class Enrollment
{
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public DateOnly EnrolledOn { get; set; }
    public string? Grade { get; set; }
}

modelBuilder.Entity<Enrollment>().HasKey(e => new { e.StudentId, e.CourseId });`,
      tip: `You can combine both styles: keep skip navigations (Student.Courses) AND the Enrollment entity by using HasMany(...).WithMany(...).UsingEntity<Enrollment>(...). Then simple code uses Courses and reports use Enrollments.`,
    },
    {
      heading: `Delete Behavior`,
      content: `What happens to dependents when the principal is deleted? EF Core sets a default and writes it into the FK as ON DELETE ...`,
      points: [
        `Cascade (default for required relationships) - deleting the student also deletes his profile and enrollments (ON DELETE CASCADE)`,
        `ClientSetNull (default for optional relationships) - EF sets FKs of loaded dependents to NULL; the database uses NO ACTION`,
        `SetNull - the database sets the FK to NULL (FK must be nullable)`,
        `Restrict / NoAction - deleting a department that still has students fails with an FK error (ON DELETE NO ACTION)`,
        `SQL Server refuses multiple cascade paths to the same table - switch one of them to Restrict/NoAction`,
      ],
      syntax: `modelBuilder.Entity<Student>()
    .HasOne(s => s.Department).WithMany(d => d.Students)
    .OnDelete(DeleteBehavior.Restrict);   // never lose students by deleting a department`,
    },
    {
      heading: `Working with Related Data`,
      content: `Related objects can be inserted together (an "object graph"): add the parent with children in its collections and one SaveChanges inserts parents first, reads their identity values, then inserts children with the correct FKs. When querying, related data is NOT loaded automatically - use Include / ThenInclude (eager loading) or projection with Select. Day 84 covers loading strategies in depth.`,
      syntax: `// insert graph
var it = new Department { Name = "IT" };
it.Students.Add(new Student { RollNo = "R101", FullName = "Asha Patil" });
db.Departments.Add(it);
await db.SaveChangesAsync();        // INSERT Departments, then INSERT Students with DepartmentId

// add a child to an existing parent by FK only (no load needed)
db.Students.Add(new Student { RollNo = "R104", FullName = "Kiran Rao", DepartmentId = 1 });

// query with related data
var depts = await db.Departments.Include(d => d.Students).ToListAsync();
var cards = await db.Students
    .Select(s => new { s.FullName, Dept = s.Department.Name, Courses = s.Enrollments.Count })
    .ToListAsync();`,
    },
  ],
  examples: [
    {
      title: `Model Department, Student, StudentProfile, Course and Enrollment in StudentPortal`,
      scenario: `Turn the single Students table of StudentPortal into a real college schema: students belong to a department (1-*), may have one profile (1-1) and enroll in many courses with a grade (*-* through Enrollment).`,
      steps: [
        `Open StudentPortal. In Solution Explorer right-click Models > Add > Class and create Department.cs, StudentProfile.cs and Enrollment.cs`,
        `Update Student.cs and Course.cs (Course was created and seeded on Day 80) as shown`,
        `The old text property Student.Course (Day 79) is replaced by real Enrollments: delete it (on a database with real data, copy the values first using migrationBuilder.Sql in the migration)`,
        `Update SchoolDbContext with the new DbSets and the relationship configuration`,
        `Build (Ctrl+Shift+B). Tools > NuGet Package Manager > Package Manager Console`,
        `PM> Add-Migration AddRelationships   (CLI: dotnet ef migrations add AddRelationships)`,
        `PM> Script-Migration AddStudentPhone AddRelationships to read the SQL (CLI: dotnet ef migrations script AddStudentPhone AddRelationships)`,
        `PM> Update-Database   (CLI: dotnet ef database update)`,
        `View > SQL Server Object Explorer > SchoolDb > Tables, or SSMS > SchoolDb > Database Diagrams > New Database Diagram > add all tables to see the relationship lines`,
      ],
      code: `// ===== Models/Department.cs =====
namespace StudentPortal.Models;

public class Department
{
    public int DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Student> Students { get; set; } = new();          // 1 -> many
}

// ===== Models/Student.cs (relationship members added) =====
public class Student
{
    public int StudentId { get; set; }
    public string RollNo { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public decimal Fees { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Phone { get; set; }

    public int DepartmentId { get; set; }                         // FK (required)
    public Department Department { get; set; } = null!;           // many -> 1
    public StudentProfile? Profile { get; set; }                  // 1 -> 0..1
    public List<Enrollment> Enrollments { get; set; } = new();    // many -> many (via Enrollment)
}

// ===== Models/StudentProfile.cs =====
public class StudentProfile
{
    public int StudentProfileId { get; set; }
    public int StudentId { get; set; }                            // FK + UNIQUE
    public string Address { get; set; } = string.Empty;
    public string? GuardianName { get; set; }
    public Student Student { get; set; } = null!;
}

// ===== Models/Course.cs (from Day 80 + navigation) =====
public class Course
{
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int DurationYears { get; set; }
    public List<Enrollment> Enrollments { get; set; } = new();
}

// ===== Models/Enrollment.cs (join entity with payload) =====
public class Enrollment
{
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public DateOnly EnrolledOn { get; set; }
    public string? Grade { get; set; }
}

// ===== Data/SchoolDbContext.cs =====
using Microsoft.EntityFrameworkCore;
using StudentPortal.Models;

namespace StudentPortal.Data;

public class SchoolDbContext : DbContext
{
    public SchoolDbContext(DbContextOptions<SchoolDbContext> options) : base(options) { }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ... Student / Course property configuration from Days 79-80 stays here ...

        modelBuilder.Entity<Department>(e =>
        {
            e.Property(d => d.Name).HasMaxLength(60);
            e.HasData(new Department { DepartmentId = 1, Name = "IT" },
                      new Department { DepartmentId = 2, Name = "Commerce" });
        });

        // One-to-many: Department 1 - * Student
        modelBuilder.Entity<Student>()
            .HasOne(s => s.Department)
            .WithMany(d => d.Students)
            .HasForeignKey(s => s.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // One-to-one: Student 1 - 0..1 StudentProfile
        modelBuilder.Entity<Student>()
            .HasOne(s => s.Profile)
            .WithOne(p => p.Student)
            .HasForeignKey<StudentProfile>(p => p.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<StudentProfile>(e =>
        {
            e.Property(p => p.Address).HasMaxLength(200);
            e.Property(p => p.GuardianName).HasMaxLength(100);
        });

        // Many-to-many through Enrollment
        modelBuilder.Entity<Enrollment>(e =>
        {
            e.HasKey(x => new { x.StudentId, x.CourseId });           // composite PK
            e.HasOne(x => x.Student).WithMany(s => s.Enrollments).HasForeignKey(x => x.StudentId);
            e.HasOne(x => x.Course).WithMany(c => c.Enrollments).HasForeignKey(x => x.CourseId);
            e.Property(x => x.Grade).HasMaxLength(2);
            e.Property(x => x.EnrolledOn).HasDefaultValueSql("CAST(GETDATE() AS date)");
        });
    }
}

// ===== Commands =====
PM> Add-Migration AddRelationships
PM> Update-Database
dotnet ef migrations add AddRelationships
dotnet ef database update

-- ===== Generated SQL (main parts) =====
CREATE TABLE [Departments] (
    [DepartmentId] int NOT NULL IDENTITY,
    [Name] nvarchar(60) NOT NULL,
    CONSTRAINT [PK_Departments] PRIMARY KEY ([DepartmentId])
);

ALTER TABLE [Students] DROP COLUMN [Course];
ALTER TABLE [Students] ADD [DepartmentId] int NOT NULL DEFAULT 0;
-- (for existing rows: edit the migration so the default is 1, an existing department, before Update-Database)

CREATE TABLE [StudentProfiles] (
    [StudentProfileId] int NOT NULL IDENTITY,
    [StudentId] int NOT NULL,
    [Address] nvarchar(200) NOT NULL,
    [GuardianName] nvarchar(100) NULL,
    CONSTRAINT [PK_StudentProfiles] PRIMARY KEY ([StudentProfileId]),
    CONSTRAINT [FK_StudentProfiles_Students_StudentId] FOREIGN KEY ([StudentId])
        REFERENCES [Students] ([StudentId]) ON DELETE CASCADE
);

CREATE TABLE [Enrollments] (
    [StudentId] int NOT NULL,
    [CourseId] int NOT NULL,
    [EnrolledOn] date NOT NULL DEFAULT (CAST(GETDATE() AS date)),
    [Grade] nvarchar(2) NULL,
    CONSTRAINT [PK_Enrollments] PRIMARY KEY ([StudentId], [CourseId]),
    CONSTRAINT [FK_Enrollments_Courses_CourseId] FOREIGN KEY ([CourseId])
        REFERENCES [Courses] ([CourseId]) ON DELETE CASCADE,
    CONSTRAINT [FK_Enrollments_Students_StudentId] FOREIGN KEY ([StudentId])
        REFERENCES [Students] ([StudentId]) ON DELETE CASCADE
);

CREATE INDEX [IX_Students_DepartmentId] ON [Students] ([DepartmentId]);
CREATE UNIQUE INDEX [IX_StudentProfiles_StudentId] ON [StudentProfiles] ([StudentId]);
CREATE INDEX [IX_Enrollments_CourseId] ON [Enrollments] ([CourseId]);

ALTER TABLE [Students] ADD CONSTRAINT [FK_Students_Departments_DepartmentId]
    FOREIGN KEY ([DepartmentId]) REFERENCES [Departments] ([DepartmentId]) ON DELETE NO ACTION;`,
      result: `Applying migration '..._AddRelationships'. Done.

SchoolDb now contains Departments, Students, StudentProfiles, Courses, Enrollments and __EFMigrationsHistory. The database diagram shows:
Departments 1 ---- * Students
Students    1 ---- 0..1 StudentProfiles (unique index on StudentId)
Students    1 ---- * Enrollments * ---- 1 Courses`,
      explanation: `Each HasOne/WithMany pair becomes one FOREIGN KEY constraint plus an index on the FK column (EF always indexes FKs for fast joins). The one-to-one gets a UNIQUE index, which the database uses to guarantee "one profile per student". The Enrollment composite primary key (StudentId, CourseId) prevents duplicate enrollments, and its first column also serves as the index for StudentId, so EF only creates IX_Enrollments_CourseId. Restrict on Department becomes ON DELETE NO ACTION. Adding a NOT NULL FK column to a table that already has rows needs a valid default - always review the migration before applying it.`,
    },
    {
      title: `Insert and read a complete object graph (console)`,
      scenario: `Create departments, students, profiles, courses and enrollments with ONE SaveChanges, then print students by department, each student's address (1-1) and each course with its students and grades (*-*).`,
      steps: [
        `In Visual Studio: File > New > Project > Console App > Name: CollegeRelations > .NET 10 (or 8)`,
        `PMC: Install-Package Microsoft.EntityFrameworkCore.SqlServer (CLI: dotnet add package Microsoft.EntityFrameworkCore.SqlServer)`,
        `Add Entities.cs and CollegeContext.cs, replace Program.cs with the code below`,
        `Press Ctrl+F5`,
      ],
      code: `// ===== Entities.cs =====
namespace CollegeRelations;

public class Department
{
    public int DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Student> Students { get; set; } = new();
}

public class Student
{
    public int StudentId { get; set; }
    public string RollNo { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    public StudentProfile? Profile { get; set; }
    public List<Enrollment> Enrollments { get; set; } = new();
}

public class StudentProfile
{
    public int StudentProfileId { get; set; }
    public int StudentId { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? GuardianName { get; set; }
    public Student Student { get; set; } = null!;
}

public class Course
{
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public List<Enrollment> Enrollments { get; set; } = new();
}

public class Enrollment
{
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public string? Grade { get; set; }
}

// ===== CollegeContext.cs =====
using Microsoft.EntityFrameworkCore;

namespace CollegeRelations;

public class CollegeContext : DbContext
{
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer(
            @"Server=(localdb)\\MSSQLLocalDB;Database=CollegeRelDb;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Student>().HasOne(s => s.Department).WithMany(d => d.Students)
          .OnDelete(DeleteBehavior.Restrict);
        mb.Entity<Student>().HasOne(s => s.Profile).WithOne(p => p.Student)
          .HasForeignKey<StudentProfile>(p => p.StudentId);
        mb.Entity<Enrollment>().HasKey(e => new { e.StudentId, e.CourseId });
    }
}

// ===== Program.cs =====
using Microsoft.EntityFrameworkCore;
using CollegeRelations;

using var db = new CollegeContext();
db.Database.EnsureDeleted();     // demo only - fresh database each run
db.Database.EnsureCreated();

var it  = new Department { Name = "IT" };
var com = new Department { Name = "Commerce" };
var csharp = new Course { Title = "C# Programming" };
var sql    = new Course { Title = "SQL Server" };
var acc    = new Course { Title = "Accounting" };

var asha = new Student { RollNo = "R101", FullName = "Asha Patil", Department = it,
    Profile = new StudentProfile { Address = "Pune", GuardianName = "Mr. Patil" } };
var rahul = new Student { RollNo = "R102", FullName = "Rahul Mehta", Department = it };
var neha = new Student { RollNo = "R103", FullName = "Neha Shah", Department = com,
    Profile = new StudentProfile { Address = "Surat", GuardianName = "Mrs. Shah" } };

asha.Enrollments.Add(new Enrollment { Course = csharp, Grade = "A" });
asha.Enrollments.Add(new Enrollment { Course = sql, Grade = "B" });
rahul.Enrollments.Add(new Enrollment { Course = csharp });
neha.Enrollments.Add(new Enrollment { Course = acc, Grade = "A" });
neha.Enrollments.Add(new Enrollment { Course = sql });

db.Students.AddRange(asha, rahul, neha);     // departments, profiles, courses, enrollments are discovered
int rows = db.SaveChanges();
Console.WriteLine($"Rows inserted: {rows}");
db.ChangeTracker.Clear();                    // forget everything, the next queries read from SQL Server

Console.WriteLine("--- One-to-many: Department -> Students ---");
var depts = db.Departments.Include(d => d.Students).OrderBy(d => d.Name).ToList();
foreach (var d in depts)
{
    var names = string.Join(", ", d.Students.OrderBy(s => s.RollNo).Select(s => s.FullName));
    Console.WriteLine($"{d.Name}: {names}");
}

Console.WriteLine("--- One-to-one: Student -> Profile ---");
var students = db.Students.Include(s => s.Profile).OrderBy(s => s.RollNo).ToList();
foreach (var s in students)
    Console.WriteLine($"{s.FullName} -> {s.Profile?.Address ?? "no profile"}");

Console.WriteLine("--- Many-to-many: Course -> Students ---");
var courses = db.Courses
    .Include(c => c.Enrollments).ThenInclude(e => e.Student)
    .OrderBy(c => c.Title)
    .ToList();
foreach (var c in courses)
{
    var list = string.Join(", ", c.Enrollments
        .OrderBy(e => e.Student.RollNo)
        .Select(e => e.Student.FullName + "/" + (e.Grade ?? "-")));
    Console.WriteLine($"{c.Title} ({c.Enrollments.Count}): {list}");
}`,
      result: `Rows inserted: 15
--- One-to-many: Department -> Students ---
Commerce: Neha Shah
IT: Asha Patil, Rahul Mehta
--- One-to-one: Student -> Profile ---
Asha Patil -> Pune
Rahul Mehta -> no profile
Neha Shah -> Surat
--- Many-to-many: Course -> Students ---
Accounting (1): Neha Shah/A
C# Programming (2): Asha Patil/A, Rahul Mehta/-
SQL Server (2): Asha Patil/B, Neha Shah/-`,
      explanation: `Only the three students were passed to AddRange, but EF walks the navigations and also adds 2 departments, 2 profiles, 3 courses and 5 enrollments: 3 + 2 + 2 + 3 + 5 = 15 rows. EF orders the INSERTs automatically (principals first) and copies each new identity into the FK properties of the children. ChangeTracker.Clear() makes the following queries come fresh from the database. Without Include, d.Students would be empty; Include generates a LEFT JOIN, and ThenInclude goes one level deeper (Course -> Enrollments -> Student).`,
    },
    {
      title: `Many-to-many without a join class (skip navigations)`,
      scenario: `For a simple "Teacher teaches Subjects" link that stores no extra data, let EF create and manage the join table automatically.`,
      steps: [
        `Add Teacher.cs and Subject.cs to Models`,
        `Add DbSet<Teacher> Teachers and DbSet<Subject> Subjects to SchoolDbContext`,
        `Optionally rename the join table with UsingEntity (code below)`,
        `PM> Add-Migration TeacherSubjects ; PM> Update-Database (CLI: dotnet ef migrations add TeacherSubjects ; dotnet ef database update)`,
        `Run the sample code in a controller action or the console and check dbo.TeacherSubjects in SSMS`,
      ],
      code: `// ===== Models =====
public class Teacher
{
    public int TeacherId { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Subject> Subjects { get; set; } = new();     // skip navigation
}

public class Subject
{
    public int SubjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public List<Teacher> Teachers { get; set; } = new();     // skip navigation
}

// ===== OnModelCreating (optional: nicer table and column names) =====
modelBuilder.Entity<Teacher>()
    .HasMany(t => t.Subjects)
    .WithMany(s => s.Teachers)
    .UsingEntity<Dictionary<string, object>>(
        "TeacherSubjects",
        r => r.HasOne<Subject>().WithMany().HasForeignKey("SubjectId"),
        l => l.HasOne<Teacher>().WithMany().HasForeignKey("TeacherId"));

-- ===== Generated SQL =====
CREATE TABLE [TeacherSubjects] (
    [SubjectId] int NOT NULL,
    [TeacherId] int NOT NULL,
    CONSTRAINT [PK_TeacherSubjects] PRIMARY KEY ([SubjectId], [TeacherId]),
    CONSTRAINT [FK_TeacherSubjects_Subjects_SubjectId] FOREIGN KEY ([SubjectId]) REFERENCES [Subjects] ([SubjectId]) ON DELETE CASCADE,
    CONSTRAINT [FK_TeacherSubjects_Teachers_TeacherId] FOREIGN KEY ([TeacherId]) REFERENCES [Teachers] ([TeacherId]) ON DELETE CASCADE
);
-- Without UsingEntity the table would be SubjectTeacher (SubjectsSubjectId, TeachersTeacherId)

// ===== Using it =====
var math = new Subject { Title = "Maths" };
var phy  = new Subject { Title = "Physics" };
var mrRao = new Teacher { Name = "Mr. Rao", Subjects = { math, phy } };
var msDas = new Teacher { Name = "Ms. Das", Subjects = { math } };
db.Teachers.AddRange(mrRao, msDas);
await db.SaveChangesAsync();          // 2 teachers + 2 subjects + 3 join rows = 7

// remove a link (deletes ONLY the join row)
var rao = await db.Teachers.Include(t => t.Subjects).FirstAsync(t => t.Name == "Mr. Rao");
rao.Subjects.RemoveAll(s => s.Title == "Physics");
await db.SaveChangesAsync();          // DELETE FROM [TeacherSubjects] WHERE [SubjectId] = @p0 AND [TeacherId] = @p1

var maths = await db.Subjects.Include(s => s.Teachers).FirstAsync(s => s.Title == "Maths");
Console.WriteLine(string.Join(", ", maths.Teachers.Select(t => t.Name).Order()));`,
      result: `SaveChangesAsync returns 7 for the first save.
After removing the Physics link:
Mr. Rao, Ms. Das

SSMS: SELECT * FROM TeacherSubjects shows 2 rows (Maths-Mr. Rao, Maths-Ms. Das). The Physics row in Subjects still exists - only the link was deleted.`,
      explanation: `The join table is a "shared-type entity" (Dictionary<string, object>) managed entirely by EF. Adding an object to Subjects inserts a join row; removing it from the collection (while it is loaded and tracked) deletes the join row, not the subject. Choose this style when the link has no extra columns; as soon as you need EnrolledOn or Grade, switch to an explicit join entity like Enrollment.`,
    },
    {
      title: `Delete behavior in action: Cascade vs Restrict`,
      scenario: `What happens when an admin deletes a student who has a profile and enrollments, or deletes a department that still has students?`,
      steps: [
        `Use the CollegeRelations console app from Example 2 (Department is Restrict, the rest default Cascade)`,
        `Note ChangeTracker.Clear(): if the dependents were still tracked, EF would cascade in memory or throw InvalidOperationException for Restrict before sending SQL`,
        `Append the code below to Program.cs`,
        `Turn on LogTo(Console.WriteLine, LogLevel.Information) in OnConfiguring to see the DELETE statements`,
        `Press Ctrl+F5`,
      ],
      code: `// ===== Append to Program.cs =====
db.ChangeTracker.Clear();   // start clean: nothing loaded, so SQL Server does the cascading

// 1. Delete Asha: profile + 2 enrollments go with her (ON DELETE CASCADE)
var ashaDb = db.Students.Single(s => s.RollNo == "R101");
db.Students.Remove(ashaDb);
db.SaveChanges();
Console.WriteLine($"Profiles left: {db.Set<StudentProfile>().Count()}, Enrollments left: {db.Enrollments.Count()}");

// 2. Try to delete the IT department (Rahul is still in it)
var itDb = db.Departments.Single(d => d.Name == "IT");
db.Departments.Remove(itDb);
try
{
    db.SaveChanges();
}
catch (DbUpdateException ex)
{
    Console.WriteLine("Cannot delete department: " + ex.InnerException?.Message.Split('.')[0]);
}

// ===== Other options (OnModelCreating) =====
// optional FK + SetNull: students without a department are allowed
//   public int? DepartmentId { get; set; }
//   .OnDelete(DeleteBehavior.SetNull);   -> ON DELETE SET NULL
//
// keep history: never cascade-delete enrollments when a course is removed
//   modelBuilder.Entity<Enrollment>().HasOne(e => e.Course).WithMany(c => c.Enrollments)
//       .OnDelete(DeleteBehavior.Restrict);`,
      result: `Profiles left: 1, Enrollments left: 3
Cannot delete department: The DELETE statement conflicted with the REFERENCE constraint "FK_Students_Departments_DepartmentId"`,
      explanation: `Deleting Asha sends one DELETE for the student; SQL Server's ON DELETE CASCADE removes her StudentProfile row and her 2 enrollments (5 - 2 = 3 left, 2 - 1 = 1 profile left). For Restrict/NoAction, SQL Server refuses to delete a department that is still referenced and EF wraps the SQL error 547 in a DbUpdateException. (If the dependents are loaded in the context, EF itself also cascades or throws InvalidOperationException for Restrict before even sending SQL.) In real applications reassign or deactivate first, then delete.`,
    },
    {
      title: `The same relationships in plain T-SQL (SSMS Lab)`,
      scenario: `Understand what EF Core builds by creating the CollegeRelDb tables by hand, querying them with JOINs, and testing the composite key and the foreign key.`,
      steps: [
        `Open SSMS (or the in-app SSMS Lab) > New Query`,
        `Paste the script and press F5 (Execute)`,
        `Read each result grid and the two error messages at the end in the Messages tab`,
      ],
      code: `CREATE DATABASE CollegeRelDb;
GO
USE CollegeRelDb;
GO
CREATE TABLE Departments (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(60) NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    RollNo NVARCHAR(20) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    DepartmentId INT NOT NULL FOREIGN KEY REFERENCES Departments(DepartmentId)
);
CREATE TABLE StudentProfiles (
    StudentProfileId INT IDENTITY(1,1) PRIMARY KEY,
    StudentId INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Students(StudentId),
    Address NVARCHAR(200) NOT NULL,
    GuardianName NVARCHAR(100) NULL
);
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(60) NOT NULL
);
CREATE TABLE Enrollments (
    StudentId INT NOT NULL FOREIGN KEY REFERENCES Students(StudentId),
    CourseId INT NOT NULL FOREIGN KEY REFERENCES Courses(CourseId),
    Grade NVARCHAR(2) NULL,
    PRIMARY KEY (StudentId, CourseId)
);
GO
INSERT INTO Departments (Name) VALUES ('IT'), ('Commerce');
INSERT INTO Students (RollNo, FullName, DepartmentId) VALUES ('R101', 'Asha Patil', 1), ('R102', 'Rahul Mehta', 1), ('R103', 'Neha Shah', 2);
INSERT INTO StudentProfiles (StudentId, Address, GuardianName) VALUES (1, 'Pune', 'Mr. Patil'), (3, 'Surat', 'Mrs. Shah');
INSERT INTO Courses (Title) VALUES ('C# Programming'), ('SQL Server'), ('Accounting');
INSERT INTO Enrollments (StudentId, CourseId, Grade) VALUES (1, 1, 'A'), (1, 2, 'B'), (2, 1, NULL), (3, 3, 'A'), (3, 2, NULL);
GO
SELECT d.Name AS Department, s.RollNo, s.FullName
FROM Departments d
INNER JOIN Students s ON s.DepartmentId = d.DepartmentId
ORDER BY d.Name, s.RollNo;
SELECT s.FullName, ISNULL(p.Address, 'no profile') AS Address
FROM Students s
LEFT JOIN StudentProfiles p ON p.StudentId = s.StudentId
ORDER BY s.RollNo;
SELECT c.Title, s.FullName, ISNULL(e.Grade, '-') AS Grade
FROM Enrollments e
INNER JOIN Students s ON s.StudentId = e.StudentId
INNER JOIN Courses c ON c.CourseId = e.CourseId
ORDER BY c.Title, s.FullName;
INSERT INTO Enrollments (StudentId, CourseId) VALUES (2, 1);
DELETE FROM Departments WHERE DepartmentId = 2;`,
      tsql: `CREATE DATABASE CollegeRelDb;
GO
USE CollegeRelDb;
GO
CREATE TABLE Departments (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(60) NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    RollNo NVARCHAR(20) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    DepartmentId INT NOT NULL FOREIGN KEY REFERENCES Departments(DepartmentId)
);
CREATE TABLE StudentProfiles (
    StudentProfileId INT IDENTITY(1,1) PRIMARY KEY,
    StudentId INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Students(StudentId),
    Address NVARCHAR(200) NOT NULL,
    GuardianName NVARCHAR(100) NULL
);
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(60) NOT NULL
);
CREATE TABLE Enrollments (
    StudentId INT NOT NULL FOREIGN KEY REFERENCES Students(StudentId),
    CourseId INT NOT NULL FOREIGN KEY REFERENCES Courses(CourseId),
    Grade NVARCHAR(2) NULL,
    PRIMARY KEY (StudentId, CourseId)
);
GO
INSERT INTO Departments (Name) VALUES ('IT'), ('Commerce');
INSERT INTO Students (RollNo, FullName, DepartmentId) VALUES ('R101', 'Asha Patil', 1), ('R102', 'Rahul Mehta', 1), ('R103', 'Neha Shah', 2);
INSERT INTO StudentProfiles (StudentId, Address, GuardianName) VALUES (1, 'Pune', 'Mr. Patil'), (3, 'Surat', 'Mrs. Shah');
INSERT INTO Courses (Title) VALUES ('C# Programming'), ('SQL Server'), ('Accounting');
INSERT INTO Enrollments (StudentId, CourseId, Grade) VALUES (1, 1, 'A'), (1, 2, 'B'), (2, 1, NULL), (3, 3, 'A'), (3, 2, NULL);
GO
SELECT d.Name AS Department, s.RollNo, s.FullName
FROM Departments d
INNER JOIN Students s ON s.DepartmentId = d.DepartmentId
ORDER BY d.Name, s.RollNo;
SELECT s.FullName, ISNULL(p.Address, 'no profile') AS Address
FROM Students s
LEFT JOIN StudentProfiles p ON p.StudentId = s.StudentId
ORDER BY s.RollNo;
SELECT c.Title, s.FullName, ISNULL(e.Grade, '-') AS Grade
FROM Enrollments e
INNER JOIN Students s ON s.StudentId = e.StudentId
INNER JOIN Courses c ON c.CourseId = e.CourseId
ORDER BY c.Title, s.FullName;
INSERT INTO Enrollments (StudentId, CourseId) VALUES (2, 1);
DELETE FROM Departments WHERE DepartmentId = 2;`,
      result: `Department | RollNo | FullName
Commerce   | R103   | Neha Shah
IT         | R101   | Asha Patil
IT         | R102   | Rahul Mehta
(3 rows)

FullName    | Address
Asha Patil  | Pune
Rahul Mehta | no profile
Neha Shah   | Surat
(3 rows)

Title          | FullName    | Grade
Accounting     | Neha Shah   | A
C# Programming | Asha Patil  | A
C# Programming | Rahul Mehta | -
SQL Server     | Asha Patil  | B
SQL Server     | Neha Shah   | -
(5 rows)

INSERT INTO Enrollments ... (2, 1) -> Msg 2627: Violation of PRIMARY KEY constraint. Cannot insert duplicate key.
DELETE FROM Departments ... = 2   -> Msg 547: conflicted with the FOREIGN KEY / REFERENCE constraint.`,
      explanation: `These are exactly the structures EF Core generated in Example 1: a FK column on the "many" side, a UNIQUE FK for one-to-one and a join table with a composite primary key for many-to-many. Include(d => d.Students) is translated into a JOIN like the first query, and the 1-1 Include into a LEFT JOIN like the second. Rahul is already enrolled in course 1, so the composite key blocks the duplicate; department 2 still has Neha, so the foreign key blocks the delete (NO ACTION). Real SQL Server names the constraint (e.g. PK__Enrollme__... and FK__Students__Depart__...); the lab prints a shorter message.`,
    },
  ],
  interview: [
    { q: `What is a navigation property?`, a: `A property on an entity that points to related entities: a reference navigation (single object, e.g. Student.Department) or a collection navigation (e.g. Department.Students). EF uses them to build joins and to fix up foreign keys.`, level: 'Easy' },
    { q: `What are principal and dependent entities?`, a: `The principal holds the primary (or alternate) key that is referenced; the dependent holds the foreign key. In Department-Student, Department is principal and Student is dependent.`, level: 'Easy' },
    { q: `How does EF Core discover a foreign key by convention?`, a: `A property named <NavigationName><PrincipalKey>, <PrincipalEntity><PrincipalKey> or <NavigationName>Id / <PrincipalEntity>Id (e.g. DepartmentId) is used as the FK. If none exists, EF creates a shadow FK property.`, level: 'Medium' },
    { q: `How do you configure a one-to-one relationship and why must you specify HasForeignKey<T>?`, a: `HasOne(s => s.Profile).WithOne(p => p.Student).HasForeignKey<StudentProfile>(p => p.StudentId). With one-to-one, both sides have reference navigations, so EF cannot know which table holds the FK unless you specify the dependent type.`, level: 'Medium' },
    { q: `How does EF Core make a one-to-one relationship unique in the database?`, a: `It creates a UNIQUE index on the foreign key column of the dependent (e.g. IX_StudentProfiles_StudentId), so no two profiles can reference the same student.`, level: 'Medium' },
    { q: `What are the two ways to model many-to-many in EF Core?`, a: `1) Skip navigations on both sides (List<Course> / List<Student>) - EF creates and manages the join table automatically (EF Core 5+). 2) An explicit join entity (Enrollment) with two one-to-many relationships, needed when the link has extra data such as grade or date.`, level: 'Medium' },
    { q: `What is a composite key and how do you configure it?`, a: `A primary key made of more than one column, typical for join tables: HasKey(e => new { e.StudentId, e.CourseId }) or [PrimaryKey(nameof(StudentId), nameof(CourseId))] in EF Core 7+.`, level: 'Medium' },
    { q: `What is the default delete behavior for required and optional relationships?`, a: `Required: Cascade (ON DELETE CASCADE). Optional: ClientSetNull - EF nulls FKs of tracked dependents, and the database FK is NO ACTION.`, level: 'Hard' },
    { q: `What is the "multiple cascade paths" error?`, a: `SQL Server refuses a FK with ON DELETE CASCADE if a table could be reached by two cascade paths (or a cycle). Fix it by setting OnDelete(DeleteBehavior.Restrict / NoAction / ClientCascade) on one relationship.`, level: 'Hard' },
    { q: `Are related entities loaded automatically when you query a parent?`, a: `No. EF Core loads only the queried entity. Use Include/ThenInclude (eager), explicit loading (Entry().Collection().Load()), lazy loading proxies, or projection with Select.`, level: 'Easy' },
    { q: `What does = null! mean on a navigation property?`, a: `It is the null-forgiving operator: it tells the compiler the non-nullable property will be set (by EF when loading), suppressing the nullable warning. It does not create an object.`, level: 'Medium' },
    { q: `Output-based: a student with 2 enrollments and a profile is added via db.Students.Add(student) along with 1 new department and 2 new courses. What does SaveChanges return?`, a: `7. SaveChanges counts every inserted row: 1 student + 1 profile + 2 enrollments + 1 department + 2 courses = 7.`, level: 'Medium' },
    { q: `How do you remove a many-to-many link without deleting the course?`, a: `Load the student with Include(s => s.Courses), remove the course from the collection and SaveChanges - only the join row is deleted. With an explicit join entity, remove the Enrollment entity.`, level: 'Medium' },
    { q: `Why initialise collection navigations with = new()?`, a: `So you can call Add() on a new object without a NullReferenceException; EF also reuses the existing collection when it loads data.`, level: 'Easy' },
  ],
  practice: [
    {
      task: `Model a one-to-many relationship between Category and Product (a category has many products). Write the classes and the generated FK constraint.`,
      hint: `List<Product> in Category; CategoryId + Category in Product.`,
      solution: `public class Category { public int CategoryId { get; set; } public string Name { get; set; } = ""; public List<Product> Products { get; set; } = new(); }
public class Product  { public int ProductId { get; set; } public string Name { get; set; } = ""; public int CategoryId { get; set; } public Category Category { get; set; } = null!; }
-- CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([CategoryId]) ON DELETE CASCADE`,
    },
    {
      task: `Model a one-to-one relationship between Employee and EmployeeAddress, where the address is optional.`,
      hint: `HasForeignKey<EmployeeAddress>.`,
      solution: `public class Employee { public int EmployeeId { get; set; } public string Name { get; set; } = ""; public EmployeeAddress? Address { get; set; } }
public class EmployeeAddress { public int EmployeeAddressId { get; set; } public int EmployeeId { get; set; } public string City { get; set; } = ""; public Employee Employee { get; set; } = null!; }
modelBuilder.Entity<Employee>().HasOne(e => e.Address).WithOne(a => a.Employee)
    .HasForeignKey<EmployeeAddress>(a => a.EmployeeId);`,
    },
    {
      task: `Enroll an existing student (id 2) in an existing course (id 3) with grade "B" without loading either entity.`,
      hint: `Add an Enrollment with just the FK values.`,
      solution: `db.Enrollments.Add(new Enrollment { StudentId = 2, CourseId = 3, Grade = "B" });
await db.SaveChangesAsync();   // INSERT INTO [Enrollments] ([CourseId], [StudentId], [Grade]) VALUES (...)`,
    },
    {
      task: `Print every student with their department name and number of courses, using a projection instead of Include.`,
      hint: `Select into an anonymous type; EF translates navigation access into JOINs/subqueries.`,
      solution: `var rows = await db.Students
    .Select(s => new { s.FullName, Dept = s.Department.Name, Courses = s.Enrollments.Count })
    .OrderBy(x => x.FullName)
    .ToListAsync();
foreach (var r in rows) Console.WriteLine($"{r.FullName} | {r.Dept} | {r.Courses}");`,
    },
    {
      task: `Make Student.DepartmentId optional and configure that deleting a department sets the students' DepartmentId to NULL. Name the migration.`,
      hint: `int? and DeleteBehavior.SetNull.`,
      solution: `public int? DepartmentId { get; set; }
public Department? Department { get; set; }
modelBuilder.Entity<Student>().HasOne(s => s.Department).WithMany(d => d.Students)
    .OnDelete(DeleteBehavior.SetNull);
PM> Add-Migration OptionalDepartment ; Update-Database
-- FK becomes ... ON DELETE SET NULL and the column int NULL`,
    },
  ],
  quiz: [
    { question: `In Department (1) - Students (many), which table holds the foreign key?`, options: [`Students`, `Departments`, `A join table`, `Both`], answer: 0, explanation: `The dependent ("many") side holds the FK column DepartmentId.` },
    { question: `What does EF Core add to the FK column of a one-to-one relationship?`, options: [`A CHECK constraint`, `A default value`, `A UNIQUE index`, `Nothing`], answer: 2, explanation: `The unique index guarantees at most one dependent per principal.` },
    { question: `When do you need an explicit join entity for many-to-many?`, options: [`Always`, `When the link stores extra data such as Grade or EnrolledOn`, `Never in EF Core`, `Only with SQLite`], answer: 1, explanation: `Without payload, skip navigations with an automatic join table are enough.` },
    { question: `The default delete behavior for a required relationship is:`, options: [`Restrict`, `SetNull`, `NoAction`, `Cascade`], answer: 3, explanation: `Required relationships cascade by default (ON DELETE CASCADE).` },
    { question: `Which method configures the "many" side starting from the dependent?`, options: [`HasOne(...).WithMany(...)`, `HasKey(...)`, `HasIndex(...)`, `ToTable(...)`], answer: 0, explanation: `HasOne(s => s.Department).WithMany(d => d.Students) describes a one-to-many relationship.` },
  ],
};
