const STUDENTS = `CREATE TABLE Students (StudentId INT PRIMARY KEY, Name NVARCHAR(50), City NVARCHAR(30), Marks INT);
INSERT INTO Students VALUES (1, 'Asha', 'Pune', 91), (2, 'Ravi', 'Nagpur', 67), (3, 'Meera', 'Pune', 78), (4, 'Kiran', 'Pune', 55), (5, 'Zoya', 'Delhi', 88);`;

export default {
  lesson: 'extra-51-ef-core-raw-sql-stored-procedures',
  minutes: 30,
  intro: 'Run raw SQL and stored procedures from EF Core safely with FromSql, ExecuteSql and SqlQuery, always using parameters.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: '`var city = Request.Query["city"];` Which EF Core call is **safe** from SQL injection?',
      options: [
        '`db.Students.FromSqlRaw("SELECT * FROM Students WHERE City = \'" + city + "\'")`',
        '`db.Students.FromSql($"SELECT * FROM Students WHERE City = {city}")`',
        '`db.Students.FromSqlRaw($"SELECT * FROM Students WHERE City = \'{city}\'")`',
        'All of them are safe',
      ],
      answer: 1,
      explain: '`FromSql` (and `FromSqlInterpolated`) take a `FormattableString` and turn each `{city}` into a **DbParameter**. `FromSqlRaw` with concatenation or interpolation pastes the text directly into the SQL, so input like `x\' OR 1=1 --` changes the query.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'This is the raw SQL you will pass to `db.Students.FromSql(...)`. Write the query: all columns (`StudentId, Name, City, Marks`) of students from **Pune** with **Marks ≥ 60**, highest marks first.',
      example: { title: 'the C# side', code: `var city = "Pune"; var min = 60;
var list = await db.Students
    .FromSql($"SELECT StudentId, Name, City, Marks FROM Students WHERE City = {city} AND Marks >= {min}")
    .OrderByDescending(s => s.Marks)
    .ToListAsync();` },
      setup: STUDENTS,
      starter: 'SELECT StudentId, Name, City, Marks FROM Students;\n',
      solution: "SELECT StudentId, Name, City, Marks\nFROM Students\nWHERE City = 'Pune' AND Marks >= 60\nORDER BY Marks DESC;",
      ordered: true,
      explain: 'Asha (91) and Meera (78) qualify; Kiran (55) is below 60. For `FromSql` on an entity, the SQL must return **all** columns of the entity with matching names. EF can compose further LINQ (like OrderBy) on top of it.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Call the stored procedure \`usp_GetStudentsByCity\` with a parameter from EF Core:
\`var list = await db.Students.FromSql($"EXEC usp_GetStudentsByCity ______").ToListAsync();\`
(use the C# variable \`city\`)`,
      example: { title: 'a non-query procedure', code: 'await db.Database.ExecuteSqlAsync($"EXEC usp_ArchiveOldOrders {cutoffDate}");' },
      accept: ['{city}', '@City = {city}', '@city = {city}'],
      acceptRegex: ['^(@\\w+\\s*=\\s*)?\\{\\s*city\\s*\\}$'],
      caseSensitive: true,
      explain: 'Inside an interpolated `FromSql` string, `{city}` becomes a parameter (`@p0`). Never wrap it in quotes (`\'{city}\'`): the parameter is already a string value, and quotes would turn it into the literal text "@p0".',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Match the EF Core API to its use. Which statements are TRUE? Select all that apply.',
      options: ['`FromSql` returns entities (`IQueryable<Student>`) that can be tracked and composed with LINQ', '`Database.ExecuteSqlAsync` runs INSERT/UPDATE/DELETE or procedures and returns the affected row count', '`Database.SqlQuery<T>` (EF Core 7/8+) can return scalars or unmapped types like a report DTO', '`ExecuteSqlAsync` returns the rows of a SELECT', 'A stored procedure ending in `SELECT` can be composed with `.Where()` in SQL'],
      answers: [0, 1, 2],
      explain: '`FromSql` maps to entities, `ExecuteSql` is for commands (returns an int), `SqlQuery<T>` maps arbitrary results. EF cannot compose LINQ **into** a stored procedure call, so use `.AsEnumerable()` before further filtering, or filter inside the procedure.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'A city report DTO is filled with `db.Database.SqlQuery<CityReport>(...)`. Write its SQL: per `City`, the `Total` number of students and the `TopMarks` (highest marks).',
      example: { title: 'DTO mapped from SQL', code: `public record CityReport(string City, int Total, int TopMarks);
var report = await db.Database.SqlQuery<CityReport>($"SELECT ...").ToListAsync();` },
      setup: STUDENTS,
      starter: 'SELECT City FROM Students;\n',
      solution: 'SELECT City, COUNT(*) AS Total, MAX(Marks) AS TopMarks\nFROM Students\nGROUP BY City;',
      explain: 'Column aliases must match the DTO property names (`City`, `Total`, `TopMarks`) so EF can map them. Pune has 3 students (top 91), Nagpur 1 (67), Delhi 1 (88).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'When is raw SQL in EF Core a good choice?',
      options: ['For every query, because LINQ is slow', 'For complex reports, window functions, existing stored procedures or tuned queries LINQ cannot express well', 'Only when the database is not SQL Server', 'Never; EF Core does not support it'],
      answer: 1,
      explain: 'LINQ covers most needs and is type-safe. Use raw SQL for the cases LINQ handles badly, keeping parameters for every value and mapping the result to entities or DTOs.',
    },
  ],
};
