export default {
  lesson: 'day-083-fluent-api-data-annotations-navigation',
  minutes: 30,
  intro: 'Configure the EF Core model with Data Annotations and the Fluent API (keys, lengths, required columns, relationships) and know which one wins.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A property has `[MaxLength(50)]` and in `OnModelCreating` you write `.Property(s => s.Name).HasMaxLength(100)`. What is the column length?',
      options: ['50', '100', 'nvarchar(max)', 'EF Core throws a conflict error'],
      answer: 1,
      explain: 'Precedence is **Fluent API > Data Annotations > conventions**. The Fluent API is applied last, so it overrides the attribute. Keep one style per rule to avoid this confusion.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the Fluent API line that makes `Email` required with a maximum of 120 characters:\n`modelBuilder.Entity<Student>().Property(s => s.Email).______.HasMaxLength(120);`',
      example: { title: 'configuring a decimal', code: 'modelBuilder.Entity<Course>().Property(c => c.Fee).HasPrecision(10, 2);' },
      accept: ['IsRequired()'],
      caseSensitive: true,
      explain: '`IsRequired()` → NOT NULL, `HasMaxLength(120)` → NVARCHAR(120). The Data Annotation equivalent is `[Required, MaxLength(120)]`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which configurations can ONLY be done (or are much easier) with the Fluent API? (choose all that apply)',
      options: ['A composite primary key: HasKey(e => new { e.StudentId, e.CourseId })', 'A unique index: HasIndex(s => s.Email).IsUnique()', 'Delete behaviour: OnDelete(DeleteBehavior.Restrict)', '[Required] on a property', 'Seeding data with HasData(...)'],
      answers: [0, 2, 4],
      explain: 'Composite keys, delete behaviour and seed data need the Fluent API. Unique indexes can also use `[Index(nameof(Email), IsUnique = true)]` on the class (EF Core 5+), and `[Required]` is a simple annotation.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Configure the one-to-many relationship (one Department, many Employees) with the FK `DepartmentId`. Complete the missing call:\n```\nmodelBuilder.Entity<Employee>()\n    .HasOne(e => e.Department)\n    .______(d => d.Employees)\n    .HasForeignKey(e => e.DepartmentId);\n```',
      example: { title: 'a one-to-one', code: '.HasOne(s => s.Profile).WithOne(p => p.Student).HasForeignKey<StudentProfile>(p => p.StudentId);' },
      accept: ['WithMany'],
      caseSensitive: true,
      explain: 'Read it aloud: "an Employee **has one** Department, which **has many** Employees, using DepartmentId". `HasOne/WithMany` for one-to-many, `HasOne/WithOne` for one-to-one, `HasMany/WithMany` for many-to-many.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Based on this configuration, what SQL type and nullability does each column get? Type one line per property as `Name TYPE NULL|NOT NULL` in the given order (`Code`, `Title`, `Fee`).',
      example: { title: 'reading attributes', code: '[Required, MaxLength(10)] string Pin  →  Pin NVARCHAR(10) NOT NULL' },
      code: `public class Course
{
    public int Id { get; set; }

    [MaxLength(10)]
    public string? Code { get; set; }

    [Required, MaxLength(30)]
    public string Title { get; set; } = "";

    public decimal Fee { get; set; }
}

// OnModelCreating
modelBuilder.Entity<Course>().Property(c => c.Title).HasMaxLength(80);
modelBuilder.Entity<Course>().Property(c => c.Fee).HasPrecision(10, 2);`,
      expected: `Code NVARCHAR(10) NULL
Title NVARCHAR(80) NOT NULL
Fee DECIMAL(10,2) NOT NULL`,
      explain: '`string?` is nullable; `[Required]` makes Title NOT NULL and the Fluent `HasMaxLength(80)` overrides `[MaxLength(30)]`. A non-nullable `decimal` is NOT NULL, and `HasPrecision(10, 2)` sets DECIMAL(10,2) (without it EF warns and uses decimal(18,2)).',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 7,
      q: '**The table this Fluent configuration creates.** Write `CREATE TABLE Employees` matching:\n- `Id INT IDENTITY(1,1)` primary key\n- `Name NVARCHAR(60) NOT NULL`\n- `Email NVARCHAR(120) NOT NULL` and **UNIQUE**\n- `Salary DECIMAL(10,2) NOT NULL`\n\nThen insert (`Asha`, `asha@corp.in`, 55000) and (`Ravi`, `ravi@corp.in`, 48000).',
      example: { title: 'a unique column', code: 'Code NVARCHAR(10) NOT NULL UNIQUE' },
      setup: '-- empty database',
      starter: '-- TODO: CREATE TABLE Employees (...); INSERT ...\n',
      solution: "CREATE TABLE Employees (\n  Id INT IDENTITY(1,1) PRIMARY KEY,\n  Name NVARCHAR(60) NOT NULL,\n  Email NVARCHAR(120) NOT NULL UNIQUE,\n  Salary DECIMAL(10,2) NOT NULL\n);\nINSERT INTO Employees (Name, Email, Salary) VALUES ('Asha', 'asha@corp.in', 55000), ('Ravi', 'ravi@corp.in', 48000);\n",
      check: 'SELECT Id, Name, Email, Salary FROM Employees ORDER BY Id',
      ordered: true,
      explain: '`IsRequired()` → NOT NULL, `HasMaxLength` → NVARCHAR(n), `HasIndex(e => e.Email).IsUnique()` → a unique index, `HasPrecision(10,2)` → DECIMAL(10,2). Looking at the generated SQL is the best way to check your model configuration.',
    },
  ],
};
