const EMP = `CREATE TABLE Employees (EmpId INT PRIMARY KEY, Name NVARCHAR(50), Dept NVARCHAR(20), Salary INT, ManagerId INT NULL);
INSERT INTO Employees VALUES
(1, 'Anil', 'Management', 150000, NULL),
(2, 'Bhavna', 'IT', 90000, 1),
(3, 'Chetan', 'Sales', 70000, 1),
(4, 'Divya', 'IT', 60000, 2),
(5, 'Imran', 'IT', 45000, 2),
(6, 'Farah', 'Sales', 52000, 3),
(7, 'Gopal', 'Sales', 38000, 3),
(8, 'Hema', 'IT', 30000, 4);`;

export default {
  lesson: 'extra-33-cte-and-recursive-cte',
  minutes: 30,
  intro: 'Write readable queries with CTEs and walk hierarchies (org charts) and number series with recursive CTEs.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'How long does a CTE (`WITH Name AS (...)`) exist?',
      options: ['Until the session ends, like a temp table', 'Only for the single statement that immediately follows it', 'Until the database is restarted', 'Until you DROP it'],
      answer: 1,
      explain: 'A CTE is a named subquery that lives only for the next SELECT/INSERT/UPDATE/DELETE. Use a temp table if you need the result in several statements.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 6,
      q: 'Using a CTE named `DeptAvg` that calculates the average salary per department, list `Name`, `Dept` and `Salary` of employees who earn **more than their department average**.',
      example: { title: 'CTE joined back to the table', code: `WITH CityTotal AS (
    SELECT City, SUM(Amount) AS Total FROM Orders GROUP BY City
)
SELECT o.* FROM Orders o JOIN CityTotal c ON o.City = c.City;` },
      setup: EMP,
      starter: 'WITH DeptAvg AS (\n    -- SELECT Dept, AVG(Salary) ...\n    SELECT Dept FROM Employees\n)\nSELECT Name, Dept, Salary FROM Employees WHERE 1 = 0;\n',
      solution: 'WITH DeptAvg AS (\n    SELECT Dept, AVG(Salary) AS AvgSalary FROM Employees GROUP BY Dept\n)\nSELECT e.Name, e.Dept, e.Salary\nFROM Employees e\nJOIN DeptAvg d ON e.Dept = d.Dept\nWHERE e.Salary > d.AvgSalary;',
      explain: 'IT average = 56250, so Bhavna (90000) and Divya (60000) qualify; Sales average ≈ 53333, so Chetan qualifies. Anil is alone in Management, so he equals the average and is not "more". The CTE keeps the aggregate separate and readable.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 7,
      q: 'Build the **org chart** with a recursive CTE named `OrgChart`. Return `Name` and `Level`, where the top boss (no manager) is level 1, his direct reports level 2, and so on.',
      example: { title: 'recursive CTE shape', code: `WITH Tree AS (
    SELECT Id, ParentId, 1 AS Depth FROM Categories WHERE ParentId IS NULL   -- anchor
    UNION ALL
    SELECT c.Id, c.ParentId, t.Depth + 1                                    -- recursive part
    FROM Categories c JOIN Tree t ON c.ParentId = t.Id
)
SELECT * FROM Tree;` },
      setup: EMP,
      starter: 'WITH OrgChart AS (\n    SELECT EmpId, Name, 1 AS Level FROM Employees WHERE ManagerId IS NULL\n    -- UNION ALL the employees whose manager is already in OrgChart\n)\nSELECT Name, Level FROM OrgChart;\n',
      solution: 'WITH OrgChart AS (\n    SELECT EmpId, Name, 1 AS Level FROM Employees WHERE ManagerId IS NULL\n    UNION ALL\n    SELECT e.EmpId, e.Name, o.Level + 1\n    FROM Employees e\n    JOIN OrgChart o ON e.ManagerId = o.EmpId\n)\nSELECT Name, Level FROM OrgChart;',
      explain: 'The **anchor** selects Anil (level 1). The **recursive member** joins employees to rows already in the CTE (`e.ManagerId = o.EmpId`) and adds 1 to the level. It repeats until no new rows appear: Bhavna/Chetan (2), Divya/Imran/Farah/Gopal (3), Hema (4).',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Use a recursive CTE named `Nums` to generate the numbers **1 to 6**. Return columns `n` and `Square` (n × n).',
      example: { title: 'number generator', code: `WITH Days AS (
    SELECT 0 AS d
    UNION ALL
    SELECT d + 1 FROM Days WHERE d < 30
)
SELECT d FROM Days;` },
      setup: '',
      starter: 'WITH Nums AS (\n    SELECT 1 AS n\n    -- UNION ALL ...\n)\nSELECT n FROM Nums;\n',
      solution: 'WITH Nums AS (\n    SELECT 1 AS n\n    UNION ALL\n    SELECT n + 1 FROM Nums WHERE n < 6\n)\nSELECT n, n * n AS Square FROM Nums;',
      explain: 'The anchor gives 1; each recursion adds 1 while `n < 6`. The `WHERE` in the recursive member is the stop condition; without it the query would run until SQL Server\'s default limit of 100 recursions and fail.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `A recursive calendar CTE needs 365 levels, but SQL Server stops at 100 by default. Complete the query hint placed after the final SELECT:
\`SELECT * FROM Calendar ______;\``,
      example: { title: 'query hint syntax', code: 'SELECT * FROM Tree OPTION (MAXRECURSION 0);  -- 0 = no limit (careful!)' },
      accept: ['OPTION (MAXRECURSION 365)', 'OPTION(MAXRECURSION 365)', 'OPTION (MAXRECURSION 366)', 'OPTION (MAXRECURSION 400)', 'OPTION (MAXRECURSION 1000)', 'OPTION (MAXRECURSION 0)'],
      acceptRegex: ['^OPTION\\s*\\(\\s*MAXRECURSION\\s+(0|3[6-9]\\d|[4-9]\\d\\d|\\d{4,5})\\s*\\)$'],
      explain: '`OPTION (MAXRECURSION n)` raises the limit for that statement (max 32767; 0 removes it). Without it the query fails with "The maximum recursion 100 has been exhausted". Use 0 only when you are sure the recursion ends.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about CTEs are TRUE? Select all that apply.',
      options: ['A recursive CTE has an anchor member and a recursive member joined with UNION ALL', 'One WITH can define several CTEs separated by commas', 'A CTE can be referenced only once in the following query', 'A missing stop condition makes a recursive CTE fail at the recursion limit', 'A CTE is stored on disk like a table'],
      answers: [0, 1, 3],
      explain: '`WITH A AS (...), B AS (...)` chains CTEs, and a CTE can be referenced several times in the next statement. It is not stored; it is expanded into the query like a view. Recursive CTEs need UNION ALL and a terminating condition.',
    },
  ],
};
