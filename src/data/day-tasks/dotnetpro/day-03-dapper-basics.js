const PRODUCTS = `CREATE TABLE Products (
    Id INT PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL
);
INSERT INTO Products (Id, Name, Category, Price, Stock) VALUES
(1, 'Notebook', 'Stationery', 45, 100),
(2, 'Pen Pack', 'Stationery', 120, 20),
(3, 'School Bag', 'Bags', 899, 5),
(4, 'Lunch Box', 'Kitchen', 349, 12),
(5, 'Pencil Box', 'Stationery', 85, 40);`;

export default {
  lesson: 'day-03-dapper-basics',
  minutes: 25,
  intro: 'Practise the core Dapper methods, parameters with anonymous objects, column mapping and a Dapper repository in a Web API.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'An API endpoint `GET /api/students/{id}` looks up one student by primary key and must return 404 when nothing is found. Which Dapper call fits best?',
      options: [
        '`conn.QueryAsync<Student>(sql, new { id })`',
        '`conn.QuerySingleOrDefaultAsync<Student>(sql, new { id })`',
        '`conn.QueryFirstAsync<Student>(sql, new { id })`',
        '`conn.ExecuteAsync(sql, new { id })`',
      ],
      answer: 1,
      explain: '`QuerySingleOrDefault` returns null for zero rows (so the controller returns 404) and throws if two rows come back, which would reveal a data bug. `QueryFirst` throws when there is no row, `Query` returns a list, and `Execute` returns rows affected, not data.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The Products table: Notebook (Stationery, 45, stock 100), Pen Pack (Stationery, 120, stock 20), School Bag (Bags, 899, stock 5), Lunch Box (Kitchen, 349, stock 12), Pencil Box (Stationery, 85, stock 40). What does this print?',
      example: { title: 'return values', code: `QueryAsync<T>                -> IEnumerable<T> (empty when no rows, never null)
QueryFirstOrDefaultAsync<T>  -> first row or null
ExecuteAsync                 -> rows affected
ExecuteScalarAsync<T>        -> first column of first row` },
      code: `var a = await conn.QueryAsync<Product>(
    "SELECT * FROM Products WHERE Category = @c", new { c = "Toys" });
var b = await conn.QueryFirstOrDefaultAsync<Product>(
    "SELECT * FROM Products WHERE Price > @p ORDER BY Price", new { p = 300 });
int c = await conn.ExecuteAsync(
    "UPDATE Products SET Stock = Stock + 10 WHERE Stock < @s", new { s = 20 });
int d = await conn.ExecuteScalarAsync<int>(
    "SELECT SUM(Stock) FROM Products WHERE Category = @c", new { c = "Stationery" });

Console.WriteLine(a.Count());
Console.WriteLine(b?.Name ?? "none");
Console.WriteLine(c);
Console.WriteLine(d);`,
      expected: `0
Lunch Box
2
160`,
      explain: 'No Toys -> Query returns an EMPTY sequence (Count 0), not null. Products above 300 sorted by price are Lunch Box (349) then School Bag (899), so the first is Lunch Box. Stock < 20 matches School Bag (5) and Lunch Box (12); Pen Pack has exactly 20, so it is not included -> 2 rows. Stationery stock is 100 + 20 + 40 = 160 and was not changed by the update.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the SQL so Dapper expands the array into an IN list:
\`conn.QueryAsync<Product>("SELECT * FROM Products WHERE Id IN ______", new { Ids = new[] { 2, 4 } });\``,
      example: { title: 'what Dapper sends', code: 'WHERE Id IN (@Ids1, @Ids2)' },
      accept: ['@Ids'],
      caseSensitive: false,
      explain: 'Write `IN @Ids` WITHOUT brackets. Dapper sees that the parameter is a list and rewrites it to `(@Ids1, @Ids2)` with one real parameter per value. Writing `IN (@Ids)` gives a SQL syntax error in many Dapper versions, and joining the numbers into the string would open the door to SQL injection.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `The table column is \`emp_name\` but the C# property is \`Name\`. Complete the SELECT so Dapper fills \`Name\`:
\`SELECT emp_id AS Id, emp_name ______ FROM Employees\``,
      example: { title: 'aliases', code: 'SELECT monthly_salary AS Salary FROM Employees' },
      accept: ['AS Name', 'Name', 'AS [Name]', '[Name]'],
      caseSensitive: false,
      explain: 'Dapper maps by column NAME (ignoring case). An alias renames the result column to `Name`, so it matches the property. Without it, `Name` silently stays null - Dapper does not throw for unmatched columns.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements about Dapper are true? Select all that apply.',
      options: [
        'It adds extension methods to IDbConnection, so it works with SQL Server, PostgreSQL, MySQL and SQLite',
        'It opens a closed connection for the call and closes it again',
        'It tracks changes to loaded objects and saves them with SaveChanges()',
        'Values passed in an anonymous object are sent as real SQL parameters',
        'It generates the SQL for you from LINQ expressions',
      ],
      answers: [0, 1, 3],
      explain: 'Dapper is a micro-ORM: you write the SQL, it handles parameters, connection opening and mapping. Change tracking and LINQ-to-SQL translation are EF Core features.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'In `Program.cs`, how should a Dapper `ProductRepository` (which creates a new SqlConnection inside each method) usually be registered?',
      options: [
        '`builder.Services.AddScoped<IProductRepository, ProductRepository>();`',
        'A single static SqlConnection shared by all requests',
        '`builder.Services.AddSingleton<SqlConnection>();`',
        'It cannot be used with dependency injection',
      ],
      answer: 0,
      explain: 'Scoped (one per HTTP request) is the usual lifetime for repositories. Never register a SqlConnection as a singleton: it is not thread-safe and one broken connection would break every request. A connection FACTORY that only holds the connection string can be a singleton.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 4,
      q: 'Write the SQL for a Dapper `QueryAsync<CategorySummary>` call where `CategorySummary` has properties `Category` and `TotalStock`. Return one row per category with the sum of stock, ordered by `Category`.',
      example: { title: 'column names must match properties', code: 'SELECT City, COUNT(*) AS Students FROM Students GROUP BY City ORDER BY City;' },
      setup: PRODUCTS,
      starter: '-- SELECT Category, ... AS TotalStock\n',
      solution: 'SELECT Category, SUM(Stock) AS TotalStock FROM Products GROUP BY Category ORDER BY Category;',
      ordered: true,
      explain: 'The alias `AS TotalStock` is what lets Dapper map the aggregate to the `TotalStock` property; an unnamed `SUM(Stock)` column has no name and would be left at 0. Bags 5, Kitchen 12, Stationery 160.',
    },
  ],
};
