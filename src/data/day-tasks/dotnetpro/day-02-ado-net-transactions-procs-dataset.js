const ACCOUNTS = `CREATE TABLE Accounts (
    Id INT PRIMARY KEY,
    Holder NVARCHAR(50) NOT NULL,
    Balance DECIMAL(10,2) NOT NULL CHECK (Balance >= 0)
);
INSERT INTO Accounts (Id, Holder, Balance) VALUES
(1, 'Asha', 5000),
(2, 'Ravi', 1200),
(3, 'Neha', 300);`;

export default {
  lesson: 'day-02-ado-net-transactions-procs-dataset',
  minutes: 25,
  intro: 'Practise transactions, stored procedure calls with output parameters, DataTable row states and connection pooling.',
  tasks: [
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Bank transfer: inside **one transaction**, move **1500** from Asha (Id 1) to Neha (Id 3) and then **COMMIT**. This is the same SQL your C# `SqlTransaction` code sends.',
      example: { title: 'a transaction', code: "BEGIN TRAN;\nUPDATE Stock SET Qty = Qty - 1 WHERE Id = 7;\nINSERT INTO Sales (ProductId) VALUES (7);\nCOMMIT;" },
      setup: ACCOUNTS,
      starter: '-- BEGIN TRAN;\n-- debit Asha\n-- credit Neha\n-- COMMIT;\n',
      solution: "BEGIN TRAN;\nUPDATE Accounts SET Balance = Balance - 1500 WHERE Id = 1;\nUPDATE Accounts SET Balance = Balance + 1500 WHERE Id = 3;\nCOMMIT;",
      check: 'SELECT Id, Holder, Balance FROM Accounts ORDER BY Id;',
      explain: 'Both UPDATEs must succeed together: Asha 5000 -> 3500 and Neha 300 -> 1800. If the credit failed after the debit, money would vanish, which is exactly what a transaction prevents. In C# each SqlCommand must receive the same `SqlTransaction` object.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the line so ADO.NET treats \`"dbo.usp_GetStudentCount"\` as a procedure name instead of SQL text:
\`cmd.CommandType = ______;\``,
      example: { title: 'creating the command', code: 'var cmd = new SqlCommand("dbo.usp_GetStudentCount", conn);' },
      accept: ['CommandType.StoredProcedure', 'System.Data.CommandType.StoredProcedure'],
      caseSensitive: true,
      explain: 'The default is `CommandType.Text`, which would send "dbo.usp_GetStudentCount" as a SQL batch; with parameters added, SQL Server then complains that the procedure expects parameters which were not supplied. `StoredProcedure` makes SqlClient send an RPC call with the parameters bound by name.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `The procedure has \`@Total INT OUTPUT\`. Complete the C# so the value can be read after execution:
\`var total = cmd.Parameters.Add("@Total", SqlDbType.Int);
total.Direction = ParameterDirection.______;\``,
      example: { title: 'reading a return code', code: 'var ret = cmd.Parameters.Add("@ret", SqlDbType.Int);\nret.Direction = ParameterDirection.ReturnValue;' },
      accept: ['Output', 'InputOutput'],
      caseSensitive: true,
      explain: '`ParameterDirection.Output` (or `InputOutput` if you also send a value in) tells SqlClient to fetch the value back. Read `total.Value` only AFTER `ExecuteNonQuery` - and if you used a reader, after the reader is closed. `ReturnValue` is only for the integer from `RETURN`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this DataTable code print?',
      example: { title: 'row states', code: `Unchanged -> after AcceptChanges / Fill
Added     -> Rows.Add after that
Modified  -> a value was changed
Deleted   -> row.Delete() on an existing row
Detached  -> NewRow() not yet added` },
      code: `var t = new DataTable();
t.Columns.Add("Id", typeof(int));
t.Columns.Add("Item", typeof(string));
t.Columns.Add("Qty", typeof(int));
t.Rows.Add(1, "Pen", 10);
t.Rows.Add(2, "Book", 4);
t.Rows.Add(3, "Bag", 1);
t.AcceptChanges();

t.Rows[0]["Qty"] = 12;
t.Rows.Add(4, "Ruler", 7);
t.Rows[2].Delete();
DataRow extra = t.NewRow();

Console.WriteLine(t.Rows[0].RowState);
Console.WriteLine(t.Rows[2].RowState);
Console.WriteLine(extra.RowState);
Console.WriteLine(t.Rows.Count);
Console.WriteLine(t.GetChanges()!.Rows.Count);
t.AcceptChanges();
Console.WriteLine(t.Rows.Count);`,
      expected: `Modified
Deleted
Detached
4
3
3`,
      explain: 'Pen was edited (Modified). Delete() on the already-saved Bag row only MARKS it Deleted, so it stays in Rows and the count is 4. NewRow() creates a Detached row that is not in the table. GetChanges returns Pen, Bag and Ruler = 3. AcceptChanges finally removes the deleted row, leaving 3. Many students expect Delete() to remove the row immediately.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A procedure returns rows with SELECT **and** sets an OUTPUT parameter. When can C# read the output value?',
      options: [
        'Immediately after calling ExecuteReaderAsync()',
        'After the first ReadAsync()',
        'After all rows are read and the reader is closed',
        'Output parameters cannot be used with readers',
      ],
      answer: 2,
      explain: 'SQL Server sends output parameter values at the END of the response stream, after all result rows. Until the reader is closed (or fully consumed), `param.Value` is still null.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements about **connection pooling** in Microsoft.Data.SqlClient are true? Select all that apply.',
      options: [
        'Pooling is enabled by default',
        'Calling Dispose() on a SqlConnection returns the physical connection to the pool',
        'All connection strings in the process share one pool',
        'The default Max Pool Size is 100',
        'Keeping one static open connection for the whole app is the recommended way to use the pool',
      ],
      answers: [0, 1, 3],
      explain: 'Pools are created per distinct connection string (and per identity for Windows auth), not one for everything. Pooling is on by default with Max Pool Size 100, and Dispose/Close returns the connection to the pool. A shared static connection is not thread-safe - create a connection per unit of work.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'An API works for an hour, then every request fails with **"Timeout expired... prior to obtaining a connection from the pool"**. What is the most likely cause?',
      options: [
        'SQL injection',
        'Connections or readers are not disposed, so the pool runs out',
        'The DataSet is too small',
        'A missing ORDER BY clause',
      ],
      answer: 1,
      explain: 'This is the classic connection leak. Every leaked connection stays checked out; once 100 are leaked, new Open() calls wait and time out. Use `using`/`await using` for every connection and reader, including error paths. Raising Max Pool Size only delays the crash.',
    },
  ],
};
