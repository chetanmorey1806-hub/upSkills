const HR = `CREATE TABLE Employees (
    EmpId INT PRIMARY KEY,
    Name NVARCHAR(30),
    Dept NVARCHAR(20),
    Salary INT,
    IsActive BIT
);
INSERT INTO Employees VALUES
(1, 'Asha', 'IT', 70000, 1), (2, 'Ravi', 'HR', 42000, 1),
(3, 'Meena', 'IT', 58000, 0), (4, 'Kiran', 'Sales', 39000, 1),
(5, 'Sneha', 'IT', 61000, 1);`;

export default {
  lesson: 'day-049-views-stored-procedures-parameters-functions',
  minutes: 22,
  intro: 'Practise views (saved queries), stored procedures with input/output parameters, and scalar user-defined functions.',
  tasks: [
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Create a **view** named `vw_ActiveEmployees` that returns `EmpId`, `Name` and `Dept` of employees where `IsActive = 1`. Then select everything from the view.',
      example: { title: 'create and use a view', code: "CREATE VIEW vw_PuneCustomers AS\nSELECT CustId, Name FROM Customers WHERE City = 'Pune';\nGO\nSELECT * FROM vw_PuneCustomers;" },
      setup: HR,
      starter: '-- CREATE VIEW vw_ActiveEmployees AS ...\n-- GO\n-- SELECT * FROM vw_ActiveEmployees;\n',
      solution: 'CREATE VIEW vw_ActiveEmployees AS\nSELECT EmpId, Name, Dept FROM Employees WHERE IsActive = 1;\nGO\nSELECT * FROM vw_ActiveEmployees;',
      explain: 'A view is a **stored SELECT**: it holds no data of its own and always shows the current rows of the base table. In SSMS `CREATE VIEW` must be the only statement in its batch, hence the `GO` before the next query.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 4,
      q: 'Create a view `vw_DeptPayroll` that shows each `Dept` with `Staff` (count of employees) and `Payroll` (sum of salary). Then query the view for departments whose Payroll is above 100000.',
      example: { title: 'a view with GROUP BY, filtered later', code: 'CREATE VIEW vw_CitySales AS\nSELECT City, SUM(Amount) AS Total FROM Orders GROUP BY City;\nGO\nSELECT * FROM vw_CitySales WHERE Total > 5000;' },
      setup: HR,
      starter: '-- CREATE VIEW vw_DeptPayroll AS ...\n',
      solution: 'CREATE VIEW vw_DeptPayroll AS\nSELECT Dept, COUNT(*) AS Staff, SUM(Salary) AS Payroll FROM Employees GROUP BY Dept;\nGO\nSELECT * FROM vw_DeptPayroll WHERE Payroll > 100000;',
      explain: 'Views hide complex logic behind a simple name; users can filter a view like a table. Aggregated columns in a view **must** have aliases. Only IT (70000 + 58000 + 61000 = 189000) passes the filter.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'A stored procedure is defined as:\n```\nCREATE PROCEDURE usp_GetByDept\n    @Dept NVARCHAR(20)\nAS\nBEGIN\n    SELECT Name, Salary FROM Employees WHERE Dept = @Dept;\nEND\n```\nWrite the statement that **runs** it for the IT department.',
      example: { title: 'running a procedure', code: "EXEC usp_GetCustomersByCity @City = 'Pune';" },
      accept: ["EXEC usp_GetByDept @Dept = 'IT';", "EXEC usp_GetByDept 'IT';", "EXECUTE usp_GetByDept @Dept = 'IT';", "EXECUTE usp_GetByDept 'IT';"],
      acceptRegex: ["^EXEC(UTE)?\\s+(dbo\\.)?usp_GetByDept\\s+(@Dept\\s*=\\s*)?N?'IT'\\s*;?$"],
      explain: 'Procedures run with `EXEC` (or `EXECUTE`). Parameters can be passed by position (`\'IT\'`) or by name (`@Dept = \'IT\'`), which is clearer when there are several.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A procedure with an **OUTPUT** parameter. Using the Employees data shown in the setup of task 1 (IT salaries: 70000, 58000, 61000), what does this script print in the Messages tab?',
      example: { title: 'OUTPUT parameter', code: 'CREATE PROCEDURE usp_Count @Total INT OUTPUT AS\n    SELECT @Total = COUNT(*) FROM Students;\nGO\nDECLARE @n INT;\nEXEC usp_Count @Total = @n OUTPUT;\nPRINT @n;' },
      code: `CREATE PROCEDURE usp_DeptStats
    @Dept NVARCHAR(20),
    @Staff INT OUTPUT,
    @MaxSalary INT OUTPUT
AS
BEGIN
    SELECT @Staff = COUNT(*), @MaxSalary = MAX(Salary)
    FROM Employees
    WHERE Dept = @Dept;
END
GO

DECLARE @s INT, @m INT;
EXEC usp_DeptStats @Dept = 'IT', @Staff = @s OUTPUT, @MaxSalary = @m OUTPUT;
PRINT 'Staff: ' + CAST(@s AS VARCHAR(10));
PRINT 'Top salary: ' + CAST(@m AS VARCHAR(10));`,
      expected: `Staff: 3
Top salary: 70000`,
      explain: 'OUTPUT parameters send values **back** to the caller; the keyword is needed in both the definition and the EXEC. IT has 3 employees and the highest salary is 70000. `CAST` is needed because `\'text\' + INT` would try to convert the text to a number and fail.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A scalar **user-defined function**: what does the final SELECT return? (one value)',
      example: { title: 'scalar function', code: 'CREATE FUNCTION dbo.fn_AddGst(@amt DECIMAL(10,2)) RETURNS DECIMAL(10,2)\nAS BEGIN RETURN @amt * 1.18; END;\nGO\nSELECT dbo.fn_AddGst(100);   -- 118.00' },
      code: `CREATE FUNCTION dbo.fn_Bonus(@Salary INT, @Dept NVARCHAR(20))
RETURNS INT
AS
BEGIN
    DECLARE @pct INT = CASE WHEN @Dept = 'IT' THEN 10 ELSE 5 END;
    RETURN @Salary * @pct / 100;
END;
GO

SELECT dbo.fn_Bonus(61000, 'IT') + dbo.fn_Bonus(42000, 'HR') AS TotalBonus;`,
      expected: '8200',
      explain: 'IT gets 10%: 61000 × 10 / 100 = 6100; HR gets 5%: 42000 × 5 / 100 = 2100; total 8200. Scalar functions must be called with their schema name (`dbo.`) and **return** a single value; they can be used inside SELECT, unlike procedures.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Stored procedure vs function: which statements are TRUE? (choose all that apply)',
      options: [
        'A function can be used inside a SELECT statement; a procedure cannot',
        'A procedure can run INSERT/UPDATE/DELETE on tables; a function cannot modify table data',
        'A procedure is executed with EXEC',
        'A scalar function can return several result sets',
        'Procedures help security and reuse: apps get EXEC permission instead of direct table access',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Functions return a value (scalar) or a table (table-valued) and must not change data. Procedures can do almost anything, return multiple result sets and OUTPUT parameters, and are run with EXEC.',
    },
  ],
};
