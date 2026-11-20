const dbScript = `CREATE DATABASE CollegeDB;
GO
USE CollegeDB;
GO
CREATE TABLE Students (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    City NVARCHAR(50) NOT NULL,
    Marks INT NOT NULL,
    Email NVARCHAR(100) NULL
);
INSERT INTO Students (Name, City, Marks, Email) VALUES
('Asha Patil', 'Pune', 82, 'asha@college.in'),
('Ravi Kumar', 'Chennai', 67, NULL),
('Neha Sharma', 'Delhi', 91, 'neha@college.in'),
('Arjun Rao', 'Pune', 45, 'arjun@college.in');
GO
SELECT Id, Name, City, Marks, Email FROM Students ORDER BY Id;
SELECT COUNT(*) AS TotalStudents FROM Students WHERE City = 'Pune';`;

const readerCode = `// NuGet: dotnet add package Microsoft.Data.SqlClient
using System.Data;
using Microsoft.Data.SqlClient;

const string connStr =
    "Server=localhost;Database=CollegeDB;Trusted_Connection=True;TrustServerCertificate=True";

// await using = the connection is closed (returned to the pool) even if an exception happens
await using var conn = new SqlConnection(connStr);
await conn.OpenAsync();
Console.WriteLine($"Connection state: {conn.State}");

const string sql = """
    SELECT Id, Name, City, Marks, Email
    FROM Students
    WHERE Marks >= @minMarks
    ORDER BY Marks DESC
    """;

await using var cmd = new SqlCommand(sql, conn);
cmd.Parameters.Add("@minMarks", SqlDbType.Int).Value = 60;

await using SqlDataReader reader = await cmd.ExecuteReaderAsync();

// look up column positions once, outside the loop
int idCol = reader.GetOrdinal("Id");
int nameCol = reader.GetOrdinal("Name");
int marksCol = reader.GetOrdinal("Marks");
int emailCol = reader.GetOrdinal("Email");

while (await reader.ReadAsync())          // moves to the next row, false when no more rows
{
    int id = reader.GetInt32(idCol);
    string name = reader.GetString(nameCol);
    int marks = reader.GetInt32(marksCol);
    string email = reader.IsDBNull(emailCol) ? "(no email)" : reader.GetString(emailCol);
    Console.WriteLine($"{id}  {name,-12} {marks}  {email}");
}`;

const crudCode = `using System.Data;
using Microsoft.Data.SqlClient;

const string connStr =
    "Server=localhost;Database=CollegeDB;Trusted_Connection=True;TrustServerCertificate=True";

await using var conn = new SqlConnection(connStr);
await conn.OpenAsync();

// 1. INSERT and get the new identity value -> ExecuteScalar (first column of first row)
const string insertSql = """
    INSERT INTO Students (Name, City, Marks, Email)
    OUTPUT INSERTED.Id
    VALUES (@name, @city, @marks, @email)
    """;
await using (var cmd = new SqlCommand(insertSql, conn))
{
    string? email = null;                                   // student has no email yet
    cmd.Parameters.Add("@name", SqlDbType.NVarChar, 100).Value = "Kiran Joshi";
    cmd.Parameters.Add("@city", SqlDbType.NVarChar, 50).Value = "Mumbai";
    cmd.Parameters.Add("@marks", SqlDbType.Int).Value = 74;
    cmd.Parameters.Add("@email", SqlDbType.NVarChar, 100).Value = (object?)email ?? DBNull.Value;

    int newId = Convert.ToInt32(await cmd.ExecuteScalarAsync());
    Console.WriteLine($"Inserted student with Id {newId}");
}

// 2. UPDATE -> ExecuteNonQuery returns the number of rows affected
await using (var cmd = new SqlCommand("UPDATE Students SET Marks = Marks + 5 WHERE City = @city", conn))
{
    cmd.Parameters.Add("@city", SqlDbType.NVarChar, 50).Value = "Pune";
    int rows = await cmd.ExecuteNonQueryAsync();
    Console.WriteLine($"Grace marks given to {rows} Pune students");
}

// 3. Aggregate -> ExecuteScalar
await using (var cmd = new SqlCommand("SELECT AVG(Marks) FROM Students", conn))
{
    int avg = Convert.ToInt32(await cmd.ExecuteScalarAsync());
    Console.WriteLine($"Class average: {avg}");
}

// 4. DELETE a row that does not exist -> 0 rows affected (no exception!)
await using (var cmd = new SqlCommand("DELETE FROM Students WHERE Id = @id", conn))
{
    cmd.Parameters.Add("@id", SqlDbType.Int).Value = 99;
    int rows = await cmd.ExecuteNonQueryAsync();
    Console.WriteLine(rows == 0 ? "No student with Id 99 - nothing deleted" : $"Deleted {rows} row(s)");
}`;

const injectionCode = `using System;
using System.Collections.Generic;

// No database needed: we only print the SQL text that would be sent to SQL Server.
var attempts = new List<(string User, string Pwd)>
{
    ("asha", "asha@123"),          // normal user
    ("admin' --", "anything"),     // attacker
};

foreach (var (user, pwd) in attempts)
{
    Console.WriteLine($"Input: user={user}, pwd={pwd}");

    // WRONG: building SQL with string concatenation
    string unsafeSql = "SELECT COUNT(*) FROM Users WHERE UserName = '" + user +
                       "' AND Password = '" + pwd + "'";
    Console.WriteLine("UNSAFE SQL : " + unsafeSql);

    // "--" starts a comment in T-SQL, so everything after it is ignored by the server
    int dash = unsafeSql.IndexOf("--", StringComparison.Ordinal);
    string runs = dash >= 0 ? unsafeSql.Substring(0, dash).TrimEnd() : unsafeSql;
    Console.WriteLine("SERVER RUNS: " + runs);

    // RIGHT: SQL text never changes, values travel separately as parameters
    Console.WriteLine("SAFE SQL   : SELECT COUNT(*) FROM Users WHERE UserName = @user AND Password = @pwd");
    Console.WriteLine($"             @user = [{user}], @pwd = [{pwd}]");
    Console.WriteLine();
}`;

const apiCode = `// ===== appsettings.json =====
{
  "ConnectionStrings": {
    "CollegeDb": "Server=localhost;Database=CollegeDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Logging": { "LogLevel": { "Default": "Information" } }
}

// ===== Program.cs (ASP.NET Core Web API, .NET 8, minimal API style) =====
using System.Data;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();

string connStr = builder.Configuration.GetConnectionString("CollegeDb")
    ?? throw new InvalidOperationException("Connection string 'CollegeDb' not found");

app.MapGet("/api/students/{id:int}", async (int id) =>
{
    await using var conn = new SqlConnection(connStr);      // new connection per request (pooled)
    await conn.OpenAsync();
    await using var cmd = new SqlCommand(
        "SELECT Id, Name, City, Marks FROM Students WHERE Id = @id", conn);
    cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;

    await using var r = await cmd.ExecuteReaderAsync();
    if (!await r.ReadAsync()) return Results.NotFound();

    var student = new StudentDto(r.GetInt32(0), r.GetString(1), r.GetString(2), r.GetInt32(3));
    return Results.Ok(student);
});

app.MapPost("/api/students", async (CreateStudentDto dto) =>
{
    await using var conn = new SqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new SqlCommand("""
        INSERT INTO Students (Name, City, Marks) OUTPUT INSERTED.Id
        VALUES (@name, @city, @marks)
        """, conn);
    cmd.Parameters.Add("@name", SqlDbType.NVarChar, 100).Value = dto.Name;
    cmd.Parameters.Add("@city", SqlDbType.NVarChar, 50).Value = dto.City;
    cmd.Parameters.Add("@marks", SqlDbType.Int).Value = dto.Marks;
    int newId = Convert.ToInt32(await cmd.ExecuteScalarAsync());
    return Results.Created($"/api/students/{newId}", new StudentDto(newId, dto.Name, dto.City, dto.Marks));
});

app.Run();

record StudentDto(int Id, string Name, string City, int Marks);
record CreateStudentDto(string Name, string City, int Marks);`;

export default {
  id: 'day-01-ado-net-fundamentals',
  title: 'ADO.NET Fundamentals: SqlConnection, SqlCommand, SqlDataReader and Parameters',
  module: 'Module 1: Data Access – ADO.NET & Dapper',
  day: 1,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'ADO.NET is the low-level data access layer that EF Core and Dapper are built on. Learn to open a SqlConnection with a proper connection string, run SQL with SqlCommand, read rows with SqlDataReader, use ExecuteNonQuery and ExecuteScalar, stop SQL injection with parameters, and dispose everything correctly with using and await using.',
  objectives: [
    'Explain the ADO.NET building blocks (provider, connection, command, reader, parameter) and install Microsoft.Data.SqlClient',
    'Write correct SQL Server connection strings and keep them in appsettings.json',
    'Read rows with SqlDataReader and handle NULL values safely',
    'Choose between ExecuteReader, ExecuteNonQuery and ExecuteScalar',
    'Prevent SQL injection with parameters and release connections with using / await using',
  ],
  theory: [
    {
      heading: 'What is ADO.NET and why learn it in 2025?',
      content:
        'ADO.NET is the set of .NET classes that talk directly to a database. You write the SQL yourself, send it with a command and read the result row by row. EF Core and Dapper both use ADO.NET internally, so knowing it helps you debug them, tune performance and work on older company projects (many banking, insurance and ERP systems still use plain ADO.NET). For SQL Server, install the NuGet package Microsoft.Data.SqlClient. The old System.Data.SqlClient is in maintenance mode only, so new code must use Microsoft.Data.SqlClient.',
      syntax: `dotnet add package Microsoft.Data.SqlClient
// or in Visual Studio: right-click project > Manage NuGet Packages > Browse > Microsoft.Data.SqlClient`,
      points: [
        'Connected classes: SqlConnection (the pipe to the server), SqlCommand (the SQL to run), SqlDataReader (fast forward-only rows), SqlParameter (a value sent separately)',
        'Disconnected classes: DataTable, DataSet, SqlDataAdapter (Day 2)',
        'Every provider follows the same pattern: SqlConnection for SQL Server, NpgsqlConnection for PostgreSQL, MySqlConnection for MySQL - all inherit DbConnection',
        'ADO.NET = full control and best raw speed, but more code to write than an ORM',
      ],
    },
    {
      heading: 'Connection strings',
      content:
        'A connection string tells the provider which server and database to use and how to log in. Keep it in appsettings.json under ConnectionStrings and read it with builder.Configuration.GetConnectionString("Name"). Never hard-code passwords in source code; in production use environment variables, User Secrets (development) or Azure Key Vault. Microsoft.Data.SqlClient version 4 and later uses Encrypt=True by default, so a local SQL Server without a trusted certificate fails with "The certificate chain was issued by an authority that is not trusted" until you add TrustServerCertificate=True (development only).',
      syntax: `// Windows login (Integrated Security)
Server=localhost;Database=CollegeDB;Trusted_Connection=True;TrustServerCertificate=True
// SQL login
Server=localhost,1433;Database=CollegeDB;User Id=appuser;Password=Str0ng!Pass;TrustServerCertificate=True
// SQL Express
Server=.\\SQLEXPRESS;Database=CollegeDB;Integrated Security=True;TrustServerCertificate=True`,
      points: [
        'Server (or Data Source), Database (or Initial Catalog), Trusted_Connection / Integrated Security, User Id, Password',
        'Connect Timeout=30 (seconds to wait for a connection), Max Pool Size=100 (pooling, Day 2)',
        'SqlConnectionStringBuilder builds a connection string safely in code',
      ],
    },
    {
      heading: 'SqlCommand and the three Execute methods',
      content:
        'A SqlCommand holds the SQL text (or stored procedure name), the connection and the parameters. Pick the Execute method by what the SQL returns. Every method has an async version; in web apps always use the async version so the thread is free to serve other requests while SQL Server works.',
      points: [
        'ExecuteReader / ExecuteReaderAsync: SELECT that returns many rows -> SqlDataReader',
        'ExecuteNonQuery / ExecuteNonQueryAsync: INSERT, UPDATE, DELETE, DDL -> int rows affected (-1 for DDL statements like CREATE TABLE)',
        'ExecuteScalar / ExecuteScalarAsync: a single value (COUNT, SUM, new Id) -> object? = first column of first row; null when there are no rows, DBNull.Value when the value is NULL',
        'Get a new identity value with OUTPUT INSERTED.Id (or SELECT CAST(SCOPE_IDENTITY() AS INT)) and ExecuteScalar',
        'CommandTimeout (default 30 seconds) controls how long a single command may run',
      ],
    },
    {
      heading: 'SqlDataReader: reading rows fast',
      content:
        'SqlDataReader is a forward-only, read-only stream of rows. Call Read() (or ReadAsync()) to move to the next row; it returns false when there are no more rows. Read columns with typed methods like GetInt32, GetString, GetDecimal, GetDateTime, using the column position. GetOrdinal("Name") finds a column position once, so your code does not break when someone changes the SELECT column order. A NULL in the database is DBNull.Value in .NET, and calling GetString on it throws SqlNullValueException, so check IsDBNull first. While a reader is open, the same connection cannot run another command (unless MultipleActiveResultSets=True), so read quickly and close the reader.',
      syntax: `while (await reader.ReadAsync())
{
    int id = reader.GetInt32(0);
    string? email = reader.IsDBNull(4) ? null : reader.GetString(4);
    decimal fee = reader.GetFieldValue<decimal>(reader.GetOrdinal("Fee"));
}`,
      tip: 'Need several result sets from one command? Call reader.NextResult() to move to the next SELECT.',
    },
    {
      heading: 'Parameters and SQL injection',
      content:
        'SQL injection happens when user input is glued into SQL text. Input like admin\' -- closes the string and comments out the password check, so the attacker logs in without a password. It can also delete tables (\'; DROP TABLE Students; --). The fix is parameters: the SQL text contains placeholders like @name, and the values are sent separately to SQL Server, which always treats them as data, never as SQL code. Parameters also let SQL Server reuse the execution plan. Prefer Parameters.Add with an explicit SqlDbType and size over AddWithValue, because AddWithValue guesses the type from the .NET value (for example NVARCHAR(4000) for every string), which can make SQL Server skip indexes or create many plans.',
      syntax: `cmd.Parameters.Add("@name", SqlDbType.NVarChar, 100).Value = name;
cmd.Parameters.Add("@marks", SqlDbType.Int).Value = marks;
cmd.Parameters.Add("@email", SqlDbType.NVarChar, 100).Value = (object?)email ?? DBNull.Value;  // NULL
cmd.Parameters.AddWithValue("@city", city);   // works, but the type is guessed`,
      points: [
        'Never concatenate or interpolate user input into SQL ($"... WHERE Name = \'{name}\'" is also unsafe)',
        'A C# null must be sent as DBNull.Value, otherwise you get "parameter was not supplied"',
        'Table and column names cannot be parameters; validate them against an allow-list if they must be dynamic',
      ],
    },
    {
      heading: 'using, await using and connection lifetime',
      content:
        'SqlConnection, SqlCommand and SqlDataReader implement IDisposable and IAsyncDisposable. Disposing a connection closes it and returns the real network connection to the connection pool. If you forget, the pool runs out after 100 open connections and the app hangs with "Timeout expired... obtaining a connection from the pool". The rule: open the connection as late as possible, close it as early as possible, and create a new SqlConnection for each unit of work (each request) instead of keeping one static connection. In async code use await using so disposal is also asynchronous.',
      syntax: `await using var conn = new SqlConnection(connStr);   // disposed at the end of the scope
await conn.OpenAsync();
await using (var cmd = new SqlCommand(sql, conn))     // block form: disposed at the closing brace
{
    await cmd.ExecuteNonQueryAsync();
}`,
      tip: 'Do not share one SqlConnection across threads or requests. Connections are cheap because of pooling.',
    },
  ],
  examples: [
    {
      title: 'Create the CollegeDB database used all week',
      scenario:
        'Before writing C# code we need a database. Create CollegeDB with a Students table (one student has no email so we can practise NULL handling) and check the data.',
      steps: [
        'Open SSMS and connect to your local SQL Server (Server name: localhost or .\\SQLEXPRESS, Windows Authentication)',
        'Click New Query, paste the script and press F5 (or open the in-app SSMS Lab and run it there)',
        'Expand Databases > CollegeDB > Tables in Object Explorer and refresh to see dbo.Students',
      ],
      code: dbScript,
      tsql: dbScript,
      result: `Commands completed successfully.
(4 rows affected)
+----+-------------+---------+-------+------------------+
| Id | Name        | City    | Marks | Email            |
+----+-------------+---------+-------+------------------+
| 1  | Asha Patil  | Pune    | 82    | asha@college.in  |
| 2  | Ravi Kumar  | Chennai | 67    | NULL             |
| 3  | Neha Sharma | Delhi   | 91    | neha@college.in  |
| 4  | Arjun Rao   | Pune    | 45    | arjun@college.in |
+----+-------------+---------+-------+------------------+
+---------------+
| TotalStudents |
+---------------+
| 2             |
+---------------+`,
      explanation:
        'IDENTITY(1,1) gives Ids 1 to 4 automatically. Ravi has NULL in Email, which in C# arrives as DBNull.Value - Example 2 handles it. The COUNT query is exactly the kind of single value you will later read with ExecuteScalar.',
    },
    {
      title: 'Read students with SqlConnection, SqlCommand and SqlDataReader',
      scenario:
        'The principal wants a console report of every student who scored 60 or more, highest first, showing "(no email)" when the email is missing.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it AdoBasics, framework .NET 8',
        'Install the package: Tools > NuGet Package Manager > Package Manager Console > Install-Package Microsoft.Data.SqlClient (or dotnet add package Microsoft.Data.SqlClient)',
        'Replace Program.cs with the code and change Server= to your server name',
        'Press Ctrl+F5. Put a breakpoint (F9) inside the while loop and press F5 to watch each row arrive',
      ],
      code: readerCode,
      result: `Connection state: Open
3  Neha Sharma  91  neha@college.in
1  Asha Patil   82  asha@college.in
2  Ravi Kumar   67  (no email)`,
      explanation:
        'The WHERE uses @minMarks, so the value 60 is sent as a typed Int parameter. ReadAsync moves one row at a time - the reader never holds all rows in memory, which is why it is the fastest way to read data. GetOrdinal is called once before the loop. Ravi\'s Email is NULL, so IsDBNull returns true and we print "(no email)"; calling GetString on it would throw. {name,-12} pads the name to 12 characters so the columns line up. Arjun (45) is filtered out by SQL Server, not by C#.',
    },
    {
      title: 'INSERT, UPDATE, DELETE with ExecuteNonQuery and ExecuteScalar',
      scenario:
        'The admin office adds a new student without an email, gives 5 grace marks to all Pune students, shows the class average and tries to delete a student who does not exist.',
      steps: [
        'Run the CollegeDB script from Example 1 again so you start from the same 4 rows',
        'In the AdoBasics project replace Program.cs with this code',
        'Press Ctrl+F5, then run SELECT * FROM Students in SSMS to see the changes',
      ],
      code: crudCode,
      result: `Inserted student with Id 5
Grace marks given to 2 Pune students
Class average: 73
No student with Id 99 - nothing deleted`,
      explanation:
        'OUTPUT INSERTED.Id makes the INSERT return the new identity, which ExecuteScalar reads (Id 5 on a fresh database). The C# null email is sent as DBNull.Value. ExecuteNonQuery returns rows affected: Asha and Arjun are in Pune, so 2. Marks become 87, 67, 91, 50, 74 = 369 / 5 = 73.8, but AVG over an INT column returns an INT in SQL Server, so you get 73 (use AVG(CAST(Marks AS DECIMAL(5,2))) for 73.80). A DELETE that matches nothing is not an error - it returns 0, so the code checks it, exactly what a Web API does to return 404.',
    },
    {
      title: 'See SQL injection happen (and how parameters stop it)',
      scenario:
        'A login page builds its SQL with string concatenation. Print the SQL that reaches the server for a normal user and for an attacker who types admin\' -- as the user name.',
      steps: [
        'File > New > Project > Console App, name it InjectionDemo (no database or package needed)',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Try other inputs such as x\' OR \'1\'=\'1 for the password and see the WHERE become always true',
      ],
      code: injectionCode,
      csharp: { files: { 'Program.cs': injectionCode }, stdin: '' },
      result: `Input: user=asha, pwd=asha@123
UNSAFE SQL : SELECT COUNT(*) FROM Users WHERE UserName = 'asha' AND Password = 'asha@123'
SERVER RUNS: SELECT COUNT(*) FROM Users WHERE UserName = 'asha' AND Password = 'asha@123'
SAFE SQL   : SELECT COUNT(*) FROM Users WHERE UserName = @user AND Password = @pwd
             @user = [asha], @pwd = [asha@123]

Input: user=admin' --, pwd=anything
UNSAFE SQL : SELECT COUNT(*) FROM Users WHERE UserName = 'admin' --' AND Password = 'anything'
SERVER RUNS: SELECT COUNT(*) FROM Users WHERE UserName = 'admin'
SAFE SQL   : SELECT COUNT(*) FROM Users WHERE UserName = @user AND Password = @pwd
             @user = [admin' --], @pwd = [anything]`,
      explanation:
        'With concatenation the attacker\'s quote closes the string and -- comments out the password check, so the server only checks the user name and the attacker logs in as admin. With parameters the SQL text is fixed; the whole input admin\' -- is just a value, so SQL Server looks for a user literally named "admin\' --" and finds nobody. This is why every interviewer asks about parameters. (Also: real apps never store plain passwords - they store hashes.)',
    },
    {
      title: 'ADO.NET inside an ASP.NET Core Web API',
      scenario:
        'Expose GET /api/students/{id} and POST /api/students for the college mobile app using plain ADO.NET, with the connection string read from appsettings.json.',
      steps: [
        'File > New > Project > ASP.NET Core Web API, name it CollegeApi, .NET 8, tick "Enable OpenAPI support"',
        'dotnet add package Microsoft.Data.SqlClient',
        'Add the ConnectionStrings section to appsettings.json and replace Program.cs',
        'Press F5, open Swagger, call GET /api/students/3 and GET /api/students/50, then POST the JSON body {"name":"Sneha Iyer","city":"Bengaluru","marks":88}',
      ],
      code: apiCode,
      result: `GET /api/students/3   -> 200 OK
{ "id": 3, "name": "Neha Sharma", "city": "Delhi", "marks": 91 }

GET /api/students/50  -> 404 Not Found

POST /api/students  { "name": "Sneha Iyer", "city": "Bengaluru", "marks": 88 }
-> 201 Created   Location: /api/students/5
{ "id": 5, "name": "Sneha Iyer", "city": "Bengaluru", "marks": 88 }`,
      explanation:
        'Each request creates its own SqlConnection and disposes it with await using; thanks to connection pooling this is cheap. The id comes from the route and is passed as a typed parameter, so /api/students/1;DROP TABLE is impossible (the :int route constraint rejects it too). ReadAsync returning false means no row, so we return 404. The new Id depends on how many rows already exist (5 on a fresh database with no earlier inserts). Next days replace this repetitive code with Dapper and a repository.',
    },
  ],
  interview: [
    { q: 'What is ADO.NET? Name its main classes.', a: 'ADO.NET is the .NET data access API for talking to databases directly with SQL. Main classes for SQL Server: SqlConnection, SqlCommand, SqlParameter, SqlDataReader (connected) and DataSet, DataTable, SqlDataAdapter (disconnected). EF Core and Dapper are built on top of it.', level: 'Easy' },
    { q: 'Microsoft.Data.SqlClient vs System.Data.SqlClient?', a: 'System.Data.SqlClient is the old provider, only receiving critical fixes. Microsoft.Data.SqlClient is the actively developed NuGet package with new SQL Server features (Always Encrypted improvements, Azure AD auth, new TLS). New code should use Microsoft.Data.SqlClient. Note that it encrypts connections by default (Encrypt=True).', level: 'Easy' },
    { q: 'What is the difference between ExecuteReader, ExecuteNonQuery and ExecuteScalar?', a: 'ExecuteReader returns a SqlDataReader for queries that return rows. ExecuteNonQuery runs INSERT/UPDATE/DELETE/DDL and returns the number of rows affected. ExecuteScalar returns only the first column of the first row as object (null if no rows), useful for COUNT, SUM or a new Id.', level: 'Easy' },
    { q: 'What does ExecuteNonQuery return for a SELECT statement or a CREATE TABLE?', a: '-1. Rows affected is only counted for INSERT, UPDATE and DELETE (and SET NOCOUNT ON in a stored procedure also makes it -1).', level: 'Medium' },
    { q: 'What is SQL injection and how do you prevent it in ADO.NET?', a: 'An attack where user input changes the meaning of a SQL statement because it was concatenated into the SQL text, e.g. admin\' -- removing the password check. Prevent it with parameterized commands (cmd.Parameters.Add("@name", SqlDbType.NVarChar, 100).Value = name), stored procedures with parameters, least-privilege database logins and input validation. String interpolation is just as unsafe as concatenation.', level: 'Easy' },
    { q: 'Why is Parameters.Add with SqlDbType preferred over AddWithValue?', a: 'AddWithValue infers the type from the .NET value: every string becomes NVARCHAR with the string length (or 4000), decimals get inferred precision, DateTime becomes datetime. Mismatched types can cause implicit conversions that prevent index seeks and pollute the plan cache with many plans. Add with an explicit type and size gives one stable plan.', level: 'Medium' },
    { q: 'How do you insert NULL using a SqlParameter?', a: 'Assign DBNull.Value, not C# null: param.Value = (object?)value ?? DBNull.Value. A parameter whose Value is null is treated as "not supplied" and SQL Server throws an error.', level: 'Medium' },
    { q: 'How do you read a nullable column from SqlDataReader?', a: 'Check reader.IsDBNull(ordinal) (or await IsDBNullAsync) before calling GetString/GetInt32, because the typed getters throw on NULL. A small helper like string? GetNullableString(int i) => r.IsDBNull(i) ? null : r.GetString(i) keeps the code clean.', level: 'Medium' },
    { q: 'Why should SqlConnection be wrapped in using / await using?', a: 'Dispose closes the connection and returns it to the connection pool. Without it, connections leak until the pool (default 100) is exhausted and new requests wait and then fail with a pool timeout. using guarantees disposal even when an exception is thrown.', level: 'Easy' },
    { q: 'Is it a good idea to keep one static SqlConnection open for the whole application?', a: 'No. SqlConnection is not thread-safe, a broken connection would break the whole app, and it blocks other commands while a reader is open. Create a connection per unit of work, open late, close early; pooling makes this fast.', level: 'Medium' },
    { q: 'How do you get the identity value of a row you just inserted?', a: 'Add OUTPUT INSERTED.Id to the INSERT (or append SELECT CAST(SCOPE_IDENTITY() AS INT)) and call ExecuteScalar. Avoid @@IDENTITY, because it can return an identity generated by a trigger on another table.', level: 'Medium' },
    { q: 'Why is SqlDataReader faster than filling a DataTable?', a: 'The reader streams rows one at a time directly from the network buffer, forward-only and read-only, without building an in-memory table. A DataTable loads every row and keeps extra metadata (row state, original values). Use the reader when you just need to read once.', level: 'Medium' },
    { q: 'What happens if you try to run a second command on a connection while a SqlDataReader is still open?', a: 'You get InvalidOperationException: "There is already an open DataReader associated with this Connection which must be closed first." Close the reader first, use a second connection, or enable MultipleActiveResultSets=True in the connection string.', level: 'Hard' },
    { q: 'Why should you use the async ADO.NET methods in ASP.NET Core?', a: 'Database calls are I/O. With OpenAsync/ExecuteReaderAsync the request thread goes back to the thread pool while SQL Server works, so the server can handle many more concurrent requests. Blocking calls in a web app cause thread-pool starvation under load.', level: 'Hard' },
    { q: 'Your app suddenly throws "The certificate chain was issued by an authority that is not trusted" after upgrading packages. Why?', a: 'Microsoft.Data.SqlClient 4.0+ defaults to Encrypt=True. A local or dev SQL Server with a self-signed certificate is not trusted. Fix: install a proper certificate, or for development add TrustServerCertificate=True (or Encrypt=False) to the connection string.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a console program that asks for a city name, then prints every student from that city (Id, Name, Marks) using a parameterized query. Print "No students in <city>" if nothing is found.',
      hint: 'Use a bool found = false; set it inside the while (await reader.ReadAsync()) loop.',
      solution: `using System.Data;
using Microsoft.Data.SqlClient;

Console.Write("City: ");
string city = Console.ReadLine() ?? "";
await using var conn = new SqlConnection("Server=localhost;Database=CollegeDB;Trusted_Connection=True;TrustServerCertificate=True");
await conn.OpenAsync();
await using var cmd = new SqlCommand("SELECT Id, Name, Marks FROM Students WHERE City = @city ORDER BY Name", conn);
cmd.Parameters.Add("@city", SqlDbType.NVarChar, 50).Value = city;
await using var r = await cmd.ExecuteReaderAsync();
bool found = false;
while (await r.ReadAsync())
{
    found = true;
    Console.WriteLine($"{r.GetInt32(0)} {r.GetString(1)} {r.GetInt32(2)}");
}
if (!found) Console.WriteLine($"No students in {city}");`,
    },
    {
      task: 'Write a method Task<int> CountToppersAsync(int minMarks) that returns how many students have marks >= minMarks using ExecuteScalarAsync.',
      hint: 'COUNT(*) returns an int, but ExecuteScalar returns object?, so convert it.',
      solution: `static async Task<int> CountToppersAsync(string connStr, int minMarks)
{
    await using var conn = new SqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new SqlCommand("SELECT COUNT(*) FROM Students WHERE Marks >= @min", conn);
    cmd.Parameters.Add("@min", SqlDbType.Int).Value = minMarks;
    return (int)(await cmd.ExecuteScalarAsync())!;
}`,
    },
    {
      task: 'Write UpdateEmailAsync(int id, string? email) that sets the email (NULL allowed) and returns true only if a row was updated.',
      hint: 'ExecuteNonQueryAsync returns rows affected; send null as DBNull.Value.',
      solution: `static async Task<bool> UpdateEmailAsync(string connStr, int id, string? email)
{
    await using var conn = new SqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new SqlCommand("UPDATE Students SET Email = @email WHERE Id = @id", conn);
    cmd.Parameters.Add("@email", SqlDbType.NVarChar, 100).Value = (object?)email ?? DBNull.Value;
    cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;
    return await cmd.ExecuteNonQueryAsync() == 1;
}`,
    },
    {
      task: 'Rewrite this unsafe code safely: string sql = $"DELETE FROM Students WHERE Name = \'{name}\'";',
      hint: 'Replace the interpolated value with a placeholder and add a parameter.',
      solution: `await using var cmd = new SqlCommand("DELETE FROM Students WHERE Name = @name", conn);
cmd.Parameters.Add("@name", SqlDbType.NVarChar, 100).Value = name;
int rows = await cmd.ExecuteNonQueryAsync();`,
    },
    {
      task: 'Build the connection string in code with SqlConnectionStringBuilder (server localhost, database CollegeDB, integrated security, trust certificate, 15 second timeout) and print it.',
      hint: 'Set DataSource, InitialCatalog, IntegratedSecurity, TrustServerCertificate and ConnectTimeout properties.',
      solution: `var csb = new SqlConnectionStringBuilder
{
    DataSource = "localhost",
    InitialCatalog = "CollegeDB",
    IntegratedSecurity = true,
    TrustServerCertificate = true,
    ConnectTimeout = 15
};
Console.WriteLine(csb.ConnectionString);   // keys are written in the builder's own standard spelling`,
    },
  ],
  quiz: [
    {
      question: 'Which method should you use to get the total number of students with SELECT COUNT(*) FROM Students?',
      options: ['ExecuteNonQuery', 'ExecuteScalar', 'ExecuteReader with a DataSet', 'ExecuteXmlReader'],
      answer: 1,
      explanation: 'ExecuteScalar returns the first column of the first row, perfect for a single aggregate value.',
    },
    {
      question: 'What does ExecuteNonQuery return after UPDATE Students SET Marks = Marks + 5 WHERE City = \'Pune\' when 2 rows match?',
      options: ['0', 'true', '2', 'The updated rows'],
      answer: 2,
      explanation: 'ExecuteNonQuery returns the number of rows affected by INSERT, UPDATE or DELETE.',
    },
    {
      question: 'How should a C# null be assigned to a SqlParameter to store NULL?',
      options: ['param.Value = null;', 'param.Value = "NULL";', 'param.Value = 0;', 'param.Value = DBNull.Value;'],
      answer: 3,
      explanation: 'ADO.NET uses DBNull.Value for database NULL. A null Value means the parameter was not supplied.',
    },
    {
      question: 'Which code is safe from SQL injection?',
      options: [
        'new SqlCommand("SELECT * FROM Users WHERE Name = @n", conn) with Parameters.Add("@n", ...)',
        'new SqlCommand($"SELECT * FROM Users WHERE Name = \'{name}\'", conn)',
        'new SqlCommand("SELECT * FROM Users WHERE Name = \'" + name + "\'", conn)',
        'new SqlCommand(string.Format("SELECT * FROM Users WHERE Name = \'{0}\'", name), conn)',
      ],
      answer: 0,
      explanation: 'Only the parameterized command keeps the SQL text fixed; the other three insert user input into the SQL text.',
    },
    {
      question: 'What is the main reason to wrap SqlConnection in await using?',
      options: ['It makes queries run faster', 'It encrypts the connection', 'It guarantees the connection is closed and returned to the pool, even on exceptions', 'It retries failed queries'],
      answer: 2,
      explanation: 'Dispose closes the connection; forgetting it leaks pooled connections until the pool is exhausted.',
    },
  ],
};
