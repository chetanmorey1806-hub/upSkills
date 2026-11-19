export default {
  lesson: 'day-079-code-first-database-first-dbcontext-dbset',
  minutes: 30,
  intro: 'Compare Code First and Database First, write a DbContext with DbSet properties and know the conventions EF Core uses for table names and keys.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Your company already has a large SQL Server database used by other systems. Which approach fits best to start an EF Core project?',
      options: ['Code First with migrations that recreate all tables', 'Database First: scaffold the DbContext and entities from the existing database', 'No ORM is possible', 'Model First with an .edmx designer'],
      answer: 1,
      explain: 'With an existing database, **Database First** (`Scaffold-DbContext` / `dotnet ef dbcontext scaffold`) generates classes from the tables. Code First is best for new projects, where C# classes are the source of truth and migrations create the schema.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the property in `AppDbContext` that exposes the `Student` entity as a queryable table:\n`public ______ Students { get; set; }`',
      example: { title: 'another entity set', code: 'public DbSet<Course> Courses { get; set; }' },
      accept: ['DbSet<Student>'],
      acceptRegex: ['^DbSet<\\s*Student\\s*>$'],
      caseSensitive: true,
      explain: 'Each `DbSet<T>` represents a table you can query (`db.Students.Where(...)`) and add to (`db.Students.Add(...)`). The property name becomes the default table name.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Using EF Core conventions only (no attributes, no Fluent API), what is the **table name** (line 1) and the **primary key column** (line 2) for this entity?',
      example: { title: 'the key convention', code: 'public int Id { get; set; }        // key\npublic int CourseId { get; set; }  // also a key when the class is Course' },
      code: `public class Course
{
    public int CourseId { get; set; }
    public string Title { get; set; }
    public decimal Fee { get; set; }
}

public class AppDbContext : DbContext
{
    public DbSet<Course> Courses { get; set; }
}`,
      expected: `Courses
CourseId`,
      explain: 'The table takes the **DbSet property name** (Courses). A property named `Id` or `<ClassName>Id` becomes the primary key, and an int key is an IDENTITY column by default.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about DbContext are TRUE? (choose all that apply)',
      options: [
        'It derives from Microsoft.EntityFrameworkCore.DbContext',
        'It usually receives DbContextOptions<AppDbContext> through its constructor',
        'OnModelCreating is where Fluent API configuration goes',
        'It is thread-safe, so one instance can serve parallel requests',
        'It represents a unit of work: changes are saved together by SaveChanges',
      ],
      answers: [0, 1, 2, 4],
      explain: 'A DbContext is a **unit of work + repository** combination configured through options and `OnModelCreating`. It is **not** thread-safe, which is why it is scoped per request.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the Package Manager Console command that generates entities and a DbContext from an existing database (Database First):\n`______ "Server=.;Database=College;Trusted_Connection=True;TrustServerCertificate=True" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models`',
      example: { title: 'the .NET CLI version', code: 'dotnet ef dbcontext scaffold "<connection>" Microsoft.EntityFrameworkCore.SqlServer -o Models' },
      accept: ['Scaffold-DbContext'],
      explain: '`Scaffold-DbContext` (PMC) or `dotnet ef dbcontext scaffold` (CLI) reverse-engineers the schema. Re-run it with `-Force` when the database changes - and keep custom code in partial classes so it is not overwritten.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 7,
      q: '**The table Code First creates.** Write the SQL for the `Course` entity above and add data:\n- table `Courses` with `CourseId INT IDENTITY(1,1) PRIMARY KEY`, `Title NVARCHAR(100) NOT NULL`, `Fee DECIMAL(10,2) NOT NULL`\n- insert 2 rows: (`C# Basics`, 4999.00) and (`ASP.NET Core`, 7999.00)',
      example: { title: 'create + insert', code: "CREATE TABLE Cities (\n  CityId INT IDENTITY(1,1) PRIMARY KEY,\n  Name NVARCHAR(50) NOT NULL\n);\nINSERT INTO Cities (Name) VALUES ('Pune'), ('Nagpur');" },
      setup: '-- empty database: the Courses table does not exist yet',
      starter: '-- TODO: CREATE TABLE Courses ... and INSERT 2 rows\n',
      solution: "CREATE TABLE Courses (\n  CourseId INT IDENTITY(1,1) PRIMARY KEY,\n  Title NVARCHAR(100) NOT NULL,\n  Fee DECIMAL(10,2) NOT NULL\n);\nINSERT INTO Courses (Title, Fee) VALUES ('C# Basics', 4999.00), ('ASP.NET Core', 7999.00);\n",
      check: 'SELECT CourseId, Title, Fee FROM Courses ORDER BY CourseId',
      ordered: true,
      explain: 'This is roughly what `Update-Database` runs for the Code First model: `int CourseId` → IDENTITY primary key, `string` → NVARCHAR, `decimal` → DECIMAL. Notice you do not insert `CourseId` yourself - IDENTITY generates 1 and 2.',
    },
  ],
};
