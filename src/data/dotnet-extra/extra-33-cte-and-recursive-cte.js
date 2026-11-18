const steps = (db) => [
  'Open SSMS and connect to your SQL Server instance (or open the in-app SSMS Lab)',
  'Click New Query (Ctrl+N) on the toolbar',
  'Paste the complete script below',
  `Press F5 (Execute). The script creates the ${db} database; read the Results tab`,
];

const q1 = `CREATE DATABASE CompanyCteDB;
GO
USE CompanyCteDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Department NVARCHAR(30) NOT NULL,
    Salary INT NOT NULL
);
GO
INSERT INTO Employees (Name, Department, Salary) VALUES
('Asha', 'IT', 85000), ('Ravi', 'IT', 62000), ('Meera', 'HR', 48000),
('Kiran', 'HR', 52000), ('John', 'Sales', 40000), ('Sara', 'Sales', 71000);
GO
-- Simple CTE: department averages, then join back to employees
WITH DeptAvg AS (
    SELECT Department, AVG(Salary) AS AvgSalary
    FROM Employees
    GROUP BY Department
)
SELECT e.Name, e.Department, e.Salary, d.AvgSalary
FROM Employees e
JOIN DeptAvg d ON d.Department = e.Department
WHERE e.Salary > d.AvgSalary
ORDER BY e.Department;
-- Two CTEs in one statement (comma separated)
WITH HighPaid AS (
    SELECT * FROM Employees WHERE Salary >= 60000
),
DeptCount AS (
    SELECT Department, COUNT(*) AS HighPaidCount
    FROM HighPaid
    GROUP BY Department
)
SELECT Department, HighPaidCount
FROM DeptCount
ORDER BY HighPaidCount DESC, Department;`;
const q2 = `CREATE DATABASE OrgChartDB;
GO
USE OrgChartDB;
GO
CREATE TABLE Staff (
    EmpId INT PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Title NVARCHAR(50) NOT NULL,
    ManagerId INT NULL
);
GO
INSERT INTO Staff (EmpId, Name, Title, ManagerId) VALUES
(1, 'Anil', 'CEO', NULL),
(2, 'Bina', 'CTO', 1),
(3, 'Chetan', 'CFO', 1),
(4, 'Divya', 'Dev Lead', 2),
(5, 'Esha', 'Developer', 4),
(6, 'Farhan', 'Developer', 4),
(7, 'Gita', 'Accountant', 3);
GO
-- Recursive CTE: anchor = CEO, recursive part = direct reports of the previous level
WITH OrgChart AS (
    SELECT EmpId, Name, Title, ManagerId, 0 AS Level,
           CAST(Name AS VARCHAR(200)) AS Path
    FROM Staff
    WHERE ManagerId IS NULL
    UNION ALL
    SELECT s.EmpId, s.Name, s.Title, s.ManagerId, o.Level + 1,
           CAST(o.Path + ' > ' + s.Name AS VARCHAR(200))
    FROM Staff s
    JOIN OrgChart o ON s.ManagerId = o.EmpId
)
SELECT EmpId, Name, Title, Level, Path
FROM OrgChart
ORDER BY Path;
-- Everyone who reports (directly or indirectly) to Bina (EmpId 2)
WITH Team AS (
    SELECT EmpId, Name FROM Staff WHERE ManagerId = 2
    UNION ALL
    SELECT s.EmpId, s.Name FROM Staff s JOIN Team t ON s.ManagerId = t.EmpId
)
SELECT EmpId, Name FROM Team ORDER BY EmpId;`;
const q3 = `CREATE DATABASE CalendarCteDB;
GO
USE CalendarCteDB;
GO
CREATE TABLE Sales (
    SaleId INT IDENTITY(1,1) PRIMARY KEY,
    SaleDate DATE NOT NULL,
    Amount INT NOT NULL
);
GO
INSERT INTO Sales (SaleDate, Amount) VALUES
('2026-11-01', 1200), ('2026-11-01', 300), ('2026-11-03', 900),
('2026-11-04', 450), ('2026-11-06', 1500);
GO
-- Recursive CTE as a number generator: 1 to 10
WITH Numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM Numbers WHERE n < 10
)
SELECT n, n * n AS Square FROM Numbers WHERE n % 2 = 0;
-- Generate every date of the week, then LEFT JOIN sales so missing days show 0
WITH Dates AS (
    SELECT CAST('2026-11-01' AS DATE) AS TheDate
    UNION ALL
    SELECT DATEADD(DAY, 1, TheDate) FROM Dates WHERE TheDate < '2026-11-07'
)
SELECT d.TheDate, ISNULL(SUM(s.Amount), 0) AS DayTotal
FROM Dates d
LEFT JOIN Sales s ON s.SaleDate = d.TheDate
GROUP BY d.TheDate
ORDER BY d.TheDate;`;

export default {
  id: 'extra-33-cte-and-recursive-cte',
  title: 'CTE and Recursive CTE',
  module: 'Extra: SQL Server',
  extraNo: 33,
  level: 'Intermediate to Advanced',
  duration: '2 hours',
  summary: `A Common Table Expression (CTE) is a named, temporary result set defined with WITH and used by the very next statement. CTEs break complex queries into readable steps, can be chained, and can call themselves (recursive CTE) to walk hierarchies such as organization charts, category trees and bill of materials, or to generate number and date sequences.`,
  objectives: [
    'Write a CTE with WITH ... AS (...) and use it in SELECT, UPDATE or DELETE',
    'Chain multiple CTEs in one statement',
    'Build a recursive CTE with an anchor member, UNION ALL and a recursive member',
    'Walk employee/manager hierarchies and generate number/date series',
    'Control recursion with MAXRECURSION and know CTE vs subquery vs temp table',
  ],
  theory: [
    {
      heading: 'What is a CTE?',
      content: `A **CTE** (Common Table Expression) gives a name to a query so the next statement can use it like a table.

- Defined with **WITH Name AS ( query )**
- Exists only for **one statement** - the SELECT/INSERT/UPDATE/DELETE immediately after it
- Not stored anywhere (it is like an inline view)
- Makes long queries readable: step 1, step 2, final result

Analogy: a rough-work box on an exam paper. You compute something there, give it a label, and use it in your final answer. After the question, the box is ignored.`,
      syntax: `WITH DeptAvg AS (
    SELECT Department, AVG(Salary) AS AvgSalary
    FROM Employees
    GROUP BY Department
)
SELECT e.Name, e.Salary, d.AvgSalary
FROM Employees e
JOIN DeptAvg d ON d.Department = e.Department;`,
      points: [
        'If the statement before WITH is not terminated, end it with ; (that is why you often see ;WITH)',
        'ORDER BY is not allowed inside a CTE (unless with TOP/OFFSET)',
        'A CTE can be referenced several times in the same statement (self-join of the CTE)',
      ],
    },
    {
      heading: 'Multiple CTEs and CTEs with UPDATE/DELETE',
      content: `Separate several CTEs with **commas** - later CTEs can use earlier ones. Only one WITH keyword is written.

A CTE can also be the target of UPDATE or DELETE (when it is based on one table). A classic use: delete duplicate rows keeping the first one using ROW_NUMBER().`,
      syntax: `WITH HighPaid AS (SELECT * FROM Employees WHERE Salary >= 60000),
     DeptCount AS (SELECT Department, COUNT(*) AS Cnt FROM HighPaid GROUP BY Department)
SELECT * FROM DeptCount;

-- remove duplicate emails, keep the lowest Id
WITH d AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY Email ORDER BY Id) AS rn
    FROM Customers
)
DELETE FROM d WHERE rn > 1;`,
    },
    {
      heading: 'Recursive CTE',
      content: `A **recursive CTE** refers to itself. It has two parts joined by **UNION ALL**:
1. **Anchor member** - the starting rows (e.g. the CEO: ManagerId IS NULL).
2. **Recursive member** - joins the table to the CTE itself to get the next level (employees whose manager is in the previous level).

SQL Server runs the anchor once, then repeats the recursive member using the rows produced in the previous step, until it returns no rows.

Uses: organization charts, category/sub-category trees, folder structures, bill of materials, routes, and generating sequences (numbers 1..N, every date in a month).`,
      syntax: `WITH OrgChart AS (
    SELECT EmpId, Name, ManagerId, 0 AS Level          -- anchor
    FROM Staff WHERE ManagerId IS NULL
    UNION ALL
    SELECT s.EmpId, s.Name, s.ManagerId, o.Level + 1   -- recursive
    FROM Staff s
    JOIN OrgChart o ON s.ManagerId = o.EmpId
)
SELECT * FROM OrgChart;`,
    },
    {
      heading: 'MAXRECURSION and avoiding infinite loops',
      content: `By default SQL Server stops a recursive CTE after **100** levels with error 530 ("The maximum recursion 100 has been exhausted"). This protects you from infinite loops (e.g. bad data where A manages B and B manages A).

- Add **OPTION (MAXRECURSION n)** after the outer statement to change the limit (0 = unlimited - use with care).
- Always have a stopping condition (WHERE n < 365, or the join naturally ends at leaf rows).
- Data types of the anchor and recursive columns must match exactly - that is why examples CAST the Path column to VARCHAR(200) in both parts.`,
      syntax: `WITH Numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM Numbers WHERE n < 1000
)
SELECT n FROM Numbers
OPTION (MAXRECURSION 1000);`,
    },
    {
      heading: 'CTE vs subquery vs view vs temp table',
      content: `| | Scope | Stored? | Indexed? | Best for |
|---|---|---|---|---|
| Derived table (subquery in FROM) | one query | no | no | small one-off steps |
| CTE | one statement | no | no | readability, recursion, reuse within one statement |
| View | permanent object | definition only | (indexed views possible) | reusable logic, security |
| Temp table #t | session | yes, in tempdb | yes | large intermediate results reused by many statements |

A CTE is **not** materialized: if you reference it twice, SQL Server may run its query twice. For heavy intermediate results that you use many times, a temp table is often faster.`,
    },
  ],
  examples: [
    {
      title: 'Simple and chained CTEs: employees above department average',
      scenario: 'HR wants employees who earn more than their department average, and the number of high-paid employees per department.',
      steps: steps('CompanyCteDB'),
      code: q1,
      tsql: q1,
      result: `+-------+------------+--------+-----------+
| Name  | Department | Salary | AvgSalary |
+-------+------------+--------+-----------+
| Kiran | HR         | 52000  | 50000.0   |
| Asha  | IT         | 85000  | 73500.0   |
| Sara  | Sales      | 71000  | 55500.0   |
+-------+------------+--------+-----------+
3 row(s) returned

+------------+---------------+
| Department | HighPaidCount |
+------------+---------------+
| IT         | 2             |
| Sales      | 1             |
+------------+---------------+
2 row(s) returned`,
      explanation: `DeptAvg calculates one average per department (HR 50000, IT 73500, Sales 55500) and is then joined back to Employees. In the second query HighPaid filters salaries >= 60000 (Asha, Ravi, Sara) and DeptCount groups that CTE. Lab difference: AVG of an INT column prints 50000.0 here; real SQL Server returns an integer (50000) because AVG keeps the INT type.`,
    },
    {
      title: 'Recursive CTE: organization chart with levels and paths',
      scenario: 'Display the full company hierarchy starting at the CEO with each person\'s level and reporting path, and list everyone under the CTO.',
      steps: steps('OrgChartDB'),
      code: q2,
      tsql: q2,
      result: `+-------+--------+------------+-------+------------------------------+
| EmpId | Name   | Title      | Level | Path                         |
+-------+--------+------------+-------+------------------------------+
| 1     | Anil   | CEO        | 0     | Anil                         |
| 2     | Bina   | CTO        | 1     | Anil > Bina                  |
| 4     | Divya  | Dev Lead   | 2     | Anil > Bina > Divya          |
| 5     | Esha   | Developer  | 3     | Anil > Bina > Divya > Esha   |
| 6     | Farhan | Developer  | 3     | Anil > Bina > Divya > Farhan |
| 3     | Chetan | CFO        | 1     | Anil > Chetan                |
| 7     | Gita   | Accountant | 2     | Anil > Chetan > Gita         |
+-------+--------+------------+-------+------------------------------+
7 row(s) returned

+-------+--------+
| EmpId | Name   |
+-------+--------+
| 4     | Divya  |
| 5     | Esha   |
| 6     | Farhan |
+-------+--------+
3 row(s) returned`,
      explanation: `The anchor returns Anil (no manager, level 0). Each recursive step finds people whose ManagerId matches a row from the previous step: Bina and Chetan (level 1), then Divya and Gita (level 2), then Esha and Farhan (level 3). Path is built by concatenating names, and sorting by Path displays the tree in order. The second CTE starts from Bina's direct reports and keeps going down, so it returns Divya plus Divya's team.`,
    },
    {
      title: 'Recursive CTE as a number and calendar generator',
      scenario: 'Generate numbers 1-10 and a full week of dates so days with no sales still appear in the report with 0.',
      steps: steps('CalendarCteDB'),
      code: q3,
      tsql: q3,
      result: `+----+--------+
| n  | Square |
+----+--------+
| 2  | 4      |
| 4  | 16     |
| 6  | 36     |
| 8  | 64     |
| 10 | 100    |
+----+--------+
5 row(s) returned

+------------+----------+
| TheDate    | DayTotal |
+------------+----------+
| 2026-11-01 | 1500     |
| 2026-11-02 | 0        |
| 2026-11-03 | 900      |
| 2026-11-04 | 450      |
| 2026-11-05 | 0        |
| 2026-11-06 | 1500     |
| 2026-11-07 | 0        |
+------------+----------+
7 row(s) returned`,
      explanation: `The Numbers CTE starts at 1 and adds 1 until 10; the outer query keeps even values. The Dates CTE starts at 1 Nov and adds one day with DATEADD until 7 Nov. LEFT JOIN keeps every generated date, and ISNULL(SUM(...), 0) turns days without sales (2, 5 and 7 Nov) into 0 - something a plain GROUP BY on Sales could never show. For more than 100 days add OPTION (MAXRECURSION 400).`,
    },
  ],
  interview: [
    { q: 'What is a CTE?', a: 'A Common Table Expression: a named temporary result set defined with WITH that exists only for the duration of the next single statement.', level: 'Easy' },
    { q: 'Can a CTE be used in multiple statements?', a: 'No. It is scoped to the one statement immediately following it. Use a temp table or view to reuse results across statements.', level: 'Easy' },
    { q: 'What are the parts of a recursive CTE?', a: 'An anchor member (starting rows), UNION ALL, and a recursive member that references the CTE itself. Recursion stops when the recursive member returns no rows.', level: 'Medium' },
    { q: 'What is the default recursion limit and how do you change it?', a: '100 levels. Use OPTION (MAXRECURSION n) on the outer query; 0 means no limit.', level: 'Medium' },
    { q: 'Why do we often see ;WITH?', a: 'WITH has other meanings in T-SQL, so the previous statement must be terminated with a semicolon. Writing ;WITH is a defensive habit.', level: 'Easy' },
    { q: 'Is a CTE faster than a subquery?', a: 'Usually the same - SQL Server expands a CTE inline like a derived table. It improves readability, not performance. Referencing a CTE twice may execute it twice.', level: 'Medium' },
    { q: 'How do you delete duplicate rows using a CTE?', a: 'WITH d AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY dupColumns ORDER BY Id) rn FROM T) DELETE FROM d WHERE rn > 1;', level: 'Medium' },
    { q: 'Why must data types match in a recursive CTE?', a: 'The anchor and recursive members are combined with UNION ALL; SQL Server requires the column types (including string length) to be identical, otherwise error 240 is raised. CAST both sides to the same type.', level: 'Hard' },
    { q: 'CTE vs temp table?', a: 'A CTE is a non-materialized, single-statement expression. A temp table is physically stored in tempdb, lasts for the session, can be indexed and reused by many statements.', level: 'Medium' },
    { q: 'Give real uses of recursive CTEs.', a: 'Employee-manager hierarchies, category trees, menu trees, bill of materials, folder paths, generating number/date ranges, finding all ancestors or descendants of a node.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Using Employees from Example 1, write a CTE that finds the highest salary in each department and lists the employee(s) earning it.',
      hint: 'CTE with MAX(Salary) GROUP BY Department, then join on Department and Salary.',
      solution: `WITH DeptMax AS (
    SELECT Department, MAX(Salary) AS MaxSalary
    FROM Employees GROUP BY Department
)
SELECT e.Department, e.Name, e.Salary
FROM Employees e
JOIN DeptMax d ON d.Department = e.Department AND d.MaxSalary = e.Salary
ORDER BY e.Department;`,
    },
    {
      task: 'Create a Categories(CategoryId, Name, ParentId) table with Electronics > Mobiles > Android and Electronics > Laptops. Show every category with its full path like "Electronics > Mobiles > Android".',
      hint: 'Anchor = ParentId IS NULL; Path = CAST(Name AS VARCHAR(200)); recursive part joins on c.ParentId = t.CategoryId.',
      solution: `CREATE TABLE Categories (CategoryId INT PRIMARY KEY, Name NVARCHAR(50), ParentId INT NULL);
INSERT INTO Categories VALUES (1, 'Electronics', NULL), (2, 'Mobiles', 1), (3, 'Android', 2), (4, 'Laptops', 1);

WITH Tree AS (
    SELECT CategoryId, Name, CAST(Name AS VARCHAR(200)) AS Path
    FROM Categories WHERE ParentId IS NULL
    UNION ALL
    SELECT c.CategoryId, c.Name, CAST(t.Path + ' > ' + c.Name AS VARCHAR(200))
    FROM Categories c JOIN Tree t ON c.ParentId = t.CategoryId
)
SELECT Path FROM Tree ORDER BY Path;`,
    },
    {
      task: 'Generate all dates of February 2028 using a recursive CTE and mark weekends.',
      hint: 'Start at 2028-02-01, add 1 day while the next date is < 2028-03-01. Use DATENAME(WEEKDAY, d) in SSMS.',
      solution: `WITH Days AS (
    SELECT CAST('2028-02-01' AS DATE) AS d
    UNION ALL
    SELECT DATEADD(DAY, 1, d) FROM Days WHERE DATEADD(DAY, 1, d) < '2028-03-01'
)
SELECT d, DATENAME(WEEKDAY, d) AS DayName,
       CASE WHEN DATENAME(WEEKDAY, d) IN ('Saturday', 'Sunday') THEN 'Weekend' ELSE '' END AS Note
FROM Days;   -- 29 rows (2028 is a leap year)`,
    },
    {
      task: 'Using the Staff table from Example 2, count how many people (direct and indirect) report to each manager.',
      hint: 'Recursive CTE that carries the TopManagerId from the anchor (every employee as a potential manager) down the tree, then GROUP BY.',
      solution: `WITH Chain AS (
    SELECT EmpId AS TopManagerId, EmpId FROM Staff
    UNION ALL
    SELECT c.TopManagerId, s.EmpId
    FROM Staff s JOIN Chain c ON s.ManagerId = c.EmpId
)
SELECT m.Name, COUNT(*) - 1 AS TotalReports
FROM Chain c JOIN Staff m ON m.EmpId = c.TopManagerId
GROUP BY m.Name
ORDER BY TotalReports DESC;   -- Anil 6, Bina 3, Divya 2, Chetan 1, ...`,
    },
  ],
  quiz: [
    {
      question: 'How long does a CTE exist?',
      options: ['Until the session ends', 'Until the database restarts', 'Only for the statement immediately after it', 'Until DROP CTE is executed'],
      answer: 2,
      explanation: 'A CTE is scoped to a single statement.',
    },
    {
      question: 'Which operator joins the anchor and recursive members of a recursive CTE?',
      options: ['UNION ALL', 'JOIN', 'INTERSECT', 'EXCEPT'],
      answer: 0,
      explanation: 'Recursive CTEs require UNION ALL between the anchor and recursive parts.',
    },
    {
      question: 'What is the default MAXRECURSION limit?',
      options: ['10', '32767', 'Unlimited', '100'],
      answer: 3,
      explanation: 'The default is 100; change it with OPTION (MAXRECURSION n).',
    },
    {
      question: 'How are two CTEs written in one statement?',
      options: ['WITH A AS (...) WITH B AS (...)', 'WITH A AS (...), B AS (...)', 'WITH A, B AS (...)', 'It is not possible'],
      answer: 1,
      explanation: 'One WITH keyword, CTEs separated by commas.',
    },
    {
      question: 'In an org-chart recursive CTE, what is the anchor usually?',
      options: ['Employees with ManagerId IS NULL (the top person)', 'All employees', 'Employees with no reports', 'The last inserted row'],
      answer: 0,
      explanation: 'The anchor selects the starting level of the hierarchy, normally the root with no manager.',
    },
  ],
};
