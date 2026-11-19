export default {
  lesson: 'day-078-introduction-to-ef-core',
  minutes: 30,
  intro: 'Understand what an ORM does, how EF Core turns LINQ into SQL through a provider, and how DbContext tracks changes until SaveChanges.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does an **ORM** like Entity Framework Core do?',
      options: ['It designs the UI for database apps', 'It maps C# classes and objects to database tables and rows, and translates LINQ into SQL', 'It replaces SQL Server', 'It is a backup tool'],
      answer: 1,
      explain: 'Object-Relational Mapping removes most hand-written ADO.NET code: a `Student` class maps to a `Students` table, and `db.Students.Where(...)` becomes a SQL `SELECT ... WHERE`. You still need SQL knowledge to understand and tune what it generates.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about EF Core are TRUE? (choose all that apply)',
      options: [
        'Database providers (SqlServer, Sqlite, PostgreSQL...) are separate NuGet packages',
        'Queries are executed when you enumerate them (ToList, First, foreach), not when you write Where',
        'DbContext tracks loaded entities and SaveChanges writes the changes as INSERT/UPDATE/DELETE',
        'EF Core only works with SQL Server',
        'A DbContext instance should live for the whole lifetime of the app as a singleton',
      ],
      answers: [0, 1, 2],
      explain: 'EF Core is provider-based (Microsoft.EntityFrameworkCore.SqlServer for SQL Server). LINQ queries are **deferred** until enumerated. The change tracker records modifications for `SaveChanges`. DbContext is short-lived: one per request (Scoped).',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the registration that makes `AppDbContext` use SQL Server with the "Default" connection string:\n```\nbuilder.Services.AddDbContext<AppDbContext>(options =>\n    options.______(builder.Configuration.GetConnectionString("Default")));\n```',
      example: { title: 'another provider', code: 'options.UseSqlite("Data Source=app.db")' },
      accept: ['UseSqlServer'],
      caseSensitive: true,
      explain: '`UseSqlServer` comes from the **Microsoft.EntityFrameworkCore.SqlServer** package. `GetConnectionString("Default")` reads `ConnectionStrings:Default` from configuration.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'This LINQ query runs on the `Students` table below. What does it print?\n\n| Name | City | Marks |\n|---|---|---|\n| Asha | Pune | 88 |\n| Ravi | Nagpur | 54 |\n| Meera | Pune | 91 |\n| Kiran | Pune | 60 |',
      example: { title: 'reading a LINQ chain', code: 'db.Products.Where(p => p.Price > 100)  // WHERE Price > 100\n           .Select(p => p.Name)        // SELECT Name' },
      code: `var names = db.Students
    .Where(s => s.City == "Pune" && s.Marks > 60)
    .OrderBy(s => s.Name)
    .Select(s => s.Name)
    .ToList();

Console.WriteLine(string.Join(", ", names));
Console.WriteLine(names.Count);`,
      expected: `Asha, Meera
2`,
      explain: 'Kiran has exactly 60, and `> 60` excludes him. The remaining Pune students are sorted by name: Asha, Meera. EF Core runs all of this as **one** SQL query when `ToList()` is called.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 6,
      q: '**Write the SQL EF Core generates.** For the LINQ query in the previous task (`City == "Pune" && Marks > 60`, ordered by Name, selecting Name) write the equivalent T-SQL query returning the `Name` column.',
      example: { title: 'LINQ → SQL', code: 'db.Courses.Where(c => c.Fee < 5000).OrderBy(c => c.Title).Select(c => c.Title)\n-- becomes\nSELECT Title FROM Courses WHERE Fee < 5000 ORDER BY Title;' },
      setup: `CREATE TABLE Students (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50) NOT NULL,
  City NVARCHAR(30),
  Marks INT
);
INSERT INTO Students (Name, City, Marks) VALUES
('Asha', 'Pune', 88), ('Ravi', 'Nagpur', 54), ('Meera', 'Pune', 91), ('Kiran', 'Pune', 60);`,
      starter: '-- TODO\nSELECT Name FROM Students;\n',
      solution: "SELECT Name\nFROM Students\nWHERE City = 'Pune' AND Marks > 60\nORDER BY Name;\n",
      ordered: true,
      explain: '`Where` → WHERE, `&&` → AND, `OrderBy` → ORDER BY, `Select(s => s.Name)` → only that column. Selecting just the columns you need (projection) makes EF queries faster than loading whole entities.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'How many rows are in the `Students` table after this code runs? (It started with **4** rows.)',
      example: { title: 'nothing is saved until SaveChanges', code: 'db.Students.Add(s);   // only tracked ("Added")\ndb.SaveChanges();     // INSERT is sent now' },
      code: `using var db = new AppDbContext();

db.Students.Add(new Student { Name = "Sana", City = "Delhi", Marks = 77 });
db.Students.Add(new Student { Name = "Rohit", City = "Pune", Marks = 65 });
db.SaveChanges();

db.Students.Add(new Student { Name = "Tara", City = "Goa", Marks = 70 });
// the program ends here without calling SaveChanges again

Console.WriteLine(new AppDbContext().Students.Count());`,
      expected: '6',
      explain: '`Add` only marks the entity as **Added** in the change tracker. The first `SaveChanges` inserts Sana and Rohit (4 + 2 = 6). Tara was never saved, so a fresh context counts 6 rows. Forgetting `SaveChanges` is the #1 "my data was not saved" bug.',
    },
  ],
};
