const EMP = `CREATE TABLE Employees (EmpId INT PRIMARY KEY, Name NVARCHAR(50), Dept NVARCHAR(20), Salary INT);
INSERT INTO Employees VALUES (1, 'Asha', 'IT', 90000), (2, 'Ravi', 'IT', 75000), (3, 'Kiran', 'IT', 60000), (4, 'Zoya', 'Sales', 65000), (5, 'Imran', 'Sales', 52000);`;

export default {
  lesson: 'extra-36-dynamic-sql-and-cursors',
  minutes: 30,
  intro: 'Build safe parameterised dynamic SQL with sp_executesql, understand cursor loops, and replace them with set-based UPDATEs.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Run a dynamic query **with a parameter** (safe from SQL injection). Complete the procedure name:
\`EXEC ______ N'SELECT * FROM Employees WHERE Dept = @d', N'@d NVARCHAR(20)', @d = @Dept;\``,
      example: { title: 'unsafe version (do not do this)', code: `EXEC('SELECT * FROM Employees WHERE Dept = ''' + @Dept + '''');` },
      accept: ['sp_executesql', 'sys.sp_executesql'],
      explain: '`sp_executesql` takes the SQL text, a parameter definition string and the parameter values. Values are passed as real parameters, never glued into the SQL text, so input like `\' OR 1=1 --` cannot change the query. It also lets SQL Server reuse the execution plan.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A report lets the user pick the **column to sort by**. Column names cannot be passed as parameters. How do you build the dynamic ORDER BY safely?',
      options: ['Concatenate the user text directly', 'Validate it against a whitelist of allowed columns and wrap it with `QUOTENAME(@col)`', 'Use `LIKE` on the column name', 'Store it in a table variable'],
      answer: 1,
      explain: 'Identifiers (table/column names) cannot be parameters, so check them against an allowed list (or `sys.columns`) and use `QUOTENAME` to bracket them: `[Salary]`. That prevents injection through the identifier.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'This cursor runs in SSMS on the `Employees` table below (IT: Kiran 60000, Ravi 75000, Asha 90000). What does the **Messages** tab show?',
      example: { title: 'cursor loop skeleton', code: `OPEN cur;
FETCH NEXT FROM cur INTO @x;
WHILE @@FETCH_STATUS = 0
BEGIN
    -- process @x
    FETCH NEXT FROM cur INTO @x;
END
CLOSE cur; DEALLOCATE cur;` },
      code: `DECLARE @Name NVARCHAR(50), @Salary INT;
DECLARE emp_cur CURSOR FOR
    SELECT Name, Salary FROM Employees WHERE Dept = 'IT' ORDER BY Salary;

OPEN emp_cur;
FETCH NEXT FROM emp_cur INTO @Name, @Salary;
WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT @Name + ': ' + CAST(@Salary * 110 / 100 AS VARCHAR(10));
    FETCH NEXT FROM emp_cur INTO @Name, @Salary;
END
CLOSE emp_cur;
DEALLOCATE emp_cur;`,
      expected: `Kiran: 66000
Ravi: 82500
Asha: 99000`,
      explain: 'The cursor reads the IT rows one at a time in ascending salary order: Kiran, Ravi, Asha. Each loop prints the name and the 10% raised salary (60000 → 66000, 75000 → 82500, 90000 → 99000). `@@FETCH_STATUS` becomes non-zero after the last row and ends the loop.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Instead of a cursor, write **one set-based UPDATE**: give IT employees earning **less than 80000** a 10% raise (`Salary * 110 / 100`). Other employees must not change.',
      example: { title: 'set-based update', code: `UPDATE Products
SET Price = Price * 105 / 100
WHERE Category = 'Stationery';` },
      setup: EMP,
      starter: '-- UPDATE Employees SET ... WHERE ...\n',
      solution: "UPDATE Employees\nSET Salary = Salary * 110 / 100\nWHERE Dept = 'IT' AND Salary < 80000;",
      check: 'SELECT EmpId, Name, Salary FROM Employees ORDER BY EmpId',
      explain: 'One UPDATE processes all matching rows together: Ravi → 82500 and Kiran → 66000. Asha (90000) and the Sales team stay unchanged. Set-based statements are far faster than cursors because SQL Server optimises the whole operation instead of row by row.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Different raises per department in **one** UPDATE using CASE: IT gets +10% (`Salary + Salary / 10`), Sales gets +5% (`Salary + Salary / 20`), any other department stays the same.',
      example: { title: 'CASE inside SET', code: `UPDATE Students
SET Grade = CASE WHEN Marks >= 75 THEN 'A' WHEN Marks >= 50 THEN 'B' ELSE 'C' END;` },
      setup: EMP,
      starter: "UPDATE Employees\nSET Salary = Salary\n-- use CASE on Dept\nWHERE 1 = 0;\n",
      solution: "UPDATE Employees\nSET Salary = CASE WHEN Dept = 'IT' THEN Salary + Salary / 10\n                  WHEN Dept = 'Sales' THEN Salary + Salary / 20\n                  ELSE Salary END;",
      check: 'SELECT EmpId, Name, Salary FROM Employees ORDER BY EmpId',
      explain: 'CASE picks the formula per row, so one statement replaces a cursor with IF/ELSE inside. Results: Asha 99000, Ravi 82500, Kiran 66000, Zoya 68250, Imran 54600. The `ELSE Salary` keeps other departments unchanged instead of setting them to NULL.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? Select all that apply.',
      options: ['`@@FETCH_STATUS = 0` means the last FETCH returned a row', 'Forgetting `FETCH NEXT` inside the WHILE loop causes an infinite loop', 'Cursors are usually faster than set-based statements', '`DEALLOCATE` releases the cursor definition after `CLOSE`', '`EXEC(@sql)` with user input concatenated is safe if the input is short'],
      answers: [0, 1, 3],
      explain: 'Status 0 = success; without a FETCH inside the loop the status never changes, so the loop never ends. CLOSE releases the result set and DEALLOCATE the cursor itself. Cursors are row-by-row and slow; concatenated input is never safe, regardless of length.',
    },
  ],
};
