const STUDENTS = `CREATE TABLE Students (
    Id INT PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    City NVARCHAR(50) NOT NULL,
    Marks INT NOT NULL,
    Email NVARCHAR(100) NULL
);
INSERT INTO Students (Id, Name, City, Marks, Email) VALUES
(1, 'Asha Patil', 'Pune', 82, 'asha@college.in'),
(2, 'Ravi Kumar', 'Chennai', 67, NULL),
(3, 'Neha Sharma', 'Delhi', 91, 'neha@college.in'),
(4, 'Arjun Rao', 'Pune', 45, 'arjun@college.in'),
(5, 'Meera Nair', 'Pune', 38, NULL);`;

export default {
  lesson: 'day-01-ado-net-fundamentals',
  minutes: 25,
  intro: 'Practise the core ADO.NET objects: connection strings, the three Execute methods, SqlDataReader, NULL handling and parameters against SQL injection.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'A shop app needs the **new order Id** right after `INSERT INTO Orders (...) OUTPUT INSERTED.Id VALUES (...)`. Which method should it call?',
      options: ['`ExecuteNonQueryAsync()`', '`ExecuteScalarAsync()`', '`ExecuteReaderAsync()` and a DataSet', '`OpenAsync()`'],
      answer: 1,
      explain: '`OUTPUT INSERTED.Id` makes the INSERT return one row with one column, and `ExecuteScalar` returns exactly the first column of the first row. `ExecuteNonQuery` would only return the number of rows affected (1), not the Id.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The `Students` table has these rows: Asha (Pune, 82), Ravi (Chennai, 67), Neha (Delhi, 91), Arjun (Pune, 45), Meera (Pune, 38). `Exec` calls `ExecuteNonQueryAsync` and `Scalar` calls `ExecuteScalarAsync`. What does the program print?',
      example: { title: 'what each method returns', code: `ExecuteNonQuery  -> rows affected (INSERT/UPDATE/DELETE), -1 for other statements
ExecuteScalar    -> first column of the first row (object?)` },
      code: `int a = await Exec("UPDATE Students SET Marks = Marks + 10 WHERE Marks < 50");
int b = Convert.ToInt32(await Scalar("SELECT COUNT(*) FROM Students WHERE Marks >= 50"));
int c = await Exec("DELETE FROM Students WHERE City = 'Mumbai'");
int d = await Exec("CREATE TABLE AuditLog (Id INT)");

Console.WriteLine(a);
Console.WriteLine(b);
Console.WriteLine(c);
Console.WriteLine(d);`,
      expected: `2
4
0
-1`,
      explain: 'Arjun (45) and Meera (38) are below 50, so 2 rows are updated and they become 55 and 48. Now 82, 67, 91, 55 are >= 50, so COUNT is 4 (Meera at 48 is still below). Deleting a city that does not exist is not an error: 0 rows affected. For DDL like CREATE TABLE, ExecuteNonQuery returns -1. A common mistake is counting Meera, forgetting that 38 + 10 = 48.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Ravi has no email. Complete the line so a C# \`null\` is stored as SQL \`NULL\`:
\`cmd.Parameters.Add("@email", SqlDbType.NVarChar, 100).Value = (object?)email ?? ______;\``,
      example: { title: 'reading NULL back', code: 'string? email = reader.IsDBNull(4) ? null : reader.GetString(4);' },
      accept: ['DBNull.Value', 'System.DBNull.Value'],
      caseSensitive: true,
      explain: 'ADO.NET represents database NULL with `DBNull.Value`. If a parameter\'s Value is C# `null`, SqlClient treats the parameter as "not supplied" and SQL Server throws an error. The `(object?)` cast is needed so both sides of `??` have the same type.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which of these commands are **safe from SQL injection**? Select all that apply.',
      options: [
        '`new SqlCommand("SELECT * FROM Users WHERE Email = @e", conn)` with `Parameters.Add("@e", SqlDbType.NVarChar, 100).Value = email`',
        '`new SqlCommand($"SELECT * FROM Users WHERE Email = \'{email}\'", conn)`',
        '`new SqlCommand("SELECT * FROM Users WHERE Email = \'" + email.Replace(" ", "") + "\'", conn)`',
        '`new SqlCommand("SELECT * FROM Users WHERE Id = @id", conn)` with `Parameters.AddWithValue("@id", id)`',
      ],
      answers: [0, 3],
      explain: 'Both parameterized commands keep the SQL text fixed and send values separately, so input can never become SQL code (AddWithValue is safe, just less precise about types). String interpolation is concatenation in disguise, and removing spaces does not stop a quote character from breaking out of the string.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the loop that reads every row from a \`SqlDataReader\` asynchronously:
\`while (await reader.______())\``,
      example: { title: 'inside the loop', code: 'int id = reader.GetInt32(0);\nstring name = reader.GetString(1);' },
      accept: ['ReadAsync', 'ReadAsync(cancellationToken)', 'ReadAsync(ct)'],
      caseSensitive: true,
      explain: '`ReadAsync()` moves the reader to the next row and returns `false` when there are no more rows, which ends the loop. The reader starts BEFORE the first row, so calling `GetInt32` without `ReadAsync` first throws "Invalid attempt to read when no data is present".',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'After upgrading to Microsoft.Data.SqlClient 5, a developer\'s local app fails with **"The certificate chain was issued by an authority that is not trusted"**. What is the usual development fix?',
      options: [
        'Switch back to string concatenation',
        'Add `TrustServerCertificate=True` to the connection string',
        'Remove `await using` from the connection',
        'Use ExecuteScalar instead of ExecuteReader',
      ],
      answer: 1,
      explain: 'Microsoft.Data.SqlClient 4+ sets `Encrypt=True` by default, and a local SQL Server uses a self-signed certificate. `TrustServerCertificate=True` skips certificate validation (fine for development; production should use a real certificate).',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Write the SELECT that a `SqlCommand` will send for the **Pune report**: show `Name` and `Marks` of students from **Pune** with marks of **40 or more**, highest marks first. (In C# you would pass Pune and 40 as `@city` and `@minMarks` - here type the values directly.)',
      example: { title: 'a similar query', code: "SELECT Name, City FROM Students WHERE Marks < 70 ORDER BY Name;" },
      setup: STUDENTS,
      starter: '-- SELECT ...\n',
      solution: "SELECT Name, Marks FROM Students WHERE City = 'Pune' AND Marks >= 40 ORDER BY Marks DESC;",
      ordered: true,
      explain: 'Filter with `WHERE City = \'Pune\' AND Marks >= 40` and sort with `ORDER BY Marks DESC`, giving Asha (82) then Arjun (45). Meera (38) is filtered out. Let SQL Server do the filtering and sorting instead of reading all rows into C# - it is faster and sends less data over the network.',
    },
  ],
};
