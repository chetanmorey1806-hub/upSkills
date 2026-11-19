export default {
  lesson: 'day-084-linq-ef-core-loading-related-data',
  minutes: 35,
  intro: 'Write LINQ queries against EF Core, load related data with Include/ThenInclude, use AsNoTracking for read-only lists and avoid the N+1 query problem.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: 'Load each student with their enrollments AND each enrollment\'s course in one query. Complete the missing call:\n```\nvar students = db.Students\n    .Include(s => s.Enrollments)\n    .______(e => e.Course)\n    .ToList();\n```',
      example: { title: 'one level of related data', code: 'db.Orders.Include(o => o.Customer).ToList();' },
      accept: ['ThenInclude'],
      caseSensitive: true,
      explain: '`Include` loads a navigation of the root entity; `ThenInclude` goes one level deeper from what was just included. Without them, navigation properties stay null/empty (no lazy loading by default).',
    },
    {
      type: 'output',
      mins: 5,
      q: 'There are **10** departments. Lazy loading is ON. How many SQL queries does code A send, and how many does code B send? Type the two numbers on separate lines.',
      example: { title: 'the N+1 problem', code: 'foreach (var o in db.Orders)        // 1 query\n    Console.WriteLine(o.Customer.Name); // +1 query per order' },
      code: `// A
foreach (var d in db.Departments.ToList())
    Console.WriteLine($"{d.Name}: {d.Employees.Count}");

// B
foreach (var d in db.Departments.Include(x => x.Employees).ToList())
    Console.WriteLine($"{d.Name}: {d.Employees.Count}");`,
      expected: `11
1`,
      explain: 'A: 1 query for departments + 1 lazy query per department = **11** (the N+1 problem). B: `Include` joins employees into the **one** query. On a page with hundreds of rows N+1 kills performance, so prefer eager loading or projection.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'When should you add `.AsNoTracking()` to a query?',
      options: ['When you will modify and save the entities', 'For read-only queries such as a list page or an API GET, to skip change-tracking overhead', 'Only for Include queries', 'Never; it disables the query'],
      answer: 1,
      explain: '`AsNoTracking` makes EF skip creating change-tracking snapshots, which is faster and uses less memory for data you only display. If you later change those objects, `SaveChanges` will not notice.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this LINQ query print? Data (Name, Dept, Salary): Asha IT 60000, Ravi HR 40000, Meera IT 75000, Kiran Sales 45000, Sana HR 52000.',
      example: { title: 'GroupBy + aggregate', code: 'db.Orders.GroupBy(o => o.City)\n         .Select(g => new { City = g.Key, Total = g.Sum(o => o.Amount) })' },
      code: `var result = db.Employees
    .GroupBy(e => e.Dept)
    .Select(g => new { Dept = g.Key, Count = g.Count(), Avg = g.Average(e => e.Salary) })
    .Where(x => x.Count > 1)
    .OrderByDescending(x => x.Avg)
    .ToList();

foreach (var r in result)
    Console.WriteLine($"{r.Dept} {r.Count} {r.Avg}");`,
      expected: `IT 2 67500
HR 2 46000`,
      explain: 'Groups: IT (60000, 75000 → avg 67500), HR (40000, 52000 → avg 46000), Sales (1 employee, filtered out by `Count > 1` - like SQL HAVING). Sorted by average descending. EF Core translates this to GROUP BY + HAVING + ORDER BY.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 7,
      q: '**The SQL for that LINQ query.** Write the T-SQL equivalent: departments with more than 1 employee, showing `Dept`, `Count` (number of employees) and `Avg` (average salary), ordered by `Avg` descending.',
      example: { title: 'HAVING filters groups', code: 'SELECT City, COUNT(*) AS Orders\nFROM Orders\nGROUP BY City\nHAVING COUNT(*) >= 3;' },
      setup: `CREATE TABLE Employees (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50),
  Dept NVARCHAR(20),
  Salary INT
);
INSERT INTO Employees (Name, Dept, Salary) VALUES
('Asha', 'IT', 60000), ('Ravi', 'HR', 40000), ('Meera', 'IT', 75000),
('Kiran', 'Sales', 45000), ('Sana', 'HR', 52000);`,
      starter: '-- TODO\nSELECT Dept FROM Employees;\n',
      solution: 'SELECT Dept, COUNT(*) AS [Count], AVG(Salary) AS [Avg]\nFROM Employees\nGROUP BY Dept\nHAVING COUNT(*) > 1\nORDER BY AVG(Salary) DESC;\n',
      ordered: true,
      explain: '`Where` **after** `GroupBy` becomes `HAVING` (a filter on groups); a `Where` before `GroupBy` would be a normal `WHERE` on rows. `Count` and `Avg` are reserved-looking names, so square brackets are a safe habit.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about loading related data are TRUE? (choose all that apply)',
      options: [
        'Eager loading = Include/ThenInclude in the original query',
        'Explicit loading = db.Entry(dept).Collection(d => d.Employees).Load() later, on demand',
        'Lazy loading needs the Proxies package (UseLazyLoadingProxies) and virtual navigation properties',
        'Projection with Select(new { ... }) can load related values without Include',
        'Include can be used after ToList()',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Three loading strategies: eager, explicit, lazy. A `Select` projection that touches `d.Employees.Count` makes EF write the JOIN/subquery itself. `Include` must be part of the IQueryable **before** `ToList()` executes the query.',
    },
  ],
};
